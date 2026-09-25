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
//   rows 86-119  6 THE BELL LOFT         (2026-09-25) the bell deck over its pit, and THE SEXTON, the tower's mini
//   rows 122-155 5 THE BURST CISTERN     a floor of poison water, stepping stones
//   rows 158-191 4 THE PENDULUM GALLERY  NEW: three clock pendulums ('swing' movers, as Marsh Wood and Kingswood use)
//                                        cross a 21-tile gap over a spiked gear pit, a wall stair between each ride
//   rows 194-227 3 THE ORRERY CAGE       (2026-09-25) a shaft, the observers' gallery whose floor gives way into the pit, and a failing stair
//   rows 230-263 2 THE READING ROOM      NEW: the Folly's gravity. The tiers climb halfway, to a GLYPH; stand on it and
//                                        the room turns over - you fall UP onto the underside of a stone gallery, walk
//                                        the ceiling to its gap, fall up through it, walk to the ceiling glyph, and the
//                                        room rights itself and drops you on the gallery. (L.mage must stay set: MG is
//                                        what makes a glyph turn the room over - main.js setFlip, the glyph prop.)
//   rows 266-299 1 THE LIBRARY STACKS    shelves to the ceiling, a plank stair between them; the TOMES are met here
// FAILING STONE (src/tower-collapse.js, docs/briefs/falling-tower-rework.md): cracked sections that count 3-2-1 under your weight and go,
// then come back. Taught on the library stair, the way down into the orrery pit, its failing stair, the pendulum's first landing,
// the Sexton's bell deck, and one ledge in four of the crown's last climb.
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
import { crumbleInit, crumbleGone } from './tower-collapse.js';
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
  const interiors = [], pools = [], moversExtra = [], nets = [], floors = [], breaks = [], hung = [], flips = [], glyphBridges = [], crumbles = [];
  let cistern = null, bell = null;
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
    spine(F, 0, j => j === 1 ? T.ONEWAY : T.PLANK);
    /* FAILING STONE, TAUGHT SAFE (use 1 of 5, docs/briefs/falling-tower-rework.md): the stair's second tier is a cracked stone
       ledge three rows over the library floor and the first tier. Stand on it and it counts; leave it late and you drop onto the
       plank under it, which costs nothing. The rule is learned where it cannot hurt you. */
    { const [x0, len, row] = F.tiers[1]; crumbles.push({ x0, x1: x0 + len - 1, row, kind: 'teach' }); }
    ent('check', 30, F.bot - 1); ent('sign', 26, F.bot - 1, { text: 'THE TOWER IS FALLING. CLIMB. EVERY FLOOR YOU LEAVE GOES DOWN BEHIND YOU.' });
    ent('sign', 34, F.bot - 1, { text: 'CRACKED STONE COUNTS DOWN UNDER YOU - 3, 2, 1 - AND GOES. STEP OFF IT IN TIME.' });
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
    /* the upper half, on the gallery: two tiers to the rope. The rope comes up at column 22 since 2026-09-25: over it is THE
       ORRERY's shaft, walled off from its pit, so the way on is up to the observers' gallery and down through its failing floor */
    for (const [x0, len, row] of [[28, 10, slab - 3], [18, 9, slab - 6]]) { F.tiers.push([x0, len, row]); ledge(x0, len, row); }
    for (let x = g1.x - 2; x >= gap[1] + 1; x -= 3) ent('coin', x, under);                         /* a trail along the ceiling walk: the way, said in coins */
    ent('check', 24, F.bot - 1); ent('sign', 20, F.bot - 1, { text: 'THE READING ROOM. THE GLYPHS TURN THE ROOM OVER: STAND ON ONE, AND FALL UP.' });
    ent('check', 40, slab - 1);                                                                     /* on the gallery: the flip is not asked twice */
    deco('readingDesk', 30, F.bot - 1); deco('globe', 52, F.bot - 1); deco('candelabra', 26, slab - 1); deco('bookpile', 34, slab - 1);
    for (const [t, x, y] of [['tome', 24, F.bot - 7], ['apprentice', 32, F.bot - 7], ['tome', 40, F.bot - 12], ['armour', 48, F.bot - 13], ['tome', 30, under + 3], ['imp', 20, under + 4],
      ['tome', 36, under + 5], ['armour', 46, slab - 1], ['tome', 28, slab - 8], ['apprentice', 22, slab - 7], ['tome', 52, slab - 4], ['boo', 18, F.bot - 12]]) foe(t, x, y);
  }
  // ---- 3. THE ORRERY CAGE. Brass ledges and crystal ones, and a rope up the middle past the model's arms. ----
  /* REBUILT 2026-09-25 (docs/briefs/falling-tower-rework.md, uses 2 and 3 of the failing stone). It was a spine of brass and
     crystal like every other floor. Now it is three places, stacked:
       THE SHAFT        (cols 12-23) the Reading Room's rope comes up here, walled off from the pit, and goes on up through
                        the pit's roof into -
       THE OBSERVERS' GALLERY (cols 12-33, rows bot-20..bot-11) a closed room over the pit. ITS FLOOR IS THE WAY ON: a failing
                        section of it takes you down into the pit (`opens`: src/reachcore.js drops through it)
       THE ORRERY PIT   (cols 25-54, the pit's roof 8 rows over its floor) where the model stands - and THE AMBUSH, since it
                        is a place and the gallery floor is its door
       THE SHAFT UP     (cols 35-59) out of the pit by a rope at col 58, and up A FAILING STAIR: six tiers that go from the
                        bottom up once you are on them, each 1.1 s after the one under it. A fall lands you on the pit's roof
                        and the stair is back four seconds after it finished (B4, C5). */
  { const F = floors[2], b = F.bot, roof = b - 10;                     /* the pit's roof: rows roof..roof+1; the pit is b-8..b-1 */
    const G = { x0: X0, x1: 33, top: b - 20 };                         /* the gallery: over the roof, under a mass of masonry */
    rect(X0, X1, roof, roof + 1, T.SOLID);                             /* the roof of the pit, which is the floor of everything over it */
    rect(24, 24, roof + 2, b - 1, T.SOLID);                            /* the shaft's wall: the pit is not walked into from the rope */
    rect(G.x0, G.x1, F.top, G.top - 1, T.SOLID); rect(G.x1 + 1, G.x1 + 1, G.top, roof - 1, T.SOLID);   /* the gallery's ceiling and its far wall */
    net(22, roof, b - 1); net(58, roof, b - 1);                        /* the shaft's rope up to the gallery, and the rope out of the pit */
    crumbles.push({ x0: 27, x1: 32, row: roof, rows: 2, opens: true, kind: 'gallery' });   /* THE GALLERY FLOOR GIVES: the only way on */
    ent('check', 16, roof - 1); ent('sign', 19, roof - 1, { text: 'THE OBSERVERS\' GALLERY IS GIVING WAY. THE ONLY WAY ON IS DOWN THROUGH IT.' });
    deco('telescope', 14, roof - 1); deco('starChart', 26, G.top, { hang: true });
    /* THE PIT: the model stands in the middle of it */
    deco('orreryBase', 40, b - 1); deco('globe', 50, b - 1);
    for (const [t, x, y] of [['apprentice', 44, b - 1], ['tome', 34, b - 5], ['apprentice', 50, b - 1]]) foe(t, x, y);
    /* THE FAILING STAIR, from the roof by the rope out of the pit to the rope up through the divider */
    const stair = [[49, 10, roof - 3], [39, 9, roof - 6], [46, 10, roof - 9], [36, 9, roof - 12], [45, 10, roof - 15], [36, 9, roof - 18], [41, 9, roof - 21]];
    stair.forEach(([x0, len, row], j) => { ledge(x0, len, row); F.tiers.push([x0, len, row]); if (j < stair.length - 1) crumbles.push({ x0, x1: x0 + len - 1, row, chain: 'orrery', count: j === 0 ? 1.8 : 1.1, kind: 'stair' }); });
    ent('check', 54, roof - 1); ent('sign', 51, roof - 1, { text: 'THE STAIR IS FAILING. ONCE YOU ARE ON IT, IT GOES FROM THE BOTTOM UP. CLIMB.' });
    for (const [t, x, y] of [['zombie', 42, roof - 1], ['tome', 24, G.top + 4], ['imp', 56, roof - 10], ['bat', 38, roof - 16], ['tome', 52, roof - 19], ['haunt', 40, roof - 3]]) foe(t, x, y);
    hung.push([37, F.top], [56, F.top]);                                  /* turrets under the divider, hung by mageReset */
    pocket(F.tiers[4]);                                                   /* a pocket off the fifth tier, against the stair's own wall */
  }
  // ---- 4. THE PENDULUM GALLERY. The clock still keeps time, but what rides its arms are the Folly's own loose books,
  //      not weights: three tomes drift the gear pit on a faint arcane tether. EASED 2026-09-23 (Daniel's playtest,
  //      screenshot ~3:31/coin 20 of 346): the boarding platform is a THIRD WIDER (48->64px, SWING.w untouched since
  //      it is shared with Marsh Wood/Kingswood), the ride is SLOWER (period +0.4s per book, was 3.4/3.7/4.0 now
  //      3.8/4.1/4.4 - about 12%, more time to time the jump), and a checkpoint was added after the SECOND book too
  //      (was only after the first), so a miss on the third book does not undo two rides, only one. The pendulum
  //      motion itself (th=0.9, the arc) is main.js's own 'swing' mover code and is untouched - only the platform's
  //      size, pace and the checkpoint spacing changed. Still a fall onto T.SPIKE if missed: it is eased, not free.
  //      LOAD-BEARING: with the swings taken out, the upper landings and the cistern over them are out of reach.
  { const F = floors[3], rise = endRise(), mid = 36, bw = SWING.w + 16;
    rect(26, 41, F.bot - 1, F.bot - 1, T.SPIKE);                                                     /* the gear pit: the floor under the swings bites */
    const stairL = [[13, 6], [19, 7]], stairR = [[53, 6], [47, 7]];                                  /* each wall's stair: a step by the wall, then the boarding ledge */
    let row = F.bot - 3; const swings = [];
    for (let s = 0; s < 3; s++) {
      const fromLeft = s % 2 === 1, st = fromLeft ? stairL : stairR;   /* the first from the right: the orrery's rope comes up past the pit */
      ledge(st[0][0], st[0][1], row); F.tiers.push([st[0][0], st[0][1], row]); row -= 3;
      ledge(st[1][0], st[1][1], row); F.tiers.push([st[1][0], st[1][1], row]);                       /* the boarding ledge, at the arc's end */
      const other = fromLeft ? stairR[1] : stairL[1]; ledge(other[0], other[1], row); F.tiers.push([other[0], other[1], row]);   /* the landing across the gap */
      const yb = row + rise; moversExtra.push({ kind: 'swing', px: mid * TS + 8, py: (yb - 12) * TS, arm: SWING.arm, x: 0, y: 0, w: bw, h: 8, period: 3.8 + s * 0.3, phase: s * 1.3, book: true });
      swings.push({ row, yb, land: fromLeft ? stairR[1] : stairL[1] }); if (s === 0 || s === 1) ent('check', 50, row - 1); row -= 3;
    }
    /* A FLOOR YOU MUST LEAVE IN TIME (use 4 of 5): the first ride's landing is failing stone and counts the moment you land on
       it - two and a half seconds to take the step up the wall stair. Under it is the gallery's floor, clear of the gear pit,
       and a rope up the wall from there to that step (C5): a fall costs a climb, not a life. */
    { const [lx, ll] = swings[0].land, r0 = swings[0].row; crumbles.push({ x0: lx, x1: lx + ll - 1, row: r0, count: 2.5, kind: 'landing' }); net(stairL[0][0], r0 - 3, F.bot - 1); }
    const endL = swings[2].land === stairL[1], lt = endL ? [15, 8] : [49, 8]; ledge(lt[0], lt[1], row); F.tiers.push([lt[0], lt[1], row]);   /* the last tier, off the third landing: the rope */
    ent('check', 15, F.bot - 1); ent('sign', 20, F.bot - 1, { text: 'THE PENDULUM GALLERY. THE CLOCK STILL KEEPS TIME. RIDE THE BOOKS OVER THE GEARS.' });
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
    { const [x0, , row] = F.tiers[F.tiers.length - 1]; ent('check', x0 + 1, row - 1); }   /* by the rope up to the bell loft: outside the Sexton's walls (B6) */
  }
  // ---- 6. THE BELL LOFT, and THE SEXTON (src/sexton.js; docs/briefs/falling-tower-rework.md §3). Rebuilt 2026-09-25: it was a lift
  //      shaft with an elite armour holding a gate. Now its floor is THE BELL DECK - failing planks (use 5 of 5) on joists over a
  //      two-row bell pit - and the tower's dead bell-ringer is fought on it. Two stone piers stand two rows proud of the deck (THE
  //      RINGERS' WALKS: the height his toll cannot reach, A12). The bell frame over the deck is the room's roof; the way on is the
  //      portcullis at col 52 (the mini's gate) and the rope beyond it up through the frame to the loft's upper stair.
  { const F = floors[5], b = F.bot, deck = b - 3, frame = b - 18;
    rect(X0, X1, deck, deck, T.PLANK);                                              /* the bell deck; under it the pit, rows deck+1..b-1 */
    const piers = [[12, 14], [38, 40]], joists = [20, 26, 32, 46, 52];
    for (const [a, z] of piers) rect(a, z, deck - 2, b - 1, T.SOLID);                /* the ringers' walks, standing on the pit's floor */
    for (const x of joists) rect(x, x, deck, b - 1, T.SOLID);
    rect(53, X1, deck, b - 1, T.SOLID);                                              /* the landing past the gate */
    rect(X0, X1, frame, frame + 1, T.SOLID);                                         /* the bell frame: the room's roof */
    rect(52, 52, frame + 2, deck - 1, T.PORT);                                       /* the mini's gate: it lifts when he falls */
    net(56, frame, deck - 1);                                                        /* and the rope up through the frame beyond it */
    for (const [x0, x1] of [[15, 19], [21, 25], [27, 31], [33, 37], [41, 45], [47, 51]]) crumbles.push({ x0, x1, row: deck, kind: 'deck' });
    bell = { deck, frame, joists: [13, 20, 26, 32, 39, 46].map(x => x * TS + 8) };
    ent('sexton', 30, deck - 1, { mini: true, face: -1 });
    ent('sign', 13, deck - 3, { text: 'THE BELL LOFT. HIS TOLL SETS THE DECK COUNTING: GET OFF THE PLANKS.' });
    ent('check', 56, deck - 1);                                                      /* past the gate: somewhere to go the moment he falls */
    /* THE UPPER LOFT, over the frame: four tiers to the rope into the crown, and a pocket */
    F.tiers = [[44, 9, frame - 3], [34, 9, frame - 6], [24, 10, frame - 9], [14, 9, frame - 12]];
    for (const [x0, len, row] of F.tiers) ledge(x0, len, row);
    for (const [t, x, y] of [['apprentice', 48, frame - 4], ['armour', 28, frame - 10], ['bat', 20, frame - 8], ['haunt', 40, frame - 9], ['tome', 30, frame - 13], ['tome', 50, frame - 2], ['boo', 18, frame - 15], ['apprentice', 38, frame - 7]]) foe(t, x, y);
    pocket(F.tiers[1]);
  }
  // ---- 7. THE OPEN CROWN. The roof is gone. Broken ledges up the last floor to the parapet, and the carpet. ----
  { const F = floors[6];
    spine(F, 12, j => j % 4 === 3 ? T.CRYST : T.ONEWAY);
    /* THE CROWN IS BREAKING UP (use 6 of the failing stone, the last climb before the sky): one ledge in four is failing stone on a
       shorter count. The rule at its hardest, where the tower is most gone - and a fall is one tier, never the floor. */
    F.tiers.forEach(([x0, len, row], j) => { if (j % 4 === 1) crumbles.push({ x0, x1: x0 + len - 1, row, count: 2.5, kind: 'crown' }); });
    rect(28, 43, SKY + 1, SKY + 1, T.SOLID);                              /* THE PARAPET WALK, three over the last tier: the carpet waits over it */
    ent('check', 30, F.bot - 1); ent('sign', 26, F.bot - 1, { text: 'THE CROWN. THE ROOF IS GONE. A DOOR STANDS OPEN ON THE PARAPET: HIS ROOM IS THROUGH IT.' });
    ent('check', 31, SKY); ent('sign', 40, SKY, { text: 'HIS CARPET FLIES WHERE YOU STEER IT. THE FLOOR BURNS. EVERY SPELL CAN BE OUT-FLOWN.' });
    deco('telescope', 36, F.bot - 1); deco('starChart', 24, F.top + 1, { hang: true });
    const who = ['imp', 'apprentice', 'bat', 'armour', 'tome', 'apprentice', 'haunt', 'imp', 'tome', 'bat', 'armour'];
    F.tiers.forEach(([x0, len, row], j) => put(who[j % who.length], x0, len, row));
  }
  /* THE SEAMS between floors, where a screen was empty: books over the cistern's poison, the gallery's top, the loft's floor, the crown's parapet */
  for (const [t, x, y] of [['tome', 28, floors[4].bot - 6], ['tome', 42, floors[4].bot - 7], ['tome', 26, floors[3].top + 3], ['bat', 50, floors[3].top + 2], ['apprentice', 14, floors[3].bot - 1],
    ['tome', 20, floors[0].top + 3], ['boo', 46, floors[0].top + 2], ['imp', 22, SKY + 3], ['tome', 48, SKY + 2]]) foe(t, x, y);
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
  /* ANYTHING SOLID INDOORS WEARS THE TOWER. Listing skins by hand is how the parapet and the crenellations came to be
     growing grass, and the same hole was still open three floors down: the library's bookcases, THE READING ROOM'S
     GALLERY - the one you walk on when the room turns over - and the cistern's floor were all bare, 334 cells of tower
     interior falling through to the default ground kit. So the rule is swept rather than listed, and any structure a
     future floor puts indoors is skinned the moment it is built. Runs of one row keep the list short.
     (T.SOLID only: the one-way ledges, planks, crystal and rope have looks of their own.) */
  const indoor = [];
  for (const [ix0, ix1, iy0, iy1] of interiors) for (let y = iy0; y <= iy1; y++) {
    let run = -1;
    for (let x = ix0; x <= ix1 + 1; x++) {
      const solid = x <= ix1 && L.grid[y * W + x] === T.SOLID;
      if (solid && run < 0) run = x;
      else if (!solid && run >= 0) { indoor.push([run, x - 1, y, y, 'fallen']); run = -1; }
    }
  }
  /* THE TOWER'S OWN STONE since 2026-09-25 ('fallen': src/redraw/fallen_tower.js), not the Folly's 'tower' brick - F6, the review's first complaint */
  const skins = [[0, X0 - 1, SKY - 4, H - 1, 'fallen'], [X1 + 1, W - 1, SKY - 4, H - 1, 'fallen']].concat(floors.slice(0, N - 1).map(F => [X0, X1, F.divider, F.divider + 1, 'fallen']),
    [[X0, X1, H - 6, H - 1, 'fallen'], [28, 43, SKY + 1, SKY + 1, 'fallen'], [SAND.x0 - 2, SAND.x1 + 2, SAND.sky, SAND.deep, 'sand']], indoor);
  const START = { x: 20, y: floors[0].bot - 1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools, falls: [], moversExtra, interiors, gusts: [], flips, glyphBridges, crumbles,   /* FAILING STONE: src/tower-collapse.js */
    music: 'fallingtower', night: true, nightA: 0.12, edgeLit: true, duskStart: 99999, duskLen: 1, hasCryst: true,
    towerAscent: true, carpetAt: { x: 36 * TS, y: SKY * TS }, fallingTower: true, stackedFloors: true, skyRow: SKY,
    /* THE ARCHMAGE'S SANCTUM (src/sanctum.js). `in` is the door on the parapet and stands exactly where the carpet used
       to lie, so the carpet's own board check opens it; `spawn` is where you come out, inside his hall and well over the
       fire; `sand` is where the second door puts you when he is down. `out` is not here because it is not decided here:
       the way out opens WHERE HE FALLS. */
    bellDeck: bell,   /* THE SEXTON's deck: its row, the frame over it and the joists he climbs out onto (main.js) */
    mini: { x0: 12 * TS, x1: 52 * TS, floor: bell.deck * TS, y0: bell.frame * TS, y1: (bell.deck + 4) * TS, trigger: 14 * TS, wallL: 12, gate: 52, boss: 'sexton', name: 'THE SEXTON' },
    sanctum: { in: { x: 36 * TS, y: SKY * TS }, spawn: { x: 14 * TS, y: 40 * TS }, sand: { x: (SAND.x0 + 2) * TS, y: SAND.row * TS }, out: null, open: false, outOpen: 0, t: 0 },
    tall: { top: SKY * TS, bottom: floors[0].bot * TS, col: '16,20,32', deepest: 0.16 },   /* the gloom is cold slate, not the Folly's violet */
    towerFloors: floors.map((F, k) => ({ name: F.name, top: F.top, bot: F.bot, hole: F.hole || null, last: k === N - 1 })),
    deckBreaks: breaks.map(([x0, x1, row]) => ({ x0, x1, row, t: -1, down: false, regrow: true })),   /* spine ledges: they come back (updateTowerAscent), or a fall into the water would be a soft-lock */
    mage: { shelves: [], skins, hedges: [], chains: [], hung, outside: 0, dais: [30, 40] },
    palette: { sky: 'mage', far: 'mage', mid: 'mage', near: 'mage', dress: 'village', haze: 'rgba(150,140,118,0.08)',
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
  crumbleInit(L);   /* every failing section is whole again: the tiles come back with the floors below */
  for (const f of L.towerFloors || []) { f.t = -1; f.front = null; f.done = false; f.sealed = false;
    for (let y = f.top - 2; y < f.bot; y++) for (let x = TOWER.X0; x <= TOWER.X1; x++) restore(x, y);
    /* a floor wholly under the checkpoint you come back to is already gone: put it straight back the way you left it */
    if (clear && !f.last && f.top - 6 > cpRow) { for (let y = f.top; y < f.bot; y++) for (let x = TOWER.X0; x <= TOWER.X1; x++) clear(x, y);
      if (f.hole && seal) for (let y = f.hole[1]; y <= f.hole[2]; y++) seal(f.hole[0], y); f.done = true; f.sealed = true; crumbleGone(L, f.top, f.bot); } }
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
      f.front = f.bot - 1; crumbleGone(L, f.top, f.bot);   /* its failing sections go with it and do not grow back into the air */
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
  /* THE FALLING TOWER HAS ITS OWN LOOK since 2026-09-25 (docs/briefs/falling-tower-rework.md §5): slate ledges, and none of the Folly's
     ribs and windows over its rooms - its rooms paint their own broken walls (src/redraw/fallen_tower.js) */
  L.palette.ledges = id === 'fallingtower' ? 'slate' : 'arcane'; L.towerBackdrop = id === 'mage';
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
    /* THE TOWER'S WINDOWS, AS WINDOWS (level review, 2026-09-24): a flat navy panel cut in four with two dots on it, and where a floor
       cut it off at the foot it read as a blank cupboard door. A stone surround with a pointed head and a sill, the night lighter
       toward the top of the glass, leaded lights, and a few stars. */
    for (let y = Math.floor(cy / 192) * 192 - 192; y < cy + g.canvas.height; y += 192) { const py = y - cy + 38, wx = px + 40;
      g.fillStyle = '#4a4464'; g.fillRect(wx - 3, py - 4, 41, 76); for (let k = 0; k < 8; k++) g.fillRect(wx + 17 - k * 2 - 3, py - 12 + k, k * 4 + 6, 1);   /* the surround, and its pointed head */
      g.fillStyle = '#161c36'; g.fillRect(wx, py, 35, 70); for (let k = 0; k < 6; k++) g.fillRect(wx + 17 - k * 3, py - 6 + k, k * 6 + 1, 1);
      g.fillStyle = '#1e2748'; g.fillRect(wx, py, 35, 22); g.fillStyle = '#26315a'; g.fillRect(wx + 2, py, 31, 8);                       /* the sky paler at the top of the glass */
      g.fillStyle = '#3b395d'; g.fillRect(wx + 16, py - 4, 3, 74); g.fillRect(wx, py + 34, 35, 2); for (let k = 12; k < 70; k += 12) if (k !== 36) g.fillRect(wx, py + k, 35, 1);   /* mullion, transom and the leads */
      g.fillStyle = '#6a6488'; g.fillRect(wx - 5, py + 70, 45, 3); g.fillStyle = '#827ca0'; g.fillRect(wx - 5, py + 70, 45, 1); g.fillRect(wx - 3, py - 4, 1, 74); /* the sill, lit edge */
      g.fillStyle = '#bec2d8'; g.fillRect(wx + 7, py + 10, 2, 2); g.fillRect(wx + 26, py + 25, 1, 1); g.fillRect(wx + 22, py + 4, 1, 1); g.fillRect(wx + 5, py + 45, 1, 1); } }
  g.restore();
}
export function gateOccupied(col, rows, actors) { return actors.some(p => p && !p.dead && rows.some(y => p.x + (p.w || 10) / 2 > col * 16 - 4 && p.x - (p.w || 10) / 2 < (col + 1) * 16 + 4 && p.y > y * 16 && p.y - (p.h || 14) < (y + 1) * 16)); }
