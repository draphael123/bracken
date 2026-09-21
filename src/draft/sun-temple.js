// src/draft/sun-temple.js — THE SUN TEMPLE (desert arc 4b, the optional level that unlocks THE SUN PRIEST) as a GREYBOX DRAFT: the
// structure, not the level (not in LEVELS). Measured by `node tools/draft-level.mjs sun-temple`. Brief: docs/desert-arc-brief.md.
//
// THE RULE: THE SUN MOVES. Each hall is two CHAMBERS under a roof with a row of five high windows; over the level's day the sun comes
// through one window after another (src/light.js templeSun). A chamber's SUN-DOOR opens when light reaches its SUN-PLATE, on the
// door's wall at mirror height - and only a MIRROR under the window the sun is in can turn the beam along to it. So a chamber opens at
// some hours and not others: turn the right mirror, and wait for the sun, or come back. Standing in a beam mends you and burns the
// dead (the Priest's temple). At dusk the last windows go dark and the siege comes (the level batch's).
// SEVEN HALLS: THE GATE OF DAWN · THE HALL OF WINDOWS · THE SUNDIAL COURT · THE REFLECTING POOL · THE CLOISTER · THE BELL OF NOON ·
// THE HIGH ALTAR (the approach) · then THE FALLEN HIGH PRIEST (the arena).
import { TS } from './_kit.js';
export const TEMPLE = { H: 30, base: 24, chamber: 32, windows: [4, 10, 16, 22, 27], day: 60 };
/* each chamber: which windows have a mirror under them (and the mirror's state as built), and pillars on the mirror row that block
   the beam. The door's plate is at the chamber's east end. Built by hand so each chamber is its own small puzzle. */
export const CHAMBERS = [
  { mirrors: [[1, '/']] },                                   // the gate: one mirror, turned wrong - the rule taught (turn it, then it opens at hour 1)
  { mirrors: [[3, '/']] },
  { mirrors: [[0, '\\'], [2, '/']] },                        // two mirrors: the west one is right but the east one is in its way
  { mirrors: [[4, '/']], pillars: [] },
  { mirrors: [[1, '/'], [3, '/']] },
  { mirrors: [[2, '/'], [4, '/']], pillars: [25] },          // a pillar shades the west mirror's beam: use the east one (it was a dead chamber with one mirror)
  { mirrors: [[0, '/']] },
  { mirrors: [[2, '/'], [4, '/']] },                         // the east mirror wins (it was turned right as built: open with no turn)
  { mirrors: [[3, '/']] },
  { mirrors: [[1, '\\'], [4, '/']] },
  { mirrors: [[2, '/']] },
  { mirrors: [[0, '/'], [3, '/']] },
  { mirrors: [[4, '/']] },
  { mirrors: [[1, '/'], [2, '/']] },
];
export function build(T) {
  const { H, base, chamber: CW, windows } = TEMPLE, n = CHAMBERS.length, x0 = 4, ax0 = x0 + n * CW + 6, W = ax0 + 42;
  const grid = new Uint8Array(W * H), set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const ceil = base - 8, mr = base - 4, ents = [], ent = (t, x, y, e = {}) => ents.push({ t, x, y, ...e });
  for (let x = 0; x < W; x++) for (let y = base; y < H; y++) set(x, y, T.SOLID);                     // the floor
  for (let y = 0; y < H; y++) { set(0, y, T.SOLID); set(1, y, T.SOLID); set(W - 1, y, T.SOLID); set(W - 2, y, T.SOLID); }
  const rooms = [], doors = [], sections = {}, marks = {};
  const HALLS = ['dawn', 'windows', 'sundial', 'pool', 'cloister', 'noon', 'altar'];
  CHAMBERS.forEach((C, k) => {
    const cx = x0 + k * CW; if (k % 2 === 0) sections[HALLS[k / 2]] = cx;
    for (let x = cx; x < cx + CW; x++) set(x, ceil, T.SOLID);                                                // the roof...
    const win = windows.map(w => cx + w); for (const wx of win) set(wx, ceil, T.AIR);                     // ...and its five windows
    for (let y = ceil; y < base; y++) set(cx + CW - 1, y, T.SOLID);                                        // the east wall, floor to roof
    for (let y = base - 3; y < base; y++) set(cx + CW - 1, y, T.SOLID);                                    // the SUN-DOOR: the wall's bottom three rows
    doors.push({ x: cx + CW - 1, y0: base - 3, y1: base - 1 });
    for (const px of (C.pillars || [])) for (let y = ceil + 1; y <= mr; y++) set(cx + px, y, T.SOLID);     // a pillar hung from the roof to the mirror row: it stops light, you walk under it (standing on the floor it walled the hall)
    const mirrors = C.mirrors.map(([wi, st]) => ({ x: win[wi], y: mr, state: st, turnable: true }));
    rooms.push({ k, cx, win: win.map(x => ({ x, y: ceil, dir: 'S' })), mirrors, plate: { x: cx + CW - 2, y: mr } });
    for (const m of mirrors) ent('mirror', m.x, m.y, { state: m.state, hung: true });
    ent('sunplate', cx + CW - 2, mr, { hung: true });
    for (let x = cx + 2; x < cx + 7; x++) set(x, base - 3, T.PLANK);                                      // a gallery ledge (to reach the mirrors, and a height to stand on)
    for (let x = cx + 13; x < cx + 18; x++) set(x, base - 3, T.PLANK);
    for (let x = cx + 20; x < cx + 26; x++) set(x, base - 6, T.PLANK);                                     // the high gallery (boards let light through: the puzzles are untouched)
    for (let x = cx + 8; x < cx + 12; x++) set(x, base - 1, T.SOLID);                                      // the dais a mirror-keeper stands on
  });
  sections.arena = ax0; const HALL = HALLS.map((h, i) => [h, sections[h]]);
  marks.gatedawn = sections.dawn; marks.sundial = sections.sundial; marks.pool = sections.pool + 10; marks.bell = sections.noon + 16; marks.altar = sections.altar;
  // pickups, checkpoints (one per hall), the start
  for (const [h, x] of HALL) ent('check', x + 1, base - 1);
  ent('check', ax0 - 3, base - 1);
  ent('silver', sections.windows + 4, base - 5); ent('silver', sections.pool + 15, base - 5); ent('silver', sections.noon + 4, base - 5);
  ent('stray', sections.sundial + 16, base - 4); ent('stray', sections.cloister + 4, base - 4); ent('stray', sections.altar + 16, base - 4); ent('relic', sections.pool + 20, base - 1);
  // the garrison: the king's dead in the halls, fallen priests who snuff windows
  const kinds = ['mummy', 'fallenpriest', 'skeleton', 'mummy'];
  let i = 0; for (let w0 = 0; w0 + 24 <= ax0; w0 += 24) for (let j = 0; j < 4; j++) { let x = w0 + 3 + j * 5; while (x < w0 + 23 && (grid[(base - 1) * W + x] !== T.AIR || grid[(base - 2) * W + x] !== T.AIR || ents.some(e => Math.abs(e.x - x) <= 1 && ['check', 'relic'].includes(e.t)))) x++; if (x < w0 + 23) ent(kinds[i++ % 4], x, base - 1); }
  const arena = { x0: ax0 * TS, x1: (ax0 + 40) * TS, floor: base * TS, trigger: (ax0 + 5) * TS, wallL: ax0 - 1, wallR: ax0 + 40, boss: 'fallenhighpriest', tint: '#ffe8b0', tintA: 0.1 };
  return { W, H, grid, ents, START: { x: 3, y: base - 1 }, pools: [], falls: [], moversExtra: [], interiors: [], sections, marks, arena, rooms, doors, draft: true, palette: { set: 'temple' } };
}
/* the level as played: every sun-door opened (the check below proves each CAN be) */
export function asPlayed(L, T) { const g = L.grid.slice(); for (const d of L.doors) for (let y = d.y0; y <= d.y1; y++) g[y * L.W + d.x] = T.AIR; return { ...L, grid: g }; }
export const meta = {
  name: 'THE SUN TEMPLE', orientation: 'h', landmarks: ['gatedawn', 'sundial', 'pool', 'bell', 'altar'], sun: false, density: [3.5, 4.5], foes: ['mummy', 'fallenpriest', 'skeleton'],
  async extra(L, { ok, log, T, at }) {
    const { solve, trace, makeOpaque } = await import('../light.js'); const opaque = makeOpaque(T), opts = { opaque, W: L.W, H: L.H };
    const tileAt = (x, y) => at(x, y), rows = [];
    let dead = 0, trivial = 0, timed = 0, needTurn = 0;
    for (const r of L.rooms) {
      const hours = r.win.map((src, h) => { const s = solve(tileAt, [src], r.mirrors, [r.plate], opts); return s ? { h, turns: s.turns } : null; }).filter(Boolean);
      const asBuilt = r.win.some(src => trace(tileAt, [src], r.mirrors, [r.plate], opts).hit.size > 0);
      if (!hours.length) dead++; if (asBuilt) trivial++; if (hours.length && hours.length < r.win.length) timed++; if (hours.length && hours.every(o => o.turns > 0)) needTurn++;
      rows.push(`${r.k}:${hours.length ? hours.map(o => 'h' + o.h + (o.turns ? '+' + o.turns : '')).join('/') : 'NEVER'}${asBuilt ? '(open as built!)' : ''}`);
    }
    log('    chambers (the hours each opens at, +turns): ' + rows.join(' '));
    ok(dead === 0, `every chamber's sun-door can be opened at some hour of the day (${dead} can never be)`);
    ok(trivial === 0, `no chamber is open as built: each wants a mirror turned (${trivial} open already)`);
    ok(timed >= L.rooms.length / 2 && needTurn === L.rooms.length, `THE SUN MOVES: ${timed} of ${L.rooms.length} chambers open only at some hours (timing matters), and all ${needTurn} need a turn at every hour they open`);
  },
};
