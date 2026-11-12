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
assert len(ab) == len({d['id'] for d in ab}) == 100, 'expected 100 unique antibiotics'
dump('antibiotics.json', ab)

sources = json.load(open(C('antibiotics', 'sources.json'), encoding='utf-8'))
ids = {s['id'] for s in sources}
used = {i for d in ab for i in d.get('src', [])} | {i for d in ab for x in d.get('inter', []) for i in x.get('r', [])}
rules = open(C('antibiotics', 'abrules.source.js'), encoding='utf-8').read()
used |= {int(i) for m in re.findall(r'srcIds:\[([\d,\s]*)\]', rules) for i in m.split(',') if i.strip()}
missing = used - ids
assert not missing, f'source ids used but not defined: {sorted(missing)}'
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
dump('index.json', idx)
print('antibiotics', len(ab), '· sources', len(sources), '· index', len(idx))
