import * as seminarsService from "../services/seminarsService";
import type { Request, Response } from "express";

// POST - create a new seminar
export const createSeminarController = async (req: Request, res: Response) => {
    const newSeminar = await seminarsService.createSeminar(req.body);

    return res.status(201).json({
        message: "Seminar created successfully",
        data: newSeminar
    });
};

// GET - gets all seminars from the database
export const getAllSeminarsController = async (_req: Request, res: Response) => {
    const seminars = await seminarsService.getAllSeminars();

    return res.status(200).json({
        message: "Seminars fetched successfully",
        data: seminars
    });
};

// GET - gets all seminars matching the logged-in user's current_tier
export const getSeminarsByUserTierController = async (req: Request, res: Response) => {
  
    //const currentTier = req.user?.current_tier;
    const currentTier = "1";

    if (!currentTier) {
        return res.status(401).json({ message: "User not authenticated or missing tier" });
    }

    const seminars = await seminarsService.getSeminarsByTier(currentTier);

    return res.status(200).json({
        message: "Seminars fetched successfully",
        data: seminars
    });
};

// GET id - gets a seminar with a specific id from the database
export const getSeminarByIdController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const seminar = await seminarsService.getSeminarById(id);
    if (!seminar) {
        return res.status(404).json({ message: "Seminar not found" });
    }
    return res.json(seminar);
};

// PATCH - update seminar information
export const updateSeminarController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
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
};

// DELETE - delete a seminar
export const deleteSeminarController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const seminar = await seminarsService.getSeminarById(id);
    if (!seminar) {
        return res.status(404).json({ message: "Seminar not found" });
    }
    await seminarsService.deleteSeminar(id);
    return res.status(200).json({ message: "Seminar deleted successfully" });
};