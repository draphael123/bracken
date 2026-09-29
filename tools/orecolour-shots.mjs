// tools/orecolour-shots.mjs — THE ORE ROAD colour pass: one 640x360 capture per section in ONE page session, saved to
// work/orecolour/<tag>/<nn>-<place>.png, each measured with the visual audit's own method (tools/art-rules.py: Lab, rows 40-330 of 360,
// chroma = median of hypot(a,b), spread = L p90-p10, sep = |median L of the top 45% - the bottom 38%|, warm = share(b>12) - share(b<-8),
// lit = share(L>70 && b>20)). Not in the suite: pictures and numbers for eyes. usage: node tools/orecolour-shots.mjs <tag> [place ...]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot', want = process.argv.slice(3);
const out = join(ROOT, 'work/orecolour', tag); mkdirSync(out, { recursive: true });
/* [name, the hero's column, the row he stands on] - one per section of the route, and the boss shaft */
const SPOTS = [['yard', 6, 36], ['crusher', 26, 34], ['loading-house', 47, 36], ['first-span', 100, 36], ['sorting-yard', 137, 36],
  ['sorting-floor', 150, 28], ['tower-top', 186, 21], ['tipple-house', 229, 27], ['collapsed-span', 286, 32], ['wreck-head', 326, 30],
  ['brakemans-hut', 350, 20], ['winch-house', 412, 12], ['drum-yard', 446, 12], ['drum-house', 478, 12], ['boss-shaft', 500, 12]];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'oreroad'), want = ${JSON.stringify(want)}, res = [];
    const lab = (r, g, b) => { let c = [r, g, b].map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      const X = c[0] * .4124 + c[1] * .3576 + c[2] * .1805, Y = c[0] * .2126 + c[1] * .7152 + c[2] * .0722, Z = c[0] * .0193 + c[1] * .1192 + c[2] * .9505;
      const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116, fx = f(X / .9505), fy = f(Y), fz = f(Z / 1.089); return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]; };
    const med = a => { const s = Float64Array.from(a).sort(); return s[s.length >> 1]; }, pct = (a, p) => { const s = Float64Array.from(a).sort(); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
    for (const [name, x, y] of ${JSON.stringify(SPOTS)}) { if (want.length && !want.includes(name)) continue;
      BK.setHero('knight'); BK.load(i); BK.start(); BK.god = true; BK.sim(240);
      BK.tp(x, y); for (let k = 0; k < 90; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      const d = g.getImageData(0, 40, 640, 290).data, n = d.length / 4, Ls = new Float64Array(n), Cs = new Float64Array(n), Bs = new Float64Array(n);
      for (let p = 0; p < n; p++) { const [L, A, B] = lab(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]); Ls[p] = L; Cs[p] = Math.hypot(A, B); Bs[p] = B; }
      const H = 290, top = Ls.subarray(0, Math.floor(H * .45) * 640), bot = Ls.subarray(Math.floor(H * .62) * 640);
      let w = 0, cl = 0, lit = 0; for (let p = 0; p < n; p++) { if (Bs[p] > 12) w++; if (Bs[p] < -8) cl++; if (Ls[p] > 70 && Bs[p] > 20) lit++; }
      res.push([name, c.toDataURL('image/png'), { spread: pct(Ls, .9) - pct(Ls, .1), chroma: med(Cs), sep: Math.abs(med(top) - med(bot)), warm: (w - cl) / n, lit: lit / n }]); }
    return res;
  })()`, 900000);
  const tot = { spread: 0, chroma: 0, sep: 0, warm: 0, lit: 0 };
  for (const [name, d, m] of r) { const n = SPOTS.findIndex(s => s[0] === name); writeFileSync(join(out, String(n).padStart(2, '0') + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64'));
    for (const k in tot) tot[k] += m[k] / r.length;
    console.log(name.padEnd(15), `spread ${m.spread.toFixed(1)}  chroma ${m.chroma.toFixed(1)}  sep ${m.sep.toFixed(1)}  warm ${m.warm.toFixed(2)}  lit ${m.lit.toFixed(3)}`); }
  console.log('MEAN'.padEnd(15), `spread ${tot.spread.toFixed(1)}  chroma ${tot.chroma.toFixed(1)}  sep ${tot.sep.toFixed(1)}  warm ${tot.warm.toFixed(2)}  lit ${tot.lit.toFixed(3)}`);
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
