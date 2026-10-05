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
export const STUCK = {
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
    { id: 'ub-ballista-418', zone: [410, 24, 432, 37], at: [418, 36], done: ['ballista', 418, 36, 'fired'], line: 'THE BALLISTA BY THE ARENA DOOR IS STILL LOADED' },
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
  ],
  /* THE UNDERWELL (claude/underwell): every nest, oil fire, torch and rope the route needs glints until it is done (src/underwell-hands.js handsState:
     nest.<id> shut|open, fire.<col> lit|out, torch.<id> up|fall|down, rope.<id> hung|burnt, lamp up|fall|down, skin some|empty) */
  underwell: [
    { id: 'uw-shaft-nest', zone: [12, 36, 20, 44], steps: [
      { key: 'shaftTorch', is: ['nest.shaft', 'shut'], at: [17, 41], dy: -4, line: 'THE NEST SEALS THE TUNNEL. A TORCH HANGS OVER THE OIL' } ] },
    { id: 'uw-shaft-fire', zone: [22, 36, 32, 44], steps: [
      { key: 'shaftDrip', is: ['skin', 'empty'], at: [26, 43], line: 'THE DRIP BY THE WALL: A SIP OF WATER' },
      { key: 'shaftFire', is: ['fire.33', 'lit'], at: [33, 43], line: 'AN OLD OIL FIRE ACROSS THE TUNNEL' } ] },
    { id: 'uw-hall-lamp', zone: [60, 24, 96, 43], steps: [
      { key: 'lamp', is: ['lamp', 'up'], at: [87, 31], glint: 'stall', line: 'THE GREAT LAMP HANGS OVER THE OIL ON ITS CHAIN' } ] },
    { id: 'uw-hall-nest', zone: [97, 24, 133, 44], steps: [
      { key: 'hallTorch', is: ['nest.hall', 'shut'], at: [124, 41], dy: -4, line: 'A NEST AT THE BACK OF THE CHAMBER, A TORCH OVER ITS OIL' } ] },
    { id: 'uw-works-low', zone: [141, 32, 215, 44], steps: [
      { key: 'worksTorch', is: ['torch.works', 'up'], rows: [38, 44], at: [176, 41], glint: 'stall', dy: -4, line: 'A WALL TORCH OVER THE OIL, PAST THE ROPE' },
      { key: 'worksRope', is: ['rope.works', 'hung'], at: [160, 40], glint: 'stall', line: 'THE ROPE IS THE WAY UP' },
      { key: 'worksBack', is: ['rope.works', 'burnt'], at: [211, 40], line: 'THE ROPE IS ASH: THE SCAFFOLDS ON THE EAST WALL' } ] },
    { id: 'uw-works-up', zone: [157, 22, 239, 29], steps: [
      { key: 'worksFire', is: ['fire.228', 'lit'], at: [228, 29], line: 'AN OLD OIL FIRE ACROSS THE WAY EAST' } ] },
    { id: 'uw-gutter', zone: [244, 36, 262, 45], steps: [
      { key: 'gutterTorch', is: ['torch.gutter', 'up'], at: [257, 43], dy: -4, line: 'THE TORCH AT THE MOUTH OF THE OLD GUTTER' } ] },
    { id: 'uw-exam', zone: [346, 28, 399, 42], steps: [
      { key: 'examTorch', is: ['nest.exam', 'shut'], at: [359, 40], dy: -4, line: 'A NEST UNDER THE STAIR, AND A TORCH OVER THE OIL' } ] },
    { id: 'uw-exam-fires', zone: [400, 36, 430, 42], steps: [
      { key: 'examFire1', is: ['fire.420', 'lit'], at: [420, 42], line: 'AN OLD OIL FIRE ACROSS THE WAY' },
      { key: 'examFire2', is: ['fire.426', 'lit'], at: [426, 42], line: 'A SECOND OIL FIRE BEHIND THE FIRST' } ] },
    { id: 'uw-shaft', zone: [439, 28, 478, 33], steps: [
      { key: 'queenShaft', at: [471, 33], glint: 'stall', line: 'THE OLD SHAFT GOES DOWN TO HER CISTERN' } ] },
  ],
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
