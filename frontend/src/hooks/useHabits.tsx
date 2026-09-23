import { useState, useEffect, useCallback } from "react";
import type { Habit, CreateHabit } from "../types/HabitsTypes";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

interface UseHabitsResult {
    habits: Habit[];
    isLoading: boolean;
    error: string | null;
    createHabit: (data: CreateHabit) => Promise<Habit | null>;
}

export function useHabits(): UseHabitsResult {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHabits = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const createHabit = useCallback(async (data: CreateHabit): Promise<Habit | null> => {
        try {
            const res = await fetch(`${API_URL}/habits`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to create habit");

            const json = await res.json();
            setHabits((prev) => [...prev, json.data].sort((a, b) => a.habit_title.localeCompare(b.habit_title)));
            return json.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return null;
        }
    }, []);

    return { habits, isLoading, error, createHabit };
}