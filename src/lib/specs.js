// Convierte la ficha técnica escrita como "Marca: Samsung" (una por línea) en filas
export const parseSpecs = (text) =>
  (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(':')
      return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { label: '', value: l }
    })
