import * as habitCompletionsService from "../services/habitCompletionsService";
import type { Request, Response } from "express";

// GET - gets completions for a given date (defaults to today)
export const getCompletionsForDateController = async (req: Request, res: Response) => {
    // TODO: swap for req.user?.id once auth is in place
    const userId = 4;
    const date = typeof req.query.date === "string" ? req.query.date : new Date().toISOString().slice(0, 10);

    const completions = await habitCompletionsService.getCompletionsForDate(userId, date);

    return res.status(200).json({
        message: "Habit completions fetched successfully",
        data: completions,
    });
};

// POST - check off a habit
export const createCompletionController = async (req: Request, res: Response) => {
    const newCompletion = await habitCompletionsService.createCompletion(req.body);

    return res.status(201).json({
        message: "Habit checked off successfully",
        data: newCompletion,
    });
};

// DELETE - undo a check-off
export const deleteCompletionController = async (req: Request, res: Response) => {
    const userHabitId = Number(req.params.userHabitId);
    const date = typeof req.query.date === "string" ? req.query.date : new Date().toISOString().slice(0, 10);

    await habitCompletionsService.deleteCompletion(userHabitId, date);
    return res.status(200).json({ message: "Habit completion removed successfully" });
};