import { useState, useEffect, useCallback } from "react";
import type { Habit, CreateHabit } from "../types/HabitsTypes";
import { useAuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

interface UseHabitsResult {
    habits: Habit[];
    isLoading: boolean;
    error: string | null;
    createHabit: (data: CreateHabit) => Promise<Habit | null>;
}

export function useHabits(): UseHabitsResult {
    const { token } = useAuthContext();

    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHabits = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/habits`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch habits");

            const json = await res.json();
            setHabits(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const createHabit = useCallback(async (data: CreateHabit): Promise<Habit | null> => {
        if (!token) return null;

        try {
            const res = await fetch(`${API_URL}/habits`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
    }, [token]);

    return { habits, isLoading, error, createHabit };
}