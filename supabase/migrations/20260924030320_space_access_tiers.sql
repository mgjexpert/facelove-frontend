-- Preserve existing album invitations while allowing one invitation to cover
-- multiple albums in a Space with server-enforced media quotas.
alter table public.access_links alter column album_id drop not null;
alter table public.access_links add column space_id uuid references public.spaces(id) on delete cascade;
alter table public.access_links add column tier text;
alter table public.access_links add column image_limit integer;
alter table public.access_links add column video_limit integer;
alter table public.access_links add column duration_seconds integer;
alter table public.access_links add column activated_at timestamptz;
alter table public.access_links add constraint access_links_one_scope check (num_nonnulls(album_id, space_id) = 1);
alter table public.access_links add constraint access_links_tier_limits check (
  (space_id is null and tier is null and image_limit is null and video_limit is null and duration_seconds is null)
  or (space_id is not null and tier is not null and (
    (tier = 'guest' and image_limit = 30 and video_limit = 10)
    or (tier = 'vip' and image_limit = 100 and video_limit = 20)
    or (tier = 'vip_premium' and image_limit = 200 and video_limit = 50)
    or (tier = 'all_in' and image_limit is null and video_limit is null)
  ) and (duration_seconds is null or duration_seconds in (300, 43200, 86400, 604800, 2592000)))
);
create index access_links_space_idx on public.access_links(space_id);

-- The first activation starts the window. A second activation cannot reset it.
-- Only the backend service role can call the redemption function.
drop function public.redeem_space_link(text);
create function public.redeem_space_link(p_hash text)
returns table (link_id uuid, album_id uuid, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  return query
  update public.access_links l
     set uses_count = l.uses_count + 1,
         activated_at = coalesce(l.activated_at, now())
   where l.token_hash = p_hash and l.revoked_at is null
     and (l.expires_at is null or l.expires_at > now())
     and (l.duration_seconds is null or l.activated_at is null
          or l.activated_at + make_interval(secs => l.duration_seconds) > now())
     and (l.max_uses is null or l.uses_count < l.max_uses)
   returning l.id, l.album_id,
     least(l.expires_at, l.activated_at + make_interval(secs => l.duration_seconds));
end $$;
revoke all on function public.redeem_space_link(text) from public, anon, authenticated;
grant execute on function public.redeem_space_link(text) to service_role;
