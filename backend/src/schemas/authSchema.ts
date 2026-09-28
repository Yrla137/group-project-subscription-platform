import { z } from "zod";

// Login Schema for checking incoming data when logging in
const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string()
});

// Registr Schema for checking incoming data when registering a new user
const registerSchema = z.object({
    first_name: z.string().trim().min(1, { message: "First name is required" }),
    last_name: z.string().trim().min(1, { message: "Last name is required" }),
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" })
});

export { loginSchema, registerSchema };