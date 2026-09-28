import axios from 'axios';

const DEFAULT_BACKEND_URL = 'https://sgseg-cseb.vercel.app';

const rawBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

let targetUrl = rawBaseUrl;

// Si se ejecuta en navegador fuera de localhost (ej. Vercel) y no se definió VITE_API_URL o apunta a localhost
if (
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  if (!targetUrl || targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) {
    targetUrl = DEFAULT_BACKEND_URL;
  }
}

// Asegurar que la URL siempre termine en /api
let baseURL = '/api';
if (targetUrl) {
  const cleanUrl = targetUrl.replace(/\/+$/, '');
  baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

console.log(`[SGSEG API] Base URL configurada: ${baseURL}`);

const api = axios.create({
  baseURL,
});

// Interceptor para inyectar el token JWT en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar expiración de sesión / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('sgseg_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
