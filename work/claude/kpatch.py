# asserted exact-match replacements, line-ending blind (the checkout is CRLF, the patches are written LF)
import io
CR = chr(13)
LF = chr(10)
def patch(root, path, pairs):
    p = root + '/' + path
    s = io.open(p, encoding='utf-8', newline='').read()
    crlf = (CR + LF) in s
    s = s.replace(CR + LF, LF)
    for old, new in pairs:
        n = s.count(old)
        assert n == 1, (path, n, old[:100])
        s = s.replace(old, new)
    if crlf:
        s = s.replace(LF, CR + LF)
    io.open(p, 'w', encoding='utf-8', newline='').write(s)
