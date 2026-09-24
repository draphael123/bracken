// winchmaster.js — THE WINCHMASTER, the Ore Road's boss. REWORKED 2026-09-25 to docs/briefs/ore-road-rework.md section 6,
// approved as written (section 10). The level is src/ore-road.js; the arena's housings, ledges and lines are OR.ARENA there.
//
// WHY IT WAS REWORKED, IN DANIEL'S WORDS: "The boss is terrible. He's 1) hard to hit due to the platform, 2) does basically
// nothing. He needs at least 3-4 attacks." The old fight had one corner, one line, and a rotation of three jobs, two of which
// (cut a span, send a bucket) were the room hurting you while he stood still. So this is a new fight on his old sprite:
//
// THREE HOUSINGS, AND HE GOES ROUND THEM (brief: "he jumps away, process repeats"). A drum house at each end of the arena's
// two lines: THE GREAT DRUM (east, low: the low line runs into it), THE HEAD FRAME (west, high) and THE TAIL WHEEL (east of
// middle, high) - the high line runs into whichever of those two he is standing on. No jump reaches any housing. He goes
// A -> B -> C -> A: every time you knock him off one, he takes the cable and swings to the next, so the fight is a circuit you
// chase him round and not a man backed into a wall. Each housing is reached a different way (ride the low line in from the
// deck; climb to the tail wheel's ledge and ride the high line west; ride it east from the head frame's ledge).
//
// FOUR TOLD ATTACKS (A1), every one of them a winchman's job, every one in windingUp() (its mode ends in Tell: A2):
//   SEND           !!  a loaded bucket let go down the line he stands on, at speed, from his drum outward. It takes anyone at
//                      the line's height and no shield turns a ton of ore: be in the air as it comes, or off the line
//   THE HOOK       !!  a grapple on a chain, thrown where you are GOING (it leads you). It drags you off whatever you stand on,
//                      toward him and down into the gorge: a fall costs a climb. Jump as it comes, or change pace
//   THE BRAKE BAR   !  the iron bar brought down across the drum's mouth, on whoever is at it - the rider coming in or anyone on
//                      his ledge. THE ONE BLOW A SHIELD TURNS: shield it and you ride on in (every boss needs exactly one)
//   REVERSE        ''  he throws the drum into reverse and the line runs the wrong way, faster, carrying a rider back out.
//                      No blow, so no mark (the QUIET list); you fight the current or you step off
// THE OPENING IS CAUSED (A11): RIDE A LOADED BUCKET INTO HIS DRUM. It jams, the cable locks and he is thrown off the housing
// onto its ledge - DOWNED, and he takes double. A bucket you jumped on at the drum's mouth has no weight behind it and does not
// jam: it has to come in from WINCH.rideIn px out. (A drum line's skips cannot be tipped: an emptied one would ride high enough
// to put a jump onto a housing, and every one of them is loaded - main.js updateBucket.)
// ROUND TWO (Daniel played it, 2026-09-25, and every change here is his, approved):
//   HIS HOUSING IS REACHABLE: a ladder from each ledge up onto its housing, and you fight him there - the brake bar sweeps
//     the housing top (the blow a shield turns) and the hook yanks you off its edge into the gorge.
//   HE RETREATS: every time he loses a QUARTER of his health on a housing (WINCH.retreat), he takes the cable and swings on to
//     the next one, told, and you chase him - three or four times a fight.
//   THE JAM STAYS AS A BONUS: ride a loaded skip into his drum and he goes down for the double-damage window as before; it is
//     no longer the only way to hurt him.
//   THE DRUMS SHAKE ROCK LOOSE: every WINCH.rockEvery s a rock is shaken off the roof over where you stand, TOLD (a second of
//     dust and a ring where it lands, only ever on your screen), and it falls.
// ROUND THREE (Daniel, 2026-09-24, approved): HE IS BIGGER (drawn at WINCH.scale, his box with it), and ENRAGED HE LEAPS.
// PHASE TWO (A10), one sentence: AT HALF HEALTH HE WILL NOT STAY ON ONE HOUSING - every WINCH.leapEvery seconds he crouches and
// LEAPS to another (a red ring tells you where he will land, and the landing hurts), while every line runs a quarter faster,
// he lets two buckets go at a time, and the drums shake rock off the roof twice as often.
// THREE LAYERS AT ONCE (DESIGN.md): the lines keep delivering buckets, he attacks, and the roof comes down on its own clock.
// Touching him never hurts (the touch rule).
//
// PURE: no DOM, no main.js. Everything the world does is a call on `c`. Proved by tools/ore-road.mjs "THE WINCHMASTER".
import { OR } from './ore-road.js';   /* the bucket he sends is the road's own bucket: one width, so what hurts is what is drawn (C1) */
export const WINCH = {
  hp: 600, pace: 22,
  /* ROUND THREE: drawn 1.3x (main.js bigF; his box grows with it) - hand is where the hook leaves him, at that size */
  scale: 1.3, hand: 34,
  tell: { reverse: 0.45, send: 0.8, hook: 0.7, lever: 0.55, letgo: 0.7, leap: 0.9 },
  /* THE LEAP (phase two only): told leapTell s with a crouch and a red ring on the housing he will land on, in the air leapT s,
     and whoever is within leapHit of where he lands is hurt and thrown off */
  leapEvery: 5.5, leapT: 0.8, leapHit: 30,
  cd: 1.4, cdP2: 1.0,
  /* THE REVERSE. He throws it only at a rider inside revRange of his drum, and it carries that rider back revT x revMul of the
     line's speed. It cools revCd from the moment it is thrown - LONGER than the ride in from where it leaves you, because the
     opening has to be there for a player who baits it (the old fight's lab measured the alternative: reversed a tile short of
     the drum, forever). Low line: 440 px at 60 px/s, 7.3 s; the reverse leaves you at most ~425 px out, 9.5 s of cooldown left. */
  revT: 2.5, revMul: 1.5, revCd: 12.0, revCdP2: 10.0, revRange: 200,
  /* SEND: sendR IS HALF A BUCKET - a thing that hurts is the size it looks (C1) */
  sendV: 300, sendCd: 5.0, sendCdP2: 3.6, sendR: OR.BUCKET.w / 2, sendH: 14,
  /* AND NEVER AT A RIDER WHO WILL BE AT THE MOUTH WHEN IT IS LET GO: begun at 80 px, a 0.8 s tell brought a rider to 32 px and the
     bucket started on top of them - a blow with no answer (the lab took it every jam). So a rider must be sendMin px out when
     it is begun: two bucket-widths, and the tell's worth of the fastest line in phase two */
  sendMin: OR.BUCKET.w + 0.8 * 60 * 1.25,
  /* THE HOOK: thrown at where you will be hookLead s from now, it flies hookV px/s to hookR and comes back; hookHit is the
     radius of the iron. It is thrown at anyone inside hookR - which the room has at every housing (A12, tools/ore-road.mjs) */
  hookV: 300, hookR: 250, hookLead: 0.35, hookHit: 11, hookCd: 4.5, hookCdP2: 3.4,
  /* THE BRAKE BAR: begun on anyone within leverReach of the drum's mouth (a rider coming in at 60 px/s is ~33 px nearer when it
     lands), and it lands on anyone within leverHit */
  leverCd: 2.2, leverReach: 72, leverHit: 48,
  /* THE OPENING, and the circuit */
  rideIn: 64, thrownT: 0.7, downT: 4.5, downMul: 2, swingT: 1.1,
  p2Mul: 1.25,
  /* ROUND TWO: a quarter of his health lost on one housing and he retreats to the next; he walks at you on his own housing
     (walk), and the roof: a told rock every rockEvery s (half that in phase two), rockTell of warning */
  retreat: 0.25, walk: 34, rockEvery: 7, rockEveryP2: 3.5, rockTell: 1.0,
  dmg: { send: 28, hook: 18, lever: 26, leap: 24 },
};
const SAY = { reverseTell: 'HE THROWS THE BRAKE', sendTell: 'HE SENDS ONE DOWN', hookTell: 'THE HOOK', leverTell: 'THE BRAKE BAR', leapTell: 'HE CROUCHES TO LEAP' };
const RED = new Set(['sendTell', 'hookTell', 'leapTell']);
export const winchOpen = e => e.mode === 'downed';
export const winchTake = e => winchOpen(e) ? WINCH.downMul : 1;
export const winchNext = at => (at + 1) % 3;
/* the frames of bakeWinchmaster (his 13-frame sheet, reused as it is - brief section 8: a FIGHT rework, not an art job):
   0 idle | 1,2 pace | 3 bar up | 4 bar down | 5 hauling the brake | 6 boot on the release | 7 arm back (THE HOOK, wound up)
   | 8 arm through (THE HOOK, thrown) | 9 thrown | 10 downed | 11 hauling up (on the cable: letgo and the swing) | 12 hurt */
export function winchFrame(e) {
  switch (e.mode) {
    case 'leverTell': return 3; case 'lever': return 4;
    case 'reverseTell': case 'reverse': return 5;
    case 'sendTell': case 'send': return 6;
    case 'hookTell': return 7; case 'hook': return 8;
    case 'thrown': return 9; case 'downed': return 10; case 'letgo': case 'swing': case 'leap': return 11;
    case 'leapTell': return 5;   /* the crouch: both hands down on the brake, his weight sunk */
    case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 12;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 5) % 2 : 0;
}
const mulOf = e => e.phase === 2 ? WINCH.p2Mul : 1;
function begin(e, what, c) {
  e.mode = what + 'Tell'; e.modeT = WINCH.tell[what];
  e.face = Math.sign(c.P.x - e.x) || e.face || -1;
  c.say(SAY[e.mode], RED.has(e.mode), what === 'reverse');
}
/* ARRIVING AT A HOUSING: his drum is the one he drives. The NEXT housing's line is driven toward it first (so from the Great
   Drum the high line already runs toward the Head Frame, and you can be on it before he lands), then his own, which wins
   when the two share a line */
function arrive(e, c, at) {
  const H = c.H[at]; e.at = at; e.x = H.homeX; e.y = H.topY; e.vx = 0; e.mode = 'stalk'; e.cd = 0.9; e.revT = 0;
  e.qMark = e.hp;   /* the quarter he retreats on is counted from here */
  e.leapCd = WINCH.leapEvery;
  /* the LOW line runs into the Great Drum while he is on it or bound for it, and back to the deck otherwise (round three: the room's
     floor is the pit, so a hero set down on the Great Drum's ledge rides home on it instead of dropping into the spikes) */
  c.drive(0, (at === 0 || winchNext(at) === 0) ? 1 : -1, mulOf(e));
  c.drive(winchNext(at), 1, mulOf(e)); c.drive(at, 1, mulOf(e));
}
/* THE JAM: main.js calls this the frame a LOADED bucket, with a rider who boarded it at least WINCH.rideIn px out, reaches the
   drum of the housing he stands on. The cable locks (the world's job) and he goes off the housing. Returns true if it took him */
export function winchJam(e, c) {
  if (!e || !e.alive || e.mode === 'thrown' || e.mode === 'downed' || e.mode === 'letgo' || e.mode === 'swing' || e.mode === 'leap' || e.mode === 'sleep' || e.mode === 'wake') return false;
  const H = c.H[e.at];
  e.mode = 'thrown'; e.modeT = WINCH.thrownT; e.fromY = e.y; e.fromX = e.x; e.toX = H.ledgeX; e.toY = H.ledgeY; e.vx = 0; e.revT = 0; e.hk = null;
  /* a jammed drum lets nothing go: a bucket still waiting to be sent is not sent (one already on the line goes on) */
  for (let r = e.runaway, prev = null; r; r = r.next) { if (r.delay > 0) { if (prev) prev.next = null; else e.runaway = null; break; } prev = r; }
  c.say('THE DRUM JAMS: HE GOES OFF THE HOUSING', false, true); c.sound('crash'); c.shake(7);
  return true;
}
/* THE CIRCUIT: off whatever he stands on and onto the cable, to the next housing. He is not open while he does it (the window
   was the downed one), and it is short (A5) */
function letGo(e, c, why) {
  e.mode = 'letgo'; e.modeT = WINCH.tell.letgo; e.open = 0;
  c.say(why || 'HE TAKES THE CABLE', false); c.sound('clank');
}
export function updateWinchmaster(e, dt, c) {
  const { P } = c;
  if (!e.alive || e.mode === 'sleep') return;
  if (e.at === undefined) e.at = 0;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt;
  for (const k of ['revCd', 'sendCd', 'hookCd', 'leverCd', 'leapCd']) e[k] = Math.max(0, (e[k] ?? 0) - dt);
  const H = c.H[e.at];
  if (e.hp <= e.maxHp * 0.5 && e.phase !== 2) { e.phase = 2; e.rockT = Math.min(e.rockT ?? 0, 1.5);
    c.say('HE DRIVES THE DRUMS HARDER', true); c.sound('roar'); c.shake(4); if (e.mode === 'stalk') { c.drive(winchNext(e.at), 1, WINCH.p2Mul); c.drive(e.at, 1, WINCH.p2Mul); } }
  /* THE ROOF: the drums shake a rock loose over where you stand, on their own clock. It is told for WINCH.rockTell - dust off the
     roof and a ring where it lands - and only ever begun on your screen (c.rockSpot answers null otherwise, and the clock waits) */
  if (e.mode !== 'wake' && !P.dead) { e.rockT = (e.rockT ?? WINCH.rockEvery * 0.6) - dt;
    if (e.rockT <= 0) { const sp = c.rockSpot(P.x + (c.rand() - 0.5) * 60); if (sp) { (e.rocks || (e.rocks = [])).push({ x: sp.x, y0: sp.y0, gy: sp.gy, t: WINCH.rockTell }); c.sound('crack'); e.rockT = e.phase === 2 ? WINCH.rockEveryP2 : WINCH.rockEvery; } else e.rockT = 0.3; } }
  for (const r of (e.rocks || [])) { r.t -= dt; if (r.t <= 0 && !r.done) { r.done = true; c.dropRock(r.x, r.y0); } }
  if (e.rocks) e.rocks = e.rocks.filter(r => !r.done);
  /* THE REVERSE runs out on its own clock, whatever he is doing */
  if (e.revT > 0) { e.revT -= dt; if (e.revT <= 0) c.drive(e.revAt ?? e.at, 1, mulOf(e)); }
  /* THE RUNAWAY BUCKET, once let go, goes down its line whatever becomes of him */
  if (e.runaway) { const r = e.runaway;
    /* the second bucket of a phase-two SEND is let go half a second after the first - and not at all if the rider has reached
       the mouth by then: it would start on top of them (the lab took it at every jam in phase two) */
    if (r.delay > 0) { r.delay -= dt; if (r.delay <= 0 && c.atMouth(r.at, WINCH.sendR * 2 + 8)) e.runaway = r.next || null; }
    else { r.s += WINCH.sendV * dt;
      const R = c.H[r.at], x = R.drumX + R.away * r.s, ly = c.lineY(r.at, x);
      if (ly === null) { c.crash(x, R.mouthY); e.runaway = r.next || null; }
      else if (!r.hit && !P.dead && Math.abs(P.x - x) < WINCH.sendR && Math.abs(P.y - ly) < WINCH.sendH) { r.hit = true;
        const res = c.hit(x, WINCH.dmg.send, true, 'A LOADED BUCKET'); if (res === 'hit') c.shove(R.away * 190, -200); } } }
  /* THE HOOK in flight: out to its reach and back on its chain. It catches once */
  if (e.hk) { const k = e.hk; k.t += dt;
    if (k.st === 'out') { k.x += k.vx * dt; k.y += k.vy * dt; const d = Math.hypot(k.x - k.x0, k.y - k.y0); if (d > WINCH.hookR || (d > 40 && c.solidAt(k.x, k.y))) k.st = 'back'; }   /* (clear of his own housing's lip first: he throws from its top) */
    else { const dx = e.x - k.x, dy = (e.y - WINCH.hand) - k.y, d = Math.hypot(dx, dy); if (d < 10 || k.t > 3) e.hk = null; else { k.x += dx / d * WINCH.hookV * 1.3 * dt; k.y += dy / d * WINCH.hookV * 1.3 * dt; } }
    if (e.hk && k.st === 'out' && !k.caught && !P.dead && Math.hypot(P.x - k.x, (P.y - 9) - k.y) < WINCH.hookHit + 5) { k.caught = true; k.st = 'back';
      /* it drags you TOWARD THE DROP: off a line or a ledge toward him, and off his own housing out over its edge */
      const res = c.hit(k.x, WINCH.dmg.hook, true, 'THE HOOK'); if (res === 'hit') { c.drag(c.onHousing(e.at) ? H.away : (Math.sign(e.x - P.x) || 1)); c.say('HOOKED', true); } } }
  if (e.mode === 'wake') { e.y = H.topY; if (e.modeT <= 0) { arrive(e, c, e.at); e.cd = 1.0; } return; }
  // ---- THE OPENING, and the circuit ----
  if (e.mode === 'thrown') { const k = 1 - Math.max(0, e.modeT) / WINCH.thrownT;   /* an arc off the housing onto its own ledge */
    e.x = e.fromX + (e.toX - e.fromX) * k; e.y = e.fromY + (e.toY - e.fromY) * k - Math.sin(k * Math.PI) * 24;
    if (e.modeT <= 0) { e.mode = 'downed'; e.modeT = WINCH.downT; e.x = e.toX; e.y = e.toY; c.shake(4); c.sound('thud'); } return; }
  if (e.mode === 'downed') { e.vx = 0; e.open = Math.max(0, e.modeT); if (e.modeT <= 0) letGo(e, c, 'HE CUTS LOOSE AND TAKES THE CABLE'); return; }
  e.open = 0;
  if (e.mode === 'letgo') { if (e.modeT <= 0) { const N = c.H[winchNext(e.at)]; e.mode = 'swing'; e.modeT = WINCH.swingT; e.fromX = e.x; e.fromY = e.y; e.toX = N.homeX; e.toY = N.topY; e.face = Math.sign(N.homeX - e.x) || e.face; c.sound('whoosh'); } return; }
  /* THE LEAP: a high arc over the room onto the housing the ring was on, and the landing hurts whoever is under it */
  if (e.mode === 'leap') { const k = 1 - Math.max(0, e.modeT) / WINCH.leapT;
    e.x = e.fromX + (e.toX - e.fromX) * k; e.y = e.fromY + (e.toY - e.fromY) * k - Math.sin(k * Math.PI) * 70;
    if (e.modeT <= 0) { const to = e.leapTo; arrive(e, c, to); c.shake(6); c.sound('crash'); c.say('HE LANDS', true);
      if (!P.dead && c.onHousing(to) && Math.abs(P.x - e.x) < WINCH.leapHit) { const r = c.hit(e.x, WINCH.dmg.leap, true, 'HIS LANDING'); if (r === 'hit') c.shove((Math.sign(P.x - e.x) || 1) * 200, -180); } }
    return; }
  if (e.mode === 'swing') { const k = 1 - Math.max(0, e.modeT) / WINCH.swingT;   /* on the cable, a swing and not a walk: it dips and comes up */
    e.x = e.fromX + (e.toX - e.fromX) * k; e.y = e.fromY + (e.toY - e.fromY) * k + Math.sin(k * Math.PI) * 30;
    if (e.modeT <= 0) { arrive(e, c, winchNext(e.at)); c.shake(3); c.sound('thud'); c.say(c.H[e.at].name, false); } return; }
  e.y = H.topY;
  // ---- the windups ----
  if (e.mode.endsWith('Tell')) {
    if (e.modeT > 0) return;
    if (e.mode === 'reverseTell') { e.mode = 'reverse'; e.modeT = 0.4; e.revT = WINCH.revT; e.revAt = e.at; e.revCd = e.phase === 2 ? WINCH.revCdP2 : WINCH.revCd;
      c.drive(e.at, -1, WINCH.revMul * mulOf(e)); c.sound('clank'); c.shake(3); return; }
    if (e.mode === 'sendTell') { e.mode = 'send'; e.modeT = 0.4; e.sendCd = e.phase === 2 ? WINCH.sendCdP2 : WINCH.sendCd; c.sound('heavy');
      e.runaway = { at: e.at, s: 0, delay: 0, next: e.phase === 2 ? { at: e.at, s: 0, delay: 0.5 } : null }; return; }
    if (e.mode === 'hookTell') { e.mode = 'hook'; e.modeT = 0.45; e.hookCd = e.phase === 2 ? WINCH.hookCdP2 : WINCH.hookCd; c.sound('whoosh');
      /* it leads you ALONG, never UP: a lead on your vertical speed followed a jump into the air and made the jump no answer at all
         (the lab: 0 wins in 24, every one of them hooked out of a jump) */
      const x0 = e.x + e.face * 10, y0 = e.y - WINCH.hand, v = c.pVel(), tx = P.x + v[0] * WINCH.hookLead, ty = P.y - 9;
      const d = Math.hypot(tx - x0, ty - y0) || 1; e.hk = { x: x0, y: y0, x0, y0, vx: (tx - x0) / d * WINCH.hookV, vy: (ty - y0) / d * WINCH.hookV, st: 'out', t: 0, caught: false }; return; }
    if (e.mode === 'leapTell') { const N = c.H[e.leapTo]; e.mode = 'leap'; e.modeT = WINCH.leapT; e.fromX = e.x; e.fromY = e.y; e.toX = N.homeX; e.toY = N.topY;
      e.face = Math.sign(N.homeX - e.x) || e.face; c.sound('whoosh'); return; }
    if (e.mode === 'leverTell') { e.mode = 'lever'; e.modeT = 0.35; e.leverCd = WINCH.leverCd; c.sound('whoosh'); c.shake(2);
      /* the bar sweeps the drum's mouth AND his own housing top: whoever came up after him gets it too, and it throws them off
         the edge toward the gorge. It is still the one blow a shield turns */
      if (!P.dead && (c.atMouth(e.at, WINCH.leverHit) || (c.onHousing(e.at) && Math.abs(P.x - e.x) < WINCH.leverHit))) { const r = c.hit(e.x, WINCH.dmg.lever, false, 'THE BRAKE BAR'); if (r === 'hit') c.shove(H.away * 200, -160); }
      return; }
  }
  if (e.mode === 'reverse' || e.mode === 'send' || e.mode === 'hook' || e.mode === 'lever') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? WINCH.cdP2 : WINCH.cd; } return; }
  /* HE RETREATS: a quarter of his health lost on this housing and he takes the cable to the next, told (A5: it is short) */
  if (e.qMark !== undefined && e.qMark - e.hp >= e.maxHp * WINCH.retreat) { letGo(e, c, 'HE RETREATS: HE TAKES THE CABLE'); return; }
  // ---- ON THE HOUSING: he paces by his drum and watches the line - or, with you up on it with him, comes at you ----
  const up = c.onHousing(e.at), sp = up ? WINCH.walk : WINCH.pace;
  const want = up ? (Math.abs(P.x - e.x) > 20 ? Math.sign(P.x - e.x) : 0) : Math.abs(e.x - H.homeX) > 14 ? Math.sign(H.homeX - e.x) : (Math.sin(e.anim * 0.7) > 0.6 ? H.away : 0);
  e.x = Math.max(H.px0 + 10, Math.min(H.px1 - 10, e.x + want * sp * dt)); e.vx = want * sp; e.face = Math.sign(P.x - e.x) || e.face;
  if (P.dead) return;
  /* A TELL YOU CANNOT SEE IS NOT TOLD (A1). The game's camera follows the hero, and from most of the low line the Great Drum is
     off the right of the screen: measured in the page (work/claude/winch-seen.mjs), 96% of his SEND wind-ups and 63% of his
     REVERSEs there were begun off screen. So he begins nothing while he is not on your screen - what he does is what he sees,
     and what he sees can see him. The sent bucket and the reverse, once begun, go on as before */
  if (!c.seen()) { e.cd = Math.max(e.cd, 0.25); return; }
  /* THE BRAKE BAR GUARDS THE MOUTH, and it does not wait for his last job to cool: whoever reaches the drum's mouth gets the bar
     if the bar is ready. It is the drum's own defence and the one blow the shield answers - a rider who shields it rides on in */
  if ((c.atMouth(e.at, WINCH.leverReach) || (up && Math.abs(P.x - e.x) < WINCH.leverHit + 10)) && e.leverCd <= 0) { begin(e, 'lever', c); return; }
  if (e.cd > 0) return;
  /* ENRAGED, HE LEAPS (A10): every leapEvery s, to the housing you are up on if it is not his, or else the next one. Told: the
     crouch, HE CROUCHES TO LEAP in red, and a red ring on the housing he will land on */
  if (e.phase === 2 && e.leapCd <= 0) { let to = [0, 1, 2].find(i => i !== e.at && c.onHousing(i)); if (to === undefined) to = winchNext(e.at);
    e.leapTo = to; begin(e, 'leap', c); return; }
  /* WHAT HE DOES IS WHAT HE SEES. A rider coming at him inside revRange is reversed; otherwise a rider on his line gets a bucket
     sent down it or the hook, whichever he did NOT do last (a rotation, so neither starves the other). Never a SEND at someone
     already at the mouth: the bucket would start inside them, a blow with no answer, and the bar is for the mouth */
  const riding = c.riding(e.at), atMouth = c.atMouth(e.at, WINCH.leverReach);
  if (riding && riding.coming && riding.dist < WINCH.revRange && e.revCd <= 0 && !(e.revT > 0)) { begin(e, 'reverse', c); return; }
  const can = [];
  /* A MAN ON A LADDER IS LEFT TO CLIMB (round two): the climb up to him is the crossing, and the fight is at the top - he neither
     hooks nor sends at a climber (the bar still sweeps the mouth, and a climber passes it) */
  const climbing = c.climbing();
  if (((riding && riding.dist > WINCH.sendMin) || c.onLine(e.at)) && !climbing && !atMouth && e.sendCd <= 0 && !e.runaway) can.push('send');
  const hd = Math.hypot(P.x - e.x, (P.y - 9) - (e.y - WINCH.hand));   /* inside the bar's reach it is the bar: a hook from arm's length is on you before it can be read */
  if (!e.hk && !climbing && e.hookCd <= 0 && hd < WINCH.hookR * 0.9 && hd > WINCH.leverHit + 12) can.push('hook');
  const pick = can.length > 1 ? can.find(k => k !== e.last) : can[0];
  if (pick) { e.last = pick; begin(e, pick, c); return; }
  if (e.sendCd <= 0 && !e.runaway && !atMouth && !climbing && !(riding && riding.dist <= WINCH.sendMin) && c.rand() < 0.4) { e.last = 'send'; begin(e, 'send', c); return; }
  e.cd = 0.4;
}
/* THE LOOK OF THE FIGHT, rects only (so work/claude/winch-art.mjs can render it in Node): the runaway bucket, the red line under a
   SEND, the chain and the hook, the bar's arc over the mouth, the line's arrows while it runs backwards, and the ring under
   him while he is down */
export function drawWinchFx(g, e, c, cx, cy, time) {
  if (!e?.alive) return;
  const hw = OR.BUCKET.w / 2;
  for (let q = e.runaway; q; q = q.next) { if (q.delay > 0) continue; const R = c.H[q.at], bx = R.drumX + R.away * q.s, ly = c.lineY(q.at, bx); if (ly === null) continue; const x = Math.round(bx - cx), y = Math.round(ly - cy);
    g.fillStyle = '#2a2a30'; g.fillRect(x - hw - 1, y - 1, hw * 2 + 2, 13); g.fillStyle = '#6a6a74'; g.fillRect(x - hw, y, hw * 2, 10); g.fillStyle = '#b09a5a'; g.fillRect(x - hw + 3, y - 3, hw * 2 - 6, 3);
    g.fillStyle = '#2a2a30'; g.fillRect(x - 1, y - 30, 2, 29);
    g.globalAlpha = 0.5; g.fillStyle = '#fff0d0'; for (let k = 1; k < 5; k++) g.fillRect(x - R.away * (hw + k * 6) - 2, y + 2 + k, 4, 1); g.globalAlpha = 1; }
  const H = c.H[e.at];
  if (e.mode === 'sendTell' && H) { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.send; g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = '#ff6b6b';
    for (let s = 0; s < 600; s += 6) { const x = H.drumX + H.away * s, ly = c.lineY(e.at, x); if (ly === null) break; g.fillRect(Math.round(x - cx), Math.round(ly - cy) - 2, 3, 2); } g.globalAlpha = 1; }
  if (e.mode === 'hookTell') { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.hook, a = e.anim * 18, hx = Math.round(e.x - cx - e.face * 6 + Math.cos(a) * 9), hy = Math.round(e.y - 34 - cy + Math.sin(a) * 5);
    g.fillStyle = '#6a6a74'; for (let t = 0; t <= 1; t += 0.2) g.fillRect(Math.round(e.x - cx + (hx - (e.x - cx)) * t), Math.round(e.y - WINCH.hand - cy + (hy - (e.y - WINCH.hand - cy)) * t), 2, 2);
    g.fillStyle = k > 0.6 && Math.floor(time * 20) % 2 ? '#ff6b6b' : '#c8ccd4'; g.fillRect(hx - 2, hy - 2, 5, 5); }
  if (e.hk) { const k = e.hk, x0 = e.x + e.face * 10 - cx, y0 = e.y - WINCH.hand - cy, x1 = k.x - cx, y1 = k.y - cy, n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 4));
    g.fillStyle = '#4a4a52'; for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 2, 2);
    g.fillStyle = '#c8ccd4'; g.fillRect(Math.round(x1) - 3, Math.round(y1) - 3, 6, 6); g.fillStyle = '#2a2a30'; g.fillRect(Math.round(x1) - 1, Math.round(y1) - 1, 2, 2);
    g.fillStyle = '#c8ccd4'; g.fillRect(Math.round(x1) - 5, Math.round(y1) + 1, 2, 3); g.fillRect(Math.round(x1) + 3, Math.round(y1) + 1, 2, 3); }
  if (e.mode === 'leverTell' && H) { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.lever; g.globalAlpha = 0.25 + 0.55 * k; g.fillStyle = '#ffd36b';
    for (let s = 0; s < WINCH.leverHit; s += 4) g.fillRect(Math.round(H.drumX + H.away * s - cx), Math.round(H.mouthY - cy) - 20 - Math.round(Math.sin(s / WINCH.leverHit * Math.PI) * 8), 3, 2); g.globalAlpha = 1; }
  if (e.revT > 0) { const R = c.H[e.revAt ?? e.at]; g.globalAlpha = 0.5; g.fillStyle = '#ffd36b'; const ph = (time * 60) % 24;
    for (let s = ph; s < 600; s += 24) { const x = R.drumX + R.away * s, ly = c.lineY(e.revAt ?? e.at, x); if (ly === null) break; const X = Math.round(x - cx), Y = Math.round(ly - cy) - 40; g.fillRect(X, Y, 5, 1); g.fillRect(X + (R.away > 0 ? 4 : 0), Y - 1, 1, 3); } g.globalAlpha = 1; }
  /* THE LEAP, told: a red ring on the housing he will land on, tightening as he crouches, and held while he is in the air */
  if ((e.mode === 'leapTell' || e.mode === 'leap') && e.leapTo !== undefined && c.H[e.leapTo]) { const N = c.H[e.leapTo], k = e.mode === 'leap' ? 1 : 1 - Math.max(0, e.modeT) / WINCH.tell.leap;
    const x = Math.round(N.homeX - cx), y = Math.round(N.topY - cy), w = Math.round(WINCH.leapHit - k * 8), a = 0.4 + 0.5 * k * (0.6 + 0.4 * Math.sin(time * 30));
    g.globalAlpha = a; g.fillStyle = '#ff6b6b'; g.fillRect(x - w, y - 2, w * 2, 2); g.fillRect(x - w + 3, y + 1, w * 2 - 6, 1); g.fillRect(x - w, y - 5, 2, 4); g.fillRect(x + w - 2, y - 5, 2, 4);
    for (let j = 0; j < 3; j++) g.fillRect(x - 1, y - 18 - j * 7 + Math.round(k * 6), 2, 4); g.globalAlpha = 1; }
  /* THE ROOF'S ROCK, told: dust off the roof over the spot, and a red ring where it will land, tightening */
  for (const r of (e.rocks || [])) { const k = 1 - Math.max(0, r.t) / WINCH.rockTell, x = Math.round(r.x - cx), gy = Math.round(r.gy - cy), y0 = Math.round(r.y0 - cy);
    g.fillStyle = '#b8a890'; for (let j = 0; j < 4; j++) { const ph = (time * 90 + j * 23) % 40; g.globalAlpha = 0.6 * (1 - ph / 40); g.fillRect(x - 3 + ((j * 5) % 7), y0 + Math.round(ph), 1, 2); }
    g.globalAlpha = 0.35 + 0.55 * k; g.fillStyle = '#ff6b4a'; const w = Math.round(12 - k * 4); g.fillRect(x - w, gy - 2, w * 2, 1); g.fillRect(x - w + 2, gy, w * 2 - 4, 1); g.fillRect(x - w, gy - 2, 1, 2); g.fillRect(x + w - 1, gy - 2, 1, 2); g.globalAlpha = 1; }
  if (e.mode === 'downed') { const k = 0.5 + 0.5 * Math.sin(time * 10), w = 26 + Math.round(k * 3); g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#8fd160';
    const x = Math.round(e.x - cx), y = Math.round(e.y - cy) - 2; g.fillRect(x - w, y - 1, w * 2, 2); g.fillRect(x - w + 4, y - 4, w * 2 - 8, 1); g.fillRect(x - w + 4, y + 2, w * 2 - 8, 1); g.globalAlpha = 1; }
}
