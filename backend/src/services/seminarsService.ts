import { pool } from "../config/db";
import type { UpdateSeminar, CreateSeminar, Seminar } from './../types/seminars-type';

// POST - create a new seminar
const createSeminar = async (data: CreateSeminar): Promise<Seminar> => {
    const { seminar_title, seminar_description, seminar_date, seminar_img, tier_id, created_by } = data;

    const result = await pool.query(
        `INSERT INTO seminars (seminar_title, seminar_description, seminar_date, seminar_img, tier_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, seminar_title, seminar_description, seminar_date, seminar_img, tier_id, created_by, created_at`,
        [seminar_title, seminar_description ?? null, seminar_date, seminar_img ?? null, tier_id, created_by]
    );

    return result.rows[0];
};

// GET - gets all seminars from the database

const getSeminars = async (userId: number): Promise<Seminar[]> => {
    const result = await pool.query(
        `WITH me AS (
             SELECT t.level_number
             FROM users u
             LEFT JOIN tiers t ON t.id = u.current_tier_id
             WHERE u.id = $1
         )
         SELECT s.id,
                s.seminar_title,
                s.seminar_description,
                s.seminar_date,
                s.seminar_img,
                s.tier_id,
                t.level_number AS tier_level,
                t.title AS tier_title,
                t.level_number > COALESCE((SELECT level_number FROM me), 1) AS is_locked
         FROM seminars s
         JOIN tiers t ON t.id = s.tier_id
         WHERE seminar_date >= CURRENT_DATE
         ORDER BY s.seminar_date ASC`,
        [userId]
    );
    return result.rows;
};

// GET id - gets a seminar with a specific id from the database
const getSeminarById = async (id: number): Promise<Seminar | null> => {
    const result = await pool.query('SELECT id, seminar_title, seminar_description, seminar_date, tier_id, created_by, created_at FROM seminars WHERE id = $1', [id]);
    return result.rows[0] || null;
};

// GET id for a specific user - includes whether the user's tier gives access
export const getSeminarForUser = async (id: number, userId: number) => {
    const result = await pool.query(
        `WITH me AS (
             SELECT t.level_number
             FROM users u
             LEFT JOIN tiers t ON t.id = u.current_tier_id
             WHERE u.id = $1
         )
         SELECT s.id,
                s.seminar_title,
                s.seminar_description,
                s.seminar_img,
                s.seminar_date,
                s.tier_id,
                t.level_number AS tier_level,
                t.title AS tier_title,
                t.level_number > COALESCE((SELECT level_number FROM me), 1) AS is_locked
         FROM seminars s
         JOIN tiers t ON t.id = s.tier_id
         WHERE s.id = $2`,
        [userId, id]
    );
    return result.rows[0] ?? null;
};


// PATCH - update seminar information
const updateSeminar = async (id: number, data: UpdateSeminar): Promise<Seminar | null> => {
    const { seminar_title, seminar_description, seminar_date, seminar_img, tier_id } = data;

    // Unlike the other fields, the image can be removed by sending null (the card then shows the fallback).
    // $6 tells the query whether seminar_img was sent at all, so a missing field leaves it unchanged.
    const hasImg = seminar_img !== undefined;

    const result = await pool.query(
        `UPDATE seminars
         SET seminar_title = COALESCE($1, seminar_title),
             seminar_description = COALESCE($2, seminar_description),
             seminar_date = COALESCE($3, seminar_date),
             tier_id = COALESCE($4, tier_id),
             seminar_img = CASE WHEN $6::boolean THEN $5 ELSE seminar_img END
         WHERE id = $7
         RETURNING id, seminar_title, seminar_description, seminar_date, seminar_img, tier_id, created_by, created_at`,
        [
            seminar_title ?? null,
            seminar_description ?? null,
            seminar_date ?? null,
            tier_id ?? null,
            hasImg ? seminar_img : null,
            hasImg,
            id,
        ]
    );

    return result.rows[0] || null;
};

// DELETE - remove a seminar from the database
const deleteSeminar = async (id: number): Promise<void> => {
    await pool.query('DELETE FROM seminars WHERE id = $1', [id]);
};

export {
    createSeminar,
    getSeminars,
    getSeminarById,
    updateSeminar,
    deleteSeminar
};