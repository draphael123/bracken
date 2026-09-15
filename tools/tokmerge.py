import re, difflib, sys
TOK = re.compile(r'\w+|\s+|[^\w\s]')
def edits(a, b):
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    return [(i1, i2, b[j1:j2]) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
def merge3(base, ours, theirs):
    Bt, Ot, Tt = TOK.findall(base), TOK.findall(ours), TOK.findall(theirs)
    chosen = [(i1, i2, r, 'o') for i1, i2, r in edits(Bt, Ot)]; joined = False
    for i1, i2, r in edits(Bt, Tt):
        e = (i1, i2, r, 't'); clash = None
        for k, c in enumerate(chosen):
            if c[3] == 't': continue
            if (e[0] < c[1] and c[0] < e[1]) or (e[0] == e[1] == c[0] == c[1]): clash = k; break
        if clash is None: chosen.append(e); continue
        c = chosen[clash]
        if (c[0], c[1], c[2]) == (e[0], e[1], e[2]): continue
        if e[0] == e[1] == c[0] == c[1]: chosen[clash] = (c[0], c[1], c[2] + e[2], 'j'); joined = True; continue
        return None, 'CLASH ours %r / theirs %r' % (''.join(c[2])[:160], ''.join(e[2])[:160])
    chosen.sort(key=lambda e: (e[0], e[1] != e[0]))
    out, pos = [], 0
    for i1, i2, r, _ in chosen:
        if i1 < pos: return None, 'overlap after sort'
        out += Bt[pos:i1] + r; pos = i2
    out += Bt[pos:]
    return ''.join(out), 'joined' if joined else 'token'
pat = re.compile(r'<<<<<<< [^\n]*\n(.*?)\|\|\|\|\|\|\| [^\n]*\n(.*?)=======\r?\n(.*?)>>>>>>> [^\n]*\n', re.S)
bad = 0
for p in sys.argv[1:]:
    s = open(p, encoding='utf-8', newline='').read()
    def f(m):
        global bad
        r, how = merge3(m.group(2), m.group(1), m.group(3))
        print(p, s[:m.start()].count('\n') + 1, how)
        if r is None: bad += 1; return m.group(0)
        return r
    open(p, 'w', encoding='utf-8', newline='').write(pat.sub(f, s))
print('UNRESOLVED', bad)
