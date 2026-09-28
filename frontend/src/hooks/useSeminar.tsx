import { useState, useEffect } from "react";
import type { Seminar } from "../types/SeminarsTypes";
import { useAuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

type SeminarStatus = "loading" | "ready" | "locked" | "not-found" | "error";

interface UseSeminarResult {
    seminar: Seminar | null;
    status: SeminarStatus;
    // Set when status is "locked": the tier that includes the seminar
    requiredTier: string | null;
    error: string | null;
}

export function useSeminar(id: number): UseSeminarResult {
    const { token } = useAuthContext();

    const [seminar, setSeminar] = useState<Seminar | null>(null);
    const [status, setStatus] = useState<SeminarStatus>("loading");
    const [requiredTier, setRequiredTier] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        if (!Number.isInteger(id) || id <= 0) {
            setStatus("not-found");
            return;
        }

        // Cancels the request if the id changes before it finishes
        const controller = new AbortController();

        const fetchSeminar = async () => {
            setStatus("loading");
            setError(null);
            setRequiredTier(null);

            try {
                const res = await fetch(`${API_URL}/seminars/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });

                const body = await res.json().catch(() => null);

                if (res.status === 403 && body?.code === "SEMINAR_LOCKED") {
                    setSeminar(null);
                    setRequiredTier(body.tier_title ?? null);
                    setStatus("locked");
                    return;
                }

                if (res.status === 404 || res.status === 400) {
                    setSeminar(null);
                    setStatus("not-found");
                    return;
                }

                if (!res.ok) {
                    throw new Error(body?.message ?? "Couldn't load the seminar.");
                }

                setSeminar(body);
                setStatus("ready");
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Couldn't load the seminar.");
                setStatus("error");
            }
        };

        fetchSeminar();

        return () => controller.abort();
    }, [id, token]);

    return { seminar, status, requiredTier, error };
}