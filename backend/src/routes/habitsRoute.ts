import express from "express";
// import requireAuth from "../middlewares/requireAuth";
// import requireAdmin from "../middlewares/requireAdmin";

import {
    getAllHabitsController,
    getHabitByIdController,
    createHabitController,
    updateHabitController,
    deleteHabitController,
} from "../controllers/habitsController";

const router = express.Router();

// GET - gets all habits from the catalog
router.get("/", getAllHabitsController);

// GET id - gets a habit with a specific id
router.get("/:id", getHabitByIdController);

// POST - create a new habit
router.post("/", createHabitController);

// PATCH - update habit information
router.patch("/:id", updateHabitController);

// DELETE - remove a habit
router.delete("/:id", deleteHabitController);

export default router;