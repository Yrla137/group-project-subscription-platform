import { useState, useEffect, useCallback } from "react";
import type { CalendarEvent, CalendarMeta, CalendarResponse } from "../types/CalendarTypes";
import { useAuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

/**
 * Fetches all calendar events (tasks, habits, seminars) for a date range.
 * The backend handles entitlement, habit expansion and seminar locking.
 *
 * @param from ISO date (YYYY-MM-DD), e.g. the first visible day in the calendar
 * @param to   ISO date (YYYY-MM-DD), e.g. the last visible day in the calendar
 */
export const useCalendarEvents = (from: string, to: string) => {
    const { token } = useAuthContext();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [meta, setMeta] = useState<CalendarMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Bumping this re-runs the effect, e.g. after creating or deleting a task
    const [reloadKey, setReloadKey] = useState(0);
    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    useEffect(() => {
        if (!token) return;

        // Cancels the request if the user switches month before it finishes,
        // so an old response can't overwrite a newer one
        const controller = new AbortController();

        const fetchEvents = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({ from, to });
                const res = await fetch(`${API_URL}/calendar/events?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });

                if (!res.ok) {
                    const body = await res.json().catch(() => null);
                    throw new Error(body?.error ?? "Failed to fetch calendar events");
                }

                const json: CalendarResponse = await res.json();
                setEvents(json.data);
                setMeta(json.meta);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchEvents();

        return () => controller.abort();
    }, [token, from, to, reloadKey]);

    // True if the user can see their own tasks and habits on this date (only the future is limited)
    const isWithinHorizon = useCallback(
        (isoDate: string) => (meta ? isoDate <= meta.horizonEnd : true),
        [meta]
    );

    return { events, meta, isLoading, error, refetch, isWithinHorizon };
};