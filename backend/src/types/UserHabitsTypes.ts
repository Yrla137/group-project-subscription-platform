interface UserHabit {
    id: number;
    user_id: number;
    habit_id: number;
    is_recurring: boolean;
    recurrence_rule: string | null;
    duration_minutes: number | null;
    is_active: boolean;
    created_at: string;
}

// Returned by GET /user-habits and /user-habits/today — joins in habit details
interface UserHabitWithDetails extends UserHabit {
    habit_title: string;
    habit_description: string | null;
    is_completed_today?: boolean;
}

interface CreateUserHabit {
    user_id: number;
    habit_id: number;
    is_recurring?: boolean;
    recurrence_rule?: string;
    duration_minutes?: number;
}

interface UpdateUserHabit {
    is_recurring?: boolean;
    recurrence_rule?: string;
    duration_minutes?: number;
    is_active?: boolean;
}

export type { UserHabit, UserHabitWithDetails, CreateUserHabit, UpdateUserHabit };