import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import type { UserWithTier } from '../../types/UserType';
import Spinner from '../../components/Spinner';
import './AdminPage.css';

const AdminPage = () => {

  const [adminInfo, setAdminInfo] = useState<UserWithTier | null>(null);
  const { loading: authLoading } = useAuthContext();
  const { fetchUserProfile, isLoading: isAdminLoading } = useUsers();

  useEffect(() => {

    const getAdminInfo = async () => {

      if (!authLoading) {

        try {
          const profileData = await fetchUserProfile();
          setAdminInfo(profileData);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };
    };

    getAdminInfo();
  }, [authLoading, fetchUserProfile]);

  return (
    <div className="admin-page">

      <section className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">
            Manage users, tiers, seminars and default habits.
          </p>
        </div>
      </section>

      <main className="admin-content">

        {isAdminLoading ? (
          <div className="admin-loading">
            <Spinner />
          </div>
        ) : (
          adminInfo && (
            <section className="admin-welcome-card">
              <div className="admin-welcome-content">
                <p className="admin-welcome-label">Welcome back</p>

                <h2 className="admin-welcome-title">
                  {adminInfo.first_name} {adminInfo.last_name}
                </h2>

                <p className="admin-role">
                  Role: <span>{adminInfo.role}</span>
                </p>
              </div>
            </section>
          )
        )}

        <section className="admin-management-section">
          <div className="admin-section-header">
            <h2>Management</h2>
            <p>Choose what you want to manage.</p>
          </div>

          <div className="admin-management-grid">

            <Link
              to="/admin/tiers"
              className="admin-management-card">
              <div className="admin-card-icon">T</div>

              <div className="admin-card-content">
                <h3>Manage Tiers</h3>
                <p>
                  Create and manage subscription tiers and their limits.
                </p>
              </div>

              <span className="admin-card-arrow">→</span>
            </Link>

            <Link
              to="/admin/users"
              className="admin-management-card">
              <div className="admin-card-icon">U</div>

              <div className="admin-card-content">
                <h3>Manage Users</h3>
                <p>
                  View users, manage accounts and check payment history.
                </p>
              </div>

              <span className="admin-card-arrow">→</span>
            </Link>

            <Link
              to="/admin/seminars"
              className="admin-management-card">
              <div className="admin-card-icon">S</div>

              <div className="admin-card-content">
                <h3>Manage Seminars</h3>
                <p>
                  Create and manage seminars available to your users.
                </p>
              </div>

              <span className="admin-card-arrow">→</span>
            </Link>

            <Link
              to="/admin/habits"
              className="admin-management-card">
              <div className="admin-card-icon">H</div>

              <div className="admin-card-content">
                <h3>Manage Default Habits</h3>
                <p>
                  Manage the default habits available in the application.
                </p>
              </div>

              <span className="admin-card-arrow">→</span>
            </Link>

          </div>
        </section>

      </main>

    </div>
  )
}

export default AdminPage;