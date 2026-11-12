// Structure and known-value checks for the antibiotic rules (js/rules/antibiotics.js) and the engine (js/engine.js).
// Imported from BIOTICWAW (same checks, same expected label values) + DOSEWAW checks at the end.
// Run: node tests/engine_test.mjs   (exit 1 on any failure)
import fs from 'fs';
import vm from 'vm';
const dir = new URL('../js/', import.meta.url).pathname;
const ctx = vm.createContext({ document: { getElementById: () => null, addEventListener() {}, readyState: 'complete' }, esc: s => s, L: (a) => a, CFG: {}, console });
vm.runInContext(fs.readFileSync(dir + 'rules/antibiotics.js', 'utf8') + '\n' + fs.readFileSync(dir + 'rules/peds.js', 'utf8') + '\n' + fs.readFileSync(dir + 'engine.js', 'utf8'), ctx);
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
console.log(`engine: ${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
