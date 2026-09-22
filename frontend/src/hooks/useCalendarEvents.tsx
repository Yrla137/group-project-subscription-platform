import { useState, useEffect } from "react";
import type { CalendarEvent } from "../types/CalendarTypes";

export const useCalendarEvents = () => {

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [habitsRes, seminarsRes] = await Promise.all([
                    fetch(`${API_URL}/user-habits/today`),
                    fetch(`${API_URL}/seminars`),
                ]);

                if (!habitsRes.ok || !seminarsRes.ok) {
                    throw new Error("Failed to fetch calendar events");
                }

                const habitsJson = await habitsRes.json();
                const seminarsJson = await seminarsRes.json();

                const habitEvents: CalendarEvent[] = habitsJson.data.map((h: any) => ({
                    id: h.id,
                    title: h.habit_title,
                    description: h.habit_description,
                    date: new Date().toISOString().slice(0, 10),
                    type: "habit" as const,
                    isCompleted: h.is_completed_today,
                }));

                const seminarEvents: CalendarEvent[] = seminarsJson.data.map((s: any) => ({
                    id: s.id,
                    title: s.seminar_title,
                    description: s.seminar_description,
                    date: s.seminar_date,
                    type: "seminar" as const,
                    tierLevel: s.tier_level,
                }));

                setEvents([...habitEvents, ...seminarEvents]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [API_URL]);

    return { events, isLoading, error };
};