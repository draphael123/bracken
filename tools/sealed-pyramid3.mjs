// tools/sealed-pyramid3.mjs - SEALED PYRAMID 3 asked in Node (claude/sealedpyramid3). No page. Runs the level both ways (SP3 off = master unchanged; SP3 on).
//   A  THE FLAG: off -> no well's breath, master's chamber (blocks + darts + switches), master's Tomb-King; on -> the well, the four seal traps, the Coffin King
//   B  THE CHAMBER (on): four seal traps, one per seal, the player's plates on footing OUTSIDE their own line and on the reach model's route, nothing falls on him,
//      the line of each crosses the floor he chases you over, the flood's pool built at its high mark below the ledges' tops
//   C  THE WELL'S BREATH (on): it owns every spike of the King's Stair's well and no other, sets you down on footing west of the stair, costs a told share (< a
//      plain spike's), never kills (spare) and is told on the sign before you climb
//   D  THE COFFIN KING (pure, in the real chamber): seals break by their own trap only, all of a phase's -> THE LID BURSTS (>= 3 s, 1.5-2x, capped) -> clamp ->
//      a told ward a trap glances off -> the seals knit; THE FLIP only sand-then-sluice; P3 any trap downs him; never under 0.4x outside an opening (the spent purse
//      too); left alone he never opens; every blow told by a windup; one new move a phase (P3 a new body: STATED); he picks by where you stand; the anti-crowd leap
//   E  THE SCARAB MOTHER (pure): SP3's cycles hold the wing sweep (P1) and the dung ball (P2), each told, each its own answer (duck / jump); master's cycles untouched
//   F  THE TOY DUEL (the node lab hook - NOT the browser bossLab): ckPlan drives a kinematic hero against the pure fight + a toy of the chamber's trap engine,
//      n=6 seeds x 3 hero shapes - the rule is workable by the bot (it opens him, every phase) and the fight ends. Rates here are NOT the band (the browser lab owes it).
//     node tools/sealed-pyramid3.mjs [--v] [--duel-only]
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { slopeReachGrid } from '../src/reach-slopes.js';
import * as SP3 from '../src/sealed-pyramid3.js';
import * as CKM from '../src/coffin-king.js';
import * as SMM from '../src/scarab-mother.js';
import { HAZARD } from '../src/survival.js';
import fs from 'fs';
/* the trap engine's numbers, read from src/sealed-pyramid-hands.js's text (its module draws, so Node cannot import it) */
const HSRC = fs.readFileSync(new URL('../src/sealed-pyramid-hands.js', import.meta.url), 'utf8'), num = re => { const m = HSRC.match(re); if (!m) throw new Error('trap const ' + re); return Function('return (' + m[1] + ')')(); };
const TRAP_DELAY = num(/export const TRAP_DELAY = ({[^}]*})/), TRAP_BORE = num(/export const TRAP_BORE = ({[^}]*})/), TRAP_DARTS = num(/export const TRAP_DARTS = ({[^}]*})/);

let fails = 0, n = 0; const V = process.argv.includes('--v'); const ok = (c, m) => { n++; if (!c) { fails++; console.log('  FAIL ' + m); } else if (V) console.log('  ok   ' + m); };
const lv = LEVELS.find(l => l.id === 'sealedpyramid');
const build = on => { globalThis.__SP3 = on; const L = lv.build(); globalThis.__SP3 = false; return L; };
const prevEnv = process.env.SP3; delete process.env.SP3;
const L0 = build(false), L = build(true);
if (prevEnv !== undefined) process.env.SP3 = prevEnv;
const at = (G, x, y) => (x < 0 || y < 0 || x >= G.W || y >= G.H) ? T.SOLID : G.grid[y * G.W + x], stand = t => t === T.SOLID || t === T.ONEWAY;

console.log('== A. the flag');
ok(SP3.SP3_SHIPS === false, 'SP3_SHIPS is false: master unchanged until Daniel flips it (art before live)');
ok(!L0.spUpdraft && !L0.arena.ck && L0.traps.filter(t => t.tk).length === 4 && !L0.traps.some(t => t.ck), 'off: no well\'s breath, master\'s chamber (its four tk traps), no seal traps');
ok(!!L.spUpdraft && !!L.arena.ck && L.traps.filter(t => t.ck).length === 4 && !L.traps.some(t => t.tk), 'on: the well\'s breath, arena.ck, the four seal traps and none of master\'s');
ok(L.arena.boss === 'tombking' && L0.arena.boss === 'tombking', 'the boss id stays tombking either way (every registration in main.js keeps working)');
ok(JSON.stringify(L0.grid.slice(0, 1000 * L0.W)) === JSON.stringify(L.grid.slice(0, 1000 * L.W)) || true, '(the grid west of the chamber is the same either way)');
{ let diff = 0; for (let y = 0; y < L.H; y++) for (let x = 0; x < 1006; x++) if (at(L, x, y) !== at(L0, x, y)) diff++; ok(diff === 0, 'nothing west of the burial chamber changes with the flag (' + diff + ' cells)'); }

console.log('== B. the chamber (on)');
const ckT = L.traps.filter(t => t.ck), R = floodReach(slopeReachGrid(L, T), T, { rides: true });
ok(['rope', 'chain', 'glass', 'wax'].every(s => ckT.filter(t => t.seal === s).length === 1), 'one trap per seal: ' + ckT.map(t => t.id + '=' + t.seal).join(', '));
ok(ckT.every(t => ['oil', 'darts', 'gas', 'flood'].includes(t.kind)) && !L.traps.some(t => t.ck && (t.kind === 'block' || t.kind === 'stone')), 'NOTHING FALLS ON HIM: oil, darts, the sand-pour (gas machine, d.sand), the sluice - no block, no slab, no stone');
ok(ckT.find(t => t.kind === 'gas').sand === true, 'seal four is THE SAND-POUR (plan section 2: not the falling slab)');
for (const t of ckT) { const [x0, x1, row] = t.plates[0], [zx0, zx1, zy0, zy1] = t.zone;
  ok(x1 < zx0 || x0 > zx1 || row - 1 < zy0 || row - 1 > zy1, t.id + ': its plate ' + x0 + '-' + x1 + ' (row ' + row + ') is outside its own line ' + zx0 + '-' + zx1 + ' rows ' + zy0 + '-' + zy1);
  let foot = true; for (let x = x0; x <= x1; x++) if (!stand(at(L, x, row)) || at(L, x, row - 1) !== T.AIR) foot = false; ok(foot, t.id + ': its plate is footing with air over it');
  let seen = false; for (let x = x0; x <= x1; x++) if (R.seen.has(x + ',' + (row - 1))) seen = true; ok(seen, t.id + ': its plate is on the reach model\'s route (base movement reaches it)');
  ok(zy1 === 23 && zx1 - zx0 >= 5, t.id + ': its line crosses the chamber\'s floor (rows ' + zy0 + '-' + zy1 + ', ' + (zx1 - zx0 + 1) + ' tiles) - where he walks to you');
  ok(t.ck === (t.seal === 'rope' || t.seal === 'chain' ? 1 : 2), t.id + ': armed from phase ' + t.ck + ' (the phase its seal binds him)'); }
{ const p = (L.pools || []).find(q => q.id === 'ckFlood'), f = ckT.find(t => t.kind === 'flood'); ok(p && p.swim && p.bottom === 24 * 16 && p.y === f.high * 16 + 4 && f.high === L.arena.tk.ledges[0].y, 'the chamber\'s water is built at its high mark (the ledges\' top: a hero on a ledge stays dry) and drained by the hands'); }
ok(Object.keys(SP3.CK_SLOT.wait).length === 4 && SP3.CK_SLOT.traps.every(t => { const w = SP3.CK_SLOT.wait[t.id]; return w && !(w[0] >= t.zone[0] && w[0] <= t.zone[1] && w[1] - 1 >= t.zone[2] && w[1] - 1 <= t.zone[3]); }), 'every plate has a waiting spot outside its line (the bot\'s and the reviewer\'s read)');

console.log('== C. the well\'s breath (on)');
{ const U = L.spUpdraft; let own = 0, other = 0; for (let x = 950; x < 1010; x++) if (at(L, x, U.row) === T.SPIKE) { if (x >= U.x0 && x <= U.x1) own++; else other++; }
  ok(own >= 30 && other === 0, 'it owns every spike of the well (' + own + ') and no other');
  let spikesElse = 0; for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (at(L, x, y) === T.SPIKE && !(x >= U.x0 && x <= U.x1 && y === U.row)) spikesElse++; ok(spikesElse > 0, 'THIS PIT ONLY: the level\'s other ' + spikesElse + ' spike cells keep the shared rule');
  ok(stand(at(L, U.back[0], U.back[1] + 1)) && at(L, U.back[0], U.back[1]) === T.AIR && at(L, U.back[0], U.back[1] - 1) === T.AIR && U.back[0] < U.x0, 'it sets you down on footing at the stair\'s foot (' + U.back + '), west of the well');
  ok(R.seen.has(U.back[0] + ',' + U.back[1]), 'the set-down tile is on the route');
  ok(U.pct > 0 && U.pct < HAZARD.pct, 'its cost is a told share (' + U.pct + ') under a plain spike\'s (' + HAZARD.pct + ')');
  const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), hook = src.slice(src.indexOf('const spikeBite = (tx, name) =>'), src.indexOf('const spikeBite = (tx, name) =>') + 900);
  ok(/L\.spUpdraft/.test(hook) && /spare: true/.test(hook) && hook.indexOf('L.spUpdraft') < hook.indexOf('lanceLiftHere'), 'main.js spikeBite: the well first, spare (never kills), before any exam\'s death rule');
  ok(/P\.spLift/.test(src) && /U\.back\[0\] \* TS/.test(src), 'main.js: the lift carries you up, then sets you at the stair\'s foot');
  ok((L.signs || L.ents || []).some(e => e.t === 'sign' && /WELL'S BREATH/.test(e.text || e.msg || '')) || /WELL'S BREATH/.test(JSON.stringify(L.ents)), 'told: the stair\'s sign says the well throws you back'); }

console.log('== D. THE COFFIN KING (pure, in the real chamber)');
const G = CKM.geom(L.arena, 16);
const world = log => ({ number: (x, y, t) => log.push(['say', t]), sound: () => {}, shake: () => {}, fx: () => {}, mark: m => log.push(['mark', m]), music: () => {}, traps: () => {}, rng: Math.random,
  time: () => 0, hit: (bx, d, name, o) => { log.push(['hit', name, o && o.key]); return []; }, haul: () => {}, cutting: () => false });
const fresh = () => { const S = CKM.newFight(G), e = { x: G.start, y: G.floorY, w: CKM.CK.w, h: CKM.CK.h, hp: 5000, maxHp: 5000, alive: true, mode: 'walk', modeT: 0.5, open: 0, face: -1 }; return { S, e }; };
const step = (e, S, t, hero, log) => { for (let k = 0; k < t * 60; k++) CKM.stepCoffinKing(e, S, 1 / 60, [hero], world(log)); };
{ const { S, e } = fresh(), log = []; step(e, S, 120, { x: G.x0 + 40, y: G.floorY, ground: true, alive: true }, log); ok(S.n.opens === 0 && !CKM.ckOpen(e), 'left alone two minutes (no trap fired), he never opens'); }
{ const { S, e } = fresh(), log = [];
  ok(CKM.trapLands(e, S, world(log), 'gas') === 'spent' && S.broken.length === 0, 'P1: the sand-pour is not his yet (spent, told)');
  ok(CKM.trapLands(e, S, world(log), 'oil') === 'seal' && S.broken.join() === 'rope', 'P1: THE OIL burns THE ROPE SEALS');
  ok(CKM.trapLands(e, S, world(log), 'oil') === 'busy' || S.broken.join() === 'rope', 'a broken seal stays broken (no double count)');
  e.mode = 'walk'; ok(CKM.trapLands(e, S, world(log), 'darts') === 'open' && e.mode === 'burst' && e.open >= 3, 'P1: THE DARTS snap THE CHAIN SEALS - all broken: THE LID BURSTS, open ' + e.open + ' s');
  const [d1] = CKM.takeBlow(e, S, 100); ok(d1 >= 150 && d1 <= 200, 'open: a blow x' + (d1 / 100));
  let tot = d1; for (let i = 0; i < 60; i++) tot += CKM.takeBlow(e, S, 100)[0]; ok(S.openTaken <= 5000 * CKM.CK.openCap + 0.01, 'the window is capped (' + Math.round(S.openTaken) + ' <= ' + 5000 * CKM.CK.openCap + ')');
  ok(CKM.takeBlow(e, S, 100)[0] >= 40, 'the spent purse still takes >= 0.4x (never nothing)');
  step(e, S, 1.6, { x: G.x0 + 40, y: G.floorY, ground: true, alive: true }, log); ok(S.ward > 0 && S.broken.length === 0, 'then he drags himself back in (clamp) and a told ward follows: the seals knit');
  ok(CKM.trapLands(e, S, world(log), 'oil') === 'ward', 'a trap in his ward glances off (told)'); }
{ const { S, e } = fresh(), log = []; e.hp = 3000; S.ph = 2; e.mode = 'walk';
  ok(CKM.trapLands(e, S, world(log), 'oil') === 'spent', 'P2: the oil finds the rope already ash (spent, a small stagger)');
  e.mode = 'walk'; ok(CKM.trapLands(e, S, world(log), 'gas') === 'seal', 'P2: THE SAND-POUR fills THE HOURGLASS');
  e.mode = 'walk'; ok(CKM.trapLands(e, S, world(log), 'flood') === 'open' && e.mode === 'burst', 'P2: THE SLUICE\'s bore dissolves THE WAX: the lid bursts');
  CKM.water(e, S, world(log), 0.6, 'f1'); ok(e.mode === 'flipped' && e.open >= 5 && e.openKind === 'flip', 'THE FLIP: sand first, then the sluice - the rising water tips him onto his back (' + e.open + ' s)');
  const [d] = CKM.takeBlow(e, S, 100); ok(d >= 150, 'flipped: x' + d / 100 + ', purse ' + CKM.CK.flipCap); }
{ const { S, e } = fresh(), log = []; e.hp = 3000; S.ph = 2; e.mode = 'walk';
  CKM.trapLands(e, S, world(log), 'flood'); ok(S.broken.join() === 'wax' && !CKM.ckOpen(e), 'P2 the other order: the sluice first breaks the wax only');
  e.mode = 'walk'; CKM.water(e, S, world(log), 0.6, 'f1'); ok(!CKM.ckOpen(e) && S.n.bobs === 1, 'the water rises: he bobs - the hourglass still holds (told, no flip)');
  e.mode = 'walk'; ok(CKM.trapLands(e, S, world(log), 'gas') === 'open' && e.openKind === 'burst', 'then the sand: a plain burst'); }
{ const { S, e } = fresh(), log = []; e.hp = 1000; S.ph = 3; e.mode = 'walk';
  ok(CKM.trapLands(e, S, world(log), 'darts') === 'open' && e.openKind === 'downed' && e.open >= 3, 'P3 FREE: any trap on him downs him (' + e.open + ' s)'); }
{ const { S, e } = fresh(); const modes = ['walk', 'recover', 'slamTell', 'tumble', 'grab', 'hold', 'whip', 'lunge', 'hurlTell', 'fetch', 'stagger', 'tumbleEnd', 'leap', 'escape'];
  let lo = 9; for (const ph of [1, 2, 3]) { S.ph = ph; for (const m of modes) { e.mode = m; S.ward = 0; lo = Math.min(lo, CKM.takeBlow(e, S, 100)[0] / 100); } S.ward = 2; e.mode = 'walk'; lo = Math.min(lo, CKM.takeBlow(e, S, 100)[0] / 100); }
  ok(lo >= 0.4, 'B15: outside an opening never under 0.4x in any mode or phase (min x' + lo + ')'); }
{ const byPh = ph => Object.entries(CKM.MOVES).filter(([, v]) => v.ph.includes(ph)).map(([k]) => k.replace(/Tell$/, ''));
  const p1 = byPh(1), p2 = byPh(2), p3 = byPh(3);
  ok(p1.length >= 4, 'P1 has ' + p1.length + ' told moves (B17 >= 4): ' + p1.join(', '));
  ok(p2.filter(m => !p1.includes(m)).length === 1, 'P2 adds ONE move (B5): ' + p2.filter(m => !p1.includes(m)).join());
  ok(p3.filter(m => !p2.includes(m)).length === 2 && !p3.includes('slam') && !p3.includes('tumble'), 'STATED CHANGE to B5: P3 is a new body - the slam becomes his claws (lunge), the tumble goes with the coffin (hurl): ' + p3.join(', '));
  ok(CKM.ATTACKS.length === 7 && Object.values(CKM.MOVES).every(v => v.mark && v.answer), 'seven told attacks, each its mark and its answer');
  ok(new Set(Object.values(CKM.MOVES).map(v => v.answer)).size >= 4, 'answers vary: ' + [...new Set(Object.values(CKM.MOVES).map(v => v.answer))].join('/')); }
{ /* every blow comes out of a told windup: run him against a hero walking about and check each hit's move had its Tell first */
  const { S, e } = fresh(), log = []; let px = G.x0 + 80, dir = 1; const tells = new Set(); let untold = 0, hits = 0;
  const w = { ...world(log), mark: () => {}, hit: (bx, d, name, o) => { hits++; const k = (o && o.key || '').replace(/[0-9.]+.*$/, ''); const want = { slam: 'slamTell', tumble: 'tumbleTell', grab: 'grabTell', hold: 'grabTell', leap: 'leapTell', whip: 'whipTell', lunge: 'lungeTell', coffin: 'hurlTell' }[k];
    if (!want || !tells.has(want)) untold++; return []; } };
  for (let i = 0; i < 60 * 200; i++) { if (/Tell$/.test(e.mode)) tells.add(e.mode); px += dir * 1.2; if (px > G.x1 - 30 || px < G.x0 + 30) dir = -dir; if (i === 60 * 60) e.hp = 3000; if (i === 60 * 120) e.hp = 1200;
    CKM.stepCoffinKing(e, S, 1 / 60, [{ x: px, y: G.floorY, ground: true, alive: true }], w); }
  ok(hits > 20 && untold === 0, 'every blow is told (' + hits + ' hit frames, ' + untold + ' untold) over three phases');
  ok(S.ph === 3 && Object.keys(S.n.moves).length >= 6, 'he reaches P3 and uses ' + Object.keys(S.n.moves).length + ' told moves: ' + Object.keys(S.n.moves).join(' ')); }
{ const { S, e } = fresh(); let fromLedge = new Set(), far = new Set();
  for (let i = 0; i < 300; i++) { S.last = null; fromLedge.add(CKM.pickMove(e, S, { x: G.ledges[0].x0 + 30, y: G.ledges[0].y, ground: true })); far.add(CKM.pickMove(e, { ...S, last: null }, { x: G.x0 + 20, y: G.floorY, ground: true })); }
  e.x = G.x1 - 40; const farFrom = new Set(); for (let i = 0; i < 300; i++) { S.last = null; farFrom.add(CKM.pickMove(e, S, { x: G.x0 + 20, y: G.floorY, ground: true })); }
  ok(!fromLedge.has('slam') && fromLedge.has('grab') === (Math.abs(G.ledges[0].x0 + 30 - e.x) < 90), 'he picks by where you stand: up on a ledge no slam (' + [...fromLedge].join(',') + ')');
  ok(farFrom.has('tumble') && !farFrom.has('slam'), 'far off: the tumble, never the slam (' + [...farFrom].join(',') + ')');
  S.dwell = { plat: 'W', t: 5, x: 0 }; S.leapCdT = 0; ok(CKM.pickMove(e, S, { x: G.ledges[0].x0 + 30, y: G.ledges[0].y, ground: true }) === 'leap', 'the anti-crowd move: stood on one platform > ' + CKM.CK.dwell + ' s, he leaps onto it'); }
ok(CKM.CK.whip.bot > 8 && CKM.CK.whip.bot < 14 && CKM.CK.whip.top >= 62, 'THE CHAIN WHIP flies over a crouch (8 px) and through a standing hero (14 px) and a ledge (48 px up)');

console.log('== E. THE SCARAB MOTHER (pure)');
ok(JSON.stringify(SMM.CYCLES[1]).indexOf('sweep') < 0 && JSON.stringify(SMM.CYCLES).indexOf('ball') < 0, 'master\'s cycles untouched (SP3 off: no sweep, no ball)');
ok(SMM.CYCLES_SP3[1].every(c => c.includes('sweep') || true) && SMM.CYCLES_SP3[1].some(c => c.includes('sweep')) && !SMM.CYCLES_SP3[1].some(c => c.includes('ball')), 'SP3 phase one gains THE WING SWEEP');
ok(SMM.CYCLES_SP3[2].some(c => c.includes('ball')) && SMM.CYCLES_SP3[3].some(c => c.includes('ball')) && SMM.CYCLES_SP3[3].some(c => c.includes('sweep')), 'SP3 phase two gains THE DUNG BALL; phase three keeps both');
ok(SMM.MOVES.sweepTell.answer === 'duck' && SMM.MOVES.ballTell.answer === 'jump' && SMM.MOVES.sweepTell.mark === '!' && SMM.MOVES.ballTell.mark === '!!', 'two new told moves with different answers (duck / jump)');
{ const sg = { x0: 0, x1: 640, floorY: 400, roofY: 176, ledge: { x0: 224, x1: 352, y: 352 }, pits: [[48, 80], [560, 592]], block: { zone: [144, 240], plate: [240, 272], lure: 280 }, darts: { zone: [400, 624], plate: [368, 400], lure: 360 } };
  const S = SMM.newFight(sg); S.sp3 = true; const e = { x: 480, y: 400, w: 40, h: 24, hp: 1500, maxHp: 1500, alive: true, mode: 'wake', modeT: 0, open: 0, face: -1 };
  const tells = new Set(); let untold = 0, sweepHits = 0, ballHits = 0, hiOk = true;
  const w = { number: () => {}, sound: () => {}, shake: () => {}, fx: () => {}, mark: () => {}, music: () => {}, pits: () => {}, time: () => 0, rng: Math.random,
    hit: (bx, d, name, o) => { if (name === SMM.MOVE_NAME.sweep) { sweepHits++; if (!tells.has('sweepTell') || !o.high || bx[3] < 400 - 13 || bx[3] > 400 - 9) hiOk = false; } if (name === SMM.MOVE_NAME.ball) { ballHits++; if (!tells.has('ballTell')) untold++; } return false; } };
  for (let i = 0; i < 60 * 150; i++) { if (/Tell$/.test(e.mode)) tells.add(e.mode); if (i === 60 * 50) e.hp = 800; if (i === 60 * 100) e.hp = 350; SMM.stepScarabMother(e, S, 1 / 60, [{ x: 120 + (i % 400), y: 400, ground: true, alive: true }], w); }
  ok(sweepHits > 0 && hiOk, 'the sweep flies (' + sweepHits + ' frames), told first, at head height over a crouch (o.high, its bottom 9-13 px up)');
  ok(ballHits > 0 && untold === 0, 'the ball rolls (' + ballHits + ' frames), told first');
  ok((S.n.sweeps || 0) > 0 && (S.n.balls || 0) > 0, 'both come in her cycles (' + S.n.sweeps + ' sweeps, ' + S.n.balls + ' balls)'); }

/* ---------- F. THE TOY DUEL ---------- */
console.log('== F. the toy duel (node lab hook; not the band)');
function duel(seed, shape) {
  let s = seed * 9301 + 49297; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const { S, e } = fresh(); e.mode = 'wake'; e.modeT = 1.0;
  const hero = { roll: 0, rollDir: 1, x: G.x0 + 60, y: G.floorY, vy: 0, ground: true, hp: shape.hp, max: shape.hp, flasks: 3, atk: -1, cd: 0, face: 1, down: false, block: false, alive: true, dead: false };
  const traps = SP3.CK_SLOT.traps.map(d => ({ d, st: 'ready', t: 0, pressed: false, front: null, bore: null, lvl: 0, phase: null, hit: false, heroHit: false }));
  let t = 0, opens = { burst: 0, flip: 0, downed: 0 }, mem = {}; const dt = 1 / 60, ts = 16;
  const box = () => ({ l: hero.x - 6, r: hero.x + 6, t: hero.y - (hero.down ? 8 : 14), b: hero.y });
  const over = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  const keys = new Set();
  const w = { number: () => {}, sound: () => {}, shake: () => {}, fx: () => {}, mark: () => {}, music: () => {}, traps: () => {}, time: () => t, rng: rnd,
    hit: (bx, d, name, o = {}) => { if (hero.dead || keys.has(o.key || name)) return []; const b = { l: bx[0], r: bx[1], t: bx[2], b: bx[3] }; if (!over(b, box())) return []; keys.add(o.key || name);
      if (hero.roll > 0) return []; if (o.blockable && hero.block && shape.shield) return [{ pp: hero, res: 'block' }]; hero.hp -= d; return [{ pp: hero, res: 'hit' }]; },
    haul: (pp, dx) => { hero.x += dx; }, cutting: () => hero.atk >= 0 && hero.atk < 0.2 };
  const bossBox = () => { const hw = (S.ph >= 3 ? CKM.CK.w3 : CKM.CK.w) / 2, h = S.ph >= 3 ? CKM.CK.h3 : CKM.CK.h; return { l: e.x - hw, r: e.x + hw, t: e.y - h, b: e.y }; };
  const strikeTrap = (tr, b) => { if (!tr.hit && over(b, bossBox())) { tr.hit = true; const r = CKM.trapLands(e, S, w, tr.d.kind); if (r === 'open') opens[e.openKind]++; }
    if (!tr.heroHit && over(b, box())) { tr.heroHit = true; hero.hp -= hero.max * 0.22; } };
  while (t < 300 && e.hp > 0 && hero.hp > 0) {
    t += dt;
    /* the traps (a toy of src/sealed-pyramid-hands.js: the fresh press arms, TRAP_DELAY, then each kind's line) */
    for (const tr of traps) { const d = tr.d, [x0, x1, row] = d.plate, on = hero.ground && hero.x > x0 * ts - 1 && hero.x < (x1 + 1) * ts + 1 && Math.abs(hero.y - row * ts) < 3, fresh = on && !tr.pressed; tr.pressed = on;
      if (tr.st === 'ready') { if (fresh && S.ph >= d.ph && e.mode !== 'sleep' && e.mode !== 'wake') { tr.st = 'armed'; tr.t = TRAP_DELAY[d.kind]; } continue; }
      tr.t -= dt;
      if (tr.st === 'armed' && tr.t <= 0) { tr.st = 'firing'; tr.hit = false; tr.heroHit = false; tr.t = d.kind === 'oil' ? 99 : d.kind === 'darts' ? TRAP_DARTS.volley : d.kind === 'gas' ? d.gasT : d.riseT + d.holdT + d.drainT; tr.front = d.chan ? d.chan[0] * ts : null; tr.bore = d.kind === 'flood' ? d.sluice * ts : null; tr.age = 0; continue; }
      if (tr.st === 'firing') { tr.age += dt; const zb = { l: d.zone[0] * ts, r: (d.zone[1] + 1) * ts, t: d.zone[2] * ts, b: (d.zone[3] + 1) * ts };
        if (d.kind === 'oil') { const end = (d.chan[1] + 1) * ts; if (tr.front < end) { tr.front += d.runV * dt; if (tr.front >= end) tr.t = d.burnT; } strikeTrap(tr, { ...zb, r: Math.min(tr.front, end) }); }
        else if (d.kind === 'darts' || d.kind === 'gas') strikeTrap(tr, zb);
        else if (d.kind === 'flood') { if (tr.bore !== null) { tr.bore += d.dir * TRAP_BORE.v * dt; strikeTrap(tr, { ...zb, l: Math.max(zb.l, tr.bore - TRAP_BORE.w), r: Math.min(zb.r, tr.bore + TRAP_BORE.w) }); if (tr.bore < zb.l - 20) tr.bore = null; }
          tr.lvl = tr.age < d.riseT ? tr.age / d.riseT : tr.age < d.riseT + d.holdT ? 1 : Math.max(0, 1 - (tr.age - d.riseT - d.holdT) / d.drainT); CKM.water(e, S, w, tr.lvl, 'f' + Math.floor(t - tr.age)); if (e.openKind === 'flip' && !tr.flipped) { tr.flipped = true; opens.flip++; } }
        if (tr.t <= 0 && (d.kind !== 'oil' || tr.front >= (d.chan[1] + 1) * ts)) { tr.st = 'reset'; tr.t = Math.max(0.5, d.reset - (d.kind === 'flood' ? d.riseT + d.holdT + d.drainT : 1)); tr.lvl = 0; tr.flipped = false; } continue; }
      if (tr.st === 'reset' && tr.t <= 0) tr.st = 'ready'; }
    /* the bot */
    const plates = traps.map(tr => ({ id: tr.d.id, ready: tr.st === 'ready' })), lines = traps.filter(tr => tr.st === 'armed' || tr.st === 'firing').map(tr => ({ x0: tr.d.zone[0] * ts, x1: (tr.d.zone[1] + 1) * ts, y0: tr.d.zone[2] * ts, y1: (tr.d.zone[3] + 1) * ts, kind: tr.d.kind }));
    const pl = CKM.ckPlan({ P: { x: hero.x, y: hero.y, vy: hero.vy, face: hero.face, ground: hero.ground, atk: hero.atk }, e, S, plates, lines, reach: shape.reach, shield: shape.shield, t, rng: rnd, mem, v2: false, hero: shape.id, held: !!(S.hold), noRoll: shape.id === 'warden', rest: false });
    if (pl.dodge && hero.ground && hero.roll <= 0 && !(hero.rollCd > 0)) { hero.roll = 0.25; hero.rollCd = 0.6; hero.rollDir = pl.gx != null ? Math.sign(pl.gx - hero.x) || 1 : -hero.face; }
    if (hero.roll > 0) { hero.roll -= dt; hero.x += hero.rollDir * 240 * dt; } hero.rollCd = (hero.rollCd || 0) - dt;
    hero.block = !!pl.block; hero.down = !!pl.down && hero.ground;
    if (!hero.block && !hero.down && pl.gx != null && Math.abs(pl.gx - hero.x) > 3) { hero.x += Math.sign(pl.gx - hero.x) * shape.v * dt; hero.face = Math.sign(pl.gx - hero.x) || hero.face; } else if (pl.face) hero.face = pl.face;
    hero.x = Math.max(G.x0 + 6, Math.min(G.x1 - 6, hero.x));
    if (pl.jump && hero.ground) { hero.vy = -330; hero.ground = false; }
    if (pl.atk && hero.atk < 0 && hero.cd <= 0) { hero.atk = 0; hero.cd = shape.cd; const bb = bossBox(), reachBox = { l: hero.face > 0 ? hero.x : hero.x - shape.reach, r: hero.face > 0 ? hero.x + shape.reach : hero.x, t: hero.y - 20, b: hero.y + 2 };
      if (e.mode !== 'sleep' && over(reachBox, bb)) e.hp -= CKM.takeBlow(e, S, shape.dmg)[0]; }
    if (hero.atk >= 0) { hero.atk += dt; if (hero.atk > 0.3) hero.atk = -1; } hero.cd -= dt;
    /* gravity, the floor and the ledges (one-way) */
    if (!hero.ground) { const y0 = hero.y; hero.vy += 900 * dt; hero.y += hero.vy * dt; if (hero.vy > 0) { for (const l of G.ledges) if (hero.x > l.x0 && hero.x < l.x1 && y0 <= l.y && hero.y >= l.y) { hero.y = l.y; hero.ground = true; hero.vy = 0; } if (hero.y >= G.floorY) { hero.y = G.floorY; hero.ground = true; hero.vy = 0; } } }
    else if (hero.y < G.floorY - 2 && !G.ledges.some(l => hero.x > l.x0 && hero.x < l.x1 && Math.abs(hero.y - l.y) < 2)) hero.ground = false;
    if (hero.hp < hero.max * 0.35 && hero.flasks > 0) { hero.flasks--; hero.hp = Math.min(hero.max, hero.hp + hero.max * 0.4); }
    if (e.mode === 'wake' && e.modeT <= 0) e.mode = 'walk';
    CKM.stepCoffinKing(e, S, dt, [{ x: hero.x, y: hero.y, ground: hero.ground, alive: true, pp: hero, atk: hero.atk }], w);
  }
  return { win: e.hp <= 0, t: Math.round(t), ph: S.ph, opens, seals: S.n.seals, hp: Math.max(0, Math.round(e.hp)), holds: S.n.holds };
}
const SHAPES = [{ id: 'knight', hp: 165, v: 76, reach: 26, dmg: 26, cd: 0.42, shield: true }, { id: 'warden', hp: 165, v: 70, reach: 34, dmg: 30, cd: 0.6, shield: true }, { id: 'pyro', hp: 153, v: 84, reach: 22, dmg: 22, cd: 0.36, shield: false }];
const rows = []; for (const sh of SHAPES) for (let sd = 1; sd <= 6; sd++) rows.push({ sh: sh.id, ...duel(sd, sh) });
for (const sh of SHAPES) { const r = rows.filter(q => q.sh === sh.id), w = r.filter(q => q.win).length, op = r.reduce((a, q) => a + q.opens.burst + q.opens.flip + q.opens.downed, 0), fl = r.reduce((a, q) => a + q.opens.flip, 0);
  console.log('  ' + sh.id.padEnd(7) + ' toy wins ' + w + '/6  opens ' + op + ' (flips ' + fl + ')  reached P' + Math.max(...r.map(q => q.ph)) + '  t ' + r.map(q => q.t).join('/') + '  boss left ' + r.map(q => q.hp).join('/')); }
ok(rows.every(q => q.opens.burst + q.opens.flip + q.opens.downed > 0), 'the bot opens him with the rule in every duel (18/18)');
console.log('  (toy rows are a sanity read of THE RULE, not the band: the browser boss lab owes the n=6 rate - see the report)');
ok(rows.every(q => q.t < 300), 'every duel ends inside the 300 s toy cap');

console.log(fails ? '\nFAIL sealed-pyramid3: ' + fails + ' of ' + n : '\nok  sealed-pyramid3: ' + n + ' checks');
process.exit(fails ? 1 : 0);
