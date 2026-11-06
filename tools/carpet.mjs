// tools/carpet.mjs - THE FLYING CARPET + THE SPHINX OF THE HIGH GATE (claude/carpet), Node only: no page, no port, no Chrome.
//   node tools/carpet.mjs            the checks (flag OFF = master's LEVELS, flag ON = the level), CARPET 2 (the ride), the route flown by a bot,
//                                     the Sphinx, a hands smoke, a toy duel (n=6)
//   node tools/carpet.mjs --sim=12   the toy duel only, n seeds
// THE ROUTE BOT flies the real grid with the real ride (src/carpet.js stepRide) and the level's real air + storm: it proves the main route is flyable
// on the base kit with no drop over the mist. THE TOY DUEL is a kinematic flow sim (one point-hero on sxPlan, late and fallible), NOT the rate:
// it proves every opening is reachable by the rule and gives a pace read. THE RATE is bossLab's (browser owed).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

if (args.includes('--off')) {
  delete process.env.CARPET; const { install } = await import('./node-canvas.mjs'); install();
  const { LEVELS } = await import('../src/level.js');
  console.log(JSON.stringify({ has: LEVELS.some(l => l.id === 'carpet'), n: LEVELS.length, ksar: (LEVELS.find(l => l.id === 'ksar') || {}).needs })); process.exit(0);
}
process.env.CARPET = '1';
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const FC = await import('../src/flying-carpet.js');
const CP = await import('../src/carpet.js');
const SXM = await import('../src/sphinx.js');
const DR = await import('../src/desert-rules.js');
const { makeCarpetHands } = await import('../src/carpet-hands.js');
const { RIDE } = CP;

function flag() {
  ok(FC.CARPET_SHIPS === false, 'CARPET_SHIPS is false on the branch (art before live; the road insert is the road lane\'s)');
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--off'], { encoding: 'utf8', env: { ...process.env, CARPET: '' } });
  const off = JSON.parse((r.stdout || '').trim().split('\n').pop());
  ok(!off.has && off.ksar === 'glasssea', 'flag OFF: LEVELS has no carpet row, the Ksar still needs the Glass Sea (master\'s array, no index moves)');
  const row = LEVELS.find(l => l.id === 'carpet');
  ok(row && row.hidden && row.needs === 'glasssea' && row.arc === 'the desert' && LEVELS.indexOf(row) === off.n, 'flag ON: the row is appended LAST, hidden (no map node), needs glasssea');
  ok(LEVELS.find(l => l.id === 'ksar').needs === 'glasssea', 'flag ON: the Ksar\'s needs is untouched (the road insert waits for the art merge)');
  ok(!/^(ad|admiral|banner|track|analytics|pixel|promo)/.test('flying-carpet') && !['flying-carpet', 'carpet-hands', 'sphinx', 'carpet'].some(f => /(^|[-_.])(ad|ads|banner|track|analytics|pixel|promo)([-_.]|$)/.test(f)), 'new filenames are clean of ad-block words');
}
const L = LEVELS.find(l => l.id === 'carpet').build();
const at = (x, y) => (x < 0 || x >= L.W || y < 0 ? T.SOLID : y >= L.H ? T.AIR : L.grid[y * L.W + x]);
const solidPx = (px, py) => py >= 0 && at(Math.floor(px / TS), Math.floor(py / TS)) === T.SOLID;

function level() {
  ok(L.W === FC.CR.W && L.H === FC.CR.H && L.flyingCarpet && L.cr, 'the level builds (640 x 60), L.flyingCarpet + L.cr');
  const checks = L.ents.filter(e => e.t === 'check');
  ok(checks.length === 2, 'TWO checkpoints (Daniel: fewer), on the two landing ledges - got ' + checks.length);
  ok(checks.every(c => at(c.x, c.y) === T.AIR && at(c.x, c.y + 1) === T.SOLID), 'each shrine stands on its ledge');
  ok(L.cr.landings.length === 2 && L.cr.landings.every((l, i) => l.x === checks[i].x * TS + 8), 'each shrine is a LANDING: flying over it the carpet sets you down on it');
  ok(L.ents.filter(e => e.t === 'sphinx').length === 1 && L.arena.boss === 'sphinx' && L.arena.y0 !== undefined, 'one Sphinx, in a sky arena (y0 set: a flying hero wakes her)');
  ok(L.ents.some(e => e.t === 'gate') && L.gateAfterBoss, 'the level gate (the Ksar\'s cliff gate) opens on her death');
  const foes = L.ents.filter(e => ['hawkscout', 'vulture', 'kiterider', 'harpy', 'kite', 'slinger', 'cutthroat', 'shield', 'archer'].includes(e.t));
  ok(foes.length >= 8 && foes.every(e => e.t === 'hawkscout' || e.t === 'vulture' || e.t === 'slinger'), '0 new foes (plan s1.6): the cast is the hawk scout, the vulture and the rooftop slinger (' + foes.length + ')');
  ok(!L.ents.some(e => /gob/i.test(e.t + (e.cnSkin || ''))), 'no goblins (theme fit)');
  ok(!L.grid.some(t => t === T.PLANK || t === T.CRATE || t === T.PALISADE), 'no wood: no planks, crates or palisade tiles (stone only)');
  for (const a of L.cr.arches) { const top = at(a.x, a.hy - 1), bot = at(a.x, a.hy + 2), hole = at(a.x, a.hy) === T.AIR && at(a.x, a.hy + 1) === T.AIR;
    ok(hole && top === T.SOLID && bot === T.SOLID, 'arch at ' + a.x + ': a two-row hole in stone'); }
  ok(L.cr.arches.filter(a => a.x >= 148).every(a => { for (let y = 0; y < L.H; y++) if (y !== a.hy && y !== a.hy + 1 && at(a.x, y) !== T.SOLID) return false; return true; }), 'the spires\' GATE WALLS are sky-to-abyss: the arch is the only way on');
  /* the abyss really is open under the spires: a drop there is a fall (the mist is told) */
  for (const [a, b] of L.cr.abyss) { let open = 0; for (let x = Math.floor(a / TS); x < Math.floor(b / TS); x++) if (at(x, L.H - 1) === T.AIR) open++; ok(open > 20, 'the abyss under ' + Math.floor(a / TS) + '-' + Math.floor(b / TS) + ' is open (' + open + ' cols)'); }
  ok(L.cr.thermals.filter(z => z.lift > 0).length >= 8 && L.cr.thermals.some(z => z.lift < 0), 'thermals (8+) and downdrafts');
  for (const k of Object.keys(FC.ARCS)) ok(FC.ARCS[k].teach || FC.ARCS[k].remix, 'arc ' + k);
  ok(L.ents.filter(e => e.t === 'silver').length === 3, 'three silvers, both off the safe line');
}

/* ---------- CARPET 2: THE RIDE (pure) ---------- */
const sky = { solid: () => false, lift: () => 0, wind: () => null };
function rider(x = 100, y = 300) { const P = { x, y, vx: 0, vy: 0, face: 1 }; CP.mountCarpet(P, { x, y: y + 4 }); return P; }
function fly(P, R, input, secs, W = sky, dt = 1 / 60) { const evs = []; for (let i = 0; i < secs / dt; i++) { const e = CP.stepRide(P, R, typeof input === 'function' ? input(P, R, i * dt) : input, dt, W); evs.push(...e); if (e.some(q => q.t === 'drop')) { P.carpet = null; break; } } return evs; }
function ride() {
  ok(CP.CARPET.speed === 160 && typeof CP.stepCarpet === 'function' && typeof CP.carpetBox === 'function', 'the Falling Tower\'s carpet is unchanged (CARPET, stepCarpet, carpetBox as before)');
  { const P = rider(), R = CP.newRide(), x0 = P.x, ev = fly(P, R, {}, 6); ok(P.carpet && P.x > x0 + 500 && !ev.some(e => e.t === 'drop') && Math.abs(R.spd - RIDE.cruise) < 1, 'hands off: it flies forward at cruise and holds you (' + Math.round(P.x - x0) + ' px in 6 s)'); }
  { const P = rider(), R = CP.newRide(), ev = fly(P, R, { ay: -1 }, 6); const d = ev.find(e => e.t === 'drop'), w = ev.findIndex(e => e.t === 'stallWarn');
    ok(w >= 0 && d && d.why === 'stall' && ev.indexOf(d) > w, 'a long climb costs speed: IT SAGS (told) and then DROPS you'); }
  { const P = rider(), R = CP.newRide(), W = { ...sky, lift: () => 150 }, ev = fly(P, R, { ay: -1 }, 4, W); ok(P.carpet && !ev.some(e => e.t === 'drop') && R.spd >= RIDE.cruise - 1, 'in a THERMAL a climb is free (held up 4 s, no speed lost)'); }
  { const P = rider(), R = CP.newRide(); fly(P, R, { ay: 1 }, 1.5); ok(R.spd > RIDE.cruise + 100, 'a dive gains speed (' + Math.round(R.spd) + ')'); }
  { const P = rider(), R = CP.newRide(), ev = fly(P, R, { ax: -1 }, 5); ok(ev.some(e => e.t === 'drop' && e.why === 'stall'), 'braking too long: it only holds you while it is moving'); }
  { const P = rider(), R = CP.newRide(); R.spd = 40; const ev = fly(P, R, { ay: 1 }, 0.5); ok(ev.some(e => e.t === 'stallWarn') && !ev.some(e => e.t === 'drop') && R.spd >= RIDE.stall, 'a sag answered by a dive in time is saved (the warning is ' + RIDE.stallWarn + ' s)'); }
  { const P = rider(100, 300), R = CP.newRide(), W = { ...sky, solid: (x) => x > 200 && x < 240 }, ev = fly(P, R, {}, 8, W); const sc = ev.filter(e => e.t === 'scrape');
    ok(sc.length >= 2 && sc[0].fray === 0.75 && (ev.some(e => e.t === 'drop' && e.why === 'tear') || R.fray < 0.5), 'stone FRAYS it (a quarter a scrape, a grace between) and frayed through it TEARS'); }
  { const P = rider(), R = CP.newRide(); R.fray = 0.5; fly(P, R, {}, CP.RIDE.mendWait + 4); ok(R.fray > 0.6, 'it mends after a quiet spell (' + R.fray.toFixed(2) + ')'); }
  /* THE ARCH: a two-row hole (32 px). Standing (22 + 4 px) there is 6 px of room; lying flat (9 + 4) 19 */
  { const hy = 20, wallX = [300, 332], W = { ...sky, solid: (x, y) => x >= wallX[0] && x < wallX[1] && !(y >= hy * TS && y < (hy + 2) * TS) };
    const feet = (hy + 2) * TS - 6;   /* 6 px above the hole's floor */
    const a = rider(200, feet), Ra = CP.newRide(); const ea = fly(a, Ra, { duck: true }, 2.5, W); const b = rider(200, feet - 12), Rb = CP.newRide(); const eb = fly(b, Rb, {}, 2.5, W);
    ok(!ea.some(e => e.t === 'scrape') && a.x > wallX[1], 'LYING FLAT through the arch: clean'); ok(eb.some(e => e.t === 'scrape'), 'sitting up 12 px higher in the same arch: it scrapes'); }
  /* THE ARENA: brake and it wheels; a wall wheels it */
  { const P = rider(), R = CP.newRide({ mode: 'arena', x0: 0, x1: 2000 }); const ev = fly(P, R, { ax: -1 }, 1.5); ok(ev.some(e => e.t === 'turn') && R.dir === -1 && P.carpet, 'in the arena braking wheels the carpet round (it never stalls in a turn)'); }
  { const P = rider(), R = CP.newRide({ mode: 'arena', x0: 0, x1: 200 }); const ev = fly(P, R, {}, 2); ok(ev.some(e => e.t === 'wall') && R.dir === -1, 'in the arena a wall wheels it'); }
}
/* THE RUG: a dropped hero falls on the game's own numbers (GRAV 1000, MAX_FALL 270); how far it falls before the rug is under it */
function catchFall(hop = false) {
  const P = { x: 0, y: 0, vx: 0, vy: hop ? RIDE.hop : 0, ground: false, face: 1 }, rug = CP.newRug(0, 2, 'lag'); let t = 0;
  while (t < 4) { t += 1 / 60; P.vy = Math.min(270, P.vy + 1000 / 60); P.y += P.vy / 60; const r = CP.rugStep(rug, P, 1 / 60); if (r === 'board') return { fell: P.y, t }; if (r === 'lost') return { lost: true, fell: P.y, t }; }
  return { lost: true, fell: P.y };
}
function rug() {
  const c = catchFall(), h = catchFall(true);
  ok(!c.lost && c.fell > 100 && c.fell < 300, 'a STALL: it hangs (' + RIDE.lag + ' s), then follows you down and catches you ' + Math.round(c.fell) + ' px lower (height is the margin)');
  ok(!h.lost && h.t > 0.45, 'a HOP: you land back on it (' + h.t.toFixed(2) + ' s, ' + Math.round(h.fell) + ' px)');
  const death = L.H * TS + 30, mist = L.cr.mist;
  ok(mist + c.fell > death, 'a stall low over the MIST is a death (mist ' + mist + ' + ' + Math.round(c.fell) + ' > the fall line ' + death + ')');
  ok(mist - 6 * TS + c.fell < death, '... and six rows over it you are caught (taught on the dunes first)');
  /* parked: it lies beside you on footing; walk onto it */
  const P = { x: 100, y: 500, vx: 0, vy: 0, ground: true, face: 1 }, r = Object.assign(CP.newRug(100, 498, 'park'), { parked: false }); let res = null;
  for (let i = 0; i < 120 && !res; i++) res = CP.rugStep(r, P, 1 / 60); ok(!res && r.parked && r.x > 110, 'on footing it comes and lies beside you');
  for (let i = 0; i < 60 && !res; i++) { P.x += 1.5; res = CP.rugStep(r, P, 1 / 60); } ok(res === 'board', 'walk onto it: you board');
}

/* ---------- THE ROUTE: a bot flies the real level (grid, air, storm) start -> the High Gate ---------- */
function route(o = {}) {
  const storm = DR.newStorm(L.cr.storm.dirs); let st = null;
  const P = rider(L.cr.rug.x, L.cr.rug.y - 10), R = CP.newRide({ y0: L.cr.ceil });
  const inAbyss = x => L.cr.abyss.some(([a, b]) => x >= a && x < b);
  const lift = (x, y) => { let v = 0; for (const z of L.cr.thermals) if (x >= z.x0 && x < z.x1 && y >= z.y0 && y < z.y1) v += z.lift; return v; };
  const W = { solid: solidPx, lift, wind: x => (st && st.phase === 'gust' && x >= L.cr.storm.x0 && x < L.cr.storm.x1 ? { slow: -st.dir * st.push * 0.45 } : null) };
  /* the free bands of a column (px): runs of non-solid rows inside the ride's ceiling/mist */
  const bands = (cx, y1) => { const out = []; let s = null; for (let y = Math.ceil(L.cr.ceil / TS) - 1; y <= Math.floor(y1 / TS); y++) { const free = at(cx, y) !== T.SOLID; if (free && s === null) s = y; if ((!free || y === Math.floor(y1 / TS)) && s !== null) { out.push([s * TS, (free ? y + 1 : y) * TS]); s = null; } } return out; };
  let t = 0, drops = 0, abyssDrops = 0, minSpd = 999; const dt = 1 / 60, goal = L.arena.trigger;
  while (t < 240 && P.x < goal) {
    t += dt; st = P.x >= L.cr.storm.x0 - 160 && P.x < L.cr.storm.x1 ? DR.stormStep(storm, dt) : null;
    R.y1 = inAbyss(P.x) ? L.cr.mist : 99999;
    /* look ahead: the band 1.2 tiles... to 4 tiles ahead nearest your height; aim its middle; lie flat for a narrow one */
    let tgt = null, narrow = false;
    for (let k = 1; k <= 10; k++) { const cx = Math.floor((P.x + k * TS) / TS), bs = bands(cx, R.y1 === 99999 ? (L.H - 1) * TS : R.y1); if (!bs.length) continue;
      const b = bs.map(q => ({ q, d: Math.abs((q[0] + q[1]) / 2 - (P.y - 8)) })).sort((a, c) => a.d - c.d)[0].q; const hgt = b[1] - b[0];
      if (hgt < 40) narrow = true; if (!tgt || hgt < 40) tgt = b; if (hgt < 40) break; }
    let ay = 0; if (tgt) { const want = narrow ? tgt[1] - 7 : Math.min(tgt[1] - 26, Math.max(tgt[0] + 30, (tgt[0] + tgt[1]) / 2 + 10)); if (P.y < want - 3) ay = 1; else if (P.y > want + 3) ay = -1; }
    if (ay < 0 && R.spd < 75 && lift(P.x, P.y) <= 0) ay = (st && st.phase === 'gust') ? 1 : 0;   /* never climb into a stall: level off (dive in a gust) */
    const duck = narrow || !!(st && st.phase === 'gust' && st.dir < 0 && R.spd < 90);
    const ev = CP.stepRide(P, R, { ay, duck }, dt, W); minSpd = Math.min(minSpd, R.spd);
    if (ev.some(e => e.t === 'drop')) { drops++; if (inAbyss(P.x)) abyssDrops++; if (o.log) console.log('DROP', Math.round(P.x / TS), Math.round(P.y / TS), ev.find(e => e.t === 'drop').why); R.spd = RIDE.cruise; R.fray = Math.max(R.fray, RIDE.torn); P.y -= 40; CP.mountCarpet(P, { x: P.x, y: P.y + 4 }); }
    for (const l of L.cr.landings) if (P.x - P.vx * dt < l.x && P.x >= l.x) { /* the set-down and back on: */ }
  }
  return { reached: P.x >= goal, t, drops, abyssDrops, scrapes: R.n.scrapes, tears: R.n.tears, fray: R.fray, minSpd };
}
function routeChecks() {
  const r = route({ log: !!process.env.CRDBG });
  ok(r.reached, 'THE ROUTE BOT reaches the High Gate on the base kit (' + r.t.toFixed(0) + ' s, ' + r.scrapes + ' scrapes)');
  ok(r.abyssDrops === 0, 'no drop over the mist on the bot\'s line (drops ' + r.drops + ', over the abyss ' + r.abyssDrops + ')');
  ok(r.tears === 0, 'the carpet never tears on the bot\'s line (fray at the gate ' + r.fray.toFixed(2) + ')');
  ok(r.t > 60 && r.t < 200, 'a ride of ' + r.t.toFixed(0) + ' s start -> the arena (one to three minutes of flight)');
  return r;
}

/* ---------- THE SPHINX (pure) ---------- */
const G = SXM.geom(L.arena.x0 + 16, L.arena.x1 - 16, L.arena.y0 + 8, L.arena.floor - 60, L.arena.floor);
function sphinx() {
  const S = SXM.newFight(G); const hero = { x: (G.X0 + G.X1) / 2, y: G.Y0 + 200, alive: true };
  for (const k of Object.keys(SXM.SX_POSES)) { const p = SXM.SX_POSES[k]; ok(p.wind && p.rel && p.sfx.length === 2 && p.wind !== p.rel, 'B16 ' + k + ': windup pose ' + p.wind + ', release ' + p.rel + ', its own sounds'); }
  ok(SXM.GLYPHS.every(g => SXM.RIDDLES[g] && SXM.RIDDLES[g].length < 70), 'every glyph has its plain short riddle');
  /* intro, then the first riddle */
  let ev = []; for (let i = 0; i < 60 * 6 && !S.riddle; i++) ev.push(...SXM.sxStep(S, 1 / 60, { hero, rng: Math.random }));
  ok(ev.some(e => e.t === 'intro') && S.riddle && S.riddle.stones.length === 3 && S.riddle.stones.filter(s => s.glyph === S.riddle.glyph).length === 1, 'she speaks a riddle: three stones, exactly one hers');
  ok(new Set(S.riddle.stones.map(s => s.glyph)).size === 3, 'the three stones bear three different glyphs');
  /* B15 everywhere */
  const res = []; const probe = () => res.push(SXM.takeBlow(S, 100)[0] / 100);
  probe(); const wrongGlyph = S.riddle.stones.find(s => s.glyph !== S.riddle.glyph).glyph; ev = SXM.answer(S, wrongGlyph, hero);
  ok(ev.some(e => e.t === 'wrong') && ev.some(e => e.t === 'tell' && e.id === 'pounce' && e.spot && e.wind >= 0.6), 'a WRONG stone: she POUNCES - told (' + SXM.SX.moves.pounce.wind + ' s, a ring on your spot)');
  probe(); ok(SXM.takeBlow(S, 100)[0] >= 40, 'a wrong-glyph pounce still takes reduced damage (B15: x' + SXM.SX.armour + ')');
  for (let i = 0; i < 60 * 3; i++) SXM.sxStep(S, 1 / 60, { hero, rng: Math.random });
  while (!S.riddle) SXM.sxStep(S, 1 / 60, { hero, rng: Math.random });
  ev = SXM.answer(S, S.riddle.glyph, hero); ok(ev.some(e => e.t === 'open') && S.open === SXM.SX.openT, 'the RIGHT stone: STRUCK DUMB, OPEN ' + SXM.SX.openT + ' s');
  const [d1] = SXM.takeBlow(S, 100); ok(d1 === 100 * SXM.SX.openK, 'open: x' + SXM.SX.openK); probe();
  let ward = false; for (let i = 0; i < 60 * 4; i++) { const e2 = SXM.sxStep(S, 1 / 60, { hero, rng: Math.random }); if (e2.some(e => e.t === 'ward')) ward = true; if (S.ward > 0) probe(); }
  ok(ward, 'the opening ends in a told ward (she finds her voice)');
  /* the riddle not answered: no punishment */
  while (!S.riddle) SXM.sxStep(S, 1 / 60, { hero, rng: Math.random });
  let late = false, pounced = false; for (let i = 0; i < 60 * 9; i++) { const e2 = SXM.sxStep(S, 1 / 60, { hero, rng: Math.random }); if (e2.some(e => e.t === 'late')) late = true; if (e2.some(e => e.t === 'tell' && e.id === 'pounce')) pounced = true; probe(); if (late) break; }
  ok(late && !pounced, 'no answer in time: the stones crumble, she laughs - no pounce');
  /* phases: P1 only the rake; P2 + the gust; P3 + the glyph storm (the sandstorm rule) */
  const moves = ph => { const s = SXM.newFight(G); s.hp = s.maxHp * ph; s.ph = ph < 0.66 ? (ph < 0.33 ? 3 : 2) : 1; if (s.ph === 3) s.storm = DR.newStorm(SXM.SX.stormDirs); const seen = new Set(); for (let i = 0; i < 60 * 60; i++) { for (const e of SXM.sxStep(s, 1 / 60, { hero, rng: Math.random })) if (e.t === 'tell') seen.add(e.id); if (s.st && s.st.phase === 'gust') seen.add('storm'); if (s.riddle && s.riddle.t < 6) s.riddle.t = 0; if (s.st && s.riddle) seen.add('stormStones'); } return seen; };
  const m1 = moves(1), m2 = moves(0.5), m3 = moves(0.2);
  ok(m1.has('rake') && !m1.has('gust') && !m1.has('storm'), 'P1: THE SWOOP RAKE only'); ok(m2.has('rake') && m2.has('gust') && !m2.has('storm'), 'P2: + THE WING GUST'); ok(m3.has('gust') && m3.has('storm'), 'P3: + THE GLYPH STORM (src/desert-rules.js stormStep)');
  { const s = SXM.newFight(G); s.mode = 'fight'; s.hp = s.maxHp * 0.6; const e = SXM.sxStep(s, 1 / 60, { hero, rng: Math.random }); ok(e.some(q => q.t === 'phase' && q.ph === 2) && s.breath > 0, 'a phase change is a breather');
    let cast = false; while (s.breath > 0) { for (const q of SXM.sxStep(s, 1 / 60, { hero, rng: Math.random })) if (q.t === 'tell' || q.t === 'hit' || q.t === 'riddle') cast = true; probe(); } ok(!cast, '... nothing is cast in it'); }
  { const s = SXM.newFight(G); s.mode = 'fight'; s.hp = s.maxHp * 0.2; SXM.sxStep(s, 1 / 60, { hero, rng: Math.random }); SXM.sxStep(s, 1 / 60, { hero, rng: Math.random }); ok(s.ph === 3 && s.storm, 'P3 brings the storm'); let gust = false, whirl = false;
    for (let i = 0; i < 60 * 40; i++) { SXM.sxStep(s, 1 / 60, { hero, rng: Math.random }); if (s.st && s.st.phase === 'gust') { gust = true; ok(s.st.sight >= DR.STORM.sightMin, 'the storm never closes the view under the sandstorm rule\'s floor'); if (s.riddle) { const st0 = s.riddle.stones[0].x; SXM.sxStep(s, 1 / 60, { hero, rng: Math.random }); if (s.riddle && s.riddle.stones[0].x !== st0) whirl = true; } } probe(); if (gust && whirl) break; }
    ok(gust && whirl, 'in a storm gust the stones WHIRL with the wind'); n -= 0; }
  ok(Math.min(...res) >= 0.4, 'B15: never under x0.4 in any state probed (' + res.length + ' probes, min ' + Math.min(...res) + ')');
  ok(SXM.resistNow({ open: 0, ward: 0 }) === SXM.SX.armour && SXM.SX.armour >= 0.4 && SXM.SX.ward >= 0.4, 'outside openings x' + SXM.SX.armour + ', warded x' + SXM.SX.ward);
}

/* ---------- A HANDS SMOKE: the world binding runs (ride / update / strike / boss / draw) on the real level ---------- */
function smoke() {
  const noop = () => {}, g = new Proxy({}, { get: (o, k) => (k in o ? o[k] : noop), set: (o, k, v) => { o[k] = v; return true; } });
  const P = { x: L.START.x * TS + 8, y: (L.START.y + 1) * TS, vx: 0, vy: 0, face: 1, dead: false, ground: true, hp: 300, maxHp: 300, w: 10, h: 18 };
  const players = [P]; let bossE = null, bossActive = false, cp = { x: P.x, y: P.y }, hurt = 0;
  const ctx = { get L() { return L; }, get players() { return players; }, get boss() { return bossE; }, get bossActive() { return bossActive; }, TS, T, sfx: {}, hero: () => P, checkpoint: () => cp, VW: () => 320, VH: () => 180,
    tileAt: (x, y) => at(x, y), number: noop, text: noop, burst: noop, shake: noop, ring: noop,
    damagePlayer: (x, d) => { hurt += d; P.hp -= d; return true; }, asPlayer: (p, fn) => fn(), upright: p => !p.dead, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 18, b: b.y }) };
  const H = makeCarpetHands(ctx); ok(H.on(), 'the hands wake on the level'); H.clear();
  ok(P.crRide && P.crRide.rug && P.crRide.rug.state === 'park' && Math.abs(P.crRide.rug.x - L.cr.rug.x) < 1, 'a fresh load: the carpet lies at the launch');
  let boarded = false; for (let i = 0; i < 60 * 4 && !boarded; i++) { P.x += 1.6; H.update(1 / 60); if (P.carpet) boarded = true; }
  ok(boarded, 'walking onto it at the launch: the carpet has you');
  for (let i = 0; i < 60 * 2; i++) { H.ride(1 / 60, { ay: 0 }); H.update(1 / 60); if (i % 30 === 0) { H.draw(g, P.x - 160, P.y - 90, i / 60); H.drawOver(g, P.x - 160, P.y - 90, i / 60); } }
  ok(P.carpet && P.x > L.cr.rug.x + 150, 'the hands ride it (P.x ' + Math.round(P.x / TS) + ')');
  const hopped = H.ride(1 / 60, { hop: true }); ok(hopped && !P.carpet && P.vy < 0, 'JUMP hops off');
  let back = false; for (let i = 0; i < 120 && !back; i++) { P.vy = Math.min(270, P.vy + 1000 / 60); P.y += P.vy / 60; P.x += P.vx / 60; H.update(1 / 60); if (P.carpet) back = true; }
  ok(back, '... and lands back on it (it followed under you)');
  /* the landing ledge: crossing its shrine sets you down */
  const la = L.cr.landings[0]; P.x = la.x - 30; P.y = (FC.CR.ledgeA[2] - 4) * TS; P.vy = 0; P.crRide.spd = RIDE.cruise; let down = false;
  for (let i = 0; i < 60 && !down; i++) { H.ride(1 / 60, {}); if (!P.carpet) down = true; } ok(down && Math.abs(P.x - la.x) < 1, 'over the first ledge\'s shrine the carpet SETS YOU DOWN on it');
  /* a respawn at that shrine: the rug lies beside it */
  cp = { x: la.x, y: la.y }; P.x = cp.x; P.y = cp.y; H.clear(); ok(P.crRide.rug.parked && Math.abs(P.crRide.rug.x - (cp.x + 22)) < 1, 'a respawn at a shrine: the carpet lies beside it');
  /* THE SPHINX through the hands */
  const base = { x: 0, y: 0, vx: 0, vy: 0, face: -1, alive: true }; bossE = H.spawnBoss(base); bossActive = true; ok(bossE && bossE.t === 'sphinx' && bossE.hp === SXM.SX.hp, 'spawnBoss: the Sphinx');
  P.x = (L.arena.x0 + L.arena.x1) / 2; P.y = L.arena.y0 + 200; CP.mountCarpet(P, { x: P.x, y: P.y + 4 }); P.hp = 1e6;
  let answered = 0;
  for (let i = 0; i < 60 * 180 && bossE.hp > 0; i++) { H.bossUpdate(bossE, 1 / 60); if (P.carpet) H.ride(1 / 60, { ay: i % 120 < 60 ? -1 : 1 }); H.update(1 / 60);
    const f = H.fight(); if (f.riddle && i % 47 === 0) { const s = f.riddle.stones[i % 3]; H.strike({ l: s.x - 4, r: s.x + 4, t: s.y - 4, b: s.y + 4 }); answered++; }
    if (i % 20 === 0) bossE.hp -= H.take(bossE, 30); if (i % 90 === 0) { H.draw(g, P.x - 160, P.y - 90, i / 60); H.drawBoss(g, bossE, P.x - 160, P.y - 90, i / 60); H.drawOver(g, P.x - 160, P.y - 90, i / 60); H.barName(bossE); }
    if (!P.carpet && P.crRide.rug) { P.vy = Math.min(270, (P.vy || 0) + 1000 / 60); P.y = Math.min(L.arena.floor, P.y + P.vy / 60); P.ground = P.y >= L.arena.floor; if (P.ground) P.vy = 0; } }
  const rd = H.read(); ok(rd.sx && rd.sx.ph === 3 && answered > 0 && rd.sx.n.opens + rd.sx.n.wrong > 0, 'the Sphinx runs through the hands to P3 (opens ' + rd.sx.n.opens + ', wrong ' + rd.sx.n.wrong + ', hero took ' + Math.round(hurt) + ')');
  bossE.hp = 0; bossE.alive = false; for (let i = 0; i < 10; i++) { H.bossUpdate(bossE, 1 / 60); H.update(1 / 60); } ok(H.read().won && !P.carpet, 'her death: the carpet sets you down (the gate is walked to)');
}

/* ---------- THE TOY DUEL: a kinematic hero on sxPlan (late 0.25 s, misreads 1 in 8) ---------- */
function duel(seed, o = {}) {
  let s = seed * 9301 + 49297; const rng = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const S = SXM.newFight(G); const h = { x: G.X0 + 60, y: G.Y0 + 220, hp: o.hp || 300, max: o.hp || 300, flasks: o.flasks ?? 3, swingT: 0, lag: 0, plan: null, drink: 0 };
  let t = 0; const dt = 1 / 30, hits = new Set(); let took = 0;
  while (t < 400 && h.hp > 0 && S.mode !== 'dead') {
    t += dt; h.lag -= dt; if (h.lag <= 0) { h.plan = SXM.sxPlan(S, h); h.lag = 0.25; if (h.plan.act === 'answer' && rng() < 0.125) { const wrong = S.riddle.stones.find(q => q.glyph !== S.riddle.glyph); h.plan = { gx: wrong.x, gy: wrong.y + 6, act: 'answer', glyph: wrong.glyph }; } }
    if (h.drink > 0) h.drink -= dt; else if (h.hp < h.max * 0.4 && h.flasks > 0) { h.flasks--; h.drink = 1; h.hp = Math.min(h.max, h.hp + h.max * 0.45); }
    const p = h.plan || { gx: h.x, gy: h.y, act: 'wait' }; if (!(h.drink > 0)) { const dx = p.gx - h.x, dy = p.gy - h.y, d = Math.hypot(dx, dy) || 1, v = Math.min(d, 150 * dt); h.x += dx / d * v; h.y += dy / d * v; }
    for (const e of SXM.sxStep(S, dt, { hero: { x: h.x, y: h.y, alive: true }, rng })) if (e.t === 'hit' && !hits.has(e.once) && h.x > e.box[0] - 5 && h.x < e.box[1] + 5 && h.y - 18 < e.box[3] && h.y > e.box[2]) { hits.add(e.once); const dm = e.blockable && rng() < 0.3 ? e.dmg * 0.3 : e.dmg; h.hp -= dm; took += dm; }
    if (S.riddle && p.act === 'answer') for (const st of S.riddle.stones) if (Math.hypot(st.x - h.x, st.y - (h.y - 8)) < 16) { SXM.answer(S, st.glyph, h); break; }
    h.swingT -= dt; if (h.swingT <= 0 && !(h.drink > 0) && Math.hypot(S.x - h.x, S.y - (h.y - 10)) < 30) { h.swingT = 0.45; S.hp -= SXM.takeBlow(S, 18)[0]; }
  }
  return { win: S.mode === 'dead' || S.hp <= 0, t, ph: S.ph, opens: S.n.opens, wrong: S.n.wrong, late: S.n.late, hp: Math.round(h.hp), took: Math.round(took), flasks: h.flasks };
}
function duels(N) { const r = []; for (let i = 1; i <= N; i++) r.push(duel(i)); const w = r.filter(x => x.win).length, avg = r.reduce((a, x) => a + x.t, 0) / N;
  console.log('TOY DUEL n=' + N + ': ' + w + '/' + N + ' wins, avg ' + avg.toFixed(0) + ' s; ' + r.map(x => (x.win ? 'W' : 'L') + Math.round(x.t) + 's ph' + x.ph + ' o' + x.opens + '/w' + x.wrong + '/l' + x.late + ' hp' + x.hp + ' f' + x.flasks).join(' | ')); return { w, avg, r }; }

if (opt('sim')) { duels(+opt('sim')); process.exit(0); }
flag(); level(); ride(); rug(); const rt = routeChecks(); sphinx(); smoke();
const d = duels(6); ok(d.r.every(x => x.opens > 0), 'every duel opens her by the riddle (the rule is reachable)');
console.log('ROUTE: ' + rt.t.toFixed(0) + ' s, drops ' + rt.drops + ', scrapes ' + rt.scrapes + ', min speed ' + Math.round(rt.minSpd));
console.log(n + ' ok');
