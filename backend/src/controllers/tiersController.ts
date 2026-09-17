import * as tiersService from "../services/tiersService";
import { createTierSchema, updateTierSchema } from "../schemas/tiersSchema";
import type { Request, Response } from "express";
import type { DatabaseError } from "pg";

// GET - gets all tiers from the database
export const getAllTiersController = async (_req: Request, res: Response) => {

    try {
        const tiers = await tiersService.getAllTiers();
        return res.status(200).json({
            message: "Tiers fetched successfully",
            data: tiers
        });
    } catch (error) {
        console.error("Get all tiers error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching tiers"
        });
    }
};

// GET - get one tier by id from the database
export const getTierByIdController = async (req: Request, res: Response) => {

    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({message: "Invalid tier ID"});
        }
        const tier = await tiersService.getTierById(id);
        if(!tier){
            return res.status(404).json({message: "Tier not found"});
        }
        return res.status(200).json({
            message: "Tier fetched successfully",
            data: tier
        });
    } catch (error) {
        console.error("Get tier by ID error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the tier"
        });
    }
};

// POST - create a new tier in the database
export const createTierController = async (req: Request, res: Response) => {

    try {
        const result = createTierSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input data",
                errors: result.error
            });
        }
        const tier = await tiersService.createTier(result.data);
        return res.status(201).json({
            message: "Tier created successfully",
            data: tier
        });
    } catch (error) {
        const dbError = error as DatabaseError;

        if (dbError.code === "23505") {
            return res.status(409).json({
                message: "A tier with this title or level number already exists"
            });
        }

        console.error("Create tier error:", error);

        return res.status(500).json({
            message: "An error occurred while creating the tier"
        });
    }
};

// PATCH - update tier information
export const updateTierController = async (req: Request, res: Response) => {

    try {

        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({message: "Invalid tier ID"});
        }

        const result = updateTierSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input data",
                errors: result.error
            });
        }

        const updatedTier = await tiersService.updateTier(id, result.data);

        if (!updatedTier) {
            return res.status(404).json({message: "Tier not found"});
        }

        return res.status(200).json({
            message: "Tier updated successfully",
            data: updatedTier
        });
    } catch (error) {
        const dbError = error as DatabaseError;

        if (dbError.code === "23505") {
            return res.status(409).json({
                message: "A tier with this title or level number already exists"
            });
        }

        console.error("Update tier error:", error);

        return res.status(500).json({
            message: "An error occurred while updating the tier"
        });
    }
};

// DELETE - remove a tier from the database (Will probably not be used in frontend for easy access)
export const deleteTierController = async (req: Request, res: Response) => {

    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({message: "Invalid tier ID"});
        }
        const tier = await tiersService.getTierById(id);
        if(!tier){
            return res.status(404).json({message: "Tier not found"});
        }
        await tiersService.deleteTier(id);
        return res.status(200).json({
            message: "Tier deleted successfully"
        });
    } catch (error) {
        const dbError = error as DatabaseError;

        if (dbError.code === "23503") {
            return res.status(409).json({
                message: "Tier cannot be deleted because it is currently in use"
            });
        }
        console.error("Delete tier error:", error);
        return res.status(500).json({
            message: "An error occurred while deleting the tier"
        });
    }
};