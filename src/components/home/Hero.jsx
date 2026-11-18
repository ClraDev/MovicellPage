import { useEffect, useState } from 'react'
import { ArrowRight, Smartphone, Truck, Wrench, BadgeCheck } from 'lucide-react'
import WhatsAppIcon from '../ui/WhatsAppIcon'
import { scrollToId } from '../../store/useUiStore'
import { useRateStore } from '../../store/useRateStore'
import { fmtUsd, fmtBs, refUsd, round2 } from '../../lib/pricing'

export default function Hero({ featured = [] }) {
  const [idx, setIdx] = useState(0)
  const rate = useRateStore((s) => s.rate)
  const markup = useRateStore((s) => s.markup)

  useEffect(() => {
    if (featured.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % featured.length), 4000)
    return () => clearInterval(t)
  }, [featured.length])

  const item = featured[idx % (featured.length || 1)]

  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-seabuckthorn text-white">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Equipos de última generación
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Su próximo teléfono, con precios claros en divisas y bolívares
          </h1>
          <p className="mt-4 max-w-lg text-lg text-white/90">
            Equipos nuevos, tablets y accesorios con precio preferencial al pagar en divisas y la opción de pagar en bolívares. Realice su pedido en pocos minutos a través de WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => scrollToId('catalogo')}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-brand shadow-lg transition active:scale-95"
            >
              Ver Catálogo <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollToId('ubicacion')}
              className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-white/60 px-6 py-3 font-bold transition active:scale-95"
            >
              Nuestra ubicación
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/95">
            <li className="flex items-center gap-2"><BadgeCheck className="h-5 w-5" /> Equipos nuevos</li>
            <li className="flex items-center gap-2"><WhatsAppIcon className="h-5 w-5" /> Pedidos por WhatsApp</li>
            <li className="flex items-center gap-2"><Truck className="h-5 w-5" /> Delivery o retiro en tienda</li>
            <li className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Servicio técnico</li>
          </ul>
        </div>

        {/* Tarjeta destacada */}
        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-3xl bg-white/15 p-4 shadow-2xl backdrop-blur">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white">
              {item?.image_url ? (
                <img src={item.image_url} alt={item.name} className="h-full w-full object-contain p-4" />
              ) : (
                <Smartphone className="h-32 w-32 text-brand/30" strokeWidth={1.2} />
              )}
            </div>
            {item && (
              <div className="mt-3 px-1">
                <p className="truncate font-bold">{item.name}</p>
                <p className="text-2xl font-extrabold">{fmtUsd(item.price_usd)} <span className="text-xs font-semibold text-white/80">en divisas</span></p>
                {rate > 0 && <p className="text-sm text-white/85">{fmtBs(round2(refUsd(item, markup) * rate))} en bolívares</p>}
              </div>
            )}
          </div>
          {featured.length > 1 && (
            <div className="mt-3 flex justify-center gap-1.5">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Destacado ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === idx % featured.length ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
