// witchlight.js — THE WITCHLIGHT STAIR (batch 4c, 2026-09-22). Brief: .claude/briefs/witchlight-stair.md.
// Daniel: "a level in-between the burial caverns and the mage's folly as a run up to the tower". You come out of the
// caverns' mouth into open dusk and climb the tower's hill by a switchback road: two shafts of stacked terraces, walked
// east and west in turn, about half the level vertical. The tower stands in the backdrop and grows at every bend.
//
// LOOSE MAGIC is the level's mechanic: the Archmage's failed spells leaking down the hill.
//   DRIFTING SLABS   stone held up by a loose spell (movers of kind slab): over the brambles, and up two of the bends
//   RUNE COLUMNS     a rune field that lifts you while it glows (vents, rune: true): up the other bends and to two silvers
//   GRAVITY GLYPHS   brief flips (the Folly's glyph, brief: seconds): you fall UP onto the underside of the road above and
//                    walk it across a gap in your own road, then the spell lets go and drops you on the far side. Miss,
//                    and you land on the road below and walk the bend again - never a death.
// Its creatures: what got out of the tower (imps, brooms, animated armour, the garden's topiary, a dead apprentice) and
// the dead that followed you up from the caverns (zombies, husks, bone archers, bone goblins).
//
//   x 0-61    THE HILL FOOT      the cavern's mouth, a slab over the brambles, the first rune column (silver)
//   x 62-125  THE FIRST STAIR    five terraces, rows 112 -> 76: ledges, a rune column, a glyph gap, a rising slab, ledges
//   x 126-160 THE GARDEN GATE    THE HEDGE WARDEN (src/hedge-warden.js) between two witchlight braziers; his gate lifts
//   x 161-190 THE TOPIARY WALK   the clipped garden, its armour captain, a rune column to a hedge-top silver
//   x 191-251 THE SECOND STAIR   five more, rows 76 -> 40: a rising slab, a rune column, a glyph gap, ledges, a rising slab
//   top       THE STAIR'S TOP    the tower's outer gate (the Gate Gargoyle's arena is the next batch; today the gate is the exit)
export const WITCH = {
  W: 252, H: 120, GROUND: 112,
  // [x0 (the shaft's first open column), x1 (its last), [standing rows, bottom first]]
  SHAFTS: [[64, 123, [112, 103, 94, 85, 76]], [193, 249, [76, 67, 58, 49, 40]]],
  GARDEN: { x0: 128, x1: 159, row: 76, gate: 160, wallL: 127, braziers: [133, 154] },
  GAPS: [[86, 93, 94], [215, 222, 58]],          // the glyph gaps: [x0, x1, standing row]
  TOP: 40,
};

export function buildWitchlight({ painter, T, TS }) {
  const { W, H, GROUND } = WITCH;
  const L = painter(W, H), { set, block, plat, ent, coins, spikes } = L;
  const carve = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const fly = (t, x, row, o) => foe(t, x, row - 5, o);            // a flier hangs five rows over the road it guards
  const rune = (x, row, top, o) => ent('vent', x, row, Object.assign({ rune: true, h: (row + 1 - top) * TS, period: 4.4, on: 2.4, lift: 200, w: 16 }, o || {}));
  const slab = (x, row, o) => ent('mover', x, row, Object.assign({ len: 3, slab: true }, o || {}));
  const glyphs = [], hedges = [], skins = [], bridges = [];
  const glyphGap = ([x0, x1, row]) => { carve(x0, x1, row + 1, row + 3); const a = x0 - 3, b = x1 + 3;
    ent('glyph', a, row, { brief: 3.5 }); ent('glyph', b, row, { brief: 3.5 }); glyphs.push([a, b, row]); bridges.push([a, b, row + 1]); };

  // ---- THE HILL: the ground under the foot, the cavern's mouth, and the tower wall on the far side ----
  block(0, W - 1, GROUND + 1, H - 1);
  block(0, 9, 0, GROUND - 6);                                     // the cavern's roof: you come out from under it
  block(W - 2, W - 1, 0, H - 1);                                  // the tower's foot on the east edge
  skins.push([W - 2, W - 1, 0, WITCH.TOP, 'tower']);

  // ---- 1. THE HILL FOOT (x 0-61) ----
  plat(19, GROUND - 1, 6);                                        // a knoll of fallen stone
  carve(28, 41, GROUND + 1, GROUND + 5); spikes(33, 38, GROUND + 5);   /* THE BRAMBLES in a ravine five deep: hurt, not death */
  plat(28, GROUND + 3, 2); plat(40, GROUND + 3, 2);               // a way up out of it at either side
  slab(28, GROUND + 1, { range: 11, speed: 30 });                 // THE FIRST SLAB, level with the road, over the brambles
  rune(50, GROUND, GROUND - 11); plat(46, GROUND - 9, 9);         // THE FIRST RUNE COLUMN, to a ledge over the road
  ent('silver', 53, GROUND - 10); coins([48, GROUND - 10], [50, GROUND - 10]);
  ent('sign', 12, GROUND, { text: 'THE TOWER STAIR. ITS LOOSE SPELLS: SLABS DRIFT, RUNES LIFT, GLYPHS TURN YOU OVER.' });
  ent('sign', 25, GROUND, { text: 'A LOOSE SPELL HOLDS THIS SLAB UP. RIDE IT OVER THE BRAMBLES.' });
  ent('sign', 46, GROUND, { text: 'STAND IN A RUNE COLUMN WHILE IT GLOWS AND IT LIFTS YOU.' });
  ent('check', 44, GROUND);
  foe('zombie', 16, GROUND); foe('bonearcher', 22, GROUND - 2); fly('imp', 35, GROUND); foe('zombie', 43, GROUND); fly('broom', 57, GROUND); fly('bat', 26, GROUND); foe('bonegob', 55, GROUND);

  // ---- THE STAIRS. A shaft of terraces three rows thick, nine apart, walked east and west in turn: the even ones leave the
  //      east strip open (the bend up is there), the odd ones the west. The bends are laid by hand below. ----
  const shaft = ([x0, x1, rows], wallFrom) => {
    block(x0 - 2, x0 - 1, wallFrom, rows[0] - 6);                 // the cliff on the west side (the road comes in under it)
    rows.slice(1).forEach((r, k) => { const east = k % 2 === 1; block(east ? x0 + 6 : x0, east ? x1 : x1 - 6, r + 1, r + 3); });
  };
  const [S1, S2] = WITCH.SHAFTS;
  shaft(S1, S1[2][4] - 16);
  block(S1[1] + 1, S1[1] + 2, S1[2][4] + 1, H - 1);                 // its east wall, under the garden
  block(S2[0] - 2, W - 1, S2[2][0] + 1, H - 1);                     // the hill under the second stair
  shaft(S2, WITCH.TOP - 8);

  // ---- 2. THE FIRST STAIR (x 64-123, rows 112 -> 76) ----
  { const [x0, x1, [A, B, C, D, E]] = S1;
    plat(x1 - 2, A - 2, 3); plat(x1 - 5, A - 5, 3);               // bend 1, east: ledges, each three rows (the knight's whole jump)
    rune(x0 + 3, B, C - 3);                                       // bend 2, west: a rune column up past the next road
    carve(x1 - 5, x1 - 3, C + 1, C + 3); slab(x1 - 5, C + 1, { vert: true, rise: 9, period: 5.2 });   /* bend 3, east: a slab that rises out of the road */
    plat(x0, D - 2, 3); plat(x0 + 3, D - 5, 3);                    // bend 4, west: ledges
    glyphGap(WITCH.GAPS[0]);                                       // the road at C is broken: the glyphs carry you over
    ent('check', x0 + 3, A); ent('sign', x0 + 7, A, { text: 'THE ROAD TURNS BACK ON ITSELF UP THE HILL. EVERY BEND BRINGS THE TOWER NEARER.' });
    ent('sign', WITCH.GAPS[0][0] - 6, C, { text: 'THE ROAD IS BROKEN. STAND ON THE GLYPH: FALL UP, WALK THE ROAD ABOVE, DROP PAST THE GAP.' });
    ent('check', x0 + 9, C);
    foe('husk', 80, A); foe('zombie', 100, A); fly('bat', 110, A); fly('imp', 90, A);
    foe('zombie', 75, B); foe('bonegob', 92, B); fly('imp', 105, B);
    foe('armour', 76, C); fly('broom', 104, C); foe('zombie', 112, C); foe('zombie', 99, C); foe('bonearcher', 122, C);
    foe('bonearcher', 72, D); foe('husk', 96, D); fly('imp', 108, D);
    foe('apprentice', 86, E); foe('zombie', 102, E); fly('broom', 112, E); foe('husk', 94, E);
    ent('check', 119, E); }

  // ---- 3. THE GARDEN GATE (x 126-160): THE HEDGE WARDEN ----
  { const G = WITCH.GARDEN, r = G.row;
    block(S1[1] + 1, 190, r + 1, H - 1);                           // the garden's floor, on the hill
    block(G.gate - 1, G.gate + 2, r - 12, r - 5); hedges.push([G.gate - 1, G.gate + 2, r - 12, r - 5]);   // the hedge arch over his gate
    for (let y = r - 4; y <= r; y++) set(G.gate, y, T.PORT);      // the gate: it lifts when he falls (MINI_DONE)
    ent('hedgewarden', 146, r, { face: -1, mini: true });
    ent('sign', 124, r, { text: 'THE GARDEN GATE. ITS WARDEN IS CUT FROM THE HEDGE, AND HE GROWS BACK FROM THE STUMP.' }); }

  // ---- 4. THE TOPIARY WALK (x 161-190) ----
  { const r = WITCH.GARDEN.row;
    rune(169, r, r - 12); plat(165, r - 9, 9); ent('silver', 172, r - 10); coins([166, r - 10], [168, r - 10]);   /* up to the hedge-tops */
    block(163, 164, r - 1, r); hedges.push([163, 164, r - 1, r]); block(185, 186, r - 1, r); hedges.push([185, 186, r - 1, r]);   // clipped hedge you hop
    foe('topiary', 168, r); foe('topiary', 177, r); fly('imp', 181, r);
    ent('check', 188, r); ent('sign', 175, r, { text: 'THE TOWER GARDEN. WHAT GOT OUT OF THE TOWER CAME THIS WAY DOWN.' }); }

  // ---- 5. THE SECOND STAIR (x 193-249, rows 76 -> 40) ----
  { const [x0, x1, [F, G, Hh, I, J]] = S2;
    carve(x1 - 5, x1 - 3, F + 1, F + 3); slab(x1 - 5, F + 1, { vert: true, rise: 9, period: 5.2 });   /* bend 1, east: a rising slab */
    rune(x0 + 3, G, Hh - 3);                                       // bend 2, west: a rune column
    plat(x1 - 2, Hh - 2, 3); plat(x1 - 5, Hh - 5, 3);              // bend 3, east: ledges
    carve(x0 + 3, x0 + 5, I + 1, I + 3); slab(x0 + 3, I + 1, { vert: true, rise: 9, period: 5.2 });   /* bend 4, west: a rising slab */
    glyphGap(WITCH.GAPS[1]);
    ent('sign', WITCH.GAPS[1][0] - 6, Hh, { text: 'ANOTHER GLYPH. THE SPELL LETS GO AFTER A FEW SECONDS: DO NOT DAWDLE UNDER THE ROAD.' });
    ent('check', x0 + 9, Hh); ent('check', x0 + 9, J);
    foe('zombie', 205, F); foe('husk', 226, F); fly('broom', 238, F); foe('bonegob', 215, F);
    foe('apprentice', 210, G); foe('bonegob', 230, G); fly('bat', 200, G); foe('zombie', 220, G);
    foe('armour', 205, Hh); fly('imp', 232, Hh); foe('zombie', 241, Hh);
    foe('zombie', 202, I); fly('broom', 216, I); foe('bonearcher', 236, I); foe('husk', 224, I); fly('imp', 229, I);
    fly('imp', 215, J); foe('armour', 230, J); fly('imp', 241, J); foe('zombie', 222, J);
    // THE STAIR'S TOP: the tower's outer gate, with its gatehouse over it
    block(x1 - 3, x1, J - 12, J - 7); skins.push([x1 - 3, x1, J - 12, J - 7, 'gate']);
    ent('gate', x1 - 1, J);
    plat(x1 - 12, J - 2, 3); plat(x1 - 9, J - 5, 3); ent('silver', x1 - 8, J - 6); coins([x1 - 11, J - 3], [x1 - 7, J - 6]);   /* up the gatehouse's buttress */
    ent('sign', x0 + 12, J, { text: "THE STAIR'S TOP. THE TOWER'S OUTER GATE IS OPEN: GO IN." }); }

  /* THE TOWER GROWS AT EVERY BEND: the rows of the bends, bottom first, for the backdrop (drawWitchTower) */
  const bends = [...S1[2], ...S2[2].slice(1)];
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: GROUND }, pools: [], falls: [], moversExtra: [], interiors: [], gusts: [],
    music: 'witchlight', duskStart: 0, duskLen: W * TS * 2.2,   /* the dusk deepens as you climb, to under half the engine's grade: the hedge still reads green */ stackedFloors: true, hasCryst: false,
    witch: { bends, braziers: WITCH.GARDEN.braziers.map(x => [x, WITCH.GARDEN.row]), glyphs },
    glyphBridges: bridges,                                          // the reach model's footing for a glyph crossing (reachcore.js)
    mage: { shelves: [], skins, hedges, chains: [], hung: [], outside: 200 },   /* the Folly's machinery runs the glyphs; it chimes near the tower */
    palette: { sky: [[64, 46, 96], [236, 150, 112]], far: 'mage', mid: 'mage', near: 'mage', dress: 'village', haze: 'rgba(200,120,160,0.10)',
      grass: '#5a6a4a', grassL: '#7c8c5c', grassD: '#3a4632', dirt: '#5a4c5a', dirtL: '#76647a', dirtD: '#382e3c', canopy: ['#2a2238', '#3a2e4a', '#4e3a5c', '#6a4a6e'] },
    weather: [{ x0: 0, x1: 99999, kind: 'leaves' }], ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    mini: { x0: WITCH.GARDEN.x0 * TS, x1: (WITCH.GARDEN.x1 + 1) * TS, floor: (WITCH.GARDEN.row + 1) * TS, y0: (WITCH.GARDEN.row - 12) * TS, y1: (WITCH.GARDEN.row + 2) * TS,
      trigger: (WITCH.GARDEN.x0 + 3) * TS, wallL: WITCH.GARDEN.wallL, gate: WITCH.GARDEN.gate, boss: 'hedgewarden', name: 'THE HEDGE WARDEN' },
    noCoin: [[0, 9, 0, GROUND - 6]],
  };
}

/* THE TOWER IN THE BACKDROP GROWS AT EVERY BEND. `k` is how many bends the hero is over (0..bends-1, eased by the caller); the
   tower is the Hexed Fields' own tower art (fa().tower), nearer, bigger and brighter the higher you are. */
export function drawWitchTower(g, art, k, n, VW, VH, dY) {
  if (!art || !art[0]) return;
  const p = Math.max(0, Math.min(1, k / Math.max(1, n - 1))), sc = 0.45 + 0.75 * p, x = Math.round(VW * (0.8 - 0.1 * p)), hz = Math.round(VH + 2 + Math.min(12, dY * 0.01));   /* its foot at the frame's foot: it RISES into the sky as it grows (56x140 art: a third of the frame at the foot, nearly all of it at the gate) */
  for (let v = 0; v < 2; v++) { const c = art[v]; if (!c) continue; const al = v === 0 ? 0.55 * (1 - p) + 0.2 : 0.85 * p; if (al <= 0.02) continue;
    const w = Math.round(c.width * sc), h = Math.round(c.height * sc); g.globalAlpha = al; g.drawImage(c, x - (w >> 1), hz - h, w, h); }
  g.globalAlpha = 1;
  /* its top window burns witchlight, stronger as you come up */
  const wy = hz - Math.round(art[0].height * sc * 0.86); g.globalAlpha = 0.25 + 0.5 * p; g.fillStyle = '#c8a0ff'; g.fillRect(x - 1, wy, 3, 4); g.globalAlpha = 0.12 + 0.2 * p; g.fillRect(x - 5, wy - 3, 11, 10); g.globalAlpha = 1;
}
/* how many bends the hero is over, from his row (bends are the terraces' standing rows, bottom first) */
export const bendsBelow = (bends, row) => bends.filter(b => row <= b + 1).length - 1;
