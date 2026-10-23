// src/royal-boar.js - THE ROYAL BOAR (claude/gorm2; Daniel 10-22: Kingswood's ONE new foe, "called by his hunting horn in P1 AND placed in the
// Hunting Stands' meadow as a level foe"). The King's own hunting beast, half again the woodsmen's boar: a crested back, gilded tusks, a royal
// collar. It ROOTS about until it has you level with it, then PAWS (a yellow '!', a huff, dust off its trotters, its lane drawn along the
// floor in red dots - the told windup, its own pose: head down, rump up) and CHARGES the length of the ground in a straight line. It does not
// stop for you: JUMP IT (it runs on under you) or BLOCK it (a shield turns it, dazed). At the end of its run - a wall, or the edge of its
// ground (it never runs off a drop) - it SKIDS and stands DAZED (stars, its own pose: head down, legs splayed): the opening, x1.5.
// Or BAIT IT UNDER A CAGE: anything hung over it that drops on it pens it (PENNED: a cage kills it outright - src/main.js dropcage, src/kingswood-hands.js land).
// Called by the horn (`called` set) it runs `passes` charges and then BOLTS out of the room; placed in a level it roots and charges for good.
// PURE but for ctx: main.js's updateRoyalBoar calls step(e, dt, ctx) and draw(g, e, cx, cy, time).
import * as RBA from './redraw/royal_boar_art.js';
export const RB_SAY = { turned: 'TURNED', bolts: 'IT BOLTS' };
export const RB = { w: 22, h: 15, hp: 66, root: 14, see: 150, seeY: 22, tell: 0.9, v: 205, vHall: 230, maxRun: 6, skid: 0.4, dazed: 1.4, cd: 1.2, dmg: 16, knockVx: 230, knockVy: -170, take: 1.5, passes: 2 };
export function newRoyalBoar(x, y, o = {}) {
  return { t: 'royalboar', x, y, vx: 0, vy: 0, w: RB.w, h: RB.h, hp: o.hp || RB.hp, maxHp0: o.hp || RB.hp, face: o.face || -1, alive: true, dying: 0, anim: Math.random() * 3, flash: 0, stagger: 0,
    mode: o.called ? 'enter' : 'root', modeT: o.called ? 0.5 : 1, cd: 0, hx: x, called: !!o.called, passes: o.called ? (o.passes || RB.passes) : 1e9, hall: !!o.hall, hit: false, lane: null };
}
export const boarOpen = e => !!e && (e.mode === 'dazed' || e.mode === 'skid');
/* ctx: P(), dt, solid(tx, ty), oneWay(tx, ty), moveBody(e, dx, dy) -> { ground, hitX }, damage(x, dmg, o) -> 'hit'|'blocked'|..., number(x, y, t, c), dust(x, y, n),
   part(o), sfx, TS, x0, x1 (the room it runs in, when called: it bolts out at the far side) */
export function boarStep(e, dt, c) {
  const P = c.P(), TS = c.TS; e.modeT -= dt; e.cd = Math.max(0, e.cd - dt); e.anim += dt; e.vy = Math.min(320, (e.vy || 0) + 1000 * dt);
  const d = P ? P.x - e.x : 0, ad = Math.abs(d), level = P && Math.abs(P.y - e.y) < RB.seeY;
  const footAhead = dir => { const ax = Math.floor((e.x + dir * (e.w / 2 + 3)) / TS), fy = Math.floor((e.y + 1) / TS); return c.solid(ax, fy) || c.oneWay(ax, fy); };
  const wallAhead = dir => { const ax = Math.floor((e.x + dir * (e.w / 2 + 2)) / TS), fy = Math.floor((e.y - 4) / TS); return c.solid(ax, fy); };
  let want = 0;
  if (e.stagger > 0 && (e.mode === 'charge' || e.mode === 'tell')) { e.mode = 'dazed'; e.modeT = Math.max(0.8, e.stagger); }
  switch (e.mode) {
    case 'enter':   /* called by the horn: it comes in through the door at a trot, then turns to the hall */
      want = e.face * 60; if (e.modeT <= 0) { e.mode = 'tell'; e.modeT = RB.tell; e.face = Math.sign(d) || e.face; c.number(e.x, e.y - e.h - 10, '!', '#ffd36b'); c.sfx.badgerHuff && c.sfx.badgerHuff(); laneOf(e, c); }
      break;
    case 'root':
      if (e.modeT <= 0) { e.modeT = 1 + Math.random() * 1.4; e.face = Math.abs(e.x - e.hx) > 24 ? (Math.sign(e.hx - e.x) || e.face) : -e.face; }
      want = footAhead(e.face) && !wallAhead(e.face) ? e.face * RB.root : 0;
      if (P && !P.dead && level && ad < RB.see && e.cd <= 0 && e.stagger <= 0) { e.face = Math.sign(d) || e.face; e.mode = 'tell'; e.modeT = RB.tell; c.number(e.x, e.y - e.h - 10, '!', '#ffd36b'); c.sfx.badgerHuff && c.sfx.badgerHuff(); laneOf(e, c); }
      break;
    case 'tell':   /* PAWS: head down, rump up, dust off its trotters, the lane on the floor */
      if (!e.called) e.face = Math.sign(d) || e.face;
      if (Math.random() < dt * 18) c.part({ x: e.x - e.face * 8, y: e.y - 1, vx: -e.face * (30 + Math.random() * 40), vy: -30 - Math.random() * 40, life: 0.35, max: 0.35, col: '#8a6a40', size: 1, grav: 300 });
      if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = RB.maxRun; e.hit = false; e.runFrom = e.x; c.sfx.badgerCharge && c.sfx.badgerCharge(); c.sfx.boarSquealRoar && c.sfx.boarSquealRoar(); }
      break;
    case 'charge':
      want = e.face * (e.hall ? RB.vHall : RB.v);
      if (Math.random() < dt * 14) c.dust(e.x - e.face * 8, e.y, 1);
      if (!e.hit && P && !P.dead && Math.abs(P.x - e.x) < e.w / 2 + 4 && P.y > e.y - e.h - 4 && P.y - 14 < e.y) { e.hit = true;
        const res = c.damage(e.x, RB.dmg, { who: e, blow: 'charge', name: 'THE ROYAL BOAR' });
        if (res === 'blocked') { e.mode = 'dazed'; e.modeT = RB.dazed; e.stagger = Math.max(e.stagger, RB.dazed); e.vx = -e.face * 70; e.vy = -90; c.number(e.x, e.y - e.h - 10, RB_SAY.turned, '#8fd160'); break; }
        if (res === 'hit') { P.vx = e.face * RB.knockVx; P.vy = RB.knockVy; P.ground = false; } }
      if (e.modeT <= 0 || !footAhead(e.face) || wallAhead(e.face) || e.wallHit) { e.mode = 'skid'; e.modeT = RB.skid; c.sfx.badgerSkid && c.sfx.badgerSkid(); }
      break;
    case 'skid':
      e.vx *= Math.pow(0.02, dt); want = e.vx; if (Math.random() < dt * 26) c.dust(e.x + e.face * 8, e.y, 1);
      if (e.modeT <= 0) { e.mode = 'dazed'; e.modeT = RB.dazed; e.passes--; }
      break;
    case 'dazed':
      if (Math.random() < dt * 5) c.part({ x: e.x + (Math.random() - 0.5) * 10, y: e.y - e.h - 4, vx: 0, vy: -14, life: 0.5, max: 0.5, col: '#ffd36b', size: 1, grav: 0 });
      if (e.modeT <= 0) { if (e.called && e.passes <= 0) { e.mode = 'bolt'; e.modeT = 3; e.face = (c.x1 !== undefined && Math.abs(e.x - c.x1) < Math.abs(e.x - c.x0)) ? 1 : -1; }
        else if (e.called) { e.face = -e.face; e.mode = 'tell'; e.modeT = RB.tell; c.number(e.x, e.y - e.h - 10, '!', '#ffd36b'); laneOf(e, c); }
        else { e.mode = 'root'; e.modeT = 0.8; e.cd = RB.cd; } }
      break;
    case 'bolt':   /* the horn's boar has run its passes: it bolts out of the room (through its wall: it is gone) */
      want = e.face * RB.v; if (Math.random() < dt * 10) c.dust(e.x - e.face * 8, e.y, 1);
      if (e.modeT <= 0 || (c.x0 !== undefined && (e.x < c.x0 + 6 || e.x > c.x1 - 6))) { e.alive = false; e.gone = true; c.number(e.x, e.y - e.h - 8, RB_SAY.bolts, '#c9b27c'); }
      break;
    default: e.mode = 'root';
  }
  if (e.mode !== 'skid') e.vx += (want - e.vx) * Math.min(1, dt * (e.mode === 'charge' ? 7 : 8));
  if (e.mode === 'bolt') { e.x += e.vx * dt; return; }   /* (out through the wall: no collision) */
  const r = c.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0; e.wallHit = !!(r && r.hitX);
  if (r && r.hitX && e.mode === 'root') e.face = -e.face;
}
/* THE LANE IT WILL RUN: from its snout to the wall or the edge of its ground (the told read: red dots along the floor) */
function laneOf(e, c) { const TS = c.TS, fy = Math.floor((e.y + 1) / TS); let tx = Math.floor(e.x / TS), n = 0;
  while (n < 60) { const nx = tx + e.face; if (c.solid(nx, fy - 1) || !(c.solid(nx, fy) || c.oneWay(nx, fy))) break; tx = nx; n++; }
  e.lane = { x0: e.x, x1: (tx + 0.5) * TS, y: e.y }; }
/* a blade on it: dazed it takes RB.take; it never turns a blow (it is a beast, not a duelist) */
export const boarTake = e => (boarOpen(e) ? RB.take : 1);

/* DRAWING (claude/gorm2art): the baked set of src/redraw/royal_boar_art.js - a three-step trot, the PAW (head down, rump up, a forehoof scraping, a gold rim: the told windup), the gallop, the skid, the dazed
   frame (legs splayed, crossed eyes, stars) and the hurt frame; the hall's hit flashes it white. */
export function drawRoyalBoar(g, e, cx, cy, time) {
  const R = Math.round, x = R(e.x - cx), y = R(e.y - cy), set = RBA.set(), dir = (e.face || 1) < 0 ? 'L' : 'R', fr = RBA.frameFor(e, time), md = e.mode, white = e.flash > 0;
  const c = (white ? set.white : set)[dir][fr], ax = (e.face || 1) < 0 ? c.width - set.ax : set.ax, ox = x - ax, oy = y - 33 + (md === 'charge' || md === 'bolt' ? -(Math.floor(e.anim * 24) & 1) : 0);
  if (md === 'tell') { const rim = RBA.rim(fr, dir); g.save(); g.globalAlpha = 0.45 + 0.3 * Math.sin(time * 22); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) g.drawImage(rim, ox + dx, oy + dy); g.restore();
    if (Math.floor(time * 12) % 2 === 0) { g.globalAlpha = 0.5; g.fillStyle = '#ffd36b'; g.fillRect(x - 14, y - 26, 28, 1); g.globalAlpha = 1; } }
  g.drawImage(c, ox, oy);
  if (md === 'dazed') for (let i = 0; i < 3; i++) { const a = time * 5 + i * 2.1, sx = x + R(Math.cos(a) * 9), sy = y - 30 + R(Math.sin(a) * 2); g.fillStyle = '#ffd36b'; g.fillRect(sx, sy - 1, 1, 3); g.fillRect(sx - 1, sy, 3, 1); }
}
/* THE LANE (drawn under it while it paws and runs) */
export function drawBoarLane(g, e, cx, cy, time) {
  if (!e.lane || !(e.mode === 'tell' || e.mode === 'charge' || e.mode === 'enter')) return;
  const R = Math.round, a = Math.min(e.lane.x0, e.lane.x1), b = Math.max(e.lane.x0, e.lane.x1), y = R(e.lane.y - cy) - 2;
  g.save(); g.globalAlpha = 0.45 + 0.3 * Math.sin(time * 10); g.fillStyle = '#ff6b5c';
  for (let x = a; x < b; x += 7) g.fillRect(R(x - cx), y, 3, 1);
  g.restore();
}
