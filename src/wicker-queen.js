// src/wicker-queen.js - THE WICKER QUEEN, the Harvest Fair's boss (claude/fair3, L3; rebuilt ON THE CAROUSEL by claude/fairboss, Daniel 2026-09-30;
// her SPEAR replaces her sickle, claude/fairfix2-spear, Daniel 2026-10-01).
// A tall wicker effigy crowned in wheat, at nightfall, on the fair's great carousel, a long ash-shafted spear in her hands: the green is one turning ride now
// (src/wicker-carousel.js - the floor ring carries everything on its boards, the painted horses bob on their poles as platforms). She is the fair's own rule
// made into a fight: DON'T TURN YOUR BACK ON HER.
//
// THE RULE (src/mummer.js's facing rule, the same one the mummers keep): her FEET move only while no hero looks at her. Co-op: any hero facing her freezes
// her. But the RIDE carries her while she stands, frozen or at her blows (it carries you too; walking, she strides against it at her own pace), and HER
// ARMS ARE NOT HER FEET: a look stops her feet, not the ribbons - and it is the look that brings the spear (held, she answers with her arms; with your
// back turned she walks to you instead, and stabs).
//
// THE READ BETWEEN UP AND DOWN (every blow told, rule A1; every one wears its mark, and every one is in windingUp() by its 'Tell'):
//   LOW LASH         !!  LOW   the ribbons sweep out from the centre column along the boards at ankle height: JUMP it, or be UP ON A HORSE.
//   HIGH LASH        !!  HIGH  the ribbons fly from the canopy at the horses' height: a rider is in them, and so is a hero standing on the boards.
//                              GET DOWN on the boards and DUCK (src/duck.js).
//   HIGH THRUST      !!  HIGH  a hero LOOKING AT HER within her spear's reach (WQ.thrustReach px): she draws the spear back to her shoulder for
//                              WQ.thrustTell s - the red line runs out along the ride at the height and the length it will cover, and when it has run
//                              its length she lunges - then the spear goes out flat at the height of a standing hero and of a rider on any horse.
//                              DUCK on the boards.
//   LOW THRUST       !!  LOW   the same told draw, crouched, the spear at her knee; it skims the boards at ankle height. JUMP it (a rider is over it).
//   THE FLOOR BURNS  !!  LOW   she drives her spear's butt into the boards and the whole ring floor catches: told for WQ.floorTell s (the boards glow the
//                              length of the ride), then it burns for WQ.floorT s. Anything with its feet on the boards burns: GET UP ON A HORSE.
//   THE STAB         !!        if she reaches you unseen she draws her spear back and her eye holes burn red (the mummers' glow), then she stabs. Nothing
//                              turns a blow from behind; a LOOK during the glow freezes her and cancels it.
//   THE CROWNING     (no mark; phases 2 and 3) she lifts her wheat crown and WICKER COPIES of her stand up out of the straw (claude/fairfix4: it called the crowd's
//                    mummers in before - they are gone; the copies are her pressure now). See THE COPIES below.
// THE FIRE (the opening, rule A11: the thing YOU do): the engine's firebox under the centre column, its embers on the boards. Look at her while she
//   stands ON the embers and the look FREEZES HER ON THEM: the wicker catches and burns open. A blow in the burn is worth WQ.burnMul; anywhere else the
//   wicker takes a blow and stands (WQ.ward). Two ways onto it: UPSTREAM of the fire, hold her in your look and the ride brings her onto it; DOWNSTREAM,
//   turn your back and she walks to you against the ride, across it - and turn on her there. After a burn she is flung off the fire the ride's way and
//   the embers are BANKED for WQ.bankT s. Crossing the embers unseen does nothing; freezing her anywhere else does nothing.
// THREE PHASES, each one a thing you can say (rule A10); each one QUICKENS THE RIDE (told) and changes the horses' bob:
//   1  DUSK         the look reaches across the whole ride
//   2  FULL DARK    (at 2/3) the green goes black: your look freezes her only NEAR you (WQ.nearR px on the side you face; half as far again with the
//                   Maypole Ribbon). The crowd's mummers keep the same near look. The ride quickens.
//   3  ALIGHT       (at 1/3) she catches for good and lights the green herself: the look reaches across it again, but she walks faster, the floor
//                   burns more often, she thrusts more often, and the ride quickens again.
// Touching her never hurts (the touch rule): her damage is the lashes, the burning floor, and her spear (thrust, and stabbed from behind).
// FAIRFIX3 (Daniel 2026-10-01, "Queen 6-7/10"): the boss rules (her burn is at least 3 s in every phase; a blow outside it is worth WQ.ward = 0.05) and more of her:
//   MORE FIRES        the firebox is one of up to WQ.pits.cap ember pits round the ring: RING PITS ride the boards with the carousel and burn out (WQ.pits.life s),
//                     and SHE LIGHTS THEM - where her burning floor goes out, and where her wicker ball stops. c.embers is the list (the host keeps it: src/main.js);
//                     frozen on ANY hot one she catches. A ring pit she burns on is spent; the firebox is banked as before.
//   SHE IS FASTER     (creep 68, alight 90) AND SHE LEAPS: with every back turned and the nearest hero far off she crouches (LEAP TELL !!, its landing marked on
//                     the boards) and leaps - to the floor at your back (her landing stamps: HER LANDING), up onto the CENTRE POLE's collar, or onto a HORSE (it
//                     carries her). A look in the crouch holds her (the leap is feet); once in the air it is committed. Up on a perch she cannot be lured onto a
//                     fire: she throws and sweeps from it, and comes down only when every back is turned again.
//   THE WICKER BALL   !!  LOW   she sets a ball of her own wicker alight and bowls it along the ring: JUMP it, or be up on a horse when it passes. Where it stops
//                     (a wall) it lights a ring pit; rolled over the banked firebox, it lights that again.
//   THE RIBBON SWEEP  !!  LOW/HIGH (phases 2 and 3) the maypole's ribbons pull TAUT across the whole ring at one height (the tell: drawn tightening), then
//                     whip from one wall to the other and back - TWO passes. Low: jump each one; high: duck (and off the horses).
//   EVERY CYCLE CHANGES: after each burn her next blows come in a new order (WQ_CYCLES), and her leaps take turns between the floor, the pole and a horse.
// FAIRFIX4 (Daniel 2026-10-02: the mash bot must LOSE to her; her own summoned adds out, her own fire turned on her, copies, one new fire attack):
//   HER OWN FIRE, STRUCK BACK  her burning WICKER BALL can be STRUCK BACK into her: a blow BEGUN as the ball reaches you (WQ.retLate-WQ.retReach px in front of you, the ball
//                     flashes white there) by a hero who had not swung for WQ.retSet s - a mashed blade only scatters sparks off it - or the Pyromancer's EMBER
//                     FLARE sends it back along the boards, and when it reaches her she CATCHES FIRE: the same opening as the fire pits (at least 3 s, x WQ.burnMul),
//                     and nothing is banked. The fire pits stay as the second way. (wqIgnite: the host calls it when the ball reaches her.)
//   THE COPIES        (phases 2-3: the crowning) WQ.copies[phase] wicker copies of her stand up round the ring, and she may trade places with one. The tells are
//                     small and always there: HER crown flickers with real fire, HER ribbons blow, SHE casts the only shadow - and THE COPIES FREEZE WHEN WATCHED
//                     (the fair's facing rule: frozen dead, not a reed moving) while the real one, held by the same look, never stops moving. A copy keeps the mummers'
//                     ways (it creeps at a turned back, glows and stabs - a look cancels it); struck, it bursts into burning straw (a small hurt). Never a coin flip.
//   THE BONFIRE RING  !!  LOW   (her one new fire attack) told by the ring's lanterns FLARING - all but the ones over the gap - then a wall of fire runs round the
//                     boards with ONE GAP that travels along the ring (gapSpeed): stand in the gap, or ride a horse over it. Anything on the boards outside it burns.
//
// PURE: no DOM, no main.js. Everything the world does is a call on `c`; updateWickerQueen returns the events of the frame (for tools/wicker-queen.mjs,
// which proves every line above in Node and in the page). The host moves her by e.vx (her feet), adds the ride's carry, and clamps her to the ring.
import { facedBy, nearestHero } from './mummer.js';

export const WQ = {
  hp: 2850,   /* (claude/bosswave2: 2140 -> 2850 with the burning x1.3, measured with nudged starts so a rate is not one of seven steps) */ w: 22, h: 60,             // (claude/fairfix5: 1100 before - her new self-alight windows and the unified x1.2 put the human bot at 6/7; swept 1150-1800 on the batch64 heroes (LEVELING): 1150/1300 4/7, 1500 2/7, 1650 1/7, 1800 0/7 - tools/combat-pilots.mjs, 7 heroes)             // (claude/fairfix4: 640 before. At the fair's campaign depth (hero level 23) a knight cut 640 away in four burns, 26-56 s; tools/combat-pilots.mjs)
  creep: 68, creepP3: 90,             // px/s while nobody looks (a hero runs 92; she is never faster). The ride's carry is on top of it (claude/fairfix3: 58 / 88 before)
  sight: 720, sightY: 170,            // the look reaches across the whole ride (phases 1 and 3)
  nearR: 96, nearY: 64,               // PHASE 2, FULL DARK: the look reaches only this far (a radius on the side you face)
  reach: 26, glow: 0.6, strike: 0.2, recover: 1.0, stabReach: 46,   // THE STAB: the mummers' reach and glow to start it; her spear's jab reaches stabReach px
  lashEvery: [6.5, 5.5, 4.8], lashFirst: 3.2, lashTell: 1.0, lashT: 0.5, lashReach: 460,
  lowTop: 10,                         // the LOW ribbon runs from the boards to 10 px up: a hero in a jump or on a horse (16+) is over it
  highTop: 64, highBot: 10,           // the HIGH ribbon runs 10-64 px up: a standing hero (14) and every rider (saddle 16-40) are in it, a ducked one (8) is under it
  floorEvery: [11, 9.5, 7], floorFirst: 7.5, floorTell: 1.5, floorT: 1.8, floorTick: 0.6,   // THE FLOOR BURNS: its told time, how long it burns, a burn's tick (claude/fairfix4: every 11 s in phase one, from 12 - the bonfire ring shares its turns)
  /* HER SPEAR, THRUST: at a hero looking at her within its reach (from her middle); told for thrustTell s (the red line runs out to its length), the lunge takes
     thrustT s to carry the blade from her hand (thrustFrom) to the end of its reach, it is held out thrustHold s and drawn back over thrustBack s */
  thrustEvery: [7, 6, 5], thrustFirst: 4.5, thrustTell: 1.1, thrustT: 0.25, thrustHold: 0.3, thrustBack: 0.45, thrustFrom: 14, thrustReach: 96, thrustY: 70,
  spearLen: 76,                       // the spear, butt to point: an ash shaft, wheat bound under a leaf blade (src/redraw/wicker_queen.js draws it)
  spearHighTop: 46, spearHighBot: 10, // the HIGH thrust flies 10-46 px up: a standing hero and a rider on any horse, never a ducked one
  spearLowTop: 10,                    // the LOW thrust skims the boards to 10 px up: a hero in a jump or on a horse is over it
  spearHighY: 14, spearLowY: 5,       // where the shaft is DRAWN: the high one at a standing hero's head (a ducked one, 8, is plainly under it), the low one at his ankles
  rest: 1.4,                          // a breath between one of her blows and the next (and a way for her to walk to you between them)
  crownEvery: [0, 11, 9], crownFirst: 2.5, crownTell: 1.2,   // THE CROWNING calls her COPIES now (claude/fairfix4), in phases 2 and 3 only: [phase 1 never]
  /* (claude/fairfix4) THE COPIES: how many stand with her in each phase, how far round the ring they stand, a copy's creep and stab, and the straw a struck one bursts into */
  copies: [0, 2, 3], copySpread: 140, copyCreep: 58, copyStab: 20, copyBurst: 8, copyBurstR: 30,
  /* (claude/fairfix4) HER OWN FIRE STRUCK BACK: the reach in front of a hero where a blow begun sends the ball back, how long he must have held his blade (a mash scatters it),
     the speed it comes back at, and how near her it catches her */
  retReach: 32, retLate: 6, retSet: 0.7, retSpeed: 240, retHit: 16,   // (a mashing hero begins a blow every 0.38-0.5 s: never a held blade; the window is ~0.17 s of the ball's run)
  /* (claude/fairfix4) THE BONFIRE RING: told (the lanterns flare, not the ones over the gap), then the wall of fire round the ring for ringT s with one gap gapHalf px each side
     of its middle, travelling gapSpeed px/s; it burns what is on the boards outside the gap up to ringTop px, every ringTick s */
  ringEvery: [16, 13, 11], ringFirst: 12, ringTell: 3.0,   /* (claude/fairfix5, Daniel: the ring's wind-up TWICE as long - it was 1.5 s; the lanterns flare and the gap is marked on the boards for all of it) */ ringT: 2.8, gapHalf: 30, gapSpeed: 46, gapFrom: [110, 220], ringTop: 34, ringTick: 0.45,
  emberHalf: 40,                      // the embers: this far each side of the firebox's middle
  catchT: 0.4, burnT: 3.0, burnTP3: 3.0, riseT: 0.6, throwBack: 44, bankT: 6,   // (claude/fairfix3: the opening is at least 3 s in every phase - the boss rule; it was 2.8 / 2.4)
  alightT: 3.0, alightMul: 1.56,   /* (claude/bosswave2, Daniel 10-05 playtest: she takes MORE while burning - x1.3 on both burning windows, 1.2 -> 1.56) */      // (claude/fairfix5, Daniel) EVERY FIRE ATTACK SETS HERSELF ALIGHT: after the burning floor, the bonfire ring and the wicker ball she is alight alightT s, a blow worth alightMul (she takes no burn from it)
  burnMul: 1.56, ward: 0.05,           // (claude/fairfix5, Daniel 10-02: her openings UNIFIED at x1.2 - a burn on a pit, on the firebox or from her own ball struck back pays what her self-alight window pays; was 0.7)           // what a blow is worth burning, and against the standing wicker (claude/fairfix3: x0.05 chip outside the burn, the boss rule; it was 0.25. And a burn is worth 0.9 a blow, from 1.35: with her ring pits and a 3 s burn the human bot won in 46-56 s, under the 90-150 s band. claude/fairfix4: 0.7, with her 1100 health - the human bot at the fair's depth wins 2 of 3 in 60-131 s)
  thrustClear: 24,                    // (claude/fairfix3, review #11) no thrust STARTS while she stands within this far of hot embers: a committed thrust no longer carries her across the opening
  rustle: 0.35,                       // her audio tell while she moves: the wicker creaks
  dmg: { stab: 28, lash: 24, floor: 18, thrust: 26, ball: 22, sweep: 22, stomp: 20, ring: 18 },   /* (claude/sweep3: back to fairfix5's own numbers - x0.75 of these, the standard bot won 12/12 at L25; band 50-60%) */   /* (claude/fairfix5: x0.75 with her health up, so a fight runs the 90-150 s band; was stab 28, lash 24, floor 18, thrust 26, ball 22, sweep 22, stomp 20, ring 18) */
  /* (claude/fairfix3) HER NEW BLOWS AND HER FIRES */
  tossEvery: [8, 7, 6], tossFirst: 4, tossTell: 0.9, tossT: 0.35, ballSpeed: 150, ballTop: 14,   // THE WICKER BALL: told, bowled along the boards; it hurts what stands in its 14 px
  sweepEvery: [0, 10, 8.5], sweepFirst: 3.5, sweepTell: 1.2, sweepT: 1.8,                              // THE RIBBON SWEEP (phases 2-3): told by the ribbons going taut, then two passes
  leapEvery: [11, 7.5, 6], leapFirst: 6.5, leapTell: 0.7, leapT: 0.6, leapMin: 150, leapArc: 44, stompR: 26, perchT: 2.6, poleLift: 76, horseOff: 2.2,
  pits: { ring: 1, half: 22, life: 8, cap: 4 },                                                          // the ring pits: how many she starts with, their half-width, life, and the most at once (with the firebox)
  p2: 2 / 3, p3: 1 / 3,
};
/* THE LASH ORDER: low and high mixed, never three alike, so the height has to be READ, not remembered */
export const LASH_ORDER = ['low', 'high', 'low', 'low', 'high', 'high', 'low', 'high'];
/* THE SWEEP ORDER (claude/fairfix3): low and high, out of step with the lash's */
export const SWEEP_ORDER = ['high', 'low', 'low', 'high', 'low', 'high'];
/* EVERY CYCLE CHANGES (claude/fairfix3): after each burn the next blows are reseeded in a new order (seconds until each may come); the leaps take turns floor, pole, horse */
export const WQ_CYCLES = [{ toss: 1.6, leap: 5, sweep: 7, floor: 9.5 }, { sweep: 1.6, toss: 4.5, leap: 7, floor: 6 }, { leap: 1.6, floor: 4.5, toss: 6.5, sweep: 8.5 }];
export const LEAP_TO = ['floor', 'pole', 'horse'];
/* THE THRUST ORDER: the same rule, out of step with the lash's, so a high lash is not the cue for a high thrust */
export const THRUST_ORDER = ['high', 'low', 'high', 'high', 'low', 'low', 'high', 'low', 'low', 'high'];
/* the frames of bakeWickerQueen (src/redraw/wicker_queen.js) */
export const WQ_F = { still: 0, creep: [1, 2], stabTell: 3, stab: 4, lashTell: 5, lash: 6, crownTell: 7, catch: 8, burn: [9, 10], rise: 11, hurt: 12, dead: 13,
  thrustHighTell: 14, thrustHigh: 15, thrustLowTell: 16, thrustLow: 17, floorTell: 18, floor: 19 };
export const WQ_FRAMES = 20;

export const wqPhase = e => (e.hp <= e.maxHp * WQ.p3 ? 3 : e.hp <= e.maxHp * WQ.p2 ? 2 : 1);
export const wqSight = ph => (ph === 2 ? [WQ.nearR, WQ.nearY] : [WQ.sight, WQ.sightY]);
/* IS SHE LOOKED AT (the facing rule, with the phase's reach): any living hero facing her side, near enough */
export const wqSeen = (e, heroes) => { const [s, sy] = wqSight(e.phase || 1); return facedBy(e, heroes, s, sy); };
export const onEmbers = (x, emb) => !!emb && x >= emb.x0 && x <= emb.x1;
export const embersOf = bonfireX => ({ x0: bonfireX - WQ.emberHalf, x1: bonfireX + WQ.emberHalf, mid: bonfireX });
export const wqOpen = e => e.mode === 'burn' || e.alight > 0;   /* (claude/fairfix5) burning on a fire, or alight from her own fire attack */
/* WHAT A BLOW IS WORTH: burning, WQ.burnMul; the rest of the time the wicker takes it and stands */
export const wqTake = e => (e.mode === 'burn' ? WQ.burnMul : e.alight > 0 ? WQ.alightMul : WQ.ward);
export const WQ_TELLS = ['stabTell', 'lashLowTell', 'lashHighTell', 'floorTell', 'thrustHighTell', 'thrustLowTell', 'crownTell', 'tossTell', 'sweepLowTell', 'sweepHighTell', 'leapTell', 'ringTell'];
/* (claude/fairfix4) THE BONFIRE RING's gap, [x0, x1] in world x, and does the ring burn a hero standing here (on the boards, not on a horse, outside the gap)? */
export const gapOf = e => [(e.gapX || 0) - WQ.gapHalf, (e.gapX || 0) + WQ.gapHalf];
export const ringCatches = (e, x, feetY, floor, onHorse) => { const [a, b] = gapOf(e); return !onHorse && feetY > floor - WQ.ringTop && (x < a || x > b); };
/* (claude/fairfix4) HER OWN FIRE STRUCK BACK: the struck-back ball reaches her and she catches - unless she is already burning, flung, or in the air. Up on a perch the
   ball knocks her down onto the boards. c: { number, sound }. Returns whether she caught */
export function wqIgnite(e, c) {
  if (!e.alive || ['sleep', 'wake', 'catch', 'burn', 'rise', 'leap'].includes(e.mode)) return false;
  e.perch = null; e.lift = 0; e.mode = 'catch'; e.modeT = WQ.catchT; e.burnPit = null; e.burnBy = 'ball'; e.n.catch++; e.n.ret = (e.n.ret || 0) + 1; e.vx = 0; e.tip = 0;
  if (c && c.number) c.number(e.x, e.y - 78, 'HER OWN FIRE: SHE CATCHES', '#ffb040'); if (c && c.sound) c.sound('catch'); return true;
}
/* (claude/fairfix4) A COPY STRUCK: it bursts into burning straw. Returns the copy (the host bursts it and burns what stands in WQ.copyBurstR), or null */
export function strikeCopy(e, i) { const f = (e.fakes || [])[i]; if (!f) return null; e.fakes.splice(i, 1); e.n.copyBurst = (e.n.copyBurst || 0) + 1; return f; }
/* THE COPIES, one frame (the facing rule, the phase's reach): watched, a copy is frozen dead; unwatched it creeps to the nearest hero and, at his back, glows and stabs */
function stepCopies(e, dt, c, heroes, ph, ev) {
  const [s, sy] = wqSight(ph);
  for (const f of e.fakes || []) {
    f.y = c.A.floor; f.seen = facedBy(f, heroes, s, sy); f.modeT -= dt; f.vx = 0;
    const near = nearestHero(f, heroes, WQ.sight, WQ.sightY);
    if (f.mode === 'glow') { if (f.seen) { f.mode = 'still'; ev.push({ t: 'copyFreeze', f }); continue; }
      if (f.modeT <= 0) { f.mode = 'recover'; f.modeT = WQ.recover; const x0 = f.face > 0 ? f.x - 4 : f.x - WQ.stabReach, box = [x0, x0 + WQ.stabReach + 4, c.A.floor - 44, c.A.floor];
        ev.push({ t: 'copyStab', box, f }); c.sound('stab'); c.hit(box, WQ.copyStab, 'HER COPY'); }
      continue; }
    if (f.mode === 'recover') { if (f.modeT <= 0) f.mode = 'still'; continue; }
    if (near && !f.seen && Math.abs(near.x - f.x) <= WQ.reach && Math.abs((near.y || 0) - f.y) < 40) { f.face = Math.sign(near.x - f.x) || f.face; f.mode = 'glow'; f.modeT = WQ.glow;
      ev.push({ t: 'copyGlow', f }); c.number(f.x, f.y - 78, '!!', '#ff6b6b'); c.sound('stabTell'); continue; }
    if (near && !f.seen) { f.face = Math.sign(near.x - f.x) || f.face; const nx = f.x + f.face * WQ.copyCreep * dt; if (nx > c.A.x0 + 16 && nx < c.A.x1 - 16) { f.vx = f.face * WQ.copyCreep; f.x = nx; }
      f.mode = 'creep'; f.anim = (f.anim || 0) + dt; }
    else f.mode = 'still';   /* (frozen dead: its anim does not run - the real one's does) */
  }
}
/* HER FIRES (claude/fairfix3): c.embers is one pit { x0, x1, mid } (the firebox, banked by e.bank: the old shape) or a list of them, each with its own bank */
export const pitsOf = (c, e) => (!c || !c.embers ? [] : Array.isArray(c.embers) ? c.embers : [{ ...c.embers, fire: true, bank: e.bank }]);
export const pitUnder = (x, pits) => (pits || []).find(p => !(p.bank > 0) && onEmbers(x, p)) || null;
/* a ring pit as the host keeps it: centred at mid, WQ.pits.half each side */
export const ringPit = (mid, life = WQ.pits.life) => ({ mid, x0: mid - WQ.pits.half, x1: mid + WQ.pits.half, life, ring: true, bank: 0 });
/* THE SWEEP's front: where the ribbon's end is through the sweep (k 0..1): out from one wall to the other, and back */
export const sweepFront = (A, k, from = 1) => { const a = from > 0 ? A.x0 : A.x1, b = from > 0 ? A.x1 : A.x0, u = k < 0.5 ? k * 2 : 2 - k * 2; return a + (b - a) * u; };
/* THE RIBBON'S BAND, in world y: [top, bottom] */
export const lashBand = (kind, floor) => (kind === 'low' ? [floor - WQ.lowTop, floor] : [floor - WQ.highTop, floor - WQ.highBot]);
/* does a ribbon at this height catch a hero whose hurt box runs from t to b (world y; src/duck.js duckBox gives it ducked or standing)? */
export const lashCatches = (kind, floor, box) => { const [t, b] = lashBand(kind, floor); return box.b > t && box.t < b; };
/* HER SPEAR's band for a thrust, in world y, and whether it catches a hurt box */
export const spearBand = (kind, floor) => (kind === 'low' ? [floor - WQ.spearLowTop, floor] : [floor - WQ.spearHighTop, floor - WQ.spearHighBot]);
export const spearCatches = (kind, floor, box) => { const [t, b] = spearBand(kind, floor); return box.b > t && box.t < b; };
/* the height the shaft is drawn at (inside its band, where it reads against the hero: src/redraw/wicker_queen.js puts her hands there) */
export const spearY = (kind, floor) => floor - (kind === 'low' ? WQ.spearLowY : WQ.spearHighY);
/* THE FLOOR BURNS whom? a hero whose feet are on the boards (not in the air, not on a horse) */
export const floorCatches = (floor, feetY, onHorse) => !onHorse && Math.abs(feetY - floor) < 3;
/* where the blade is, px in front of her middle along e.thrustDir, through a thrust: drawn back in the tell, out to its reach in the lunge, held, drawn back */
export function thrustTip(e) {
  if (e.mode === 'thrustHighTell' || e.mode === 'thrustLowTell') return WQ.thrustFrom - 6 * Math.min(1, 1 - Math.max(0, e.modeT) / WQ.thrustTell);
  if (e.mode !== 'thrust') return 0;
  const T = WQ.thrustT + WQ.thrustHold + WQ.thrustBack, el = T - Math.max(0, e.modeT), span = WQ.thrustReach - WQ.thrustFrom;
  if (el < WQ.thrustT) return WQ.thrustFrom + span * (el / WQ.thrustT);
  if (el < WQ.thrustT + WQ.thrustHold) return WQ.thrustReach;
  return WQ.thrustReach - span * Math.min(1, (el - WQ.thrustT - WQ.thrustHold) / WQ.thrustBack);
}

export function wqFrame(e) {
  switch (e.mode) {
    case 'stabTell': return WQ_F.stabTell; case 'stab': return WQ_F.stab;
    case 'thrustHighTell': return WQ_F.thrustHighTell; case 'thrustLowTell': return WQ_F.thrustLowTell;
    case 'thrust': { const out = (e.tip || 0) > (WQ.thrustFrom + WQ.thrustReach) / 2, low = e.thrustKind === 'low';   /* out: the lunge; drawn back: the tell's pose */
      return low ? (out ? WQ_F.thrustLow : WQ_F.thrustLowTell) : (out ? WQ_F.thrustHigh : WQ_F.thrustHighTell); }
    case 'lashLowTell': case 'lashHighTell': return WQ_F.lashTell; case 'lash': return WQ_F.lash;
    case 'floorTell': return WQ_F.floorTell; case 'floor': return WQ_F.floor;
    case 'ringTell': return WQ_F.floorTell; case 'ring': return WQ_F.floor;   /* (claude/fairfix4) THE BONFIRE RING: the spear's butt over the boards, then driven in
    case 'crownTell': case 'crown': return WQ_F.crownTell;
    case 'tossTell': return WQ_F.lashTell; case 'toss': return WQ_F.lash;   /* (claude/fairfix3) the ball wound up over her head, and bowled */
    case 'sweepLowTell': case 'sweepHighTell': return WQ_F.lashTell; case 'sweep': return WQ_F.lash;
    case 'leapTell': return WQ_F.thrustLowTell; case 'leap': return WQ_F.rise;
    case 'catch': return WQ_F.catch; case 'burn': return WQ_F.burn[Math.floor((e.anim || 0) * 8) % 2];
    case 'rise': return WQ_F.rise;
    case 'creep': return WQ_F.creep[Math.floor((e.anim || 0) * 5) % 2];
  }
  if (e.flash > 0.05) return WQ_F.hurt;
  return WQ_F.still;
}

export function newWickerQueen(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, phase: 1, open: 0, bank: 0, lashCd: WQ.lashFirst, crownCd: WQ.crownFirst, floorCd: WQ.floorFirst, thrustCd: WQ.thrustFirst,
    tossCd: WQ.tossFirst, sweepCd: WQ.sweepFirst, leapCd: WQ.leapFirst, ringCd: WQ.ringFirst, gapX: 0, gapDir: 1, fakes: [], burnBy: null, cycle: 0, leapN: 0, sweepN: 0, lift: 0, perch: null, horseI: -1, perchT: 0, leapTo: null, leapFrom: null,
    sweepKind: null, sweepDir: 1, burnPit: null,
    lashN: 0, thrustN: 0, rest: 0, rustleT: 0, anim: 0, vx: 0, lashR: 0, lashKind: null, thrustKind: null, thrustDir: 1, tip: 0, seen: false,
    alight: 0, n: { alight: 0, catch: 0, burn: 0, lash: 0, stab: 0, crown: 0, floor: 0, thrust: 0, toss: 0, sweep: 0, leap: 0, ret: 0, ring: 0, copies: 0, copyBurst: 0 } });
}

/* ONE FRAME OF HER. c = { heroes: [{x, y, face, alive}], A: {x0, x1, floor}, embers: {x0, x1, mid} | null, ringDir (the ride's way, 1 or -1; 0: no ride),
   canStep(dir), number(x, y, text, col) (her lines: '!!' floats, a teaching line goes to the hint box), sound(key), hit(box [l, r, t, b], dmg, name),
   lash(kind, r0, r1), thrust(kind, x0, x1) (the blade swept from x0 to x1 this frame, world x) }. (claude/fairfix4: summon / adds are gone - the copies are hers, e.fakes.)
   Returns the frame's events. */
export function updateWickerQueen(e, dt, c) {
  const ev = [];
  if (!e.alive || e.mode === 'sleep') return ev;
  if (c.anim !== false) e.anim = (e.anim || 0) + dt;   /* (the game ticks it for every creature: its hands pass anim: false) */
  e.modeT -= dt; e.vx = 0;
  e.bank = Math.max(0, (e.bank || 0) - dt); e.rest = Math.max(0, (e.rest || 0) - dt); e.alight = Math.max(0, (e.alight || 0) - dt);
  /* (claude/fairfix5) HER OWN FIRE CATCHES HER: the end of each fire attack (the floor, the ring, the ball) lights her own wicker from her spear. Only the REAL Queen
     catches - in phases 2-3 that is how she tells herself from her copies. An opening (wqOpen) at alightMul for alightT s; it hurts her not at all */
  const selfAlight = () => { if (e.mode === 'burn' || e.mode === 'catch') return; e.alight = WQ.alightT; e.n.alight = (e.n.alight || 0) + 1; ev.push({ t: 'alight' });
    c.number(e.x, e.y - 78, 'HER OWN FIRE CAUGHT HER: CUT HER', '#ffb040'); c.sound('catch'); };
  const busy = e.mode === 'rise' || e.mode === 'leap';   /* (claude/fairfix4: SHE ALWAYS FIGHTS - her clocks run on while she burns, so she comes up off the fire swinging; only the fling and the leap stop them) */
  if (!busy) { e.lashCd -= dt; e.crownCd -= dt; e.floorCd -= dt; e.thrustCd -= dt; e.tossCd -= dt; e.sweepCd -= dt; e.leapCd -= dt; e.ringCd -= dt; e.perchT = Math.max(0, (e.perchT || 0) - dt); }
  const pits = pitsOf(c, e);
  const ph = wqPhase(e);
  if (ph !== e.phase) { e.phase = ph; ev.push({ t: 'phase', ph });
    c.number(e.x, e.y - 78, ph === 2 ? 'FULL DARK: THE RIDE QUICKENS' : 'SHE IS ALIGHT: THE RIDE QUICKENS', '#ff6b6b'); c.sound(ph === 2 ? 'dark' : 'alight'); }
  const heroes = c.heroes || [], seen = wqSeen(e, heroes), near = nearestHero(e, heroes, WQ.sight, WQ.sightY);
  e.seen = seen;
  const toward = () => { if (near) e.face = Math.sign(near.x - e.x) || e.face || -1; };
  if (e.mode === 'wake') { if (e.modeT <= 0) e.mode = 'still'; return ev; }
  stepCopies(e, dt, c, heroes, ph, ev);   /* (claude/fairfix4) her copies keep their own feet, whatever she is doing */
  e.open = e.mode === 'burn' ? Math.max(0, e.modeT) : e.alight > 0 ? e.alight : 0;
  const tipWas = e.tip || 0; e.tip = thrustTip(e);
  /* ---- THE OPENING FIRST (rule E2: the thing the fight is about goes at the top of the chain): frozen ON the embers, and they are not banked ---- */
  const pit = (e.mode === 'still' || e.mode === 'creep') && seen && !(e.lift > 0) && !e.perch ? pitUnder(e.x, pits) : null;
  if (pit) {
    e.mode = 'catch'; e.modeT = WQ.catchT; e.n.catch++; e.burnPit = pit; ev.push({ t: 'catch', pit });
    c.number(e.x, e.y - 78, 'THE WICKER CATCHES', '#ffb040'); c.sound('catch'); return ev; }
  switch (e.mode) {
    case 'catch':
      if (e.modeT <= 0) { e.mode = 'burn'; e.modeT = ph === 3 ? WQ.burnTP3 : WQ.burnT; e.open = e.modeT; e.n.burn++; ev.push({ t: 'burn' }); c.number(e.x, e.y - 78, 'SHE BURNS: CUT HER', '#8fd160'); c.sound('burn'); }
      return ev;
    case 'burn':
      if (e.modeT <= 0) {   /* the fire goes out of the wicker; she is flung off the embers THE RIDE'S WAY (no ride: the side she came from), and they are banked */
        const emb = e.burnPit || pits.find(p => p.fire) || { x0: e.x, x1: e.x, mid: e.x }, side = c.ringDir ? Math.sign(c.ringDir) : near ? (Math.sign(e.x - near.x) || 1) : (e.face > 0 ? -1 : 1);
        const byBall = e.burnBy === 'ball'; e.burnBy = null;   /* (claude/fairfix4) set alight by her own ball: she burns out where she stands, and no fire is banked or spent */
        e.throwTo = byBall ? e.x : Math.max(c.A.x0 + 16, Math.min(c.A.x1 - 16, emb.mid + side * ((emb.x1 - emb.x0) / 2 + WQ.throwBack)));
        const spent = !byBall && !!(e.burnPit && e.burnPit.ring);   /* a ring pit she burned on is spent (the host puts it out); the firebox is banked */
        e.mode = 'rise'; e.modeT = WQ.riseT; e.open = 0; if (!spent && !byBall) e.bank = WQ.bankT; ev.push({ t: byBall ? 'burnOut' : 'banked', pit: e.burnPit, spent });
        /* EVERY CYCLE CHANGES (claude/fairfix3): her next blows in a new order */
        e.cycle = (e.cycle || 0) + 1; const cy = WQ_CYCLES[e.cycle % WQ_CYCLES.length]; e.tossCd = cy.toss; e.sweepCd = cy.sweep; e.leapCd = cy.leap; e.floorCd = Math.max(e.floorCd, cy.floor); e.burnPit = null;
        if (!byBall) c.number(e.x, e.y - 78, spent ? 'THAT FIRE IS SPENT' : 'THE FIRE IS BANKED', '#c9d1dc'); c.sound('rise'); }
      return ev;
    case 'rise': {   /* flung, not creeping: this is the fire throwing her off, and a look does not hold it */
      const k = Math.min(1, dt * 7); e.vx = ((e.throwTo ?? e.x) - e.x) * k / Math.max(dt, 1e-4);
      if (e.modeT <= 0) { e.mode = 'still'; e.vx = 0; }
      return ev; }
    case 'stabTell':
      if (seen) { e.mode = 'still'; ev.push({ t: 'freeze', cancel: 'stab' }); c.sound('still'); return ev; }
      toward();
      if (e.modeT <= 0) { e.mode = 'stab'; e.modeT = WQ.strike; e.n.stab++;
        const x0 = e.face > 0 ? e.x - 4 : e.x - WQ.stabReach, box = [x0, x0 + WQ.stabReach + 4, (c.A.floor) - 44, c.A.floor];
        ev.push({ t: 'stab', box }); c.sound('stab'); c.hit(box, WQ.dmg.stab, 'HER SPEAR'); }
      return ev;
    case 'stab': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = WQ.recover; } return ev;
    case 'recover': if (e.modeT <= 0) e.mode = 'still'; return ev;
    case 'thrustHighTell': case 'thrustLowTell':   /* the spear is drawn back at the height it will fly: the thrust is committed (a look does not stop her arms) */
      if (e.modeT <= 0) { e.thrustKind = e.mode === 'thrustLowTell' ? 'low' : 'high'; e.mode = 'thrust'; e.modeT = WQ.thrustT + WQ.thrustHold + WQ.thrustBack; e.n.thrust++;
        e.tip = WQ.thrustFrom; ev.push({ t: 'thrust', kind: e.thrustKind, dir: e.thrustDir }); c.sound('thrust'); }
      return ev;
    case 'thrust': {   /* the lunge: the blade runs out along the ride; each hero is judged once, the moment it reaches him (the host's c.thrust) */
      const was = tipWas, tip = e.tip;
      if (tip > was && c.thrust) { const a = e.x + e.thrustDir * was, b = e.x + e.thrustDir * tip; c.thrust(e.thrustKind, Math.min(a, b), Math.max(a, b)); }
      if (e.modeT <= 0) { e.mode = 'still'; e.tip = 0; e.rest = WQ.rest; e.thrustCd = WQ.thrustEvery[ph - 1]; }
      return ev; }
    case 'lashLowTell': case 'lashHighTell':   /* the ribbons are wound up at the height they will fly: a look does not stop them */
      if (e.modeT <= 0) { e.lashKind = e.mode === 'lashLowTell' ? 'low' : 'high'; e.mode = 'lash'; e.modeT = WQ.lashT; e.lashR = 0; e.n.lash++;
        ev.push({ t: 'lash', kind: e.lashKind }); c.sound('lash'); }
      return ev;
    case 'lash': {
      const r0 = e.lashR || 0, r1 = WQ.lashReach * Math.min(1, 1 - Math.max(0, e.modeT) / WQ.lashT); e.lashR = r1;
      c.lash(e.lashKind, r0, r1);
      if (e.modeT <= 0) { e.mode = 'still'; e.lashCd = WQ.lashEvery[ph - 1]; e.lashR = 0; e.rest = WQ.rest; }
      return ev; }
    case 'floorTell':   /* the spear butt raised over the boards, and they glow the length of the ride: a look does not stop it */
      if (e.modeT <= 0) { e.mode = 'floor'; e.modeT = WQ.floorT; e.n.floor++; ev.push({ t: 'floor' }); c.sound('floor'); }
      return ev;
    case 'floor': if (e.modeT <= 0) { e.mode = 'still'; e.floorCd = WQ.floorEvery[ph - 1]; e.rest = WQ.rest; ev.push({ t: 'floorOut' }); selfAlight(); } return ev;
    case 'crownTell':   /* (claude/fairfix4) THE COPIES stand up out of the straw round the ring, and she may trade places with one of them */
      if (e.modeT <= 0) { const want = WQ.copies[ph - 1] || 0, n = Math.max(0, want - e.fakes.length); e.n.crown++;
        const xs = []; for (const k of [-1, 1, -2, 2, 3, -3]) { const x = e.x + k * WQ.copySpread; if (x > c.A.x0 + 24 && x < c.A.x1 - 24 && ![e.x, ...xs, ...e.fakes.map(f => f.x)].some(q => Math.abs(q - x) < 60)) xs.push(x); if (xs.length >= n) break; }
        for (const x of xs) { e.fakes.push({ x, y: c.A.floor, face: e.face, mode: 'still', modeT: 0, anim: 0, vx: 0, id: ++e.n.copies }); }
        const swap = xs.length ? (e.n.crown % (xs.length + 1)) : 0;   /* she trades places with a new copy two crownings in three: the read, not the place, tells you which is her */
        if (swap > 0) { const f = e.fakes[e.fakes.length - xs.length + swap - 1], x0 = e.x; e.x = f.x; f.x = x0; }
        ev.push({ t: 'crown', n: xs.length, swap: swap > 0 }); e.mode = 'crown'; e.modeT = 0.5; c.sound('crown'); }
      return ev;
    case 'crown': if (e.modeT <= 0) { e.mode = 'still'; e.crownCd = WQ.crownEvery[ph - 1] || 99; } return ev;
    /* ---- (claude/fairfix4) THE BONFIRE RING: the lanterns flare (not the ones over the gap), then the fire runs round the boards and the gap travels along them ---- */
    case 'ringTell': if (e.modeT <= 0) { e.mode = 'ring'; e.modeT = WQ.ringT; e.n.ring++; ev.push({ t: 'ring', gap: gapOf(e) }); c.sound('floor'); } return ev;
    case 'ring': {
      e.gapX += e.gapDir * WQ.gapSpeed * dt; const lo = c.A.x0 + WQ.gapHalf + 8, hi = c.A.x1 - WQ.gapHalf - 8;
      if (e.gapX < lo || e.gapX > hi) { e.gapX = Math.max(lo, Math.min(hi, e.gapX)); e.gapDir = -e.gapDir; }
      if (e.modeT <= 0) { e.mode = 'still'; e.ringCd = WQ.ringEvery[ph - 1]; e.rest = WQ.rest; ev.push({ t: 'ringOut' }); selfAlight(); }
      return ev; }
    /* ---- (claude/fairfix3) THE WICKER BALL: wound up over her head, bowled along the boards toward the nearest hero (the host rolls it: c.ball) ---- */
    case 'tossTell':
      if (e.modeT <= 0) { e.mode = 'toss'; e.modeT = WQ.tossT; e.n.toss++; const dir = near ? (Math.sign(near.x - e.x) || e.face || -1) : (e.face || -1);
        ev.push({ t: 'ball', x: e.x + dir * 14, dir, lift: e.lift || 0 }); if (c.ball) c.ball(e.x + dir * 14, dir, e.lift || 0); c.sound('lash'); }
      return ev;
    case 'toss': if (e.modeT <= 0) { e.mode = 'still'; e.tossCd = WQ.tossEvery[ph - 1]; e.rest = WQ.rest; selfAlight(); } return ev;
    /* ---- THE RIBBON SWEEP: taut across the ring at one height, then out from one wall to the other and back (two passes; the host judges each: c.sweep) ---- */
    case 'sweepLowTell': case 'sweepHighTell':
      if (e.modeT <= 0) { e.sweepKind = e.mode === 'sweepLowTell' ? 'low' : 'high'; e.mode = 'sweep'; e.modeT = WQ.sweepT; e.n.sweep++; e.sweepDir = near && near.x > (c.A.x0 + c.A.x1) / 2 ? 1 : -1;
        ev.push({ t: 'sweep', kind: e.sweepKind }); c.sound('lash'); e.sweepK = 0; }
      return ev;
    case 'sweep': { const k0 = e.sweepK || 0, k1 = Math.min(1, 1 - Math.max(0, e.modeT) / WQ.sweepT); e.sweepK = k1;
      if (c.sweep) c.sweep(e.sweepKind, sweepFront(c.A, k0, e.sweepDir), sweepFront(c.A, k1, e.sweepDir), k1 < 0.5 ? 0 : 1);
      if (e.modeT <= 0) { e.mode = 'still'; e.sweepCd = WQ.sweepEvery[ph - 1] || 99; e.rest = WQ.rest; e.sweepK = 0; }
      return ev; }
    /* ---- HER LEAP: crouched (a look holds her - the leap is her feet), then committed through the air to the floor at a hero's back, the pole's collar or a horse ---- */
    case 'leapTell':
      if (seen) { e.mode = 'still'; e.leapTo = null; e.leapCd = 2.5; ev.push({ t: 'freeze', cancel: 'leap' }); c.sound('still'); return ev; }
      if (e.modeT <= 0) { e.mode = 'leap'; e.modeT = WQ.leapT; e.n.leap++; e.leapFrom = { x: e.x, lift: e.lift || 0 }; e.perch = null; ev.push({ t: 'leap', to: e.leapTo }); c.sound('rise'); }
      return ev;
    case 'leap': { const T = e.leapTo || { kind: 'floor', x: e.x, lift: 0 }, F = e.leapFrom || { x: e.x, lift: 0 };
      if (T.kind === 'horse' && c.horses) { const h = c.horses().find(q => q.i === T.i); if (h && h.front) { T.x = h.x; T.lift = h.lift; } else { T.kind = 'floor'; T.lift = 0; } }
      const k = Math.min(1, 1 - Math.max(0, e.modeT) / WQ.leapT), nx = F.x + (T.x - F.x) * k;
      e.vx = (nx - e.x) / Math.max(dt, 1e-4); e.lift = F.lift + (T.lift - F.lift) * k + WQ.leapArc * Math.sin(Math.PI * k);
      if (e.modeT <= 0) { e.vx = (T.x - e.x) / Math.max(dt, 1e-4); e.lift = T.lift; e.mode = 'still'; e.rest = 0.6; e.leapCd = WQ.leapEvery[ph - 1];
        if (T.kind === 'floor') { e.lift = 0; e.perch = null; const box = [T.x - WQ.stompR, T.x + WQ.stompR, c.A.floor - 30, c.A.floor]; ev.push({ t: 'stomp', box }); c.hit(box, WQ.dmg.stomp, 'HER LANDING'); c.sound('stab'); }
        else { e.perch = T.kind; e.horseI = T.i ?? -1; e.perchT = WQ.perchT; ev.push({ t: 'perch', on: T.kind }); } }
      return ev; }
  }
  /* ---- (claude/fairfix3) UP ON A PERCH: the pole's collar holds her where it stands; a horse carries her (and sets her down where it goes round the back). She does
     not walk off a perch: her arms still fight (the ball, the sweep, the lash), and she leaps down only when every back is turned ---- */
  if (e.perch === 'horse') { const h = c.horses && c.horses().find(q => q.i === e.horseI);
    if (h && h.front) { e.vx = (h.x - e.x) / Math.max(dt, 1e-4); e.lift = h.lift; } else { e.perch = null; e.lift = 0; ev.push({ t: 'setDown' }); } }
  /* ---- STILL OR CREEPING: choose ---- */
  const dx = near ? Math.abs(near.x - e.x) : 1e9, up = !!e.perch;
  if (!up && near && !seen && dx <= WQ.reach && Math.abs((near.y || 0) - (e.y || 0)) < 40) {
    toward(); e.mode = 'stabTell'; e.modeT = WQ.glow; ev.push({ t: 'glow' }); c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.sound('stabTell'); return ev; }
  if (!(e.rest > 0)) {
    const byFire = pits.some(p => !(p.bank > 0) && e.x >= p.x0 - WQ.thrustClear && e.x <= p.x1 + WQ.thrustClear);   /* (claude/fairfix3, review #11) no thrust starts at the fire's edge: a committed thrust no longer carries her across the opening */
    if (ph >= 2 && e.crownCd <= 0) {   /* (claude/fairfix4) her copies first: the dark comes in with them */
      if (e.fakes.length < (WQ.copies[ph - 1] || 0)) { e.mode = 'crownTell'; e.modeT = WQ.crownTell; ev.push({ t: 'crownTell' }); c.number(e.x, e.y - 78, 'THE CROWNING', '#e8c23a'); c.sound('crownTell'); return ev; }
      e.crownCd = 2;   /* her copies all stand: she asks again in a moment */ }
    if (!up && !byFire && near && seen && e.thrustCd <= 0 && dx <= WQ.thrustReach - 8 && Math.abs((near.y || 0) - (e.y || 0)) < WQ.thrustY) {   /* LOOKED AT, IN HER SPEAR'S REACH: her feet are held, so her arms answer - she thrusts */
      toward(); const kind = THRUST_ORDER[(e.thrustN++) % THRUST_ORDER.length]; e.thrustDir = e.face; e.thrustKind = kind;
      e.mode = kind === 'low' ? 'thrustLowTell' : 'thrustHighTell'; e.modeT = WQ.thrustTell; e.tip = thrustTip(e); ev.push({ t: 'thrustTell', kind, dir: e.thrustDir });
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, kind === 'low' ? 'HER SPEAR, LOW: JUMP' : 'HER SPEAR, HIGH: DUCK', '#ff6b6b'); c.sound('thrustTell'); return ev; }
    if (!up && e.floorCd <= 0) { e.mode = 'floorTell'; e.modeT = WQ.floorTell; ev.push({ t: 'floorTell' });   /* (claude/fairfix4: the floor before the ball, so the ball's quicker turns do not crowd it out) */
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, 'THE FLOOR BURNS: RIDE A HORSE', '#ff6b6b'); c.sound('floorTell'); return ev; }
    if (!up && e.ringCd <= 0 && near) {   /* (claude/fairfix4) THE BONFIRE RING: the gap is put a good run from the nearest hero, on the side with the room */
      const A = c.A, d = WQ.gapFrom[0] + ((e.n.ring * 53) % (WQ.gapFrom[1] - WQ.gapFrom[0])), side = (near.x - A.x0 > A.x1 - near.x) ? -1 : 1;
      e.gapX = Math.max(A.x0 + WQ.gapHalf + 8, Math.min(A.x1 - WQ.gapHalf - 8, near.x + side * d)); e.gapDir = c.ringDir ? Math.sign(c.ringDir) : -side;
      e.mode = 'ringTell'; e.modeT = WQ.ringTell; ev.push({ t: 'ringTell', gap: gapOf(e) });
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, 'THE BONFIRE RING: FIND THE GAP', '#ff6b6b'); c.sound('floorTell'); return ev; }
    if (e.tossCd <= 0 && near) { e.mode = 'tossTell'; e.modeT = WQ.tossTell; ev.push({ t: 'tossTell' });   /* (claude/fairfix3) THE WICKER BALL */
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, 'THE WICKER BALL: STRIKE IT BACK', '#ff6b6b'); c.sound('lashTell'); return ev; }
    if (e.lashCd <= 0) { const kind = LASH_ORDER[(e.lashN++) % LASH_ORDER.length];
      e.mode = kind === 'low' ? 'lashLowTell' : 'lashHighTell'; e.modeT = WQ.lashTell; ev.push({ t: 'lashTell', kind });
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, kind === 'low' ? 'LOW: JUMP IT' : 'HIGH: DUCK IT', '#ff6b6b'); c.sound('lashTell'); return ev; }
    if (ph >= 2 && e.sweepCd <= 0) { const kind = SWEEP_ORDER[(e.sweepN++) % SWEEP_ORDER.length];   /* (claude/fairfix3) THE RIBBON SWEEP, phases 2 and 3 */
      e.mode = kind === 'low' ? 'sweepLowTell' : 'sweepHighTell'; e.modeT = WQ.sweepTell; ev.push({ t: 'sweepTell', kind });
      c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.number(e.x, e.y - 68, kind === 'low' ? 'THE RIBBONS SWEEP LOW: JUMP TWICE' : 'THE RIBBONS SWEEP HIGH: DUCK', '#ff6b6b'); c.sound('lashTell'); return ev; }
  }
  /* (claude/fairfix3) HER LEAP: every back turned, and the nearest hero far off (or she is up on a perch with her time there done): she crouches to leap */
  if (near && !seen && !(e.rest > 0) && ((up && e.perchT <= 0) || (!up && e.leapCd <= 0 && dx >= WQ.leapMin))) {
    const kind = up ? 'floor' : ph === 1 ? 'floor' : LEAP_TO[(e.leapN++) % LEAP_TO.length]; let T = null;
    if (kind === 'pole' && c.mx !== undefined) T = { kind: 'pole', x: c.mx, lift: WQ.poleLift };
    else if (kind === 'horse' && c.horses) { const hs = c.horses().filter(h => h.front && Math.abs(h.x - near.x) > 40).sort((a, b) => Math.abs(a.x - near.x) - Math.abs(b.x - near.x)); if (hs[0]) T = { kind: 'horse', x: hs[0].x, lift: hs[0].lift, i: hs[0].i }; }
    if (!T) { const back = -(near.face >= 0 ? 1 : -1), tx = Math.max(c.A.x0 + 24, Math.min(c.A.x1 - 24, near.x + back * 56)); T = { kind: 'floor', x: tx, lift: 0 }; }
    e.leapTo = T; e.mode = 'leapTell'; e.modeT = WQ.leapTell; ev.push({ t: 'leapTell', to: T });
    c.number(e.x, e.y - 78, '!!', '#ff6b6b'); c.sound('stabTell'); return ev; }
  if (up) { if (e.mode === 'creep') ev.push({ t: 'freeze' }); e.mode = 'still'; return ev; }   /* on a perch she does not walk */
  if (near && !seen) {
    toward(); const dir = e.face, sp = ph === 3 ? WQ.creepP3 : WQ.creep;
    if (!c.canStep || c.canStep(dir)) e.vx = dir * sp;
    if (e.mode !== 'creep') ev.push({ t: 'wake' });
    e.mode = 'creep';
    e.rustleT = (e.rustleT || 0) - dt; if (e.vx && e.rustleT <= 0) { e.rustleT = WQ.rustle; c.sound('rustle'); }
  } else {
    if (e.mode === 'creep') { ev.push({ t: 'freeze' }); c.sound('still'); }
    e.mode = 'still';
  }
  return ev;
}
