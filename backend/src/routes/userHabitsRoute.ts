import express from "express";
// import requireAuth from "../middlewares/requireAuth";

import {
    getUserHabitsController,
    getUserHabitsForDateController,
    createUserHabitController,
    updateUserHabitController,
    deleteUserHabitController,
} from "../controllers/userHabitsController";

const router = express.Router();

// GET /today?date=YYYY-MM-DD - defaults to today if no date given
router.get("/today", getUserHabitsForDateController);

// GET - gets all active habits for the logged-in user
router.get("/", getUserHabitsController);

// POST - subscribe the logged-in user to a habit
router.post("/", createUserHabitController);

// PATCH - update a user's habit schedule/duration/active status
router.patch("/:id", updateUserHabitController);

// DELETE - remove a user's habit subscription
router.delete("/:id", deleteUserHabitController);

export default router;