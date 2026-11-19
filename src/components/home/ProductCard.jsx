import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Smartphone, Check } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { useUiStore } from '../../store/useUiStore'
import PriceTriple from '../ui/PriceTriple'
import { parseSpecs } from '../../lib/specs'

const SPECS_IN_CARD = 4 // cuántas características de la ficha se muestran en la tarjeta

function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const inCart = useCartStore((s) => s.items.find((i) => i.id === product.id)?.qty || 0)
  const [added, setAdded] = useState(false)

  const soldOut = product.stock <= 0
  const low = product.stock > 0 && product.stock <= 3
  const reachedMax = inCart >= product.stock
  const to = `/producto/${product.id}`

  // Se destacan las primeras características de la ficha técnica; si no hay, se usa la descripción
  const specs = useMemo(
    () => parseSpecs(product.specs).filter((s) => s.label).slice(0, SPECS_IN_CARD),
    [product.specs]
  )

  // Recuerda dónde estaba el usuario para volver al mismo lugar
  const remember = () => useUiStore.getState().setHomeScroll(window.scrollY)

  const badge = soldOut
    ? { text: 'Agotado', cls: 'bg-gray-200 text-gray-600' }
    : low
    ? { text: `Últimas ${product.stock} unidades`, cls: 'bg-orange-100 text-orange-700' }
    : { text: `Disponible: ${product.stock}`, cls: 'bg-green-100 text-green-700' }

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price_usd: Number(product.price_usd),
      price_bcv_usd: product.price_bcv_usd ?? null,
      image_url: product.image_url,
      category: product.category,
      stock: product.stock,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <Link to={to} onClick={remember} className="relative flex aspect-square items-center justify-center bg-gray-50" aria-label={`Ver ${product.name}`}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-contain p-3 ${soldOut ? 'opacity-50' : ''}`}
          />
        ) : (
          <Smartphone className="h-16 w-16 text-gray-300" strokeWidth={1.2} />
        )}
        <span className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-xs font-bold ${badge.cls}`}>{badge.text}</span>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link to={to} onClick={remember} className="block">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug hover:text-brand sm:text-base">{product.name}</h3>

          {specs.length > 0 ? (
            <ul className="mt-2 space-y-1 rounded-lg bg-gray-50 px-2.5 py-2 text-xs">
              {specs.map((s) => (
                <li key={s.label} className="flex gap-1.5">
                  <span className="shrink-0 text-gray-400">{s.label}</span>
                  <span className="min-w-0 truncate font-semibold text-gray-700">{s.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            product.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500 sm:text-sm">{product.description}</p>
          )}
        </Link>

        <div className="mt-auto pt-3">
          <Link to={to} onClick={remember} className="block">
            <PriceTriple product={product} />
          </Link>

          <button onClick={handleAdd} disabled={soldOut || reachedMax} className="btn-primary mt-3 w-full !px-3 text-sm sm:text-base">
            {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
            {soldOut ? 'Agotado' : reachedMax ? 'Máximo en el carrito' : added ? 'Agregado' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default memo(ProductCard)
