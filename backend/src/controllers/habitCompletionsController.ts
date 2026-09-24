import * as habitCompletionsService from "../services/habitCompletionsService";
import type { Request, Response } from "express";

// GET - gets completions for a given date (defaults to today)
export const getCompletionsForDateController = async (req: Request, res: Response) => {
    const userId = req.user!.user_id;
    const date = typeof req.query.date === "string" ? req.query.date : new Date().toISOString().slice(0, 10);

    const completions = await habitCompletionsService.getCompletionsForDate(userId, date);

    return res.status(200).json({
        message: "Habit completions fetched successfully",
        data: completions,
    });
};

// POST - check off a habit
export const createCompletionController = async (req: Request, res: Response) => {
    const userId = req.user!.user_id;

    const newCompletion = await habitCompletionsService.createCompletion(userId, req.body);

    if (!newCompletion) {
        return res.status(403).json({ message: "You don't have access to this habit" });
    }

    return res.status(201).json({
        message: "Habit checked off successfully",
        data: newCompletion,
    });
};

// DELETE - undo a check-off
export const deleteCompletionController = async (req: Request, res: Response) => {
    const userId = req.user!.user_id;
    const userHabitId = Number(req.params.userHabitId);
    const date = typeof req.query.date === "string" ? req.query.date : new Date().toISOString().slice(0, 10);

    await habitCompletionsService.deleteCompletion(userId, userHabitId, date);
    return res.status(200).json({ message: "Habit completion removed successfully" });
};