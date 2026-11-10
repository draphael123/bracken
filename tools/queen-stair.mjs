// tools/queen-stair.mjs - THE QUEEN'S STAIR (gq3 item 3), THE NODE HALF. No page, no browser.
//   LAYOUT   64 columns opened at 652 (the level is 829 + 12 = 841 with the 60-column tower top); the Princess's stair shrine at 650, her door shrine at 717; the dropped portcullis, the grille, the weights
//   REACH    every one of the nine heroes walks from the stair shrine to her door (the grille is a shortcut, the long way past the archer stands; the bridge is laid by three sent-back rocks)
//   ROCKS    the geode counterweights: a rock sent back from ANY standing spot on the near ledge meets a counterweight (the FIRST one left in its path), three returns = the bridge, nothing sooner;
//            the grille is shattered by a rock sent back from the second landing; a Geomancer dead = the seal / the weights fail on their own after 4 s (never a soft-lock)
//   FOES     nine on the stair (the grille's and the store's Geomancers included), none a goblin after the Queen's rule's reach (these are HER court); the murder hole #7 over her door guard
//   FALLS    a fall off the bridge lands on the store floor with a ladder back; the alcove; no spike anywhere in 652-715
// node tools/queen-stair.mjs
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS, T } = await imp('src/level.js'), { QS } = await imp('src/queen-stair.js'), { floodReach } = await imp('src/reachcore.js'), { HERO_MOVE_IDS } = await imp('src/hero-move.js');
const { GG, sweep, homeVel, inBox } = await imp('src/gob-geomancer.js');
const TS = 16, L = LEVELS.find(l => l.id === 'crown').build(), W = L.W, at = (x, y) => L.grid[y * W + x];

console.log('== LAYOUT');
ok(W === 609 + 56 + 100 + 64 + 12, 'Highcrown is 841 columns (' + W + ')');
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
ok(checks.includes(650) && checks.includes(717) && !checks.includes(653), 'the stair shrine (650) and her door shrine (717); the old 653 moved with her terrace');
ok(at(QS.PORTCULLIS.col, 14) === T.PORT && at(QS.PORTCULLIS.col, 19) === T.PORT && at(QS.PORTCULLIS.col, 13) === T.SOLID, 'the dropped portcullis: col ' + QS.PORTCULLIS.col + ' rows 14-19, stone over it');
let spikes = 0; for (let x = 652; x <= 715; x++) for (let y = 0; y < 40; y++) if (at(x, y) === T.SPIKE) spikes++; ok(spikes === 0, 'no spikes on the stair');
ok(L.arena.x0 / TS === 723 && L.arena.wallL === 722, 'her hall slid east whole (arena at 723)');
const foes = L.ents.filter(e => e.x >= 652 && e.x <= 715 && ['soldier', 'javelin', 'shield', 'archer', 'gobgeo', 'heavy', 'pike', 'hound'].includes(e.t));
ok(foes.length === 9 && foes.filter(e => e.t === 'gobgeo').length === 2, 'nine foes (' + foes.map(e => e.t).join(',') + ') of which two Geomancers');
ok(L.ents.some(e => e.t === 'murderhole' && e.n === 7 && e.x === QS.HOLE[0]) && at(QS.HOLE[0], QS.HOLE[1]) === T.AIR && at(QS.HOLE[0], QS.HOLE[1] - 1) === T.ONEWAY, 'murder hole #7: a slot under the gallery floor over her door guard');
ok(L.ents.some(e => e.t === 'heavy' && Math.abs(e.x - QS.HOLE[0]) <= 2 && e.y === 19), 'the heavy stands under it');

console.log('== REACH (all nine heroes)');
{ const marks = [[650, 19], [660, 13], [666, 11], [669, 9], [675, 7], [671, 5], [677, 5], [683, 4], [686, 8], [687, 8], [688, 8], [690, 8], [695, 8], [699, 8], [702, 8], [706, 11], [712, 19], [717, 19]];
  for (const hero of [null, ...HERO_MOVE_IDS]) { const R = floodReach(L, T, { rides: true, hero: hero || undefined, seeds: [[650, 19]] }); const miss = marks.filter(m => !R.seen.has(m[0] + ',' + m[1]));
    ok(!miss.length, (hero || 'any hero') + ': the stair shrine reaches her door' + (miss.length ? ' - MISSING ' + miss.map(m => m.join(',')).join(' ') : '')); }
  /* without the bridge laid (a plain level, no spans) the far ledge is NOT reachable on foot: the weights are a real lock */
  const L2 = { ...L, reachSpans: (L.reachSpans || []).filter(s => !(s[2] === QS.SLAB_ROW && s[0] >= 690)) }; const R2 = floodReach(L2, T, { rides: true, seeds: [[650, 19]] });
  ok(!R2.seen.has('702,8') && R2.seen.has('689,19'), 'the weights are a lock: the far ledge is out of reach until the bridge is laid, and the store floor (the fall) is reachable'); }

console.log('== ROCKS (the weights, the grille)');
const rl = id => L.rocklocks.find(k => k.id === id), g = (x, y) => ({ x: x * TS + 8, y: y * TS });
{ const ws = ['qs-w0', 'qs-w1', 'qs-w2'].map(rl); ok(ws.every(Boolean) && ws.every((k, i) => k.kind === 'weight' && k.x === QS.WEIGHTS[i] && k.lay[0][2] === QS.SLAB_ROW && k.seal === 'qs-store'), 'three weight rocklocks, bound to the store Geomancer, each laying its slab at row ' + QS.SLAB_ROW);
  const geo = L.ents.find(e => e.t === 'gobgeo' && e.seal === 'qs-store'), gc = { x: geo.x * TS + 8, y: geo.y * TS + TS - GG.h / 2 };
  /* a rock sent back from every standing spot on the near ledge (feet at the spot, struck chest high in front of the hero): it homes on him and meets the first weight left */
  const solid = (x, y) => at(Math.floor(x / TS), Math.floor(y / TS)) === T.SOLID;
  const flight = (sx, sy, smashed) => { let r = { x: sx, y: sy, vx: 0, vy: 0 }; for (let i = 0; i < 600; i++) { const hv = homeVel(r, gc.x, gc.y), w = sweep(r.x, r.y, hv.vx, hv.vy, 1 / 60, (x, y) => { for (const k of ws) { if (smashed.has(k.id)) continue; if (inBox(x, y, { l: k.box[0] * TS, r: (k.box[1] + 1) * TS, t: k.box[2] * TS, b: (k.box[3] + 1) * TS })) return { k }; } return null; }, solid);
      if (w.hit) return w.hit.k.id; if (w.wall) return 'wall'; r.x = w.x; r.y = w.y; if (Math.hypot(gc.x - r.x, gc.y - r.y) < 8) return 'geomancer'; } return 'lost'; };
  for (const [sx, st] of QS.SPOTS) { const first = flight(sx * TS + 8 + 14, (st + 1) * TS - 22, new Set()); ok(/^qs-w/.test(first), 'near ledge spot ' + sx + ',' + st + ': a rock sent back meets a counterweight first (' + first + ')'); }
  const sm = new Set(), order = []; for (let n = 0; n < 3; n++) { const f = flight(QS.SPOTS[2][0] * TS + 8 + 14, (QS.SPOTS[2][1] + 1) * TS - 22, sm); order.push(f); sm.add(f); }
  ok(new Set(order).size === 3 && order.every(f => /^qs-w/.test(f)), 'three returns drop three different weights (' + order.join(' ') + '): the bridge is complete, never sooner (a fourth finds the Geomancer)');
  ok(flight(QS.SPOTS[2][0] * TS + 8 + 14, (QS.SPOTS[2][1] + 1) * TS - 22, sm) === 'geomancer', 'with every weight down a rock sent back reaches him'); }
{ const k = rl('qs-grille'), geo = L.ents.find(e => e.t === 'gobgeo' && e.seal === 'qs-grille'), gc = { x: geo.x * TS + 8, y: geo.y * TS + TS - GG.h / 2 };
  ok(!!k && k.kind === 'seal' && k.cells[0][3] === 'net' && at(k.x, 6) === T.PORT && at(k.x, 4) === T.NET, 'the grille: a seal over the ladder foot that opens into the ladder (cells carry the net)');
  const solid = (x, y) => at(Math.floor(x / TS), Math.floor(y / TS)) === T.SOLID; let hitIt = 0, spots = 0;
  for (let hx = 671; hx <= 679; hx++) { spots++; let r = { x: hx * TS + 8 + 14, y: (7 + 1) * TS - 22 }; let got = false; for (let i = 0; i < 600 && !got; i++) { const hv = homeVel(r, gc.x, gc.y), w = sweep(r.x, r.y, hv.vx, hv.vy, 1 / 60, (x, y) => inBox(x, y, { l: k.box[0] * TS, r: (k.box[1] + 1) * TS, t: k.box[2] * TS, b: (k.box[3] + 1) * TS }) ? { k } : null, solid); if (w.hit) got = true; else { if (w.wall) break; r.x = w.x; r.y = w.y; } } if (got) hitIt++; }
  ok(hitIt === spots, 'a rock sent back from anywhere along the second landing (cols 671-679) crosses the grille on its way to him (' + hitIt + '/' + spots + ')'); }

console.log('== WIRING');
{ const fs = await import('node:fs'), rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'), m = rd('src/main.js'), gh = rd('src/gobgeo-hands.js'), hc = rd('src/highcrown2.js');
  ok(/layCells: spans/.test(m) && /to === 'net'/.test(m), 'main.js: the hands can lay a slab (kept laid: destroyed) and open a grille into a net');
  ok(/k\.kind === 'weight'/.test(gh) && /k\.seal \|\| k\.id/.test(gh), 'gobgeo-hands: a weight rocklock drops and lays its slab; the seal-fail rule covers the weights (never a soft-lock)');
  ok(/queenStairLay\(R, \{ T, TS, insertColumns \}\)/.test(hc) && /towerLay\(R/.test(hc), 'highcrown2: the stair and the tower are laid last'); }
console.log(fails ? 'FAIL queen-stair (' + fails + ')' : 'ok  queen-stair'); process.exit(fails ? 1 : 0);
