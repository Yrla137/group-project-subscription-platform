import { pool } from "../config/db";
import { isScheduledOn } from "./userHabitsService";
import type {
    CalendarEntitlement,
    CalendarEvent,
    CalendarResponse,
    SeminarLockReason,
} from "../types/calendarTypes";
import { addDaysIso, daysBetween, eachDayIso, minIso, todayIso } from "../utils/dateUtils";

// Fallbacks for users without a tier (users.current_tier_id is NULL)
// or a tier without max_future_days
const DEFAULT_TIER_LEVEL = 1;
const DEFAULT_MAX_FUTURE_DAYS = 7;

// Upper bound for a single request, regardless of tier
export const MAX_REQUEST_RANGE_DAYS = 366;

export class CalendarValidationError extends Error { }

interface TaskRow {
    task_date: string;
}

interface HabitRow {
    recurrence_rule: string | null;
}

interface SeminarRow {
    id: number;
    title: string;
    description: string | null;
    seminar_date: string;
    starts_at: Date;
    tier_level: number;
    tier_title: string | null;
}

// Note: dates are returned via to_char(...) so they come back as 'YYYY-MM-DD' strings.
// By default pg turns DATE columns into JS Date objects in local time, which causes off-by-one bugs.

async function getCalendarEntitlement(userId: number): Promise<CalendarEntitlement> {
    const result = await pool.query<{ level_number: number | null; max_future_days: number | null }>(
        `SELECT t.level_number, t.max_future_days
         FROM users u
         LEFT JOIN tiers t ON t.id = u.current_tier_id
         WHERE u.id = $1`,
        [userId]
    );

    const row = result.rows[0];
    const tierLevel = row?.level_number ?? DEFAULT_TIER_LEVEL;
    const maxFutureDays = row?.max_future_days ?? DEFAULT_MAX_FUTURE_DAYS;

    return { tierLevel, maxFutureDays };
}

async function getTasksInRange(userId: number, from: string, to: string): Promise<TaskRow[]> {
    const result = await pool.query<TaskRow>(
        `SELECT to_char(task_date, 'YYYY-MM-DD') AS task_date
         FROM tasks
         WHERE user_id = $1
           AND task_date::date BETWEEN $2::date AND $3::date`,
        [userId, from, to]
    );
    return result.rows;
}

async function getHabits(userId: number): Promise<HabitRow[]> {
    const result = await pool.query<HabitRow>(
        "SELECT recurrence_rule FROM user_habits WHERE user_id = $1",
        [userId]
    );
    return result.rows;
}

// Seminars are fetched for everyone (no tier filter) so locked ones can be shown as teasers.
// The seminar's tier_id is joined to tiers so we compare level_number, not ids.
// Seminars without a tier count as level 0, i.e. open to everyone.
async function getSeminarsInRange(from: string, to: string): Promise<SeminarRow[]> {
    const result = await pool.query<SeminarRow>(
        `SELECT s.id,
                s.seminar_title AS title,
                s.seminar_description AS description,
                to_char(s.seminar_date, 'YYYY-MM-DD') AS seminar_date,
                s.seminar_date AS starts_at,
                COALESCE(t.level_number, 0) AS tier_level,
                t.title AS tier_title
         FROM seminars s
         LEFT JOIN tiers t ON t.id = s.tier_id
         WHERE s.seminar_date::date BETWEEN $1::date AND $2::date
         ORDER BY s.seminar_date ASC`,
        [from, to]
    );
    return result.rows;
}

function getSeminarLockReason(
    seminar: SeminarRow,
    entitlement: CalendarEntitlement,
    horizonEnd: string
): SeminarLockReason {
    if (seminar.tier_level > entitlement.tierLevel) return "tier";
    if (seminar.seminar_date > horizonEnd) return "horizon";
    return null;
}

export async function getCalendarEvents(
    userId: number,
    requestedFrom: string,
    requestedTo: string
): Promise<CalendarResponse> {
    if (requestedFrom > requestedTo) {
        throw new CalendarValidationError("'from' must be on or before 'to'");
    }
    if (daysBetween(requestedFrom, requestedTo) > MAX_REQUEST_RANGE_DAYS) {
        throw new CalendarValidationError(`Range may not exceed ${MAX_REQUEST_RANGE_DAYS} days`);
    }

    const entitlement = await getCalendarEntitlement(userId);

    // Only the future is limited; past days are always visible
    const horizonEnd = addDaysIso(todayIso(), entitlement.maxFutureDays);

    // The user's own tasks and habits are clamped to their horizon
    const ownFrom = requestedFrom;
    const ownTo = minIso(requestedTo, horizonEnd);
    const hasOwnRange = ownFrom <= ownTo;

    const [tasks, habits, seminars] = await Promise.all([
        hasOwnRange ? getTasksInRange(userId, ownFrom, ownTo) : Promise.resolve([] as TaskRow[]),
        hasOwnRange ? getHabits(userId) : Promise.resolve([] as HabitRow[]),
        // Seminars use the full requested range so they work as teasers beyond the horizon
        getSeminarsInRange(requestedFrom, requestedTo),
    ]);

    const taskEvents: CalendarEvent[] = tasks.map((t) => ({
        date: t.task_date,
        type: "task" as const,
    }));

    const ownDays = hasOwnRange ? eachDayIso(ownFrom, ownTo) : [];
    const habitEvents: CalendarEvent[] = habits.flatMap((h) =>
        ownDays
            .filter((day) => isScheduledOn(h.recurrence_rule, day))
            .map((day) => ({ date: day, type: "habit" as const }))
    );

    const seminarEvents: CalendarEvent[] = seminars.map((s) => {
        const lockReason = getSeminarLockReason(s, entitlement, horizonEnd);
        const isLocked = lockReason !== null;

        return {
            id: String(s.id),
            date: s.seminar_date,
            startsAt: s.starts_at.toISOString(),
            type: "seminar" as const,
            tierLevel: s.tier_level,
            tierTitle: s.tier_title,
            title: s.title,
            isLocked,
            lockReason,
            // Never send the details for locked seminars
            ...(isLocked ? {} : { description: s.description ?? undefined }),
        };
    });

    return {
        data: [...taskEvents, ...habitEvents, ...seminarEvents],
        meta: {
            from: requestedFrom,
            to: requestedTo,
            horizonEnd,
            maxFutureDays: entitlement.maxFutureDays,
            tierLevel: entitlement.tierLevel,
        },
    };
}