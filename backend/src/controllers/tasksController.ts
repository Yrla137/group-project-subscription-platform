import * as tasksService from "../services/tasksService";
import type { Request, Response } from "express";

// POST - create a new task
export const createTaskController = async (req: Request, res: Response) => {
    try {    
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

    const newTask = await tasksService.createTask(req.body, userId);

    return res.status(201).json({
        message: "Task created successfully",
        data: newTask
    });
    } catch (err: any) {
        console.error("🚨 DETALJERAT FEL VID SKAPANDE AV TASK:", err);
        
        if (err.name === "TaskLimitReachedError") {
                return res.status(403).json({
                    message: err.message,
                    limit: err.limit
            });
        }
        return res.status(500).json({ message: err.message || "Internal server error" });
    }
};

// GET - gets all tasks from the database
export const getAllTasksController = async (req: Request, res: Response) => {
    console.log("🔥 ANROPET NÅDDE HIT! getAllTasksController körs!");

    const userId = req.user?.user_id;
    console.log("🔍 Användar-ID från token:", userId);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const tasks = await tasksService.getAllTasks(userId);
    console.log("📦 HÄMTADE TASKS FÖR USER:", tasks);

    return res.status(200).json({
        message: "Tasks fetched successfully",
        data: tasks
    });
};

// GET id - gets a task with a specific id from the database
export const getTaskByIdController = async (req: Request, res: Response) => {
    const userId = req.user?.user_id;
    console.log("🔍 INLOGGAD ANVÄNDARE ID:", userId);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const id = Number(req.params.id);
    const task = await tasksService.getTaskById(id, userId);
    if(!task){
        return res.status(404).json({message: "Task not found"});
    }
        return res.json(task);
};

// PATCH - update task information
export const updateTaskController = async (req: Request, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const id = Number(req.params.id);
    const updatedTasks = await tasksService.updateTask(
        id,
        req.body,
        userId
    );

    if (!updatedTasks) {
        return res.status(404).json({
            message: "Tasks could not be updated"
        });
    }

    return res.status(200).json({
        message: "Tasks updated successfully"
    });
};

// DELETE - delete a task
export const deleteTaskController = async (req: Request, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const id = Number(req.params.id);
    const tasks = await tasksService.getTaskById(id, userId);
    if(!tasks){
        return res.status(404).json({message: "Tasks not found"});
    }
    await tasksService.deleteTask(id, userId);
    return res.status(200).json({message: "Task deleted successfully"});
};