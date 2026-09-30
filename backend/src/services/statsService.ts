import { pool } from "../config/db";
import { isScheduledOn } from "./userHabitsService";
import { todayInAppTimeZone } from "./habitCompletionsService";
import { daysBetween, eachDayIso, minIso } from "../utils/dateUtils";
import type { StatsDay, StatsResponse, StatsSummary } from "../types/statsTypes";

// Upper bound for a single request
export const MAX_STATS_RANGE_DAYS = 366;

// Stats are a paid feature: users below this tier level get a 403 instead of their data
export const STATS_MIN_TIER_LEVEL = 2;

export class StatsValidationError extends Error { }

export class StatsLockedError extends Error {
    constructor(public readonly requiredTierTitle: string | null) {
        super("Your plan doesn't include progress stats");
        this.name = "StatsLockedError";
    }
}

interface UserHabitRow {
    id: number;
    title: string;
    recurrence_rule: string | null;
    added_on: string; // "YYYY-MM-DD", the day it was added to the calendar
}

interface CompletionRow {
    user_habit_id: number;
    day: string;
}

interface TaskDayRow {
    day: string;
    total: number;
    done: number;
}

// Throws StatsLockedError when the user's tier is too low. Users without a tier count as level 1
async function assertStatsAccess(userId: number): Promise<void> {
    const result = await pool.query<{ user_level: number; required_title: string | null }>(
        `SELECT COALESCE(t.level_number, 1) AS user_level,
                (SELECT title FROM tiers WHERE level_number = $2 LIMIT 1) AS required_title
         FROM users u
         LEFT JOIN tiers t ON t.id = u.current_tier_id
         WHERE u.id = $1`,
        [userId, STATS_MIN_TIER_LEVEL]
    );

    const row = result.rows[0];
    if (!row || row.user_level < STATS_MIN_TIER_LEVEL) {
        throw new StatsLockedError(row?.required_title ?? null);
    }
}

// created_at is converted to Swedish time, so a habit added at 00:30 counts from that Swedish day
async function getUserHabits(userId: number): Promise<UserHabitRow[]> {
    const result = await pool.query<UserHabitRow>(
        `SELECT uh.id,
                h.habit_title AS title,
                uh.recurrence_rule,
                to_char(uh.created_at AT TIME ZONE 'Europe/Stockholm', 'YYYY-MM-DD') AS added_on
         FROM user_habits uh
         JOIN habits h ON h.id = uh.habit_id
         WHERE uh.user_id = $1`,
        [userId]
    );
    return result.rows;
}

async function getCompletions(userId: number, from: string, to: string): Promise<CompletionRow[]> {
    const result = await pool.query<CompletionRow>(
        `SELECT hc.user_habit_id,
                to_char(hc.completed_date, 'YYYY-MM-DD') AS day
         FROM habit_completions hc
         JOIN user_habits uh ON uh.id = hc.user_habit_id
         WHERE uh.user_id = $1
           AND hc.completed_date BETWEEN $2::date AND $3::date`,
        [userId, from, to]
    );
    return result.rows;
}

async function getTasksPerDay(userId: number, from: string, to: string): Promise<TaskDayRow[]> {
    const result = await pool.query<TaskDayRow>(
        `SELECT to_char(task_date, 'YYYY-MM-DD') AS day,
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE is_completed)::int AS done
         FROM tasks
         WHERE user_id = $1
           AND task_date::date BETWEEN $2::date AND $3::date
         GROUP BY 1`,
        [userId, from, to]
    );
    return result.rows;
}

// A "perfect day" has at least one scheduled habit and all of them done.
// Days without scheduled habits are skipped and neither extend nor break a streak.
function calculateStreaks(days: StatsDay[], today: string): { current: number; best: number } {
    let best = 0;
    let running = 0;

    for (const day of days) {
        if (day.habitsScheduled === 0) continue;

        if (day.habitsDone === day.habitsScheduled) {
            running++;
            best = Math.max(best, running);
        } else if (day.date !== today) {
            // Today isn't over yet, so unfinished habits today don't break the streak
            running = 0;
        }
    }

    return { current: running, best };
}

export async function getStats(userId: number, from: string, to: string): Promise<StatsResponse> {
    await assertStatsAccess(userId);

    if (from > to) {
        throw new StatsValidationError("'from' must be on or before 'to'");
    }
    if (daysBetween(from, to) > MAX_STATS_RANGE_DAYS) {
        throw new StatsValidationError(`Range may not exceed ${MAX_STATS_RANGE_DAYS} days`);
    }

    // Future days haven't happened yet, so they shouldn't count as missed
    const today = todayInAppTimeZone();
    const effectiveTo = minIso(to, today);

    if (from > effectiveTo) {
        throw new StatsValidationError("The range must include today or earlier");
    }

    const [userHabits, completions, taskDays] = await Promise.all([
        getUserHabits(userId),
        getCompletions(userId, from, effectiveTo),
        getTasksPerDay(userId, from, effectiveTo),
    ]);

    // Fast lookups: "userHabitId|YYYY-MM-DD" for completions, date for tasks
    const completed = new Set(completions.map((c) => `${c.user_habit_id}|${c.day}`));
    const tasksByDay = new Map(taskDays.map((t) => [t.day, t]));

    // Per-habit totals, used to find the most consistent habit
    const perHabit = new Map(userHabits.map((uh) => [uh.id, { title: uh.title, done: 0, scheduled: 0 }]));

    const days: StatsDay[] = eachDayIso(from, effectiveTo).map((date) => {
        let habitsScheduled = 0;
        let habitsDone = 0;

        for (const uh of userHabits) {
            // Don't count days before the habit was added to the calendar
            if (date < uh.added_on) continue;
            if (!isScheduledOn(uh.recurrence_rule, date)) continue;

            const isDone = completed.has(`${uh.id}|${date}`);
            habitsScheduled++;
            if (isDone) habitsDone++;

            const totals = perHabit.get(uh.id)!;
            totals.scheduled++;
            if (isDone) totals.done++;
        }

        const tasks = tasksByDay.get(date);

        return {
            date,
            habitsScheduled,
            habitsDone,
            tasksTotal: tasks?.total ?? 0,
            tasksDone: tasks?.done ?? 0,
        };
    });

    const totalScheduled = days.reduce((sum, d) => sum + d.habitsScheduled, 0);
    const totalDone = days.reduce((sum, d) => sum + d.habitsDone, 0);
    const { current, best } = calculateStreaks(days, today);

    // Highest completion rate; on a tie, the habit that was scheduled more often wins
    let mostConsistent: StatsSummary["mostConsistent"] = null;
    for (const habit of perHabit.values()) {
        if (habit.scheduled === 0) continue;
        const rate = habit.done / habit.scheduled;
        const bestRate = mostConsistent ? mostConsistent.done / mostConsistent.scheduled : -1;
        if (rate > bestRate || (rate === bestRate && habit.scheduled > (mostConsistent?.scheduled ?? 0))) {
            mostConsistent = { ...habit };
        }
    }

    return {
        data: {
            summary: {
                habitRate: totalScheduled > 0 ? totalDone / totalScheduled : null,
                tasksDone: days.reduce((sum, d) => sum + d.tasksDone, 0),
                tasksTotal: days.reduce((sum, d) => sum + d.tasksTotal, 0),
                currentStreak: current,
                bestStreak: best,
                mostConsistent,
            },
            days,
        },
        meta: { from, to: effectiveTo },
    };
}