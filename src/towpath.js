// src/towpath.js - THE TOWPATH, the road inland: the bridge level WAYMEET -> THE TOWPATH -> THE FOG CANAL. THE TOWPATH 2 (claude/towpath2, the OPUS rework,
// 2026-10-14; scratch/brief-towpath2.md - Daniel 10-10 after playing it live: "feels incomplete. One mechanic that repeats and repeats. No platforming, no
// verticality. Needs a lot more variety, at least one unique enemy type, better use of fog and the central mechanic... more foreboding, more haunting").
// The first greybox (claude/towpath, 10-08) gave the locks, the swing bridges and the lantern; this rework gives the FOG its rule, the level its height, the
// one new foe (THE FOG WRAITH, src/fog-wraith.js) and two only-here set pieces (THE AQUEDUCT's sluice and barge, THE BASIN CRANE's hook). Greybox art for the
// new pieces: the art lane draws them (scratch/brief-towpath2.md section 4; the frame list is in work/claude/lane-done/claude-towpath2.md).
//
// THE RULE: THE FOG LIES ON THE LOW WATER. THE LOCKS LIFT YOU OUT OF IT.
// FOG: every pound - a reach of canal, the river in the gorge, the basin - and every lock's LOW water carries a FOG BANK, FOG_H rows deep above that water
// (src/towpath-hands.js fogAt(x, y): the bank's top edge is a fixed row, drawn as a rolling layer with its top edge clear). A towpath at the water's edge
// lies IN it: half-blind (only your lantern's clearing or a lamp's shows the way), but HIDDEN - a WATCHMAN sees a hero in the fog only when he is lit, and a
// dozing bargeman wakes only to a lit hero or one at his elbow. ABOVE the bank's top - on a lock filled, a gate beam, a roof, the aqueduct - the air is clear:
// you see far, and every watchman sees you, lit or not. The FOG WRAITHS live in the banks (they never rise above a top edge): dim, a wraith is fog - it
// drifts through you (a chill) and no blade finds it; in a light it hardens and can be cut; close to a lit lantern it reaches to smother it.
// THE LOCKS (the first greybox's verb, kept): a lock is a chamber between two gates; its PADDLE (struck, or E) sets it filling or draining; what floats in
// it - a moored PUNT - rides the water. FILL a lock and you rise out of the fog to the upper bank; DRAIN it and you sink into the fog (and a drained
// chamber is a floor - in THE LAST LOCK a floor of old gate irons that only your lantern shows). A LOWER GATE stands open only while its chamber is down at
// its lower pound. A man in a chamber that fills is DROWNED. The other verbs: THE SWING BRIDGE (a capstan), THE LANTERN (the lock-keeper's, taken at his hut
// at the start; E lights or dims it), THE MILL'S RACE (drain it and the wheel stands still - its paddles a stair) and its SACK HOIST (a winch), THE
// AQUEDUCT'S SLUICE (open it: the dry trough runs and floats the moored barge over the broken span), THE BASIN CRANE (its capstan swings the jib: ride its
// hook out of the basin's fog up to the warehouse roofs).
//
// EIGHT SECTIONS (design columns; rows below are DESIGN rows, the sheet is laid O rows lower) - no two in a row on the same verb (brief section 2):
//   0-46     THE LYCHGATE         FORK      Waymeet's last lane at dusk; the hill path to THE LIT CHURCH; down the bank into the fog: the lock-keeper's hut and
//                                           his LANTERN, the hurt-spike teach; the first FOG WRAITH over the low water (your light hardens it: cut it)
//   47-95    THE MILL-POND LOCK   TEACH     onto the punt, strike the paddle: the lock lifts you OUT of the fog - and above it the cottage's crossbow sees you
//   96-165   THE MILL             TEST      drain the race, climb the stilled wheel into the loft; the SACK HOIST up to the sack floor under a crossbow; the
//                                           gantry out of the sack door and THE TAIL RACE's swing bridge (taught safe) high over the race's fog; the hedge-knight
//                                           champion on the hill bank (the section's exam) - the first shrine
//   166-235  THE LOCK FLIGHT      SET PIECE three locks up the hill, each a different use of the rule: DRAIN F1 to bring its punt down into the fog, FILL to ride
//                                           out; FILL F2 to drown the pair on its dry bed (or fight them in the fog on it); ride F3 up out of its fog under the
//                                           watchman's beam - the bargeman champion on the top deck; THE LOCK-KEEPER'S TOWER (the landmark: a ladder climb)
//   236-321  THE AQUEDUCT         SET PIECE the canal's iron trough over the gorge, dry and broken: OPEN ITS SLUICE and the water floats the moored barge across
//                                           the broken span in the clear air under a watchman; then THE BROKEN ARCHES - the platforming section and its exam:
//                                           pier to pier down into the basin's fog, where only your lantern shows the next pier (and a wraith waits);
//                                           the second shrine at their foot
//   322-390  THE BASIN            REMIX     thick fog: the swing bridge strands the dozing squad; THE SUNKEN BARGES, hull to hull across the east basin (their masts
//                                           poles); THE BASIN CRANE's hook out of the fog up to the warehouse roofs, where the watchman sees you
//   391-441  THE LAST LOCK        EXAM      drain X and CROSS ITS FLOOR in the fog among the old gate irons (only the lantern shows them; a wraith reaches for
//                                           it), the culvert, Y refilled up out of the fog under a bargeman's hook, the last cut swung across to the deck
//                                           foreman (the exam's elite) - the shrine after it
//   442-493  THE TOWPATH'S END    BOSS      THE FOG KNIGHT (src/fog-knight.js stageFogKnight): the cut, its swing bridge, the lock at two heights, the fog line
import { stageFogKnight, FK_STAGE } from './fog-knight.js';

export const O = 9;   /* the sheet is laid O rows lower than the design rows written here (headroom over the flight, the tower and the aqueduct) */
export const TOWPATH = { W: 442 + FK_STAGE.W, H: 60 };   /* (60 rows: tools/pacing.mjs reads a sheet over 60 as a TALL level, floors not a walk - this is a walk) */
export const RULE = 'THE FOG LIES ON THE LOW WATER. THE LOCKS LIFT YOU OUT OF IT.';
export const FOG_H = 4;   /* a fog bank's depth over its water, rows: a towpath at the water's edge lies in it; a lock filled, a beam, a roof stand above it */
export const SECTIONS = [['THE LYCHGATE', 0], ['THE MILL-POND LOCK', 47], ['THE MILL', 96], ['THE LOCK FLIGHT', 166], ['THE AQUEDUCT', 236], ['THE BASIN', 322], ['THE LAST LOCK', 391], ["THE TOWPATH'S END", 442]];
/* each verb's arc (design columns) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/towpath.mjs */
export const ARCS = {
  lock: { teach: [47, 56], test: [99, 110], remix: [166, 189], exam: [394, 418], boss: [442, 493] },        /* the mill-pond lock; the millrace (drain); the flight (drain, drown, ride); X and Y */
  fog: { teach: [28, 58], test: [124, 139], remix: [166, 189], exam: [394, 418], boss: [442, 493] },        /* the low bank and the lift out; the yard under the gantry; the flight's three fogs; X's floor of irons */
  bridge: { teach: [130, 139], test: [328, 344], exam: [422, 427], boss: [442, 493] },                       /* the tail race (safe); the basin (strand the squad); the last cut; the scatter */
  lantern: { teach: [39, 58], test: [290, 321], exam: [394, 405], boss: [442, 493] },                        /* the hut and the first wraith; the broken arches in the fog; X's irons; the burn */
  platform: { teach: [96, 131], test: [166, 235], exam: [290, 321] },                                        /* the wheel and the hoist; the flight and its tower; THE BROKEN ARCHES (A14) */
};

export function buildTowpath({ painter, T, TS }) {
  const { W, H } = TOWPATH;
  const L = painter(W, H);
  /* THE DESIGN-ROW HANDS: every row below is a design row, laid O rows lower */
  const set = (x, y, v) => L.set(x, y + O, v);
  const block = (x0, x1, y0, y1) => L.block(x0, x1, y0 + O, Math.min(H - 1, y1 + O));
  const ent = (t, x, y, o) => L.ent(t, x, y + O, o || {});
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const BOT = H - 1 - O;
  const ground = (x0, x1, top) => block(x0, x1, top, BOT);
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const nets = [], ladder = (x, y0, y1) => nets.push([x, y0, y1]);   /* every ladder is hung LAST, over what is carved */
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const R = r => (r + O) * TS;   /* a design row's top, in px */
  /* THE CAST (every one a proven machine under a skin but the wraith; src/towpath-hands.js gives the bargemen and watchmen their eyes in the fog via `tp`) */
  const foe = (t, x, y, squad, o) => ent(t, x, y, Object.assign({ face: -1, squad }, o || {}));
  const sworn = (x, y, squad, o) => foe('swornsword', x, y, squad, o);                                                   /* WAYMEET's sworn swords, still on the lane */
  const hedge = (x, y, squad, o) => foe('hedgeknight', x, y, squad, o);                                                  /* WAYMEET's hedge knights (heavy) */
  const crossbow = (x, y, squad, o) => foe('crossbow', x, y, squad, o);                                                  /* WAYMEET's crossbowmen (ranged), on the mill */
  const bargeman = (x, y, squad, o) => foe('gaffer', x, y, squad, Object.assign({ cnSkin: 'bargeman', tp: { bargee: true } }, o || {}));   /* THE BARGEMAN: the Ore Road's gaffer under the canal's man (his boathook pulls you toward the water) */
  const riverrat = (x, y, squad, o) => foe('gaffer', x, y, squad, Object.assign({ cnSkin: 'riverrat', tp: { bargee: true } }, o || {}));
  const watchman = (x, y, squad, o) => foe('archer', x, y, squad, Object.assign({ cnSkin: 'watchman', tp: { tpSight: true } }, o || {}));   /* THE WATCHMAN: in the fog he looses only at what is lit; above it, at anyone */
  const wraith = (x, y, squad) => ent('fogwraith', x, y, { squad, face: -1 });                                            /* THE FOG WRAITH: the level's one new foe (src/fog-wraith.js) */

  /* THE RULE'S PIECES (src/towpath-hands.js reads them off L.towpath) */
  const locks = [], bridges = [], wheels = [], banks = [], lamps = [], moversExtra = [], rigBands = [], pools = [], interiors = [], decor = [], hoists = [], troughs = [], cranes = [];
  /* A FOG BANK: over columns x0..x1, its top edge FOG_H rows over the water at surf (a design row); a: its thickness (the night thickens it as you go) */
  const bank = (x0, x1, surf, a, o) => banks.push(Object.assign({ x0, x1, top: surf - FOG_H + O, surf: surf + O, a }, o || {}));
  /* A LOCK: chamber columns x0..x1, its bed row (solid from there down), its two water levels (surface rows: lo is the lower pound's, hi the upper's; lo === bed
     is a chamber that drains DRY), the level it starts at, its LOWER GATE (column, rows top..bot: solid while the water stands over its lower pound), and
     whether its low water only wets you (shallow: the teach). Its water is an engine pool whose surface src/towpath-hands.js moves */
  const lock = (id, x0, x1, bed, lo, hi, init, o = {}) => {
    air(x0, x1, Math.min(lo, hi) - 3, bed - 1); block(x0, x1, bed, BOT);
    const y = (init === 'hi' ? hi : lo) * TS + R(0) + 4;
    pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: Math.min(y, R(bed)), shallow: false, swim: false, clear: true, bottom: R(bed), tp: id, dry: init !== 'hi' && lo >= bed });
    locks.push(Object.assign({ id, x0, x1, bed: bed + O, lo: lo + O, hi: hi + O, init, pool: pools.length - 1, gate: o.gate ? { x: o.gate[0], top: o.gate[1] + O, bot: o.gate[2] + O } : null, shallowLo: !!o.shallowLo, race: !!o.race }));
    return id; };
  /* A PUNT moored in a lock (columns x0..x0+w-1): a mover whose deck rides the chamber's water (on its bed when it is dry) - for the reach model, a ride from lo to hi */
  const punt = (id, x0, w = 4) => { const k = locks.find(q => q.id === id); moversExtra.push({ kind: 'punt', towpath: id, x: x0 * TS, y: 0, w: w * TS, h: 8 });
    rigBands.push([x0, x0 + w - 1, k.hi - 0, Math.min(k.lo, k.bed - 1)]); };
  const paddle = (x, y, id, o) => ent('tppaddle', x, y, Object.assign({ lock: id }, o || {}));
  /* A SWING BRIDGE: a deck of one-way boards across the cut at row, x0..x1; 'across' or 'open' to start; its capstans [[x, y], ...] (each on a bank) */
  const bridge = (id, x0, x1, row, init, caps) => { bridges.push({ id, x0, x1, row: row + O, init }); if (init === 'across') boards(x0, x1, row); for (const [cx, cy] of caps) ent('tpcapstan', cx, cy, { bridge: id }); };
  /* a plain pound (deep, one level): the tail race, the basin, the last cut, the river in the gorge - water you fall into */
  const pound = (id, x0, x1, bed, surf) => { air(x0, x1, surf - 6, bed - 1); block(x0, x1, bed, BOT); pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: R(surf) + 4, shallow: false, swim: false, clear: true, bottom: R(bed), tp: id }); };
  const lamp = (x, y, lit) => { lamps.push({ x, y: y + O, lit: !!lit }); ent('tplamp', x, y, { lit: !!lit }); };   /* a lamp post on the towpath: struck, lit or put out */
  /* THE SACK HOIST (THE MILL): a deck w columns wide in its shaft, from its bottom stop - a NOTCH a row deep cut in the floor at row bot, the deck a step down in it
     (a mover is boarded from above: a deck flush with the floor would be under your feet, not your footing) - up to its top (flush with the floor at row top); a
     WINCH at each floor beside the shaft sends it to the other stop. For the reach model, a ride from bot to top */
  const hoist = (id, x0, w, top, bot, winches) => { air(x0, x0 + w - 1, bot, bot); hoists.push({ id, x0, w, top: top + O, bot: bot + O, topPx: R(top), botPx: R(bot + 1) - 6 });
    moversExtra.push({ kind: 'hoist', towpath: id, x: x0 * TS, y: R(bot + 1) - 6, w: w * TS, h: 6 }); rigBands.push([x0, x0 + w - 1, top + O, bot + 1 + O]);
    for (const [wx, wy] of winches) ent('tpwinch', wx, wy, { hoist: id }); };
  /* THE AQUEDUCT'S TROUGH: an iron channel west..east whose bed is at bed (a design row: the channel a row under the walkway, so the dry barge is boarded a step
     down) and whose water, running, stands at surf; a BARGE w columns long moored at x0 (dry, on the bed); its SLUICES [[x, y], ...] (struck, or E): the water runs and floats the barge to the far stop (west stop at stopW, east at stopE:
     its west end's column). For the reach model, a ride along surf from stopW to stopE + w - 1 */
  const trough = (id, stopW, stopE, bed, surf, w, sluices) => { troughs.push({ id, stopW, stopE, bed: bed + O, surf: surf + O, w });
    moversExtra.push({ kind: 'barge', towpath: id, x: stopW * TS, y: R(bed) - 8, w: w * TS, h: 8 }); rigBands.push([stopW, stopE + w - 1, surf + O, surf + O]);
    for (const [sx, sy] of sluices) ent('tpsluice', sx, sy, { trough: id }); };
  /* THE BASIN CRANE: its HOOK (a platform w columns wide) hangs at `from` [x, row] - in a notch cut in the quay, a step down (row: the notch's floor) - and its
     capstan swings the jib to `to` [x, row] over the roof - and back (row: the roof's surface, the hook flush with it). For the reach model, a ride over the box */
  const crane = (id, from, to, w, caps, mast) => { air(from[0], from[0] + w - 1, from[1] - 1, from[1] - 1); cranes.push({ id, from: [from[0], from[1] + O], to: [to[0], to[1] + O], w, mast: [mast[0], mast[1] + O], fromPx: R(from[1]) - 6, toPx: R(to[1]) });
    moversExtra.push({ kind: 'hook', towpath: id, x: from[0] * TS, y: R(from[1]) - 6, w: w * TS, h: 6 }); rigBands.push([Math.min(from[0], to[0]), Math.max(from[0], to[0]) + w - 1, Math.min(from[1], to[1]) + O, Math.max(from[1], to[1]) + O]);
    for (const [cx, cy] of caps) ent('tpcrane', cx, cy, { crane: id }); };

  // ================= 0. THE LYCHGATE (0-46): THE HUT, THE FIRST WRAITH =================
  /* WAYMEET's last lane, at dusk, and the river road down the bank. (claude/towpathchurch, 10-16: the HILL PATH to THE LIT CHURCH that forked off this first screen - four steps up to a
     church door, and the Towpath's hidden bronze-medal gate behind it - is gone: the church road opens on WAYMEET's three votive lamps, src/votive-hands.js, and hangs off WAYMEET on the map.) */
  ground(0, 17, 34);
  sign(3, 33, 'THE TOWPATH. THE RIVER ROAD OUT OF WAYMEET.');
  ent('tplychgate', 13, 33);
  sign(15, 33, 'DOWN THE BANK: THE RIVER AND THE LOCKS.');
  /* THE KEEPER'S GANTRY (claude/towpathchurch: it replaces the hill path's height - the second layer over the first screen): a plank walk off the lane's end, three rows up, running out over the bank and the river path
     under it (a sworn sword in the fog below): a second height for the whole first screen, coins along it, and a drop back to the bank. On its poles (B9) */
  boards(17, 34, 31); ent('deco', 17, 33, { kind: 'stilt' }); ent('deco', 26, 37, { kind: 'stilt' }); ent('deco', 34, 37, { kind: 'stilt' });
  coins([21, 30], [27, 30], [31, 30], [33, 30]);
  /* THE RIVER PATH: down the bank INTO THE FOG (the mill-pond's low water lies under the bank: its bank's top edge is over your head), a sworn sword in it */
  ground(18, 23, 36); ground(24, 46, 38);
  sworn(31, 37, 'theBank', { face: -1 });
  decor.push({ kind: 'milestone', x: 25, y: 37 + O }, { kind: 'willow', x: 28, y: 37 + O, drowned: true });
  boards(27, 33, 35);   /* (the drowned willow's limb over the bank: a second height) */
  /* THE HURT-SPIKE TEACH (survival, Daniel 10-09: the last lock's exam kills on irons, so they are met first where they only HURT): two iron spikes in the bank
     path - a bite costs a quarter of the bar and hands you back to the last safe footing; a hop clears them (the willow's limb is the way over) */
  for (const x of [35, 36]) set(x, 37, T.SPIKE); coins([34, 35], [35, 34], [36, 34], [37, 35]);
  /* THE LOCK-KEEPER'S HUT, in the fog: his LANTERN on its hook (walked through, it is yours, lit) and his armour on its stand, empty, fog in the visor (B8:
     THE APPROACH SETS HIM UP - what became of him) */
  block(39, 44, 34, 34); block(39, 39, 35, 35); block(44, 44, 35, 35); interiors.push([40, 43, 35 + O, 37 + O, 'tpHut']);
  ent('tplantern', 41, 37); decor.push({ kind: 'emptyArmour', x: 43, y: 37 + O });
  sign(38, 37, "THE LOCK-KEEPER'S LANTERN. HE WENT UP TO THE LAST GATE; ONLY HIS ARMOUR CAME BACK.");
  /* THE FIRST FOG WRAITH: over the lock's low water, in the bank - your lantern is lit, so in its light the thing is solid: cut it (dim, it drifts through you) */
  wraith(51, 38, 'firstWraith');

  // ================= 1. THE MILL-POND LOCK (47-95): TEACH - onto the punt, strike the paddle, ride up OUT OF THE FOG =================
  /* the lower gate (col 47) stands open at the low water; the chamber (48-55) is a mill pond's lock: its low water only wets you (shallow - the teach), its
     high water is the upper bank's level (row 34). Four rows up: no jump makes it - the lock does, and it lifts you out of the bank (its top: row 36) */
  block(47, 47, 38, BOT);
  lock('A', 48, 55, 44, 40, 34, 'lo', { gate: [47, 33, 37], shallowLo: true });
  punt('A', 48, 8); paddle(54, 39, 'A'); paddle(46, 37, 'A');   /* (its twin on the lower bank: a punt that rode up without you comes back down) */
  sign(40, 37, 'THE LOCK WATER DROWNS. IT IS NO WATER TO SWIM: STAY ON THE BANK AND THE BOATS.');   /* (1b, 10-16: the lethal water is told before the first lock: it is drawn dark under a pale skin, with eddies and a reaching hand) */
  sign(45, 37, 'THE FOG LIES ON THE LOW WATER. STRIKE THE PADDLE: THE LOCK LIFTS YOU OUT OF IT.');
  bank(24, 58, 40, 0.5);   /* the mill pond's bank: over the low towpath, the hut and the chamber at its low water */
  ground(56, 99, 34);
  /* THE UPPER BANK, ABOVE THE FOG: a hedge knight waits where the punt lets you off; the cottage's crossbowman on its roof sees you - lit or not */
  hedge(60, 33, 'lockTop', { face: -1 });
  sign(58, 33, 'ABOVE THE FOG THE AIR IS CLEAR: YOU SEE FAR, AND EVERY EYE SEES YOU.');
  block(67, 75, 29, 29); block(67, 67, 30, 31); block(75, 75, 30, 31); interiors.push([69, 73, 30 + O, 33 + O, 'tpCottage']);
  crossbow(72, 28, 'cottageRoof', { face: -1 }); boards(64, 66, 31);   /* (a water butt by its wall: the step up onto the roof) */
  ground(80, 83, 32); sworn(82, 31, 'stile', { face: -1 });
  coins([74, 28], [88, 33]); ent('silver', 70, 28);   /* (the cottage roof: a silver, up the water butt under the crossbow) */
  boards(84, 92, 30);
  decor.push({ kind: 'cattle', x: 62, y: 33 + O }, { kind: 'milestone', x: 90, y: 33 + O }, { kind: 'eeltrap', x: 52, y: 39 + O });

  // ================= 2. THE MILL (96-165): TEST - the race, the wheel, THE SACK HOIST, the gantry and the tail race's swing bridge =================
  /* THE MILLRACE: the race pit (100-108) between the towpath and the mill. While the race RUNS the wheel turns - its blades in the pit, no footing on it; DRAIN
     the race (its paddle on the bank) and the wheel stands still: its paddles are a stair (src/towpath-hands.js sets the cells) up to the mill's loft. The
     drained pit lies in its own fog (a wraith in it: a fall costs you) */
  lock('race', 100, 108, 44, 44, 35, 'hi', { race: true });
  ladder(100, 33, 43); ladder(108, 29, 43);
  paddle(98, 33, 'race');
  sign(96, 33, 'THE RACE TURNS THE WHEEL. STRIKE ITS PADDLE ON THE BANK.');
  wheels.push({ id: 'mill', race: 'race', cx: 105, cy: 31 + O, r: 4, steps: [[100, 102, 32 + O], [103, 105, 30 + O], [106, 108, 27 + O]] });
  bank(99, 109, 44, 0.55); wraith(104, 43, 'racePit');
  /* THE MILL: its loft floor (27), its SACK FLOOR (19) and its roof (11); THE SACK HOIST in its shaft (115-116) rides the loft floor to the sack floor - a winch
     beside the shaft on each floor sends it (struck, or E). A sworn sword on the loft; a crossbowman on the sack floor looses down the shaft as you ride */
  ground(109, 125, 27);
  block(109, 125, 11, 11); block(109, 109, 12, 18); block(125, 125, 12, 16); block(125, 125, 19, 23);   /* the roof; the west wall over the wheel's entry; the east wall round the sack door (17-18) and over the loft door (24-26) */
  boards(110, 114, 19); boards(117, 124, 19);
  interiors.push([110, 124, 12 + O, 26 + O, 'tpMill']);
  hoist('sack', 115, 2, 19, 27, [[117, 26], [117, 18]]);
  sign(113, 26, 'THE SACK HOIST: STRIKE ITS WINCH AND IT RIDES TO THE OTHER FLOOR.');
  sworn(121, 26, 'loft', { face: -1 }); crossbow(122, 18, 'sackFloor', { face: -1 });
  coins([119, 18], [111, 18]);
  /* THE YARD under the gantry: a drop from the loft door into the tail race's fog - a pocket (a silver, a wraith) and a ladder back up to the gantry */
  ground(126, 131, 32); ladder(126, 20, 31); ent('silver', 128, 31); wraith(130, 31, 'yard');
  /* THE GANTRY out of the sack door, and THE TAIL RACE far below it: its SWING BRIDGE (a sack gantry's beam on a pivot) stands clear of the cut; the capstan on the
     gantry swings it across (taught safe: nobody on the far side, and the race's fog well under you) */
  boards(126, 131, 19);
  pound('tail', 132, 138, 42, 33);
  bridge('tail', 132, 138, 19, 'open', [[130, 18]]);
  sign(128, 18, 'THE SWING BRIDGE: STRIKE THE CAPSTAN (OR E) TO TURN IT ACROSS.');
  bank(124, 139, 33, 0.55);
  /* THE HILL BANK: THE MILLS' EXAM - a HEDGE KNIGHT CHAMPION where the bridge lets you off, the race far below at your back */
  ground(139, 165, 20); boards(149, 153, 17); boards(141, 145, 16); boards(157, 163, 16);   /* (a hay rick, the gibbet's platform and the lock-keeper's wood store on the bank: second heights) */
  hedge(146, 19, 'millExam', { face: -1, elite: true, wKey: 'hedgechampion' });   /* (weighty - L.foeHp/foeHit 'hedgechampion', SHIELDED: src/elite-kit.js AFFIX_AT) */
  ent('check', 156, 19);   /* THE FIRST SHRINE, after the mill's exam */
  coins([143, 19], [151, 16], [161, 19]);
  decor.push({ kind: 'bollard', x: 141, y: 19 + O }, { kind: 'gibbet', x: 163, y: 19 + O });

  // ================= 3. THE LOCK FLIGHT (166-235): THE SET PIECE - three locks up the hill, three uses of the rule =================
  /* F1: moored at the TOP. The chamber is full and its lower gate shut; the punt rides high, out of reach, above the fog. Its BANK PADDLE drains it: the punt comes
     down INTO the fog to you, the gate opens; aboard, its chamber paddle fills it again and you ride up OUT (drain, then fill: the rule both ways) */
  block(166, 166, 20, BOT);
  lock('F1', 167, 172, 26, 21, 15, 'hi', { gate: [166, 14, 19] });
  punt('F1', 167, 6); paddle(165, 19, 'F1'); paddle(172, 20, 'F1');
  bank(158, 172, 21, 0.6); lamp(161, 19, true);
  ground(173, 174, 15);
  /* F2: DRY, and a pair of bargemen on its bed with the punt - in the fog (its bank lies over the dry bed). Drop in and fight them half-blind - or FILL it from
     the landing and the water takes them (then drain it for the punt). The bed paddle lifts you either way */
  lock('F2', 175, 178, 21, 21, 10, 'lo', { gate: [174, 10, 14] });
  punt('F2', 175, 4); paddle(173, 14, 'F2'); paddle(178, 20, 'F2');
  bargeman(176, 20, 'dryChamber', { face: -1 }); bargeman(178, 20, 'dryChamber', { face: -1 });
  bank(175, 178, 21, 0.62);
  /* F2's TOP LANDING: a 4-column duel floor in F3's fog where the punt lets you off; a river rat on it */
  ground(179, 182, 10); riverrat(180, 9, 'f2Landing', { face: -1 });
  /* F3: in the fog, a wraith in it - and a WATCHMAN on the top gate's beam over it: in F3's fog he sees you only lit; ride it up OUT of the fog and he sees you
     whatever your lantern says (the clear air's price) */
  lock('F3', 183, 188, 16, 11, 5, 'lo', { gate: [182, 5, 9] });
  punt('F3', 183, 6); paddle(188, 10, 'F3'); paddle(181, 9, 'F3');
  bank(179, 188, 11, 0.65); wraith(186, 10, 'f3Fog');
  boards(189, 194, 1); watchman(194, 0, 'f3Beam', { face: -1 }); ent('silver', 190, 0);   /* (the top gate's beam: a silver behind the watchman) */
  boards(205, 214, 1);   /* (the flight's footbridge over the top pound's bank: a second height) */
  ground(189, 235, 5);
  lamp(197, 4, false);
  decor.push({ kind: 'fogKnight', x: 199, y: 4 + O, flight: true });   /* (B8: once a flight, the fog's edge by the top lamp holds a knight's shape - gone as you come to it) */
  /* THE FLIGHT'S EXAM: THE BARGEMAN CHAMPION on the top deck, room to step off the punt before he comes - a heavy blow and you go back down into F3's fog */
  bargeman(203, 4, 'flightExam', { face: -1, elite: true, wKey: 'bargechampion' });
  /* THE LOCK-KEEPER'S TOWER: the landmark (its lamp burns on its roof over the whole flight and the aqueduct). A ladder up its middle, a floor at each storey, a
     silver at the top - and the view of the aqueduct and the knight's lock beyond */
  block(219, 219, -7, 2); block(226, 226, -7, 2); block(218, 227, -8, -8);   /* its walls (the door: rows 3-4) and its roof */
  boards(220, 221, -2); boards(224, 225, -2);
  ladder(222, -7, 4); ladder(223, -7, 4);
  interiors.push([220, 225, -7 + O, 4 + O, 'tpTower']);
  ent('silver', 224, -3); lamp(222, -9, true);
  coins([192, 4], [210, 0], [221, -3], [220, -6]);
  decor.push({ kind: 'bollard', x: 207, y: 4 + O }, { kind: 'milestone', x: 230, y: 4 + O });

  // ================= 4. THE AQUEDUCT (236-321): THE SET PIECE - the sluice floats the barge over the broken span; THE BROKEN ARCHES =================
  /* the iron trough over the gorge: dry (its sluice shut) and broken (252-273: the towpath and its arches are down, the iron channel sagged - only floating
     crosses it). The BARGE lies moored on the west bed. OPEN THE SLUICE: the water runs, the barge floats, and the current carries it across to the east bed
     in the clear air - the watchman at the east span's end sees you all the way. The east sluice sends it back. The gorge's river is far below, in its own fog */
  block(236, 240, 6, 8); block(241, 251, 7, 8); block(240, 242, 9, BOT); block(247, 249, 9, BOT);   /* the west span: its walkway (6), the trough's channel a row under it (7), two piers into the river */
  block(274, 289, 6, 8); block(279, 281, 9, BOT); block(286, 288, 9, BOT);   /* the east span */
  pound('river', 236, 304, 48, 42);   /* THE RIVER in the gorge: a fall is the water's (A10: it bites and hands you back to the last dry footing) */
  for (const [a, b] of [[240, 242], [247, 249], [279, 281], [286, 288]]) block(a, b, 36, BOT);   /* (the piers stand through the river) */
  trough('aq', 241, 274, 7, 4, 8, [[240, 5], [282, 5]]);
  sign(237, 5, 'THE AQUEDUCT IS DRY. OPEN ITS SLUICE: THE WATER FLOATS THE BARGE ACROSS THE BREAK.');
  boards(236, 240, 3); boards(283, 289, 3);   /* (the sluice gantries at each end of the trough: second heights, clear of the barge's line) */
  watchman(287, 5, 'aqEast', { face: -1 });   /* a watchman at the east span's end, over the break: the aqueduct is all clear air - he sees the barge all the way */
  bank(236, 304, 42, 0.6);
  coins([256, 2], [262, 2], [268, 2]);   /* (over the break: the barge's line) */
  /* THE BROKEN ARCHES (the platforming section, A14, and its exam): pier to pier down off the east span into the basin - the last piers stand in the basin's
     water, IN its fog, and only your lantern's clearing shows the next one (dim, you jump blind); a wraith waits among them. A slip is the water's (it bites
     and hands you back) */
  pound('basinW', 305, 321, 30, 21);   /* (the lower arches stand in the basin's west water) */
  for (const [a, top] of [[292, 8], [297, 11], [302, 14], [307, 17], [312, 19], [317, 19]]) block(a, a + 2, top, BOT);
  sign(290, 5, 'THE ARCHES ARE DOWN. PIER TO PIER INTO THE FOG: YOUR LANTERN SHOWS THE NEXT.');
  wraith(315, 18, 'arches');
  ent('silver', 298, 10);

  // ================= 5. THE BASIN (322-390): REMIX - the bridge strands the squad; the sunken barges; THE BASIN CRANE =================
  /* THE WEST QUAY (in the basin's thick fog) and the second shrine; THE BASIN (330-342) under its SWING BRIDGE, a capstan on each quay. A squad of river rats
     dozes in the fog on the east quay: lit, they wake and come across - swing the deck clear under them and the basin takes them; dim, you have the first blow */
  ground(322, 329, 20);
  ent('check', 325, 19);   /* THE SECOND SHRINE, at the foot of the arches (after the platforming exam; checkpoint-gaps: 148 walked tiles after the first) */
  pound('basin', 330, 342, 29, 21);
  bridge('basin', 330, 342, 20, 'across', [[328, 19], [344, 19]]);
  ground(343, 349, 20);
  riverrat(347, 19, 'basinSquad', { face: -1, elite: true, wKey: 'ratchampion', tp: { bargee: true, tpDoze: true } }); watchman(349, 19, 'basinSquad', { face: -1 });
  lamp(345, 19, true); boards(345, 348, 16);   /* (a net-drying rack on the quay) */
  /* THE SUNKEN BARGES: the east basin (350-362), three hulls just under the surface - their decks a row over it - and their masts (poles to climb: a silver at
     the top of the tall one). Hull to hull in the fog; a wraith over the water */
  pound('sunk', 350, 361, 29, 21);
  boards(352, 354, 20); boards(357, 359, 20);
  ladder(353, 12, 19); ladder(358, 9, 19); ent('silver', 358, 8);
  wraith(356, 19, 'sunk');
  /* THE CRANE QUAY and THE BASIN CRANE: the warehouses' wall (372) is seventeen rows of brick; the crane's capstan swings its jib, and the HOOK - stood on - rides
     out of the fog up to the roof's edge (and back) */
  ground(362, 371, 20);
  crane('jib', [365, 21], [370, 3], 2, [[364, 19], [373, 2]], [368, -3]);
  sign(362, 19, 'THE BASIN CRANE: STAND ON ITS HOOK AND STRIKE ITS CAPSTAN.');
  bank(305, 371, 21, 0.72);
  /* THE WAREHOUSE ROOFS, above the fog: a bargeman dozing, a watchman who sees you whatever your light says; the alley between them is a pocket */
  block(372, 379, 3, BOT); interiors.push([373, 378, 4 + O, 19 + O, 'tpWarehouse']);
  block(383, 390, 3, BOT); interiors.push([384, 389, 4 + O, 19 + O, 'tpWarehouse']);
  block(380, 382, 13, BOT); ladder(380, 4, 12); ent('silver', 381, 12);
  bargeman(376, 2, 'roofs', { face: -1, tp: { bargee: true, tpDoze: true } });
  watchman(388, 2, 'roofs', { face: -1 });
  coins([374, 2], [381, 2], [386, 2]);
  decor.push({ kind: 'mast', x: 353, y: 19 + O }, { kind: 'mast', x: 358, y: 19 + O });

  // ================= 6. THE LAST LOCK (391-441): THE EXAM - drain X and cross its floor of irons in the fog; the culvert; Y up out of it; the last cut =================
  /* down the warehouse's east face (a ladder) to X's bank. X: full to the brim. Its BANK PADDLE drains it - and the drained chamber's FLOOR lies deep in its fog,
     among THE OLD GATE IRONS: a fall onto them is the end (the exam: told as you walk in), and only your lantern's light shows them. A wraith in the fog reaches
     for that light. Off the floor into THE CULVERT under the east wall, under a watchman on the rim */
  const XL = 394;   /* X's first column (the first greybox's 268: the section is that one, eight columns on) */
  ladder(XL - 3, 4, 16);
  ground(XL - 3, XL - 1, 17);
  lock('X', XL, XL + 11, 27, 27, 18, 'hi');
  for (const x of [XL + 3, XL + 4, XL + 7, XL + 8]) set(x, 26, T.SPIKE);
  boards(XL + 1, XL + 2, 22);   /* (a ledge off the bank, a drop to the floor between the irons) */
  paddle(XL - 2, 16, 'X', { dark: true });   /* (in the fog under an UNLIT lamp - the paddle is found only in a light: the lantern lit, or the lamp struck) */
  sign(XL, 16, 'THE LAST LOCK. DRAINED, ITS FLOOR IS THE OLD GATE IRONS - AND THE FOG HIDES THEM.');
  block(XL + 12, XL + 16, 14, 22); air(XL + 12, XL + 16, 23, 25); block(XL + 12, XL + 16, 26, 26);   /* the east wall over THE CULVERT (rows 23-25) into Y */
  interiors.push([XL + 12, XL + 16, 23 + O, 25 + O, 'tpCulvert']);
  watchman(XL + 14, 13, 'xRim', { face: -1 });
  bank(XL, XL + 11, 27, 0.86); wraith(XL + 5, 25, 'xFloor');
  /* Y: dry, its punt on the bed, in its fog. Its bed paddle REFILLS it: the punt rides up thirteen rows OUT of the fog to the upper bank - where a bargeman waits
     to hook you off it */
  lock('Y', XL + 17, XL + 24, 27, 27, 14, 'lo');
  punt('Y', XL + 17, 8); paddle(XL + 23, 26, 'Y'); paddle(XL + 15, 25, 'Y');   /* (and one on the culvert's floor: a punt that rode up without you comes back down) */
  bank(XL + 12, XL + 24, 27, 0.8);
  block(XL + 25, XL + 28, 14, BOT);
  bargeman(XL + 27, 13, 'yTop', { face: -1 });
  /* THE LAST CUT: its bridge stands clear; the capstan on this bank swings it across - to THE DECK FOREMAN (the exam's elite) and a watchman, in the cut's fog */
  pound('cut', XL + 29, XL + 33, 22, 15);
  bridge('cut', XL + 29, XL + 33, 14, 'open', [[XL + 28, 13]]);
  ground(XL + 34, XL + 47, 14);
  bargeman(XL + 38, 13, 'foreman', { face: -1, elite: true, cnSkin: 'deckforeman', gate: XL + 43 }); watchman(XL + 41, 13, 'foreman', { face: -1 });   /* (THE LAST GATE: the foreman holds it until he is down: tools/elites.mjs) */
  bank(XL + 25, XL + 47, 15, 0.7);
  lamp(XL - 1, 16, false); lamp(XL + 35, 13, true);
  decor.push({ kind: 'fogKnight', x: XL + 41, y: 13 + O });   /* (B8: an armour's shape pooled in the fog across the last cut - gone when you step to it; the lamp by it gutters as you pass) */
  ent('check', XL + 45, 13);   /* THE SHRINE AFTER THE EXAM, and before him */
  coins([XL + 2, 21], [XL + 10, 26], [XL + 36, 13]);

  // ================= 7. THE TOWPATH'S END (442-493): THE FOG KNIGHT =================
  const AX = XL + 48, AR = 14;
  const stage = stageFogKnight({ set, block, ent, air, boards }, T, TS, AX, AR, O);
  stage.carve();
  pools.push(...stage.pools.map(p => ({ ...p, idx: undefined })));
  for (const k of stage.locks) { const pi = pools.findIndex(p => p.tp === k.id); locks.push({ ...k, bed: k.bed + O, lo: k.lo + O, hi: k.hi + O, gate: k.gate ? { x: k.gate.x, top: k.gate.top + O, bot: k.gate.bot + O } : null, pool: pi }); }
  bridges.push(...stage.bridges.map(b => ({ ...b, row: b.row + O }))); lamps.push(...stage.lamps.map(l => ({ ...l, y: l.y + O })));
  for (const m of stage.movers) { moversExtra.push(m.mover); rigBands.push(m.band); }
  block(AX + FK_STAGE.W, W - 1, 0, BOT);
  /* THE EXIT (claude/towpathchurch, Daniel 10-16: "you cannot leave the boss room"): the gate stood at W-2, row AR-1 - INSIDE the upper quay's solid block (hi = AR-6 up to the
     wall): buried, no hero could ever reach it. It stands on the FLOOR now, east of the cut and its bridge, before the arena lock's gate (FK_STAGE.exit): every hero walks to it once he falls (gateAfterBoss) */
  ent('gate', AX + FK_STAGE.exit, AR - 1);

  // ================= THE LADDERS, LAST =================
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);

  const START = { x: 2, y: 33 + O };
  const arena = stage.arena;
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools, falls: [], moversExtra, rigBands, interiors, arena, gateAfterBoss: true,
    towpath: { O, FOG_H, locks, bridges, wheels, banks, lamps, decor, hoists, troughs, cranes, arcs: ARCS, sections: SECTIONS, lantern: { x: 41, y: 37 + O } },
    waterHurts: true, noWade: true,   /* the locks', the cuts' and the river's deep water bites (A10: ~27% and back to the bank) and is no floor to the reach model - the punts, the barge, the hook and the hoist (rigBands) are */
    examSpans: [[394, 427]],          /* THE LAST LOCK: the old gate irons kill (told as you walk in: src/survival.js examAt) */
    calm: [[0, W - 1, 0, H - 1]],     /* placed wholly by hand: nothing sprinkled */
    /* THE CANAL MEN'S WEIGHT (difficulty v2: fewer, weightier foes): a bargeman's hook and a watchman's bolt hit like the act's, and they stand a blow or two longer (main.js reads L.foeHit / L.foeHp by cnSkin) */
    foeHit: { bargeman: 1.6, riverrat: 1.6, watchman: 1.3, deckforeman: 1.7, hedgechampion: 0.8, bargechampion: 1.7, ratchampion: 1.7 },
    foeHp: { bargeman: 1.8, riverrat: 1.6, watchman: 1.4, deckforeman: 2.4, hedgechampion: 2.0, bargechampion: 2.2, ratchampion: 2.2 },
    checkRun: 200,
    squadBands: [{ lo: AX, hi: W - 1, spots: 0, why: "THE FOG KNIGHT's towpath: no squad stands in a boss arena" }],
    unlocks: [
      { kind: 'tppaddle', opens: 'the chamber filling or draining: the punt up out of the fog or down into it, the lower gate, the wheel stilled', hud: 'THE PADDLE IS UP: THE CHAMBER FILLS. THE PUNT RIDES THE WATER UP.' },
      { kind: 'tpcapstan', opens: 'the swing bridge across the cut (or clear of it, and whoever stands on it)', hud: 'THE CAPSTAN TURNS: THE BRIDGE SWINGS ACROSS THE CUT.' },
      { kind: 'tplantern', opens: 'the lantern: lit, the fog shows its edges (and you), and a fog wraith in its light is solid; dim, the watchmen cannot see you', hud: 'THE LOCK-KEEPER\'S LANTERN: E LIGHTS IT, OR DIMS IT.' },
      { kind: 'tplamp', opens: 'a lamp on the towpath: lit, it burns the fog off round it (and hardens a wraith in it)', hud: 'A LAMP ON THE TOWPATH: STRUCK, IT LIGHTS - OR GOES OUT.' },
      { kind: 'tpwinch', opens: 'the mill\'s sack hoist: up to the sack floor, or down to the loft', hud: 'THE WINCH TURNS: THE HOIST RIDES TO THE OTHER FLOOR.' },
      { kind: 'tpsluice', opens: 'the aqueduct\'s sluice: the trough runs and floats the barge over the broken span', hud: 'THE SLUICE OPENS: THE TROUGH RUNS AND THE BARGE FLOATS.' },
      { kind: 'tpcrane', opens: 'the basin crane: its jib swings the hook up out of the fog to the warehouse roofs', hud: 'THE CRANE SWINGS: THE HOOK RIDES UP OUT OF THE FOG.' } ],
    bgSpan: 200,   /* (claude/towpath2art: the backdrop rides within 200 px whatever storey the camera is on, as the canal's) */
    music: 'towpath', night: true, nightA: 0.22, duskStart: 99999, duskLen: 1,   /* (claude/towpath2art) THE RIVER ROAD BY NIGHT: cold blue-green, moonlit */
    palette: { set: 'village', dress: 'village', ledges: 'staging', sky: 'night', far: 'town', mid: 'town', near: 'town', nearSet: 'town', noFg: true, noNear: true,
      haze: 'rgba(110,150,150,0.14)', murkCol: '#0e161a',
      grass: '#3e5a40', grassL: '#5a7a58', grassD: '#26382a', dirt: '#4a4a44', dirtL: '#5e5e56', dirtD: '#2e2e2a',
      canopy: ['#16201e', '#1e2c28', '#2a3c36', '#365046'] },
    weather: [], ambient: [{ x0: 0, x1: 47 * TS, kind: 'town' }, { x0: 47 * TS, x1: 99999, kind: 'towpath' }],
  };
}
