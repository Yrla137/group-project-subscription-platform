import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={isActive("/") ? "active" : ""}>
       <span>Kalender</span>
      </Link>
      <Link to="/habits" className={isActive("/habits") ? "active" : ""}>
       <span>Vanor</span>
      </Link>      
      <Link to="/seminars" className={isActive("/seminars") ? "active" : ""}>
       <span>Seminarier</span>
      </Link>
      <Link to="/membership" className={isActive("/membership") ? "active" : ""}>
       <span>Medlemskap</span>
      </Link>
    </nav>
  );
};

export default BottomNav;