// src/zipline.js - THE SHARED ZIP LINE (claude/zipline, Daniel 2026-10-08: "Stormhold's ropes don't work in play").
// One module for every rope you ride. A level adds a LINE WITH ONE DATA ENTRY in its build:
//     zipLines.push({ x0, y0, x1, y1 })                    pixels: the rope's two ends (y = the ROPE, the hero hangs `hang` px under it)
//   optional:  speed (px/s, 210)   hang (px from the rope to his feet, 12)   id   posts: [[x, y, groundY], ...] (the poles it hangs from)
//              bunting: true   the Fair's own cloth rope (src/redraw/fair_keys.js draws the line; this module still draws its handles)
//              snap: s  fray: 0..1   a FRAYED rope: it gives way `snap` s after you take it - or where it would have snapped from its top
//              dir: 1 | -1   force the way it runs (a level line that is flat); the default is DOWNHILL
//   and main.js does the rest (updateTowerSlides -> zipStep, drawWorld -> drawZips / drawRider, the Fair's snap included).
// WHAT THE PLAYER GETS (the old rope took hold only within 22 px of its top end, east and downhill only, and nothing marked it):
//   - TAKE HOLD ANYWHERE ALONG IT: press UP with the rope inside your reach (standing under it too), or just TOUCH it from a jump.
//     Not while you climb a ladder, swim, swing a blade, roll, plunge, or have DOWN held (down is "no").
//   - RIDE DOWNHILL, EITHER WAY: the rope runs toward its low end, east or west, whichever way that is.
//   - LET GO: JUMP kicks off it (a hop, the way the old rope did); DOWN drops straight off. A hit lets go (hurt rules are the hero's own).
//   - IT IS DRAWN: a pulley and a handle at BOTH ends (a trolley that rides on the rope under you while you go), a glint when you are near
//     and not yet on it, a whine and sparks while you ride.
// Pure of main.js: zipStep(c, dt) takes a small context, so tools/watchtowers.mjs and tools/zipline.mjs drive the same code in Node.
export const ZIP = { SPEED: 210, HANG: 12, UP_LO: 24, UP_HI: 4, END_PAD: 8, RELEASE: 0.6 };

/* a data entry made whole (idempotent): the derived way it runs, its low end and its length */
export function norm(z) {
  if (z.zipN) return z;
  const dx = z.x1 - z.x0, dy = z.y1 - z.y0;
  z.hang = z.hang ?? ZIP.HANG; z.speed = z.speed || ZIP.SPEED;
  z.dir = z.dir !== undefined ? z.dir : (Math.abs(dy) < 2 ? 0 : (dy > 0 ? Math.sign(dx) : -Math.sign(dx)));   /* +1: rides east, -1: west, 0: flat (he rides the way he faces) */
  z.xa = Math.min(z.x0, z.x1); z.xb = Math.max(z.x0, z.x1); z.slope = dx ? dy / dx : 0;
  z.snapX = z.snap ? z.x0 + (z.dir || 1) * z.speed * z.snap : null;   /* the frayed rope's own limit: it never carries a late catch past where a catch at the top would have let go */
  z.zipN = true; return z;
}
export const lineY = (z, x) => z.y0 + z.slope * (Math.max(z.xa, Math.min(z.xb, x)) - z.x0);   /* the rope's height over x */
/* which way a hero takes the rope: its own run, or (a flat one) the way he faces */
const runDir = (z, P) => z.dir || (P.face < 0 ? -1 : 1);
const lowEnd = (z, dir) => (dir > 0 ? z.xb : z.xa);

/* CAN HE TAKE HOLD HERE? The rope must run under his reach (a body's height and a hand over it) and he must be on the stretch of it with some ride left. */
export function inReach(z, P) {
  norm(z); const dir = runDir(z, P);
  if (dir > 0 ? (P.x < z.xa - 10 || P.x > z.xb - ZIP.END_PAD - 4) : (P.x > z.xb + 10 || P.x < z.xa + ZIP.END_PAD + 4)) return false;
  if (z.snapX !== null && (dir > 0 ? P.x > z.snapX - 6 : P.x < z.snapX + 6)) return false;   /* a frayed rope past its limit is already gone */
  const ly = lineY(z, P.x);
  return ly >= P.y - ZIP.UP_LO && ly <= P.y - ZIP.UP_HI;
}
/* the rope he would take, nearest first, or null. `up`: the key (or a buffered press); otherwise only a touch in the air counts */
export function findCatch(L, P, up, downHeld) {
  let best = null, bd = 1e9;
  for (const z of (L.zipLines || [])) {
    if (z === P.zipSkip && !up) continue;   /* the rope he just kicked off, or dropped from: not by touch until he has landed or gone away from it */
    if (!up && (P.ground || downHeld || z.snap)) continue;   /* by touch only in the air, and never a frayed one: that is taken on purpose (UP) */
    if (!inReach(z, P)) continue;
    const d = Math.abs(lineY(z, P.x) - (P.y - 12)); if (d < bd) { bd = d; best = z; }
  }
  return best;
}

/* ONE FRAME. c = { P, L, keys, upPress, jumpPress, SFX, callout, burst, sparks, number, tell } (the page hands its own; a test hands stubs) */
export function zipStep(c, dt) {
  const { P, L, keys } = c, list = L.zipLines;
  P.zipRelease = Math.max(0, (P.zipRelease || 0) - dt);
  if (!list || !list.length) { P.zip = null; P.zipSkip = null; return; }
  if (P.zipSkip && (P.ground || P.swim || P.climb || !list.includes(P.zipSkip))) P.zipSkip = null;   /* the rope he let go of is not taken again by touch until he has stood on something (UP always takes it) */
  if (P.dead || P.hurt > 0 || !list.includes(P.zip)) P.zip = null;
  /* TAKE HOLD */
  if (!P.zip && !P.dead && !(P.hurt > 0) && !(P.zipRelease > 0) && !P.climb && !P.swim && !P.plunge && !(P.dodge > 0) && !(P.asleep > 0) && !(P.atk >= 0) && !(P.abuf > 0)) {
    const z = findCatch(L, P, !!(keys.up || c.upPress), !!keys.down);
    if (z) { P.zip = z; P.zipT = 0; P.zipDir = runDir(z, P); P.zipFx = 0; P.zipSkip = null; P.climb = false; P.vx = P.zipDir * z.speed;
      c.SFX.zipCatch ? c.SFX.zipCatch() : c.SFX.ratchet();
      if (z.snap) { c.SFX.ratchet(); c.callout('THE ROPE FRAYS: JUMP OFF BEFORE IT GOES'); }
      else if (!P.zipTold) { P.zipTold = true; c.callout('JUMP LETS GO. DOWN DROPS.'); } }
  }
  const z = P.zip; if (!z) return;
  const dir = P.zipDir || runDir(z, P);
  /* THE FRAYED ROPE GIVES WAY (the Fair's bunting): `snap` s after you take it, or where it would have, from its top */
  if (z.snap) { P.zipT = (P.zipT || 0) + dt;
    if (P.zipT >= z.snap || (z.snapX !== null && (dir > 0 ? P.x >= z.snapX : P.x <= z.snapX))) {
      P.zip = null; P.zipRelease = ZIP.RELEASE; P.vy = 0; P.vx = dir * 60; c.SFX.crack(); c.burst(P.x, P.y - 16, 8, ['#b8382c', '#e8c23a', '#5a4630'], 60, 0.5); c.callout('THE ROPE SNAPS'); return; } }
  /* LET GO: a kick off it (jump) or a drop (down) */
  if (c.jumpPress) { P.zip = null; P.zipSkip = z; P.zipRelease = ZIP.RELEASE; P.jbuf = 0; P.vy = -240; P.vx = dir * z.speed * 0.8; P.ground = false; P.climb = false; c.SFX.pJump(); return; }
  if (keys.down) { P.zip = null; P.zipSkip = z; P.zipRelease = ZIP.RELEASE * 0.5; P.vy = 40; P.vx = dir * z.speed * 0.4; c.SFX.pStep ? c.SFX.pStep() : 0; return; }
  /* RIDE: the rope's own height under his hands, his speed along it */
  const ty = lineY(z, P.x) + z.hang;
  P.climb = false; P.cling = true; P.ground = false; P.coyote = 0; P.face = dir; P.vx = dir * z.speed; P.vy = z.slope * P.vx + (ty - P.y) * 10;
  P.zipFx = (P.zipFx || 0) - dt;
  if (P.zipFx <= 0) { P.zipFx = 0.1; c.SFX.zipWhine ? c.SFX.zipWhine() : 0; c.sparks(P.x, lineY(z, P.x) - 1, -dir, 2); }
  if (dir > 0 ? P.x >= z.xb - ZIP.END_PAD + 3 : P.x <= z.xa + ZIP.END_PAD - 3) { P.zip = null; P.zipRelease = ZIP.RELEASE; P.vy = 0; P.vx = dir * 100; }
}

/* ---------------- DRAWING (greybox: plain shapes, in the rope's own colours) ---------------- */
function pulley(g, x, y, dir, lit, time) {   /* a wheel on the rope with a hanging grip: the thing you take hold of */
  g.fillStyle = '#2a2420'; g.fillRect(x - 3, y - 3, 7, 4);          /* the block */
  g.fillStyle = lit ? '#e8c23a' : '#9a8460'; g.fillRect(x - 2, y - 2, 5, 2);   /* its brass cheek (bright when you are by it) */
  g.fillStyle = '#c9d1dc'; g.fillRect(x - 1, y - 1, 3, 1);          /* the wheel's top on the rope */
  g.fillStyle = '#5a4630'; g.fillRect(x, y + 1, 1, 6);              /* the strap */
  g.fillStyle = '#6a4a30'; g.fillRect(x - 3, y + 6, 7, 2);          /* the grip bar */
  g.fillStyle = '#8b6a44'; g.fillRect(x - 3, y + 6, 7, 1);
}
/* THE ROPES AND THEIR HANDLES. P: the hero (for the glint's "near and not yet on it"). L.ropes lines already drawn by main (a line with no `zipN`) are left alone. */
export function drawZips(g, L, cx, cy, VW, VH, time, P) {
  for (const z of (L.zipLines || [])) {
    norm(z); if (z.xb < cx - 40 || z.xa > cx + VW + 40) continue;
    const X0 = Math.round(z.x0 - cx), Y0 = Math.round(z.y0 - cy), X1 = Math.round(z.x1 - cx), Y1 = Math.round(z.y1 - cy);
    if (!z.bunting) {   /* the Fair draws its own cloth rope */
      g.strokeStyle = '#2a2018'; g.lineWidth = 1; g.beginPath(); g.moveTo(X0, Y0 + 1.5); g.lineTo(X1, Y1 + 1.5); g.stroke();
      g.strokeStyle = '#c9b27c'; g.beginPath(); g.moveTo(X0, Y0 + 0.5); g.lineTo(X1, Y1 + 0.5); g.stroke();
      for (const [px, py, gy] of (z.posts || [])) { const x = Math.round(px - cx); g.fillStyle = '#4a3020'; g.fillRect(x - 2, Math.round(py - cy) - 4, 4, gy - py + 4); g.fillStyle = '#6a4a30'; g.fillRect(x - 1, Math.round(py - cy) - 4, 1, gy - py + 4); g.fillStyle = '#8b8378'; g.fillRect(x - 4, Math.round(py - cy) - 6, 8, 3); } }
    const near = P && Math.hypot(P.x - (z.x0 + z.x1) / 2, P.y - (z.y0 + z.y1) / 2) < 70 + Math.abs(z.x1 - z.x0) / 2;
    const lit = !!(near && P.zip !== z);
    const hi = z.y0 <= z.y1 ? [X0, Y0] : [X1, Y1];   /* the high end: where the trolley waits */
    pulley(g, X0, Y0, 1, lit, time); pulley(g, X1, Y1, -1, lit, time);
    if (lit) { const k = 0.5 + 0.5 * Math.sin(time * 5), gx = hi[0], gy = hi[1] + 3;   /* THE GLINT: a star on the handle */
      g.globalAlpha = 0.35 + 0.45 * k; g.strokeStyle = '#ffe9a0'; g.beginPath(); g.arc(gx, gy, 8 + 2 * k, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#fff6c8'; const r = 2 + Math.round(2 * k); g.fillRect(gx - r, gy, r * 2 + 1, 1); g.fillRect(gx, gy - r, 1, r * 2 + 1); g.globalAlpha = 1; }
  }
}
/* THE RIDER'S OWN TROLLEY, over the hero's hands (drawn after him): the block on the rope with his grip in front of him */
export function drawRider(g, P, cx, cy) {
  const z = P.zip; if (!z) return;
  const x = Math.round(P.x - cx), y = Math.round(lineY(z, P.x) - cy);
  g.fillStyle = '#2a2420'; g.fillRect(x - 3, y - 3, 7, 4); g.fillStyle = '#e8c23a'; g.fillRect(x - 2, y - 2, 5, 2); g.fillStyle = '#c9d1dc'; g.fillRect(x - 1, y - 1, 3, 1);
  g.fillStyle = '#5a4630'; g.fillRect(x, y + 1, 1, 3);
}
