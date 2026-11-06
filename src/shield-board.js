/* src/shield-board.js - THE SHIELD-BOARD (claude/greatdune, 11-06; plan-desert-1105 s3f "SLIDE: slope slide + shield-board + bowl-through, built GENERIC so the
   mountain's ICE SLOPES reuse it"). Pure rules + one world step that takes a context from main.js (the src/slide.js pattern). No DOM.

   WHAT WAS ALREADY THERE (not rebuilt): the BUTT-SLIDE - hold DOWN on any slope and you go down it on your back (src/slopes.js slideStep), feet first,
   bowling weak foes and bouncing off strong ones (src/slide.js buttUpdate). It ends at the foot of the hill: it is a hill's verb.
   WHAT THIS ADDS: THE BOARD - in a BOARD ZONE (L.boardZones, a level's data) you drop onto your SHIELD and RIDE it: a road, not a hill.
     - MOUNT: in a zone, on the ground, press/hold DOWN on a slope (any speed). On the flat DOWN at a run stays the RUNNING SLIDE (src/run-slide.js) unless
       the surface sets mountFlat (then >= mount px/s). Riding, the running slide stands down (main.js RSL busy reads P.dBoardOn).
     - THE RIDE: downhill it gathers speed (acc x grade) to its top (steep/gentle); uphill the hill takes it back (up x grade), so a dune's height is
       paid for with speed - a crest you carry speed into you ride over; the flat bleeds it slowly (flat). Holding FORWARD pumps (pump, up to pumpTop).
       Holding BACK brakes. It does NOT end at the foot of a hill (the butt-slide does): it ends when the speed is gone (< end), on a hurt, an attack,
       a block, a wall, or the zone's end.
     - THE AIR: JUMP keeps the board under your feet (airFric bleeds a little); you LAND RIDING (the Mario flow). A landing on an upslope against you
       costs a share (landUp).
     - THE BOWL (boardUpdate): the board's nose is a weapon at speed, the butt-slide's own classes (src/slide.js classify): WEAK foes are bowled over
       (blow x speed), STRONG ones and minis stop you (you bounce off and lie flat - jump them, or stomp them), a BOSS takes a chip and stops you.
       PLOUGH (a power-up's: the Great Dune's SUN SCARAB) - nothing non-boss stops you, every foe you touch takes the full blow and is thrown.
   SURFACES: 'sand' (the Great Dune) and 'ice' (the mountain's ICE SLOPES, Frostfall: faster, slicker, a longer coast) - a level picks one per zone.
   USERS: src/dune-hands.js (the Great Dune) today; a mountain level sets L.boardZones = [{ x0, x1, surface: 'ice' }] and calls the same hunk in main.js.
   PROOFS: tools/great-dune.mjs (the ride on a profile, the bowl, both surfaces). */
import { slopeRise, slopeGrade } from './slopes.js';
import { classify, slideBlow, BUTT } from './slide.js';

export const BOARD = {
  sand: { acc: 760, up: 300, topSteep: 260, topGentle: 230, flat: 70, pump: 90, pumpTop: 150, brake: 420, airFric: 20, end: 46, mount: 80, landUp: 0.7 },
  ice: { acc: 820, up: 300, topSteep: 300, topGentle: 270, flat: 22, pump: 60, pumpTop: 140, brake: 260, airFric: 10, end: 36, mount: 70, landUp: 0.8 },
};
export const BOWL = { reach: 16, minSpeed: 90, ploughMul: 2, ploughKnock: 260 };
export const surfaceOf = s => BOARD[s] || BOARD.sand;

/* THE ZONE under x px (tiles in the data), or null */
export function boardZoneAt(L, xPx, TS = 16) { for (const z of (L && L.boardZones) || []) if (xPx >= z.x0 * TS && xPx < (z.x1 + 1) * TS) return z; return null; }
export const newBoard = () => ({ on: false, vx: 0, air: false, t: 0, surface: 'sand', why: '' });

/* ONE STEP. b = newBoard(); kind = the slope under the feet (0 = flat / air); dir input: move -1/0/+1.
   -> mutates b; returns the event this frame: 'mount' | 'land' | 'end' | null. b.why says why a ride ended. */
export function boardStep(b, dt, { kind = 0, ground = true, down = false, move = 0, jumped = false, vx = 0, zone = null, hurt = false, attack = false, block = false, wall = false }) {
  if (!b.on) {
    if (!zone || !ground || !down || hurt || attack || block) return null;
    const S = surfaceOf(zone.surface);
    const downhill = kind ? -slopeRise(kind) : 0;
    if (!kind && !(S.mountFlat && Math.abs(vx) >= S.mount)) return null;   /* a slope only (DOWN at a run on the flat is the RUNNING SLIDE's, src/run-slide.js); a level may allow a flat mount (mountFlat) */
    b.on = true; b.surface = zone.surface || 'sand'; b.t = 0; b.air = false; b.why = '';
    b.vx = kind && Math.abs(vx) < 30 ? downhill * 40 : vx;   /* a standing mount on a slope tips you downhill */
    return 'mount';
  }
  const S = surfaceOf(b.surface);
  const end = why => { b.on = false; b.air = false; b.why = why; return 'end'; };
  if (hurt) return end('hurt');
  if (attack) return end('attack');
  if (block) return end('block');
  if (wall) { b.vx = 0; return end('wall'); }
  if (!zone && ground) return end('zone');
  b.t += dt;
  let ev = null;
  if (!ground) { b.air = true; const sg = Math.sign(b.vx); b.vx -= sg * S.airFric * dt; if (Math.sign(b.vx) !== sg) b.vx = 0; return null; }
  if (b.air) { b.air = false; ev = 'land'; if (kind && Math.sign(b.vx) === slopeRise(kind)) b.vx *= S.landUp; }   /* landed riding; on an upslope against you it costs a share */
  const sg0 = Math.sign(b.vx) || 0;
  if (kind) {
    const g = slopeGrade(kind), downDir = -slopeRise(kind), top = g === 1 ? S.topSteep : S.topGentle;
    if (sg0 === 0 || sg0 === downDir) { const was = Math.abs(b.vx); b.vx += downDir * S.acc * g * dt; if (Math.abs(b.vx) > top) b.vx = Math.sign(b.vx) * (was <= top ? top : Math.max(top, was - 400 * dt)); }   /* the hill's top; anything faster (a scarab's glow) bleeds down to it */
    else b.vx -= sg0 * S.up * g * dt;   /* riding UP it: the dune takes the speed back */
  } else { b.vx -= sg0 * S.flat * dt; if (sg0 && Math.sign(b.vx) !== sg0) b.vx = 0; }
  const sg = Math.sign(b.vx);
  if (move && sg && move === sg && Math.abs(b.vx) < S.pumpTop) b.vx += sg * S.pump * dt;   /* lean in: the legs keep a slow ride going */
  if (move && sg && move === -sg) { b.vx -= sg * S.brake * dt; if (Math.sign(b.vx) !== sg) b.vx = 0; }   /* lean back: the brake */
  if (jumped) b.air = true;
  if (Math.abs(b.vx) < S.end) return end('slow');
  return ev;
}

/* THE BOWL: every frame the board is on and on the ground. c = { P, b, enemies, box, overlap, poiseMax, swordDmg, hurtEnemy, knockFoe, plough, SFX, sparks,
   hitstop, shakeCam, dust } -> the last hit { t, kind, blow } or null. One blow per foe per ride (P.boardHits). */
export function boardUpdate(c) {
  const { P, b } = c;
  if (!b.on) { P.boardHits = null; return null; }
  if (!P.boardHits) P.boardHits = new Set();
  const speed = Math.abs(b.vx), dir = Math.sign(b.vx) || P.face || 1;
  if (speed < BOWL.minSpeed && !c.plough) return null;
  const bb = dir > 0 ? { l: P.x - 2, r: P.x + BOWL.reach, t: P.y - (c.plough ? 16 : 10), b: P.y } : { l: P.x - BOWL.reach, r: P.x + 2, t: P.y - (c.plough ? 16 : 10), b: P.y };
  let last = null;
  for (const e of c.enemies) {
    if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || e.trainer || e.t === 'dummy' || P.boardHits.has(e) || !c.overlap(bb, c.box(e))) continue;
    P.boardHits.add(e);
    const kind = classify(e, c.poiseMax), blow = slideBlow(Math.min(speed, BUTT.topSpeed), c.swordDmg());
    last = { t: e.t, kind, blow };
    if (kind === 'boss') { c.hurtEnemy(e, Math.max(1, Math.round(blow * BUTT.chip)), P.x, false); bounceOff(c, dir); return last; }
    if (c.plough) { c.hurtEnemy(e, blow * BOWL.ploughMul, P.x, false); if (e.alive) { c.knockFoe(e, dir, BOWL.ploughKnock); e.stagger = Math.max(e.stagger || 0, 1.2); } c.sparks && c.sparks(e.x, e.y - 6, dir, 6); c.hitstop && c.hitstop(0.02); continue; }
    if (kind === 'strong') { c.hurtEnemy(e, Math.max(1, Math.round(blow * BUTT.strongShare)), P.x, false); bounceOff(c, dir); return last; }
    c.hurtEnemy(e, blow, P.x, false);
    if (e.alive) { c.knockFoe(e, dir, 160 + speed * 0.5); e.stagger = Math.max(e.stagger || 0, 1.0); e.vx = 0; }
    c.SFX && c.SFX.thud && c.SFX.thud(); c.sparks && c.sparks(e.x, e.y - 6, dir, 4); c.hitstop && c.hitstop(0.03); b.vx *= 0.94;
  }
  return last;
}
function bounceOff(c, dir) {
  const { P, b } = c;
  b.on = false; b.air = false; b.why = 'bounce'; b.vx = 0;
  P.vx = -dir * BUTT.bounceVx; P.vy = BUTT.bounceVy; P.ground = false; P.flatT = BUTT.flatT; P.face = dir;
  c.SFX && c.SFX.slideHit && c.SFX.slideHit(); c.shakeCam && c.shakeCam(3, -dir * 2); c.hitstop && c.hitstop(0.06); c.dust && c.dust(P.x, P.y, 5);
}

/* A RIDE ON A PROFILE (for the tools and the level lint): a kinematic rider over a column profile [{ kind, top }] (kind 0 = flat; top = the surface row),
   holding DOWN from x0 (px) with `move` held, never jumping. -> { x, stoppedAt, maxV, t, log } - where the board stops (a dune too high for the speed, or the
   flat). It reads the same boardStep as the game, so a number tuned here is the number played. */
export function rideProfile(prof, x0, { TS = 16, surface = 'sand', move = 1, dt = 1 / 120, tMax = 60, vx0 = 0, zoneEnd = Infinity } = {}) {
  const b = newBoard(); let x = x0, maxV = 0, t = 0; const zone = { surface };
  const kindAt = px => { const c = prof[Math.floor(px / TS)]; return c ? c.kind : 0; };
  let ev = boardStep(b, dt, { kind: kindAt(x) || 0, ground: true, down: true, move, vx: vx0 || (kindAt(x) ? 0 : 100), zone });
  if (!b.on) return { x, stoppedAt: x, maxV: 0, t: 0, mounted: false };
  while (t < tMax && b.on) {
    const k = kindAt(x); ev = boardStep(b, dt, { kind: k, ground: true, down: true, move, zone: x < zoneEnd * TS ? zone : null });
    const g = k ? slopeGrade(k) : 0; x += b.vx * dt / Math.sqrt(1 + g * g) * (k ? 1 : 1); t += dt; maxV = Math.max(maxV, Math.abs(b.vx));
    if (x < 0 || x >= prof.length * TS) break;
  }
  return { x, stoppedAt: x, maxV, t, mounted: true, why: b.why };
}
