# DOSEWAW

مرجع الجرعات للصيادلة: المضادات الحيوية، وخافضات الحرارة والمسكنات، ومضادات الهيستامين والكورتيزونات، وأدوية الجهاز الهضمي، والفيتامينات.

## كيف يعمل (مصمم للملايين)
- الموقع ملفات ثابتة فقط على شبكة Cloudflare؛ الزائر لا يصل إلى أي قاعدة بيانات.
- المحتوى المنشور في `data/*.json`، يُبنى من `content/` بالأمر `python3 tools/build_data.py`.
- الحسابات كلها على جهاز المستخدم (`js/engine.js`)، ويعمل بدون إنترنت بعد أول زيارة (`sw.js`).

## الملفات
| المسار | المحتوى |
|---|---|
| `index.html`, `css/app.css`, `js/app.js` | الصفحات (الرئيسية، الدواء، التداخلات، الحاسبات، المصادر، القائمة) |
| `brand/` | **الهوية البصرية**: الألوان والخطوط (`theme.css`)، الاسم والشعار (`brand.js`, `logo.svg`). تتغير بدون لمس الكود |
| `js/i18n.js` | كل نصوص الواجهة بالعربية والإنجليزية |
| `js/engine.js` | محرك الجرعات (البالغون وتعديل الكلى، الأطفال بالوزن والمل، تقدير الوزن من العمر) |
| `js/rules/antibiotics.js` | قواعد جرعات 100 مضاد حيوي (من BIOTICWAW، كل رقم من نشرة رسمية) |
| `js/rules/peds.js` | جرعات الأطفال بالوزن (حالياً: أموكسيسيلين) |
| `js/rules/vitamins.js` | حاسبات الفيتامينات الـ13 من VITAWAW (ملف مولّد بـ `tools/import_vitawaw.py --rebuild` من `content/vitamins/src/`) |
| `content/antibiotics/` | البيانات الأصلية: الدفعات، والنشرات المحفوظة `labels/`، والمصادر |
| `content/growth/` | جداول WHO للوزن حسب العمر |
| `design/phase0/` | نموذج التصميم المعتمد (المرحلة 0) |

## لوحة المالك وقاعدة البيانات
| المسار | المحتوى |
|---|---|
| `js/admin.js` | لوحة المالك (`#/admin`): المراجعة، النشر والرجوع، الهوية البصرية، الأدوية، الفريق |
| `supabase/migrations/` | قاعدة البيانات: الدعوات، التعديلات والمراجعة، النشر والسجل (الصلاحيات في قاعدة البيانات) |
| `src/worker.js`, `wrangler.jsonc` | خادم Cloudflare: يقدّم المحتوى المنشور من الحافة، والمعاينة تستخدم قاعدة التجربة |
| المشروعان | الحقيقي `kryoddbkwljbpjhhwhut` · التجريبي `oqynswsbhtgnnuyjwrea` |

## الاختبارات
```
python3 tools/build_data.py        # يبني data/ من content/
node tests/engine_test.mjs         # 2020 فحصاً للقواعد والمحرك
python3 -m http.server 8765 &      # ثم:
node tests/e2e.cjs                 # الجوال والآيباد والكمبيوتر، عربي وإنجليزي، كل الأدوية المئة
node tests/vitamin_cases.cjs       # 66 حالة طبية للفيتامينات من VITAWAW
node tests/worker_test.mjs         # خادم Cloudflare
node tests/admin_flow.cjs          # لوحة المالك (قاعدة بيانات وهمية)
# قاعدة البيانات: tests/sql/supabase_shim.sql ثم الترحيلات ثم tests/sql/core_test.sql على PostgreSQL
```
