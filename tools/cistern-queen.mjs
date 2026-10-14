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
const SPEC = { 1: { 'Stinger Slam': 'sslam', 'Sand Strike': 'burrow:strike', 'Burrow Charge': 'burrow:charge', 'Pincer Snap': 'pincer', 'Snap-Snap-Lunge': 'snapsnap', 'Tail Lance': 'lance', 'Sand Flick': 'flick' },
  /* (claude/underwell3, Daniel 10-07) THE STINGER SLAM in every phase */
  2: { 'Stinger Slam': 'sslam', 'Venom Spit': 'spit', 'Tail Sweep high': 'sweep:high', 'Tail Sweep low': 'sweep:low', 'Drop Pounce': 'pounce', 'Skitter Ambush': 'ambush', 'Wall Slam': 'slam', 'Stinger Pin': 'pin' },
  /* (claude/queen4, Daniel 10-07 - DESIGN CHANGE: the DEATH ROLL is replaced by THE VENOM BLOOM, P3's new move; the BROOD SHIELD is cut - no add summons in her fight) */
  3: { 'Stinger Slam': 'sslam', 'Wave Thrash': 'wave', 'Grab and Sting': 'grab', 'Venom Bloom': 'bloom', 'Tidal Tail': 'tidal' } };
for (const ph of [1, 2, 3]) { const used = new Set(CYCLES[ph].flat());
  for (const [name, k] of Object.entries(SPEC[ph])) ok(used.has(k), 'P' + ph + ' ' + name + ' (' + k + ') is in her phase-' + ph + ' cycles'); }
ok(CYCLES.enraged.includes('combo'), 'ENRAGED under ' + CQ.enrage * 100 + '%: SNAP-SNAP-STING into the VENOM BLOOM (the combo) is in her enraged cycle (claude/queen4: was into the death roll)');
/* (claude/queen4, Daniel 10-07) NO ADD SUMMONS, NO TUMBLE: nothing of the brood shield or the death roll is left in her fight */
ok(!Object.values(CYCLES).flat(2).some(m => m === 'brood' || m === 'roll') && !('broodTell' in MOVES) && !('rollTell' in MOVES) && !('cisternqueen|rollTell' in BY_HAND) && !('cisternqueen|broodTell' in BY_HAND) && !('cisternqueen|rollTell' in MARK),
  'no brood shield and no death roll in any cycle, move row or mark row');
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
  let spawned = 0; const c = { hit() {}, band() {}, number() {}, sound() {}, fx() {}, shake() {}, music() {}, mark() {}, water() {}, grab: () => null, free: () => true, holdAt() {}, release() {}, spawnBrood: (x, y) => { spawned++; return { x, y, alive: true }; }, drown() {} };
  /* (claude/queen4) HOW SHE MOVES, frame to frame, as drawn (S.view): the biggest step of her drawn body, of its turn, of its flip; how often she is hidden for one frame */
  const mo = { step: 0, rot: 0, sx: 0, sy: 0, blinks: 0, hidden: 0, at: '' }; let last = null;
  const drawn = () => !(S.pose === 'burrow' || S.pose === 'tunnel' || (e.gone > 0 && S.pose !== 'shaft' && e.mode !== 'pounce'));
  for (let t = 0; t < secs; t += 1 / 60) { if (o.hp) e.hp = o.hp(t, e); CQG.stepQueen(e, S, 1 / 60, hero, c); seen.add(e.mode);
    if (e.mode === 'walk' || e.mode === 'cling' || e.mode === 'hang') { idle += 1 / 60; maxIdle = Math.max(maxIdle, idle); } else idle = 0; maxOpen = Math.max(maxOpen, e.open || 0);
    const V = S.view, vis = drawn() && V.sink < CQ.sinkH - 1, p = CQG.framePoint(e, V, 0, -24);
    if (!vis) mo.hidden++; else { if (mo.hidden === 1) mo.blinks++; mo.hidden = 0; }
    if (vis && last && last.vis) { const d = Math.hypot(p.x - last.p.x, p.y - last.p.y); if (d > mo.step) { mo.step = d; mo.at = last.m + '>' + e.mode; }
      mo.rot = Math.max(mo.rot, Math.abs(V.rot - last.rot)); mo.sx = Math.max(mo.sx, Math.abs(V.sx - last.sx)); mo.sy = Math.max(mo.sy, Math.abs(V.sy - last.sy)); }
    last = { vis, p, rot: V.rot, sx: V.sx, sy: V.sy, m: e.mode }; }
  return { S, e, seen, maxIdle, maxOpen, spawned, mo };
}
/* (claude/queen4, Daniel 10-07: "her animations jumping around look really awkward") NOTHING POPS: drawn, frame to frame, her body never jumps (a pounce out of the shaft
   is her fastest motion), never snaps a turn or a flip, and is never hidden for a single frame (no e.gone flicker) - in every phase */
for (const [ph, hp] of [[1, null], [2, 600], [3, 300]]) { const r = run(120, hp ? { hp: () => hp } : {}), m = r.mo;
  ok(m.step <= 45 && m.rot <= 0.33 && m.sx <= 0.25 && m.sy <= 0.2 && m.blinks === 0, 'phase ' + ph + ': nothing pops - her drawn body moves at most ' + m.step.toFixed(1) + ' px a frame (' + m.at + '), turns ' + m.rot.toFixed(2) + ' rad, flips ' + m.sx.toFixed(2) + '/' + m.sy.toFixed(2) + ' a frame; one-frame vanishings: ' + m.blinks); }
{ const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid, y: G.floor, hp: 600, maxHp: 1000, face: -1, mode: 'walk', modeT: 0, open: 0, alive: true }; S.ph = 2; S.script = ['wall:W', 'spit', 'wall:E', 'spit', 'shaft', 'pounce']; S.step = 0;
  const c = { hit() {}, band() {}, number() {}, sound() {}, fx() {}, shake() {}, music() {}, mark() {}, water() {}, grab: () => null, free: () => true, holdAt() {}, release() {} };
  const hero = [{ x: G.mid + 100, y: G.floor, ground: true, alive: true, onLedge: null, pp: { snare: 0 } }], legs = [];
  for (let t = 0; t < 14; t += 1 / 60) { CQG.stepQueen(e, S, 1 / 60, hero, c); if (legs[legs.length - 1] !== e.mode) legs.push(e.mode); }
  const str = legs.join(' ');
  ok(/crawl climb/.test(str) && /descend crawl climb/.test(str) && /crawl leap pounceTell/.test(str) && /pounce/.test(str), 'she is SEEN to get about: scuttles to a wall and backs up it, climbs down it to cross to the other, scuttles under the shaft and leaps into it (' + str.replace(/ (spitTell|spit|cling|hang)(?= )/g, '').slice(0, 160) + ')'); }
{ const r = run(120); ok(r.maxOpen === 0, 'two minutes of her left alone (phase one) opens nothing'); ok(r.maxIdle <= 1.6, 'SHE ALWAYS FIGHTS: never more than ' + r.maxIdle.toFixed(2) + ' s between blows'); ok(r.S.n.cycles >= 6, r.S.n.cycles + ' cycles in two minutes'); }
{ const r = run(120, { hp: () => 600 }); ok(r.S.ph === 2 && r.maxOpen === 0 && ['spitTell', 'sweepLowTell', 'slamTell', 'pinTell'].every(m => r.seen.has(m)), 'phase two: she takes to the walls (spit, sweeps, slam, pin), and left alone opens nothing'); }
{ const r = run(120, { hp: () => 300 }); ok(r.S.ph === 3 && r.S.flood && r.S.water > 10 && ['waveTell', 'grabTell', 'bloomTell', 'bloom', 'bloomBurst', 'tidalTell'].every(m => r.seen.has(m)), 'phase three: the cistern floods and the waves, the grab, the VENOM BLOOM and the tidal tail come (claude/queen4: was the roll and the brood)');
  ok(r.spawned === 0 && !r.seen.has('broodTell') && !r.seen.has('rollTell') && !r.seen.has('roll'), 'and she calls no brood and never rolls (Daniel 10-07)'); }
{ const r = run(60, { hp: () => 100 }); ok(r.seen.has('barbTell') && r.seen.has('bloomTell'), 'enraged under 15%: the snap-snap-sting combo, into the VENOM BLOOM'); }
/* (claude/queen4, Daniel 10-07) THE VENOM BLOOM: told (the word, a red !!, the ring drawn from the first frame), the stinger driven into the water and EXPOSED while the slick
   spreads (a short opening: x stingMul, one sting's cap), the ring's edge growing to its size, then the bloom - on whoever is in the ring on the floor, not on a ledge or outside */
{ const one = (hx, hy) => { const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid, y: G.floor, hp: 300, maxHp: 1000, face: 1, mode: 'walk', modeT: 0, open: 0, alive: true }; S.ph = 3; S.flood = true; S.water = CQ.waterH; S.script = ['bloom']; S.step = 0;
    const said = [], marks = [], hits = []; const c = { hit: (b, d, n, o) => { if (n === CQG.MOVE_NAME.bloom && hx >= b[0] && hx <= b[1] && hy > b[2] && hy - 20 < b[3] && !hits.some(q => q.key === o.key)) hits.push({ d, venom: o && o.venom, key: o.key }); }   /* (a blow is keyed once: the world's c.hit) */, band() {}, number: (x, y, t) => said.push(t), sound() {}, fx() {}, shake() {}, music() {}, mark: m => marks.push(m), water() {}, grab: () => null, free: () => true, holdAt() {}, release() {} };
    const hero = [{ x: hx, y: hy, ground: true, alive: true, onLedge: hy < G.floor - 40 ? 'W' : null, pp: { snare: 0 } }], o = { told: 0, ringAtTell: false, exposed: 0, ks: [], stBig: null };
    for (let t = 0; t < 4; t += 1 / 60) { CQG.stepQueen(e, S, 1 / 60, hero, c); if (e.mode === 'bloomTell') { o.told += 1 / 60; if (S.bloom && S.bloom.R === CQ.bloomR) o.ringAtTell = true; }
      if ((e.mode === 'bloom' || e.mode === 'bloomBurst') && CQG.stingerOut(S) && S.stinger.k === 'bloom') { o.exposed += 1 / 60; o.stBig = !!S.stinger.big; }
      if (e.mode === 'bloom' && S.bloom) o.ks.push(S.bloom.k); if (e.mode === 'walk' && o.exposed > 0) break; }
    return { S, e, said, marks, hits, o }; };
  const near = one(G.mid + 40, G.floor), r = near;
  ok(r.said.includes('VENOM BLOOM: OUT OF THE RING BEFORE IT BLOOMS') && r.marks.includes('!!') && r.o.told >= CQ.bloomTell - 0.02 && CQ.bloomTell >= 0.75 && r.o.ringAtTell, 'THE VENOM BLOOM is told: the word, a red !! (no shield takes it), ' + CQ.bloomTell + ' s, and its ring is drawn from the first frame (' + CQ.bloomR + ' px either side)');
  const ks = r.o.ks; ok(ks.length > 20 && ks[0] < 0.1 && ks[ks.length - 1] > 0.95 && ks.every((k, i) => !i || k >= ks[i - 1]), 'the slick SPREADS from the stinger to its ring over ' + CQ.bloomSpread + ' s - its edge grows (' + ks[0].toFixed(2) + ' to ' + ks[ks.length - 1].toFixed(2) + ')');
  ok(r.o.exposed >= CQ.bloomSpread && r.o.exposed <= CQ.bloomSpread + CQ.bloomT + CQ.bloomPull + 0.1 && r.o.stBig === false && CQ.stingCap <= 0.07, 'while the stinger is in the water it is EXPOSED ' + r.o.exposed.toFixed(1) + ' s (a gold ring on it: a blow there x' + CQ.stingMul + ', one sting\'s cap - ' + CQ.stingCap * 100 + '% of her)');
  ok(r.hits.length === 1 && r.hits[0].venom === 2 && !(r.e.open > 0), 'it BLOOMS on a hero still in the ring (once, two stacks of venom) - and opens nothing of her');
  const out = one(G.mid + CQ.bloomR + CQ.bloomReach + 30, G.floor), up = one(G.mid + 40, G.ledgeY);
  ok(out.hits.length === 0 && up.hits.length === 0, 'out of the ring, or up on a ledge over it, the bloom does not reach you'); }
/* THE OPENINGS: each >= 3 s; the claws guard the front only, and only outside an opening */
ok(CQ.openT >= 3 && CQ.openCap > 0 && CQ.openCap <= 0.2, 'her openings last ' + CQ.openT + ' s (>= 3) and one takes no more than ' + CQ.openCap * 100 + '% of her');
{ const e = { x: 100, face: 1, mode: 'walk', open: 0 }; ok(CQG.guarded(e, 140) && !CQG.guarded(e, 40), 'outside an opening her raised claws turn a blow from the front, not one from behind');
  e.mode = 'soaked'; e.open = 2; ok(!CQG.guarded(e, 140) && CQG.qOpen(e), 'soaked, the front is open too'); }
{ const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'burrow', modeT: 2, open: 0, alive: true }; S.pose = 'burrow'; S.mound = { x: G.mid }; S.cur = {};
  const c = { number() {}, sound() {}, fx() {}, shake() {} };
  ok(CQG.pourAim(e, S, { x: G.mid - 30, y: G.floor, face: 1 }) && !CQG.pourAim(e, S, { x: G.mid - 30, y: G.floor, face: -1 }), 'a pour lands on her mound only when you face it, near it');
  ok(CQG.pourAt(e, S, { x: G.mid - 30, y: G.floor, face: 1 }, c) === 'open' && e.mode === 'slip' && e.open >= 3 && S.stinger && S.stinger.big && S.stinger.t >= 3, 'a pour on her mound wets the sand she comes up through: she SLIPS - open, her stinger flung out on the floor (claude/underwell3: Daniel 10-07 design change, was SOAKED; the bucket still soaks her)');
  const S2 = CQG.newShow(G), e2 = { ...e, mode: 'cling', modeT: 1, open: 0 }; S2.pose = 'wall'; S2.wall = 'W'; S2.script = []; S2.step = 0;
  ok(!CQG.pourAim(e2, S2, { x: G.ledgeW[0] + 30, y: G.ledgeY, face: -1, onLedge: 'E' }) && CQG.pourAt(e2, S2, { x: G.ledgeW[0] + 30, y: G.ledgeY, face: -1, onLedge: 'W' }, c) === 'open' && e2.mode === 'fallen',
    'on her wall: a pour from THAT wall\'s ledge brings her down on her back (the other ledge does nothing)'); }
/* (claude/underwell3, Daniel 10-07: "I wanted her STINGER to be the VULNERABLE part") HER STINGER, THE SLAM, THE FIRE, THE SLIP */
{ const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, face: 1, mode: 'walk', modeT: 1, open: 0, alive: true };
  const tp = CQG.tipOf(e, S); ok(tp && tp.y < G.floor - 50 && tp.y > G.floor - 100 && Math.abs(tp.x - e.x) < 30, 'her stinger is always somewhere a blow can find (curled over her back: ' + (tp ? Math.round(tp.x - e.x) + ',' + Math.round(tp.y - G.floor) : '-') + ' from her feet - a jump and a cut)');
  S.pose = 'wall'; S.wall = 'W'; e.mode = 'cling'; e.x = G.x0 + 20; e.y = G.floor - 4; const tw = CQG.tipOf(e, S); ok(tw && tw.x > G.x0 + 40 && tw.y > G.floor - 110, 'up on her wall the stinger hangs out over the hall, in a jump\'s reach (' + (tw ? Math.round(tw.x - G.x0) + ',' + Math.round(tw.y - G.floor) : '-') + ')');
  S.pose = 'burrow'; e.mode = 'burrow'; ok(!CQG.tipOf(e, S), 'under the sand there is no stinger to cut'); }
{ const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'walk', modeT: 0, open: 0, alive: true }; S.script = ['sslam']; S.step = 0; S.ph = 1;
  const said = [], marks = []; let hit = 0; const c = { hit: (b, d, n) => { if (n === CQG.MOVE_NAME.sslam) hit++; }, band() {}, number: (x, y, t) => said.push(t), sound() {}, fx() {}, shake() {}, music() {}, mark: m => marks.push(m), water() {}, grab: () => null, free: () => true, holdAt() {}, release() {}, spawnBrood: () => null, drown() {} };
  const hero = [{ x: G.mid - 90, y: G.floor, ground: true, alive: true, onLedge: null, pp: { snare: 0 } }]; let planted = 0, maxSt = 0;
  for (let t = 0; t < 6; t += 1 / 60) { CQG.stepQueen(e, S, 1 / 60, hero, c); if (e.mode === 'planted') planted += 1 / 60; if (S.stinger && S.stinger.big) maxSt = Math.max(maxSt, S.stinger.t); if (e.mode === 'walk' && planted > 0) break; }
  ok(said.includes('STINGER SLAM: OFF THE RED RING, THEN CUT IT') && marks.includes('!!') && hit > 0 && CQ.sslamTell >= 0.75, 'THE STINGER SLAM is told: the word, a red !! (no shield takes it), ' + CQ.sslamTell + ' s, the spot on the floor - and it strikes there');
  ok(planted >= 2 && planted <= 3.2 && maxSt >= 2 && CQ.plantR > CQ.stingR, 'then the stinger STAYS PLANTED ' + planted.toFixed(1) + ' s - a big target (' + CQ.plantR + ' px)'); ok(!(e.open > 0), 'the slam opens nothing else: it is her stinger you cut'); }
{ const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'walk', modeT: 1, open: 0, alive: true }; S.script = ['pincer', 'flick']; S.step = 0; S.ph = 1;
  let lit = false; const said = []; const c = { hit() {}, band() {}, number: (x, y, t) => said.push(t), sound() {}, fx() {}, shake() {}, music() {}, mark() {}, water() {}, grab: () => null, free: () => true, holdAt() {}, release() {}, spawnBrood: () => null, drown() {}, fire: x => lit && Math.abs(x - G.mid) < 30 };
  const hero = [{ x: G.mid - 200, y: G.floor, ground: true, alive: true, onLedge: null, pp: { snare: 0 } }]; for (let i = 0; i < 30; i++) CQG.stepQueen(e, S, 1 / 60, hero, c); ok(!CQG.qScorched(e), 'no fire, no scorch');
  lit = true; let modes = new Set(), sc = 0; for (let t = 0; t < 9; t += 1 / 60) { e.x = G.mid; CQG.stepQueen(e, S, 1 / 60, hero, c); if (CQG.qScorched(e)) { sc += 1 / 60; modes.add(e.mode); lit = false; } }
  ok(sc >= CQ.scorchT - 0.1 && said.includes('THE FIRE CRACKS HER SHELL: CUT HER ANYWHERE') && !(e.open > 0), 'fire on her oil touches her: SCORCHED ' + sc.toFixed(1) + ' s, told - and it is not a stun: she is never down for it');
  ok([...modes].some(m => /Tell$/.test(m) || m === 'pincer'), 'scorched, she FIGHTS ON (' + [...modes].join(',') + ')'); ok(S.ward > 0 || S.n.wards > 0, 'and after it, her told ward (B3)'); }
/* THE GANG LEADER */
{ const chains = Object.values(GLM.CHAINS).flat(), all = new Set(chains.flat());
  ok(!all.has('charge') && all.has('cut') && all.has('cross') && all.has('whirl') && all.has('throw'), 'THE GANG LEADER: two swords (the cut, the cross cut), the whirl, the molotov - and no charge');
  ok(new Set(chains.map(c => c.join(','))).size === chains.length, 'every one of his cycles is a different order');
  for (const [m, mk] of Object.entries(GLM.GL_MODES)) ok(BY_HAND['gangleader|' + m] === mk && MARK['gangleader|' + m] === mk, 'gangleader|' + m + ' wears ' + mk);
  ok(GLM.GL.openT >= 3 && GLM.GL.capK <= 1 / 3 + 1e-9 && GLM.GL.dodge > 0 && GLM.GL.dodge < 1 && GLM.GL.recoverT >= 0.3 && GLM.GL.reflectR >= 12, 'his opening (burning) is ' + GLM.GL.openT + ' s, a third of him at most; he slips ' + GLM.GL.dodge * 100 + '% of the blows while he stalks you (never off balance: ' + GLM.GL.recoverT + ' s after each of his blows), and his bottle is easy to strike back (' + GLM.GL.reflectR + ' px)'); }
/* THE GANG LEADER'S WATER (claude/welltown5, Daniel 10-03): his hands stepped against a fake world - a puddle in his path trips him (down, every blow
   whole); burning, a puddle puts him out; his fire catches you and a pour on yourself puts it out; burning blows land x1.5 up to the cap; the dodge is rare */
{ const said = [], mini = { x0: 0, x1: 640, floor: 400, well: 300, boss: 'gangleader' }, hero = { x: 100, y: 400, face: 1, ground: true, hp: 200, maxHp: 200, dead: false, skin: { sips: 3, max: 3 } };
  let foe = null; const ctx = { L: { mini }, players: [hero], TS: 16, EHP: { gangleader: GLM.GL.hp }, sfx: {}, hero: () => hero, enemies: () => (foe ? [foe] : []), time: () => 0,
    number: (x, y, t) => said.push(t), text() {}, burst() {}, sparks() {}, dust() {}, shake() {}, damagePlayer: (x, d) => { hero.hp -= d; }, asPlayer: (p, fn) => fn(), upright: () => true,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 20, b: b.y }), attackBox: () => null, enrage() {}, music() {} };
  const H = GLM.makeGangLeaderHands(ctx); foe = H.spawn({ x: 400, y: 400, alive: true }); foe.alive = true;
  for (let i = 0; i < 120; i++) H.update(foe, 1 / 60);                      /* awake: he walks at you */
  ok(said.includes('WET GROUND SLOWS HIM: POUR TO PEN HIM IN') && hero.skin.sips === 3, 'his fight starts told (WET GROUND SLOWS HIM) and with a full skin');
  const a = H.pourable.aim(hero); ok(a && a.what === 'floor' && Math.abs(a.x - (hero.x + GLM.GL.pourAt)) < 1, 'a pour in his courtyard aims at the floor a step in front of you (the HUD says POUR)');
  H.pourable.pour(hero); ok(H.fight().puddles.length === 1 && said.includes('MUD: HE STOPS AT ITS EDGE. A DASH SLIPS HIM'), 'it leaves a told puddle (mud)');
  /* MUD (claude/glhotfix): walking, he stops at the edge of a puddle and stays out of it; slowed inside; a DASH through it still slips him */
  foe.mode = 'walk'; foe.modeT = 99; foe.x = 400; hero.x = 100; for (let i = 0; i < 400; i++) { H.update(foe, 1 / 60); foe.modeT = 99; if (foe.mode !== 'walk') foe.mode = 'walk'; }
  const q0 = H.fight().puddles[0]; ok(q0 && foe.x > q0.x + GLM.GL.puddleR && foe.x < q0.x + GLM.GL.puddleR + 8 && foe.mode === 'walk', 'walking, he STOPS at the puddle edge (x ' + Math.round(foe.x) + ', puddle ' + Math.round(q0 ? q0.x : 0) + ') and does not step in');
  foe.x = q0.x + 6; const x0 = foe.x; H.update(foe, 1 / 60); ok(Math.abs(foe.x - x0) < GLM.GL.walk / 60 * GLM.GL.mudSlow + 0.01, 'inside the mud he is slowed to x' + GLM.GL.mudSlow);
  foe.x = 200; foe.mode = 'dash'; foe.modeT = 0.5; foe.face = -1; let slipped = false; for (let i = 0; i < 200 && !slipped; i++) { H.update(foe, 1 / 60); slipped = foe.mode === 'slipped'; }
  ok(slipped && said.includes('HE SLIPS: CUT HIM') && !H.fight().puddles.some(q => !q.dead), 'a DASH through it SLIPS him (told), and the puddle is spent');
  ok(GLM.GL.puddleT >= 8 && GLM.GL.puddleT <= 10 && GLM.GL.hp === 1500, 'the puddle lasts ' + GLM.GL.puddleT + ' s and he is a mini (' + GLM.GL.hp + ' hp)');
  ok(H.take(foe, 10, hero.x) === 10, 'down, he takes a blow whole');
  for (let i = 0; i < 200 && foe.mode === 'slipped'; i++) H.update(foe, 1 / 60); ok(foe.mode !== 'slipped', 'and he is up again in ' + GLM.GL.slipT + ' s');
  H.lightForTest(foe); ok(GLM.glOpen(foe) && H.take(foe, 10, hero.x) === 10 * GLM.GL.openMul, 'alight, a blow lands x' + GLM.GL.openMul);
  { const x0 = foe.x; for (let i = 0; i < 90 && GLM.glOpen(foe); i++) H.update(foe, 1 / 60); ok(GLM.glOpen(foe) && foe.x === x0 && foe.mode === 'burning', 'burning he is ROOTED: he stands beating at the flames (no step, no back-pedal)'); }
  H.lightForTest(foe);
  H.lightForTest(foe); H.puddleAt(foe.x + 20); for (let i = 0; i < 120 && GLM.glOpen(foe); i++) H.update(foe, 1 / 60);
  ok(!GLM.glOpen(foe) && said.includes('THE WATER PUTS HIM OUT') && H.fight().n.doused === 1, 'burning, a puddle under him PUTS HIM OUT (told)');
  hero.glBurn = 1; const s = H.pourable.aim(hero); ok(s && s.what === 'self' && H.pourable.pour(hero) === 'self' && !(hero.glBurn > 0) && said.includes('THE WATER PUTS YOU OUT'), 'alight yourself, the pour goes over you and puts you out');
  ok(GLM.GL.dodge <= 0.25 && GLM.GL.dodgeCd >= 4, 'the dodge is rare (' + GLM.GL.dodge * 100 + '%, once in ' + GLM.GL.dodgeCd + ' s at most): he is open to your blows otherwise'); }
/* THE VENOM ICON (claude/welltown-polish, src/venom-hud.js): a drop a stack under the stamina bar, the stacks as the hands keep them (P.cqVenom), the cap, the slow */
{ const { venomIcon, drawVenomIcon, VENOM_HUD } = await import('../src/venom-hud.js'), V = CQ.venom;
  ok(VENOM_HUD.max === V.max && VENOM_HUD.stackT === V.t, 'the venom icon holds as many drops as her venom stacks (' + V.max + ') and a drop empties over the whole clock of a stack (' + V.t + ' s)');
  ok(venomIcon({ cqVenom: [], venomT: 0 }, V) === null && venomIcon(null, V) === null, 'a clean hero shows no icon (nothing under the bar)');
  const one = venomIcon({ cqVenom: [6], venomT: 1.2, venomSlow: 1 - V.slow }, V), three = venomIcon({ cqVenom: [2, 6, 4, 5], venomT: 1.2, venomSlow: 0.25 }, V), plain = venomIcon({ cqVenom: [], venomT: 1.5, venomSlow: 1 }, V);
  ok(one && one.stacks === 1 && one.drops[0] === 1 && one.slow === 25 && one.slots === V.max, 'one stack: one full drop, the slowdown said (-25%), the other slots dark');
  ok(three && three.stacks === V.max && three.drops.length === V.max && three.drops[0] >= three.drops[1] && three.drops[1] >= three.drops[2] && three.slow === 75, 'a fourth stack changes nothing: three drops, the freshest first, -75%');
  ok(plain && plain.stacks === 1 && plain.mode === 'plain' && plain.slow === 0 && plain.drops[0] < 1, 'any other poison (P.venomT) is ONE draining drop and no slowdown');
  const ops = []; const g = { fillRect: (...a) => ops.push(a), set fillStyle(v) {}, set globalAlpha(v) {} }, said = [];
  drawVenomIcon(g, (t, ...r) => said.push(t), 16, 21, three, 0); ok(ops.length > 60 && said.join() === '-75%' && ops.every(([x, y]) => y >= 20 && y <= 28 && x >= 16), 'it draws in the gap under the stamina bar (rows 20-28) and says -75%'); }
/* ================= THE REWORK (claude/cqueenrework, Daniel's 10-13 playtest) =================
   1. FIRE AND WATER, ONE LOOP: HOT (fire) / DOUSED (water) / STEAM (water on her HOT) - told, timed, and the pyro's own fire lights her no oftener than a torch
   2. THE WELLHEAD: wherever she perches there is a beam under her (no more hung on nothing), a rope up to it, and a pour from it or the bucket brings her down
   3. HER STINGER: always hittable, armoured (x0.4, told) outside her openings, x1.75 stuck/HOT, a PURSE a phase on what lands; spent, it BREAKS - her stinger moves gone for the phase */
const quietC = (said = [], marks = [], o = {}) => ({ hit() {}, band() {}, number: (x, y, t) => said.push(t), sound() {}, fx() {}, shake() {}, music() {}, mark: m => marks.push(m), water() {}, grab: () => null, free: () => true, holdAt() {}, release() {}, ...o });
const fresh = (o = {}) => { const S = CQG.newShow(G), e = { t: 'cisternqueen', x: G.mid - 120, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'walk', modeT: 0.2, open: 0, alive: true, ...o }; S.script = []; S.step = 0; return { S, e }; };
const hero0 = (x = G.mid - 260) => [{ x, y: G.floor, ground: true, alive: true, onLedge: null, pp: { snare: 0 } }];
/* 1a. HOT: fire under her - told, timed, her body whole from any side; her stinger tells slower; burnt out: her ward and a BLACKENED shell no fire takes (told) until it clears */
{ const { S, e } = fresh(); S.ph = 1; S.script = ['lance', 'lance', 'lance', 'lance', 'lance', 'lance']; let lit = true; const said = [];
  const c = quietC(said, [], { fire: x => lit && Math.abs(x - e.x) < 40 }); const tells = []; let hot = 0, sawWard = false, refusedAt = -1, relit = -1, t = 0;
  for (; t < 30; t += 1 / 60) { const m0 = e.mode, T0 = e.modeT; e.x = G.mid - 120; CQG.stepQueen(e, S, 1 / 60, hero0(), c); if (e.mode === 'lanceTell' && m0 !== 'lanceTell') tells.push({ hot: CQG.qHot(S), t: e.modeT });
    if (CQG.qHot(S)) hot += 1 / 60; if (S.ward > 0 && hot > 0) sawWard = true; if (S.charT > 0 && refusedAt < 0 && said.includes('HER SHELL IS BLACKENED: NOT YET')) refusedAt = t; if (refusedAt > 0 && relit < 0 && CQG.qHot(S)) relit = t; }
  const th = tells.find(q => q.hot), tc = tells.find(q => !q.hot);
  ok(said.includes('THE FIRE CRACKS HER SHELL: CUT HER ANYWHERE') && said.includes('HOT: WATER ON HER NOW CRACKS HER OPEN') && CQG.qScorched(e) !== undefined, 'HOT is told: the fire cracks her shell, and the next step is said (water on her now cracks her open)');
  ok(th && tc && Math.abs(th.t / tc.t - CQ.hotTellK) < 0.05, 'HOT, her stinger tells come slower (x' + CQ.hotTellK + ': ' + (th ? th.t.toFixed(2) : '-') + ' s against ' + (tc ? tc.t.toFixed(2) : '-') + ' s cold)');
  ok(sawWard && said.includes('SHE BURNS OUT: HER SHELL BLACKENS'), 'she burns out after ' + CQ.scorchT + ' s: told, and her ward (B3)');
  ok(refusedAt > 0 && relit > refusedAt && relit - refusedAt >= CQ.charT - CQ.wardT - 1, 'BLACKENED: fire under her again does not take her (told: HER SHELL IS BLACKENED) - it takes her again only once it clears (' + (relit - refusedAt).toFixed(1) + ' s later; charT ' + CQ.charT + ')'); }
/* 1b. THE PYRO'S OWN FIRE: the same rule - HOT once, then not again while she is blackened or wet */
{ const { S, e } = fresh(); const c = quietC(); ok(CQG.fireOn(e, S, c, 'hero') && S.scorchWhy === 'hero' && CQG.qHot(S), 'a hero\'s own fire (the pyro) makes her HOT, as a torch\'s does');
  S.scorch = 0; S.charT = CQ.charT; ok(!CQG.fireOn(e, S, c, 'hero'), 'and not again while her shell is blackened'); S.charT = 0; S.wet = 3; ok(!CQG.fireOn(e, S, c, 'hero') && !CQG.hotOK(e, S), 'nor while she is wet (the firebreak)');
  ok(CQ.charT + CQ.scorchT >= 14 && CQ.scorchT <= 7, 'so HOT is at most ' + CQ.scorchT + ' s in every ' + (CQ.charT + CQ.scorchT + CQ.wardT) + ' or so - the pyro\'s fire does not trivialise her'); }
/* 1c. DOUSED: a pour on her from the floor - told; she slows (tells, walk); no fire takes her; her burrow floods (she dives and SLIPS: open); it dries, told */
{ const { S, e } = fresh({ face: -1, x: G.mid }); S.ph = 1; const said = [], c = quietC(said, [], { fire: x => true });
  const h = { x: G.mid + 60, y: G.floor, face: -1, onLedge: null }; const a = CQG.pourAim(e, S, h);
  ok(a && a.what === 'shell' && CQG.pourAt(e, S, h, c) === 'douse' && CQG.qWet(S) && !(e.open > 0) && said.includes('DOUSED: SHE SLOWS, AND HER SAND IS WET'), 'a pour on her from the floor DOUSES her (told) - it opens nothing by itself');
  ok(CQG.pourAim(e, S, h) === null, 'already dripping, a second pour finds nothing to do (E is never spent on her for nothing)');
  S.script = ['lance']; S.step = 0; e.mode = 'walk'; e.modeT = 0; CQG.stepQueen(e, S, 1 / 60, hero0(), c); ok(e.mode === 'lanceTell' && Math.abs(e.modeT - CQ.lanceTell * CQ.wetTellK) < 0.05, 'DOUSED she tells slower (x' + CQ.wetTellK + ')');
  ok(!CQG.qHot(S) && said.includes('SHE IS WET: THE FIRE WILL NOT TAKE HER'), 'and the fire under her does not take her while she drips (told)');
  const { S: S2, e: e2 } = fresh({ x: G.mid - 100 }); S2.ph = 1; S2.wet = 5; S2.script = ['burrow:strike']; const said2 = []; let slip = false; for (let t = 0; t < 3 && !slip; t += 1 / 60) { CQG.stepQueen(e2, S2, 1 / 60, hero0(), quietC(said2)); slip = e2.mode === 'slip'; }
  ok(slip && e2.open >= 3 && said2.includes('HER BURROW FLOODS: SHE SLIPS. CUT HER'), 'DOUSED, HER BURROW FLOODS: she dives into wet sand and comes up SLIPPING - open ' + e2.open.toFixed(1) + ' s');
  const { S: S3, e: e3 } = fresh(); S3.wet = 0.1; const said3 = []; for (let i = 0; i < 20; i++) CQG.stepQueen(e3, S3, 1 / 60, hero0(), quietC(said3)); ok(!CQG.qWet(S3) && said3.includes('SHE DRIES: THE FIRE CAN TAKE HER AGAIN'), 'and she dries in ' + CQ.douseT + ' s, told'); }
/* 1d. STEAM: water on her while she is HOT - the big opening, then DOUSED */
{ const { S, e } = fresh({ x: G.mid, face: -1 }); const said = [], c = quietC(said); CQG.scorchUp(e, S, c); const h = { x: G.mid + 60, y: G.floor, face: -1, onLedge: null };
  ok(CQG.pourAim(e, S, h).what === 'steam' && CQG.pourAt(e, S, h, c) === 'open' && e.mode === 'soaked' && e.openWhy === 'steam' && e.open >= 3 && said.includes('STEAM: HER HOT SHELL CRACKS. CUT HER'), 'HOT THEN WATER = STEAM: she is SOAKED, open ' + e.open.toFixed(1) + ' s (told)');
  ok(!CQG.qHot(S) && CQG.qWet(S) && S.charT > 0, 'and after the steam she is DOUSED and blackened - no fire at once (the loop goes round again)'); }
/* 2. THE WELLHEAD: a beam in her hall under the shaft, a rope up it; she perches ON it (upright, not hung on nothing); the bucket and a pour from the beam bring her down */
{ const T = { AIR: 0, SOLID: 1, ONEWAY: 2, NET: 3 }, grid = new Map(), ents = []; const W = { set: (x, y, t) => grid.set(x + ',' + y, t), block() {}, ent: (t, x, y, o) => ents.push({ t, x, y, ...o }), air: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) grid.set(x + ',' + y, T.AIR); } };
  const st = CQG.stageCisternQueen(W, T, 16, 100, 60, 30), q = st.arena.queen, G2 = CQG.geom(st.arena, 16), beamTiles = []; for (let x = 100 + CQG.STAGE.beam[0]; x <= 100 + CQG.STAGE.beam[1]; x++) beamTiles.push(grid.get(x + ',' + q.lr));
  const rope = st.ladders.find(l => l[0] === 100 + CQG.STAGE.beam[0]);
  ok(beamTiles.length >= 10 && beamTiles.every(t => t === T.ONEWAY) && G2.beam[0] < G2.shaft[0] && G2.beam[1] > G2.shaft[1] && G2.beamY === q.lr * 16, 'THE WELLHEAD: a beam of ' + beamTiles.length + ' tiles across the sump under the shaft, at the ledges\' height (you stand on it)');
  ok(rope && rope[1] === q.lr && rope[2] === 59, 'a rope from the floor up to its west end (every hero climbs to it with base movement)');
  const { S, e } = fresh({ x: G.mid + 120 }); S.ph = 2; S.script = ['shaft', 'spit', 'sweep:low', 'pounce']; S.step = 0; const c = quietC(); let onBeam = 0, rotMax = 0, minY = 1e9, maxPerch = 0;
  for (let t = 0; t < 10; t += 1 / 60) { CQG.stepQueen(e, S, 1 / 60, hero0(G.mid + 200), c); if (S.pose === 'shaft' && (e.mode === 'spitTell' || e.mode === 'spit' || e.mode === 'hang' || /sweep/.test(e.mode) || e.mode === 'pounceTell')) { onBeam += 1 / 60; maxPerch = Math.max(maxPerch, Math.abs(e.y - G.beamY)); rotMax = Math.max(rotMax, Math.abs(S.view.rot)); } minY = Math.min(minY, e.y); }
  ok(onBeam >= 3 && maxPerch < 0.5 && rotMax < 0.05 && minY > G.vault, 'she PERCHES on it: ' + onBeam.toFixed(1) + ' s stood ON the beam (feet at its top, upright - no longer hung upside down from nothing), long enough to climb to her');
  const { S: Sb, e: eb } = fresh({ x: G.mid, y: G.beamY, mode: 'spitTell', modeT: 2 }); Sb.ph = 2; Sb.pose = 'shaft'; Sb.script = []; const hb = { x: G.beam[0] + 16, y: G.beamY, face: 1, onLedge: 'B' };
  ok(CQG.pourAim(eb, Sb, hb) && CQG.pourAim(eb, Sb, hb).what === 'perch' && CQG.pourAt(eb, Sb, hb, quietC()) === 'open' && eb.mode === 'fallen' && eb.y === G.floor, 'a pour on her from the beam beside her knocks her off it: ON HER BACK on the floor');
  const { S: Sc, e: ec } = fresh({ x: G.mid, y: G.beamY, mode: 'spitTell', modeT: 2 }); Sc.ph = 2; Sc.pose = 'shaft'; Sc.script = []; CQG.strikeWindlass(ec, Sc, quietC()); for (let i = 0; i < 60; i++) CQG.stepQueen(ec, Sc, 1 / 60, hero0(), quietC());
  ok(ec.mode === 'fallen' && Sc.n.bucketHits === 1, 'the bucket down the shaft onto the wellhead knocks her off it too'); }
/* 3. HER STINGER, through her hands' take (the take runs after every multiplier in main.js, so the blows here are already multiplied: x1, x2.93, x5.86) */
{ const { makeCisternQueenHands } = await import('../src/cistern-queen-hands.js');
  const arena = { boss: 'cisternqueen', x0: G.x0, x1: G.x1, floor: G.floor, queen: A.queen }, P = { x: G.mid - 200, y: G.floor, face: 1, hp: 200, maxHp: 200, skin: { sips: 3, max: 3 } }; let box = null; const words = [], said = [];
  const ctx = { L: { arena, ents: [] }, players: [P], boss: null, bossActive: true, TS: 16, EHP: { cisternqueen: 1000 }, sfx: {}, hero: () => P, enemies: () => [], time: () => 0, number: (x, y, t) => said.push(t), text() {}, burst() {}, sparks() {}, dust() {}, shake() {},
    damagePlayer() {}, asPlayer: (p, fn) => fn(), upright: () => true, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: q => ({ l: q.x - (q.w || 10) / 2, r: q.x + (q.w || 10) / 2, t: q.y - (q.h || 20), b: q.y }), duckBox: q => ({ l: q.x - 5, r: q.x + 5, t: q.y - 10, b: q.y }),
    attackBox: () => box, turned: (e, x, w) => words.push(w) };
  const H = makeCisternQueenHands(ctx), e = H.spawnBoss({ x: G.mid, y: G.floor, alive: true }); e.alive = true; ctx.boss = e; const S = H.show(); e.mode = 'walk'; e.modeT = 5; e.face = -1; S.ph = 1; S.script = ['pincer']; S.step = 0;
  const atTip = () => { const tp = CQG.tipOf(e, S); box = { l: tp.x - 4, r: tp.x + 4, t: tp.y - 4, b: tp.y + 4 }; }, atBody = (x) => { box = { l: x - 4, r: x + 4, t: G.floor - 20, b: G.floor - 10 }; P.x = x + (x < e.x ? -10 : 10); };
  atTip(); const d0 = H.take(e, 10, 'light'); ok(Math.abs(d0 - 10 * CQ.tailMul) < 0.01 && words.includes('WHEN IT STICKS'), 'outside her openings her free stinger is ARMOURED: a blow of 10 lands ' + d0 + ' (x' + CQ.tailMul + ', B15 - never nothing) with a clank and WHEN IT STICKS');
  atBody(e.x - 30); P.x = e.x - 60; const df = H.take(e, 10, 'light'); atBody(e.x + 30); P.x = e.x + 60; const db = H.take(e, 10, 'light');
  ok(Math.abs(df - 10 * CQ.shellFront) < 0.01 && Math.abs(db - 10 * CQ.shellBack) < 0.01 && words.includes('GO ROUND') && CQ.shellFront >= 0.4, 'her shell: her claws turn a frontal blow to x' + CQ.shellFront + ' (GO ROUND), her back x' + CQ.shellBack + ' - never nothing (B15)');
  S.ward = 2; atTip(); const dw = H.take(e, 10, 'light'); ok(Math.abs(dw - 10 * CQ.wardMul) < 0.01 && words.includes('WARDED'), 'in her ward x' + CQ.wardMul + ' (WARDED) - her stinger too'); S.ward = 0;
  CQG.scorchUp(e, S, quietC()); atTip(); const dh = H.take(e, 10, 'light'); atBody(e.x - 30); const dhb = H.take(e, 10, 'light'); ok(Math.abs(dh - 10 * CQ.tailOpenMul) < 0.01 && Math.abs(dhb - 10) < 0.01, 'HOT, her stinger takes x' + CQ.tailOpenMul + ' and her body whole from the front');
  S.scorch = 0; S.stinger = { x: e.x + 60, y: G.floor - 6, t: 2, k: 'lance' }; S.stingTaken = 0; box = { l: e.x + 56, r: e.x + 64, t: G.floor - 12, b: G.floor }; const ds = H.take(e, 10, 'light'); ok(Math.abs(ds - 10 * CQ.tailOpenMul) < 0.01, 'stuck in the floor after a sting it is THE way in: x' + CQ.tailOpenMul);
  /* THE PURSE, on what lands: blows grown x2.93 and x5.86 after the count (the chain, a riposte, a poise-broken blow, a x2 talent) never take more than CQ.tailPurse of her a phase */
  S.stinger = null; S.tailTaken = 0; let tail = 0, n2 = 0; for (let i = 0; i < 60 && !S.broken; i++) { S.ward = 0; S.scorch = i % 2 ? CQ.scorchT : 0; e.mode = 'walk'; e.modeT = 5; atTip(); tail += H.take(e, i % 3 ? 29.3 : 58.6, 'light'); n2++; }
  ok(S.broken && tail <= CQ.tailPurse * e.maxHp + 0.01 && tail >= CQ.tailPurse * e.maxHp - 0.01, 'HER STINGER\'S PURSE: blows grown x2.93 and x5.86 took ' + tail.toFixed(1) + ' of her (the purse: ' + CQ.tailPurse * e.maxHp + ', ' + CQ.tailPurse * 100 + '% a phase) in ' + n2 + ' blows - then it BREAKS');
  ok(e.mode === 'reel' && said.includes('HER STINGER BREAKS: SHE FIGHTS WITH HER CLAWS') && !CQG.tipOf(e, S), 'broken: told, she REELS (a stall of ' + CQ.breakT + ' s), and there is no stinger left to cut');
  const after0 = e.hp; box = null; const left = []; for (let t = 0; t < 40; t += 1 / 60) { e.hp = 900; CQG.stepQueen(e, S, 1 / 60, hero0(), quietC()); if (S.cur) left.push(S.cur.k); }
  ok(left.length > 10 && !left.some(k => CQG.STING_MOVES.has(k)) && !(CQG.stingerOut(S)), 'for the rest of the phase every stinger move is gone (the Great Drill\'s gears): ' + [...new Set(left)].join(','));
  e.hp = 600; let moulted = false; for (let t = 0; t < 20 && !moulted; t += 1 / 60) { CQG.stepQueen(e, S, 1 / 60, hero0(), quietC(said)); moulted = S.ph === 2 && !S.broken; }
  ok(moulted && CQG.tailLeft(e, S) === CQ.tailPurse * e.maxHp && said.includes('SHE MOULTS: HER STINGER IS WHOLE AGAIN'), 'a new phase: she MOULTS - her stinger whole again and its purse full (told)'); }
/* 1e. THE OPENING'S CAP holds on what lands (x2.93) */
{ const { makeCisternQueenHands } = await import('../src/cistern-queen-hands.js'); const arena = { boss: 'cisternqueen', x0: G.x0, x1: G.x1, floor: G.floor, queen: A.queen }, P = { x: G.mid - 60, y: G.floor, face: 1 };
  const ctx = { L: { arena, ents: [] }, players: [P], TS: 16, EHP: { cisternqueen: 1000 }, sfx: {}, hero: () => P, number() {}, burst() {}, sparks() {}, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, attackBox: () => null, upright: () => true, asPlayer: (p, fn) => fn() };
  const H = makeCisternQueenHands(ctx), e = H.spawnBoss({ x: G.mid, y: G.floor }); e.alive = true; ctx.boss = e; const S = H.show(); CQG.openUp(e, S, 'soaked', quietC()); let lost = 0; for (let i = 0; i < 12; i++) lost += H.take(e, 58.6, 'light');
  ok(lost <= CQ.openCap * e.maxHp + 0.01 && lost > 0, 'one opening takes at most CQ.openCap of her on what lands: twelve blows grown x5.86 took ' + lost.toFixed(1) + ' (cap ' + CQ.openCap * e.maxHp + ')'); }
console.log('cistern-queen: ' + n + ' checks pass');
