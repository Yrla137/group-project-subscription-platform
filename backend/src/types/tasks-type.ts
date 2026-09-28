interface Task {
    id: number;
    user_id: number;
    task_title: string;
    task_description: string | null;
    task_date: string; // METODO: Hur ska vi använda denna i frontend/backend?? Den står som date i databasen...? 
    is_completed: boolean;
    created_at: Date;
    color?: string;
}

interface CreateTask {
    user_id: number;
    task_title: string;
    task_description?: string;
    task_date: string;
    is_completed?: boolean;
    color?: string;
}

interface UpdateTask {
    task_title?: string;
    task_description?: string;
    task_date?: string;
    is_completed?: boolean;
    color?: string;
}

export type { Task, CreateTask, UpdateTask };