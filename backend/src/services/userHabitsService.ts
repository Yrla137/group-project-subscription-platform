import { pool } from "../config/db";
import type { UserHabit, UserHabitWithDetails, CreateUserHabit, UpdateUserHabit } from "../types/UserHabitsTypes";

// GET - gets all active user_habits for a given user, with habit details joined in
const getUserHabits = async (userId: number): Promise<UserHabitWithDetails[]> => {
    const result = await pool.query(
        `SELECT
            uh.id, uh.user_id, uh.habit_id, uh.is_recurring, uh.recurrence_rule,
            uh.duration_minutes, uh.is_active, uh.created_at,
            h.habit_title, h.habit_description
         FROM user_habits uh
         JOIN habits h ON h.id = uh.habit_id
         WHERE uh.user_id = $1 AND uh.is_active = true
         ORDER BY h.habit_title`,
        [userId]
    );
    return result.rows;
};

// GET - gets today's scheduled habits for a user, with completion status
// Filters by recurrence_rule against the given date's weekday in JS (see isScheduledOn helper)
const getUserHabitsForDate = async (
    userId: number,
    date: string
): Promise<UserHabitWithDetails[]> => {
    const result = await pool.query(
        `SELECT
            uh.id, uh.user_id, uh.habit_id, uh.is_recurring, uh.recurrence_rule,
            uh.duration_minutes, uh.is_active, uh.created_at,
            h.habit_title, h.habit_description,
            (hc.id IS NOT NULL) AS is_completed_today
         FROM user_habits uh
         JOIN habits h ON h.id = uh.habit_id
         LEFT JOIN habit_completions hc
            ON hc.user_habit_id = uh.id AND hc.completed_date = $2
         WHERE uh.user_id = $1 AND uh.is_active = true`,
        [userId, date]
    );

    return result.rows.filter((row) => isScheduledOn(row.recurrence_rule, date));
};

// Checks whether a recurrence_rule applies to a given ISO date (YYYY-MM-DD)
const isScheduledOn = (rule: string | null, isoDate: string): boolean => {
    if (!rule) return false;
    if (rule === "DAILY") return true;

    if (rule.startsWith("WEEKLY:")) {
        const days = rule.replace("WEEKLY:", "").split(",");
        const dayAbbr = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(isoDate).getUTCDay()];
        return days.includes(dayAbbr);
    }

    return false;
};

// POST - subscribe a user to a habit
const createUserHabit = async (data: CreateUserHabit): Promise<UserHabit> => {
    const { user_id, habit_id, is_recurring, recurrence_rule, duration_minutes } = data;

    const result = await pool.query(
        `INSERT INTO user_habits (user_id, habit_id, is_recurring, recurrence_rule, duration_minutes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, habit_id, is_recurring, recurrence_rule, duration_minutes, is_active, created_at`,
        [user_id, habit_id, is_recurring ?? false, recurrence_rule ?? null, duration_minutes ?? null]
    );

    return result.rows[0];
};

// PATCH - update a user's habit schedule/duration/active status
const updateUserHabit = async (id: number, data: UpdateUserHabit): Promise<UserHabit | null> => {
    const { is_recurring, recurrence_rule, duration_minutes, is_active } = data;

    const result = await pool.query(
        `UPDATE user_habits
         SET is_recurring = COALESCE($1, is_recurring),
             recurrence_rule = COALESCE($2, recurrence_rule),
             duration_minutes = COALESCE($3, duration_minutes),
             is_active = COALESCE($4, is_active)
         WHERE id = $5
         RETURNING id, user_id, habit_id, is_recurring, recurrence_rule, duration_minutes, is_active, created_at`,
        [is_recurring ?? null, recurrence_rule ?? null, duration_minutes ?? null, is_active ?? null, id]
    );

    return result.rows[0] || null;
};

// DELETE - remove a user's habit subscription entirely
const deleteUserHabit = async (id: number): Promise<void> => {
    await pool.query("DELETE FROM user_habits WHERE id = $1", [id]);
};

export {
    getUserHabits,
    getUserHabitsForDate,
    createUserHabit,
    updateUserHabit,
    deleteUserHabit,
};