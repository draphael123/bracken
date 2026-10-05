/* tools/rule-state.mjs - (the pure half of tools/rule-fights.mjs, imported by tools/level-quality.mjs) THE LEVEL-SIDE CHECKS OF THE COMBAT PASS, PART 2 (claude/combat2, 2026-10-05; scratch brief-combat-part2 item 5). No browser.
   (a) FIGHT DURING THE RULE (design standard A5): a DESIGNED ENCOUNTER (a squad, an elite, an ambush room, the mini, a clump - level-quality's
       encounter list) counts when it stands where the level's rule is ACTIVE: inside or within RULE.near columns of the level's rule state as the
       built level carries it (its rule's own arrays - gusts, the bore, the tide, dark zones, swim water, failing floor, gas, fire, the flood channels,
       the sun outside the shade...). A level with a rule needs RULE.min of them. A level whose rule state is not in its data at all is listed apart.
   (b) THE MEASURED DIFFICULTY CURVE: the level-1 knight pilot (tools/level1-pilot.mjs --curve, every campaign level, docs/level1-curve.json) against
       a band per ACT (src/foe-react.js ACTS) for health lost a run and deaths over three runs - so later levels are provably harder - and the acts'
       medians must rise.
   Both are REPORT-ONLY (Daniel: no giant sweep - each level is fixed when its own lane touches it): tools/level-quality.mjs prints them as WARN rows
   (REPORT_ALL) and the gate does not fail on them.
     node tools/rule-fights.mjs           (the CLI) the campaign table and the list of levels that miss (a), (b) */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ACTS, actOf } from '../src/foe-react.js';

export const RULE = { near: 10, min: 2 };
/* THE BANDS (level-1 knight, no abilities, 3 runs; lostPct = health lost per run, deaths = summed over the 3). Act I is where a fresh hero learns; each
   act after asks more. A FLOOR and a CEILING: under the floor the act is a walk for a level-1 hero, over the ceiling a wall. */
export const CURVE_BANDS = {
  1: { lost: [40, 250], deaths: [0, 3] },
  2: { lost: [70, 400], deaths: [0, 6] },
  3: { lost: [100, 500], deaths: [1, 9] },
  4: { lost: [120, 600], deaths: [1, 12] },
  5: { lost: [150, 700], deaths: [2, 12] },
};
/* THE CURVE'S REPORT-ONLY LIST (the level difficulty sweep shrinks it, one act a lane): every campaign level OUT of its act's band on the first
   measurement (claude/combat2, 2026-10-05, docs/level1-curve.json). A level listed here prints WARN; a level out of band and NOT listed fails
   tools/curve-gate.mjs (and level-quality for a gated level); a listed level that is back in its band fails too - take it out, as MASH_REPORT_ONLY.
   Each entry: what it measured, and which way it misses. */
export const CURVE_REPORT_ONLY = {
  kings: 'act 1: 176% lost a run, 5 deaths - over the act I death ceiling (3)',
  scree: 'act 2: 414% lost, 7 deaths - over the act II death ceiling (6) and its health ceiling (400%)',
  underleaf: 'act 2: 45% lost, 0 deaths - EASY for act II (floor 70%)',
  storm: 'act 2: 26% lost, 0 deaths - EASY for act II (floor 70%): the level-1 pilot is lifted past most of it',
  crown: 'act 2: 506% lost, 7 deaths - over both act II ceilings',
  undercrown: 'act 2: 345% lost, 9 deaths - over the act II death ceiling (6)',
  longwater: 'act 3: 63% lost, 0 deaths - EASY for act III (floor 100%, 1 death)',
  reef: 'act 3: 97% lost, 0 deaths - under the act III floor (100%, 1 death)',
  keep: 'act 3: 256% lost, 0 deaths - no deaths (act III wants >= 1)',
  causeway: 'act 3: 71% lost, 0 deaths - EASY for act III',
  theatre: 'act 4: 61% lost, 0 deaths - EASY for act IV (floor 120%, 1 death)',
  fair: 'act 4: 198% lost, 0 deaths - no deaths (act IV wants >= 1)',
  fallingtower: 'act 4: 566% lost, 13 deaths - over the act IV death ceiling (12)',
  redgorge: 'act 5: 120% lost, 3 deaths - under the act V health floor (150%)',
};
/* THE RULE'S STATE, by the built level's own keys. Each holds places: {x0,x1} / {x} / [x0, x1, ..] in tiles or pixels (read by size). */
const RULE_KEYS = ['gusts', 'bore', 'causeTide', 'streetTide', 'wash', 'swell', 'darkZones', 'deckBreaks', 'crumbles', 'gasVents', 'whirlpools', 'siphons', 'blight',
  'channels', 'jams', 'burn', 'stillFires', 'roofFire', 'emberPits', 'cellarFires', 'hush', 'din', 'winds', 'thermals', 'lampAir', 'fogLamps', 'airRooms', 'risenDead', 'graves',
  'quicksand', 'pits', 'seams', 'looseRock', 'slide', 'flips', 'glyphBridges', 'alarms', 'watchtowers', 'hoists', 'ropes', 'stagetraps', 'rigBands', 'mudWalls', 'casters', 'volleys',
  'cavalry', 'caps', 'causeCurrents', 'causeBreakers', 'ballast', 'deepHolds', 'hullZones', 'masts', 'risers', 'callers', 'carousels', 'chases', 'sun', 'clouds', 'skyThermals'];   /* (claude/skyroad: THE SKY ROAD's cloud banks and thermal columns) */
const RULE_ENTS = /^(felltree|horn|deadfall|bell|tbell|seabell|tidebell|keg|oilbarrel|powder|cap|banner|bearer|lantern|lamp|brazier|sluice|pump|crank|winch|capstan|rope|lever)$/;

export function ruleZones(L, TS = 16) {
  const W = L.W, z = [], col = v => (v > W * 1.5 ? v / TS : v);
  const take = it => { if (it === null || it === undefined) return;
    if (Array.isArray(it)) { if (it.length >= 2 && typeof it[0] === 'number' && typeof it[1] === 'number') { const a = col(it[0]), b = col(it[1]); z.push(b >= a && b - a < W ? [a, b] : [a, a]); } return; }
    if (typeof it !== 'object') return;
    if (typeof it.x0 === 'number' && typeof it.x1 === 'number') z.push([col(it.x0), col(it.x1)]);
    else if (typeof it.x === 'number') z.push([col(it.x) - 3, col(it.x) + 3]);
    else if (typeof it.col === 'number') z.push([it.col - 3, it.col + 3]); };
  const used = [];
  for (const k of RULE_KEYS) { const v = L[k]; if (!v) continue; const n0 = z.length;
    if (Array.isArray(v)) for (const it of v) take(it); else if (typeof v === 'object') { take(v); for (const it of Object.values(v)) if (Array.isArray(it)) for (const q of it) take(q); }
    if (z.length > n0) used.push(k); }
  /* the water a swim level is ruled by, and the spikes and harmful pools every level has: the hazard, active all the time */
  for (const p of L.pools || []) if (p.harm || p.swim || p.deep) { z.push([p.x0 / TS, p.x1 / TS]); if (!used.includes('pools')) used.push('pools'); }
  const rEnts = (L.ents || []).filter(e => RULE_ENTS.test(e.t)); for (const e of rEnts) z.push([e.x - 3, e.x + 3]); if (rEnts.length) used.push('ents:' + [...new Set(rEnts.map(e => e.t))].join('/'));
  return { zones: z, keys: used };
}
/* how many encounters (level-quality's enc list: {x, k}) stand where the rule is active */
export function ruleFights(L, enc, TS = 16) {
  const { zones, keys } = ruleZones(L, TS);
  const inRule = x => zones.some(([a, b]) => x >= a - RULE.near && x <= b + RULE.near);
  const hit = enc.filter(e => inRule(e.x));
  return { n: hit.length, of: enc.length, keys, data: zones.length > 0, ok: zones.length > 0 && hit.length >= RULE.min,
    msg: !zones.length ? 'the rule\'s state is not in the level data (no rule arrays): not measured' : hit.length + ' of ' + enc.length + ' designed encounters stand where the rule is active (>=' + RULE.min + '; rule state from ' + keys.slice(0, 6).join(', ') + ')' };
}
let CURVE = null;
export const curveCache = () => CURVE || (CURVE = (() => { const f = fileURLToPath(new URL('../docs/level1-curve.json', import.meta.url)); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {}; })());
export function curveVerdict(id, hash, depth) {
  const row = curveCache()[id], act = actOf(id, depth), band = CURVE_BANDS[act.act];
  if (!row) return { ok: true, soft: true, state: 'missing', act: act.act, msg: 'no curve row (node tools/level1-pilot.mjs ' + id + ' --curve)' };
  if (hash && row.hash !== hash) return { ok: true, soft: true, state: 'stale', act: act.act, msg: 'the level changed since its curve row (re-run node tools/level1-pilot.mjs ' + id + ' --curve)' };
  const lost = row.lostPct ?? null, under = lost !== null && lost < band.lost[0], over = lost !== null && lost > band.lost[1], dUnder = row.deaths < band.deaths[0], dOver = row.deaths > band.deaths[1];
  const why = [under ? 'EASY for act ' + act.act + ' (health lost ' + lost + '% < ' + band.lost[0] + ')' : '', over ? 'A WALL for act ' + act.act + ' (health lost ' + lost + '% > ' + band.lost[1] + ')' : '',
    dUnder ? 'no deaths (act ' + act.act + ' wants >= ' + band.deaths[0] + ')' : '', dOver ? row.deaths + ' deaths (act ' + act.act + ' wants <= ' + band.deaths[1] + ')' : ''].filter(Boolean);
  return { ok: !why.length, state: why.length ? 'out' : 'ok', act: act.act, lost, deaths: row.deaths, msg: 'act ' + act.act + ' (' + act.name + '): a level-1 knight lost ' + lost + '% health a run, ' + row.deaths + ' deaths in 3 runs (band ' + band.lost.join('-') + '%, ' + band.deaths.join('-') + ' deaths)' + (why.length ? ' - ' + why.join('; ') : '') };
}

