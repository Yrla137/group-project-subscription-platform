import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { usePayments } from "../../hooks/usePayments";
import type { PaymentWithTier } from "../../types/PaymentType";
import type { UserWithTier } from "../../types/UserType";

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
        <div>
            <h1>User Payments</h1>

            {isLoading && <p>Loading payments...</p>}

            {error && <p>{error}</p>}

            {!isLoading && !error && (
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Tier</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {userPayments.length === 0 ? (
                            <tr>
                                <td colSpan={4}>
                                    No payments found for this user.
                                </td>
                            </tr>
                        ) : (
                            userPayments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>
                                        {user
                                            ? `${user.first_name} ${user.last_name}`
                                            : "Unknown User"}
                                    </td>

                                    <td>{payment.tier_title}</td>
                                    <td>{payment.amount}</td>

                                    <td>
                                        {new Date(
                                            payment.payment_date
                                        ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            <div className="back-to-user-list-link">
                <Link to="/admin/users">
                    Back to User List
                </Link>
            </div>
        </div>
    );
};

export default UserPaymentsPage;