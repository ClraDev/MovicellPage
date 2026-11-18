import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Carga el catálogo y lo mantiene sincronizado (stock en tiempo real)
export function useProducts({ onlyActive = true } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      let q = supabase.from('products').select('*').order('created_at', { ascending: false })
      if (onlyActive) q = q.eq('active', true)
      const { data, error } = await q
      if (cancelled) return
      if (error) setError(error.message)
      else setProducts(data)
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('products-' + (onlyActive ? 'public' : 'admin'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (p) => {
        setProducts((prev) => {
          if (p.eventType === 'DELETE') return prev.filter((x) => x.id !== p.old.id)
          const row = p.new
          if (onlyActive && !row.active) return prev.filter((x) => x.id !== row.id)
          const exists = prev.some((x) => x.id === row.id)
          return exists ? prev.map((x) => (x.id === row.id ? row : x)) : [row, ...prev]
        })
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [onlyActive])

  const reload = async () => {
    let q = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (onlyActive) q = q.eq('active', true)
    const { data } = await q
    if (data) setProducts(data)
  }

  return { products, loading, error, reload }
}
