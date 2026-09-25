import { pool } from "../config/db";
import type { UpdateSeminar, CreateSeminar, Seminar } from './../types/seminars-type';

// POST - create a new seminar
const createSeminar = async (data: CreateSeminar): Promise<Seminar> => {
    const { seminar_title, seminar_description, seminar_date, tier_id, created_by } = data;

    const result = await pool.query(
        `INSERT INTO seminars (seminar_title, seminar_description, seminar_date, tier_id, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, seminar_title, seminar_description, seminar_date, tier_id, created_by, created_at`,
        [seminar_title, seminar_description ?? null, seminar_date, tier_id, created_by]
    );

    return result.rows[0];
};

// GET - gets all seminars from the database

const getAllSeminars = async (): Promise<Seminar[]> => {
        const result = await pool.query(`
        SELECT
            seminars.*,
            tiers.level_number AS tier_level
            tiers.title AS tier_title
        FROM seminars
        LEFT JOIN tiers ON seminars.tier_id = tiers.id
    `);
    return result.rows;
};

// GET id - gets a seminar with a specific id from the database
const getSeminarById = async (id: number): Promise<Seminar | null> => {
    const result = await pool.query('SELECT id, seminar_title, seminar_description, seminar_date, tier_id, created_by, created_at FROM seminars WHERE id = $1', [id]);
    return result.rows[0] || null;
};


// PATCH - update seminar information
const updateSeminar = async (id: number, data: UpdateSeminar): Promise<Seminar | null> => {
    const { seminar_title, seminar_description, seminar_date, tier_id } = data;

    const result = await pool.query(
        `UPDATE seminars
         SET seminar_title = COALESCE($1, seminar_title),
             seminar_description = COALESCE($2, seminar_description),
             seminar_date = COALESCE($3, seminar_date),
             tier_id = COALESCE($4, tier_id)
         WHERE id = $5
         RETURNING id, seminar_title, seminar_description, seminar_date, tier_id, created_by, created_at`,
        [seminar_title ?? null, seminar_description ?? null, seminar_date ?? null, tier_id ?? null, id]
    );

    return result.rows[0] || null;
};

// DELETE - remove a seminar from the database
const deleteSeminar = async (id: number): Promise<void> => {
    await pool.query('DELETE FROM seminars WHERE id = $1', [id]);
};

export {
    createSeminar,
    getAllSeminars,
    getSeminarById,
    updateSeminar,
    deleteSeminar
};