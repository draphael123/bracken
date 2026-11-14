// src/line-cart-hands.js - THE CART'S HANDS (claude/hlcartk, 11-14): main.js owns the world; this module owns the zip-line cart engine (src/line-cart.js) on a level that declares
// L.lineCarts. The same shape as src/highlines-hands.js. EVERY hook is opt-in and behind the flag HL_CART (src/line-cart.js, ?hlcart=1, default OFF): on() is false with the flag off,
// on every level without L.lineCarts, so with the flag off no frame of the game runs a line of it.
//   load()          a level load: the carts from L.lineCarts (flag on only)            reset()   a respawn / shrine / party wipe: every cart home, every seat's flag clear
//   world(dt)       once a frame in updateMovers: cartStep on the REAL seats (carry:false: main.js's mover carry moves the ones standing on it); events -> sound + float texts
//   mover(m)        a mover tagged lk: 'cart:<id>' follows the cart's floor (returns true when it is one of ours)
//   camTarget(VW, VH)  { tx, ty } while a seat rides (the ride camera), else null - main.js uses it in place of the hero-follow target
//   drawWorld(g, cx, cy, VW, VH, time)   the greybox cart (art owed)
import * as LC from './line-cart.js';

export function makeCartHands(c) {
  let carts = [], cams = [];
  const sfx = k => { const S = c.sfx; const f = S && S[k]; if (f) f(); };
  const on = () => LC.HL_CART && carts.length > 0;
  function load() {
    carts = LC.HL_CART && c.L && c.L.lineCarts ? LC.cartsInit(c.L) : []; cams = carts.map(() => LC.newRideCam());
    for (const p of c.players()) if (p) { p.cartRide = null; p.cartDrag = 0; }
  }
  function reset() { if (!on()) return; for (const cs of carts) LC.cartRespawn(cs, c.players()); cams = carts.map(() => LC.newRideCam()); }
  function evSfx(e) {
    switch (e.t) {
      case 'cartBoard': case 'cartDock': case 'cartGo': case 'cartHome': sfx('clank'); break; case 'cartCount': sfx('tell'); break;
      case 'cartFall': sfx('thud'); c.shake && c.shake(3); break; case 'cartRoll': sfx('ratchet'); break;
      case 'cartFloat': c.callout && c.callout(e.text); break;
    }
  }
  function world(dt) {
    if (!on()) return; const ps = c.players().filter(Boolean);
    carts.forEach((cs, i) => { for (const e of LC.cartStep(cs, ps, dt, { carry: false, chip: c.chip ? (b, n) => c.chip(b, n) : null })) evSfx(e); LC.rideCamStep(cams[i], cs, dt, c.VW ? c.VW() : 320); });
  }
  function mover(m) {
    if (!on() || typeof m.lk !== 'string' || !m.lk.startsWith('cart:')) return false;
    const cs = carts.find(q => 'cart:' + q.id === m.lk); if (!cs) return false;
    const p = LC.cartPlatform(cs), ox = m.x, oy = m.y; m.x = p.x0; m.y = p.top; m.w = p.x1 - p.x0; m.dx = m.x - ox; m.dy = m.y - oy; m.broken = false; return true;
  }
  /* the cart a seat is riding right now (the one the camera follows): any living seat standing on, or in the air over, a cart */
  function riding() {
    for (let i = 0; i < carts.length; i++) { const cs = carts[i], x0 = cs.x - LC.CART.W / 2 - LC.CART.AIR_X, x1 = cs.x + LC.CART.W / 2 + LC.CART.AIR_X;
      for (const p of c.players()) if (p && !p.dead && p.cartRide === cs.id && p.x >= x0 && p.x <= x1) return i; }
    return -1;
  }
  function camTarget(VW, VH) { if (!on()) return null; const i = riding(); if (i < 0) return null; return LC.rideCamTarget(cams[i], carts[i], VW, VH); }
  function drawWorld(g, cx, cy, VW, VH, time) { if (!on()) return; for (const cs of carts) if (cs.x > cx - 80 && cs.x < cx + VW + 80) LC.drawCart(g, cs, cx, cy, time); }
  return { on, load, reset, world, mover, camTarget, drawWorld, carts: () => carts };
}
