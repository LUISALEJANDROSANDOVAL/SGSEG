import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import Home from '@/pages/Home'
import Casos from '@/pages/Casos'
import Configuracion from '@/pages/Configuracion'
import Estudiantes from '@/pages/Estudiantes'
import Reportes from '@/pages/Reportes'
import Sorteo from '@/pages/Sorteo'
import Usuarios from '@/pages/Usuarios'
import Academia from '@/pages/Academia'
import Login from '@/pages/Login'
import '@/index.css'
import { AuthProvider as ContextProvider } from '@/context/AuthContext'

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/sorteo" element={
            <ProtectedRoute allowedRoles={['Coordinador General', 'Secretario de Facultad']}>
              <Sorteo />
            </ProtectedRoute>
          } />
          
          <Route path="/casos" element={
            <ProtectedRoute allowedRoles={['Coordinador General', 'Jefe de Carrera']}>
              <Casos />
            </ProtectedRoute>
          } />
          
          <Route path="/estudiantes" element={
            <ProtectedRoute allowedRoles={['Coordinador General', 'Secretario de Facultad', 'Jefe de Carrera']}>
              <Estudiantes />
            </ProtectedRoute>
          } />
          
          <Route path="/reportes" element={
            <ProtectedRoute allowedRoles={['Coordinador General', 'Secretario de Facultad']}>
              <Reportes />
            </ProtectedRoute>
          } />
          
          <Route path="/configuracion" element={
            <ProtectedRoute allowedRoles={['Coordinador General']}>
              <Configuracion />
            </ProtectedRoute>
          } />

          <Route path="/usuarios" element={
            <ProtectedRoute allowedRoles={['Coordinador General']}>
              <Usuarios />
            </ProtectedRoute>
          } />

          <Route path="/academia" element={
            <ProtectedRoute allowedRoles={['Coordinador General', 'Secretario de Facultad']}>
              <Academia />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ContextProvider>
  )
}

export default App
