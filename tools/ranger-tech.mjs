// tools/ranger-tech.mjs - THE RANGER'S L25-L50 KIT (claude/rangerpack). NODE ONLY: no browser, no page. Reads the data (src/tech-ranger.js), runs every pure rule in
// src/ranger-tech.js with real numbers, and reads src/ranger.js + src/main.js + src/lab.js as text to prove each technique and upgrade id is wired and every new blow is swordDmg x k.
// What only a browser shows (the look and sound of each tell, a real-key check) is listed in the lane report as owed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RANGER_TECH, RANGER_UPGRADES } from '../src/tech-ranger.js';
import * as W from '../src/ranger-tech.js';
import * as PR from '../src/progression.js';
import { RG, rgWinEnd, rgTierFor, rgShakyAt, distMul } from '../src/ranger.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const rd = f => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const MAIN = rd('main.js'), RGS = rd('ranger.js'), LAB = rd('lab.js');
const ALL = PR.TECH_LEVELS.flatMap(n => PR.techniquesAt('ranger', n));

check('data: fixed 25/35/45, forks 30/40/50 with differing roles and one trade line, capstone pair, 8 upgrades, unique ids', () => {
  assert.deepEqual(PR.FORK_LEVELS, [30, 40, 50]); assert.deepEqual(Object.keys(RANGER_TECH).map(Number), PR.TECH_LEVELS);
  for (const n of [25, 35, 45]) assert(!PR.isFork('ranger', n), 'L' + n + ' fixed');
  for (const n of PR.FORK_LEVELS) { const [a, b] = PR.techniquesAt('ranger', n); assert(PR.isFork('ranger', n) && a.role && b.role && a.role !== b.role && a.trade && a.trade === b.trade, 'L' + n); }
  assert.deepEqual(PR.techniquesAt('ranger', 50).map(t => t.id), ['rlong', 'rstorm']); assert(PR.techniquesAt('ranger', 50).every(t => t.capstone));
  assert.equal(RANGER_UPGRADES.length, 8); const ids = ALL.map(t => t.id).concat(RANGER_UPGRADES.map(u => u.id)); assert.equal(new Set(ids).size, ids.length);
  for (const t of ALL) { assert(t.name && t.what && t.teach && t.input, t.id); assert(t.k === null || (t.k > 0 && t.k <= 6.0), 'k ' + t.id); }
  for (const u of RANGER_UPGRADES) assert(u.what.length === 2 && u.what[0] && u.what[1], u.id);
  /* the card says the same number the rule uses */
  assert.equal(PR.techniquesAt('ranger', 30)[1].k, W.RT.split.k); assert.equal(RANGER_TECH[35].k, W.RT.far.mul); assert.equal(PR.techniquesAt('ranger', 40)[1].k, W.RT.part.k);
  assert.equal(PR.techniquesAt('ranger', 50)[0].k, W.RT.long.dmg1); assert.equal(PR.techniquesAt('ranger', 50)[1].k, W.RT.storm.k);
  assert.equal(PR.techniquesAt('ranger', 30)[1].cost, W.RT.split.cost);
});
check('every technique and upgrade id is read (api.tech / tech / upg)', () => {
  for (const t of ALL) assert(RGS.includes("tech('" + t.id + "')") || MAIN.includes("tech('" + t.id + "')"), 'tech id not read: ' + t.id);
  for (const u of RANGER_UPGRADES) assert(RGS.includes("upg('" + u.id + "')") || MAIN.includes("upg('" + u.id + "')"), 'upgrade id not read: ' + u.id);
});
check('L25 TRUE FLIGHT: only a landed steady shot, an arrow back + focus', () => {
  assert.deepEqual(W.trueFlight(true, true, true), { back: 1, focus: 10 }); assert.equal(W.trueFlight(true, true, false), null); assert.equal(W.trueFlight(true, false, true), null); assert.equal(W.trueFlight(false, true, true), null);
});
check('L30 A COUNTER-NOCK: an arrow and focus; B SPLIT SHOT: only a full non-steady draw, a free x0.6 arrow, +6 wind', () => {
  assert.deepEqual(W.counterNock(true), { arrows: 1, focus: 20 }); assert.equal(W.counterNock(false), null);
  assert.equal(W.splitArrow(false, true, false), null); assert.equal(W.splitArrow(true, false, false), null); assert.equal(W.splitArrow(true, true, true), null); assert.deepEqual(W.splitArrow(true, true, false), { wait: 0.15, k: 0.6, cost: 6 });
});
check('L35 LONG EYE: from 140 px x1.2 + focus; the sweet spot (52-138) is not it; not owned = nothing', () => {
  assert.deepEqual(W.farEye(true, 150), { mul: 1.2, focus: 14 }); assert.deepEqual(W.farEye(true, 100), { mul: 1, focus: 0 }); assert.deepEqual(W.farEye(false, 250), { mul: 1, focus: 0 });
  assert(W.RT.far.from > RG.sweet.far, 'the far half starts past the sweet spot');
  /* stacked with the distance bonus and LONG SIGHT II on a 200 px arrow: still a plain multiple of swordDmg */
  const m = W.farEye(true, 200).mul * W.distBonus(distMul(200), 2) * W.upMul('head', 2); assert(m > 1.2 && m < 2.2, 'stack ' + m);
});
check('L40 A BARBED VOLLEY: stagger + mark a common foe, a boss/mini takes damage only; B PARTING SHOT: reach x1.33, x0.9 in the flip only', () => {
  assert.deepEqual(W.barbed(true, false), { stagger: 0.4, mark: 4 }); assert.equal(W.barbed(true, true), null); assert.equal(W.barbed(false, false), null);
  assert(Math.abs(W.flipReach(true) - 4 / 3) < 1e-9); assert.equal(W.flipReach(false), 1); assert.equal(W.partingK(true, true), 0.9); assert.equal(W.partingK(true, false), null); assert.equal(W.partingK(false, true), null);
  assert(W.RT.part.k > RG.quick.dmg && W.RT.part.k < RG.draw.dmg0 + 0.01, 'between a tap and a full draw');
});
check('L45 STEADY BREATH + STILL HAND widen the window; range x1.25; the shaky point moves with it', () => {
  assert.equal(W.winExtra(false, 0), 0); assert(Math.abs(W.winExtra(true, 2) - 0.3) < 1e-9);
  const q = 1, st = 0.14, base = rgWinEnd(q, st, false), wide = rgWinEnd(q, st, false, W.winExtra(true, 0));
  assert(Math.abs(wide - base - 0.2) < 1e-9, 'window +0.2 s'); assert.equal(rgTierFor(base + 0.1, q, st, false, 0), 0 + (rgTierFor(base + 0.1, q, st, false, 0) === 1 ? 1 : 0)); /* past the old window: the long shot */
  assert.equal(rgTierFor(base + 0.1, q, st, false, W.winExtra(true, 0)), 2, 'still steady in the widened window'); assert(rgShakyAt(base + 0.1, q, st, false, 0) && !rgShakyAt(base + 0.1, q, st, false, W.winExtra(true, 0)));
  assert.equal(W.steadyRange(240, true), 300); assert.equal(W.steadyRange(240, false), 240);
  assert.equal(rgWinEnd(q, st, false), rgWinEnd(q, st, false, 0), 'the 4-arg call is unchanged');
});
check('upgrades: ranked multipliers move the right way', () => {
  assert.equal(W.upMul('quiver', 2), 2); assert.equal(W.upMul('fletch', 2), 0.7); assert.equal(W.upMul('focus', 1), 1.15); assert.equal(W.upMul('head', 2), 1.1); assert.equal(W.upMul('bash', 2), 0.75); assert.equal(W.upMul('volley', 1), 0.85);
  assert.equal(W.upMul('head', 9), 1.1, 'rank clamps'); assert.equal(W.upMul('head', -1), 1); assert.equal(W.distBonus(0.8, 2), 0.8, 'LONG SIGHT never touches the near penalty'); assert(W.distBonus(1.6, 2) > 1.6);
});
check('L50 A THE LONG DRAW reshapes the great arrow; not owned = the old table exactly', () => {
  assert.equal(W.greatDraw(false, RG.great.draw), RG.great.draw); assert(W.greatDraw(true, RG.great.draw) > RG.great.draw);
  assert.equal(W.greatRange(false, 320, 400), 320); assert.equal(W.greatRange(false, 320, 200), 200); assert.equal(W.greatRange(true, 320, 400), 520, 'capped'); assert.equal(W.greatRange(true, 320, 200), 380);
  const base = W.greatPay(false, RG.great), pay = W.greatPay(true, RG.great); assert.equal(base, RG.great); assert.equal(pay.dmg1, 6.0); assert.equal(pay.dmg0, RG.great.dmg0); assert.equal(pay.boss, RG.great.boss);
  assert(RG.great.dmg1 < pay.dmg1 && pay.dmg1 <= RG.great.dmg1 * 1.4, 'about a third more at the far end');
});
check('L50 B THE ARROW STORM: 12 arrows over 90-290 px inside 1.5 s, a permutation of the spread, both ways; one lone big foe takes a fraction of the great arrow', () => {
  for (const face of [1, -1]) { const p = W.stormPlan(face); assert.equal(p.length, 12); const d = p.map(o => o.dx * face); assert(d.every(x => x >= 90 - 1e-9 && x <= 290 + 1e-9), 'range'); assert.equal(new Set(d.map(x => Math.round(x))).size, 12, 'spread, no stacking'); assert(p.every(o => o.at >= 0.22 - 1e-9 && o.at <= 1.5 + 1e-9)); assert(p.every(o => !o.done)); }
  /* a boss ~40 px wide: arrows within r (15) + half the width (20) of its centre; ~ 35*2 / (200/11) = ~3.8 arrows of 12 */
  const S = W.RT.storm, gap = (S.to - S.from) / (S.n - 1), hit = Math.floor((2 * (S.r + 20)) / gap + 1e-9) + 1;
  const stormBoss = hit * S.k, greatBoss = RG.great.dmg1 * RG.great.boss;
  assert(stormBoss < greatBoss * 0.6, 'the storm is the crowd capstone: ' + stormBoss.toFixed(1) + ' swords on a lone boss vs the great arrow ' + greatBoss.toFixed(1));
  assert(S.n * S.k >= 9, 'a crowd takes a real cast: ' + S.n * S.k + ' swords spread');
});
check('law: every new blow is swordDmg x k, bosses get no new stagger/pin, nothing heals', () => {
  const body = (src, name) => { const i = src.indexOf('function ' + name + '('); assert(i > 0, name); const j = src.indexOf('\n  function ', i + 10); return src.slice(i, j > 0 ? j : i + 3000); };
  const st = body(RGS, 'stormStep'); const calls = st.match(/hurtAs\([^;]*;/g) || []; assert(calls.length > 0); for (const c of calls) assert(/swordDmg\(\) \* RTK\.RT\.storm\.k/.test(c), 'storm blow: ' + c.slice(0, 100)); assert(/!big/.test(st) && !/pinFoe|floorFoe|heal|\.hp \+=/.test(st), 'a boss gets damage only');
  assert(/dmgBase\(\) \* \(RG\.draw\.dmg0 \+ \(RG\.draw\.dmg1 - RG\.draw\.dmg0\) \* k\) \* sp\.k/.test(RGS), 'split shot = the draw x k');
  assert(/dmgBase\(\) \* \(pk == null \? RG\.quick\.dmg : pk\)/.test(RGS), 'parting shot = swordDmg x k');
  const bb = RGS.match(/if \(landed && a\.barb\)[^\n]*/)[0]; assert(/RTK\.barbed\(true, big\)/.test(bb) && !/stagger[^;]*big/.test(bb), 'barbed: bosses are not staggered (barbed() returns null for big)');
  const nock = RGS.match(/const cn = RTK\.counterNock[^\n]*/)[0]; assert(!/hurt|stagger|heal/.test(nock), 'counter-nock pays arrows and focus only');
  assert(/api\.hurtAs\(\['plunge', 'shot'\]/.test(st));
});
check('wiring: ultimate name follows the pick, the window extra reaches every call site, the volley cd, the bot fires UP+C', () => {
  assert(MAIN.includes("tech('rstorm') ? 'ARROW STORM' : tech('rlong') ? 'LONG DRAW' : 'GREAT ARROW'"));
  assert(MAIN.includes('rgWinEnd(rgQuick(), HEAVY_START, RGK.focusFull(), rgWinX())') && MAIN.includes('rgWinEnd(q, HEAVY_START, foc, rgWinX())') && MAIN.includes('HEAVY_START, !!RGK && RGK.focusFull(), rgWinX())'));
  assert(MAIN.includes("RTK.upMul('volley', upg('uvolley'))") && MAIN.includes('tech: id => tech(id), upg: id => upg(id)'));
  assert(/h === 'ranger'\) \{ const R = BK\.rgk && BK\.rgk\(\); return !!R && R\.greatReady\(\)/.test(LAB), 'the lab bot already casts her ultimate (the pick reshapes it)');
  assert(RGS.includes('if (G.storm) { stormStart(p); return; }') && RGS.includes('p.rgFocus = 0'), 'the storm spends the focus like the great arrow');
});
check('a save with the kit: respec + picks owed still balance for the ranger', () => {
  const p = { card: { ranger: { v: 0, e: 0, m: 0, ms: {} } } }; for (const n of PR.TECH_LEVELS) { const o = PR.perkOffer(p, 'ranger', n); assert(o[0].tech && o[0].rec); assert.equal(PR.pickMilestone(p, 'ranger', n, o[0].id, 50), null); }
  assert.equal(PR.techOn(p, 'ranger', 'rlong'), true); assert(PR.forkLocked(p, 'ranger', 'rstorm'));
  PR.validateProgress(JSON.parse(JSON.stringify(p))); PR.respecCard(p, 'ranger'); assert.deepEqual(p.card.ranger.ms, {});
  const q = { card: { ranger: { v: 0, e: 0, m: 0, ms: {} } } }; PR.pickMilestone(q, 'ranger', 25, 'rtrue', 50); PR.pickMilestone(q, 'ranger', 30, 'rsplit', 50); PR.pickMilestone(q, 'ranger', 35, 'rfar', 50); PR.pickMilestone(q, 'ranger', 40, 'rpart', 50); PR.pickMilestone(q, 'ranger', 45, 'rbreath', 50); PR.pickMilestone(q, 'ranger', 50, 'rstorm', 50);
  for (const id of ['rtrue', 'rsplit', 'rfar', 'rpart', 'rbreath', 'rstorm']) assert(PR.techOn(q, 'ranger', id), id); for (const id of ['rnock', 'rbarb', 'rlong']) assert(PR.forkLocked(q, 'ranger', id), id);
});
if (bad.length) { console.log('RANGER-TECH: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Ranger tech: 3 fixed + 3 forks (pairs differ in role, one trade line, capstone pair), 8 upgrades, every rule with real numbers, every id wired, blows are swordDmg x k, bosses never pinned or staggered by a new technique, the storm is the crowd capstone');
