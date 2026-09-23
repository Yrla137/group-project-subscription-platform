import type { User, Role } from "./UsersType";

// Login User //
interface LoginUser {
    email: string;
    password: string;
}

// Login Response //
interface LoginResponse {
    token: string;
    message: string;
}

// Register User //
interface RegisterUser {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

// Register Response //
interface RegisterResponse {
    message: string;
    user: User;
}

// Auth Payload //
interface AuthPayload {
    user_id: number;
    role: Role;
    exp: number;
}

export type { LoginUser, LoginResponse, RegisterUser, RegisterResponse, AuthPayload };