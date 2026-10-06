// src/glass-sea.js - THE GLASS SEA, desert arc level 4 (claude/glasssea, the OPUS GREYBOX: geometry, the mirror rule, the encounters, the wiring).
// Brief: scratch brief-glasssea (written overnight 2026-10-05 without Daniel's concept interview: every RECOMMENDED option built; the open choices
// are listed at the end of work/claude/lane-done/claude-glasssea.md). Main road: redgorge > GLASSSEA (> suntemple, the fork, 4b, built later).
// The draft it grew from is src/draft/glass-sea.js (tools/draft-level.mjs glass-sea measures that older structure); this is the level the game runs.
//
// THE RULE: TURN THE MIRRORS TO AIM THE SUN; SHADE BY DAY, FIRE BY NIGHT.
// THE VERB is TURN (E at a mirror, three told notches: TO THE SKY / one way / the other). A sun-mirror catches the sun (from above, or the low sunset
// ray at the obelisk, or THE COLOSSUS's GAZE on its steps) and throws it as a DRAWN beam (src/light.js: whole tiles, a mirror turns it 90 degrees)
// that ends in a TARGET RING where it lands. A day beam on a SAND BED FUSES it into a glass bridge or stair (src/glass-sea-hands.js); turned away, the
// glass crumbles back to sand. A day beam DAZZLES a glass scorpion. By NIGHT a mirror over a CAMPFIRE relays its light instead: firelight on a CRACK
// HOLDS its swarm (a crack that is not held BOILS - the swarm will not let you over it) and warms you.
// THE BACKDROP OF THE RULE: the sun sets at THE FORK OBELISK (L.sunsetX). West of it SUNSTROKE (src/sunstroke.js: shade is life); east of it the
// COLD (the frost meter, src/glass-sea-hands.js: firelight is life). The sky, the meter and the shade colour say which.
// THE SLICK GLASS: every glass slope slides faster and every glass floor stops harder (L.glassFrom: from the edge of the sand on).
//
// THE THEMED KEY: five GLASS SHARDS (L.quest). With all five, THE VAULT MIRROR on the Colossus Steps turns: its beam fuses the stair to THE SILVER
// VAULT (a silver; no relic). The HUD counts them (SHARDS n/5).
//
// SEVEN SECTIONS (columns; the sand's surface is mostly row 34; cracks are pits to row 44):
//   0-95     THE GLASS EDGE        TEACH    a slick slope down to the first shade; THE FIRST MIRROR fuses the stair up the dune cliff (REQUIRED, no risk)
//   96-195   THE FULGURITE FIELD   TEACH 2  lightning spires (overhangs = shade); a mirror fuses a stair to a spire's silver (optional); THE SLIDE GAP:
//                                           slide down the slick glass and leap the crack (REQUIRED); glass scorpions (a beam dazzles one)
//   196-295  THE BONE CROSSING     TEST     SET PIECE ONE, THE SUN-MIRROR BRIDGE: a glass sentinel by the mirror, a shard thrower on the far lip, vultures
//                                           (their shadow is shade): turn it and the beam walks across the crack fusing the road (REQUIRED)
//   296-371  THE FORK OBELISK      REMIX    the two-mirror chain: the low sunset ray into mirror A, up to mirror B on the obelisk, across to the Head's
//                                           gap (REQUIRED, the one the brief names); THE SUN SETS here; the way to THE SUN TEMPLE is shut (4b, later)
//   372-451  THE SUNKEN HEAD       SET PIECE TWO: a stone giant's head tilted in the glass: climb its cheek, ear and crown (the boss's rehearsal);
//                                           a shard in its mouth; slide down the back of its skull into the night
//   452-571  THE COLD FLATS        REMIX (night)  fires and cracks; a crack in a fire's light is held; THE DARK CUT: relay a fire with a mirror onto
//                                           the crack that boils across the only way (REQUIRED); night hunters freeze in firelight; throwers
//   572-603  THE COLOSSUS STEPS    EXAM     the slick stair, the fires, THE GAZE: bend the Colossus's own light onto the sand to fuse the bridge AND
//                                           relay a fire onto the crack beside it, throwers on the far steps; the vault mirror; the arena's two
//                                           shelf-mirrors in view
//   604-643  THE GLASS COLOSSUS    BOSS     src/glass-colossus.js stageColossus (a PUZZLE boss: the rule personified)
import { stageColossus, COLOSSUS_STAGE } from './glass-colossus.js';

export const GLASS = { W: 648, H: 46, base: 34, pit: 44 };
export const SECTIONS = [['THE GLASS EDGE', 0], ['THE FULGURITE FIELD', 96], ['THE BONE CROSSING', 196], ['THE FORK OBELISK', 296], ['THE SUNKEN HEAD', 372], ['THE COLD FLATS', 452], ['THE COLOSSUS STEPS', 572], ['THE GLASS COLOSSUS', 604]];
/* each verb's arc (tile columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/glasssea.mjs */
export const ARCS = {
  mirror: { teach: [36, 50], test: [218, 246], remix: [304, 360], remix2: [500, 530], exam: [574, 600], boss: [604, 643] },   /* the first stair; the bridge; the chain; the night relay; the gaze + relay; the lance */
  slick: { teach: [12, 20], test: [128, 150], remix: [400, 420], exam: [574, 584] },                                        /* the first slide; the slide gap; the skull's back; the steps */
  shade: { teach: [20, 28], test: [196, 296], remix: [452, 571], exam: [574, 603] },                                        /* shade by day, fire by night */
};
export const SUNSET_X = 334;   /* the column the sun goes down at (THE FORK OBELISK) */

export function buildGlassSea({ painter, T, TS }) {
  const { W, H, base: B, pit: PIT } = GLASS;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const ropes = []; const rope = (x, y0, y1) => ropes.push([x, y0, y1]);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  /* THE CAST (src/glass-sea-hands.js gives each its twist; every one a proven machine under a skin but the swarm):
     GLASS SCORPION (scorpion: shatters into a shard patch, a day beam dazzles it), SHARD THROWER (slinger: THE RANGED ONE, the rule's pressure),
     NIGHT HUNTER (cutthroat: moves only in the dark, freezes in firelight), GLASS SENTINEL (the shield guard: front guard, go round or come down on it),
     VULTURE (the desert's own: its shadow is moving shade), and THE CRACK SWARM's SKITTERS (the one new foe: src/glass-foes.js) */
  const glassS = (x, y, squad, o) => foe('scorpion', x, y, squad, Object.assign({ cnSkin: 'glassscorpion' }, o || {}));
  const thrower = (x, y, squad, o) => foe('slinger', x, y, squad, Object.assign({ cnSkin: 'shardthrower' }, o || {}));
  const hunter = (x, y, squad, o) => foe('cutthroat', x, y, squad, Object.assign({ cnSkin: 'nighthunter' }, o || {}));
  const sentinel = (x, y, squad, o) => foe('shield', x, y, squad, Object.assign({ cnSkin: 'glasssentinel' }, o || {}));
  const vulture = (x, y, squad) => foe('vulture', x, y, squad);
  const skitter = (x, y, squad) => foe('skitter', x, y, squad);
  /* THE RULE'S PIECES (src/glass-sea-hands.js): mirrors (E turns them), the beams' sources, the sand beds a day beam fuses, the cracks (a pit; by night
     a swarm boils out of one unless firelight holds it), the campfires, the shade (static boxes, px), the slick zones */
  const mirrors = [], sources = [], beds = [], cracks = [], fires = [], shade = [], decor = [], interiors = [], vaultDoors = [], dunes = [];
  /* a MIRROR on a post: the glass at (x, y); notches: the states E steps through, in order (light.js '/', '\\', and 'sky' = tilted to the sky: the beam ends
     there). shards: it will not turn until you carry that many glass shards (the vault mirror) */
  const mirror = (id, x, y, notches, o) => { mirrors.push(Object.assign({ id, x, y, notches, n: 0 }, o || {})); ent('gsmirror', x, y, { id }); };
  const source = (id, x, y, dir, kind) => sources.push({ id, x, y, dir, kind });
  /* a SAND BED: a day beam that ends on its target tile (tx, ty) fuses `tiles` ([x, y] pairs) to glass (ONEWAY by default); fused from `from` outward */
  const bed = (id, tx, ty, tiles, o) => beds.push(Object.assign({ id, tx, ty, tiles }, o || {}));
  const span = (x0, x1, y) => { const out = []; for (let x = x0; x <= x1; x++) out.push([x, y]); return out; };
  /* a CRACK: a pit from the surface row y down to the pit floor; swarm: a night crack (it boils unless held: firelight on its target ring, or a
     campfire within reach) */
  const crack = (id, x0, x1, y, o) => { air(x0, x1, y, PIT - 1); block(x0, x1, PIT, H - 1); cracks.push(Object.assign({ id, x0, x1, y }, o || {})); };
  const fire = (id, x, y) => { fires.push({ id, x, y }); ent('gscampfire', x, y, { id }); };
  const shadeBox = (x0, x1, y0, y1) => shade.push([x0 * TS, (x1 + 1) * TS, y0 * TS, (y1 + 1) * TS + 1]);
  /* a dead bone skiff: its lee is shade (drawn by the hands, greybox) */
  const skiff = (x, y) => { decor.push({ kind: 'skiff', x, y }); shadeBox(x - 2, x + 2, y - 2, y); };
  const shardAt = (x, y) => ent('stray', x, y, { kind: 'glassshard' });
  /* THE GROUND: solid from the surface row down; slopes on rock (src/slopes.js) */
  const ground = (x0, x1, top) => block(x0, x1, top, H - 1);
  const upS = (x, top) => { set(x, top - 1, T.SLOPE_R1); block(x, x, top, H - 1); };                                       /* one row up, steep: the new surface is top - 1 */
  const upG = (x, top) => { set(x, top - 1, T.SLOPE_R2A); set(x + 1, top - 1, T.SLOPE_R2B); block(x, x + 1, top, H - 1); }; /* one row up over two columns */
  const dnS = (x, top) => { set(x, top, T.SLOPE_L1); block(x, x, top + 1, H - 1); };                                        /* one row down, steep: the new surface is top + 1 */
  const dnG = (x, top) => { set(x, top, T.SLOPE_L2B); set(x + 1, top, T.SLOPE_L2A); block(x, x + 1, top + 1, H - 1); };
  /* a run of slopes: n steps from surface `top`, returns the new surface */
  const rise = (x, top, n, gentle) => { for (let i = 0; i < n; i++) { if (gentle) upG(x + i * 2, top - i); else upS(x + i, top - i); } return top - n; };
  const fall = (x, top, n, gentle) => { for (let i = 0; i < n; i++) { if (gentle) dnG(x + i * 2, top + i); else dnS(x + i, top + i); } return top + n; };

  // ================= 1. THE GLASS EDGE (0-95): TEACH - the slide, the shade, the first mirror =================
  ground(0, 11, 30);
  sign(7, 29, 'THE GLASS SEA. TURN THE MIRRORS TO AIM THE SUN; SHADE BY DAY, FIRE BY NIGHT.');
  fall(12, 30, 4, true);                                                   /* the first slick slope (gentle, 8 columns): THE FIRST SCREEN ASKS - hold down and slide */
  ground(20, 47, B);
  skiff(23, B - 1);                                                        /* the first shade, at the slope's foot */
  sign(27, B - 1, 'THE SUN BURNS IN THE OPEN. STAND IN SHADE TO COOL.');
  glassS(31, B - 1, 'edgeScorp'); skiff(37, B - 1);   /* (a second skiff before the mirror: no walk in the sun over SUN.maxWalk; (fix pass) moved to 37: its shade (35-39) covers the hero at the mirror, so the first TURN is out of the sun) */
  /* THE FIRST MIRROR (TEACH, REQUIRED, no risk): the dune cliff at 48 is five rows; the mirror's beam fuses the stair against it */
  mirror('first', 40, B - 2, ['sky', '\\', '/']); source('first', 40, B - 3, 'S', 'sun');
  sign(37, B - 1, 'A SUN-MIRROR. E TURNS IT: ITS BEAM FUSES SAND TO GLASS.');
  bed('firstStair', 47, B - 2, [...span(42, 44, B - 2), ...span(45, 47, B - 4)], { label: 'THE STAIR' });   /* two steps of two rows to the cliff's top (row 29) */
  ground(48, 69, B - 5);
  block(55, 61, B - 10, B - 10); decor.push({ kind: 'spire', x: 58, y: B - 6, top: B - 10 });   /* A FULGURITE SPIRE's overhang: rock four rows over the head (shade) */
  vulture(62, B - 9, 'edgeVult');
  glassS(66, B - 6, 'edgeScorp2', { face: -1 });
  { const t = fall(70, B - 5, 5, false); ground(75, 95, t); }               /* a steep slick slope back down to the sand */
  skiff(80, B - 1);
  sentinel(88, B - 1, 'edgeSentinel');                                     /* the first sentinel: front guard, go round */

  // ================= 2. THE FULGURITE FIELD (96-195): spires, the optional stair, THE SLIDE GAP =================
  ground(96, 127, B);
  block(100, 105, B - 5, B - 5); decor.push({ kind: 'spire', x: 102, y: B - 1, top: B - 5 });   /* spire A's overhang (shade) */
  /* THE SPIRE LEDGE (optional): a tall spire, its top ledge a silver and the first glass shard; a mirror fuses the stair up its flank */
  boards(115, 119, B - 12); decor.push({ kind: 'spire', x: 117, y: B - 1, top: B - 12, tall: true }); shadeBox(114, 120, B - 12, B - 1);   /* (the spire is behind the road: only its top ledge stands) */
  ent('silver', 117, B - 13); shardAt(119, B - 13);
  mirror('spire', 108, B - 2, ['sky', '\\', '/']); source('spire', 108, B - 3, 'S', 'sun');
  bed('spireStair', 115, B - 2, [...span(110, 112, B - 3), ...span(112, 113, B - 6), ...span(113, 114, B - 9)], { label: 'THE SPIRE STAIR' });
  glassS(122, B - 1, 'fieldScorp'); skiff(126, B - 1);                                         /* in the spire mirror's beam row: a beam on it dazzles it (taught once) */
  sign(105, B - 1, 'A BEAM ON GLASS DAZZLES IT.');
  /* THE SLIDE GAP (TEST, REQUIRED): up a gentle glass rise, then a steep slick run down and over the crack - slide (hold down) and leap at the foot */
  { let t = rise(128, B, 3, true); ground(134, 136, t); t = fall(137, t, 5, false);   /* 137-141 down to row 36 */
    ground(142, 142, t); crack('slideGap', 143, 147, t); ground(148, 160, t - 1); }
  sign(135, B - 4, 'GLASS SLOPES ARE SLICK. HOLD DOWN TO SLIDE; LEAP AT THE FOOT.');   /* (fix pass) on the crest itself, where the slick run starts */
  block(150, 155, B - 5, B - 5); decor.push({ kind: 'spire', x: 152, y: B, top: B - 5 });   /* shade on the landing */
  upS(161, B + 1); ground(162, 195, B);
  vulture(170, B - 8, 'fieldVult'); skiff(168, B - 1); ent('check', 165, B - 1);   /* CHECKPOINT ONE, past the slide gap (the crossing's fight is its stretch) */
  glassS(174, B - 1, 'fieldPair'); glassS(178, B - 1, 'fieldPair');
  skiff(184, B - 1);
  thrower(192, B - 4, 'fieldThrow'); block(190, 195, B - 3, B - 1);         /* a thrower on a fused ridge over the way into the crossing */
  decor.push({ kind: 'ridge', x0: 190, x1: 195, y: B - 3 });

  // ================= 3. THE BONE CROSSING (196-295): SET PIECE ONE - THE SUN-MIRROR BRIDGE (REQUIRED) =================
  ground(196, 229, B);

  skiff(205, B - 1); skiff(215, B - 1);
  glassS(212, B - 1, 'crossScorp'); glassS(216, B - 1, 'crossScorp'); thrower(208, B - 4, 'nearTerrace');   /* a thrower on the terrace behind you while you turn the mirror */
  /* THE MIRROR on the near lip, its sentinel in front of it; the beam runs along row 32 to the sand heap on the far lip: the bridge fuses at the
     surface from the near lip outward (the beam walking across) */
  mirror('bridge', 224, B - 2, ['sky', '\\', '/']); source('bridge', 224, B - 3, 'S', 'sun');
  sentinel(221, B - 1, 'mirrorGuard', { face: -1 }); sentinel(227, B - 1, 'mirrorGuard', { face: -1 });   /* two sentinels: one before the mirror, one on the lip behind it */
  sign(217, B - 1, 'THE BONE CROSSING. TURN THE MIRROR: THE BEAM FUSES A ROAD.');
  crack('crossing', 230, 241, B);
  bed('bridge', 243, B - 2, span(230, 241, B), { label: 'THE BRIDGE', walk: true });
  ground(242, 295, B);
  decor.push({ kind: 'heap', x: 243, y: B - 1 }); skiff(246, B - 1);   /* the far lip's shade: between it and the near lip's, only the vultures' shadows */                           /* the sand heap the beam lands on (its target ring) */
  vulture(234, B - 9, 'crossVult'); vulture(250, B - 10, 'crossVult2');      /* their shadows cross the bridge: moving shade in the open */
  block(248, 252, B - 3, B - 1); decor.push({ kind: 'ridge', x0: 248, x1: 252, y: B - 3 });   /* a fused ridge on the far lip */
  thrower(250, B - 4, 'farLip'); thrower(248, B - 4, 'farLip'); glassS(245, B - 1, 'farLipScorp'); sentinel(247, B - 1, 'farLipScorp');   /* two throwers on the far lip and a scorpion at the bridge's end: they meet you as you cross */                                            /* THE RANGED ONE on the far lip: he throws while you turn the mirror */
  skiff(258, B - 1); shardAt(258, B - 1);                                   /* SHARD TWO, in the skiff's ribs */
  glassS(266, B - 1, 'crossPair'); glassS(270, B - 1, 'crossPair'); sentinel(273, B - 1, 'crossPair');   /* the pair's sentinel in front of them */
  block(276, 281, B - 5, B - 5); decor.push({ kind: 'spire', x: 278, y: B - 1, top: B - 5 });
  sentinel(286, B - 1, 'crossSentinel');
  vulture(290, B - 9, 'obVult');

  // ================= 4. THE FORK OBELISK (296-359): REMIX - THE TWO-MIRROR CHAIN (REQUIRED); the sun sets =================
  ground(296, 345, B);
  ent('check', 300, B - 1); skiff(296, B - 1);                             /* CHECKPOINT TWO, at the fork */
  sign(303, B - 1, 'THE FORK OBELISK. THE SUN GOES DOWN HERE.');
  /* the way to THE SUN TEMPLE (4b, built later): a sealed door in the dune (decor + a sign) */
  decor.push({ kind: 'templeDoor', x: 307, y: B - 1 }); sign(309, B - 1, 'THE SUN TEMPLE. THE WAY IS SHUT.');
  /* THE CHAIN: the low sunset ray comes in along row 32 from the west saddle (the source at 313); MIRROR A (316) turns it UP its column to MIRROR B
     (row 23) over the boards; B turns it EAST along row 23 through THE OBELISK's EYE, over the plateau and the Head's gap, onto the sand heap set in
     the giant's cheek (361, 23). The bridge fuses at row 28 over THE SUNKEN HEAD's gap - the only way on */
  source('sunset', 313, B - 2, 'E', 'sunset');
  mirror('chainA', 316, B - 2, ['sky', '/', '\\']);
  sign(312, B - 1, 'TWO MIRRORS: THE LOW SUN, UP, AND ACROSS.');
  boards(318, 321, B - 3); boards(319, 322, B - 6); boards(317, 321, B - 9);   /* up to B's shelf (rows 31, 28, 25) */
  mirror('chainB', 316, B - 11, ['sky', '/', '\\']);                         /* B: over the top board, above A (its glass row 23) */
  block(323, 326, 10, B - 4); air(323, 326, B - 11, B - 11);                /* THE OBELISK, its EYE a hole at row 23 */
  decor.push({ kind: 'obelisk', x0: 323, x1: 326, top: 10, y: B - 1, eye: B - 11 });
  shadeBox(317, 330, 10, B - 1);                                            /* its bulk is shade */
  vulture(330, B - 9, 'obVult2');
  hunter(335, B - 4, 'duskHunter');                                         /* the first night hunter, just past the sunset (in the dark it moves) */
  /* the plateau's lip: two steps of glass blocks to row 28 */
  block(333, 345, B - 3, B - 1); block(337, 345, B - 6, B - 4);
  fire('obFire', 340, B - 7);                                               /* the first campfire, on the lip */
  /* THE HEAD'S GAP (346-359): a deep crack; the bridge is fused at row 28 from the plateau's lip to the Head's cheek */
  crack('headGap', 346, 359, B - 6);
  bed('headBridge', 361, B - 11, span(346, 359, B - 6), { label: 'THE ROAD TO THE HEAD', walk: true });

  // ================= 5. THE SUNKEN HEAD (360-399): SET PIECE TWO - THE CLIMB =================
  /* a giant's stone head tilted in the glass, its face to the west. THE CHEEK (row 28) takes the bridge; up the face on its holds (the nose ridge row 25,
     the brow rows 22 and 19 - the glow marks each) to THE CROWN (row 17); THE EAR, an alcove off the nose ridge, hides a shard. Off the crown's east end the
     back of the skull is a long steep slick slope down into the night. A fall off the face lands on the cheek (it costs the climb, never a life) */
  block(360, 399, 17, H - 1);                                               /* the head's bulk (rock) */
  air(360, 368, 0, B - 7);                                                  /* the face's hollow over the cheek (open to the sky) */
  decor.push({ kind: 'head', x0: 360, x1: 399, y0: 15, y1: B - 1 });
  boards(361, 368, B - 9); boards(362, 365, B - 12); boards(365, 368, B - 15);   /* THE HOLDS: rows 25, 22, 19 */
  air(369, 372, B - 11, B - 10); interiors.push([369, 372, B - 11, B - 10, 'gsEar']); shardAt(371, B - 10);   /* THE EAR (rows 23-24, floor row 25): shard three */
  fire('cheekFire', 363, B - 7);
  sign(366, B - 7, 'THE SUNKEN HEAD. CLIMB IT: THE GLOW MARKS THE HOLDS.');
  air(369, 382, 0, 16);                                                     /* the crown's top (row 17) under the open sky */
  fire('crownFire', 373, 16);
  hunter(379, 16, 'crownHunter');
  /* the back of the skull: off the crown's east end, a long steep slick slope down into the night (rows 17 -> 34) */
  air(383, 451, 0, 16); { let t = 17; for (let x = 383; x < 400; x++) { air(x, x, 0, t); dnS(x, t); t++; } }
  air(400, 451, 0, B - 1); ground(400, 451, B);
  fire('footFire', 404, B - 1);
  crack('headCrack', 409, 411, B, { swarm: true });                         /* a crack in the fire's light: HELD (the teach: a quiet crack beside a fire) */
  skitter(410, B - 1, 'flatsSwarm0');
  sign(406, B - 1, 'NIGHT. THE COLD BITES AWAY FROM FIRE. FIRELIGHT HOLDS THE CRACKS.');
  hunter(424, B - 1, 'flatsHunter0'); hunter(434, B - 1, 'flatsHunter0');   /* (fix pass) a second hunter at the skull's foot: the mash margin (the mash lows come from here and the crossing) */ thrower(429, B - 4, 'skullTerrace');   /* a thrower on the terrace over the skull's foot */
  block(432, 438, B - 3, B - 1); decor.push({ kind: 'ridge', x0: 432, x1: 438, y: B - 3 }); thrower(436, B - 4, 'flatsThrow0');
  fire('flatsFire0', 443, B - 1);
  ent('check', 446, B - 1);                                                 /* CHECKPOINT THREE: the night's first rest */

  // ================= 6. THE COLD FLATS (452-571): REMIX - FIRES, CRACKS, THE DARK CUT (REQUIRED relay) =================
  ground(452, 571, B);
  crack('flats1', 449, 451, B, { swarm: true });                           /* held by flatsFire0 */
  hunter(462, B - 1, 'flatsHunter1'); thrower(468, B - 4, 'flatsTerrace');   /* a thrower on the terrace over the flats */
  fire('flatsFire1', 470, B - 1);
  glassS(478, B - 1, 'flatsScorp');
  boards(482, 487, B - 3); boards(486, 490, B - 6); ent('silver', 488, B - 7); shardAt(483, B - 4);   /* a glass shelf: SHARD FOUR, and a silver over it */
  hunter(484, B - 1, 'flatsPack'); hunter(488, B - 1, 'flatsPack'); skitter(486, B - 1, 'flatsPack'); skitter(490, B - 1, 'flatsPack');   /* THE DARK BETWEEN TWO FIRES: a hunting pack and the swarm with it */
  crack('flats2', 492, 494, B, { swarm: true });                           /* held: flatsFire2 */
  fire('flatsFire2', 497, B - 1);
  /* THE DARK CUT (REQUIRED): a long cut through a glass ridge with no fire in it; across it a crack BOILS. THE RELAY MIRROR stands over flatsFire3 at the cut's
     west end: turned EAST it throws the firelight along row 31 down the cut onto the crack's ring - held, and the cut is warm */
  block(505, 540, B - 7, B - 6); decor.push({ kind: 'cut', x0: 505, x1: 540, y0: B - 7, y1: B - 6 });   /* the ridge over the cut (rows 27-28: five rows of headroom, a crack can be leapt) */
  fire('flatsFire3', 502, B - 1);
  mirror('relay', 502, B - 3, ['sky', '/', '\\']); source('relay', 502, B - 2, 'N', 'fire');   /* the polished hood over the fire: its light comes UP into it */
  sign(499, B - 1, 'A MIRROR OVER THE FIRE: TURN IT TO THROW THE FIRELIGHT.');
  crack('darkCut', 520, 522, B, { swarm: true, ring: [523, B - 3] });       /* the boiling crack across the cut (its target ring on the far lip) */
  hunter(512, B - 1, 'cutHunter'); hunter(529, B - 1, 'cutHunter2');   /* two in the dark of the cut: frozen once the relay lights it */ thrower(532, B - 1, 'cutThrow', { face: -1 });
  skitter(521, B - 1, 'cutSwarm'); shardAt(536, B - 1);   /* SHARD FIVE, past the boiling crack */
  fire('flatsFire4', 544, B - 1);
  hunter(552, B - 1, 'flatsHunter2'); glassS(556, B - 1, 'flatsScorp2'); thrower(550, B - 4, 'flatsTerrace2');
  crack('flats3', 560, 562, B, { swarm: true });                           /* held by flatsFire5 */
  fire('flatsFire5', 566, B - 1);

  // ================= 7. THE COLOSSUS STEPS (572-603): THE EXAM - the slick stair, the fires, THE GAZE + THE RELAY =================
  /* three steep slick steps up to row 31. THE COLOSSUS's GAZE (its eyes, from the arena) shines west along row 26. THE GAZE MIRROR (588, on the perch at row
     28) turns it DOWN onto the sand heap at its foot: the bridge over THE STEPS' CRACK (590-594) fuses. The crack BOILS: THE STEPS' RELAY (over stepsFire,
     582) throws the firelight east along row 28 onto the crack's ring - both, or no crossing. Throwers on the far steps. The gaze mirror's third notch
     (UP) is stuck until you carry five glass shards: turned up, the gaze fuses THE VAULT STAIR to THE SILVER VAULT */
  { const t = rise(572, B, 3, false); ground(575, 589, t); }
  fire('stepsFire', 582, B - 4); hunter(577, B - 4, 'stepsHunter');
  mirror('stepsRelay', 582, B - 6, ['sky', '/', '\\']); source('stepsRelay', 582, B - 5, 'N', 'fire');
  source('gaze', 603, B - 8, 'W', 'gaze');
  mirror('gaze', 588, B - 8, ['sky', '/', '\\'], { shardNotch: 2 });        /* '/' sends the westward gaze DOWN; '\\' sends it UP (the vault notch, five shards) */
  boards(585, 589, B - 6);                                                  /* the gaze mirror's perch (row 28) */ boards(583, 584, B - 5);   /* (fix pass) a 2-row step up to it: no 3-row hop under the throwers */
  crack('steps', 590, 594, B - 3, { swarm: true, ring: [595, B - 6] });
  bed('stepsBridge', 588, B - 4, span(590, 594, B - 3), { label: 'THE STEPS\' BRIDGE', walk: true });
  ground(595, 603, B - 3);
  thrower(598, B - 4, 'stepsThrow'); glassS(596, B - 4, 'stepsScorp'); thrower(601, B - 4, 'stepsThrow2');
  /* THE SILVER VAULT: a glass shelf over the steps (row 19), its stair fused by the gaze turned UP (column 588 to the heap at row 20) */
  bed('vaultStair', 588, B - 14, [...span(589, 591, B - 9), ...span(591, 593, B - 12)], { label: 'THE VAULT STAIR' });
  boards(592, 597, B - 15); interiors.push([592, 597, B - 17, B - 16, 'gsVault']); ent('silver', 595, B - 16); 
  ent('check', 600, B - 4);                                                 /* CHECKPOINT FOUR: before the Colossus */

  // ================= THE GLASS TERRACES AND THE DUNES (a high road over the low one; no long level stretch) =================
  /* THE TERRACES: lightning-fused glass shelves (one-way) three rows over the sand - a high road beside the low one, never over a crack the rule bridges, a cliff the
     first mirror's stair climbs, the obelisk's chain or the steps' exam */
  for (const [x0, x1, y] of [[50, 66, B - 8], [77, 97], [158, 186], [194, 214], [255, 292], [413, 441], [453, 479], [544, 557], [564, 570]]) boards(x0, x1, y ?? B - 3);
  /* THE DUNES: a long level stretch of sand gets a low glass dune (a row up over two columns, two across, a row down) where nothing stands - every glass slope is slick */
  { const busy = new Set(); for (const e of L.ents) for (let d = -2; d <= 2; d++) busy.add(e.x + d);
    for (const m of mirrors) for (let d = -3; d <= 3; d++) busy.add(m.x + d);
    for (const c of cracks) for (let x = c.x0 - 3; x <= c.x1 + 3; x++) busy.add(x);
    for (const b of beds) { busy.add(b.tx); for (const [x] of b.tiles) busy.add(x); }
    for (const d of decor) for (let x = (d.x ?? d.x0) - 3; x <= (d.x1 ?? d.x) + 3; x++) busy.add(x);
    const flatAt = x => L.grid[B * W + x] === T.SOLID && L.grid[(B - 1) * W + x] === T.AIR && L.grid[(B - 2) * W + x] === T.AIR;
    let run = 0; for (let x = 0; x < 600; x++) { if (!flatAt(x)) { run = 0; continue; } run++;
      if (run >= 14 && x + 6 < 600) { let free = true; for (let d = -1; d <= 7; d++) if (busy.has(x + d) || !flatAt(x + d)) free = false;
        if (free) { set(x, B - 1, T.SLOPE_R2A); set(x + 1, B - 1, T.SLOPE_R2B); block(x + 2, x + 3, B - 1, B - 1); set(x + 4, B - 1, T.SLOPE_L2B); set(x + 5, B - 1, T.SLOPE_L2A); dunes.push(x); run = 0; x += 6; } } } }
  /* the rule's gadgets, as ents the level tools read: the sand heaps a beam lands on, the cracks */
  for (const b of beds) ent('gsheap', b.tx, b.ty, { id: b.id });
  for (const c of cracks) ent('gscrack', c.x0, c.y - 1, { id: c.id });

  // ================= THE GLASS COLOSSUS (src/glass-colossus.js) =================
  const AX = 604, AF = B;
  const stage = stageColossus({ set, block, ent, air }, T, TS, AX, AF);
  ground(AX, AX + COLOSSUS_STAGE.W - 1, AF);
  block(AX + COLOSSUS_STAGE.W, W - 1, 0, H - 1);
  air(AX, AX + COLOSSUS_STAGE.W - 1, 0, AF - 1);
  stage.carve();
  ent('gate', AX + COLOSSUS_STAGE.W - 2, AF - 1);

  // ================= THE ROPES, LAST =================
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  const START = { x: 4, y: 29 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [], interiors,
    arena: stage.arena, gateAfterBoss: true,
    glasssea: true, caravan: true,   /* caravan: the desert's hands in main.js (the sun, the creatures' machines, the sand skins) */
    sunsetX: SUNSET_X, glassFrom: 12,
    mirrors, sources, beds, cracks, fires, decor, vaultDoors, dunes,
    /* THE RULE'S STATE for tools/rule-state.mjs: the sun by day (to the obelisk), its absence - the cold - by night (to the Colossus) */
    sun: [{ x0: 0, x1: SUNSET_X }, { x0: SUNSET_X, x1: 604 }],
    shade, shadeArt: [],   /* (art pass: main.js's flat violet tint is off - src/redraw/glasssea_art.js drawShade paints the same boxes soft-edged, by day only) */
    quest: { n: 5, item: 'glassshard', name: 'SHARDS', done: 'FIVE SHARDS: THE VAULT MIRROR TURNS', thanks: 'THE VAULT MIRROR TURNS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,
    unlocks: [
      { kind: 'gsmirror', opens: 'its beam: a day beam on a sand bed fuses a bridge or a stair (turned away, it crumbles); a fire beam on a crack holds its swarm', hud: 'THE BEAM FUSES THE SAND / THE FIRELIGHT HOLDS THE CRACK' },
      { kind: 'stray', opens: 'THE VAULT MIRROR on the Colossus Steps once all five glass shards are carried: its stair to THE SILVER VAULT (a silver)', hud: 'SHARDS n/5 - A MIRROR BRIDGE WAITS (the quest counter)' },
      { kind: 'gscampfire', opens: 'warmth (the cold meter) and the cracks near it (held: no swarm)', hud: 'THE FIRE HOLDS THE CRACK' },
    ],
    music: 'glasssea',
    ambient: [{ x0: 0, x1: SUNSET_X * TS, kind: 'glassday' }, { x0: SUNSET_X * TS, x1: 99999, kind: 'glassnight' }],   /* (fix pass) its own beds: src/audio.js SYNTH_BEDS glassday / glassnight */
    rockZones: [], masonry: [],
    palette: { set: 'desert', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(160,220,230,0.08)' },
    duskStart: -1, duskLen: 1,
  };
}
