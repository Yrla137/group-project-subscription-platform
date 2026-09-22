import { useState, useEffect, useCallback } from "react";
import type { UserHabitWithDetails, UpdateUserHabit } from "../types/UserHabitsTypes";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// user_id is attached server-side from the hardcoded user for now
type CreateUserHabitInput = {
    habit_id: number;
    is_recurring?: boolean;
    recurrence_rule?: string;
    duration_minutes?: number;
};

interface UseUserHabitsResult {
    userHabits: UserHabitWithDetails[];
    isLoading: boolean;
    error: string | null;
    createUserHabit: (data: CreateUserHabitInput) => Promise<UserHabitWithDetails | null>;
    updateUserHabit: (id: number, data: UpdateUserHabit) => Promise<UserHabitWithDetails | null>;
    deleteUserHabit: (id: number) => Promise<boolean>;
    refetch: () => Promise<void>;
}

export function useUserHabits(): UseUserHabitsResult {
    const [userHabits, setUserHabits] = useState<UserHabitWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserHabits = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/user-habits`);
            if (!res.ok) throw new Error("Failed to fetch user habits");

            const json = await res.json();
            setUserHabits(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserHabits();
    }, [fetchUserHabits]);

    const createUserHabit = useCallback(async (data: CreateUserHabitInput): Promise<UserHabitWithDetails | null> => {
        try {
            const res = await fetch(`${API_URL}/user-habits`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to add habit");

            // POST response has no joined habit_title/habit_description yet,
            // so we refetch to keep the list consistent with the GET shape.
            await fetchUserHabits();
            const json = await res.json();
            return json.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return null;
        }
    }, [fetchUserHabits]);

    const updateUserHabit = useCallback(async (id: number, data: UpdateUserHabit): Promise<UserHabitWithDetails | null> => {
        try {
            const res = await fetch(`${API_URL}/user-habits/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update habit");

            const json = await res.json();
            // Merge instead of replace — PATCH response has no habit_title/habit_description joined in
            setUserHabits((prev) =>
                prev.map((uh) => (uh.id === id ? { ...uh, ...json.data } : uh))
            );
            return json.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return null;
        }
    }, []);

    const deleteUserHabit = useCallback(async (id: number): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/user-habits/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove habit");

            setUserHabits((prev) => prev.filter((uh) => uh.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return false;
        }
    }, []);

    return {
        userHabits,
        isLoading,
        error,
        createUserHabit,
        updateUserHabit,
        deleteUserHabit,
        refetch: fetchUserHabits,
    };
}