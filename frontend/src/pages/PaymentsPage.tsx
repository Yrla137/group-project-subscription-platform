import { useEffect, useState } from "react";
import { usePayments } from "../hooks/usePayments";
import type { PaymentWithTier } from "../types/PaymentType";
import { useAuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const PaymentsPage = () => {

    const { error: paymentsError, isLoading: paymentsLoading, fetchMyPayments } = usePayments();
    const [payments, setPayments] = useState<PaymentWithTier[]>([]);

    const { loading: authLoading } = useAuthContext();

    useEffect(() => {
        const getPayments = async () => {

            if (!authLoading) {
            try {
                const paymentData = await fetchMyPayments();
                setPayments(paymentData);
            } catch (error) {
                console.error("Error fetching payments:", error);
            }
            }
        };

        getPayments();

    }, [fetchMyPayments, authLoading]);

    return (
    <div>
        <h1>My Payments</h1>

        {paymentsError && <p>Error: {paymentsError}</p>}

        {paymentsLoading ? (
            <p>Loading payments...</p>
        ) : (payments.length === 0 ? (
            <p>You have no payments yet.</p>
        ) : (
            <table>
                <thead>
                    <tr>
                        <th>Tier Title:</th>
                        <th>Tier Description:</th>
                        <th>Amount:</th>
                        <th>Payment Date:</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id}>
                            <td>{payment.id}</td>
                            <td>{payment.tier_title}</td>
                            <td>{payment.tier_description}</td>
                            <td>{payment.amount}</td>
                            <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ))}

        <div className="profile-navigation">
            <Link to="/profile" className="profile-nav-link">
                Back to Profile
            </Link>
        </div>
    </div>
    );
};

export default PaymentsPage;