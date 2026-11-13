-- DOSEWAW · 0003: «last review» on every published drug change, and error reports from visitors.
-- Apply on TEST after 0001 and 0002, on LIVE at release.

-- 1) a drug change, when published, records who approved it and when: {"rev": {"at": "YYYY-MM-DD", "by": {"ar","en"}}}
create or replace function private.apply_change(b jsonb, c public.changes) returns jsonb
language plpgsql stable set search_path = '' as $$
declare arr jsonb; i int; found boolean := false; data jsonb := c.data; who text;
begin
  if c.kind = 'brand' then return jsonb_set(b, '{brand}', coalesce(b->'brand','{}'::jsonb) || c.data); end if;
  if c.kind = 'drug' then
    select coalesce(nullif(m.name,''), m.email) into who from public.members m where m.user_id = coalesce(c.reviewed_by, c.author);
    data := data || jsonb_build_object('rev', jsonb_build_object('at', to_char(coalesce(c.reviewed_at, now()), 'YYYY-MM-DD'),
                                                                 'by', jsonb_build_object('ar', coalesce(who,''), 'en', coalesce(who,''))));
  end if;
  arr := coalesce(b->(case c.kind when 'drug' then 'antibiotics' else 'sources' end), '[]'::jsonb);
  for i in 0 .. jsonb_array_length(arr) - 1 loop
    if arr->i->>'id' = c.key then arr := jsonb_set(arr, array[i::text], (arr->i) || data); found := true; exit; end if;
  end loop;
  if not found then arr := arr || jsonb_build_array(jsonb_build_object('id', case when c.kind = 'source' then to_jsonb(c.key::int) else to_jsonb(c.key) end) || data); end if;
  return jsonb_set(b, array[case c.kind when 'drug' then 'antibiotics' else 'sources' end], arr);
end $$;
revoke all on function private.apply_change(jsonb, public.changes) from public, anon, authenticated;

-- 2) error reports: anyone may send a short note about a page; only the owner reads them
create table if not exists public.reports (
  id         bigint generated always as identity primary key,
  page       text not null check (page ~ '^[a-z]/[a-z0-9_]{1,40}$'),
  msg        text not null check (length(msg) between 5 and 500 and msg !~ '[<>]'),
  lang       text not null default 'ar' check (lang in ('ar','en')),
  status     text not null default 'new' check (status in ('new','done')),
  created_at timestamptz not null default now(),
  done_by    uuid,
  done_at    timestamptz
);
create index if not exists reports_created_idx on public.reports(created_at);
alter table public.reports enable row level security;
create policy "the owner reads reports" on public.reports for select to authenticated using (private.my_role() = 'owner');
revoke all on public.reports from anon, authenticated;
grant select on public.reports to authenticated;

-- the only way in: checked, short, and at most 60 reports in 10 minutes for the whole site (a flood stops itself)
create or replace function public.submit_report(p_page text, p_msg text, p_lang text default 'ar') returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.reports where created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'DOSEWAW: too many reports, try later';
  end if;
  insert into public.reports(page, msg, lang) values (p_page, trim(p_msg), case when p_lang = 'en' then 'en' else 'ar' end);
end $$;
create or replace function public.report_done(p_id bigint) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if private.my_role() is distinct from 'owner' then raise exception 'DOSEWAW: only the owner'; end if;
  update public.reports set status = 'done', done_by = auth.uid(), done_at = now() where id = p_id;
end $$;
revoke all on function public.submit_report(text,text,text), public.report_done(bigint) from public, anon, authenticated;
grant execute on function public.submit_report(text,text,text) to anon, authenticated;
grant execute on function public.report_done(bigint) to authenticated;
