import { pool } from "../config/db";
import bcrypt from "bcrypt";
import type { UpdateUser, PublicUser } from '../types/usersType';

// GET - gets all users from the database (only for admin)
 const getAllUsers = async (): Promise<PublicUser[]> => {
    const result = await pool.query('SELECT id, first_name, last_name, email, role, current_tier_id, created_at FROM users');
    return result.rows;
}
 
// GET id - gets a user with a specific id from the database (only for admin)
 const getUserById = async (id: number): Promise<PublicUser | null> => {
    const result = await pool.query('SELECT id, first_name, last_name, email, role, current_tier_id, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
 };

// PATCH - update user information
const updateUser = async (id: number, data: UpdateUser): Promise<PublicUser | null> => {
    const { first_name, last_name, email, password } = data;

    if (!password) {
    const result = await pool.query(
        `UPDATE users
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             email = COALESCE($3, email)
         WHERE id = $4
         RETURNING id, first_name, last_name, email, role, current_tier_id, created_at`,
        [first_name ?? null, last_name ?? null, email ?? null, id]
    );

    return result.rows[0] || null;
    }
    // COALESCE is a SQL function that returns the first non-null value in a list of arguments.
    // In this case, it is used to update the user's information only if the new value is not null. If the new value is null it will keep the existing value in the database.

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        `UPDATE users
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             email = COALESCE($3, email),
             password_hash = $4
            WHERE id = $5
            RETURNING id, first_name, last_name, email, role, current_tier_id, created_at`,
        [first_name ?? null, last_name ?? null, email ?? null, password_hash, id]
    );
    return result.rows[0] || null;
};

// DELETE - remove a user and related user data from the database (only for admin)
const deleteUser = async (id: number): Promise<void> => {
    const client = await pool.connect();

    try {
        // Start a transaction
        await client.query('BEGIN');

        // Delete tasks belonging to the user's todo lists
        await client.query(
            `DELETE FROM tasks
             WHERE todo_list_id IN (
                SELECT id
                FROM todo_list
                WHERE user_id = $1
             )`,
            [id]
        );

        // Delete user's todo lists
        await client.query(
            'DELETE FROM todo_list WHERE user_id = $1',
            [id]
        );

        // Delete user_habits connected to habits created by the user
        await client.query(
            `DELETE FROM user_habits
             WHERE habit_id IN (
                SELECT id
                FROM habits
                WHERE created_by = $1
             )`,
            [id]
        );

        // Delete user's own user_habits
        await client.query(
            'DELETE FROM user_habits WHERE user_id = $1',
            [id]
        );

        // Delete habits created by the user
        await client.query(
            'DELETE FROM habits WHERE created_by = $1',
            [id]
        );

        // Delete user's payments
        await client.query(
            'DELETE FROM payments WHERE user_id = $1',
            [id]
        );

        // Keep seminars but remove connection to deleted user
        await client.query(
            `UPDATE seminars
            SET created_by = NULL
            WHERE created_by = $1`,
            [id]
        );

        // Finally delete the user
        await client.query(
            'DELETE FROM users WHERE id = $1',
            [id]
        );

        // Commit the transaction
        await client.query('COMMIT');

    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query('ROLLBACK');
        throw error;

    } finally {
        // Release the client back to the pool
        client.release();
    }
};

export {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};