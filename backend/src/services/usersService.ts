import { pool } from "../config/db";
import type { PublicUser } from './../types/users-type';

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
 
 // POST - create a new user in the database (only for admin)

// PATCH - update a user in the database

// PATCH - update logged in user's own profile

// DELETE - remove a user and related data from the database (only for admin)

export {
    getAllUsers,
    getUserById
 };