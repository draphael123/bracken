// src/draft/red-gorge.js — THE RED GORGE (desert arc level 3) as a GREYBOX DRAFT: a CLIMB, the structure, not the level (not in
// LEVELS, nothing loads it). Measured by `node tools/draft-level.mjs red-gorge`. Brief: docs/desert-arc-brief.md.
//
// THE RULE: THE FLOOD COMES DOWN THE CANYON. A horn from above, then a torrent down the CHANNEL in the middle of the gorge
// (src/desert-rules.js FLOOD): anything in it is swept down and hurt. The ledges up the walls are dry. Every section's side is capped
// by an OVERHANG, so to go on up you must cross the channel on a ROPE BRIDGE - between floods. Said three ways (C4): the channel's
// rock is scoured pale and wet-dark where the water runs; the horn; the flotsam (branches, a drowned cart) wedged in the channel walls.
// SEVEN SECTIONS, bottom to top: THE GORGE MOUTH (the rule taught: a first flood you watch from a ledge) · THE DRY FALLS (the plunge
// pool terrace) · THE RAPTOR LEDGES (nests on the outer shelves) · THE ROPE BRIDGES (two crossings close together) · THE CAVE OF
// HANDS (a cave in the west wall, painted hands, the relic) · THE NARROWS (the walls close in, the channel is all there is) · THE
// SUMMIT (the last climb, out onto the plateau) · then THE ROC'S NEST (the arena).
export const GORGE_W = 48, GORGE_H = 206, CX = 24;
const TS = 16;
export function build(T) {
  const W = GORGE_W, H = GORGE_H, grid = new Uint8Array(W * H), set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const channel = { x0: CX - 2, x1: CX + 2 };   // in tiles; the torrent's columns
  const ents = [], ent = (t, x, y, e = {}) => ents.push({ t, x, y, ...e }), sections = {}, marks = {};
  const NAMES = ['mouth', 'dryfalls', 'raptors', 'bridges', 'cave', 'narrows', 'summit'], SEC = 26, afl = 14, bottom = H - 5;   // the gorge floor's top is row H-4
  // the walls: rock either side, wandering; THE NARROWS pinch them in
  const wl = y => { const n = y < bottom - 5 * SEC && y > bottom - 6 * SEC ? 5 : 0; return 3 + Math.round(2 * Math.sin(y / 9)) + n; };
  const wr = y => { const n = y < bottom - 5 * SEC && y > bottom - 6 * SEC ? 5 : 0; return W - 5 - Math.round(2 * Math.sin(y / 11 + 1)) - n; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (y >= H - 4 || x <= wl(y) || x >= wr(y)) set(x, y, T.SOLID);
  // THE ROC'S NEST: a plateau at the top, walled; the gorge comes out at its west end
  for (let y = 0; y <= afl + 1; y++) for (let x = 0; x < W; x++) set(x, y, y <= 1 || y >= afl || x <= 1 || x >= W - 2 ? T.SOLID : T.AIR);
  for (let y = afl; y <= afl + 1; y++) for (let x = 2; x <= 3; x++) set(x, y, T.AIR);   // the way up into it: the gorge's mouth at the top
  for (let y = afl + 2; y < afl + 6; y++) for (let x = 2; x <= 5; x++) set(x, y, T.AIR);
  sections.arena = afl;
  // the climb: section by section, a staircase of dry ledges up ONE side, capped by an overhang, then a rope bridge across the channel
  const ledge = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, y, T.ONEWAY); };
  let side = -1;   // -1 west, +1 east
  for (let s = 0; s < 7; s++) {
    const yBot = bottom - s * SEC, yTop = yBot - SEC; sections[NAMES[s]] = yBot;
    for (let y = yBot - 2, k = 0; y > yTop + 1; y -= 3, k++) {   /* yBot is the row you STAND in: the first ledge three rows up is yBot - 2 (at yBot - 3 it was four: nothing climbed) */
      if (side < 0) { const a = wl(y); if (k % 2 === 0) ledge(a + 1, a + 6, y); else ledge(a + 4, CX - 3, y); }
      else { const b = wr(y); if (k % 2 === 0) ledge(b - 6, b - 1, y); else ledge(CX + 3, b - 4, y); } }
    if (s < 6) {   // the bridge across at the section's top, and the overhang that makes you take it
      for (let x = wl(yTop) + 1; x < wr(yTop); x++) set(x, yTop, T.ONEWAY);
      for (let y = yTop - 5; y < yTop - 3; y++) { if (side < 0) for (let x = wl(y) + 1; x <= CX - 3; x++) set(x, y, T.SOLID); else for (let x = CX + 3; x < wr(y); x++) set(x, y, T.SOLID); }   /* the overhang over the bridge (it sat ON it), headroom under it */
      ent('rope', CX, yTop - 1, { bridge: true, hung: true }); }
    ent('check', side < 0 ? wl(yBot - 1) + 2 : wr(yBot - 1) - 2, yBot - 1 - (s === 0 ? 0 : 0) - (s === 0 ? 0 : 1));
    side = -side;
  }
  // the checkpoints above stand on the bridge they arrive by (one row over the next section's floor): put them on a ledge or bridge row
  for (const e of ents.filter(e => e.t === 'check')) { while (e.y + 1 < H && !(grid[(e.y + 1) * W + e.x] === T.ONEWAY || grid[(e.y + 1) * W + e.x] === T.SOLID)) e.y++; }
  let topLedge = afl + 5; { const lastBot = bottom - 6 * SEC; for (let y = lastBot - 2; y >= afl + 2; y -= 3) { ledge(2, 6, y); topLedge = y; } }   /* down to row afl+2: one jump under the nest's mouth (it stopped a ledge short) */   // the summit's last rungs of rock up to the mouth
  ent('check', 4, topLedge - 1);   // outside the nest, at the top of the climb
  marks.dryfalls = sections.dryfalls; marks.raptors = sections.raptors; marks.bridges = sections.bridges; marks.cave = sections.cave; marks.narrows = sections.narrows; marks.nest = afl;
  // THE DRY FALLS: the plunge pool terrace - a wide east ledge with a silver
  { const y = sections.dryfalls - 9; ledge(wr(y) - 9, wr(y) - 1, y); ent('silver', wr(y) - 5, y - 2); ent('stray', wr(y) - 8, y - 1); }
  // THE RAPTOR LEDGES: nests on the outer shelves, a stray on the highest
  { const y0 = sections.raptors; for (const dy of [6, 12, 18]) ent('deco', wl(y0 - dy) + 2, y0 - dy - 1, { kind: 'nest', hung: true }); ent('stray', wl(y0 - 18) + 3, y0 - 19, { hung: true }); }
  // THE ROPE BRIDGES: an extra crossing mid-section (two close together), a silver hung over the channel
  { const y = sections.bridges - 12; for (let x = wl(y) + 1; x < wr(y); x++) set(x, y, T.ONEWAY); ent('silver', CX, y - 3); }
  // THE CAVE OF HANDS: a room cut into the west wall, the relic in it
  { const y = sections.cave - 9, x1 = wl(y); for (let yy = y - 4; yy < y; yy++) for (let x = x1 - 1; x <= x1; x++) set(x, yy, T.AIR); for (let yy = y - 4; yy < y; yy++) for (let x = Math.max(1, x1 - 4); x <= x1; x++) set(x, yy, T.AIR);
    for (let x = Math.max(1, x1 - 4); x <= x1 + 6; x++) set(x, y, T.ONEWAY); ent('relic', Math.max(2, x1 - 2), y - 1); ent('deco', x1 - 1, y - 1, { kind: 'paintedHands' }); ent('stray', x1 + 4, y - 1); }
  // THE NARROWS: its silver deep in the pinch
  { const y = sections.narrows - SEC; ent('silver', CX, y - 3); }   /* over the bridge at the top of the narrows: a grab between floods (hung in mid-channel it was out of every reach) */
  // the garrison: one on each ledge row that is not a bridge (gorge crabs and scorpions on the rock, raptors over the channel):
  // a ledge every three rows is four every twelve
  const kinds = ['crab', 'raptor', 'scorpion', 'crab', 'raptor', 'scorpion', 'raptor'];
  let n = 0; for (let y = bottom - 1; y > afl + 4; y--) { const xs = []; let run = 0; for (let x = 2; x < W - 2; x++) if (grid[y * W + x] === T.ONEWAY) run++;
    if (run === 0 || run > 20) continue;
    for (let x = 2; x < W - 2; x++) if (grid[y * W + x] === T.ONEWAY && grid[(y - 1) * W + x] === T.AIR && grid[(y - 2) * W + x] === T.AIR && !(x >= channel.x0 && x <= channel.x1)) xs.push(x);
    if (!xs.length) continue; const t = kinds[n++ % kinds.length]; const x = xs[Math.floor(xs.length / 2)]; ent(t, t === 'raptor' ? CX : x, t === 'raptor' ? y - 3 : y - 1); }
  const arena = { x0: 4 * TS, x1: 44 * TS, floor: afl * TS, trigger: 8 * TS, wallL: 3, wallR: 44, boss: 'roc', tint: '#d0704a', tintA: 0.08 };
  return { W, H, grid, ents, START: { x: CX, y: bottom }, pools: [], falls: [], moversExtra: [], interiors: [], sections, marks, arena, channel, draft: true, palette: { set: 'redrock' } };
}
export const meta = {
  name: 'THE RED GORGE', orientation: 'v', landmarks: ['dryfalls', 'raptors', 'bridges', 'cave', 'narrows', 'nest'], sun: false, density: [3.5, 4.5], foes: ['crab', 'raptor', 'scorpion'],
  async extra(L, { ok, R, T }) {
    const { FLOOD } = await import('../desert-rules.js');
    const ch = L.channel, inCh = x => x >= ch.x0 && x <= ch.x1;
    // no dry-looking ledge in the channel: the only footing in the torrent's path is a bridge
    const cells = [...R.seen].map(k => k.split(',').map(Number)).filter(([x, y]) => inCh(x) && y > 16 && y < L.H - 5);
    const bridgeRows = new Set(); for (let y = 0; y < L.H; y++) { let run = 0; for (let x = 0; x < L.W; x++) if (L.grid[y * L.W + x] === T.ONEWAY) run++; if (run > 20) bridgeRows.add(y); }
    const onBridge = cells.filter(([, y]) => bridgeRows.has(y + 1));
    // every footing cell in the channel is a walk off it that the horn gives time for
    const safeDist = ([x, y]) => { let d = 99; for (let xx = 0; xx < L.W; xx++) if (!inCh(xx) && R.seen.has(xx + ',' + y)) d = Math.min(d, Math.abs(xx - x)); return d; };
    const worst = Math.max(0, ...cells.map(safeDist)), budget = FLOOD.warn * 92 / 16;
    ok(cells.length > 0 && worst <= budget / 2, `every place to stand in the channel is ${worst} tiles from dry rock at most; the horn gives ${FLOOD.warn} s (${budget.toFixed(0)} tiles at a run): a crossing caught by the horn can always get off`);
    // THE RULE IS LOAD-BEARING: the climb crosses the channel (the overhangs force it) at every section
    const crossings = [...bridgeRows].filter(y => y > 16 && y < L.H - 5).length;
    ok(crossings >= 6 && onBridge.length > 0, `the climb crosses the channel ${crossings} times on bridges (an overhang caps each side): the flood is in the way, not beside it`);
  },
};
