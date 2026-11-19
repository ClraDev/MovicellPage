import { useEffect, useMemo } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import Catalog from '../components/home/Catalog'
import ServicesSection from '../components/home/ServicesSection'
import FaqSection from '../components/home/FaqSection'
import ServiceModal from '../components/cart/ServiceModal'
import LocationSection from '../components/home/LocationSection'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutModal from '../components/cart/CheckoutModal'
import { useProducts } from '../hooks/useProducts'
import { useCartStore } from '../store/useCartStore'
import { useUiStore } from '../store/useUiStore'
import { useRateStore } from '../store/useRateStore'
import { refUsd } from '../lib/pricing'

export default function Home() {
  const { products, loading, error } = useProducts()
  const sync = useCartStore((s) => s.syncWithProducts)

  useEffect(() => { if (!loading && !error) sync(products) }, [products, loading, error, sync])

  // Al volver desde la ficha de un producto, regresa a la posición donde estaba
  useEffect(() => {
    if (loading) return
    const y = useUiStore.getState().homeScroll
    if (y > 0) {
      window.scrollTo({ top: y, behavior: 'instant' })
      useUiStore.getState().setHomeScroll(0)
    }
  }, [loading])

  // ¿Algún producto tiene precio en divisas menor al equivalente? (para mostrar o no el mensaje de oferta)
  const markup = useRateStore((s) => s.markup)
  const hasOffers = useMemo(() => products.some((p) => refUsd(p, markup) > Number(p.price_usd)), [products, markup])

  const featured = products
    .filter((p) => p.image_url && p.stock > 0 && p.category === 'telefonos')
    .slice(0, 4)

  return (
    <>
      <Navbar />
      <main>
        <Hero featured={featured} hasOffers={hasOffers} />
        <Catalog products={products} loading={loading} error={error} hasOffers={hasOffers} />
        <ServicesSection />
        <LocationSection />
        <FaqSection />
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <ServiceModal />
    </>
  )
}
