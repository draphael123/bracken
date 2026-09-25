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
//   7 THE HOLLOW'S RIM    the ground trembles, ripples cross the sand; the way down into THE WORM'S HOLLOW (the arena)
// VERBS (F3): jump, the SLIDE (new to the game), climb (the ribs' rungs), swing (the spine's ropes), a machine (the winch),
// block (the scorpion's claw, the spray). FURNITURE (F7): 3 silvers, 3 strays, a relic (the camp), checkpoints to B6.
import { SLOPE } from '../slopes.js';

export const CARAVAN_H = 40, CARAVAN_BASE = 30;   // lvl 0 is ground row 30
const TS = 16;
/* the ground, as pieces (as in the Dune Yard): F flat, R1/L1 steep up/down a row, R2/L2 gentle, QS a quicksand column (a
   one-row pit with a quicksand zone on its surface), '#name' starts a section, '@name' marks a landmark's first column */
const P = (s) => s.trim().split(/\s+/).flatMap(t => { const m = t.match(/^([A-Z0-9]+)x(\d+)$/); return m ? Array(+m[2]).fill(m[1]) : [t]; });
export const CARAVAN_PIECES = [
  ...P(`#waydown Fx8 L2 L2 Fx4 L1 L1 Fx4 L2 L2 Fx6 @awning1 Fx4 R1 R1 Fx3 L1 L1 Fx6 R2 R2 Fx2 L2 L2 Fx6`),                 // down from lvl 6 to 0
  ...P(`#road Fx4 @wagon1 Fx6 R2 R2 Fx3 L2 L2 Fx6 @leadwagon Fx8 R1 R1 Fx5 L1 L1 Fx4 R2 Fx2 R1 Fx2 L1 L2 Fx5 @wagon3 Fx6 L1 Fx4 R1 Fx6 R2 R2 Fx2 L2 L2`),
  ...P(`#oxline Fx6 QSx3 Fx4 @oxwreck R2 R2 Fx2 L2 L2 Fx4 QSx4 Fx4 @ribcage Fx3 QSx8 Fx3 Fx5 R1 R1 Fx3 L1 L1 QSx3 Fx4 R2 Fx2 L2 Fx2`),
  ...P(`#dunesea R1 R1 R1 Fx3 L1 L1 Fx3 R2 R2 R2 Fx2 L2 L2 @arch Fx8 L2 Fx3 @slide R1 R1 R1 R1 R1 Fx3 L1 L1 L1 L1 L1 QSx5 @landing Fx5 R2 Fx3 L2 Fx2 L1 Fx4`),
  ...P(`#camp Fx4 R2 Fx2 L2 @winch Fx4 Fx30 @tent Fx8 R1 Fx3 L1 Fx4 L2 Fx6`),
  ...P(`#sinking Fx4 QSx6 Fx2 QSx6 Fx3 R2 Fx2 L2 QSx5 Fx4 @caravanserai Fx7 Fx4 QSx6 Fx3 R1 Fx4 L1 Fx8`),
  ...P(`#rim Fx6 R2 R2 Fx3 L2 Fx4 @rimshade R1 R1 Fx3 L1 L2 Fx6 R2 Fx4 L2 Fx6 L1 L1 L1 L1 Fx10 #arena Fx40`),
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

  // ---- 1 THE WAY DOWN: the standard, the rule taught, the lone awning ----
  ent('standard', 3, on(3)); ent('check', 5, on(5));
  ent('sign', 8, on(8), { text: 'THE SUN IS OUT HERE. STAND IN IT TOO LONG AND IT TAKES YOU. SHADE PUTS IT RIGHT.' });
  ent('awning', marks.awning1 + 2, on(marks.awning1 + 2)); ent('sign', marks.awning1 - 3, on(marks.awning1 - 3), { text: 'SHADE.' });
  // ---- 2 THE CARAVAN ROAD ----
  ent('wagon', marks.wagon1 + 3, on(marks.wagon1 + 3));
  { const x = marks.leadwagon; ent('wagon', x + 3, on(x + 3), { lead: true });                 // THE LEAD WAGON: its tipped bed is a ledge
    for (let i = 0; i < 4; i++) set(x + 1 + i, top(x) - 3, T.PLANK); ent('silver', x + 3, top(x) - 7);   // a silver over the bed: up on the wagon, then a jump
    ent('stray', x + 12, top(x + 12) - 1); }                                                      // a stray on the dune crest past it
  ent('wagon', marks.wagon3 + 3, on(marks.wagon3 + 3)); ent('check', sections.road + 20, on(sections.road + 20));
  // ---- 3 THE OX LINE: bones, the first quicksand, THE GREAT RIBCAGE ----
  const firm = x => { while (cols[x] && cols[x].t === 'QS') x++; return x; };
  for (const dx of [2, 16, 30]) { const x = firm(sections.oxline + dx); ent('deco', x, on(x), { kind: dx === 16 ? 'ribs' : 'skull' }); }
  ent('wagon', marks.oxwreck - 2, on(marks.oxwreck - 2), { wreck: true }); ent('check', firm(sections.oxline + 12), on(firm(sections.oxline + 12)));
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
    ent('silver', x0 + 5 + 1, top(x0 + 6) - 3); ent('check', x0 - 4, on(x0 - 4));
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
  { const x0 = marks.caravanserai, g = top(x0), roof = g - 9;                                      // a stone tower, sunk: walls, a door, a floor inside, the roof
    for (let x = x0; x <= x0 + 6; x++) for (let y = roof; y < g; y++) set(x, y, T.SOLID);
    for (let x = x0 + 1; x <= x0 + 5; x++) for (let y = roof + 1; y < g; y++) set(x, y, T.AIR);
    for (let y = g - 3; y < g; y++) set(x0, y, T.AIR);                                            // the door
    for (let x = x0 + 1; x <= x0 + 5; x++) set(x, g - 3, T.ONEWAY); for (let x = x0 + 3; x <= x0 + 5; x++) set(x, g - 6, T.ONEWAY);   // up inside it, a jump (3 rows) at a time
    for (let x = x0 + 4; x <= x0 + 5; x++) set(x, roof, T.AIR);                                   // the hatch to the roof: TWO tiles (F9 walk, 2026-09-24: through one, only a jump from dead under it got out, and the play bot never found it)
    shade.push([(x0 + 1) * TS, (x0 + 6) * TS, (roof + 1) * TS, g * TS + 1]);                     // inside it is shade (its roof is too high for the overhang rule)
    ent('stray', x0 + 2, g - 4); ent('check', x0 - 3, on(x0 - 3)); }
  // ---- 7 THE HOLLOW'S RIM, and THE WORM'S HOLLOW ----
  const ax0 = sections.arena, ax1 = ax0 + 39, floor = top(ax0);
  ent('check', ax0 - 3, on(ax0 - 3));                                                              // B6: one outside the arena walls
  ent('sign', sections.rim + 4, on(sections.rim + 4), { text: 'THE GROUND IS MOVING.' });
  ent('awning', marks.rimshade - 2, on(marks.rimshade - 2), { torn: true });                          // a torn lean-to on the rim
  for (const dx of [8, 20, 32]) ent('wagon', ax0 + dx, on(ax0 + dx), { wreck: true });              // the three wrecks: the places to make THE OPENING
  /* THE RIM'S OVERHANG (Daniel, 2026-09-23) - THE ONE PIECE OF SHADE THE WORM CANNOT TAKE. The hollow's shade used to be
     the three wrecks and nothing else, and phase 2 SMASHES every wreck it sticks in (src/dune-worm.js), so past phase 2
     there was no shade left in the arena at all - while the brief says in the same breath that the sun keeps working in
     there and to fight in the shade when you can. Sunstroke's first damage lands at 9.7 s of open sun and the fight runs
     far longer, so the level's own rule turned unanswerable exactly where it should bite hardest: A12, the room ceasing
     to supply what the rule assumes. Built as a lintel of the rim's own sandstone, the same way THE ARCH is built in the
     dune sea - its pillars are decoration drawn BEHIND, so they never wall the hollow off. */
  const ovL = ax0 + 2, ovR = ax0 + 8, ovRow = floor - 5;                                           /* 5 rows up: inside SUN.roof, and clear over the breach column */
  for (let x = ovL; x <= ovR; x++) set(x, ovRow, T.SOLID);
  ent('deco', ovL, on(ovL), { kind: 'archPillar', behind: true }); ent('deco', ovR, on(ovR), { kind: 'archPillar', behind: true });
  shade.push([ovL * TS, (ovR + 1) * TS, ovRow * TS, floor * TS + 1]);                              /* said as a rect too, so a tool with no tileAt still sees it */
  const arena = { x0: ax0 * TS, x1: (ax1 + 1) * TS, floor: floor * TS, trigger: (ax0 + 5) * TS, wallL: ax0 - 1, wallR: ax1 + 1, boss: 'duneworm', music: 'boss2', tint: '#e2bb7a', tintA: 0.1, fx: 'sand' };

  // ---- THE GARRISON (a draft of the level's GARRISON row, placed so it can be measured): ~4 a screen, 3 in the first ----
  const ROSTER = { waydown: ['scorpion', 'cutthroat'], road: ['scorpion', 'cutthroat', 'vulture', 'scorpion'], oxline: ['cutthroat', 'scorpion', 'vulture', 'cutthroat'],
    dunesea: ['vulture', 'scorpion', 'cutthroat', 'vulture'], camp: ['cutthroat', 'scorpion', 'cutthroat', 'scorpion'], sinking: ['cutthroat', 'scorpion', 'vulture', 'cutthroat'], rim: ['scorpion', 'cutthroat', 'cutthroat', 'vulture'] };
  const secOf = x => { let s = 'waydown'; for (const [k, v] of Object.entries(sections)) if (k !== 'arena' && x >= v) s = k; return s; };
  const busy = new Set(ents.filter(e => ['check', 'sign', 'relic', 'standard', 'winch'].includes(e.t)).map(e => e.x));
  const standOK = x => { const c = cols[x]; if (!c || c.t === 'QS') return false; const r = top(x); for (let y = r - 3; y < r; y++) if (grid[y * W + x] !== T.AIR) return false; return ![x - 1, x, x + 1].some(v => busy.has(v)); };
  let k = 0;
  for (let w0 = 0; w0 + 24 <= ax0 - 1; w0 += 24) { const sec = secOf(w0), n = sec === 'waydown' ? 3 : 4;
    for (let i = 0; i < n; i++) { let x = w0 + 3 + Math.floor(i * 20 / n); while (x < w0 + 23 && !standOK(x)) x++; if (x >= w0 + 23) continue;
      const t = ROSTER[sec][k++ % ROSTER[sec].length]; ent(t, x, t === 'vulture' ? top(x) - 7 : on(x)); busy.add(x); } }

  return { W, H, grid, ents, START: { x: 6, y: on(6) }, pools: [], falls: [], moversExtra, interiors: [], sections, marks, arena, quicksand: qs, shade,
    draft: true, palette: { set: 'desert' }, rule: 'THE SUN', lengthCols: ax0 };
}
/* for tools/draft-level.mjs (tools/caravan-level.mjs is this level's own, older check; both must pass) */
export const build = buildSunkenCaravan;
export const meta = { name: 'THE SUNKEN CARAVAN', orientation: 'h', landmarks: ['leadwagon', 'ribcage', 'slide', 'winch', 'caravanserai'], sun: true, density: [3.5, 4.5], foes: ['scorpion', 'vulture', 'cutthroat', 'slinger', 'ambusher'] };
