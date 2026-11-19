import { ChevronDown } from 'lucide-react'
import { BUSINESS } from '../../config'

// Solo datos confirmados. Para agregar más preguntas (garantía, etc.) añada un objeto a la lista.
const FAQ = [
  {
    q: '¿Cómo realizo un pedido?',
    a: 'Agregue los productos al carrito, complete sus datos, seleccione la forma de pago y la modalidad de entrega, y envíe el pedido por WhatsApp. La gestión continúa a través de ese chat.',
  },
  {
    q: '¿Los equipos son nuevos?',
    a: 'Sí. Todos nuestros equipos son nuevos.',
  },
  {
    q: '¿Por qué existen precios en divisas y en bolívares?',
    a: 'El precio en divisas aplica para pagos en efectivo, Zelle o Binance. Si prefiere pagar en bolívares, el monto se calcula según la tasa oficial del BCV del día.',
  },
  {
    q: '¿Quién puede retirar el equipo?',
    a: 'Únicamente el titular de la cédula indicada en el pedido o en la solicitud de servicio. Esta condición aplica al retiro en tienda, al delivery y al servicio técnico.',
  },
  {
    q: '¿Cómo funciona el delivery?',
    a: 'Al realizar su pedido, seleccione Delivery, indique su dirección y registre su ubicación en el mapa o mediante un enlace de Google Maps. Los detalles de la entrega se coordinan por WhatsApp.',
  },
  {
    q: '¿Cómo funciona el servicio técnico?',
    a: 'Puede solicitar una revisión, que tiene un costo y no se cobra si decide reparar el equipo con nosotros, o una reparación, cuyo costo depende de la falla. La revisión toma generalmente de 2 a 3 horas y, en casos complejos, hasta 1 día. Complete el formulario con su cédula, el modelo del equipo y una descripción del problema, y le atenderemos por WhatsApp.',
  },
  {
    q: '¿Dónde se encuentran y cuál es su horario de atención?',
    a: `${BUSINESS.addressShort}. ${BUSINESS.hours.map((h) => `${h.days}: ${h.time}`).join(' · ')}.`,
  },
]

export default function FaqSection() {
  return (
    <section id="faq" className="bg-brand-marzipan/30 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-extrabold">Preguntas frecuentes</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-gray-100 bg-white shadow-sm">
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-bold">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-brand transition group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-4 leading-relaxed text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
