/* tools/glasssea-aloft.mjs - NOTHING IN THE GLASS SEA HANGS IN THE AIR (claude/glasssea art pass; the same idea as redgorge2-aloft, the Underwell's, the Unburied Field's, Gale Moor's). NODE only, no page: a few seconds.
     A  EVERY GLASS SHELF AND EVERY FUSED SPAN STANDS ON SOMETHING   each end of every one-way run (the terraces, the Head's holds, the fused beds' tiles) is KEYED (a solid tile touches it, or sits right under
                                                                     it) or has a fulgurite POST the art draws (src/redraw/glasssea_props.js plan) down to solid glass or onto a ledge that is itself held (<= 10 hops
                                                                     to rock); no two supports of one run are more than 8 tiles apart; a run over 11 tiles that is keyed at both ends (a bridge over a crack) is
                                                                     held by an ARCH springing from the two lips. 'none' is a shelf on nothing.
     B  EVERY MASS THAT HANGS IS HELD                                the solid components that do not reach the bottom (the spire hoodoos' caps, THE DARK CUT's ridge, THE FORK OBELISK) have a spire, a plinth
                                                                     pier or glass ribs down to the ground
     C  EVERY PROP STANDS ON A TOP                                   the dressing stands on a SOLID or ONEWAY tile with air over it, on the tile's top row
     D  THE COLOSSUS'S HOLDS GROW OUT OF IT                          each of the six arena ledges has its inner end inside the body's silhouette (a limb) at its row
     E  THE KIT COVERS THE GROUND                                    every solid cell and slope east of the sand edge gets a tile of the glass kit (no cell falls through to the caravan's sand)
   Run: node tools/glasssea-aloft.mjs */
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const GP = await import('../src/redraw/glasssea_props.js');
const GT = await import('../src/redraw/glasssea_tiles.js');
const COA = await import('../src/redraw/glass_colossus_art.js');
const { isSlope } = await import('../src/slopes.js');
const { geom } = await import('../src/glass-colossus.js');
const L = LEVELS.find(l => l.id === 'glasssea').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const PL = GP.plan(L, T);
/* A */
{ const byRun = new Map(); for (const r of PL.runs) byRun.set(r.y + ':' + r.a + '-' + r.b, r);
  const bad = [], far = [], longs = [];
  for (const p of PL.posts) if (p.kind === 'none') bad.push('post@' + p.x + ',' + p.y0 + ' on nothing');
  const findRun = (x, y) => PL.runs.find(r => r.y === y && x >= r.a && x <= r.b);
  const held = (r, depth) => { if (depth > 10) return false; if (r.holds.includes('arch')) return true;
    const posts = PL.posts.filter(p => p.y0 === r.y && p.x >= r.a && p.x <= r.b && (p.bed || null) === (r.bed || null));
    if (r.keyL && r.keyR) return true;
    if (!posts.length && !(r.keyL || r.keyR)) return false;
    return posts.every(p => p.kind === 'solid' || (p.kind === 'ledge' && (() => { const t = findRun(p.x, p.y1); return !!t && held(t, depth + 1); })())); };
  const loose = PL.runs.filter(r => !held(r, 0)).map(r => r.y + ':' + r.a + '-' + r.b);
  for (const r of PL.runs) { const xs = [r.keyL ? r.a - 1 : null, ...PL.posts.filter(p => p.y0 === r.y && p.x >= r.a && p.x <= r.b && (p.bed || null) === (r.bed || null)).map(p => p.x), r.keyR ? r.b + 1 : null].filter(v => v !== null).sort((a, b) => a - b);
    if (!r.holds.includes('arch')) { for (let i = 0; i + 1 < xs.length; i++) if (xs[i + 1] - xs[i] > 8) far.push(r.y + ':' + r.a + '-' + r.b + ' gap ' + xs[i] + '..' + xs[i + 1]); if (xs.length < 1 && !(r.keyL || r.keyR)) far.push(r.y + ':' + r.a + '-' + r.b + ' no support'); } }
  for (const a of PL.arches) { const w = a.b - a.a + 1; if (!(at(a.a - 1, a.y) === T.SOLID && at(a.b + 1, a.y) === T.SOLID && w <= 16)) longs.push('arch ' + a.a + '-' + a.b + '@' + a.y + ' not lip to lip'); }
  const over = PL.runs.filter(r => r.b - r.a + 1 > 11 && !r.holds.includes('arch') && !PL.posts.some(p => p.y0 === r.y && p.x > r.a + 1 && p.x < r.b - 1 && (p.bed || null) === (r.bed || null)));
  ok(PL.runs.length > 0 && bad.length === 0, PL.runs.length + ' one-way runs (shelves, holds, fused beds), ' + PL.posts.length + ' posts and ' + PL.arches.length + ' arches planned, every post lands' + (bad.length ? ': ' + bad.slice(0, 5).join('; ') : ''));
  ok(loose.length === 0, 'every run keyed, posted or arched, every ledge-landing chain reaches rock within 10 hops' + (loose.length ? ': LOOSE ' + loose.join('; ') : ''));
  ok(far.length === 0, 'no two supports of a run are more than 8 tiles apart' + (far.length ? ': ' + far.slice(0, 5).join('; ') : ''));
  ok(longs.length === 0 && over.length === 0, 'a span over 11 tiles is held in the middle or by an arch lip to lip' + (longs.concat(over.map(r => r.y + ':' + r.a + '-' + r.b)).length ? ': ' + longs.concat(over.map(r => 'long ' + r.y + ':' + r.a + '-' + r.b)).join('; ') : '')); }
/* B */
{ const bad = []; for (const c of PL.piers) { if (!c.piers.length && c.how !== 'lens') { bad.push('mass ' + c.x0 + '-' + c.x1 + '@' + c.y0 + ' has no support'); continue; }
    if (c.how === 'spire') { for (const p of c.piers) if (!(at(p.x, p.y1 - 1) === T.AIR && (at(p.x, p.y1) === T.SOLID || at(p.x, p.y1) === T.ONEWAY || isSlope(at(p.x, p.y1))))) bad.push('spire@' + p.x + ' does not reach the ground'); }
    else if (c.how === 'lens') { if (!(at(c.x0, c.eye) === T.AIR && at(c.x0, c.eye + 1) === T.SOLID)) bad.push('the obelisk lens has nothing under it'); }
    else for (const p of c.piers) if (p.kind === 'none') bad.push(c.how + ' pier@' + p.x + ' on nothing'); }
  const spans = PL.piers.filter(c => c.how === 'piers').map(c => { const xs = c.piers.map(p => p.x).sort((a, b) => a - b); let g = 0; for (let i = 0; i + 1 < xs.length; i++) g = Math.max(g, xs[i + 1] - xs[i]); return g; });
  ok(PL.piers.length > 0 && bad.length === 0 && spans.every(g => g <= 8), PL.piers.length + ' hanging masses (' + PL.piers.map(c => c.how).join(', ') + '), every one held to the ground' + (bad.length ? ': ' + bad.slice(0, 5).join('; ') : '')); }
/* C */
{ const bad = []; for (const d of PL.dress) { const t = at(d.tx, d.ty); if (!((t === T.SOLID || t === T.ONEWAY) && at(d.tx, d.ty - 1) === T.AIR)) bad.push(d.k + '@' + d.tx + ',' + d.ty + ' not on a top'); if (Math.abs(d.y - d.ty * 16) > 1) bad.push(d.k + '@' + d.tx + ' not on the tile top');
    const ex = L.ents.filter(e => ['sign', 'check', 'stray', 'silver', 'gsmirror', 'gscampfire'].includes(e.t) && Math.abs(e.x - d.tx) <= 1 && Math.abs(e.y + 1 - d.ty) <= 0); if (ex.length) bad.push(d.k + '@' + d.tx + ' on ' + ex[0].t); }
  ok(PL.dress.length > 0 && bad.length === 0, PL.dress.length + ' props (' + [...new Set(PL.dress.map(d => d.k))].join(', ') + '), every one on a top, none on a sign, mirror, fire or checkpoint' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
  const sk = (L.decor || []).filter(d => d.kind === 'skiff' || d.kind === 'spire').filter(d => { const t = at(d.x, d.y + 1); return !((t === T.SOLID || t === T.ONEWAY || isSlope(t)) && at(d.x, d.y) === T.AIR); });
  ok(sk.length === 0, (L.decor || []).filter(d => d.kind === 'skiff' || d.kind === 'spire').length + ' skiffs and spires, each on the ground' + (sk.length ? ': ' + sk.map(d => d.kind + '@' + d.x + ',' + d.y).join('; ') : '')); }
/* D */
{ const G = geom(L.arena, 16), bad = []; const dxc = G.cx; let n = 0;
  for (const [name, runsL] of [['knee', G.knee], ['hip', G.hip], ['shoulder', G.shoulder]]) for (const l of runsL) { n++; const rowUp = G.floor - l.y, ext = COA.bodyExtent(rowUp - 2), lo = l.l - dxc, hi = l.r - dxc; if (!ext) { bad.push(name + ' above the body'); continue; }
      const inner = Math.min(Math.abs(lo), Math.abs(hi)), overlap = Math.min(hi, ext[1]) - Math.max(lo, ext[0]); if (overlap < 8) bad.push(name + ' ledge ' + Math.round(lo) + '..' + Math.round(hi) + ' at ' + rowUp + ' up misses the body ' + (ext ? Math.round(ext[0]) + '..' + Math.round(ext[1]) : '')); }
  ok(n === 6 && bad.length === 0, n + " Colossus holds (knee, hip, shoulder, both sides) each grow out of its silhouette" + (bad.length ? ': ' + bad.join('; ') : '')); }
/* E */
{ const miss = []; let n = 0; for (let y = 0; y < L.H; y++) for (let x = L.glassFrom; x < L.W; x++) { const t = at(x, y); if (t !== T.SOLID && !isSlope(t) && t !== T.ONEWAY) continue; n++; if (!GT.glassTileFor(t, x, y, at, T, L)) miss.push(x + ',' + y); }
  ok(n > 0 && miss.length === 0, n + ' glass cells (solid, slope, shelf) all in the glass kit' + (miss.length ? ': ' + miss.slice(0, 6).join(' ') : ''));
  const sand = []; for (let y = 0; y < L.H; y++) for (let x = 0; x < L.glassFrom; x++) { const t = at(x, y); if ((t === T.SOLID || isSlope(t)) && GT.glassTileFor(t, x, y, at, T, L)) sand.push(x + ',' + y); }
  ok(sand.length === 0, 'the sand edge (columns 0-' + (L.glassFrom - 1) + ') keeps the caravan sand: sand and glass read apart' + (sand.length ? ': ' + sand.slice(0, 4).join(' ') : '')); }
console.log(fails ? '\n' + fails + ' check(s) failed.' : '\nok  glasssea-aloft'); process.exit(fails ? 1 : 0);
