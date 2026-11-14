// Edge worker: published bundle → data files, fallbacks, config. Run: node tests/worker_test.mjs
import worker from '../src/worker.js';
let fail = 0, ok = 0; const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL', m); } };
const staticIndex = [{ id: 'amox', g: 'ab', n: { ar: 'أ', en: 'A' }, c: {} }, { id: 'd', g: 'vit', n: { ar: 'د', en: 'D' }, c: {} }, { id: 'paracetamol', g: 'an', n: { ar: 'ب', en: 'P' }, c: {} }];
const staticSources = [{ id: 1, g: 'ab' }, { id: 127, g: 'an' }];
const ASSETS = { fetch: async (r) => { const u = new URL(r.url || r); return new Response(u.pathname === '/data/index.json' ? JSON.stringify(staticIndex) : u.pathname === '/data/sources.json' ? JSON.stringify(staticSources) : 'STATIC ' + u.pathname, { status: 200 }); } };
const ctx = { waitUntil() {} };
let calls = 0, mode = 'ok';
globalThis.fetch = async (url) => {
  calls++;
  if (mode === 'down') throw new Error('down');
  if (mode === 'empty') return new Response('[]', { status: 200 });
  return new Response(JSON.stringify([{ version: 7, data: { antibiotics: [{ id: 'amox', n: { ar: 'أموكسيسيلين', en: 'Amoxicillin' }, cls: { ar: 'ب', en: 'P' } }, { id: 'old', hidden: true, n: { ar: 'x', en: 'x' } }], sources: [{ id: 1 }], brand: { name: ['DOSE', 'WAW'] } } }]), { status: 200 });
};
const env = { SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'k', ASSETS };
const get = async (p, e = env, h = {}) => worker.fetch(new Request('https://dosewaw.test' + p, { headers: h }), e, ctx);
// no key yet → static files
let r = await get('/data/antibiotics.json', { ...env, SUPABASE_ANON_KEY: 'PASTE_LIVE_ANON_KEY' });
check((await r.text()) === 'STATIC /data/antibiotics.json', 'placeholder key: static file');
r = await get('/js/config.js', { ...env, SUPABASE_ANON_KEY: 'PASTE_X' });
check((await r.text()).includes('DW_CFG=null'), 'placeholder key: no panel config');
// published bundle
r = await get('/data/antibiotics.json'); const ab = await r.json();
check(ab.length === 1 && ab[0].id === 'amox', 'hidden drugs never reach visitors');
check(r.headers.get('Cache-Control') === 'public, no-cache' && r.headers.get('ETag'), 'revalidate with ETag');
const etag = r.headers.get('ETag');
r = await get('/data/antibiotics.json', env, { 'If-None-Match': etag }); check(r.status === 304, '304 when unchanged');
r = await get('/data/index.json'); const idx = await r.json();
check(idx.length === 3 && idx.some(x => x.g === 'vit') && idx.some(x => x.g === 'an') && idx[0].c.en === 'P', 'index = published antibiotics + vitamins + analgesics');
r = await get('/data/sources.json'); const so = await r.json(); check(so.length === 2 && so.find(x => x.id === 127).g === 'an' && so.find(x => x.id === 1).g === 'ab', 'sources = published + other groups, each with its group');
r = await get('/data/brand.json'); const br = await r.json(); check(br.version === 7 && br.name[1] === 'WAW', 'brand with version');
const before = calls; for (let i = 0; i < 50; i++) await get('/data/sources.json'); check(calls === before, '50 visitors, 0 extra Supabase requests');
r = await get('/data/other.json'); check((await r.text()) === 'STATIC /data/other.json', 'unknown data file: static');
r = await get('/index.html'); check((await r.text()) === 'STATIC /index.html', 'pages are static assets');
r = await get('/js/config.js', { ...env, IS_TEST: '1' }); const cfg = await r.text(); check(cfg.includes('"url":"https://x.supabase.co"') && cfg.includes('"test":true'), 'config for the panel');
r = await worker.fetch(new Request('https://dosewaw.test/data/sources.json', { method: 'POST' }), env, ctx); check(r.status === 405, 'only GET');
console.log(`worker: ${ok} ok, ${fail} failed`); process.exit(fail ? 1 : 0);
