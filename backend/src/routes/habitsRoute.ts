import express from "express";
import requireAuth from "../middlewares/requireAuth";

import {
    getMyHabitsController,
    getMyHabitByIdController,
    createHabitController,
    updateHabitController,
    deleteHabitController,
} from "../controllers/habitsController";

const router = express.Router();

// GET - gets all habits from the user's catalog
router.get("/", requireAuth, getMyHabitsController);

// GET id - gets a habit with a specific id
router.get("/:id", requireAuth, getMyHabitByIdController);

// POST - create a new habit
router.post("/", requireAuth, createHabitController);

// PATCH - update habit information
router.patch("/:id", requireAuth, updateHabitController);

// DELETE - remove a habit
router.delete("/:id", requireAuth, deleteHabitController);

export default router;