import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export type RolCode =
  | 'COORDINACION'
  | 'JEFE_CARRERA'
  | 'SECRETARIADO'
  | 'VICERRECTORADO'
  | 'REGISTRO'
  | 'DEFENSA';

export type RolLabel =
  | 'Coordinador General'
  | 'Secretario de Facultad'
  | 'Jefe de Carrera'
  | 'Vicerrectorado'
  | 'Registro'
  | 'Defensas de Grado';

export type Rol = RolCode | RolLabel;

export const ROL_MAP: Record<RolCode, RolLabel> = {
  COORDINACION: 'Coordinador General',
  JEFE_CARRERA: 'Jefe de Carrera',
  SECRETARIADO: 'Secretario de Facultad',
  VICERRECTORADO: 'Vicerrectorado',
  REGISTRO: 'Registro',
  DEFENSA: 'Defensas de Grado',
};

export const LABEL_TO_ROL_MAP: Record<RolLabel, RolCode> = {
  'Coordinador General': 'COORDINACION',
  'Jefe de Carrera': 'JEFE_CARRERA',
  'Secretario de Facultad': 'SECRETARIADO',
  'Vicerrectorado': 'VICERRECTORADO',
  'Registro': 'REGISTRO',
  'Defensas de Grado': 'DEFENSA',
};

export function normalizarRol(rol: string): { code: RolCode; label: RolLabel } {
  const upper = rol?.toUpperCase()?.trim() || '';
  if (upper in ROL_MAP) {
    const code = upper as RolCode;
    return { code, label: ROL_MAP[code] };
  }
  if (rol in LABEL_TO_ROL_MAP) {
    const code = LABEL_TO_ROL_MAP[rol as RolLabel];
    return { code, label: rol as RolLabel };
  }
  return { code: 'COORDINACION', label: 'Coordinador General' };
}

export function tieneRolPermitido(userRol: RolCode | RolLabel, allowedRoles?: (RolCode | RolLabel)[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const { code, label } = normalizarRol(userRol);
  return allowedRoles.some((r) => {
    const norm = normalizarRol(r);
    return norm.code === code || r === label || r === code;
  });
}

export interface CarreraUsuario {
  idCarrera: string;
  nombre: string;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  rol: RolLabel;
  rolCode: RolCode;
  carreras?: CarreraUsuario[];
  carreraId?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  checkRole: (allowedRoles?: (RolCode | RolLabel)[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sgseg_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => Boolean(localStorage.getItem('token')));

  // Restaurar y verificar la validez del token al montar la aplicación
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (!isMounted) return;

        const raw = res.data;
        const { code, label } = normalizarRol(raw.rol);
        const avatarSaved = localStorage.getItem(`sgseg_avatar_${raw.idUsuario}`);
        const validatedUser: User = {
          id: String(raw.idUsuario),
          email: raw.correoInstitucional,
          primerNombre: raw.primerNombre,
          segundoNombre: raw.segundoNombre,
          primerApellido: raw.primerApellido,
          segundoApellido: raw.segundoApellido,
          nombre: [raw.primerNombre, raw.segundoNombre, raw.primerApellido, raw.segundoApellido].filter(Boolean).join(' ') || raw.primerNombre || 'Usuario',
          rol: label,
          rolCode: code,
          carreras: raw.carreras || [],
          carreraId: raw.carreras?.[0]?.idCarrera || undefined,
          avatarUrl: avatarSaved || undefined,
        };

        setUser(validatedUser);
        localStorage.setItem('sgseg_user', JSON.stringify(validatedUser));
      } catch {
        if (!isMounted) return;
        localStorage.removeItem('token');
        localStorage.removeItem('sgseg_user');
        setToken(null);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    verifySession();

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('sgseg_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedData };
      localStorage.setItem('sgseg_user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        correoInstitucional: email.trim().toLowerCase(),
        password: pass,
      });

      const tokenToSave = res.data.accessToken || res.data.access_token;
      const rawUser = res.data.user;
      const { code, label } = normalizarRol(rawUser?.rol || '');
      const avatarSaved = localStorage.getItem(`sgseg_avatar_${rawUser?.idUsuario}`);

      const authenticatedUser: User = {
        id: String(rawUser?.idUsuario || '1'),
        email: rawUser?.correoInstitucional || email,
        primerNombre: rawUser?.primerNombre,
        segundoNombre: rawUser?.segundoNombre,
        primerApellido: rawUser?.primerApellido,
        segundoApellido: rawUser?.segundoApellido,
        nombre:
          [rawUser?.primerNombre, rawUser?.segundoNombre, rawUser?.primerApellido, rawUser?.segundoApellido].filter(Boolean).join(' ') ||
          rawUser?.nombre ||
          'Usuario',
        rol: label,
        rolCode: code,
        carreras: rawUser?.carreras || [],
        carreraId: rawUser?.carreras?.[0]?.idCarrera || undefined,
        avatarUrl: avatarSaved || undefined,
      };

      localStorage.setItem('token', tokenToSave);
      localStorage.setItem('sgseg_user', JSON.stringify(authenticatedUser));
      setToken(tokenToSave);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? 'Credenciales incorrectas. Verifique su correo y contraseña.'
          : 'No se pudo conectar con el servidor. Intente nuevamente.');
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('sgseg_user');
    setToken(null);
    setUser(null);
  }, []);

  const checkRole = useCallback(
    (allowedRoles?: (RolCode | RolLabel)[]): boolean => {
      if (!user) return false;
      return tieneRolPermitido(user.rolCode, allowedRoles);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, checkRole }}>
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
