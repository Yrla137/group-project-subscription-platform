import type { User, Role } from "./usersType";

// Login User //
interface LoginUser {
    email: string;
    password: string;
}

// AuthPayload (JWT) //
interface AuthPayload {
    user_id: number;
    role: Role;
    level_number: number;
}

interface UserWithLevel extends User {
    level_number: number;
}

export type { LoginUser, AuthPayload, UserWithLevel };