import express from "express";
// import requireAuth from "../middlewares/requireAuth";
// import requireAdmin from "../middlewares/requireAdmin";

import {
    getAllTasksController,
    getTaskByIdController,
    createTaskController,
    updateTaskController,
    deleteTaskController}
    from "../controllers/tasksController";

const router = express.Router();


// GET - gets all tasks from the database
router.get("/", getAllTasksController);

// GET id - gets a task with a specific id from the database 
router.get("/:id", getTaskByIdController);

// POST - posts a new task
router.post("/", createTaskController);

// PATCH - update task information
router.patch("/:id", updateTaskController);

// DELETE - delete a task
router.delete("/:id", deleteTaskController);

export default router;