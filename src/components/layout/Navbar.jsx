import { useState } from 'react'
import { Search, ShoppingCart, Menu, X, TrendingUp } from 'lucide-react'
import { asset } from '../../config'
import { useCartStore, selectCount } from '../../store/useCartStore'
import { useUiStore } from '../../store/useUiStore'
import { useRateStore } from '../../store/useRateStore'
import { fmtBs } from '../../lib/pricing'
import { useGoTo } from '../../hooks/useGoTo'

const LINKS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'servicios', label: 'Servicio técnico' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const count = useCartStore(selectCount)
  const openCart = useCartStore((s) => s.openCart)
  const rate = useRateStore((s) => s.rate)
  const { query, setQuery } = useUiStore()

  const goTo = useGoTo()
  const go = (id) => {
    setOpen(false)
    goTo(id)
  }

  const onSearch = (e) => {
    setQuery(e.target.value)
    if (e.target.value) go('catalogo')
  }

  const searchBox = (className = '') => (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={query}
        onChange={onSearch}
        placeholder="Buscar productos"
        className="input !rounded-full !bg-gray-50 pl-10"
        aria-label="Buscar productos"
      />
    </div>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <button onClick={() => go('inicio')} className="flex shrink-0 items-center gap-2" aria-label="Inicio">
          <img src={asset('logo-icon.png')} alt="" className="h-9 w-auto" />
          <span className="hidden text-xl font-extrabold tracking-tight text-brand min-[420px]:inline">movicell</span>
        </button>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-brand-marzipan/40 hover:text-brand"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {searchBox('mx-2 hidden max-w-sm flex-1 md:block')}

        <div className="ml-auto flex items-center gap-2">
          {rate > 0 && (
            <div
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-marzipan/50 px-3 py-2 text-xs font-bold text-gray-800"
              title="Tasa oficial del BCV (bolívares por dólar)"
            >
              <TrendingUp className="h-4 w-4 text-brand" />
              <span>BCV</span>
              {fmtBs(rate)}
            </div>
          )}

          <button
            onClick={openCart}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white transition active:scale-95"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-900 px-1 text-xs font-bold">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 lg:hidden"
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Buscador móvil */}
      <div className="px-4 pb-3 md:hidden">
        {searchBox()}
      </div>

      {/* Menú hamburguesa */}
      {open && (
        <nav className="border-t border-gray-100 bg-white px-4 py-2 lg:hidden">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="block w-full rounded-lg px-3 py-3 text-left font-semibold text-gray-700 hover:bg-brand-marzipan/40"
            >
              {l.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
