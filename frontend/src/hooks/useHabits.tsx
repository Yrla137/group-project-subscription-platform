import { useState, useEffect, useCallback } from "react";
import type { Habit, CreateHabit } from "../types/HabitsTypes";
import { useAuthContext } from "../context/AuthContext";
import type { HabitLimit, UseHabitsResult } from "../types/HabitsTypes";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export function useHabits(): UseHabitsResult {
    const { token } = useAuthContext();

    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [habitLimit, setHabitLimit] = useState<HabitLimit | null>(null);

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
            setHabitLimit(json.meta ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    // Unknown limit: don't block in the UI, the backend still enforces it
    const canCreateHabit = !habitLimit || habitLimit.customHabitCount < habitLimit.maxCustomHabits;

    const createHabit = useCallback(
        async (data: CreateHabit): Promise<Habit | null> => {
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

                if (!res.ok) {
                    const body = await res.json().catch(() => null);

                    // The backend's limit check won: sync the UI with the real limit
                    if (res.status === 403 && body?.code === "HABIT_LIMIT_REACHED") {
                        setHabitLimit((prev) =>
                            prev
                                ? { ...prev, maxCustomHabits: body.limit, customHabitCount: Math.max(prev.customHabitCount, body.limit) }
                                : { customHabitCount: body.limit, maxCustomHabits: body.limit }
                        );
                    }

                    throw new Error(body?.message ?? "Failed to create habit");
                }

                const json = await res.json();
                setHabits((prev) => [...prev, json.data].sort((a, b) => a.habit_title.localeCompare(b.habit_title)));

                // Keep the counter in sync without refetching
                setHabitLimit((prev) => (prev ? { ...prev, customHabitCount: prev.customHabitCount + 1 } : prev));

                return json.data;
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
                return null;
            }
        },
        [token]
    );

    return { habits, isLoading, error, habitLimit, canCreateHabit, createHabit };
}