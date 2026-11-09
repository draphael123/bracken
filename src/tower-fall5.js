// src/tower-fall5.js - FALLING TOWER 5: A TOWER THAT FALLS (claude/ft5a, the LEVEL greybox; scratch/brief-fallingtower5-1108.md, scratch/lane-reports/ft5-plan.md sec 2).
// Daniel 11-08: FT4 "still feels clunky and doesn't really feel like a falling tower". So the tower is TOPPLING, and the level is built so that you feel it go:
//   THE LEAN (hybrid, plan sec 1)  the play angle is AUTHORED - floors that are slopes (Act I flat with buckled ends, Act II 1:2 sawtooth, Act III 1:1), the
//                                  floors offset EAST up the tower (the shaft itself leans: +5 a floor in Act II, +8 in Act III) - and the FEEL angle is a small
//                                  frame roll per act (src/ft5-level.js, main.js seaTilt hook) and a horizon drawn at the story angle (the art lane: L.ft5.acts[].story)
//   THE CORE VERB                  jump across chunks that crack and fall under you (src/tower-collapse.js, three profiles: TEACH / QUICK / SNAP) and ride a SLAB
//   HIS POISON RISES               the spiral stair's RISE made the level's chaser (src/chase.js): Act II and Act III up the shaft, then along the fallen wall
//                                  (axis x). It hurts and throws you up, NEVER kills (ft4 'spare'), per co-op seat.
//   IT GOES OVER                   the Outer Face is a climb that BENDS - planks up the wall, then the wall's courses at 1:1, then 1:2, then flat - so the last
//                                  stretch is a run along the tower lying down, ending where its crown rests on the spire field: THE ARENA (lane ft5b).
// One camera, no cut. FOUR CHECKPOINTS: the START (library), the Reading Room's braced room (Act I's end), the Lab's braced room (Act II's end), THE CROWN
// (before the arena). Act III and the run have none: the poison never kills (plan Q, held from FT4).
// The runtime is src/ft5-level.js; tools/fallingtower5.mjs is the check. Built only with src/ft5-flag.js ft5On() (FT5_SHIPS false = master's tower).
import { SLOPE } from './slopes.js';
import { buildSpireField } from './spire-field.js';
import { FT5_LINES } from './ft5-lines.js';
export { FT5_LINES, SLAB } from './ft5-lines.js';

const TS = 16;
/* THE GRID. W x H; the tower climbs up-and-east as a leaning stack, the Outer Face bends flat along row RUN.floor heading east, and the SPIRE FIELD
   (the boss, lane ft5b) stands east of the crown. */
export const FT5 = { W: 300, H: 320 };
/* THE SHARED CONSTANT (plan sec 6): lane ft5b builds the spire field and both phases INSIDE this box. Tiles.
     x0, x1      the box's columns (64 wide: the old hall's width)
     y0          its top row (sky over the spires; the desert's rows are above it, ft5b's to lay)
     y1          its bottom row (the sea's floor; nothing of the level is built under it)
     sea         the poison sea's surface row at the start of phase 1 (the tides rise from it)
     crownSpot   where you arrive, standing (x, y = the row your feet are in): the fallen tower's crown resting on the west spire; checkpoint 4 is just behind it
     runFloor    the solid row the run (and the crown) stands on
     check       checkpoint 4 (the boss retry spot: plan Q1, the whole fight from the crown) */
export const FT5_ARENA = { x0: 226, x1: 290, y0: 14, y1: 78, sea: 70, crownSpot: { x: 222, y: 62 }, runFloor: 63, check: { x: 212, y: 62 } };
/* THE RUN along the fallen wall, and THE BEND that turns the climb into it */
export const RUN = { x0: 131, x1: FT5_ARENA.x0 - 1, floor: 63, safe: 208 };
export const BEND = { face: [101, 106], steep: { x0: 107, row0: 78, n: 8 }, gentle: { x0: 115, row0: 70, n: 8 } };
/* THE CRUMBLE PROFILES (plan 2.1): count = s under weight before it goes, back = s until it is back (unless the poison passed it), gap = a chain's next one */
export const CRUMBLE5 = { teach: { count: 3, back: 4 }, quick: { count: 1.2, back: 4 }, snap: { count: 0.7, back: 5, gap: 0.4 } };
/* THE POISON (plan 2.2), px/s per surge; and THE SLAB (a mover, plan 2.1) */
export const POISON = { dmg: 21, hold: 1.2, rubber: { min: 72, max: 170, slow: 0.4, catch: 1.2 }, act2: [18, 21, 24], act3: [26, 30, 34], run: [70, 85] };
/* THE FLOORS (name, kind, X0, top, bot, act). bot is the floor row; a floor's divider is the two rows over its top. Act I 36 rows, Act II 30, Act III 30/24/20 -
   and each floor up the leaning stack starts further east (the shaft drifts downhill-side) */
export const FLOORS5 = [
  { name: 'THE LIBRARY STACKS', kind: 'library', X0: 12, top: 284, bot: 318, act: 1 },
  { name: 'THE READING ROOM', kind: 'reading', X0: 12, top: 248, bot: 282, act: 1 },
  { name: 'THE OBSERVATORY', kind: 'orrery', X0: 17, top: 218, bot: 246, act: 2 },
  { name: 'THE PENDULUM GALLERY', kind: 'clock', X0: 22, top: 188, bot: 216, act: 2 },
  { name: 'THE ALCHEMY LAB', kind: 'lab', X0: 27, top: 158, bot: 186, act: 2 },
  { name: 'THE BELL LOFT', kind: 'flip', X0: 35, top: 128, bot: 156, act: 3 },
  { name: 'THE TREASURY', kind: 'vault', X0: 43, top: 104, bot: 126, act: 3 },
  { name: 'THE BREACH', kind: 'dome', X0: 51, top: 84, bot: 102, act: 3 },
].map(f => ({ ...f, X1: f.X0 + 47 }));
/* A PENDULUM (the 'swing' mover; src/tower-ascent.js SWING, kept here so FT5 does not import the FT4 builder) */
const SW = { arm: 12 * 16, th: 0.9, w: 48 };
const endRise = () => Math.round(SW.arm * (1 - Math.cos(SW.th)) / 16);

export function buildTowerFall5({ painter, T }) {
  const { W, H } = FT5, A = FT5_ARENA;
  const L = painter(W, H), { set, ent, coins } = L;
  const at = (x, y) => L.grid[y * W + x];
  const rect = (x0, x1, y0, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  const ledge = (x0, len, row, t = T.ONEWAY) => rect(x0, x0 + len - 1, row, row, t);
  const deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: x < 60 ? 1 : -1 }, o || {}));
  const interiors = [], nets = [], crumbles = [], supports = [], moversExtra = [], flips = [], glyphBridges = [], rigBands = [], pieces = [], breathers = [], braced = [];
  const net = (x, y0, y1) => nets.push([x, y0, y1]);
  const crumble = (x0, len, row, prof, o) => crumbles.push({ x0, x1: x0 + len - 1, row, kind: prof, ...CRUMBLE5[prof], ...(o || {}) });
  const bones = {};
  const F = FLOORS5.map(f => ({ ...f, tiers: [] }));
  const tier = (f, x0, len, row, t = T.ONEWAY) => { ledge(x0, len, row, t); f.tiers.push([x0, len, row]); return [x0, len, row]; };
  /* SLOPE RUNS on a floor (src/slopes.js: every slope sits on rock). Falling EAST (the way the tower goes over): 1:2 is L2B,L2A a row, 1:1 is L1 a row.
     A run of `seg` rows falls east and then the floor steps back up `seg` rows: "a run of slopes broken into steps" (plan sec 1). Returns the tiles laid. */
  const sawtooth = (x0, x1, bot, grade, seg = 2) => { let n = 0;
    for (let x = x0; x <= x1;) { for (let r = 0; r < seg && x <= x1; r++) { const row = bot - seg + r;
        if (grade === 1) { set(x, row, SLOPE.L1); rect(x, x, row + 1, bot - 1, T.SOLID); x++; n++; }
        else { if (x + 1 > x1) { x = x1 + 1; break; } set(x, row, SLOPE.L2B); set(x + 1, row, SLOPE.L2A); rect(x, x + 1, row + 1, bot - 1, T.SOLID); x += 2; n += 2; } } }
    return n; };

  // ---- THE ROCK, THE SKY, THE ROOMS ----
  rect(0, W - 1, 0, H - 1, T.SOLID);
  rect(0, W - 1, 0, RUN.floor - 1, T.AIR);                                  /* the sky over everything: the storm, the spire field, the desert's rows (ft5b) */
  rect(0, BEND.face[1], RUN.floor, F[7].top - 1, T.AIR);                    /* over the gutted tower: the Breach has no roof (Act III: "holes to the sky in every floor") */
  for (const f of F) { rect(f.X0, f.X1, f.top, f.bot - 1, T.AIR); interiors.push([f.X0, f.X1, f.top, f.bot - 1, f.kind]); }

  // ================= ACT I - THE TIP (~5 deg, teach): the tower whole and groaning; no poison (a teaser at its end) =================
  // ---- 1. THE LIBRARY STACKS. You come in already tipping: the first screen is a buckled stair (no walk-right opener). ----
  { const f = F[0], B = f.bot, X = f.X0;
    /* THE BUCKLED FLOOR: a hump of 1:2 under your feet at the start, and the east end buckled the same (Act I: flat with buckled ends) */
    for (const x of [X + 3, X + 40]) { set(x, B - 1, SLOPE.R2A); set(x + 1, B - 1, SLOPE.R2B); set(x + 2, B - 1, SLOPE.L2B); set(x + 3, B - 1, SLOPE.L2A); }
    rect(X, X + 1, B - 22, B - 1, T.SOLID); rect(f.X1 - 1, f.X1, B - 18, B - 1, T.SOLID);   /* the stacks to the ceiling on both walls */
    tier(f, X + 2, 10, B - 3);
    const teach = tier(f, X + 10, 9, B - 6); crumble(teach[0], teach[1], teach[2], 'teach');   /* FAILING STONE, TAUGHT SAFE: a fall is onto the floor */
    tier(f, X + 18, 10, B - 9);
    tier(f, X + 27, 16, B - 12);                                            /* long: it runs on under the chunks - a chunk that goes drops you here, not to the floor */
    for (const dx of [33, 37, 41]) { ledge(X + dx, 2, B - 15); crumble(X + dx, 2, B - 15, 'quick'); }   /* QUICK chunks over a short gap: the only way to the next tier */
    tier(f, X + 42, 6, B - 18);
    tier(f, X + 34, 8, B - 21);
    tier(f, X + 24, 9, B - 24);
    tier(f, X + 14, 9, B - 27);
    const top = tier(f, X + 6, 8, B - 30);
    f.rope = X + 9; net(f.rope, F[1].bot, top[2] - 1);
    /* THE SHELVES GO (FT4's set piece, kept): walk onto the upper stair and two cases go over - told 1.0 s - and lie down as a shortcut stair */
    pieces.push({ id: 'shelves', kind: 'lay', act: 1, zone: [X + 34, X + 47, B - 22, B - 17], tell: 1.0, say: FT5_LINES.shelves, shake: 5,
      lay: [[X + 38, X + 41, B - 24], [X + 28, X + 31, B - 27]] });
    /* ...and the third leans on a CRACKED PILLAR (lib-top, src/tower-supports.js 'ramp'): strike it and it lies down as a stair to the top tier */
    supports.push({ t: 'ftsupport', id: 'lib-top', kind: 'ramp', col: X + 31, row: B - 25, h: 3, spans: [[X + 18, X + 21, B - 30]], say: 'THE LAST CASE LIES DOWN: A STAIR OF ITS SHELVES' });
    ent('sign', X + 8, B - 1, { text: 'THE TOWER IS GOING OVER. CLIMB. WHAT CRACKS UNDER YOU FALLS.' });
    ent('sign', X + 22, B - 1, { text: 'CRACKED STONE COUNTS DOWN UNDER YOU - 3, 2, 1 - AND GOES. STEP OFF IT IN TIME.' });
    ent('sign', X + 30, B - 13, { text: 'DARK CHUNKS GO QUICKLY: JUMP ACROSS THEM, DO NOT STAND.' });
    ent('sign', X + 26, B - 25, { text: 'A CRACKED PILLAR HOLDS THE LAST CASE UP. STRIKE IT.' });
    deco('brokenPillar', X + 18, B - 1);                                    /* (the stair's mid tier stands on a broken pillar: tools/solid-islands.mjs - the art lane draws the shelving) */
    deco('lectern', X + 12, B - 1); deco('bookpile', X + 28, B - 1); deco('desk', X + 34, B - 1); deco('candelabra', X + 20, B - 1);
    /* the skeleton set's first spot (BONES_SHIPS, plan sec 7): the library floor teaches the shield */
    foe('zombie', X + 32, B - 1); bones.soldier1 = { x: X + 32, y: B - 1, from: 'zombie', at: 'the library floor' };
    for (const [t, x, y] of [['apprentice', X + 22, B - 10], ['armour', X + 30, B - 13], ['apprentice', X + 28, B - 25], ['tome', X + 40, B - 8]]) foe(t, x, y);
    coins([X + 44, B - 19], [X + 45, B - 19], [X + 46, B - 19]);
    ent('silver', X, B - 23);                                               /* SECRET 1: on top of the west stack - a drop off the top tier's west end */
  }
  // ---- 2. THE READING ROOM: the Folly's gravity, ONE flip (stand on the glyph, fall up, walk the ceiling, fall back down onto the gallery). ----
  //      FT4's room as it was (it is at the same columns): LOAD-BEARING - without the flip the gallery and everything over it is out of reach.
  { const f = F[1], slab = f.top + 10, under = slab + 2, gap = [14, 16];
    rect(f.X0, f.X1, slab, slab + 1, T.SOLID); rect(gap[0], gap[1], slab, slab + 1, T.AIR);
    for (const [x0, len, row] of [[20, 10, f.bot - 3], [28, 10, f.bot - 6], [36, 9, f.bot - 9], [44, 9, f.bot - 12], [36, 12, under + 7]]) tier(f, x0, len, row);
    const g1 = { x: 46, y: under + 6 }; ent('glyph', g1.x, g1.y);
    const g2 = { x: 50, y: f.top }; ent('glyph', g2.x, g2.y, { ceiling: true });
    flips.push({ from: g1, up: under, walk: [gap[0] + 1, g1.x], through: gap[0] + 1, ceil: f.top, to: g2 });
    glyphBridges.push([gap[1] + 1, g2.x + 2, slab - 1, g1.y]);
    tier(f, 28, 10, slab - 3); const top = tier(f, 18, 9, slab - 6);
    for (let x = g1.x - 2; x >= gap[1] + 1; x -= 3) ent('coin', x, under);
    ent('sign', 20, f.bot - 1, { text: 'THE READING ROOM. THE GLYPH TURNS THE ROOM OVER: STAND ON IT, AND FALL UP.' });
    deco('readingDesk', 30, f.bot - 1); deco('globe', 52, f.bot - 1); deco('candelabra', 26, slab - 1);
    /* ACT I'S END: THE BRACED ROOM - its shrine (checkpoint 2), and the teaser: his poison seen welling far below, no contact */
    ent('check', top[0] + 1, top[2] - 1); braced.push({ id: 'reading', act: 1, box: [top[0], top[0] + top[1] - 1, top[2] - 3, top[2] - 1] });
    pieces.push({ id: 'teaser', kind: 'say', act: 1, zone: [top[0], top[0] + top[1] - 1, top[2] - 3, top[2] - 1], tell: 0, say: FT5_LINES.teaser, shake: 2 });
    f.rope = top[0] + (top[1] >> 1); net(f.rope, F[2].bot, top[2] - 1);
    /* the skeleton set's second spot: an archer on the reading room's tier */
    foe('apprentice', 32, f.bot - 7); bones.archer1 = { x: 32, y: f.bot - 7, from: 'apprentice', at: 'the reading room tier' };
    for (const [t, x, y] of [['tome', 40, f.bot - 12], ['armour', 48, f.bot - 13], ['apprentice', 22, slab - 7]]) foe(t, x, y);
  }

  // ================= ACT II - IT GOES OVER (~15 deg, test): the back wall open to the storm, the poison ON (18 -> 21 -> 24) =================
  // ---- 3. THE OBSERVATORY. A floor of 1:2 steps; QUICK chunks breaking off the tower's edge; THE DOME COMES IN. ----
  { const f = F[2], B = f.bot, X = f.X0;
    f.slopes = sawtooth(X + 9, f.X1 - 1, B, 2);
    tier(f, X + 7, 8, B - 4);
    for (const dx of [16, 20, 24]) { ledge(X + dx, 2, B - 7); crumble(X + dx, 2, B - 7, 'quick'); }
    tier(f, X + 26, 8, B - 10);
    tier(f, X + 35, 9, B - 13);
    tier(f, X + 27, 7, B - 16);
    tier(f, X + 19, 7, B - 19);
    tier(f, X + 11, 7, B - 22);
    const top = tier(f, X + 3, 8, B - 25);
    f.rope = top[0] + 4; net(f.rope, F[3].bot, top[2] - 1);
    /* THE DOME COMES IN (kept): stand on the high landing and two ribs of the dome fall - told 1.0 s - and lie as ledges (a second stair up) */
    pieces.push({ id: 'dome', kind: 'lay', act: 2, zone: [X + 35, X + 43, B - 16, B - 13], tell: 1.0, say: FT5_LINES.dome, shake: 5, slick: true,
      lay: [[X + 39, X + 42, B - 16], [X + 31, X + 34, B - 19]] });
    ledge(X + 45, 2, B - 16); ent('silver', X + 45, B - 17);                  /* SECRET 2: a pocket off the high landing, against the east wall */
    ent('sign', X + 2, B - 1, { text: 'THE OBSERVATORY. HIS POISON IS COMING UP THE SHAFT: KEEP CLIMBING.' });
    deco('telescope', X + 4, B - 1); deco('starChart', X + 20, f.top + 1, { hang: true }); deco('orreryBase', X + 30, B - 3);
    /* the skeleton set's third spot: the observatory landing */
    foe('zombie', X + 30, B - 11); bones.soldier2 = { x: X + 30, y: B - 11, from: 'zombie', at: 'the observatory landing' };
    for (const [t, x, y] of [['apprentice', X + 39, B - 14], ['tome', X + 22, B - 20]]) foe(t, x, y);
  }
  // ---- 4. THE PENDULUM GALLERY. Two of FT4's three books ride the gear pit (fewer stop-start), and THE GALLERY SHEARS on the last. ----
  { const f = F[3], B = f.bot, dx = f.X0 - 12, rise = endRise(), mid = 36 + dx, bw = SW.w + 16;
    rect(26 + dx, 41 + dx, B - 1, B - 1, T.SPIKE);                                            /* the gear pit bites */
    f.slopes = sawtooth(f.X0 + 5, 25 + dx, B, 2) + sawtooth(43 + dx, f.X1, B, 2);
    const stairL = [[13 + dx, 6], [19 + dx, 7]], stairR = [[53 + dx, 6], [47 + dx, 7]];
    let row = B - 3; const swings = [];
    for (let s = 0; s < 2; s++) {
      const fromLeft = s % 2 === 0, st = fromLeft ? stairL : stairR;   /* (the first from the LEFT: the observatory's rope comes up at the west wall) */
      tier(f, st[0][0], st[0][1], row); row -= 3;
      tier(f, st[1][0], st[1][1], row);
      const other = fromLeft ? stairR[1] : stairL[1]; tier(f, other[0], other[1], row);
      const yb = row + rise; moversExtra.push({ kind: 'swing', px: mid * TS + 8, py: (yb - 12) * TS, arm: SW.arm, x: 0, y: 0, w: bw, h: 8, period: 3.8 + s * 0.3, phase: s * 1.3, book: true, ...(s === 1 ? { ft5: 'shear' } : {}) });
      swings.push({ row, yb, land: other }); row -= 3;
    }
    /* A LANDING YOU MUST LEAVE IN TIME (FT4's, kept): the first ride's far landing counts the moment you land; a rope up from the gallery floor if it goes */
    { const [lx, ll] = swings[0].land, r0 = swings[0].row; crumbles.push({ x0: lx, x1: lx + ll - 1, row: r0, count: 2.5, back: 4, kind: 'landing' }); net(stairR[0][0] + stairR[0][1] - 1, r0 - 3, B - 1); }
    const lt = tier(f, 15 + dx, 8, row);                                                       /* off the second ride's landing (west) */
    /* THE GALLERY SHEARS: riding the last book sets it going (told 2 s) - the landing drops two rows (a body on it rides down) and a chunk of the
       gallery wall lands as a step, so the way on is still there */
    const land = swings[1].land;
    pieces.push({ id: 'shear', kind: 'shear', act: 2, mover: 'shear', tell: 2.0, say: FT5_LINES.shear, shake: 6, rows: 2,
      ledges: [[land[0], land[0] + land[1] - 1, swings[1].row]], lay: [[land[0] + 4, land[0] + land[1] + 3, swings[1].row - 1]] });
    tier(f, 23 + dx, 8, row - 3); tier(f, 14 + dx, 8, row - 6);
    const top = tier(f, 22 + dx, 8, row - 9);                                                  /* (its rope comes up on the lab's flat west end) */
    f.rope = top[0] + 4; net(f.rope, F[4].bot, top[2] - 1);
    ent('sign', f.X0 + 1, B - 1, { text: 'THE PENDULUM GALLERY. RIDE THE BOOKS OVER THE GEARS - THE POISON WAITS UNDER EVERY RIDE.' });
    deco('clockface', mid, f.top + 3, { hang: true }); deco('gears', mid - 4, B - 2);
    for (const [t, x, y] of [['armour', 15 + dx, B - 1], ['apprentice', 50 + dx, swings[0].row - 1], ['apprentice', 22 + dx, swings[1].row - 1], ['tome', 43 + dx, row - 4]]) foe(t, x, y);
    { const [lx, ll] = swings[1].land, c0 = lx + (ll >> 1) - 1; coins([c0, swings[1].row - 1], [c0 + 1, swings[1].row - 1], [c0 + 2, swings[1].row - 1]); }
    f.swings = swings;
  }
  // ---- 5. THE ALCHEMY LAB. The flood comes up THROUGH it; QUICK chunks; the cracked pillar's BRIDGE (required); the elite husk spits into your landing. ----
  { const f = F[4], B = f.bot, X = f.X0;
    f.slopes = sawtooth(X + 11, f.X1, B, 2);
    tier(f, X + 9, 9, B - 3);
    tier(f, X + 17, 9, B - 6);
    tier(f, X + 26, 8, B - 9);
    for (const dx of [34, 38, 42]) { ledge(X + dx, 2, B - 12); crumble(X + dx, 2, B - 12, 'quick'); }
    tier(f, X + 39, 8, B - 15);
    /* THE BRIDGE (src/tower-supports.js 'bridge', REQUIRED): the pillar stands on the east tier; the west tier is fourteen tiles off - no jump */
    const east = tier(f, X + 32, 6, B - 18), west = tier(f, X + 11, 6, B - 18);
    supports.push({ t: 'ftsupport', id: 'lab-bridge', kind: 'bridge', col: east[0] + 1, row: east[2] - 1, h: 3, spans: [[west[0] + west[1], east[0] - 1, east[2]]], say: 'THE PILLAR FALLS ACROSS: A BRIDGE' });
    ent('sign', east[0] + 3, east[2] - 1, { text: 'A CRACKED PILLAR. STRIKE IT AND IT FALLS ACROSS THE GAP.' });
    foe('apprentice', west[0] + 2, west[2] - 1, { face: 1 });
    tier(f, X + 3, 8, B - 21); deco('brokenPillar', X + 6, B - 1);         /* (its tier stands on a broken pillar off the lab's floor) */
    const top = tier(f, X + 11, 8, B - 24);
    /* THE ELITE HUSK (kill-first: it spits into your landing) on the tier over the chunks */
    foe('husk', X + 43, B - 16, { elite: true, face: -1 });
    /* THE SLAB (plan 2.1, a mover): a floor section on the lab's west wall tears loose under you and slides down the lean - a way down to the low tiers
       for a hero thrown up past them; never the only way on (the greybox: until a browser walk proves the ride) */
    moversExtra.push({ kind: 'ft5slab', ft5: 'slab', sx: (X + 1) * TS, sy: (B - 21) * TS, x: (X + 1) * TS, y: (B - 21) * TS, w: 32, h: 8, dir: 1, st: 'wait', t: 0 });
    /* ACT II'S END: THE LAB'S BRACED ROOM - checkpoint 3 (before the Sexton, as FT4) */
    ent('check', top[0] + 1, top[2] - 1); braced.push({ id: 'lab', act: 2, box: [top[0], top[0] + top[1] - 1, top[2] - 3, top[2] - 1] });
    f.rope = top[0] + 4; net(f.rope, F[5].bot, top[2] - 1);
    ent('sign', X + 1, B - 1, { text: 'THE ALCHEMY LAB. HIS POISON AND THE LAB\'S ARE ONE NOW: IT COMES UP THROUGH HERE.' });
    for (const [j, kind] of [[0, 'still'], [2, 'retorts'], [5, 'jars']]) { const t = f.tiers[j]; if (t) deco(kind, t[0] + 2, t[2] - 1); }
    for (const [t, x, y] of [['apprentice', X + 20, B - 7], ['tome', X + 30, B - 12]]) foe(t, x, y);
  }

  // ================= ACT III - FREEFALL (30+ deg, exam): gutted, holes to the sky, the poison fast after the bell =================
  // ---- 6. THE BELL LOFT and THE SEXTON (the mini, FT4's loft at this floor's columns). After him THE BELL FALLS. ----
  let bell;
  { const f = F[5], b = f.bot, dx = f.X0 - 12, deck = b - 3, frame = b - 18;
    rect(f.X0, f.X1, deck, deck, T.PLANK);
    for (const [a, z] of [[12, 14], [38, 40]]) rect(a + dx, z + dx, deck - 2, b - 1, T.SOLID);
    for (const x of [20, 26, 32, 46, 52]) rect(x + dx, x + dx, deck, b - 1, T.SOLID);
    rect(53 + dx, f.X1, deck, b - 1, T.SOLID);
    rect(f.X0, f.X1, frame, frame + 1, T.SOLID);
    rect(52 + dx, 52 + dx, frame + 2, deck - 1, T.PORT);
    net(56 + dx, frame, deck - 1);
    const bays = [[15, 19], [21, 25], [27, 31], [33, 37], [41, 45], [47, 51]].map(([a, z]) => [a + dx, z + dx]), ropeX = F[4].rope;
    for (const [x0, x1] of bays) { crumbles.push({ x0, x1, row: deck, kind: 'deck' }); for (let x = x0; x <= x1; x++) if (x !== ropeX) set(x, b - 1, T.SPIKE); }
    if (bays.some(([x0, x1]) => ropeX >= x0 && ropeX <= x1)) net(ropeX, deck + 1, b - 1);
    bell = { deck, frame, joists: [13, 20, 26, 32, 39, 46].map(x => (x + dx) * TS + 8), spikes: { row: b - 1, bays, rope: ropeX } };
    ent('sexton', 30 + dx, deck - 1, { mini: true, face: -1 });
    ent('sign', 13 + dx, deck - 3, { text: 'THE BELL LOFT. HIS TOLL SETS THE DECK COUNTING: GET OFF THE PLANKS.' });
    f.mini = { x0: f.X0 * TS, x1: (52 + dx) * TS, floor: deck * TS, y0: frame * TS, y1: (deck + 4) * TS, trigger: (14 + dx) * TS, wallL: f.X0, gate: 52 + dx, boss: 'sexton', name: 'THE SEXTON' };
    /* THE BELL FALLS (kept): after the Sexton, told 1.0 s, the deck under it breaks - and it lies in the shaft: THE BELL PLUGS THE WELL (a reason, not a rule) */
    pieces.push({ id: 'bell', kind: 'bell', act: 3, after: 'sexton', zone: [f.X0, f.X1, frame + 2, deck + 2], tell: 1.0, say: FT5_LINES.bell, after2: FT5_LINES.bellAfter, shake: 5, bays: [26 + dx, 34 + dx], deck });
    /* over the frame: two tiers to the rope into the treasury */
    tier(f, 48 + dx, 9, frame - 3); const top = tier(f, 38 + dx, 9, frame - 6);
    /* THE BELL ROPE (the third pillar, plan 2.3): a cracked pillar by the frame's rope. Strike it and the bell's rope gives - its rubble plugs the well: HIS POISON HOLDS */
    supports.push({ t: 'ftsupport', id: 'bell-rope', kind: 'dark', col: 50 + dx, row: frame - 4, h: 3, dark: true, say: 'THE RUBBLE PLUGS THE WELL: HIS POISON HOLDS' });
    ent('sign', 54 + dx, frame - 4, { text: 'STRIKE THE CRACKED PILLAR: ITS RUBBLE HOLDS HIS POISON A WHILE.' });
    f.rope = top[0] + 4; net(f.rope, F[6].bot, top[2] - 1);
    f.frame = frame;
  }
  // ---- 7. THE TREASURY. Its floor is 1:1 (the sliding gold is the slope verb), a SNAP chain, and a braced ledge to breathe on. ----
  { const f = F[6], B = f.bot, X = f.X0;
    f.slopes = sawtooth(X + 1, F[5].rope - 3, B, 1, 2) + sawtooth(F[5].rope + 3, f.X1, B, 1, 2);
    for (let x = F[5].rope + 4; x <= f.X1 - 1; x += 3) ent('coin', x, B - 3);                      /* the gold on the slopes */
    tier(f, X + 25, 8, B - 3);
    for (const [k, dx] of [[0, 34], [1, 37], [2, 40]]) { ledge(X + dx, 2, B - 6); crumble(X + dx, 2, B - 6, 'snap', { chain: 'treasury', seq: k }); }
    tier(f, X + 41, 6, B - 9);
    ledge(X + 44, 3, B - 12); ent('silver', X + 45, B - 13);                 /* SECRET 3: a pocket over the chunks' far tier, off the way west */
    /* A SLAB (optional): the west floor of the vault tears loose under you and slides down the lean over the gold */
    moversExtra.push({ kind: 'ft5slab', ft5: 'slab', sx: (X + 2) * TS, sy: (B - 6) * TS, x: (X + 2) * TS, y: (B - 6) * TS, w: 32, h: 8, dir: 1, st: 'wait', t: 0 });
    const brace = tier(f, X + 32, 8, B - 12);
    breathers.push({ id: 'treasury', box: [brace[0], brace[0] + brace[1] - 1, brace[2] - 2, brace[2] - 1], hold: 6, say: FT5_LINES.breathe });
    braced.push({ id: 'treasury-ledge', act: 3, box: [brace[0], brace[0] + brace[1] - 1, brace[2] - 3, brace[2] - 1] });
    tier(f, X + 23, 8, B - 15);
    const top = tier(f, X + 14, 8, B - 18);
    f.rope = top[0] + 4; net(f.rope, F[7].bot, top[2] - 1);
    ent('sign', X + 26, B - 4, { text: 'THE TREASURY. THE FLOOR IS GOING OVER: THE GOLD SLIDES, AND SO WILL YOU.' });
    /* the skeleton set's fourth spot: the treasury approach */
    foe('zombie', F[5].rope + 6, B - 3); bones.mage1 = { x: F[5].rope + 6, y: B - 3, from: 'zombie', at: 'the treasury approach' };
    for (const [t, x, y] of [['armour', X + 33, B - 13], ['apprentice', X + 24, B - 16]]) foe(t, x, y);
  }
  // ---- 8. THE BREACH. A gutted floor walked east over a SNAP chain to the hole in the east wall, and out onto THE OUTER FACE. ----
  { const f = F[7], B = f.bot, X = f.X0;
    for (const [k, x0] of [[0, X + 19], [1, X + 21], [2, X + 23]]) crumble(x0, 2, B, 'snap', { chain: 'breach', seq: k, rows: 2 });   /* (two wide: a hero running at 92 px/s is always off one before it goes - tools/fallingtower5.mjs) */
    f.slopes = sawtooth(X + 36, X + 41, B, 1, 2);
    rect(f.X1 + 1, f.X1 + 2, B - 4, B - 1, T.AIR);                                          /* THE BREACH: the east wall blown out at the floor */
    ent('sign', X + 10, B - 1, { text: 'THE STAIR IS GONE: OUT THROUGH THE BREACH AND UP THE OUTER FACE.' });
    for (const [t, x] of [['armour', X + 30], ['apprentice', X + 44]]) foe(t, x, B - 1, { face: -1 });
  }
  // ---- THE OUTER FACE, and THE BEND: IT GOES OVER. Planks up the wall in the storm; then the wall's courses at 1:1, then 1:2, then flat. ----
  const outer = { planks: [], front: 'act3' };
  { const [fx0, fx1] = BEND.face, foot = F[7].bot;
    rect(fx0, fx1, RUN.floor, foot - 1, T.AIR);                                             /* the open air up the face */
    rect(fx0, fx1, foot, foot, T.SOLID);                                                     /* its foot: the ledge outside the breach */
    let k = 0; for (let row = foot - 3; row >= BEND.steep.row0 + 3; row -= 3, k++) { const x0 = k % 2 ? fx0 : fx0 + 3; ledge(x0, 3, row, T.PLANK); outer.planks.push([x0, 3, row]); }
    { const p = outer.planks[3]; crumble(p[0], p[1], p[2], 'snap', { kind: 'crown' }); }   /* one plank of the face is cracked and goes on a SNAP count */
    /* THE BEND. A slope sits on rock: everything under the slope line is the tower's wall, lying down */
    const S = BEND.steep, G = BEND.gentle;
    for (let i = 0; i < S.n; i++) { const x = S.x0 + i, r = S.row0 - i; rect(x, x, RUN.floor, r - 1, T.AIR); set(x, r, SLOPE.R1); }
    for (let j = 0; j < G.n; j++) { const x = G.x0 + 2 * j, r = G.row0 - j; rect(x, x + 1, RUN.floor, r - 1, T.AIR); set(x, r, SLOPE.R2A); set(x + 1, r, SLOPE.R2B); }
    ent('sign', fx0, foot - 1, { text: 'THE OUTER FACE. CLIMB. THE TOWER IS GOING OVER UNDER YOU.' });
    for (const [t, j] of [['apprentice', 2], ['armour', 5]]) { const [x0, len, row] = outer.planks[j]; foe(t, x0 + (len >> 1), row - 1, { face: 1 }); }
    /* IT GOES OVER (the most important new beat, plan sec 2): at the bend, told 1.5 s - the groan, the horizon swinging, the roll +6 easing to 0 - and the
       poison hands from the shaft (axis y, its safe line on the bend) to the run (axis x, its start line there): no gap */
    pieces.push({ id: 'over', kind: 'over', act: 4, zone: [S.x0, G.x0 + 2 * G.n, RUN.floor - 2, S.row0], tell: 1.5, say: FT5_LINES.over, shake: 6, kick: 6 });
  }
  // ================= THE FALL (~25-35 s): the outer wall lying down, run east along it to the crown =================
  const run = { x0: RUN.x0, x1: RUN.x1, row: RUN.floor - 1, windows: [], buttresses: [], chains: [] };
  { const fl = RUN.floor;
    for (const x0 of [140, 158, 194]) { rect(x0, x0 + 2, fl, fl + 1, T.AIR); run.windows.push([x0, x0 + 2]); }            /* windows: pits in the wall (out of them with a jump) */
    for (const x0 of [150, 176, 202]) { rect(x0, x0 + 1, fl - 2, fl - 1, T.SOLID); run.buttresses.push([x0, x0 + 1]); }  /* buttresses: hurdles */
    /* SNAP chunks over the wall's hollow: run, don't stop - each one under weight starts the next 0.4 s later */
    for (const [cx0, id] of [[164, 'run1'], [182, 'run2']]) { rect(cx0, cx0 + 5, fl + 1, fl + 2, T.AIR);
      for (let k = 0; k < 3; k++) crumble(cx0 + 2 * k, 2, fl, 'snap', { chain: id, seq: k }); run.chains.push([cx0, cx0 + 5]); }
    /* THE HIGH ROAD: the wall's broken parapet over the run, off the buttress tops - a second height, past the first SNAP chain (slower: a hop up and down) */
    for (const [x0, len] of [[151, 8], [161, 8], [171, 6], [196, 8]]) { ledge(x0, len, fl - 5); run.high = (run.high || []).concat([[x0, len, fl - 5]]); coins([x0 + (len >> 1), fl - 6]); }
    /* ONE SLAB HOP: a loose slab of the wall lies over the last window - weight on it and it tears free (told 0.8 s) and slides east and down: hop off it */
    moversExtra.push({ kind: 'ft5slab', ft5: 'slab', sx: 194 * TS, sy: fl * TS, x: 194 * TS, y: fl * TS, w: 48, h: 8, dir: 1, st: 'wait', t: 0 });
    ent('sign', RUN.x0 + 1, fl - 1, { text: 'THE TOWER IS LYING DOWN. RUN ITS WALL - THE WINDOWS ARE PITS.' });
    for (let x = 145; x <= 200; x += 11) coins([x, fl - 3]);
    /* THE CROWN: the fallen tower's crown resting on the first spire - checkpoint 4 (the boss retry spot), and you arrive in the arena running */
    ent('check', A.check.x, A.check.y);
    ent('sign', A.check.x + 3, A.check.y, { text: 'THE CROWN. HE WAITS OVER THE SPIRES, IN HIS POISON.' });
  }

  // ---- EVERY ROPE IS HUNG LAST (FT4's rule I) ----
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  // ---- THE POISON (src/chase.js specs; drawn 'dark', his green-black - the art lane makes it one "his poison" with the arena's sea) ----
  /* a vertical spec: landings bottom to top ({ row, stop? }: stop = the row it waits under until that landing is stood on - a ride is a landing whose stop is
     the row it starts from: the poison never reaches you on it) */
  const pSpec = o => ({ id: o.id, name: 'HIS POISON', say: o.say, axis: 'y', dir: -1, trigger: o.trigger, end: o.end, gap0: o.gap0 ?? 110,
    curve: o.curve, lead: 1.6, accel: 30, rubber: { ...POISON.rubber }, contact: 'hurt', dmg: POISON.dmg, hold: POISON.hold, band: true,
    caps: o.landings.map(l => ({ reach: l.row * TS - 4, stop: ((l.stop ?? l.row) + 1) * TS + 6 })), knockTo: o.knockTo,
    autoscroll: true, edge: 24, show: 28, showKeep: 0.55, glow: 220, look: 'dark', zone: o.zone, drawZone: o.zone, checkpoint: o.checkpoint || null,
    ft4: true, ft5: true, act: o.act });   /* ft4: main.js's 'spare' (it hurts, never kills) and a pillar's plug hold it; ft5: one seat at a time (co-op) */
  const T2 = [...F[2].tiers, ...F[3].tiers, ...F[4].tiers].sort((a, b) => b[2] - a[2]), labTop = F[4].tiers[F[4].tiers.length - 1];
  const sw = F[3].swings;
  /* Act II's landings in climbing order; the two pendulum rides are one landing each (its stop is the boarding row) */
  const land2 = T2.filter(t => t[2] >= labTop[2]).map(t => ({ row: t[2] }));
  for (const s of sw) { const l = land2.find(q => q.row === s.row - 3); if (l) l.stop = s.yb + 1; }   /* the landing past a ride: the poison waits under the ride's lowest point until it is stood on */
  const dist = rows => rows * TS;
  const act2 = pSpec({ id: 'act2', act: 2, say: FT5_LINES.rise2, trigger: (F[2].bot - 4) * TS, end: labTop[2] * TS - 4,
    landings: dedupe(land2), knockTo: T2.map(t => t.slice(0, 3)),
    curve: [[0, POISON.act2[0]], [dist((F[2].bot - 4) - F[3].bot), POISON.act2[1], FT5_LINES.surge2a], [dist((F[2].bot - 4) - F[4].bot), POISON.act2[2], FT5_LINES.surge2b]],
    zone: [F[2].X0 * TS, (F[4].X1 + 1) * TS, F[4].top * TS, (F[2].bot + 1) * TS], checkpoint: [F[1].tiers[F[1].tiers.length - 1][0] + 1, F[1].tiers[F[1].tiers.length - 1][2] - 1] });
  /* Act III: from the loft's upper tiers (after the Sexton and the bell) up the treasury, the breach and the face to THE BEND */
  const T3 = [...F[5].tiers, [F[6].X0, 48, F[6].bot], ...F[6].tiers, [F[7].X0, 40, F[7].bot], ...outer.planks].sort((a, b) => b[2] - a[2]);
  const bendRow = BEND.steep.row0 - BEND.steep.n + 1;   /* the 1:1's top: the safe line */
  const act3 = pSpec({ id: 'act3', act: 3, say: FT5_LINES.rise3, trigger: (F[5].frame - 2) * TS, end: bendRow * TS - 4,
    landings: dedupe(T3.map(t => ({ row: t[2] })).concat([{ row: BEND.steep.row0 + 1 }])), knockTo: T3.map(t => t.slice(0, 3)),
    curve: [[0, POISON.act3[0]], [dist((F[5].frame - 2) - F[6].bot + 6), POISON.act3[1], FT5_LINES.surge3a], [dist((F[5].frame - 2) - F[7].bot), POISON.act3[2], FT5_LINES.surge3b]],
    zone: [F[5].X0 * TS, (BEND.gentle.x0 + 1) * TS, (RUN.floor - 4) * TS, (F[5].frame + 2) * TS] });
  /* THE RUN: axis x, the wall behind you going under. Its start line is where the shaft's safe line is (the bend), so one hands to the other with no gap */
  const actRun = { id: 'run', name: 'HIS POISON', say: FT5_LINES.riseRun, axis: 'x', dir: 1, trigger: BEND.gentle.x0 * TS, end: RUN.safe * TS, gap0: 130,
    curve: [[0, POISON.run[0]], [dist(178 - BEND.gentle.x0), POISON.run[1], FT5_LINES.surgeRun]], lead: 1.6, accel: 60, rubber: { ...POISON.rubber },
    contact: 'hurt', dmg: POISON.dmg, hold: POISON.hold, band: true, autoscroll: true, edge: 24, glow: 220, look: 'dark',
    zone: [(BEND.steep.x0 - 2) * TS, (A.x0) * TS, (RUN.floor - 24) * TS, (RUN.floor + 4) * TS], ft4: true, ft5: true, act: 4 };
  const chases = [act2, act3, actRun];

  // ---- THE ARENA (lane ft5b fills src/spire-field.js; until it lands, a placeholder field: six spire tops and a gate on the last, so the greybox ends) ----
  rect(A.x0, A.x1, A.y0, A.y1, T.AIR);                                       /* the box is open sky down to its sea's floor: ft5b builds in it */
  const field = buildSpireField(L, A, { T, rect, ledge, ent, set });
  if (!field) {   /* THE PLACEHOLDER (no fight, no sea): a floor at the run's height, five low "spires" to hop, and a gate - the greybox walks end to end */
    rect(A.x0, A.x1, RUN.floor, A.y1, T.SOLID);
    for (const [x0, len, row] of [[236, 6, 61], [245, 6, 60], [255, 6, 61], [266, 6, 60], [277, 6, 61]]) rect(x0, x0 + len - 1, row, RUN.floor - 1, T.SOLID);
    ent('gate', A.x1 - 4, RUN.floor - 1); ent('sign', A.x0 + 2, RUN.floor - 1, { text: 'THE SPIRE FIELD (GREYBOX): HIS FIGHT IS BUILT HERE BY LANE FT5B.' });
  }

  // ---- THE ACTS (plan sec 1: story angle = the horizon the art lane draws; roll = the frame's lean in degrees, main.js seaTilt) ----
  const acts = [
    { n: 1, say: FT5_LINES.act1, story: 5, roll: 1.5, box: [F[0].X0, F[1].X1, F[1].top - 2, F[0].bot] },
    { n: 2, say: FT5_LINES.act2, story: 15, roll: 3.5, box: [F[2].X0, F[4].X1, F[4].top - 2, F[2].bot - 1] },
    { n: 3, say: FT5_LINES.act3, story: 30, roll: 5.5, box: [F[5].X0, BEND.steep.x0 - 1, RUN.floor - 20, F[5].bot - 1] },
    { n: 4, say: FT5_LINES.run, story: 90, roll: 0, box: [BEND.steep.x0, A.x0 - 1, RUN.floor - 30, BEND.steep.row0 + 2] },
  ];
  /* HIS HARRYING (the throw-back stun, plan sec 2): where he hovers outside the breaches in Act II-III and over the run - data for the harry wiring (owed) */
  const harry = [F[2], F[3], F[4], F[6]].map(f => ({ floor: f.name, x: f.X1 + 3, y: f.top + 8 })).concat([{ floor: 'THE FALL', x: 170, y: RUN.floor - 10 }]);

  const skins = [[0, W - 1, 0, H - 1, 'fallen'], ...((field && field.skins) || [])];   /* (claude/ft5b: the sand rows over the field are dune) */
  const START = { x: F[0].X0 + 2, y: F[0].bot - 1 };
  for (const s of supports) { s.x ??= s.col * TS + 8; s.y ??= (s.row + 1) * TS; }
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra, interiors, gusts: [], flips, glyphBridges, crumbles, rigBands, scree: [],
    music: 'fallingtower', night: true, nightA: 0.12, edgeLit: true, duskStart: 99999, duskLen: 1, checkRun: 200,
    ftSupports: supports, reachSpans: supports.flatMap(s => s.kind === 'bridge' || s.kind === 'ramp' ? s.spans : []),
    towerAscent: true, fallingTower: true, stackedFloors: true, skyRow: RUN.floor,   /* towerAscent: main.js runs the failing stone, the pillars and the reset for it (no floors, no spiral, no chase rooms: each guarded) */
    chases, bellDeck: bell, mini: F[5].mini,
    tall: { top: RUN.floor * TS, bottom: F[0].bot * TS, col: '16,20,32', deepest: 0.16 },
    mage: { shelves: [], skins, hedges: [], chains: [], hung: [], outside: 0, dais: [30, 40] },
    palette: { sky: 'mage', far: 'mage', mid: 'mage', near: 'mage', noNear: true, dress: 'village', haze: 'rgba(150,140,118,0.08)',
      grass: '#46506a', grassL: '#56627e', grassD: '#343c52', dirt: '#4a4652', dirtL: '#645e6c', dirtD: '#2e2a36', canopy: ['#181428', '#221c36', '#2c2446', '#3a3058'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'hall' }],
    noCoin: [[0, W - 1, 0, RUN.floor - 3], [A.x0, A.x1, A.y0, A.y1]],
    calm: [[A.x0 - 1, A.x1 + 1, A.y0, A.y1], [RUN.x0, RUN.x1, RUN.floor - 6, RUN.floor + 3], ...((field && field.calm) || [])],   /* the sprinkler leaves the run and the arena alone (the run: pure platforming, plan sec 2) */
    bonesSpots: bones,
    ft5Arena: { ...A, crownSpot: { ...A.crownSpot }, check: { ...A.check } },
    ft5: { acts, pieces, braced, breathers, outer, run, harry, bend: { ...BEND }, floors: F.map(f => ({ name: f.name, kind: f.kind, X0: f.X0, X1: f.X1, top: f.top, bot: f.bot, act: f.act, slopes: f.slopes || 0, tiers: f.tiers.map(t => t.slice()) })),
      roll0: 2.5, field: !!field },   /* roll0: the Folly's lurch carries over (plan sec 4): the first frame is already tipped, settling to Act I's 1.5 */
    ...((field && field.level) || {}),   /* (claude/ft5b) THE SPIRE FIELD: his arena (both phases, one box), the sanctum's door to the sand, the field's runtime data (src/spire-field.js) */
  };
}
/* landings at the same row are one landing (the first wins: its stop is kept) */
function dedupe(list) { const seen = new Set(), out = []; for (const l of list) { if (seen.has(l.row)) { const o = out.find(q => q.row === l.row); if (l.stop !== undefined && o.stop === undefined) o.stop = l.stop; continue; } seen.add(l.row); out.push({ ...l }); } return out; }
