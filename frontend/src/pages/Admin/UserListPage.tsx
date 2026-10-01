import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import type { User } from "../../types/UserType";
import { Link, useNavigate } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { usePayments } from "../../hooks/usePayments";
import { Receipt, Trash2 } from "lucide-react";
import Spinner from "../../components/Spinner";
import "./UserListPage.css";

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
    <div className="users-page">

      <section className="users-header">
        <div className="users-header-content">
          <h1 className="users-title">Users</h1>
          <p className="users-subtitle">
            View and manage users in the system.
          </p>
        </div>
      </section>

      <main className="users-content">

        {userError && (
          <div className="users-error">
            <p>{userError}</p>
          </div>
        )}

        {isUserListLoading ? (
          <div className="users-loading">
            <Spinner />
          </div>
        ) : (
          <section className="users-list-section">

            <div className="users-list-header">
              <div>
                <h2>All Users</h2>
                <p>
                  {users.length} {users.length === 1 ? "user" : "users"} in the system
                </p>
              </div>
            </div>

            {users.length === 0 ? (
              <div className="users-empty">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="users-list">

                {users.map((user) => (
                  <div className="user-list-item" key={user.id}>

                    <div className="user-info">

                      <div className="user-avatar">
                        {user.first_name.charAt(0)}
                        {user.last_name.charAt(0)}
                      </div>

                      <div className="user-details">
                        <h3>
                          {user.first_name} {user.last_name}
                        </h3>

                        <p>{user.email}</p>
                      </div>

                    </div>

                    <div className="user-role">
                      <span>{user.role}</span>
                    </div>

                    {user.role !== "administrator" && (
                      <div className="user-actions">

                        <button
                          className="user-action-button payment-button"
                          aria-label="View Payments"
                          onClick={() => handleViewPayments(user)}
                          disabled={isPaymentsLoading}>
                          {isPaymentsLoading ? (
                            <Spinner />
                          ) : (
                            <Receipt size={21} strokeWidth={2.5} />
                          )}
                        </button>

                        <button
                          className="user-action-button delete-button"
                          aria-label="Delete User"
                          onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 size={21} strokeWidth={2.5} />
                        </button>

                      </div>
                    )}

                  </div>
                ))}

              </div>
            )}

          </section>
        )}

        {showDeleteModal && userToDelete !== null && (
          <div className="user-modal-overlay">

            <div className="user-delete-modal">

              <h2>Delete User?</h2>

              <p>
                Are you sure you want to delete this user?
                This action cannot be undone.
              </p>

              <div className="user-modal-actions">

                <button
                  className="modal-cancel-button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  disabled={isUserListLoading}>
                  Cancel
                </button>

                <button
                  className="modal-delete-button"
                  onClick={handleConfirmDelete}
                  disabled={isUserListLoading}>
                  {isUserListLoading ? <Spinner /> : "Yes, Delete"}
                </button>

              </div>
            </div>
          </div>
        )}

        <div className="users-back-link">
          <Link to="/admin">
            Back to Admin Panel
          </Link>
        </div>

      </main>

    </div>
  );
};

export default UserListPage;