import { pool } from "../config/db";
import type { Tier, CreateTier, UpdateTier } from '../types/tiersType';

// GET - gets all tiers from the database
const getAllTiers = async (): Promise<Tier[]> => {
    const result = await pool.query('SELECT id, title, tier_description, price, level_number, max_todos_per_day, max_custom_habits, max_future_days FROM tiers ORDER BY level_number ASC');
    return result.rows;
}

// GET - get one tier by id from the database
const getTierById = async (id: number): Promise<Tier | null> => {
    const result = await pool.query('SELECT id, title, tier_description, price, level_number, max_todos_per_day, max_custom_habits, max_future_days FROM tiers WHERE id = $1', [id]);
    return result.rows[0] || null;
}

// POST - create a new tier in the database
const createTier = async (data: CreateTier): Promise<Tier> => {
    const { title, tier_description, price, level_number, max_todos_per_day, max_custom_habits, max_future_days } = data;
    const result = await pool.query(
        `INSERT INTO tiers (title, tier_description, price, level_number, max_todos_per_day, max_custom_habits, max_future_days)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, tier_description, price, level_number, max_todos_per_day, max_custom_habits, max_future_days`,
        [title, tier_description, price, level_number, max_todos_per_day, max_custom_habits, max_future_days]
    );
    return result.rows[0];
};

// PATCH - update tier information
const updateTier = async (id: number, data: UpdateTier): Promise<Tier | null> => {
    const { title, tier_description, price, level_number, max_todos_per_day, max_custom_habits, max_future_days } = data;
    const result = await pool.query(
        `UPDATE tiers
         SET title = COALESCE($1, title),
                tier_description = COALESCE($2, tier_description),
                price = COALESCE($3, price),
                level_number = COALESCE($4, level_number),
                max_todos_per_day = COALESCE($5, max_todos_per_day),
                max_custom_habits = COALESCE($6, max_custom_habits),
                max_future_days = COALESCE($7, max_future_days)
            WHERE id = $8
            RETURNING id, title, tier_description, price, level_number, max_todos_per_day, max_custom_habits, max_future_days`,
        [title ?? null, tier_description ?? null, price ?? null, level_number ?? null, max_todos_per_day ?? null, max_custom_habits ?? null, max_future_days ?? null, id]
    );
    return result.rows[0] || null;
}

// DELETE - remove a tier from the database (Will probably not be used in frontend for easy access)
const deleteTier = async (id: number): Promise<void> => {
    await pool.query(
        'DELETE FROM tiers WHERE id = $1',
        [id]
    );
};

export { getAllTiers, getTierById, createTier, updateTier, deleteTier };