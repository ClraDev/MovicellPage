import { create } from 'zustand'

const PAGE = 12 // productos que se muestran por tanda en el catálogo

// Estado compartido de la interfaz (búsqueda, categoría, orden, paginación y scroll)
export const useUiStore = create((set) => ({
  query: '',
  category: 'all',
  sort: 'recent',
  limit: PAGE,
  serviceModal: null, // null | 'revision' | 'reparacion'
  homeScroll: 0, // posición del catálogo al abrir una ficha, para volver al mismo lugar
  setQuery: (query) => set({ query, limit: PAGE }),
  setCategory: (category) => set({ category, limit: PAGE }),
  setSort: (sort) => set({ sort, limit: PAGE }),
  showMore: () => set((s) => ({ limit: s.limit + PAGE })),
  openService: (serviceModal) => set({ serviceModal }),
  closeService: () => set({ serviceModal: null }),
  setHomeScroll: (homeScroll) => set({ homeScroll }),
}))

export const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
