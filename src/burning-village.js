// burning-village.js — THE BURNING VILLAGE (batch 5, 2026-09-21). Briefs: .claude/briefs/burning-village-pitch.md + -design.md.
// The goblins who broke out of the Stockade have fired a human village on the road to Sporewood, and a renegade of the
// Pyromancers' order walks in front of them lighting it. The goal is the villagers: six of them are trapped in the burning
// buildings, you cut them free, and they run for the gate themselves. They cannot die - the fire only pins them.
//
// THE FIRE (src/fire-spread.js): the straw on the ground, the thatch on the roofs and the hay in the barn are the village's
// burnable ground (L.burn). Only the Pyromancer and his burning goblins light it, and what they light spreads; the
// village's own fire - the burning fronts behind the street (L.facades 'burning') and the still flames in the yards
// (L.stillFires) - is dressing and hazard, and never creeps. Water from the troughs and the well puts the spread out.
//
//   0-90     THE ROAD IN      the first burning goblin on a strip of straw, a wisp, a cart alight
//   90-190   THE CROFTS       the first villager behind a HOT DOOR, and the trough that cools it
//   190-250  THE LONG STREET  roofs at three heights, beams over the street that fall when their thatch burns out, and THE
//                             FALLEN HOUSE burning across the street: over the roofs, or (the bucket) through it
//   250-320  THE ROOFTOPS     the street has fallen into its cellars: the Hall's roof, burning beams over the gaps that go
//                             a moment after you step on them, and smoke out of the cellars that carries you up
//                             (docs/briefs/burning-village-rework.md, 2026-09-25)
//   320-400  THE BARN         one big room of hay, two villagers, the fire crossing it; its captain holds the far door
//   400-450  THE WELL YARD    the well, the last villager, the way up to the square
//   450-508  THE SQUARE       THE PYROMANCER. The square burns as his heat climbs and clears when he vents.
export const VILLAGE = { W: 508, H: 34, R: 26 };
/* THE BURNING BEAM's fuse: from the moment you stand on it. Nine tiles at the paladin's pace (the slowest) is 1.73 s */
export const BEAM = { fuse: 1.8, back: 5 };
/* THE SMOKE: a plume rises for `up` seconds of every period, after `tell` seconds of thickening; airborne in it you rise at `lift` px/s */
export const SMOKE = { up: 1.6, tell: 0.8, lift: 190, half: 12 };

export function buildBurningVillage({ painter, T, TS }) {
  const { W, H, R } = VILLAGE, S = R - 1;             // R: the street's floor row; S: the row you stand in on it
  const L = painter(W, H), { set, block, floor, plat, crate, ent, coins } = L;
  const roofs = [], burn = [], facades = [], stillFires = [], beams = [], interiors = [];
  const heaps = [], trench = [], beamSpans = [], cellarFires = [], smoke = [];   /* THE ROOFTOPS and THE FALLEN HOUSE (2026-09-25) */
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  /* STRAW ON THE STREET lies in bales of five with two tiles of bare road between: a fire runs the length of a bale and stops,
     so a burning goblin can shut a stretch of the road but never all of it (one unbroken strip of twenty-three burning at once
     was a wall nobody could jump, and the playtest bot stood at it). Roofs, lofts and the barn's floor are lit end to end. */
  const straw = (x0, x1, row = S, whole = row !== S) => { if (whole) { burn.push([x0, x1, row]); return; } for (let x = x0; x <= x1; x += 7) burn.push([x, Math.min(x1, x + 4), row]); };
  const net = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };
  /* A HOUSE: a thatch roof (three courses, as the Hanging Village builds them) with its front under it, straw on its top,
     and a stair of ledges up its gable three rows at a time - the knight's whole jump, and each ledge overlapping the
     next so the climb reads at a glance. side -1 puts the stair at the left gable, +1 at the right. */
  /* side 0 lays no stair (THE ROOFTOPS hangs its own); `deep` is how many rows the front runs on below the street, down to the
     floor of a cellar the street has fallen into */
  const house = (x0, x1, y, side = -1, deep = 0) => {
    block(x0, x1, y - 2, y); roofs.push([x0, x1, y - 2, deep]);   /* the roof row is the slab's TOP course: drawRoofs paints the three rows from it (tools/skins.mjs) */ straw(x0, x1, y - 3); if (!side) return;
    const n = Math.ceil((S - (y - 3)) / 3) - 1;          // ledges between the street and the roof top
    for (let k = 0; k < n; k++) { const row = S - 3 * (k + 1) + 1, off = 2 * (n - 1 - k);
      if (side < 0) plat(x0 - 3 - off, row, 3); else plat(x1 + 1 + off, row, 3); } };
  const captive = (x, y, o) => ent('captive', x, y, o || {});
  /* A BURNING LOG over an ember pit: the log is the road, it smoulders, and a moment after you stand on it it burns through
     (deckBreaks) and drops you two rows into embers - fire, not death: you jump out, and the log is back five seconds later */
  const pits = [], logs = [];
  const pit = (x0, x1) => { pits.push([x0, x1]); for (let x = x0; x <= x1; x++) { set(x, R, T.AIR); set(x, R + 1, T.AIR); set(x, R, T.ONEWAY); } logs.push([x0, x1, R]); coins([x0 + 1, R + 1]); };
  const still = (x, y) => stillFires.push([x, y]);

  floor(0, W - 1, R);

  // ---- 1. THE ROAD IN ----
  ent('sign', 5, S, { text: 'THE GOBLINS CAME DOWN FROM THE STOCKADE AND FIRED THE VILLAGE. GET ITS PEOPLE OUT.' });
  ent('deco', 13, S, { kind: 'brokenCart', v: 0 }); still(15, S);
  ent('sign', 19, S, { text: 'A BURNING GOBLIN SETS ALIGHT THE STRAW IT WALKS ON. KILL IT ON BARE GROUND.' }); foe('sprig', 22, S);
  straw(26, 44); foe('burngob', 38, S); coins([24, S - 1], [28, S - 2], [46, S - 1]);
  house(50, 62, 19);                                   // a cottage: its thatch is the first roof
  foe('archer', 57, 16); coins([52, 15], [56, 15], [60, 15]);
  facades.push([64, 74, 18, 25, 'burning']); still(69, S);
  foe('emberwisp', 72, 21); foe('sprig', 78, S);
  plat(80, 23, 4); plat(84, 20, 4); coins([81, 22], [85, 19], [87, 19]);
  foe('sprig', 88, S);

  pit(45, 48);
  // ---- 2. THE CROFTS ----
  ent('sign', 92, S, { text: 'A HOT DOOR BLOWS OUT WHEN IT IS OPENED. STRIKE THE TROUGH AND WATER IT FIRST.' });
  house(96, 108, 19, 1); captive(101, S, { hot: true }); ent('watertrough', 106, S);
  straw(114, 128); foe('burngob', 122, S); foe('sprig', 127, S); foe('emberwisp', 118, 20);
  house(134, 150, 16);                                 // two storeys
  foe('archer', 142, 13); foe('sapper', 147, 13); ent('silver', 149, 12); coins([136, 12], [139, 12]);
  foe('shield', 156, S); facades.push([158, 168, 17, 25, 'burning']); still(163, S);
  straw(170, 184); foe('burngob', 178, S); foe('hound', 184, S);
  plat(172, 23, 4); plat(176, 20, 4); foe('emberwisp', 178, 18); coins([173, 22], [177, 19]);
  ent('check', 187, S);

  pit(188, 191);
  // ---- 3. THE LONG STREET ----
  house(194, 206, 19, -1); captive(200, S);
  foe('sprig', 204, S); foe('thief', 209, S);
  house(214, 228, 16, -1); straw(208, 226); foe('burngob', 220, 13); foe('archer', 225, 13);
  beams.push([221, 17, 221, 13]);                      // [x, hanging row, the thatch cell it hangs from (x, row)]
  /* THE FALLEN HOUSE (docs/briefs/burning-village-rework.md §3): a house has come down across the street, a heap of burning
     timber four rows high - one more than any jump - alight on top. The way past it with no water is the ROOFS: up the gable
     of the house before it, along its roof, and five tiles over the fire onto the next roof. */
  block(230, 232, S - 3, S); heaps.push({ x0: 230, x1: 232, y0: S - 3, y1: S, name: 'THE FALLEN HOUSE' });
  house(234, 246, 16, 1); foe('pike', 241, S); foe('emberwisp', 241, 20);

  // ---- 3b. THE ROOFTOPS ----
  /* THE STREET HAS FALLEN INTO ITS CELLARS from 248 to 314: a trench four rows deep (one more than a jump), fire on its floor in
     patches and smoke rising out of it. The way on is the ROOFS. The houses' fronts run down to the cellar floor, so nothing
     stands on nothing (B9). Two cellars, split under the second house's east gable: the first has a ladder out at each end
     (back to the street, up the second house), the second a ladder up to the street beyond. Fire, not death - the ember pits' rule. */
  const T0 = 248, T1 = 314, DEEP = 4;
  for (let x = T0; x <= T1; x++) for (let y = R; y < R + DEEP; y++) set(x, y, T.AIR);
  block(286, 287, R, R + DEEP - 1);                    // the cellar wall under the second house's east gable
  trench.push([T0, T1, R, R + DEEP - 1]);
  house(254, 268, 13, 0, DEEP);                        // THE HALL: the street's tallest roof, and a villager in its dormer
  plat(251, 14, 3);                                    // the Hall's one ledge, a jump off the last house's roof
  captive(263, 10); ent('silver', 267, 9); foe('archer', 258, 10); coins([256, 9], [260, 9]);
  house(274, 286, 16, 0, DEEP); foe('burngob', 280, 13); beams.push([277, 17, 277, 13]);
  /* THE BURNING BEAM: nine tiles over the second cellar, too wide to jump. It holds you for BEAM.fuse seconds from the moment
     you stand on it - told: it flashes and a ! stands over every tile - then burns through into the cellar, and is back five
     seconds later. Run it and it holds; stop on it and it does not. */
  for (let x = 287; x <= 295; x++) set(x, 14, T.ONEWAY);
  beamSpans.push([287, 295, 14]);
  house(296, 308, 16, 0, DEEP); foe('emberwisp', 300, 10); foe('sprig', 303, 13); foe('thief', 306, 13);
  plat(309, 17, 3); plat(311, 20, 3); plat(313, 23, 3);            // down the last gable to the street
  coins([298, 12], [302, 12], [306, 12]);
  net(T0, R, R + DEEP - 1); net(273, 14, R + DEEP - 1); net(T1, R, R + DEEP - 1);   /* THE LADDERS OUT, hung last: nothing is dug after them */
  for (const x of [256, 266, 280, 292, 304]) cellarFires.push([x, R + DEEP - 1]);
  /* THE SMOKE RISES out of the cellars, in the gaps between the roofs, on a clock: thin, thickening (the tell), then a plume
     that carries a hero in the air up with it. A second way out of a cellar, never the only one (B4) */
  for (const [x, per, ph] of [[250, 4.4, 0], [271, 4.8, 1.5], [291, 4.2, 2.6], [311, 4.6, 0.8]]) smoke.push({ x, y0: 8, y1: R + DEEP - 1, per, ph });
  facades.push([310, 318, 16, R + DEEP - 1, 'burning']);
  ent('check', 316, S);

  // ---- 4. THE BARN ----
  block(322, 322, 12, 22); block(398, 398, 12, 22); block(322, 398, 10, 11);
  net(321, 9, 25); block(397, 398, 4, 9);
  /* THE ROOF IS A WAY, NOT A DEAD END (Daniel): at its far end a HATCH drops you into the barn on the captain's side of his
     door, so the roof is a route round the hay but never round him. A wall of fire burns across the roof in front of the
     hatch; the WATER BUTT beside it puts it out for twelve seconds when struck, and fills again in eight (the troughs' own
     rule), so the water comes back. */
  for (let x = 390; x <= 392; x++) { set(x, 10, T.AIR); set(x, 11, T.AIR); }
  ent('watertrough', 381, 9);
  ent('sign', 378, 9, { text: 'THE ROOF IS ALIGHT. STRIKE THE WATER BUTT, THEN DROP THROUGH THE HATCH.' });
  const roofFire = [[385, 9], [386, 9], [387, 9]];              /* a ladder up the barn's near gable onto the roof, and what the roof holds pays for the climb; the far gable stands five rows over it, so the roof is a dead end and never a way round the captain's door */
  interiors.push([323, 397, 12, 25, 'timber']);
  plat(327, 20, 67); net(326, 20, 25); net(394, 20, 25);                       // the hayloft, a ladder at each end
  plat(340, 16, 41); net(342, 16, 19);                                          // and the upper loft over it
  straw(323, 397, S, true); straw(327, 393, 19); straw(340, 380, 15);
  foe('sprig', 331, S);                               /* at the barn door: the rooftops' last screen had nobody in it (the density bar) */
  ent('sign', 324, S, { text: 'THE BARN IS HAY FROM THE FLOOR TO THE RAFTERS. THE CAPTAIN HOLDS THE FAR DOOR.' });
  ent('check', 341, S);                                /* inside the barn: from the street's last checkpoint to the well yard's is ninety-five columns */
  foe('burngob', 336, S); foe('sprig', 345, S); ent('watertrough', 352, S); foe('burngob', 362, 19); foe('archer', 372, 19);
  foe('emberwisp', 358, 17); foe('sprig', 384, 19);
  captive(372, 15); ent('silver', 379, 15); coins([346, 15], [352, 15], [358, 15]);
  captive(391, S, { hotNear: true });                 // the stall door: hot whenever the hay near it is burning
  foe('brute', 386, S);                                // THE BARN CAPTAIN (the ELITES row makes him, and his gate)
  coins([330, 19], [338, 19], [366, 19], [380, 19]);

  // ---- 5. THE WELL YARD ----
  ent('check', 404, S);
  ent('villagewell', 414, S);
  ent('sign', 408, S, { text: 'THE WELL PUTS OUT WHAT IS NEAR IT. IN HIS SQUARE, THE FLOOR BURNS AS HE RUNS HOT.' });
  house(420, 432, 19, 1); captive(422, S, { hot: true });
  foe('sprig', 428, S); foe('emberwisp', 436, 20); coins([418, S - 1], [426, 15], [430, 15]);
  block(440, 443, R - 1, R - 1); block(444, W - 1, R - 2, H - 1);            // up to the square, a step at a time

  // ---- 6. THE SQUARE ----
  const F = R - 2;                                     // the square's floor row
  ent('check', 446, F - 1);
  plat(461, F - 3, 5); plat(475, F - 3, 5); plat(488, F - 3, 5);            // three market stalls: somewhere off the burning floor
  burn.push([455, 495, F - 1, { square: true }]);
  foe('pyromancer', 484, F - 1, { boss: true });
  facades.push([448, 500, 12, F - 1, 'burning']);
  ent('gate', 504, F - 1);

  /* FLAME PILLARS, not campfires (Daniel): the village's own fire is columns that ROAR up and drop back to embers on a clock,
     so the road through them is timed, and every screen has fire on it. Placed on bare ground (never on straw: the village's
     fire does not spread) and never on a sign, door, trough or checkpoint; each is [x, y, period, phase]. */
  const busyAt = x => L.ents.some(e => Math.abs(e.x - x) <= 1 && e.y >= S - 1 && e.y <= S && ['sign', 'captive', 'watertrough', 'villagewell', 'check', 'gate', 'deco'].includes(e.t)) || burn.some(([a, b, r]) => r === S && x >= a - 1 && x <= b + 1) || pits.some(([a, b]) => x >= a - 1 && x <= b + 1) || trench.some(([a, b]) => x >= a - 1 && x <= b + 1) || heaps.some(h => x >= h.x0 - 1 && x <= h.x1 + 1);
  const pillarsAt = [15, 36, 69, 88, 118, 131, 163, 190, 213, 232, 248, 289, 313, 408, 436];
  const pillars = [];
  for (const want of pillarsAt) { let x = want; for (let k = 0; k < 6 && busyAt(x); k++) x = want + (k % 2 ? -1 : 1) * (1 + (k >> 1)); if (!busyAt(x)) pillars.push([x, S, 3.6 + (x % 3) * 0.4, (x * 0.37) % 3.6]); }
  stillFires.length = 0; stillFires.push(...pillars);
  const houses = roofs.map(([x0, x1, y, deep]) => ({ x0: x0 + 1, x1: x1 - 1, y0: y + 3, y1: S + (deep || 0), door: null, door2: null, seed: x0, thatch: true, burning: true }))
    .filter(h => h.y1 >= h.y0 && h.x1 > h.x0);

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: S }, pools: [], falls: [], moversExtra: [], interiors, roofs, houses, facades,
    burn, stillFires, beams, roofFire, village: true, emberPits: pits, deckBreaks: logs.map(([x0, x1, row]) => ({ x0, x1, row, t: -1, down: false, regrow: true, log: true }))
      .concat(beamSpans.map(([x0, x1, row]) => ({ x0, x1, row, t: -1, down: false, regrow: true, beam: true, onTop: true, fuse: BEAM.fuse }))),
    heaps, trench, cellarFires, smoke,
    calm: trench.map(([a, b, y0, y1]) => [a, b, y0, y1]),   /* nobody is garrisoned on a cellar floor: it is on fire */
    quest: { n: 6, item: 'folk', name: 'SAVED', done: 'THE VILLAGE IS OUT', thanks: 'THE VILLAGE THANKS YOU' },   /* the villagers are the level's quest: the count on the HUD and on the card */ night: true, glowNight: true, nightA: 0.18, duskStart: -1, duskLen: 1,
    music: 'quarry',                                    /* "Cavern and Blade" (zesona, CC0): the Quarry Pass's, benched with it */
    palette: { set: 'village', sky: 'night', far: 'village', mid: 'village', near: 'village', dress: 'village', haze: 'rgba(255,120,48,0.14)',
      grass: '#4a4a2e', grassL: '#6a6436', grassD: '#2e2c1c', dirt: '#4a3a2e', dirtL: '#5e4a38', dirtD: '#2e241c',
      canopy: ['#2a1a16', '#3a221a', '#4a2c1e', '#5e3822'] },
    weather: [{ x0: 0, x1: 99999, kind: 'embers' }], ambient: [{ x0: 0, x1: 99999, kind: 'forest' }],
    arena: { x0: 454 * TS, x1: 496 * TS, floor: F * TS, trigger: 458 * TS, wallL: 453, wallR: 497, boss: 'pyromancer', music: 'hilltroll',
      tint: '#ff6b2c', tintA: 0.1, fx: 'embers' },
  };
}

// ============================================================================================ THE STAKES (2026-09-23)
// KICKOFF 4%: "NOTHING CAN EVER BE LOST: SAVED 0/6 is guaranteed, so every system is texture." A captive is LOSABLE now, on a
// FUSE, and that makes the fire, the troughs and the well a fight against the clock instead of dressing:
//   A HOT DOOR (an authored house already burning): its fuse starts the moment the villager behind it calls for help and runs
//                  CAPTIVE.hot seconds. Water on the door (a trough, the well) pauses it while the door is cooled.
//   ANY OTHER DOOR: its fuse runs only while the Pyromancer's fire (the grid) is ALIGHT on the house - CAPTIVE.near cells or
//                  more within CAPTIVE.r tiles - so he and his burning goblins are what put a villager at risk, and putting
//                  the fire out is what saves them. CAPTIVE.reached seconds of that and the house has them.
// A villager lost is lost for THIS RUN only (the count resets with the level, like the saved one), so a player can come back
// and do better. Pure: main.js counts the fire and draws; tools/village-stakes.mjs drives this directly.
export const CAPTIVE = { hot: 40, reached: 20, near: 2, r: 6 };
/* one frame of a captive's fuse. `alightNear` is the count of burning grid cells about their house. Returns what just
   happened for the world to say - 'half', 'last', 'lost' - or null */
export function stepFuse(pr, dt, alightNear) {
  if (pr.freed || pr.lost) return null;
  pr.fuseMax = pr.hot ? CAPTIVE.hot : CAPTIVE.reached;
  const run = !pr.cooled && (pr.hot ? !!pr.said : alightNear >= CAPTIVE.near);
  pr.fuseOn = run;
  if (run) pr.fuse = (pr.fuse || 0) + dt;
  const k = (pr.fuse || 0) / pr.fuseMax;
  if (k >= 1) { pr.lost = true; return 'lost'; }
  if (k >= 0.8 && !pr.warn2) { pr.warn2 = pr.warn1 = true; return 'last'; }
  if (k >= 0.5 && !pr.warn1) { pr.warn1 = true; return 'half'; }
  return null;
}
export const fuseLeft = pr => pr.fuseMax ? Math.max(0, 1 - (pr.fuse || 0) / pr.fuseMax) : 1;

/* THE FIRE BEHIND THE TOWN, redrawn (KICKOFF 4%: it was two flat full-width fills at 0.35 and 0.25 - a colour wash, not fire -
   anti-aliased arc smoke in a game of placed pixels, and one layer with no depth; and it ignored the real fire entirely).
   Now: a HARD-BANDED glow, brightest at the rooflines, with a checkered pixel row between bands; a second, dimmer ridge of
   roofs further back; square pixel smoke; and all of it driven by `heat` (0..1), the share of the village's fire grid that is
   burning near the camera - put the fire out and the sky behind the town goes down with it. */
const GLOW = ['#2a0e10', '#4a1612', '#7a2414', '#b03c16', '#e0641c', '#ff9a3c'];
export function drawBurningBackdrop(g, VW, VH, base, off, time, heat) {
  const k = Math.max(0, Math.min(1, heat)), bands = GLOW.length, bh = 11, top = base - bands * bh - 4;
  const lift = Math.round(k * 2);                                   // a hotter fire lights a band higher
  for (let i = 0; i < bands; i++) { const ci = Math.min(bands - 1, i + lift - 1 < 0 ? 0 : i + lift - 1), y = top + i * bh;
    g.globalAlpha = 0.28 + 0.5 * k * (i + 1) / bands; g.fillStyle = GLOW[ci]; g.fillRect(0, y, VW, bh);
    if (i + 1 < bands) { g.fillStyle = GLOW[Math.min(bands - 1, ci + 1)]; for (let x = (i & 1); x < VW; x += 2) g.fillRect(x, y + bh - 1, 1, 1); } }
  g.globalAlpha = 1;
  /* THE FAR RIDGE: a second row of roofs, smaller, slower and darker, with the odd window */
  const off2 = off * 0.55;
  for (let q = Math.floor(off2 / 30) - 1; q < Math.floor((off2 + VW) / 30) + 2; q++) {
    const h = 14 + ((q * 29) % 4) * 4, w = 20 + ((q * 17) % 3) * 6, x = Math.round(q * 30 - off2), y = base - 10 - h, peak = 6 + ((q * 5) % 3) * 3;
    g.fillStyle = '#2a1014'; g.fillRect(x, y, w, h + 12); g.beginPath(); g.moveTo(x - 2, y + 1); g.lineTo(x + w / 2, y - peak); g.lineTo(x + w + 2, y + 1); g.fill();
    if ((q * 7) % 5 === 0) { g.fillStyle = k > 0.3 ? '#ff9a3c' : '#7a3a1c'; g.fillRect(x + 6, y + 6, 2, 3); } }
}
/* SMOKE, in pixels: squares that rise, drift and thin from a roof - 2 px near the fire, 3 px as they spread */
export function drawPixelSmoke(g, x, y, time, seed, heat) {
  const n = 5 + Math.round(heat * 4);
  for (let q = 0; q < n; q++) { const t = (time * 0.6 + q * 0.37 + seed * 0.13) % 1, sy = Math.round(y - t * 70), sx = Math.round(x + Math.sin(time * 0.8 + q + seed) * (3 + t * 10) + t * 6), s = t < 0.4 ? 2 : 3;
    g.globalAlpha = 0.55 * (1 - t); g.fillStyle = t < 0.2 ? '#4a2a22' : '#2a1c1e'; g.fillRect(sx, sy, s, s); }
  g.globalAlpha = 1;
}
