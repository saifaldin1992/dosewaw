/* DOSEWAW · service worker: the site works offline after the first visit.
   Pages and code: network first (updates show at once), cache when offline. Data files: the same, so a publish shows quickly. */
const CACHE='dosewaw-v1';
const CORE=['./','index.html','css/app.css','brand/theme.css','brand/brand.js','brand/logo.svg','js/i18n.js','js/engine.js','js/app.js','js/rules/antibiotics.js','js/rules/peds.js','js/rules/vitamins.js','data/index.json','data/antibiotics.json','data/sources.json','data/who_wfa.json','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const key=u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname; // ?v= is ignored in the cache key
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(key,c))}return r})
    .catch(()=>caches.match(key).then(r=>r||caches.match(u.pathname.replace(/^.*\//,''))||caches.match('index.html'))));
});
