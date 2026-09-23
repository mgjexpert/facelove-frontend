// Local administrator utility. Never commit the generated link or the service key.
import { createHash, randomBytes } from 'node:crypto'

const [username, order, duration = 'lifetime', kind = 'free'] = process.argv.slice(2)
if (!/^[a-z0-9_]{3,32}$/.test(username || '') || !/^[1-9]\d*$/.test(order || '') ||
    !/^(lifetime|[1-9]\d*d)$/.test(duration) || !['free', 'manual_paid'].includes(kind)) {
  console.error('Utilização: node scripts/create-album-invite.mjs <username> <album-order> [lifetime|7d] [free|manual_paid]')
  process.exit(1)
}
const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!base || !key) throw new Error('SUPABASE_URL e SUPABASE_SECRET_KEY são necessários no ambiente local')
const authorization = key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }
async function rest(table, query, options = {}) {
  const response = await fetch(new URL(`/rest/v1/${table}${query ? '?' + query : ''}`, base), {
    ...options, headers: { apikey: key, ...authorization, 'Content-Type': 'application/json', Prefer: 'return=representation', ...options.headers }
  })
  if (!response.ok) throw new Error(`Operação falhou (${response.status})`)
  return response.json()
}
const [profile] = await rest('profiles', `username=eq.${username}&select=id`)
if (!profile) throw new Error('Perfil não encontrado')
const [space] = await rest('spaces', `profile_id=eq.${profile.id}&select=id`)
const [album] = await rest('albums', `space_id=eq.${space.id}&sort_order=eq.${order}&select=id,title`)
if (!album) throw new Error('Álbum não encontrado')
const token = randomBytes(32).toString('base64url')
const token_hash = createHash('sha256').update(token).digest('hex')
const expires_at = duration === 'lifetime' ? null : new Date(Date.now() + Number.parseInt(duration) * 86400_000).toISOString()
await rest('access_links', '', { method: 'POST', body: JSON.stringify({ album_id: album.id, token_hash,
  label: `${username} · ${album.title} · ${kind}`, grant_kind: kind, expires_at }) })
const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://facelove.online').replace(/\/$/, '')
console.log(`Convite para ${username} / ${album.title}: ${site}/s/${token}`)
