import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, LogOut, Smartphone, Eye, EyeOff, Store } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useProducts } from '../../hooks/useProducts'
import { useRateStore } from '../../store/useRateStore'
import { fmtUsd, fmtBs, refUsd, round2 } from '../../lib/pricing'
import { CATEGORIES } from '../../config'
import ProductForm from './ProductForm'
import { RatePanel, PricingPanel } from './SettingsPanels'

const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || id

export default function Dashboard() {
  const { products, loading, reload } = useProducts({ onlyActive: false })
  const rate = useRateStore((s) => s.rate)
  const markup = useRateStore((s) => s.markup)
  const [editing, setEditing] = useState(null) // null | 'new' | product

  const remove = async (p) => {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('products').delete().eq('id', p.id)
    reload()
  }

  const toggleActive = async (p) => {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <h1 className="text-lg font-extrabold">Panel <span className="text-brand">Movicell</span></h1>
          <div className="flex gap-2">
            <Link to="/" className="btn-secondary !px-3"><Store className="h-5 w-5" /><span className="hidden sm:inline">Tienda</span></Link>
            <button onClick={() => supabase.auth.signOut()} className="btn-secondary !px-3"><LogOut className="h-5 w-5" /><span className="hidden sm:inline">Salir</span></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <RatePanel />
        <PricingPanel />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Productos ({products.length})</h2>
            <button onClick={() => setEditing('new')} className="btn-primary"><Plus className="h-5 w-5" /> Nuevo</button>
          </div>

          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : products.length === 0 ? (
            <p className="rounded-2xl bg-white p-8 text-center text-gray-500">Aún no hay productos. Agrega el primero.</p>
          ) : (
            <ul className="space-y-3">
              {products.map((p) => (
                <li key={p.id} className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ${!p.active ? 'opacity-60' : ''}`}>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                    {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-contain" /> : <Smartphone className="h-7 w-7 text-gray-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="text-xs text-gray-500">{catLabel(p.category)} · Stock: <strong>{p.stock}</strong></p>
                    <p className="text-sm font-semibold">
                      {fmtUsd(p.price_usd)} <span className="font-normal text-gray-500">divisas</span>
                      {rate > 0 && <span className="font-normal text-gray-500"> · {fmtBs(round2(refUsd(p, markup) * rate))} Bs (ref. {fmtUsd(refUsd(p, markup))})</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <button onClick={() => toggleActive(p)} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-gray-100" aria-label="Mostrar/ocultar">{p.active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                    <button onClick={() => setEditing(p)} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-gray-100" aria-label="Editar"><Pencil className="h-5 w-5" /></button>
                    <button onClick={() => remove(p)} className="flex h-11 w-11 items-center justify-center rounded-xl text-red-500 hover:bg-red-50" aria-label="Eliminar"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }}
        />
      )}
    </div>
  )
}
