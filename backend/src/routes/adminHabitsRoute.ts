import express from "express";
import requireAuth from "../middlewares/requireAuth";
import requireAdmin from "../middlewares/requireAdmin";

import {
    getDefaultHabitsController,
    getDefaultHabitByIdController,
    createDefaultHabitController,
    updateDefaultHabitController,
    deleteDefaultHabitController,
} from "../controllers/adminHabitsController";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/", getDefaultHabitsController);
router.get("/:id", getDefaultHabitByIdController);
router.post("/", createDefaultHabitController);
router.patch("/:id", updateDefaultHabitController);
router.delete("/:id", deleteDefaultHabitController);

export default router;