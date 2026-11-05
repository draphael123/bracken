/* tools/float-triage.mjs - REAL FLOATERS vs INTENDED ONES (claude/floattriage, 11-05; level-review item 10).
   tools/floating-geometry.mjs lists every group of tiles that touches nothing: ~200 mass groups and ~1000 one-way/plank ledges over the campaign. Most
   are intended (a ledge in the air is normal platforming; a mover's track; a rope-hung deck). This sorts them:
     LEDGE    only boards (ONEWAY / PLANK / REED / SHELF / RAIL / BOUNCER / CRYST / NET): intended (a wide deck is flagged: demo-floats.mjs judges posts)
     MACHINE  a mover / lift / swing / falling thing within 4 tiles of the group
     HUNG     held by a drawn rope / chain / hanger / bridge / hoist / declared structure or a drawn post (hungAt + L.routeSupports in src/demo-supports.js)
     ALLOWED  listed in tools/float-allow.json with a reason (floating on purpose; an entry that matches nothing fails, so it cannot outlive what it excuses)
     INTERIOR a declared L.interiors box covers most of the group: a building / ship / hold whose frame is PAINTED, so the data cannot say whether it is
              held up (needs eyes)
     REAL     everything else: tiles (rock, planks, spikes, palisade) with nothing holding them up, ranked by size x how much air is under them
   NEAR marks a REAL group with a 1-2 tile gap to other rock (a data fix: fill the gap).
     node tools/float-triage.mjs              the ranked REAL list (gate: a REAL group in a GATE level, or a stale ALLOWED entry, fails)
     node tools/float-triage.mjs <id> ...     only those levels, every class listed
     node tools/float-triage.mjs --json       machine-readable */
import { readFileSync } from 'node:fs';
import { T } from '../src/level.js';
import { campaign, build, floating } from './floating-geometry.mjs';
import { hungAt } from '../src/demo-supports.js';

/* levels whose REAL list must stay empty (gate). Add a level here when its list reaches 0. */
export const GATE = ['theatre'];
const LEDGE_KINDS = new Set(['ONEWAY', 'PLANK', 'REED', 'SHELF', 'RAIL', 'BOUNCER', 'CRYST', 'NET']);
const BOARD_T = new Set([T.AIR, T.NET, T.ONEWAY, T.PLANK, T.REED, T.SHELF]);
const ALLOW = JSON.parse(readFileSync(new URL('./float-allow.json', import.meta.url), 'utf8')).allow;
const ANCHOR_T = new Set(['chainpost', 'swingcap', 'ksropebridge', 'wcrope', 'overhang']);   /* a thing the group hangs from */
const MOVER_T = new Set(['mover', 'plate', 'gplate', 'tplate']);
const REACH = 4, MOVER_MAX = 60;   /* REACH as tools/demo-floats.mjs: a post / hanger within 4 columns holds a run up */

const args = process.argv.slice(2), only = args.filter(a => !a.startsWith('-')), asJson = args.includes('--json');

function airUnder(L, h) {   /* columns of the group with >= 3 rows of air under their lowest tile */
  const W = L.W, H = L.H, g = L.grid; let open = 0, cols = 0;
  for (let x = h.x0; x <= h.x1; x++) { let yb = -1; for (let y = h.y1; y >= h.y0; y--) if (g[y * W + x] !== T.AIR) { yb = y; break; } if (yb < 0) continue; cols++;
    let a = 0; while (yb + 1 + a < H && g[(yb + 1 + a) * W + x] === T.AIR) a++; if (a >= 3) open++; }
  return { cols, open };
}
function nearGap(L, h) {   /* a tile of rock of ANOTHER group within 2 tiles (Chebyshev) of this group's tile: { d: empty tiles between, at } */
  const W = L.W, H = L.H, g = L.grid; let best = { d: 99 };
  const inBox = (x, y) => x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1;
  for (let y = h.y0; y <= h.y1; y++) for (let x = h.x0; x <= h.x1; x++) { if (g[y * W + x] === T.AIR) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const r = Math.max(Math.abs(dx), Math.abs(dy)); if (r < 2) continue; const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H || inBox(xx, yy)) continue; if (BOARD_T.has(g[yy * W + xx])) continue;
      if (r - 1 < best.d) best = { d: r - 1, at: [x + Math.sign(dx), y + Math.sign(dy)] }; } }
  return best;
}
function machineNear(L, h) {   /* { strong } an anchor ent touching the group, or { mover } a mover / lift / swing beside it (which does not hold it up: needs eyes) */
  const near = (x, y, pad) => x >= h.x0 - pad && x <= h.x1 + pad && y >= h.y0 - pad && y <= h.y1 + pad;
  for (const e of L.ents || []) if (ANCHOR_T.has(e.t) && near(e.x, e.y, 2)) return { strong: e.t };
  for (const e of L.ents || []) if (MOVER_T.has(e.t) && near(e.x, e.y, 3)) return { mover: e.t };
  for (const m of L.moversExtra || []) { const x = m.x / 16, y0 = Math.min(m.y, m.y0 ?? m.y) / 16, y1 = Math.max(m.y, m.y1 ?? m.y) / 16;
    if (x >= h.x0 - 3 && x <= h.x1 + 3 && y1 >= h.y0 - 3 && y0 <= h.y1 + 3) return { mover: 'moversExtra:' + m.kind }; }
  return null;
}
function heldBy(L, h) {   /* every column of the group within REACH of a drawn post / hanger / rope / bridge / structure (the demo-floats rule): { ok, anchors, worst } */
  const cols = []; for (let x = h.x0; x <= h.x1; x++) cols.push(x);
  const posts = new Set(); for (const p of L.routeSupports || []) if (!p.free && p.y >= h.y0 - 1 && p.y <= h.y1 + 1) posts.add(p.x);
  const anchors = cols.filter(x => posts.has(x) || hungAt(L, x, h.y1));
  let worst = 0; for (const x of cols) { const d = anchors.length ? Math.min(...anchors.map(a => Math.abs(a - x))) : 99; if (d > worst) worst = d; }
  return { ok: worst <= REACH, anchors: anchors.length, worst };
}
function interiorOf(L, h) {
  const area = (h.x1 - h.x0 + 1) * (h.y1 - h.y0 + 1);
  for (const [x0, x1, y0, y1, kind] of L.interiors || []) { const w = Math.min(h.x1, x1 + 1) - Math.max(h.x0, x0 - 1) + 1, v = Math.min(h.y1, y1 + 3) - Math.max(h.y0, y0 - 3) + 1;   /* a hold's floor is the row under its box */
    if (w > 0 && v > 0 && w * v >= 0.6 * area) return kind; }
  return null;
}
const allowFor = (id, h) => ALLOW.find(a => a.level === id && h.x0 >= a.x0 && h.x1 <= a.x1 && h.y0 >= a.y0 && h.y1 <= a.y1);

export function triage(id, L) {
  const out = [], used = new Set();
  for (const h of floating(L)) {
    const mass = h.kinds.some(k => !LEDGE_KINDS.has(k)), w = h.x1 - h.x0 + 1;
    const r = { level: id, ...h, w };
    const BODY = h.n >= 1000;   /* the level own bulk (a ship hull, a sea of rock) joined to nothing but the sea: not a ledge in the air */
    const al = allowFor(id, h); if (al) { used.add(al); r.cls = 'ALLOWED'; r.why = al.why; out.push(r); continue; }
    if (!mass) { r.cls = 'LEDGE'; out.push(r); continue; }
    if (BODY) { r.cls = 'INTERIOR'; r.why = 'BODY: ' + h.n + ' tiles, the level own mass (needs eyes)'; out.push(r); continue; }
    const m = machineNear(L, h);
    if (m && m.strong) { r.cls = 'MACHINE'; r.why = m.strong; out.push(r); continue; }
    const hb = heldBy(L, h); if (hb.ok) { r.cls = 'HUNG'; r.why = 'every column within ' + REACH + ' of a post / hanger (' + hb.anchors + ' anchored cols)'; out.push(r); continue; }
    if (m && m.mover && h.n <= MOVER_MAX) { r.cls = 'MOVER-NEAR'; r.why = m.mover + ' beside it (does not hold it up: needs eyes)'; out.push(r); continue; }
    const it = interiorOf(L, h); if (it) { r.cls = 'INTERIOR'; r.why = it; out.push(r); continue; }
    const au = airUnder(L, h), ng = nearGap(L, h);
    r.cls = 'REAL'; r.near = ng.d <= 2 ? ng : null;
    r.score = Math.round(h.n * (0.25 + au.open / Math.max(1, au.cols)));
    if (hb.anchors) r.score = Math.round(r.score * 0.6);
    r.why = (hb.anchors ? 'SPARSE posts (' + hb.anchors + ' anchored cols, worst gap ' + hb.worst + '); ' : 'no post / hanger; ') + au.open + '/' + au.cols + ' columns have 3+ rows of air under them' + (r.near ? '; NEAR: ' + r.near.d + '-tile gap to other rock at ' + r.near.at : '');
    out.push(r);
  }
  for (const a of ALLOW) if (a.level === id && !used.has(a)) out.push({ level: id, cls: 'STALE', kinds: [], n: 0, x0: 0, x1: 0, y0: 0, y1: 0, why: 'allow entry matches nothing: ' + JSON.stringify(a) });
  return out;
}

const all = []; const pick = only.length ? campaign.filter(d => only.includes(d.id)) : campaign;
for (const d of pick) { const L = build(d); if (!L || !L.grid) continue; all.push(...triage(d.id, L)); }
const by = c => all.filter(r => r.cls === c);
const fmt = r => r.level + ' ' + r.kinds.join('+') + ' x' + r.n + ' @' + r.x0 + '-' + r.x1 + ',' + r.y0 + '-' + r.y1 + (r.score !== undefined ? ' score ' + r.score : '') + ' - ' + (r.why || '');
if (asJson) { console.log(JSON.stringify(all)); process.exit(0); }
if (only.length) { for (const c of ['REAL', 'INTERIOR', 'MOVER-NEAR', 'HUNG', 'MACHINE', 'ALLOWED', 'STALE']) for (const r of by(c)) console.log(c.padEnd(9) + fmt(r)); }
else { console.log('REAL floaters, ranked:'); for (const r of by('REAL').sort((a, b) => b.score - a.score)) console.log('  ' + fmt(r)); }
const bad = all.filter(r => (r.cls === 'REAL' && GATE.includes(r.level)) || r.cls === 'STALE');
for (const r of bad) console.log('FAIL ' + fmt(r));
console.log(['LEDGE', 'MACHINE', 'HUNG', 'ALLOWED', 'INTERIOR', 'MOVER-NEAR', 'REAL', 'STALE'].map(c => c + ' ' + by(c).length).join('  '));
if (bad.length) process.exit(1);
console.log('ok  float-triage  ' + by('REAL').length + ' real, ' + (by('INTERIOR').length + by('MOVER-NEAR').length) + ' needs-eyes over ' + pick.length + ' level(s)');
