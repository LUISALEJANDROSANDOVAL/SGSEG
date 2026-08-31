import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type Rol } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Rol[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] text-white">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-neutral-400">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirigir a login guardando la ubicación previa
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir al panel principal si no tiene rol autorizado
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
