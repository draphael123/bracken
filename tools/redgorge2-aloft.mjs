/* tools/redgorge2-aloft.mjs - NOTHING IN RED GORGE 2's NEW GROUND HANGS IN THE AIR (claude/redgorge2 art pass; the same idea as the Underwell's, the Unburied Field's and Gale Moor's aloft checks,
   and tools/floaters.mjs's rule extended to the Rapids, the Climb and the nest ledge). NODE only, no page: a few seconds.
     A  EVERY CLIMB LEDGE STANDS ON SOMETHING   each end of every ONEWAY run in the Climb (cols 48-78, rows 148-218) is KEYED (a solid tile touches it, or sits under it) or is held by a rock SPUR the art draws
                                                (src/redraw/redgorge2_art.js planFins) down to solid rock or to another ledge; a spur that lands on a ledge lands on one that is itself held (<= 10 hops to rock (a spine: each ledge on the one below)); a run
                                                longer than 11 tiles is held in the middle too. 'none' is a ledge on nothing.
     B  EVERY PROP STANDS ON A TOP               the Rapids' and the Climb's dressing (pennants, cairns, bones, a wheel, reeds, a rope coil) stands on a SOLID or ONEWAY tile with air over it; the scrub hangs from a ledge
                                                with air under it; and the plumes the level lays (L.decor) and the nest ledge's own props (planLedgeDress) the same.
     C  THE KIT COVERS THE GROUND                every solid cell of the Rapids and of the nest ledge's tops, pits and bed gets a tile of its own (no cell falls through to the old brick),
                                                and the Climb's solids outside the nest keep the gorge's tiles (a bed tile on the Climb's rock was the bug this guards).
   Run: node tools/redgorge2-aloft.mjs */
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const A = await import('../src/redraw/redgorge2_art.js');
const M = await import('../src/redraw/matriarch_ledge.js');
const { STAGE } = await import('../src/raptor-matriarch.js');
const L = LEVELS.find(l => l.id === 'redgorge').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
/* A */
{ const fins = A.planFins(L, T), runs = new Map(); for (const f of fins) runs.set(f.run.join(',') + '@' + f.y, true);
  const bad = fins.filter(f => f.how === 'spur' && f.lands === 'none');
  ok(fins.length > 0 && bad.length === 0, fins.length + ' ledge ends/middles planned, every one keyed or held' + (bad.length ? ': ON NOTHING ' + bad.map(f => f.run + '@' + f.y).join('; ') : ''));
  const byRun = new Map(); for (const f of fins) { const k = f.run.join(',') + '@' + f.y; (byRun.get(k) || byRun.set(k, []).get(k)).push(f); }
  const held = (run, y, depth) => { if (depth > 10) return false; const fs = byRun.get(run.join(',') + '@' + y) || []; return fs.length > 0 && fs.every(f => f.how === 'rock' || (f.lands === 'solid') || (f.lands === 'ledge' && (() => { let a = f.x / 16 - 0.5; const col = Math.round(a); for (const [k, v] of byRun) { const [rr, yy] = k.split('@'), [r0, r1] = rr.split(',').map(Number); if (+yy === f.y1 && col >= r0 && col <= r1) return held([r0, r1], +yy, depth + 1); } return false; })())); };
  const loose = [...byRun.keys()].filter(k => { const [rr, yy] = k.split('@'); return !held(rr.split(',').map(Number), +yy, 0); });
  ok(loose.length === 0, 'every spur chain reaches rock within 10 hops (the stacked spine of the Climb)' + (loose.length ? ': ' + loose.join('; ') : ''));
  const long = [...byRun.entries()].filter(([k, fs]) => { const [rr] = k.split('@'), [a, b] = rr.split(',').map(Number); return b - a + 1 > 11 && !fs.some(f => f.end > a && f.end < b); });
  ok(long.length === 0, 'a run over 11 tiles is held in the middle too' + (long.length ? ': ' + long.map(([k]) => k).join('; ') : ''));
  const spurs = fins.filter(f => f.how === 'spur'), longest = Math.max(0, ...spurs.map(f => f.y1 - f.y)); console.log('     (' + spurs.length + ' spurs, longest ' + longest + ' rows; ' + fins.filter(f => f.how === 'rock').length + ' ends keyed into rock)'); }
/* B */
{ const dress = A.planDress(L, T), bad = [], FLOOR = new Set(['pennant', 'cairn', 'bones', 'coil', 'wheel', 'reeds']);
  for (const d of dress) { const t = at(d.tx, d.ty);
    if (FLOOR.has(d.k)) { if (!((t === T.SOLID || t === T.ONEWAY) && at(d.tx, d.ty - 1) === T.AIR)) bad.push(d.k + '@' + d.tx + ',' + d.ty + ' not on a top'); if (Math.abs(d.y - d.ty * 16) > 1) bad.push(d.k + '@' + d.tx + ' not on the tile top'); }
    else if (d.k === 'scrub') { if (!(t === T.ONEWAY && at(d.tx, d.ty + 1) === T.AIR)) bad.push('scrub@' + d.tx + ',' + d.ty + ' hangs from nothing'); }
    else bad.push('unknown kind ' + d.k);
    const ex = L.ents.filter(e => ['sign', 'check', 'stray', 'silver', 'sluice', 'waterwheel'].includes(e.t) && Math.abs(e.x - d.tx) <= 0 && Math.abs(e.y + 1 - d.ty) <= 0); if (ex.length && FLOOR.has(d.k)) bad.push(d.k + '@' + d.tx + ' on ' + ex[0].t); }
  ok(dress.length > 0 && bad.length === 0, dress.length + ' Rapids/Climb props, every one on a top or under a ledge (' + [...new Set(dress.map(d => d.k))].join(', ') + ')' + (bad.length ? ': ' + bad.slice(0, 8).join('; ') : ''));
  const pl = (L.decor || []).filter(d => d.kind === 'plume'), badp = pl.filter(d => { const t = at(d.x, d.y + 1); return !((t === T.SOLID || t === T.ONEWAY) && at(d.x, d.y) === T.AIR); });
  ok(pl.length > 0 && badp.length === 0, pl.length + ' plumes, each leaning on a top' + (badp.length ? ': ' + badp.map(d => d.x + ',' + d.y).join('; ') : ''));
  const led = M.planLedgeDress(L, T), badl = led.filter(d => !(at(d.tx, d.ty) === T.SOLID && at(d.tx, d.ty - 1) === T.AIR));
  ok(led.length > 0 && badl.length === 0, led.length + " nest-ledge props, each on a solid top" + (badl.length ? ': ' + badl.map(d => d.k + '@' + d.tx).join('; ') : '')); }
/* C */
{ const miss = []; let n = 0;
  for (let y = A.RAPIDS.y0; y <= A.RAPIDS.y1; y++) for (let x = A.RAPIDS.x0; x <= A.RAPIDS.x1; x++) { if (at(x, y) !== T.SOLID) continue; n++; if (!A.tile(T.SOLID, x, y, at, T, L)) miss.push(x + ',' + y); }
  ok(n > 0 && miss.length === 0, n + ' solid cells of the Rapids all in the river kit' + (miss.length ? ': ' + miss.slice(0, 6).join(' ') : ''));
  const q = L.arena.mat, bad = []; let m = 0;
  for (let lx = 0; lx < STAGE.W; lx++) for (let y = q.top; y <= q.R + 2; y++) { const x = q.sx + lx, t = at(x, y); if (t !== T.SOLID) continue; m++; if (!A.tile(T.SOLID, x, y, at, T, L)) bad.push(lx + ',' + y); }
  ok(m > 0 && bad.length === 0, m + " solid cells of the nest ledge's tops, pits and bed in the ledge kit" + (bad.length ? ': ' + bad.slice(0, 6).join(' ') : ''));
  const stray = []; for (let y = 148; y <= 218; y++) for (let x = 48; x <= 78; x++) if (at(x, y) === T.SOLID && A.tile(T.SOLID, x, y, at, T, L)) stray.push(x + ',' + y);
  ok(stray.length === 0, "the Climb's rock keeps the gorge's tiles (no new-ground tile on it)" + (stray.length ? ': ' + stray.slice(0, 6).join(' ') : '')); }
console.log(fails ? '\n' + fails + ' check(s) failed.' : '\nok  redgorge2-aloft'); process.exit(fails ? 1 : 0);
