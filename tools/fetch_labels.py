#!/usr/bin/env python3
"""Save the official U.S. label (openFDA = the label on DailyMed) of each drug as exact text: the evidence for every
number on the site.

Usage:  python3 tools/fetch_labels.py analgesics [id ...]     (no ids = every drug of the group)
Output: content/<group>/labels/<id>.json  {id, query, set_id, version, effective_time, brand, generic, route, type,
        manufacturer, url, sections:{name: [text]}}

For each id the newest label is chosen whose generic name matches exactly, whose route matches, of the given type
(HUMAN PRESCRIPTION DRUG or HUMAN OTC DRUG) and, when given, whose «dosage forms» text contains the wanted form.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = 'https://api.fda.gov/drug/label.json'
KEEP = ['boxed_warning', 'indications_and_usage', 'dosage_and_administration', 'dosage_and_administration_table',
        'dosage_forms_and_strengths', 'contraindications', 'warnings_and_cautions', 'warnings', 'precautions',
        'drug_interactions', 'drug_interactions_table', 'use_in_specific_populations', 'pregnancy', 'nursing_mothers',
        'lactation', 'pediatric_use', 'geriatric_use', 'renal_impairment', 'hepatic_impairment', 'overdosage',
        'information_for_patients', 'clinical_pharmacology', 'pharmacokinetics', 'how_supplied', 'storage_and_handling',
        # over-the-counter «Drug Facts»
        'active_ingredient', 'purpose', 'indications_and_usage', 'do_not_use', 'ask_doctor', 'ask_doctor_or_pharmacist',
        'stop_use', 'pregnancy_or_breast_feeding', 'keep_out_of_reach_of_children', 'when_using', 'other_safety_information',
        'package_label_principal_display_panel']
RX, OTC = 'HUMAN PRESCRIPTION DRUG', 'HUMAN OTC DRUG'
GROUPS = {
  'analgesics': {
    # id: (generic search, exact generic regex, route regex, type, text that must appear in the label or None)
    'paracetamol_child': ('acetaminophen', r'^ACETAMINOPHEN$', 'ORAL', OTC, r'160 mg (in|per|/) ?5 mL'),
    'paracetamol_adult': ('acetaminophen', r'^ACETAMINOPHEN$', 'ORAL', OTC, r'500 mg'),
    'paracetamol_iv': ('acetaminophen', r'^ACETAMINOPHEN$', 'INTRAVENOUS', RX, None),
    'ibuprofen_susp': ('ibuprofen', r'^IBUPROFEN$', 'ORAL', RX, r'100 mg ?(per|/|in) ?5 mL'),
    'ibuprofen_tab': ('ibuprofen', r'^IBUPROFEN$', 'ORAL', RX, r'(400|600|800) mg'),
    'ibuprofen_child_otc': ('ibuprofen', r'^IBUPROFEN$', 'ORAL', OTC, r'100 mg (in|per|/) ?5 mL'),
    'ibuprofen_adult_otc': ('ibuprofen', r'^IBUPROFEN$', 'ORAL', OTC, r'Ibuprofen,? USP,? 200 mg|Ibuprofen 200 mg'),
    'naproxen': ('naproxen', r'^NAPROXEN$', 'ORAL', RX, None),
    'diclofenac_k': ('diclofenac potassium', r'^DICLOFENAC POTASSIUM$', 'ORAL', RX, r'50 mg'),
    'mefenamic': ('mefenamic acid', r'^MEFENAMIC ACID$', 'ORAL', RX, None),
    'aspirin': ('aspirin', r'^ASPIRIN$', 'ORAL', OTC, r'325 mg'),
    'celecoxib': ('celecoxib', r'^CELECOXIB$', 'ORAL', RX, None),
    'ketorolac': ('ketorolac tromethamine', r'^KETOROLAC TROMETHAMINE$', 'ORAL', RX, None),
  }
}

def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(url, timeout=30) as r: return json.load(r)
        except Exception as e:
            if getattr(e, 'code', 0) == 404: return {'results': []}
            time.sleep(2 ** i)
    raise SystemExit('cannot reach ' + url)

def fetch(group, lid, spec):
    words, gen_re, route_re, typ, must = spec
    q = f'openfda.generic_name:"{words}" AND openfda.product_type:"{typ}"'
    if words == 'acetaminophen' and must and '160' in must: q += ' AND active_ingredient:"160 mg"'
    res = get(API + '?' + urllib.parse.urlencode({'search': q, 'limit': 100, 'sort': 'effective_time:desc'})).get('results', [])
    ok = []
    for r in res:
        o = r.get('openfda', {})
        if not any(re.match(gen_re, g.upper()) for g in o.get('generic_name', [])): continue
        if not any(re.search(route_re, x) for x in o.get('route', [])): continue
        text = json.dumps(r)
        if must and not re.search(must, text, re.I): continue
        ok.append(r)
    if not ok: print(lid, 'NO LABEL FOUND'); return
    r = max(ok, key=lambda x: x.get('effective_time', ''))
    o = r.get('openfda', {})
    out = {'id': lid, 'query': q, 'set_id': r.get('set_id'), 'version': r.get('version'), 'effective_time': r.get('effective_time'),
           'brand': o.get('brand_name', []), 'generic': o.get('generic_name', []), 'route': o.get('route', []), 'type': typ,
           'manufacturer': o.get('manufacturer_name', []),
           'url': 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=' + str(r.get('set_id')),
           'sections': {k: r[k] for k in KEEP if k in r}}
    d = os.path.join(ROOT, 'content', group, 'labels'); os.makedirs(d, exist_ok=True)
    json.dump(out, open(os.path.join(d, lid + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(lid, out['effective_time'], (out['brand'] or ['?'])[0], '|', (out['manufacturer'] or ['?'])[0], '|', len(ok), 'candidates')

if __name__ == '__main__':
    group = sys.argv[1]; ids = sys.argv[2:] or list(GROUPS[group])
    for i in ids: fetch(group, i, GROUPS[group][i]); time.sleep(0.3)
