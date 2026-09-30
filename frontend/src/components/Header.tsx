import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useUsers } from "../hooks/useUsers";
import type { UserWithTier } from "../types/UserType";

import { Link } from "react-router-dom";
import logo_pic from "../assets/logo_pic.png";
import userpic from "../assets/userpic.jpg";

const Header: React.FC = () => {
  const { user: authUser, loading, logout, token } = useAuthContext();
  const { fetchUserProfile } = useUsers();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserWithTier | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (token) {
        try {
          const data = await fetchUserProfile();
          setProfileData(data);
        } catch (err) {
          console.error("Couldn't get profile to header", err);
        }
      }
    };

    if (!loading && authUser) {
      loadProfile();
    }
  }, [token, authUser, loading, fetchUserProfile]);

  if (loading)  {
      return (
        <header className="app-header">
        <div className="header-left">
          <Link to="/" className="logo-container">
            <div className="logo-icon"><img src={logo_pic} alt="Lifesync-logo"/></div>
          </Link>
        </div>
      </header>
            );
  }

  const isAdmin = profileData?.role === "administrator";
  
  return (
    <header className="app-header">

      <div className="header-left">
        <Link to="/" className="logo-container">
          <div className="logo-icon"><img src={logo_pic} alt="Lifesync-logo" height="600px" /></div>
        </Link>
        <div className="logo-text-group">
        <span className="logo-title">LifeSync</span>
        <p className="logo-subtitle">PLANNER</p>
      </div></div>

      <div className="header-right">
        {!authUser ? (
          <Link to="/login" className="primary-btn">
            Log in
          </Link>
        ) : (
          <div className="user-menu-wrapper" style={{ position: "relative" }}>
        <div 
          className="user-profile-menu" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          
          <div className="user-info">
            <span className="user-name">{profileData ? profileData.first_name : "User"}</span>
            <span className="user-tier-badge">{profileData ? profileData.tier_title : "Tier level"}</span>
          </div>
          <img src={userpic} alt="User-avatar" className="user-avatar" />
        </div>

        {dropdownOpen && (
          <div className="dropdown-popup">

            {isAdmin && (
                  <Link to="/admin" className="dropdown-item-admin">
                    Admin Dashboard
                  </Link>
                )}            
            
            <Link to="/profile" className="dropdown-item">
              Profile
            </Link>

            <Link to="/stats" className="dropdown-item">
              Statistics
            </Link>

            <button onClick={logout} className="dropdown-item logout-btn">
              Log out
            </button>
           </div>
          )}
      </div>
      )}
    </div>
  </header>
  );
};

export default Header;