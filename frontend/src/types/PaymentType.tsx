// Payment Type //
interface Payment {
    id: number;
    user_id: number;
    tier_id: number;
    amount: string;
    payment_date: Date;
}

// Payment with Tier Type //
interface PaymentWithTier extends Payment {
    tier_title: string;
    tier_description: string;
}

// Create Payment Type //
interface CreatePayment {
    tier_id: number;
}

export type { Payment, PaymentWithTier, CreatePayment };