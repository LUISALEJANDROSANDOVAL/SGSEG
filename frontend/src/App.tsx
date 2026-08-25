import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Casos from '@/pages/Casos'
import Configuracion from '@/pages/Configuracion'
import Estudiantes from '@/pages/Estudiantes'
import Reportes from '@/pages/Reportes'
import Sorteo from '@/pages/Sorteo'
import '@/index.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/casos" element={<Casos />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/estudiantes" element={<Estudiantes />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/sorteo" element={<Sorteo />} />
      </Routes>
    </Router>
  )
}

export default App
