// src/gorm.js - KING GORM UNDERLEAF 2: THE COURT, THE BURNING WOOD, THE KING'S GLADE (claude/gorm2, the OPUS boss lane, 2026-10-22).
// Brief scratch/brief-kingswood2-1014.md (PHASE 1, THE ESCAPE, PHASE 2, and '!! 10-15' Daniel's P1 changes), Daniel's 10-22 decisions:
//   - P1 changes ship with the escape and P2; his hall's cages hang on ROPES the RAFTER ARCHERS hold (not plates);
//   - ONE new foe, THE ROYAL BOAR (src/royal-boar.js): called by his hunting horn in P1 and P2, and placed in the Hunting Stands' meadow;
//   - hiding from the procession pays nothing extra; the sign at 4,40 moves two tiles right.
// This file is the NUMBERS (one table, the tune lane's) and the few pure helpers the hands, the King's AI and the tools share.
// The hands are src/gorm-hands.js (the hall's ropes, archers and rocks; the burning wood; the glade's hangings), the King's AI is src/gorm-king.js.
//
// THE FIGHT, IN ONE BREATH (B1: the boss is the level's rule personified - WHAT HANGS OVER IT CAN BE DROPPED ON IT):
//   P1 THE COURT (his hall): carried on his litter (charge, the hand), then on his feet (the sceptre sweep, the hand); THE HUNTING HORN calls a
//      ROYAL BOAR down the hall (jump it, or drop a cage on it). His five cages hang on ropes; TWO RAFTER ARCHERS hold the rope of the one that is
//      live (slow told arrows) - the rope is LOCKED while they live: climb the scaffold to them or knock them off with a ROCK from the heaps.
//      Rope free: strike its PEG when he is under it - caged he bleeds (x2), then he is open (x1.25). Outside that every blade lands at 0.4 (B15).
//   THE ESCAPE (his bar empties): the court TORCHES the wood and his bearers carry him off; you are FULLY HEALED and RUN: the fire behind you,
//      burning branches on marked spots, the burning ground under the canopy, torch goblins lighting the road ahead. A checkpoint at the end.
//   P2 THE KING'S GLADE: his last stand under the GREAT OAK, half on fire (L.oakBurn). A burning limb for a club (HIGH: duck it or step off;
//      LOW: jump it), THE ROYAL HUNT (the horn: a boar and hounds, at 70% and 38%), THE CANOPY SHAKE (he punches the oak: burning cones on marked
//      spots), THE LOG ROLL (jump it), THE BELLY QUAKE (jump the shockwave). What hangs in the oak is the opening: two CAGES (held, x2), the LOG TRAP
//      (it rolls into him: knocked down, x1.75), the BEEHIVE (stung, x1.5). After every opening a told WARD (B3): the hangings glance off him 3 s.
export const GORM = {
  hp1: 1000,              /* P1's bar (the old fight's 590 was one bar for the whole of him); P2's bar is hp2 / hp1 of whatever the game scaled hp1 to */
  hp2: 1000,
  chip: 0.4,             /* B15: outside an opening a blade lands at 0.4 (boss-greed GREED.chipBy.king) */
  take: { held: 2, open: 1.25, downed: 1.75, stung: 1.5 },
  ward: 3,               /* B3: after an opening, seconds the hangings glance off him (told WARDED, a pale shell) */
  /* P1: THE COURT */
  litterTo: 0.55,        /* at this share of P1's bar the litter breaks and he stands */
  heldT: 3.2, openT: 4,
  grabEvery: 9, grabTell: 0.9, grabReach: 64, hurlVx: 420, hurlVy: -300,
  chargeEvery: 9, chargeTell: 0.8, chargeV: 240, chargeT: 1.5,
  sweepEvery: 2.6, sweepTell: 0.8, sweepReach: 66, sweepCool: 1.1,
  hornEvery: 17, hornTell: 1.1, hornFirst: 9,
  walkV: 44, walkV2: 54,
  archers: { hp: 1, every: 5.2, tell: 1.0, v: 150, g: 260, dmg: 8, fileIn: 2.4, firstFile: 1.4 },
  cageReset: 5,          /* a cage that MISSED him goes back up after this (its rope stays free: its archers are down) */
  rock: { every: 0.6, vx: 70, vy: -470, mid: { vx: 150, vy: -300 }, low: { vx: 120, vy: -150 }, g: 640 },
  /* THE ESCAPE: the fire behind you (px a world-second; the hero runs ~89) */
  run: { grace: 2.4, v: 50, vMax: 150, lead: 340, drain: 0.2, groundDrain: 0.12, branchTell: 0.9, branchDmg: 14, torchTell: 0.8, torchBurn: 6, torchReach: 110 },
  /* P2: THE KING'S GLADE */
  clubTell: 0.85, clubReach: 74, clubEvery: 2.0,
  shakeTell: 0.8, coneTell: 1.1, cones: 5, coneDmg: 14,
  logTell: 0.9, logV: 190, logDmg: 18,
  quakeTell: 0.9, quakeAir: 0.45, quakeV: 175, quakeDmg: 18,
  huntAt: [0.70, 0.38],
  hangReset: { cage: 11, log: 13, hive: 14 },
  downedT: 3.5, stungT: 4, hiveR: 44,
};
export const GORM_SAY = {
  wake: 'KING GORM UNDERLEAF', litter: 'THE LITTER BREAKS. HE STANDS', horn: 'THE HUNTING HORN', boar: 'THE ROYAL BOAR', penned: 'PENNED',
  locked: 'ITS ARCHERS HOLD THE ROPE', free: 'THE ROPE IS FREE: STRIKE THE PEG', file: 'THE COURT\'S BOWS FILE IN', knocked: 'KNOCKED DOWN',
  caught: 'CAUGHT', open: 'HIS HEAD IS UP. HE IS OPEN', warded: 'WARDED', rock: 'A ROCK: ATTACK THROWS IT, UP LOBS',
  torch: 'THE COURT TORCHES THE WOOD', healed: 'YOU CATCH YOUR BREATH', run: 'RUN', burning: 'THE FIRE HAS YOU', branch: 'A BURNING BRANCH',
  lit: 'HE LIGHTS THE ROAD', glade: "THE KING'S GLADE", limb: 'HE TEARS A BURNING LIMB FROM THE OAK', high: 'HIGH: DUCK', low: 'LOW: JUMP',
  hunt: 'THE ROYAL HUNT', shake: 'THE CANOPY SHAKES', logroll: 'A BURNING LOG', quake: 'BELLY QUAKE: JUMP', downed: 'KNOCKED DOWN', stung: 'STUNG',
  hive: 'THE HIVE BURSTS', cagefall: 'THE CAGE FALLS', logfall: 'THE LOG ROLLS',
  backUp: 'THE CAGES GO BACK UP', lashed: 'LASHED: NOT THIS ONE', dropRock: 'A BLOW: YOU DROP THE ROCK', throwBows: 'THROW IT AT THE BOWS', fireDies: 'THE FIRE DIES AT THE GLADE',
  groundBurns: 'THE GROUND BURNS: UP INTO THE BOUGHS', hurled: 'HURLED', runDown: 'RUN DOWN', turned: 'TURNED', bolts: 'IT BOLTS', held: 'HELD',
};
/* the SHORT ones float over the spot (main.js MOVE_WORDS); every line is a said line too (src/hint-lines.js SAY_LINES: the hint box draws the long ones) */
export const GORM_WORDS = ['caught', 'warded', 'penned', 'knocked', 'downed', 'stung', 'hurled', 'runDown', 'turned', 'bolts', 'held', 'high', 'low', 'quake', 'horn', 'hunt', 'boar', 'logroll', 'shake', 'branch', 'run', 'healed', 'burning'].map(k => GORM_SAY[k]);
/* the share of the bar each opening is worth is the tune lane's; these are only the shape: is he open, and what does a blade pay */
export const gormOpen = e => !!e && (e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung' || e.open > 0);
export function gormTake(e) {
  if (!e) return 1;
  if (e.mode === 'held') return GORM.take.held;
  if (e.mode === 'downed') return GORM.take.downed;
  if (e.mode === 'stung') return GORM.take.stung;
  if (e.open > 0) return GORM.take.open;
  return null;   /* null: not open - the global rule's chip (0.4) */
}
/* THE FLEE: where the fire stands for a hero at x (px), t world-seconds after it was lit at x0 */
export function fireStep(fx, px, dt, R = GORM.run) {
  const behind = px - fx, v = behind > R.lead ? Math.min(R.vMax, R.v + (behind - R.lead) * 1.2) : R.v;
  return fx + v * dt;
}
