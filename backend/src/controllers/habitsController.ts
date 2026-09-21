import * as habitsService from "../services/habitsService";
import type { Request, Response } from "express";

// GET - gets all habits from the catalog
export const getAllHabitsController = async (_req: Request, res: Response) => {
    const habits = await habitsService.getAllHabits();

    return res.status(200).json({
        message: "Habits fetched successfully",
        data: habits,
    });
};

// GET id - gets a habit with a specific id
export const getHabitByIdController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const habit = await habitsService.getHabitById(id);

    if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
    }

    return res.json(habit);
};

// POST - create a new habit
export const createHabitController = async (req: Request, res: Response) => {
    const newHabit = await habitsService.createHabit(req.body);

    return res.status(201).json({
        message: "Habit created successfully",
        data: newHabit,
    });
};

// PATCH - update habit information
export const updateHabitController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updatedHabit = await habitsService.updateHabit(id, req.body);

    if (!updatedHabit) {
        return res.status(404).json({ message: "Habit could not be updated" });
    }

    return res.status(200).json({
        message: "Habit updated successfully",
        data: updatedHabit,
    });
};

// DELETE - remove a habit
export const deleteHabitController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const habit = await habitsService.getHabitById(id);

    if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
    }

    await habitsService.deleteHabit(id);
    return res.status(200).json({ message: "Habit deleted successfully" });
};