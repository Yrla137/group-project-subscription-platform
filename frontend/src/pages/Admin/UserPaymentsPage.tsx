import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { usePayments } from "../../hooks/usePayments";
import type { PaymentWithTier } from "../../types/PaymentType";
import type { UserWithTier } from "../../types/UserType";
import Spinner from "../../components/Spinner";
import "./UserPaymentsPage.css";

const UserPaymentsPage = () => {

    const { userId } = useParams<{ userId: string }>();
    const location = useLocation();

    const { fetchUserById } = useUsers();
    const { fetchPaymentByUserId } = usePayments();

    const [user, setUser] = useState<UserWithTier | null>(
        location.state?.user ?? null
    );

    const [userPayments, setUserPayments] = useState<PaymentWithTier[]>(
        location.state?.userPayments ?? []
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const loadUserPayments = async () => {

            if (!userId) {
                setError("No user ID provided.");
                return;
            }

            if (location.state?.user && location.state?.userPayments) {
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const id = Number(userId);

                const [userData, paymentData] = await Promise.all([
                    fetchUserById(id),
                    fetchPaymentByUserId(id)
                ]);

                setUser(userData);
                setUserPayments(paymentData);

            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load user payments.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadUserPayments();

    }, [
        userId,
        location.state,
        fetchUserById,
        fetchPaymentByUserId
    ]);

    return (
        <div className="user-payments-page">

            <section className="user-payments-header">
                <div className="user-payments-header-content">
                    <h1 className="user-payments-title">
                        User Payments
                    </h1>

                    {user && (
                        <p className="user-payments-subtitle">
                            Payment history for {user.first_name} {user.last_name}.
                        </p>
                    )}
                </div>
            </section>

            <main className="user-payments-content">

                {isLoading && (
                    <div className="user-payments-loading">
                        <Spinner />
                    </div>
                )}

                {error && (
                    <div className="user-payments-error">
                        <p>{error}</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <section className="payments-section">

                        <div className="payments-section-header">
                            <div>
                                <h2>Payment History</h2>

                                <p>
                                    {userPayments.length}{" "}
                                    {userPayments.length === 1
                                        ? "payment"
                                        : "payments"}{" "}
                                    found
                                </p>
                            </div>
                        </div>

                        {userPayments.length === 0 ? (
                            <div className="payments-empty">
                                <p>No payments found for this user.</p>
                            </div>
                        ) : (
                            <div className="payments-table-wrapper">
                                <table className="payments-table">

                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Tier</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {userPayments.map((payment) => (
                                            <tr key={payment.id}>

                                                <td data-label="User">
                                                    {user
                                                        ? `${user.first_name} ${user.last_name}`
                                                        : "Unknown User"}
                                                </td>

                                                <td data-label="Tier">
                                                    {payment.tier_title}
                                                </td>

                                                <td data-label="Amount">
                                                    {payment.amount}
                                                </td>

                                                <td data-label="Date">
                                                    {new Date(
                                                        payment.payment_date
                                                    ).toLocaleDateString()}
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        )}

                    </section>
                )}

                <div className="user-payments-back-link">
                    <Link to="/admin/users">
                        Back to User List
                    </Link>
                </div>

            </main>

        </div>
    );
};

export default UserPaymentsPage;