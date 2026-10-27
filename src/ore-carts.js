// src/ore-carts.js - THE ORE ROAD'S LAUNCHED CARTS (claude/oreroadminor, Daniel 10-26 14:35: "launched minecarts, LAUNCH-ONLY: the player never rides them" - riding is THE DEEP RAILS' identity, the next level).
//
//   THE VERB: SHOVE THE CART. A cart waits on a short rail; ATTACK it (a running hit rolls it harder) and it rolls down the line, away from you. The cart is never a floor: you cannot stand on it, ride it or hurt yourself on it.
//   WHAT A LAUNCHED CART DOES: it RAMS whatever stands on its rail (a foe is hurt and thrown, the cart gives up a little speed), it SMASHES a BARRICADE across the line if it has speed enough (the barricade is real rock-solid
//   at build time and a blade does nothing to it - the cart is the key), and at the end of the line its buffer TRIPS a CHAIN that pulls a cold lamp (src/ore-works.js lights the dark stretch for good).
//   NEVER A SOFT-LOCK: a spent cart sits two and a half seconds and then its chain hauls it home; a weak roll that dies mid-rail can be shoved again; a death resets the rail, the cart and the barricade (main.js's
//   spawnEntities runs OWK.reset after mendAll).
//
// PURE (no DOM, no globals): the rail, the cart's state and the roll are arithmetic so tools/ore-road.mjs can prove them with no page. The hands that bind it to the world are in src/ore-works.js; the drawing is src/ore-carts-art.js.
export const OC = {
  w: 22, h: 13,                 // the cart's body (px)
  buf: 14,                      // a buffer stop's depth (px): the cart's nose stops against it
  v0: 150, vRun: 0.45, vBoost: 1.12, vMax: 245,   // a shove: 150 px/s, plus 45% of your own running speed (a running hit), a second hit on a rolling cart adds 12%; never past vMax
  fric: 16,                     // px/s^2 off a rolling cart: a long run bleeds a little, a short one does not
  vSmash: 100,                  // the least speed that breaks a barricade (a shove from rest at the rail's home has ~130 on arrival; a bump below this just thuds and rolls back)
  vRam: 55,                     // the least speed that rams a foe
  ram: 24, ramKeep: 0.84,       // a ram's damage (raw HP: a sapper or rockgoblin dies, a miner is hurt, a heavy shrugs it) and the share of speed the cart keeps
  vTrip: 45,                    // the least speed that trips the chain at the line's end
  spentT: 2.6, homeV: 62,       // seconds spent at an end before its chain hauls it home, and how fast it goes
  hitPad: 5,                    // your blade's reach past the cart's body (px)
};
/* THE STATE OF A CART from its data row: d = { id, x0, x1 (the rail, px: the first buffer's west face and the last buffer's east face), home (px: the cart's centre at rest), bar: { l, r, t, b } | null,
   ext (px: where the rail ends once the barricade is down, past its mouth), trip: { lamp } | null, y (the rail's surface, px) } */
export function makeCart(d) {
  return { ...d, x: d.home, v: 0, st: 'rest', t: 0, broken: false, tripped: false, rammed: new Set(), face: 1, wheel: 0, tilt: 0, jolt: 0 };
}
/* the least and most the cart's centre can travel: its nose stops on the buffer at either end; once the barricade is down the rail runs on to `ext` */
export function limits(c) {
  const lo = c.x0 + OC.buf + OC.w / 2;
  const hiEnd = c.bar && !c.broken ? c.bar.l : (c.bar && c.ext ? c.ext : c.x1);
  const hi = hiEnd - (c.bar && !c.broken ? 0 : OC.buf) - OC.w / 2;
  return [lo, hi];
}
/* A SHOVE: dir is +1 east, -1 west; runV your own horizontal speed (px/s) */
export function shove(c, dir, runV = 0) {
  if (c.st === 'roll' && Math.sign(c.v) === dir) { c.v = Math.sign(dir) * Math.min(OC.vMax, Math.abs(c.v) * OC.vBoost + 12); return 'boost'; }
  c.v = dir * Math.min(OC.vMax, OC.v0 + OC.vRun * Math.abs(runV)); c.st = 'roll'; c.t = 0; c.rammed = new Set(); c.face = dir; return 'launch';
}
/* ONE STEP. rams(cart, box) is asked once a frame for the foes on the rail and returns how many it hurt. Returns the events of the frame: 'smash', 'bump', 'end', 'trip', 'home', 'rest'. */
export function stepCart(c, dt, rams) {
  const ev = []; const [lo, hi] = limits(c);
  c.t += dt; c.jolt = Math.max(0, c.jolt - dt * 4);
  if (c.st === 'roll') {
    const dir = Math.sign(c.v) || c.face, sp = Math.abs(c.v);
    const nv = Math.max(0, sp - OC.fric * dt); c.v = dir * nv; c.wheel += c.v * dt / 5; c.tilt = 0;
    let nx = c.x + c.v * dt;
    /* THE BARRICADE: the nose meets it (east only: a barricade stands on the rail's far end) */
    if (c.bar && !c.broken && dir > 0 && nx + OC.w / 2 >= c.bar.l) {
      if (Math.abs(c.v) >= OC.vSmash) { c.broken = true; c.v *= 0.55; ev.push('smash'); }
      else { nx = c.bar.l - OC.w / 2; c.v = -Math.abs(c.v) * 0.25; c.st = 'spent'; c.t = 0; ev.push('bump'); }
    }
    if (c.st === 'roll') {
      const [lo2, hi2] = limits(c);
      if (nx >= hi2 && dir > 0) { nx = hi2; const sp2 = Math.abs(c.v); c.v = 0; c.st = 'spent'; c.t = 0; ev.push('end');
        if (c.trip && !c.tripped && sp2 >= OC.vTrip && (!c.bar || c.broken)) { c.tripped = true; ev.push('trip'); } c.jolt = 1; }
      else if (nx <= lo2 && dir < 0) { nx = lo2; c.v = 0; c.st = 'spent'; c.t = 0; ev.push('end'); c.jolt = 1; }
      else if (nv < 6) { c.v = 0; c.st = 'rest'; ev.push('rest'); }
    }
    c.x = nx;
    if (c.st === 'roll' && rams) rams(c, { l: c.x - OC.w / 2, r: c.x + OC.w / 2, y: c.y });
  } else if (c.st === 'spent') {
    if (c.v) { c.x += c.v * dt; c.v *= Math.max(0, 1 - dt * 6); if (Math.abs(c.v) < 4) c.v = 0; const [l2, h2] = limits(c); c.x = Math.max(l2, Math.min(h2, c.x)); }
    if (c.t >= OC.spentT) { c.st = 'home'; c.t = 0; }
  } else if (c.st === 'home') {
    const dir = Math.sign(c.home - c.x); const d = Math.abs(c.home - c.x);
    if (d <= OC.homeV * dt) { c.x = c.home; c.st = 'rest'; c.v = 0; ev.push('home'); }
    else { c.x += dir * OC.homeV * dt; c.wheel += dir * OC.homeV * dt / 5; c.face = dir; c.v = 0; }
  }
  return ev;
}
/* how far a cart rolls from a shove at rest before it either meets something or runs dry (a tool's check, and the level's: the TEACH rail must break its barricade from a standing shove) */
export function dryRun(c0, dir = 1, runV = 0) {
  const c = makeCart(c0); shove(c, dir, runV); const ev = []; let guard = 0;
  while (c.st === 'roll' && guard++ < 6000) for (const e of stepCart(c, 1 / 60, null)) ev.push(e);
  return { x: c.x, v: c.v, ev, broken: c.broken, st: c.st };
}
