import React, { createContext, useContext, useState, useEffect } from 'react';
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Obtener datos del perfil actual utilizando el token
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error('Error al inicializar sesión', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

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

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
