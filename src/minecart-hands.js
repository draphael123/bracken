// src/minecart-hands.js - THE DEEP RAILS' HANDS (claude/minecart, the OPUS GREYBOX; DEEP RAILS 2, claude/deeprails2). src/minecart.js builds the level and holds
// the cart's numbers (MC); this binds them to the world. main.js owns the world and calls:
//   on, riding(pp), drive(P, dt, keys)  THE CART: the hero's horizontal pace is the cart's (cruise / pump / brake to a crawl - never a stop, never back), every
//                                       frame, before he moves; a wall or a shut gate ahead is a CRASH (it throws the cart back a length); on the drill's tunnel
//                                       the world runs past at cruise (src/great-drill-hands.js)
//   update(dt)                          the points (a blow on a lever, or E), the crushers, the gates, the rockfalls, the beams, THE RAILS THAT BREAK, THE LAUNCH
//                                       RAMPS, THE GOBLIN CARTS (riders' arrows and runes, a rider at his own pace), THE THROWERS on their ledges, THE FOREMAN,
//                                       THE RAM (full pump: what is on the line ahead), the ON-FOOT stretches (a derailment, a lift, a cart that waits), a fall
//                                       (A10 amended: a share of health and back on the rail - or, in an EXAM, the end), the glint and the 10 s nudge
//   interact(P)                         E at a lever throws it
//   rider(e, dt)                        a goblin on a cart / a ledge: its machine is this file's while it rides (the cart, the draw, the shot) - main.js skips its own
//   knock(e, dmg)                       a blow that lands on a rider throws him off his cart (the whole of his health); the foreman's cart turns it (x0.35)
//   reset()                             a load or a death: the points back to their default, the rails relaid, the goblins waiting, a fresh cart
//   holes(hole, cx, cy, dg)             THE DARK DRIFT: the headlamp's cone, the goblins' lanterns
//   drawWorld, drawCartBack, drawCart, drawHud, read, bakeOreIcon, handsState
import { MC, cartSpeed, runeAt } from './minecart.js';
import * as MCA from './redraw/minecart_art.js';
import { heightAt } from './slopes.js';
import { STUCK_HANDS } from './stuck-spots.js';
import { resolve, newStall, stallTick, drawGlint } from './stuck-guide.js';

export function makeMinecartHands(ctx) {
  const txt = (s, x, ...a) => { if (!(x > -48 && x < ctx.VW() + 48)) return; ctx.text(s, x, ...a); };
  let M = null;   /* the level's live state */
  const H = {};
  const TS = () => ctx.TS, R = Math.round;
  const L = () => ctx.L;
  H.on = () => !!(L() && L().minecart);
  /* ON FOOT (deeprails2): between a stretch's x0 and its board column the hero is out of the cart (positional, so a station inside it, a respawn or a tool all agree) */
  const footAt = x => { const Lv = L(); if (!Lv || !Lv.mcFoot) return null; const ts = TS(); return Lv.mcFoot.find(f => x >= f.x0 * ts && x < f.board * ts) || null; };
  H.footAt = footAt;
  H.riding = pp => H.on() && !!pp && !pp.dead && !pp.swim && !pp.climb && !footAt(pp.x);
  const cartOf = pp => pp.mcCart || (pp.mcCart = { v: 0, crashCd: 0, hist: [], lastGround: null, wasGround: true, crashT: 0, bounce: 0 });
  H.cart = pp => cartOf(pp);

  /* ---------- LOAD / DEATH ---------- */
  function build() {
    const Lv = L();
    M = { L: Lv, points: Lv.mcPoints.map(p => ({ ...p, state: p.dflt, flash: 0, said: false })), crushers: Lv.mcCrushers.map(c => ({ ...c })), gates: Lv.mcGates.map(g => ({ ...g })),
      rocks: Lv.mcRocks.map(r => ({ ...r, armed: true, fallT: -1, done: false })), beams: Lv.mcBeams.map(b => ({ ...b, cd: 0 })), carts: [], shots: [], runes: [], lobs: [], wrecks: [],
      breaks: (Lv.mcBreaks || []).map(b => ({ ...b, started: false, front: 0, broken: new Set(), debris: [] })), ramps: (Lv.mcRamps || []).map(r => ({ ...r })),
      stalls: {}, glint: null, clock: 0, said: {}, told: {}, tellT: -9, rumbleT: 0,
      n: { throws: 0, crashes: 0, falls: 0, crushed: 0, rocks: 0, beams: 0, gates: 0, taken: 0, knocked: 0, arrows: 0, runes: 0, retries: 0, rams: 0, bumps: 0, lobs: 0, lobHits: 0, launches: 0, breaks: 0, caught: 0, derails: 0, boards: 0, foremanRams: 0 } };
  }
  H.reset = () => {
    if (!H.on()) { M = null; return; }
    if (!M || M.L !== L()) build();
    for (const p of M.points) { p.state = p.dflt; layPoints(p); }
    for (const r of M.rocks) { r.armed = true; r.fallT = -1; r.done = false; }
    for (const b of M.breaks) relay(b);
    M.carts = []; M.shots = []; M.runes = []; M.lobs = []; M.wrecks = []; M.told = {}; M.tellT = -9;   /* (a life: every tell ahead of you is told again) */
    /* THE GOBLINS WAIT: a placed foe whose ent says ride: {...} is put away (not alive) until you pass its trigger */
    const ents = M.L.ents;
    for (const e of ctx.enemies()) { const k = e.xpKey ? +String(e.xpKey).split('.')[0] : -1, src = k >= 0 ? ents[k] : null;
      if (src && src.ride && e.alive) { e.mcRide = src.ride; e.mcWait = true; e.alive = false; e.mcSrcX = src.x; if (src.eliteName) e.eliteName = src.eliteName; } }
    for (const pp of ctx.players) { const c = cartOf(pp); c.v = 0; c.hist = []; c.lastGround = null; c.crashCd = 0; c.holdT = MC.hold; c.bounce = 0; c.foot = !!footAt(pp.x); c.prevX = pp.x; }   /* (the cart waits a beat at the start and at a station) */
  };
  const layPoints = p => { const t = ctx.T; for (const [x, y] of p.tiles) ctx.cellSet(x, y, p.state === 'set' ? t.RAIL : t.AIR); };
  const relay = b => { for (let x = b.x0; x <= b.x1; x++) ctx.cellSet(x, b.row, ctx.T.RAIL); b.started = false; b.front = 0; b.broken = new Set(); b.debris = []; };

  /* ---------- THE CART ---------- */
  const solidAt = (px, py) => { const t = ctx.cellGet(Math.floor(px / TS()), Math.floor(py / TS())); return t === ctx.T.SOLID || t === ctx.T.PORT || t === ctx.T.PALISADE || t === ctx.T.CRATE; };
  H.treadmill = pp => (ctx.drillTread ? ctx.drillTread(pp) : null);
  H.drive = (P, dt, keys) => {
    if (!H.riding(P)) return false;
    const c = cartOf(P), tm = H.treadmill(P);
    c.crashCd = Math.max(0, c.crashCd - dt); c.crashT = Math.max(0, c.crashT - dt);
    const stunned = (P.hurt > 0 && c.crashT > 0), grounded = P.ground || P.coyote > 0;
    const pump = !!keys.right && !keys.left && !stunned, brake = !!keys.left && !keys.right;
    if (tm) { const want = brake ? tm.cruise - MC.treadBack : pump ? MC.boost : tm.cruise; c.v += Math.max(-MC.treadAcc * dt, Math.min(MC.treadAcc * dt, want - c.v)); }   /* THE TUNNEL: the world runs past at cruise - brake lets you drift back, pump pulls you ahead, let go and you hold */
    else if (grounded && c.holdT > 0 && !keys.right) { c.holdT -= dt; c.v = 0; }   /* WAITING at the start / a station: it rolls off on its own after MC.hold (RIGHT goes at once) */
    else if (grounded) { c.holdT = 0; c.v = cartSpeed(c.v, { boost: pump, brake }, dt); }
    else if (pump) c.v = Math.min(MC.boost, c.v + MC.accUp * 0.5 * dt); else if (brake) c.v = Math.max(MC.crawl, c.v - MC.brake * 0.5 * dt);   /* in the air the cart keeps its pace: a held pump or brake moves it at half the rate */
    /* THE BRAKE BITES (deeprails2): sparks off the wheels and a screech while it slows */
    c.braking = !tm && grounded && brake && c.v > MC.crawl + 4;
    if (c.braking) { c.sparkT = (c.sparkT || 0) - dt; if (c.sparkT <= 0) { c.sparkT = 0.05; ctx.sparks(P.x - 6 * (P.face || 1), P.y - 1, 1, 2); } c.screechT = (c.screechT || 0) - dt; if (c.screechT <= 0) { c.screechT = 0.32; ctx.sfx.screech && ctx.sfx.screech(); } }
    let vx = c.v - (tm ? tm.cruise : 0);
    /* A BOUNCE: a ram or a bump throws the cart back a length (it eases off; then it rolls on) */
    if (c.bounce > 0) { vx = -c.bounce; c.bounce = Math.max(0, c.bounce - 700 * dt); }
    if (tm) { if (P.x > tm.x1 - 18 && vx > 0) { vx = 0; c.v = Math.min(c.v, tm.cruise); } if (P.x < tm.x0 + 10 && vx < 0) vx = 0; if (tm.limit !== undefined && P.x > tm.limit && vx > 0) { vx = 0; c.v = Math.min(c.v, tm.cruise); } }
    /* A WALL AHEAD (a fall-in, the rock at the end of a line, a shut gate) at the height of the tub: a CRASH */
    if (!tm && vx > 0 && grounded) { const ax = P.x + 5 + Math.max(vx, 30) * dt + 1; if (solidAt(ax, P.y - 4) && solidAt(ax, P.y - 10)) {
        if (c.crashCd <= 0) crash(P, c, ax, vx >= MC.softCrash); vx = Math.min(vx, 0); } }
    if (c.crashT > 0 && c.bounce <= 0) vx = Math.min(vx, 0);
    P.vx = vx;
    P.face = 1;   /* (always forward: the hero faces down the line; his blows go ahead) */
    return true;
  };
  function crash(P, c, ax, hard) {
    const Lv = M.L, ts = TS(); c.crashCd = MC.crashCd; c.crashT = 0.35; M.n.crashes++;
    if (hard) { ctx.hurtHero(ax, MC.wallDmg, { unblockable: true, name: 'THE FALL-IN', noKnock: true }); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.shake(5); }
    else { ctx.hurtHero(ax, MC.bumpDmg, { unblockable: true, name: 'A BUMP', noKnock: true }); ctx.sfx.thud && ctx.sfx.thud(); ctx.shake(2); }
    ctx.burst(ax, P.y - 8, 12, ['#5a6270', '#8a919c', '#8a5a32'], 90, 0.6);
    c.v = 0; P.vx = 0;
    const w = (Lv.mcWalls || []).find(q => Math.abs(q.x * ts - ax) < 40);
    if (w && w.retry && !ctx.chaseRunning() && !P.dead && P.hp > 0) { place(P, w.retry[0] * ts + 8, (w.retry[1] + 1) * ts); M.n.retries++; (sayOk('crashRetry', true) && ctx.number(P.x, P.y - 34, 'CRASHED: BACK BEFORE THE POINTS', '#ff9a5c')); }
    else if (!P.dead && P.hp > 0) { const back = c.hist.slice().reverse().find(h => h.x <= ax - 120) || c.hist[0]; if (back) place(P, back.x, back.y); (sayOk('crash', true) && ctx.number(P.x, P.y - 34, 'CRASH!', '#ff6b6b')); }   /* (always forward: no wall is a place to sit - the cart goes back a length and rolls on) */
  }
  const place = (P, x, y) => { P.x = x; P.y = y; P.vx = 0; P.vy = 0; P.ground = false; P.onMover = null; P.inv = Math.max(P.inv || 0, 0.8); const c = cartOf(P); c.v = 0; c.hist = []; c.lastGround = null; c.bounce = 0; c.prevX = x; };
  const sayOk = (key, again) => { if (!again && M.said[key]) return false; M.said[key] = 1; return true; };   /* a teaching line once (or every time: again) - the line itself stays a literal number() call (tools/hint-shown.mjs reads them) */
  const bounceBack = (c, px) => { c.bounce = Math.sqrt(2 * 700 * px); c.v = MC.crawl; };

  /* ---------- THE POINTS ---------- */
  const leverBox = p => { const ts = TS(), x = p.x * ts + 8; return p.hang ? { l: x - 10, r: x + 10, t: p.row * ts - 4, b: p.row * ts + 14 } : { l: x - 10, r: x + 10, t: p.row * ts - 28, b: p.row * ts }; };
  function throwLever(p, P, how) {
    if (p.flash > 0.25) return false;
    if (p.ore && ctx.questGot() < p.ore) { p.flash = 0.5; ctx.sfx.clank && ctx.sfx.clank(); ctx.number(p.x * TS() + 8, p.row * TS() - 34, 'LOCKED: THE SMELTER WANTS 8 ORE', '#9aa39a'); return true; }
    p.state = p.state === 'set' ? 'open' : 'set'; p.flash = 0.5; layPoints(p); M.n.throws++;
    ctx.sfx.clank && ctx.sfx.clank(); ctx.sfx.stone && ctx.sfx.stone(); ctx.sparks(p.x * TS() + 8, p.row * TS() - 16, 1, 5);
    ctx.number(p.x * TS() + 8, p.row * TS() - 38, p.state === 'set' ? 'POINTS SET: STAY HIGH' : 'POINTS OPEN: DOWN TO THE LOW LINE', p.state === 'set' ? '#ffd36b' : '#bce8fa');
    return true;
  }
  H.interact = P => { if (!M || !H.riding(P)) return false; const ts = TS();
    const p = M.points.find(q => Math.abs(q.x * ts + 8 - P.x) <= MC.leverReach && (q.hang ? P.y - q.row * ts < 90 && P.y > q.row * ts : Math.abs(P.y - q.row * ts) <= 24));
    return p ? throwLever(p, P, 'E') : false; };

  /* ---------- THE GOBLIN CARTS, THE THROWERS, THE FOREMAN ---------- */
  const surfaceY = (x, row) => { const tx = Math.floor(x / TS()); for (let y = row - 1; y <= row + 1; y++) { const t = ctx.cellGet(tx, y), above = ctx.cellGet(tx, y - 1);
      if ((t === ctx.T.SOLID || t === ctx.T.RAIL || t === ctx.T.ONEWAY) && above !== ctx.T.SOLID) return y * TS(); if (t >= 20 && t <= 25) return y * TS() + 8; } return null; };
  function spawnCart(e, P) {
    const ts = TS(), sp = e.mcRide, row = sp.row; let x;
    if (sp.at !== undefined) x = sp.at * ts + 8;
    else { x = P.x + (sp.off >= 0 ? Math.max(sp.off, 190) : Math.min(sp.off, -190)); if (surfaceY(x, row) === null) x = P.x + sp.off; }
    const y = sp.ledge ? row * ts : surfaceY(x, row); if (y === null) return;
    const cart = { e, row, x, y, v: sp.ledge || sp.foreman ? 0 : sp.slow || sp.pace || cartOf(P).v || MC.cruise, off: sp.off, slow: sp.slow || 0, pace: sp.pace || 0, hold: sp.at !== undefined, ledge: !!sp.ledge, foreman: !!sp.foreman,
      state: sp.ledge ? 'ledge' : 'roll', cd: 0.9 + Math.random() * 0.5, tell: 0, vy: 0, id: M.carts.length, rams: 0, stun: 0, maxX: sp.foreman && e.gate !== undefined ? e.gate * ts - 26 : 1e9 };
    M.carts.push(cart); e.mcCart = cart; e.mcWait = false; e.alive = true; e.x = x; e.y = y - (cart.ledge ? 0 : 6); e.vx = 0; e.vy = 0; e.face = Math.sign(P.x - x) || -1;
    if (!M.said['cart' + e.t + cart.ledge]) { M.said['cart' + e.t + cart.ledge] = 1; ctx.number(P.x, P.y - 40, cart.foreman ? 'THE FOREMAN: AN ARMOURED CART' : cart.ledge ? 'A GOBLIN THROWER ON A LEDGE' : e.t === 'gobmage' ? 'A GOBLIN CASTER ON A CART' : 'A GOBLIN ARCHER ON A CART', '#ffd36b'); }
    if (!cart.ledge) ctx.sfx.rattle && ctx.sfx.rattle(1);
  }
  /* a lob: a pick (or the foreman's bomb) at where the hero's cart WILL be when it lands - its mark drawn on the rail (runeAt with MC.throwT) */
  function lob(from, P, heroV, name, dmg) { const pc = cartOf(P), gy = pc.lastGround ? pc.lastGround.y : P.y, tx = runeAt(P.x, heroV, MC.throwT);
    M.lobs.push({ x0: from.x, y0: from.y - 14, x: from.x, y: from.y - 14, tx, ty: gy, t: MC.throwT, t0: MC.throwT, name, dmg, id: M.n.lobs++, bomb: name !== 'A THROWN PICK' }); ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); }
  function stepCart(cart, P, dt) {
    const e = cart.e, pc = cartOf(P), heroV = H.riding(P) ? P.vx : 0, ts = TS();
    if (cart.state === 'gone') return;
    if (cart.state === 'fall') { cart.vy += 900 * dt; cart.y += cart.vy * dt; cart.x += cart.v * dt; if (cart.y > ctx.LH() * ts) cart.state = 'gone'; if (e.alive && e.mcCart === cart) { e.x = cart.x; e.y = cart.y - 6; } return; }
    if (cart.state === 'ledge') { if (!e.alive || e.mcCart !== cart) { cart.state = 'gone'; return; } e.x = cart.x; e.y = cart.y; e.vx = 0; e.vy = 0; e.face = Math.sign(P.x - cart.x) || e.face; }
    else {
      if (cart.state === 'empty') { cart.v = Math.max(0, cart.v - 120 * dt); cart.emptyT = (cart.emptyT || 0) + dt; if (cart.emptyT > 2.5) { cart.state = 'gone'; ctx.burst(cart.x, cart.y - 4, 6, ['#5a6270', '#8a919c'], 40, 0.4); return; } }
      else if (cart.foreman) { cart.stun = Math.max(0, cart.stun - dt);   /* THE FOREMAN: he holds until you come, then rolls on at his pace - and stops at his gate */
        if (cart.stun > 0 || P.x < cart.x - 300) cart.v = 0; else cart.v = MC.foremanPace; if (cart.x >= cart.maxX) { cart.v = 0; cart.x = cart.maxX; } }
      else if (cart.hold && P.x + cart.off < cart.x - 4) cart.v = 0;
      else if (cart.slow) cart.v = cart.slow;
      else if (cart.pace) { cart.hold = false; cart.v = cart.pace; if (P.x - cart.x > 320) { cart.state = 'gone'; return; } }   /* A RIDER AT HIS OWN PACE: pump to catch him (behind you and out of sight, he pulls off) */
      else { cart.hold = false; const target = P.x + cart.off; cart.v = Math.max(30, Math.min(270, heroV + (target - cart.x) * 1.6)); }
      cart.x += cart.v * dt;
      const y = surfaceY(cart.x, cart.row);
      if (y === null) { cart.state = 'fall'; cart.vy = 0; if (e.alive && e.mcCart === cart) { ctx.killFoe(e); M.n.knocked++; } ctx.sfx.heavy && ctx.sfx.heavy(); return; }
      cart.y = y;
      if (cart.state === 'empty' || !e.alive || e.mcCart !== cart) return;
      e.x = cart.x; e.y = cart.y - 6; e.vx = 0; e.vy = 0; e.face = Math.sign(P.x - cart.x) || e.face;
    }
    /* ITS SHOT: told ('!' and the draw), then loosed */
    const dx = P.x - cart.x, inRange = Math.abs(dx) < (cart.ledge ? 230 : 250) && !P.dead && !(cart.ledge && dx > 20);
    const tellT = cart.ledge || cart.foreman ? MC.throwTell : e.t === 'gobmage' ? MC.casterTell : MC.archerTell, cdT = cart.ledge || cart.foreman ? MC.throwCd : e.t === 'gobmage' ? MC.casterCd : MC.archerCd;
    if (cart.stun > 0) { cart.tell = 0; e.mcTelling = false; return; }
    if (cart.tell > 0) { cart.tell -= dt; e.mcTelling = true;
      if (cart.tell <= 0) { e.mcTelling = false; cart.cd = cdT;
        if (cart.ledge) lob(cart, P, heroV, 'A THROWN PICK', MC.throwDmg);
        else if (cart.foreman) lob(cart, P, heroV, "THE FOREMAN'S BOMB", MC.throwDmg + 4);
        else if (e.t === 'gobmage') { const pc0 = cartOf(P), gy = pc0.lastGround ? pc0.lastGround.y : P.y; const rx = runeAt(P.x, heroV);
          M.runes.push({ x: rx, y: gy, t: MC.runeT, t0: MC.runeT, id: M.n.runes++ }); ctx.sfx.charge && ctx.sfx.charge(); }
        else { const fy = e.y - 7, ty = P.y - 8, lead = 0.45, tx = P.x + heroV * lead; const vx = (tx - cart.x) / lead, vy = (ty - fy) / lead - 0.5 * 300 * lead;
          M.shots.push({ x: cart.x, y: fy, vx, vy, g: 300, life: 2, dmg: MC.arrowDmg, name: 'A CART ARCHER', id: M.n.arrows++ }); ctx.sfx.bowShot ? ctx.sfx.bowShot() : ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); } } }
    else { cart.cd -= dt; if (cart.cd <= 0 && inRange && (!cart.foreman || dx < -30)) { cart.tell = tellT; ctx.sfx.tell && ctx.sfx.tell(false); } }
  }
  /* YOU AND A GOBLIN CART on the same line: landing in it TAKES it (the rider is thrown out); rolling into it at FULL PUMP RAMS it (deeprails2) - slower, a crash.
     THE FOREMAN's cart: a ram takes a third of him and throws you back a length to pump again; a bump hurts you */
  function meetCarts(P, dt) {
    const pc = cartOf(P);
    for (const cart of M.carts) { if (cart.state !== 'roll' && cart.state !== 'empty') continue;
      if (Math.abs(P.x - cart.x) > (cart.foreman ? 18 : 13) || Math.abs(P.y - cart.y) > 10) continue;
      const landed = P.ground && !pc.wasGround, falling = !P.ground && P.vy > 30;
      if (cart.foreman && cart.state === 'roll') { if (P.x >= cart.x || pc.crashCd > 0 || pc.bounce > 0) continue; ramForeman(P, pc, cart); continue; }
      if ((landed || falling) && !cart.foreman) { cart.state = 'gone'; M.n.taken++; const e = cart.e;
        if (e.alive && e.mcCart === cart) { ctx.killFoe(e); ctx.number(cart.x, cart.y - 30, 'THROWN OUT: THE CART IS YOURS', '#8fd160'); } else ctx.number(cart.x, cart.y - 30, 'INTO THE CART', '#8fd160');
        pc.v = Math.max(pc.v, cart.v, MC.cruise); ctx.sfx.clank && ctx.sfx.clank(); ctx.dust(P.x, P.y, 5); continue; }
      if (P.ground && pc.crashCd <= 0 && (P.x < cart.x) && pc.v > cart.v + 10) {
        if (pc.v >= MC.ramV && cart.state === 'roll') { pc.crashCd = 0.3; M.n.rams++; cart.state = 'fall'; cart.vy = -180; cart.v = pc.v + 60; const e = cart.e; if (e.alive && e.mcCart === cart) ctx.killFoe(e);   /* RAMMED: off the line it goes */
          ctx.shake(4); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.burst(cart.x, cart.y - 8, 14, ['#5a6270', '#d89a5a', '#ffd36b'], 110, 0.5); pc.v = Math.max(MC.cruise, pc.v - 40); (sayOk('ramCart', true) && ctx.number(cart.x, cart.y - 30, 'RAMMED!', '#ffd36b')); continue; }
        pc.crashCd = MC.crashCd; M.n.crashes++; ctx.hurtHero(cart.x, MC.crashDmg, { unblockable: true, name: 'A GOBLIN CART', noKnock: true }); ctx.shake(3); ctx.sfx.heavy && ctx.sfx.heavy(); bounceBack(pc, MC.bumpBack);
        (sayOk('cartCrash', true) && ctx.number(P.x, P.y - 34, 'CRASH: PUMP TO RAM IT, OR JUMP IN', '#ff9a5c')); }
    }
  }
  function ramForeman(P, pc, cart) { const e = cart.e;
    if (pc.v >= MC.ramV) { M.n.rams++; M.n.foremanRams++; cart.rams++; cart.stun = 0.8; pc.crashCd = 0.4;
      const d = Math.ceil(e.maxHp / MC.foremanRams) + 1; M.ramming = true; try { ctx.hitFoe(e, d); } finally { M.ramming = false; }
      ctx.shake(6); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(cart.x - 10, cart.y - 10, 16, ['#5a6270', '#d89a5a', '#ffd36b', '#ffffff'], 120, 0.5);
      ctx.number(cart.x, cart.y - 34, e.alive ? 'RAMMED! ' + (MC.foremanRams - cart.rams > 0 ? (MC.foremanRams - cart.rams) + ' MORE' : '') : 'HIS CART IS WRECKED', '#ffd36b');
      bounceBack(pc, 70); if (!e.alive) { cart.state = 'fall'; cart.vy = -200; cart.v = 120; } }
    else { M.n.bumps++; pc.crashCd = MC.crashCd; ctx.hurtHero(cart.x, MC.bumpDmg, { unblockable: true, name: "THE FOREMAN'S CART", noKnock: true }); ctx.sfx.clank && ctx.sfx.clank(); ctx.shake(2); bounceBack(pc, 56);
      (sayOk('foremanBump', true) && ctx.number(P.x, P.y - 34, 'TOO SLOW: PUMP, THEN RAM HIM', '#ff9a5c')); } }

  /* ---------- ONE FRAME ---------- */
  H.update = dt => {
    if (!M || !H.on()) return; M.clock += dt; const ts = TS(), now = ctx.time();
    for (const p of M.points) p.flash = Math.max(0, p.flash - dt);
    const P0 = ctx.players[0];
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); footStep(P); if (!H.riding(P)) { cartOf(P).prevX = P.x; return; } stepHero(P, dt, now); });
    /* the goblin carts: triggered by the lead hero */
    if (P0 && !P0.dead) for (const e of ctx.enemies()) if (e.mcWait && e.mcRide && P0.x >= e.mcRide.trig * ts) { if (P0.x > (e.mcRide.trig + 30) * ts && e.mcRide.at === undefined) e.mcWait = false; else spawnCart(e, P0); }
    for (const cart of M.carts) stepCart(cart, P0, dt);
    M.carts = M.carts.filter(c => c.state !== 'gone');
    /* arrows, runes, lobs */
    for (const s of M.shots) { s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (ctx.cellGet(Math.floor(s.x / ts), Math.floor(s.y / ts)) === ctx.T.SOLID) s.life = 0;
      for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (s.life <= 0 || P.dead || !(P.inv <= 0)) return; const b = ctx.duckBox(P);
        if (s.x > b.l - 2 && s.x < b.r + 2 && s.y > b.t - 2 && s.y < b.b) { s.life = 0; ctx.hurtHero(s.x, s.dmg, { name: s.name }); } }); }
    M.shots = M.shots.filter(s => s.life > 0);
    for (const r of M.runes) { r.t -= dt; if (r.t <= 0 && !r.done) { r.done = true; ctx.burst(r.x, r.y - 6, 12, ['#b48aff', '#ffd36b', '#ffffff'], 70, 0.5); ctx.sfx.zap ? ctx.sfx.zap() : ctx.sfx.puff && ctx.sfx.puff();
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; if (Math.abs(P.x - r.x) < MC.runeR + 4 && P.y > r.y - 26 && P.y <= r.y + 4) ctx.hurtHero(r.x, MC.runeDmg, { unblockable: true, name: 'A GOBLIN RUNE' }); }); } }
    M.runes = M.runes.filter(r => r.t > -0.3);
    for (const o of M.lobs) { o.t -= dt; const k = 1 - Math.max(0, o.t) / o.t0; o.x = o.x0 + (o.tx - o.x0) * k; o.y = o.y0 + (o.ty - o.y0) * k - Math.sin(k * Math.PI) * 60;
      if (o.t <= 0 && !o.done) { o.done = true; ctx.burst(o.tx, o.ty - 6, o.bomb ? 16 : 8, o.bomb ? ['#ff9a3c', '#ffd36b', '#5a5a5a'] : ['#8a919c', '#cfc3a4'], 90, 0.5); o.bomb ? (ctx.sfx.boom ? ctx.sfx.boom() : ctx.sfx.heavy && ctx.sfx.heavy()) : ctx.sfx.clank && ctx.sfx.clank();
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; if (Math.abs(P.x - o.tx) < MC.throwR + 4 && P.y > o.ty - 26 && P.y <= o.ty + 4) { M.n.lobHits++; ctx.hurtHero(o.tx, o.dmg, { unblockable: true, name: o.name }); } }); } }
    M.lobs = M.lobs.filter(o => o.t > -0.3);
    /* THE RAILS THAT BREAK: armed by the lead hero rolling onto them; the break runs up the line at MC.breakV */
    if (P0) for (const b of M.breaks) { if (!b.started) { if (H.riding(P0) && P0.x >= b.x0 * ts && P0.x < (b.x0 + 3) * ts && Math.abs(P0.y - b.row * ts) < 6) { b.started = true; b.front = P0.x - MC.breakLead; M.n.breaks++; ctx.sfx.crack && ctx.sfx.crack(); ctx.shake(2); } continue; }
      if (b.front > (b.x1 + 1) * ts) continue; b.front += MC.breakV * dt;
      for (let x = b.x0; x <= b.x1; x++) if (!b.broken.has(x) && (x + 1) * ts <= b.front) { b.broken.add(x); ctx.cellSet(x, b.row, ctx.T.AIR); b.debris.push({ x: x * ts + 8, y: b.row * ts, vy: 0, t: 0 }); if (b.broken.size % 3 === 0) ctx.sfx.rubble ? ctx.sfx.rubble() : ctx.sfx.thud && ctx.sfx.thud(); } }
    for (const b of M.breaks) { for (const d of b.debris) { d.vy += 700 * dt; d.y += d.vy * dt; d.t += dt; } b.debris = b.debris.filter(d => d.t < 1.2); }
    for (const w of M.wrecks) { w.vy += 800 * dt; w.x += w.vx * dt; w.y += w.vy * dt; w.a += w.va * dt; w.t += dt; if (w.y > w.floor) { w.y = w.floor; w.vy *= -0.3; w.vx *= 0.5; w.va *= 0.5; } }
    if (P0) { stall(P0, dt); tells(P0); approach(P0, dt); }
    if (P0 && !M.said.ore8) { const sm = M.points.find(p => p.ore); if (sm && ctx.questGot() >= sm.ore) { M.said.ore8 = 1; ctx.number(P0.x, P0.y - 40, "EIGHT ORE: THE SMELTER'S POINTS WILL OPEN", '#ffd36b'); } }
  };
  /* THE ON-FOOT STRETCHES: crossing a stretch's x0 in the cart derails it (or you step out at a line's end); crossing its board column you are in the waiting cart */
  function footStep(P) { const c = cartOf(P), f = footAt(P.x), was = !!c.foot; c.foot = !!f; if (P.dead) return;
    if (f && !was) { const ts = TS(); M.n.derails++;
      if (f.derail) { P.vy = Math.min(P.vy, -250); P.ground = false; ctx.shake(6); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(P.x + 6, P.y - 6, 18, ['#5a6270', '#8a919c', '#8a5a32', '#ffd36b'], 120, 0.6);
        M.wrecks.push({ x: P.x + 4, y: P.y - 6, vx: 60, vy: -160, a: 0, va: 7, t: 0, floor: P.y - 6 }); ctx.number(P.x, P.y - 40, 'DERAILED! ON FOOT: A CART WAITS AHEAD', '#ffd36b'); }
      else { ctx.sfx.clank && ctx.sfx.clank(); M.wrecks.push({ x: P.x, y: P.y - 6, vx: 0, vy: 0, a: 0, va: 0, t: 0, floor: P.y - 6, parked: true }); ctx.number(P.x, P.y - 40, 'THE LINE ENDS: OUT, AND UP THE LIFT', '#ffd36b'); } }
    else if (!f && was && P.x >= ((L().mcFoot || []).find(q => Math.abs(q.board * TS() - P.x) < 40) || { board: -1 }).board * TS()) { M.n.boards++; c.v = 0; c.holdT = 0.5; c.hist = []; ctx.sfx.clank && ctx.sfx.clank(); ctx.dust(P.x, P.y, 6); ctx.number(P.x, P.y - 40, 'INTO THE CART: ROLL ON', '#8fd160'); } }
  /* THE TELLS (review MF1): crossing a tell's column (and short of the place it can hurt) puts its line in the hint box - once a life, never over another */
  function tells(P) { if (P.dead) return; const col = P.x / TS();
    for (const t of M.L.mcTells || []) { if (M.told[t.id]) continue; if (col >= t.at) { M.told[t.id] = 1; continue; } if (col < t.x) break;
      if (M.clock - M.tellT < MC.tellGap) break; M.told[t.id] = 1; M.tellT = M.clock; M.n.tells = (M.n.tells || 0) + 1; ctx.number(P.x, P.y - 40, t.text, '#ffe9a0'); break; } }
  /* THE DRILL COMES (B8): from the rumble's column the roof shakes and dusts on a beat that quickens as you near the bore, a rumble under it */
  function approach(P, dt) { const r = (M.L.decor || []).find(d => d.kind === 'rumble'); if (!r || P.dead) return; const col = P.x / TS(); if (col < r.x0 || col > r.x1) return;
    const k = (col - r.x0) / (r.x1 - r.x0); M.rumbleT -= dt; if (M.rumbleT > 0) return; M.rumbleT = 1.8 - 1.2 * k;
    ctx.shake(1 + Math.round(2 * k)); ctx.sfx.rumble ? ctx.sfx.rumble() : ctx.sfx.thud && ctx.sfx.thud(); const ts = TS();
    for (let i = 0; i < 2 + Math.round(3 * k); i++) ctx.burst(P.x + 40 + Math.random() * 200, (r.row - 9) * ts, 3, ['#6b5a48', '#8a7660'], 30, 0.7); }
  function stepHero(P, dt, now) {
    const c = cartOf(P), ts = TS(), Lv = M.L;
    /* THE LEVERS: a blow that lands on one throws it */
    const hb = ctx.attackBox();
    if (hb) for (const p of M.points) if (!P.hitSet.has(p) && ctx.overlap(hb, leverBox(p))) { P.hitSet.add(p); throwLever(p, P, 'blow'); }
    /* where the cart last stood, for a fall (and the take-off lip) */
    if (P.ground && !P.dead) { c.lastGround = { x: P.x, y: P.y }; c.histT = (c.histT || 0) - dt; if (c.histT <= 0) { c.histT = 0.1; c.hist.push({ x: P.x, y: P.y }); if (c.hist.length > 60) c.hist.shift(); } }
    /* A LAUNCH RAMP (deeprails2): crossing its lip on the line throws the cart up - its pace is its distance */
    const prevX = c.prevX === undefined ? P.x : c.prevX; c.prevX = P.x;
    for (const r of M.ramps) { const lip = (r.x + 1) * ts; if (prevX < lip && P.x >= lip && Math.abs(P.y - r.row * ts) < 8 && P.vy > -60) { const vy = MC.rampV0 + MC.rampK * Math.max(c.v, 0); P.vy = -vy; P.ground = false; P.coyote = 0; M.n.launches++;
        ctx.sfx.heavy && ctx.sfx.heavy(); ctx.shake(3); ctx.burst(lip, r.row * ts - 2, 10, ['#ffd36b', '#ff9a3c', '#8a919c'], 90, 0.4); (sayOk('ramp') && ctx.number(P.x, P.y - 40, c.v >= MC.boost - 20 ? 'FLY!' : 'NOT ENOUGH PUMP!', c.v >= MC.boost - 20 ? '#ffd36b' : '#ff9a5c')); } }
    /* A FALL: in an EXAM it is the end (the game's own fall); elsewhere a share of health and back on the rail, MC.retryBack behind the lip (or, off a rail that
       broke, back before the break with the rail relaid) */
    if (!P.dead && P.y > ((Lv.mcFall || [])[Math.max(0, Math.min(Lv.W - 1, Math.floor(P.x / ts)))] || 36) * ts && P.vy > 0) { const col = P.x / ts, exam = (Lv.mcExam || []).some(([a, b]) => col >= a && col <= b + 1) || ctx.chaseRunning();
      if (!exam && c.lastGround) { const lip = c.lastGround.x, br = M.breaks.find(b => b.started && col >= b.x0 - 1 && col <= b.x1 + 2);
        let back = c.hist.slice().reverse().find(h => h.x <= lip - MC.retryBack) || c.hist[0] || c.lastGround;
        if (br) { relay(br); back = { x: (br.x0 - 5) * ts + 8, y: br.row * ts }; }
        M.n.falls++; ctx.hurtHero(P.x, Math.round(P.maxHp * MC.fallCost), { unblockable: true, name: 'THE DROP', noKnock: true });
        if (!P.dead && P.hp > 0) { place(P, back.x, back.y); (sayOk('fall') && ctx.number(P.x, P.y - 34, 'A FALL COSTS YOU: PUMP BEFORE A LONG GAP', '#ff9a5c')); } } }
    /* THE CRUSHERS */
    for (const k of M.crushers) { const ph = crushPhase(k, now); if (ph.state !== 'down') continue; const x0 = k.x * ts, x1 = (k.x + k.w) * ts, y1 = k.row * ts;
      if (P.x + 4 > x0 && P.x - 4 < x1 && P.y > y1 - 40 && P.y <= y1 + 2 && !(P.inv > 0)) { M.n.crushed++; ctx.hurtHero(P.x, MC.crushDmg, { unblockable: true, name: 'A CRUSHER', noKnock: true });
        if (!P.dead && P.hp > 0) { place(P, x0 - 14, y1); (sayOk('crushed', true) && ctx.number(P.x, P.y - 34, 'CRUSHED: BRAKE, AND GO WHEN IT LIFTS', '#ff9a5c')); } } }
    /* THE GATES */
    for (const gt of M.gates) { if (gateOpen(gt, now)) continue; const gx = gt.x * ts + 6, y1 = gt.row * ts;
      if (P.x + 5 > gx && P.x - 5 < gx + 6 && P.y > y1 - 46 && P.y <= y1 + 2) { M.n.gates++; P.x = gx - 7; P.vx = Math.min(P.vx, 0);
        if (c.crashCd <= 0) { c.crashCd = MC.crashCd; ctx.hurtHero(gx, MC.gateDmg, { unblockable: true, name: 'A SHUT GATE', noKnock: true }); ctx.sfx.clank && ctx.sfx.clank(); ctx.shake(3); bounceBack(c, 48); (sayOk('gate') && ctx.number(P.x, P.y - 34, 'THE GATE IS SHUT: WATCH ITS GAUGE', '#ff9a5c')); } } }
    /* THE ROCKFALLS: armed as you pass the trigger; dust and a shadow, then the rock */
    for (const r of M.rocks) { if (r.armed && P.x >= r.trig * ts) { r.armed = false; r.fallT = r.delay; ctx.sfx.rubble ? ctx.sfx.rubble() : ctx.sfx.thud && ctx.sfx.thud(); }
      if (r.fallT > 0) { r.fallT -= dt; if (r.fallT <= 0 && !r.done) { r.done = true; const x0 = r.x * ts - 4, x1 = (r.x + r.w) * ts + 4, y1 = r.row * ts; ctx.shake(3); ctx.burst((x0 + x1) / 2, y1 - 6, 12, ['#6b5a48', '#8a7660', '#2a2119'], 80, 0.5);
        if (P.x + 4 > x0 && P.x - 4 < x1 && P.y > y1 - 20 && P.y <= y1 + 2 && !(P.inv > 0)) { M.n.rocks++; ctx.hurtHero(P.x, MC.rockDmg, { unblockable: true, name: 'A FALLING ROCK' }); } } } }
    /* THE BEAMS: duck (src/duck.js duckClears), never the down key */
    for (const b of M.beams) { b.cd = Math.max(0, b.cd - dt); const y = b.row * ts - 10; if (b.cd > 0) continue; const box = ctx.duckBox(P);
      if (box.r > b.x0 * ts && box.l < (b.x1 + 1) * ts && box.t < y && box.b > y - 6 && !ctx.duckClears(P, y)) { b.cd = 1; M.n.beams++; ctx.hurtHero(P.x + 8, MC.beamDmg, { unblockable: true, name: 'A LOW BEAM', noKnock: true }); c.v *= 0.5; ctx.sfx.thud && ctx.sfx.thud(); } }
    /* A FOE STANDING ON THE LINE (deeprails2): at FULL PUMP the cart RAMS him (MC.ramDmg, and he is thrown); slower, it is a BUMP - it hurts you and throws you back a length */
    if (P.ground && c.crashCd <= 0) for (const e of ctx.enemies()) { if (!e.alive || e.mcCart || e.boss || e.maxHp && e.boss || e.t === 'bat' || e.t === 'crow' || e.t === 'tippler' || e.noGrav) continue;
      if (Math.abs(e.y - P.y) < 6 && Math.abs(e.x - P.x) < (e.w || 10) / 2 + 5 && e.x > P.x - 2) {
        if (c.v >= MC.ramV) { c.crashCd = 0.3; M.n.rams++; ctx.hitFoe(e, MC.ramDmg); if (e.alive) { e.x += 26; e.vx = 160; e.vy = -160; } ctx.shake(4); ctx.sfx.heavy && ctx.sfx.heavy(); ctx.burst(e.x, e.y - 8, 10, ['#ffd36b', '#ffffff', '#8a5a32'], 100, 0.4); c.v = Math.max(MC.cruise, c.v - 30);
          (sayOk('ram') && ctx.number(e.x, e.y - 30, 'RAMMED!', '#ffd36b')); break; }
        c.crashCd = MC.crashCd; M.n.bumps++; ctx.hurtHero(e.x, MC.bumpDmg, { unblockable: true, name: 'A BUMP', noKnock: true }); bounceBack(c, MC.bumpBack); ctx.shake(2); ctx.sfx.thud && ctx.sfx.thud(); if (e.alive) e.x += 8;
        (sayOk('foeBump') && ctx.number(P.x, P.y - 34, 'A BUMP: PUMP TO RAM, OR STRIKE OR JUMP', '#ff9a5c')); break; } }
    meetCarts(P, dt);
    c.wasGround = !!P.ground;
  }
  const crushPhase = (k, now) => { const t = ((now + k.phase) % k.period + k.period) % k.period, up = k.period - k.down; return t < up - 0.45 ? { state: 'up', k: t / up } : t < up ? { state: 'warn', k: (t - (up - 0.45)) / 0.45 } : { state: 'down', k: (t - up) / k.down }; };
  const gateOpen = (gt, now) => (((now + gt.phase) % gt.period) + gt.period) % gt.period < gt.open;
  H.crushPhase = crushPhase; H.gateOpen = gateOpen;
  /* A RIDER'S MACHINE is this file's while he rides (or stands on his ledge) */
  H.rider = (e, dt) => !!(M && e.mcCart && e.mcCart.state !== 'gone' && e.mcCart.state !== 'fall');
  H.waiting = e => !!e.mcWait;
  /* A BLOW ON A RIDER: off his cart he goes (all of him). THE FOREMAN's armoured cart turns a blade to x0.35 (B10: a clank and the word); only the ram is whole */
  H.knock = (e, dmg) => { if (!M || !e.mcCart || e.mcCart.state === 'empty' || e.mcCart.state === 'gone') return dmg; const cart = e.mcCart;
    if (cart.foreman) { if (M.ramming) return dmg; e.guardFx = 0.4; ctx.sfx.clank && ctx.sfx.clank(); ctx.sparks(e.x - 8, e.y - 14, 1, 4); (sayOk('foremanArmour', true) && ctx.number(e.x, e.y - 30, 'ARMOURED: RAM HIM', '#c8d8e8')); return Math.max(1, Math.round(dmg * MC.foremanArmour)); }
    if (cart.ledge) return dmg;   /* (a thrower on his ledge is a goblin like any other) */
    cart.state = 'empty'; M.n.knocked++; e.mcTelling = false; ctx.number(e.x, e.y - 22, 'KNOCKED OFF', '#8fd160'); M.n.caught += cart.pace ? 1 : 0; return Math.max(dmg, e.hp + 1); };

  /* ---------- THE DARK (deeprails2): the headlamp's cone ahead of the cart, and every goblin's lamp ---------- */
  H.holes = (hole, cx, cy, dg) => { if (!M || !H.on()) return; const ts = TS();
    for (const pp of ctx.players) { if (pp.dead) continue; const riding = H.riding(pp), lx = pp.x + 12 - cx, ly = pp.y - 12 - cy;
      if (riding && dg) { const len = 170, a = 0.36; dg.save(); dg.beginPath(); dg.moveTo(lx, ly); dg.lineTo(lx + Math.cos(-a) * len, ly + Math.sin(-a) * len); dg.lineTo(lx + Math.cos(a) * len, ly + Math.sin(a) * len); dg.closePath(); dg.clip();
        const gr = dg.createRadialGradient(lx, ly, 6, lx, ly, len); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); dg.fillStyle = gr; dg.fillRect(lx, ly - len, len, len * 2); dg.restore(); }
      hole(pp.x - cx, pp.y - 10 - cy, riding ? 34 : 46); }
    for (const c of M.carts) if (c.state !== 'gone') hole(c.x - cx, c.y - 14 - cy, c.ledge ? 40 : 46);   /* a goblin's lantern on every cart, a torch on every ledge */
    for (const o of M.lobs) if (o.t > 0) hole(o.tx - cx, o.ty - 4 - cy, 22);   /* the mark burns where it will land */
    for (const r of M.runes) if (r.t > 0) hole(r.x - cx, r.y - 4 - cy, 26);
    for (const k of M.crushers) hole((k.x + k.w / 2) * ts - cx, (k.row - 6) * ts - cy, 30);   /* (every crusher's beacon) */
    for (const g of M.gates) hole(g.x * ts + 8 - cx, (g.row - 5) * ts - cy, 26);
    for (const p of M.points) hole(p.x * ts + 8 - cx, p.row * ts - 20 - cy, 26);   /* (and every lever's lamp: you can find the points in the dark) */
    for (const b of M.beams) hole(b.x0 * ts + 8 - cx, b.row * ts - 12 - cy, 22); };
  const inDark = x => (M.L.darkZones || []).some(z => x > z.x0 && x < z.x1);

  /* ---------- THE GLINT AND THE NUDGE (src/stuck-spots.js STUCK_HANDS.minecart: points.<id> open / set) ---------- */
  const handsState = name => { const [kind, id] = name.split('.'); if (kind === 'points') { const p = M.points.find(q => q.id === id); return p ? p.state : ''; } return ''; };
  H.handsState = n => (M ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('minecart', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: [], hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { M.glint = null; M.stallKey = null; return; } const t = r.targets[0]; M.glint = { key: r.key, x: t.x, y: t.y };
    const C = M.stalls[r.key] = M.stalls[r.key] || newStall(); if (r.key !== M.stallKey) { M.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, M.clock, false)) { M.n.nudges = (M.n.nudges || 0) + 1; M.lastNudge = r.line; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING ---------- */
  H.drawWorld = (g, cx, cy, time) => { if (!M || !H.on()) return; const ts = TS(), vw = ctx.VW(), vh = ctx.VH(), now = ctx.time(), x0c = Math.floor(cx / ts) - 1, x1c = Math.ceil((cx + vw) / ts) + 1;
    /* THE FLOOD and THE LAVA under everything else on the line (deeprails2): black water under the trestles, the glow in the cavern's pit */
    for (const d of M.L.decor) { if (d.kind === 'flood' && d.x1 >= x0c && d.x0 <= x1c) MCA.flood(g, R(d.x0 * ts - cx), R((d.x1 + 1) * ts - cx), R(d.row * ts - cy), vh, time);
      else if (d.kind === 'lava' && d.x1 >= x0c && d.x0 <= x1c) MCA.lava(g, R(d.x0 * ts - cx), R((d.x1 + 1) * ts - cx), R(d.row * ts - cy), vh, time); }
    /* trestle bents under the elevated lines */
    for (const [a, b, row] of M.L.mcTrestles) for (let x = Math.max(a, x0c); x <= Math.min(b, x1c); x += 3) { if (ctx.cellGet(x, row) !== ctx.T.RAIL) continue; let yb = row + 1; while (yb < row + 40 && ctx.cellGet(x, yb) === ctx.T.AIR) yb++;
      if (yb > row + 1) MCA.bent(g, R(x * ts + 6 - cx), R((row + 1) * ts - cy), R(yb * ts - cy), x + 3 <= b && ctx.cellGet(x + 3, row) === ctx.T.RAIL, x); }
    /* the rail along every line, on whatever stands there (sleepers and iron; laid up the ramps too) - a rail that breaks shows its cracks ahead of the break */
    for (const [a, b, row] of M.L.mcTrack) for (let x = Math.max(a, x0c); x <= Math.min(b, x1c); x++) { const t = ctx.cellGet(x, row); if (!(t === ctx.T.SOLID || t === ctx.T.RAIL || t === ctx.T.ONEWAY || (t >= 20 && t <= 25))) continue;
      const sx = R(x * ts - cx), sy = R(row * ts - cy); if (t >= 20 && t <= 25) { MCA.slopeRail(g, sx, sy, t, heightAt); continue; } MCA.rail(g, sx, sy, x); }
    for (const b of M.breaks) { if (b.x1 < x0c || b.x0 > x1c) continue; const fr = b.started ? b.front : -1e9;
      for (let x = Math.max(b.x0, x0c); x <= Math.min(b.x1, x1c); x++) if (!b.broken.has(x)) MCA.rottenRail(g, R(x * ts - cx), R(b.row * ts - cy), x, b.started && (x * ts - fr) < 48);
      for (const d of b.debris) MCA.railDebris(g, R(d.x - cx), R(d.y - cy), d.t, d.x);
      if (b.started && fr > b.x0 * ts && fr < (b.x1 + 1) * ts) MCA.breakFront(g, R(fr - cx), R(b.row * ts - cy), time); }
    /* THE LANTERN STRINGS: a lamp post every sixth tile along the lines (none in the dark drift: its lamps are long out) */
    for (const [x, row, nx] of MCA.lampPlan(M.L, ctx.cellGet, ctx.T, x0c, x1c)) { if (inDark(x * ts)) continue; MCA.lampPost(g, R(x * ts + 7 - cx), R(row * ts - cy), time, x, nx); }
    /* the decor: fall-ins, the roof over the hidden lever, the bore, the smelter's glow, the ledges, the buffers, the lift's cage */
    for (const d of M.L.decor) { if (d.kind === 'fallin') { const x = R(d.x * ts - cx), y = R((d.row - 2) * ts - cy); MCA.fallin(g, x, y, time); if (x > -40 && x < vw + 40) txt('FALLEN IN', x + 16, y - 6, '#ff9a5c', 'center', 5); }
      else if (d.kind === 'bore') { MCA.boreArch(g, R(d.x0 * ts - cx), (d.x1 - d.x0 + 1) * ts, R(d.row * ts - cy)); }
      else if (d.kind === 'crumble') { const x0 = R(d.x0 * ts - cx), x1 = R((d.x1 + 1) * ts - cx), y = R(d.row * ts - cy); if (x1 < -20 || x0 > vw + 20) continue;
        MCA.crumble(g, x0, x1, y, time, d.x0); if (Math.floor(time * 3) % 2) txt('GOING', R((x0 + x1) / 2), y + 12, '#ff9a5c', 'center', 5); }
      else if (d.kind === 'scar') { const x = R(d.x * ts - cx), y = R(d.row * ts - cy); if (x < -60 || x > vw + 60) continue; MCA.scar(g, x, y, d.r, d.x); }
      else if (d.kind === 'spoil') { MCA.spoil(g, R(d.x0 * ts - cx), R(d.row * ts - cy), (d.x1 - d.x0) * ts); }
      else if (d.kind === 'headlight') { MCA.headlight(g, R(d.x * ts - cx), R(d.row * ts - cy), time); }
      else if (d.kind === 'ledge') { const x = R(d.x0 * ts - cx); if (x < -100 || x > vw + 40) continue; MCA.ledge(g, x, (d.x1 - d.x0 + 1) * ts, R(d.row * ts - cy), d.x0); }
      else if (d.kind === 'buffer') { const x = R(d.x * ts - cx); if (x < -40 || x > vw + 40) continue; MCA.buffer(g, x, R(d.row * ts - cy), !!d.soft, time); }
      else if (d.kind === 'lift') { const x = R(d.x0 * ts - cx); if (x < -60 || x > vw + 60) continue; const mv = ctx.movers ? ctx.movers().find(m => m.vert && Math.abs(m.x - d.x0 * ts) < 4) : null; MCA.liftShaft(g, x, (d.x1 - d.x0 + 1) * ts, R(d.y0 * ts - cy), R(d.y1 * ts - cy), mv ? R(mv.y - cy) : null, time); }
      else if (d.kind === 'smelter') { const x = R(d.x * ts - cx), y = R(d.row * ts - cy); MCA.smelterHouse(g, x, y, time); if (x > -60 && x < vw + 60) txt('THE SMELTER', x, y - 56, '#ffb050', 'center', 5); } }
    /* THE RAMPS: a kicker on the lip, chevrons and its word as you near */
    { const Ph = ctx.hero(); for (const r of M.ramps) { const lx = (r.x + 1) * ts; if (lx < cx - 60 || lx > cx + vw + 60) continue; const near = Ph && lx - Ph.x > -4 && lx - Ph.x < 260;
        MCA.kicker(g, R(lx - cx), R(r.row * ts - cy), near && Math.floor(time * 8) % 2, time); if (near) txt('PUMP!', R(lx - cx) - 10, R(r.row * ts - cy) - 34, '#ffd36b', 'center', 6); } }
    /* THE WAITING CARTS at the end of each on-foot stretch */
    for (const f of M.L.mcFoot || []) { const x = f.board * ts + 8; if (x < cx - 40 || x > cx + vw + 40) continue; const Ph = ctx.hero(); if (Ph && Ph.x >= f.board * ts && !footAt(Ph.x) && Ph.x - x < 200) continue;
      const row = (() => { for (let y = 0; y < ctx.LH(); y++) { const t = ctx.cellGet(f.board, y); if (t !== ctx.T.AIR) return y; } return 30; })();
      MCA.heroCart(g, R(x - cx), R(row * ts - cy), 1, 0, false, 0, time, 'whole'); if (Ph && footAt(Ph.x) && Math.floor(time * 4) % 2) txt('A CART', R(x - cx), R(row * ts - cy) - 26, '#8fd160', 'center', 5); }
    /* THE WRECKS (a derailed cart tumbling, a parked one at a line's end) */
    for (const w of M.wrecks) { const x = R(w.x - cx), y = R(w.y - cy); if (x < -40 || x > vw + 40) continue; g.save(); g.translate(x, y); g.rotate(w.parked ? 0 : w.a); MCA.heroCart(g, 0, 6, 1, 0, false, 0, time, 'empty'); g.restore(); }
    /* THE POINTS: the lever (its disc's arrow) and the fork itself (set = rail; open = a chute down) */
    for (const p of M.points) { const lx = p.x * ts + 8; if (lx < cx - 40 || lx > cx + vw + 40) continue; const x = R(lx - cx), y = R(p.row * ts - cy), set = p.state === 'set', locked = p.ore && ctx.questGot() < p.ore;
      const fl = p.flash > 0 && Math.floor(time * 20) % 2; const dy = MCA.lever(g, x, y, p.hang, set, locked, fl, time);
      if (locked) txt('ORE ' + ctx.questGot() + '/' + p.ore, x, dy - 12, '#9aa39a', 'center', 5);
      const Ph = ctx.hero(); if (p.req && !set && Ph && lx - Ph.x > -8 && lx - Ph.x < 300) { const k = 0.5 + 0.5 * Math.sin(time * 10); g.strokeStyle = 'rgba(255,211,107,' + (0.5 + 0.5 * k).toFixed(2) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(x, dy, 9 + 3 * k, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; }
      const fx0 = R(p.x0 * ts - cx), fw = (p.x1 - p.x0 + 1) * ts, fy = R(p.prow * ts - cy);
      if (!set) { g.fillStyle = 'rgba(127,196,224,0.35)'; for (let i = 0; i < fw; i += 8) g.fillRect(fx0 + i, fy - 1, 4, 2); g.fillStyle = '#7fc4e0'; g.fillRect(fx0, fy - 6, 2, 8); g.fillRect(fx0 + fw - 2, fy - 6, 2, 8); }
      else { g.fillStyle = '#ffd36b'; g.fillRect(fx0, fy - 4, fw, 1); } }
    /* THE PUMP GAPS' LIPS: a real lamp on each lip and chevrons on the last sleepers - amber, RED where a fall is a death (an exam, the chase) - lit as you near */
    { const Ph = ctx.hero(); for (const bg of M.L.mcBoost || []) { if (bg.ramp) continue; const lx = bg.x0 * ts; if (lx < cx - 40 || lx > cx + vw + 40) continue; const x = R(lx - cx), y = R(bg.row * ts - cy);
        const deadly = (M.L.mcExam || []).some(([a, b]) => bg.x0 >= a && bg.x1 <= b) || (M.L.chases || []).some(ch => lx >= ch.trigger && lx <= ch.end);
        const near = Ph && lx - Ph.x > -4 && lx - Ph.x < 260, on = !near || Math.floor(time * 8) % 2;
        for (const px of [x - 2, R((bg.x1 + 1) * ts - cx) + 1]) MCA.lipLamp(g, px, y, deadly, on, time);
        MCA.chevrons(g, x, y, on, deadly);
        if (near && deadly) txt('DEEP', x + R((bg.x1 - bg.x0 + 1) * ts / 2), y - 36, '#ff6b6b', 'center', 5); } }
    /* THE CRUSHERS */
    for (const k of M.crushers) { const x = R(k.x * ts - cx), w = k.w * ts; if (x < -40 || x > vw + 40) continue; const ph = crushPhase(k, now), yb = k.row * ts, top = yb - 6 * ts;
      const drop = ph.state === 'down' ? 1 : ph.state === 'warn' ? 0.05 : 0, bot = R(yb - (1 - drop) * 4.2 * ts - cy), shakeX = ph.state === 'warn' ? (Math.floor(time * 30) % 2 ? 1 : -1) : 0;
      MCA.crusher(g, x + shakeX, w, R(top - cy), bot, ph.state, time);
      if (ph.state === 'warn') txt('!', x + w / 2, bot - 26, '#ff6b6b', 'center', 7);
      const gk = ph.state === 'up' ? ph.k : 1; g.fillStyle = '#1b1626'; g.fillRect(x, R(yb - cy) + 3, w, 2); g.fillStyle = ph.state === 'up' ? '#8fd160' : '#ff6b6b'; g.fillRect(x, R(yb - cy) + 3, R(w * (ph.state === 'up' ? 1 - gk : 1)), 2); }
    /* THE GATES: a portcullis and its gauge */
    for (const gt of M.gates) { const x = R(gt.x * ts + 6 - cx), yb = R(gt.row * ts - cy); if (x < -30 || x > vw + 30) continue; const open = gateOpen(gt, now), t = (((now + gt.phase) % gt.period) + gt.period) % gt.period;
      const k = open ? 1 - t / gt.open : (t - gt.open) / (gt.period - gt.open); MCA.gate(g, x, yb, open, k, time);
      txt(open ? 'OPEN' : 'SHUT', x + 3, yb - 80, open ? '#8fd160' : '#ff9a5c', 'center', 5); }
    /* THE ROCKFALLS: the dust and the shadow, then the rock */
    for (const r of M.rocks) { if (!(r.fallT > -0.6) || r.armed) continue; const x0 = R(r.x * ts - cx), w = r.w * ts, yb = R(r.row * ts - cy);
      if (r.fallT > 0) { const k = 1 - r.fallT / r.delay; g.fillStyle = 'rgba(0,0,0,' + (0.25 + 0.35 * k).toFixed(2) + ')'; g.fillRect(x0 - 2, yb - 2, w + 4, 3); g.fillStyle = '#8a7660'; for (let i = 0; i < 4; i++) g.fillRect(x0 + (i * 9 + R(time * 40)) % w, yb - 70 + ((i * 23 + R(time * 90)) % 60), 2, 2);
        MCA.boulder(g, x0, w, yb, k, time); txt('!', x0 + w / 2, yb - 24, '#ffd36b', 'center', 6); } }
    /* THE BEAMS */
    for (const b of M.beams) { const x = R(b.x0 * ts - cx), w = (b.x1 - b.x0 + 1) * ts, y = R(b.row * ts - 10 - cy); MCA.beam(g, x, w, y);
      const P = ctx.hero(); if (P && b.x0 * ts - P.x < 140 && b.x0 * ts > P.x - 4) { const fl = Math.floor(time * 8) % 2; txt('DUCK', x + w / 2, y + 22, fl ? '#ff6b6b' : '#ffd36b', 'center', 6); } }
    /* THE GOBLIN CARTS (drawn under their riders): the foreman's armoured one; none under a thrower on his ledge */
    for (const c of M.carts) { if (c.state === 'gone' || c.ledge) { if (c.ledge && c.state === 'ledge' && c.e.alive && c.e.mcTelling) txt('!', R(c.x - cx), R(c.y - 34 - cy), Math.floor(time * 12) % 2 ? '#ff6b6b' : '#ffd36b', 'center', 7); continue; }
      if (c.foreman) MCA.armourCart(g, c.x - cx, c.y - cy, time, c.v, c.rams, c.stun > 0); else MCA.tub(g, c.x - cx, c.y - cy, c.e.t === 'gobmage' ? 'caster' : 'gob', time, c.v);
      if (c.state === 'roll' && c.e.alive && c.e.mcTelling) txt('!', R(c.x - cx), R(c.y - 40 - cy), Math.floor(time * 12) % 2 ? '#ff6b6b' : '#ffd36b', 'center', 7); }
    /* arrows, runes, lobs (the lob's MARK on the rail where it will land) */
    for (const s of M.shots) { g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; const a = Math.atan2(s.vy, s.vx); g.beginPath(); g.moveTo(R(s.x - cx), R(s.y - cy)); g.lineTo(R(s.x - Math.cos(a) * 7 - cx), R(s.y - Math.sin(a) * 7 - cy)); g.stroke(); }
    for (const r of M.runes) { if (r.t < 0) continue; const k = 1 - r.t / r.t0, x = R(r.x - cx), y = R(r.y - cy); g.strokeStyle = Math.floor(time * 10) % 2 ? '#b48aff' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, MC.runeR, 3, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(180,138,255,' + (0.2 + 0.4 * k).toFixed(2) + ')'; g.fillRect(x - R(MC.runeR * k), y - 2, R(MC.runeR * 2 * k), 2); txt('!', x, y - 14, '#b48aff', 'center', 6); }
    for (const o of M.lobs) { if (o.t < -0.05) continue; const k = 1 - Math.max(0, o.t) / o.t0; MCA.lobMark(g, R(o.tx - cx), R(o.ty - cy), MC.throwR, k, time); MCA.lobbed(g, R(o.x - cx), R(o.y - cy), o.bomb, time); }
    if (M.glint) drawGlint(g, R(M.glint.x - cx), R(M.glint.y - cy), vw, vh, time);
  };
  /* THE HERO'S CART (deeprails2: redrawn - a real iron tub, the hero sitting IN it): its back wall and inside behind him, its front over his legs; the wheels turn with
     the pace, sparks fly off them on the brake, it leans on a jump */
  const tilt = P => Math.max(-0.28, Math.min(0.28, (P.ground ? 0 : P.vy / 900)));
  H.drawCartBack = (g, P, cx, cy, time) => { if (!H.riding(P)) return; const c = cartOf(P); g.save(); g.translate(R(P.x - cx), R(P.y - cy + 1)); g.rotate(tilt(P)); MCA.heroCart(g, 0, 0, P.face || 1, c.v, !!c.braking, 0, time, 'back'); g.restore(); };
  H.drawCart = (g, P, cx, cy, time) => { if (!H.riding(P)) return; const c = cartOf(P); g.save(); g.translate(R(P.x - cx), R(P.y - cy + 1)); g.rotate(tilt(P)); MCA.heroCart(g, 0, 0, P.face || 1, c.v, !!c.braking, P.ducking ? 1 : 0, time, 'front'); g.restore();
    MCA.prowLamp(g, R(P.x - cx), R(P.y - cy + 1), P.face || 1, time); };
  /* THE SPEEDOMETER: a needle and its word, over the bottom-left of the screen (it reads the cart's true pace: crawl, brake, cruise, pump, RAM) */
  H.drawHud = (g, P) => { if (!M || !H.riding(P)) return; const c = cartOf(P), x = 24, y = ctx.VH() - 18, k = Math.min(1, c.v / MC.boost), mode = c.v >= MC.ramV ? 'ram' : c.v > MC.cruise + 20 ? 'boost' : c.v < 4 ? 'stopped' : c.v < MC.cruise - 30 ? 'brake' : 'cruise';
    MCA.speedo(g, x, y, k, MC.cruise / MC.boost, mode === 'ram' ? 'boost' : mode, ctx.time(), MC.ramV / MC.boost);
    txt(mode === 'ram' ? 'RAM!' : mode === 'boost' ? 'PUMP' : mode === 'stopped' ? 'WAIT' : mode === 'brake' ? 'BRAKE' : 'CRUISE', x, y + 10, mode === 'ram' ? '#ffd36b' : '#e8dcc0', 'center', 5); };
  H.bakeOreIcon = () => { const c = document.createElement('canvas'); c.width = 10; c.height = 8; const k = c.getContext('2d');
    k.fillStyle = '#3a2e26'; k.fillRect(1, 2, 8, 6); k.fillRect(2, 1, 6, 7); k.fillStyle = '#d89a5a'; k.fillRect(3, 3, 2, 2); k.fillStyle = '#ffd36b'; k.fillRect(6, 2, 2, 2); k.fillRect(4, 5, 1, 1); k.fillStyle = '#fff6c8'; k.fillRect(6, 2, 1, 1); return c; };
  H.read = () => M && { points: Object.fromEntries(M.points.map(p => [p.id, p.state])), carts: M.carts.map(c => ({ t: c.e.t, x: R(c.x), row: c.row, state: c.state, v: R(c.v), ledge: c.ledge, foreman: c.foreman, rams: c.rams })), shots: M.shots.length, runes: M.runes.length, lobs: M.lobs.length, n: { ...M.n },
    breaks: M.breaks.map(b => ({ id: b.id, started: b.started, broken: b.broken.size, front: R(b.front) })), cart: ctx.players[0] ? { v: R(cartOf(ctx.players[0]).v), foot: !!footAt(ctx.players[0].x) } : null, glint: M.glint };
  H.state = () => M;
  H.setPoints = (id, st) => { const p = M && M.points.find(q => q.id === id); if (p) { p.state = st; layPoints(p); } return !!p; };
  return H;
}
