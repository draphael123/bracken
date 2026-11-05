// tools/sky-mount.mjs - THE DRAKE'S BACK, proved in node (lane S1 SKYMOUNT; src/sky-mount.js). No browser, ~1 s.
//   node tools/sky-mount.mjs [--v]
// What it holds: the back's surface (flat, the wingbeat, the +-8 deg bank), the bank's clock (told 1.0 s, tilts 1.6 s, levels 0.3 s; the
// per-phase cadence; never in a knockdown hold; no bank in a climb), the walls (nothing passes them: a run, a dash, a knock), NO FALLING
// OFF (every hero, two minutes of random play with knocks, never under the surface or outside the walls), the jump cap, the slide (every
// hero's legs beat it), knock-DOWN (no travel, prone 0.5 s, i-frames >= 0.6 s), landing on a tilted back, co-op (spawn slots, the AI's
// walk, both heroes on through banks), the King's landing spot (between you and the neck / between the two of you), the sky data
// (3 altitudes x 4 layers, the climb's blend), the camera lock, the lab level, and that main.js/level.js still carry every hook.
// The hero model is main.js's base movement from src/hero-move.js (MOVE, HERO_RUN) - the same numbers updatePlayer reads.
import { readFileSync } from 'node:fs';
import * as SK from '../src/sky-mount.js';
import { MOVE, HERO_MOVE_IDS, heroRunMul } from '../src/hero-move.js';

const V = process.argv.includes('--v');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) { pass++; if (V) console.log('  ok  ' + m); } else { fail++; fails.push(m); console.log('  FAIL ' + m); } };
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const DT = MOVE.DT, D2R = Math.PI / 180;
/* every hero the back must carry: the nine live ones, the mountain arc's Rimebinder, the demon act's Demon Hunter, and the Desert Priest
   (src/sun-priest.js kit). The three not in src/hero-move.js have no legs entry yet: they run at the knight's (heroRunMul's default). */
const HEROES = [...HERO_MOVE_IDS, 'rimebinder', 'demonhunter', 'sunpriest'];
const CFG = { x0: 224, y: 240, len: 192, phase: 1 };
const mk = (phase = 1, seed = 7) => SK.newBack({ ...CFG, phase }, SK.seeded(seed));
const body = (x, b) => ({ x, y: b ? SK.surfaceY(b, x) : 0, vx: 0, vy: 0, w: MOVE.BODY_W, h: MOVE.BODY_H, ground: true, onMover: b || null, hurt: 0, inv: 0, coyote: 0 });

/* ONE FRAME of a hero as main.js runs it on the back: pre (before the mover carry), the carry's own test, the legs, the jump, gravity
   (main.js's arc: light at the apex, heavier falling), the move, then foot (after the mover landing). in: { ax -1..1, jump, dash } */
function frame(P, b, hero, inp = {}) {
  SK.preStep(P, b);
  if (P.onMover) { const m = P.onMover; if (!(P.x + 4 > m.x && P.x - 4 < m.x + m.w && Math.abs(P.y - m.y) < 3)) P.onMover = null; }   // main.js 11091
  const down = (P.mountDown || 0) > 0 || P.hurt > 0;
  const cap = MOVE.RUN * heroRunMul(hero, P.ground) * (inp.dash ? 4.5 : 1), tv = down ? 0 : (inp.ax || 0) * cap;
  const acc = P.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR; if (inp.dash) P.vx = tv; else P.vx += Math.max(-acc * DT, Math.min(acc * DT, tv - P.vx));
  if (inp.jump && !down && (P.ground || P.coyote > 0)) { P.vy = inp.jumpV || MOVE.JUMPV; P.ground = false; P.onMover = null; P.coyote = 0; }
  P.hurt = Math.max(0, P.hurt - DT); P.inv = Math.max(0, P.inv - DT); P.coyote = Math.max(0, P.coyote - DT);
  const prevY = P.y; P.ground = false;
  const g = Math.abs(P.vy) < MOVE.APEX_VY ? MOVE.APEX_G : P.vy > 0 ? MOVE.FALL_G : 1; P.vy = Math.min(MOVE.MAX_FALL, P.vy + MOVE.GRAV * g * DT);
  P.x += P.vx * DT; P.y += P.vy * DT;
  return SK.footStep(P, b, prevY, { dt: DT, coyote: MOVE.COYOTE, solid: 1, block: !!inp.block, dodging: !!inp.dash });
}
const run = (b, P, hero, n, inp, phase) => { for (let i = 0; i < n; i++) { SK.stepBack(b, DT, { phase }); frame(P, b, hero, typeof inp === 'function' ? inp(i) : inp); } };

console.log('THE DRAKE\'S BACK - node check (src/sky-mount.js)');
/* 1. THE SURFACE */
{ const b = mk(); b.bob = 0;
  ok(SK.surfaceY(b, b.x0) === b.y0 && SK.surfaceY(b, b.x1) === b.y0, 'level back: flat from tail to neck at its line');
  b.bank.ang = 8 * D2R; const half = b.len / 2 * Math.tan(8 * D2R);
  ok(near(SK.surfaceY(b, b.x1) - b.y0, half, 0.01) && near(b.y0 - SK.surfaceY(b, b.x0), half, 0.01), 'banked +8 deg: the neck end ' + half.toFixed(1) + ' px lower, the tail end as much higher');
  ok(SK.downhill(b) === 1, 'banked right: downhill is toward the neck'); b.bank.ang = -8 * D2R; ok(SK.downhill(b) === -1, 'banked left: downhill is toward the tail');
  ok(SK.surfaceY(b, b.x1 + 500) === SK.surfaceY(b, b.x1), 'the surface past an end is the end (clamped)');
  const c = mk(); let lo = 1e9, hi = -1e9; for (let i = 0; i < 300; i++) { SK.stepBack(c, DT); lo = Math.min(lo, c.bob); hi = Math.max(hi, c.bob); }
  ok(near(hi, SK.SKM.BOB.amp, 0.05) && near(lo, -SK.SKM.BOB.amp, 0.05), 'the wingbeat bobs the back +-' + SK.SKM.BOB.amp + ' px'); }

/* 2. THE BANK'S CLOCK */
for (const ph of [1, 2, 3]) {
  const b = mk(ph, 11 + ph), tells = [], tilts = [], levels = []; let t = 0;
  for (let i = 0; i < 60 * 120; i++) { t += DT; const ev = SK.stepBack(b, DT); if (ev.includes('tell')) tells.push(t); if (ev.includes('tilt')) tilts.push(t); if (ev.includes('level')) levels.push(t); }
  const gaps = tells.slice(1).map((x, i) => x - tells[i]), cyc = SK.SKM.BANK.tell + SK.SKM.BANK.hold + SK.SKM.BANK.recover, base = SK.SKM.BANK.every[ph - 1], j = SK.SKM.BANK.jitter;
  ok(gaps.length >= 3 && gaps.every(gp => gp >= base * (1 - j) - 0.05 && gp <= base * (1 + j) + 0.05 && gp > cyc), `P${ph}: a bank told every ~${base} s (+-${j * 100}%), tell to tell: ${gaps.slice(0, 4).map(x => x.toFixed(1)).join(', ')}`);
  ok(tilts.every((x, i) => near(x - tells[i], SK.SKM.BANK.tell, DT * 1.5)), `P${ph}: every bank is TOLD ${SK.SKM.BANK.tell} s before it tilts`);
  ok(levels.every((x, i) => near(x - tilts[i], SK.SKM.BANK.hold + SK.SKM.BANK.recover, DT * 2)), `P${ph}: it tilts ${SK.SKM.BANK.hold} s and levels over ${SK.SKM.BANK.recover} s`);
}
{ const b = mk(1, 3); let maxDeg = 0, dirs = new Set(); for (let i = 0; i < 60 * 90; i++) { SK.stepBack(b, DT); maxDeg = Math.max(maxDeg, Math.abs(SK.bankDeg(b))); if (b.bank.dir) dirs.add(b.bank.dir); }
  ok(near(maxDeg, 8, 0.01), 'the tilt reaches 8 deg and no more (' + maxDeg.toFixed(2) + ')'); ok(dirs.has(1) && dirs.has(-1), 'it banks both ways'); }
{ const b = mk(1, 5); b.nextBank = 0.5; SK.holdBank(b, 4); let tell = false; for (let i = 0; i < 60 * 4; i++) if (SK.stepBack(b, DT).includes('tell')) tell = true;
  ok(!tell, 'a knockdown HOLD: no bank is told while it lasts');
  let after = -1; for (let i = 0; i < 60 * 5; i++) if (SK.stepBack(b, DT).includes('tell')) { after = i * DT; break; }
  ok(after >= SK.SKM.BANK.afterHold - 0.05, 'and the first one after waits ' + SK.SKM.BANK.afterHold + ' s (' + after.toFixed(2) + ')');
  const c = mk(1, 5); c.nextBank = 0; SK.stepBack(c, DT); ok(c.bank.state === 'tell', '(a tell begins)'); SK.holdBank(c, 3); SK.stepBack(c, DT); ok(c.bank.state === 'level', 'a hold calls off a tell in progress');
  const d = mk(1, 5); d.nextBank = 0; for (let i = 0; i < 70; i++) SK.stepBack(d, DT); ok(d.bank.state === 'tilt', '(a tilt)'); SK.holdBank(d, 3); SK.stepBack(d, DT); ok(d.bank.state === 'recover', 'a hold levels a tilt at once');
  let lv = false; for (let i = 0; i < 30; i++) if (SK.stepBack(d, DT).includes('level')) lv = true; ok(lv && d.bank.ang === 0, 'and it is level within the recover time'); }
{ const b = mk(1, 9); SK.beginClimb(b, 2); let tell = false, ks = []; for (let i = 0; i < 60 * 5.1; i++) { const ev = SK.stepBack(b, DT); if (ev.includes('tell')) tell = true; if (i % 30 === 0) ks.push(SK.climbK(b)); }
  ok(!tell && b.alt === 'high' && !b.climb, 'THE CLIMB (phase change): 5 s, no bank, ends at the next altitude (high)');
  ok(ks.every((k, i) => i === 0 || k >= ks[i - 1] || k === 0), 'the climb\'s blend only rises'); ok(b.phase === 2, 'and the back is in phase 2');
  SK.beginClimb(b, 3); for (let i = 0; i < 60 * 5.1; i++) SK.stepBack(b, DT); ok(b.alt === 'ash', 'P3: above the ash column'); }

/* 3. THE WALLS */
for (const hero of HEROES) {
  const b = mk(); const [a, z] = SK.walkable(b, MOVE.BODY_W); const P = body(b.cx, b); SK.mount(P, b, b.cx);
  let minX = 1e9, maxX = -1e9; run(b, P, hero, 240, i => ({ ax: i < 120 ? 1 : -1, dash: i % 40 < 6 }));
  for (let i = 0; i < 240; i++) { SK.stepBack(b, DT); frame(P, b, hero, { ax: i < 120 ? 1 : -1, dash: i % 30 < 8 }); minX = Math.min(minX, P.x); maxX = Math.max(maxX, P.x); }
  ok(minX >= a - 1e-6 && maxX <= z + 1e-6 && near(minX, a, 1) && near(maxX, z, 1), `${hero}: runs and dashes (x4.5 run) end at the tail fin and the neck spines, never past (${minX.toFixed(1)}..${maxX.toFixed(1)} in ${a}..${z})`);
}
{ const b = mk(); const P = body(b.cx, b); SK.mount(P, b); P.x = b.x1 + 400; SK.preStep(P, b); ok(P.x === SK.walkable(b, P.w)[1], 'a hero thrown past the neck (a teleport, a knock) is back inside the wall before his next step'); }

/* 4. NO FALLING OFF: two minutes of random play per hero, knocks and banks and jumps and dashes, in each phase */
for (const hero of HEROES) for (const ph of [1, 3]) {
  const b = mk(ph, 100 + ph); const rnd = SK.seeded(hero.length * 31 + ph); const P = body(b.cx, b); SK.mount(P, b, b.cx);
  let under = 0, outside = 0, airMax = 0, inp = {}; const [a, z] = SK.walkable(b, P.w);
  for (let i = 0; i < 60 * 120; i++) {
    if (i % 12 === 0) inp = { ax: rnd() < 0.15 ? 0 : rnd() < 0.5 ? -1 : 1, jump: rnd() < 0.25, dash: rnd() < 0.06, jumpV: rnd() < 0.1 ? -560 : 0 };
    if (rnd() < 0.004) { P.vx = (rnd() < 0.5 ? -1 : 1) * 400; P.vy = -300; P.ground = false; P.onMover = null; }   // a stray throw (a kit's own shove)
    if (rnd() < 0.003) SK.knockDown(P);
    SK.stepBack(b, DT, { phase: ph }); frame(P, b, hero, inp);
    const s = SK.surfaceY(b, P.x); if (P.y > s + 0.01) under++; if (P.x < a - 1e-6 || P.x > z + 1e-6) outside++; airMax = Math.max(airMax, s - P.y);
  }
  ok(under === 0 && outside === 0, `${hero} P${ph}: 2 min of random play (jumps, dashes, throws, knocks, banks): never under the back, never past a wall`);
  ok(airMax <= b.y0 - b.skyTop + 16, `${hero} P${ph}: and never over the sky box (highest ${airMax.toFixed(0)} px over the back)`);
}

/* 5. THE JUMP CAP */
{ const b = mk(); const P = body(b.cx, b); SK.mount(P, b); let capped = false, top = 1e9; P.vy = -900; P.ground = false; P.onMover = null;
  for (let i = 0; i < 60; i++) { SK.stepBack(b, DT); const r = frame(P, b, 'knight', {}); if (r.capped) capped = true; top = Math.min(top, P.y - P.h); }
  ok(capped && top >= b.skyTop - 1e-6, 'a -900 px/s launch (a rising cut, a spring) stops at the sky box top: head at ' + top.toFixed(0) + ' >= ' + b.skyTop);
  const Q = body(b.cx, b); SK.mount(Q, b); let jt = 1e9, cp = false; Q.vy = MOVE.JUMPV; Q.ground = false; Q.onMover = null;
  for (let i = 0; i < 60; i++) { SK.stepBack(b, DT); const r = frame(Q, b, 'knight', {}); if (r.capped) cp = true; jt = Math.min(jt, Q.y); }
  ok(!cp, 'a plain jump (' + MOVE.JUMPV + ') never touches the cap (rose ' + (b.y0 - jt).toFixed(0) + ' px of ' + SK.SKM.SKY_TOP + ')'); }

/* 6. THE SLIDE, AND EVERY HERO'S LEGS BEAT IT */
{ const b = mk(); b.nextBank = 0; const P = body(b.cx, b); SK.mount(P, b, b.cx); let x0 = null, slid = 0;
  for (let i = 0; i < 60 * 4; i++) { SK.stepBack(b, DT); if (b.bank.state === 'tilt' && x0 === null) x0 = P.x; frame(P, b, 'knight', {}); if (b.bank.state === 'level' && x0 !== null && !slid) slid = P.x - x0; }
  const dir = b.bank.n ? 1 : 0, exp = SK.SKM.BANK.slide * (SK.SKM.BANK.hold - SK.SKM.BANK.ease / 2 + SK.SKM.BANK.recover / 2);
  ok(Math.abs(slid) > exp * 0.85 && Math.abs(slid) < exp * 1.15 && dir, 'standing through a bank you slide ~' + exp.toFixed(0) + ' px downhill (' + slid.toFixed(1) + ')');
  const B2 = mk(); B2.nextBank = 0; const G = body(B2.cx, B2); SK.mount(G, B2, B2.cx); let gx0 = null, gs = 0;
  for (let i = 0; i < 60 * 4; i++) { SK.stepBack(B2, DT); if (B2.bank.state === 'tilt' && gx0 === null) gx0 = G.x; frame(G, B2, 'knight', { block: true }); if (B2.bank.state === 'level' && gx0 !== null && !gs) gs = G.x - gx0; }
  ok(near(Math.abs(gs), Math.abs(slid) / 2, 2), 'behind a guard, half (' + gs.toFixed(1) + ')'); }
for (const hero of HEROES) {
  const b = mk(); b.nextBank = 0; b.forceDir = 1; const P = body(b.cx, b); SK.mount(P, b, b.cx - 40);
  for (let i = 0; i < 60; i++) SK.stepBack(b, DT, { dir: 1 });   // through the tell: now tilting toward the neck
  const x0 = P.x; for (let i = 0; i < 60; i++) { SK.stepBack(b, DT); frame(P, b, hero, { ax: -1 }); }
  ok(P.x < x0 - 30, `${hero}: walks UP a full bank toward the tail (legs ${(MOVE.RUN * heroRunMul(hero, true)).toFixed(0)} px/s vs the slide ${SK.SKM.BANK.slide}): ${(x0 - P.x).toFixed(0)} px in 1 s`);
}

/* 7. KNOCK-DOWN */
{ const b = mk(); const P = body(b.cx, b); SK.mount(P, b, b.cx); P.vx = 150; P.inv = 0;
  ok(SK.knockDown(P) === 'down' && P.vx === 0 && P.ground && P.inv >= SK.SKM.KNOCK.inv && near(P.mountDown, SK.SKM.KNOCK.prone, 1e-9), 'a blow on the back: knocked DOWN (no throw, stays on the back, i-frames >= 0.6 s, prone 0.5 s)');
  const x0 = P.x; let t = 0; while (SK.prone(P) && t < 2) { SK.stepBack(b, DT); frame(P, b, 'knight', { ax: 1 }); t += DT; }
  ok(near(P.x, x0, 0.01) && near(t, SK.SKM.KNOCK.prone, DT * 1.5), 'pinned where he fell for the prone time (' + t.toFixed(2) + ' s, moved ' + (P.x - x0).toFixed(2) + ' px)');
  for (let i = 0; i < 30; i++) { SK.stepBack(b, DT); frame(P, b, 'knight', { ax: 1 }); } ok(P.x > x0 + 5, 'then he gets up and walks');
  const Q = body(b.cx, b); SK.mount(Q, b); Q.vy = -200; Q.ground = false; Q.onMover = null; SK.knockDown(Q); ok(Q.vy === 0, 'knocked down in the air: no upward throw (he drops onto the back)'); }

/* 8. LANDING ON A TILTED BACK; THE BOB CARRIES */
for (const d of [1, -1]) {
  const b = mk(); b.bank.state = 'tilt'; b.bank.dir = d; b.bank.ang = 8 * D2R * d; b.bank.t = 0.5;
  for (const x of [b.x0 + 20, b.cx, b.x1 - 20]) { const P = body(x, b); SK.mount(P, b, x); P.vy = MOVE.JUMPV; P.ground = false; P.onMover = null; let landed = 0;
    for (let i = 0; i < 90; i++) { b.bank.t = 0.5; frame(P, b, 'knight', { ax: 0 }); if (P.ground && P.onMover === b && i > 3 && !landed) landed = i; }
    ok(landed && near(P.y, SK.surfaceY(b, P.x), 0.01), `a jump on a ${d > 0 ? 'right' : 'left'}-banked back at x ${x - b.x0}: lands on its surface (no pop)`); }
}
{ const b = mk(); const P = body(b.cx, b); SK.mount(P, b); let worst = 0; for (let i = 0; i < 300; i++) { SK.stepBack(b, DT); frame(P, b, 'knight', {}); worst = Math.max(worst, Math.abs(P.y - SK.surfaceY(b, P.x))); if (!(P.ground && P.onMover === b)) worst = 99; }
  ok(worst < 0.01, 'standing still the wingbeat carries him (stays on the surface, grounded on the back, every frame)'); }

/* 9. CO-OP: both heroes on the back, the AI partner's walk */
{ const b = mk(); const sl = SK.spawnSlots(b, 2), [a, z] = SK.walkable(b, 10);
  ok(sl.length === 2 && sl[1] - sl[0] >= 20 && sl.every(x => x >= a && x <= z), 'two spawn slots on the back, apart: ' + sl.map(Math.round).join(', '));
  ok(SK.spawnSlots(b, 4).every(x => x >= a && x <= z), 'four (a full party) all inside the walls');
  const P1 = body(sl[0], b), P2 = body(sl[1], b); SK.mount(P1, b, sl[0]); SK.mount(P2, b, sl[1]); P2.ai = true;
  let off = 0, gapMax = 0; const rnd = SK.seeded(42); let inp = {};
  for (let i = 0; i < 60 * 60; i++) { SK.stepBack(b, DT); if (i % 15 === 0) inp = { ax: rnd() < 0.5 ? -1 : 1, jump: rnd() < 0.2 };
    frame(P1, b, 'knight', inp); const keys = {}; SK.aiKeys(P2, b, P1.x - 18 * Math.sign(P1.vx || 1), keys); frame(P2, b, 'warden', { ax: keys.right ? 1 : keys.left ? -1 : 0, jump: false });
    for (const p of [P1, P2]) { const s = SK.surfaceY(b, p.x); if (p.y > s + 0.01 || p.x < a - 1e-6 || p.x > z + 1e-6) off++; } gapMax = Math.max(gapMax, Math.abs(P1.x - P2.x)); }
  ok(off === 0, 'co-op: a minute with a human and an AI partner through banks: neither under the back nor past a wall');
  ok(gapMax < b.len, 'the AI keeps to its leader on the back (widest gap ' + gapMax.toFixed(0) + ' px)');
  const k = {}; SK.aiKeys({ x: 300, w: 10 }, b, 900, k); ok(k.right && !k.left, 'the AI walks toward a goal past the neck only up to the wall');
  const k2 = {}; SK.aiKeys({ x: 300, w: 10 }, b, 303, k2); ok(!k2.right && !k2.left, 'and stands when within ' + SK.SKM.AI.dead + ' px of its goal'); }

/* 10. THE KING'S KNOCKDOWN LANDING (S2's hook) */
{ const b = mk(), K = SK.SKM.KING, hi = b.x1 - b.wall - K.half, lo = b.x0 + b.wall + K.half;
  for (const hx of [b.x0 + 30, b.cx - 30, b.cx + 20]) { const r = SK.kingLandX(b, [{ x: hx }]); ok(r.side === 'neck' && r.x > hx + K.gap - 1e-6 && r.x <= hi, `solo at ${hx - b.x0}: he crashes down between you and the neck (${(r.x - b.x0).toFixed(0)})`); }
  const pr = SK.kingLandX(b, [{ x: b.x1 - 12 }]); ok(pr.side === 'tail' && pr.x < b.x1 - 12 - K.gap + 1e-6 && pr.x >= lo, 'pressed to the neck: no room in front, he lands behind you (' + (pr.x - b.x0).toFixed(0) + ')');
  const co = SK.kingLandX(b, [{ x: b.x0 + 40 }, { x: b.x1 - 40 }]); ok(co.side === 'between' && near(co.x, b.cx, 1), 'co-op: between the two of you');
  const cl = SK.kingLandX(b, [{ x: b.cx - 10 }, { x: b.cx + 10 }]); ok(cl.side === 'neck' && cl.x > b.cx + 10, 'co-op side by side: in front of the front one');
  const dn = SK.kingLandX(b, [{ x: b.x0 + 40 }, { x: b.x1 - 40, down: 1 }]); ok(dn.side === 'neck', 'a downed partner does not count');
  ok(SK.kingLandX(b, []).x === b.cx, 'nobody standing: the middle of the back');
  const pl = SK.plantOnBack(b, b.x1 + 99); ok(pl.x <= b.x1 - b.wall && near(pl.y, SK.surfaceY(b, pl.x), 1e-9), 'a thing planted past the neck plants on the back inside the wall'); }

/* 11. THE SKY AS DATA; THE CAMERA */
{ ok(SK.SKM.ALT.length === 3 && SK.SKM.ALT.every(a => SK.SKY[a]), 'three altitudes (P1 rim, P2 high, P3 ash), each with a sky');
  for (const a of SK.SKM.ALT) { const L = SK.SKY[a].layers; ok(L.length === 4 && L.every((l, i) => i === 0 || l.k > L[i - 1].k) && new Set(L.map(l => l.id)).size === 4, `${a}: four parallax layers, far to near (k ${L.map(l => l.k).join(' < ')})`); }
  const ly = SK.SKY.rim.layers[2]; ok(SK.layerShift(ly, 0, 900) === -0 || SK.layerShift(ly, 0, 900) === 0, 'a layer starts unshifted');
  ok(near(SK.layerShift(ly, 100 + 900 / ly.k, 900), SK.layerShift(ly, 100, 900), 1e-6) && SK.layerShift(ly, 100, 900) < 0, 'and repeats every period, moving LEFT (the drake flies right)');
  const b = mk(); for (let i = 0; i < 60; i++) SK.stepBack(b, DT); ok(near(b.scroll, SK.SKM.SCROLL, 0.5), 'the sky scrolls ' + SK.SKM.SCROLL + ' px/s at the nearest layer; the hero does not move');
  ok(SK.skyNow(b).b === null, 'no climb: one altitude'); SK.beginClimb(b, 2); for (let i = 0; i < 150; i++) SK.stepBack(b, DT); const s = SK.skyNow(b);
  ok(s.a === 'rim' && s.b === 'high' && s.k > 0.3 && s.k < 0.7 && s.rise > 0, 'mid-climb: rim fading to high, the sky sliding down (' + s.k.toFixed(2) + ')');
  for (const [VW, VH] of [[320, 180], [480, 270], [640, 360]]) { const c = SK.camFor(b, VW, VH); ok(near(c.x + VW / 2, b.cx, 1) && near(b.y0 - c.y, VH * SK.SKM.VIEW.backAt, 1) && c.y >= 0, `camera ${VW}x${VH}: locked on the drake, the back ${Math.round(VH * SK.SKM.VIEW.backAt)} px down`); } }

/* 12. THE LAB LEVEL AND THE HOOKS */
{ const T = { SOLID: 1 }; const painter = (W, H) => ({ grid: new Uint8Array(W * H), ents: [] });
  const L = SK.buildSkyLab({ painter, T }); const sx = L.START.x * 16 + 8, sy = (L.START.y + 1) * 16, b = SK.newBack(L.skyMount);
  ok(L.grid.every(v => v === 0), 'the lab: open sky, no tile anywhere (the back is the only floor)');
  ok(sx > b.x0 + b.wall && sx < b.x1 - b.wall && sy === b.y0, 'the lab start stands on the back');
  const c = SK.camFor(b, 640, 360); ok(c.x >= 0 && c.x + 640 <= L.W * 16 && c.y + 360 <= L.H * 16, 'the lab is big enough for the widest boss view (640x360)');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), lvl = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
  const HOOKS = { "import { makeSkyMountHands } from './sky-mount-hands.js'": 1, 'SKH = makeSkyMountHands(': 1, 'if (SKH) SKH.update(wdt);': 1, 'if (P.mount && SKH) SKH.pre(P);': 1, 'if (P.mount && SKH) SKH.foot(P, prevY, dt': 1,
    'else if (P.mount && SKH && SKH.knock(P))': 1, 'SKH.cam(VW, VH)': 1, 'SKH.aiWalk(p, goal, keys)': 1, 'SKH.drawSky(g, VW, VH, time': 1, 'SKH.drawDrake(g, cx, cy, time)': 1 };
  for (const [h, n] of Object.entries(HOOKS)) ok(main.split(h).length - 1 === n, 'main.js hook: ' + h);
  ok(/id: 'skylab'[^\n]*hidden: true/.test(lvl) && lvl.includes("import { buildSkyLab } from './sky-mount.js'"), "level.js: the hidden 'skylab' lab level");
  /* the order the hooks depend on: pre before the mover carry, foot after the mover landing, the knock in damagePlayer0's throw chain, the camera after its clamp */
  const at = s => main.indexOf(s);
  ok(at('if (P.mount && SKH) SKH.pre(P);') < at('if (P.onMover) { const m = P.onMover; if (P.x + 4 > m.x') && at('if (P.onMover) { const m = P.onMover; if (P.x + 4 > m.x') - at('if (P.mount && SKH) SKH.pre(P);') < 300, 'pre runs right before the mover carry');
  ok(at('P.onMover = m; P.coyote = 0.1; P.kicked = false; }') < at('SKH.foot(P, prevY') && at('SKH.foot(P, prevY') - at('P.onMover = m; P.coyote = 0.1; P.kicked = false; }') < 200, 'foot runs right after the mover landing');
  ok(at('SKH.knock(P)') < at('else if (armoured) { P.vx = dir * 60; }') && at('else if (armoured) { P.vx = dir * 60; }') - at('SKH.knock(P)') < 300, 'the knock-down sits in the throw chain ahead of the armoured rock');
  ok(at('camX = Math.max(x0, Math.min(x1, camX)); camY = Math.max(0, Math.min(LH * TS - VH, camY));') < at('SKH.cam(VW, VH)'), 'the camera lock comes after the camera clamp'); }

console.log(`\n${pass} ok, ${fail} failed`);
if (fail) { console.log('FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
