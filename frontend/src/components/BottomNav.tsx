import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuthContext();

  if (loading || !user) {
    console.log("BottomNav status - loading:", loading, "user:", user);
      return null;
    }

  const isActive = (path: string) => location.pathname === path;


  return (
    <nav className="bottom-nav">
      <Link to="/" className={isActive("/") ? "active" : ""}>
       <span>Calendar</span>
      </Link>
      <Link to="/habits" className={isActive("/habits") ? "active" : ""}>
       <span>Habits</span>
      </Link>      
      <Link to="/seminars" className={isActive("/seminars") ? "active" : ""}>
       <span>Seminars</span>
      </Link>
      <Link to="/membership" className={isActive("/membership") ? "active" : ""}>
       <span>Membership</span>
      </Link>
    </nav>
  );
};

export default BottomNav;