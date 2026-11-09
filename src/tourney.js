/* src/tourney.js - THE TOURNEY (claude/tourney, the OPUS GREYBOX; scratch/brief-ghosttrain-tourney-1016.md section 2, Daniel 10-16; behind TOURNEY_SHIPS, src/ty-flag.js).
   Road: WAYMEET -> THE TOURNEY -> THE TOWPATH. A sunny jousting festival on the meadow outside Waymeet's walls - banners, crowds, NOT haunted: the palate cleanser
   before the fog. RULE: 'THE LISTS RUN ONE WAY. MEET THE LANCE, OR LEAVE THE LANE.' FOUR VERBS (Daniel's answers):
     TILT LANES     a LANCER (the existing serjeant) rides a fenced lane end to end; cross between his charges, or vault the TILT RAIL (2 rows up: his lance passes under)
     QUINTAINS      a pivoting dummy: strike its shield and it spins - the arm comes round (told) at head height: DUCK it, or BLOCK and it CARRIES you up (L.strikers: the reach)
     THE HORSE      (Q5 = C) about HALF THE LEVEL ON HORSEBACK: inside a ride's columns the hero is mounted (src/tourney-hands.js). It is the minecart's sibling - it runs
                    src/minecart.js cartSpeed (trot / gallop / rein to a walk, always forward). HOLD ATTACK to couch the lance at rings, straw targets and riders
     GRANDSTANDS    the stand's tiers are the road over the wall; BANNER RIGGING (zip lines, bunting) down off it and over the pavilions
   NEW FOE (Q4 = A): THE HORSE ARCHER (tyarcher) - mounted, circles its beat and looses. One new foe; the rest are the lancer, the sworn swords, a hedge knight, crossbowmen.
   SECTIONS (columns):   0-43   THE GATE MEADOW     TEACH    (foot) the tilt lane + its rail, the first quintain (and its carry to the stable loft), the stable
                        44-119  THE PRACTICE LISTS  TEACH    (MOUNTED) rings, hurdles, a bank, a ditch, a quintain at the gallop, a lancer to unhorse; the groom
                       120-175  THE GRANDSTANDS     DEVELOP  (foot) up the stand and over its back wall, the royal box (secret 1), rigging down, the first horse archer
                       176-264  THE GREAT LISTS     TWIST    (MOUNTED) riders the other way, two horse archers, rings + targets, banks, the water jump, the sunken list
                       265-299  THE PAVILIONS       EXAM     (foot) tents, the quintain on the pavilion roof that carries you to the crow's nest (secret 2), knights + an archer
                       300-371  THE CHAMPION'S LISTS BOSS    THE CHAMPION (src/ty-champion.js): P1 a mounted joust, P2 unhorsed on foot
   CHECKPOINTS (Daniel: fewer): START, the grandstand's foot (col 172) and the pavilions (col 296). L.checkRun 200: the filler adds none.
   GRID: ground row 30 (stand at feet row 29); sky above; laid wholly by hand (calm: nothing sprinkled). */
import { TY_RULE, TY_SAY } from './ty-lines.js';
import { TC } from './ty-champion.js';

export const TY = {
  W: 372, H: 40, G: 30, RAIL: 28,
  carry: { vx: 170, vy: -430 },   /* a quintain's arm flings a braced hero this hard (5 rows up: L.strikers tells the reach) */
  arena: { x0: 302, x1: 369, wallL: 301, wallR: 370, trigger: 305 },
};
export const SECTIONS = [['THE GATE MEADOW', 0, 44], ['THE PRACTICE LISTS', 44, 120], ['THE GRANDSTANDS', 120, 176], ['THE GREAT LISTS', 176, 265], ['THE PAVILIONS', 265, 300], ["THE CHAMPION'S LISTS", 300, 372]];
/* THE RIDES: inside [x0, x1) a hero is mounted (x0 = the horse at the gate; x1 = the groom). The arena's ride is two-way and ends when the Champion is unhorsed */
export const RIDES = [{ id: 'practice', x0: 44, x1: 119, name: 'THE PRACTICE LISTS' }, { id: 'great', x0: 177, x1: 264, name: 'THE GREAT LISTS' }, { id: 'champion', x0: 302, x1: 370, arena: true, name: "THE CHAMPION'S LISTS" }];

export function buildTourney({ painter, T, TS }) {
  const { W, H, G } = TY;
  const L = painter(W, H), { set, ent } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const block = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.SOLID), air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const ground = (x0, x1, top) => { air(x0, x1, 0, top - 1); block(x0, x1, top, H - 1); };
  const shelf = (x0, x1, y) => fill(x0, x1, y, y, T.ONEWAY);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const foe = (t, x, y, squad, o = {}) => ent(t, x, y, { squad, ...o });
  const quints = [], rings = [], targets = [], hurdles = [], rails = [], zipLines = [], strikers = [], props = [], lanes = [];
  /* A QUINTAIN on the floor row `f` (its post stands at feet row f-1). face: the shield's side (-1 = toward the hero coming from the west) */
  const quint = (x, f, o = {}) => { const q = { id: 'q' + quints.length, col: x, x: x * TS + 8, y: f * TS, face: o.face || -1, mounted: !!o.mounted }; quints.push(q); ent('tyquint', x, f - 1, { id: q.id });
    strikers.push({ x: x + (o.face === 1 ? 1 : -1), row: f, launch: TY.carry.vy, tickets: 0, quintain: q.id }); return q; };   /* (the reach's STRIKER model: a braced hero at the shield is flung 5 rows up) */
  /* A RING hung from a post at lance height (a couch takes it); a STRAW TARGET on a butt */
  const ring = (x, f) => { const r = { id: 'r' + rings.length, col: x, x: x * TS + 8, y: f * TS - 18 }; rings.push(r); ent('tyring', x, f - 1, { id: r.id }); return r; };
  const target = (x, f) => { const t = { id: 't' + targets.length, col: x, x: x * TS + 8, y: f * TS - 16 }; targets.push(t); ent('tytarget', x, f - 1, { id: t.id }); return t; };
  /* A HURDLE: two rows of hurdle on the list (a horse jumps it; ridden into, the horse balks - src/tourney-hands.js) */
  const hurdle = (x, f) => { block(x, x, f - 2, f - 1); hurdles.push({ col: x, f }); ent('tyhurdle', x, f - 3, {}); };
  /* A TILT LANE: the lancer's beat [x0, x1] on floor f, the TILT RAIL (one-way, TY.RAIL) along it with a gap (the herald's gate) you must drop through */
  const lane = (x0, x1, f, gap, squad, o = {}) => { const xc = Math.round((x0 + x1) / 2), range = Math.floor((x1 - x0) / 2);
    foe('lancer', xc, f - 1, squad, { range, face: o.face || -1 }); lanes.push({ x0, x1, f, squad });
    if (o.rail !== false) { const rr = f - 2; for (let x = x0; x <= x1; x++) if (!gap || x < gap[0] || x > gap[1]) set(x, rr, T.ONEWAY); rails.push({ x0, x1, row: rr, gap }); } };
  /* THE HORSE at a ride's gate, and the groom at its end (drawn; the ride itself is positional: RIDES) */
  const horse = (r, f) => { ent('tyhorse', r.x0, f - 1, { ride: r.id }); };
  const groom = (r, f) => { ent('tygroom', r.x1, f - 1, { ride: r.id }); };

  // ================= 1. THE GATE MEADOW (0-43): TEACH, ON FOOT =================
  ground(0, 43, G);
  block(0, 1, 16, G - 1);                                                           /* WAYMEET'S WALL: the town gate you come out of */
  sign(3, G - 1, TY_SAY.gate);
  shelf(6, 9, 26); coins([7, 25], [8, 25]); props.push({ kind: 'stall', x0: 6, x1: 9, top: 26 });   /* a pie stall's awning */
  sign(11, G - 1, TY_SAY.lane);
  lane(13, 29, G, [19, 21], 'gateLane');                                            /* the first tilt lane: rail 13-18 and 22-29, the herald's gate between */
  coins([15, TY.RAIL - 1], [26, TY.RAIL - 1]);
  sign(31, G - 1, TY_SAY.quint);
  quint(34, G);
  shelf(32, 41, 25); coins([37, 24], [39, 24], [41, 24]); props.push({ kind: 'loft', x0: 32, x1: 41, top: 25 });   /* THE STABLE LOFT: the quintain's carry puts you on it */
  sign(42, G - 1, TY_SAY.stable);

  // ================= 2. THE PRACTICE LISTS (44-119): TEACH, MOUNTED =================
  const R1 = RIDES[0];
  ground(44, 119, G); horse(R1, G); sign(45, G - 1, TY_SAY.ride); sign(48, G - 1, TY_SAY.couch);
  ring(53, G); ring(58, G);
  hurdle(64, G); sign(62, G - 1, TY_SAY.hurdle);
  ground(70, 82, G - 2); ring(75, G - 2); target(80, G - 2);                         /* THE BANK: up two rows (a jump), a ring and a straw target on it */
  shelf(66, 72, 25); coins([68, 24], [71, 24]);                                      /* the judges' bench over the bank (a mounted jump takes its coins) */
  ground(86, 88, G + 2);                                                            /* THE DITCH: two rows down and out again */
  quint(95, G, { mounted: true });                                                  /* a quintain at the gallop: strike it at pace and you are past the arm */
  shelf(98, 103, 26); coins([100, 25]);
  lane(104, 116, G, null, 'practiceLancer', { rail: false });                        /* A LANCER in the list: couch at him and he goes over his horse's tail */
  target(117, G);
  groom(R1, G); sign(119, G - 1, TY_SAY.groom);

  // ================= 3. THE GRANDSTANDS (120-175): DEVELOP, ON FOOT =================
  ground(120, 175, G);
  quint(124, G, { face: -1 });                                                      /* its carry lands on the stand's second tier */
  sign(126, G - 1, TY_SAY.stand);
  /* THE STAND: five tiers, three rows apart, each set back three columns; its back wall (151) runs from the top tier to the ground - the road goes over it */
  for (const [k, row] of [[0, 27], [1, 24], [2, 21], [3, 18], [4, 15]]) shelf(128 + 3 * k, 150, row);
  block(151, 151, 12, G - 1); block(151, 152, 12, 12);
  shelf(146, 150, 9); ent('silver', 147, 8); props.push({ kind: 'royalbox', x0: 146, x1: 150, top: 9 });   /* THE ROYAL BOX (secret one): off the road, over the top tier */
  coins([132, 23], [138, 17], [146, 14]);
  foe('swornsword', 133, 23, 'standKnights'); foe('swornsword', 140, 17, 'standKnights'); foe('crossbow', 148, 14, 'standKnights');
  sign(153, 11, TY_SAY.rigging);
  zipLines.push({ x0: 153 * TS + 4, y0: 11 * TS - 6, x1: 168 * TS, y1: 25 * TS, bunting: true, speed: 190, id: 'rigA', posts: [[153 * TS + 4, 11 * TS - 6, 12 * TS], [168 * TS, 25 * TS, G * TS]] });
  shelf(166, 170, 26); coins([168, 25]);
  zipLines.push({ x0: 146 * TS, y0: 8 * TS + 6, x1: 126 * TS, y1: 22 * TS, bunting: true, speed: 180, id: 'rigC', posts: [[146 * TS, 8 * TS + 6, 9 * TS], [126 * TS, 22 * TS, G * TS]] });   /* off the royal box, down the stand's west face */
  foe('hedgeknight', 160, G - 1, 'fieldKnight');
  sign(157, G - 1, TY_SAY.archer); foe('tyarcher', 164, G - 1, 'firstArcher', { x0: 155, x1: 171 });
  ent('check', 172, G - 1);                                                         /* SHRINE ONE: the grandstand's foot */

  // ================= 4. THE GREAT LISTS (176-264): TWIST, MOUNTED =================
  const R2 = RIDES[1];
  ground(176, 264, G); horse(R2, G); sign(178, G - 1, TY_SAY.lists);
  hurdle(184, G);
  shelf(180, 186, 26); coins([182, 25]);
  ground(190, 205, G - 2); ring(194, G - 2); target(203, G - 2);                     /* THE HIGH LIST: up two rows */
  foe('tyarcher', 200, G - 3, 'listArchers', { x0: 191, x1: 205 });
  shelf(196, 201, 25); coins([198, 24]);
  ground(212, 216, G + 2); air(212, 216, G, G + 1);                                  /* THE WATER JUMP (a dry ditch in the greybox: the art lane fills it) */
  hurdle(222, G);
  lane(224, 236, G, null, 'listLancerA', { rail: false, face: -1 });                  /* a rider the other way */
  ground(238, 248, G + 2); ring(242, G + 2); target(247, G + 2);                     /* THE SUNKEN LIST: down two rows, a ring and a target, out again */
  shelf(238, 243, 28); coins([240, 27]);
  foe('tyarcher', 244, G + 1, 'listArchers2', { x0: 238, x1: 250 });
  lane(251, 261, G, null, 'listLancerB', { rail: false, face: -1 });
  hurdle(262, G);
  groom(R2, G); sign(264, G - 1, TY_SAY.groom);

  // ================= 5. THE PAVILIONS (265-299): EXAM, ON FOOT =================
  ground(265, 299, G);
  block(267, 267, G - 2, G - 1);                                                    /* a stack of tourney chests: up onto the first tent */
  shelf(268, 277, 26); props.push({ kind: 'tent', x0: 268, x1: 277, top: 26, col: '#c84a3a' });
  foe('swornsword', 272, 25, 'pavilionKnights'); foe('hedgeknight', 279, G - 1, 'pavilionKnights');
  shelf(279, 290, 24); props.push({ kind: 'tent', x0: 279, x1: 290, top: 24, col: '#3a6ac8' }); block(290, 290, 18, 23);   /* THE HIGH PAVILION, its pole at the east end */
  quint(286, 24, { face: -1 });                                                     /* ON THE PAVILION ROOF: brace and it carries you to the crow's nest */
  shelf(283, 288, 19); ent('silver', 284, 18); props.push({ kind: 'nest', x0: 283, x1: 288, top: 19 });   /* THE CROW'S NEST on the pole (secret two) */
  zipLines.push({ x0: 283 * TS, y0: 18 * TS + 6, x1: 270 * TS, y1: 25 * TS, bunting: true, speed: 180, id: 'rigB', posts: [[283 * TS, 18 * TS + 6, 19 * TS], [270 * TS, 25 * TS, 26 * TS]] });   /* down off the nest onto the first tent */
  coins([270, 25], [287, 23], [292, 26]);
  foe('tyarcher', 292, G - 1, 'pavilionArcher', { x0: 287, x1: 298 });
  sign(294, G - 1, TY_SAY.pavilions);
  ent('check', 296, G - 1);                                                         /* SHRINE TWO: the pavilions */

  // ================= 6. THE CHAMPION'S LISTS (300-371): THE CHAMPION =================
  const R3 = RIDES[2];
  ground(300, 371, G); block(371, 371, 18, G - 1);
  sign(300, G - 1, TY_SAY.champion); horse(R3, G);
  props.push({ kind: 'pavilion', x0: 364, x1: 369, top: 24, col: '#d8b030' });       /* THE CHAMPION'S PAVILION: his squire runs out of it */
  ent('tychampion', 360, G - 1, { face: -1 });
  ent('torch', 303, G - 1);

  const A = TY.arena;
  const arena = { x0: A.x0 * TS, x1: (A.x1 + 1) * TS, floor: G * TS, y0: 10 * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'tychampion', music: 'boss2', tint: '#ffe8b0', tintA: 0.05,
    /* THE FIGHT'S GEOMETRY (src/ty-champion.js geom): the lists, the pavilion his squire runs out of, where the rival knights come in */
    pavilion: 366 * TS + 8, rivalX: 367 };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: G - 1 }, pools: [], falls: [],
    arena, tourney: true,
    ty: { rides: RIDES.map(r => ({ ...r })), quints, rings, targets, hurdles, rails, lanes, props, sections: SECTIONS },
    strikers, zipLines,
    calm: [[0, W - 1, 0, H - 1]], noCoin: [[A.x0, W - 1, 0, H - 1]],
    checkRun: 200,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: A.x0, hi: W - 1, spots: 0, why: "THE CHAMPION'S LISTS: the boss arena - no squad stands in it" }],
    unlocks: [
      { kind: 'tyring', opens: 'coins; all the practice rings - the stablemaster\'s purse', hud: TY_SAY.ring },
      { kind: 'tytarget', opens: 'coins (a couched lance at pace)', hud: TY_SAY.target },
      { kind: 'tyquint', opens: 'the stable loft, the stand\'s tier, the crow\'s nest silver (its arm carries a braced hero up)', hud: TY_SAY.carried },
      { kind: 'tyhorse', opens: 'the mounted lists (the horse: trot, gallop, rein; the couched lance)', hud: TY_SAY.mounted },
    ],
    duskStart: 99999, duskLen: 1, music: 'marketday',
    palette: { set: 'village', dress: 'village', ledges: 'staging', sky: [[104, 170, 225], [214, 236, 222]], far: 'town', mid: 'town', near: 'town', nearSet: 'town', noFg: true,
      haze: 'rgba(255,240,200,0.06)', grass: '#5a9a48', grassL: '#7cc062', grassD: '#3a6a32', dirt: '#7a6040', dirtL: '#9a7c54', dirtD: '#4a3a28' },
    ambient: [{ x0: 0, x1: 99999, kind: 'town' }],
    reachExact: false,
    tyRule: TY_RULE, tyCh: TC.hp,
  };
}
