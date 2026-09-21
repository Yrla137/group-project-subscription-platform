// Task //
interface Task {
    id: number;
    user_id: number;
    task_title: string;
    task_description: string | null;
    task_date: string;
    is_completed: boolean;
    created_at: Date;
}

// Create Task //
interface CreateTask {
    user_id: number;
    task_title: string;
    task_description?: string;
    task_date: string;
    is_completed?: boolean;
}

// Update Task //
interface UpdateTask {
    task_title?: string;
    task_description?: string;
    task_date?: string;
    is_completed?: boolean;
}

// Används i create-formuläret
interface CreateTaskInput {
    user_id: number;
    task_title: string;
    task_description?: string;
    task_date: string;
    is_completed?: boolean;
}

export type { Task, CreateTask, UpdateTask, CreateTaskInput };