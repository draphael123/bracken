// src/kings-pyramid.js - THE KING'S PYRAMID, desert act V level 11, THE ACT EXAM (claude/kingspyramid, 11-06, the OPUS GREYBOX: geometry, the five rooms, the descent,
// the cast and the arena; code-only, NOT on the live road). Sources: scratch/plan-desert-1105.md s1.11 / s2 / s3 / s4 (Daniel approved 11-05 14:07),
// scratch/brief-kingspyramid.md (the !! 10-13 DANIEL RESTRUCTURE supersedes its older section list), lane-reports colossus4 (beam-path), desertkit (sun-puzzle).
// The draft it replaces is src/draft/kings-pyramid.js (the old mirror-room climb; the 10-11 split gave the MOVING sun to the Sun Temple).
//
// THE FLAG: KP_SHIPS = false. Off, src/level.js does not even append the row, so LEVELS is master's array exactly (no index, no save, no tool moves).
// On (?kp=1 on the page, globalThis.BRACKEN_KP, or KP=1 in a Node tool's env) the row is appended HIDDEN (no map node): play it with ?kp=1&level=kingspyramid.
// The road insert (needs 'sealedpyramid', append-only, through the one road-insert migration test) is the road lane's, at the art merge (art before live).
//
// THE RULE: THE PYRAMID IS BLACK. FIVE SEALS SHUT THE KING'S DOOR - EACH ROOM KEEPS ONE KEY, AND EACH ROOM IS A LESSON THE DESERT TAUGHT YOU.
// FOUR PARTS (columns; floors are the solid surface rows - a hero stands on the row above):
//   0-39     THE SUNLESS DOOR   intro: the pyramid's foot, the door, the black corridor; a SUN SHAFT and the first GILDED GUARD under it (the light strips his shield)
//   40-111   THE HALL OF DOORS  the hub: shrine (CHECKPOINT ONE), THE GREAT DOOR (five keyholes), a sun shaft, and five KEY ROOMS in ANY ORDER, each self-contained:
//              MIRRORS (up, west)   FIXED mirrors you STRIKE to carry the sun (src/sun-puzzle.js L.sunRooms, drawn with src/beam-path.js) to the key door's eye;
//                                   + the optional DESERT PRIEST CACHE (only his beam breaks its seal: a silver - plan Q5)
//              FIRE (up, east)      take a firebrand at the cresset; THROW it (the told arc, src/carry-throw.js) to burn linen walls and the linen dead
//              BOMBS (down, east)   carry a powder keg (E), throw it lit (ATTACK) or set it down and strike it: blow the cracked wall, drop the hung ledge into a step
//              SWITCHES (down, west) strike the counterweight's rope (the weight falls, the gate lifts), JAM the sliding presses, lift the key gate
//              THE DEATHLESS (top)  three dead no blow can kill: LURE them into the tomb's own traps - the press, the spike floor, the sun shutter
//   112-140  THE DESCENT        the five keys open the great door; RIDE THE LIFT down the shaft: debris falls TOLD (a ring + dust, then the stone), boarders only at the
//                                ends (alcoves at the top and the foot; they hop on, told). The A14 platforming exam. CHECKPOINT TWO (the shrine before him) at its foot.
//   141-196  THE KING OF FIVE SEALS  the arena under the capstone (src/five-seals-king.js): four phases, each opened by a room's verb.
// CHECKPOINTS: two (Daniel's fewer-checkpoints direction): the hub's shrine and the shrine before the King. Every room is short and starts from the hub.
// CAST (act V counters, one new foe): THE GILDED GUARD (NEW, src/gilded-guard.js: the shield machine in gold - THE LIGHT STRIPS HIS SHIELD), the tomb dead
// (mummy / tomb skeleton, src/mummy.js), the gilded archer (the archer machine, the dart-blower skin until the art lane's gilded archer), the DEATHLESS (mummies
// under a seal: src/kp-rooms.js). No goblins, no wood: black stone + gold, sun-shaft white (plan s4; art owed - greybox now).
import { KS_ARENA } from './five-seals-king.js';

export const KP_SHIPS = false;
export function kpOn() {
  if (KP_SHIPS) return true;
  try { if (globalThis.BRACKEN_KP === true || globalThis.BRACKEN_KP === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]kp=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.KP === '1') return true; } catch { /* no node */ }
  return false;
}
export const KP_RULE = 'THE PYRAMID IS BLACK. FIVE SEALS SHUT THE KING\'S DOOR: EACH ROOM KEEPS ONE KEY, AND EACH ROOM IS A LESSON THE DESERT TAUGHT YOU.';
/* THE ROWS / COLUMNS (tiles) */
export const KP = { W: 202, H: 92, hub: 44, up: 32, low: 58, top: 20, shaftX: [116, 121], shaftTop: 44, shaftFoot: 84, arenaX: 141, arenaF: 84 };
export const SECTIONS = [['THE SUNLESS DOOR', 0], ['THE HALL OF DOORS', 40], ['THE DESCENT', 112], ['THE KING OF FIVE SEALS', 141]];
/* each room's box (tiles, inclusive) and the verb it teaches; the King's phases read the same verbs (src/five-seals-king.js) */
export const ROOMS = {
  mirrors: { box: [2, 18, 38, 31], verb: 'mirror', name: 'THE ROOM OF MIRRORS', door: [39, 41, 29, 31] },
  fire: { box: [113, 22, 147, 31], verb: 'fire', name: 'THE ROOM OF FIRE', door: [111, 112, 29, 31] },
  bombs: { box: [78, 47, 111, 57], verb: 'keg', name: 'THE ROOM OF KEGS', door: [100, 101, 44, 46] },
  switches: { box: [40, 47, 76, 57], verb: 'press', name: 'THE ROOM OF SWITCHES', door: [44, 45, 44, 46] },
  deathless: { box: [50, 9, 100, 19], verb: 'trap', name: 'THE ROOM OF THE DEATHLESS', door: [74, 76, 20, 21] },
};
export const KEY_ORDER = ['mirrors', 'fire', 'bombs', 'switches', 'deathless'];
/* THE ARCS (tile columns) - each verb TAUGHT in its room, EXAMINED by the King (tools/kings-pyramid.mjs reads them) */
export const ARCS = {
  light: { teach: [24, 34], test: [2, 38], remix: [100, 108], boss: [141, 196] },   /* the guard under the door's shaft; the mirror room; the hub's shaft; P1 */
  fire: { teach: [113, 124], test: [124, 147], boss: [141, 196] },
  keg: { teach: [96, 111], test: [78, 96], boss: [141, 196] },
  press: { teach: [46, 60], test: [60, 76], boss: [141, 196] },
  trap: { teach: [50, 66], test: [66, 100], boss: [141, 196] },
  ride: { exam: [112, 140] },
};

export function buildKingsPyramid({ painter, T, TS }) {
  const { W, H } = KP, HF = KP.hub, UP = KP.up, LO = KP.low, TP = KP.top;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const ledge = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const rope = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, T.NET); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  /* THE CAST (proven machines under skins; the guard is the one new foe; kp tags are read by src/kp-hands.js) */
  const gilded = (x, y, o) => foe('shield', x, y, Object.assign({ kp: 'gilded', cnSkin: 'shieldguard' }, o || {}));   /* (the plated man's skin until the art lane's GILDED GUARD: the bare shield machine is drawn a goblin) */
  const dead = (x, y, x0, x1, o) => foe('mummy', x, y, Object.assign({ guard: [x0, x1] }, o || {}));
  const skel = (x, y, x0, x1, o) => dead(x, y, x0, x1, Object.assign({ cnSkin: 'tombskel' }, o || {}));
  const archer = (x, y, o) => foe('archer', x, y, Object.assign({ cnSkin: 'dartblower', kp: 'archer' }, o || {}));
  const deathless = (x, y, x0, x1, id) => dead(x, y, x0, x1, { kp: 'deathless', kpId: id });
  const decor = [], interiors = [], shafts = [];
  /* a SUN SHAFT: a hole up through the black stone to the sky, the light straight down its column (src/kp-hands.js lights it; the guard under it is stripped) */
  const shaft = (id, x, y0, y1) => { shafts.push({ id, x, y0, y1 }); decor.push({ kind: 'sunport', x, y: y0 - 1 }); };   /* (data + a drawn sun-glass port in the roof: no hole is cut, the rooms above stay whole) */

  block(0, W - 1, 0, H - 1);   /* THE PYRAMID IS STONE: every room is cut out of it */

  // ================= 1. THE SUNLESS DOOR (0-39): the foot, the door, the black corridor, the first guard under a shaft =================
  air(0, 10, 34, HF - 1);                                          /* the pyramid's foot (the vestibule under the face: the face is drawn, greybox) */
  sign(3, HF - 1, 'THE KING\'S PYRAMID. THE PYRAMID IS BLACK: FIVE SEALS SHUT THE KING\'S DOOR, AND EACH ROOM KEEPS ONE KEY.');
  air(11, 39, 38, HF - 1); decor.push({ kind: 'sunlessdoor', x: 11, y0: 38, y1: HF - 1 });   /* THE SUNLESS DOOR: a black lintel, the five seals cut over it */
  interiors.push([11, 39, 38, HF - 1, 'kpBlack']);
  shaft('doorShaft', 30, 38, HF - 1);                             /* the one shaft in the corridor: the guard walks through its light */
  sign(22, HF - 1, 'A GILDED GUARD: HIS GOLD SHIELD TURNS EVERY BLOW FROM THE FRONT. THE SUN STRIPS IT - CATCH HIM IN THE LIGHT.');
  gilded(34, HF - 1, { beat: [26, 38] });
  skel(16, HF - 1, 14, 20);

  // ================= 2. THE HALL OF DOORS (40-111): the hub =================
  air(40, 111, 22, HF - 1); interiors.push([40, 111, 22, HF - 1, 'kpHall']);
  ent('check', 50, HF - 1);                                        /* CHECKPOINT ONE: the hub's shrine (every room starts from here) */
  sign(54, HF - 1, 'THE HALL OF DOORS. FIVE ROOMS, FIVE KEYS, ANY ORDER. THE GREAT DOOR EAST TAKES ALL FIVE.');
  /* the WEST stair to the upper gallery (3-row jumps) and the gallery itself */
  ledge(52, 55, 41); ledge(47, 50, 38); ledge(52, 55, 35); ledge(40, 60, UP);
  /* the EAST stair and gallery */
  ledge(94, 97, 41); ledge(99, 102, 38); ledge(94, 97, 35); ledge(90, 111, UP);
  /* the MIDDLE stack up to THE DEATHLESS (through the hub's roof: one-way stone) */
  ledge(70, 73, 41); ledge(74, 77, 38); ledge(70, 73, 35); ledge(74, 77, UP); ledge(70, 73, 29); ledge(70, 73, 26); ledge(74, 77, 23);
  ledge(74, 76, 21); ledge(74, 76, TP);
  shaft('hubShaft', 104, 22, HF - 1);                             /* the hub's shaft: the second guard under it (the light remixed: he must be lured INTO it) */
  gilded(92, HF - 1, { beat: [84, 99] });
  archer(66, UP - 1);                                              /* a gilded archer on the gallery (the ranged one) */
  /* THE GREAT DOOR (110-111, rows 38..43): five keyholes; the hands open it when all five keys are carried */
  const greatDoor = { x0: 110, x1: 111, y0: 38, y1: HF - 1, holes: KEY_ORDER.slice() };
  for (let y = greatDoor.y0; y <= greatDoor.y1; y++) for (let x = greatDoor.x0; x <= greatDoor.x1; x++) set(x, y, T.PORT);   /* a barred door (T.PORT): the reach model reads it open (L.reachDoors) - the five keys are on the way */
  decor.push({ kind: 'greatdoor', ...greatDoor });
  air(112, 112, 29, UP - 1);                                       /* the doorway from the east gallery into the room of fire */

  // ================= 2a. THE ROOM OF MIRRORS (up, west): fixed mirrors, the sun's port, the key door, THE PRIEST CACHE =================
  air(4, 38, 18, UP - 1); air(39, 41, 29, UP - 1); interiors.push([4, 38, 18, UP - 1, 'kpMirrors']);
  air(2, 3, 30, 31);                                               /* the cache's alcove (the silver lies behind the sun-seal) */
  ledge(8, 12, 29); ledge(20, 26, 29); ledge(15, 19, 26); ledge(21, 26, 23);   /* footing under each mirror (struck from the ledge, sun-puzzle's reach) */
  air(10, 10, 0, 17);                                              /* the sun's port: a shaft from the apex */
  block(36, 38, 22, 27); ledge(27, 35, 22);                        /* the key niche, high in the east corner on its stone shelf (37-38, rows 18-21), shut by the sun-door (column 36); a walk of ledge to it */
  const mirrorRoom = { id: 'kpMirrors', box: [4, 18, 38, UP - 1], sources: [{ x: 10, y: 18, dir: 'S' }],
    mirrors: [{ x: 10, y: 27, state: '/' }, { x: 24, y: 27, state: '\\' }, { x: 24, y: 21, state: '\\' }],
    doors: [{ id: 'mirrorKeyDoor', kind: 'sun', eye: [34, 21], opens: [36, 18, 36, 21], mode: 'latch' },
      { id: 'priestCache', kind: 'cache', eye: [5, 29], opens: [4, 30, 4, 31], optional: true }] };
  block(36, 36, 18, 21);                                           /* the key door (the sun lifts it) */
  set(4, 30, T.SOLID); set(4, 31, T.SOLID);                        /* the priest's sun-seal */
  ent('silver', 2, 31);                                            /* THE PRIEST CACHE: a silver (plan Q5) */
  sign(7, UP - 1, 'STRIKE A MIRROR TO TURN IT. CARRY THE SUN TO THE GLYPH AND THE DOOR LIFTS.');
  gilded(18, UP - 1, { beat: [14, 30] });                          /* he walks through the wasted beam's column (24) as built: the light strips him */
  skel(30, UP - 1, 27, 34);

  // ================= 2b. THE ROOM OF FIRE (up, east): the cresset, the linen walls, the linen dead =================
  air(113, 147, 22, UP - 1); interiors.push([113, 147, 22, UP - 1, 'kpFire']);
  block(134, 147, 27, UP - 1);                                     /* the shelf: its top is row 27 */
  ledge(131, 133, 29);                                             /* the step up to it */
  const linen = [{ id: 'linen1', x0: 122, x1: 122, y0: 26, y1: UP - 1 }, { id: 'linen2', x0: 141, x1: 141, y0: 22, y1: 26 }];
  for (const l of linen) block(l.x0, l.x1, l.y0, l.y1);
  const cressets = [{ id: 'cresset1', x: 116, y: UP - 1 }];
  sign(114, UP - 1, 'A CRESSET. E TAKES A FIREBRAND; ATTACK THROWS IT (UP LOBS, DOWN TOSSES SHORT). FIRE EATS LINEN.');
  dead(127, UP - 1, 125, 130, { linen: true }); dead(129, UP - 1, 125, 130, { linen: true });   /* the linen dead (a firebrand on them burns long) */
  archer(146, 26);

  // ================= 2c. THE ROOM OF KEGS (down, east): the rack, the cracked wall, the hung ledge =================
  air(100, 101, HF, 46); rope(101, HF, LO - 1);                    /* the way down from the hub floor, and back up */
  air(78, 111, 47, LO - 1); interiors.push([78, 111, 47, LO - 1, 'kpKegs']);
  block(78, 83, 52, LO - 1);                                       /* the key's plinth: its top is row 52 (six rows over the floor) */
  const cracked = [{ id: 'kegWall', x0: 96, x1: 97, y0: 52, y1: LO - 1, kind: 'wall' }, { id: 'bracket', x0: 89, x1: 89, y0: 50, y1: 50, kind: 'bracket', drops: 'hungLedge' }];
  for (const c of cracked) block(c.x0, c.x1, c.y0, c.y1);
  const hung = [{ id: 'hungLedge', x0: 85, x1: 88, y: 50, to: 55 }];
  for (const h of hung) ledge(h.x0, h.x1, h.y);
  const racks = [{ id: 'rack1', x: 108, y: LO - 1, every: 4 }];
  sign(106, LO - 1, 'A POWDER KEG. E TAKES IT; ATTACK THROWS IT LIT. SET IT DOWN AND STRIKE IT TO LIGHT IT WHERE IT STANDS.');
  gilded(92, LO - 1, { beat: [87, 95] });                          /* behind the wall: a keg blows his gold as well as the stone */
  skel(104, LO - 1, 99, 107);

  // ================= 2d. THE ROOM OF SWITCHES (down, west): the counterweight, the presses, the key gate =================
  air(44, 45, HF, 46); rope(45, HF, LO - 1);
  air(40, 76, 47, LO - 1); interiors.push([40, 76, 47, LO - 1, 'kpSwitches']);
  const weights = [{ id: 'cw1', rope: [56, 47, 48], box: [55, 49, 57, 50], cleat: [54, LO - 2], fallTo: 56, gate: 'gate1' }];   /* the weight hangs high; its rope runs down to a CLEAT at body height: strike the cleat */
  for (const wt of weights) block(wt.box[0], wt.box[2], wt.box[1], wt.box[3]);
  const gates = [{ id: 'gate1', x0: 59, x1: 59, y0: 50, y1: LO - 1 }, { id: 'gate2', x0: 73, x1: 73, y0: 50, y1: LO - 1 }];
  for (const g of gates) block(g.x0, g.x1, g.y0, g.y1);
  ledge(64, 67, 54);                                               /* the switch shelf over the press hall */
  const presses = [{ id: 'pressW', room: 'switches', axis: 'x', home: [60, 56, 61, LO - 1], out: [60, 56, 66, LO - 1], cycle: 3.2, phase: 0 },
    { id: 'pressE', room: 'switches', axis: 'x', home: [71, 56, 72, LO - 1], out: [67, 56, 72, LO - 1], cycle: 3.2, phase: 0 }];
  const switches = [{ id: 'jam1', x: 58, y: LO - 2, jams: ['pressW', 'pressE'], jamT: 5 }, { id: 'lift2', x: 66, y: 52, opens: 'gate2' }];
  sign(47, LO - 1, 'THE TOMB IS A MACHINE: STRIKE A ROPE TO DROP ITS WEIGHT, STRIKE A SWITCH TO JAM THE PRESSES.');
  gilded(51, LO - 1, { beat: [47, 53] });

  // ================= 2e. THE ROOM OF THE DEATHLESS (top): three dead no blow kills; the press, the spike floor, the sun shutter =================
  air(50, 100, 9, TP - 1); interiors.push([50, 100, 9, TP - 1, 'kpDeathless']);
  ledge(62, 66, 16); ledge(80, 84, 16);                            /* perches to wait on while they walk into it */
  const spikeFloors = [{ id: 'spikes1', x0: 66, x1: 70, y: TP - 1, room: 'deathless', upT: 3 }];
  presses.push({ id: 'pressD', room: 'deathless', axis: 'x', home: [51, 18, 52, TP - 1], out: [51, 18, 58, TP - 1], cycle: 0, manual: true });
  air(90, 90, 0, 8); const shutters = [{ id: 'shutter1', x: 90, y0: 9, y1: TP - 1, openT: 4 }];
  switches.push({ id: 'dPress', x: 62, y: 15, fires: 'pressD' }, { id: 'dSpikes', x: 66, y: 15, raises: 'spikes1' }, { id: 'dShutter', x: 84, y: 15, opens: 'shutter1' });   /* each on a perch: wait there while they walk into it */
  gates.push({ id: 'gate3', x0: 97, x1: 97, y0: 14, y1: TP - 1 }); block(97, 97, 14, TP - 1);
  sign(78, TP - 1, 'THE DEATHLESS: NO BLOW CAN KILL THEM. ONLY THE TOMB CAN - LURE THEM INTO THE PRESS, THE SPIKES, THE SUN.');
  deathless(56, TP - 1, 53, 64, 'd1'); deathless(70, TP - 1, 64, 78, 'd2'); deathless(88, TP - 1, 82, 95, 'd3');

  /* THE KEYS: one per room, each behind its room's own exam (the hands draw it and count it; carried across a death) */
  const keys = [{ id: 'mirrors', x: 37, y: 21 }, { id: 'fire', x: 145, y: 26 }, { id: 'bombs', x: 80, y: 51 }, { id: 'switches', x: 75, y: LO - 1 }, { id: 'deathless', x: 99, y: TP - 1 }];

  // ================= 3. THE DESCENT (112-140): the great door's passage, the shaft, the lift, the foot =================
  air(112, 121, 38, HF - 1);                                       /* the passage past the great door, over the shaft's head */
  const [SX0, SX1] = KP.shaftX, SF = KP.shaftFoot;
  air(SX0, SX1, HF, SF - 1); interiors.push([SX0, SX1, 38, SF - 1, 'kpShaft']);
  /* the alcoves the boarders wait in (the ends only): two at the head, two at the foot */
  air(122, 124, 47, 49); air(113, 115, 49, 51); air(122, 124, 70, 72); air(113, 115, 72, 74);
  const alcoves = [{ id: 'aTop1', x: 123, y: 49, side: 1 }, { id: 'aTop2', x: 114, y: 51, side: -1 }, { id: 'aFoot1', x: 123, y: 72, side: 1 }, { id: 'aFoot2', x: 114, y: 74, side: -1 }];
  skel(123, 49, 122, 124, { kpBoard: 'aTop1' }); skel(114, 51, 113, 115, { kpBoard: 'aTop2' }); dead(123, 72, 122, 124, { kpBoard: 'aFoot1' }); skel(114, 74, 113, 115, { kpBoard: 'aFoot2' });
  const lift = { kind: 'lift', kpLift: true, x: SX0 * TS + 8, y: HF * TS, y0: HF * TS, y1: SF * TS - 8, top: HF * TS, bot: SF * TS - 8, w: 64, h: 8, speed: 40 };
  sign(112, HF - 1, 'THE KING\'S SHAFT. STAND ON THE LIFT TO RIDE IT DOWN. THE STONE FALLS WHERE THE DUST RINGS: STEP OUT OF IT.');
  /* the foot: the corridor to the King, the shrine */
  air(122, 140, 79, SF - 1); interiors.push([122, 140, 79, SF - 1, 'kpFoot']);
  ent('check', 130, SF - 1);                                       /* CHECKPOINT TWO: the shrine before him (heal + bank: plan s2) */
  sign(134, SF - 1, 'THE KING OF FIVE SEALS. EACH SEAL ON HIS TOMB IS A ROOM YOU OPENED: WHAT OPENED THE ROOM OPENS HIM.');

  // ================= 4. THE KING OF FIVE SEALS (141-196): the arena (src/five-seals-king.js KS_ARENA) =================
  const AX = KP.arenaX, AF = KP.arenaF, A = KS_ARENA;
  air(AX, AX + A.W - 1, AF - A.roof, AF - 1); interiors.push([AX, AX + A.W - 1, AF - A.roof, AF - 1, 'kpArena']);
  air(AX + A.capstone, AX + A.capstone, 0, AF - A.roof - 1);      /* the capstone's shaft (the sun when it is open) */
  for (const [x0, x1] of A.ledges) ledge(AX + x0, AX + x1, AF - A.ledgeDy);
  ent('kingseals', AX + A.start, AF - 1, { face: -1 });
  air(AX + A.W, W - 2, 79, AF - 1); ent('gate', AX + A.W + 1, AF - 1);   /* THE LEVEL'S GATE: it opens once the King is down (gateAfterBoss) */
  const arena = { x0: AX * TS, x1: (AX + A.W) * TS, floor: AF * TS, trigger: (AX + 4) * TS, wallL: AX - 1, wallR: AX + A.W, boss: 'kingseals', music: 'tombking',   /* (placeholder: the Coffin King's track until the art lane's own - REPORT-ONLY music) */
    tint: '#e8c24a', tintA: 0.07, start: [AX + 4, AF - 1], y0: (AF - A.roof) * TS, y1: (AF + 1) * TS, ks: { x0: AX, floor: AF } };

  /* DATA MARKERS for the level tools (tools/level-quality.mjs counts gadgets and unlocks from ents): main.js spawns nothing for an unknown kind, and src/kp-hands.js reads L.kp, not these */
  for (const s of switches) ent('kpswitch', s.x, s.y, { id: s.id });
  for (const w of weights) ent('kpweight', w.cleat[0], w.cleat[1], { id: w.id });
  for (const k of keys) ent('kpkey', k.x, k.y, { id: k.id });
  ent('kpkeylock', greatDoor.x0, greatDoor.y1, { holes: 5 });
  ent('kpglyph', 34, 21, { id: 'mirrorKeyDoor' });
  ent('silver', 82, 15);                                           /* a second silver: on the deathless room's east perch (off the route) */

  const START = { x: 3, y: HF - 1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [lift], interiors,
    arena, gateAfterBoss: true, kingspyramid: true,
    rigBands: [[SX0, SX0 + 3, HF, SF - 1]], reachDoors: [{ x0: greatDoor.x0, x1: greatDoor.x1, y0: greatDoor.y0, y1: greatDoor.y1 }],   /* THE LIFT is a ride between its two stops for the reach model (src/reachcore.js: board it at either, leave it at either) */
    /* THE KIT (src/kp-rooms.js + src/kp-hands.js): every room's pieces as data */
    kp: { rooms: ROOMS, keys, greatDoor, shafts, linen, cressets, cracked, hung, racks, weights, gates, presses, switches, spikeFloors, shutters, alcoves, keyOrder: KEY_ORDER },
    sunRooms: [mirrorRoom],   /* THE MIRRORS (src/sun-puzzle.js, wired by src/sunroom-hands.js since claude/colossus4; drawn with src/beam-path.js) */
    decor, shade: [[0, W * TS, 0, H * TS + 1]],   /* inside the pyramid there is no sun but the shafts' (no sunstroke here: one shade box over everything) */
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])), arcs: ARCS,
    squadBands: [{ lo: AX, hi: AX + A.W, spots: 0, why: 'THE KING OF FIVE SEALS: the arena - no squad stands in a boss arena' }],
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 260,   /* two checkpoints (Daniel: fewer): the hub's shrine (every room starts there) and the shrine before the King */
    unlocks: [
      { kind: 'kpkey', opens: 'THE GREAT DOOR once all five room keys are carried (the descent beyond it)', hud: 'KEYS n/5' },
      { kind: 'silver', opens: 'THE PRIEST CACHE in the room of mirrors: only THE DESERT PRIEST\'s beam breaks its sun-seal', hud: 'THE PRIEST\'S LIGHT BREAKS THE SUN-SEAL' },
    ],
    music: 'sealedpyramid',   /* placeholder: the tomb's bed until the art lane's own track (REPORT-ONLY music) */
    ambient: [{ x0: 0, x1: 99999, kind: 'sealedpyramid' }],
    rockZones: [], masonry: [[0, W - 1, 0, H - 1]], masonryKit: 'limestone', ledgeKit: 'desert',   /* greybox: the tomb's limestone kit until the art lane's BLACK STONE + GOLD (plan s4) */
    palette: { set: 'desert', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(20,16,10,0.25)' },
    noSkyRays: true, duskStart: -1, duskLen: 1,
  };
}
