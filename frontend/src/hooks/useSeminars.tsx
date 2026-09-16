import { useState, useEffect, useCallback } from "react";
import type { Seminar, CreateSeminar, UpdateSeminar } from "../types/seminars-type";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UseSeminarsResult {
    seminars: Seminar[];
    isLoading: boolean;
    error: string | null;
    createSeminar: (data: CreateSeminar) => Promise<Seminar | null>;
    updateSeminar: (id: number, data: UpdateSeminar) => Promise<Seminar | null>;
    deleteSeminar: (id: number) => Promise<boolean>;
    refetch: () => Promise<void>;
}

export function useSeminars(): UseSeminarsResult {
    const [seminars, setSeminars] = useState<Seminar[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSeminars = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/seminars`);

            if (!res.ok) {
                throw new Error("Kunde inte hämta seminarier");
            }

            const json = await res.json();
            setSeminars(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett okänt fel inträffade");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSeminars();
    }, [fetchSeminars]);

    const createSeminar = useCallback(async (data: CreateSeminar): Promise<Seminar | null> => {
        try {
            const res = await fetch(`${API_URL}/seminars`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Kunde inte skapa seminarium");
            }

            const json = await res.json();
            setSeminars((prev) => [...prev, json.data]);
            return json.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett okänt fel inträffade");
            return null;
        }
    }, []);

    const updateSeminar = useCallback(async (id: number, data: UpdateSeminar): Promise<Seminar | null> => {
        try {
            const res = await fetch(`${API_URL}/seminars/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Kunde inte uppdatera seminarium");
            }

            const json = await res.json();
            setSeminars((prev) =>
                prev.map((seminar) => (seminar.id === id ? json.data : seminar))
            );
            return json.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett okänt fel inträffade");
            return null;
        }
    }, []);

    const deleteSeminar = useCallback(async (id: number): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/seminars/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Kunde inte radera seminarium");
            }

            setSeminars((prev) => prev.filter((seminar) => seminar.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett okänt fel inträffade");
            return false;
        }
    }, []);

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