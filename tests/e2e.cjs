const {chromium,devices}=require('playwright');
const B=process.env.BASE||'http://127.0.0.1:8765/',out=(process.env.OUT||require('path').join(__dirname,'shots'))+'/';
require('fs').mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const errs=[];let ok=0;
 const chk=(c,m)=>{if(c)ok++;else errs.push('FAIL '+m)};
 for(const [n,o] of [['phone',{...devices['iPhone 13']}],['ipad',{...devices['iPad (gen 7)']}],['desktop',{viewport:{width:1440,height:900}}]]){
  const c=await b.newContext({...o,deviceScaleFactor:1});const p=await c.newPage();
  p.on('pageerror',e=>errs.push(n+' pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(n+' console: '+m.text())});
  await p.goto(B,{waitUntil:'networkidle'});
  chk(await p.locator('.gcard').count()===5,n+' 5 group cards');
  await p.screenshot({path:out+n+'-home.png',fullPage:true});
  for(const [q,want] of [['amoxicilin','Amoxicillin'],['اموكسلين','أموكسيسيلين'],['سبروفلوكساسين','سيبروفلوكساسين'],['azitromycin','Azithromycin']]){
    await p.fill('#q',q);await p.waitForTimeout(60);chk((await p.locator('#sres a').first().innerText()).includes(want),n+' typo «'+q+'» finds '+want)}
  await p.fill('#q','اموكس');await p.waitForTimeout(100);
  chk(await p.locator('#sres a').count()>=2,n+' search finds amoxicillin (no hamza)');
  await p.locator('#sres a').first().click();await p.waitForSelector('#result .rbody');
  await p.fill('#val','15');await p.waitForTimeout(50);
  const big=await p.locator('#result .big').innerText();chk(big.includes('337.5'),n+' amox 15 kg severe = 337.5 mg, got '+big);
  const mls=await p.locator('.rbody > table.ml td.v').allInnerTexts();chk(mls.length===2&&mls[0].includes('8.4')&&mls[1].includes('4.2'),n+' mL 8.4 / 4.2: '+mls);
  if(n==='phone'){
   // review line, reconstitution water, patient card (label 2.6, Table 3)
   const head=await p.locator('.revline').innerText();chk(head.includes('2026-11-10')&&head.includes('2026-07-07'),'review date and label date shown: '+head);
   await p.click('details.recon summary');const rec=await p.locator('details.recon').innerText();chk(rec.includes('36')&&rec.includes('76'),'water for 400 mg/5 mL 50 mL = 36 mL, 200 mg/5 mL 100 mL = 76 mL');
   await p.click('#bcard');await p.waitForSelector('.pcard');let card=await p.locator('.pcard').innerText();
   chk(card.includes('4.2')&&card.includes('400 mg / 5 mL')&&card.includes('رجّ'),'patient card: 4.2 mL of 400 mg/5 mL, shake well');
   await p.click('[data-pk="200"]');card=await p.locator('.pcard').innerText();chk(card.includes('8.4'),'patient card: 200 mg/5 mL gives 8.4 mL');
   await p.click('[data-cl="en"]');card=await p.locator('.pcard').innerText();chk(card.includes('Shake the bottle')&&card.includes('every 12 hours'),'patient card in English');
   await p.screenshot({path:out+'phone-card.png'});await p.click('#pcclose');chk(!(await p.$('#sheet')),'card closes');
  }
  await p.screenshot({path:out+n+'-amox.png',fullPage:true});
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);chk(sw<=0,n+' no sideways scroll ('+sw+')');
  if(n==='phone'){
   await p.click('[data-mode="y"]');await p.fill('#val','2');await p.waitForTimeout(50);
   chk((await p.locator('#est').innerText()).includes('11.8'),'age 2 y -> WHO median 11.8 kg (boys 12.15, girls 11.48)');
   await p.click('[data-mode="m"]');await p.fill('#val','2');await p.waitForTimeout(50);
   chk((await p.locator('#result .warn').first().innerText()).includes('30'),'2 months -> infant 30 mg/kg/day');
   await p.click('[data-mode="w"]');await p.fill('#val','70');await p.waitForTimeout(50);
   const t=await p.locator('#result').innerText();chk(/Kidney|الكلى/.test(t)&&/أدخل وظائف الكلى/.test(t),'70 kg adult: kidney row asks for data, never "no change"');
   await p.click('#kid summary');await p.fill('#kage','60');await p.selectOption('#ksex','f');await p.fill('#kht','160');await p.fill('#kscr','1.0');await p.fill('#val','60');await p.waitForTimeout(50);
   const t2=await p.locator('#result').innerText();chk(t2.includes('57 '),'CrCl 60y F 60kg 160cm SCr1 = 57: '+t2.slice(0,300));
   await p.selectOption('#kscru','um');await p.fill('#kscr','265');await p.waitForTimeout(50);
   const t3=await p.locator('#result').innerText();chk(/250 ملغ كل 12/.test(t3),'SCr 265 µmol/L (=3 mg/dL) -> CrCl<30 -> 250 mg q12h');
   await p.screenshot({path:out+'phone-adult.png',fullPage:true});
   await p.goto(B+'#/d/cipro');await p.waitForSelector('#result .rbody');await p.screenshot({path:out+'phone-cipro.png',fullPage:true});
   await p.goto(B+'#/inter');await p.fill('#iq','سيبرو');await p.locator('[data-add]').first().click();await p.fill('#iq','دوكسي');await p.locator('[data-add]').first().click();
   chk(await p.locator('#ires .inter').count()>0,'interaction checker lists interactions');await p.screenshot({path:out+'phone-inter.png',fullPage:true});
   // group screens: each group has its own tabs
   await p.goto(B+'#/g/ab');await p.waitForSelector('#q');chk(await p.locator('#tabs a').count()===5,'antibiotics: 4 tabs + groups');chk(await p.locator('#sres a').count()===100,'antibiotics calculator lists 100 drugs');
   await p.screenshot({path:out+'phone-group-ab.png'});
   await p.goto(B+'#/g/ab/drugs');await p.waitForSelector('[data-cls]');chk(await p.locator('#dlist a').count()===100,'drugs by class: 100');
   await p.fill('#dlq','سيبرو');chk(await p.locator('#dlist a:not([hidden])').count()===1,'drug list filter');
   await p.goto(B+'#/g/ab/src');await p.waitForSelector('.ref-item');chk(await p.locator('.ref-item').count()===126,'antibiotic sources only');
   await p.goto(B+'#/g/vit');await p.waitForSelector('.gcard');chk(await p.locator('.gcard').count()===13&&await p.locator('#tabs a').count()===4,'vitamins: 13 calculators, 3 tabs + groups');
   await p.goto(B+'#/g/vit/inter');await p.waitForSelector('.inter');chk(await p.locator('.inter').count()===13,'vitamin interactions: 13');
   await p.goto(B+'#/g/vit/src');await p.waitForSelector('.ref-item');chk(await p.locator('.ref-item').count()===52,'vitamin sources only');
   await p.goto(B+'#/g/ah');await p.waitForSelector('.ghead');chk((await p.innerText('#app')).includes('قيد الإعداد'),'a group not ready says soon');
   // analgesics: children by the label chart or mg/kg, adults by the rules
   await p.goto(B+'#/g/an/d/paracetamol');await p.waitForSelector('#val');await p.evaluate(()=>{PT.age='';PT.scr='';PT.ht='';PT.sex='';calc()});await p.click('[data-mode="w"]');await p.fill('#val','14');await p.waitForTimeout(60);
   let ta=await p.innerText('#result');chk(ta.includes('160')&&/5 مل/.test(ta)&&ta.includes('5 مرات'),'paracetamol 14 kg: 160 mg = 5 mL, max 5 times: '+ta.slice(0,160));
   await p.fill('#conc','120');await p.click('#concadd');ta=await p.innerText('#result');chk(ta.includes('6.7'),'added 120 mg/5 mL strength: 6.7 mL');
   await p.screenshot({path:out+'phone-paracetamol.png',fullPage:true});
   await p.click('[data-mode="m"]');await p.fill('#val','9');await p.waitForTimeout(60);ta=await p.innerText('#result');chk(ta.includes('15 ملغ لكل كغ')&&ta.includes('4 مرات'),'paracetamol 9 months: 15 mg/kg (WHO), max 4 doses');
   await p.fill('#val','2');await p.waitForTimeout(60);chk((await p.innerText('#result')).includes('الطبيب'),'paracetamol 2 months: doctor');
   await p.click('[data-mode="y"]');await p.fill('#val','30');await p.waitForTimeout(60);ta=await p.innerText('#result');chk(ta.includes('1000 ملغ كل 6 ساعات')&&ta.includes('3000'),'paracetamol adult 30 years: 1000 mg q6h, 3000 mg/day');
   await p.goto(B+'#/g/an/d/ibuprofen');await p.waitForSelector('#val');await p.click('[data-mode="m"]');await p.fill('#val','12');await p.waitForTimeout(60);
   ta=await p.innerText('#result');chk(ta.includes('5 ملغ لكل كغ'),'ibuprofen 12 months fever: 5 mg/kg');
   await p.check('#hot');await p.waitForTimeout(60);chk((await p.innerText('#result')).includes('10 ملغ لكل كغ'),'ibuprofen fever 39.2: 10 mg/kg');
   await p.screenshot({path:out+'phone-ibuprofen.png',fullPage:true});
   await p.click('[data-mode="y"]');await p.fill('#val','6');await p.waitForTimeout(60);ta=await p.innerText('#result');chk(ta.includes('200')&&/10 مل/.test(ta),'ibuprofen 6 years: 200 mg = 10 mL');
   await p.click('#bcard');await p.waitForSelector('.pcard');await p.click('[data-cl="ar"]');ta=await p.innerText('.pcard');chk(ta.includes('10 مل')&&ta.includes('4 مرات')&&!ta.includes('أكمل المدة'),'ibuprofen patient card (no antibiotic course advice)');await p.click('#pcclose');
   await p.goto(B+'#/g/an/drugs');await p.waitForSelector('[data-cls]');chk(await p.locator('#dlist a').count()===8,'analgesics list: 8');
   await p.goto(B+'#/g/an/src');await p.waitForSelector('.ref-item');chk(await p.locator('.ref-item').count()===14,'analgesic sources only: 14');
   await p.goto(B+'#/g/an/d/naproxen');await p.waitForSelector('#val');await p.click('[data-mode="y"]');await p.fill('#val','40');await p.waitForTimeout(60);
   ta=await p.innerText('#result');chk(ta.includes('500 ملغ أولاً')&&ta.includes('1250'),'naproxen adult pain dose');
   await p.goto(B+'#/g/an/d/ketorolac');await p.waitForSelector('#val');ta=await p.innerText('#result');chk(ta.includes('استكمالاً'),'ketorolac: tablets only after IV/IM');
   await p.goto(B+'#/g/an/d/aspirin');await p.waitForSelector('#val');await p.click('[data-mode="y"]');await p.fill('#val','10');await p.waitForTimeout(60);
   ta=await p.innerText('#result');chk(ta.includes('16 سنة')&&ta.includes('راي'),'aspirin child: Reye warning');
   await p.goto(B+'#/d/amox');await p.waitForSelector('.ghead');chk(p.url().includes('#/g/ab/d/amox'),'old drug links still work');
   await p.goto(B+'#/src');await p.waitForSelector('.ref-item');chk(await p.locator('.ref-item').count()===126+14+52,'126 antibiotic + 14 analgesic + 52 vitamin sources');
   await p.goto(B+'#/v/d');await p.waitForSelector('#vform');await p.fill('#age','40');await p.fill('#dlab','12');await p.waitForTimeout(50);
   chk((await p.locator('#result').innerText()).includes('50,000'),'vitamin D 40 y, 12 ng/mL -> 50,000 IU weekly');await p.screenshot({path:out+'phone-vitd.png',fullPage:true});
   await p.goto(B+'?lang=en#/v/fe');await p.waitForSelector('#vform');await p.fill('#age','30');await p.fill('#hb','10.5');await p.fill('#fer','8');await p.waitForTimeout(50);
   chk(/elemental iron/i.test(await p.locator('#result').innerText()),'iron in English');await p.screenshot({path:out+'phone-iron-en.png',fullPage:true});
   await p.goto(B+'?lang=ar#/');
   await p.goto(B+'?lang=en#/d/amox');await p.waitForSelector('#result');await p.fill('#val','15');await p.waitForTimeout(50);
   chk((await p.locator('html').getAttribute('dir'))==='ltr','english is ltr');await p.screenshot({path:out+'phone-amox-en.png',fullPage:true});
   // every one of the 100 drugs opens and gives a result for a 70 kg adult with kidney data
   const ids=await p.evaluate(()=>fetch('data/index.json').then(r=>r.json()).then(x=>x.filter(d=>d.g==='ab').map(d=>d.id)));let bad=[];
   for(const id of ids){await p.goto(B+'#/d/'+id);await p.waitForSelector('#val');await p.fill('#val','70');
     if(await p.locator('#kage').count()){await p.evaluate(()=>document.querySelector('#kid').open=true);await p.fill('#kage','50');await p.selectOption('#ksex','m');await p.fill('#kht','175');await p.fill('#kscr','1');}
     await p.waitForTimeout(10);const tx=await p.locator('#result').innerText();if(!tx||tx.includes('—\n')||/undefined|NaN/.test(tx))bad.push(id)}
   chk(!bad.length,'all 100 drugs give a result: bad='+bad);
  }
  await c.close()}
 console.log('ok',ok);console.log(errs.length?errs.join('\n'):'no errors');await b.close();process.exit(errs.length?1:0)})();
