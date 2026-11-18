import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const DOLAR_API = 'https://ve.dolarapi.com/v1/dolares/oficial'
let subscribed = false

export const useRateStore = create((set, get) => {
  // La tasa mostrada es la "en vivo" (API) si el modo automático está activo;
  // si el personal fijó una tasa manual, se usa la guardada en la base de datos.
  const update = (patch) =>
    set((s) => {
      const n = { ...s, ...patch }
      return { ...patch, rate: n.auto && n.liveRate > 0 ? n.liveRate : n.dbRate }
    })

  const fromRows = (rows) => {
    const patch = {}
    for (const r of rows) {
      if (r.key === 'exchange_rate') { patch.dbRate = Number(r.value); patch.updatedAt = r.updated_at }
      if (r.key === 'rate_auto') patch.auto = Number(r.value) === 1
      if (r.key === 'bs_markup') patch.markup = Number(r.value)
      if (r.key === 'inspection_fee') patch.inspectionFee = Number(r.value)
    }
    return patch
  }

  return {
    rate: 0,            // tasa vigente (en vivo o manual)
    dbRate: 0,          // última tasa guardada en la base de datos
    liveRate: 0,        // última tasa consultada directamente al servicio de cambio
    auto: true,         // modo automático activo
    markup: 0,          // recargo % del precio referencial en Bs
    inspectionFee: 0,   // costo de la revisión técnica (USD, divisas)
    updatedAt: null,
    loaded: false,

    // Consulta la tasa oficial del BCV directamente; si falla, se conserva la última conocida
    fetchLive: async () => {
      if (!get().auto) return
      try {
        const ctl = new AbortController()
        const timer = setTimeout(() => ctl.abort(), 8000)
        const res = await fetch(DOLAR_API, { cache: 'no-store', signal: ctl.signal })
        clearTimeout(timer)
        if (!res.ok) return
        const json = await res.json()
        const v = Number(json.promedio)
        if (v > 0) update({ liveRate: v, updatedAt: json.fechaActualizacion || new Date().toISOString() })
      } catch {
        /* sin conexión o servicio no disponible: se mantiene la tasa guardada */
      }
    },

    loadRate: async () => {
      const { data } = await supabase.from('settings').select('key, value, updated_at')
      update({ ...fromRows(data || []), loaded: true })
      await get().fetchLive()

      if (subscribed) return
      subscribed = true
      supabase
        .channel('settings-live')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (p) => {
          update(fromRows([p.new]))
          if (p.new.key === 'rate_auto' && Number(p.new.value) === 1) get().fetchLive()
        })
        .subscribe()
    },
  }
})
