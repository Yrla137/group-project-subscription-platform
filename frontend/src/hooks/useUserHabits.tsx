import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
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
    todaysHabits: UserHabitWithDetails[];
    isLoading: boolean;
    isTodaysLoading: boolean;
    error: string | null;
    createUserHabit: (data: CreateUserHabitInput) => Promise<UserHabitWithDetails | null>;
    updateUserHabit: (id: number, data: UpdateUserHabit) => Promise<UserHabitWithDetails | null>;
    deleteUserHabit: (id: number) => Promise<boolean>;
    toggleCompletion: (userHabitId: number, isCompleted: boolean) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useUserHabits(
    selectedDate: Date = new Date(),
    includeToday: boolean = true
): UseUserHabitsResult {
    const [userHabits, setUserHabits] = useState<UserHabitWithDetails[]>([]);
    const [todaysHabits, setTodaysHabits] = useState<UserHabitWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTodaysLoading, setIsTodaysLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    

    // Full catalog of the user's active habits (used by the manage-habits page)
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

    // Habits scheduled for a given date, with completion status (used by the calendar view)
    const fetchTodaysHabits = useCallback(async () => {
        setIsTodaysLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/user-habits/today?date=${formattedDate}`);
            if (!res.ok) throw new Error("Failed to fetch habits");

            const json = await res.json();
            setTodaysHabits(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsTodaysLoading(false);
        }
    }, [formattedDate]);

    useEffect(() => {
        fetchUserHabits();
    }, [fetchUserHabits]);

    useEffect(() => {
        if (!includeToday) {
            setIsTodaysLoading(false);
            return;
        }
        fetchTodaysHabits();
    }, [fetchTodaysHabits, includeToday]);

    const createUserHabit = useCallback(async (data: CreateUserHabitInput): Promise<UserHabitWithDetails | null> => {
        try {
            const res = await fetch(`${API_URL}/user-habits`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to add habit");

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

    const toggleCompletion = useCallback(async (userHabitId: number, isCompleted: boolean) => {
        setTodaysHabits((prev) =>
            prev.map((h) => (h.id === userHabitId ? { ...h, is_completed_today: !isCompleted } : h))
        );

        try {
            if (isCompleted) {
                await fetch(`${API_URL}/habit-completions/${userHabitId}?date=${formattedDate}`, {
                    method: "DELETE",
                });
            } else {
                await fetch(`${API_URL}/habit-completions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_habit_id: userHabitId, completed_date: formattedDate }),
                });
            }
        } catch (err) {
            setTodaysHabits((prev) =>
                prev.map((h) => (h.id === userHabitId ? { ...h, is_completed_today: isCompleted } : h))
            );
            setError(err instanceof Error ? err.message : "Failed to update habit");
        }
    }, [formattedDate]);

    return {
        userHabits,
        todaysHabits,
        isLoading,
        isTodaysLoading,
        error,
        createUserHabit,
        updateUserHabit,
        deleteUserHabit,
        toggleCompletion,
        refetch: fetchUserHabits,
    };
}