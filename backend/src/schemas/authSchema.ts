import { z } from "zod";

// Login schema for checking incoming data from the user
const loginSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string()
});

// Register schema for checking new user data before sending it to the database
const registerSchema = z.object({
    first_name: z.string().trim().min(1, { message: "First name is required" }),
    last_name: z.string().trim().min(1, { message: "Last name is required" }),
    email: z.email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" })
});

export { loginSchema, registerSchema };