import express from "express";
import {
    loginController,
    registerController}
    from "../controllers/authController";

const router = express.Router();

// GET - just to check if the route is working in testing (Will not be used in production)
router.get("/", (_req, res) => {
    return res.json({ message: "Auth route is working" });
});

// POST login
router.post("/login", loginController);

// POST register
router.post("/register", registerController);

export default router;