// Vitamin calculators: the medical regression cases of VITAWAW (tests/vitamin_cases.json, each checked against its cited
// source there), run on the DOSEWAW vitamin pages. Run: python3 -m http.server 8765 &  then  node tests/vitamin_cases.cjs
const {chromium}=require('playwright');
const B=process.env.BASE||'http://127.0.0.1:8765/';
const CASES=require('./vitamin_cases.json');
const SEL=['feg','folg','czg','tri','feed','vag','fetri','bsp','thg'],CHK=['infl','pre','ntd','lowca','veg','banem'];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 let fails=0;
 for(const c of CASES){
  await p.goto(B+'?lang=ar#/v/'+c.k);await p.waitForSelector('#vform');
  // a fresh patient for every case
  await p.evaluate(()=>{for(const k in VPT)delete VPT[k];document.querySelectorAll('#vform input').forEach(i=>{if(i.type==='checkbox')i.checked=false;else i.value=''})});
  for(const [f,v] of Object.entries(c.f)){
    if(SEL.includes(f))await p.selectOption('#'+f,String(v));
    else if(CHK.includes(f))await p.check('#'+f);
    else await p.fill('#'+f,String(v));
  }
  if(await p.isVisible('#sex'))await p.selectOption('#sex',c.sex);
  await p.evaluate(()=>vitCalc(location.hash.split('/')[2]));
  const txt=await p.innerText('#result');const ok=txt.includes(c.want);fails+=!ok;
  console.log((ok?'ok   ':'FAIL ')+c.k+' '+JSON.stringify(c.f)+' '+c.sex+' -> «'+c.want+'»');
  if(!ok)console.log('     got:',txt.slice(0,240).replace(/\n/g,' | '));
 }
 console.log('cases',CASES.length,'failed',fails,'page errors',errs.length?errs:'none');
 await b.close();process.exit(fails||errs.length?1:0)})();
