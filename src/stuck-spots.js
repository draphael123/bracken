// src/stuck-spots.js - THE ROUTE LIST for the shared guide (src/stuck-guide.js; claude/stuckfix, from the 10-03 stuck-point audit).
// DATA ONLY: per level, the spots where a first-time player sits for minutes. A spot is
//   { id, zone: [c0, r0, c1, r1],         the hero's TILE box where it applies (where he stands, not where the thing is)
//     at: [col, row] | ats: [[c, r], ...] | mover: { prop: value },   the thing the route needs (a tile, several tiles, or every mover with those properties)
//     line,                               the stall nudge (one hint-box line, <= NUDGE_MAX): names the thing, never how to work it
//     glint: 'always' (default) | 'stall' the glint shows at once, or only once the 10 s stall has begun
//     done: [prop, col, row, field]       it no longer applies once that prop has `field` set ('!field': not set)
//     when: [prop, col, row, field]       it applies only once that is so
//     off: { prop: value }                not while the hero stands on a mover with those properties
//     steps: [ {zone?, at/ats/mover, line, done?, when?}, ... ] }   an ordered chain: the first step that is not done
// Columns and rows are the FINAL built tiles (the same numbers the signs and entities carry).
import { uwX, UW_SPILL, UW_RES } from './underwell.js';   /* (claude/underwell3) THE UNDERWELL's spots are written in its columns before the two water sections were let in */
/* an Underwell spot in the old columns, put where it stands now: its zone, its thing, and a fire.<col> key */
const uwSpot = s => ({ ...s, ...(s.zone ? { zone: [uwX(s.zone[0]), s.zone[1], uwX(s.zone[2]), s.zone[3]] } : {}), ...(s.steps ? { steps: s.steps.map(uwSpot) } : {}),
  ...(s.at ? { at: [uwX(s.at[0]), s.at[1]] } : {}), ...(s.is && /^fire\.\d+$/.test(s.is[0]) ? { is: ['fire.' + uwX(+s.is[0].slice(5)), s.is[1]] } : {}) });
export const STUCK = {
  /* STORMHOLD's THREE TOWER ROPES (claude/zipline; src/zipline.js): after ten seconds on the deck, the rope's handle glints and the guide names it */
  storm: [
    { id: 'sh-rope-1', zone: [48, 18, 52, 21], at: [52, 20], dy: 6, glint: 'stall', line: "THE GATE WATCH'S ROPE IS THE WAY DOWN TO THE BARBICAN" },
    { id: 'sh-rope-2', zone: [222, 15, 226, 18], at: [226, 17], dy: 6, glint: 'stall', line: "THE BELL WATCH'S ROPE IS THE WAY OVER THE MOAT" },
    { id: 'sh-rope-3', zone: [391, 17, 395, 20], at: [395, 19], dy: 6, glint: 'stall', line: "THE WALL WATCH'S ROPE IS THE WAY DOWN TO THE GATEHOUSE" },
  ],
  /* THE FALLING TOWER'S ORRERY LOFT (claude/archmage3; src/spiral-chase.js): the next world round on each wheel glints (m.next, kept by updateStairFx) from
     the gallery's landing and the board step (wheel A), and from the pier (wheel B) - never while you ride that wheel */
  fallingtower: [
    { id: 'ft-orrery-a', zone: [80, 87, 91, 90], mover: { orrery: 'A', next: true }, off: { orrery: 'A' }, line: 'THE ORRERY TURNS: ITS WORLDS ARE THE WAY OVER THE VOID' },
    { id: 'ft-orrery-b', zone: [94, 84, 99, 86], at: [98, 86], off: { orrery: 'B' }, line: "THE ORRERY'S OUTER WORLD IS THE WAY ON UP" },
    /* (claude/fallingtower2) THE OBSERVATORY'S TELESCOPE (the failing stair's middle), THE BREACH out of the crown, and THE SNAP's loose chunk */
    { id: 'ft-scope', zone: [36, 205, 48, 213], mover: { role: 'scope' }, off: { role: 'scope' }, glint: 'stall', line: 'THE TELESCOPE SWINGS UP TO THE NEXT LANDING' },
    { id: 'ft-breach', zone: [12, 76, 40, 83], at: [10, 81], glint: 'stall', line: 'THE STAIR IS GONE: THE BREACH IN THE WALL IS THE WAY' },
    { id: 'ft-chunk', zone: [1, 52, 9, 57], mover: { role: 'chunk' }, off: { role: 'chunk' }, line: 'THE LOOSE CHUNK OF THE CROWN IS THE WAY ACROSS' },
    /* (claude/fallingtower3) THE CRACKED PILLARS the route needs (src/tower-supports.js): the lab's - its bridge over the poison - and THE CHASE's two floors, each lit
       once he has sunk through it (when: armed); none once it is down. Its glint is on the pillar's middle */
    { id: 'ft-pillar-lab', zone: [12, 145, 33, 150], at: [33, 147], done: ['ftsupport', 33, 149, 'down'], glint: 'stall', line: 'THE CRACKED PILLAR IS THE WAY OVER THE POISON' },
    { id: 'ft-pillar-chase-0', zone: [80, 152, 105, 164], at: [93, 162], when: ['ftsupport', 93, 164, 'armed'], done: ['ftsupport', 93, 164, 'down'], line: 'THE CRACKED PILLAR: STRIKE IT, AND FOLLOW HIM DOWN' },
    { id: 'ft-pillar-chase-2', zone: [80, 182, 105, 194], at: [86, 192], when: ['ftsupport', 86, 194, 'armed'], done: ['ftsupport', 86, 194, 'down'], line: 'THE CRACKED PILLAR: STRIKE IT, AND FOLLOW HIM DOWN' },
  ],
  welltown: [   /* (claude/djinn2) THE BINDING WORKS: down the old well, down the sluice to the conduit, and the sealed door to his hall (claude/djinn3: the bellows vent between, and 40 columns on) */
    { id: 'wt-old-well', zone: [498, 18, 522, 27], at: [520, 29], glint: 'stall', line: 'THE OLD WELL IS THE WAY ON: DOWN ITS ROPE' },
    { id: 'wt-sluice', zone: [556, 30, 577, 47], at: [578, 47], glint: 'stall', line: 'THE SLUICE GOES DOWN: A TUNNEL AT ITS FOOT' },
    { id: 'wt-bellows', zone: [600, 42, 610, 49], at: [611, 47], line: 'THE BELLOWS VENT NEVER STOPS: IT STANDS IN THE WAY' },   /* (claude/djinn3) THE STEAM WORKS' one required cap: the vent glints until you are past it */
    { id: 'wt-seal-door', zone: [628, 44, 646, 55], at: [647, 54], glint: 'stall', line: 'THE SEALED DOOR: HIS HALL IS PAST IT' },
  ],
  /* THE UNBURIED FIELD (claude/unburiedart): every engine the route can use glints until it has been used; the ladder out of the ravine; the tower's ladder after a stall.
     The engines' state is fed in by main.js (UNBF.engineProps: fired / used); one spot at a time, so a zone ends where the next engine's begins. */
  unburied: [   /* (the spots east of the Rider's gate are listed BEFORE the arena's: the runtime check puts a hero at each in turn, and one put in the arena starts the fight and is held there) */
    { id: 'ub-ballista-130', zone: [112, 24, 152, 46], at: [130, 36], done: ['ballista', 130, 36, 'fired'], line: 'A BALLISTA STILL LOADED: SOMETHING IS IN ITS SIGHTS' },
    { id: 'ub-ballista-188', zone: [168, 18, 194, 34], at: [188, 28], done: ['ballista', 188, 28, 'fired'], line: 'A SECOND BALLISTA, HIGH ON THE DECK, STILL LOADED' },
    { id: 'ub-oil-200', zone: [190, 34, 214, 46], at: [200, 41], done: ['oilbarrel', 200, 41, 'used'], line: 'SIEGE OIL, STILL IN ITS BARRELS: THE TRENCH IS LOW' },
    { id: 'ub-trebuchet-230', zone: [214, 18, 236, 46], at: [230, 36], dy: -22, done: ['trebuchet', 230, 36, 'used'], line: 'THE TREBUCHET IS STILL LOADED, AND THE TOWER IS IN ITS SIGHTS' },
    { id: 'ub-ballista-418', zone: [482, 24, 504, 37], at: [490, 36], done: ['ballista', 490, 36, 'fired'], line: 'THE BALLISTA BY THE ARENA DOOR IS STILL LOADED' },   /* (claude/unburied4: 72 east, past the bailey) */
    /* THE BAILEY (claude/unburied4): the mantlet in each reach of mud, after a stall - and the barricade and the breach, each a wall the mantlet is the way up */
    { id: 'ub-mantlet-a', zone: [364, 30, 384, 40], mover: { mantlet: 'a' }, glint: 'stall', line: 'A WHEELED MANTLET IN THE MUD: THE BOWS CANNOT SEE THROUGH IT' },
    { id: 'ub-mantlet-b', zone: [386, 30, 408, 40], mover: { mantlet: 'b' }, glint: 'stall', line: 'ANOTHER MANTLET: THE BREACH CANNOT SEE PAST IT' },
    { id: 'ub-mantlet-c', zone: [409, 30, 427, 40], mover: { mantlet: 'c' }, glint: 'stall', line: 'THE BREACH IS HIGH, AND A MANTLET STANDS IN THE MUD' },
    { id: 'ub-tower-ladder', zone: [238, 30, 262, 40], rows: [32, 40], at: [256, 34], glint: 'stall', line: 'THE TOWER LIES OVER: ITS LADDER IS THE WAY UP' },
    { id: 'ub-rope-ladder', zone: [273, 41, 316, 47], rows: [41, 48], at: [273, 42], line: 'THE OLD ROPE LADDER IN THE WEST WALL IS THE WAY OUT' },
    { id: 'ub-mangonel', zone: [262, 24, 300, 46], at: [268, 36], dy: -4, done: ['mangonel', 268, 36, 'used'], line: 'A MANGONEL AT THE BRIDGEHEAD: THE FAR BANK IS IN ITS RANGE' },
    { id: 'ub-tower-ladder-2', zone: [334, 28, 346, 37], rows: [28, 37], at: [341, 33], glint: 'stall', done: ['drawbridge', 346, 23, 'used'], line: 'THE SIEGE TOWER STANDS AT THE WALL: ITS LADDER IS THE WAY UP' },
    { id: 'ub-drawbridge', zone: [338, 18, 348, 25], at: [346, 23], dy: -8, done: ['drawbridge', 346, 23, 'used'], line: 'THE DRAWBRIDGE IS TIED OFF: ITS ROPE HOLDS IT UP' },
  ],
  /* (claude/stuckguides) WOOD: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  wood: [   /* (claude/lumbertrail) THE LUMBER TRAIL: every required fell and the first ride (src/lumber-trail.js FELLS) */
    { id: 'wd-gully', zone: [14, 18, 27, 22], at: [25, 21], glint: 'stall', done: ['felltree', 25, 21, 'felled'], line: 'THE MARKED PINE BY THE GULLY IS THE WAY ACROSS' },
    { id: 'wd-raft', zone: [112, 16, 130, 26], ats: [[130, 21], [131, 21]], glint: 'stall', line: 'THE LOG RAFT IS THE WAY OVER THE DEEP POOL' },
    { id: 'wd-leanto', zone: [262, 12, 276, 17], at: [266, 16], glint: 'stall', done: ['felltree', 266, 16, 'felled'], line: 'THE MARKED PINE UNDER THE CLIFF IS THE WAY UP' },
    { id: 'wd-tarn', zone: [405, 8, 416, 13], at: [415, 12], glint: 'stall', done: ['felltree', 415, 12, 'felled'], line: 'THE MARKED PINE AT THE TARN IS THE WAY ACROSS' },
    { id: 'wd-tarn-out', zone: [418, 14, 428, 22], at: [417, 15], line: 'THE STONE AT THE NEAR SIDE IS THE WAY OUT OF THE TARN' },   /* in the water: swim back to the stone */
    { id: 'wd-ford-out', zone: [130, 22, 146, 26], ats: [[129, 21], [147, 21]], line: 'CLIMB OUT ONTO A BANK: THE DEEP POOL DRAINS YOU' },
  ],
  /* (claude/stuckguides) MARSH: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  marsh: [
    /* (claude/marsh2, brief-first2 2: the crank-then-pay two step was unread, and the warden never boards) THE FERRY: the ferryman, his crank and the sluice glint together */
    { id: 'ms-ferry', zone: [140, 10, 168, 22], ats: [[168, 17], [164, 17], [165, 17]], glint: 'stall', off: { ferry: true }, done: ['sluice', 165, 17, 'open'], line: 'FERRYMAN: TEN GOLD. CRANK: CALLS HIS RAFT. OR BREAK THE SLUICE' },
    /* (claude/marsh2) THE SLUICE HOUSE (src/marsh2.js): up its ladder to the gate, the gate itself, then the boards out of the drained mud */
    { id: 'ms-sluice-house', zone: [336, 4, 349, 22], glint: 'stall', done: ['sluice', 347, 10, 'open'], steps: [
      { zone: [336, 12, 349, 22], at: [349, 16], line: 'THE SLUICE HOUSE LADDER: ITS GATE IS UP TOP' },
      { zone: [344, 4, 349, 12], at: [347, 10], line: 'THE SLUICE GATE: BREAK IT AND THE FAR BASIN DRAINS' }] },
    { id: 'ms-mud-out', zone: [350, 18, 369, 26], ats: [[363, 21], [365, 19]], glint: 'stall', line: 'THE BOARDS AT THE FAR END CLIMB OUT OF THE MUD' },
    { id: 'ms-vine-1', zone: [244, 4, 262, 20], at: [260, 13], glint: 'stall', line: 'A VINE HANGS OVER THE WATER: IT IS THE WAY ACROSS' },
    { id: 'ms-vine-2', zone: [277, 4, 295, 20], at: [293, 13], glint: 'stall', line: 'THE NEXT VINE HANGS OVER THE WATER' },
    { id: 'ms-grove-raft', zone: [372, 10, 392, 22], ats: [[391, 17], [390, 17]], glint: 'stall', done: ['sluice', 390, 17, 'open'], line: 'THE GROVE CRANK AND THE SLUICE: ONE OF THEM IS THE WAY' },
    /* (claude/marsh3, src/marsh3.js) THE REED RUN's raft, THE BOOM's lever (and back to the raft), THE NIGHT PADS' lights */
    { id: 'ms-reedrun', zone: [441, 10, 452, 22], at: [452, 17], glint: 'stall', line: 'STEP ON THE RAFT: THE CURRENT CARRIES HER' },
    { id: 'ms-boom', zone: [528, 8, 575, 22], glint: 'stall', steps: [
      { at: [571, 16], done: ['lever', 571, 17, 'on'], line: 'THE LEVER ON THE DECK PAST THE PADS OPENS THE BOOM: STRIKE IT' },
      { zone: [545, 8, 575, 22], at: [551, 17], line: 'THE BOOM IS OPEN: BACK TO THE RAFT, SHE CARRIES YOU ON' }] },
    { id: 'ms-night', zone: [596, 8, 612, 22], at: [602, 17], line: 'THE PADS WITH A MARSH LIGHT HOLD. WAIT ON THOSE' },
  ],
  /* SPOREWOOD 2, THE MOTHER'S KNOT (claude/sporewood2): every lock on the way - the buds, the bounce caps, the dark buds' lanterns, the leaning caps, the
     bounce well, the larder stair and the seed caps at her door (built rows: src/sporewood.js lays them one row higher, DY) */
  spore: [
    { id: 'sw-bud-28', zone: [18, 36, 29, 41], at: [28, 40], glint: 'stall', line: 'STOP ON THE BUD: THE CAP GROWS INTO A STEP' },
    { id: 'sw-pit-64', zone: [52, 33, 66, 41], ats: [[61, 41], [64, 41]], glint: 'stall', line: 'DROP INTO THE PIT: HOLD JUMP ON A BOUNCE CAP' },
    { id: 'sw-bud-77', zone: [67, 33, 78, 37], at: [77, 36], glint: 'stall', line: 'LET THE SPORES BURST, THEN STOP ON THE BUD' },
    { id: 'sw-bud-85', zone: [79, 29, 86, 33], at: [85, 32], glint: 'stall', line: 'THE NEXT BUD TAKES YOU TO THE TOP TIER' },
    { id: 'sw-dark-136', zone: [128, 34, 137, 39], steps: [
      { at: [133, 38], done: ['glowbud', 133, 38, 'lit'], line: 'THE BUD IS DARK: STRIKE THE LANTERN CAP BESIDE IT' },
      { at: [136, 38], line: 'THE LANTERN IS LIT: STOP ON THE DARK BUD NOW' }] },
    { id: 'sw-shaft-168', zone: [161, 36, 169, 41], steps: [
      { at: [165, 40], done: ['glowbud', 165, 40, 'lit'], line: 'STRIKE THE LANTERN CAP: ITS LIGHT LETS THE BUD GROW' },
      { at: [168, 40], line: 'STOP ON THE LIT BUD' }] },
    { id: 'sw-shaft-180', zone: [170, 32, 181, 37], steps: [
      { at: [176, 36], done: ['glowbud', 176, 36, 'lit'], line: 'THE NEXT BUD IS DARK: ITS LANTERN CAP IS BESIDE YOU' },
      { at: [180, 36], line: 'STOP ON THE LIT BUD' }] },
    { id: 'sw-shaft-188', zone: [182, 28, 189, 33], steps: [
      { at: [186, 32], done: ['glowbud', 186, 32, 'lit'], line: 'THE LAST DARK BUD: STRIKE ITS LANTERN CAP' },
      { at: [188, 32], line: 'STOP ON THE LIT BUD' }] },
    { id: 'sw-lean-208', zone: [199, 23, 209, 29], at: [208, 26], glint: 'stall', line: 'THIS CAP LEANS: STOP ON IT AT THE EDGE' },
    { id: 'sw-bud-220', zone: [218, 23, 221, 27], at: [220, 26], glint: 'stall', line: 'STOP ON THE BUD BETWEEN THE SPORE DROPS' },
    { id: 'sw-bounce-237', zone: [222, 19, 238, 27], ats: [[236, 27], [237, 27], [238, 27]], glint: 'stall', line: 'THE BOUNCE STALK THROWS YOU UP TO THE HIGH STALK' },
    { id: 'sw-lean-250', zone: [241, 19, 251, 23], at: [250, 22], glint: 'stall', line: 'THE LEANING CAP CARRIES YOU OVER THE GAP' },
    { id: 'sw-bud-263', zone: [260, 19, 264, 23], at: [263, 22], glint: 'stall', line: 'STOP ON THE BUD: IT LIFTS YOU TO THE LADDER' },
    { id: 'sw-well-282', zone: [265, 15, 282, 24], ats: [[279, 24], [282, 24]], glint: 'stall', line: 'THE BOUNCE WELL: THE FAR CAP THROWS YOU OUT' },
    { id: 'sw-bud-314', zone: [301, 16, 315, 20], at: [314, 19], glint: 'stall', line: 'STOP ON THE BUD BY THE ROOT WALL' },
    { id: 'sw-bud-332', zone: [331, 12, 333, 16], at: [332, 15], glint: 'stall', line: 'THE NEXT BUD TAKES YOU UP TO THE LARDER END' },
    { id: 'sw-ledge-148', zone: [140, 30, 153, 41], ats: [[148, 35], [149, 35]], glint: 'stall', line: 'HOP ONTO THE BOUNCE CAPS: THEY THROW YOU UP THE WALL' },   /* (claude/sporeplat) the Lantern Ledges */
    { id: 'sw-lean-316', zone: [316, 12, 324, 24], at: [316, 15], glint: 'stall', line: 'STOP ON THE LEANING CAP: IT CARRIES YOU OVER THE BOG' },   /* the Root Span */
    { id: 'sw-bounce-330', zone: [325, 14, 330, 24], ats: [[329, 20], [330, 20]], glint: 'stall', line: 'HOP DOWN ONTO THE BOUNCE CAPS: THEY THROW YOU UP' },
    { id: 'sw-lean-369', zone: [364, 3, 379, 8], at: [369, 5], glint: 'stall', line: 'STOP ON THE LEANING CAP: IT CARRIES YOU OVER THE BREAK' },   /* the Root Break */
    { id: 'sw-seeds', zone: [356, 8, 367, 12], ats: [[363, 11], [366, 11]], glint: 'stall', line: 'STRIKE THE SEED CAPS: EACH GROWS A STEP' },
  ],
  /* (claude/stuckguides) FLOTILLA: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  /* (claude/flotilla2) THE FLOTILLA 2, rebuilt x2: every route need - the bowsprit, the benches (the rowers), the stern castle, the long gap's lines, the rigging run's
     mast and yards, the Powder Ship's copper doors and crate hatch (a gun opens each) */
  flotilla: [
    { id: 'fl-bowsprit', zone: [14, 18, 30, 30], at: [28, 24], glint: 'stall', line: "THE GALLEY'S BOWSPRIT REACHES BACK OVER THE GAP" },
    { id: 'fl-bench-teach', zone: [96, 18, 103, 26], mover: { bench: 'b0' }, glint: 'stall', line: 'HER BENCHES RIDE UP AND DOWN: STEP ON AT THE TOP' },
    { id: 'fl-bench-test', zone: [113, 18, 120, 26], mover: { bench: 'b1' }, glint: 'stall', line: 'WATCH THE BENCHES: THEY RISE OUT OF STEP' },
    { id: 'fl-castle', zone: [150, 14, 170, 34], mover: { bench: 'b6' }, glint: 'stall', line: 'THE LAST BENCH RISES TO THE CASTLE: FREE ITS ROWER AT THE TOP' },
    { id: 'fl-swing-214', zone: [203, 12, 216, 32], at: [214, 20], glint: 'stall', line: 'A LINE SWINGS OVER THE GAP TO THE HULK' },
    { id: 'fl-swing-220', zone: [214, 12, 224, 32], at: [220, 20], glint: 'stall', line: 'THE NEXT LINE SWINGS OVER THE GAP' },
    { id: 'fl-rigging', zone: [272, 14, 287, 22], at: [286, 14], glint: 'stall', line: "THE WAY ON IS UP THE MAST: THERE IS NO DECK TO THE NEXT SHIP" },
    { id: 'fl-yard', zone: [284, 4, 300, 12], mover: { flot: 'yard' }, glint: 'stall', line: 'A YARD RIDES OUT TO YOU: STEP ON WHEN IT COMES' },
    { id: 'fl-door-406', zone: [390, 18, 405, 26], at: [398, 24], glint: 'stall', done: ['bulkhead', 406, 24, 'open'], line: 'THE COPPER DOOR: THE GUN BEHIND IT OPENS IT' },
    { id: 'fl-hatch', zone: [444, 18, 457, 26], ats: [[448, 24], [454, 24]], glint: 'stall', line: 'THE HATCH IS POWDER CRATES: BLOW THE KEG ON IT' },
    { id: 'fl-doors-490', zone: [478, 18, 499, 26], at: [482, 24], glint: 'stall', done: ['bulkhead', 500, 24, 'open'], line: 'ONE GUN, TWO DOORS: FIRE, LET IT COOL, FIRE AGAIN' },
  ],
  /* (claude/stuckguides) HURRICANE: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  hurricane: [   /* (claude/hurricane3) THE HURRICANE DECK 3: every storm verb on the road - the roll, the lashing, the flood, the foremast, the rods, the gun, the mizzen, the gusts, the main shrouds */
    { id: 'hu-forehatch', zone: [48, 28, 56, 36], at: [58, 35], glint: 'stall', line: 'WAIT FOR HER TO HEEL AFT, THEN JUMP THE HATCH DOWNHILL' },
    { id: 'hu-lashing', zone: [63, 28, 78, 36], at: [70, 35], glint: 'stall', line: 'STRIKE THE LASHING: SHE RUNS THE CASK TO THE HOUSE' },
    { id: 'hu-waist', zone: [104, 28, 150, 44], at: [151, 32], glint: 'stall', line: 'WAIT FOR THE FLOOD: SWIM UP ONTO THE GALLEY ROOF' },
    { id: 'hu-foremast', zone: [164, 28, 175, 37], at: [172, 35], glint: 'stall', line: 'STAND BY HER FOREMAST: THE SKY LAYS IT ACROSS' },
    { id: 'hu-rod1', zone: [276, 28, 303, 37], at: [296, 35], glint: 'stall', line: 'STRIKE THE CHAIN ONTO THE IRON, THEN STAND CLEAR' },
    { id: 'hu-loosegun', zone: [286, 37, 311, 42], at: [300, 41], glint: 'stall', line: 'WHEN SHE HEELS AFT THE GUN RUNS INTO THE CARGO' },
    { id: 'hu-mizzen', zone: [452, 31, 466, 37], at: [464, 33], glint: 'stall', line: 'SHE IS GOING DOWN BY THE STERN: UP HER MIZZEN' },
    { id: 'hu-rod2', zone: [456, 22, 470, 30], at: [469, 29], glint: 'stall', line: 'STRIKE THE MIZZEN CHAIN: THE BOLT FELLS HER TOPMAST' },
    { id: 'hu-gust1', zone: [432, 18, 442, 29], at: [427, 24], glint: 'stall', line: 'WAIT FOR THE SAIL TO SNAP, THEN JUMP WITH THE GUST' },
    { id: 'hu-gust2', zone: [414, 16, 425, 29], at: [409, 22], glint: 'stall', line: 'WAIT FOR THE GUST THAT BLOWS FORWARD, THEN JUMP' },
    { id: 'hu-mainshrouds', zone: [280, 24, 335, 30], at: [308, 26], glint: 'stall', line: 'UP THE MAIN SHROUDS TO THE TOP' },
  ],
  /* (claude/stuckguides) DEEP: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  deep: [
    { id: 'dp-stone-start', zone: [6, 19, 40, 33], at: [16, 27], glint: 'stall', line: 'A STONE ON THE DECK: THE DEEP NEEDS WEIGHT' },
    { id: 'dp-stone-55', zone: [14, 47, 44, 61], at: [26, 55], glint: 'stall', line: 'A STONE TO WALK THE BOTTOM: PICK IT UP' },
    { id: 'dp-stone-81', zone: [12, 73, 42, 87], at: [24, 81], glint: 'stall', line: 'A STONE TO WALK THE BEDS: PICK IT UP' },
    { id: 'dp-stone-129', zone: [16, 121, 44, 135], at: [30, 129], glint: 'stall', line: 'A STONE: THE PRISE WANT IT AS WELL' },
  ],
  /* (claude/stuckguides) KEEP: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  keep: [
    { id: 'kp-lever-101', zone: [87, 48, 109, 62], at: [101, 58], glint: 'stall', line: 'A WHIRLPOOL DRINKS YOUR AIR: ITS LEVER STOPS IT' },
    { id: 'kp-lever-153', zone: [139, 48, 161, 62], at: [153, 58], glint: 'stall', line: 'THE LIBRARY WHIRLPOOL: ITS LEVER STOPS IT' },
    { id: 'kp-ballast-275', zone: [267, 48, 299, 62], at: [275, 58], glint: 'stall', line: 'THE CISTERN: A STONE SINKS YOU BELOW THE RED VENTS' },
    { id: 'kp-lever-357', zone: [343, 48, 365, 62], at: [357, 58], glint: 'stall', line: 'THE BELL APPROACH WHIRLPOOL: ITS LEVER STOPS IT' },
    { id: 'kp-lever-646', zone: [632, 48, 654, 62], at: [646, 58], glint: 'stall', line: 'THE LAST WHIRLPOOL: ITS LEVER IS NEAR THE KING DOOR' },
  ],
  /* (claude/stuckguides) WAYMEET: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  waymeet: [
    { id: 'wm-drum', zone: [452, 27, 470, 41], at: [466, 35], glint: 'stall', line: 'THE PORTCULLIS DRUM HOLDS THE TOWER GATE' },
    { id: 'wm-hod-hoist', zone: [558, 22, 590, 40], at: [575, 34], glint: 'stall', line: 'THE HOD-HOIST CARRIES YOU UP THE MASONS WALL' },
    { id: 'wm-scaffold', zone: [598, 22, 628, 40], ats: [[613, 30], [615, 30]], glint: 'stall', line: 'THE SCAFFOLD BOARD SWAYS ACROSS: STEP ON IT' },
  ],
  /* (claude/stuckguides) UNDERCROWN: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  undercrown: [
    /* (claude/undercrown2) THE SLABS: every post the way on needs - the adit's (the only way up), the flooded level's two (a ramp, then the bridge), the stope's hung walkway */
    { id: 'uc-slab-adit', zone: [2, 19, 39, 24], at: [23, 23], glint: 'stall', done: ['timber', 23, 23, 'broken'], line: 'THE POST UNDER THE SLAB: CUT IT AND THE ROOF SWINGS DOWN' },
    { id: 'uc-slab-flood', zone: [28, 47, 60, 55], steps: [
      { zone: [53, 50, 60, 55], at: [45, 53], done: ['timber', 45, 53, 'broken'], line: 'THE NEAR POST: ITS END OF THE SLAB COMES DOWN AS A RAMP' },
      { zone: [28, 47, 46, 53], at: [29, 53], done: ['timber', 29, 53, 'broken'], line: 'THE FAR POST, FROM THE RAMP\'S TOP: BOTH DOWN IS A BRIDGE' } ] },
    { id: 'uc-slab-stope', zone: [22, 104, 44, 112], at: [39, 111], glint: 'stall', done: ['timber', 39, 111, 'broken'], line: 'THE HUNG WALKWAY\'S NEAR POST: CUT IT, IT SWINGS DOWN TO YOU' },
  ],
  /* (claude/stuckguides) FIELDS: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  fields: [
    { id: 'fd-trough-51', zone: [36, 24, 70, 38], at: [51, 33], glint: 'stall', line: 'THE TROUGH FEEDS THE VINE YOU NEED' },
    { id: 'fd-sluice-106', zone: [92, 22, 124, 36], at: [106, 31], glint: 'stall', line: 'THE ORCHARD SLUICE GROWS THE VINES UP' },
    { id: 'fd-bucket-131', zone: [118, 14, 146, 28], at: [131, 22], glint: 'stall', line: 'THE BUCKET FEEDS THE VINE UNDER THE BOUGH' },
    { id: 'fd-furniture', zone: [338, 10, 392, 36], ats: [[357, 33], [362, 18], [364, 26], [366, 15], [387, 25]], glint: 'stall', line: 'THE HAUNTED FURNITURE CARRIES YOU UP' },
    { id: 'fd-sails', zone: [408, 2, 440, 36], ats: [[422, 24], [422, 9]], glint: 'stall', line: 'THE MILL GEARS AND SAILS CARRY YOU UP AND OUT' },
    { id: 'fd-bale', zone: [484, 8, 502, 34], at: [501, 23], glint: 'stall', line: 'THE HAUNTED BALE RISES IN THE BARN' },
    { id: 'fd-bucket-507', zone: [504, 10, 516, 26], at: [507, 17], glint: 'stall', line: 'THE BUCKET FEEDS THE BALES: TIP IT' },
    { id: 'fd-haycart', zone: [532, 20, 562, 36], at: [547, 28], glint: 'stall', line: 'THE HAY CART CARRIES YOU ACROSS THE FIELD' },
    { id: 'fd-bucket-603', zone: [587, 17, 606, 35], at: [603, 27], glint: 'stall', line: 'THE ROAD HAS GONE: THE BUCKET GROWS THE VINES OVER' },
    { id: 'fd-sluice-652', zone: [636, 23, 658, 39], at: [652, 33], glint: 'stall', line: 'THE CRYPT SLUICE GROWS THE VINES UP' },
    { id: 'fd-headstone', zone: [654, 20, 674, 36], at: [663, 27], glint: 'stall', line: 'THE RISING HEADSTONE CARRIES YOU UP' },
  ],
  /* (claude/stuckguides) BURIAL: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  burial: [
    { id: 'bu-candle-40', zone: [24, 14, 60, 26], ats: [[40, 21], [46, 22]], glint: 'stall', line: 'TAKE FIRE FROM THE CANDLE: THE GAS VENT BURNS WITH IT' },
    { id: 'bu-candle-144', zone: [108, 14, 180, 28], ats: [[144, 21], [148, 22], [162, 22], [173, 22]], glint: 'stall', line: 'THE GRAVE CANDLE LIGHTS THE VAULT VENTS' },
    { id: 'bu-coffins', zone: [186, 56, 235, 70], ats: [[193, 65], [203, 65], [208, 65]], glint: 'stall', line: 'THE RISING COFFINS ARE THE WAY OVER THE WATER' },
    { id: 'bu-coffins-2', zone: [236, 56, 296, 70], ats: [[258, 65], [263, 65], [282, 65]], glint: 'stall', line: 'THE COFFINS AND THE CHAINS CARRY YOU ON' },
    { id: 'bu-bridges', zone: [348, 24, 390, 70], ats: [[361, 66], [361, 52], [361, 38]], glint: 'stall', line: 'THE ROTTEN BRIDGES: THE CHAINS CLIMB OUT' },
    { id: 'bu-candle-374', zone: [372, 14, 404, 26], ats: [[374, 21], [381, 22]], glint: 'stall', line: 'THE GRAVE CANDLE LIGHTS THE NEXT VENT' },
    { id: 'bu-candle-405', zone: [405, 14, 458, 26], ats: [[405, 21], [424, 22], [435, 22]], glint: 'stall', line: 'THE GRAVE CANDLE LIGHTS THE VENTS AHEAD' },
    { id: 'bu-candle-472', zone: [459, 14, 525, 26], ats: [[472, 21], [476, 22], [491, 22], [512, 21]], glint: 'stall', line: 'THE LAST CANDLES LIGHT THE VENTS UNDER THE DEAD' },
  ],
  /* (claude/stuckguides) MAGE: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  mage: [
    { id: 'mg-postern-rune', zone: [30, 32, 60, 42], at: [50, 39], glint: 'stall', line: 'THE POSTERN IS WARDED: THE RUNE ON THE POST OPENS IT' },
    { id: 'mg-cases-1', zone: [64, 32, 92, 44], mover: {kind:'bookcase'}, glint: 'stall', line: 'THE SLIDING CASE IS THE WAY ACROSS THE FLOOR' },
    { id: 'mg-vault-1', zone: [92, 28, 122, 42], steps: [
      { at: [98, 39], done: ['lockrune', 98, 39, 'lit'], line: 'THE VAULT DOOR WANTS EVERY RUNE LIT' },
      { at: [110, 35], done: ['lockrune', 110, 35, 'lit'], line: 'ONE RUNE ON THE VAULT DOOR IS STILL DARK' } ] },
    { id: 'mg-cases-2', zone: [124, 32, 160, 44], mover: {kind:'bookcase'}, glint: 'stall', line: 'TWO CASES OVER THE PIT: RIDE ONE, HOP TO THE NEXT' },
    { id: 'mg-lock-2', zone: [166, 26, 212, 42], steps: [
      { at: [182, 39], done: ['lockrune', 182, 39, 'lit'], line: 'HIS OWN LOCK WANTS EVERY RUNE LIT' },
      { at: [198, 30], done: ['lockrune', 198, 30, 'lit'], line: 'THE HIGH LOCK RUNE RIDES A STACK: THE LIBRARY RUNE LIFTS IT' },
      { at: [205, 39], done: ['lockrune', 205, 39, 'lit'], line: 'ONE RUNE ON HIS LOCK IS STILL DARK' } ] },
    { id: 'mg-shelves', zone: [216, 28, 272, 42], ats: [[230, 39], [255, 39]], glint: 'stall', line: 'THE LIBRARY RUNES LIFT WHOLE STACKS: RIDE THE BOOKS' },
    { id: 'mg-weight-1', zone: [432, 30, 458, 44], at: [452, 39], glint: 'stall', done: ['gplate', 452, 39, 'open'], line: 'THE COUNTERWEIGHT RAISES THE GRATING: THEN RUN' },
    { id: 'mg-cellar-key', zone: [410, 38, 440, 48], at: [427, 46], glint: 'stall', done: ['key', 427, 46, 'got'], line: 'THE BRASS KEY IS DOWN IN THE WINE CELLAR' },
    { id: 'mg-orrery', zone: [520, 8, 568, 42], ats: [[540, 33], [550, 24], [561, 15]], glint: 'stall', line: "THE ORRERY'S PLANETS CARRY YOU UP TO THE DOOR" },
    { id: 'mg-lockgate', zone: [566, 30, 590, 42], at: [590, 39], glint: 'stall', done: ['lockgate', 590, 39, 'open'], line: 'THE LOCKED GATE WANTS THE BRASS KEY YOU CARRY' },
    { id: 'mg-glyph-1', zone: [596, 2, 646, 22], ats: [[607, 15], [642, 6]], glint: 'stall', line: 'A GLYPH TURNS THE ROOM OVER: STEP ON IT' },
    { id: 'mg-glyph-2', zone: [647, 2, 696, 22], ats: [[651, 15], [680, 6]], glint: 'stall', line: 'THE NEXT GLYPH TURNS THE ROOM AGAIN' },
    { id: 'mg-weight-2', zone: [716, 6, 742, 22], at: [738, 15], glint: 'stall', done: ['gplate', 738, 15, 'open'], line: 'THE LAST WEIGHT OPENS HIS DOOR' },
  ],
  /* (claude/stuckguides) WITCHLIGHT: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  witchlight: [
    { id: 'wl-slab-22', zone: [8, 72, 34, 90], ats: [[22, 81], [28, 81]], glint: 'stall', line: 'THE DRIFTING SLAB CARRIES YOU ALONG THE STAIR' },
    { id: 'wl-rune-40', zone: [34, 66, 50, 88], at: [40, 80], glint: 'stall', line: 'THE RUNE COLUMN LIFTS YOU WHILE IT GLOWS' },
    { id: 'wl-arches-1', zone: [46, 68, 90, 86], ats: [[54, 77], [66, 77], [83, 77]], glint: 'stall', line: 'THE FLOATING ARCHES ARE THE WAY ACROSS' },
    { id: 'wl-arches-2', zone: [91, 68, 134, 86], ats: [[88, 79], [97, 77], [111, 77], [123, 77]], glint: 'stall', line: 'THE NEXT ARCHES FLOAT ON TO THE GLYPH' },
    { id: 'wl-glyph-1', zone: [136, 64, 170, 84], ats: [[147, 76], [169, 70]], glint: 'stall', line: 'THE GLYPH TURNS YOU OVER: WALK THE ROOF TO THE NEXT' },
    { id: 'wl-glyph-2', zone: [171, 64, 195, 84], ats: [[173, 76], [194, 70]], glint: 'stall', line: 'THE NEXT GLYPH TURNS YOU OVER AGAIN' },
    { id: 'wl-glyph-3', zone: [196, 64, 213, 84], ats: [[198, 76], [214, 70]], glint: 'stall', line: 'THE LAST GLYPH TURNS YOU OVER ONCE MORE' },
    { id: 'wl-rune-226', zone: [214, 62, 229, 84], at: [226, 76], glint: 'stall', line: 'THE RUNE COLUMNS LIGHT ONE AFTER ANOTHER: RIDE ONE UP' },
    { id: 'wl-rune-237', zone: [230, 48, 242, 70], at: [237, 62], glint: 'stall', line: 'THE NEXT RUNE COLUMN IS THE WAY UP' },
    { id: 'wl-rune-247', zone: [243, 38, 256, 58], at: [247, 50], glint: 'stall', line: 'THE LAST RUNE COLUMN LIFTS YOU TO THE GARDEN' },
    { id: 'wl-wind-1', zone: [362, 24, 396, 44], ats: [[375, 32], [383, 39]], glint: 'stall', line: 'THE WIND WELLS IN THE MOAT LIFT YOU OUT' },
    { id: 'wl-wind-2', zone: [397, 24, 420, 44], ats: [[402, 39], [410, 39]], glint: 'stall', line: 'THE NEXT WIND WELLS LIFT YOU OUT OF THE MOAT' },
    { id: 'wl-slabs-1', zone: [422, 14, 475, 44], ats: [[425, 27], [435, 26], [440, 28], [449, 28], [457, 28], [468, 26]], glint: 'stall', line: 'THE CRACKED SLABS GIVE WAY: KEEP MOVING' },
    { id: 'wl-vent-483', zone: [476, 14, 498, 44], at: [483, 28], glint: 'stall', line: 'THE RUNE COLUMN LIFTS YOU OVER THE BATTLEMENT' },
    { id: 'wl-slabs-2', zone: [499, 12, 538, 44], ats: [[501, 21], [524, 27], [533, 27]], glint: 'stall', line: 'THE SLABS ABOVE THE WIND ARE THE WAY ON' },
    { id: 'wl-vent-541', zone: [539, 12, 562, 44], ats: [[541, 26], [549, 22]], glint: 'stall', line: 'THE LAST RUNE COLUMN LIFTS YOU TO THE STAIR TOP' },
  ],
  /* (claude/stuckguides) HARBOR: every route verb, a glint and the 10 s stall nudge (keyed by id so a rework can rewrite them) */
  harbor: [
    { id: 'hb-crane-1', zone: [176, 12, 200, 34], at: [193, 20], glint: 'stall', line: 'THE SALVAGE CRANE CARRIES YOU UP TO THE HIGH CARGO' },
    { id: 'hb-crane-2', zone: [214, 12, 240, 34], at: [232, 20], glint: 'stall', line: 'THE SECOND SALVAGE CRANE CARRIES YOU ON' },
    { id: 'hb-lift', zone: [718, 16, 742, 34], at: [735, 29], glint: 'stall', line: 'THE CARGO HALL LIFT SHORTENS THE CROSSING' },
  ],
  causeway: [
    { id: 'cw-boom', zone: [421, 0, 478, 43], ats: [[479, 17], [464, 17]], glint: 'stall', line: 'THE BOOM LIFTS AT HIGH WATER: THE TOWER BELL TURNS THE TIDE' },
    { id: 'cw-bell-first', zone: [4, 10, 38, 24], at: [18, 17], glint: 'stall', line: 'THE TIDE BELL TURNS THE TIDE: THE ROAD FOLLOWS IT' },
    { id: 'cw-bell-chapel', zone: [262, 12, 300, 26], at: [281, 19], glint: 'stall', line: 'THE CHAPEL BELL IS A TIDE BELL TOO' },
  ],
  longwater: [
    { id: 'lw-bore-gate', zone: [318, 0, 361, 28], at: [362, 22], glint: 'stall', line: 'THE SEA GATE LIFTS AS THE BORE GOES BY: STAND ON A STONE' },
    { id: 'lw-quay-gate', zone: [366, 0, 386, 27], at: [387, 22], glint: 'stall', line: 'THE QUAY GATE LIFTS AT HIGH WATER: WAIT FOR THE BELL' },
    { id: 'lw-flats-gate', zone: [388, 0, 418, 28], ats: [[419, 22], [390, 25]], glint: 'stall', line: 'THE FLATS GATE LIFTS AT LOW WATER: DRAIN THE STREET OR WAIT' },
  ],
  /* KINGSWOOD 2 (claude/kingswood2): every rope the route needs until it is cut (the checkpoint's step, the stands' span, the cage stair), and the court gate's plate */
  kings: [
    { id: 'kg-check-cage', zone: [44, 33, 58, 37], at: [52, 37], done: ['hoist', 52, 37, 'on'], line: "THE CHECKPOINT'S CAGE HANGS ON A PEG: STRIKE IT" },
    { id: 'kg-stand-span', zone: [143, 24, 150, 27], at: [149, 27], done: ['hoist', 149, 27, 'on'], line: 'NO JUMP CROSSES: THE LOG SPAN HANGS ON A PEG' },
    { id: 'kg-cage-stair', zone: [244, 10, 260, 22], steps: [
      { at: [249, 22], done: ['hoist', 249, 22, 'on'], line: 'THE CAGE STAIR: STRIKE THE PEG BY THE TRUNK' },
      { at: [254, 18], done: ['hoist', 254, 18, 'on'], line: 'THE SECOND CAGE STILL HANGS: ITS PEG' },
      { at: [258, 14], done: ['hoist', 258, 14, 'on'], line: 'THE THIRD CAGE STILL HANGS: ITS PEG' } ] },
    { id: 'kg-court-gate', zone: [396, 0, 409, 13], at: [405, 11], done: ['plate', 405, 11, 'down'], line: 'THE COURT GATE IS SHUT: STAND ON THE PLATE ON THE STEP' },
  ],
  /* THE PALISADE WOOD (claude/palisadewood): every prop the route needs until it is knocked out (the two ramps, the two watchtowers, the gatehouse ditch's scaffold) */
  /* THE KITCHEN GATE (claude/kitchengate): every bellows the route needs (strike it: its fire roars and works its copper, its great spit or its trail) */
  kitchengate: [
    { id: 'kg-scullery', zone: [50, 28, 72, 39], at: [60, 39], done: ['kgbellows', 60, 39, 'on'], line: 'UP THE WELL: STRIKE THE BELLOWS, STAND IN THE STEAM' },
    { id: 'kg-brewhouse', zone: [74, 17, 89, 26], at: [85, 26], done: ['kgbellows', 85, 26, 'on'], line: 'THE FACE IS TOO HIGH: STRIKE THE BELLOWS, STAND IN THE STEAM' },
    { id: 'kg-spit1', zone: [105, 19, 118, 25], at: [108, 25], done: ['kgbellows', 108, 25, 'on'], line: 'THE LEDGE IS TOO HIGH: STRIKE THE BELLOWS, RIDE A SPIT UP' },
    { id: 'kg-spit2', zone: [120, 14, 146, 19], at: [135, 19], done: ['kgbellows', 135, 19, 'on'], line: 'THE LEDGE IS TOO HIGH: STRIKE THE BELLOWS, RIDE A SPIT UP' },
    { id: 'kg-trench', zone: [147, 4, 166, 13], at: [161, 13], done: ['kgbellows', 161, 13, 'on'], line: 'STRIKE THE BELLOWS: RISE ON THE STEAM, CATCH A HOOK' },
    { id: 'kg-door1', zone: [221, 14, 237, 23], at: [223, 23], done: ['kgbellows', 223, 23, 'on'], line: 'A TALLOW DOOR: STRIKE THE BELLOWS, LET THE GREASE BURN' },
    { id: 'kg-spit3', zone: [300, 8, 315, 21], at: [304, 21], done: ['kgbellows', 304, 21, 'on'], line: 'THE GALLERY IS TOO HIGH: STRIKE THE BELLOWS, RIDE A SPIT UP' },
    { id: 'kg-door2', zone: [341, 13, 354, 21], at: [343, 21], done: ['kgbellows', 343, 21, 'on'], line: 'THE BUTTERY DOOR: STRIKE THE BELLOWS, LET IT BURN' },
  ],
  palisadewood: [
    { id: 'pw-edge-ramp', zone: [12, 33, 24, 37], at: [19, 37], done: ['scaffoldprop', 19, 37, 'on'], line: 'THE LEDGE IS TOO HIGH: KNOCK OUT THE SCAFFOLD PROP' },
    { id: 'pw-yard-tower', zone: [136, 27, 146, 31], at: [142, 31], done: ['towerprop', 142, 31, 'on'], line: "NO JUMP CROSSES: KNOCK OUT THE WATCHTOWER'S PROP" },
    { id: 'pw-wall-ramp', zone: [205, 18, 221, 28], at: [215, 28], done: ['scaffoldprop', 215, 28, 'on'], line: 'THE WALL IS TOO HIGH: KNOCK OUT THE TOP TIER PROP' },
    { id: 'pw-wall-tower', zone: [244, 8, 253, 12], at: [249, 12], done: ['towerprop', 249, 12, 'on'], line: "THE UNBUILT SPAN: KNOCK OUT THE WATCHTOWER'S PROP" },
    { id: 'pw-gate-bridge', zone: [378, 20, 389, 24], at: [385, 24], done: ['towerprop', 385, 24, 'on'], line: 'THE DITCH: KNOCK OUT THE PROP UNDER THE GATEHOUSE SCAFFOLD' },
  ],
  theatre: [
    { id: 'th-hatch-rope', zone: [108, 26, 140, 34], at: [130, 28], line: 'A ROPE BY THE RACKS: CLIMB IT' },
    { id: 'th-quick-lock', zone: [122, 18, 141, 25], at: [140, 24], line: 'THE ROPE-LOCK BY THE SHUTTER: STRIKE IT' },
    { id: 'th-fly-gap', zone: [205, 8, 216, 16], at: [216, 15], line: 'THE FLOOR STOPS: THE ROPE-LOCK BESIDE YOU IS THE WAY' },
    { id: 'th-stage-trap', zone: [224, 22, 240, 33], at: [233, 33], line: 'THE WAY ON IS DOWN: THE TRAP AT STAGE LEFT' },
    { id: 'th-ride-weight', zone: [268, 8, 286, 16], at: [287, 15], line: 'THE FLOOR ENDS AT THE PIN RAIL: THE ROPE-LOCK IS THE WAY' },
    { id: 'th-wing-winch', zone: [305, 24, 321, 33], at: [317, 33], line: 'A FLAT BARS THE WING: FIND ITS WINCH' },
    { id: 'th-paint-batten', zone: [390, 24, 418, 33], at: [397, 33], line: 'THE PAINT FRAME BARS THE FLOOR: A ROPE-LOCK BY THE BATTEN' },   /* (claude/theatre4) THE GREEN ROOM: the paint batten is the way over the frame */
  ],
  reef: [
    { id: 'rf-hoist', zone: [188, 10, 214, 28], steps: [
      { at: [198, 27], done: ['capstan', 198, 27, 'done'], line: 'THE HOIST IS LOCKED: THE CAPSTAN FREES IT' },
      { mover: { link: 'hoist' }, line: 'THE HOIST IS FREE: STAND ON THE PALLET' } ] },
    { id: 'rf-shaft', zone: [228, 14, 262, 36], at: [259, 12], line: 'THE DRY DECK IS ABOVE YOU: SWIM UP THE SHAFT' },
    { id: 'rf-grate', zone: [262, 3, 311, 34], steps: [
      { zone: [262, 3, 300, 11], at: [292, 11], done: ['capstan', 292, 11, 'done'], line: 'THE GRATE WANTS THE CAPSTAN ON HER DECK' },
      { zone: [262, 3, 300, 11], at: [283, 12], line: 'THE GRATE IS UP: DROP THROUGH THE HATCH' },
      { zone: [262, 13, 311, 34], at: [292, 11], done: ['capstan', 292, 11, 'done'], line: 'THE CAPSTAN IS ON HER DECK, ABOVE YOU' },
      { zone: [262, 13, 311, 34], at: [302, 29], line: 'SWIM FOR THE RAISED GRATE' } ] },
  ],
  fair: [
    /* (claude/fairfix5, the house rule over the fair's own route: the striker pad, the gallery targets, the wheel's cars, the ticket gates you can pay) */
    { id: 'fr-striker', zone: [74, 14, 96, 28], at: [88, 27], glint: 'stall', line: 'THE HIGH STRIKER PAD THROWS YOU UP' },
    { id: 'fr-gallery', zone: [162, 16, 186, 23], ats: [[171, 21], [176, 21], [181, 21]], glint: 'stall', line: 'THE GALLERY TARGETS RAISE THE PLANKS UP THE STALL' },
    { id: 'fr-loft', zone: [182, 8, 196, 14], at: [188, 15], glint: 'stall', line: 'THE LOFT GATE OPENS FOR FIVE TICKETS' },
    { id: 'fr-wheel', zone: [288, 14, 300, 28], mover: { fair: 'gondola' }, glint: 'stall', line: 'THE BIG WHEEL IS THE WAY OVER THE PIT' },
    { id: 'fr-yard', zone: [340, 22, 348, 28], ats: [[341, 27], [343, 27], [345, 27]], glint: 'stall', line: 'THE YARD TARGETS RAISE THE PLANKS TO THE HALL ROOF' },
    { id: 'fr-hayloft', zone: [398, 5, 411, 12], at: [403, 11], glint: 'stall', line: 'THE HAYLOFT GATE OPENS FOR TWELVE TICKETS' },
    { id: 'fr-backlot', zone: [596, 20, 607, 28], at: [602, 27], glint: 'stall', line: 'THE BACK LOT HATCH OPENS FOR THIRTY TICKETS' },
    { id: 'fr-boats', zone: [198, 14, 228, 28], mover: { fair: 'boat' }, line: 'THE SWINGING BOAT IS THE WAY ACROSS THE PIT' },
    { id: 'fr-corn', zone: [400, 5, 430, 28], ats: [[420, 27], [409, 27]], glint: 'stall', line: "A BULL'S-EYE AND A PAD: ONE OF THEM IS THE WAY ON" },
    { id: 'fr-night-striker', zone: [545, 15, 566, 28], at: [566, 27], line: 'THE STRIKER PAD IS THE WAY UP' },
    { id: 'fr-night-targets', zone: [563, 5, 594, 27], ats: [[570, 13], [578, 13], [587, 14]], line: 'THE BARS DROP FOR THE TARGETS: HIT ALL THREE, FAST' },
  ],
  /* (claude/underleaf3) UNDERLEAF 3: every REQUIRED jar use - the seed bed (until its vine grows), the thorn hedge (until it burns), the float well (until a bubble has lifted you from it).
     The beds, hedges and wells are src/potion-hands.js's props (main.js hands them to the guide: POH.props): their tile is where the glint stands */
  underleaf: [
    { id: 'ul-bed-garden', zone: [1,20,13,31], at: [13,29], done: ['vinebed', 13, 29, 'grown'], line: "THE SEED BED AT THE WALL: HER GREEN JAR IS BY IT" },
    { id: 'ul-bed-ditch', zone: [44,20,49,31], at: [49,29], done: ['vinebed', 49, 29, 'grown'], line: "THE SEED BED ON THE DITCH'S LIP: A GREEN JAR GROWS A BRIDGE" },
    { id: 'ul-bed-warden', zone: [76,20,87,31], at: [87,29], done: ['vinebed', 87, 29, 'grown'], line: "THE SEED BED AT THE WALL: THE GREEN JAR IS BACK ALONG THE LANE" },
    { id: 'ul-well-loft', zone: [97,20,104,31], at: [103,29], done: ['floatwell', 103, 29, 'used'], line: "THE FLOAT WELL UNDER THE LOFT: HER BLUE JAR IS BY IT" },
    { id: 'ul-well-rack', zone: [136,12,146,19], at: [144,17], done: ['floatwell', 144, 17, 'used'], line: "THE HIGH RACK: A BLUE BUBBLE OFF THE BOARD" },
    { id: 'ul-hedge-1', zone: [189,20,197,31], at: [198,29], done: ['thornhedge', 198, 29, 'burnt'], line: "THE THORN HEDGE: HER RED JAR BURNS IT" },
    { id: 'ul-hedge-2', zone: [217,25,231,33], at: [232,32], done: ['thornhedge', 232, 32, 'burnt'], line: "THE THORN HEDGE IN THE HOLLOW: A RED JAR" },
    { id: 'ul-hedge-3', zone: [255,20,269,31], at: [270,29], done: ['thornhedge', 270, 29, 'burnt'], line: "THE THIRD HEDGE: A RED JAR BURNS IT" },
    { id: 'ul-yard', zone: [279,20,292,31], steps: [   /* the remix: the thorns first, then the bed they hid */
      { at: [290,29], done: ['thornhedge', 290, 29, 'burnt'], line: "THE THORNS HIDE A SEED BED: BURN THEM FIRST" },
      { at: [292,29], done: ['vinebed', 292, 29, 'grown'], line: "THE SEED BED UNDER THE YARD: A GREEN JAR" } ] },
    { id: 'ul-well-yard', zone: [306,17,318,23], at: [316,22], done: ['floatwell', 316, 22, 'used'], line: "THE FLOAT WELL: A BUBBLE UP TO HER LEAF" },
    { id: 'ul-bed-leaf', zone: [317,10,322,16], at: [322,15], done: ['vinebed', 322, 15, 'grown'], line: "THE SEED BED ON THE LEAF: A BRIDGE TO THE HEARTH" },
    /* (claude/underleaf4) THE VINE GULLY: each stump's bed grows the next bridge; the third stump's bed the ladder up the cliff */
    { id: 'ul-gully-1', zone: [372,24,376,31], at: [376,29], done: ['vinebed', 376, 29, 'grown'], line: "THE GULLY: A GREEN JAR ON THE BANK'S BED GROWS A BRIDGE" },
    { id: 'ul-gully-2', zone: [385,22,387,29], at: [387,28], done: ['vinebed', 387, 28, 'grown'], line: "THE STUMP'S BED: A GREEN JAR GROWS THE NEXT BRIDGE" },
    { id: 'ul-gully-3', zone: [396,21,398,28], at: [398,27], done: ['vinebed', 398, 27, 'grown'], line: "THE STUMP'S BED: A GREEN JAR GROWS THE NEXT BRIDGE" },
    { id: 'ul-gully-4', zone: [407,20,409,28], at: [409,27], done: ['vinebed', 409, 27, 'grown'], line: "THE CLIFF'S FOOT: A GREEN JAR GROWS A LADDER UP IT" },
    /* THE BUBBLE SHAFTS: a well on the lip and on each rack; the remix - the vine ledge first, then the float to it */
    { id: 'ul-shaft-1', zone: [414,14,420,21], at: [420,20], done: ['floatwell', 420, 20, 'used'], line: "THE LIP'S WELL: A BLUE JAR AT YOUR FEET, RIDE TO THE RACK" },
    { id: 'ul-shaft-2', zone: [422,8,425,14], at: [425,13], done: ['floatwell', 425, 13, 'used'], line: "THE RACK'S WELL: ANOTHER BUBBLE UP" },
    { id: 'ul-shaft-3', zone: [432,6,438,14], steps: [
      { at: [438,12], done: ['vinebed', 438, 12, 'grown'], line: "THE THIRD RACK: A GREEN JAR GROWS A VINE LEDGE UP THERE" },
      { at: [438,12], done: ['floatwell', 438, 12, 'used'], line: "NOW A BLUE JAR: FLOAT UP TO THE LEDGE" } ] },
    { id: 'ul-hedge-leaf', zone: [458,20,467,31], at: [468,29], done: ['thornhedge', 468, 29, 'burnt'], line: "HER LEAF: THE THORNS FIRST" },   /* (claude/underleaf4: her great leaf moved +86) */
    { id: 'ul-bed-great', zone: [470,20,478,31], at: [478,29], done: ['vinebed', 478, 29, 'grown'], line: "THE SEED BED AT HER WALL: A GREEN JAR" },
    { id: 'ul-well-great', zone: [479,15,496,24], at: [494,23], done: ['floatwell', 494, 23, 'used'], line: "THE FLOAT WELL: A BUBBLE TO HER STOOP" },
  ],
  burning: [
    { id: 'bn-yard-gate', zone: [124, 18, 137, 30], at: [137, 23], glint: 'stall', line: 'THE GATE BURNS: WATER OPENS IT, OR THE ROOF' },
    { id: 'bn-barn-gate', zone: [304, 18, 321, 30], at: [322, 24], glint: 'stall', line: 'THE BARN DOOR BURNS: WATER OPENS IT, OR THE ROOF' },
    { id: 'bn-fallen-house', zone: [200, 22, 232, 30], ats: [[227, 25], [208, 23]], line: 'TOO HIGH TO JUMP: WATER, OR THE ROOFS' },
    { id: 'bn-trench', zone: [240, 18, 252, 30], at: [252, 23], line: 'THE STREET IS GONE: GO OVER THE ROOFS' },
  ],
  crown: [   /* (claude/highcrown2) HIGHCROWN 2, in the cut level's columns (src/highcrown2.js HC2): every gate, bell, bucket, hoist, swing and ladder the route needs */
    { id: 'cr-gate-winch', zone: [6, 55, 24, 68], at: [20, 63], glint: 'stall', line: 'THE BAILEY GATE HANGS FROM ITS WINCH' },
    { id: 'cr-ward', zone: [56, 55, 92, 68], steps: [
      { at: [66, 63], done: ['bell', 66, 63, 'rung'], line: 'THE BARRACKS DOOR OPENS TO THE WARD BELL' },
      { at: [88, 63], done: ['key', 88, 63, 'got'], line: 'THE WARD KEY HANGS IN THE BARRACKS' },
      { at: [91, 63], done: ['lockgate', 91, 63, 'open'], line: 'THE WARD GATE WANTS THE BRASS KEY YOU CARRY' } ] },
    { id: 'cr-crag-winch', zone: [146, 40, 152, 48], at: [149, 47], glint: 'stall', line: 'THE TOWER GATE HANGS FROM ITS WINCH' },
    { id: 'cr-pit-bucket', zone: [165, 36, 199, 68], at: [181, 41], glint: 'stall', line: 'THE BUCKET ON ITS CHAIN CROSSES THE PIT' },
    { id: 'cr-pit-hoist', zone: [201, 36, 227, 68], at: [219, 62], glint: 'stall', line: 'THE PIT HOIST CARRIES YOU UP OUT OF THE PIT' },
    { id: 'cr-bake-swing', zone: [286, 44, 306, 62], at: [298, 46], glint: 'stall', line: 'THE HOIST CHAIN SWINGS YOU OVER THE FIRE' },
    { id: 'cr-keep-winch', zone: [321, 55, 344, 68], at: [339, 63], glint: 'stall', line: 'THE KEEP GATE HANGS FROM ITS WINCH' },
    { id: 'cr-hall-ladder', zone: [409, 47, 429, 63], at: [429, 50], glint: 'stall', line: 'A LADDER CLIMBS THE EAST WALL TO THE GALLERY' },
    { id: 'cr-hall-landings', zone: [380, 40, 429, 46], at: [385, 44], glint: 'stall', line: 'THE HUNG LANDINGS CROSS THE HALL TO THE WEST BALCONY' },
    { id: 'cr-hall-stair', zone: [347, 32, 366, 38], at: [348, 33], glint: 'stall', line: 'THE STAIR HEAD CLIMBS THE WEST WALL' },
    { id: 'cr-hall-shaft', zone: [400, 26, 429, 31], at: [428, 25], glint: 'stall', line: 'A LADDER IN THE EAST CORNER CLIMBS TO THE CHAPEL' },
    { id: 'cr-chapel', zone: [341, 10, 437, 19], steps: [
      { at: [397, 19], done: ['key', 397, 19, 'got'], line: 'THE BONE KEY LIES IN THE EAST HALF' },
      { at: [383, 19], done: ['lockgate', 383, 19, 'open'], line: 'THE BONE GATE WANTS THE KEY YOU CARRY' },
      { at: [351, 19], done: ['key', 351, 19, 'got'], line: 'THE BRASS KEY IS ON THE ALTAR, BEYOND THE BONE GATE' },
      { at: [429, 19], done: ['lockgate', 429, 19, 'open'], line: 'THE BRASS GATE WANTS THE KEY YOU CARRY' } ] },
    { id: 'cr-leads-ladder', zone: [522, 14, 540, 26], at: [529, 20], glint: 'stall', line: 'THE CHIMNEY STACK HAS A LADDER UP ITS FACE' },
  ],
  oreroad: [
    { id: 'or-wall', zone: [446, 3, 467, 16], at: [468, 9], line: 'THE CRACKED WALL BARS THE LANDING' },
    { id: 'or-skip-1', zone: [56, 30, 76, 42], at: [67, 36], glint: 'stall', line: 'THE ORE BUCKETS ARE THE ONLY FLOOR: STEP ON ONE' },
    { id: 'or-skip-2', zone: [190, 15, 210, 28], at: [203, 21], glint: 'stall', line: 'THE CHUTE BUCKETS LEAVE FAST FROM THE TOP DECK' },
    { id: 'or-skip-3', zone: [268, 28, 288, 40], at: [280, 34], glint: 'stall', line: 'THE BUCKETS CARRY YOU OVER THE BROKEN SPAN' },
    { id: 'or-skip-4', zone: [340, 14, 360, 26], at: [352, 20], glint: 'stall', line: 'THE RUSTED BUCKETS GIVE WAY: STEP ON THE NEXT ONE' },
    { id: 'or-skip-5', zone: [408, 6, 428, 18], at: [420, 12], glint: 'stall', line: 'THE SHAFT BUCKETS ARE THE WAY UP THE ORE SHAFT' },
    { id: 'or-skip-6', zone: [472, 11, 490, 23], at: [483, 17], glint: 'stall', line: 'A BUCKET WITH SOMEONE IN IT STOPS THE DRUM' },
  ],
  lamplit: [
    { id: 'lp-net1', zone: [44, 6, 76, 23], at: [72, 21], done: ['tarnet', 74, 21, 'burnt'], line: 'THE TAR NET BURNS: THROW FIRE ON THE OIL AT ITS FOOT' },   /* (claude/lamplit3) the first required throw */
    { id: 'lp-house', zone: [80, 8, 104, 23], at: [94, 23], line: 'THE HOUSE SHUTS THE ROOF: DOWN THE SHAFT INTO THE STREET' },   /* (claude/lamplit3) */
    { id: 'lp-stair', zone: [236, 8, 262, 22], at: [260, 21], line: 'THE ROOFS END HERE: THE WAY ON IS DOWN THE STAIR' },
    { id: 'lp-sealgate', zone: [328, 10, 347, 23], at: [342, 21], done: ['lantern', 349, 21, 'lit'], line: 'FIRE IN THE GUTTER RUNS UNDER THE GATE TO ITS LAMP' },   /* (claude/lamplit3) or the key, by the vaults */
    { id: 'lp-window', zone: [396, 11, 426, 22], at: [424, 15], line: 'THE WORKS DOOR IS BRICKED: UP THE GANTRIES TO THE WINDOW' },   /* (claude/lamplit3) */
    { id: 'lp-wall', zone: [462, 8, 482, 30], at: [476, 26], line: 'THE WALL SHUTS THE ROAD: DIVE UNDER IT, LAMP TO LAMP' },   /* (claude/lamplit3) */
    { id: 'lp-net3', zone: [530, 6, 553, 23], at: [550, 21], done: ['tarnet', 552, 21, 'burnt'], line: 'THE TAR NET: FIRE IN ITS GUTTER, OR BURST THE WICKLING' },   /* (claude/lamplit3) */
    { id: 'lp-tollgate', zone: [548, 14, 576, 23], at: [570, 21], done: ['lantern', 570, 21, 'lit'], line: 'THE TOLL GATE LIFTS FOR A LIT LAMP' },   /* (claude/lamplit2) the one required relight */
    { id: 'lp-key', zone: [262, 18, 345, 45], steps: [
      { at: [292, 37], done: ['key', 292, 37, 'got'], line: 'THE LOCKGATE WANTS A KEY: THE CLERK HAS IT' },
      { at: [326, 37], done: ['lockgate', 326, 37, 'open'], line: 'THE BONE GATE WANTS THE KEY YOU CARRY' } ] },
  ],
  /* THE SCREE PATH (claude/scree2): the ropeway's lift out of the gorge bank, and the crag wall's ochre climb rock up to the plateau - both route needs */
  scree: [
    { id: 'sc-ropeway-lift', zone: [440, 14, 455, 26], mover: { ropeway: true }, glint: 'stall', line: 'THE ROPEWAY LIFT: THE GORGE IS CROSSED UP ABOVE' },
    { id: 'sc-crag-climb', zone: [508, 12, 522, 21], at: [523, 13], glint: 'stall', line: 'THE OCHRE ROCK ON THE CRAG WALL CLIMBS TO THE PLATEAU' },
  ],
  hanging: [
    { id: 'hg-hoist', zone: [0, 80, 16, 100], mover: { hoist: 'rope', well: 2 }, line: 'THE HOIST: DROP A COIL IN THE WELL, THEN STAND ON IT' },
    { id: 'hg-wheels', zone: [90, 58, 112, 84], ats: [[104, 75], [104, 68]], glint: 'stall', line: 'THE WATER WHEEL PADDLES CARRY YOU UP' },
    { id: 'hg-hoist-mill', zone: [64, 56, 92, 68], mover: {hoist:'mill'}, glint: 'stall', line: 'THE MILL HOIST NEEDS A SACK IN ITS WELL' },
    { id: 'hg-hoist-nest', zone: [52, 40, 76, 53], mover: {hoist:'nest'}, glint: 'stall', line: 'THE NEST HOIST NEEDS TWO SACKS IN ITS WELL' },
    /* (claude/hanging3) CUT IT AND RIDE IT: the ropes the route needs - the tied-up bridges (the knot glints until it is cut) and the exam's deck-then-bridge */
    { id: 'hg-bridge-rope', zone: [34, 84, 52, 93], at: [36, 93], done: ['hvrope', 36, 93, 'cut'], line: 'THE RED AND GOLD KNOT HOLDS THE BRIDGE UP' },
    { id: 'hg-bridge-wind', zone: [41, 56, 60, 65], at: [43, 65], done: ['hvrope', 43, 65, 'cut'], glint: 'stall', line: 'THE KNOT BY THE GAP HOLDS A BRIDGE UP' },
    { id: 'hg-stair-bridge', zone: [56, 24, 64, 37], ats: [[60, 37], [57, 31]], done: ['hvrope', 57, 31, 'cut'], line: 'THE COUNTERWEIGHT RIDES UP TO THE BRIDGE KNOT' },
  ],
  spire: [
    { id: 'sp-baskets', zone: [14, 126, 34, 140], mover: { cw: 'cw0' }, line: 'THE BOOK-HOIST BASKETS CARRY YOU UP' },
    /* (claude/monastery2, review M6) EVERY MACHINE THE ROUTE NEEDS: the incense columns, the bells, the wheels (tools/stuck.mjs asserts one spot each) */
    { id: 'sp-terrace-1', zone: [60, 190, 80, 195], at: [74, 195], glint: 'stall', line: 'THE BRAZIER BY THE WALL: ITS SMOKE GOES UP THE TERRACE' },
    { id: 'sp-terrace-2', zone: [72, 182, 80, 185], at: [79, 185], glint: 'stall', line: 'THE NEXT BRAZIER, AT THE END OF THE LEDGE' },
    { id: 'sp-terrace-3', zone: [73, 174, 77, 177], at: [75, 177], line: 'A COLD CENSER: IT ANSWERS A BLOW' },
    { id: 'sp-flue-1', zone: [85, 112, 94, 117], at: [90, 117], glint: 'stall', line: 'THE HEARTH IN THE FLUE STILL BREATHES' },
    { id: 'sp-flue-2', zone: [85, 105, 88, 109], at: [86, 109], line: 'A COLD CENSER ON THE LEDGE: IT ANSWERS A BLOW' },
    { id: 'sp-bellows', zone: [12, 74, 20, 79], at: [14, 79], glint: 'stall', line: 'THE BELLOWS BRAZIER THROWS YOU HIGH' },
    { id: 'sp-bellows-2', zone: [16, 64, 26, 68], at: [19, 68], line: 'A COLD EMBER BRAZIER: IT ANSWERS A BLOW' },
    { id: 'sp-bellows-3', zone: [22, 58, 27, 61], at: [25, 61], glint: 'stall', line: 'THE LAST BELLOWS BRAZIER: UP TO THE TRAPDOOR' },
    { id: 'sp-bell-1', zone: [9, 112, 15, 117], at: [11, 117], done: ['tbell', 11, 117, 'down'], line: 'THE FIRST BELL: WHAT HANGS FROM ITS TOWER' },
    { id: 'sp-bell-2', zone: [70, 112, 77, 117], at: [73, 117], done: ['tbell', 73, 117, 'down'], line: 'THE BELL IN THE THIRD TOWER: THE WAY TO THE FLUE' },
    { id: 'sp-wheel-1', zone: [40, 164, 56, 171], at: [48, 171], glint: 'stall', line: 'THE PRAYER WHEEL TURNS ITS STAIR' },
    { id: 'sp-wheel-2', zone: [14, 92, 30, 99], at: [21, 99], glint: 'stall', line: 'THE CLOISTER WHEEL TURNS ITS STAIR' },
    { id: 'sp-wheel-3', zone: [35, 33, 50, 37], at: [43, 37], glint: 'stall', line: 'THE LAST WHEEL: ITS STAIR IS THE WAY UP' },
  ],
  stockade: [
    { id: 'sk-crank', zone: [118, 10, 141, 26], at: [138, 19], line: 'THE PALISADE HOLDS: FIND ITS CRANK' },
    { id: 'sk-lift-2', zone: [553, 4, 572, 24], at: [567, 12], glint: 'stall', line: 'THE LIFT AT THE HALL WALL TAKES YOU DOWN TO THE HALL' },   /* (claude/stockade2: the Watchtowers grew in at 443 - it stands at 567 now) */
    /* (claude/stockade2) THE WATCHTOWERS: the horn the gate wants, the barred gate itself, the rope up the first tower and the ropes out of the pit (the horn's state rides on the piles: src/stockade-hands.js props) */
    { id: 'sk-horn-gate', zone: [443, 0, 486, 20], steps: [
      { done: ['logpile', 465, 11, 'held'], at: [455, 11], line: 'THE DOZING BLOWER ON THE WALK CARRIES A HORN' },
      { when: ['logpile', 465, 11, 'held'], done: ['logpile', 484, 7, 'gateOpen'], at: [486, 16], glint: 'stall', line: 'THE BARRED GATE OPENS ONLY TO THEIR OWN HORN' } ] },
    { id: 'sk-tower-1', zone: [487, 4, 499, 20], at: [500, 17], glint: 'stall', line: 'THE ROPE UP THE FIRST TOWER IS THE WAY ON' },
    { id: 'sk-pit', zone: [498, 22, 552, 25], ats: [[500, 22], [518, 22], [535, 22]], glint: 'stall', line: 'A ROPE UP EACH TOWER LEADS OUT OF THE PIT' },
    { id: 'sk-lift-1', zone: [360, 8, 388, 26], at: [378, 19], glint: 'stall', line: 'THE LIFT AT THE FOOT OF THE TOWER CARRIES YOU UP' },
    { id: 'sk-crank-3', zone: [290, 10, 316, 26], at: [313, 19], glint: 'stall', line: 'THE LAST PALISADE GATE HAS A CRANK OF ITS OWN' },
    { id: 'sk-crank-2', zone: [186, 10, 211, 26], at: [207, 19], glint: 'stall', line: 'THE SECOND CRANK WORKS THE NEXT PALISADE GATE' },
  ],
  /* GALE MOOR's WIND ROCKS and GOBLIN SCAFFOLDS (claude/moor2): the two crevices, the two gust shafts, and the half-built frame's rope until it is down */
  moor: [
    { id: 'mr-crevice-1', zone: [535, 9, 540, 13], at: [540, 13], line: 'THE CREVICE AT THE FOOT OF THE TOR BLOWS UPWARD' },
    { id: 'mr-crevice-2', zone: [565, 4, 572, 7], at: [572, 7], line: 'A CREVICE AT THE FOOT OF THE HIGH TOR' },
    { id: 'mr-shaft-1', zone: [585, 18, 598, 20], at: [596, 20], line: 'A GUST SHAFT UNDER THE SCAFFOLD' },
    { id: 'mr-shaft-2', zone: [594, 14, 629, 16], at: [611, 16], line: 'A GUST SHAFT UNDER THE TOP DECK' },
    { id: 'mr-frame', zone: [608, 4, 639, 12], at: [629, 12], done: ['gustframe', 633, 12, 'fallen'], line: 'THE HALF-BUILT FRAME LEANS OVER THE GAP ON ONE ROPE' },
  ],
  /* THE SKY ROAD (claude/skyroad): every thermal the route rides, the cloak, every sun-stone the route needs until it is turned, the reel's cage, the sun-disc */
  /* THE ROOKERY (claude/rookery): every cracked rock the route needs until a dive breaks it (stand on the mark) */
  rookery: [
    { id: 'rk-first-floor', zone: [40, 34, 51, 39], at: [49, 39], done: ['crackfloor', 49, 39, 'on'], line: 'THE FLOOR IS CRACKED: STAND ON THE MARK, STEP OFF AS SHE DIVES' },
    { id: 'rk-roost-slab', zone: [86, 37, 97, 42], at: [95, 42], done: ['crackslab', 95, 42, 'on'], line: 'THE CLIFF IS TOO HIGH: BAIT HER ONTO THE MARK UNDER THE SLAB' },
    { id: 'rk-first-nest', zone: [106, 32, 117, 37], at: [115, 37], done: ['cracknest', 115, 37, 'on'], line: 'NO JUMP CROSSES: BAIT HER ONTO THE MARK UNDER THE NEST' },
    { id: 'rk-first-pillar', zone: [140, 32, 151, 37], at: [149, 37], done: ['crackpillar', 149, 37, 'on'], line: 'NO JUMP CROSSES: BAIT HER ONTO THE FOOT OF THE PILLAR' },
    { id: 'rk-egg-nest', zone: [175, 29, 186, 34], at: [184, 34], done: ['cracknest', 184, 34, 'on'], line: 'NO JUMP CROSSES: BAIT HER ONTO THE MARK UNDER THE NEST' },
    { id: 'rk-ledge-slab', zone: [217, 20, 228, 25], at: [226, 25], done: ['crackslab', 226, 25, 'on'], line: 'THE FACE IS TOO HIGH: BAIT HER ONTO THE MARK UNDER THE SLAB' },
    { id: 'rk-span-pillar', zone: [283, 10, 294, 15], at: [292, 15], done: ['crackpillar', 292, 15, 'on'], line: 'NO JUMP CROSSES: STAND ON THE PILLAR FOOT, LET THEM DIVE' },
    { id: 'rk-last-nest', zone: [313, 10, 324, 15], at: [322, 15], done: ['cracknest', 322, 15, 'on'], line: 'NO JUMP CROSSES: BAIT HER ONTO THE MARK UNDER THE NEST' },
    { id: 'rk-top-slab', zone: [339, 10, 350, 15], at: [348, 15], done: ['crackslab', 348, 15, 'on'], line: 'THE FACE IS TOO HIGH: BAIT HER ONTO THE MARK UNDER THE SLAB' },
  ],
  skyroad: [
    { id: 'sk-thermal-1', zone: [27, 41, 36, 52], at: [34, 51], line: 'THE HOT AIR OVER THE ROCK IS THE WAY UP' },
    { id: 'sk-thermal-2', zone: [53, 35, 69, 50], at: [67, 49], line: 'THE RISING AIR AT THE FOOT OF THE MESA' },
    { id: 'sk-cloak', zone: [70, 20, 104, 34], steps: [
      { at: [97, 33], done: ['cloak', 97, 33, 'on'], line: "THE RIDER'S CLOAK HANGS ON ITS MAST" },
      { zone: [99, 28, 104, 34], when: ['cloak', 97, 33, 'on'], at: [118, 37], line: "LEDGE ONE IS IN A GLIDE'S REACH OVER THE GAP" } ] },   /* (FIX PASS: glide one) */
    { id: 'sk-shelf-air', zone: [105, 41, 112, 45], at: [113, 44], glint: 'stall', line: 'THE RISING AIR BY THE SHELF GOES BACK UP' },   /* (claude/skyroad2: the thermal entries - after a stall) */
    { id: 'sk-stone-1', zone: [105, 30, 123, 46], steps: [
      { at: [120, 37], done: ['sunstone', 120, 37, 'on'], line: 'A SUN-STONE LIES FACE DOWN BY THE CHASM' },
      { zone: [116, 30, 123, 37], when: ['sunstone', 120, 37, 'on'], at: [131, 30], line: 'THE AIR OVER THE PINNACLE RISES NOW: GLIDE INTO IT' } ] },   /* (FIX PASS: into thermal four) */
    { id: 'sk-reel', zone: [134, 18, 150, 26], steps: [
      { at: [139, 25], done: ['sunstone', 139, 25, 'on'], line: "THE REEL'S STONE IS FACE DOWN: THE FLUE IS COLD" },
      { mover: { sky: 'reel' }, line: 'THE CAGE COMES DOWN TO THE DECK: STEP ON IT THERE' } ] },
    { id: 'sk-glide-roost', zone: [183, 8, 190, 13], at: [202, 19], line: "ROOST ONE IS IN A GLIDE'S REACH OFF THE DECK" },   /* (FIX PASS: deck to roost one) */
    { id: 'sk-r1', zone: [199, 14, 204, 19], at: [210, 40], glint: 'stall', line: 'THE RISING AIR OVER THE NEAR PINNACLE' },
    { id: 'sk-stone-3', zone: [216, 10, 219, 18], at: [218, 17], done: ['sunstone', 218, 17, 'on'], line: 'A SUN-STONE ON THE ROOST' },
    { id: 'sk-disc', zone: [265, 8, 298, 18], steps: [
      { at: [295, 17], glint: 'stall', done: ['sundisc', 295, 17, 'on'], line: 'THE SUN-DISC AT THE BRIDGEHEAD' },
      { zone: [288, 8, 298, 18], when: ['sundisc', 295, 17, 'on'], at: [303, 20], line: 'THE ROAD OF AIR IS LIT: THE EAST TOWER IS IN REACH' } ] },   /* (FIX PASS: the disc road) */
    { id: 'sk-stone-4', zone: [346, 12, 355, 20], steps: [
      { zone: [346, 12, 353, 20], at: [352, 19], done: ['sunstone', 352, 19, 'on'], line: 'A SUN-STONE ON THE CRACKED SPAN' },
      { when: ['sunstone', 352, 19, 'on'], at: [357, 40], glint: 'stall', line: 'THE AIR OVER THE NEXT PINNACLE RISES NOW' } ] },   /* (claude/skyroad2: into R5) */
    { id: 'sk-stone-6', zone: [360, 10, 367, 17], steps: [
      { at: [364, 16], done: ['sunstone', 364, 16, 'on'], line: 'A SUN-STONE ON THE SECOND SPAN' },
      { when: ['sunstone', 364, 16, 'on'], at: [371, 40], glint: 'stall', line: 'THE AIR OVER THE LAST PINNACLE RISES NOW' } ] },   /* (claude/skyroad2: into R6) */
    { id: 'sk-r3', zone: [228, 4, 233, 9], at: [242, 30], glint: 'stall', line: 'THE RISING AIR PAST THE SPIRE' },
    { id: 'sk-r4', zone: [248, 13, 251, 18], at: [258, 30], glint: 'stall', line: 'THE RISING AIR OFF THE LAST PINNACLE' },
    /* (claude/skyroad2, Daniel 10-08 stuck on the disc road) THE DEAD-AIR FOOTINGS (L.airOnly, tools/skyroad-stuck.mjs): a gated pinnacle, the low roost - while their air is dead the only
       way off is down into the cloud sea, whose updraft now throws you back to the road (src/sky-road-hands.js). After a stall the sea beside it glints */
    { id: 'sk-deadair-130', zone: [130, 51, 132, 52], at: [133, 55], glint: 'stall', done: ['vent', 131, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-225', zone: [225, 51, 227, 52], at: [228, 55], glint: 'stall', done: ['vent', 226, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-302', zone: [302, 51, 304, 52], at: [306, 55], glint: 'stall', done: ['vent', 303, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-309', zone: [309, 51, 311, 52], at: [313, 55], glint: 'stall', done: ['vent', 310, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-316', zone: [316, 51, 318, 52], at: [320, 55], glint: 'stall', done: ['vent', 317, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-323', zone: [323, 51, 325, 52], at: [327, 55], glint: 'stall', done: ['vent', 324, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-356', zone: [356, 51, 358, 52], at: [360, 55], glint: 'stall', done: ['vent', 357, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-370', zone: [370, 51, 372, 52], at: [374, 55], glint: 'stall', done: ['vent', 371, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-220', zone: [220, 28, 222, 29], at: [224, 55], glint: 'stall', done: ['vent', 226, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
    { id: 'sk-deadair-223', zone: [223, 42, 224, 43], at: [224, 55], glint: 'stall', done: ['vent', 226, 52, 'src0'], line: 'THE AIR HERE IS DEAD: THE CLOUD SEA THROWS YOU BACK UP' },
  ],
  /* THE HORNET'S NEST (claude/hornetsnest): every required comb (the glint on it until it is cut), the way down the trunk once she is dead (claude/hornetsnest2). (A chain's two combs hang a tile apart: each done-test
     is read a row past its own foot, away from the other's, so neither is taken for the other) */
  hornetsnest: [
    { id: 'hn-first', zone: [25, 60, 41, 66], at: [37, 62], done: ['comb', 37, 63, 'on'], line: 'THE COMB HANGING BY THE ROOT IS YOUR STEP UP: CUT IT DOWN' },
    { id: 'hn-bridge', zone: [104, 29, 117, 34], at: [121, 30], done: ['comb', 121, 31, 'on'], line: 'THE COMB OVER THE GAP IS THE BRIDGE: CUT IT DOWN' },
    { id: 'hn-chain', zone: [197, 15, 208, 20], steps: [{ at: [206, 16], done: ['comb', 206, 18, 'on'], line: 'TWO COMBS OVER THE LEDGE: CUT THE LOW ONE DOWN FOR A STEP' }, { at: [207, 14], done: ['comb', 207, 14, 'on'], line: 'FROM THE FALLEN COMB, CUT THE HIGH ONE DOWN ONTO IT' }] },
    { id: 'hn-last', zone: [214, 9, 222, 14], steps: [{ at: [220, 10], done: ['comb', 220, 12, 'on'], line: 'THE HIGH WALL: CUT THE LOW COMB DOWN FOR A STEP' }, { at: [221, 8], done: ['comb', 221, 8, 'on'], line: 'FROM THE FALLEN COMB, CUT THE HIGH ONE DOWN ONTO IT' }] },
    { id: 'hn-torn', zone: [326, 18, 332, 22], at: [334, 21], glint: 'stall', line: 'THE NEST TORE LOOSE: THE WAY ON IS DOWN THE TRUNK' },
  ],
  /* THE FEN ROAD (claude/fenroad): the barricade (its lashing is the only way on), and the peat pit's steps out */
  fenroad: [
    { id: 'fr-pit', zone: [41, 22, 46, 24], at: [48, 22], glint: 'stall', line: "THE CUTTERS' STEPS ARE AT THE PIT'S EAST WALL" },
    { id: 'fr-barricade', zone: [184, 15, 191, 17], at: [189, 17], done: ['lashing', 189, 17, 'on'], line: 'THE BARRICADE STANDS ON BOWED BOARDS: STRIKE ITS LASHING' },
    /* (claude/fenroad2) THE BROKEN ROAD: every peat hole - with no plank on your shoulder the crew's bundle glints, with one the hole's near edge */
    ...[[111, 107, 102], [173, 153, 151], [380, 371, 366], [392, 391, 388]].flatMap(([h, b, z0]) => [
      { id: 'fr-hole-' + h + '-take', zone: [z0, 14, h - 1, 17], at: [b, 17], when: ['broken', h, 17, '!held'], done: ['broken', h, 17, 'on'], line: "THE ROAD IS BROKEN: TAKE A PLANK FROM THE CREW'S BUNDLE (E)" },
      { id: 'fr-hole-' + h + '-lay', zone: [z0, 14, h - 1, 17], at: [h - 1, 17], when: ['broken', h, 17, 'held'], done: ['broken', h, 17, 'on'], line: 'AT THE BROKEN EDGE, FACE IT: E LAYS THE PLANK ACROSS' }]),
  ],
  /* THE ROOTWAY (claude/rootway): every bud the route needs, every cleat the route needs until its rope is cut, the lookout's rope (an arrow cuts it) */
  rootway: [
    { id: 'rw-bud-wall', zone: [20, 36, 30, 41], at: [29, 41], line: 'A BUD BY THE ROOT WALL: JUMP ONTO IT AND STAND STILL' },
    { id: 'rw-cellar-span', zone: [44, 30, 52, 37], at: [51, 37], done: ['hoist', 51, 37, 'on'], line: 'THE SPAN HANGS ON A HOIST: ITS CLEAT IS ON THE ROOT' },
    /* (claude/rootway2) THE HOLLOW TRUNK's climb: the bud against the first shelf, the spring cap, the bud on the plank, the leaning cap across the shaft */
    { id: 'rw-trunk-bud1', zone: [130, 28, 140, 34], at: [139, 34], line: 'A BUD BY THE ROOT SHELF: JUMP ONTO IT AND STAND STILL' },
    { id: 'rw-trunk-bud1b', zone: [141, 26, 144, 30], at: [143, 30], line: 'A BUD BY THE ROOT SHELF: JUMP ONTO IT AND STAND STILL' },
    { id: 'rw-trunk-bud2', zone: [134, 22, 141, 26], at: [134, 26], line: 'A BUD BY THE ROOT SHELF: JUMP ONTO IT AND STAND STILL' },
    { id: 'rw-trunk-lean', zone: [111, 17, 133, 22], at: [132, 22], line: 'A BUD ON THE LIP LEANS OUT OVER THE GAP' },
    { id: 'rw-larder', zone: [191, 24, 206, 31], steps: [
      { at: [201, 31], done: ['hoist', 201, 31, 'on'], line: 'THE LARDER CAGES HANG ON THEIR CLEATS' },
      { at: [203, 31], done: ['hoist', 203, 31, 'on'], line: 'THE SECOND CAGE STILL HANGS: ITS CLEAT' },
      { at: [205, 31], done: ['hoist', 205, 31, 'on'], line: 'THE THIRD CAGE STILL HANGS: ITS CLEAT' } ] },
    { id: 'rw-high-cleat', zone: [225, 20, 238, 26], steps: [
      { at: [238, 19], done: ['hoist', 238, 19, 'on'], line: 'THE CLEAT IS HIGH: GROW THE BUD UNDER IT, THEN JUMP AND STRIKE' } ] },
    { id: 'rw-bud-hunter', zone: [256, 17, 268, 22], at: [267, 22], line: 'A BUD BY THE ROOT WALL: JUMP ONTO IT AND STAND STILL' },
    { id: 'rw-gantry-rope', zone: [276, 11, 281, 13], at: [279, 13], dy: 6, glint: 'stall', line: "THE HUNTERS' TROPHY LINE IS THE WAY OVER THE WELL" },
    { id: 'rw-gantry-cage', zone: [269, 12, 275, 18], at: [271, 18], done: ['hoist', 271, 18, 'on'], line: 'CUT THE CAGE DOWN: IT IS A STEP UP TO THE GANTRY' },   /* (claude/ziproot) THE HUNTERS' GANTRY */
    { id: 'rw-bud-ledge', zone: [291, 17, 296, 22], at: [295, 22], line: 'A BUD BY THE ROOT WALL: JUMP ONTO IT AND STAND STILL' },
    { id: 'rw-lookout', zone: [299, 12, 303, 18], at: [312, 15], glint: 'stall', done: ['hoist', 312, 15, 'on'], line: 'STRIKE HIS ARROW BACK, OR LOB A POD UP AT THE ROPE' },
    { id: 'rw-lean-2', zone: [330, 12, 340, 18], at: [339, 18], line: 'A BUD ON THE LIP LEANS OUT OVER THE GAP' },
  ],
  canal: [
    { id: 'cn-board', zone: [0, 22, 50, 56], mover: { canal: true }, off: { canal: true }, line: 'THE BARGE WAITS BELOW: STEP ONTO HER DECK' },
  ],
};

/* THE SPOTS A LEVEL'S OWN HANDS DRIVE (claude/gorgemodule): the same shape as STUCK, but the level's hands run the glint and the stall clock themselves (src/red-gorge-hands.js),
   so the global guide (makeGuide) leaves them alone. The hero's place is exact (rows: [lo, hi] = lo < y/TS <= hi, colGt / colLt, noClimb: not on a rope), not the tile box;
   `is: [name, value]` is a state the hands report (gate.falls: open | shut | full, jam: closed | open); `key` names the glint to the pilots; `dy`: the glint's lift (px).
   The order is the order of the old nextThing list: the first spot with a step that fits wins. Append a level's spots; do not reorder. */
const WHOLE = [0, 0, 999, 999];
export const STUCK_HANDS = {
  /* THE LIT CHURCH (claude/litchurch): every lamp the route needs glints - first the fire that gives the flame, then the lamp (src/lit-church-hands.js handsState:
     need.<lamp> fire / lamp / done, lamp.<id> lit / dark, door.<id> open / shut, stubs due / short); the bellows, the key desk, the seal lamp and the well glint as the
     route reaches them; the climbs (the piers, the tower's drop, the well) after a stall */
  church: [
    { id: 'lc-porch', zone: [0, 21, 43, 38], steps: [
      { key: 'brazier', is: ['need.porch', 'fire'], at: [9, 36], line: 'THE SEXTON\'S BRAZIER BURNS: A FLAME TO CARRY' },
      { key: 'porch', is: ['need.porch', 'lamp'], at: [40, 36], line: 'THE PORCH LAMP IS DARK' } ] },
    { id: 'lc-piers', zone: [140, 29, 159, 36], steps: [ { key: 'piers', is: ['lamp.chapel1', 'dark'], at: [157, 30], glint: 'stall', line: 'THE PIERS CLIMB TO THE NORTH TRANSEPT' } ] },
    { id: 'lc-transept', zone: [158, 20, 178, 28], steps: [
      { key: 'votive1', is: ['need.chapel1', 'fire'], at: [162, 28], line: 'A VOTIVE STAND BURNS BY THE CHAPEL DOOR' },
      { key: 'lamp1', is: ['need.chapel1', 'lamp'], at: [176, 28], line: 'LAMP ONE, ON THE TRANSEPT ALTAR' },
      { key: 'bellows', is: ['need.chapel1', 'done'], at: [166, 28], line: 'THE ORGAN\'S BELLOWS: ITS PIPE GOES UP' } ] },
    { id: 'lc-desk', zone: [106, 5, 160, 18], steps: [ { key: 'desk', is: ['lamp.chapel2', 'dark'], at: [109, 18], line: 'THE ORGAN\'S KEY DESK, BY THE BROKEN LOFT' } ] },
    { id: 'lc-console', zone: [56, 5, 96, 18], steps: [
      { key: 'votive2', is: ['need.chapel2', 'fire'], at: [66, 18], line: 'A VOTIVE STAND BURNS BY THE CONSOLE' },
      { key: 'lamp2', is: ['need.chapel2', 'lamp'], at: [60, 18], line: 'LAMP TWO, ON THE ORGAN\'S CONSOLE' },
      { key: 'towerDoor', is: ['need.chapel2', 'done'], at: [55, 18], glint: 'stall', line: 'THE TOWER DOOR AT THE GALLERY\'S END' } ] },
    { id: 'lc-seal', zone: [46, 6, 55, 31], steps: [
      { key: 'seal', is: ['lamp.seal', 'lit'], at: [53, 22], line: 'THE SEAL LAMP HOLDS THE CRYPT SHUT' },
      { key: 'towerDrop', is: ['lamp.seal', 'dark'], at: [47, 36], glint: 'stall', line: 'THE HATCH IS IN THE NARTHEX FLOOR, BELOW' } ] },
    { id: 'lc-hatch', zone: [45, 32, 55, 36], steps: [ { key: 'hatch', is: ['door.hatch', 'open'], at: [49, 37], line: 'THE CRYPT HATCH IS OPEN' } ] },
    { id: 'lc-altar', zone: [140, 39, 178, 53], steps: [
      { key: 'vigil', is: ['need.chapel3', 'fire'], at: [172, 53], line: 'THE VIGIL CANDLE BURNS BY THE CRYPT ALTAR' },
      { key: 'lamp3', is: ['need.chapel3', 'lamp'], at: [175, 53], line: 'LAMP THREE, ON THE CRYPT ALTAR' },
      { key: 'well', is: ['door.rood', 'shut'], at: [163, 38], glint: 'stall', line: 'THE GRATE ABOVE IS OPEN: CLIMB THE WELL' } ] },
    { id: 'lc-rood', zone: [152, 30, 178, 36], steps: [
      { key: 'rood3', is: ['need.rood3', 'lamp'], at: [178, 34], line: 'THE ROOD SCREEN\'S THIRD SCONCE IS DARK' },
      { key: 'rood3fire', is: ['need.rood3', 'fire'], at: [176, 28], line: 'LAMP ONE BURNS ON: A FLAME FOR THE THIRD SCONCE' } ] },
    { id: 'lc-chantry', zone: [180, 22, 213, 37], steps: [   /* (claude/church2) THE CHANTRY's relay: the votive stand, the braziers, the door's lamp */
      { key: 'votive3', is: ['need.chantryDoor', 'fire'], at: [181, 36], line: 'A VOTIVE STAND BURNS BY THE CHANTRY DOOR' },
      { key: 'chantryDoor', is: ['need.chantryDoor', 'lamp'], at: [210, 36], line: 'THE CHANTRY DOOR\'S LAMP IS DARK: CARRY A FLAME TO IT' } ] },
    { id: 'lc-reliquary', zone: [214, 31, 234, 40], steps: [ { key: 'reliquary', is: ['stubs', 'due'], at: [222, 40], line: 'THE RELIQUARY: FIVE STUBS OPEN IT' } ] },
  ],
  /* WAYMEET'S VOTIVE LAMPS (claude/towpathchurch; src/votive-hands.js handsState: need.<lamp> fire | lamp | done): each of the three lofts glints its brazier while your hand is empty and its dark
     lamp while it holds a flame (the lamps are optional - the glint only shows near their loft); after 10 s of standing there the nudge says it (A6) */
  waymeet: [
    { id: 'wm-v1', zone: [8, 28, 22, 36], steps: [
      { key: 'fire-v1', is: ['need.v1', 'fire'], at: [11, 35], line: 'A WAYSIDE BRAZIER BURNS: E TAKES A FLAME' },
      { key: 'lamp-v1', is: ['need.v1', 'lamp'], at: [16, 30], line: 'THE WAYSIDE LAMP IS DARK: CLIMB TO IT, E LIGHTS IT' } ] },
    { id: 'wm-v2', zone: [83, 28, 95, 36], steps: [
      { key: 'fire-v2', is: ['need.v2', 'fire'], at: [86, 35], line: 'A WAYSIDE BRAZIER BURNS: E TAKES A FLAME' },
      { key: 'lamp-v2', is: ['need.v2', 'lamp'], at: [90, 30], line: 'THE MARKET LAMP IS DARK: CLIMB TO IT, E LIGHTS IT' } ] },
    { id: 'wm-v3', zone: [288, 28, 301, 36], steps: [
      { key: 'fire-v3', is: ['need.v3', 'fire'], at: [291, 35], line: 'A WAYSIDE BRAZIER BURNS: E TAKES A FLAME' },
      { key: 'lamp-v3', is: ['need.v3', 'lamp'], at: [296, 30], line: 'THE GARDEN LAMP IS DARK: CLIMB TO IT, E LIGHTS IT' } ] },
  ],
  /* THE TOWPATH (claude/towpath; THE TOWPATH 2, claude/towpath2): every lock, the race, the hoist, the aqueduct's sluice, the crane and every swing bridge the route
     needs glints until its water (or its ride) stands where the way needs it (src/towpath-hands.js handsState: lock.<id> lo | hi | dry | up | down, bridge.<id> across |
     open, hoist.<id> bot | top | moving, trough.<id> west | east | moving, crane.<id> quay | roof | moving); rows are the sheet's (the design rows + 9) */
  towpath: [
    { id: 'tp-lockA', zone: [40, 39, 56, 54], steps: [ { key: 'lockA', is: ['lock.A', 'lo'], at: [54, 48], line: 'THE LOCK PADDLE, BY THE PUNT' } ] },
    { id: 'tp-race', zone: [92, 34, 110, 54], steps: [ { key: 'race', is: ['lock.race', 'hi'], at: [98, 42], line: 'THE RACE PADDLE ON THE BANK' },
      { key: 'wheel', is: ['wheel.mill', 'still'], rows: [36.2, 59], colLt: 109, at: [107, 35], glint: 'stall', line: 'THE WHEEL STANDS STILL: CLIMB ITS PADDLES' } ] },   /* (claude/towpath fix, review S4: the stilled wheel, the culvert) */
    { id: 'tp-hoist', zone: [112, 31, 119, 36], steps: [
      { key: 'hoist', is: ['hoist.sack', 'bot'], at: [117, 35], line: 'THE SACK HOIST: STAND ON IT AND STRIKE ITS WINCH' },
      { key: 'hoistDown', is: ['hoist.sack', 'top'], at: [117, 35], line: 'THE HOIST IS UP: ITS WINCH CALLS IT DOWN' } ] },
    { id: 'tp-tail', zone: [125, 24, 139, 30], steps: [ { key: 'tail', is: ['bridge.tail', 'open'], at: [130, 27], line: 'THE CAPSTAN BY THE CUT' } ] },
    { id: 'tp-f1', zone: [158, 17, 174, 35], steps: [
      { key: 'f1bank', is: ['lock.F1', 'hi'], colLt: 166, at: [165, 28], line: 'THE LOCK IS FULL: ITS PADDLE IS ON THE BANK' },
      { key: 'f1punt', is: ['lock.F1', 'lo'], at: [172, 29], line: 'THE PADDLE BY THE PUNT' } ] },
    { id: 'tp-f2', zone: [173, 12, 182, 31], steps: [
      { key: 'f2', is: ['lock.F2', 'dry'], at: [178, 29], line: 'THE PADDLE IN THE DRY CHAMBER' },
      { key: 'f2hi', is: ['lock.F2', 'hi'], colLt: 175, at: [173, 23], line: 'THE PUNT RODE UP: ITS PADDLE IS ON THE LANDING' } ] },
    { id: 'tp-f3', zone: [181, 9, 189, 25], steps: [ { key: 'f3', is: ['lock.F3', 'lo'], at: [188, 19], line: 'THE PADDLE BY THE PUNT' } ] },
    { id: 'tp-aq', zone: [236, 11, 252, 17], steps: [ { key: 'aq', is: ['trough.aq', 'west'], at: [240, 14], line: 'THE AQUEDUCT IS DRY: OPEN ITS SLUICE BY THE BARGE' } ] },
    { id: 'tp-basin', zone: [324, 20, 346, 29], steps: [ { key: 'basin', is: ['bridge.basin', 'open'], at: [328, 28], line: 'A CAPSTAN ON EACH BANK' } ] },
    { id: 'tp-crane', zone: [361, 20, 372, 29], steps: [ { key: 'crane', is: ['crane.jib', 'quay'], at: [364, 28], line: 'THE CRANE: STAND ON ITS HOOK AND STRIKE ITS CAPSTAN' } ] },
    { id: 'tp-x', zone: [388, 19, 406, 36], steps: [ { key: 'xlamp', is: ['lamp.x', 'out'], colLt: 394, at: [392, 25], line: 'THE LAMP IS OUT: STRIKE IT, OR LIGHT THE LANTERN' }, { key: 'x', is: ['lock.X', 'hi'], colLt: 394, at: [392, 25], line: 'THE LAST LOCK IS FULL: ITS PADDLE IS ON THE BANK' } ] },
    { id: 'tp-culvert', zone: [394, 27, 405, 36], steps: [ { key: 'culvert', is: ['lock.X', 'dry'], rows: [28, 36], at: [408, 34], glint: 'stall', line: 'THE CULVERT UNDER THE EAST WALL' } ] },
    { id: 'tp-y', zone: [406, 19, 419, 36], steps: [ { key: 'y', is: ['lock.Y', 'dry'], at: [417, 35], line: 'THE PADDLE BY THE PUNT' } ] },
    { id: 'tp-cut', zone: [418, 17, 428, 25], steps: [ { key: 'cut', is: ['bridge.cut', 'open'], at: [422, 22], line: 'THE CAPSTAN BY THE CUT' } ] },
  ],
  /* THE BURIED CITY (claude/buriedcity): every sand room the route needs glints until its state is the one the route wants (src/buried-city-hands.js handsState:
     room.<id> full / empty / filling / draining, wheel.great open / shut, vault.<id>); the climb out of the lower bulb's pit glints after a stall */
  buriedcity: [   /* (claude/buriedcity2: the rework - grid rows; THE SINKING STREET, THE SAND-FALL and the trap hall's two levers are new) */
    { id: 'bc-first', zone: [50, 29, 62, 37], steps: [ { key: 'firstLever', is: ['room.first', 'full'], at: [58, 36], line: 'THE ROOM IS FULL TO ITS DOOR: ITS SAND-GATE LEVER' } ] },
    { id: 'bc-granary', zone: [138, 20, 156, 37], steps: [ { key: 'granaryLever', is: ['room.granary', 'empty'], rows: [28, 37], at: [144, 36], line: 'THE WAY ON IS HIGH: THE GRANARY\'S SAND-GATE' }, { key: 'granaryDoor', is: ['room.granary', 'full'], at: [156, 28], line: 'THE SAND IS AT THE DOOR: THE WAY ON IS EAST' } ] },
    { id: 'bc-street', zone: [194, 20, 233, 39], steps: [ { key: 'streetChain', is: ['room.street', 'full'], at: [233, 28], line: 'THE STREET STANDS ON THE SAND: ITS GATE CHAIN IS BY THE ARCH' }, { key: 'streetArch', is: ['room.street', 'empty'], at: [235, 38], glint: 'stall', line: 'THE STREET IS DOWN: THE ARCH IS THE WAY ON' } ] },
    { id: 'bc-cellar', zone: [236, 31, 246, 39], steps: [ { key: 'cellarLever', is: ['room.cellar', 'empty'], at: [242, 38], line: 'STAKES ACROSS THE CELLAR: ITS SAND-GATE' } ] },
    { id: 'bc-bulb', zone: [270, 25, 282, 33], steps: [ { key: 'bulbLever', is: ['room.upperbulb', 'full'], at: [278, 32], line: 'THE UPPER HALL IS FULL: ITS SAND-GATE' } ] },
    { id: 'bc-pit', zone: [294, 33, 310, 43], steps: [ { key: 'bulbUp', at: [308, 33], glint: 'stall', line: 'THE PIPES LEAD UP OUT OF THE PIT' } ] },
    { id: 'bc-sluice', zone: [413, 26, 452, 43], steps: [
      { key: 'sluiceSwing', is: ['sluice.sluice', 'swing'], at: [417, 42], line: 'THE ARCH IS HIGH: SWING THE SAND-FALL ONTO THE WALL' },
      { key: 'sluicePile', is: ['sluice.sluice', 'pile'], at: [438, 42], glint: 'stall', line: 'LET THE SAND PILE UP UNDER THE ARCH, THEN SWING IT BACK' },
      { key: 'sluiceBack', is: ['sluice.sluice', 'back'], at: [438, 42], line: 'THE HEAP IS UP: SWING THE FALL BACK OFF IT' },
      { key: 'sluiceClimb', is: ['sluice.sluice', 'climb'], at: [451, 34], glint: 'stall', line: 'CLIMB THE HEAP TO THE ARCH' } ] },
    { id: 'bc-wheel', zone: [468, 21, 483, 37], steps: [ { key: 'greatWheel', is: ['wheel.great', 'shut'], at: [477, 36], line: 'THE GREAT SAND-GATE: ITS WHEEL' } ] },
    { id: 'bc-quarter', zone: [483, 22, 538, 44], steps: [ { key: 'quarterClimb', at: [533, 33], glint: 'stall', line: 'THE OLD STREET\'S DOOR IS PAST THE TOWER: OVER THE HOUSES' } ] },
    { id: 'bc-yard', zone: [562, 37, 569, 45], steps: [ { key: 'yardLever', is: ['room.yard', 'empty'], at: [568, 44], line: 'AN OPEN FLOOR-GATE IS A DROP: ITS LEVER SHUTS IT' } ] },
    { id: 'bc-shaft', zone: [585, 21, 598, 45], steps: [ { key: 'shaftLever', is: ['room.shaft', 'empty'], rows: [39, 45], at: [588, 44], line: 'THE WAY ON IS HIGH: THE SHAFT\'S SAND-GATE' } ] },
    { id: 'bc-trap', zone: [605, 27, 618, 33], steps: [
      { key: 'trapLever', is: ['trap.trap', 'gate'], at: [616, 32], line: 'THE TRAP HALL\'S FLOOR-GATE IS OPEN: ITS LEVER' },
      { key: 'trapFeed', is: ['trap.trap', 'feed'], at: [610, 32], line: 'THE GATE IS SHUT: SWING THE SAND-FALL INTO THE HALL' } ] },
    { id: 'bc-vault', zone: [670, 31, 682, 36], steps: [ { key: 'vault', is: ['vault.clockwork', 'due'], at: [675, 35], line: 'THE CLOCKWORK VAULT: FIVE GEARS OPEN IT' } ] },
    /* (claude/buriedcity3) THE FLIP: every glass the route needs glints until it is running (handsState glass.<id>: idle / running) */
    { id: 'bc-stairglass', zone: [98, 28, 107, 37], steps: [ { key: 'stairGlass', is: ['glass.stair', 'idle'], at: [102, 36], line: 'A FALLEN HOUSE: STRIKE THE HOURGLASS BY IT' } ] },
    { id: 'bc-bankglass', zone: [306, 26, 313, 33], steps: [ { key: 'bankGlass', is: ['glass.bank', 'idle'], at: [311, 32], line: 'A BANK OF SAND: STRIKE THE HOURGLASS' } ] },
    { id: 'bc-fallglass', zone: [718, 8, 733, 18], steps: [ { key: 'fallGlass', is: ['glass.fall', 'idle'], at: [728, 14], line: 'STRIKE THE GLASS ON THE DOME, THEN RIDE THE FALL UP' } ] },
    { id: 'bc-chain1', zone: [743, 1, 753, 8], steps: [ { key: 'chain1', is: ['glass.chain1', 'idle'], at: [750, 6], line: 'THE SAND SEA: STRIKE THE HOURGLASS AND THE ROOFS RISE' } ] },
    { id: 'bc-chain2', zone: [767, 6, 772, 13], steps: [ { key: 'chain2', is: ['glass.chain2', 'idle'], at: [769, 11], line: 'THE SECOND HOURGLASS RAISES THE REST' } ] },
    { id: 'bc-examglass', zone: [783, 6, 794, 13], steps: [ { key: 'examGlass', is: ['glass.exam', 'idle'], at: [791, 12], line: 'THE LAST HOURGLASS: STRIKE IT, THEN RUN' } ] },
    /* (claude/buriedcity4) THE GLASS WORKS, THE ROOFTOPS' TILTING DUNE, THE ANTECHAMBER: every glass the route needs glints until it runs */
    { id: 'bc-works1', zone: [341, 28, 352, 34], steps: [ { key: 'works1', is: ['glass.works1', 'idle'], at: [351, 32], line: 'THE KILN STUB: STRIKE ITS GLASS AND THE STAIR RISES' } ] },
    { id: 'bc-works2', zone: [361, 22, 368, 27], steps: [ { key: 'works2', is: ['glass.works2', 'idle'], at: [364, 26], line: 'STRIKE THE GLASS, THEN STEP INTO THE SAND-FALL' } ] },
    { id: 'bc-works3', zone: [370, 12, 383, 17], steps: [ { key: 'works3', is: ['glass.works3', 'idle'], at: [372, 15], line: 'THE DUNE IS A WALL: STRIKE THE GLASS AND IT TILTS' } ] },
    { id: 'bc-works4', zone: [383, 7, 389, 11], steps: [ { key: 'works4', is: ['glass.works4', 'idle'], at: [385, 10], line: 'THE RELAY: STRIKE THE GLASS, THEN JUMP' } ] },
    { id: 'bc-works5', zone: [398, 18, 401, 22], steps: [ { key: 'works5', is: ['glass.works5', 'idle'], at: [399, 21], line: 'THE RELAY: ITS SECOND GLASS RAISES THE LAST ROOF' } ] },
    { id: 'bc-tiltdune', zone: [734, 2, 746, 12], steps: [ { key: 'tiltDune', is: ['glass.fall', 'idle'], at: [741, 6], glint: 'stall', line: 'THE DUNE TILTS WITH THE GLASS BY THE FALL: STRIKE IT AGAIN' } ] },
    { id: 'bc-ante', zone: [822, 28, 826, 33], steps: [ { key: 'ante', is: ['glass.ante', 'idle'], at: [824, 32], line: 'STRIKE THE GLASS AND CROSS THE SLABS BEFORE THEY GO' } ] },
  ],
  /* THE SEALED PYRAMID (claude/sealedpyramid): every route need glints until its state is the one the route wants (src/sealed-pyramid-hands.js handsState:
     cw.<pair> home / over / moving, wall.falsedoor shut / open, pit.<trap> open / filled, trap.<id> ready / spent, vault.<id> due); the robbers' hole glints after a stall */
  sealedpyramid: [
    { id: 'py-hole', zone: [46, 2, 75, 13], steps: [ { key: 'hole', at: [69, 13], glint: 'stall', line: 'THE ROBBERS\' HOLE IS THE WAY IN' } ] },
    { id: 'py-cw1', zone: [166, 24, 181, 29], steps: [ { key: 'cw1', is: ['cw.cw1', 'home'], at: [180, 29], line: 'THE STONE BLOCK ON ITS CHAIN: STAND ON IT AND RIDE IT DOWN' } ] },
    { id: 'py-weigh', zone: [186, 30, 215, 39], steps: [ { key: 'weigh', is: ['cw.cw2', 'home'], at: [214, 39], line: 'THE PALE BLOCK IS A PLATE: TREAD IT, AND YOU GO UP' } ] },
    { id: 'py-great', zone: [250, 18, 325, 36], steps: [ { key: 'great', is: ['wall.falsedoor', 'shut'], at: [256, 29], line: 'THE GREAT STONE\'S PLATE IS ON THE ROBBERS\' WALK' },
      { key: 'door', is: ['wall.falsedoor', 'open'], at: [327, 36], glint: 'stall', line: 'THE STONE BROKE THE FALSE DOOR: THE WAY DOWN IS BEHIND IT' } ] },
    { id: 'py-pit2', zone: [348, 36, 357, 43], steps: [ { key: 'pit2', is: ['pit.pit2', 'open'], at: [353, 43], line: 'TOO WIDE TO JUMP: THE PLATE DROPS THE BLOCK INTO THE PIT' } ] },
    { id: 'py-shaft', zone: [430, 46, 441, 50], steps: [ { key: 'shaftPlate', is: ['trap.shaft', 'ready'], at: [436, 50], line: 'SPEND THE DART WALL FROM THE PLATE FIRST' },
      { key: 'shaftRide', is: ['trap.shaft', 'spent'], at: [440, 50], line: 'THE DARTS ARE RELOADING: RIDE THE BLOCK DOWN NOW' } ] },
    /* (claude/pyramidlevel) THE SLUICES: the cistern and the crypt are shut until their water rises - tread the plate, then swim up */
    { id: 'py-flood1', zone: [863, 34, 878, 47], steps: [ { key: 'flood1', is: ['flood.flood1', 'dry'], at: [864, 47], line: 'THE SLUICE PLATE: TREAD IT AND THE WATER COMES' },
      { key: 'flood1up', is: ['flood.flood1', 'high'], at: [880, 41], glint: 'stall', line: 'THE WATER IS UP: SWIM TO THE LIP' } ] },
    { id: 'py-flood2', zone: [885, 31, 950, 53], steps: [ { key: 'flood2', is: ['flood.flood2', 'dry'], at: [944, 53], line: 'THE CRYPT SLUICE IS AT ITS FAR END: TREAD ITS PLATE' },
      { key: 'flood2up', is: ['flood.flood2', 'high'], at: [952, 29], glint: 'stall', line: 'THE WATER IS UP: SWIM TO THE HIGH DOOR' } ] },
    { id: 'py-vault', zone: [393, 46, 400, 50], steps: [ { key: 'vault', is: ['vault.sealed', 'due'], at: [397, 50], line: 'THE SEALED TOMB: FOUR SEALS OPEN IT' } ] },
  ],
  /* THE BANDIT KSAR (claude/ksar): the route's two verb locks glint until they are done (src/ksar-hands.js handsState: gate braked/free/open, arch.<id> whole/broken, vault.<id>),
     and the climbs over the towers on the walk and out of the store's cellar glint after a stall */
  ksar: [
    { id: 'ks-tower2', zone: [86, 18, 96, 28], steps: [ { key: 'tower2', rows: [20, 28], at: [94, 25], glint: 'stall', line: 'THE TOWER STANDS ON THE WALK: THE WAY IS OVER IT' } ] },
    { id: 'ks-tower3', zone: [148, 18, 157, 28], steps: [ { key: 'tower3', rows: [18, 28], at: [153, 25], glint: 'stall', line: 'THE TOWER STANDS ON THE WALK: THE WAY IS OVER IT' } ] },
    { id: 'ks-gate', zone: [226, 16, 258, 34], steps: [
      { key: 'greatGong', is: ['gate', 'braked'], at: [236, 24], line: 'THE GREAT GONG: ITS EARSHOT REACHES THE GATEHOUSE' },
      { key: 'winch', is: ['gate', 'free'], at: [253, 33], line: 'THE GATE WINCH: THE BRAKE IS OFF' } ] },
    { id: 'ks-store', zone: [386, 14, 446, 25], steps: [ { key: 'storeKeg', is: ['arch.storeArch', 'whole'], at: [400, 24], line: 'A KEG CHAIN ON THE ROOF: A BLOW LIGHTS THE FIRST' } ] },
    { id: 'ks-cellar', zone: [417, 26, 430, 31], steps: [ { key: 'cellar', at: [420, 28], glint: 'stall', line: 'THE LEDGES LEAD BACK UP THROUGH THE HOLE' } ] },
    { id: 'ks-vault', zone: [562, 26, 583, 34], steps: [ { key: 'vault', is: ['vault.strongroom', 'due'], at: [575, 33], line: 'THE STRONGROOM: FIVE SEALS OPEN IT' } ] },
    /* (claude/ksar2) THE LONGER KSAR: the reed screen, the powder run's two walls, the raised bridge, the trail's wall, the alley's arch, the line to her roofs */
    { id: 'ks-reeds', zone: [586, 26, 600, 34], steps: [ { key: 'reeds', is: ['reed.reedA', 'whole'], at: [590, 33], line: 'A REED SCREEN: TAKE A TORCH AND THROW IT' } ] },
    { id: 'ks-runA', zone: [641, 26, 651, 34], steps: [ { key: 'runA', is: ['arch.runA', 'whole'], at: [642, 33], line: 'A BRICKED WALL: CARRY A KEG TO IT' } ] },
    { id: 'ks-runB', zone: [652, 26, 665, 34], steps: [ { key: 'runB', is: ['arch.runB', 'whole'], at: [655, 33], line: 'A BRICKED WALL: CARRY A KEG TO IT' } ] },
    { id: 'ks-rope', zone: [666, 26, 681, 34], steps: [ { key: 'rope', is: ['rope.rope', 'raised'], at: [669, 31], line: 'THE BRIDGE IS RAISED: A TORCH BURNS ITS ROPE' } ] },
    { id: 'ks-trail', zone: [682, 26, 698, 34], steps: [ { key: 'trail', is: ['arch.trailWall', 'whole'], at: [685, 33], line: 'A POWDER TRAIL: A TORCH LIGHTS IT' } ] },
    { id: 'ks-alley', zone: [703, 26, 778, 34], steps: [ { key: 'alley', is: ['arch.alleyArch', 'whole'], at: [718, 33], line: 'A KEG CHAIN DOWN THE ALLEY: A BLOW LIGHTS THE FIRST' } ] },
    { id: 'ks-line', zone: [789, 10, 796, 17], steps: [ { key: 'line', at: [795, 15], glint: 'stall', line: 'THE LINE TO HER ROOFS: UP TAKES ITS HANDLE' } ] },
  ],
  /* THE DEEP RAILS (claude/minecart): the levers the route needs glint until they are SET (src/minecart-hands.js handsState: points.<id> open / set); the first
     boost gap glints after a stall (a cart that keeps falling in) */
  minecart: [
    { id: 'mc-boost', zone: [44, 18, 70, 31], steps: [ { key: 'yardGap', at: [61, 27], glint: 'stall', line: 'A LONG GAP: HOLD RIGHT TO PUMP BEFORE THE LIP' } ] },
    { id: 'mc-yard', zone: [112, 18, 152, 31], steps: [ { key: 'yardPts', is: ['points.yard', 'open'], at: [125, 25], line: 'THE POINTS LEVER: THE LOW LINE IS FALLEN IN' } ] },
    { id: 'mc-cavein', zone: [524, 20, 555, 31], steps: [ { key: 'caveinPts', is: ['points.cavein', 'open'], at: [538, 26], line: 'THE POINTS LEVER UP TOP: THE LOW LINE IS GOING' } ] },
    /* (claude/deeprails2) the lava ramp (a cart that keeps falling short), the lift (a hero on foot at its foot), the foreman (a cart that keeps bumping him) */
    { id: 'mc-ramp', zone: [596, 26, 626, 40], steps: [ { key: 'lavaRamp', at: [614, 36], glint: 'stall', line: 'THE RAMP: PUMP HARD BEFORE ITS LIP' } ] },
    { id: 'mc-lift', zone: [763, 18, 784, 38], steps: [ { key: 'lift', at: [766, 36], glint: 'stall', line: 'THE LIFT: STAND ON THE CAGE AND RIDE IT UP' } ] },
    /* (deeprails5 #4) THE PARKED CARTS: each glints until you are in it (src/minecart-hands.js handsState board.<id>: out / in) - the first (THE WRECK's) at once, where it is taught */
    { id: 'mc-board-wreck', zone: [664, 28, 676, 38], steps: [ { key: 'boardWreck', is: ['board.wreck', 'out'], at: [674, 36], line: 'THE PARKED CART: JUMP INTO IT AND ITS GATE OPENS' } ] },
    { id: 'mc-board-lift', zone: [774, 18, 785, 28], steps: [ { key: 'boardLift', is: ['board.lift', 'out'], at: [783, 26], glint: 'stall', line: 'THE PARKED CART: JUMP INTO IT' } ] },
    { id: 'mc-board-pits', zone: [1232, 22, 1241, 31], steps: [ { key: 'boardPits', is: ['board.pits', 'out'], at: [1240, 29], glint: 'stall', line: 'THE PARKED CART: JUMP INTO IT' } ] },   /* (claude/forgemaster: the spoil pits' cart waits past THE FORGE now) */
    /* (claude/forgemaster) THE SMELTER FLOOR's plugs: the teach's lever glints at once (the required use) until its plug is broken; the exam's after a stall (src/forge-rails.js state forge.<plug>: shut / open) */
    { id: 'mc-forge-teach', zone: [1062, 18, 1087, 31], steps: [ { key: 'forgeTeach', is: ['forge.pTeach', 'shut'], at: [1069, 29], line: 'THE JUNCTION LEVER: STRIKE IT, AND THE NEXT CART DROPS INTO THE PLUG' } ] },
    { id: 'mc-forge-exam', zone: [1155, 18, 1171, 31], steps: [ { key: 'forgeExam', is: ['forge.pExam', 'shut'], at: [1157, 29], glint: 'stall', line: 'THE LAST PLUG: SEND A CART INTO IT FROM THE LEVER' } ] },
    { id: 'mc-pits-crusher', zone: [990, 18, 999, 27], steps: [ { key: 'pitsCrusher', at: [995, 25], glint: 'stall', line: 'A CRUSHER OVER THE CATWALK: TIME IT, OR DOWN + JUMP UNDER IT' } ] },
    { id: 'mc-foreman', zone: [891, 18, 922, 31], steps: [ { key: 'foreman', at: [906, 28], glint: 'stall', line: 'THE FOREMAN: JUMP ON HIS CART AS HE DROPS BACK' } ] },
    /* (claude/deeprails3) THE SWITCHES: each glints until its bridge is laid (handsState points.<id>: open / set) */
    { id: 'mc-yardSw', zone: [138, 18, 162, 31], steps: [ { key: 'yardSw', is: ['points.yardSw', 'open'], at: [151, 25], line: 'THE SWITCH: STRIKE IT, OR PRESS E - ITS BRIDGE IS OUT' } ] },
    { id: 'mc-driftSw', zone: [171, 18, 189, 31], steps: [ { key: 'driftSw', is: ['points.driftSw', 'open'], at: [180, 24], line: 'THE SWITCH IN THE DARK: STRIKE IT AS YOU PASS' } ] },
    { id: 'mc-worksSw', zone: [744, 28, 762, 40], steps: [ { key: 'worksSw', is: ['points.worksSw', 'open'], at: [755, 36], line: 'THE SWITCH: DUCK THE BEAM, THEN STRIKE IT' } ] },
    { id: 'mc-examSw', zone: [925, 22, 942, 31], steps: [ { key: 'examSw', is: ['points.examSw', 'open'], at: [935, 29], line: 'THE SWITCH: STRIKE IT BEFORE THE BRIDGE' } ] },
  ],
  /* THE SUNKEN CARAVAN (claude/caravan2, design standard A6): the route's needs glint after a stall - the first quicksand's far lip, the wagon bed in the
     sinking basin, and the crest of each REQUIRED dune slide (src/draft/sunken-caravan.js L.duneSlides: the teach, the big dune, the exam's) */
  caravan: [
    { id: 'cv-quicksand', zone: [163, 22, 168, 31], at: [172, 29], glint: 'stall', line: 'QUICKSAND: JUMP OVER IT, OR JUMP AND KEEP JUMPING' },
    { id: 'cv-basin', zone: [193, 22, 199, 31], at: [203, 29], glint: 'stall', line: 'A WAGON BED IN THE SAND: HOP ON, AND OFF BEFORE IT SINKS' },
    { id: 'cv-slide1', zone: [240, 20, 249, 31], at: [246, 26], glint: 'stall', line: 'THE DUNE: HOLD DOWN TO SLIDE IT, JUMP AT ITS FOOT' },
    { id: 'cv-slide-long', zone: [276, 12, 296, 30], at: [286, 18], glint: 'stall', line: 'THE BIG DUNE: SLIDE IT FOR SPEED, JUMP THE SAND AT ITS FOOT' },
    { id: 'cv-slide4', zone: [499, 20, 508, 32], at: [505, 27], glint: 'stall', line: 'THE LAST DUNE: SLIDE IT, AND JUMP THE SAND AT ITS FOOT' },
  ],
  /* THE GLASS SEA (claude/glasssea): every mirror the route needs glints until its beam does its work (src/glass-sea-hands.js handsState: bed.<id> sand/fused,
     crack.<id> held/boils, mirror.<id> its notch); the slide gap and the Sunken Head's holds glint as places (the glow marks the holds) */
  glasssea: [
    { id: 'gs-first', zone: [28, 20, 47, 34], steps: [ { key: 'firstMirror', is: ['bed.firstStair', 'sand'], at: [40, 31], line: 'A SUN-MIRROR BY THE DUNE CLIFF' } ] },
    { id: 'gs-slide', zone: [128, 20, 147, 37], steps: [ { key: 'slideGap', at: [142, 35], glint: 'stall', line: 'THE SLICK SLOPE: HOLD DOWN TO SLIDE, THEN JUMP AT THE FOOT' } ] },
    { id: 'gs-cross', zone: [212, 20, 241, 34], steps: [ { key: 'crossMirror', is: ['bed.bridge', 'sand'], at: [224, 31], line: 'THE MIRROR ON THE LIP OF THE CROSSING' } ] },
    { id: 'gs-chain', zone: [304, 18, 345, 34], steps: [
      { key: 'chainA', is: ['mirror.chainA', 'sky'], at: [316, 31], line: 'A MIRROR IN THE LOW SUN' },
      { key: 'chainA2', is: ['mirror.chainA', '\\'], at: [316, 31], line: 'A MIRROR IN THE LOW SUN' },
      { key: 'chainB', is: ['mirror.chainB', 'sky'], at: [316, 22], line: 'A SECOND MIRROR ON THE OBELISK SHELF' },
      { key: 'chainB2', is: ['mirror.chainB', '\\'], at: [316, 22], line: 'A SECOND MIRROR ON THE OBELISK SHELF' } ] },
    { id: 'gs-head', zone: [358, 14, 372, 28], steps: [
      { key: 'hold1', rows: [25, 28], at: [363, 24], line: 'THE GLOW MARKS THE HOLDS UP THE FACE' },
      { key: 'hold2', rows: [22, 25], at: [363, 21], line: 'THE GLOW MARKS THE HOLDS UP THE FACE' },
      { key: 'hold3', rows: [19, 22], at: [366, 18], line: 'THE GLOW MARKS THE HOLDS UP THE FACE' },
      { key: 'hold4', rows: [16, 19], at: [370, 16], line: 'THE CROWN IS OVER THE BROW' } ] },
    { id: 'gs-cut', zone: [494, 24, 523, 34], steps: [ { key: 'relay', is: ['crack.darkCut', 'boils'], at: [502, 30], line: 'A MIRROR OVER THE FIRE BY THE CUT' } ] },
    { id: 'gs-steps', zone: [574, 20, 595, 34], steps: [
      { key: 'gaze', is: ['bed.stepsBridge', 'sand'], at: [588, 25], line: "A MIRROR IN THE COLOSSUS'S GAZE" },
      { key: 'stepsRelay', is: ['crack.steps', 'boils'], at: [582, 27], line: 'A MIRROR OVER THE FIRE ON THE STEPS' } ] },
    /* (glasssea2) THE ROCKING MIRRORS: the mirror glints until it is turned; then the far lip glints (cross while the beam holds the glass) */
    { id: 'gs-pulseA', zone: [164, 20, 182, 37], steps: [
      { key: 'pulseA', is: ['mirror.pulseA', 'sky'], at: [170, 31], line: 'A ROCKING MIRROR BY THE PIT: TURN IT' },
      { key: 'pulseAGo', colLt: 181, at: [181, 33], glint: 'stall', line: 'CROSS WHILE THE BEAM HOLDS THE GLASS; WAIT WHILE IT FLICKERS' } ] },
    { id: 'gs-hawk', zone: [256, 18, 284, 37], steps: [
      { key: 'hawkX', is: ['mirror.hawkX', 'sky'], colLt: 270.5, at: [262, 31], line: 'A ROCKING MIRROR ON THE LIP: TURN IT' },
      { key: 'hawkGoW', colLt: 270.5, at: [272, 33], glint: 'stall', line: 'CROSS TO THE PILLAR WHILE THE BEAM HOLDS THE GLASS' },
      { key: 'hawkY', is: ['mirror.hawkY', 'sky'], colLt: 274, at: [273, 31], line: 'THE SECOND MIRROR, ON THE PILLAR: TURN IT' },
      { key: 'hawkGoE', colLt: 282, at: [283, 33], glint: 'stall', line: 'WAIT ON THE PILLAR FOR ITS BEAM, THEN CROSS' } ] },
  ],

  redgorge: [
    /* THE FALLS (Daniel 10-03: the gap up the falls cannot be jumped, and the wheel on the terrace was not seen): the glint is on the WHEEL until its gate holds the flood */
    { id: 'rg-falls', zone: WHOLE, steps: [
      { key: 'fallsWheel', rows: [118.5, 136.5], colGt: 19, noClimb: true, is: ['gate.falls', 'open'], at: [28, 135], dy: -30, line: 'THE WHEEL: PRESS E AT IT. THE GATE SHUTS AND HOLDS THE FLOOD' },
      { key: 'fallsHold', rows: [118.5, 136.5], colGt: 19, noClimb: true, is: ['gate.falls', 'shut'], at: [28, 135], dy: -30, line: 'THE GATE IS SHUT: WAIT FOR THE HORN, THEN CLIMB THE DRY ROPE' },
      { key: 'fallsRope', rows: [118.5, 136.5], colGt: 19, noClimb: true, at: [24, 134], line: 'THE ROPE: CLIMB IT WHILE THE CHANNEL IS DRY' } ] },
    { id: 'rg-ledges', zone: WHOLE, steps: [
      { key: 'basket', rows: [100.5, 118.5], mover: { gorge: 'ledges' }, off: { gorge: 'ledges' }, dy: -4, line: 'THE BASKET: STAND ON IT. THE FLOOD WINDS IT UP' } ] },
    { id: 'rg-jam', zone: WHOLE, steps: [
      { key: 'jam', rows: [66, 70.5], colGt: 26, is: ['jam', 'closed'], at: [28, 69], dy: -30, line: 'THE WHEEL: SHUT THE GATE, LET IT FILL, THEN RELEASE IT' },
      { key: 'basket', rows: [66, 70.5], is: ['jam', 'open'], mover: { gorge: 'narrows' }, off: { gorge: 'narrows' }, dy: -4, line: 'THE BASKET: STAND ON IT. THE FLOOD WINDS IT UP' } ] },
    { id: 'rg-narrows-rope', zone: WHOLE, steps: [
      { key: 'narrowsRope', rows: [60, 65.5], colLt: 22, noClimb: true, at: [22, 61], line: 'THE ROPE: CLIMB IT WHILE THE CHANNEL IS DRY' } ] },
    /* (claude/redgorge2) THE RAPIDS: on the stone before a reach too wide to jump, the drifting timber glints; THE GORGE CLIMB: the wall rope, the spill chute's basket */
    { id: 'rg-rapids', zone: WHOLE, steps: [
      { key: 'timber1', rows: [218.5, 219.5], colGt: 119, colLt: 123.5, mover: { debris: 'd1' }, dy: -4, line: 'A DRIFTING TIMBER: JUMP ON AS IT COMES PAST' },
      { key: 'timber2', rows: [218.5, 219.5], colGt: 104, colLt: 108.5, mover: { debris: 'd2' }, dy: -4, line: 'THE TIMBERS DRIFT DOWN TOGETHER: RIDE ONE, HOP TO THE NEXT' },
      { key: 'timber4', rows: [218.5, 219.5], colGt: 88, colLt: 92.5, mover: { debris: 'd4' }, dy: -4, line: 'A DRIFTING TIMBER: JUMP ON AS IT COMES PAST' } ] },
    { id: 'rg-climb', zone: WHOLE, steps: [
      { key: 'wallRope', rows: [206.5, 207.5], colLt: 55.5, noClimb: true, at: [50, 206], line: 'THE ROPE UP THE WALL: CLIMB IT' },
      { key: 'spillBasket', rows: [190.5, 191.5], colLt: 60, mover: { gorge: 'spill' }, off: { gorge: 'spill' }, dy: -4, line: 'THE BASKET: STAND ON IT. THE FLOOD DOWN THE CHUTE WINDS IT UP' },
      { key: 'gusts', rows: [165.5, 175.5], colGt: 47, colLt: 66, noClimb: true, at: [55, 165], dy: -4, line: 'THE GUSTS: BRACE (BLOCK) OR CROSS IN THE STILL AIR' } ] },   /* (fix pass) the gust ledges: the glint on the landing's lip */
    /* (fix pass) THE MATRIARCH'S LEVERS (her fight's one verb): both glint while a sluice is FULL and she can be caught in the channel (the hands report mat.lever: due) */
    { id: 'rg-lever', zone: WHOLE, steps: [
      { key: 'lever', rows: [4, 24.5], colGt: 95, colLt: 136, is: ['mat.lever', 'due'], ats: [[97, 21], [134, 21]], dy: -26, line: 'THE SLUICES ARE FULL: E AT A LEVER LETS THE DAM GO' } ] },   /* (claude/redgorgerework: her ledge moved east, src/red-gorge.js REDGORGE.matX) */
    /* (claude/redgorgerework) THE SPILLWAY: on each pitch, the basket until you stand on it, then the wheel beside it (release its gate) */
    { id: 'rg-spillway', zone: WHOLE, steps: [
      { key: 'sp1', rows: [51.5, 61.5], colGt: 57, colLt: 70, mover: { gorge: 'sp1' }, off: { gorge: 'sp1' }, dy: -4, line: 'THE BASKET: STAND ON IT, THEN RELEASE ITS GATE AT THE WHEEL (E)' },
      { key: 'sp1w', rows: [51.5, 61.5], colGt: 57, colLt: 70, at: [66, 61], dy: -30, line: 'THE WHEEL: E RELEASES THE GATE. THE WATER WINDS THE BASKET UP' },
      { key: 'sp2', rows: [32.5, 43.5], colGt: 57, colLt: 80, mover: { gorge: 'sp2' }, off: { gorge: 'sp2' }, dy: -4, line: 'THE BASKET: STAND ON IT, THEN RELEASE ITS GATE AT THE WHEEL (E)' },
      { key: 'sp2w', rows: [32.5, 43.5], colGt: 57, colLt: 80, at: [76, 42], dy: -30, line: 'THE WHEEL: E RELEASES THE GATE. THE WATER WINDS THE BASKET UP' },
      { key: 'sp3', rows: [21.5, 33.5], colGt: 74, colLt: 86, mover: { gorge: 'sp3' }, off: { gorge: 'sp3' }, dy: -4, line: 'THE BASKET: STAND ON IT, THEN RELEASE ITS GATE AT THE WHEEL (E)' },
      { key: 'sp3w', rows: [21.5, 33.5], colGt: 74, colLt: 86, at: [82, 32], dy: -30, line: 'THE WHEEL: E RELEASES THE GATE. THE WATER WINDS THE BASKET UP' } ] },
  ],
  /* THE UNDERWELL (claude/underwell): every nest, oil fire, torch and rope the route needs glints until it is done (src/underwell-hands.js handsState:
     nest.<id> shut|open, fire.<col> lit|out, torch.<id> up|fall|down, rope.<id> hung|burnt, lamp up|fall|down, skin some|empty) */
  underwell: [
    /* (claude/underwell3) the old columns, through uwSpot - THE SPILLWAY's and THE OLD RESERVOIR's spots (true columns) are added after the list */
    /* (claude/underwell2, Daniel 10-06 "every glint/nudge/sign says its verb"; the torches are TAKEN and THROWN now; THE DROWNED CISTERN; her door 96 east) */
    { id: 'uw-shaft-nest', zone: [12, 36, 20, 44], steps: [
      { key: 'shaftTorch', is: ['nest.shaft', 'shut'], at: [15, 41], dy: -4, line: 'TAKE THE TORCH (E), THROW IT ON THE OIL (ATTACK)' } ] },
    { id: 'uw-shaft-fire', zone: [25, 39, 32, 44], steps: [
      { key: 'shaftDrip', is: ['skin', 'empty'], at: [29, 43], line: 'E AT THE DRIP BY THE WALL: A SIP OF WATER' },
      { key: 'shaftFire', is: ['fire.36', 'lit'], at: [36, 43], line: 'POUR ON THE OLD OIL FIRE: E WITH WATER IN YOUR SKIN' } ] },
    { id: 'uw-hall-lamp', zone: [60, 24, 96, 43], steps: [
      { key: 'lamp', is: ['lamp', 'up'], at: [87, 31], glint: 'stall', line: 'STRIKE THE CHAIN: THE LAMP FALLS INTO THE OIL' } ] },
    { id: 'uw-hall-nest', zone: [97, 24, 133, 44], steps: [
      { key: 'hallTorch', is: ['nest.hall', 'shut'], at: [118, 41], dy: -4, line: "TAKE THE CHAMBER'S TORCH, THROW IT ON THE NEST'S OIL" } ] },
    { id: 'uw-works-low', zone: [141, 32, 215, 44], steps: [
      { key: 'worksTorch', is: ['nest.works', 'shut'], rows: [38, 44], at: [176, 41], dy: -4, line: 'POUR AT THE ROPE FIRST, THEN THROW THE TORCH ON THE OIL' },
      { key: 'worksRope', is: ['rope.works', 'hung'], at: [160, 40], glint: 'stall', line: 'CLIMB THE ROPE: HOLD UP' },
      { key: 'worksBack', is: ['rope.works', 'burnt'], at: [211, 40], line: 'THE ROPE IS ASH: CLIMB THE SCAFFOLDS ON THE EAST WALL' } ] },
    { id: 'uw-works-up', zone: [157, 22, 239, 29], steps: [
      { key: 'worksNest', is: ['nest.works', 'shut'], at: [223, 29], line: 'LIGHT THE OIL BELOW: IT RUNS UP THE PIPE TO THIS NEST' },
      { key: 'worksFire', is: ['fire.228', 'lit'], at: [228, 29], line: 'POUR ON THE OLD OIL FIRE: E WITH WATER IN YOUR SKIN' } ] },
    { id: 'uw-gutter', zone: [244, 36, 262, 45], steps: [
      { key: 'gutterTorch', is: ['torch.gutter', 'up'], at: [255, 43], dy: -4, line: 'TAKE THE TORCH, TOSS IT SHORT INTO THE OIL: DOWN + ATTACK' } ] },
    { id: 'uw-sump-out', zone: [324, 38, 336, 45], steps: [
      { key: 'sumpOut', at: [338, 42], glint: 'stall', line: 'JUMP UP ONTO THE STONE: THE WAY OUT OF THE SUMP' } ] },
    { id: 'uw-exam', zone: [346, 33, 370, 42], steps: [
      { key: 'examTorch', is: ['nest.exam', 'shut'], at: [364, 40], dy: -4, line: 'POUR AT THE ROPE, THEN THROW THE TORCH ON THE OIL' },
      { key: 'examSpring', is: ['skin2', 'low'], at: [404, 42], line: 'FILL YOUR SKIN AT THE SPRING PAST THE NEST: E' },
      { key: 'examRope', is: ['rope.exam', 'hung'], at: [356, 41], line: 'CLIMB THE ROPE: HOLD UP' },
      { key: 'examAsh', is: ['rope.exam', 'burnt'], at: [356, 41], line: 'THE ROPE IS ASH: WAIT FOR THE SPARE, THEN CLIMB' } ] },
    { id: 'uw-exam-room', zone: [371, 33, 405, 42], steps: [
      { key: 'examFill', is: ['skin2', 'low'], at: [404, 42], line: 'FILL YOUR SKIN AT THE SPRING PAST THE NEST: E' },
      { key: 'examBack', at: [356, 41], line: 'BACK TO THE ROPE AND CLIMB IT: HOLD UP' } ] },
    { id: 'uw-exam-fires', zone: [352, 26, 436, 31], steps: [
      { key: 'examFire1', is: ['fire.420', 'lit'], at: [420, 31], line: 'POUR ON THE OLD OIL FIRE: E WITH WATER IN YOUR SKIN' },
      { key: 'examFire2', is: ['fire.426', 'lit'], at: [426, 31], line: 'POUR ON THE SECOND OIL FIRE: E WITH WATER' } ] },
    /* THE DROWNED CISTERN: down off the landing; the far nest wants the island's torch LOBBED over the deep pool; then the stair; then the gallery to her door */
    { id: 'uw-drown-down', zone: [437, 26, 443, 33], steps: [
      { key: 'drownDown', at: [446, 34], glint: 'stall', line: 'DROP DOWN INTO THE OLD CISTERN' } ] },
    { id: 'uw-drown-nest', zone: [444, 20, 486, 45], steps: [
      { key: 'drownLob', is: ['nest.drown', 'shut'], at: [471, 42], dy: -4, line: 'LOB THE ISLAND TORCH OVER THE WATER: UP + ATTACK' } ] },
    { id: 'uw-drown-swim', zone: [444, 30, 486, 45], steps: [
      { key: 'drownSwim', is: ['nest.drown', 'open'], at: [486, 45], glint: 'stall', line: 'SWIM THE DEEP POOL TO THE FAR SHORE' } ] },
    { id: 'uw-drown-stair', zone: [487, 20, 497, 45], steps: [
      { key: 'drownStair', at: [496, 33], glint: 'stall', line: 'CLIMB THE BOARDS UP TO THE GALLERY: JUMP' } ] },
    { id: 'uw-shaft', zone: [529, 26, 574, 31], steps: [
      { key: 'queenShaft', at: [567, 31], glint: 'stall', line: 'DROP DOWN THE OLD SHAFT TO HER CISTERN' } ] },
  ].map(uwSpot).concat([
    /* (claude/underwell3) THE SPILLWAY (244-291): the shore's torch on the floating oil by the nest; the stair room's boards; the old shaft's lip (the works' drop, moved here) */
    { id: 'uw-spill', zone: [UW_SPILL + 5, 22, UW_SPILL + 33, 45], steps: [
      { key: 'spillTorch', is: ['nest.spill', 'shut'], at: [UW_SPILL + 13, 42], dy: -4, line: 'TAKE THE TORCH (E), THROW IT ON THE OIL BY THE NEST (ATTACK)' } ] },
    { id: 'uw-spill-stair', zone: [UW_SPILL + 36, 29, UW_SPILL + 44, 45], steps: [
      { key: 'spillStair', is: ['nest.spill', 'open'], at: [UW_SPILL + 43, 27], glint: 'stall', line: 'CLIMB THE BOARDS UP TO THE OLD SHAFT: JUMP' } ] },
    { id: 'uw-works-drop', zone: [UW_SPILL + 41, 22, UW_SPILL + 47, 28], steps: [
      { key: 'worksDrop', at: [uwX(247), 33], glint: 'stall', line: 'DROP DOWN THE OLD SHAFT INTO THE SUMP' } ] },
    /* THE OLD RESERVOIR (394-437): its torch up in the bats' dark, thrown on the oil by the nest */
    { id: 'uw-res', zone: [UW_RES, 26, UW_RES + 36, 42], steps: [
      { key: 'resTorch', is: ['nest.reservoir', 'shut'], at: [UW_RES + 16, 31], dy: -4, line: 'CLIMB TO THE TORCH IN THE DARK, THROW IT ON THE NEST OIL' } ] },
  ]),
};

/* THE SIGNS AT THE POINT OF USE (the audit: "a sign AT the point of use; fix wrong verbs"). Kept here, not in the level files, so those stay merge-clean:
   src/level.js hands every built level to applyStuckSigns (the last wrapper there). `add`: a new sign at tile (x, y); `fix`: the sign standing at x gets this text. */
export const STUCK_SIGNS = {
  causeway: { fix: [{ x: 40, text: 'HIGH WATER LIFTS YOU. LOW WATER GIVES YOU THE ROAD. ONE GATE WANTS THE FLOOD.' }],
    add: [{ x: 469, y: 23, text: 'THE BOOM AHEAD LIFTS ONLY AT HIGH WATER. RING THE TOWER BELL FOR IT.' }] },
  longwater: { fix: [
    { x: 321, text: 'THE BORE STONES. STAND ON ONE AND LET THE SEA GO UNDER YOU. THE SEA GATE LIFTS BEHIND IT.' },
    { x: 393, text: 'STRIKE THE SLUICE WHEEL TO DRAIN THE STREET. THE FLATS GATE LIFTS ONLY AT LOW WATER.' } ],
    add: [{ x: 385, y: 26, text: 'THE QUAY GATE LIFTS AT HIGH WATER, WHEN THE SEA BELL TURNS.' }] },
  /* (claude/kingswood2) kings: the old court gate's sign fix went with the old wood - KINGSWOOD 2's signs say the verb at each point of use */
  theatre: { add: [
    { x: 136, y: 24, text: 'A ROPE-LOCK. STRIKE IT AND ITS SHUTTER FLIES.' },
    { x: 214, y: 15, text: 'THE FLOOR STOPS. STRIKE THE LOCK: ITS BATTEN BRIDGES THE GAP.' },
    { x: 231, y: 33, text: 'THE WAY ON IS DOWN. WATCH THE STAGE FOR THE CUE.' },
    { x: 282, y: 15, text: 'THE FLOOR ENDS AT THE PIN RAIL. LET THE WEIGHT TAKE YOU DOWN.' } ] },
  reef: { fix: [
    { x: 194, text: 'STRIKE THE CAPSTAN THREE TIMES, THEN STAND ON THE PALLET TO RIDE UP HER DECKS.' },
    { x: 268, text: 'HER HOLD IS THE WAY ON. STRIKE THE CAPSTAN THREE TIMES TO LIFT THE GRATE.' } ],
    add: [{ x: 249, y: 36, text: "THE HULK'S ONLY DOOR IS UP THE SHAFT. SWIM FOR THE AIR." }] },
  fair: { add: [
    { x: 205, y: 27, text: 'THE BOAT SWINGS TO YOU. STEP IN, AND LET GO AT THE TOP.' },
    { x: 564, y: 27, text: 'THE HIGH STRIKER AGAIN. COME DOWN ON THE PAD HARD.' },
    { x: 566, y: 13, text: 'THREE TARGETS, NINE SECONDS: THE BARS DROP FOR THEM.' } ] },
  /* (claude/underleaf3: the mill's and the church's route signs went with UNDERLEAF 2's village) */
  burning: { add: [
    { x: 224, y: 25, text: 'TOO HIGH TO JUMP. WATER PUTS IT OUT, OR GO OVER THE ROOFS.' },
    { x: 245, y: 25, text: 'THE STREET IS GONE. GO OVER THE ROOFS.' } ] },
  oreroad: { add: [{ x: 456, y: 12, text: 'THE CRACKS GIVE UNDER A BLADE.' }] },
  spire: { add: [{ x: 14, y: 131, text: 'THE BOOK-HOIST. STEP IN A BASKET: THE OTHER COMES DOWN.' }] },
  stockade: { add: [{ x: 134, y: 19, text: 'A CRANK WORKS THE PALISADE GATE. STRIKE IT.' }] },
};
export function applyStuckSigns(L, id) {
  const S = STUCK_SIGNS[id]; if (!S || !L || !L.ents) return L;
  for (const f of S.fix || []) { const e = L.ents.find(q => q.t === 'sign' && q.x === f.x); if (e) e.text = f.text; }
  for (const a of S.add || []) L.ents.push({ t: 'sign', x: a.x, y: a.y, text: a.text, stuck: true });   /* (stuck: true - tools/level-quality.mjs levelHash leaves these out, so a stamped pilot / mash row stays valid) */
  return L;
}
