// ore-road.js — THE ORE ROAD (built 2026-09-23; REWORKED 2026-09-25 against docs/briefs/ore-road-rework.md).
//
// WHAT WAS WRONG, IN NUMBERS, AND WHY THE REWORK IS SHAPED THE WAY IT IS. The shipped level scored INDEX 59 against
// neighbours at 92-113: 27 foes over 470 columns, hazard ZERO on a level whose whole premise is a gorge, and an
// 88-column stretch with no checkpoint in it - the ride Daniel called boring, expressed as a number. Its nine foe
// kinds brought the game nothing it had not already fought (tools/one-new-foe.mjs: the miner is NOT new, he has been
// in the mines since the Undercrown; the only creature this level ever added was its own boss, and a boss does not
// count). So the rework is not a dressing pass. It is length, density, a floor to fall to, and three creatures of
// the cableway's own.
//
// THE SENTENCE (F8): *A LOADED BUCKET RIDES LOW AND AN EMPTIED ONE RIDES HIGH, AND WHAT YOU TIP FALLS ON WHAT IS
// UNDER IT.* Said three ways (C4): the heap of ore you can see in the skip; the skip sitting up its hanger once it
// is empty; and the ore itself landing on the crew below when you tip it.
//
// THE RIDE IS A VERB NOW, WHICH IS THE WHOLE POINT OF THE REWORK (brief section 3, all four parts, ruled in by Daniel):
//   THE ORE    hold DOWN on a loaded skip and it tips. The bucket rides OR.BUCKET.lift px higher for the rest of its
//              run, and the ore falls (main.js pushes it into `rocks`, which already hurt whatever is beneath).
//   THE BRAKE  hold BLOCK on a bucket and you haul on the hanger: it stops. Moving is progress; stopped is where you
//              can fight. Raising the shield costs you the thing you were doing, which is what makes a harpy over the
//              gorge a real problem instead of a decoration.
//   THE MINER  he throws his pick and is helpless until he fetches it; a pick that lands in YOUR skip is a weapon,
//              and a disarmed miner on a bucket is a passenger (main.js: minerBare, and the pick in the bucket).
//   THE CUT    a severed line drops everything on it. The Sheargob uses it on you; you use it on his crew.
//
// ONE VERB A PLACE, SEVEN SECTIONS OF 60-100 (F1), AND IT ALTERNATES (F4) - fight, cross, fight, ride, climb, cross, fight:
//   c   0- 67  THE ORE YARD       ON FOOT.   The crusher: the first hazard, and the first thing you can tip ore into
//   c  68-135  THE FIRST SPAN     RIDE.      Two pylons to rest on, tipplers over the lane, the down line coming back
//   c 136-203  THE SORTING TOWER  CLIMB.     Three decks, and THE SORTING FLOOR is the ambush room (Q)
//   c 204-271  THE ORE CHUTE      RIDE DOWN. Fast, steered rather than waited out, over the crusher run
//   c 272-339  THE COLLAPSED SPAN ON FOOT.   The cable is snapped; climb the fallen towers over their own splinters
//   c 340-407  THE STEEP LINE     HOP.       Rusted buckets, two pillars, and the Sheargobs cutting hangers
//   c 408-475  THE WINCH HOUSE    ON FOOT.   His crew, the gated elite, the last checkpoint
//   c 476-523  THE DRUM HOUSE     THE WINCHMASTER (src/winchmaster.js): three housings on two lines, and he goes round them
//
// THE CABLEWAY is pure and lives here: a LINE is a polyline the buckets' tops follow, a speed, and a spacing. Every
// bucket on a line is the same clock offset by its spacing, so they arrive like a clock and not like a spawner. The
// last stretch of each loop is the return, out of sight inside the station houses. main.js turns each bucket into a
// mover (the rider is carried by the engine's own mover code) and calls stepCableway / placeBucket every frame.
export const OR = {
  W: 524, H: 60,
  YARD: 36,                                                      // the yard's floor, and the first span's line
  PYLON_A: [96, 104], PYLON_B: [120, 128],                       // the two rests out on the first span
  TOWER: [36, 28, 21], TOWER_X: [136, 203],                      // the sorting tower's three decks
  TIPPLE: [228, 240], TIPPLE_ROW: 27,                            // the tipple house, half way down the chute
  FOOT: [262, 280], FOOT_ROW: 34,                                // the chute's foot, and the head of the wreck
  WRECK: [283, 324], WRECK_BED: 44,                              // the splintered bed of the collapsed span
  PILLAR: [29, 20], PILLAR_X: [340, 352],                        // the brakeman's pillar: rock, and the loft on it
  PILLAR_B: 16, PILLAR_BX: [376, 384],                           // the second pillar, out in the gorge
  WINCH: 12,
  /* THE DRUM HOUSE (brief section 6, approved as written). THREE HOUSINGS ON TWO LINES, and no jump reaches any of them: the
     housing is always four rows over its own ledge, and eight tiles of air from any footing at its height. `top` is the row he
     stands in, `ledge`/`ledgeTop` where a jam throws him, `line`/`at` which end of which line his drum is on. The LOW line runs
     from the entrance deck into the Great Drum; the HIGH line runs between the Head Frame and the Tail Wheel and he drives it
     toward whichever of them he is on. Ropes out of the spoil go up to the deck and to both high ledges - the ledges are where
     you board the high line, and where a jam puts him. Each rope's top is level with the surface it serves (the crusher's
     convention), so nobody stands on a rope-end a row higher than the ledge. FOUR ROWS IS ENOUGH ONLY BECAUSE A DRUM LINE'S SKIPS
     CANNOT BE TIPPED: an emptied skip rides OR.BUCKET.lift higher, and 18 px under a 64 px housing is a 46 px jump. `housing`
     is the Great Drum's row: main.js seats him there before the fight */
  ARENA: { x0: 476, x1: 519, deck: 12, housing: 8, spoil: 22, highRow: 8, ledge: [507, 509], house: [510, 518],
    housings: [
      { id: 'A', name: 'THE GREAT DRUM', x0: 510, x1: 518, top: 8, home: 513, ledge: [507, 509], ledgeTop: 12, line: 'low', at: 'end', ladder: [509, 9, 12] },
      { id: 'B', name: 'THE HEAD FRAME', x0: 476, x1: 481, top: 4, home: 478.5, ledge: [483, 484], ledgeTop: 8, line: 'high', at: 'start', ladder: [482, 5, 18] },
      { id: 'C', name: 'THE TAIL WHEEL', x0: 502, x1: 508, top: 4, home: 505, ledge: [499, 501], ledgeTop: 8, line: 'high', at: 'end', ladder: [501, 5, 8] }],
    /* ROUND THREE (Daniel, 2026-09-24: "the ore road is great now", four notes): THE HOUSINGS ARE BIGGER - the Head Frame six tiles
       (it was five), the Tail Wheel seven (it was four), the Great Drum nine - room to move and dodge on top. THE ROOM'S FLOOR IS
       THE PIT, like every span's: the entrance deck runs to 481, the Head Frame's ladder climbs from the pit's recovery ledge past
       the deck to the top, the Great Drum's and the Tail Wheel's stand on their ledges, and the ledges are reached by riding -
       the low line from the deck to the Great Drum, the high line from the Head Frame's ledge to the Tail Wheel. The low line
       runs back to the deck whenever he is not on (or bound for) the Great Drum, so no ledge is a dead end */
    /* ROUND TWO (Daniel's playtest): every housing has a LADDER straight up its face from the spoil (`ladder` [x, top, bottom]: its
       top level with the housing's surface, its foot on the spoil) - he is a man you can climb up to and fight. It runs up BESIDE
       the drum's mouth, not through it: a first version stood the ladder on the mouth's ledge, and the lab could never climb it
       (the bar guards the mouth, the sent bucket runs along it and the hook reached the rope up to it - a gauntlet, not a climb).
       The Head Frame's is the entrance deck's rope carried on up. The ledges are two tiles now: the ladder took the third */
    ropes: [] },
  PLACES: { yard: [0, 67], span1: [68, 135], tower: [136, 203], chute: [204, 271], collapse: [272, 339], steep: [340, 407], winch: [408, 475], drum: [476, 523] },
  /* THE BUCKET IS 46 PX WIDE, NOT 24. Daniel found this himself and it is the change everything else stands on: the
     knight's box is 10-14 px, so a 24 px skip had no room to swing or to dodge on and NO FIGHT COULD HAPPEN ON ONE.
     46 is about three tiles - two bodies wide - and it is what makes the bats, the harpies and the Gaffer's hook into
     a fight instead of a nuisance you cannot answer. `lift` is how much higher an EMPTIED skip rides. */
  BUCKET: { w: 46, h: 6, hang: 30, lift: 18 },
  CRACK: 0.9,                                                    // how long a rusted bucket holds you
  ROCK_TELL: 1.0,                                                // how long every falling rock is told before it falls
  /* THE PIT under every span: its spike row, the deck the span starts from, the recovery ledge [x0, x1, standing row] on that
     wall and the ladder [x, top row, bottom row] from the ledge up to that deck (the ladder's top is level with the deck) */
  PITS: [
    { id: 'span1', x0: 68, x1: 135, floor: 57, start: [67, 36], ledge: [68, 70, 50], ladder: [68, 37, 50] },
    { id: 'chute', x0: 204, x1: 261, floor: 57, start: [203, 21], ledge: [204, 206, 50], ladder: [204, 22, 50] },
    { id: 'wreck', bed: true, x0: 281, x1: 324, floor: 44, start: [280, 34], ledge: [281, 283, 39], ladder: [281, 35, 39] },
    { id: 'steep', x0: 353, x1: 407, floor: 57, start: [352, 20], ledge: [353, 355, 50], ladder: [353, 21, 50] },
    /* and THE DRUM HOUSE's (round three): the recovery ledge under the Head Frame, and its ladder - the Head Frame's own - up past the deck */
    { id: 'drum', x0: 482, x1: 509, floor: 23, start: [481, 12], ledge: [482, 484, 18], ladder: [482, 13, 18] }],
  PIT_BITE: 0.2, PIT_LIFT: 150, PIT_DRAFT: 230, TURBINE_EVERY: 5,
  DARK: 0.34,                                                    // how black the cavern is away from the lamps
  CEIL_GAP: 6,                                                   // how many rows the cavern's ceiling keeps above anything anyone uses
  WORK_FAR: 240, WORK_CHIPS: 6, WORK_CHIP: 0.4, WORK_WALK: 18,                   // a miner works a seam while no hero is within 240 px: six blows, then he carries it
  LAMP_EVERY: 14, VEIN_EVERY: 22, VEIN_COINS: 3, VEIN_HITS: 3,     // a pit lamp every ~14 columns; a vein every ~22, three blows, three coins
  DUMP: 0.3,                                                     // how long DOWN must be held before the skip tips
  BRAKE: 0.5,                                                    // how long the brake takes to bring a bucket to a stand
};
const TS = 16;
const surf = row => (row + 1) * TS;                              // a standing row's floor, in pixels
/* a cable between two supports, sagging `sag` rows at its middle (a parabola, which is what a loaded cable looks like at this size) */
function sagPts(x0, r0, x1, r1, sag, n = 10) { const out = [];
  for (let k = 0; k <= n; k++) { const t = k / n; out.push([(x0 + (x1 - x0) * t) * TS, surf(r0 + (r1 - r0) * t) + sag * TS * 4 * t * (1 - t)]); } return out; }
const join = (...parts) => parts.reduce((a, p) => a.concat(a.length ? p.slice(1) : p), []);
/* THE LINES. dir 1 runs the buckets along pts from first to last; ret is the length of the hidden return, in pixels. EVERY LINE ENDS
   THREE-QUARTERS OF A TILE INSIDE ITS DECK: a line that ended on the deck's edge let the bucket go while its rider still straddled
   the lip, and at speed he went down between them (tools/ore-ride.mjs found it). Widening the skip did not move its CENTRE, which
   is where the rider stands, so the same three-quarters still holds - but it is checked after every geometry change anyway.
   AND THE HOLE BETWEEN TWO BUCKETS IS gap - OR.BUCKET.w: a 46 px skip on the old 88 px spacing leaves 42 px of hole, which is a
   step and not a jump, so every spacing here was reset against the 59 px running jump instead of being left where it was. */
export function cableLines() {
  const A = OR.ARENA, [pa0, pa1] = OR.PYLON_A, [pb0, pb1] = OR.PYLON_B;
  return [
    /* THE FIRST SPAN: one line, two rests. It runs flat across each pylon's deck so the rims come level with it - step off, step on */
    /* AND EVERY LINE RUNS FLAT THROUGH ITS STATION LIPS. A sag that meets a rock deck comes up to it from BELOW, and a
       rider still under the deck's surface is carried into the cliff face: this line's last stretch put him 14 px into
       the sorting tower's rock and stood him at its foot (tools/ore-road.mjs now checks the whole line for this). */
    { id: 'first', speed: 62, gap: 100, ret: 220, pts: join(
      sagPts(67.5, OR.YARD, 69, OR.YARD, 0, 1), sagPts(69, OR.YARD, pa0, OR.YARD, 3), sagPts(pa0, OR.YARD, pa1, OR.YARD, 0, 1),
      sagPts(pa1, OR.YARD, pb0, OR.YARD, 2), sagPts(pb0, OR.YARD, pb1, OR.YARD, 0, 1),
      sagPts(pb1, OR.YARD, 135, OR.YARD, 2), sagPts(135, OR.YARD, 136.75, OR.YARD, 0, 1)) },
    /* THE ORE CHUTE: the fast one. Down thirteen rows from the tower's top deck to the foot, flat over the tipple house half way,
       and at 96 px/s it is steered rather than waited out - which is the answer to "riding on lifts is boring" */
    { id: 'chute', speed: 96, gap: 100, ret: 240, pts: join(
      sagPts(203.5, OR.TOWER[2], OR.TIPPLE[0], OR.TIPPLE_ROW, 1), sagPts(OR.TIPPLE[0], OR.TIPPLE_ROW, OR.TIPPLE[1], OR.TIPPLE_ROW, 0, 1),
      sagPts(OR.TIPPLE[1], OR.TIPPLE_ROW, 268.75, OR.FOOT_ROW, 1)) },
    /* THE DOWN LINE crosses the chute on its way back up to the tower's middle deck, and it comes back LOADED WITH GOBLINS */
    { id: 'down', speed: 58, gap: 128, ret: 220, riders: true, pts: join(sagPts(268.5, OR.FOOT_ROW, OR.FOOT[0] - 0.5, OR.FOOT_ROW, 0, 1), sagPts(OR.FOOT[0] - 0.5, OR.FOOT_ROW, 203.25, OR.TOWER[1], 2)) },
    /* THE STEEP LINE: up out of the gorge to the winch house over a second pillar, and every third bucket is rust that will not hold you */
    { id: 'steep', speed: 58, gap: 96, ret: 200, cracked: 3, pts: join(
      sagPts(352.5, OR.PILLAR[1], 354, OR.PILLAR[1], 0, 1), sagPts(354, OR.PILLAR[1], OR.PILLAR_BX[0], OR.PILLAR_B, 2), sagPts(OR.PILLAR_BX[0], OR.PILLAR_B, OR.PILLAR_BX[1], OR.PILLAR_B, 0, 1),
      sagPts(OR.PILLAR_BX[1], OR.PILLAR_B, 407, OR.WINCH, 2), sagPts(407, OR.WINCH, 408.75, OR.WINCH, 0, 1)) },
    /* THE DRUM LINES: the arena's two. The LOW line runs from the entrance deck into the Great Drum; the HIGH line runs between
       the Head Frame's ledge and the Tail Wheel's, and he drives it into whichever housing he is on. Both END THREE-QUARTERS OF A
       TILE INSIDE THEIR LEDGES AT BOTH ENDS, because he REVERSES them: a rider is carried back out to the far end as well as in */
    { id: 'low', speed: 60, gap: 90, ret: 160, drum: true, pts: [[481.25 * TS, surf(A.deck)], [(A.ledge[0] + 0.75) * TS, surf(A.deck)]] },
    { id: 'high', speed: 52, gap: 90, ret: 160, drum: true, dir0: -1, pts: [[(A.housings[1].ledge[1] + 0.25) * TS, surf(A.highRow)], [(A.housings[2].ledge[0] + 0.75) * TS, surf(A.highRow)]] },
  ];
}
/* the state the level carries (L.cable): each line with its measured length and its clock */
export function makeCableway(lines) {
  return { lines: lines.map(l => { const seg = []; let len = 0;
    for (let i = 1; i < l.pts.length; i++) { const d = Math.hypot(l.pts[i][0] - l.pts[i - 1][0], l.pts[i][1] - l.pts[i - 1][1]); seg.push(d); len += d; }
    const n = Math.max(2, Math.ceil((len + l.ret) / l.gap)); return { ...l, seg, len, n, total: n * l.gap, t: 0, dir: l.dir0 || 1, mul: 1, jam: 0 }; }) };
}
/* where along the line a distance s puts a bucket's top */
export function pointAt(line, s) {
  let d = s; for (let i = 0; i < line.seg.length; i++) { if (d <= line.seg[i] || i === line.seg.length - 1) { const k = line.seg[i] ? Math.min(1, d / line.seg[i]) : 0, a = line.pts[i], b = line.pts[i + 1];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; } d -= line.seg[i]; }
  return line.pts[line.pts.length - 1];
}
/* the line's height at a pixel x (for the Winchmaster's runaway bucket and the draw) */
export function lineYAt(line, x) { const p = line.pts; const lo = Math.min(p[0][0], p[p.length - 1][0]), hi = Math.max(p[0][0], p[p.length - 1][0]); if (x < lo || x > hi) return null;
  for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i]; if ((x - a[0]) * (x - b[0]) <= 0 && a[0] !== b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return p[0][1]; }
const mod = (a, n) => ((a % n) + n) % n;
/* THE CLOCK. A jammed line stands still; a reversed one runs back; mul is how hard the drum is driven */
export function stepCableway(C, dt) { for (const l of C.lines) { if (l.jam > 0) { l.jam -= dt; continue; } l.t = mod(l.t + dt * l.speed * l.dir * l.mul * (1 - (l.hold || 0)), l.total); } }
/* bucket i of a line: its distance along the loop, and whether it is out on the cable (vis) or in the return */
export function bucketS(line, i) { return mod(line.t + i * line.gap, line.total); }
export function bucketAt(line, i) { const s = bucketS(line, i); if (s >= line.len) return { s, vis: false, x: 0, y: 0 }; const [x, y] = pointAt(line, s); return { s, vis: true, x, y }; }
/* HOW FAR A BUCKET IS FROM THE DRUM IT IS RUNNING INTO: a drum line runs into its END while dir > 0 and into its START while
   dir < 0. null when it is in the return, or on a line that is not a drum line */
export const drumDist = (line, s) => !line.drum || s >= line.len ? null : line.dir > 0 ? line.len - s : s;
/* THE BRAKE, as arithmetic, so a tool can check it with no page: how far ON the shoe is this frame. A braked bucket does not
   stop dead - it drags to a stand over OR.BRAKE seconds and lets go just as slowly - and NOTHING ELSE ON THE LINE STOPS WITH
   IT, which is what makes braking a decision instead of a pause button: the one behind you keeps coming. */
export const brakeStep = (was, held, dt) => Math.max(0, Math.min(1, (was || 0) + (held ? 1 : -1) * dt / OR.BRAKE));
/* and how high an emptied skip is riding, eased over the same half second so you can watch the heap go and the skip come up */
export const liftStep = (was, ore, dt) => Math.max(0, Math.min(OR.BUCKET.lift, (was || 0) + (ore ? -1 : 1) * OR.BUCKET.lift * dt / OR.BRAKE));

// ============================================================================================ THE LEVEL
export function buildOreRoad({ painter, T }) {
  const { W, H, YARD, TOWER, TOWER_X, PYLON_A, PYLON_B, TIPPLE, TIPPLE_ROW, FOOT, FOOT_ROW, WRECK, WRECK_BED, PILLAR, PILLAR_X, PILLAR_B, PILLAR_BX, WINCH } = OR, A = OR.ARENA;
  const L = painter(W, H), { set, block, plat, spikes, ent, coins } = L;
  const ropes = [], encounters = [];
  const rope = (x, y0, y1) => ropes.push([x, y0, y1]);
  const meet = (name, x0, x1, foes) => { encounters.push({ name, x0, x1, n: foes.length }); for (const [t, x, row, o] of foes) ent(t, x, row, Object.assign({ face: -1, enc: name }, o || {})); };

  // ---- THE ORE YARD (c 0-67) — on foot, and the level teaches both its verbs before it asks for either ----
  block(0, 67, YARD + 1, H - 1);
  /* THE CRUSHER: the yard's jaws, three rows down, with the broken ore still in them. It is the first thing in the level that
     hurts, it is where a missed pick goes, and it is the first thing you can tip a skip of ore into. TWO ROLLERS stand out of
     the teeth so a fall costs a climb rather than a life, and the rope out of it stands at its west lip where you can see it
     from the bottom (C5). */
  for (let y = YARD + 1; y <= YARD + 3; y++) for (let x = 22; x <= 34; x++) set(x, y, T.AIR);
  set(22, YARD + 3, T.SOLID); set(34, YARD + 3, T.SOLID); spikes(23, 33, YARD + 3);   /* a lip at each end to land on, the teeth between them */
  plat(24, YARD, 2); plat(28, YARD - 1, 2); plat(32, YARD, 2);                  // the feed chutes: the way across, over the teeth
  rope(21, YARD + 1, YARD + 3); rope(35, YARD + 1, YARD + 3);                   // and a way out at both ends, in plain sight from the bottom of it
  block(8, 12, YARD - 1, YARD);                                                 // the spoil heap, a step up
  block(51, 67, YARD - 7, YARD - 7); block(52, 54, YARD - 6, YARD - 1);         // the loading house: its roof, and its west wall, with the road through under it
  plat(55, YARD - 3, 12);                                                       // its loft, where the loaders work
  rope(56, YARD - 4, YARD); rope(51, YARD - 8, YARD);                           // up to the loft, and on up through a hole in the roof to the tipping frame
  ent('sign', 4, YARD, { text: 'THE ORE ROAD. THE BUCKETS ARE THE ONLY FLOOR OVER THE GORGE, AND THEY COME ON A CLOCK.' });
  ent('sign', 17, YARD, { text: 'HOLD DOWN ON A LOADED SKIP AND IT TIPS. EMPTY IT RIDES HIGH, LOADED IT RIDES LOW.' });
  ent('sign', 49, YARD, { text: 'HOLD THE SHIELD ON A BUCKET AND THE LINE STOPS. STOPPED IS WHERE YOU CAN FIGHT.' });
  ent('check', 5, YARD); ent('check', 37, YARD); ent('check', 64, YARD);   /* 37, not 34: column 34 is the crusher's east lip, and a checkpoint over the pit respawns you onto its teeth (audit FLOAT) */
  meet('THE PICK LINE', 14, 40, [['miner', 16, YARD], ['rockgoblin', 10, YARD - 2], ['sprig', 40, YARD]]);
  meet('THE LOADING HOUSE', 52, 67, [['miner', 58, YARD], ['rockgoblin', 66, YARD], ['sapper', 56, YARD]]);
  ent('tippler', 60, YARD - 8, { face: -1 });                                   /* THE FIRST TIPPLER, over a floor and not yet over a drop: the level shows you the stream where you can walk out of it */
  coins([24, YARD - 1], [28, YARD - 2], [32, YARD - 1], [9, YARD - 2], [11, YARD - 2], [58, YARD - 4], [62, YARD - 8]);

  // ---- THE FIRST SPAN (c 68-135) — the ride, broken into three hops by two pylons ----
  for (const [p0, p1] of [PYLON_A, PYLON_B]) plat(p0, YARD + 1, p1 - p0 + 1);
  ent('check', 100, YARD); ent('check', 124, YARD);
  meet('THE PYLON LOOKOUTS', PYLON_A[0], PYLON_A[1], [['javelin', 97, YARD], ['sprig', 103, YARD], ['gaffer', 101, YARD]]);
  meet('THE SECOND PYLON', PYLON_B[0], PYLON_B[1], [['javelin', 121, YARD], ['gaffer', 127, YARD], ['miner', 124, YARD]]);
  /* FALLING ROCK OVER THE SPANS (Daniel's idea 1). Out here there is nothing for a goblin to stand on, so the lane is
     kept honest by the crags themselves: three falls on a beat you can learn, and the answer to all three is the BRAKE.
     A tippler needs a floor under his feet AND a floor under his stream, so every one of them is on a structure. */
  ent('rockfall', 79, YARD - 12, { every: 2.7 }); ent('rockfall', 110, YARD - 12, { every: 2.4 }); ent('rockfall', 132, YARD - 12, { every: 3.1 });
  meet('THE GORGE FLIERS', 70, 134, [['bat', 76, YARD - 6], ['harpy', 84, YARD - 8], ['harpy', 116, YARD - 9], ['crow', 130, YARD - 7]]);
  coins([98, YARD - 1], [102, YARD - 1], [122, YARD - 1], [126, YARD - 1]);

  // ---- THE SORTING TOWER (c 136-203) — the climb, and the ambush room on its middle deck ----
  block(TOWER_X[0], TOWER_X[1], TOWER[0] + 1, H - 1);                           // the rock it stands on
  plat(TOWER_X[0], TOWER[1] + 1, TOWER_X[1] - TOWER_X[0] + 1);                  // the middle deck (trestle: one-way)
  plat(TOWER_X[0], TOWER[2] + 1, TOWER_X[1] - TOWER_X[0] + 1);                  // the top deck, where the chute leaves
  rope(139, TOWER[1] + 1, TOWER[0]); rope(196, TOWER[1] + 1, TOWER[0]);
  rope(143, TOWER[2] + 1, TOWER[1]); rope(192, TOWER[2] + 1, TOWER[1]);
  ent('sign', 138, TOWER[0], { text: 'THE SORTING TOWER. THE CHUTE LEAVES FROM THE TOP DECK, AND IT LEAVES FAST.' });
  ent('check', 182, TOWER[1]); ent('check', 200, TOWER[2]);
  meet('THE SORTING YARD', 136, 150, [['miner', 140, TOWER[0]], ['rockgoblin', 146, TOWER[0]], ['goat', 144, TOWER[0]]]);
  meet('THE UPPER DECKS', 184, 202, [['heavy', 190, TOWER[0]], ['miner', 198, TOWER[1]], ['sheargob', 194, TOWER[2]]]);
  ent('tippler', 176, TOWER[2], { face: -1 }); ent('tippler', 186, TOWER[1], { face: -1 });   /* one tips onto the middle deck, one onto the sorting floor under it */
  /* SILVER ONE: a bucket that jammed on a spur cable off the tower's east face, over the drop. A jump out and a jump back */
  ent('mover', 206, TOWER[1] - 2, { len: 2, range: 0, speed: 0 }); ent('silver', 206, TOWER[1] - 3);
  coins([144, TOWER[1]], [148, TOWER[2]], [188, TOWER[2]], [200, TOWER[1]]);

  // ---- THE ORE CHUTE (c 204-271) — down thirteen rows, steered, over the crusher run ----
  /* THE CRUSHER RUN under the chute: what misses the buckets goes down it, and so does anything that comes off one. It is the
     floor the gorge never had, and it is drawn as what it is - broken ore in a steel trough, red-lit from below. */
  /* (the crusher run that stood here is the pit now: one floor under the whole chasm - see THE PIT) */
  plat(TIPPLE[0], TIPPLE_ROW + 1, TIPPLE[1] - TIPPLE[0] + 1);                   // THE TIPPLE HOUSE: the one rest on the chute
  plat(231, TIPPLE_ROW - 3, 8); rope(239, TIPPLE_ROW - 3, TIPPLE_ROW);          // and the tipping stage over it, with the ladder up its EAST end (at 230 it stood in the checkpoint's base)
  ent('check', 229, TIPPLE_ROW);
  meet('THE TIPPLE HOUSE', TIPPLE[0], TIPPLE[1], [['tippler', 235, TIPPLE_ROW - 4], ['sheargob', 238, TIPPLE_ROW], ['miner', 233, TIPPLE_ROW]]);
  ent('rockfall', 216, TIPPLE_ROW - 6, { every: 2.5 }); ent('rockfall', 252, 29, { every: 2.9 });
  meet('THE CHUTE FLIERS', 206, 260, [['harpy', 212, 20], ['bat', 222, 24], ['harpy', 248, 29]]);
  block(FOOT[0], FOOT[1], FOOT_ROW + 1, H - 1);                                 // the chute's foot: the head of the wreck
  ent('check', 266, FOOT_ROW);
  coins([230, TIPPLE_ROW - 1], [238, TIPPLE_ROW - 1], [268, FOOT_ROW - 1], [274, FOOT_ROW - 1]);

  // ---- THE COLLAPSED SPAN (c 272-339) — on foot, to break the rhythm (brief section 4) ----
  /* THE CABLE IS SNAPPED HERE. Two towers went into the gorge with it and wedged across it; you cross on their fallen decks,
     over their own splinters. THE BED is the hazard the level is named for - a gorge with something in it at last - and it is
     not a place you are asked to stand: it is what is under the gaps, and it is drawn so you can see that before you jump. */
  block(281, 314, WRECK_BED + 1, H - 1);                                        // the shelf the wreck lies on, as far as the wreck goes
  spikes(281, 314, WRECK_BED);
  plat(283, 33, 12); plat(297, 31, 12); plat(311, 33, 12);                      // the fallen decks: two-tile gaps between them
  block(325, 339, 31, H - 1);                                                   // the wreck's head, up against the pillar
  plat(289, 28, 6); plat(303, 26, 6); plat(315, 28, 6);                         // the upper wreckage: the coin road, and where the fliers come at you
  rope(288, 29, 32); rope(304, 27, 30); rope(316, 29, 32);
  ent('check', 300, 30); ent('check', 330, 30);
  ent('sign', 276, FOOT_ROW, { text: 'THE SPAN CAME DOWN HERE. THE BED OF IT IS ALL BROKEN ORE - MIND THE GAPS.' });
  meet('THE WRECK', 283, 322, [['sapper', 300, 30], ['rockgoblin', 314, 32], ['goat', 320, 32], ['sheargob', 292, 27], ['gaffer', 318, 27]]);
  ent('tippler', 307, 25, { face: -1 });                                        // on the highest piece of the fallen tower, tipping onto the deck below it
  meet('THE WRECK HEAD', 325, 339, [['heavy', 332, 30], ['miner', 337, 30], ['sprig', 328, 30]]);
  ent('silver', 304, 25);                                                       // SILVER TWO: up on the fallen tower's top piece, past the tippler on it
  coins([291, 27], [306, 25], [317, 27], [327, 30], [335, 30]);

  // ---- THE STEEP LINE (c 340-407) — the hop, in two pillars ----
  block(PILLAR_X[0], PILLAR_X[1], PILLAR[0] + 1, H - 1);                        // the brakeman's pillar: a rock in the gorge
  block(348, PILLAR_X[1], PILLAR[1] + 1, PILLAR[0]);                            // his loft on it: the steep line leaves from its top
  plat(345, PILLAR[1] + 1, 3);                                                  // and the tipping stage off its west end, with the pillar's own lower step under it to tip onto
  rope(345, PILLAR[1] + 1, PILLAR[0]);
  plat(PILLAR_BX[0], PILLAR_B + 1, PILLAR_BX[1] - PILLAR_BX[0] + 1);            // the second pillar's saddle, out in the gorge
  ent('check', 350, PILLAR[1]); ent('check', 382, PILLAR_B);
  ent('sign', 342, PILLAR[0], { text: 'RUSTED BUCKETS GIVE WAY A SECOND AFTER YOU LAND. BE ON THE NEXT ONE.' });
  meet("THE BRAKEMAN'S HUT", PILLAR_X[0], PILLAR_X[1], [['heavy', 343, PILLAR[0]], ['sapper', 351, PILLAR[1]], ['rockgoblin', 348, PILLAR[1]]]);
  meet('THE SECOND PILLAR', PILLAR_BX[0], PILLAR_BX[1], [['gaffer', 378, PILLAR_B], ['javelin', 383, PILLAR_B], ['sheargob', 380, PILLAR_B]]);
  ent('tippler', 346, PILLAR[1], { face: -1 });                                 // on the brakeman's stage, tipping onto the pillar's lower step
  meet('THE STEEP FLIERS', 354, 406, [['harpy', 360, 14], ['bat', 372, 12], ['crow', 392, 9]]);
  coins([348, PILLAR[1] - 1], [378, PILLAR_B - 1], [382, PILLAR_B - 1]);

  // ---- THE WINCH HOUSE (c 408-475) — the castle side ----
  block(408, 480, WINCH + 1, H - 1);
  block(412, 440, WINCH - 6, WINCH - 6); plat(416, WINCH - 3, 8);               // its roof, and the loft under it
  block(451, 462, WINCH - 8, WINCH - 8); plat(453, WINCH - 3, 9);               // the drum house's outer shed, well short of the gate - a roof beside a portcullis is a way over it
  rope(417, WINCH - 4, WINCH);                                                  // up into the winch house's loft
  rope(413, WINCH - 7, WINCH); rope(453, WINCH - 9, WINCH);                     // and on up through a hole in each roof, to the frames on top (the shed's one rope serves its loft and its roof)
  ent('silver', 422, WINCH - 4);                                                // SILVER THREE: in the loft
  ent('check', 415, WINCH); ent('check', 446, WINCH);   /* 415, not 414: the rope at 413 stood in its base */ ent('check', 468, WINCH);
  ent('sign', 430, WINCH, { text: 'THE DRUM HOUSE. NOTHING STOPS THE DRUM BUT A BUCKET WITH SOMEONE IN IT.' });
  meet('THE WINCH CREW', 410, 444, [['miner', 410, WINCH], ['rockgoblin', 436, WINCH], ['sheargob', 419, WINCH - 4]]);
  meet('THE DRUM YARD', 448, 475, [['heavy', 455, WINCH], ['gaffer', 462, WINCH], ['sheargob', 459, WINCH - 4], ['javelin', 466, WINCH]]);
  ent('tippler', 428, WINCH - 7, { face: -1 }); ent('tippler', 460, WINCH - 9, { face: -1 });   /* the frames on the two roofs: each has the yard under it */
  coins([419, WINCH - 4], [432, WINCH - 1], [458, WINCH - 4], [464, WINCH - 1]);

  // ---- THE DRUM HOUSE (c 476-523): the arena. Three housings, two lines, and he goes round them (src/winchmaster.js) ----
  for (const Hs of A.housings) {
    block(Hs.ledge[0], Hs.ledge[1], Hs.ledgeTop + 1, Hs.ledgeTop + (Hs.id === 'A' ? 2 : 1));   /* its ledge: where a jam throws him */
    if (Hs.id === 'A') block(Hs.x0, W - 1, Hs.top + 1, H - 1);                                /* THE GREAT DRUM's housing: the east face of the gorge */
    else block(Hs.x0, Hs.x1, Hs.top + 1, Hs.top + 2);                                         /* the two high housings: timber decks on legs (drawn) */
  }
  block(A.x1, W - 1, 0, H - 1);
  block(481, 481, A.deck + 1, H - 1);                                           // the entrance deck's last tile (the room's floor is the pit - THE PIT)
  for (const [x, y0, y1] of A.ropes) rope(x, y0, y1);   /* out of the spoil: to the deck (the low line), and to each high ledge (the high line) */
  for (const Hs of A.housings) rope(...Hs.ladder);   /* ROUND TWO: a ladder up onto every housing */
  ent('winchmaster', Math.floor(A.housings[0].home), A.housing, { face: -1 });
  ent('sign', 477, A.deck, { text: 'CLIMB UP AND FIGHT HIM, OR RIDE A LOADED BUCKET INTO HIS DRUM.' });

  /* ======== THE PIT (Daniel's playtest, 2026-09-25, item 5) ========
     At the very bottom of every span, a bed of spikes. A hero who falls in pays about a FIFTH of his health and never his life
     (main.js orePitStep: the level's own blow, min(OR.PIT_BITE, hp - 1), in place of the engine's spikes), and then the
     WIND-TURBINES in the floor take him: up on their updraft and along the chasm to a RECOVERY LEDGE on the wall at the
     start of that span, and from the ledge a LADDER climbs back to the deck he set out from. Anything else that falls in is
     impaled (orePitStep). UNDER THE THREE RIDES THE FLOOR IS THE PIT'S OWN, not the grid's: the tiles stay the void they were
     and drawOreVeins draws the rock and the spikes, because as tiles they misled every tool - 236 spike tiles read to
     tools/curve.mjs as a lethal hazard field (INDEX 160), and as rock the sprinklers paid the "dead end" with a heart and
     a loot heap nobody can reach (the turbines take you first). The WRECK's bed stays real spike tiles: it is the collapsed
     span's hazard, the one you jump the fallen decks over, and the pit rule takes a hero who falls onto it all the same.
     The crusher run under the chute is gone into it: one floor for the whole chasm, one rule for a fall. */
  for (const q of OR.PITS) {
    if (q.bed) for (let x = q.x0; x <= q.x1; x++) { set(x, q.floor, T.SPIKE); for (let y = q.floor + 1; y < H; y++) set(x, y, T.SOLID); }   /* the wreck's bed: real spikes, the on-foot section's hazard */
    else for (let x = q.x0; x <= q.x1; x++) for (let y = q.floor; y < H; y++) set(x, y, T.AIR);   /* under a ride: the floor is the pit's own (see above) */
    block(q.ledge[0], q.ledge[1], q.ledge[2] + 1, q.ledge[2] + 1);                 /* the recovery ledge, a shelf on the wall */
    rope(q.ladder[0], q.ladder[1], q.ladder[2]);                                    /* and the ladder from it to the deck the span starts from */
  }
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);   /* every rope is hung last (the Gale Moor bug) */
  const cable = cableLines();
  /* ======== UNDERGROUND (Daniel's playtest, 2026-09-25: "the whole level becomes one vast cavern: no sky") ========
     THE CEILING is rock with stalactites, drawn and never solid, and it is laid off the route rather than typed: over every
     column it hangs CEIL_GAP rows above the highest thing anything uses there - a floor, a rope, a cable and the hanger above
     it, a flier - so a jump never meets it and nothing is drawn inside it. Where the route climbs to the top of the level
     (the drum house) it runs out at row 0. The rockfalls are moved up to its underside: they fall FROM the stalactites. */
  const foot = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY || t === T.NET;
  const topUse = new Array(W).fill(H);
  for (let x = 0; x < W; x++) for (let y = 1; y < H; y++) if (foot(L.grid[y * W + x]) && !foot(L.grid[(y - 1) * W + x])) { topUse[x] = y - 1; break; }
  for (const l of cable) for (let x = Math.ceil(Math.min(l.pts[0][0], l.pts[l.pts.length - 1][0]) / TS); x * TS <= Math.max(l.pts[0][0], l.pts[l.pts.length - 1][0]); x++) { const y = lineYAt(l, x * TS + 8); if (y !== null) topUse[x] = Math.min(topUse[x], Math.floor((y - OR.BUCKET.hang - 10) / TS)); }
  const FLY = new Set(['bat', 'harpy', 'crow']);
  for (const e of L.ents) if (e.t === 'crow') e.t = 'bat';   /* a crow is a bird of the open sky: under the mountain it is a bat */
  const ceil = [];
  for (let x = 0; x < W; x++) { let m = H; for (let k = -5; k <= 5; k++) if (x + k >= 0 && x + k < W) m = Math.min(m, topUse[x + k]); ceil.push(Math.max(0, m - OR.CEIL_GAP - ((x * 7919) % 3 === 0 ? 1 : 0))); }
  for (const e of L.ents) if (FLY.has(e.t)) e.y = Math.max(e.y, ceil[e.x] + 2);   /* the fliers keep under the rock */
  for (const e of L.ents) if (e.t === 'rockfall') e.y = Math.max(ceil[e.x] + 1, Math.min(e.y, ceil[e.x] + 1));
  /* THE LAMPS: a pit lamp on every stretch of floor worth the name, about every OR.LAMP_EVERY columns, standing on footing with air
     over it and nobody else in its tile - the pools of light the dark falls away from */
  const busy = new Set(L.ents.filter(e => e.t !== 'coin').map(e => e.x + ',' + e.y));
  for (let x = 6; x < A.x0 - 2; x += OR.LAMP_EVERY) { let best = null;
    for (let dx = 0; dx < OR.LAMP_EVERY - 2 && !best; dx++) { const c = x + dx; for (let y = 1; y < H - 1 && !best; y++) { const u = L.grid[(y + 1) * W + c], here = L.grid[y * W + c];
      if ((u === T.SOLID || u === T.PLANK || u === T.ONEWAY) && here === T.AIR && L.grid[y * W + c - 1] === T.AIR && L.grid[y * W + c + 1] === T.AIR && !busy.has(c + ',' + y) && !busy.has((c - 1) + ',' + y) && !busy.has((c + 1) + ',' + y)) best = [c, y]; } }
    if (best) { ent('minerlamp', best[0], best[1], { lit: true }); busy.add(best.join(',')); } }
  /* THE VEINS (item 4): ore and gems in the rock along the route, where a hero can reach them - a wall face at the height of the
     floor in front of it (so what spills lands on that floor), never in the way (they are IN the rock: the route is untouched).
     Three blows and it gives OR.VEIN_COINS. The miners work them while you are away (main.js oreVeinsStep) */
  /* THIS LEVEL HAS FEW ROCK FACES AT FOOT HEIGHT - it is decks and spans over a void - so a vein is a seam in the cavern's BACK
     WALL behind a walkway, at chest height: struck the way you strike anything, and never in anyone's way. Laid on the widest
     run of floor near every OR.VEIN_EVERY columns, clear of ropes, lamps, signs and the rest (face 0: in the back wall) */
  const veins = [], fl = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY, clear = (c, y) => L.grid[y * W + c] === T.AIR && L.grid[(y - 1) * W + c] === T.AIR;
  /* first, a seam for every miner to work, two to six columns from where he stands on his own floor - so the mine looks worked */
  for (const m of L.ents.filter(e => e.t === 'miner')) { let got = null;
    for (const d of [3, -3, 4, -4, 5, -5, 2, -2, 6, -6]) { const c = m.x + d, y = m.y; if (got || c < 2 || c >= A.x0 - 2) continue;
      if (!clear(c, y) || !fl(L.grid[(y + 1) * W + c]) || [-1, 0, 1].some(k => busy.has((c + k) + ',' + y) || L.grid[y * W + c + k] === T.NET) || veins.some(v => Math.abs(v.x - c) < 3 && v.y === y)) continue;
      got = [c, y]; }
    if (got) { veins.push({ x: got[0], y: got[1], face: 0, gem: (got[0] * 31) % 3 === 0, hits: 0, mined: false, coins: OR.VEIN_COINS }); busy.add(got.join(',')); } }
  for (let x = 8; x < A.x0 - 4; x += OR.VEIN_EVERY) { if (veins.some(v => Math.abs(v.x - x - OR.VEIN_EVERY / 2) < OR.VEIN_EVERY / 2)) continue; let best = null, bw = 0;
    for (let c = x; c < x + OR.VEIN_EVERY - 4; c++) for (let y = 2; y < H - 2; y++) {
      if (!clear(c, y) || !fl(L.grid[(y + 1) * W + c])) continue;
      if ([-1, 0, 1].some(d => busy.has((c + d) + ',' + y) || L.grid[y * W + c + d] === T.NET)) continue;
      let w = 0; for (let k = -4; k <= 4; k++) if (clear(c + k, y) && fl(L.grid[(y + 1) * W + c + k])) w++;
      if (w > bw) { bw = w; best = [c, y]; } }
    if (best && bw >= 7) { veins.push({ x: best[0], y: best[1], face: 0, gem: (best[0] * 31) % 3 === 0, hits: 0, mined: false, coins: OR.VEIN_COINS }); busy.add(best.join(',')); } }
  /* and the gem glints in the ceiling over the chasm: nothing to mine up there, only light to see the rock by */
  const glints = []; for (let x = 4; x < W - 4; x += 9) glints.push([x + ((x * 13) % 5), ceil[x] - 1 - ((x * 7) % 3), (x * 17) % 3]);
  /* EVERY FALLING ROCK IS TOLD (Daniel's playtest, 2026-09-25). A full second of dust from the spot and a red ring where it
     lands (tell), never begun off the screen (seen), and - out over the gorge, where the ground it lands on is a hundred feet
     down - the ring is ALSO on the cable it crosses, which is where a rider is (lane: that line's height under it) */
  for (const e of L.ents) if (e.t === 'rockfall') { e.tell = OR.ROCK_TELL; e.seen = true;
    const ys = cable.map(l => lineYAt(l, e.x * TS + 8)).filter(y => y !== null && y > (e.y + 1) * TS); if (ys.length) e.lane = Math.min(...ys); }
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: YARD }, pools: [], falls: [], moversExtra: [], interiors: [], gusts: [],
    music: 'oreroad',   /* its own track at last (Daniel 2026-09-23): 'mineworks' was a sparse synth that played as silence. audio/CREDITS.txt */ duskStart: -1, duskLen: 1,
    /* ONE VAST CAVERN (Daniel, 2026-09-25): no sky. The engine's dark (black, with a hole for every lamp and the light you carry)
       at OR.DARK, the night wash thin under it, and the lamps' warm pools; the far wall, the pillars and the veins are
       drawOreBackdrop, the ceiling and its stalactites drawOreStructures */
    dark: OR.DARK, edgeLit: true, night: true, glowNight: true, nightA: 0.1, ceil, veins, glints,
    pits: OR.PITS.map(q => ({ ...q, turbines: [...Array(Math.floor((q.x1 - q.x0 - 4) / OR.TURBINE_EVERY) + 1).keys()].map(k => q.x0 + 4 + k * OR.TURBINE_EVERY).filter(x => x <= q.x1 - 1) })),
    cable, encounters, places: OR.PLACES, oreRoad: true,
    /* THE AMBUSH ROOM (Q), returned by the builder rather than written into level.js's table, so its columns live beside the
       geometry they are read off. THE SORTING FLOOR is the tower's middle deck: a trestle floor 27 tiles between its gates -
       wide enough to read a tell on, narrow enough that the fight does not scatter. Its captain is a GAFFER, this level's own
       creature and the one whose reach the room exists to teach. The door checkpoint stands outside the west gate. */
    ambushes: [{ name: 'THE SORTING FLOOR', row: TOWER[1], y0: TOWER[2] + 1, wallL: 152, wallR: 178, check: [148, TOWER[1]],
      waves: [[['miner', 157, TOWER[1]], ['rockgoblin', 174, TOWER[1]], ['sprig', 165, TOWER[1]], ['bat', 169, TOWER[1] - 5]],
              [['gaffer', 172, TOWER[1], { elite: true }], ['sheargob', 156, TOWER[1]], ['tippler', 163, TOWER[1]], ['miner', 176, TOWER[1]]]] }],
    /* THE REACH MODEL's footing for a ride (reachcore.js): each line is a band you can board anywhere along and leave anywhere along,
       the way a lift is. It is generous on a sloped line - the tools call this level ASSISTED, and that is the truth */
    cableBridges: cable.map(l => { const xs = l.pts.map(p => p[0]), ys = l.pts.map(p => p[1]); return [Math.floor(Math.min(...xs) / TS), Math.floor((Math.max(...xs) - 1) / TS), Math.floor(Math.min(...ys) / TS), Math.floor(Math.max(...ys) / TS)]; }),
    palette: { sky: [[14, 12, 18], [34, 28, 30]], far: 'crag', mid: 'crag', near: 'none', dress: 'none', ledges: 'staging', haze: 'rgba(40,32,30,0.18)', murkCol: '#221e24', murkLit: '#6a4a2a',
      grass: '#5a4a3a', grassL: '#7a6448', grassD: '#3a2e22', dirt: '#3e342c', dirtL: '#54483a', dirtD: '#241d18', canopy: ['#1a1620', '#241e28', '#2e2632', '#3a303e'] },
    weather: [{ x0: 0, x1: 99999, kind: 'dust' }], ambient: [{ x0: 0, x1: 99999, kind: 'cave' }],
    arena: { x0: A.x0 * TS, x1: A.x1 * TS, floor: surf(A.deck), y0: 0, trigger: (A.x0 + 3) * TS, wallL: A.x0 - 1, wallR: A.x1, boss: 'winchmaster', music: 'boss3', tint: '#5a4a3a', tintA: 0.06, fx: 'dust' },
    noCoin: [[68, 135, 0, H - 1], [204, 261, 0, H - 1], [353, 375, 0, H - 1], [385, 407, 0, H - 1], [476, 523, 0, H - 1]],   /* over the drop: the sprinkler must not put coins where only a bucket goes */
  };
}

// ============================================================================================ THE LOOK
const IRON = ['#2a2a30', '#4a4a52', '#6a6a74', '#8a8a94'], RUST = ['#3a1e14', '#6a3420', '#9a5230', '#c07048'], TIMBER = ['#2e2014', '#4a321e', '#6a4a2c', '#8a6a44'], ORE = ['#3a3440', '#5a5260', '#7a7080', '#b09a5a'];
/* the cable itself, a pixel line along the line's supports, and the return cable behind it (darker, with the empties coming back) */
export function drawCables(g, C, cx, cy, time, VW) {
  const hang = OR.BUCKET.hang;
  for (const l of C.lines) { const p = l.pts; if (p[p.length - 1][0] < cx - 40 && p[0][0] < cx - 40) continue; if (p[0][0] > cx + VW + 40 && p[p.length - 1][0] > cx + VW + 40) continue;
    /* the return, behind: six pixels up and dimmer, with empty buckets going the other way */
    g.globalAlpha = 0.45; g.fillStyle = IRON[1];
    for (let x = Math.max(Math.min(p[0][0], p[p.length - 1][0]), cx - 4); x < Math.min(Math.max(p[0][0], p[p.length - 1][0]), cx + VW + 4); x += 2) { const y = lineYAt(l, x); if (y !== null) g.fillRect(Math.round(x - cx), Math.round(y - hang - 8 - cy), 2, 1); }
    for (let k = 0; k < l.n; k++) { const s = mod(-(l.t) + k * l.gap + l.gap / 2, l.total); if (s >= l.len) continue; const [bx, by] = pointAt(l, l.len - s);
      if (bx < cx - 20 || bx > cx + VW + 20) continue; const x = Math.round(bx - cx), y = Math.round(by - hang - 8 - cy);
      g.fillRect(x, y, 1, 10); g.fillStyle = IRON[0]; g.fillRect(x - 6, y + 10, 12, 6); g.fillStyle = IRON[1]; }
    g.globalAlpha = 1;
    /* the hauling cable */
    for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i], n = Math.max(1, Math.round(Math.abs(b[0] - a[0]) / 2));
      for (let k = 0; k < n; k++) { const x = a[0] + (b[0] - a[0]) * k / n; if (x < cx - 4 || x > cx + VW + 4) continue; const y = a[1] + (b[1] - a[1]) * k / n - hang;
        g.fillStyle = IRON[0]; g.fillRect(Math.round(x - cx), Math.round(y - cy), 2, 2); g.fillStyle = IRON[2]; g.fillRect(Math.round(x - cx), Math.round(y - cy), 2, 1); } }
    /* a bull-wheel in its housing at each end, turning with the line */
    for (const e of [p[0], p[p.length - 1]]) { const x = Math.round(e[0] - cx), y = Math.round(e[1] - hang - cy); if (x < -30 || x > VW + 30) continue;
      const a = l.t / 9 * (l.jam > 0 ? 0 : 1); g.fillStyle = IRON[0]; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON[2];
      for (let q = 0; q < 4; q++) { const an = a + q * Math.PI / 2; g.fillRect(Math.round(x + Math.cos(an) * 6) - 1, Math.round(y + Math.sin(an) * 6) - 1, 2, 2); }
      g.fillStyle = IRON[3]; g.fillRect(x - 1, y - 1, 2, 2); }
  }
}
/* ONE BUCKET: an iron skip on a hanger up to the cable, ore heaped in it. A rusted one is red-brown with a rag on its hanger; one
   giving way shakes; an EMPTIED one has ridden UP its hanger and carries nothing, which is the whole read of the ore verb - the
   heap is gone and the skip is sitting higher against the cable. A braked one has the shoe biting on its grip, in yellow. */
export function drawBucket(g, m, cx, cy, time) {
  if (!m.vis) return;
  const R = m.cracked, pal = R ? RUST : IRON, shake = m.crackT > 0 ? Math.round(Math.sin(time * 60) * Math.min(2, m.crackT * 3)) : 0;
  const x = Math.round(m.x - cx) + shake, y = Math.round(m.y - cy), w = m.w, hang = Math.max(8, OR.BUCKET.hang - (m.lift || 0)), mid = x + (w >> 1);
  g.fillStyle = IRON[0]; g.fillRect(mid - 1, y - hang, 2, hang - 2); g.fillRect(mid - 4, y - hang - 1, 8, 2);   // the hanger and its grip on the cable
  if (m.brake > 0.05) { g.fillStyle = '#ffd36b'; g.fillRect(mid - 5, y - hang - 3, 10, 2); g.fillStyle = '#c9463d'; g.fillRect(mid - 5, y - hang - 3, 2, 2); g.fillRect(mid + 3, y - hang - 3, 2, 2); }   /* THE SHOE IS ON */
  if (R) { g.fillStyle = '#c9463d'; g.fillRect(mid + 1, y - hang + 6, 4, 3); g.fillRect(mid + 3, y - hang + 9, 2, 3); }   /* THE RAG: this one will not hold */
  g.fillStyle = pal[0]; g.fillRect(x, y, w, 2); g.fillRect(x + 1, y + 2, w - 2, 8); g.fillRect(x + 3, y + 10, w - 6, 3);
  g.fillStyle = pal[2]; g.fillRect(x + 1, y, w - 2, 1); g.fillStyle = pal[1]; g.fillRect(x + 2, y + 2, w - 4, 7); g.fillStyle = pal[3]; g.fillRect(x + 2, y + 2, 2, 7);
  g.fillStyle = pal[0]; for (let r = 4; r < w - 4; r += 6) g.fillRect(x + r, y + 3, 1, 1);   // rivets
  if (R) { g.fillStyle = '#1a0e08'; g.fillRect(x + 9, y + 3, 1, 3); g.fillRect(x + 10, y + 6, 1, 3); g.fillRect(x + 11, y + 9, 1, 2); }
  if (m.ore) { g.fillStyle = ORE[1]; g.fillRect(x + 3, y - 2, w - 6, 2); g.fillStyle = ORE[2]; g.fillRect(x + 5, y - 3, w - 12, 1); g.fillStyle = ORE[3]; g.fillRect(x + 9, y - 3, 2, 1); g.fillRect(x + w - 14, y - 2, 1, 1); }
}
/* THE PYLONS, the tower's timber, the tipple house, the wreck, the pillars and the drum house: drawn behind the tiles (none of it
   is solid beyond the tiles). B9: everything out over the gorge is stepped into something - a leg down into the dark, or a
   bracket back into the rock. */
export function drawOreStructures(g, L, cx, cy, time, VW, VH, drumAng) {
  drawOreCeiling(g, L, cx, cy, time, VW, VH);   /* UNDERGROUND: the rock over it all, first, so every structure stands in front of it */
  const on = (x0, x1) => x1 * TS - cx > -60 && x0 * TS - cx < VW + 60;
  const beam = (x, y, w, h, c = TIMBER) => { g.fillStyle = c[1]; g.fillRect(x, y, w, h); g.fillStyle = c[2]; g.fillRect(x, y, w, 1); g.fillStyle = c[0]; g.fillRect(x, y + h - 1, w, 1); };
  const bottom = VH + 20;
  /* THE TWO PYLONS: braced timber legs from far down in the gorge up to their decks, each with its saddle over the cable */
  for (const P of [OR.PYLON_A, OR.PYLON_B]) if (on(P[0] - 4, P[1] + 4)) { const x0 = P[0] * TS - cx, x1 = (P[1] + 1) * TS - cx, top = surf(OR.YARD) - cy;
    for (const x of [x0 + 6, x1 - 10]) beam(x, top, 4, bottom - top);
    for (let y = top + 16; y < bottom; y += 28) { g.fillStyle = TIMBER[0]; for (let k = 0; k < 28; k++) { g.fillRect(Math.round(x0 + 8 + (x1 - x0 - 16) * k / 28), y + k, 2, 1); g.fillRect(Math.round(x1 - 10 - (x1 - x0 - 16) * k / 28), y + k, 2, 1); } }
    beam(x0 + 30, top - OR.BUCKET.hang - 8, 20, 6, IRON); beam(x0 + 38, top - OR.BUCKET.hang - 2, 4, OR.BUCKET.hang - 4); }
  /* THE SORTING TOWER: posts, braces and a hoist-arm */
  if (on(OR.TOWER_X[0] - 2, OR.TOWER_X[1] + 4)) { const x0 = OR.TOWER_X[0] * TS - cx, x1 = (OR.TOWER_X[1] + 1) * TS - cx, yTop = surf(OR.TOWER[2]) - cy - 34, yBot = surf(OR.TOWER[0]) - cy;
    for (const x of [x0 + 2, x0 + 360, x0 + 700, x1 - 6]) beam(x, yTop, 5, yBot - yTop);
    for (let y = yTop + 20; y < yBot - 10; y += 40) { g.fillStyle = TIMBER[0]; for (let k = 0; k < 40; k++) g.fillRect(Math.round(x0 + 6 + (x1 - x0 - 12) * k / 40), y + k * 0.5, 2, 1); }
    beam(x0 - 4, yTop, x1 - x0 + 8, 5); g.fillStyle = TIMBER[1]; g.fillRect(x0 + 60, yTop - 16, 3, 16); beam(x0 + 40, yTop - 18, 60, 3);
    g.fillStyle = IRON[1]; g.fillRect(x0 + 96, yTop - 15, 1, 20 + Math.round(Math.sin(time) * 2)); g.fillStyle = IRON[0]; g.fillRect(x0 + 93, yTop + 5, 7, 5); }
  /* THE TIPPLE HOUSE, half way down the chute: a stage on two raking legs with the tipping frame over it */
  if (on(OR.TIPPLE[0] - 4, OR.TIPPLE[1] + 4)) { const x0 = OR.TIPPLE[0] * TS - cx, x1 = (OR.TIPPLE[1] + 1) * TS - cx, top = surf(OR.TIPPLE_ROW) - cy;
    for (const x of [x0 + 10, x1 - 14]) beam(x, top, 4, bottom - top);
    g.fillStyle = TIMBER[0]; for (let k = 0; k < 44; k++) { g.fillRect(Math.round(x0 + 12 + k * 2.6), top + 6 + k, 2, 1); g.fillRect(Math.round(x1 - 16 - k * 2.6), top + 6 + k, 2, 1); }
    beam(x0 + 20, top - OR.BUCKET.hang - 10, x1 - x0 - 40, 5, IRON); }
  /* THE COLLAPSED SPAN: two towers lying at an angle across the gorge with their own cable hanging slack off them */
  if (on(OR.WRECK[0] - 6, 339)) { const wx = OR.WRECK[0] * TS - cx, wy = surf(OR.WRECK_BED) - cy;
    for (let k = 0; k < 5; k++) { const bx = wx + 20 + k * 130, by = wy - 40 - (k % 2) * 26; g.save(); g.translate(bx, by); g.rotate(k % 2 ? 0.28 : -0.22); beam(-70, 0, 140, 6); g.restore(); }
    g.fillStyle = IRON[0]; for (let k = 0; k < 64; k++) { const t = k / 64, sx = wx + t * 660, sy = wy - 60 + Math.sin(t * 5.2) * 26 + t * 34; g.fillRect(Math.round(sx), Math.round(sy), 2, 1); }
    g.fillStyle = IRON[1]; for (let k = 0; k < 10; k++) g.fillRect(Math.round(wx + 30 + k * 62), Math.round(wy - 6), 3, 6); }
  /* THE BRAKEMAN'S LOFT: planked walls on the pillar's upper step, a brake wheel on its gable */
  if (on(OR.PILLAR_X[0] - 2, OR.PILLAR_X[1] + 2)) { const x0 = 346 * TS - cx, y1 = surf(OR.PILLAR[1]) - cy;
    g.fillStyle = TIMBER[0]; g.fillRect(x0 + 8, y1 - 44, 96, 4); for (let x = x0 + 12; x < x0 + 100; x += 10) beam(x, y1 - 40, 3, 6);
    g.fillStyle = IRON[1]; g.beginPath(); g.arc(x0 + 56, y1 - 52, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON[3]; g.fillRect(x0 + 55, y1 - 53, 2, 2); }
  /* THE SECOND PILLAR: a spike of rock out in the gorge with an iron saddle bolted to the top of it */
  if (on(OR.PILLAR_BX[0] - 4, OR.PILLAR_BX[1] + 4)) { const x0 = OR.PILLAR_BX[0] * TS - cx, x1 = (OR.PILLAR_BX[1] + 1) * TS - cx, top = surf(OR.PILLAR_B) - cy;
    g.fillStyle = '#4a4438'; g.beginPath(); g.moveTo(x0 + 2, top); g.lineTo(x1 - 2, top); g.lineTo(x1 - 26, bottom); g.lineTo(x0 + 22, bottom); g.closePath(); g.fill();
    g.fillStyle = '#5e5648'; g.fillRect(x0 + 6, top, 10, bottom - top); beam(x0 + 14, top - OR.BUCKET.hang - 8, x1 - x0 - 28, 6, IRON); }
  /* THE DRUM HOUSE: three drums, each on the face of its housing, turning with its own line - and the two high housings stood
     on braced legs down into the gorge (B9: a timber deck in the air is stepped into something). The live drum, the one he is
     driving, turns; a drum whose line is jammed stands still (drumAng is the world's, one angle per housing) */
  const A = OR.ARENA;
  if (on(A.x0 - 4, A.x1)) {
    for (let k = 0; k < A.housings.length; k++) { const Hs = A.housings[k], hang = OR.BUCKET.hang;
      const face = (Hs.at === 'end' ? Hs.x0 : Hs.x1 + 1) * TS - cx, row = Hs.id === 'A' ? A.deck : A.highRow, dy = surf(row) - hang - cy, r = Hs.id === 'A' ? 22 : 15;
      if (Hs.id === 'A') { beam(face - 4, surf(Hs.top) - cy - 60, (A.x1 - Hs.x0) * TS + 8, 6); for (const x of [face, face + 60, face + 124]) beam(x, surf(Hs.top) - cy - 56, 5, 56); }
      else { const x0 = Hs.x0 * TS - cx, x1 = (Hs.x1 + 1) * TS - cx, top = surf(Hs.top) - cy + 32;
        for (const x of [x0 + 4, x1 - 9]) beam(x, top, 5, bottom - top);
        g.fillStyle = TIMBER[0]; for (let y = top + 12; y < bottom; y += 36) for (let q = 0; q < 36; q++) { g.fillRect(Math.round(x0 + 8 + (x1 - x0 - 16) * q / 36), y + q, 2, 1); g.fillRect(Math.round(x1 - 10 - (x1 - x0 - 16) * q / 36), y + q, 2, 1); }
        beam(x0 - 2, surf(Hs.top) - cy - 40, x1 - x0 + 4, 5); beam(x0 + 2, surf(Hs.top) - cy - 36, 4, 36); beam(x1 - 6, surf(Hs.top) - cy - 36, 4, 36); }
      const ang = Array.isArray(drumAng) ? drumAng[k] || 0 : drumAng || 0;
      g.fillStyle = IRON[0]; g.beginPath(); g.arc(face, dy, r + 3, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON[1]; g.beginPath(); g.arc(face, dy, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = IRON[2]; for (let q = 0; q < 8; q++) { const an = ang + q * Math.PI / 4; g.fillRect(Math.round(face + Math.cos(an) * (r - 4)) - 2, Math.round(dy + Math.sin(an) * (r - 4)) - 2, 4, 4); }
      g.fillStyle = IRON[3]; g.beginPath(); g.arc(face, dy, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c9a44a'; for (let q = -r + 4; q < r - 4; q += 3) g.fillRect(face - 2 + Math.round(Math.sin(q + ang * 3)), dy + q, 1, 2); }   /* the cable wound on it */
  }
}
/* THE CAVERN, drawn in the sky layer (the level is L.dark, so the engine has already laid the murk: rock silhouettes and a black
   top). Behind the play, three things at their own depths: THE FAR WALL's pillars and flowstone at 0.12, the far cableway
   running on into the dark with its lamps at 0.2, and the gem seams that glint in the far rock. Motes drift in front of all of
   it. Rects only, so tools can render it in Node. cy is optional (older call sites passed none). */
export function drawOreBackdrop(g, VW, VH, cx, time, cy = 0) {
  const par = (f, w) => ((-cx * f) % w + w) % w, dy = Math.round(-cy * 0.04);
  /* the far wall: tall pillars of rock, lit a little along one edge */
  for (let k = 0; k < 7; k++) { const x = Math.round(par(0.12, VW + 240) + k * 97) % (VW + 240) - 120, w = 26 + (k * 37) % 30, top = -20, bot = VH + 20;
    g.fillStyle = '#1c1820'; g.fillRect(x, top, w, bot - top); g.fillStyle = '#26202a'; g.fillRect(x + 2, top, 3, bot - top);
    g.fillStyle = '#2e2630'; for (let y = 10 + (k * 23) % 30 + dy; y < VH; y += 34) g.fillRect(x + 4, y, w - 10, 2); }
  /* the far cableway, going on into the dark: its pylons, the cable, its buckets, and a lamp at every pylon */
  { const y0 = Math.round(VH * 0.42) + dy, sh = par(0.2, 150);
    g.fillStyle = '#2e2832'; g.fillRect(0, y0, VW, 1);
    for (let x = sh - 150; x < VW + 150; x += 150) { g.fillRect(Math.round(x), y0, 3, VH - y0); g.fillRect(Math.round(x) - 6, y0, 15, 2);
      const k = 0.6 + 0.4 * Math.sin(time * 3 + x); g.globalAlpha = 0.25 * k; g.fillStyle = '#ffb45a'; g.fillRect(Math.round(x) - 3, y0 + 4, 9, 7); g.globalAlpha = 0.8; g.fillStyle = '#ffd36b'; g.fillRect(Math.round(x), y0 + 6, 2, 2); g.globalAlpha = 1; g.fillStyle = '#2e2832'; }
    const bt = (time * 18) % 60; for (let x = sh - 150 + bt; x < VW + 60; x += 60) { g.fillRect(Math.round(x), y0 + 1, 1, 5); g.fillRect(Math.round(x) - 3, y0 + 6, 7, 3); } }
  /* the seams: gems in the far rock, each on its own slow pulse (they are the only colour back there) */
  { const COL = ['#6fe0d8', '#c08aff', '#ffd36b', '#8fd160'];
    for (let k = 0; k < 16; k++) { const x = Math.round(par(0.16, VW + 80) + k * 53) % (VW + 80) - 40, y = 14 + (k * 41) % (VH - 50) + dy, a = 0.35 + 0.35 * Math.sin(time * (1 + (k % 4) * 0.3) + k);
      g.globalAlpha = a * 0.35; g.fillStyle = COL[k % 4]; g.fillRect(x - 2, y - 2, 6, 6); g.globalAlpha = a; g.fillRect(x, y, 2, 2); g.fillRect(x + 2, y + 1, 1, 1); } g.globalAlpha = 1; }
  /* THE ROOF OF THE CAVERN, far off: a fringe of stalactites along the top of every view at 0.3, so there is rock over your head
     wherever you are, not only where the world's own ceiling (drawOreCeiling) comes near enough to see */
  { const sh = par(0.3, 14); g.fillStyle = '#3a3240'; g.fillRect(0, 0, VW, 12); g.fillStyle = '#4e4450'; g.fillRect(0, 11, VW, 1);
    for (let x = sh - 14, k = Math.floor((cx * 0.3) / 14); x < VW + 14; x += 14, k++) { const h = 10 + ((k * 7919) % 5) * 9 + ((k * 31) % 3) * 5, w = 6 + (k % 3) * 3;
      for (let j = 0; j < h; j++) { const ww = Math.max(1, Math.round(w * (1 - j / h))), xx = Math.round(x) + ((w - ww) >> 1); g.fillStyle = '#3a3240'; g.fillRect(xx, 12 + j, ww, 1); g.fillStyle = '#5a4e58'; g.fillRect(xx, 12 + j, 1, 1); }
      if (h > 40) { const per = 2.4 + (k % 4) * 0.5, t = ((time + k * 0.61) % per) / per; if (t > 0.6) { g.globalAlpha = 0.7 * (1 - (t - 0.6) / 0.4); g.fillStyle = '#9ac0d8'; g.fillRect(Math.round(x) + (w >> 1), 12 + h + Math.round((t - 0.6) / 0.4 * 60), 1, 2); g.globalAlpha = 1; } } } }
  /* dust motes in the lamplight, drifting */
  g.fillStyle = '#d8c8a0'; for (let k = 0; k < 22; k++) { const x = (k * 61 + time * (4 + k % 3) - cx * 0.35) % VW, y = (k * 29 + Math.sin(time * 0.7 + k) * 6 + time * 2) % VH;
    g.globalAlpha = 0.18 + 0.12 * Math.sin(time * 2 + k); g.fillRect(Math.round((x + VW) % VW), Math.round(y), 1, 1); } g.globalAlpha = 1;
}
/* THE CEILING, in the world (behind the tiles, and never solid): rock down to L.ceil over every column, a lit lip on its
   underside, stalactites of every length, the glints of gem in it, and a drip off the long ones on its own clock */
export function drawOreCeiling(g, L, cx, cy, time, VW, VH) {
  const C = L.ceil; if (!C) return;
  const x0 = Math.max(0, Math.floor(cx / TS) - 1), x1 = Math.min(C.length - 1, Math.ceil((cx + VW) / TS) + 1);
  for (let tx = x0; tx <= x1; tx++) { const bot = C[tx] * TS + TS - cy, x = tx * TS - cx; if (bot < -2) continue;
    g.fillStyle = '#2a2430'; g.fillRect(x, Math.min(0, bot - 400), TS, Math.max(0, bot) - Math.min(0, bot - 400));
    g.fillStyle = '#3e3642'; g.fillRect(x, bot - 3, TS, 3); g.fillStyle = '#5a4e58'; g.fillRect(x, bot - 1, TS, 1);
    for (let s = 0; s < 3; s++) { const h = (tx * 7 + s * 13) % 11 + (s === 1 ? 6 : 2), sx = x + 2 + s * 5, w = s === 1 ? 4 : 3;
      for (let k = 0; k < h; k++) { const ww = Math.max(1, Math.round(w * (1 - k / h))); g.fillStyle = k < 2 ? '#3e3642' : '#332c38'; g.fillRect(sx + ((w - ww) >> 1), bot + k, ww, 1); g.fillStyle = '#5a4e58'; g.fillRect(sx + ((w - ww) >> 1), bot + k, 1, 1); }
      if (s === 1 && h > 12) { const per = 2.2 + (tx % 5) * 0.4, t = ((time + tx * 0.37) % per) / per, dyy = t < 0.6 ? 0 : (t - 0.6) / 0.4 * 70;
        g.globalAlpha = t < 0.6 ? t / 0.6 * 0.8 : 0.8 * (1 - (t - 0.6) / 0.4); g.fillStyle = '#9ac0d8'; g.fillRect(sx + 1, Math.round(bot + h + dyy), 1, t < 0.6 ? 1 : 2); g.globalAlpha = 1; } } }
  for (const [gx, gy, k] of (L.glints || [])) { const x = gx * TS - cx + 6, y = gy * TS - cy + 8; if (x < -10 || x > VW + 10 || y < -10 || y > VH + 10) continue;
    const a = 0.55 + 0.45 * Math.sin(time * 1.7 + gx), col = ['#6fe0d8', '#c08aff', '#ffd36b'][k];
    g.globalAlpha = 0.3 * a; g.fillStyle = col; g.fillRect(x - 3, y - 3, 8, 8); g.globalAlpha = a; g.fillRect(x, y, 2, 3); g.fillRect(x + 2, y + 1, 1, 2); g.globalAlpha = 1; }
  /* THE TIMBERS: a pit-prop frame over every lamp - two posts and a cap, stepped into the floor it stands on */
  for (const e of L.ents) { if (e.t !== 'minerlamp') continue; const x = e.x * TS + 8 - cx, fy = (e.y + 1) * TS - cy; if (x < -40 || x > VW + 40 || fy < -10 || fy > VH + 60) continue;
    g.fillStyle = '#3a2818'; g.fillRect(x - 22, fy - 44, 4, 44); g.fillRect(x + 18, fy - 44, 4, 44); g.fillRect(x - 26, fy - 48, 52, 5);
    g.fillStyle = '#5a3e24'; g.fillRect(x - 22, fy - 44, 1, 44); g.fillRect(x + 18, fy - 44, 1, 44); g.fillRect(x - 26, fy - 48, 52, 1);
    g.fillStyle = '#2a1c10'; g.fillRect(x - 18, fy - 43, 6, 2); g.fillRect(x + 12, fy - 43, 6, 2); }
}
/* THE VEINS, drawn over the tiles: a seam of ore in the back wall at chest height, its flecks glinting, cracking as it is struck,
   an empty scar when it is mined. A gem seam is violet and cyan; an ore seam is brass and rust. And what a miner carries */
export function drawOreVeins(g, L, cx, cy, time, VW, VH) {
  for (const v of (L.veins || [])) { const x = v.x * TS - cx, y = v.y * TS - cy; if (x < -20 || x > VW + 20 || y < -20 || y > VH + 20) continue;
    const pal = v.gem ? ['#3a3048', '#c08aff', '#6fe0d8'] : ['#3a3028', '#e0a040', '#c07048'];
    g.fillStyle = '#1e1a20'; g.fillRect(x + 1, y - 2, 14, 13); g.fillRect(x - 1, y + 1, 18, 8);
    g.fillStyle = pal[0]; g.fillRect(x + 2, y - 1, 12, 11); g.fillRect(x, y + 2, 16, 6);
    if (v.mined) { g.fillStyle = '#141116'; g.fillRect(x + 4, y + 2, 8, 5); continue; }
    for (let k = 0; k < 6; k++) { const fx = x + 2 + (k * 5 + v.x) % 12, fy = y + (k * 7 + v.y) % 9, a = 0.6 + 0.4 * Math.sin(time * 3 + k * 1.7 + v.x);
      g.globalAlpha = a; g.fillStyle = pal[1 + (k % 2)]; g.fillRect(fx, fy, 2, k % 3 ? 1 : 2); } g.globalAlpha = 1;
    if (v.hits > 0) { g.fillStyle = '#0e0c10'; for (let k = 0; k < v.hits; k++) { g.fillRect(x + 4 + k * 3, y + 1 + k, 1, 4); g.fillRect(x + 5 + k * 3, y + 4 + k, 2, 1); } }
    if (v.flash > 0) { g.globalAlpha = Math.min(1, v.flash * 4); g.fillStyle = '#fff6e0'; g.fillRect(x + 2, y - 1, 12, 11); g.globalAlpha = 1; } }
  /* THE TURBINES in the pit's floor: a grated housing sunk among the spikes and a three-bladed rotor over it, always turning; when
     the pit has someone they ROAR - the rotor a blur and the updraft streaming off them, told for as long as it carries him */
  for (const q of (L.pits || [])) { const fy = q.floor * TS - cy; if (fy < -40 || fy > VH + 60) continue; const k = q.kick || 0;
    /* the bed under a ride: the rock (it is not tiles - see THE PIT), and iron spikes along the whole of it */
    if (!q.bed) { const X0 = Math.max(q.x0 * TS, cx - 8) - cx, X1 = Math.min((q.x1 + 1) * TS, cx + VW + 8) - cx; g.fillStyle = '#3e342c'; g.fillRect(X0, fy, X1 - X0, VH + 60); g.fillStyle = '#54483a'; g.fillRect(X0, fy, X1 - X0, 2); g.fillStyle = '#241d18'; for (let x = X0 + ((-cx) % 11 + 11) % 11; x < X1; x += 11) g.fillRect(x, fy + 6 + ((x * 7) & 7), 3, 2); }
    if (!q.bed) for (let x = Math.max(q.x0 * TS, cx - 8); x < Math.min((q.x1 + 1) * TS, cx + VW + 8); x += 4) { const h = 5 + ((x >> 2) * 7) % 4, X = Math.round(x - cx);
      g.fillStyle = '#3a3a42'; g.fillRect(X, fy - h, 2, h); g.fillStyle = '#8a8a94'; g.fillRect(X, fy - h, 1, 2); g.fillStyle = '#6a3420'; g.fillRect(X + 1, fy - 2, 1, 2); }
    for (const tx of q.turbines) { const x = tx * TS + 8 - cx; if (x < -30 || x > VW + 30) continue;
      g.fillStyle = '#2a2a30'; g.fillRect(x - 9, fy - 3, 18, 8); g.fillStyle = '#4a4a52'; g.fillRect(x - 8, fy - 2, 16, 6); g.fillStyle = '#6a6a74'; g.fillRect(x - 8, fy - 2, 16, 1);
      for (let j = -6; j <= 6; j += 3) { g.fillStyle = '#1a1a20'; g.fillRect(x + j, fy - 1, 1, 4); }
      const ang = time * (k > 0 ? 40 : 6) + tx;
      for (let b = 0; b < 3; b++) { const a = ang + b * 2.094, c = Math.cos(a), sn = Math.sin(a);
        g.fillStyle = k > 0.2 ? '#9aa0aa' : '#7a7a84'; for (let r = 2; r <= 8; r++) g.fillRect(Math.round(x + c * r), Math.round(fy - 7 + sn * r * 0.35), 1, 1); }
      g.fillStyle = '#c8ccd4'; g.fillRect(x - 1, fy - 8, 2, 2);
      const n = k > 0 ? 6 : 2, a0 = k > 0 ? 0.5 : 0.18;
      for (let j = 0; j < n; j++) { const ph = ((time * (k > 0 ? 2.2 : 0.8) + j / n + tx * 0.13) % 1), yy = fy - 10 - ph * (k > 0 ? 160 : 60);
        g.globalAlpha = a0 * (1 - ph); g.fillStyle = '#dfe8f0'; g.fillRect(Math.round(x - 5 + ((j * 7) % 11)), Math.round(yy), 1, k > 0 ? 6 : 3); } g.globalAlpha = 1; } }
  for (const c of (L.carrying || [])) { const x = Math.round(c.x - cx), y = Math.round(c.y - cy); g.fillStyle = '#2a2a30'; g.fillRect(x - 5, y - 4, 10, 5); g.fillStyle = '#7a7080'; g.fillRect(x - 4, y - 6, 8, 3); g.fillStyle = '#b09a5a'; g.fillRect(x - 2, y - 7, 3, 1); }
}
