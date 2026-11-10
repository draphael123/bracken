/* src/silk-undercroft.js - THE SILK UNDERCROFT (claude/silk, the OPUS GREYBOX; scratch/brief-silkundercroft-1015.md, Daniel 10-15; behind SILK_SHIPS, src/sk-flag.js).
   Road: THE BURIAL CAVERNS -> (down out of the crypts) THE SILK UNDERCROFT -> THE WITCHLIGHT STAIR today (THE HOLLOW MANOR when it lands: the exit is the cellar stair up).
   A vast webbed undercroft BENEATH THE MANOR: grey-white silk over black stone, cocooned bodies, crypt columns half-wrapped, egg sacs; ONE accent, torch amber.
   THE LANDMARK: the manor's foundations loom overhead the whole level, glimpsed through the webs (src/silk-hands.js drawBack). RULE: 'SILK HOLDS WHAT TOUCHES IT.'
   THE VERBS (src/silk-hands.js runs them; every one DRAWN):
     BOUNCE   a TAUT web is a T.BOUNCER cell (the game's own spring): drawn tight, it shimmers. The reach fill knows its throw (8 rows).
     CUT      strike an ANCHOR STRAND's knot: what it held falls. COCOON = it drops on what is under it; BRIDGE = a high web bridge collapses into a ramp.
              The built grid holds BOTH the bridge and the ramp (the permissive state the reach and quality tools read); the hands make the ramp AIR until the cut.
     BURN     strike a SCONCE to carry a TORCH (30 s); a torch-bearer's blow burns a STICKY WEB WALL away (SOLID while whole; AIR in the built grid, the hands
              make it whole on a reset) and an EGG SAC. STICKY GOO on the floor slows a hero and PINS a foe.
   SECTIONS (Rootway recipe: TEACH -> TEST -> REMIX -> EXAM; one REQUIRED use of each verb before the boss, tools/silk.mjs proves each):
                          0-59  THE CRYPT DOOR       TEACH  out of the crypts, down; the first taut web (REQUIRED BOUNCE), the first cocoon, the first sconce + sticky wall
                         60-139 THE HANGING HALL     TEST   lurkers over firm ground, a sac, the high bridge (REQUIRED CUT) up to the gallery; the gallery-nook silver
                        140-209 THE EGG GALLERY      REMIX  goo, sacs, spitters on ledges, the sealed tunnel (REQUIRED BURN); SHRINE ONE
                        210-273 THE MOTHER'S STRANDS EXAM   A14: taut webs and strands over the net, a lurker, a spitter on a crypt column, a burn mid-route; the net-shelf silver
                        274-287 THE CELLAR STAIR            SHRINE TWO
                        288-339 THE CATHEDRAL WEB    BOSS   THE CRYPT MOTHER (src/crypt-mother.js)
   THE SILK NET under every pit: a hero whose feet pass sk.catchY is caught and put back on the last firm footing (16, spare: never a death).
   CHECKPOINTS (Daniel: fewer): START + 2 shrines. L.checkRun 200: the filler adds none. Placed wholly by hand (calm).
   FOES: SPIDERLINGS and WEB-SPITTERS are the existing spider in their own skins (cnSkin 'skling' / 'skspitter'; src/silk-hands.js runs them); THE SILK LURKER
   ('silklurker') is the level's one new foe. No goblins (act IV). */
import { SK_RULE, SK_SAY } from './sk-lines.js';

export const SK = {
  W: 340, H: 44,
  catchY: 38 * 16,            /* px: a hero whose feet pass this line is in THE SILK NET */
  arena: { x0: 288, x1: 338, wallL: 287, wallR: 339, trigger: 291, floor: 32 },
};
export const SECTIONS = [['THE CRYPT DOOR', 0, 60], ['THE HANGING HALL', 60, 140], ['THE EGG GALLERY', 140, 210], ["THE MOTHER'S STRANDS", 210, 274], ['THE CELLAR STAIR', 274, 288], ['THE CATHEDRAL WEB', 288, 340]];
/* THE REQUIRED USES (tools/silk.mjs: without the verb the far side is out of reach, with it in reach) */
export const REQUIRED = { bounce: { web: 'tw0', far: [33, 28] }, cut: { anchor: 'an1', far: [100, 17] }, burn: { wall: 'sw1', far: [175, 23] } };

export function buildSilkUndercroft({ painter, T, TS }) {
  const { W, H } = SK;
  const L = painter(W, H), { set, ent } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const ground = (x0, x1, top) => fill(x0, x1, top, H - 1, T.SOLID);
  const roof = (x0, x1, bottom) => fill(x0, x1, 0, bottom, T.SOLID);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const strands = [], webs = [], anchors = [], walls = [], sconces = [], sacs = [], goos = [], pits = [];
  /* A SILK STRAND: a one-way web shelf (the frames: tools/solid-islands.mjs reads them as hullZones) */
  const strand = (x0, x1, y) => { fill(x0, x1, y, y, T.ONEWAY); strands.push([x0, x1, y]); };
  /* A TAUT WEB: spring cells, drawn tight */
  const taut = (x0, x1, y) => { fill(x0, x1, y, y, T.BOUNCER); const w = { id: 'tw' + webs.length, x0, x1, y }; webs.push(w); ent('skweb', x0, y - 1, { id: w.id, w: x1 - x0 + 1 }); return w; };
  /* AN ANCHOR STRAND: the knot (col, row) a blow cuts. o.cocoon = { col, top, floor } | o.bridge = { hold: [[x, y]..], ramp: [[x, y]..] } | o.knot (the Mother's) */
  const anchor = (kx, ky, kind, o = {}) => { const a = { id: 'an' + anchors.length, kind, col: kx, row: ky, x: kx * TS + 8, y: ky * TS + 8, ...o }; anchors.push(a); ent('skanchor', kx, ky, { id: a.id, kind }); return a; };
  /* A STICKY WEB WALL: column x, rows y0..y1 - AIR in the built grid (burned: the permissive state), made whole by the hands */
  const wall = (x, y0, y1) => { const w = { id: 'sw' + walls.length, x, y0, y1 }; walls.push(w); ent('skwall', x, y1, { id: w.id, h: y1 - y0 + 1 }); return w; };
  const sconce = (x, y) => { const s = { id: 'sc' + sconces.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y }; sconces.push(s); ent('sksconce', x, y, { id: s.id }); return s; };
  const sac = (x, y) => { const s = { id: 'es' + sacs.length, x: x * TS + 8, y: (y + 1) * TS, col: x, row: y }; sacs.push(s); ent('sksac', x, y, { id: s.id }); return s; };
  const goo = (x0, y, w) => { const g = { id: 'gp' + goos.length, x0, x1: x0 + w - 1, y }; goos.push(g); ent('skgoo', x0, y, { id: g.id, w }); return g; };
  const pit = (x0, x1) => pits.push({ x0, x1 });
  const foe = (t, x, y, squad, o = {}) => ent(t, x, y, { squad, ...o });
  const ling = (x, y, squad) => ent('spider', x, y, { squad, cnSkin: 'skling' });
  const spitter = (x, y, squad) => ent('spider', x, y, { squad, cnSkin: 'skspitter', face: -1 });
  const lurker = (x, y, squad) => ent('silklurker', x, y, { squad });

  // ================= 1. THE CRYPT DOOR (0-59): TEACH =================
  fill(0, 0, 0, H - 1, T.SOLID); roof(0, 59, 14);
  ground(0, 12, 24); sign(2, 23, SK_SAY.start);                                     /* the last crypt step: from here the road goes DOWN */
  ground(13, 18, 28); ground(19, 30, 35); coins([15, 27], [17, 27]);
  ling(20, 34, 'doorLing');
  sign(23, 34, SK_SAY.bounce); taut(27, 29, 35);                                    /* THE FIRST TAUT WEB: the shelf is six rows up - only the web throws you there (REQUIRED BOUNCE) */
  coins([28, 31], [28, 29]);
  ground(31, 37, 29); sign(33, 28, SK_SAY.cut);
  anchor(36, 27, 'cocoon', { cocoon: { col: 42, top: 22, floor: 33 } });          /* THE FIRST ANCHOR, on the shelf's lip: cut it and the cocoon drops on the pair below */
  ground(38, 57, 33); ling(41, 32, 'cocoonPair'); ling(43, 32, 'cocoonPair');
  strand(44, 50, 29); coins([46, 28], [48, 28]);
  sign(45, 32, SK_SAY.torch); sconce(47, 32);
  sign(50, 32, SK_SAY.sticky); wall(52, 15, 32);                                    /* THE FIRST STICKY WALL, floor to roof: take the torch, burn it */
  goo(53, 32, 4); ling(55, 32, 'gooLing'); ground(58, 59, 31); coins([58, 30]);

  // ================= 2. THE HANGING HALL (60-139): TEST =================
  roof(60, 139, 6);
  ground(60, 95, 29); sign(61, 28, SK_SAY.hall); sign(64, 28, SK_SAY.lurker);
  fill(63, 64, 29, 33, T.AIR); fill(65, 75, 31, 33, T.AIR); taut(63, 64, 34); coins([71, 33], [72, 33], [73, 33], [74, 33], [75, 33]);   /* A BURIAL NICHE under the hall floor: drop in, its web throws you back out (a pocket that pays) */
  lurker(69, 7, 'hallLurker');                                                      /* THE LURKER taught over firm ground: the thread first */
  strand(70, 76, 24); coins([72, 23], [74, 23]);
  sign(75, 28, SK_SAY.sac); sac(78, 28);
  /* THE HIGH BRIDGE (REQUIRED CUT): tied to a floor stake at col 82; its far end hangs at the gallery's lip, nine rows up. Cut the stake: it swings down into a ramp */
  sign(80, 28, SK_SAY.bridge);
  const hold = [], ramp = []; for (let x = 84; x <= 95; x++) hold.push([x, 18]); for (let i = 0; i <= 11; i++) ramp.push([84 + i, 28 - Math.round(i * 9 / 11)]);
  for (const [x, y] of hold) set(x, y, T.ONEWAY); for (const [x, y] of ramp) set(x, y, T.ONEWAY);
  anchor(82, 28, 'bridge', { hold, ramp });
  spitter(91, 28, 'hallSpitter');
  ground(96, 139, 18);                                                              /* THE GALLERY LEDGE */
  ling(100, 17, 'galleryLings'); ling(103, 17, 'galleryLings'); coins([98, 17], [105, 17]);
  lurker(110, 7, 'galleryLurker'); strand(106, 114, 15); coins([108, 14], [112, 14]); strand(62, 67, 25); strand(86, 91, 24);
  taut(119, 121, 18); strand(122, 131, 11); ent('silver', 130, 10); coins([125, 10], [126, 10], [127, 10], [128, 10]);   /* SECRET ONE: a taut web up into the roof's nook */
  strand(128, 136, 15); spitter(134, 14, 'gallerySpitter'); ling(130, 17, 'galleryTail'); coins([137, 17]);

  // ================= 3. THE EGG GALLERY (140-209): REMIX =================
  roof(140, 209, 11);
  ground(140, 209, 24); sign(141, 23, SK_SAY.gallery);
  goo(144, 23, 6); ling(146, 23, 'gooPair'); ling(148, 23, 'gooPair');
  strand(150, 157, 19); coins([152, 18], [155, 18]); strand(141, 148, 19); strand(158, 165, 19); strand(199, 208, 19);
  sconce(163, 23); wall(168, 12, 23);                                               /* THE SEALED TUNNEL (REQUIRED BURN): roof to floor */
  coins([160, 23], [165, 23]);
  sign(171, 23, SK_SAY.spitter); strand(176, 184, 19); spitter(180, 18, 'ledgeSpitter'); sac(178, 23);
  ling(186, 23, 'tunnelLings'); ling(188, 23, 'tunnelLings');
  strand(189, 196, 19); spitter(193, 18, 'ledgeSpitter2'); sac(196, 23); coins([182, 23], [191, 23]);
  sconce(203, 23); ent('check', 199, 23);                                           /* SHRINE ONE */

  // ================= 4. THE MOTHER'S STRANDS (210-273): EXAM =================
  roof(210, 287, 5);
  ground(210, 215, 24); sign(211, 23, SK_SAY.strands);
  pit(216, 250);
  strand(216, 222, 24); ling(219, 23, 'strandLing');
  taut(225, 227, 22);                                                               /* a taut sheet in the gap: up to the high strand */
  strand(229, 240, 16); lurker(236, 6, 'strandLurker'); coins([231, 15], [233, 15]);
  strand(243, 249, 19); ling(246, 18, 'strandLing2');
  taut(243, 244, 24); strand(245, 250, 24); ent('silver', 250, 23); coins([247, 23], [248, 23], [249, 23]);   /* SECRET TWO: a shelf in the net under the strand; its own web throws you back up */
  fill(251, 252, 19, H - 1, T.SOLID); sconce(251, 18); spitter(252, 18, 'columnSpitter');   /* a crypt column out of the net: a sconce on it, a spitter on top */
  pit(253, 262); strand(253, 262, 18); wall(255, 6, 17);                           /* a sticky sheet hangs over the last strand: burn it mid-route */
  ground(263, 285, 21); strand(266, 272, 17); strand(275, 280, 17); sac(267, 20); ling(270, 20, 'bankLings'); ling(272, 20, 'bankLings'); coins([264, 20], [274, 20]);

  // ================= 5. THE CELLAR STAIR (274-287) =================
  sign(277, 20, SK_SAY.gate); ent('check', 282, 20);                               /* SHRINE TWO */
  ground(286, 287, 26); sign(285, 20, SK_SAY.exit);

  // ================= 6. THE CATHEDRAL WEB (288-339): THE CRYPT MOTHER =================
  const A = SK.arena, F = A.floor;
  roof(288, 339, 3);
  ground(288, 293, F); ground(334, 339, F); fill(339, 339, 0, H - 1, T.SOLID); pit(294, 333);
  const secs = [[294, 303], [304, 313], [314, 323], [324, 333]]; for (const [a, b] of secs) strand(a, b, F);   /* the floor strands over the pit (P2 cuts them) */
  const aWebs = [taut(291, 292, F), taut(335, 336, F)];
  strand(289, 292, 24); strand(335, 338, 24);                                       /* the high ledges at the walls, a bounce up */
  strand(296, 302, 26); strand(304, 309, 23); strand(309, 318, 20); strand(318, 323, 23); strand(325, 331, 26);   /* the tiers */
  const knots = [anchor(289, 22, 'knot'), anchor(313, 18, 'knot'), anchor(338, 22, 'knot')];
  const aSc = [sconce(290, F - 1), sconce(337, F - 1)];
  ent('cryptmother', 313, 19, { face: -1 });   /* (on the top tier: she spawns at her hang point, src/crypt-mother-hands.js) */
  const arena = { x0: A.x0 * TS, x1: (A.x1 + 1) * TS, floor: F * TS, y0: 4 * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'cryptmother', music: 'boss3', tint: '#d8d8e8', tintA: 0.05,
    /* THE FIGHT'S GEOMETRY (src/crypt-mother.js geom): her knots, her hang point, the floor sections P2 cuts, the arena's sconces and webs */
    knots: knots.map(k => k.id), hang: { x: 313 * TS + 8, y: 12 * TS }, secs: secs.map(([a, b]) => ({ x0: a, x1: b, row: F })), sconces: aSc.map(s => s.id), webs: aWebs.map(w => w.id),
    exitStair: { x: 286 * TS, y: 26 * TS } };

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 23 }, pools: [], falls: [],
    arena, silk: true,
    sk: { strands, webs, anchors, walls, sconces, sacs, goos, pits, catchY: SK.catchY, sections: SECTIONS },
    calm: [[0, W - 1, 0, H - 1]], noCoin: [[A.x0, W - 1, 0, H - 1]],
    checkRun: 200,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: A.x0, hi: W - 1, spots: 0, why: 'THE CATHEDRAL WEB: the boss arena - no squad stands in it' }],
    unlocks: [
      { kind: 'skweb', opens: 'a taut web: a spring throw to a ledge', hud: SK_RULE },
      { kind: 'skanchor', opens: 'an anchor strand: what it holds falls (a cocoon, a bridge into a ramp, the Mother)', hud: SK_SAY.cut },
      { kind: 'sksconce', opens: 'a torch: burns sticky silk and egg sacs, lights the dark', hud: SK_SAY.torchOn },
      { kind: 'skwall', opens: 'a passage, burned open', hud: SK_SAY.burned },
    ],
    duskStart: -1, duskLen: 1, music: 'cave', night: true, glowNight: true, dark: 0.38,
    palette: { sky: [[8, 8, 12], [30, 30, 38]], far: 'unburied', mid: 'unburied', near: 'none', dress: 'none', ledges: 'beam', haze: 'rgba(220,220,235,0.08)', darkCol: '6,6,10',
      dirt: '#26262c', dirtL: '#4a4a54', dirtD: '#121216', grass: '#b8b8c4', grassL: '#e6e6ee', grassD: '#6a6a78' },
    ambient: [{ x0: 0, x1: 99999, kind: 'drip' }],
    /* THE STRANDS, WEBS AND THE BRIDGE ARE THE FRAMES (tools/solid-islands.mjs): silk is drawn as the silk that holds them (src/silk-hands.js drawOver; the art lane's own kit) */
    hullZones: strands.map(([a, b, y]) => [a, b, y, y]).concat(webs.map(w => [w.x0, w.x1, w.y, w.y]), [[84, 95, 18, 28]]),
    reachExact: false,
    skRule: SK_RULE,
  };
}
