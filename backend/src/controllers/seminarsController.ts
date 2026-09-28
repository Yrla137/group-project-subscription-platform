import * as seminarsService from "../services/seminarsService";
import type { Request, Response } from "express";

// POST - create a new seminar (administrators only)
export const createSeminarController = async (req: Request, res: Response) => {
    try {
        const { user_id } = req.user!;

        const newSeminar = await seminarsService.createSeminar({ ...req.body, created_by: user_id });

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
export const getSeminarsController = async (_req: Request, res: Response) => {
    try {

        const { user_id } = _req.user!;
        const seminars = await seminarsService.getSeminars(user_id);

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

export const getSeminarByIdController = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid seminar ID" });
        }

        const { user_id, role } = req.user!;
        const seminar = await seminarsService.getSeminarForUser(id, user_id);

        if (!seminar) {
            return res.status(404).json({ message: "Seminar not found" });
        }

        // Admins can always open seminars, e.g. to check them before they go live
        if (seminar.is_locked && role !== "administrator") {
            return res.status(403).json({
                message: `This seminar is included in ${seminar.tier_title}`,
                code: "SEMINAR_LOCKED",
                tier_title: seminar.tier_title,
            });
        }

        return res.json(seminar);
    } catch (error) {
        console.error("Get seminar by ID error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the seminar",
        });
    }
};

// PATCH - update seminar information (administrators only)
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

// DELETE - delete a seminar (administrators only)
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