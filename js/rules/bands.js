/* DOSEWAW · js/rules/bands.js — children's doses of the analgesics group, as data. Engine: bandCalc() in js/engine.js.
   Order of sources (the owner's rule): the U.S. label first; where the label gives no dose, the WHO Model Formulary for
   Children 2010 (source 134). Every number is copied from the source named in `ref` (source id) — check before changing.
   Segments are tried in order: the first whose age (months) or weight (lb, as in the U.S. charts) fits gives the dose.
   kind: 'doctor' = no dose, see the doctor · 'mgkg' = mg per kg · 'chart' = the label's weight/age chart · 'adult'.
   strengths: suspensions in the sources (mg per 5 mL); the pharmacist can add the strength printed on the bottle. */
const BANDS = {
  paracetamol: {
    strengths:[{c:160,ref:127},{c:125,ref:134}],
    segs:[
      {kind:'doctor', ageM:[0,3], ref:134,
        msg:{ar:'أقل من 3 أشهر: لا يُعطى الباراسيتامول إلا بتوجيه الطبيب (WHO).',en:'Under 3 months: give paracetamol only if advised by a doctor (WHO).'}},
      {kind:'mgkg', ageM:[3,24], lb:[0,24], mgkg:15, maxMg:1000, everyH:[4,6], maxDoses:4, ref:134,
        note:{ar:'نشرة الشراب الأمريكية تقول «اسأل الطبيب» تحت سنتين؛ الجرعة هنا من WHO.',en:'The U.S. suspension label says «ask a doctor» under 2 years; this dose is from WHO.'}},
      {kind:'chart', ageM:[24,144], lb:[24,96], everyH:[4,4], maxDoses:5, ref:127,
        rows:[{lb:[24,35],age:[2,3],mg:160},{lb:[36,47],age:[4,5],mg:240},{lb:[48,59],age:[6,8],mg:320},{lb:[60,71],age:[9,10],mg:400},{lb:[72,95],age:[11,11],mg:480}]},
      {kind:'adult', ageM:[144,1e9], lb:[96,1e9], ref:128,
        text:{ar:'1000 ملغ (قرصان 500 ملغ) كل 6 ساعات عند الحاجة، بحد 3000 ملغ في 24 ساعة',en:'1,000 mg (two 500 mg tablets) every 6 hours as needed, up to 3,000 mg in 24 hours'}}
    ],
    duration:{ar:'حتى تزول الأعراض؛ يُراجع الطبيب إذا استمرت الحرارة أكثر من 3 أيام أو الألم أكثر من 5 أيام',en:'While symptoms last; see a doctor if fever lasts more than 3 days or pain more than 5 days'},
    patient:[
      {ar:'رجّ العبوة جيداً قبل كل جرعة، واستعمل كوب القياس المرفق فقط.',en:'Shake well before each dose, and use only the dosing cup provided.'},
      {ar:'لا تُعطِ أي دواء آخر فيه باراسيتامول في الوقت نفسه.',en:'Do not give any other medicine that contains paracetamol at the same time.'},
      {ar:'لا تتجاوز عدد المرات المكتوب في اليوم.',en:'Do not give it more times a day than written.'}
    ]
  },
  ibuprofen: {
    strengths:[{c:100,ref:132}],
    opts:[{id:'why',options:[['fever',{ar:'حرارة',en:'Fever'}],['pain',{ar:'ألم',en:'Pain'}]]},
          {id:'hot',type:'check',label:{ar:'الحرارة 39.2°م (102.5°ف) أو أكثر',en:'Temperature 39.2 °C (102.5 °F) or more'},when:{why:'fever'}}],
    segs:[
      {kind:'doctor', ageM:[0,6], ref:130,
        msg:{ar:'أقل من 6 أشهر: الأمان والفعالية غير مثبتين (نشرة FDA). منظمة الصحة العالمية تذكر 5 إلى 10 ملغ/كغ من عمر 3 أشهر، ويقرر ذلك الطبيب.',en:'Under 6 months: safety and effectiveness are not established (FDA label). WHO lists 5 to 10 mg/kg from 3 months; the doctor decides.'}},
      {kind:'mgkg', ageM:[6,24], lb:[0,24], mgkgBy:[{when:{why:'pain'},mgkg:10},{when:{hot:true},mgkg:10},{when:{},mgkg:5}], maxMgkgDay:40, everyH:[6,8], ref:130,
        note:{ar:'تحت 24 رطلاً (10.9 كغ) أو تحت سنتين: الجرعة بالوزن من نشرة الشراب بوصفة.',en:'Under 24 lb (10.9 kg) or under 2 years: the weight-based dose of the prescription suspension label.'}},
      {kind:'chart', ageM:[24,144], lb:[24,96], everyH:[6,8], maxDoses:4, ref:132,
        rows:[{lb:[24,35],age:[2,3],mg:100},{lb:[36,47],age:[4,5],mg:150},{lb:[48,59],age:[6,8],mg:200},{lb:[60,71],age:[9,10],mg:250},{lb:[72,95],age:[11,11],mg:300}]},
      {kind:'adult', ageM:[144,1e9], lb:[96,1e9], ref:133,
        text:{ar:'200 ملغ كل 4 إلى 6 ساعات، و400 ملغ إذا لم تكفِ 200، بحد 1200 ملغ في 24 ساعة',en:'200 mg every 4 to 6 hours, 400 mg if 200 mg does not help, up to 1,200 mg in 24 hours'}}
    ],
    duration:{ar:'أقل مدة ممكنة؛ يُراجع الطبيب إذا لم يتحسن في 24 ساعة أو استمرت الحرارة أو الألم أكثر من 3 أيام',en:'As short as possible; see a doctor if no relief in 24 hours or if fever or pain lasts more than 3 days'},
    patient:[
      {ar:'رجّ العبوة جيداً قبل كل جرعة.',en:'Shake well before each dose.'},
      {ar:'يُعطى مع الطعام أو الحليب إذا سبّب ألماً في المعدة.',en:'Give with food or milk if it upsets the stomach.'},
      {ar:'لا يزيد على 4 مرات في اليوم.',en:'No more than 4 times a day.'},
      {ar:'أوقفه وراجع الطبيب فوراً إذا ظهر قيء دم أو براز أسود.',en:'Stop and see a doctor at once if there is vomiting of blood or black stools.'}
    ]
  }
};
/* antihistamines: the labels give age charts (no weight), so a weight alone asks for the age.
   Chart rows: age in years [from, to], mg (and mg2 for a range), freq and max as written in the label. */
const AH_DAILY={ar:'مرة يومياً',en:'once a day'};
Object.assign(BANDS, {
  cetirizine: { ageOnly:true, strengths:[{c:5,ref:141}],
    segs:[
      {kind:'doctor', ageM:[0,24], ref:141, msg:{ar:'أقل من سنتين: يُسأل الطبيب (النشرة).',en:'Under 2 years: ask a doctor (label).'}},
      {kind:'chart', ageM:[24,144], ref:141, rows:[
        {age:[2,5],mg:2.5,freq:AH_DAILY,max:{ar:'يمكن رفعها إلى 5 ملغ مرة يومياً أو 2.5 ملغ كل 12 ساعة؛ الحد 5 ملغ في 24 ساعة',en:'May increase to 5 mg once a day or 2.5 mg every 12 hours; up to 5 mg in 24 hours'}},
        {age:[6,11],mg:5,mg2:10,freq:AH_DAILY,max:{ar:'5 أو 10 ملغ حسب شدة الأعراض؛ الحد 10 ملغ في 24 ساعة',en:'5 or 10 mg by severity; up to 10 mg in 24 hours'}}]},
      {kind:'adult', ageM:[144,1e9], ref:142, text:{ar:'10 ملغ مرة يومياً (5 ملغ قد تكفي للأعراض الأخف)، بحد 10 ملغ في 24 ساعة',en:'10 mg once a day (5 mg may be enough for milder symptoms), up to 10 mg in 24 hours'}}],
    duration:{ar:'مرة يومياً ما دامت الأعراض',en:'Once a day while symptoms last'},
    patient:[{ar:'قد يسبب النعاس؛ تجنّب القيادة إذا شعرت به.',en:'May cause drowsiness; do not drive if you feel it.'},{ar:'استعمل كوب القياس المرفق فقط.',en:'Use only the dosing cup provided.'}]},
  loratadine: { ageOnly:true, strengths:[{c:5,ref:144}],
    segs:[
      {kind:'doctor', ageM:[0,24], ref:144, msg:{ar:'أقل من سنتين: يُسأل الطبيب (النشرة).',en:'Under 2 years: ask a doctor (label).'}},
      {kind:'chart', ageM:[24,144], ref:144, rows:[
        {age:[2,5],mg:5,freq:AH_DAILY,max:{ar:'لا يزيد على 5 ملغ في 24 ساعة',en:'No more than 5 mg in 24 hours'}},
        {age:[6,11],mg:10,freq:AH_DAILY,max:{ar:'لا يزيد على 10 ملغ في 24 ساعة',en:'No more than 10 mg in 24 hours'}}]},
      {kind:'adult', ageM:[144,1e9], ref:145, text:{ar:'10 ملغ مرة يومياً، بحد 10 ملغ في 24 ساعة',en:'10 mg once a day, up to 10 mg in 24 hours'}}],
    duration:{ar:'مرة يومياً ما دامت الأعراض',en:'Once a day while symptoms last'},
    patient:[{ar:'لا تُعطِ أكثر من الجرعة: الزيادة قد تسبب النعاس.',en:'Do not give more than directed: more may cause drowsiness.'},{ar:'استعمل كوب القياس المرفق فقط.',en:'Use only the dosing cup provided.'}]},
  fexofenadine: { ageOnly:true, strengths:[{c:30,ref:147}],
    segs:[
      {kind:'doctor', ageM:[0,24], ref:147, msg:{ar:'أقل من سنتين: يُسأل الطبيب (النشرة).',en:'Under 2 years: ask a doctor (label).'}},
      {kind:'chart', ageM:[24,144], ref:147, rows:[
        {age:[2,11],mg:30,freq:{ar:'كل 12 ساعة',en:'every 12 hours'},max:{ar:'لا يزيد على 60 ملغ (10 مل) في 24 ساعة',en:'No more than 60 mg (10 mL) in 24 hours'}}]},
      {kind:'adult', ageM:[144,1e9], ref:148, text:{ar:'180 ملغ مرة يومياً مع الماء، أو 60 ملغ (10 مل من الشراب) كل 12 ساعة',en:'180 mg once a day with water, or 60 mg (10 mL of suspension) every 12 hours'}}],
    duration:{ar:'ما دامت الأعراض',en:'While symptoms last'},
    patient:[{ar:'رجّ العبوة جيداً قبل كل جرعة.',en:'Shake well before each dose.'},{ar:'لا يُعطى مع عصائر الفاكهة، ولا مع مضادات الحموضة في الوقت نفسه.',en:'Do not give with fruit juice, or at the same time as antacids.'}]},
  chlorpheniramine: { ageOnly:true, strengths:[{c:2,ref:152}],
    segs:[
      {kind:'doctor', ageM:[0,72], ref:149, msg:{ar:'أقل من 6 سنوات: لا يُستعمل (النشرة). منظمة الصحة العالمية تذكر من سنة إلى سنتين 1 ملغ مرتين يومياً، ومن 2 إلى 6 سنوات 1 ملغ كل 4 إلى 6 ساعات (حد 6 ملغ)، ولا يُنصح به تحت سنة؛ يقرر ذلك الطبيب.',en:'Under 6 years: do not use (label). WHO lists 1 mg twice a day from 1 to 2 years and 1 mg every 4 to 6 hours (max 6 mg) from 2 to 6 years, and not under 1 year; the doctor decides.'}},
      {kind:'chart', ageM:[72,144], ref:149, rows:[
        {age:[6,11],mg:2,freq:{ar:'كل 4 إلى 6 ساعات (نصف قرص 4 ملغ)',en:'every 4 to 6 hours (half a 4 mg tablet)'},max:{ar:'لا يزيد على 12 ملغ (3 أقراص) في 24 ساعة',en:'No more than 12 mg (3 tablets) in 24 hours'}}]},
      {kind:'adult', ageM:[144,1e9], ref:149, text:{ar:'4 ملغ كل 4 إلى 6 ساعات، بحد 24 ملغ (6 أقراص) في 24 ساعة',en:'4 mg every 4 to 6 hours, up to 24 mg (6 tablets) in 24 hours'}}],
    duration:{ar:'ما دامت الأعراض',en:'While symptoms last'},
    patient:[{ar:'يسبب النعاس، وقد يسبب تهيجاً عند الأطفال.',en:'Causes drowsiness, and may cause excitability in children.'},{ar:'لا يُستعمل لتنويم الطفل.',en:'Do not use it to make a child sleepy.'}]},
  diphenhydramine: { ageOnly:true, strengths:[{c:12.5,ref:150}],
    segs:[
      {kind:'doctor', ageM:[0,72], ref:150, msg:{ar:'أقل من سنتين: لا يُستعمل. من 2 إلى 5 سنوات: لا يُستعمل إلا بتوجيه الطبيب (النشرة).',en:'Under 2 years: do not use. 2 to 5 years: only if directed by a doctor (label).'}},
      {kind:'chart', ageM:[72,144], ref:150, rows:[
        {age:[6,11],mg:12.5,mg2:25,freq:{ar:'كل 4 إلى 6 ساعات',en:'every 4 to 6 hours'},max:{ar:'لا يزيد على 6 جرعات في 24 ساعة',en:'No more than 6 doses in 24 hours'}}]},
      {kind:'adult', ageM:[144,1e9], ref:153, text:{ar:'25 إلى 50 ملغ كل 4 إلى 6 ساعات، بحد 6 جرعات في 24 ساعة',en:'25 to 50 mg every 4 to 6 hours, up to 6 doses in 24 hours'}}],
    duration:{ar:'ما دامت الأعراض',en:'While symptoms last'},
    patient:[{ar:'نعاس واضح، وقد يسبب تهيجاً عند الأطفال.',en:'Marked drowsiness; may cause excitability in children.'},{ar:'لا تستعمل معه أي منتج آخر فيه ديفينهيدرامين، حتى الكريمات.',en:'Do not use any other product with diphenhydramine, even creams.'}]},
  levocetirizine: { ageOnly:true, strengths:[],
    segs:[
      {kind:'doctor', ageM:[0,72], ref:143, msg:{ar:'أقل من 6 سنوات: هذه النشرة (أقراص) لا تذكر جرعة؛ يقرر ذلك الطبيب.',en:'Under 6 years: this (tablet) label gives no dose; the doctor decides.'}},
      {kind:'chart', ageM:[72,144], ref:143, rows:[
        {age:[6,11],mg:2.5,freq:{ar:'مرة يومياً مساءً (نصف قرص 5 ملغ)',en:'once a day in the evening (half a 5 mg tablet)'},max:{ar:'لا تُتجاوز 2.5 ملغ؛ ممنوع مع قصور الكلى عند الأطفال',en:'Do not exceed 2.5 mg; contraindicated with kidney impairment in children'}}]},
      {kind:'adult', ageM:[144,1e9], ref:143, text:{ar:'5 ملغ مرة يومياً مساءً (قد تكفي 2.5 ملغ)',en:'5 mg once a day in the evening (2.5 mg may be enough)'}}],
    duration:{ar:'مرة يومياً مساءً',en:'Once a day in the evening'}, patient:[]},
  desloratadine: { ageOnly:true, strengths:[],
    segs:[
      {kind:'doctor', ageM:[0,144], ref:146, msg:{ar:'أقل من 12 سنة: هذه النشرة (أقراص) لا تذكر جرعة؛ يقرر ذلك الطبيب.',en:'Under 12 years: this (tablet) label gives no dose; the doctor decides.'}},
      {kind:'adult', ageM:[144,1e9], ref:146, text:{ar:'5 ملغ مرة يومياً',en:'5 mg once a day'}}], duration:{ar:'مرة يومياً',en:'Once a day'}, patient:[]},
  hydroxyzine: { ageOnly:true, strengths:[],
    segs:[
      {kind:'chart', ageM:[0,216], ref:151, perDay:true, rows:[
        {age:[0,5],mg:50,freq:{ar:'في اليوم، مقسمة على جرعات (الحكة أو القلق)',en:'a day, in divided doses (itching or anxiety)'},max:{ar:'الأطفال أقل من 6 سنوات',en:'Children under 6 years'}},
        {age:[6,17],mg:50,mg2:100,freq:{ar:'في اليوم، مقسمة على جرعات (الحكة أو القلق)',en:'a day, in divided doses (itching or anxiety)'},max:{ar:'الأطفال أكثر من 6 سنوات',en:'Children over 6 years'}}]},
      {kind:'adult', ageM:[216,1e9], ref:151, text:{ar:'الحكة: 25 ملغ 3 أو 4 مرات يومياً؛ القلق: 50 إلى 100 ملغ 4 مرات يومياً',en:'Itching: 25 mg three or four times a day; anxiety: 50 to 100 mg four times a day'}}],
    duration:{ar:'حسب الطبيب',en:'As the doctor directs'}, patient:[]}
});
/* oral corticosteroids for children: a daily range in mg per kg (mgkgRange). The labels set no upper age; adults from 18. */
Object.assign(BANDS, {
  prednisolone: { strengths:[{c:10,ref:154},{c:15,ref:154},{c:20,ref:154},{c:25,ref:154}], defWhy:'asthma',
    opts:[{id:'why',options:[['asthma',{ar:'ربو غير منضبط (دفعة قصيرة)',en:'Uncontrolled asthma (short burst)'}],['gen',{ar:'أمراض أخرى (الجرعة الأولى)',en:'Other conditions (initial dose)'}]]}],
    segs:[
      {kind:'mgkgRange', ageM:[0,216], lb:[0,96], byWhy:{
        asthma:{mgkgDay:[1,2], maxMg:60, maxRef:152, ref:154, freq:{ar:'في اليوم، مرة واحدة أو مقسمة، لمدة 3 إلى 10 أيام عادة',en:'a day, once or divided, usually for 3 to 10 days'}},
        gen:{mgkgDay:[0.14,2], ref:154, freq:{ar:'في اليوم، مقسمة على 3 أو 4 جرعات',en:'a day, in 3 or 4 divided doses'}}}},
      {kind:'adult', ageM:[216,1e9], lb:[96,1e9], ref:154, text:{ar:'5 إلى 60 ملغ يومياً حسب المرض',en:'5 to 60 mg a day by disease'}}],
    duration:{ar:'حسب الطبيب؛ لا يُوقف فجأة بعد أكثر من بضعة أيام',en:'As the doctor directs; do not stop suddenly after more than a few days'},
    patient:[{ar:'يُعطى مع الطعام أو الحليب.',en:'Give with food or milk.'},{ar:'لا توقفه فجأة دون الطبيب إذا استمر أكثر من بضعة أيام.',en:'Do not stop it suddenly without the doctor if used for more than a few days.'},{ar:'راجع الطبيب فوراً إذا خالط الطفل مصاباً بالجديري أو الحصبة.',en:'See the doctor at once if the child is exposed to chickenpox or measles.'}]},
  dexamethasone: { strengths:[], defWhy:'gen',
    segs:[
      {kind:'mgkgRange', ageM:[0,216], lb:[0,96], byWhy:{gen:{mgkgDay:[0.02,0.3], ref:156, freq:{ar:'في اليوم، مقسمة على 3 أو 4 جرعات',en:'a day, in 3 or 4 divided doses'}}}},
      {kind:'adult', ageM:[216,1e9], lb:[96,1e9], ref:156, text:{ar:'0.75 إلى 9 ملغ يومياً حسب المرض',en:'0.75 to 9 mg a day by disease'}}],
    duration:{ar:'حسب الطبيب؛ يُخفض تدريجياً',en:'As the doctor directs; taper gradually'}, patient:[]}
});
/* GI drugs. kgChart = the label's table by weight in kg (rows kg [from, to), `hiIn` = the upper limit included);
   mgkgRange with mgkgDose = mg per kg per dose (famotidine suspension). wtFirst: the label says «use weight if possible». */
const GI_DAY={ar:'مرة يومياً',en:'once a day'};
Object.assign(BANDS, {
  omeprazole: { strengths:[],
    segs:[
      {kind:'doctor', ageM:[0,1], ref:160, msg:{ar:'أقل من شهر: لا تذكر النشرة جرعة.',en:'Under 1 month: the label gives no dose.'}},
      {kind:'kgChart', ageM:[1,12], ref:160, freq:{ar:'مرة يومياً حتى 6 أسابيع (التهاب المريء التآكلي)',en:'once a day for up to 6 weeks (erosive esophagitis)'},
        below:{ar:'أقل من 3 كغ: لا تذكر النشرة جرعة.',en:'Under 3 kg: the label gives no dose.'},
        rows:[{kg:[3,5],mg:2.5},{kg:[5,10],mg:5},{kg:[10,1e9],mg:10}]},
      {kind:'kgChart', ageM:[12,204], lb:[0,96], ref:160, freq:{ar:'مرة يومياً: الارتجاع حتى 4 أسابيع، والتهاب المريء التآكلي 4 إلى 8 أسابيع',en:'once a day: GERD up to 4 weeks, erosive esophagitis 4 to 8 weeks'},
        below:{ar:'أقل من 5 كغ (من سنة): لا تذكر النشرة جرعة. للرضيع أقل من سنة اختر «أشهر» واكتب العمر.',en:'Under 5 kg (from 1 year): the label gives no dose. For an infant under 1 year choose «months» and enter the age.'},
        hint:{ar:'جدول الأطفال من 1 إلى 16 سنة. للرضيع أقل من سنة اختر «أشهر».',en:'Chart for children 1 to 16 years. For an infant under 1 year choose «months».'},
        rows:[{kg:[5,10],mg:5},{kg:[10,20],mg:10},{kg:[20,1e9],mg:20}]},
      {kind:'adult', ageM:[204,1e9], ref:160, text:{ar:'20 ملغ مرة يومياً (الارتجاع حتى 4 أسابيع)',en:'20 mg once a day (GERD up to 4 weeks)'}}],
    duration:{ar:'الارتجاع حتى 4 أسابيع؛ التهاب المريء 4 إلى 8 أسابيع (الرضع حتى 6 أسابيع)',en:'GERD up to 4 weeks; esophagitis 4 to 8 weeks (infants up to 6 weeks)'},
    patient:[{ar:'يُعطى قبل الطعام.',en:'Give before a meal.'},{ar:'لا تُسحق الكبسولة ولا تُمضغ.',en:'Do not crush or chew the capsule.'}]},
  pantoprazole: { strengths:[],
    segs:[
      {kind:'doctor', ageM:[0,60], ref:163, msg:{ar:'أقل من 5 سنوات: لا توجد قوة مناسبة للعمر (النشرة).',en:'Under 5 years: no age-appropriate strength (label).'}},
      {kind:'kgChart', ageM:[60,204], lb:[0,96], ref:163, freq:{ar:'مرة يومياً حتى 8 أسابيع (التهاب المريء التآكلي)',en:'once a day for up to 8 weeks (erosive esophagitis)'},
        below:{ar:'أقل من 15 كغ: لا تذكر النشرة جرعة.',en:'Under 15 kg: the label gives no dose.'},
        hint:{ar:'جدول الأطفال من 5 سنوات. أقل من 5 سنوات: لا يُعطى.',en:'Chart for children from 5 years. Under 5 years: not given.'},
        rows:[{kg:[15,40],mg:20},{kg:[40,1e9],mg:40}]},
      {kind:'adult', ageM:[204,1e9], ref:163, text:{ar:'40 ملغ مرة يومياً حتى 8 أسابيع',en:'40 mg once a day for up to 8 weeks'}}],
    duration:{ar:'حتى 8 أسابيع',en:'Up to 8 weeks'},
    patient:[{ar:'يُبلع القرص كاملاً؛ لا يُقسم ولا يُمضغ.',en:'Swallow the tablet whole; do not split or chew.'}]},
  lansoprazole: { strengths:[],
    segs:[
      {kind:'doctor', ageM:[0,12], ref:164, msg:{ar:'أقل من سنة: لا تذكر النشرة جرعة.',en:'Under 1 year: the label gives no dose.'}},
      {kind:'kgChart', ageM:[12,144], lb:[0,96], ref:164, freq:{ar:'مرة يومياً حتى 12 أسبوعاً',en:'once a day for up to 12 weeks'},
        hint:{ar:'جدول الأطفال من 1 إلى 11 سنة.',en:'Chart for children 1 to 11 years.'},
        rows:[{kg:[0,30],hiIn:true,mg:15},{kg:[30,1e9],mg:30}]},
      {kind:'adult', ageM:[144,1e9], ref:164, text:{ar:'الارتجاع 15 ملغ، والتهاب المريء التآكلي 30 ملغ، مرة يومياً حتى 8 أسابيع',en:'GERD 15 mg, erosive esophagitis 30 mg, once a day for up to 8 weeks'}}],
    duration:{ar:'حتى 12 أسبوعاً؛ لا تُتجاوز الجرعة والمدة',en:'Up to 12 weeks; do not exceed the dose or duration'},
    patient:[{ar:'يُعطى قبل الطعام.',en:'Give before a meal.'},{ar:'لا تُسحق الكبسولة ولا تُمضغ.',en:'Do not crush or chew the capsule.'}]},
  famotidine: { strengths:[{c:40,ref:166}], defWhy:'gerd',
    opts:[{id:'why',options:[['gerd',{ar:'ارتجاع',en:'GERD'}],['pud',{ar:'قرحة هضمية (من سنة)',en:'Peptic ulcer (from 1 year)'}]]}],
    segs:[
      {kind:'mgkgRange', ageM:[0,3], ref:166, byWhy:{gerd:{mgkgDose:[0.5,1], ref:166, freq:{ar:'مرة يومياً؛ البداية 0.5 ملغ/كغ ويمكن رفعها إلى 1 ملغ/كغ',en:'once a day; start 0.5 mg/kg, may increase to 1 mg/kg'}}}},
      {kind:'mgkgRange', ageM:[3,12], ref:166, byWhy:{gerd:{mgkgDose:[0.5,1], ref:166, max:{ar:'الحد 40 ملغ في اليوم',en:'maximum 40 mg a day'}, freq:{ar:'مرتين يومياً؛ البداية 0.5 ملغ/كغ ويمكن رفعها إلى 1 ملغ/كغ',en:'twice a day; start 0.5 mg/kg, may increase to 1 mg/kg'}}}},
      {kind:'mgkgRange', ageM:[12,204], lb:[0,96], ref:166,
        note:{ar:'هذه جرعة 1 إلى أقل من 17 سنة. للرضيع أقل من سنة اختر «أشهر» واكتب العمر.',en:'This is the dose for 1 to under 17 years. For an infant under 1 year choose «months» and enter the age.'},
        byWhy:{gerd:{mgkgDose:[0.5,0.5], maxMg:40, ref:166, max:{ar:'الحد 40 ملغ مرتين يومياً',en:'maximum 40 mg twice a day'}, freq:{ar:'مرتين يومياً، 6 إلى 12 أسبوعاً',en:'twice a day, for 6 to 12 weeks'}},
          pud:{mgkgDose:[0.5,1], maxMg:40, ref:166, max:{ar:'الحد 40 ملغ في اليوم',en:'maximum 40 mg a day'}, freq:{ar:'مرة يومياً قبل النوم؛ البداية 0.5 ملغ/كغ ويمكن رفعها إلى 1 ملغ/كغ، 8 أسابيع',en:'once a day at bedtime; start 0.5 mg/kg, may increase to 1 mg/kg, for 8 weeks'}}}},
      {kind:'adult', ageM:[204,1e9], ref:165, text:{ar:'الارتجاع 20 ملغ مرتين يومياً حتى 6 أسابيع',en:'GERD 20 mg twice a day for up to 6 weeks'}}],
    duration:{ar:'حسب الاستعمال؛ يُعاد تقييم الرضيع بعد 4 أسابيع',en:'By use; re-evaluate an infant after 4 weeks'},
    patient:[{ar:'رجّ العبوة قبل كل جرعة، واستعمل أداة القياس.',en:'Shake the bottle before each dose and use a measuring device.'},{ar:'يُعطى مرة قبل النوم أو مرتين صباحاً وقبل النوم.',en:'Give once at bedtime, or twice: morning and bedtime.'}]},
  ondansetron: { ageOnly:true, strengths:[],
    segs:[
      {kind:'doctor', ageM:[0,48], ref:167, msg:{ar:'أقل من 4 سنوات: لا تذكر النشرة جرعة فموية.',en:'Under 4 years: the label gives no oral dose.'}},
      {kind:'chart', ageM:[48,144], ref:167, rows:[{age:[4,11],mg:4,freq:{ar:'قبل العلاج الكيميائي بـ30 دقيقة، ثم بعد 4 و8 ساعات من الأولى',en:'30 minutes before chemotherapy, then 4 and 8 hours after the first dose'},max:{ar:'ثم 4 ملغ 3 مرات يومياً 1 إلى 2 يوم بعد العلاج',en:'then 4 mg three times a day for 1 to 2 days after chemotherapy'}}]},
      {kind:'adult', ageM:[144,1e9], ref:167, text:{ar:'8 ملغ قبل العلاج بـ30 دقيقة، و8 ملغ بعد 8 ساعات، ثم 8 ملغ مرتين يومياً 1 إلى 2 يوم',en:'8 mg 30 minutes before, 8 mg 8 hours later, then 8 mg twice a day for 1 to 2 days'}}],
    duration:{ar:'1 إلى 2 يوم بعد العلاج الكيميائي',en:'1 to 2 days after chemotherapy'},
    patient:[{ar:'الجرعة الأولى قبل العلاج الكيميائي بنصف ساعة.',en:'The first dose half an hour before chemotherapy.'}]},
  loperamide: { wtFirst:true, strengths:[],
    segs:[
      {kind:'doctor', ageM:[0,24], lb:[0,34], ref:169, msg:{ar:'أقل من سنتين (حتى 33 رطلاً): لا يُستعمل (النشرة).',en:'Under 2 years (up to 33 lb): do not use (label).'}},
      {kind:'doctor', ageM:[24,72], lb:[34,48], ref:169, msg:{ar:'من 2 إلى 5 سنوات (34 إلى 47 رطلاً): يُسأل الطبيب (النشرة).',en:'2 to 5 years (34 to 47 lb): ask a doctor (label).'}},
      {kind:'chart', ageM:[72,144], lb:[48,96], ref:169, rows:[
        {lb:[48,59],age:[6,8],mg:2,freq:{ar:'بعد أول براز رخو، ثم 1 ملغ (نصف قرص) بعد كل براز رخو',en:'after the first loose stool, then 1 mg (half a tablet) after each loose stool'},max:{ar:'لا يزيد على 4 ملغ (قرصين) في 24 ساعة',en:'no more than 4 mg (2 tablets) in 24 hours'}},
        {lb:[60,95],age:[9,11],mg:2,freq:{ar:'بعد أول براز رخو، ثم 1 ملغ (نصف قرص) بعد كل براز رخو',en:'after the first loose stool, then 1 mg (half a tablet) after each loose stool'},max:{ar:'لا يزيد على 6 ملغ (3 أقراص) في 24 ساعة',en:'no more than 6 mg (3 tablets) in 24 hours'}}]},
      {kind:'adult', ageM:[144,1e9], lb:[96,1e9], ref:169, text:{ar:'4 ملغ بعد أول براز رخو، ثم 2 ملغ بعد كل براز رخو، بحد 8 ملغ في 24 ساعة',en:'4 mg after the first loose stool, then 2 mg after each loose stool, up to 8 mg in 24 hours'}}],
    duration:{ar:'يُراجع الطبيب إذا استمر الإسهال أكثر من يومين',en:'See a doctor if diarrhoea lasts more than 2 days'},
    patient:[{ar:'اشرب الكثير من السوائل الصافية.',en:'Drink plenty of clear fluids.'},{ar:'لا يُعطى مع براز فيه دم أو أسود.',en:'Do not give with bloody or black stool.'},{ar:'لا تتجاوز الجرعة: الزيادة قد تضر القلب.',en:'Do not give more than directed: too much can harm the heart.'}]}
});
if(typeof module!=='undefined')module.exports={BANDS};
