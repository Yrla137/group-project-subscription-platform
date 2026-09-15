import type { AuthPayload } from "./auth-type";

// decleare global means that the AuthPayload in this case will be available globally in the project so it dosen't need to be imported in every file where it is used.
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}



// Here we do declaration merging which means that we are adding a new property to the existing Request interface from the Express module.
// In this case, we are adding a new property called authPayload of type AuthPayload to the Request interface.
// This allows us to access the authPayload property on the Request object in our Express application.