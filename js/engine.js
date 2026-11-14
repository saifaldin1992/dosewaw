/* DOSEWAW · js/engine.js — dose calculation, no page code (also run by the tests).
   Adult rules: the BIOTICWAW engine unchanged in logic (js/rules/antibiotics.js = ABC_RULES):
   ordered rules per row, the first rule whose `when` matches gives the text.
   Children: weight-based specs in js/rules/peds.js (PEDS), every number from the named label.
   Weight estimate from age: WHO medians (data/who_wfa.json). */
const ABC_SRC = {cg:'Cockcroft DW, Gault MH. Nephron 1976;16:31–41'};

/* ideal body weight (Devine) and the weight used for Cockcroft-Gault: actual, or adjusted when actual is over 120% of ideal */
function abWeights(sex,wKg,hCm){
  if(!(wKg>0))return null;
  if(!(hCm>0)||!sex)return {act:wKg,ibw:null,adj:null,obese:false};
  const ibw=(sex==='m'?50:45.5)+2.3*(hCm/2.54-60);
  const adj=wKg>1.2*ibw?ibw+0.4*(wKg-ibw):wKg;
  return {act:wKg,ibw,adj,obese:wKg>1.2*ibw};
}
/* MDRD eGFR (mL/min/1.73 m²); the race factor is not used */
function abEgfr(age,sex,scr){return age>0&&scr>0?175*Math.pow(scr,-1.154)*Math.pow(age,-0.203)*(sex==='f'?0.742:1):null}
/* Cockcroft-Gault creatinine clearance (mL/min) */
function abCrCl(age,sex,wKg,hCm,scr){
  if(!(age>=0&&wKg>0&&hCm>0&&scr>0&&sex))return null;
  const W=abWeights(sex,wKg,hCm);
  const v=(140-age)*W.adj/(72*scr)*(sex==='f'?0.85:1);
  return {crcl:v, weight:W.adj, ibw:W.ibw, obese:W.obese};
}
const abIn=(v,b)=>v!=null&&!Number.isNaN(v)&&(b.gt===undefined||v>b.gt)&&(b.gte===undefined||v>=b.gte)&&(b.lt===undefined||v<b.lt)&&(b.lte===undefined||v<=b.lte);
function abMatch(when,x,ctx){
  for(const key of Object.keys(when)){
    if(key==='crcl'){if(!abIn(ctx.cr,when.crcl))return false}
    else if(key==='age'){if(!abIn(ctx.age,when.age))return false}
    else if(key==='wt'){if(!abIn(ctx.wt,when.wt))return false}
    else if(key==='egfr'){if(!abIn(ctx.egfr,when.egfr))return false}
    else if(Array.isArray(when[key])){if(!when[key].includes(x[key]))return false}
    else if(x[key]!==when[key]) return false;
  }
  return true;
}
/* keys of a rule that need patient data the pharmacist may not have entered yet */
const NEEDS={crcl:'kidney',egfr:'kidney',age:'age',wt:'weight'};
const ruleNeeds=r=>{const n=Object.keys(r.when).filter(k=>NEEDS[k]).map(k=>NEEDS[k]);if(/\{scrx:/.test(r.text.en))n.push('kidney');if(/\{mgkg:/.test(r.text.en))n.push('weight');return n};
const abRound=v=>v>=500?Math.round(v/10)*10:v>=20?Math.round(v/5)*5:Math.round(v*10)/10;
function abFill(t,ctx){
  t=String(t).replace(/\{scrx:([\d.]+)\}/g,(m,n)=>ctx&&ctx.scr>0?String(Math.round(ctx.scr*+n)):'—');
  return t.replace(/\{mgkg:([\d.]+)(?:-([\d.]+))?(?:@(act|ibw|adj|adj25|lean))?(?:\|max:([\d.]+))?\}/g,(m,a,b,basis,max)=>{
    const W=ctx&&ctx.W;if(!W)return '—';
    const needH=basis&&basis!=='act'&&W.ibw==null; if(needH)return '—';
    const w=basis==='ibw'?W.ibw:basis==='adj'?W.adj:basis==='adj25'?(W.act>=1.25*W.ibw?W.ibw+0.4*(W.act-W.ibw):W.act):basis==='lean'?(W.obese?W.ibw:W.act):W.act, cap=v=>max?Math.min(v,+max):v;
    const lo=abRound(cap(+a*w));return b?lo+'–'+abRound(cap(+b*w)):String(lo);
  });
}
/* evaluate a drug. have = which patient data exist ({kidney, age, weight}). Rules are read in order: a rule that
   needs missing data stops the row and marks it {need:[...]}, so a missing creatinine never reads as «no change». */
function abEval(rule,x,ctx,have){
  have=have||{kidney:ctx.cr!=null,age:ctx.age!=null,weight:!!ctx.W};
  const rows=[];
  for(const row of rule.rows){
    let hit=null,need=null;
    for(const r of row.rules){
      const miss=ruleNeeds(r).filter(n=>!have[n]);
      const keys=Object.keys(r.when).filter(k=>!NEEDS[k]);
      // a rule whose own answers already fail cannot match whatever the missing data is: skip it
      if(miss.length&&!keys.every(k=>abMatch({[k]:r.when[k]},x,ctx)))continue;
      if(miss.length){need=[...new Set(miss)];break}
      if(abMatch(r.when,x,ctx)){hit=r;break}
    }
    if(need){if(!row.warn&&!row.opt)rows.push({k:row.k,need,strong:!!row.strong});continue}
    if(!hit) continue;
    rows.push({k:row.k,v:{ar:abFill(hit.text.ar,ctx),en:abFill(hit.text.en,ctx)},strong:!!row.strong,warn:!!(row.warn||hit.warn)});
  }
  return {rows,notes:rule.notes};
}

/* WHO weight-for-age median (kg) for an age in months (0–120); sex 'm', 'f' or '' (average of both) */
function wfaWeight(tab,months,sex){
  if(!tab||!(months>=0)||months>120)return null;
  const at=arr=>{const i=Math.floor(months),f=months-i;return i>=120?arr[120]:arr[i]+(arr[i+1]-arr[i])*f};
  if(sex==='m')return at(tab.boys); if(sex==='f')return at(tab.girls);
  return (at(tab.boys)+at(tab.girls))/2;
}

/* children, weight-based: spec from PEDS. P = {W, months|null, infant:boolean}; s = {ind, every}
   returns {adult:true,...} from adultKg up, else the mg dose per administration and mL per suspension strength. */
function pedsCalc(spec,P,s){
  const ind=spec.inds.find(i=>i.id===s.ind)||spec.inds[0];
  let every=spec.freq.includes(s.every)?s.every:spec.freq[0];
  if(P.W>=spec.adultKg&&!P.infant){const a=ind.adult[every];return {adult:true,mg:a[0],text:a[1],every,daily:a[0]*24/every,ref:spec.adultRef}}
  let mgkgday=ind.mgkgday[every],notes=[],ref=spec.ref;
  if(spec.infant&&P.infant){mgkgday=spec.infant.mgkgday;every=spec.infant.every;ref=spec.infant.ref;notes.push({k:'infant',v:spec.infant})}
  let mg=P.W*mgkgday/(24/every);
  const cap=ind.adult[every]?ind.adult[every][0]:null;
  if(cap&&mg>cap){mg=cap;notes.push({k:'cap',v:cap})}
  const ml=(spec.susp||[]).map(c=>({c,ml:mg*5/c}));
  return {adult:false,mg,every,mgkgday,daily:mg*24/every,ml,notes,ref};
}
/* the strength whose volume per dose is easiest to measure: closest to 5 mL, never under 1 mL when another exists */
function easiest(ml){if(!ml.length)return null;const ok=ml.filter(x=>x.ml>=1);const pool=ok.length?ok:ml;return pool.reduce((b,x)=>Math.abs(x.ml-5)<Math.abs(b.ml-5)?x:b,pool[0]).c}
/* round a volume to what a syringe can measure: 0.1 mL under 10 mL, 0.5 mL from 10 mL */
const mlRound=v=>v<10?Math.round(v*10)/10:Math.round(v*2)/2;

if(typeof module!=='undefined')module.exports={abWeights,abEgfr,abCrCl,abMatch,abEval,abFill,abRound,wfaWeight,pedsCalc,easiest,mlRound};

/* children's doses of the analgesics group (js/rules/bands.js). P = {W (kg), months|null, infant(bool)}; x = answers (why, hot).
   With an age, the chart row is chosen by age; with a weight only, by weight in pounds (the U.S. charts are in lb).
   Returns {kind, seg, mg, mgkg, everyH, maxDoses|maxDay, ml:[{c,ml}], row} — or {kind:'doctor'|'adult', seg}. */
const LB=2.20462;
function bandCalc(spec,P,x,extra){
  x=x||{};const lb=P.W?P.W*LB:null,m=P.months;
  const inR=(v,r)=>v!=null&&v>=r[0]&&v<r[1];
  let seg=null;
  if(P.infant)seg=spec.segs.find(s=>s.kind==='doctor');
  if(!seg&&m!=null)seg=spec.segs.find(s=>inR(m,s.ageM));
  if(!seg&&lb!=null)seg=spec.segs.find(s=>s.lb&&inR(Math.floor(lb),s.lb));
  if(!seg)return spec.ageOnly&&m==null?{kind:'needAge'}:null;
  if(seg.kind==='doctor'||seg.kind==='adult')return {kind:seg.kind,seg};
  const strengths=[...spec.strengths.map(s=>s.c),...(extra||[]).filter(c=>c>0&&!spec.strengths.some(s=>s.c===c))];
  const ml=mg=>strengths.map(c=>({c,ml:mg*5/c}));
  if(seg.kind==='chart'){
    const row=m!=null?seg.rows.find(r=>Math.floor(m/12)>=r.age[0]&&Math.floor(m/12)<=r.age[1]):seg.rows.find(r=>Math.floor(lb)>=r.lb[0]&&Math.floor(lb)<=r.lb[1]);
    if(!row)return null;
    return {kind:'chart',seg,row,mg:row.mg,mg2:row.mg2,everyH:seg.everyH,maxDoses:seg.maxDoses,ml:ml(row.mg),ml2:row.mg2?ml(row.mg2):null,by:m!=null?'age':'weight'};
  }
  // mg per kg (needs a weight: actual, or estimated from age by the page)
  if(!P.W)return {kind:'needW',seg};
  let mgkg=seg.mgkg;
  if(seg.mgkgBy){const hit=seg.mgkgBy.find(r=>Object.keys(r.when).every(k=>x[k]===r.when[k]));mgkg=hit.mgkg}
  let mg=P.W*mgkg,capped=false;
  if(seg.maxMg&&mg>seg.maxMg){mg=seg.maxMg;capped=true}
  const maxDay=seg.maxMgkgDay?P.W*seg.maxMgkgDay:null;
  return {kind:'mgkg',seg,mgkg,mg,capped,everyH:seg.everyH,maxDoses:seg.maxDoses,maxDay,ml:ml(mg)};
}
if(typeof module!=='undefined')Object.assign(module.exports,{bandCalc,LB});
