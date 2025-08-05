/**
 * Protected Route Component
 * Handles route protection based on authentication and user roles
 */
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'guru' | 'siswa')[];
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, token, getProfile, isLoading } = useAuthStore();
  const location = useLocation();
  
  // Try to get profile if we have token but no user data
  useEffect(() => {
    if (token && !user && !isLoading) {
      getProfile().catch(() => {
        // If profile fetch fails, user will be redirected to login
      });
    }
  }, [token, user, isLoading, getProfile]);
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Redirect to login if user data is missing
  if (requireAuth && isAuthenticated && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role-based access
  if (requireAuth && user && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const dashboardPath = getDashboardPath(user.role);
      return <Navigate to={dashboardPath} replace />;
    }
  }
  
  // Render children if all checks pass
  return <>{children}</>;
}

// Helper function to get dashboard path based on role
function getDashboardPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'guru':
      return '/guru/dashboard';
    case 'siswa':
      return '/siswa/dashboard';
    default:
      return '/login';
  }
}

// Convenience components for specific roles
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

export function GuruRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'guru']}>
      {children}
    </ProtectedRoute>
  );
}

export function SiswaRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['siswa']}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'guru', 'siswa']}>
      {children}
    </ProtectedRoute>
  );
}