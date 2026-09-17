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

// Here we do declaration merging which means that we are adding a new property to the existing Request interface from the Express module.
// In this case, we are adding a new property called authPayload of type AuthPayload to the Request interface.
// This allows us to access the authPayload property on the Request object in our Express application.