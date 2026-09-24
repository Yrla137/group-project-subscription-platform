import * as adminHabitsService from "../services/adminHabitsService";
import type { Request, Response } from "express";

export const getDefaultHabitsController = async (_req: Request, res: Response) => {
    const habits = await adminHabitsService.getDefaultHabits();
    return res.status(200).json({ message: "Habits fetched successfully", data: habits });
};

export const getDefaultHabitByIdController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const habit = await adminHabitsService.getDefaultHabitById(id);

    if (!habit) return res.status(404).json({ message: "Habit not found" });
    return res.json(habit);
};

export const createDefaultHabitController = async (req: Request, res: Response) => {
    const newHabit = await adminHabitsService.createDefaultHabit(req.body);
    return res.status(201).json({ message: "Habit created successfully", data: newHabit });
};

export const updateDefaultHabitController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updatedHabit = await adminHabitsService.updateDefaultHabit(id, req.body);

    if (!updatedHabit) return res.status(404).json({ message: "Habit not found" });
    return res.status(200).json({ message: "Habit updated successfully", data: updatedHabit });
};

export const deleteDefaultHabitController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await adminHabitsService.deleteDefaultHabit(id);

    if (!deleted) return res.status(404).json({ message: "Habit not found" });
    return res.status(200).json({ message: "Habit deleted successfully" });
};