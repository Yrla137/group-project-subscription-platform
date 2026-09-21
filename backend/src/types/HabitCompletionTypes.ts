interface HabitCompletion {
    id: number;
    user_habit_id: number;
    completed_date: string;
    completed_at: string;
}

interface CreateHabitCompletion {
    user_habit_id: number;
    completed_date: string;
}

export type { HabitCompletion, CreateHabitCompletion };