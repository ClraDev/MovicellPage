import { lazy, Suspense, useState } from 'react'
import { X, Truck, Store, MapPin, Banknote, Landmark } from 'lucide-react'
import WhatsAppIcon from '../ui/WhatsAppIcon'
import IdField from '../ui/IdField'
import Notice, { TITULAR_RETIRO, TITULAR_ENTREGA } from '../ui/Notice'
// El mapa (Leaflet) se descarga solo cuando el cliente elige Delivery
const LocationPicker = lazy(() => import('../ui/LocationPicker'))
import { useCartStore } from '../../store/useCartStore'
import { useRateStore } from '../../store/useRateStore'
import { fmtUsd, fmtBs, cartTotals } from '../../lib/pricing'
import { buildWhatsAppUrl } from '../../lib/whatsapp'
import { BUSINESS } from '../../config'

const MAPS_RE = /^https?:\/\/((www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i

const INITIAL = {
  name: '', idType: 'V', idNumber: '', phone: '',
  pay: 'usd', usdMethod: 'Efectivo', method: 'pickup',
  address: '', locMode: 'map', pin: null, link: '',
}

export default function CheckoutModal() {
  const { items, checkoutOpen, closeCheckout, clear, openCart } = useCartStore()
  const rate = useRateStore((s) => s.rate)
  const markup = useRateStore((s) => s.markup)

  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  if (!checkoutOpen) return null

  const totals = cartTotals(items, markup, rate)
  const bsAvailable = rate > 0
  const pay = bsAvailable ? form.pay : 'usd'
  const saving = totals.ref - totals.cash
  const isDelivery = form.method === 'delivery'

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Ingrese su nombre completo'
    if (form.idNumber.length < 5 || form.idNumber.length > 10) e.idNumber = 'Ingrese una cédula o RIF válido'
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Ingrese un teléfono válido'
    if (isDelivery) {
      if (form.address.trim().length < 8) e.address = 'Indique una dirección completa'
      if (form.locMode === 'map' && !form.pin) e.location = 'Marque su ubicación en el mapa'
      if (form.locMode === 'link' && !MAPS_RE.test(form.link.trim())) e.location = 'Pegue un enlace válido de Google Maps'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (!validate() || items.length === 0) return
    const locationUrl = isDelivery
      ? form.locMode === 'map'
        ? `https://www.google.com/maps?q=${form.pin.lat},${form.pin.lng}`
        : form.link.trim()
      : ''
    const url = buildWhatsAppUrl({
      items,
      rate,
      markup,
      customer: {
        name: form.name.trim(),
        idDoc: `${form.idType}-${form.idNumber}`,
        phone: form.phone.trim(),
        pay,
        method: form.method,
        usdMethod: form.usdMethod,
        address: form.address.trim(),
        locationUrl,
      },
    })
    window.open(url, '_blank', 'noopener')
    clear()
    closeCheckout()
  }

  const back = () => {
    closeCheckout()
    openCart()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={closeCheckout}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Finalizar pedido</h2>
          <button onClick={closeCheckout} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-gray-100" aria-label="Cerrar"><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={submit} className="mt-3 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Nombre completo (para la factura)</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <IdField type={form.idType} number={form.idNumber} onType={(v) => set('idType', v)} onNumber={(v) => set('idNumber', v)} error={errors.idNumber} />

          <div>
            <label className="mb-1 block text-sm font-semibold">Teléfono</label>
            <input className="input" type="tel" inputMode="tel" placeholder="0412-0000000" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          {/* Forma de pago */}
          <div>
            <p className="mb-2 text-sm font-semibold">Forma de pago</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => set('pay', 'usd')}
                className={`flex min-h-[64px] flex-col items-center justify-center rounded-xl border-2 px-2 text-sm font-bold transition ${pay === 'usd' ? 'border-brand bg-brand-marzipan/30 text-brand' : 'border-gray-200 text-gray-600'}`}>
                <Banknote className="h-5 w-5" /> Divisas
                {saving > 0 && <span className="text-[11px] font-semibold text-green-700">Mejor precio</span>}
              </button>
              <button type="button" disabled={!bsAvailable} onClick={() => set('pay', 'bs')}
                className={`flex min-h-[64px] flex-col items-center justify-center rounded-xl border-2 px-2 text-sm font-bold transition disabled:opacity-40 ${pay === 'bs' ? 'border-brand bg-brand-marzipan/30 text-brand' : 'border-gray-200 text-gray-600'}`}>
                <Landmark className="h-5 w-5" /> Bolívares
                <span className="text-[11px] font-semibold text-gray-500">A tasa BCV</span>
              </button>
            </div>
          </div>

          {pay === 'usd' && (
            <div>
              <p className="mb-2 text-sm font-semibold">Modalidad de pago en divisas</p>
              <div className="grid grid-cols-3 gap-2">
                {['Efectivo', 'Zelle', 'Binance'].map((m) => (
                  <button type="button" key={m} onClick={() => set('usdMethod', m)}
                    className={`min-h-[44px] rounded-xl border-2 text-sm font-bold transition ${form.usdMethod === m ? 'border-brand bg-brand-marzipan/30 text-brand' : 'border-gray-200 text-gray-600'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Entrega */}
          <div>
            <p className="mb-2 text-sm font-semibold">Modalidad de entrega</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'pickup', label: 'Retiro en tienda', Icon: Store },
                { id: 'delivery', label: 'Delivery', Icon: Truck },
              ].map(({ id, label, Icon }) => (
                <button type="button" key={id} onClick={() => set('method', id)}
                  className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-bold transition ${form.method === id ? 'border-brand bg-brand-marzipan/30 text-brand' : 'border-gray-200 text-gray-600'}`}>
                  <Icon className="h-5 w-5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {isDelivery ? (
            <>
              <Notice>{TITULAR_ENTREGA}</Notice>
              <div>
                <label className="mb-1 block text-sm font-semibold">Dirección de entrega</label>
                <textarea className="input" rows={3} placeholder="Sector, calle, casa o edificio y punto de referencia" value={form.address} onChange={(e) => set('address', e.target.value)} />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Ubicación de entrega</p>
                <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                  {[['map', 'Marcar en el mapa'], ['link', 'Pegar enlace']].map(([id, label]) => (
                    <button type="button" key={id} onClick={() => set('locMode', id)}
                      className={`min-h-[40px] rounded-lg text-sm font-bold transition ${form.locMode === id ? 'bg-white text-brand shadow-sm' : 'text-gray-500'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {form.locMode === 'map' ? (
                  <>
                    <Suspense fallback={<div className="flex h-56 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">Cargando mapa...</div>}>
                      <LocationPicker value={form.pin} onChange={(pin) => set('pin', pin)} />
                    </Suspense>
                    {form.pin && <p className="mt-1 text-sm font-semibold text-green-700">Ubicación registrada</p>}
                  </>
                ) : (
                  <>
                    <input className="input" inputMode="url" placeholder="https://maps.app.goo.gl/..." value={form.link} onChange={(e) => set('link', e.target.value)} />
                    <p className="mt-1 text-xs text-gray-500">En Google Maps, seleccione su ubicación, pulse Compartir y copie el enlace.</p>
                  </>
                )}
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 rounded-xl bg-brand-marzipan/30 p-3 text-sm">
                <MapPin className="h-5 w-5 shrink-0 text-brand" />
                <span>{BUSINESS.addressShort}</span>
              </div>
              <Notice>{TITULAR_RETIRO}</Notice>
            </>
          )}

          {/* Resumen: aquí sí se muestra la tasa */}
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{items.reduce((a, i) => a + i.qty, 0)} artículo(s)</span>
              <span>Total a pagar</span>
            </div>
            <p className="text-right text-2xl font-extrabold">{pay === 'bs' ? fmtBs(totals.bs) : fmtUsd(totals.cash)}</p>
            {pay === 'bs' ? (
              <p className="text-right text-xs text-gray-500">Equivale a {fmtUsd(totals.ref)} · Tasa BCV del día: {fmtBs(rate)} por $</p>
            ) : (
              saving > 0 && <p className="text-right text-xs font-semibold text-green-700">Usted ahorra {fmtUsd(saving)} al pagar en divisas</p>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">Sus datos se utilizan únicamente para gestionar su pedido.</p>

          <button type="submit" className="btn-primary w-full !bg-green-600">
            <WhatsAppIcon className="h-5 w-5" /> Enviar pedido por WhatsApp
          </button>
          <button type="button" onClick={back} className="btn-secondary w-full">Volver al carrito</button>
        </form>
      </div>
    </div>
  )
}
