// tools/dir-mix.mjs - DOES EACH LEVEL'S FOE MIX ASK FOR UP, DOWN AND PLUNGE? (claude/dmlint; scratch/lane-reports/dirmoves-plan.md section 8 item 6)
// Every level of ACTS (src/foe-react.js) must hold >= 1 foe that asks UP (wing family / leap-swat), >= 1 that asks DOWN (high guard / small family),
// >= 1 that asks PLUNGE (plate / shell / helm / beast family). Static, no browser. The families are READ from main.js FAMILY (not duplicated), so
// DMFOES edits to FAMILY flow in; the DM-only sets (high guard, helm, leap-swat) are the plan's lists, below.
//   node tools/dir-mix.mjs [--live] [--quiet] [--act=1,2] [--strict]     (default: report-only, exit 0; --strict exits 1 on any miss in the --act set, default acts 1-2)
import { readFileSync } from 'node:fs';
import { DM, FAMILY_ADD } from '../src/dirmoves.js';
const live = process.argv.includes('--live');   /* --live = DM.on false (what ships today); default = DM.on true (the flip state, the direction swaps applied) */
DM.on = !live;
const { LEVELS } = await import('../src/level.js');
import { ACTS } from '../src/foe-react.js';
import * as MARKS from '../src/marks.js';
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1];
const quiet = process.argv.includes('--quiet'), strict = process.argv.includes('--strict');
const strictActs = (arg('act') || '1,2').split(',').map(Number);

// FAMILY kinds, read from the source
const SRC = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const body = SRC.slice(SRC.indexOf('const FAMILY = {'), SRC.indexOf('const FAMILY_OF'));
const FAM = {};
for (const m of body.matchAll(/^\s*(\w+):\s*\{([^\n]*?)kinds:\s*\[([^\]]*)\]/gm)) {
  FAM[m[1]] = { key: ((m[2].match(/key:\s*\[([^\]]*)\]/) || [])[1] || '').match(/\w+/g) || [], kinds: m[3].match(/\w+/g) || [] };
}
if (!FAM.guard || !FAM.wing) throw new Error('dir-mix: could not read FAMILY from main.js');
const famKinds = n => [...FAM[n].kinds, ...(DM.on ? Object.keys(FAMILY_ADD).filter(t => FAMILY_ADD[t] === n) : [])];   /* (claude/dmcharge) DM.on: the desert kinds DMFOES classified (FAMILY_ADD) count - imported, not re-read from main.js */

// DM-only sets (plan section 8)
const HIGH_GUARD = ['shield', 'soldier', 'heavy', 'watch', 'pike', 'turtle', 'tideguard', 'merrowbrute', 'glasssentinel', 'kingsshield', 'myconidguard', 'herbwarden', 'shieldguard'];   /* 8.2 (crab is in the guard family but is its own plunge job, 8.5) */
const HELM = ['shield', 'bellguard', 'sentry', 'armour', 'swornsword', 'hedgeknight', 'boarder', 'bosun', 'kingsshield'];                                                          /* 8.3 */
const LEAP_RE = /leap|pounce|dive|hop|jump|drop/i;
// leap-swat kinds: a common foe with an ANSWER row whose mode names a leap/pounce/dive/hop/drop (8.4), minus bosses (those answer in their own fights)
const LEAP = new Set(), BOSSY = new Set();
for (const lv0 of LEVELS) { try { const L0 = lv0.build(); for (const b of [L0.arena && L0.arena.boss, L0.mini && L0.mini.boss]) if (b) BOSSY.add(b); } catch {} }
for (const k of Object.keys(MARKS.ANSWER)) { const [t, mode] = k.split('|'); if (t && mode && !BOSSY.has(t) && !t.startsWith('*') && !/^ek/.test(mode) && LEAP_RE.test(mode.replace(/chop/gi, ''))) LEAP.add(t); }   /* (not a boss's or mini's row, not an elite-kit row, 'chop' is not a hop) */
// plus the plan's by-name list (hound, hopper, spider, lurker, raptor, harpy, gar) in case a row is named differently
for (const t of ['hound', 'hopper', 'spider', 'lurker', 'raptor', 'harpy', 'gar']) LEAP.add(t);

export const JOBS = {
  UP: { wing: famKinds('wing'), leap: [...LEAP] },
  DOWN: { highguard: HIGH_GUARD, small: famKinds('small') },
  PLUNGE: { plate: famKinds('plate'), shell: famKinds('shell'), helm: HELM, beast: famKinds('beast') },
};
// does kind t ask job J, and why
export function asks(t) { const r = { UP: [], DOWN: [], PLUNGE: [] }; for (const J in JOBS) for (const why in JOBS[J]) if (JOBS[J][why].includes(t)) r[J].push(why); return r; }

export function mixOf(lv) {
  const L = lv.build(), bosses = new Set([L.arena && L.arena.boss, L.mini && L.mini.boss].filter(Boolean)), n = new Map();
  const add = t => { if (t && !bosses.has(t)) n.set(t, (n.get(t) || 0) + 1); };
  for (const e of L.ents || []) if (e.t) add(e.t);
  for (const A of L.ambushes || []) for (const w of A.waves || []) for (const f of w) add(f[0] || f.t);
  return n;
}
const rows = [], miss = [];
for (const A of ACTS) for (const id of A.levels) {
  const lv = LEVELS.find(l => l.id === id); if (!lv) continue;
  let mix; try { mix = mixOf(lv); } catch (e) { rows.push(`act ${A.act} ${id}: build failed ${e.message}`); continue; }
  const got = { UP: new Set(), DOWN: new Set(), PLUNGE: new Set() };
  for (const [t] of mix) { const a = asks(t); for (const J in a) if (a[J].length) got[J].add(t); }
  const lack = Object.keys(got).filter(J => !got[J].size);
  const cell = J => got[J].size ? [...got[J]].slice(0, 3).join('/') : '-- MISS --';
  rows.push({ act: A.act, id, lack, line: `act ${A.act} ${id.padEnd(13)} UP ${cell('UP').padEnd(22)} DOWN ${cell('DOWN').padEnd(22)} PLUNGE ${cell('PLUNGE')}` });
  if (lack.length) miss.push({ act: A.act, id, lack, kinds: [...mix.keys()] });
}
if (!quiet) for (const r of rows) console.log(typeof r === 'string' ? r : r.line);
for (const m of miss) console.log(`MISS act ${m.act} ${m.id}: needs ${m.lack.join('+')}  (mix: ${m.kinds.join(',')})`);
const gated = miss.filter(m => strictActs.includes(m.act));
console.log(`dir-mix: ${rows.length} levels, ${miss.length} with a miss (${gated.length} in acts ${strictActs.join(',')})`);
if (strict && gated.length) process.exit(1);
