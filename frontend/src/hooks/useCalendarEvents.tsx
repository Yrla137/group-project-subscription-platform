import { useState, useEffect } from "react";
import type { CalendarEvent } from "../types/CalendarTypes";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// How many days forward/back from today to generate habit occurrences for.
// Keeps the dot-generation bounded instead of running forever into the future/past.
const HABIT_RANGE_DAYS = 30;

// Checks whether a recurrence_rule applies to a given ISO date (YYYY-MM-DD)
// Mirrors the same logic used server-side in userHabitsService.ts
function isScheduledOn(rule: string | null, isoDate: string): boolean {
    if (!rule) return false;
    if (rule === "DAILY") return true;

    if (rule.startsWith("WEEKLY:")) {
        const days = rule.replace("WEEKLY:", "").split(",");
        const dayAbbr = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(isoDate).getUTCDay()];
        return days.includes(dayAbbr);
    }

    return false;
}

function getDateRange(days: number): string[] {
    const dates: string[] = [];
    for (let offset = -days; offset <= days; offset++) {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
}

export const useCalendarEvents = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [tasksRes, habitsRes, seminarsRes] = await Promise.all([
                    fetch(`${API_URL}/tasks`),
                    fetch(`${API_URL}/user-habits`),
                    fetch(`${API_URL}/seminars`),
                ]);

                if (!tasksRes.ok || !habitsRes.ok || !seminarsRes.ok) {
                    throw new Error("Failed to fetch calendar events");
                }

                const tasksJson = await tasksRes.json();
                const habitsJson = await habitsRes.json();
                const seminarsJson = await seminarsRes.json();

                const taskEvents: CalendarEvent[] = tasksJson.data.map((t: any) => ({
                    date: t.task_date,
                    type: "task" as const,
                }));

                const dateRange = getDateRange(HABIT_RANGE_DAYS);
                const habitEvents: CalendarEvent[] = habitsJson.data.flatMap((h: any) =>
                    dateRange
                        .filter((date) => isScheduledOn(h.recurrence_rule, date))
                        .map((date) => ({
                            date,
                            type: "habit" as const,
                        }))
                );

                const seminarEvents: CalendarEvent[] = seminarsJson.data.map((s: any) => ({
                    date: s.seminar_date,
                    type: "seminar" as const,
                    tierLevel: s.tier_level,
                }));

                setEvents([...taskEvents, ...habitEvents, ...seminarEvents]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return { events, isLoading, error };
};