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
  /* THE FALLING TOWER'S ORRERY LOFT (claude/archmage3; src/spiral-chase.js): the next world round on each wheel glints (m.next, kept by updateStairFx) from
     the gallery's landing and the board step (wheel A), and from the pier (wheel B) - never while you ride that wheel */
  fallingtower: [
    { id: 'ft-orrery-a', zone: [80, 87, 91, 90], mover: { orrery: 'A', next: true }, off: { orrery: 'A' }, line: 'THE ORRERY TURNS: ITS WORLDS ARE THE WAY OVER THE VOID' },
    { id: 'ft-orrery-b', zone: [94, 84, 99, 86], at: [98, 86], off: { orrery: 'B' }, line: "THE ORRERY'S OUTER WORLD IS THE WAY ON UP" },
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
  causeway: [
    { id: 'cw-boom', zone: [421, 0, 478, 43], ats: [[479, 17], [464, 17]], glint: 'stall', line: 'THE BOOM LIFTS AT HIGH WATER: THE TOWER BELL TURNS THE TIDE' },
  ],
  longwater: [
    { id: 'lw-bore-gate', zone: [318, 0, 361, 28], at: [362, 22], glint: 'stall', line: 'THE SEA GATE LIFTS AS THE BORE GOES BY: STAND ON A STONE' },
    { id: 'lw-quay-gate', zone: [366, 0, 386, 27], at: [387, 22], glint: 'stall', line: 'THE QUAY GATE LIFTS AT HIGH WATER: WAIT FOR THE BELL' },
    { id: 'lw-flats-gate', zone: [388, 0, 418, 28], ats: [[419, 22], [390, 25]], glint: 'stall', line: 'THE FLATS GATE LIFTS AT LOW WATER: DRAIN THE STREET OR WAIT' },
  ],
  kings: [
    { id: 'kg-court-gate', zone: [568, 0, 584, 14], at: [583, 8], done: ['plate', 583, 8, 'down'], line: 'THE COURT GATE IS SHUT: A PLATE ON THE LEDGE ABOVE THE CARPET' },
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
  underleaf: [
    { id: 'ul-brass', zone: [90, 2, 170, 45], steps: [
      { zone: [96, 2, 124, 17], at: [112, 6], done: ['key', 112, 6, 'got'], line: 'THE BRASS KEY HANGS ON THE HOIST BEAM' },
      { zone: [90, 18, 170, 45], at: [122, 33], done: ['key', 112, 6, 'got'], line: 'THE BRASS KEY IS IN THE MILL: FIND ITS DOOR' },
      { zone: [96, 18, 170, 45], at: [157, 33], when: ['key', 112, 6, 'got'], done: ['lockgate', 157, 33, 'open'], line: 'THE BRASS GATE WANTS THE KEY YOU CARRY' } ] },
    { id: 'ul-iron', zone: [140, 2, 345, 45], steps: [
      { zone: [140, 2, 196, 17], at: [188, 8], done: ['key', 188, 8, 'got'], line: 'THE IRON KEY IS ON THE ROOD BEAM' },
      { zone: [175, 18, 345, 45], at: [278, 33], done: ['key', 188, 8, 'got'], line: 'THE IRON KEY IS IN THE CHURCH: FIND ITS DOOR' },
      { zone: [175, 18, 345, 45], at: [336, 33], when: ['key', 188, 8, 'got'], done: ['lockgate', 336, 33, 'open'], line: 'THE IRON GATE WANTS THE KEY YOU CARRY' } ] },
    { id: 'ul-bone', zone: [210, 2, 475, 45], glint: 'stall', steps: [
      { zone: [210, 2, 258, 17], at: [250, 9], done: ['key', 250, 9, 'got'], line: "THE BONE KEY IS ON THE MASTER'S DESK" },
      { zone: [340, 18, 470, 45], at: [356, 33], done: ['key', 250, 9, 'got'], line: 'THE BONE KEY IS IN THE SCHOOL: FIND ITS DOOR' },
      { zone: [340, 18, 475, 45], at: [469, 33], when: ['key', 250, 9, 'got'], done: ['lockgate', 469, 33, 'open'], line: 'THE BONE GATE WANTS THE KEY YOU CARRY' } ] },
  ],
  burning: [
    { id: 'bn-fallen-house', zone: [200, 22, 232, 30], ats: [[227, 25], [208, 23]], line: 'TOO HIGH TO JUMP: WATER, OR THE ROOFS' },
    { id: 'bn-trench', zone: [240, 18, 252, 30], at: [252, 23], line: 'THE STREET IS GONE: GO OVER THE ROOFS' },
  ],
  crown: [
    { id: 'cr-chapel', zone: [672, 10, 768, 28], steps: [
      { at: [728, 19], done: ['key', 728, 19, 'got'], line: 'THE BONE KEY LIES IN THE EAST HALF' },
      { at: [714, 19], done: ['lockgate', 714, 19, 'open'], line: 'THE BONE GATE WANTS THE KEY YOU CARRY' },
      { at: [682, 19], done: ['key', 682, 19, 'got'], line: 'THE BRASS KEY IS ON THE ALTAR, BEYOND THE BONE GATE' },
      { at: [760, 19], done: ['lockgate', 760, 19, 'open'], line: 'THE BRASS GATE WANTS THE KEY YOU CARRY' } ] },
  ],
  oreroad: [
    { id: 'or-wall', zone: [446, 3, 467, 16], at: [468, 9], line: 'THE CRACKED WALL BARS THE LANDING' },
  ],
  lamplit: [
    { id: 'lp-stair', zone: [236, 8, 262, 22], at: [260, 21], line: 'THE ROOFS END HERE: THE WAY ON IS DOWN THE STAIR' },
    { id: 'lp-key', zone: [262, 18, 345, 45], steps: [
      { at: [292, 37], done: ['key', 292, 37, 'got'], line: 'THE LOCKGATE WANTS A KEY: THE CLERK HAS IT' },
      { at: [326, 37], done: ['lockgate', 326, 37, 'open'], line: 'THE BONE GATE WANTS THE KEY YOU CARRY' } ] },
  ],
  hanging: [
    { id: 'hg-hoist', zone: [0, 80, 16, 100], mover: { hoist: 'rope', well: 2 }, line: 'THE HOIST: DROP A COIL IN THE WELL, THEN STAND ON IT' },
  ],
  spire: [
    { id: 'sp-baskets', zone: [14, 126, 34, 140], mover: { cw: 'cw0' }, line: 'THE BOOK-HOIST BASKETS CARRY YOU UP' },
  ],
  stockade: [
    { id: 'sk-crank', zone: [118, 10, 141, 26], at: [138, 19], line: 'THE PALISADE HOLDS: FIND ITS CRANK' },
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
  skyroad: [
    { id: 'sk-thermal-1', zone: [27, 41, 36, 52], at: [34, 51], line: 'THE HOT AIR OVER THE ROCK IS THE WAY UP' },
    { id: 'sk-thermal-2', zone: [53, 35, 69, 50], at: [67, 49], line: 'THE RISING AIR AT THE FOOT OF THE MESA' },
    { id: 'sk-cloak', zone: [70, 20, 104, 34], steps: [
      { at: [97, 33], done: ['cloak', 97, 33, 'on'], line: "THE RIDER'S CLOAK HANGS ON ITS MAST" },
      { zone: [99, 28, 104, 34], when: ['cloak', 97, 33, 'on'], at: [118, 37], line: "LEDGE ONE IS IN A GLIDE'S REACH OVER THE GAP" } ] },   /* (FIX PASS: glide one) */
    { id: 'sk-stone-1', zone: [105, 30, 123, 46], steps: [
      { at: [120, 37], done: ['sunstone', 120, 37, 'on'], line: 'A SUN-STONE LIES FACE DOWN BY THE CHASM' },
      { zone: [116, 30, 123, 37], when: ['sunstone', 120, 37, 'on'], at: [131, 30], line: 'THE AIR OVER THE PINNACLE RISES NOW: GLIDE INTO IT' } ] },   /* (FIX PASS: into thermal four) */
    { id: 'sk-reel', zone: [134, 18, 150, 26], steps: [
      { at: [139, 25], done: ['sunstone', 139, 25, 'on'], line: "THE REEL'S STONE IS FACE DOWN: THE FLUE IS COLD" },
      { mover: { sky: 'reel' }, line: 'THE CAGE COMES DOWN TO THE DECK: STEP ON IT THERE' } ] },
    { id: 'sk-glide-roost', zone: [183, 8, 190, 13], at: [202, 19], line: "ROOST ONE IS IN A GLIDE'S REACH OFF THE DECK" },   /* (FIX PASS: deck to roost one) */
    { id: 'sk-stone-3', zone: [216, 10, 219, 18], at: [218, 17], done: ['sunstone', 218, 17, 'on'], line: 'A SUN-STONE ON THE ROOST' },
    { id: 'sk-disc', zone: [265, 8, 298, 18], steps: [
      { at: [295, 17], glint: 'stall', done: ['sundisc', 295, 17, 'on'], line: 'THE SUN-DISC AT THE BRIDGEHEAD' },
      { zone: [288, 8, 298, 18], when: ['sundisc', 295, 17, 'on'], at: [303, 20], line: 'THE ROAD OF AIR IS LIT: THE EAST TOWER IS IN REACH' } ] },   /* (FIX PASS: the disc road) */
    { id: 'sk-stone-4', zone: [346, 12, 353, 20], at: [352, 19], done: ['sunstone', 352, 19, 'on'], line: 'A SUN-STONE ON THE CRACKED SPAN' },
    { id: 'sk-stone-6', zone: [360, 10, 367, 17], at: [364, 16], done: ['sunstone', 364, 16, 'on'], line: 'A SUN-STONE ON THE SECOND SPAN' },
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
      { key: 'rood3fire', is: ['need.rood3', 'fire'], at: [163, 38], line: 'A FLAME FROM THE CRYPT: THE THIRD SCONCE' } ] },
    { id: 'lc-reliquary', zone: [180, 31, 200, 40], steps: [ { key: 'reliquary', is: ['stubs', 'due'], at: [188, 40], line: 'THE RELIQUARY: FIVE STUBS OPEN IT' } ] },
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
      { key: 'lever', rows: [4, 24.5], colGt: 49, colLt: 90, is: ['mat.lever', 'due'], ats: [[51, 21], [88, 21]], dy: -26, line: 'THE SLUICES ARE FULL: E AT A LEVER LETS THE DAM GO' } ] },
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
  kings: { fix: [{ x: 570, text: 'FIRE ARCHERS LIGHT THE GRASS. THE GATE PLATE IS ON THE LEDGE, OVER THE GUARDS.' }] },
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
  underleaf: { add: [
    { x: 118, y: 33, text: 'THE MILL. THE BRASS KEY IS IN THE LOFT.' },
    { x: 274, y: 33, text: 'THE CHURCH. THE IRON KEY IS ON THE ROOD BEAM.' } ] },
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
