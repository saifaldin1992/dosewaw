# Plan: 100 antibiotics (done 2026-11-10, version 1.6.0)

## Goal
Every one of the 100 antibiotics in `LIST.md` on the site with: uses, adult dose, kidney adjustment, timing,
the label's clinically important interactions, a dose calculator built from the label, and the source of every number.

## Method (one pipeline for every drug)
1. **Label evidence.** `tools/fetch_labels.py` saves the official label as exact text in `labels/<id>.json`
   (openFDA = the FDA label on DailyMed: set id, version date, indications, dosage and administration with tables,
   contraindications, drug interactions, renal sections). For a drug with no US label, the official EU/UK label
   (EMA SmPC or the UK eMC) is used and named as such. Nothing is written from memory or from a secondary site.
2. **Authoring.** `batchN.json` holds each drug in Arabic and English (uses, dose, renal, timing), its interactions
   (from the label's interactions section; `major` = contraindicated or "avoid" in the label, `moderate` = dose change or
   monitoring, `minor` = laboratory test interference) and the source ids. The calculator rules go into `js/abrules.js`.
3. **Checks.** `tests/abrules_test.mjs` (fallback per row, both languages, known values from each label),
   `python3 tools/abx.py check N` (no < or >, Arabic and English present, every interaction cites a source, every drug has a label, AWaRe 2023).
4. **Loading.** `python3 tools/abx.py sql N` writes `supabase/manual/batchN_load_test.sql` (sources, antibiotics with
   `reviewed = false`, interactions). Loaded on the TEST project only.
5. **Approval.** The owner approves in 🔔 (one drug, or «اعتماد الكل» for a whole batch) and presses «نشر».
   Calculators show to visitors only for approved and published drugs.
6. **Release.** Main site only after the owner says «انشر».

## Calculator scope
- Adults (18 and over). Creatinine clearance by Cockcroft-Gault (actual, ideal or adjusted weight as in `abCrCl`).
- Doses by infection where the label lists them; kidney bands exactly as the label's table; dialysis as the label says.
- Weight-based doses (mg/kg) are calculated from the weight entered and capped where the label gives a maximum.
- Under 18: the calculator says the dose is not calculated for children and points to the label section.
- Drugs dosed by blood levels (vancomycin, aminoglycosides, colistin…) show the label's starting dose and say that
  the dose is then adjusted by levels; the calculator never replaces monitoring.

## Batches
All 10 batches are written, with calculators, and loaded on the TEST project as drafts (one file:
`supabase/manual/batches_1_10_load_test.sql`). The full list with labels, dates and source ids: `LIST.md`.
Six planned drugs had no official label anywhere and were replaced: procaine penicillin, doripenem, gatifloxacin, nalidixic acid,
cefalotin, cefradine → penicillin G potassium, imipenem-relebactam, aztreonam-avibactam, methenamine, oxacillin, sulbactam-durlobactam.

## Rules for every drug
- The dose and the kidney table are copied from the label (section named); the label version date is recorded.
- A drug withdrawn from a market keeps its last official label and says so.
- Every interaction cites its source; Arabic and English for every field; no < or > in any text.
- Open clinical points go to the owner (listed in `CLAUDE.md`, «Where we are»), never guessed. When a label gives no kidney
  number, the calculator asks yes/no instead of using a guessed threshold.
