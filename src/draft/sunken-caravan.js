// src/draft/sunken-caravan.js — THE SUNKEN CARAVAN as a GREYBOX DRAFT: the level's structure, not the level. It is not in
// LEVELS and nothing loads it. It exists so the layout can be measured against the rules before a build session spends
// time on it (tools/caravan-level.mjs), and so that session starts from a plan that already passes them.
// Brief: .claude/briefs/sunken-caravan.md as amended by docs/desert-arc-brief.md (no storm act: the storm belongs to the
// pyramids). The creatures are the level's: the scorpion, the vulture and, since 2026-09-25 (no goblins: docs/briefs/caravan-ruins-
// bandits.md), the bandits - the cutthroat, the rooftop slinger and the sand-cloaked ambusher. The roster below is for measuring
// density only (the build takes it out and the GARRISON row puts the crowd down); an ent with placed: true is put where it is on
// purpose (RULES S1) and the build keeps it.
//
// THE RULE: THE SUN. Open sand is sunlight and builds SUNSTROKE; shade resets it (src/sunstroke.js). Said three ways (C4):
// the heat haze and the swimming view, the violet of every shade on the screen, and the signs and the lone awning in section 1.
//
// SEVEN SECTIONS (F1), each named in L.sections:
//   1 THE WAY DOWN        off the tower's hill onto the sand: the first slopes, the first shade, the rule taught
//   2 THE CARAVAN ROAD    wagons half under the dunes along the old road; THE LEAD WAGON (landmark): up its tipped bed
//   3 THE OX LINE         the dead oxen of the caravan; first quicksand; THE GREAT RIBCAGE (landmark): climb its ribs, swing
//                         from its spine over a quicksand basin, rest in its shade
//   4 THE DUNE SEA        the big dunes; vultures (their shadows are shade that moves); a rock arch for shade;
//                         THE LONG SLIDE (landmark): slide down, jump the quicksand basin at its foot
//   5 THE TRADERS' CAMP   bandits looting the caravan's camp; THE AWNING WINCH (F5, the machine, and a landmark): wind the
//                         great awning out over the yard and the yard is shade; wind it in and the looters are in the sun
//   6 THE SINKING WAY     a quicksand field crossed on wagon tops; THE SINKING CARAVANSERAI (landmark): a stone tower half
//                         swallowed, in through the door, up inside, out on the roof
//   7 THE HOLLOW'S RIM    the ground trembles, ripples cross the sand; THE LAST TOWER over the exam (RULES S3); the way down
//                         into THE WORM'S HOLLOW (the arena)
// THE RUINS (Daniel, 2026-09-25: "taller buildings and more of them... towers... in ruin"; docs/briefs/caravan-ruins-bandits.md): a
// town stood here before the caravan road, and its bones come up through the sand. FOUR TALL TOWERS you climb (in at the foot, up
// ledges two rows apart, out of a hatch onto the roof where a slinger stands): THE WATCHTOWER at the road's end, THE TWIN TOWERS
// either side of the caravanserai in the sinking way (the three make THE ROOFTOP ROUTE), THE LAST TOWER on the rim. Half-buried
// HOUSES you walk through, WALLS with their lintels still on, and ruin faces behind the play. All of it is shade (the reason SUN
// maxWalk can be 5 s), all of it is L.masonry (tools/architecture.mjs holds it up: B9), and the garrison keeps off it (L.calm).
// VERBS (F3): jump, the SLIDE (new to the game), climb (the ribs' rungs), swing (the spine's ropes), a machine (the winch),
// block (the scorpion's claw, the spray). FURNITURE (F7): 3 silvers, 3 strays, a relic (the camp), checkpoints to B6.
import { SLOPE } from '../slopes.js';

export const CARAVAN_H = 40, CARAVAN_BASE = 30;   // lvl 0 is ground row 30
const TS = 16;
/* the ground, as pieces (as in the Dune Yard): F flat, R1/L1 steep up/down a row, R2/L2 gentle, QS a quicksand column (a
   one-row pit with a quicksand zone on its surface), '#name' starts a section, '@name' marks a landmark's first column */
const P = (s) => s.trim().split(/\s+/).flatMap(t => { const m = t.match(/^([A-Z0-9]+)x(\d+)$/); return m ? Array(+m[2]).fill(m[1]) : [t]; });
export const CARAVAN_PIECES = [
  /* THE RUINS' GROUND (2026-09-25): a flat for every house and tower (@house*, @tower*, @lintel), and the quicksand the road JUMPS is
     three tiles (RULES S2: a real jump is ~3.2; none on the main road asks for more than 3.0 - the ribcage's basin is crossed on its
     spine, not jumped), with firm ground either side of every pit and never a pit at a door (a jump from under a lintel is no jump) */
  ...P(`#waydown @gate Fx8 L2 L2 Fx4 L1 L1 Fx4 L2 L2 Fx6 @awning1 Fx4 R1 R1 Fx3 L1 L1 @house1 Fx8 R2 R2 Fx2 L2 L2 Fx6`),                 // down from lvl 6 to 0
  ...P(`#road Fx4 @wagon1 Fx6 R2 R2 Fx3 L2 L2 Fx6 @leadwagon Fx8 R1 R1 @house2 Fx7 L1 L1 Fx4 R2 Fx2 R1 Fx2 L1 L2 Fx5 @wagon3 Fx6 L1 Fx4 R1 @towerA Fx9 R2 R2 Fx2 L2 L2`),
  ...P(`#oxline Fx6 QSx3 Fx4 @oxwreck R2 R2 Fx2 L2 L2 Fx4 QSx3 Fx4 @ribcage Fx3 QSx8 Fx3 Fx5 R1 R1 Fx3 L1 L1 QSx3 Fx1 @house3 Fx7 R2 Fx2 L2 Fx2`),
  ...P(`#dunesea R1 R1 R1 Fx3 L1 L1 Fx3 R2 R2 R2 Fx2 L2 L2 @arch Fx8 L2 Fx3 @slide R1 R1 R1 R1 R1 Fx3 L1 L1 L1 L1 L1 QSx3 @landing Fx5 R2 Fx3 L2 Fx2 L1 Fx4`),
  ...P(`#camp Fx4 R2 Fx2 L2 @winch Fx4 Fx30 @tent Fx8 R1 Fx3 L1 Fx4 L2 @towngate Fx6`),
  ...P(`#sinking Fx4 QSx3 @isle1 Fx3 QSx3 Fx4 @towerB Fx7 Fx3 @caravanserai Fx7 Fx3 @towerC Fx7 Fx4 QSx3 @isle2 Fx3 QSx3 Fx3 R1 Fx4 L1 Fx3 @house5 Fx7 Fx4`),
  ...P(`#rim Fx4 QSx3 @isle3 Fx3 QSx3 Fx4 @towerD Fx7 Fx3 QSx3 @isle4 Fx3 QSx3 @exland Fx4 @rimshade R1 R1 Fx3 L1 L2 Fx6 @lintel Fx6 L1 L1 L1 L1 Fx10 #arena Fx40`),
];
export function buildSunkenCaravan(T) {
  const base = CARAVAN_BASE, H = CARAVAN_H;
  // ---- the ground, column by column ----
  const cols = []; let lvl = 6; const marks = {}, sections = {}, qs = [];
  for (const p of CARAVAN_PIECES) {
    if (p[0] === '#') { sections[p.slice(1)] = cols.length; continue; }
    if (p[0] === '@') { marks[p.slice(1)] = cols.length; continue; }
    if (p === 'F') cols.push({ lvl, t: 'F' });
    else if (p === 'QS') cols.push({ lvl, t: 'QS' });
    else if (p === 'R1') { lvl++; cols.push({ lvl, t: SLOPE.R1 }); }
    else if (p === 'L1') { cols.push({ lvl, t: SLOPE.L1 }); lvl--; }
    else if (p === 'R2') { lvl++; cols.push({ lvl, t: SLOPE.R2A }, { lvl, t: SLOPE.R2B }); }
    else if (p === 'L2') { cols.push({ lvl, t: SLOPE.L2B }, { lvl, t: SLOPE.L2A }); lvl--; }
    else throw new Error('piece ' + p);
  }
  const W = cols.length + 2, grid = new Uint8Array(W * H);
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const rockFrom = (x, y) => { for (let yy = y; yy < H; yy++) set(x, yy, T.SOLID); };
  const top = x => base - cols[Math.min(cols.length - 1, Math.max(0, x))].lvl;   // the ground row of column x
  cols.forEach((c, x) => { const r = base - c.lvl;
    if (c.t === 'F') rockFrom(x, r);
    else if (c.t === 'QS') { rockFrom(x, r + 1); const last = qs[qs.length - 1]; if (last && last.x1 === x * TS && last.y === r * TS) last.x1 = (x + 1) * TS; else qs.push({ x0: x * TS, x1: (x + 1) * TS, y: r * TS }); }
    else { set(x, r, c.t); rockFrom(x, r + 1); } });
  for (let y = 0; y < H; y++) { set(W - 2, y, T.SOLID); set(W - 1, y, T.SOLID); }
  const ents = [], ent = (t, x, y, extra = {}) => ents.push({ t, x, y, ...extra }), on = x => top(x) - 1;   // the cell a thing stands in on column x
  const shade = [], moversExtra = [];
  // ---- THE RUINS: laid stone (L.masonry), their insides rooms (L.interiors 'ruin') and shade, the garrison kept off them (L.calm) ----
  const masonry = [], facades = [], interiors = [], calm = [], roofs = {};
  /* A TOWER, w wide and h rows tall on its column's ground: two walls and a roof, a door at the foot of each wall (you walk through it
     in the shade), ledges inside two rows apart (E4: so h is even) from alternate walls up to a two-tile hatch, and a broken crown: `crown` is how
     many rows each corner still stands over the roof. roofs[name] = { x0, x1, row (the roof's row), hatch: [a, b] } */
  const tower = (name, x0, h, { w = 7, doorL = true, doorR = true, crown = [1, 3] } = {}) => {
    const g = top(x0), roof = g - h, x1 = x0 + w - 1;
    for (let x = x0; x <= x1; x++) for (let y = roof; y < g; y++) set(x, y, (x === x0 || x === x1 || y === roof) ? T.SOLID : T.AIR);
    for (let y = g - 3; y < g; y++) { if (doorL) set(x0, y, T.AIR); if (doorR) set(x1, y, T.AIR); }
    if (doorL) facades.push([x0, x0, g - 3, g - 1, 'ruindoor']); if (doorR) facades.push([x1, x1, g - 3, g - 1, 'ruindoor']);   /* the wall comes down to the sand either side of its door */
    let k = 0, left = true; for (let y = g - 2; y >= roof + 2; y -= 2, k++) { left = k % 2 === 0; for (let x = left ? x0 + 1 : x1 - 3; x <= (left ? x0 + 3 : x1 - 1); x++) set(x, y, T.ONEWAY); }
    const hatch = left ? [x0 + 1, x0 + 2] : [x1 - 2, x1 - 1]; for (const x of hatch) set(x, roof, T.AIR);          /* over the last ledge */
    for (let y = roof - crown[0]; y < roof; y++) set(x0, y, T.SOLID); for (let y = roof - crown[1]; y < roof; y++) set(x1, y, T.SOLID);
    const crownTop = roof - Math.max(crown[0], crown[1]);
    masonry.push([x0, x1, crownTop, g - 1, 'ruin']); interiors.push([x0 + 1, x1 - 1, roof + 1, g - 1, 'ruin']); calm.push([x0 - 1, x1 + 1, crownTop - 4, g]);
    shade.push([(x0 + 1) * TS, x1 * TS, (roof + 1) * TS, g * TS + 1]);                                          /* inside it is shade (its roof is too high for the overhang rule) */
    roofs[name] = { x0, x1, row: roof, hatch }; };
  /* A HALF-BURIED HOUSE: a tower one storey high and no ledges - you walk in at one door and out of the other, in its shade */
  const house = (name, x0, { w = 7, crown = [0, 1] } = {}) => { const g = top(x0), roof = g - 6, x1 = x0 + w - 1;
    for (let x = x0; x <= x1; x++) for (let y = roof; y < g; y++) set(x, y, (x === x0 || x === x1 || y === roof) ? T.SOLID : T.AIR);
    for (let y = g - 3; y < g; y++) { set(x0, y, T.AIR); set(x1, y, T.AIR); }
    facades.push([x0, x0, g - 3, g - 1, 'ruindoor'], [x1, x1, g - 3, g - 1, 'ruindoor']);
    for (let y = roof - crown[0]; y < roof; y++) set(x0, y, T.SOLID); for (let y = roof - crown[1]; y < roof; y++) set(x1, y, T.SOLID);
    set(x0 + 2 + (x0 % 3), roof, T.AIR);                                                                          /* a hole in its roof where the beams went */
    masonry.push([x0, x1, roof - Math.max(...crown), g - 1, 'ruin']); interiors.push([x0 + 1, x1 - 1, roof + 1, g - 1, 'ruin']); calm.push([x0 - 1, x1 + 1, roof - 4, g]);
    shade.push([(x0 + 1) * TS, x1 * TS, (roof + 1) * TS, g * TS + 1]); roofs[name] = { x0, x1, row: roof }; };
  /* A WALL WITH ITS LINTEL STILL ON: two piers drawn behind the play (L.facades: the road runs between them, not into them) and the
     lintel over them five rows up - inside SUN.roof, so under it is shade - laid stone the piers hold (B9) */
  const lintel = (x0, x1) => { const g = top(x0), r = g - 5;
    for (let x = x0; x <= x1; x++) set(x, r, T.SOLID); set(x0 + 1, r - 1, T.SOLID); set(x1, r - 1, T.SOLID);   /* and a course of it still over the ends */
    masonry.push([x0, x1, r - 1, r, 'ruin']); facades.push([x0, x0, r + 1, g - 1, 'ruin'], [x1, x1, r + 1, g - 1, 'ruin']);
    shade.push([x0 * TS, (x1 + 1) * TS, r * TS, g * TS + 1]); calm.push([x0 - 1, x1 + 1, r - 4, g]); };
  /* A RUIN FACE behind the play: a wall of the old town standing in the dunes, nothing you touch (on a flat, so it stands on sand) */
  const face = (x0, x1, h) => { const g = top(x0); facades.push([x0, x1, g - h, g - 1, 'ruin']); };
  lintel(marks.gate + 2, marks.gate + 7);                                   // THE OLD TOWN'S GATE: you start in its shade, and step out into the sun
  house('house1', marks.house1); house('house2', marks.house2, { crown: [1, 0] }); house('house3', marks.house3 + 0, { crown: [2, 0] }); house('house5', marks.house5, { crown: [1, 2] });
  tower('towerA', marks.towerA + 1, 12, { crown: [2, 4] });                 // THE WATCHTOWER, alone at the end of the caravan road
  tower('towerB', marks.towerB, 12, { crown: [3, 0] });                     // THE TWIN TOWERS of the ruined town, the caravanserai between them:
  tower('towerC', marks.towerC, 8, { crown: [0, 6] });                      //   B's roof (12), the caravanserai's (9) and C's (8, its far corner standing six more) are THE ROOFTOP ROUTE, three tiles apart
  tower('towerD', marks.towerD, 14, { crown: [2, 3] });                     // THE LAST TOWER, over the exam on the rim
  lintel(marks.lintel, marks.lintel + 5);                                   // the rim's last shade before the hollow: THE FIRST KNIFE holds it
  lintel(marks.towngate, marks.towngate + 5);                               // THE TOWN GATE, out of the camp and into the ruined town
  face(marks.landing + 1, marks.landing + 4, 4); face(marks.tent + 1, marks.tent + 5, 5); face(marks.arch + 2, marks.arch + 5, 3);   // the old town's walls, behind the play

  // ---- 1 THE WAY DOWN: the standard, the rule taught, the lone awning ----
  /* THE CHECKPOINTS ARE SPACED, NOT SPRINKLED (RULES S4, 2026-09-25): 40 to 72 route tiles apart - 72 because src/level.js
     checkpoints() fills any longer run itself, and one filled on the rim would stand in the exam (S3). The ambush room's door (the
     camp's) and the arena's are the only ones allowed closer. Each is placed with its section below; the list, left to right:
     5, the road's head, the ribcage, under the arch, the yard's door, the town gate, between the caravanserai and the second twin
     tower, the rim (THE EXAM starts here), outside the arena */
  ent('standard', 3, on(3)); ent('check', 5, on(5));
  ent('sign', 8, on(8), { text: 'THE SUN IS OUT HERE. STAND IN IT TOO LONG AND IT TAKES YOU. SHADE PUTS IT RIGHT.' });
  ent('awning', marks.awning1 + 2, on(marks.awning1 + 2)); ent('sign', marks.awning1 - 3, on(marks.awning1 - 3), { text: 'SHADE.' });
  // ---- 2 THE CARAVAN ROAD ----
  ent('wagon', marks.wagon1 + 3, on(marks.wagon1 + 3));
  { const x = marks.leadwagon; ent('wagon', x + 3, on(x + 3), { lead: true });                 // THE LEAD WAGON: its tipped bed is a ledge
    for (let i = 0; i < 4; i++) set(x + 1 + i, top(x) - 3, T.PLANK); ent('silver', x + 3, top(x) - 7);   // a silver over the bed: up on the wagon, then a jump
    }
  ent('wagon', marks.wagon3 + 3, on(marks.wagon3 + 3)); ent('check', sections.road - 5, on(sections.road - 5)); ent('check', marks.wagon3 - 4, on(marks.wagon3 - 4));
  // ---- 3 THE OX LINE: bones, the first quicksand, THE GREAT RIBCAGE ----
  const firm = x => { while (cols[x] && cols[x].t === 'QS') x++; return x; };
  for (const dx of [2, 16, 30]) { const x = firm(sections.oxline + dx); ent('deco', x, on(x), { kind: dx === 16 ? 'ribs' : 'skull' }); }
  ent('wagon', marks.oxwreck - 2, on(marks.oxwreck - 2), { wreck: true });   /* (its checkpoint at the ox line's head went: nineteen tiles from the ribcage's, RULES S4) */
  { const x0 = marks.ribcage, x1 = x0 + 13, spine = top(x0) - 7;                                 // ribs up both ends, the spine across
    for (const rx of [x0, x0 + 1, x1 - 1, x1]) for (let y = spine + 1; y < top(rx); y++) set(rx, y, T.NET);
    for (let x = x0; x <= x1; x++) set(x, spine, T.ONEWAY);
    for (const px0 of [x0 + 5, x0 + 9]) moversExtra.push({ kind: 'swing', px: px0 * TS + 8, py: (spine + 1) * TS, arm: 56, x: 0, y: 0, w: 32, h: 8, period: 3.2, phase: px0 === x0 + 5 ? 0 : 1.6 });
    shade.push([x0 * TS, (x1 + 1) * TS, spine * TS, top(x0) * TS + 1]);                          // its shade
    ent('silver', x0 + 7, spine - 1); ent('check', x0 - 2, on(x0 - 2)); }
  // ---- 4 THE DUNE SEA: the arch, THE LONG SLIDE ----
  { const x0 = marks.arch, r = top(x0); for (let x = x0 - 3; x <= x0 + 7; x++) set(x, r - 4, T.SOLID);   /* reaching back over the slope, a jump from the crest */   // THE ARCH: a sandstone lintel 4 rows up - shade under it (roofShade) -
    ent('deco', x0, on(x0), { kind: 'archPillar', behind: true }); ent('deco', x0 + 7, on(x0 + 7), { kind: 'archPillar', behind: true });   // - on two pillars drawn BEHIND the road (solid ones walled it off)
    ent('stray', x0 + 3, r - 5);
    ent('wagon', sections.dunesea + 4, on(sections.dunesea + 4), { wreck: true }); }               // a wreck on the first crest: shade between the ribcage and the arch                                                                                                          // a stray on top: a two-row jump from the crest before it
  { const x0 = marks.slide; ent('sign', x0 - 2, on(x0 - 2), { text: 'DOWN ON A SLOPE AND YOU SLIDE. JUMP AT THE BOTTOM AND THE SAND WILL NOT HAVE YOU.' });
    ent('silver', x0 + 5 + 1, top(x0 + 6) - 3); ent('check', marks.arch + 1, on(marks.arch + 1));
    ent('wagon', marks.landing + 3, on(marks.landing + 3), { wreck: true }); }                         // the wreck the slide jump lands by: shade after the long dune
  // ---- 5 THE TRADERS' CAMP: the winch, the great awning, the tent and its relic ----
  { const x0 = marks.winch, yard = [x0 + 6, x0 + 30];
    ent('winch', x0 + 2, on(x0 + 2), { canopy: { x0: yard[0], x1: yard[1], row: top(x0) - 5 } });                        // THE AWNING WINCH (F5): rolls the canopy out over the yard
    ent('deco', yard[0], on(yard[0]), { kind: 'canopyPost', behind: true }); ent('deco', yard[1], on(yard[1]), { kind: 'canopyPost', behind: true });   // its posts, drawn behind (B9)
    for (const [cx, hgt] of [[yard[0] + 5, 1], [yard[0] + 6, 2], [yard[0] + 14, 1], [yard[0] + 20, 2], [yard[0] + 21, 1]]) for (let y = top(cx) - hgt; y < top(cx); y++) set(cx, y, T.CRATE);   // the cargo, stacked: steps
    for (let x = yard[0] + 9; x <= yard[0] + 12; x++) set(x, top(x) - 3, T.PLANK);                                      // a market stall's board
    ent('awning', x0 - 3, on(x0 - 3)); ent('awning', marks.tent + 10, on(marks.tent + 10)); ent('check', x0, on(x0));
    const t0 = marks.tent; for (let i = 0; i < 5; i++) set(t0 + i, top(t0) - 3, T.PLANK); ent('relic', t0 + 2, top(t0) - 4);   // the trader's platform, the relic on it
    ent('sign', x0 + 4, on(x0 + 4), { text: 'THE CAMP WINCH ROLLS THE GREAT AWNING OUT. ROLL IT BACK AND THEY BURN.' }); }
  // ---- 6 THE SINKING WAY: wagon tops over the quicksand, THE SINKING CARAVANSERAI ----
  for (const q of qs.filter(q => q.x0 >= sections.sinking * TS && q.x1 <= sections.rim * TS)) { const a = q.x0 / TS, b = q.x1 / TS; if (b - a >= 5) { const mid = Math.floor((a + b) / 2) - 1; for (let i = 0; i < 3; i++) set(mid + i, q.y / TS - 2, T.PLANK); ent('wagon', mid + 1, q.y / TS, { sunk: true }); } }   // a sunk wagon's top to stand on
  /* THE ISLANDS (2026-09-25): three firm tiles between two three-tile pits, a jump each way (RULES S2), a sunk wagon's roof showing on
     each (dressing, not a wagon's lee: it is under the sand to its eaves) */
  for (const k of ['isle1', 'isle2', 'isle3', 'isle4']) ents.push({ t: 'deco', x: marks[k] + 1, y: on(marks[k] + 1), kind: 'wagonSunk', v: 1 });
  { const x0 = marks.caravanserai, g = top(x0), roof = g - 9;                                      // a stone tower, sunk: walls, a door, a floor inside, the roof
    for (let x = x0; x <= x0 + 6; x++) for (let y = roof; y < g; y++) set(x, y, T.SOLID);
    for (let x = x0 + 1; x <= x0 + 5; x++) for (let y = roof + 1; y < g; y++) set(x, y, T.AIR);
    for (let y = g - 3; y < g; y++) set(x0, y, T.AIR);                                            // the door
    for (let x = x0 + 1; x <= x0 + 5; x++) set(x, g - 3, T.ONEWAY); for (let x = x0 + 3; x <= x0 + 5; x++) set(x, g - 6, T.ONEWAY);   // up inside it, a jump (3 rows) at a time
    for (let x = x0 + 4; x <= x0 + 5; x++) set(x, roof, T.AIR);                                   // the hatch to the roof: TWO tiles (F9 walk, 2026-09-24: through one, only a jump from dead under it got out, and the play bot never found it)
    shade.push([(x0 + 1) * TS, (x0 + 6) * TS, (roof + 1) * TS, g * TS + 1]);                     // inside it is shade (its roof is too high for the overhang rule)
    ent('stray', x0 + 2, g - 4); ent('check', x0 + 9, on(x0 + 9)); ent('check', marks.towngate + 2, on(marks.towngate + 2)); ent('check', sections.rim + 1, on(sections.rim + 1));
    masonry.push([x0, x0 + 6, roof, g - 1, 'ruin']); facades.push([x0, x0, g - 3, g - 1, 'ruindoor']); calm.push([x0 - 1, x0 + 7, roof - 4, g]); roofs.caravanserai = { x0, x1: x0 + 6, row: roof }; }
  // ---- 7 THE HOLLOW'S RIM, and THE WORM'S HOLLOW ----
  const ax0 = sections.arena, ax1 = ax0 + 39, floor = top(ax0);
  ent('check', ax0 - 3, on(ax0 - 3));                                                              // B6: one outside the arena walls
  ent('sign', sections.rim + 2, on(sections.rim + 2), { text: 'THE GROUND IS MOVING.' });
  ent('awning', marks.rimshade - 2, on(marks.rimshade - 2), { torn: true });                          // a torn lean-to on the rim
  for (const dx of [8, 20, 32]) ent('wagon', ax0 + dx, on(ax0 + dx), { wreck: true });              // the three wrecks: the places to make THE OPENING
  /* THE RIM'S OVERHANG (Daniel, 2026-09-23) - THE ONE PIECE OF SHADE THE WORM CANNOT TAKE. The hollow's shade used to be
     the three wrecks and nothing else, and phase 2 SMASHES every wreck it sticks in (src/dune-worm.js), so past phase 2
     there was no shade left in the arena at all - while the brief says in the same breath that the sun keeps working in
     there and to fight in the shade when you can. Sunstroke's first damage lands at 6.5 s of open sun (9.7 s until 2026-09-25) and the fight runs
     far longer, so the level's own rule turned unanswerable exactly where it should bite hardest: A12, the room ceasing
     to supply what the rule assumes. Built as a lintel of the rim's own sandstone, the same way THE ARCH is built in the
     dune sea - its pillars are decoration drawn BEHIND, so they never wall the hollow off. */
  const ovL = ax0 + 2, ovR = ax0 + 8, ovRow = floor - 5;                                           /* 5 rows up: inside SUN.roof, and clear over the breach column */
  for (let x = ovL; x <= ovR; x++) set(x, ovRow, T.SOLID);
  ent('deco', ovL, on(ovL), { kind: 'archPillar', behind: true }); ent('deco', ovR, on(ovR), { kind: 'archPillar', behind: true });
  shade.push([ovL * TS, (ovR + 1) * TS, ovRow * TS, floor * TS + 1]);                              /* said as a rect too, so a tool with no tileAt still sees it */
  const arena = { x0: ax0 * TS, x1: (ax1 + 1) * TS, floor: floor * TS, trigger: (ax0 + 5) * TS, wallL: ax0 - 1, wallR: ax1 + 1, boss: 'duneworm', music: 'boss2', tint: '#e2bb7a', tintA: 0.1, fx: 'sand' };

  // ---- PLACED, NOT CROWDED (RULES S1, 2026-09-25): each of these is a foe and the ground making one problem together, and the build
  //      keeps them where they are (placed: true). The garrison below is the crowd between them ----
  const onRoof = (r, dx) => ({ x: dx === undefined ? (r.hatch && r.hatch[0] <= r.x0 + 2 ? r.x1 - 1 : r.x0 + 1) : r.x0 + dx, y: r.row - 1 });   /* no dx: the end of the roof away from its hatch */
  const S1 = [
    ['slinger', onRoof(roofs.towerA), 'THE WATCHTOWER\'s slinger stones the open road you have to cross to reach his door'],
    ['slinger', onRoof(roofs.towerB), 'the slinger on the first twin tower covers the two pits and the island in front of it'],
    ['cutthroat', onRoof(roofs.caravanserai, 2), 'a cutthroat at the top of the caravanserai\'s climb: you come up out of the hatch into him'],
    ['slinger', onRoof(roofs.towerC), 'the second twin tower\'s slinger covers the rooftop jump and the two pits past the town'],
    ['slinger', onRoof(roofs.towerD), 'THE LAST TOWER\'s slinger covers four pits of the exam, two either side of his tower'],
    ['ambusher', { x: marks.house3 + 3, y: on(marks.house3 + 3) }, 'under the sand inside the ox line\'s house, where the pit\'s jump lands you'],
    ['ambusher', { x: marks.landing + 2, y: on(marks.landing + 2) }, 'at the landing of the long slide\'s jump'],
    ['ambusher', { x: marks.isle2 + 1, y: on(marks.isle2 + 1) }, 'on the island between the two pits past the town: you land on him'],
    ['ambusher', { x: marks.exland + 1, y: on(marks.exland + 1) }, 'THE EXAM: at the landing of the last tower\'s second pit, under the slinger'],
  ];
  for (const [t, p, why] of S1) ent(t, p.x, p.y, { placed: true, why, face: -1 });
  for (let i = 0; i < 10; i++) ent('coin', roofs.towerB.x0 + 1 + (i % 5), roofs.towerB.row - 2 - Math.floor(i / 5));   /* THE HARD ROAD PAYS (S7): the rooftop route starts on the tallest roof in the town */
  ent('stray', roofs.towerA.x0 + 4, roofs.towerA.row - 1);                                                                /* and the watchtower's top keeps a stray (it was on the dune crest past the lead wagon) */
  // ---- THE GARRISON (a draft of the level's GARRISON row, placed so it can be measured): ~4 a screen, 3 in the first ----
  const ROSTER = { waydown: ['scorpion', 'cutthroat'], road: ['scorpion', 'cutthroat', 'vulture', 'scorpion'], oxline: ['cutthroat', 'scorpion', 'vulture', 'cutthroat'],
    dunesea: ['vulture', 'scorpion', 'cutthroat', 'vulture'], camp: ['cutthroat', 'scorpion', 'cutthroat', 'scorpion'], sinking: ['cutthroat', 'scorpion', 'vulture', 'cutthroat'], rim: ['scorpion', 'cutthroat', 'cutthroat', 'vulture'] };
  const secOf = x => { let s = 'waydown'; for (const [k, v] of Object.entries(sections)) if (k !== 'arena' && x >= v) s = k; return s; };
  const busy = new Set(ents.filter(e => ['check', 'sign', 'relic', 'standard', 'winch'].includes(e.t) || e.placed).map(e => e.x));
  const inCalm = x => calm.some(c => x >= c[0] && x <= c[1]);
  const standOK = x => { const c = cols[x]; if (!c || c.t === 'QS' || inCalm(x)) return false; const r = top(x); for (let y = r - 3; y < r; y++) if (grid[y * W + x] !== T.AIR) return false; return ![x - 1, x, x + 1].some(v => busy.has(v)); };
  let k = 0;
  for (let w0 = 0; w0 + 24 <= ax0 - 1; w0 += 24) { const sec = secOf(w0), n = sec === 'waydown' ? 3 : 4;
    for (let i = 0; i < n; i++) { let x = w0 + 3 + Math.floor(i * 20 / n); while (x < w0 + 23 && !standOK(x)) x++; if (x >= w0 + 23) continue;
      const t = ROSTER[sec][k++ % ROSTER[sec].length]; ent(t, x, t === 'vulture' ? top(x) - 7 : on(x)); busy.add(x); } }

  return { W, H, grid, ents, START: { x: 6, y: on(6) }, pools: [], falls: [], moversExtra, interiors, masonry, facades, calm, roofs, sections, marks, arena, quicksand: qs, shade,
    draft: true, palette: { set: 'desert' }, rule: 'THE SUN', lengthCols: ax0 };
}
/* for tools/draft-level.mjs (tools/caravan-level.mjs is this level's own, older check; both must pass) */
export const build = buildSunkenCaravan;
export const meta = { name: 'THE SUNKEN CARAVAN', orientation: 'h', landmarks: ['leadwagon', 'ribcage', 'slide', 'winch', 'caravanserai'], sun: true, density: [3.5, 4.5], foes: ['scorpion', 'vulture', 'cutthroat', 'slinger', 'ambusher'] };
