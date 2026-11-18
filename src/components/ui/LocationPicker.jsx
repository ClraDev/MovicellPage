import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, Loader2 } from 'lucide-react'

const CENTER = [10.6427, -71.6125] // Maracaibo
const pinIcon = L.divIcon({
  className: '',
  html: '<svg width="32" height="42" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#fa6f29"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
})

const r6 = (n) => Number(n.toFixed(6))

// Mapa para marcar el punto de entrega (OpenStreetMap, sin API key)
export default function LocationPicker({ value, onChange }) {
  const el = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const cb = useRef(onChange)
  cb.current = onChange
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState('')

  const place = (lat, lng) => {
    if (marker.current) marker.current.setLatLng([lat, lng])
    else {
      marker.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map.current)
      marker.current.on('dragend', () => {
        const p = marker.current.getLatLng()
        cb.current({ lat: r6(p.lat), lng: r6(p.lng) })
      })
    }
  }

  const setPin = (lat, lng) => {
    place(lat, lng)
    cb.current({ lat: r6(lat), lng: r6(lng) })
  }

  useEffect(() => {
    const m = L.map(el.current, {
      center: value ? [value.lat, value.lng] : CENTER,
      zoom: value ? 16 : 13,
      scrollWheelZoom: false,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(m)
    map.current = m
    m.on('click', (e) => setPin(e.latlng.lat, e.latlng.lng))
    if (value) place(value.lat, value.lng)
    const t = setTimeout(() => m.invalidateSize(), 150)
    return () => {
      clearTimeout(t)
      m.remove()
      map.current = null
      marker.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const locate = () => {
    setGeoError('')
    if (!navigator.geolocation) return setGeoError('Su navegador no permite obtener la ubicación.')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPin(latitude, longitude)
        map.current?.setView([latitude, longitude], 17)
        setLocating(false)
      },
      () => {
        setGeoError('No fue posible obtener su ubicación. Marque el punto en el mapa o pegue un enlace de Google Maps.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>
      <button type="button" onClick={locate} disabled={locating} className="btn-secondary mb-2 w-full">
        {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
        Usar mi ubicación actual
      </button>
      <div ref={el} className="relative z-0 h-56 w-full overflow-hidden rounded-xl border border-gray-200" />
      <p className="mt-1 text-xs text-gray-500">Toque el mapa para colocar el marcador. Puede arrastrarlo para ajustarlo.</p>
      {geoError && <p className="mt-1 text-sm text-red-500">{geoError}</p>}
    </div>
  )
}
