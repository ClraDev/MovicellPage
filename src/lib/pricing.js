export const toBs = (usd, rate) => usd * rate

export const fmtUsd = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export const fmtBs = (n) =>
  'Bs ' +
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
    : ''

// ---------- Modelo de 3 precios ----------
// 1) price_usd      = precio en divisas (efectivo)  -> la oferta
// 2) Bs             = precio referencial × tasa BCV
// 3) precio ref. $  = price_bcv_usd (si se definió) o price_usd × (1 + recargo global %)
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

export const refUsd = (item, markup = 0) =>
  item.price_bcv_usd != null && item.price_bcv_usd !== ''
    ? round2(item.price_bcv_usd)
    : round2(Number(item.price_usd) * (1 + Number(markup || 0) / 100))

export function cartTotals(items, markup, rate) {
  const cash = round2(items.reduce((a, i) => a + i.qty * Number(i.price_usd), 0))
  const ref = round2(items.reduce((a, i) => a + i.qty * refUsd(i, markup), 0))
  return { cash, ref, bs: round2(ref * rate) }
}
