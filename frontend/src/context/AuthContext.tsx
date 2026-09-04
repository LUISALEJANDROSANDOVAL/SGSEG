import React, { createContext, useContext, useState } from 'react';
import api from '../lib/api';

export type Rol = 'Coordinador General' | 'Secretario de Facultad' | 'Jefe de Carrera' | 'Vicerrectorado' | 'Registro' | 'Defensas de Grado';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  carreraId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsRole: (rol: Rol) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Usuario invitado (acceso sin cuenta) ──────────────────────────────────
const GUEST_USER: User = {
  id: 'guest',
  email: 'invitado@sgseg.com',
  nombre: 'Invitado',
  rol: 'Coordinador General',
};
// ────────────────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Modo sin backend: el usuario invitado se establece desde el primer render
  const [user, setUser] = useState<User | null>(GUEST_USER);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading] = useState(false);

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      const { access_token, user: loggedUser } = res.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(loggedUser);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al iniciar sesión';
      throw new Error(msg);
    }
  };

  const loginAsRole = (rol: Rol) => {
    setUser({
      id: 'guest',
      email: rol === 'Jefe de Carrera' ? 'jefe.sistemas@utepsa.edu.bo' : 'invitado@sgseg.com',
      nombre: rol === 'Jefe de Carrera' ? 'Ing. Carlos Mendoza (Jefe de Carrera)' : 'Invitado',
      rol,
      carreraId: rol === 'Jefe de Carrera' ? '1' : undefined,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null); // redirige al login para seleccionar rol
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginAsRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
