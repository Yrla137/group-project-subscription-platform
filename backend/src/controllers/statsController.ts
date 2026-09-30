import type { Request, Response } from "express";
import * as statsService from "../services/statsService";
import { todayInAppTimeZone } from "../services/habitCompletionsService";
import { addDaysIso, isIsoDate } from "../utils/dateUtils";

// Default range: the last 4 weeks, including today
const DEFAULT_RANGE_DAYS = 28;

// GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
export const getStatsController = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;

        const today = todayInAppTimeZone();
        const to = req.query.to ?? today;
        const from = req.query.from ?? addDaysIso(today, -(DEFAULT_RANGE_DAYS - 1));

        if (!isIsoDate(from) || !isIsoDate(to)) {
            return res.status(400).json({ message: "'from' and 'to' must be dates in the format YYYY-MM-DD" });
        }

        const stats = await statsService.getStats(userId, from, to);
        return res.status(200).json(stats);
    } catch (error) {
        if (error instanceof statsService.StatsValidationError) {
            return res.status(400).json({ message: error.message });
        }

        console.error("Get stats error:", error);
        return res.status(500).json({ message: "An error occurred while fetching your stats" });
    }
};
