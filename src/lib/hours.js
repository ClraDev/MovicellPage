// Horario de la tienda (hora de Venezuela). Debe coincidir con BUSINESS.hours en config.js
const OPEN = 9 * 60          // 9:00 am
const CLOSE_WEEK = 18 * 60   // 6:00 pm (lunes a sábado)
const CLOSE_SUN = 15 * 60    // 3:00 pm (domingo)

export function openStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Caracas', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(now)
  const get = (t) => parts.find((p) => p.type === t)?.value
  const mins = (Number(get('hour')) % 24) * 60 + Number(get('minute'))
  const sunday = get('weekday') === 'Sun'
  const close = sunday ? CLOSE_SUN : CLOSE_WEEK
  const isOpen = mins >= OPEN && mins < close
  return {
    isOpen,
    text: isOpen ? `Abierto en este momento · cierra a las ${sunday ? '3:00 pm' : '6:00 pm'}` : 'Cerrado en este momento · abre a las 9:00 am',
  }
}
