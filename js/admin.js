/* DOSEWAW · js/admin.js — the owner panel (#/admin). Loaded only when the panel opens.
   Talks to Supabase with the public key; every permission is checked by the database (supabase/migrations/0001_dosewaw_core.sql).
   Owner: review, publish and roll back, visual identity, drugs, team. Pharmacist: drugs (changes wait for the owner), their own changes. */
'use strict';
const SB_LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
let SB=null,ME=null,PUB=null,ATAB='review';
const BRAND_TOKENS={
  light:['--primary','--primary-deep','--primary-mid','--primary-soft','--primary-tint','--primary-text','--on-primary','--highlight','--highlight-text','--highlight-soft','--on-highlight','--bg','--card','--ink','--mute','--line'],
  dark:['--primary-text','--primary-soft','--primary-tint','--highlight-soft','--bg','--card','--ink','--mute','--line']
};
const DRUG_FIELDS=['uses','dose','renal','timing'];
const noTags=s=>!/[<>]/.test(s);
const A=k=>T('a_'+k);

async function adminBoot(){
  try{INDEX=INDEX||await getJSON('index.json')}catch(e){}
  app().innerHTML=`<p class="empty">${esc(T('loading'))}</p>`;
  try{await loadScript('js/config.js')}catch(e){}
  if(!window.DW_CFG){app().innerHTML=panelHead()+`<section class="card"><p class="prose">${esc(A('not_linked'))}</p></section>`;return}
  try{if(!window.supabase)await loadScript(SB_LIB)}catch(e){return failed()}
  if(!SB)SB=window.supabase.createClient(window.DW_CFG.url,window.DW_CFG.anon,{auth:{persistSession:true,storageKey:'dw-auth'}});
  const {data:{session}}=await SB.auth.getSession();
  if(!session)return loginView();
  const {data:m}=await SB.from('members').select('user_id,email,name,role,active').eq('user_id',session.user.id).maybeSingle();
  if(!m||!m.active){await SB.auth.signOut();return loginView(A('no_member'))}
  ME=m;const allowed=ME.role==='owner'?['review','reports','publish','brand','drugs','team']:['drugs','mine'];if(!allowed.includes(ATAB))ATAB=allowed[0];
  panel();
}
function panelHead(){return `<div class="page-h"><span class="dicon">🔐</span><h1>${esc(A('title'))}</h1>${window.DW_CFG&&window.DW_CFG.test?`<span class="tag gold">${esc(A('test_db'))}</span>`:''}</div>`}

/* ---------- sign in / first sign-up by invitation ---------- */
/* two screens: «sign in» and «create the account» (first time, invited e-mail only) */
function loginView(msg,signup){
  app().innerHTML=panelHead()+`<section class="card mw460"><h2><span class="ic">${signup?'🆕':'🔑'}</span>${esc(signup?A('su_title'):A('sign_in'))}</h2>
    ${signup?`<p class="hint m0 mb10">${esc(A('su_hint'))}</p>`:''}
    <form id="lf" class="fields" autocomplete="on">
      <div class="fld"><label for="le">${esc(A('email'))}</label><input id="le" type="email" autocomplete="username" required dir="ltr"></div>
      <div class="fld"><label for="lp">${esc(A('password'))}</label><input id="lp" type="password" autocomplete="${signup?'new-password':'current-password'}" minlength="8" required dir="ltr"></div>
      ${signup?`<div class="fld"><label for="lp2">${esc(A('password2'))}</label><input id="lp2" type="password" autocomplete="new-password" minlength="8" required dir="ltr"></div>`:''}
      <button class="btn pri" type="submit">${esc(signup?A('su_btn'):A('sign_in'))}</button>
      <button class="btn" type="button" id="lsw">${esc(signup?A('have_account'):A('first_time'))}</button>
      <p class="hint" id="lmsg" role="alert">${msg?esc(msg):esc(A('invite_only'))}</p>
    </form></section>`;
  const say=t=>{$('#lmsg').textContent=t};
  $('#lsw').onclick=()=>loginView('',!signup);
  $('#lf').onsubmit=async e=>{e.preventDefault();
    if(signup)return createAccount(say);
    say(T('loading'));
    const {error}=await SB.auth.signInWithPassword({email:$('#le').value.trim(),password:$('#lp').value});
    if(error)return say(A('bad_login')+' ('+error.message+')');adminBoot()};
}
async function createAccount(say){
  {const email=$('#le').value.trim(),password=$('#lp').value;
    if(!email||password.length<8)return say(A('pw_rule'));
    if(password!==$('#lp2').value)return say(A('pw_same'));say(T('loading'));
    const {error}=await SB.auth.signUp({email,password});
    // the invitation check runs inside the database; Supabase reports it as «Database error saving new user»
    // the technical reason is shown in small text too, so a problem can be diagnosed from a screenshot
    if(error)return say((/invitation|invite|database error/i.test(error.message)?A('not_invited'):A('signup_failed'))+' ('+error.message+')');
    const r=await SB.auth.signInWithPassword({email,password});if(r.error)return say(A('signup_failed')+' ('+r.error.message+')');adminBoot()};
}

/* ---------- the panel ---------- */
async function panel(){
  const {data:pub}=await SB.from('published').select('version,data,note,published_at').eq('id',1).maybeSingle();PUB=pub;
  const tabs=ME.role==='owner'?['review','reports','publish','brand','drugs','team']:['drugs','mine'];
  app().innerHTML=panelHead()+`<div class="chips mb12" role="tablist">${tabs.map(t=>`<button class="chip" role="tab" data-at="${t}" aria-pressed="${ATAB===t}">${esc(A('t_'+t))}</button>`).join('')}
    <button class="chip" id="aout" type="button">${esc(A('sign_out'))}</button></div>
    <p class="hint lead">${esc(A('signed_as'))} <b>${esc(ME.name||ME.email)}</b> · ${esc(A('r_'+ME.role))}${PUB?` · ${esc(A('live_v'))} ${PUB.version}`:''}</p>
    <div id="apane"></div>`;
  $$('[data-at]').forEach(b=>b.onclick=()=>{ATAB=b.dataset.at;panel()});
  $('#aout').onclick=async()=>{await SB.auth.signOut();ME=null;loginView()};
  if(!PUB&&ME.role==='owner')return seedPane();
  ({review:reviewPane,reports:reportsPane,publish:publishPane,brand:brandPane,drugs:drugsPane,team:teamPane,mine:minePane}[ATAB]||drugsPane)();
}
const pane=()=>$('#apane');
const errBox=e=>`<div class="warn red">${esc(A('error'))}: ${esc(e&&e.message||String(e))}</div>`;

async function seedPane(){
  pane().innerHTML=`<section class="card"><h2><span class="ic">🌱</span>${esc(A('seed_t'))}</h2><p class="prose">${esc(A('seed_p'))}</p><button class="btn pri" id="seed">${esc(A('seed_b'))}</button><div id="smsg"></div></section>`;
  $('#seed').onclick=async()=>{$('#seed').disabled=true;
    try{const [ab,src]=await Promise.all([fetch('data/antibiotics.json').then(r=>r.json()),fetch('data/sources.json').then(r=>r.json())]);
      const {error}=await SB.rpc('seed_content',{p_data:{antibiotics:ab,sources:src,brand:{}}});if(error)throw error;panel()}
    catch(e){$('#smsg').innerHTML=errBox(e);$('#seed').disabled=false}};
}

/* review: every pending change, old value next to the new one */
async function reviewPane(){
  const {data,error}=await SB.from('changes').select('*').eq('status','pending').order('id');
  if(error)return pane().innerHTML=errBox(error);
  const names=await memberNames();
  pane().innerHTML=data.length?data.map(c=>`<section class="card mb12"><h2><span class="ic">✏️</span>${esc(changeTitle(c))}<span class="cnt">${esc(names[c.author]||'')} · ${esc(String(c.created_at).slice(0,16).replace('T',' '))}</span></h2>
    ${c.note?`<p class="hint m0 mb8">${esc(A('note'))}: ${esc(c.note)}</p>`:''}${diffHTML(c)}
    <div class="fld mt10"><label for="rn${c.id}">${esc(A('review_note'))}</label><input id="rn${c.id}" maxlength="300"></div>
    <div class="acts two"><button class="btn pri" data-ok="${c.id}">${esc(A('approve'))}</button><button class="btn" data-no="${c.id}">${esc(A('reject'))}</button></div></section>`).join('')
    :`<section class="card"><p class="prose">${esc(A('nothing_pending'))}</p></section>`;
  $$('[data-sw]').forEach(e=>{if(isColor(e.dataset.sw))e.style.background=e.dataset.sw});
  const act=async(id,ok)=>{const note=$('#rn'+id).value;if(!noTags(note))return alert(A('no_tags'));
    const {error}=await SB.rpc('review_change',{p_id:+id,p_approve:ok,p_note:note});if(error)return alert(error.message);reviewPane()};
  $$('[data-ok]').forEach(b=>b.onclick=()=>act(b.dataset.ok,true));$$('[data-no]').forEach(b=>b.onclick=()=>act(b.dataset.no,false));
}
function current(c){const d=PUB&&PUB.data||{};if(c.kind==='brand')return d.brand||{};const list=c.kind==='drug'?d.antibiotics:d.sources;return (list||[]).find(x=>String(x.id)===String(c.key))||null}
function changeTitle(c){const cur=current(c);if(c.kind==='brand')return A('t_brand');return (cur&&cur.n?LT(cur.n):c.data.n?LT(c.data.n):c.key)+(cur?'':' · '+A('new_item'))}
function show(v){if(v==null)return '—';if(typeof v==='object'&&('ar' in v||'en' in v))return (v.ar||'')+(v.en?' / '+v.en:'');return JSON.stringify(v,null,1)}
const FIELD_NAME=k=>I18N['a_f_'+k]?A('f_'+k):k==='inter'?T('s_inter'):k==='hidden'?A('hide_drug'):k==='colors'?A('light')+' / '+A('dark'):k==='name'?A('name1'):k==='tagline'?A('tag_ar'):k==='logo'?A('logo'):k;
function interDiff(oldL,newL){
  const key=x=>(x.with&&x.with.en||'').toLowerCase(),o=new Map((oldL||[]).map(x=>[key(x),x])),n=new Map((newL||[]).map(x=>[key(x),x]));
  const card=(x,tag,cls)=>`<div class="inter ${esc(x.sev)}"><div class="grow"><b>${esc(LT(x.with))}</b><p>${esc(LT(x.desc))} ${x.r&&x.r.length?'['+esc(x.r.join(','))+']':''}</p></div><span class="sev ${cls}">${esc(tag)} · ${esc(T('sev_'+x.sev))}</span></div>`;
  const out=[];
  for(const [k,x] of n){const y=o.get(k);if(!y)out.push(card(x,A('d_added'),''));else if(JSON.stringify(x)!==JSON.stringify(y))out.push(card(x,A('d_changed'),''))}
  for(const [k,y] of o)if(!n.has(k))out.push(card(y,A('d_removed'),''));
  return out.length?`<div class="ilist">${out.join('')}</div>`:`<p class="hint">${esc(A('no_change'))}</p>`;
}
function diffHTML(c){const cur=current(c)||{};
  return `<div class="rrows">${Object.keys(c.data).map(k=>k==='inter'?`<div class="rrow"><b>${esc(FIELD_NAME(k))}</b>${interDiff(cur.inter,c.data.inter)}</div>`
    :k==='colors'?`<div class="rrow"><b>${esc(FIELD_NAME(k))}</b>${['light','dark'].map(m=>Object.entries((c.data.colors||{})[m]||{}).map(([t,v])=>`<div class="swrow"><span class="sw" data-sw="${isColor(v)?esc(v):''}"></span><span>${esc(tokName(t))} (${esc(A(m))})</span><code dir="ltr">${esc(v)}</code></div>`).join('')).join('')}</div>`
    :k==='logo'?`<div class="rrow"><b>${esc(FIELD_NAME(k))}</b>${isLogo(c.data.logo)?`<img src="${esc(c.data.logo)}" alt="" class="h48">`:''}</div>`
    :`<div class="rrow"><b>${esc(FIELD_NAME(k))}</b><div class="hint m0 strike">${esc(show(cur[k]))}</div><div>${esc(show(c.data[k]))}</div></div>`).join('')}</div>`}
async function memberNames(){const {data}=await SB.from('members').select('user_id,name,email');return Object.fromEntries((data||[]).map(m=>[m.user_id,m.name||m.email]))}

/* error reports sent by visitors: open the page, mark as handled */
async function reportsPane(){
  const {data,error}=await SB.from('reports').select('id,page,msg,lang,created_at').eq('status','new').order('id',{ascending:false}).limit(100);
  if(error)return pane().innerHTML=errBox(error);
  const name=pg=>{const [g,id]=pg.split('/');const d=(INDEX||[]).find(x=>x.id===id&&(g==='v'?x.g==='vit':x.g!=='vit'));return d?LT(d.n):pg};
  pane().innerHTML=`<section class="card"><h2><span class="ic">⚑</span>${esc(A('t_reports'))}<span class="cnt">${data.length}</span></h2><div class="ilist">${data.length?data.map(r=>`<div class="inter moderate"><div class="grow"><b>${esc(name(r.page))}</b><p>${esc(r.msg)}</p><p class="hint m0">${esc(String(r.created_at).slice(0,16).replace('T',' '))}</p></div>
    <div class="fields"><a class="btn" href="#/g/${r.page.startsWith('v/')?'vit':'ab'}/${esc(r.page)}">${esc(A('open_page'))}</a><button class="btn" type="button" data-done="${r.id}">${esc(A('done'))}</button></div></div>`).join(''):`<p class="hint">${esc(A('no_reports'))}</p>`}</div></section>`;
  $$('[data-done]').forEach(b=>b.onclick=async()=>{const {error}=await SB.rpc('report_done',{p_id:+b.dataset.done});if(error)return alert(error.message);reportsPane()});
}

/* publish: approved changes waiting, the note, the history with rollback */
async function publishPane(){
  const [{data:ready},{data:hist}]=await Promise.all([SB.from('changes').select('id,kind,key,data').eq('status','approved').order('id'),
    SB.from('history').select('version,note,published_at').order('id',{ascending:false}).limit(20)]);
  pane().innerHTML=`<section class="card"><h2><span class="ic">🚀</span>${esc(A('t_publish'))}<span class="cnt">${esc(A('ready_n').replace('{n}',(ready||[]).length))}</span></h2>
    <div class="ilist">${(ready||[]).map(c=>`<div class="inter minor"><div class="grow"><b>${esc(changeTitle(c))}</b></div></div>`).join('')}</div>
    <div class="fld mt10"><label for="pn">${esc(A('pub_note'))}</label><input id="pn" maxlength="300"></div>
    <button class="btn pri mt10 w100" id="pub"${(ready||[]).length?'':' disabled'}>${esc(A('publish'))}</button><div id="pmsg"></div></section>
  <section class="card mt16"><h2><span class="ic">🕘</span>${esc(A('history'))}</h2>
    <div class="ilist">${PUB?`<div class="inter"><div class="grow"><b>v${PUB.version} · ${esc(A('live_now'))}</b><p>${esc(PUB.note||'')} · ${esc(String(PUB.published_at).slice(0,16).replace('T',' '))}</p></div></div>`:''}
    ${(hist||[]).map(h=>`<div class="inter minor"><div class="grow"><b>v${h.version}</b><p>${esc(h.note||'')} · ${esc(String(h.published_at).slice(0,16).replace('T',' '))}</p></div><button class="btn" data-rb="${h.version}">${esc(A('rollback'))}</button></div>`).join('')}</div></section>`;
  $('#pub').onclick=async()=>{const note=$('#pn').value;if(!noTags(note))return alert(A('no_tags'));if(!confirm(A('pub_confirm')))return;
    $('#pub').disabled=true;const {data:v,error}=await SB.rpc('publish_site',{p_note:note});if(error){$('#pmsg').innerHTML=errBox(error);$('#pub').disabled=false;return}
    toast(A('published').replace('{v}',v));panel()};
  $$('[data-rb]').forEach(b=>b.onclick=async()=>{if(!confirm(A('rb_confirm').replace('{v}',b.dataset.rb)))return;
    const {error}=await SB.rpc('rollback_to',{p_version:+b.dataset.rb});if(error)return alert(error.message);toast(A('rolled'));panel()});
}

/* visual identity: colours (light and dark), name, tagline, logo; the page itself is the preview */
function brandPane(){
  const B=Object.assign({},window.BRAND||{}),cur=(PUB&&PUB.data&&PUB.data.brand)||{};
  const cs=getComputedStyle(document.documentElement);
  const val=(mode,t)=>(cur.colors&&cur.colors[mode]&&cur.colors[mode][t])||(mode==='light'?toHex(cs.getPropertyValue(t)):'');
  const row=(mode,t)=>{const v=val(mode,t);return `<div class="tokrow"><span class="tokn">${esc(tokName(t))}</span><input type="color" aria-label="${esc(tokName(t))}" data-c="${mode}:${t}" value="${esc(toHex(v)||'#888888')}"><input data-ct="${mode}:${t}" value="${esc(v)}" dir="ltr" placeholder="${esc(A('unchanged'))}" aria-label="${esc(tokName(t))}"></div>`};
  pane().innerHTML=`<section class="card"><h2><span class="ic">🎨</span>${esc(A('t_brand'))}</h2><p class="hint m0 mb10">${esc(A('brand_p'))}</p>
    <div class="kgrid p0">
      <div class="fld"><label for="bn1">${esc(A('name1'))}</label><input id="bn1" maxlength="15" value="${esc((cur.name||B.name||[])[0]||'')}" dir="ltr"></div>
      <div class="fld"><label for="bn2">${esc(A('name2'))}</label><input id="bn2" maxlength="15" value="${esc((cur.name||B.name||[])[1]||'')}" dir="ltr"></div>
      <div class="fld"><label for="bta">${esc(A('tag_ar'))}</label><input id="bta" maxlength="60" value="${esc(LT2(cur.tagline||B.tagline,'ar'))}"></div>
      <div class="fld"><label for="bte">${esc(A('tag_en'))}</label><input id="bte" maxlength="60" value="${esc(LT2(cur.tagline||B.tagline,'en'))}" dir="ltr"></div>
    </div>
    <div class="fld mt10"><label for="blogo">${esc(A('logo'))}</label><input id="blogo" type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg"><span class="hint m0">${esc(A('logo_h'))}</span></div>
    <div class="lbl">${esc(A('light'))}</div><div class="toks">${BRAND_TOKENS.light.map(t=>row('light',t)).join('')}</div>
    <div class="lbl">${esc(A('dark'))}</div><p class="hint m0 mb6">${esc(A('dark_h'))}</p><div class="toks">${BRAND_TOKENS.dark.map(t=>row('dark',t)).join('')}</div>
    <div class="fld mt10"><label for="bnote">${esc(A('note'))}</label><input id="bnote" maxlength="300"></div>
    <div class="acts two"><button class="btn pri" id="bsave">${esc(A('save_brand'))}</button><button class="btn" id="breset">${esc(A('undo_preview'))}</button></div><div id="bmsg"></div></section>`;
  let logo=null;
  const collect=()=>{const colors={light:{},dark:{}};
    $$('[data-ct]').forEach(i=>{const [m,t]=i.dataset.ct.split(':'),v=i.value.trim();if(v)colors[m][t]=v});
    return {name:[$('#bn1').value.trim(),$('#bn2').value.trim()],tagline:{ar:$('#bta').value.trim(),en:$('#bte').value.trim()},colors,...(logo?{logo}:{})}};
  const preview=()=>applyBrand(collect());
  $$('[data-c]').forEach(i=>i.oninput=()=>{const t=$(`[data-ct="${i.dataset.c}"]`);t.value=i.value;preview()});
  $$('[data-ct]').forEach(i=>i.oninput=()=>{if(isColor(i.value.trim()))preview()});
  ['#bn1','#bn2','#bta','#bte'].forEach(s=>$(s).oninput=preview);
  $('#blogo').onchange=()=>{const f=$('#blogo').files[0];if(!f)return;if(f.size>150000)return alert(A('logo_big'));
    const r=new FileReader();r.onload=()=>{logo=r.result;preview()};r.readAsDataURL(f)};
  $('#breset').onclick=()=>{applyBrand(cur);brandPane()};
  $('#bsave').onclick=async()=>{const d=collect(),note=$('#bnote').value;
    for(const m of ['light','dark'])for(const [t,v] of Object.entries(d.colors[m]))if(!isColor(v))return alert(A('bad_color')+' '+t);
    if(!d.name[0]||!noTags(JSON.stringify(d.name)+JSON.stringify(d.tagline)+note))return alert(A('no_tags'));
    const {error}=await SB.rpc('submit_change',{p_kind:'brand',p_key:'brand',p_data:d,p_note:note});
    $('#bmsg').innerHTML=error?errBox(error):`<p class="hint">${esc(A('brand_saved'))}</p>`};
}
const LT2=(o,l)=>o?(o[l]||''):'';
const TOKNAME={'--primary':['اللون الأساسي','Main colour'],'--primary-deep':['الأساسي الغامق','Main, deep'],'--primary-mid':['الأساسي المتوسط (الإطارات)','Main, mid (outlines)'],
  '--primary-soft':['الأساسي الفاتح (الخلفيات)','Main, soft (backgrounds)'],'--primary-tint':['الأساسي الفاتح جداً','Main, faint'],'--primary-text':['نصوص بلون الهوية','Text in the main colour'],
  '--on-primary':['النص فوق الأساسي','Text on the main colour'],'--highlight':['لون التمييز','Highlight'],'--highlight-text':['نصوص التمييز','Highlight text'],
  '--highlight-soft':['التمييز الفاتح','Highlight, soft'],'--on-highlight':['النص فوق التمييز','Text on the highlight'],'--bg':['خلفية الصفحة','Page background'],
  '--card':['البطاقات','Cards'],'--ink':['النص الرئيسي','Main text'],'--mute':['النص الثانوي','Secondary text'],'--line':['الحدود','Borders']};
const tokName=t=>TOKNAME[t]?L(TOKNAME[t][0],TOKNAME[t][1]):t;
function toHex(v){v=String(v||'').trim();if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();if(/^#[0-9a-f]{3}$/i.test(v))return '#'+v.slice(1).split('').map(c=>c+c).join('').toLowerCase();
  const m=v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);return m?'#'+[m[1],m[2],m[3]].map(n=>(+n).toString(16).padStart(2,'0')).join(''):''}

/* drugs: the pharmacist edits the label texts and interactions; the dose rules of the calculators are code with tests */
async function drugsPane(){
  const ab=(PUB&&PUB.data&&PUB.data.antibiotics)||[];
  pane().innerHTML=`<section class="card"><h2><span class="ic">💊</span>${esc(A('t_drugs'))}</h2><p class="hint m0 mb10">${esc(A('drugs_p'))}</p>
    <div class="fld"><label for="dsel">${esc(A('choose_drug'))}</label><select id="dsel"><option value="">—</option>${[...ab].sort((a,b)=>LT(a.n).localeCompare(LT(b.n),LANG)).map(d=>`<option value="${esc(d.id)}">${esc(LT(d.n))}${d.hidden?' ('+esc(A('hidden'))+')':''}</option>`).join('')}</select></div>
    <div id="dedit"></div></section>`;
  $('#dsel').onchange=()=>drugForm(ab.find(d=>d.id===$('#dsel').value));
}
function drugForm(d){
  const box=$('#dedit');if(!d){box.innerHTML='';return}
  const ta=(k,l)=>`<div class="fld"><label for="f_${k}_${l}">${esc(A('f_'+k))} · ${l==='ar'?'عربي':'English'}</label><textarea id="f_${k}_${l}" rows="3" dir="${l==='ar'?'rtl':'ltr'}" class="ta">${esc((d[k]||{})[l]||'')}</textarea></div>`;
  const irow=(i,x)=>`<div class="rrow" data-ir="${i}"><div class="kgrid p0">
    <div class="fld"><span class="fl">${esc(A('with'))} · عربي</span><input data-k="with.ar" value="${esc(x.with&&x.with.ar||'')}"></div>
    <div class="fld"><span class="fl">${esc(A('with'))} · English</span><input data-k="with.en" value="${esc(x.with&&x.with.en||'')}" dir="ltr"></div>
    <div class="fld"><span class="fl">${esc(A('effect'))} · عربي</span><input data-k="desc.ar" value="${esc(x.desc&&x.desc.ar||'')}"></div>
    <div class="fld"><span class="fl">${esc(A('effect'))} · English</span><input data-k="desc.en" value="${esc(x.desc&&x.desc.en||'')}" dir="ltr"></div>
    <div class="fld"><span class="fl">${esc(A('severity'))}</span><select data-k="sev">${['major','moderate','minor'].map(s=>`<option value="${s}"${x.sev===s?' selected':''}>${esc(T('sev_'+s))}</option>`).join('')}</select></div>
    <div class="fld"><span class="fl">${esc(A('src_ids'))}</span><input data-k="r" value="${esc((x.r||[]).join(','))}" dir="ltr" inputmode="numeric"></div></div>
    <button class="btn mt6" type="button" data-rm="${i}">${esc(A('remove'))}</button></div>`;
  let inter=JSON.parse(JSON.stringify(d.inter||[]));
  const draw=()=>{box.innerHTML=`<div class="fields mt12">${DRUG_FIELDS.map(k=>ta(k,'ar')+ta(k,'en')).join('')}</div>
    <div class="lbl">${esc(T('s_inter'))}</div><div class="rrows" id="irows">${inter.map((x,i)=>irow(i,x)).join('')}</div>
    <button class="btn mt8" type="button" id="iadd">${esc(A('add_inter'))}</button>
    <label class="chk"><input type="checkbox" id="dhid"${d.hidden?' checked':''}> ${esc(A('hide_drug'))}</label>
    <div class="fld"><label for="dnote">${esc(A('note_src'))}</label><input id="dnote" maxlength="300"></div>
    <button class="btn pri mt10 w100" id="dsave">${esc(ME.role==='owner'?A('save_owner'):A('send_review'))}</button><div id="dmsg"></div>`;
    const read=()=>{inter=$$('#irows [data-ir]').map(r=>{const o={with:{},desc:{}};r.querySelectorAll('[data-k]').forEach(e=>{const [a,b]=e.dataset.k.split('.');if(b)o[a][b]=e.value.trim();else o[a]=a==='r'?e.value.split(',').map(s=>parseInt(s,10)).filter(n=>n>0):e.value});return o})};
    $('#iadd').onclick=()=>{read();inter.push({with:{ar:'',en:''},desc:{ar:'',en:''},sev:'moderate',r:[]});draw()};
    $$('[data-rm]').forEach(b=>b.onclick=()=>{read();inter.splice(+b.dataset.rm,1);draw()});
    $('#dsave').onclick=async()=>{read();const data={};
      for(const k of DRUG_FIELDS){const v={ar:$(`#f_${k}_ar`).value.trim(),en:$(`#f_${k}_en`).value.trim()};if(JSON.stringify(v)!==JSON.stringify({ar:(d[k]||{}).ar||'',en:(d[k]||{}).en||''}))data[k]=v}
      if(inter.some(x=>!x.with.ar||!x.with.en||!x.desc.ar||!x.desc.en))return alert(A('inter_fill'));
      if(JSON.stringify(inter)!==JSON.stringify(d.inter||[]))data.inter=inter;
      if(!!$('#dhid').checked!==!!d.hidden)data.hidden=$('#dhid').checked;
      const note=$('#dnote').value;
      if(!Object.keys(data).length)return alert(A('no_change'));
      if(!noTags(JSON.stringify(data)+note))return alert(A('no_tags'));
      const {error}=await SB.rpc('submit_change',{p_kind:'drug',p_key:d.id,p_data:data,p_note:note});
      $('#dmsg').innerHTML=error?errBox(error):`<p class="hint">${esc(ME.role==='owner'?A('saved_owner'):A('sent'))}</p>`};
  };
  draw();
}

/* a pharmacist's own changes and their state */
async function minePane(){
  const {data,error}=await SB.from('changes').select('id,kind,key,status,created_at,review_note').order('id',{ascending:false}).limit(50);
  if(error)return pane().innerHTML=errBox(error);
  pane().innerHTML=`<section class="card"><h2><span class="ic">📝</span>${esc(A('t_mine'))}</h2><div class="ilist">${data.length?data.map(c=>`<div class="inter ${c.status==='rejected'?'major':c.status==='pending'?'moderate':''}"><div class="grow"><b>${esc(changeTitle(Object.assign({data:{}},c)))}</b><p>${esc(String(c.created_at).slice(0,16).replace('T',' '))}${c.review_note?' · '+esc(c.review_note):''}</p></div><span class="sev">${esc(A('s_'+c.status))}</span></div>`).join(''):`<p class="hint">${esc(A('none_yet'))}</p>`}</div></section>`;
}

/* team: members, invitations, stop or restore an account */
async function teamPane(){
  const [{data:mem},{data:inv}]=await Promise.all([SB.from('members').select('user_id,email,name,role,active,created_at').order('created_at'),SB.rpc('pending_invites')]);
  pane().innerHTML=`<section class="card"><h2><span class="ic">👥</span>${esc(A('t_team'))}</h2><div class="ilist">${(mem||[]).map(m=>`<div class="inter${m.active?'':' major'}"><div class="grow"><b>${esc(m.name||m.email)}</b><p dir="ltr" class="ta-s">${esc(m.email)}</p></div><span class="sev">${esc(A('r_'+m.role))}</span>${m.user_id===ME.user_id?'':`<button class="btn" data-act="${m.user_id}" data-on="${m.active?0:1}">${esc(m.active?A('stop'):A('restore'))}</button>`}</div>`).join('')}</div>
    ${(inv||[]).length?`<div class="lbl">${esc(A('invited'))}</div><div class="ilist">${inv.map(i=>`<div class="inter minor"><div class="grow"><b>${esc(i.name||i.email)}</b><p dir="ltr" class="ta-s">${esc(i.email)}</p></div><span class="sev">${esc(A('r_'+i.role))}</span></div>`).join('')}</div>`:''}
    <div class="lbl">${esc(A('invite'))}</div><div class="kgrid p0">
      <div class="fld"><label for="ie">${esc(A('email'))}</label><input id="ie" type="email" dir="ltr"></div>
      <div class="fld"><label for="in">${esc(A('name'))}</label><input id="in" maxlength="80"></div></div>
    <button class="btn pri mt10 w100" id="ibtn">${esc(A('invite_b'))}</button><p class="hint">${esc(A('invite_h'))}</p></section>`;
  $('#ibtn').onclick=async()=>{const email=$('#ie').value.trim(),name=$('#in').value.trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return alert(A('bad_email'));if(!noTags(name))return alert(A('no_tags'));
    const {error}=await SB.rpc('invite_member',{p_email:email,p_role:'pharmacist',p_name:name});if(error)return alert(error.message);toast(A('invited_ok'));teamPane()};
  $$('[data-act]').forEach(b=>b.onclick=async()=>{const {error}=await SB.rpc('set_member_active',{p_user:b.dataset.act,p_active:b.dataset.on==='1'});if(error)return alert(error.message);teamPane()});
}
