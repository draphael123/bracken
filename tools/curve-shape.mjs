// tools/curve-shape.mjs - THE SHAPE OF THE DIFFICULTY CURVE, static (claude/curvefix1, brief-curvefix-1018 sec 2): the road may only get harder.
//   1. every campaign level is in BOTH tier maps of src/main.js: TIER (common foes, elites, hazards) and TIER_BOSS (the frozen map bosses, minis and XP read)
//   2. TIER is non-decreasing along the gate (needs) chain, and a branch is never below its parent (the same test: a level sits at or above what it needs)
//   3. TIER_BOSS equals its frozen copy (the pre-change map): a boss row never moves with the road
//   4. ACTS[].dmg and PRESSURE (gap, dmg, mini gap, mini dmg) are non-decreasing act I -> V; ACT_STAKE too
//   5. every campaign level is in an ACTS act (so its dial exists)
// usage: node tools/curve-shape.mjs      (no page; exit 1 on a problem)
import fs from 'node:fs';
import { LEVELS } from '../src/level.js';
import { gateOf } from '../src/campaign-order.js';
import { ACTS } from '../src/foe-react.js';
import { PRESSURE } from '../src/boss-pressure.js';
import { ACT_STAKE, actStake, bankStake } from '../src/death-cost.js';

const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const table = name => { const m = main.match(new RegExp('const ' + name + ' = \{([^}]*)\}')); const o = {}; if (m) for (const [, k, v] of m[1].matchAll(/(\w+):\s*([\d.]+)/g)) o[k] = +v; return o; };
const TIER = table('TIER'), TIER_BOSS = table('TIER_BOSS');
/* the pre-change map, frozen (master e0436ee8): canal, theatre and the fair were absent (tier 0) */
const FROZEN = { warcairn: 1.3, kitchengate: 1.4, rookery: 1.11, palisadewood: 0.56, hornetsnest: 0.1, fenroad: 0.22, sealedpyramid: 2.7, church: 2.0, rootway: 0.52, minecart: 1.2, skyroad: 1.12, welltown: 2.45, redgorge: 2.5, glasssea: 2.55, ksar: 2.6, towpath: 1.9, buriedcity: 2.65, caravan: 2.4, unburied: 2.1, oreroad: 1.15, witchlight: 2.3, burning: 0.38, fallingtower: 2.35, keep: 2.25, harbor: 2.3, burial: 2.25, mage: 2.35, fields: 2.1, causeway: 2.25, frost: 2.2, hunt: 2.0, quarry: 2.1, skyship: 2.3, waymeet: 1.9, deep: 2.2, undercrown: 1.5, underleaf: 0.7, lamplit: 2.05, hurricane: 1.9, wood: 0, marsh: 0.15, stockade: 0.3, spore: 0.45, kings: 0.6, scree: 0.75, hanging: 0.9, spire: 1, moor: 1.1, storm: 1.2, crown: 1.3, longwater: 1.45, reef: 1.6, flotilla: 1.75, underwell: 2.47 };
/* declared exceptions to "a level sits at or above what it needs": the act-II finale is tuned (Highcrown 1.3 needs the Undercrown 1.5; brief 2b leaves it) */
const ALLOW = new Set(['undercrown<crown', 'undercrown<kitchengate', 'kitchengate<crown', 'kitchengate<warcairn']);   /* (claude/warcairn) THE WAR CAIRN is Highcrown's spur at Highcrown's own 1.3 (the brief: TIER = crown), so it sits under the Kitchen Gate it needs, as Highcrown does */   /* (batch123) THE KITCHEN GATE sits between them at 1.4, tuned there (claude/kitchengate): below the Undercrown's 1.5, above Highcrown's 1.3 - the same act-II finale exception */

const bad = [], say = m => bad.push(m);
const camp = LEVELS.filter(l => !(l.hidden && !l.secret) && !l.secret && !l.trial);
const ids = new Set(camp.map(l => l.id)), byId = Object.fromEntries(LEVELS.map(l => [l.id, l]));

for (const l of camp) { if (!(l.id in TIER)) say(`${l.id}: not in TIER (its common foes would stand at tier 0)`); if (!(l.id in TIER_BOSS) && !(l.id in { canal: 1, theatre: 1, fair: 1 })) say(`${l.id}: not in TIER_BOSS`); }
/* canal / theatre / fair are deliberately absent from the FROZEN boss map (tier 0, as before the change: their XP is patched by xp.js XP_TIER) */
for (const [k, v] of Object.entries(FROZEN)) if (TIER_BOSS[k] !== v) say(`TIER_BOSS.${k} is ${TIER_BOSS[k]}, the frozen value is ${v}`);
for (const k of Object.keys(TIER_BOSS)) if (!(k in FROZEN)) say(`TIER_BOSS.${k} is not in the frozen map`);

for (const l of camp) { const p = gateOf(l); if (!p || !(p in byId)) continue;
  if (!(l.id in TIER) || !(p in TIER)) continue;
  if (TIER[l.id] < TIER[p] && !ALLOW.has(p + '<' + l.id)) say(`TIER falls on the needs chain: ${p} ${TIER[p]} -> ${l.id} ${TIER[l.id]}`); }

const act = ACTS.map(a => a.dmg); for (let i = 1; i < act.length; i++) if (act[i] < act[i - 1]) say(`ACTS.dmg falls: act ${i} ${act[i - 1]} -> act ${i + 1} ${act[i]}`);
for (let i = 1; i < ACTS.length; i++) if ((ACTS[i].hp || 1) < (ACTS[i - 1].hp || 1)) say(`ACTS.hp falls: act ${i} ${ACTS[i - 1].hp} -> act ${i + 1} ${ACTS[i].hp}`);   /* (claude/curvec5) the common/elite health dial */
for (const f of ['gap', 'dmg']) for (let a = 2; a <= 5; a++) { if (PRESSURE[a][f] < PRESSURE[a - 1][f]) say(`PRESSURE.${f} falls: act ${a - 1} ${PRESSURE[a - 1][f]} -> act ${a} ${PRESSURE[a][f]}`); if (PRESSURE[a].mini[f] < PRESSURE[a - 1].mini[f]) say(`PRESSURE.mini.${f} falls: act ${a - 1} ${PRESSURE[a - 1].mini[f]} -> act ${a} ${PRESSURE[a].mini[f]}`); }
for (let a = 2; a <= 5; a++) if (ACT_STAKE[a] < ACT_STAKE[a - 1]) say(`ACT_STAKE falls at act ${a}`);
/* the stake by act: x1 / x1 / x1.25 / x1.5 / x1.75 on the 25% share and the 300 ceiling; acts I-II byte-identical to the old act-blind stake */
for (const b of [400, 900, 1000, 2000, 5000]) if (bankStake(b, actStake(1)) !== bankStake(b) || bankStake(b, actStake(2)) !== bankStake(b)) say('acts I-II stake moved at bank ' + b);
if (bankStake(5000, actStake(3)) !== 375 || bankStake(5000, actStake(4)) !== 450 || bankStake(5000, actStake(5)) !== 525) say('stake ceilings are not 375 / 450 / 525');
const inAct = new Set(ACTS.flatMap(a => a.levels)); for (const l of camp) if (!inAct.has(l.id)) say(`${l.id}: in no ACTS act (the act dial reads its depth instead; list it)`);
/* the act means of TIER rise, act by act (a coarse "visible step each act") */
const mean = a => { const v = a.levels.filter(i => i in TIER).map(i => TIER[i]); return v.reduce((x, y) => x + y, 0) / v.length; };
const means = ACTS.map(mean); for (let i = 1; i < means.length; i++) if (means[i] <= means[i - 1]) say(`TIER act mean does not rise: act ${i} ${means[i - 1].toFixed(2)} -> act ${i + 1} ${means[i].toFixed(2)}`);

console.log('curve-shape: TIER act means ' + means.map(m => m.toFixed(2)).join(' / ') + '; ACTS.dmg ' + act.join('/') + '; stake x' + Object.values(ACT_STAKE).join('/'));
if (bad.length) { console.log(bad.map(b => '  ' + b).join('\n')); console.log('curve-shape: ' + bad.length + ' problem(s)'); process.exit(1); }
console.log('curve-shape: ok (' + camp.length + ' campaign levels in TIER, TIER_BOSS frozen, nothing falls along the needs chain)');
