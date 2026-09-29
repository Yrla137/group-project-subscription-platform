import * as habitCompletionsService from "../services/habitCompletionsService";
import type { Request, Response } from "express";

// Falls back to today in the app's time zone, not the server's UTC date
function getDateParam(req: Request): string {
    return typeof req.query.date === "string" ? req.query.date : habitCompletionsService.todayInAppTimeZone();
}

// GET - gets completions for a given date (defaults to today)
export const getCompletionsForDateController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const completions = await habitCompletionsService.getCompletionsForDate(userId, getDateParam(req));

        return res.status(200).json({
            message: "Habit completions fetched successfully",
            data: completions,
        });
    } catch (error) {
        console.error("Get completions error:", error);
        return res.status(500).json({ message: "An error occurred while fetching habit completions" });
    }
};

// POST - check off a habit
export const createCompletionController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const newCompletion = await habitCompletionsService.createCompletion(userId, req.body);

        if (!newCompletion) {
            return res.status(403).json({ message: "You don't have access to this habit" });
        }

        return res.status(201).json({
            message: "Habit checked off successfully",
            data: newCompletion,
        });
    } catch (error) {
        // A future date or a malformed date is the client's mistake, not a server error
        if (error instanceof habitCompletionsService.InvalidCompletionDateError) {
            return res.status(400).json({ message: error.message });
        }

        console.error("Create completion error:", error);
        return res.status(500).json({ message: "An error occurred while completing the habit" });
    }
};

// DELETE - undo a check-off
export const deleteCompletionController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const userHabitId = Number(req.params.userHabitId);

        if (Number.isNaN(userHabitId)) {
            return res.status(400).json({ message: "Invalid habit ID" });
        }

        await habitCompletionsService.deleteCompletion(userId, userHabitId, getDateParam(req));
        return res.status(200).json({ message: "Habit completion removed successfully" });
    } catch (error) {
        console.error("Delete completion error:", error);
        return res.status(500).json({ message: "An error occurred while removing the habit completion" });
    }
};