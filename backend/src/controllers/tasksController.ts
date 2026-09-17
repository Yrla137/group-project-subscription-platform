import * as tasksService from "../services/tasksService";
import type { Request, Response } from "express";

// POST - create a new task
export const createTaskController = async (req: Request, res: Response) => {
    const newTask = await tasksService.createTask(req.body);

    return res.status(201).json({
        message: "Task created successfully",
        data: newTask
    });
};

// GET - gets all tasks from the database
export const getAllTasksController = async (_req: Request, res: Response) => {
    const tasks = await tasksService.getAllTasks();

    return res.status(200).json({
        message: "Tasks fetched successfully",
        data: tasks
    });
};

// GET id - gets a task with a specific id from the database
export const getTaskByIdController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const task = await tasksService.getTaskById(id);
    if(!task){
        return res.status(404).json({message: "Task not found"});
    }
        return res.json(task);
};

// PATCH - update task information
export const updateTaskController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updatedTasks = await tasksService.updateTask(
        id,
        req.body
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
    const id = Number(req.params.id);
    const tasks = await tasksService.getTaskById(id);
    if(!tasks){
        return res.status(404).json({message: "Tasks not found"});
    }
    await tasksService.deleteTask(id);
    return res.status(200).json({message: "Task deleted successfully"});
};