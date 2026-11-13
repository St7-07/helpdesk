import { Navigate, Outlet, useLocation, type Location } from "react-router";
import { useSession } from "../lib/session";

/**
 * Renders its child routes only when signed out. Once signed in (including
 * right after a successful login) it goes to the page the user was sent
 * from by `<ProtectedRoute>`, or home.
 */
export default function GuestRoute() {
  const session = useSession();
  const location = useLocation();

  if (session) {
    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }
  return <Outlet />;
}
