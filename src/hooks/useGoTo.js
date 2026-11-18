import { useNavigate, useLocation } from 'react-router-dom'
import { scrollToId } from '../store/useUiStore'

// Navega a una sección de la página principal, aunque estés en la ficha de un producto
export function useGoTo() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (id) => {
    if (pathname === '/') scrollToId(id)
    else {
      navigate('/')
      setTimeout(() => scrollToId(id), 400)
    }
  }
}
