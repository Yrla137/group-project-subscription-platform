import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { Calendar } from "lucide-react";
import { CheckCheck } from "lucide-react";
import { BookOpenText } from "lucide-react";
import { Crown } from "lucide-react";

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuthContext();

  if (loading || !user) {
  
      return null;
    }

  const isActive = (path: string) => location.pathname === path;


  return (
    <nav className="bottom-nav">
      <Link to="/" className={isActive("/") ? "active" : ""}>
       <span className="link-text"><Calendar size={20} strokeWidth={3} />Calendar</span>
      </Link>
      <Link to="/habits" className={isActive("/habits") ? "active" : ""}>
       <span className="link-text"><CheckCheck />Habits</span>
      </Link>      
      <Link to="/seminars" className={isActive("/seminars") ? "active" : ""}>
       <span className="link-text"><BookOpenText />Seminars</span>
      </Link>
      <Link to="/tiers" className={isActive("/tiers") ? "active" : ""}>
       <span className="link-text"><Crown />Membership</span>
      </Link>
    </nav>
  );
};

export default BottomNav;

