import { useState, useEffect, useCallback } from "react";
import type { Seminar, UpdateSeminar, CreateSeminarInput } from "../types/SeminarsTypes";
import { useAuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

interface UseSeminarsResult {
    seminars: Seminar[];
    isLoading: boolean;
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

    const fetchSeminars = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/seminars`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch seminars");
            }

            const json = await res.json();
            setSeminars(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSeminars();
    }, [fetchSeminars]);

    const createSeminar = useCallback(async (data: CreateSeminarInput): Promise<Seminar | null> => {
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
            setSeminars((prev) => [...prev, json.data]);
            return json.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return null;
        }
    }, [token]);

    const updateSeminar = useCallback(async (id: number, data: UpdateSeminar): Promise<Seminar | null> => {
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
            setSeminars((prev) =>
                prev.map((seminar) => (seminar.id === id ? json.data : seminar))
            );
            return json.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return null;
        }
    }, [token]);

    const deleteSeminar = useCallback(async (id: number): Promise<boolean> => {
        if (!token) return false;

        try {
            const res = await fetch(`${API_URL}/seminars/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Failed to delete seminar");
            }

            setSeminars((prev) => prev.filter((seminar) => seminar.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return false;
        }
    }, [token]);

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