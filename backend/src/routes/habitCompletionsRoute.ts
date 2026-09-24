import express from "express";
import requireAuth from "../middlewares/requireAuth";

import {
    getCompletionsForDateController,
    createCompletionController,
    deleteCompletionController,
} from "../controllers/habitCompletionsController";

const router = express.Router();

// GET ?date=YYYY-MM-DD - defaults to today if no date given
router.get("/", requireAuth, getCompletionsForDateController);

// POST - check off a habit
router.post("/", requireAuth, createCompletionController);

// DELETE /:userHabitId?date=YYYY-MM-DD - undo a check-off
router.delete("/:userHabitId", requireAuth, deleteCompletionController);

export default router;