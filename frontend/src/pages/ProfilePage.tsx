import { useState, useEffect } from "react";
import { useUsers } from "../hooks/useUsers";
import { useAuthContext } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import type { UserWithTier } from "../types/UsersType";

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

        <LogoutButton />

      <h1 className="profile-title">
        Profile
      </h1>

      {isLoading && !userProfile && (
        <p className="profile-loading">
          Loading profile...
        </p>
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
            onSubmit={handleUpdateProfile}>

            <h2 className="edit-profile-title">
              Edit Profile
            </h2>

            <div className="edit-profile-field">

              <label
                className="edit-profile-label"
                htmlFor="profile-first-name">
                First Name
              </label>

              <input
                id="profile-first-name"
                className="edit-profile-input"
                type="text"
                name="first_name"
                value={editForm.first_name}
                onChange={handleEditFormChange}
                required/>

            </div>

            <div className="edit-profile-field">

              <label
                className="edit-profile-label"
                htmlFor="profile-last-name">
                Last Name
              </label>

              <input
                id="profile-last-name"
                className="edit-profile-input"
                type="text"
                name="last_name"
                value={editForm.last_name}
                onChange={handleEditFormChange}
                required/>

            </div>

            <div className="edit-profile-field">

              <label
                className="edit-profile-label"
                htmlFor="profile-email">
                Email
              </label>

              <input
                id="profile-email"
                className="edit-profile-input"
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                required/>

            </div>

            <div className="edit-profile-actions">

              <button
                className="edit-profile-save-button"
                type="submit"
                disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </button>

              <button
                className="edit-profile-cancel-button"
                type="button"
                onClick={handleCancelEdit}
                disabled={isLoading}>
                Cancel
              </button>

            </div>

          </form>
        ) : (
          <div className="profile-info">

            <h2 className="profile-info-heading">
              Account Information
            </h2>

            <p className="profile-name">
              <strong>Name:</strong>
                <span>
                    {userProfile.first_name} {userProfile.last_name}
                </span>
            </p>

            <p className="profile-email">
              <strong>Email:</strong>
              <span>
                {userProfile.email}
              </span>
            </p>

            <p className="tier-level-role">
              <strong>Tier:</strong>
              <span>
                {userProfile.tier_title} (Level {userProfile.level_number})
              </span>
            </p>

            <button
              className="edit-profile-button"
              type="button"
              onClick={handleEditProfile}>
              <Settings className="edit-profile-icon" />

              Edit Profile
            </button>

          </div>

        )
      )}

    </div>
  );
};


export default ProfilePage;