interface Habit {
    id: number;
    habit_title: string;
    habit_description: string | null;
    default_duration_minutes: number | null;
    created_by: number | null;
    created_at: string;
}

interface CreateHabit {
    habit_title: string;
    habit_description?: string;
    default_duration_minutes?: number;
    created_by?: number;
}

interface UpdateHabit {
    habit_title?: string;
    habit_description?: string;
    default_duration_minutes?: number;
}

export type { Habit, CreateHabit, UpdateHabit };