// src/line-cart.js - THE ZIP-LINE CART ENGINE + THE RIDE CAMERA (claude/hlcartk, 11-14; scratch/lane-reports/hlcart-plan.md section 3, lane 2).
// An iron ore tub (64 px) hung from a trolley on a chain of lines. The hero boards at a station, the cart leaves (every living seat aboard, or a told 5 s countdown) and runs a
// SWITCHBACK at a FIXED 96 px/s (no brake, no boost): leg after leg across the shaft, each leg rising ~8 rows, docking ~1 s at every pass-through station and turning back.
// On the cart a hero does everything he does on the ground (walk, jump, attack, block, skills); the iron lips stop a walk or a roll going over the end; a jump keeps the cart's speed
// and lands back on it. He falls only by being dragged over a lip or by jumping off: the net drops him on that leg's START station for 10% max hp, and the cart rolls back empty in ~3 s.
// Pure like src/line-kit.js: no DOM, no main.js. The cart is a MOVING FLOOR of the same shape as the gondola's (platforms() -> { id: 'cart:<ride>', x0, x1, top }), so main.js's own
// mover carry does the rest; its ropes are ordinary kit lines (npc: true: foes only, never grabbed) via cartKitLines(), so the kit's lint, ends and drawing cover them.
// FLAG HL_CART (?hlcart=1), default OFF: with it off nothing here is ever called (src/line-cart-hands.js on() is false) and L.lineCarts is just data nobody reads.
//
//   L.lineCarts = [{ id: 'ore1', stations: [{ x: tx, top: ty }, ...],   cart centre in tiles / the station landing's top row; the cart runs station to station (>= 2)
//                    floats: [{ leg: 0, at: 0.4, text: 'THEY BOARD. KNOCK THEM OFF.' }] }]   a FLOAT TEXT (<= 5 words) fired CART.FLOAT_LEAD s before the cart reaches the point
//   The level also gives L.landings (each station stands on one: the lint checks). The NET is the engine's (virtual, art draws it); no landing may sit in the fall window under a leg. Optional speed: only CART.SPEED passes the lint.
//
//   const cs = cartInit(ride)                 one cart (ride = an entry of L.lineCarts)          cartsInit(L) -> [cs]
//   cartStep(cs, bodies, dt, { carry, chip }) -> events    the cart one frame: boarding, countdown, run, dock, roll back, the lips, the jump, the fall. carry:false = main.js moves the
//                                              seats that stand on it (its mover carry); the airborne ones, the lips and the falls are always the engine's
//   cartPlatform(cs) / cartPlatforms(list)    the moving floor(s)        cartMovers(L) -> main.js mover rows tagged lk: 'cart:<id>' (the hands copy the cart's place into them)
//   cartRespawn(cs, bodies)                   a shrine / party wipe: the cart home, every flag clear      dragOver(cs, b, dx)  a boarder's hook pull: moves him dx over the lip
//   rideDuration(ride) -> s  rideLength(ride) -> px   what the proof expects       cartKitLines(ride) -> kit line rows (npc)      lintCarts(L) -> [problems]
//   newRideCam() rideCamStep(cam, cs, dt) rideCamTarget(cam, cs, VW, VH)   the ride camera       drawCart(g, cs, cx, cy, time)   greybox (art owed: HLCARTART)
import { lineY } from './line-kit.js';

export const TS = 16;
export let HL_CART = false;   /* default OFF; ?hlcart=1 turns it on for a preview (main.js reads the query) */
export const setHlCart = v => { HL_CART = !!v; };
export const CART = {
  W: 64, LIP: 6, LIP_H: 10, DROP: 28,                 /* the tub: width, the end lips (the walk clamp, px in from each end), the lip height, rope-to-floor drop */
  SPEED: 96, DOCK: 1.0, BOARD_T: 0.6, COUNT: 5,       /* px/s along the rope (fixed); the pass-through pause; leave this long after the last seat boards; the told countdown (co-op laggards) */
  ROLL_SPEED: 320, ROLL_MAX: 8, EMPTY_T: 0.4, END_EMPTY: 1.0, CALL_T: 1.5,   /* the empty cart rolls back (a one-leg ride home ~3 s); it counts empty after this long; at the end station this long */
  FALL_PCT: 0.10, NET_DEPTH: 40, NET_MARGIN: 16, ENGAGE: 220, ENGAGE_Y: 100, AIR_X: 48, AIR_UP: 200, DRAG_T: 0.35,   /* the fall chip; the net this far under the floor; who the cart waits for; the jump's frame of reference; a drag keeps the lips off */
  SEATS: 4, FLOAT_LEAD: 2.7, FLOAT_WORDS: 5, MAX_RISE: 12, MIN_LEG: 8, MAX_SLOPE: 0.5,
  CAM_LEAD: 110, CAM_FOOT: 0.80, CAM_MARGIN: 16, CAM_EASE: 0.5, CAM_MIN_ROWS: 6,   /* the ride camera: lead in the cart's direction, the cart's floor at this fraction of the view height, the flip ease; rows that must show over the cart */
};
const px = t => t * TS;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

/* ---------------- THE ROUTE (stations -> legs, one distance g along the whole ride) ---------------- */
export function routeOf(ride) {
  const S = ride.stations.map(s => ({ x: px(s.x), y: px(s.top) })), legs = [], G = [0];
  for (let i = 0; i + 1 < S.length; i++) { const dx = S[i + 1].x - S[i].x, dy = S[i + 1].y - S[i].y, len = Math.hypot(dx, dy); legs.push({ i, dx, dy, len, dirX: Math.sign(dx) || 1, slope: dx ? Math.abs(dy / dx) : 9 }); G.push(G[i] + len); }
  return { S, legs, G, total: G[G.length - 1] };
}
export const rideLength = ride => routeOf(ride).total;
/* departure to the end station: the run at the fixed speed + a dock at every pass-through station */
export const rideDuration = ride => { const r = routeOf(ride); return r.total / (CART.SPEED) + Math.max(0, r.legs.length - 1) * CART.DOCK; };
function posAt(R, g) {
  g = clamp(g, 0, R.total); let i = 0; while (i < R.legs.length - 1 && g > R.G[i + 1]) i++;
  const L = R.legs[i], k = L.len ? (g - R.G[i]) / L.len : 0;
  return { x: R.S[i].x + L.dx * k, y: R.S[i].y + L.dy * k, leg: i, dirX: L.dirX };
}

/* ---------------- BUILD ---------------- */
export function cartInit(ride) {
  const R = routeOf(ride), cs = { id: ride.id, ride, R, g: 0, st: 'wait', t: 0, cd: null, emptyT: 0, fallen: {}, floatDone: new Map(), lipsUp: false, dx: 0, dy: 0, count: null, trips: 0 };
  syncPos(cs); return cs;
}
export const cartsInit = L => (L.lineCarts || []).map(cartInit);
function syncPos(cs) { const p = posAt(cs.R, cs.g); cs.x = p.x; cs.floorY = p.y; cs.legIdx = p.leg; cs.dirX = p.dirX; }
const stationIdx = (cs, g) => { for (let i = 0; i < cs.R.G.length; i++) if (Math.abs(cs.R.G[i] - g) < 1e-6) return i; return -1; };
/* the leg a fall at this moment replays: the leg he is on (a dock = the leg just run, a wait/end = the leg the cart stands at the start of / the last) */
function legOfFall(cs) {
  const n = cs.R.legs.length, si = stationIdx(cs, cs.g);
  if (si >= 0) { if (cs.st === 'dock') return Math.max(0, si - 1); return Math.min(n - 1, si); }
  return cs.legIdx;
}
export const cartPlatform = cs => ({ id: 'cart:' + cs.id, x0: cs.x - CART.W / 2, x1: cs.x + CART.W / 2, top: cs.floorY, cart: cs });
export const cartPlatforms = list => (list || []).map(cartPlatform);
/* main.js mover rows (the gondola's shape: a lift mover tagged lk, the hands copy the cart's place into it each frame) */
export function cartMovers(L) {
  return (L.lineCarts || []).map(r => { const p = posAt(routeOf(r), 0); return { kind: 'lift', lk: 'cart:' + r.id, fair: 'lk', x: p.x - CART.W / 2, y: p.y, w: CART.W, h: 6, y0: p.y, y1: p.y, speed: 0 }; });
}
/* the cart's ropes as kit line rows: the rope runs at floor - DROP; npc: true = foes ride them, a hero never grabs them (src/line-kit.js findLine/catchBelow skip npc lines) */
export function cartKitLines(ride) {
  const out = []; for (let i = 0; i + 1 < ride.stations.length; i++) { const a = ride.stations[i], b = ride.stations[i + 1];
    out.push({ id: ride.id + '_' + i, kind: 'free', npc: true, a: [a.x, a.top - CART.DROP / TS], b: [b.x, b.top - CART.DROP / TS] }); }
  return out;
}

/* HOW A LEVEL PLACES A RIDE (lane HLCARTL): placeRide(L, ride) adds the ride to L.lineCarts, its npc ropes to L.lineKit.lines, and its mover row to L.movers; the level gives the station landings */
export function placeRide(L, ride) {
  (L.lineCarts = L.lineCarts || []).push(ride);
  const D = (L.lineKit = L.lineKit || { lines: [] }); (D.lines = D.lines || []).push(...cartKitLines(ride));
  (L.movers = L.movers || []).push(...cartMovers({ lineCarts: [ride] }));
  return L;
}

/* ---------------- THE SEATS ---------------- */
const living = b => !!b && !b.dead && !(b.down > 0);
const onTop = (b, x0, x1, top) => living(b) && !b.lk && b.x >= x0 - 2 && b.x <= x1 + 2 && Math.abs(b.y - top) <= 3 && !(b.vy < -20);
/* riding = standing on the cart, or in the air over it after a jump from it (his frame of reference is the cart's) */
function ridingNow(cs, b, x0, x1, top) {
  if (onTop(b, x0, x1, top)) return true;
  return living(b) && !b.lk && b.cartRide === cs.id && !b.ground && b.x >= x0 - CART.AIR_X && b.x <= x1 + CART.AIR_X && b.y <= top + CART.NET_DEPTH && b.y >= top - CART.AIR_UP;
}
const engaged = (cs, b, x) => living(b) && !b.lk && Math.abs(b.x - x) <= CART.ENGAGE && Math.abs(b.y - cs.floorY) <= CART.ENGAGE_Y;
/* a boarder's hook pull (src/line-jumpers.js, lane HLCARTF): moves him dx along the floor and keeps the lips off for DRAG_T, so two pulls at the end carry him over */
export function dragOver(cs, b, dx) { b.cartRide = cs.id; b.x += dx; b.cartDrag = CART.DRAG_T; if (Math.abs(b.x - cs.x) > CART.W / 2) b.ground = false; return true; }   /* past the end he is in the air this very frame (the fall is the net's) */

/* ---------------- ONE CART, ONE FRAME ---------------- */
export function cartStep(cs, bodies, dt, o = {}) {
  const ev = [], carry = o.carry !== false, R = cs.R, n = R.legs.length, id = cs.id;
  const ox = cs.x, oy = cs.floorY, x0 = ox - CART.W / 2, x1 = ox + CART.W / 2;
  const seats = (bodies || []).filter(Boolean);
  for (const b of seats) { if (b.cartDrag > 0) b.cartDrag = Math.max(0, b.cartDrag - dt); if (b.cartRide === id && b.ground && !onTop(b, x0, x1, oy) && living(b)) b.cartRide = null; if (b.dead && b.cartRide === id) b.cartRide = null; }
  const aboardSeats = seats.filter(b => ridingNow(cs, b, x0, x1, oy));
  const aboard = aboardSeats.length;
  for (const b of seats) if (onTop(b, x0, x1, oy)) b.cartRide = id;
  const idxOf = b => seats.indexOf(b);
  for (const k of Object.keys(cs.fallen)) { const b = seats[+k]; if (!living(b) || aboardSeats.includes(b)) delete cs.fallen[k]; }   /* he boarded again (or died: the shrine) */
  const lag = seats.filter(b => living(b) && !aboardSeats.includes(b) && engaged(cs, b, ox)).length;
  /* WHO IS WAITING FOR THE CART, and where: a seat that fell (cs.fallen) or stands grounded on a station deck the cart is not at (a hop off ahead, a walk to a far station). The empty cart answers the nearest -
     so no seat is ever stranded on a station without a cart (the soft-lock the sweep guards) */
  const here = ['wait', 'dock', 'end'].includes(cs.st) ? stationIdx(cs, cs.g) : -1;
  const callIdx = new Set(Object.values(cs.fallen));
  for (let i = 0; i < R.S.length; i++) { if (i === here) continue; if (seats.some(b => living(b) && !b.lk && !aboardSeats.includes(b) && Math.abs(b.x - R.S[i].x) <= CART.ENGAGE && (b.ground ? Math.abs(b.y - R.S[i].y) <= 6 : b.y <= R.S[i].y + 6 && b.y >= R.S[i].y - 70))) callIdx.add(i); }   /* (a hop in the air over the deck counts) */
  const pickTarget = def => { let best = null; for (const i of callIdx) if (best === null || Math.abs(R.G[i] - cs.g) < Math.abs(R.G[best] - cs.g) - 1e-6) best = i; return best ?? def; };
  const startRoll = to => { cs.st = 'roll'; cs.rollTo = to; cs.callT = 0; ev.push({ t: 'cartRoll', id, to }); };
  /* the state machine */
  if (cs.st === 'wait') {
    cs.emptyT = 0;
    if (!aboard) { cs.cd = null; cs.count = null; cs.callT = callIdx.size ? (cs.callT || 0) + dt : 0; if (cs.callT >= CART.CALL_T) startRoll(pickTarget(0)); }
    else { if (cs.cd === null) { cs.cd = lag ? CART.COUNT : CART.BOARD_T; ev.push({ t: 'cartBoard', id }); if (lag) ev.push({ t: 'cartCount', id, n: CART.COUNT }); }
      if (!lag && cs.cd > CART.BOARD_T) cs.cd = CART.BOARD_T;
      const was = Math.ceil(cs.cd); cs.cd -= dt; if (lag && Math.ceil(cs.cd) !== was && cs.cd > 0) ev.push({ t: 'cartCount', id, n: Math.ceil(cs.cd) });
      cs.count = lag ? Math.max(0, cs.cd) : null;
      if (cs.cd <= 0) { cs.cd = null; cs.count = null; const si = stationIdx(cs, cs.g); if (si >= 0 && si < n) { cs.st = 'run'; cs.trips++; ev.push({ t: 'cartGo', id, leg: si, seats: aboard, left: lag }); } } }
  } else if (cs.st === 'run') {
    cs.g = Math.min(R.G[cs.legIdx + 1], cs.g + CART.SPEED * dt);
    if (cs.g >= R.G[cs.legIdx + 1] - 1e-6) { cs.g = R.G[cs.legIdx + 1]; const si = cs.legIdx + 1; cs.st = 'dock'; cs.t = CART.DOCK; cs.cd = null; ev.push({ t: 'cartDock', id, station: si, end: si === n }); }
    cs.emptyT = aboard ? 0 : cs.emptyT + dt;
    if (cs.emptyT >= CART.EMPTY_T && cs.st === 'run') startRoll(pickTarget(cs.legIdx));
  } else if (cs.st === 'dock') {
    const si = stationIdx(cs, cs.g); cs.t -= dt;
    if (si === n) { if (cs.t <= 0) { cs.st = 'end'; cs.emptyT = 0; ev.push({ t: 'cartEnd', id }); } }
    else if (!aboard) { if (cs.t <= 0) { cs.st = 'wait'; cs.cd = null; } }
    else { if (lag && cs.cd === null) cs.cd = CART.COUNT; if (cs.cd !== null) { const was = Math.ceil(cs.cd); cs.cd -= dt; if (Math.ceil(cs.cd) !== was && cs.cd > 0) ev.push({ t: 'cartCount', id, n: Math.ceil(cs.cd) }); }
      if (cs.t <= 0 && (!lag || cs.cd <= 0)) { cs.cd = null; cs.st = 'run'; ev.push({ t: 'cartGo', id, leg: si, seats: aboard, left: lag }); } }
  } else if (cs.st === 'end') {
    cs.emptyT = aboard ? 0 : cs.emptyT + dt;
    if (cs.emptyT >= CART.END_EMPTY) startRoll(pickTarget(0));
  } else if (cs.st === 'roll') {
    const tg = R.G[cs.rollTo], dist = Math.abs(cs.g - tg), sp = clamp(dist / CART.ROLL_MAX, CART.ROLL_SPEED, 1e9);   /* never slower than finishing in ROLL_MAX s; either way along the route */
    cs.g = cs.g > tg ? Math.max(tg, cs.g - sp * dt) : Math.min(tg, cs.g + sp * dt);
    if (Math.abs(cs.g - tg) <= 1e-6) { for (const [k, lg] of cs.floatDone) if (lg >= cs.rollTo) cs.floatDone.delete(k);   /* the replayed leg tells its texts again */
    cs.g = tg; cs.st = cs.rollTo === n ? 'end' : 'wait'; cs.cd = null; cs.emptyT = 0; ev.push({ t: 'cartHome', id, station: cs.rollTo }); }   /* called to the END station = it rests there as at the end of a ride */
  }
  syncPos(cs); cs.lipsUp = cs.st === 'run' || cs.st === 'roll';   /* up while it moves, down at a station */
  if (cs.st === 'run' || cs.st === 'dock' || cs.st === 'roll' || cs.st === 'wait') {
    /* a roll/run puts legIdx on the leg containing g; at a station boundary legIdx stays the leg to run next while waiting */
    if (cs.st === 'wait' || cs.st === 'run') { const si = stationIdx(cs, cs.g); if (si >= 0 && si < n) cs.legIdx = si; if (si >= 0 && si < n) { cs.dirX = R.legs[si].dirX; } }
  }
  /* FLOAT TEXTS: told FLOAT_LEAD s of ride ahead of the marked point, once per run */
  if (cs.st === 'run') for (const f of cs.ride.floats || []) { const key = f.leg + ':' + f.at + ':' + f.text; if (cs.floatDone.has(key)) continue;
    const gp = R.G[f.leg] + R.legs[f.leg].len * f.at, ahead = gp - cs.g;
    if (ahead >= 0 && ahead <= CART.SPEED * CART.FLOAT_LEAD) { cs.floatDone.set(key, f.leg); ev.push({ t: 'cartFloat', id, text: f.text, leg: f.leg }); } }
  if (cs.st === 'wait' && cs.legIdx === 0 && cs.g === 0) cs.floatDone.clear();
  cs.dx = cs.x - ox; cs.dy = cs.floorY - oy;
  /* carry: a seat on the floor moves with it (main.js's mover carry does this in the game: carry:false); a seat in the air keeps the cart's frame (a jump keeps its speed) */
  for (const b of aboardSeats) { const stand = onTop(b, x0, x1, oy);
    if (stand) { if (carry) { b.x += cs.dx; b.y = cs.floorY; if (b.vy > 0) b.vy = 0; b.ground = true; b.lkPlat = 'cart:' + id; } }
    else { b.x += cs.dx; b.y += cs.dy; } }
  /* the lips: a grounded (or low) seat is held in from the ends while they are up (not at a station, not while dragged) */
  const nx0 = cs.x - CART.W / 2 + CART.LIP, nx1 = cs.x + CART.W / 2 - CART.LIP;
  if (cs.lipsUp) for (const b of aboardSeats) { if (b.cartDrag > 0) continue; const inside = b.x >= cs.x - CART.W / 2 && b.x <= cs.x + CART.W / 2, low = b.ground || (inside && b.y > cs.floorY - CART.LIP_H); if (!low) continue;   /* in the air a seat clears the lip (a jump off); only a body still inside the tub below the lip's height meets the wall */
    if (b.x < nx0) b.x = nx0; else if (b.x > nx1) b.x = nx1;
    if (b.vx > 0) b.vx = Math.min(b.vx, (nx1 - b.x) / dt); else if (b.vx < 0) b.vx = Math.max(b.vx, (nx0 - b.x) / dt); }   /* his own velocity can never carry him past the lip this frame (a knockback or a roll stops AT it) */
  /* the fall: past the lip and down into the net -> the START station of that leg, 10% max hp, the cart rolls back if nobody is left aboard */
  for (const b of seats) { if (b.cartRide !== id || !living(b) || b.ground || b.lk) continue;
    if (b.y > cs.floorY + CART.NET_DEPTH) {
      const leg = legOfFall(cs), st = R.S[leg], k = idxOf(b), off = [-12, 12, -24, 24][k % 4];
      b.x = st.x + off; b.y = st.y; b.vx = 0; b.vy = 0; b.ground = true; b.cartRide = null; b.lk = null;
      let chip = 0; const maxHp = b.maxHp ?? b.maxhp;
      if (typeof maxHp === 'number' && typeof b.hp === 'number') { chip = Math.max(1, Math.round(maxHp * CART.FALL_PCT)); if (o.chip) o.chip(b, chip); else b.hp = Math.max(1, b.hp - chip); }
      cs.fallen[k] = leg; ev.push({ t: 'cartFall', id, seat: k, leg, chip, x: b.x, y: b.y }); } }
  return ev;
}

/* a shrine / party wipe: home at the first station, nobody carries a flag */
export function cartRespawn(cs, bodies) {
  cs.g = 0; cs.st = 'wait'; cs.t = 0; cs.cd = null; cs.count = null; cs.emptyT = 0; cs.fallen = {}; cs.floatDone.clear(); cs.lipsUp = false; syncPos(cs); cs.legIdx = 0; cs.dirX = cs.R.legs[0].dirX; cs.dx = cs.dy = 0;
  for (const b of bodies || []) if (b) { b.cartRide = null; b.cartDrag = 0; }
}

/* ---------------- THE RIDE CAMERA ----------------
   Follows the CART (not the hero: a hero at the lip must not swing the frame), leads CAM_LEAD px in the cart's direction of travel, puts the cart's floor at CAM_FOOT of the view height
   (>= CAM_MIN_ROWS rows of sky over it at VH 180) and flips at a switchback ONLY in the dock pause: the target direction is the NEXT leg's from the moment the cart docks. */
export const newRideCam = () => ({ lead: 0, set: false });
export function camDirOf(cs) {
  if (cs.st === 'roll') return -(cs.R.legs[Math.min(cs.R.legs.length - 1, Math.max(0, cs.legIdx))].dirX);
  if (cs.st === 'dock' || cs.st === 'end') { const si = stationIdx(cs, cs.g), n = cs.R.legs.length; return si >= 0 && si < n ? cs.R.legs[si].dirX : cs.R.legs[n - 1].dirX; }
  return cs.dirX;
}
export function rideCamStep(cam, cs, dt, VW = 320) {
  const tgt = camDirOf(cs) * Math.min(CART.CAM_LEAD, VW / 2 - CART.W / 2 - CART.CAM_MARGIN);   /* a narrow view leads less so the whole tub stays in the picture */
  if (!cam.set) { cam.lead = tgt; cam.set = true; }
  const maxStep = (2 * CART.CAM_LEAD / CART.CAM_EASE) * dt; cam.lead += clamp(tgt - cam.lead, -maxStep, maxStep);
  return cam.lead;
}
export function rideCamTarget(cam, cs, VW, VH) { return { tx: cs.x + cam.lead - VW / 2, ty: cs.floorY - VH * CART.CAM_FOOT }; }
/* is a world point inside the ride camera's view? (the proof's tell test) */
export function inRideView(cam, cs, VW, VH, x, y) { const t = rideCamTarget(cam, cs, VW, VH); return x >= t.tx && x <= t.tx + VW && y >= t.ty && y <= t.ty + VH; }

/* ---------------- LINT ---------------- */
export function lintCarts(L) {
  const bad = [], ids = new Set(), lands = L.landings || [], nets = L.nets || [];
  for (const r of L.lineCarts || []) {
    const id = r.id || '?';
    if (!r.id) bad.push('a ride has no id'); else if (ids.has(r.id)) bad.push(id + ': duplicate ride id'); ids.add(r.id);
    if (!r.stations || r.stations.length < 2) { bad.push(id + ': a ride needs >= 2 stations'); continue; }
    if (r.speed !== undefined && r.speed !== CART.SPEED) bad.push(id + ': speed ' + r.speed + ' - the cart runs a fixed ' + CART.SPEED + ' px/s (no brake, no boost)');
    const R = routeOf(r);
    r.stations.forEach((s, i) => { const d = lands.find(b => s.x >= b[0] + CART.W / 2 / TS - 0.01 && s.x <= b[2] + 1 - CART.W / 2 / TS + 0.01 && b[1] === s.top);
      if (!d) bad.push(id + ': station ' + i + ' (' + s.x + ',' + s.top + ') stands on no landing wide enough for the cart (' + CART.W / TS + ' tiles) at that row'); });
    R.legs.forEach((lg, i) => { const rise = -lg.dy / TS;
      if (Math.abs(lg.dx) / TS < CART.MIN_LEG) bad.push(id + ': leg ' + i + ' is shorter than ' + CART.MIN_LEG + ' tiles across');
      if (lg.slope > CART.MAX_SLOPE) bad.push(id + ': leg ' + i + ' slope ' + lg.slope.toFixed(2) + ' over ' + CART.MAX_SLOPE);
      if (Math.abs(rise) > CART.MAX_RISE) bad.push(id + ': leg ' + i + ' rises ' + rise.toFixed(1) + ' rows (max ' + CART.MAX_RISE + ')');
      if (i > 0 && Math.sign(lg.dx) === Math.sign(R.legs[i - 1].dx)) bad.push(id + ': leg ' + i + ' does not turn back (a switchback reverses at every station)');
      /* THE NET IS THE ENGINE'S (a fall past floor + NET_DEPTH is caught and sent to the leg's start station; the art draws the net): so nothing solid may catch a falling seat first - no landing's top in the window under the leg, except this leg's own station decks */
      const xa = Math.min(R.S[i].x, R.S[i + 1].x) - CART.W / 2, xb = Math.max(R.S[i].x, R.S[i + 1].x) + CART.W / 2;
      for (const b of [...lands, ...nets]) { const own = [R.S[i], R.S[i + 1]].some(s => s.x >= px(b[0]) && s.x <= px(b[2] + 1) && s.y === px(b[1])); if (own) continue;
        for (let x = Math.max(xa, px(b[0])); x <= Math.min(xb, px(b[2] + 1)); x += 8) { const fy = R.S[i].y + lg.dy * (x - R.S[i].x) / lg.dx; if (px(b[1]) > fy - 2 && px(b[1]) < fy + CART.NET_DEPTH + CART.NET_MARGIN) { bad.push(id + ': leg ' + i + ': a landing (row ' + b[1] + ', x ' + b[0] + '-' + b[2] + ') catches a fall before the net (inside floor + ' + (CART.NET_DEPTH + CART.NET_MARGIN) + ' px at x ' + (x / TS).toFixed(1) + ')'); break; } } } });
    for (const f of r.floats || []) { if (!(f.leg >= 0 && f.leg < R.legs.length) || !(f.at >= 0 && f.at <= 1)) bad.push(id + ': a float text on a missing leg/point');
      if (String(f.text || '').trim().split(/\s+/).length > CART.FLOAT_WORDS) bad.push(id + ': float text "' + f.text + '" is over ' + CART.FLOAT_WORDS + ' words'); }
  }
  return bad;
}

/* ---------------- DRAWING (greybox: plain shapes; art owed: HLCARTART) ---------------- */
export function drawCart(g, cs, cx, cy, time) {
  const x = Math.round(cs.x - cx), y = Math.round(cs.floorY - cy), w = CART.W;
  g.strokeStyle = '#2a2420'; g.beginPath(); g.moveTo(x + 0.5, y - CART.DROP); g.lineTo(x + 0.5, y - 12); g.stroke();   /* the trolley's hanger */
  g.fillStyle = '#9aa0a8'; g.fillRect(x - 4, y - CART.DROP - 2, 9, 4);
  g.fillStyle = '#3a3f46'; g.fillRect(x - w / 2, y - 12, w, 12); g.fillStyle = '#5a5f68'; g.fillRect(x - w / 2, y - 12, w, 3);   /* the iron tub */
  g.fillStyle = cs.lipsUp ? '#c9d1dc' : '#6a6f78'; g.fillRect(x - w / 2, y - CART.LIP_H - 2, 4, CART.LIP_H); g.fillRect(x + w / 2 - 4, y - CART.LIP_H - 2, 4, CART.LIP_H);   /* the lips (low at a station) */
  if (cs.count !== null && cs.count > 0) { g.fillStyle = '#e8c23a'; g.fillRect(x - 10, y - CART.DROP - 12, Math.round(20 * cs.count / CART.COUNT), 3); }
}
