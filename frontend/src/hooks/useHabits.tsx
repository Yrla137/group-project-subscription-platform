import { useState, useEffect } from "react";
import type { Habit } from "../types/HabitsTypes";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface UseHabitsResult {
    habits: Habit[];
    isLoading: boolean;
    error: string | null;
}

export function useHabits(): UseHabitsResult {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHabits = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(`${API_URL}/habits`);
                if (!res.ok) throw new Error("Failed to fetch habits");

                const json = await res.json();
                setHabits(json.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHabits();
    }, []);

    return { habits, isLoading, error };
}