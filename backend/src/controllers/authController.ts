import * as authService from "../services/authService";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/authSchema";

dotenv.config();

// Login
export const loginController = async(req: Request, res: Response) => {

    try {
        const result = loginSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({message: "Invalid input data"});
        }

        const user = await authService.loginUser(result.data);

        if(!user){
            return res.status(401).json({message: "Invalid email or password"});
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "Internal server error" });
        }
        const token = jwt.sign(
            user,
            secret,
            { expiresIn: "1h" }
        );
            return res.status(200).json({
            message: "Login successful",
            token: token
            });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "An error occurred during login"
        });
    }
};

// Register
export const registerController = async(req: Request, res: Response) => {

    try {

        const result = registerSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({message: "Invalid input data"});
        }

        const existingUser = await authService.getUserByEmail(result.data.email);
        if(existingUser){
            return res.status(409).json({message: "User already exists"});
        }

        const user = await authService.registerUser(result.data);
        return res.status(201).json({message: "User created", user: user});

    } catch (error) {
        
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "An error occurred during registration"
        });
    }
};