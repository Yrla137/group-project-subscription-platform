import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {

    const { logout } = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <div className="logout-button">
            <button onClick={handleLogout}>Logout</button>
        </div>
  )
}

export default LogoutButton