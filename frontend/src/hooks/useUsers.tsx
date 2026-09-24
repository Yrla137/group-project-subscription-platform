import { useState, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext";
import type { User, UserWithTier, UpdateUser } from "../types/UserType";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function useUsers() {

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

    const { token } = useAuthContext();

  // GET - Fetch all users (Admin only)
  const fetchUsers = async (): Promise<UserWithTier[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
      });

      const returnData: {
        message?: string;
        data?: UserWithTier[];
      } = await response.json();

      if (!response.ok) {
        throw new Error(returnData.message || "Failed to fetch users");
      }

      if (!returnData.data) {
        throw new Error("No user data returned from the API");
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

  // GET - Fetch a single user by ID (Admin only)
  const fetchUserById = async (id: number): Promise<UserWithTier> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const returnData:{
        message?: string;
        data?: UserWithTier;
      } = await response.json();

      if (!response.ok) {
        throw new Error(returnData.message || "Failed to fetch user");
        }

      if (!returnData.data) {
          throw new Error("No user data returned from the API");
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

    // GET - Fetch user's profile information
    const fetchUserProfile = useCallback(async (): Promise<UserWithTier> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const returnData: {
                message?: string;
                data?: UserWithTier;
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to fetch user profile");
            }

            if (!returnData.data) {
                throw new Error("No user profile data returned from the API");
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
    }, [token]);
    
    // PATCH - Update a user
    const updateUser = async (data: UpdateUser): Promise<User> => {
      setIsLoading(true);
      setError(null);

        try {
            const response = await fetch(`${API_URL}/users`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const returnData: {
                message?: string;
                data?: User;
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to update user");
            }
            if (!returnData.data) {
                throw new Error("No user data returned from the API");
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

    // DELETE - Delete a user
    const deleteUser = async (id: number): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const returnData = await response.json();
                throw new Error(returnData.message || "Failed to delete user");
            }
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
    fetchUsers,
    fetchUserById,
    fetchUserProfile,
    updateUser,
    deleteUser
  };
};