import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { asset } from '../../config'

export default function Login() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!loading && session) return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError('Correo o contraseña incorrectos.')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-marzipan/30 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-xl">
        <img src={asset('logo-icon.png')} alt="Movicell" className="mx-auto h-14" />
        <div className="text-center">
          <h1 className="flex items-center justify-center gap-2 text-xl font-extrabold"><Lock className="h-5 w-5 text-brand" /> Acceso del personal</h1>
          <p className="mt-1 text-sm text-gray-500">Solo para personal autorizado de Movicell.</p>
        </div>
        <input className="input" type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        <div className="relative">
          <input className="input pr-12" type={show ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-gray-400" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ingresar'}
        </button>
        <Link to="/" className="block text-center text-sm text-gray-500 hover:text-brand">← Volver a la tienda</Link>
      </form>
    </div>
  )
}
