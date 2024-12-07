import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

interface ProtectedRouteProps {
  requiredRoles: string[]; // Allow multiple roles
}

const ProtectedRoute = ({ requiredRoles }: ProtectedRouteProps) => {
  const { user } = useAuthStore();
  console.log("User in ProtectedRoute:", user); // Debugging

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }

  if (
    requiredRoles.length &&
    !requiredRoles.some((role) => user.roles.includes(role))
  ) {
    return <Navigate to="/login" />; // Redirect to unauthorized page if role doesn't match
  }

  return <Outlet />;
};

export default ProtectedRoute;
