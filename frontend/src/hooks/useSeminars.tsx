import { useState, useEffect, useCallback } from "react";
import type { Seminar, UpdateSeminar, CreateSeminarInput } from "../types/SeminarsTypes";
import { useAuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

interface UseSeminarsResult {
    seminars: Seminar[];
    isLoading: boolean;
    // Only set when the list itself can't be loaded; mutations report failure through their return value
    error: string | null;
    createSeminar: (data: CreateSeminarInput) => Promise<Seminar | null>;
    updateSeminar: (id: number, data: UpdateSeminar) => Promise<Seminar | null>;
    deleteSeminar: (id: number) => Promise<boolean>;
    refetch: () => Promise<void>;
}

export function useSeminars(): UseSeminarsResult {
    const { token } = useAuthContext();

    const [seminars, setSeminars] = useState<Seminar[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // silent: reload the list without showing the loading state,
    // used after create/update so the page doesn't flash "Loading…"
    const loadSeminars = useCallback(
        async ({ silent = false }: { silent?: boolean } = {}) => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            if (!silent) {
                setIsLoading(true);
                setError(null);
            }

            try {
                const res = await fetch(`${API_URL}/seminars`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch seminars");
                }

                const json = await res.json();
                setSeminars(json.data);
                setError(null);
            } catch (err) {
                // A failed silent reload keeps the current list instead of replacing it with an error
                if (!silent) {
                    setError(err instanceof Error ? err.message : "An unknown error occurred");
                }
            } finally {
                if (!silent) setIsLoading(false);
            }
        },
        [token]
    );

    const fetchSeminars = useCallback(() => loadSeminars(), [loadSeminars]);

    useEffect(() => {
        fetchSeminars();
    }, [fetchSeminars]);

    const createSeminar = useCallback(
        async (data: CreateSeminarInput): Promise<Seminar | null> => {
            if (!token) return null;

            try {
                const res = await fetch(`${API_URL}/seminars`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!res.ok) {
                    throw new Error("Failed to create seminar");
                }

                const json = await res.json();

                // Reload so the new seminar gets its tier info and lands in the right date order
                await loadSeminars({ silent: true });

                return json.data;
            } catch {
                return null;
            }
        },
        [token, loadSeminars]
    );

    const updateSeminar = useCallback(
        async (id: number, data: UpdateSeminar): Promise<Seminar | null> => {
            if (!token) return null;

            try {
                const res = await fetch(`${API_URL}/seminars/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!res.ok) {
                    throw new Error("Failed to update seminar");
                }

                const json = await res.json();

                // Reload so a changed tier or date shows correctly
                await loadSeminars({ silent: true });

                return json.data;
            } catch {
                return null;
            }
        },
        [token, loadSeminars]
    );

    const deleteSeminar = useCallback(
        async (id: number): Promise<boolean> => {
            if (!token) return false;

            try {
                const res = await fetch(`${API_URL}/seminars/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error("Failed to delete seminar");
                }

                // Removing an item doesn't change tier info or order, so no reload is needed
                setSeminars((prev) => prev.filter((seminar) => seminar.id !== id));
                return true;
            } catch {
                return false;
            }
        },
        [token]
    );

    return {
        seminars,
        isLoading,
        error,
        createSeminar,
        updateSeminar,
        deleteSeminar,
        refetch: fetchSeminars,
    };
}