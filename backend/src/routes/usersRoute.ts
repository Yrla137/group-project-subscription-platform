import express from "express";
import requireAuth from "../middlewares/requireAuth";
import requireAdmin from "../middlewares/requireAdmin";

import {
    getAllUsersController,
    getUserByIdController,
    getProfileController,
    updateUserController,
    deleteUserController}
    from "../controllers/usersController";

const router = express.Router();

// GET - gets all users from the database (only for admin)
router.get("/", requireAuth, requireAdmin, getAllUsersController);

// GET - gets the currently authenticated user's profile
router.get("/profile", requireAuth, getProfileController);

// GET id - gets a user with a specific id from the database (only for admin)
router.get("/:id", requireAuth, requireAdmin, getUserByIdController);

// PATCH - update user information
router.patch("/", requireAuth, updateUserController);

// DELETE - delete a user (only admin)
router.delete("/:id", requireAuth, requireAdmin, deleteUserController);

export default router;