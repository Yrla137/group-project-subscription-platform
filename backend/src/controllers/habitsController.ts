import * as habitsService from "../services/habitsService";
import type { Request, Response } from "express";

export const getMyHabitsController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const habits = await habitsService.getMyHabits(user_id);

    return res.status(200).json({ message: "Habits fetched successfully", data: habits });
};

export const getMyHabitByIdController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const id = Number(req.params.id);
    const habit = await habitsService.getMyHabitById(id, user_id);

    if (!habit) return res.status(404).json({ message: "Habit not found" });
    return res.json(habit);
};

export const createHabitController = async (req: Request, res: Response) => {

    console.log(req.user);
    
    const { user_id } = req.user!;

    const newHabit = await habitsService.createHabit(req.body, user_id);

    return res.status(201).json({ message: "Habit created successfully", data: newHabit });
};

export const updateHabitController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const id = Number(req.params.id);
    const updatedHabit = await habitsService.updateHabit(id, req.body, user_id);

    if (!updatedHabit) {
        return res.status(403).json({ message: "You don't have permission to edit this habit" });
    }

    return res.status(200).json({ message: "Habit updated successfully", data: updatedHabit });
};

export const deleteHabitController = async (req: Request, res: Response) => {
    const { user_id } = req.user!;
    const id = Number(req.params.id);
    const deleted = await habitsService.deleteHabit(id, user_id);

    if (!deleted) {
        return res.status(403).json({ message: "You don't have permission to delete this habit" });
    }

    return res.status(200).json({ message: "Habit deleted successfully" });
};