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

/* the other analgesics: adults only (each says what its label allows for children in `kids`) */
const NSAID_PREG={id:'preg',type:'select',label:{ar:'الحمل',en:'Pregnancy'},options:[['no',{ar:'غير حامل',en:'Not pregnant'}],['w20',{ar:'من الأسبوع 20 إلى 29',en:'20 to 29 weeks'}],['w30',{ar:'الأسبوع 30 أو بعده',en:'30 weeks or later'}]]};
const NSAID_PREG_ROW={k:{ar:'الحمل',en:'Pregnancy'},warn:true,opt:true,rules:[
  {when:{preg:'w30'},text:{ar:'يُتجنّب من الأسبوع 30 (إغلاق القناة الشريانية مبكراً)',en:'Avoid from about 30 weeks (premature closure of the ductus arteriosus)'}},
  {when:{preg:'w20'},text:{ar:'يُحدّ استعماله بين الأسبوع 20 و30 (قلة السائل الأمنيوسي، كلى الجنين)',en:'Limit use between about 20 and 30 weeks (oligohydramnios, fetal kidneys)'}}]};
const ADV_RENAL={id:'renal',type:'select',label:{ar:'الكلى (حسب تقدير الصيدلي)',en:'Kidney (pharmacist’s assessment)'},options:[['ok',{ar:'لا مرض كلوي متقدم',en:'No advanced renal disease'}],['adv',{ar:'مرض كلوي متقدم',en:'Advanced renal disease'}]]};
Object.assign(ABC_RULES, {
  naproxen: {
    name:{ar:'نابروكسين',en:'Naproxen'}, label:'DailyMed, naproxen tablets (2026-11-09) 2.2-2.5, 8.6, 8.7', srcIds:[135],
    kids:{ar:'التهاب المفاصل اليفعي: نحو 10 ملغ/كغ يومياً على جرعتين، والأقراص غير مناسبة لأقل من 50 كغ (النشرة 2.3).',en:'Juvenile arthritis: about 10 mg/kg a day in 2 doses; tablets are not suitable under 50 kg (label 2.3).'},
    inputs:[{id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['pain',{ar:'الألم وآلام الدورة والأوتار',en:'Pain, period pain, tendonitis'}],['gout',{ar:'نوبة نقرس حادة',en:'Acute gout'}],['arth',{ar:'التهاب المفاصل',en:'Arthritis'}]]},NSAID_PREG],
    rows:[
      {k:{ar:'تنبيه الكلى',en:'Kidney warning'},warn:true,opt:true,rules:[{when:{crcl:{lt:30}},text:{ar:'لا يُنصح به: تصفية الكرياتينين أقل من 30 مل/دقيقة',en:'Not recommended: creatinine clearance under 30 mL/min'}}]},
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{ind:'gout'},text:{ar:'750 ملغ أولاً، ثم 250 ملغ كل 8 ساعات حتى تهدأ النوبة',en:'750 mg first, then 250 mg every 8 hours until the attack subsides'}},
        {when:{ind:'arth'},text:{ar:'250 أو 375 أو 500 ملغ مرتين يومياً (حتى 1500 ملغ يومياً لمدة تصل 6 أشهر لمن يتحمل)',en:'250, 375 or 500 mg twice a day (up to 1,500 mg a day for up to 6 months if tolerated)'}},
        {when:{},text:{ar:'500 ملغ أولاً، ثم 250 ملغ كل 6 إلى 8 ساعات عند الحاجة، بحد 1250 ملغ يومياً',en:'500 mg first, then 250 mg every 6 to 8 hours as needed, up to 1,250 mg a day'}}]},
      {k:{ar:'الكلى',en:'Kidney'},rules:[
        {when:{crcl:{lt:30}},text:{ar:'لا يُنصح به (النشرة 8.7)',en:'Not recommended (label 8.7)'}},
        {when:{},text:{ar:'لا تعديل؛ تُراقب الكلى مع الجفاف ومدرات البول ومثبطات ACE',en:'No change; monitor kidneys with dehydration, diuretics, ACE inhibitors'}}]},
      NSAID_PREG_ROW],
    notes:{ar:'أشكال النابروكسين وتركيزاته غير متبادلة (النشرة 2.6).',en:'Naproxen strengths and forms are not interchangeable (label 2.6).'}
  },
  diclofenac_k: {
    name:{ar:'ديكلوفيناك البوتاسيوم',en:'Diclofenac potassium'}, label:'DailyMed, diclofenac potassium tablets (2026-11-02)', srcIds:[136],
    kids:{ar:'لا تذكر النشرة جرعة للأطفال.',en:'The label gives no dose for children.'},
    inputs:[{id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['pain',{ar:'الألم وآلام الدورة',en:'Pain and period pain'}],['oa',{ar:'التهاب المفاصل التنكسي',en:'Osteoarthritis'}],['ra',{ar:'التهاب المفاصل الروماتويدي',en:'Rheumatoid arthritis'}]]},ADV_RENAL,NSAID_PREG],
    rows:[
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{renal:'adv'},warn:true,text:{ar:'يُتجنّب في المرض الكلوي المتقدم إلا إذا رجحت الفائدة، مع مراقبة الكلى',en:'Avoid in advanced renal disease unless the benefit outweighs the risk; monitor kidneys'}},
        {when:{ind:'oa'},text:{ar:'100 إلى 150 ملغ يومياً مقسمة: 50 ملغ مرتين أو ثلاث مرات',en:'100 to 150 mg a day divided: 50 mg two or three times'}},
        {when:{ind:'ra'},text:{ar:'150 إلى 200 ملغ يومياً مقسمة: 50 ملغ ثلاث أو أربع مرات',en:'150 to 200 mg a day divided: 50 mg three or four times'}},
        {when:{},text:{ar:'50 ملغ ثلاث مرات يومياً (قد يبدأ بعض المرضى بـ100 ملغ ثم 50 ملغ)',en:'50 mg three times a day (some patients start with 100 mg, then 50 mg)'}}]},
      {k:{ar:'الكبد',en:'Liver'},rules:[{when:{},text:{ar:'تُفحص إنزيمات الكبد خلال 4 إلى 8 أسابيع من البدء، ويُوقف عند علامات مرض الكبد',en:'Check liver enzymes within 4 to 8 weeks of starting; stop with signs of liver disease'}}]},
      NSAID_PREG_ROW],
    notes:{ar:'أشكال الديكلوفيناك المختلفة غير متكافئة حتى لو تساوى الملغ.',en:'Different diclofenac forms are not equivalent even at the same mg.'}
  },
  mefenamic: {
    name:{ar:'حمض الميفيناميك',en:'Mefenamic acid'}, label:'DailyMed, mefenamic acid capsules (2026-04-20) 1, 2.2, 2.3, 8.6', srcIds:[137],
    kids:{ar:'معتمد من 14 سنة فقط (النشرة 1.1).',en:'Approved from 14 years only (label 1.1).'},
    inputs:[{id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['pain',{ar:'ألم خفيف إلى متوسط',en:'Mild to moderate pain'}],['dys',{ar:'آلام الدورة',en:'Period pain'}]]},ADV_RENAL,
      {id:'liver',type:'check',label:{ar:'مرض كبدي حاد أو مزمن',en:'Acute or chronic liver disease'}},NSAID_PREG],
    rows:[
      {k:{ar:'الجرعة (14 سنة فأكثر)',en:'Dose (14 years and over)'},strong:true,rules:[
        {when:{renal:'adv'},warn:true,text:{ar:'يُتجنّب في المرض الكلوي المتقدم إلا إذا رجحت الفائدة',en:'Avoid in advanced renal disease unless the benefit outweighs the risk'}},
        {when:{ind:'dys'},text:{ar:'500 ملغ أولاً، ثم 250 ملغ كل 6 ساعات، تبدأ مع بداية النزف والأعراض',en:'500 mg first, then 250 mg every 6 hours, starting with the onset of bleeding and symptoms'}},
        {when:{},text:{ar:'500 ملغ أولاً، ثم 250 ملغ كل 6 ساعات عند الحاجة',en:'500 mg first, then 250 mg every 6 hours as needed'}}]},
      {k:{ar:'المدة',en:'Duration'},rules:[{when:{},text:{ar:'لا تتجاوز أسبوعاً (7 أيام)',en:'No more than one week (7 days)'}}]},
      {k:{ar:'الكبد',en:'Liver'},warn:true,opt:true,rules:[{when:{liver:true},text:{ar:'قد تلزم جرعات أقل مع مرض الكبد',en:'Lower doses may be needed with liver disease'}}]},
      NSAID_PREG_ROW],
    notes:{ar:'مضادات الحموضة التي فيها هيدروكسيد المغنيسيوم تزيد امتصاصه.',en:'Antacids with magnesium hydroxide increase its absorption.'}
  },
  aspirin: {
    name:{ar:'أسبرين',en:'Aspirin'}, label:'DailyMed, aspirin 325 mg OTC (2026-11-05); WHO Model Formulary for Children 2010', srcIds:[138,134],
    kids:{ar:'تحت 12 سنة: لا يُستعمل إلا بتوجيه الطبيب (النشرة)، ولا يُستعمل للألم والحرارة تحت 16 سنة بسبب متلازمة راي (WHO).',en:'Under 12 years: only if directed by a doctor (label); not for pain or fever under 16 years because of Reye’s syndrome (WHO).'},
    inputs:[{id:'renal',type:'select',label:{ar:'الكلى',en:'Kidney'},options:[['ok',{ar:'طبيعية',en:'Normal'}],['dis',{ar:'مرض كلوي',en:'Kidney disease'}],['sev',{ar:'قصور كلوي شديد',en:'Severe renal impairment'}]]},
      {id:'preg20',type:'check',label:{ar:'حامل في الأسبوع 20 أو بعده',en:'Pregnant, 20 weeks or later'}}],
    rows:[
      {k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 years and over)'},strong:true,rules:[
        {when:{renal:'sev'},warn:true,text:{ar:'يُتجنّب في القصور الكلوي الشديد (WHO)',en:'Avoid in severe renal impairment (WHO)'}},
        {when:{},text:{ar:'325 إلى 650 ملغ كل 4 ساعات، أو 975 ملغ كل 6 ساعات، بحد 3900 ملغ (12 قرصاً) في 24 ساعة',en:'325 to 650 mg every 4 hours, or 975 mg every 6 hours, up to 3,900 mg (12 tablets) in 24 hours'}}]},
      {k:{ar:'الكلى',en:'Kidney'},warn:true,opt:true,rules:[{when:{renal:'dis'},text:{ar:'يُسأل الطبيب قبل الاستعمال مع مرض الكلى',en:'Ask a doctor before use with kidney disease'}}]},
      {k:{ar:'العمر',en:'Age'},warn:true,opt:true,rules:[{when:{age:{lt:16}},text:{ar:'لا يُستعمل للألم أو الحرارة تحت 16 سنة (متلازمة راي)',en:'Not for pain or fever under 16 years (Reye’s syndrome)'}}]},
      {k:{ar:'الحمل',en:'Pregnancy'},warn:true,opt:true,rules:[{when:{preg20:true},text:{ar:'لا يُستعمل من الأسبوع 20 إلا بتوجيه صريح من الطبيب',en:'Do not use from 20 weeks unless definitely directed by a doctor'}}]},
      {k:{ar:'طريقة الأخذ',en:'How to take'},rules:[{when:{},text:{ar:'كوب ماء كامل مع كل جرعة',en:'A full glass of water with each dose'}}]}],
    notes:{ar:'خطر النزف المعدي أعلى بعد 60 سنة، ومع مميعات الدم أو الكورتيزون أو مضادات الالتهاب الأخرى أو 3 مشروبات كحولية يومياً.',en:'Higher stomach bleeding risk from age 60, and with anticoagulants, steroids, other NSAIDs or 3 alcoholic drinks a day.'}
  },
  celecoxib: {
    name:{ar:'سيليكوكسيب',en:'Celecoxib'}, label:'DailyMed, celecoxib capsules (2026-10-30) 2.1-2.7, 4', srcIds:[139],
    kids:{ar:'التهاب المفاصل اليفعي: 50 ملغ مرتين يومياً (10 إلى 25 كغ)، و100 ملغ مرتين (أكثر من 25 كغ) (النشرة 2.4).',en:'Juvenile arthritis: 50 mg twice a day (10 to 25 kg), 100 mg twice a day (over 25 kg) (label 2.4).'},
    inputs:[{id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['ap',{ar:'ألم حاد أو آلام الدورة',en:'Acute pain or period pain'}],['oa',{ar:'التهاب المفاصل التنكسي',en:'Osteoarthritis'}],['ra',{ar:'التهاب المفاصل الروماتويدي',en:'Rheumatoid arthritis'}]]},
      {id:'liver',type:'select',label:{ar:'الكبد',en:'Liver'},options:[['ok',{ar:'طبيعي',en:'Normal'}],['mod',{ar:'قصور متوسط (Child-Pugh B)',en:'Moderate impairment (Child-Pugh B)'}],['sev',{ar:'قصور شديد',en:'Severe impairment'}]]},
      {id:'pm',type:'check',label:{ar:'بطيء استقلاب CYP2C9 (معروف أو مشتبه)',en:'CYP2C9 poor metabolizer (known or suspected)'}},ADV_RENAL,NSAID_PREG],
    rows:[
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{liver:'sev'},warn:true,text:{ar:'لا يُنصح به في القصور الكبدي الشديد',en:'Not recommended in severe hepatic impairment'}},
        {when:{renal:'adv'},warn:true,text:{ar:'يُتجنّب في المرض الكلوي المتقدم إلا إذا رجحت الفائدة',en:'Avoid in advanced renal disease unless the benefit outweighs the risk'}},
        {when:{ind:'oa'},text:{ar:'200 ملغ مرة يومياً، أو 100 ملغ مرتين يومياً',en:'200 mg once a day, or 100 mg twice a day'}},
        {when:{ind:'ra'},text:{ar:'100 إلى 200 ملغ مرتين يومياً',en:'100 to 200 mg twice a day'}},
        {when:{},text:{ar:'400 ملغ أولاً، ثم 200 ملغ إذا لزم في اليوم الأول؛ بعدها 200 ملغ مرتين يومياً عند الحاجة',en:'400 mg first, then 200 mg if needed on the first day; then 200 mg twice a day as needed'}}]},
      {k:{ar:'تعديل الجرعة',en:'Dose change'},warn:true,opt:true,rules:[
        {when:{liver:'mod'},text:{ar:'خفّض الجرعة اليومية 50% (قصور كبدي متوسط)',en:'Reduce the daily dose by 50% (moderate hepatic impairment)'}},
        {when:{pm:true},text:{ar:'فكّر بتخفيض الجرعة 50% (بطيء استقلاب CYP2C9)',en:'Consider reducing the dose by 50% (CYP2C9 poor metabolizer)'}}]},
      NSAID_PREG_ROW],
    notes:{ar:'ممنوع مع حساسية السلفوناميدات أو الربو أو الشرى بعد الأسبرين أو مضادات الالتهاب. يُؤخذ مع الطعام أو بدونه.',en:'Contraindicated with sulfonamide allergy, or asthma or urticaria after aspirin or NSAIDs. With or without food.'}
  },
  ketorolac: {
    name:{ar:'كيتورولاك (أقراص)',en:'Ketorolac (tablets)'}, label:'DailyMed, ketorolac tromethamine tablets (2026-11-03), Table 4, contraindications', srcIds:[140],
    kids:{ar:'أقل من 17 سنة: الأقراص غير معتمدة (النشرة، جدول 4).',en:'Under 17 years: tablets are not approved (label, Table 4).'},
    inputs:[{id:'renal',type:'select',label:{ar:'الكلى',en:'Kidney'},options:[['ok',{ar:'طبيعية',en:'Normal'}],['imp',{ar:'قصور كلوي',en:'Kidney impairment'}],['adv',{ar:'قصور متقدم أو خطر فشل كلوي بسبب نقص السوائل',en:'Advanced impairment or risk of kidney failure from volume depletion'}]]},
      {id:'after',type:'check',label:{ar:'بدأ العلاج بالحقن الوريدي أو العضلي',en:'Treatment started with IV or IM ketorolac'}}],
    rows:[
      {k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[
        {when:{renal:'adv'},warn:true,text:{ar:'ممنوع: قصور كلوي متقدم أو خطر فشل كلوي بسبب نقص السوائل',en:'Contraindicated: advanced renal impairment or risk of kidney failure from volume depletion'}},
        {when:{after:false},warn:true,text:{ar:'الأقراص لا تُعطى كجرعة أولى: فقط استكمالاً للحقن الوريدي أو العضلي',en:'Tablets are not an initial dose: only as continuation after IV or IM dosing'}},
        {when:{age:{lt:17}},warn:true,text:{ar:'الأقراص غير معتمدة تحت 17 سنة',en:'Tablets not approved under 17 years'}},
        {when:{age:{gte:65}},text:{ar:'10 ملغ مرة واحدة، ثم 10 ملغ كل 4 إلى 6 ساعات عند الحاجة، بحد 40 ملغ يومياً',en:'10 mg once, then 10 mg every 4 to 6 hours as needed, up to 40 mg a day'}},
        {when:{renal:'imp'},text:{ar:'10 ملغ مرة واحدة، ثم 10 ملغ كل 4 إلى 6 ساعات عند الحاجة، بحد 40 ملغ يومياً',en:'10 mg once, then 10 mg every 4 to 6 hours as needed, up to 40 mg a day'}},
        {when:{wt:{lt:50}},text:{ar:'10 ملغ مرة واحدة، ثم 10 ملغ كل 4 إلى 6 ساعات عند الحاجة، بحد 40 ملغ يومياً',en:'10 mg once, then 10 mg every 4 to 6 hours as needed, up to 40 mg a day'}},
        {when:{},text:{ar:'20 ملغ مرة واحدة، ثم 10 ملغ كل 4 إلى 6 ساعات عند الحاجة، بحد 40 ملغ يومياً',en:'20 mg once, then 10 mg every 4 to 6 hours as needed, up to 40 mg a day'}}]},
      {k:{ar:'المدة',en:'Duration'},rules:[{when:{},text:{ar:'المدة الكلية مع الحقن لا تتجاوز 5 أيام',en:'Total duration with the injection: no more than 5 days'}}]}],
    notes:{ar:'ممنوع مع الأسبرين أو مضادات الالتهاب الأخرى أو البروبينيسيد أو البنتوكسيفيلين، ومع القرحة أو النزف الهضمي، وأثناء المخاض.',en:'Contraindicated with aspirin or other NSAIDs, probenecid or pentoxifylline, with peptic ulcer or GI bleeding, and in labour.'}
  }
});
