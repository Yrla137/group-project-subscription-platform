import type { AuthPayload } from "./authType";

// Extends the Express Request type so req.user can be used throughout the project.
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

// OR
// ((req as any).user as AuthPayload).user_id