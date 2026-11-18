import { X, Minus, Plus, Trash2, ShoppingBag, Smartphone } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { useRateStore } from '../../store/useRateStore'
import { fmtUsd, fmtBs, refUsd, round2, cartTotals } from '../../lib/pricing'

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, removeItem, openCheckout } = useCartStore()
  const rate = useRateStore((s) => s.rate)
  const markup = useRateStore((s) => s.markup)
  const totals = cartTotals(items, markup, rate)

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="flex items-center gap-2 text-xl font-extrabold"><ShoppingBag className="h-6 w-6 text-brand" /> Su carrito</h2>
          <button onClick={closeCart} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-gray-100" aria-label="Cerrar">
            <X className="h-6 w-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-500">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <p className="mt-3 font-semibold">Su carrito está vacío</p>
            <button onClick={closeCart} className="btn-primary mt-5">Seguir comprando</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.map((i) => {
                const subCash = round2(i.qty * i.price_usd)
                const subBs = round2(i.qty * refUsd(i, markup) * rate)
                return (
                  <li key={i.id} className="flex gap-3 rounded-2xl border border-gray-100 p-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                      {i.image_url ? <img src={i.image_url} alt="" className="h-full w-full object-contain" /> : <Smartphone className="h-8 w-8 text-gray-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-bold">{i.name}</p>
                        <button onClick={() => removeItem(i.id)} className="p-1 text-gray-400 hover:text-red-500" aria-label="Quitar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-xl border border-gray-200">
                          <button onClick={() => setQty(i.id, i.qty - 1)} className="flex h-10 w-10 items-center justify-center" aria-label="Menos"><Minus className="h-4 w-4" /></button>
                          <span className="w-7 text-center text-sm font-bold">{i.qty}</span>
                          <button onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= i.stock} className="flex h-10 w-10 items-center justify-center disabled:opacity-30" aria-label="Más"><Plus className="h-4 w-4" /></button>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold">{fmtUsd(subCash)} <span className="text-[10px] font-semibold uppercase text-green-700">divisas</span></p>
                          {rate > 0 && <p className="text-xs text-gray-500">{fmtBs(subBs)} en Bs</p>}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="border-t border-gray-100 bg-gray-50 p-4">
              <div className="flex items-end justify-between">
                <span className="font-semibold text-gray-600">Total en divisas</span>
                <p className="text-2xl font-extrabold">{fmtUsd(totals.cash)}</p>
              </div>
              {rate > 0 && (
                <div className="mt-1 flex items-end justify-between text-sm text-gray-500">
                  <span>Total en bolívares</span>
                  <span className="font-bold text-gray-700">{fmtBs(totals.bs)}</span>
                </div>
              )}
              <button onClick={openCheckout} className="btn-primary mt-4 w-full">Continuar con el pedido</button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
