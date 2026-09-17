import { useState, useEffect } from "react";
import type { CalendarEvent } from "../types/CalendarTypes";

export const useCalendarEvents = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [/* tasksRes, */ seminarsRes] = await Promise.all([
                    // fetch("/tasks/me", { credentials: "include" }),
                    fetch("http://localhost:3000/api/seminars/my-tier"),
                ]);

                if (/* !tasksRes.ok || */ !seminarsRes.ok) {
                    throw new Error("Failed to fetch calendar events");
                }

                // const tasksJson = await tasksRes.json();
                const seminarsJson = await seminarsRes.json();

                // const taskEvents: CalendarEvent[] = tasksJson.data.map((t: any) => ({
                //     id: t.id,
                //     title: t.title,
                //     date: t.todo_date,
                //     type: "task" as const,
                // }));

                const seminarEvents: CalendarEvent[] = seminarsJson.data.map((s: any) => ({
                    id: s.id,
                    title: s.seminar_title,
                    date: s.seminar_date,
                    type: "seminar" as const,
                }));

                setEvents([/* ...taskEvents, */ ...seminarEvents]);
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