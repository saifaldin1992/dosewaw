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
if(typeof module!=='undefined')module.exports={BANDS};
