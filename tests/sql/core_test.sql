-- DOSEWAW 0001 core: permission and flow checks (local PostgreSQL + tests/sql/supabase_shim.sql). Stops at the first failure.
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u uuid) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', coalesce(u::text,''), false); end $$;
create or replace function pg_temp.expect_error(q text, msg text) returns void language plpgsql as $$
begin begin execute q; exception when others then raise notice 'ok  refused: % -> %', msg, sqlerrm; return; end; raise exception 'FAIL not refused: %', msg; end $$;

-- invitation only
select pg_temp.expect_error($$insert into auth.users(email) values ('stranger@x.com')$$, 'sign-up without an invitation');
insert into private.invites(email, role, name) values ('owner@x.com', 'owner', 'Owner');
insert into auth.users(id, email) values ('00000000-0000-0000-0000-000000000001', 'Owner@X.com');
do $$ begin assert (select role from public.members where email = 'owner@x.com') = 'owner', 'owner became a member';
  assert (select email_confirmed_at is not null from auth.users where email = 'Owner@X.com'), 'invited e-mail confirmed'; end $$;

-- the owner seeds, invites a pharmacist
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-000000000001');
select public.seed_content('{"antibiotics":[{"id":"amox","n":{"ar":"أموكسيسيلين","en":"Amoxicillin"},"dose":{"ar":"قديم","en":"old"}}],"sources":[{"id":1,"title":"S1"}],"brand":{}}');
select pg_temp.expect_error($$select public.seed_content('{"antibiotics":[],"sources":[]}')$$, 'seeding twice');
select public.invite_member('Ph@X.com', 'pharmacist', 'Pharmacist One');
reset role;
insert into auth.users(id, email) values ('00000000-0000-0000-0000-000000000002', 'ph@x.com');
select pg_temp.expect_error($$insert into auth.users(email) values ('ph@x.com')$$, 'an invitation works only once');

-- a pharmacist: pending change, no publishing, no brand, no team management, no direct writes
set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-000000000002');
select public.submit_change('drug', 'amox', '{"dose":{"ar":"جديد","en":"new"}}', 'label 2026');
do $$ begin assert (select status from public.changes order by id desc limit 1) = 'pending', 'pharmacist change waits'; end $$;
select pg_temp.expect_error($$select public.publish_site('x')$$, 'pharmacist publishing');
select pg_temp.expect_error($$select public.review_change(1, true)$$, 'pharmacist approving');
select pg_temp.expect_error($$select public.submit_change('brand','brand','{"name":["A","B"]}')$$, 'pharmacist changing the brand');
select pg_temp.expect_error($$select public.invite_member('a@b.com')$$, 'pharmacist inviting');
select pg_temp.expect_error($$update public.published set data = '{}'$$, 'direct write to published');
select pg_temp.expect_error($$insert into public.changes(kind,key,data,status) values ('drug','amox','{}','approved')$$, 'direct insert of an approved change');
select pg_temp.expect_error($$select public.submit_change('drug','amox','{"dose":{"ar":"<script>","en":"x"}}')$$, 'text with < or >');
select pg_temp.expect_error($$select * from private.invites$$, 'reading the invitations');
do $$ begin assert (select count(*) from public.members) = 1, 'a pharmacist sees only himself'; end $$;

-- visitors read only the published content
reset role; set role anon; select pg_temp.as_user(null);
do $$ begin assert (select data->'antibiotics'->0->'dose'->>'en' from public.published) = 'old', 'visitor reads the published bundle'; end $$;
select pg_temp.expect_error($$select * from public.changes$$, 'visitor reading changes');
select pg_temp.expect_error($$select public.submit_change('drug','amox','{}')$$, 'visitor submitting');

-- the owner approves, changes the brand, publishes, rolls back
reset role; set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-000000000001');
select public.review_change((select max(id) from public.changes), true, 'checked against the label');
select pg_temp.expect_error($$select public.submit_change('brand','brand','{"colors":{"light":{"--primary":"red;}body{x"}}}')$$, 'brand colour that is not a colour');
select pg_temp.expect_error($$select public.submit_change('brand','brand','{"logo":"javascript:alert(1)"}')$$, 'brand logo that is not an image');
select public.submit_change('brand', 'brand', '{"name":["DOSE","WAW"],"colors":{"light":{"--primary":"#12305C","--highlight":"rgba(192,57,43,0.9)"}}}');
select public.submit_change('drug', 'cefix', '{"n":{"ar":"سيفيكسيم","en":"Cefixime"}}');
do $$ declare v int; begin v := public.publish_site('first edits'); assert v = 2, 'version 2'; end $$;
do $$ declare d jsonb := (select data from public.published); begin
  assert d->'antibiotics'->0->'dose'->>'en' = 'new', 'approved drug change published';
  assert d->'antibiotics'->0->'n'->>'en' = 'Amoxicillin', 'other fields kept';
  assert jsonb_array_length(d->'antibiotics') = 2, 'new drug added';
  assert d->'brand'->'colors'->'light'->>'--primary' = '#12305C', 'brand published';
  assert (select count(*) from public.changes where status = 'applied' and applied_in = 2) = 3, 'changes marked applied';
end $$;
do $$ declare v int; begin v := public.rollback_to(1); assert v = 3, 'rollback is a new version'; end $$;
do $$ begin assert (select data->'antibiotics'->0->'dose'->>'en' from public.published) = 'old', 'rollback restored version 1'; end $$;
select pg_temp.expect_error($$select public.set_member_active('00000000-0000-0000-0000-000000000001', false)$$, 'owner stopping their own account');
select public.set_member_active('00000000-0000-0000-0000-000000000002', false);
reset role; set role authenticated; select pg_temp.as_user('00000000-0000-0000-0000-000000000002');
select pg_temp.expect_error($$select public.submit_change('drug','amox','{}')$$, 'stopped pharmacist submitting');
reset role;
select 'ALL CORE CHECKS PASSED' as result;
