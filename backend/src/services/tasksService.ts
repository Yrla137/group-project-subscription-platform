import { pool } from "../config/db";
import type { CreateTask, UpdateTask } from "../types/tasks-type";

const DEFAULT_MAX_TODOS_PER_DAY = 5;

export class TaskLimitReachedError extends Error {
    constructor(public readonly limit: number) {
        super(`Your current plan allows at most ${limit} tasks per day`);
        this.name = "TaskLimitReachedError";
    }
} 

export const getAllTasks = async (userId: number) => {
 const result = await pool.query("SELECT id, user_id, task_title, task_description, TO_CHAR(task_date, 'YYYY-MM-DD') AS task_date, is_completed, color FROM tasks WHERE user_id = $1", [userId]);
 return result.rows;   
};

export const getTaskById = async (id: number, userId: number) => {
    const result = await pool.query("SELECT id, user_id, task_title, task_description, TO_CHAR(task_date, 'YYYY-MM-DD') AS task_date, is_completed, color FROM tasks WHERE id = $1 AND user_id = $2", [id, userId]);
    return result.rows[0];
};

export const createTask = async (taskData: CreateTask, userId: number) => {

    const { task_title, task_description, task_date, is_completed, color } = taskData;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const limitResult = await client.query<{ max_todos_per_day: number | null }>(
            `SELECT t.max_todos_per_day
             FROM users u
             LEFT JOIN tiers t ON t.id = u.current_tier_id
             WHERE u.id = $1
             FOR UPDATE OF u`,
            [userId]
        );

        const maxTasksPerDay = limitResult.rows[0]?.max_todos_per_day ?? DEFAULT_MAX_TODOS_PER_DAY;

        const countResult = await client.query<{ count: number }>(
            "SELECT COUNT(*)::int AS count FROM tasks WHERE user_id = $1 AND task_date = $2",
            [userId, task_date]
        );

        if (countResult.rows[0].count >= maxTasksPerDay) {
            throw new TaskLimitReachedError(maxTasksPerDay);
        }


        const result = await client.query(
            "INSERT INTO tasks (user_id, task_title, task_description, task_date, is_completed, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id, task_title, task_description, TO_CHAR(task_date, 'YYYY-MM-DD') AS task_date, is_completed, color",
            [userId, task_title, task_description || null, task_date, is_completed || false, color || 'coral']
        
    );

    await client.query("COMMIT");
        return result.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const updateTask = async (id: number, taskData: UpdateTask, userId: number) => {
    const { task_title, task_description, task_date, is_completed, color } = taskData;
    const result = await pool.query(
        "UPDATE tasks SET task_title= COALESCE($1, task_title), task_description = COALESCE($2, task_description), task_date = COALESCE($3, task_date), is_completed = COALESCE($4, is_completed), color= COALESCE($5, color) WHERE id = $6 AND user_id = $7 RETURNING id, user_id, task_title, task_description, TO_CHAR(task_date, 'YYYY-MM-DD') AS task_date, is_completed, color",
        [task_title, task_description, task_date, is_completed, color, id, userId]
    );
    return result.rows[0];
};

export const deleteTask = async (id: number, userId: number) => {
    await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [id, userId]);
};
