import express from "express";
import requireAuth from "../middlewares/requireAuth";
import requireAdmin from "../middlewares/requireAdmin";

import {
    createSeminarController,
    getAllSeminarsController,
    getSeminarByIdController,
    updateSeminarController,
    deleteSeminarController
}
    from "../controllers/seminarsController";

const router = express.Router();

// POST - create a new seminar
router.post("/", requireAdmin, createSeminarController);

// GET - gets all seminars from the database
router.get("/", getAllSeminarsController);

// GET id - gets a seminar with a specific id from the database
router.get("/:id", getSeminarByIdController);

// PATCH - update seminar information
router.patch("/:id", requireAdmin, updateSeminarController);

// DELETE - delete a seminar
router.delete("/:id", requireAdmin, deleteSeminarController);

export default router;