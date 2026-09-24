// Administrator utility for profiles that do not yet have a verified owner.
// Never commit the printed URL or the Supabase secret key.
import { createHash, randomBytes } from 'node:crypto'

const [username, tier, duration, maxUsesText = '1'] = process.argv.slice(2)
const tiers = { guest: [30, 10], vip: [100, 20], vip_premium: [200, 50], all_in: [null, null] }
const durations = { '5m': 300, '12h': 43200, '24h': 86400, '7d': 604800, '1mo': 2592000, lifetime: null }
const maxUses = duration === 'lifetime' ? null : Number(maxUsesText)
if (!/^[a-z0-9_]{3,32}$/.test(username || '') || !Object.hasOwn(tiers, tier) ||
  !Object.hasOwn(durations, duration) || (duration !== 'lifetime' && (!Number.isSafeInteger(maxUses) || maxUses < 1 || maxUses > 100))) {
  console.error('Uso: node scripts/create-space-invite.mjs <username> <guest|vip|vip_premium|all_in> <5m|12h|24h|7d|1mo|lifetime> [maxUses]')
  process.exit(1)
}
const base = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!base || !key) throw new Error('SUPABASE_URL e SUPABASE_SECRET_KEY são necessários apenas no ambiente local')
async function rest(table, query, options = {}) {
  const response = await fetch(new URL(`/rest/v1/${table}${query ? '?' + query : ''}`, base), {
    ...options, headers: { apikey: key, ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json', Prefer: 'return=representation', ...options.headers }
  })
  if (!response.ok) throw new Error(`Operação falhou (${response.status})`)
  return response.json()
}
const [profile] = await rest('profiles', `username=eq.${username}&select=id`)
if (!profile) throw new Error('Perfil não encontrado')
const [space] = await rest('spaces', `profile_id=eq.${profile.id}&status=eq.published&select=id`)
if (!space) throw new Error('Space publicado não encontrado')
const token = randomBytes(32).toString('base64url')
await rest('access_links', '', { method: 'POST', body: JSON.stringify({
  space_id: space.id, token_hash: createHash('sha256').update(token).digest('hex'),
  tier, image_limit: tiers[tier][0], video_limit: tiers[tier][1],
  duration_seconds: durations[duration], max_uses: maxUses,
  label: `${username} · ${tier} · ${duration}`
}) })
const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://facelove.online').replace(/\/$/, '')
console.log(`Convite ${tier} para @${username}: ${site}/s/${token}`)
