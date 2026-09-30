// harvest-fair.js - THE HARVEST FAIR, REBUILT AS A VERTICAL FAIRGROUND (claude/fairlevel; Daniel, 2026-09-30: "the level is just walk right"). Brief: docs/briefs/harvest-fair.md.
// A village fair abandoned mid-festival as the sun goes down: warm sunset on the ground, NIGHT by the tops (the light goes out with HEIGHT as well as along the road:
// lanterns gutter, and you can only freeze a mummer you can SEE). Its rule: DON'T TURN YOUR BACK ON THEM (src/mummer.js): a MUMMER moves only while no hero faces
// it; the HOBBY-HORSE charges the moment a back is turned; the CAROUSEL turns a rider round; a MIRROR watches what is behind you. Placed wholly by hand (no sprinkle).
// The rides and games (the wheel, the swing ride, the helter-skelter, the high strikers, the gallery, the tickets, the corn maze) are src/fair-games.js + src/redraw/fair_rides.js.
//
//   0-118    THE GATE          REFRESHER   one mummer, one sign; then the HIGH STRIKER (a heavy blow on the pad throws you onto the boardwalk) and the stall-roof stair
//   118-246  THE STALL ROW     DEVELOP     a pincer on a climb (two mummers you pass, one at the top of the slope stair); the SHOOTING GALLERY raises planks to the crow's nest;
//                                          the boardwalk runs over the pincer; a hollow floor (THE BACK LOT, secret) under the stalls
//   246-379  THE MIDWAY        TWIST       the carousel turns you; then TWO ROADS to the helter-skelter tower: LOW (THE HALL OF MIRRORS, dark, a mirror watches your back; and a tower
//                                          stair with a guttering lantern) or HIGH (THE BIG WHEEL lifts you to the boardwalk, three SWING RIDE chairs carry you over the hall roof).
//                                          Both climb into THE HELTER-SKELTER TOWER; the slide is the only way on: you come down 14 rows into the next section
//   379-502  THE HARVEST       COMBINE     a horse at the slide's foot, a hayrick over spikes, THE CORN MAZE (three tiers, blind corners: a scarecrow that is not straw at each turn),
//                                          the ghost-train yard (reserved), a rick and a ledge
//   502-618  THE LAST ROUND    EXAM        the small carousel with a mummer AND a horse on it, a rick over spikes, a lane mummer; a second, taller STRIKER throws you onto THE NIGHT LANE
//                                          (lanterns guttering overhead) or you walk the ground; the PRIZE BOOTH (tickets for a silver); the door guard (the elite hobby-horse)
//   622-672  THE MAYPOLE GREEN THE WICKER QUEEN (claude/fair3, src/wicker-queen.js; claude/fairboss rebuilds it): a maypole and a bonfire, a door, a checkpoint before it, a gate
// Checkpoints (six, as before): 8, 124, 252, 388 (the slide's foot), 480 and the door's (600).
import { makeWall } from './breakable-walls.js';
export const FAIR = { W: 672, H: 36, R: 28 };
export const ARC = { teach: [0, 118], develop: [118, 246], twist: [246, 379], combine: [379, 502], exam: [502, 618] };
/* THE NIGHT (src/fair-games.js): the light goes out with HEIGHT. Above row `start` the dusk thickens; by `full` it is night, and only a lit lantern (or your own small light) shows you a mummer */
export const NIGHT = { start: 26, full: 14, dim: 88, lampR: 64 };

/* THE LAMPS GUTTER OUT: each one's life is 1 (steady), 0.5 (guttering: it stutters) or 0 (out). On the ground it is by how far along the road it stands; up in the rides it is by
   HEIGHT (a lamp on the boardwalk gutters, one on the tops is out) unless the level names its life (`life`: the tower stair's lantern always gutters, the night lane's do). Deterministic (no dice) */
export function lampsOut(lamps) {
  const end = 610; return lamps.map((l, i) => { const f = l.x / end;
    const h = (i * 0.618034) % 1, ground = l.x < 118 ? 1 : l.x > 590 ? 0.5 : h < (f - 0.25) * 1.3 ? 0 : h < (f - 0.05) * 1.3 ? 0.5 : 1;   /* a golden-ratio scatter: the further along, the more are out */
    const row = l.y, life = l.life !== undefined ? l.life : row >= 24 ? ground : row >= 17 ? Math.min(ground, 0.5) : 0;
    return { x: l.x, y: l.y, life }; }); }

export function buildHarvestFair({ painter, T, TS }) {
  const { W, H, R } = FAIR, S = R - 1;
  const L = painter(W, H), { set, block, floor, plat, ent, coins, spikes } = L;
  const foe = (t, x, o) => ent(t, x, S, Object.assign({ face: -1 }, o || {}));
  const sign = (x, text) => ent('sign', x, S, { text });
  const post = (x, y, life) => lamps.push({ x, y: y === undefined ? S : y, life });   /* the fair's own lamps (drawn and lit by drawFair; they gutter out along the way) */
  const stall = (x, v) => ent('deco', x, S, { kind: 'stall', v: v || 0 });
  const tk = (x, row) => tickets.push({ x, row });                 /* a TICKET: the fair's own level-local currency, spent at the prize booth */
  floor(0, W - 1, R);

  /* A PIT WITH SPIKES: two tiles deep, so a fall hurts and is jumped out of (B3), three wide (S2: the real jump is about 3.2) */
  const pit = (x0, x1) => { for (let x = x0; x <= x1; x++) { set(x, R, T.AIR); set(x, R + 1, T.AIR); } spikes(x0, x1, R + 1); };
  /* A HAYSTACK: a stack two tiles high (a solid course and a springy cap). Land on it and it throws you up (the Sporewood cap bounce) */
  const stack = (x0, x1) => { block(x0, x1, R - 1, R - 1); for (let x = x0; x <= x1; x++) set(x, R - 2, T.BOUNCER); haystacks.push([x0, x1, R - 2]); };
  /* A CELLAR UNDER THE ROAD (a secret): a plug of plain rock in the floor (a heavy blow from above breaks it: 2 wide), a room below (rows 29-34, floor row 35), and its own stair back up: a step (3 up),
     a second (2 up) right under the plug, and the road (2 up). Never a softlock */
  const cellar = (x0, x1, plug) => { walls.push(Object.assign(makeWall(plug, plug + 1, R, R, 'secret'), { reach: true })); for (let y = R + 1; y <= R + 6; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR);
    plat(plug + 2, R + 4, 3); plat(plug, R + 2, 2); };
  const haystacks = [], tickets = [], corn = [], scarecrows = [], strikers = [], walls = [];
  /* A GENTLE CLIMB up n rows over 2n tiles from x0 (R2A + R2B pairs), and the way back down (L2B + L2A) from x1 */
  const ramp = (x0, n) => { for (let k = 0; k < n; k++) { const r = R - 1 - k, x = x0 + 2 * k; for (let y = r + 1; y < R; y++) { set(x, y, T.SOLID); set(x + 1, y, T.SOLID); } set(x, r, T.SLOPE_R2A); set(x + 1, r, T.SLOPE_R2B); } };
  const rampDown = (x0, n) => { for (let k = 0; k < n; k++) { const r = R - n + k, x = x0 + 2 * k; for (let y = r + 1; y < R; y++) { set(x, y, T.SOLID); set(x + 1, y, T.SOLID); } set(x, r, T.SLOPE_L2B); set(x + 1, r, T.SLOPE_L2A); } };
  /* THE HELTER-SKELTER: a slide of steep slopes down from a tower's right edge, n columns, one row a column; the rock is under every tile of it */
  const slide = (x0, y0, n) => { for (let k = 0; k < n; k++) { const x = x0 + k, y = y0 + k; for (let yy = y + 1; yy < R; yy++) set(x, yy, T.SOLID); set(x, y, T.SLOPE_L1); } };
  const carousels = [], lamps = [], moversExtra = [];
  for (const x of [34, 58, 94, 134, 192, 222, 238, 266, 286, 296, 350, 392, 412, 444, 466, 486, 520, 566, 580, 606]) post(x);   /* the lamps along the road, in the order the light goes: a lamp every ~25 tiles */

  // ---------------- 1. THE GATE (0-118): the refresher, then the first height ----------------
  sign(5, 'THE HARVEST FAIR. THE MUSIC IS STILL PLAYING. NOBODY IS LEFT TO HEAR IT.');
  ent('check', 8, S);
  post(12); ent('deco', 20, S - 6, { kind: 'bunting', hang: true }); stall(16, 0); post(22); coins([14, S - 1], [18, S - 1], [24, S - 1]);
  sign(30, "DON'T TURN YOUR BACK ON THEM. FACE ONE AND IT STOPS. CUT IT DOWN.");   /* the refresher: the theatre before the fair teaches it (claude/theatre); one sign, one mummer */
  ramp(26, 2); block(30, 33, R - 2, H - 1); rampDown(34, 2);                     /* a small hill of slopes on the way in: the first ground that is not flat (two rows up, four along, two down) */
  coins([30, R - 3], [32, R - 3]); stall(38, 1); post(44); ent('deco', 40, S - 7, { kind: 'bunting', hang: true });
  pit(46, 48); coins([46, S - 2], [47, S - 3], [48, S - 2]);
  foe('mummer', 62);                                     /* THE FIRST ONE, alone on a flat lane: facing it, it cannot move. There is nothing else here */
  coins([56, S - 1], [58, S - 1], [66, S - 1], [68, S - 1]);
  sign(74, 'BELLS MEAN IT MOVES. A RED MASK MEANS IT STRIKES. LOOK AT IT.');
  pit(72, 74); coins([72, S - 2], [73, S - 3], [74, S - 2]);
  post(80); stall(84, 0); ent('deco', 78, S - 7, { kind: 'bunting', hang: true }); ent('deco', 68, S, { kind: 'barrels' });
  plat(90, R - 3, 5); ent('coin', 92, S - 3); ent('coin', 94, S - 3);   /* a stall roof to hop, the first thing above the road */
  pit(98, 100); coins([98, S - 2], [99, S - 3], [100, S - 2]);
  /* THE STALL-ROOF STAIR up to THE BOARDWALK: three roofs, three tiles a step (row 25, 22, 19). Everybody can climb it; THE HIGH STRIKER (a heavy blow on the pad rings the bell and throws you
     straight up onto the boardwalk) is the quick way and the first game the fair teaches */
  plat(104, R - 3, 3); plat(108, R - 6, 3); coins([105, R - 4], [109, R - 7]);
  plat(112, R - 9, 52);                                  /* THE BOARDWALK: a plank street on the stall roofs, row 19, over the pincer to come; it ends over the terrace */
  sign(101, 'THE HIGH STRIKER. COME DOWN ON THE PAD HARD: THE BELL RINGS AND IT THROWS YOU UP.');
  strikers.push({ x: 118, row: R, launch: -600, tickets: 2, big: false });   /* the pad on the ground, under the boardwalk (its plank is over its head) */
    tk(114, R - 10); coins([120, R - 10], [124, R - 10], [128, R - 10], [132, R - 10]);

  // ---------------- 2. THE STALL ROW (118-246): DEVELOP ----------------
  ent('check', 124, S); post(122); stall(126, 1); ent('deco', 130, S - 7, { kind: 'bunting', hang: true });
  sign(130, 'LOOK BACK AND THE ONES BEHIND STOP. LOOK AHEAD AND THE ONE UP THERE DOES.');
  foe('mummer', 136);                                     /* the pair at the foot: ahead of you as you come, behind you the moment you pass. (The boardwalk goes over them: too high for them to see you) */
  foe('mummer', 143);
  post(147);
  ramp(150, 6);                                           /* the stair: six rows up over twelve tiles */
  block(162, 185, R - 6, H - 1);                          /* the stall-top terrace */
  foe('mummer', 166, { y: R - 7 });                       /* THE ONE AT THE TOP: right where you stop to catch your breath */
  ent('deco', 172, R - 7, { kind: 'stall', v: 0 }); post(180, R - 7, 1);
  ent('mend', 183, R - 7);                                /* a heart at the far end of the terrace, after the pincer */
  /* THE SHOOTING GALLERY on the terrace: three targets hang at chest height on the gallery's back wall. Hit all three (any blow, any hero; a thrown or shot one counts too) inside
     twelve seconds and the planks run up the stall fronts to THE CROW'S NEST (the silver, three tickets) */
  const gallery = { targets: [{ x: 171, row: R - 7 }, { x: 176, row: R - 7 }, { x: 181, row: R - 7 }], window: 12,
    planks: [[186, 187, R - 9], [183, 184, R - 12], [176, 181, R - 15]],      /* the terrace top is row 22; 3 up, 3 up, 3 up */
    nest: { x0: 176, x1: 181, row: R - 15 } };   /* (it pays with the nest itself: a silver and two tickets) */
  ent('sign', 168, R - 7, { text: 'THE SHOOTING GALLERY. HIT ALL THREE TARGETS BEFORE THE BELL. THE PRIZES ARE UP THE STALL.' });
  ent('silver', 178, R - 16); tk(176, R - 16); tk(180, R - 16); coins([177, R - 16], [179, R - 16]);   /* the crow's nest: the fair's first silver, and two tickets more */
  rampDown(186, 6);
  post(200); ent('deco', 204, S, { kind: 'barrels' });
  /* THE BACK LOT (a secret): the stalls kept their takings under the floor. The plug in the floor is plain rock until struck (a heavy blow from above breaks it in one); a room below with its
     own stair back up, a silver, tickets, a heart. Never a softlock: the stair is there */
  sign(202, 'THE STALL MEN KEPT THEIR TAKINGS UNDER THE FLOOR.');
  cellar(198, 214, 206);
  ent('silver', 199, R + 6); tk(201, R + 6); tk(203, R + 6); tk(205, R + 6); ent('mend', 213, R + 6); coins([200, R + 6], [202, R + 6], [204, R + 6]);
  pit(216, 218); coins([216, S - 3], [217, S - 4], [218, S - 3]);
  plat(224, R - 3, 4); plat(230, R - 5, 4); plat(236, R - 3, 4); coins([225, R - 4], [231, R - 6], [237, R - 4]); tk(232, R - 6);
  pit(242, 244); sign(232, 'A LANE OF STALL ROOFS. THE CAROUSEL IS PAST THE NEXT PIT.');

  // ---------------- 3. THE MIDWAY (246-379): TWIST ----------------
  ent('check', 252, S); post(250); stall(256, 0); ent('deco', 260, S - 7, { kind: 'bunting', hang: true });
  sign(258, 'THE CAROUSEL TURNS ITS RIDERS. THE MUSIC RINGS FIRST. TURN BACK.');
  pit(259, 261); post(264);
  block(262, 263, R - 1, R - 1);                          /* a step up, then the ride */
  block(264, 290, R - 2, R - 1);                          /* THE DISC: a raised floor, two tiles up, twenty-seven wide */
  carousels.push({ x0: 264, x1: 290, row: R - 2, period: 5, warn: 1.3, lock: 0.5 });
  foe('mummer', 269, { y: R - 3 });                       /* two riders already aboard, one at each end of the ride */
  foe('mummer', 285, { y: R - 3 });
  coins([274, S - 3], [277, S - 3], [280, S - 3]);
  ent('deco', 294, S - 7, { kind: 'bunting', hang: true }); post(297); coins([292, S - 1], [294, S - 1]);
  /* --- THE BIG WHEEL (hub column 304): six open gondolas on a circle, ten seconds a turn. The bottom of its run is a hop above the road; the top is the boardwalk's height (row 17) --- */
  const WH = { px: 304 * TS + 8, py: 22 * TS, r: 80, n: 6, period: 10, w: 30 };
  for (let i = 0; i < WH.n; i++) moversExtra.push({ kind: 'wheel', fair: 'gondola', idx: i, px: WH.px, py: WH.py, r: WH.r, phase: i * 2 * Math.PI / WH.n, period: WH.period, x: 0, y: 0, w: WH.w, h: 6 });
  sign(298, 'THE BIG WHEEL. HOP ON WHEN A CAR COMES ROUND LOW. STEP OFF AT THE TOP.');
  /* --- THE HIGH ROAD: the wheel lets off at the top onto the boardwalk (row 17); three swing-ride chairs carry you across the hall's roof to the tower --- */
  plat(306, 17, 8);                                       /* cols 306-313: the boardwalk's landing (eight wide: a hop off a car carries you a long way) */
  plat(326, 17, 4);                                       /* island A: cols 326-329 */
  plat(344, 16, 4);                                       /* island B: cols 344-347, a row higher */
  const chair = (cx, py, arm, ph, per, mast) => moversExtra.push({ kind: 'swing', fair: 'chair', px: cx * TS, py, arm, x: 0, y: 0, w: 48, h: 8, period: per, phase: ph, mast });   /* mast: [x, base y, x, base y] of the two masts the beam hangs between (drawn) */
  chair(320, 11 * TS, 96, 0, 3.2, [313 * TS + 8, 17 * TS, 326 * TS + 8, 17 * TS]); chair(337, 10 * TS, 96, 1.6, 3.4, [329 * TS + 8, 17 * TS, 344 * TS + 8, 16 * TS]); chair(353, 8 * TS, 96, 0.7, 3.0, [347 * TS + 8, 16 * TS, 361 * TS + 8, 14 * TS]);   /* seats rest at rows 17, 16, 14: the levels of the islands and the tower top */
  coins([309, 15], [311, 15], [327, 15], [328, 15], [345, 14], [346, 14]); tk(312, 15);
  /* --- THE LOW ROAD: THE HALL OF MIRRORS (a covered lane, dark; its roof is row 21-22) --- */
  const hx0 = 317, hx1 = 339;                             /* the hall's inside; its roof runs 316-340 */
  block(316, 340, 21, 22);                                /* the roof: a way for anybody who falls off a chair */
  sign(311, 'THE HALL OF MIRRORS. IT IS DARK. TRUE GLASS WATCHES YOUR BACK.');
  foe('mummer', 319);                                     /* B: waits in the dark by the door. You pass it, and it is behind you. The first mirror ahead is the answer */
  foe('mummer', 330);                                     /* A: stands in front of the CRACKED glass, the one place no mirror can watch your back. Stand where a true mirror is ahead of you, and fight it there */
  const hall = { x0: hx0, x1: hx1, roof: 21, floor: R, dim: 88, reach: 112,
    mirrors: [{ x0: 318, x1: 322, kind: 'true' }, { x0: 326, x1: 331, kind: 'cracked' }, { x0: 334, x1: 338, kind: 'true' }], plug: { x0: 328, x1: 329 }, fake: 328 };
  /* THE CLOSET BEHIND THE CRACKED GLASS (a secret): a plug in the floor in front of the cracked panel, and a room below with a stair back up */
  cellar(321, 337, 328);
  tk(323, R + 6); tk(325, R + 6); ent('mend', 336, R + 6); coins([322, R + 6], [324, R + 6], [326, R + 6]);
  post(322, S, 1); post(335, S, 0.5);             /* a lantern in the dark: it holds by the door, and gutters at the far end */
  /* the ticket yard, the shrine, and THE TOWER'S STAIR: three flights up to the landing (a mummer waits there under a lantern that gutters), then the step to the tower top */
  post(346);
  plat(348, R - 3, 3); plat(351, R - 6, 3); plat(354, R - 9, 5); plat(359, R - 12, 2);   /* rows 25, 22, 19 (the landing, cols 354-358), 16: a 3-row step each; the tower top is row 14 */
  foe('mummer', 357, { y: S - 9 });                       /* on the landing: your dusk is short here; it is held only in the lantern's light or within arm's length */
  post(355, 18, 0.5);
  sign(346, 'THE HELTER-SKELTER. THE STAIR IS DARK. HOLD DOWN ON THE SLIDE AND RIDE IT.');
  const tower = { x0: 361, x1: 366, top: 14 };
  block(tower.x0, tower.x1, tower.top, R - 1);            /* THE TOWER: solid to the road; its top is row 14 (the seats of chair three rest here) */
  slide(367, tower.top, 14);                              /* THE SLIDE: cols 367-380, rows 14-27; the road is under it at col 381 */
  ent('deco', 363, tower.top - 1, { kind: 'bunting', hang: false });

  // ---------------- 4. THE HARVEST (379-502): COMBINE ----------------
  ent('check', 388, S); post(385, S, 1); stall(386, 1);
  foe('hobbyhorse', 396);                                 /* at the slide's foot: it stands still while you look, and you come down the slide looking at it. Cut it down, or hop it and take the charge */
  ent('deco', 391, S, { kind: 'hayBale', v: 0 }); coins([384, S - 1], [388, S - 1]);
  stack(402, 404); spikes(405, 407, S);                   /* a rick, and three tiles of spikes past it: the hay is the way over */
  ent('deco', 400, S, { kind: 'fence', v: 1 });
  sign(409, 'THE CORN. THE SCARECROWS ARE STRAW. SOME OF THEM ARE NOT. LISTEN FOR BELLS.');
  /* --- THE CORN MAZE (cols 412-436): three tiers, each a corridor, each turn a blind corner (walls stop your look), a mummer in a scarecrow's coat at the turn --- */
  const mx0 = 412, mx1 = 436;
  block(mx0 - 1, mx0 - 1, 12, 22);                        /* the left wall (tier one is open at the foot) */
  block(mx0 - 1, mx1 + 1, 12, 13);                        /* the roof */
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
  foe('mummer', mx1 - 1, { y: 22, scare: true });         /* THE FIRST TURN: right of chimney one, in tier two. You climb out and turn left to go on: it is behind you */
  foe('mummer', mx0, { y: 17, scare: true });             /* THE SECOND TURN: left of chimney two, in tier three (the dark tier). You climb out and turn right: it is behind you */
  for (const [x, r] of [[mx0 + 6, R - 1], [mx0 + 16, R - 1], [mx0 + 8, 22], [mx0 + 18, 22], [mx0 + 12, 17]]) scarecrows.push({ x, row: r });   /* the straw ones: on a pole, a hat, arms out */
  corn.push([mx0 - 1, mx1 + 1, 12, 27]);                  /* drawn as standing corn over the walls */
  post(mx0 + 10, R - 1, 0.5); post(mx0 + 14, 22, 0.5); post(mx0 + 18, 17, 0.5);   /* lanterns in the corn: they gutter; the higher, the darker */
  tk(mx1 - 1, 17); coins([mx0 + 8, 17], [mx0 + 10, 17], [mx0 + 12, 22], [mx0 + 20, 22]);
  /* the way out: from the end of tier three (row 18) steps down outside the corn to the road */
  plat(mx1 + 2, 21, 2); plat(mx1 + 5, 24, 2);
    stack(449, 451); spikes(452, 454, S);                   /* the second rick */
  plat(449, R - 10, 7); tk(455, R - 11); coins([450, R - 11], [453, R - 11]);   /* a ledge over the second rick and its spikes (the hay throws you up through it): a ticket */
  /* THE GHOST-TRAIN YARD (RESERVED for a chase set piece: cols 462-498, a straight lane with a boarded arch on it; nothing else stands here) */
  ent('check', 480, S); ent('mend', 470, S);
  const reserved = { ghostTrain: { x0: 462, x1: 498, row: S, arch: 490 } };

  // ---------------- 5. THE LAST ROUND (502-618): EXAM ----------------
  post(506); sign(512, 'ALL OF IT AT ONCE. THE LAST ROUND.');
  block(528, 529, R - 1, R - 1);
  block(530, 548, R - 2, R - 1);                          /* the small ride: a mummer and a horse aboard */
  carousels.push({ x0: 530, x1: 548, row: R - 2, period: 4.5, warn: 1.3, lock: 0.5 });
  foe('mummer', 535, { y: R - 3 }); foe('hobbyhorse', 545, { y: R - 3 });
  post(552); stack(556, 558); spikes(559, 561, S);
  /* THE SECOND HIGH STRIKER (taller): it throws you onto THE NIGHT LANE, a plank run over the last round in full night, with its own guttering lanterns. Optional: the road runs under it */
  sign(562, 'THE TALL STRIKER. A HEAVY BLOW. THE NIGHT LANE RUNS ABOVE: THE LANTERNS ARE FAILING.');
  strikers.push({ x: 566, row: R, launch: -740, tickets: 2, big: true });
  plat(563, 14, 9); plat(576, 14, 4); plat(584, 15, 4); plat(592, 14, 3);
  post(568, 13, 0.5); post(580, 13, 0.5); post(588, 14, 0);
  tk(570, 13); tk(586, 14); coins([572, 13], [578, 13], [586, 14]);
  plat(596, 18, 3); plat(599, 22, 2);                     /* the way down off the lane: two steps to the road, before the shrine */
  /* (the lane mummer here is gone: fewer, better foes) */
  ent('deco', 570, S, { kind: 'stall', v: 1 }); coins([570, S - 1], [574, S - 1]);
  pit(590, 592);
  /* THE PRIZE BOOTH: press UP at the counter to spend tickets (eight for a silver) */
  const booth = { x: 586, row: S, cost: 8, silver: { x: 587, row: S - 1 } };
  ent('silver', 587, S - 1); ent('deco', 586, S, { kind: 'stall', v: 0 }); ent('mend', 597, S);
  post(594); ent('check', 600, S);                        /* the door's checkpoint: the last one the road passes before the green */
  foe('hobbyhorse', 608, { elite: true, gate: 620 });     /* THE DOOR GUARD, the level's ELITE: it holds the green's door (the gate comes down over it) until it is dead. Facing it, it cannot charge: that is the exam's last answer */

  // ---------------- THE MAYPOLE GREEN (622-672): THE WICKER QUEEN's arena (claude/fair3, src/wicker-queen.js) ----------------
  const G = { x0: 622, x1: 668, door: 620, maypole: 640, bonfire: 654, floor: R };
  block(620, 621, 0, R - 1);                              /* the door: a narrow gap under a lintel, then the green */
  for (let y = S - 3; y <= S; y++) { set(620, y, T.AIR); set(621, y, T.AIR); }
  block(669, 671, 0, R - 1);                              /* the wall behind the gate */
  sign(616, 'THE GREEN. SHE MOVES ONLY WHEN YOU LOOK AWAY. HER RIBBONS DO NOT WAIT.');   /* outside the door, beside its checkpoint: read before the walls close */
  ent('wickerqueen', 662, S, { face: -1 });               /* THE WICKER QUEEN, past the bonfire: to draw her across it you turn your back on her */
  ent('relic', 646, S, { kind: 'maypole', bossDrop: true });   /* THE FAIR'S ONE RELIC is hers now (the maypole ribbon: your look reaches half as far again; the felted soles stay in the levels that hold them): hidden until she falls, then it lies where she burned (spawn case 'relic') */
  ent('gate', 666, S);                                    /* and the road goes on from here once she is down (gateAfterBoss) */
  const arena = { x0: 623 * TS, x1: 667 * TS, floor: R * TS, y0: (R - 14) * TS, trigger: 627 * TS, wallL: 622, wallR: 667, boss: 'wickerqueen', music: 'houndmaster', tint: '#2a1a30', tintA: 0.12, fx: 'embers' };

  const tints = [[0, 118, [255, 196, 110], 0.10], [118, 246, [255, 160, 90], 0.12], [246, 379, [235, 120, 110], 0.14], [379, 502, [170, 100, 150], 0.16], [502, 622, [80, 80, 160], 0.18], [622, W, [60, 60, 130], 0.20]];
  /* THE WICKER EFFIGY going up behind the fair: five stages, one every hundred columns or so, so you pass it again and again as you climb (the queen, finished, stands by the door) */
  const effigies = [{ x: 78, stage: 0 }, { x: 196, stage: 1 }, { x: 322, stage: 2 }, { x: 470, stage: 3 }, { x: 592, stage: 4 }];
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: S }, pools: [], falls: [], moversExtra, interiors: [],
    carousels, haystacks, lamps: lampsOut(lamps), arc: ARC, stair: { x0: 150, top: 162 }, green: G, tints, arena, gateAfterBoss: true,
    walls, gallery, strikers, tickets, booth, hall, tower, wheel: WH, slide: { x0: 367, y0: tower.top, n: 14 }, corn, scarecrows, effigies, reserved,
    maze: { x0: mx0, x1: mx1, tiers: [R - 1, 22, 17], blind: [mx0 - 1, mx1 + 1, 12 * TS, R * TS] },
    night: NIGHT,
    music: 'marketday', duskStart: 120 * TS, duskLen: 520 * TS,         /* sunset at the gate; dusk by the last round */
    palette: { set: 'village', dress: 'village', ledges: 'staging', sky: 'dusk', far: 'town', mid: 'town', near: 'town', nearSet: 'town',
      haze: 'rgba(230,160,110,0.14)', murkCol: '#2e2a34', darkCol: '10,6,16', darkRim: ['#c8905c', 0.16, 0.22],   /* THE WICKER QUEEN's full dark (claude/fair3): a warm ember-lit edge on what moves in it, not the mines' cold white */
      grass: '#6a8a46', grassL: '#8fb060', grassD: '#47612e', dirt: '#7a6248', dirtL: '#8f7458', dirtD: '#54402c',
      canopy: ['#2a3a24', '#3a5230', '#4a6a3c', '#5e8248'] },
    weather: [{ x0: 0, x1: 99999, kind: 'pollen' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'town' }],
  };
}
