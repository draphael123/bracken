// src/slopes.js — THE SLOPES ENGINE, phase 1: a pure module (no DOM, no globals of main.js).
//
// A slope tile is a floor whose height varies across the tile. Six kinds:
//   steep  1:1  SLOPE_R1 (rises to the RIGHT), SLOPE_L1 (rises to the LEFT)
//   gentle 1:2  SLOPE_R2A + SLOPE_R2B  (two tiles side by side, A the low half, B the high half, rising right)
//               SLOPE_L2B + SLOPE_L2A  (the same rising left: B on the left, high; A on the right, low)
// Every slope sits on rock: the tile under a slope must be solid (a slope is the top of a hill, not a ramp in
// the air), and its high edge meets either rock at the same height (the landing) or the next slope.
//
// THE SAFETY CASE. moveBodySlopes() is today's moveBody (src/main.js ~4066) with hooks that only fire when a
// slope tile is read. When no slope tile is within reach of the body it runs moveBodySquare(), a line-for-line
// copy of moveBody, and even the slope path reduces to that copy on square tiles. tools/slopes.mjs proves both
// against the moveBody it extracts from main.js itself, on fuzzed grids and on the real levels.
//
// THE MODEL on a slope is the Mega-Drive one: the body's FOOT is the single point under its centre. The centre
// column decides the floor; the edges of the body do not catch on the rock at the top of a slope, and walking
// uphill, the feet are lifted to the surface; walking downhill they are snapped down to it, so nothing hops.
import { T, TS } from './level.js';

export const SLOPE = { R1: 20, L1: 21, R2A: 22, R2B: 23, L2A: 24, L2B: 25 };
export const SLOPE_NAMES = { 20: 'SLOPE_R1', 21: 'SLOPE_L1', 22: 'SLOPE_R2A', 23: 'SLOPE_R2B', 24: 'SLOPE_L2A', 25: 'SLOPE_L2B' };
export const isSlope = t => t >= 20 && t <= 25;
// which way it rises (+1 = the right side is higher) and how steep (pixels of rise per pixel across)
export const slopeRise = t => (t === SLOPE.R1 || t === SLOPE.R2A || t === SLOPE.R2B) ? 1 : -1;
export const slopeGrade = t => (t === SLOPE.R1 || t === SLOPE.L1) ? 1 : 0.5;
/* the floor surface inside the tile: pixels DOWN from the tile's top, at xIn (0..16) across it */
export function heightAt(kind, xIn) {
  const x = xIn < 0 ? 0 : xIn > TS ? TS : xIn;
  switch (kind) {
    case SLOPE.R1: return TS - x;
    case SLOPE.L1: return x;
    case SLOPE.R2A: return TS - x / 2;
    case SLOPE.R2B: return TS / 2 - x / 2;
    case SLOPE.L2A: return TS / 2 + x / 2;
    case SLOPE.L2B: return x / 2;
  }
  return 0;
}
/* the surface at world x of a slope at (tx, ty), in world pixels */
export const surfaceY = (kind, tx, ty, x) => ty * TS + heightAt(kind, x - tx * TS);
/* the height of a slope's edge on the `dir` side (dir +1 = its right edge) */
const edgeH = (kind, dir) => heightAt(kind, dir > 0 ? TS : 0);
export function levelHasSlopes(grid) { for (let i = 0; i < grid.length; i++) if (grid[i] >= 20 && grid[i] <= 25) return true; return false; }

// ---- today's collision, copied line for line from src/main.js (isSolid ~4040, isOneWay ~4065, moveBody ~4066) ----
// Only three things differ, and none of them is behaviour: tileAt is handed in, P (the player, for the knight's
// ledge assist and one-way catch) is handed in, and the helpers take tileAt. tools/slopes.mjs checks this copy
// against the live function on every run.
const isSolidT = (tileAt, tx, ty) => { const t = tileAt(tx, ty); return t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || t === T.ICE || t === T.WEB; };
export const isOneWay = t => t === T.ONEWAY || t === T.REED || t === T.PLANK || t === T.NET || t === T.BOUNCER || t === T.SHELF || t === T.RAIL || t === T.CRYST;
export function moveBodySquare(b, dx, dy, tileAt, allowDrop = false, P = null) {
  const isSolid = (tx, ty) => isSolidT(tileAt, tx, ty);
  const r = { hitX: false, hitY: false, ground: false, groundTile: null };
  if (dx !== 0) {
    const dir = Math.sign(dx); let nx = b.x + dx;
    const edge = dir > 0 ? nx + b.w / 2 - 0.01 : nx - b.w / 2;
    const tx = Math.floor(edge / TS);
    if (b === P && !P.fly && !P.ground && P.vy > -90) { const fr = Math.floor((b.y - 0.5) / TS), lip = fr * TS;
      if (isSolid(tx, fr) && b.y - lip > 0 && b.y - lip <= 6) { let room = true; for (let ty = Math.floor((lip - b.h) / TS); ty < fr && room; ty++) if (isSolid(tx, ty) || isSolid(Math.floor(b.x / TS), ty)) room = false; if (room) { b.y = lip; P.vy = Math.min(P.vy, 0); } } }
    const top = b.y - b.h + 0.5, bot = b.y - 0.5;
    const ty0 = Math.floor(top / TS), ty1 = Math.floor(bot / TS);
    for (let ty = ty0; ty <= ty1; ty++) if (isSolid(tx, ty)) { nx = dir > 0 ? tx * TS - b.w / 2 : (tx + 1) * TS + b.w / 2; r.hitX = true; break; }
    b.x = nx;
  }
  if (dy !== 0) {
    const dir = Math.sign(dy); let ny = b.y + dy;
    const l = b.x - b.w / 2 + 0.5, rr = b.x + b.w / 2 - 0.5;
    const tx0 = Math.floor(l / TS), tx1 = Math.floor(rr / TS);
    if (dir > 0) {
      const ty = Math.floor((ny - 0.01) / TS);
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = tileAt(tx, ty);
        if (t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT) { ny = ty * TS; r.ground = true; r.hitY = true; r.groundTile = t; break; }
        if (isOneWay(t) && !allowDrop && b.y <= ty * TS + (b === P && !P.fly ? 6 : 0.5)) { ny = ty * TS; r.ground = true; r.groundTile = t; }
      }
    } else {
      const ty = Math.floor((ny - b.h) / TS);
      for (let tx = tx0; tx <= tx1; tx++) if (isSolid(tx, ty)) { ny = (ty + 1) * TS + b.h; r.hitY = true; break; }
    }
    b.y = ny;
  }
  return r;
}

// ---- the slope path ----
/* is there a slope anywhere the body could touch this step? (the box, the step, and a snap's depth under the feet) */
export function slopeNear(b, dx, dy, tileAt) {
  const ax = Math.abs(dx);
  const c0 = Math.floor((b.x - b.w / 2 - ax - 2) / TS), c1 = Math.floor((b.x + b.w / 2 + ax + 2) / TS);
  const r0 = Math.floor((b.y - b.h - Math.max(0, -dy) - 2) / TS), r1 = Math.floor((b.y + Math.max(0, dy) + ax + 6) / TS);
  for (let ty = r0; ty <= r1; ty++) for (let tx = c0; tx <= c1; tx++) if (isSlope(tileAt(tx, ty))) return true;
  return false;
}
/* the slope surface in the column under world x, looked for from row floor(yA/TS) down to row floor(yB/TS) */
function slopeInColumn(tileAt, x, yA, yB) {
  const tx = Math.floor(x / TS);
  for (let ty = Math.floor(yA / TS); ty <= Math.floor(yB / TS); ty++) { const t = tileAt(tx, ty); if (isSlope(t)) return { kind: t, tx, ty, s: surfaceY(t, tx, ty, x) }; }
  return null;
}
/* the first floor under world (x, y) within `depth` pixels in that column: a slope's surface, or the top of rock or a ledge */
function floorBelow(tileAt, x, y, depth, allowDrop) {
  const tx = Math.floor(x / TS);
  for (let ty = Math.floor((y - 0.01) / TS); ty <= Math.floor((y + depth) / TS); ty++) {
    const t = tileAt(tx, ty);
    if (isSlope(t)) { const s = surfaceY(t, tx, ty, x); if (s >= y - 0.01 && s <= y + depth) return { s, t }; continue; }
    const top = ty * TS; if (top < y - 0.01) continue;
    if (t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || (isOneWay(t) && !allowDrop)) return top <= y + depth ? { s: top, t } : null;
  }
  return null;
}

/* moveBodySlopes(body, dx, dy, tileAt, opts): moveBody, and slopes.
   opts = { allowDrop, P, forceSlopePath }. Reuse one opts object per caller: this runs for every body every frame.
   Returns moveBody's { hitX, hitY, ground, groundTile } plus `slope` (the slope kind under the feet, or 0).
   It keeps two fields on the body: b._sg (it ended its last vertical step on the ground) and b._ss (on a slope). */
const NO_OPTS = {};
export function moveBodySlopes(b, dx, dy, tileAt, opts = NO_OPTS) {
  const allowDrop = !!opts.allowDrop, P = opts.P || null;
  if (!opts.forceSlopePath && !slopeNear(b, dx, dy, tileAt)) {
    const r = moveBodySquare(b, dx, dy, tileAt, allowDrop, P); r.slope = 0;
    if (dy !== 0) { b._sg = r.ground; b._ss = 0; }
    return r;
  }
  const isSolid = (tx, ty) => isSolidT(tileAt, tx, ty);
  const r = { hitX: false, hitY: false, ground: false, groundTile: null, slope: 0 };
  const wasG = !!b._sg, wasS = b._ss || 0, ax = Math.abs(dx);
  if (dx !== 0) {
    const dir = Math.sign(dx); let nx = b.x + dx;
    const edge = dir > 0 ? nx + b.w / 2 - 0.01 : nx - b.w / 2;
    const tx = Math.floor(edge / TS);
    /* HOOK 0: the knight's LEDGE ASSIST runs with P.ground false every frame (main.js clears it before moveBody), so on
       a slope it would see the rock at the top as a lip a few pixels up and pop him onto it. A foot on a slope is not in
       the air: no assist. (On square tiles wasS is 0 and there is no slope under the foot, so this is the old line.) */
    if (b === P && !P.fly && !P.ground && P.vy > -90 && !wasS && !slopeInColumn(tileAt, b.x, b.y - 1, b.y + 1)) { const fr = Math.floor((b.y - 0.5) / TS), lip = fr * TS;
      if (isSolid(tx, fr) && b.y - lip > 0 && b.y - lip <= 6) { let room = true; for (let ty = Math.floor((lip - b.h) / TS); ty < fr && room; ty++) if (isSolid(tx, ty) || isSolid(Math.floor(b.x / TS), ty)) room = false; if (room) { b.y = lip; P.vy = Math.min(P.vy, 0); } } }
    const top = b.y - b.h + 0.5, bot = b.y - 0.5;
    const ty0 = Math.floor(top / TS), ty1 = Math.floor(bot / TS);
    const step = b.w / 2 + ax + 2;   // how far above the feet a slope may reach at the leading edge and still be walked
    for (let ty = ty0; ty <= ty1; ty++) {
      if (isSolid(tx, ty)) {
        /* HOOK 1, THE LANDING: the rock at the top of a slope is where the slope arrives, not a wall. The leading edge
           reaches it before the foot does, a few pixels under its top. */
        const back = tileAt(tx - dir, ty);
        if (isSlope(back) && slopeRise(back) === dir && edgeH(back, dir) === 0 && b.y - ty * TS <= step) continue;
        nx = dir > 0 ? tx * TS - b.w / 2 : (tx + 1) * TS + b.w / 2; r.hitX = true; break; }
      /* HOOK 2, THE FACE: a slope met from its high side, from below its top, is a wall as tall as it stands there */
      const t = tileAt(tx, ty);
      if (isSlope(t) && surfaceY(t, tx, ty, Math.max(tx * TS, Math.min((tx + 1) * TS, edge))) < b.y - step) { nx = dir > 0 ? tx * TS - b.w / 2 : (tx + 1) * TS + b.w / 2; r.hitX = true; break; }
    }
    b.x = nx;
    /* HOOK 3, UPHILL: the foot is now under the surface by the rise it walked; lift it (any dy: a jump off a hill starts on it) */
    const up = slopeInColumn(tileAt, b.x, b.y - ax - 2, b.y);
    if (up && b.y > up.s && b.y - up.s <= ax + 1.5) { b.y = up.s; if (dy <= 0) { r.ground = dy === 0; r.slope = up.kind; r.groundTile = up.kind; } }
  }
  const settle = dy === 0 && (wasS || (wasG && slopeInColumn(tileAt, b.x, b.y - 1, b.y + ax + 4)));
  if (dy !== 0 || settle) {
    const dir = Math.sign(dy); let ny = b.y + dy;
    const l = b.x - b.w / 2 + 0.5, rr = b.x + b.w / 2 - 0.5;
    const tx0 = Math.floor(l / TS), tx1 = Math.floor(rr / TS);
    if (dir >= 0) {
      /* HOOK 4, THE FOOT: a slope in the centre column is the floor, wherever the edges of the body are */
      const sl = slopeInColumn(tileAt, b.x, Math.min(b.y, ny) - ax - 2, ny + 1);
      const ty = Math.floor((ny - 0.01) / TS), cx = Math.floor(b.x / TS);
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = tileAt(tx, ty);
        /* the rock or ledge beside a foot that is over a slope, higher than the slope there: the edge of the body is over
           it, the foot is not. Walking up, it is the landing not reached yet; walking down, the brow just left. */
        if (sl && tx !== cx && ty * TS < sl.s - 0.01) continue;
        if (t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT) { ny = ty * TS; r.ground = true; r.hitY = true; r.groundTile = t; break; }
        if (isOneWay(t) && !allowDrop && b.y <= ty * TS + (b === P && !P.fly ? 6 : 0.5)) { ny = ty * TS; r.ground = true; r.groundTile = t; }
      }
      if (sl && b.y <= sl.s + ax + 1.5 && ny >= sl.s && (!r.ground || sl.s < ny)) { ny = sl.s; r.ground = true; r.hitY = true; r.groundTile = sl.kind; r.slope = sl.kind; }
      /* HOOK 5, DOWNHILL: on the ground last step, not rising, and the floor has fallen away by no more than this step
         could have walked down it: follow it down. Only where a slope is involved, so a square ledge still drops you. */
      if (!r.ground && wasG) {
        const f = floorBelow(tileAt, b.x, ny, ax + 3, allowDrop);
        if (f && (isSlope(f.t) || wasS)) { ny = f.s; r.ground = true; r.hitY = true; r.groundTile = f.t; if (isSlope(f.t)) r.slope = f.t; }
      }
    } else {
      const ty = Math.floor((ny - b.h) / TS);
      for (let tx = tx0; tx <= tx1; tx++) {
        if (isSolid(tx, ty)) { ny = (ty + 1) * TS + b.h; r.hitY = true; break; }
        /* a slope's underside is a ceiling only to a head that comes up from under the tile */
        if (isSlope(tileAt(tx, ty)) && b.y - b.h >= (ty + 1) * TS - 0.01) { ny = (ty + 1) * TS + b.h; r.hitY = true; break; }
      }
    }
    b.y = ny;
  }
  if (dy !== 0 || settle) { b._sg = r.ground; b._ss = r.slope; }
  return r;
}

/* THE EDGE PROBE for walkers. Today every patrolling foe reads aheadT = tileAt(ftx, floor((y+1)/TS)) and turns at AIR
   or SPIKE. Going down a slope the tile at the feet' row ahead is AIR (the ground is lower), so it would turn at the
   top of every hill. aheadTile() returns exactly tileAt(ftx, fty) when there is no slope in that column near the feet;
   otherwise the slope (or the rock it runs down to) that a walker would step onto. */
export function aheadTile(tileAt, ftx, fty, feetY, w = 10) {
  const probe = w / 2 + 2, depth = probe + 3;
  let near = false;
  for (let ty = Math.floor((feetY - probe - 1) / TS); ty <= Math.floor((feetY + depth) / TS); ty++) if (isSlope(tileAt(ftx, ty))) { near = true; break; }
  if (!near && !isSlope(tileAt(ftx - 1, fty)) && !isSlope(tileAt(ftx + 1, fty))) return tileAt(ftx, fty);
  const x = ftx * TS + TS / 2;
  for (let ty = Math.floor((feetY - probe - 1) / TS); ty <= Math.floor((feetY + depth) / TS); ty++) {
    const t = tileAt(ftx, ty);
    if (isSlope(t)) return t;
    if (t !== T.AIR && ty * TS >= feetY - probe - 1) return t;
  }
  return tileAt(ftx, fty);
}
/* what is under the foot right now: the slope kind, or 0 */
export function footSlope(tileAt, b) { const sl = slopeInColumn(tileAt, b.x, b.y - 1, b.y + 1); return sl && Math.abs(sl.s - b.y) < 0.6 ? sl.kind : 0; }

// ---- THE SLIDE ----
/* Hold DOWN on a slope and you go down it on your back: fast, and the speed is yours to keep. On flat ground the slide
   bleeds off slowly while DOWN is held; jump out of it and the air keeps most of what the hill gave you.
   slideStep(s, dt, {kind, ground, down, move}) -> mutates s = { vx, sliding, carry } and returns it. `kind` is the slope
   under the foot (0 on flat). The caller skips its own walk/friction for the frame while s.sliding or s.carry is set. */
export const SLIDE = { acc: 700, maxSteep: 170, maxGentle: 140, flatFric: 150, airFric: 60, endSpeed: 60 };   /* tuned in tools/slopes.mjs: the leap out of a steep slide ~+70% on a full-run jump, not a new traversal verb */
export function slideStep(s, dt, { kind, ground, down, jumped }) {
  if (ground && kind && down) {
    const dirDown = -slopeRise(kind), max = slopeGrade(kind) === 1 ? SLIDE.maxSteep : SLIDE.maxGentle;
    if (!s.sliding) { s.sliding = true; if (Math.sign(s.vx) === -dirDown) s.vx *= 0.3; }   // pressing down while climbing turns you round
    const was = Math.abs(s.vx); s.vx += dirDown * SLIDE.acc * slopeGrade(kind) * dt;
    if (Math.abs(s.vx) > max) s.vx = Math.sign(s.vx) * (was <= max ? max : Math.max(max, was - 400 * dt));   // the hill's own top speed; anything faster (a gust, a carpet) bleeds down to it
    s.carry = false;
  } else if (s.sliding && ground && !kind) {   // off the foot of the hill: the flat takes it back slowly
    const sg = Math.sign(s.vx); s.vx -= sg * SLIDE.flatFric * dt; if (Math.sign(s.vx) !== sg) s.vx = 0;
    if (!down || Math.abs(s.vx) < SLIDE.endSpeed) s.sliding = false;
  } else if (s.sliding && ground && kind && !down) s.sliding = false;
  if (jumped && s.sliding) { s.sliding = false; s.carry = true; }
  if (s.carry) {
    if (ground && !jumped) s.carry = false;
    else { const sg = Math.sign(s.vx); s.vx -= sg * SLIDE.airFric * dt; if (Math.sign(s.vx) !== sg) s.vx = 0; }
  }
  if (!ground && s.sliding) { s.sliding = false; s.carry = true; }   // ran off the end of it: the leap
  return s;
}
