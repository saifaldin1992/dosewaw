/* DOSEWAW · js/rules/gi.js — adult rules of the GI drugs group (format of js/rules/antibiotics.js).
   Children: js/rules/bands.js. Every number is copied from the U.S. label in `label`/srcIds (content/gi/labels). */
const A_=(ar,en)=>({ar,en});
const GI_SEL=(opts)=>({id:'ind',type:'select',label:A_('الاستعمال','Use'),options:opts});
const GI_O={gerd:['gerd',A_('ارتجاع مريئي (أعراض)','Symptomatic GERD')],ee:['ee',A_('التهاب المريء التآكلي','Erosive esophagitis')],mee:['mee',A_('المداومة بعد شفاء المريء','Maintenance of healed esophagitis')],
  du:['du',A_('قرحة الاثني عشر','Duodenal ulcer')],gu:['gu',A_('قرحة المعدة','Gastric ulcer')],hp:['hp',A_('جرثومة المعدة (العلاج الثلاثي)','H. pylori (triple therapy)')],
  nsaid:['nsaid',A_('الوقاية من قرحة مضادات الالتهاب','NSAID ulcer risk reduction')],zes:['zes',A_('زولنجر-إليسون وفرط الإفراز','Zollinger-Ellison, hypersecretory states')]};
const GI_LIVER=(sev)=>({id:'liver',type:'select',label:A_('الكبد','Liver'),options:[['ok',A_('طبيعي أو قصور خفيف','Normal or mild impairment')],['sev',A_(sev?'قصور شديد (Child-Pugh C)':'قصور (أي درجة)',sev?'Severe impairment (Child-Pugh C)':'Impairment (any class)')]]});
const GI_HOW={k:A_('طريقة الأخذ','How to take'),rules:[{when:{},text:A_('قبل الطعام؛ تُبلع الكبسولة كاملة','Before meals; swallow the capsule whole')}]};
const GI_U12={when:{age:{lt:12}},warn:true,text:A_('أقل من 12 سنة: استعمل حاسبة الأطفال','Under 12 years: use the children calculator')};
Object.assign(ABC_RULES, {
  omeprazole: {
    name:A_('أوميبرازول','Omeprazole'), label:'DailyMed, omeprazole delayed-release capsules (2026-10-27) 2.1; OTC 20 mg (2026-11-02)', srcIds:[160,161], noRenal:true,
    inputs:[GI_SEL([GI_O.gerd,GI_O.ee,GI_O.mee,GI_O.du,GI_O.gu,GI_O.hp,GI_O.zes]),GI_LIVER(false),{id:'asian',type:'check',label:A_('مريض آسيوي','Asian patient')}],
    rows:[
      {k:A_('الجرعة','Dose'),strong:true,rules:[
        {when:{ind:'gerd'},text:A_('20 ملغ مرة يومياً حتى 4 أسابيع','20 mg once a day for up to 4 weeks')},
        {when:{ind:'ee'},text:A_('20 ملغ مرة يومياً 4 إلى 8 أسابيع (يمكن 4 أسابيع إضافية إذا لم يستجب)','20 mg once a day for 4 to 8 weeks (4 more weeks if no response)')},
        {when:{ind:'mee',liver:'sev'},text:A_('10 ملغ مرة يومياً (قصور الكبد)','10 mg once a day (liver impairment)')},
        {when:{ind:'mee',asian:true},text:A_('10 ملغ مرة يومياً (مريض آسيوي)','10 mg once a day (Asian patient)')},
        {when:{ind:'mee'},text:A_('20 ملغ مرة يومياً (الدراسات حتى 12 شهراً)','20 mg once a day (studied up to 12 months)')},
        {when:{ind:'du'},text:A_('20 ملغ مرة يومياً 4 أسابيع (قد تلزم 4 أسابيع أخرى)','20 mg once a day for 4 weeks (some need 4 more weeks)')},
        {when:{ind:'gu'},text:A_('40 ملغ مرة يومياً 4 إلى 8 أسابيع','40 mg once a day for 4 to 8 weeks')},
        {when:{ind:'hp'},text:A_('20 ملغ + أموكسيسيلين 1000 ملغ + كلاريثروميسين 500 ملغ، كلها مرتين يومياً 10 أيام؛ مع وجود قرحة يُكمل الأوميبرازول 20 ملغ يومياً 18 يوماً أخرى','20 mg + amoxicillin 1000 mg + clarithromycin 500 mg, all twice a day for 10 days; with an ulcer, continue omeprazole 20 mg a day for 18 more days')},
        {when:{ind:'zes'},text:A_('البداية 60 ملغ مرة يومياً ثم حسب المريض؛ ما فوق 80 ملغ يومياً يُقسم','Start 60 mg once a day, then as needed; over 80 mg a day in divided doses')},
        {when:{},text:A_('20 ملغ مرة يومياً','20 mg once a day')}]},
      {k:A_('دون وصفة','Over the counter'),opt:true,rules:[{when:{ind:'gerd'},text:A_('18 سنة فأكثر: 20 ملغ مرة يومياً صباحاً قبل الأكل 14 يوماً، ويمكن تكرار الدورة كل 4 أشهر','18 years and over: 20 mg once a day in the morning before eating for 14 days; the course may be repeated every 4 months')}]},
      GI_HOW],
    notes:A_('لا يُستعمل مع الريلبيفيرين، ويُتجنّب مع الكلوبيدوجريل.','Not with rilpivirine; avoid with clopidogrel.')
  },
  esomeprazole: {
    name:A_('إيزوميبرازول','Esomeprazole'), label:'DailyMed, esomeprazole magnesium delayed-release capsules (2026-11-02) 2.1, 2.2', srcIds:[162], noRenal:true,
    inputs:[GI_SEL([GI_O.ee,GI_O.mee,GI_O.gerd,GI_O.nsaid,GI_O.hp,GI_O.zes]),GI_LIVER(true)],
    rows:[
      {k:A_('الجرعة','Dose'),strong:true,rules:[
        {when:{age:{lt:12}},warn:true,text:A_('أقل من 12 سنة: نشرة الكبسولات لا تذكر جرعة','Under 12 years: the capsule label gives no dose')},
        {when:{ind:'zes',liver:'sev'},text:A_('البداية 20 ملغ مرتين يومياً (قصور كبدي شديد)','Start 20 mg twice a day (severe liver impairment)')},
        {when:{ind:'zes'},text:A_('البداية 40 ملغ مرتين يومياً ثم حسب المريض','Start 40 mg twice a day, then as needed')},
        {when:{liver:'sev',ind:'mee'},text:A_('20 ملغ مرة يومياً','20 mg once a day')},
        {when:{liver:'sev'},text:A_('الحد 20 ملغ مرة يومياً (قصور كبدي شديد)','Up to 20 mg once a day (severe liver impairment)')},
        {when:{ind:'ee'},text:A_('20 أو 40 ملغ مرة يومياً 4 إلى 8 أسابيع','20 or 40 mg once a day for 4 to 8 weeks')},
        {when:{ind:'mee'},text:A_('20 ملغ مرة يومياً','20 mg once a day')},
        {when:{ind:'gerd'},text:A_('20 ملغ مرة يومياً 4 أسابيع (و4 أخرى إذا لم تزل الأعراض)','20 mg once a day for 4 weeks (4 more if symptoms remain)')},
        {when:{ind:'nsaid'},text:A_('20 أو 40 ملغ مرة يومياً (الدراسات حتى 6 أشهر)','20 or 40 mg once a day (studied up to 6 months)')},
        {when:{ind:'hp'},text:A_('40 ملغ مرة يومياً + أموكسيسيلين 1000 ملغ + كلاريثروميسين 500 ملغ مرتين يومياً، 10 أيام','40 mg once a day + amoxicillin 1000 mg + clarithromycin 500 mg twice a day, for 10 days')},
        {when:{},text:A_('20 ملغ مرة يومياً','20 mg once a day')}]},
      {k:A_('طريقة الأخذ','How to take'),rules:[{when:{},text:A_('قبل الطعام بساعة على الأقل','At least one hour before meals')}]}],
    notes:A_('من 12 إلى 17 سنة: التهاب المريء التآكلي 20 أو 40 ملغ، والارتجاع 20 ملغ.','12 to 17 years: erosive esophagitis 20 or 40 mg, GERD 20 mg.')
  },
  pantoprazole: {
    name:A_('بانتوبرازول','Pantoprazole'), label:'DailyMed, pantoprazole sodium delayed-release tablets (2026-10-28) 2.1', srcIds:[163], noRenal:true,
    inputs:[GI_SEL([GI_O.ee,GI_O.mee,GI_O.zes])],
    rows:[
      {k:A_('الجرعة','Dose'),strong:true,rules:[
        {when:{age:{lt:5}},warn:true,text:A_('أقل من 5 سنوات: لا توجد قوة مناسبة للعمر (النشرة)','Under 5 years: no age-appropriate strength (label)')},
        GI_U12,
        {when:{ind:'mee'},text:A_('40 ملغ مرة يومياً','40 mg once a day')},
        {when:{ind:'zes'},text:A_('40 ملغ مرتين يومياً ثم حسب المريض','40 mg twice a day, then as needed')},
        {when:{},text:A_('40 ملغ مرة يومياً حتى 8 أسابيع (يمكن 8 أسابيع أخرى)','40 mg once a day for up to 8 weeks (another 8 weeks may be considered)')}]},
      {k:A_('طريقة الأخذ','How to take'),rules:[{when:{},text:A_('يُبلع كاملاً مع الطعام أو بدونه','Swallow whole, with or without food')}]}],
    notes:A_('لا يُستعمل مع الريلبيفيرين.','Not with rilpivirine.')
  },
  lansoprazole: {
    name:A_('لانسوبرازول','Lansoprazole'), label:'DailyMed, lansoprazole delayed-release capsules (2026-10-29) 2.1-2.3', srcIds:[164], noRenal:true,
    inputs:[GI_SEL([GI_O.gerd,GI_O.ee,GI_O.mee,GI_O.du,GI_O.gu,GI_O.hp,GI_O.nsaid,GI_O.zes]),GI_LIVER(true)],
    rows:[
      {k:A_('الجرعة','Dose'),strong:true,rules:[
        GI_U12,
        {when:{liver:'sev'},text:A_('15 ملغ يومياً (قصور كبدي شديد)','15 mg a day (severe liver impairment)')},
        {when:{ind:'gerd'},text:A_('15 ملغ مرة يومياً حتى 8 أسابيع','15 mg once a day for up to 8 weeks')},
        {when:{ind:'ee'},text:A_('30 ملغ مرة يومياً حتى 8 أسابيع','30 mg once a day for up to 8 weeks')},
        {when:{ind:'mee'},text:A_('15 ملغ مرة يومياً','15 mg once a day')},
        {when:{ind:'du'},text:A_('15 ملغ مرة يومياً 4 أسابيع','15 mg once a day for 4 weeks')},
        {when:{ind:'gu'},text:A_('30 ملغ مرة يومياً حتى 8 أسابيع','30 mg once a day for up to 8 weeks')},
        {when:{ind:'hp'},text:A_('30 ملغ + أموكسيسيلين 1 غرام + كلاريثروميسين 500 ملغ، كلها مرتين يومياً 10 أو 14 يوماً','30 mg + amoxicillin 1 g + clarithromycin 500 mg, all twice a day for 10 or 14 days')},
        {when:{ind:'nsaid'},text:A_('الوقاية: 15 ملغ مرة يومياً حتى 12 أسبوعاً؛ علاج القرحة: 30 ملغ مرة يومياً 8 أسابيع','Risk reduction: 15 mg once a day for up to 12 weeks; healing: 30 mg once a day for 8 weeks')},
        {when:{ind:'zes'},text:A_('البداية 60 ملغ مرة يومياً ثم حسب المريض؛ ما فوق 120 ملغ يومياً يُقسم','Start 60 mg once a day, then as needed; over 120 mg a day in divided doses')},
        {when:{},text:A_('15 ملغ مرة يومياً','15 mg once a day')}]},
      {k:A_('طريقة الأخذ','How to take'),rules:[{when:{},text:A_('قبل الطعام، وقبل السكرالفات بـ30 دقيقة على الأقل','Before meals, and at least 30 minutes before sucralfate')}]}],
    notes:A_('من 12 إلى 17 سنة: الارتجاع غير التآكلي 15 ملغ، والتهاب المريء التآكلي 30 ملغ، مرة يومياً حتى 8 أسابيع.','12 to 17 years: non-erosive GERD 15 mg, erosive esophagitis 30 mg, once a day for up to 8 weeks.')
  },
  famotidine: {
    name:A_('فاموتيدين','Famotidine'), label:'DailyMed, famotidine tablets (2026-11-09) 2.1, 2.2', srcIds:[165],
    inputs:[GI_SEL([GI_O.du,GI_O.gu,GI_O.gerd,GI_O.ee,GI_O.zes,['rdu',A_('الوقاية من عودة قرحة الاثني عشر','Prevent duodenal ulcer return')]])],
    rows:[
      {k:A_('الجرعة (الكبار و40 كغ فأكثر)','Dose (adults and 40 kg and over)'),strong:true,rules:[
        {when:{ind:'zes',crcl:{lt:60}},warn:true,text:A_('يُتجنّب مع تصفية أقل من 60 مل/دقيقة','Avoid with clearance under 60 mL/min')},
        {when:{ind:'zes'},text:A_('البداية 20 ملغ كل 6 ساعات ثم حسب المريض؛ الحد 160 ملغ كل 6 ساعات','Start 20 mg every 6 hours, then as needed; up to 160 mg every 6 hours')},
        {when:{ind:'rdu',crcl:{lt:30}},text:A_('انظر حاشية جدول الكلى في النشرة','See the footnote of the label kidney table')},
        {when:{ind:'rdu',crcl:{lt:60}},text:A_('20 ملغ يوماً بعد يوم','20 mg every other day')},
        {when:{ind:'rdu'},text:A_('20 ملغ مرة يومياً','20 mg once a day')},
        {when:{ind:'ee',crcl:{lt:30}},text:A_('20 ملغ يوماً بعد يوم (بدل 20 ملغ مرتين)، أو 20 ملغ مرة يومياً (بدل 40 ملغ مرتين)','20 mg every other day (for 20 mg twice a day), or 20 mg once a day (for 40 mg twice a day)')},
        {when:{ind:'ee',crcl:{lt:60}},text:A_('20 ملغ مرة يومياً أو 40 ملغ يوماً بعد يوم (بدل 20 ملغ مرتين)، أو 40 ملغ مرة يومياً (بدل 40 ملغ مرتين)','20 mg once a day or 40 mg every other day (for 20 mg twice a day), or 40 mg once a day (for 40 mg twice a day)')},
        {when:{ind:'ee'},text:A_('20 ملغ مرتين يومياً أو 40 ملغ مرتين يومياً، حتى 12 أسبوعاً','20 mg twice a day or 40 mg twice a day, for up to 12 weeks')},
        {when:{crcl:{lt:30}},text:A_('20 ملغ يوماً بعد يوم (تصفية أقل من 30)','20 mg every other day (clearance under 30)')},
        {when:{ind:'gerd',crcl:{lt:60}},text:A_('20 ملغ مرة يومياً (تصفية 30 إلى 60)','20 mg once a day (clearance 30 to 60)')},
        {when:{crcl:{lt:60}},text:A_('20 ملغ مرة يومياً أو 40 ملغ يوماً بعد يوم (تصفية 30 إلى 60)','20 mg once a day or 40 mg every other day (clearance 30 to 60)')},
        {when:{ind:'du'},text:A_('40 ملغ مرة يومياً أو 20 ملغ مرتين يومياً، حتى 8 أسابيع','40 mg once a day or 20 mg twice a day, for up to 8 weeks')},
        {when:{ind:'gu'},text:A_('40 ملغ مرة يومياً حتى 8 أسابيع','40 mg once a day for up to 8 weeks')},
        {when:{ind:'gerd'},text:A_('20 ملغ مرتين يومياً حتى 6 أسابيع','20 mg twice a day for up to 6 weeks')},
        {when:{},text:A_('20 ملغ مرتين يومياً','20 mg twice a day')}]},
      {k:A_('التوقيت','When'),rules:[{when:{},text:A_('مرة قبل النوم، أو مرتين صباحاً وقبل النوم','Once at bedtime, or twice: morning and bedtime')}]}],
    notes:A_('أقل من 40 كغ: أقراص 20 ملغ أكبر من الجرعة؛ يُستعمل المعلق (حاسبة الأطفال).','Under 40 kg: 20 mg tablets are more than the dose; use the suspension (children calculator).')
  },
  ondansetron: {
    name:A_('أوندانسيترون','Ondansetron'), label:'DailyMed, ondansetron tablets (2026-10-14) 2.1, 2.2', srcIds:[167], noRenal:true,
    inputs:[{id:'ind',type:'select',label:A_('الاستعمال','Use'),options:[['mec',A_('علاج كيميائي متوسط الإقياء','Moderately emetogenic chemotherapy')],['hec',A_('علاج كيميائي شديد الإقياء','Highly emetogenic chemotherapy')],['rt',A_('العلاج الإشعاعي','Radiotherapy')],['ponv',A_('بعد العمليات','After surgery')]]},
      {id:'liver',type:'select',label:A_('الكبد','Liver'),options:[['ok',A_('طبيعي أو قصور خفيف أو متوسط','Normal, mild or moderate impairment')],['sev',A_('قصور شديد (Child-Pugh 10 فأكثر)','Severe impairment (Child-Pugh 10 or more)')]]}],
    rows:[
      {k:A_('الجرعة','Dose'),strong:true,rules:[
        {when:{age:{lt:4}},warn:true,text:A_('أقل من 4 سنوات: لا تذكر النشرة جرعة فموية','Under 4 years: the label gives no oral dose')},
        {when:{age:{lt:12},ind:'mec'},text:A_('4 ملغ قبل العلاج بـ30 دقيقة، ثم 4 ملغ بعد 4 و8 ساعات، ثم 4 ملغ 3 مرات يومياً 1 إلى 2 يوم بعده','4 mg 30 minutes before, then 4 mg at 4 and 8 hours, then 4 mg three times a day for 1 to 2 days after')},
        {when:{age:{lt:12}},warn:true,text:A_('من 4 إلى 11 سنة: النشرة تذكر العلاج الكيميائي متوسط الإقياء فقط','4 to 11 years: the label covers moderately emetogenic chemotherapy only')},
        {when:{ind:'hec',liver:'sev'},warn:true,text:A_('قصور كبدي شديد: لا يتجاوز 8 ملغ في اليوم','Severe liver impairment: no more than 8 mg a day')},
        {when:{ind:'hec'},text:A_('24 ملغ مرة واحدة قبل العلاج بـ30 دقيقة','A single 24 mg dose 30 minutes before chemotherapy')},
        {when:{ind:'ponv',liver:'sev'},warn:true,text:A_('قصور كبدي شديد: لا يتجاوز 8 ملغ في اليوم','Severe liver impairment: no more than 8 mg a day')},
        {when:{ind:'ponv'},text:A_('16 ملغ قبل التخدير بساعة','16 mg 1 hour before anaesthesia')},
        {when:{ind:'rt'},text:A_('8 ملغ قبل كل جلسة بـ1 إلى 2 ساعة؛ للبطن: ثم 8 ملغ كل 8 ساعات','8 mg 1 to 2 hours before each fraction; abdomen: then 8 mg every 8 hours')},
        {when:{},text:A_('8 ملغ قبل العلاج بـ30 دقيقة، و8 ملغ بعد 8 ساعات، ثم 8 ملغ كل 12 ساعة 1 إلى 2 يوم بعده','8 mg 30 minutes before, 8 mg 8 hours later, then 8 mg every 12 hours for 1 to 2 days after')}]},
      {k:A_('الكبد','Liver'),warn:true,opt:true,rules:[{when:{liver:'sev'},text:A_('الحد 8 ملغ في اليوم','Up to 8 mg a day')}]}],
    notes:A_('يُتجنّب مع متلازمة إطالة QT الخلقية. ممنوع مع الأبومورفين.','Avoid in congenital long QT syndrome. Contraindicated with apomorphine.')
  },
  metoclopramide: {
    name:A_('ميتوكلوبراميد','Metoclopramide'), label:'DailyMed, metoclopramide tablets (2026-09-16) 2.1, 2.2 (Tables 1 and 2)', srcIds:[168],
    inputs:[{id:'ind',type:'select',label:A_('الاستعمال','Use'),options:[['gerd',A_('ارتجاع موثق لم ينفعه العلاج المعتاد','Documented GERD failing usual therapy')],['gp',A_('خزل المعدة السكري','Diabetic gastroparesis')]]},
      {id:'red',type:'select',label:A_('حالات خاصة','Special cases'),options:[['no',A_('لا شيء مما يلي','None of these')],['red',A_('قصور كبدي متوسط أو شديد، أو بطيء استقلاب CYP2D6، أو مثبط CYP2D6 قوي','Moderate or severe liver impairment, CYP2D6 poor metabolizer, or a strong CYP2D6 inhibitor')]]},
      {id:'esrd',type:'check',label:A_('فشل كلوي نهائي أو غسيل كلوي','End-stage kidney disease or dialysis')}],
    rows:[
      {k:A_('الجرعة','Dose'),strong:true,rules:[
        {when:{age:{lt:18}},warn:true,text:A_('لا يُنصح به للأطفال (خلل الحركة المتأخر والأعراض خارج الهرمية)','Not recommended in children (tardive dyskinesia, extrapyramidal symptoms)')},
        {when:{ind:'gp',esrd:true},text:A_('5 ملغ مرتين يومياً، بحد 10 ملغ يومياً','5 mg twice a day, up to 10 mg a day')},
        {when:{ind:'gp',red:'red'},text:A_('5 ملغ 4 مرات يومياً، بحد 20 ملغ يومياً','5 mg four times a day, up to 20 mg a day')},
        {when:{ind:'gp',crcl:{lt:60}},text:A_('5 ملغ 4 مرات يومياً، بحد 20 ملغ يومياً (تصفية أقل من 60)','5 mg four times a day, up to 20 mg a day (clearance under 60)')},
        {when:{ind:'gp',age:{gte:65}},text:A_('5 ملغ 4 مرات يومياً (كبار السن)، بحد 40 ملغ يومياً','5 mg four times a day (elderly), up to 40 mg a day')},
        {when:{ind:'gp'},text:A_('10 ملغ 4 مرات يومياً، بحد 40 ملغ يومياً','10 mg four times a day, up to 40 mg a day')},
        {when:{esrd:true},text:A_('5 ملغ 4 مرات يومياً أو 10 ملغ مرتين يومياً، بحد 20 ملغ يومياً','5 mg four times a day or 10 mg twice a day, up to 20 mg a day')},
        {when:{red:'red'},text:A_('5 ملغ 4 مرات يومياً أو 10 ملغ 3 مرات يومياً، بحد 30 ملغ يومياً','5 mg four times a day or 10 mg three times a day, up to 30 mg a day')},
        {when:{crcl:{lte:60}},text:A_('5 ملغ 4 مرات يومياً أو 10 ملغ 3 مرات يومياً، بحد 30 ملغ يومياً (تصفية 60 أو أقل)','5 mg four times a day or 10 mg three times a day, up to 30 mg a day (clearance 60 or less)')},
        {when:{age:{gte:65}},text:A_('البداية 5 ملغ 4 مرات يومياً (كبار السن) ثم حتى 10 إلى 15 ملغ، بحد 60 ملغ يومياً','Start 5 mg four times a day (elderly), then up to 10 to 15 mg, up to 60 mg a day')},
        {when:{},text:A_('10 إلى 15 ملغ 4 مرات يومياً، بحد 60 ملغ يومياً؛ أو جرعة واحدة حتى 20 ملغ قبل الموقف المثير','10 to 15 mg four times a day, up to 60 mg a day; or a single dose up to 20 mg before the provoking situation')}]},
      {k:A_('التوقيت والمدة','When and how long'),rules:[{when:{},text:A_('قبل كل وجبة بـ30 دقيقة وقبل النوم؛ لا يزيد على 12 أسبوعاً','30 minutes before each meal and at bedtime; no more than 12 weeks')}]}],
    notes:A_('تحذير صندوقي: خلل الحركة المتأخر. ممنوع مع الصرع.','Boxed warning: tardive dyskinesia. Contraindicated in epilepsy.')
  },
  loperamide: {
    name:A_('لوبيراميد','Loperamide'), label:'DailyMed, loperamide 2 mg OTC (2026-11-04)', srcIds:[169], noRenal:true,
    inputs:[],
    rows:[
      {k:A_('الجرعة (12 سنة فأكثر)','Dose (12 years and over)'),strong:true,rules:[
        {when:{age:{lt:12}},warn:true,text:A_('أقل من 12 سنة: استعمل حاسبة الأطفال (الجرعة بالوزن أو العمر)','Under 12 years: use the children calculator (by weight or age)')},
        {when:{},text:A_('4 ملغ (قرصان) بعد أول براز رخو، ثم 2 ملغ بعد كل براز رخو؛ بحد 8 ملغ (4 أقراص) في 24 ساعة','4 mg (2 tablets) after the first loose stool, then 2 mg after each loose stool; up to 8 mg (4 tablets) in 24 hours')}]},
      {k:A_('متى يُوقف','When to stop'),warn:true,rules:[{when:{},text:A_('إذا استمر الإسهال أكثر من يومين أو ساءت الأعراض أو انتفخ البطن','If diarrhoea lasts more than 2 days, symptoms get worse, or the belly swells')}]}],
    notes:A_('الزيادة على الجرعة قد تسبب مشاكل قلبية خطيرة. لا يُستعمل مع براز دموي أو أسود.','Taking more than directed can cause serious heart problems. Do not use with bloody or black stool.')
  }
});
