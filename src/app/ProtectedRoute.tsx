import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../store/useAppStore';

export function ProtectedRoute({
  allow,
  children,
}: {
  allow: Array<'admin' | 'sales' | 'client'>;
  children: ReactElement;
}) {
  const { user, authStatus } = useSession();
  const location = useLocation();

  if (authStatus === 'loading') {
    return <div className="flex min-h-screen items-center justify-center bg-ink text-white">Cargando sesión segura...</div>;
  }

  if (!user) {
    return <Navigate to="/acceso" replace state={{ from: location.pathname }} />;
  }

  if (!allow.includes(user.roleKind)) {
    return <Navigate to="/acceso" replace state={{ from: location.pathname }} />;
  }

  return children;
}
