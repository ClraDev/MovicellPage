import { BUSINESS } from '../config'
import { fmtUsd, fmtBs, refUsd, round2, cartTotals } from './pricing'

// Quita espacios especiales/invisibles que algunos teléfonos muestran como símbolos raros
const clean = (s) =>
  String(s ?? '')
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/[\u200b-\u200f\u2028\u2029\ufeff]/g, '')
    .trim()

const LINE = '------------------------------'
const wa = (text) => `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(text)}`
const rateText = (rate) =>
  clean(rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

// ---------------- Pedido de productos ----------------
// customer: { name, idDoc, phone, pay: 'usd'|'bs', usdMethod, method: 'pickup'|'delivery', address, locationUrl }
export function buildWhatsAppUrl({ items, rate, markup, customer }) {
  const payBs = customer.pay === 'bs'
  const totals = cartTotals(items, markup, rate)

  const products = items.flatMap((i, idx) => {
    const unit = payBs ? round2(refUsd(i, markup) * rate) : Number(i.price_usd)
    const sub = payBs ? round2(refUsd(i, markup) * i.qty * rate) : round2(Number(i.price_usd) * i.qty)
    const f = payBs ? fmtBs : fmtUsd
    return [
      `${idx + 1}. *${clean(i.name)}*`,
      `    Cantidad: ${i.qty} x ${clean(f(unit))}`,
      `    Subtotal: ${clean(f(sub))}`,
      '',
    ]
  })

  const isDelivery = customer.method === 'delivery'

  const text = [
    '*NUEVO PEDIDO*',
    BUSINESS.name,
    LINE,
    '',
    '*DATOS PARA LA FACTURA*',
    `Nombre: ${clean(customer.name)}`,
    `Cédula/RIF: ${clean(customer.idDoc)}`,
    `Teléfono: ${clean(customer.phone)}`,
    '',
    '*PRODUCTOS*',
    ...products,
    LINE,
    `*FORMA DE PAGO:* ${payBs ? 'Bolívares (tasa BCV)' : `Divisas (${clean(customer.usdMethod || 'Efectivo')})`}`,
    '*TOTAL A PAGAR*',
    ...(payBs
      ? [
          clean(fmtBs(totals.bs)),
          `Equivalente a ${clean(fmtUsd(totals.ref))} a tasa BCV`,
          `Tasa BCV del día: ${rateText(rate)} Bs por USD`,
        ]
      : [clean(fmtUsd(totals.cash))]),
    LINE,
    '',
    '*ENTREGA*',
    `Modalidad: ${isDelivery ? 'Delivery' : 'Retiro en tienda'}`,
    ...(isDelivery
      ? [
          `Dirección: ${clean(customer.address)}`,
          `Ubicación: ${clean(customer.locationUrl)}`,
        ]
      : [`Retiro en: ${BUSINESS.address}`]),
    '',
    isDelivery
      ? 'La entrega se realiza únicamente al titular de la cédula indicada.'
      : 'El equipo solo podrá ser retirado por el titular de la cédula indicada.',
    '',
    'Quedo atento a su confirmación. Muchas gracias.',
  ].join('\n')

  return wa(text)
}

// ---------------- Solicitud de servicio técnico ----------------
// data: { type: 'revision'|'reparacion', name, idDoc, model, problem, feeText? }
export function buildServiceRequestUrl(data) {
  const isRevision = data.type === 'revision'
  const text = [
    '*SOLICITUD DE SERVICIO TÉCNICO*',
    BUSINESS.name,
    LINE,
    '',
    '*SERVICIO SOLICITADO*',
    `Tipo: ${isRevision ? 'Revisión técnica' : 'Reparación'}`,
    isRevision
      ? `Costo de la revisión: ${clean(data.feeText || 'por confirmar')} (no se cobra si el equipo se repara con nosotros)`
      : 'El costo de la reparación se cotiza según el problema del equipo.',
    '',
    '*DATOS DEL CLIENTE*',
    `Nombre: ${clean(data.name)}`,
    `Cédula/RIF: ${clean(data.idDoc)}`,
    '',
    '*EQUIPO*',
    `Modelo: ${clean(data.model)}`,
    `Problema: ${clean(data.problem)}`,
    '',
    'El equipo solo podrá ser retirado por el titular de la cédula indicada.',
    '',
    'Quedo atento a su respuesta. Muchas gracias.',
  ].join('\n')
  return wa(text)
}

export const buildGeneralUrl = (msg = 'Saludos, deseo obtener más información sobre sus productos y servicios.') => wa(msg)
