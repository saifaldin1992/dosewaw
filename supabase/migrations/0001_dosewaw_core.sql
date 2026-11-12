-- DOSEWAW · 0001 core: accounts by invitation, changes with review, publishing with history.
-- Apply on TEST first (dosewaw-test), on LIVE only at release. After applying, rename this file to the version
-- Supabase assigns (supabase_migrations), so both projects stay in step.
--
-- How the data flows:
--   pharmacist / owner edits  →  public.changes (pending; the owner's edits are approved at once)
--   owner approves             →  status 'approved'
--   owner presses «نشر»        →  public.publish_site(): approved changes are applied to the published bundle,
--                                  the version goes up, the old bundle is kept in public.history (rollback)
--   visitors                   →  never reach this database: the Cloudflare worker reads public.published
--                                  once every few seconds and serves it from the edge (/data/*.json).
-- Rules that must hold: permissions are checked HERE (row security + definer functions), never only in the page;
-- no service_role key anywhere in the site; sign-up only by invitation; content is never hard-deleted.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------- accounts ----------
create table if not exists public.members (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '' check (length(name) <= 80 and name !~ '[<>]'),
  role       text not null check (role in ('owner','pharmacist')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists private.invites (
  email      text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role       text not null check (role in ('owner','pharmacist')),
  name       text not null default '',
  invited_by uuid,
  created_at timestamptz not null default now(),
  used_at    timestamptz
);
alter table public.members  enable row level security;
alter table private.invites enable row level security; -- no policies: only the definer functions below read it

create or replace function private.my_role() returns text
language sql stable security definer set search_path = '' as $$
  select m.role from public.members m where m.user_id = auth.uid() and m.active
$$;

-- sign-up is refused unless the e-mail was invited; the invited person becomes a member with the invited role
create or replace function private.guard_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from private.invites i where i.email = lower(new.email) and i.used_at is null) then
    raise exception 'DOSEWAW: sign-up is by invitation only';
  end if;
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now()); -- the invitation already proves the address
  return new;
end $$;
create or replace function private.add_member() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.members(user_id, email, name, role)
  select new.id, lower(new.email), i.name, i.role from private.invites i where i.email = lower(new.email)
  on conflict (user_id) do nothing;
  update private.invites set used_at = now() where email = lower(new.email);
  return new;
end $$;
drop trigger if exists dosewaw_guard_signup on auth.users;
drop trigger if exists dosewaw_add_member on auth.users;
create trigger dosewaw_guard_signup before insert on auth.users for each row execute function private.guard_signup();
create trigger dosewaw_add_member  after  insert on auth.users for each row execute function private.add_member();

create policy "a member reads their own row; the owner reads all" on public.members
  for select to authenticated using (user_id = auth.uid() or private.my_role() = 'owner');
-- no insert/update/delete policies: members change only through the owner functions below

-- ---------- published content (what visitors see) ----------
create table if not exists public.published (
  id         smallint primary key default 1 check (id = 1),
  version    integer not null,
  data       jsonb not null check (jsonb_typeof(data) = 'object'),
  note       text not null default '',
  published_at timestamptz not null default now(),
  published_by uuid
);
create table if not exists public.history (
  id      bigint generated always as identity primary key,
  version integer not null,
  data    jsonb not null,
  note    text not null default '',
  published_at timestamptz not null default now(),
  published_by uuid
);
alter table public.published enable row level security;
alter table public.history   enable row level security;
create policy "everyone reads the published content" on public.published for select to anon, authenticated using (true);
create policy "the team reads the history" on public.history for select to authenticated using (private.my_role() in ('owner','pharmacist'));

-- ---------- changes waiting for review ----------
create table if not exists public.changes (
  id          bigint generated always as identity primary key,
  kind        text not null check (kind in ('drug','brand','source')),
  key         text not null check (key ~ '^[a-z0-9_]{1,40}$'),
  data        jsonb not null check (jsonb_typeof(data) = 'object'),
  note        text not null default '' check (length(note) <= 500 and note !~ '[<>]'),
  status      text not null default 'pending' check (status in ('pending','approved','rejected','applied')),
  author      uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_note text not null default '' check (length(review_note) <= 500 and review_note !~ '[<>]'),
  applied_in  integer
);
create index if not exists changes_status_idx on public.changes(status, created_at);
alter table public.changes enable row level security;
create policy "the owner reads all changes; a pharmacist reads their own" on public.changes
  for select to authenticated using (private.my_role() = 'owner' or (author = auth.uid() and private.my_role() = 'pharmacist'));
-- no write policies: changes are written only through submit_change / review_change / publish_site

-- text checks shared by the functions: no < or > anywhere in stored text (the page also escapes everything it shows)
create or replace function private.clean_json(d jsonb) returns boolean
language sql immutable set search_path = '' as $$ select d::text !~ '[<>]' and octet_length(d::text) <= 400000 $$;

/* a brand change: only known colour tokens with plain colour values, a short name and tagline, a logo as a data URL */
create or replace function private.valid_brand(d jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare k text; v text; mode text;
begin
  for mode in select jsonb_object_keys(coalesce(d->'colors','{}'::jsonb)) loop
    if mode not in ('light','dark') then return false; end if;
    for k, v in select * from jsonb_each_text(d->'colors'->mode) loop
      if k !~ '^--[a-z-]{2,30}$' then return false; end if;
      if v !~* '^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\))$' then return false; end if;
    end loop;
  end loop;
  if d ? 'logo' and (d->>'logo') !~ '^data:image/(png|svg\+xml|webp|jpeg);base64,[A-Za-z0-9+/=]+$' then return false; end if;
  if d ? 'name' and (jsonb_typeof(d->'name') <> 'array' or jsonb_array_length(d->'name') <> 2 or length(d->'name'->>0) + length(d->'name'->>1) > 30) then return false; end if;
  return true;
end $$;

create or replace function public.submit_change(p_kind text, p_key text, p_data jsonb, p_note text default '') returns bigint
language plpgsql security definer set search_path = '' as $$
declare r text := private.my_role(); new_id bigint;
begin
  if r is null then raise exception 'DOSEWAW: members only'; end if;
  if p_kind = 'brand' and r <> 'owner' then raise exception 'DOSEWAW: only the owner changes the visual identity'; end if;
  if not private.clean_json(p_data) then raise exception 'DOSEWAW: text may not contain < or >, and must be under 400 KB'; end if;
  if p_kind = 'brand' and not private.valid_brand(p_data) then raise exception 'DOSEWAW: invalid brand values'; end if;
  insert into public.changes(kind, key, data, note, status, reviewed_by, reviewed_at)
  values (p_kind, p_key, p_data, coalesce(p_note,''),
          case when r = 'owner' then 'approved' else 'pending' end,
          case when r = 'owner' then auth.uid() end, case when r = 'owner' then now() end)
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.review_change(p_id bigint, p_approve boolean, p_note text default '') returns void
language plpgsql security definer set search_path = '' as $$
begin
  if private.my_role() is distinct from 'owner' then raise exception 'DOSEWAW: only the owner reviews'; end if;
  update public.changes set status = case when p_approve then 'approved' else 'rejected' end,
         reviewed_by = auth.uid(), reviewed_at = now(), review_note = coalesce(p_note,'')
   where id = p_id and status = 'pending';
  if not found then raise exception 'DOSEWAW: no pending change %', p_id; end if;
end $$;

/* apply one change to the bundle. drug: merge the edited fields into the antibiotic with that id (new id = new drug);
   source: replace or add the source with that id; brand: replace the brand object. Nothing is ever removed: a drug or
   source is hidden with "hidden": true. */
create or replace function private.apply_change(b jsonb, c public.changes) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare arr jsonb; i int; found boolean := false; idkey text;
begin
  if c.kind = 'brand' then return jsonb_set(b, '{brand}', coalesce(b->'brand','{}'::jsonb) || c.data); end if;
  arr := coalesce(b->(case c.kind when 'drug' then 'antibiotics' else 'sources' end), '[]'::jsonb);
  for i in 0 .. jsonb_array_length(arr) - 1 loop
    idkey := arr->i->>'id';
    if idkey = c.key then arr := jsonb_set(arr, array[i::text], (arr->i) || c.data); found := true; exit; end if;
  end loop;
  if not found then arr := arr || jsonb_build_array(jsonb_build_object('id', case when c.kind = 'source' then to_jsonb(c.key::int) else to_jsonb(c.key) end) || c.data); end if;
  return jsonb_set(b, array[case c.kind when 'drug' then 'antibiotics' else 'sources' end], arr);
end $$;

create or replace function public.publish_site(p_note text default '') returns integer
language plpgsql security definer set search_path = '' as $$
declare cur public.published; b jsonb; c public.changes; v integer;
begin
  if private.my_role() is distinct from 'owner' then raise exception 'DOSEWAW: only the owner publishes'; end if;
  select * into cur from public.published where id = 1 for update;
  if cur is null then raise exception 'DOSEWAW: no content yet (seed first)'; end if;
  b := cur.data; v := cur.version + 1;
  for c in select * from public.changes where status = 'approved' order by id loop
    b := private.apply_change(b, c);
    update public.changes set status = 'applied', applied_in = v where id = c.id;
  end loop;
  insert into public.history(version, data, note, published_at, published_by) values (cur.version, cur.data, cur.note, cur.published_at, cur.published_by);
  update public.published set version = v, data = b, note = coalesce(p_note,''), published_at = now(), published_by = auth.uid() where id = 1;
  return v;
end $$;

-- go back to an earlier published version (the current one is kept in the history too)
create or replace function public.rollback_to(p_version integer) returns integer
language plpgsql security definer set search_path = '' as $$
declare cur public.published; old public.history; v integer;
begin
  if private.my_role() is distinct from 'owner' then raise exception 'DOSEWAW: only the owner'; end if;
  select * into cur from public.published where id = 1 for update;
  select * into old from public.history where version = p_version order by id desc limit 1;
  if old is null then raise exception 'DOSEWAW: version % not found', p_version; end if;
  v := cur.version + 1;
  insert into public.history(version, data, note, published_at, published_by) values (cur.version, cur.data, cur.note, cur.published_at, cur.published_by);
  update public.published set version = v, data = old.data, note = 'rollback to ' || p_version, published_at = now(), published_by = auth.uid() where id = 1;
  return v;
end $$;

-- the first content, sent once by the owner from the site's own data files
create or replace function public.seed_content(p_data jsonb) returns integer
language plpgsql security definer set search_path = '' as $$
begin
  if private.my_role() is distinct from 'owner' then raise exception 'DOSEWAW: only the owner'; end if;
  if exists (select 1 from public.published) then raise exception 'DOSEWAW: content already exists'; end if;
  if not (p_data ? 'antibiotics' and p_data ? 'sources') or not private.clean_json(p_data) then raise exception 'DOSEWAW: invalid seed'; end if;
  insert into public.published(id, version, data, note, published_by) values (1, 1, p_data, 'seed', auth.uid());
  return 1;
end $$;

-- ---------- team (owner only) ----------
create or replace function public.invite_member(p_email text, p_role text default 'pharmacist', p_name text default '') returns void
language plpgsql security definer set search_path = '' as $$
begin
  if private.my_role() is distinct from 'owner' then raise exception 'DOSEWAW: only the owner invites'; end if;
  if p_role not in ('owner','pharmacist') or coalesce(p_name,'') ~ '[<>]' then raise exception 'DOSEWAW: invalid invitation'; end if;
  insert into private.invites(email, role, name, invited_by) values (lower(trim(p_email)), p_role, coalesce(p_name,''), auth.uid())
  on conflict (email) do update set role = excluded.role, name = excluded.name, invited_by = excluded.invited_by, used_at = null;
end $$;
create or replace function public.set_member_active(p_user uuid, p_active boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if private.my_role() is distinct from 'owner' then raise exception 'DOSEWAW: only the owner'; end if;
  if p_user = auth.uid() then raise exception 'DOSEWAW: the owner cannot stop their own account'; end if;
  update public.members set active = p_active where user_id = p_user;
end $$;
create or replace function public.pending_invites() returns table(email text, role text, name text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select i.email, i.role, i.name, i.created_at from private.invites i
   where i.used_at is null and private.my_role() = 'owner' order by i.created_at desc
$$;

-- ---------- grants: the browser may call only these functions; tables are read through row security ----------
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;                         -- row security policies call private.my_role()
grant execute on function private.my_role() to authenticated;
grant execute on function public.submit_change(text,text,jsonb,text), public.review_change(bigint,boolean,text),
  public.publish_site(text), public.rollback_to(integer), public.seed_content(jsonb),
  public.invite_member(text,text,text), public.set_member_active(uuid,boolean), public.pending_invites() to authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.published to anon, authenticated;
grant select on public.history, public.changes, public.members to authenticated;
revoke insert, update, delete on public.published, public.history, public.changes, public.members from anon, authenticated;

-- ---------- the owner's own invitation (run ONCE by the owner in the SQL editor, with his e-mail; not stored in the code) ----------
--   insert into private.invites(email, role, name) values (lower('YOUR-EMAIL'), 'owner', 'سيف الدين');
