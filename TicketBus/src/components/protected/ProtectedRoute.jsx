/* eslint-disable no-unused-vars */
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role;

        if (requiredRole && role !== requiredRole) {
            return <Navigate to="/dashboard" replace />;
        }

        return children;
    } catch (error) {
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;