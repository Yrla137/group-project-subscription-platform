import * as seminarsService from "../services/seminarsService";
import type { Request, Response } from "express";

// POST - create a new seminar
export const createSeminarController = async (req: Request, res: Response) => {
    try {
        const newSeminar = await seminarsService.createSeminar(req.body);

        return res.status(201).json({
            message: "Seminar created successfully",
            data: newSeminar
        });
    } catch (error) {
        console.error("Create seminar error:", error);
        return res.status(500).json({
            message: "An error occurred while creating the seminar"
        });
    }
};

// GET - gets all seminars from the database
export const getAllSeminarsController = async (_req: Request, res: Response) => {
    try {
        const seminars = await seminarsService.getAllSeminars();

        return res.status(200).json({
            message: "Seminars fetched successfully",
            data: seminars
        });
    } catch (error) {
        console.error("Get all seminars error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching seminars"
        });
    }
};

// GET - gets all seminars matching the logged-in user's current_tier
export const getSeminarsByUserTierController = async (req: Request, res: Response) => {
    // TODO: byt ut mot req.user?.id när auth är på plats
    //const userId = 4;

    //const currentTier = await usersService.getUserTier(userId);
    const currentTier = "1";

    if (!currentTier) {
        return res.status(401).json({ message: "User not found or missing tier" });
    }

    const seminars = await seminarsService.getAllSeminars();

    return res.status(200).json({
        message: "Seminars fetched successfully",
        data: seminars
    });
};

// GET id - gets a seminar with a specific id from the database
export const getSeminarByIdController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid seminar ID" });
        }

        const seminar = await seminarsService.getSeminarById(id);
        if (!seminar) {
            return res.status(404).json({ message: "Seminar not found" });
        }
        return res.json(seminar);
    } catch (error) {
        console.error("Get seminar by ID error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the seminar"
        });
    }
};

// PATCH - update seminar information
export const updateSeminarController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid seminar ID" });
        }

        const updatedSeminar = await seminarsService.updateSeminar(
            id,
            req.body
        );

        if (!updatedSeminar) {
            return res.status(404).json({
                message: "Seminar could not be updated"
            });
        }

        return res.status(200).json({
            message: "Seminar updated successfully",
            data: updatedSeminar
        });
    } catch (error) {
        console.error("Update seminar error:", error);
        return res.status(500).json({
            message: "An error occurred while updating the seminar"
        });
    }
};

// DELETE - delete a seminar
export const deleteSeminarController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid seminar ID" });
        }

        const seminar = await seminarsService.getSeminarById(id);
        if (!seminar) {
            return res.status(404).json({ message: "Seminar not found" });
        }
        await seminarsService.deleteSeminar(id);
        return res.status(200).json({ message: "Seminar deleted successfully" });
    } catch (error) {
        console.error("Delete seminar error:", error);
        return res.status(500).json({
            message: "An error occurred while deleting the seminar"
        });
    }
};