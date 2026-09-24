import { useState, useCallback } from "react";
import type { Tier, CreateTier, UpdateTier } from "../types/TierType";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function useTiers() {
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // GET - Fetch all tiers
    const fetchTiers = useCallback(async (): Promise<Tier[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/tiers`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const returnData: {
                message?: string;
                data?: Tier[];
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to fetch tiers");
            }

            if (!returnData.data) {
                throw new Error("No tier data returned from the API");
            }

            setTiers(returnData.data);
            return returnData.data;

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    // GET - Fetch a single tier by ID (Will probably not be used but is added just in case)
    const fetchTierById = async (id: number): Promise<Tier> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/tiers/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const returnData: {
                message?: string;
                data?: Tier;
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to fetch tier");
            }

            if (!returnData.data) {
                throw new Error("No tier data returned from the API");
            }

            return returnData.data;

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            throw error;

        } finally {
            setIsLoading(false);
        }
    };

    // POST - Create a new tier
    const createTier = async (tierData: CreateTier): Promise<Tier> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/tiers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tierData),
            });

            const returnData: {
                message?: string;
                data?: Tier;
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to create tier");
            }

            if (!returnData.data) {
                throw new Error("No tier data returned from the API");
            }

            // Update the local state with the newly created tier
            setTiers((prevTiers) => [...prevTiers, returnData.data!]);

            return returnData.data;

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // PATCH - Update an existing tier
    const updateTier = async (id: number, tierData: UpdateTier): Promise<Tier> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/tiers/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(tierData),
            });

            const returnData: {
                message?: string;
                data?: Tier;
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to update tier");
            }

            if (!returnData.data) {
                throw new Error("No tier data returned from the API");
            }

            // Update the local state with the updated tier
            setTiers((prevTiers) =>
                prevTiers.map((tier) => (tier.id === id ? returnData.data! : tier))
            );

            return returnData.data;

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        error,
        isLoading,
        tiers,
        fetchTiers,
        fetchTierById,
        createTier,
        updateTier
    };
}