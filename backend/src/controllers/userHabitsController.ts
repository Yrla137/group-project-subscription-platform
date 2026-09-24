import * as userHabitsService from "../services/userHabitsService";
import type { Request, Response } from "express";

// GET - gets all active habits for the logged-in user
export const getUserHabitsController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;

    const userHabits = await userHabitsService.getUserHabits(user_id);

    return res.status(200).json({
        message: "User habits fetched successfully",
        data: userHabits,
    });
};

// GET - gets today's (or a given date's) scheduled habits for the logged-in user
export const getUserHabitsForDateController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const date = typeof req.query.date === "string" ? req.query.date : new Date().toISOString().slice(0, 10);

    const userHabits = await userHabitsService.getUserHabitsForDate(user_id, date);

    return res.status(200).json({
        message: "User habits fetched successfully",
        data: userHabits,
    });
};

// POST - subscribe the logged-in user to a habit
export const createUserHabitController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;

    const newUserHabit = await userHabitsService.createUserHabit({ ...req.body, user_id });

    return res.status(201).json({
        message: "Habit added successfully",
        data: newUserHabit,
    });
};

// PATCH - update a user's habit schedule/duration/active status
// Scoped so a user can only update their own user_habits
export const updateUserHabitController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const id = Number(req.params.id);

    const updatedUserHabit = await userHabitsService.updateUserHabit(id, req.body, user_id);

    if (!updatedUserHabit) {
        return res.status(404).json({ message: "User habit could not be updated" });
    }

    return res.status(200).json({
        message: "User habit updated successfully",
        data: updatedUserHabit,
    });
};

// DELETE - remove a user's habit subscription
// Scoped so a user can only delete their own user_habits
export const deleteUserHabitController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const id = Number(req.params.id);

    const deleted = await userHabitsService.deleteUserHabit(id, user_id);

    if (!deleted) {
        return res.status(404).json({ message: "User habit could not be deleted" });
    }

    return res.status(200).json({ message: "User habit removed successfully" });
};