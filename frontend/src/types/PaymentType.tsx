// Payment Type //
interface Payment {
    id: number;
    user_id: number;
    tier_id: number;
    amount: string;
    payment_date: Date;
}

// Create Payment Type //
interface CreatePayment {
    tier_id: number;
}

export type { Payment, CreatePayment };