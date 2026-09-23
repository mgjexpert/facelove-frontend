drop policy media_owner_write on public.media_assets;
create policy media_owner_insert on public.media_assets for insert to authenticated with check (
  exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid()))
);
create policy media_owner_update on public.media_assets for update to authenticated using (
  exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid()))
) with check (
  exists (select 1 from public.spaces s join public.profiles p on p.id = s.profile_id where s.id = space_id and p.owner_id = (select auth.uid()))
);
create index access_events_link_idx on public.access_events(access_link_id);
create index follows_profile_idx on public.follows(profile_id);
create index media_assets_album_idx on public.media_assets(album_id);
create index media_assets_space_idx on public.media_assets(space_id);
create index post_media_asset_idx on public.post_media(media_asset_id);
