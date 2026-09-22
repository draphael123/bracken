// src/draft/buried-city.js — THE BURIED CITY (desert arc level 5) as a GREYBOX DRAFT: the structure, not the level (not in LEVELS).
// Measured by `node tools/draft-level.mjs buried-city`. Brief: docs/desert-arc-brief.md.
//
// THE RULE: THE SAND POURS IN. A city of the living, buried whole, its streets under a roof of sand held up by its own buildings. The
// HOURGLASS ROOMS fill from holes in the roof: the sand rises from the floor, and when it is over the top of the room's east doorway
// the way on is SHUT - until a LEVER on the far side of the room opens its floor-gate and drains it. So each room is a run against the
// sand: cross, climb to the lever, pull, and go. THE GREAT SAND-GATE (F5, a wheel) drains the whole lower quarter at once and can be
// turned again. Said three ways: the hiss and the falling streams; the sand-line painted on every doorway; the drowned in the drifts.
// SEVEN SECTIONS: THE SAND STAIR (down into the city) · THE MARKET UNDER THE SAND · THE HOURGLASS HALLS (the rule taught, three rooms)
// · THE DROWNED PALACE GATE (the mini, THE SAND WARDEN) · THE CLOCKWORK FOUNDRY (the constructs; THE GREAT SAND-GATE) · THE
// PETRIFIED GARDENS · THE THRONE STREET · then THE HOURGLASS KING (the arena).
import { pieces, ground, garrison, TS } from './_kit.js';
export const SAND = { rate: 0.55, room: 18 };   // rows a second the sand rises (at 1.1 it shut the door in 2.7 s against a 2.9 s run to the lever: every room was a loss); the room's width
export const PIECES = pieces(`
  #stair Fx4 L1 L1 Fx3 L1 L1 Fx3 L2 L2 Fx4 L1 L1 Fx4 @stairfoot Fx6 R2 Fx2 L2 Fx4 R1 Fx2 L1 Fx6 R2 Fx2 L2 Fx6
  #market Fx4 @market Fx6 U Fx4 D Fx6 R2 Fx2 L2 Fx4 U Fx3 U Fx4 D D Fx6 R1 Fx3 L1 Fx4 U Fx4 D Fx6
  #halls Fx4 @room1 Fx18 Fx6 @room2 Fx18 Fx6 @room3 Fx18 Fx4
  #palace Fx4 R2 Fx2 L2 Fx2 @mini Fx30 Fx4 R1 Fx2 L1 Fx4 U Fx4 D Fx4
  #foundry Fx4 @room4 Fx18 Fx4 @sandgate Fx6 U Fx4 U Fx4 D D Fx4 @room5 Fx18 Fx4
  #gardens Fx4 R2 Fx2 L2 Fx4 @garden Fx6 R1 R1 Fx2 L1 L1 Fx6 U Fx3 U Fx3 D D Fx6 R2 Fx3 L2 Fx4 U Fx4 D Fx4
  #throne Fx4 @room6 Fx18 Fx6 R2 Fx2 L2 Fx4 U Fx4 U Fx6 D D Fx8 #arena Fx40`);
export function build(T) {
  const G = ground(T, PIECES, { H: 44, base: 32, lvl: 8 }), { W, H, grid, set, top, on, marks, sections } = G;
  const ents = [], ent = (t, x, y, e = {}) => ents.push({ t, x, y, ...e }), rooms = [];
  // THE ROOF OF SAND: the city is under it everywhere past the stair - a ceiling ten rows over the street
  for (let x = sections.market - 4; x < W - 2; x++) { const r = Math.min(top(x) - 10, top(x) - 10); for (let y = 0; y <= r; y++) set(x, y, T.SOLID); }
  // THE HOURGLASS ROOMS: a west doorway, the room, an east wall with a doorway the sand shuts, holes in the roof, a lever on a ledge
  for (const k of ['room1', 'room2', 'room3', 'room4', 'room5', 'room6']) {
    const x0 = marks[k], x1 = x0 + SAND.room - 1, g = top(x0), roof = g - 10;
    for (const wx of [x0 - 1, x1 + 1]) for (let y = roof + 1; y < g - 3; y++) set(wx, y, T.SOLID);        // the walls, doorways 3 rows high at the floor
    for (let dx = 3; dx < SAND.room; dx += 5) set(x0 + dx, roof, T.AIR);                                    // the holes the sand pours through
    const lx = x1 - 3; for (let d = -1; d <= 2; d++) set(lx + d, g - 3, T.PLANK);                          // the lever's ledge, near the far door
    ent('lever', lx, g - 4); ent('sandhole', x0 + 3, roof + 1, { hung: true });
    rooms.push({ x0, x1, floor: g, lever: { x: lx, y: g - 4 }, doorTop: g - 3, name: k });
  }
  // THE GREAT SAND-GATE: a wheel on a step in the foundry; turned, it drains every room in the lower quarter (rooms 4 and 5)
  ent('sandgatewheel', marks.sandgate + 2, on(marks.sandgate + 2), { drains: ['room4', 'room5'] });
  // THE DROWNED PALACE GATE: the mini arena, a broken portico over it
  const mini = { x0: marks.mini * TS, x1: (marks.mini + 30) * TS, floor: top(marks.mini) * TS, boss: 'sandwarden' };
  for (const dx of [6, 22]) { const x = marks.mini + dx, g = top(x); for (let d = 0; d < 4; d++) set(x + d, g - 3, T.PLANK); }
  // THE PETRIFIED GARDENS: stone trees; ledges in their crowns
  for (const dx of [0, 14, 24]) { const x = marks.garden + dx, g = top(x); for (let d = 0; d < 5; d++) if (G.at(x + d, g - 4) === T.AIR) set(x + d, g - 4, T.PLANK); ent('deco', x + 2, on(x + 2), { kind: 'stoneTree', behind: true }); }
  // relief in the long streets: a balcony every 12 columns where the street is flat for 4
  for (let x = 8; x < sections.arena - 6; x += 12) { const g = top(x); if (rooms.some(r => x >= r.x0 - 2 && x <= r.x1 + 2) || (x >= marks.mini && x < marks.mini + 30)) continue;
    if ([0, 1, 2, 3].every(d => top(x + d) === g && G.at(x + d, g - 3) === T.AIR)) for (let d = 0; d < 4; d++) set(x + d, g - 3, T.PLANK); }
  // pickups, checkpoints, the start
  ent('silver', marks.market + 12, top(marks.market + 12) - 5); ent('silver', marks.garden + 16, top(marks.garden + 16) - 7); ent('silver', marks.room5 + SAND.room - 4, top(marks.room5) - 6);   /* over the lever's ledge (in mid-room it was out of a jump) */
  ent('stray', marks.stairfoot + 2, on(marks.stairfoot + 2)); ent('stray', marks.mini + 8, top(marks.mini + 8) - 4); ent('stray', sections.throne + 30, on(sections.throne + 30)); ent('relic', marks.garden + 2, top(marks.garden) - 5);
  for (const x of [3, sections.market + 1, marks.room1 - 3, marks.mini - 3, marks.room4 - 3, sections.gardens + 1, sections.throne + 1]) ent('check', x, on(x));
  const ax0 = sections.arena; ent('check', ax0 - 3, on(ax0 - 3));
  const arena = { x0: ax0 * TS, x1: (ax0 + 40) * TS, floor: top(ax0) * TS, trigger: (ax0 + 5) * TS, wallL: ax0 - 1, wallR: ax0 + 40, boss: 'hourglassking', tint: '#d8b070', tintA: 0.1 };
  garrison(G, T, ents, { stair: ['scorpion', 'sandgob'], market: ['drowned', 'construct', 'drowned', 'sandgob'], halls: ['drowned', 'construct', 'drowned', 'scorpion'], palace: ['construct', 'drowned', 'construct', 'drowned'],
    foundry: ['construct', 'construct', 'drowned', 'scorpion'], gardens: ['drowned', 'construct', 'sandgob', 'drowned'], throne: ['construct', 'drowned', 'construct', 'drowned'] },
    { from: 0, to: ax0 - 1, busyTypes: ['check', 'sign', 'relic', 'silver', 'stray', 'lever', 'sandgatewheel'], spot: x => { if (x >= marks.mini + 8 && x < marks.mini + 22) return null; const y = on(x);   /* the Warden's adds may stand at the edges of his hall */ for (let yy = y - 2; yy <= y; yy++) if (G.at(x, yy) !== T.AIR) return null; return G.cols[x] ? y : null; } });
  return { W, H, grid, ents, START: { x: 4, y: on(4) }, pools: [], falls: [], moversExtra: [], interiors: [], sections, marks, arena, mini, rooms, draft: true, palette: { set: 'buriedcity' } };
}
export const meta = {
  name: 'THE BURIED CITY', orientation: 'h', landmarks: ['market', 'room2', 'mini', 'sandgate', 'garden'], sun: false, density: [3.5, 4.5], foes: ['drowned', 'construct', 'sandgob', 'scorpion'],
  async extra(L, { ok, R, T, TS }) {
    // EACH ROOM IS A RUN AGAINST THE SAND: from the west doorway to the lever at a run (plus a jump's time for the ledge) inside the time
    // the sand takes to shut the east door - with a margin (the run must take at most 60% of it)
    const shutT = 3 / SAND.rate, rows = [];
    let late = 0, unreached = 0;
    for (const r of L.rooms) { const run = (r.lever.x - r.x0) * TS / 92 + 0.45, reachable = R.near(r.lever.x, r.lever.y);
      if (!reachable) unreached++; if (run > shutT * 0.6) late++; rows.push(`${r.name} ${run.toFixed(1)}s/${shutT.toFixed(1)}s`); }
    ok(unreached === 0 && late === 0, `each hourglass room is a run against the sand: to the lever in ${rows.join(', ')} (lever time / time until the door is shut), all inside 60%, every lever reached`);
    // THE RULE IS LOAD-BEARING: the road runs through the rooms (filled to the doorway, they shut it)
    const filled = { ...L, grid: L.grid.slice() }; for (const r of L.rooms) for (let x = r.x0; x <= r.x1; x++) for (let y = r.doorTop; y < r.floor; y++) filled.grid[y * L.W + x] = T.SOLID;
    const { floodReach } = await import('../reachcore.js'), { slopeReachGrid } = await import('../reach-slopes.js');
    const Rf = floodReach(slopeReachGrid(filled, T), T, { rides: true }); const ax0 = L.arena.x0 / TS; let got = false; for (let x = ax0; x < ax0 + 40; x++) for (let y = 0; y < L.H; y++) if (Rf.seen.has(x + ',' + y)) got = true;
    ok(!got, `the rule is load-bearing: with the ${L.rooms.length} hourglass rooms full, the Hourglass King cannot be reached`);
    let miniGot = false; for (let x = L.mini.x0 / TS; x < L.mini.x1 / TS; x++) if (R.seen.has(x + ',' + (L.mini.floor / TS - 1))) miniGot = true;
    ok(miniGot && L.mini.x0 / L.arena.x0 > 0.25 && L.mini.x0 / L.arena.x0 < 0.5, `THE SAND WARDEN's mini arena is on the road, ${Math.round(100 * L.mini.x0 / L.arena.x0)}% of the way in`);
  },
};
