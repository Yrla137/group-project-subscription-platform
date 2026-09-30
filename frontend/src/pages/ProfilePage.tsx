import { useState, useEffect } from "react";
import { useUsers } from "../hooks/useUsers";
import { useAuthContext } from "../context/AuthContext";
import type { UserWithTier } from "../types/UserType";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import "./ProfilePage.css";

import { Settings } from "lucide-react";

const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState<UserWithTier | null>(null);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        first_name: "",
        last_name: "",
        email: ""
    });

    const { error, isLoading, fetchUserProfile, updateUser } = useUsers();
    const { token, loading: authLoading } = useAuthContext();

    useEffect(() => {
        const getUserProfile = async () => {

            try {
                const profileData = await fetchUserProfile();
                setUserProfile(profileData);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        // Checks if token is available and authLoading is false before fetching user profile
        if (token && !authLoading) {
            getUserProfile();
        }
    }, [token, authLoading, fetchUserProfile]);

    // Function to handle edit profile button click //
    const handleEditProfile = () => {

        // Check if userProfile is not null before accessing its properties
        if (userProfile) {
            setEditForm({
                first_name: userProfile.first_name,
                last_name: userProfile.last_name,
                email: userProfile.email
            });
            setEditing(true);
        }
    };

    // Function to handle input changes in the edit form //
    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    // Function to handle profile update form submission //
    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await updateUser(editForm);
            const updatedProfile = await fetchUserProfile();
            setUserProfile(updatedProfile);
            setEditing(false);
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    };

    // Function to cancel editing //
    const handleCancelEdit = () => {
        setEditing(false);
    };

  return (
    <div className="profile-page">

      <div className="profile-navigation-links">
        <Link to="/profile" className="profile-nav-link">
          Profile
        </Link>

        <Link to="/payments-page" className="profile-nav-link">
          Payments
        </Link>
      </div>

      <div className="profile-header">
        <h1 className="profile-title">
          Profile
        </h1>

        <p className="profile-subtitle">
          Manage your account information.
        </p>
      </div>

      {isLoading && !userProfile && (
        <div className="profile-loading">
          <Spinner />
        </div>
      )}

      {error && (
        <p className="profile-error">
          {error}
        </p>
      )}

      {userProfile && (
        editing ? (

          <form
            className="edit-profile-form"
            onSubmit={handleUpdateProfile}
          >

            <div className="edit-profile-header">
              <h2 className="edit-profile-title">
                Edit Profile
              </h2>

              <p>
                Update your account information.
              </p>
            </div>

            <div className="edit-profile-field">
              <label
                className="edit-profile-label"
                htmlFor="profile-first-name"
              >
                First Name
              </label>

              <input
                id="profile-first-name"
                className="edit-profile-input"
                type="text"
                name="first_name"
                value={editForm.first_name}
                onChange={handleEditFormChange}
                required
              />
            </div>

            <div className="edit-profile-field">
              <label
                className="edit-profile-label"
                htmlFor="profile-last-name"
              >
                Last Name
              </label>

              <input
                id="profile-last-name"
                className="edit-profile-input"
                type="text"
                name="last_name"
                value={editForm.last_name}
                onChange={handleEditFormChange}
                required
              />
            </div>

            <div className="edit-profile-field">
              <label
                className="edit-profile-label"
                htmlFor="profile-email"
              >
                Email
              </label>

              <input
                id="profile-email"
                className="edit-profile-input"
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                required
              />
            </div>

            <div className="edit-profile-actions">

              <button
                className="edit-profile-save-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : "Save Changes"}
              </button>

              <button
                className="edit-profile-cancel-button"
                type="button"
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                Cancel
              </button>

            </div>

          </form>

        ) : (

          <section className="profile-info">

            <div className="profile-info-header">
              <div>
                <h2 className="profile-info-heading">
                  Account Information
                </h2>

                <p>
                  Your personal account details.
                </p>
              </div>

              <button
                className="edit-profile-button"
                type="button"
                onClick={handleEditProfile}
                aria-label="Edit Profile"
              >
                <Settings
                  className="edit-profile-icon"
                  size={24}
                  strokeWidth={2.3}
                />
              </button>
            </div>

            <div className="profile-details">

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Name
                </span>

                <span className="profile-detail-value">
                  {userProfile.first_name} {userProfile.last_name}
                </span>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Email
                </span>

                <span className="profile-detail-value">
                  {userProfile.email}
                </span>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Tier
                </span>

                <span className="profile-tier">
                  {userProfile.tier_title}
                  <span>
                    Level {userProfile.level_number}
                  </span>
                </span>
              </div>

            </div>

          </section>
        )
      )}

    </div>
  )
};

export default ProfilePage;
