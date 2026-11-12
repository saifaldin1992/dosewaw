/* DOSEWAW · js/rules/peds.js — weight-based doses for children, as data. Engine: pedsCalc() in js/engine.js.
   Every number is copied from the label named in `label`. Change only with a pharmacist's review.
   inds[].mgkgday = mg per kg per DAY by dosing interval (hours); inds[].adult = [mg per dose, text] from adultKg up
   (also the ceiling: a child's dose is never raised above it). susp = oral suspension strengths in the label (mg per 5 mL). */
const PEDS = {
  amox: {
    label:'DailyMed, amoxicillin (2026-07-07), sections 2.2, 2.3 and 3', srcIds:[27], ref:'2.2', adultRef:'2.2',
    adultKg:40, freq:[12,8], susp:[200,400],
    infant:{maxMonths:3, mgkgday:30, every:12, ref:'2.3'},
    inds:[
      {id:'mild', n:{ar:'الأذن والأنف والحنجرة، الجلد، المسالك البولية · خفيفة إلى متوسطة',en:'Ear/nose/throat, skin, urinary tract · mild to moderate'},
        mgkgday:{12:25,8:20}, adult:{12:[500,{ar:'500 ملغ كل 12 ساعة',en:'500 mg every 12 h'}],8:[250,{ar:'250 ملغ كل 8 ساعات',en:'250 mg every 8 h'}]}},
      {id:'sev', n:{ar:'الأذن والأنف والحنجرة، الجلد، المسالك البولية · شديدة',en:'Ear/nose/throat, skin, urinary tract · severe'},
        mgkgday:{12:45,8:40}, adult:{12:[875,{ar:'875 ملغ كل 12 ساعة',en:'875 mg every 12 h'}],8:[500,{ar:'500 ملغ كل 8 ساعات',en:'500 mg every 8 h'}]}},
      {id:'lrti', n:{ar:'الجهاز التنفسي السفلي · كل الشدات',en:'Lower respiratory tract · any severity'},
        mgkgday:{12:45,8:40}, adult:{12:[875,{ar:'875 ملغ كل 12 ساعة',en:'875 mg every 12 h'}],8:[500,{ar:'500 ملغ كل 8 ساعات',en:'500 mg every 8 h'}]}}
    ],
    def:'sev',
    duration:{ar:'48 إلى 72 ساعة بعد زوال الأعراض، و10 أيام على الأقل لعدوى المكورات العقدية الحالّة',en:'48–72 h after symptoms stop; at least 10 days for Streptococcus pyogenes'},
    renalKids:{ar:'لا توجد توصيات جرعة للأطفال مع قصور الكلى في النشرة (2.3).',en:'The label gives no dose for children with impaired kidney function (2.3).'}
  }
};
if(typeof module!=='undefined')module.exports={PEDS};
