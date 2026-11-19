import { useDeferredValue, useMemo } from 'react'
import { PackageSearch, ArrowUpDown } from 'lucide-react'
import ProductCard from './ProductCard'
import { CATEGORIES } from '../../config'
import { useUiStore } from '../../store/useUiStore'

const normalize = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const SORTS = [
  { id: 'recent', label: 'Más recientes' },
  { id: 'name-asc', label: 'Nombre: A a Z' },
  { id: 'name-desc', label: 'Nombre: Z a A' },
  { id: 'price-asc', label: 'Precio: menor a mayor' },
  { id: 'price-desc', label: 'Precio: mayor a menor' },
]

const sorters = {
  recent: null, // ya llegan ordenados del más nuevo al más viejo
  'name-asc': (a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
  'name-desc': (a, b) => b.name.localeCompare(a.name, 'es', { sensitivity: 'base' }),
  'price-asc': (a, b) => Number(a.price_usd) - Number(b.price_usd),
  'price-desc': (a, b) => Number(b.price_usd) - Number(a.price_usd),
}

export default function Catalog({ products, loading, error, hasOffers }) {
  const query = useUiStore((s) => s.query)
  const category = useUiStore((s) => s.category)
  const sort = useUiStore((s) => s.sort)
  const limit = useUiStore((s) => s.limit)
  const setCategory = useUiStore((s) => s.setCategory)
  const setQuery = useUiStore((s) => s.setQuery)
  const setSort = useUiStore((s) => s.setSort)
  const showMore = useUiStore((s) => s.showMore)

  // La búsqueda se procesa con prioridad baja para que escribir no se trabe en el teléfono
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    const q = normalize(deferredQuery.trim())
    const list = products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || normalize(p.name).includes(q) || normalize(p.description).includes(q) || normalize(p.specs).includes(q))
    )
    const fn = sorters[sort]
    return fn ? [...list].sort(fn) : list
  }, [products, deferredQuery, category, sort])

  const visible = filtered.slice(0, limit)

  return (
    <section id="catalogo" className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-3xl font-extrabold">Catálogo</h2>
        <p className="mt-1 text-gray-500">
          {hasOffers ? 'Precio preferencial en divisas y precio en bolívares.' : 'Precios en divisas y en bolívares.'}
        </p>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`min-h-[44px] shrink-0 rounded-full px-5 text-sm font-bold transition ${
                  category === c.id ? 'bg-brand text-white' : 'bg-brand-marzipan/40 text-gray-700 hover:bg-brand-marzipan/70'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <ArrowUpDown className="h-4 w-4 shrink-0" />
            <span className="shrink-0">Ordenar por</span>
            <select className="input !min-h-[44px] !py-2" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {query && (
          <p className="mt-3 text-sm text-gray-500">
            Resultados para “<strong>{query}</strong>”{' '}
            <button onClick={() => setQuery('')} className="font-bold text-brand underline">Limpiar búsqueda</button>
          </p>
        )}

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-10 rounded-xl bg-red-50 p-4 text-red-600">No fue posible cargar el catálogo. Por favor, intente nuevamente en unos minutos.</p>
        ) : filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center text-gray-500">
            <PackageSearch className="h-14 w-14 text-gray-300" />
            <p className="mt-3 font-semibold">No se encontraron productos con los criterios seleccionados.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {filtered.length > visible.length && (
              <div className="mt-8 text-center">
                <button onClick={showMore} className="btn-secondary">
                  Mostrar más productos ({filtered.length - visible.length} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
