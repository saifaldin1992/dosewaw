"""Build the published data files (data/*.json) from content/.
Run after any content change:  python3 tools/build_data.py
The site reads only data/ (static files on the CDN); visitors never reach a database."""
import json, glob, os, re
import openpyxl
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = lambda *p: os.path.join(root, 'content', *p)
D = lambda *p: os.path.join(root, 'data', *p)
os.makedirs(D(), exist_ok=True)
def dump(name, obj):
    json.dump(obj, open(D(name), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

# antibiotics: the 100 reviewed drugs, in the batch order
ab = []
for n in range(1, 11):
    ab += json.load(open(C('antibiotics', f'batch{n}.json'), encoding='utf-8'))['drugs']
keep = ('id', 'n', 'aware', 'cls', 'uses', 'dose', 'renal', 'timing', 'inter', 'src')
ab = [{k: d[k] for k in keep if k in d} for d in ab]
# the last pharmacist review of each drug (later reviews come from the owner panel, see 0003_review_and_reports.sql)
rev = json.load(open(C('antibiotics', 'review.json'), encoding='utf-8'))
for d in ab: d['rev'] = {'at': rev['at'], 'by': rev['by']}
assert len(ab) == len({d['id'] for d in ab}) == 100, 'expected 100 unique antibiotics'
dump('antibiotics.json', ab)

sources = json.load(open(C('antibiotics', 'sources.json'), encoding='utf-8'))
ids = {s['id'] for s in sources}
used = {i for d in ab for i in d.get('src', [])} | {i for d in ab for x in d.get('inter', []) for i in x.get('r', [])}
rules = open(C('antibiotics', 'abrules.source.js'), encoding='utf-8').read()
used |= {int(i) for m in re.findall(r'srcIds:\[([\d,\s]*)\]', rules) for i in m.split(',') if i.strip()}
missing = used - ids
assert not missing, f'source ids used but not defined: {sorted(missing)}'
for x in sources: x['g'] = 'ab'
# label-based groups: drugs written from the saved labels (content/<folder>/labels) and WHO; sources built from the label files
LGROUPS = {'an': 'analgesics', 'ah': 'antihistamines', 'gi': 'gi'}
GD = {}
for g, folder in LGROUPS.items():
  GD[g] = json.load(open(C(folder, 'drugs.json'), encoding='utf-8'))['drugs']
  for x in json.load(open(C(folder, 'sources.json'), encoding='utf-8')):
    if 'label' in x:
        L = json.load(open(C(folder, 'labels', x['label'] + '.json'), encoding='utf-8'))
        day = L['effective_time']; day = f'{day[:4]}-{day[4:6]}-{day[6:]}'
        kind = 'OTC «Drug Facts»' if L['type'] == 'HUMAN OTC DRUG' else 'prescribing information'
        src = {'id': x['id'], 'org': f"U.S. FDA label on DailyMed ({(L['manufacturer'] or ['?'])[0]}), {day}",
               'title': f"{', '.join(g.title() for g in L['generic'])} ({L['route'][0].lower()}): {kind}", 'url': L['url'],
               'use_ar': x['use_ar'], 'use_en': x['use_en'], 'kind': 'd'}
    else:
        src = {k: x[k] for k in ('id', 'org', 'title', 'url', 'use_ar', 'use_en', 'kind')}
    src['g'] = g
    assert src['id'] not in ids, f"source id {src['id']} used twice"
    sources.append(src); ids.add(src['id'])
for g, folder in LGROUPS.items():
  used = {i for d in GD[g] for i in d.get('src', [])} | {i for d in GD[g] for x in d.get('inter', []) for i in x.get('r', [])}
  assert not (used - ids), f'{folder}: source ids not defined: {sorted(used - ids)}'
  for d in GD[g]:
    assert not re.search(r'[<>]', json.dumps(d, ensure_ascii=False)), d['id'] + ': < or > in text'
  dump(folder + '.json', GD[g])
an = GD['an']
dump('sources.json', sources)

# WHO weight-for-age medians (kg) by month 0-120: Child Growth Standards 0-5 y (by day) + 2007 reference 5-10 y (by month)
def med(sex):
    day = {r[0]: r[2] for r in list(openpyxl.load_workbook(C('growth', f'wfa-{sex}-0-5.xlsx'), read_only=True).active.iter_rows(values_only=True))[1:]}
    mon = {r[0]: r[2] for r in list(openpyxl.load_workbook(C('growth', f'wfa-{sex}-5-10.xlsx'), read_only=True).active.iter_rows(values_only=True))[1:]}
    return [round(day[round(m * 30.4375)] if m <= 60 else mon[m], 2) for m in range(0, 121)]
dump('who_wfa.json', {'boys': med('boys'), 'girls': med('girls'),
    'src': {'ar': 'منظمة الصحة العالمية: معايير نمو الطفل (0–5 سنوات) ومرجع النمو 2007 (5–10 سنوات)، الوسيط',
            'en': 'WHO Child Growth Standards (0–5 y) and WHO 2007 growth reference (5–10 y), median'}})

# search index for every group (small file loaded first)
idx = [{'id': d['id'], 'g': 'ab', 'n': d['n'], 'c': d['cls']} for d in ab]
# vitamins: the 13 calculators (names from the VITAWAW texts)
vt = open(C('vitamins', 'src', 'i18n.js'), encoding='utf-8').read()
def txt(key):
    m = re.search(r"\b" + key + r":\['((?:[^'\\]|\\.)*)','((?:[^'\\]|\\.)*)'\]", vt)
    clean = lambda x: re.sub(r'\\u([0-9a-fA-F]{4})', lambda u: chr(int(u.group(1), 16)), x)
    return {'ar': clean(m.group(1)), 'en': clean(m.group(2))}
for line in open(C('vitamins', 'keys.txt')).read().split('\n'):
    if line.strip():
        k, n, h = line.split()
        idx.append({'id': k, 'g': 'vit', 'n': txt(n), 'c': txt(h)})
idx += [{'id': d['id'], 'g': g, 'n': d['n'], 'c': d['cls']} for g in LGROUPS for d in GD[g]]
dump('index.json', idx)
if not os.path.exists(D('brand.json')): dump('brand.json', {})  # the published brand comes from Supabase (worker)
print(*[f'{LGROUPS[g]} {len(GD[g])} ·' for g in LGROUPS], 'antibiotics', len(ab), '· sources', len(sources), '· index', len(idx))
