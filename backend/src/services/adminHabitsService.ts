import { pool } from "../config/db";
import type { Habit, CreateHabit, UpdateHabit } from "../types/HabitsTypes";

// GET - default (catalog) habits only
const getDefaultHabits = async (): Promise<Habit[]> => {
    const result = await pool.query(
        `SELECT id, habit_title, habit_description, default_duration_minutes, created_by, created_at
         FROM habits
         WHERE created_by IS NULL
         ORDER BY habit_title`
    );
    return result.rows;
};

// GET id - same scope as getDefaultHabits
const getDefaultHabitById = async (id: number): Promise<Habit | null> => {
    const result = await pool.query(
        `SELECT id, habit_title, habit_description, default_duration_minutes, created_by, created_at
         FROM habits
         WHERE id = $1 AND created_by IS NULL`,
        [id]
    );
    return result.rows[0] || null;
};

// POST - always creates a default (catalog) habit, created_by NULL
const createDefaultHabit = async (data: CreateHabit): Promise<Habit> => {
    const { habit_title, habit_description, default_duration_minutes } = data;

    const result = await pool.query(
        `INSERT INTO habits (habit_title, habit_description, default_duration_minutes, created_by)
         VALUES ($1, $2, $3, NULL)
         RETURNING id, habit_title, habit_description, default_duration_minutes, created_by, created_at`,
        [habit_title, habit_description ?? null, default_duration_minutes ?? null]
    );

    return result.rows[0];
};

// PATCH - only allowed on default (catalog) habits
const updateDefaultHabit = async (id: number, data: UpdateHabit): Promise<Habit | null> => {
    const { habit_title, habit_description, default_duration_minutes } = data;

    const result = await pool.query(
        `UPDATE habits
         SET habit_title = COALESCE($1, habit_title),
             habit_description = COALESCE($2, habit_description),
             default_duration_minutes = COALESCE($3, default_duration_minutes)
         WHERE id = $4 AND created_by IS NULL
         RETURNING id, habit_title, habit_description, default_duration_minutes, created_by, created_at`,
        [habit_title ?? null, habit_description ?? null, default_duration_minutes ?? null, id]
    );

    return result.rows[0] || null;
};

// DELETE - only allowed on default (catalog) habits
const deleteDefaultHabit = async (id: number): Promise<boolean> => {
    const result = await pool.query(
        "DELETE FROM habits WHERE id = $1 AND created_by IS NULL RETURNING id",
        [id]
    );
    return (result.rowCount ?? 0) > 0;
};

export {
    getDefaultHabits,
    getDefaultHabitById,
    createDefaultHabit,
    updateDefaultHabit,
    deleteDefaultHabit,
};