import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import ProductPage from './pages/ProductPage'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ProtectedRoute from './pages/admin/ProtectedRoute'
import { useRateStore } from './store/useRateStore'
import FloatingWhatsApp from './components/ui/FloatingWhatsApp'

// Carga la tasa BCV al abrir la página y la mantiene actualizada:
// cada 5 minutos y cada vez que el usuario vuelve a la pestaña.
function Bootstrap() {
  const loadRate = useRateStore((s) => s.loadRate)
  const fetchLive = useRateStore((s) => s.fetchLive)
  useEffect(() => {
    loadRate()
    const id = setInterval(fetchLive, 5 * 60 * 1000)
    const onVisible = () => document.visibilityState === 'visible' && fetchLive()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [loadRate, fetchLive])
  return null
}

// HashRouter: funciona en GitHub Pages sin 404 al recargar (/#/admin).
// Con dominio propio puedes cambiar a BrowserRouter.
export default function App() {
  return (
    <HashRouter>
      <Bootstrap />
      <FloatingWhatsApp />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductPage />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
