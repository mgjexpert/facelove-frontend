-- Resolve a verified owner's email privately so the password stays managed by Supabase Auth.
create function public.resolve_login_email(p_username text)
returns text language sql stable security definer set search_path = '' as $$
  select u.email from public.profiles p
  join auth.users u on u.id = p.owner_id
  where p.username = lower(regexp_replace(p_username, '^@', ''))
    and u.email_confirmed_at is not null
  limit 1;
$$;
revoke all on function public.resolve_login_email(text) from public, anon, authenticated;
grant execute on function public.resolve_login_email(text) to service_role;
