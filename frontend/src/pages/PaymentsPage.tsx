import { useEffect, useState } from "react";
import { usePayments } from "../hooks/usePayments";
import type { Payment } from "../types/PaymentType";
import { useAuthContext } from "../context/AuthContext";

const PaymentsPage = () => {

    const { error, isLoading, fetchUserPayments } = usePayments();
    const [payments, setPayments] = useState<Payment[]>([]);

    const { loading: authLoading } = useAuthContext();

    useEffect(() => {

        const loadPayments = async () => {

            if(!authLoading) {

                try {
                    const userPayments = await fetchUserPayments();
                    setPayments(userPayments);
                } catch (error) {
                    console.error("Error fetching payments:", error);
                }
            }
        };

        loadPayments();
    }, [fetchUserPayments, authLoading]);

    return (
        <div>
            <h1>My Payments</h1>
        </div>
    );
};

export default PaymentsPage;