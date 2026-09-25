import type { PaymentWithTier } from "../../types/PaymentType";
import { Link, useLocation} from "react-router-dom";
import type { User } from "../../types/UserType";

const UserPaymentsPage = () => {

    // Using useLocation to access the state passed from the UserListPage
    // Gets user and payment data passed through navigation state.
    // Uses fallback values if no state is provided.
    const location = useLocation();
    const userPaymentsParam: PaymentWithTier[] = location.state?.userPayments ?? [];
    const userParam: User | null = location.state?.user ?? null;

    return (
        <div>
            <h1>User Payments</h1>

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
                    {userPaymentsParam.length === 0 ? (
                        <tr>
                            <td colSpan={4}>No payments found for this user.</td>
                        </tr>
                    ) : (
                        userPaymentsParam.map((payment) => (
                            <tr key={payment.id}>
                                {userParam ? (
                                    <td>
                                        {userParam.first_name} {userParam.last_name}
                                    </td>
                                ) : (
                                    <td>Unknown User</td>
                                )}

                                <td>{payment.tier_title}</td>
                                <td>{payment.amount}</td>
                                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div>
                <button>
                    <Link to="/admin/users">Back to User List</Link>
                </button>
            </div>
        </div>
    )
};

export default UserPaymentsPage;