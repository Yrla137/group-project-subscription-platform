import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Request, Response, NextFunction} from "express";

dotenv.config();

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        return res.status(500).json({ message: "JWT secret is not defined" });
    }
    // console.log("VERIFYING TOKEN...");
    try {
        // console.log("VERIFYING TOKEN...");
        const decoded = jwt.verify(token, secret);

        if (typeof decoded === "string") {
            return res.status(401).json({ message: "Invalid token" });
        }

        if (typeof decoded.user_id !== "number") {
            return res.status(401).json({ message: "Invalid token" });
        }

        if (decoded.role !== "member" && decoded.role !== "administrator") {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = {
            user_id: decoded.user_id,
            role: decoded.role
        };

        next();
    } catch (err) {
        console.log("JWT VERIFY ERROR:", err);

        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

export default requireAuth;


