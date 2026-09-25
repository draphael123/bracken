// tools/tower-cutouts.mjs — THE FALLING TOWER'S BACK WALL: NOTHING CUTS ITS HOLES AND WINDOWS, AND NOTHING IN IT IS GRASS (round 2,
// docs/briefs/falling-tower-round2.md §1c). Node only: no page, no port, no Chrome (tools/node-canvas.mjs bakes the rooms).
// Daniel, 2026-09-25: "The background for the mage's tower is good, but sometimes the tiles don't work with it (i.e. the grass tiles).
// There is also some clipping with windows and things like that."
//   CUT-OUTS  every room of the BUILT tower is baked the way the game bakes it (src/redraw/fallen_tower.js, handed the grid) and every
//             cut-out it makes - a hole to the sky, a Reading Room window, the clock's face - is a box that crosses no tile (ledge,
//             rope, stone, spike, crystal) with a margin, and no other cut-out. THE RULE BITES: the same rooms baked blind, as they were
//             before round 2, put cut-outs across tiles - so the check is not passing because the rooms have no cut-outs in them.
//   KEPT      the rooms still have them: a hole or more in most rooms, a window in the Reading Room, the clock in the Pendulum Gallery
//   NO GRASS  the tower's palette has no green in its ground colours, and its harmful pools are not grass-green (the cistern was: at
//             play size a row of grass tiles between the stones)
// usage: node tools/tower-cutouts.mjs
import assert from 'node:assert/strict';
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
install();
const FTW = await import('../src/redraw/fallen_tower.js');
const L = LEVELS.find(l => l.id === 'fallingtower').build(), W = L.W, H = L.H, TS = 16;
const blocked = (tx, ty) => tx < 0 || ty < 0 || tx >= W || ty >= H || L.grid[ty * W + tx] !== T.AIR;
const crossings = (cut, x0, y0) => { const out = [];
  for (const b of cut) { const a0 = Math.floor(b.x / TS) + x0, a1 = Math.floor((b.x + b.w - 1) / TS) + x0, c0 = Math.floor(b.y / TS) + y0, c1 = Math.floor((b.y + b.h - 1) / TS) + y0;
    for (let ty = c0; ty <= c1; ty++) for (let tx = a0; tx <= a1; tx++) if (blocked(tx, ty)) { out.push([tx, ty, L.grid[ty * W + tx]]); break; } }
  return out; };
const rooms = L.interiors.filter(([, , , , k]) => ['library', 'reading', 'orrery', 'clock', 'lab', 'flip', 'dome'].includes(k));
assert.equal(rooms.length, 7, 'seven rooms in the tower: ' + rooms.length);
let blind = 0, n = 0; const bad = [], per = {};
for (const [x0, x1, y0, y1, kind] of rooms) {
  const w = (x1 - x0 + 1) * TS, h = (y1 - y0 + 1) * TS;
  blind += crossings(FTW.fallenCutouts(kind, w, h, x0, y0, null), x0, y0).length;
  const cut = FTW.fallenCutouts(kind, w, h, x0, y0, blocked); n += cut.length; per[kind] = cut.length;
  for (const [tx, ty, t] of crossings(cut, x0, y0)) bad.push(`${kind}: a cut-out crosses tile ${tx},${ty} (${t})`);
  for (let i = 0; i < cut.length; i++) for (let j = i + 1; j < cut.length; j++) { const a = cut[i], b = cut[j]; if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) bad.push(`${kind}: two cut-outs overlap`); }
}
assert.ok(blind > 0, 'THE RULE BITES: baked blind (as before round 2) the rooms put no cut-out across a tile, so this check proves nothing');
assert.equal(bad.length, 0, bad.length + ' cut-out(s) with a tile across them:\n  ' + bad.join('\n  '));
assert.ok(per.reading >= 2, 'the Reading Room lost its window: ' + per.reading); assert.ok(per.clock >= 2, 'the Pendulum Gallery lost its clock or its holes: ' + per.clock);
assert.ok(Object.values(per).filter(k => k >= 1).length >= 6, 'rooms with no cut-out left in them: ' + JSON.stringify(per));
// ---- NO GRASS ----
const hsl = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  const h = !d ? 0 : mx === r ? ((g - b) / d + 6) % 6 * 60 : mx === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60; return { h, s: d / (1 - Math.abs(mx + mn - 1) || 1) }; };
const green = hex => { const { h, s } = hsl(hex); return h >= 70 && h <= 160 && s >= 0.2; };
for (const k of ['grass', 'grassL', 'grassD']) assert.ok(!green(L.palette[k]), 'the tower\'s palette.' + k + ' is green (' + L.palette[k] + '): any ground tile that ever shows is a lawn');
for (const p of L.pools.filter(p => p.harm)) for (const k of ['foulCol', 'foulColL']) assert.ok(p[k] && !green(p[k]), 'a harmful pool in the tower is grass-green (' + k + ' ' + p[k] + '): at play size it is a row of grass tiles');
assert.ok(green('#5c8a24') && green('#a6e04a'), 'THE RULE BITES: the old cistern green reads as green');
console.log(`ok  tower-cutouts   ${n} cut-outs in ${rooms.length} rooms (${JSON.stringify(per)}), none crossed by a tile or another (baked blind: ${blind}); no green in the tower's ground or its poison`);
