import { useState } from 'react'
import { MapPin, Clock, Instagram, ExternalLink } from 'lucide-react'
import { openStatus } from '../../lib/hours'
import { BUSINESS } from '../../config'
import WhatsAppIcon from '../ui/WhatsAppIcon'

// El mapa de Google pesa bastante: se carga solo cuando el cliente lo solicita
function MapEmbed() {
  const [show, setShow] = useState(false)
  if (show)
    return (
              <MapEmbed />
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
