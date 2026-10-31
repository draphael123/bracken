// tools/kg-hop.mjs - THE KITCHEN GATE's HOOK-TO-HOOK HOP, flown in Node (claude/kitchengate3). The real src/zipline.js zipStep rides and lets go; the flight between
// rails flies src/hero-move.js's own arc (gravity, the apex, the fall cap, the air run cap per hero and its bleed). Used by tools/kitchengate.mjs (every hand-off is
// proven for every hero's legs) and by the pilot's sense of where to hop.
import { zipStep, norm } from '../src/zipline.js';
import { MOVE, HERO_RUN } from '../src/hero-move.js';
const nop = () => {};
/* fly a hero who takes rail `from` at px x (on it), presses JUMP when he reaches hopX (null: rides to the end), holding `hold` (+1/-1 the run's way, 0 nothing).
   Returns { caught: the rail he took next or null, at: [x, y], t, path } - it stops when he is on another rail, or lands under `floorY`. */
export function flyHop(rails, from, x0, hopX, { hero = 'knight', hold = 1, floorY = 1e9, maxT = 4, dt = 1 / 60, boardT = 0 } = {}) {
  rails.forEach(norm); norm(from);
  const L = { zipLines: rails }, P = { x: x0, y: 0, vx: 0, vy: 0, face: from.dir || 1, ground: false, hurt: 0, atk: -1 };
  const keys = { up: true, down: false, left: false, right: false, jump: false };
  const c = { P, L, keys, upPress: true, jumpPress: false, SFX: new Proxy({}, { get: () => nop }), callout: nop, burst: nop, sparks: nop, number: nop, tell: nop };
  P.y = from.y0 + (from.y1 - from.y0) * ((x0 - from.x0) / ((from.x1 - from.x0) || 1)) + (from.hang ?? 12);
  /* he takes `from` (UP), only from */
  L.zipLines = [from]; zipStep(c, dt); L.zipLines = rails; keys.up = false; c.upPress = false;
  if (P.zip !== from) return { caught: null, fail: 'no hold', at: [P.x, P.y] };
  const airMul = (HERO_RUN[hero] || HERO_RUN.knight).air, cap = MOVE.RUN * airMul, path = [];
  let t = 0, hopped = false;
  for (; t < maxT; t += dt) {
    const dir = P.zip ? P.zipDir : (from.dir || 1);
    c.jumpPress = false;
    if (P.zip === from && hopX !== null && !hopped && (dir > 0 ? P.x >= hopX : P.x <= hopX)) { c.jumpPress = true; hopped = true; }
    if (!P.zip) {   /* THE ARC (main.js updatePlayer): light at the apex, heavier coming down */
      const rising = P.vy < 0, apex = Math.abs(P.vy) < MOVE.APEX_VY;
      P.vy += MOVE.GRAV * dt * (apex ? MOVE.APEX_G : rising ? 1 : MOVE.FALL_G); if (P.vy > MOVE.MAX_FALL) P.vy = MOVE.MAX_FALL;
      const mv = hold;
      if (mv && Math.abs(P.vx) > cap && Math.sign(P.vx) === mv) P.vx = mv * Math.max(cap, Math.abs(P.vx) - MOVE.OVER_BLEED * dt);
      else if (mv) P.vx += Math.sign(mv * cap - P.vx) * Math.min(Math.abs(mv * cap - P.vx), MOVE.ACC_AIR * dt);
      else P.vx -= Math.sign(P.vx) * Math.min(Math.abs(P.vx), MOVE.FRIC_AIR * dt);
    }
    keys.right = hold > 0; keys.left = hold < 0;
    const was = P.zip; zipStep(c, dt);
    if (P.zip && P.zip !== from) return { caught: P.zip, at: [P.x, P.y], t: t + boardT, path };
    P.x += P.vx * dt; P.y += P.vy * dt; path.push([P.x, P.y]);
    if (!P.zip && P.y > floorY) return { caught: null, fail: 'fell', at: [P.x, P.y], t, path };
  }
  return { caught: null, fail: 'time', at: [P.x, P.y], t, path };
}
/* the hop window on `from` for the catch of `to`: every hopX (px, step 2) whose hop catches `to`, for this hero and hold; and does riding to the end catch it? */
export function hopWindow(rails, from, to, o = {}) {
  norm(from); const dir = from.dir, xs = [], a = dir > 0 ? from.xa + 8 : from.xb - 8, b = dir > 0 ? from.xb - 12 : from.xa + 12;
  for (let hx = a; dir > 0 ? hx <= b : hx >= b; hx += dir * 2) { const r = flyHop(rails, from, a, hx, o); if (r.caught === to) xs.push(hx); }
  const end = flyHop(rails, from, a, null, o);
  return { xs, lo: xs.length ? Math.min(...xs) : null, hi: xs.length ? Math.max(...xs) : null, endCatches: end.caught === to };
}
