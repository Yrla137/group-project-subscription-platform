import express from "express";
import {
    loginController,
    registerController
}
    from "../controllers/authController";

const router = express.Router();


// GET - just to check if the route is working (can be removed later)
router.get("/", (_req, res) => {
    return res.json({ message: "Auth route is working" });
});

// POST login - authenticates a user and returns a JWT token if the credentials are valid
router.post("/login", loginController);

// POST logout - logs out a user (this can be implemented on the frontend by simply deleting the token, so no need for a backend route later)
router.post("/logout", (_req, res) => {
  return res.json({ message: "Logged out" });
});

// POST register
router.post("/register", registerController);

export default router;