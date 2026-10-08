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
// ROUND FOUR (Daniel, 2026-09-28, decided):
//   HALF DAMAGE UNLESS HIS DRUM IS JAMMED (WINCH.chipMul): a blow on him on his housing lands at half, told over him (THE IRON
//     TAKES HALF: JAM HIS DRUM) - so jamming the drum IS the fight, and climbing up to cut is the slow way round. While the drum
//     is jammed (thrown, then downed) the half is off, and downed he still takes double.
//   PHASE TWO RUSTS HIS BUCKETS (winchRust): from half health every WINCH.rustEvery-th skip on his two lines comes out of its
//     station house rusted - the level's own rust rule (OR.CRACK: it holds you a moment, then gives). A skip only ever rusts
//     inside the station house, out of sight, so every rusted one you can board you SAW rusted: a ride in is a gamble you
//     choose, never an untold fall. A fall is the drum pit's: a climb, not a death.
//   HIS ROOM IS LIT (src/ore-road.js: the arena's dark zone and its lamps), so the rides read.
// ROUND SIX (Daniel, 2026-09-29, decided; claude/winch4):
//   A CLEARER JAM - THE FIGHT'S ONE RULE MADE OBVIOUS. A LIVE skip (loaded, sound, on a line running into the drum he stands on:
//     winchLive) GLOWS with its ore (ore-road.js drawBucket), so a skip that will jam him reads from one that will not at a glance;
//     riding one that will (boarded WINCH.rideIn px out or more) you hear it RUMBLE; inside WINCH.jamWarn px of his drum the jam
//     is TOLD (gold chevrons on the drum's mouth, IT WILL JAM HIS DRUM); and the jam itself CRASHES AND STALLS - the world
//     stops a beat (WINCH.jamStall), the drum crashes (its own sound), the cable snaps taut and sparks, and he is flung off.
//   PHASE THREE - HE COMES DOWN, at a quarter of his health (WINCH.footAt). Why a quarter: his retreat counts quarters (he leaves
//     a housing at 75%, 50% and 25%) and phase two starts at half, so the last quarter is the one retreat that had nowhere new to
//     go - it becomes the descent, each phase is a quarter of his health or more, and a quarter at FULL damage on foot is a
//     short duel, not a second fight. Told (HE COMES DOWN, and a red ring on the deck where he lands; the landing hurts), he
//     leaps off his housing onto the entrance deck and fights ON FOOT: THE HOOK SWUNG round him (!!, dodge: out of its reach or
//     roll through), THE WRENCH (!, block: the shield turns it, and it bites the planks - the window), and, if you are not on his
//     floor, HE TAKES A SKIP along the low line to the one you are on (!!, jump: it is a SEND with him in it). The low line runs
//     to whichever floor he is on. HIS HALF-DAMAGE RULE ENDS: on foot he has no drum to jam, so every blow lands whole
//     (winchTake). No roof, no rust, no sends in phase three - a clean duel finish.
// ROUND SEVEN (Daniel, 2026-10-08, scratch/brief-winchmaster5.md, all recs; claude/winch5). "Clunky; I just mash him and ignore the
//   carts until he jumps away; there's no reason to be totally invulnerable." So:
//   ORE ARMOUR replaces round four's half-unless-jammed (and the x0.05 chip is retired for him, B15): he wakes plated, and every time he
//     takes the cable on to a NEW housing he PACKS ORE ROUND HIMSELF (mode 'plating', WINCH.plateT, told: the haul pose and the plates
//     forming - not an attack, so not a Tell); in phase two he packs it again once he has stood bare WINCH.rearmP2 s. ARMOURED, a blade
//     lands at WINCH.armourMul (B15's floor) and CLANKS 'ORE: THROW IT' (main.js wardedDamage). BREAK IT WITH A ROCK: take one from a
//     loaded skip of his lines (src/winch-rocks.js: E, riding it or beside it; highlighted while he is plated; a first-use sign) and THROW
//     it (src/carry-throw.js's told arc) - the ore SHATTERS (winchRock) and he is knocked off his housing onto its ledge, where you are:
//     STAGGERED (WINCH.staggerT, x WINCH.staggerMul, a gold ring and a timer), then he hauls himself back up WARDED (WINCH.wardT, told:
//     a pale shell, blades at the floor, rocks turned - B3). BARE, every blow lands whole (B11) until his next housing plates him again.
//   THE RIDES MATTER: the rocks are on the skips, and the JAM stays the bonus (a loaded skip ridden into his drum: downed, x2).
//   ANTI-MASH: armoured mashing only chips, the brake bar comes down on whoever stands at his feet (a shield turns it), greed answers.
//   ONE NEW TOLD THROWN ATTACK A PHASE (A1/B5): ORE TOSS in phase one (an arcing chunk at where you are going, a ring where it lands -
//   step out of it), SPILL in phase two (he tips a high-line skip over you: a red strip under it, and its ore comes down), THE CHAIN
//   SWEEP in phase three (the hook swung low across his floor, to WINCH.sweepR - jump it). His size, the circuit, the retreats and the
//   roof are kept.
// THREE LAYERS AT ONCE (DESIGN.md): the lines keep delivering buckets, he attacks, and the roof comes down on its own clock.
// Touching him never hurts (the touch rule).
//
// PURE: no DOM, no main.js. Everything the world does is a call on `c`. Proved by tools/ore-road.mjs "THE WINCHMASTER".
import { OR } from './ore-road.js';   /* the bucket he sends is the road's own bucket: one width, so what hurts is what is drawn (C1) */
import { bakeWinchHook } from './redraw/winchmaster.js';   /* THE HOOK, on its own two frames (2026-09-24): it was bare rects before; LANE A scales the Winchmaster's own body sprite at draw time, so this stays a small sprite of its own rather than a slice of his */
let HOOK = null;   /* baked on first use, not at import: this module is imported by node tools with no `document` (ore-road.mjs, ore-ride.mjs, winchmaster-pilot.mjs), same as bakeWinchmaster() never runs outside main.js's own SPR setup */
/* drawHook: x,y in WORLD space (cx,cy subtracted here, as the rest of drawWinchFx does); frame 0 COILED, 1 OPEN */
function drawHook(g, x, y, frame, face, cx, cy) {
  HOOK = HOOK || bakeWinchHook();
  const spr = (face < 0 ? HOOK.L : HOOK.R)[frame];
  g.drawImage(spr, Math.round(x - cx) - HOOK.ax, Math.round(y - cy) - HOOK.ay);
}
export const WINCH = {
  hp: 360, pace: 22,   /* (claude/sweep1: 600 - the standard bot won 0/12 at L10) */
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
  /* ROUND FOUR: a blow while his drum runs lands at chipMul (said over him at most every chipSay s); in phase two every
     rustEvery-th skip of his lines comes out of its station rusted (the one at i % rustEvery === 1: not two in a row round the loop) */
  chipMul: 0.5, chipSay: 6, rustEvery: 3,
  /* ROUND SIX, THE CLEARER JAM (claude/winch4): a LIVE skip (loaded, sound, on a line running into his drum) glows with its ore
     (winchLive, drawn by ore-road.js drawBucket); a rider on a skip that WILL jam (boarded rideIn px out or more) hears it
     rumble every rumbleEvery s; inside jamWarn px of the drum the jam is told over it; and the jam itself stalls the world
     jamStall s (the hitstop) while the cable snaps taut and sparks for jamFx s */
  rumbleEvery: 0.42, jamWarn: 110, jamStall: 0.12, jamFx: 1.2,
  /* ROUND SIX, PHASE THREE: HE COMES DOWN at footAt of his health (see the header) - onto the entrance deck, where he walks at
     walkFoot and fights on foot: THE HOOK SWUNG round him (whirlR, red: out of its reach or roll through), THE WRENCH (in
     front of him to wrenchHit, yellow: the shield turns it, and it bites the planks bittenT s - the window), and HE TAKES A
     SKIP along the low line at rideV to the floor you are on (red: be in the air as it passes, as a SEND). cdP3 between blows */
  /* footShove: how hard a blow on foot knocks you back - a step, not a throw: the deck is eight tiles and its east edge is the drum
     pit, and the pilot's first run (a 200 px/s shove) had the swung hook's hit cost a fall on top of itself */
  footShove: 115, footAt: 0.25, walkFoot: 40, cdP3: 1.1, whirlR: 50, whirlCd: 3.2, wrenchHit: 46, wrenchCd: 2.0, bittenT: 0.9, rideV: 240, rideCd: 5.5, descendT: 0.9,
};
WINCH.tell.descend = 1.0; WINCH.tell.whirl = 0.75; WINCH.tell.wrench = 0.55; WINCH.tell.ride = 0.8;
Object.assign(WINCH.dmg, { whirl: 20, wrench: 24, ride: 24 });
/* ROUND SEVEN (claude/winch5): ORE ARMOUR, the rock, the stagger and the ward - and ORE TOSS / SPILL / THE CHAIN SWEEP (see the header).
   armourMul: a blade on his plates (or in his ward) - B15's floor. plateT: the told haul. staggerT / staggerMul: knocked off onto his
   ledge by a rock. wardT: the told ward after it. rearmP2: phase two plates him again after this long bare. rockDmg: what the rock
   itself does to him (whole). TOSS: thrown at where you will be in tossT, lands within tossR (tossH tall); range tossRange. SPILL: a
   high-line skip within spillR of where you will be, at least spillUnder over you. SWEEP: to sweepR along his floor, out of the swung
   hook's reach (whirlR + 6 and on) */
/* openCap / jamCap: AN OPENING IS NEVER THE WHOLE FIGHT (the first page run: one stagger at x2 took 80% of him) - a stagger pays out at
   most openCap of his health, a jam's downing jamCap; the blow that empties it lands what was left and the window closes (he gathers
   himself), as a mini's purse does (src/boss-greed.js MINI_CAP) */
Object.assign(WINCH, { openCap: 0.12, jamCap: 0.15 });
Object.assign(WINCH, { armourMul: 0.4, plateT: 1.1, staggerT: 4.0, staggerMul: 2, wardT: 3.0, rearmP2: 12, rockDmg: 8,
  tossCd: 5.0, tossCdP2: 4.2, tossRange: 280, tossT: 0.9, tossR: 18, tossH: 22, spillCd: 6.5, spillR: 40, spillUnder: 30, sweepCd: 3.6, sweepR: 112, sweepT: 0.35 });
Object.assign(WINCH.tell, { toss: 0.8, spill: 0.9, sweep: 0.75 });
Object.assign(WINCH.dmg, { toss: 22, sweep: 20 });
/* THE ACT I RETUNE (claude/sweep1): every blow of his at WINCH_HIT of what it was - the human-speed bot died to his send / lever / stalk at 0/12 */
export const WINCH_HIT = 0.55; for (const k of Object.keys(WINCH.dmg)) WINCH.dmg[k] = Math.round(WINCH.dmg[k] * WINCH_HIT);
const SAY = { reverseTell: 'HE THROWS THE BRAKE', sendTell: 'HE SENDS ONE DOWN', hookTell: 'THE HOOK', leverTell: 'THE BRAKE BAR', leapTell: 'HE CROUCHES TO LEAP',
  descendTell: 'HE COMES DOWN', whirlTell: 'HE SWINGS THE HOOK', wrenchTell: 'THE WRENCH', rideTell: 'HE TAKES A SKIP',
  tossTell: 'ORE TOSS', spillTell: 'HE TIPS A SKIP OVER YOU', sweepTell: 'THE CHAIN SWEEPS LOW' };
const RED = new Set(['sendTell', 'hookTell', 'leapTell', 'descendTell', 'whirlTell', 'rideTell', 'tossTell', 'spillTell', 'sweepTell']);
/* OPEN: downed by a jam, or STAGGERED by a rock that broke his ore (round seven) */
export const winchOpen = e => e.mode === 'downed' || e.mode === 'stagger';
/* HIS DRUM IS JAMMED from the moment a loaded skip goes into it until he cuts loose: thrown off the housing, then downed on its ledge
   (a rock that knocks him off - e.why 'ore' - leaves his drum running: that is no jam) */
export const winchJammed = e => (e.mode === 'thrown' && e.why !== 'ore') || e.mode === 'downed';
/* OFF HIS HOUSING: thrown, downed or staggered on its ledge (nothing jams a drum he is not on) */
const offDrum = e => e.mode === 'thrown' || e.mode === 'downed' || e.mode === 'stagger';
/* ROUND SEVEN: HIS ORE ARMOUR - on, or forming (a rock thrown while he packs it shatters what is there) - in phases one and two */
export const winchArmoured = e => !!e && e.phase !== 3 && (!!e.armour || e.mode === 'plating');
/* WHAT A BLOW ON HIM IS WORTH: x2 downed or staggered; whole while he is thrown, on foot (phase three) or BARE; his ORE ARMOUR, or his
   ward after a stagger, takes it at armourMul (B15's floor - never nothing) */
/* THE PURSE (round seven): what a blow in his opening (dmg, already doubled) actually takes off him - and the one that empties it closes
   the window (the stagger or the downing ends this frame) */
export function winchPurse(e, dmg) { if (!winchOpen(e) || !(dmg > 0)) return dmg; if (!(e.purse > 0)) e.purse = e.maxHp * (e.mode === 'stagger' ? WINCH.openCap : WINCH.jamCap);
  const d = Math.min(dmg, Math.ceil(e.purse)); e.purse -= d; if (e.purse <= 0.5) { e.purse = 0; e.modeT = Math.min(e.modeT, 0); } return d; }
export const winchTake = e => winchOpen(e) ? (e.mode === 'stagger' ? WINCH.staggerMul : WINCH.downMul) : (e.mode === 'thrown' || e.phase === 3) ? 1 : (e.ward > 0 || winchArmoured(e)) ? WINCH.armourMul : 1;
/* ROUND SIX: A LIVE SKIP - one that jams his drum if you ride it in: loaded, sound, not falling, on a line running INTO the housing
   he stands on (`into`: which housing its line runs into now, main.js winchInto), and only while he has a drum (phases one and two).
   It is the skip that glows */
export const winchLive = (e, into, m) => !!e && !!m && e.alive && e.phase !== 3 && !offDrum(e) && e.mode !== 'sleep' && into === e.at && !!m.ore && !m.cracked && !(m.fallen > 0);
/* THE FLOORS HE FIGHTS ON IN PHASE THREE, off OR.ARENA: the entrance deck (under the Head Frame, to its ladder) and the Great Drum's
   ledge - the two ends of the low line */
export function winchFloors() {
  const A = OR.ARENA, GA = A.housings[0], HB = A.housings[1], T = 16;
  return [{ id: 'deck', x0: A.x0 * T, x1: HB.ladder[0] * T, y: (A.deck + 1) * T }, { id: 'ledge', x0: GA.ledge[0] * T, x1: (GA.ledge[1] + 1) * T, y: (GA.ledgeTop + 1) * T }];
}
/* ROUND FOUR, PHASE TWO: is skip i of his lines rusted as it comes out of its station house now (main.js asks only while a skip
   is in the return, out of sight, so none turns to rust under a rider) */
export const winchRust = (e, i) => !!e && e.alive && e.phase === 2 && i % WINCH.rustEvery === 1;
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
    case 'thrown': return 9; case 'downed': case 'stagger': return 10; case 'plating': return 11;   /* (round seven: staggered he is down on his ledge as a jam leaves him; packing ore he hauls it up) */
    case 'tossTell': case 'sweepTell': return 7; case 'toss': case 'sweep': return 8; case 'spillTell': return 5; case 'spill': return 6; case 'letgo': case 'swing': case 'leap': return 11;
    case 'leapTell': return 5;   /* the crouch: both hands down on the brake, his weight sunk */
    /* PHASE THREE, on foot: the same sheet - the crouch and the haul for the descent, the arm back and through for THE HOOK swung,
       the bar up and down for THE WRENCH (and down while it is bitten into the planks), the haul on the cable for the ride */
    case 'descendTell': return 5; case 'descend': return 11;
    case 'whirlTell': return 7; case 'whirl': return 8;
    case 'wrenchTell': return 3; case 'wrench': case 'bitten': return 4;
    case 'rideTell': return 6; case 'ride': return 11;
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
/* how (round seven): 'wake' - the fight starts and he is already plated; 'circuit' - a NEW housing off the cable (a retreat, or cut loose
   after a jam): he packs ore round himself, told; 'back' - hauled back up onto the SAME housing after a stagger: still bare, and the
   quarter he retreats on is still counted from where it was; 'leap' - phase two's leap: his ore as it was */
function arrive(e, c, at, how) {
  const H = c.H[at]; e.at = at; e.x = H.homeX; e.y = H.topY; e.vx = 0; e.mode = 'stalk'; e.cd = 0.9; e.revT = 0; e.why = undefined;
  if (how !== 'back') e.qMark = e.hp;   /* the quarter he retreats on is counted from here */
  e.leapCd = WINCH.leapEvery;
  driveAll(e, c, mulOf(e));
  if (how === 'wake') { e.armour = true; e.bareT = 0; c.say('HIS ORE ARMOUR: TAKE A ROCK FROM A SKIP AND THROW IT', false); }
  else if (how === 'circuit' && !e.armour) plate(e, c);
}
/* ROUND SEVEN: HE PACKS ORE ROUND HIMSELF - told (the haul pose, the plates forming over WINCH.plateT, said), never an attack */
function plate(e, c) { e.mode = 'plating'; e.modeT = WINCH.plateT; e.vx = 0; e.bareT = 0; c.say('HE PACKS ORE ROUND HIMSELF: THROW A ROCK', false); c.sound('heavy'); }
/* ROUND SEVEN, THE ROCK: main.js (src/winch-rocks.js) calls this the frame a thrown rock reaches him. Returns 'shatter' (his ore broke:
   he is knocked off onto his ledge, to be STAGGERED there), 'warded' (his ward after a stagger turns it), 'hit' (bare, on foot, or
   already down: a rock, whole) or 'miss' (asleep) */
export function winchRock(e, c) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return 'miss';
  if (e.ward > 0 && e.phase !== 3) return 'warded';
  if (e.phase === 3 || ['thrown', 'downed', 'stagger', 'letgo', 'swing', 'leap', 'descendTell', 'descend'].includes(e.mode)) return 'hit';
  if (!winchArmoured(e)) return 'hit';
  const H = c.H[e.at];
  e.armour = false; e.bareT = 0; e.hk = null; e.toss = null; e.rockN = (e.rockN || 0) + 1;
  for (let r = e.runaway, prev = null; r; r = r.next) { if (r.delay > 0) { if (prev) prev.next = null; else e.runaway = null; break; } prev = r; }
  e.mode = 'thrown'; e.why = 'ore'; e.modeT = WINCH.thrownT; e.fromY = e.y; e.fromX = e.x; e.toX = H.ledgeX; e.toY = H.ledgeY; e.vx = 0;
  c.say('THE ORE SHATTERS: HE IS KNOCKED OFF', false, true); c.sound('crash'); c.shake(6); if (c.stall) c.stall(0.08);
  return 'shatter';
}
/* THE LINES, for the housing he is on: the next one's line runs in (so you can be on it before he lands), then his own, which wins
   when the two share a line. EXCEPT THE LOW LINE, which runs into the Great Drum ONLY while he is on it, and back to the deck
   otherwise - round three made the room's floor the pit, and the Great Drum's ledge has no other way off it: with the low line
   running in while he stood on the Tail Wheel (bound for the Great Drum), a hero on that ledge could reach him only through the
   spikes (measured: the lab's hands took 20% a time doing exactly that, over and over) */
function driveAll(e, c, mul) {
  c.drive(0, e.at === 0 ? 1 : -1, mul);
  if (winchNext(e.at) !== 0) c.drive(winchNext(e.at), 1, mul);
  c.drive(e.at, 1, mul);
}
/* THE JAM: main.js calls this the frame a LOADED bucket, with a rider who boarded it at least WINCH.rideIn px out, reaches the
   drum of the housing he stands on. The cable locks (the world's job) and he goes off the housing. Returns true if it took him */
export function winchJam(e, c) {
  if (!e || !e.alive || e.phase === 3 || e.mode === 'thrown' || e.mode === 'downed' || e.mode === 'stagger' || e.mode === 'letgo' || e.mode === 'swing' || e.mode === 'leap' || e.mode === 'sleep' || e.mode === 'wake') return false;   /* (phase three: he has come down off his drums - there is nothing to jam) */
  const H = c.H[e.at];
  e.mode = 'thrown'; e.why = 'jam'; e.modeT = WINCH.thrownT; e.fromY = e.y; e.fromX = e.x; e.toX = H.ledgeX; e.toY = H.ledgeY; e.vx = 0; e.revT = 0; e.hk = null; e.toss = null;
  e.armour = false;   /* (round seven: the crash shakes his ore off too - he packs it again on the housing he swings to) */
  /* a jammed drum lets nothing go: a bucket still waiting to be sent is not sent (one already on the line goes on) */
  for (let r = e.runaway, prev = null; r; r = r.next) { if (r.delay > 0) { if (prev) prev.next = null; else e.runaway = null; break; } prev = r; }
  /* ROUND SIX: THE CRASH AND THE STALL, so the jam READS: the world stops a beat (the hitstop), the drum crashes, the cable snaps
     taut and sparks off the jammed drum for jamFx s (drawWinchFx), and he is flung off - higher than before - onto his ledge */
  e.jamT = WINCH.jamFx; e.jamAt = e.at; e.jamWarn = false;
  c.say('THE DRUM JAMS: HE GOES OFF THE HOUSING', false, true); c.sound('jam'); c.shake(9); if (c.stall) c.stall(WINCH.jamStall);
  return true;
}
/* THE CIRCUIT: off whatever he stands on and onto the cable, to the next housing. He is not open while he does it (the window
   was the downed one), and it is short (A5) */
function letGo(e, c, why) {
  e.mode = 'letgo'; e.modeT = WINCH.tell.letgo; e.open = 0;
  c.say(why || 'HE TAKES THE CABLE', false); c.sound('clank');
}
/* THE HOOK, thrown (on a housing, and on foot at a hero out of his floor's reach): at where you will be hookLead s from now */
function throwHook(e, c) {
  const P = c.P;
  /* it leads you ALONG, never UP: a lead on your vertical speed followed a jump into the air and made the jump no answer at all
     (the lab: 0 wins in 24, every one of them hooked out of a jump) */
  const x0 = e.x + e.face * 10, y0 = e.y - WINCH.hand, v = c.pVel(), tx = P.x + v[0] * WINCH.hookLead, ty = P.y - 9;
  const d = Math.hypot(tx - x0, ty - y0) || 1; e.hk = { x: x0, y: y0, x0, y0, vx: (tx - x0) / d * WINCH.hookV, vy: (ty - y0) / d * WINCH.hookV, st: 'out', t: 0, caught: false };
}
/* ROUND SEVEN, ORE TOSS: a chunk off his drum lobbed at where you will be when it lands (tossT s on, along your way and the skip's - never
   up), and a red ring there from the moment it leaves his hand: step out of the ring, or be over it as it lands */
const tossAim = (e, c) => { const P = c.P, v = c.pVel(), tx = P.x + v[0] * WINCH.tossT * 0.85;
  return { tx, ty: (P.ground || P.onMover || !c.groundY) ? P.y : c.groundY(tx, P.y) }; };
function throwToss(e, c) { const a = tossAim(e, c); e.toss = { x0: e.x + e.face * 10, y0: e.y - WINCH.hand, tx: a.tx, ty: a.ty, t: 0, T: WINCH.tossT }; }
/* ROUND SIX, PHASE THREE: HE COMES DOWN. Told (the crouch, HE COMES DOWN in red, a red ring on the deck where he lands - drawn by
   drawWinchFx, and the landing hurts whoever is in it), then a leap off whatever he is on to the middle of the entrance deck.
   His drum, his windups, his sent buckets still to go, his rocks still to fall: all dropped. A hook already in the air flies on */
function comeDown(e, c) {
  const F = winchFloors()[0];
  e.phase = 3; begin(e, 'descend', c); e.vx = 0; e.open = 0; e.revT = 0; e.rocks = []; e.leapTo = undefined;
  e.armour = false; e.ward = 0; e.why = undefined; e.backTo = undefined; e.swingTo = undefined; e.toss = null; e.spillM = null; e.sweepCd = 1.5;   /* (round seven: no ore on foot - the duel is whole) */
  for (let r = e.runaway, prev = null; r; r = r.next) { if (r.delay > 0) { if (prev) prev.next = null; else e.runaway = null; break; } prev = r; }
  e.fromX = e.x; e.fromY = e.y; e.toX = (F.x0 + F.x1) / 2; e.toY = F.y; e.fl = 0; e.face = Math.sign(e.toX - e.x) || e.face || -1;
  e.whirlCd = 0; e.wrenchCd = 0; e.rideCd = WINCH.rideCd * 0.5; e.hookCd = Math.max(e.hookCd || 0, 2);
  c.sound('roar'); c.shake(5);
}
/* THE LOW LINE, IN PHASE THREE, RUNS TO WHICHEVER FLOOR HE IS ON (so from the other one you can always ride to him), and the high line
   runs home to the Head Frame's ledge, whose ladder goes down to the deck - nobody is left up on the Tail Wheel with no way to him */
function driveFoot(e, c) { c.drive(0, e.fl === 1 ? 1 : -1, 1); c.drive(1, 1, 1); }
const onFloor = (c, F) => { const P = c.P; return !P.dead && !!P.ground && !P.onMover && Math.abs(P.y - F.y) < 4 && P.x > F.x0 - 8 && P.x < F.x1 + 8; };
/* ON FOOT: he walks at you along his floor and fights you there - THE HOOK SWUNG round him and THE WRENCH, in turn - and if you are
   not on his floor he takes a skip along the low line to the one you are on (or throws the hook at you, if you are in its reach) */
function stepFoot(e, dt, c) {
  const P = c.P, FL = winchFloors(), lo = c.H[0].ln;
  if (e.mode === 'descendTell') { e.x = e.fromX; e.y = e.fromY; if (e.modeT <= 0) { e.mode = 'descend'; e.modeT = WINCH.descendT; c.sound('whoosh'); } return; }
  if (e.mode === 'descend') { const k = 1 - Math.max(0, e.modeT) / WINCH.descendT;
    e.x = e.fromX + (e.toX - e.fromX) * k; e.y = e.fromY + (e.toY - e.fromY) * k - Math.sin(k * Math.PI) * 40;
    if (e.modeT <= 0) { e.x = e.toX; e.y = e.toY; e.mode = 'foot'; e.cd = 1.2; e.fl = 0; driveFoot(e, c); c.shake(7); c.sound('crash');
      if (onFloor(c, FL[0]) && Math.abs(P.x - e.x) < WINCH.leapHit) { const r = c.hit(e.x, WINCH.dmg.leap, true, 'HIS LANDING'); if (r === 'hit') c.shove((Math.sign(P.x - e.x) || 1) * 200, -180); }
      c.say('NO DRUM TO HIDE BEHIND: EVERY BLOW LANDS WHOLE', false, true); }
    return; }
  for (const k of ['whirlCd', 'wrenchCd', 'rideCd', 'sweepCd']) e[k] = Math.max(0, (e[k] ?? 0) - dt);
  /* THE RIDE: in a skip along the low line to the other floor, and the skip takes anyone at the line's height it passes */
  if (e.mode === 'ride') { const r = e.ride; r.s = Math.min(r.len, r.s + WINCH.rideV * dt); e.x = r.x0 + r.dir * r.s; const ly = c.lineY(0, e.x); e.y = ly === null ? e.y : ly;
    if (!r.hit && !P.dead && Math.abs(P.x - e.x) < WINCH.sendR && Math.abs(P.y - e.y) < WINCH.sendH) { r.hit = true; const res = c.hit(e.x, WINCH.dmg.ride, true, 'HIS SKIP'); if (res === 'hit') c.shove(r.dir * 190, -200); }
    if (r.s >= r.len) { const F = FL[r.to]; e.fl = r.to; e.y = F.y; e.x = Math.max(F.x0 + 14, Math.min(F.x1 - 14, e.x)); e.mode = 'foot'; e.cd = WINCH.cdP3; e.ride = null; driveFoot(e, c); c.sound('thud'); c.shake(3); }
    return; }
  const F = FL[e.fl || 0]; e.y = F.y;
  if (e.mode.endsWith('Tell')) {
    if (e.modeT > 0) return;
    if (e.mode === 'whirlTell') { e.mode = 'whirl'; e.modeT = 0.35; e.whirlCd = WINCH.whirlCd; e.whirlHit = false; c.sound('whoosh'); }
    else if (e.mode === 'wrenchTell') { e.mode = 'wrench'; e.modeT = 0.2; e.wrenchCd = WINCH.wrenchCd; c.sound('heavy'); c.shake(3);
      /* THE WRENCH comes down in front of him: the one blow of his on foot a shield turns (the brake bar's, carried down off the drum) */
      const fx = (P.x - e.x) * e.face;
      if (!P.dead && fx > -8 && fx < WINCH.wrenchHit && Math.abs(P.y - e.y) < 30) { const r = c.hit(e.x, WINCH.dmg.wrench, false, 'THE WRENCH'); if (r === 'hit') c.shove(e.face * WINCH.footShove, -120); }
      return; }
    else if (e.mode === 'rideTell') { const x0 = e.x, xs = lo.pts.map(p => p[0]), to = e.fl === 1 ? 0 : 1, x1 = to === 1 ? Math.max(...xs) : Math.min(...xs);
      e.mode = 'ride'; e.ride = { x0, dir: Math.sign(x1 - x0) || 1, len: Math.abs(x1 - x0), s: 0, to, hit: false }; e.rideCd = WINCH.rideCd; e.face = e.ride.dir; c.sound('clank'); return; }
    else if (e.mode === 'hookTell') { e.mode = 'hook'; e.modeT = 0.45; e.hookCd = WINCH.hookCdP2; c.sound('whoosh'); throwHook(e, c); return; }
    else if (e.mode === 'sweepTell') { e.mode = 'sweep'; e.modeT = WINCH.sweepT; e.sweepCd = WINCH.sweepCd; e.sweepHit = false; c.sound('whoosh'); c.shake(2); return; }
  }
  /* ROUND SEVEN, THE CHAIN SWEEP: the hook swung LOW across his floor, out in front of him to sweepR - whoever is standing on it is taken
     off their feet (no shield turns it: be in the air as it passes) */
  if (e.mode === 'sweep') { const fx = (P.x - e.x) * e.face;
    if (!e.sweepHit && !P.dead && onFloor(c, F) && fx > -8 && fx < WINCH.sweepR) { e.sweepHit = true; const r = c.hit(P.x, WINCH.dmg.sweep, true, 'THE CHAIN SWEEP'); if (r === 'hit') c.shove(e.face * WINCH.footShove, -140); }
    if (e.modeT <= 0) { e.mode = 'foot'; e.cd = WINCH.cdP3; } return; }
  /* THE HOOK SWUNG: round him on its chain, the whole circle, at a hero's height - anyone inside whirlR as it goes round is caught
     (no shield: step out of its reach, roll through it, or be over it) */
  if (e.mode === 'whirl') { if (!e.whirlHit && !P.dead && Math.abs(P.x - e.x) < WINCH.whirlR && Math.abs(P.y - e.y) < 30) { e.whirlHit = true;
      const r = c.hit(e.x, WINCH.dmg.whirl, true, 'THE HOOK, SWUNG'); if (r === 'hit') c.shove((Math.sign(P.x - e.x) || 1) * WINCH.footShove, -120); }
    if (e.modeT <= 0) { e.mode = 'foot'; e.cd = WINCH.cdP3; } return; }
  /* THE WRENCH BITES THE PLANKS: he hauls it free for bittenT s - the duel's window */
  if (e.mode === 'wrench') { if (e.modeT <= 0) { e.mode = 'bitten'; e.modeT = WINCH.bittenT; c.say('THE WRENCH BITES THE PLANKS', false, true); } return; }
  if (e.mode === 'bitten' || e.mode === 'hook') { if (e.modeT <= 0) { e.mode = 'foot'; e.cd = WINCH.cdP3; } return; }
  e.mode = 'foot';
  const same = onFloor(c, F), dx = P.x - e.x;
  const want = same && Math.abs(dx) > 26 ? Math.sign(dx) : 0;
  e.x = Math.max(F.x0 + 14, Math.min(F.x1 - 14, e.x + want * WINCH.walkFoot * dt)); e.vx = want * WINCH.walkFoot; e.face = Math.sign(dx) || e.face;
  if (P.dead) return;
  if (!c.seen()) { e.cd = Math.max(e.cd, 0.25); return; }
  if (e.cd > 0) return;
  if (same) {
    /* the swing and the wrench in turn (neither starves the other): the wrench only from arm's length, the swing from inside its reach */
    const can = [], d = Math.abs(dx);
    if (d < WINCH.wrenchHit - 4 && e.wrenchCd <= 0) can.push('wrench');
    if (d < WINCH.whirlR + 6 && e.whirlCd <= 0) can.push('whirl');
    if (d >= WINCH.whirlR + 6 && d < WINCH.sweepR - 6 && e.sweepCd <= 0) can.push('sweep');   /* (round seven: out of the swung hook's reach, along his floor - the chain sweep) */
    const pick = can.length > 1 ? can.find(k => k !== e.last) : can[0];
    if (pick) { e.last = pick; begin(e, pick, c); return; }
    e.cd = 0.2; return; }
  /* NOT ON HIS FLOOR: on the low line, or on the other floor, and he takes a skip to you; up anywhere else in reach of the chain, the hook */
  const other = FL[e.fl === 1 ? 0 : 1];
  if (onFloor(c, other) && e.rideCd <= 0 && !c.climbing()) { begin(e, 'ride', c); return; }   /* (round seven: only at a hero standing on the OTHER floor - a rider on the low line is coming to him (it runs to his floor), and riding off past them made phase three a chase with no end: the page bot rode the line both ways for three minutes) */
  const hd = Math.hypot(P.x - e.x, (P.y - 9) - (e.y - WINCH.hand));
  if (!e.hk && !c.climbing() && e.hookCd <= 0 && hd < WINCH.hookR * 0.9 && hd > WINCH.whirlR + 12) { begin(e, 'hook', c); return; }
  e.cd = 0.3;
}
export function updateWinchmaster(e, dt, c) {
  const { P } = c;
  if (!e.alive || e.mode === 'sleep') return;
  if (e.at === undefined) e.at = 0;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = (e.cd ?? 1) - dt;
  for (const k of ['revCd', 'sendCd', 'hookCd', 'leverCd', 'leapCd', 'tossCd', 'spillCd', 'ward']) e[k] = Math.max(0, (e[k] ?? 0) - dt);
  const H = c.H[e.at];
  if (e.hp <= e.maxHp * 0.5 && (e.phase || 1) < 2) { e.phase = 2; e.rockT = Math.min(e.rockT ?? 0, 1.5);
    c.say('ENRAGED, HE LEAPS DRUM TO DRUM', true);   /* round three: the leap is what phase two IS (A10); the harder drums come with it */ c.sound('roar'); c.shake(4); if (e.mode === 'stalk') driveAll(e, c, WINCH.p2Mul);
    e.rustSayT = 1.6; }   /* round four: and his skips start to rust - said once the leap's line has been read */
  e.chipSaid = Math.max(0, (e.chipSaid || 0) - dt);
  if (e.rustSayT > 0) { e.rustSayT -= dt; if (e.rustSayT <= 0) c.say('HIS SKIPS RUST: THE RED ONES GIVE WAY', true); }
  /* THE ROOF: the drums shake a rock loose over where you stand, on their own clock. It is told for WINCH.rockTell - dust off the
     roof and a ring where it lands - and only ever begun on your screen (c.rockSpot answers null otherwise, and the clock waits) */
  if (e.mode !== 'wake' && !P.dead && e.phase !== 3) { e.rockT = (e.rockT ?? WINCH.rockEvery * 0.6) - dt;
    if (e.rockT <= 0) { const sp = c.rockSpot(P.x + (c.rand() - 0.5) * 60); if (sp) { (e.rocks || (e.rocks = [])).push({ x: sp.x, y0: sp.y0, gy: sp.gy, t: WINCH.rockTell }); c.sound('crack'); e.rockT = e.phase === 2 ? WINCH.rockEveryP2 : WINCH.rockEvery; } else e.rockT = 0.3; } }
  for (const r of (e.rocks || [])) { r.t -= dt; if (r.t <= 0 && !r.done) { r.done = true; c.dropRock(r.x, r.y0); } }
  if (e.rocks) e.rocks = e.rocks.filter(r => !r.done);
  /* THE REVERSE runs out on its own clock, whatever he is doing */
  if (e.revT > 0) { e.revT -= dt; if (e.revT <= 0) c.drive(e.revAt ?? e.at, 1, mulOf(e)); }
  /* ROUND SEVEN, ORE TOSS in the air: it comes down where its ring is, on its own clock, whatever becomes of him */
  if (e.toss) { const q = e.toss; q.t += dt;
    if (q.t >= q.T) { e.toss = null; c.crash(q.tx, q.ty);
      if (!P.dead && Math.abs(P.x - q.tx) < WINCH.tossR && Math.abs(P.y - q.ty) < WINCH.tossH) { const r = c.hit(q.tx, WINCH.dmg.toss, true, 'ORE TOSS'); if (r === 'hit') c.shove((Math.sign(P.x - q.tx) || 1) * 140, -150); } } }
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
  /* ROUND SIX, THE CLEARER JAM: a rider on a skip that WILL jam his drum (loaded, sound, boarded far enough out, coming in) hears it
     RUMBLE, and inside jamWarn px of the drum the jam is TOLD over it (drawn as a flashing gold mark on the drum's mouth, said once a ride) */
  e.jamT = Math.max(0, (e.jamT || 0) - dt);
  { const rd = e.phase !== 3 && !winchJammed(e) && e.mode !== 'wake' ? c.riding(e.at) : null, armed = !!(rd && rd.coming && rd.armed);
    if (armed) { e.rumbleT = (e.rumbleT || 0) - dt; if (e.rumbleT <= 0) { e.rumbleT = WINCH.rumbleEvery; c.sound('rumble'); } } else e.rumbleT = 0;
    const warn = armed && rd.dist < WINCH.jamWarn; if (warn && !e.jamWarn) c.say('IT WILL JAM HIS DRUM: RIDE IT IN', false, true); e.jamWarn = warn; }
  /* ROUND SIX, PHASE THREE: at a quarter of his health HE COMES DOWN - from whatever he is doing that he can stop (a windup is
     dropped, told or not yet thrown; a downed man tears free) but never out of the air (thrown, the cable, the leap: he lands first) */
  if (e.phase !== 3 && e.hp <= e.maxHp * WINCH.footAt && !['thrown', 'letgo', 'swing', 'leap', 'wake', 'sleep'].includes(e.mode)) { comeDown(e, c); return; }
  if (e.mode === 'wake') { e.y = H.topY; if (e.modeT <= 0) { arrive(e, c, e.at, 'wake'); e.cd = 1.0; } return; }
  // ---- THE OPENING, and the circuit ----
  if (e.mode === 'thrown') { const k = 1 - Math.max(0, e.modeT) / WINCH.thrownT;   /* an arc off the housing onto its own ledge */
    e.x = e.fromX + (e.toX - e.fromX) * k; e.y = e.fromY + (e.toY - e.fromY) * k - Math.sin(k * Math.PI) * 40;   /* (round six: flung, not stepped down - 24 px read as a hop) */
    if (e.modeT <= 0) { e.x = e.toX; e.y = e.toY; c.shake(4); c.sound('thud');
      if (e.why === 'ore') { e.mode = 'stagger'; e.modeT = WINCH.staggerT; e.purse = e.maxHp * WINCH.openCap; c.say('STAGGERED: STRIKE NOW', false, true); }   /* (round seven: a rock broke his ore - STAGGERED on his ledge) */
      else { e.mode = 'downed'; e.modeT = WINCH.downT; e.purse = e.maxHp * WINCH.jamCap; } } return; }
  /* ROUND SEVEN, STAGGERED: still on his ledge (B4), open (a gold ring and its clock), x staggerMul. Then he gathers himself - WARDED for
     wardT, told - and hauls himself back up onto the same housing; or, a quarter of him gone since he came to it, retreats to the next */
  if (e.mode === 'stagger') { e.vx = 0; e.open = Math.max(0, e.modeT);
    if (e.modeT <= 0) { e.open = 0; const quarter = e.qMark !== undefined && e.qMark - e.hp >= e.maxHp * WINCH.retreat;
      if (!quarter) { e.backTo = e.at; e.ward = WINCH.wardT; }   /* (a retreat needs no ward: he swings away, and packs fresh ore on the next housing) */ letGo(e, c, quarter ? 'HE RETREATS: HE TAKES THE CABLE' : 'HE GATHERS HIMSELF: WARDED'); } return; }
  if (e.mode === 'downed') { e.vx = 0; e.open = Math.max(0, e.modeT); if (e.modeT <= 0) letGo(e, c, 'HE CUTS LOOSE AND TAKES THE CABLE'); return; }
  e.open = 0;
  if (e.mode === 'letgo') { if (e.modeT <= 0) { e.swingTo = e.backTo ?? winchNext(e.at); const N = c.H[e.swingTo]; e.mode = 'swing'; e.modeT = WINCH.swingT; e.fromX = e.x; e.fromY = e.y; e.toX = N.homeX; e.toY = N.topY; e.face = Math.sign(N.homeX - e.x) || e.face; c.sound('whoosh'); } return; }
  /* THE LEAP: a high arc over the room onto the housing the ring was on, and the landing hurts whoever is under it */
  if (e.mode === 'leap') { const k = 1 - Math.max(0, e.modeT) / WINCH.leapT;
    e.x = e.fromX + (e.toX - e.fromX) * k; e.y = e.fromY + (e.toY - e.fromY) * k - Math.sin(k * Math.PI) * 40;   /* (70 carried him up through the cavern roof and under the HUD: seen in the real page) */
    if (e.modeT <= 0) { const to = e.leapTo; arrive(e, c, to, 'leap'); c.shake(6); c.sound('crash'); c.say('HE LANDS', true);
      if (!P.dead && c.onHousing(to) && Math.abs(P.x - e.x) < WINCH.leapHit) { const r = c.hit(e.x, WINCH.dmg.leap, true, 'HIS LANDING'); if (r === 'hit') c.shove((Math.sign(P.x - e.x) || 1) * 200, -180); } }
    return; }
  if (e.mode === 'swing') { const k = 1 - Math.max(0, e.modeT) / WINCH.swingT;   /* on the cable, a swing and not a walk: it dips and comes up */
    e.x = e.fromX + (e.toX - e.fromX) * k; e.y = e.fromY + (e.toY - e.fromY) * k + Math.sin(k * Math.PI) * 30;
    if (e.modeT <= 0) { const back = e.backTo !== undefined, to = e.swingTo ?? winchNext(e.at); e.backTo = undefined; e.swingTo = undefined; c.shake(3); c.sound('thud'); if (!back) c.say(c.H[to].name, false); arrive(e, c, to, back ? 'back' : 'circuit'); } return; }
  if (e.phase === 3) { stepFoot(e, dt, c); return; }
  e.y = H.topY;
  /* ROUND SEVEN: PACKING ORE (told, the haul): when it is done the plates are on */
  if (e.mode === 'plating') { e.vx = 0; if (e.modeT <= 0) { e.armour = true; e.bareT = 0; e.mode = 'stalk'; e.cd = 0.5; c.sound('clank'); } return; }
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
      throwHook(e, c); return; }
    if (e.mode === 'tossTell') { e.mode = 'toss'; e.modeT = 0.35; e.tossCd = e.phase === 2 ? WINCH.tossCdP2 : WINCH.tossCd; c.sound('whoosh'); throwToss(e, c); return; }
    /* SPILL: the skip he picked is jerked and tips - its ore comes down where the red strip under it was (c.dropRock: the room's own
       falling rock, a shadow under each) - or nothing, if the skip has gone into its station house meanwhile */
    if (e.mode === 'spillTell') { e.mode = 'spill'; e.modeT = 0.35; e.spillCd = WINCH.spillCd; const s = c.skipAt ? c.skipAt(e.spillM) : null; e.spillM = null;
      if (s) { for (const k of [-14, 0, 14]) c.dropRock(s.x + k, s.y + 8); c.sound('crash'); c.shake(2); } return; }
    if (e.mode === 'leapTell') { const N = c.H[e.leapTo]; e.mode = 'leap'; e.modeT = WINCH.leapT; e.fromX = e.x; e.fromY = e.y; e.toX = N.homeX; e.toY = N.topY;
      e.face = Math.sign(N.homeX - e.x) || e.face; c.sound('whoosh'); return; }
    if (e.mode === 'leverTell') { e.mode = 'lever'; e.modeT = 0.35; e.leverCd = WINCH.leverCd; c.sound('whoosh'); c.shake(2);
      /* the bar sweeps the drum's mouth AND his own housing top: whoever came up after him gets it too, and it throws them off
         the edge toward the gorge. It is still the one blow a shield turns */
      if (!P.dead && (c.atMouth(e.at, WINCH.leverHit) || (c.onHousing(e.at) && Math.abs(P.x - e.x) < WINCH.leverHit))) { const r = c.hit(e.x, WINCH.dmg.lever, false, 'THE BRAKE BAR'); if (r === 'hit') c.shove(H.away * 200, -160); }
      return; }
  }
  if (e.mode === 'reverse' || e.mode === 'send' || e.mode === 'hook' || e.mode === 'lever' || e.mode === 'toss' || e.mode === 'spill') { if (e.modeT <= 0) { e.mode = 'stalk'; e.cd = e.phase === 2 ? WINCH.cdP2 : WINCH.cd; } return; }
  /* HE RETREATS: a quarter of his health lost on this housing and he takes the cable to the next, told (A5: it is short) */
  if (e.qMark !== undefined && e.qMark - e.hp >= e.maxHp * WINCH.retreat) { letGo(e, c, 'HE RETREATS: HE TAKES THE CABLE'); return; }
  /* ROUND SEVEN, PHASE TWO PLATES HIM MORE OFTEN: bare for rearmP2 s on a housing (out of his ward), he packs ore again */
  if (e.phase === 2 && !e.armour && !(e.ward > 0)) { e.bareT = (e.bareT || 0) + dt; if (e.bareT >= WINCH.rearmP2 && !P.dead) { plate(e, c); return; } }
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
  /* (round seven: PLATED HE HOLDS HIS DRUM - the ore is heavy; it is BARE that he leaps. So phase two goes: break his ore, and he is all
     over the room - whole to every blade - until he packs it again) */
  if (e.phase === 2 && e.leapCd <= 0 && !winchArmoured(e)) { let to = [0, 1, 2].find(i => i !== e.at && c.onHousing(i)); if (to === undefined) to = winchNext(e.at);
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
  /* ROUND SEVEN, ORE TOSS: at anyone in its range who is not up on his housing with him, not on a ladder and not at his drum's mouth (the
     bar's) - and SPILL in phase two: a loaded high-line skip that will be over you as it tips (c.skipOver: within spillR of where you will
     be, at least spillUnder above you) */
  if (!e.toss && !climbing && !atMouth && !c.onHousing(e.at) && e.tossCd <= 0 && hd > WINCH.leverHit + 12 && hd < WINCH.tossRange) can.push('toss');
  if (e.phase === 2 && !climbing && e.spillCd <= 0 && c.skipOver) { const v = c.pVel(), sk = c.skipOver(P.x + v[0] * WINCH.tell.spill, WINCH.tell.spill);
    if (sk && P.y > sk.y + WINCH.spillUnder) { can.push('spill'); e.spillPick = sk.id; } }
  /* WHICH: the one he has gone LONGEST without (a rotation, so none starves another; a tie goes in the order above) */
  const used = e.used || (e.used = {}), pick = can.length ? can.reduce((a, k) => ((used[k] ?? -1) < (used[a] ?? -1) ? k : a), can[0]) : null;
  if (pick) { used[pick] = e.anim; e.last = pick; if (pick === 'spill') e.spillM = e.spillPick; begin(e, pick, c); return; }
  if (e.sendCd <= 0 && !e.runaway && !atMouth && !climbing && !(riding && riding.dist <= WINCH.sendMin) && c.rand() < 0.4) { e.last = 'send'; begin(e, 'send', c); return; }
  e.cd = 0.4;
}
/* THE LOOK OF THE FIGHT, rects only (so work/claude/winch-art.mjs can render it in Node): the runaway bucket, the red line under a
   SEND, the chain and the hook, the bar's arc over the mouth, the line's arrows while it runs backwards, and the ring under
   him while he is down */
/* ROUND SEVEN, THE READ (B10), rects only: HIS ORE (plates of ore over his body - forming while he packs it), THE STAGGER (a gold ring
   round him on his ledge and a clock that empties over him), HIS WARD (a pale shell), and the three new told attacks: ORE TOSS (the chunk
   in his raised hand, then in the air, and a red ring where it lands), SPILL (a red strip down from the skip he tips, and on what is
   under it) and THE CHAIN SWEEP (a red line along his floor to its reach, then the hook dragged along it) */
const PLATES = [[-9, -40, 8, 6], [2, -42, 8, 6], [-12, -31, 6, 9], [7, -31, 6, 8], [-8, -23, 16, 6], [-9, -14, 6, 8], [4, -14, 6, 8], [-3, -33, 6, 5]];
const ring = (g, x, y, rx, ry, n) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; g.fillRect(Math.round(x + Math.cos(a) * rx), Math.round(y + Math.sin(a) * ry), 2, 2); } };
function drawOreRead(g, e, c, cx, cy, time) {
  const X = Math.round(e.x - cx), Y = Math.round(e.y - cy), f = e.face || 1, S = WINCH.scale;
  if (e.phase !== 3 && (e.armour || e.mode === 'plating')) {
    const n = e.mode === 'plating' ? Math.min(PLATES.length, Math.floor(PLATES.length * (1 - Math.max(0, e.modeT) / WINCH.plateT)) + 1) : PLATES.length;
    for (let i = 0; i < n; i++) { const [dx, dy, w, h] = PLATES[i], x = X + Math.round((f > 0 ? dx : -dx - w) * S / 1.3), y = Y + Math.round(dy * S / 1.3);
      g.globalAlpha = 1; g.fillStyle = '#2a2430'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#7a6a50'; g.fillRect(x, y, w, h);
      g.fillStyle = '#b09a5a'; g.fillRect(x, y, w, 1); g.fillRect(x, y, 1, h - 1);
      if ((i + Math.floor(time * 3)) % 4 === 0) { g.fillStyle = '#ffd36b'; g.fillRect(x + (w >> 1), y + (h >> 1), 1, 1); } }
    if (e.mode === 'plating') { g.fillStyle = '#b09a5a'; for (let j = 0; j < 5; j++) { const ph = (time * 2.2 + j * 0.2) % 1; g.globalAlpha = 1 - ph; g.fillRect(X - 14 + j * 7, Y - Math.round(ph * 40), 3, 3); } g.globalAlpha = 1; } }
  if (e.mode === 'stagger') { const k = Math.max(0, e.modeT) / WINCH.staggerT, p = 0.5 + 0.5 * Math.sin(time * 10);
    g.globalAlpha = 0.55 + 0.35 * p; g.fillStyle = '#ffd36b'; ring(g, X, Y - 22, 22 + p * 2, 30 + p * 2, 40); g.globalAlpha = 1;
    g.fillStyle = '#2a2430'; g.fillRect(X - 16, Y - 60, 32, 4); g.fillStyle = '#ffd36b'; g.fillRect(X - 15, Y - 59, Math.round(30 * k), 2); }
  if (e.ward > 0 && e.phase !== 3) { const p = 0.5 + 0.5 * Math.sin(time * 8); g.globalAlpha = 0.25 + 0.3 * p; g.fillStyle = '#d8e2ee'; ring(g, X, Y - 24, 21, 30, 34); g.globalAlpha = 1; }
  /* ORE TOSS */
  if (e.mode === 'tossTell') { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.toss, hx = X - f * 4, hy = Y - WINCH.hand - 10 - Math.round(k * 6);
    g.fillStyle = '#2a2430'; g.fillRect(hx - 4, hy - 4, 9, 8); g.fillStyle = '#7a6a50'; g.fillRect(hx - 3, hy - 3, 7, 6); g.fillStyle = '#b09a5a'; g.fillRect(hx - 3, hy - 3, 7, 1);
    if (c && c.P && c.pVel) { const a = tossAim(e, c); g.globalAlpha = 0.25 + 0.4 * k; g.fillStyle = '#ff6b6b'; ring(g, a.tx - cx, a.ty - cy - 1, WINCH.tossR, 4, 22); g.globalAlpha = 1; } }
  if (e.toss) { const q = e.toss, k = Math.min(1, q.t / q.T), x = q.x0 + (q.tx - q.x0) * k, y = q.y0 + (q.ty - q.y0) * k - Math.sin(k * Math.PI) * 70, R2 = Math.round;
    const p = 0.5 + 0.5 * Math.sin(time * 20); g.globalAlpha = 0.45 + 0.45 * k * p; g.fillStyle = '#ff6b6b'; ring(g, q.tx - cx, q.ty - cy - 1, WINCH.tossR, 4, 26);
    g.globalAlpha = 0.35; g.fillStyle = '#1b1626'; g.fillRect(R2(q.tx - cx) - 5 - R2(k * 4), R2(q.ty - cy) - 2, 10 + R2(k * 8), 2); g.globalAlpha = 1;
    g.fillStyle = '#2a2430'; g.fillRect(R2(x - cx) - 4, R2(y - cy) - 4, 9, 8); g.fillStyle = '#7a6a50'; g.fillRect(R2(x - cx) - 3, R2(y - cy) - 3, 7, 6); g.fillStyle = '#b09a5a'; g.fillRect(R2(x - cx) - 3, R2(y - cy) - 3, 7, 1); }
  /* SPILL: a red strip down from the skip he is tipping to whatever is under it */
  if (e.mode === 'spillTell' && c && c.skipAt) { const s = c.skipAt(e.spillM); if (s) { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.spill, sx = Math.round(s.x - cx), sy = Math.round(s.y - cy) + 10;
      const gy = c.groundY ? Math.round(c.groundY(s.x, s.y + 12) - cy) : sy + 90, sh = Math.round(Math.sin(time * 40) * 2 * k);
      g.globalAlpha = 0.3 + 0.5 * k; g.fillStyle = '#ff6b6b';
      for (let y = sy; y < gy; y += 6) { g.fillRect(sx - 22 + sh, y, 2, 3); g.fillRect(sx + 20 + sh, y, 2, 3); }
      for (let x = -22; x <= 20; x += 5) g.fillRect(sx + x, gy - 2, 3, 2); g.globalAlpha = 1; } }
  /* THE CHAIN SWEEP */
  if (e.mode === 'sweepTell' || e.mode === 'sweep') { const k = e.mode === 'sweep' ? 1 : 1 - Math.max(0, e.modeT) / WINCH.tell.sweep;
    g.globalAlpha = 0.3 + 0.5 * k; g.fillStyle = '#ff6b6b'; for (let s = 8; s < WINCH.sweepR; s += 6) g.fillRect(X + f * s, Y - 3, 3, 2);
    g.fillRect(X + f * WINCH.sweepR - 1, Y - 7, 2, 6); g.globalAlpha = 1;
    if (e.mode === 'sweep') { const r = (1 - Math.max(0, e.modeT) / WINCH.sweepT) * WINCH.sweepR, hx = e.x + f * r, hy = e.y - 6;
      g.fillStyle = '#6a6a74'; for (let t = 0; t <= 1; t += 0.08) g.fillRect(Math.round(e.x + (hx - e.x) * t - cx), Math.round(e.y - WINCH.hand + (hy - (e.y - WINCH.hand)) * t - cy), 2, 2);
      drawHook(g, hx, hy, 1, f, cx, cy); } }
}
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
  if (e.mode === 'hookTell') { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.hook, a = e.anim * 18, hx = e.x - e.face * 6 + Math.cos(a) * 9, hy = e.y - 34 + Math.sin(a) * 5;
    g.fillStyle = '#6a6a74'; for (let t = 0; t <= 1; t += 0.2) g.fillRect(Math.round(e.x - cx + (hx - e.x) * t), Math.round(e.y - WINCH.hand - cy + (hy - (e.y - WINCH.hand)) * t), 2, 2);
    drawHook(g, hx, hy, 0, e.face, cx, cy);   /* COILED: still on the chain, winding up (bakes HOOK, so its size is known below) */
    if (k > 0.6 && Math.floor(time * 20) % 2) { g.globalAlpha = 0.55; g.fillStyle = '#ff6b6b'; g.fillRect(Math.round(hx - cx) - 5, Math.round(hy - cy) - 5, HOOK.w + 2, HOOK.h + 2); g.globalAlpha = 1; } }
  if (e.hk) { const k = e.hk, x0 = e.x + e.face * 10 - cx, y0 = e.y - WINCH.hand - cy, x1 = k.x - cx, y1 = k.y - cy, n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 4));
    g.fillStyle = '#4a4a52'; for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 2, 2);
    drawHook(g, k.x, k.y, k.st === 'out' ? 1 : 0, Math.sign(k.vx) || e.face, cx, cy); }   /* OPEN out, COILED coming back */
  if (e.mode === 'leverTell' && H) { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.lever; g.globalAlpha = 0.25 + 0.55 * k; g.fillStyle = '#ffd36b';
    for (let s = 0; s < WINCH.leverHit; s += 4) g.fillRect(Math.round(H.drumX + H.away * s - cx), Math.round(H.mouthY - cy) - 20 - Math.round(Math.sin(s / WINCH.leverHit * Math.PI) * 8), 3, 2); g.globalAlpha = 1; }
  if (e.revT > 0) { const R = c.H[e.revAt ?? e.at]; g.globalAlpha = 0.5; g.fillStyle = '#ffd36b'; const ph = (time * 60) % 24;
    for (let s = ph; s < 600; s += 24) { const x = R.drumX + R.away * s, ly = c.lineY(e.revAt ?? e.at, x); if (ly === null) break; const X = Math.round(x - cx), Y = Math.round(ly - cy) - 40; g.fillRect(X, Y, 5, 1); g.fillRect(X + (R.away > 0 ? 4 : 0), Y - 1, 1, 3); } g.globalAlpha = 1; }
  /* THE LEAP, told: a red ring on the housing he will land on, tightening as he crouches, and held while he is in the air */
  if ((e.mode === 'leapTell' || e.mode === 'leap') && e.leapTo !== undefined && c.H[e.leapTo]) { const N = c.H[e.leapTo], k = e.mode === 'leap' ? 1 : 1 - Math.max(0, e.modeT) / WINCH.tell.leap;
    const x = Math.round(N.homeX - cx), y = Math.round(N.topY - cy), w = Math.round(WINCH.leapHit + (1 - k) * 8)   /* closes ON the landing's reach, never inside it: what hurts is what is drawn (C1) */, a = 0.4 + 0.5 * k * (0.6 + 0.4 * Math.sin(time * 30));
    g.globalAlpha = a; g.fillStyle = '#ff6b6b'; g.fillRect(x - w, y - 2, w * 2, 2); g.fillRect(x - w + 3, y + 1, w * 2 - 6, 1); g.fillRect(x - w, y - 5, 2, 4); g.fillRect(x + w - 2, y - 5, 2, 4);
    for (let j = 0; j < 3; j++) g.fillRect(x - 1, y - 18 - j * 7 + Math.round(k * 6), 2, 4); g.globalAlpha = 1; }
  /* THE ROOF'S ROCK, told: dust off the roof over the spot, and a red ring where it will land, tightening */
  for (const r of (e.rocks || [])) { const k = 1 - Math.max(0, r.t) / WINCH.rockTell, x = Math.round(r.x - cx), gy = Math.round(r.gy - cy), y0 = Math.round(r.y0 - cy);
    g.fillStyle = '#b8a890'; for (let j = 0; j < 4; j++) { const ph = (time * 90 + j * 23) % 40; g.globalAlpha = 0.6 * (1 - ph / 40); g.fillRect(x - 3 + ((j * 5) % 7), y0 + Math.round(ph), 1, 2); }
    g.globalAlpha = 0.35 + 0.55 * k; g.fillStyle = '#ff6b4a'; const w = Math.round(12 - k * 4); g.fillRect(x - w, gy - 2, w * 2, 1); g.fillRect(x - w + 2, gy, w * 2 - 4, 1); g.fillRect(x - w, gy - 2, 1, 2); g.fillRect(x + w - 1, gy - 2, 1, 2); g.globalAlpha = 1; }
  /* ROUND SIX, THE JAM TOLD: a ride that will jam him, inside jamWarn of the drum - gold chevrons flashing on the drum's mouth,
     pointing into it (said once a ride, too: IT WILL JAM HIS DRUM) */
  if (e.jamWarn && H) { const on = Math.floor(time * 12) % 2, x = Math.round(H.drumX - cx), y = Math.round(H.mouthY - cy) - 22;
    g.globalAlpha = on ? 0.95 : 0.5; g.fillStyle = '#ffd36b';
    for (let j = 0; j < 3; j++) { const bx = x + H.away * (14 + j * 8); for (let q = 0; q < 4; q++) { g.fillRect(bx - H.away * q, y - q, 2, 1); g.fillRect(bx - H.away * q, y + q, 2, 1); } }
    g.fillRect(x - 1, y - 8, 3, 16); g.globalAlpha = 1; }
  /* ROUND SIX, THE CRASH AND THE STALL: for jamFx s after a jam the jammed line's cable SNAPS TAUT - drawn straight from drum to drum,
     white-hot and humming (a shiver that dies away) - and sparks fly off the stopped drum */
  if (e.jamT > 0 && c.H[e.jamAt ?? e.at] && c.H[e.jamAt ?? e.at].ln) { const J = c.H[e.jamAt ?? e.at], p = J.ln.pts, a = p[0], b = p[p.length - 1], k = e.jamT / WINCH.jamFx, hang = OR.BUCKET.hang;
    const n = Math.max(2, Math.round(Math.abs(b[0] - a[0]) / 3)), amp = 3 * k;
    g.fillStyle = k > 0.6 ? '#fff6c8' : '#ffd36b'; g.globalAlpha = 0.5 + 0.5 * k;
    for (let i = 0; i <= n; i++) { const t = i / n, sh = Math.sin(t * Math.PI) * Math.sin(time * 70) * amp; g.fillRect(Math.round(a[0] + (b[0] - a[0]) * t - cx), Math.round(a[1] + (b[1] - a[1]) * t - hang - cy + sh), 2, 1); }
    g.fillStyle = '#fff6c8'; for (let j = 0; j < 8; j++) { const ph = (time * 3 + j * 0.37) % 1, an = j * 2.4 + Math.floor(time * 9) * 0.7, r = 4 + ph * 26;
      g.globalAlpha = k * (1 - ph); g.fillRect(Math.round(J.drumX + Math.cos(an) * r - cx), Math.round(J.mouthY - hang + Math.sin(an) * r * 0.7 + ph * 10 - cy), 2, 1); }
    g.globalAlpha = 1; }
  /* ROUND SIX, PHASE THREE, told: the red ring on the deck where he will come down (it closes ON the landing's reach, as the leap's) */
  if ((e.mode === 'descendTell' || e.mode === 'descend') && e.toX !== undefined) { const k = e.mode === 'descend' ? 1 : 1 - Math.max(0, e.modeT) / WINCH.tell.descend;
    const x = Math.round(e.toX - cx), y = Math.round(e.toY - cy), w = Math.round(WINCH.leapHit + (1 - k) * 8), a = 0.4 + 0.5 * k * (0.6 + 0.4 * Math.sin(time * 30));
    g.globalAlpha = a; g.fillStyle = '#ff6b6b'; g.fillRect(x - w, y - 2, w * 2, 2); g.fillRect(x - w + 3, y + 1, w * 2 - 6, 1); g.fillRect(x - w, y - 5, 2, 4); g.fillRect(x + w - 2, y - 5, 2, 4);
    for (let j = 0; j < 3; j++) g.fillRect(x - 1, y - 18 - j * 7 + Math.round(k * 6), 2, 4); g.globalAlpha = 1; }
  /* THE HOOK SWUNG, told: the hook whirling over his head, faster as it comes, and a red ring on the floor at its reach (whirlR: what
     hurts is what is drawn) - then the hook going round him at that reach */
  if (e.mode === 'whirlTell' || e.mode === 'whirl') { const k = e.mode === 'whirl' ? 1 : 1 - Math.max(0, e.modeT) / WINCH.tell.whirl, hy = e.y - WINCH.hand - 8;
    const r = e.mode === 'whirl' ? WINCH.whirlR : 10 + 8 * k, an = e.mode === 'whirl' ? (1 - Math.max(0, e.modeT) / 0.35) * Math.PI * 2 * e.face : time * (8 + 16 * k), y0 = e.mode === 'whirl' ? e.y - 12 : hy;
    const hx = e.x + Math.cos(an) * r, hy2 = y0 + Math.sin(an) * (e.mode === 'whirl' ? 6 : 4);
    g.fillStyle = '#6a6a74'; for (let t = 0; t <= 1; t += 0.12) g.fillRect(Math.round(e.x + (hx - e.x) * t - cx), Math.round(e.y - WINCH.hand + (hy2 - (e.y - WINCH.hand)) * t - cy), 2, 2);
    drawHook(g, hx, hy2, e.mode === 'whirl' ? 1 : 0, Math.cos(an) >= 0 ? 1 : -1, cx, cy);
    g.globalAlpha = 0.3 + 0.5 * k; g.fillStyle = '#ff6b6b'; const x = Math.round(e.x - cx), y = Math.round(e.y - cy), w = WINCH.whirlR;
    g.fillRect(x - w, y - 1, 2, 3); g.fillRect(x + w - 2, y - 1, 2, 3); for (let s = -w; s < w; s += 6) g.fillRect(x + s, y, 3, 1); g.globalAlpha = 1; }
  /* THE WRENCH, told: the yellow arc of where it comes down, in front of him to wrenchHit; bitten into the planks, it sparks */
  if (e.mode === 'wrenchTell') { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.wrench; g.globalAlpha = 0.25 + 0.6 * k; g.fillStyle = '#ffd36b';
    for (let s = 6; s < WINCH.wrenchHit; s += 4) g.fillRect(Math.round(e.x + e.face * s - cx), Math.round(e.y - cy) - 10 - Math.round(Math.sin(s / WINCH.wrenchHit * Math.PI) * 22), 3, 2); g.globalAlpha = 1; }
  if (e.mode === 'bitten') { const x = Math.round(e.x + e.face * 26 - cx), y = Math.round(e.y - cy); g.fillStyle = '#fff6c8';
    for (let j = 0; j < 4; j++) { const ph = (time * 4 + j * 0.25) % 1; g.globalAlpha = 1 - ph; g.fillRect(x + Math.round((j - 1.5) * 5 * ph), y - 2 - Math.round(ph * 12), 1, 2); } g.globalAlpha = 1; }
  /* HE TAKES A SKIP, told: red dashes down the low line the way he will go; riding, the skip under his boots (the same skip a SEND
     is, so what hurts is what is drawn) */
  if (e.mode === 'rideTell' && c.H[0] && c.H[0].ln) { const k = 1 - Math.max(0, e.modeT) / WINCH.tell.ride, xs = c.H[0].ln.pts.map(p => p[0]), dir = e.fl === 1 ? -1 : 1, end = dir > 0 ? Math.max(...xs) : Math.min(...xs);
    g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = '#ff6b6b'; for (let x = e.x; dir > 0 ? x < end : x > end; x += dir * 6) { const ly = c.lineY(0, x); if (ly === null) continue; g.fillRect(Math.round(x - cx), Math.round(ly - cy) - 2, 3, 2); } g.globalAlpha = 1; }
  if (e.mode === 'ride') { const x = Math.round(e.x - cx), y = Math.round(e.y - cy);
    g.fillStyle = '#2a2a30'; g.fillRect(x - hw - 1, y - 1, hw * 2 + 2, 13); g.fillStyle = '#6a6a74'; g.fillRect(x - hw, y, hw * 2, 10); g.fillStyle = '#b09a5a'; g.fillRect(x - hw + 3, y - 3, hw * 2 - 6, 3);
    g.fillStyle = '#2a2a30'; g.fillRect(x - 1, y - OR.BUCKET.hang, 2, OR.BUCKET.hang - 1);
    g.globalAlpha = 0.5; g.fillStyle = '#fff0d0'; const d = e.ride ? e.ride.dir : e.face; for (let k = 1; k < 5; k++) g.fillRect(x - d * (hw + k * 6) - 2, y + 2 + k, 4, 1); g.globalAlpha = 1; }
  drawOreRead(g, e, c, cx, cy, time);
  if (e.mode === 'downed') { const k = 0.5 + 0.5 * Math.sin(time * 10), w = 26 + Math.round(k * 3); g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#8fd160';
    const x = Math.round(e.x - cx), y = Math.round(e.y - cy) - 2; g.fillRect(x - w, y - 1, w * 2, 2); g.fillRect(x - w + 4, y - 4, w * 2 - 8, 1); g.fillRect(x - w + 4, y + 2, w * 2 - 8, 1); g.globalAlpha = 1; }
}
