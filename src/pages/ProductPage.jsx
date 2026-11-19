import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShoppingCart, Share2, Check, Smartphone, Truck, Store, PackageSearch, BadgeCheck } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutModal from '../components/cart/CheckoutModal'
import { useProducts } from '../hooks/useProducts'
import { useGoTo } from '../hooks/useGoTo'
import { useCartStore } from '../store/useCartStore'
import { useRateStore } from '../store/useRateStore'
import { fmtUsd, fmtBs, toBs } from '../lib/pricing'
import { BUSINESS, CATEGORIES } from '../config'
import PriceTriple from '../components/ui/PriceTriple'
import { parseSpecs } from '../lib/specs'


export default function ProductPage() {
  const { id } = useParams()
  const go = useGoTo()
  const navigate = useNavigate()
  const location = useLocation()
  // Si el usuario vino desde la tienda, vuelve exactamente a donde estaba
  const goBack = () => (location.key !== 'default' ? navigate(-1) : go('catalogo'))
  const { products, loading } = useProducts()
  const { addItem, openCheckout, syncWithProducts } = useCartStore()
  const inCart = useCartStore((s) => s.items.find((i) => i.id === id)?.qty || 0)
  const rate = useRateStore((s) => s.rate)

  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [copied, setCopied] = useState(false)

  const product = products.find((p) => p.id === id)

  useEffect(() => {
    window.scrollTo(0, 0)
    setImgIdx(0)
    setQty(1)
  }, [id])

  useEffect(() => {
    if (!loading) syncWithProducts(products)
  }, [products, loading, syncWithProducts])

  const gallery = useMemo(
    () => (product ? [...new Set([product.image_url, ...(product.images || [])].filter(Boolean))] : []),
    [product]
  )
  const specs = useMemo(() => parseSpecs(product?.specs), [product])

  let body
  if (loading) {
    body = <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-3xl bg-gray-100" />
  } else if (!product) {
    body = (
      <div className="flex flex-col items-center py-20 text-center text-gray-500">
        <PackageSearch className="h-16 w-16 text-gray-300" />
        <p className="mt-3 text-lg font-semibold">Este producto ya no se encuentra disponible.</p>
        <button onClick={() => go('catalogo')} className="btn-primary mt-5">Ver catálogo</button>
      </div>
    )
  } else {
    const maxStock = product.stock
    const soldOut = product.stock <= 0
    const low = product.stock > 0 && product.stock <= 3
    const remaining = Math.max(0, maxStock - inCart)
    const canAdd = !soldOut && remaining > 0
    const catLabel = CATEGORIES.find((c) => c.id === product.category)?.label

    const addToCart = () => {
      const n = Math.min(qty, remaining)
      for (let k = 0; k < n; k++)
        addItem({
          id: product.id,
          name: product.name,
          price_usd: Number(product.price_usd),
          price_bcv_usd: product.price_bcv_usd ?? null,
          image_url: product.image_url,
          category: product.category,
          stock: maxStock,
        })
      return n
    }

    const onAdd = () => {
      if (addToCart() > 0) {
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
        setQty(1)
      }
    }

    const onBuyNow = () => {
      if (addToCart() > 0) openCheckout()
    }

    const share = async () => {
      const url = window.location.href
      if (navigator.share) {
        try { await navigator.share({ title: product.name, url }) } catch { /* cancelado */ }
      } else {
        await navigator.clipboard?.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    }

    body = (
      <div className="mx-auto max-w-6xl">
        <button onClick={goBack} className="mb-4 inline-flex min-h-[44px] items-center gap-2 font-semibold text-gray-600 hover:text-brand">
          <ArrowLeft className="h-5 w-5" /> Volver al catálogo
        </button>

        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          {/* Galería */}
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
              {gallery[imgIdx] ? (
                <img src={gallery[imgIdx]} alt={product.name} className="h-full w-full object-contain p-4" />
              ) : (
                <Smartphone className="h-28 w-28 text-gray-300" strokeWidth={1.2} />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-50 sm:h-20 sm:w-20 ${i === imgIdx ? 'border-brand' : 'border-transparent'}`}
                    aria-label={`Foto ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compra */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">{catLabel}</p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">{product.name}</h1>

            <div className="mt-4">
              <PriceTriple product={product} size="lg" />
            </div>

            <p className={`mt-4 inline-block rounded-full px-3 py-1 text-sm font-bold ${
              soldOut ? 'bg-gray-200 text-gray-600' : low ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
            }`}>
              {soldOut ? 'Agotado' : low ? `Últimas ${product.stock} unidades disponibles` : `Unidades disponibles: ${product.stock}`}
            </p>

            {canAdd && (
              <div className="mt-5 flex items-center gap-3">
                <span className="text-sm font-semibold">Cantidad</span>
                <div className="flex items-center rounded-xl border border-gray-200">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center" aria-label="Menos"><Minus className="h-4 w-4" /></button>
                  <span className="w-8 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(remaining, q + 1))} disabled={qty >= remaining} className="flex h-11 w-11 items-center justify-center disabled:opacity-30" aria-label="Más"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={onBuyNow} disabled={!canAdd} className="btn-primary !bg-gray-900">Comprar ahora</button>
              <button onClick={onAdd} disabled={!canAdd} className="btn-primary">
                {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                {soldOut ? 'Agotado' : remaining === 0 ? 'Máximo en el carrito' : added ? 'Agregado' : 'Agregar al carrito'}
              </button>
            </div>

            <button onClick={share} className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand">
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />} {copied ? 'Enlace copiado' : 'Compartir producto'}
            </button>

            <div className="mt-4 space-y-3 rounded-2xl bg-brand-marzipan/30 p-4 text-sm">
              {['telefonos', 'tablets'].includes(product.category) && (
                <p className="flex gap-3"><BadgeCheck className="h-5 w-5 shrink-0 text-brand" /><span><strong>Equipo nuevo</strong></span></p>
              )}
              <p className="flex gap-3"><Store className="h-5 w-5 shrink-0 text-brand" /><span><strong>Retiro en tienda:</strong> {BUSINESS.addressShort}. Solo el titular de la cédula indicada puede retirar el equipo.</span></p>
              <p className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-brand" /><span><strong>Delivery</strong> disponible: indique su ubicación en el mapa al finalizar el pedido.</span></p>
            </div>
          </div>
        </div>

        {/* Descripción y ficha técnica */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {product.description && (
            <section className="rounded-2xl border border-gray-100 p-5">
              <h2 className="text-xl font-extrabold">Descripción</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">{product.description}</p>
            </section>
          )}
          {specs.length > 0 && (
            <section className="rounded-2xl border border-gray-100 p-5">
              <h2 className="text-xl font-extrabold">Ficha técnica</h2>
              <dl className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100 text-sm">
                {specs.map((s, i) => (
                  <div key={i} className={`grid gap-1 px-3 py-2.5 ${s.label ? 'grid-cols-[2fr_3fr]' : ''} ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    {s.label && <dt className="font-semibold text-gray-700">{s.label}</dt>}
                    <dd className="text-gray-600">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="px-4 py-6 sm:py-10">{body}</main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
    </>
  )
}
