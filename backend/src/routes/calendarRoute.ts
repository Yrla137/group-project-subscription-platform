import { Router } from "express";
import requireAuth from "../middlewares/requireAuth";
import { getCalendarEvents } from "../controllers/calendarController";

const router = Router();

router.get("/events", requireAuth, getCalendarEvents);

export default router;

// Register in your app entry file:
// import calendarRoutes from "./routes/calendarRoutes";
// app.use("/api/calendar", calendarRoutes);