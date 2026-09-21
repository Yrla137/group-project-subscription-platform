import * as usersService from "../services/usersService";
import { updateUserSchema } from "../schemas/usersSchema";
import type { Request, Response } from "express";

// GET - gets all users from the database (only for admin)
export const getAllUsersController = async (_req: Request, res: Response) => {

    try {
        const users = await usersService.getAllUsers();
        return res.status(200).json({
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        console.error("Get all users error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching users"
        });
    }
};

// GET id - gets a user with a specific id from the database (only for admin)
export const getUserByIdController = async (req: Request, res: Response) => {

    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({message: "Invalid user ID"});
        }
        const user = await usersService.getUserById(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        return res.json(user);
    } catch (error) {
        console.error("Get user by ID error:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the user"
        });
    }
};

// PATCH - update user information
export const updateUserController = async (req: Request, res: Response) => {

    try {
        const result = updateUserSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input data",
                errors: result.error
            });
        }

        if(!req.user){
            return res.status(401).json({message: "Unauthorized"});
        }

        const id = req.user.user_id;
        const updatedUser = await usersService.updateUser(id, result.data);

        if (!updatedUser) {
            return res.status(404).json({
                message: "User information could not be updated"
            });
        }

        return res.status(200).json({
            message: "User information updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Update user error:", error);
        return res.status(500).json({
            message: "An error occurred while updating the user profile"
        });
    }
};

// DELETE - delete a user (only admin)
export const deleteUserController = async (req: Request, res: Response) => {

    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({message: "Invalid user ID"});
        }
        const user = await usersService.getUserById(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        await usersService.deleteUser(id);
        return res.status(200).json({message: "User deleted successfully"});

    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({
            message: "An error occurred while deleting the user"
        });
    }
};