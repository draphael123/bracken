// tools/slopes.mjs — THE SLOPES ENGINE, proved in Node (phase 1: src/slopes.js is not wired into the game yet).
//
// 1. EQUIVALENCE, the whole safety case. The moveBody in src/main.js is cut out of the file as it stands today and
//    run side by side with moveBodySlopes:
//      a) fuzz: random square grids, random bodies, steps, drops and knight states; both paths of the new code
//         (the square fast path, and the slope path forced onto square tiles);
//      b) the real levels: every campaign level built in Node, a scripted knight and patrolling walkers replayed
//         from many starts, every frame compared (x, y, vx, vy, ground) to the last bit.
// 2. SLOPES: every kind walked up and down at normal speed with no hop and no stick; walkers patrol over hills
//    without turning at the top; the slide beats walking to the bottom; a jump out of a slide beats a standing and
//    a running jump; a slope's tall face is a wall; its underside is a ceiling.
// 3. THE REACH RULE (src/reach-slopes.js): a hill only a slope climbs is reached, and everything the physics knight
//    stood on is inside the fill.
// usage: node tools/slopes.mjs [--quick]     exit 1 on any failure
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';   /* the OLD moveBody comes out of git now: see below */
import { LEVELS, T, TS } from '../src/level.js';
import { SLOPE, SLOPE_NAMES, isSlope, heightAt, moveBodySlopes, moveBodySquare, aheadTile, footSlope, slideStep, slopeRise, levelHasSlopes } from '../src/slopes.js';
import { slopeReachGrid, slopeReachTile, slopeLint } from '../src/reach-slopes.js';
import { floodReach } from '../src/reachcore.js';
import { buildDuneYard, DUNE_YARD_FLOOR } from '../src/dune-yard.js';

const QUICK = process.argv.includes('--quick');
let fails = 0; const T0 = Date.now(); const out = { push: s => console.log(s + '  [' + ((Date.now() - T0) / 1000).toFixed(1) + 's]') };
const ok = (cond, msg) => { out.push((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails++; return cond; };
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// ---------- the OLD moveBody, cut out of GIT ----------
// PHASE 2 MOVED THIS. Until the wiring landed, this block cut moveBody out of src/main.js as it stood; main.js's
// moveBody is now a WRAPPER round this module, so cutting it out of the live file would compare the new code with
// itself and the whole equivalence proof would pass vacuously. The OLD side therefore comes out of git, at the
// pre-slopes commit 9e0e28a, and the extraction's sha is PINNED: if git is missing, or the lines move, or the text
// changes by one character, this exits 1 rather than quietly proving nothing.
const OLD_AT = '9e0e28a', OLD_SHA = 'b45533429f81';   /* main.js lines 4043, 4065, 4066-4099 at that commit */
let MAIN;
try { MAIN = execFileSync('git', ['show', OLD_AT + ':src/main.js'], { cwd: new URL('..', import.meta.url), encoding: 'utf8', maxBuffer: 1 << 28 }).split(/\r?\n/); }
catch (e) { console.log('slopes: cannot read src/main.js at ' + OLD_AT + ' out of git (' + e.message + ') - the equivalence proof has NO OLD SIDE, so it is not run'); process.exit(1); }
const lineOf = re => MAIN.findIndex(l => re.test(l));
const iSolid = lineOf(/^const isSolid = \(tx, ty\) =>/), iOne = lineOf(/^const isOneWay = t =>/), iMove = lineOf(/^function moveBody\(b, dx, dy, allowDrop = false\) \{/);
let iEnd = iMove; while (iEnd < MAIN.length && MAIN[iEnd] !== '}') iEnd++;
if (iSolid < 0 || iOne < 0 || iMove < 0 || iEnd - iMove > 60) { console.log('slopes: cannot find moveBody in src/main.js at ' + OLD_AT); process.exit(1); }
const SRC = [MAIN[iSolid], MAIN[iOne], ...MAIN.slice(iMove, iEnd + 1)].join('\n');
const SRC_SHA = createHash('sha256').update(SRC).digest('hex').slice(0, 12);
if (SRC_SHA !== OLD_SHA) { console.log('slopes: the moveBody cut from ' + OLD_AT + ' is sha ' + SRC_SHA + ', not the pinned ' + OLD_SHA + ' - the OLD side is not what this proof was written against'); process.exit(1); }
const oldFactory = new Function('T', 'TS', 'env', `let P = null; const tileAt = (x, y) => env.tileAt(x, y);\n${SRC}\nreturn (b, dx, dy, allowDrop, p) => { P = p; return moveBody(b, dx, dy, allowDrop); };`);
const makeOld = tileAt => oldFactory(T, TS, { tileAt });
out.push(`the OLD moveBody: src/main.js at ${OLD_AT}, lines ${iSolid + 1}, ${iOne + 1}, ${iMove + 1}-${iEnd + 1} (sha ${SRC_SHA})`);

const tileFn = (grid, W, H) => (tx, ty) => (tx < 0 || tx >= W) ? T.SOLID : (ty < 0 || ty >= H) ? T.AIR : grid[ty * W + tx];   // main.js:635, exactly
const SQUARE_KINDS = [T.SOLID, T.ONEWAY, T.SPIKE, T.CRATE, T.REED, T.PALISADE, T.PLANK, T.NET, T.BOUNCER, T.SHELF, T.PORT, T.CLIMB, T.RAIL, T.SOFT, T.ICE, T.WEB, T.CRYST];
const isSolidSq = (tileAt, tx, ty) => { const t = tileAt(tx, ty); return t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || t === T.ICE || t === T.WEB; };
const isOneWaySq = t => t === T.ONEWAY || t === T.REED || t === T.PLANK || t === T.NET || t === T.BOUNCER || t === T.SHELF || t === T.RAIL || t === T.CRYST;
const same = (a, b) => a.hitX === b.hitX && a.hitY === b.hitY && a.ground === b.ground && a.groundTile === b.groundTile;

// ================= 1a. FUZZ =================
{
  const N = QUICK ? 60000 : 400000; const R = rng(9241);
  let calls = 0, diffs = 0, forcedDiffs = 0, farDiffs = 0, ledge = 0, grounded = 0, walls = 0; let firstDiff = null;
  const W = 14, H = 12, WF = 60;   // WF: a wide grid with slopes far off to the right, for the fast path's own test
  for (let gi = 0; gi < N / 200; gi++) {
    const grid = new Uint8Array(W * H), gridF = new Uint8Array(WF * H);
    const dens = 0.15 + R() * 0.45;
    for (let i = 0; i < W * H; i++) grid[i] = R() < dens ? SQUARE_KINDS[(R() * SQUARE_KINDS.length) | 0] : T.AIR;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) gridF[y * WF + x] = grid[y * W + x];
    for (let y = 0; y < H; y++) for (let x = 40; x < WF; x++) gridF[y * WF + x] = R() < 0.3 ? 20 + ((R() * 6) | 0) : T.SOLID;
    const tileAt = tileFn(grid, W, H), tileAtF = tileFn(gridF, WF, H), old = makeOld(tileAt), oldF = makeOld(tileAtF);
    for (let k = 0; k < 200; k++) {
      const w = [6, 8, 10, 10, 12, 16, 20, 28, 40][(R() * 9) | 0], h = [8, 12, 14, 14, 20, 32, 40][(R() * 7) | 0];
      const tx = 1 + ((R() * (W - 2)) | 0), ty = 1 + ((R() * (H - 2)) | 0);
      const xo = [0, 0.01, w / 2, TS - w / 2, R() * TS][(R() * 5) | 0], yo = [0, 0.5, 6, 0.01, TS - 0.01, R() * TS][(R() * 6) | 0];
      const pick = () => { const u = R(); return u < 0.2 ? 0 : u < 0.5 ? (R() - 0.5) * 6 : u < 0.8 ? (R() - 0.5) * 16 : (R() - 0.5) * 40; };
      const dx = pick(), dy = pick(), allowDrop = R() < 0.25, isP = R() < 0.5;
      const mk = () => { const b = { x: tx * TS + xo, y: ty * TS + yo, w, h }; if (isP) { b.fly = R() < 0.1; b.ground = R() < 0.5; b.vy = (R() - 0.5) * 600; } return b; };
      const s = R(); const b0 = mk();
      const clone = () => ({ ...b0 });
      const a = clone(), b = clone(), c = clone(), d = clone(), e = clone();
      const ra = old(a, dx, dy, allowDrop, isP ? a : null);
      const rb = moveBodySlopes(b, dx, dy, tileAt, { allowDrop, P: isP ? b : null });
      const rc = moveBodySlopes(c, dx, dy, tileAt, { allowDrop, P: isP ? c : null, forceSlopePath: true });
      const rd = oldF(d, dx, dy, allowDrop, isP ? d : null);
      const re = moveBodySlopes(e, dx, dy, tileAtF, { allowDrop, P: isP ? e : null });
      calls++; if (ra.ground) grounded++; if (ra.hitX) walls++; if (isP && dy === 0 && a.y !== b0.y) ledge++;
      const eq = (p, q, rp, rq) => p.x === q.x && p.y === q.y && (!isP || p.vy === q.vy) && same(rp, rq);
      if (!eq(a, b, ra, rb)) { diffs++; firstDiff ??= { b0, dx, dy, allowDrop, isP, a, b, ra, rb }; }
      if (!eq(a, c, ra, rc)) { forcedDiffs++; firstDiff ??= { forced: true, b0, dx, dy, allowDrop, isP, a, c, ra, rc }; }
      if (b0.x + w / 2 + Math.abs(dx) < 36 * TS && !eq(d, e, rd, re)) farDiffs++;
    }
  }
  out.push(`FUZZ: ${calls} random steps on ${N / 200} random square grids (${grounded} landings, ${walls} walls, ${ledge} ledge-assist lifts)`);
  ok(diffs === 0, `square fast path == today's moveBody on every step (${diffs} differ)`);
  ok(forcedDiffs === 0, `slope path FORCED onto square tiles == today's moveBody on every step (${forcedDiffs} differ)`);
  ok(farDiffs === 0, `with slopes in the grid out of reach, still == today's moveBody (${farDiffs} differ)`);
  if (firstDiff) out.push('    first difference: ' + JSON.stringify(firstDiff).slice(0, 600));
}

// ================= the knight, as main.js moves him (the parts that touch collision) =================
const RUN = 92, GRAV = 1000, JUMPV = -320;
function newKnight(x, y) { return { x, y, vx: 0, vy: 0, w: 10, h: 14, face: 1, ground: false, groundTile: 0, coyote: 0, jbuf: 0, drop: 0, canCut: false, mantleCd: 0, fly: false, sl: { vx: 0, sliding: false, carry: false } }; }
/* one update(dt) of the knight's legs: main.js ~6509-6710 (walk/friction/cap, jump + drop-through, the cut, the arc, the
   fall caps, moveBody, the mantle, the corner correction, landing), with the slide from src/slopes.js on top when asked */
function knightStep(P, inp, dt, move, tileAt, slide = false) {
  const isSolid = (x, y) => isSolidSq(tileAt, x, y), m = inp.move;
  const cap = RUN * (inp.cap || 1);
  if (slide && (P.sl.sliding || P.sl.carry)) { /* the slide owns vx this frame */ }
  else if (m) { const acc = P.ground ? 1000 : 700; if (Math.abs(P.vx) > cap && Math.sign(P.vx) === m) P.vx = m * Math.max(cap, Math.abs(P.vx) - 400 * dt); else { P.vx += m * acc * dt; if (Math.abs(P.vx) > cap) P.vx = m * cap; } P.face = m; }
  else { const fr = P.ground ? 1100 : 200; const s = Math.sign(P.vx); P.vx -= s * fr * dt; if (Math.sign(P.vx) !== s) P.vx = 0; }
  if (inp.jumpPress) P.jbuf = 0.12;
  let jumped = false;
  if (P.jbuf > 0 && (P.ground || P.coyote > 0)) {
    if (inp.down && P.ground && isOneWaySq(P.groundTile) && !slide) { P.drop = 0.2; P.jbuf = 0; }
    else { P.vy = JUMPV; P.ground = false; P.coyote = 0; P.jbuf = 0; P.canCut = true; jumped = true; }
  }
  for (const k of ['coyote', 'jbuf']) { const left = P[k] - dt; P[k] = left > 1e-5 ? left : 0; }
  P.drop = Math.max(0, P.drop - dt);
  if (!inp.jump && P.canCut && P.vy < -110) P.vy = -110;
  { const rising = P.vy < 0, apex = Math.abs(P.vy) < 62 && !P.ground; const fast = !P.ground && inp.down && P.vy > -40 && !slide ? 2.1 : 1;
    P.vy += GRAV * dt * (apex ? 0.62 : rising ? 1 : 1.2 * fast); }
  const maxFall = !P.ground && inp.down && P.vy > 0 && !slide ? 380 : 270; if (P.vy > maxFall) P.vy = maxFall;
  if (slide) { P.sl.vx = P.vx; slideStep(P.sl, dt, { kind: P.ground ? footSlope(tileAt, P) : 0, ground: P.ground, down: inp.down, jumped }); P.vx = P.sl.vx; }
  const wasGround = P.ground; P.ground = false;
  const r = move(P, P.vx * dt, P.vy * dt, P.drop > 0);
  if (r.hitX) P.vx = 0;
  P.mantleCd = Math.max(0, P.mantleCd - dt);
  /* PHASE 2 CHANGE (docs/slopes-integration.md): `&& !r.slope`. main.js tests the mantle with P.ground already cleared, so
     every frame; on a slope the rock under the next slope tile reads as a lip. r.slope is undefined from today's moveBody,
     so on square tiles this is today's line. */
  if (!P.ground && !r.slope && !(P.mantleCd > 0) && P.vy > -30 && P.vy < 260 && m) {
    const fx = Math.floor((P.x + m * 9) / TS), fy = Math.floor((P.y + 2) / TS), top = fy * TS;
    if (isSolid(fx, fy) && !isSolid(fx, fy - 1) && !isSolid(fx, fy - 2) && P.y - top > 3 && P.y - top < 11) { P.mantleCd = 0.25; P.y = top; P.x += m * 5; P.vy = -70; P.ground = false; P.coyote = 0.08; P.canCut = true; }
  }
  if (r.hitY && P.vy < 0) for (const ddx of [-3, 3, -5, 5]) { const hx = Math.floor((P.x + ddx) / TS), hy = Math.floor((P.y - P.h - 1) / TS); if (!isSolid(hx, hy) && !isSolid(hx, hy + 1)) { P.x += ddx; P.vy = Math.min(P.vy, -120); break; } }
  if (r.ground) { P.ground = true; P.groundTile = r.groundTile; P.vy = 0; P.coyote = 0.1; }
  else if (r.hitY) P.vy = 0;
  if (!P.ground && wasGround) P.coyote = 0.1;
  return r;
}
/* a patrolling foe as main.js ~8094-8098 moves one: ease toward speed, the edge probe, turn at an edge or a wall */
function newWalker(x, y, w = 10, h = 12, speed = 30) { return { x, y, vx: 0, vy: 0, w, h, face: 1, speed, turns: 0, turnAt: [] }; }
function walkerStep(e, dt, move, probe, tileAt) {
  e.vy = Math.min(420, e.vy + 1000 * dt);
  const want = e.face * e.speed; e.vx += (want - e.vx) * Math.min(1, dt * 8);
  const dirM = Math.sign(e.vx) || e.face, ftx = Math.floor((e.x + dirM * (e.w / 2 + 2)) / TS), fty = Math.floor((e.y + 1) / TS), aheadT = probe(tileAt, ftx, fty, e.y, e.w);
  const r = move(e, e.vx * dt, e.vy * dt); if (r.ground) e.vy = 0;
  if (r.ground && (aheadT === T.AIR || aheadT === T.SPIKE) && Math.sign(e.vx) === dirM) { e.vx = 0; e.face = -e.face; e.turns++; e.turnAt.push(['edge', e.x | 0, e.y | 0]); }
  if (r.hitX) { e.vx = 0; e.face = -e.face; e.turns++; e.turnAt.push(['wall', e.x | 0, e.y | 0]); }
  return r;
}
const oldProbe = (tileAt, ftx, fty) => tileAt(ftx, fty);
const newProbe = (tileAt, ftx, fty, feetY, w) => aheadTile(tileAt, ftx, fty, feetY, w);

// ================= 1b. THE REAL LEVELS =================
{
  const R = rng(77); let frames = 0, bodies = 0, bad = 0, jumps = 0, landings = 0, firstBad = null; const perLevel = [];
  const DTS = [0.6 / 60, 1 / 60];   // the default game speed, and full speed
  const sloped = [];
  for (const lv of LEVELS) {
    if (lv.hidden && !lv.secret) continue;
    const L = lv.build(), W = L.W, H = L.H, tileAt = tileFn(L.grid, W, H), old = makeOld(tileAt);
    /* A LEVEL WITH SLOPES IN IT IS NOT PART OF THIS CLAIM. The claim is that the levels that shipped before slopes do not
       move; a level built ON slopes (THE SUNKEN CARAVAN) runs moveBodySlopes in the game (SLOPES_ON) and has no old
       mover to agree with. It is listed, so it can never be skipped silently, and the slope sections below walk it. */
    if (levelHasSlopes(L.grid)) { sloped.push(lv.id); continue; }
    const opts = { allowDrop: false, P: null };
    const mvOld = P => (b, dx, dy, ad = false) => old(b, dx, dy, ad, P);
    const mvNew = P => (b, dx, dy, ad = false) => { opts.allowDrop = ad; opts.P = P; return moveBodySlopes(b, dx, dy, tileAt, opts); };
    // starts: the standable tops, spread along the level
    const tops = []; for (let x = 1; x < W - 1; x++) for (let y = 1; y < H; y++) { const t = L.grid[y * W + x]; if ((isSolidSq(tileAt, x, y) || isOneWaySq(t)) && !isSolidSq(tileAt, x, y - 1) && !isSolidSq(tileAt, x, y - 2)) tops.push([x, y]); }
    const nStart = QUICK ? 4 : 14, nFrames = QUICK ? 500 : 1500; let lvBad = 0, lvFrames = 0;
    for (let si = 0; si < nStart; si++) {
      const [sx, sy] = tops[Math.floor((si + 0.5) / nStart * tops.length)]; const dt = DTS[si % 2];
      const A = newKnight(sx * TS + 8, sy * TS), B = newKnight(sx * TS + 8, sy * TS);
      const WA = newWalker(sx * TS + 8, sy * TS, 10, 12, 30 + si * 3), WB = newWalker(sx * TS + 8, sy * TS, 10, 12, 30 + si * 3);
      const XA = newWalker(sx * TS + 8, sy * TS, 24, 20, 50), XB = newWalker(sx * TS + 8, sy * TS, 24, 20, 50);
      bodies += 3; let inp = { move: 0 }, hold = 0;
      for (let f = 0; f < nFrames; f++) {
        if (--hold <= 0) { hold = 10 + (R() * 80) | 0; const u = R(); inp = { move: u < 0.42 ? 1 : u < 0.84 ? -1 : 0, jump: R() < 0.5, down: R() < 0.15, cap: R() < 0.2 ? 1.15 : 1 }; }
        inp.jumpPress = R() < 0.04; if (inp.jumpPress) jumps++;
        const ra = knightStep(A, inp, dt, mvOld(A), tileAt), rb = knightStep(B, inp, dt, mvNew(B), tileAt);
        if (ra.ground) landings++;
        walkerStep(WA, dt, mvOld(null), oldProbe, tileAt); walkerStep(WB, dt, mvNew(null), newProbe, tileAt);
        walkerStep(XA, dt, mvOld(null), oldProbe, tileAt); walkerStep(XB, dt, mvNew(null), newProbe, tileAt);
        frames++; lvFrames++;
        const d = [A.x !== B.x || A.y !== B.y || A.vx !== B.vx || A.vy !== B.vy || A.ground !== B.ground, WA.x !== WB.x || WA.y !== WB.y || WA.face !== WB.face, XA.x !== XB.x || XA.y !== XB.y || XA.face !== XB.face];
        if (d.some(Boolean)) { bad++; lvBad++; firstBad ??= { level: lv.id, f, si, A, B }; }
        for (const [p, q] of [[A, B], [WA, WB], [XA, XB]]) if (p.y > H * TS + 64 || p.y < -64) { p.x = q.x = sx * TS + 8; p.y = q.y = sy * TS; p.vx = q.vx = p.vy = q.vy = 0; }
      }
    }
    perLevel.push(`${lv.id}:${lvFrames}${lvBad ? '!' + lvBad : ''}`);
  }
  out.push(`REAL LEVELS: ${perLevel.length} levels, ${bodies} bodies (a knight and two walkers per start), ${frames} frames x 3 bodies, ${jumps} jumps, ${landings} knight landings`);
  out.push('    ' + perLevel.join(' '));
  out.push('    built on slopes, so on the slope mover and not compared: ' + (sloped.join(' ') || 'none'));
  ok(sloped.every(id => id === 'caravan'), `the only level with slopes in it is the one built for them (${sloped.join(' ') || 'none'})`);
  ok(bad === 0, `every frame of every body identical to today's moveBody (${bad} frames differ)`);
  if (firstBad) out.push('    first: ' + JSON.stringify(firstBad).slice(0, 500));
}

// ================= 2. SLOPES =================
/* a yard: flat ground at row `base`, and hills made of `profile` = a list of column heights in half-tiles is overkill -
   hills are built from pieces: 'R1' climbs a row, 'L1' drops one, 'R2' (two tiles) climbs a row gently, 'L2' drops one,
   'F' is a flat column. Everything under the surface is rock. */
function yard(pieces, { H = 20, base = 16, pad = 6, cliffEnd = false } = {}) {
  const cols = []; let lvl = 0;   // lvl = rows above base
  for (let i = 0; i < pad; i++) cols.push({ lvl, t: T.SOLID });
  for (const p of pieces) {
    if (p === 'F') cols.push({ lvl, t: T.SOLID });
    else if (p === 'R1') { lvl++; cols.push({ lvl, t: SLOPE.R1 }); }
    else if (p === 'L1') { cols.push({ lvl, t: SLOPE.L1 }); lvl--; }
    else if (p === 'R2') { lvl++; cols.push({ lvl, t: SLOPE.R2A }, { lvl, t: SLOPE.R2B }); }
    else if (p === 'L2') { cols.push({ lvl, t: SLOPE.L2B }, { lvl, t: SLOPE.L2A }); lvl--; }
    else if (p === 'GAP') cols.push({ lvl: -99, t: T.AIR });
  }
  for (let i = 0; i < pad; i++) cols.push({ lvl, t: T.SOLID });
  const W = cols.length + 2, grid = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) { grid[y * W] = T.SOLID; grid[y * W + W - 1] = T.SOLID; }
  cols.forEach((c, i) => { const x = i + 1; if (c.lvl === -99) return; const top = base - c.lvl; if (isSlope(c.t)) { grid[top * W + x] = c.t; for (let y = top + 1; y < H; y++) grid[y * W + x] = T.SOLID; } else for (let y = top; y < H; y++) grid[y * W + x] = T.SOLID; });
  // the true floor, independently of the engine: the highest surface in the column at x
  const floorAt = x => { const tx = Math.floor(x / TS); for (let y = 0; y < H; y++) { const t = grid[y * W + tx]; if (isSlope(t)) return y * TS + heightAt(t, x - tx * TS); if (t === T.SOLID) return y * TS; } return Infinity; };
  return { W, H, grid, tileAt: tileFn(grid, W, H), floorAt, x0: (pad / 2) * TS, x1: (W - 1 - pad / 2) * TS, base };
}
const newMove = tileAt => { const opts = { allowDrop: false, P: null }; return P => (b, dx, dy, ad = false) => { opts.allowDrop = ad; opts.P = P; return moveBodySlopes(b, dx, dy, tileAt, opts); }; };
/* walk the knight from x0 toward x1 holding one direction; report hops (a frame off the ground), sticks (a frame the
   x did not advance once at speed), the worst gap between the feet and the true floor, and the mean speed */
function walkAcross(Y, dir, dt, extra = {}) {
  const mv = newMove(Y.tileAt); const x0 = dir > 0 ? Y.x0 : Y.x1, x1 = dir > 0 ? Y.x1 : Y.x0;
  const P = newKnight(x0, Y.floorAt(x0)); P.ground = true; P._sg = true;
  let hops = 0, sticks = 0, worst = 0, f = 0, onSlope = 0, fastF = 0, firstHop = null; const t0 = P.x;
  while ((x1 - P.x) * dir > 0 && f < 20000) {
    const px = P.x; const r = knightStep(P, { move: dir, cap: extra.cap || 1, down: !!extra.down }, dt, mv(P), Y.tileAt, !!extra.slide); f++;
    if (process.env.TRACE && f >= +process.env.TRACE && f < +process.env.TRACE + 30) console.log("  tr", f, P.x.toFixed(2), P.y.toFixed(2), "floor", Y.floorAt(P.x).toFixed(2), r.ground ? "G" : "-", r.slope || 0, "vy", P.vy.toFixed(1), "sg", P._sg, P._ss);
    if (f > 3) { if (!r.ground) { hops++; firstHop ??= [f, P.x.toFixed(2), P.y.toFixed(2)]; } if ((P.x - px) * dir <= 1e-9) sticks++; worst = Math.max(worst, Math.abs(P.y - Y.floorAt(P.x))); if (r.slope) onSlope++; if (Math.abs(P.vx) >= RUN * (extra.cap || 1) - 0.5) fastF++; }
  }
  return { hops, sticks, worst, frames: f, onSlope, speed: Math.abs(P.x - t0) / (f * dt), firstHop, fastF };
}
{
  const HILLS = {
    'steep hill (R1 up 3, L1 down 3)': ['F', 'R1', 'R1', 'R1', 'F', 'F', 'L1', 'L1', 'L1', 'F'],
    'gentle hill (R2 up 3, L2 down 3)': ['F', 'R2', 'R2', 'R2', 'F', 'F', 'L2', 'L2', 'L2', 'F'],
    'mixed (steep up, gentle down, a peak with no flat)': ['R1', 'R2', 'R1', 'L2', 'L1', 'L2', 'F', 'R2', 'L1'],
    'valley (down first, then up)': ['F', 'F', 'R1', 'R1', 'R1', 'F', 'L1', 'L2', 'L1', 'F', 'R2', 'R1', 'F'],
  };
  out.push('SLOPES: every kind walked both ways at normal speed (game speed 0.6 and 1.0), and at the sprint');
  for (const [name, pieces] of Object.entries(HILLS)) for (const dt of [0.6 / 60, 1 / 60]) for (const cap of [1, 1.15]) for (const dir of [1, -1]) {
    const Y = yard(pieces), w = walkAcross(Y, dir, dt, { cap });
    ok(w.hops === 0 && w.sticks === 0 && w.worst < 0.01 && w.onSlope > 20 && w.speed > RUN * cap * 0.9,
      `${name}, ${dir > 0 ? 'rightward' : 'leftward'}, dt ${dt.toFixed(4)}, cap x${cap}: ${w.frames} frames, ${w.onSlope} on slope, hops ${w.hops}, sticks ${w.sticks}, worst foot gap ${w.worst.toFixed(3)} px, ${w.speed.toFixed(1)} px/s` + (w.firstHop ? ' first hop ' + w.firstHop : ''));
  }
  // walkers
  out.push('WALKERS: a patrolling foe goes over the hill and turns only at the yard walls');
  for (const [name, pieces] of Object.entries(HILLS)) for (const [w, h, sp] of [[10, 12, 30], [10, 12, 70], [24, 20, 50], [8, 8, 110]]) {
    const Y = yard(pieces), mv = newMove(Y.tileAt)(null);
    const e = newWalker(Y.x0 + 20, Y.floorAt(Y.x0 + 20), w, h, sp); let minX = 1e9, maxX = -1e9, air = 0;
    for (let f = 0; f < 6000; f++) { const r = walkerStep(e, 1 / 60, mv, newProbe, Y.tileAt); if (f > 2 && !r.ground) air++; minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x); }
    const edges = e.turnAt.filter(t => t[0] === 'edge').length;
    ok(edges === 0 && minX < Y.x0 && maxX > Y.x1 && air === 0, `${name}, foe ${w}x${h} at ${sp}: spans ${(minX / TS).toFixed(1)}-${(maxX / TS).toFixed(1)} of ${(Y.W - 1)} tiles, ${e.turns} turns (${edges} at false edges), ${air} frames in the air`);
    // and the old probe: what today's walkers would do on the same hill
    if (w === 10 && sp === 30) { const e2 = newWalker(Y.x0 + 20, Y.floorAt(Y.x0 + 20), w, h, sp); for (let f = 0; f < 6000; f++) walkerStep(e2, 1 / 60, mv, oldProbe, Y.tileAt);
      out.push(`         (today's edge probe on the same hill: ${e2.turnAt.filter(t => t[0] === 'edge').length} false edges - why aheadTile() is in the wiring plan)`); }
  }
  // a walker still turns at a real edge next to a slope
  { const Y = yard(['F', 'R1', 'R1', 'F', 'L1', 'GAP', 'GAP', 'F']), mv = newMove(Y.tileAt)(null); const e = newWalker(Y.x0 + 20, Y.floorAt(Y.x0 + 20), 10, 12, 40);
    let fell = false; for (let f = 0; f < 4000; f++) { walkerStep(e, 1 / 60, mv, newProbe, Y.tileAt); if (e.y > Y.base * TS + 4) fell = true; }
    ok(!fell && e.turnAt.some(t => t[0] === 'edge'), `a foe at the foot of a slope that ends in a pit turns at the pit (${e.turnAt.map(t => t[0]).join(',')}), never falls in`); }

  // THE SLIDE
  out.push('THE SLIDE');
  for (const [name, pieces, n] of [['steep, 4 rows', ['F', 'F', 'F', 'L1', 'L1', 'L1', 'L1'], 4], ['gentle, 4 rows', ['F', 'F', 'F', 'L2', 'L2', 'L2', 'L2'], 8]]) {
    const Y = yard(['R1', 'R1', 'R1', 'R1', ...pieces], { pad: 40 });   // pieces start at column 41: R1 41-44, the top 45-47, the way down from 48
    const topX = 47 * TS + 4, footX = (48 + n) * TS + 8;
    const run = slide => { const mv = newMove(Y.tileAt); const P = newKnight(topX, Y.floorAt(topX)); P.ground = true; P._sg = true; P.vx = RUN; let f = 0, hops = 0;
      while (P.x < footX && f < 5000) { const r = knightStep(P, { move: 1, down: slide }, 0.6 / 60, mv(P), Y.tileAt, slide); if (!r.ground) hops++; f++; }
      const vFoot = P.vx; let g = 0; const x0 = P.x;   // then let go of the stick (DOWN still held for the slide): how far does it carry on the flat
      while (Math.abs(P.vx) > 0.5 && g < 5000) { knightStep(P, { move: 0, down: slide }, 0.6 / 60, mv(P), Y.tileAt, slide); g++; }
      return { t: f * 0.6 / 60, hops, vFoot, carry: P.x - x0 }; };
    const walk = run(false), sl = run(true);
    ok(sl.t < walk.t * 0.8 && sl.hops === 0, `${name}: slide reaches the bottom in ${sl.t.toFixed(2)} s against walking's ${walk.t.toFixed(2)} s (${(100 * (1 - sl.t / walk.t)).toFixed(0)}% faster), ${sl.hops} hops, ${sl.vFoot.toFixed(0)} px/s at the foot`);
    ok(sl.carry > walk.carry * 3, `${name}: momentum onto the flat - the slide carries ${sl.carry.toFixed(0)} px past the foot with DOWN held, a walk stops in ${walk.carry.toFixed(0)} px`);
  }
  // jump distance: out of a slide at the foot, against a standing jump and a running jump on the flat
  { const Y = yard(['R1', 'R1', 'R1', 'R1', 'F', 'F', 'L1', 'L1', 'L1', 'L1'], { pad: 60 });   // R1 61-64, the top 65-66, L1 67-70, flat from 71
    const jumpDist = (setup) => { const mv = newMove(Y.tileAt); const P = setup(mv); const x0 = P.x, y0 = P.y; let f = 0, up = false;
      knightStep(P, { move: Math.sign(P.vx) || 1, jumpPress: true, jump: true, down: P.sl.sliding }, 0.6 / 60, mv(P), Y.tileAt, true);
      while (f++ < 3000) { const r = knightStep(P, { move: Math.sign(P.vx) || 0, jump: true }, 0.6 / 60, mv(P), Y.tileAt, true); if (P.vy < 0) up = true; if (r.ground && up) break; }
      return { d: Math.abs(P.x - x0), dy: P.y - y0 }; };
    const flatX = 100 * TS;
    const standing = jumpDist(() => { const P = newKnight(flatX, Y.floorAt(flatX)); P.ground = true; return P; });
    const running = jumpDist(mv => { const P = newKnight(flatX - 200, Y.floorAt(flatX)); P.ground = true; for (let i = 0; i < 400 && P.x < flatX; i++) knightStep(P, { move: 1 }, 0.6 / 60, mv(P), Y.tileAt); return P; });
    const slid = jumpDist(mv => { const topX = 66 * TS + 4; const P = newKnight(topX, Y.floorAt(topX)); P.ground = true; P._sg = true;
      for (let i = 0; i < 2000 && !(P.x > 71 * TS + 2 && P.ground); i++) knightStep(P, { move: 1, down: true }, 0.6 / 60, mv(P), Y.tileAt, true); return P; });
    ok(slid.d > standing.d && slid.d > running.d * 1.4 && slid.d < running.d * 2.2 && Math.abs(slid.dy) < 0.01,
      `a jump out of a slide at the foot: ${slid.d.toFixed(0)} px, against a standing jump ${standing.d.toFixed(0)} px and a full-run jump ${running.d.toFixed(0)} px (+${(100 * (slid.d / running.d - 1)).toFixed(0)}%)`); }

  // THE FACE, THE UNDERSIDE, A LANDING ON A SLOPE, A JUMP OFF ONE
  { const Y = yard(['F', 'R1', 'R1', 'R1', 'F'], { pad: 8 }); const mv = newMove(Y.tileAt);
    const W = 30, H = 20, g = new Uint8Array(W * H); for (let y = 0; y < H; y++) { g[y * W] = g[y * W + W - 1] = T.SOLID; } for (let x = 0; x < W; x++) for (let y = 16; y < H; y++) g[y * W + x] = T.SOLID;
    g[15 * W + 14] = SLOPE.L1;   // a lone steep tile: its LEFT side is a 16 px face, its right side runs down to the flat
    const tA = tileFn(g, W, H), mvA = newMove(tA); const P = newKnight(10 * TS, 16 * TS); P.ground = true; P._sg = true;
    let hitX = 0; for (let f = 0; f < 300; f++) { const r = knightStep(P, { move: 1 }, 0.6 / 60, mvA(P), tA); if (r.hitX) hitX++; }
    ok(P.x <= 14 * TS - P.w / 2 + 1e-9 && P.y === 16 * TS && hitX > 0, `a steep slope's tall face is a wall: walked into it, stopped at x ${P.x.toFixed(2)} (face at ${14 * TS - 5}), feet still on the flat`);
    const Q = newKnight(18 * TS, 16 * TS); Q.ground = true; Q._sg = true; let hopsQ = 0, top = 1e9; for (let f = 0; f < 200; f++) { const r = knightStep(Q, { move: -1 }, 0.6 / 60, mvA(Q), tA); if (f > 2 && !r.ground && Q.x > 14 * TS) hopsQ++; top = Math.min(top, Q.y); if (Q.x < 13 * TS) break; }
    ok(hopsQ === 0 && Math.abs(top - 15 * TS) < 1.5, `and from its low side it is walked up and off the top (reached y ${top.toFixed(2)}, top of the tile ${15 * TS}), ${hopsQ} hops on the way up`);
    // underside: a floating slope tile, jumped into from below
    const g2 = new Uint8Array(W * H); for (let x = 0; x < W; x++) for (let y = 16; y < H; y++) g2[y * W + x] = T.SOLID; g2[13 * W + 10] = SLOPE.R1; g2[13 * W + 11] = SLOPE.L2B;
    const tB = tileFn(g2, W, H), mvB = newMove(tB); for (const cx of [10, 11]) { const K = newKnight(cx * TS + 8, 16 * TS); K.ground = true; let minY = 1e9;
      knightStep(K, { move: 0, jumpPress: true, jump: true }, 0.6 / 60, mvB(K), tB); for (let f = 0; f < 200; f++) { knightStep(K, { move: 0, jump: true }, 0.6 / 60, mvB(K), tB); minY = Math.min(minY, K.y - K.h); }
      ok(minY >= 14 * TS - 1e-6, `a slope's underside is a ceiling (${SLOPE_NAMES[g2[13 * W + cx]]}): the head stopped at ${minY.toFixed(2)}, the tile's bottom is ${14 * TS}`); }
    // landing on a slope from a fall, and a jump from mid-slope
    const S = newKnight(11 * TS + 8, 8 * TS); let landed = null; for (let f = 0; f < 300; f++) { const r = knightStep(S, { move: 0 }, 0.6 / 60, mv(S), Y.tileAt); if (r.ground) { landed = [S.y, Y.floorAt(S.x), r.slope]; break; } }
    ok(landed && Math.abs(landed[0] - landed[1]) < 1e-9 && landed[2], `a fall onto the middle of a slope lands ON its surface (feet ${landed?.[0]}, surface ${landed?.[1]}, ${SLOPE_NAMES[landed?.[2]]})`);
    const J = newKnight(11 * TS + 4, Y.floorAt(11 * TS + 4)); J.ground = true; J._sg = true; knightStep(J, { move: 1, jumpPress: true, jump: true }, 0.6 / 60, mv(J), Y.tileAt); let rise = 0; const jy = J.y;
    for (let f = 0; f < 120; f++) { knightStep(J, { move: 1, jump: true }, 0.6 / 60, mv(J), Y.tileAt); rise = Math.max(rise, jy - J.y); }
    ok(rise > 40, `a jump from mid-slope, running uphill, leaves the slope and rises ${rise.toFixed(1)} px`);
  }
}

// ================= 3. THE REACH RULE =================
{
  out.push('THE REACH RULE (src/reach-slopes.js)');
  const passthrough = LEVELS.filter(l => !(l.hidden && !l.secret)).slice(0, QUICK ? 3 : 27).every(lv => { const L = lv.build(); return slopeReachGrid(L, T) === L; });
  ok(passthrough, 'a level with no slopes comes back as the same object: reachcore sees today\'s grid');
  /* PHASE 2 (docs/slopes-integration.md §5). src/reachcore.js now wraps its own level in slopeReachGrid on the first
     line of floodReach, and tools/caravan-level.mjs and tools/draft-level.mjs ALREADY wrapped theirs before calling it,
     so those two levels are wrapped TWICE. That is only harmless if the mapping is idempotent, which is not something
     to assume: it is asserted here, on a grid that HAS slopes. */
  {
    const W = 8, H = 5, grid = new Uint8Array(W * H);
    grid[1 * W + 2] = SLOPE.R1; grid[2 * W + 2] = T.SOLID; grid[1 * W + 3] = SLOPE.L2B; grid[2 * W + 3] = T.SOLID; grid[1 * W + 5] = SLOPE.R2A;
    const L0 = { W, H, grid, ents: [] }, a = slopeReachGrid(L0, T), b = slopeReachGrid(a, T);
    ok(a !== L0 && b === a && a.grid.every((t, i) => t === b.grid[i]), 'slopeReachGrid is IDEMPOTENT on a grid with slopes in it: a second wrap is the same object, so a double-wrapping caller is safe');
  }
  /* the two tile tables: src/level.js T (what a level paints and what main.js reads) and src/slopes.js SLOPE (what the
     engine switches on). Two tables for the same six ids is exactly how a silent drift happens, so neither may move. */
  ok(T.SLOPE_R1 === SLOPE.R1 && T.SLOPE_L1 === SLOPE.L1 && T.SLOPE_R2A === SLOPE.R2A && T.SLOPE_R2B === SLOPE.R2B && T.SLOPE_L2A === SLOPE.L2A && T.SLOPE_L2B === SLOPE.L2B,
    `level.js T and slopes.js SLOPE name the same six ids (${[T.SLOPE_R1, T.SLOPE_L1, T.SLOPE_R2A, T.SLOPE_R2B, T.SLOPE_L2A, T.SLOPE_L2B].join(' ')})`);
  ok([20, 21, 22, 23, 24, 25].every(isSlope) && ![T.AIR, T.SOLID, T.ONEWAY, T.SPIKE, T.CRATE, T.REED, T.PALISADE, T.PLANK, T.NET, T.BOUNCER, T.SHELF, T.PORT, T.CLIMB, T.RAIL, T.SOFT, T.ICE, T.WEB, T.CRYST, 19, 26].some(isSlope),
    'isSlope is true for 20-25 and false for every square tile id the game already has');
  const asStair = L => ({ ...L, grid: L.grid.map(t => isSlope(t) ? T.SOLID : t) });   // the rule NOT taken: a slope as a rock step
  for (const [name, pieces] of [['steep hill, 5 rows', ['F', 'R1', 'R1', 'R1', 'R1', 'R1', 'F', 'F', 'L1', 'L1', 'L1', 'L1', 'L1', 'F']], ['gentle hill, 5 rows', ['F', 'R2', 'R2', 'R2', 'R2', 'R2', 'F', 'F', 'L2', 'L2', 'L2', 'L2', 'L2', 'F']], ['mixed valley', ['F', 'L1', 'L2', 'L1', 'F', 'R2', 'R1', 'R2', 'F']]]) {
    const Y = yard(pieces), L = { W: Y.W, H: Y.H, grid: Y.grid, ents: [], START: { x: 2, y: Y.base - 1 }, pools: [], moversExtra: [] };
    const taught = floodReach(slopeReachGrid(L, T), T), stair = floodReach(asStair(L), T);
    // walk the physics knight over the whole thing and back; every cell his feet were in, landed, is a footing cell of the fill
    const mv = newMove(Y.tileAt); const K = newKnight(Y.x0, Y.floorAt(Y.x0)); K.ground = true; K._sg = true; const stood = new Set();
    for (const dir of [1, -1]) for (let f = 0; f < 6000 && (dir > 0 ? K.x < Y.x1 : K.x > Y.x0); f++) { const r = knightStep(K, { move: dir }, 0.6 / 60, mv(K), Y.tileAt); if (r.ground) { const cx = Math.floor(K.x / TS); let row = Math.floor((K.y - 0.01) / TS); if (!isSlope(Y.tileAt(cx, row)) && isSlope(Y.tileAt(cx, row + 1))) row++; stood.add(cx + ',' + row); } }   /* (a foot on the very top pixel of a slope is in the slope's cell) */
    const inT = [...stood].filter(k => taught.seen.has(k)).length, inS = [...stood].filter(k => stair.seen.has(k)).length;
    ok(inT === stood.size && stood.size > 15 && lintOk(L), `${name}: all ${stood.size} cells the physics knight's feet stood in are footing the taught fill reached (${inT}); the stair reading would have put ${stood.size - inS} of them a row too high`);
  }
  // the pessimism, in pixels: over every slope column of every kind, the model's foot (the cell's bottom) is never above the real one
  let worstUp = 0, worstDown = 0;
  for (const k of Object.values(SLOPE)) for (let x = 0; x <= TS; x += 0.25) { const real = heightAt(k, x), model = TS; worstDown = Math.max(worstDown, model - real); worstUp = Math.max(worstUp, real - model); }
  ok(worstUp === 0, `never optimistic: the model's foot is at most ${worstDown} px BELOW the real foot on a slope and never above it (${worstUp} px)`);
  { const g = new Uint8Array(10 * 10); g[5 * 10 + 4] = SLOPE.R1; g[6 * 10 + 5] = T.SOLID; g[5 * 10 + 5] = SLOPE.L1; g[4 * 10 + 5] = T.SOLID;
    const bad = slopeLint({ W: 10, H: 10, grid: g }, T); ok(bad.length === 2, `slopeLint names a slope with no rock under it and one roofed by rock (${bad.map(b => b.join(' ')).join('; ')})`); }
  ok(slopeReachTile(SLOPE.R1, T) === T.AIR && slopeReachTile(SLOPE.R2B, T) === T.AIR && slopeReachTile(T.PLANK, T) === T.PLANK, 'the mapping: every slope is the cell you stand in, on the rock under it; the rest untouched');
}
// ================= 4. THE DUNE YARD (src/dune-yard.js) =================
{
  out.push('THE DUNE YARD (src/dune-yard.js: phase 2 lists it as trial_slopes)');
  const L = buildDuneYard(T), S = L.sections, tA = tileFn(L.grid, L.W, L.H), mv = newMove(tA), fy = x => { const tx = Math.floor(x / TS); for (let y = 0; y < L.H; y++) { const t = L.grid[y * L.W + tx]; if (isSlope(t)) return y * TS + heightAt(t, x - tx * TS); if (t === T.SOLID) return y * TS; } return Infinity; };
  ok(slopeLint(L, T).length === 0, `slopeLint is clean on the yard (${slopeLint(L, T).length} complaints)`);
  const R = floodReach(slopeReachGrid(L, T), T); let far = 0; for (let x = 2; x < L.W - 2; x++) if (R.seen.has(x + ',' + (DUNE_YARD_FLOOR - 1)) || [...R.seen].some(k => k.startsWith(x + ','))) far = x;
  ok(far >= L.W - 3, `the reach fill runs the whole yard (to column ${far} of ${L.W - 1})`);
  // every hill section walked right, no hop, foot on the surface
  for (const [name, x0, x1] of [['steep', S.steep - 2, S.gentle - 2], ['gentle', S.gentle - 2, S.peak - 2], ['peak', S.peak - 2, S.valley - 2], ['valley', S.valley - 2, S.slide - 2]]) {
    const P = newKnight(x0 * TS + 8, fy(x0 * TS + 8)); P.ground = true; P._sg = true; let hops = 0, worst = 0, f = 0;
    while (P.x < x1 * TS && f++ < 3000) { const r = knightStep(P, { move: 1 }, 0.6 / 60, mv(P), tA); if (f > 3 && !r.ground) hops++; worst = Math.max(worst, Math.abs(P.y - fy(P.x))); }
    ok(hops === 0 && worst < 0.01 && P.x >= x1 * TS, `${name} section walked end to end: ${hops} hops, worst foot gap ${worst.toFixed(3)} px`); }
  // the slide gap: a running (sprint-capped) jump from the lip falls in; a slide jump from the same lip clears it
  { const lip = S.gap[0] * TS - 1, far = (S.gap[1] + 1) * TS;
    const tryIt = slide => { const top = (S.slide + 5) * TS + 4, P = newKnight(top, fy(top)); P.ground = true; P._sg = true; P.vx = RUN;   /* the same start: the hilltop, at a run */
      let f = 0; while (P.x < lip - 4 && f++ < 3000) knightStep(P, { move: 1, down: slide, cap: 1.15 }, 0.6 / 60, mv(P), tA, slide);   /* down the far side walking at the sprint's speed, or sliding */
      knightStep(P, { move: 1, jumpPress: true, jump: true, down: slide, cap: 1.15 }, 0.6 / 60, mv(P), tA, slide); let up = false;
      let atWall = null;   /* where the feet were when the body first reached the far wall's line: the mantle catches a lip 3-11 px over the feet */
      for (f = 0; f < 600; f++) { const r = knightStep(P, { move: 1, jump: true, cap: 1.15 }, 0.6 / 60, mv(P), tA, slide); if (atWall === null && (r.hitX || P.x + P.w / 2 >= far - 1)) atWall = P.y - DUNE_YARD_FLOOR * TS; if (P.vy < 0) up = true; if (r.ground && up) break; }
      return { x: P.x, y: P.y, cleared: P.x > far && P.y <= DUNE_YARD_FLOOR * TS + 0.01, past: (P.x - far) / TS, below: atWall ?? Infinity }; };   /* Infinity: it never reached the far wall at all */
    const run = tryIt(false), sl = tryIt(true);
    ok(!run.cleared && run.below > 16 && sl.cleared && sl.past > 0.5, `the slide gap (${S.gap[1] - S.gap[0] + 1} tiles): down the same hill at the sprint's speed and jumping at the lip meets the far wall with its feet ${Number.isFinite(run.below) ? run.below.toFixed(0) + ' px' : 'never reaching it,'} under the lip (the mantle reaches 11) and falls in; sliding and jumping there lands ${sl.past.toFixed(1)} tiles past the far edge`); }
  // the face stops a walk; the lone R1 is walked up and stepped off
  { const P = newKnight((S.face) * TS, DUNE_YARD_FLOOR * TS); P.ground = true; P._sg = true; let hit = 0; for (let f = 0; f < 300; f++) if (knightStep(P, { move: 1 }, 0.6 / 60, mv(P), tA).hitX) hit++;
    ok(hit > 0 && P.x < S.faceTile * TS, `the face tile stops a walk at x ${(P.x / TS).toFixed(2)} (its face at ${S.faceTile})`); }
  // the soldiers: dropped where the yard puts them, they patrol their hill and never turn at its top
  for (const e of L.ents.filter(e => e.t === 'soldier')) { const w = newWalker(e.x * TS + 8, (e.y + 1) * TS, 10, 14, 30); w.face = e.face; const m0 = newMove(tA)(null); let air = 0;
    for (let f = 0; f < 4000; f++) { const r = walkerStep(w, 1 / 60, m0, newProbe, tA); if (f > 5 && !r.ground) air++; }
    const falseEdges = w.turnAt.filter(t => t[0] === 'edge' && !(t[1] >= (S.gap[0] - 2) * TS && t[1] <= (S.gap[1] + 2) * TS));   // the pit's lip is a real edge
    ok(falseEdges.length === 0 && air === 0, `the soldier on column ${e.x} patrols with ${w.turns} turns (walls, the pit's lip), ${falseEdges.length} at false edges, ${air} frames in the air`); }
}
function lintOk(L) { return slopeLint(L, T).length === 0; }

console.log(fails ? `\nslopes: ${fails} FAILED` : '\nslopes: all passed');
process.exit(fails ? 1 : 0);
