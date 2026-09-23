-- Private tables have no grants to browser roles; add explicit service policies for auditing.
create policy media_sources_server on public.media_sources for all to service_role using (true) with check (true);
create policy access_links_server on public.access_links for all to service_role using (true) with check (true);
create policy access_events_server on public.access_events for all to service_role using (true) with check (true);
-- The project-level DDL trigger existed before FaceLove migrations; keep it out of PostgREST.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
