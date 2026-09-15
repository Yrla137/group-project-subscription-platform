import express from "express";
// import requireAuth from "../middlewares/requireAuth";
// import requireAdmin from "../middlewares/requireAdmin";

import {
    getAllUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController}
    from "../controllers/usersController";

const router = express.Router();

// GET - gets all users from the database (only for admin)
router.get("/", getAllUsersController);

// GET id - gets a user with a specific id from the database (only for admin)
router.get("/:id", getUserByIdController);

// PATCH - update user information
router.patch("/:id", updateUserController);

// DELETE - delete a user (only admin)
router.delete("/:id", deleteUserController);

export default router;