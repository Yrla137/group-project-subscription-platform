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
    default_duration_minutes?: number | null;
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
    updateHabit: (id: number, data: UpdateHabit) => Promise<Habit | null>;
    deleteHabit: (id: number) => Promise<boolean>;
}

export type { Habit, CreateHabit, UpdateHabit, HabitLimit, UseHabitsResult };