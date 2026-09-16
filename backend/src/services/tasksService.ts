import { pool } from "../config/db";
import type { CreateTask, UpdateTask } from "../types/tasks-type";

export const getAllTasks = async () => {
 const result = await pool.query("SELECT * FROM tasks");
 return result.rows;   
};

export const getTaskById = async (id: number) => {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    return result.rows[0];
};

export const createTask = async (taskData: CreateTask) => {
    const { user_id, task_title, task_description, is_completed } = taskData;
    const result = await pool.query(
        "INSERT INTO tasks (user_id, task_title, task_description, is_completed) VALUES ($1, 2$, 3$, 4$) RETURNING *",
        [user_id, task_title, task_description || null, is_completed || false]
    );
    return result.rows[0];
};

export const updateTask = async (id: number, taskData: UpdateTask) => {
    const { task_title, task_description, task_date, is_completed } = taskData;
    const result = await pool.query(
        "UPDATE tasks SET task_title= COALESCE($1, task_title), task_description = COALESCE(2$, task_description), task_date = COALESCE($3, is_completed), is_completed = COALESCE($4, is_completed) WHERE id = $5 RETURNING *",
        [task_title, task_description, task_date, is_completed, id]
    );
    return result.rows[0];
};

export const deleteTask = async (id: number) => {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
};
