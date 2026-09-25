import type { Request, Response } from "express";
import * as calendarService from "../services/calendarService";
import { isIsoDate } from "../utils/dateUtils";

// GET /api/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function getCalendarEvents(req: Request, res: Response) {
    // Assumes your auth middleware sets req.user
    const userId = req.user?.user_id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { from, to } = req.query;
    if (!isIsoDate(from) || !isIsoDate(to)) {
        return res.status(400).json({ error: "'from' and 'to' must be dates in the format YYYY-MM-DD" });
    }

    try {
        const result = await calendarService.getCalendarEvents(userId, from, to);
        return res.status(200).json(result);
    } catch (err) {
        if (err instanceof calendarService.CalendarValidationError) {
            return res.status(400).json({ error: err.message });
        }

        console.error("Failed to fetch calendar events:", err);
        return res.status(500).json({ error: "Failed to fetch calendar events" });
    }
}