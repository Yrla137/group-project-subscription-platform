// ==========================================
// TYPES — match the database tables 1:1
// ==========================================
// Field names are snake_case to match the column names
// directly (the way the Supabase client returns them).
// If you want camelCase in the frontend, map it in a
// layer between the API calls and the components.

// ---------- TIERS ----------
export interface Tier {
    id: number;
    title: string;
    tier_description: string | null;
    price: number;
    level_number: number;
    max_todos_per_day: number;
    max_future_days: number;
    max_custom_habits: number;
}

// ---------- USERS ----------
export type UserRole = "member" | "administrator";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string; // included for completeness, never expose in the UI
    role: UserRole;
    current_tier_id: number;
    created_at: string; // ISO timestamp
}

// ---------- PAYMENTS ----------
export interface Payment {
    id: number;
    user_id: number;
    tier_id: number;
    amount: number;
    payment_date: string; // ISO timestamp
}

// ---------- TODO LIST ----------
export interface TodoList {
    id: number;
    user_id: number;
    todo_date: string; // ISO date (YYYY-MM-DD)
    created_at: string; // ISO timestamp
}

// ---------- TASKS ----------
export interface Task {
    id: number;
    todo_list_id: number;
    task_title: string;
    task_description: string | null;
    created_at: string; // ISO timestamp
    is_completed: boolean;
}

// ---------- HABITS ----------
export interface Habit {
    id: number;
    habit_title: string;
    habit_description: string | null;
    created_by: number | null;
    created_at: string; // ISO timestamp
}

// ---------- USER HABITS ----------
export interface UserHabit {
    id: number;
    user_id: number;
    habit_id: number;
    is_recurring: boolean;
    recurrence_rule: string | null; // e.g. "DAILY", "WEEKLY", "MON,WED,FRI"
    is_active: boolean;
    created_at: string; // ISO timestamp
}

// ---------- SEMINARS ----------
export interface Seminar {
    id: number;
    seminar_title: string;
    seminar_description: string | null;
    seminar_date: string; // ISO timestamp
    tier_id: number;
    created_by: number | null;
    created_at: string; // ISO timestamp
}

// ---------- CalendarEvents ----------
export type CalendarEvent = {
    date: string;
    type: "task" | "seminar" | "habit";
    tierLevel?: number;
};

// ---------- Convenient "joined" helper types ----------
// Useful in React once you've already fetched and joined data,
// e.g. via a Supabase query with .select("*, tasks(*)").

export interface TodoListWithTasks extends TodoList {
    tasks: Task[];
}

export interface UserHabitWithDetails extends UserHabit {
    habit: Habit;
}

export interface UserWithTier extends User {
    tier: Tier;
}