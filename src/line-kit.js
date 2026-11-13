// src/line-kit.js - THE LINE KIT (claude/highlines-kit, 11-05; scratch/lane-reports/zipclimb-plan.md as amended by Daniel 11-05 15:27).
// THE HIGH LINES (Sky Road -> HIGH LINES -> Ore Road) is "mostly on the lines, mostly up". This is the one engine for every line in it, varied
// band by band: WINCH up-lines (strike to haul: a grip crank or a station post), fast GLIDE down-lines, POINTS junctions, SNAP lines, the GONDOLA
// set piece (the line snaps, the cab falls onto a lower line), COUNTERWEIGHT pairs (a hopper stone, or ride the weight down to send the cage up),
// SIDE lines to secrets, CUTTABLE lines (the Hookjack), and told WIND sections with lee rocks (wind only in its own sections - lint).
// Pure: no DOM, no main.js. The kit's lines are its OWN (L.lineKit.lines, never pushed into L.zipLines), so src/zipline.js and the six live
// levels that ride it are untouched; the feel numbers are zipline's (hang 12, reach 24/4, end pad 8, release 0.6, kick -240).
// docs/linekit.md = the level API + the main.js wiring sketch; tools/line-kit.mjs proves it (all heroes, 1-4 seats, soft-lock sweep, lint).
//
//   L.lineKit = {
//     lines: [{ id, kind: 'free'|'glide'|'winch', a: [tx, ty], b: [tx, ty],   rope ends in TILES (y = the rope; fractions allowed)
//               speed, hang, dir,                              optional overrides (dir only for a flat line)
//               drive: 'grip'|'post', posts: [[tx, ty]],       a winch: grip = each blow while hanging is a stroke; post = strike the post
//               points: [{ at: tx, to: id }],                  a junction: hold UP riding past `at` and you switch to `to`
//               snap: { at: tx },                              a told creak, then it parts at `at` (restrung after LK.RESTRING)
//               cab: { onto: id },                             THE GONDOLA: a cab you stand in; the snap drops it onto line `onto`
//               cut: true,  secret: true,  pitOk: true,  npc: true }],   foes may part it / a side line to a secret / a drop here may pit / foes only
//     weights: [{ id, a: { x0, x1, top, bot }, b: { x0, x1, top, bot }, rest: 0, tare: 0.5, hopper: [tx, ty], brake: [tx, ty], hold: 3 }],
//              k = 0: A at its top, B at its bottom; k = 1: A down, B up. Load = seats on it (+ A's tare + stones). Heavier goes down.
//     winds: [{ id, box: [x0, y0, x1, y1], dir: 1|-1, period: 4, on: 2, told: 1.2, shove: 240, sway: 10, phase }],
//              exam: true = THE EXAM BAND (Daniel 11-05: winch + wind + Hookjacks): a winch may run through it (sway only - a stroke is a stroke)
//     lee: [[x0, y0, x1, y1]],  anchors: [[tx, ty]] }      lee rocks (no wind) / pylons a line end may hang from
//   The level also gives (for lint/sweep): L.landings [[x0, top, x1, bottom]], L.nets (same), L.checkpoints [{ x, y }], L.secrets [[tx, ty]], L.exit [x0, y0, x1, y1].
//
//   const kit = lineInit(L)                      riderStep(kit, P, inp, dt) -> events   (per seat; inp = { up, down, left, right, upPress, jumpPress, strike, hb })
//   kitStep(kit, bodies, dt) -> events          world: winds, posts, weights, cabs, snaps, restring (bodies = every seat, for loads + carrying)
//   kitStrike(kit, hb) -> post|null             a blow or a shot box on a post (winch / hopper / brake); any seat's
//   windAt(kit, x, y)  windPush(kit, P, dt)     the gust here now (null in a lee or outside) / carry an airborne body in a gust
//   platforms(kit) -> [{ id, x0, x1, top }]     the moving floors (cabs, weights) main.js treats as one-way platforms
//   lineRespawn(kit, bodies)                    a party wipe / checkpoint: lines restrung, cabs + weights home, winds calm >= LK.GRACE
//   lineCut(kit, id, s)  foeRide(kit, e, dt)  ridersOn(kit, bodies, id)  leadPoint(kit, P, t)  riderHit(kit, P, o)   foe hooks
//   lintLines(L) -> [problems]                  drawLines(g, kit, cx, cy, VW, VH, time)   greybox drawing (art owed)
import { MOVE } from './hero-move.js';

export const TS = 16;
export const LK = {
  HANG: 12, UP_LO: 24, UP_HI: 4, END_PAD: 8, RELEASE: 0.6,          /* zipline's feel (src/zipline.js ZIP) */
  FREE: 210, GLIDE: 300, BRAKE: 0.5,                                 /* px/s; hold BACK on a free/glide line = brake */
  KICK_VY: -240, KICK_VX: 0.8, KICK_STEER: 60, DROP_VY: 40,          /* JUMP off a line / DOWN off a line */
  STROKE: 40, STROKE_T: 0.3, STROKE_BUF: 2,                          /* a grip-winch crank stroke: px, s, buffered strokes */
  POST_RUN: 2.4, POST_SPEED: 110,                                    /* a struck winch post runs its line this long, this fast */
  TOP_HOP: -90, TOP_VX: 70,                                          /* off the high end of a winch onto its landing */
  CAB_DROP: 40, CAB_W: 48, CAB_SPEED: 90, CAB_ONTO: 160, CAB_BOARD: 0.6, CAB_G: 900, CAB_KICK: 0.6,   /* the gondola */
  SNAP_TELL: 1.0, RESTRING: 8,                                       /* a creak this long before a line parts; a parted line is strung again after */
  CW_SPEED: 70, CW_RETURN: 4, CW_HOME: 40, STONE: 9, TARE: 0.5, CW_HOLD: 3,   /* counterweights */
  MIN_TELL: 1.0, GRACE: 3, TAIL: 1.35, HEAD: 0.6, SWAY: 10, SWAY_K: 18, SWAY_DAMP: 2.2, AIR_PUSH: 1.5, SHOVE_CAP: 320,   /* wind */
  GUARD_PUSH: 24, KNOCK_VX: 60, KNOCK_VY: -80, SEATS: 4, POST_BOX: [11, 14],
  FOE_SPEED: 110,
  TUCK: 0.25, TUCK_CD: 0.5,                                           /* (claude/linekit) THE TUCK: DODGE on a line = this many s of i-frames, and he stays on the line */
  CLIMB_FOOT: 0.80, CLIMB_LEAD: 40, CLIMB_EASE: 0.4,                 /* (claude/linekit) L.climbCam: the camera's foot line while a seat is on a winch, its up-lead px, the ease s */
};
const px = t => t * TS;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
export const KINDS = ['free', 'glide', 'winch'];

/* ---------------- BUILD ---------------- */
function mkLine(d) {
  const kind = d.kind || 'free', x0 = px(d.a[0]), y0 = px(d.a[1]), x1 = px(d.b[0]), y1 = px(d.b[1]);
  const dx = x1 - x0, dy = y1 - y0;
  const down = Math.abs(dy) < 2 ? (d.dir || 1) : (dy > 0 ? Math.sign(dx) : -Math.sign(dx));   /* the way downhill */
  const z = { id: d.id, kind, d, x0, y0, x1, y1, xa: Math.min(x0, x1), xb: Math.max(x0, x1), slope: dx ? dy / dx : 0, hang: d.hang ?? LK.HANG,
    dir: d.dir || (kind === 'winch' ? -down : down), cut: 0, whip: 0, tell: 0, run: 0, cabLine: !!d.cab, npc: !!d.npc,
    points: (d.points || []).map(p => ({ at: px(p.at), to: p.to })), snapX: d.snap ? px(d.snap.at) : null };
  z.speed = d.speed || (kind === 'glide' ? LK.GLIDE : kind === 'winch' ? (d.drive === 'post' ? LK.POST_SPEED : LK.STROKE / LK.STROKE_T) : LK.FREE);
  return z;
}
export const lineY = (z, x) => z.y0 + z.slope * (clamp(x, z.xa, z.xb) - z.x0);
const runEnd = z => (z.dir > 0 ? z.xb - LK.END_PAD : z.xa + LK.END_PAD);
const highEnd = z => (z.y0 <= z.y1 ? [z.x0, z.y0] : [z.x1, z.y1]);
const boxPx = b => ({ l: px(b[0]), t: px(b[1]), r: px(b[2] + 1), b: px(b[3] + 1) });
const inBox = (B, x, y) => x >= B.l && x < B.r && y >= B.t && y < B.b;

export function lineInit(L) {
  const D = L.lineKit || {};
  const kit = { L, D, lines: {}, list: [], posts: [], weights: [], winds: [], lee: (D.lee || []).map(boxPx), cabs: [], pitY: px((L.h || 200) + 2) };
  for (const d of D.lines || []) {
    const z = mkLine(d); kit.lines[z.id] = z; kit.list.push(z);
    for (const p of d.posts || []) kit.posts.push({ kind: 'winch', line: z.id, x: px(p[0]) + 8, y: px(p[1] + 1) - 12, cool: 0, swing: 0 });
    if (d.cab) { const c = { home: z.id, onto: d.cab.onto, emptyT: 0 }; cabHome(kit, c, z); kit.cabs.push(c); z.cab = c; }
  }
  for (const d of D.weights || []) {
    const W = { id: d.id, d, k: d.rest || 0, stones: 0, rel: 0, emptyT: 0, moving: false };
    if (d.hopper) kit.posts.push({ kind: 'hopper', weight: d.id, x: px(d.hopper[0]) + 8, y: px(d.hopper[1] + 1) - 12, cool: 0, swing: 0 });
    if (d.brake) kit.posts.push({ kind: 'brake', weight: d.id, x: px(d.brake[0]) + 8, y: px(d.brake[1] + 1) - 12, cool: 0, swing: 0 });
    kit.weights.push(W);
  }
  for (const d of D.winds || []) kit.winds.push({ id: d.id, d, B: boxPx(d.box), dir: d.dir || 1, period: d.period || 4, on: d.on ?? 2, told: d.told ?? 1.2,
    shove: Math.min(LK.SHOVE_CAP, d.shove ?? 240), sway: d.sway ?? LK.SWAY, t: d.phase ?? (d.on ?? 2), grace: 0, was: '' });
  kit.ends = D.strictEnds ? (D.ends || endSupports(L)) : [];   /* (claude/hlfix) what holds each rope end (drawn by high_lines_art.js; D.ends is the level's own, with its real walls) */
  return kit;
}
function cabHome(kit, c, z) {   /* the cab waits at its line's start (the end it runs from), floor level with the station */
  z = z || kit.lines[c.home]; c.on = c.home; c.dir = z.dir; c.x = z.dir > 0 ? z.xa : z.xb;
  c.st = 'rest'; c.t = 0; c.vx = 0; c.vy = 0; c.hookY = lineY(z, c.x); c.told = false; c.emptyT = 0;
}
export const cabFloor = c => c.hookY + LK.CAB_DROP;

/* ---------------- WIND ---------------- */
const inLee = (kit, x, y) => kit.lee.some(B => inBox(B, x, y));
function windState(w) {
  if (w.grace > 0) return { blow: false, told: w.grace <= w.told };
  return { blow: w.t < w.on, told: w.t >= w.period - w.told };
}
export function windAt(kit, x, y) {
  if (inLee(kit, x, y)) return null;
  for (const w of kit.winds) if (inBox(w.B, x, y)) { const s = windState(w); return { id: w.id, dir: w.dir, shove: w.shove, sway: w.sway, ...s }; }
  return null;
}
/* an airborne body in a blowing gust is carried with it (the Gale Moor rule): faster along it, never past the gust's own speed by the push */
export function windPush(kit, P, dt) {
  if (P.lk || P.ground || P.dead) return false;
  const W = windAt(kit, P.x, P.y - 8); if (!W || !W.blow) return false;
  const cap = Math.max(Math.abs(P.vx), W.shove * 0.5); P.vx = clamp(P.vx + W.dir * W.shove * LK.AIR_PUSH * dt, -cap, cap); return true;
}

/* ---------------- TAKING HOLD ---------------- */
function canTake(P) {
  return !P.dead && !(P.hurt > 0) && !(P.lkRel > 0 && P.lkHard) && !P.climb && !P.swim && !P.plunge && !(P.dodge > 0) && !(P.atk >= 0) && !P.zip && !P.lk;
}
export function inReach(z, P) {
  if (z.dir > 0 ? (P.x < z.xa - 10 || P.x > z.xb - LK.END_PAD - 4) : (P.x > z.xb + 10 || P.x < z.xa + LK.END_PAD + 4)) return false;
  const ly = lineY(z, P.x); return ly >= P.y - LK.UP_LO && ly <= P.y - LK.UP_HI;
}
export function findLine(kit, P, up, downHeld) {
  const rel = P.lkRel > 0; let best = null, bd = 1e9;
  for (const z of kit.list) {
    if (z.cut > 0 || z.cabLine || z.npc) continue;
    if (z.id === P.lkSkip && (!up || rel)) continue;
    if (!up && (P.ground || downHeld || z.snapX !== null)) continue;   /* by touch only in the air; a snap line only on purpose */
    if (!inReach(z, P)) continue;
    const d = Math.abs(lineY(z, P.x) - (P.y - 12)); if (d < bd) { bd = d; best = z; }
  }
  return best;
}
function letGo(P, z, hard, rel) { P.lk = null; P.lkSkip = z ? z.id : null; P.lkRel = rel ?? LK.RELEASE; P.lkHard = !!hard; P.cling = false; P.lkHeld = false; }

/* ---------------- ONE SEAT, ONE FRAME ---------------- */
export function riderStep(kit, P, inp = {}, dt) {
  const ev = [];
  P.lkRel = Math.max(0, (P.lkRel || 0) - dt); P.lkTuckCd = Math.max(0, (P.lkTuckCd || 0) - dt);
  if (P.lkSkip && (P.ground || P.swim || P.climb)) P.lkSkip = null;
  let r = P.lk;
  if (r) { const z = kit.lines[r.id];
    if (P.dead || P.hurt > 0 || !z || z.cut > 0) { ev.push({ t: z && z.cut > 0 ? 'parted' : 'lost', id: r.id }); letGo(P, z, true); P.vy = 0; P.vx = r.dir * 30; r = null; } }
  if (!r && canTake(P)) {
    const z = findLine(kit, P, !!(inp.up || inp.upPress), !!inp.down);
    if (z) { r = P.lk = { id: z.id, x: clamp(P.x, z.xa, z.xb), dir: z.dir, haul: 0, buf: 0, sway: 0, swayV: 0, v: 0 }; P.lkSkip = null; P.climb = false; ev.push({ t: 'take', id: z.id }); }
  }
  if (!r) return ev;
  let z = kit.lines[r.id];
  const W = windAt(kit, r.x, lineY(z, r.x) + z.hang - 8);
  /* THE TUCK (claude/linekit, plan C): DODGE on a line = LK.TUCK s of i-frames (P.inv, the one the game's own damage reads), no roll displacement - he stays on the line */
  r.tuck = Math.max(0, (r.tuck || 0) - dt);
  if (inp.dodgePress && !(P.lkTuckCd > 0)) { r.tuck = LK.TUCK; P.lkTuckCd = LK.TUCK_CD; P.inv = Math.max(P.inv || 0, LK.TUCK); ev.push({ t: 'tuck', id: z.id }); }
  P.lkTuck = r.tuck;
  /* LET GO: JUMP kicks off (carrying the line's speed and the sway), DOWN drops */
  if (inp.jumpPress) { const steer = inp.left ? -LK.KICK_STEER : inp.right ? LK.KICK_STEER : 0;
    P.vx = r.dir * r.v * LK.KICK_VX + r.swayV + steer; P.vy = LK.KICK_VY; P.ground = false; letGo(P, z, false); ev.push({ t: 'kick', id: z.id }); return ev; }
  if (inp.down) { P.vx = r.dir * r.v * 0.4 + r.swayV; P.vy = LK.DROP_VY; letGo(P, z, false, LK.RELEASE * 0.5); ev.push({ t: 'drop', id: z.id }); return ev; }
  /* HOW FAST ALONG IT */
  let v = 0;
  if (inp.strike && z.kind !== 'winch') ev.push({ t: 'swing', id: z.id });   /* A LINE SWING (claude/linekit, plan C): the hero's own forward blow, no step, no lunge, the line carries him as it did - the game fires the blow, the kit only tells it */
  if (z.kind === 'winch') {
    if (z.d.drive === 'post') { if (inp.strike && inp.hb) { const p = kitStrike(kit, inp.hb); if (p) ev.push({ t: 'strike', post: p.kind }); } v = z.run > 0 ? z.speed : 0; }
    else {   /* GRIP: every blow while hanging is a crank stroke; the ratchet holds between */
      if (inp.strike) r.buf = Math.min(LK.STROKE_BUF, r.buf + 1);
      if (r.haul <= 0 && r.buf > 0) { r.buf--; r.haul = LK.STROKE; ev.push({ t: 'stroke', id: z.id }); }
      if (r.haul > 0) { const step = Math.min(r.haul, LK.STROKE / LK.STROKE_T * dt); r.haul -= step; v = step / dt; }
    }
  } else {
    v = z.speed; if (W && W.blow && z.d.wind !== false) v *= W.dir === r.dir ? LK.TAIL : LK.HEAD;
    if (r.dir > 0 ? inp.left : inp.right) v *= LK.BRAKE;
  }
  const xPrev = r.x; r.x += r.dir * v * dt; r.v = v;
  /* POINTS: past a junction with UP held, onto the branch */
  if (inp.up) for (const p of z.points) if ((xPrev - p.at) * r.dir < 0 && (r.x - p.at) * r.dir >= 0) {
    const to = kit.lines[p.to]; if (!to || to.cut > 0) continue;
    r.id = to.id; r.dir = to.dir; r.x = clamp(p.at, to.xa, to.xb); r.haul = 0; r.buf = 0; ev.push({ t: 'points', from: z.id, to: to.id }); z = to; break; }
  /* A SNAP LINE: the creak is told ahead of where it goes */
  if (z.snapX !== null && !z.tell && !(z.cut > 0) && v > 0 && (z.snapX - r.x) * r.dir <= Math.max(v, 60) * LK.SNAP_TELL) { z.tell = LK.SNAP_TELL; ev.push({ t: 'creak', id: z.id }); }
  /* SWAY: a damped swing; a gust drives it */
  const f = W && W.blow ? W.dir * W.shove * 0.5 : 0, cap = W ? W.sway : LK.SWAY;
  r.swayV += (f - LK.SWAY_K * r.sway - LK.SWAY_DAMP * r.swayV) * dt; r.sway = clamp(r.sway + r.swayV * dt, -cap, cap);
  /* THE END: a winch's high end puts you on its landing; a free line's low end lets you go */
  const ex = runEnd(z);
  if ((r.x - ex) * r.dir >= 0) {
    r.x = ex; P.x = r.x; P.y = lineY(z, r.x) + z.hang;
    if (z.kind === 'winch') { P.vy = LK.TOP_HOP; P.vx = r.dir * LK.TOP_VX; ev.push({ t: 'top', id: z.id }); }
    else { P.vy = 0; P.vx = r.dir * 100; ev.push({ t: 'end', id: z.id }); }
    letGo(P, z, true); return ev;
  }
  P.x = r.x + r.sway; P.y = lineY(z, r.x) + z.hang; P.vx = r.dir * v; P.vy = z.slope * P.vx;
  P.ground = false; P.cling = true; P.lkHeld = true; P.coyote = 0; if (v > 0 || z.kind !== 'winch') P.face = r.dir;
  return ev;
}

/* LET GO FIRST (claude/linekit, plan C): a movement skill (lunge, dash, vault, leap, plunge) or an ultimate that moves the hero lets go of the line, skips it 0.6 s, and then runs as on the ground */
export function releaseRider(kit, P) {
  const r = P.lk; if (!r) return null; const z = kit.lines[r.id]; letGo(P, z, false); return { t: 'release', id: r.id };
}
/* THE CLIMB CAMERA (L.climbCam): { foot, lead } while ANY seat hangs on a winch - the foot line drops to CLIMB_FOOT and the view leads up toward the winch's high end; null otherwise (main.js eases it over CLIMB_EASE) */
export function climbLook(kit, bodies) {
  for (const b of bodies || []) if (b && b.lk && !b.dead) { const z = kit.lines[b.lk.id]; if (z && z.kind === 'winch') return { foot: LK.CLIMB_FOOT, lead: LK.CLIMB_LEAD, id: z.id }; }
  return null;
}

/* ---------------- THE WORLD, ONE FRAME ---------------- */
const onTop = (b, x0, x1, top) => b && !b.dead && !b.lk && b.x >= x0 - 2 && b.x <= x1 + 2 && Math.abs(b.y - top) <= 3 && !(b.vy < -20);
function carry(bodies, x0, x1, top0, dx, dy, plat) {
  const out = [];
  for (const b of bodies || []) if (onTop(b, x0, x1, top0)) { b.x += dx; b.y = top0 + dy; if (b.vy > 0) b.vy = 0; b.ground = true; b.lkPlat = plat; out.push(b); }
  return out;
}
export function weightTops(W) { const a = W.d.a, b = W.d.b; return { A: px(lerp(a.top, a.bot, W.k)), B: px(lerp(b.bot, b.top, W.k)) }; }
export function platforms(kit) {
  const out = [];
  for (const c of kit.cabs) if (c.st !== 'gone') out.push({ id: 'cab:' + c.home, x0: c.x - LK.CAB_W / 2, x1: c.x + LK.CAB_W / 2, top: cabFloor(c), cab: c });
  for (const W of kit.weights) { const T = weightTops(W);
    out.push({ id: 'w:' + W.id + ':A', x0: px(W.d.a.x0), x1: px(W.d.a.x1 + 1), top: T.A, weight: W, side: 'A' });
    out.push({ id: 'w:' + W.id + ':B', x0: px(W.d.b.x0), x1: px(W.d.b.x1 + 1), top: T.B, weight: W, side: 'B' }); }
  return out;
}
export function kitStep(kit, bodies, dt) {
  const ev = [];
  for (const p of kit.posts) { p.cool = Math.max(0, p.cool - dt); p.swing = Math.max(0, p.swing - dt * 2); }
  /* winds: the told cycle (calm -> told -> blow), a respawn's calm grace first */
  for (const w of kit.winds) {
    if (w.grace > 0) w.grace = Math.max(0, w.grace - dt); else w.t = (w.t + dt) % w.period;
    const s = windState(w), now = s.blow ? 'blow' : s.told ? 'told' : 'calm';
    if (now !== w.was) { ev.push({ t: now === 'blow' ? 'gust' : now === 'told' ? 'gustTell' : 'calm', id: w.id }); w.was = now; }
    if (w.grace === 0 && w.wasGrace) { w.t = 0; w.wasGrace = false; } if (w.grace > 0) w.wasGrace = true;
  }
  /* lines: posts run, creaks part, parted lines are strung again */
  for (const z of kit.list) {
    z.run = Math.max(0, z.run - dt); z.whip = Math.max(0, z.whip - dt);
    if (z.tell > 0) { z.tell = Math.max(0, z.tell - dt); if (z.tell === 0 && !z.cabLine) { z.cut = LK.RESTRING; z.whip = 0.6; ev.push({ t: 'snap', id: z.id }); } }
    if (z.cut > 0) { z.cut = Math.max(0, z.cut - dt); if (z.cut === 0) { z.tell = 0; ev.push({ t: 'restrung', id: z.id }); } }
  }
  /* counterweights */
  for (const W of kit.weights) {
    const d = W.d, T0 = weightTops(W), Ax0 = px(d.a.x0), Ax1 = px(d.a.x1 + 1), Bx0 = px(d.b.x0), Bx1 = px(d.b.x1 + 1);
    const sA = (bodies || []).filter(b => onTop(b, Ax0, Ax1, T0.A)).length, sB = (bodies || []).filter(b => onTop(b, Bx0, Bx1, T0.B)).length;
    W.rel = Math.max(0, W.rel - dt);
    const span = Math.max(1, px(d.a.bot - d.a.top)), k0 = W.k;
    W.emptyT = sA + sB ? 0 : W.emptyT + dt;
    if (W.emptyT >= LK.CW_RETURN) { if (W.stones) ev.push({ t: 'stonesOut', id: W.id }); W.stones = 0; const home = d.rest || 0; if (W.k !== home) W.k = home > W.k ? Math.min(home, W.k + LK.CW_HOME / span * dt) : Math.max(home, W.k - LK.CW_HOME / span * dt); }
    else if ((sA + sB > 0 || W.stones > 0) && !(d.brake && !(W.rel > 0))) {
      const diff = sA + (d.tare ?? LK.TARE) + W.stones - (sB + (d.tareB || 0));
      if (Math.abs(diff) >= 0.5 && W.k !== (diff > 0 ? 1 : 0)) { const tg = diff > 0 ? 1 : 0; W.k = tg > W.k ? Math.min(1, W.k + LK.CW_SPEED / span * dt) : Math.max(0, W.k - LK.CW_SPEED / span * dt); }
    }
    const mv = W.k !== k0; if (mv !== W.moving) { ev.push({ t: mv ? 'cwStart' : 'cwStop', id: W.id }); W.moving = mv; }
    if (mv) { const T1 = weightTops(W); carry(bodies, Ax0, Ax1, T0.A, 0, T1.A - T0.A, 'w:' + W.id + ':A'); carry(bodies, Bx0, Bx1, T0.B, 0, T1.B - T0.B, 'w:' + W.id + ':B'); }
  }
  /* the gondolas */
  for (const c of kit.cabs) cabStep(kit, c, bodies, dt, ev);
  return ev;
}
function cabStep(kit, c, bodies, dt, ev) {
  const home = kit.lines[c.home], x0 = c.x - LK.CAB_W / 2, x1 = c.x + LK.CAB_W / 2, f0 = cabFloor(c);
  const seats = (bodies || []).filter(b => onTop(b, x0, x1, f0)).length;
  c.emptyT = seats ? 0 : c.emptyT + dt;
  const ox = c.x, oy = c.hookY;
  if (c.st === 'rest') { if (seats && !(home.cut > 0)) { c.st = 'board'; c.t = LK.CAB_BOARD; ev.push({ t: 'cabBoard', id: c.home }); } }
  else if (c.st === 'board') { if (!seats) c.st = 'rest'; else if ((c.t -= dt) <= 0) { c.st = 'run'; ev.push({ t: 'cabGo', id: c.home }); } }
  else if (c.st === 'run') {
    const z = kit.lines[c.on], sp = c.on === c.home ? LK.CAB_SPEED : Math.min(z.speed, LK.CAB_ONTO);
    c.x += c.dir * sp * dt; c.hookY = lineY(z, c.x);
    if (c.on === c.home && home.snapX !== null) {
      if (!c.told && (home.snapX - c.x) * c.dir <= sp * LK.SNAP_TELL) { c.told = true; ev.push({ t: 'creak', id: c.home }); }
      if ((c.x - home.snapX) * c.dir >= 0) { c.st = 'fall'; c.vx = c.dir * sp * LK.CAB_KICK; c.vy = 0; home.cut = LK.RESTRING; home.whip = 0.6; ev.push({ t: 'snap', id: c.home }); }
    }
    if (c.st === 'run') { const end = c.dir > 0 ? z.xb - LK.END_PAD - 8 : z.xa + LK.END_PAD + 8;
      if ((c.x - end) * c.dir >= 0) { c.x = end; c.hookY = lineY(z, c.x); c.st = 'dock'; ev.push({ t: 'cabDock', id: c.home, on: c.on }); } }
  } else if (c.st === 'fall') {
    const r = cabFall(kit, c, dt); if (r === 'catch') ev.push({ t: 'cabCatch', id: c.home, on: c.on }); else if (r === 'gone') ev.push({ t: 'cabLost', id: c.home });
  } else if (c.st === 'dock' || c.st === 'gone') {
    if (!(home.cut > 0) && c.emptyT >= 1) { cabHome(kit, c, home); ev.push({ t: 'cabHome', id: c.home }); return; }
  }
  if (c.st !== 'gone' && c.st !== 'rest') carry(bodies, x0, x1, f0, c.x - ox, c.hookY - oy, 'cab:' + c.home);
}
/* the cab in the air: ballistic, and its hook catches the lower line `onto` when it crosses it inside that line's run */
function cabFall(kit, c, dt) {
  const onto = c.onto && kit.lines[c.onto];
  c.vy += LK.CAB_G * dt; const nx = c.x + c.vx * dt, ny = c.hookY + c.vy * dt;
  if (onto && !(onto.cut > 0) && nx > onto.xa + LK.END_PAD && nx < onto.xb - LK.END_PAD) { const ly0 = lineY(onto, c.x), ly1 = lineY(onto, nx);
    if (c.hookY <= ly0 + 0.5 && ny >= ly1) { c.x = nx; c.hookY = ly1; c.on = onto.id; c.dir = onto.dir; c.st = 'run'; c.vx = 0; c.vy = 0; return 'catch'; } }
  c.x = nx; c.hookY = ny;
  if (cabFloor(c) > kit.pitY) { c.st = 'gone'; return 'gone'; }
  return null;
}

/* ---------------- STRIKING A POST ---------------- */
export function kitStrike(kit, hb) {
  if (!hb) return null;
  const [hx, hy] = LK.POST_BOX;
  for (const p of kit.posts) {
    if (p.cool > 0 || !(hb.l < p.x + hx && hb.r > p.x - hx && hb.t < p.y + hy && hb.b > p.y - hy)) continue;
    p.cool = 0.4; p.swing = 1;
    if (p.kind === 'winch') { const z = kit.lines[p.line]; z.run = LK.POST_RUN; }
    else { const W = kit.weights.find(q => q.id === p.weight); if (!W) continue;
      if (p.kind === 'hopper') { if (W.stones) { p.cool = 0.2; continue; } W.stones = LK.STONE; W.emptyT = 0; }
      if (p.kind === 'brake') W.rel = W.d.hold ?? LK.CW_HOLD; }
    return p;
  }
  return null;
}

/* ---------------- RESPAWN ---------------- */
export function lineRespawn(kit, bodies) {
  for (const z of kit.list) { z.cut = 0; z.tell = 0; z.run = 0; z.whip = 0; }
  for (const c of kit.cabs) cabHome(kit, c);
  for (const W of kit.weights) { W.k = W.d.rest || 0; W.stones = 0; W.rel = 0; W.emptyT = 0; W.moving = false; }
  for (const w of kit.winds) { w.grace = Math.max(LK.GRACE, w.told); w.wasGrace = true; w.was = ''; }
  for (const p of kit.posts) { p.cool = 0; p.swing = 0; }
  for (const b of bodies || []) if (b) { b.lk = null; b.lkSkip = null; b.lkRel = 0; b.lkHard = false; b.lkHeld = false; b.cling = false; }
}

/* ---------------- FOE HOOKS ---------------- */
/* THE HOOKJACK cuts a line: every rider on it falls (next riderStep), the line hangs parted and is strung again after s */
export function lineCut(kit, id, s) { const z = kit.lines[id]; if (!z || z.cut > 0) return false; z.cut = s ?? LK.RESTRING; z.whip = 0.6; z.tell = 0; return true; }
/* a foe's own trolley (the Hookjack's crank-trolley rides either way): e = { line, x, dir, speed }; returns 'turn' | 'fell' | null */
export function foeRide(kit, e, dt) {
  const z = kit.lines[e.line]; if (!z || z.cut > 0) { e.off = true; return 'fell'; }
  e.dir = e.dir || z.dir; e.x = (e.x ?? (z.dir > 0 ? z.xa : z.xb)) + e.dir * (e.speed || LK.FOE_SPEED) * dt; let out = null;
  if (e.x >= z.xb - LK.END_PAD) { e.x = z.xb - LK.END_PAD; e.dir = -1; out = 'turn'; } else if (e.x <= z.xa + LK.END_PAD) { e.x = z.xa + LK.END_PAD; e.dir = 1; out = 'turn'; }
  e.y = lineY(z, e.x) + z.hang; return out;
}
export const ridersOn = (kit, bodies, id) => (bodies || []).filter(b => b && b.lk && !b.dead && (id === undefined || b.lk.id === id));
/* where a rider WILL be in t s on his line at his speed now (an archer leads him; a winch rider stops where his stroke ends) */
export function leadPoint(kit, P, t) {
  const r = P.lk; if (!r) return { x: P.x, y: P.y };
  const z = kit.lines[r.id]; let dist = r.v * t;
  if (z.kind === 'winch' && z.d.drive !== 'post') dist = Math.min(dist, r.haul + r.buf * LK.STROKE);
  const x = r.dir > 0 ? Math.min(runEnd(z), r.x + dist) : Math.max(runEnd(z), r.x - dist);
  return { x, y: lineY(z, x) + z.hang };
}
/* a hit on a rider: a held guard keeps the grip but pushes him back along the line; otherwise he is knocked off */
export function riderHit(kit, P, o = {}) {
  const r = P.lk; if (!r) return null; const z = kit.lines[r.id];
  if (o.guard) { r.x = clamp(r.x - r.dir * LK.GUARD_PUSH, z.xa + LK.END_PAD, z.xb - LK.END_PAD); P.x = r.x + r.sway; P.y = lineY(z, r.x) + z.hang; return 'guarded'; }
  P.vx = -(o.from !== undefined ? Math.sign(o.from - P.x) || r.dir : r.dir) * LK.KNOCK_VX; P.vy = LK.KNOCK_VY; letGo(P, z, true); return 'knocked';
}

/* ---------------- LINT ---------------- */
const landingsOf = L => [...(L.landings || []).map(b => ({ b, net: false })), ...(L.nets || []).map(b => ({ b, net: true }))];
function endAnchored(L, ex, ey) {   /* tiles: on a landing's span with the rope 0..5 rows over its top, or on a declared pylon */
  if (((L.lineKit || {}).anchors || []).some(([ax, ay]) => Math.abs(ax - ex) <= 1 && Math.abs(ay - ey) <= 1)) return true;
  return landingsOf(L).some(({ b }) => ex >= b[0] - 1 && ex <= b[2] + 1 && ey <= b[1] && ey >= b[1] - 5);
}
/* (claude/hlfix, Daniel 11-12: "a lot of the line connectors are floating") WHAT HOLDS EACH ROPE END. Every end of every line must sit on a drawn iron mast that reaches a deck (or hang from the deck above, or bolt to a cliff wall).
   endSupports(L, solid) -> [{ line, end: 'a'|'b', x, y (tiles), kind: 'deck'|'hang'|'wall'|'none', toY (tile row of the deck top / underside), foot (tile x the mast's base beam runs to), side, wallX, tall }]
   Order: 1 a deck under it (its span +-1, up to REACH rows down: a mast stands on it)  2 a cliff wall within 4 tiles (an arm)  3 a deck above (span +-HANG_X: a hanger from its underside)
          4 a deck beside, below (within HANG_X: a mast with a foot beam to the deck's end)  5 a deck far below at its own x (TALL rows: a tall guyed pylon).   'none' = floating: lintLines reds it.
   solid(tx, ty) is the level's own wall test (optional: without it no wall is found). Pure data: the drawing and the lint both read this. */
export const SUP = { REACH: 24, HANG_X: 6, TALL: 48 };
export function endSupports(L, solid) {
  const D = L.lineKit || {}, decks = (L.landings || []).map(b => ({ x0: b[0], x1: b[2], top: b[1] })), out = [];
  const near = (lo, hi, x) => Math.max(lo, Math.min(hi, x));
  for (const d of D.lines || []) for (const end of ['a', 'b']) {
    const [x, y] = d[end], r = { line: d.id, end, x, y, kind: 'none' }; out.push(r);
    const under = decks.filter(k => x >= k.x0 - 1 && x <= k.x1 + 1 && k.top >= y - 0.5).sort((p, q) => p.top - q.top)[0];
    if (under && under.top - y <= SUP.REACH) { Object.assign(r, { kind: 'deck', toY: under.top, foot: near(under.x0, under.x1 + 1, x) }); continue; }
    if (solid) { let w = null; for (let dx = 1; dx <= 4 && !w; dx++) for (const sd of [-1, 1]) if (solid(Math.floor(x) + (sd < 0 ? -dx : dx), Math.round(y))) { w = { side: sd, wallX: Math.floor(x) + (sd < 0 ? -dx + 1 : dx) }; break; }
      if (w) { Object.assign(r, { kind: 'wall', ...w }); continue; } }
    const above = decks.filter(k => x >= k.x0 - SUP.HANG_X && x <= k.x1 + 1 + SUP.HANG_X && k.top + 1 <= y - 0.5 && y - k.top <= SUP.REACH).sort((p, q) => q.top - p.top)[0];
    if (above) { Object.assign(r, { kind: 'hang', toY: above.top + 1, foot: near(above.x0, above.x1 + 1, x) }); continue; }
    const beside = decks.filter(k => x >= k.x0 - SUP.HANG_X && x <= k.x1 + 1 + SUP.HANG_X && k.top >= y - 0.5 && k.top - y <= SUP.REACH).sort((p, q) => p.top - q.top)[0];
    if (beside) { Object.assign(r, { kind: 'deck', toY: beside.top, foot: near(beside.x0, beside.x1 + 1, x) }); continue; }
    const far = decks.filter(k => x >= k.x0 - 1 && x <= k.x1 + 1 && k.top >= y - 0.5 && k.top - y <= SUP.TALL).sort((p, q) => p.top - q.top)[0];
    if (far) Object.assign(r, { kind: 'deck', toY: far.top, foot: near(far.x0, far.x1 + 1, x), tall: true });
  }
  return out;
}
/* the first thing under (x, y) px straight down: a landing / net top, or a hand line a falling body would touch */
export function catchBelow(L, kit, x, y, skip) {
  let best = null;
  for (const { b, net } of landingsOf(L)) { const top = px(b[1]); if (x >= px(b[0]) && x < px(b[2] + 1) && top >= y && (!best || top < best.y)) best = { kind: net ? 'net' : 'landing', y: top }; }
  for (const z of kit.list) { if (z.id === skip || z.cabLine || z.npc || z.snapX !== null || x < z.xa + 12 || x > z.xb - 12) continue;
    const ly = lineY(z, x); if (ly >= y && (!best || ly + LK.UP_HI < best.y)) best = { kind: 'line', id: z.id, y: ly + LK.UP_HI }; }
  return best;
}
export function lintLines(L) {
  const bad = [], D = L.lineKit || {}, kit = lineInit(L), ids = new Set();
  const lands = landingsOf(L);
  for (const d of D.lines || []) {
    const id = d.id || '?';
    if (!d.id) bad.push('a line has no id'); else if (ids.has(d.id)) bad.push(id + ': duplicate line id'); ids.add(d.id);
    if (!KINDS.includes(d.kind || 'free')) { bad.push(id + ': unknown kind ' + d.kind); continue; }
    const z = kit.lines[d.id]; if (!z) continue;
    if (Math.abs(d.b[0] - d.a[0]) < 2) bad.push(id + ': shorter than 2 tiles across (a line needs a run)');
    if (Math.abs(z.slope) > 1.5) bad.push(id + ': slope ' + z.slope.toFixed(2) + ' is steeper than 1.5');
    if (D.strictEnds) { for (const nm of ['a', 'b']) { const r = (D.ends || endSupports(L)).find(q => q.line === d.id && q.end === nm); if (!r || r.kind === 'none') bad.push(id + ': end ' + nm + ' (' + d[nm] + ') hangs from nothing (no deck under or beside it, no deck above to hang from, no wall: draw it a mast)'); } }   /* (claude/hlfix) every end is held by a drawn mast, hanger or wall bracket - a bare 'anchor' no longer counts */
    else for (const [nm, e] of [['a', d.a], ['b', d.b]]) if (!endAnchored(L, e[0], e[1])) bad.push(id + ': end ' + nm + ' (' + e + ') hangs from nothing (no landing under it, no anchor)');
    if (z.kind === 'winch') {
      const [hx, hy] = highEnd(z).map(v => v / TS);
      if (!lands.some(({ b, net }) => !net && hx >= b[0] - 1 && hx <= b[2] + 1 && hy <= b[1] && hy >= b[1] - 5)) bad.push(id + ': the winch\'s high end has no landing to step off onto');
      if (d.drive === 'post') { const lx = z.dir > 0 ? z.xa : z.xb, ly = lineY(z, lx) + z.hang;
        if (!kit.posts.some(p => p.line === z.id && Math.abs(p.x - lx) <= 40 && Math.abs(p.y - (ly - 12)) <= 32)) bad.push(id + ': a post winch with no post in reach of its low station'); }
      if (d.snap || d.cab) bad.push(id + ': a winch cannot snap or carry a cab (use a free line)');
    }
    for (const p of d.points || []) { const to = kit.lines[p.to], at = px(p.at);
      if (!to) { bad.push(id + ': points to a missing line ' + p.to); continue; }
      if (to.cabLine) bad.push(id + ': points onto a gondola line ' + p.to);
      if (at < z.xa + 16 || at > z.xb - 16 || at < to.xa + 16 || at > to.xb - 16) bad.push(id + ': points at ' + p.at + ' is not inside both lines');
      else if (Math.abs(lineY(z, at) - lineY(to, at)) > 6) bad.push(id + ': points at ' + p.at + ' - the lines do not meet (' + Math.abs(lineY(z, at) - lineY(to, at)).toFixed(0) + ' px apart)'); }
    if (d.cab) { const sim = simCabFall(L, d.id); if (!sim.ok) bad.push(id + ': the gondola ' + sim.why); }
    if ((d.cut || d.snap) && !d.pitOk && !d.cab) for (let x = z.xa + 16; x <= z.xb - 16; x += 16) { const c = catchBelow(L, kit, x, lineY(z, x) + z.hang, z.id);
      if (!c || c.y > kit.pitY) { bad.push(id + ': cut/snap with nothing under it at x ' + (x / TS).toFixed(1) + ' (a line, a net or a landing must catch the fall)'); break; } }
    if (d.secret) { const lx = (z.dir > 0 ? z.xb : z.xa) / TS, ly = lineY(z, z.dir > 0 ? z.xb : z.xa) / TS;
      const land = lands.find(({ b }) => lx >= b[0] - 1 && lx <= b[2] + 1 && ly <= b[1] && ly >= b[1] - 5);
      if (!land || !(L.secrets || []).some(([sx, sy]) => sx >= land.b[0] && sx <= land.b[2] && Math.abs(sy - land.b[1]) <= 2)) bad.push(id + ': a secret line whose run does not end at a landing with a secret on it'); }
  }
  for (const W of D.weights || []) { const id = W.id || '?', a = W.a, b = W.b;
    if (!(a.top < a.bot) || !(b.top < b.bot)) bad.push(id + ': a weight with no travel (top must be above bot)');
    if (a.bot - a.top !== b.bot - b.top) bad.push(id + ': A and B travel differently (' + (a.bot - a.top) + ' vs ' + (b.bot - b.top) + ' rows) - one rope');
    if (W.hopper && LK.STONE <= LK.SEATS) bad.push(id + ': the stone is not heavier than a full party');
    for (const [nm, c] of [['A', a], ['B', b]]) { const stops = [c.top, c.bot].filter(y => lands.some(({ b: L2, net }) => !net && L2[1] === y && (Math.abs(L2[0] - c.x1) <= 1 || Math.abs(L2[2] - c.x0) <= 1)));
      if (!stops.length) bad.push(id + ': cab ' + nm + ' has no landing beside it at either stop'); }
    if (W.brake === undefined && W.hopper === undefined && !W.free) bad.push(id + ': a weight with no hopper and no brake (say free: true if seats alone work it)'); }
  for (const w of D.winds || []) { const id = w.id || '?', told = w.told ?? 1.2, on = w.on ?? 2, per = w.period || 4;
    if (told < LK.MIN_TELL) bad.push(id + ': the gust is told ' + told + ' s ahead, under ' + LK.MIN_TELL);
    if (per - on < told) bad.push(id + ': the calm (' + (per - on).toFixed(1) + ' s) is shorter than its tell');
    if ((w.shove ?? 240) > LK.SHOVE_CAP) bad.push(id + ': shove ' + w.shove + ' over the cap ' + LK.SHOVE_CAP);
    const B = w.box; if (!(D.lee || []).some(l => l[0] <= B[2] + 1 && l[2] >= B[0] - 1 && l[1] <= B[3] + 1 && l[3] >= B[1] - 1)) bad.push(id + ': a wind section with no lee rock beside it (nowhere to rest)');
    const WB = boxPx(B);
    if (!w.exam) for (const z of kit.list) if (z.kind === 'winch') for (let x = z.xa; x <= z.xb; x += 8) if (inBox(WB, x, lineY(z, x))) { bad.push(id + ': winch ' + z.id + ' runs into the wind section (wind only in its own sections)'); break; } }
  for (const c of L.checkpoints || []) {
    if (!lands.some(({ b, net }) => !net && c.x >= b[0] && c.x <= b[2] && c.y === b[1])) bad.push('checkpoint ' + c.x + ',' + c.y + ' does not stand on a landing');
    const W = windAt(kit, px(c.x) + 8, px(c.y) - 8); if (W) bad.push('checkpoint ' + c.x + ',' + c.y + ' stands in the wind (put it in a lee)'); }
  if (!L.exit) bad.push('no exit'); else if (!lands.some(({ b }) => b[1] >= L.exit[1] && b[1] <= L.exit[3] + 1 && b[0] <= L.exit[2] && b[2] >= L.exit[0])) bad.push('the exit stands on no landing');
  return bad;
}
/* fly a gondola's snap-and-fall with nobody aboard: it must hook onto its `onto` line inside that line's run (and later dock) */
export function simCabFall(L, id) {
  const kit = lineInit(L), c = kit.cabs.find(q => q.home === id); if (!c) return { ok: false, why: 'has no cab' };
  const home = kit.lines[id]; if (home.snapX === null) return { ok: false, why: 'never snaps (give it snap: { at })' };
  if (!c.onto || !kit.lines[c.onto]) return { ok: false, why: 'falls onto a missing line ' + c.onto };
  c.st = 'run'; const ghost = [];
  for (let i = 0; i < 60 * 40; i++) { const ev = []; cabStep(kit, c, ghost, 1 / 60, ev);
    if (c.st === 'gone') return { ok: false, why: 'falls into the pit (its hook misses ' + c.onto + ')' };
    if (c.st === 'dock') return { ok: c.on === c.onto, why: c.on === c.onto ? '' : 'docks without falling', at: c.x }; }
  return { ok: false, why: 'never docks' };
}

/* ---------------- DRAWING (greybox: plain shapes; art owed - docs/linekit.md) ---------------- */
export function drawLines(g, kit, cx, cy, VW, VH, time) {
  for (const z of kit.list) {
    if (z.xb < cx - 40 || z.xa > cx + VW + 40) continue;
    const X0 = Math.round(z.x0 - cx), Y0 = Math.round(z.y0 - cy), X1 = Math.round(z.x1 - cx), Y1 = Math.round(z.y1 - cy);
    if (z.cut > 0) { g.strokeStyle = '#6a5a48'; g.beginPath(); g.moveTo(X0, Y0); g.lineTo(X0 + (X1 - X0) * 0.15, Y0 + 30); g.moveTo(X1, Y1); g.lineTo(X1 - (X1 - X0) * 0.15, Y1 + 30); g.stroke(); continue; }
    const shake = z.tell > 0 ? Math.sin(time * 60) : 0;
    g.strokeStyle = z.kind === 'winch' ? '#8a7a5a' : z.kind === 'glide' ? '#c9d1dc' : '#c9b27c'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(X0, Y0 + shake); g.lineTo(X1, Y1 + shake); g.stroke();
    for (const [x, y] of [[X0, Y0], [X1, Y1]]) { g.fillStyle = '#3a3a40'; g.fillRect(x - 3, y - 3, 7, 5); g.fillStyle = '#9aa0a8'; g.fillRect(x - 2, y - 2, 5, 2); }
    for (const p of z.points) { const x = Math.round(p.at - cx), y = Math.round(lineY(z, p.at) - cy); g.fillStyle = '#e8c23a'; g.fillRect(x - 3, y - 12, 7, 6); g.fillStyle = '#2a2420'; g.fillRect(x, y - 11, 1, 4); }
  }
  for (const p of kit.posts) { const x = Math.round(p.x - cx), y = Math.round(p.y - cy); g.fillStyle = p.kind === 'hopper' ? '#7a6a5a' : '#5a5f68'; g.fillRect(x - 4, y - 10, 8, 22); g.fillStyle = '#e8c23a'; g.fillRect(x - 6 + Math.round(p.swing * 3), y - 12, 12, 3); }
  for (const pl of platforms(kit)) { const x = Math.round(pl.x0 - cx), y = Math.round(pl.top - cy), w = Math.round(pl.x1 - pl.x0); g.fillStyle = pl.cab ? '#4a4038' : '#5a5f68'; g.fillRect(x, y, w, 4); g.fillStyle = '#2a2420'; g.fillRect(x + (w >> 1), y - (pl.cab ? LK.CAB_DROP : 200), 1, pl.cab ? LK.CAB_DROP : 200); }
  for (const w of kit.winds) { const s = windState(w); if (!s.blow && !s.told) continue; g.globalAlpha = s.blow ? 0.5 : 0.25 + 0.2 * Math.sin(time * 12); g.fillStyle = '#e8f0f8';
    for (let i = 0; i < 10; i++) { const x = Math.round(w.B.l + ((i * 53 + time * 120 * w.dir) % (w.B.r - w.B.l) + (w.B.r - w.B.l)) % (w.B.r - w.B.l) - cx), y = Math.round(w.B.t + (i * 37) % (w.B.b - w.B.t) - cy); g.fillRect(x, y, 6, 1); } g.globalAlpha = 1; }
}
/* THE RIDER'S TROLLEY over his hands (drawn after him) */
export function drawRider(g, kit, P, cx, cy) {
  const r = P.lk; if (!r) return; const z = kit.lines[r.id];
  const x = Math.round(r.x - cx), y = Math.round(lineY(z, r.x) - cy);
  g.fillStyle = '#2a2420'; g.fillRect(x - 3, y - 3, 7, 4); g.fillStyle = z.kind === 'winch' ? '#c9d1dc' : '#e8c23a'; g.fillRect(x - 2, y - 2, 5, 2);
  g.strokeStyle = '#5a4630'; g.beginPath(); g.moveTo(x + 0.5, y + 1); g.lineTo(x + 0.5 + r.sway, y + 4); g.stroke();
}
/* landings from a tile grid (for the greybox lane): every run of solid tiles with air over it -> [x0, top, x1, top + 1] */
export function landingsFromTiles(w, h, solid) {
  const out = [];
  for (let y = 1; y < h; y++) { let s = -1; for (let x = 0; x <= w; x++) { const ok = x < w && solid(x, y) && !solid(x, y - 1); if (ok && s < 0) s = x; if (!ok && s >= 0) { out.push([s, y, x - 1, y + 1]); s = -1; } } }
  return out;
}
export const LK_MOVE = MOVE;   /* re-exported so the node proof flies the heroes' own arc from one import */
