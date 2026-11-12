// Owner panel, end to end with tests/fake_supabase.js: sign-up by invitation, seed, brand preview and save,
// drug edit, pharmacist change waiting for review, approve, publish, rollback.
// Run: python3 -m http.server 8765 &  then  node tests/admin_flow.cjs
const {chromium,devices}=require('playwright');
const fs=require('fs'),path=require('path');
const B=process.env.BASE||'http://127.0.0.1:8765/',out=(process.env.OUT||path.join(__dirname,'shots'))+'/';
fs.mkdirSync(out,{recursive:true});
const FAKE=fs.readFileSync(path.join(__dirname,'fake_supabase.js'),'utf8');
(async()=>{const b=await chromium.launch();const c=await b.newContext({...devices['iPhone 13']});const p=await c.newPage();
 const errs=[];let ok=0;const chk=(v,m)=>{if(v)ok++;else errs.push('FAIL '+m)};
 p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('dialog',d=>{if(d.type()==='alert')errs.push('alert: '+d.message());d.accept()});
 await p.route('**/supabase-js@2.45.4/**',r=>r.fulfill({body:FAKE,contentType:'text/javascript'}));
 await p.route('**/js/config.js*',r=>r.fulfill({body:'window.DW_CFG={url:"https://fake",anon:"x",test:true};',contentType:'text/javascript'}));
 const go=async h=>{await p.goto(B+'#/'+h);await p.waitForTimeout(300)};
 // the owner creates the account (invited), signs in, seeds
 await go('admin');await p.waitForSelector('#lf');
 await p.click('#lsw');await p.waitForSelector('#lp2');const su=async(e,pw)=>{await p.fill('#le',e);await p.fill('#lp',pw);await p.fill('#lp2',pw);await p.click('#lf button[type=submit]')};
 await su('stranger@x.com','password123');await p.waitForTimeout(200);
 chk((await p.innerText('#lmsg')).includes('غير مدعو'),'a stranger cannot create an account');
 await su('owner@x.com','password123');await p.waitForSelector('#seed');chk(true,'owner account created');
 await p.screenshot({path:out+'admin-seed.png',fullPage:true});
 await p.click('#seed');await p.waitForSelector('[data-at="review"]');
 chk((await p.innerText('#app')).includes('1'),'seeded: version 1');
 // brand: preview changes the page at once, then save
 await p.click('[data-at="brand"]');await p.waitForSelector('#bsave');
 await p.fill('[data-ct="light:--primary"]','#12305C');await p.dispatchEvent('[data-ct="light:--primary"]','input');
 chk((await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--primary').trim().toLowerCase()))==='#12305c','brand preview applies the colour');
 await p.fill('#bn2','PLUS');await p.dispatchEvent('#bn2','input');chk((await p.innerText('#bname')).includes('PLUS'),'brand preview changes the name');
 await p.screenshot({path:out+'admin-brand.png',fullPage:true});
 await p.click('#bsave');await p.waitForTimeout(200);chk((await p.innerText('#bmsg')).length>0&&!(await p.innerText('#bmsg')).includes('خطأ'),'brand saved');
 // owner edits a drug (approved at once)
 await p.click('[data-at="drugs"]');await p.waitForSelector('#dsel');await p.selectOption('#dsel','amox');await p.waitForSelector('#f_timing_ar');
 await p.fill('#f_timing_ar','يُؤخذ مع بداية الوجبة.');await p.fill('#dnote','DailyMed 2026-07-07');await p.click('#dsave');await p.waitForTimeout(200);
 chk((await p.innerText('#dmsg')).includes('معتمد'),'owner drug edit approved');
 // invite a pharmacist
 await p.click('[data-at="team"]');await p.waitForSelector('#ibtn');await p.fill('#ie','ph@x.com');await p.fill('#in','صيدلي');await p.click('#ibtn');await p.waitForTimeout(200);
 chk((await p.innerText('#apane')).includes('ph@x.com'),'invitation listed');
 await p.screenshot({path:out+'admin-team.png',fullPage:true});
 // the pharmacist: account by invitation, edit waits for review, cannot see owner tabs
 await p.click('#aout');await p.waitForSelector('#lf');await p.click('#lsw');await p.waitForSelector('#lp2');await su('ph@x.com','password456');await p.waitForSelector('#dsel');
 chk(!(await p.$('[data-at="publish"]'))&&!(await p.$('[data-at="brand"]')),'pharmacist has no publish or brand tab');
 await p.selectOption('#dsel','cipro');await p.waitForSelector('#iadd');await p.click('#iadd');
 const last='#irows [data-ir]:last-child ';await p.fill(last+'[data-k="with.ar"]','الثيوفيلين');await p.fill(last+'[data-k="with.en"]','Theophylline');
 await p.fill(last+'[data-k="desc.ar"]','يرفع مستوى الثيوفيلين');await p.fill(last+'[data-k="desc.en"]','Raises theophylline levels');await p.selectOption(last+'[data-k="sev"]','major');
 await p.fill('#dnote','label 7.x');await p.click('#dsave');await p.waitForTimeout(200);chk((await p.innerText('#dmsg')).includes('للمراجعة'),'pharmacist change sent for review');
 await p.click('[data-at="mine"]');await p.waitForTimeout(200);chk((await p.innerText('#apane')).includes('ينتظر'),'pharmacist sees it waiting');
 // the owner approves and publishes; version history and rollback
 await p.click('#aout');await p.waitForSelector('#lf');await p.fill('#le','owner@x.com');await p.fill('#lp','password123');await p.click('#lf button[type=submit]');await p.waitForSelector('[data-ok]');
 await p.screenshot({path:out+'admin-review.png',fullPage:true});
 await p.click('[data-ok]');await p.waitForTimeout(200);chk((await p.innerText('#apane')).includes('لا توجد'),'approved, nothing pending');
 await p.click('[data-at="publish"]');await p.waitForSelector('#pub');chk((await p.innerText('#apane')).includes('3 تعديلات'),'3 approved changes ready');
 await p.fill('#pn','الهوية والتوقيت وتداخل');await p.click('#pub');await p.waitForTimeout(300);
 const pub=await p.evaluate(()=>window.__fake.published);
 chk(pub.version===2,'published version 2');
 chk(pub.data.brand.colors.light['--primary']==='#12305C','brand in the published bundle');
 chk(pub.data.antibiotics.find(d=>d.id==='amox').timing.ar==='يُؤخذ مع بداية الوجبة.','owner drug edit published');
 chk(pub.data.antibiotics.find(d=>d.id==='cipro').inter.some(i=>i.with.en==='Theophylline'&&i.sev==='major'),'pharmacist interaction published after approval');
 await p.click('[data-at="publish"]');await p.waitForSelector('[data-rb]');await p.screenshot({path:out+'admin-publish.png',fullPage:true});
 await p.click('[data-rb="1"]');await p.waitForTimeout(300);chk((await p.evaluate(()=>window.__fake.published.version))===3,'rollback makes version 3');
 console.log('ok',ok);console.log(errs.length?errs.join('\n'):'no errors');await b.close();process.exit(errs.length?1:0)})();
