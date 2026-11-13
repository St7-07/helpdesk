import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../lib/session";

/** Renders its child routes only when signed in; otherwise goes to /login. */
export default function ProtectedRoute() {
  const session = useSession();
  const location = useLocation();

  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
