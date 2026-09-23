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
//   c 476-523  THE DRUM HOUSE     THE WINCHMASTER (src/winchmaster.js - his rework is stage two, not this pass)
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
  ARENA: { x0: 476, x1: 519, deck: 12, walk: 9, housing: 8, spoil: 22, ledge: [507, 509], house: [510, 518], spans: [[482, 488], [491, 496], [499, 503]] },
  PLACES: { yard: [0, 67], span1: [68, 135], tower: [136, 203], chute: [204, 271], collapse: [272, 339], steep: [340, 407], winch: [408, 475], drum: [476, 523] },
  /* THE BUCKET IS 46 PX WIDE, NOT 24. Daniel found this himself and it is the change everything else stands on: the
     knight's box is 10-14 px, so a 24 px skip had no room to swing or to dodge on and NO FIGHT COULD HAPPEN ON ONE.
     46 is about three tiles - two bodies wide - and it is what makes the bats, the harpies and the Gaffer's hook into
     a fight instead of a nuisance you cannot answer. `lift` is how much higher an EMPTIED skip rides. */
  BUCKET: { w: 46, h: 6, hang: 30, lift: 18 },
  CRACK: 0.9,                                                    // how long a rusted bucket holds you
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
    { id: 'first', speed: 62, gap: 100, ret: 220, pts: join(
      sagPts(67.5, OR.YARD, pa0, OR.YARD, 3), sagPts(pa0, OR.YARD, pa1, OR.YARD, 0, 1),
      sagPts(pa1, OR.YARD, pb0, OR.YARD, 2), sagPts(pb0, OR.YARD, pb1, OR.YARD, 0, 1),
      sagPts(pb1, OR.YARD, 136.75, OR.YARD, 2)) },
    /* THE ORE CHUTE: the fast one. Down thirteen rows from the tower's top deck to the foot, flat over the tipple house half way,
       and at 96 px/s it is steered rather than waited out - which is the answer to "riding on lifts is boring" */
    { id: 'chute', speed: 96, gap: 100, ret: 240, pts: join(
      sagPts(203.5, OR.TOWER[2], OR.TIPPLE[0], OR.TIPPLE_ROW, 1), sagPts(OR.TIPPLE[0], OR.TIPPLE_ROW, OR.TIPPLE[1], OR.TIPPLE_ROW, 0, 1),
      sagPts(OR.TIPPLE[1], OR.TIPPLE_ROW, 268.75, OR.FOOT_ROW, 1)) },
    /* THE DOWN LINE crosses the chute on its way back up to the tower's middle deck, and it comes back LOADED WITH GOBLINS */
    { id: 'down', speed: 58, gap: 128, ret: 220, riders: true, pts: sagPts(268.5, OR.FOOT_ROW, 203.25, OR.TOWER[1], 2) },
    /* THE STEEP LINE: up out of the gorge to the winch house over a second pillar, and every third bucket is rust that will not hold you */
    { id: 'steep', speed: 58, gap: 96, ret: 200, cracked: 3, pts: join(
      sagPts(352.5, OR.PILLAR[1], OR.PILLAR_BX[0], OR.PILLAR_B, 2), sagPts(OR.PILLAR_BX[0], OR.PILLAR_B, OR.PILLAR_BX[1], OR.PILLAR_B, 0, 1),
      sagPts(OR.PILLAR_BX[1], OR.PILLAR_B, 408.75, OR.WINCH, 2)) },
    /* THE DRUM LINE: the arena's, into the great drum. The Winchmaster REVERSES it, sends buckets down it, and a rider jams it */
    { id: 'drum', speed: 52, gap: 80, ret: 160, drum: true, pts: [[480.5 * TS, surf(A.deck)], [A.ledge[0] * TS, surf(A.deck)]] },
  ];
}
/* the state the level carries (L.cable): each line with its measured length and its clock */
export function makeCableway(lines) {
  return { lines: lines.map(l => { const seg = []; let len = 0;
    for (let i = 1; i < l.pts.length; i++) { const d = Math.hypot(l.pts[i][0] - l.pts[i - 1][0], l.pts[i][1] - l.pts[i - 1][1]); seg.push(d); len += d; }
    const n = Math.max(2, Math.ceil((len + l.ret) / l.gap)); return { ...l, seg, len, n, total: n * l.gap, t: 0, dir: 1, mul: 1, jam: 0 }; }) };
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
/* is this the bucket a rider can ride INTO the drum on: out on the drum line, and within a bucket's width of its end */
export const atDrum = (line, i) => { const s = bucketS(line, i); return line.drum && line.dir > 0 && s < line.len && s > line.len - 10; };
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
  ent('check', 5, YARD); ent('check', 34, YARD); ent('check', 64, YARD);
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
  block(232, 244, WRECK_BED + 3, H - 1); spikes(232, 244, WRECK_BED + 2);
  plat(TIPPLE[0], TIPPLE_ROW + 1, TIPPLE[1] - TIPPLE[0] + 1);                   // THE TIPPLE HOUSE: the one rest on the chute
  plat(231, TIPPLE_ROW - 3, 8); rope(230, TIPPLE_ROW - 3, TIPPLE_ROW);          // and the tipping stage over it, with the ladder up
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
  ent('check', 414, WINCH); ent('check', 446, WINCH); ent('check', 468, WINCH);
  ent('sign', 430, WINCH, { text: 'THE DRUM HOUSE. NOTHING STOPS THE DRUM BUT A BUCKET WITH SOMEONE IN IT.' });
  meet('THE WINCH CREW', 410, 444, [['miner', 410, WINCH], ['rockgoblin', 436, WINCH], ['sheargob', 419, WINCH - 4]]);
  meet('THE DRUM YARD', 448, 475, [['heavy', 455, WINCH], ['gaffer', 462, WINCH], ['sheargob', 459, WINCH - 4], ['javelin', 466, WINCH]]);
  ent('tippler', 428, WINCH - 7, { face: -1 }); ent('tippler', 460, WINCH - 9, { face: -1 });   /* the frames on the two roofs: each has the yard under it */
  coins([419, WINCH - 4], [432, WINCH - 1], [458, WINCH - 4], [464, WINCH - 1]);

  // ---- THE DRUM HOUSE (c 476-523): the arena. His rework is stage two; this is the room it was, moved east ----
  block(A.ledge[0], A.ledge[1], A.deck + 1, A.deck + 2);                        // the drum's ledge, reached by bucket only
  block(A.house[0], W - 1, A.housing + 1, H - 1);                               // the housing: he stands on it
  block(A.x1, W - 1, 0, H - 1);
  block(481, A.house[0] - 1, A.spoil + 1, H - 1);                               // THE SPOIL HEAP under the drop AND the drum's ledge: a fall costs a climb, not a life
  rope(482, A.walk + 2, A.spoil);   /* up under the FIRST catwalk's west end: jump up through it, or - if he has cut it - step west onto the deck.
                                       Never at the line's mouth (he sends buckets there), never under a catwalk that can be cut out from over
                                       it with nowhere else to go, never beside a catwalk's east end where you drop onto a bucket */
  for (const [a, b] of A.spans) for (let x = a; x <= b; x++) set(x, A.walk + 1, T.PLANK);   /* the catwalks: HE CUTS THEM */
  ent('winchmaster', 514, A.housing, { face: -1 });
  ent('sign', 477, A.deck, { text: 'RIDE A BUCKET INTO THE DRUM AND IT JAMS. HE WILL TRY TO STOP YOU.' });

  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);   /* every rope is hung last (the Gale Moor bug) */
  const cable = cableLines();
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: YARD }, pools: [], falls: [], moversExtra: [], interiors: [], gusts: [],
    music: 'mineworks', duskStart: -1, duskLen: 1, night: false,
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
    palette: { sky: [[120, 150, 190], [228, 214, 190]], far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(210,200,190,0.16)',
      grass: '#7a8a4a', grassL: '#9aaa5a', grassD: '#4a5a2a', dirt: '#5e5446', dirtL: '#766a58', dirtD: '#3c342a', canopy: ['#5a6070', '#747a88', '#9098a4', '#b8bcc4'] },
    weather: [{ x0: 0, x1: 99999, kind: 'dust' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
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
  /* THE DRUM HOUSE: the great drum at the housing's west face, turning with the line, and the gantry over it */
  const A = OR.ARENA;
  if (on(A.ledge[0] - 4, A.x1)) { const dx = A.house[0] * TS - cx, dy = surf(A.deck) - OR.BUCKET.hang - cy, r = 22;
    beam(dx - 4, surf(A.housing) - cy - 60, (A.x1 - A.house[0]) * TS + 8, 6); for (const x of [dx, dx + 60, dx + 124]) beam(x, surf(A.housing) - cy - 56, 5, 56);
    g.fillStyle = IRON[0]; g.beginPath(); g.arc(dx, dy, r + 3, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON[1]; g.beginPath(); g.arc(dx, dy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = IRON[2]; for (let q = 0; q < 8; q++) { const an = (drumAng || 0) + q * Math.PI / 4; g.fillRect(Math.round(dx + Math.cos(an) * (r - 4)) - 2, Math.round(dy + Math.sin(an) * (r - 4)) - 2, 4, 4); }
    g.fillStyle = IRON[3]; g.beginPath(); g.arc(dx, dy, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c9a44a'; for (let q = -r + 4; q < r - 4; q += 3) g.fillRect(dx - 2 + Math.round(Math.sin(q + (drumAng || 0) * 3)), dy + q, 1, 2); }   /* the cable wound on it */
}
/* THE FAR SIDE: the castle she keeps on the peak, and the cableway's pylons marching to it across the far gorge - drawn in the sky layer */
export function drawOreBackdrop(g, VW, VH, cx, time) {
  const hz = Math.round(VH * 0.62), par = cx * 0.06;
  g.fillStyle = '#8a92a4'; g.globalAlpha = 0.55;
  for (let k = 0; k < 7; k++) { const x = Math.round(((k * 150 - par) % (VW + 300)) - 60), h = 26 + (k % 3) * 12; g.fillRect(x, hz - h, 3, h); g.fillRect(x - 6, hz - h, 15, 2); }
  g.fillStyle = '#6a7284'; for (let x = -10; x < VW + 10; x += 2) { const y = hz - 38 + Math.round(Math.sin((x + par) * 0.013) * 4); g.fillRect(x, y, 2, 1); }
  g.globalAlpha = 0.7; g.fillStyle = '#5a6274'; const kx = Math.round(VW * 0.78 - par * 0.3), ky = hz - 70;   /* HIGHCROWN on its peak */
  g.fillRect(kx - 40, ky + 20, 80, 50); g.fillRect(kx - 30, ky - 6, 12, 30); g.fillRect(kx + 14, ky - 14, 14, 38); g.fillRect(kx - 8, ky - 2, 16, 24);
  for (let q = 0; q < 6; q++) g.fillRect(kx - 40 + q * 14, ky + 16, 8, 4);
  g.fillStyle = '#e8c070'; g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 2); g.fillRect(kx + 19, ky - 4, 3, 4); g.fillRect(kx - 26, ky + 6, 2, 3);
  g.globalAlpha = 1;
}
