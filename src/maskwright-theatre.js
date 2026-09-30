// src/maskwright-theatre.js - THE MASKWRIGHT'S THEATRE (claude/theatre, the GREYBOX: geometry, machinery, encounters, wiring). Brief:
// docs/briefs/maskwright-theatre.md. The playhouse where the fair's masks and puppets are made, gone strange at dusk: between WAYMEET and THE
// HARVEST FAIR on the road inland. Its machinery is src/theatre-rig.js (pure) and its hands are in src/main.js (theatreReset / updateTheatre /
// drawTheatre). THE PUPPETEER (the boss, a parallel lane: claude/puppeteer, in a module of its own) is fought on THE MAIN STAGE past the stage door at the end: this
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
  facing: { teach: [18, 38] },   /* (THEATRE2: in THE HOUSE, on the dress circle - not shifted) */
  spot: { teach: [28, 64], develop: [65, 110], twist: [158, 222], exam: [225, 299] },
  fly: { teach: [128, 136], develop: [136, 156], twist: [176, 222], exam: [252, 280] },
  flat: { teach: [111, 127], develop: [158, 175], twist: [170, 196], exam: [245, 266] },
};
export const SECTIONS = [['THE STAGE DOOR', 0], ['THE COSTUME STORE', 28], ['THE MASK WORKSHOP', 65], ['THE SCENE DOCK', 111], ['THE FLY TOWER', 128], ['THE FLY FLOOR', 157],
  ['THE PERFORMANCE', 158], ['THE UNDER-STAGE', 146], ['THE WINGS', 225], ['THE MAIN STAGE', 300]];

function buildBackstage({ painter, T, TS }) {
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
  const spots = [], lines = [], flats = [], traps = [], movers = [], rigBands = [], choruses = [], mirrors = [];
  /* A LIMELIGHT at tile (x, y) - y is the row it stands in (on a floor) or hangs at (hang: on a rail). aims: [[col, floor row], ...] */
  const lamp = (x, y, aims, o = {}) => { const s = { x: px(x), y: o.hang ? y * TS + 10 : (y + 1) * TS - 24, aims: aims.map(([c, r]) => [px(c), floorPx(r)]), i: o.i || 0, r: o.r || 40, cue: o.cue || 0, show: !!o.cue && !o.always, always: !!o.always };   /* always: a cued lamp that runs whether or not the show has started */
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
  /* (THEATRE2: a HOUSE section - stalls, a balcony, the pit - may be grown in at the very front; everything from here on would slide right by grow().) */
  air(2, 64, 27, 33);                                                        /* the stage-door passage and, past it, the costume store's floor */
  sign(4, 33, 'THE STAGE DOOR. THE PLAYERS ARE STILL IN THEIR MASKS.');
  block(12, 13, 33, 33); coins([12, 32], [13, 32]);                       /* a costume trunk left in the passage */
  foe('mummer', 20, 33, { squad: 'the stage door' });                        /* THE FIRST ONE, alone in a passage: facing it, it cannot move. Nothing else here */
  coins([17, 33], [23, 33]);
  block(24, 25, 32, 33);                                                     /* a hamper to hop */
  ent('check', 14, 33);                                                      /* CHECKPOINT ONE (THEATRE2): the stage door, through the pass door from the house */

  // ---------------- 2. THE COSTUME STORE (28-59) and THE DRESSING ROOMS over it (34-88): TEACH, then the lamp as a LOCK ----------------
  /* THEATRE2: no longer a corridor. The store is the ground floor; the dressing rooms run over it and over the workshop (rows 19-24 on a slab at
     rows 25-26). The store ends at the racks: the only way on is the ROPE through the hatch, up into the dressing rooms, and the way out of them is
     the DROP into the workshop at their far end. */
  air(34, 88, 19, 24);                                                       /* the dressing rooms (the slab under them is the store's ceiling) */
  block(60, 64, 27, 33);                                                     /* THE RACKS: the store stops here */
  sign(36, 33, 'A LIMELIGHT. WHATEVER STANDS IN ITS LIGHT IS SEEN, AND CANNOT MOVE.');
  /* THE TEACH, one lamp and one player: it stands in the pool beside the rope, held, so the climb (your back to it) is safe. Strike the lamp and it is not */
  lamp(44, 33, [[54, ST], [33, ST]]);
  foe('mummer', 54, 33, { squad: 'the costume store' });
  foe('bat', 41, 28);                                                        /* a bat under the slab: bats go to the light (and to whoever stands in it) */
  deco('rack', 38, 33); deco('rack', 50, 33, { v: 1 });
  air(57, 58, 25, 26); rope(58, 25, 33);                                     /* THE HATCH and its rope: the one way up */
  coins([47, 32], [51, 32], [58, 28]);
  /* LOCK ONE - THE CHORUS: the wardrobe at the dressing rooms' far left keeps sending players out after you (one every two seconds while you are in
     the rooms, never more than three about). A lamp swung onto the wardrobe door holds the next one IN the doorway, and a doorway with a player
     frozen in it lets no more out. The way on is the quick-change door, a flown shutter that takes its time */
  deco('wardrobe', 35, 24);
  lamp(48, 24, [[62, 25], [36, 25]]);                                        /* the dressers' lamp: at first on the floor ahead of you, which helps nobody */
  choruses.push({ x: 36, y: 24, every: 2.2, max: 3, squad: 'the chorus' });
  flat({ axis: 'y', a: 19, b: 13, x0: 70, w: 1, h: 6, winch: [68, 24], step: 0.22, name: 'the quick-change door' });
  /* THE MIRROR ROOM (THEATRE2, Daniel's pick C): past the quick-change door the dressing room is lined with mirrors, and a player the mirrors show you is
     WATCHED - whichever way you face, while you are in the room with it. The dresser at the mirrors cannot move while you are in here; nor can whatever
     followed you in. Leave the room (the drop at its end) and the mirrors watch nobody */
  mirrors.push({ x0: 71, x1: 88, y: 24 });
  sign(72, 24, 'THE MIRRORS SEE BEHIND YOU.');
  foe('mummer', 80, 24, { squad: 'the dressers' });
  deco('mirror', 76, 24); deco('mirror', 84, 24, { v: 1 });
  coins([52, 23], [62, 23], [74, 23], [86, 23]);

  // ---------------- 3. THE MASK WORKSHOP (65-110): LOCK TWO, and down to the dock ----------------
  /* LOCK TWO - THE FITTING: the dressing rooms end in a drop into the workshop, and two players wait below, one either side of where you land -
     too close to turn to both. The carvers' lamp hangs over the drop: swing it onto one from above BEFORE you go down, face the other, cut it */
  air(65, 88, 27, 33); air(89, 110, 18, 33);                                 /* the low workshop under the rooms, and the tall one past their end */
  lamp(90, 25, [[91, ST], [86, ST], [95, ST]], { hang: true });              /* at first on the landing itself */
  foe('mummer', 86, 33, { squad: 'the fitting' }); foe('mummer', 95, 33, { squad: 'the fitting' });
  foe('bat', 100, 19); foe('haunt', 104, 26, { squad: 'the workshop' });   /* a carving knife nobody is holding */
  block(100, 102, 32, 33); coins([101, 30], [104, 32], [107, 32]); ent('mend', 109, 33);
  /* THE GLUE STORE (a secret): the low workshop's dead end, back under the rooms past the fitting */
  ent('silver', 67, 33); coins([70, 33], [73, 33]); deco('props', 72, 33);
  block(111, 111, 18, 26); air(111, 111, 27, 33);                            /* the door into the scene dock */

  // ---------------- 4. THE SCENE DOCK (112-127): TEACH the flat ----------------
  air(112, 127, 27, 33);
  sign(119, 33, 'THE FLATS RUN ON TRACKS. STRIKE A WINCH AND ITS FLAT SLIDES TO THE OTHER END.');
  block(123, 127, 30, 33);                                                   /* THE SILL of the fly tower's door: four rows up, one too many */
  flat({ a: 114, b: 121, w: 2, y0: 32, y1: 33, winch: [112, 33], name: 'the ground row' });   /* A GROUND ROW on its track: at the far end it is the step under the sill */
  coins([116, 31], [121, 30], [125, 28]);

  // ---------------- 5. THE FLY TOWER (128-156): TEACH + DEVELOP the fly lines ----------------
  air(128, 156, 4, 33);
  block(157, 157, FL + 1, 33); air(157, 157, 4, FL - 1);                                               /* THE FIRE WALL between the tower and the stage, under the fly floor: the stage is reached from above or not at all */
  block(128, 131, 25, 26);                                                   /* the loading gallery on the tower's wall */
  sign(129, 33, 'STRIKE A ROPE-LOCK AND ITS LINE RUNS: THE BATTEN ONE WAY, ITS SANDBAG THE OTHER.');
  line('A', { x: 132, w: 3, rowIn: 33, rowOut: 25 }, { x: 142, w: 2, rowIn: 18, rowOut: ST }, [[135, 33], [131, 24]]);   /* TAUGHT: step on, strike the lock beside it, ride up */
  line('B', { x: 137, w: 3, rowIn: 25, rowOut: FL }, { x: 152, w: 2, rowIn: 23, rowOut: ST }, [[136, 24]], true);      /* DEVELOPED: it hangs up at the fly floor. Call it down, step across, send it up */
  foe('stagehand', 140, 33, { squad: 'the tower floor' });                   /* THE TOWER'S CREW: a stagehand on the tower floor - and when you ride up over him, he hauls a line on you */
  spikes(145, 156, 33);                                                      /* THE WELL under the fly floor's gap: scenery nails and broken flats. A fall from the bridge is a bite and the whole tower again */
  foe('bat', 148, 12);
  coins([133, 31], [138, 23], [141, 18]);

  // ---------------- 6. THE FLY FLOOR (137-212) and THE GRID: TWIST the fly lines ----------------
  air(158, 222, 4, 33);                                                      /* the stage house: the fly space over the rehearsal stage and its right wing */
  block(223, 224, 4, 33);                                                    /* THE FIRE WALL between the right wing and the far wing: the far wing is reached from below */
  for (let x = 140; x <= 144; x++) set(x, FL, T.SOLID);                      /* the fly floor's near end, on the tower */
  for (let x = 155; x <= 212; x++) set(x, FL, T.SOLID);                      /* ...and across the gap, the fly floor over the stage, to the pin rail over the right wing */
  ent('check', 141, FL - 1);                                                 /* CHECKPOINT TWO: the top of the tower */
  /* THE GRID: the roof walk, up a rope from the fly floor's near end; a silver at the far end of it */
  boards(129, GR, 17); rope(143, GR + 1, FL - 1);
  ent('silver', 130, GR - 1); coins([134, GR - 1], [138, GR - 1]); foe('spider', 136, GR + 2);
  /* THE BRIDGE AND THE BAG: the fly floor stops over the tower (145-154 is open to the tower floor, eighteen rows down), a long batten hangs in
     under the gap, and a sandbag hangs over the far side where the fly floor's crew waits. Strike the lock: the batten flies up into the gap -
     a bridge - and its sandbag comes down on whoever stands under it. A fall is the whole tower again */
  line('D', { x: 145, w: 10, rowIn: 22, rowOut: FL }, { x: 159, w: 2, rowIn: 10, rowOut: FL }, [[144, FL - 1]]);
  foe('mummer', 160, FL - 1, { squad: 'the fly floor' });                    /* under the sandbag: face it and it stands there */
  foe('swornsword', 171, FL - 1, { squad: 'the fly floor' });
  coins([148, FL - 2], [151, FL - 2], [167, FL - 2]);
  /* THE LIGHTING BRIDGE: the fly floor over the stage, the crew's lamp on it and two more of the cast waiting in its light */
  lamp(186, FL - 1, [[196, FL], [178, FL]]);
  foe('mummer', 194, FL - 1, { squad: 'the lighting bridge' }); foe('stagehand', 199, FL - 1, { squad: 'the lighting bridge' });   /* one of the cast held in the crew's lamp, and the crewman who works it */ foe('bat', 190, 9);
  coins([183, FL - 2], [203, FL - 2]);
  /* RIDE THE WEIGHT: the fly floor ends at the pin rail; the right wing is eighteen rows down. Line E's sandbag hangs level with the floor: stand on
     it, strike the lock, and the batten flies out on the stage while the weight takes you down */
  line('E', { x: 203, w: 5, rowIn: 33, rowOut: 21 }, { x: 213, w: 2, rowIn: FL, rowOut: ST, ride: true }, [[215, FL - 1], [216, 33]]);

  // ---------------- 7. THE PERFORMANCE (158-222): the SET PIECE ----------------
  /* THE STAGE: floor row ST, x 158-222 (the right wing is 213-222). The house is to the camera; the BOXES hang over the wings. When a hero sets foot
     on the stage the curtain goes up and the prompt book runs: the three lamps sweep on their cues, the scene-change flat at stage left opens and
     shuts, and the stage traps drop. The audience in the boxes throws at whoever stands in the light. The way on is the trap at stage left. */
  boards(158, BX, 5); boards(216, BX, 6);                                    /* THE BOXES: stage left and stage right */
  rope(163, BX, 33); rope(222, BX, 33);                                      /* THEATRE2: a rope up into each box - the audience and its lamps can be reached (a box lamp struck comes off its cue) */
  ent('cuelever', 220, 33);                                                  /* THE PROMPT DESK: strike it and the show's lamps hold where they are; strike it again and they take their cues */
  foe('drunk', 160, BX - 1, { footlights: true, range: 1, squad: 'the audience' });   /* THE AUDIENCE: they throw only at what is in the light */
  foe('drunk', 219, BX - 1, { footlights: true, range: 1, squad: 'the audience' });
  lamp(161, BX - 1, [[167, ST], [177, ST], [188, ST], [198, ST]], { hang: true, cue: 1.9, r: 36 });   /* the show's lamps, on their cues */
  lamp(216, BX - 1, [[206, ST], [196, ST], [186, ST], [176, ST]], { hang: true, cue: 1.6, r: 36 });
  lamp(184, FL, [[172, ST], [184, ST], [196, ST]], { hang: true, cue: 2.3, r: 40, i: 1 });
  foe('mummer', 206, 33, { squad: 'the cast', cast: true }); foe('mummer', 191, 33, { squad: 'the cast', cast: true }); foe('mummer', 173, 33, { squad: 'the cast', cast: true });   /* THE CAST */
  sign(218, 33, 'BEGINNERS, PLEASE.');
  /* THE SCENE CHANGE: a tall flat at stage left that runs on its cue and nothing else (no winch: the show changes its scenes whether you are ready or not).
     It stands across the way to the trap for three and a half seconds in seven, and its track glows and the prompt bell rings before it moves */
  flat({ axis: 'y', x0: 165, w: 2, h: 4, a: 30, b: 25, step: 0.12, cue: { period: 7, hold: 3.5, at: 1 }, acts: { 2: 'A', 3: 'B' }, name: 'the scene change' });   /* ACT II: it stays DOWN (a wall); ACT III: UP (the way off) */
  /* THE CLOTH (THEATRE2, the acts): a painted cloth that flies in for ACT II as a platform - over the scene flat that is a wall in that act */
  flat({ axis: 'y', x0: 167, w: 8, h: 1, a: 20, b: 31, step: 0.1, acts: { 1: 'A', 2: 'B', 3: 'A' }, tools: 'A', name: 'the cloth' });   /* (THEATRE2: FLOWN in and out, so the rope into the stage-left box hangs clear) */
  /* THE TRAPS: the way down at stage left, and two that drop into a spiked trap room each (a rope back up: a bite, never a shortcut) */
  trap(160, 163, { period: 6, open: 1.8, at: 1.5 }, 'the way down'); traps[traps.length - 1].act3open = true;   /* ACT III: it stays open */
  trap(176, 178, { period: 5, open: 1.5, at: 0 }, 'a trap room');
  trap(199, 201, { period: 5, open: 1.5, at: 2.5 }, 'a trap room');
  coins([210, 32], [196, 32], [182, 32], [168, 32]);

  // ---------------- 8. THE UNDER-STAGE (146-236): TWIST the flat, the prop store, the star trap ----------------
  air(158, 236, 36, 43);
  for (const tr of traps) { for (let x = tr.x0; x <= tr.x1; x++) { set(x, ST, T.ONEWAY); set(x, ST + 1, T.AIR); }
    if (tr.below === 'a trap room') { block(tr.x0 - 1, tr.x0 - 1, 36, 40); block(tr.x1 + 1, tr.x1 + 1, 36, 40); block(tr.x0, tr.x1, 40, 40); spikes(tr.x0, tr.x1, 39); rope(tr.x0 + 1, ST + 1, 38); } }   /* A TRAP ROOM: a walled shaft over the under-stage's passage, spikes in it and a rope out */
  ent('check', 167, UN - 1);                                                 /* CHECKPOINT THREE: under the stage, after the performance */
  /* THE SUMP, and THE FLAT THAT IS A FLOOR: a slab of the under-stage floor on a track that runs out over the spikes and back on a cue of its own
     (THEATRE2: no winch - you cross while it is out, and an understudy stands on it when it goes back) */
  air(182, 192, UN, UN + 1); spikes(182, 192, UN + 2);
  air(175, 181, UN, UN);                                                     /* (its slot: the flat stands in it at load) */
  flat({ a: 175, b: 184, w: 7, y0: UN, y1: UN, init: 'B', cue: { period: 7, hold: 3.5, at: 0, always: true }, name: 'the floor flat' });
  foe('mummer', 187, UN - 1, { squad: 'the understudies' });                 /* standing on the flat: when it slides home he goes into the sump */
  foe('spider', 190, 37); foe('mummer', 197, UN - 1, { squad: 'the understudies' }); foe('bat', 206, 37); foe('swornsword', 214, UN - 1, { squad: 'the understudies' });
  coins([185, UN - 2], [188, UN - 2], [200, UN - 1], [212, UN - 1]);
  /* THE PROP STORE (a secret): under the tower floor, behind a painted shutter on a hidden line (its lock is low in the dark corner) */
  air(146, 155, 38, 43); air(156, 157, 40, 43);
  flat({ a: 40, b: 36, axis: 'y', x0: 156, w: 2, h: 4, winch: [159, UN - 1], name: 'the prop store shutter' });
  ent('silver', 148, UN - 1); coins([150, UN - 1], [152, UN - 1], [154, UN - 1]); ent('mend', 147, UN - 1);
  foe('haunt', 151, 40, { squad: 'the prop store' });                         /* a prop that will not stay put: the store's guard */
  deco('props', 151, UN - 1);
  /* THE STAR TRAP: a spring on a pedestal under a hole in the far wing's floor. Hold jump */
  block(222, 223, 42, 43); block(224, 225, 41, 43); block(226, 230, 39, 43); block(231, 232, 41, 43); for (let x = 228; x <= 230; x++) set(x, 39, T.BOUNCER); ent('startrap', 229, 38);   /* two steps up to the pedestal, the spring on it */
  air(228, 230, ST, ST + 1);
  sign(222, UN - 1, 'A STAR TRAP. HOLD JUMP.');
  foe('spider', 232, 37);

  // ---------------- 9. THE WINGS (225-299): the EXAM - all of it at once ----------------
  /* THEATRE2: one problem, not a queue. The prompt box (the audience) throws at whatever is lit. Its floor lamp starts on the winch spot (on YOU);
     swing it onto the player waiting under the box and you are in the dark. The flat door stands across the floor; while it is shut it also SHADOWS the
     winch spot from the fly-rail lamp (a cued follow spot, always running). Open it and that lamp reaches you on its cue - move. Past the flat, batten
     G up to the loading gallery; the door guard waits below it, and his sandbag is on its own lock: LURE him under it */
  air(225, 299, 12, 33);
  boards(239, BX, 6); rope(238, BX, 29); foe('drunk', 242, BX - 1, { footlights: true, range: 1, squad: 'the prompt box' });   /* THE PROMPT BOX, a rope up to it */
  lamp(236, 33, [[241, ST], [244, ST]], { i: 1 });                           /* the floor lamp: on the winch spot (you) - or on him */
  foe('mummer', 241, 33, { squad: 'the far wing' });
  flat({ a: 248, b: 258, w: 2, y0: 27, y1: 33, winch: [245, 33], name: 'the wing flat' });
  lamp(256, 20, [[244, ST], [252, ST]], { hang: true, cue: 2.2, always: true });   /* THE FOLLOW SPOT on the fly rail: the flat at A shadows its first aim */
  line('G', { x: 251, w: 3, rowIn: 33, rowOut: 26 }, { x: 268, w: 2, rowIn: 17, rowOut: ST }, [[250, 33], [254, 25]]);
  boards(254, 26, 38);                                                       /* THE LOADING GALLERY: boards, so the follow spot shines through them */
  foe('mummer', 268, 33, { squad: 'the gallery floor' });                    /* under batten G's sandbag: it lands on him when you ride up */
  /* THE DOOR GUARD, the level's ELITE: the stage door is shut over its doorway until he is down. A sandbag hangs on its own line at 282, off where he
     stands: its locks are on the floor and on the gallery. Bring him under it */
  line('H', null, { x: 282, w: 2, rowIn: 18, rowOut: ST }, [[279, 33], [280, 25]]);
  foe('swornsword', 287, 33, { squad: 'the door guard', elite: true, gate: 300 });
  foe('mummer', 274, 25, { squad: 'the gallery' }); foe('bat', 286, 18);
  block(290, 291, 32, 33); block(292, 293, 30, 33); block(294, 295, 32, 33);   /* the stair off the gallery's end, and up to it from the wing floor (never a pocket) */
  coins([258, 24], [264, 24], [276, 24], [288, 24]); ent('mend', 296, 33);
  ent('check', 297, 33);                                                     /* CHECKPOINT FOUR: the main stage's door */
  sign(298, 33, "THE MAIN STAGE. HE WORKS THEM FROM THE FLIES.");

  // ---------------- 10. THE MAIN STAGE (300-343): THE PUPPETEER's room - A HOOK, NOT A FIGHT (claude/puppeteer wires him in at the merge) ----------------
  /* >>> THE PUPPETEER'S STAGE GOES HERE. (THEATRE2: THE HOUSE is grown in at the front, so in the BUILT level every column below is +HOUSE (72): his
     stage's west wall is column 372, and the call is made in buildMaskwrightTheatre, after the shift, as stagePuppeteer({ set, block, plat, ent }, T, TS, 372, ST)
     on the built level's painter - L.mainStage.stageX says 372.) Backstage columns, as written here: 300-339 (his 40-column stage, west wall on the stage door's column), rows
     R-16..R+1 = 18-35 over the floor row R = ST = 34, and row R+2 = 36 SOLID under the whole stage (PUPPETEER2, 82c60e6: the floor of his trapdoor pits - it is rock here, keep it). The call (claude/puppeteer at e13f1b1, its stagePuppeteer, imported from its own module):
         const P = stagePuppeteer({ set, block, plat: boards, ent }, T, TS, 300, ST);   // lays the walls, the grid, the boards, the gallery, him and his two puppets
         movers.push(...P.movers);                                                     // the batten lift, into moversExtra
     and in the return: arena: P.arena, gateAfterBoss: true, and the gate below moved to (341, 33) here (413 built), past his east wall (his west door is this door).
     His track stays 'puppeteer' (arena.music); the level's stays 'theatre'. Until then the room is empty and the gate stands just inside the door. <<< */
  block(300, 300, 4, 29); air(300, 300, 30, 33);                             /* the stage door: a doorway under the lintel (his west wall and door when he lands) */
  air(301, 342, 4, 33);
  ent('gate', 303, 33);                                                      /* the level's end until his fight lands: just inside the door (then 341, past his east wall) */

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
    theatre: { spots, lines, flats, traps, choruses, mirrors, arcs: ARCS, sections: SECTIONS,
      show: { x0: 158 * TS, x1: 223 * TS, y0: 17 * TS, y1: ST * TS, curtain: [158, 212, 17, 33] }, boxes: [[158, BX], [216, BX]], glimpse: { x: 205, y: 12 } },
    rigBands,   /* THE FLY LINES, for the reach model (src/reachcore.js): a band of footing from each platform's high stop to its low one */
    mainStage: { door: 300, x0: 301, x1: 342, floor: ST, stageX: 300, stageW: 40, free: [ST - 16, ST + 1] },   /* THE PUPPETEER's room (claude/puppeteer): stagePuppeteer(..., 300, ST) goes here (see section 10) */
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,   /* three checkpoints on a 520-tile route (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    music: 'theatre', dark: 0, night: true, nightA: 0.18, duskStart: 99999, duskLen: 1,
    darkZones: [dark(146, 236, 34, 49, 0.62), dark(158, 222, 17, 33, 0.42), dark(28, 110, 18, 33, 0.22), dark(225, 299, 12, 33, 0.3)],
    palette: { sky: 'dusk', far: 'town', mid: 'town', near: 'town', dress: 'village', darkCol: '14,8,20', haze: 'rgba(120,70,90,0.10)',
      grass: '#5a4a52', grassL: '#7a6470', grassD: '#3a2e36', dirt: '#4a3a34', dirtL: '#6a5448', dirtD: '#2e241e', canopy: ['#1a1220', '#2a1a2e', '#3a2440', '#4a3050'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'hall' }],
  };
}

/* ============================================================================================================
   THE HOUSE (THEATRE2, Daniel's pick A): the front of house, grown in at the START of the level. Everything backstage (built above in its own
   columns) slides right by HOUSE columns; this paints the house in front of it. Vertical, not a lobby: the foyer, the grand stair up to the DRESS
   CIRCLE (the balcony), the CHANDELIER over the stalls (strike its rope-lock on the balcony: it falls - on whoever stands under it, and it lies there
   as a step), the raked STALLS stepping down to the ORCHESTRA PIT (music stands, and the kettle drum that throws you up onto the apron), a box by the
   proscenium, and the pass door onto the stage door's passage. The facing rule is taught here now: the usher on the balcony, alone.
   ============================================================================================================ */
export const HOUSE = 72;
export function buildMaskwrightTheatre(ctx) {
  const { painter, T, TS } = ctx, B = buildBackstage(ctx), HN = HOUSE, W = B.W + HN, H = B.H, { FL, BX, ST } = THEATRE;
  const L = painter(W, H), { set, block, ent, coins } = L;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) L.grid[y * W + x] = x < HN ? T.SOLID : B.grid[y * B.W + x - HN];
  // ---- everything backstage slides right by HN columns ----
  const sx = x => x + HN, sp = p => p + HN * TS, D = B.theatre;
  for (const e of B.ents) { e.x = sx(e.x); if (typeof e.gate === 'number') e.gate = sx(e.gate); L.ents.push(e); }
  for (const m of B.moversExtra) m.x = sp(m.x);
  B.rigBands = B.rigBands.map(([a, b, c, d]) => [sx(a), sx(b), c, d]);
  for (const s of D.spots) { s.x = sp(s.x); s.aims = s.aims.map(([x, y]) => [sp(x), y]); }
  for (const f of D.flats) { if (f.axis === 'y') { f.x0 = sx(f.x0); f.x1 = sx(f.x1); } else { f.a = sx(f.a); f.b = sx(f.b); } f.base = f.base.map(([x, y, t]) => [sx(x), y, t]); if (f.winch) f.winch = [sx(f.winch[0]), f.winch[1]]; }
  for (const t of D.traps) { t.x0 = sx(t.x0); t.x1 = sx(t.x1); }
  for (const c of D.choruses) c.x = sx(c.x);
  for (const c of D.mirrors || []) { c.x0 = sx(c.x0); c.x1 = sx(c.x1); }
  D.show.x0 = sp(D.show.x0); D.show.x1 = sp(D.show.x1); D.show.curtain = [sx(D.show.curtain[0]), sx(D.show.curtain[1]), D.show.curtain[2], D.show.curtain[3]];
  D.boxes = (D.boxes || []).map(([x, y]) => [sx(x), y]); if (D.glimpse) D.glimpse = { ...D.glimpse, x: sx(D.glimpse.x) };
  D.arcs = Object.fromEntries(Object.entries(ARCS).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([b, r]) => [b, k === 'facing' ? r : [sx(r[0]), sx(r[1])]]))]));
  D.sections = [['THE HOUSE', 0]].concat(SECTIONS.map(([n, x]) => [n, sx(x)]));
  B.interiors = B.interiors.map(([a, b, c, d, k]) => [sx(a), sx(b), c, d, k]);
  B.darkZones = B.darkZones.map(z => ({ ...z, x0: sp(z.x0), x1: sp(z.x1) }));
  const M = B.mainStage; B.mainStage = { ...M, door: sx(M.door), x0: sx(M.x0), x1: sx(M.x1), stageX: sx(M.stageX) };
  // ---- THE HOUSE (columns 0 .. HN-1) ----
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const sign = (x, y, text) => ent('sign', x, y, { text }), deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  air(2, 9, 27, 33);                                                         /* THE FOYER */
  air(10, 71, 12, 40);                                                       /* THE AUDITORIUM: the dress circle, the stalls, the pit, the apron */
  block(10, 11, 32, 33); block(12, 13, 30, 33); block(14, 15, 28, 33); block(16, 17, 26, 33);   /* THE GRAND STAIR, two rows a step */
  for (let x = 18; x <= 38; x++) { set(x, 24, T.SOLID); set(x, 25, T.SOLID); }   /* THE DRESS CIRCLE: the balcony over the stalls, its front at 38 */
  block(18, 18, 25, 33);                                                     /* (the balcony's back wall comes down to the stair) */
  /* THE STALLS: raked, a row down every four seats, from under the balcony to the pit rail */
  for (let k = 0; k < 7; k++) { const x0 = 19 + k * 4, top = 30 + k; block(x0, x0 + 3, top, H - 1); }
  block(47, 56, 42, H - 1); air(47, 56, 37, 41);                             /* THE ORCHESTRA PIT: five rows under the last row of seats */
  spikes2(48, 51, 41);                                                       /* broken music stands, under the pit rail */
  block(52, 52, 40, 41); block(53, 56, 39, 41); for (let x = 54; x <= 56; x++) set(x, 39, T.BOUNCER);   /* THE KETTLE DRUMS on their riser: they throw you up onto the apron */
  block(57, 71, 34, H - 1);                                                  /* THE APRON, level with the stage door's passage */
  block(57, 71, 12, 20);                                                     /* the proscenium over the apron */
  for (let x = 58; x <= 63; x++) set(x, 24, T.ONEWAY);                       /* THE STAGE BOX over the apron, a rope up to it */
  function spikes2(x0, x1, y) { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); }
  for (let y = 30; y <= 33; y++) { set(HN, y, T.AIR); set(HN + 1, y, T.AIR); }   /* THE PASS DOOR into the stage door's passage */
  // the chandelier: a light on a line over the stalls. Strike its rope-lock (on the balcony's front) and it comes down on whoever is under it, and lies there as a step
  B.moversExtra.push({ kind: 'fly', theatre: true, role: 'bag', chandelier: true, line: 'CH', x: 40 * TS, w: 4 * TS, h: 14, y: 17 * TS - 14, yIn: 17 * TS - 14, yOut: 35 * TS - 14 });
  D.lines.push({ id: 'CH', out: false }); ent('flylock', 37, 23, { line: 'CH' });
  sign(3, 33, "THE MASKWRIGHT'S THEATRE. THE HOUSE IS DARK, AND FULL.");
  sign(20, 23, 'THE PLAYERS MOVE ONLY WHEN NOBODY WATCHES. FACE ONE AND IT STOPS. CUT IT DOWN.');
  sign(34, 23, 'BELLS: IT IS MOVING. A RED MASK: IT IS ABOUT TO STRIKE. LOOK AT IT.');
  foe('mummer', 29, 23, { squad: 'the usher' });                             /* THE USHER, alone on the dress circle: the facing rule, taught */
  foe('stagehand', 41, 34, { squad: 'the stalls' }); foe('stagehand', 45, 35, { squad: 'the front stalls' });   /* two crew in the stalls, one under the chandelier */
  foe('mummer', 51, 41, { squad: 'the pit' });                               /* in the pit, among the music stands */
  foe('bat', 50, 14);
  deco('stands', 49, 41); deco('stands', 52, 41, { v: 1 }); deco('seats', 24, 30); deco('seats', 32, 32, { v: 1 });
  ent('silver', 61, 23); coins([59, 23], [63, 23]); rope(64, 24, 33);          /* the stage box: a silver, off the way */
  foe('boo', 60, 23, { squad: 'the stage box' }); foe('boo', 52, 30, { squad: 'the pit ghost' });   /* THE HOUSE'S OWN DEAD (the shy dead): one in the stage box with its silver, one over the pit - they drift only while your back is turned, like the players */
  coins([12, 30], [14, 28], [16, 26], [24, 22], [28, 22], [40, 32], [50, 39], [55, 37], [66, 32]);
  function rope(x, y0, y1) { for (let y = y0; y <= y1; y++) set(x, y, T.NET); }
  return Object.assign(B, { W, grid: L.grid, ents: L.ents, START: { x: 3, y: 33 },
    interiors: [[2, 9, 27, 33, 'thFoyer'], [10, 71, 12, 40, 'thHouse']].concat(B.interiors),
    darkZones: B.darkZones.concat([{ x0: 10 * TS, x1: 72 * TS, y0: 12 * TS, y1: 41 * TS, dark: 0.35 }]),
    calm: [[0, W - 1, 0, H - 1]],
    squadBands: [{ lo: 400, hi: 599, spots: 0, why: 'THE MAIN STAGE: the Puppeteer arena-to-be (claude/puppeteer), kept free - no squad stands in a boss arena' }] });
}
