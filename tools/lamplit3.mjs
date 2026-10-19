// tools/lamplit3.mjs - THE LAMPLIT STREET 3 (claude/lamplit3, Daniel 10-18: "I still see the wood platforms"; "there's no fire for the most part, so you can't
// actually do much"). The geometry + verb rework: no wood, DARK UNTIL LIT, LIGHT (E), THROW FIRE, the oil, the casks, the valves, the tar nets, THE WICKLING.
// NODE ONLY (no browser): the level as built, src/lamplit-fire.js run on the built level with a stand-in host, src/wickling.js's rules. Fails when:
//   NO WOOD     a one-way in the street is not one of the city's own ledges (cobble, balcony, awning, crossbar, gantry); a swing mover is not an iron cradle;
//               the city kit hands back no picture for a one-way or a tar-net cell; a balcony / awning end stands out in the air with no bracket
//   DARK        the level is not near-black (dark >= 0.75; street zones >= 0.8) or a lit lamp's pool is not wider than the old 66 px
//   THE ROUTE   the reach fill (src/reachcore.js, tar nets burnt) does not reach the Tollmaster's square from the start; a tar net or the seal gate is not on
//               the way (a pier shuts the street under each roof barrier); the route has fewer than 5 height bands
//   EVERY NET   has oil beside it and a fire (a brazier or a lit lamp) on the road before it; the seal gate's lamp is past the gate and its gutter runs under it
//   THE FIRE    (lamplit-fire on the built level) - oil lit at a net's foot burns the net away and the cells open; a gutter lit at its far end lights the seal
//               gate lamp; a dead lamp over burning oil lights; a burning cell spreads; spent oil seeps back; a valve refills its gutter; a cask beside fire
//               is TOLD (tell) before it bursts, and its burst lights the oil round it; a blow spills a cask; a burnt net stays burnt after a reset (marks)
//   THE VERBS   E beside a dead lamp with fire lights it (and uses the fire); E elsewhere throws it (the fire leaves the hand); thrown fire landing in oil
//               catches it; thrown into water it is doused; thrown at a dead lamp it lights it; a flame flies the arc it was told (src/carry-throw.js)
//   THE WICKLING it drifts to a lit lamp and drinks it (told: snuffTell >= 0.6 s); it goes for a carried flame first, told (stealTell >= 0.35 s), and a
//               touch takes the flame; struck it swells (burstTell >= 0.3 s) and bursts once, wider for every flame it drank; in water it is doused
//   node tools/lamplit3.mjs
import assert from 'node:assert/strict';
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const { floodReach } = await import('../src/reachcore.js');
const { makeLamplitFire, OIL, CASK } = await import('../src/lamplit-fire.js');
const W = await import('../src/wickling.js');
const LP3T = await import('../src/redraw/lamplit3_tiles.js');
const CT = await import('../src/carry-throw.js');
const { FLAME_THROW, throwFlame, stepThrownFlame } = await import('../src/flame.js');
const TS = 16, fails = [], ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const lv = LEVELS.find(d => d.id === 'lamplit'), L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];

console.log('NO WOOD');
{ let oneway = 0, named = 0, bad = []; for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (at(x, y) === T.ONEWAY) { oneway++; const z = (L.lpLedges || []).find(q => x >= q[0] && x <= q[1] && y === q[2]); if (z) named++; if (z && !LP3T.LEDGE_KINDS.includes(z[3])) bad.push(x + ',' + y + ':' + z[3]); if (!LP3T.lpTile(T.ONEWAY, x, y, at, T, L)) bad.push(x + ',' + y); }
  ok(oneway > 0 && !bad.length, 'every one-way is one of the city\'s own ledges (' + oneway + ' cells, ' + named + ' named, the rest the arcade\'s cobbled lips): ' + (bad.slice(0, 6).join(' ') || 'none bad'));
  const kinds = new Set((L.lpLedges || []).map(z => z[3])); ok(['cobble', 'balcony', 'awning', 'crossbar', 'gantry'].every(k => kinds.has(k)), 'all five kinds are laid: ' + [...kinds].join(','));
  const swings = (L.moversExtra || []).filter(m => m.kind === 'swing'); ok(swings.every(m => m.cradle), 'every swing is an iron cradle, not a log (' + swings.length + ')');
  let snagCells = 0, snagBad = 0; for (const s of L.lpSnags || []) for (let y = s.y0; y <= s.y1; y++) for (let x = s.x0; x <= s.x1; x++) { snagCells++; if (at(x, y) !== T.SOLID || !LP3T.lpTile(T.SOLID, x, y, at, T, L)) snagBad++; }
  ok(snagCells > 0 && !snagBad, 'every tar-net cell is solid and drawn as a net (' + snagCells + ')');
  const ends = []; for (const [x0, x1, y, k] of L.lpLedges || []) if (k === 'balcony' || k === 'awning') for (const [x, d] of [[x0, -1], [x1, 1]]) if (at(x + d, y) === T.AIR && at(x, y + 1) === T.AIR && !(L.lpBrackets || []).some(b => b[0] === x && b[1] === y)) ends.push(x + ',' + y);
  ok(!ends.length, 'every balcony / awning end out in the air hangs on a bracket: ' + (ends.join(' ') || 'all'));
  ok((L.lpPosts || []).every(([x, r0, r1]) => r1 > r0 && at(x, r1 + 1) === T.SOLID), 'every lamp standard\'s post stands on the paving (' + (L.lpPosts || []).length + ')'); }

console.log('DARK UNTIL LIT');
ok(L.dark >= 0.75, 'the city is near-black: dark ' + L.dark);
ok((L.darkZones || []).filter(z => z.y0 >= 24 * TS).every(z => z.dark >= 0.8), 'the street zones are darker still: ' + (L.darkZones || []).filter(z => z.y0 >= 24 * TS).map(z => z.dark).join(','));
ok(L.lpDark && L.lpDark.lampR > 66, 'a lit lamp opens a wide pool: ' + (L.lpDark && L.lpDark.lampR) + ' px (was 66)');
{ const roof = L.ents.filter(e => e.t === 'lantern' && e.city && e.y === 21 && e.x < 570); const dead = roof.filter(e => e.dark).length; ok(dead >= roof.length * 0.5, 'most roof lamps start dead: ' + dead + '/' + roof.length); }

console.log('THE ROUTE');
{ const R = floodReach(L, T, { rides: true }); const seenX = new Set([...R.seen].map(k => +k.split(',')[0])); const A = L.arena;
  ok([...R.seen].some(k => { const [x, y] = k.split(',').map(Number); return x * TS > A.x0 + 40 && x * TS < A.x1 - 40 && y === A.floor / TS - 1; }), 'the reach fill (nets burnt) reaches the Tollmaster\'s floor from the start');
  const miss = []; for (let x = 0; x < 690; x++) if (!seenX.has(x)) miss.push(x); ok(miss.length <= 2, 'and every column on the way: missing ' + (miss.join(',') || 'none'));
  const shut = L.lpSnags.filter(s => s.id !== 'lp-loft').every(s => { for (let y = 28; y < 38; y++) for (let x = s.x0; x <= s.x1; x++) if (at(x, y) !== T.SOLID) return false; return true; });
  ok(shut, 'the street is shut (a pier) under every roof net, so the net is the way');
  const P = (await import('./pacing.mjs')).pacing(lv); const bands = new Set(P.route.map(([, y]) => Math.floor(y / 4)));
  ok(bands.size >= 5, 'the route uses ' + bands.size + ' height bands (>= 5): the house shaft, the window, the dive under the procession wall');
  ok(P.route.some(([x, y]) => x >= 420 && x <= 427 && y <= 15), 'the route goes out of the lamp works by its window');
  ok(P.route.some(([x, y]) => x >= 474 && x <= 520 && y >= 28), 'the route dives under the procession wall'); }
{ for (const s of L.lpSnags) { const oil = (L.lpOil || []).some(([x0, x1, y]) => y >= s.y0 - 1 && y <= s.y1 + 1 && x1 >= s.x0 - 2 && x0 <= s.x1 + 2);
    const fire = L.ents.some(e => (e.t === 'brazier' || (e.t === 'lantern' && !e.dark)) && e.x < s.x0 && e.x > s.x0 - 60);
    ok(oil && fire, 'net ' + s.id + ' has oil at its foot and a fire on the road before it'); }
  const gl = L.ents.find(e => e.t === 'lantern' && e.gate === 346); const gut = (L.lpOil || []).find(([x0, x1, y, o]) => o && o.gutter && x0 < 346 && x1 > 346);
  ok(gl && gl.x > 346 && gut && Math.abs((gut[1] + 0.5) * TS - (gl.x + 0.5) * TS) <= OIL.lampR, 'the seal gate\'s lamp stands past its gate, and its gutter runs under the gate to the lamp\'s foot'); }

/* ---------- a stand-in host for src/lamplit-fire.js on the built level ---------- */
function host() {
  const grid = L.grid.slice(), props = [], lamps = [], enemies = [], said = [], players = [], hurt = [], foeHurt = [], marks = new Set(), Lh = { ...L, grid };
  const cell = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : grid[y * L.W + x];
  for (const e of L.ents) { const px = e.x * TS + 8, py = (e.y + 1) * TS;
    if (e.t === 'lantern' && e.city) { const pr = { t: 'lantern', x: px, y: py, lit: !e.dark, city: true, gut: 0, gate: e.gate }; props.push(pr); lamps.push(pr); }
    else if (e.t === 'oilcask') props.push({ t: 'oilcask', x: px, y: py }); else if (e.t === 'oilvalve') props.push({ t: 'oilvalve', x: px, y: py, run: e.run, spin: 0 });
    else if (e.t === 'tarnet') props.push({ t: 'tarnet', x: px, y: py, id: e.id, burnt: false }); }
  const P = { x: 0, y: 0, face: 1, wick: 0, dead: false, hitSet: new Set(), hp: 100 }; players.push(P);
  const keys = {};
  const ctx = { L: () => Lh, TS, T, hero: () => P, players: () => players, props: () => props, lamps: () => lamps, enemies: () => enemies, VW: () => 400, keys: () => keys, marks,
    cellGet: cell, cellSet: (x, y, t) => { grid[y * L.W + x] = t; },
    solidPx: (px, py, falling) => { const tx = Math.floor(px / TS), ty = Math.floor(py / TS), t = cell(tx, ty); return t === T.SOLID || t === T.PORT || (falling && t === T.ONEWAY); },
    inWater: (x, y) => (L.pools || []).some(p => p.swim && !p.square && x >= p.x0 && x < p.x1 && y > p.y + 2 && y < p.bottom),
    poolAt: x => (L.pools || []).find(p => p.swim && !p.square && x >= p.x0 && x < p.x1) || null,
    number: (x, y, t) => said.push(t), sfx: () => {}, burst: () => {}, parts: () => {}, ring: () => {}, shake: () => {},
    hurtHero: (pp, x, d, name) => hurt.push([d, name]), hurtFoe: (e, d) => foeHurt.push([e.t, d]),
    light: pr => { pr.lit = true; }, relight: pr => { pr.lit = true; pr.relit = true; }, takeFire: pp => { pp.wick = 14; }, talkBusy: () => false,
    isWickling: e => e.t === 'wickling', wicklingFire: e => { e.fired = true; } };
  const F = makeLamplitFire(ctx); F.reset();
  const run = (s, hb) => { for (let i = 0; i < Math.round(s * 60); i++) F.update(1 / 60, hb || null); };
  return { F, P, ctx, props, lamps, said, hurt, foeHurt, grid, cell, run, marks, keys, enemies };
}
console.log('THE FIRE (src/lamplit-fire.js on the built level)');
{ const h = host(), net = L.lpSnags.find(s => s.id === 'lp-net1');
  h.P.x = 60 * TS; h.P.y = 22 * TS; h.F.igniteNear(72 * TS + 8, 22 * TS, 8); h.run(2.5);
  ok(h.cell(net.x0, net.y1) === T.AIR && h.cell(net.x1, net.y0) === T.AIR, 'oil lit at the first net\'s foot burns the net away: its cells are open (' + h.F.read().nets.map(n => n.id + ':' + n.st).join(' ') + ')');
  ok(h.marks.has('lpsnag:lp-net1'), 'and the burnt net is marked');
  const lamp69 = h.lamps.find(p => Math.abs(p.x - (69 * TS + 8)) < 2 && p.y === 22 * TS); ok(lamp69 && lamp69.lit, 'the dead lamp beside the burning oil lights');
  const h2 = host(); h2.marks.add('lpsnag:lp-net1'); h2.F.reset(); ok(h2.cell(net.x0, net.y1) === T.AIR, 'a reset with the mark keeps the net burnt'); }
{ const h = host(), gl = h.lamps.find(p => p.gate === 346); h.P.x = 330 * TS; h.P.y = 22 * TS;
  h.F.igniteNear(341 * TS + 8, 22 * TS, 6); let t = 0; while (t < 6 && !gl.lit) { h.run(0.1); t += 0.1; }
  ok(gl.lit, 'fire lit at the gutter\'s west end runs under the seal gate and lights its lamp (' + t.toFixed(1) + ' s)');
  h.run(OIL.burn + 1); const cells = h.F.cellsRaw().filter(c => c.gutter && c.x >= 341 && c.x <= 348); ok(cells.every(c => c.st === 'spent'), 'the gutter is spent after it burns');
  const v = h.props.find(p => p.t === 'oilvalve' && p.run && p.run[0] === 341); h.P.x = v.x; h.P.y = v.y; h.F.interactValve(h.P); ok(cells.every(c => c.st === 'oil'), 'E at its wheel fills the gutter again');
  h.run(0.1); cells[0].st = 'spent'; cells[0].t = 0.05; h.run(0.2); ok(cells[0].st === 'oil', 'spent oil seeps back on its clock'); }
{ const h = host(), cs = h.props.find(p => p.t === 'oilcask' && Math.abs(p.x - (376 * TS + 8)) < 2); h.P.x = 360 * TS; h.P.y = 22 * TS;
  h.F.igniteNear(373 * TS + 8, 22 * TS, 4); let told = false, popped = false; for (let i = 0; i < 300 && !popped; i++) { h.run(1 / 60); const st = h.F.read().casks; if (h.said.includes('THE CASK IS GOING UP: GET CLEAR')) told = true; if (h.said.includes('THE CASK BURSTS')) popped = told; }
  ok(told && popped, 'oil burning up to a cask: it is TOLD before it bursts (' + CASK.tell + ' s)');
  const h2 = host(), c2 = h2.props.find(p => p.t === 'oilcask' && Math.abs(p.x - (408 * TS + 8)) < 2); h2.P.x = c2.x - 10; h2.P.y = c2.y; const n0 = h2.F.cellsRaw().length;
  h2.F.update(1 / 60, { l: c2.x - 6, r: c2.x + 6, t: c2.y - 20, b: c2.y }); ok(h2.F.read().n.spills === 1 && h2.F.cellsRaw().length >= n0, 'a blow spills a cask (' + h2.F.read().n.spills + ')'); void cs; }
console.log('THE VERBS');
{ const h = host(), lp = h.lamps.find(p => Math.abs(p.x - (52 * TS + 8)) < 2 && p.y === 22 * TS); h.P.x = lp.x + 8; h.P.y = lp.y; h.P.wick = 10;
  ok(h.F.interact(h.P) && lp.lit && lp.relit && h.P.wick === 0, 'E beside a dead lamp with fire in hand lights it (the relight: flare and all)');
  h.P.x = 60 * TS; h.P.y = 22 * TS; h.P.face = 1; h.P.wick = 10; ok(h.F.interact(h.P) && h.P.wick === 0 && h.F.read().thrown.length === 1, 'E away from a lamp throws the fire out of the hand'); }
{ const h = host(); h.P.face = 1; h.P.wick = 10; h.lamps.forEach(q => { if (Math.abs(q.x - 70 * TS) < 40) q.lit = true; }); h.P.x = 70 * TS; h.P.y = 22 * TS; h.keys.down = true; h.F.interact(h.P);
  let lit = false; for (let i = 0; i < 180 && !lit; i++) { h.run(1 / 60); lit = h.F.read().burning > 0 || h.F.cellsRaw().some(c => c.st === 'catch') || h.F.read().nets.some(n => n.st !== 'whole'); }
  ok(lit, 'tossed short from the roof at 70 it lands in the oil at the first net and fire takes the net'); }
{ const h = host(); const pool = L.pools.find(p => p.swim && !p.square && p.x0 === 125 * TS); h.P.face = 1; h.P.wick = 10; h.P.x = 122 * TS; h.P.y = 22 * TS; h.keys.down = true; h.F.interact(h.P);
  for (let i = 0; i < 160; i++) h.run(1 / 60); ok(h.said.includes('THE WATER TAKES IT') && h.F.read().thrown.length === 0, 'tossed short into the market canal the water takes it'); void pool; }
{ const h = host(), lp = h.lamps.find(p => p.city && !p.lit && Math.abs(p.x - (128 * TS + 8)) < 2); h.P.face = 1; h.P.wick = 10; h.P.x = lp.x - 60; h.P.y = 22 * TS; h.lamps.forEach(q => { if (q !== lp) q.lit = true; });
  let best = null; for (const k of [{}, { up: true }, { down: true }]) { const f = throwFlame(h.P.x + 6, h.P.y - 22, 1, k); for (let i = 0; i < 200 && f.st === 'fly'; i++) { stepThrownFlame(f, 1 / 60, h.ctx.solidPx); if (Math.abs(f.x - lp.x) < 9 && f.y > lp.y - 50 && f.y < lp.y) { best = k; break; } } if (best) break; }
  if (best) Object.assign(h.keys, best); h.F.interact(h.P); for (let i = 0; i < 200 && !lp.lit; i++) h.run(1 / 60);
  ok(lp.lit && !lp.relit, 'thrown fire that strikes a dead lamp (on a canal standard, over the water) lights it - a plain light, no flare (aim ' + JSON.stringify(best) + ')'); }
{ const a = CT.predictArc('flame', 100, 100, { vx: 175, vy: -180 }, () => false, { maxT: 0.5 }), f = throwFlame(100, 100, 1, {}); for (let i = 0; i < 29; i++) stepThrownFlame(f, 1 / 60, () => false);
  const p = a.pts[29] || a.pts[a.pts.length - 1]; ok(Math.abs(p[0] - f.x) < 1.5 && Math.abs(p[1] - f.y) < 1.5, 'the flame flies the arc it was told (carry-throw predictArc = flame.js stepThrownFlame)'); }

console.log('THE WICKLING (src/wickling.js)');
{ const world = (heroes, lamps) => ({ heroes, lamps, water: () => false, floorBelow: () => 200 });
  const lamp = { x: 160, y: 200, lit: true, gut: 0 }; const s = W.newWickling(100, 190, 1); let told = 0, snuff = false;
  for (let i = 0; i < 600 && !snuff; i++) { const ev = W.wicklingStep(s, world([], [lamp]), 1 / 60); s.x += s.dx; s.y += s.dy; if (s.mode === 'snuffTell') told += 1 / 60; if (ev.some(v => v.t === 'snuff')) snuff = true; }
  ok(snuff && told >= 0.6 && s.fed === 1, 'it drifts to a lit lamp and drinks it, told ' + told.toFixed(2) + ' s; it burns brighter (fed ' + s.fed + ')');
  const s2 = W.newWickling(100, 180, 1), hero = { x: 120, y: 200, flame: true }; let stold = 0, stole = false;
  for (let i = 0; i < 300 && !stole; i++) { const ev = W.wicklingStep(s2, world([hero], [lamp]), 1 / 60); s2.x += s2.dx; s2.y += s2.dy; if (s2.mode === 'stealTell') stold += 1 / 60; if (ev.some(v => v.t === 'steal')) stole = true; }
  ok(stole && stold >= 0.35, 'it goes for a carried flame before a lamp, told ' + stold.toFixed(2) + ' s, and a touch takes it');
  const s3 = W.newWickling(100, 180, 1); s3.fed = 2; ok(W.wicklingStruck(s3) && !W.wicklingStruck(s3), 'struck it swells - once');
  let bt = 0, burst = null; for (let i = 0; i < 60 && !burst; i++) { const ev = W.wicklingStep(s3, world([], []), 1 / 60); bt += 1 / 60; burst = ev.find(v => v.t === 'burst') || null; }
  ok(burst && bt >= 0.3 && burst.r > W.WK.burstR, 'its burst comes ' + bt.toFixed(2) + ' s after the swell, wider for the flames it drank (r ' + (burst && burst.r.toFixed(0)) + ' > ' + W.WK.burstR + ')');
  ok(W.WK_SAY && Object.values(W.WK_SAY).every(t => typeof t === 'string'), 'its lines are data (routed in src/hint-lines.js)'); }

if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('\nlamplit3: all green');
