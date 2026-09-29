import { useState, useEffect, useCallback } from "react";
import type { Task, CreateTask, UpdateTask } from "../types/TasksTypes"

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

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

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/tasks`, {
                headers: getAuthHeaders(), 
            });

            if (!res.ok) {
                throw new Error("Could not get tasks");
            }

            const json = await res.json();
            setTasks(json.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = useCallback(async (data: CreateTask): Promise<Task | null> => {
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.message || "Could not create task");
  
            }

            setTasks((prev) => [...prev, json.data]);
            return json.data;
        } catch (err) {
           throw (err)
        }
    }, []);

    const updateTask = useCallback(async (id: number, data: UpdateTask): Promise<Task | null> => {
        try {
            const res = await fetch(`${API_URL}/tasks/${id}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
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
            setError(err instanceof Error ? err.message : "Unknown error");
            return null;
        }
    }, []);

    const deleteTask = useCallback(async (id: number): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/tasks/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (!res.ok) {
                throw new Error("Could not delete task");
            }

            setTasks((prev) => prev.filter((task) => task.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
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