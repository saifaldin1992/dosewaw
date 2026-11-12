# The 100 antibiotics

Generated from `tools/abx.py` (order and source numbers) and `docs/antibiotics/batchN.json`. Batch = 10 rows each, in this order.
Source = the database source id of the drug's own label (27 + place). AWaRe = WHO AWaRe 2023 (— = not classified).

| # | Antibiotic | الاسم | Class | AWaRe | Label | Label date | Source | Interactions |
|---|---|---|---|---|---|---|---|---|
| 1 | Amoxicillin | أموكسيسيلين | Penicillins | access | US label (DailyMed) | 2026-07-07 | 27 | 5 |
| 2 | Amoxicillin–clavulanate | أموكسيسيلين–كلافولانات | Penicillins with a beta-lactamase inhibitor | access | US label (DailyMed) | 2026-08-29 | 28 | 4 |
| 3 | Cephalexin | سيفالكسين | First-generation cephalosporins | access | US label (DailyMed) | 2026-08-24 | 29 | 3 |
| 4 | Doxycycline | دوكسيسيكلين | Tetracyclines | access | US label (DailyMed) | 2026-08-18 | 30 | 5 |
| 5 | Ciprofloxacin | سيبروفلوكساسين | Fluoroquinolones | watch | US label (DailyMed) | 2026-07-13 | 31 | 5 |
| 6 | Azithromycin | أزيثروميسين | Macrolides | watch | US label (DailyMed) | 2026-09-03 | 32 | 4 |
| 7 | Nitrofurantoin | نيتروفورانتوين | Nitrofurans | access | US label (DailyMed) | 2026-06-24 | 33 | 3 |
| 8 | Metronidazole | ميترونيدازول | Nitroimidazoles | access | US label (DailyMed) | 2026-07-01 | 34 | 5 |
| 9 | Ceftriaxone | سيفترياكسون | Third-generation cephalosporins | watch | US label (DailyMed) | 2026-07-23 | 35 | 2 |
| 10 | Sulfamethoxazole–trimethoprim | سلفاميثوكسازول–تريميثوبريم | Sulfonamides with trimethoprim | access | US label (DailyMed) | 2026-08-25 | 36 | 3 |
| 11 | Clarithromycin | كلاريثروميسين | Macrolides | watch | US label (DailyMed) | 2026-04-17 | 37 | 7 |
| 12 | Levofloxacin | ليفوفلوكساسين | Fluoroquinolones | watch | US label (DailyMed) | 2026-07-18 | 38 | 3 |
| 13 | Cefuroxime axetil | سيفوروكسيم أكسيتيل | Second-generation cephalosporins | watch | US label (DailyMed) | 2026-01-16 | 39 | 2 |
| 14 | Cefixime | سيفيكسيم | Third-generation cephalosporins | watch | US label (DailyMed) | 2026-04-06 | 40 | 2 |
| 15 | Clindamycin | كليندامايسين | Lincosamides | access | US label (DailyMed) | 2026-06-03 | 41 | 3 |
| 16 | Flucloxacillin | فلوكلوكساسيلين | Beta-lactamase-resistant penicillins | access | UK SmPC | 2025-06-19 | 42 | 4 |
| 17 | Cefazolin | سيفازولين | First-generation cephalosporins | access | US label (DailyMed) | 2026-05-14 | 43 | 1 |
| 18 | Gentamicin | جنتاميسين | Aminoglycosides | access | US label (DailyMed) | 2026-05-20 | 44 | 2 |
| 19 | Vancomycin (intravenous) | فانكومايسين (وريدي) | Glycopeptides | watch | US label (DailyMed) | 2026-08-19 | 45 | 2 |
| 20 | Linezolid | لينيزوليد | Oxazolidinones | reserve | US label (DailyMed) | 2026-08-24 | 46 | 3 |
| 21 | Ampicillin | أمبيسيلين | Aminopenicillins | access | US label (DailyMed) | 2026-07-27 | 47 | 1 |
| 22 | Ampicillin–sulbactam | أمبيسيلين–سولباكتام | Penicillins with a beta-lactamase inhibitor | access | US label (DailyMed) | 2026-07-23 | 48 | 3 |
| 23 | Penicillin V | بنسلين V (فينوكسي ميثيل بنسلين) | Penicillins | access | US label (DailyMed) | 2026-07-23 | 49 | 0 |
| 24 | Benzathine benzylpenicillin | بنزاثين بنزيل بنسلين | Long-acting penicillins | access | US label (DailyMed) | 2026-07-21 | 50 | 2 |
| 25 | Penicillin G potassium | بنزيل بنسلين البوتاسيوم (بنسلين G) | Penicillins | access | US label (DailyMed) | 2025-12-16 | 51 | 3 |
| 26 | Dicloxacillin | ديكلوكساسيلين | Penicillinase-resistant penicillins | access | US label (DailyMed) | 2023-12-27 | 52 | 4 |
| 27 | Piperacillin–tazobactam | بيبيراسيلين–تازوباكتام | Penicillins with a beta-lactamase inhibitor | watch | US label (DailyMed) | 2026-05-15 | 53 | 5 |
| 28 | Temocillin | تيموسيلين | Penicillins | watch | French RCP | 2026-05-26 | 54 | 1 |
| 29 | Sulbactam–durlobactam | سولباكتام–دورلوباكتام | Beta-lactam with a beta-lactamase inhibitor | — | US label (DailyMed) | 2025-11-26 | 55 | 1 |
| 30 | Cefadroxil | سيفادروكسيل | First-generation cephalosporins | access | US label (DailyMed) | 2025-10-10 | 56 | 0 |
| 31 | Oxacillin | أوكساسيلين | Penicillinase-resistant penicillins | access | US label (DailyMed) | 2026-08-31 | 57 | 2 |
| 32 | Cefaclor | سيفاكلور | Second-generation cephalosporins | watch | US label (DailyMed) | 2025-05-01 | 58 | 2 |
| 33 | Cefprozil | سيفبروزيل | Second-generation cephalosporins | watch | US label (DailyMed) | 2026-07-09 | 59 | 2 |
| 34 | Cefpodoxime proxetil | سيفبودوكسيم بروكسيتيل | Third-generation cephalosporins | watch | US label (DailyMed) | 2026-07-30 | 60 | 3 |
| 35 | Cefdinir | سيفدينير | Third-generation cephalosporins | watch | US label (DailyMed) | 2025-10-14 | 61 | 3 |
| 36 | Cefditoren pivoxil | سيفديتورين بيفوكسيل | Third-generation cephalosporins | watch | US label (DailyMed) | 2013-06-04 | 62 | 2 |
| 37 | Cefoxitin | سيفوكسيتين | Cephamycins (second generation) | watch | US label (DailyMed) | 2026-08-24 | 63 | 1 |
| 38 | Cefotetan | سيفوتيتان | Cephamycins (second generation) | watch | US label (DailyMed) | 2025-01-08 | 64 | 1 |
| 39 | Cefotaxime | سيفوتاكسيم | Third-generation cephalosporins | watch | US label (DailyMed) | 2024-04-11 | 65 | 2 |
| 40 | Ceftazidime | سيفتازيديم | Third-generation cephalosporins | watch | US label (DailyMed) | 2026-08-03 | 66 | 2 |
| 41 | Cefepime | سيفيبيم | Fourth-generation cephalosporins | watch | US label (DailyMed) | 2026-06-25 | 67 | 3 |
| 42 | Ceftaroline fosamil | سيفتارولين فوساميل | Cephalosporins with MRSA activity | reserve | US label (DailyMed) | 2026-05-29 | 68 | 0 |
| 43 | Ceftobiprole | سيفتوبيبرول | Cephalosporins with MRSA activity | reserve | US label (DailyMed) | 2026-10-13 | 69 | 1 |
| 44 | Cefiderocol | سيفيديروكول | Siderophore cephalosporins | reserve | US label (DailyMed) | 2026-02-24 | 70 | 1 |
| 45 | Ceftolozane–tazobactam | سيفتولوزان–تازوباكتام | Cephalosporins with a beta-lactamase inhibitor | reserve | US label (DailyMed) | 2026-05-12 | 71 | 0 |
| 46 | Ceftazidime–avibactam | سيفتازيديم–أفيباكتام | Cephalosporins with a beta-lactamase inhibitor | reserve | US label (DailyMed) | 2025-04-30 | 72 | 2 |
| 47 | Imipenem–cilastatin | إيميبينيم–سيلاستاتين | Carbapenems | watch | US label (DailyMed) | 2025-01-16 | 73 | 3 |
| 48 | Meropenem | ميروبينيم | Carbapenems | watch | US label (DailyMed) | 2026-08-26 | 74 | 2 |
| 49 | Ertapenem | إرتابينيم | Carbapenems | watch | US label (DailyMed) | 2026-03-02 | 75 | 2 |
| 50 | Imipenem–cilastatin–relebactam | إيميبينيم–سيلاستاتين–ريليباكتام | Carbapenems with a beta-lactamase inhibitor | reserve | US label (DailyMed) | 2025-12-09 | 76 | 2 |
| 51 | Aztreonam | أزتريونام | Monobactams | reserve | US label (DailyMed) | 2025-12-15 | 77 | 2 |
| 52 | Meropenem–vaborbactam | ميروبينيم–فابورباكتام | Carbapenem with a beta-lactamase inhibitor | reserve | US label (DailyMed) | 2026-02-27 | 78 | 3 |
| 53 | Amikacin | أميكاسين | Aminoglycosides | access | US label (DailyMed) | 2026-07-27 | 79 | 4 |
| 54 | Tobramycin (injection) | توبراميسين (حقن) | Aminoglycosides | watch | US label (DailyMed) | 2026-04-13 | 80 | 4 |
| 55 | Streptomycin | ستربتومايسين | Aminoglycosides | watch | US label (DailyMed) | 2026-01-21 | 81 | 3 |
| 56 | Plazomicin | بلازوميسين | Aminoglycosides | reserve | US label (DailyMed) | 2024-12-20 | 82 | 2 |
| 57 | Erythromycin | إريثرومايسين | Macrolides | watch | US label (DailyMed) | 2026-04-08 | 83 | 9 |
| 58 | Roxithromycin | روكسيثرومايسين | Macrolides | watch | French RCP | 2026-01-05 | 84 | 7 |
| 59 | Josamycin | جوزاميسين | Macrolides | watch | French RCP | 2024-05-14 | 85 | 7 |
| 60 | Telithromycin | تيليثرومايسين | Ketolides (related to macrolides) | watch | US label (DailyMed) | 2012-05-02 | 86 | 9 |
| 61 | Lincomycin | لينكومايسين | Lincosamides | watch | US label (DailyMed) | 2026-08-04 | 87 | 1 |
| 62 | Minocycline | مينوسايكلين | Tetracyclines | watch | US label (DailyMed) | 2026-07-16 | 88 | 6 |
| 63 | Tetracycline | تتراسيكلين | Tetracyclines | access | US label (DailyMed) | 2026-05-22 | 89 | 4 |
| 64 | Tigecycline | تيجيسايكلين | Glycylcyclines (related to tetracyclines) | reserve | US label (DailyMed) | 2026-02-17 | 90 | 3 |
| 65 | Omadacycline | أومادا سايكلين | Tetracyclines (aminomethylcycline) | reserve | US label (DailyMed) | 2026-05-27 | 91 | 2 |
| 66 | Eravacycline | إيرافا سايكلين | Tetracyclines (fluorocycline) | reserve | US label (DailyMed) | 2025-03-31 | 92 | 2 |
| 67 | Moxifloxacin | موكسيفلوكساسين | Fluoroquinolones | watch | US label (DailyMed) | 2026-08-17 | 93 | 5 |
| 68 | Ofloxacin | أوفلوكساسين | Fluoroquinolones | watch | US label (DailyMed) | 2026-06-06 | 94 | 6 |
| 69 | Norfloxacin | نورفلوكساسين | Fluoroquinolones | watch | French RCP | 2025-02-25 | 95 | 5 |
| 70 | Gemifloxacin | جيميفلوكساسين | Fluoroquinolones | watch | US label (DailyMed) | 2016-08-01 | 96 | 3 |
| 71 | Delafloxacin | ديلافلوكساسين | Fluoroquinolones | watch | US label (DailyMed) | 2025-08-01 | 97 | 2 |
| 72 | Aztreonam–avibactam | أزتريونام–أفيباكتام | Monobactam with a beta-lactamase inhibitor | — | US label (DailyMed) | 2026-06-24 | 98 | 1 |
| 73 | Methenamine hippurate | ميثينامين هيبورات | Urinary antiseptics | — | US label (DailyMed) | 2026-08-07 | 99 | 2 |
| 74 | Trimethoprim | تريميثوبريم | Dihydrofolate reductase inhibitors | access | US label (DailyMed) | 2024-06-04 | 100 | 2 |
| 75 | Sulfadiazine | سلفاديازين | Sulfonamides | access | US label (DailyMed) | 2024-09-24 | 101 | 3 |
| 76 | Fosfomycin (oral) | فوسفومايسين (فموي) | Phosphonic acid derivatives | watch | US label (DailyMed) | 2026-04-09 | 102 | 1 |
| 77 | Tinidazole | تينيدازول | Nitroimidazoles | access | US label (DailyMed) | 2025-12-17 | 103 | 6 |
| 78 | Secnidazole | سيكنيدازول | Nitroimidazoles | access | US label (DailyMed) | 2026-10-30 | 104 | 2 |
| 79 | Teicoplanin | تيكوبلانين | Glycopeptides | watch | UK SmPC | 2025-12-11 | 105 | 2 |
| 80 | Daptomycin | دابتومايسين | Cyclic lipopeptides | reserve | US label (DailyMed) | 2026-08-26 | 106 | 2 |
| 81 | Dalbavancin | دالبافانسين | Lipoglycopeptides | reserve | US label (DailyMed) | 2026-07-28 | 107 | 0 |
| 82 | Oritavancin | أوريتافانسين | Lipoglycopeptides | reserve | US label (DailyMed) | 2025-12-18 | 108 | 3 |
| 83 | Tedizolid | تيديزوليد | Oxazolidinones | reserve | US label (DailyMed) | 2026-02-27 | 109 | 2 |
| 84 | Rifampin (rifampicin) | ريفامبين (ريفامبيسين) | Rifamycins | watch | US label (DailyMed) | 2026-02-11 | 110 | 12 |
| 85 | Rifabutin | ريفابوتين | Rifamycins | watch | US label (DailyMed) | 2026-07-20 | 111 | 4 |
| 86 | Rifapentine | ريفابنتين | Rifamycins | — | US label (DailyMed) | 2026-06-04 | 112 | 3 |
| 87 | Isoniazid | إيزونيازيد | Antituberculosis drugs (hydrazides) | — | US label (DailyMed) | 2025-12-02 | 113 | 6 |
| 88 | Ethambutol | إيثامبوتول | Antituberculosis drugs | — | US label (DailyMed) | 2026-05-05 | 114 | 1 |
| 89 | Pyrazinamide | بيرازيناميد | Antituberculosis drugs | — | US label (DailyMed) | 2026-03-02 | 115 | 0 |
| 90 | Bedaquiline | بيداكويلين | Diarylquinolines (antituberculosis) | — | US label (DailyMed) | 2025-10-17 | 116 | 3 |
| 91 | Delamanid | ديلامانيد | Nitroimidazoles (antituberculosis) | — | EU SmPC (EMA) | EMA product information (current) | 117 | 3 |
| 92 | Pretomanid | بريتومانيد | Nitroimidazoles (antituberculosis) | — | US label (DailyMed) | 2024-11-15 | 118 | 3 |
| 93 | Chloramphenicol (injection) | كلورامفينيكول (حقن) | Amphenicols | access | US label (DailyMed) | 2024-10-10 | 119 | 1 |
| 94 | Colistimethate (colistin) | كوليستيمثات (كوليستين) | Polymyxins | reserve | US label (DailyMed) | 2026-06-08 | 120 | 3 |
| 95 | Polymyxin B | بوليميكسين ب | Polymyxins | reserve | US label (DailyMed) | 2026-06-22 | 121 | 2 |
| 96 | Fusidic acid (oral) | حمض الفوسيديك (فموي) | Steroid antibacterials | watch | UK SmPC | 2023-07-13 | 122 | 3 |
| 97 | Fidaxomicin | فيداكسومايسين | Macrocyclic antibiotics | watch | US label (DailyMed) | 2026-05-22 | 123 | 1 |
| 98 | Rifaximin | ريفاكسيمين | Rifamycins (non-absorbed) | watch | US label (DailyMed) | 2025-06-25 | 124 | 2 |
| 99 | Lefamulin | ليفامولين | Pleuromutilins | reserve | US label (DailyMed) | 2026-07-22 | 125 | 5 |
| 100 | Pristinamycin | بريستيناميسين | Streptogramins (synergistins) | watch | French RCP | 2026-06-17 | 126 | 3 |
