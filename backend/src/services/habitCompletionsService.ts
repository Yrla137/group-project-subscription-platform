import { pool } from "../config/db";
import type { HabitCompletion, CreateHabitCompletion } from "../types/HabitCompletionTypes";

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
const createCompletion = async (data: CreateHabitCompletion): Promise<HabitCompletion> => {
    const { user_habit_id, completed_date } = data;

    const result = await pool.query(
        `INSERT INTO habit_completions (user_habit_id, completed_date)
         VALUES ($1, $2)
         ON CONFLICT (user_habit_id, completed_date) DO UPDATE
            SET user_habit_id = EXCLUDED.user_habit_id
         RETURNING id, user_habit_id, completed_date, completed_at`,
        [user_habit_id, completed_date]
    );

    return result.rows[0];
};

// DELETE - undo a check-off for a given date
const deleteCompletion = async (userHabitId: number, date: string): Promise<void> => {
    await pool.query(
        "DELETE FROM habit_completions WHERE user_habit_id = $1 AND completed_date = $2",
        [userHabitId, date]
    );
};

export {
    getCompletionsForDate,
    createCompletion,
    deleteCompletion,
};