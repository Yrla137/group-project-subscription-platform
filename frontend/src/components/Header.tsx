import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import userpic from "../assets/userpic.jpg";

interface HeaderProps {
  userName?: string;
  userTier?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userName = "Linnea",
  userTier = "Focus Pass",
  // avatarUrl = "https://via.placeholder.com/40",
  onLogout = () => console.log("Logging out..."),
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="app-header">

      <div className="header-left">
        <Link to="/" className="logo-container">

          <span className="logo-icon"><img src={logo} alt="Lifesync-logo" height="40px" /></span>
        </Link>
      </div>

      <div className="header-right">
        <div 
          className="user-profile-menu" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img src={userpic} alt="Användaravatar" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-tier-badge">{userTier}</span>
          </div>
        </div>

        {dropdownOpen && (
          <div className="dropdown-popup">
            <Link to="/membership" className="dropdown-item">
              Membership
            </Link>
            <Link to="/membership" className="dropdown-item">
              Membership
            </Link>
            <button onClick={onLogout} className="dropdown-item logout-btn">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;