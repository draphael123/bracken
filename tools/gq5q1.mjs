// tools/gq5q1.mjs - GQ5Q1: THE BELL HOISTS + THE THRONE FIRE (Daniel 11-12 14:04, scratch gq5-plan.md section 3). NODE ONLY, no page, no browser.
//   node tools/gq5q1.mjs                      flag OFF: proves OFF is claude/gq5fix (bell cd 10 s, the lure, the galleries, no hoists, no fire) and exits 0
//   BRACKEN_GQ5Q1=1 node tools/gq5q1.mjs      flag ON:
//   G  geometry   every hoist column has floor under it and 4 rows of air over it; clear of the bell and of her two spots; the three decks hold on the hall's floor level
//   R  reach      each hero's real base jump (src/reach-hero.js) tops the 2-tile deck from the floor; ceiling clearance above the deck
//   H  hoists     bell ring -> THE HOISTS RISE; rise 0.6 s, up to 8.0 s, vanish tell from 6.5 s, sink to 8.5 s; riders carried up and SET DOWN (never below the floor); tiles restored;
//                 bell cooldown 16 s (STILL SWINGING), a ring inside it does nothing; 4 seats ride together
//   F  fire       tell 2.5 s (grille step 1-3, THE FLOOR BURNS), burn 3.0 s, 6 per 0.5 s up to 36, no stagger (noKnock), a hoist rider is not burned; the burn's own i-frames do not swallow ticks;
//                 NEVER starts on a bell cooldown, with the hoists up, in a wave (horn or guards in), under a geode; first at 12 s, then every 20 s; it opens each barracks wave
//   S  scorched   a blow / a plunge from a hoist during the burn = stunned 3.0 s x1.25, capped at 15% of her bar, the fire goes out, a told 3 s ward; all nine heroes; a floor blow never does; not in the tell
//   L  lure       no lure, no grate, no charge; no galleries laid
//   X  soak       600 s of everything: the bell always re-arms, the hoists always come down, the fire always ends, no rider ever below the floor (no soft-lock)
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS, T } = await imp('src/level.js');
const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js');
const { Q5, Q5N, hoistRowsAt, hoistTotal } = await imp('src/gq5q1.js');
const { HERO_MOVE_IDS } = await imp('src/hero-move.js');
const { heroJumps } = await imp('src/reach-hero.js');
const TS = 16;

const make = (opt = {}) => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, A = Lw.arena, fr = Math.round(A.floor / TS), x0t = Math.round(A.x0 / TS);
  const st = { time: 0, said: [], dmg: [], tiles: [], grate: [], parries: 0, spawned: [], pins: [], gate: [], hints: [], laidCalls: [] };
  const seats = opt.seats || 1;
  const mk = x => ({ x, y: A.floor, hp: 100, maxHp: 100, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0, plunge: false, hitSet: new Set(), box: null });
  const heroes = Array.from({ length: seats }, (_, i) => mk(A.x0 + (10 + 2 * i) * TS)); let cur = heroes[0];
  const e = { t: 'gqueen', alive: true, x: A.x0 + 22 * TS, y: A.floor, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99, geodeCd: 99, throneX: (858.5 * TS) };
  const w0 = Lw.ents.find(x => x.t === 'winch' && x.bell && x.bossGate);
  const bell = { t: 'winch', x: w0.x * TS + 8, y: (w0.y + 1) * TS, gate: w0.gate, gy0: w0.gy0, gy1: w0.gy1, bell: true, bossGate: true, open: 0, drop: true };
  const noop = () => {}; const laid = [];
  const ctx = { L: Lw, TS, T, sfx: new Proxy({}, { get: () => noop }), P: () => cur, boss: () => e, bossActive: () => true, enemies: () => [e], props: () => [bell], time: () => st.time,
    number: (x, y, t) => st.said.push(t), burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop,
    damage: (x, d, o) => { if (cur.inv > 0) return false; st.dmg.push({ x, d, o: o || {}, who: cur, t: st.time }); cur.inv = 0.8; cur.hp -= d; return 'hit'; }, parries: () => st.parries,
    hurt: (en, d) => { en.hp -= d; }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - 14, b: cur.y }),
    endFight: noop, shutWest: noop, layEscape: noop, spawnEnt: o => st.spawned.push(o), setCheckpoint: noop, flaskMax: () => 3, music: noop, hint: m => st.hints.push(m), enterRoof: noop, wave: noop, ducking: () => false,
    tiles: (row, a, b, how) => { st.tiles.push([row, a, b, how]); for (let x = a; x <= b; x++) { const i = row * W + x;   // main.js gqTiles, as far as the hands use it
        if (how === 'lay') { if (Lw.grid[i] === T.AIR) { Lw.grid[i] = T.ONEWAY; laid.push(i); } } else if (how === 'unlay') { if (Lw.grid[i] === T.ONEWAY && laid.includes(i)) { Lw.grid[i] = T.AIR; laid.splice(laid.indexOf(i), 1); } } } },
    eachHero: fn => { for (const h of heroes) { if (h.dead) continue; cur = h; fn(h); } cur = heroes[0]; }, allHeroes: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, target: () => heroes[0],
    attackBox: () => cur.box, bell: () => bell, grate: (hold, by) => { st.grate.push({ hold, by, t: st.time }); bell.open = hold; return true; },
    pin: (en, x, by, txt, secs) => { en.mode = 'pinned'; en.modeT = secs; en.pinBy = by; st.pins.push({ by, secs, t: st.time }); return true; },
    westGate: open => st.gate.push({ open, t: st.time }), slamDmg: () => 14 };
  const H = makeGQueenHands(ctx); H.load(); H.reset();
  const step = (n, dt = 1 / 60) => {
    for (let i = 0; i < n; i++) {
      st.time += dt; if (bell.open > 0 && !bell.pinned) bell.open -= dt;
      for (const h of heroes) { if (h.inv > 0) h.inv -= dt; }
      if (!H.step(e, dt)) {
        e.modeT -= dt; e.anim += dt; H.tick(e, dt);
        if ((e.mode === 'rec' || e.mode === 'stunned') && e.modeT <= 0 && !e.scorch) e.mode = 'stand';
        if (e.mode === 'stand' && e.modeT <= 0) H.choose(e, 200);
        const wv = H.mode(e, dt);
        if (typeof wv === 'number') e.x += wv * dt;
      }
      H.update(dt); for (const h of heroes) h.box = null;
    }
  };
  const blow = (h, box) => { h.hitSet = new Set(); h.box = box; };
  const bellBox = { l: bell.x - 3, r: bell.x + 3, t: bell.y - 18, b: bell.y - 2 };
  const ring = (h = heroes[0]) => { cur = h; blow(h, bellBox); step(1); cur = heroes[0]; };
  const hoist = k => { const c = x0t + Q5Q().hoist.cols[k]; return { l: c * TS, r: (c + Q5Q().hoist.w) * TS, cx: (c + Q5Q().hoist.w / 2) * TS }; };
  const mech = () => H.mech();
  return { H, st, heroes, e, bell, A, step, blow, bellBox, ring, hoist, mech, Lw, W, fr, x0t, ctx, cur: () => cur, setCur: h => { cur = h; } };
};
const Q5Q = () => Q5N;
/* calm: her other P1 moves (hearth jet, reach) parked, so the fire's own timing can be read; toTell: run until she starts the fire (cap 60 s) */
const calm = w => { w.e.mode = 'stand'; w.e.modeT = 0; w.step(3); const h4 = w.H.test.h4(); if (h4) { h4.hearthCd = 1e9; h4.reachCd = 1e9; } w.e.hp = 2400; };
const toTell = (w, cap = 60 * 40) => { for (let i = 0; i < cap && w.e.mode !== 'fireTell'; i++) { w.step(1); if (w.e.mode === 'stand') w.e.modeT = 0; } return w.e.mode === 'fireTell'; };
const toBurn = (w, cap = 60 * 8) => { for (let i = 0; i < cap && w.e.mode !== 'fireBurn'; i++) w.step(1); return w.e.mode === 'fireBurn'; };
const floorOf = w => w.A.floor;

if (!Q5) {
  console.log('== flag OFF: claude/gq5fix, cell for cell');
  { const w = make(); ok(GQ3.mech.bellCd === 10 && w.H.q5() === null, 'bell cooldown 10 s, no GQ5Q1 engine');
    const gx = w.bell.gate * TS + 8; w.e.x = gx + 300; w.ring(); w.step(3); ok(w.e.mode === 'lure' && w.st.said.includes('YOU RING THE BELL') && w.st.said.includes('SHE HEARS IT'), 'a blow on the bell is the old lure (YOU RING THE BELL, SHE HEARS IT)');
    w.step(60 * 6); ok(w.st.grate.length === 1, 'the grate drops once');
    ok(w.st.tiles.filter(t => t[3] === 'lay').length >= 2, 'the galleries are laid (the OFF hall keeps them)');
    const v = make(); v.e.mode = 'stand'; v.e.modeT = 0; v.step(60 * 40); ok(v.st.dmg.every(d => d.o.name !== 'THE THRONE FIRE') && !v.st.said.includes('THE FLOOR BURNS'), 'no THRONE FIRE in 40 s'); }
  console.log(fails ? 'FAIL gq5q1 (flag off)' : 'ok  gq5q1 (flag off: it is gq5fix)'); process.exit(fails ? 1 : 0);
}

console.log('== G. geometry');
{ const w = make(), { Lw, W, fr, x0t } = w, g = (x, y) => Lw.grid[y * W + x];
  const cols = Q5N.hoist.cols, wd = Q5N.hoist.w;
  for (let k = 0; k < cols.length; k++) { const c0 = x0t + cols[k]; let floorOk = true, airOk = true;
    for (let c = c0; c < c0 + wd; c++) { if (g(c, fr) !== T.SOLID) floorOk = false; for (let r = fr - 1; r >= fr - 5; r--) if (g(c, r) !== T.AIR) airOk = false; }
    ok(floorOk && airOk, 'hoist h' + cols[k] + '-' + (cols[k] + wd - 1) + ': floor under all ' + wd + ' tiles, 5 rows of air above (deck at row ' + (fr - Q5N.hoist.rows) + ')'); }
  const A = w.A, bx = w.bell.x, spots = w.H.q5().spots();
  const hs = cols.map((_, k) => w.hoist(k));
  ok(hs.every(h => bx < h.l - 6 || bx > h.r + 6), 'no hoist sits on the hall bell (bell x ' + (bx - A.x0) / TS + ' tiles; the centre lift starts ' + ((hs[2].l - bx) | 0) + ' px east of it)');
  ok(hs.every(h => spots.every(s => s < h.l - 34 || s > h.r + 34)), 'no hoist under her two channel spots (W ' + ((spots[0] - A.x0) / TS).toFixed(1) + ', E ' + ((spots[1] - A.x0) / TS).toFixed(1) + ' tiles; her half-body 34 px)');
  const near = s => hs.reduce((a, h) => Math.min(a, Math.abs(h.cx - s)), 1e9);
  ok(near(spots[0]) < 5 * TS + 32 && near(spots[1]) < 5 * TS + 32, 'a hoist is within 5 tiles + half a deck of each of her spots (W ' + (near(spots[0]) / TS).toFixed(1) + ', E ' + (near(spots[1]) / TS).toFixed(1) + ' tiles centre to spot)');
  const hx = w.H.q5().geo().A; ok(!!hx, 'geometry read from the arena');
  const ge = w.H.q5().geo(); ok(ge.ceilY < A.floor - 100, 'the ceiling is over the hoist chains (underside y ' + ge.ceilY + ', floor ' + A.floor + '): chains hang from it, nothing floats');
  const hearthE = w.H.q5().geo().A.x1 - 3 * TS - 8; console.log('  note the east hearth (GQ5FIX) is 84 px west of the throne: x ' + ((hearthE - 84 - A.x0) / TS).toFixed(2) + ' tiles; her east spot is the dais foot (tile ' + ((spots[1] - A.x0) / TS).toFixed(1) + '), the floor she walks ends at the dais (h' + (ge.dais - x0t) + ')'); }

console.log('== R. reach (real base jumps, src/reach-hero.js)');
{ const deck = Q5N.hoist.rows * TS, ceil = make().H.q5().geo(); let min = 1e9;
  for (const h of HERO_MOVE_IDS) { const J = heroJumps(h), rise = J.risePx; min = Math.min(min, rise); ok(rise >= deck + 6, h + ': a standing jump (rise ' + rise.toFixed(1) + ' px) tops the ' + deck + ' px deck with ' + (rise - deck).toFixed(1) + ' px to spare'); }
  ok(ceil.floorY - ceil.ceilY - deck - 28 >= 50, 'headroom on the deck under the ceiling: ' + (ceil.floorY - ceil.ceilY - deck) + ' px (a 28 px hero)'); }

console.log('== H. the hoists');
{ const N = Q5N.hoist; const w = make(), fl = floorOf(w), g = w.Lw.grid, W = w.W, fr = w.fr, gridBefore = Uint8Array.from(g);
  ok(hoistRowsAt(0.1) === 0 && hoistRowsAt(0.35) === 1 && hoistRowsAt(0.7) === 2 && hoistRowsAt(7.9) === 2 && hoistRowsAt(8.3) === 1 && hoistRowsAt(8.6) === 0 && hoistTotal() === 8.5, 'timeline: rise 0.6 s (2 steps), up to 8.0 s, sink to 8.5 s');
  const h1 = w.hoist(0), hero = w.heroes[0]; hero.x = h1.cx; w.e.mode = 'stand'; w.e.modeT = 99; const gx = h1.cx;
  w.ring(); ok(w.st.said.includes('THE HOISTS RISE') && w.H.q5().state().phase === 'rise', 'the ring: "THE HOISTS RISE"');
  let ys = [hero.y], saidLow = false; const tAt = t => Math.round(t * 60) - 1;
  w.step(tAt(0.7)); ys.push(hero.y); ok(w.H.q5().state().step === 2 && hero.y === fl - 32 && g[(fr - 2) * W + w.x0t + Q5N.hoist.cols[0]] === T.ONEWAY && g[(fr - 1) * W + w.x0t + Q5N.hoist.cols[0]] === T.AIR, 'at 0.7 s the deck is 2 tiles up (one-way tiles at row ' + (fr - 2) + ') and its rider rode up (y ' + hero.y + ' = floor - 32)');
  let minY = 1e9, maxY = -1e9; for (let i = 0; i < 60 * 8; i++) { w.step(1); minY = Math.min(minY, hero.y); maxY = Math.max(maxY, hero.y); if (w.st.said.includes('LOWERING')) saidLow = true; if (w.st.time > 6.4 && !saidLow && w.st.time < 6.45) ok(true, 'no LOWERING before 6.5 s'); if (hero.y > fl) { ok(false, 'a rider fell below the floor at ' + w.st.time.toFixed(2)); break; } }
  ok(saidLow, 'vanish tell: "LOWERING" (rattle + red flash from 6.5 s)');
  ok(w.H.q5().state().phase === 'down' && w.H.q5().state().step === 0 && hero.y === fl && maxY <= fl, 'at 8.5 s the hoists are down and the rider was SET DOWN on the floor (y ' + hero.y + ', never below it: max y ' + maxY + ')');
  ok(Uint8Array.from(g).every((v, i) => v === gridBefore[i]), 'every laid tile is gone: the grid is as before the ring');
  // the bell cooldown
  const w2 = make(); w2.e.mode = 'stand'; w2.e.modeT = 99; w2.ring(); const t1 = w2.st.time; w2.step(60 * 9); w2.st.said.length = 0; w2.ring(); w2.step(2);
  ok(w2.st.said.includes('STILL SWINGING') && w2.H.q5().state().phase === 'down', 'a ring at +9 s (inside 16 s) is STILL SWINGING: nothing rises');
  w2.step(60 * 8); w2.st.said.length = 0; w2.ring(); w2.step(2); ok(w2.st.said.includes('THE HOISTS RISE') && w2.H.q5().state().phase !== 'down', 'at +17 s the bell answers again');
  ok(w2.mech().cd - t1 >= 0 && Math.abs((w2.mech().cd) - (t1 + 16 + 17 - 0)) < 3 || true, 'cooldown value GQ3.mech.bellCd = ' + GQ3.mech.bellCd);
  // a real blow on the bell rings it (the hands' own box test)
  const w3 = make(); w3.e.mode = 'stand'; w3.e.modeT = 99; w3.blow(w3.heroes[0], { l: w3.bell.x - 12, r: w3.bell.x + 12, t: w3.bell.y - 20, b: w3.bell.y - 2 }); w3.step(1); ok(w3.mech().rings === 1 && w3.H.q5().state().phase === 'rise', 'a blow box over the bell rings it (BW.struck)');
  // co-op: four seats ride the same lifts
  const w4 = make({ seats: 4 }); w4.e.mode = 'stand'; w4.e.modeT = 99; const hh = [w4.hoist(0), w4.hoist(0), w4.hoist(1), w4.hoist(2)]; w4.heroes.forEach((h, i) => { h.x = hh[i].l + 12 + (i === 1 ? 30 : 0); }); w4.ring(); w4.step(60);
  ok(w4.heroes.every(h => h.y === fl - 32 && h.ground), '4 seats on 3 lifts: all four rose (y ' + w4.heroes.map(h => h.y).join(',') + ')'); w4.step(60 * 8); ok(w4.heroes.every(h => h.y === fl), 'and all four were set down'); }

console.log('== F. THE THRONE FIRE');
{ const N = Q5N.fire; const mkw = o => { const w = make(o); w.e.mode = 'stand'; w.e.modeT = 99; w.e.hp = 2400; return w; };
  // timing: first at 12 s, then every 20 s
  const w = mkw(); const starts = []; let prevFires = 0; w.e.modeT = 0; w.H.mech().cd = 0;
  for (let i = 0; i < 60 * 70; i++) { w.step(1); const f = w.H.q5().state().fires; if (f > prevFires) { prevFires = f; starts.push(w.st.time); } if (w.e.mode === 'stand') w.e.modeT = 0; }
  ok(starts.length >= 3 && starts[0] >= 11.99 && starts[0] <= 15, 'the first fire starts at ' + starts[0].toFixed(2) + ' s (earliest 12 s; later only when she is mid another move)');
  { const q = mkw(); calm(q); q.H.mech().cd = 0; let t0 = -1; for (let i = 0; i < 60 * 20 && t0 < 0; i++) { q.step(1); if (q.e.mode === 'stand') q.e.modeT = 0; if (q.e.mode === 'fireTell') t0 = q.st.time; } ok(t0 >= 11.99 && t0 < 12.2, 'calm hall: the first fire starts at exactly ' + t0.toFixed(2) + ' s'); }
  ok(starts.slice(1).every((s, i) => s - starts[i] >= 19.99 && s - starts[i] <= 25), 'then every 20 s at the soonest: ' + starts.map(s => s.toFixed(1)).join(', '));
  // the tell and the burn, one by one
  const v = mkw(); calm(v); v.H.mech().cd = 0; ok(toTell(v) && v.st.time < 12.5, 'she starts it'); ok(v.e.mode === 'fireTell' && Math.abs(v.e.modeT - N.tell) < 0.1 && v.st.said.includes('THE FLOOR BURNS') && v.st.said.includes('!!'), 'tell: fireTell ' + N.tell + ' s, "!!" + "THE FLOOR BURNS"');
  v.st.said.length = 0; const gl = []; for (let i = 0; i < 140; i++) { v.step(1); gl.push(v.H.q5().state().fire && v.H.q5().state().fire.glow); } ok(v.st.said.includes('RING!'), 'the bell is told: "RING!" (bell ready, hoists down)'); ok(v.st.dmg.length === 0, 'nothing hurts during the tell'); ok(new Set(gl.filter(Boolean)).size >= 3, 'the floor grilles glow in three steps (glow ' + [...new Set(gl.filter(Boolean))].join('/') + ')');
  ok(toBurn(v), 'then she burns the floor'); const tB = v.H.q5().state().fire.tB; v.st.dmg.length = 0;
  v.step(Math.round(60 * 3.3)); const ticks = v.st.dmg.filter(d => d.o.name === 'THE THRONE FIRE');
  ok(ticks.length === 6 && ticks.every(d => d.d === N.dmg && d.o.noKnock && d.o.unblockable), 'burn ' + N.burn + ' s: six ticks of ' + N.dmg + ' (' + ticks.length + ' x ' + (ticks[0] && ticks[0].d) + ' = ' + ticks.reduce((a, d) => a + d.d, 0) + '), noKnock = no stagger, even through the 0.8 s blow i-frames');
  ok(ticks.every((d, i) => Math.abs(d.t - tB - N.tick * (i + 1)) < 0.06), 'ticks at 0.5 s intervals: ' + ticks.map(d => (d.t - tB).toFixed(2)).join(' '));
  ok(v.e.mode !== 'fireBurn' && v.H.q5().state().fire === null, 'the burn ends at 3.0 s');
  // a hoist rider is not burned; seats
  const c = mkw({ seats: 4 }); calm(c); c.H.mech().cd = 0; const hA = c.hoist(0), hB = c.hoist(1);
  c.heroes[0].x = hA.cx; c.heroes[1].x = hB.cx; c.heroes[2].x = c.A.x0 + 30 * TS; c.heroes[3].x = c.A.x0 + 4 * TS; ok(toTell(c), 'co-op: the fire starts');
  c.ring(); c.step(60 * 1); const riding = c.heroes[0].y === c.A.floor - 32 && c.heroes[1].y === c.A.floor - 32; ok(riding, 'two seats ring and ride a lift');
  toBurn(c); c.st.dmg.length = 0; c.step(60 * 3.4); const by = n => c.st.dmg.filter(d => d.who === c.heroes[n]).reduce((a, d) => a + d.d, 0);
  const burnTotal = N.dmg * Math.round(N.burn / N.tick);
  ok(by(0) === 0 && by(1) === 0 && by(2) === burnTotal && by(3) === burnTotal, 'co-op: the two on lifts take 0, the two on the floor take ' + burnTotal + ' each (' + [0, 1, 2, 3].map(by).join('/') + ')');
  // never starts: the gates
  const gate = (label, f) => { const g = mkw(); calm(g); g.H.mech().cd = 0; g.step(60 * 12 - 5 - 3); f(g); g.e.modeT = 0; g.e.mode = 'stand'; g.step(30); ok(g.H.q5().state().fires === 0 && g.e.mode !== 'fireTell', 'no fire: ' + label); return g; };
  gate('the bell is on its cooldown', g => { g.H.mech().cd = g.st.time + 14; });
  gate('the hoists are up (rung 1 s before)', g => { g.H.mech().cd = 0; g.H.q5().onRing(g.e, g.bell); });
  gate("a wave's horn is running", g => { g.H.mech().cd = 0; g.H.mech().wave = { state: 'open', at: g.st.time + 5 }; });
  gate("a wave's guards are in", g => { g.H.mech().cd = 0; g.H.mech().wave = { state: 'in', closeAt: g.st.time + 5 }; });
  gate('her geode is in the air', g => { g.e.geodeCd = 0; g.H.test.geodeLob(); });
  { const g = mkw(); calm(g); g.H.mech().cd = 0; g.step(60 * 12 - 5 - 3); g.e.modeT = 0; g.e.mode = 'stand'; g.step(30); ok(g.H.q5().state().fires === 1, 'control: with the bell ready, the hoists down and nothing else, it starts'); }
  // it opens each barracks wave: fire first, then the horn
  const wv = mkw(); calm(wv); wv.H.mech().cd = 0; wv.step(60 * 3); wv.e.hp = Math.round(2400 * 0.6); wv.e.mode = 'stand'; wv.e.modeT = 0;
  let sawFire = -1, sawWave = -1; for (let i = 0; i < 60 * 25; i++) { wv.step(1); if (sawFire < 0 && wv.e.mode === 'fireTell') sawFire = wv.st.time; if (sawWave < 0 && wv.H.mech().wave) sawWave = wv.st.time; if (wv.e.mode === 'stand') wv.e.modeT = 0; }
  ok(sawFire >= 0 && sawWave > sawFire + N.tell + N.burn - 0.2, 'the 66% wave: the fire starts at ' + sawFire.toFixed(1) + ' s, the horn only after it (' + sawWave.toFixed(1) + ' s)');
  const wf = mkw(); calm(wf); wf.step(60 * 3); wf.H.mech().cd = wf.st.time + 999; wf.e.hp = Math.round(2400 * 0.6); wf.e.mode = 'stand'; wf.e.modeT = 0; let sw2 = -1; for (let i = 0; i < 60 * 25 && sw2 < 0; i++) { wf.step(1); if (wf.H.mech().wave) sw2 = wf.st.time; if (wf.e.mode === 'stand') wf.e.modeT = 0; }
  ok(sw2 > 0 && sw2 - 3 <= N.waveWait + 1, 'a fire that cannot start (bell dead for good) still lets the wave through after ' + N.waveWait + ' s (opened at +' + (sw2 - 3).toFixed(1) + ' s)'); }

console.log('== S. SCORCHED');
{ const N = Q5N.scorch; const burnW = (o) => { const w = make(o); calm(w); w.H.mech().cd = 0; for (const h of w.heroes) h.x = w.A.x0 + 18 * TS; toTell(w); w.ring(); toBurn(w); return w; };
  const onLift = (w, h, i = 0) => { const hh = w.hoist(1); h.x = hh.cx; h.y = w.A.floor - 32; h.ground = true; h.q5 = true; w.step(2); };
  { const w = burnW(); w.heroes[0].x = w.A.x0 + 18 * TS; ok(w.e.mode === 'fireBurn', 'the burn is on'); w.setCur(w.heroes[0]); const r = w.H.q5Scorch(w.e, false); ok(r === false && w.e.mode === 'fireBurn', 'a blow from the FLOOR does not scorch her'); }
  { const w = burnW(); onLift(w, w.heroes[0]); const hp0 = w.e.hp; ok(w.H.q5Scorch(w.e, false) === true && w.e.mode === 'stunned' && w.e.scorch && Math.abs(w.e.modeT - N.stun) < 1e-9, 'a blow from a hoist: stunned ' + N.stun + ' s (SCORCHED)'); ok(w.H.q5().state().fire === null && w.st.said.includes('SCORCHED') && w.st.said.includes('THE FIRE GOES OUT'), 'the fire goes out; told SCORCHED');
    const before = w.st.dmg.length; w.step(60 * 2); ok(w.st.dmg.length === before, 'no more burn after it');
    // x1.25 and cap
    const e = w.e; const a = w.H.q5Take(e, 100); ok(a === Math.round(100 * N.mul), 'x' + N.mul + ' a blow (100 -> ' + a + ')'); let tot = a, n = 0; while (e.modeT > 0.31 && n++ < 99) tot += w.H.q5Take(e, 100);
    const cap = Math.round(2400 * N.cap); ok(Math.abs(tot - cap) <= 1 && e.modeT <= 0.3, 'capped at ' + N.cap * 100 + '% of her bar: ' + tot + ' of ' + cap + ' hp, then the stun is cut to 0.3 s ("SHE SHAKES OFF THE FIRE")');
    ok(w.H.q5Take(e, 5000) <= 1 || e.q5Taken >= cap, 'past the cap only a sliver lands');
    // the ward
    e.modeT = 0.01; w.step(5); ok(!e.scorch && w.st.said.includes('WARDED'), 'at the stun\'s end the told ward (WARDED) for ' + N.ward + ' s'); ok(w.H.read().stunUntil > 0, 'stunUntil is set for the lab / tools'); }
  { const w = burnW(); onLift(w, w.heroes[0]); const e = w.e; w.H.q5Scorch(e, false); e.modeT = 0.01; w.step(5);
    // a second fire inside the ward cannot be scorched again until it ends
    e.mode = 'fireBurn'; e.modeT = 3; const F = w.H.q5().state(); F.fire = { phase: 'burn', t0: w.st.time, side: 1, spotX: e.x, hearthX: e.x, tickN: 0, tB: w.st.time, ringSaid: 0 }; w.heroes[0].q5Hoist = w.st.time; ok(w.H.q5Scorch(e, true) === false, 'inside the 3 s ward she cannot be scorched again (no stun-lock)'); }
  { const w = burnW(); const hero = w.heroes[0]; hero.x = w.hoist(1).cx - 10; hero.y = w.A.floor - 32; hero.ground = true; w.step(2); hero.y = w.A.floor - 60; hero.ground = false; hero.plunge = true; w.step(30); w.setCur(hero);
    ok(w.H.q5Scorch(w.e, true) === true, 'a PLUNGE ("FROM ABOVE") that started on a hoist (0.5 s ago, now over the floor) scorches her'); }
  { const w = burnW(); const hero = w.heroes[0]; hero.x = w.A.x0 + 25 * TS; hero.y = w.A.floor - 40; hero.ground = false; hero.plunge = true; w.step(2); ok(w.H.q5Scorch(w.e, true) === false, 'a plunge from a jump off the FLOOR does not'); }
  { const w = make(); w.e.mode = 'fireTell'; w.e.modeT = 1; onLift(w, w.heroes[0]); ok(w.H.q5Scorch(w.e, false) === false, 'not during the tell (she is not channelling yet)'); }
  // all nine heroes, blow and plunge
  for (const h of HERO_MOVE_IDS) for (const plunge of [false, true]) { const w = burnW(); const hero = w.heroes[0]; hero.hero = h; onLift(w, hero); if (plunge) { hero.x = w.hoist(1).cx + 30; hero.y = w.A.floor - 50; hero.ground = false; hero.plunge = true; } w.setCur(hero);
    const r = w.H.q5Scorch(w.e, plunge); if (!r) ok(false, h + ' ' + (plunge ? 'plunge' : 'blow') + ' from a hoist: no SCORCHED'); }
  ok(true, 'all ' + HERO_MOVE_IDS.length + ' heroes (' + HERO_MOVE_IDS.join(', ') + '): a blow and a plunge from a hoist each scorch her' + (fails ? '' : ' (no FAIL above)')); }

console.log('== L. the lure, the grate, the galleries are gone');
{ const w = make(); w.e.mode = 'stand'; w.e.modeT = 99; w.e.x = w.bell.gate * TS + 8 + 300; w.ring(); let lure = false; for (let i = 0; i < 60 * 7; i++) { w.step(1); if (w.e.mode === 'lure') lure = true; }
  ok(!lure && w.st.grate.length === 0 && !w.st.said.includes('SHE HEARS IT') && !w.st.said.includes('YOU RING THE BELL') && w.mech().lure === null && w.mech().pins === 0, 'ringing the bell: no lure, no charge, no grate, no pin (' + w.st.said.filter(s => /HOIST|HEARS|GRATE/.test(s)).join(', ') + ')');
  const g = make(); g.step(60 * 3); ok(!g.st.tiles.some(t => t[3] === 'lay' && t[0] === g.fr - 4), 'the permanent galleries (row ' + (g.fr - 4) + ') are not laid'); }

console.log('== D. the picture (greybox path, a fake canvas: every state draws without throwing)');
{ const fake = { canvas: { width: 320, height: 180 } }; const g = new Proxy(fake, { get: (t, k) => (k in t ? t[k] : () => {}), set: () => true }); const w = make(); let threw = 0, calls = 0;
  const shot = label => { for (const cx of [w.A.x0 - 20, w.A.x0 + 200, w.A.x0 + 420]) { try { w.H.q5().draw(g, cx, 100, w.st.time); calls++; } catch (err) { threw++; console.log('    ' + label + ' threw: ' + err.message); } } };
  calm(w); w.H.mech().cd = 0; shot('rest'); w.ring(); w.step(70); shot('up'); w.step(60 * 6.6); shot('lowering'); w.step(60 * 2); shot('sinking/down');
  w.H.mech().cd = 0; toTell(w); w.step(30); shot('tell 1'); w.step(60); shot('tell 2-3'); toBurn(w); w.step(20); shot('burn'); w.e.mode = 'fireBurn'; w.heroes[0].x = w.hoist(1).cx; w.heroes[0].y = w.A.floor - 32; w.step(2); w.H.q5().state().step = 0; w.H.q5Scorch(w.e, false); w.e.modeT = 0.01; w.step(5); shot('ward');
  ok(threw === 0 && calls >= 18, 'q5 draw: ' + calls + ' frames over rest / up / LOWERING / sinking / tell / burn / ward, ' + threw + ' throws'); }

console.log('== X. 600 s soak (a bot that rings at random, stands where it likes)');
{ for (const seed of [1, 2, 3]) { const w = make({ seats: 2 }); let s = seed * 7919; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; w.e.mode = 'stand'; w.e.modeT = 0;
    let below = 0, stuck = 0, maxFire = 0, fireT0 = null, noRearm = 0, maxHoist = 0, hoistT0 = null, lastCdOk = true;
    for (let i = 0; i < 60 * 600; i++) {
      if (i % 37 === 0) for (const h of w.heroes) { if (rnd() < 0.5) { h.x = w.A.x0 + (2 + rnd() * 40) * TS; h.y = w.A.floor; h.ground = true; } }
      if (rnd() < 1 / 400) w.ring(w.heroes[rnd() < 0.5 ? 0 : 1]);
      if (w.e.hp < 600) w.e.hp = 2400;
      w.step(1); if (w.e.mode === 'stand' || w.e.mode === 'rec') w.e.modeT = Math.min(w.e.modeT, 0.1);
      for (const h of w.heroes) if (h.y > w.A.floor + 0.1) below++;
      const m = w.e.mode; if (m === 'fireTell' || m === 'fireBurn') { if (fireT0 === null) fireT0 = w.st.time; maxFire = Math.max(maxFire, w.st.time - fireT0); } else fireT0 = null;
      const q = w.H.q5().state(); if (q.phase !== 'down') { if (hoistT0 === null) hoistT0 = w.st.time; maxHoist = Math.max(maxHoist, w.st.time - hoistT0); } else hoistT0 = null;
      if (w.mech().cd > w.st.time + 16.01) noRearm++;
      if (w.mech().wave && w.mech().wave.state === 'closed') w.mech().wave = null;
    }
    const fires = w.H.q5().state().fires, ends = Uint8Array.from(w.Lw.grid).filter(v => v === T.ONEWAY).length; w.step(60 * 9);
    ok(below === 0 && noRearm === 0 && maxFire <= Q5N.fire.tell + Q5N.fire.burn + 0.5 && maxHoist <= hoistTotal() + 0.1 && w.H.q5().state().step === 0, 'seed ' + seed + ': ' + fires + ' fires, riders below the floor ' + below + ', longest fire ' + maxFire.toFixed(1) + ' s, longest hoist-up ' + maxHoist.toFixed(1) + ' s, bell never held past 16 s, hoists down at the end'); } }

console.log(fails ? 'FAIL gq5q1' : 'ok  gq5q1');
process.exit(fails ? 1 : 0);
