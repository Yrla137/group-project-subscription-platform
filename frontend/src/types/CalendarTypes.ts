// ==========================================
// TYPES — matchar databastabellerna 1:1
// ==========================================
// Fältnamnen är snake_case för att matcha kolumnnamnen
// rakt av (så som Supabase-klienten returnerar dem).
// Vill ni ha camelCase i frontend kan ni mappa om det
// i ett lager mellan API-anrop och komponenter.

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
    password_hash: string; // finns i typen för fullständighet, exponera aldrig i UI
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
    recurrence_rule: string | null; // t.ex. "DAILY", "WEEKLY", "MON,WED,FRI"
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
    id: number;
    title: string;
    date: string; // ISO date string
    type: "task" | "seminar";
};

// ---------- Praktiska "joined" hjälptyper ----------
// Användbara i React när ni redan har hämtat och kopplat ihop data,
// t.ex. via en Supabase-query med .select("*, tasks(*)").

export interface TodoListWithTasks extends TodoList {
    tasks: Task[];
}

export interface UserHabitWithDetails extends UserHabit {
    habit: Habit;
}

export interface UserWithTier extends User {
    tier: Tier;
}