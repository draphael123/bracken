// src/buried-city5.js - BURIED CITY 5 FLAG and its numbers (claude/bc5, 11-10, the SONNET code lane; plan scratch/lane-reports/desert-next-plan.md, briefs
// scratch/brief-buriedcity5-1014.md + brief-newminis-1015.md). Pure data + the flag: no imports (pattern src/colossus4.js), so the level, the flip, the hands and
// the tools all read it without a cycle.
//
// OFF (BC5_SHIPS false, no override) = master exactly: every column, every cell (tools/buried-city5.mjs holds the grid hash).
// ON  = RACE THE GLASS (Daniel 10-14: "the Buried City could use the hourglass mechanic better"): SOME DOORS, BRIDGES AND LIFTS HOLD ONLY WHILE A GLASS RUNS.
//   R1 TEACH  the upper street: a hung gallery over the first construct; STRIKE the glass, run through its RACE DOOR. Miss = the street (the old way). Optional.
//   R2 TEST   the throne street's mouth: a pit of sand, a crumbling two-slab span over it (the tplat chain). Fall = a bite and back to the glass. REQUIRED.
//   R3 REMIX  the throne street, past the warden: A LIFT CHAIN. Glass A raises the stairs (6 rows), glass B on the landing raises the last step and RE-STRIKES A.
//             REQUIRED (a wall too tall to jump).
//   GB MINI   THE GLASSBLOWER's hall replaces the Glass Works' relay exam in place (columns 389-407; the shrine at 408 stays).
//   R4 EXAM   the antechamber: the existing timed slabs, a RACE DOOR at the hall's end on the same glass, one re-strike pad midway (and one at the door).
//   FOES      THE SAND GRASPER (src/sand-grasper.js): rises when a room drains / when you come near; never in a race window, run line or the mini's floor.
// The preview: ?bc5=1&level=buriedcity   globalThis.BRACKEN_BC5 = true   env BRACKEN_BC5=1 (Node tools).
export const BC5_SHIPS = true;   /* (claude/prepbc5) ships ON; ?bc5=0 / BRACKEN_BC5=0 / globalThis.BRACKEN_BC5=false = the lab OFF override (the old street); ?bc5=1 still forces ON */
export function bc5On() {
  try { if (globalThis.BRACKEN_BC5 === false || globalThis.BRACKEN_BC5 === '0') return false; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]bc5=0/.test(location.search || '')) return false; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_BC5 === '0') return false; } catch { /* no node */ }
  if (BC5_SHIPS) return true;
  try { if (globalThis.BRACKEN_BC5 === true || globalThis.BRACKEN_BC5 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]bc5=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_BC5 === '1') return true; } catch { /* no node */ }
  return false;
}
export const RULE5 = 'PULL A SAND-GATE AND A ROOM DRAINS; SHUT IT AND THE SAND RISES AND CARRIES YOU. STRIKE AN HOURGLASS AND THE SAND RUNS BACKWARD. SOME DOORS, BRIDGES AND LIFTS HOLD ONLY WHILE A GLASS RUNS: STRIKE IT AND RUN.';
/* each race's arc (tile columns) - read by tools/buried-city5.mjs: taught, tested, remixed, examined, with THE GLASSBLOWER between the teach and the test */
export const ARCS_BC5 = { race: { teach: [166, 184], mini: [389, 407], test: [599, 609], remix: [662, 673], exam: [822, 843] } };

/* ---------- THE RACES (glass ids, columns in the level's LOGICAL rows; the tool measures each hero's margin from these) ----------
   dur: a glass's run (s). A race piece is held by its glass while it runs (a RACE DOOR is open, a lift's stairs are risen, a span's slabs stand).
   MARGIN_MIN: the slowest hero on base movement must beat every deadline by this much (s) on the REQUIRED races (R2, R3, R4). */
export const MARGIN_MIN = 0.6;
export const RACE = {
  /* R1: glass on the balcony at 168; the gallery's door at 178; the gallery ends at 184 */
  r1: { glass: 'race1', gx: 168, dur: 6.5, door: { x0: 178, x1: 178, y0: 19, y1: 21 }, gallery: [173, 184, 22], end: 184, required: false },
  /* R2: glass on the lip at 600 (feet row 31); slabs 602-604 and 606-608 flush with the street (row 32); the east lip at 609 */
  r2: { glass: 'span', gx: 600, dur: 7, pit: [601, 608], slabs: [{ x0: 602, x1: 604, life: 2.9 }, { x0: 606, x1: 608, life: 4.3 }], end: 609, required: true },   /* (claude/bc5fix) slab lives 2.6/4.0 -> 2.9/4.3 s: the desktop reaper finished R2 at 6.9-7.3 s on a 7 s glass - right at the wire */
  /* R3: glass A on the street at 662; stairs S1 664-665 (top 29) and S2 666-667 (top 26); the pier F 668-669 (top 26, fixed) with glass B on it; B's step S3 670-671 (top 24);
     the wall G 672-673 (top 22, fixed). A is struck again by B. */
  r3: { a: { glass: 'r3a', gx: 662, dur: 4.2 },   /* (claude/bc5fix) A 3.8 -> 4.2 s: the tightest model margin (the reaper's 0.85 s to the pier) gains 0.4 s */
     b: { glass: 'r3b', gx: 668, dur: 3.4, also: ['r3a'] },
    s1: [664, 665, 29, 3], s2: [666, 667, 26, 6], pier: [668, 669, 26], s3: [670, 671, 24, 8], wall: [672, 673, 22], end: 674, required: true },
  /* R4: the antechamber's glass 824 (dur 7, as master), slabs as master; the pad on the pier at 834 (feet row 30) re-strikes it; the race door at 841 (rows 28-31, a lintel over it);
     the far pad at 840 re-strikes it for a hero who came late (no soft lock) */
  r4: { glass: 'ante', gx: 824, dur: 7, slabs: [{ x0: 827, x1: 829, life: 3.4 }, { x0: 831, x1: 833, life: 4.6 }, { x0: 835, x1: 837, life: 5.8 }],
    pad: { glass: 'antepad', gx: 834, y: 30, also: ['ante'] }, far: { glass: 'antefar', gx: 840, y: 31, also: ['ante'] }, door: { x0: 841, x1: 841, y0: 28, y1: 31 }, end: 843, required: true },
};
/* the race door: stone (not wood) - a shutter that is open while its glass runs and shuts when it has run out - never onto a body (it waits for a clear doorway) */
export const DOOR = { rise: 0.35, band: 5, waitClear: 0.25 };
/* (claude/bc5fix) THE POST-STRIKE CAMERA HOLD (the desktop walk, bc5-walk.md Finding A: ~1.8-2.2 s after a strike "the picture sits on what the glass moved" - src/buried-city-flip.js FLIP.camT 1.8,
   full lean 1.4 s then a 0.4 s ramp - and eats the 0.82-1.09 s R2/R3 margins for the slowest heroes). The race glasses' look is SHORT and NEVER BLOCKS: camT s at most, a lean of `lean` (master 0.75),
   and it lets go the moment the hero is running again (|vx| > releaseV px/s after `holdMin` s - the player is looking where he is going). The hero is never held by it (the camera only moves the picture).
   Used only on a bc5 level and only for the race glasses (RACE_GLASSES); every other glass keeps FLIP.camT. camT must stay under the tightest required margin (tools/buried-city5.mjs asserts it). */
export const CAM5 = { camT: 0.6, lean: 0.5, releaseV: 24, holdMin: 0.2 };
export const RACE_GLASSES = ['race1', 'span', 'r3a', 'r3b', 'ante', 'antepad', 'antefar'];

/* ---------- THE MEASURE (tools/buried-city5.mjs) ----------
   a hero's time over a race, from the strike: the strike itself (STRIKE_T: the swing's wind-up), the run at the hero's own ground pace (src/hero-move.js RUN x HERO_RUN),
   and every jump or hop costs JUMP_T (the arc's air time, counted whole: the slowest honest figure). No sprint credit (a short race never reaches it). */
export const MEASURE = { STRIKE_T: 0.45, JUMP_T: 0.65, HOP_T: 0.35, tile: 16 };

/* ---------- THE MINI AND THE FOE'S WORDS (callouts: src/hint-lines.js SAY_LINES) ---------- */
export const BC5_SAY = {
  door: 'STRIKE THE GLASS, THEN RUN: THE DOOR HOLDS WHILE IT RUNS',
  doorShut: 'THE DOOR SHUTS WHEN THE GLASS RUNS OUT: STRIKE IT AGAIN',
  span: 'THE SPAN CRUMBLES: STRIKE THE GLASS, THEN RUN',
  lift: 'THE STAIRS HOLD WHILE THE GLASS RUNS: RUN UP',
  chain: 'STRIKE THE SECOND GLASS: IT RAISES THE STEP, TURNS THE FIRST',
  pad: 'THIS GLASS TURNS THE FIRST: THE SLABS AND THE DOOR HOLD LONGER',
  gbIntro: 'THE GLASSBLOWER, KEEPER OF THE KILNS',
  gbGlint: 'HIS HOURGLASS GLINTS: STRIKE IT',
  gbOpen: 'THE SAND BURIES HIM TO THE WAIST: CUT HIM',
  gbWard: 'HE KICKS FREE OF THE SAND: HE GUARDS',
  gbNotYet: 'IT HOLDS: IT GLINTS AFTER HE FLIPS IT',
  gbGob: 'THE MOLTEN GOB: MOVE OFF, THEN STEP ON IT COOLED',
  gbBlast: 'THE BLOWPIPE: BEHIND A KILN STUB OR ROLL',
  gbFlip: 'HE FLIPS THE GLASS: THE SAND UNDER YOU MOVES',
  gbBulb: 'THE BULB SHATTERS: BLOCK OR JUMP THE SHARDS',
  gbP2: 'HE TURNS A SECOND GLASS: STRIKE WHICHEVER GLINTS',
  grBoil: 'THE SAND BOILS: SOMETHING RISES',
  grHold: 'IT HAS YOU: STRIKE IT',
  grTear: 'YOU TEAR LOOSE OF ITS GRIP',
  grRoll: 'ROLL THROUGH ITS ARMS',
};
