import { useState } from "react";
import type { LoginUser, LoginResponse, RegisterUser, RegisterResponse } from "../types/AuthTypes";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function useAuth() {

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // POST - Login user (Admin and Member)
  const loginUser = async (data: LoginUser): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const returnData: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(returnData.message || "Login failed");
      }

      return returnData;

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // POST - Register new user
  const registerUser = async (data: RegisterUser): Promise<RegisterResponse> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      const returnData: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(returnData.message || "Registration failed");
      }

      return returnData;

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    error,
    isLoading,
    loginUser,
    registerUser
  };
}