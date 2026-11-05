// src/sealed-pyramid3.js - SEALED PYRAMID 3 (claude/sealedpyramid3, OPUS greybox, 11-05; scratch/brief-sealedpyramid3-1014.md + scratch/plan-desert-1105.md
// "OPUS Sealed Pyramid 3 + mini lifecycle"). THE FLAG and the level data the rework adds. Nothing here changes the live game while the flag is off:
//   SP3_SHIPS false  -> master's Sealed Pyramid (the old Tomb-King, the old stair pit, the Mother's old cycles) exactly as it was.
//   ?sp3=1 (browser) / SP3=1 (node env) / globalThis.__SP3 = true -> the rework, for the reviewer and the tools.
// MINIS_STAY_DOWN is the shared mini lifecycle fix (src/mini-keep.js): its own flag, because it touches every level with a mini, not just this one
// (?ministay=1 / MINISTAY=1 / globalThis.__MINISTAY; the SP3 flag turns it on too).
// What the rework is (the rule line stays the level's: THE TOMB IS A MACHINE):
//   1. THE KING'S STAIR's scarab well (the pit you could not climb out of; an exam span made it a death): falling in = THE WELL'S BREATH, an updraft drawn as a
//      sand column that throws you up and back to the stair's foot for a share of your bar (told, spare: never kills, never a soft-lock). THIS PIT ONLY.
//   2. THE SCARAB MOTHER (the mini): two new told moves (src/scarab-mother.js S.sp3): THE WING SWEEP (duck) and THE DUNG BALL (jump).
//   3. THE COFFIN KING 'ESCAPE + BREAK THE SEALS' (src/coffin-king.js + src/coffin-king-hands.js): the burial chamber's machine is the four seal traps below.
export const SP3_SHIPS = false;
export const MINIS_STAY_DOWN = false;

const env = k => { try { return typeof process !== 'undefined' && process.env && process.env[k] === '1'; } catch { return false; } };
const query = k => { try { return typeof location !== 'undefined' && new RegExp('[?&]' + k + '=1(?:&|$)').test(location.search || ''); } catch { return false; } };
export const sp3On = () => SP3_SHIPS || !!globalThis.__SP3 || env('SP3') || query('sp3');
export const minisStayOn = () => MINIS_STAY_DOWN || !!globalThis.__MINISTAY || env('MINISTAY') || query('ministay') || sp3On();

/* ---------- THE BURIAL CHAMBER, REBUILT (columns 1007-1046, floor row 24, the side ledges at row 21 - src/sealed-pyramid-tombs.js BOSS_SLOT) ----------
   FOUR SEAL TRAPS, each fired from its own pale plate by the PLAYER, each with a told LINE (its reach) that hurts whatever stands in it - you too:
     OIL    THE ROPE SEALS    the west corner's plate tips the brazier; the fire runs the west channel (1011-1023).                      PHASE ONE on
     DARTS  THE CHAIN SEALS   the plate at the east ledge's inner end; the east wall's darts fly the floor's east half (1024-1046).     PHASE ONE on
     SAND   THE HOURGLASS     the plate east of the middle; the roof's hopper pours a column of sand on the middle (1024-1029).        PHASE TWO on
     FLOOD  THE WAX SEALS     the plate at the west ledge's inner end; the BORE runs the whole floor from the east sluice, then the     PHASE TWO on
                              chamber's floor floods to the ledges' height (you on a ledge are dry; on the floor you swim)
   He CHASES you (no waiting for him to come close): stand where his walk to you carries him into a line, then tread its plate.
   The plates stand OUTSIDE their own line (the lint in tools/sealed-pyramid3.mjs). Nothing falls on him: no block, no slab (plan section 2). */
export const CK_SLOT = {
  seals: { 1: ['rope', 'chain'], 2: ['glass', 'wax'], 3: [] },
  traps: [
    { id: 'ckOil', kind: 'oil', seal: 'rope', ph: 1, plate: [1007, 1008, 24], head: 1010, chan: [1011, 1023], zone: [1011, 1023, 22, 23], runV: 280, burnT: 0.8, reset: 6.0 },
    { id: 'ckDarts', kind: 'darts', seal: 'chain', ph: 1, plate: [1042, 1043, 21], wall: 1047, dir: -1, rows: [22, 23], zone: [1024, 1046, 22, 23], reset: 6.0 },
    { id: 'ckSand', kind: 'gas', sand: true, seal: 'glass', ph: 2, plate: [1032, 1033, 24], zone: [1024, 1029, 6, 23], hopper: [1024, 1029, 5], gasT: 1.0, reset: 7.0 },
    { id: 'ckFlood', kind: 'flood', seal: 'wax', ph: 2, plate: [1012, 1013, 21], sluice: 1047, dir: -1, zone: [1007, 1046, 22, 23], pool: 'ckFlood', low: 24, high: 21, riseT: 1.8, holdT: 3.4, drainT: 2.0, reset: 12.0 },
  ],
  /* where a hero waits for each (the bot's and the reviewer's read): beside the plate, on the side away from the line */
  wait: { ckOil: [1008, 24], ckDarts: [1040, 21], ckSand: [1033, 24], ckFlood: [1010, 21] },
};
/* the chamber's trap rows as the level's engine (src/sealed-pyramid-hands.js) wants them; `ck` marks them as his (inert until the phase in `ph`) */
export function ckTraps() {
  return CK_SLOT.traps.map(t => { const { plate, ...d } = t; return { ...JSON.parse(JSON.stringify(d)), plates: [plate.slice()], arena: true, ck: t.ph, section: 'boss' }; });
}
export const ckPool = TS => ({ id: 'ckFlood', x0: 1007 * TS, x1: 1047 * TS, y: 21 * TS + 4, swim: true, clear: true, bottom: 24 * TS, crypt: true });

/* ---------- THE KING'S STAIR's WELL (tiles 963-1003, its spike row 34): THE WELL'S BREATH ----------
   x0..x1: the spike columns it owns; back: the tile a hero is set down on (the stair's foot, the high door's landing, floor row 30); pct: the told share of the bar */
export const UPDRAFT = { x0: 963, x1: 1003, row: 34, back: [958, 29], pct: 0.15, rise: 0.75, v: 300, say: 'THE WELL BREATHES: IT THROWS YOU BACK TO THE STAIR\'S FOOT',
  sign: 'THE KING\'S STAIR. THE OLD COURSES GIVE UNDER YOU. FALL, AND THE WELL\'S BREATH THROWS YOU BACK TO HERE.' };
/* pure: is this spike tile the well's (px x, tile tx, ty)? */
export const updraftAt = (U, tx, ty) => !!U && tx >= U.x0 && tx <= U.x1 && ty >= U.row - 1 && ty <= U.row;
