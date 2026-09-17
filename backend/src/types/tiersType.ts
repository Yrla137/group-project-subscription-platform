interface Tier {
    id : number;
    title : string;
    tier_description : string;
    price : number;
    level_number : number;
    max_todos_per_day : number;
    max_custom_habits : number;
    max_future_days: number;
}

interface CreateTier {
    title : string;
    tier_description : string;
    price : number;
    level_number : number;
    max_todos_per_day : number;
    max_custom_habits : number;
    max_future_days: number;
}

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