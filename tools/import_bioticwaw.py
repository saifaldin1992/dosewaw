"""One-off import of the antibiotic content from a BIOTICWAW checkout into content/.
Usage: python3 tools/import_bioticwaw.py /path/to/bioticwaw-main
Copies the 100-drug batches, the saved labels and the reference notes, and turns the
source rows of the SQL files (ids 1-126) into content/antibiotics/sources.json."""
import json, re, shutil, sys, glob, os
src = sys.argv[1]; root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'content', 'antibiotics')
os.makedirs(out, exist_ok=True)
for f in glob.glob(os.path.join(src, 'docs/antibiotics/*')):
    dst = os.path.join(out, os.path.basename(f))
    if os.path.isdir(f): shutil.copytree(f, dst, dirs_exist_ok=True)
    else: shutil.copy(f, dst)
shutil.copy(os.path.join(src, 'js/abrules.js'), os.path.join(out, 'abrules.source.js'))
# SQL value tuples: '...' (with '' escapes) or $q$...$q$, numbers, true/false
def rows(sql):
    # scan each insert's VALUES list token by token, so brackets inside text never split a row
    scan = re.compile(r"\$q\$(.*?)\$q\$|'((?:[^']|'')*)'|(-?\d+(?:\.\d+)?)|(true|false|null)|([(),;])|(\s+)|(on conflict)", re.S | re.I)
    for m in re.finditer(r"insert into public\.sources \(([^)]*)\) values", sql):
        cols = [c.strip() for c in m.group(1).split(',')]
        pos, depth, cur = m.end(), 0, None
        while True:
            v = scan.match(sql, pos)
            if not v: raise SystemExit('cannot read SQL near: ' + sql[pos:pos + 80])
            pos = v.end()
            if v.group(6): continue
            if v.group(7) or v.group(5) == ';': break
            if v.group(5) == '(': depth += 1; cur = []; continue
            if v.group(5) == ')':
                depth -= 1
                if len(cur) != len(cols): raise SystemExit('column mismatch: ' + str(cur)[:120])
                yield dict(zip(cols, cur)); continue
            if v.group(5) == ',': continue
            if v.group(1) is not None: cur.append(v.group(1))
            elif v.group(2) is not None: cur.append(v.group(2).replace("''", "'"))
            elif v.group(3) is not None: cur.append(int(v.group(3)) if '.' not in v.group(3) else float(v.group(3)))
            else: cur.append({'true': True, 'false': False, 'null': None}[v.group(4).lower()])
S = {}
for f in ['supabase/manual/sources_antibiotics_1_26.sql', 'supabase/manual/batches_1_10_load_test.sql']:
    for r in rows(open(os.path.join(src, f), encoding='utf-8').read()):
        S[r['id']] = {k: r[k] for k in ('id', 'org', 'title', 'url', 'use_ar', 'use_en', 'kind')}
json.dump([S[k] for k in sorted(S)], open(os.path.join(out, 'sources.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('sources', len(S), 'ids', min(S), '-', max(S))
