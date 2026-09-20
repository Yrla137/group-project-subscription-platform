import express from "express";
import requireAuth from "../middlewares/requireAuth";
import requireAdmin from "../middlewares/requireAdmin";

import {
    getAllPaymentsController,
    getPaymentByIdController,
    createPaymentController}
    from "../controllers/paymentsController";

const router = express.Router();

// GET - gets all payments
router.get("/", requireAuth, requireAdmin, getAllPaymentsController);

// GET - get one payment by id (Only the owner of the payment or an administrator can access this with the if statement in the controller)
router.get("/:id", requireAuth, getPaymentByIdController);

// POST - create a new payment
router.post("/", requireAuth, createPaymentController);

export default router;