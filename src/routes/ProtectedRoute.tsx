import React, { JSX } from "react";
import { Navigate,  useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: ("GUEST" | "HOST" | "ADMIN")[];
}

interface JwtPayload {
  email: string;
  role: "GUEST" | "HOST" | "ADMIN";
  exp?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded: JwtPayload = jwtDecode(token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(decoded.role)) {
      const routeMap: Record<string, string> = {
        GUEST: "/guest/dashboard",
        HOST: "/host/dashboard",
        ADMIN: "/admin/dashboard",
      };
      return (
        <Navigate
          to={routeMap[decoded.role] || "/"}
          state={{ from: location }}
          replace
        />
      );
    }

    // ✅ FIX: Return only the children. The child component (DashboardLayout)
    // is responsible for rendering the nested routes via its own <Outlet />.
    return children;
    
  } catch (error) {
    console.error("Invalid or corrupted token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;