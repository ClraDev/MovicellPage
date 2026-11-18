import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Instagram, MapPin, Clock } from 'lucide-react'
import WhatsAppIcon from '../ui/WhatsAppIcon'
import { BUSINESS, asset } from '../../config'
import { useGoTo } from '../../hooks/useGoTo'

const LINKS = [
  ['inicio', 'Inicio'],
  ['catalogo', 'Catálogo'],
  ['servicios', 'Servicio técnico'],
  ['ubicacion', 'Ubicación'],
  ['faq', 'Preguntas frecuentes'],
  ['contacto', 'Contacto'],
]

export default function Footer() {
  const go = useGoTo()
  const navigate = useNavigate()
  const taps = useRef({ n: 0, t: 0 })

  // Acceso discreto del personal: 5 toques seguidos sobre el texto de derechos de autor
  const secretTap = () => {
    const now = Date.now()
    if (now - taps.current.t > 2000) taps.current.n = 0
    taps.current.t = now
    taps.current.n += 1
    if (taps.current.n >= 5) {
      taps.current.n = 0
      navigate('/admin')
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {/* Columna 1 */}
        <div>
          <div className="inline-block rounded-xl bg-white p-3">
            <img src={asset('logo-full.png')} alt="Movicell Services C.A" className="h-20 w-auto" />
          </div>
          <p className="mt-4 text-sm leading-relaxed">{BUSINESS.description}</p>
          <div className="mt-4 flex gap-3">
            <a href={BUSINESS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
               className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand">
              <Instagram className="h-5 w-5" />
            </a>
            <a href={`https://wa.me/${BUSINESS.whatsappNumber}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"
               className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand">
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Columna 2 */}
        <div>
          <h3 className="mb-3 font-bold text-white">Enlaces de interés</h3>
          <ul className="space-y-1 text-sm">
            {LINKS.map(([id, label]) => (
              <li key={id}>
                <button onClick={() => go(id)} className="min-h-[36px] transition hover:text-brand">{label}</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3 */}
        <div>
          <h3 className="mb-3 font-bold text-white">Contacto</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <WhatsAppIcon className="h-5 w-5 shrink-0 text-brand" />
              <a href={`https://wa.me/${BUSINESS.whatsappNumber}`} target="_blank" rel="noreferrer">{BUSINESS.whatsappDisplay}</a>
            </li>
            <li className="flex gap-2"><MapPin className="h-5 w-5 shrink-0 text-brand" /><span>{BUSINESS.addressShort}</span></li>
            <li className="flex gap-2">
              <Clock className="h-5 w-5 shrink-0 text-brand" />
              <span>{BUSINESS.hours.map((h) => <span key={h.days} className="block">{h.days}: {h.time}</span>)}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        <span onClick={secretTap} className="select-none">© 2026 {BUSINESS.name} · RIF {BUSINESS.rif} · Todos los derechos reservados.</span>
      </div>
    </footer>
  )
}
