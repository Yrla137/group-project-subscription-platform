import { useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import type { User } from "../../types/UserType";
import { Link } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { usePayments } from "../../hooks/usePayments";
import { useNavigate } from "react-router-dom";

const UserListPage = () => {

  const [users, setUsers] = useState<User[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const { error: userDataError, isLoading: isUserListLoading, fetchUsers, deleteUser } = useUsers();
  const { fetchPaymentByUserId } = usePayments();

  const { loading: authLoading } = useAuthContext();

  const navigate = useNavigate();

  // Fetch all users when the component mounts
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
  const handleViewPayments = async (userId: number) => {

    try {
      const userPayments = await fetchPaymentByUserId(userId);

      if (userPayments) {
        navigate(`/admin/user-payments/${userId}`);
      }
    } catch (error) {
      console.error("Error fetching payments for user:", error);
    }

  };

  // Open delete confirmation modal
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
            {userDataError && <p>Error: {userDataError}</p>}

            {isUserListLoading ? (
                <p>Loading users...</p>
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
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.first_name} {user.last_name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button onClick={() => handleViewPayments(user.id)}>View Payments</button>
                                </td>

                                {user.role !== "administrator" && (
                                  <td>
                                    <button onClick={() => handleDeleteUser(user.id)}>Delete User</button>
                                  </td>
                                )}

                            </tr>
                        ))}
                        {showDeleteModal && userToDelete !== null && (
                            <div className="modal">
                              <div className="modal-content">
                                    <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                                    <button onClick={handleConfirmDelete}>Yes</button>
                                    <button
                                      onClick={() => {
                                        setShowDeleteModal(false);
                                        setUserToDelete(null);
                                      }}>
                                      Cancel
                                    </button>
                              </div>
                            </div>
                        )}
                    </tbody>
                </table>
            )}

            <div className="admin-profile-button">
                <Link to="/admin">Back to Admin Profile</Link>
            </div>
        </div>
    );
};

export default UserListPage;