import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { fmtUsd, fmtBs, fmtDateTime, round2 } from '../../lib/pricing'
import { useRateStore } from '../../store/useRateStore'

// upsert: crea el ajuste si todavía no existe en la base de datos
const save = (key, value) =>
  supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

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

// ---------- Precios: productos y revisión técnica ----------
export function PricingPanel() {
  const st = useRateStore()
  const [f, setF] = useState({ markup: '', fee: '', feeMarkup: '', feeBcv: '' })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setF({
      markup: String(st.markup),
      fee: String(st.inspectionFee),
      feeMarkup: String(st.inspectionMarkup),
      feeBcv: String(st.inspectionFeeBcv),
    })
  }, [st.markup, st.inspectionFee, st.inspectionMarkup, st.inspectionFeeBcv])

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const num = (v) => Number(String(v).replace(',', '.'))

  const feeNum = num(f.fee) || 0
  const previewRef = num(f.feeBcv) > 0 ? num(f.feeBcv) : round2(feeNum * (1 + (num(f.feeMarkup) || 0) / 100))

  const saveAll = async () => {
    const vals = [num(f.markup), num(f.fee), num(f.feeMarkup), num(f.feeBcv)]
    if (vals.some((v) => !(v >= 0))) return setMsg('Ingrese valores válidos (0 o más).')
    setBusy(true)
    const res = await Promise.all([
      save('bs_markup', vals[0]),
      save('inspection_fee', vals[1]),
      save('inspection_markup', vals[2]),
      save('inspection_fee_bcv', vals[3]),
    ])
    setBusy(false)
    const err = res.find((r) => r.error)
    setMsg(err ? err.error.message : 'Cambios guardados.')
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold">Precios y ajustes</h2>

      <div className="mt-3 rounded-xl border border-gray-100 p-4">
        <h3 className="font-bold">Productos</h3>
        <label className="mb-1 mt-2 block text-sm font-semibold">Recargo por pago en bolívares (%)</label>
        <input className="input sm:max-w-xs" inputMode="decimal" value={f.markup} onChange={(e) => set('markup', e.target.value)} />
        <p className="mt-1 text-xs text-gray-500">
          Precio referencial = precio en divisas + este %. Ej.: 10 → un producto de $100 en divisas se cobra como $110 a tasa BCV.
          En 0 no se muestra el aviso de oferta. Cada producto puede tener su propio precio referencial.
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-gray-100 p-4">
        <h3 className="font-bold">Revisión técnica</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Costo en divisas ($)</label>
            <input className="input" inputMode="decimal" value={f.fee} onChange={(e) => set('fee', e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">En 0 se muestra "por confirmar".</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Recargo en bolívares (%)</label>
            <input className="input" inputMode="decimal" value={f.feeMarkup} onChange={(e) => set('feeMarkup', e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Independiente del recargo de los productos.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Precio manual a tasa BCV ($)</label>
            <input className="input" inputMode="decimal" value={f.feeBcv} onChange={(e) => set('feeBcv', e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">Opcional. En 0 se calcula con el recargo.</p>
          </div>
        </div>
        {feeNum > 0 && (
          <p className="mt-3 text-sm text-gray-600">
            Vista previa: <strong>{fmtUsd(feeNum)}</strong> en divisas · <strong>{fmtUsd(previewRef)}</strong> a tasa BCV
            {st.rate > 0 && <> = <strong>{fmtBs(round2(previewRef * st.rate))}</strong></>}
          </p>
        )}
      </div>

      <button onClick={saveAll} disabled={busy} className="btn-primary mt-4">Guardar ajustes</button>
      {msg && <p className="mt-2 text-sm text-gray-600">{msg}</p>}
    </section>
  )
}
