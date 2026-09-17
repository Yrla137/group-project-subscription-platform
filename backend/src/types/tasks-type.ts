interface Task {
    id: number;
    user_id: number;
    task_title: string;
    task_description: string | null;
    task_date: string; // METODO: Hur ska vi använda denna i frontend/backend?? Den står som date i databasen...? 
    is_completed: boolean;
    created_at: Date;
}

interface CreateTask {
    user_id: number;
    task_title: string;
    task_description?: string;
    task_date: string;
    is_completed?: boolean;
}

interface UpdateTask {
    task_title?: string;
    task_description?: string;
    task_date?: string;
    is_completed?: boolean;
}

export type { Task, CreateTask, UpdateTask };