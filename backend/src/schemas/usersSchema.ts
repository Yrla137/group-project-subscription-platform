import { z } from "zod";

// Update user schema for checking incoming data when updating user information
const updateUserSchema = z.object({
    first_name: z.string().trim().min(1, { message: "First name cannot be empty" }).optional(),
    last_name: z.string().trim().min(1, { message: "Last name cannot be empty" }).optional(),
    email: z.email({ message: "Invalid email address" }).optional(),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }).optional()
})
// Refine is here used to ensure at least one field is provided for update. A validation rule outside of the schema definition.
.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

export { updateUserSchema };