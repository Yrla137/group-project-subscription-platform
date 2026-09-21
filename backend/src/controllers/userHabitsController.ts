import * as userHabitsService from "../services/userHabitsService";
import type { Request, Response } from "express";

// GET - gets all active habits for the logged-in user
export const getUserHabitsController = async (req: Request, res: Response) => {
    // TODO: swap for req.user?.id once auth is in place
    const userId = 4;

    const userHabits = await userHabitsService.getUserHabits(userId);

    return res.status(200).json({
        message: "User habits fetched successfully",
        data: userHabits,
    });
};

// GET - gets today's (or a given date's) scheduled habits for the logged-in user
export const getUserHabitsForDateController = async (req: Request, res: Response) => {
    // TODO: swap for req.user?.id once auth is in place
    const userId = 4;
    const date = typeof req.query.date === "string" ? req.query.date : new Date().toISOString().slice(0, 10);

    const userHabits = await userHabitsService.getUserHabitsForDate(userId, date);

    return res.status(200).json({
        message: "User habits fetched successfully",
        data: userHabits,
    });
};

// POST - subscribe the logged-in user to a habit
export const createUserHabitController = async (req: Request, res: Response) => {
    // TODO: swap for req.user?.id once auth is in place
    const userId = 4;

    const newUserHabit = await userHabitsService.createUserHabit({ ...req.body, user_id: userId });

    return res.status(201).json({
        message: "Habit added successfully",
        data: newUserHabit,
    });
};

// PATCH - update a user's habit schedule/duration/active status
export const updateUserHabitController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updatedUserHabit = await userHabitsService.updateUserHabit(id, req.body);

    if (!updatedUserHabit) {
        return res.status(404).json({ message: "User habit could not be updated" });
    }

    return res.status(200).json({
        message: "User habit updated successfully",
        data: updatedUserHabit,
    });
};

// DELETE - remove a user's habit subscription
export const deleteUserHabitController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await userHabitsService.deleteUserHabit(id);
    return res.status(200).json({ message: "User habit removed successfully" });
};