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

interface HabitLimit {
    customHabitCount: number;
    maxCustomHabits: number;
}

interface UseHabitsResult {
    habits: Habit[];
    isLoading: boolean;
    error: string | null;
    habitLimit: HabitLimit | null;
    canCreateHabit: boolean;
    createHabit: (data: CreateHabit) => Promise<Habit | null>;
}

export type { Habit, CreateHabit, UpdateHabit, HabitLimit, UseHabitsResult };