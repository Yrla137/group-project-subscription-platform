import { pool } from "../config/db";
import type { Habit, CreateHabit, UpdateHabit } from "../types/HabitsTypes";

// GET - gets all habits from the catalog
const getAllHabits = async (): Promise<Habit[]> => {
    const result = await pool.query(
        `SELECT id, habit_title, habit_description, default_duration_minutes, created_by, created_at
         FROM habits
         ORDER BY habit_title`
    );
    return result.rows;
};

// GET id - gets a habit with a specific id
const getHabitById = async (id: number): Promise<Habit | null> => {
    const result = await pool.query(
        `SELECT id, habit_title, habit_description, default_duration_minutes, created_by, created_at
         FROM habits WHERE id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

// POST - create a new habit
const createHabit = async (data: CreateHabit): Promise<Habit> => {
    const { habit_title, habit_description, default_duration_minutes, created_by } = data;

    const result = await pool.query(
        `INSERT INTO habits (habit_title, habit_description, default_duration_minutes, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING id, habit_title, habit_description, default_duration_minutes, created_by, created_at`,
        [habit_title, habit_description ?? null, default_duration_minutes ?? null, created_by ?? null]
    );

    return result.rows[0];
};

// PATCH - update habit information
const updateHabit = async (id: number, data: UpdateHabit): Promise<Habit | null> => {
    const { habit_title, habit_description, default_duration_minutes } = data;

    const result = await pool.query(
        `UPDATE habits
         SET habit_title = COALESCE($1, habit_title),
             habit_description = COALESCE($2, habit_description),
             default_duration_minutes = COALESCE($3, default_duration_minutes)
         WHERE id = $4
         RETURNING id, habit_title, habit_description, default_duration_minutes, created_by, created_at`,
        [habit_title ?? null, habit_description ?? null, default_duration_minutes ?? null, id]
    );

    return result.rows[0] || null;
};

// DELETE - remove a habit from the catalog
const deleteHabit = async (id: number): Promise<void> => {
    await pool.query("DELETE FROM habits WHERE id = $1", [id]);
};

export {
    getAllHabits,
    getHabitById,
    createHabit,
    updateHabit,
    deleteHabit,
};