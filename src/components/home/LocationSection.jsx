import { MapPin, Clock, Instagram, ExternalLink } from 'lucide-react'
import { openStatus } from '../../lib/hours'
import { BUSINESS } from '../../config'
import WhatsAppIcon from '../ui/WhatsAppIcon'

export default function LocationSection() {
  const status = openStatus()
  return (
    <>
      <section id="ubicacion" className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-extrabold">Visítenos</h2>
          <p className="mt-1 text-gray-600">Retire su pedido o visite nuestra tienda para conocer los equipos.</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                <div>
                  <p className="font-bold">Dirección</p>
                  <p className="text-gray-600">{BUSINESS.addressShort}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
                <div>
                  <p className="font-bold">Horario</p>
                  <p className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    <span className={`h-2 w-2 rounded-full ${status.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />{status.text}
                  </p>
                  {BUSINESS.hours.map((h) => (
                    <p key={h.days} className="text-gray-600">{h.days}: <span className="font-semibold">{h.time}</span></p>
                  ))}
                </div>
              </div>
              <a href={BUSINESS.mapsLink} target="_blank" rel="noreferrer" className="btn-primary w-full">
                <ExternalLink className="h-5 w-5" /> Abrir en Google Maps
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <iframe
                title="Ubicación de Movicell"
                src={BUSINESS.mapEmbed}
                className="h-72 w-full border-0 lg:h-full lg:min-h-[320px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-extrabold">Contacto</h2>
          <p className="mt-1 text-gray-500">Escríbanos por WhatsApp; con gusto atenderemos su consulta.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <a
              href={`https://wa.me/${BUSINESS.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                <WhatsAppIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="font-bold">WhatsApp</p>
                <p className="text-sm text-gray-500">{BUSINESS.whatsappDisplay}</p>
              </div>
            </a>
            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white">
                <Instagram className="h-6 w-6" />
              </span>
              <div>
                <p className="font-bold">Instagram</p>
                <p className="text-sm text-gray-500">@movicellservice.ca</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
