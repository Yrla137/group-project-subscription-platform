import { z } from "zod";

const createPaymentSchema = z.object({
    tier_id: z.number().int({ message: "Tier ID must be an integer" }).min(1, { message: "Tier ID must be a positive number" }),
});

export { createPaymentSchema };