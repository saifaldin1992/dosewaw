/* DOSEWAW · js/rules/analgesics.js — adult dose rules of the analgesics group, in the same format as js/rules/antibiotics.js
   (read by abEval in js/engine.js). Children: js/rules/bands.js. Every number is copied from the source in `label`/srcIds.
   Where a label gives no number (e.g. «advanced renal disease»), the pharmacist answers a question; nothing is guessed. */
Object.assign(ABC_RULES, {
  paracetamol: {
    name:{ar:'باراسيتامول',en:'Paracetamol'},
    label:'DailyMed, acetaminophen 500 mg (2026-11-09); acetaminophen injection (2026-09-24) 4, 5.1, 8.6, 8.7', srcIds:[128,129],
    inputs:[
      {id:'liver',type:'select',label:{ar:'الكبد',en:'Liver'},options:[['ok',{ar:'لا يوجد مرض كبدي معروف',en:'No known liver disease'}],['dis',{ar:'قصور كبدي أو مرض كبدي نشط',en:'Hepatic impairment or active liver disease'}],['sev',{ar:'قصور كبدي شديد أو مرض كبدي نشط شديد',en:'Severe hepatic impairment or severe active liver disease'}]]},
      {id:'alc',type:'check',label:{ar:'3 مشروبات كحولية أو أكثر يومياً',en:'3 or more alcoholic drinks every day'}}
    ],
    rows:[
      {k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 years and over)'},strong:true,rules:[
        {when:{liver:'sev'},warn:true,text:{ar:'ممنوع: قصور كبدي شديد أو مرض كبدي نشط شديد',en:'Contraindicated: severe hepatic impairment or severe active liver disease'}},
        {when:{},text:{ar:'1000 ملغ كل 6 ساعات عند الحاجة، بحد 3000 ملغ في 24 ساعة',en:'1,000 mg every 6 hours as needed, up to 3,000 mg in 24 hours'}}
      ]},
      {k:{ar:'الحد من كل المصادر',en:'Maximum from all sources'},rules:[
        {when:{},text:{ar:'4000 ملغ في اليوم من كل الطرق وكل الأدوية التي تحتوي باراسيتامول',en:'4,000 mg a day from all routes and all products containing paracetamol'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{crcl:{lte:30}},text:{ar:'قد يلزم إطالة الفاصل بين الجرعات وتقليل الجرعة اليومية (نشرة الحقن 8.7)',en:'Longer dosing intervals and a lower daily dose may be needed (injection label 8.7)'}},
        {when:{},text:{ar:'لا تعديل في النشرة',en:'No change in the label'}}
      ]},
      {k:{ar:'تنبيه الكبد',en:'Liver warning'},warn:true,opt:true,rules:[
        {when:{liver:'dis'},text:{ar:'يُستعمل بحذر مع القصور الكبدي أو مرض الكبد النشط',en:'Use with caution in hepatic impairment or active liver disease'}},
        {when:{alc:true},text:{ar:'خطر ضرر شديد للكبد مع 3 مشروبات كحولية أو أكثر يومياً',en:'Risk of severe liver damage with 3 or more alcoholic drinks a day'}}
      ]},
      {k:{ar:'المدة',en:'Duration'},rules:[
        {when:{},text:{ar:'لا يزيد على 10 أيام إلا بتوجيه الطبيب',en:'No more than 10 days unless directed by a doctor'}}
      ]}
    ],
    notes:{ar:'لا يُجمع مع أي دواء آخر يحتوي باراسيتامول.',en:'Do not combine with any other medicine containing paracetamol.'}
  },
  ibuprofen: {
    name:{ar:'إيبوبروفين',en:'Ibuprofen'},
    label:'DailyMed, ibuprofen 200 mg OTC (2026-11-04); ibuprofen tablets Rx (2026-11-09); WHO Model Formulary for Children 2010', srcIds:[133,131,134],
    inputs:[
      {id:'use',type:'select',label:{ar:'طريقة الصرف',en:'Supply'},options:[['otc',{ar:'بدون وصفة',en:'Over the counter'}],['rx',{ar:'بوصفة: ألم خفيف إلى متوسط',en:'Prescription: mild to moderate pain'}]]},
      {id:'renal',type:'select',label:{ar:'الكلى (حسب تقدير الصيدلي)',en:'Kidney (pharmacist’s assessment)'},options:[['ok',{ar:'طبيعية',en:'Normal'}],['mild',{ar:'قصور خفيف',en:'Mild impairment'}],['adv',{ar:'قصور متوسط إلى شديد أو مرض كلوي متقدم',en:'Moderate to severe impairment or advanced renal disease'}]]},
      {id:'preg20',type:'check',label:{ar:'حامل في الأسبوع 20 أو بعده',en:'Pregnant, 20 weeks or later'}}
    ],
    rows:[
      {k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 years and over)'},strong:true,rules:[
        {when:{renal:'adv'},warn:true,text:{ar:'لا يُنصح به: يُتجنّب في القصور الكلوي المتوسط إلى الشديد، وإن لزم فمع مراقبة دقيقة لوظائف الكلى',en:'Not recommended: avoid in moderate to severe impairment; if it must be used, monitor kidney function closely'}},
        {when:{use:'rx'},text:{ar:'400 ملغ كل 4 إلى 6 ساعات عند الحاجة؛ الحد اليومي الكلي 3200 ملغ',en:'400 mg every 4 to 6 hours as needed; never more than 3,200 mg a day in total'}},
        {when:{},text:{ar:'200 ملغ كل 4 إلى 6 ساعات، و400 ملغ إذا لم تكفِ 200، بحد 1200 ملغ في 24 ساعة',en:'200 mg every 4 to 6 hours, 400 mg if 200 mg does not help, up to 1,200 mg in 24 hours'}}
      ]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{renal:'mild'},text:{ar:'أقل جرعة فعالة مع مراقبة وظائف الكلى (WHO)',en:'Lowest effective dose and monitor kidney function (WHO)'}},
        {when:{renal:'adv'},text:{ar:'يُتجنّب (WHO)؛ لا يُنصح به في المرض الكلوي المتقدم (النشرة)',en:'Avoid (WHO); not recommended in advanced renal disease (label)'}},
        {when:{},text:{ar:'لا تعديل؛ الخطر أكبر مع الجفاف ومدرات البول ومثبطات ACE وكبار السن',en:'No change; higher risk with dehydration, diuretics, ACE inhibitors and in older people'}}
      ]},
      {k:{ar:'الحمل',en:'Pregnancy'},warn:true,opt:true,rules:[
        {when:{preg20:true},text:{ar:'لا يُستعمل من الأسبوع 20 من الحمل إلا بتوجيه صريح من الطبيب',en:'Do not use from 20 weeks of pregnancy unless definitely directed by a doctor'}}
      ]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[
        {when:{},text:{ar:'مع الطعام أو الحليب إذا سبّب اضطراب المعدة؛ أقل جرعة فعالة لأقصر مدة',en:'With food or milk if it upsets the stomach; lowest effective dose for the shortest time'}}
      ]}
    ],
    notes:{ar:'لا يُجمع مع الأسبرين أو مضادات الالتهاب الأخرى.',en:'Do not combine with aspirin or other NSAIDs.'}
  }
});
