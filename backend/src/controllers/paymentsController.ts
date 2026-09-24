import * as paymentsService from "../services/paymentsService";
import { createPaymentSchema } from "../schemas/paymentsSchema";
import type { Request, Response } from "express";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// GET - gets all payments
export const getAllPaymentsController = async (_req: Request, res: Response) => {

    try {
        const payments = await paymentsService.getAllPayments();
        return res.status(200).json({
            message: "Payments fetched successfully",
            data: payments
        });
    } catch (error) {
        console.error("Get all payments error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching payments"
        });
    }
};

// GET - get payment by id
export const getPaymentByIdController = async (req: Request, res: Response) => {

    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({message: "Invalid payment ID"});
        }

        const payment = await paymentsService.getPaymentById(id);
        if(!payment){
            return res.status(404).json({message: "Payment not found"});
        }

        // Check if the user is either the owner of the payment or an administrator
        if (payment.user_id !== req.user!.user_id && req.user!.role !== "administrator") {
            return res.status(403).json({message: "You do not have permission to view this payment"});
        }

        return res.status(200).json({
            message: "Payment fetched successfully",
            data: payment
        });
    }

    catch (error) {
        console.error("Get payment by ID error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the payment"
        });
    }
};

// GET - get all payments for a specific user by user id (for admin), uses the get by user id service function.
export const getPaymentsForUserController = async (req: Request, res: Response) => {

    try {
        const userId = Number(req.params.userId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({message: "Invalid user ID"});
        }
        const payments = await paymentsService.getPaymentsByUserId(userId);
        return res.status(200).json({
            message: "User's payments fetched successfully",
            data: payments
        });
    } catch (error) {
        console.error("Get user's payments error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching user's payments"
        });
    }
};


// GET - get a user's own payments by user id
export const getMyPaymentsController = async (req: Request, res: Response) => {

    try {
        const userId = req.user!.user_id;
        const payments = await paymentsService.getPaymentsByUserId(userId);
        return res.status(200).json({
            message: "User's payments fetched successfully",
            data: payments
        });
    } catch (error) {
        console.error("Get user's payments error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching user's payments"
        });
    }
};

// POST - create a new payment
export const createPaymentController = async (req: Request, res: Response) => {

    try {
        const result = createPaymentSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input data",
                errors: result.error
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({
                message: "JWT secret is not defined"
            });
        }

        // Instead of user?. (optional chaining), user! (non-null assertion) guarantees that req.user exists before this controller runs because of the requireAuth middleware.
        const userId = req.user!.user_id;
        const payment = await paymentsService.createPayment(result.data, userId);

        const token = jwt.sign(
            {
                user_id: req.user!.user_id,
                role: req.user!.role,
                level_number: payment.level_number
            },
            secret,
            { expiresIn: "1h" }
        );

            return res.status(201).json({
                message: "Payment created successfully",
                data: payment,
                token
            });
            
    } catch (error) {
        console.error("Create payment error:", error);

        if (error instanceof Error && error.message.includes("not found")) {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error instanceof Error && error.message.includes("already subscribed")) {
            return res.status(409).json({
                message: error.message
            });
        }
        return res.status(500).json({
            message: "An error occurred while creating the payment"
        });
    }
};