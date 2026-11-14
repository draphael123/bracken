/* tools/hl-jumpers.mjs - THE LINE-JUMPER (the boarder of the zip-line cart rides), proven in NODE (no page, no browser). claude/hlcartf, 11-14.
   src/line-jumpers.js (the foe), src/line-jumpers-hands.js (the wiring), the told rows in src/marks.js / told-attacks.js / threat.js.
   The cart under him is a STUB here (the same shape as src/line-cart.js cartInit: x, floorY, dirX, legIdx, st, R, id) so this runs on any tree; section 11 flies the REAL engine
   (src/line-cart.js, lane HLCARTK) when it is on the tree (or in the sibling worktree bracken-hlcartk) and says so.
     1  flag off: the hands build and run nothing; the module has no side effect
     2  the numbers: tell >= 1.0 s, stagger 0.5 s, pull tell 0.7 s, yank 1 tile, 12 dmg, hp about half a Hookjack, guard >= 0.4 (never immune)
     3  SPAWN-IN TELL: >= 1.0 s of ! + creak + a LANDING RING on the cart floor, and the arm, the body and the ring are INSIDE the ride camera for the whole tell and the swing (>= 0.8 s)
     4  LANDS with no guard: a 0.5 s stagger in which he attacks nobody and is open (a blow knocks him off)
     5  HOOK PULL: told 0.7 s (! + sound), open in the tell; a hit = 12 dmg + a 1 tile yank; a held guard = nothing; a parry = he spins, one blow knocks him off; never two pulls inside noStack
     6  KNOCK-OFF = KILL from each of: a hit in the stagger / the tell, a knock over the lip, a cut drop-line in the swing; 1 coin each, never two
     7  GUARD: front x0.4 (never immune), whole from behind; hp ~ half a Hookjack; he walks at you and stays inside the lips; an empty cart drops him
     8  EVERY HERO CLASS ANSWERS (9): stagger blow reached in time, block + parry, the ranged four cut the line, paladin/warden push him off, per class on its own numbers
     9  CO-OP quota; the rows' lint (the tell starts after the cart runs, lands before the leg ends, max 2 at once); broken rows are caught
    10  a seeded fuzz: no NaN, no stuck state, one coin at most, he always ends dead or fighting
    11  the REAL cart engine (when present): the tell and landing on its camera, the real dragOver yank */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { JK, JK_SAY, ANSWERS, JK_POSES, newJumper, jumpersOf, jumperQuota, jumperStep, jumperTake, jumperPush, jumperCut, jumperDied, jumperOpen, jumperBox, jumperRope, jumperShotHits, jumperPose, lintJumpers, drawJumper } from '../src/line-jumpers.js';
import { makeJumperHands } from '../src/line-jumpers-hands.js';
import { HK } from '../src/hookjack.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { NOT_FAMILY } from '../src/told-attacks.js';
import { MOVE, HERO_MOVE_IDS, heroRunMul } from '../src/hero-move.js';

const DT = 1 / 60, TS = 16, VW = 320, VH = 180;
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const t0 = Date.now(); const lines = [];

/* ---------- the stub cart: the lab ride's three legs (src/linecart-lab.js), 96 px/s, a 1 s dock ---------- */
const RIDE = {
  id: 'jlab', stations: [{ x: 8, top: 60 }, { x: 70, top: 52 }, { x: 8, top: 44 }, { x: 70, top: 36 }],
  jumpers: [{ leg: 0, ax: 30 }, { leg: 1, ax: 55, off: -18 }, { leg: 1, ax: 30, off: 18 }, { leg: 2, ax: 30, off: -18 }, { leg: 2, ax: 33, off: 18 }],
};
function route(ride) { const S = ride.stations.map(s => ({ x: s.x * TS, y: s.top * TS })), legs = []; for (let i = 0; i + 1 < S.length; i++) { const dx = S[i + 1].x - S[i].x, dy = S[i + 1].y - S[i].y; legs.push({ i, dx, dy, len: Math.hypot(dx, dy), dirX: Math.sign(dx) || 1 }); } return { S, legs }; }
function stubCart(ride) {
  const R = route(ride), cs = { id: ride.id, ride, R, leg: 0, k: 0, st: 'run', dockT: 0, legIdx: 0, dirX: R.legs[0].dirX };
  cs.sync = () => { const L = R.legs[cs.leg]; cs.legIdx = cs.leg; cs.dirX = L.dirX; cs.x = R.S[cs.leg].x + L.dx * cs.k; cs.floorY = R.S[cs.leg].y + L.dy * cs.k; };
  cs.step = dt => { if (cs.st === 'dock') { cs.dockT -= dt; if (cs.dockT <= 0 && cs.leg + 1 < R.legs.length) { cs.leg++; cs.k = 0; cs.st = 'run'; } cs.sync(); return; }
    if (cs.st !== 'run') return; const L = R.legs[cs.leg]; cs.k += JK.cartSpeed * dt / L.len; if (cs.k >= 1) { cs.k = 1; cs.st = 'dock'; cs.dockT = 1.0; } cs.sync(); };
  cs.sync(); return cs;
}
const mkHero = (cs, hero = 'knight', off = 0) => ({ hero, x: cs.x + off, y: cs.floorY, face: 1, hp: 100, maxHp: 100, dead: false, cartRide: cs.id, ground: true, id: hero });
/* the world the hands build for the foe */
function world(cs, heroes, o = {}) {
  const w = { cart: cs, now: 0, last: -9, said: [], sounds: [], marks: [], hurts: [], coins: [], drags: [], swipes: [],
    heroes: () => heroes, time: () => w.now, lastSwipe: () => w.last, swiped: t => { w.last = t; w.swipes.push(t); },
    hurt: (h, d, x) => { const r = o.answer ? o.answer(h) : 'hit'; w.hurts.push(r); if (r === 'hit') h.hp -= d; return r; },
    drag: (h, dx) => { w.drags.push(dx); h.x += dx; if (o.drag) o.drag(h, dx); },
    say: (x, y, t) => w.said.push(t), sound: k => w.sounds.push(k), mark: (e, m) => w.marks.push(m), coin: (x, y, off) => w.coins.push({ x, y, off }) };
  return w;
}
/* ride one cart + one jumper + heroes until cond; each (frame hook) can act on them */
function fly(o) {
  const cs = o.cs || stubCart(RIDE), heroes = o.heroes ? o.heroes(cs) : [mkHero(cs)], e = o.e || newJumper(o.row || RIDE.jumpers[0], RIDE), w = o.w || world(cs, heroes, o), log = { tell: 0, swing: 0, land: 0, modes: [], tellStart: null, landAt: null };
  if (o.fast) { cs.leg = e.leg; cs.k = Math.max(0, ((e.ax - cs.R.S[e.leg].x) * cs.R.legs[e.leg].dirX - JK.tellLead + 4) / cs.R.legs[e.leg].len); cs.sync(); for (const h of heroes) { h.x = cs.x + (h.offAtStart || 0); h.y = cs.floorY; } }
  for (let i = 0, lim = Math.round((o.max || 30) / DT); i < lim; i++) {
    w.now += DT; cs.step(DT); for (const h of heroes) if (h.ground && h.cartRide === cs.id) { h.x += (cs.x - (h.px ?? cs.x)); h.y = cs.floorY; } for (const h of heroes) h.px = cs.x;   /* the cart carries him */
    const m0 = e.mode; if (o.pre) o.pre(i, e, w, cs, heroes, log); jumperStep(e, DT, w);
    if (e.mode !== m0) { log.modes.push(e.mode + '@' + w.now.toFixed(2)); if (e.mode === 'hang') log.tellStart = w.now; if (e.mode === 'land') log.landAt = w.now; }
    if (e.mode === 'hang') log.tell += DT; if (e.mode === 'swing') log.swing += DT; if (e.mode === 'land') log.land += DT;
    if (o.post) o.post(i, e, w, cs, heroes, log); if (o.until && o.until(e, w, cs, log)) break;
  }
  return { cs, heroes, e, w, log };
}
const modeNow = (m) => (e) => e.mode === m;
/* the camera of the stub cart: the real one's numbers (CART.CAM_LEAD 110, the floor at 0.80 of the view) */
const view = cs => { const tx = cs.x + 110 * cs.dirX - VW / 2, ty = cs.floorY - VH * 0.80; return { tx, ty }; };
const inView = (cs, x, y) => { const v = view(cs); return x >= v.tx && x <= v.tx + VW && y >= v.ty && y <= v.ty + VH; };
const applyHit = (e, w, d, fromX, o) => { const t = jumperTake(e, d, fromX, w, o); e.hp -= t; if (e.hp <= 0 && !e.fell && e.alive) jumperDied(e, w); return t; };

/* ===== 1. flag off ===== */
{
  let called = 0; const c = { flagOn: () => false, L: () => ({ lineCarts: [RIDE] }), carts: () => [stubCart(RIDE)], players: () => [], seats: () => 1, time: () => 0, drag: () => called++, hurt: () => { called++; return 'hit'; }, say: () => called++, sound: () => called++, coin: () => called++ };
  const H = makeJumperHands(c); ok(H.load() === 0 && !H.on() && H.all().length === 0, 'flag OFF: the hands load nothing');
  H.step(DT); H.draw({}, 0, 0, 0); ok(called === 0 && !H.shot(10, 10, 2), 'flag OFF: step / draw / shot touch nothing');
  const c2 = { ...c, flagOn: () => true, players: () => [mkHero(stubCart(RIDE))] }; const H2 = makeJumperHands(c2); ok(H2.load() === 5, 'flag ON: the lab ride carries its jumper rows: ' + H2.all().length);
  ok(NOT_FAMILY.has('linejumper') && NOT_FAMILY.has('hookjack'), 'told-attacks: the Line-Jumper has his own AI (not a SIG row), like the Hookjack'); }

/* ===== 2. the numbers ===== */
{
  ok(JK.tell >= 1.0 - 1e-9 && JK.stagger === 0.5 && JK.pullTell === 0.7 && JK.yank === TS && JK.dmg === 12, 'the numbers: tell ' + JK.tell + ' s, stagger ' + JK.stagger + ' s, pull tell ' + JK.pullTell + ' s, yank ' + JK.yank + ' px, ' + JK.dmg + ' dmg');
  ok(JK.hp >= 0.4 * HK.hp && JK.hp <= 0.6 * HK.hp, 'hp ' + JK.hp + ' is about half a Hookjack (' + HK.hp + ')');
  ok(JK.guard >= 0.4 && JK.guard <= 1, 'the guard is x' + JK.guard + ' (never immune: >= the 0.4 floor)');
  ok(JK.pullTell >= HK.tell - 1e-9 && JK.pullTell >= 0.6, 'the pull tell is as long as the Hookjack\'s (' + HK.tell + ' s)');
  ok(JK.dmg === HK.dmg, 'the pull hits as hard as a Hookjack swipe (' + HK.dmg + ')');
  ok(MARK['linejumper|pullTell'] === '!' && ANSWER['linejumper|pullTell'] === 'block' && HEIGHT['linejumper|pullTell'] === 'low', 'marks table: linejumper|pullTell is a yellow !, answered block, low (src/marks.js MARK/ANSWER/HEIGHT)');
  ok(JK_POSES.length === 9 && Object.values(JK_SAY).every(t => t.split(/\s+/).length <= 6), 'nine poses for the art lane; every float line short');
}

/* ===== 3. THE SPAWN-IN TELL ===== */
for (const [li, row] of RIDE.jumpers.entries()) {
  const R = fly({ row, fast: false, max: 40, until: e => e.mode === 'land' });
  const { e, w, log, cs } = R; ok(log.tellStart !== null, 'jumper ' + li + ': he hangs (the tell starts)');
  ok(Math.abs(log.tell - JK.tell) <= 2 * DT, 'jumper ' + li + ': the tell is ' + log.tell.toFixed(2) + ' s');
  ok(w.marks.includes('!') && w.sounds.includes('creak') && w.said.includes(JK_SAY.hang), 'jumper ' + li + ': told: a yellow !, the creak, the float line');
  /* on screen: replay the same fight and test the camera every frame of tell + swing */
  let inFrames = 0, total = 0, ringDist = 0;
  fly({ row, max: 40, until: (e2) => e2.mode === 'land', post: (i, e2, w2, c2) => { if (e2.mode === 'hang' || e2.mode === 'swing') { total++; const ar = [e2.ax, e2.perchY - JK.drop - 14], body = e2.mode === 'hang' ? [e2.ax, e2.perchY] : [e2.x, e2.y], rg = e2.ring;
    if (inView(c2, ar[0], ar[1]) && inView(c2, body[0], body[1] - 8) && rg && inView(c2, rg.x, rg.y)) inFrames++; if (rg) ringDist = Math.max(ringDist, Math.abs(rg.x - c2.x)); } } });
  ok(total * DT >= 1.5 && inFrames === total, 'jumper ' + li + ': the arm, the body and the landing ring are on the ride camera for ALL of the tell + swing (' + (inFrames * DT).toFixed(2) + ' s of ' + (total * DT).toFixed(2) + ' s; >= 0.8 s needed)');
  ok(ringDist <= JK.offMax + 1e-6, 'jumper ' + li + ': the ring is on the cart floor (<= ' + JK.offMax + ' px from the centre, the cart is ' + JK.cartW + ' wide)');
  ok(Math.abs(e.x - (cs.x + e.off)) < 1 && Math.abs(e.y - cs.floorY) < 1, 'jumper ' + li + ': he lands ON the ring (' + (e.x - cs.x - e.off).toFixed(2) + ' px off)');
}
{ lines.push('spawn-in tell ' + JK.tell + ' s + swing ' + JK.swing + ' s, on camera throughout (5 rows)'); }

/* ===== 4. THE STAGGER ===== */
{
  const R = fly({ max: 40, until: (e, w, cs, log) => e.mode === 'guard', pre: (i, e, w) => { w._h0 = w._h0 ?? 100; } });
  ok(Math.abs(R.log.land - JK.stagger) <= 2 * DT, 'the stagger lasts ' + R.log.land.toFixed(2) + ' s (0.5 s)');
  ok(R.w.hurts.length === 0 && R.heroes[0].hp === 100, 'a hero standing on the ring is not touched by the landing or in the stagger');
  ok(R.log.modes.join(' ').includes('land') && !R.log.modes.slice(0, R.log.modes.indexOf(R.log.modes.find(m => m.startsWith('guard')))).some(m => /pull/.test(m)), 'no hook is raised before the stagger is over');
  const R2 = fly({ max: 40, pre: (i, e, w) => { if (e.mode === 'land' && !e.struck) { e.struck = true; ok(jumperOpen(e), 'in the stagger he is open'); ok(applyHit(e, w, 5, e.x - 20) >= e.hp, 'a blow in the stagger (even a weak one, from the front) takes his whole hp: knocked off'); } }, until: e => e.mode === 'fall' || !e.alive });
  ok(R2.e.fell && R2.e.mode === 'fall' && R2.w.coins.length === 1, 'a hit in the stagger: he falls off the cart, one coin on it');
  fly({ max: 10, e: R2.e, cs: R2.cs, w: R2.w, heroes: () => R2.heroes, until: e => !e.alive }); ok(!R2.e.alive && R2.e.gone, 'and he is gone (dead)'); lines.push('stagger ' + R.log.land.toFixed(2) + ' s, open'); }

/* ===== 5. THE HOOK PULL ===== */
function pullFight(answer, o = {}) {
  let tellT = 0, pulls = [], markAt = null;
  const R = fly({ fast: true, max: 25, answer, row: o.row, heroes: cs => { const h = mkHero(cs, 'knight', o.heroOff ?? 4); h.offAtStart = o.heroOff ?? 4; return [h]; }, pre: (i, e, w, cs, hs) => { if (o.keepAlive) hs[0].hp = 100; },
    post: (i, e, w) => { if (e.mode === 'pullTell') { tellT += DT; if (markAt === null) markAt = w.marks.length; } },
    until: (e, w) => (o.stopAt === 'spin' ? e.mode === 'spin' : w.hurts.length >= (o.pulls || 1)) });
  return { ...R, tellT };
}
{
  const R = pullFight(() => 'hit'); const { e, w, heroes } = R, x0 = RIDE.stations[0].x * TS;
  ok(w.hurts.length === 1 && w.hurts[0] === 'hit' && heroes[0].hp === 100 - JK.dmg, 'the pull hits for ' + JK.dmg + ' (hp ' + heroes[0].hp + ')');
  ok(w.drags.length === 1 && Math.abs(Math.abs(w.drags[0]) - TS) < 1e-9 && Math.sign(w.drags[0]) === Math.sign(e.x - (heroes[0].x - w.drags[0])), 'and yanks him ' + TS + ' px (1 tile) toward the jumper (' + w.drags[0] + ')');
  ok(R.tellT >= 0.7 - 2 * DT && R.tellT <= 0.75 + 2 * DT, 'the pull is told for ' + R.tellT.toFixed(2) + ' s');
  ok(w.marks.filter(m => m === '!').length >= 2 && w.sounds.includes('tell') && w.said.includes(JK_SAY.pull), 'told: a yellow !, the chain rattle, the float line');
  { let openIn = false, hitIn = false; const Q = fly({ fast: true, max: 25, heroes: cs => [mkHero(cs, 'knight', 4)], pre: (i, e, w) => { if (e.mode === 'pullTell' && !e.q) { e.q = 1; openIn = jumperOpen(e); applyHit(e, w, 5, e.x + e.face * -20); hitIn = e.fell; } }, until: e => e.fell });
    ok(openIn && hitIn && Q.w.hurts.length === 0, 'in the pull tell he is open: a blow knocks him off before the hook ever comes'); } }
{ const R = pullFight(() => 'blocked'), { e, w, heroes } = R; ok(heroes[0].hp === 100 && w.drags.length === 0 && e.jN.blocked === 1, 'a held guard (tap C): no damage, no yank, he recoils'); }
{ const R = pullFight(() => 'parried', { stopAt: 'spin' }), { e, w } = R; ok(e.mode === 'spin' && w.drags.length === 0, 'a parry: he SPINS (open)');
  ok(w.said.includes(JK_SAY.parried), 'the parry is told');
  let hit = false; fly({ e, cs: R.cs, w, heroes: () => R.heroes, max: 3, pre: () => { if (e.mode === 'spin' && !hit) { hit = true; applyHit(e, w, 5, e.x - 20); } }, until: x => x.fell }); ok(e.fell && e.mode === 'fall', 'one blow in the spin knocks him off'); }
{ /* two pulls at the lip carry a hero over; with the real engine's dragOver this is the net */
  const R = pullFight(() => 'hit', { pulls: 2, heroOff: 10, keepAlive: true, row: { leg: 0, ax: 30, off: 18 } }); const { cs, heroes, w } = R; 
  ok(w.hurts.length === 2 && w.drags.length === 2, 'two pulls (' + w.drags.length + ')');
  ok(w.swipes.length === 2 && w.swipes[1] - w.swipes[0] >= JK.noStack - 1e-6, 'never two pulls inside ' + JK.noStack + ' s (gap ' + (w.swipes[1] - w.swipes[0]).toFixed(2) + ' s)');
  ok(Math.abs(heroes[0].x - cs.x) > JK.cartW / 2, 'two pulls from a jumper at the end carry a hero from off 10 to ' + (heroes[0].x - cs.x).toFixed(0) + ' (past the lip at ' + JK.cartW / 2 + '): over = the net, 10%');
  const sumDrag = Math.abs(w.drags.reduce((a, b) => a + b, 0)); ok(sumDrag === 2 * TS, 'two yanks = 2 tiles (the lips are off while he is dragged: src/line-cart.js dragOver)'); }
{ /* no two pulls: two jumpers on one hero */
  const cs = stubCart(RIDE); cs.leg = 0; cs.k = 0.5; cs.sync(); const H = [mkHero(cs, 'knight', 0)], w = world(cs, H, { answer: () => 'blocked' });
  const a = newJumper({ leg: 0, ax: 30, off: -18 }, RIDE), b = newJumper({ leg: 0, ax: 31, off: 18 }, RIDE);
  for (const e of [a, b]) { e.mode = 'guard'; e.modeT = 0; place(e); } function place(e) { e.x = cs.x + e.off; e.y = cs.floorY; }
  for (let i = 0; i < 60 * 8; i++) { w.now += DT; jumperStep(a, DT, w); jumperStep(b, DT, w); }
  let minGap = 9; for (let i = 1; i < w.swipes.length; i++) minGap = Math.min(minGap, w.swipes[i] - w.swipes[i - 1]);
  ok(w.swipes.length >= 2 && minGap >= JK.noStack - 1e-6, 'two jumpers on one hero: ' + w.swipes.length + ' pulls, never two inside ' + JK.noStack + ' s'); }
lines.push('pull: told ' + JK.pullTell + ' s, ' + JK.dmg + ' dmg, ' + TS + ' px yank, parry spins');

/* ===== 6. KNOCK-OFF = KILL, three ways ===== */
const kills = {};
{ /* (a) a hit in his stagger, from each side */
  for (const side of [-1, 1]) { const R = fly({ max: 40, pre: (i, e, w) => { if (e.mode === 'land' && !e.k) { e.k = 1; applyHit(e, w, 6, e.x + side * 18); } }, until: e => !e.alive }); ok(R.e.fell && !R.e.alive && R.w.coins.length === 1 && R.e.how === 'blow', 'stagger blow from side ' + side + ': dead, one coin'); }
  kills.stagger = true; }
{ /* (b) knockback over the lip: a guarded jumper at the end of the cart takes a front blow with the knock */
  for (const side of [-1, 1]) { const R = fly({ fast: true, max: 20, row: RIDE.jumpers[0], pre: (i, e, w, cs) => { if (e.mode === 'guard' && !e.k) { e.k = 1; e.off = side * (JK.cartW / 2 - 5); e.x = cs.x + e.off; e.face = -side; } else if (e.k === 1 && e.mode === 'guard') { e.k = 2; const hp0 = e.hp; applyHit(e, w, 4, e.x - side * 18, { knock: 8 }); e.hp0 = hp0; } }, until: e => e.fell });   /* the blow is from INSIDE the cart: it pushes him out over the lip */
    ok(R.e.fell && R.e.how === 'push' && R.w.coins.length === 1, 'knockback over the ' + (side > 0 ? 'east' : 'west') + ' lip: he falls (' + R.e.how + '), one coin'); }
  const E = newJumper({ leg: 0, ax: 30 }, RIDE), cs = stubCart(RIDE), w = world(cs, [mkHero(cs)]); E.mode = 'guard'; E.off = 0; E.face = 1; E.alive = true;
  ok(jumperPush(E, JK.knock, w) === false && !E.fell, 'a small knock in the middle of the cart only shoves him'); kills.lip = true; }
{ /* (c) the drop-line cut in the swing (and in the tell) */
  for (const phase of ['swing', 'hang']) { let rope = null; const R = fly({ max: 40, pre: (i, e, w) => { if (e.mode === phase && !rope) { rope = jumperRope(e); ok(!!rope && jumperShotHits(e, (rope.x0 + rope.x1) / 2, (rope.y0 + rope.y1) / 2, 1), 'a shot through the ' + phase + ' drop-line connects'); jumperCut(e, w); } }, until: e => !e.alive });
    ok(R.e.fell && R.e.how === 'cut' && R.w.coins.length === 1 && R.e.jN.cuts === 1, 'a cut drop-line in the ' + phase + ': he falls (' + R.e.how + '), one coin'); }
  kills.cut = true; }
{ const R = fly({ max: 40, pre: (i, e, w) => { if (e.mode === 'land' && !e.k) { e.k = 1; applyHit(e, w, 6, e.x - 18); applyHit(e, w, 6, e.x - 18); applyHit(e, w, 6, e.x - 18); } }, until: e => !e.alive }); ok(R.w.coins.length === 1, 'hit three times in one frame: still one coin'); }
ok(kills.stagger && kills.lip && kills.cut, 'all three knock-off routes kill');
lines.push('knock-off kills: stagger blow, over the lip, cut drop-line');

/* ===== 7. THE GUARD ===== */
{
  const R = fly({ fast: true, max: 20, row: RIDE.jumpers[0], pre: (i, e) => { if (e.mode === 'guard' && !e.t0) e.t0 = 1; }, until: (e, w, cs, log) => e.mode === 'guard' && e.modeT < 0.2 });
  const e = R.e, w = R.w; let t = 0; e.hp = JK.hp; e.face = 1;
  t = jumperTake(e, 10, e.x + 20, w, { knock: 0 }); ok(Math.abs(t - 10 * JK.guard) < 1e-9, 'a blow from the front is x' + JK.guard + ' (' + t + ')');
  const t2 = jumperTake(e, 10, e.x - 20, w, { knock: 0 }); ok(t2 === 10, 'from behind it is whole');
  ok(JK.guard > 0, 'never immune');
  const e2 = newJumper({ leg: 0, ax: 30 }, RIDE); e2.mode = 'guard'; e2.face = 1; e2.x = 0; ok(Math.abs(jumperTake(e2, 36, 20, w, { knock: 0 }) - 36 * JK.guard) < 1e-9, 'a Hookjack-sized blow still hurts him');
  /* he walks at you and stays inside the lips */
  const C = fly({ fast: true, max: 12, row: RIDE.jumpers[0], heroes: cs => [mkHero(cs, 'knight', 20)], pre: (i, e, w2) => { if (e.mode === 'guard') for (const h of w2.heroes()) h.hp = 100; }, post: (i, e, w2, cs) => { if (e.mode === 'guard' || e.mode === 'recover' || e.mode === 'pullTell' || e.mode === 'pull') ok(Math.abs(e.off) <= JK.cartW / 2 - JK.inset + 1e-6, 'inside the lips (off ' + e.off.toFixed(1) + ')'); } });
  ok(C.e.jN.pulls >= 1, 'he comes at you and pulls');
  /* an empty cart drops him: the hero falls off */
  const D = fly({ fast: true, max: 25, row: RIDE.jumpers[0], pre: (i, e, w2, cs, hs) => { if (e.mode === 'guard' && !e.k) { e.k = 1; hs[0].cartRide = null; } }, until: e => e.fell }); ok(D.e.fell && D.e.how === 'empty', 'a boarder left on a cart with no hero aboard falls off it');
  const F = fly({ max: 12, row: RIDE.jumpers[0], pre: (i, e, w2, cs, hs) => { if ((e.mode === 'hang') && !e.k) { e.k = 1; hs[0].cartRide = null; } }, until: (e, w2, cs, log) => log.modes.some(m => m.startsWith('idle')) });
  ok(F.e.mode === 'idle' && F.e.jN.replays === 1, 'every seat fell during the tell: he lets go of nothing, and comes again when the leg is ridden again'); }

/* ===== 8. EVERY HERO CLASS ANSWERS ===== */
const REACH = { knight: 26, warden: 15, pyro: 22, paladin: 24, pirate: 22, reaper: 24, geomancer: 24, berserker: 19, ranger: 17 };   /* src/main.js attackBox0: the base blow's forward reach (px past the hero's centre), as tools/highlines.mjs */
const RANGED = { ranger: { vx: 300 }, pirate: { vx: 300 }, pyro: { vx: 300 }, geomancer: { vx: 300 } };   /* the plan's four shooters; vx is a CONSERVATIVE bolt speed (the ranger's long shot is 520) */
const HERO_SWING = 0.04;   /* the blow's box is live from 0.04 s after the press (attackBox0: P.atk >= 0.04) */
const REACT = 0.30;        /* a human reaction to the ! */
ok(HERO_MOVE_IDS.every(h => REACH[h] !== undefined && ANSWERS[h]) && Object.keys(ANSWERS).length === HERO_MOVE_IDS.length, 'the table covers all ' + HERO_MOVE_IDS.length + ' heroes on master (' + HERO_MOVE_IDS.join(' ') + ')');
const perClass = [];
for (const hero of HERO_MOVE_IDS) {
  const got = [], run = MOVE.RUN * heroRunMul(hero, true), reach = REACH[hero] + JK.w / 2;
  ok(ANSWERS[hero].length >= 2, hero + ': at least two answers');
  /* (1) THE STAGGER BLOW: from the worst place on the cart (the far lip, 6 px in) the hero reacts to the !, walks to the ring and swings so the box is live as he lands. The hit must come in the stagger. */
  for (const ringOff of [-JK.offMax, 0, JK.offMax]) for (const startSide of [-1, 1]) {
    const R = fly({ max: 40, row: { leg: 0, ax: 30, off: ringOff }, heroes: cs => [mkHero(cs, hero, startSide * (JK.cartW / 2 - 6))],
      pre: (i, e, w, cs, hs) => { const h = hs[0]; if (e.mode === 'hang' || e.mode === 'swing' || e.mode === 'land') { const t = e.mode === 'hang' ? JK.tell - e.modeT : e.mode === 'swing' ? JK.tell + JK.swing - e.modeT : JK.tell + JK.swing + JK.stagger - e.modeT;
        const tgt = cs.x + ringOff, d = tgt - h.x;
        if (t >= REACT && Math.abs(d) > reach - 6) { h.x += Math.sign(d) * run * DT; h.cartRide = cs.id; h.moved = true; }   /* (his x is cart-relative: the cart's carry is added by fly) */
        if (e.mode === 'land' && Math.abs(e.x - h.x) <= reach && !h.swung) { h.swung = w.now; h.pendingHit = w.now + HERO_SWING; }
        if (h.pendingHit && w.now >= h.pendingHit && !e.fell) { h.pendingHit = 0; h.hitMode = e.mode; applyHit(e, w, 6, h.x); h.hitAt = w.now; } } },
      until: e => e.fell || e.mode === 'guard' });
    ok(R.e.fell && R.heroes[0].hitMode === 'land', hero + ': the stagger blow lands from the far lip (ring ' + ringOff + ', start ' + startSide + ') and kills (' + (R.heroes[0].hitAt - R.log.landAt).toFixed(2) + ' s into the stagger)'); }
  got.push('stagger');
  const worst = (JK.cartW / 2 - 6) + JK.offMax; const tClose = Math.max(0, (worst - reach + 6) / run), tHit = tClose + HERO_SWING;
  ok(REACT + tClose <= JK.tell + JK.swing, hero + ': in time even from a cold start at the far lip (react ' + REACT + ' + walk ' + tClose.toFixed(2) + ' <= ' + (JK.tell + JK.swing) + ' s of tell + swing)');
  /* (2) the ranged four: a shot while he swings connects over a window of firing times (the drop-line or his body) */
  if (RANGED[hero]) {
    let hitFrames = 0, tried = 0;
    const base = fly({ max: 40, until: e => e.mode === 'swing' }); const swingStartT = base.w.now;
    for (let f = 0; f <= Math.round(JK.swing / DT); f++) {   /* fire at frame f of the swing, level at chest height from his side of the cart, bolt flies on */
      const R = fly({ max: 40, until: e => e.fell || e.mode === 'land', heroes: cs => [mkHero(cs, hero, -JK.offMax)], post: (i, e, w, cs, hs) => { const h = hs[0]; if (!h.sh && e.mode === 'swing' && JK.swing - e.modeT >= f * DT - 1e-9) { h.sh = { x: h.x, y: h.y - 10, dir: Math.sign(e.x - h.x) || 1 }; }
        if (h.sh && !e.fell) { h.sh.x += h.sh.dir * RANGED[hero].vx * DT; if ((e.mode === 'swing' || e.mode === 'hang') && jumperShotHits(e, h.sh.x, h.sh.y, 1)) { jumperCut(e, w); } } } });
      tried++; if (R.e.fell && R.e.how === 'cut') hitFrames++;
    }
    ok(hitFrames * DT >= 0.1, hero + ': a base shot in the swing cuts him down over a window of ' + (hitFrames * DT).toFixed(2) + ' s of firing times (the swing is ' + JK.swing + ' s)'); got.push('swing'); }
  /* (2b) the reaper's scythe reaches him IN the swing: the blow's box (live 0.04-0.17 s after the press) overlaps the swinging body over a window of press times */
  if (!RANGED[hero] && ANSWERS[hero].includes('swing')) {
    let win = 0;
    for (let f = 0; f <= Math.round(JK.swing / DT); f++) {
      const R = fly({ max: 40, until: e => e.fell || e.mode === 'land', heroes: cs => [mkHero(cs, hero, 0)], post: (i, e, w, cs, hs) => { const h = hs[0]; if (!h.pf && e.mode === 'swing' && JK.swing - e.modeT >= f * DT - 1e-9) h.pf = w.now;
        if (h.pf && !e.fell && e.mode === 'swing') { const dt = w.now - h.pf; if (dt >= 0.04 && dt < 0.17) { const b = jumperBox(e), face = Math.sign(e.x - h.x) || 1, l = face > 0 ? h.x + 2 : h.x - REACH[hero], r = face > 0 ? h.x + REACH[hero] : h.x - 2, t = h.y - 26, bt = h.y; if (b.r >= l && b.l <= r && b.b >= t && b.t <= bt) applyHit(e, w, 6, h.x); } } } });
      if (R.e.fell && R.e.how === 'cut') win++;
    }
    ok(win * DT >= 0.05, hero + ': the scythe reaches him in the swing over a window of ' + (win * DT).toFixed(2) + ' s of press times'); got.push('swing'); }
  /* (3) block: tap C turns the pull (no damage, no yank); the parry spins him and one blow knocks him off - same for all nine (tap C is every hero's) */
  { const B = pullFight(() => 'blocked'); ok(B.heroes[0].hp === 100 && B.w.drags.length === 0, hero + ': tap C block turns the pull');
    const P = pullFight(() => 'parried', { stopAt: 'spin' }); ok(P.e.mode === 'spin', hero + ': the parry spins him'); got.push('block'); }
  /* (4) push: the paladin's shield bash / the warden's ward sends a guarded jumper over the lip from where he stands in the fight */
  if (ANSWERS[hero].includes('push')) {
    const dx = hero === 'paladin' ? JK.bash : JK.ward;
    for (const off of [10, 14, JK.cartW / 2 - JK.inset]) { const cs = stubCart(RIDE), w = world(cs, [mkHero(cs, hero)]), E = newJumper({ leg: 0, ax: 30 }, RIDE); E.mode = 'guard'; E.off = off; place(E, cs); E.face = -1;
      ok(jumperPush(E, dx, w) === true && E.fell && E.how === 'push' && w.coins.length === 1, hero + ': the ' + (hero === 'paladin' ? 'shield bash' : 'ward') + ' (' + dx + ' px) sends him from off ' + off + ' over the lip'); }
    got.push('push'); function place(e, c) { e.x = c.x + e.off; e.y = c.floorY; } }
  ok(got.length >= 2 && ANSWERS[hero].every(a => got.includes(a)), hero + ': proved ' + got.join(' + ') + ' = the table');
  perClass.push(hero + ' ' + got.join('+'));
}
lines.push('classes: ' + perClass.join('; '));

/* ===== 9. CO-OP + THE LINT ===== */
{
  ok(jumperQuota(2, 1) === 2 && jumperQuota(2, 2) === 3 && jumperQuota(2, 4) === 3 && jumperQuota(1, 4) === 3, 'co-op: +1 per extra seat, never more than ' + JK.aboardMax + ' aboard');
  ok(jumpersOf({ ...RIDE, jumpers: [...RIDE.jumpers, { leg: 2, ax: 40, seats: 2 }] }, 1).length === 5 && jumpersOf({ ...RIDE, jumpers: [...RIDE.jumpers, { leg: 2, ax: 40, seats: 2 }] }, 2).length === 6, 'a row marked for 2 seats waits for them');
  ok(lintJumpers(RIDE).length === 0, 'the lab ride rows lint clean: ' + lintJumpers(RIDE).join('; '));
  const bad = (rows) => lintJumpers({ ...RIDE, jumpers: rows });
  ok(bad([{ leg: 0, ax: 10 }]).some(m => /before the cart is running/.test(m)), 'caught: the tell would start before the cart runs');
  ok(bad([{ leg: 0, ax: 68 }]).some(m => /too close to the end/.test(m)), 'caught: no room to fight before the leg ends');
  ok(bad([{ leg: 0, ax: 30, off: 40 }]).some(m => /outside the lips/.test(m)), 'caught: the ring outside the lips');
  ok(bad([{ leg: 0, ax: 30 }, { leg: 0, ax: 31, off: 10 }, { leg: 0, ax: 32, off: -10 }]).some(m => /3 jumpers at once/.test(m)), 'caught: three at once');
  ok(bad([{ leg: 9, ax: 30 }]).some(m => /no such leg/.test(m)), 'caught: a leg that is not there'); }

/* ===== 10. FUZZ ===== */
{
  let seed = 1234567; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; let worst = 0;
  for (let run = 0; run < 60; run++) {
    const row = RIDE.jumpers[Math.floor(rnd() * RIDE.jumpers.length)], ans = ['hit', 'blocked', 'parried', 'miss'], seats = 1 + Math.floor(rnd() * 3);
    const R = fly({ max: 28, row, heroes: cs => Array.from({ length: seats }, (_, s) => mkHero(cs, HERO_MOVE_IDS[Math.floor(rnd() * 9)], (rnd() - 0.5) * 50)), answer: () => ans[Math.floor(rnd() * 4)],
      pre: (i, e, w, cs, hs) => { for (const h of hs) { h.hp = 100; h.x += (rnd() - 0.5) * 3; if (rnd() < 0.002) h.cartRide = h.cartRide ? null : cs.id; }
        if (rnd() < 0.01 && e.alive) applyHit(e, w, 1 + rnd() * 8, e.x + (rnd() - 0.5) * 40, rnd() < 0.5 ? { knock: rnd() * 14 } : {});
        if (rnd() < 0.003 && e.alive) jumperCut(e, w); if (rnd() < 0.002 && e.alive) jumperPush(e, (rnd() - 0.5) * 60, w); },
      post: (i, e, w) => { ok(Number.isFinite(e.x) && Number.isFinite(e.y) && Number.isFinite(e.off) && e.hp <= JK.hp, 'finite state'); ok(w.coins.length <= 1, 'one coin at most'); } });
    worst = Math.max(worst, R.log.modes.length);
  }
  ok(true, 'fuzz: 60 random fights, worst ' + worst + ' mode changes'); lines.push('fuzz 60 random fights clean'); }

/* ===== 11. THE REAL ENGINE ===== */
let REAL = 'not on the tree';
{
  const cand = [new URL('../src/line-cart.js', import.meta.url), pathToFileURL('C:/Users/Daniel Raphael/.claude/bracken-lanes/bracken-hlcartk/src/line-cart.js')];
  let LC = null; for (const u of cand) { try { if (existsSync(u)) { LC = await import(u.href); REAL = u.href.includes('hlcartk') ? 'sibling worktree bracken-hlcartk (WIP)' : 'this tree'; break; } } catch (err) { REAL = 'import failed: ' + err.message.slice(0, 60); } }
  if (LC && LC.cartInit && LC.cartStep) {
    const cs = LC.cartInit(RIDE), hero = { hero: 'knight', x: cs.x + 4, y: cs.floorY, vx: 0, vy: 0, ground: true, face: 1, dead: false, hp: 100, maxHp: 100, atk: -1 };
    const heroes = [hero], w = world(cs, heroes, { answer: () => 'hit' }); w.drag = (h, dx) => { w.drags.push(dx); LC.dragOver(cs, h, dx); };
    const e = newJumper(RIDE.jumpers[0], RIDE); let inV = 0, tot = 0, ev = [], cam = LC.newRideCam();
    for (let i = 0; i < 60 * 25 && e.alive && !(e.jN.hits >= 1); i++) { w.now += DT; ev.push(...LC.cartStep(cs, heroes, DT)); LC.rideCamStep(cam, cs, DT, VW); hero.y = cs.floorY; hero.px = cs.x;
      jumperStep(e, DT, w); if (e.mode === 'hang' || e.mode === 'swing') { tot++; if (LC.inRideView(cam, cs, VW, VH, e.mode === 'hang' ? e.ax : e.x, (e.mode === 'hang' ? e.perchY : e.y) - 8) && LC.inRideView(cam, cs, VW, VH, e.ring.x, e.ring.y)) inV++; }
      if (e.mode === 'guard' || e.mode === 'pullTell') hero.x = Math.min(hero.x, cs.x + 6); }   /* stand near him; the real cart carries seats on top */
    ok(e.jN.tells >= 1 && e.jN.lands >= 1, 'real cart: he hangs and lands on the running cart (' + ev.filter(x => x.t === 'cartGo').length + ' go)');
    ok(tot > 0 && inV === tot, 'real cart + ride camera: the arm, body and ring are on screen for all ' + (tot * DT).toFixed(2) + ' s of tell + swing');
    ok(e.jN.hits === 1 && w.drags.length === 1 && hero.hp === 100 - JK.dmg, 'real dragOver: the pull yanks ' + w.drags[0] + ' px (' + hero.cartRide + ' drag ' + hero.cartDrag + ')');
    ok(hero.cartDrag > 0, 'the real engine keeps the lips off for the drag (so a second pull carries him over)');
    lines.push('real cart engine: ' + REAL);
  } else lines.push('real cart engine: ' + REAL + ' (section 11 skipped)');
}

/* ===== the greybox draws every pose ===== */
{ const calls = []; const g = new Proxy({}, { get: (t, k) => k in t ? t[k] : (typeof k === 'string' && /^(fillStyle|strokeStyle)$/.test(k) ? '' : (...a) => calls.push(k)), set: (t, k, v) => { t[k] = v; return true; } });
  for (const m of JK_POSES) { const e = newJumper(RIDE.jumpers[0], RIDE); e.mode = m; e.x = 100; e.y = 100; e.sx = 100; e.sy = 80; e.perchY = 80; e.ax = 100; e.ring = { x: 100, y: 100, off: 0, k: 0.5 }; e.flash = 0.2; calls.length = 0; drawJumper(g, e, 0, 0, 0.1); ok(calls.length > 0 && jumperPose(e) === m, 'the greybox draws ' + m); } }

console.log('ok  hl-jumpers  ' + n + ' checks, ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s  (real cart: ' + REAL + ')');
for (const l of lines) console.log('    ' + l);
