// ore-road.js — THE ORE ROAD (2026-09-23). A new crag level between Stormhold and Highcrown (Daniel, 2026-09-22: "a new mountain
// goblin level in the second section"; pitch agreed in work/claude/KICKOFF.md 4@).
// THE GAP IT FILLS IS A FACT, NOT A PLACE: the crags own a slope, ropes, a climb, a moor, a keep, a castle and her mines, and
// nothing said how a castle on a peak is SUPPLIED. This is how: a goblin cableway hauling ore across the gorge to her walls.
// THE UNIQUE FEATURE IS THAT THE LEVEL MOVES. A continuous line of loaded ore buckets arrives on a clock, and for long
// stretches it is THE ONLY FLOOR OVER THE DROP. The game had lifts (one at a time) and pendulums (short arcs) and nothing that
// was a CONVEYOR you time an entry and an exit on.
//
// ONE VERB A PLACE (the Witchlight lesson: places, encounters, never a repeat):
//   c 0-47     THE ORE YARD        on foot. Miners, and the first thrown pick - across a ravine, where a missed one is gone
//   c 48-120   THE FIRST SPAN      RIDE. Board at the loading house, rest on the pylon (its lookouts), ride on to the tower
//   c 121-146  THE SORTING TOWER   CLIMB. Three decks up the trestle; miners throw across its well; a silver on a stuck bucket
//   c 147-231  THE CROSSING        the DOWN LINE crosses yours: its buckets come back carrying goblins, and they swing as they pass
//   c 232-246  THE BRAKEMAN'S PILLAR  a rock in the gorge with a hut on it, and a rope up to the next line
//   c 247-310  THE STEEP LINE      HOP. The rusted buckets give way under you a second after you land: be on the next one
//   c 311-331  THE WINCH HOUSE     the castle side. His crew, and the last checkpoint
//   c 332-379  THE DRUM HOUSE      THE WINCHMASTER (src/winchmaster.js), over the drop, on the housing of the great drum
//
// THE CABLEWAY is pure and lives here: a LINE is a polyline the buckets' tops follow, a speed, and a spacing. Every bucket on a line
// is the same clock offset by its spacing, so they arrive like a clock and not like a spawner. The last stretch of each loop is
// the return, out of sight inside the station houses. main.js turns each bucket into a mover (the rider is carried by the
// engine's own mover code) and calls stepCableway / placeBucket every frame.
export const OR = {
  W: 380, H: 60,
  YARD: 36, TOWER: [36, 28, 21], PILLAR: [29, 20], WINCH: 12,    // standing rows
  PYLON: [82, 86],
  ARENA: { x0: 332, x1: 375, deck: 12, walk: 9, housing: 8, spoil: 22, ledge: [363, 365], house: [366, 374], spans: [[338, 344], [347, 352], [355, 359]] },
  PLACES: { yard: [0, 47], span1: [48, 120], tower: [121, 146], crossing: [147, 231], pillar: [232, 246], steep: [247, 310], winch: [311, 331], drum: [332, 379] },
  /* THE BUCKET IS THREE TILES WIDE. It was 24 px and the knight is 10-14 across with a blade that reaches further, so there
     was no room on one to step, swing or dodge, and no fight could happen on the level's own floor (Daniel found this; the
     brief's number is 44-48). 46 leaves a tile of deck either side of him. EVERY LINE'S GAP GREW BY THE SAME 22, so the HOLE
     between two buckets - which is the thing you actually hop, and what tools/ore-road.mjs measures against the running jump
     - is exactly what it was. A wider bucket on the old spacing would have made the steep line a continuous bridge */
  BUCKET: { w: 46, h: 6, hang: 30, WAS: 24 },
  CRACK: 0.9,                                                    // how long a rusted bucket holds you
};
const TS = 16;
const surf = row => (row + 1) * TS;                              // a standing row's floor, in pixels
/* a cable between two supports, sagging `sag` rows at its middle (a parabola, which is what a loaded cable looks like at this size) */
function sagPts(x0, r0, x1, r1, sag, n = 10) { const out = [];
  for (let k = 0; k <= n; k++) { const t = k / n; out.push([(x0 + (x1 - x0) * t) * TS, surf(r0 + (r1 - r0) * t) + sag * TS * 4 * t * (1 - t)]); } return out; }
const join = (...parts) => parts.reduce((a, p) => a.concat(a.length ? p.slice(1) : p), []);
/* THE LINES. dir 1 runs the buckets along pts from first to last; ret is the length of the hidden return, in pixels. EVERY LINE ENDS
   THREE-QUARTERS OF A TILE INSIDE ITS DECK: a line that ended on the deck's edge let the bucket go while its rider still straddled
   the lip, and at speed he went down between them (tools/ore-ride.mjs found it) */
/* A LINE IS SPACED BY ITS HOLE, NOT BY ITS GAP. What a player reads and jumps is the air BETWEEN two buckets; the gap is that
   plus a bucket. Writing it this way is what let the bucket grow from 24 px to 46 without changing a single crossing */
const GAP = hole => hole + OR.BUCKET.w;
export function cableLines() {
  const A = OR.ARENA;
  return [
    { id: 'first', speed: 60, gap: GAP(64), ret: 200, pts: join(sagPts(47.5, OR.YARD, 82, OR.YARD, 3), sagPts(82, OR.YARD, 86, OR.YARD, 0, 1), sagPts(86, OR.YARD, 121.75, OR.YARD, 3)) },
    { id: 'crossing', speed: 66, gap: GAP(72), ret: 220, pts: sagPts(146.5, OR.TOWER[2], 232.75, OR.PILLAR[0], 2) },
    /* THE DOWN LINE: back the other way from the brakeman's loft to the tower's middle deck, and it comes back LOADED WITH GOBLINS */
    { id: 'down', speed: 60, gap: GAP(88), ret: 220, riders: true, pts: sagPts(238, OR.PILLAR[1], 145.75, OR.TOWER[1], 2) },
    /* THE STEEP LINE: up out of the gorge to the winch house, and every third bucket is rust that will not hold you */
    { id: 'steep', speed: 58, gap: GAP(48), ret: 200, cracked: 3, pts: sagPts(246.5, OR.PILLAR[1], 311.75, OR.WINCH, 3) },
    /* THE DRUM LINE: the arena's, into the great drum. The Winchmaster REVERSES it, sends buckets down it, and a rider jams it */
    { id: 'drum', speed: 52, gap: GAP(56), ret: 160, drum: true, pts: [[336.5 * TS, surf(A.deck)], [A.ledge[0] * TS, surf(A.deck)]] },
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
export function stepCableway(C, dt) { for (const l of C.lines) { if (l.jam > 0) { l.jam -= dt; continue; } l.t = mod(l.t + dt * l.speed * l.dir * l.mul, l.total); } }
/* bucket i of a line: its distance along the loop, and whether it is out on the cable (vis) or in the return */
export function bucketS(line, i) { return mod(line.t + i * line.gap, line.total); }
export function bucketAt(line, i) { const s = bucketS(line, i); if (s >= line.len) return { s, vis: false, x: 0, y: 0 }; const [x, y] = pointAt(line, s); return { s, vis: true, x, y }; }
/* is this the bucket a rider can ride INTO the drum on: out on the drum line, and within a bucket's width of its end */
export const atDrum = (line, i) => { const s = bucketS(line, i); return line.drum && line.dir > 0 && s < line.len && s > line.len - 10; };

// ============================================================================================ THE LEVEL
export function buildOreRoad({ painter, T }) {
  const { W, H, YARD, TOWER, PILLAR, WINCH } = OR, A = OR.ARENA;
  const L = painter(W, H), { set, block, plat, ent, coins } = L;
  const ropes = [], encounters = [];
  const rope = (x, y0, y1) => ropes.push([x, y0, y1]);
  const meet = (name, x0, x1, foes) => { encounters.push({ name, x0, x1, n: foes.length }); for (const [t, x, row, o] of foes) ent(t, x, row, Object.assign({ face: -1, enc: name }, o || {})); };

  // ---- THE ORE YARD (c 0-47) ----
  block(0, 47, YARD + 1, H - 1);
  for (let y = YARD + 1; y <= YARD + 3; y++) for (let x = 20; x <= 25; x++) set(x, y, T.AIR);   /* THE RAVINE: three rows deep with a floor. A pick missed into it lies at the bottom */
  set(19, YARD + 1, T.SOLID); plat(26, YARD + 3, 1);
  block(8, 12, YARD - 1, YARD);                                               // the spoil heap, a step up
  block(40, 47, YARD - 7, YARD - 7);                                          // the loading house's roof
  ent('sign', 4, YARD, { text: 'THE ORE ROAD. THE BUCKETS COME ON A CLOCK AND THEY ARE THE ONLY FLOOR OVER THE GORGE.' });
  ent('sign', 38, YARD, { text: 'STEP ON AS ONE COMES OUT. IT CARRIES YOU. THE STATION AT THE FAR END TAKES YOU OFF.' });
  ent('check', 30, YARD);
  meet('THE PICK LINE', 14, 34, [['miner', 29, YARD], ['miner', 33, YARD], ['rockgoblin', 10, YARD - 2]]);   /* across the ravine: the first thrown pick */
  coins([21, YARD + 3], [23, YARD + 3], [9, YARD - 2], [11, YARD - 2]);

  // ---- THE FIRST SPAN (c 48-120): the pylon ----
  const [p0, p1] = OR.PYLON;
  plat(p0, YARD + 1, p1 - p0 + 1);                                            // the pylon's deck, level with the buckets' rims: step off, step on
  ent('check', p0 + 2, YARD);
  meet('THE PYLON LOOKOUTS', p0, p1, [['javelin', p0 + 1, YARD], ['sprig', p1, YARD]]);
  meet('THE GORGE CROWS', 60, 118, [['crow', 70, YARD - 6], ['crow', 76, YARD - 8], ['crow', 100, YARD - 6], ['crow', 108, YARD - 9]]);
  coins([66, YARD - 1], [96, YARD - 1], [104, YARD - 1]);

  // ---- THE SORTING TOWER (c 121-146) ----
  block(121, 146, TOWER[0] + 1, H - 1);                                       // the rock it stands on
  plat(121, TOWER[1] + 1, 26); plat(121, TOWER[2] + 1, 26);                   // the middle and top decks (trestle: one-way)
  rope(123, TOWER[2] + 1, TOWER[0]); rope(144, TOWER[1] + 1, TOWER[0]); rope(132, TOWER[2] + 1, TOWER[1]);
  ent('check', 125, TOWER[0]);
  ent('sign', 127, TOWER[0], { text: 'THE SORTING TOWER. THE NEXT LINE LEAVES FROM THE TOP.' });
  meet('THE SORTING FLOOR', 124, 146, [['miner', 136, TOWER[1]], ['miner', 142, TOWER[1]], ['heavy', 140, TOWER[2]], ['sprig', 130, TOWER[0]]]);
  /* SILVER ONE: a bucket that jammed on a spur cable off the tower's east face, over the drop. A jump out and a jump back */
  ent('mover', 150, TOWER[1] - 2, { len: 2, range: 0, speed: 0 }); ent('silver', 150, TOWER[1] - 3);
  coins([128, TOWER[1]], [134, TOWER[2]], [140, TOWER[2]]);

  // ---- THE CROSSING (c 147-231) ----
  meet('THE DOWN LINE', 160, 225, []);                                        // its goblins ride in on the down line's buckets (main.js)
  meet('THE CROSSING CROWS', 170, 220, [['crow', 180, 18], ['crow', 200, 20], ['harpy', 212, 16]]);
  coins([170, 22], [190, 24], [210, 26]);

  // ---- THE BRAKEMAN'S PILLAR (c 232-246) ----
  block(232, 246, PILLAR[0] + 1, H - 1);                                      // the rock
  block(238, 246, PILLAR[1] + 1, PILLAR[0]);                                  // the brakeman's loft on it: both upper lines leave from its top
  rope(237, PILLAR[1] + 1, PILLAR[0]);
  ent('check', 234, PILLAR[0]); ent('check', 243, PILLAR[1]);
  meet("THE BRAKEMAN'S HUT", 232, 246, [['heavy', 236, PILLAR[0]], ['sapper', 244, PILLAR[1]], ['rockgoblin', 240, PILLAR[1]]]);
  ent('sign', 233, PILLAR[0], { text: 'RUSTED BUCKETS GIVE WAY A SECOND AFTER YOU LAND. BE ON THE NEXT ONE.' });

  // ---- THE STEEP LINE (c 247-310) ----
  meet('THE STEEP CROWS', 255, 305, [['crow', 262, 12], ['harpy', 280, 8], ['crow', 296, 6]]);
  ent('mover', 279, 17, { len: 2, range: 0, speed: 0 }); ent('silver', 280, 16);   // SILVER TWO: on a bucket stuck on a spur cable, a jump up off the steep line
  coins([258, 17], [270, 15], [290, 13]);

  // ---- THE WINCH HOUSE (c 311-331) ----
  block(311, 336, WINCH + 1, H - 1);
  block(314, 328, WINCH - 6, WINCH - 6); plat(316, WINCH - 3, 6);             // its roof, and the loft under it
  ent('silver', 318, WINCH - 4);                                              // SILVER THREE: in the loft
  ent('check', 313, WINCH);
  ent('sign', 322, WINCH, { text: 'THE DRUM HOUSE. NOTHING STOPS THE DRUM BUT A BUCKET WITH SOMEONE IN IT.' });
  meet('THE WINCH CREW', 314, 331, [['miner', 320, WINCH], ['miner', 326, WINCH], ['sprig', 330, WINCH]]);

  // ---- THE DRUM HOUSE (c 332-379): the arena ----
  block(A.ledge[0], A.ledge[1], A.deck + 1, A.deck + 2);                      // the drum's ledge, reached by bucket only
  block(A.house[0], W - 1, A.housing + 1, H - 1);                             // the housing: he stands on it
  block(A.x1, W - 1, 0, H - 1);
  block(337, A.house[0] - 1, A.spoil + 1, H - 1);                             // THE SPOIL HEAP under the drop AND the drum's ledge: a fall costs a climb, not a life
  rope(338, A.walk + 2, A.spoil);   /* up under the FIRST catwalk's west end: jump up through it, or - if he has cut it - step west onto the deck.
                                       Never at the line's mouth (he sends buckets there), never under a catwalk that can be cut out from over
                                       it with nowhere else to go, never beside a catwalk's east end where you drop onto a bucket */
  for (const [a, b] of A.spans) for (let x = a; x <= b; x++) set(x, A.walk + 1, T.PLANK);   /* the catwalks: HE CUTS THEM */
  ent('winchmaster', 370, A.housing, { face: -1 });
  ent('sign', 333, A.deck, { text: 'RIDE A BUCKET INTO THE DRUM AND IT JAMS. HE WILL TRY TO STOP YOU.' });

  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);   /* every rope is hung last (the Gale Moor bug) */
  const cable = cableLines();
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: YARD }, pools: [], falls: [], moversExtra: [], interiors: [], gusts: [],
    music: 'mineworks', duskStart: -1, duskLen: 1, night: false,
    cable, encounters, places: OR.PLACES, oreRoad: true,
    /* THE REACH MODEL's footing for a ride (reachcore.js): each line is a band you can board anywhere along and leave anywhere along,
       the way a lift is. It is generous on a sloped line - the tools call this level ASSISTED, and that is the truth */
    cableBridges: cable.map(l => { const xs = l.pts.map(p => p[0]), ys = l.pts.map(p => p[1]); return [Math.floor(Math.min(...xs) / TS), Math.floor((Math.max(...xs) - 1) / TS), Math.floor(Math.min(...ys) / TS), Math.floor(Math.max(...ys) / TS)]; }),
    palette: { sky: [[120, 150, 190], [228, 214, 190]], far: 'crag', mid: 'crag', near: 'crag', dress: 'crag', haze: 'rgba(210,200,190,0.16)',
      grass: '#7a8a4a', grassL: '#9aaa5a', grassD: '#4a5a2a', dirt: '#5e5446', dirtL: '#766a58', dirtD: '#3c342a', canopy: ['#5a6070', '#747a88', '#9098a4', '#b8bcc4'] },
    weather: [{ x0: 0, x1: 99999, kind: 'dust' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: A.x0 * TS, x1: A.x1 * TS, floor: surf(A.deck), y0: 0, trigger: (A.x0 + 3) * TS, wallL: A.x0 - 1, wallR: A.x1, boss: 'winchmaster', music: 'boss3', tint: '#5a4a3a', tintA: 0.06, fx: 'dust' },
    noCoin: [[48, 120, 0, H - 1], [147, 231, 0, H - 1], [247, 310, 0, H - 1], [332, 379, 0, H - 1]],   /* over the drop: the sprinkler must not put coins where only a bucket goes */
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
   giving way shakes; a rider-jammed one at the drum is ringed */
export function drawBucket(g, m, cx, cy, time) {
  if (!m.vis) return;
  const R = m.cracked, pal = R ? RUST : IRON, shake = m.crackT > 0 ? Math.round(Math.sin(time * 60) * Math.min(2, m.crackT * 3)) : 0;
  const x = Math.round(m.x - cx) + shake, y = Math.round(m.y - cy), w = m.w, hang = OR.BUCKET.hang, mid = x + (w >> 1);
  /* THE YOKE. A skip three tiles wide cannot hang off one stem without looking like it is about to tip, so the stem comes down
     to a crossbar and the crossbar to two legs on the rim - which is also what says, from across the room, WHERE YOU CAN STAND */
  const yoke = Math.max(6, (w >> 1) - 6);
  g.fillStyle = IRON[0]; g.fillRect(mid - 1, y - hang, 2, hang - 12); g.fillRect(mid - 4, y - hang - 1, 8, 2);   // the stem and its grip on the cable
  g.fillRect(mid - yoke, y - 12, yoke * 2, 2);                                                                   // the crossbar
  for (const s of [-1, 1]) g.fillRect(mid + s * yoke - (s < 0 ? 0 : 2), y - 11, 2, 11);                           // its legs down to the rim
  g.fillStyle = IRON[2]; g.fillRect(mid - yoke, y - 12, yoke * 2, 1);
  if (R) { g.fillStyle = '#c9463d'; g.fillRect(mid + 1, y - hang + 6, 4, 3); g.fillRect(mid + 3, y - hang + 9, 2, 3); }   /* THE RAG: this one will not hold */
  g.fillStyle = pal[0]; g.fillRect(x, y, w, 2); g.fillRect(x + 1, y + 2, w - 2, 8); g.fillRect(x + 3, y + 10, w - 6, 3);
  g.fillStyle = pal[2]; g.fillRect(x + 1, y, w - 2, 1); g.fillStyle = pal[1]; g.fillRect(x + 2, y + 2, w - 4, 7); g.fillStyle = pal[3]; g.fillRect(x + 2, y + 2, 2, 7);
  g.fillStyle = pal[0]; for (let r = 4; r < w - 4; r += 6) g.fillRect(x + r, y + 3, 1, 1);   // rivets
  if (R) { g.fillStyle = '#1a0e08'; for (let k = 0; k < 3; k++) g.fillRect(x + (w >> 2) + k, y + 3 + k * 3, 1, 3); }   // rust running down it
  if (!m.empty) { g.fillStyle = ORE[1]; g.fillRect(x + 3, y - 1, w - 6, 1); g.fillStyle = ORE[3];
    for (let k = 1; k < 5; k++) g.fillRect(x + Math.round(w * k / 5) - 1, y - 1, k % 2 ? 2 : 1, 1); }   // the heap's bright ore, spread the bucket's width
}
/* THE PYLON, the tower's timber, the brakeman's loft and the drum house: drawn behind the tiles (none of it is solid beyond the tiles) */
export function drawOreStructures(g, L, cx, cy, time, VW, VH, drumAng) {
  const on = (x0, x1) => x1 * TS - cx > -60 && x0 * TS - cx < VW + 60;
  const beam = (x, y, w, h, c = TIMBER) => { g.fillStyle = c[1]; g.fillRect(x, y, w, h); g.fillStyle = c[2]; g.fillRect(x, y, w, 1); g.fillStyle = c[0]; g.fillRect(x, y + h - 1, w, 1); };
  const bottom = VH + 20;
  /* THE PYLON: a braced timber leg from far down in the gorge up to its deck */
  if (on(OR.PYLON[0] - 4, OR.PYLON[1] + 4)) { const x0 = OR.PYLON[0] * TS - cx, x1 = (OR.PYLON[1] + 1) * TS - cx, top = surf(OR.YARD) - cy;
    for (const x of [x0 + 6, x1 - 10]) beam(x, top, 4, bottom - top);
    for (let y = top + 16; y < bottom; y += 28) { g.fillStyle = TIMBER[0]; for (let k = 0; k < 28; k++) { g.fillRect(Math.round(x0 + 8 + (x1 - x0 - 16) * k / 28), y + k, 2, 1); g.fillRect(Math.round(x1 - 10 - (x1 - x0 - 16) * k / 28), y + k, 2, 1); } }
    beam(x0 + 30, top - OR.BUCKET.hang - 8, 20, 6, IRON); beam(x0 + 38, top - OR.BUCKET.hang - 2, 4, OR.BUCKET.hang - 4); }   /* its saddle */
  /* THE SORTING TOWER: posts, braces and a hoist-arm */
  if (on(119, 150)) { const x0 = 121 * TS - cx, x1 = 147 * TS - cx, yTop = surf(OR.TOWER[2]) - cy - 34, yBot = surf(OR.TOWER[0]) - cy;
    for (const x of [x0 + 2, x0 + 136, x1 - 6]) beam(x, yTop, 5, yBot - yTop);
    for (let y = yTop + 20; y < yBot - 10; y += 40) { g.fillStyle = TIMBER[0]; for (let k = 0; k < 40; k++) g.fillRect(Math.round(x0 + 6 + (x1 - x0 - 12) * k / 40), y + k * 0.5, 2, 1); }
    beam(x0 - 4, yTop, x1 - x0 + 8, 5); g.fillStyle = TIMBER[1]; g.fillRect(x0 + 60, yTop - 16, 3, 16); beam(x0 + 40, yTop - 18, 60, 3);
    g.fillStyle = IRON[1]; g.fillRect(x0 + 96, yTop - 15, 1, 20 + Math.round(Math.sin(time) * 2)); g.fillStyle = IRON[0]; g.fillRect(x0 + 93, yTop + 5, 7, 5); }
  /* THE BRAKEMAN'S LOFT: planked walls on the pillar's upper step, a brake wheel on its gable */
  if (on(236, 248)) { const x0 = 238 * TS - cx, y1 = surf(OR.PILLAR[1]) - cy;
    g.fillStyle = TIMBER[0]; g.fillRect(x0 + 8, y1 - 44, 128, 4); for (let x = x0 + 12; x < x0 + 132; x += 10) beam(x, y1 - 40, 3, 6);
    g.fillStyle = IRON[1]; g.beginPath(); g.arc(x0 + 72, y1 - 52, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON[3]; g.fillRect(x0 + 71, y1 - 53, 2, 2); }
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
