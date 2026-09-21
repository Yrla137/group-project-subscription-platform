import type { Role } from "./usersType";

// Login User //
interface LoginUser {
    email: string;
    password: string;
}

// AuthPayload (JWT) //
interface AuthPayload {
    user_id: number;
    role: Role;
}

export type { LoginUser, AuthPayload };