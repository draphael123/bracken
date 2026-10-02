// tools/cistern-queen.mjs - THE CISTERN QUEEN and THE GANG LEADER, held to their spec (claude/welltown3; Daniel's WELL TOWN BOSS CHANGE, 2026-10-02,
// docs/concepts/the-well-town.md). Node only: the pure fight (src/cistern-queen.js) is stepped against a fake world, no page.
//   EVERY MOVE IN THE SPEC IS BUILT AND TOLD   the moveset by phase, each move's mark in src/marks.js the same as its own MOVES row (! blockable, !! not),
//                                              the high ones in HEIGHT so a duck goes under them
//   EVERY CYCLE CHANGES                        no two cycles of a phase play the same order; every phase-1 cycle burrows, every phase-3 cycle grabs
//   SHE ALWAYS FIGHTS                          stepped for minutes alone, she is never idle more than her longest gap
//   HER OPENINGS ARE WATER                     a minute alone opens nothing; the three openings are >= 3 s; outside them her raised claws turn a frontal
//                                              blow, and from behind the global chip; one opening takes no more than CQ.openCap of her
//   THE GANG LEADER                            a mini: no charge, two swords (cuts told !), the whirl !!, the bottle reflectable, his opening capped at a third
// node tools/cistern-queen.mjs
import assert from 'node:assert/strict';
import * as CQG from '../src/cistern-queen.js';
import * as GLM from '../src/gang-leader.js';
import { MARK, HEIGHT, BY_HAND } from '../src/marks.js';
const { CQ, CYCLES, MOVES } = CQG;
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok  ' + m); };

/* THE SPEC'S MOVESET, by phase (the brief's names -> the fight's move keys) */
const SPEC = { 1: { 'Sand Strike': 'burrow:strike', 'Burrow Charge': 'burrow:charge', 'Pincer Snap': 'pincer', 'Snap-Snap-Lunge': 'snapsnap', 'Tail Lance': 'lance', 'Sand Flick': 'flick' },
  2: { 'Venom Spit': 'spit', 'Tail Sweep high': 'sweep:high', 'Tail Sweep low': 'sweep:low', 'Drop Pounce': 'pounce', 'Skitter Ambush': 'ambush', 'Wall Slam': 'slam', 'Stinger Pin': 'pin' },
  3: { 'Wave Thrash': 'wave', 'Grab and Sting': 'grab', 'Death Roll': 'roll', 'Tidal Tail': 'tidal', 'Brood Shield': 'brood' } };
for (const ph of [1, 2, 3]) { const used = new Set(CYCLES[ph].flat());
  for (const [name, k] of Object.entries(SPEC[ph])) ok(used.has(k), 'P' + ph + ' ' + name + ' (' + k + ') is in her phase-' + ph + ' cycles'); }
ok(CYCLES.enraged.includes('combo'), 'ENRAGED under ' + CQ.enrage * 100 + '%: SNAP-SNAP-STING into the DEATH ROLL (the combo) is in her enraged cycle');
/* TOLD: her own mark for every told mode is the marks table's (by hand and traced) */
for (const [mode, m] of Object.entries(MOVES)) { const k = 'cisternqueen|' + mode;
  ok(BY_HAND[k] === m.mark && MARK[k] === m.mark, k + ' wears ' + (m.mark || 'no mark') + ' (src/marks.js agrees)');
  if (m.h === 'high') ok(HEIGHT[k] === 'high', k + ' is HIGH: a duck goes under it'); }
/* EVERY CYCLE CHANGES */
for (const ph of [1, 2, 3]) { const keys = CYCLES[ph].map(c => c.join(',')); ok(new Set(keys).size === keys.length && keys.length >= 3, 'phase ' + ph + ': ' + keys.length + ' cycles, no two the same order'); }
ok(CYCLES[1].every(c => c.some(m => m.startsWith('burrow'))), 'every phase-1 cycle burrows (her opening is there to be had)');
ok(CYCLES[3].every(c => c.includes('grab')), 'every phase-3 cycle grabs (a broken grab is the flood\'s opening)');
ok(CYCLES[2].every(c => c[0].startsWith('wall:') && c.length >= 5), 'every phase-2 cycle opens on a wall, and stays long enough to climb to her ledge');

/* A FAKE WORLD: the hall's geometry, a hero standing still, every call recorded */
const A = { queen: { sx: 528, F: 56, vault: 40, top: 28, lr: 48 } }, G = CQG.geom(A, 16);
function run(secs, o = {}) {
  const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid + 60, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'wake', modeT: 1.6, open: 0, alive: true };
  const hero = [{ x: o.x ?? G.mid - 80, y: G.floor, ground: true, alive: true, onLedge: null, pp: { snare: 0 } }], seen = new Set(); let idle = 0, maxIdle = 0, maxOpen = 0;
  const c = { hit() {}, band() {}, number() {}, sound() {}, fx() {}, shake() {}, music() {}, mark() {}, water() {}, grab: () => null, free: () => true, holdAt() {}, release() {}, spawnBrood: (x, y) => ({ x, y, alive: true }), drown() {} };
  for (let t = 0; t < secs; t += 1 / 60) { if (o.hp) e.hp = o.hp(t, e); CQG.stepQueen(e, S, 1 / 60, hero, c); seen.add(e.mode);
    if (e.mode === 'walk' || e.mode === 'cling' || e.mode === 'hang') { idle += 1 / 60; maxIdle = Math.max(maxIdle, idle); } else idle = 0; maxOpen = Math.max(maxOpen, e.open || 0); }
  return { S, e, seen, maxIdle, maxOpen };
}
{ const r = run(120); ok(r.maxOpen === 0, 'two minutes of her left alone (phase one) opens nothing'); ok(r.maxIdle <= 1.6, 'SHE ALWAYS FIGHTS: never more than ' + r.maxIdle.toFixed(2) + ' s between blows'); ok(r.S.n.cycles >= 6, r.S.n.cycles + ' cycles in two minutes'); }
{ const r = run(120, { hp: () => 600 }); ok(r.S.ph === 2 && r.maxOpen === 0 && ['spitTell', 'sweepLowTell', 'slamTell', 'pinTell'].every(m => r.seen.has(m)), 'phase two: she takes to the walls (spit, sweeps, slam, pin), and left alone opens nothing'); }
{ const r = run(120, { hp: () => 300 }); ok(r.S.ph === 3 && r.S.flood && r.S.water > 10 && ['waveTell', 'grabTell', 'rollTell', 'tidalTell', 'broodTell'].every(m => r.seen.has(m)), 'phase three: the cistern floods and the waves, the grab, the roll, the tidal tail and the brood come'); }
{ const r = run(60, { hp: () => 100 }); ok(r.seen.has('barbTell'), 'enraged under 15%: the snap-snap-sting combo'); }
/* THE OPENINGS: each >= 3 s; the claws guard the front only, and only outside an opening */
ok(CQ.openT >= 3 && CQ.openCap > 0 && CQ.openCap <= 0.2, 'her openings last ' + CQ.openT + ' s (>= 3) and one takes no more than ' + CQ.openCap * 100 + '% of her');
{ const e = { x: 100, face: 1, mode: 'walk', open: 0 }; ok(CQG.guarded(e, 140) && !CQG.guarded(e, 40), 'outside an opening her raised claws turn a blow from the front, not one from behind');
  e.mode = 'soaked'; e.open = 2; ok(!CQG.guarded(e, 140) && CQG.qOpen(e), 'soaked, the front is open too'); }
{ const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'burrow', modeT: 2, open: 0, alive: true }; S.pose = 'burrow'; S.mound = { x: G.mid }; S.cur = {};
  const c = { number() {}, sound() {}, fx() {}, shake() {} };
  ok(CQG.pourAim(e, S, { x: G.mid - 30, y: G.floor, face: 1 }) && !CQG.pourAim(e, S, { x: G.mid - 30, y: G.floor, face: -1 }), 'a pour lands on her mound only when you face it, near it');
  ok(CQG.pourAt(e, S, { x: G.mid - 30, y: G.floor, face: 1 }, c) === 'open' && e.mode === 'soaked' && e.open >= 3, 'a pour on her mound floods her burrow: SOAKED, open');
  const S2 = CQG.newShow(G), e2 = { ...e, mode: 'cling', modeT: 1, open: 0 }; S2.pose = 'wall'; S2.wall = 'W'; S2.script = []; S2.step = 0;
  ok(!CQG.pourAim(e2, S2, { x: G.ledgeW[0] + 30, y: G.ledgeY, face: -1, onLedge: 'E' }) && CQG.pourAt(e2, S2, { x: G.ledgeW[0] + 30, y: G.ledgeY, face: -1, onLedge: 'W' }, c) === 'open' && e2.mode === 'fallen',
    'on her wall: a pour from THAT wall\'s ledge brings her down on her back (the other ledge does nothing)'); }
/* THE GANG LEADER */
{ const chains = Object.values(GLM.CHAINS).flat(), all = new Set(chains.flat());
  ok(!all.has('charge') && all.has('cut') && all.has('cross') && all.has('whirl') && all.has('throw'), 'THE GANG LEADER: two swords (the cut, the cross cut), the whirl, the molotov - and no charge');
  ok(new Set(chains.map(c => c.join(','))).size === chains.length, 'every one of his cycles is a different order');
  for (const [m, mk] of Object.entries(GLM.GL_MODES)) ok(BY_HAND['gangleader|' + m] === mk && MARK['gangleader|' + m] === mk, 'gangleader|' + m + ' wears ' + mk);
  ok(GLM.GL.openT >= 3 && GLM.GL.capK <= 1 / 3 + 1e-9 && GLM.GL.dodge > 0 && GLM.GL.dodge < 0.5 && GLM.GL.reflectR >= 12, 'his opening (burning) is ' + GLM.GL.openT + ' s, a third of him at most; he dodges now and then (' + GLM.GL.dodge * 100 + '%), and his bottle is easy to strike back (' + GLM.GL.reflectR + ' px)'); }
console.log('cistern-queen: ' + n + ' checks pass');
