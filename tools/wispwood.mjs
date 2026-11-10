// tools/wispwood.mjs - WISPWOOD and THE LANTERN WIDOW (claude/wispwood, the opus greybox; Node only, no page).
//   node tools/wispwood.mjs            runs BOTH halves, one process after the other (the flag is read when src/level.js is imported):
//     FLAG OFF (this process)          WISPWOOD_SHIPS false and no ?ww: LEVELS, THE BURIAL CAVERNS and THE WITCHLIGHT STAIR are master's (the same signature as master 85d152eb8),
//                                      the road and the old-save rule in src/main.js do nothing (lifted out and run over fake saves), every main.js hook is guarded
//     FLAG ON  (a child: --on)         the road (caverns > wood > stair, appended), the old saves grandfathered, the build (six sections, START + 2 shrines, no filler),
//                                      the fill reaches every shrine, silver, candle, lamp, waystone and the Widow; THE HANDS in a fake world (the glow makes the spectral
//                                      cells real, a theft unmakes them, candles / lamps / waystones, a relight by touch and by itself, the shadow hands at the glow's edge
//                                      and under a dark hero, a banished hand, the wisp thief: swoop / steal / flee / struck home / scorched / escaped, the mere, the reset);
//                                      THE LANTERN WIDOW END TO END: a bot fights her with her real moves - thefts, reclaims (x2 openings), the drown, P2, the march, the win
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ON = process.argv.includes('--on');
if (ON) globalThis.__WW = true;
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const { wwOn, WISPWOOD_SHIPS } = await import('../src/ww-flag.js'); const { roadKept } = await import('../src/route-insert.js');
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const main = src('src/main.js');
const h = v => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16);
/* THE OLD-SAVE RULE AND THE GATE CLAUSE, lifted out of src/main.js and run over a fake PROG */
const mig = /if \(wwOn\(\) && !PROG\.wwRoadMig\) \{[^\n]*?PROG\.witchlightOpen = 1; \}/.exec(main), lock = /\(lv\.needs && !\(PROG\[lv\.needs\] && PROG\[lv\.needs\]\.cleared\)[^\n]*?&& !q\.get\('unlock'\)\)/.exec(main);
const gateRun = (PROG, on) => { if (mig) new Function('PROG', 'wwOn', mig[0])(PROG, () => on); const q = { get: () => null };
  const locked = id => new Function('lv', 'PROG', 'q', 'roadKept', 'return !!' + lock[0])(LEVELS.find(l => l.id === id) || { id, needs: 'burial' }, PROG, q, roadKept); return { stair: locked('witchlight'), wood: locked('wispwood') }; };

if (!ON) {
  console.log('== WISPWOOD, FLAG OFF (WISPWOOD_SHIPS = ' + WISPWOOD_SHIPS + ')');
  ok(!WISPWOOD_SHIPS && !wwOn(), 'the ship flag is off and nothing turns it on here');
  ok(!LEVELS.some(l => l.id === 'wispwood'), 'no LEVELS row');
  ok(LEVELS.find(l => l.id === 'witchlight').needs === 'burial', 'THE WITCHLIGHT STAIR still needs THE BURIAL CAVERNS');
  /* master 85d152eb8's signature (the same hash over that checkout, taken before this lane changed a line) */
  const MASTER = { n: 72, levels: 'e1d37b905059043c', burial: '62a3ba78de07aae8', witchlight: 'b2904bf68aaa0cfc' };
  const rows = LEVELS.map(l => [l.id, l.needs || null, l.leadsTo || null, !!l.hidden]);
  const b = id => { const L = LEVELS.find(l => l.id === id).build(); return h([L.W, L.H, Array.from(L.grid), L.ents]); };
  const now = { n: LEVELS.length, levels: h(rows), burial: b('burial'), witchlight: b('witchlight') };
  ok(JSON.stringify(now) === JSON.stringify(MASTER), 'LEVELS (ids, needs, order), THE BURIAL CAVERNS and THE WITCHLIGHT STAIR are master\'s exactly ' + JSON.stringify(now));
  ok(!!mig && !!lock && /lv\.id === 'witchlight' && PROG\.witchlightOpen/.test(lock[0]), 'the old-save rule and the gate clause are in src/main.js');
  if (mig && lock) for (const [name, P0] of [['a fresh save', {}], ['the caverns cleared', { burial: { cleared: true } }], ['past the stair', { burial: { cleared: true }, witchlight: { cleared: true } }], ['the fields only', { fields: { cleared: true } }]]) {
    const P = JSON.parse(JSON.stringify(P0)), r = gateRun(P, false), want = !(P0.burial && P0.burial.cleared) && !(P0.witchlight && P0.witchlight.cleared);
    ok(r.stair === want && !P.wwRoadMig && !P.witchlightOpen, 'flag off, ' + name + ': the stair ' + (want ? 'locked' : 'open') + ' exactly as master, the save untouched ' + JSON.stringify(P)); }
  const tagged = main.split('\n').filter(l => l.includes('(claude/wispwood)'));
  ok(tagged.length >= 15 && tagged.length <= 22, tagged.length + ' tagged hook lines in src/main.js (single lines)');
  const unguarded = tagged.filter(l => !/wwOn\(\)|WWH|WDH|witchlightOpen|case 'lanternwidow'|WW_NODE|const EHP = {|LEVELS\.some\(l => l\.id === 'wispwood'\)/.test(l));
  ok(!unguarded.length, 'every hook is behind the flag: the road and the old-save rule ask wwOn(), the rest need the level (WWH.on() / its ents / its boss) ' + unguarded.map(l => l.slice(0, 60)).join(' | '));
  ok(/if \(LEVELS\.some\(l => l\.id === 'wispwood'\)\) \{ INLAND_NODES\.splice/.test(main), 'the map node and its road vertex go in only while the LEVELS row is there (wwOn() at import)');
  ok(/wwOn\(\) && isDev\(\)/.test(main), 'the dev entry needs ?ww=1 and ?dev=1');
  const child = spawnSync(process.execPath, ['--import', './tools/ww-on.mjs', fileURLToPath(import.meta.url), '--on'], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  process.stdout.write(child.stdout || ''); if (child.status !== 0) bad++;
  console.log(bad ? '\nWISPWOOD: ' + bad + ' FAIL(S)' : '\nWISPWOOD: all ok (flag off and flag on)');
  process.exit(bad ? 1 : 0);
}

// ======================================================================= FLAG ON =======================================================================
console.log('== WISPWOOD, FLAG ON (globalThis.__WW)');
const { WW, SECTIONS } = await import('../src/wispwood.js');
const { WW_RULE, WW_SAY, WD_SAY } = await import('../src/ww-lines.js');
const { makeWispwoodHands, LIGHT, HAND, THIEF, MERE } = await import('../src/wispwood-hands.js');
const WDM = await import('../src/lantern-widow.js'); const { WD } = WDM;
const { makeLanternWidowHands, POSE, SOUND } = await import('../src/lantern-widow-hands.js');
const { floodReach } = await import('../src/reachcore.js');
const { THREAT } = await import('../src/threat.js');
const { MARK, ANSWER } = await import('../src/marks.js');
const lv = LEVELS.find(l => l.id === 'wispwood');
ok(!!lv && wwOn(), 'the LEVELS row is there with the flag on');
if (!lv) process.exit(1);
// ---- THE ROAD ----
ok(LEVELS[LEVELS.length - 1] === lv, 'APPENDED (saves count levels by index): nothing before it moved');
ok(lv.needs === 'burial' && LEVELS.find(l => l.id === 'witchlight').needs === 'wispwood', 'THE BURIAL CAVERNS > WISPWOOD > THE WITCHLIGHT STAIR');
ok(lv.rule === WW_RULE && /WHAT THE LIGHT TOUCHES IS REAL/.test(lv.rule), 'the rule line: ' + lv.rule);
ok(/GATE = \['wispwood'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(['wwspan', 'wwcandle', 'wwlamp', 'wwstone', 'wwhands'].every(k => THREAT[k] === 0) && THREAT.wwthief > 0 && THREAT.lanternwidow > 0, 'the threat table knows its machines (0), its thief and its boss');
ok(MARK['wwthief|swoopTell'] === '!' && ANSWER['wwthief|swoopTell'] === 'block', 'the thief\'s swoop wears a yellow ! answered by a block (src/marks.js)');
if (mig && lock) {
  const past = gateRun({ burial: { cleared: true }, witchlight: { cleared: true } }, true), atCav = gateRun({ burial: { cleared: true } }, true), fresh = gateRun({ wwRoadMig: 1, burial: { cleared: true } }, true), done = gateRun({ wwRoadMig: 1, burial: { cleared: true }, wispwood: { cleared: true } }, true);
  ok(!past.stair && !atCav.stair, 'an old save that cleared the caverns (or the stair) keeps the stair open (grandfathered once): ' + JSON.stringify([past, atCav]));
  ok(fresh.stair && !fresh.wood, 'a save made with the wood on the road: the caverns open the wood, the stair waits for it');
  ok(!done.stair, 'clearing the wood opens the stair');
}
// ---- THE BUILD ----
const L = lv.build();
ok(L.W === WW.W && L.H === WW.H && L.wispwood && L.ww && L.arena && L.arena.boss === 'lanternwidow', 'built: ' + L.W + ' x ' + L.H + ', the Widow\'s glade');
ok(L.sections.length === 6 && SECTIONS.length === 6, 'six sections: ' + SECTIONS.map(s => s[0]).join(' / '));
const checks = L.ents.filter(e => e.t === 'check'), silvers = L.ents.filter(e => e.t === 'silver');
ok(checks.length === 2 && L.checkRun === 200, 'START + 2 shrines (cols ' + checks.map(c => c.x).join(', ') + '), checkRun 200: the filler adds none');
ok(silvers.length === 2, 'two silvers (cols ' + silvers.map(s => s.x).join(', ') + ')');
const W0 = L.ww; let allOne = true; for (const s of W0.spans) for (let x = s.x0; x <= s.x1; x++) if (L.grid[s.y * L.W + x] !== T.ONEWAY) allOne = false;
ok(allOne && W0.spans.length >= 20, W0.spans.length + ' spectral spans, every cell ONEWAY in the built grid (the lit state the reach and quality tools read)');
ok(W0.candles.length >= 5 && W0.lamps.length >= 6 && W0.stones.length >= 4 && W0.pools.length >= 6 && W0.meres.length >= 4, 'candles ' + W0.candles.length + ', lamps ' + W0.lamps.length + ', waystones ' + W0.stones.length + ', hand pools ' + W0.pools.length + ', meres ' + W0.meres.length);
ok(L.calm && L.calm.length && !L.ents.some(e => e.t === 'gate'), 'placed by hand (calm), no exit gate: the Widow ends it');
{ const reach = floodReach(L, T, { rides: true }); const want = L.ents.filter(e => ['check', 'silver', 'wwcandle', 'wwlamp', 'wwstone', 'lanternwidow'].includes(e.t));
  const miss = want.filter(e => !reach.jumpNear(e.x, e.y));
  ok(!miss.length, 'the fill (lit state) reaches every shrine, silver, candle, lamp, waystone and the Widow' + (miss.length ? ': MISSES ' + JSON.stringify(miss.map(e => [e.t, e.x, e.y])) : '')); }

// ---- THE HANDS, in a fake world ----
const fakeWorld = (L0, heroes, o = {}) => { let cur = null; const log = []; const fx = { L: L0, TS, T, players: () => heroes, enemies: () => fx.ens, ens: [], time: () => 0, number: (x, y, t) => log.push(t), hint: t => log.push('HINT ' + t),
  asPlayer: (p, fn) => { const o2 = cur; cur = p; try { fn(); } finally { cur = o2; } },
  damage: (x, d, op = {}) => { const p = cur; if (!p || p.dead) return null; if (o.block && o.block(p, op)) return 'blocked'; p.hp -= d; p.hits = (p.hits || 0) + 1; p.took = (p.took || []).concat([[op.name || '?', d, !!op.spare]]); if (p.hp <= 0) { if (op.spare) p.hp = 1; else p.dead = true; } return 'hit'; },
  cellSet: (x, y, t) => { L0.grid[y * L0.W + x] = t; }, upright: p => !p.dead, hitOnce: () => true, shake: () => {}, ring: () => {}, log, extraLights: () => (fx.extra ? fx.extra() : []) }; return fx; };
const hero = (x, y, o = {}) => ({ x, y, hp: 400, vx: 0, vy: 0, ground: true, face: 1, ...o });
const at = (col, row) => [col * TS + 8, (row + 1) * TS];
const cell = (L0, x, y) => L0.grid[y * L0.W + x];
{ const L0 = lv.build(), grid0 = Array.from(L0.grid); const P = hero(...at(14, 31)), heroes = [P], F = fakeWorld(L0, heroes), G = makeWispwoodHands(F); G.reset();
  const step = (s, dt = 1 / 60) => { for (let t = 0; t < s; t += dt) { G.update(dt); for (const e of F.ens) if (e.alive && e.t === 'wwthief') G.thief(e, dt); } };
  step(0.1);
  ok(cell(L0, 15, 32) === T.ONEWAY && cell(L0, 17, 32) === T.ONEWAY && cell(L0, 19, 32) === T.AIR, 'THE GLOW: the first pale branch is real as far as the lantern reaches (cols 15-17 from col 14; col 19 not yet - it comes as you walk)');
  ok(cell(L0, 300, 23) === T.AIR && cell(L0, 70, 14) === T.AIR, 'and a span no light reaches (the glade\'s high perch, the oaks\' bridge) is AIR');
  G.steal(P, 'test'); step(0.1);
  ok(cell(L0, 17, 32) === T.AIR, 'THE LIGHT TAKEN: with the lantern out the branch under the ditch is gone (the waystone at col 8 does not reach it)');
  P.x = at(8, 31)[0]; step(0.1);
  ok(G.lanternLit(P), 'a WAYSTONE never goes out: touched, it relights a dead lantern (' + G.lantern(P).st + ')');
  P.x = at(14, 31)[0]; step(0.1);
  ok(cell(L0, 17, 32) === T.ONEWAY, 'given back: the branch is real again');
  /* candles */
  const c0 = L0.ww.candles[0]; P.x = c0.x - 10; P.y = c0.y; G.strike({ l: c0.x - 4, r: c0.x + 4, t: c0.y - 12, b: c0.y - 4 }, P); step(0.1);
  ok(G.lampOn(c0.id), 'a grave candle struck with a lit lantern burns');
  step(LIGHT.burn); ok(!G.lampOn(c0.id), 'and goes out after ' + LIGHT.burn + ' s (it gutters first: told)');
  G.steal(P, 'test'); G.strike({ l: c0.x - 4, r: c0.x + 4, t: c0.y - 12, b: c0.y - 4 }, P); step(0.1);
  ok(!G.lampOn(c0.id), 'struck with the lantern out, it stays cold');
  G.giveBack(P); G.strike({ l: c0.x - 4, r: c0.x + 4, t: c0.y - 12, b: c0.y - 4 }, P); step(0.1); G.drown(P); P.x = c0.x; step(0.1);
  ok(G.lanternLit(P), 'a DEAD lantern touched to a lit candle burns again');
  G.drown(P); P.x = at(100, 23)[0]; P.y = at(100, 23)[1]; step(LIGHT.relight + 0.2);
  ok(G.lanternLit(P), 'a drowned lantern far from any light catches again by itself after ' + LIGHT.relight + ' s (no soft-lock)');
  const lp = L0.ww.lamps[0]; G.strike({ l: lp.x - 4, r: lp.x + 4, t: lp.y - 22, b: lp.y - 14 }, P); step(30);
  ok(G.lampOn(lp.id), 'a hanging lamp struck burns until something snuffs it (still lit after 30 s)');
  /* shadow hands: lit hero - the hand rises at the edge of the glow; stolen - under him */
  const pool = L0.ww.pools[0]; P.x = at(pool.x0 + 6, pool.y)[0]; P.y = at(pool.x0 + 6, pool.y)[1]; P.hp = 400; P.rootT = 0; G.reset(); step(0.05);
  const h1 = G.show().hands[0];
  ok(!!h1 && Math.abs(h1.x - P.x) > LIGHT.lantern - 16, 'SHADOW HANDS: with the lantern lit the hand rises outside the glow (' + (h1 ? Math.round(Math.abs(h1.x - P.x)) : '-') + ' px off), told ' + HAND.tell + ' s');
  step(HAND.tell + HAND.maxT + 0.1);
  ok(P.hp === 400 - HAND.dmg && P.rootT > 0, 'it lunges to where he stood: ' + HAND.dmg + ' and HELD (' + (P.rootT || 0).toFixed(2) + ' s)');
  step(HAND.cd + 0.5); G.show().hands.length = 0; G.steal(P, 'test'); G.show().poolCd = {}; step(0.05);
  const h2 = G.show().hands[0];
  ok(!!h2 && Math.abs(h2.x - P.x) <= 16, 'with the lantern out it rises UNDER him (' + (h2 ? Math.round(Math.abs(h2.x - P.x)) : '-') + ' px)');
  if (h2) { G.strike({ l: h2.x - 4, r: h2.x + 4, t: h2.y - 12, b: h2.y - 4 }, P); ok(G.show().hands[0].st === 'sink' && G.show().n.banished === 1, 'a blow BANISHES a hand'); }
  /* the mere */
  G.reset(); P.x = at(56, 25)[0]; P.y = at(56, 25)[1]; P.hp = 400; step(0.1); P.x = at(70, 40)[0]; P.y = WW.catchY + 10; step(0.05);
  ok(P.hp === 400 - MERE.dmg && Math.abs(P.x - at(56, 25)[0]) < 2 && P.y < WW.catchY, 'THE BLACK MERE: a fall is dragged back to the last firm footing for ' + MERE.dmg + ' (spare, never a death)');
  /* the reset */
  G.reset(); G.show().cells.size === 0; const same = L0.grid.every((v, i) => v === grid0[i] || (v === T.AIR && grid0[i] === T.ONEWAY));
  ok(same, 'the reset puts the built grid back (only spectral cells ever differ)');
  for (const [k, v] of G.show().cells) L0.grid[k] = v; }
/* THE WISP THIEF */
{ const mk = (o = {}) => { const L0 = lv.build(); const P = hero(...at(129, 23)), heroes = [P], F = fakeWorld(L0, heroes, o), G = makeWispwoodHands(F); G.reset();
    const sp = L0.ents.find(e => e.t === 'wwthief' && e.squad === 'roadThief'); const e = G.spawn(sp, { x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); F.ens.push(e);
    const step = (s, dt = 1 / 60) => { for (let t = 0; t < s; t += dt) { G.update(dt); if (e.alive) G.thief(e, dt); } }; return { L0, P, F, G, e, step }; };
  { const { P, G, e, step } = mk(); step(0.05);
    ok(e.mode === 'swoopTell', 'THE WISP THIEF: a lit lantern in range draws a told swoop (' + THIEF.tell + ' s, yellow !)');
    let t = 0; while (t < 3 && !e.flame) { step(1 / 60); t += 1 / 60; }
    ok(e.flame === P && G.lantern(P).st === 'stolen' && e.mode === 'flee', 'the swoop STEALS the flame; the thief flees with it');
    step(0.5); const x0 = e.x; e.alive = false; e.hp = 0; step(0.05);
    ok(G.lanternLit(P), 'struck down, the flame comes home (it had fled ' + Math.round(Math.abs(x0 - (129 * TS + 8))) + ' px)'); }
  { const { G, e, step } = mk({ block: (p, op) => op.name === 'A WISP THIEF' }); let t = 0; while (t < 3 && e.mode !== 'scorched') { step(1 / 60); t += 1 / 60; }
    ok(e.mode === 'scorched' && !e.flame && G.show().n.steals === 0, 'a BLOCKED swoop scorches it (stunned ' + THIEF.stun + ' s), nothing stolen'); ok(G.takeThief(e, 10) === 20, 'a scorched thief takes x2'); }
  { const { P, G, e, step } = mk(); let t = 0; while (t < 3 && !e.flame) { step(1 / 60); t += 1 / 60; } P.x = at(100, 23)[0]; step(THIEF.escapeT + 0.2);
    ok(!e.flame && G.lantern(P).st !== 'stolen', 'not caught, it DROWNS the flame (' + THIEF.escapeT + ' s or ' + THIEF.escapeD + ' px): ' + G.lantern(P).st + ' - relight at any light'); }
  { const { L0, P, G, e, step } = mk(); let t = 0; while (t < 3 && !e.flame) { step(1 / 60); t += 1 / 60; } P.x = at(100, 23)[0];
    e.x = at(145, 23)[0]; e.y = 23 * TS; step(0.05); ok(cell(L0, 145, 24) === T.ONEWAY, 'a thief carrying your flame keeps the bridge real near IT (chase the glow)'); void L0; }
}

// ---- THE LANTERN WIDOW ----
{ const moves = ['veil', 'wail', 'hands', 'march'];
  ok(moves.every(m => POSE[m + 'Tell'] && POSE[m] && JSON.stringify(POSE[m + 'Tell']) !== JSON.stringify(POSE[m])) && POSE.theftTell && POSE.reel && POSE.lament, 'every move has its own windup pose and release pose (B16), and the beckon, the reel, the lament');
  ok(moves.every(m => SOUND[m + 'Tell'] && SOUND[m]) && SOUND.theftTell && SOUND.theft && SOUND.reclaim, 'every move its own sound');
  ok(WD.resist >= 0.4 && WD.openMul > 1 && WD.openCap > 0, 'B15: x' + WD.resist + ' outside an opening (>= 0.4: never untouchable), x' + WD.openMul + ' in one, capped ' + WD.openCap * 100 + '%'); }
function fight({ seed = 1, swing = 40, every = 0.45, reclaimOn = true } = {}) {
  const L0 = lv.build(), A = L0.arena; let rnd = seed; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const floorY = A.floor; const P = hero(A.x0 + 3 * TS, floorY, { hp: 640 }), heroes = [P];   /* 640: the bot's health with its flasks drunk (it never drinks: one pool) */
  const F = fakeWorld(L0, heroes), G = makeWispwoodHands(F); G.reset();
  let boss = null; const ctx = { ...F, get L() { return L0; }, get boss() { return boss; }, bossActive: true, EHP: { lanternwidow: WD.hp }, ww: () => G };
  const H = makeLanternWidowHands(ctx); F.extra = () => H.lights();
  const sp = L0.ents.find(e => e.t === 'lanternwidow'); boss = H.spawnBoss({ x: sp.x * TS + 8, y: (sp.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }); boss.mode = 'wake'; boss.modeT = 1.6;
  const modes = new Set(), S = H.show(); let t = 0, swingT = 0, openDmg = 0, veilDmg = 0, darkT = 0, maxDark = 0, cur = 0;
  const dt = 1 / 60;
  while (t < 400 && boss.alive && !P.dead) {
    t += dt; G.update(dt); H.update(boss, dt); modes.add(boss.mode);
    if (S.stolen) { cur += dt; darkT += dt; maxDark = Math.max(maxDark, cur); } else cur = 0;
    /* THE BOT: on the floor it fights her where she is; while she holds the light it climbs the tiers in her glow (abstracted: it reaches her height once under her) and strikes her lantern */
    const lp = WDM.lanternAt(boss), goal = S.stolen && reclaimOn ? lp.x - 10 : boss.x - 18;
    const tell = /Tell$/.test(boss.mode) && boss.mode !== 'theftTell' && Math.abs(boss.x - P.x) < 50 && rand() < 0.5;
    const dx = tell ? P.x - boss.x : goal - P.x; P.x += Math.sign(dx) * Math.min(Math.abs(dx), 92 * dt); P.x = Math.max(A.x0 + 10, Math.min(A.x1 - 10, P.x));
    P.y = Math.abs(goal - P.x) < 24 ? Math.min(floorY, boss.y) : floorY;
    if ((S.rings.length || S.marches.length) && rand() < 0.7) P.ground = false; else P.ground = true;   /* it jumps most wails and marches */
    for (const s2 of S.spots) if (Math.abs(s2.x - P.x) < WD.hands.w && rand() < 0.08) P.x += 30;   /* and steps off some hand ripples */
    swingT -= dt; if (swingT <= 0 && Math.abs(goal - P.x) < 24) { swingT = every;
      if (S.stolen && reclaimOn) H.strike({ l: lp.x - 6, r: lp.x + 6, t: lp.y - 6, b: lp.y + 6 });
      if (Math.abs(boss.x - P.x) < 34) { const o = WDM.wdOpen(boss), d = H.take(boss, swing); boss.hp -= d; if (o) openDmg += d; else veilDmg += d; if (boss.hp <= 0) { boss.alive = false; H.end(boss); } } }
  }
  return { won: !boss.alive && !P.dead, t, hpLeft: P.hp, modes, S, H, G, L0, P, openDmg, veilDmg, darkT, maxDark };
}
{ const R = fight(), n = R.S.n;
  ok(R.won, 'THE LANTERN WIDOW, END TO END: the bot wins in ' + R.t.toFixed(0) + ' s with ' + Math.round(R.hpLeft) + ' of 640 health left (hurt by ' + JSON.stringify(Object.fromEntries(Object.entries(R.S.hurt).map(([k, v]) => [k, Math.round(v)]))) + ')');
  ok(n.thefts >= 2 && n.reclaims >= 2 && n.openHits > 0, 'SHE TAKES YOUR LIGHT and the RECLAIM is the key: ' + n.thefts + ' thefts, ' + n.reclaims + ' reclaims, ' + n.openHits + ' blows landed x2 (' + Math.round(R.openDmg) + ' open vs ' + Math.round(R.veilDmg) + ' through the veil)');
  ok(R.S.ph === 2 && R.modes.has('lament') && n.marches >= 1, 'P2: the lament at 50%, then THE WEDDING MARCH (' + n.marches + ') and the false lights; the glade dark ' + R.darkT.toFixed(0) + ' s of ' + R.t.toFixed(0));
  ok(['veilTell', 'wailTell', 'handsTell', 'theftTell', 'reel', 'glide', 'perch'].every(m => R.modes.has(m)), 'every move came out of its own windup: ' + [...R.modes].join(' '));
  ok(R.H.read().won && R.G.lanternLit(R.P), 'the win gives every flame back and lifts the dark');
  ok(R.t >= 30 && R.t <= 200, 'the fight runs ' + R.t.toFixed(0) + ' s for a node bot (brief: 90-150 s for a player; the tune lane sets hp at n=6)'); }
{ const R = fight({ reclaimOn: false }), n = R.S.n;
  ok(n.reclaims === 0 && n.drowns >= 1, 'without the reclaim she drowns the light (' + n.drowns + ' drowns): the flames go to the rim lamps');
  ok(!R.won || R.t > fight().t, 'and never reclaiming is the slow road: ' + (R.won ? 'won in ' + R.t.toFixed(0) + ' s' : 'LOST / out of time at ' + R.t.toFixed(0) + ' s')); }
{ const e = { hp: 2600, maxHp: 2600, mode: 'drift', modeT: 0 }, S = WDM.newFight(WDM.geom(lv.build()));
  const [d0] = WDM.takeBlow(e, S, 40); e.mode = 'reel'; e.modeT = 1; const [d1] = WDM.takeBlow(e, S, 40); let sum = 0; for (let i = 0; i < 50; i++) sum += WDM.takeBlow(e, S, 40)[0];
  ok(d0 === Math.round(40 * WD.resist) && d1 === 80, 'a 40 blow: ' + d0 + ' through the veil, ' + d1 + ' while RECLAIMED');
  ok(sum + d1 <= WD.openCap * 2600 + 50 * 40 * WD.resist + 1, 'an opening is capped at ' + WD.openCap * 100 + '% of her (then x' + WD.resist + ')');
  e.mode = 'drift'; e.hp = 1310; const [d2, w2] = WDM.takeBlow(e, S, 40); ok(d2 === 10 && w2 === 'HOLDS', 'P1 holds at 50% until her move in hand ends'); }

console.log(bad ? 'FLAG ON: ' + bad + ' FAIL(S)' : 'FLAG ON: all ok');
process.exit(bad ? 1 : 0);
