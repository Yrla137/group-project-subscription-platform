import { pool } from "../config/db";
import type { HabitCompletion, CreateHabitCompletion } from "../types/HabitCompletionTypes";

// The app's users are in Sweden, so "today" follows Swedish time, not the server's UTC
const APP_TIME_ZONE = "Europe/Stockholm";

class InvalidCompletionDateError extends Error { }

// Today's date as "YYYY-MM-DD" in the app's time zone (sv-SE formats dates that way)
function todayInAppTimeZone(): string {
    return new Intl.DateTimeFormat("sv-SE", { timeZone: APP_TIME_ZONE }).format(new Date());
}

function assertCompletableDate(date: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new InvalidCompletionDateError("completed_date must be in the format YYYY-MM-DD");
    }
    // YYYY-MM-DD strings compare correctly as plain strings
    if (date > todayInAppTimeZone()) {
        throw new InvalidCompletionDateError("You can't complete a habit on a future date");
    }
}

// GET - gets all completions for a given date across a user's habits
const getCompletionsForDate = async (userId: number, date: string): Promise<HabitCompletion[]> => {
    const result = await pool.query(
        `SELECT hc.id, hc.user_habit_id, hc.completed_date, hc.completed_at
         FROM habit_completions hc
         JOIN user_habits uh ON uh.id = hc.user_habit_id
         WHERE uh.user_id = $1 AND hc.completed_date = $2`,
        [userId, date]
    );
    return result.rows;
};

// POST - check off a habit for a given date (idempotent — safe to call twice)
// Verifies the date isn't in the future and that the user_habit belongs to this user
const createCompletion = async (userId: number, data: CreateHabitCompletion): Promise<HabitCompletion | null> => {
    const { user_habit_id, completed_date } = data;

    assertCompletableDate(completed_date);

    const result = await pool.query(
        `INSERT INTO habit_completions (user_habit_id, completed_date)
         SELECT $1, $2
         WHERE EXISTS (
            SELECT 1 FROM user_habits WHERE id = $1 AND user_id = $3
         )
         ON CONFLICT (user_habit_id, completed_date) DO UPDATE
            SET user_habit_id = EXCLUDED.user_habit_id
         RETURNING id, user_habit_id, completed_date, completed_at`,
        [user_habit_id, completed_date, userId]
    );

    return result.rows[0] || null;
};

// DELETE - undo a check-off for a given date
const deleteCompletion = async (userId: number, userHabitId: number, date: string): Promise<void> => {
    await pool.query(
        `DELETE FROM habit_completions hc
         USING user_habits uh
         WHERE hc.user_habit_id = uh.id
           AND hc.user_habit_id = $1
           AND hc.completed_date = $2
           AND uh.user_id = $3`,
        [userHabitId, date, userId]
    );
};

export {
    getCompletionsForDate,
    createCompletion,
    deleteCompletion,
    InvalidCompletionDateError,
    todayInAppTimeZone,
};