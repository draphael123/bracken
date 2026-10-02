// Offline relayout search for tools/map-spacing.mjs offenders. Usage: node work/claude/mapspace/solve.mjs CRAG|COAST|INLAND [seed] [iters]
import fs from 'node:fs'; import vm from 'node:vm';
import { LEVELS } from '../../../src/level.js';
import { layoutPlates, nodeBox, MIN_NODE_GAP, placePanel, plateNodes } from '../../../src/map-plates.js';
const src = fs.readFileSync(new URL('../../../src/main.js', import.meta.url), 'utf8');
const ctx = vm.createContext({ LEVELS });
vm.runInContext(src.slice(src.indexOf('const MAPW ='), src.indexOf('const MAPC =')) + '\nglobalThis.r={NODES,PATH,DESERT_Y,INLAND_Y,COAST_Y,CRAG_Y,WOOD_Y,CRAG_NODES,COAST_NODES,INLAND_NODES,CRAG_PATH,COAST_PATH,INLAND_PATH,WOOD_NODES,WOOD_PATH};', ctx);
const R = ctx.r; const name = process.argv[2]; let seed = +(process.argv[3] || 1); const ITERS = +(process.argv[4] || 80000);
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.7;
const OFF = { CRAG: R.CRAG_Y, COAST: R.COAST_Y, INLAND: R.INLAND_Y, WOOD: R.WOOD_Y }[name];
const LN = R[name + '_NODES'], LP = R[name + '_PATH'];
const items = LP.map(([x, y], i) => { const n = LN.find(n => !n.spur && n.x === x && n.y === y); return { id: n ? n.id : null, x, y, fixed: i === 0 || i === LP.length - 1, wp: !n }; });
const spurs = LN.filter(n => n.spur).map(n => ({ id: n.id, x: n.x, y: n.y, spur: true }));
const sides = {}; for (const n of LN) sides[n.id] = n.plate;
const orig = items.map(i => [i.x, i.y]), origSp = spurs.map(s => [s.x, s.y]);
const MARGIN = 24;
const labelOf = n => n.kind === 'store' ? (n.id === 'highstore' ? 'HIGH STORE' : 'STORE') : LEVELS[n.level].name;
const build = () => R.NODES.map(n => {
  const loc = LN.find(l => l.id === n.id);
  if (!loc) return { id: n.id, x: n.x, y: n.y, kind: n.kind, spur: !!n.spur, plate: n.plate, label: labelOf(n), twoLine: n.kind === 'level' };
  const it = items.find(i => i.id === n.id) || spurs.find(s => s.id === n.id);
  return { id: n.id, x: it.x, y: it.y + OFF, kind: n.kind, spur: !!n.spur, plate: sides[n.id], label: labelOf(n), twoLine: n.kind === 'level' };
});
const orient = (p, q, r) => (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
const cross = (p1, p2, p3, p4) => { const o1 = orient(p1, p2, p3), o2 = orient(p1, p2, p4), o3 = orient(p3, p4, p1), o4 = orient(p3, p4, p2); return o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 && (o1 > 0) !== (o2 > 0) && (o3 > 0) !== (o4 > 0); };
const over = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const FAR = 26; const MAXD = +(process.env.MAXD||40);
const conns = [[[40, 64 + R.WOOD_Y], [40, 200 + R.CRAG_Y]], [[40, 200 + R.CRAG_Y], [40, 152 + R.CRAG_Y]], [[260, 26 + R.CRAG_Y], [260, 172 + R.COAST_Y]], [[140, 8 + R.COAST_Y], [140, 176 + R.INLAND_Y]], [[260, 34 + R.INLAND_Y], [274, 174]]];
function cost(detail) {
  let c = 0; const bad = [];
  const nodes = build(), plates = layoutPlates(nodes, 320);
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i], pa = plates.get(a.id);
    if (!pa.fits) { c += 12; bad.push('nofit ' + a.id); }
    if (pa.y < 6 || pa.y + pa.h > 894) c += 12;
    { const bx = Math.max(pa.x, Math.min(pa.x + pa.w, a.x)), by = Math.max(pa.y, Math.min(pa.y + pa.h, a.y)), far = Math.hypot(bx - a.x, by - a.y); if (far > FAR) { c += 3 + (far - FAR); bad.push('far ' + a.id); } else c += far * 0.02; }
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < MIN_NODE_GAP) { c += 10 + (MIN_NODE_GAP - d) * 2; bad.push('gap ' + a.id + b.id); }
      if (over(nodeBox(a), nodeBox(b))) { c += 10; bad.push('box ' + a.id + b.id); }
    }
  }
  if (process.env.PANEL !== "0") for (const n of nodes) { if (n.y < OFF - 90 || n.y > OFF + 270) continue; const r = placePanel(plateNodes(R.NODES, () => "").length ? n : n, nodes, plates); if (!r.ok) { c += 8 + 2 * r.hits.length; bad.push("panel " + n.id); } }
  const P = items.map(i => [i.x, i.y + OFF]);
  const segs = []; for (let i = 0; i + 1 < P.length; i++) segs.push([P[i], P[i + 1], i]);
  for (let i = 0; i < segs.length; i++) for (let j = i + 2; j < segs.length; j++) if (cross(segs[i][0], segs[i][1], segs[j][0], segs[j][1])) { c += 30; bad.push('xing ' + i + '-' + j); }
  for (const s of spurs) {
    const sp = [s.x, s.y + OFF]; let bi = 0, bd = 1e9; P.forEach((p, i) => { const d = Math.hypot(p[0] - sp[0], p[1] - sp[1]); if (d < bd) { bd = d; bi = i; } });
    const ds = P.map(p => Math.hypot(p[0] - sp[0], p[1] - sp[1])).sort((a, b) => a - b);
    if (!(ds[0] > 4.5 && ds[0] < 24.5)) { c += 10 + Math.abs(ds[0] - 14); bad.push('spurband ' + s.id); }
    if (ds[1] < ds[0] * 1.2) { c += 8; bad.push('spurnext ' + s.id); }
    for (let i = 0; i < segs.length; i++) { if (i === bi || i === bi - 1) continue; if (cross(P[bi], sp, segs[i][0], segs[i][1])) { c += 20; bad.push('spurx ' + s.id); } }
  }
  for (const [a, b] of conns) for (const s of segs) { if ([a, b].some(q => [s[0], s[1]].some(p => p[0] === q[0] && p[1] === q[1]))) continue; if (cross(a, b, s[0], s[1])) { c += 30; bad.push('conn'); } }
  items.forEach((it, i) => { if (i === 0 || i === items.length - 1) return; if (it.x < MARGIN || it.x > 296 || it.y < MARGIN || it.y > 156) c += 6 + Math.max(0, MARGIN - it.x, it.x - 296, MARGIN - it.y, it.y - 156); });
  for (let i = 0; i + 1 < P.length; i++) { const d = Math.hypot(P[i][0] - P[i + 1][0], P[i][1] - P[i + 1][1]); if (d < 22) c += (22 - d) * 0.5; }
  for (let i = 1; i + 1 < P.length; i++) { const a = [P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]], b = [P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]]; const cs = (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b) || 1); if (cs < -0.2) c += 3 + (-0.2 - cs) * 6; }
  items.forEach((it, i) => { {const d=Math.hypot(it.x - orig[i][0], it.y - orig[i][1]); c += 0.03*d + (d>MAXD?(d-MAXD)*2:0);} });
  spurs.forEach((s, i) => { {const d=Math.hypot(s.x - origSp[i][0], s.y - origSp[i][1]); c += 0.03*d + (d>MAXD?(d-MAXD)*2:0);} });
  return detail ? { c, bad } : c;
}
const SPURS_FIX = 0; const free = [...items.filter(i => !i.fixed), ...spurs];
const SIDES = [undefined, 'above', 'below', 'left', 'right'];
let cur = cost(), best = cur, bestSnap = JSON.stringify([items, spurs, sides]);
for (let it = 0; it < ITERS; it++) {
  const T = 6 * (1 - it / ITERS) + 0.02;
  let undo;
  if (rnd() < 0.15) { const ids = Object.keys(sides); const id = ids[(rnd() * ids.length) | 0]; const o = sides[id]; sides[id] = SIDES[(rnd() * 5) | 0]; undo = () => { sides[id] = o; }; }
  else { const v = free[(rnd() * free.length) | 0]; const ox = v.x, oy = v.y; const s = 2 + rnd() * 14; v.x = Math.round(Math.max(8, Math.min(312, v.x + gauss() * s))); v.y = Math.round(Math.max(8, Math.min(172, v.y + gauss() * s))); undo = () => { v.x = ox; v.y = oy; }; }
  const n = cost(); if (n <= cur || rnd() < Math.exp((cur - n) / T)) { cur = n; if (n < best) { best = n; bestSnap = JSON.stringify([items, spurs, sides]); } } else undo();
}
const [bi, bs, bsd] = JSON.parse(bestSnap); bi.forEach((v, i) => Object.assign(items[i], v)); bs.forEach((v, i) => Object.assign(spurs[i], v)); Object.assign(sides, bsd);
const det = cost(true);
console.log(name, 'best cost', det.c.toFixed(2), 'offences:', det.bad.join(' ') || 'none');
console.log('PATH', JSON.stringify(items.map(i => [i.x, i.y])));
for (const n of LN) { const it = items.find(i => i.id === n.id) || spurs.find(s => s.id === n.id); console.log(n.id, it.x, it.y, 'plate=' + sides[n.id], '(was ' + n.x + ',' + n.y + ')'); }
