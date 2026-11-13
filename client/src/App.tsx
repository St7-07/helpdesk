import { Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
