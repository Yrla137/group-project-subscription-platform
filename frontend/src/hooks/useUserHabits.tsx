import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import type { UserHabitWithDetails, UpdateUserHabit } from "../types/UserHabitsTypes";
import { useAuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

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
    const { token } = useAuthContext();

    const [userHabits, setUserHabits] = useState<UserHabitWithDetails[]>([]);
    const [todaysHabits, setTodaysHabits] = useState<UserHabitWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTodaysLoading, setIsTodaysLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    const fetchUserHabits = useCallback(async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/user-habits`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch user habits");

            const json = await res.json();
            setUserHabits(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const fetchTodaysHabits = useCallback(async () => {
        if (!token || !includeToday) {
            setIsTodaysLoading(false);
            return;
        }

        setIsTodaysLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/user-habits/today?date=${formattedDate}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch habits");

            const json = await res.json();
            setTodaysHabits(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsTodaysLoading(false);
        }
    }, [token, formattedDate, includeToday]);

    useEffect(() => {
        fetchUserHabits();
    }, [fetchUserHabits]);

    useEffect(() => {
        fetchTodaysHabits();
    }, [fetchTodaysHabits]);

    const createUserHabit = useCallback(async (data: CreateUserHabitInput): Promise<UserHabitWithDetails | null> => {
        if (!token) return null;

        try {
            const res = await fetch(`${API_URL}/user-habits`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
    }, [token, fetchUserHabits]);

    const updateUserHabit = useCallback(async (id: number, data: UpdateUserHabit): Promise<UserHabitWithDetails | null> => {
        if (!token) return null;

        try {
            const res = await fetch(`${API_URL}/user-habits/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
    }, [token]);

    const deleteUserHabit = useCallback(async (id: number): Promise<boolean> => {
        if (!token) return false;

        try {
            const res = await fetch(`${API_URL}/user-habits/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to remove habit");

            setUserHabits((prev) => prev.filter((uh) => uh.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
            return false;
        }
    }, [token]);

    const toggleCompletion = useCallback(async (userHabitId: number, isCompleted: boolean) => {
        if (!token) return;

        setTodaysHabits((prev) =>
            prev.map((h) => (h.id === userHabitId ? { ...h, is_completed_today: !isCompleted } : h))
        );

        try {
            if (isCompleted) {
                await fetch(`${API_URL}/habit-completions/${userHabitId}?date=${formattedDate}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await fetch(`${API_URL}/habit-completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ user_habit_id: userHabitId, completed_date: formattedDate }),
                });
            }
        } catch (err) {
            setTodaysHabits((prev) =>
                prev.map((h) => (h.id === userHabitId ? { ...h, is_completed_today: isCompleted } : h))
            );
            setError(err instanceof Error ? err.message : "Failed to update habit");
        }
    }, [token, formattedDate]);

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