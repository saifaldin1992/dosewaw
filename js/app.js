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
const normAr=s=>String(s||'').toLowerCase().replace(/[ً-ٰٟـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[–—\-]/g,' ').replace(/\s+/g,' ').trim();

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
 search:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
};
const GROUPS=[{id:'ab',live:true},{id:'an'},{id:'ah'},{id:'gi'},{id:'vit'}];

/* ---------- data (static files; fetched once, kept in memory; the service worker keeps them offline) ---------- */
const CACHE={};
function getJSON(name){return CACHE[name]||(CACHE[name]=fetch('data/'+name+'?v='+VERSION).then(r=>{if(!r.ok)throw new Error(name);return r.json()}).catch(e=>{delete CACHE[name];throw e}))}
const SCRIPTS={};
function loadScript(src){return SCRIPTS[src]||(SCRIPTS[src]=new Promise((ok,no)=>{const s=document.createElement('script');s.src=src+'?v='+VERSION;s.onload=ok;s.onerror=()=>{delete SCRIPTS[src];no(new Error(src))};document.head.appendChild(s)}))}
const loadAB=()=>Promise.all([getJSON('antibiotics.json'),getJSON('sources.json'),getJSON('who_wfa.json'),loadScript('js/rules/antibiotics.js'),loadScript('js/rules/peds.js')]);

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
  const B=window.BRAND||{};$('#btag').textContent=LT(B.tagline);document.title=(B.name||['DOSE','WAW']).join('')+' — '+LT(B.tagline);
  $('#hlang').textContent=LANG==='ar'?'EN':'ع';$('#hlang').setAttribute('aria-label',LANG==='ar'?'English':'العربية');
  $('#topnav').innerHTML=[['#/','nav_drugs'],['#/inter','nav_inter_long'],['#/calc','nav_calc'],['#/src','nav_src']].map(([h,k])=>`<a href="${h}" data-nav="${h}">${esc(T(k))}</a>`).join('');
  $('#tabs').innerHTML=[['#/','nav_drugs','drug'],['#/inter','nav_inter','inter'],['#/calc','nav_calc','calc'],['#/menu','nav_menu','menu']].map(([h,k,i])=>`<a href="${h}" data-nav="${h}"><span class="pill">${ICON[i]}</span>${esc(T(k))}</a>`).join('');
  $('#disc').textContent=T('disc');
}
function setLang(l){LANG=l;store.set('dw-lang',l);applyLang();route()}
function themeNow(){const t=document.documentElement.dataset.theme;return t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function setTheme(t){if(t==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t;store.set('dw-theme',t);$('#htheme').textContent=themeNow()==='dark'?'☀':'☾'}
function markNav(base){$$('[data-nav]').forEach(a=>{const on=a.dataset.nav===base;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}

/* ---------- router ---------- */
function route(){
  const h=location.hash.replace(/^#/,'')||'/';const p=h.split('/').filter(Boolean);
  const view=p[0]||'';window.scrollTo(0,0);
  const base={'':'#/',d:'#/',g:'#/',inter:'#/inter',calc:'#/calc',src:'#/src',menu:'#/menu'}[view]||'#/';markNav(base);
  if(view==='d'&&p[1])return viewDrug(decodeURIComponent(p[1]));
  if(view==='g'&&p[1])return viewGroup(p[1]);
  if(view==='inter')return viewInter();
  if(view==='calc')return viewCalc();
  if(view==='src')return viewSources(p[1]);
  if(view==='menu')return viewMenu();
  viewHome();
}
const app=()=>$('#app');
function loading(){app().innerHTML=`<p class="empty">${esc(T('loading'))}</p>`}
function failed(){app().innerHTML=`<p class="empty">${esc(T('load_err'))}</p>`}

/* ---------- search box (home and drug page) ---------- */
let INDEX=null;
function searchBox(q,group){
  return `<section class="search" aria-label="${esc(T('search_lbl'))}">
    <label class="sbox">${ICON.search}<input id="q" type="search" value="${esc(q||'')}" placeholder="${esc(T('search_ph'))}" autocomplete="off" aria-label="${esc(T('search_lbl'))}" dir="auto">
    <button class="clr" type="button" id="qclr" aria-label="${esc(T('clear'))}">×</button></label>
    <div class="chips" role="group" aria-label="${esc(T('groups'))}">
      <button class="chip" data-g="" aria-pressed="${!group}">${esc(T('g_all'))}</button>
      ${GROUPS.map(g=>`<button class="chip${g.live?'':' soon'}" data-g="${g.id}" aria-pressed="${group===g.id}">${g.live?'<span class="dot"></span>':''}${esc(T('g_'+g.id))}${g.live?'':` <em>${esc(T('soon'))}</em>`}</button>`).join('')}
    </div>
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
      const sc=!v?3:(normAr(d.n.ar).startsWith(v)||normAr(d.n.en).startsWith(v))?0:n.includes(v)?1:c.includes(v)?2:-1;return [sc,d]}).filter(x=>x[0]>=0)
      .sort((a,b)=>a[0]-b[0]||LT(a[1].n).localeCompare(LT(b[1].n),LANG)).slice(0,v?12:200).map(x=>x[1]);
    out.innerHTML=list.length?list.map(d=>`<a href="#/d/${encodeURIComponent(d.id)}"><b>${esc(LT(d.n))}</b>${LANG==='ar'?`<span class="en">${esc(d.n.en)}</span>`:''}<span class="c">${esc(LT(d.c))}</span></a>`).join(''):`<p class="none">${esc(T('none_found'))}</p>`;
  };
  q.oninput=run;$('#qclr').onclick=()=>{q.value='';SG='';$$('[data-g]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g==='')));run();q.focus()};
  $$('[data-g]').forEach(b=>b.onclick=()=>{SG=b.dataset.g;$$('[data-g]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));run()});
  q.onkeydown=e=>{if(e.key==='Enter'){const a=out.querySelector('a');if(a)location.hash=a.getAttribute('href')}};
  run();
}

/* ---------- home ---------- */
async function viewHome(){
  SG='';
  try{INDEX=INDEX||await getJSON('index.json')}catch(e){return failed()}
  const name=id=>{const d=INDEX.find(x=>x.id===id);return d?LT(d.n):null};
  const chipsOf=ids=>ids.map(id=>name(id)?`<a class="chip" href="#/d/${encodeURIComponent(id)}">${esc(name(id))}</a>`:'').join('');
  const count=g=>INDEX.filter(d=>d.g===g).length;
  app().innerHTML=`<div class="hero"><h1>${esc(T('hero_t'))}</h1><p>${esc(T('hero_s'))}</p></div>
  ${searchBox('', '')}
  ${favs().length?`<div class="sec-title">⭐ ${esc(T('favs'))}</div><div class="chips">${chipsOf(favs())}</div>`:''}
  ${recent().length?`<div class="sec-title">🕘 ${esc(T('recent'))}</div><div class="chips">${chipsOf(recent())}</div>`:''}
  <div class="sec-title">${esc(T('groups'))}</div>
  <div class="groups">${GROUPS.map(g=>`<a class="gcard${g.live?'':' soon'}" href="#/g/${g.id}"><span class="gi">${ICON[g.id]}</span><b>${esc(T('g_'+g.id))}</b><small>${g.live?esc(T('n_drugs',{n:count(g.id)})):esc(T('soon'))}</small>${g.live?'':`<span class="soonb">${esc(T('soon'))}</span>`}</a>`).join('')}</div>`;
  wireSearch();
}
async function viewGroup(g){
  try{INDEX=INDEX||await getJSON('index.json')}catch(e){return failed()}
  const G=GROUPS.find(x=>x.id===g)||GROUPS[0];SG=G.id;
  app().innerHTML=`<div class="page-h"><span class="dicon">${ICON[G.id]}</span><h1>${esc(T('g_'+G.id))}</h1></div>${searchBox('',G.id)}`;
  wireSearch();
}

/* ---------- drug page ---------- */
/* the patient stays the same while the pharmacist moves between drugs (memory only, never stored) */
const PT={mode:'w',val:'',infant:false,age:'',sex:'',ht:'',scr:'',scrU:'mg',x:{},ind:{},every:{}};
let D=null;
async function viewDrug(id){
  loading();
  let ab,src,who;
  try{[ab,src,who]=await loadAB();INDEX=INDEX||await getJSON('index.json')}catch(e){return failed()}
  const d=ab.find(x=>x.id===id);if(!d){location.hash='#/';return}
  pushRecent(id);
  const rule=(typeof ABC_RULES!=='undefined'&&ABC_RULES[id])||null, peds=(typeof PEDS!=='undefined'&&PEDS[id])||null;
  D={d,rule,peds,src,who};
  const fav=favs().includes(id);
  const renal=rule&&!rule.noRenal;
  const kidOpen=!!(PT.scr||PT.ht);
  app().innerHTML=`${searchBox('', '')}
  <div class="dhead">
    <div class="dicon" aria-hidden="true">${ICON.ab}</div>
    <div><h1>${esc(LT(d.n))}${LANG==='ar'?` <span class="en">${esc(d.n.en)}</span>`:''}</h1>
      <div class="tags"><span class="tag">${esc(LT(d.cls))}</span>${d.aware?`<span class="tag access">AWaRe · ${esc(d.aware[0].toUpperCase()+d.aware.slice(1))}</span>`:''}</div></div>
    <button class="star" type="button" id="fav" aria-pressed="${fav}" aria-label="${esc(T(fav?'fav_rm':'fav_add'))}">${fav?'★':'☆'}</button>
  </div>
  <div class="grid">
    <div class="calc-col">
      <section class="card" aria-labelledby="pt">
        <h2 id="pt"><span class="ic">👤</span>${esc(T('patient'))}</h2>
        <div class="seg" role="group" aria-label="${esc(T('patient'))}">${['w','y','m'].map(m=>`<button type="button" data-mode="${m}" aria-pressed="${PT.mode===m}">${esc(T('m_'+m))}</button>`).join('')}</div>
        <label class="numin"><input id="val" inputmode="decimal" autocomplete="off" value="${esc(PT.val)}" aria-label="${esc(T('v_lbl'))}" placeholder="0"><span id="unit"></span></label>
        <div class="est" id="est" hidden></div>
        ${peds&&peds.infant?`<label class="check" id="infwrap"><input type="checkbox" id="inf"${PT.infant?' checked':''}> ${esc(T('infant'))}</label>`:''}
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
  </div>`;
  wireSearch();
  $('#fav').onclick=()=>{toggleFav(id);const on=favs().includes(id);$('#fav').textContent=on?'★':'☆';$('#fav').setAttribute('aria-pressed',on);$('#fav').setAttribute('aria-label',T(on?'fav_rm':'fav_add'))};
  $$('[data-mode]').forEach(b=>b.onclick=()=>{PT.mode=b.dataset.mode;$$('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));PT.val='';$('#val').value='';calc();$('#val').focus()});
  const bind=(sel,key,ev='input')=>{const e=$(sel);if(e)e.addEventListener(ev,()=>{PT[key]=e.type==='checkbox'?e.checked:e.value;calc()})};
  bind('#val','val');bind('#inf','infant','change');bind('#kage','age');bind('#ksex','sex','change');bind('#kht','ht');bind('#kscr','scr');bind('#kscru','scrU','change');
  drawInfo();calc();
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
  const est=$('#est'),iw=$('#infwrap');if(iw)iw.hidden=PT.mode!=='w'||(P.W>=peds.adultKg);
  est.hidden=PT.mode==='w'||!(P.v>0);
  if(!est.hidden)est.textContent=P.W?T('est',{w:num(P.W)}):T('est_out');
  const child=peds&&P.W&&(P.W<peds.adultKg||P.infant);
  if(child)return pedsResult(P);
  if(!rule){R.innerHTML=`<div class="rbody"><p class="hint">${esc(LT(d.dose))}</p></div>`;$('#opts').hidden=true;return}
  adultResult(P);
}
function srcLine(ids,label,ref){
  const s=(ids||[]).map(i=>D.src.find(x=>x.id===i)).filter(Boolean)[0];
  return `<p class="src">${esc(T('by_src'))} ${s?`<a href="#" data-ref="${s.id}">${esc(s.title)} [${s.id}]</a>`:''}${label?' · '+esc(label):''}${ref?' · '+esc(T('label_v',{r:ref})):''}</p>`;
}
function actions(){return `<div class="acts"><button class="btn pri" type="button" id="bcopy">${esc(T('copy'))}</button><button class="btn" type="button" id="bprint">${esc(T('print'))}</button><button class="btn" type="button" id="bshare">${esc(T('share'))}</button></div>`}
function wireActions(){
  const head=()=>LT(D.d.n)+' · '+new Date().toISOString().slice(0,10)+' · DOSEWAW';
  const body=()=>head()+'\n\n'+$('#result').innerText.replace(new RegExp(T('copy')+'|'+T('print')+'|'+T('share'),'g'),'').replace(/\n{3,}/g,'\n\n').trim();
  $('#bcopy').onclick=()=>copyText(body());$('#bprint').onclick=()=>window.print();
  $('#bshare').onclick=async()=>{if(navigator.share){try{await navigator.share({title:head(),text:body()})}catch(e){}}else copyText(body())};
}
function pedsResult(P){
  const {peds}=D,R=$('#result');
  const s={ind:PT.ind[D.d.id]||peds.def,every:PT.every[D.d.id]||peds.freq[0]};
  const r=pedsCalc(peds,P,s);
  const best=easiest(r.ml);
  const warn=r.notes.map(n=>n.k==='infant'?`<div class="warn">${esc(T('infant_w',{m:n.v.mgkgday,h:n.v.every,r:n.v.ref}))}</div>`:`<div class="warn red">${esc(T('cap_w',{m:n.v}))}</div>`).join('');
  const table=r.ml.length?`<table class="ml"><tr><th>${esc(T('susp'))}</th><th style="text-align:end">${esc(T('per_dose'))}</th></tr>${r.ml.map(x=>`<tr class="${x.c===best?'best':''}"><td><span class="num">${x.c} mg / 5 mL</span>${x.c===best?` <small style="color:var(--highlight-text);font-weight:600">· ${esc(T('easiest'))}</small>`:''}</td><td class="v">${num(mlRound(x.ml))} <small>${esc(T('ml'))}</small></td></tr>`).join('')}</table>`:'';
  R.innerHTML=`<div class="rhead"><div class="k"><span>${esc(T('result'))}</span><span>${num(P.W)} ${esc(T('u_kg'))}${P.est?' ≈':''}</span></div>
    <div class="big">${num(r.mg)} <small>${esc(T('mg'))}</small></div>
    <div class="sub">${esc(T('every',{h:r.every}))} · ${esc(T('per_day',{m:r.mgkgday,n:24/r.every}))}</div></div>
    <div class="rbody">${table}${warn}
    <div class="facts"><div class="fact"><b>${esc(T('daily'))}</b><span class="num">${num(r.daily)} mg</span></div><div class="fact"><b>${esc(T('duration'))}</b><span>${esc(LT(peds.duration))}</span></div></div>
    ${srcLine(peds.srcIds,'',r.ref)}${actions()}</div>`;
  wireActions();
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
    <div class="rbody">${kidsWarn?`<div class="warn">${esc(T('kids_adult_calc',{r:rule.pedsRef?' ('+rule.pedsRef+')':''}))}</div>`:''}
    <div class="rrows">${rowsH}</div>${crH}${egH}<p class="hint">${esc(LT(r.notes))}</p>${srcLine(rule.srcIds,rule.label)}${actions()}</div>`;
  wireActions();
  if(!rule.inputs.length){O.hidden=true;O.innerHTML='';return}
  O.hidden=false;
  O.innerHTML=`<div class="lbl first">${esc(T('options'))}</div><div class="fields">${rule.inputs.map(f=>f.type==='select'
    ?`<div class="fld"><label for="ab_${f.id}">${esc(LT(f.label))}</label><select id="ab_${f.id}">${f.options.map(o=>`<option value="${esc(o[0])}"${x[f.id]===o[0]?' selected':''}>${esc(LT(o[1]))}</option>`).join('')}</select></div>`
    :`<label class="chk"><input type="checkbox" id="ab_${f.id}"${x[f.id]?' checked':''}><span>${esc(LT(f.label))}</span></label>`).join('')}</div>`;
  rule.inputs.forEach(f=>{const e=$('#ab_'+f.id);e.onchange=()=>{x[f.id]=f.type==='select'?e.value:e.checked;calc()}});
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
  <section class="card"><h2><span class="ic">💊</span>${esc(T('s_disp'))}</h2><div class="prose"><p>${esc(LT(d.timing))}</p></div></section>
  <section class="card"><h2><span class="ic">📋</span>${esc(T('s_dose'))}</h2><div class="prose"><p>${esc(LT(d.dose))}</p></div></section>
  <section class="card"><h2><span class="ic">🎯</span>${esc(T('s_uses'))}</h2><div class="prose"><p>${esc(LT(d.uses))}</p></div></section>
  <section class="card wide"><h2><span class="ic">📚</span>${esc(T('s_src'))}</h2><ol class="refs">${S.map(s=>`<li class="ref-item" id="r${s.id}" value="${s.id}"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><span class="k">${esc(T('k_'+s.kind))}</span><br><span class="d">${esc(s.org)}</span></li>`).join('')}</ol></section>`;
}
/* a source number anywhere on the page scrolls to that source and marks it */
document.addEventListener('click',e=>{const a=e.target.closest('[data-ref]');if(!a)return;e.preventDefault();const t=document.getElementById('r'+a.dataset.ref);if(t){$$('.ref-item.hl').forEach(x=>x.classList.remove('hl'));t.classList.add('hl');t.scrollIntoView({behavior:'smooth',block:'center'})}});

/* ---------- interaction checker ---------- */
const PICK=[];
async function viewInter(){
  loading();let ab;try{[ab]=await loadAB()}catch(e){return failed()}
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
  app().innerHTML=`<div class="page-h"><span class="dicon">${ICON.inter}</span><h1>${esc(T('inter_t'))}</h1></div><p class="hint" style="margin:0 4px 12px">${esc(T('inter_s'))}</p>
  <section class="search"><label class="sbox">${ICON.search}<input id="iq" type="search" placeholder="${esc(T('inter_add'))}" autocomplete="off" dir="auto" aria-label="${esc(T('inter_add'))}"></label><div class="sres" id="ilist"></div><div class="picked" id="ichosen"></div></section>
  <section class="card" style="margin-top:16px"><div class="ilist" id="ires"></div></section>`;
  const q=$('#iq');q.oninput=()=>{const v=normAr(q.value);$('#ilist').innerHTML=v?ab.filter(d=>normAr(d.n.ar+' '+d.n.en).includes(v)&&!PICK.includes(d.id)).slice(0,8).map(d=>`<a href="#" data-add="${d.id}"><b>${esc(LT(d.n))}</b><span class="c">${esc(LT(d.cls))}</span></a>`).join(''):'';
    $$('[data-add]').forEach(a=>a.onclick=e=>{e.preventDefault();PICK.push(a.dataset.add);q.value='';$('#ilist').innerHTML='';draw();q.focus()})};
  draw();
}

/* ---------- calculators ---------- */
async function viewCalc(){
  loading();let ab;try{[ab]=await loadAB()}catch(e){return failed()}
  const kids=ab.filter(d=>PEDS[d.id]),adults=ab.filter(d=>ABC_RULES[d.id]);
  const li=list=>list.map(d=>`<a href="#/d/${encodeURIComponent(d.id)}"><b>${esc(LT(d.n))}</b><span class="c">${esc(LT(d.cls))}</span></a>`).join('');
  app().innerHTML=`<div class="page-h"><span class="dicon">${ICON.calc}</span><h1>${esc(T('calc_t'))}</h1></div><p class="hint" style="margin:0 4px 12px">${esc(T('calc_s'))}</p>
  <section class="card"><h2><span class="ic">👶</span>${esc(T('calc_peds'))}<span class="cnt">${kids.length}</span></h2><div class="sres">${li(kids)}</div></section>
  <section class="card" style="margin-top:16px"><h2><span class="ic">🫘</span>${esc(T('calc_adult'))}<span class="cnt">${adults.length}</span></h2><div class="sres">${li(adults)}</div></section>`;
}

/* ---------- sources and method ---------- */
async function viewSources(hl){
  loading();let src;try{src=await getJSON('sources.json')}catch(e){return failed()}
  app().innerHTML=`<div class="page-h"><span class="dicon">📚</span><h1>${esc(T('src_t'))}</h1></div>
  <section class="card"><h2><span class="ic">🧭</span>${esc(T('method'))}</h2><div class="prose"><p>${esc(T('method_p'))}</p></div></section>
  <section class="card" style="margin-top:16px"><h2><span class="ic">📚</span>${esc(T('s_src'))}<span class="cnt">${esc(T('src_n',{n:src.length}))}</span></h2>
  <ol class="refs">${src.map(s=>`<li class="ref-item${String(s.id)===hl?' hl':''}" id="r${s.id}" value="${s.id}"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><span class="k">${esc(T('k_'+s.kind))}</span><br><span class="d">${esc(s.org)} · ${esc(L(s.use_ar,s.use_en))}</span></li>`).join('')}</ol></section>`;
  if(hl){const t=document.getElementById('r'+hl);if(t)t.scrollIntoView({block:'center'})}
}

/* ---------- menu ---------- */
function viewMenu(){
  const th=store.get('dw-theme','auto');
  app().innerHTML=`<div class="page-h"><span class="dicon">${ICON.menu}</span><h1>${esc(T('nav_menu'))}</h1></div>
  <nav class="menu"><a href="#/src">📚 ${esc(T('nav_src'))}</a><a href="#/inter">⚠️ ${esc(T('nav_inter_long'))}</a><a href="#/calc">🧮 ${esc(T('nav_calc'))}</a></nav>
  <section class="card"><h2><span class="ic">⚙️</span>${esc(T('settings'))}</h2>
    <div class="lbl first">${esc(T('lang'))}</div><div class="seg two"><button type="button" data-lang="ar" aria-pressed="${LANG==='ar'}">العربية</button><button type="button" data-lang="en" aria-pressed="${LANG==='en'}">English</button></div>
    <div class="lbl">${esc(T('theme'))}</div><div class="seg">${['auto','light','dark'].map(t=>`<button type="button" data-th="${t}" aria-pressed="${th===t}">${esc(T('th_'+t))}</button>`).join('')}</div></section>
  <section class="card" style="margin-top:16px"><h2><span class="ic">ℹ️</span>${esc(T('about'))}</h2><div class="prose"><p>${esc(T('about_p'))}</p><p class="hint">v${VERSION}</p></div></section>`;
  $$('[data-lang]').forEach(b=>b.onclick=()=>setLang(b.dataset.lang));
  $$('[data-th]').forEach(b=>b.onclick=()=>{setTheme(b.dataset.th);viewMenu()});
}

/* ---------- start ---------- */
function start(){
  const B=window.BRAND;
  if(B){const n=$('#bname');n.textContent=B.name[0];const g=document.createElement('b');g.textContent=B.name[1]||'';n.appendChild(g);$('#blogo').src=B.logo;$('.brand').setAttribute('aria-label',B.name.join(''));const m=$('meta[name=theme-color]');if(m)m.content=B.themeColor}
  const th=store.get('dw-theme','auto');setTheme(th);
  $('#htheme').onclick=()=>setTheme(themeNow()==='dark'?'light':'dark');
  $('#hlang').onclick=()=>setLang(LANG==='ar'?'en':'ar');
  applyLang();addEventListener('hashchange',route);route();
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
}
start();
