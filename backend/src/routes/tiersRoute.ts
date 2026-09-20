import express from "express";
import requireAuth from "../middlewares/requireAuth";
import requireAdmin from "../middlewares/requireAdmin";

import {
    getAllTiersController,
    getTierByIdController,
    createTierController,
    updateTierController,
    deleteTierController}
    from "../controllers/tiersController";

const router = express.Router();

// GET - gets all tiers from the database
router.get("/", requireAuth, getAllTiersController);

// GET - get one tier by id from the database
router.get("/:id", requireAuth, getTierByIdController);

// POST - create a new tier in the database
router.post("/", requireAuth, requireAdmin, createTierController);

// PATCH - update tier information
router.patch("/:id", requireAuth, requireAdmin, updateTierController);

// DELETE - remove a tier from the database (Will probably not be used in frontend for easy access)
router.delete("/:id", requireAuth, requireAdmin, deleteTierController);

export default router;