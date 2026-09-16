import * as usersService from "../services/usersService";
import type { Request, Response } from "express";

// GET - gets all users from the database (only for admin)
export const getAllUsersController = async (_req: Request, res: Response) => {
    const users = await usersService.getAllUsers();
    return res.status(200).json({
        message: "Users fetched successfully",
        data: users
    });
};

// GET id - gets a user with a specific id from the database (only for admin)
export const getUserByIdController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await usersService.getUserById(id);
    if(!user){
        return res.status(404).json({message: "User not found"});
    }
        return res.json(user);
};

// PATCH - update user information
export const updateUserController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updatedUser = await usersService.updateUser(
        id,
        req.body
    );

    if (!updatedUser) {
        return res.status(404).json({
            message: "User profile could not be updated"
        });
    }

    return res.status(200).json({
        message: "Profile updated successfully"
    });
};

// DELETE - delete a user (only admin)
export const deleteUserController = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await usersService.getUserById(id);
    if(!user){
        return res.status(404).json({message: "User not found"});
    }
    await usersService.deleteUser(id);
    return res.status(200).json({message: "User deleted successfully"});
};