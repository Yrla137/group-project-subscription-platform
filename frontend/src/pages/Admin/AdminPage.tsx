import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import type { UserWithTier } from '../../types/UserType';
import Spinner from '../../components/Spinner';

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
    <div>
      <h1>Admin Panel</h1>

      {isAdminLoading ? (
        <Spinner />
      ) : (
        adminInfo && (
          <div>
            <p>Welcome, {adminInfo.first_name} {adminInfo.last_name}!</p>
            <p>Role: {adminInfo.role}</p>
          </div>
        )
      )}

      <Link to="/admin/tiers">Manage Tiers</Link>

      <Link to="/admin/users">Manage Users</Link>

      <Link to="/admin/seminars">Manage Seminars</Link>

      <Link to="/admin/habits">Manage Default Habits</Link>

    </div>
  )
}

export default AdminPage