# measure every level's screenshots (work/audit/NN-id-j.jpg, 640x360): lightness spread, chroma, the playfield's separation from the backdrop, warmth
import glob, re, json, numpy as np
from PIL import Image
def lab(rgb):
    c = rgb / 255.0; c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    X = c[..., 0] * .4124 + c[..., 1] * .3576 + c[..., 2] * .1805; Y = c[..., 0] * .2126 + c[..., 1] * .7152 + c[..., 2] * .0722; Z = c[..., 0] * .0193 + c[..., 1] * .1192 + c[..., 2] * .9505
    f = lambda t: np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
    fx, fy, fz = f(X / .9505), f(Y), f(Z / 1.089)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)
BEST = {'wood', 'marsh', 'kings', 'spore', 'stockade', 'longwater', 'flotilla', 'waymeet', 'fields', 'underleaf', 'moor', 'reef', 'hurricane', 'lamplit'}
WEAK = {'shop', 'shopCrag', 'shopSea', 'crown', 'harbor', 'undercrown', 'hanging', 'scree', 'storm', 'mage', 'fallingtower', 'burial', 'spire'}
rows = {}
for p in sorted(glob.glob('work/audit/[0-9][0-9]-*-[0-9].jpg')):
    import os; m = re.match(r'(\d\d)-(.+)-(\d)\.jpg', os.path.basename(p)); lv = m.group(2)
    a = np.asarray(Image.open(p).convert('RGB')).astype(float)[40:330]          # below the HUD plates, above the bottom bar
    L, A, B = lab(a); C = np.hypot(A, B); H = a.shape[0]
    top, bot = L[: int(H * 0.45)], L[int(H * 0.62):]                              # the backdrop band, the ground band
    r = rows.setdefault(lv, {'spread': [], 'chroma': [], 'sep': [], 'warm': [], 'lit': []})
    r['spread'].append(float(np.percentile(L, 90) - np.percentile(L, 10))); r['chroma'].append(float(np.median(C)))
    r['sep'].append(float(abs(np.median(top) - np.median(bot)))); r['warm'].append(float(np.mean(B > 12) - np.mean(B < -8)))
    r['lit'].append(float(np.mean((L > 70) & (B > 20))))                           # warm highlights: lamps, fire, sunlit edges
out = {lv: {k: round(float(np.mean(v)), 3) for k, v in r.items()} for lv, r in rows.items()}
def group(names): g = [out[n] for n in names if n in out]; return {k: round(float(np.mean([x[k] for x in g])), 3) for k in g[0]}
print(json.dumps({'best': group(BEST), 'weak': group(WEAK)}, indent=1))
for lv, v in sorted(out.items(), key=lambda kv: kv[1]['spread']): print(f"{lv:13s} {'BEST' if lv in BEST else 'weak' if lv in WEAK else '    '} spread {v['spread']:5.1f}  chroma {v['chroma']:5.1f}  sep {v['sep']:5.1f}  warm {v['warm']:+.2f}  lit {v['lit']:.3f}")
