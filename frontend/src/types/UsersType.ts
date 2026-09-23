// Role type //
type Role = 'administrator' | 'member';

// User //
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: Role;
    current_tier_id: number;
    created_at: Date;
}

// User with subscription tier //
type UserWithTier = User & {
    tier_title: string;
    level_number: number;
};

// Update User //
interface UpdateUser {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
}

export type { User, Role, UserWithTier, UpdateUser };