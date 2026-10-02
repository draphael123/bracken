// src/red-gorge.js - THE RED GORGE, desert arc level 3 (claude/redgorge, the GREYBOX: geometry, the flood rule, the machines, the encounters,
// the wiring). Concept: docs/concepts/red-gorge.md (the desert-arc concept of 2026-10-01 over the older brief docs/briefs/red-gorge.md).
// The draft it grew from is src/draft/red-gorge.js (tools/draft-level.mjs red-gorge still measures that structure); this file is the level the
// game runs, laid by hand so the crossings, the machines and the encounters are written where they are, not sprinkled.
//
// A CLIMB up a red-rock canyon, six sections from the gorge floor to the plateau at its head, where THE GREAT RED CRAB keeps the old dam.
//
// THE RULE: THE FLOOD COMES DOWN THE CHANNEL. The canyon's CHANNEL (columns 22-26, the scoured pale rock in the middle) carries a flash flood on
// one clock (src/red-gorge-hands.js GORGE): dry, then THE HORN from above (2 s: get out of the channel), then the TORRENT (2.4 s): anything in
// the channel is swept down and hurt. An OVERHANG caps each section's climbing side, so every section ends on a ROPE BRIDGE across the channel.
// Said three ways: the horn, the channel's scoured pale rock, and the trickle that comes down the channel before the torrent.
//
// THE MACHINE: A SLUICE GATE across the channel (E at its WHEEL). Shut, it HOLDS the next flood: the channel below it stays dry. Held, it is a
// flood in your hand: E again RELEASES it - a burst down the channel below, at once, harder than a flood. Only a released burst moves a JAM of
// flotsam, and only a released burst throws THE GREAT RED CRAB on his back.
// THE BASKETS: a water-wheel by the channel winds a basket up its shaft while the water runs past it - the flood is the only lift up a sheer face.
//
// THE THEMED KEY: four RAPTOR FEATHERS in the gorge's nests (the quest, L.quest). Laid in THE OLD NEST (E at it) high on the summit's west wall,
// they open its vault: a silver (the relic once planned here is cut: Daniel 10-02). The HUD counts them (FEATHERS n/4).
//
// SIX SECTIONS (rows; the gorge floor is row 166, the plateau row 22; the climbing side alternates):
//   142-166  THE GORGE MOUTH      TEACH the flood     you start on the east floor; the channel crosses the floor: the first horn, the first
//                                                     crossing; then up the west ledges under a slinger
//   118-142  THE DRY FALLS        TEACH the gate      the plunge-pool terrace (CHECKPOINT ONE, and THE FALLS' KEEPER at the falls' foot), the first WHEEL; the only way up is a rope up
//                                                     the falls' face IN the channel - race the clock, or shut the gate and climb in peace
//   94-118   THE RAPTOR LEDGES    the BASKET          the west face is sheer: the water-wheel basket rides up on the flood; raptors dive at you
//                                                     on it; a nest pocket east (a feather) under the bridge
//   70-94    THE CAVE OF HANDS    the JAM (REQUIRED)  east ledges under a slinger, the painted cave (a silver, a feather); at the top THE JAM
//                                                     seals the bridge: shut the gate above it, let a flood bank, release it - the burst washes it
//   42-70    THE NARROWS          EXAM: all three     the walls close in; the second basket rides up on the flood, and above it the way on is a
//                                                     long rope IN the channel under raptors and a slinger - ride on the flood, then hold the next
//   22-42    THE SUMMIT           (the old nest)      the last climb (CHECKPOINT TWO at the dam's door); the old nest's vault west, off the route
//   ...then THE OLD DAM, the plateau east of the summit: THE GREAT RED CRAB (src/gorge-crab.js), and the road on to THE GLASS SEA.
import { stageGorgeCrab } from './gorge-crab.js';

export const REDGORGE = { W: 96, H: 170, floor: 166, ch: [22, 26], summit: 22 };
export const SECTIONS = [['THE GORGE MOUTH', 166], ['THE DRY FALLS', 142], ['THE RAPTOR LEDGES', 118], ['THE CAVE OF HANDS', 94], ['THE NARROWS', 70], ['THE SUMMIT', 42]];
/* the bridge rows, bottom to top (each section ends on one) */
export const BRIDGES = [142, 118, 94, 70, 42];
/* each mechanic's arc (tile ROWS: a climb) - TAUGHT, DEVELOPED, TWISTED, COMBINED/EXAMINED - read by tools/redgorge.mjs and the concept page */
export const ARCS = {
  flood: { teach: [160, 166], develop: [118, 142], twist: [94, 118], exam: [42, 70] },     /* the floor crossing; the falls race; the basket that rides it; the narrows */
  gate: { teach: [118, 142], develop: [70, 94], twist: [6, 22], exam: [42, 70] },          /* the falls (optional); THE JAM (required); the crab's opening; the narrows' hold */
  basket: { teach: [100, 118], exam: [65, 70] },                                           /* the raptor ledges; the narrows */
  climb: { teach: [145, 163], develop: [119, 136], exam: [43, 62] },                       /* ledges, the falls' rope, the narrows' rope */
};

export function buildRedGorge({ painter, T, TS }) {
  const { W, H } = REDGORGE, F = REDGORGE.floor, [C0, C1] = REDGORGE.ch, CX = 24;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ledge = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const ropes = []; const rope = (x, y0, y1) => ropes.push([x, y0, y1]);   /* every rope is hung LAST, over what is carved */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: x < CX ? 1 : -1, squad }, o || {}));
  const decor = [], gates = [], jams = [], baskets = [], moversExtra = [], interiors = [], vaultDoors = [];
  /* A SLUICE GATE: timber across the channel at `row`; its wheel(s) on a bank. id names it for its wheels */
  const gate = (id, row, ch = 'gorge') => gates.push({ id, row, ch });
  const wheel = (x, y, id) => ent('sluice', x, y, { gate: id });
  /* A BASKET: a water-wheel by the channel at row `wheelRow` winds a basket (x, x+1) from surface row `low` up to surface row `high` while the
     water runs past the wheel; when it stops, the basket sinks back */
  const basket = (id, x, low, high, wheelRow) => { baskets.push({ id, x, low, high, wheelRow });
    moversExtra.push({ kind: 'lift', gorge: id, x: x * TS, y: low * TS, y0: low * TS, y1: high * TS, w: 32, h: 8, speed: 0, wheelRow }); ent('waterwheel', x < CX ? x + 3 : x - 1, wheelRow, { basket: id }); };   /* the wheel turns in the channel's edge */
  const feather = (x, y) => ent('stray', x, y, { kind: 'feather' });

  // ================= THE ROCK: everything, then the gorge and the plateau carved out of it =================
  block(0, W - 1, 0, H - 1);
  air(3, 44, 0, F - 1);                                                       /* the gorge: open to the sky, walls at 0-2 and 45-47 */
  /* the walls wander a little (a canyon, not a shaft) - never into a ledge */
  for (const [y0, y1, x] of [[150, 158, 3], [126, 131, 44], [100, 108, 44], [30, 38, 3], [10, 18, 44]]) block(x, x, y0, y1);

  // ================= 1. THE GORGE MOUTH (142-166): climb WEST =================
  ent('deco', 33, F - 1, { kind: 'scrub' }); ent('deco', 8, F - 1, { kind: 'oxSkull' });
  sign(37, F - 1, 'THE RED GORGE. AT THE HORN, GET OUT OF THE CHANNEL.');
  foe('cutthroat', 11, F - 1, 'mouth'); foe('cutthroat', 15, F - 1, 'mouth');   /* the bandits who hold the mouth, on the far side of the first crossing */
  ledge(14, 20, 163); ledge(8, 15, 160); ledge(13, 19, 157); ledge(5, 14, 154); ledge(11, 17, 151); ledge(4, 12, 148); ledge(10, 18, 145);
  /* the slinger across the channel: a shelf on the east lip, throwing at the west climb */
  block(29, 33, 156, 156); foe('slinger', 30, 155, 'mouthSling', { face: -1 });
  /* THE FIRST BASKET, taught where it costs nothing: by the channel on the east floor, it rides the flood up to a ledge with a silver (off the route) */
  basket('mouth', 27, F, 148, 160); ledge(29, 34, 148); ent('silver', 33, 147);
  ledge(36, 42, 162); ledge(30, 36, 159);                                      /* the way up to him (an optional fight) */
  foe('slinger', 6, 147, 'mouthSling2', { face: 1 }); foe('cutthroat', 24, 141, 'mouthTop', { face: -1 });   /* a sling behind the top of the west climb; a knife idling on BRIDGE ONE's span over the channel: the first bandit you watch the horn take */
  block(3, C1, 136, 138);                                                     /* the overhang over the west climb and the channel (the flood pours through its slot): cross */
  ledge(3, 44, 142);                                                          /* BRIDGE ONE */

  // ================= 2. THE DRY FALLS (118-142): climb EAST, up the falls' face =================
  ledge(28, 31, 139);
  block(32, 44, 136, 137); ledge(27, 31, 136);                                /* THE TERRACE, and a step of boards to the plunge pool (the overhang under it) */
  ent('check', 41, 135);                                                      /* CHECKPOINT ONE: the terrace */
  wheel(28, 135, 'falls'); gate('falls', 115);                                /* THE FIRST WHEEL: its gate across the channel over the falls */
  sign(35, 135, 'THE WHEEL SHUTS THE GATE ABOVE. SHUT, IT HOLDS ONE FLOOD.');
  block(27, 44, 119, 132);                                                    /* the falls' lip: sheer on the east - the only way up is the face */
  ent('raptor', CX + 3, 120, { squad: 'raptorFalls', guard: 126 });          /* a raptor over the falls' face: it stoops at you on the rope */
  rope(24, 119, 135);                                                         /* THE FALLS' FACE: a rope in the channel, seventeen rows */
  ent('scorpion', 34, 135, { face: -1, elite: true, gate: 27 });            /* THE FALLS' KEEPER: an elite scorpion holds the gate between the terrace and the falls' foot (eliteGates: it opens when he dies) */
  /* the west lip: the slinger's shelf over the falls, and a nest past him (FEATHER ONE) */
  block(14, 21, 128, 128); ledge(3, 13, 128);
  foe('slinger', 18, 127, 'fallsSling', { face: 1 });
  feather(4, 127); decor.push({ kind: 'nest', x: 6, y: 127 });
  block(C0, 44, 112, 114);                                                    /* the overhang over the east and the channel: cross */
  ledge(3, 44, 118);                                                          /* BRIDGE TWO */

  // ================= 3. THE RAPTOR LEDGES (94-118): the WEST face is sheer - the basket =================
  block(3, 16, 100, 117);                                                     /* the sheer face */
  set(17, 118, T.AIR); set(18, 118, T.AIR);                                   /* the basket's berth in the bridge */
  basket('ledges', 17, 118, 100, 112);                                       /* THE FIRST BASKET: its wheel at the channel's lip, row 112 */
  sign(20, 117, 'THE WHEEL TURNS WHEN THE WATER RUNS.');
  foe('cutthroat', 30, 117, 'basketFoot', { face: -1 }); foe('cutthroat', 34, 117, 'basketFoot', { face: -1 }); foe('slinger', 38, 117, 'basketFoot', { face: -1 });   /* they come along the bridge at you while you wait on the basket for a flood */
  ledge(9, 15, 97);
  foe('cutthroat', 6, 99, 'ledgeTop', { face: 1 }); foe('cutthroat', 12, 99, 'ledgeTop', { face: -1 }); foe('slinger', 4, 99, 'ledgeTop', { face: 1 });   /* they wait at the basket's top */
  ent('raptor', CX, 106, { squad: 'raptorShaft', guard: 112 });                 /* a raptor over the basket's shaft and the bridge */
  /* the nest pocket on the east, under bridge three (FEATHER TWO): drop through the bridge and down the ledges */
  ledge(38, 44, 97); ledge(31, 37, 100); ledge(38, 44, 103); block(27, 44, 104, 111);   /* the pocket stands on rock: nothing to fall to */
  feather(43, 102); decor.push({ kind: 'nest', x: 41, y: 102 });
  foe('scorpion', 39, 102, 'nestB', { face: 1 });
  block(3, 21, 88, 90);                                                       /* the overhang over the west (three rows: no jump and mantle off the bridge tops it): cross */
  ledge(3, 44, 94);                                                           /* BRIDGE THREE */

  // ================= 4. THE CAVE OF HANDS (70-94): climb EAST; THE JAM =================
  ledge(28, 33, 91); ledge(33, 40, 88);
  ledge(29, 35, 85); ledge(35, 44, 82);
  foe('cutthroat', 23, 93, 'caveLedge', { face: 1 }); foe('cutthroat', 25, 93, 'caveLedge', { face: -1 });   /* on BRIDGE THREE's span over the channel: meet them in it - time the horn, or fight in the water's road */
  /* THE CAVE OF HANDS: cut into the east wall off the ledge at row 82 - painted hands, a silver, FEATHER THREE */
  air(45, 53, 78, 81); block(45, 53, 82, 82);
  decor.push({ kind: 'hands', x: 47, y: 79 }, { kind: 'hands', x: 50, y: 78 }); ent('silver', 52, 81); feather(50, 81);
  interiors.push([45, 53, 78, 81, 'rgCave']);
  ledge(30, 36, 79); ledge(36, 43, 76); ledge(30, 37, 73);
  foe('slinger', 43, 75, 'caveTop', { face: -1 }); foe('scorpion', 33, 72, 'jamFoot', { face: 1 });   /* the sling over the cave, the sting at the jam's foot */
  block(16, 21, 80, 80);                                                      /* the west lip (a step off the rope below) */
  rope(4, 71, 87); ledge(6, 13, 80);                                          /* a way back up from bridge three's overhang (dropped onto from bridge four), and a reach to him */
  /* THE JAM: flotsam wedged on bridge four in the channel, seven rows high, beside the east overhang - the narrows' rope hangs to its top */
  block(C0, C1, 63, 69); jams.push({ x0: C0, x1: C1, y0: 63, y1: 69 }); ent('jam', CX, 69);   /* seven rows: no jump (nor a mantle) from the bridge gets on it */
  /* THE JAM IS A FIGHT (the review: the wheel was roofed and both its slingers were under it, so the bank was free). The jam-lip SLINGER stands ON
     the jam, seven rows over the wheel, and throws down the open slot beside it (the overhang now starts four columns east): out of reach, and
     only the burst that breaks the jam takes him. Two KNIVES wait on the overhang's top and leap down the slot when the jam's gate is shut
     (src/red-gorge-hands.js interact: squad 'jamDrop'), and a raptor keeps bridge four */
  foe('slinger', 24, 62, 'jamSling', { face: 1 });
  block(31, 44, 63, 64);                                                      /* the overhang over the east (the slot over the wheel, cols 27-30, open to the sky) */
  foe('cutthroat', 33, 62, 'jamDrop', { face: -1 }); foe('cutthroat', 36, 62, 'jamDrop', { face: -1 });
  ent('raptor', CX, 66, { squad: 'raptorJam', guard: 68 });                   /* it keeps bridge four: it stoops at you while the jam's gate banks */
  wheel(28, 69, 'jam'); gate('jam', 58);                                      /* THE JAM'S GATE, and its wheel on the bridge */
  ledge(3, 44, 70);                                                           /* BRIDGE FOUR */

  // ================= 5. THE NARROWS (42-70): the walls close in; climb WEST: the basket, then the rope =================
  /* THE EXAM'S RACE IS A GAMBLE (the review: a 16-row rope from the basket's top cleared the 8 s window by 3 s, so the gate was optional). The basket
     now stops at row 65, on a LANDING under the west mass (the top wheel and its two knives); the rope hangs TWENTY rows (43-62: bridge five is four
     rows higher), its foot a hop over the landing's lip and still eight rows over bridge four (no jump from the bridge reaches it). Racing the next
     flood up it from the landing is a thin margin under a slinger and two raptors; the gate (shut at the landing's wheel) holds the next flood, and
     the climb is dry */
  block(3, 7, 43, 69); block(39, 44, 43, 63);                                 /* the narrows' walls */
  block(8, 16, 65, 69);                                                       /* the west face (sheer) */
  set(17, 70, T.AIR); set(18, 70, T.AIR);                                     /* the second basket's berth */
  basket('narrows', 17, 70, 65, 66);                                         /* THE SECOND BASKET: up five rows on the flood, to the landing */
  wheel(20, 69, 'narrows');                                                   /* the narrows' gate: a wheel at the basket's foot... */
  ledge(19, 21, 65); wheel(10, 64, 'narrows'); foe('cutthroat', 9, 64, 'narrowsTop', { face: 1 }); foe('cutthroat', 14, 64, 'narrowsTop', { face: -1 });   /* the landing: two knives at the basket's top, by the wheel you need */ gate('narrows', 39);          /* ...and one at its top, over the rope */
  block(8, 21, 43, 59);                                                       /* the west mass over the landing: the only way on is the rope in the channel */
  rope(22, 43, 62);                                                           /* THE NARROWS' ROPE: twenty rows in the channel (its foot eight rows over bridge four: no jump from the bridge reaches it) */
  ent('raptor', CX, 50, { squad: 'raptorsB', guard: 58 });                   /* a raptor over the rope: it hunts the rope's lower half too */
  /* the east shelf in the narrows: a slinger over the rope, and FEATHER FOUR behind him */
  block(27, 33, 48, 48); ledge(34, 38, 48); ledge(33, 38, 45); foe('slinger', 29, 47, 'narrowsSling', { face: -1 });   /* down off bridge five's east end */
  feather(37, 47);
  block(8, C1, 36, 38);                                                       /* the overhang over the west and the channel */
  ledge(3, 44, 42);                                                           /* BRIDGE FIVE */

  // ================= 6. THE SUMMIT (22-42): climb EAST; the old nest west =================
  foe('cutthroat', 31, 41, 'bridge5', { face: -1 }); foe('cutthroat', 35, 41, 'bridge5', { face: -1 }); foe('cutthroat', 39, 41, 'bridge5', { face: -1 });   /* the bridge's east head, as you come off the rope */
  ledge(36, 44, 39); ledge(29, 35, 36); ledge(35, 43, 33); ledge(30, 36, 30); ledge(36, 44, 27); ledge(33, 39, 25);
  foe('cutthroat', 33, 35, 'summit', { face: 1 }); foe('cutthroat', 24, 31, 'summit', { face: 1 });   /* one on the climb; one on THE OLD NEST's bridge over the channel: the vault walk crosses a fight at the horn */
  foe('slinger', 41, 26, 'summitSling', { face: -1 }); foe('cutthroat', 37, 26, 'summitKnife', { face: 1 });   /* his knife beside him */
  ent('raptor', CX + 6, 32, { squad: 'raptorsC', guard: 36 });
  /* THE OLD NEST: across a rope bridge at row 31 (over the channel) to the west wall: its vault behind a wall of woven branches */
  ledge(17, 29, 32); block(3, 16, 32, 33);
  ent('oldnest', 13, 31); decor.push({ kind: 'nest', x: 15, y: 31 });
  block(3, 9, 25, 26); block(9, 9, 27, 31); vaultDoors.push({ x0: 9, x1: 9, y0: 27, y1: 31 });   /* the vault door: woven branches, five rows */
  air(3, 8, 27, 31); interiors.push([3, 8, 27, 31, 'rgNest']);
  ent('silver', 6, 31);   /* the vault pays ONE SILVER (Daniel 10-02: relics are cut game-wide; THE RAPTOR'S PLUME is gone) */
  /* THE SUMMIT SHELF and the way out east into the old dam */
  block(38, 44, 22, 23); ent('check', 42, 21);                                /* CHECKPOINT TWO: at the dam's door */
  air(45, 48, 19, 21);                                                        /* the cut through the east wall */

  // ================= THE OLD DAM: THE GREAT RED CRAB's plateau (src/gorge-crab.js) =================
  const crab = stageGorgeCrab({ set, block, ent, air }, T, TS, 50, REDGORGE.summit);
  gate('dam', crab.gateRow, 'dam');
  air(91, W - 3, 16, 21); ent('gate', 93, 21);                                /* the road out, to THE GLASS SEA */

  // ================= THE ROPES, LAST =================
  for (const [x, y0, y1] of ropes) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  const START = { x: 41, y: F - 1 };
  /* the whole gorge is in the canyon's shadow, and the dam's plateau under its cliff: this level is the flood's, not the sun's */
  const shade = [[0, W * TS, 0, H * TS + 1]];
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra, interiors,
    arena: crab.arena, gateAfterBoss: true,
    redgorge: true,
    channels: [{ id: 'gorge', x0: C0, x1: C1, y0: 0, y1: F - 1 }, { id: 'dam', x0: crab.channel[0], x1: crab.channel[1], y0: crab.gateRow + 1, y1: REDGORGE.summit - 1 }],
    gates, jams, baskets, vaultDoors, decor,   /* decor: the nests and the painted hands, drawn by src/red-gorge-hands.js (greybox) */
    shade, shadeArt: [],
    rockZones: [[0, W - 1, 0, H - 1]],   /* the canyon's red sandstone everywhere (the caravan's rock skin until the art lane paints the gorge its own) */
    /* THE ROPE BRIDGES ARE ROPE AND PLANK (the review: they drew as the desert's rock shelf, against the rule's own picture - the flood drops you
       through the bridge). Each bridge and the old nest's are lashed poles (main.js ONEWAY art: L.ledgeZones -> LEDGE_SETS.lashed); the climbing
       ledges stay rock shelves */
    ledgeZones: [...BRIDGES.map(y => [3, 44, y, y, 'lashed']), [17, 29, 32, 32, 'lashed']],
    climbLook: true,   /* UPGRADE D: on a rope or a gorge basket the camera looks UP the climb (main.js camera, STORMHOLD's towers' flag) */
    quest: { n: 4, item: 'feather', name: 'FEATHERS', done: 'FOUR FEATHERS: LAY THEM IN THE OLD NEST', thanks: 'THE OLD NEST OPENS' },
    sections: Object.fromEntries(SECTIONS.map(([n, y]) => [n, y])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* two checkpoints (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    /* WHAT EACH THING OPENS, and the line that says so (tools/level-quality.mjs `unlocks`; the lines are src/hint-lines.js callouts the hands say) */
    unlocks: [
      { kind: 'stray', opens: "THE OLD NEST's vault (a silver) once all four feathers are laid in it", hud: 'FEATHERS n/4 (the quest counter); at the nest: THE OLD NEST WANTS FOUR FEATHERS' },
      { kind: 'sluice', opens: 'its gate: shut, it holds the next flood (a dry crossing); held, E releases it (a burst that washes a jam out, and throws the crab)', hud: 'THE GATE IS SHUT: IT HOLDS THE NEXT FLOOD' },
      { kind: 'jam', opens: 'the bridge it seals (a released burst washes it out)', hud: 'A JAM: ONLY A RELEASED BURST MOVES IT' },
      { kind: 'waterwheel', opens: 'its basket up the sheer face while the water runs', hud: 'THE WHEEL TURNS WHEN THE WATER RUNS' },
      { kind: 'oldnest', opens: "THE OLD NEST's vault (a silver)", hud: 'THE OLD NEST OPENS' },
    ],
    music: 'caravan',   /* TODO(Daniel picks the track): a PLACEHOLDER, THE SUNKEN CARAVAN's track borrowed until the gorge has its own CC0/CC-BY file (tools/level-quality.mjs REPORT_ONLY lists the borrow). Nothing was downloaded */
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    caravan: true,   /* the desert's hands in main.js (the sandstone skins, the bandits' AI); THE SUN never reaches the floor of the gorge (the shade above) */
    ledgeKit: 'desert',
    palette: { set: 'desert', near: 'none', dress: 'desert', noFg: true, noNear: true, haze: 'rgba(200,110,80,0.10)' },
    duskStart: -1, duskLen: 1,
  };
}
