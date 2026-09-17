import type { Request, Response, NextFunction } from "express";

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "administrator") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    next();
};

export default requireAdmin;