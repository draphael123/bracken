// witchlight.js — THE WITCHLIGHT STAIR, REDESIGNED (2026-09-22). Brief: .claude/briefs/witchlight-redesign.md.
// Daniel played the first build (1cfd6c7): "mostly just climb and go right with a massive enemy gauntlet. Visually it looks like
// a repeat, and there's nothing cool or unique about it." So: FIVE PLACES, each built round ONE piece of the loose magic, then all
// three at the top. Enemies are ENCOUNTERS of 3-5 round the place's verb, with quiet between (no GARRISON sprinkle: Daniel agreed).
// The layout is the greybox measured on claude/prep (src/draft/witchlight-v2.js, tools/witchlight-v2.mjs), dressed.
//   c 0-49     1 THE BRAMBLE FOOT         out of the cavern mouth into dusk; a slab over the brambles; the first rune column
//   c 50-139   2 THE DRIFTING AQUEDUCT    its arches hang in the air as slabs: sliders, one that SINKS under you, one that rises;
//                                         BROOMS sweep you off; a fall lands in the gorge and a rope up each pier brings you back
//   c 140-219  3 THE UPSIDE-DOWN CLOISTER brambles fill the floor, so you walk the ROOF: glyph up, glyph down onto a safe pocket,
//                                         up again (the Folly's toggle glyphs); ARMOUR that walks the ceiling with you
//   c 220-259  4 THE RUNE STAIR           the one vertical: three rune columns lit one after another, imps riding them with you,
//                                         a floating chunk of the tower's library
//   c 250-332  5 THE TOPIARY MAZE         hedges to go under and over, then THE HEDGE WARDEN at the gate between his braziers
//   c 333-429    THE STAIR'S TOP          a last rune column onto THE GATE GARGOYLE's slabs, some CRACKED, over the garden terrace
// THE LIGHT changes by place (dusk -> twilight -> witchlight night: L.tints + a dusk grade kept under 0.45), its own runed stone
// (src/redraw/witch_world.js), one landmark a place (the arches, the colonnade, the library chunk, the orrery ring, the tower),
// loose-magic motes and witchlight ribbons that grow stronger as you climb, and the tower in the backdrop growing place by place.
export const WL = {
  W: 430, H: 92, FOOT: 80, PIER: 76, GORGE: 88, ROOF: [66, 69], GARDEN: 40,   /* the cloister's roof: its underside six rows over the floor, in the same frame as the brambles */
  PLACES: { foot: [0, 49], aqueduct: [50, 139], cloister: [140, 219], runestair: [220, 259], garden: [250, 332], top: [333, 429] },
  PIERS: [[50, 53], [78, 82], [106, 110], [134, 139]],
  BRAMBLES: [[150, 165], [176, 192], [200, 211]],
  GLYPHS: [[147, 169], [173, 194], [198, 214]],          // [up (on the floor), down (under the roof)]
  MINI: { x0: 300, x1: 331, gate: 332, wallL: 299, braziers: [305, 326] },
  ARENA: { x0: 346, x1: 425 },
  SLABS: [[349, 30, { speed: 14 }], [357, 28, { cracked: true }], [364, 29, { speed: 12 }], [372, 28, { cracked: true }], [379, 30, { speed: 16 }],
    [387, 28, { cracked: true }], [394, 29, { speed: 13 }], [402, 28, { cracked: true }], [409, 30, { speed: 15 }], [417, 29, { speed: 10 }]],
  LIFTS: [[362, 0], [392, 1.5], [407, 3]],               // rune columns from the terrace, under the gaps between the slabs
  LIGHT: [[0, 139, 'dusk'], [140, 259, 'twilight'], [260, 429, 'witchlight']],
  STEPS: [0, 50, 140, 220, 262, 333],                    // where the tower in the backdrop takes a step nearer
  MARKS: { cavern: 4, aqueduct: 92, colonnade: 180, library: 243, orrery: 316, tower: 426 },
};

export function buildWitchlight({ painter, T, TS }) {
  const { W, H, FOOT, PIER, GORGE, GARDEN: G } = WL;
  const L = painter(W, H), { set, block, plat, ent, coins } = L;
  const fill = (x0, x1, y0, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  const ropes = [], encounters = [], glyphBridges = [], hedges = [], skins = [];
  const rope = (x, y0, y1) => ropes.push([x, y0, y1]);
  const rune = (x, row, top, phase = 0) => ent('vent', x, row, { rune: true, h: (row + 1 - top) * TS, period: 4.4, on: 2.4, lift: 200, w: 16, phase });
  const slab = (x, row, o) => ent('mover', x, row, Object.assign({ len: 3, slab: true, speed: 30 }, o));
  /* AN ENCOUNTER: a named group of 3-5 on one stretch, built round its place's verb, with quiet either side of it */
  const meet = (name, x0, x1, foes) => { encounters.push({ name, x0, x1, n: foes.length }); for (const [t, x, row, o] of foes) ent(t, x, row, Object.assign({ face: -1, enc: name }, o || {})); };
  const ledge = (x, y, n) => { plat(x, y, n); skins.push([x, x + n - 1, y, y, 'ledge']); };   /* a one-way ledge in the runed stone, not a plank */
  const dead = (t, x, row) => ent(t, x, row, { face: -1, straggler: true });   /* the dead that followed you up, one or two in the quiet */

  // ---- 1. THE BRAMBLE FOOT (c 0-49) ----
  block(0, 49, FOOT + 1, H - 1); block(0, 9, 0, FOOT - 6);                      // the hill; the cavern's roof, you come out from under it
  fill(22, 33, FOOT + 1, FOOT + 5, T.AIR);
  fill(25, 30, FOOT + 5, FOOT + 5, T.SPIKE); plat(22, FOOT + 3, 2); plat(32, FOOT + 3, 2);   /* THE BRAMBLES in a ravine: hurt, not death */
  slab(22, FOOT + 1, { range: 9 });                                                 // the first slab, level with the road
  rune(40, FOOT, FOOT - 11); ledge(37, FOOT - 9, 7); ent('silver', 42, FOOT - 10); coins([38, FOOT - 10], [40, FOOT - 10]);
  block(44, 46, FOOT - 1, FOOT); block(47, 49, FOOT - 3, FOOT);                   // two steps up to the aqueduct's first pier
  ent('check', 45, FOOT - 2);
  ent('sign', 12, FOOT, { text: 'THE TOWER STAIR. ITS LOOSE SPELLS: SLABS DRIFT, RUNES LIFT, GLYPHS TURN YOU OVER.' });
  ent('sign', 35, FOOT, { text: 'STAND IN A RUNE COLUMN WHILE IT GLOWS AND IT LIFTS YOU.' });
  coins([23, FOOT - 1], [27, FOOT - 1], [31, FOOT - 1]);
  meet('THE CAVERN MOUTH', 12, 20, [['zombie', 14, FOOT], ['zombie', 18, FOOT], ['bonearcher', 20, FOOT]]);
  meet('THE FIRST COLUMN', 35, 44, [['bonegob', 36, FOOT], ['imp', 41, FOOT - 14], ['zombie', 43, FOOT]]);

  // ---- 2. THE DRIFTING AQUEDUCT (c 50-139) ----
  for (const [a, b] of WL.PIERS) { block(a, b, PIER + 1, H - 1); skins.push([a, b, PIER + 1, H - 1, 'witch']); }   // the surviving piers
  block(54, 133, GORGE + 1, H - 1);                                                 // the gorge floor under the gaps
  slab(54, PIER + 1, { range: 8 }); slab(66, PIER + 1, { range: 9 });                 // gap 1: two sliders that meet in the middle
  slab(83, PIER + 1, { len: 4, range: 1, speed: 4, sink: true });                   // gap 2: a slab that SINKS while you stand on it
  slab(88, PIER + 3, { vert: true, rise: 5, period: 4.6 });                          //        one that rises to the arch
  ledge(92, PIER - 3, 5);                                                             //        a stretch of the arch, still hanging
  slab(97, PIER + 1, { range: 6 });                                                  //        and a slider on to the pier
  slab(111, PIER + 1, { range: 10, speed: 26 }); slab(123, PIER + 1, { range: 8, speed: 40 });   // gap 3: two, out of step
  for (const [a] of WL.PIERS.slice(1)) rope(a - 1, PIER + 1, GORGE);                  // a rope up each pier's face out of the gorge
  ent('check', 80, PIER); ent('check', 108, PIER);
  ent('sign', 51, PIER, { text: "THE AQUEDUCT'S ARCHES FLOAT. SOME SINK UNDER YOU. A FALL IS A CLIMB BACK UP." });
  coins([57, PIER - 1], [61, PIER - 1], [69, PIER - 1], [93, PIER - 4], [95, PIER - 4], [115, PIER - 1], [126, PIER - 1]);
  meet('THE BROOMS OVER THE FIRST GAP', 54, 82, [['broom', 60, PIER - 5, { sweep: true }], ['broom', 72, PIER - 6, { sweep: true }], ['zombie', 80, PIER], ['bonearcher', 82, PIER]]);
  meet('THE DEAD IN THE GORGE', 96, 104, [['zombie', 96, GORGE], ['husk', 100, GORGE], ['zombie', 104, GORGE]]);
  meet('THE SECOND PIER', 106, 110, [['husk', 108, PIER], ['imp', 109, PIER - 5], ['bonegob', 110, PIER]]);
  meet('THE WIDE GAP', 111, 139, [['broom', 118, PIER - 5, { sweep: true }], ['broom', 128, PIER - 6, { sweep: true }], ['zombie', 137, PIER], ['bonearcher', 139, PIER]]);

  // ---- 3. THE UPSIDE-DOWN CLOISTER (c 140-219) ----
  block(140, 219, PIER + 1, H - 1); block(142, 217, WL.ROOF[0], WL.ROOF[1]);        // its floor and its roof (TILES: the flip needs a tile ceiling)
  skins.push([140, 219, PIER + 1, H - 1, 'witch'], [142, 217, WL.ROOF[0], WL.ROOF[1], 'witch']);
  for (const [a, b] of WL.BRAMBLES) fill(a, b, PIER, PIER, T.SPIKE);                 // brambles: you do not walk this floor
  for (const [u, d] of WL.GLYPHS) { ent('glyph', u, PIER); ent('glyph', d, WL.ROOF[1] + 1, { ceiling: true }); glyphBridges.push([u, d, PIER + 1]); }   /* reachcore: over the brambles on the roof */
  ent('check', 143, PIER); ent('check', 171, PIER);
  ent('sign', 141, PIER, { text: 'THE FLOOR IS BRAMBLE. A GLYPH TURNS YOU OVER: WALK THE ROOF TO THE NEXT GLYPH.' });
  coins([155, WL.ROOF[1] + 2], [159, WL.ROOF[1] + 2], [163, WL.ROOF[1] + 2], [180, WL.ROOF[1] + 2], [190, WL.ROOF[1] + 2], [204, WL.ROOF[1] + 2], [208, WL.ROOF[1] + 2]);
  meet('THE ARMOUR ON THE ROOF', 150, 170, [['armour', 156, WL.ROOF[1] + 1, { ceiling: true }], ['armour', 164, WL.ROOF[1] + 1, { ceiling: true }], ['imp', 160, PIER - 3], ['zombie', 170, PIER]]);
  meet('THE SECOND WALK', 176, 199, [['armour', 184, WL.ROOF[1] + 1, { ceiling: true }], ['imp', 188, PIER - 3], ['husk', 196, PIER]]);
  meet('THE CLOISTER DOOR', 200, 219, [['armour', 206, WL.ROOF[1] + 1, { ceiling: true }], ['apprentice', 216, PIER], ['zombie', 218, PIER]]);

  // ---- 4. THE RUNE STAIR (c 220-259, rows 76 -> 40) ----
  block(220, 221, 36, PIER - 6); block(220, 249, PIER + 1, H - 1);                   // its west wall (the cloister comes in under it), its floor
  block(250, 259, G + 1, H - 1);                                                     // the garden's edge is its east wall
  skins.push([220, 221, 36, PIER - 6, 'witch'], [220, 249, PIER + 1, H - 1, 'witch'], [250, 259, G + 1, PIER + 1, 'witch']);
  rune(226, PIER, 62, 0); ledge(228, 63, 11);                                         // three columns, staggered: ride one, step
  rune(237, 62, 49, 1.5); ledge(240, 51, 9);                                          // into the next as it lights
  rune(247, 50, 37, 3.0);
  block(241, 244, 42, 44); skins.push([241, 244, 42, 44, 'books']); ent('silver', 243, 41);   /* THE LIBRARY CHUNK floats in the shaft */
  ent('check', 224, PIER); ent('check', 242, 50);
  ent('sign', 223, PIER, { text: 'THE RUNE STAIR. THE COLUMNS LIGHT ONE AFTER ANOTHER: RIDE ONE AND STEP INTO THE NEXT.' });
  coins([230, 62], [234, 62], [242, 50], [246, 50]);
  meet('THE STAIR FOOT', 222, 240, [['zombie', 230, PIER], ['husk', 234, PIER], ['bonearcher', 234, 62]]);
  meet('THE IMPS IN THE SHAFT', 222, 249, [['imp', 228, 70], ['imp', 238, 57], ['imp', 244, 46]]);

  // ---- 5. THE TOPIARY MAZE and THE GARDEN GATE (c 250-332, row 40) ----
  const M = WL.MINI;
  block(250, 429, G + 1, H - 1);
  const hedge = (x0, x1, y0, y1) => { block(x0, x1, y0, y1); hedges.push([x0, x1, y0, y1]); };
  hedge(262, 270, G - 7, G - 3);                                                     // a tall hedge you go UNDER (three rows)
  hedge(275, 276, G - 1, G);                                                         // a low one you hop
  hedge(280, 288, G - 5, G - 3); plat(278, G - 2, 2); ent('silver', 284, G - 6);     // a tall one you go UP (silver 3 on top)
  hedge(292, 293, G - 1, G);
  ent('check', 256, G); ent('check', 296, G);
  ent('sign', 257, G, { text: 'THE TOWER GARDEN. GO UNDER THE TALL HEDGES AND OVER THE SHORT ONES.' });
  coins([265, G - 1], [268, G - 1], [282, G - 6], [286, G - 6]);
  meet('THE TOPIARY', 260, 294, [['topiary', 266, G], ['topiary', 278, G], ['armour', 286, G - 6], ['topiary', 290, G]]);
  meet('THE HEDGE-TOP IMPS', 270, 290, [['imp', 272, G - 9], ['imp', 283, G - 11], ['apprentice', 294, G]]);
  ent('hedgewarden', 318, G, { face: -1, mini: true });
  hedge(M.gate - 1, M.gate + 2, G - 12, G - 5); for (let y = G - 4; y <= G; y++) set(M.gate, y, T.PORT);   /* the gate: it lifts when he falls */
  ent('sign', 298, G, { text: 'THE GARDEN GATE. ITS WARDEN IS CUT FROM THE HEDGE, AND HE GROWS BACK FROM THE STUMP.' });

  // ---- THE STAIR'S TOP (c 333-429): onto the Gargoyle's slabs ----
  rune(340, G, 25); ledge(342, 27, 8);                                                // the last column, up to the arena's lip
  /* THE GARGOYLE'S SLABS: a chain of them over the garden terrace, a short hop apart, solid ones drifting a little and CRACKED ones
     (his opening) held still between them. A fall lands on the terrace; three rune columns under the gaps lift you back up. */
  for (const [x, row, o] of WL.SLABS) slab(x, row, Object.assign({ arena: true, len: o.cracked ? 4 : 5, range: o.cracked ? 0 : 2 }, o));
  for (const [x, ph] of WL.LIFTS) rune(x, G, 26, ph);
  block(426, 429, 0, H - 1); skins.push([426, 429, 0, H - 1, 'tower']);            // the tower's foot
  ent('gargoyle', 422, 23, { face: -1 });                                            // bolted over the gate: the level ends on his fall
  ent('check', 336, G);
  ent('sign', 334, G, { text: "THE STAIR'S TOP. SOMETHING IS BOLTED OVER THE TOWER GATE, AND IT IS AWAKE." });
  coins([343, 26], [347, 26]);

  // the dead that followed you up, in the quiet between the encounters
  dead('zombie', 64, GORGE); dead('husk', 124, GORGE);   /* (in the gorge: a fall costs a fight) */
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);   /* EVERY ROPE IS HUNG LAST (the Gale Moor bug) */
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: FOOT }, pools: [], falls: [], moversExtra: [], interiors: [], gusts: [],
    music: 'witchlight', duskStart: 0, duskLen: W * TS * 2.35,   /* the dusk grade deepens to ~0.43 at the top, under the engine's 0.45: greens stay green */
    hasCryst: false, encounters, places: WL.PLACES, marks: WL.MARKS, light: WL.LIGHT,
    tints: [[140, 259, [52, 44, 120], 0.13], [260, 429, [30, 18, 72], 0.24]],   /* THE LIGHT BY PLACE: twilight in the cloister and the shaft, witchlight night in the garden and on top */
    witch: { steps: WL.STEPS, braziers: WL.MINI.braziers.map(x => [x, G]), piers: WL.PIERS, roof: WL.ROOF, pier: PIER, garden: G, library: [241, 244, 42, 44] },
    glyphBridges,                                                                    // the reach model's footing for a glyph crossing (reachcore.js)
    mage: { shelves: [], skins, hedges, chains: [], hung: [], outside: 200 },        /* the Folly's machinery runs the glyphs and draws the skins */
    palette: { sky: [[64, 46, 96], [236, 150, 112]], far: 'mage', mid: 'mage', near: 'none', dress: 'village', haze: 'rgba(200,120,160,0.08)',
      grass: '#5a6a4a', grassL: '#7c8c5c', grassD: '#3a4632', dirt: '#5a4c5a', dirtL: '#76647a', dirtD: '#382e3c', canopy: ['#2a2238', '#3a2e4a', '#4e3a5c', '#6a4a6e'] },
    weather: [{ x0: 0, x1: 140 * TS, kind: 'leaves' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    arena: { x0: WL.ARENA.x0 * TS, x1: WL.ARENA.x1 * TS, floor: (G + 1) * TS, y0: 12 * TS, top: 28 * TS, trigger: (WL.ARENA.x0 + 4) * TS, wallL: WL.ARENA.x0 - 1, wallR: WL.ARENA.x1, boss: 'gargoyle', music: 'boss4' },
    mini: { x0: M.x0 * TS, x1: (M.x1 + 1) * TS, floor: (G + 1) * TS, y0: (G - 12) * TS, y1: (G + 2) * TS, trigger: (M.x0 + 3) * TS, wallL: M.wallL, gate: M.gate, boss: 'hedgewarden', name: 'THE HEDGE WARDEN' },
    noCoin: [[0, 9, 0, FOOT - 6], [140, 219, 0, WL.ROOF[0] - 1]],
  };
}

/* ---------- THE LOOK ---------- */
const clamp01 = v => Math.max(0, Math.min(1, v));
/* how far up the stair the hero is, 0..1: the place he is in, eased across its width (the light, the ribbons, the motes use it) */
export function stairProgress(L, tx) { const S = (L.witch && L.witch.steps) || WL.STEPS, n = S.length; let k = 0;
  for (let i = 0; i < n; i++) if (tx >= S[i]) k = i + clamp01((tx - S[i]) / ((i + 1 < n ? S[i + 1] : L.W) - S[i])) * 0.99; return clamp01(k / (n - 1)); }
/* how many steps nearer the tower is (0..steps-1): drawWitchTower's k */
export const towerStep = (L, tx) => { const S = (L.witch && L.witch.steps) || WL.STEPS; return Math.max(0, S.filter(s => tx >= s).length - 1); };

/* THE TOWER IN THE BACKDROP GROWS PLACE BY PLACE. `k` is how many steps the hero is over (0..n-1, eased by the caller); the tower
   is the Hexed Fields' own tower art (fa().tower), nearer, bigger and brighter the higher you are. */
export function drawWitchTower(g, art, k, n, VW, VH, dY) {
  if (!art || !art[0]) return;
  const p = Math.max(0, Math.min(1, k / Math.max(1, n - 1))), sc = 0.45 + 0.75 * p, x = Math.round(VW * (0.8 - 0.1 * p)), hz = Math.round(VH + 2 + Math.min(12, dY * 0.01));
  for (let v = 0; v < 2; v++) { const c = art[v]; if (!c) continue; const al = v === 0 ? 0.55 * (1 - p) + 0.2 : 0.85 * p; if (al <= 0.02) continue;
    const w = Math.round(c.width * sc), h = Math.round(c.height * sc); g.globalAlpha = al; g.drawImage(c, x - (w >> 1), hz - h, w, h); }
  g.globalAlpha = 1;
  const wy = hz - Math.round(art[0].height * sc * 0.86); g.globalAlpha = 0.25 + 0.5 * p; g.fillStyle = '#c8a0ff'; g.fillRect(x - 1, wy, 3, 4); g.globalAlpha = 0.12 + 0.2 * p; g.fillRect(x - 5, wy - 3, 11, 10); g.globalAlpha = 1;
}

/* THE SKY OVER THE STAIR: stars come out in the twilight, and WITCHLIGHT RIBBONS - the loose magic seen from under it - hang in
   the sky, stronger the higher you are. Drawn after the sky and the far hills, before the tower. */
export function drawWitchSky(g, p, time, VW, VH, cx) {
  const st = clamp01((p - 0.25) * 1.6);
  if (st > 0.02) for (let i = 0; i < 48; i++) { const x = ((i * 137 + 31) % (VW + 40)) - 20 - ((cx * 0.02) % 40), y = (i * 61 + 7) % Math.round(VH * 0.55), tw = 0.5 + 0.5 * Math.sin(time * (1.3 + (i % 5) * 0.4) + i);
    g.globalAlpha = st * (0.35 + 0.5 * tw); g.fillStyle = i % 7 ? '#e8e0ff' : '#b8ffe0'; g.fillRect(Math.round(x), y, 1, 1); }
  const rb = 0.05 + 0.3 * p;
  for (let k = 0; k < 3; k++) { const base = VH * (0.14 + 0.1 * k), amp = 10 + 6 * k, col = k === 1 ? '#7affc8' : '#b884ff', sp = 0.25 + 0.12 * k;
    for (let x = 0; x < VW; x += 2) { const w = x + cx * (0.04 + 0.02 * k), y = base + Math.sin(w * 0.018 + time * sp + k * 2) * amp + Math.sin(w * 0.006 - time * 0.1 + k) * 14;
      const fade = 0.5 + 0.5 * Math.sin(w * 0.011 + time * 0.7 + k * 1.7); g.globalAlpha = rb * fade * (k === 1 ? 0.7 : 1);
      g.fillStyle = col; g.fillRect(x, Math.round(y), 2, 2 + Math.round(6 * fade)); g.globalAlpha = rb * fade * 0.35; g.fillRect(x, Math.round(y) + 8, 2, 10); } }
  g.globalAlpha = 1;
}

/* ONE LANDMARK A PLACE, drawn in the world behind the tiles: the aqueduct's standing arches, the cloister's colonnade, the clipped
   statues, the wrecked orrery ring hanging over the garden gate. None of it is solid. */
export function drawWitchLandmarks(g, L, cx, cy, time, VW, VH) {
  const TS = 16, W = L.witch; if (!W) return;
  const on = (x0, x1) => x1 * TS - cx > -40 && x0 * TS - cx < VW + 40;
  /* THE AQUEDUCT: each surviving pier still carries its pillar up to the channel, and the arch springs from it and stops short, broken
     where its stones came away and hang in the gap as the slabs you ride. Low enough to stand under: the channel is nine rows up. */
  if (on(40, 150)) { const road = (W.pier + 1) * TS - cy, deck = road - 9 * TS, spring = road - 3 * TS, crown = road - 7 * TS;
    W.piers.forEach(([a, b], i) => { const x = a * TS - cx, w = (b - a + 1) * TS, px0 = x + 6, pw = w - 12;
      g.fillStyle = '#342e48'; g.fillRect(px0, deck, pw, road - deck); g.fillStyle = '#4c4466'; g.fillRect(px0, deck, 2, road - deck); g.fillStyle = '#26203a'; g.fillRect(px0 + pw - 2, deck, 2, road - deck);
      for (let yy = deck + 8; yy < road; yy += 12) { g.fillStyle = '#26203a'; g.fillRect(px0, yy, pw, 1); }
      g.fillStyle = '#b884ff'; g.globalAlpha = 0.35 + 0.2 * Math.sin(time * 1.7 + i); g.fillRect(px0 + (pw >> 1) - 1, spring - 6, 2, 8); g.globalAlpha = 1;   /* a rune seam in the pillar */
      for (const dir of [-1, 1]) { if ((i === 0 && dir < 0) || (i === W.piers.length - 1 && dir > 0)) continue;
        const sx = dir > 0 ? px0 + pw : px0, half = 12 * TS, reach = 60 + ((i * 23 + (dir > 0 ? 7 : 19)) % 40);
        for (let d = 0; d < reach; d += 2) { const y = Math.round(spring - (spring - crown) * Math.sin(Math.min(1, d / half) * Math.PI / 2)), xx = sx + dir * d - (dir < 0 ? 2 : 0);
          g.fillStyle = '#342e48'; g.fillRect(xx, deck, 2, y - deck); g.fillStyle = '#4c4466'; g.fillRect(xx, y - 2, 2, 2); g.fillStyle = '#5e5678'; g.fillRect(xx, deck, 2, 2);
          if (d % 12 === 0) { g.fillStyle = '#26203a'; g.fillRect(xx, deck + 5, 2, y - deck - 8); } }
        /* the broken end: ragged stones, and the channel's water stopped mid-fall where the spell caught it */
        const ex = sx + dir * reach, ey = Math.round(spring - (spring - crown) * Math.sin(Math.min(1, reach / half) * Math.PI / 2));
        g.fillStyle = '#26203a'; for (let q = 0; q < 4; q++) g.fillRect(ex + dir * (q % 2) * 2 - 1, deck + q * 5, 3, 6);
        g.globalAlpha = 0.6; g.fillStyle = '#9ad0e8'; for (let q = 0; q < 6; q++) g.fillRect(ex + dir * (2 + (q % 2)), deck + 2 + q * 6 + Math.round(Math.sin(time * 2 + q + i)), 1, 4); g.globalAlpha = 1;
        g.globalAlpha = 0.25; g.fillStyle = '#e0c8ff'; g.fillRect(ex + dir * 2 - 2, ey - 4, 5, 5); g.globalAlpha = 1; } }); }
  /* THE COLONNADE: pillars from the floor to the roof, round arches under it */
  if (on(138, 222)) { const y0 = (W.roof[1] + 1) * TS - cy, y1 = (W.pier + 1) * TS - cy;
    for (let c = 144; c <= 216; c += 8) { const x = c * TS + 4 - cx; if (x < -30 || x > VW + 30) continue;
      g.fillStyle = '#2a2438'; g.fillRect(x, y0, 8, y1 - y0); g.fillStyle = '#403856'; g.fillRect(x, y0, 2, y1 - y0); g.fillStyle = '#1c1828'; g.fillRect(x + 7, y0, 1, y1 - y0);
      g.fillStyle = '#403856'; g.fillRect(x - 2, y0, 12, 3); g.fillRect(x - 2, y1 - 4, 12, 4);
      g.fillStyle = '#2a2438'; for (let d = 0; d < 120; d += 2) { const k = d / 120, h = Math.round(Math.sin(k * Math.PI) * 14); g.fillRect(x + 8 + d, y0, 2, 22 - h); }
      g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 2 + c); g.fillStyle = '#b884ff'; g.fillRect(x + 3, y0 + 14, 2, 3); g.globalAlpha = 1; } }
  /* THE CLIPPED STATUES: a bird, a knight and a ball in yew, dark against the garden wall */
  if (on(250, 300)) for (const [c, kind] of [[258, 'bird'], [273, 'knight'], [289, 'ball']]) { const x = c * TS - cx, y = (W.garden + 1) * TS - cy;
    g.fillStyle = '#1e3020'; g.fillRect(x + 4, y - 10, 8, 10);
    if (kind === 'ball') { g.beginPath(); g.arc(x + 8, y - 22, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2c4830'; g.fillRect(x + 2, y - 30, 6, 3); }
    else if (kind === 'bird') { g.fillRect(x - 6, y - 30, 26, 18); g.fillRect(x + 14, y - 40, 10, 12); g.fillRect(x + 22, y - 36, 6, 3); g.fillRect(x - 12, y - 36, 10, 8); g.fillStyle = '#2c4830'; g.fillRect(x - 6, y - 30, 26, 2); }
    else { g.fillRect(x - 2, y - 44, 20, 34); g.fillRect(x + 2, y - 54, 12, 10); g.fillRect(x + 18, y - 58, 3, 40); g.fillStyle = '#2c4830'; g.fillRect(x - 2, y - 44, 20, 2); g.fillRect(x + 2, y - 54, 12, 2); }
    g.fillStyle = '#2c4830'; for (let q = 0; q < 26; q++) { const qx = x - 8 + ((q * 7 + c) % 30), qy = y - 12 - ((q * 11 + c * 3) % 44); g.fillRect(qx, qy, 2, 1); } }   /* (the clip marks, which the dark eats a little) */
  /* THE ORRERY RING over the garden gate: brass, tilted, hung from a broken chain, its three worlds still going round */
  { const ox = 318 * TS - cx, oy = (W.garden - 6) * TS - cy;   /* over the Warden's head, in his room's frame */ if (ox > -140 && ox < VW + 140) {
    g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(ox, oy - 20); g.lineTo(ox + 4, oy - 260); g.stroke();
    for (let yy = oy - 260; yy < oy - 20; yy += 5) { g.fillStyle = '#6a7078'; g.fillRect(ox + Math.round((yy - oy + 260) / 240 * -4) + 3, yy, 2, 3); }
    const tilt = -0.18 + Math.sin(time * 0.4) * 0.03;
    for (const [rx, ry, col, lw] of [[72, 20, '#5a3c14', 5], [72, 20, '#a8782a', 2], [50, 14, '#7a5420', 2]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.ellipse(ox, oy, rx, ry, tilt, 0.15, Math.PI * 2 - 0.35); g.stroke(); }
    g.fillStyle = '#c89a3a'; g.beginPath(); g.arc(ox, oy, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff0b0'; g.fillRect(ox - 2, oy - 3, 2, 2);
    for (let k = 0; k < 3; k++) { const a = time * (0.3 + 0.15 * k) + k * 2.1, r = k === 1 ? [50, 14] : [72, 20], px = Math.cos(a) * r[0], py = Math.sin(a) * r[1], qx = ox + px * Math.cos(tilt) - py * Math.sin(tilt), qy = oy + px * Math.sin(tilt) + py * Math.cos(tilt);
      g.fillStyle = ['#7affc8', '#e0a0ff', '#ffd36b'][k]; g.beginPath(); g.arc(qx, qy, 4 - (k === 2 ? 1 : 0), 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.3; g.beginPath(); g.arc(qx, qy, 8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } } }
}

/* LOOSE MAGIC IN THE AIR: rune motes drifting up, more of them the higher you are. Pushes particles in the engine's shape. */
export function witchMotes(parts, p, dt, cx, cy, VW, VH) {
  const rate = 3 + 22 * p; if (Math.random() > dt * rate) return;
  const x = cx + Math.random() * VW, y = cy + VH * (0.4 + Math.random() * 0.7), green = Math.random() < 0.25 + 0.3 * p;
  parts.push({ x, y, vx: (Math.random() - 0.5) * 10, vy: -12 - Math.random() * 18, life: 2.4, max: 2.4, col: green ? '#9affd8' : Math.random() < 0.5 ? '#e0c8ff' : '#b07cf0', size: Math.random() < 0.2 ? 2 : 1, grav: -4 });
}
/* the books that drift off the library chunk */
export function libraryBooks(parts, W, dt) { if (!W.library || Math.random() > dt * 1.4) return; const [x0, x1, y0] = W.library;
  parts.push({ x: (x0 + Math.random() * (x1 - x0 + 1)) * 16, y: y0 * 16 + 2, vx: (Math.random() - 0.5) * 16, vy: -8, life: 3, max: 3, col: ['#5a2a3a', '#2a4a3a', '#3a2a5a', '#c8a0ff'][(Math.random() * 4) | 0], size: 2, grav: -2 }); }
