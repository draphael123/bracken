/* tools/walk-curve.mjs - THE WALKER'S CURVE TABLE (claude/curvec2, brief-curvefix-1018 2f / lane C2). No browser.
   tools/level-walk.mjs plays a level as a campaign-level player; this folds its rows (one per level x hero x seed) into docs/walk-curve.json: per level and per hero the
   deaths a first run and the mean hp at a shrine arrival, read against the BY-ACT target (level-walk.mjs TARGET_BY_ACT: deaths 0.5-1.5 / 1-2 / 1.5-2.5 / 2-3 / 2.5-3.5, arrival 65/60/55/50/45%).
     node tools/walk-curve.mjs build --after=a.json[,b.json] [--before=c.json[,d.json]] [--base="e0436ee8 pre-C1"] [--head="f95390f0"] [--out=docs/walk-curve.json]   fold walker rows (level-walk.mjs --json) into the table
     node tools/walk-curve.mjs                                                                                                                                      print the committed table by act (before -> after vs target)
   tools/curve-gate.mjs READS this table for acts III-V (REPORT-ONLY: it prints, it never fails). A row carries the level's levelHash: a changed level prints 'stale'. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TARGET_BY_ACT, actOfId, summarize } from './level-walk.mjs';

export const WALK_CURVE_FILE = fileURLToPath(new URL('../docs/walk-curve.json', import.meta.url));
const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null, r1 = x => x === null || x === undefined ? null : Math.round(x * 10) / 10;
/* walker rows -> { level: { act, heroes: { hero: { runs, deaths, arrive, arriveN, arriveMin, coverage, ends } }, deaths, arrive } } */
/* A run that ran out of frames or was locked in made no progress (the walker, not the level, ended it: towpath / glasssea / sealedpyramid warden walked 19-29% of the route): it says nothing about the level's pressure and is LEFT OUT of the means (counted in `dropped`). A wall (8 deaths) or a boss door is a real end. */
export const UNRELIABLE = r => !r.err && (r.end === 'frames' || r.end === 'locked');
export function fold(rows, hashOf = () => null) {
  const out = {}, dropped = {};
  for (const r of rows) if (UNRELIABLE(r)) dropped[r.id + '|' + r.hero] = (dropped[r.id + '|' + r.hero] || 0) + 1;
  rows = rows.filter(r => !UNRELIABLE(r));
  for (const s of summarize(rows)) { const L = out[s.id] || (out[s.id] = { act: actOfId(s.id), hash: hashOf(s.id), lvl: s.lvl, heroes: {} });
    L.heroes[s.hero] = { runs: s.runs, deaths: r1(s.deaths), arrive: s.arriveMean === null ? null : Math.round(s.arriveMean), arriveMin: s.arriveMin, coverage: Math.round(s.coverage), ends: s.ends, lostPerSection: s.lostPerSection === null ? null : Math.round(s.lostPerSection), drinks: r1(s.drinks), dropped: dropped[s.id + '|' + s.hero] || 0 }; }
  for (const k of Object.keys(dropped)) { const [id, hero] = k.split('|'); const L = out[id] || (out[id] = { act: actOfId(id), hash: hashOf(id), lvl: null, heroes: {} }); if (!L.heroes[hero]) L.heroes[hero] = { runs: 0, deaths: null, arrive: null, arriveMin: null, coverage: 0, ends: 'frames', lostPerSection: null, drinks: null, dropped: dropped[k] }; }
  for (const L of Object.values(out)) { const H = Object.values(L.heroes), HD = H.filter(h => h.deaths !== null); L.deaths = HD.length ? r1(mean(HD.map(h => h.deaths))) : null; const ar = H.filter(h => h.arrive !== null).map(h => h.arrive); L.arrive = ar.length ? Math.round(mean(ar)) : null; L.coverage = HD.length ? Math.round(mean(HD.map(h => h.coverage))) : 0; L.runs = H.reduce((s, h) => s + h.runs, 0); L.dropped = H.reduce((s, h) => s + (h.dropped || 0), 0); }
  return out;
}
/* the verdict of one level against its act's target: 'low' (deaths under the floor / arrives fuller than the target = under-pressed), 'high' (over the ceiling / arrives emptier), 'ok' */
export function verdict(L) {
  const T = TARGET_BY_ACT[L.act]; if (!T) return { deaths: '-', arrive: '-' };
  return { deaths: L.deaths === null ? '-' : L.deaths < T.deathsLo ? 'low' : L.deaths > T.deathsHi ? 'high' : 'ok', arrive: L.arrive === null ? '-' : L.arrive > T.arriveHp ? 'soft' : 'ok' };
}
/* the act means (of the level means): deaths, arrival, how many levels sit inside the death band */
export function actTable(levels) {
  const out = {}; for (const [id, L] of Object.entries(levels)) (out[L.act] = out[L.act] || []).push([id, L]);
  return Object.fromEntries(Object.entries(out).map(([a, A]) => [a, { n: A.length, deaths: r1(mean(A.map(([, L]) => L.deaths).filter(x => x !== null))), arrive: (m => m === null ? null : Math.round(m))(mean(A.map(([, L]) => L.arrive).filter(x => x !== null))), inBand: A.filter(([, L]) => verdict(L).deaths === 'ok').length }]));
}
const fmtAct = (t, a) => t ? `${t.deaths ?? '-'}d / ${t.arrive ?? '-'}%` : '-';
export function printTable(curve, log = console.log) {
  const A = actTable(curve.after || {}), B = actTable(curve.before || {});
  log('WALKER CURVE (campaign hero, human+first; deaths a first run / mean shrine arrival hp)  after = ' + (curve.head || '?') + (curve.before ? ', before = ' + (curve.base || '?') : ''));
  log('act  target (deaths / arrival)   before -> after      levels in the death band');
  for (const a of Object.keys(TARGET_BY_ACT)) { const T = TARGET_BY_ACT[a]; if (!A[a] && !B[a]) continue;
    log(String(a).padEnd(5) + (T.deathsLo + '-' + T.deathsHi + ' / ' + T.arriveHp + '%').padEnd(28) + (fmtAct(B[a]) + ' -> ' + fmtAct(A[a])).padEnd(22) + (A[a] ? A[a].inBand + '/' + A[a].n : '-')); }
  log('level           act  hero deaths (before -> after)  arrive% (before -> after)  vs target');
  for (const [id, L] of Object.entries(curve.after || {})) { const b = (curve.before || {})[id], v = verdict(L);
    log(id.padEnd(15) + String(L.act).padEnd(5) + 'all  ' + ((b ? b.deaths : '-') + ' -> ' + L.deaths).padEnd(26) + ((b ? b.arrive ?? '-' : '-') + ' -> ' + (L.arrive ?? '-')).padEnd(27) + 'deaths ' + v.deaths + ', arrival ' + v.arrive + (L.coverage < 60 || L.dropped ? '  (' + L.coverage + '% of the route measured between shrines' + (L.dropped ? ', ' + L.dropped + ' no-progress runs left out' : '') + ')' : '')); }
}
export function loadCurve() { return existsSync(WALK_CURVE_FILE) ? JSON.parse(readFileSync(WALK_CURVE_FILE, 'utf8')) : null; }

if (process.argv[1] && /walk-curve\.mjs$/.test(process.argv[1])) {
  const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
  if (args[0] === 'build') {
    const { LEVELS } = await import('../src/level.js'), { levelHash } = await import('./level-quality.mjs'), byId = Object.fromEntries(LEVELS.map(l => [l.id, l]));
    const rd = list => list ? list.split(',').flatMap(f => JSON.parse(readFileSync(f, 'utf8'))) : null, hashOf = id => byId[id] ? levelHash(byId[id]) : null;
    const after = rd(opt('after', '')), before = rd(opt('before', ''));
    const curve = { note: 'tools/walk-curve.mjs build: the level walker (tools/level-walk.mjs, campaign level, typical build, human+first) folded by level and hero. Target by act: level-walk.mjs TARGET_BY_ACT.',
      base: opt('base', ''), head: opt('head', ''), seeds: opt('seeds', ''), targets: TARGET_BY_ACT, after: fold(after, hashOf), before: before ? fold(before) : undefined };
    writeFileSync(opt('out', WALK_CURVE_FILE), JSON.stringify(curve, null, 1)); printTable(curve);
  } else { const c = loadCurve(); if (!c) { console.log('no docs/walk-curve.json'); process.exit(1); } printTable(c); }
}
