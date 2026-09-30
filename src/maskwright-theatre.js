// src/maskwright-theatre.js - THE MASKWRIGHT'S THEATRE (claude/theatre, the GREYBOX: geometry, machinery, encounters, wiring). Brief:
// docs/briefs/maskwright-theatre.md. The playhouse where the fair's masks and puppets are made, gone strange at dusk: between WAYMEET and THE
// HARVEST FAIR on the road inland. Its machinery is src/theatre-rig.js (pure) and its hands are in src/main.js (theatreReset / updateTheatre /
// drawTheatre). THE PUPPETEER (the boss, a parallel lane: src/puppeteer.js) is fought on THE MAIN STAGE past the stage door at the end: this
// file leaves him the room (L.mainStage) and a door, and a gate so the level can be walked end to end without him.
//
// THE RULE: THE HOUSE IS WATCHING. A player in a mask moves only when nobody watches it (the facing rule, src/mummer.js - pre-taught here for the
// fair); a LIMELIGHT watches too, and what stands in its light cannot move; and the audience in the boxes throws at whoever stands in the light.
//
// FIVE HEIGHTS, one building seen from all of them: the GRID (row 7, the roof walk over the fly loft), the FLY FLOOR (row 16), the BOXES and the
// loading galleries (row 25/26), the STAGE (row 34) and THE UNDER-STAGE (row 44). The rehearsal stage is crossed three times: OVER it on the fly
// floor, ACROSS it in the performance (right to left), and UNDER it (left to right).
//
//   0-27     THE STAGE DOOR       TEACH facing   one masked player alone in a passage. Face it and it freezes; cut it down
//   28-64    THE COSTUME STORE    TEACH lamp     over one on the rail walk, down beside a limelight: one in its light, one coming up behind you
//   65-110   THE MASK WORKSHOP    DEVELOP lamp   three players, two lamps, a mezzanine: light the ones you cannot face
//   111-127  THE SCENE DOCK       TEACH flat     a ground row on a track: strike the winch and it slides under the sill, a step up
//   128-156  THE FLY TOWER        TEACH + DEVELOP fly   ride a batten up; call the next one down, step on, send it up. A hired sword under a sandbag
//   137-212  THE FLY FLOOR        TWIST fly      the batten is the bridge and its sandbag falls on the ones waiting across it; RIDE THE WEIGHT down
//                                               (and the GRID over it: a rope up to the roof walk and a silver)
//   158-222  THE PERFORMANCE      SET PIECE / TWIST lamp + DEVELOP flat   the curtain rises: the lamps sweep on their cues, the audience throws at
//                                               the lit, the cast freezes in the light, the traps drop, the scene-change flat opens and shuts the way
//   146-236  THE UNDER-STAGE      TWIST flat     the flat is a FLOOR: a winch slides it out over the sump. A painted shutter (the prop store, a
//                                               silver) flies on a hidden line. The STAR TRAP throws you up into the far wing
//   225-299  THE WINGS            EXAM           a lamp and the audience, a flat door, a batten up to the loading gallery with its sandbag over the
//                                               door's guard, a lamp on the gallery: all of it at once. The stage door's checkpoint
//   300-343  THE MAIN STAGE       THE PUPPETEER's (claude/puppeteer): the door, the room, and a gate (the level's end until his fight lands)
import { BAG_H } from './theatre-rig.js';

export const THEATRE = { W: 344, H: 50, GR: 8, FL: 16, BX: 25, ST: 34, UN: 44 };
/* every machine's arc (tile columns), read by tools/theatre.mjs and written up in the brief */
export const ARCS = {
  facing: { teach: [0, 27] },
  spot: { teach: [28, 64], develop: [65, 110], twist: [158, 222], exam: [225, 299] },
  fly: { teach: [128, 136], develop: [136, 156], twist: [176, 222], exam: [252, 280] },
  flat: { teach: [111, 127], develop: [158, 175], twist: [170, 196], exam: [245, 266] },
};
export const SECTIONS = [['THE STAGE DOOR', 0], ['THE COSTUME STORE', 28], ['THE MASK WORKSHOP', 65], ['THE SCENE DOCK', 111], ['THE FLY TOWER', 128], ['THE FLY FLOOR', 157],
  ['THE PERFORMANCE', 158], ['THE UNDER-STAGE', 146], ['THE WINGS', 225], ['THE MAIN STAGE', 300]];

export function buildMaskwrightTheatre({ painter, T, TS }) {
  const { W, H, GR, FL, BX, ST, UN } = THEATRE;
  const L = painter(W, H), { set, block, ent, coins } = L;
  const at = (x, y) => L.grid[y * W + x];
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x, y, n) => { for (let i = 0; i < n; i++) set(x + i, y, T.ONEWAY); };
  const spikes = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };
  const ropes = []; const rope = (x, y0, y1) => ropes.push([x, y0, y1]);   /* every rope is hung LAST, over what is carved */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const px = c => c * TS + 8, floorPx = r => r * TS;

  /* THE MACHINERY, as data for src/theatre-rig.js */
  const spots = [], lines = [], flats = [], traps = [], movers = [], rigBands = [];
  /* A LIMELIGHT at tile (x, y) - y is the row it stands in (on a floor) or hangs at (hang: on a rail). aims: [[col, floor row], ...] */
  const lamp = (x, y, aims, o = {}) => { const s = { x: px(x), y: o.hang ? y * TS + 10 : (y + 1) * TS - 24, aims: aims.map(([c, r]) => [px(c), floorPx(r)]), i: o.i || 0, r: o.r || 40, cue: o.cue || 0, show: !!o.cue };
    spots.push(s); ent('spotlamp', x, y, { spot: spots.length - 1, hang: !!o.hang }); return spots.length - 1; };
  /* A FLY LINE: the batten and its sandbag on one rope. Rows are the row each platform's TOP is at (the hero stands on the row above it).
     batten { x, w, rowIn (down), rowOut (up) }, bag { x, w, rowIn (up: the line is in), rowOut (down) }; locks [[x, y], ...]; out: how it hangs at load */
  const line = (id, batten, bag, locks, out = false) => {
    for (const [role, p] of [['batten', batten], ['bag', bag]]) { if (!p) continue;
      const off = role === 'bag' ? BAG_H : 0;   /* a sandbag's rows are the floor it rests on: its top (where you stand on it) is the sack's height over that */
      movers.push({ kind: 'fly', theatre: true, role, line: id, x: p.x * TS, w: p.w * TS, h: role === 'bag' ? BAG_H : 6, y: (out ? p.rowOut : p.rowIn) * TS - off, yIn: p.rowIn * TS - off, yOut: p.rowOut * TS - off });
      if (role === 'batten' || p.ride) rigBands.push([p.x, p.x + p.w - 1, Math.min(p.rowIn, p.rowOut) - (off ? 1 : 0), Math.max(p.rowIn, p.rowOut) - (off ? 1 : 0)]); }
    lines.push({ id, out }); for (const [x, y] of locks) ent('flylock', x, y, { line: id }); };
  /* A FLAT: a solid piece of scenery w x h on a track. axis 'x': it slides between columns a and b (its left column), rows y0..y1; axis 'y' (a
     SHUTTER, flown on a line): between rows a and b (its top row), columns x0..x0+w-1. tools: the position the grid is BUILT in (the one the
     route tools walk); init: the one the game puts it in at load. winch: [x, y] of the winch that works it (a shutter's is a rope-lock) */
  const flat = o => { flats.push(Object.assign({ axis: 'x', tools: 'B', init: 'A' }, o)); if (o.winch) ent(o.axis === 'y' ? 'flylock' : 'flatwinch', o.winch[0], o.winch[1], { flat: flats.length - 1 }); return flats.length - 1; };
  /* A STAGE TRAP: boards in the stage floor (row ST) that drop on the show's cue. A board you can press down through at any time */
  const trap = (x0, x1, cue, below) => { traps.push({ x0, x1, row: ST, cue, below }); ent('stagetrap', x0, ST - 1, { trap: traps.length - 1, w: x1 - x0 + 1 }); };

  // ================= THE SHELL: all rock, and the rooms cut out of it =================
  block(0, W - 1, 0, H - 1);

  // ---------------- 1. THE STAGE DOOR (0-27): TEACH the facing rule ----------------
  air(2, 27, 27, 33);
  sign(4, 33, "THE MASKWRIGHT'S THEATRE. THE PLAYERS ARE STILL IN THEIR MASKS, AND THE HOUSE IS WATCHING.");
  sign(8, 33, 'THE PLAYERS MOVE ONLY WHEN NOBODY WATCHES. FACE ONE AND IT STOPS. CUT IT DOWN.');
  block(12, 13, 33, 33); coins([12, 32], [13, 32]);                       /* a costume trunk left in the passage */
  foe('mummer', 20, 33, { squad: 'the stage door' });                        /* THE FIRST ONE, alone in a passage: facing it, it cannot move. Nothing else here */
  coins([17, 33], [23, 33]);
  sign(16, 33, 'BELLS: IT IS MOVING. A RED MASK: IT IS ABOUT TO STRIKE. LOOK AT IT.');
  block(23, 24, 32, 33); block(25, 27, 30, 33);                              /* the stair up to the rail walk */

  // ---------------- 2. THE COSTUME STORE (28-64): TEACH the limelight ----------------
  air(28, 64, 19, 33);
  boards(28, 29, 17);                                                        /* THE RAIL WALK over the racks: you cross it over the one below */
  foe('mummer', 34, 33, { face: 1, squad: 'the costume store' });           /* under the rail: behind you the moment you pass over it, and it follows you down */
  coins([31, 28], [35, 28], [39, 28], [43, 28]);
  deco('rack', 38, 33); deco('rack', 48, 33, { v: 1 });
  sign(46, 33, 'A LIMELIGHT. STRIKE IT AND IT SWINGS. WHATEVER STANDS IN ITS LIGHT IS SEEN, AND CANNOT MOVE.');
  lamp(52, 33, [[60, ST], [40, ST]]);                                        /* THE FIRST LAMP: on the one ahead. Strike it and it swings onto the one behind */
  foe('mummer', 60, 33, { squad: 'the costume store' });                     /* held in its light from the start: it does not move even with your back turned */
  /* THE COSTUME LOFT (a secret): a rope in the corner up to the top rack, and a silver in the hat boxes */
  boards(55, 22, 7); rope(63, 22, 33);
  ent('silver', 56, 21); coins([58, 21], [60, 21]);
  block(65, 65, 19, 29); air(65, 65, 30, 33);                                                     /* the doorway into the workshop */

  // ---------------- 3. THE MASK WORKSHOP (66-110): DEVELOP the limelight ----------------
  air(66, 110, 18, 33);
  sign(68, 33, 'THE MASK WORKSHOP. TWO LAMPS, AND MORE OF THEM THAN YOU HAVE EYES.');
  block(72, 74, 32, 33); block(75, 76, 30, 33);                              /* the benches, up to the mezzanine */
  boards(77, 28, 24);                                                        /* THE MEZZANINE: the carving floor over the benches, x 77-100 */
  block(101, 103, 31, 33);                                                   /* the glue kettles, off its far end */
  lamp(88, 27, [[82, ST], [96, ST], [98, 28]]);                              /* the carvers' lamp, on the mezzanine: onto the floor either side, or along the mezzanine */
  lamp(107, 33, [[98, ST], [85, ST]]);                                       /* the painters' lamp, on the floor at the far end */
  foe('mummer', 82, 33, { squad: 'the fitting' });                           /* THE FITTING: one held in the carvers' light, one on the floor in the dark past it, one on the mezzanine */
  foe('mummer', 95, 33, { squad: 'the fitting' });
  foe('mummer', 97, 27, { squad: 'the fitting' });
  foe('bat', 84, 20); foe('bat', 104, 21);                                   /* up in the rafters, round the lamps */
  coins([78, 27], [84, 27], [90, 27], [94, 27], [102, 30]); ent('mend', 109, 33);   /* a heart at the far door, after the fitting */
  block(111, 111, 18, 26); air(111, 111, 27, 33);                                                   /* the door into the scene dock */

  // ---------------- 4. THE SCENE DOCK (112-127): TEACH the flat ----------------
  air(112, 127, 27, 33);
  sign(119, 33, 'THE SCENE DOCK. THE FLATS RUN ON TRACKS. STRIKE THE WINCH AND ITS FLAT SLIDES TO THE END OF ITS TRACK.');
  block(123, 127, 30, 33);                                                   /* THE SILL of the fly tower's door: four rows up, one too many */
  flat({ a: 114, b: 121, w: 2, y0: 32, y1: 33, winch: [112, 33], name: 'the ground row' });   /* A GROUND ROW on its track: at the far end it is the step under the sill */
  coins([116, 31], [121, 30], [125, 28]);

  // ---------------- 5. THE FLY TOWER (128-156): TEACH + DEVELOP the fly lines ----------------
  air(128, 156, 4, 33);
  block(157, 157, FL + 1, 33); air(157, 157, 4, FL - 1);                                               /* THE FIRE WALL between the tower and the stage, under the fly floor: the stage is reached from above or not at all */
  block(128, 131, 25, 26);                                                   /* the loading gallery on the tower's wall */
  sign(129, 33, 'THE FLY LINES. STRIKE A ROPE-LOCK AND ITS LINE RUNS: THE BATTEN GOES UP IF IT WAS DOWN, AND ITS SANDBAG THE OTHER WAY.');
  line('A', { x: 132, w: 3, rowIn: 33, rowOut: 25 }, { x: 142, w: 2, rowIn: 18, rowOut: ST }, [[135, 33], [131, 24]]);   /* TAUGHT: step on, strike the lock beside it, ride up */
  line('B', { x: 137, w: 3, rowIn: 25, rowOut: FL }, { x: 152, w: 2, rowIn: 23, rowOut: ST }, [[136, 24]], true);      /* DEVELOPED: it hangs up at the fly floor. Call it down, step across, send it up */
  sign(129, 24, 'THIS ONE IS FLOWN OUT. STRIKE ITS LOCK TO CALL IT IN, STEP ON, AND STRIKE AGAIN.');
  foe('swornsword', 150, 33, { squad: 'the tower floor' });                  /* A HIRED SWORD on the tower floor, where the sandbags come down */
  foe('bat', 148, 12);
  coins([133, 31], [138, 23], [141, 18]);

  // ---------------- 6. THE FLY FLOOR (137-212) and THE GRID: TWIST the fly lines ----------------
  air(158, 222, 4, 33);                                                      /* the stage house: the fly space over the rehearsal stage and its right wing */
  block(223, 224, 4, 33);                                                    /* THE FIRE WALL between the right wing and the far wing: the far wing is reached from below */
  for (let x = 140; x <= 144; x++) set(x, FL, T.SOLID);                      /* the fly floor's near end, on the tower */
  for (let x = 155; x <= 212; x++) set(x, FL, T.SOLID);                      /* ...and across the gap, the fly floor over the stage, to the pin rail over the right wing */
  ent('check', 141, FL - 1);                                                 /* CHECKPOINT ONE: the top of the tower (the first of three) */
  /* THE GRID: the roof walk, up a rope from the fly floor's near end; a silver at the far end of it */
  boards(129, GR, 17); rope(143, GR + 1, FL - 1);
  ent('silver', 130, GR - 1); coins([134, GR - 1], [138, GR - 1]); foe('spider', 136, GR + 2);
  /* THE BRIDGE AND THE BAG: the fly floor stops over the tower (145-154 is open to the tower floor, eighteen rows down), a long batten hangs in
     under the gap, and a sandbag hangs over the far side where the fly floor's crew waits. Strike the lock: the batten flies up into the gap -
     a bridge - and its sandbag comes down on whoever stands under it. A fall is the whole tower again */
  sign(140, FL - 1, 'A BATTEN IS A BRIDGE WHEN IT IS FLOWN. AND ITS SANDBAG COMES DOWN SOMEWHERE.');
  line('D', { x: 145, w: 10, rowIn: 22, rowOut: FL }, { x: 159, w: 2, rowIn: 10, rowOut: FL }, [[144, FL - 1]]);
  foe('mummer', 160, FL - 1, { squad: 'the fly floor' });                    /* under the sandbag: face it and it stands there */
  foe('mummer', 164, FL - 1, { squad: 'the fly floor' });
  foe('swornsword', 171, FL - 1, { squad: 'the fly floor' });
  coins([148, FL - 2], [151, FL - 2], [167, FL - 2]);
  /* THE LIGHTING BRIDGE: the fly floor over the stage, the crew's lamp on it and two more of the cast waiting in its light */
  lamp(186, FL - 1, [[196, FL], [178, FL]]);
  foe('mummer', 194, FL - 1, { squad: 'the lighting bridge' }); foe('mummer', 199, FL - 1, { squad: 'the lighting bridge' }); foe('bat', 190, 9);
  coins([183, FL - 2], [203, FL - 2]);
  /* RIDE THE WEIGHT: the fly floor ends at the pin rail; the right wing is eighteen rows down. Line E's sandbag hangs level with the floor: stand on
     it, strike the lock, and the batten flies out on the stage while the weight takes you down */
  sign(208, FL - 1, 'NO BATTEN HERE, ONLY ITS WEIGHT. STAND ON THE SANDBAG AND STRIKE THE LOCK: THE WEIGHT GOES DOWN.');
  line('E', { x: 203, w: 5, rowIn: 33, rowOut: 21 }, { x: 213, w: 2, rowIn: FL, rowOut: ST, ride: true }, [[215, FL - 1], [216, 33]]);

  // ---------------- 7. THE PERFORMANCE (158-222): the SET PIECE ----------------
  /* THE STAGE: floor row ST, x 158-222 (the right wing is 213-222). The house is to the camera; the BOXES hang over the wings. When a hero sets foot
     on the stage the curtain goes up and the prompt book runs: the three lamps sweep on their cues, the scene-change flat at stage left opens and
     shuts, and the stage traps drop. The audience in the boxes throws at whoever stands in the light. The way on is the trap at stage left. */
  boards(158, BX, 5); boards(216, BX, 6);                                    /* THE BOXES: stage left and stage right */
  foe('drunk', 160, BX - 1, { footlights: true, range: 1, squad: 'the audience' });   /* THE AUDIENCE: they throw only at what is in the light */
  foe('drunk', 219, BX - 1, { footlights: true, range: 1, squad: 'the audience' });
  lamp(161, BX - 1, [[167, ST], [177, ST], [188, ST], [198, ST]], { hang: true, cue: 1.9, r: 36 });   /* the show's lamps, on their cues */
  lamp(216, BX - 1, [[206, ST], [196, ST], [186, ST], [176, ST]], { hang: true, cue: 1.6, r: 36 });
  lamp(184, FL, [[172, ST], [184, ST], [196, ST]], { hang: true, cue: 2.3, r: 40, i: 1 });
  foe('mummer', 206, 33, { squad: 'the cast' }); foe('mummer', 191, 33, { squad: 'the cast' }); foe('mummer', 173, 33, { squad: 'the cast' });   /* THE CAST */
  sign(218, 33, 'THE PERFORMANCE. THE LAMPS KEEP THEIR CUES, THE AUDIENCE THROWS AT THE LIT, AND THE WAY OFF IS THE TRAP AT STAGE LEFT.');
  /* THE SCENE CHANGE: a tall flat at stage left that runs on its cue and nothing else (no winch: the show changes its scenes whether you are ready or not).
     It stands across the way to the trap for three and a half seconds in seven, and its track glows and the prompt bell rings before it moves */
  flat({ a: 166, b: 158, w: 2, y0: 30, y1: 33, cue: { period: 7, hold: 3.5, at: 1 }, name: 'the scene change' });
  /* THE TRAPS: the way down at stage left, and two that drop into a spiked trap room each (a rope back up: a bite, never a shortcut) */
  trap(160, 163, { period: 6, open: 1.8, at: 1.5 }, 'the way down');
  trap(176, 178, { period: 5, open: 1.5, at: 0 }, 'a trap room');
  trap(199, 201, { period: 5, open: 1.5, at: 2.5 }, 'a trap room');
  coins([210, 32], [196, 32], [182, 32], [168, 32]);

  // ---------------- 8. THE UNDER-STAGE (146-236): TWIST the flat, the prop store, the star trap ----------------
  air(158, 236, 36, 43);
  for (const tr of traps) { for (let x = tr.x0; x <= tr.x1; x++) { set(x, ST, T.ONEWAY); set(x, ST + 1, T.AIR); }
    if (tr.below === 'a trap room') { block(tr.x0 - 1, tr.x0 - 1, 36, 40); block(tr.x1 + 1, tr.x1 + 1, 36, 40); block(tr.x0, tr.x1, 40, 40); spikes(tr.x0, tr.x1, 39); rope(tr.x0 + 1, ST + 1, 38); } }   /* A TRAP ROOM: a walled shaft over the under-stage's passage, spikes in it and a rope out */
  ent('check', 167, UN - 1);                                                 /* CHECKPOINT TWO: under the stage, after the performance */
  sign(169, UN - 1, 'THE UNDER-STAGE. THE SUMP IS TOO WIDE TO JUMP. THE FLAT IN THE FLOOR IS ON A TRACK.');
  /* THE SUMP, and THE FLAT THAT IS A FLOOR: a slab of the under-stage floor on a track; the winch slides it out over the spikes */
  air(182, 192, UN, UN + 1); spikes(182, 192, UN + 2);
  air(175, 181, UN, UN);                                                     /* (its slot: the flat stands in it at load) */
  flat({ a: 175, b: 184, w: 7, y0: UN, y1: UN, winch: [172, UN - 1], name: 'the floor flat' });
  foe('spider', 190, 37); foe('mummer', 197, UN - 1, { squad: 'the understudies' }); foe('mummer', 208, UN - 1, { squad: 'the understudies' }); foe('swornsword', 214, UN - 1, { squad: 'the understudies' });
  coins([185, UN - 2], [188, UN - 2], [200, UN - 1], [212, UN - 1]);
  /* THE PROP STORE (a secret): under the tower floor, behind a painted shutter on a hidden line (its lock is low in the dark corner) */
  air(146, 155, 38, 43); air(156, 157, 40, 43);
  flat({ a: 40, b: 36, axis: 'y', x0: 156, w: 2, h: 4, winch: [159, UN - 1], name: 'the prop store shutter' });
  ent('silver', 148, UN - 1); coins([150, UN - 1], [152, UN - 1], [154, UN - 1]); ent('mend', 147, UN - 1);
  deco('props', 151, UN - 1);
  /* THE STAR TRAP: a spring on a pedestal under a hole in the far wing's floor. Hold jump */
  block(222, 223, 42, 43); block(224, 225, 41, 43); block(226, 230, 39, 43); for (let x = 228; x <= 230; x++) set(x, 39, T.BOUNCER); ent('startrap', 229, 38);   /* two steps up to the pedestal, the spring on it */
  air(228, 230, ST, ST + 1);
  sign(222, UN - 1, 'THE STAR TRAP. STAND ON IT AND HOLD JUMP: IT THROWS YOU UP THROUGH THE STAGE.');
  foe('spider', 232, 37);

  // ---------------- 9. THE WINGS (225-299): the EXAM ----------------
  air(225, 299, 12, 33);
  sign(231, 33, 'THE FAR WING. THE LAMP, THE FLAT, THE LINE AND THE AUDIENCE: ALL OF IT, TO THE STAGE DOOR.');
  /* the lamp and the prompt box over it: light the one ahead, not yourself */
  lamp(234, 33, [[242, ST], [229, ST]]);
  boards(236, BX, 6); foe('drunk', 239, BX - 1, { footlights: true, range: 1, squad: 'the prompt box' });
  foe('mummer', 244, 33, { squad: 'the prompt box' });
  /* the flat door: it blocks the floor at A; at B it blocks the floor past the batten, and the batten is the way on */
  flat({ a: 249, b: 262, w: 2, y0: 29, y1: 33, winch: [246, 33], name: 'the wing flat' });
  /* the line up to the loading gallery, and its sandbag over the stage door's guard */
  line('G', { x: 254, w: 3, rowIn: 33, rowOut: 26 }, { x: 272, w: 2, rowIn: 17, rowOut: ST }, [[253, 33], [257, 25]]);
  boards(257, 26, 35);                                                       /* THE LOADING GALLERY: boards, so the gallery lamp shines through them */
  lamp(268, 20, [[262, ST], [274, ST], [283, 26]], { hang: true });           /* the gallery lamp: onto the floor, or along the gallery */
  foe('swornsword', 273, 33, { squad: 'the stage door' }); foe('mummer', 279, 33, { squad: 'the stage door' });   /* THE STAGE DOOR'S GUARD, under the sandbag */
  foe('mummer', 285, 25, { squad: 'the gallery' }); foe('drunk', 290, 25, { footlights: true, range: 1, squad: 'the gallery' });
  block(292, 293, 30, 33); block(294, 295, 32, 33);                          /* the stair down off the gallery's end (a drop, then two steps) */
  coins([258, 24], [264, 24], [276, 24], [288, 24]); ent('mend', 296, 33);
  ent('check', 297, 33);                                                     /* CHECKPOINT THREE: the stage door */
  sign(298, 33, "THE MAIN STAGE. HE WORKS THEM FROM THE FLIES.");

  // ---------------- 10. THE MAIN STAGE (300-343): THE PUPPETEER's room (claude/puppeteer builds his fight in it) ----------------
  block(300, 300, 4, 29); air(300, 300, 30, 33);                             /* the stage door: a doorway under the lintel */
  air(301, 342, 4, 33);
  for (let x = 304; x <= 339; x++) set(x, FL, T.ONEWAY);                     /* the main stage's own fly floor, where he works from (a greybox guess the boss lane may change) */
  ent('gate', 303, 33);                                                      /* the level's end until his fight lands: just inside the door (claude/puppeteer moves it past his room) */

  // ================= THE FLATS: what is under each track, then the flat in the position the tools walk =================
  for (const f of flats) {
    if (f.axis === 'y') { f.y0 = f.a; f.x1 = f.x0 + f.w - 1; }
    const cells = []; const lo = f.axis === 'y' ? Math.min(f.a, f.b) : Math.min(f.a, f.b), hi = f.axis === 'y' ? Math.max(f.a, f.b) + f.h - 1 : Math.max(f.a, f.b) + f.w - 1;
    if (f.axis === 'y') { for (let y = lo; y <= hi; y++) for (let x = f.x0; x <= f.x1; x++) cells.push([x, y, at(x, y)]); }
    else for (let y = f.y0; y <= f.y1; y++) for (let x = lo; x <= hi; x++) cells.push([x, y, at(x, y)]);
    f.base = cells;
    const pos = f.tools === 'A' ? f.a : f.b;
    if (f.axis === 'y') { for (let y = pos; y < pos + f.h; y++) for (let x = f.x0; x <= f.x1; x++) set(x, y, T.SOLID); }
    else for (let y = f.y0; y <= f.y1; y++) for (let x = pos; x < pos + f.w; x++) set(x, y, T.SOLID);
  }
  /* THE ROPES, LAST: nothing is cut or laid after this line */
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  const dark = (x0, x1, y0, y1, d) => ({ x0: x0 * TS, x1: (x1 + 1) * TS, y0: y0 * TS, y1: (y1 + 1) * TS, dark: d });
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 33 }, pools: [], falls: [], moversExtra: movers,
    interiors: [[2, 27, 27, 33, 'thPassage'], [28, 64, 19, 33, 'thCostume'], [66, 110, 18, 33, 'thWorkshop'], [112, 127, 27, 33, 'thDock'], [128, 156, 4, 33, 'thFly'],
      [158, 222, 4, 33, 'thStage'], [146, 236, 36, 43, 'thUnder'], [225, 299, 12, 33, 'thWings'], [301, 342, 4, 33, 'thMain']],
    theatre: { spots, lines, flats, traps, arcs: ARCS, sections: SECTIONS,
      show: { x0: 158 * TS, x1: 223 * TS, y0: 17 * TS, y1: ST * TS, curtain: [158, 212, 17, 33] } },
    rigBands,   /* THE FLY LINES, for the reach model (src/reachcore.js): a band of footing from each platform's high stop to its low one */
    mainStage: { door: 300, x0: 301, x1: 342, floor: ST, fly: FL },   /* THE PUPPETEER's room (claude/puppeteer): the arena goes here */
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,   /* three checkpoints on a 520-tile route (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    music: 'theatre', dark: 0, night: true, nightA: 0.18, duskStart: 99999, duskLen: 1,
    darkZones: [dark(146, 236, 34, 49, 0.62), dark(158, 222, 17, 33, 0.42), dark(28, 110, 18, 33, 0.22), dark(225, 299, 12, 33, 0.3)],
    palette: { sky: 'dusk', far: 'town', mid: 'town', near: 'town', dress: 'village', darkCol: '14,8,20', haze: 'rgba(120,70,90,0.10)',
      grass: '#5a4a52', grassL: '#7a6470', grassD: '#3a2e36', dirt: '#4a3a34', dirtL: '#6a5448', dirtD: '#2e241e', canopy: ['#1a1220', '#2a1a2e', '#3a2440', '#4a3050'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'hall' }],
  };
}
