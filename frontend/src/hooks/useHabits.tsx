import { useState, useEffect, useCallback } from "react";
import type { Habit, CreateHabit, UpdateHabit } from "../types/HabitsTypes";
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

    // Only works on the user's own custom habits; the backend answers 403 for default habits
    const updateHabit = useCallback(
        async (id: number, data: UpdateHabit): Promise<Habit | null> => {
            if (!token) return null;

            try {
                const res = await fetch(`${API_URL}/habits/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!res.ok) throw new Error("Failed to update habit");

                const json = await res.json();

                // Re-sort, since a new title can move the habit in the list
                setHabits((prev) =>
                    prev
                        .map((habit) => (habit.id === id ? json.data : habit))
                        .sort((a, b) => a.habit_title.localeCompare(b.habit_title))
                );

                return json.data;
            } catch {
                // Reported through the return value, so a failed update doesn't replace the list with an error
                return null;
            }
        },
        [token]
    );

    // Only works on the user's own custom habits; the backend answers 403 for default habits
    const deleteHabit = useCallback(
        async (id: number): Promise<boolean> => {
            if (!token) return false;

            try {
                const res = await fetch(`${API_URL}/habits/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error("Failed to delete habit");

                setHabits((prev) => prev.filter((habit) => habit.id !== id));

                // One custom habit fewer, so the user may be able to create a new one again
                setHabitLimit((prev) =>
                    prev ? { ...prev, customHabitCount: Math.max(0, prev.customHabitCount - 1) } : prev
                );

                return true;
            } catch {
                // Reported through the return value, so a failed delete doesn't replace the list with an error
                return false;
            }
        },
        [token]
    );



    return { habits, isLoading, error, habitLimit, canCreateHabit, createHabit, updateHabit, deleteHabit };
}