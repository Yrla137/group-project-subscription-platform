import { useAuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface AdminRouteProps {
    children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {

    const { user, loading: authLoading } = useAuthContext();

    if (authLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "administrator") {
        return <Navigate to="/profile" replace />;
    }

    return children;
};

export default AdminRoute;