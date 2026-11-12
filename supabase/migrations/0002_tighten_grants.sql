-- DOSEWAW · 0002: Supabase gives anon and authenticated ALL privileges on new tables by default.
-- Row security already hides every row, but visitors should not hold table rights they never need.
-- Visitors (anon): read public.published only. Team (authenticated): read through row security; every write goes
-- through the functions of 0001. Apply on TEST, then LIVE at release.
revoke all on public.members, public.changes, public.history, public.published from anon, authenticated;
grant select on public.published to anon, authenticated;
grant select on public.members, public.changes, public.history to authenticated;
-- the same for anything added to the private schema later
alter default privileges in schema private revoke all on tables from anon, authenticated;
alter default privileges in schema private revoke execute on functions from public;
