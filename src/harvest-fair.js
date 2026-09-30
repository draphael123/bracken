// harvest-fair.js - THE HARVEST FAIR (claude/fair1, L1: brief + greybox + the facing mechanic). Brief: docs/briefs/harvest-fair.md.
// A village fair abandoned mid-festival as the sun goes down: warm sunset in the first section, dusk by the last (lanterns gutter, the music box winds
// down, the figures multiply). Its rule: DON'T TURN YOUR BACK ON THEM. The engine is the FACING RULE (src/mummer.js): a MUMMER moves only while no hero
// faces it; the HOBBY-HORSE charges the moment a back is turned; the CAROUSEL turns a rider round. Placed wholly by hand (no garrison sprinkle):
//
//   0-118    THE GATE          TEACH    one mummer on a flat lane, alone. Face it and it freezes; cut it down (about three blows)
//   118-246  THE STALL STAIR   DEVELOP  a pincer on a climb: two mummers you pass at the foot come up behind you while one waits at the top
//   246-374  THE CAROUSEL      TWIST    ride it and it TURNS you (warned); the one you were holding frozen is behind you now
//   374-502  THE HAYRICKS      COMBINE  hobby-horses on the lane and HAYSTACKS (the Sporewood cap bounce) to clear spikes and the charge
//   502-620  THE LAST ROUND    EXAM     a mummer, a small carousel with a mummer and a horse on it, a haystack, and THE DOOR GUARD (the elite hobby-horse that holds the green's door)
//   622-672  THE MAYPOLE GREEN THE WICKER QUEEN (claude/fair3, src/wicker-queen.js): a maypole and a bonfire, a door, a checkpoint before it, a gate at the far end
// Checkpoints: one per section (8, 124, 252, 380, 508) and the door's (600): 92-128 apart, none inside the green.
export const FAIR = { W: 672, H: 36, R: 28 };
export const ARC = { teach: [0, 118], develop: [118, 246], twist: [246, 374], combine: [374, 502], exam: [502, 618] };

/* THE LAMPS GUTTER OUT: each one's life is 1 (steady), 0.5 (guttering: it stutters) or 0 (out), by how far along the road it stands. Deterministic (no dice), so the level is the same every time */
export function lampsOut(lamps) {
  const end = 610; return lamps.map((l, i) => { const f = l.x / end;
    const h = (i * 0.618034) % 1, life = l.x < 118 ? 1 : l.x > 590 ? 0.5 : h < (f - 0.25) * 1.3 ? 0 : h < (f - 0.05) * 1.3 ? 0.5 : 1;   /* a golden-ratio scatter: the further along, the more are out */
    return { x: l.x, y: l.y, life }; }); }

export function buildHarvestFair({ painter, T, TS }) {
  const { W, H, R } = FAIR, S = R - 1;
  const L = painter(W, H), { set, block, floor, plat, ent, coins, spikes } = L;
  const foe = (t, x, o) => ent(t, x, S, Object.assign({ face: -1 }, o || {}));
  const sign = (x, text) => ent('sign', x, S, { text });
  const post = (x, y) => lamps.push({ x, y: y === undefined ? S : y });   /* the fair's own lamps (drawn and lit by drawFair; they gutter out along the way) */
  const stall = (x, v) => ent('deco', x, S, { kind: 'stall', v: v || 0 });
  floor(0, W - 1, R);

  /* A PIT WITH SPIKES: two tiles deep, so a fall hurts and is jumped out of (B3), three wide (S2: the real jump is about 3.2) */
  const pit = (x0, x1) => { for (let x = x0; x <= x1; x++) { set(x, R, T.AIR); set(x, R + 1, T.AIR); } spikes(x0, x1, R + 1); };
  /* A HAYSTACK: a stack two tiles high (a solid course and a springy cap). Land on it and it throws you up (the Sporewood cap bounce) */
  const stack = (x0, x1) => { block(x0, x1, R - 1, R - 1); for (let x = x0; x <= x1; x++) set(x, R - 2, T.BOUNCER); haystacks.push([x0, x1, R - 2]); };
  const haystacks = [];
  /* A GENTLE CLIMB up n rows over 2n tiles from x0 (R2A + R2B pairs), and the way back down (L2B + L2A) from x1 */
  const ramp = (x0, n) => { for (let k = 0; k < n; k++) { const r = R - 1 - k, x = x0 + 2 * k; for (let y = r + 1; y < R; y++) { set(x, y, T.SOLID); set(x + 1, y, T.SOLID); } set(x, r, T.SLOPE_R2A); set(x + 1, r, T.SLOPE_R2B); } };
  const rampDown = (x0, n) => { for (let k = 0; k < n; k++) { const r = R - n + k, x = x0 + 2 * k; for (let y = r + 1; y < R; y++) { set(x, y, T.SOLID); set(x + 1, y, T.SOLID); } set(x, r, T.SLOPE_L2B); set(x + 1, r, T.SLOPE_L2A); } };
  const carousels = [], lamps = [];
  for (const x of [34, 58, 94, 134, 192, 222, 238, 266, 286, 322, 342, 368, 394, 412, 426, 444, 464, 486, 520, 566, 580, 606]) post(x);   /* the lamps along the road, in the order the light goes: a lamp every ~25 tiles */

  // ---------------- 1. THE GATE (0-118): TEACH ----------------
  sign(5, 'THE HARVEST FAIR. THE MUSIC IS STILL PLAYING. NOBODY IS LEFT TO HEAR IT.');
  ent('check', 8, S);
  post(12); ent('deco', 20, S - 6, { kind: 'bunting', hang: true }); stall(16, 0); post(22); coins([14, S - 1], [18, S - 1], [24, S - 1]);
  sign(30, "DON'T TURN YOUR BACK ON THEM.");
  stall(38, 1); post(44); ent('deco', 40, S - 7, { kind: 'bunting', hang: true }); ent('deco', 26, S, { kind: 'hayBale', v: 0 });
  sign(48, 'THEY ONLY MOVE WHEN NOBODY LOOKS. FACE ONE AND IT STOPS. CUT IT DOWN.');
  foe('mummer', 62);                                     /* THE FIRST ONE, alone on a flat lane: facing it, it cannot move. There is nothing else here */
  coins([56, S - 1], [58, S - 1], [66, S - 1], [68, S - 1]);
  sign(74, 'BELLS MEAN IT MOVES. A RED MASK MEANS IT STRIKES. LOOK AT IT.');
  post(80); stall(84, 0); ent('deco', 78, S - 7, { kind: 'bunting', hang: true }); ent('deco', 70, S, { kind: 'barrels' });
  plat(90, S - 3, 5); ent('coin', 92, S - 4); ent('coin', 94, S - 4);   /* a stall roof to hop, the first thing above the road */
  pit(100, 102); coins([100, S - 3], [101, S - 4], [102, S - 3]);
  ent('deco', 112, S, { kind: 'fence', v: 0 });
  /* THE ROOF CACHE: a stair of three roofs over the flat lane, and a purse on the top one (the relic it held in L2 - the soles - is the Wicker Queen's reward now,
     claude/fair3: the fair's one relic slot drops where she burns). The lane under it is flat, so a fall costs nothing */
  plat(105, S - 3, 3); plat(109, S - 6, 3); plat(113, S - 9, 3); coins([106, S - 4], [110, S - 7], [113, S - 10], [114, S - 10], [115, S - 10], [114, S - 11], [113, S - 11]);

  // ---------------- 2. THE STALL STAIR (118-246): DEVELOP ----------------
  ent('check', 124, S); post(120); stall(126, 1); ent('deco', 130, S - 7, { kind: 'bunting', hang: true });
  sign(130, 'LOOK BACK AND THE ONES BEHIND STOP. LOOK AHEAD AND THE ONE UP THERE DOES.');
  foe('mummer', 136);                                     /* the pair at the foot: ahead of you as you come, behind you the moment you pass */
  foe('mummer', 143);
  post(147);
  ramp(150, 6);                                           /* the stair: six rows up over twelve tiles */
  block(162, 185, R - 6, H - 1);                          /* the stall-top terrace */
  foe('mummer', 166, { y: R - 7 });                       /* THE ONE AT THE TOP: right where you stop to catch your breath */
  ent('deco', 172, R - 7, { kind: 'stall', v: 0 }); post(180, R - 7);
  coins([170, R - 8], [174, R - 8], [178, R - 8]);
  rampDown(186, 6);
  post(200); ent('deco', 204, S, { kind: 'barrels' }); ent('mend', 183, R - 7);   /* a heart at the far end of the terrace, after the pincer */
  pit(212, 214); coins([212, S - 3], [213, S - 4], [214, S - 3]);
  plat(222, S - 3, 4); plat(228, S - 5, 4); plat(234, S - 3, 4); plat(231, S - 8, 3); ent('silver', 232, S - 9);   /* the second silver: over the roofs, a hop up from the middle one */ coins([223, S - 4], [229, S - 6], [235, S - 4]);
  pit(240, 242); sign(228, 'A LANE OF STALL ROOFS. THE CAROUSEL IS PAST THE NEXT PIT.');

  // ---------------- 3. THE CAROUSEL (246-374): TWIST ----------------
  ent('check', 252, S); post(250); stall(256, 0); ent('deco', 260, S - 7, { kind: 'bunting', hang: true });
  sign(262, 'THE CAROUSEL TURNS ITS RIDERS. THE MUSIC RINGS FIRST. TURN BACK.');
  pit(272, 274); post(280); ent('deco', 284, S, { kind: 'bunting', v: 0 });
  block(288, 289, R - 1, R - 1);                          /* a step up, then the ride */
  block(290, 316, R - 2, R - 1);                          /* THE DISC: a raised floor, two tiles up, twenty-seven wide */
  carousels.push({ x0: 290, x1: 316, row: R - 2, period: 5, warn: 1.3, lock: 0.5 });
  foe('mummer', 296, { y: R - 3 });                       /* two riders already aboard, one at each end of the ride */
  foe('mummer', 311, { y: R - 3 });
  coins([300, S - 3], [303, S - 3], [306, S - 3]);
  stall(326, 1); ent('deco', 330, S - 7, { kind: 'bunting', hang: true }); coins([328, S - 1], [332, S - 1], [336, S - 1]);
  plat(340, S - 3, 5); plat(344, S - 6, 3); ent('silver', 345, S - 7); ent('coin', 342, S - 4);   /* the third silver, a hop up over the stall roof before the last pit */ pit(350, 352); post(358); sign(362, 'THE HAYRICKS. THE HORSES DO NOT WAIT TO BE LOOKED AT. THE HAY WILL THROW YOU CLEAR.');

  // ---------------- 4. THE HAYRICKS (374-502): COMBINE ----------------
  ent('check', 380, S); post(378);
  stack(384, 386); spikes(387, 389, S);                   /* the first rick, and three tiles of spikes past it: the hay is the way over */
  foe('hobbyhorse', 402);                                 /* lane A: the horse ahead of you, frozen while you look. Cut it down, or hop it and take the charge */
  ent('deco', 396, S, { kind: 'hayBale', v: 0 }); ent('deco', 408, S, { kind: 'fence', v: 1 });
  stack(417, 419); spikes(420, 422, S);
  foe('hobbyhorse', 436);                                 /* lane B: another, further on */
  ent('deco', 430, S, { kind: 'hayBale', v: 1 });
  stack(450, 452); spikes(453, 455, S);                   /* the third rick throws you high enough for the ledge, if you hold jump */
  plat(457, R - 10, 5); ent('silver', 460, R - 11);   /* the first silver of three (L1's): the hayrick ledge, three silvers in all like Waymeet and the Fields */
  ent('deco', 470, S, { kind: 'stall', v: 0 }); post(476); coins([472, S - 1], [478, S - 1], [484, S - 1]);
  post(494); pit(496, 498); ent('mend', 486, S);   /* a heart after the horses */

  // ---------------- 5. THE LAST ROUND (502-618): EXAM ----------------
  ent('check', 508, S); post(506); sign(512, 'ALL OF IT AT ONCE. THE LAST ROUND.');
  foe('mummer', 522);                                     /* one on the lane before the ride */
  block(528, 529, R - 1, R - 1);
  block(530, 548, R - 2, R - 1);                          /* the small ride: a mummer and a horse aboard */
  carousels.push({ x0: 530, x1: 548, row: R - 2, period: 4.5, warn: 1.3, lock: 0.5 });
  foe('mummer', 535, { y: R - 3 }); foe('hobbyhorse', 545, { y: R - 3 });
  post(552); stack(556, 558); spikes(559, 561, S);
  foe('mummer', 578); coins([570, S - 1], [574, S - 1]);
  stall(586, 0); post(594); pit(590, 592); ent('mend', 597, S);   /* and a heart before the door guard */
  ent('check', 600, S);                                   /* the door's checkpoint: the last one the road passes before the green */
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

  const tints = [[0, 118, [255, 196, 110], 0.10], [118, 246, [255, 160, 90], 0.12], [246, 374, [235, 120, 110], 0.14], [374, 502, [170, 100, 150], 0.16], [502, 622, [80, 80, 160], 0.18], [622, W, [60, 60, 130], 0.20]];
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: S }, pools: [], falls: [], moversExtra: [], interiors: [],
    carousels, haystacks, lamps: lampsOut(lamps), arc: ARC, stair: { x0: 150, top: 162 }, green: G, tints, arena, gateAfterBoss: true,
    music: 'marketday', duskStart: 120 * TS, duskLen: 520 * TS,         /* sunset at the gate; dusk by the last round */
    palette: { set: 'village', dress: 'village', ledges: 'staging', sky: 'dusk', far: 'town', mid: 'town', near: 'town', nearSet: 'town',
      haze: 'rgba(230,160,110,0.14)', murkCol: '#2e2a34', darkCol: '10,6,16', darkRim: ['#c8905c', 0.16, 0.22],   /* THE WICKER QUEEN's full dark (claude/fair3): a warm ember-lit edge on what moves in it, not the mines' cold white */
      grass: '#6a8a46', grassL: '#8fb060', grassD: '#47612e', dirt: '#7a6248', dirtL: '#8f7458', dirtD: '#54402c',
      canopy: ['#2a3a24', '#3a5230', '#4a6a3c', '#5e8248'] },
    weather: [{ x0: 0, x1: 99999, kind: 'pollen' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'town' }],
  };
}
