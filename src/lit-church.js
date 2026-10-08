// src/lit-church.js - THE LIT CHURCH, the optional church on the hill road out of WAYMEET (claude/litchurch, the OPUS GREYBOX, 2026-10-08: geometry, the
// light rule, the organ, the crypt, the encounters, the wiring; greybox art only - no art pass until the review). Concept: .claude/briefs/the-lit-church-
// concept.md (Daniel 10-01) + the 10-07 settled lines (HANDOFF 12:30 / 12:55 / 13:00): cruciform; the organ gallery's bellows and chord gust KEPT; THE
// ARCHDEACON elite KEPT; the reliquary pays a SILVER and opens a shortcut (no relic); THE PALADIN a B11 duelist with a light bar (src/paladin-boss.js).
// THE ROAD: an OPTIONAL SPLIT PATH. Its fork is meant to stand at the start of THE TOWPATH (claude/towpath, built in parallel): a hill path to the church,
// the river path to the canal. Until the integrator joins the two, `needs: 'waymeet'` (the LEVELS row). FORK HOOK: export FORK below says where it goes.
//
// THE RULE: LIGHT IS THE CLERGY'S: A LIT ROOM MAKES THE PRIESTS STRONG, A DARK ONE LETS THE DEAD UP. CARRY A FLAME TO LIGHT A LAMP; A BLOW SNUFFS IT.
// Every ROOM is LIT (a lamp in it burns) or DARK (all out). LIT: a priest's bolt lands x1.3 and his heal x1.5, and the dead in the room burn and sink.
// DARK: the priests are weak (x0.7, heal x0.5) - and the crypt's dead come up through the room's GRATES. THE FLAME: E at anything that burns (a brazier, a
// votive stand, a lit lamp) puts a taper in your hand; it burns FLAME.life s (drawn: it shrinks) and a blow that lands on you puts it out. E at a dark lamp
// with it lights the lamp. A blade through a lit lamp SNUFFS it. A priest walks to a snuffed lamp in his room and RE-LIGHTS it (a told rite: a blow cuts it);
// an ACOLYTE runs for it, quicker, and cannot fight. src/lit-church-hands.js is the rule's code; tools/lit-church.mjs holds this line equal to LEVELS'.
// THE ORGAN (the second verb): STRIKE A BELLOWS and its pipe breathes - a column of air lifts you up it for a few seconds (drawn: dust and a gauge). E at the
// ORGAN'S KEY DESK holds a CHORD: a told gust (the pipes wheeze, flags of dust) blows along the gallery - jump into it and it carries you over the broken loft.
// THE CRYPT (the third): the dark the church keeps down. It is sealed by the LIGHT of the seal lamp in the west tower - snuff it and the hatch opens (the
// dead get up into the tower). THE DARK RISES: lighting LAMP THREE on the crypt altar cracks the crossing's crypt grate (the only way up) - and the dark
// comes up the crypt well behind you. Carry the altar's flame up it to the rood screen's third sconce; every sconce you light on the way holds the dark
// below it a while and gives you a fresh flame, and wakes the priest on that landing.
//
// THE THEMED KEY: five CANDLE STUBS (L.quest), each in a pocket off the route. All five open THE RELIQUARY behind the south transept's altar: a SILVER,
// and its back door - THE SACRISTY PASSAGE - a shortcut from the south transept back to the crossing (no relic).
//
// THE CROSS IN SIDE VIEW (columns; the nave's floor is row 37, the gallery's row 19, the crypt's row 54):
//   0-44     THE GRAVEYARD + WEST DOOR  TEACH    take a flame at the sexton's brazier, light the porch lamp: the west door opens; the dark lets a wight up
//   45-151   THE NARTHEX + THE NAVE     TEST     a priest by a lit lamp (snuff it: he weakens, the grate wakes); the pulpit's priest, the pews, the knights
//   152-178  THE CROSSING + N TRANSEPT  TEST     up the piers to the north transept chapel: LAMP ONE (a votive stand by it); the bellows to the gallery
//   56-178   THE ORGAN GALLERY (row 28) REMIX    west over the nave in the dark: the pipes, a second bellows (a stub), THE BROKEN LOFT (the chord gust), LAMP TWO
//   45-55    THE WEST TOWER             (SNUFF REQUIRED) the seal lamp holds the crypt hatch shut: snuff it, drop to the narthex, down the hatch
//   46-178   THE CRYPT (row 63)         REMIX    the dead's own dark; ossuary shelves, bone pits, corpse candles, THE SEALED VAULT (the one ambush), LAMP THREE
//   160-167  THE CRYPT WELL             SET PIECE: THE DARK RISES - up the well with the altar's flame to the crossing; the rood screen's third sconce
//   180-236  THE SOUTH TRANSEPT         EXAM     THE ARCHDEACON's lit chapel over THE CHARNEL PIT (a fall is the end): his room heal, the bellows to the high
//                                                lamp, the grates; his gate holds the sanctuary. THE RELIQUARY behind the altar
//   241-282  THE SANCTUARY              BOSS     THE PALADIN (src/paladin-boss.js stagePaladin), lit by the lamps you lit
import { stagePaladin, PB_STAGE } from './paladin-boss.js';

export const CHURCH = { W: 290, H: 60, nave: 37, gallery: 19, crypt: 54, south: 41 };
export const RULE = 'LIGHT IS THE CLERGY\'S: A LIT ROOM MAKES THE PRIESTS STRONG, A DARK ONE LETS THE DEAD UP. CARRY A FLAME TO LIGHT A LAMP; A BLOW SNUFFS IT.';
export const SECTIONS = [['THE GRAVEYARD', 0], ['THE NAVE', 45], ['THE NORTH TRANSEPT', 152], ['THE ORGAN GALLERY', 1000], ['THE CRYPT', 2000], ['THE CRYPT WELL', 3000], ['THE SOUTH TRANSEPT', 180], ['THE SANCTUARY', 241]];   /* (the gallery, the crypt and the well stack over the nave: their order is the route's, see ROUTE_ORDER) */
export const ROUTE_ORDER = ['THE GRAVEYARD', 'THE NAVE', 'THE NORTH TRANSEPT', 'THE ORGAN GALLERY', 'THE CRYPT', 'THE CRYPT WELL', 'THE SOUTH TRANSEPT', 'THE SANCTUARY'];
/* THE FORK HOOK (for the integrator, when THE TOWPATH lands - claude/towpath): the church is an OPTIONAL split path. Its map node stands up the hill from the
   Towpath's first screen; the LEVELS row's needs becomes 'towpath' (the fork is the Towpath's start: its lychgate / hill path). Nothing here reads it - it is
   the note in code (tools/lit-church.mjs only checks that the row needs one of these). */
export const FORK = { now: 'waymeet', then: 'towpath', node: { sheet: 'inland', x: 12, y: 138 }, why: 'THE TOWPATH\'s lychgate: the hill path to THE LIT CHURCH, the river path to the canal' };
/* each verb's arc (tile columns; the gallery, crypt and well are stacked, so their spans name rows too) - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/lit-church.mjs */
export const ARCS = {
  light: { teach: [6, 44], test: [62, 178], remix: [56, 178], exam: [180, 236], boss: [241, 282] },     /* the porch lamp; the nave + lamp one; lamp two and the crypt candles; the Archdeacon's room; the sanctuary's lamps */
  snuff: { teach: [46, 62], test: [100, 130], remix: [45, 55], exam: [180, 236], boss: [241, 282] },    /* the narthex priest's lamp; the pulpit; THE SEAL LAMP (required); the exam's lamps; his lamps starve his light */
  organ: { teach: [160, 178], test: [130, 160], remix: [96, 112], exam: [186, 200] },                   /* the transept bellows (required); the pipe bellows; THE BROKEN LOFT's chord (required); the exam's bellows */
  crypt: { teach: [46, 60], test: [60, 130], remix: [132, 178], exam: [180, 236] },                    /* the hatch; the ossuary; the vault and lamp three; the exam's grates and the charnel pit */
};

export function buildLitChurch({ painter, T, TS }) {
  const { W, H, nave: NF, gallery: GF, crypt: CF, south: SF } = CHURCH;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const boards = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  const spikes = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.SPIKE); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const foe = (t, x, y, room, o) => ent(t, x, y, Object.assign({ face: -1, room }, o || {}));
  /* THE CAST (proven machines under the church's skins; src/lit-church-hands.js gives each its twist - every one of them lives by the light):
     priest    THE PRIEST: the goblin mage's caster (keep off, a told LIGHT BOLT !, a red !! sigil under you) + HEAL (told, no mark: a blow cuts it) + RE-LIGHT
     acolyte   THE ACOLYTE (the ONE new foe: the Waymeet runner's body and sheet): he does not fight - he runs for a snuffed lamp with his taper and lights it in a breath (catch him)
     swornsword / hedgeknight / crossbow: Waymeet's own roadmen, here THE CHAPEL KNIGHTS (the priests' escort) and a crossbowman on the triforium
     wight / haunt / boo / bonearcher / husk: the crypt's dead (placed in the crypt; the grates bring more up into a dark room) */
  const priest = (x, y, room, o) => foe('gobmage', x, y, room, Object.assign({ cnSkin: 'priest', lc: 'priest' }, o || {}));
  const acolyte = (x, y, room, o) => foe('acolyte', x, y, room, Object.assign({ lc: 'acolyte' }, o || {}));
  const knight = (x, y, room, o) => foe('swornsword', x, y, room, Object.assign({ cnSkin: 'chapelknight', lc: 'knight' }, o || {}));
  const hedge = (x, y, room, o) => foe('hedgeknight', x, y, room, Object.assign({ cnSkin: 'templar', lc: 'knight' }, o || {}));
  /* THE RULE'S PIECES (src/lit-church-hands.js reads them off L) */
  const rooms = [], lamps = [], sources = [], bellows = [], desks = [], grates = [], doors = [], decor = [], interiors = [], vaultDoors = [], drops = [];
  const room = (id, name, x0, y0, x1, y1, o) => rooms.push(Object.assign({ id, name, x0, y0, x1, y1 }, o || {}));
  /* a LAMP: kind 'lamp' (a standing lamp: lit at the start if lit), 'chapel' (one of the three: lit only by a hero's flame, it never goes out and lights its
     rood screen sconce), 'sconce' (a wall lamp), 'rood' (a rood screen sconce: lit from its chapel - the third by hand), 'seal' (the seal lamp) */
  const lamp = (id, x, y, rm, kind, o) => { lamps.push(Object.assign({ id, x, y, room: rm, kind: kind || 'lamp', lit: false }, o || {})); ent('lclamp', x, y, { id }); };
  /* a SOURCE: it always burns - E there puts a flame in your hand (the sexton's brazier, a votive stand, the vigil candle) */
  const source = (id, x, y, kind) => { sources.push({ id, x, y, kind }); ent('lcsource', x, y, { id }); };
  const bellow = (id, x, y, top, o) => { bellows.push(Object.assign({ id, x, y, top, w: 1 }, o || {})); ent('lcbellows', x, y, { id }); };
  const grate = (x, y, rm, o) => { grates.push(Object.assign({ x, y, room: rm }, o || {})); ent('lcgrate', x, y, { room: rm }); };
  const stub = (x, y) => ent('stray', x, y, { kind: 'candlestub' });

  /* THE STONE: everything is solid until it is carved (the church is a building; the graveyard's sky is carved open) */
  block(0, W - 1, 0, H - 1);

  // ================= 1. THE GRAVEYARD + THE WEST DOOR (0-44): TEACH - the flame, the porch lamp, the dark lets the dead up =================
  air(0, 43, 0, NF - 1);                                                         /* the night sky over the graves */
  block(0, 5, NF - 2, NF - 1);                                                   /* THE FIRST SCREEN ASKS: the mound you start on (two rows up) */
  decor.push({ kind: 'yew', x: 3, y: NF - 3 }, { kind: 'moon', x: 22, y: -3 });
  source('brazier', 9, NF - 1, 'brazier');                                      /* THE SEXTON'S BRAZIER: it always burns */
  sign(7, NF - 1, 'THE LIT CHURCH. E AT A FIRE TAKES A FLAME; E AT A DARK LAMP LIGHTS IT.');
  block(13, 13, NF - 2, NF - 1); decor.push({ kind: 'headstone', x: 13, y: NF - 3 });   /* a headstone to hop */
  /* THE OPEN GRAVE (cols 18-21): the graveyard is dark - the dead come up out of it (a wight lies in it; a lit porch lamp holds it down) */
  air(18, 21, NF, NF + 1); grate(19, NF + 1, 'graveyard', { open: true });
  foe('wight', 20, NF + 1, 'graveyard', { lc: 'dead' });
  block(25, 28, NF - 2, NF - 1); decor.push({ kind: 'tomb', x0: 25, x1: 28, y: NF - 2 });   /* a chest tomb (a hop on, a hop off) */
  block(32, 32, NF - 2, NF - 1); decor.push({ kind: 'headstone', x: 32, y: NF - 3 });
  /* a CANDLE STUB behind the charnel cross, up on the old wall's top (off the route: a climb onto the tomb, then the wall) */
  boards(29, 31, NF - 4); stub(30, NF - 5);                                      /* (two rows over the tomb's top: from the ground it is four) */
  /* THE PORCH and THE WEST DOOR: the porch lamp (dark); lit, the door's bars lift (src/lit-church-hands.js) */
  lamp('porch', 40, NF - 1, 'graveyard', 'lamp', { opens: 'west' });
  sign(37, NF - 1, 'THE WEST DOOR OPENS TO A LIT LAMP.');
  block(44, 45, 5, NF - 1); doors.push({ id: 'west', x0: 44, x1: 45, y0: NF - 5, y1: NF - 1, by: 'porch' });   /* the west wall and its door (the door's cells: bars until the lamp is lit) */
  room('graveyard', 'THE GRAVEYARD', 0, 0, 43, NF + 2, { outside: true });

  // ================= 2. THE NARTHEX, THE WEST TOWER and THE NAVE (45-151) =================
  /* THE WEST TOWER (cols 46-54) stands over THE NARTHEX (rows 41-45): the west door goes through its foot; the tower's stair comes down from the gallery
     (row 27) to THE SEAL LAMP's landing (row 32), and a drop to the narthex floor (one way: nothing climbs back up). THE CRYPT HATCH (cols 48-50) is in the
     narthex floor, held shut by the seal lamp's light */
  air(46, 54, 6, 31); air(46, 55, NF - 5, NF - 1);                              /* the tower's shaft, the narthex */
  block(46, 49, 19, 19); air(55, 55, 15, 18);                                    /* the ringing floor (row 19) and the door into it from the gallery */
  boards(46, 54, 23); air(46, 48, 23, 23);                                       /* THE SEAL LAMP's landing (a hole at its west end: the drop to the narthex) */
  lamp('seal', 53, 22, 'tower', 'seal', { lit: true, opens: 'hatch' });
  sign(51, 22, 'THE SEAL LAMP: ITS LIGHT HOLDS THE CRYPT SHUT.');
  room('tower', 'THE WEST TOWER', 46, 6, 54, 31);
  doors.push({ id: 'hatch', x0: 48, x1: 50, y0: NF, y1: NF + 1, by: 'seal', snuff: true });   /* THE CRYPT HATCH (bars of light while the seal burns) */
  /* THE NARTHEX's lesson: a priest by a LIT lamp over a grate - snuff it (a blow) and he is weaker; the grate wakes */
  lamp('narthex', 52, NF - 1, 'narthex', 'lamp', { lit: true });
  priest(54, NF - 1, 'narthex'); grate(47, NF, 'narthex');
  sign(46, NF - 1, 'A LIT ROOM MAKES THE PRIESTS STRONG. A BLOW SNUFFS A LAMP.');
  room('narthex', 'THE NARTHEX', 45, NF - 5, 55, NF - 1);
  /* THE NAVE (cols 56-151, rows 29-45): under the gallery's floor (row 28); pews (low boards), pillars with their capitals (ledges), the triforium (a balcony
     along the north side, rows 38-39), the pulpit, two standing lamps, the grates */
  air(56, 151, GF + 1, NF - 1);
  for (const c of [68, 88, 108, 128, 148]) decor.push({ kind: 'pillar', x: c, y0: GF + 1, y1: NF - 1 });
  /* the pews: low benches in rows (one-way: hop them, stand on them) and a broken stretch of floor over the charnel (a shallow pit, iron in it: it bites) */
  for (const [x0, x1] of [[60, 63], [65, 68], [71, 74], [92, 95], [97, 100], [113, 116], [118, 121], [138, 141]]) { boards(x0, x1, NF - 2); decor.push({ kind: 'pew', x0, x1, y: NF - 2 }); }
  /* THE TRIFORIUM: ledges along the north wall (a second height): a crossbowman on it covers the nave's lamps */
  for (const [x0, x1, y] of [[58, 66, 33], [69, 77, 31], [102, 110, 33], [113, 120, 31], [123, 134, 33], [143, 150, 33]]) { boards(x0, x1, y); decor.push({ kind: 'triforium', x0, x1, y }); }   /* (off a pew: three rows; ledge to ledge: two or three) */
  ent('crossbow', 106, 32, { face: -1, room: 'nave', cnSkin: 'chapelbow', lc: 'knight' });
  /* the capital of the fourth pillar holds a CANDLE STUB (off the route: up the triforium, then the capital) */
  boards(126, 128, 31); stub(127, 30);
  /* NAVE ENCOUNTER ONE (the lamp, the knight): a priest and a sworn knight at the first nave lamp, a grate at its foot */
  lamp('naveA', 76, NF - 1, 'nave', 'lamp', { lit: true });
  priest(79, NF - 1, 'nave'); knight(73, NF - 1, 'nave'); grate(70, NF, 'nave'); grate(86, NF, 'nave');
  /* THE PULPIT (cols 100-104: a stair up to its drum, row 41): its priest preaches from it - the ranged one over the pews */
  block(101, 103, NF - 4, NF - 1); boards(99, 100, NF - 2); priest(102, NF - 5, 'nave', { face: -1 }); decor.push({ kind: 'pulpit', x0: 101, x1: 103, y: NF - 4 });
  sign(96, NF - 1, 'PRIESTS RE-LIGHT WHAT YOU SNUFF. AN ACOLYTE RUNS FOR IT.');
  /* NAVE ENCOUNTER TWO (the second lamp, near the crossing): a priest, an acolyte and the hedge knight (the escort) */
  lamp('naveB', 124, NF - 1, 'nave', 'lamp', { lit: true });
  priest(127, NF - 1, 'nave'); acolyte(119, NF - 1, 'nave'); hedge(140, NF - 1, 'nave'); grate(122, NF, 'nave'); grate(144, NF, 'nave');
  room('nave', 'THE NAVE', 56, GF + 1, 151, NF - 1);

  // ================= 3. THE CROSSING and THE NORTH TRANSEPT (152-178): TEST - lamp one; THE BELLOWS (required) =================
  air(152, 178, GF + 1, NF - 1);
  /* the crossing's piers: steps up to THE NORTH TRANSEPT CHAPEL (its floor row 37, cols 160-178); under it the crossing runs on to the rood screen */
  boards(152, 156, 35); boards(155, 158, 33); boards(156, 159, 31); block(160, 178, 29, 29);
  /* THE CRYPT WELL's head: the crossing's crypt grate (cols 162-165, rows 46-47) - bars until LAMP THREE cracks it */
  doors.push({ id: 'cryptgrate', x0: 162, x1: 165, y0: NF, y1: NF, by: 'chapel3' });
  /* THE ROOD SCREEN (col 179): a stone screen to the vault, its door (rows 41-45) barred until its three sconces burn; the sconces over the door */
  block(179, 179, GF + 1, NF - 1); doors.push({ id: 'rood', x0: 179, x1: 179, y0: NF - 5, y1: NF - 1, by: 'rood' });
  lamp('rood1', 176, NF - 3, 'crossing', 'rood', { of: 'chapel1' }); lamp('rood2', 177, NF - 3, 'crossing', 'rood', { of: 'chapel2' }); lamp('rood3', 178, NF - 3, 'crossing', 'rood', { of: 'chapel3', hand: true });
  sign(172, NF - 1, 'THE ROOD SCREEN OPENS WHEN ITS THREE SCONCES BURN.');
  room('crossing', 'THE CROSSING', 152, 30, 178, NF - 1);
  /* THE NORTH TRANSEPT CHAPEL (rows 29-36): LAMP ONE on its altar, a votive stand by the door, the priest pair, their knight, an acolyte; the BELLOWS at the
     organ's foot (col 166): struck, a column of air lifts you up its pipe through the gallery's floor */
  lamp('chapel1', 176, 28, 'transept', 'chapel'); source('votive1', 162, 28, 'votive');
  sign(161, 28, 'LAMP ONE. THE THREE CHAPEL LAMPS LIGHT THE ROOD SCREEN.');
  priest(171, 28, 'transept'); priest(174, 28, 'transept', { face: -1 }); knight(168, 28, 'transept'); acolyte(163, 28, 'transept', { face: 1 }); grate(170, 29, 'transept');
  bellow('transept', 166, 28, 9); air(165, 167, GF, GF);                        /* THE BELLOWS and its shaft up through the gallery floor */
  sign(164, 28, 'THE ORGAN\'S BELLOWS: STRIKE IT AND THE PIPE BREATHES.');
  ent('check', 157, 30);                                                         /* CHECKPOINT ONE, on the piers' last step */
  room('transept', 'THE NORTH TRANSEPT', 158, GF + 1, 178, 28);

  // ================= 4. THE ORGAN GALLERY (row 28, cols 56-178): REMIX - in the dark, the pipes, the broken loft, lamp two =================
  air(56, 178, 6, GF - 1);
  /* THE ORGAN over the transept: its pipes stand on the gallery floor in two ranks, each a stair of two-row steps (2 then 4 high): the climb over them west */
  for (const [x, h] of [[156, 2], [154, 4], [150, 2], [148, 4]]) { block(x, x + 1, GF - h, GF - 1); decor.push({ kind: 'pipe', x, h, y: GF }); }
  /* THE PIPE BELLOWS (col 136): a second breath up to the organ case's top (row 17) - a CANDLE STUB and a silver up there (off the route) */
  bellow('pipes', 136, GF - 1, 6); boards(130, 139, 9); stub(132, 8); ent('silver', 138, 8);
  /* the gallery's own dead (it is dark until lamp two burns): a haunt over the pipes, a boo along the rail, a priest at the console */
  ent('haunt', 126, 13, { room: 'gallery', lc: 'dead' }); ent('boo', 88, 15, { room: 'gallery', lc: 'dead' });
  acolyte(120, GF - 1, 'gallery'); knight(115, GF - 1, 'gallery');
  /* THE BROKEN LOFT (cols 97-105: nine columns of the gallery's floor are gone - a fall is the nave floor, far below, and the climb back). THE KEY DESK on its
     east lip (col 109): E holds a chord - a told gust blows WEST along the gallery; jump into it and it carries you over */
  air(97, 105, GF, GF); drops.push([97, 105, 'nave']);
  desks.push({ id: 'desk', x: 109, y: GF - 1, dir: -1, x0: 92, x1: 112, y0: 8, y1: GF - 1 }); ent('lcdesk', 109, GF - 1, { id: 'desk' });
  sign(111, GF - 1, 'THE ORGAN\'S KEY DESK: E PLAYS A CHORD. THE GUST BLOWS WEST.');
  ent('haunt', 101, 12, { room: 'gallery', lc: 'dead' });                                       /* a haunt over the broken loft: at the jump */
  /* THE CONSOLE (west end): LAMP TWO on it, a votive stand, the organist priest */
  lamp('chapel2', 60, GF - 1, 'gallery', 'chapel'); source('votive2', 66, GF - 1, 'votive');
  priest(70, GF - 1, 'gallery'); acolyte(75, GF - 1, 'gallery', { face: 1 });
  sign(63, GF - 1, 'LAMP TWO, ON THE ORGAN\'S CONSOLE.');
  ent('check', 82, GF - 1);                                                     /* CHECKPOINT TWO, past the broken loft */
  room('gallery', 'THE ORGAN GALLERY', 56, 6, 178, GF - 1);
  /* the gallery's west door into the tower (col 55, rows 24-27) is carved above; the tower's shaft goes down to the seal lamp's landing */

  // ================= 5. THE CRYPT (cols 46-178, rows 48-62; floor row 63): REMIX - the dead's own dark; THE SEALED VAULT; LAMP THREE =================
  air(46, 178, NF + 2, CF - 1);
  air(48, 50, NF, NF + 1);                                                       /* the hatch's shaft (its bars are the door above) */
  boards(46, 52, 42); boards(49, 55, 46); boards(46, 52, 50);                     /* the hatch stair down (one way: you do not come back up it) */
  source('hatchfire', 56, CF - 1, 'brazier');                                    /* THE SEXTON'S LANTERN at the stair's foot: a flame to carry in */
  sign(58, CF - 1, 'THE CRYPT. THE DARK IS THE DEAD\'S: A LIT CANDLE HOLDS THEM DOWN.');
  /* THE OSSUARY (60-100): shelves of bone (ledges), tombs, a bone pit, corpse candles (sconces) and the dead */
  for (const [x0, x1, y] of [[62, 67, 52], [66, 72, 50], [84, 90, 52], [93, 98, 50]]) { boards(x0, x1, y); decor.push({ kind: 'shelf', x0, x1, y }); }
  block(74, 76, CF - 2, CF - 1); block(102, 104, CF - 2, CF - 1);                 /* chest tombs */
  air(78, 80, CF, CF + 1); spikes(78, 80, CF + 1); drops.push([78, 80, 'hurt']);   /* a bone pit */
  lamp('candleA', 64, CF - 1, 'ossuary', 'sconce'); lamp('candleB', 96, CF - 1, 'ossuary', 'sconce');
  ent('wight', 70, CF - 1, { room: 'ossuary', lc: 'dead' }); ent('wight', 88, CF - 1, { room: 'ossuary', lc: 'dead' }); ent('bonearcher', 95, 49, { room: 'ossuary', lc: 'dead', face: -1 });
  ent('haunt', 84, 43, { room: 'ossuary', lc: 'dead' });
  grate(72, CF, 'ossuary'); grate(91, CF, 'ossuary');
  stub(68, 49);                                                                  /* a CANDLE STUB on the high shelf */
  room('ossuary', 'THE OSSUARY', 46, NF + 2, 106, CF - 1, { dark: true });
  /* THE SEALED VAULT (cols 110-140): the one ambush - its walls shut when you are in, and the crypt's captain and his dead come (src/level.js AMBUSH.church) */
  block(107, 108, NF + 2, CF - 6); block(141, 142, NF + 2, CF - 6);              /* the vault's lintels (the ambush's walls drop under them) */
  decor.push({ kind: 'vault', x0: 109, x1: 140, y: CF });
  boards(116, 121, 52); boards(129, 134, 52); boards(120, 124, 50); boards(124, 127, 48); ent('silver', 126, 47);   /* the vault's shelves, and a silver on the top one (a climb of two-row steps: the vault's own reward, off the floor) */
  room('vault', 'THE SEALED VAULT', 107, NF + 2, 142, CF - 1, { dark: true });
  /* THE CRYPT ALTAR (cols 146-178): corpse candles, the dead, the VIGIL CANDLE (a source) and LAMP THREE on the altar; the well at its west end */
  block(150, 152, CF - 2, CF - 1); boards(146, 149, 52);
  lamp('candleC', 154, CF - 1, 'altar', 'sconce');
  ent('wight', 157, CF - 1, { room: 'altar', lc: 'dead' }); ent('haunt', 150, 44, { room: 'altar', lc: 'dead' });
  source('vigil', 172, CF - 1, 'vigil'); lamp('chapel3', 175, CF - 1, 'altar', 'chapel', { cracks: true });
  sign(170, CF - 1, 'LAMP THREE: THE LIGHT THE CHURCH KEEPS OVER ITS DEAD.');
  grate(158, CF, 'altar');
  room('altar', 'THE CRYPT ALTAR', 143, NF + 2, 178, CF - 1, { dark: true });
  ent('check', 147, CF - 1);                                                     /* CHECKPOINT THREE, at the altar's door (after the vault) */
  /* THE CRYPT WELL (cols 160-167): landings up to the crossing's grate (rows 46-47); a sconce on three of them, a priest and an acolyte asleep on two */
  air(162, 165, NF, NF);
  for (const [x0, x1, y] of [[159, 163, 52], [163, 167, 50], [159, 163, 48], [163, 167, 46], [159, 163, 44], [163, 167, 42], [159, 163, 40]]) boards(x0, x1, y);   /* the landings, two rows apart, side to side */
  boards(162, 165, NF + 1);                                                      /* THE GRATE'S STEP under the crossing's grate (row 47): from it, a hop onto the crossing's floor */
  lamp('wellA', 160, 51, 'well', 'sconce', { hold: true }); lamp('wellB', 166, 45, 'well', 'sconce', { hold: true }); lamp('wellC', 160, 39, 'well', 'sconce', { hold: true });
  priest(166, 49, 'well', { asleep: true, face: -1 }); acolyte(166, 41, 'well', { asleep: true, face: -1 });
  boards(154, 156, 50); stub(155, 49);                                           /* a CANDLE STUB on a ledge off the lowest landing (a jump west, off the route) */
  /* THE SACRISTY STAIR up the altar room's east wall to THE SACRISTY PASSAGE (rows 48-49, cols 179-183, under the crossing's step): its door is the reliquary's */
  boards(176, 178, 52); boards(172, 174, 50); boards(176, 178, 48); boards(172, 174, 46); boards(176, 178, 44); boards(170, 178, 42); air(179, 183, 39, 40);   /* (two-row steps; the last a hop onto the passage floor) */
  room('well', 'THE CRYPT WELL', 158, NF + 1, 168, CF - 1, { dark: true, rises: { floor: CF, top: NF + 1 } });

  // ================= 6. THE SOUTH TRANSEPT (180-236): THE EXAM - THE ARCHDEACON's lit chapel over THE CHARNEL PIT =================
  air(180, 237, 21, SF - 1); air(180, 186, NF - 5, NF - 1);                     /* the chapel (its floor sunk to row 41) and the step down from the screen */
  block(180, 184, NF, SF - 1);                                                   /* the step down off the crossing's floor */
  sign(186, SF - 1, 'THE CHARNEL PIT: A FALL BETWEEN THE FLOORS IS THE END.');
  /* THE CHARNEL PIT (cols 203-204: a jump every hero makes - the knight's shove and the dead at its lip make it a risk): open to the dark under the church - a fall is a death here (A10 amended: the exam; told by the sign above) */
  air(203, 204, SF, H - 1); drops.push([203, 204, 'death']);
  /* THE HIGH LAMP on the north ledge (row 41, cols 193-201): reached only by the chapel's BELLOWS (col 190); a priest guards it */
  boards(194, 201, 32); bellow('south', 193, SF - 1, 27);
  lamp('southHigh', 198, 31, 'south', 'lamp', { lit: true }); priest(195, 31, 'south', { face: 1 });
  /* THE FLOOR: the hedge knight on the pit's east lip (his poleaxe's shove is a step back into it), the acolyte, THE ARCHDEACON on his dais by the altar */
  lamp('southLow', 214, SF - 1, 'south', 'lamp', { lit: true });
  hedge(208, SF - 1, 'south'); acolyte(217, SF - 1, 'south');
  block(222, 228, SF - 2, SF - 1); priest(225, SF - 3, 'south', { cnSkin: 'archdeacon', elite: true, gate: 234, face: -1 });   /* THE ARCHDEACON (elite: src/lit-church-hands.js his room heal) */
  grate(196, SF, 'south'); grate(212, SF, 'south'); grate(219, SF, 'south');
  sign(209, SF - 1, 'THE ARCHDEACON\'S HEAL REACHES HIS WHOLE ROOM WHILE IT IS LIT.');
  boards(209, 215, 39);                                                           /* a ledge over the floor (the angle over the knight) */
  room('south', 'THE SOUTH TRANSEPT', 180, 21, 237, SF - 1);
  /* THE RELIQUARY (cols 185-187: the closet behind the chapel's west altar, its door at col 188): FIVE CANDLE STUBS open it - a SILVER, and its back door:
     THE SACRISTY DOOR (col 184, rows 48-49) onto THE SACRISTY PASSAGE under the step, down into the crypt altar room - a shortcut from CHECKPOINT THREE to the
     exam that skips the well (no relic: Daniel 10-07) */
  block(185, 188, SF - 6, SF - 1); air(185, 187, SF - 3, SF - 1); ent('silver', 186, SF - 1); decor.push({ kind: 'altar', x: 186, y: SF - 7 });
  doors.push({ id: 'reliquary', x0: 188, x1: 188, y0: SF - 3, y1: SF - 1, by: 'stubs' }); ent('lcreliquary', 188, SF - 1, { id: 'reliquary' });
  doors.push({ id: 'sacristy', x0: 184, x1: 184, y0: 39, y1: 40, by: 'stubs' });
  sign(190, SF - 1, 'THE RELIQUARY. FIVE CANDLE STUBS OPEN IT.');
  ent('check', 238, SF - 1);                                                     /* CHECKPOINT FOUR, after the exam: before the sanctuary */
  sign(236, SF - 1, 'THE SANCTUARY. THE PALADIN KEEPS ITS LAMPS.');   /* (B8: he does not come from nowhere - his order's chapel lamps, his name at his door) */

  // ================= 7. THE SANCTUARY (241-282): THE PALADIN =================
  const AX = 241;
  air(234, AX - 1, 25, SF - 1);
  const stage = stagePaladin({ set, block, ent, air }, T, TS, AX, SF);
  block(AX + PB_STAGE.W, W - 1, 0, H - 1);
  stage.carve(); lamps.push(...stage.lamps);
  room('sanctuary', 'THE SANCTUARY', AX, SF - 20, AX + PB_STAGE.W - 1, SF - 1, { arena: true });
  ent('gate', AX + PB_STAGE.W - 2, SF - 1);

  /* INDOORS: every room but the graveyard is under the church's roof (the weather, the reverb, and src/architecture's load path: a room carries its ceiling) */
  for (const r of rooms) if (!r.outside) interiors.push([r.x0, r.x1, Math.max(0, r.y0), r.y1, 'church']);
  interiors.push([46, 54, 6, NF - 1, 'church']);   /* (the west tower's shaft and the narthex under it are one hall: its floor is the narthex's) */
  /* THE DOORS are barred as laid (T.PORT): the hands lift them (src/lit-church-hands.js) */
  for (const d of doors) for (let y = d.y0; y <= d.y1; y++) for (let x = d.x0; x <= d.x1; x++) set(x, y, T.PORT);
  /* every placed foe in a room learns it from its ent (the hands read e.room); a grate's dead come up as wights, haunts and boos (the room's own `dead` list) */
  const START = { x: 2, y: NF - 3 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [], interiors,
    arena: stage.arena, gateAfterBoss: true,
    litchurch: true, rows: { nave: NF, gallery: GF, crypt: CF, south: SF }, dark: 0.08,   /* dark: the base under the rooms' own (src/lit-church-hands.js sets each room's darkZones value from its lamps every frame) */
    darkZones: rooms.map(r => ({ x0: r.x0 * TS, x1: (r.x1 + 1) * TS, y0: r.y0 * TS, y1: (r.y1 + 1) * TS, dark: r.dark ? 0.78 : 0.3, room: r.id })),
    rooms, lamps, sources, bellows, desks, grates, doors, decor, vaultDoors, drops,
    /* THE STATIC ROUTE (tools/pacing.mjs, src/reachcore.js): the doors the rule opens stand open to the model, the bellows are vents, the key desk's chord is a gust west, and
       the route goes by the places the rule sends you IN ORDER (the porch lamp, lamp one, lamp two, the seal, lamp three, the rood screen) - the rooms are stacked */
    reachDoors: doors.filter(d => d.id !== 'reliquary' && d.id !== 'sacristy'), reachVents: bellows.map(b => ({ t: 'vent', x: b.x, y: b.y, h: (b.y + 1 - b.top) * TS + TS })),
    reachGusts: desks.map(d => ({ x0: d.x0 * TS, x1: (d.x1 + 1) * TS, y0: d.y0 * TS, y1: (d.y1 + 1) * TS, dir: d.dir })),
    routeVia: [[40, NF - 1], [176, 28], [60, GF - 1], [52, 22], [145, CF - 1], [175, CF - 1], [177, NF - 1]],   /* (the altar's door: the crypt is walked end to end - its grate in the crossing only cracks at lamp three) */
    /* THE CHURCH'S WEIGHT (difficulty v2, the act's tier on top): a priest's bolt and sigil, a knight's cut - each a 1v1 threat at the campaign level. The light
       moves the clergy on top of this (src/lit-church-hands.js lcMul: lit x1.3, dark x0.7) */
    foeHit: { priest: 3.0, archdeacon: 2.6, chapelknight: 3.4, templar: 3.0, chapelbow: 2.6 },
    foeHp: { priest: 4, archdeacon: 1.2, chapelknight: 4, templar: 3.2, chapelbow: 3 },
    alarms: rooms.filter(r => !r.arena).map(r => ({ x0: r.x0, x1: r.x1 })),   /* THE RULE'S STATE for tools/rule-state.mjs: each room's lamps are where the light is */
    quest: { n: 5, item: 'candlestub', name: 'CANDLE STUBS', done: 'FIVE STUBS: THE RELIQUARY OPENS', thanks: 'THE RELIQUARY OPENS' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,
    squadBands: [{ lo: 241, hi: 290, spots: 0, why: 'THE SANCTUARY: columns 241-282 are THE PALADIN\'s arena - no squad stands in a boss arena' }],
    unlocks: [
      { kind: 'lclamp', opens: 'the west door (the porch lamp), the crypt hatch (THE SEAL LAMP snuffed), and the rood screen (the three chapel lamps: each lights its sconce; the third by hand)', hud: 'THE WEST DOOR OPENS / THE SEAL IS OUT: THE HATCH OPENS / LAMP n BURNS: A SCONCE ON THE ROOD SCREEN' },
      { kind: 'lcsource', opens: 'a flame in your hand (it burns down: carry it to a dark lamp)', hud: 'A FLAME: E AT A DARK LAMP LIGHTS IT' },
      { kind: 'lcbellows', opens: 'a lift: the pipe breathes and the air carries you up through the gallery floor (the transept, the organ case, the exam\'s high lamp)', hud: 'THE PIPE BREATHES: RIDE IT UP' },
      { kind: 'lcdesk', opens: 'a gust west along the gallery: it carries a jump over THE BROKEN LOFT', hud: 'THE CHORD: THE GUST BLOWS WEST' },
      { kind: 'stray', opens: 'THE RELIQUARY behind the south transept\'s altar once all five candle stubs are carried (a silver, and the sacristy passage: a shortcut back to the crossing)', hud: 'CANDLE STUBS n/5 - THE RELIQUARY WAITS (the quest counter)' },
      { kind: 'lcreliquary', opens: 'a silver and THE SACRISTY PASSAGE (a shortcut from the south transept to the crossing)', hud: 'THE RELIQUARY OPENS' },
    ],
    ambushKey: 'church',
    music: 'litchurch',
    ambient: [{ x0: 0, x1: 99999, kind: 'litchurch' }],   /* its own bed: src/audio.js (an organ's held drone and a far plainchant; the crypt's low wind) */
    masonry: [[44, W - 1, 0, H - 1]], rockZones: [],
    palette: { set: 'night', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(120,130,170,0.08)', darkCol: '8,8,18' },
    night: true, duskStart: -1, duskLen: 1,
  };
}
