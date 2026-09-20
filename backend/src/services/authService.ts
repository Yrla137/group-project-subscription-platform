import { pool } from "../config/db";
import bcrypt from "bcrypt";
import type { LoginUser, AuthPayload } from '../types/authType';
import type { User, CreateUser, PublicUser } from '../types/usersType';

// GET - get user by email
const getUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query('SELECT id, first_name, last_name, email, password_hash, role, current_tier_id, created_at FROM users WHERE email = $1',[email]);
    return result.rows[0] || null;
}

// GET - Login user
const loginUser = async (data: LoginUser): Promise<AuthPayload | null> => {
    const user = await getUserByEmail(data.email);
    if (!user) {
        return null;
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
        return null;
    }
    return {
        user_id: user.id,
        role: user.role
    };
};

// ( )                        
//  ↓                              
// Vad går IN?

// Promise< >
//  ↓                              
// Vad kommer UT?

// POST - register a new user in the database
const registerUser = async (data: CreateUser): Promise<PublicUser> => {
    const { first_name, last_name, email, password } = data;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, first_name, last_name, email, role, current_tier_id, created_at`,
        [first_name, last_name, email, password_hash]
    );
    return result.rows[0];
};

export {
    getUserByEmail,
    loginUser,
    registerUser,
};