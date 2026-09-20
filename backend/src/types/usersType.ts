// Role type //
type Role = 'administrator' | 'member';

// User //
interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: Role;
    current_tier_id: number;
    created_at: Date;
    
}

// Create User //
interface CreateUser {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

// Update User //
interface UpdateUser {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
}

// Public User //
type PublicUser = Omit<User, 'password_hash'>;
// Omit means that the PublicUser type will have all the properties of the User type except for the password_hash property.

type UserWithTier = PublicUser & {
    tier_title: string;
    level_number: number;
};
// Opposite of Omit, here it "copies" all the properties of the PublicUser type and adds two new properties: tier_title and level_number.

export type { Role, User, CreateUser, UpdateUser, PublicUser, UserWithTier };