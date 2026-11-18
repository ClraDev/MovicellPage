// Campo de cédula / RIF: tipo (V, E, J) + número
export default function IdField({ type, number, onType, onNumber, error, label = 'Cédula o RIF' }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      <div className="flex gap-2">
        <select className="input !w-20 shrink-0" value={type} onChange={(e) => onType(e.target.value)} aria-label="Tipo de documento">
          <option value="V">V</option>
          <option value="E">E</option>
          <option value="J">J</option>
        </select>
        <input
          className="input"
          inputMode="numeric"
          placeholder="12345678"
          maxLength={10}
          value={number}
          onChange={(e) => onNumber(e.target.value.replace(/\D/g, ''))}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
