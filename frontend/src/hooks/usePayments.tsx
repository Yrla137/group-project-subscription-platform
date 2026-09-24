import { useState, useCallback } from "react";
import type { Payment, CreatePayment } from "../types/PaymentType";
import { useAuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { token } = useAuthContext();

    // GET - Fetch all payments
    const fetchAllPayments = useCallback(async (): Promise<Payment[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/payments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const returnData: {
                message?: string;
                data?: Payment[];
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to fetch payments");
            }

            if (!returnData.data) {
                throw new Error("No payment data returned from the API");
            }

            setPayments(returnData.data);
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

    // GET - Fetch a single payment by ID
    const fetchPaymentById = async (id: number): Promise<Payment> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/payments/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const returnData: {
                message?: string;
                data?: Payment;
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to fetch payment");
            }

            if (!returnData.data) {
                throw new Error("No payment data returned from the API");
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

    // GET - Fetch payments for a specific user by user ID(for admin)
    const fetchUserPayments = useCallback(async (userId: number): Promise<Payment[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/payments/user/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const returnData: {
                message?: string;
                data?: Payment[];
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to fetch user's payments");
            }

            if (!returnData.data) {
                throw new Error("No payment data returned from the API");
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

    // GET - Fetch logged-in user's own payments
    const fetchMyPayments = useCallback(async (): Promise<Payment[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/payments/my-payments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const returnData: {
                message?: string;
                data?: Payment[];
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to fetch user's payments");
            }

            if (!returnData.data) {
                throw new Error("No payment data returned from the API");
            }

            setPayments(returnData.data);
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

    // POST - Create a new payment
    const createPayment = async (data: CreatePayment): Promise<Payment> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/payments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const returnData: {
                message?: string;
                data?: Payment;
            } = await response.json();

            if (!response.ok) {
                throw new Error(returnData.message || "Failed to create payment");
            }

            if (!returnData.data) {
                throw new Error("No payment data returned from the API");
            }

            setPayments((prevPayments) => [...prevPayments, returnData.data!]);
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
       payments,
       fetchAllPayments,
       fetchPaymentById,
       fetchUserPayments,
       fetchMyPayments,
       createPayment,
    };
}