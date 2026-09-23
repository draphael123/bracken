// tower-ascent.js — THE FALLING TOWER, rebuilt (batch 4, 2026-09-21) and made LONGER (2026-09-22, the integration plan's
// step 4; brief docs/briefs/falling-tower-longer.md, greybox src/draft/falling-tower.js). It replaces tower-return.js (the
// Folly walked backwards) and tower-finish.js (its indoor arena). Daniel: "mostly an UPWARD ascent" through the collapsing
// tower, ending on a magic carpet in the sky - and then "the level can be a bit longer, and should use gravity mechanics
// like the level before, and still have some platforming over the pendulums that were in the level earlier. It can also
// have fewer zombies and a new enemy type - floating books".
// So the level is a tower standing on its end: you come in at the Folly's broken foot and climb SEVEN floors that each
// look and play differently, and each floor falls away under you once you have left it - the pressure comes from BELOW,
// and there is no going back down. At the crown the roof is gone and the carpet waits on the parapet (src/carpet.js);
// the Undead Archmage is fought in the open sky (src/undead-mage.js).
//
//   rows 0-49      THE SKY: the carpet's arena (L.arena.carpet, rows 34-50), nothing to stand on by design
//   rows 50-83   7 THE OPEN CROWN        broken ledges, the sky showing through, the carpet at the top
//   rows 86-119  6 THE BELL LOFT         lifts and bell ropes
//   rows 122-155 5 THE BURST CISTERN     a floor of poison water, stepping stones
//   rows 158-191 4 THE PENDULUM GALLERY  NEW: three clock pendulums ('swing' movers, as Marsh Wood and Kingswood use)
//                                        cross a 21-tile gap over a spiked gear pit, a wall stair between each ride
//   rows 194-227 3 THE ORRERY CAGE       brass ledges and crystal ones that craze underfoot, a rope up the middle
//   rows 230-263 2 THE READING ROOM      NEW: the Folly's gravity. The tiers climb halfway, to a GLYPH; stand on it and
//                                        the room turns over - you fall UP onto the underside of a stone gallery, walk
//                                        the ceiling to its gap, fall up through it, walk to the ceiling glyph, and the
//                                        room rights itself and drops you on the gallery. (L.mage must stay set: MG is
//                                        what makes a glyph turn the room over - main.js setFlip, the glyph prop.)
//   rows 266-299 1 THE LIBRARY STACKS    shelves to the ceiling, a plank stair between them; the TOMES are met here
// Each floor is capped by a two-row stone divider with ONE rope through it. When you stand on the first tier over a divider
// the floor under it collapses from its bottom row up, and the rope's hole in the divider is filled with rubble.
//
// BOTH NEW FLOORS ARE LOAD-BEARING and the greybox's own checks prove it: without the flip nothing over the Reading
// Room's gallery is reached, and without the pendulums the gallery's upper landings and the cistern are out of reach.
// FEWER ZOMBIES: three zombies and one husk (the ELITE husk over the cistern's poison) in the whole tower; the live
// tower had eight and six. The TOMES (src/tome.js) carry what they carried.
//
// Verbs used are the game's own (rule: obstacles fit the verbs you have): ledges, ropes (NET), crystal (T.CRYST, which
// L.hasCryst lets craze), authored crumbling ledges (deckBreaks), vertical movers, swing movers, poison water, spikes,
// the Folly's gravity glyphs, falling stones.
export const TOWER = { W: 72, H: 306, X0: 12, X1: 59, SKY: 50, FLOOR: 36, N: 7 };
/* THE SANDY PATH's rows, high in the empty sky rows where nothing else is built and no camera ever reaches except
   through the portal: sixteen rows over the sanctum's vault, which is itself painted and not built (src/sanctum.js). */
export const SAND = { x0: 14, x1: 58, row: 18, deep: 24, step: 46, sky: 8 };
// [name, interior kind], bottom (k 0) to top (k 6). Every floor's rows come off the pitch, so inserting one moves each
// floor under it and nothing here is re-typed; what DOES have to move by hand is everything keyed to a row somewhere
// else - the GARRISON row, level.js's ELITES coords, L.tall and START (docs/briefs/falling-tower-longer.md).
const FLOORS = [
  ['THE LIBRARY STACKS', 'library'],
  ['THE READING ROOM', 'reading'],
  ['THE ORRERY CAGE', 'orrery'],
  ['THE PENDULUM GALLERY', 'clock'],
  ['THE BURST CISTERN', 'lab'],
  ['THE BELL LOFT', 'flip'],
  ['THE OPEN CROWN', 'dome'],
];
// the spine: a stair of ledges three rows apart that crosses the floor and back. [x0, len], cycled. Three rows is the
// knight's whole jump (reachcore JUMP_UP), and at the top of it he carries about two tiles across, so each ledge
// overlaps or touches the one under it: the climb reads at a glance and never asks for a jump nobody can make.
const SPINE = [[14, 10], [22, 9], [30, 10], [39, 9], [47, 10], [40, 9], [32, 10], [24, 9]];
/* A PENDULUM: a 12-tile arm swinging +-0.9 rad with a three-tile platform on the end (the same 'swing' mover the Marsh
   and Kingswood ride). Its ends stand `endRise` rows over the bottom of its arc: that is what the boarding ledges are cut to. */
export const SWING = { arm: 12 * 16, th: 0.9, w: 48 };
const endRise = () => Math.round(SWING.arm * (1 - Math.cos(SWING.th)) / 16);

export function buildTowerAscent({ painter, T, TS }) {
  const { W, H, X0, X1, SKY, FLOOR, N } = TOWER;
  const L = painter(W, H), { set, ent, coins } = L;
  const rect = (x0, x1, y0, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  rect(0, W - 1, 0, H - 1, T.SOLID);
  rect(0, W - 1, 0, SKY - 1, T.AIR);                                   // the sky over the crown
  const interiors = [], pools = [], moversExtra = [], nets = [], floors = [], breaks = [], hung = [], flips = [], glyphBridges = [];
  let cistern = null;
  const net = (x, y0, y1) => nets.push([x, y0, y1]);
  const deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: x < 36 ? 1 : -1 }, o || {}));
  const FLY = new Set(['tome', 'imp', 'bat', 'boo', 'haunt', 'broom']);
  /* one creature in the middle of a tier: a flyer hangs three rows over it, anything else stands on it */
  const put = (t, x0, len, row) => foe(t, x0 + (len >> 1), FLY.has(t) ? row - 3 : row - 1);
  const ledge = (x0, len, row, t = T.ONEWAY) => rect(x0, x0 + len - 1, row, row, t);
  /* a pocket off a tier, four tiles past the end of its ledge (or before its start, against the far wall), with the silver on it */
  const pocket = ([x0, len, row]) => { const px = x0 + len + 4 <= X1 - 3 ? x0 + len + 4 : x0 - 7; ledge(px, 3, row); ent('silver', px + 1, row - 1); };
  // THE CRENELLATIONS: the tower's walls stand a few rows proud of the crown, merlons two wide with gaps between
  for (const [a, b] of [[X0 - 2, X0 - 1], [X1 + 1, X1 + 2]]) for (let y = SKY - 4; y < SKY; y++) if (((y - SKY) & 1) === 0 || y >= SKY - 2) rect(a, b, y, y, T.SOLID);

  FLOORS.forEach(([name, kind], k) => {
    const top = SKY + (N - 1 - k) * FLOOR, bot = top + FLOOR - 2;
    rect(X0, X1, top, bot - 1, T.AIR);
    interiors.push([X0, X1, top, bot - 1, kind]);
    floors.push({ name, top, bot, kind, tiers: [], divider: top - 2 });
  });
  /* the tiers: from three over the floor up to three under the divider over it. i0 starts each floor's stair somewhere else */
  const spine = (F, i0, kind = () => T.ONEWAY) => { let i = i0;
    for (let row = F.bot - 3; row >= F.top + 3; row -= 3, i++) { const [x0, len] = SPINE[i % SPINE.length]; F.tiers.push([x0, len, row]); ledge(x0, len, row, kind(F.tiers.length - 1)); } };

  // ---- 1. THE LIBRARY STACKS. Shelves stand to the ceiling on both walls; the stair between them is plank. ----
  { const F = floors[0];
    for (const [x0, x1, h] of [[X0, X0 + 1, 22], [X1 - 1, X1, 18], [X0, X0 + 3, 6], [X1 - 3, X1, 8]]) rect(x0, x1, F.bot - h, F.bot - 1, T.SOLID);   /* the stacks: solid bookcase, painted as library wall */
    spine(F, 0, () => T.PLANK);
    ent('check', 30, F.bot - 1); ent('sign', 26, F.bot - 1, { text: 'THE TOWER IS FALLING. CLIMB. EVERY FLOOR YOU LEAVE GOES DOWN BEHIND YOU.' });
    deco('lectern', 22, F.bot - 1); deco('bookpile', 38, F.bot - 1); deco('desk', 44, F.bot - 1); deco('candelabra', 50, F.bot - 1);
    const who = ['tome', 'apprentice', 'broom', 'armour', 'tome', 'zombie', 'apprentice', 'tome', 'imp', 'broom', 'tome'];
    F.tiers.forEach(([x0, len, row], j) => { put(who[j % who.length], x0, len, row); if (j % 3 === 1) deco('bookpile', x0 + 1, row - 1); });
    foe('apprentice', 14, F.bot - 7);
    ent('silver', X0 + 1, F.bot - 23);                                    /* on top of the tall stack: a jump off the third tier */
  }
  // ---- 2. THE READING ROOM. The tiers climb halfway, to a glyph, and the room turns over. ----
  //      LOAD-BEARING: without the flip the gallery and everything over it is out of reach.
  { const F = floors[1], slab = F.top + 10, under = slab + 2, gap = [14, 16];   /* the gallery: rows slab..slab+1, its underside walked at `under` */
    rect(X0, X1, slab, slab + 1, T.SOLID); rect(gap[0], gap[1], slab, slab + 1, T.AIR);
    /* the lower half: five tiers up from the floor to the glyph; the top one stands nine rows under the gallery's top, so nothing climbs to it */
    for (const [x0, len, row] of [[20, 10, F.bot - 3], [28, 10, F.bot - 6], [36, 9, F.bot - 9], [44, 9, F.bot - 12], [36, 12, under + 7]]) { F.tiers.push([x0, len, row]); ledge(x0, len, row); }
    const g1 = { x: 46, y: under + 6 }; ent('glyph', g1.x, g1.y);                                  /* on the top lower tier: FALL UP */
    const g2 = { x: 50, y: F.top }; ent('glyph', g2.x, g2.y, { ceiling: true });                   /* on the divider's underside: FALL DOWN, onto the gallery */
    flips.push({ from: g1, up: under, walk: [gap[0] + 1, g1.x], through: gap[0] + 1, ceil: F.top, to: g2 });
    /* and the same thing said to the REACH MODEL, which walks upright and knows nothing about gravity going the other way:
       the flip joins everything between the glyph's own tier and the top of the gallery (reachcore, L.glyphBridges with a
       fourth number). Take this away and the fill stops here - which is the point: the flip is the floor. */
    glyphBridges.push([gap[1] + 1, g2.x + 2, slab - 1, g1.y]);
    /* the upper half, on the gallery: two tiers to the rope */
    for (const [x0, len, row] of [[32, 10, slab - 3], [22, 10, slab - 6]]) { F.tiers.push([x0, len, row]); ledge(x0, len, row); }
    for (let x = g1.x - 2; x >= gap[1] + 1; x -= 3) ent('coin', x, under);                         /* a trail along the ceiling walk: the way, said in coins */
    ent('check', 24, F.bot - 1); ent('sign', 20, F.bot - 1, { text: 'THE READING ROOM. THE GLYPHS TURN THE ROOM OVER: STAND ON ONE, AND FALL UP.' });
    ent('check', 40, slab - 1);                                                                     /* on the gallery: the flip is not asked twice */
    deco('readingDesk', 30, F.bot - 1); deco('globe', 52, F.bot - 1); deco('candelabra', 26, slab - 1); deco('bookpile', 34, slab - 1);
    for (const [t, x, y] of [['tome', 24, F.bot - 7], ['apprentice', 32, F.bot - 7], ['tome', 40, F.bot - 12], ['armour', 48, F.bot - 13], ['tome', 30, under + 3], ['imp', 20, under + 4],
      ['tome', 36, under + 5], ['armour', 46, slab - 1], ['tome', 28, slab - 8], ['apprentice', 26, slab - 7], ['tome', 52, slab - 4], ['boo', 18, F.bot - 12]]) foe(t, x, y);
  }
  // ---- 3. THE ORRERY CAGE. Brass ledges and crystal ones, and a rope up the middle past the model's arms. ----
  { const F = floors[2];
    spine(F, 4, j => j % 3 === 2 ? T.CRYST : T.ONEWAY);
    ent('check', 20, F.bot - 1); ent('sign', 16, F.bot - 1, { text: 'THE ORRERY. CRYSTAL CRAZES UNDER YOU: DO NOT STAND ON IT LONG.' });
    deco('orreryBase', 36, F.bot - 1); deco('globe', 50, F.bot - 1); deco('telescope', 28, F.bot - 1);
    const who = ['imp', 'apprentice', 'tome', 'armour', 'bat', 'apprentice', 'haunt', 'tome', 'zombie', 'boo', 'apprentice'];
    F.tiers.forEach(([x0, len, row], j) => put(who[j % who.length], x0, len, row));
    hung.push([24, F.top], [46, F.top]);                                  /* turrets under the divider, hung by mageReset */
    pocket(F.tiers[5]);                                                   /* a pocket off the sixth tier */
  }
  // ---- 4. THE PENDULUM GALLERY. The clock still keeps time: ride the weights over the gear pit. ----
  //      LOAD-BEARING: with the swings taken out, the upper landings and the cistern over them are out of reach.
  { const F = floors[3], rise = endRise(), mid = 36;
    rect(26, 41, F.bot - 1, F.bot - 1, T.SPIKE);                                                     /* the gear pit: the floor under the swings bites */
    const stairL = [[13, 6], [19, 7]], stairR = [[53, 6], [47, 7]];                                  /* each wall's stair: a step by the wall, then the boarding ledge */
    let row = F.bot - 3; const swings = [];
    for (let s = 0; s < 3; s++) {
      const fromLeft = s % 2 === 1, st = fromLeft ? stairL : stairR;   /* the first from the right: the orrery's rope comes up past the pit */
      ledge(st[0][0], st[0][1], row); F.tiers.push([st[0][0], st[0][1], row]); row -= 3;
      ledge(st[1][0], st[1][1], row); F.tiers.push([st[1][0], st[1][1], row]);                       /* the boarding ledge, at the arc's end */
      const other = fromLeft ? stairR[1] : stairL[1]; ledge(other[0], other[1], row); F.tiers.push([other[0], other[1], row]);   /* the landing across the gap */
      const yb = row + rise; moversExtra.push({ kind: 'swing', px: mid * TS + 8, py: (yb - 12) * TS, arm: SWING.arm, x: 0, y: 0, w: SWING.w, h: 8, period: 3.4 + s * 0.3, phase: s * 1.3 });
      swings.push({ row, yb, land: fromLeft ? stairR[1] : stairL[1] }); if (s === 0) ent('check', 50, row - 1); row -= 3;
    }
    const endL = swings[2].land === stairL[1], lt = endL ? [15, 8] : [49, 8]; ledge(lt[0], lt[1], row); F.tiers.push([lt[0], lt[1], row]);   /* the last tier, off the third landing: the rope */
    ent('check', 15, F.bot - 1); ent('sign', 20, F.bot - 1, { text: 'THE PENDULUM GALLERY. THE CLOCK STILL KEEPS TIME. RIDE THE WEIGHTS OVER THE GEARS.' });
    deco('clockface', 36, F.top + 3, { hang: true }); deco('gears', 32, F.bot - 2);                  /* the face high over the pit, the wheels turning behind it */
    for (const [t, x, y] of [['armour', 15, F.bot - 1], ['tome', 22, swings[0].row - 3], ['bat', 50, swings[0].row - 2], ['apprentice', 50, swings[0].row - 1], ['tome', 56, swings[1].row + 2],
      ['haunt', 30, swings[1].row - 4], ['armour', 22, swings[1].row - 1], ['tome', 15, swings[2].row + 2], ['imp', 44, swings[2].row - 4], ['apprentice', 50, swings[2].row - 1], ['tome', 43, row - 3]]) foe(t, x, y);
    { const [lx, ll] = swings[1].land, c0 = lx + (ll >> 1) - 1; coins([c0, swings[1].row - 1], [c0 + 1, swings[1].row - 1], [c0 + 2, swings[1].row - 1]); }   /* the second landing pays: the longest ride in the tower */
    F.swings = swings;
  }
  // ---- 5. THE BURST CISTERN. The cistern has let go: the floor is poison water, crossed on stones. ----
  { const F = floors[4], surf = F.bot - 4;
    cistern = { surf, bot: F.bot };   /* its water is laid at the end, once the stones and the rope are in: see WATER ONLY WHERE THERE IS WATER */
    /* the stepping stones, their tops two rows over the water, laid from the one the pendulum gallery's rope comes up through */
    const [hx0, hlen] = floors[3].tiers[floors[3].tiers.length - 1], hx = hx0 + (hlen >> 1);
    for (let x = hx - 1 - 6 * 8; x < X1 - 2; x += 6) if (x > X0 + 10) rect(x, x + 1, surf - 2, F.bot - 1, T.SOLID);
    rect(X0, X0 + 8, surf - 2, F.bot - 1, T.SOLID); rect(X1 - 2, X1, surf - 2, F.bot - 1, T.SOLID);   /* the banks: the rope from below comes up through the left one */
    let i = 2; for (let r = F.bot - 3; r >= F.top + 3; r -= 3, i++) { if (r >= surf - 2) continue; const [x0, len] = SPINE[i % SPINE.length]; F.tiers.push([x0, len, r]); ledge(x0, len, r); }
    ent('check', X0 + 2, surf - 3); ent('sign', X0 + 5, surf - 3, { text: 'THE CISTERN BURST. THE WATER IS POISON.' });
    /* (two of these ledges gave way 1.5 s after you stood on them. That was built for poison you could climb out of; since
       the cistern was made DEADLY (e0ab1dc) a ledge that gives way under you is a death with no answer - Daniel: 'impossible
       to beat'. They hold now, and the sign no longer promises otherwise.) */
    for (const [j, kind] of [[1, 'still'], [3, 'retorts'], [5, 'jars']]) { const t = F.tiers[j]; if (t) deco(kind, t[0] + 2, t[2] - 1); }   /* on the tier's own ledge */
    const who = ['husk', 'apprentice', 'imp', 'tome', 'zombie', 'apprentice', 'broom', 'tome', 'apprentice', 'imp'];
    F.tiers.forEach(([x0, len, row], j) => put(who[j % who.length], x0, len, row));
  }
  // ---- 6. THE BELL LOFT. The bells are gone through the floor; their frames carry lifts, and the ropes still hang. ----
  { const F = floors[5], b = F.bot;
    /* the loft is laid by hand: the bell frames carry two lifts, one over the other, and the stair takes up above them */
    F.tiers = [[21, 10, b - 12], [34, 10, b - 21], [42, 10, b - 24], [34, 9, b - 27], [26, 9, b - 30]];
    for (const [x0, len, row] of F.tiers) ledge(x0, len, row);
    ent('mover', 18, b - 1, { len: 3, vert: true, rise: 11, period: 4.6 });   /* off the floor to the first frame */
    ent('mover', 31, b - 12, { len: 3, vert: true, rise: 9, period: 4.2 });   /* and from its end to the second */
    ledge(46, 8, b - 9); ledge(12, 6, b - 18);                                   /* the bell-ringers' walks: somewhere to stand and fight */
    ent('check', 50, b - 1); ent('sign', 54, b - 1, { text: 'THE BELL LOFT. ITS WARDEN HOLDS THE GATE TO THE FRAMES. RIDE THEM UP.' });   /* by the rope up from the cistern, clear of the warden's gate (ELITES, col 30) */
    for (const [t, x, y] of [['armour', 50, b - 10], ['apprentice', 14, b - 19], ['bat', 24, b - 8], ['boo', 40, b - 16], ['haunt', 52, b - 20], ['tome', 26, b - 15], ['armour', 38, b - 22], ['tome', 46, b - 28], ['apprentice', 30, b - 31], ['tome', 20, b - 33]]) foe(t, x, y);
    pocket(F.tiers[2]);
  }
  // ---- 7. THE OPEN CROWN. The roof is gone. Broken ledges up the last floor to the parapet, and the carpet. ----
  { const F = floors[6];
    spine(F, 12, j => j % 4 === 3 ? T.CRYST : T.ONEWAY);
    rect(28, 43, SKY + 1, SKY + 1, T.SOLID);                              /* THE PARAPET WALK, three over the last tier: the carpet waits over it */
    ent('check', 30, F.bot - 1); ent('sign', 26, F.bot - 1, { text: 'THE CROWN. THE ROOF IS GONE. A DOOR STANDS OPEN ON THE PARAPET: HIS ROOM IS THROUGH IT.' });
    ent('check', 31, SKY); ent('sign', 40, SKY, { text: 'HIS CARPET FLIES WHERE YOU STEER IT. THE FLOOR BURNS. EVERY SPELL CAN BE OUT-FLOWN.' });
    deco('telescope', 36, F.bot - 1); deco('starChart', 24, F.top + 1, { hang: true });
    const who = ['imp', 'apprentice', 'bat', 'armour', 'tome', 'apprentice', 'haunt', 'imp', 'tome', 'bat', 'armour'];
    F.tiers.forEach(([x0, len, row], j) => put(who[j % who.length], x0, len, row));
  }
  /* THE SEAMS between floors, where a screen was empty: books over the cistern's poison, the gallery's top, the loft's floor, the crown's parapet */
  for (const [t, x, y] of [['tome', 28, floors[4].bot - 6], ['tome', 42, floors[4].bot - 7], ['tome', 26, floors[3].top + 3], ['bat', 50, floors[3].top + 2], ['apprentice', 14, floors[3].bot - 1],
    ['armour', 40, floors[5].bot - 1], ['tome', 30, floors[5].bot - 4], ['tome', 20, floors[0].top + 3], ['boo', 46, floors[0].top + 2], ['imp', 22, SKY + 3], ['tome', 48, SKY + 2]]) foe(t, x, y);
  /* THE SANDY PATH. Through the second door, and the only ground in the sky rows: a cutting of warm sandstone with the
     gate at the far end of it. It is DRESSING - no map node, no `needs:`, nothing behind the gate - and it is here
     because the next set of levels is a desert and this is where the world first says so (Daniel: "wink at the
     desert"). Reached only by the portal, so it is walled at both ends and nothing can be walked off. */
  rect(SAND.x0, SAND.x1, SAND.row, SAND.deep, T.SOLID);                     /* the bank itself, five rows thick: a path, not a slab */
  rect(SAND.step, SAND.x1, SAND.row - 2, SAND.row - 1, T.SOLID);            /* it rises to the gate, so the last walk is upward */
  rect(SAND.x0 - 2, SAND.x0 - 1, SAND.sky, SAND.deep, T.SOLID); rect(SAND.x1 + 1, SAND.x1 + 2, SAND.sky, SAND.deep, T.SOLID);   /* the walls of the cutting */
  ent('gate', SAND.x1 - 4, SAND.row - 3); ent('sign', SAND.x0 + 5, SAND.row - 1, { text: 'THE TOWER IS BEHIND YOU. THE SAND GOES ON SOUTH, AND SO DOES THE ROAD.' });
  for (const [k, x] of [['stone', SAND.x0 + 9], ['tuft', SAND.x0 + 16], ['stone', SAND.x0 + 25], ['tuft', SAND.x0 + 31]]) deco(k, x, SAND.row - 1);
  deco('sundial', SAND.step + 6, SAND.row - 3);   /* his, and the first thing in the game that is going to want a sun */
  ent('undeadmage', 36, 42, { face: -1 });
  // ---- THE DIVIDERS AND THEIR ROPES. Each floor's rope hangs from its last tier, through the divider over it, to its top. ----
  for (let k = 0; k < floors.length - 1; k++) {
    const F = floors[k], [x0, len, row] = F.tiers[F.tiers.length - 1], rx = x0 + (len >> 1);
    let top = F.divider; while (L.grid[(top - 1) * W + rx] === T.SOLID) top--;   /* up through a bank that stands on the divider (the cistern's) */
    net(rx, top, row - 1); F.hole = [rx, F.divider, F.divider + 1];
  }
  // the falling stones: hung under each divider over the stair, where the hero passes under them
  for (const F of floors.slice(0, N - 1)) for (const j of [2, 7]) { const [x0, len] = F.tiers[j] || []; if (x0 === undefined) continue; const sx = x0 + 2; if (L.grid[(F.top) * W + sx] === T.AIR) ent('stal', sx, F.top, { stone: true }); }
  for (const F of floors) coins([30, F.bot - 3], [34, F.bot - 3]);                                     /* a pair on every floor's first tier */
  for (const k of [0, 2]) coins([X1 - 4, floors[k].bot - 1], [X1 - 5, floors[k].bot - 1], [X1 - 6, floors[k].bot - 1], [X1 - 7, floors[k].bot - 1]);   /* every dead end pays (tools/deadends.mjs): the pockets the stair leaves */

  // EVERY ROPE IS HUNG LAST (rule I): nothing is dug after this line
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);
  /* WATER ONLY WHERE THERE IS WATER. The cistern was one pool from wall to wall, so the stones and the rope the floor below
     comes up by were 'in' it too - and since the water was made DEADLY (e0ab1dc) the climb up that rope killed you before you
     were out of it (Daniel: 'takes you right into poison water... impossible to beat'). One pool per open gap between the
     stones now: each four rows deep with a stone either side, so each is still a trap and still DEADLY (deadly-water.js). */
  if (cistern) { const { surf, bot } = cistern, open = x => L.grid[surf * W + x] === T.AIR && L.grid[(surf + 1) * W + x] === T.AIR;
    for (let x = X0; x <= X1; x++) { if (!open(x)) continue; let x1 = x; while (x1 + 1 <= X1 && open(x1 + 1)) x1++;
      pools.push({ x0: x * TS, x1: (x1 + 1) * TS, y: surf * TS + 4, depth: 3 * TS, bottom: bot * TS, harm: true, poison: true, deadly: true, foulCol: '#5c8a24', foulColL: '#a6e04a', foulColD: '#1c3212' }); x = x1; } }

  /* THE PARAPET WAS GROWING GRASS. Every solid row in here is skinned as tower stone except this one, which nobody
     listed - so it fell through to the default ground kit and painted itself with palette.grass, a green mat lying on
     the crown of a stone tower two hundred rows up. Daniel saw it before I did. The sand bank is the other way out. */
  const skins = [[0, X0 - 1, SKY - 4, H - 1, 'tower'], [X1 + 1, W - 1, SKY - 4, H - 1, 'tower']].concat(floors.slice(0, N - 1).map(F => [X0, X1, F.divider, F.divider + 1, 'tower']),
    [[X0, X1, H - 6, H - 1, 'tower'], [28, 43, SKY + 1, SKY + 1, 'tower'], [SAND.x0 - 2, SAND.x1 + 2, SAND.sky, SAND.deep, 'sand']]);
  const START = { x: 20, y: floors[0].bot - 1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools, falls: [], moversExtra, interiors, gusts: [], flips, glyphBridges,
    music: 'fallingtower', night: true, nightA: 0.12, edgeLit: true, duskStart: 99999, duskLen: 1, hasCryst: true,
    towerAscent: true, carpetAt: { x: 36 * TS, y: SKY * TS }, fallingTower: true, stackedFloors: true, skyRow: SKY,
    /* THE ARCHMAGE'S SANCTUM (src/sanctum.js). `in` is the door on the parapet and stands exactly where the carpet used
       to lie, so the carpet's own board check opens it; `spawn` is where you come out, inside his hall and well over the
       fire; `sand` is where the second door puts you when he is down. `out` is not here because it is not decided here:
       the way out opens WHERE HE FALLS. */
    sanctum: { in: { x: 36 * TS, y: SKY * TS }, spawn: { x: 14 * TS, y: 40 * TS }, sand: { x: (SAND.x0 + 2) * TS, y: SAND.row * TS }, out: null, open: false, outOpen: 0, t: 0 },
    tall: { top: SKY * TS, bottom: floors[0].bot * TS, col: '26,20,40', deepest: 0.16 },
    towerFloors: floors.map((F, k) => ({ name: F.name, top: F.top, bot: F.bot, hole: F.hole || null, last: k === N - 1 })),
    deckBreaks: breaks.map(([x0, x1, row]) => ({ x0, x1, row, t: -1, down: false, regrow: true })),   /* spine ledges: they come back (updateTowerAscent), or a fall into the water would be a soft-lock */
    mage: { shelves: [], skins, hedges: [], chains: [], hung, outside: 0, dais: [30, 40] },
    palette: { sky: 'mage', far: 'mage', mid: 'mage', near: 'mage', dress: 'village', haze: 'rgba(120,90,180,0.10)',
      grass: '#4e6a52', grassL: '#6c8c70', grassD: '#34483a', dirt: '#4a4652', dirtL: '#645e6c', dirtD: '#2e2a36', canopy: ['#181428', '#221c36', '#2c2446', '#3a3058'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'hall' }],
    noCoin: [[0, W - 1, 0, SKY + 1]],
    /* THE SKY IS THE ARENA. trigger is never walked past: the carpet starts the fight when it is boarded (carpet.js) */
    arena: { x0: 4 * TS, x1: 68 * TS, y0: 34 * TS, floor: SKY * TS,   /* three screens wide and a little over one tall: he is never off the top of it */ trigger: 1e9, wallL: 0, wallR: W - 1, boss: 'undeadmage', carpet: true, music: 'boss4', tint: '#30334e', tintA: 0.06 },
  };
}

/* ================= THE FLOOR GOES UNDER YOU =================================================================
   A floor arms when the hero is on the first tier over the divider that caps it, falls after a fuse, and goes from its bottom
   row up. The rope's hole in the divider is filled the moment it goes, so there is no dropping back into it - but
   never while he is under the divider: then it waits and re-arms when he is above again. */
export function towerAscentReset(L, restore, cpRow = Infinity, clear = null, seal = null) {
  for (const f of L.towerFloors || []) { f.t = -1; f.front = null; f.done = false; f.sealed = false;
    for (let y = f.top - 2; y < f.bot; y++) for (let x = TOWER.X0; x <= TOWER.X1; x++) restore(x, y);
    /* a floor wholly under the checkpoint you come back to is already gone: put it straight back the way you left it */
    if (clear && !f.last && f.top - 6 > cpRow) { for (let y = f.top; y < f.bot; y++) for (let x = TOWER.X0; x <= TOWER.X1; x++) clear(x, y);
      if (f.hole && seal) for (let y = f.hole[1]; y <= f.hole[2]; y++) seal(f.hole[0], y); f.done = true; f.sealed = true; } }
}
export function updateTowerAscent(L, P, dt, { change, crash, warn }) {
  if (!L.towerFloors || P.dead) return;
  const X0 = TOWER.X0, X1 = TOWER.X1;
  /* THE CISTERN'S LEDGES COME BACK UP. They are the stair, so one that gave way under you and dropped you in the water
     has to be there again when you have climbed out onto a stone - five seconds, and never while you are in its tiles */
  for (const z of L.deckBreaks || []) { if (!z.regrow || !z.down) { z.downT = 0; continue; }
    const f = L.towerFloors.find(f => z.row >= f.top && z.row < f.bot); if (f && (f.front !== null || f.done)) continue;
    z.downT = (z.downT || 0) + dt;
    if (z.downT > 5 && !(P.x > z.x0 * 16 - 8 && P.x < (z.x1 + 1) * 16 + 8 && Math.abs(P.y - z.row * 16) < 20)) { for (let x = z.x0; x <= z.x1; x++) change(x, z.row, 'restore'); z.down = false; z.t = -1; z.downT = 0; } }
  for (const f of L.towerFloors) {
    if (f.done || (f.last && !L.carpetUp)) continue;
    const above = P.y < (f.top - 4) * 16 || (f.last && L.carpetUp);   /* on the first tier over the divider, or higher */
    if (f.t < 0 && f.front === null) { if (above) { f.t = f.last ? 0.6 : 2.2; warn(f); } continue; }
    if (f.t >= 0) { f.t -= dt; if (f.t > 0) continue; f.t = -1;
      if (!above) continue;                                              /* he went back down through the hole: wait for him */
      f.front = f.bot - 1;
      if (f.hole && !f.last) { const [x, y0, y1] = f.hole; for (let y = y0; y <= y1; y++) change(x, y, 'seal'); f.sealed = true; } }
    if (f.front !== null) {
      const to = Math.max(f.top, f.front - dt * 20);
      for (let y = Math.floor(f.front); y >= Math.ceil(to); y--) { let n = 0; for (let x = X0; x <= X1; x++) if (change(x, y, 'fall')) n++; if (n && y % 3 === 0) crash(f, y); }
      f.front = to; if (to <= f.top) { f.front = null; f.done = true; }
    }
  }
}

// ---- carried over from tower-finish.js: the Folly's polish, the backdrop, the gate test ----
export function polishTower(L, id, T) {
  if (!['mage', 'fallingtower'].includes(id)) return L;
  L.palette.ledges = 'arcane'; L.towerBackdrop = true;
  if (id === 'mage') {
    L.mage.skins.unshift([118, L.W - 1, 0, L.H - 1, 'tower']);
    L.ents = L.ents.filter(e => !(e.t === 'deco' && ['gardenWall', 'campfire', 'cairn', 'fallenLog', 'tuft', 'flower', 'stone'].includes(e.kind) && e.x >= 118));
    for (const p of L.pools.filter(p => p.acid && !p.magePool)) for (let y = Math.floor(p.y / 16); y < Math.ceil(p.bottom / 16) + 1; y++) for (let x = p.x0 / 16; x < p.x1 / 16; x++) L.grid[y * L.W + x] = T.SOLID;
    L.pools = L.pools.filter(p => !p.acid || p.magePool);
    for (const e of L.ents) if (e.t === 'sign' && e.x === 268) e.text = 'THE ALCHEMY LAB. THE SEALED VATS STILL SPIT. GUARD THE SLOW GOB OR STEP ASIDE.';
  }
  return L;
}
export function drawTowerBackdrop(g, L, cx, cy) {
  if (!L.towerBackdrop) return; const lo = L.mage?.outside ?? 0;
  const start = Math.max(lo, Math.floor(cx / 16) - 2), end = Math.min(L.W, Math.ceil((cx + g.canvas.width) / 16) + 2);
  const sky = L.skyRow !== undefined ? Math.max(0, L.skyRow * 16 - cy) : 0;   /* the tower's ribs stop where the tower does: over the crown is sky */
  g.save(); g.beginPath(); g.rect(lo * 16 - cx, sky, L.W * 16, g.canvas.height); g.clip();
  for (let x = Math.floor(start / 12) * 12; x < end; x += 12) { const px = x * 16 - cx; g.fillStyle = '#242135'; g.fillRect(px, 0, 12, g.canvas.height); g.fillStyle = '#3b344e'; g.fillRect(px + 2, 0, 2, g.canvas.height);
    for (let y = Math.floor(cy / 192) * 192 - 192; y < cy + g.canvas.height; y += 192) { const py = y - cy + 38; g.fillStyle = '#161c36'; g.fillRect(px + 40, py, 35, 70); g.fillStyle = '#586087'; g.fillRect(px + 42, py + 2, 31, 1); g.fillStyle = '#3b395d'; g.fillRect(px + 56, py, 2, 70); g.fillRect(px + 40, py + 35, 35, 2); g.fillStyle = '#bec2d8'; g.fillRect(px + 47, py + 12, 2, 2); g.fillRect(px + 66, py + 25, 1, 1); } }
  g.restore();
}
export function gateOccupied(col, rows, actors) { return actors.some(p => p && !p.dead && rows.some(y => p.x + (p.w || 10) / 2 > col * 16 - 4 && p.x - (p.w || 10) / 2 < (col + 1) * 16 + 4 && p.y > y * 16 && p.y - (p.h || 14) < (y + 1) * 16)); }
