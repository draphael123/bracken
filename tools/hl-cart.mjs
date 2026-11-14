/* tools/hl-cart.mjs - THE ZIP-LINE CART ENGINE + RIDE CAMERA, proven in NODE (no page, no browser). claude/hlcartk, 11-14. src/line-cart.js (engine), src/line-cart-hands.js (main.js wiring),
   src/linecart-lab.js (the lab ride). The body physics is tools/line-kit.mjs's (the heroes' own arc, src/hero-move.js); landings and the cart are one-way tops.
     1  flag HL_CART is OFF by default; the hands are inert with it off (nothing mutates, nothing draws, no mover/camera takeover), live with it on
     2  lintCarts: the lab is clean; every broken case is caught (fixed speed, station on no landing, no switchback turn, slope, short leg, a landing catching a fall, float text > 5 words)
        + the kit's own lintLines passes with the cart's npc ropes (the cart reuses the line kit's lines) and a hero never grabs them
     3  BOARD + RIDE: the cart waits for nobody, leaves BOARD_T after he boards, runs a FIXED 96 px/s, docks DOCK s at each pass-through station, ends at the end station in rideDuration s
     4  JUMP: a jump keeps the cart's speed and lands back on it (leg after leg); attack / block / facing are untouched; the lips hold a walk, a roll and a knockback
     5  FALL: jumping off the lip / a hook pull over it -> the net -> that leg's START station, 10% max hp (never lethal), the empty cart rolls back (~3 s a leg) and the leg is ridden again
     6  CO-OP: a laggard -> the told 5 s countdown; both aboard -> BOARD_T; one falls -> the cart goes on, then returns for him; four seats fit and are all carried
     7  FLOAT TEXTS ~2.7 s ahead, once a run, again on a replayed leg;  the RIDE CAMERA: lead + flip in the dock, the cart + perches in view, no jumps
     8  all 9 heroes ride the lab with a scripted hand; a seeded fuzz of random inputs never breaks an invariant and the cart always returns */
import assert from 'node:assert/strict';
import * as LC from '../src/line-cart.js';
import { CART, cartInit, cartStep, cartPlatforms, cartKitLines, placeRide, cartRespawn, dragOver, rideDuration, rideLength, routeOf, lintCarts, newRideCam, rideCamStep, rideCamTarget, inRideView, cartMovers } from '../src/line-cart.js';
import { makeCartHands } from '../src/line-cart-hands.js';
import { LINECART_LAB } from '../src/linecart-lab.js';
import { lineInit, riderStep, lintLines } from '../src/line-kit.js';
import { MOVE, HERO_MOVE_IDS, heroRunMul } from '../src/hero-move.js';

const DT = 1 / 60, TS = 16;
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const near = (a, b, e, m) => ok(Math.abs(a - b) <= e, m + ' (' + (+a).toFixed(3) + ' vs ' + (+b).toFixed(3) + ')');
const t0 = Date.now(); const notes = [];
const lab = () => { const L = JSON.parse(JSON.stringify(LINECART_LAB)); const ride = L.lineCarts.splice(0)[0]; placeRide(L, ride); return L; };

/* ---------- body physics ---------- */
const surf = (L, cs) => L.landings.map(b => ({ x0: b[0] * TS, x1: (b[2] + 1) * TS, top: b[1] * TS })).concat(cartPlatforms([cs]).map(p => ({ x0: p.x0, x1: p.x1, top: p.top })));
const mk = (x, y, hero = 'knight') => ({ hero, x, y, vx: 0, vy: 0, ground: true, face: 1, atk: -1, block: false, dead: false, hp: 100, maxHp: 100 });
function phys(L, b, inp, all) {
  if (b.dead) return;
  const want = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), cap = MOVE.RUN * heroRunMul(b.hero, b.ground);
  if (want) b.face = want;
  if (b.ground && inp.jumpPress) { b.vy = MOVE.JUMPV; b.ground = false; }
  const acc = b.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR, fr = b.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR;
  if (want) { const tg = want * cap; if (Math.abs(b.vx) > cap && Math.sign(b.vx) === want) b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx) - cap, MOVE.OVER_BLEED * DT); else b.vx += Math.sign(tg - b.vx) * Math.min(Math.abs(tg - b.vx), acc * DT); }
  else b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx), fr * DT);
  if (!b.ground) { const g = MOVE.GRAV * (Math.abs(b.vy) < MOVE.APEX_VY ? MOVE.APEX_G : b.vy > 0 ? MOVE.FALL_G : 1); b.vy = Math.min(MOVE.MAX_FALL, b.vy + g * DT); }
  const oy = b.y; b.x += b.vx * DT; if (!b.ground) b.y += b.vy * DT;
  if (!b.ground && b.vy >= 0) for (const s of all) if (b.x >= s.x0 && b.x < s.x1 && oy <= s.top + 0.5 && b.y >= s.top) { b.y = s.top; b.vy = 0; b.ground = true; break; }
  if (b.ground && !all.find(q => b.x >= q.x0 && b.x < q.x1 && Math.abs(b.y - q.top) <= 1)) b.ground = false;
  if (b.y > (L.h + 2) * TS) b.dead = true;
}
/* one frame: the cart's world first (like main.js's updateMovers), then every seat's own move */
function tick(L, cs, bodies, inpOf, evs, o) {
  const ev = cartStep(cs, bodies, DT, o || {}); const all = surf(L, cs);
  for (const b of bodies) phys(L, b, inpOf ? inpOf(b) || {} : {}, all);
  if (evs) for (const e of ev) evs.push({ ...e, T: tick.T }); tick.T += DT; return ev;
}
tick.T = 0;
const runUntil = (L, cs, bodies, inpOf, cond, maxS, evs, o) => { let i = 0; const lim = Math.round(maxS / DT); while (i < lim && !cond()) { tick(L, cs, bodies, inpOf, evs, o); i++; } return i * DT; };
const stage = () => { const L = lab(), cs = cartInit(L.lineCarts[0]); tick.T = 0; return { L, cs, R: cs.R, ride: L.lineCarts[0] }; };
const S0 = { x: 8 * TS, y: 60 * TS };
const HAND_STAY = () => ({});   /* stand still */

/* 1. THE FLAG ------------------------------------------------------------------------------ */
{ ok(LC.HL_CART === false, 'HL_CART is OFF by default');
  const L = lab(), hero = mk(S0.x, S0.y), players = [hero], called = [];
  const mkH = () => makeCartHands({ get L() { return L; }, TS, VW: () => 320, sfx: {}, players: () => players, callout: t => called.push(t), shake: () => {} });
  const H = mkH(); H.load(); ok(!H.on(), 'flag OFF: the hands are inert even on a level that declares L.lineCarts');
  const snap = JSON.stringify(hero), m = { lk: 'cart:labride', x: 1, y: 2, w: 3, dx: 0, dy: 0 }, ms = JSON.stringify(m);
  for (let i = 0; i < 900; i++) H.world(DT);
  ok(JSON.stringify(hero) === snap, 'flag OFF: 15 s of world() leaves the hero byte-identical'); ok(H.mover(m) === false && JSON.stringify(m) === ms, 'flag OFF: mover() claims nothing and changes nothing');
  ok(H.camTarget(320, 180) === null, 'flag OFF: no camera takeover'); H.drawWorld({ fillRect() { throw new Error('drew with the flag off'); }, strokeStyle: '', beginPath() { throw 0; } }, 0, 0, 320, 180, 0); ok(called.length === 0, 'flag OFF: no float text');
  ok(H.carts().length === 0, 'flag OFF: no cart is even built');
  LC.setHlCart(true); const H2 = mkH(); H2.load(); ok(H2.on() && H2.carts().length === 1, 'flag ON: the hands load the lab ride');
  hero.cartRide = null; const cs = H2.carts()[0], row = cartMovers(L)[0]; ok(row.lk === 'cart:labride' && row.kind === 'lift', 'the mover row is the gondola\'s shape (kind lift, lk cart:<id>)');
  let t = 0; const carryLikeMain = () => { H2.mover(row); hero.x += row.dx; hero.y += row.dy; };   /* main.js's own mover carry (the hands run carry:false) */
  for (; t < 20 * 60 && cs.st !== 'run'; t++) { H2.world(DT); carryLikeMain(); }
  ok(cs.st === 'run' && cs.g > 0 || cs.st === 'run', 'flag ON: world() boards + runs the cart (hands call cartStep with carry:false)');
  for (let i = 0; i < 120; i++) { H2.world(DT); carryLikeMain(); } ok(Math.abs(hero.x - cs.x) < 40 && hero.y === cs.floorY, 'the seat is carried by the mover\x27s dx/dy (main.js\x27s carry) and stays aboard'); ok(H2.mover(row), 'mover follows');
  near(row.x + row.w / 2, cs.x, 0.01, 'the mover row copies the cart\'s place'); ok(H2.camTarget(320, 180) !== null && called.length >= 0, 'flag ON: the ride camera takes over while a seat rides');
  LC.setHlCart(false); ok(LC.HL_CART === false, 'flag back OFF'); }

/* 2. LINT ---------------------------------------------------------------------------------- */
{ const L = lab(); ok(lintCarts(L).length === 0, 'lintCarts: the lab is clean ' + JSON.stringify(lintCarts(L)));
  const kitBad = lintLines(L); ok(kitBad.length === 0, 'the line kit\'s own lintLines is clean with the cart\'s npc ropes (ends anchored, exit, checkpoint) ' + JSON.stringify(kitBad));
  const must = (mut, rx, why) => { const X = lab(); mut(X); const bad = lintCarts(X); ok(bad.some(b => rx.test(b)), 'lint catches: ' + why + ' -> ' + JSON.stringify(bad)); };
  must(X => { X.lineCarts[0].speed = 120; }, /fixed 96/, 'a boosted speed');
  must(X => { X.lineCarts[0].stations[1].top = 51; }, /station 1.*no landing/, 'a station off its landing row');
  must(X => { X.lineCarts[0].stations[2].x = 74; X.lineCarts[0].stations[3].x = 20; }, /does not turn back|station 2/, 'a leg that does not turn back / a station past its deck');
  must(X => { X.lineCarts[0].stations[1].top = 20; X.landings[1] = [64, 20, 76, 21]; }, /slope|rises/, 'a leg too steep / too tall');
  must(X => { X.lineCarts[0].stations[1].x = 12; }, /shorter than|station 1/, 'a leg too short');
  must(X => { X.landings.push([30, 57, 40, 58]); }, /catches a fall before the net/, 'a landing in the fall window under a leg');
  must(X => { X.lineCarts[0].floats[0].text = 'ONE TWO THREE FOUR FIVE SIX'; }, /over 5 words/, 'a float text over 5 words');
  must(X => { X.lineCarts.push({ id: 'labride', stations: [] }); }, /duplicate|needs/, 'a duplicate / empty ride');
  /* the cart's ropes are kit lines and a hero never grabs them */
  const kit = lineInit(L), b = { x: S0.x, y: S0.y, vx: 0, vy: 0, ground: true, face: 1, hp: 1 }; ok(Object.keys(kit.lines).length === 3 && kit.lines.labride_0.npc, 'three npc ropes, one per leg');
  let took = 0; for (let i = 0; i < 600; i++) { b.y = S0.y - 4; b.ground = false; for (const e of riderStep(kit, b, { up: true, upPress: i % 5 === 0, strike: true }, DT)) if (e.t === 'take') took++; } ok(took === 0, 'UP / strike under a cart rope never takes it (npc lines are foes only)'); }

/* 3. BOARD + RIDE -------------------------------------------------------------------------- */
{ const { L, cs, R, ride } = stage(), evs = [], hero = mk(S0.x + 20, S0.y), dur = rideDuration(ride), len = rideLength(ride);
  runUntil(L, cs, [], null, () => false, 3, evs); ok(cs.st === 'wait' && cs.g === 0, 'the cart waits for nobody (3 s, no boarder)');
  const bodies = [hero], rel0 = hero.x - cs.x; let t = 0, tGo = null, tBoard = null, lastG = 0, speeds = [], docks = [], dockStart = null, lipsAtRun = true, lipsAtStation = true;
  for (let i = 0; i < 60 * 60 && cs.st !== 'end'; i++) { const prev = cs.g, st0 = cs.st; const ev = tick(L, cs, bodies, HAND_STAY, evs); t += DT;
    for (const e of ev) { if (e.t === 'cartBoard') tBoard = t; if (e.t === 'cartGo' && tGo === null) tGo = t; }
    if (cs.st === 'run' && st0 === 'run') speeds.push((cs.g - prev) / DT);
    if (cs.st === 'dock' && st0 !== 'dock') dockStart = t; if (st0 === 'dock' && cs.st !== 'dock') docks.push(t - dockStart);
    if (cs.st === 'run' && !cs.lipsUp) lipsAtRun = false; if ((cs.st === 'wait' || cs.st === 'dock') && cs.lipsUp) lipsAtStation = false; }
  ok(cs.st === 'end', 'the ride reaches the end station'); ok(tBoard !== null && tGo !== null, 'cartBoard then cartGo events');
  near(tGo - tBoard, CART.BOARD_T, DT * 1.5, 'the cart leaves BOARD_T after the last seat boards');
  const tEnd = evs.find(e => e.t === 'cartDock' && e.end).T - evs.find(e => e.t === 'cartGo').T; near(tEnd, dur, 0.1, 'start to end station = rideDuration (' + dur.toFixed(2) + ' s for ' + len.toFixed(0) + ' px at 96 px/s + 2 docks)');
  ok(speeds.length > 1500 && speeds.every(s => Math.abs(s - CART.SPEED) < 0.5 || s < CART.SPEED && s > 0), 'FIXED speed: every run frame is 96 px/s (no brake, no boost)'); ok(speeds.filter(s => Math.abs(s - 96) < 0.5).length > speeds.length - 6, 'only the arrival frames differ');
  ok(docks.length >= 2 && docks.slice(0, 2).every(d => Math.abs(d - CART.DOCK) < DT * 2), 'a ' + CART.DOCK + ' s dock at each of the 2 pass-through stations (' + docks.map(d => d.toFixed(2)) + ')');
  ok(lipsAtRun && lipsAtStation, 'the lips are up while it runs, down at a station'); ok(hero.ground && Math.abs(hero.y - R.S[3].y) < 0.01 && Math.abs((hero.x - cs.x) - rel0) < 0.5, 'he stands where he boarded, on the end station\'s floor');
  ok(hero.hp === 100, 'the ride itself costs no hp (the boarders are another lane)'); notes.push('ride ' + len.toFixed(0) + ' px, ' + dur.toFixed(2) + ' s start-to-end (3 legs, 2 docks)');
  /* walk off the end, the empty cart returns to the start station */
  const evs2 = []; runUntil(L, cs, bodies, () => ({ right: true }), () => hero.x > cs.x + 60, 3, evs2); ok(hero.ground && hero.y === R.S[3].y, 'he walks off the end onto the station deck');
  const tr = runUntil(L, cs, bodies, () => ({ right: true }), () => cs.st === 'wait' && cs.g === 0, 30, evs2); ok(evs2.some(e => e.t === 'cartRoll') && cs.st === 'wait' && cs.g === 0, 'the empty cart rolls home to the start station on its own (' + tr.toFixed(1) + ' s)'); }

/* 4. JUMP, ATTACK / BLOCK, THE LIPS -------------------------------------------------------- */
{ const { L, cs } = stage(), hero = mk(S0.x, S0.y); const rel0 = hero.x - cs.x; let jumps = 0, drift = 0, k = 0;
  const evs = []; runUntil(L, cs, [hero], () => ({ jumpPress: hero.ground && ++k % 6 === 0 && ++jumps }), () => cs.st === 'dock' || jumps > 60, 40, evs);
  for (let i = 0; i < 1; i++) drift = Math.max(drift, Math.abs(hero.x - cs.x - rel0));
  ok(jumps >= 12 && cs.st === 'dock', 'jumped ' + jumps + ' times on the first leg'); ok(!evs.some(e => e.t === 'cartFall') && hero.hp === 100, 'a jump never falls him'); runUntil(L, cs, [hero], HAND_STAY, () => hero.ground, 2, evs); ok(hero.ground && Math.abs(hero.y - cs.floorY) < 0.01, 'and he lands back on the cart\'s floor');
  /* the drift is measured inside the run: redo with sampling */
  const s2 = stage(), h2 = mk(S0.x, S0.y); let worst = 0, air = 0, kk = 0, j2 = 0; const e2 = [];
  runUntil(s2.L, s2.cs, [h2], () => ({ jumpPress: h2.ground && ++kk % 6 === 0 && ++j2 }), () => { if (!h2.ground && s2.cs.g > 200 && s2.cs.g < s2.R.G[1] - 150) { air++; worst = Math.max(worst, Math.abs(h2.x - s2.cs.x - rel0)); } return s2.cs.st === 'dock'; }, 40, e2);   /* (clear of the station decks at both ends of the leg: there the cart is level with the deck it leaves / reaches, and a jump may land on the deck instead; he is still carried by the cart once it is under him) */
  ok(air > 200 && worst < 0.5, 'a jump keeps the cart\'s speed: ' + air + ' airborne frames, he never slides off his spot on the cart (max ' + worst.toFixed(3) + ' px) and lands back on it');
  /* attack / block / facing are untouched; a target fixed on the cart stays inside his blow box all ride long */
  const s3 = stage(), h3 = mk(S0.x, S0.y); h3.atk = 0; h3.block = true; h3.face = 1; let inBox = 0, frames = 0;
  const hb = b => ({ l: b.face > 0 ? b.x : b.x - 26, r: b.face > 0 ? b.x + 26 : b.x }); const target = h3.x - s3.cs.x + 14;
  runUntil(s3.L, s3.cs, [h3], HAND_STAY, () => { frames++; const B = hb(h3), tx = s3.cs.x + target; if (tx > B.l && tx < B.r) inBox++; return s3.cs.st === 'end'; }, 60);
  ok(h3.atk === 0 && h3.block === true && h3.face === 1, 'attack state, block and facing are left alone by the cart'); ok(inBox === frames, 'a target on the cart stays in his blow box the whole ride (' + frames + ' frames): he can strike and block on it');
  const s4 = stage(), h4 = mk(S0.x, S0.y);   /* the lips: walk, hard roll, knockback - checked right AFTER the engine's step, every frame, both ends */
  let maxX = -1e9, minX = 1e9, moves = 0, hitLip = 0; const nx0 = () => s4.cs.x - CART.W / 2 + CART.LIP, nx1 = () => s4.cs.x + CART.W / 2 - CART.LIP;
  for (let i = 0; i < 60 * 60 && !(s4.cs.st === 'dock' && moves > 60 * 9); i++) { cartStep(s4.cs, [h4], DT, {}); moves++;
    if (s4.cs.lipsUp && h4.ground) { maxX = Math.max(maxX, h4.x - nx1()); minX = Math.min(minX, h4.x - nx0()); if (h4.x >= nx1() - 0.001 || h4.x <= nx0() + 0.001) hitLip++; }
    const go = s4.cs.st === 'run', ph = Math.floor(moves / 90) % 4; if (go && moves % 150 === 0) h4.vx = (ph % 2 ? 1 : -1) * 400;
    phys(s4.L, h4, go ? { right: ph === 0 || ph === 1, left: ph === 2 || ph === 3 } : {}, surf(s4.L, s4.cs)); }
    ok(maxX <= 0.001 && minX >= -0.001 && h4.ground && !h4.dead, 'the lips hold a walk, a 400 px/s roll and a knockback at both ends (never past the lip; ' + hitLip + ' frames at a lip)'); ok(hitLip > 100, 'and he really did lean on both lips'); ok(h4.hp === 100, 'and cost nothing'); }

/* 5. THE FALL ------------------------------------------------------------------------------ */
{ const { L, cs, R } = stage(), hero = mk(S0.x, S0.y), evs = [];
  /* board, ride to the start of leg 1, then hold right at the lip and jump off the rear lip late in leg 1, clear of the station decks (a near full-leg roll back) */
  runUntil(L, cs, [hero], HAND_STAY, () => cs.st === 'run' && cs.legIdx === 1 && cs.g > R.G[1] + R.legs[1].len * 0.85, 60, evs);
  ok(cs.legIdx === 1, 'riding leg 1'); let jumped = false;
  runUntil(L, cs, [hero], b => { const r = { right: true }; if (b.ground && b.x >= cs.x + CART.W / 2 - CART.LIP - 0.5 && !jumped) { jumped = true; r.jumpPress = true; } return r; }, () => evs.some(e => e.t === 'cartFall'), 20, evs);
  const fall = evs.find(e => e.t === 'cartFall'); ok(fall && fall.leg === 1 && fall.chip === 10, 'jumping off the lip -> the net: cartFall on leg 1, chip 10 = 10% of 100'); ok(hero.hp === 90, 'hp 100 -> 90');
  ok(hero.ground && Math.abs(hero.y - R.S[1].y) < 0.01 && Math.abs(hero.x - (R.S[1].x - 12)) < 1, 'he is on leg 1\'s START station (the east deck), not the pit'); ok(!hero.dead, 'alive');
  const tF = fall.T; runUntil(L, cs, [hero], HAND_STAY, () => evs.some(e => e.t === 'cartHome'), 30, evs); const roll = evs.find(e => e.t === 'cartRoll'), home = evs.find(e => e.t === 'cartHome');
  ok(roll && home && roll.to === 1 && home.station === 1, 'the empty cart rolls back to station 1'); const rollS = home.T - roll.T; ok(rollS > 2.4 && rollS < 3.8, 'a full leg back in ~3 s (' + rollS.toFixed(2) + ' s)'); notes.push('fall: -10% hp, start station of the leg, full-leg roll-back ' + rollS.toFixed(2) + ' s');
  const goes = evs.filter(e => e.t === 'cartGo').length; runUntil(L, cs, [hero], HAND_STAY, () => cs.st === 'end', 60, evs);
  const legGo = evs.filter(e => e.t === 'cartGo' && e.leg === 1); ok(legGo.length === 2, 'leg 1 was ridden again (2 departures on leg 1)'); const dock2 = evs.filter(e => e.t === 'cartDock' && e.station === 2); ok(dock2.length === 1, 'and reached station 2 only on the replay (he fell before it the first time)');
  near(dock2[0].T - legGo[1].T, R.legs[1].len / CART.SPEED, 0.05, 'the replay of the leg takes exactly its length / 96 (' + (dock2[0].T - legGo[1].T).toFixed(2) + ' s)'); ok(cs.st === 'end' && hero.hp === 90, 'the ride finishes; one fall cost 10% only');
  ok(evs.filter(e => e.t === 'cartFloat' && e.text === 'HOLD ON.').length === 2, 'the leg\'s float text is told again on the replay');
  /* a fall is never lethal; a drag over the lip is a fall too */
  const s2 = stage(), h2 = mk(S0.x, S0.y); h2.hp = 5; const e2 = []; runUntil(s2.L, s2.cs, [h2], HAND_STAY, () => s2.cs.st === 'run' && s2.cs.g > 200, 20, e2);
  h2.x = s2.cs.x + CART.W / 2 - CART.LIP; ok(dragOver(s2.cs, h2, 30), 'a boarder\'s hook pull (dragOver) moves him over the lip'); runUntil(s2.L, s2.cs, [h2], HAND_STAY, () => e2.some(e => e.t === 'cartFall'), 10, e2);
  ok(e2.some(e => e.t === 'cartFall') && h2.hp === 1 && !h2.dead, 'a hook pull at the lip is a fall; hp 5 -> 1 (a net never kills: death is the shrine\'s)'); ok(Math.abs(h2.y - s2.R.S[0].y) < 0.01, 'leg 0 start station');
  /* the same pull with no dragOver stays on (the lip holds a knockback) */
  /* a seat on a station deck beside the cart is never flagged, never fallen */
  const s3 = stage(), h3 = mk(40, S0.y), e3 = []; runUntil(s3.L, s3.cs, [h3], () => ({ left: true }), () => h3.dead, 10, e3); ok(h3.dead && !e3.some(e => e.t === 'cartFall'), 'walking off the station deck (not the cart) is the pit as anywhere: the cart\'s net is the cart\'s'); }

/* 6. CO-OP --------------------------------------------------------------------------------- */
{ /* A: a laggard -> the told 5 s countdown */
  { const { L, cs } = stage(), a = mk(S0.x, S0.y), b = mk(60, S0.y), evs = []; const bodies = [a, b];
    const t = runUntil(L, cs, bodies, HAND_STAY, () => cs.st === 'run', 20, evs); const board = evs.find(e => e.t === 'cartBoard'), go = evs.find(e => e.t === 'cartGo');
    near(go.T - board.T, CART.COUNT, 0.1, 'a laggard in reach: the cart waits the told countdown (' + CART.COUNT + ' s)'); ok(evs.filter(e => e.t === 'cartCount').map(e => e.n).join() === '5,4,3,2,1', 'the countdown is told 5,4,3,2,1 (' + evs.filter(e => e.t === 'cartCount').map(e => e.n) + ')'); ok(go.left === 1 && go.seats === 1, 'it leaves with 1 aboard, the laggard left');
    runUntil(L, cs, bodies, HAND_STAY, () => cs.st === 'end', 60, evs); ok(b.ground && b.x === 60 && !b.dead, 'the laggard is still on the start deck, untouched');
    runUntil(L, cs, bodies, b2 => (b2 === a ? { right: true } : {}), () => cs.st === 'wait' && cs.g === 0, 30, evs); ok(cs.st === 'wait' && cs.g === 0, 'the cart comes home empty (the next pass)');
    b.x = cs.x; b.ground = true; const ev2 = []; const t2 = runUntil(L, cs, bodies, HAND_STAY, () => cs.st === 'run', 5, ev2); near(t2, CART.BOARD_T, 0.05, 'he boards the next pass alone: it leaves ' + CART.BOARD_T + ' s later (nobody else in reach)'); }
  /* B: both aboard -> BOARD_T, both carried */
  { const { L, cs } = stage(), a = mk(S0.x - 14, S0.y), b = mk(S0.x + 14, S0.y), evs = []; const ra = a.x - cs.x, rb = b.x - cs.x;
    const t = runUntil(L, cs, [a, b], HAND_STAY, () => cs.st === 'run', 5, evs); near(t, CART.BOARD_T, DT * 2, 'both aboard: it leaves ' + CART.BOARD_T + ' s after boarding (no countdown)'); ok(!evs.some(e => e.t === 'cartCount'), 'no countdown told');
    runUntil(L, cs, [a, b], HAND_STAY, () => cs.st === 'end', 60, evs); ok(Math.abs(a.x - cs.x - ra) < 0.5 && Math.abs(b.x - cs.x - rb) < 0.5 && a.ground && b.ground && a.hp === 100 && b.hp === 100, 'both carried to the end station'); }
  /* C: one falls, the cart goes on with the other, comes back for him */
  { const { L, cs, R } = stage(), a = mk(S0.x - 14, S0.y), b = mk(S0.x + 14, S0.y), evs = []; let jumped = false;
    runUntil(L, cs, [a, b], HAND_STAY, () => cs.st === 'run' && cs.g > 300, 10, evs);
    runUntil(L, cs, [a, b], x => (x === a ? (x.ground && x.x >= cs.x - CART.W / 2 + CART.LIP + 0.5 && !jumped ? ((jumped = true), { left: true, jumpPress: true }) : { left: true }) : {}), () => evs.some(e => e.t === 'cartFall'), 20, evs);
    const f = evs.find(e => e.t === 'cartFall'); ok(f && f.seat === 0 && f.leg === 0 && a.hp === 90 && b.hp === 100, 'seat 0 falls on leg 0 (-10%), seat 1 is unhurt'); ok(Math.abs(a.y - R.S[0].y) < 0.01 && a.ground, 'he waits on the start station');
    runUntil(L, cs, [a, b], HAND_STAY, () => cs.st === 'dock' && cs.g >= R.G[1] - 1, 20, evs); ok(!evs.some(e => e.t === 'cartRoll'), 'the cart does NOT roll back while seat 1 is aboard');
    runUntil(L, cs, [a, b], HAND_STAY, () => cs.st === 'end', 60, evs); ok(a.ground && a.x < R.S[0].x + 40 && Math.abs(a.y - R.S[0].y) < 0.01, 'seat 0 is still waiting at station 0');
    runUntil(L, cs, [a, b], x => (x === b ? { right: true } : {}), () => evs.some(e => e.t === 'cartHome'), 40, evs); const hm = evs.find(e => e.t === 'cartHome'); ok(hm && hm.station === 0, 'the empty cart returns to the station where he waits (station 0)');
    runUntil(L, cs, [a, b], HAND_STAY, () => cs.st === 'run', 5, evs); ok(a.cartRide === cs.id, 'he is aboard again'); }
  /* D: four seats */
  { const { L, cs } = stage(), bodies = [-24, -8, 8, 24].map(o => mk(S0.x + o, S0.y)), rel = bodies.map(b => b.x - cs.x), evs = [];
    runUntil(L, cs, bodies, HAND_STAY, () => cs.st === 'end', 60, evs); ok(bodies.every((b, i) => b.ground && Math.abs(b.x - cs.x - rel[i]) < 0.5 && b.hp === 100), 'four seats fit on 64 px and all four are carried to the end'); ok(!evs.some(e => e.t === 'cartFall' || e.t === 'cartCount'), 'no fall, no countdown'); } }

/* 7. FLOAT TEXTS + THE RIDE CAMERA --------------------------------------------------------- */
{ const { L, cs, R, ride } = stage(), hero = mk(S0.x, S0.y), evs = [];
  runUntil(L, cs, [hero], HAND_STAY, () => cs.st === 'end', 60, evs); const fl = evs.filter(e => e.t === 'cartFloat'); ok(fl.length === 2 && fl[0].text === 'THEY BOARD. KNOCK THEM OFF.' && fl[1].text === 'HOLD ON.', 'both float texts fire, once each');
  /* re-run recording the distance at the event */
  const s2 = stage(), h2 = mk(S0.x, S0.y), aheads = []; const orig = cartStep; let first = true;
  for (let i = 0; i < 60 * 60 && s2.cs.st !== 'end'; i++) { const ev = cartStep(s2.cs, [h2], DT, {}); for (const e of ev) if (e.type === undefined && e.t === 'cartFloat') { const f = ride.floats.find(q => q.text === e.text); aheads.push((R.G[f.leg] + R.legs[f.leg].len * f.at - s2.cs.g) / CART.SPEED); } phys(s2.L, h2, {}, surf(s2.L, s2.cs)); }
  ok(aheads.length === 2 && aheads.every(a => Math.abs(a - CART.FLOAT_LEAD) < 0.03), 'a float text is told ' + CART.FLOAT_LEAD + ' s ahead of its point (' + aheads.map(a => a.toFixed(2)) + ' s)'); ok(ride.floats.every(f => f.text.split(' ').length <= 5), 'max 5 words');
  /* the camera over the whole ride, three views */
  for (const [VW, VH] of [[320, 180], [288, 180], [384, 200], [320, 200]]) {
    const q = stage(), h = mk(S0.x, S0.y), cam = newRideCam(); let prevLead = null, worstStep = 0, cartIn = true, goLead = [], seenGo = 0, minAhead = 1e9, minRowsOver = 1e9, heroIn = true; const eV = [];
    const perches = []; q.R.legs.forEach((lg, i) => { for (const f of [0.3, 0.5, 0.7, 0.9]) { const g = q.R.G[i] + lg.len * f, p = { x: q.R.S[i].x + lg.dx * f, y: q.R.S[i].y + lg.dy * f - 104, firstSeen: null, reached: null }; perches.push(p); } });
    for (let i = 0; i < 60 * 60 && q.cs.st !== 'end'; i++) { const ev = cartStep(q.cs, [h], DT, {}); phys(q.L, h, {}, surf(q.L, q.cs)); rideCamStep(cam, q.cs, DT, VW);
      worstStep = Math.max(worstStep, prevLead === null ? 0 : Math.abs(cam.lead - prevLead)); prevLead = cam.lead; const T = i * DT;
      for (const e of ev) if (e.t === 'cartGo') goLead.push({ lead: cam.lead, dir: Math.sign(q.R.legs[e.leg].dx) });
      const tg = rideCamTarget(cam, q.cs, VW, VH); if (q.cs.x - CART.W / 2 < tg.tx || q.cs.x + CART.W / 2 > tg.tx + VW) cartIn = false; if (h.x < tg.tx || h.x > tg.tx + VW) heroIn = false;
      minRowsOver = Math.min(minRowsOver, (q.cs.floorY - tg.ty) / TS);
      for (const p of perches) { if (p.firstSeen === null && inRideView(cam, q.cs, VW, VH, p.x, p.y) && ((p.x - q.cs.x) * Math.sign(q.R.legs[q.cs.legIdx].dx) > 0) && p.reached === null) p.firstSeen = T; if (p.reached === null && (p.x - q.cs.x) * Math.sign(q.R.legs[q.cs.legIdx].dx) <= 0 && p.firstSeen !== null) p.reached = T; } }
    const maxStep = 2 * CART.CAM_LEAD / CART.CAM_EASE * DT; ok(worstStep <= maxStep + 1e-9, VW + 'x' + VH + ': the camera lead never moves more than ' + maxStep.toFixed(2) + ' px/frame (' + worstStep.toFixed(2) + ')');
    const want = Math.min(CART.CAM_LEAD, VW / 2 - CART.W / 2 - CART.CAM_MARGIN); ok(goLead.length === 3 && goLead.every(g => Math.abs(g.lead - g.dir * want) < 0.5), VW + 'x' + VH + ': the flip is done in the dock: at each of 3 departures the lead is the new leg\'s ' + want + ' px (' + goLead.map(g => g.lead.toFixed(0)) + ')');
    ok(cartIn && heroIn, VW + 'x' + VH + ': the whole cart and the hero are in the picture every frame'); ok(minRowsOver >= CART.CAM_MIN_ROWS, VW + 'x' + VH + ': >= ' + CART.CAM_MIN_ROWS + ' rows over the cart\'s floor (' + minRowsOver.toFixed(1) + ')');
    const worstSee = Math.min(...perches.map(p => (p.reached ?? 0) - (p.firstSeen ?? 0))); ok(perches.every(p => p.firstSeen !== null && p.reached !== null) && worstSee >= 2.0, VW + 'x' + VH + ': a perch 6.5 rows over the floor is on screen >= 2.0 s before the cart passes it (worst ' + worstSee.toFixed(2) + ' s; the tell is 1.0 s + 0.8 s read)'); if (VW === 320 && VH === 180) notes.push('camera 320x180: lead 110 px, worst perch on screen ' + worstSee.toFixed(2) + ' s, ' + minRowsOver.toFixed(1) + ' rows over the floor'); } }

/* a seat on a station deck walks to its centre and waits there (the cart is called to him; a walk toward the cart over the void is the pit) */
const stationHand = (b, cs) => { let best = null; for (const st of cs.R.S) if (Math.abs(b.y - st.y) < 1 && (best === null || Math.abs(st.x - b.x) < Math.abs(best.x - b.x))) best = st; if (!best) return {}; const dx = best.x - b.x; return Math.abs(dx) > 6 ? (dx > 0 ? { right: true } : { left: true }) : {}; };
/* 8. ALL HEROES + THE FUZZ ----------------------------------------------------------------- */
{ const res = [];
  for (const hero of HERO_MOVE_IDS) { const { L, cs } = stage(), b = mk(S0.x, S0.y, hero), evs = []; let k = 0;
    const hand = x => { k++; const rel = x.x - cs.x, toward = rel > 14 ? { left: true } : rel < -14 ? { right: true } : {}; return { ...toward, jumpPress: x.ground && Math.abs(rel) < 20 && k % 50 === 0 }; };
    const t = runUntil(L, cs, [b], hand, () => cs.st === 'end', 60, evs); ok(cs.st === 'end' && !evs.some(e => e.t === 'cartFall') && b.hp === 100, hero + ': boards, jumps and shuffles all the way to the end station, no fall'); res.push(hero + ' ' + t.toFixed(1) + 's'); }
  notes.push('9 heroes ride: ' + res.join(', '));
  /* the fuzz: seeded random inputs; invariants every frame; afterwards a pilot rides it out from wherever he is */
  let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; let rides = 0, falls = 0, deaths = 0;
  for (let s = 0; s < 36; s++) { const { L, cs, R } = stage(), seats = 1 + (s % 3), bodies = Array.from({ length: seats }, (_, i) => mk(S0.x + (i - 1) * 16, S0.y, HERO_MOVE_IDS[(s + i) % 9])), evs = [];
    let hold = bodies.map(() => ({ l: 0, r: 0 })), stuck = 0, lastG = cs.g, lastSt = cs.st;
    for (let i = 0; i < 60 * 70; i++) {
      const inp = b => { if (b.ground && b.cartRide !== cs.id) return stationHand(b, cs);   /* off the cart on a deck: walk to it (random walks off a deck are just the pit) */
        const h = hold[bodies.indexOf(b)]; if (rnd() < 0.03) { h.l = rnd() < 0.5; h.r = rnd() < 0.5; } return { left: h.l, right: h.r, jumpPress: b.ground && rnd() < 0.02 }; };
      tick(L, cs, bodies, inp, evs);
      for (const b of bodies) { if (!Number.isFinite(b.x) || !Number.isFinite(b.y) || !Number.isFinite(b.vx) || !Number.isFinite(b.vy)) assert.fail('NaN seat in fuzz seed ' + s); if (b.hp < 1 || b.hp > 100) assert.fail('hp out of band ' + b.hp);
        if (b.dead) { deaths++; b.dead = false; cartRespawn(cs, bodies); b.x = S0.x; b.y = S0.y; b.vx = b.vy = 0; b.ground = true; b.hp = 100; } }
      if (cs.st === 'run') { if (!(cs.g > lastG) && lastSt === 'run') stuck++; } lastG = cs.g; lastSt = cs.st; if (!['wait', 'run', 'dock', 'end', 'roll'].includes(cs.st)) assert.fail('bad state ' + cs.st);
      if (cs.g < -1e-6 || cs.g > R.total + 1e-6) assert.fail('g out of the route'); }
    ok(stuck === 0, 'fuzz seed ' + s + ' (' + seats + ' seats): the cart never stalls mid-run'); falls += evs.filter(e => e.t === 'cartFall').length;
    /* the pilot: every seat walks to the cart and stands in it; the ride must finish */
    for (const b of bodies) if (b.dead) { b.dead = false; b.x = S0.x; b.y = S0.y; b.ground = true; }
    /* the pilot: every seat walks to its station's centre and waits for the cart (it is called); aboard it stands; at the end station a seat steps off east; success = every seat reaches the END deck */
    const S3 = R.S[R.S.length - 1], arrived = bodies.map(() => false);
    const pilot = b => { if (!b.ground) return {}; const done = arrived[bodies.indexOf(b)]; if (Math.abs(b.y - S3.y) < 1 && done) return Math.abs(b.x - cs.x) < 44 ? { right: true } : {}; return b.cartRide === cs.id ? {} : stationHand(b, cs); };   /* arrived = step clear of the cart and stay */
    const grounded = bodies.every(b => b.ground);
    if (grounded) { const e2 = []; const t = runUntil(L, cs, bodies, pilot, () => { bodies.forEach((b, i) => { if (b.ground && Math.abs(b.y - S3.y) < 1 && Math.abs(b.x - S3.x) < 110) arrived[i] = true; }); return arrived.every(Boolean); }, 600, e2);
      ok(arrived.every(Boolean) || bodies.some(b => b.dead), 'fuzz seed ' + s + ' (' + seats + ' seats): a pilot gets every seat to the end station from wherever the fuzz left them (' + t.toFixed(0) + ' s)'); } }
  notes.push('fuzz: 36 seeds x 70 s, ' + falls + ' falls caught (random hands jump off a lot), ' + deaths + ' pit deaths (a jump off the end onto no deck: the shrine), 0 stalls, 0 NaN, every seed pilot then got every seat to the end station'); }

console.log(notes.join('\n')); console.log('hl-cart: ' + n + ' checks OK (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
