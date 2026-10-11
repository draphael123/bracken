/* tools/knock-into-exams.mjs - WHERE A THROW EASES OR TRIVIALISES AN EXAM (claude/knockinto, scratch/brief-combat2.md section 1: 'Levels whose
   exams become trivial -> list them (no mass edits)'). REPORT ONLY: it fails nothing and edits nothing. Read off each built level (no browser):
     ELITE EXAMS  every elite ent (a section's exam, the v2 recipe: one weighty elite on footing with a hazard behind) with a KILLING hazard
                  (the spikes, a death drop, deep water) within his throw reach along his floor. Before this lane a heavy cut that threw him
                  there killed him outright; now an elite is never killed by a throw (src/knock-into.js: a quarter of his bar and he is put
                  back) - listed as EASED (each throw = 25%).
     SPIKE EXAMS  every L.examSpans span (the real-death spike yards) and the common foes standing in or beside it within a small foe's throw
                  of a killing hazard: one heavy cut each clears them - listed as TRIVIAL when every foe of the span can be thrown in.
   Reach (tiles, a heavy cut on the flat, tools/knock-into.mjs measured): small ~7, mid ~4, brute ~1.5, an elite x0.6 on top.
   node tools/knock-into-exams.mjs [--json] */
import { LEVELS, T } from '../src/level.js';
import { THREAT } from '../src/threat.js';
import { BRUTES, MIDS } from '../src/knock-into.js';
import { install } from './node-canvas.mjs';
install();
const TS = 16, REACH = { small: 7, mid: 4, brute: 1.5 }, ELITE = 0.6;
const reachOf = e => (BRUTES.has(e.t) || e.big ? REACH.brute : MIDS.has(e.t) ? REACH.mid : REACH.small) * (e.elite ? ELITE : 1);
const SKIP = new Set(['dummy', 'wasp', 'spit', 'urchin', 'jelly', 'wisp', 'marshlight', 'bat', 'crow', 'kite', 'harpy', 'eel', 'angler', 'siren', 'lamprey', 'manta', 'petrel', 'gull', 'turtle', 'crab']);   /* not thrown (KNOCK_SKIP / flyers / swimmers) or at home in water */
const out = [];
for (const lv of LEVELS) {
  let R; try { R = lv.build(); } catch (err) { continue; }
  if (!R || !R.grid || !R.ents) continue;
  const W = R.W, H = R.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : R.grid[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || t === T.ICE || t === T.WEB;
  const foot = t => solid(t) || t === T.ONEWAY || t === T.PLANK || t === T.REED || t === T.NET || t === T.SHELF || t === T.RAIL || t === T.CRYST || t === T.BOUNCER;
  const deep = (x, y) => (R.pools || []).some(p => !p.shallow && !p.swim && !p.dry && x * TS + 8 > p.x0 && x * TS + 8 < p.x1 && (y + 1) * TS > p.y);
  /* the killing hazard nearest along a foe's floor (row y = the row it stands in), either way, up to `r` tiles; a wall stops the look */
  const hazardNear = (x, y, r) => { let best = null;
    for (const d of [-1, 1]) for (let k = 1; k <= Math.ceil(r); k++) { const cx = x + d * k; if (solid(at(cx, y)) || solid(at(cx, y - 1))) break;
      let why = null; if (at(cx, y) === T.SPIKE || at(cx, y + 1) === T.SPIKE) why = 'spikes'; else if (deep(cx, y)) why = 'water';
      else if (!foot(at(cx, y + 1))) { let ty = y + 1; while (ty < H && !foot(at(cx, ty)) && at(cx, ty) !== T.SPIKE && !deep(cx, ty)) ty++; why = ty >= H ? 'drop' : at(cx, ty) === T.SPIKE ? 'spikes' : deep(cx, ty) ? 'water' : null; if (!why) break; }
      if (why) { if (!best || k < best.k) best = { k, why, d }; break; } }
    return best; };
  const foes = R.ents.filter(e => THREAT[e.t] > 0 && !SKIP.has(e.t) && !e.boss && !e.mini && THREAT[e.t] < 6);
  const elites = [], spans = [];
  for (const e of foes.filter(q => q.elite)) { const h = hazardNear(e.x, e.y, reachOf(e)); if (h) elites.push({ t: e.t, x: e.x, y: e.y, hazard: h.why, tiles: h.k }); }
  for (const s of (R.examSpans || [])) { const inS = foes.filter(e => !e.elite && e.x >= s[0] - 4 && e.x <= s[1] + 4);
    const thrown = inS.filter(e => hazardNear(e.x, e.y, reachOf(e)));
    spans.push({ span: s, foes: inS.length, throwable: thrown.length, trivial: inS.length > 0 && thrown.length === inS.length }); }
  if (elites.length || spans.some(s => s.throwable)) out.push({ id: lv.id, elites, spans });
}
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else {
  console.log('KNOCK-INTO vs THE EXAMS (report only)');
  for (const r of out) { const el = r.elites.map(e => `${e.t}@${e.x},${e.y} ${e.hazard} ${e.tiles}t`).join('; '), sp = r.spans.filter(s => s.throwable).map(s => `[${s.span}] ${s.throwable}/${s.foes}${s.trivial ? ' TRIVIAL' : ''}`).join('; ');
    console.log(r.id.padEnd(14) + (el ? ' ELITE EASED: ' + el : '') + (sp ? ' | SPIKE EXAM: ' + sp : '')); }
  console.log(out.length + ' levels; elites eased ' + out.reduce((a, r) => a + r.elites.length, 0) + '; exam spans trivial ' + out.reduce((a, r) => a + r.spans.filter(s => s.trivial).length, 0));
}
