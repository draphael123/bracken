// tools/sun-temple.mjs - THE SUN TEMPLE + THE FALLEN SUN PRIEST, node only (claude/suntemple, 11-06). No browser, no page.
//   node tools/sun-temple.mjs            the level (flag, rooms, hours, reach, the cache, the siege, the sanctum) + the fight (pure) + the unlock wiring
//   node tools/sun-temple.mjs --sim=N    + N seeds of the node bot flow sim (a human-ish bot vs the pure fight: a PACE read, not the win rate)
// The real rate is the browser lane's: BRACKEN_TEMPLE=1 ... boss-rates.mjs suntemple --seeds=6 (owed).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs'; install();
import { LEVELS, T } from '../src/level.js';
import { lintSunRooms, solveRoom, hoursOpen, sunRoomsInit, sunRoomsStep, strikeMirrors, gridOf } from '../src/sun-puzzle.js';
import { makeOpaque } from '../src/light.js';
import { isSlope } from '../src/slopes.js';
import { floodReach } from '../src/reachcore.js';
import * as ST from '../src/sun-temple.js';
import * as FS from '../src/fallen-sun.js';

let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok ' + m); };
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')));
const lv = LEVELS.find(l => l.id === 'suntemple');
const read = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

console.log('THE FLAG');
ok(!!lv && LEVELS.indexOf(lv) === LEVELS.length - 1 || LEVELS.slice(LEVELS.indexOf(lv) + 1).every(l => l.id !== 'glasssea'), 'suntemple is in LEVELS, appended (no older index moves)');
ok(ST.TEMPLE_SHIPS === false, 'TEMPLE_SHIPS is false: not on the live road');
ok(!!lv.hidden === !ST.templeOn(), `hidden while the flag is off (flag ${ST.templeOn() ? 'ON' : 'OFF'} in this run: hidden ${!!lv.hidden})`);
ok(lv.needs === 'glasssea' && lv.spurOf === 'glasssea' && lv.classFor === 'sunpriest', 'a spur off THE GLASS SEA (needs + spurOf glasssea), the Desert Priest\'s class level');
const main = read('src/main.js');
ok(/DESERT_NODES\.push\(\{ id: 'suntemple'[^\n]*spur: true/.test(main) && /if \(TEMPLE_ON\) DESERT_NODES\.push/.test(main), 'the map node is appended to DESERT_NODES only when the flag is on (spur: true)');
ok(/id: 'sunpriest'[^\n]*feat: 'boss:suntemple'/.test(main) && !/id: 'sunpriest'[^\n]*coinPrice/.test(main), 'THE DESERT PRIEST: beat THE FALLEN SUN PRIEST + 10 silver (feat boss:suntemple); the 800-gold path is gone (Daniel Q3)');

const L = lv.build(), W = L.W, H = L.H;
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : L.grid[y * W + x]);
const opaque = makeOpaque(T, isSlope);

console.log('THE SUN ROOMS');
const bad = lintSunRooms(L, at, opaque);
ok(bad.length === 0, 'lintSunRooms clean (' + (bad.join('; ') || 'no problems') + ')');
const room = id => L.sunRooms.find(r => r.id === id);
const hrs = id => hoursOpen(room(id), at, opaque);
{ const h = hrs('gateOfDawn'); ok(h.length === 1 && h[0].turns === 1, 'THE GATE OF DAWN teaches: one fixed shaft, one mirror turned wrong - one turn opens it'); }
{ const h = hrs('hallOfWindows'); ok(h.length === 1 && h[0].hour === 3 && h[0].turns === 1, `THE HALL OF WINDOWS: THE SUN MOVES - it opens at ONE hour of five (hour ${h.map(q => q.hour)}) and only with its mirror turned`); }
{ const h = hrs('sundialCourt'); ok(h.length === 1 && h[0].hour === 1 && h[0].turns === 2, `THE SUNDIAL COURT: the two-mirror chain, one hour (${h.map(q => 'h' + q.hour + '+' + q.turns)})`); }
{ const h = hrs('cloister'); ok(h.length === 1 && h[0].hour === 3 && room('cloister').doors[0].mode === 'hold', `THE CLOISTER OF NOON: a HOLD door, open at one hour (${h.map(q => 'h' + q.hour + '+' + q.turns)})`); }
for (const r of L.sunRooms) for (const d of r.doors.filter(q => q.kind === 'sun')) { const s = solveRoom(r, at, opaque); ok(s && s.turns > 0, `${r.id}: no sun-door is open as built at any hour (needs ${s && s.turns} turn(s))`); }
ok(L.sunRooms.flatMap(r => r.doors).filter(d => d.kind === 'cache').length === 1, 'ONE optional PRIEST CACHE in the level (plan Q5)');
/* the cache answers to his beam, never the sun: run the court's room at every clock with no priest - the cache never opens; with his UP beam from the low ledge it does */
{ const R = sunRoomsInit({ sunRooms: [room('sundialCourt')] }), rc = R.rooms[0]; for (const m of rc.mirrors) m.state = m.state === '/' ? '\\' : '/';
  let opened = false; for (let t = 0; t < 31; t += 0.5) { for (const e of sunRoomsStep(R, 0.5, { tileAt: at, opaque })) if (e.id === 'priestCache' && e.ev === 'open') opened = true; }
  ok(!opened && rc.doors.find(d => d.id === 'courtDoor').open, 'the sun opens the court door at its hour, and NEVER the priest cache');
  const R2 = sunRoomsInit({ sunRooms: [room('sundialCourt')] }); const ev = sunRoomsStep(R2, 0.1, { tileAt: at, opaque, priestBeams: [{ x: 107, y: 26, dir: 'N' }] });
  ok(ev.some(e => e.id === 'priestCache' && e.ev === 'open') && !R2.rooms[0].doors.find(d => d.id === 'courtDoor').open, "THE DESERT PRIEST's UP beam from the low ledge breaks the sun-seal - and opens no sun-door"); }
/* the hold door: lit at hour 3, then the sun moves on - it is told, then it shuts (never on a body) */
{ const R = sunRoomsInit({ sunRooms: [room('cloister')] }), rc = R.rooms[0]; rc.mirrors[0].state = '\\';
  const evs = []; for (let t = 0; t < 20; t += 0.1) for (const e of sunRoomsStep(R, 0.1, { tileAt: at, opaque, bodyIn: () => false })) evs.push(e.ev + '@' + rc.clock.toFixed(1));
  const seq = evs.map(s => s.split('@')[0]).join(' ');
  ok(seq === 'open tell shut', `the noon door: ${evs.join(' ')} (open at hour 3 = 12 s, told as the sun moves on at 16 s, shut ${0.8} s later)`); }

console.log('THE WAY THROUGH (src/reachcore.js floodReach, every sun-door opened = the level as played)');
const asPlayed = { ...L, grid: L.grid.slice() };
for (const r of L.sunRooms) for (const d of r.doors) if (d.opens && d.kind === 'sun') for (let y = d.opens[1]; y <= d.opens[3]; y++) for (let x = d.opens[0]; x <= d.opens[2]; x++) asPlayed.grid[y * W + x] = T.AIR;
const reachOf = Lx => { const r = floodReach(Lx, T, {}); const s = r.seen || r.reach || r; return (x, y) => s.has(x + ',' + y); };
const shut = reachOf(L), open = reachOf(asPlayed);
const A = L.arena, ax = Math.floor(A.trigger / 16) + 1, ay = L.arena.fs.R - 1;
ok(!shut(ax, ay), 'with the sun-doors shut the sanctum cannot be reached (every door is a lock)');
ok(open(ax, ay), 'with them open, the way runs START -> THE SANCTUM');
for (const r of L.sunRooms) for (const m of r.mirrors) { let can = false; for (let dx = -2; dx <= 2 && !can; dx++) for (const dy of [0, 1]) if (open(m.x + dx, m.y + dy)) can = true;
  ok(can, `${r.id}: the mirror at ${m.x},${m.y} has reachable footing within a blow`); }
const silvers = L.ents.filter(e => e.t === 'silver');
for (const s of silvers.filter(q => !q.cache)) ok(open(s.x, s.y), `the silver at ${s.x},${s.y} can be reached (off the route)`);
{ const c = silvers.find(q => q.cache); ok(!open(c.x, c.y), 'the cache silver is sealed in (the priest\'s light only)');
  const g2 = { ...asPlayed, grid: asPlayed.grid.slice() }; const d = room('sundialCourt').doors.find(q => q.kind === 'cache'); for (let y = d.opens[1]; y <= d.opens[3]; y++) g2.grid[y * W + d.opens[0]] = T.AIR;
  ok(reachOf(g2)(c.x, c.y), '...and with the seal broken it can be reached'); }
const checks = L.ents.filter(e => e.t === 'check');
ok(checks.length === 2 && checks.every(c => open(c.x, c.y)), `TWO checkpoints (fewer, Daniel), both on the way: ${checks.map(c => c.x).join(', ')}`);
ok(checks.some(c => c.x > L.sections['THE HIGH ALTAR'] && c.x < A.x0 / 16), 'a shrine before the boss');

{ const PC = await import('./pacing.mjs'); const p = PC.platforming(PC.pacing(lv));
  ok(p.jumpSections >= 1 && p.sections.some(q => q.c0 >= 96 && q.c0 <= 104), `A14: THE SUNDIAL COURT is a PLATFORMING SECTION (pacing.mjs: ${p.sections.map(q => q.beats + ' beats / ' + q.len + ' tiles from ' + q.c0).join('; ')})`); }
console.log('THE DUSK SIEGE');
{ const am = L.ambushes[0]; ok(am && am.dusk && am.waves.length === 2, 'THE DUSK SIEGE: an ambush room of two waves of the dead'); ok(open(am.wallL + 3, am.row), 'its trigger is on the way');
  const dr = room('duskHall'); ok(ST.DUSK.out.every(o => dr.sources.some(s => s.id === o.id)) && !ST.DUSK.out.some(o => o.id === 'duskW'), 'the windows go out one by one (east, centre); the west is the last light');
  const R = sunRoomsInit({ sunRooms: [dr] }); sunRoomsStep(R, 0, { tileAt: at, opaque }); const lit0 = R.rooms[0].res.lit.size;
  R.rooms[0].mirrors[0].state = '\\'; sunRoomsStep(R, 0, { tileAt: at, opaque }); const lit1 = R.rooms[0].res.lit.size;
  ok(lit1 > lit0 + 15, `a struck mirror sweeps the light along the floor (lit tiles ${lit0} -> ${lit1}): the verb that burns the dead`); }

console.log('THE CAST');
{ const foes = L.ents.filter(e => e.squad || e.elite); const kinds = new Set(foes.map(e => e.t));
  ok(['gobmage', 'mummy', 'deadpriest', 'deadpaladin', 'hound', 'bonearcher'].every(k => kinds.has(k)), 'melee (the dead), ranged (acolytes, the bone archer), support (the fallen priest), heavy (the fallen guard), runner (jackals): 0 new foes');
  ok(!L.ents.some(e => /gob(?!mage)|goblin/.test(e.t)) && L.ents.filter(e => e.t === 'gobmage').every(e => e.cnSkin === 'banditmystic'), 'NO GOBLINS: the gobmage machine only under the mystic\'s skin (the sun acolyte, ART owed)'); }

console.log('THE SANCTUM + THE FALLEN SUN PRIEST (pure)');
const sr = room('sanctum');
{ const R = sunRoomsInit({ sunRooms: [sr] }), rc = R.rooms[0]; const lit = () => { sunRoomsStep(R, 0, { tileAt: at, opaque }); return rc.res; };
  const G = FS.geom(A, 16), mid = [sr.mirrors[0].x + 1, sr.mirrors[1].x - 1], floorLit = (res, a = Math.floor(G.x0 / 16), b = Math.floor(G.x1 / 16) - 1) => { let c = 0; for (let x = a; x <= b; x++) if (res.lit.has(x + ',' + (L.arena.fs.R - 2))) c++; return c; };
  const all = floorLit(lit()); ok(all >= 28, `as built the light is HIS: ${all} of 44 floor columns lit at his chest`);
  rc.mirrors[0].state = '/'; rc.mirrors[1].state = '\\'; const res2 = lit(), turned = floorLit(res2), turnedMid = floorLit(res2, ...mid);
  ok(turnedMid === 1 && turned < all - 10, `both mirrors turned away: the light goes to the walls (${turned} lit, ${turnedMid} of the ${mid[1] - mid[0] + 1} middle columns - the centre shaft)`);
  rc.def.sources[1].off = true; const dark = floorLit(lit(), ...mid); ok(dark === 0, `and the centre shutter shut: the middle of the floor is all SHADE (${dark} lit)`);
  rc.def.sources[1].off = false; }
const fsChecks = FS.selfCheck(A, 16);
for (const [c, m] of fsChecks) ok(c, m);


console.log('THE HANDS, IN NODE (a stub world: no page) - src/sunroom-hands.js + src/sun-temple-hands.js + src/fallen-sun-hands.js');
{ const { makeSunRoomHands } = await import('../src/sunroom-hands.js'); const { makeFallenSunHands } = await import('../src/fallen-sun-hands.js'); const { makeSunTempleHands } = await import('../src/sun-temple-hands.js');
  const L2 = lv.build(), TS = 16, said = [], calls = { n: 0 };
  const g = new Proxy({}, { get: (o, k) => (k in o ? o[k] : (...a) => { calls.n++; }), set: (o, k, v) => { o[k] = v; return true; } });
  const tileAt = (x, y) => (x < 0 || y < 0 || x >= L2.W || y >= L2.H ? T.SOLID : L2.grid[y * L2.W + x]), cellSet = (x, y, t) => { L2.grid[y * L2.W + x] = t; };
  const P = { x: 0, y: 0, hp: 100, maxHp: 100, ground: true, face: 1, atk: 0, dead: false };
  const players = [P], enemies = []; let boss = null, time = 0;
  const number = (x, y, t) => said.push(t), text = () => { calls.n++; };
  const SRH = makeSunRoomHands({ get L() { return L2; }, T, TS, tileAt, cellSet, isSlope, number, text, sfx: {}, get players() { return players; }, priestBeams: () => [] });
  const ctx = { get L() { return L2; }, get players() { return players; }, get boss() { return boss; }, bossActive: true, TS, T, EHP: { fallensun: FS.FS.hp }, sfx: {}, hero: () => P, time: () => time, VW: () => 320, VH: () => 180,
    number, text, burst: () => {}, sparks: () => {}, shake: () => {}, ring: () => {}, damagePlayer: (fx, d) => { P.hp -= d; return 'hit'; }, asPlayer: (pp, fn) => fn(), upright: () => true,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: q => ({ l: q.x - 4, r: q.x + 4, t: q.y - 20, b: q.y }), answered: () => false, srh: () => SRH, say: (m) => said.push('#' + m),
    enemies: () => enemies, hurtFoe: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; }, undead: e => /mumm|skel|dead/.test(e.t), tileAt, isSlope };
  const FSH = makeFallenSunHands(ctx), STH = makeSunTempleHands(ctx);
  const frame = dt => { time += dt; SRH.update(dt); STH.update(dt); if (boss && boss.alive) FSH.update(boss, dt); };
  const draw = () => { SRH.draw(g, 0, 0, time); STH.drawWorld(g, 0, 0, time); STH.drawHud(g); FSH.drawOver(g, 0, 0, time); };
  /* THE HALL OF WINDOWS, played: strike its mirror, wait for the sun - the door opens (the live grid's door tiles go to air) */
  P.x = 84 * TS + 8 + 14; P.y = 30 * TS; SRH.strike({ l: 84 * TS, r: 84 * TS + 16, t: 28 * TS, b: 29 * TS });
  for (let i = 0; i < 30 * 30; i++) { frame(1 / 30); if (i % 15 === 0) draw(); }
  ok(tileAt(100, 28) === T.AIR && said.includes('THE SUN OPENS THE DOOR'), 'the hall played through the hands: mirror struck, the sun came round, the door opened (told)');
  ok(calls.n > 50, 'the dial, the glint and the sun rooms drew (' + calls.n + ' calls)');
  /* a mummy in a shaft burns */
  const mum = { t: 'mummy', x: 60 * TS + 8, y: 30 * TS, w: 10, h: 16, hp: 60, alive: true }; enemies.push(mum); const r0 = SRH.room('hallOfWindows'); r0.clock = 1; for (let i = 0; i < 60; i++) frame(1 / 30);
  ok(mum.hp < 60 && said.includes('THE SUN BURNS THE DEAD'), 'an undead body in a sun shaft burns (' + (60 - mum.hp) + ' in 2 s)');
  P.hp = 50; P.x = 92 * TS + 8; P.y = 30 * TS; r0.clock = 25; for (let i = 0; i < 30; i++) frame(1 / 30);
  ok(P.hp > 50, 'a hero standing in the sun mends (' + P.hp + ')');
  /* THE SANCTUM: him, the cords, the shutters on the room, the read, the beat */
  P.x = 286 * TS; P.y = 20 * TS; P.hp = 100; boss = FSH.spawnBoss({ x: 302 * TS + 8, y: 20 * TS }); ok(!!boss && boss.t === 'fallensun' && boss.maxHp === FS.FS.hp, 'he spawns from the arena (hp ' + boss.maxHp + ')');
  boss.alive = true; boss.mode = 'wake'; boss.modeT = 1.6; let took = 0;
  for (let i = 0; i < 60 * 30 && boss.alive; i++) { frame(1 / 30); if (i % 10 === 0) draw();
    if (i % 14 === 0) { P.atk = 0.2; const cd = FSH.show().G.cords.find(q => Math.abs(q.x - boss.x) < 40); if (cd) FSH.strike({ l: cd.l, r: cd.r, t: cd.t, b: cd.b });
      P.x = boss.x - 24; const d = FSH.take(boss, 14, { k: 1 }); took += d; boss.hp -= d; if (boss.hp <= 0) boss.alive = false; } else P.atk = 0; if (P.hp < 30) P.hp = 100; }
  const st = FSH.read(); ok(took > 0 && st.n.cords > 0, 'blows on him land through the hands (' + took + ' hp), cords struck ' + st.n.cords + ' (opens ' + st.n.opens + ', phase ' + st.ph + ')');
  ok(SRH.room('sanctum').def.sources.some(q => q.off) || st.shut.every(t => t === 0), 'a shut shutter is the room source off (the light really goes)');
  boss.alive = false; FSH.end(boss); for (let i = 0; i < 60; i++) { frame(1 / 30); draw(); }
  ok(said.includes('#THE DESERT PRIEST WILL WALK WITH YOU') && SRH.room('sanctum').def.sources.every(q => !q.off), 'THE BEAT: the card, and every window relit'); }

if (args.sim) { const N = +args.sim || 6; console.log(`THE NODE BOT FLOW SIM (n=${N}): a pace read, not the rate`); const r = FS.simFights(A, 16, N, { sanctum: sr, at, opaque });
  console.log('  ' + JSON.stringify(r)); }
console.log(`\nSUN TEMPLE: ${n} ok`);
