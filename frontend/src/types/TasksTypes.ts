// Task //
interface Task {
    id: number;
    user_id: number;
    task_title: string;
    task_description: string | null;
    task_date: string;
    is_completed: boolean;
    created_at: Date;
    color?: string;
}

// Create Task //
interface CreateTask {
    user_id: number;
    task_title: string;
    task_description?: string;
    task_date: string;
    is_completed?: boolean;
    color?: string;
}

// Update Task //
interface UpdateTask {
    task_title?: string;
    task_description?: string;
    task_date?: string;
    is_completed?: boolean;
    color?: string;
}

// Används i create-formuläret
interface CreateTaskInput {
    user_id: number;
    task_title: string;
    task_description?: string;
    task_date: string;
    is_completed?: boolean;
    color: string;
}

export type { Task, CreateTask, UpdateTask, CreateTaskInput };