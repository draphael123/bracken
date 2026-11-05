// tools/warden-tech.mjs - THE WARDEN'S L25-L50 KIT (claude/wardenpack). NODE ONLY: no browser, no page. Reads the data (src/tech-warden.js), runs every pure rule in
// src/warden-tech.js with real numbers, and reads src/main.js + src/lab.js as text to prove each technique and upgrade id is wired and every new blow is swordDmg x k x amul.
// What only a browser shows (the look and sound of each tell, a real-key check) is listed in the lane report as owed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WARDEN_TECH, WARDEN_UPGRADES } from '../src/tech-warden.js';
import * as W from '../src/warden-tech.js';
import * as PR from '../src/progression.js';
import { WID } from '../src/warden-id.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), LAB = readFileSync(new URL('../src/lab.js', import.meta.url), 'utf8');
const ALL = PR.TECH_LEVELS.flatMap(n => PR.techniquesAt('warden', n));

check('data: fixed 25/35/45, forks 30/40/50 with differing roles and one trade line, capstone pair, 8 upgrades, unique ids', () => {
  assert.deepEqual(PR.FORK_LEVELS, [30, 40, 50]); assert.deepEqual(Object.keys(WARDEN_TECH).map(Number), PR.TECH_LEVELS);
  for (const n of [25, 35, 45]) assert(!PR.isFork('warden', n), 'L' + n + ' fixed');
  for (const n of PR.FORK_LEVELS) { const [a, b] = PR.techniquesAt('warden', n); assert(PR.isFork('warden', n) && a.role && b.role && a.role !== b.role && a.trade && a.trade === b.trade, 'L' + n); }
  assert.deepEqual(PR.techniquesAt('warden', 50).map(t => t.id), ['wlongline', 'wgreat']); assert(PR.techniquesAt('warden', 50).every(t => t.capstone));
  assert.equal(WARDEN_UPGRADES.length, 8); const ids = ALL.map(t => t.id).concat(WARDEN_UPGRADES.map(u => u.id)); assert.equal(new Set(ids).size, ids.length);
  for (const t of ALL) { assert(t.name && t.what && t.teach && t.input, t.id); assert(t.k === null || (t.k > 0 && t.k <= 5.0), 'k ' + t.id); }
  for (const u of WARDEN_UPGRADES) assert(u.what.length === 2 && u.what[0] && u.what[1], u.id);
  /* the card says the same number the rule uses */
  assert.equal(WARDEN_TECH[25].k, W.WT.point.mul); assert.equal(PR.techniquesAt('warden', 30)[1].k, W.WT.twin.k); assert.equal(WARDEN_TECH[35].k, W.WT.far.mul);
  assert.equal(PR.techniquesAt('warden', 40)[1].k, W.WT.spring.k); assert.equal(WARDEN_TECH[45].k, W.WT.thru.k); assert.equal(PR.techniquesAt('warden', 50)[0].k, W.WT.longline.perHit); assert.equal(PR.techniquesAt('warden', 50)[1].k, W.WT.great.k);
});
check('every technique and upgrade id is read in main.js (tech() / upg())', () => {
  for (const t of ALL) assert(MAIN.includes("tech('" + t.id + "')"), 'tech id not read: ' + t.id);
  for (const u of WARDEN_UPGRADES) assert(MAIN.includes("upg('" + u.id + "')"), 'upgrade id not read: ' + u.id);
});
check('L25 POINTED: a tip marks, the next blow is x1.2 and spends it, a haft blow neither earns nor spends, the mark times out, not owned = no mark', () => {
  let r = W.pointedHit(true, 1.6, 0, 10); assert.equal(r.mul, 1); assert.equal(r.until, 12.5);
  r = W.pointedHit(true, 0.7, 12.5, 11); assert.equal(r.mul, 1.2); assert.equal(r.until, 0);   /* the shaft blow takes the mark */
  r = W.pointedHit(true, 0.3, 12.5, 11); assert.equal(r.mul, 1); assert.equal(r.until, 12.5);   /* the haft: nothing */
  r = W.pointedHit(true, 0.7, 12.5, 13); assert.equal(r.mul, 1, 'timed out');
  r = W.pointedHit(true, 1.6, 12.5, 11); assert.equal(r.mul, 1.2); assert.equal(r.until, 13.5, 'a pointed foe struck at the tip is re-marked');
  r = W.pointedHit(false, 1.6, 0, 10); assert.equal(r.until, 0); assert.equal(r.mul, 1);
  assert.equal(W.pointedHit(false, 1.6, 0, 10, 2).mul, 1.12, 'SWEET POINT II works without the technique'); assert.equal(W.pointedHit(false, 0.7, 0, 10, 2).mul, 1, 'SWEET POINT is tip only');
});
check('L30 A KEEP-OFF: a small foe is driven out to the point; a boss/mini gives her a step, never a stagger or a kick; the band pays either way', () => {
  const s = W.keepOff(false, 10); assert(s.kick >= 120 && s.stagger === 0.5 && s.band === 8 && s.recoil === 0); assert.equal(W.keepOff(false, 40).kick, 0, 'already at the point');
  const b = W.keepOff(true, 10); assert.equal(b.kick, 0); assert.equal(b.stagger, 0); assert.equal(b.recoil, 55); assert.equal(b.band, 8);
  assert.equal(W.WT.keep.to, WID.long.keep, 'keeps the foe at the long thrust\'s own range');
});
check('L30 B TWIN JAVELIN: only the quick throw, a lighter second spear a beat behind, costs a little more', () => {
  assert.equal(W.twinSpear(false, 1), null); assert.equal(W.twinSpear(true, 2), null); assert.equal(W.twinSpear(true, 3), null);
  const t = W.twinSpear(true, 1); assert.deepEqual(t, { wait: 0.18, k: 0.6, cost: 6 });
  assert(W.javMul(0.9, t.k, W.farHit(false, 0), 0) < 0.9 && Math.abs(W.javMul(0.9, t.k, W.farHit(false, 0), 0) - 0.54) < 1e-9);
});
check('L35 FAR POINT: from 70 px a javelin hits x1.3 and pays +12 band, flies 20% further; close in it is the old throw', () => {
  assert.deepEqual(W.farHit(true, 80), { mul: 1.3, band: 12 }); assert.deepEqual(W.farHit(true, 40), { mul: 1, band: 0 }); assert.deepEqual(W.farHit(false, 200), { mul: 1, band: 0 });
  assert.equal(W.javRange(true, 88), 106); assert.equal(W.javRange(false, 88), 88);
  assert(Math.abs(W.javMul(1.5, undefined, W.farHit(true, 100), 2) - 1.5 * 1.3 * 1.4) < 1e-9, 'JAVELIN+ II stacks with it');
});
check('L40 A ROUND ROW / B SPRING POINT: rows ahead (+120 behind), cd x0.5, up to 3 more foes within 44 px, no repeat of the vaulted foe', () => {
  assert.equal(W.rowDirs(false, 1).length, 1); const rd = W.rowDirs(true, 1); assert.deepEqual(rd.map(r => r.dir), [1, -1]); assert.equal(rd[1].reach, 120);
  const foes = [{ x: 100, y: 0 }, { x: 110, y: 0 }, { x: 120, y: 5 }, { x: 128, y: 0 }, { x: 140, y: 0 }, { x: 160, y: 0 }, { x: 105, y: 80 }], he = foes[0];
  const t = W.springTargets(foes, he, true); assert.equal(t.length, 3); assert(!t.includes(he) && !t.includes(foes[6]) && !t.includes(foes[5])); assert.deepEqual(W.springTargets(foes, he, false), []);
  assert.equal(W.vaultCd(7, true, 0), 3.5); assert.equal(W.vaultCd(7, false, 0), 7); assert(Math.abs(W.vaultCd(7, true, 2) - 7 * 0.5 * 0.7) < 1e-9);
});
check('L45 RUN THROUGH: the nearest foe within 52 px past the first, on her line, once', () => {
  const foes = [{ x: 150, w: 12 }, { x: 175, w: 12 }, { x: 260, w: 12 }, { x: 120, w: 12 }];
  assert.equal(W.thruTarget(foes, 1, 140), foes[0]); assert.equal(W.thruTarget(foes.slice(1, 3), 1, 156), foes[1]); assert.equal(W.thruTarget([foes[2]], 1, 156), null, 'too far behind');
  assert.equal(W.thruTarget([foes[3]], 1, 140), null, 'behind her / before the first');
  assert.equal(W.thruTarget([{ x: 100, w: 12 }], -1, 130).x, 100, 'facing left');
});
check('upgrades: ranked multipliers move the right way', () => {
  assert.equal(W.bandGain(10, 2), 14); assert.equal(W.haftAfter(0), WID.band.after); assert.equal(W.haftAfter(2), WID.band.after + 1); assert.equal(W.deflectCost(9, 2), 7); assert.equal(W.deflectCost(9, 0), 9); assert(W.deflectCost(3, 2) >= 3);
  assert.equal(W.rowCd(16, 2), 16 * 0.7); assert.equal(W.upMul('long', 2), 1.24); assert.equal(W.upMul('tip', 5), 1.12, 'rank clamps'); assert.equal(W.upMul('jav', -1), 1);
});
check('L50 A THE LONG LINE reshapes the Reach; not owned = the old table exactly', () => {
  const K = { perHit: 1.0, final: 2.5 }; const base = W.reachNums(false, K); assert.deepEqual(base, { t: WID.reach.t, mul: WID.reach.mul, perHit: 1.0, finalLen: WID.reach.finalLen, final: 2.5 });
  const a = W.reachNums(true, K); assert(a.t > base.t && a.mul > base.mul && a.perHit < base.perHit && a.finalLen > base.finalLen && a.final > base.final);
  /* the trade: hits are lighter, the window longer; the whole cast stays within 1.5x of the old one on paper (hits x time) */
  assert(a.perHit * a.t / (base.perHit * base.t) <= 1.3, 'burst parity ' + (a.perHit * a.t / (base.perHit * base.t)));
});
check('L50 B THE GREAT JAVELIN: one blow + a burst; a boss/mini takes damage only; the cast is far shorter than the Reach on paper (the tune lane settles it)', () => {
  const s = W.greatBurst(false), b = W.greatBurst(true); assert(s.knock > 0 && s.stagger > 0); assert.equal(b.knock, 0); assert.equal(b.stagger, 0); assert.equal(s.k, b.k);
  const reachSwords = 6 * 2.5 * 1.0 * 2.0 + 2.5, greatSwords = W.WT.great.k + W.WT.great.splash;   /* ~2.5 thrusts/s at the max tip x2 vs. the one throw */
  assert(greatSwords < reachSwords, 'the throw is the lighter capstone on paper: ' + greatSwords + ' vs ' + reachSwords);
  assert(W.WT.great.range >= 300 && W.WT.great.speed > 400);
});
check('law: every new blow in main.js is swordDmg x k x amul (no flat hits), bosses get no new stagger or pin', () => {
  const body = name => { const i = MAIN.indexOf('function ' + name + '('); assert(i > 0, name); const j = MAIN.indexOf('\nfunction ', i + 10); return MAIN.slice(i, j > 0 ? j : i + 3000); };
  for (const n of ['wardenThrough', 'wardenSpring', 'greatHit', 'greatBurst']) { const b = body(n); const calls = b.match(/hurtAs\([^;]*;/g) || []; assert(calls.length > 0, n); for (const c of calls) assert(/swordDmg\(\) \*/.test(c) && /amul\(/.test(c), n + ': ' + c.slice(0, 90)); assert(!/pinFoe|floorFoe/.test(b), n + ' must not pin or floor'); }
  const keep = body('wardenKeepOff'); assert(/big|r\.recoil/.test(keep) && !/pinFoe|floorFoe|hurtAs/.test(keep), 'KEEP-OFF is a shove, never damage or a pin');
  const gh = body('greatHit'); assert(/!big/.test(gh), 'the great javelin only staggers the first foe when it is not a boss');
  assert(!/pinFoe/.test(body('greatBurst')));
});
check('wiring: the ultimate picks great / long line, the hud says so, the bot fires UP+C at a full band', () => {
  assert(MAIN.includes("if (tech('wgreat')) wardenGreatCast(); else wardenReachCast();")); assert(MAIN.includes("'GREAT JAVELIN: UP+C'") && MAIN.includes("'LONG LINE: UP+C'"));
  assert(MAIN.includes('const wrNums = () => WTK.reachNums(!!tech(\'wlongline\')'));
  assert(!MAIN.includes('function wardenReachCast() { P.wReachT = WID.reach.t') && !MAIN.includes('SKK.K_WARDEN_REACH.perHit * amul') && !MAIN.includes('SKK.K_WARDEN_REACH.final * amul'), 'the old table reads are gone');
  assert(/h === 'warden'\) return \(P\.vigil \|\| 0\) >= 100/.test(LAB) && /h === 'ranger' \|\| h === 'warden'\) && !threat/.test(LAB) && /h === 'warden'\) && !tell && !rushing/.test(LAB));
  assert(MAIN.includes("P.wGreat = !!tech('wgreat')"));
  /* the great spear cannot be stopped by the two-in-flight guard, and the twin waits in the hand */
  assert(MAIN.includes('if (j.wait > 0) { j.wait -= dt;') && MAIN.includes('if (j.great) { greatHit(j, e); return; }'));
});
check('a save with the kit: respec + picks owed still balance for the warden', () => {
  const p = { card: { warden: { v: 0, e: 0, m: 0, ms: {} } } }; for (const n of PR.TECH_LEVELS) { const o = PR.perkOffer(p, 'warden', n); assert(o[0].tech && o[0].rec); assert.equal(PR.pickMilestone(p, 'warden', n, o[0].id, 50), null); }
  assert.equal(PR.techOn(p, 'warden', 'wlongline'), true); assert(PR.forkLocked(p, 'warden', 'wgreat'));
  PR.validateProgress(JSON.parse(JSON.stringify(p))); PR.respecCard(p, 'warden'); assert.deepEqual(p.card.warden.ms, {});
  const q = { card: { warden: { v: 0, e: 0, m: 0, ms: {} } } }; PR.pickMilestone(q, 'warden', 25, 'wpoint', 50); PR.pickMilestone(q, 'warden', 30, 'wtwin', 50); PR.pickMilestone(q, 'warden', 35, 'wfar', 50); PR.pickMilestone(q, 'warden', 40, 'wspring', 50); PR.pickMilestone(q, 'warden', 45, 'wthrough', 50); PR.pickMilestone(q, 'warden', 50, 'wgreat', 50);
  for (const id of ['wpoint', 'wtwin', 'wfar', 'wspring', 'wthrough', 'wgreat']) assert(PR.techOn(q, 'warden', id), id); for (const id of ['wkeep', 'wring', 'wlongline']) assert(PR.forkLocked(q, 'warden', id), id);
});
if (bad.length) { console.log('WARDEN-TECH: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Warden tech: 3 fixed + 3 forks (pairs differ in role, one trade line, capstone pair), 8 upgrades, every rule with real numbers, every id wired in main.js, blows are swordDmg x k x amul, bosses never pinned or staggered by a new technique, the bot fires the ultimate');
