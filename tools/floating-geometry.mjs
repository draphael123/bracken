/* tools/floating-geometry.mjs - TILES ATTACHED TO NOTHING (claude/theatre3; Daniel played the live theatre on 2026-10-01: "floating geometry").
   tools/floaters.mjs finds a PROP in the air. This finds GEOMETRY in the air: a run of tiles (rock, boards, a ledge, spikes) that touches nothing -
   no wall, no floor, no ceiling, no rope it hangs from - and is not a mover. It reads like a shelf painted on the sky.
   THE RULE. Every tile that is not air is joined to its four neighbours that are not air (a rope - T.NET - joins too: boards hung on a rope are
   hung). The level's own mass is every group that reaches the edge of the map (the shell of rock round a cave level, the ground of an open one).
   A group that does not reach it FLOATS - unless it is one of the level's MACHINES drawn into the grid where the tools walk it (a theatre flat on its
   track: L.theatre.flats), which the game moves.
   ENFORCED for the levels in FIXED (their hits were fixed by the lane that added them); every other campaign level is REPORTED, not failed (a lane for
   each: docs report the list).
     node tools/floating-geometry.mjs            the gate (FIXED levels) and the report for the rest
     node tools/floating-geometry.mjs <id> ...    just those levels, every hit listed */
import { LEVELS, T } from '../src/level.js';

export const FIXED = ['theatre'];   /* claude/theatre3: the Maskwright's Theatre, fixed and gated */
const args = process.argv.slice(2), only = args.filter(a => !a.startsWith('-'));
const built = new Map(); const build = d => { if (!built.has(d.id)) { try { built.set(d.id, d.build()); } catch (e) { built.set(d.id, null); } } return built.get(d.id); };

/* the groups of a level that float: [{ n, x0, x1, y0, y1, kinds }] */
export function floating(L) {
  const W = L.W, H = L.H, g = L.grid, seen = new Uint8Array(W * H), out = [];
  const machine = new Set();   /* the theatre's flats, drawn where the tools walk them: they run on their tracks */
  for (const f of (L.theatre && L.theatre.flats) || []) { const pos = f.tools === 'A' ? f.a : f.b;
    if (f.axis === 'y') { for (let y = pos; y < pos + f.h; y++) for (let x = f.x0; x <= f.x1; x++) machine.add(y * W + x); }
    else for (let y = f.y0; y <= f.y1; y++) for (let x = pos; x < pos + f.w; x++) machine.add(y * W + x); }
  for (let i = 0; i < W * H; i++) {
    if (seen[i] || g[i] === T.AIR || machine.has(i)) continue;
    const q = [i]; seen[i] = 1; let edge = false, n = 0, x0 = W, x1 = -1, y0 = H, y1 = -1; const kinds = new Set();
    while (q.length) { const j = q.pop(), x = j % W, y = (j / W) | 0; n++; kinds.add(g[j]);
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) edge = true;
      for (const k of [j - 1, j + 1, j - W, j + W]) { if (k < 0 || k >= W * H) continue; if ((k === j - 1 && x === 0) || (k === j + 1 && x === W - 1)) continue;
        if (!seen[k] && g[k] !== T.AIR && !machine.has(k)) { seen[k] = 1; q.push(k); } } }
    if (!edge) out.push({ n, x0, x1, y0, y1, kinds: [...kinds].map(k => Object.keys(T).find(K => T[K] === k) || k) });
  }
  return out;
}

const campaign = LEVELS.filter(d => !(d.hidden && !d.secret) && !/^(shop|trial_|custom)/.test(d.id));
const pick = only.length ? campaign.filter(d => only.includes(d.id)) : campaign;
let fails = 0; const report = [];
for (const d of pick) { const L = build(d); if (!L || !L.grid) continue; const hits = floating(L);
  if (!hits.length) continue;
  const line = d.id + ': ' + hits.length + ' floating group(s): ' + hits.map(h => h.kinds.join('+') + ' x' + h.n + ' @' + h.x0 + (h.x1 > h.x0 ? '-' + h.x1 : '') + ',' + h.y0 + (h.y1 > h.y0 ? '-' + h.y1 : '')).join('; ');
  if (FIXED.includes(d.id)) { fails++; console.log('FAIL ' + line); } else report.push(line); }
if (report.length) console.log('REPORT (not gated; for the levels\' own lanes):\n  ' + report.join('\n  '));
if (fails) { console.log('floating-geometry: ' + fails + ' gated level(s) have geometry attached to nothing'); process.exit(1); }
console.log('ok  floating-geometry  ' + FIXED.join(', ') + ': nothing hangs from nothing (' + report.length + ' other level(s) reported)');
