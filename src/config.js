// Datos del negocio: edita aquí y se actualiza toda la página.
export const BUSINESS = {
  name: 'Movicell Services C.A',
  rif: 'J-50330563-0',
  tagline: 'Venta de teléfonos, tablets y accesorios, y servicio técnico en Maracaibo.',
  description:
    'Su tienda de confianza en telefonía. Equipos nuevos de última generación, accesorios y servicio técnico, con precios claros en divisas y en bolívares.',
  // WhatsApp que recibe los pedidos (formato internacional, sin + ni espacios)
  whatsappNumber: '584125165377',
  whatsappDisplay: '+58 412-5165377',
  address: 'C.C. Gran Bazar, Pasillo 4, Local ML-266 y 267, Maracaibo',
  addressShort: 'Centro Comercial Gran Bazar, Pasillo 4, Local ML-266 y 267, Maracaibo',
  hours: [
    { days: 'Lunes a Sábado', time: '9:00 am – 6:00 pm' },
    { days: 'Domingo', time: '9:00 am – 3:00 pm' },
  ],
  instagram: 'https://www.instagram.com/movicellservice.ca',
  mapsLink: 'https://maps.app.goo.gl/7MNK2WYT5wzgQv358',
  // Mapa embebido sin API key. Para precisión exacta: Google Maps > Compartir >
  // Insertar un mapa > copia solo el valor de src="..." y pégalo aquí.
  mapEmbed:
    'https://www.google.com/maps?q=DC+Grand+Bazaar,+Av+15+Delicias,+Maracaibo&output=embed',
}

export const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'telefonos', label: 'Teléfonos' },
  { id: 'tablets', label: 'Tablets' },
  { id: 'accesorios', label: 'Accesorios' },
]


// Ruta correcta a archivos de /public (funciona con GitHub Pages y dominio propio)
export const asset = (path) => import.meta.env.BASE_URL + path
