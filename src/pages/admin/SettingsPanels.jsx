import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { fmtBs, fmtDateTime } from '../../lib/pricing'
import { useRateStore } from '../../store/useRateStore'

const save = (key, value) =>
  supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key)

// ---------- Tasa BCV ----------
export function RatePanel() {
  const [rate, setRate] = useState(0)
  const [auto, setAuto] = useState(true)
  const [manual, setManual] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('settings').select('key, value, updated_at')
    const r = data?.find((x) => x.key === 'exchange_rate')
    const a = data?.find((x) => x.key === 'rate_auto')
    if (r) { setRate(Number(r.value)); setUpdatedAt(r.updated_at); setManual(String(r.value)) }
    if (a) setAuto(Number(a.value) === 1)
    // Modo automático: si la tasa guardada tiene más de 30 minutos, se actualiza sola
    if (a && Number(a.value) === 1 && r && Date.now() - new Date(r.updated_at).getTime() > 30 * 60 * 1000) fetchNow(true)
  }
  useEffect(() => { load() }, [])

  const toggleAuto = async () => {
    const next = !auto
    setAuto(next)
    await save('rate_auto', next ? 1 : 0)
    setMsg(next ? 'Tasa automática activada.' : 'Modo manual activado.')
  }

  const saveManual = async () => {
    const v = Number(String(manual).replace(',', '.'))
    if (!(v > 0)) return setMsg('Ingresa una tasa válida.')
    setBusy(true)
    const { error } = await save('exchange_rate', v)
    setBusy(false)
    setMsg(error ? error.message : 'Tasa guardada.')
    load()
  }

  const fetchNow = async (silent = false) => {
    setBusy(true)
    if (!silent) setMsg('')
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      const { promedio } = await res.json()
      if (!(promedio > 0)) throw new Error('Tasa inválida')
      const { error } = await save('exchange_rate', promedio)
      if (error) throw error
      if (!silent) setMsg(`Tasa BCV actualizada: ${fmtBs(promedio)}`)
      load()
    } catch (e) {
      if (!silent) setMsg('No se pudo consultar la tasa: ' + e.message)
    }
    setBusy(false)
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold">Tasa de cambio (BCV)</h2>
      <p className="mt-1 text-3xl font-extrabold text-brand">{rate > 0 ? fmtBs(rate) : 'Sin tasa'}</p>
      <p className="text-xs text-gray-500">Última actualización: {fmtDateTime(updatedAt) || '—'}. Los clientes la ven junto al carrito y en el resumen del pedido. En modo automático se consulta al abrir la página y cada 5 minutos.</p>

      <label className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-3">
        <input type="checkbox" className="h-5 w-5 accent-[#fa6f29]" checked={auto} onChange={toggleAuto} />
        <span className="font-semibold">Actualizar automáticamente desde el BCV</span>
      </label>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input className="input sm:max-w-[200px]" inputMode="decimal" value={manual} onChange={(e) => setManual(e.target.value)} disabled={auto} placeholder="Tasa manual" />
        <button onClick={saveManual} disabled={auto || busy} className="btn-primary">Guardar tasa manual</button>
        <button onClick={() => fetchNow()} disabled={busy} className="btn-secondary"><RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> Traer tasa BCV ahora</button>
      </div>
      {msg && <p className="mt-2 text-sm text-gray-600">{msg}</p>}
    </section>
  )
}

// ---------- Recargo Bs y costo de revisión ----------
export function PricingPanel() {
  const markup = useRateStore((s) => s.markup)
  const fee = useRateStore((s) => s.inspectionFee)
  const [m, setM] = useState('')
  const [f, setF] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { setM(String(markup)); setF(String(fee)) }, [markup, fee])

  const num = (v) => Number(String(v).replace(',', '.'))

  const saveAll = async () => {
    const mv = num(m), fv = num(f)
    if (!(mv >= 0) || !(fv >= 0)) return setMsg('Ingresa valores válidos (0 o más).')
    setBusy(true)
    const [a, b] = await Promise.all([save('bs_markup', mv), save('inspection_fee', fv)])
    setBusy(false)
    setMsg(a.error || b.error ? (a.error || b.error).message : 'Cambios guardados.')
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold">Precios y ajustes</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Recargo por pago en bolívares (%)</label>
          <input className="input" inputMode="decimal" value={m} onChange={(e) => setM(e.target.value)} />
          <p className="mt-1 text-xs text-gray-500">Precio referencial = precio en divisas + este %. Ej: 10 → un producto de $100 en divisas se cobra como $110 a tasa BCV. Cada producto puede tener su propio precio referencial.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Costo de la revisión técnica ($ en divisas)</label>
          <input className="input" inputMode="decimal" value={f} onChange={(e) => setF(e.target.value)} />
          <p className="mt-1 text-xs text-gray-500">En 0 se muestra "a confirmar". El precio en Bs usa el mismo recargo.</p>
        </div>
      </div>
      <button onClick={saveAll} disabled={busy} className="btn-primary mt-4">Guardar ajustes</button>
      {msg && <p className="mt-2 text-sm text-gray-600">{msg}</p>}
    </section>
  )
}
