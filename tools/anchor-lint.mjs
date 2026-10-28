/* tools/anchor-lint.mjs - NOTHING FLOATS: every ledge, pillar, prop and perch hangs on something (claude/rookery2, Daniel 10-27 live on THE ROOKERY: "stone ledges and
   pillars that end in mid-air, a lantern gibbet on nothing, flat untextured path tops"; brief scratch/brief-rookery2-1027.md A3). NODE ONLY (no page): the built level's grid,
   its drawn supports (L.routeSupports, src/forest-supports.js) and its anchors (L.rkAnchors, src/rookery-anchors.js).
   tools/solid-islands.mjs asks whether an island has ANY drawn support; this asks the stricter question the photos raised:
     island     an island with no drawn support at all (solid-islands' own test: src/island-posts.js islandsOf + solid-islands supportsOf)
     overhang   an island held by posts whose underside runs more than OVER tiles past the nearest post's edge (a slab ending in mid-air past its pillar)
     cantilever a thin run of ledge (rock or boards, under THIN rows thick) over air, joined to rock at ONE end only, longer than LIP tiles, with no post under it
                (thick crag over a cave mouth is natural rock and passes)
     prop       a standing prop (sign, shrine, torch, lantern, decoration, an egg nest) with air under it
     roost / perch / arm   (THE ROOKERY) a harpy's roost, a gale harpy's perch or a hung nest's arm with no anchor that holds (src/rookery-anchors.js anchorAt:
                stand / bracket / spire / chain) - ONEWAY nests are allowed only lashed: a nest's arm counts here
   GATE = the levels it fails (the rookery); every other campaign level is LISTED (a report: the brief says list them, do not fix them).
     node tools/anchor-lint.mjs            the gate + the table of every level it flags
     node tools/anchor-lint.mjs <id> ..    just those levels, every fault listed */
import { pathToFileURL } from 'node:url';
import { LEVELS, T } from '../src/level.js';
import { islandsOf } from '../src/island-posts.js';
import { supportsOf } from './solid-islands.mjs';
import { anchorAt, anchorNeeds } from '../src/rookery-anchors.js';
export const GATE = ['rookery'];
export const OVER = 1.25, LIP = 2, THIN = 2;
const STAND_PROPS = new Set(['sign', 'check', 'torch', 'lantern', 'gibbet', 'deco']);
export function anchorFaults(L) {
  const W = L.W, H = L.H, g = L.grid, out = [], at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x], air = t => t === T.AIR || t === T.NET;
  const posts = (L.routeSupports || []).filter(p => !p.free && p.bottom > p.y + 1), postReach = p => (p.w ? p.w / 32 : 0.5) + OVER;
  const isl = islandsOf(L, T), inIsland = new Set(); for (const s of isl) for (const j of s.cells) inIsland.add(j);
  for (const s of isl) { const why = supportsOf(L, s); if (!why.length) { out.push({ kind: 'island', x: s.x0, x1: s.x1, y: s.y0, why: 'no drawn support' }); continue; }
    if (why[0] !== 'post') continue;
    const cells = new Set(s.cells), cols = [...new Set(s.cells.filter(j => !cells.has(j + W)).map(j => j % W))];
    const mine = posts.filter(p => p.x >= s.x0 - 1 && p.x <= s.x1 + 1 && p.y >= s.y0 - 1 && p.y <= s.y1 + 1);
    const loose = cols.filter(x => !mine.some(p => Math.abs(x - p.x) <= postReach(p)));
    if (loose.length) out.push({ kind: 'overhang', x: Math.min(...loose), x1: Math.max(...loose), y: s.y1, why: loose.length + ' column(s) past its posts' }); }
  /* cantilevers: a run of cells over air (not an island's), joined to rock at one end only */
  for (let y = 0; y < H - 1; y++) { let x = 0;
    while (x < W) { if (air(at(x, y)) || !air(at(x, y + 1)) || inIsland.has(y * W + x)) { x++; continue; }
      const x0 = x; while (x < W && !air(at(x, y)) && air(at(x, y + 1)) && !inIsland.has(y * W + x)) x++; const x1 = x - 1, n = x1 - x0 + 1;
      const lA = !air(at(x0 - 1, y)), rA = !air(at(x1 + 1, y)); if (lA === rA || n <= LIP) continue;
      const tip = lA ? x1 : x0; let th = 0; for (let yy = y; yy >= 0 && !air(at(tip, yy)); yy--) th++;
      if (th > THIN) continue;
      const held = posts.some(p => p.x >= x0 - 1 && p.x <= x1 + 1 && Math.abs(p.y - y) <= 1 && Math.abs(tip - p.x) <= postReach(p) + LIP);
      if (!held) out.push({ kind: 'cantilever', x: x0, x1, y, why: n + ' tiles over air from one end, ' + th + ' thick' }); } }
  for (const e of L.ents || []) if (STAND_PROPS.has(e.t) && air(at(e.x, e.y + 1)) && !(e.t === 'deco' && (e.hang || e.kind === 'hallWindow'))) out.push({ kind: 'prop', x: e.x, x1: e.x, y: e.y, why: e.t + (e.kind ? ':' + e.kind : '') + ' stands on air' });
  for (const [x, y] of L.rkNests || []) if (air(at(x, y + 1))) out.push({ kind: 'prop', x, x1: x, y, why: 'an egg nest on air' });
  if (L.rookery) for (const n of anchorNeeds(L)) if (!anchorAt(L, T, n.x, n.y)) out.push({ kind: n.what, x: n.x, x1: n.x, y: n.y, why: n.id + ': nothing holds it (no footing under, no face beside, no rock over)' });
  return out;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const only = process.argv.slice(2).filter(a => !a.startsWith('-'));
  const pick = only.length ? LEVELS.filter(d => only.includes(d.id)) : LEVELS.filter(d => !(d.hidden && !d.secret) && !/^(shop|trial_|custom)/.test(d.id));
  let fails = 0; const rows = [];
  for (const d of pick) { let L; try { L = d.build(); } catch { continue; } if (!L || !L.grid) continue;
    const f = anchorFaults(L); if (!f.length && !only.length) continue; const by = {}; for (const q of f) by[q.kind] = (by[q.kind] || 0) + 1;
    rows.push({ id: d.id, n: f.length, by, f, gate: GATE.includes(d.id) }); if (GATE.includes(d.id) && f.length) fails += f.length; }
  console.log('level            faults  ' + 'kinds'); for (const r of rows) { console.log((r.gate ? '* ' : '  ') + r.id.padEnd(16), String(r.n).padStart(5), '  ' + Object.entries(r.by).map(([k, v]) => k + ' ' + v).join(', '));
    if (only.length || r.gate) for (const q of r.f) console.log('      ' + q.kind.padEnd(10) + ' @' + q.x + (q.x1 > q.x ? '-' + q.x1 : '') + ',' + q.y + '  ' + q.why); }
  console.log('(* = gated: ' + GATE.join(', ') + '; the rest are LISTED, not failed - the brief: list them, do not fix them)');
  if (fails) { console.log('anchor-lint: ' + fails + ' fault(s) on a gated level'); process.exit(1); }
  console.log('ok  anchor-lint  every ledge, prop and perch of ' + GATE.join(', ') + ' hangs on something');
}
