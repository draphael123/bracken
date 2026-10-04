// harvest-fair.js - THE HARVEST FAIR, REBUILT AS A VERTICAL FAIRGROUND (claude/fairlevel; Daniel, 2026-09-30: "the level is just walk right"). Brief: docs/briefs/harvest-fair.md.
// A village fair abandoned mid-festival as the sun goes down: warm sunset on the ground, NIGHT by the tops (the light goes out with HEIGHT as well as along the road:
// lanterns gutter, and you can only freeze a mummer you can SEE). Its rule: DON'T TURN YOUR BACK ON THEM (src/mummer.js): a MUMMER moves only while no hero faces
// it; the HOBBY-HORSE charges the moment a back is turned; the CAROUSEL turns a rider round; a MIRROR watches what is behind you. Placed wholly by hand (no sprinkle).
// The rides and games (the wheel, the swing ride, the helter-skelter, the high strikers, the gallery, the tickets, the corn maze) are src/fair-games.js + src/redraw/fair_rides.js;
// the swingboats and the chair-o-plane (claude/fairfix3) src/fair-rides.js + src/redraw/fair_newrides.js. (Updated by claude/fairfix3, 2026-10-01.)
//
//   0-118    THE GATE          REFRESHER   the first ask on screen one (a spiked pit under the coconut shy's stall: he throws at a turned back), one mummer, one short sign;
//                                          the HIGH STRIKER (a heavy blow on the pad throws you onto the boardwalk's landing, 82-94) and the fallen big top's tent poles
//   118-246  THE STALL ROW     DEVELOP     a pincer on a climb (a mummer on a roof that drops after you, one on the road, a knife juggler behind them; one more at the top of the
//                                          slope stair) under THE BARKER on his crate; the SHOOTING GALLERY raises planks to the crow's nest, whose tickets open THE LOFT (a silver);
//                                          the takings cellar (secret) under the road; THE SWINGBOATS over a spiked pit to the high stall (let go at the top); the collapsing stalls
//                                          with a horse at the edge, and the bunting rope that frays and snaps over them
//   246-372  THE MIDWAY        TWIST       the carousel turns you (a hop across it no longer escapes it: it turns you at least once); then TWO ROADS to the helter-skelter tower, each
//                                          with its own test: LOW (THE HALL OF MIRRORS, dark: a STRING-JACK by the door - it moves only while you look, and the true glass that watches
//                                          your back for the mummer by the cracked panel works its strings too; the tower stair, its guttering lantern and a juggler behind the climb)
//                                          or HIGH (THE BIG WHEEL over its spiked pit, a horse on its wide car and a juggler at your back as you wait; the SWING RIDE: a string-jack
//                                          on island A, a horse on island B behind you as you land). The slide is the only way on, and the horse in the stall under its foot is at your BACK
//   372-525  THE HARVEST       COMBINE     the slide-foot pincer, a hayrick over spikes, THE CORN MAZE (three tiers, blind corners, a scarecrow that is not straw at each turn; a
//                                          BULL'S-EYE drops the bars before chimney one - the way up - or the tall striker's corn-top walk goes over it all); THE CHAIR-O-PLANE over a
//                                          spiked pit (hop chair to chair against the ride, two mummers riding it); then THE EFFIGY CATCHES FIRE: a chase with two lanes
//   525-619  THE LAST ROUND    EXAM        the small carousel under a striped canopy, in the dark, a mirror panel at its far end, a mummer and a string-jack riding it, a juggler
//                                          over the rick; then THE SPIKE YARD: the tall striker is the only way on, onto THE NIGHT LANE (a mummer held only while its lantern burns)
//                                          whose three targets, struck inside nine seconds, drop THE SHUTTER over the way down - while THE BARKER on the canopy's roof turns you round;
//                                          the shrine, THE BACK LOT (30 tickets), a blind stall wall with a mummer behind it, and the door guard (the elite hobby-horse) on an UNLIT
//                                          stretch - in the dark it finds you from further than you can see it
//   622-672  THE MAYPOLE GREEN THE WICKER QUEEN (claude/fair3, src/wicker-queen.js) ON THE FAIR'S GREAT CAROUSEL (claude/fairboss, src/wicker-carousel.js): the
//            ring turns under you, its horses bob on their poles, the firebox under the centre column; a door, a checkpoint before it, a gate at the far end
// FAIRFIX2 (2026-10-01, Daniel: ranged foes, real platforming, a real challenge at level 1 with no abilities, tickets as keys, more bull's-eyes and hidden paths): the
//   ranged reskins (a coconut shy - the drunk; knife jugglers - the archer; crows) cover the facing foes from roofs; the fair's mummers and horses are sharper and the
//   mummers drop off roofs after you (src/fair-keys.js); the fallen big top's poles, the pit under the wheel, the collapsing stalls and their bunting rope, spikes under
//   chair one; TICKET GATES (the loft, the hayloft) and THE BACK LOT (all the tickets: the fortune-teller's glass); bull's-eyes on a wheel car and in the corn; the door in
//   the glass; and THE EFFIGY CATCHES FIRE where the ghost train ran (two lanes). The level-1 pilot is tools/fair-pilot.mjs.
// Checkpoints (five, claude/fairfix; the game-wide ceiling is 200 route tiles now): 8, 199 (past the terrace), 383 (the slide's foot), 466 (before the effigy's fire) and the door's (600).
import { makeWall } from './breakable-walls.js';
export const FAIR = { W: 672, H: 36, R: 28 };
export const ARC = { teach: [0, 118], develop: [118, 246], twist: [246, 372], combine: [372, 525], exam: [525, 618] };
/* THE NIGHT (src/fair-games.js): the light goes out with HEIGHT. Above row `start` the dusk thickens; by `full` it is night, and only a lit lantern (or your own small light) shows you a mummer */
export const NIGHT = { start: 26, full: 14, dim: 88, lampR: 64 };

/* THE LAMPS GUTTER OUT: each one's life is 1 (steady), 0.5 (guttering: it stutters) or 0 (out). On the ground it is by how far along the road it stands; up in the rides it is by
   HEIGHT (a lamp on the boardwalk gutters, one on the tops is out) unless the level names its life (`life`: the tower stair's lantern always gutters, the night lane's do). Deterministic (no dice) */
export function lampsOut(lamps) {
  const end = 610; return lamps.map((l, i) => { const f = l.x / end;
    const h = (i * 0.618034) % 1, ground = l.x < 118 ? 1 : l.x > 590 ? 0.5 : h < (f - 0.25) * 1.3 ? 0 : h < (f - 0.05) * 1.3 ? 0.5 : 1;   /* a golden-ratio scatter: the further along, the more are out */
    const row = l.y, life = l.life !== undefined ? l.life : row >= 24 ? ground : row >= 17 ? Math.min(ground, 0.5) : 0;
    return l.hung ? { x: l.x, y: l.y, life, hung: l.hung } : { x: l.x, y: l.y, life }; }); }

import { newRing, horseAt, RING } from './wicker-carousel.js';
import { chairAt, CHAIRO } from './fair-rides.js';

export function buildHarvestFair({ painter, T, TS }) {
  const { W, H, R } = FAIR, S = R - 1;
  const L = painter(W, H), { set, block, floor, plat, ent, coins, spikes } = L;
  const foe = (t, x, o) => ent(t, x, S, Object.assign({ face: -1 }, o || {}));
  const sign = (x, text) => ent('sign', x, S, { text });
  const post = (x, y, life) => lamps.push({ x, y, life });          /* y left out: the road under it (worked out once the ground is built) */   /* the fair's own lamps (drawn and lit by drawFair; they gutter out along the way) */
  const stall = (x, v) => ent('deco', x, S, { kind: 'stall', v: v || 0 });
  const tk = (x, row) => tickets.push({ x, row });                 /* a TICKET: the fair's own level-local key (never spent: held, it opens the ticket gates - src/fair-keys.js) */
  floor(0, W - 1, R);

  /* A PIT WITH SPIKES: two tiles deep, so a fall hurts and is jumped out of (B3), three wide (S2: the real jump is about 3.2) */
  const pit = (x0, x1) => { for (let x = x0; x <= x1; x++) { set(x, R, T.AIR); set(x, R + 1, T.AIR); } spikes(x0, x1, R + 1); };
  /* A HAYSTACK: a stack two tiles high (a solid course and a springy cap). Land on it and it throws you up (the Sporewood cap bounce) */
  const stack = (x0, x1) => { block(x0, x1, R - 1, R - 1); for (let x = x0; x <= x1; x++) set(x, R - 2, T.BOUNCER); haystacks.push([x0, x1, R - 2]); };
  /* A CELLAR UNDER THE ROAD (a secret): a plug of plain rock in the floor (a heavy blow from above breaks it: 2 wide), a room below (rows 29-34, floor row 35), and its own stair back up: a step (3 up),
     a second (2 up) right under the plug, and the road (2 up). Never a softlock */
  const cellar = (x0, x1, plug) => { walls.push(Object.assign(makeWall(plug, plug + 1, R, R, 'secret'), { reach: true })); for (let y = R + 1; y <= R + 6; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR);
    plat(plug + 2, R + 4, 3); plat(plug, R + 2, 2); };
  const boats = [], chairos = [], haystacks = [], tickets = [], corn = [], scarecrows = [], strikers = [], walls = [], poles = [], crumbles = [], ticketGates = [], zipLines = [], cages = [], fallen = [], galleries = [], gallery = g => (galleries.push(g), g);
  /* A GENTLE CLIMB up n rows over 2n tiles from x0 (R2A + R2B pairs), and the way back down (L2B + L2A) from x1 */
  const ramp = (x0, n) => { for (let k = 0; k < n; k++) { const r = R - 1 - k, x = x0 + 2 * k; for (let y = r + 1; y < R; y++) { set(x, y, T.SOLID); set(x + 1, y, T.SOLID); } set(x, r, T.SLOPE_R2A); set(x + 1, r, T.SLOPE_R2B); } };
  const rampDown = (x0, n) => { for (let k = 0; k < n; k++) { const r = R - n + k, x = x0 + 2 * k; for (let y = r + 1; y < R; y++) { set(x, y, T.SOLID); set(x + 1, y, T.SOLID); } set(x, r, T.SLOPE_L2B); set(x + 1, r, T.SLOPE_L2A); } };
  /* A HILL: n rows up over 2n tiles, a level top w wide, and down again (the road over the stalls); the road is never flat for long */
  const hill = (x0, n, w) => { ramp(x0, n); block(x0 + 2 * n, x0 + 2 * n + w - 1, R - n, H - 1); rampDown(x0 + 2 * n + w, n); };
  /* A CUTTING: the road sinks n rows over 2n tiles, runs w tiles level between two banks, and climbs back (the underground band of the level) */
  const cut = (x0, n, w) => { const bx0 = x0 + 2 * n, bx1 = bx0 + w - 1;
    for (let k = 0; k < n; k++) { const r = R + k, x = x0 + 2 * k; for (let y = R; y < r; y++) { set(x, y, T.AIR); set(x + 1, y, T.AIR); } set(x, r, T.SLOPE_L2B); set(x + 1, r, T.SLOPE_L2A); }
    for (let x = bx0; x <= bx1; x++) for (let y = R; y < R + n; y++) set(x, y, T.AIR);
    for (let j = 0; j < n; j++) { const r = R + n - 1 - j, x = bx1 + 1 + 2 * j; for (let y = R; y < r; y++) { set(x, y, T.AIR); set(x + 1, y, T.AIR); } set(x, r, T.SLOPE_R2A); set(x + 1, r, T.SLOPE_R2B); } };
  /* THE HELTER-SKELTER: a slide of steep slopes down from a tower's right edge, n columns, one row a column; the rock is under every tile of it */
  const slide = (x0, y0, n) => { for (let k = 0; k < n; k++) { const x = x0 + k, y = y0 + k; for (let yy = y + 1; yy < R; yy++) set(x, yy, T.SOLID); set(x, y, T.SLOPE_L1); } };
  const carousels = [], lamps = [], moversExtra = [], awnings = [];
  /* (claude/fairfix5) THE AWNING BOUNCE: a striped canvas stall awning is SPRINGY - land on it and it throws you, a lower launch than a rick (src/main.js: AWNING_LAUNCH). A TEARING
     awning rips on the first bounce (a crumble of kind 'awning', back four seconds later) */
  const awning = (x0, x1, row, tear) => { for (let x = x0; x <= x1; x++) set(x, row, T.BOUNCER); awnings.push({ x0, x1, row, tear: !!tear }); if (tear) crumbles.push({ x0, x1, row, rows: 1, count: 0.05, kind: 'awning' }); };
  for (const x of [12, 22, 32, 44, 59, 69, 102, 111, 122, 134, 148, 198, 210, 228, 246, 266, 286, 296, 342, 391, 400, 444, 458, 527, 562]) post(x);   /* the lamps along the road, in the order the light goes: a lamp every ~25 tiles */

  // ---------------- 1. THE GATE (0-118): the refresher, then hills, a pit, the first height and the first game ----------------
  sign(5, 'THE HARVEST FAIR. THE MUSIC IS STILL PLAYING. NOBODY IS LEFT TO HEAR IT.');
  ent('check', 8, S);   /* the start's shrine */
  /* THE FIRST ASK, ON SCREEN ONE (claude/fairfix3; the review: "the opener is still hold-right"): a spiked pit at 13-15, and over its far lip THE COCONUT SHY's stall (18-21, three up) */
  pit(13, 15); coins([13, S - 2], [14, S - 3], [15, S - 2]);
  ent('deco', 24, S - 6, { kind: 'bunting', hang: true }); stall(10, 0);
  plat(18, R - 3, 4); coins([18, R - 4], [21, R - 4]);
  sign(28, "DON'T TURN YOUR BACK ON THEM.");   /* the refresher, short: the Maskwright's Theatre before the fair teaches the facing rule (claude/theatre); one sign, one mummer - read after the first ask */
  foe('mummer', 33, { squad: 'gate' });                  /* THE FIRST ONE, on the flat lane past the stall: facing it, it cannot move - and facing it, your back is to the stall */
  stall(36, 1); ent('deco', 44, S - 7, { kind: 'bunting', hang: true }); coins([34, S - 1], [38, S - 1], [42, S - 1]);
  plat(30, R - 3, 3); plat(33, R - 6, 4); plat(37, R - 3, 3); plat(41, R - 3, 4); coins([31, R - 4], [37, R - 7], [38, R - 4], [42, R - 4]);   /* stall roofs along the bunting: a second height over the first lane */
  /* THE COCONUT SHY (claude/fairfix2: Daniel, "it needs RANGED foes"): the stallholder up on his stall roof (the Waymeet drunk's arm, a coconut for a tankard). He keeps the fair's
     rule (claude/fairfix3): while you look at him he only juggles his coconuts; he throws at a TURNED BACK. Come over the pit facing him and he waits; face the mummer ahead and he is
     at your back: climb to him first (three up from the road), or hold the mummer with coconuts landing on you */
  foe('drunk', 20, { y: R - 4, shy: true, squad: 'gateRoof', cover: 'gate', range: 1 });   /* (cover: the encounter it covers, from another floor - a squad keeps to one floor) */
  pit(46, 48); coins([46, S - 2], [47, S - 3], [48, S - 2]);
  hill(52, 3, 4);                                        /* a stall building's roof street: three rows up over six, a level top (58-61), down (52-67) */
  coins([58, R - 4], [60, R - 4]);
  pit(71, 73); coins([71, S - 2], [72, S - 3], [73, S - 2]);
  /* THE STALL-ROOF STAIR up to THE BOARDWALK: two roofs, three tiles a step (row 25, 22), then the plank street at row 19. Everybody can climb it; THE HIGH STRIKER (a plunge on its pad
     rings the bell and throws you straight up onto the boardwalk) is the quick way, and the first game the fair teaches */
  plat(74, R - 3, 3); plat(78, R - 6, 3); coins([75, R - 4], [79, R - 7]);
  plat(82, R - 9, 13);                                   /* THE BOARDWALK: a plank landing on the stall roofs, row 19 (82-94). (claude/fairfix3: it ran to 163 and walked over the tent poles AND the pincer; now it ends
                                                            over the fallen big top - its end is a drop onto the first pole, so the poles and the pincer are on every road) */
  stall(84, 0); post(80);
  sign(85, 'THE HIGH STRIKER. COME DOWN ON THE PAD HARD: THE BELL RINGS AND IT THROWS YOU UP.');
  strikers.push({ id: 1, x: 88, row: R, launch: -600, tickets: 2, big: false });   /* the pad on the road, under the boardwalk's plank */
  tk(84, R - 10); coins([90, R - 10], [93, R - 10]);
  plat(92, R - 3, 5); coins([93, R - 4], [95, R - 4]);   /* a stall roof to hop under the boardwalk */
  /* THE FALLEN BIG TOP (claude/fairfix2: real platforming): its canvas is gone into a spiked pit six wide - too wide to jump - and only its two TENT POLES stand: hop pole to pole */
  pit(97, 102); block(98, 98, R - 2, R + 1); block(101, 101, R - 3, R + 1); poles.push([98, R - 2], [101, R - 3]); coins([98, R - 3], [101, R - 4]);
  hill(104, 2, 6);                                       /* another: the road over the stalls (104-117) */
  coins([109, R - 3], [111, R - 3]);

  // ---------------- 2. THE STALL ROW (118-246): DEVELOP ----------------
  stall(126, 1); ent('deco', 130, S - 7, { kind: 'bunting', hang: true });
  /* THE AWNING BOUNCE, TAUGHT (claude/fairfix5): the hoopla stall's awning over the road (two up) is springy - jump on, and hold jump as it throws you, and you are up on its prize
     shelf (a ticket). Safe: the road is under it */
  awning(119, 121, R - 2); plat(122, R - 6, 3); tk(123, R - 7); coins([122, R - 7], [124, R - 7]);
  /* THE BARKER on his crate over the stair (claude/fairfix3: the boardwalk he stood at the end of is cut back to 94; his crate stays where it ended). His call turns you to him: on the
     stair your back goes to the pincer's mummers below; from the terrace, to the mummer at the top */
  plat(157, R - 9, 7); foe('barker', 159, { y: R - 10, elite: true, squad: 'caller1' });   /* (the crate runs out over the terrace's lip: two up from it) */
  plat(133, R - 4, 3); foe('mummer', 134, { y: R - 5, squad: 'pincerRoof', cover: 'pincer' });   /* THE PINCER (claude/fairfix2: one of the pair is UP on a stall roof now): you walk under it to the other, and it
     DROPS off the roof behind you (the fair's mummers come down after you) - a mummer each side and you can face only one. (claude/fairfix3: drawn in tighter, six columns apart, and
     the boardwalk no longer goes over them) */
  foe('brute', 140, { cnSkin: 'strongman', squad: 'pincer' });   /* (claude/variety) THE STRONGMAN: the pincer's ground man is a fairground brute with a mallet - it walks at you whether or not you look, so the roof mummer is the one you hold */
  /* THE KNIFE JUGGLER over the pincer (claude/fairfix2; the goblin archer's draw and loose, knives for arrows): on a stall roof behind the pair. He keeps the rule (claude/fairfix3):
     looked at, he juggles; at a turned back, he throws. Face the far mummer to hold it and his knives come into your back; face him and both mummers walk. Up on his roof he is a jump and a cut away */
  plat(127, R - 4, 3); foe('archer', 128, { y: R - 5, juggler: true, squad: 'pincerRoof', cover: 'pincer' });
  ramp(150, 6);                                           /* the stair: six rows up over twelve tiles */
  block(162, 185, R - 6, H - 1);                          /* the stall-top terrace */
  foe('brute', 170, { y: R - 7, cnSkin: 'strongman', squad: 'top' });      /* THE ONE AT THE TOP: on the terrace where you stop to catch your breath, by the gallery */
  ent('deco', 172, R - 7, { kind: 'stall', v: 0 }); post(180, R - 7, 1);
  ent('mend', 183, R - 7);                                /* a heart at the far end of the terrace, after the pincer */
  /* THE SHOOTING GALLERY (taught): on the terrace three targets hang at chest height on the gallery's back wall. Hit all three (any blow, any hero) inside twelve seconds and the planks run up the
     stall fronts to THE CROW'S NEST (the silver, two tickets) */
  gallery({ id: 1, targets: [{ x: 171, row: R - 7 }, { x: 176, row: R - 7 }, { x: 181, row: R - 7 }], window: 12,
    planks: [[186, 187, R - 9], [183, 184, R - 12]],      /* the terrace top is row 22; 3 up, 3 up - the way in - and the nest's floor 3 up again */
    nest: { x0: 176, x1: 181, row: R - 15 } });
  plat(176, R - 15, 6); lamps.push({ x: 178, y: R - 16, life: 1, hung: 'nest' });   /* (claude/fairfix5) the nest's lantern is a REAL lamp (steady): the night cuts a hole round it, so the floor reads */   /* THE NEST'S FLOOR STANDS FROM THE START (claude/fairfix4, Daniel: "the floors must be VISIBLE"): the bull's-eye opens the way in, not the floor */
  ent('sign', 168, R - 7, { text: 'THE SHOOTING GALLERY. HIT ALL THREE TARGETS BEFORE THE BELL. THE PRIZES ARE UP THE STALL.' });
  tk(176, R - 16); tk(180, R - 16); coins([177, R - 16], [178, R - 16], [179, R - 16]);   /* the crow's nest: two tickets - and the key to what is past it */
  /* THE LOFT (claude/fairfix2: TICKETS ARE KEYS): past the crow's nest a striped gate stands on a plank walk over the stall row - SHOW 5 TICKETS. Behind it, the stall men's loft, and in it
     the fair's first SILVER (claude/fairfix3, review #14 "keys open more keys": the gallery opens the nest, the nest's tickets open the loft) */
  plat(182, R - 15, 14); ticketGates.push({ x: 188, y0: R - 20, y1: R - 16, need: 5, name: 'THE LOFT' }); ent('sign', 185, R - 16, { text: 'THE LOFT. SHOW 5 TICKETS.' });   /* (the gate stands five high, out of a jump's reach, and nothing under the loft reaches it) */
  tk(191, R - 16); ent('silver', 194, R - 16); ent('mend', 192, R - 16); coins([190, R - 16], [193, R - 16]); tk(195, R - 16);
  rampDown(186, 6);
  ent('deco', 204, S, { kind: 'barrels' });
  /* THE TAKINGS CELLAR (a secret; claude/fairfix3: it was called the back lot, which is the hatch by the door now): the stalls kept their takings under the floor. The plug in the floor is plain rock until struck (a plunge breaks it in one); a room below with its own stair back up,
     a silver, tickets, a heart. Never a softlock: the stair is there */
  sign(202, 'THE STALL MEN KEPT THEIR TAKINGS UNDER THE FLOOR.');
  ent('check', 199, S);                                   /* the second shrine: past the terrace, on the road over the takings cellar */
  cellar(198, 214, 206);
  ent('silver', 199, R + 6); tk(201, R + 6); tk(203, R + 6);   /* (claude/fairfix5: its third ticket is on the hoopla's prize shelf now, 123 - the count stays 35) */ ent('mend', 213, R + 6); coins([200, R + 6], [202, R + 6], [204, R + 6]);
  /* THE SWINGBOATS (claude/fairfix3; Daniel: "more rides" - a Victorian fairground's boats on an A-frame): a spiked pit thirteen wide (216-228) and past it THE HIGH STALL, a stall
     building six rows up (229-235, top row 22) - out of any jump from the road. The way on is the boat: from the stall roof at the pit's lip (211-214, six up) step off into it as it
     comes up to you, ride its arc down through the pit and up the far side, and LET GO AT THE TOP: from the top of its swing the high stall's roof is a hop up and over. Let go
     low, or late, and it is the spikes (a fall is climbed out of on the near side, and you go again). Its partner boat swings behind it, the other way (drawn only) */
  pit(216, 228); for (const x of [216, 217, 218, 226, 227, 228]) set(x, R + 1, T.SOLID);   /* (bare boards three wide at each lip of the spikes, 219-225: a fall at the bottom of the swing is climbed out of on the near side - see the chair-o-plane's note) */
  awning(208, 209, R - 2); awning(211, 213, R - 5); coins([212, R - 8], [221, R - 6], [222, R - 6]);   /* THE BOARDING STAIR, DEVELOPED (claude/fairfix5): two awnings at rising heights (rows 26 and 23) - the first throws you onto the second, the second up over the boat's near apex: drop into it as it comes up (they were two stall-roof planks) */
  block(229, 235, R - 6, R - 1);                          /* THE HIGH STALL: solid to the road, its roof row 22 */
  boats.push({ px: 221.5 * TS, py: 314, arm: 112, period: 3.6, phase: 0 });   /* the pivot over the pit's middle: the seat swings from 216 (row 24) through 221 (row 26.6) to 227 (row 24) */
  tk(231, R - 7); coins([230, R - 7], [233, R - 7]);
  plat(232, R - 9, 5); coins([234, R - 10]);               /* the top roof over the high stall (row 19): the bunting rope's end */
  /* THE COLLAPSING STALLS (claude/fairfix2): a spiked pit eight wide and two stall roofs over it that give way under you (src/tower-collapse.js counts them down: about a second
     and they go, and come back four seconds later). Keep moving */
  pit(236, 243); awning(237, 238, R - 2, true); awning(240, 241, R - 3, true);   /* (claude/fairfix5) THE TWIST: TEARING awnings - each rips on the bounce, so you chain them over the spikes */
  /* AND A HORSE AT THE EDGE (claude/fairfix2: 'horse charges at edges'; claude/fairfix3: on the high stall's roof now): it stands over the pit, facing on. You land behind it off the
     boat; walk past it to the roofs and your back is to it - it rears and charges, and the charge puts you in the spikes. Hold it in your look and cut it down first, or time the roofs with it behind you */
  foe('hobbyhorse', 234, { y: R - 7, face: 1, squad: 'edge' }); foe('mummer', 233, { y: R - 10, squad: 'edgeRoof', cover: 'edge' });   /* and a mummer on the roof over it, that drops after you onto the stall */
  /* (the two crumbles over the pit are the tearing awnings' own: awning(..., true)) */
  /* OR THE BUNTING ROPE (claude/fairfix2): from the top roof over the high stall (232-236, row 19) a line of bunting runs down over the pit to the road beyond. Stand at its end and press UP:
     you ride it down (the Falling Tower's slide line). (claude/fairfix3, review #12 "no slide that carries you across": its far third is FRAYED - drawn so, and it creaks as you take it -
     and it SNAPS `snap` s after you take it, over the pit: jump off onto the second roof (240) or the far bank before it goes. `speed`: a sagging line runs slower than a tower's) */
  zipLines.push({ x0: 236 * TS + 10, y0: (R - 9) * TS - 12, x1: 247 * TS, y1: R * TS - 20, bunting: true, speed: 130, snap: 0.6, fray: 0.66 });

  // ---------------- 3. THE MIDWAY (246-379): TWIST ----------------
  stall(256, 0); ent('deco', 260, S - 7, { kind: 'bunting', hang: true });
  pit(259, 261); post(264);
  block(262, 263, R - 1, R - 1);                          /* a step up, then the ride */
  block(264, 290, R - 2, R - 1);                          /* THE DISC: a raised floor, two tiles up, twenty-seven wide */
  carousels.push({ x0: 264, x1: 290, row: R - 2, period: 3.6, warn: 1.2, lock: 0.5, gallop: true, well: [280, 285] });
  /* (claude/fairfix5) THE GALLOPERS: the ride's horses are platforms now, bobbing on their brass poles round the disc (src/wicker-carousel.js, the Queen's own ring at a walk: a lesson
     for her fight). TEACH: ride one up to the ticket hung from the rounding boards. DEVELOP: the disc's boards are UP over a spiked well (280-285: bare boards at its two lips, a
     climb-out either side) - a horse carries you over it while the ride turns you. TWIST: the far end's hobby-horse rides a galloper */
  const gallop = { x0: 264 * TS, x1: 291 * TS, floor: (R - 2) * TS };
  for (let x = 280; x <= 285; x++) { set(x, R - 2, T.AIR); set(x, R - 1, T.AIR); } spikes(281, 284, R - 1);
  tk(270, R - 7);   /* 27 tiles is 4.7 s at a run: a 3.6 s turn turns everyone once (claude/fairfix: at 5 s you could run it and never be turned) */
  for (const x of [264, 277, 290]) ent('carousel', x, R - 3);   /* (its three brass poles: the ride's marks for the tools) */
  foe('mummer', 269, { y: R - 3, squad: 'ride' });        /* two riders already aboard, one at each end of the ride */
  foe('hobbyhorse', 286, { ride: 5, rideFair: 'galhorse', squad: 'ride' });   /* (claude/fairfix5) the far-end horse RIDES A GALLOPER now (it was standing on the disc's end)   /* (claude/fairfix2) a HORSE rides the far end now: the ride turns your back to it, and its charge runs you off the disc */
  coins([274, S - 3], [277, S - 3], [280, S - 3]);
  ent('deco', 294, S - 7, { kind: 'bunting', hang: true }); coins([292, S - 1], [294, S - 1]);
  /* A KNIFE JUGGLER ON THE NEAR BANK (claude/fairfix3: he stood on the far bank, ahead of you - and he keeps the rule now, so ahead of you he only juggled): on a stall roof behind
     the boarding place. Wait for a car facing the wheel and his knives come into your back; ride it and they follow you up */
  plat(291, R - 4, 3); foe('archer', 292, { y: R - 5, juggler: true, squad: 'wheelRoof', cover: 'wheel' });
  /* --- THE BIG WHEEL (hub column 304): six open gondolas on a circle, ten seconds a turn. The bottom of its run is a hop above the road; the top is the boardwalk's height (row 17) --- */
  const WH = { px: 304 * TS + 8, py: 22 * TS, r: 80, n: 6, period: 10, w: 30 };
  for (let i = 0; i < WH.n; i++) { const ph = i * 2 * Math.PI / WH.n, w = i === 0 ? 64 : WH.w; moversExtra.push({ kind: 'wheel', fair: 'gondola', idx: i, px: WH.px, py: WH.py, r: WH.r, phase: ph, period: WH.period, x: WH.px + Math.cos(ph) * WH.r - w / 2, y: WH.py + Math.sin(ph) * WH.r, w, h: 6, horse: i === 0 }); }
  foe('hobbyhorse', 304, { ride: 0, squad: 'wheel' });   /* A HORSE ON A GONDOLA: car 0 is a wide one and a hobby-horse rides it. Board it and you ride up facing it (a look holds it; its charge is the length of the car); or hop on another */
  sign(298, 'THE BIG WHEEL. HOP ON WHEN A CAR COMES ROUND LOW. STEP OFF AT THE TOP.');
  /* THE PIT UNDER THE WHEEL (claude/fairfix2: "pits under rides"): the yard under the wheel's foot is a spiked pit ten wide. The only way over is ON the wheel: board a car as it
     comes round low on the near side, ride it up and over, and step off on the far side as it comes down - or at the top, onto the boardwalk landing (the high road) */
  pit(300, 309);
  /* A BULL'S-EYE ON A CAR (claude/fairfix2: bull's-eyes open things, some on the rides): a target hangs under car 3 and goes round with it. Strike it as it passes and planks run
     up off the landing to the prize shelf over the wheel (two tickets and a heart) */
  gallery({ id: 4, targets: [{ x: 304, row: 27, on: { kind: 'gondola', idx: 3, dy: 18 } }], window: 1, planks: [[308, 309, 14]], nest: { x0: 311, x1: 313, row: 11 }, say: 'A BULL\'S-EYE! THE PLANKS RUN UP OVER THE WHEEL' });
  plat(311, 11, 3); lamps.push({ x: 312, y: 10, life: 1, hung: 'nest' });   /* (claude/fairfix5) its lantern, a real lamp */   /* the shelf's floor stands from the start (claude/fairfix4): the bull's-eye drops the gangplank up to it */
  tk(311, 10); tk(313, 10); ent('mend', 312, 10);
  /* --- THE HIGH ROAD: the wheel lets off at the top onto the boardwalk (row 17); three swing-ride chairs carry you across the hall's roof to the tower --- */
  plat(309, 17, 5);                                       /* cols 309-313: the boardwalk's landing (claude/fairfix5: CUT BACK from 306 - the top car no longer steps onto it: hop car to car, or step off one coming down the far side) */
  plat(326, 17, 4);                                       /* island A: cols 326-329 */
  plat(344, 16, 4);                                       /* island B: cols 344-347, a row higher */
  /* THE HIGH ROAD'S OWN TEST (claude/fairfix): a MARIONETTE on island A - you ride the chair toward it looking at it, so it comes to meet you; and a HORSE at the near end of island B,
     facing the way you come: you land past it, with your back to it, and chair three swings in from the other side */
  foe('stringjack', 328, { y: 16, squad: 'islandA' });
  foe('hobbyhorse', 344, { y: 15, face: 1, squad: 'islandB' });
  const chair = (cx, py, arm, ph, per, mast) => { const th = Math.sin(ph) * 0.9; moversExtra.push({ kind: 'swing', fair: 'chair', px: cx * TS, py, arm, x: cx * TS + Math.sin(th) * arm - 24, y: py + Math.cos(th) * arm, w: 48, h: 8, period: per, phase: ph, mast }); };   /* mast: [x, base y, x, base y] of the two masts the beam hangs between (drawn) */
  chair(320, 11 * TS, 96, 0, 3.2, [313 * TS + 8, 17 * TS, 326 * TS + 8, 17 * TS]); chair(337, 10 * TS, 96, 1.6, 3.4, [329 * TS + 8, 17 * TS, 344 * TS + 8, 16 * TS]); chair(353, 8 * TS, 96, 0.7, 3.0, [347 * TS + 8, 16 * TS, 361 * TS + 8, 14 * TS]);   /* seats rest at rows 17, 16, 14: the levels of the islands and the tower top */
  coins([309, 15], [311, 15], [327, 15], [328, 15], [345, 14], [346, 14]); tk(312, 15);
  /* --- THE LOW ROAD: THE HALL OF MIRRORS (a covered lane, dark; its roof is row 21-22) --- */
  const hx0 = 317, hx1 = 339;                             /* the hall's inside; its roof runs 316-340 */
  block(316, 340, 21, 22);                                /* the roof: a way for anybody who falls off a chair */
  spikes(317, 324, 20);                                   /* (claude/fairfix2: "swing chairs over pits/spikes") the hall's roof under chair one is a bed of spikes: miss the island and it bites */
  foe('stringjack', 320, { squad: 'glass' });             /* B (claude/fairfix): A MARIONETTE by the door, in the door lantern's light. Look at it and it comes; pass it and a TRUE mirror ahead of you works its strings from behind */
  foe('mummer', 330, { squad: 'glass' });                 /* A: stands in front of the CRACKED glass, the one place no mirror can watch your back. Stand where a true mirror is ahead of you, and fight it there */
  const hall = { x0: hx0, x1: hx1, roof: 21, floor: R, dim: 88, reach: 112,
    mirrors: [{ x0: 318, x1: 322, kind: 'true' }, { x0: 326, x1: 331, kind: 'cracked' }, { x0: 334, x1: 338, kind: 'true' }], plug: { x0: 328, x1: 329 }, fake: 328 };
  /* THE CLOSET BEHIND THE CRACKED GLASS (a secret): a plug in the floor in front of the cracked panel, and a room below with a stair back up */
  cellar(321, 337, 328);
  tk(323, R + 6); tk(325, R + 6); ent('mend', 336, R + 6); coins([322, R + 6], [324, R + 6], [326, R + 6]);
  /* THE DOOR IN THE GLASS (claude/fairfix2: hidden paths via mirror reflections): stand by the cracked panel facing the TRUE glass at the door end and it shows a door at your back
     that is not on this side of the glass. Step through it (UP) into the fortune-teller's room under the ticket yard: two tickets and a heart, and a door back */
  ent('doorway', 324, S, { id: 'glassA', to: 'glassB', mirror: true, kind: 'goblin' });
  for (let y = R + 2; y <= R + 5; y++) for (let x = 340; x <= 347; x++) set(x, y, T.AIR);
  ent('doorway', 341, R + 5, { id: 'glassB', to: 'glassA', kind: 'goblin' });
  ent('mend', 345, R + 5); tk(343, R + 5);   /* (claude/fairfix5: its second ticket hangs from the gallopers' rounding boards now, 270 - the count stays 35) */ coins([344, R + 5], [347, R + 5]);
  const fortune = { x0: 340, x1: 347, y0: R + 2, y1: R + 5 };
  post(322, S, 1); post(335, S, 0.5);             /* a lantern in the dark: it holds by the door, and gutters at the far end */
  /* the ticket yard, and THE TOWER'S STAIR: three flights up to the landing (a mummer waits there under a lantern that gutters), then the step to the tower top */
  sign(346, 'THE HELTER-SKELTER. THE STAIR IS DARK. HOLD DOWN ON THE SLIDE AND RIDE IT.');
  plat(348, R - 3, 3); plat(351, R - 6, 3); plat(354, R - 9, 5); plat(359, R - 12, 2);   /* rows 25, 22, 19 (the landing, cols 354-358), 16: a 3-row step each; the tower top is row 14 */
  foe('mummer', 357, { y: S - 9, squad: 'stair' });       /* (batch62: stays a MUMMER - the knife juggler over the ticket yard covers THIS squad and only a look-held foe makes his knives mean anything; the strongmen are the other five) on the landing: your dusk is short here; it is held only in the lantern's light or within arm's length. It drops after you (claude/fairfix2) */
  plat(343, 19, 2); foe('archer', 343, { y: 18, juggler: true, squad: 'stairTop', cover: 'stair' });   /* and a KNIFE JUGGLER on a perch over the ticket yard (claude/fairfix2; claude/fairfix3: he stood on the
     tower top, ahead of the climb, where a look held him): behind you as you climb, his knives come up the stair at your back while the landing's mummer holds your look */
  post(355, 18, 0.5);
  /* THE GALLERY AGAIN (developed): three targets in the ticket yard, a shorter window; the planks run up to the hall's roof (a nest of tickets and a heart) */
  gallery({ id: 2, targets: [{ x: 341, row: S }, { x: 343, row: S }, { x: 345, row: S }], window: 10, planks: [[344, 345, R - 3], [342, 343, R - 6]], nest: { x0: 326, x1: 339, row: 21 } });
  tk(333, 20); tk(336, 20); ent('mend', 330, 20); coins([328, 20], [331, 20], [338, 20]);
  const tower = { x0: 361, x1: 366, top: 14 };
  block(tower.x0, tower.x1, tower.top, R - 1);            /* THE TOWER: solid to the road; its top is row 14 (the seats of chair three rest here) */
  slide(367, tower.top, 11);                              /* THE SLIDE: cols 367-377, rows 14-24, then a three-row drop to the road (claude/fairfix) */
  /* THE HORSE STALL under the slide's foot (claude/fairfix: the horse at the foot stood ahead of you, frozen before you landed): a hollow under the last of the slide, open to the road,
     and a hobby-horse in it facing out. You come down the slide past it, drop to the road, and it is at your BACK */
  for (let x = 372; x <= 377; x++) for (let y = tower.top + (x - 367) + 1; y < R; y++) set(x, y, T.AIR);
  foe('hobbyhorse', 374, { face: 1, squad: 'foot' });
  foe('brute', 392, { y: R - 3, cnSkin: 'strongman', squad: 'foot2' });       /* and a mummer on the hill ahead: turn round to hold the horse and your back is to this one (the combine) */
  ent('deco', 363, tower.top - 1, { kind: 'bunting', hang: false });

  // ---------------- 4. THE HARVEST (379-502): COMBINE ----------------
  ent('check', 383, S); stall(386, 1); post(382, S, 1);   /* the third shrine: the slide's foot */
  hill(385, 2, 4);                                        /* the road out of the slide (385-396) */
  coins([390, R - 3], [392, R - 3]);   /* (claude/fairfix5: the painted hay bale at 400 is a real one now - the push bale below) */
  /* (claude/fairfix5) THE HAY ELEVATOR AND THE BALES, the barns' own section:
     TEACH   a hay BALE on the road is a push block (src/push-blocks.js): push it under the loft ledge (400-401, row 24) and climb - coins up there;
     DEVELOP THE HAY ELEVATOR, an inclined slat conveyor (movers on a line: src/fair-rides.js slatAt) from the hill top (391, row 26) up to the corn-top plank (405, row 13): it
             carries you up past a PITCHFORK MUMMER at its head - face up the belt to hold it;
     TWIST   at its head the belt TIPS OVER into the rick and the harrow tines below: jump from the last slat for THE HAYLOFT's door (403, 12 tickets), or step off onto the
             corn-top plank. The hayloft is a loft now (a boarded floor and its west wall) so the belt cannot carry you in under its gate */
  ent('pushblock', 397, S); plat(400, R - 4, 2); coins([400, R - 5], [401, R - 5]);
  const elevator = { x0: 391 * TS + 8, y0: (R - 2) * TS, x1: 405 * TS + 8, y1: 13 * TS, n: 10, speed: 26, w: 18 };
  for (let i = 0; i < elevator.n; i++) moversExtra.push({ kind: 'slat', fair: 'slat', idx: i, el: elevator, x: elevator.x0 - 9, y: elevator.y0, w: elevator.w, h: 4, broken: i > 0 });
  foe('mummer', 406, { y: 11, squad: 'elevator' });   /* THE PITCHFORK MUMMER at the belt's head (the sixteenth: tools/harvest-fair.mjs counts it) */
  plat(387, R - 5, 4); coins([388, R - 6], [390, R - 6]);   /* (claude/fairfix5: cut to 387-390, out of the hay elevator's way) */   /* the roofs over the road out of the slide */
  stack(402, 405); spikes(406, 408, S);                   /* a rick, and three tiles of spikes past it: the hay is the way over */
  /* THE TALL STRIKER (twisted): past the spikes, under a plank at the maze's roof (row 12): a plunge throws you 18 rows, onto THE CORN-TOP WALK over the maze. The maze is the road; the roof is the way over it */
  strikers.push({ id: 2, x: 409, row: R, launch: -760, tickets: 2, big: true });
  plat(399, 12, 12);   /* the plank at the maze's roof (407-410) and, west of it, THE HAYLOFT (claude/fairfix2): only the tall striker throws you this high, and a gate stands on the plank - SHOW 12 TICKETS */
  for (let x = 399; x <= 402; x++) set(x, 12, T.SOLID); block(398, 398, 7, 12);   /* (claude/fairfix5) the hayloft's boarded floor and its west wall: in only through its gate */
  ticketGates.push({ x: 403, y0: 7, y1: 11, need: 12, name: 'THE HAYLOFT' }); ent('sign', 405, 11, { text: 'THE HAYLOFT. SHOW 12 TICKETS.' });
  ent('mend', 400, 11); tk(399, 11); tk(401, 11); coins([402, 11]);
  /* --- THE CORN MAZE (cols 412-436): three tiers, each a corridor, each turn a blind corner (walls stop your look), a mummer in a scarecrow's coat at the turn --- */
  const mx0 = 412, mx1 = 436;
  block(mx0 - 1, mx0 - 1, 12, 22);                        /* the left wall (tier one is open at the foot) */
  block(mx0 - 1, mx1 + 1, 12, 13);                        /* the roof (and the corn-top walk on it) */
  block(mx0, mx1, 23, 23);                                /* divider one: tier one's roof, tier two's floor (row 23) */
  block(mx0, mx1 + 1, 18, 18);                            /* divider two: tier two's roof, tier three's floor (row 18) */
  block(mx1 + 1, mx1 + 1, 19, 27);                        /* the right wall of tiers one and two */
  block(mx1 + 1, mx1 + 1, 12, 13);
  /* the chimneys are FOUR wide with a two-wide step in the middle (row 26 in one, row 21 in two): you jump up off the step, rise three rows through the gap, and steer onto the floor at its edge */
  const c1 = mx1 - 4;                                     /* chimney one (tier one -> two) at the right, chimney two (two -> three) at the left */
  for (let x = c1 - 1; x <= c1 + 2; x++) set(x, 23, T.AIR);
  plat(c1, 26, 2);                                        /* the step in chimney one (row 26) */
  for (let x = mx0 + 2; x <= mx0 + 5; x++) set(x, 18, T.AIR);
  plat(mx0 + 3, 21, 2);                                   /* the step in chimney two (row 21) */
  foe('mummer', mx1 - 1, { y: 22, scare: true, squad: 'corn1' });   /* THE FIRST TURN: right of chimney one, in tier two. You climb out and turn left to go on: it is behind you */
  foe('mummer', mx0, { y: 17, scare: true, squad: 'corn2' });       /* THE SECOND TURN: left of chimney two, in tier three (the dark tier). You climb out and turn right: it is behind you */
  foe('mummer', mx0 + 20, { y: 11, scare: true, squad: 'corntop' });   /* THE CORN-TOP WALK'S OWN (claude/fairfix): a scarecrow that is not straw, up in the full dark where your look reaches only an arm's length or two */
  for (const [x, r] of [[mx0 + 6, R - 1], [mx0 + 16, R - 1], [mx0 + 8, 22], [mx0 + 18, 22], [mx0 + 12, 17], [mx0 + 12, 11], [mx0 + 4, 11]]) scarecrows.push({ x, row: r });   /* the straw ones: on a pole, a hat, arms out (one watches from the roof) */
  corn.push([mx0 - 1, mx1 + 1, 12, 27]);                  /* drawn as standing corn over the walls */
  post(mx0 + 10, R - 1, 0.5); post(mx0 + 14, 22, 0.5); post(mx0 + 18, 17, 0.5); post(mx0 + 4, 11, 0); post(mx0 + 20, 11, 0);   /* lanterns in the corn: they gutter; the higher, the darker */
  tk(mx1 - 1, 17); coins([mx0 + 8, 17], [mx0 + 10, 17], [mx0 + 12, 22], [mx0 + 20, 22]);
  tk(mx0 + 6, 11); tk(mx0 + 16, 11); coins([mx0 + 2, 11], [mx0 + 9, 11], [mx0 + 13, 11], [mx0 + 19, 11], [mx0 + 23, 11]);   /* the corn-top walk pays */
  /* the way out: from the end of tier three (row 18) steps down outside the corn to the road; the roof walk comes down the same stair (rows 15, 18, 21, 24) */
  plat(mx1 + 2, 15, 2); plat(mx1 + 5, 18, 2); plat(mx1 + 2, 21, 2); plat(mx1 + 5, 24, 2);
  /* THE CAGE IN THE CORN (claude/fairfix2: a bull's-eye opens a cage; claude/fairfix3: and now it opens THE WAY - the first bull's-eye the fair asks of you, taught before the exam's):
     iron bars stand across tier one in front of chimney one, floor to roof (col 429), and a target is nailed to a post in the tier (420). Strike it and the bars drop: the chimney is
     the way up. (The tall striker's corn-top walk is the other way over the maze: a game either way.) A ticket lies in the pocket past the chimney */
  gallery({ id: 5, targets: [{ x: mx0 + 8, row: S }], window: 1, bars: [[mx1 - 7, mx1 - 7, 24, 27]], planks: [], say: "A BULL'S-EYE! THE BARS DROP: THE WAY UP" }); block(mx1 - 7, mx1 - 7, 24, 27); cages.push([mx1 - 7, mx1 - 7, 24, 27]); tk(mx1, 27);
  /* A MUMMER AT THE FOOT OF THE MAZE'S STAIR (claude/fairfix3: its two crows are cut - they dove whether you looked or not, the review's foe that ignores the mechanics): you come down
     past it, and it is at your back while you time the chairs */
  foe('brute', mx1 + 4, { cnSkin: 'strongman', squad: 'stairfoot' });
  /* THE CHAIR-O-PLANE (claude/fairfix3; Daniel: "more rides" - the swing carousel of the Edwardian fairs, chairs on chains flung out from a turning crown): a spiked pit fifteen
     wide (449-463) and the ride's mast in its middle (455). Its twelve chairs fly round on their chains; seen from the road the near ones come TOWARD you (right to left) at the
     height of a stall roof, and the far ones go round behind the mast, up under the crown, where no one can stand. So you cross AGAINST the ride: step into a chair as it
     slows at the near end, and before it swings round behind, hop to the next one coming - chair to chair, out over the spikes, until the one that has just come round on the far
     side lets you off onto the bank. Two MUMMERS ride the opposite chairs (0 and 6): come round at you, they stand while you face them; ride past one and it is at your back.
     A ticket hangs over the mast's foot, for a hop up off a chair (src/fair-rides.js; drawn by src/redraw/fair_newrides.js) */
  /* (the pit is 449-463: each bank runs out under an end of the ride (448, 464), so a chair that swings round behind sets its rider down on the bank, not in the spikes - the
     ride's own turn is a reset, a missed hop is the cost. Its spikes are 452-460, bare boards three wide at each lip: a fall is climbed out of at either end - the far one only
     after you have ridden most of it. A spike bed wider than a hop holds a hero who falls in its middle, bouncing, until it kills him: a ride's pit costs, it does not execute) */
  for (let x = 449; x <= 463; x++) { set(x, R, T.AIR); set(x, R + 1, T.AIR); } spikes(452, 460, R + 1);
  chairos.push({ cx: 455 * TS + 8, cy: (R - 2) * TS, R: 8 * TS, period: 14, n: 12, phase: 0 });   /* the near seats run at row 26 (two up from the road: a hop), the ends a little higher */
  foe('mummer', 455, { ride: 0, rideFair: 'chairo', squad: 'chairs' }); foe('mummer', 455, { ride: 6, rideFair: 'chairo', squad: 'chairs' });
  tk(455, 23); coins([447, S - 4], [463, S - 4]);
  ent('check', 466, S);                                   /* the fourth shrine: on the bank, right before the fire (a chase keeps a shrine within fifteen columns of its start) */
  /* THE EFFIGY CATCHES FIRE (claude/fairfix2; Daniel: the ghost train was anachronistic. src/chase.js, look 'fire'): the half-built wicker effigy you have watched go up behind the
     fair stands on the bank here. Cross the start line and it goes up, and the fire runs down the straw after you - kill on contact, like every chase; the speed-ups are told.
     The road sinks into a straw lane (469-524) and you CHOOSE YOUR LANE:
       LOW  the straw lane: burning BUNTING slung across it (a line that sags and lifts: duck under it or wait for it), fallen stalls to jump, and two mummers to run past
       HIGH the stall roofs over the lane: no bunting, but every roof GIVES WAY under you a breath after you land (src/tower-collapse.js) - keep jumping, or drop into the lane
     The fire takes the mummers it overtakes (runsOver). It pays off the effigy you watched them build, and it is the Queen's fire before you meet her */
  cut(469, 3, 44);                                        /* the descent 469-474, the lane 475-518 (floor row 31), the climb 519-524 */
  post(478, R + 2, 0.5); post(494, R + 2, 1); post(508, R + 2, 0);
  foe('mummer', 478, { y: R + 2, squad: 'fire' }); foe('brute', 505, { y: R + 2, cnSkin: 'strongman', squad: 'fire' });   /* each a few steps before a line of bunting */
  block(490, 490, R + 2, R + 2); block(502, 502, R + 2, R + 2); fallen.push(490, 502);   /* two fallen stalls across the lane: a tile high, a hop */
  for (const [x0, row] of [[471, R - 1], [478, R - 2], [485, R - 1], [492, R - 2], [499, R - 1], [506, R - 2], [513, R - 1]]) {   /* the HIGH lane: seven stall roofs, a three-tile gap between, each one gives; past the last the lanes meet - drop into the straw and run the climb out with the fire behind */
    plat(x0, row, 4); crumbles.push({ x0, x1: x0 + 3, row, rows: 1, count: 0.7, kind: 'stall', fire: true }); }
  const beam = (x, period) => ({ x0: x * TS, x1: (x + 2) * TS, y: (R + 3) * TS - 10, th: 6, dmg: 14, name: 'THE BURNING BUNTING', period, up: 1.2, bunting: true });   /* down for period - 1.2 s, up for 1.2 s; three periods, so they never lift together */
  const chases = [{ id: 'effigy', name: 'THE BURNING EFFIGY', look: 'fire', dir: 1, trigger: 476 * TS, end: 525 * TS, gap0: 200, runsOver: true, say: 'THE EFFIGY IS ALIGHT! RUN!',
    curve: [[0, 60], [240, 74, 'THE FIRE CATCHES THE BUNTING'], [480, 86, 'THE STALLS ARE BURNING! RUN!']], zone: [468 * TS, 527 * TS, (R - 6) * TS, (R + 3) * TS + 8],   /* (the bottom is under the floor: a hero's feet stand ON row R + 3) */
    beams: [beam(484, 2.6), beam(496, 2.3), beam(511, 2.9)], checkpoint: [466, S] }];

  // ---------------- 5. THE LAST ROUND (525-619): EXAM - ONE SPACE THAT ASKS ALL OF IT AT ONCE (claude/fairfix) ----------------
  /* THE SMALL CAROUSEL UNDER ITS CANOPY: a striped roof over the disc, dark inside (a covered place, like the hall), two lanterns that gutter, a TRUE mirror panel at the far end
     and a cracked one at the near end. A mummer and a MARIONETTE ride it: face the mummer to hold it and you are working the marionette's strings; the ride turns you, and the
     mirror ahead of you - when it is ahead - is the only thing watching your back */
  block(528, 529, R - 1, R - 1);
  block(530, 554, R - 2, R - 1);                          /* the disc: 25 wide, two up */
  carousels.push({ x0: 530, x1: 554, row: R - 2, period: 3.4, warn: 1.2, lock: 0.5 });   /* 25 tiles is 4.3 s at a run: it turns you at least once */
  for (const x of [530, 542, 554]) ent('carousel', x, R - 3);
  block(529, 555, 19, 20);                                /* THE CANOPY: its roof (a walk over it for anyone up there) */
  const canopy = { x0: 530, x1: 554, roof: 19, floor: R - 2, canopy: true, dim: 88, reach: 112, mirrors: [{ x0: 530, x1: 533, kind: 'cracked' }, { x0: 550, x1: 554, kind: 'true' }] };
  post(535, 22, 0.5); post(548, 22, 0.5);                 /* its two lanterns, hung from the canopy: both gutter */
  foe('mummer', 540, { y: R - 3, squad: 'round' }); foe('stringjack', 547, { y: R - 3, squad: 'round' });
  stack(556, 559); spikes(560, 562, S);                   /* a rick, and spikes past it */
  /* THE KNIFE JUGGLER OVER THE RICK (claude/fairfix2): on a stall roof past the disc. The ride turns you, and when it does his knives are in your back; the hay under him throws you
     up to him, if you go */
  plat(556, R - 5, 3); foe('archer', 557, { y: R - 6, juggler: true, squad: 'roundRoof', cover: 'round' });
  /* THE TALL STRIKER AGAIN (examined), AND NOW THE ONLY WAY ON (claude/fairfix3; the review's P1: "the fair's games are never REQUIRED"): past it the road is gone - THE SPIKE YARD,
     a pit twenty-six wide (569-594) under the last round, with a stall's back wall at its far end (595) from the pit floor to the lane. The striker throws you onto THE NIGHT LANE, a
     plank run over the yard in full night; its mummer is held ONLY while the lantern by it burns (the lantern gutters: it creeps in the dark beats) or from an arm's length or two.
     A fall into the yard: spikes at both ends, a bare floor in the middle (576-587) and a stair of crates from it back up to the lane - it costs, it is never a softlock */
  strikers.push({ id: 3, x: 566, row: R, launch: -740, tickets: 2, big: true });
  for (let x = 569; x <= 594; x++) { set(x, R, T.AIR); set(x, R + 1, T.AIR); } spikes(569, 575, R + 1); spikes(588, 594, R + 1);
  block(595, 595, 14, R + 1);                             /* the far stall's back wall: the lane's end stands on it */
  plat(577, 27, 2); plat(580, 24, 2); plat(583, 21, 2); plat(586, 18, 2);   /* the crates back up out of the yard's bare middle (3 rows a step) to the lane */
  coins([582, R + 1], [583, R + 1], [584, R + 1], [585, R + 1], [567, S], [568, S], [567, S - 1], [568, S - 1]);   /* (a fall's small change in the yard, and past the pad: gold, never a free heart in the exam) */
  plat(563, 14, 9); plat(575, 14, 5); plat(583, 15, 5); plat(591, 14, 4);   /* the lane: three-tile gaps (the real jump), in the dark */
  /* (claude/fairfix5) THE SCENIC RAILWAY: the night lane is a derelict switchback's timber track (src/redraw/fair_tiles.js 'track', its trestles behind): its HUMPS are slopes
     (slow up, slide down) on the first and the last runs, its gaps are where the track is missing, and its targets hang on its lamp posts. The striker still throws you up at 566 */
  const hump = (x0, top) => { set(x0, 13, T.SLOPE_R2A); set(x0 + 1, 13, T.SLOPE_R2B); for (let x = x0 + 2; x < x0 + 2 + top; x++) set(x, 13, T.ONEWAY); set(x0 + 2 + top, 13, T.SLOPE_L2B); set(x0 + 3 + top, 13, T.SLOPE_L2A); };
  hump(567, 1); hump(591, 0);
  post(568, 13, 0.5); post(578, 13, 0.5); post(585, 14, 0.5);
  foe('mummer', 584, { y: 14, squad: 'lane' });
  tk(571, 13); tk(589, 13); coins([573, 12], [581, 12]);
  /* THE GALLERY, EXAMINED, AND IT OPENS THE WAY DOWN (claude/fairfix3; review P1 (b)): its three targets hang along the lane at chest height - struck from the planks, inside nine
     seconds - and they hold THE SHUTTER, iron bars over the lane's end (595, rows 9-13, out of a jump's reach). Struck, the bars drop and the way down (596-600) is open. The
     barker's call from the canopy roof turns you off the lane's mummer while you strike them */
  plat(596, 18, 3); plat(599, 22, 2);                     /* the way down off the lane: two steps to the road, before the shrine */
  tk(596, 17); tk(598, 17); ent('mend', 597, 17);         /* (the prize the nest under the lane used to hold, on the way down now) */
  gallery({ id: 3, targets: [{ x: 570, row: 12 }, { x: 578, row: 13 }, { x: 587, row: 14 }], window: 9,   /* (claude/fairfix5: the first target hangs a row higher, over the hump) */ planks: [], bars: [[595, 595, 9, 13]], say: 'THE SHUTTER DROPS: THE WAY DOWN' });
  block(595, 595, 9, 13); cages.push([595, 595, 9, 13]);
  /* THE BARKER AGAIN, on the canopy's roof behind you: as you land on the lane his call turns you round to him - your back to the lane's mummer, and off the targets */
  foe('barker', 553, { y: 18, elite: true, squad: 'caller2' });
  post(597); ent('check', 600, S);                        /* the door's checkpoint: the last one the road passes before the green */
  /* THE BACK LOT (claude/fairfix2: TICKETS ARE KEYS; it was the prize booth; claude/fairfix3: it opens on 30 of the 35 now, and stands past the shrine): a hatch in the road
     and a sign - SHOW 30 TICKETS. Hold that many and the hatch drops open into the stall men's back lot: a silver, and a stair back up */
  ent('sign', 604, S, { text: 'THE BACK LOT. SHOW 30 TICKETS.' });   /* (claude/fairfix5: the stall that stood at 606 is the FORTUNE-TELLER's caravan now - fairDress - by the hatch) */
  for (let y = R + 1; y <= R + 6; y++) for (let x = 597; x <= 608; x++) set(x, y, T.AIR);
  plat(604, R + 4, 3); plat(602, R + 2, 2);   /* the stair back up through the hatch */
  ticketGates.push({ x: 602, w: 2, y0: R, y1: R, all: true, need: 30, hatch: true, name: 'THE BACK LOT' });
  ent('vault', 598, R + 6); ent('silver', 600, R + 6); coins([599, R + 6], [601, R + 6], [607, R + 6]);
  const backLot = { x0: 597, x1: 608, y0: R + 1, y1: R + 6 };
  /* THE BLIND STALL (moved past the shrine by claude/fairfix3; the yard took its road): a stall's back wall, two high, across the road in the dark. You cannot see through it, so the
     mummer behind it creeps up to the wall while you come - listen for bells */
  block(607, 608, R - 2, R - 1);
  foe('mummer', 610, { squad: 'stall' });
  const blinds = [[605, 613, (R - 6) * TS, R * TS]];
  /* THE DOOR GUARD ON AN UNLIT STRETCH: no lamp from 603 to the door. In the dark a horse is held only from 88 px, and it finds you from twice that: walk in and it comes */
  const unlit = [[603, 619]]; post(606, S, 0); post(613, S, 0);   /* its posts stand, their lamps out */
  foe('hobbyhorse', 615, { elite: true, gate: 620, squad: 'guard' });     /* THE DOOR GUARD, the level's ELITE: it holds the green's door (the gate comes down over it) until it is dead */

  // ---------------- THE MAYPOLE GREEN (622-672): THE WICKER QUEEN's arena (claude/fair3, src/wicker-queen.js), ON THE CAROUSEL (claude/fairboss) ----------------
  /* the whole green is one turning ride (src/wicker-carousel.js): the maypole is its CENTRE COLUMN, the bonfire the engine's FIREBOX just downstream of it */
  const G = { x0: 622, x1: 668, door: 620, maypole: 644, bonfire: 647, floor: R, carousel: true };
  block(620, 621, 0, R - 1);                              /* the door: a narrow gap under a lintel, then the green */
  for (let y = S - 3; y <= S; y++) { set(620, y, T.AIR); set(621, y, T.AIR); }
  block(669, 671, 0, R - 1);                              /* the wall behind the gate */
  sign(616, 'SHE MOVES WHEN YOU LOOK AWAY. SPEAR HIGH: DUCK. LOW: JUMP. FLOOR BURNS: RIDE.');   /* outside the door, beside its checkpoint: read before the walls close */
  ent('wickerqueen', 634, S, { face: -1 });               /* THE WICKER QUEEN, UPSTREAM of her fire: the first lesson is the ride's - hold her in your look and it carries her onto it. After a burn she is flung off downstream, and then you turn your back to draw her across it against the ride */
  ent('gate', 666, S);                                    /* and the road goes on from here once she is down (gateAfterBoss) */
  const arena = { x0: 623 * TS, x1: 667 * TS, floor: R * TS, y0: (R - 14) * TS, trigger: 627 * TS, wallL: 622, wallR: 667, boss: 'wickerqueen', music: 'wickerqueen', tint: '#2a1a30', tintA: 0.12, fx: 'embers' };
  /* THE HORSES: platforms (movers of kind 'carhorse', turned by main.js from the ride's state), placed where the ride stands before she wakes */
  { const ring = newRing(arena); for (let i = 0; i < RING.horses; i++) { const h = horseAt(ring, i); moversExtra.push({ kind: 'carhorse', i, x: h.x - RING.w / 2, y: h.y, w: RING.w, h: RING.h, broken: !h.front }); } }

  /* THE NEW RIDES' MOVERS (claude/fairfix3): a swingboat is a swing (main.js moves it, and a jump off it keeps what it gave you); a chair-o-plane's chairs are movers of kind
     'chairo' that src/fair-rides.js places from the ride's clock (main.js moves them; round the back of the mast a chair is no platform) */
  { const r = newRing(gallop); for (let i = 0; i < RING.horses; i++) { const h = horseAt(r, i); moversExtra.push({ kind: 'galhorse', fair: 'galhorse', idx: i, i, x: h.x - RING.w / 2, y: h.y, w: RING.w, h: RING.h, broken: !h.front }); } }   /* (claude/fairfix5) THE GALLOPERS' horses */
    for (const b of boats) { const th = Math.sin(b.phase) * 0.9; moversExtra.push({ kind: 'swing', fair: 'boat', px: b.px, py: b.py, arm: b.arm, period: b.period, phase: b.phase, x: b.px + Math.sin(th) * b.arm - 24, y: b.py + Math.cos(th) * b.arm, w: 48, h: 8 }); }
  for (const c of chairos) for (let i = 0; i < c.n; i++) { const h = chairAt(c, i, 0); moversExtra.push({ kind: 'chairo', fair: 'chairo', idx: i, ring: c, x: h.x - CHAIRO.w / 2, y: h.y, w: CHAIRO.w, h: CHAIRO.h, broken: !h.front }); }
  /* THE MARKS FOR THE TOOLS: every game and ride the level is built round is also an entity of its own kind (the spawner ignores them; src/fair-games.js keeps the state) */
  for (const g of ticketGates) if (!g.hatch) block(g.x, g.x + (g.w || 1) - 1, g.y0, g.y1);   /* a TICKET GATE is solid until its price is shown (src/fair-keys.js); a hatch is the road itself */
  for (const s of strikers) ent('striker', s.x, S, { launch: s.launch, big: s.big });
  for (const g of galleries) for (const q of g.targets) ent('gtarget', q.x, q.row, { gallery: g.id });
  for (const q of tickets) ent('ticket', q.x, q.row);
  for (const m of hall.mirrors) ent('mirror', m.x0, S, { kind: m.kind });
  const baseRow = x => { for (let y = 23; y < H; y++) { const q = L.grid[y * W + x]; if (q !== T.AIR && q !== T.SPIKE) return y - 1; } return S; };   /* a lamp with no row stands on the road under it (from row 23 down, so a roof over the road does not take it) */
  for (const l of lamps) if (l.y === undefined) l.y = baseRow(l.x);
  const tints = [[0, 118, [255, 196, 110], 0.10], [118, 246, [255, 160, 90], 0.12], [246, 372, [235, 120, 110], 0.14], [372, 525, [170, 100, 150], 0.16], [525, 622, [80, 80, 160], 0.18], [622, W, [60, 60, 130], 0.20]];
  /* THE WICKER EFFIGY going up behind the fair: five stages, one every hundred columns or so, so you pass it again and again as you climb (the queen, finished, stands by the door) */
  const effigies = [{ x: 78, stage: 0 }, { x: 196, stage: 1 }, { x: 322, stage: 2 }, { x: 461, stage: 3, burns: true, world: true }, { x: 592, stage: 'ash' }];   /* (claude/fairfix2) the fourth stands on the bank at the fire's start line and BURNS; after it, ash */
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: S }, pools: [], falls: [], moversExtra, interiors: [],
    carousels, haystacks, lamps: lampsOut(lamps), arc: ARC, stair: { x0: 150, top: 162 }, green: G, tints, arena, gateAfterBoss: true,
    walls, gallery: galleries[0], galleries, strikers, tickets, booth: null, backLot, hall, halls: [hall, canopy], blinds, unlit, tower, wheel: WH, slide: { x0: 367, y0: tower.top, n: 11, stall: { x0: 372, x1: 377 } }, corn, scarecrows, effigies,
    chases, fallen, zipLines, poles, cages, ticketGates, crumbles, fortune, boats, chairos, awnings, gallop, elevator,   /* (claude/fairfix5) the springy awnings, the gallopers' ride */
    unlocks: [   /* (claude/batch52) what each collectible or target opens, for tools/level-quality.mjs; the HUD lines are src/fair-keys.js KEYS_TEXT */
      { kind: 'ticket', opens: 'the ticket gates (the loft and its silver, the hayloft) and, 30 of the 35, THE BACK LOT', hud: 'TICKETS OPEN THE GATES; 30 OPEN THE BACK LOT' },
      { kind: 'gtarget', opens: 'the way on (the corn\'s bars over chimney one, the shutter over the night lane\'s end) and the planks to the nests', hud: 'THE SHUTTER DROPS: THE WAY DOWN' },
      { kind: 'striker', opens: 'the way up (the night lane over the spike yard) and a ticket paid on its first ring', hud: 'THE BELL RINGS' }],
    maze: { x0: mx0, x1: mx1, tiers: [R - 1, 22, 17], blind: [mx0 - 1, mx1 + 1, 12 * TS, R * TS] },
    checkRun: 200,   /* the level filler adds no shrine inside a run shorter than the game's ceiling (claude/fairfix: five shrines, placed by hand) */
    fairNight: NIGHT,   /* (not `night`: the game reads L.night as its camp-night wash) */
    music: 'harvestfair', duskStart: 120 * TS, duskLen: 520 * TS,         /* sunset at the gate; dusk by the last round */
    /* (claude/fairfix5) THE FAIR'S OWN GROUND, BY ZONE (src/redraw/fair_tiles.js): the turnstiles and the midway, the rides yard, the barns and the corn, the bonfire field, the back lot.
       ledges: the runs that are not what their zone and height make them; blocks: the stall buildings (the terrace, the high stall, the roof streets); keep: none */
    fairKit: { R, zones: [[0, 245, 'turf'], [246, 371, 'iron'], [372, 465, 'barn'], [466, 524, 'field'], [525, 619, 'mud'], [620, W, 'green']],
      ledges: [[82, 94, 19, 19, 'boardwalk'], [157, 163, 19, 19, 'boardwalk'], [176, 195, 13, 13, 'boardwalk'], [198, 214, R + 1, R + 5, 'boardwalk'], [321, 337, R + 1, R + 5, 'boardwalk'], [563, 594, 14, 15, 'track'], [577, 588, 16, 27, 'wagon'], [596, 606, 16, R + 5, 'wagon']],
      blocks: [[52, 67, R - 3, R - 1], [104, 117, R - 2, R - 1], [162, 185, R - 6, H - 1], [229, 235, R - 6, R - 1]] },
    /* (claude/fairfix5) THE LIVING DRESSING in the play layer (src/redraw/fair_world.js drawDressing): each on flat road, none over a footing */
    fairDress: [{ k: 'arch', x: 1, w: 7, row: R }, { k: 'booth', x: 9, w: 2, row: R }, { k: 'fence', x: 23, w: 4, row: R }, { k: 'shy', x: 17, w: 5, row: R, h: 44 }, { k: 'flags', x: 30, row: R },
      { k: 'sign', x: 40, row: R }, { k: 'fence', x: 76, w: 4, row: R }, { k: 'prizes', x: 89, w: 3, row: R, h: 40 }, { k: 'hoopla', x: 119, w: 3, row: R, h: 32 }, { k: 'sign', x: 132, row: R }, { k: 'prizes', x: 144, w: 4, row: R, h: 38 },
      { k: 'flags', x: 209, row: R }, { k: 'generator', x: 247, w: 6, row: R, to: 264 }, { k: 'sign', x: 256, row: R }, { k: 'organ', x: 293, w: 5, row: R }, { k: 'flags', x: 312, row: R }, { k: 'sign', x: 350, row: R },
      { k: 'pumpkins', x: 379, w: 3, row: R }, { k: 'pumpkins', x: 396, w: 2, row: R }, { k: 'tarp', x: 442, w: 5, row: R }, { k: 'stooks', x: 464, w: 2, row: R },
      { k: 'caravan', x: 603, w: 4, row: R }, { k: 'wagon', x: 610, w: 5, row: R }, { k: 'flags', x: 597, row: R, h: 50 }],
    palette: { set: 'fair', dress: 'fair', sky: 'dusk', far: 'town', mid: 'town', near: 'town', nearSet: 'town',   /* (claude/fairfix5: its own - it was Waymeet's set, dress, mine-staging ledges and green grass) */
      haze: 'rgba(230,160,110,0.14)', murkCol: '#2e2a34', darkCol: '10,6,16', darkRim: ['#c8905c', 0.16, 0.22],   /* THE WICKER QUEEN's full dark (claude/fair3): a warm ember-lit edge on what moves in it, not the mines' cold white */
      grass: '#c89a50', grassL: '#e2c070', grassD: '#8a6a34', dirt: '#56361f', dirtL: '#6e4628', dirtD: '#3e2618',   /* straw and russet earth: no Waymeet green */
      canopy: ['#3a2418', '#5a3420', '#7a4a28', '#9a6232'] },
    weather: [],   /* (claude/fairfix5: its own weather is drawn by src/redraw/fair_backdrop.js drawMotes - chaff and straw at the gate, ash after the effigy; Waymeet's pollen is gone) */
    ambient: [{ x0: 0, x1: 524, kind: 'fair' }, { x0: 525, x1: 99999, kind: 'fairlot' }],   /* (claude/fairfix5) its own air (src/audio.js SYNTH_BEDS fair / fairlot): the crowd far off, then the back lot's silence - it was Waymeet's smithy */
  };
}
