import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import type { User } from "../../types/UserType";
import { Link, useNavigate } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { usePayments } from "../../hooks/usePayments";
import { Receipt, Trash2 } from "lucide-react";
import Spinner from "../../components/Spinner";

const UserListPage = () => {

  const [users, setUsers] = useState<User[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const { error: userError, isLoading: isUserListLoading, fetchUsers, deleteUser } = useUsers();
  const { fetchPaymentByUserId, isLoading: isPaymentsLoading } = usePayments();

  const { loading: authLoading } = useAuthContext();

  const navigate = useNavigate();

  // Fetching all users
  useEffect(() => {
    const getUsersList = async () => {

        try {
          if (!authLoading) {

            const usersList = await fetchUsers();
            setUsers(usersList);
          }

        } catch (error) {
          console.error("Error fetching users:", error);
        }
    };
    getUsersList();
  }, [fetchUsers, authLoading]);

  // View payments for a specific user
  const handleViewPayments = async (user: User) => {

    try {
      const userPayments = await fetchPaymentByUserId(user.id);

        navigate(`/admin/user-payments/${user.id}`, { state: { userPayments, user } });

    } catch (error) {
      console.error("Error fetching payments for user:", error);
    }

  };

  // Open delete confirmation
  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find((user) => user.id === userId);

    if (userToDelete?.role === "administrator") {
      return;
    }

    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  // Confirm deletion modal
const handleConfirmDelete = async () => {
  if (userToDelete !== null) {
    try {
      await deleteUser(userToDelete);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete)
      );

    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  setShowDeleteModal(false);
  setUserToDelete(null);
};


    return (
        <div>
            <h1>Users in the System</h1>
            {userError && <p>Error: {userError}</p>}

            {isUserListLoading ? (
                <Spinner />
              ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name:</th>
                            <th>Email:</th>
                            <th>Role:</th>
                            <th>Actions:</th>
                        </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4}>No users found.</td>
                        </tr>
                      ) : users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.first_name} {user.last_name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>

                                <td>
                                {user.role !== "administrator" && (
                                  <div className="action-buttons">
                                    <button
                                        aria-label="View Payments"
                                        onClick={() => handleViewPayments(user)}
                                        disabled={isPaymentsLoading}>
                                        {isPaymentsLoading ? <Spinner /> : <Receipt />}
                                    </button>

                                    <button aria-label="Delete User" onClick={() => handleDeleteUser(user.id)}>
                                      <Trash2 />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showDeleteModal && userToDelete !== null && (
              <div className="modal">
                <div className="modal-content">
                    <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isUserListLoading}>
                            {isUserListLoading ? <Spinner /> : "Yes"}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteModal(false);
                            setUserToDelete(null);}}
                          disabled={isUserListLoading}>
                          Cancel
                      </button>
                  </div>
              </div>
            )}

            <div className="admin-profile-button">
              <Link to="/admin">Back to Admin Profile</Link>
            </div>
        </div>
    );
};

export default UserListPage;