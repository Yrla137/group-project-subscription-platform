import { z } from "zod";

const createTierSchema = z.object({
    title: z.string().trim().min(1, { message: "Title is required" }),
    tier_description: z.string().trim().min(1, { message: "Description is required" }),
    price: z.number().min(0, { message: "Number can not be negative" }),
    level_number: z.number()
    .int({ message: "Level number must be an integer" })
    .min(0, { message: "Level number can not be negative" }),
    max_todos_per_day: z.number()
    .int({ message: "Max todos per day must be an integer" })
    .min(0, { message: "Max todos per day must be a positive number" }),
    max_custom_habits: z.number()
    .int({ message: "Max custom habits must be an integer" })
    .min(0, { message: "Max custom habits must be a positive number" }),
    max_future_days: z.number()
    .int({ message: "Max future days must be an integer" })
    .min(0, { message: "Max future days must be a positive number" }),
});

const updateTierSchema = z.object({
    title: z.string().trim().min(1, { message: "Title is required" }).optional(),
    tier_description: z.string().trim().min(1, { message: "Description is required" }).optional(),
    price: z.number().min(0, { message: "Number can not be negative" }).optional(),
    level_number: z.number()
    .int({ message: "Level number must be an integer" })
    .min(0, { message: "Level number can not be negative" }).optional(),
    max_todos_per_day: z.number()
    .int({ message: "Max todos per day must be an integer" })
    .min(0, { message: "Max todos per day must be a positive number" }).optional(),
    max_custom_habits: z.number()
    .int({ message: "Max custom habits must be an integer" })
    .min(0, { message: "Max custom habits must be a positive number" }).optional(),
    max_future_days: z.number()
    .int({ message: "Max future days must be an integer" })
    .min(0, { message: "Max future days must be a positive number" }).optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

export { createTierSchema, updateTierSchema };