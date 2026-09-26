// Tier Type //
interface Tier {
    id : number;
    title : string;
    tier_description : string;
    price : string;
    level_number : number;
    max_todos_per_day : number;
    max_custom_habits : number;
    max_future_days: number;
}

// Create Tier Type //
interface CreateTier {
    title : string;
    tier_description : string;
    price : number;
    level_number : number;
    max_todos_per_day : number;
    max_custom_habits : number;
    max_future_days: number;
}


// Add New Tier Form Type //
interface NewTierFormData {
    title: string;
    tier_description: string;
    price: string;
    level_number: string;
    max_todos_per_day: string;
    max_custom_habits: string;
    max_future_days: string;
}

// Update Tier Type //
interface UpdateTier {
    title? : string;
    tier_description? : string;
    price? : number;
    level_number? : number;
    max_todos_per_day? : number;
    max_custom_habits? : number;
    max_future_days?: number;
}

export type { Tier, CreateTier, NewTierFormData, UpdateTier };