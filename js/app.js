/* DOSEWAW · js/app.js — the pages: home and search, drug page (calculator + interactions + kidney + sources on one page),
   interaction checker, calculators, sources and method, menu. Plain script, no build step.
   Data: static files in data/ (published content). Rules: js/rules/*.js, loaded when a drug page first opens. */
'use strict';
const VERSION='1.0.0-phase1';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let LANG=(new URLSearchParams(location.search).get('lang'))||store.get('dw-lang','ar'); if(!['ar','en'].includes(LANG))LANG='ar';
const L=(ar,en)=>LANG==='en'?(en||ar):(ar||en);
const LT=o=>o?L(o.ar,o.en):'';
const T=(k,v)=>{let s=(I18N[k]||[k,k])[LANG==='en'?1:0];if(v)for(const n in v)s=s.split('{'+n+'}').join(v[n]);return s};
const num=n=>{const r=Math.round(n*10)/10;return r.toLocaleString('en-US',{maximumFractionDigits:1})};
/* Arabic-insensitive search: no diacritics or tatweel, one form of alef, ya and ta marbuta */
const normAr=s=>String(s||'').toLowerCase().replace(/[ً-ٰٟـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[–—\-]/g,' ').replace(/\s+/g,' ').trim();
/* spelling mistakes: the smallest number of edits that turns the query into any part of the name
   (letters left out, added, swapped or wrong). «amoxicilin», «اموكسلين» still find amoxicillin. */
function editIn(q,t){
  q=q.replace(/\s/g,'');t=t.replace(/\s/g,'');if(!q)return 0;
  let prev=new Array(t.length+1).fill(0),cur;
  for(let i=1;i<=q.length;i++){cur=[i];for(let j=1;j<=t.length;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(q[i-1]===t[j-1]?0:1));prev=cur}
  return Math.min(...prev);
}
const allowedEdits=n=>n<4?0:n<6?1:n<9?2:3;

/* ---------- groups (antibiotics and vitamins first; the three new groups come from official labels later) ---------- */
const ICON={
 ab:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="m9.2 7.7 5.6 8.6"/></svg>',
 an:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/><path d="M18 4v4M16 6h4"/></svg>',
 ah:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="m6.5 6.5 11 11"/><path d="M9 3.5c0 2 2 2 2 4M15 3.5c0 2 2 2 2 4"/></svg>',
 gi:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v4c0 2 2 2.5 4 2.5 3.5 0 6 2 6 5.5S16 21 12.5 21 7 19 7 16.5 9.5 13 11 13"/></svg>',
 vit:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z"/><path d="M10 14l2 3 2-3"/></svg>',
 inter:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h0"/></svg>',
 calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/></svg>',
 menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
 drug:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)"/></svg>',
 grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
 src:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7M8 11h7"/></svg>',
 search:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
};
const GROUPS=[{id:'ab',live:true},{id:'an',live:true},{id:'ah'},{id:'gi'},{id:'vit',live:true}];
const HREF=d=>(d.g==='vit'?'#/g/vit/v/':'#/g/'+(d.g==='an'?'an':'ab')+'/d/')+encodeURIComponent(d.id);
/* the screens of each group (its own «app»): antibiotics have a drug list by class; groups not ready show «soon» */
const GTABS={ab:['calc','inter','drugs','src'],an:['calc','inter','drugs','src'],vit:['calc','inter','src']};
let CURG=null;

/* ---------- data (static files; fetched once, kept in memory; the service worker keeps them offline) ---------- */
const CACHE={};
function getJSON(name){return CACHE[name]||(CACHE[name]=fetch('data/'+name+'?v='+VERSION).then(r=>{if(!r.ok)throw new Error(name);return r.json()}).catch(e=>{delete CACHE[name];throw e}))}
const SCRIPTS={};
function loadScript(src){return SCRIPTS[src]||(SCRIPTS[src]=new Promise((ok,no)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.onload=ok;s.onerror=()=>{delete SCRIPTS[src];no(new Error(src))};document.head.appendChild(s)}))}
const loadAB=()=>Promise.all([getJSON('antibiotics.json'),getJSON('sources.json'),getJSON('who_wfa.json'),loadScript('js/rules/antibiotics.js'),loadScript('js/rules/peds.js')]);
/* the data and rules of a drug group: [drugs, sources, WHO weights] (the analgesic rules extend the antibiotic rule table) */
const GDATA={ab:'antibiotics.json',an:'analgesics.json'};
function loadGroup(g){
  if(g!=='an')return loadAB();
  return Promise.all([getJSON('analgesics.json'),getJSON('sources.json'),getJSON('who_wfa.json'),
    loadScript('js/rules/antibiotics.js').then(()=>loadScript('js/rules/analgesics.js')),loadScript('js/rules/bands.js')]);
}

/* ---------- small helpers ---------- */
function toast(msg){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=msg;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),1600)}
async function copyText(text){try{await navigator.clipboard.writeText(text)}catch(e){const t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(e2){}t.remove()}toast(T('copied'))}
const recent=()=>store.get('dw-recent',[]), favs=()=>store.get('dw-favs',[]);
function pushRecent(id){store.set('dw-recent',[id,...recent().filter(x=>x!==id)].slice(0,6))}
function toggleFav(id){const f=favs();store.set('dw-favs',f.includes(id)?f.filter(x=>x!==id):[id,...f].slice(0,30))}
const sevRank={major:0,moderate:1,minor:2};

/* ---------- shell: header, language, theme, navigation ---------- */
function applyLang(){
  document.documentElement.lang=LANG;document.documentElement.dir=LANG==='ar'?'rtl':'ltr';
  const B=window.BRAND||{};drawBrand();document.title=(B.name||['DOSE','WAW']).join('')+' — '+LT(B.tagline);
  $('#hlang').textContent=LANG==='ar'?'EN':'ع';$('#hlang').setAttribute('aria-label',LANG==='ar'?'English':'العربية');
  setNav(CURG);
  $('#disc').textContent=T('disc');
}
function setLang(l){LANG=l;store.set('dw-lang',l);applyLang();route()}
function themeNow(){const t=document.documentElement.dataset.theme;return t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function setTheme(t){if(t==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t;store.set('dw-theme',t);$('#htheme').textContent=themeNow()==='dark'?'☀':'☾'}
const TABICON={calc:'calc',inter:'inter',drugs:'drug',src:'src'};
function setNav(g){
  CURG=g;
  const items=g&&GTABS[g]?[...GTABS[g].map(t=>['#/g/'+g+(t==='calc'?'':'/'+t),'tab_'+t,TABICON[t]]),['#/','nav_groups','grid']]
    :[['#/','nav_groups','grid'],['#/src','tab_src','src'],['#/menu','nav_menu','menu']];
  $('#topnav').innerHTML=items.map(([h,k])=>`<a href="${h}" data-nav="${h}">${esc(T(k))}</a>`).join('');
  $('#tabs').innerHTML=items.map(([h,k,i])=>`<a href="${h}" data-nav="${h}"><span class="pill">${ICON[i]}</span>${esc(T(k))}</a>`).join('');
  $('#tabs').style.gridTemplateColumns='repeat('+items.length+',1fr)';
}
function markNav(base){$$('[data-nav]').forEach(a=>{const on=a.dataset.nav===base;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}

/* ---------- router ---------- */
function route(){
  const h=location.hash.replace(/^#/,'')||'/';const p=h.split('/').filter(Boolean).map(decodeURIComponent);
  const view=p[0]||'';window.scrollTo(0,0);
  // older links (before the group screens) still work
  const old={d:'#/g/ab/d/',v:'#/g/vit/v/'};
  if(old[view]&&p[1]){location.replace(old[view]+encodeURIComponent(p[1]));return}
  if(view==='inter'){location.replace('#/g/ab/inter');return}
  if(view==='calc'){location.replace('#/');return}
  if(view==='g'&&p[1]){
    const g=GROUPS.find(x=>x.id===p[1])?p[1]:'ab';setNav(GTABS[g]?g:null);
    const tab=p[2]||'calc';markNav('#/g/'+g+(['inter','drugs','src'].includes(tab)?'/'+tab:''));
    if(!GTABS[g])return viewSoon(g);
    if(GDATA[g]&&tab==='d'&&p[3])return viewDrug(p[3],g);
    if(g==='vit'&&tab==='v'&&p[3])return viewVit(p[3]);
    if(tab==='inter')return GDATA[g]?viewInter(g):viewVitInter();
    if(tab==='src')return viewSources(p[3],g);
    if(tab==='drugs'&&GDATA[g])return viewDrugList(g);
    return viewGroupCalc(g);
  }
  setNav(null);markNav({src:'#/src',menu:'#/menu',admin:'#/menu'}[view]||'#/');
  if(view==='admin'){loading();return loadScript('js/admin.js').then(()=>adminBoot()).catch(failed)}
  if(view==='src')return viewSources(p[1]);
  if(view==='menu')return viewMenu();
  viewHome();
}
const app=()=>$('#app');
function loading(){app().innerHTML=`<p class="empty">${esc(T('loading'))}</p>`}
function failed(){app().innerHTML=`<p class="empty">${esc(T('load_err'))}</p>`}

/* ---------- search box (home and drug page) ---------- */
let INDEX=null;
function searchBox(q,group,chips){
  return `<section class="search" aria-label="${esc(T('search_lbl'))}">
    <label class="sbox">${ICON.search}<input id="q" type="search" value="${esc(q||'')}" placeholder="${esc(T('search_ph'))}" autocomplete="off" aria-label="${esc(T('search_lbl'))}" dir="auto">
    <button class="clr" type="button" id="qclr" aria-label="${esc(T('clear'))}">×</button></label>
    ${chips?`<div class="chips" role="group" aria-label="${esc(T('groups'))}">
      <button class="chip" data-g="" aria-pressed="${!group}">${esc(T('g_all'))}</button>
      ${GROUPS.map(g=>`<button class="chip${g.live?'':' soon'}" data-g="${g.id}" aria-pressed="${group===g.id}">${g.live?'<span class="dot"></span>':''}${esc(T('g_'+g.id))}${g.live?'':` <em>${esc(T('soon'))}</em>`}</button>`).join('')}
    </div>`:''}
    <div class="sres" id="sres" aria-live="polite"></div>
  </section>`;
}
let SG='';
function wireSearch(){
  const q=$('#q'),out=$('#sres');
  const run=()=>{
    const v=normAr(q.value);
    if(!v&&!SG){out.innerHTML='';return}
    if(SG&&!GROUPS.find(g=>g.id===SG).live){out.innerHTML=`<p class="none">${esc(T('soon_long'))}</p>`;return}
    const list=(INDEX||[]).filter(d=>!SG||d.g===SG).map(d=>{const n=normAr(d.n.ar+' '+d.n.en),c=normAr(d.c.ar+' '+d.c.en);
      let sc=!v?3:(normAr(d.n.ar).startsWith(v)||normAr(d.n.en).startsWith(v))?0:n.includes(v)?1:c.includes(v)?2:-1;
      if(sc<0&&v.length>=4){const e=Math.min(editIn(v,normAr(d.n.ar)),editIn(v,normAr(d.n.en)));if(e<=allowedEdits(v.length))sc=2.5+e/10}
      return [sc,d]}).filter(x=>x[0]>=0)
      .sort((a,b)=>a[0]-b[0]||LT(a[1].n).localeCompare(LT(b[1].n),LANG)).slice(0,v?12:200).map(x=>x[1]);
    out.innerHTML=list.length?list.map(d=>`<a href="${HREF(d)}"><b>${esc(LT(d.n))}</b>${LANG==='ar'?`<span class="en">${esc(d.n.en)}</span>`:''}<span class="c">${esc(SG?LT(d.c):T('g_'+d.g))}</span></a>`).join(''):`<p class="none">${esc(T('none_found'))}</p>`;
  };
  q.oninput=run;$('#qclr').onclick=()=>{q.value='';SG='';$$('[data-g]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g==='')));run();q.focus()};
  $$('[data-g]').forEach(b=>b.onclick=()=>{SG=b.dataset.g;$$('[data-g]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));run()});
  q.onkeydown=e=>{if(e.key==='Enter'){const a=out.querySelector('a');if(a)location.hash=a.getAttribute('href')}};
  run();
}

/* ---------- home: the groups first; each group opens its own screens ---------- */
async function viewHome(){
  SG='';
  try{INDEX=INDEX||await getJSON('index.json')}catch(e){return failed()}
  const chipsOf=ids=>ids.map(id=>{const d=INDEX.find(x=>x.id===id);return d?`<a class="chip" href="${HREF(d)}">${esc(LT(d.n))}</a>`:''}).join('');
  const count=g=>INDEX.filter(d=>d.g===g).length;
  app().innerHTML=`<div class="hero"><h1>${esc(T('pick_group'))}</h1><p>${esc(T('hero_s'))}</p></div>
  <div class="groups">${GROUPS.map(g=>`<a class="gcard${g.live?'':' soon'}" href="#/g/${g.id}"><span class="gi">${ICON[g.id]}</span><b>${esc(T('g_'+g.id))}</b><small>${g.live?esc(T(g.id==='vit'?'n_calcs':'n_drugs',{n:count(g.id)})):esc(T('soon'))}</small>${g.live?'':`<span class="soonb">${esc(T('soon'))}</span>`}</a>`).join('')}</div>
  ${favs().length?`<div class="sec-title">⭐ ${esc(T('favs'))}</div><div class="chips">${chipsOf(favs())}</div>`:''}
  ${recent().length?`<div class="sec-title">🕘 ${esc(T('recent'))}</div><div class="chips">${chipsOf(recent())}</div>`:''}
  <div class="sec-title">${esc(T('search_all'))}</div>
  ${searchBox('','',true)}`;
  wireSearch();
}
/* the title bar of a group screen: back to the groups, the group's name and the screen */
function groupHead(g,tab){
  return `<div class="ghead"><a class="gback" href="#/" aria-label="${esc(T('nav_groups'))}">‹</a><span class="dicon">${ICON[g]}</span><div><h1>${esc(T('g_'+g))}</h1>${tab?`<span class="gsub">${esc(T('tab_'+tab))}</span>`:''}</div></div>`;
}
async function viewSoon(g){
  app().innerHTML=groupHead(g)+`<section class="card"><p class="prose">${esc(T('soon_long'))}</p><a class="btn w100 mt12" href="#/">‹ ${esc(T('nav_groups'))}</a></section>`;
}
/* the calculator screen of a group: pick a drug (antibiotics) or a calculator (vitamins) */
async function viewGroupCalc(g){
  try{INDEX=INDEX||await getJSON('index.json')}catch(e){return failed()}
  SG=g;
  if(g==='vit'){
    const list=INDEX.filter(d=>d.g==='vit');
    app().innerHTML=groupHead(g,'calc')+`<p class="hint lead">${esc(T('vit_pick'))}</p><div class="groups">${list.map(d=>`<a class="gcard" href="${HREF(d)}"><span class="gi">${ICON.vit}</span><b>${esc(LT(d.n))}</b><small>${esc(LT(d.c))}</small></a>`).join('')}</div>`;
    return;
  }
  app().innerHTML=groupHead(g,'calc')+`<p class="hint lead">${esc(T('calc_pick'))}</p>${searchBox('',g)}`;
  wireSearch();$('#q').focus({preventScroll:true});
}
/* antibiotics by class, with the AWaRe group */
async function viewDrugList(g){
  loading();let ab;try{[ab]=await loadGroup(g)}catch(e){return failed()}
  const by={};for(const d of ab){const k=LT(d.cls);(by[k]=by[k]||[]).push(d)}
  const classes=Object.keys(by).sort((a,b)=>a.localeCompare(b,LANG));
  app().innerHTML=groupHead(g,'drugs')+`<section class="search"><label class="sbox">${ICON.search}<input id="dlq" type="search" placeholder="${esc(T('search_ph'))}" autocomplete="off" dir="auto" aria-label="${esc(T('search_lbl'))}"></label></section>
  <div id="dlist">${classes.map(k=>`<section class="card mt12" data-cls><h2><span class="ic">💊</span>${esc(k)}<span class="cnt">${by[k].length}</span></h2><div class="sres">${by[k].sort((a,b)=>LT(a.n).localeCompare(LT(b.n),LANG)).map(d=>`<a href="${HREF({g,id:d.id})}" data-n="${esc(normAr(d.n.ar+' '+d.n.en))}"><b>${esc(LT(d.n))}</b>${LANG==='ar'?`<span class="en">${esc(d.n.en)}</span>`:''}${d.aware?`<span class="c">AWaRe · ${esc(d.aware[0].toUpperCase()+d.aware.slice(1))}</span>`:''}</a>`).join('')}</div></section>`).join('')}</div>`;
  $('#dlq').oninput=()=>{const v=normAr($('#dlq').value);$$('#dlist [data-cls]').forEach(sec=>{let any=false;sec.querySelectorAll('a').forEach(a=>{const ok=!v||a.dataset.n.includes(v);a.hidden=!ok;any=any||ok});sec.hidden=!any})};
}
/* vitamin interactions, by nutrient */
async function viewVitInter(){
  loading();try{await loadScript('js/rules/vitamins.js');INDEX=INDEX||await getJSON('index.json')}catch(e){return failed()}
  const by={};for(const x of VIT.INTER)(by[x[0]]=by[x[0]]||[]).push(x);
  app().innerHTML=groupHead('vit','inter')+Object.entries(by).map(([k,list])=>`<section class="card mt12"><h2><span class="ic">⚠️</span>${esc(L(list[0][1][0],list[0][1][1]))}<span class="cnt">${list.length}</span></h2><div class="ilist">${list.map(x=>`<div class="inter"><div class="grow"><b>${esc(L(x[2][0],x[2][1]))}</b><p>${esc(L(x[3][0],x[3][1]))}${(x[4]||[]).map(n=>`<a class="ref" href="#/g/vit/src/v${n}">${n}</a>`).join('')}</p></div></div>`).join('')}</div></section>`).join('');
}

/* ---------- drug page ---------- */
/* the patient stays the same while the pharmacist moves between drugs (memory only, never stored) */
const PT={mode:'w',val:'',infant:false,age:'',sex:'',ht:'',scr:'',scrU:'mg',x:{},ind:{},every:{},conc:{}};
let D=null;
async function viewDrug(id,g){
  g=g||'ab';loading();
  let ab,src,who;
  try{[ab,src,who]=await loadGroup(g);INDEX=INDEX||await getJSON('index.json')}catch(e){return failed()}
  const d=ab.find(x=>x.id===id);if(!d){location.hash='#/';return}
  pushRecent(id);
  const rule=(typeof ABC_RULES!=='undefined'&&ABC_RULES[id])||null, peds=(g==='ab'&&typeof PEDS!=='undefined'&&PEDS[id])||null;
  const band=(g==='an'&&typeof BANDS!=='undefined'&&BANDS[id])||null;
  const doc=band&&band.segs.find(x=>x.kind==='doctor');
  D={d,rule,peds,band,src,who,g};
  const fav=favs().includes(id);
  const renal=rule&&!rule.noRenal;
  const kidOpen=!!(PT.scr||PT.ht);
  SG=g;
  app().innerHTML=`${groupHead(g)}${searchBox('',g)}
  <div class="dhead">
    <div class="dicon" aria-hidden="true">${ICON[g]}</div>
    <div><h1>${esc(LT(d.n))}${LANG==='ar'?` <span class="en">${esc(d.n.en)}</span>`:''}</h1>
      <div class="tags"><span class="tag">${esc(LT(d.cls))}</span>${d.aware?`<span class="tag access">AWaRe · ${esc(d.aware[0].toUpperCase()+d.aware.slice(1))}</span>`:''}</div>${revLine(d,src)}</div>
    <button class="star" type="button" id="fav" aria-pressed="${fav}" aria-label="${esc(T(fav?'fav_rm':'fav_add'))}">${fav?'★':'☆'}</button>
  </div>
  <div class="grid">
    <div class="calc-col">
      <section class="card" aria-labelledby="pt">
        <h2 id="pt"><span class="ic">👤</span>${esc(T('patient'))}</h2>
        <div class="seg" role="group" aria-label="${esc(T('patient'))}">${['w','y','m'].map(m=>`<button type="button" data-mode="${m}" aria-pressed="${PT.mode===m}">${esc(T('m_'+m))}</button>`).join('')}</div>
        <label class="numin"><input id="val" inputmode="decimal" autocomplete="off" value="${esc(PT.val)}" aria-label="${esc(T('v_lbl'))}" placeholder="0"><span id="unit"></span></label>
        <div class="est" id="est" hidden></div>
        ${(peds&&peds.infant)||doc?`<label class="check" id="infwrap"><input type="checkbox" id="inf"${PT.infant?' checked':''}> ${esc(doc?T('infant_m',{m:doc.ageM[1]}):T('infant'))}</label>`:''}
        ${renal?`<details class="kid" id="kid"${kidOpen?' open':''}><summary>🫘 ${esc(T('kid_t'))} <span class="kv">· ${esc(T('kid_s'))}</span></summary>
          <div class="kgrid">
            <div class="fld"><label for="kage">${esc(T('age_y'))}</label><input id="kage" inputmode="decimal" value="${esc(PT.age)}"></div>
            <div class="fld"><label for="ksex">${esc(T('sex'))}</label><select id="ksex"><option value="">—</option><option value="m"${PT.sex==='m'?' selected':''}>${esc(T('sex_m'))}</option><option value="f"${PT.sex==='f'?' selected':''}>${esc(T('sex_f'))}</option></select></div>
            <div class="fld"><label for="kht">${esc(T('height'))}</label><input id="kht" inputmode="decimal" value="${esc(PT.ht)}"></div>
            <div class="fld"><label for="kscr">${esc(T('scr'))}</label><div class="unitrow"><input id="kscr" inputmode="decimal" value="${esc(PT.scr)}"><select id="kscru" aria-label="unit"><option value="mg"${PT.scrU==='mg'?' selected':''}>mg/dL</option><option value="um"${PT.scrU==='um'?' selected':''}>µmol/L</option></select></div></div>
          </div></details>`:''}
      </section>
      <section class="card result" aria-live="polite" id="result"></section>
      <section class="card" id="opts" hidden></section>
    </div>
    <div class="info" id="info"></div>
  </div>${reportBtn()}`;
  wireSearch();
  $('#fav').onclick=()=>{toggleFav(id);const on=favs().includes(id);$('#fav').textContent=on?'★':'☆';$('#fav').setAttribute('aria-pressed',on);$('#fav').setAttribute('aria-label',T(on?'fav_rm':'fav_add'))};
  $$('[data-mode]').forEach(b=>b.onclick=()=>{PT.mode=b.dataset.mode;$$('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));PT.val='';$('#val').value='';calc();$('#val').focus()});
  const bind=(sel,key,ev='input')=>{const e=$(sel);if(e)e.addEventListener(ev,()=>{PT[key]=e.type==='checkbox'?e.checked:e.value;calc()})};
  bind('#val','val');bind('#inf','infant','change');bind('#kage','age');bind('#ksex','sex','change');bind('#kht','ht');bind('#kscr','scr');bind('#kscru','scrU','change');
  drawInfo();calc();wireReport('d/'+id);
}

/* the patient as numbers. W = actual or estimated weight; months = age in months when entered by age */
function patient(){
  const v=parseFloat(String(PT.val).replace(',','.'));
  let W=null,months=null,est=false,ageY=null;
  if(v>0){if(PT.mode==='w')W=v;else{months=PT.mode==='y'?v*12:v;ageY=months/12;W=wfaWeight(D.who,months,PT.sex);est=W!=null}}
  const kage=parseFloat(PT.age);if(kage>=0&&PT.age!=='')ageY=kage;
  const ht=parseFloat(PT.ht)||null;let scr=parseFloat(String(PT.scr).replace(',','.'))||null;if(scr&&PT.scrU==='um')scr=scr/88.4;
  const infant=PT.mode==='w'?!!PT.infant:(months!=null&&months<3);
  return {W,months,est,ageY,ht,scr,sex:PT.sex,infant,v};
}
function calc(){
  const {d,rule,peds}=D,P=patient(),R=$('#result');
  $('#unit').textContent=T(PT.mode==='w'?'u_kg':PT.mode==='y'?'u_y':'u_m');
  const est=$('#est'),iw=$('#infwrap');if(iw)iw.hidden=PT.mode!=='w'||(peds?P.W>=peds.adultKg:P.W*LB>=24);
  est.hidden=PT.mode==='w'||!(P.v>0);
  if(!est.hidden)est.textContent=P.W?T('est',{w:num(P.W)}):T('est_out');
  const child=peds&&P.W&&(P.W<peds.adultKg||P.infant);
  if(child)return pedsResult(P);
  // analgesics: a child by age under 12 years, or by weight under 96 lb when no adult age is given
  if(D.band&&(P.months!=null?P.months<144:(P.W&&P.W*LB<96&&!(P.ageY>=12))||P.infant))return bandResult(P);
  if(!rule){R.innerHTML=`<div class="rbody"><p class="hint">${esc(LT(d.dose))}</p></div>`;$('#opts').hidden=true;return}
  adultResult(P);
}
function srcLine(ids,label,ref){
  const s=(ids||[]).map(i=>D.src.find(x=>x.id===i)).filter(Boolean)[0];
  return `<p class="src">${esc(T('by_src'))} ${s?`<a href="#" data-ref="${s.id}">${esc(s.title)} [${s.id}]</a>`:''}${label?' · '+esc(label):''}${ref?' · '+esc(T('label_v',{r:ref})):''}</p>`;
}
function actions(card){return `${card?`<button class="btn pri w100 mt12" type="button" id="bcard">🪪 ${esc(T('pcard'))}</button>`:''}<div class="acts"><button class="btn${card?'':' pri'}" type="button" id="bcopy">${esc(T('copy'))}</button><button class="btn" type="button" id="bprint">${esc(T('print'))}</button><button class="btn" type="button" id="bshare">${esc(T('share'))}</button></div>`}
function wireActions(){
  const head=()=>LT(D.d.n)+' · '+new Date().toISOString().slice(0,10)+' · DOSEWAW';
  const body=()=>head()+'\n\n'+$('#result').innerText.replace(new RegExp(T('copy')+'|'+T('print')+'|'+T('share')+'|🪪 '+T('pcard'),'g'),'').replace(/\n{3,}/g,'\n\n').trim();
  $('#bcopy').onclick=()=>copyText(body());$('#bprint').onclick=()=>window.print();
  $('#bshare').onclick=async()=>{if(navigator.share){try{await navigator.share({title:head(),text:body()})}catch(e){}}else copyText(body())};
}
function pedsResult(P){
  const {peds}=D,R=$('#result');
  const s={ind:PT.ind[D.d.id]||peds.def,every:PT.every[D.d.id]||peds.freq[0]};
  const r=pedsCalc(peds,P,s);
  const best=easiest(r.ml);
  const warn=r.notes.map(n=>n.k==='infant'?`<div class="warn">${esc(T('infant_w',{m:n.v.mgkgday,h:n.v.every,r:n.v.ref}))}</div>`:`<div class="warn red">${esc(T('cap_w',{m:n.v}))}</div>`).join('');
  const table=r.ml.length?`<table class="ml"><tr><th>${esc(T('susp'))}</th><th class="ta-e">${esc(T('per_dose'))}</th></tr>${r.ml.map(x=>`<tr class="${x.c===best?'best':''}"><td><span class="num">${x.c} mg / 5 mL</span>${x.c===best?` <small class="easy">· ${esc(T('easiest'))}</small>`:''}</td><td class="v">${num(mlRound(x.ml))} <small>${esc(T('ml'))}</small></td></tr>`).join('')}</table>`:'';
  R.innerHTML=`<div class="rhead"><div class="k"><span>${esc(T('result'))}</span><span>${num(P.W)} ${esc(T('u_kg'))}${P.est?' ≈':''}</span></div>
    <div class="big">${num(r.mg)} <small>${esc(T('mg'))}</small></div>
    <div class="sub">${esc(T('every',{h:r.every}))} · ${esc(T('per_day',{m:r.mgkgday,n:24/r.every}))}</div></div>
    <div class="rbody">${table}${warn}
    <div class="facts"><div class="fact"><b>${esc(T('daily'))}</b><span class="num">${num(r.daily)} mg</span></div><div class="fact"><b>${esc(T('duration'))}</b><span>${esc(LT(peds.duration))}</span></div></div>
    ${peds.recon&&r.ml.length?reconHTML(peds,best):''}
    ${srcLine(peds.srcIds,'',r.ref)}${actions(true)}</div>`;
  wireActions();
  $('#bcard').onclick=()=>patientCard({kind:'peds',r,best});
  const O=$('#opts');O.hidden=false;
  O.innerHTML=`<div class="lbl first">${esc(T('ind'))}</div><div class="opts" role="group" aria-label="${esc(T('ind'))}">${peds.inds.map(i=>`<button type="button" class="opt" data-ind="${i.id}" aria-pressed="${i.id===s.ind}"><i></i>${esc(LT(i.n))}</button>`).join('')}</div>
    ${P.infant?'':`<div class="lbl">${esc(T('freq'))}</div><div class="seg two" role="group" aria-label="${esc(T('freq'))}">${peds.freq.map(f=>`<button type="button" data-every="${f}" aria-pressed="${f===s.every}">${esc(T('every',{h:f}))}</button>`).join('')}</div>`}`;
  $$('[data-ind]').forEach(b=>b.onclick=()=>{PT.ind[D.d.id]=b.dataset.ind;calc()});
  $$('[data-every]').forEach(b=>b.onclick=()=>{PT.every[D.d.id]=+b.dataset.every;calc()});
}
function adultResult(P){
  const {d,rule,peds}=D,R=$('#result'),O=$('#opts');
  // drug-specific questions (severity, dialysis…), answers kept per drug
  const x=PT.x[d.id]||(PT.x[d.id]={});
  rule.inputs.forEach(f=>{if(!(f.id in x))x[f.id]=f.type==='select'?f.options[0][0]:false});
  const W=P.W?abWeights(P.sex,P.W,P.ht):null;
  const cg=rule.noRenal?null:abCrCl(P.ageY,P.sex,P.W,P.ht,P.scr);
  const egfr=rule.egfr&&P.ageY>0&&P.sex&&P.scr?abEgfr(P.ageY,P.sex,P.scr):null;
  const ctx={cr:cg?cg.crcl:null,age:P.ageY,wt:P.W,W,scr:P.scr,egfr};
  const r=abEval(rule,x,ctx,{kidney:!!(cg||egfr),age:P.ageY!=null,weight:!!W});
  const kidsWarn=(P.ageY!=null&&P.ageY<18||(P.W&&P.W<40))&&!rule.peds&&!peds;
  const main=r.rows.find(rw=>rw.strong&&rw.v)||r.rows.find(rw=>rw.v&&!rw.warn);
  const rowsH=r.rows.filter(rw=>rw!==main).map(rw=>rw.need?`<div class="rrow need"><b>${esc(LT(rw.k))}</b>${esc(T('need_'+rw.need[0]))}</div>`:`<div class="rrow${rw.warn?' warn':''}"><b>${esc(LT(rw.k))}</b>${esc(LT(rw.v))}</div>`).join('');
  const crH=cg?`<p class="hint">${esc(T('crcl',{v:cg.crcl.toFixed(0),b:T(cg.obese?'w_adj':'w_act'),w:cg.weight.toFixed(0)}))} · ${esc(ABC_SRC.cg)}</p>`:'';
  const egH=egfr?`<p class="hint">${esc(T('egfr',{v:egfr.toFixed(0)}))}</p>`:'';
  R.innerHTML=`<div class="rhead"><div class="k"><span>${esc(T('result'))}${main?' · '+esc(LT(main.k)):''}</span><span>${P.W?num(P.W)+' '+esc(T('u_kg'))+(P.est?' ≈':''):''}</span></div>
    <div class="bigtxt">${main?esc(LT(main.v)):'—'}</div></div>
    <div class="rbody">${kidsWarn?`<div class="warn">${esc(rule.kids?LT(rule.kids):T('kids_adult_calc',{r:rule.pedsRef?' ('+rule.pedsRef+')':''}))}</div>`:''}
    <div class="rrows">${rowsH}</div>${crH}${egH}<p class="hint">${esc(LT(r.notes))}</p>${srcLine(rule.srcIds,rule.label)}${actions(!!main)}</div>`;
  wireActions();
  if(main)$('#bcard').onclick=()=>patientCard({kind:'adult',text:main.v});
  if(!rule.inputs.length){O.hidden=true;O.innerHTML='';return}
  O.hidden=false;
  O.innerHTML=`<div class="lbl first">${esc(T('options'))}</div><div class="fields">${rule.inputs.map(f=>f.type==='select'
    ?`<div class="fld"><label for="ab_${f.id}">${esc(LT(f.label))}</label><select id="ab_${f.id}">${f.options.map(o=>`<option value="${esc(o[0])}"${x[f.id]===o[0]?' selected':''}>${esc(LT(o[1]))}</option>`).join('')}</select></div>`
    :`<label class="chk"><input type="checkbox" id="ab_${f.id}"${x[f.id]?' checked':''}><span>${esc(LT(f.label))}</span></label>`).join('')}</div>`;
  rule.inputs.forEach(f=>{const e=$('#ab_'+f.id);e.onchange=()=>{x[f.id]=f.type==='select'?e.value:e.checked;calc()}});
}

/* children of the analgesics group: the label chart (by age or weight) or mg per kg (WHO / prescription label) */
function bandResult(P){
  const {d,band}=D,R=$('#result'),O=$('#opts');
  const x=PT.x[d.id+'_kid']||(PT.x[d.id+'_kid']={why:'fever',hot:false});
  const extra=(PT.conc[d.id]||[]);
  const r=bandCalc(band,P,x,extra);
  const head=(big,sub)=>`<div class="rhead"><div class="k"><span>${esc(T('result'))}</span><span>${P.W?num(P.W)+' '+esc(T('u_kg'))+(P.est?' ≈':''):''}</span></div>${big}${sub?`<div class="sub">${sub}</div>`:''}</div>`;
  O.hidden=true;O.innerHTML='';
  if(!r){R.innerHTML=`<div class="empty">${esc(T('enter_w'))}</div>`;return}
  if(r.kind==='doctor'){R.innerHTML=head(`<div class="bigtxt">${esc(T('see_doc'))}</div>`)+`<div class="rbody"><div class="warn red">${esc(LT(r.seg.msg))}</div>${srcLine([r.seg.ref])}</div>`;return}
  if(r.kind==='adult'){R.innerHTML=head(`<div class="bigtxt">${esc(LT(r.seg.text))}</div>`,esc(T('adult12')))+`<div class="rbody">${srcLine([r.seg.ref])}${actions(false)}</div>`;wireActions();return}
  if(r.kind==='needW'){R.innerHTML=`<div class="empty">${esc(T('need_weight'))}</div>`;return}
  const best=easiest(r.ml),ev=r.everyH[0]===r.everyH[1]?T('every',{h:r.everyH[0]}):T('every_r',{a:r.everyH[0],b:r.everyH[1]});
  const lim=r.maxDoses?T('max_doses',{n:r.maxDoses}):r.maxDay?T('max_day',{m:num(r.maxDay)}):'';
  const why=r.kind==='chart'?T(r.by==='age'?'by_age_chart':'by_wt_chart',{a:r.row.age[0]===r.row.age[1]?r.row.age[0]:r.row.age[0]+'–'+r.row.age[1],l:r.row.lb[0]+'–'+r.row.lb[1],k:num(r.row.lb[0]/LB)+'–'+num((r.row.lb[1]+1)/LB)})
    :T('by_mgkg',{m:r.mgkg});
  const warns=[];
  if(r.kind==='mgkg'&&r.seg.note)warns.push(`<div class="warn">${esc(LT(r.seg.note))}</div>`);
  if(r.capped)warns.push(`<div class="warn red">${esc(T('cap_mg',{m:r.seg.maxMg}))}</div>`);
  // weight only and under the chart: the youngest age rule cannot be checked, so it is said
  const doc=band.segs.find(s2=>s2.kind==='doctor');
  if(PT.mode==='w'&&r.kind==='mgkg'&&doc)warns.push(`<div class="warn">${esc(T('if_younger',{m:doc.ageM[1]}))} ${esc(LT(doc.msg))}</div>`);
  if(r.kind==='chart'&&PT.mode==='w')warns.push(`<p class="hint">${esc(T('adult_use_age'))}</p>`);
  const table=`<table class="ml"><tr><th>${esc(T('susp'))}</th><th class="ta-e">${esc(T('per_dose'))}</th></tr>${r.ml.map(q=>`<tr class="${q.c===best?'best':''}"><td><span class="num">${q.c} mg / 5 mL</span>${q.c===best?` <small class="easy">· ${esc(T('easiest'))}</small>`:''}${band.strengths.some(s2=>s2.c===q.c)?'':` <small class="hint">· ${esc(T('your_conc'))}</small>`}</td><td class="v">${num(mlRound(q.ml))} <small>${esc(T('ml'))}</small></td></tr>`).join('')}</table>
    <div class="conc mt8"><input id="conc" inputmode="decimal" placeholder="${esc(T('conc_ph'))}" aria-label="${esc(T('conc_ph'))}"><span>mg / 5 mL</span><button class="btn" type="button" id="concadd">${esc(T('conc_add'))}</button></div>`;
  R.innerHTML=head(`<div class="big">${num(r.mg)} <small>${esc(T('mg'))}</small></div>`,`${esc(ev)}${lim?' · '+esc(lim):''}`)+
    `<div class="rbody">${table}${warns.join('')}<p class="hint">${esc(why)}</p>
    <div class="facts"><div class="fact"><b>${esc(T('duration'))}</b><span>${esc(LT(band.duration))}</span></div><div class="fact"><b>${esc(T('pc_when'))}</b><span>${esc(ev)}</span></div></div>
    ${srcLine([r.seg.ref])}${actions(true)}</div>`;
  wireActions();
  $('#bcard').onclick=()=>patientCard({kind:'peds',r:{ml:r.ml,every:r.everyH[0],everyH:r.everyH,maxDoses:r.maxDoses},best});
  $('#concadd').onclick=()=>{const c=parseFloat(String($('#conc').value).replace(',','.'));if(!(c>0&&c<=1000))return;PT.conc[d.id]=[...new Set([...extra,c])];calc()};
  // ibuprofen under 2 years: the dose depends on fever or pain, and on the temperature
  if(r.kind==='mgkg'&&band.opts){
    O.hidden=false;
    O.innerHTML=`<div class="lbl first">${esc(T('why'))}</div><div class="seg two">${band.opts[0].options.map(o=>`<button type="button" data-why="${o[0]}" aria-pressed="${x.why===o[0]}">${esc(LT(o[1]))}</button>`).join('')}</div>
      ${x.why==='fever'?`<label class="chk"><input type="checkbox" id="hot"${x.hot?' checked':''}><span>${esc(LT(band.opts[1].label))}</span></label>`:''}`;
    $$('[data-why]').forEach(b=>b.onclick=()=>{x.why=b.dataset.why;calc()});
    const h=$('#hot');if(h)h.onchange=()=>{x.hot=h.checked;calc()};
  }
}

/* how much water to add, per bottle size, for the suspension strengths in the label */
function reconHTML(peds,best){
  const rows=peds.recon.rows,sizes=(rows[best]||Object.values(rows)[0]).map(x=>x[0]);
  return `<details class="recon mt10"${PT.reconOpen?' open':''}><summary>💧 ${esc(T('recon'))}</summary>
    <table class="ml"><tr><th>${esc(T('susp'))}</th>${sizes.map(v=>`<th class="ta-e">${esc(T('bottle',{v}))}</th>`).join('')}</tr>
    ${Object.entries(rows).map(([c,list])=>`<tr class="${+c===best?'best':''}"><td><span class="num">${c} mg / 5 mL</span></td>${list.map(x=>`<td class="v">${x[1]} <small>${esc(T('ml'))}</small></td>`).join('')}</tr>`).join('')}</table>
    <p class="hint">${esc(LT(peds.recon.how))} (${esc(T('label_v',{r:peds.recon.ref}))})</p></details>`;
}
document.addEventListener('toggle',e=>{if(e.target.classList&&e.target.classList.contains('recon'))PT.reconOpen=e.target.open},true);

/* ---------- patient card: plain words for the patient, in Arabic or English, to print or send ---------- */
let CARDL=null;
function patientCard(o){
  const {d}=D,peds=D.peds||D.band;CARDL=CARDL||LANG;
  const CT=o2=>o2?(CARDL==='en'?o2.en:o2.ar):'';
  const tk=(k,v)=>{let s2=(I18N[k]||[k,k])[CARDL==='en'?1:0];if(v)for(const n in v)s2=s2.split('{'+n+'}').join(v[n]);return s2};
  let pick=o.best,lines=[],tips=[];
  const draw=()=>{
    if(o.kind==='peds'){const x=o.r.ml.find(m=>m.c===pick)||o.r.ml[0];
      lines=[[tk('pc_med'),`${CT(d.n)} · ${tk('pc_susp')} ${x.c} mg / 5 mL`],[tk('pc_dose'),`${num(mlRound(x.ml))} ${tk('ml')}`],
        [tk('pc_when'),o.r.everyH&&o.r.everyH[0]!==o.r.everyH[1]?tk('pc_every_r',{a:o.r.everyH[0],b:o.r.everyH[1]}):tk('pc_every',{h:o.r.every,n:24/o.r.every})],
        ...(o.r.maxDoses?[[tk('pc_limit'),tk('max_doses',{n:o.r.maxDoses})]]:[]),[tk('duration'),CT(peds.duration)]];
      tips=peds.patient?peds.patient.map(CT):[];
    }else{lines=[[tk('pc_med'),CT(d.n)],[tk('pc_dose'),CT(o.text)]];tips=[];
      const t=CT(d.timing).split(/[.؛]/)[0].trim();if(t&&!/label|ملصق|نشرة/i.test(t))lines.push([tk('pc_how'),t]);}
    $('#pcard').innerHTML=`<div class="pcard" dir="${CARDL==='en'?'ltr':'rtl'}" lang="${CARDL}">
      <div class="pc-h"><b>${esc((window.BRAND&&window.BRAND.name||['DOSE','WAW']).join(''))}</b><span>${new Date().toISOString().slice(0,10)}</span></div>
      <dl>${lines.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${tips.length?`<ul>${tips.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}
      <p class="pc-f">${esc(tk(D.g==='ab'?'pc_foot':'pc_foot2'))}</p></div>
    ${o.kind==='peds'&&o.r.ml.length>1?`<div class="lbl">${esc(T('susp'))}</div><div class="seg two">${o.r.ml.map(m=>`<button type="button" data-pk="${m.c}" aria-pressed="${m.c===pick}">${m.c} mg / 5 mL</button>`).join('')}</div>`:''}
    <div class="lbl">${esc(T('pc_lang'))}</div><div class="seg two"><button type="button" data-cl="ar" aria-pressed="${CARDL==='ar'}">العربية</button><button type="button" data-cl="en" aria-pressed="${CARDL==='en'}">English</button></div>
    <div class="acts"><button class="btn pri" type="button" id="pcprint">${esc(T('print'))}</button><button class="btn" type="button" id="pcshare">${esc(T('share'))}</button><button class="btn" type="button" id="pcclose">${esc(T('close'))}</button></div>`;
    $$('[data-pk]').forEach(b=>b.onclick=()=>{pick=+b.dataset.pk;draw()});
    $$('[data-cl]').forEach(b=>b.onclick=()=>{CARDL=b.dataset.cl;draw()});
    const text=()=>lines.map(([k,v])=>k+': '+v).concat(tips.map(t=>'• '+t)).join('\n');
    $('#pcprint').onclick=()=>{document.body.classList.add('printcard');const done=()=>{document.body.classList.remove('printcard');removeEventListener('afterprint',done)};addEventListener('afterprint',done);window.print();setTimeout(done,1500)};
    $('#pcshare').onclick=async()=>{if(navigator.share){try{await navigator.share({title:CT(d.n),text:text()})}catch(e){}}else copyText(text())};
    $('#pcclose').onclick=closeSheet;
  };
  openSheet('pcard',T('pcard'));draw();
}
/* a floating window above the page (patient card, error report) */
function openSheet(id,title){
  closeSheet();const s=document.createElement('div');s.className='sheet';s.id='sheet';s.setAttribute('role','dialog');s.setAttribute('aria-modal','true');s.setAttribute('aria-label',title);
  s.innerHTML=`<div class="sheet-in"><div class="sheet-h"><b>${esc(title)}</b><button type="button" class="ib2" id="sheetx" aria-label="${esc(T('close'))}">×</button></div><div id="${id}"></div></div>`;
  document.body.appendChild(s);$('#sheetx').onclick=closeSheet;s.addEventListener('click',e=>{if(e.target===s)closeSheet()});
  document.addEventListener('keydown',escClose);
}
function escClose(e){if(e.key==='Escape')closeSheet()}
function closeSheet(){const s=$('#sheet');if(s)s.parentNode.removeChild(s);document.removeEventListener('keydown',escClose)}


/* «last review» line: the pharmacist review recorded with the drug, and the date of its official label */
function revLine(d,src){
  const lab=(d.src||[]).map(i=>src.find(x=>x.id===i)).find(x=>x&&x.kind==='d'),m=lab&&String(lab.org).match(/\d{4}-\d{2}-\d{2}/);
  if(!d.rev&&!m)return '';
  return `<div class="revline">${d.rev?`<span>✔ ${esc(T('rev'))}: <b>${esc(d.rev.at)}</b> · ${esc(LT(d.rev.by))}</span>`:''}${m?`<span>${esc(T('label_date'))}: <bdi>${esc(m[0])}</bdi></span>`:''}</div>`;
}

/* ---------- report an error: a short note to the owner (public function submit_report, limited in the database) ---------- */
const reportBtn=()=>window.DW_CFG?`<button type="button" class="report-btn" id="brep">⚑ ${esc(T('report'))}</button>`:'';
function wireReport(page){
  const b=$('#brep');if(!b)return;
  b.onclick=()=>{openSheet('rep',T('report_t'));
    $('#rep').innerHTML=`<p class="hint m0 mb10">${esc(T('report_p'))}</p><textarea id="rept" class="ta" rows="4" maxlength="500"></textarea>
      <div class="acts two"><button class="btn pri" type="button" id="reps">${esc(T('report_send'))}</button><button class="btn" type="button" id="repc">${esc(T('close'))}</button></div><p class="hint" id="repm" role="status"></p>`;
    $('#repc').onclick=closeSheet;
    $('#reps').onclick=async()=>{const msg=$('#rept').value.trim();if(msg.length<5||/[<>]/.test(msg))return $('#repm').textContent=T('report_short');
      $('#reps').disabled=true;
      try{const C=window.DW_CFG,r=await fetch(C.url+'/rest/v1/rpc/submit_report',{method:'POST',headers:{apikey:C.anon,'Content-Type':'application/json'},body:JSON.stringify({p_page:page,p_msg:msg,p_lang:LANG})});
        if(!r.ok)throw new Error(r.status);$('#rep').innerHTML=`<p class="prose">${esc(T('report_ok'))}</p><button class="btn w100" type="button" id="repc2">${esc(T('close'))}</button>`;$('#repc2').onclick=closeSheet}
      catch(e){$('#repm').textContent=T('report_err');$('#reps').disabled=false}};
    $('#rept').focus()};
}

/* the information part of the drug page: interactions, kidney, dose per label, dispensing, uses, sources */
function refChips(ids){return (ids||[]).map(i=>`<a class="ref" href="#" data-ref="${i}">${i}</a>`).join('')}
function drawInfo(){
  const {d,rule,peds,src}=D;
  const inter=[...(d.inter||[])].sort((a,b)=>(sevRank[a.sev]??3)-(sevRank[b.sev]??3));
  const ids=[...new Set([...(peds?peds.srcIds:[]),...(rule?rule.srcIds:[]),...(d.src||[]),...inter.flatMap(i=>i.r||[])])];
  const S=ids.map(i=>src.find(s=>s.id===i)).filter(Boolean);
  $('#info').innerHTML=`
  <section class="card wide"><h2><span class="ic">⚠️</span>${esc(T('s_inter'))}<span class="cnt">${esc(T('n_inter',{n:inter.length}))}</span></h2>
    <div class="ilist">${inter.length?inter.map(i=>`<div class="inter ${esc(i.sev)}"><div class="grow"><b>${esc(LT(i.with))}</b><p>${esc(LT(i.desc))}${refChips(i.r)}</p></div><span class="sev">${esc(T('sev_'+i.sev))}</span></div>`).join(''):`<p class="hint">${esc(T('no_inter'))}</p>`}</div></section>
  <section class="card"><h2><span class="ic">🫘</span>${esc(T('s_kidney'))}</h2>
    ${peds&&peds.renalKids?`<div class="row"><b>${esc(T('kids'))}</b><span>${esc(LT(peds.renalKids))}${refChips(peds.srcIds)}</span></div>`:''}
    <div class="row"><b>${esc(T('adults'))}</b><span>${esc(LT(d.renal))}${refChips(d.src&&d.src.slice(0,1))}</span></div></section>
  ${d.hepatic?`<section class="card"><h2><span class="ic">🩺</span>${esc(T('s_liver'))}</h2><div class="prose"><p>${esc(LT(d.hepatic))}</p></div></section>`:''}
  ${d.preg?`<section class="card"><h2><span class="ic">🤰</span>${esc(T('s_preg'))}</h2><div class="prose"><p>${esc(LT(d.preg))}</p></div></section>`:''}
  <section class="card"><h2><span class="ic">💊</span>${esc(T('s_disp'))}</h2><div class="prose"><p>${esc(LT(d.timing))}</p></div></section>
  <section class="card"><h2><span class="ic">📋</span>${esc(T('s_dose'))}</h2><div class="prose"><p>${esc(LT(d.dose))}</p></div></section>
  <section class="card"><h2><span class="ic">🎯</span>${esc(T('s_uses'))}</h2><div class="prose"><p>${esc(LT(d.uses))}</p></div></section>
  <section class="card wide"><h2><span class="ic">📚</span>${esc(T('s_src'))}</h2><ol class="refs">${S.map(s=>`<li class="ref-item" id="r${s.id}" value="${s.id}"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><span class="k">${esc(T('k_'+s.kind))}</span><br><span class="d">${esc(s.org)}</span></li>`).join('')}</ol></section>`;
}
/* a source number anywhere on the page scrolls to that source and marks it */
document.addEventListener('click',e=>{const a=e.target.closest('[data-ref]');if(!a)return;e.preventDefault();const id=a.dataset.ref,t=document.getElementById('r'+id)||document.getElementById('rv'+id);if(t){$$('.ref-item.hl').forEach(x=>x.classList.remove('hl'));t.classList.add('hl');t.scrollIntoView({behavior:'smooth',block:'center'})}});


/* ---------- vitamins: the VITAWAW calculators (js/rules/vitamins.js), drawn in this design ---------- */
/* type of a vitamin source, from its publisher: official label / data sheet, guideline, evidence review, other */
function vKind(org){const o=String(org);
  if(/label|Data Sheet|SmPC|package leaflet|prescribing information|DailyMed|FDA/i.test(o))return 'd';
  if(/Cochrane|Family Physician|Lancet|BMJ|Nutrients/i.test(o))return 'r';
  if(/MSD Manual/i.test(o))return 's';
  return 'g';}
const VIKEYS={preg:['fe','ca','fol','d'],inf:['fe','d'],vac:[],bar:['fe','ca','d','b12','zn'],thi:[]};
const VPT={};
async function viewVit(k){
  loading();
  try{await loadScript('js/rules/vitamins.js');INDEX=INDEX||await getJSON('index.json')}catch(e){return failed()}
  const meta=INDEX.find(d=>d.g==='vit'&&d.id===k);if(!meta){location.hash='#/';return}
  pushRecent(k);VIT.setLang(LANG);
  const fav=favs().includes(k);
  SG='vit';
  app().innerHTML=`${groupHead('vit')}${searchBox('','vit')}
  <div class="dhead"><div class="dicon" aria-hidden="true">${ICON.vit}</div>
    <div><h1>${esc(LT(meta.n))}</h1><div class="tags"><span class="tag">${esc(T('g_vit'))}</span><span class="tag gold">${esc(LT(meta.c))}</span></div></div>
    <button class="star" type="button" id="fav" aria-pressed="${fav}" aria-label="${esc(T(fav?'fav_rm':'fav_add'))}">${fav?'★':'☆'}</button></div>
  <div class="grid"><div class="calc-col">
    <section class="card vform" aria-labelledby="pt"><h2 id="pt"><span class="ic">👤</span>${esc(T('patient'))}</h2><div id="vform">${VIT.FORM}</div></section>
    <section class="card result" aria-live="polite" id="result"></section>
  </div><div class="info" id="info"></div></div>${reportBtn()}`;
  wireSearch();
  $('#fav').onclick=()=>{toggleFav(k);const on=favs().includes(k);$('#fav').textContent=on?'★':'☆';$('#fav').setAttribute('aria-pressed',on)};
  const F=$('#vform');
  F.querySelectorAll('[data-t]').forEach(e=>{const v=VIT.T(e.dataset.t);if(v)e.textContent=v});
  F.querySelectorAll('[data-ph]').forEach(e=>{const v=VIT.T(e.dataset.ph);if(v)e.placeholder=v});
  F.querySelectorAll('[data-th]').forEach(e=>{const v=VIT.T(e.dataset.th);if(v)e.innerHTML=v});
  VIT.showFor(k);
  // the same patient across vitamin calculators (memory only)
  F.querySelectorAll('input,select').forEach(e=>{if(e.id in VPT){if(e.type==='checkbox')e.checked=VPT[e.id];else e.value=VPT[e.id]}});
  const go=e=>{if(e&&e.target&&e.target.id)VPT[e.target.id]=e.target.type==='checkbox'?e.target.checked:e.target.value;vitCalc(k)};
  F.addEventListener('input',go);F.addEventListener('change',go);
  vitCalc(k);vitInfo(k);wireReport('v/'+k);
}
function vitCalc(k){
  const R=$('#result');let out;
  try{out=VIT.run(k,LANG)}catch(e){out={err:true};console.error(e)}
  if(!out||out.empty||out.err){
    const need=out&&out.missing?out.missing.map(id=>VIT.T(id)).filter(Boolean):[];
    R.innerHTML=`<div class="empty">${esc(VIT.T('e_empty_t')||T('enter_w'))}${need.length?`<br><small>${esc(VIT.T('e_need'))} ${need.map(esc).join('، ')}</small>`:''}</div>`;return}
  const r=out.r,tone={ok:'',info:'',warn:' warn',bad:' bad'}[r.tone]||'';
  const urgent=(r.notes||[]).filter(n=>n.u),rest=(r.notes||[]).filter(n=>!n.u);
  R.innerHTML=`<div class="rhead${tone}"><div class="k"><span>${esc(T('result'))}</span><span class="vbadge">${r.badge||''}</span></div>
    <div class="bigtxt">${r.title||''}</div>${r.sub?`<div class="sub">${r.sub}</div>`:''}</div>
    <div class="rbody">
    ${urgent.map(n=>`<div class="warn red">${n.t}</div>`).join('')}
    ${r.plan&&r.plan.length?`<div class="lbl first">${esc(VIT.T('plan'))}</div><ol class="vplan">${r.plan.map(s=>`<li><b>${s.h}</b>${s.d?`<span>${s.d}</span>`:''}</li>`).join('')}</ol>`:''}
    ${r.opts&&r.opts.length?`<div class="rrows">${r.opts.map(o=>`<div class="rrow"><b>${o.h}</b>${o.b}${o.d?`<div class="hint m0 mt2">${o.d}</div>`:''}</div>`).join('')}</div>`:''}
    ${r.kv&&r.kv.length?`<div class="facts">${r.kv.map(x=>`<div class="fact"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>`:''}
    ${rest.map(n=>`<p class="hint">${n.t}</p>`).join('')}
    ${actions()}</div>`;
  wireActions();
}
function vitInfo(k){
  const keys=VIKEYS[k]||[k];
  const inter=VIT.INTER.filter(x=>keys.includes(x[0]));
  const ids=[...new Set(VIT.REFGROUP[k]||[])].filter(n=>VIT.REFS[n]).sort((a,b)=>a-b);
  $('#info').innerHTML=`
  ${inter.length?`<section class="card wide"><h2><span class="ic">⚠️</span>${esc(T('s_inter'))}<span class="cnt">${esc(T('n_inter',{n:inter.length}))}</span></h2><div class="ilist">${inter.map(x=>`<div class="inter"><div class="grow"><b>${keys.length>1?esc(L(x[1][0],x[1][1]))+' + ':''}${esc(L(x[2][0],x[2][1]))}</b><p>${esc(L(x[3][0],x[3][1]))}${(x[4]||[]).map(n=>`<a class="ref" href="#" data-ref="v${n}">${n}</a>`).join('')}</p></div></div>`).join('')}</div></section>`:''}
  <section class="card wide"><h2><span class="ic">📚</span>${esc(T('s_src'))}</h2><ol class="refs">${ids.map(n=>{const x=VIT.REFS[n];return `<li class="ref-item" id="rv${n}" value="${n}"><a href="${esc(x[2])}" target="_blank" rel="noopener">${esc(x[1])}</a><span class="k">${esc(T('k_'+vKind(x[0])))}</span><br><span class="d">${esc(x[0])} · ${esc(L(x[3],x[4]))}</span></li>`}).join('')}</ol></section>`;
}

/* ---------- interaction checker ---------- */
const PICK=[];
async function viewInter(g){
  g=g||'ab';loading();let ab;try{[ab]=await loadGroup(g)}catch(e){return failed()}
  const draw=()=>{
    const chosen=PICK.map(id=>ab.find(d=>d.id===id)).filter(Boolean);
    // pairs: an interaction of A that names B (or B's class) in its «with» text
    const hits=[];
    for(const A of chosen)for(const B of chosen){if(A===B)continue;
      const keys=[B.n.ar,B.n.en,B.cls.ar,B.cls.en].map(normAr);
      for(const i of A.inter||[]){const w=normAr(i.with.ar+' '+i.with.en);if(keys.some(k=>k&&w.includes(k)))hits.push({A,B,i})}}
    $('#ichosen').innerHTML=chosen.map(d=>`<button type="button" data-rm="${d.id}">${esc(LT(d.n))} ×</button>`).join('');
    $('#ires').innerHTML=(chosen.length>1?(hits.length?hits.sort((a,b)=>(sevRank[a.i.sev]??3)-(sevRank[b.i.sev]??3)).map(h=>`<div class="inter ${esc(h.i.sev)}"><div class="grow"><b>${esc(LT(h.A.n))} + ${esc(LT(h.B.n))}</b><p>${esc(LT(h.i.desc))}</p></div><span class="sev">${esc(T('sev_'+h.i.sev))}</span></div>`).join(''):`<p class="hint">${esc(T('inter_none'))}</p>`):'')+
      chosen.map(d=>`<div class="sec-title">${esc(T('inter_with',{d:LT(d.n)}))}</div><div class="ilist">${[...(d.inter||[])].sort((a,b)=>(sevRank[a.sev]??3)-(sevRank[b.sev]??3)).map(i=>`<div class="inter ${esc(i.sev)}"><div class="grow"><b>${esc(LT(i.with))}</b><p>${esc(LT(i.desc))}</p></div><span class="sev">${esc(T('sev_'+i.sev))}</span></div>`).join('')}</div>`).join('');
    $$('[data-rm]').forEach(b=>b.onclick=()=>{PICK.splice(PICK.indexOf(b.dataset.rm),1);draw()});
  };
  if(viewInter.g!==g){PICK.length=0;viewInter.g=g}
  app().innerHTML=`${groupHead(g,'inter')}<p class="hint lead">${esc(T('inter_s'))}</p>
  <section class="search"><label class="sbox">${ICON.search}<input id="iq" type="search" placeholder="${esc(T('inter_add'))}" autocomplete="off" dir="auto" aria-label="${esc(T('inter_add'))}"></label><div class="sres" id="ilist"></div><div class="picked" id="ichosen"></div></section>
  <section class="card mt16"><div class="ilist" id="ires"></div></section>`;
  const q=$('#iq');q.oninput=()=>{const v=normAr(q.value);$('#ilist').innerHTML=v?ab.filter(d=>normAr(d.n.ar+' '+d.n.en).includes(v)&&!PICK.includes(d.id)).slice(0,8).map(d=>`<a href="#" data-add="${d.id}"><b>${esc(LT(d.n))}</b><span class="c">${esc(LT(d.cls))}</span></a>`).join(''):'';
    $$('[data-add]').forEach(a=>a.onclick=e=>{e.preventDefault();PICK.push(a.dataset.add);q.value='';$('#ilist').innerHTML='';draw();q.focus()})};
  draw();
}

/* ---------- sources and method ---------- */
async function viewSources(hl,g){
  loading();let src;try{src=await getJSON('sources.json');await loadScript('js/rules/vitamins.js')}catch(e){return failed()}
  let vr=Object.entries(VIT.REFS).sort((a,b)=>a[0]-b[0]);
  if(g&&g!=='vit')vr=[];src=g?src.filter(x=>(x.g||'ab')===g):src;
  app().innerHTML=`${g?groupHead(g,'src'):`<div class="page-h"><span class="dicon">📚</span><h1>${esc(T('src_t'))}</h1></div>`}
  <section class="card"><h2><span class="ic">🧭</span>${esc(T('method'))}</h2><div class="prose"><p>${esc(T('method_p'))}</p></div></section>
  <section class="card mt16"><h2><span class="ic">📚</span>${esc(T('s_src'))}<span class="cnt">${esc(T('src_n',{n:src.length+vr.length}))}</span></h2>
  ${src.length?`<div class="sec-title">${esc(['ab','an'].filter(gg=>src.some(x=>(x.g||'ab')===gg)).map(gg=>T('g_'+gg)).join(' · '))}</div>`:''}<ol class="refs">${src.map(s=>`<li class="ref-item${String(s.id)===hl?' hl':''}" id="r${s.id}" value="${s.id}"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><span class="k">${esc(T('k_'+s.kind))}</span><br><span class="d">${esc(s.org)} · ${esc(L(s.use_ar,s.use_en))}</span></li>`).join('')}</ol>
  ${vr.length?`<div class="sec-title">${esc(T('g_vit'))}</div>`:''}<ol class="refs">${vr.map(([n,x])=>`<li class="ref-item${'v'+n===hl?' hl':''}" id="rv${n}" value="${n}"><a href="${esc(x[2])}" target="_blank" rel="noopener">${esc(x[1])}</a><span class="k">${esc(T('k_'+vKind(x[0])))}</span><br><span class="d">${esc(x[0])} · ${esc(L(x[3],x[4]))}</span></li>`).join('')}</ol></section>`;
  if(hl){const t=document.getElementById('r'+hl);if(t){t.classList.add('hl');t.scrollIntoView({block:'center'})}}
}

/* ---------- menu ---------- */
function viewMenu(){
  const th=store.get('dw-theme','auto');
  app().innerHTML=`<div class="page-h"><span class="dicon">${ICON.menu}</span><h1>${esc(T('nav_menu'))}</h1></div>
  <nav class="menu"><a href="#/src">📚 ${esc(T('nav_src'))}</a><a href="#/admin">🔐 ${esc(T('a_title'))}</a></nav>
  <section class="card"><h2><span class="ic">⚙️</span>${esc(T('settings'))}</h2>
    <div class="lbl first">${esc(T('lang'))}</div><div class="seg two"><button type="button" data-lang="ar" aria-pressed="${LANG==='ar'}">العربية</button><button type="button" data-lang="en" aria-pressed="${LANG==='en'}">English</button></div>
    <div class="lbl">${esc(T('theme'))}</div><div class="seg">${['auto','light','dark'].map(t=>`<button type="button" data-th="${t}" aria-pressed="${th===t}">${esc(T('th_'+t))}</button>`).join('')}</div></section>
  <section class="card mt16"><h2><span class="ic">ℹ️</span>${esc(T('about'))}</h2><div class="prose"><p>${esc(T('about_p'))}</p><p class="hint">v${VERSION}</p></div></section>`;
  $$('[data-lang]').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
  $$('[data-th]').forEach(b=>b.onclick=()=>{setTheme(b.dataset.th);viewMenu()});
}

/* ---------- visual identity: brand/ files first, then the published brand (data/brand.json) on top ---------- */
const TOKRE=/^--[a-z-]{2,30}$/;
const isColor=v=>/^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\))$/i.test(String(v).trim());
const isLogo=v=>/^data:image\/(png|svg\+xml|webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(String(v||''))||/^brand\/[\w.-]+\.(svg|png|webp)$/.test(String(v||''));
let BRAND_SHEET=null;
function drawBrand(){
  const B=window.BRAND;if(!B)return;
  const n=$('#bname');n.textContent=B.name[0];const g=document.createElement('b');g.textContent=B.name[1]||'';n.appendChild(g);
  if(isLogo(B.logo))$('#blogo').src=B.logo;$('.brand').setAttribute('aria-label',B.name.join(''));
  const m=$('meta[name=theme-color]');if(m&&isColor(B.themeColor))m.content=B.themeColor;
  $('#btag').textContent=LT(B.tagline);
}
/* colours go into a constructed style sheet (allowed by the page's security policy), only known tokens with plain colour values */
function applyBrand(b){
  if(!b||typeof b!=='object')return;
  const rules=m=>Object.entries((b.colors||{})[m]||{}).filter(([k,v])=>TOKRE.test(k)&&isColor(v)).map(([k,v])=>k+':'+String(v).trim()).join(';');
  const css=`:root{${rules('light')}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${rules('dark')}}}:root[data-theme="dark"]{${rules('dark')}}`;
  try{if(!BRAND_SHEET){BRAND_SHEET=new CSSStyleSheet();document.adoptedStyleSheets=[...document.adoptedStyleSheets,BRAND_SHEET]}BRAND_SHEET.replaceSync(css)}catch(e){}
  const B=window.BRAND=Object.assign({},window.BRAND||{});
  if(Array.isArray(b.name)&&b.name[0])B.name=[String(b.name[0]).slice(0,15),String(b.name[1]||'').slice(0,15)];
  if(b.tagline&&(b.tagline.ar||b.tagline.en))B.tagline={ar:b.tagline.ar||B.tagline.ar,en:b.tagline.en||B.tagline.en};
  if(isLogo(b.logo))B.logo=b.logo;
  if(b.colors&&b.colors.light&&isColor(b.colors.light['--primary']))B.themeColor=b.colors.light['--primary'];
  drawBrand();
}

/* ---------- start ---------- */
function start(){
  drawBrand();getJSON('brand.json').then(applyBrand).catch(()=>{});
  const th=store.get('dw-theme','auto');setTheme(th);
  $('#htheme').onclick=()=>setTheme(themeNow()==='dark'?'light':'dark');
  $('#hlang').onclick=()=>setLang(LANG==='ar'?'en':'ar');
  applyLang();addEventListener('hashchange',route);route();
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
}
start();
