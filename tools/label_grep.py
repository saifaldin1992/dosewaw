#!/usr/bin/env python3
"""Show where a phrase appears in saved labels (to copy a number with its exact wording).
Usage: python3 tools/label_grep.py <group> <regex> [id ...]"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
group, pat, ids = sys.argv[1], re.compile(sys.argv[2], re.I), sys.argv[3:]
d = os.path.join(ROOT, 'content', group, 'labels')
for f in sorted(os.listdir(d)):
    lid = f[:-5]
    if ids and lid not in ids: continue
    S = json.load(open(os.path.join(d, f), encoding='utf-8'))['sections']
    for k, v in S.items():
        t = re.sub(r'\s+', ' ', ' '.join(v))
        for m in pat.finditer(t):
            print(f'[{lid} · {k}] …{t[max(0, m.start() - 160):m.end() + 200]}…')
