interface Payment {
    id: number,
    user_id: number,
    tier_id: number,
    amount: string,
    payment_date: Date
}

interface PaymentWithTier extends Payment {
    tier_title: string;
    tier_description: string;
}

interface CreatePayment {
    tier_id: number;
}

export type { Payment, CreatePayment, PaymentWithTier };