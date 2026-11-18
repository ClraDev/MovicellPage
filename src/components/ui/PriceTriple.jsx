import { useRateStore } from '../../store/useRateStore'
import { fmtUsd, fmtBs, refUsd, round2 } from '../../lib/pricing'

// Muestra los 3 precios: divisas (oferta), bolívares y equivalente en $ a tasa BCV.
// La tasa en sí NO se muestra.
export default function PriceTriple({ product, size = 'sm' }) {
  const rate = useRateStore((s) => s.rate)
  const markup = useRateStore((s) => s.markup)
  const lg = size === 'lg'

  const cash = Number(product.price_usd)
  const ref = refUsd(product, markup)
  const bs = round2(ref * rate)

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className={`font-extrabold text-gray-900 ${lg ? 'text-4xl' : 'text-xl sm:text-2xl'}`}>{fmtUsd(cash)}</p>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700 sm:text-xs">
          Oferta en divisas
        </span>
      </div>

      {rate > 0 ? (
        <div className={`mt-2 space-y-0.5 rounded-xl bg-gray-50 px-3 py-2 ${lg ? 'text-base' : 'text-xs sm:text-sm'}`}>
          <p className="flex justify-between gap-2">
            <span className="text-gray-500">Pago en bolívares</span>
            <span className="font-bold text-gray-800">{fmtBs(bs)}</span>
          </p>
          <p className="flex justify-between gap-2">
            <span className="text-gray-500">Equivalente en dólares</span>
            <span className="font-semibold text-gray-700">{fmtUsd(ref)}</span>
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Precio en bolívares: por consultar</p>
      )}
    </div>
  )
}
