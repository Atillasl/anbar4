import { Navigate } from "react-router-dom";

/**
 * Protected Route Component
 * Checks if user is authenticated before allowing access
 * FIXED: Now uses consistent 'isLoggedIn' key matching App.jsx
 */
export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
