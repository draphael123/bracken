// tools/railsparallax.mjs - THE DEEP RAILS' backdrop in motion (claude/railsparallax). Not in the suite.
//   usage: PORT=8959 node tools/railsparallax.mjs [tag]   (a tag writes the strip PNGs; none = just the check)
// Draws drawBackdrop straight onto a 320x180 canvas (time fixed) at cx, cx+1, ... and measures the frame-to-frame change.
// A scroll of one pixel changes a thin band; a layer that POPS (a pillar, a string, a scaffold appearing or vanishing)
// is a spike. Writes work/claude/railsparallax/<tag>/*.png (before/after strips) and prints the spikes.
// Exits 1 when any 1 px step changes more than 1.6x the median (the frames used to spike 3x at every zone edge: the camera's zone flipped whole pillars on or off).
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || '', check = true;
const out = join(ROOT, 'work/claude/railsparallax', tag || 'run'); if (tag) mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
let bad = 0;
try {
  const r = await pg.evalp(`(async()=>{ const M = await import('/src/redraw/minecart_backdrop.js'); const TS = 16, VW = 320, VH = 180, EDGES = [171, 310, 472, 625, 786, 900];
    const c = document.createElement('canvas'); c.width = VW; c.height = VH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    const px = (cx, cy) => { g.clearRect(0, 0, VW, VH); M.drawBackdrop(g, cx, cy, VW, VH, {}, 1.0); return g.getImageData(0, 0, VW, VH).data; };
    const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 45) n++; return n; };
    const res = { scans: [], png: [] };
    /* scan: cx steps of 1 along a stretch (cy fixed) or a climb (cx fixed, cy steps) */
    const scan = (name, cx0, cy0, dx, dy, n) => { let prev = px(cx0, cy0); const d = []; for (let i = 1; i <= n; i++) { const cur = px(cx0 + dx * i, cy0 + dy * i); d.push(diff(prev, cur)); prev = cur; } const s = d.slice().sort((a, b) => a - b); res.scans.push({ name, med: s[s.length >> 1], max: Math.max(...d), at: d.indexOf(Math.max(...d)), d }); };
    for (const e of EDGES) scan('edge' + e, e * TS - VW / 2 - 60, 300, 1, 0, 120);
    scan('climb', 4000, 100, 0, 1, 200);
    scan('climb-mid', 6000, 250, 0, 1, 200);
    /* a strip across each edge: 4 frames, 20 px apart in cx, on one canvas */
    const strip = (name, cx0, cy0, step) => { const s = document.createElement('canvas'); s.width = VW * 2; s.height = VH * 2; const h = s.getContext('2d'); for (let i = 0; i < 4; i++) { px(cx0 + i * step, cy0); h.drawImage(c, (i % 2) * VW, (i >> 1) * VH); } res.png.push([name, s.toDataURL('image/png')]); };
    for (const e of [171, 310, 625]) { const cx = e * TS - VW / 2; strip('edge' + e, cx - 30, 300, 20); }
    return res; })()`, 600000);
  if (tag) for (const [n, d] of r.png) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  for (const s of r.scans) { const spike = s.max > Math.max(400, s.med * 1.6); if (spike) bad++; console.log((spike ? 'SPIKE ' : 'ok    ') + s.name + ': median ' + s.med + ' px changed/step, max ' + s.max + ' at step ' + s.at); }
  if (tag) writeFileSync(join(out, 'scans.json'), JSON.stringify(r.scans.map(s => ({ name: s.name, med: s.med, max: s.max, at: s.at, d: s.d }))));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
if (check && bad) { console.log(bad + ' scan(s) pop'); process.exit(1); }
