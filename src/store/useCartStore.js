import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, price_usd, image_url, stock, qty }
      isOpen: false,
      checkoutOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      openCheckout: () => set({ checkoutOpen: true, isOpen: false }),
      closeCheckout: () => set({ checkoutOpen: false }),

      addItem: (product) =>
        set((s) => {
          const found = s.items.find((i) => i.id === product.id)
          if (found) {
            if (found.qty >= product.stock) return s
            return {
              items: s.items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + 1, stock: product.stock } : i
              ),
            }
          }
          return { items: [...s.items, { ...product, qty: 1 }] }
        }),

      setQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i)),
        })),

      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),

      // Mantiene precios/stock del carrito al día con el catálogo
      syncWithProducts: (products) =>
        set((s) => {
          const next = s.items
            .map((i) => {
              const p = products.find((x) => x.id === i.id)
              if (!p) return null
              const stock = p.stock
              if (stock <= 0) return null
              return {
                ...i,
                name: p.name,
                price_usd: Number(p.price_usd),
                price_bcv_usd: p.price_bcv_usd ?? null,
                image_url: p.image_url,
                stock,
                qty: Math.min(i.qty, stock),
              }
            })
            .filter(Boolean)
          const same = next.length === s.items.length && next.every((n, k) => JSON.stringify(n) === JSON.stringify(s.items[k]))
          return same ? s : { items: next }
        }),
    }),
    { name: 'movicell-cart', partialize: (s) => ({ items: s.items }) }
  )
)

// Selectores reactivos
export const selectCount = (s) => s.items.reduce((a, i) => a + i.qty, 0)
export const selectTotalUsd = (s) => s.items.reduce((a, i) => a + i.qty * i.price_usd, 0)
