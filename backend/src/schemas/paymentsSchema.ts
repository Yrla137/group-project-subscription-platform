import { z } from "zod";

// Create Payment Schema //
const createPaymentSchema = z.object({
    tier_id: z.number().int({ message: "Tier ID must be an integer" }).min(1, { message: "Tier ID must be a positive number" }),
});

export { createPaymentSchema };