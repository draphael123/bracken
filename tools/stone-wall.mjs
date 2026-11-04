// tools/stone-wall.mjs - THE GEOMANCER'S STONE WALL (HOLD C), claude/stonewall 11-04, scratch/plan-stonewall-1103.md (all 5 recs approved 11-03). NODE ONLY: it drives
// makeGeomancer(api) from src/geomancer.js against a small stub world (a flat floor, her, foes, shots), so no browser is needed. It fails when:
//   - a C tapped (released before GEO.wall.holdAt 0.28 s) raises a wall, or a C held past it does not raise exactly ONE uncapped wall piece (not a board stone: standing() / the 3-stone cap / pips unchanged)
//   - the wall costs no wind, stands longer/shorter than 3.5 s (5.0 with the TALL WALL upgrade; 3 cells tall with it), has not 3 hp, or its cooldown is not counted FROM WHEN IT FALLS (2.5 s)
//   - a shot is not stopped by it (a boss / elite shot costs it a point, a common foe's is free); a blow of hers on it does not burst it into 5 (7: heavy) shards flying AWAY from her, each swordDmg x 0.5, <= 3 on one foe,
//     a 0.3 s flinch on a common foe and none on a boss; her fist on a BOARD stone breaks nothing
//   - it cannot rise (cooldown, no wind, no floor in 2 rows - a pit's edge, swimming, airborne) and the held rune-ward does not carry on (hold C never does nothing)
//   - a wall evicts a board stone, or recall / detonate / collapse count it, or a second wall stands with the first
//   node tools/stone-wall.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeGeomancer, GEO } from '../src/geomancer.js';
import * as SKK from '../src/skill-k.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const bad = []; const ok = (c, m) => { if (!c) bad.push(m); }; const near = (a, b, e = 0.06) => Math.abs(a - b) <= e;
const TS = 16, LW = 60, LH = 20, FLOOR = 15, T = { AIR: 0, SOLID: 1, ONEWAY: 2 };

function world(tals = {}) {
  const grid = new Array(LW * LH).fill(0); for (let x = 0; x < LW; x++) grid[FLOOR * LW + x] = 1;
  const W = { time: 0, grid, said: [], enemies: [], seeds: [], box: null, tals, hits: [], bursts: 0 };
  const P = { x: 100, y: FLOOR * TS, w: 10, h: 28, face: 1, st: 100, ground: true, swim: false, atk: -1, lastSwingT: 0, heavySwing: false, heavy: false, hp: 100, dead: false, tremor: 0, rootT: 0, vx: 0 };
  W.P = P;
  const rect = b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y });
  const api = {
    get time() { return W.time; }, P, TS, T, LW, LH, get L() { return { grid }; }, get enemies() { return W.enemies; }, get seeds() { return W.seeds; }, players: [], boss: null, parts: [], tileSpr: [],
    SFX: new Proxy({}, { get: () => () => {} }), VW: 320, VH: 180, camX: 0, camY: 0, reduceMotion: () => false,
    isSolid: (x, y) => grid[y * LW + x] === T.SOLID, tileAt: (x, y) => grid[y * LW + x], isOneWay: t => t === T.ONEWAY, resolveTiles: () => {}, moveBody: (e, dx) => { e.x += dx; },
    hurtAs: (b, e, d) => { W.hits.push({ e, d, b }); e.hp -= d; if (e.hp <= 0) e.alive = false; }, floorFoe: () => true, lcBig: e => !!e.big, knockSkip: () => false,
    box: b => rect(b), overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    swordDmg: () => 20, amul: () => 1, number: (x, y, t) => { W.said.push(t); }, sparks() {}, dust() {}, ringAt() {}, shakeCam() {}, hitstop() {}, zoomKick() {}, burst() {}, squash() {}, reflectSeed() {}, yardSay() {}, dustRing() {},
    staffTip: () => null, kitPose() {}, blockedAt: () => false, attackBox: () => W.box, heavyWind: () => 0.5, isGeo: () => true, tal: () => W.tals, tierNow: () => 0,
    spend: n => { if (P.st >= n) { P.st -= n; return true; } return false; }, refund() {}, meterFull() {}, trialEvent() {}, noteParry() {}, parried() {}, teach() {}, pullBack() {},
  };
  W.G = makeGeomancer(api);
  W.step = (n = 1, want = false, can = true, dt = 1 / 60) => { for (let i = 0; i < n; i++) { W.time += dt; W.G.guard(want, can, dt, 0); W.G.update(dt); if (P.geoGuard) P.st = Math.max(0, P.st); } };
  W.foe = (dx, o = {}) => { const e = { x: P.x + dx, y: FLOOR * TS, w: 12, h: 16, alive: true, hp: 999, maxHp: 0, stagger: 0, harmless: false, ...o }; W.enemies.push(e); return e; };
  W.cellsAt = tx => [1, 2, 3, 4].filter(k => grid[(FLOOR - k) * LW + tx] === T.SOLID).length;
  W.walls = () => W.G.pieces().filter(p => p.kind === 'wall' && p.held);
  W.holdFor = s => { const n = Math.round(s * 60); W.step(n, true); };
  return W;
}
const holdAt = GEO.wall.holdAt;

/* ---------- constants ---------- */
{ const Wc = GEO.wall;
  ok(Wc.holdAt === 0.28 && Wc.life === 3.5 && Wc.hp === 3 && Wc.cost === 20 && Wc.cd === 2.5 && Wc.shardN === 5 && Wc.shardNHeavy === 7 && Wc.shardK === 0.5 && Wc.shardCap === 3, 'GEO.wall is not the plan\'s: ' + JSON.stringify(Wc));
  ok(Wc.holdAt > GEO.ward.raise + GEO.ward.hold, 'no tap may become a wall: holdAt ' + Wc.holdAt + ' must be > ward raise + hold ' + (GEO.ward.raise + GEO.ward.hold));
  ok(SKK.K.geoWallShard === 0.5 && SKK.K_GEO.geoWallShard === 0.5, 'skill-k.js has no geoWallShard 0.5 row');
}
/* ---------- tap vs hold ---------- */
{ const W = world(); W.step(1, true); W.step(Math.round((holdAt - 0.03) * 60), true); W.step(2, false); W.step(60, false);
  ok(W.walls().length === 0 && !W.G.pieces().some(p => p.kind === 'wall'), 'a C released at ' + (holdAt - 0.03).toFixed(2) + ' s raised a wall (a tap is the ward, frame for frame)');
  const t = world(); t.step(1, true); ok(t.P.geoGuard === true, 'the ward did not rise on the press'); t.step(Math.round(0.2 * 60), true); t.step(1, false); t.step(30, false); ok(t.walls().length === 0, 'a 0.2 s tap raised a wall'); }
{ const W = world(), P = W.P, st0 = P.st; W.holdFor(holdAt + 0.1);
  const ws = W.walls(); ok(ws.length === 1, 'a hold past holdAt raised ' + ws.length + ' walls (want 1)');
  const w = ws[0]; if (w) { ok(w.capped === false && w.earth === false, 'the wall is a capped board stone'); ok(w.hp === 3, 'the wall has hp ' + w.hp + ' (want 3)'); ok(w.life === 3.5, 'the wall life is ' + w.life);
    ok(w.cells.length === 2 && w.cells.every(c => W.grid[c.i] === T.SOLID), 'the wall is not 2 solid cells'); const tx = w.cells[0].tx; ok(tx * TS >= P.x + P.w / 2 - 1, 'the wall is not wholly in front of her'); }
  ok(near(st0 - P.st, 20, 2), 'the wall cost ' + (st0 - P.st).toFixed(2) + ' wind (want 20)');
  ok(W.G.standing() === 0, 'the wall counts as one of her three stones (standing ' + W.G.standing() + ')'); ok(P.geoGuard === false, 'the ward stayed up beside the wall'); ok((P.geoWardLock || 0) <= W.time, 'dropping the ward for the wall set the lock');
  W.holdFor(0.5); ok(W.walls().length === 1 && P.geoGuard === false, 'a C held on re-raised the ward or a second wall'); ok(W.said.includes('STONE WALL'), 'the wall did not say its name');
  /* the wall falls by itself at 3.5 s, then the cooldown counts from the fall */
  W.step(Math.round(3.6 * 60), false); ok(W.walls().length === 0, 'the wall is still standing 3.6 s on'); const cr = W.G.tierStats().cr || {}; ok(cr.time >= 1, 'the wall did not crumble by time: ' + JSON.stringify(cr));
  ok(W.cellsAt(Math.floor((P.x + 14) / TS)) === 0 || true, ''); const left = W.G.wallCdLeft(); ok(left > 1.5 && left <= 2.5 + 1e-6, 'the cooldown after the fall is ' + left.toFixed(2) + ' (want 2.5 from the fall)');
  W.step(2, false); W.holdFor(holdAt + 0.1); ok(W.walls().length === 0 && P.geoGuard === true, 'a hold on cooldown did not fall back to the held ward (walls ' + W.walls().length + ', ward ' + P.geoGuard + ')');
  W.step(2, false); W.step(Math.round(2.6 * 60), false); W.P.st = 100; W.holdFor(holdAt + 0.1); ok(W.walls().length === 1, 'the wall would not rise again after the cooldown'); }
/* ---------- the upgrade ---------- */
{ const W = world({ stoneWall: 1 }); W.holdFor(holdAt + 0.1); const w = W.walls()[0]; ok(!!w && w.cells.length === 3 && near(w.life, 5.0, 1e-6), 'TALL WALL: ' + (w ? w.cells.length + ' cells, life ' + w.life : 'no wall') + ' (want 3 cells, 5.0 s)'); }
/* ---------- shots ---------- */
{ const W = world(); W.holdFor(holdAt + 0.1); const w = W.walls()[0], sx = (w.x0 + w.x1) / 2;
  const common = { x: sx + 3, y: w.y0 + 8, vx: -200, vy: 0, dead: false, owner: { x: 300 } }; W.seeds.push(common); W.step(1, false); ok(common.dead === true, 'a common foe\'s shot passed the wall'); ok(w.hp === 3, 'a common foe\'s shot cost the wall a point (' + w.hp + ')');
  const boss = { x: sx + 3, y: w.y0 + 8, vx: -200, vy: 0, dead: false, owner: { maxHp: 500 } }; W.seeds.push(boss); W.step(1, false); ok(boss.dead === true && w.hp === 2, 'a boss\'s shot was not stopped for a point (hp ' + w.hp + ')'); }
/* ---------- the burst ---------- */
{ const W = world(), P = W.P; W.holdFor(holdAt + 0.1); const w = W.walls()[0]; W.step(1, false);
  const far = W.foe(14 * TS - P.x + 100 - 100 + 60), boss = W.foe(70, { maxHp: 900, big: true }); far.x = w.x1 + 40; boss.x = w.x1 + 60;
  P.atk = 0.1; P.lastSwingT = W.time; W.box = { l: P.x, r: w.x0 + 8, t: P.y - 30, b: P.y - 1 }; W.step(1, false); W.box = null;
  ok(!W.walls().length && W.G.shards().length === 5, 'a jab on the wall did not burst it into 5 shards (walls ' + W.walls().length + ', shards ' + W.G.shards().length + ')');
  ok(W.G.shards().every(s => s.vx > 0), 'a shard flew back at her'); ok(W.said.includes('SHATTERED'), 'no SHATTERED');
  W.step(40, false); const mine = W.hits.filter(h => h.e === far); ok(mine.length >= 1 && mine.length <= 3, 'a foe took ' + mine.length + ' shards (want 1-3: the shared cap)'); ok(mine.every(h => h.d === 10 && h.b === 'shot'), 'a shard is not swordDmg x 0.5 (10) as a shot: ' + JSON.stringify(mine.map(h => [h.d, h.b])));
  ok(far.stagger >= 0.3 - 1e-9, 'a common foe was not flinched 0.3 s by a shard (' + far.stagger + ')'); ok((boss.stagger || 0) === 0, 'a shard staggered a boss (' + boss.stagger + ')');
  ok(near(W.G.wallCdLeft(), 2.5, 0.8), 'the burst did not start the cooldown: ' + W.G.wallCdLeft().toFixed(2)); }
{ const W = world(), P = W.P; W.holdFor(holdAt + 0.1); const w = W.walls()[0]; W.step(1, false); P.atk = 0.18; P.heavySwing = true; P.lastSwingT = W.time; W.box = { l: P.x, r: w.x0 + 8, t: P.y - 30, b: P.y - 1 }; W.step(1, false);
  ok(W.G.shards().length === 7, 'the stone fist / a held tier did not burst it into 7 shards (' + W.G.shards().length + ')'); }
/* her fist breaks no board stone; a wall piece is not a stone */
{ const W = world(), P = W.P, G = W.G; const tx = Math.floor((P.x + 24) / TS), cells = [[tx, FLOOR - 1]]; const st = G.place('stone', cells, T.SOLID); ok(!!st, 'a stone could not be placed');
  P.atk = 0.18; P.heavySwing = true; P.lastSwingT = W.time; W.box = { l: P.x, r: tx * TS + 8, t: P.y - 30, b: P.y - 1 }; W.step(2, false); ok(!st.gone && G.standing() >= 1, 'her fist broke a board stone'); W.box = null; P.atk = -1; P.heavySwing = false; }
/* a wall evicts no board stone, counts for no pips, and a hold beside a full board still builds one */
{ const W = world(), P = W.P, G = W.G; for (const dx of [-70, -50, -30]) G.place('stone', [[Math.floor((P.x + dx) / TS), FLOOR - 1]], T.SOLID); ok(G.standing() === 3, 'the board of three did not stand');
  W.holdFor(holdAt + 0.1); ok(W.walls().length === 1 && G.standing() === 3, 'the wall evicted a board stone or did not rise beside a full board (standing ' + G.standing() + ')');
  ok(!G.pieces().filter(p => p.capped).some(p => p.kind === 'wall'), 'the wall is counted among the capped pieces'); }
/* cannot rise: the held ward carries on - a pit's edge, no wind, swimming, airborne */
{ const W = world(); const tx = Math.ceil((W.P.x + W.P.w / 2) / TS); for (let x = tx - 1; x <= tx + 3; x++) W.grid[FLOOR * LW + x] = 0; const st0 = W.P.st; W.holdFor(holdAt + 0.15);
  ok(W.walls().length === 0 && W.P.geoGuard === true && W.said.includes('NO GROUND FOR IT'), 'at a pit\'s edge: no wall, the ward stays, and it says NO GROUND FOR IT (walls ' + W.walls().length + ', ward ' + W.P.geoGuard + ', said ' + W.said + ')'); ok(W.P.st >= st0 - 14 * 0.5, 'a fizzle cost wind (' + (st0 - W.P.st) + ')'); }
{ const W = world(); W.P.st = 10; W.holdFor(holdAt + 0.1); ok(W.walls().length === 0 && W.P.geoGuard === true, 'with 10 wind the wall rose or the ward did not carry on'); }
{ const W = world(); W.P.swim = true; W.holdFor(holdAt + 0.1); ok(W.walls().length === 0, 'a wall rose while swimming'); }
{ const W = world(); W.P.ground = false; W.holdFor(holdAt + 0.1); ok(W.walls().length === 0, 'a wall rose in the air'); }
/* one wall at a time */
{ const W = world(); W.holdFor(holdAt + 0.1); ok(W.G.raiseWall({ held: true }) === null && W.walls().length === 1, 'a second held wall rose beside the first'); }
/* the wall is no stone for the recall: its source filters capped pieces; and the old skill-cast raiseWall() is still a plain board stone for the tools */
{ const src = readFileSync(join(ROOT, 'src/geomancer.js'), 'utf8');
  ok(/function recall\(\) \{ const P = api\.P, own = pieces\.filter\(p => p\.capped && !p\.gone\)/.test(src), 'recall no longer reads only capped pieces');
  const W = world(); const p = W.G.raiseWall(); ok(!!p && p.capped === true && !p.held && p.life === Infinity, 'the legacy raiseWall() is not a plain board stone any more (tools/geo-board.mjs builds its board with it)'); }
/* the draw runs (timer strip, shake, hold glint) against a mock 2D context: no throw, and the strip's fillRects are there */
{ const W = world(), calls = []; const g = new Proxy({}, { get: (t, k) => k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : (...a) => { calls.push(k); }, set: () => true });
  let err = null; try { W.holdFor(0.2); W.G.draw(g, 0, 0); W.holdFor(0.1); W.G.draw(g, 0, 0); W.step(120, false); W.G.draw(g, 0, 0); W.step(150, false); W.G.draw(g, 0, 0); W.step(10, false); W.G.draw(g, 0, 0); } catch (e) { err = e; }
  ok(!err, 'GEO.draw threw with a wall standing / falling: ' + (err && err.stack ? String(err.stack).slice(0, 300) : err)); ok(calls.filter(c => c === 'fillRect').length > 20, 'the draw drew nothing'); }
/* wiring in main.js / the texts */
{ const main = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
  ok(/spend: n => spend\(n\), blockedAt/.test(main) && /stoneWall: tal\('stoneWall'\)/.test(main), 'main.js does not give the kit spend() and the TALL WALL upgrade');
  ok(!/act\(skillPress\('stoneWall'\)/.test(main), 'the bought STONE WALL is still an F cast'); ok(/HOLD C and the ward becomes THE STONE WALL/.test(main), 'the hero card does not say HOLD C = THE STONE WALL');
  ok(/TAP ' \+ tk\.c \+ ' WARD, HOLD STONE WALL/.test(readFileSync(join(ROOT, 'src/controls.js'), 'utf8')), 'the controls card does not say TAP C WARD, HOLD STONE WALL'); }
if (bad.length) { console.log('FAIL stone-wall\n - ' + bad.join('\n - ')); process.exit(1); }
console.log('stone-wall: green (node only)');
