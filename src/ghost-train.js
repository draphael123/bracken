/* src/ghost-train.js - THE GHOST TRAIN (claude/ghosttrain, the OPUS GREYBOX; scratch/brief-ghosttrain-tourney-1016.md section 1, Daniel 10-16; behind GHOSTTRAIN_SHIPS, src/gt-flag.js).
   Road: THE HARVEST FAIR -> THE GHOST TRAIN -> THE HEXED FIELDS. The fair's ghost-train ride is real: at midnight a phantom train leaves the fairground siding across the
   hexed fields. You board at the back and fight forward car by car to the engine. The one level built on CONSTANT MOTION: the train is the level and never stops (the
   world streams past behind it: src/ghost-train-hands.js draws it), and what the motion does is told and timed - the wind on the roofs, the low bridges and the tunnels.
   RULE: 'THE TRAIN NEVER STOPS. THE DEAD RIDE IN THE DARK CARS.' FOUR VERBS (Daniel's answers):
     ROOF OR INSIDE   every gangway has a step up to the roofs; on a roof the wind pushes you back and the bridges / tunnels come low (told: duck flat or get inside)
     LAMPS DECIDE     (Q2 = A) a ghost passenger is harmless while a lamp's light reaches it, and wakes in the dark. A blow on a lamp lights it or puts it out. A tunnel
                      puts out every lamp in a draughty car. Pick your fights.
     COUPLINGS        strike a coupling pin from the car ahead: the car behind is left on the line, with whatever woke on it
     THE POINTS       a lever before each junction picks the track: STRAIGHT ON = the tunnel (the roof sweeps, the lamps go out), THE BRANCH = the open line (wind / sparks)
   SECTIONS (columns):   0-35  THE SIDING        TEACH    the guard's van (one lamp lit, one dark: the rule), the first coupling, the well wagon with the fair's ride cars, the first points
                        36-95  PASSENGER CARS    DEVELOP  three coaches: lit / dark / first class (the luggage loft silver); low bridges over the roofs every few seconds
                       96-119  THE DINING CAR    TWIST    the clerestory car, five diners under two chandeliers - and the points before it: the long tunnel puts the chandeliers out
                      120-163  THE SLEEPING CARS EXAM     the dark exam: lamps that burn six seconds, berths three high, the cutting's tunnels over the roofs (the upper berth silver)
                      164-195  THE COAL TRUCKS   COMBINE  heaps to climb, the stack's sparks, the last points (tunnel vs sparks), the woken firemen; the engine-door shrine
                      196-263  THE FRONT CARS    BOSS     THE CONDUCTOR (src/conductor.js): two vans, the tender and the engine - the arena shrinks as he uncouples the vans
   CHECKPOINTS (Daniel: fewer): START, the dining car's vestibule (col 115) and the engine-door shrine (col 192). L.checkRun 200: the filler adds none.
   GRID: rows 0-9 sky; ROOF row 12 (stand at feet row 11); inside rows 13-17 (stand at 17); FLOOR row 18; chassis 19-20; under the train is THE TRACKS (a hero who falls
   between cars is caught at GT.catchY, hurt and put back on the train - never killed: src/ghost-train-hands.js). Placed wholly by hand (calm: nothing sprinkled). */
import { GT_RULE, GT_SAY } from './gt-lines.js';
import { CD } from './conductor.js';

export const GT = {
  W: 264, H: 28, ROOF: 12, FLOOR: 18, CLER: 10, WELL: 21, GAP: 2, DOOR: [15, 17], STEP: 15, TUB: 14,
  catchY: 21.5 * 16,              /* px: a hero whose feet pass this line is on THE TRACKS */
  wind: 26, gust: 64,             /* px/s pushed toward the back on an exposed deck; a told GUST */
  lampR: 72,                       /* px: how far a lamp's light reaches along its car */
  speed: 360,                      /* px/s: the train over the ground (the backdrop, and a tunnel's mouth sweeping down the train) */
  arena: { x0: 196, x1: 261, wallL: 195, wallR: 262, trigger: 198 },
};
export const SECTIONS = [['THE SIDING', 0, 36], ['THE PASSENGER CARS', 36, 96], ['THE DINING CAR', 96, 120], ['THE SLEEPING CARS', 120, 164], ['THE COAL TRUCKS', 164, 196], ['THE FRONT CARS', 196, 264]];

export function buildGhostTrain({ painter, T, TS }) {
  const { W, H, ROOF, FLOOR, CLER, WELL, STEP, TUB } = GT;
  const L = painter(W, H), { set, ent } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const block = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.SOLID), air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const shelf = (x0, x1, y) => fill(x0, x1, y, y, T.ONEWAY);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const cars = [], lamps = [], couplings = [], hatches = [], points = [], track = [], zones = [], sparks = [], brakes = [], props = [];
  /* A CAR. kind: van | well | coach | dining | sleeper | coal | tender | engine. Closed cars: a roof (row 12), end walls with a door (rows 15-17), a floor (18) and a chassis */
  const car = (kind, x0, x1, o = {}) => {
    const c = { i: cars.length, kind, x0, x1, closed: ['van', 'coach', 'dining', 'sleeper'].includes(kind), ...o }; cars.push(c);
    block(x0 + 1, x1 - 1, FLOOR + 1, FLOOR + 2);                                     /* the chassis (the bogies are drawn) */
    block(x0, x1, FLOOR, FLOOR);                                                       /* the floor */
    if (c.closed) { const b0 = c.balcony ? x0 + c.balcony : x0;
      block(b0, x1, ROOF, ROOF); block(b0, b0, ROOF, FLOOR - 1); block(x1, x1, ROOF, FLOOR - 1); air(b0, b0, GT.DOOR[0], GT.DOOR[1]); air(x1, x1, GT.DOOR[0], GT.DOOR[1]);
      c.roofRow = ROOF; c.body = [b0, x1]; }
    c.expose = c.closed ? ROOF * TS + 2 : kind === 'well' ? FLOOR * TS + 2 : kind === 'engine' ? 11 * TS + 2 : TUB * TS + 2;   /* feet y at or above this: on top, in the wind */
    return c; };
  /* THE GAP between two cars: the gangway plate (the coupling, row 18) and the step up to the roofs (row 15). The pin is struck from the car ahead */
  const gap = (a, b, o = {}) => { const g0 = a.x1 + 1, g1 = b.x0 - 1; shelf(g0, g1, FLOOR); if (!o.noStep) shelf(g0, g1, STEP);
    const cp = { id: 'cp' + couplings.length, g0, g1, behind: a.i, ahead: b.i, pinX: (g1 + 1) * TS - 4, pinY: FLOOR * TS - 6, arena: !!o.arena, cut: false };
    couplings.push(cp); ent('gtcoupling', g1, FLOOR - 1, { id: cp.id }); return cp; };
  /* A LAMP under a car's ceiling (row: its hanging row). lit: at the start; oil: seconds it burns once lit (0 = until put out); draught: a tunnel puts it out */
  const lamp = (c, x, o = {}) => { const d = { id: 'lp' + lamps.length, car: c.i, x: x * TS + 8, y: ((o.row ?? ROOF + 1) + 1) * TS - 4, col: x, lit: !!o.lit, oil: o.oil || 0, draught: o.draught !== false, r: o.r || GT.lampR };
    lamps.push(d); ent('gtlamp', x, o.row ?? ROOF + 1, { id: d.id }); return d; };
  /* A GHOST PASSENGER: it sleeps while a lit lamp's light reaches it and wakes in the dark (src/ghost-train-hands.js) */
  const ghost = (c, x, y, squad, o = {}) => ent('gtghost', x, y, { squad, car: c.i, ...o });
  const foe = (t, x, y, squad, o = {}) => ent(t, x, y, { squad, ...o });
  const hatch = (c, x) => { air(x, x + 1, ROOF, ROOF); hatches.push({ car: c.i, x0: x, x1: x + 1 }); ent('gthatch', x, ROOF - 1, {}); };
  /* THE POINTS: a lever (struck: straight <-> branch) and the junction it sets, met when the lead hero reaches column `at` */
  const junction = (id, lx, ly, at, straight, branch) => { points.push({ id, x: lx * TS + 8, y: (ly + 1) * TS, col: lx, at, set: 'straight' }); ent('gtpoints', lx, ly, { id });
    track.push({ id: 'j' + id, at, points: id, straight, branch }); };
  const heap = (x0, x1, xc, top, flat = 0) => { for (let x = x0; x <= x1; x++) block(x, x, Math.min(FLOOR - 1, top + Math.max(0, Math.abs(x - xc) - flat)), FLOOR - 1); };   /* a coal heap: one row a column up to its top (flat: half its plateau) */
  const tub = c => { block(c.x0, c.x0, TUB, FLOOR - 1); block(c.x1, c.x1, TUB, FLOOR - 1); };

  // ================= 1. THE SIDING (0-35): TEACH =================
  const van0 = car('van', 0, 17, { balcony: 3, name: "THE GUARD'S VAN" });            /* its rear balcony (0-2): where you board */
  ent('sign', 1, FLOOR - 1, { text: GT_SAY.board });
  sign(4, FLOOR - 1, GT_SAY.lamps);
  lamp(van0, 7, { lit: true, draught: false }); ghost(van0, 8, FLOOR - 1, 'guardVan', { teach: 'sleep' });   /* lit: it sleeps (look, do not touch) */
  lamp(van0, 14, { lit: false, draught: false }); ghost(van0, 14, FLOOR - 1, 'guardVan', { teach: 'wake' });  /* dark: it wakes - light the lamp and it sleeps again */
  coins([6, FLOOR - 1], [11, FLOOR - 1]); shelf(10, 12, STEP); coins([11, STEP - 1]);
  const well = car('well', 20, 33, { name: 'THE WELL WAGON' });
  gap(van0, well); sign(20, FLOOR - 1, GT_SAY.couple);
  air(23, 30, FLOOR, FLOOR + 2); block(23, 30, WELL, WELL + 1);                       /* the well: its floor slung low between the bogies (row 21) */
  /* THE FAIR'S RIDE riding in it: its two cars on the well floor (drawn, not footing: the well is crossed on its floor) and ITS PAINTED FACADE standing up out of the well - a dead end of cornices to climb (secret one at the top) */
  shelf(23, 24, 15); shelf(26, 27, 12); shelf(24, 25, 9); shelf(27, 28, 6); ent('silver', 28, 5); props.push({ kind: 'facade', x: 26, f: WELL });
  props.push({ kind: 'ridecar', x: 25, f: WELL }, { kind: 'ridecar', x: 28.5, f: WELL });
  foe('bat', 27, 15, 'wellBats', { perch: true }); foe('bat', 31, 14, 'wellBats', { perch: true });
  coins([25, WELL - 3], [28, WELL - 3]);
  sign(32, FLOOR - 1, GT_SAY.points); junction('P0', 31, FLOOR - 1, 36, { kind: 'tunnel', len: 520, tell: 1.8 }, { kind: 'gust', dur: 3, tell: 1.2 });
  ent('gtbridge', 33, ROOF - 1, {});

  // ================= 2. THE PASSENGER CARS (36-95): DEVELOP =================
  const c2 = car('coach', 36, 53, { name: 'THIRD CLASS' }); gap(well, c2);
  sign(37, FLOOR - 1, GT_SAY.roof); shelf(39, 50, STEP); hatch(c2, 44);
  lamp(c2, 40, { lit: true }); lamp(c2, 49, { lit: true });
  ghost(c2, 39, FLOOR - 1, 'thirdClass'); ghost(c2, 44, FLOOR - 1, 'thirdClass'); ghost(c2, 50, FLOOR - 1, 'thirdClass');   /* asleep - until the tunnel (straight on at P0) puts the lamps out */
  foe('bonearcher', 47, ROOF - 1, 'thirdRoof', { face: -1 });
  coins([42, STEP - 1], [46, STEP - 1], [52, ROOF - 1]);
  const c3 = car('coach', 56, 73, { name: 'THE DARK COACH' }); gap(c2, c3);
  shelf(58, 69, STEP); hatch(c3, 63);
  lamp(c3, 60, { lit: false, oil: 8 }); lamp(c3, 69, { lit: false, oil: 8 });       /* dark: light one and it burns eight seconds */
  ghost(c3, 59, FLOOR - 1, 'darkCoach'); ghost(c3, 64, FLOOR - 1, 'darkCoach'); ghost(c3, 70, FLOOR - 1, 'darkCoach'); ghost(c3, 66, STEP - 1, 'darkCoach');
  foe('bat', 61, 8, 'darkRoof', { perch: true }); foe('bat', 68, 9, 'darkRoof', { perch: true });
  coins([60, STEP - 1], [67, STEP - 1]);
  const c4 = car('coach', 76, 93, { name: 'FIRST CLASS' }); gap(c3, c4);
  lamp(c4, 80, { lit: true, draught: false }); lamp(c4, 89, { lit: true, draught: false });
  ghost(c4, 81, FLOOR - 1, 'firstClass'); ghost(c4, 88, FLOOR - 1, 'firstClass');
  foe('armour', 85, FLOOR - 1, 'firstClass', { face: -1 });                         /* THE GHOST-TRAIN RIDE'S SUIT OF ARMOUR: not a passenger - the lamps do not hold it */
  shelf(77, 79, 14); shelf(81, 82, 16); coins([78, 13]);                              /* THE LUGGAGE LOFT: rack to loft, over the first-class seats */
  coins([82, 15], [84, ROOF - 1], [90, ROOF - 1]);
  ent('gtbridge', 66, ROOF - 1, {});
  zones.push({ id: 'coachBridges', x0: 36, x1: 95, ev: { kind: 'bridge', len: 44, tell: 1.4 }, every: 6.5, phase: 2 });
  sign(91, ROOF - 1, GT_SAY.points2); junction('P1', 92, ROOF - 1, 96, { kind: 'tunnel', len: 2000, tell: 1.8 }, { kind: 'gust', dur: 6, tell: 1.2 });

  // ================= 3. THE DINING CAR (96-119): TWIST =================
  const c5 = car('dining', 96, 117, { name: 'THE DINING CAR' }); gap(c4, c5);
  air(101, 112, ROOF, ROOF); block(100, 113, CLER, CLER); block(100, 100, CLER, ROOF); block(113, 113, CLER, ROOF); air(101, 112, CLER + 1, ROOF);   /* the clerestory: a raised roof, a taller room */
  sign(97, FLOOR - 1, GT_SAY.dining);
  lamp(c5, 103, { lit: true, row: CLER + 1, r: 64 }); lamp(c5, 110, { lit: true, row: CLER + 1, r: 64 });   /* THE CHANDELIERS (draughty: the long tunnel puts them out) */
  shelf(101, 103, 16); shelf(106, 107, 16); shelf(110, 112, 16);                      /* the tables */
  for (const x of [101, 103, 106, 110, 112]) ghost(c5, x, 15, 'diners', { seat: true });
  foe('bonearcher', 108, CLER - 1, 'dinerRoof', { face: -1 });
  coins([102, 15], [111, 15], [106, CLER - 1]);
  ent('check', 115, FLOOR - 1);                                                       /* SHRINE ONE: the dining car's vestibule */

  // ================= 4. THE SLEEPING CARS (120-163): THE DARK EXAM =================
  const c6 = car('sleeper', 120, 139, { name: 'SLEEPER ONE' }); gap(c5, c6);
  sign(121, FLOOR - 1, GT_SAY.sleeper);
  shelf(122, 127, 16); shelf(122, 127, 14); shelf(131, 137, 16); shelf(131, 137, 14);   /* the berths, three high with the corridor floor */
  lamp(c6, 124, { lit: false, oil: 6 }); lamp(c6, 129, { lit: false, oil: 6 }); lamp(c6, 134, { lit: false, oil: 6 });
  ghost(c6, 123, 13, 'sleeperOne'); ghost(c6, 126, 15, 'sleeperOne'); ghost(c6, 133, 13, 'sleeperOne'); ghost(c6, 136, FLOOR - 1, 'sleeperOne');
  coins([125, 13], [135, 13]);
  const c7 = car('sleeper', 142, 161, { name: 'SLEEPER TWO' }); gap(c6, c7);
  shelf(144, 150, 16); shelf(144, 150, 14); shelf(153, 159, 16); shelf(153, 159, 14);
  lamp(c7, 146, { lit: false, oil: 6 }); lamp(c7, 151, { lit: false, oil: 6 }); lamp(c7, 157, { lit: false, oil: 6 });
  ghost(c7, 145, 15, 'sleeperTwo'); ghost(c7, 149, 13, 'sleeperTwo'); ghost(c7, 154, FLOOR - 1, 'sleeperTwo'); foe('boo', 152, FLOOR - 1, 'sleeperTwo');
  coins([158, 13]);                                                                   /* the upper berth over the last of the sleepers */
  zones.push({ id: 'cutting', x0: 120, x1: 163, ev: { kind: 'tunnel', len: 1500, tell: 1.4 }, every: 7.5, phase: 1.5 });   /* THE CUTTING: tunnel after tunnel over the sleepers' roofs - the exam is inside */
  ent('gtbridge', 140, ROOF - 1, {});

  // ================= 5. THE COAL TRUCKS (164-195): COMBINE =================
  const c8 = car('coal', 164, 177, { name: 'COAL TRUCK ONE' }); gap(c7, c8); tub(c8); heap(165, 176, 171, 6, 1); air(164, 164, 16, FLOOR - 1); air(165, 168, 16, FLOOR - 1); coins([166, FLOOR - 1], [168, FLOOR - 1]);   /* the heap stands high (a plateau over the trucks); a coal hole in its back */
  sign(163, STEP - 1, GT_SAY.coal);
  ghost(c8, 168, 8, 'firemen', { stoker: true }); ghost(c8, 174, 8, 'firemen', { stoker: true });   /* no lamp on a coal truck: its dead are awake */
  foe('bat', 170, 4, 'coalBats', { perch: true });
  junction('P2', 166, 10, 180, { kind: 'tunnel', len: 900, tell: 1.6 }, { kind: 'open' });
  coins([171, 4], [169, 6], [173, 6]);
  const c9 = car('coal', 180, 193, { name: 'COAL TRUCK TWO' }); gap(c8, c9); tub(c9); heap(181, 190, 186, 9);
  shelf(191, 192, 16); air(180, 180, 16, FLOOR - 1); air(181, 186, 16, FLOOR - 1); ent('silver', 186, FLOOR - 1);   /* THE COAL HOLE (secret two): a hatch in the truck's back, a crawl under the heap */
  foe('bonearcher', 186, 8, 'coalTwo', { face: -1 }); ghost(c9, 183, 11, 'coalTwo', { stoker: true });
  ent('check', 192, 15);                                                              /* SHRINE TWO: the engine door's (the front of the last coal truck) */
  sign(191, 15, GT_SAY.engineDoor);
  sparks.push({ id: 'stack', x0: 164, x1: 195, every: 3.4, n: 3, tell: 1.0, dmg: 12 });   /* the stack's sparks rain on the trucks while the line is open */

  // ================= 6. THE FRONT CARS (196-263): THE CONDUCTOR =================
  const vA = car('van', 196, 209, { name: 'THE MAIL VAN', arena: true }); const gA = gap(c9, vA);
  const vB = car('van', 212, 225, { name: "THE CONDUCTOR'S VAN", arena: true }); const cA = gap(vA, vB, { arena: true });
  const td = car('tender', 228, 239, { name: 'THE TENDER', arena: true }); const cB = gap(vB, td, { arena: true });
  block(228, 228, 16, FLOOR - 1); heap(230, 236, 233, 12);                           /* the tender: a low back, the coal heap, the shovelling plate in front (237-239) */
  const en = car('engine', 242, 261, { name: 'THE ENGINE', arena: true }); gap(td, en, { arena: true, noStep: true });
  block(242, 249, CLER, CLER); block(249, 249, CLER, FLOOR - 1);                     /* the cab roof and its backhead (the firebox door is in it) */
  block(250, 261, 11, FLOOR - 1); block(255, 255, 10, 10); block(259, 260, 7, 10);   /* the boiler, its dome, the stack */
  for (const c of [vA, vB]) lamp(c, Math.round((c.x0 + c.x1) / 2), { lit: true, draught: true });
  brakes.push({ id: 'bA', car: vA.i, x: (vA.x1 - 1) * TS + 8, y: 16 * TS + 8 }, { id: 'bB', car: vB.i, x: (vB.x1 - 1) * TS + 8, y: 16 * TS + 8 },
    { id: 'bT', car: td.i, x: 238 * TS + 8, y: FLOOR * TS - 10 }, { id: 'bE', car: en.i, x: 243 * TS + 8, y: 16 * TS + 8 });
  for (const b of brakes) ent('gtbrake', Math.floor(b.x / TS), Math.floor(b.y / TS), { id: b.id });
  ent('conductor', 204, FLOOR - 1, { face: -1 });
  ent('torch', 198, FLOOR - 1);

  const A = GT.arena;
  const arena = { x0: A.x0 * TS, x1: (A.x1 + 1) * TS, floor: FLOOR * TS, y0: 4 * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'conductor', music: 'boss3', tint: '#b8c8ff', tintA: 0.06,
    /* THE FIGHT'S GEOMETRY (src/conductor.js geom): his cars (west to east), the two couplings he cuts, the brakes, the firebox */
    cars: [vA, vB, td, en].map(c => c.i), cuts: [cA.id, cB.id], brakes: brakes.map(b => b.id), firebox: { x: 249 * TS - 2, y: FLOOR * TS }, cab: [242, 248] };
  void gA;
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 1, y: FLOOR - 1 }, pools: [], falls: [],
    arena, ghostTrain: true,
    gt: { cars, lamps, couplings, hatches, points, track, zones, sparks, brakes, props, sections: SECTIONS, speed: GT.speed },
    calm: [[0, W - 1, 0, H - 1]], noCoin: [[A.x0, W - 1, 0, H - 1]],
    checkRun: 200,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: A.x0, hi: W - 1, spots: 0, why: 'THE FRONT CARS: the boss arena - no squad stands in it' }],
    unlocks: [
      { kind: 'gtlamp', opens: 'the dead sleep in its light (struck: lit or put out)', hud: 'LIT / OUT' },
      { kind: 'gtcoupling', opens: 'the car behind is left on the line with whatever woke on it', hud: GT_SAY.cut },
      { kind: 'gtpoints', opens: 'the track: straight on into the tunnel, or the branch', hud: GT_SAY.pointsBranch },
      { kind: 'gtbrake', opens: 'THE CONDUCTOR thrown and open', hud: 'EMERGENCY BRAKE!' },
    ],
    duskStart: -1, duskLen: 1, music: 'chase', night: true, glowNight: true,
    hullZones: cars.map(c => [c.x0, c.x1, c.kind === 'coal' ? 4 : c.kind === 'engine' ? 6 : CLER - 1, FLOOR + 2]).concat([[23, 28, 4, WELL + 1]]),   /* THE CARS ARE THE FRAMES (tools/solid-islands.mjs): every board of the train rides on its car's drawn body and bogies; the cornices on the ride's facade */
    interiors: cars.filter(c => c.closed).map(c => [c.body[0] + 1, c.x1 - 1, ROOF + 1, FLOOR - 1, 'carriage']),
    palette: { sky: [[14, 16, 34], [52, 48, 86]], far: 'fields', mid: 'fields', near: 'fields', dress: 'none', ledges: 'beam', haze: 'rgba(150,170,230,0.10)',
      dirt: '#3a3440', dirtL: '#5a5266', dirtD: '#221e2a', grass: '#4a4258', grassL: '#6a6080', grassD: '#2a2436' },
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    reachExact: false,
    gtRule: GT_RULE, gtCd: CD.hp,
  };
}
