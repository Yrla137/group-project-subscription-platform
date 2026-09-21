import express from "express";
// import requireAuth from "../middlewares/requireAuth";

import {
    getCompletionsForDateController,
    createCompletionController,
    deleteCompletionController,
} from "../controllers/habitCompletionsController";

const router = express.Router();

// GET ?date=YYYY-MM-DD - defaults to today if no date given
router.get("/", getCompletionsForDateController);

// POST - check off a habit
router.post("/", createCompletionController);

// DELETE /:userHabitId?date=YYYY-MM-DD - undo a check-off
router.delete("/:userHabitId", deleteCompletionController);

export default router;