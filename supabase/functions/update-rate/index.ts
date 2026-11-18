// Despliegue:  supabase functions deploy update-rate --no-verify-jwt
// Secreto:     supabase secrets set CRON_SECRET=una-clave-larga-aleatoria
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.headers.get('Authorization') !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: auto } = await supabase
    .from('settings').select('value').eq('key', 'rate_auto').single()
  if (Number(auto?.value) !== 1) return new Response('Modo manual: sin cambios')

  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial')
    if (!res.ok) throw new Error(`DolarAPI ${res.status}`)
    const { promedio } = await res.json()
    if (typeof promedio !== 'number' || promedio <= 0) throw new Error('Tasa inválida')

    await supabase.from('settings')
      .update({ value: promedio, updated_at: new Date().toISOString() })
      .eq('key', 'exchange_rate')

    return new Response(`Tasa actualizada: ${promedio}`)
  } catch (e) {
    return new Response(`Error: ${(e as Error).message}`, { status: 502 })
  }
})
