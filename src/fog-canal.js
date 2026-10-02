// src/fog-canal.js - THE FOG CANAL (claude/canal, the GREYBOX: geometry, machinery, encounters, wiring). Brief: docs/briefs/fog-canal.md.
// You leave WAYMEET by night on a BARGE along a fog-choked canal into the old town's theatre quarter; the lit theatre glows ahead through the
// fog the whole way. Between WAYMEET and THE MASKWRIGHT'S THEATRE on the road inland. Its machinery is src/canal-rig.js (pure), its hands
// src/canal-hands.js, its two new foes (the GRINDYLOW, Jenny Greenteeth's weed-imp brood, and the WILL-O'-THE-WISP, a false lantern)
// src/canal-foes.js. JENNY GREENTEETH (the boss: a parallel lane, claude/lockkeeper, in a module of its own) is fought in the LOCK CHAMBER past
// the basin: this file lays her chamber (stageGreenteeth, section 7), her doors and the level's gate on the quay past her east door.
//
// THE RULE: THE BARGE GOES WHERE THE WATER LETS IT. A LANTERN SHOWS YOU - TO THEM TOO.
//
// Water levels (surface rows): the Waymeet pound 40, the first lock 40->33, the mill pound 33, the flight 33->28->23->18, the summit 18, the
// basin 44. The TOWPATH is always three rows over the water (one-way boards on corbels, 46 px over the deck: a hop up from the barge).
//
//   0-67     THE WAYMEET QUAY    TEACH barge, weed, grindylow   down from the dead street through the warehouse (the roof: a silver), the
//                                                               weed on the dock, the barge at the quay, the towpath hop, the low bridge
//   68-121   THE FIRST LOCK      TEACH lock + bridge            the paddle on the gate fills the chamber; the mill (the climb, checkpoint
//            AND THE MILL                                       one); the mill bridge holds the barge until you swing it
//   122-185  THE FOG BANK        TWIST barge, TEACH fog         the weed reach (only the barge crosses it), the wisp, THE LONG ARCH (the
//                                DEVELOP bridge, fog as LOCK    barge goes on without you: the rooftops), the bridge garrison, THE FOG WALL
//   186-247  THE FLIGHT          DEVELOP lock                   three locks up the hill, a crank on each where the last one was not;
//                                TWIST bridge                   the summit bridge: cross it yourself, then swing it for her
//   248-325  THE WEIR            SET PIECE (the chase)          the summit gate bursts: loose down the race with the flood behind, duck
//                                                               the low beams; the TILLER steers the cut or the broken weir
//   326-369  THE THEATRE BASIN   EXAM                           fog, horn, bridge, barge, archers, weed, wisps, the foreman: all at once
//   370-431  JENNY'S LOCK        (claude/lockkeeper)            the door, the chamber kept free for her, and the gate
import { stageGreenteeth } from './jenny-greenteeth.js';   /* JENNY GREENTEETH's lock chamber and fight (claude/lockkeeper's module, wired by claude/greenwire) */
export const CANAL = { W: 432, H: 56 };
/* every machine's arc (tile columns), read by tools/canal.mjs and written up in the brief */
export const ARCS = {
  barge: { teach: [30, 67], develop: [68, 121], twist: [122, 160], exam: [326, 369], set: [248, 325] },
  lock: { teach: [68, 81], develop: [186, 232], twist: [244, 250], exam: [326, 369] },
  fog: { teach: [116, 131], develop: [130, 160], twist: [160, 185], exam: [326, 369] },
  bridge: { teach: [104, 121], develop: [148, 160], twist: [226, 247], exam: [326, 369] },
};
export const SECTIONS = [['THE WAYMEET QUAY', 0], ['THE FIRST LOCK AND THE MILL', 68], ['THE FOG BANK', 122], ['THE FLIGHT', 186], ['THE WEIR', 248],
  ['THE THEATRE BASIN', 326], ["JENNY'S LOCK", 370]];

export function buildFogCanal({ painter, T, TS }) {
  const { W, H } = CANAL;
  const L = painter(W, H), { set, block, ent, coins } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x, y, n) => { for (let i = 0; i < n; i++) set(x + i, y, T.ONEWAY); };
  const nets = []; const ladder = (x, y0, y1) => nets.push([x, y0, y1]);   /* every ladder is hung LAST, over what is carved */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const bargee = (x, y, squad, o) => foe('gaffer', x, y, Object.assign({ squad, canal: { bargee: true, cnSkin: 'bargeman' } }, o || {}));   /* A BARGEE: the boat-hook man (the Ore Road's gaffer's AI under a human BARGEMAN's skin, claude/canalfix3: no goblins past the Goblin Queen), who hooks DOWN from a towpath */
  const archer = (x, y, squad) => foe('archer', x, y, { squad, canal: { fogSight: true, cnSkin: 'watchman' } });   /* in the fog he looses only at what is lit (the goblin archer's AI as a WATCHMAN with a crossbow, claude/canalfix3) */
  const grindy = (x, surf, squad, o) => ent('grindylow', x, surf - 1, Object.assign({ squad, face: -1 }, o || {}));   /* at the water's edge: its row is the one over the surface */
  const wisp = (x, y, lure, squad) => ent('willowisp', x, y, { squad, lure });              /* lure: [x, y] (tiles) where it drifts to, as if it marked the way */
  const post = (x, y) => ent('lanternpost', x, y);
  const px = c => c * TS;

  /* THE MACHINERY, as data for src/canal-rig.js */
  const reaches = [], gates = [], bridges = [], fogs = [], weedWater = [], weeds = [], beams = [], rigBands = [], pools = [], chases = [], moorings = [], sides = [];
  /* (claude/canalfix3, Daniel 10-02: "GREEN = HERS") A SAFE SWIM: clear dark blue water behind an iron GRATE she cannot pass - no weed, no bite, the hero swims
     there freely (the game's own swim and its breath). Optional, never on the way: a HATCH (an iron grate in a floor - drop through it) and an iron LADDER
     out. The first time a hero swims one, a grindylow bumps the grate from the green side and cannot get through (src/canal-hands.js swimStep): no sign */
  const swims = [], grates = [], hatches = [];
  const swim = (name, x0, x1, y0, y1, surf, o = {}) => { air(x0, x1, y0, y1); pools.push({ x0: px(x0), x1: px(x1 + 1), y: surf * TS + 4, swim: true, clear: true, shallow: false, bottom: (y1 + 1) * TS, safeSwim: name, swimName: name });
    swims.push(Object.assign({ name, x0, x1, y0, y1, surf, pool: pools.length - 1 }, o)); };
  /* A RIDE, for the reach model: footing along her deck from x0 to x1 at any row y0..y1 her water can stand at. Laid in short lengths, so the walked
     route (tools/pacing.mjs) steps along a reach the way she carries you, and does not leap its whole length in one bound */
  const ride = (x0, x1, y0, y1) => { for (let a = x0; a <= x1; a += 8) rigBands.push([a, Math.min(x1, a + 8), y0, y1]); };
  /* A REACH: a pound (one level) or a lock chamber (lo..hi). Its water is an engine pool whose surface src/canal-hands.js moves */
  const reach = (id, x0, x1, bed, lo, hi, init = 'lo', o = {}) => {
    const top = Math.min(lo, hi); air(x0, x1, top - 3, bed - 1); block(x0, x1, bed, bed);
    pools.push({ x0: px(x0), x1: px(x1 + 1), y: (init === 'hi' ? hi : lo) * TS + 4, shallow: false, swim: false, clear: true, bottom: bed * TS, canal: id });
    reaches.push(Object.assign({ id, x0, x1, bed, lo, hi, init, pool: pools.length - 1 }, o));
    if (!o.noBand) ride(x0, x1, Math.min(lo, hi), Math.max(lo, hi));   /* THE BARGE, for the reach model: footing anywhere along the reach, at any level its water can stand (her deck is two px over the surface row) */
    return reaches.length - 1; };
  /* A GATE between two reaches: SOLID from `top` (its walkway) to `bot` while shut, open water while the two stand level */
  const gate = (id, x, top, bot, a, b, o = {}) => { block(x, x, top, bot); gates.push(Object.assign({ id, x, top, bot, a, b }, o)); };
  const sluice = (x, y, id) => ent('locksluice', x, y, { reach: id });
  /* A SWING BRIDGE: a deck of one-way boards across the water at `row`, from x0 to x1; its capstan is `cap` [x, y] */
  const bridge = (x0, x1, row, init, cap) => { bridges.push({ x0, x1, row, init, pivot: cap[0] > x1 ? 'R' : 'L' }); if (init !== 'open') boards(x0, row, x1 - x0 + 1); ent('swingcap', cap[0], cap[1], { bridge: bridges.length - 1 }); return bridges.length - 1; };
  const fog = (id, x0, x1, y0, y1, o = {}) => { fogs.push(Object.assign({ id, x0, x1, y0, y1, a: 0.74, thick: false }, o)); };
  const horn = (x, y, ids, clear) => ent('foghorn', x, y, clear ? { fogs: ids, clear } : { fogs: ids });   /* clear: this horn's own seconds of clear air (claude/canalfix) */
  const lamplighter = (x, y, squad) => foe('snuffer', x, y, { squad, canal: { lamplighter: true, cnSkin: 'lamplighter' } });   /* THE LAMPLIGHTER (claude/canalfix, review fix 9): the snuffer's proven walk-to-a-lamp, reversed - he RELIGHTS a doused post, and his own lantern shows you to every archer near him. Kill him first */
  const boarder = (x, y) => foe('gaffer', x, y, { squad: 'the boarding gang', canal: { bargee: true, boarder: true, cnSkin: 'riverrat' } });   /* UPGRADE C: waits out in the fog wall until she is held there (src/canal-hands.js gangStep) */
  /* THE TWO WEEDS (Jenny's, taught before her lock): BRIGHT blanket weed holds you for a moment (src/canal-rig.js RIG.weedHold) and then gives way; DARK weed is only water */
  const weed = (x0, x1, row, kind = 'dark') => { weeds.push([x0, x1, row, kind]); if (kind === 'bright') boards(x0, row, x1 - x0 + 1); };

  // ================= THE GROUND =================
  /* the whole sheet starts as air (a town outdoors at night); the ground is laid section by section */

  // ---------------- 1. THE WAYMEET QUAY (0-67): down through the warehouse, onto the barge ----------------
  /* NOT A WALK: the street ends in the warehouse's broken floor. Down it (three drops, a board landing each) to the wet dock and the quay; or
     up the ladder onto the roof, where the loft's silver was left. The dead town's fog, thin here (the thick of it is past the mill) */
  block(0, 13, 26, H - 1);                                                   /* the last street of Waymeet */
  sign(3, 25, 'THE FOG CANAL. THE LAST BARGE OUT OF WAYMEET WAITS AT THE QUAY BELOW.');
  block(14, 29, 39, H - 1);                                                  /* the warehouse floor, thirteen rows down */
  boards(14, 30, 4); boards(24, 34, 5);                                      /* the broken floors: a landing each drop */
  boards(13, 19, 17); ladder(13, 19, 25);                                    /* THE ROOF: a ladder up off the street, the loft's silver at its far end (a pocket) */
  block(30, 30, 20, 36); block(29, 30, 19, 19);                              /* the warehouse's east wall, its door onto the quay (rows 37-38) */
  ent('silver', 28, 18); coins([22, 18], [25, 18]);
  archer(26, 18, 'the warehouse roof');                                      /* over the silver, in the town's thin fog: he sees you only in the roof lantern's light */
  post(20, 18);                                                              /* (claude/canalfix, review fix 9) THE ROOF LANTERN: douse it and walk to the silver unseen - the light rule, taught where it is a choice */
  fog('F0', 14, 67, 0, 40, { a: 0.42 });                                     /* the dead town's thin fog over the warehouse and the Waymeet pound (claude/canalfix: its archers see only the lit) */
  /* THE WET DOCK: where the boats came in under cover. Blanket weed lies on it like a floor, with gold on it. It is two rows deep, and there is a
     step out at either end: THE WEED READ, taught where it costs a wetting and nothing else */
  air(20, 25, 39, 40); block(20, 25, 41, 41);
  pools.push({ x0: px(20), x1: px(26), y: 39 * TS + 4, shallow: true, swim: false, clear: true, bottom: 41 * TS, canal: 'dock' });   /* shallow: you wade out of it */
  weed(20, 22, 39, 'bright'); weed(23, 25, 39); coins([21, 38], [24, 38]);   /* one of each, side by side, over water too shallow to hurt */
  sign(17, 38, 'BRIGHT WEED HOLDS YOU A MOMENT, THEN GIVES. DARK WEED IS ONLY WATER.');
  /* (claude/canalfix, review fix 9: the bargee who stood on foot by the warehouse door hooks from the second towpath now) */
  /* THE QUAY and THE WAYMEET POUND (surface 40): the barge moored at the quay's edge */
  block(30, 35, 39, H - 1);                                                  /* the quay */
  const P0 = reach('P0', 36, 67, 45, 40, 40);
  block(36, 67, 46, H - 1);
  sign(31, 38, 'RIPPLES AT THE WATER\'S EDGE: SOMETHING IS UNDER. JUMP, OR STRIKE THE RIPPLE.');
  grindy(37, 40, 'the quay');                                                /* THE FIRST GRINDYLOW, alone under the quay's edge: the grab taught where the barge is beside you */
  sign(34, 38, 'THE CANAL BITES WHAT FALLS IN. STAY ON THE BARGE; HOLD DOWN ON DECK TO DUCK A BEAM.');
  ent('deco', 33, 38, { kind: 'rowboat' });
  /* (claude/canalfix3) THE FLOODED CELLAR (a SAFE SWIM): under the warehouse floor and the quay, clear water behind an iron grate on the quay's face - the Waymeet
     pound's green on the other side of the bars. In by the drain grate in the wet dock's bed (drop through it), out up its ladder; the silver lies at the bottom */
  swim('the flooded cellar', 16, 34, 42, 49, 43, { grate: [35, 41, 46, 1], bumpFrom: 37 });
  for (const x of [22, 23]) { set(x, 41, T.ONEWAY); hatches.push([x, 41]); } ladder(23, 42, 44);   /* the drain in the wet dock's bed: drop through it (down), up its ladder to come out */
  grates.push([35, 35, 41, 46]); ent('silver', 31, 49); coins([20, 47], [23, 48], [26, 47]);
  moorings.push({ cp: null, x: 36 });                                        /* THE BARGE AT THE QUAY (the level's start) */
  /* THE TOWPATH HOP: the towpath runs on corbels three rows over the water; a bargee on it hooks the rider passing under him (told: !!, duck) */
  boards(44, 37, 10); bargee(51, 36, 'the towpath');
  post(46, 36);
  /* (claude/canalfix, UPGRADE B) THE TILLER, TAUGHT: the Waymeet pound is wide enough for her to keep to a side. Her helm (the arrow on the tiller amidships)
     puts her on the TOWPATH SIDE (down: the towpath's bargees hook the rider) or the OFFSIDE (up: out of their reach - but under the low bridge's timbers,
     which hang on that half). A harmless fork: a hook or a duck. At the weir the same strike picks the mill cut or the weir */
  sides.push([36, 67]);
  sign(44, 36, 'THE TILLER AMIDSHIPS STEERS HER: STRIKE IT TO TURN HER HELM.');
  /* THE LOW BRIDGE: a footbridge over the pound whose timbers hang to a hand over the deck on its far half. Duck under on the offside, or keep to the towpath side */
  block(56, 58, 34, 35); beams.push({ x0: px(56), x1: px(59), y: 40 * TS - 2 - 9, dmg: 10, name: 'THE LOW BRIDGE', side: 'off' });
  archer(57, 33, 'the low bridge');                                          /* in the thin fog: he looses at her lantern-lit deck as she comes under */
  boards(59, 37, 9); bargee(61, 36, 'the towpath'); bargee(65, 36, 'the towpath');
  coins([47, 36], [53, 36], [61, 36], [64, 36]);

  // ---------------- 2. THE FIRST LOCK (68-81) AND THE MILL (82-121) ----------------
  /* THE FIRST LOCK: the barge noses in and stops at the upper gate. The PADDLE on the gate's face fills the chamber (seven rows); its twin on the
     gate's top works it from above. A ladder up the lower gate's face is the way back up for anyone left in the pound */
  const L1 = reach('L1', 69, 80, 45, 40, 33);
  block(69, 80, 46, H - 1);
  gate('G1', 68, 32, 44, P0, L1); block(68, 68, 45, H - 1); ladder(67, 32, 36);
  const P1 = reach('P1', 82, 197, 38, 33, 33, 'lo', { noBand: true });        /* THE MILL POUND, the weed reach and the fog, all one level: 33 */
  ride(82, 106, 33, 33); ride(124, 129, 33, 33); ride(148, 197, 33, 33);   /* (and not past the mill bridge from the mill side: she waits there until it is swung from the far bank) */                       /* (not under THE LONG ARCH: she goes through, nobody standing on her does) */
  block(82, 197, 39, H - 1);
  gate('G2', 81, 32, 37, L1, P1); block(81, 81, 38, H - 1);
  sluice(80, 39, 'L1'); sluice(81, 31, 'L1');                                /* the paddle on the upper gate's face (at the deck), and the one on its top */
  grindy(79, 40, 'the lock steps');                                          /* under the paddle: at the barge's bow while you work it */
  sign(66, 36, 'A LOCK. STRIKE THE PADDLE ON THE UPPER GATE AND THE CHAMBER FILLS.');
  /* THE MILL, built over the pound: its wharf floor is boards over the water (hop up from the barge), and four floors climb to its top, where the
     miller's door lets out onto the gallery over the mill bridge. The bridge holds the barge until it is swung */
  boards(86, 30, 24);                                                        /* the wharf floor over the water (under the east wall too: the loading bay) */
  block(85, 85, 13, 29);                                                     /* the mill's west wall (the barge passes under it) */
  block(107, 109, 13, 26); block(110, 111, 26, 30);                          /* its east wall, and the bridge pier past it: from the deck, the way up is the wharf floor */
  air(107, 109, 16, 17);                                                     /* the miller's door */
  block(85, 109, 12, 12);                                                    /* the roof */
  boards(86, 27, 9); boards(90, 24, 9); boards(86, 21, 9); boards(90, 18, 17);   /* the floors, three rows apart and staggered: a climb, floor over floor */
  block(86, 103, 15, 15); coins([86, 14], [87, 14], [88, 14], [89, 14]);     /* (claude/canalfix, UPGRADE D) THE MILL ATTIC: a loft floor under the roof, up off the top floor's east end, the miller's last coins at its far end (a pocket) */
  /* (claude/canalfix, review fixes 9 and 11) the mill's two on-foot bargees hook from THE WHARF FLOOR now, down at her deck as she comes in under it and
     while the mill bridge holds her there; the mill-top archer guards the bridge's capstan; the mill checkpoint is gone (Daniel, 10-01: fewer) */
  bargee(92, 29, 'the mill wharf'); bargee(98, 29, 'the mill wharf');
  coins([88, 26], [95, 23], [89, 20], [97, 17]);
  ent('mend', 102, 17);
  post(101, 29); grindy(104, 33, 'under the mill wharf');                            /* under the wharf floor: it comes aboard while the bridge holds her */
  boards(110, 18, 3);                                                        /* the gallery outside the miller's door */
  /* THE MILL BRIDGE (TEACH): across the pound at the towpath's height. The barge waits under the mill's east end; swing it clear from its capstan
     (the far end) and she passes under the far bank, where you drop onto her */
  const B1 = bridge(112, 117, 30, 'across', [118, 29]);
  boards(118, 30, 6);                                                        /* the far bank */
  sign(121, 29, 'A SWING BRIDGE. ACROSS, YOU WALK IT. SWUNG, THE BARGE GOES THROUGH.');
  post(120, 29); archer(123, 29, 'the mill bridge');                         /* in the fog, by the capstan under its lantern: work it lit, or douse it first */

  // ---------------- 3. THE FOG BANK (122-185): the weed reach, the long arch, the bridge garrison, the fog wall ----------------
  fog('F1', 116, 197, 0, 40, { a: 0.72 });
  /* THE WEED REACH: the pound is choked with blanket weed from here to the arch. A swimmer in it is held and cut; the barge's hull goes through.
     A WISP floats on past the bank's end over the weed, where no post stands. A ladder at the bank's end is the way out of the water */
  weedWater.push([124, 129, 'P1']); weed(124, 129, 33);
  sign(119, 29, 'A LANTERN SHOWS YOU - TO THEM TOO. STRIKE A POST TO PUT IT OUT, AGAIN TO LIGHT IT.');   /* (claude/canalfix, review fix 10: the wisp is named after it has lured you, src/canal-foes.js) */
  wisp(125, 28, [128, 31], 'the weed reach lure');
  grindy(126, 33, 'the weed reach');                                         /* in the weed, at the barge's edge as she pushes through */
  /* THE LONG ARCH: a row of warehouses built over the canal. The tunnel under it is too low for anyone standing, even ducked: the barge goes
     through without you. Off at the loading step and up the ladder onto the rooftops, and catch her on the far side */
  boards(127, 30, 3); ladder(129, 21, 29);                                   /* the loading step and the ladder up the warehouse front */
  block(130, 147, 22, 32);                                                   /* the warehouses, and the tunnel's roof one row over the barge's gunwale */
  air(138, 139, 22, 32);                                                     /* THE LIGHT-WELL: the one gap in the roofs, straight down to the water */
  block(132, 135, 19, 21); block(142, 144, 20, 21); block(145, 147, 17, 21);   /* a gable, a step of roof, the belfry */
  post(137, 21); post(141, 21);
  wisp(138, 20, [138, 26], 'the light-well');                                  /* over the light-well: a lamp where there is no roof */
  archer(146, 16, 'the belfry');                                           /* on the belfry: in the fog he sees only the lit (the posts beside the light-well) */
  bargee(141, 21, 'the rooftops');                                           /* (claude/canalfix) on the light-well's east lip, facing back: his hook throws you down the well into the canal */
  coins([133, 18], [136, 21], [143, 19], [146, 16]);
  block(139, 139, 30, 30); ladder(138, 22, 29); ent('silver', 139, 29);     /* a corbel down the light-well, and its ladder back up (a pocket; claude/canalfix, UPGRADE D: deeper, off the roofs' way) */
  /* THE BRIDGE GARRISON (DEVELOP the bridge; the barge held on the far side of the arch): two archers stand on the swing bridge. (claude/canalfix,
     review fix 5) ITS CAPSTAN IS ON THE FAR BANK: you cross between them to swing it - lit, under two bows at arm's length, or in the dark, with the
     near bank's lantern put out. Its LAMPLIGHTER lights it again (and you, with his own lantern): cut him down first. Then swing them into the canal */
  boards(148, 30, 6);                                                        /* the near bank, under the arch's end (long enough to land on off the belfry) */
  const B2 = bridge(154, 159, 30, 'across', [160, 29]);
  archer(155, 29, 'the bridge garrison'); archer(158, 29, 'the bridge garrison'); post(152, 29);   /* the lantern at the bridge's near end lights the near bank and the way on */
  lamplighter(153, 29, 'the bridge garrison');
  ent('check', 149, 29);                                                     /* (claude/canalfix) THE CHECKPOINT OVER THE ARCH'S END, before the garrison and the fog wall (the mill's, moved: the 200-tile ceiling, see the report) */
  boards(160, 30, 5);
  /* THE FOG WALL (the fog as a LOCK): a bank so thick the barge will not go into it. (claude/canalfix, review fix 6) It is longer now, and ITS TWO HORNS
     ARE BOTH NEEDED: the bank horn's clear (4 s) carries her about two-thirds in, where the fog closes on her again beside THE PIER; hop onto it and blow
     the second (6 s), with the footbridge archer over you in the clear air, and drop back aboard. Held at its edge, THE BOARDING GANG comes out of it */
  fog('F2', 165, 190, 0, 40, { thick: true, a: 0.9 });
  fog('F3', 226, 262, 0, 30, { a: 0.6 });                                     /* the fog lies thin over the summit and the weir's head */
  horn(163, 29, ['F2'], 4);
  wisp(166, 28, [168, 32], 'the fog wall lure');
  boarder(168, 31); boarder(170, 31); boarder(172, 31);                      /* UPGRADE C: THE BOARDING GANG, waiting in the fog wall (a skiff brings them to her bow) */
  boards(176, 25, 6); archer(178, 24, 'the fog wall footbridge');                       /* a footbridge high over the fog wall */
  grindy(179, 33, 'the fog wall water');                                           /* under her second stop: it comes aboard while you are at the horn */
  boards(175, 30, 11); horn(183, 29, ['F2'], 6);                             /* THE PIER and its horn, in the thick of it: a long jetty over the water she stalls under, wherever the bank horn's clear ran out */
  coins([159, 29], [173, 29], [182, 29]);
  ent('mend', 182, 29); post(185, 29); bargee(184, 29, 'the second horn');   /* the pier's bargee, by its horn: he hooks at her deck below */

  // ---------------- 4. THE FLIGHT (186-247): three locks up the hill, and the summit bridge ----------------
  /* A STAIRCASE: each chamber's upper gate is the next one's lower. The first paddle is on the gate's face again; the second is up on a balance
     beam over the chamber (a ladder, and a bargee waiting on it); the third is at the summit, across a swing bridge you must stand across yourself */
  /* (claude/canalfix, UPGRADE A) THE FIRST CHAMBER IS SET AGAINST HER: it stands FULL, so its lower gate is shut on her. DRAIN it from the paddle on that
     gate's face (at her bow), and the grindylow lurking up in it is left STRANDED on the wet steps - weak, out of the water: Jenny's own opening, small */
  const L2 = reach('L2', 199, 208, 38, 33, 28, 'hi'); block(199, 208, 39, H - 1);
  gate('G3', 198, 27, 37, P1, L2); block(198, 198, 38, H - 1);
  const L3 = reach('L3', 210, 219, 33, 28, 23); block(210, 219, 34, H - 1);
  gate('G4', 209, 22, 32, L2, L3); block(209, 209, 33, H - 1);
  const L4 = reach('L4', 221, 230, 28, 23, 18); block(221, 230, 29, H - 1);
  gate('G5', 220, 17, 27, L3, L4); block(220, 220, 28, H - 1);
  const P4 = reach('P4', 232, 247, 23, 18, 18); block(232, 247, 24, H - 1);
  gate('G6', 231, 17, 22, L4, P4); block(231, 231, 23, H - 1);
  block(186, 197, 39, 39);                                                   /* (under the mill pound's end) */
  sluice(197, 32, 'L2'); sluice(208, 32, 'L2'); grindy(201, 28, 'the set lock');   /* the drain paddle on the lower gate's face, the fill paddle on the upper's; the grindylow up in the full chamber */
  boards(203, 25, 6); bargee(206, 24, 'the first chamber ledge');                         /* a ledge over the first chamber: he waits for her to come up to him */
  boards(215, 16, 4); ladder(214, 16, 27); sluice(217, 15, 'L3');           /* THE BALANCE BEAM over the second chamber, its ladder and its paddle */
  bargee(216, 15, 'the balance beam');
  grindy(218, 28, 'the second chamber');                                             /* the second chamber's steps */
  ladder(230, 16, 22);                                                       /* up the summit gate's face to its top */
  weedWater.push([232, 236, 'P4']); weed(232, 236, 18);
  /* THE SUMMIT BRIDGE (TWIST: across, it is YOUR way over the weed to the last paddle; then it holds the barge, and it must be swung behind you) */
  const B3 = bridge(232, 236, 16, 'across', [237, 15]);   /* (a step up off the gate's top, level with the summit bank) */
  boards(237, 16, 10); sluice(239, 15, 'L4');
  wisp(234, 13, [233, 17], 'the summit weed');                                   /* THE WEIR APPROACH: a light over the summit weed */
  block(244, 247, 11, 12);                                                   /* the keeper's hut roof over the summit bank (its posts are the bank) */
  ladder(243, 9, 15); block(236, 242, 9, 9); block(235, 6, 9); coins([237, 8], [238, 8], [239, 8], [240, 8], [241, 8]);   /* (claude/canalfix, UPGRADE D) THE KEEPER'S LOFT: up the hut's ladder, a dead-end loft with his stores (a pocket) */
  /* (claude/canalfix, review fix 9: the keeper-hut archer, who touched nothing, stands on the head race's footbridge now - the tiller's window is under his bow) */
  ent('check', 242, 15);                                                     /* CHECKPOINT TWO: the summit, right before the burst */
  sign(240, 15, "THE SUMMIT POUND. THE KEEPER'S LAST PADDLE IS PAST THE BRIDGE.");   /* (claude/canalfix, review fix 10: it no longer announces the race before the gate bursts) */
  coins([222, 20], [226, 20], [238, 14], [245, 14]);
  moorings.push({ cp: [242, 15], x: 225, fill: ['L2', 'L3', 'L4'], bridges: { [B3]: 'open' } });   /* a death past the summit: the flight full, she waits in the last chamber */
  moorings.push({ cp: [149, 29], x: 148, bridges: { [B1]: 'open' } });   /* a death past the arch's checkpoint: she waits under it at the garrison's bridge */

  // ---------------- 5. THE WEIR (248-325): the SET PIECE ----------------
  /* THE SUMMIT GATE BURSTS when she reaches it, and she runs LOOSE down the race with the flood behind (src/chase.js). THE HEAD RACE drops in two
     steps under a low footbridge (duck); at THE JUNCTION her TILLER decides: THE MILL CUT stays up on the hillside (three more low beams, two
     archers and a bargee on the cut's bridges, and four small drops into the basin), THE WEIR goes straight over the broken sill into the lower
     river (one plunge that jars whoever is standing when she lands, then the rapids and their grindylows). Either way she comes out in the basin */
  gate('G7', 248, 17, 22, P4, P4, { weir: true }); block(248, 248, 23, H - 1);
  const hr = (x0, x1, surf, bed) => { air(x0, x1, surf - 8, bed - 1); block(x0, x1, bed, H - 1); pools.push({ x0: px(x0), x1: px(x1 + 1), y: surf * TS + 4, shallow: true, swim: false, clear: true, bottom: bed * TS, canal: 'race', handBack: true }); };   /* (claude/canalfix3: handBack - out of the run, a hero left wading in it is handed back like the deep canal; tools/canal-water.mjs) */   /* THE RACE runs shallow and fast: a hero thrown off her wades on down it, the flood at his back */
  hr(249, 254, 18, 21); hr(255, 263, 22, 25); hr(264, 272, 26, 29);           /* THE HEAD RACE, three steps down */
  block(261, 264, 16, 16); beams.push({ weir: true, x0: px(261), x1: px(265), y: 22 * TS - 2 - 9, name: 'THE FOOTBRIDGE' });   /* the footbridge over the second step (claude/canalfix: moved on 2 columns, so a rider standing at her bow - forward of the flood - meets it with her deck already down the step and can duck it) */
  archer(262, 15, 'the head race footbridge');                               /* (claude/canalfix, review fix 3) over the tiller's window: in the thin fog he looses at her lantern-lit deck */
  grindy(270, 26, 'the junction', { canal: { junction: true } });           /* (claude/canalfix, review fix 2) at THE JUNCTION: the one that boards her while she runs loose */
  const booms = [];   /* (claude/canalfix, review fix 3) BOOMS: a log chained across the race at her deck's height - JUMP it, where a beam asks for a DUCK */
  const boom = (c, path, surf) => booms.push({ x: px(c) + 8, y: surf * TS - 2, path, dmg: 14 });
  boom(252, 'head', 18);   /* on the first step's flat, in the tiller's window: a jump before the footbridge's duck */
  /* THE LOWER RIVER (the weir's side) under the cut's shelf: surface 44, straight into the basin */
  air(273, 325, 30, 43); block(273, 325, 49, H - 1);
  pools.push({ x0: px(273), x1: px(326), y: 44 * TS + 4, shallow: true, swim: false, clear: true, bottom: 49 * TS, canal: 'lower river', handBack: true });
  /* THE MILL CUT: a stone leat on the hillside over the lower river, four levels, each on a shelf of its own */
  const cut = (x0, x1, surf) => { block(x0, x1, surf + 2, surf + 4); pools.push({ x0: px(x0), x1: px(x1 + 1), y: surf * TS + 4, shallow: true, swim: false, clear: true, bottom: (surf + 2) * TS, canal: 'cut', handBack: true }); };
  cut(276, 290, 26); cut(291, 300, 30); cut(301, 308, 34); cut(309, 315, 38);
  for (const [x0, x1, y] of [[279, 281, 26], [295, 297, 30]]) { block(x0, x1, y - 4, y - 4); beams.push({ weir: true, x0: px(x0), x1: px(x1 + 1), y: y * TS - 2 - 9, name: 'A LOW BEAM' }); }
  /* (claude/canalfix) THE WEIR's own duck: the cut's lowest shelf (309-315) hangs one row over a rider standing on the rapids - told as a beam now, not
     only a stone face that scrapes him off */
  beams.push({ weir: true, x0: px(309), x1: px(316), y: 43 * TS, name: 'THE CUT SHELF' });
  boom(286, 'cut', 26); boom(307, 'cut', 34); boom(292, 'fall', 44);
  boards(283, 20, 5); archer(285, 19, 'the high cut bridge');                       /* a footbridge over the cut */
  boards(303, 28, 5); archer(305, 27, 'the low cut bridge');
  boards(288, 23, 4); bargee(289, 22, 'the mill cut');                       /* on a plank over the cut: he hooks at her as she passes (claude/canalfix: raised and moved off the step, where it caught a rider as her deck dropped away under him) */
  grindy(288, 44, 'the lower river'); grindy(306, 44, 'the lower river');   /* on the rapids, at her edges */
  block(299, 301, 42, 42); coins([299, 41], [300, 41], [301, 41]);        /* a ledge on the gorge wall, only from the lower river (a pocket; claude/canalfix3: its silver went down the flooded cellar - the canal keeps the campaign's three) */
  const deckAt = s => s * TS - 2;
  const weirSpec = {
    head: [[px(248), deckAt(18)], [px(254), deckAt(18)], [px(258), deckAt(22)], [px(263), deckAt(22)], [px(267), deckAt(26)], [px(273), deckAt(26)]],   /* (each step a ramp as long as it is deep: she carries you down it) */
    cut: [[px(290), deckAt(26)], [px(294), deckAt(30)], [px(300), deckAt(30)], [px(304), deckAt(34)], [px(308), deckAt(34)], [px(312), deckAt(38)], [px(316), deckAt(38)], [px(322), deckAt(44)], [px(330), deckAt(44)]],
    fall: [[px(274), deckAt(26)], [px(277), deckAt(44)], [px(330), deckAt(44)]],
    junction: px(273), crash: px(277) + 8, end: px(326) + 48, bank: [px(327) + 8, 41 * TS],   /* bank: where a hero who falls off on the run is handed back (the basin's west bank) */
    slowTo: px(272), helmBy: px(268), booms,   /* (claude/canalfix) she runs slow on the steps till 272 (the flood laps her stern); the tiller answers till 268; the booms */
  };
  chases.push({ id: 'weir', x: 248, name: 'THE FLOOD', axis: 'x', dir: 1, trigger: px(248) + 8, end: px(326), gap0: 180, curve: [[0, 70], [520, 96, 'THE FLOOD GAINS ON YOU']], rubber: { min: 64 },   /* (claude/canalfix: MIN_FAIR) */
    contact: 'hurt', dmg: 30, look: 'water', say: 'THE GATE BURSTS! HOLD ON!', glow: 280, zone: [px(240), px(330), 0, H * TS],
    beams: beams.filter(b => b.weir).map(b => ({ x0: b.x0, x1: b.x1, y: b.y, name: b.name, dmg: 14 })), checkpoint: [242, 15] });
  /* the reach model's view of the ride: footing along each stretch of her path */
  ride(249, 254, 18, 18); ride(255, 263, 22, 22); ride(264, 290, 26, 26); ride(291, 300, 30, 30); ride(301, 308, 34, 34); ride(309, 315, 38, 38); ride(273, 325, 44, 44);

  // ---------------- 6. THE THEATRE BASIN (326-369): the EXAM - all of it at once ----------------
  /* She comes out of the race into a basin in THICK fog and stops. The way on is east, over the weed, to the lock under the theatre. The bridge stands
     across (walk it; it holds her); the horn is on the west bank behind you and the bridge's capstan on the island past it, under the foreman; the archers on the theatre
     bridge loose at whatever is lit (her lantern, the posts - and everything, while the horn has the fog cleared); a wisp over the weed shines like the
     lock's own lamp. Clear the fog, swing the bridge, and be on her when she passes under the island - before the fog comes back */
  const P5 = reach('P5', 326, 354, 49, 44, 44); block(326, 354, 50, H - 1);
  /* THE BASIN LOCK, last of all (the LOCK in the exam): the theatre's door is four rows over the basin, and only a full chamber puts her deck in reach of
     it. Its paddle is on the upper gate's face, at her bow - and a grindylow is on the steps there */
  const L5 = reach('L5', 356, 369, 49, 44, 40); block(356, 369, 50, H - 1);
  gate('G9', 355, 39, 48, P5, L5); block(355, 355, 49, H - 1); sluice(369, 43, 'L5');
  fog('F4', 326, 375, 20, 49, { a: 0.7 });   /* (claude/canalfix3: to the lock floor - not down into the cistern under it) */ fog('F5', 332, 343, 20, 52, { thick: true, a: 0.9 });
  /* (claude/canalfix, review fix 4) TWO STOPS, NOT ONE: THE HORN IS ON THE WEST BANK (its own 6.5 s), THE CAPSTAN ON THE ISLAND. Blow it, cross the bridge
     in the clear air under both theatre-bridge bows, swing it, and be on her as she passes under the island before the bank rolls back - the foreman and
     the island's lamplighter are best dealt with first, in the dark */
  boards(326, 41, 10); horn(329, 40, ['F5'], 6.5); post(333, 40);            /* the west bank */
  const B4 = bridge(336, 341, 41, 'across', [342, 40]);
  boards(342, 41, 8); post(348, 40);                                         /* THE ISLAND */
  foe('gaffer', 347, 40, { squad: 'the island', elite: true, gate: 372, canal: { bargee: true, cnSkin: 'deckforeman' } });   /* THE DECK FOREMAN: the basin's elite, and the lock door is shut until he is down */
  lamplighter(349, 40, 'the island');                                        /* kill him first: he keeps the island's east post lit, and his lantern shows you to the theatre bridge (the bridge itself is dark: cross it unseen) */
  weedWater.push([349, 354, 'P5']); weed(349, 350, 44); weed(351, 352, 44, 'bright'); weed(353, 354, 44);
  wisp(353, 40, [354, 44], 'the weed');                                       /* over the weed: the lock's lamp, it seems */
  wisp(334, 40, [336, 45], 'the fog');                                        /* in the thick: over the water beside the bridge */
  grindy(331, 44, 'the basin'); grindy(368, 44, 'the basin lock steps');
  boards(340, 34, 20); archer(345, 33, 'the theatre bridge'); archer(355, 33, 'the theatre bridge');   /* THE THEATRE BRIDGE, high over the basin */
  post(350, 33); ladder(349, 34, 40);                                         /* a ladder up to it off the island: its archers can be reached */
  moorings.push({ cp: [375, 40], x: 364, fill: ['L5'], bridges: { [B4]: 'open' } });        /* a death at the lock door: she is moored at its foot */
  coins([330, 40], [338, 40], [344, 40], [352, 33], [362, 40]);
  ent('mend', 327, 40);

  // ---------------- 7. JENNY'S LOCK (370-431): JENNY GREENTEETH's lock chamber and her fight (claude/lockkeeper's module, wired by claude/greenwire) ----------------
  /* THE LOCK'S LOWER GATE is the corridor's floor: the barge moors at its foot (a grindylow on its steps), you hop up onto it, walk the corridor
     through the foreman's gate to the checkpoint, and her WEST DOOR is at the corridor's end, at bed level. Her chamber is stageGreenteeth(sx 376, R 41):
     columns 376-415 (gates at 376 and 415, water 377-414), rows 25-42 (she lays rows 41 and 42 herself; row 43 is solid here), her doors at rows 35-40 in
     each gate - the west door opens off this corridor, the east door (the way on once she is down: the arena walls close both while she wakes) onto the
     quay at 416. Her track is her own (arena.music 'greenteeth'); the level's stays 'canal'. */
  block(370, 373, 37, H - 1);                                                 /* THE LOCK'S LOWER GATE and the corridor's first floor: a step up from her deck when the basin lock is full */
  block(370, 375, 30, 33); air(371, 375, 34, 36); air(374, 375, 37, 40); block(374, 375, 41, H - 1);   /* the corridor, stepping down to her west door at her bed level */
  ent('check', 375, 40);                                                      /* CHECKPOINT THREE: just outside her west door */
  /* (claude/canalfix3) THE CISTERN (a SAFE SWIM): under the basin lock's floor and the corridor, clear water; the lock's bed over it is an iron grate (the basin lock's
     green on the other side). Down the hatch in the corridor floor and its ladder; a mend and the lock-keeper's coins at the bottom, before her door */
  swim('the cistern', 360, 375, 50, 54, 51, { grate: [361, 49, 49, -1], bumpFrom: 368 });
  set(372, 37, T.ONEWAY); hatches.push([372, 37]); air(372, 372, 38, 49); ladder(372, 38, 51);
  grates.push([361, 366, 49, 49]); ent('mend', 364, 54); coins([362, 53], [366, 53], [369, 53]);
  sign(375, 40, "JENNY'S LOCK. THE GRINDYLOWS' MOTHER KEEPS IT.");
  air(376, 415, 25, 40); block(376, 415, 41, H - 1);                         /* her footprint, cleared before she lays herself into it */
  const jenny = stageGreenteeth({ set, block, plat: boards, ent }, T, TS, 376, 41);
  ent('gate', 420, 40);                                                        /* the level's end, out on the quay past her east door: it opens when she dies (gateAfterBoss) */
  block(416, 431, 41, H - 1);                                                  /* the theatre quarter's quay, past her east door */
  /* (claude/canalfix, review fix 8: the bargee who waited on this quay could never be reached past the end gate - removed; claude/greenwire kept it so: nothing stands past her) */

  // ================= THE LADDERS, LAST =================
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  const START = { x: 2, y: 25 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [...pools, ...jenny.pools], falls: [], moversExtra: [
      { kind: 'barge', canal: true, x: px(36), y: 40 * TS - 2, w: 96, h: 10 }, ...jenny.movers ],
    arena: jenny.arena, gateAfterBoss: true,
    interiors: [[14, 29, 19, 38, 'cnWarehouse'], [86, 106, 13, 29, 'cnMill'], [371, 375, 37, 40, 'cnDoor'], [16, 34, 42, 49, 'cnCellar'], [360, 375, 50, 54, 'cnCistern']],   /* (claude/canalfix3) the safe swims' vaults */
    canal: { reaches, gates, bridges, fogs, weedWater, weeds, beams: beams.filter(b => !b.weir), moorings, weir: weirSpec, barge: { x: 36 }, arcs: ARCS, sections: SECTIONS,
      swims, grates, hatches,   /* (claude/canalfix3) the safe swims, their iron grates, the hatches into them */
      sides, arch: [130, 147, 32], gangAt: 165, jetties: [[175, 185, 30]], street: { railings: [[1, 12, 26], [45, 52, 37], [60, 66, 37], [176, 181, 25], [241, 246, 16], [341, 358, 34]], bollards: [[35, 39], [344, 41]] },   /* (claude/canalfix3) the one timber jetty (the fog wall's pier): every other ledge is stone, src/redraw/canal_tiles.js */   /* (claude/canalfix) her sides of the Waymeet pound; THE LONG ARCH [x0, x1, the tunnel roof's lowest row]; the fog wall's front, where the gang boards */
      /* JENNY GREENTEETH, FORESHADOWED (cheap and told): eyes that open in the fog now and then [x, y, phase], a child's shoe on a step, bubbles by the bank where nothing lives */
      eyes: [[146, 27, 0.1], [176, 29, 0.55], [235, 16, 0.75], [339, 38, 0.3]], shoes: [[35, 38], [372, 36]], bubbles: [[40, 40], [61, 40], [100, 33], [175, 33], [240, 18], [335, 44]] },
    chases, rigBands,
    waterHurts: true, noWade: true,   /* THE CANAL IS JENNY'S WATER: a fall in costs health and hands you back to the last ground you stood on (main.js, as the Marsh); and it is
                                         not a floor to the reach model (src/reachcore.js L.noWade): only the barge crosses it */
    lockArena: { sx: 376, R: 41, x0: 376, x1: 415, rows: [25, 42], westDoor: [376, 35, 40], eastDoor: [415, 35, 40] },   /* JENNY GREENTEETH's lock (claude/greenwire): the footprint stageGreenteeth(..., 376, 41) lays (see section 7) */
    squadBands: [{ lo: 400, hi: 599, spots: 0, why: "JENNY'S LOCK: the last columns are her chamber's east end and the quay past her door - nothing stands past her, and no squad stands in a boss arena (as the theatre)" }],
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,                  /* three checkpoints (Daniel: fewer); src/level.js checkpoints() must not fill between them */
    /* WHAT EACH MACHINE OPENS, and the line that says so (claude/canalfix: tools/level-quality.mjs `unlocks`; the lines are the hints src/canal-hands.js shows) */
    unlocks: [
      { kind: 'locksluice', opens: 'the lock gate ahead (the water levels)', hud: 'THE PADDLE IS UP: THE CHAMBER FILLS. THE GATE AHEAD OPENS WHEN THE WATER IS LEVEL.' },
      { kind: 'swingcap', opens: 'the way on for the barge (the bridge swung clear)', hud: 'THE BRIDGE STANDS ACROSS THE WATER: HER LANTERN POLE WILL NOT PASS UNDER IT.' },
      { kind: 'foghorn', opens: 'the fog wall and the basin fog, for a while', hud: 'THE FOGHORN: THE FOG LIFTS - FOR A WHILE. EVERY ARCHER SEES YOU NOW.' },
      { kind: 'lanternpost', opens: 'the dark (doused: the archers in the fog cannot see you)', hud: 'THE LANTERN IS OUT: IN THE DARK THE ARCHERS CANNOT SEE YOU. NOR CAN YOU.' } ],
    bgSpan: 200,   /* the backdrop (src/redraw/canal_backdrop.js) rides within 200 px whatever storey the camera is on: the summit is not off the bottom of it */
    music: 'canal', dark: 0, night: true, nightA: 0.3, duskStart: 99999, duskLen: 1,
    palette: { sky: 'storm', far: 'town', mid: 'town', near: 'town', dress: 'canal', noNear: true,   /* (claude/canalfix3, Daniel 10-02: a NIGHT CITY STREET - not the village's dovecote, lychgate, yews and stocks, and no forest bough over the lens or grass at its foot: the canal's own near layer, src/redraw/canal_backdrop.js) */
      darkCol: '8,14,18', haze: 'rgba(150,175,170,0.16)',
      grass: '#4a5a52', grassL: '#6a7a70', grassD: '#2e3a34', dirt: '#3e4440', dirtL: '#5a625c', dirtD: '#262c28', canopy: ['#0e1618', '#16222a', '#1e2e34', '#283a40'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'water' }],
  };
}
