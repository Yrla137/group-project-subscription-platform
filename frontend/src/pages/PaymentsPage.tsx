import { useEffect, useState } from "react";
import { usePayments } from "../hooks/usePayments";
import type { PaymentWithTier } from "../types/PaymentType";
import { useAuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import "./PaymentsPage.css";

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
        <div className="payments-page">

            <div className="payments-header">
            <h2 className="payments-title">
                Payment History
            </h2>

            <p className="payments-subtitle">
                View your payment history and membership details.
            </p>
            </div>

            {paymentsError && (
            <p className="payments-error">
                Error: {paymentsError}
            </p>
            )}

            {paymentsLoading ? (
            <div className="payments-loading">
                <Spinner />
            </div>
            ) : payments.length === 0 ? (
            <div className="payments-empty">
                <h3>You have no payments yet</h3>
            </div>
            ) : (
            <section className="payments-card">

                <div className="payments-card-header">
                <h2>Your Payments</h2>
                     <p>Your previous membership payments.</p>
                </div>

                <div className="payments-table-wrapper">
                <table className="payments-table">
                    <thead>
                    <tr>
                        <th>Tier</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Payment Date</th>
                    </tr>
                    </thead>

                    <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id}>
                        <td data-label="Tier">
                            {payment.tier_title}
                        </td>

                        <td data-label="Description">
                            {payment.tier_description}
                        </td>

                        <td data-label="Amount">
                            {payment.amount}
                        </td>

                        <td data-label="Payment Date">
                            {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

            </section>
            )}

            <div className="payments-navigation">
            <Link to="/profile" className="payments-back-link">
                ← Back to Profile
            </Link>
            </div>

        </div>
    );
};

export default PaymentsPage;