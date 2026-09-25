import { pool } from "../config/db";
import type { Habit, CreateHabit, UpdateHabit } from "../types/HabitsTypes";
import type { HabitLimit } from "../types/HabitsTypes";

// GET - default habits + the ones this user created themselves
const getMyHabits = async (userId: number): Promise<Habit[]> => {
    const result = await pool.query(
        `SELECT id, habit_title, habit_description, default_duration_minutes, created_by, created_at
         FROM habits
         WHERE created_by IS NULL OR created_by = $1
         ORDER BY habit_title`,
        [userId]
    );
    return result.rows;
};

// GET id - same scope as getMyHabits
const getMyHabitById = async (id: number, userId: number): Promise<Habit | null> => {
    const result = await pool.query(
        `SELECT id, habit_title, habit_description, default_duration_minutes, created_by, created_at
         FROM habits
         WHERE id = $1 AND (created_by IS NULL OR created_by = $2)`,
        [id, userId]
    );
    return result.rows[0] || null;
};

export const getHabitLimit = async (userId: number): Promise<HabitLimit> => {
    const result = await pool.query<{ max_custom_habits: number | null; custom_habit_count: number }>(
        `SELECT t.max_custom_habits,
                (SELECT COUNT(*)::int FROM habits h WHERE h.created_by = u.id) AS custom_habit_count
         FROM users u
         LEFT JOIN tiers t ON t.id = u.current_tier_id
         WHERE u.id = $1`,
        [userId]
    );

    const row = result.rows[0];
    return {
        customHabitCount: row?.custom_habit_count ?? 0,
        maxCustomHabits: row?.max_custom_habits ?? DEFAULT_MAX_CUSTOM_HABITS,
    };
};

// Fallback for users without a tier (users.current_tier_id is NULL)
const DEFAULT_MAX_CUSTOM_HABITS = 0;

export class HabitLimitReachedError extends Error {
    constructor(public readonly limit: number) {
        super(`Your current plan allows at most ${limit} custom habits`);
        this.name = "HabitLimitReachedError";
    }
}

// POST - always creates a personal habit owned by this user
const createHabit = async (data: CreateHabit, userId: number): Promise<Habit> => {
    const { habit_title, habit_description, default_duration_minutes } = data;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock the user's row so simultaneous requests can't both pass the limit check
        const limitResult = await client.query<{ max_custom_habits: number | null }>(
            `SELECT t.max_custom_habits
             FROM users u
             LEFT JOIN tiers t ON t.id = u.current_tier_id
             WHERE u.id = $1
             FOR UPDATE OF u`,
            [userId]
        );

        const maxCustomHabits = limitResult.rows[0]?.max_custom_habits ?? DEFAULT_MAX_CUSTOM_HABITS;

        // COUNT returns bigint, which pg gives back as a string, so cast to int
        const countResult = await client.query<{ count: number }>(
            "SELECT COUNT(*)::int AS count FROM habits WHERE created_by = $1",
            [userId]
        );

        if (countResult.rows[0].count >= maxCustomHabits) {
            throw new HabitLimitReachedError(maxCustomHabits);
        }

        const result = await client.query<Habit>(
            `INSERT INTO habits (habit_title, habit_description, default_duration_minutes, created_by)
             VALUES ($1, $2, $3, $4)
             RETURNING id, habit_title, habit_description, default_duration_minutes, created_by, created_at`,
            [habit_title, habit_description ?? null, default_duration_minutes ?? null, userId]
        );

        await client.query("COMMIT");
        return result.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

// PATCH - only allowed on habits this user created themselves
const updateHabit = async (id: number, data: UpdateHabit, userId: number): Promise<Habit | null> => {
    const { habit_title, habit_description, default_duration_minutes } = data;

    const result = await pool.query(
        `UPDATE habits
         SET habit_title = COALESCE($1, habit_title),
             habit_description = COALESCE($2, habit_description),
             default_duration_minutes = COALESCE($3, default_duration_minutes)
         WHERE id = $4 AND created_by = $5
         RETURNING id, habit_title, habit_description, default_duration_minutes, created_by, created_at`,
        [habit_title ?? null, habit_description ?? null, default_duration_minutes ?? null, id, userId]
    );

    return result.rows[0] || null;
};

// DELETE - only allowed on habits this user created themselves
const deleteHabit = async (id: number, userId: number): Promise<boolean> => {
    const result = await pool.query(
        "DELETE FROM habits WHERE id = $1 AND created_by = $2 RETURNING id",
        [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
};

export {
    getMyHabits,
    getMyHabitById,
    createHabit,
    updateHabit,
    deleteHabit,
};