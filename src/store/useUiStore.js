import { create } from 'zustand'

// Estado compartido de la interfaz (búsqueda, categoría, orden y posición de scroll)
export const useUiStore = create((set) => ({
  query: '',
  category: 'all',
  sort: 'recent',
  serviceModal: null, // null | 'revision' | 'reparacion'
  openService: (serviceModal) => set({ serviceModal }),
  closeService: () => set({ serviceModal: null }),
  homeScroll: 0, // posición del catálogo al abrir una ficha, para volver al mismo lugar
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
  setHomeScroll: (homeScroll) => set({ homeScroll }),
}))

export const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
