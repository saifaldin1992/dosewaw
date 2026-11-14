// Structure and known-value checks for the antibiotic rules (js/rules/antibiotics.js) and the engine (js/engine.js).
// Imported from BIOTICWAW (same checks, same expected label values) + DOSEWAW checks at the end.
// Run: node tests/engine_test.mjs   (exit 1 on any failure)
import fs from 'fs';
import vm from 'vm';
const dir = new URL('../js/', import.meta.url).pathname;
const ctx = vm.createContext({ document: { getElementById: () => null, addEventListener() {}, readyState: 'complete' }, esc: s => s, L: (a) => a, CFG: {}, console });
vm.runInContext(fs.readFileSync(dir + 'rules/antibiotics.js', 'utf8') + '\n' + fs.readFileSync(dir + 'rules/analgesics.js', 'utf8') + '\n' + fs.readFileSync(dir + 'rules/antihistamines.js', 'utf8') + '\n' + fs.readFileSync(dir + 'rules/peds.js', 'utf8') + '\n' + fs.readFileSync(dir + 'rules/bands.js', 'utf8') + '\n' + fs.readFileSync(dir + 'engine.js', 'utf8'), ctx);
const RULES = vm.runInContext('ABC_RULES', ctx), abEval = vm.runInContext('abEval', ctx), evalRule = (rule, x, cr, c = {}) => abEval(rule, x, { ...c, cr }, { kidney: true, age: true, weight: true }), crcl = vm.runInContext('abCrCl', ctx);
let fail = 0, ok = 0;
const check = (cond, msg) => { if (cond) ok++; else { fail++; console.log('FAIL', msg); } };
const txt = t => t && typeof t.ar === 'string' && typeof t.en === 'string' && t.ar && t.en;
for (const [id, d] of Object.entries(RULES)) {
  check(txt(d.name), id + ': name in ar and en');
  check(d.srcIds && d.srcIds.length > 0, id + ': has a source id');
  check(txt(d.notes), id + ': notes in ar and en');
  for (const row of d.rows) {
    check(txt(row.k), id + ': row label in ar and en');
    check(row.rules.length > 0, id + ': row has rules');
    // a warning row may stay empty (shown only when its rule matches); every other row must have a fallback
    if (!row.warn && !row.opt) check(Object.keys(row.rules[row.rules.length - 1].when).length === 0,
      id + ': row "' + row.k.en + '" ends with a fallback rule (empty when)');
    for (const r of row.rules) check(txt(r.text), id + ': rule text in ar and en');
  }
  for (const f of d.inputs) if (f.type === 'select') for (const [v, lab] of f.options) check(txt(lab), id + ': option ' + v);
  // no < or > in stored text (database rule); the medical rules are plain text
  const all = JSON.stringify(d);
  check(!/[<>]/.test(all), id + ': no < or > in rules');
}
// known values from the labels
const c = crcl(60, 'f', 60, 160, 1.0); // Cockcroft-Gault, female, 60 y, 60 kg, 160 cm, SCr 1.0
check(c && Math.abs(c.crcl - (80 * c.weight) / 72 * 0.85) < 1e-9, 'Cockcroft-Gault female factor 0.85');
const amoxHd = evalRule(RULES.amox, { sev: 'mild', hd: true }, 50).rows.find(r => r.strong);
check(amoxHd.v.en.startsWith('250 mg every 24 h'), 'amoxicillin mild on dialysis = 250 mg every 24 h');
const cefCr = evalRule(RULES.cefalex, {}, 45).rows.find(r => r.strong);
check(cefCr.v.en.startsWith('No change; maximum 1 g'), 'cephalexin CrCl 45 = max 1 g a day');
const ciEx = evalRule(RULES.cipro, { ind: 'urinary' }, 50).rows.find(r => r.strong);
check(ciEx.v.en === '250 to 500 mg every 12 h', 'ciprofloxacin CrCl exactly 50 = 250-500 mg q12h (usual dose only above 50)');
// engine features (a made-up drug, so the test does not depend on real content)
const W = vm.runInContext('abWeights', ctx)('m', 100, 180); // ibw 75 kg, actual over 120% → adjusted 85 kg
check(Math.abs(W.ibw - 74.98) < 0.1 && Math.abs(W.adj - (W.ibw + 0.4 * (100 - W.ibw))) < 1e-9 && W.obese, 'ideal and adjusted weight (Devine)');
const fake = { rows: [
  { k: { ar: 'ج', en: 'D' }, rules: [
    { when: { age: { lt: 18 } }, text: { ar: 'طفل', en: 'child' } },
    { when: { crcl: { lt: 30 } }, text: { ar: '{mgkg:7.5@ibw} ملغ', en: '{mgkg:7.5@ibw} mg' } },
    { when: {}, text: { ar: '{mgkg:15-20|max:2000} ملغ', en: '{mgkg:15-20|max:2000} mg' } }] }], notes: { ar: 'ن', en: 'n' } };
const ev = (cr, age) => evalRule(fake, {}, cr, { age, wt: 100, W }).rows[0].v.en;
check(ev(80, 40) === '1500–2000 mg', 'mg/kg range on actual weight, capped at the maximum (' + ev(80, 40) + ')');
check(ev(20, 40) === '560 mg', 'mg/kg on ideal weight, rounded to 10 mg (' + ev(20, 40) + ')');
check(ev(80, 12) === 'child', 'age condition');
check(evalRule(fake, {}, null, { age: 40, wt: 100, W }).rows[0].v.en === '1500–2000 mg', 'no creatinine: kidney rules are skipped');
check(vm.runInContext('abFill', ctx)('{mgkg:5} mg', {}) === '— mg', 'no weight: the dose is not invented');
const fill = vm.runInContext('abFill', ctx);
check(fill('{mgkg:1@lean} mg', { W }) === String(Math.round(W.ibw / 5) * 5) + ' mg' || fill('{mgkg:1@lean} mg', { W }) === Math.round(W.ibw) + ' mg', 'lean weight = ideal weight when obese (' + fill('{mgkg:1@lean} mg', { W }) + ')');
check(fill('every {scrx:8} h', { scr: 2 }) === 'every 16 h', 'gentamicin interval = creatinine x 8 (label example: 2.0 mg/dL -> 16 h)');
check(fill('every {scrx:8} h', {}) === 'every — h', 'no creatinine: no interval invented');
// known values copied from the label tables (one or two per drug; they fail if a rule is changed by mistake)
const W70 = vm.runInContext('abWeights', ctx)('m', 70, 175); // not obese
const strong = (id, x, cr, extra = {}) => { const r = evalRule(RULES[id], x, cr, { age: 50, wt: 70, W: W70, ...extra }); const s = r.rows.find(q => q.strong); return s ? s.v.en : ''; };
const rowEn = (id, x, cr, k, extra = {}) => { const r = evalRule(RULES[id], x, cr, { age: 50, wt: 70, W: W70, ...extra }).rows.find(q => q.k.en === k); return r ? r.v.en : ''; };
const known = [
  ['levo 750 mg, clearance 30', strong('levo', { ind: 'hap', hd: false }, 30), '750 mg every 48 h'],
  ['levo 750 mg, clearance 15', strong('levo', { ind: 'hap', hd: false }, 15), '750 mg first, then 500 mg every 48 h'],
  ['levo 500 mg, dialysis', strong('levo', { ind: 'cap', hd: true }, 5), '500 mg first, then 250 mg every 48 h'],
  ['levo 250 mg uncomplicated UTI, clearance 15', strong('levo', { ind: 'uuti', hd: false }, 15), 'No change (uncomplicated urinary infection)'],
  ['cefazolin, clearance 20', strong('cefazolin', { ind: 'modsev' }, 20), 'Half the usual dose every 12 h'],
  ['cefazolin, clearance 40', strong('cefazolin', { ind: 'modsev' }, 40), 'Full dose, at least 8 h apart'],
  ['smx-tmp, clearance 20', strong('smx_tmp', { ind: 'uti' }, 20), 'Half the usual regimen (clearance 15 to 30 mL/min)'],
  ['nitrofurantoin, clearance 50', strong('nitro', { use: 'treat' }, 50), 'Do not use: the label contraindicates it when creatinine clearance is under 60 mL/min.'],
  ['clarithromycin with ritonavir, clearance 40', strong('clarith', { ind: 'cap', pi: true }, 40), 'Reduce the dose by 50%'],
  ['clarithromycin with ritonavir, clearance 20', strong('clarith', { ind: 'cap', pi: true }, 20), 'Reduce the dose by 75%'],
  ['cefuroxime, clearance 20', strong('cefurox', { ind: 'uti', hd: false }, 20), 'The standard dose every 24 h'],
  ['cefixime, clearance 40', strong('cefixime', { ind: 'usual', dial: 'none' }, 40), 'The 400 mg tablet is not appropriate (clearance 21 to 59); use another form as in the label table'],
  ['gentamicin serious, 70 kg', strong('genta', { sev: 'serious' }, 90), '70 mg every 8 h (3 mg/kg a day)'],
  ['gentamicin interval, creatinine 2.0', rowEn('genta', { sev: 'serious' }, 40, 'If the kidneys are impaired (label method)', { scr: 2 }), 'the usual dose about every 16 h (serum creatinine × 8), with level monitoring'],
  ['vancomycin anephric, 70 kg', strong('vanco', { anephric: true }, 5), '1050 mg first (15 mg/kg), then 135 mg every 24 h (1.9 mg/kg), with a level at 24 h'],
  ['metronidazole anaerobic, 70 kg', strong('metro', { ind: 'anaer', hep: false, hd: false }, null), '530 mg every 6 h (7.5 mg/kg), at most 4 g a day, for 7 to 10 days'],
  ['amox-clav, clearance 20', strong('amox_clav', { sev: 'severe', hd: false }, 20), '500 or 250 mg every 12 h by severity'],
  ['meropenem-vaborbactam, eGFR 40', strong('mero_vabor', { hd: false }, 90, { egfr: 40 }), '2 g (meropenem 1 + vaborbactam 1) every 8 h'],
  ['meropenem-vaborbactam, eGFR 20', strong('mero_vabor', { hd: false }, 90, { egfr: 20 }), '2 g (meropenem 1 + vaborbactam 1) every 12 h'],
  ['plazomicin, clearance 45, 70 kg', strong('plazomicin', {}, 45), '700 mg every 24 h (10 mg/kg)'],
  ['plazomicin, clearance 20, 70 kg', strong('plazomicin', {}, 20), '700 mg every 48 h (10 mg/kg)'],
  ['amikacin every 12 h, 70 kg', strong('amikacin', { reg: 'q12' }, 90), '530 mg every 12 h (7.5 mg/kg; not over 1.5 g a day)'],
  ['amikacin interval, creatinine 2.0', rowEn('amikacin', { reg: 'q12' }, 40, 'If the kidneys are impaired (label method)', { scr: 2 }), '7.5 mg/kg about every 18 h (serum creatinine × 9), with level monitoring'],
  ['tobramycin serious, 70 kg', strong('tobra', { sev: 'serious' }, 90), '70 mg every 8 h (3 mg/kg a day)'],
  ['aztreonam, clearance 20', rowEn('aztreonam', { ind: 'mod', hd: false }, 20, 'By kidney function'), 'A first dose of 1 or 2 g, then half the dose'],
  ['streptomycin TB daily, 70 kg', strong('strepto', { ind: 'tbd' }, 90), '1000 mg once a day (15 mg/kg, maximum 1 g)'],
  ['telithromycin, clearance 20', strong('telithro', { hep: false, hd: false }, 20), '600 mg once a day'],
  ['ofloxacin, clearance 15', strong('oflox', { ind: 'resp', cirr: false }, 15), 'A normal first dose, then half the dose every 24 h'],
  ['ofloxacin, clearance 40', strong('oflox', { ind: 'resp', cirr: false }, 40), 'A normal first dose, then the usual dose every 24 h'],
  ['gemifloxacin, clearance 40', strong('gemiflox', { ind: 'cap', hd: false }, 40), '160 mg every 24 h'],
  ['gemifloxacin, clearance 41', strong('gemiflox', { ind: 'cap', hd: false }, 41), '320 mg once a day'],
  ['eravacycline with an inducer, 70 kg', strong('eravacycline', { hep: false, ind3a: true }, null), '105 mg every 12 h (1.5 mg/kg)'],
  ['tigecycline Child-Pugh C', strong('tigecycline', { hep: true }, null), '100 mg first, then 25 mg every 12 h'],
  ['delafloxacin IV, eGFR 20', strong('delaflox', { route: 'iv', ind: 'skin', hd: false }, 90, { egfr: 20 }), '200 mg IV every 12 h'],
  ['delafloxacin tablets, eGFR 20', strong('delaflox', { route: 'po', ind: 'skin', hd: false }, 90, { egfr: 20 }), '450 mg by mouth every 12 h'],
  ['aztreonam-avibactam maintenance, clearance 40', rowEn('azt_avi', { hd: false }, 40, 'Maintenance'), '1 g (0.75 + 0.25) every 6 h'],
  ['trimethoprim, clearance 20', strong('tmp', {}, 20), '50 mg every 12 h'],
  ['teicoplanin maintenance, clearance 50, 70 kg', rowEn('teico', { ind: 'std' }, 50, 'Maintenance (from day 4, by kidney function)'), 'Half: 420 mg every other day, or 210 mg daily'],
  ['daptomycin bacteraemia, clearance 20, 70 kg', strong('dapto', { ind: 'bact', hd: false }, 20), '420 mg every 48 h (6 mg/kg)'],
  ['dalbavancin, clearance 20', strong('dalba', { hd: false }, 20), '1125 mg once'],
  ['dalbavancin, clearance 20 on dialysis', strong('dalba', { hd: true }, 20), '1500 mg once'],
  ['rifampin TB, 70 kg', strong('rifampin', { ind: 'tb' }, null), '600 mg once a day (10 mg/kg, maximum 600 mg)'],
  ['rifapentine latent TB, 70 kg', strong('rifapentine', { ind: 'ltbi' }, null), '900 mg weekly for 12 weeks'],
  ['isoniazid daily adult, 70 kg', strong('isoniazid', { reg: 'daily' }, null), '300 mg once a day (5 mg/kg, up to 300 mg)'],
  ['ethambutol first treatment, 70 kg', strong('ethambutol', { reg: 'first' }, 90), '1050 mg once a day (15 mg/kg)'],
  ['colistin, clearance 40, ideal 70 kg', strong('colistin', {}, 40), '175 mg a day, once or in 2 doses (2.5 mg/kg)'],
  ['colistin, clearance 20, ideal 70 kg', strong('colistin', {}, 20), '105 mg every 36 h (1.5 mg/kg)'],
  ['lefamulin IV, Child-Pugh C', strong('lefamulin', { route: 'iv', hep: 'sev' }, null), '150 mg IV over 60 minutes every 24 h'],
  ['chloramphenicol, 70 kg', strong('chloramph', { high: false }, null), '880 mg every 6 h (50 mg/kg a day)'],
];
const eg = vm.runInContext('abEgfr', ctx)(60, 'm', 1.0); // 175 x 60^-0.203 = 76.7
check(Math.abs(eg - 175 * Math.pow(60, -0.203)) < 1e-9 && Math.round(eg) === 76, 'MDRD eGFR (60-year-old man, creatinine 1.0 = 76)');
for (const [name, got, want] of known) check(got === want, 'label value: ' + name + (got === want ? '' : ' -> got "' + got + '"'));

// ---------- DOSEWAW checks ----------
const PEDS = vm.runInContext('PEDS', ctx), peds = vm.runInContext('pedsCalc', ctx), easiest = vm.runInContext('easiest', ctx), wfa = vm.runInContext('wfaWeight', ctx);
// a missing creatinine never reads as «no change»: the kidney row asks for the data instead
const miss = abEval(RULES.amox, { sev: 'mild', hd: false }, { cr: null, age: null, W: { act: 70 } }, { kidney: false, age: false, weight: true });
check(JSON.stringify(miss.rows.find(r => r.strong).need) === '["kidney"]', 'amox without creatinine: kidney row needs data');
const hdNoCr = abEval(RULES.amox, { sev: 'mild', hd: true }, { cr: null }, { kidney: false, age: false, weight: false });
check(/24 h/.test(hdNoCr.rows.find(r => r.strong).v.en), 'amox on dialysis: answer without creatinine');
// amoxicillin label 2.2 / 2.3 (DailyMed 2026-07-07)
const A = PEDS.amox;
let r = peds(A, { W: 15, infant: false }, { ind: 'sev', every: 12 });
check(r.mg === 337.5 && r.mgkgday === 45, 'amox 15 kg severe q12h = 337.5 mg (45 mg/kg/day)');
check(r.ml.map(x => Math.round(x.ml * 10) / 10).join() === '8.4,4.2', 'mL per dose for 200 and 400 mg/5 mL');
check(easiest(r.ml) === 400, '4.2 mL is closer to 5 mL than 8.4 mL');
r = peds(A, { W: 15, infant: false }, { ind: 'mild', every: 8 });
check(r.mg === 100 && r.mgkgday === 20, 'amox 15 kg mild q8h = 100 mg (20 mg/kg/day)');
r = peds(A, { W: 5, infant: true }, { ind: 'sev', every: 8 });
check(r.mgkgday === 30 && r.every === 12 && r.mg === 75, 'under 3 months: 30 mg/kg/day every 12 h');
r = peds(A, { W: 38, infant: false }, { ind: 'sev', every: 12 });
check(r.mg === 855, '38 kg severe q12h = 855 mg (below the 875 mg adult dose)');
r = peds(A, { W: 39.9, infant: false }, { ind: 'mild', every: 12 });
check(r.mg === 498.75 && !r.notes.length, '39.9 kg mild = 498.75 mg, no cap needed');
r = peds(A, { W: 40, infant: false }, { ind: 'sev', every: 12 });
check(r.adult && r.mg === 875, 'from 40 kg: adult dose 875 mg');
for (const i of A.inds) for (const f of A.freq) check(txt(i.adult[f][1]) && i.mgkgday[f] > 0, 'amox ' + i.id + ' q' + f + 'h has a dose');
check(A.susp.join() === '200,400', 'amox suspensions = the label strengths only (section 3)');
// WHO weight-for-age medians (data/who_wfa.json)
const who = JSON.parse(fs.readFileSync(new URL('../data/who_wfa.json', import.meta.url), 'utf8'));
check(who.boys.length === 121 && who.girls.length === 121, 'WHO table 0-120 months');
check(Math.abs(wfa(who, 0, 'm') - 3.35) < 0.01 && Math.abs(wfa(who, 0, 'f') - 3.23) < 0.01, 'birth medians 3.35 / 3.23 kg');
check(Math.abs(wfa(who, 120, 'm') - 31.16) < 0.01, '10 y boys median 31.16 kg');
check(wfa(who, 121, '') === null, 'no estimate after 10 years');

// ---------- analgesics: children's charts and mg/kg, each number checked against the saved source text ----------
const BANDS = vm.runInContext('BANDS', ctx), band = vm.runInContext('bandCalc', ctx);
const lab = id => JSON.stringify(JSON.parse(fs.readFileSync(new URL('../content/analgesics/labels/' + id + '.json', import.meta.url), 'utf8')).sections).replace(/\\s+|\s+/g, ' ');
const whoMf = fs.readFileSync(new URL('../content/analgesics/who_mfc_2010_2.1.txt', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const SRC = {127: lab('paracetamol_child'), 128: lab('paracetamol_adult'), 130: lab('ibuprofen_susp'), 132: lab('ibuprofen_child_otc'), 133: lab('ibuprofen_adult_otc'), 134: whoMf};
for (const [id, b] of Object.entries(BANDS).filter(([k]) => ['paracetamol', 'ibuprofen'].includes(k))) {
  for (const seg of b.segs) {
    check(SRC[seg.ref] || seg.ref === 128 || seg.ref === 133, id + ': segment source saved');
    if (seg.kind === 'chart') for (const r of seg.rows) {
      const per5 = b.strengths.find(x => x.ref === seg.ref).c, ml = r.mg * 5 / per5, t = SRC[seg.ref];
      check(new RegExp(r.lb[0] + ' ?- ?' + r.lb[1] + '( lbs)? ' + r.age[0] + (r.age[0] !== r.age[1] ? '-' + r.age[1] : '') + '( years)? ' + ml + ' mL').test(t), id + ' chart ' + r.lb.join('-') + ' lb = ' + ml + ' mL in the label');
    }
    if (seg.mgkg) check(SRC[seg.ref].includes(seg.mgkg + ' mg/kg'), id + ': ' + seg.mgkg + ' mg/kg in the source');
    if (seg.mgkgBy) for (const m of seg.mgkgBy) check(SRC[seg.ref].includes(m.mgkg + ' mg/kg'), id + ': ' + m.mgkg + ' mg/kg in the source');
    if (seg.maxMgkgDay) check(SRC[seg.ref].includes('maximum daily dose is ' + seg.maxMgkgDay + ' mg/kg'), id + ': max ' + seg.maxMgkgDay + ' mg/kg/day in the source');
  }
}
check(SRC[127].includes('do not give more than 5 times in 24 hours') && SRC[132].includes('do not use more than 4 times a day'), 'chart limits in the labels');
check(whoMf.includes('15 mg/kg, up to 1 g, every 4–6 hours') && whoMf.includes('Maximum 4 doses') && whoMf.includes('Infants under 3 months should not be given paracetamol unless advised by a doctor'), 'WHO paracetamol text');
check(SRC[128].includes('do not take more than 6 gelcaps in 24 hours') && SRC[133].includes('do not exceed 6 tablets in 24 hours'), 'adult limits in the labels');
const bc = (id, P, x) => band(BANDS[id], P, x || {}, []);
let b = bc('paracetamol', { W: 14 }); check(b.kind === 'chart' && b.mg === 160 && Math.abs(b.ml[0].ml - 5) < 1e-9, 'paracetamol 14 kg (30.9 lb) = 160 mg = 5 mL of 160 mg/5 mL');
b = bc('paracetamol', { W: 8, months: 9 }); check(b.kind === 'mgkg' && b.mg === 120 && b.maxDoses === 4, 'paracetamol 9 months 8 kg = 15 mg/kg = 120 mg, max 4 doses (WHO)');
b = bc('paracetamol', { W: 80, months: 20 }); check(b.mg === 1000 && b.capped, 'paracetamol single dose capped at 1 g (WHO)');
check(bc('paracetamol', { months: 2 }).kind === 'doctor', 'paracetamol under 3 months: doctor');
check(bc('paracetamol', { W: 5, infant: true }).kind === 'doctor', 'paracetamol infant box: doctor');
b = bc('paracetamol', { months: 60 }); check(b.kind === 'chart' && b.mg === 240 && b.by === 'age', 'paracetamol 5 years by age = 240 mg');
check(bc('paracetamol', { months: 150 }).kind === 'adult' && bc('paracetamol', { W: 50 }).kind === 'adult', 'paracetamol 12 years or over 95 lb: adult dose');
b = bc('ibuprofen', { W: 9, months: 12 }, { why: 'fever', hot: false }); check(b.mg === 45 && b.maxDay === 360, 'ibuprofen 9 kg fever under 39.2 = 5 mg/kg = 45 mg, max 360 mg/day');
b = bc('ibuprofen', { W: 9, months: 12 }, { why: 'fever', hot: true }); check(b.mg === 90, 'ibuprofen fever 39.2 or more = 10 mg/kg');
b = bc('ibuprofen', { W: 9, months: 12 }, { why: 'pain' }); check(b.mg === 90, 'ibuprofen pain = 10 mg/kg');
check(bc('ibuprofen', { months: 4 }).kind === 'doctor', 'ibuprofen under 6 months: doctor (FDA)');
b = bc('ibuprofen', { W: 20 }); check(b.kind === 'chart' && b.mg === 150 && Math.abs(b.ml[0].ml - 7.5) < 1e-9, 'ibuprofen 20 kg (44 lb) = 150 mg = 7.5 mL');
b = band(BANDS.paracetamol, { W: 14 }, {}, [120, 250]); check(b.ml.map(q => Math.round(q.ml * 10) / 10).join() === '5,6.4,6.7,3.2', 'extra strengths 120 and 250 mg/5 mL from the same mg dose');
// adult rules of the group
const pa = abEval(RULES.paracetamol, { liver: 'sev', alc: false }, { cr: null }, { kidney: false, age: false, weight: false });
check(/Contraindicated/.test(pa.rows.find(r => r.strong).v.en), 'paracetamol severe liver: contraindicated');
const ib = abEval(RULES.ibuprofen, { use: 'otc', renal: 'ok', preg20: true }, { cr: null }, { kidney: false, age: false, weight: false });
check(/1,200 mg/.test(ib.rows.find(r => r.strong).v.en) && ib.rows.some(r => /20 weeks/.test((r.v || {}).en || '')), 'ibuprofen OTC 1,200 mg/day; 20 weeks warning');

// the other analgesics: each dose sentence of the rules is in its label
const EV = {naproxen: ['500 mg followed by 250 mg every 6 to 8 hours', 'should not exceed 1,250 mg', '750 mg of naproxen tablets followed by 250 mg every 8 hours', 'creatinine clearance < 30 mL/min', '1,500 mg/day for up to 6 months', 'approximately 10 mg/kg given in 2 divided doses', 'less than 50 kilograms'],
  diclofenac_k: ['50 mg three times a day', 'initial dose of 100 mg', '100-150 mg/day in divided doses, 50 mg twice a day or three times a day', '150-200 mg/day in divided doses, 50 mg three times a day or four times a day', 'within 4 to 8 weeks', 'advanced renal disease unless'],
  mefenamic: ['500 mg given orally as an initial dose followed by 250 mg every 6 hours', 'one week (7 days)', '14 years of age and older', 'may require reduced doses', 'magnesium hydroxide'],
  aspirin: ['take 1 or 2 tablets every 4 hours or 3 tablets every 6 hours, not to exceed 12 tablets in 24 hours', 'children under 12 years: do not use', 'drink a full glass of water with each dose', 'age 60 or older', '20 weeks or later'],
  celecoxib: ['400 mg initially, followed by 200 mg dose if needed on first day', '200 mg twice daily as needed', '200 mg once daily or 100 mg twice daily', '100 mg to 200 mg twice daily', 'reduce the dose by 50%', 'severe hepatic impairment is not recommended', '50 mg twice daily in patients 10 kg to 25 kg', 'sulfonamides', 'fluconazole'],
  ketorolac: ['20 mg PO once followed by 10 mg q4-6 hours prn not >40 mg/day', '10 mg PO once followed by 10 mg q4-6 hours prn not >40 mg/day', 'Oral not approved', 'not to exceed 5 days', 'probenecid is contraindicated', 'pentoxifylline is contraindicated', 'advanced renal impairment']};
for (const [id, list] of Object.entries(EV)) { const t = lab(id).replace(/&gt;/g, '>'); for (const q of list) check(t.toLowerCase().includes(q.toLowerCase()), id + ': «' + q + '» in the label'); }
const an = JSON.parse(fs.readFileSync(new URL('../data/analgesics.json', import.meta.url), 'utf8'));
check(an.length === 8 && an.every(d => RULES[d.id] && txt(d.n) && txt(d.dose) && txt(d.renal) && txt(d.preg) && d.inter.length && d.src.length), 'analgesics: 8 drugs, each with rules, dose, kidney, pregnancy, interactions, sources');
for (const id of ['naproxen', 'diclofenac_k', 'mefenamic', 'aspirin', 'celecoxib', 'ketorolac']) check(txt(RULES[id].kids), id + ': says what the label allows for children');
const kt = (x, c) => abEval(RULES.ketorolac, { renal: 'ok', after: true, ...x }, c, { kidney: false, age: true, weight: true }).rows.find(r => r.strong).v.en;
check(/^20 mg once/.test(kt({}, { cr: null, age: 40, wt: 70 })) && /^10 mg once/.test(kt({}, { cr: null, age: 70, wt: 70 })) && /^10 mg once/.test(kt({}, { cr: null, age: 40, wt: 45 })) && /^10 mg once/.test(kt({ renal: 'imp' }, { cr: null, age: 40, wt: 70 })), 'ketorolac 20 mg first dose only for 17-64 years, 50 kg or more, normal kidneys');
check(/Contraindicated/.test(kt({ renal: 'adv' }, { cr: null, age: 40, wt: 70 })) && /not an initial dose/.test(kt({ after: false }, { cr: null, age: 40, wt: 70 })), 'ketorolac contraindications and continuation only');

// ---------- antihistamines: age charts and adult rules against the saved label text ----------
const labH = id => JSON.stringify(JSON.parse(fs.readFileSync(new URL('../content/antihistamines/labels/' + id + '.json', import.meta.url), 'utf8')).sections).replace(/\\s+|\s+/g, ' ').toLowerCase();
const whoH = fs.readFileSync(new URL('../content/antihistamines/who_mfc_2010_3.txt', import.meta.url), 'utf8').replace(/\s+/g, ' ').toLowerCase();
const EVH = {cetirizine_child: ['children 2 to under 6 years of age 2.5 ml once daily', 'maximum of 5 ml once daily or 2.5 ml every 12 hours', 'adults and children 6 years and over 5 ml or 10 ml once daily', 'do not take more than 10 ml in 24 hours', 'adults 65 years and over 5 ml once daily', 'children under 2 years of age ask a doctor'],
  cetirizine_adult: ['one 10 mg capsule once daily', 'if breast-feeding: not recommended', 'hydroxyzine'],
  loratadine_child: ['children 2 to under 6 years of age 1 teaspoonful (tsp) daily', 'adults and children 6 years and over 2 teaspoonfuls (tsp) daily', 'children under 2 years of age ask a doctor'],
  loratadine_adult: ['adults and children 6 years and over 1 tablet daily; not more than 1 tablet in 24 hours'],
  fexofenadine_child: ['children 2 to under 12 years of age take 5 ml every 12 hours; do not take more than 10 ml in 24 hours', 'adults and children 12 years of age and over take 10 ml every 12 hours; do not take more than 20 ml in 24 hours', 'children under 2 years of age ask a doctor'],
  fexofenadine_adult: ['take one 180 mg tablet with water once a day', 'do not take with fruit juices', 'aluminum or magnesium antacids'],
  chlorpheniramine: ['adults and children 12 years and over 1 tablet. do not exceed 6 tablets in 24 hours', 'children 6 to under 12 years 1/2 tablet', 'do not exceed 3 whole tablets in 24 hours', 'children under 6 years do not use', 'do not use to make a child sleepy'],
  diphenhydramine: ['children 6 to 11 years 5 ml to 10 ml', 'children 2 to 5 years do not use unless directed by a doctor', 'children under 2 years do not use', 'do not take more than 6 doses in 24 hours', 'even one used on skin'],
  diphenhydramine_adult: ['adults and children 12 years and over 1 to 2 tablets', 'do not take more than 6 doses in 24 hours'],
  levocetirizine: ['5 mg (1 tablet) once daily in the evening', 'children 6 to 11 years of age: 2.5 mg once daily in the evening', 'a dose of 2.5 mg once daily is recommended', 'a dose of 2.5 mg once every other day is recommended', 'a dose of 2.5 mg twice weekly', 'should not receive levocetirizine', '50 to 80 ml/min', '30 to 50 ml/min', '10 to 30 ml/min'],
  desloratadine: ['one 5 mg tablet once daily', 'a starting dose of one 5 mg tablet every other day', 'loratadine'],
  hydroxyzine: ['adults, 25 mg t.i.d. or q.i.d.', 'children under 6 years, 50 mg daily in divided doses', 'children over 6 years, 50 to 100 mg daily in divided doses', 'adults, 50 to 100 mg q.i.d.', 'prolonged qt interval', 'should not be given to nursing mothers']};
for (const [id, list] of Object.entries(EVH)) { const t = labH(id); for (const q of list) check(t.includes(q), id + ': «' + q + '» in the label'); }
check(whoH.includes('1–2 years 1 mg twice daily') && whoH.includes('2–6 years 1 mg every 4–6 hours (maximum 6 mg daily)') && whoH.includes('oral liquid: 2 mg/5 ml'), 'WHO chlorphenamine text');
const ah = JSON.parse(fs.readFileSync(new URL('../data/antihistamines.json', import.meta.url), 'utf8'));
check(ah.length === 8 && ah.every(d => RULES[d.id] && BANDS[d.id] && txt(d.n) && txt(d.dose) && txt(d.preg) && d.inter.length && d.src.length), 'antihistamines: 8 drugs, each with adult rules, children chart, dose, pregnancy, interactions, sources');
const hb = (id, m) => band(BANDS[id], { months: m }, {}, []);
let h = hb('cetirizine', 36); check(h.mg === 2.5 && h.ml[0].ml === 2.5, 'cetirizine 3 years: 2.5 mg = 2.5 mL');
h = hb('cetirizine', 96); check(h.mg === 5 && h.mg2 === 10 && h.ml2[0].ml === 10, 'cetirizine 8 years: 5-10 mg = 5-10 mL');
check(hb('cetirizine', 18).kind === 'doctor' && band(BANDS.cetirizine, { W: 20 }, {}, []).kind === 'needAge', 'cetirizine under 2: doctor; weight only: needs the age');
h = hb('loratadine', 48); check(h.mg === 5 && h.ml[0].ml === 5, 'loratadine 4 years: 5 mg = 5 mL');
h = hb('fexofenadine', 60); check(h.mg === 30 && h.ml[0].ml === 5, 'fexofenadine 5 years: 30 mg = 5 mL every 12 h');
check(hb('chlorpheniramine', 48).kind === 'doctor' && hb('chlorpheniramine', 96).mg === 2, 'chlorpheniramine: under 6 per label no; 8 years 2 mg');
h = hb('diphenhydramine', 96); check(h.mg === 12.5 && h.mg2 === 25 && h.ml[0].ml === 5 && h.ml2[0].ml === 10, 'diphenhydramine 8 years: 12.5-25 mg = 5-10 mL');
check(hb('diphenhydramine', 48).kind === 'doctor', 'diphenhydramine 4 years: only if a doctor directs');
check(hb('hydroxyzine', 48).mg === 50 && hb('hydroxyzine', 120).mg2 === 100 && hb('hydroxyzine', 216).kind === 'adult', 'hydroxyzine: under 6 50 mg/day; over 6 50-100 mg/day; adults from 18');
const lv = cr => abEval(RULES.levocetirizine, { hd: false }, { cr }, { kidney: true, age: true, weight: true }).rows.find(r => r.strong).v.en;
check(/^5 mg/.test(lv(90)) && lv(80) === '2.5 mg once a day' && lv(50) === '2.5 mg once a day' && lv(49) === '2.5 mg every other day' && lv(30) === '2.5 mg every other day' && /twice a week/.test(lv(29)) && /Contraindicated/.test(lv(9)), 'levocetirizine kidney table (80/50/30/10 mL/min)');
console.log(`engine: ${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
