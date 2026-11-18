import { useLocation } from 'react-router-dom'
import WhatsAppIcon from './WhatsAppIcon'
import { buildGeneralUrl } from '../../lib/whatsapp'

export default function FloatingWhatsApp() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return (
    <a
      href={buildGeneralUrl()}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition active:scale-95 hover:brightness-95"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  )
}
