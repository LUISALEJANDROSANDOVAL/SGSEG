import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type Rol } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Rol[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, checkRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-800">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
          <Loader2 className="size-8 animate-spin text-[#c8102e]" />
          <p className="text-sm font-semibold text-gray-700">Verificando sesión académica...</p>
          <span className="text-xs text-gray-400">UTEPSA · SGSEG</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirigir a login preservando la ubicación intentada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !checkRole(allowedRoles)) {
    // Redirigir al panel principal si no tiene rol autorizado
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
