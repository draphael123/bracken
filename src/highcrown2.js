/* src/highcrown2.js - HIGHCROWN 2 (claude/highcrown2, scratch/brief-highcrown2.md + scratch/review-highcrown.md; Daniel picked all four, 10-08;
   started early 10-27). highcrownWhole() (src/level.js) builds the old castle and cuts it with cutColumns - the ROAD UP (0-230) and THE ARMOURY
   (488-587: the Forgemaster went to THE DEEP RAILS, no castle mini replaces him). What is left is 609 columns; everything here is written in
   THOSE columns (the cut level's own), after the cut, so the old literals above it never change.

   THE ROAD NOW: the Kitchen Gate brings you up the kitchen stair into the gatehouse passage (the tower 0-10; its outer portcullis, col 5, is shut
   behind you for good), and Highcrown is inside the walls from its first step.
     0- 92  THE BAILEY      a) HOLD THE WINCH GATE (the first rule teach: a gate on a winch, a hound behind it, a murder-hole stone past it)
                            c) RING THE BELL YOURSELF: the barracks door opens only to the ward bell - ring it (or let the sentry), the barracks
                               turns out, and the GRATE BELL drops its grate on them as they come through the arch: the Queen's own move, small.
                               The ward key hangs inside the barracks, so the bell is a REQUIRED use (A4).
    93-162  THE CRAG WALK   (as it was)
   163-232  THE SCAFFOLD PIT (as it was: the level's platforming exam, A14)
   233-256  THE VESTIBULE   b) the exam where the smith's armoury was: step in and the alarm grate drops behind you; ONE heavy elite holds the
                               far gate (ELITES); the shrine is past it, on the bakehouse lip
   257-328  THE BAKEHOUSE YARD, BURNING (as it was)
   329-345  THE KEEP DOOR   (its winch, as it was)
   346-430  THE KEEP       d) ONE TALL HALL you climb (rows 26-63): the floor and its chandeliers, a stone stair to the east wall, the
                               ladder to the gallery, chain-hung landings across the hall to the west balcony, the stair head - and THE HALL
                               BELL at the top: rung (by you, or by its sentry) the grate on the stair head drops and the hall's watch turns
                               out on the stair side of it. The kitchen floor is gone (the Kitchen Gate owns the kitchens now).
                            THE CHAPEL (rows 10-19, as it was), then the Captains Hall, the Banquet Hall, the Leads and HER HALL (as they were). */
export const HC2 = {
  START: { x: 8, y: 63 },
  WINCH_GATE: 25, WINCH: 20,                      // the bailey gate and its winch
  WARD_BELL: 66, GRATE: 74, GRATE_BELL: 71,      // the lure, and the grate bell over the arch the barracks comes through
  BARRACKS: [79, 89], BARRACKS_DOOR: 79, WARD_KEY: 88,
  VEST: [233, 256], VEST_GRATE: 234, VEST_GATE: 254, VEST_ELITE: 246,
  HALL: [347, 429], HALL_GRATE: 356, HALL_BELL: 360,
  SHRINES: [[95, 63], [164, 63], [258, 63], [364, 63], [425, 19], [553, 19]],   /* (claude/highcrown3, HCPLAN sec 4) the hall balcony's 358/37 went (six columns from the keep door's: the hall climb is one beat); 553, the Queen's door, is 653 after HC3's insert; HC3 adds the banquet's EAST door (524, 23) */   /* the bailey's (after the ward gate), the crag's, the vestibule's (past its exam, on the bakehouse lip), the keep's (inside its door, after the burning yard), the hall's (its west balcony, after the landings), the chapel's, the Queen's door */   /* + the Banquet Hall's door one (AMBUSH.crown check [478, 19]) */
};
export function highcrownTwo(R, opts) {
  const { T, TS } = opts;
  const W = R.W, H = R.H, g = R.grid;
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y * W + x] = v; };
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const block = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.SOLID), air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const plat = (x, y, n) => fill(x, x + n - 1, y, y, T.ONEWAY), rungs = (x, y0, y1) => fill(x, x, y0, y1, T.NET), port = (x, y0, y1) => fill(x, x, y0, y1, T.PORT);
  const unplat = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (at(x, y) === T.ONEWAY) set(x, y, T.AIR); };
  const ent = (t, x, y, o = {}) => R.ents.push({ t, x, y, ...o });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const inBox = (e, x0, x1, y0, y1) => e.x >= x0 && e.x <= x1 && e.y >= y0 && e.y <= y1;
  const clearEnts = (x0, x1, y0, y1, keep) => { R.ents = R.ents.filter(e => !inBox(e, x0, x1, y0, y1) || (keep && keep(e))); };
  const sup = (x, y, kind, bottom) => { (R.routeSupports || (R.routeSupports = [])).push(kind === 'chain' ? { x, y, bottom: y + 2, top: (() => { let t = y - 1; while (t > 0 && at(x, t) === T.AIR) t--; return t + 1; })(), kind } : { x, y, bottom, kind }); };
  const FOE = new Set(['soldier', 'javelin', 'heavy', 'pike', 'archer', 'hound', 'hearthgob', 'temperer', 'brute', 'gobmage', 'rockgoblin', 'shield', 'sentry', 'folk', 'harpy', 'goat']);

  R.START = { ...HC2.START };
  R.checkRun = 200;   /* one shrine an area (A10c), laid by hand below: the filler adds none between */
  R.ents = R.ents.filter(e => e.t !== 'check');

  // ============ THE GATEHOUSE PASSAGE AND THE BAILEY (0-92) ============
  clearEnts(0, 4, 56, 63);                                                   // nothing lives behind the shut port (the old drawbridge hound)
  clearEnts(11, 47, 53, 64, e => e.t === 'deco' || e.t === 'torch');          // the old picket at the gate goes: a quiet start, one hound past the gate
  clearEnts(11, 47, 53, 64, e => e.t === 'deco' && (e.x < 18 || e.x > 30));
  unplat(17, 40, 53, 62);                                                    // the old stair to the wall walk stood across where the gate goes
  ent('sign', 10, 63, { text: 'HIGHCROWN. EVERY HALL HAS A BELL, AND A GATE THAT DROPS WITH IT.' });
  /* a) THE BAILEY GATE: a cross-wall across the bailey, a portcullis in its arch on a winch. Strike the winch: the gate holds up a few breaths, then drops
     on whatever is under it. The hound behind it comes through when it lifts - let it fall on him. (The only way east: the wall walk's stair is past it.) */
  block(23, 27, 54, 57); port(HC2.WINCH_GATE, 58, 63);   // the gate's arch (its tower drawn behind, R.facades) and the portcullis in it
  ent('winch', HC2.WINCH, 63, { gate: HC2.WINCH_GATE, gy0: 58, gy1: 63, hold: 6 });
  ent('sign', 16, 63, { text: 'STRIKE THE WINCH: IT HOLDS THE GATE UP A FEW BREATHS, THEN DROPS IT ON WHATEVER IS UNDER.' });
  ent('hound', 29, 63, { face: -1 });
  ent('torch', 22, 63); ent('torch', 28, 63);
  /* THE MURDER HOLE past the gate: a stone in a slot of the wall walk over the bailey - it sparks, then drops (Stormhold's barbican stones) */
  ent('murderhole', 33, 53, { n: 1 });   /* (claude/highcrown3, HCPLAN beat 1) MURDER HOLE #1 is the PLAYER'S now: stand on the wall walk over it and strike the slot - the stone drops on the gate guards (reloads; src/main.js murderhole) */
  // the picket, fewer and on footing: a temperer at its brazier, a javelin on the wall walk's stair
  ent('brazier', 37, 63); ent('temperer', 40, 63, { face: -1 });
  for (const [x, y] of [[43, 62], [47, 60], [51, 58], [55, 56], [59, 54]]) { plat(x, y, 4); sup(x, y, 'pier', 64); sup(x + 3, y, 'pier', 64); }   // the stair up to the wall walk, past the gate, on its stone piers
  ent('javelin', 52, 57, { face: -1 });
  coins([44, 61], [48, 59], [52, 57], [56, 55], [31, 63], [35, 63]);
  /* c) THE WARD BELL IS A LURE. The barracks (79-89, against the inner wall) is the way through to the ward gate, and its door opens only when
     the ward bell rings: ring it yourself (lure: a blow RINGS it) or let the sentry - the barracks turns out, the ward gate drops for twenty
     seconds or until they are down, and THE GRATE BELL over the arch they come through drops its grate on whoever is under it. */
  clearEnts(48, 92, 53, 64, e => e.t === 'lockgate' || (e.t === 'deco' && e.x < 70));
  unplat(78, 89, 54, 56);                                                    // the old barracks' counterweight ledge
  ent('sentry', 60, 63, { section: 'ward', range: 6, face: 1 });
  ent('bell', HC2.WARD_BELL, 63, { section: 'ward', lure: true });
  ent('sign', 62, 63, { text: 'THE BARRACKS OPENS TO ITS BELL. RING IT, THEN DROP THE GRATE ON THEM AT THE ARCH.' });
  block(72, 76, 54, 57);                                                     // the arch they come through
  ent('winch', HC2.GRATE_BELL, 62, { gate: HC2.GRATE, gy0: 58, gy1: 63, drop: true, hold: 7, bell: true });
  block(79, 89, 54, 55); block(79, 79, 56, 59); port(HC2.BARRACKS_DOOR, 60, 63);   // the barracks: its roof on the inner wall, its west wall, its door
  plat(77, 55, 2); ent('weight', 78, 56, { len: 5 });                        // the counterweight over its door, on the eave (a jump cuts it)
  plat(81, 61, 3); sup(81, 61, 'pier', 64); sup(83, 61, 'pier', 64); ent('silver', 82, 60);                                    // a bunk shelf, and what the watch kept on it (the clever pay: secrets +1)
  ent('key', HC2.WARD_KEY, 63, { kind: 'brass' });
  ent('torch', 84, 63); ent('deco', 86, 63, { kind: 'spearRack' });
  R.reachDoors = (R.reachDoors || []).concat([{ x0: HC2.BARRACKS_DOOR, x1: HC2.BARRACKS_DOOR, y0: 60, y1: 63 }]);   /* the bell opens it: every hero can ring a bell (src/reachcore.js) */
  R.alarms = R.alarms.map(a => a.id !== 'ward' ? a : { ...a, garrison: [{ t: 'soldier', x: 85, y: 63 }, { t: 'javelin', x: 87, y: 63 }, { t: 'soldier', x: 83, y: 63 }], opens: [[HC2.BARRACKS_DOOR, 60, 63]] });
  R.masonry = R.masonry.concat([[23, 27, 54, 57], [72, 76, 54, 57], [79, 89, 54, 59]]);
  R.facades = R.facades.concat([[23, 27, 46, 63, 'tower', { arch: [58, 63], lit: false }], [72, 76, 48, 63, 'tower', { arch: [58, 63], lit: false }]]);
  R.interiors = R.interiors.concat([[80, 89, 56, 63, 'hcguard']]);

  // ============ THE CRAG WALK (93-162): the rule on the wall (the review: no bell or gate between the ward and the keep) ============
  /* its WATCH: a sentry on the wall walk and his bell - seen as you come up the second tower, he runs for it, and the grate at 138 drops between the
     tower and the walk with a soldier on your side of it. Catch him first, or break his bell. Past the breach, the THIRD TOWER's gate hangs from a winch
     on the three-tile stub of wall over the drop: the bailey's lesson again, with the bottom of the world behind you (A4 remix) */
  ent('sentry', 141, 47, { section: 'crag', range: 3, face: -1 }); ent('bell', 144, 47, { section: 'crag' });
  R.alarms = R.alarms.concat([{ id: 'crag', gates: [[138, 42, 47]], garrison: [{ t: 'soldier', x: 136, y: 47 }, { t: 'javelin', x: 150, y: 47 }] }]);
  port(151, 42, 47); ent('winch', 149, 47, { gate: 151, gy0: 42, gy1: 47, hold: 5 });
  ent('sign', 143, 47, { text: 'THE TOWER GATE PAST THE BREACH HANGS FROM A WINCH. STRIKE IT, THEN GO.' });

  // ============ THE VESTIBULE (233-256): the armoury's old ground, the section exam ============
  air(237, 258, 46, 57);                                                     // the forge-house's roof stub and west wall go: open ward
  clearEnts(233, 256, 40, 64);
  for (const k of ['interiors', 'masonry', 'calm']) R[k] = R[k].filter(b => !(b[0] >= 233 && b[1] <= 258 && (k !== 'masonry' || b[2] < 64)));
  R.interiors = R.interiors.filter(b => b[4] !== 'forge');
  /* two gate towers, a grate in each arch: the WEST one is the alarm's (it drops behind you as you step in), the EAST one the elite's (src/level.js
     ELITES: down until he dies). The court between is the ward's own ground. */
  block(232, 236, 48, 57); block(252, 256, 48, 57);
  /* its WATCH: a sentry by the court's bell at the far gate. He sees you as you come in through the west arch - nine tiles off, too far to catch - and rings,
     and the grate drops BEHIND you: the elite is marked into the alarm (elites: src/main.js raiseAlarm's wake), so it lifts when he is down, or after twenty seconds */
  R.alarms = R.alarms.concat([{ id: 'vestibule', gates: [[234, 58, 63]], wake: [236, 252, 56, 63], elites: true }]);
  ent('bell', 250, 63, { section: 'vestibule' }); ent('sentry', 248, 63, { section: 'vestibule', range: 1, face: -1 });
  ent('sign', 231, 63, { text: 'THE VESTIBULE. STEP IN AND THE GRATE DROPS BEHIND YOU. HER CHAMPION HOLDS THE FAR GATE.' });
  ent('torch', 238, 63); ent('torch', 251, 63); ent('deco', 242, 63, { kind: 'barrels' });
  ent('murderhole', 253, 58, { n: 3, kick: [252, 252, 59, 63] });   /* (claude/highcrown3) MURDER HOLE #3 in the east gate tower's lintel, over her champion's gate: its pull-chain hangs inside the arch */
  coins([239, 62], [243, 62], [247, 62]);
  R.masonry = R.masonry.concat([[232, 236, 48, 57], [252, 256, 48, 57]]);
  R.facades = R.facades.concat([[232, 236, 40, 63, 'tower', { arch: [58, 63] }], [252, 256, 40, 63, 'tower', { arch: [58, 63] }]]);

  // ============ THE KEEP: ONE TALL HALL (347-429, rows 26-63) ============
  const [K0, K1] = HC2.HALL;
  air(K0, K1, 26, 63);                                                       // the three floors and their stairs go: one hall, thirty-eight rows high
  air(423, 428, 20, 25);                                                     // the chapel stair's shaft through the thick floor, cleared for its ladder
  clearEnts(K0, K1, 20, 64);
  R.interiors = R.interiors.filter(b => !(b[0] === K0 && b[1] === K1 && b[2] >= 26)).concat([[K0, K1, 26, 63, 'hchall']]);
  R.alarms = R.alarms.filter(a => a.id !== 'hall');
  // the floor: the door at its west foot (the winch at 339), the hall's watch under two chandeliers
  ent('sign', 349, 63, { text: 'THE KEEP. ONE HALL, CLIMBED. CUT A CHANDELIER DOWN ON WHOEVER STANDS UNDER IT.' });
  ent('brazier', 352, 63); ent('temperer', 356, 63, { face: -1 });
  ent('soldier', 372, 63, { face: -1 }); ent('heavy', 398, 63, { face: -1 });
  ent('weight', 372, 32, { len: 28, lamp: true, hang: true });               // two chandeliers on long chains, low enough to cut with a jump
  ent('weight', 398, 47, { len: 13, lamp: true, hang: true });
  for (const x of [362, 384, 404]) ent('torch', x, 63);
  ent('deco', 380, 63, { kind: 'banner', v: 1 }); ent('deco', 390, 63, { kind: 'barrels' });
  coins([366, 63], [378, 63], [388, 63]);
  // the stone stair up to the east wall (laid down to the floor: it stands on the floor)
  for (const [x0, x1, top] of [[409, 411, 62], [412, 414, 60], [415, 417, 58], [418, 420, 56], [421, 429, 54]]) block(x0, x1, top, 63);
  rungs(429, 46, 53);                                                        // the ladder up the east wall
  plat(392, 46, 37);                                                         // THE GALLERY (392-428): on the east wall, piers to the floor
  sup(392, 46, 'pier', 64); sup(402, 46, 'pier', 64);
  ent('javelin', 400, 45, { face: -1 }); ent('archer', 420, 45, { face: -1 });
  coins([395, 45], [410, 45]);
  // across the hall on landings hung from the thick floor above, to the west balcony
  for (const [x, y] of [[386, 44], [380, 42], [374, 40]]) { plat(x, y, 4); sup(x, y, 'chain'); sup(x + 3, y, 'chain'); }
  block(K0, 371, 38, 39);                                                    // THE WEST BALCONY, stone, on the west wall
  sup(371, 39, 'pier', 64);
  ent('pike', 356, 37, { face: 1 });
  coins([375, 39], [381, 41], [387, 43]);
  block(350, 352, 36, 37); block(K0, 349, 34, 37);                           // the stair head: two steps up the west wall
  plat(K0, 32, 83);                                                          // THE HIGH GALLERY (347-428) under the chapel floor, wall to wall
  for (const x of [380, 396, 416]) sup(x, 32, 'chain');
  rungs(428, 20, 31); set(428, 20, T.NET); for (let x = 423; x <= 427; x++) set(x, 20, T.ONEWAY);   // the ladder up through the shaft to the chapel
  /* d) THE HALL BELL, at the stair head. Rung by its sentry while you are still on the stair, the grate at 356 drops in front of you and the
     hall's watch turns out on your side of it; ring it yourself once you are past, and it drops BEHIND you - they turn out on the stair side,
     shut out. Up for twenty seconds, or until they are down. */
  ent('sentry', 370, 31, { section: 'hall', range: 6, face: -1 });
  ent('bell', HC2.HALL_BELL, 31, { section: 'hall', lure: true });
  ent('sign', 358, 31, { text: 'THE HALL BELL DROPS THE GRATE ON THE STAIR HEAD. BE PAST IT WHEN IT RINGS.' });
  R.alarms = R.alarms.concat([{ id: 'hall', gates: [[HC2.HALL_GRATE, 26, 31]], garrison: [{ t: 'soldier', x: 350, y: 31 }, { t: 'javelin', x: 352, y: 31 }] }]);
  ent('heavy', 398, 31, { face: -1 });
  ent('murderhole', 386, 33, { n: 4 });   /* (claude/highcrown3) MURDER HOLE #4 in the high gallery's boards: strike it from the gallery and the stone drops thirty rows onto the hall floor (the Queen-climb rehearsal) */
  ent('deco', 384, 31, { kind: 'banner', v: 0 }); ent('torch', 410, 31); coins([380, 31], [390, 31], [420, 31]);
  R.masonry = R.masonry.concat([[409, 429, 54, 63], [K0, 371, 38, 39], [K0, 352, 34, 37]]);

  /* NOBODY ON A ROOF NOBODY CAN CLIMB (the garrison sprinkler takes the highest floor in a column): the gate towers, the arch, the barracks roof */
  R.calm = (R.calm || []).concat([[0, 10, 30, 43], [23, 27, 40, 53], [72, 76, 40, 53], [77, 89, 40, 53], [232, 236, 30, 47], [252, 256, 30, 47]]);

  /* EVERY LEDGE ANCHORED (Daniel 10-27): what was left floating of the old castle - the archer's ledge by the keep door, the chapel's lofts and rafters
     (hung on chains from the keep roof), the lead gutter over the spikes (a pier to the leads) */
  sup(329, 44, 'pier', 64); sup(334, 44, 'pier', 64);
  for (const [x, y] of [[374, 10], [376, 10], [351, 12], [354, 12], [372, 12], [374, 12], [354, 14], [355, 14], [363, 14], [378, 14], [357, 16], [359, 16]]) if (at(x, y) === T.ONEWAY) sup(x, y, 'chain');
  sup(535, 14, 'pier', 26); sup(537, 14, 'pier', 26);

  // ============ HER HALL (B15 retune, brief item 3): two of her six chandeliers go (fewer openings; a cut one is spent for the round - src/main.js gqChandsHang), the sign says what her plate does now
  R.ents = R.ents.filter(e => !(e.t === 'weight' && e.gq && (e.x === 565 || e.x === 596)));
  R.ents = R.ents.filter(e => e.t !== 'qpillar' && e.t !== 'rod');   /* (claude/gqueen3) belt and braces: no pillar, no roof rod */
  for (const e of R.ents) if (e.t === 'weight' && e.gq) e.scenery = true;   /* her chandeliers are scenery now: nothing cuts one down, nothing is pinned by one */

  // ============ THE SHRINES (A10c: the end of each area's exam, and one before her door) ============
  for (const [x, y] of HC2.SHRINES) ent('check', x, y);
  /* THE THIRD SILVER: the choir loft's vault marker (src/relics.js VAULT_SILVER.crown, idx 2) pays silver #2 - the armoury gantry's silver held that place and went with the armoury,
     so one is laid for it here, after the pit's (#0) and the barracks' (#1); vaultSilver moves it onto the loft */
  ent('silver', 364, 13);
  R.tints = (R.tints || []).concat([[233, 256, [200, 170, 140], 0.05]]);
  /* ART (claude/highcrown2art): DRAWING ONLY - nothing below touches the grid, the ents or the movers (the level hash is the greybox's). src/redraw/highcrown2_art.js
     reads L.hc2Kit and L.hcDeco; the supports are routeSupports kinds the route-art draws; the hall and the barracks are interior styles. */
  R.hc2Kit = true; R.hcDoors = [[HC2.BARRACKS_DOOR, 60, 63]];   // (the barracks door: oak)
  R.hcDeco = (R.hcDeco || []).concat([
    { k: 'arch', x0: 23, x1: 27, top: 58, bot: 63, gate: HC2.WINCH_GATE },       // the bailey gate: the ring of voussoirs, the keystone, the portcullis grooves and its hoist slot
    { k: 'arch', x0: 72, x1: 76, top: 58, bot: 63, gate: HC2.GRATE },           // the ward grate arch
    { k: 'arch', x0: 232, x1: 236, top: 58, bot: 63, gate: HC2.VEST_GRATE },    // the vestibule's two gate towers
    { k: 'arch', x0: 252, x1: 256, top: 58, bot: 63, gate: HC2.VEST_GATE },
    { k: 'stairdoor', x0: 0, x1: 4, y: 63 },                                      // the kitchen stair's door behind the shut port
    { k: 'murder', x: 33, y: 53 },                                                // the murder hole in the wall walk's soffit
    { k: 'winchframe', x: 150, y: 41 },                                           // the crag gate's hoist over the tower arch
    { k: 'bellrope', x: HC2.WARD_BELL + 1, y: 60 },                                  // (claude/highcrown2bell) the ward bell's pull-rope on its iron bracket, beside the bell                                           // the crag gate's hoist over the tower arch
    { k: 'corbel', x: 78, y: 55 + 7 / 16, n: 1 },                                  // the barracks' eave beam, carried
  ]);
  /* the west balcony (a stone slab on the wall) and the high gallery (wall to wall) stand on corbels; every other one-way run of the castle with no pier or chain gets one:
     piers where the drop is short, corbels along it where it is backed by a wall */
  for (const x of [349, 353, 357, 361, 365]) R.hcDeco.push({ k: 'corbel', x, y: 40, n: 1 });
  for (const x of [350, 362, 388, 406, 424]) R.hcDeco.push({ k: 'corbel', x, y: 32 + 7 / 16, n: 1 });
  for (const p of R.routeSupports || []) { if (p.kind === 'pier') p.kind = 'hcpier'; else if (p.kind === 'chain') p.kind = 'hcchain'; }
  for (let y = 1; y < H - 1; y++) for (let x = 0; x < 530; x++) {
    if (at(x, y) !== T.ONEWAY || at(x - 1, y) === T.ONEWAY) continue;
    let x1 = x; while (at(x1 + 1, y) === T.ONEWAY) x1++;
    if ((R.routeSupports || []).some(p => p.x >= x && p.x <= x1 && p.y === y)) continue;
    let b = y + 1; while (b < H && at(x, b) !== T.SOLID && at(x, b) !== T.ONEWAY) b++;
    if (at(x - 1, y) === T.SOLID || at(x1 + 1, y) === T.SOLID) { for (let c = x; c <= x1; c += (x1 - x > 8 ? 6 : 4)) R.hcDeco.push({ k: 'corbel', x: c, y: y + 7 / 16, n: 1 }); if (x1 - x > 2) R.hcDeco.push({ k: 'corbel', x: x1, y: y + 7 / 16, n: 1 }); }
    else if (b - y <= 14) { for (const c of x1 > x ? [x, x1] : [x]) (R.routeSupports || (R.routeSupports = [])).push({ x: c, y, bottom: b, kind: 'hcpier' }); }
  }
  /* ============ GOBLIN QUEEN 3 (claude/gqueen3, scratch/plan-goblinqueen3-1104.md): THE ESCAPE UP THE BURNING HALL, AND THE TOWER TOP ============
     Her hall is cols 559-602 (rows 10-19 air, the hall's roof rows 8-9, the roof walk rows 0-7 over it with three chimney stacks 565-569 / 579-583 / 593-597 and a step plank either side).
     The escape is LAID AT RUNTIME (main.js gqEscapeLay, at the flee): five burning rafters, the hole through the roof, a stretch of slates; this table is its layout (tiles: [x0, x1, row]).
     Every tier is one tile thick (a one-way), no more than three rows above what the hero stands on, and no gap wider than two tiles. */
  { const A = R.arena;
    R.gqEscape = {
      tiers: [{ x0: 561, x1: 569, row: 17, name: 'T1' }, { x0: 572, x1: 582, row: 15, name: 'T2' }, { x0: 585, x1: 595, row: 13, name: 'T3' }, { x0: 576, x1: 584, row: 11, name: 'T4', collapse: true }, { x0: 566, x1: 575, row: 11, name: 'T5' }, { x0: 572, x1: 575, row: 9, name: 'T6' }],   // T6 is the step inside the hole (the old rubble's last stone): T5 -> T6 -> the roof, two short hops
      start: { x: 565, y: 16 },                      // the escapeStart checkpoint: on T1, laid at the flee
      check: { x: 601, y: 7 }, portal: { x: 602, y: 7 },   // the roof's shrine, and HER PORTAL beside it on the last stretch of the roof walk (the stacks stand at 593-597)
      hallPortals: [{ x: A.x0 / TS + 4, y: 13 }, { x: A.x1 / TS - 4, y: 15 }],   // the two that stay open and fan shards while you are in the hall
      slates: { x0: 587, x1: 591, row: 8 },          // the roof tiles over the hall that go, told, under a foot (one row: the second stays)
      throwers: [{ t: 'javelin', x: 581, y: 3 }, { t: 'javelin', x: 595, y: 3 }],   // on the stacks' tops
      route: [[565, 16], [577, 14], [590, 12], [580, 10], [570, 10], [574, 7], [577, 5], [581, 3], [585, 5], [588, 7], [591, 5], [595, 3], [599, 5], [601, 7]],
      supports: [],
    };
    R.gqEscape.tiers.forEach((t, i) => { for (const x of [t.x0 + 1, t.x1 - 1]) R.gqEscape.supports.push({ tier: i, x, y: t.row, bottom: t.row + 2, top: 10, kind: 'chain' }); });
    ent('sign', 599, 5, { text: 'THE FIRE HAS TAKEN HER HALL. UP, OUT THROUGH THE ROOF, AND STEP INTO HER PORTAL.' });
    /* THE TOWER TOP: a sealed rooftop island east of the hall, reached only by her portal (cols 609-664 are new, all stone; the deck is carved out of it) */
    const W0 = R.W, W2 = W0 + 56, g2 = new Uint8Array(W2 * R.H).fill(T.SOLID);
    for (let y = 0; y < R.H; y++) g2.set(R.grid.subarray(y * W0, y * W0 + W0), y * W2);
    R.grid = g2; R.W = W2;
    const S2 = (x, y, v) => { g2[y * W2 + x] = v; };
    for (let y = 1; y <= 19; y++) for (let x = 612; x <= 660; x++) S2(x, y, T.AIR);   // the deck: nineteen rows of sky over a floor at row 20, a ceiling of stone so nothing leaves it
    for (const x of [612, 660]) for (let y = 17; y <= 19; y++) S2(x, y, T.SOLID);   // the battlements at both ends
    for (const x of [636, 637]) for (let y = 17; y <= 19; y++) S2(x, y, T.SOLID);   // ONE chimney stack in the middle: for vertical play, never a pillar, never an opening
    ent('deco', 624, 19, { kind: 'banner', v: 1 }); ent('deco', 648, 19, { kind: 'banner', v: 0 }); ent('torch', 618, 19); ent('torch', 654, 19);
    R.arenaRoof = { x0: 612 * TS, x1: 660 * TS, floor: 20 * TS, wallL: 611, wallR: 661, boss: 'gqueen', music: 'gqjudge', tint: '#7a2a1a', tintA: 0.1, fx: 'dust', noWall: true, exit: { x: 614, y: 19 }, hatches: [616, 656], stack: [636, 637], poles: [624, 648] };
  }
  return highcrownThree(R, { T, TS, insertColumns: opts.insertColumns });
}

/* ============ HIGHCROWN 3 (claude/highcrown3, scratch/lane-reports/hcplan.md, APPROVED Daniel 11-06 22:34) ============
   "A BIT LONGER": nothing is cut (the Captains Hall and the bakehouse yard stay); a hundred columns are INSERTED at the banquet's east door
   (src/level.js insertColumns, so the Queen's hall, her escape and her tower top slide east whole) and the Leads are rebuilt into them:
     479-522  THE BANQUET HALL = THE PRE-THRONE REHEARSAL and the level's ambush room: her CAPTAIN (a heavy elite, AMBUSH.crown) at the high table;
              ring the BELL ROPE (west) and he storms to the sound - under the GRATE mid-hall when it drops he is pinned; meanwhile the SERVERY DOOR
              rises (her garrison: soldier, javelin, pike) - crank its WINCH (3 blows, 2 s apart) before the horn or they are in. A murder hole over
              the servery. The shrine is at its EAST door, after it (524, 23).
     523-622  THE BATTLEMENTS (outdoor, snow and headwind gusts): the wall walk at row 21, two ALARM TOWERS (557-566, 602-611) with an archer on each
              roof (a ladder up its east face), a broken stretch (576-584: stone corbels over a six-row drop to a lower walk and a ladder back - a
              time cost, never a death fall). THE GOBLIN PRINCESS flees along it ahead of you and rings each tower's alarm bell: its guardroom door
              rises - crank the tower winch in time or the wave is out; a murder hole's chain in each passage drops a stone on the door.
     623-648  THE BELL TOWER (L.mini): her fight. Floor at row 21, the BELFRY LANDING (630-641, row 19: a three-row jump, every hero), the TOWER BELL's grate over it (636),
              the bell rope on the floor's west side (627), her guardroom door (643) and its winch (641), the roof hatch (639) she escapes by,
              and the inner stair door east (648, rows 14-19, the mini's gate) onto the terrace at her doors.
     649-658  the terrace and the Queen's doors (the old Leads' last ten columns); her hall from 659. */
export const HC3 = {
  AT: 523, ADD: 100, S: 21,
  STAIR: [523, 526], W1: [527, 556], T1: [557, 566], W2: [567, 601], GAP: [576, 584], CORBELS: [[578, 579], [581, 582]], T2: [602, 611], W3: [612, 622],
  BT: [623, 648], BT_ROOF: 6, LAND: [630, 641], LAND_ROW: 19, GRATE: 636, ROPE: 627, DOOR: 643, WINCH: 641, HATCH: 639, EXIT_ROWS: [14, 19],
  BANQ: [485, 520], REH: { rope: 487, grate: 499, gy0: 16, gy1: 25, door: 510, winch: 507, row: 25 },
  BANQ_SHRINE: [524, 23],
  /* the towers: she rings at `bell`, the wave comes out of `door`, the winch at `winch` keeps it in, the murder hole's chain hangs at `chain` */
  TOWERS: [{ id: 'tower1', x0: 557, x1: 566, bell: 564, door: 561, winch: 558, chain: 559, wave: ['soldier', 'javelin'] },
           { id: 'tower2', x0: 602, x1: 611, bell: 609, door: 606, winch: 603, chain: 604, wave: ['pike', 'soldier', 'hound'] }],
};
export function highcrownThree(R, { T, TS, insertColumns }) {
  if (!insertColumns) return R;
  const B = HC3, S = B.S;
  insertColumns(R, B.AT, B.ADD);
  const W = R.W, H = R.H, g = R.grid, BOT = H - 1;
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y * W + x] = v; };
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const block = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.SOLID), air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const plat = (x, y, n) => fill(x, x + n - 1, y, y, T.ONEWAY), rungs = (x, y0, y1) => fill(x, x, y0, y1, T.NET), port = (x, y0, y1) => fill(x, x, y0, y1, T.PORT);
  const ent = (t, x, y, o = {}) => R.ents.push({ t, x, y, ...o });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const X0 = B.AT, X1 = B.BT[1] + 3;   /* everything the old Leads were, and the hundred new columns: rebuilt (the terrace at 652-658 and the door-tower stay) */

  // ---- out with the Leads: their stack, gutter, spikes, turret, buttress, whelp, sentry, bell, signs, alarm, wind ----
  R.ents = R.ents.filter(e => !(e.x >= X0 && e.x <= X1 && e.y <= 30 && e.t !== 'check'));
  R.alarms = (R.alarms || []).filter(a => a.id !== 'leads');
  R.winds = (R.winds || []).filter(w => !(w.x0 >= X0 && w.x1 <= X1));
  R.calm = (R.calm || []).filter(b => !(b[0] >= X0 && b[1] <= X1 + 1));
  R.tints = (R.tints || []).filter(b => !(b[0] >= X0 && b[0] <= X1)).concat([[X0, B.W3[1], [150, 170, 230], 0.08], [B.BT[0], B.BT[1], [255, 190, 120], 0.05]]);
  R.facades = (R.facades || []).filter(f => !(f[0] >= X0 && f[1] <= X1));
  air(X0, X1, 0, S); block(X0, X1, S + 1, BOT);
  air(B.BT[1] + 1, B.BT[1] + 3, 16, 19);   /* the old buttress off the turret: the terrace runs on to the tower's door */

  // ---- the stair up out of the banquet's east door onto the walk ----
  air(523, 524, S + 1, 23);   /* (the banquet floor stands at 25: two steps of two) */
  ent('check', B.BANQ_SHRINE[0], B.BANQ_SHRINE[1]);
  ent('sign', 526, S, { text: 'THE BATTLEMENTS. SHE RUNS FOR THE ALARM BELLS: STRIKE EACH TOWER WINCH BEFORE ITS GUARDS ARE OUT.' });

  // ---- W1: the open walk, one soldier, the first tower's archer shooting along it ----
  ent('soldier', 547, S, { face: -1 }); ent('torch', 530, S); ent('deco', 540, S, { kind: 'gobPennant', v: 1 }); ent('deco', 552, S, { kind: 'warStandard', v: 0 });
  coins([533, S], [538, S - 1], [544, S], [550, S - 1]);

  // ---- THE TWO ALARM TOWERS: a body over a passage (rows 15-21), a roof with an archer, a ladder up the east face ----
  for (const Tw of B.TOWERS) {
    block(Tw.x0, Tw.x1, 7, 14); block(Tw.x0, Tw.x0, 5, 6); block(Tw.x1, Tw.x1, 5, 6); block(Tw.x0 + 4, Tw.x0 + 5, 5, 6);   /* the body, and its merlons */
    rungs(Tw.x1 + 1, 6, S);                                                                                     /* the ladder up its east face to the roof */
    ent('archer', Tw.x0 + 7, 6, { face: -1 });
    ent('murderhole', Tw.door, 15, { n: Tw.id === 'tower1' ? 5 : 6, kick: [Tw.chain, Tw.chain, S - 4, S] });   /* MURDER HOLES #5/#6: a slot in the passage's vault over the guardroom door, its pull-chain beside it */
    ent('torch', Tw.x0 + 2, S);
    R.masonry.push([Tw.x0, Tw.x1, 5, 14]);
    R.facades.push([Tw.x0, Tw.x1, 0, S, 'tower', { arch: [15, S], roof: true }]);
    R.hcDeco.push({ k: 'murder', x: Tw.door, y: 15 }, { k: 'guarddoor', x: Tw.door, y: S, id: Tw.id }, { k: 'gpwinch', x: Tw.winch, y: S, id: Tw.id }, { k: 'gpbell', x: Tw.bell, y: S, id: Tw.id });
  }
  ent('sign', B.T1[0] - 2, S, { text: 'HER TOWER BELL TURNS OUT ITS GUARDROOM. STRIKE THE WINCH THREE TIMES, QUICKLY, AND ITS GATE DROPS.' });

  // ---- W2: the broken stretch - stone corbels over a six-row drop (a lower walk and a ladder back: time, never a death) ----
  air(B.GAP[0], B.GAP[1], S + 1, S + 6); for (const [a, b] of B.CORBELS) fill(a, b, S + 1, S + 1, T.ONEWAY);
  rungs(B.GAP[1], S + 1, S + 6);
  ent('pike', 588, S, { face: -1 }); ent('heavy', 594, S, { face: -1 }); ent('torch', 586, S); ent('deco', 598, S, { kind: 'gobPennant', v: 0 });
  coins([578, S], [581, S], [580, S + 6], [590, S - 1]);
  R.hcDeco.push({ k: 'corbel', x: 578, y: S + 1 + 7 / 16, n: 2 }, { k: 'corbel', x: 581, y: S + 1 + 7 / 16, n: 2 });
  R.facades.push([B.GAP[0], B.GAP[1], S + 1, S + 6, 'chasm']);

  // ---- W3: the last stretch to THE BELL TOWER ----
  ent('torch', 615, S); ent('deco', 619, S, { kind: 'warStandard', v: 1 }); coins([614, S], [618, S]);
  ent('sign', 620, S, { text: 'THE BELL TOWER. RING ITS BELL WITH HER UNDER THE GRATE, AND SHE IS YOURS.' });

  // ---- THE BELL TOWER (623-648): her room ----
  const [b0, b1] = B.BT;
  block(b0, b1, 2, B.BT_ROOF); block(b0, b0, B.BT_ROOF + 1, S - 6); block(b1, b1, B.BT_ROOF + 1, B.EXIT_ROWS[0] - 1);   /* roof, west wall over its door (rows 16-21 open), east wall over the inner stair door */
  port(b1, B.EXIT_ROWS[0], B.EXIT_ROWS[1]);                                                                        /* the inner stair door: shut until she has gone (L.mini.gate) */
  block(b1 - 3, b1 + 3, B.EXIT_ROWS[1] + 1, S);                                                                    /* the stair's foot inside the door and the sill out to the terrace (stand at 19, the terrace's height) */
  plat(B.LAND[0], B.LAND_ROW, B.LAND[1] - B.LAND[0] + 1);                                                          /* THE BELFRY LANDING (one-way: every hero jumps it) */
  ent('gprincess', 638, S, { face: -1, mini: true });
  ent('torch', 626, S); ent('torch', 646, B.EXIT_ROWS[1]); ent('deco', 633, S, { kind: 'banner', v: 1 });
  R.masonry.push([b0, b1, 2, S]);
  R.facades.push([b0, b1, 0, S, 'tower', { roof: true }]);
  R.interiors.push([b0 + 1, b1 - 1, B.BT_ROOF + 1, S, 'hchall']);
  R.calm.push([b0, b1, 0, B.BT_ROOF]);
  R.hcDeco.push({ k: 'bellrope', x: B.ROPE, y: S - 3 }, { k: 'guarddoor', x: B.DOOR, y: S, id: 'bt' }, { k: 'gpwinch', x: B.WINCH, y: S, id: 'bt' }, { k: 'hatch', x: B.HATCH, y: B.BT_ROOF + 1 });
  R.mini = { x0: (b0 + 1) * TS, x1: b1 * TS, floor: (S + 1) * TS, y0: B.BT_ROOF * TS, y1: (S + 2) * TS, trigger: (b0 + 4) * TS, wallL: b0, wallR: b1, gate: b1, boss: 'gprincess',
    name: 'THE GOBLIN PRINCESS', music: 'goblinroyal', start: [b0 + 2, S],
    land: { x0: B.LAND[0] * TS, x1: (B.LAND[1] + 1) * TS, y: B.LAND_ROW * TS }, grate: { col: B.GRATE, gy0: B.BT_ROOF + 1, gy1: B.LAND_ROW - 1 },
    rope: B.ROPE * TS + 8, door: B.DOOR * TS + 8, doorCol: B.DOOR, winch: B.WINCH * TS + 8, hatch: B.HATCH * TS + 8 };

  // ---- THE CHASE (src/goblin-princess.js): where she runs, where she rings ----
  R.gpChase = { x0: 527 * TS, start: 540 * TS + 8, floor: (S + 1) * TS, end: (b0 + 2) * TS, gap: [B.GAP[0] * TS, (B.GAP[1] + 1) * TS],
    towers: B.TOWERS.map(Tw => ({ id: Tw.id, bell: Tw.bell * TS + 8, door: Tw.door * TS + 8, doorCol: Tw.door, winch: Tw.winch * TS + 8, wave: Tw.wave, floor: (S + 1) * TS })) };

  // ---- THE BANQUET HALL'S REHEARSAL (the room is AMBUSH.crown's; src/goblin-princess.js runs the bell rope, the grate and the servery winch) ----
  const Q = B.REH;
  air(Q.grate, Q.grate, Q.gy0, Q.gy1);
  ent('murderhole', Q.door, 10, { n: 2, kick: [Q.door + 2, Q.door + 2, 19, 23] });   /* MURDER HOLE #2 (the banquet): a slot in the vault over the servery door, its chain hanging to the dais */
  ent('sign', 482, 23, { text: 'HER CAPTAIN STORMS TO THE SOUND OF THE BELL ROPE: RING IT WITH THE GRATE BETWEEN YOU.' });
  R.gpRehearsal = { x0: B.BANQ[0] * TS, x1: (B.BANQ[1] + 1) * TS, floor: (Q.row + 1) * TS, rope: Q.rope * TS + 8, grate: { col: Q.grate, gy0: Q.gy0, gy1: Q.gy1 }, door: Q.door * TS + 8, doorCol: Q.door, winch: Q.winch * TS + 8,
    wave: ['soldier', 'javelin', 'pike'] };
  R.hcDeco.push({ k: 'bellrope', x: Q.rope, y: Q.row - 3 }, { k: 'murder', x: Q.door, y: 10 }, { k: 'guarddoor', x: Q.door, y: Q.row, id: 'servery' }, { k: 'gpwinch', x: Q.winch, y: Q.row, id: 'servery' });

  // ---- weather: the snow and the wind come back on the battlements (the tower is inside; the terrace is out again) ----
  R.weather = (R.weather || []).filter(z => !(z.x0 >= X0 * TS)).concat([{ x0: X0 * TS, x1: b0 * TS, kind: 'snow' }, { x0: (b1 + 1) * TS, x1: (b1 + 11) * TS, kind: 'snow' }]);
  R.ambient = (R.ambient || []).filter(z => !(z.x0 >= X0 * TS)).concat([{ x0: X0 * TS, x1: b0 * TS, kind: 'wind' }, { x0: b0 * TS, x1: (b1 + 1) * TS, kind: 'hall' }, { x0: (b1 + 1) * TS, x1: 99999, kind: 'wind' }]);
  R.gusts = (R.gusts || []).concat([{ x0: B.W1[0] * TS, x1: B.W1[1] * TS, y0: 8 * TS, y1: (S + 1) * TS, dir: -1, period: 6.5, on: 1.4, phase: 0, told: true },
    { x0: B.W2[0] * TS, x1: B.W2[1] * TS, y0: 8 * TS, y1: (S + 7) * TS, dir: -1, period: 5.5, on: 1.8, phase: 2, told: true }]);   /* headwind gusts, told (crosswind on the walk, stronger over the broken stretch) */
  R.hc3 = true;
  return R;
}
