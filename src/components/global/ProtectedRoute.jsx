import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && decoded.role !== requiredRole) {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
