import { useState, useEffect, useCallback } from "react";
import type { Task, CreateTask, UpdateTask } from "../types/TasksTypes"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UseTasksResult {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    createTask: (data: CreateTask) => Promise<Task | null>;
    updateTask: (id: number, data: UpdateTask) => Promise<Task | null>;
    deleteTask: (id: number) => Promise<boolean>;
    refetch: () => Promise<void>;
}

export function useTasks(): UseTasksResult {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/tasks`);

            if (!res.ok) {
                throw new Error("Kunde inte hämta uppgifter");
            }

            const json = await res.json();
            setTasks(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett okänt fel inträffade");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = useCallback(async (data: CreateTask): Promise<Task | null> => {
        try {
            const res = await fetch(`${API_URL}/api/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Kunde inte skapa uppgift");
            }

            const json = await res.json();
            setTasks((prev) => [...prev, json.data]);
            return json.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett okänt fel inträffade");
            return null;
        }
    }, []);

    const updateTask = useCallback(async (id: number, data: UpdateTask): Promise<Task | null> => {
        try {
            const res = await fetch(`${API_URL}/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Kunde inte uppdatera uppgift");
            }

            const json = await res.json();

            const updatedTask = json.data || json.task || json;

            setTasks((prev) =>
                prev.map((task) => (task.id === id ? { ...task, ...data, ...updatedTask } : task))
            );
            return updatedTask;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett okänt fel inträffade");
            return null;
        }
    }, []);

    const deleteTask = useCallback(async (id: number): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/api/tasks/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Kunde inte radera uppgift");
            }

            setTasks((prev) => prev.filter((task) => task.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ett okänt fel inträffade");
            return false;
        }
    }, []);

    return {
        tasks,
        isLoading,
        error,
        createTask,
        updateTask,
        deleteTask,
        refetch: fetchTasks,
    };
}