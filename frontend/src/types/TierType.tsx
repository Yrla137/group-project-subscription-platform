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

export type { Tier, CreateTier, UpdateTier };