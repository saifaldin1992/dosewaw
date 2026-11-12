/**
 * DOSEWAW edge worker (Cloudflare Workers).
 *
 * - Every normal file (index.html, css/, js/, brand/ …) is a static asset served by Cloudflare's edge; those
 *   requests never run this code and are free and unlimited.
 * - Only /data/*.json and /js/config.js run here (wrangler.jsonc "run_worker_first").
 *   /data/*.json come from the PUBLISHED bundle in Supabase (public.published, readable by anyone through row security).
 *   Each worker keeps one copy for CACHE_SECONDS; after that the copy is returned at once and refreshed in the
 *   background (one Supabase request at a time). Millions of visitors = a few Supabase requests per minute.
 * - If Supabase has nothing published yet, or is slow or down, the static files in data/ (built from content/) answer.
 * - /js/config.js tells the owner panel which Supabase project to use: previews use the TEST project, production LIVE.
 * - A daily cron request keeps both free Supabase projects from pausing after 7 idle days.
 * Settings: wrangler.jsonc "vars" (public values only: the anon key is meant to be public).
 */
const CACHE_SECONDS = 10;
const RETRY_SECONDS = 30;
const FILES = ['antibiotics.json', 'sources.json', 'brand.json', 'index.json'];
let memo = null;      // { version, files: {name: {body, etag}}, at }
let loading = null;
let failedAt = 0;

const base = env => env.SUPABASE_URL.replace(/\/$/, '');
const hdr = env => ({ apikey: env.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + env.SUPABASE_ANON_KEY });
async function etagOf(text) {
  const h = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return '"' + [...new Uint8Array(h)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('') + '"';
}

/** the published bundle → the files the site reads. Hidden drugs never reach visitors. */
async function build(row, request, env) {
  const d = row.data || {};
  const ab = (d.antibiotics || []).filter(x => x && !x.hidden);
  const src = (d.sources || []).filter(x => x && !x.hidden);
  // the vitamin calculators are code (js/rules/vitamins.js): their search entries come from the static index
  let vit = [];
  try { const r = await env.ASSETS.fetch(new URL('/data/index.json', request.url)); vit = (await r.json()).filter(x => x.g === 'vit'); } catch (e) {}
  const index = [...ab.map(x => ({ id: x.id, g: 'ab', n: x.n, c: x.cls || { ar: '', en: '' } })), ...vit];
  const out = { 'antibiotics.json': ab, 'sources.json': src, 'brand.json': Object.assign({ version: row.version }, d.brand || {}), 'index.json': index };
  const files = {};
  for (const name of FILES) { const body = JSON.stringify(out[name]); files[name] = { body, etag: await etagOf(body) }; }
  return { version: row.version, files, at: Date.now() };
}
async function load(request, env) {
  const r = await fetch(base(env) + '/rest/v1/published?id=eq.1&select=version,data', { headers: hdr(env), signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error('supabase ' + r.status);
  const rows = await r.json();
  if (!Array.isArray(rows) || !rows[0] || !rows[0].data || !Array.isArray(rows[0].data.antibiotics)) throw new Error('nothing published');
  memo = await build(rows[0], request, env);
  failedAt = 0;
  return memo;
}
function refresh(request, env) {
  if (!loading) loading = load(request, env).catch(e => { failedAt = Date.now(); console.error('refresh failed:', e.message); throw e; })
    .finally(() => { loading = null; });
  return loading;
}
function send(f, request) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, no-cache', ETag: f.etag, 'X-Content-Type-Options': 'nosniff' };
  if (request.headers.get('If-None-Match') === f.etag) return new Response(null, { status: 304, headers: h });
  return new Response(f.body, { headers: h });
}
async function data(name, request, env, ctx) {
  if (!FILES.includes(name) || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY.startsWith('PASTE')) return env.ASSETS.fetch(request);
  let entry = memo;
  if (!entry) {
    if (Date.now() - failedAt < RETRY_SECONDS * 1000) return env.ASSETS.fetch(request);
    try { entry = await refresh(request, env); } catch (e) { return env.ASSETS.fetch(request); } // static files until something is published
  } else if (Date.now() - entry.at > CACHE_SECONDS * 1000 && Date.now() - failedAt > RETRY_SECONDS * 1000) {
    ctx.waitUntil(refresh(request, env).catch(() => {}));
  }
  return send(entry.files[name], request);
}
function config(env) {
  const ok = env.SUPABASE_ANON_KEY && !env.SUPABASE_ANON_KEY.startsWith('PASTE');
  const body = 'window.DW_CFG=' + JSON.stringify(ok ? { url: env.SUPABASE_URL, anon: env.SUPABASE_ANON_KEY, test: !!env.IS_TEST } : null) + ';';
  return new Response(body, { headers: { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    if (url.pathname === '/js/config.js') return config(env);
    const m = url.pathname.match(/^\/data\/([a-z_]+\.json)$/);
    if (m) return data(m[1], request, env, ctx);
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx) {
    for (const [u, k] of [[env.SUPABASE_URL, env.SUPABASE_ANON_KEY], [env.TEST_SUPABASE_URL, env.TEST_SUPABASE_ANON_KEY]]) {
      if (u && k && !k.startsWith('PASTE')) ctx.waitUntil(fetch(u.replace(/\/$/, '') + '/rest/v1/published?id=eq.1&select=version', { headers: { apikey: k, Authorization: 'Bearer ' + k } }).catch(() => {}));
    }
  }
};
