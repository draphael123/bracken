// src/line-jumpers-hands.js - THE LINE-JUMPERS' HANDS (claude/hlcartf, 11-14): main.js owns the world; this module owns the boarders (src/line-jumpers.js) on a level whose cart rides
// carry jumper rows (L.lineCarts[i].jumpers). The same shape as src/line-cart-hands.js / src/highlines-hands.js. EVERY hook is opt-in and behind the cart flag: c.flagOn() is the cart flag
// (src/line-cart.js HL_CART, ?hlcart=1, default OFF) - with it off load() builds nothing and every other call returns at once, so no frame of the game runs a line of it.
//   makeJumperHands(c)  c = { flagOn(), L(), carts(): [cartState], players(): [body], seats(): n, time(), drag(cs, h, dx), hurt(h, dmg, fromX), say, sound, coin(x, y, off, cs) }
//   load()   a level load / respawn / shrine: the jumpers from each ride's rows, for the seats now in the party (co-op rows ride only from their seat count)
//   step(dt) once a frame, AFTER the cart's own step           take(e, dmg, fromX, o) -> dmg   from hurtEnemy        shot(x, y, r) -> bool   a projectile at (x, y) on his drop-line or on him in the air (a cut = he falls); on the cart it is an ordinary hit (hurtEnemy -> take)
//   push(e, dx)  the paladin's bash, the warden's ward        draw(g, cx, cy, time)   the greybox        all()   the live jumpers        owns(e)
// main.js WIRING OWED to lane HLCARTL (six one-line hooks, same as the Hookjack's): (1) construct + load() beside HLX.load; (2) step(dt) after the cart hands' world(dt); (3) hurtEnemy: if (HLJ.owns(e))
// dmg = HLJ.take(e, dmg, fromX, o); (4) a hero projectile's per-frame test: HLJ.shot(x, y, r) -> true = it ends; (5) draw(g, cx, cy, time) beside the cart's drawWorld; (6) the bestiary line / EHP row 'linejumper' (hp JK.hp).
import { JK, jumpersOf, jumperStep, jumperTake, jumperPush, jumperCut, jumperDied, jumperShotHits, drawJumper } from './line-jumpers.js';

export function makeJumperHands(c) {
  let list = [], last = -9;
  const on = () => !!c.flagOn() && list.length > 0;
  const cartOf = e => (c.carts() || []).find(cs => cs.id === e.ride);
  const world = cs => ({ cart: cs, heroes: () => c.players(), hurt: (h, d, x) => c.hurt(h, d, x), drag: (h, dx) => c.drag(cs, h, dx), time: () => c.time(), lastSwipe: () => last, swiped: t => { last = t; },
    say: (x, y, t, col) => c.say && c.say(x, y, t, col), sound: k => c.sound && c.sound(k), mark: (e, m) => { e.mk = m; e.mkT = 0.6; }, coin: (x, y, off) => c.coin && c.coin(x, y, off, cs) });
  function load() {
    list = []; last = -9; if (!c.flagOn()) return 0;
    const L = c.L(); if (!L) return 0;
    for (const ride of (L.lineCarts || [])) list.push(...jumpersOf(ride, c.seats ? c.seats() : 1));
    return list.length;
  }
  function step(dt) {
    if (!on()) return;
    for (const e of list) { const cs = cartOf(e); if (cs) { const w = world(cs); jumperStep(e, dt, w); if (e.alive && e.mode !== 'fall' && e.hp <= 0 && !e.fell) jumperDied(e, w); } }
  }
  const owns = e => !!e && e.t === 'linejumper' && list.includes(e);
  function take(e, dmg, fromX, o) { const cs = cartOf(e); return cs ? jumperTake(e, dmg, fromX, world(cs), o) : dmg; }
  function push(e, dx) { const cs = cartOf(e); return cs ? jumperPush(e, dx, world(cs)) : false; }
  function shot(x, y, r) { if (!on()) return false; for (const e of list) if (e.alive && jumperShotHits(e, x, y, r)) { const cs = cartOf(e); if (cs && (e.mode === 'hang' || e.mode === 'swing')) return jumperCut(e, world(cs)); } return false; }
  function draw(g, cx, cy, time) { if (!on()) return; for (const e of list) if (e.alive || e.mode === 'fall') drawJumper(g, e, cx, cy, time); }
  return { on, load, step, take, push, shot, draw, owns, all: () => list, JK };
}
