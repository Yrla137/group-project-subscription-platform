import express from "express";
import requireAuth from "../middlewares/requireAuth";

import {
    getUserHabitsController,
    getUserHabitsForDateController,
    createUserHabitController,
    updateUserHabitController,
    deleteUserHabitController,
} from "../controllers/userHabitsController";

const router = express.Router();

// GET /today?date=YYYY-MM-DD - defaults to today if no date given
router.get("/today", requireAuth, getUserHabitsForDateController);

// GET - gets all active habits for the logged-in user
router.get("/", requireAuth, getUserHabitsController);

// POST - subscribe the logged-in user to a habit
router.post("/", requireAuth, createUserHabitController);

// PATCH - update a user's habit schedule/duration/active status
router.patch("/:id", requireAuth, updateUserHabitController);

// DELETE - remove a user's habit subscription
router.delete("/:id", requireAuth, deleteUserHabitController);

export default router;