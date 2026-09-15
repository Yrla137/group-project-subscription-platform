import type { Role } from "./users-type";

// Login User //
interface LoginUser {
    email: string;
    password: string;
}

// Auth Payload (JWT) //
interface AuthPayload {
    user_id: number;
    role: Role;
}

export type { LoginUser, AuthPayload };