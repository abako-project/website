import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { LoadingScreen } from './LoadingScreen';
import { useCurrentUser } from '@hooks/useAuth';

/**
 * ProtectedRoute - Route guard for authenticated pages
 *
 * Checks if the user is authenticated:
 * - If yes, renders the child routes via Outlet
 * - If no, redirects to /login
 * - While checking, shows a loading screen
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isLoading } = useCurrentUser({ enabled: isAuthenticated });

  // Show loading screen while verifying authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render protected content
  return <Outlet />;
}
