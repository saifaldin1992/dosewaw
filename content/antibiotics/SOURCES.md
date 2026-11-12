# Source register for the antibiotic database

Each drug needs **at least two official sources** before it is entered: (1) the drug label or product information, and (2) a guideline that covers its use.
Secondary websites (Drugs.com, MedLibrary, PrescriberPoint, consumer blogs) are never a primary source.

| ID | Source | Use | Link | Status |
|---|---|---|---|---|
| S1 | WHO AWaRe Antibiotic Book, 2022 | Choice, dose and duration by infection | https://iris.who.int/handle/10665/365237 | Verified (record exists) |
| S2 | Moja L, et al. The 2023 WHO AWaRe classification. Clin Microbiol Infect 2024 | Access, Watch, Reserve group | https://doi.org/10.1016/j.cmi.2024.02.003 | Verified (DOI) |
| S3 | WHO Model List of Essential Medicines, 2023 | Essential antibiotics list | https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.02 | To verify the link |
| S4 | U.S. FDA / DailyMed prescribing information (one label per drug) | Doses, renal adjustment, interactions | https://dailymed.nlm.nih.gov/ | Available (search by drug) |
| S5 | European Medicines Agency SmPC (product information) | Doses and interactions (EU view) | https://www.ema.europa.eu/en/medicines | Available (search by drug) |
| S6 | BNF / BNFC (British National Formulary) | Doses and interactions (UK view) | https://bnf.nice.org.uk | Requires access, to verify |
| S7 | NICE antimicrobial guidance | Treatment by infection (UK) | https://www.nice.org.uk/guidance | Available |
| S8 | Health Service Executive (Ireland), antibacterials renal impairment dosing table | Kidney dose adjustment | https://assets.hse.ie/media/documents/Antibacterials_renal_impairment_dosing_table.pdf | Verified (document exists) |
| S9 | IDSA (Infectious Diseases Society of America) guidelines | Treatment by infection (US) | https://www.idsociety.org/practice-guideline/ | To verify the link |
| S10 | Cockcroft DW, Gault MH. Nephron 1976;16:31–41 | Creatinine clearance formula for the calculator | https://doi.org/10.1159/000180580 | Citation (to verify DOI) |
| S11 | NLM MedlinePlus drug information | Patient-level summary (not a dosing source) | https://medlineplus.gov/druginfo/ | Available |
| S12 | Drug-specific FDA or EMA safety communications | Important warnings | https://www.fda.gov/drugs/drug-safety-and-availability | Available |

## Rules for using sources
1. Every dose number carries the source ID in the database (`source_ids`).
2. The AWaRe group comes from S2 (or S1). A drug is marked "to verify" until it is checked against S2.
3. Where two sources disagree, both are recorded and the pharmacist decides before publishing (example already found: nitrofurantoin and kidney function).
4. Each source has a "checked on" date. Sources older than 2 years are re-checked before publishing.
5. Links are checked once per month by the owner or the pharmacist.

## Per-drug checklist (for the 100 drugs)
- [ ] S4 or S5 label found, dose and renal section copied with the section number
- [ ] S2 AWaRe group confirmed
- [ ] S1 or S7 or S9 guideline reference for the main indications
- [ ] S8 renal table checked (where it covers the drug)
- [ ] Top interactions (3–5) with their source
- [ ] Pharmacist review recorded
