import { IdCard } from 'lucide-react'

export const TITULAR_RETIRO = 'El equipo solo podrá ser retirado por el titular de la cédula indicada.'
export const TITULAR_ENTREGA = 'La entrega se realiza únicamente al titular de la cédula indicada.'

export default function Notice({ children }) {
  return (
    <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <IdCard className="mt-0.5 h-5 w-5 shrink-0" />
      <p><strong>Importante:</strong> {children}</p>
    </div>
  )
}
