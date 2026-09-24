/* tools/audit-levels.mjs — THE RANKING'S LEVEL NUMBERS (docs/audit/ranking-2026-09-24.md). Node only. NOT in the suite.
   Every campaign level on the needs chain plus the spurs (Underleaf and the Undercrown are `hidden` in LEVELS but are
   spur nodes on the map, so they are measured here even though tools/curve.mjs leaves them out). STORMWRECK HARBOR is
   listed and marked shelved; it is not ranked.
   Per level:
     INDEX            src/threat.js indexOf, the same inputs tools/curve.mjs feeds it (so the two agree on every level
                      curve.mjs prints - check that before trusting either)
     step             INDEX minus the INDEX of the level it NEEDS (the gate chain, src/campaign-order.js), never the array
     wall / dip       step > RAMP_WALL, step < RAMP_DROP (an arc opening is allowed to dip, as curve.mjs says)
     new kinds        F10: creature kinds (THREAT > 0, the boss and mini excluded) that no ANCESTOR on the gate chain has.
                      Ancestors only - a sibling spur is not "earlier". One-new-foe.mjs is the suite's version of this.
     sections         F1: named sections the level DECLARES in its data (places / *Sections). Undeclared = not measured.
     ambush           Q: R.ambushes
     set pieces       F5 evidence: tools/pacing.mjs's set-piece kinds and systems (work/audit/pacing.json, run
                      `node tools/pacing.mjs --json=work/audit/pacing.json` first)
     dead stretches   pacing.mjs's longest run of "-"/"." (light or empty) route, and its count of 40+ tile empties
   node tools/audit-levels.mjs [--json]   (--json writes work/audit/levels.json) */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { LEVELS, T, TS } from '../src/level.js';
import { gateOf } from '../src/campaign-order.js';
import { THREAT, spanOf, indexOf, worstGap, RAMP_DROP, RAMP_WALL } from '../src/threat.js';

const SPURS = new Set(['burning', 'underleaf', 'undercrown', 'unburied']);   /* src/main.js NODES spur: true */
const KEEP = lv => !lv.hidden || lv.id === 'underleaf' || lv.id === 'undercrown';
const pacingP = new URL('../work/audit/pacing.json', import.meta.url);
const pacing = existsSync(pacingP) ? Object.fromEntries(JSON.parse(readFileSync(pacingP, 'utf8')).map(r => [r.id, r])) : {};

const rows = {};
for (const lv of LEVELS) {
  if (!KEEP(lv)) continue;
  const R = lv.build();
  const bossT = new Set([R.arena && R.arena.boss, R.mini && R.mini.boss].filter(Boolean));
  let foes = 0, threat = 0, checks = 0, hazTiles = 0; const kinds = new Set(), foeKinds = new Set();
  for (const e of (R.ents || [])) {
    if (e.t === 'check') { checks++; continue; }
    const w = THREAT[e.t]; if (w === undefined) continue;
    if (w > 0) { foes++; threat += w * (e.mini ? 2 : e.elite ? 3 : 1); kinds.add(e.t); if (!bossT.has(e.t)) foeKinds.add(e.t); }
  }
  for (const A of (R.ambushes || [])) for (const w of A.waves) for (const [t] of w) { const v = THREAT[t]; if (v > 0) { foes++; threat += v; kinds.add(t); if (!bossT.has(t)) foeKinds.add(t); } }
  for (let i = 0; i < R.grid.length; i++) if (R.grid[i] === T.SPIKE) hazTiles++;
  for (const p of (R.pools || [])) { if (p.harm) hazTiles += Math.round((p.x1 - p.x0) / TS / 4); else if (p.swim) hazTiles += Math.round((p.x1 - p.x0) / TS / 8); }
  const gap = worstGap(R.ents, R.W, R.H, R.arena), span = spanOf(R.W, R.H);
  const index = indexOf({ threat, kinds: kinds.size, hazTiles, gap, span });
  const sect = R.places ? Object.keys(R.places) : (R.burialSections || R.keepSections || R.harborSections || R.playtestSections || []).map(s => Array.isArray(s) ? s[0] : (s.name || s));
  const pc = pacing[lv.id], st = pc && pc.stats;
  let lightRun = 0; if (pc) for (const m of pc.strip.matchAll(/[-.]+/g)) lightRun = Math.max(lightRun, m[0].length * 8);
  rows[lv.id] = { id: lv.id, name: lv.name, rule: lv.rule || null, needs: gateOf(lv), spur: SPURS.has(lv.id), hidden: !!lv.hidden, arc: lv.arc || null,
    W: R.W, H: R.H, span, foes, threat: Math.round(threat), kinds: kinds.size, foeKinds: [...foeKinds].sort(), haz: hazTiles, checks, gap, index,
    ambushes: (R.ambushes || []).map(a => a.name), sections: sect, boss: R.arena && R.arena.boss, mini: R.mini && R.mini.boss,
    setKinds: st ? st.setKinds : null, systems: st ? st.systems : null, lightRun: pc ? lightRun : null, empties40: st ? st.empties.length : null,
    alternations: st ? st.alternations : null, mix: st ? st.mix : null };
}
/* ancestors, new kinds, step */
for (const r of Object.values(rows)) {
  const seen = new Set(); for (let p = r.needs; p && rows[p]; p = rows[p].needs) for (const k of rows[p].foeKinds) seen.add(k);
  r.newKinds = r.foeKinds.filter(k => !seen.has(k));
  const p = r.needs && rows[r.needs];
  r.prevIndex = p ? p.index : null; r.step = p ? r.index - p.index : null;
  r.ramp = !p ? '' : r.arc ? 'arc opens' : r.step > RAMP_WALL ? 'WALL' : r.step < RAMP_DROP ? 'DIP' : '';
}
if (process.argv.includes('--json')) writeFileSync(new URL('../work/audit/levels.json', import.meta.url), JSON.stringify(Object.values(rows), null, 1));
const pad = (s, n) => String(s ?? '').padEnd(n), pl = (s, n) => String(s ?? '').padStart(n);
console.log(pad('level', 12) + pad('needs', 12) + pl('cols', 5) + pl('INDEX', 6) + pl('step', 6) + '  ' + pad('ramp', 10) + pl('foes', 5) + pl('kind', 5) + pl('new', 4) + pl('haz', 5) + pl('gap', 5) + pl('light', 6) + '  amb sect  set pieces');
for (const r of Object.values(rows)) console.log(pad(r.id + (r.spur ? '*' : ''), 12) + pad(r.needs || '-', 12) + pl(r.span, 5) + pl(r.index, 6) + pl(r.step, 6) + '  ' + pad(r.ramp, 10)
  + pl(r.foes, 5) + pl(r.kinds, 5) + pl(r.newKinds.length, 4) + pl(r.haz, 5) + pl(r.gap, 5) + pl(r.lightRun, 6) + '  ' + pl(r.ambushes.length, 3) + pl(r.sections.length || '-', 5) + '  ' + ((r.setKinds || []).join(',') || '-') + ' / ' + ((r.systems || []).join(',') || '-'));
console.log('* = spur. RAMP_WALL ' + RAMP_WALL + ', RAMP_DROP ' + RAMP_DROP + '. new = F10 kinds no ancestor has (boss/mini excluded). light = longest run of light-or-empty route, tiles (pacing.mjs).');
