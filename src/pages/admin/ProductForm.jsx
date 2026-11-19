import { useState } from 'react'
import { X, Upload, Loader2, Trash2, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { CATEGORIES } from '../../config'
import { compressImage } from '../../lib/image'
import { useRateStore } from '../../store/useRateStore'
import { fmtUsd, fmtBs, refUsd, round2 } from '../../lib/pricing'

const EMPTY = { name: '', description: '', specs: '', category: 'telefonos', price_usd: '', price_bcv_usd: '', stock: 0, active: true }

export default function ProductForm({ product, onClose, onSaved }) {
  const rate = useRateStore((s) => s.rate)
  const markup = useRateStore((s) => s.markup)
  const [form, setForm] = useState(product ? { ...EMPTY, ...product } : EMPTY)
  const [images, setImages] = useState(
    product?.images?.length ? product.images : product?.image_url ? [product.image_url] : []
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const upload = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setUploading(true)
    setError('')
    for (const original of files) {
      const file = await compressImage(original)
      const ext = file.name.split('.').pop()
      const path = `${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '31536000', contentType: file.type })
      if (error) {
        setError('No se pudo subir una imagen: ' + error.message)
        continue
      }
      const url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      setImages((prev) => [...prev, url])
    }
    setUploading(false)
  }

  const makeMain = (i) => setImages((prev) => [prev[i], ...prev.filter((_, k) => k !== i)])
  const removeImg = (i) => setImages((prev) => prev.filter((_, k) => k !== i))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      specs: form.specs?.trim() || null,
      category: form.category,
      price_usd: Number(form.price_usd),
      price_bcv_usd: form.price_bcv_usd === '' || form.price_bcv_usd == null ? null : Number(form.price_bcv_usd),
      stock: parseInt(form.stock, 10) || 0,
      image_url: images[0] || null,
      images,
      active: form.active,
    }
    const { error } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload)
    setSaving(false)
    if (error) return setError(error.message)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{product ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-gray-100"><X className="h-6 w-6" /></button>
        </div>

        <input className="input" placeholder="Nombre" value={form.name} onChange={(e) => set('name', e.target.value)} required />

        <div>
          <label className="mb-1 block text-sm font-semibold">Descripción completa</label>
          <textarea className="input" rows={5} placeholder="Describe el producto: estado, qué incluye en la caja, garantía, etc." value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Ficha técnica <span className="font-normal text-gray-400">(una característica por línea, formato "Nombre: valor")</span></label>
          <textarea className="input font-mono text-sm" rows={6} placeholder={'Marca: Samsung\nModelo: Galaxy A15\nAlmacenamiento: 128 GB\nRAM: 4 GB\nPantalla: 6.5 pulgadas\nCámara: 50 MP\nBatería: 5000 mAh'} value={form.specs || ''} onChange={(e) => set('specs', e.target.value)} />
        </div>

        <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
          {CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">Precio en divisas ($ efectivo)</label>
            <input className="input" type="number" step="0.01" min="0" inputMode="decimal" value={form.price_usd} onChange={(e) => set('price_usd', e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Stock</label>
            <input className="input" type="number" min="0" inputMode="numeric" value={form.stock} onChange={(e) => set('stock', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Precio referencial a tasa BCV ($) <span className="font-normal text-gray-400">(opcional)</span></label>
          <input className="input" type="number" step="0.01" min="0" inputMode="decimal" placeholder="Vacío = precio en divisas + recargo global" value={form.price_bcv_usd ?? ''} onChange={(e) => set('price_bcv_usd', e.target.value)} />
          {form.price_usd !== '' && (
            <p className="mt-1 text-xs text-gray-500">
              Se cobrará a los clientes como {fmtUsd(refUsd({ price_usd: form.price_usd, price_bcv_usd: form.price_bcv_usd === '' ? null : form.price_bcv_usd }, markup))}
              {rate > 0 && <> = {fmtBs(round2(refUsd({ price_usd: form.price_usd, price_bcv_usd: form.price_bcv_usd === '' ? null : form.price_bcv_usd }, markup) * rate))}</>}
              {form.price_bcv_usd === '' && markup > 0 && <> (recargo global {markup}%)</>}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Fotos <span className="font-normal text-gray-400">(la primera es la principal)</span></label>
          {images.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {images.map((src, i) => (
                <div key={src} className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 bg-gray-50 ${i === 0 ? 'border-brand' : 'border-gray-200'}`}>
                  <img src={src} alt="" className="h-full w-full object-contain" />
                  {i !== 0 && (
                    <button type="button" onClick={() => makeMain(i)} title="Hacer principal" className="absolute left-0.5 top-0.5 rounded-full bg-white/90 p-1"><Star className="h-3.5 w-3.5" /></button>
                  )}
                  <button type="button" onClick={() => removeImg(i)} title="Quitar" className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-1 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
          <label className="btn-secondary cursor-pointer">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            {images.length ? 'Agregar más fotos' : 'Subir fotos'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = '' }} />
          </label>
        </div>

        <label className="flex min-h-[44px] items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[#fa6f29]" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
          <span className="font-semibold">Visible en la tienda</span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" disabled={saving || uploading}>
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar'}
        </button>
      </form>
    </div>
  )
}
