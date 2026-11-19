import { Wrench, Search as Magnifier, ClipboardList, MessageCircle, CalendarCheck } from 'lucide-react'
import PriceTriple from '../ui/PriceTriple'
import { useRateStore } from '../../store/useRateStore'
import { useUiStore } from '../../store/useUiStore'
import { TITULAR_RETIRO } from '../ui/Notice'

export default function ServicesSection() {
  const fee = useRateStore((s) => s.inspectionFee)
  const feeBcv = useRateStore((s) => s.inspectionFeeBcv)
  const feeMarkup = useRateStore((s) => s.inspectionMarkup)
  const openService = useUiStore((s) => s.openService)

  return (
    <section id="servicios" className="bg-brand-marzipan/30 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white"><Wrench className="h-6 w-6" /></span>
          <div>
            <h2 className="text-3xl font-extrabold">Servicio técnico</h2>
            <p className="text-gray-600">Solicite su revisión o reparación en línea; nosotros la gestionamos por WhatsApp.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Revisión */}
          <article className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand"><Magnifier className="h-6 w-6" /><h3 className="text-xl font-bold text-gray-900">Revisión técnica</h3></div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Evaluamos su equipo para identificar la falla y determinar la solución requerida. El tiempo estimado es de 2 a 3 horas y, en casos complejos, de hasta 1 día.
            </p>
            <div className="mt-auto pt-4">
              {fee > 0 ? (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Costo de la revisión</p>
                  <PriceTriple product={{ price_usd: fee, price_bcv_usd: feeBcv > 0 ? feeBcv : null }} markup={feeMarkup} />
                </div>
              ) : (
                <p className="mb-3 text-sm font-semibold text-gray-500">Costo de la revisión: por confirmar</p>
              )}
              <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                La revisión no tiene costo si usted decide reparar su equipo con nosotros.
              </p>
              <button onClick={() => openService('revision')} className="btn-primary w-full">Solicitar revisión</button>
            </div>
          </article>

          {/* Reparación */}
          <article className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand"><Wrench className="h-6 w-6" /><h3 className="text-xl font-bold text-gray-900">Reparación</h3></div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              El costo depende de la falla que presente su equipo. Le enviaremos la cotización por WhatsApp con base en la información suministrada.
            </p>
            <div className="mt-auto pt-4">
              <p className="mb-3 text-sm font-semibold text-gray-500">Costo: según el diagnóstico</p>
              <button onClick={() => openService('reparacion')} className="btn-primary w-full">Solicitar reparación</button>
            </div>
          </article>
        </div>

        <ol className="mt-6 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
          {[
            [ClipboardList, 'Complete el formulario con su cédula, el modelo del equipo y la descripción del problema.'],
            [MessageCircle, 'Le contactaremos por WhatsApp para confirmar los detalles.'],
            [CalendarCheck, 'Coordinamos la revisión o reparación de su equipo.'],
          ].map(([Icon, t], i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-white/70 p-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" /><span>{t}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-gray-500">{TITULAR_RETIRO}</p>
      </div>
    </section>
  )
}
