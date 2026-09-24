import express from "express";
import requireAuth from "../middlewares/requireAuth";
import requireAdmin from "../middlewares/requireAdmin";

import {
    getAllPaymentsController,
    getMyPaymentsController,
    getPaymentsForUserController,
    getPaymentByIdController,
    createPaymentController}
    from "../controllers/paymentsController";

const router = express.Router();

// GET - gets all payments
router.get("/", requireAuth, requireAdmin, getAllPaymentsController);

// GET - get the logged-in user's payments
router.get("/my-payments", requireAuth, getMyPaymentsController);

// GET - get all payments for a specific user by user id (for admin)
router.get("/user/:userId", requireAuth, requireAdmin, getPaymentsForUserController);

// GET - get one payment by id (Only the owner of the payment or an administrator can access this with the if statement in the controller)
router.get("/:id", requireAuth, getPaymentByIdController);

// POST - create a new payment
router.post("/", requireAuth, createPaymentController);

export default router;