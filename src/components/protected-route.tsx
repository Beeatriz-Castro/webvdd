import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/lib/auth-context";

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (user?.role === "ADMIN" && location.pathname.startsWith("/customer")) {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role !== "ADMIN" && location.pathname.startsWith("/admin")) {
    return <Navigate to="/customer/models" replace />;
  }

  return <Outlet />;
}