import { useEffect, useState } from 'react'
import { X, Search, Wrench } from 'lucide-react'
import WhatsAppIcon from '../ui/WhatsAppIcon'
import IdField from '../ui/IdField'
import Notice from '../ui/Notice'
import { useUiStore } from '../../store/useUiStore'
import { useRateStore } from '../../store/useRateStore'
import { buildServiceRequestUrl } from '../../lib/whatsapp'
import { fmtUsd, fmtBs, refUsd, round2 } from '../../lib/pricing'

const INITIAL = { name: '', idType: 'V', idNumber: '', model: '', problem: '' }

export default function ServiceModal() {
  const { serviceModal, openService, closeService } = useUiStore()
  const fee = useRateStore((s) => s.inspectionFee)
  const rate = useRateStore((s) => s.rate)
  const markup = useRateStore((s) => s.markup)
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => { setErrors({}) }, [serviceModal])

  if (!serviceModal) return null
  const isRevision = serviceModal === 'revision'

  const feeText = () => {
    if (!(fee > 0)) return 'por confirmar'
    const ref = refUsd({ price_usd: fee }, markup)
    return rate > 0
      ? `${fmtUsd(fee)} en divisas / ${fmtBs(round2(ref * rate))} en bolívares`
      : `${fmtUsd(fee)} en divisas`
  }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Ingrese su nombre completo'
    if (form.idNumber.length < 5 || form.idNumber.length > 10) e.idNumber = 'Ingrese una cédula o RIF válido'
    if (form.model.trim().length < 2) e.model = 'Indique el modelo del equipo'
    if (form.problem.trim().length < 10) e.problem = 'Describa brevemente el problema (mínimo 10 caracteres)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    const url = buildServiceRequestUrl({
      type: serviceModal,
      name: form.name.trim(),
      idDoc: `${form.idType}-${form.idNumber}`,
      model: form.model.trim(),
      problem: form.problem.trim(),
      feeText: feeText(),
    })
    window.open(url, '_blank', 'noopener')
    setForm(INITIAL)
    closeService()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={closeService}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Solicitud de servicio técnico</h2>
          <button onClick={closeService} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-gray-100" aria-label="Cerrar"><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={submit} className="mt-3 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold">Servicio requerido</p>
            <div className="grid grid-cols-2 gap-3">
              {[['revision', 'Revisión', Search], ['reparacion', 'Reparación', Wrench]].map(([id, label, Icon]) => (
                <button type="button" key={id} onClick={() => openService(id)}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-bold transition ${serviceModal === id ? 'border-brand bg-brand-marzipan/30 text-brand' : 'border-gray-200 text-gray-600'}`}>
                  <Icon className="h-5 w-5" /> {label}
                </button>
              ))}
            </div>
            <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              {isRevision ? <>Costo de la revisión: <strong>{feeText()}</strong>. Tiempo estimado: de 2 a 3 horas (hasta 1 día en casos complejos). No se cobra si repara su equipo con nosotros.</> : 'El costo de la reparación depende de la falla del equipo y se cotiza por WhatsApp.'}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Nombre completo</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <IdField type={form.idType} number={form.idNumber} onType={(v) => set('idType', v)} onNumber={(v) => set('idNumber', v)} error={errors.idNumber} />

          <div>
            <label className="mb-1 block text-sm font-semibold">Modelo del equipo</label>
            <input className="input" placeholder="Ej.: Samsung Galaxy A15" value={form.model} onChange={(e) => set('model', e.target.value)} />
            {errors.model && <p className="mt-1 text-sm text-red-500">{errors.model}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Descripción breve del problema</label>
            <textarea className="input" rows={4} placeholder="Ej.: La pantalla presenta líneas y el equipo no enciende en ocasiones." value={form.problem} onChange={(e) => set('problem', e.target.value)} />
            {errors.problem && <p className="mt-1 text-sm text-red-500">{errors.problem}</p>}
          </div>

          <Notice>El equipo solo podrá ser retirado por el titular de la cédula indicada.</Notice>
          <p className="text-center text-xs text-gray-400">Sus datos se utilizan únicamente para gestionar su solicitud.</p>

          <button type="submit" className="btn-primary w-full !bg-green-600">
            <WhatsAppIcon className="h-5 w-5" /> Enviar solicitud por WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}
