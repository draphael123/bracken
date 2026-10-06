/* tools/canal-aloft.mjs - NOTHING IN THE FOG CANAL'S NEW ART HANGS IN THE AIR (claude/canal4art; the underwell / unburied / moor aloft idea). NODE, no page.
   The legging tunnel's art keys every piece to something solid, read off the level's own grid (src/redraw/canal_tunnel.js, src/canal-hands.js):
     A  THE LOW BEAMS      each tunnel tie-bar hangs from a rib: the two rows of vault (14, 15) over every column of it are solid
     B  THE PORTALS        the archivolt over the mouth rests on solid hill (row 13 solid over its columns)
     C  THE STOP-PLANKS    each stops a solid course: the ledge (a one-way or solid) over its column carries the sheave, and its windlass stands on a ledge too
     D  THE PADDLE GEAR    the deep lock's sluice stands on the gallery's ledge
     E  THE HUNG PLATE     the DEEP LOCK plate's chains hang from ledge tiles over every column it covers
     F  THE MOON SHAFT     its grating (rows 0-1) spans two walls: solid either side of the shaft
   Run: node tools/canal-aloft.mjs */
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const L = LEVELS.find(l => l.id === 'canal').build(), D = L.canal;
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const held = (x, y) => at(x, y) === T.SOLID || at(x, y) === T.ONEWAY;
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const TS = 16;
{ const bad = []; let n = 0; for (const bm of D.beams || []) { if (!bm.tunnel) continue; n++; for (let c = Math.floor(bm.x0 / TS); c < Math.ceil(bm.x1 / TS); c++) for (const r of [14, 15]) if (at(c, r) !== T.SOLID) bad.push(c + ',' + r); }
  ok(n > 0 && !bad.length, n + ' tunnel tie-bars, each hung from a solid rib' + (bad.length ? ': HANGS FROM AIR at ' + bad.join(' ') : '')); }
{ const m = D.tunnels[0], bad = []; for (let c = m[0] - 1; c <= m[0] + 3; c++) if (c >= m[0] && at(c, 13) !== T.SOLID) bad.push(c); ok(!bad.length, 'the mouth\'s archivolt rests on solid hill (cols ' + m[0] + '-' + (m[0] + 3) + ')' + (bad.length ? ': ' + bad.join(' ') : '')); }
{ const ents = L.ents || [], bad = [];
  for (const q of D.stops || []) { if (!held(q.x, 15)) bad.push('sheave col ' + q.x); }
  const wins = ents.filter(e => e.t === 'stopwinch'); for (const e of wins) if (!held(e.x, e.y + 1)) bad.push('windlass ' + e.x + ',' + e.y);
  ok((D.stops || []).length > 0 && wins.length > 0 && !bad.length, (D.stops || []).length + ' stop-planks with a sheave on a ledge, ' + wins.length + ' windlass on a ledge' + (bad.length ? ': ' + bad.join('; ') : '')); }
{ const paddles = (L.ents || []).filter(e => e.t === 'locksluice' && e.reach === 'L6'), bad = paddles.filter(e => !held(e.x, e.y + 1)); ok(paddles.length === 1 && !bad.length, 'the deep lock\'s paddle gear stands on the gallery' + (bad.length ? ': NOT HELD' : '')); }
{ const m = D.tunnels[0], x0 = m[1] - 21, bad = []; for (let c = x0; c <= x0 + 3; c++) if (!held(c, 15)) bad.push(c); ok(!bad.length, 'the DEEP LOCK plate hangs from the gallery over cols ' + x0 + '-' + (x0 + 3) + (bad.length ? ': NO LEDGE AT ' + bad.join(' ') : '')); }
{ const bad = []; for (const [x0, x1] of D.moon || []) for (let r = 0; r <= 1; r++) { if (at(x0 - 1, r) !== T.SOLID || at(x1 + 1, r) !== T.SOLID) bad.push(r); } ok((D.moon || []).length > 0 && !bad.length, 'the moon shaft\'s grating spans solid walls where it is drawn (rows 0-1; the niche opens off it lower down)' + (bad.length ? ': open at rows ' + bad.join(' ') : '')); }
console.log(fails ? fails + ' FAILED' : 'canal-aloft: all held'); process.exit(fails ? 1 : 0);
