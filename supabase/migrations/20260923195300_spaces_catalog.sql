-- FaceLove Spaces: public editorial metadata and isolated private provider sources.
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references auth.users(id) on delete set null,
  username text not null unique check (username ~ '^[a-z0-9_]{3,32}$'),
  display_name text not null,
  bio text not null default '',
  avatar_path text,
  cover_path text,
  editorial_draft boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (status in ('draft','published'))
);
create table public.albums (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  title text not null,
  description text not null default '',
  media_type text not null check (media_type in ('image','video','mixed')),
  visibility text not null default 'access_link' check (visibility in ('public','followers','private','access_link')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index albums_space_idx on public.albums(space_id,sort_order);

-- A MEGA share URL includes a decryption key. Only a trusted server key may read this table.
create table public.media_sources (
  album_id uuid primary key references public.albums(id) on delete cascade,
  provider text not null check (provider in ('mega','google_drive')),
  source_url text not null,
  updated_at timestamptz not null default now()
);
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  caption text not null default '',
  visibility text not null default 'public' check (visibility in ('public','followers','private','access_link')),
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index posts_space_idx on public.posts(space_id,published_at desc);
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  album_id uuid references public.albums(id) on delete set null,
  provider text not null check (provider in ('supabase','mega','google_drive','external')),
  external_id text not null,
  media_type text not null check (media_type in ('image','video')),
  mime_type text,
  title text not null default '',
  visibility text not null default 'private' check (visibility in ('public','followers','private','access_link')),
  created_at timestamptz not null default now()
);
create table public.post_media (
  post_id uuid not null references public.posts(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  position integer not null default 0,
  primary key (post_id,media_asset_id)
);
create table public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id,profile_id)
);
create table public.access_links (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  label text not null default '',
  grant_kind text not null default 'free' check (grant_kind in ('free','manual_paid')),
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  uses_count integer not null default 0 check (uses_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index access_links_album_idx on public.access_links(album_id);
create table public.access_events (
  id bigint generated always as identity primary key,
  access_link_id uuid not null references public.access_links(id) on delete cascade,
  event_type text not null check (event_type in ('activated','denied')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.albums enable row level security;
alter table public.media_sources enable row level security;
alter table public.posts enable row level security;
alter table public.media_assets enable row level security;
alter table public.post_media enable row level security;
alter table public.follows enable row level security;
alter table public.access_links enable row level security;
alter table public.access_events enable row level security;

revoke all on public.media_sources, public.access_links, public.access_events from public, anon, authenticated;
grant select, insert, update, delete on public.media_sources, public.access_links, public.access_events to service_role;
grant usage, select on sequence public.access_events_id_seq to service_role;
grant select on public.profiles, public.spaces, public.albums, public.posts, public.media_assets, public.post_media to anon, authenticated;
grant select, insert, delete on public.follows to authenticated;
grant update on public.profiles, public.spaces, public.albums, public.posts, public.media_assets to authenticated;
grant insert on public.posts, public.albums, public.media_assets, public.post_media to authenticated;

create policy profiles_read on public.profiles for select to anon, authenticated using (true);
create policy profiles_owner_update on public.profiles for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy spaces_read on public.spaces for select to anon, authenticated using (status = 'published' or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())));
create policy spaces_owner_update on public.spaces for update to authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())));
create policy albums_read on public.albums for select to anon, authenticated using (exists (select 1 from public.spaces s where s.id = space_id and s.status = 'published'));
create policy albums_owner_update on public.albums for update to authenticated using (exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid())));
create policy albums_owner_insert on public.albums for insert to authenticated with check (exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid())));
create policy posts_read on public.posts for select to anon, authenticated using ((status = 'published' and visibility = 'public' and exists (select 1 from public.spaces s where s.id = space_id and s.status = 'published')) or exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid())));
create policy posts_owner_update on public.posts for update to authenticated using (exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid())));
create policy posts_owner_insert on public.posts for insert to authenticated with check (exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid())));
create policy media_public_read on public.media_assets for select to anon, authenticated using ((visibility = 'public' and provider = 'supabase' and exists (select 1 from public.spaces s where s.id = space_id and s.status = 'published')) or exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid())));
create policy media_owner_write on public.media_assets for all to authenticated using (exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid()))) with check (exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid())));
create policy post_media_read on public.post_media for select to anon, authenticated using (exists (select 1 from public.posts p where p.id = post_id) and exists (select 1 from public.media_assets m where m.id = media_asset_id));
create policy post_media_owner_insert on public.post_media for insert to authenticated with check (exists (select 1 from public.posts p join public.spaces s on s.id = p.space_id join public.profiles f on f.id = s.profile_id join public.media_assets m on m.space_id = s.id where p.id = post_id and m.id = media_asset_id and f.owner_id = (select auth.uid())));
create policy follows_self on public.follows for all to authenticated using (follower_id = (select auth.uid())) with check (follower_id = (select auth.uid()));

-- Server-only atomic invite redemption. No EXECUTE grant for browser roles.
create function public.redeem_space_link(p_hash text)
returns table (link_id uuid, album_id uuid, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  return query
  update public.access_links l
     set uses_count = l.uses_count + 1
   where l.token_hash = p_hash and l.revoked_at is null
     and (l.expires_at is null or l.expires_at > now())
     and (l.max_uses is null or l.uses_count < l.max_uses)
   returning l.id, l.album_id, l.expires_at;
end $$;
revoke all on function public.redeem_space_link(text) from public, anon, authenticated;
grant execute on function public.redeem_space_link(text) to service_role;
