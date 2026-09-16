import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import Home from '@/pages/Home'
import Casos from '@/pages/Casos'
import Configuracion from '@/pages/Configuracion'
import Estudiantes from '@/pages/Estudiantes'
import Reportes from '@/pages/Reportes'
import Sorteo from '@/pages/Sorteo'
import SorteoEnVivo from '@/pages/SorteoEnVivo'
import Usuarios from '@/pages/Usuarios'
import Academia from '@/pages/Academia'
import Defensas from '@/pages/Defensas'
import Login from '@/pages/Login'
import ResetPassword from '@/pages/ResetPassword'
import '@/index.css'
import { AuthProvider as ContextProvider } from '@/context/AuthContext'

const TODOS_LOS_ROLES = [
  'Coordinador General',
  'Secretario de Facultad',
  'Jefe de Carrera',
  'Vicerrectorado',
  'Registro',
  'Defensas de Grado',
  'Administrador General',
] as const

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/sorteo/en-vivo" element={<SorteoEnVivo />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/sorteo" element={
            <ProtectedRoute allowedRoles={[...TODOS_LOS_ROLES]}>
              <Sorteo />
            </ProtectedRoute>
          } />
          
          <Route path="/casos" element={
            <ProtectedRoute allowedRoles={[...TODOS_LOS_ROLES]}>
              <Casos />
            </ProtectedRoute>
          } />
          
          <Route path="/estudiantes" element={
            <ProtectedRoute allowedRoles={[...TODOS_LOS_ROLES]}>
              <Estudiantes />
            </ProtectedRoute>
          } />

          <Route path="/defensas" element={
            <ProtectedRoute allowedRoles={[...TODOS_LOS_ROLES]}>
              <Defensas />
            </ProtectedRoute>
          } />
          
          <Route path="/reportes" element={
            <ProtectedRoute allowedRoles={[...TODOS_LOS_ROLES]}>
              <Reportes />
            </ProtectedRoute>
          } />
          
          <Route path="/configuracion" element={
            <ProtectedRoute allowedRoles={[...TODOS_LOS_ROLES]}>
              <Configuracion />
            </ProtectedRoute>
          } />

          <Route path="/usuarios" element={
            <ProtectedRoute allowedRoles={[...TODOS_LOS_ROLES]}>
              <Usuarios />
            </ProtectedRoute>
          } />

          <Route path="/academia" element={
            <ProtectedRoute allowedRoles={[...TODOS_LOS_ROLES]}>
              <Academia />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ContextProvider>
  )
}

export default App
