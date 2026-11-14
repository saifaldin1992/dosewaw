/* DOSEWAW · js/rules/antihistamines.js — adult rules of the antihistamines group (format of js/rules/antibiotics.js).
   Children: the age charts in js/rules/bands.js. Every number is copied from the label in `label`/srcIds. */
const AH_ASK={ar:'يحدد الطبيب إن كانت الحاجة لجرعة مختلفة (النشرة)',en:'The doctor decides whether a different dose is needed (label)'};
const AH_LK={id:'lk',type:'select',label:{ar:'الكبد والكلى',en:'Liver and kidney'},options:[['ok',{ar:'لا مرض كبدي أو كلوي',en:'No liver or kidney disease'}],['dis',{ar:'مرض كبدي أو كلوي',en:'Liver or kidney disease'}]]};
const AH_LK_ROW={k:{ar:'الكبد والكلى',en:'Liver and kidney'},warn:true,opt:true,rules:[{when:{lk:'dis'},text:AH_ASK}]};
Object.assign(ABC_RULES, {
  cetirizine: {
    name:{ar:'سيتريزين',en:'Cetirizine'}, label:'DailyMed, cetirizine 10 mg OTC (2026-11-09); cetirizine 5 mg/5 mL OTC (2026-10-01)', srcIds:[142,141], noRenal:true,
    inputs:[AH_LK],
    rows:[
      {k:{ar:'الجرعة (6 سنوات فأكثر)',en:'Dose (6 years and over)'},strong:true,rules:[
        {when:{age:{gte:65}},text:{ar:'5 ملغ مرة يومياً، بحد 5 ملغ في 24 ساعة (65 سنة فأكثر)',en:'5 mg once a day, up to 5 mg in 24 hours (65 years and over)'}},
        {when:{},text:{ar:'5 أو 10 ملغ مرة يومياً حسب شدة الأعراض، بحد 10 ملغ في 24 ساعة',en:'5 or 10 mg once a day by severity, up to 10 mg in 24 hours'}}]},
      AH_LK_ROW],
    notes:{ar:'قد يسبب النعاس: يُتجنّب الكحول والحذر عند القيادة. الرضاعة: لا يُنصح به.',en:'May cause drowsiness: avoid alcohol and take care when driving. Breast-feeding: not recommended.'}
  },
  levocetirizine: {
    name:{ar:'ليفوسيتريزين',en:'Levocetirizine'}, label:'DailyMed, levocetirizine tablets (2026-11-05) 2.2, 2.4, 4', srcIds:[143],
    inputs:[{id:'hd',type:'check',label:{ar:'غسيل كلوي',en:'On haemodialysis'}}],
    rows:[
      {k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 years and over)'},strong:true,rules:[
        {when:{hd:true},warn:true,text:{ar:'ممنوع: غسيل كلوي',en:'Contraindicated: haemodialysis'}},
        {when:{crcl:{lt:10}},warn:true,text:{ar:'ممنوع: تصفية الكرياتينين أقل من 10 مل/دقيقة',en:'Contraindicated: creatinine clearance under 10 mL/min'}},
        {when:{crcl:{lt:30}},text:{ar:'2.5 ملغ مرتين أسبوعياً (كل 3 إلى 4 أيام)',en:'2.5 mg twice a week (every 3 to 4 days)'}},
        {when:{crcl:{lt:50}},text:{ar:'2.5 ملغ يوماً بعد يوم',en:'2.5 mg every other day'}},
        {when:{crcl:{lte:80}},text:{ar:'2.5 ملغ مرة يومياً',en:'2.5 mg once a day'}},
        {when:{},text:{ar:'5 ملغ مرة يومياً مساءً (قد تكفي 2.5 ملغ)',en:'5 mg once a day in the evening (2.5 mg may be enough)'}}]}],
    notes:{ar:'مع قصور الكبد وحده لا تعديل. قد يسبب النعاس.',en:'No change with liver impairment alone. May cause drowsiness.'}
  },
  loratadine: {
    name:{ar:'لوراتادين',en:'Loratadine'}, label:'DailyMed, loratadine 10 mg OTC (2026-11-06)', srcIds:[145], noRenal:true,
    inputs:[AH_LK],
    rows:[
      {k:{ar:'الجرعة (6 سنوات فأكثر)',en:'Dose (6 years and over)'},strong:true,rules:[{when:{},text:{ar:'10 ملغ مرة يومياً، بحد 10 ملغ في 24 ساعة',en:'10 mg once a day, up to 10 mg in 24 hours'}}]},
      AH_LK_ROW],
    notes:{ar:'الزيادة على الجرعة قد تسبب النعاس.',en:'Taking more than directed may cause drowsiness.'}
  },
  desloratadine: {
    name:{ar:'ديسلوراتادين',en:'Desloratadine'}, label:'DailyMed, desloratadine tablets (2026-08-26) 2.1, 2.5', srcIds:[146], noRenal:true,
    inputs:[{id:'lk',type:'select',label:{ar:'الكبد والكلى',en:'Liver and kidney'},options:[['ok',{ar:'طبيعية',en:'Normal'}],['imp',{ar:'قصور كبدي أو كلوي',en:'Liver or kidney impairment'}]]}],
    rows:[
      {k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 years and over)'},strong:true,rules:[
        {when:{lk:'imp'},text:{ar:'البداية 5 ملغ يوماً بعد يوم',en:'Start with 5 mg every other day'}},
        {when:{},text:{ar:'5 ملغ مرة يومياً',en:'5 mg once a day'}}]}],
    notes:{ar:'مع الطعام أو بدونه. ممنوع مع حساسية اللوراتادين.',en:'With or without food. Contraindicated with loratadine allergy.'}
  },
  fexofenadine: {
    name:{ar:'فيكسوفينادين',en:'Fexofenadine'}, label:'DailyMed, fexofenadine 180 mg OTC (2026-10-29); 30 mg/5 mL OTC (2026-08-11)', srcIds:[148,147], noRenal:true,
    inputs:[{id:'form',type:'select',label:{ar:'الشكل',en:'Form'},options:[['tab',{ar:'أقراص 180 ملغ',en:'180 mg tablets'}],['susp',{ar:'شراب 30 ملغ/5 مل',en:'30 mg/5 mL suspension'}]]},
      {id:'kd',type:'check',label:{ar:'مرض كلوي',en:'Kidney disease'}}],
    rows:[
      {k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 years and over)'},strong:true,rules:[
        {when:{form:'susp'},text:{ar:'60 ملغ (10 مل) كل 12 ساعة، بحد 120 ملغ (20 مل) في 24 ساعة',en:'60 mg (10 mL) every 12 hours, up to 120 mg (20 mL) in 24 hours'}},
        {when:{},text:{ar:'180 ملغ مرة يومياً مع الماء، بحد قرص واحد في 24 ساعة',en:'180 mg once a day with water, up to 1 tablet in 24 hours'}}]},
      {k:{ar:'الكلى',en:'Kidney'},warn:true,opt:true,rules:[{when:{kd:true},text:AH_ASK}]},
      {k:{ar:'العمر',en:'Age'},warn:true,opt:true,rules:[{when:{age:{gte:65}},text:{ar:'65 سنة فأكثر: يُسأل الطبيب',en:'65 years and over: ask a doctor'}}]}],
    notes:{ar:'لا يُؤخذ مع عصائر الفاكهة، ولا في وقت مضادات الحموضة التي فيها ألمنيوم أو مغنيسيوم.',en:'Not with fruit juices, and not at the same time as aluminium or magnesium antacids.'}
  },
  chlorpheniramine: {
    name:{ar:'كلورفينيرامين',en:'Chlorpheniramine'}, label:'DailyMed, chlorpheniramine 4 mg OTC (2026-11-02); WHO Model Formulary for Children 2010', srcIds:[149,152], noRenal:true,
    inputs:[],
    rows:[{k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 years and over)'},strong:true,rules:[{when:{},text:{ar:'4 ملغ كل 4 إلى 6 ساعات، بحد 24 ملغ (6 أقراص) في 24 ساعة',en:'4 mg every 4 to 6 hours, up to 24 mg (6 tablets) in 24 hours'}}]}],
    notes:{ar:'يسبب النعاس: يُتجنّب الكحول والمهدئات. يُسأل الطبيب مع ضيق التنفس المزمن أو الزرق أو تضخم البروستات.',en:'Causes drowsiness: avoid alcohol and sedatives. Ask a doctor with chronic breathing problems, glaucoma or an enlarged prostate.'}
  },
  diphenhydramine: {
    name:{ar:'ديفينهيدرامين',en:'Diphenhydramine'}, label:'DailyMed, diphenhydramine 25 mg OTC (2026-11-05)', srcIds:[153], noRenal:true,
    inputs:[],
    rows:[{k:{ar:'الجرعة (12 سنة فأكثر)',en:'Dose (12 years and over)'},strong:true,rules:[{when:{},text:{ar:'25 إلى 50 ملغ (قرص أو قرصان) كل 4 إلى 6 ساعات، بحد 6 جرعات في 24 ساعة',en:'25 to 50 mg (1 to 2 tablets) every 4 to 6 hours, up to 6 doses in 24 hours'}}]}],
    notes:{ar:'لا يُجمع مع أي منتج آخر فيه ديفينهيدرامين حتى الكريمات. نعاس واضح.',en:'Not with any other product containing diphenhydramine, even creams. Marked drowsiness.'}
  },
  hydroxyzine: {
    name:{ar:'هيدروكسيزين',en:'Hydroxyzine'}, label:'DailyMed, hydroxyzine hydrochloride (2026-11-06)', srcIds:[151], noRenal:true,
    inputs:[{id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['itch',{ar:'الحكة التحسسية',en:'Allergic itching'}],['anx',{ar:'القلق والتوتر',en:'Anxiety and tension'}]]},
      {id:'qt',type:'check',label:{ar:'إطالة QT معروفة',en:'Known prolonged QT'}},{id:'preg',type:'check',label:{ar:'بداية الحمل أو الرضاعة',en:'Early pregnancy or breast-feeding'}}],
    rows:[
      {k:{ar:'الجرعة (الكبار)',en:'Dose (adults)'},strong:true,rules:[
        {when:{qt:true},warn:true,text:{ar:'ممنوع: إطالة QT',en:'Contraindicated: prolonged QT'}},
        {when:{preg:true},warn:true,text:{ar:'ممنوع في بداية الحمل، ولا يُعطى للمرضع',en:'Contraindicated in early pregnancy; not for nursing mothers'}},
        {when:{ind:'anx'},text:{ar:'50 إلى 100 ملغ 4 مرات يومياً',en:'50 to 100 mg four times a day'}},
        {when:{},text:{ar:'25 ملغ 3 أو 4 مرات يومياً',en:'25 mg three or four times a day'}}]}],
    notes:{ar:'يزيد أثر مثبطات الجهاز العصبي فتُخفض جرعاتها. ممنوع مع حساسية السيتريزين أو الليفوسيتريزين.',en:'Potentiates CNS depressants, whose doses should be reduced. Contraindicated with cetirizine or levocetirizine allergy.'}
  }
});

/* oral corticosteroids (adults): the label's starting range, the multiple sclerosis regimen where the label gives one */
const ST_TAPER={k:{ar:'الإيقاف',en:'Stopping'},warn:true,rules:[{when:{},text:{ar:'بعد أكثر من بضعة أيام لا يُوقف فجأة: يُسحب تدريجياً',en:'After more than a few days, do not stop suddenly: withdraw gradually'}}]};
const ST_IND=(ms)=>({id:'ind',type:'select',label:{ar:'الاستعمال',en:'Use'},options:[['gen',{ar:'الجرعة الأولى حسب المرض',en:'Initial dose by disease'}],...(ms?[['ms',{ar:'نوبة حادة من التصلب المتعدد',en:'Acute flare of multiple sclerosis'}]]:[])]});
const ST=(id,ar,en,label,src,range,ms)=>({name:{ar,en},label,srcIds:src,noRenal:true,inputs:[ST_IND(!!ms)],
  rows:[{k:{ar:'الجرعة',en:'Dose'},strong:true,rules:[...(ms?[{when:{ind:'ms'},text:ms}]:[]),{when:{},text:range}]},
    {k:{ar:'بعد الاستجابة',en:'After response'},rules:[{when:{},text:{ar:'تُخفض تدريجياً إلى أقل جرعة تحافظ على الاستجابة',en:'Reduce gradually to the lowest dose that keeps the response'}}]},ST_TAPER],
  notes:{ar:'ممنوع مع العدوى الفطرية الجهازية. اللقاحات الحية ممنوعة مع الجرعات المثبطة للمناعة.',en:'Contraindicated with systemic fungal infections. Live vaccines are contraindicated with immunosuppressive doses.'}});
Object.assign(ABC_RULES, {
  prednisolone: ST('prednisolone','بريدنيزولون','Prednisolone','DailyMed, prednisolone sodium phosphate oral solution (2026-09-04); multiple sclerosis: prednisone tablets label (same range for prednisone and prednisolone)',[154,155],
    {ar:'5 إلى 60 ملغ يومياً حسب المرض',en:'5 to 60 mg a day by disease'},{ar:'200 ملغ يومياً أسبوعاً، ثم 80 ملغ يوماً بعد يوم لمدة شهر',en:'200 mg a day for a week, then 80 mg every other day for a month'}),
  prednisone: ST('prednisone','بريدنيزون','Prednisone','DailyMed, prednisone tablets (2026-11-09)',[155],
    {ar:'5 إلى 60 ملغ يومياً حسب المرض؛ الجرعة الواحدة صباحاً قبل التاسعة مع الطعام أو الحليب',en:'5 to 60 mg a day by disease; a single dose in the morning before 9 am with food or milk'},{ar:'200 ملغ يومياً أسبوعاً، ثم 80 ملغ يوماً بعد يوم لمدة شهر',en:'200 mg a day for a week, then 80 mg every other day for a month'}),
  dexamethasone: ST('dexamethasone','ديكساميثازون','Dexamethasone','DailyMed, dexamethasone tablets (2026-11-04)',[156],
    {ar:'0.75 إلى 9 ملغ يومياً حسب المرض',en:'0.75 to 9 mg a day by disease'},{ar:'30 ملغ يومياً أسبوعاً، ثم 4 إلى 12 ملغ يوماً بعد يوم لمدة شهر',en:'30 mg a day for a week, then 4 to 12 mg every other day for a month'}),
  methylprednisolone: ST('methylprednisolone','ميثيل بريدنيزولون','Methylprednisolone','DailyMed, methylprednisolone tablets (2026-10-13)',[157],
    {ar:'4 إلى 48 ملغ يومياً حسب المرض',en:'4 to 48 mg a day by disease'},{ar:'ما يعادل 200 ملغ بريدنيزولون (160 ملغ) يومياً أسبوعاً، ثم ما يعادل 80 ملغ (64 ملغ) يوماً بعد يوم لمدة شهر',en:'The equivalent of 200 mg prednisolone (160 mg) a day for a week, then of 80 mg (64 mg) every other day for a month'}),
  hydrocortisone: ST('hydrocortisone','هيدروكورتيزون','Hydrocortisone','DailyMed, hydrocortisone tablets (2026-10-29)',[158],
    {ar:'20 إلى 240 ملغ يومياً حسب المرض',en:'20 to 240 mg a day by disease'},null)
});
