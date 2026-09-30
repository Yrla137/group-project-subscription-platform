import { useEffect, useState } from "react";
import type { StatsResponse } from "../types/StatsTypes";
import { useAuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

/**
 * Fetches progress stats for a date range.
 * @param from ISO date (YYYY-MM-DD)
 * @param to   ISO date (YYYY-MM-DD); the backend stops at today
 */
export function useStats(from: string, to: string) {
    const { token } = useAuthContext();

    const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Set when the user's tier doesn't include stats; requiredTier is the tier that does
    const [isLocked, setIsLocked] = useState(false);
    const [requiredTier, setRequiredTier] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        // Cancels the request if the range changes before it finishes
        const controller = new AbortController();

        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({ from, to });
                const res = await fetch(`${API_URL}/stats?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });

                const body = await res.json().catch(() => null);

                if (res.status === 403 && body?.code === "STATS_LOCKED") {
                    setStats(null);
                    setIsLocked(true);
                    setRequiredTier(body.required_tier ?? null);
                    return;
                }

                if (!res.ok) {
                    throw new Error(body?.message ?? "Couldn't load your stats.");
                }

                setIsLocked(false);
                setStats((body as StatsResponse).data);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Couldn't load your stats.");
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        };

        fetchStats();

        return () => controller.abort();
    }, [token, from, to]);

    return { stats, isLoading, error, isLocked, requiredTier };
}