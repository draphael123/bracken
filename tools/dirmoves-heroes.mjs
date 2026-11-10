// tools/dirmoves-heroes.mjs - THE PYROMANCER / GEOMANCER / BERSERKER UP+X / DOWN+X ROWS, node only (claude/dmheroes-b; plan section 6).
// Pure rules + source wiring + a mock-api run of the geomancer's stone side (stone fist origin, slab plant). No browser.
//   node tools/dirmoves-heroes.mjs
import { readFileSync } from 'node:fs'; import assert from 'node:assert';
import * as D from '../src/dirmoves.js'; import { makeGeomancer } from '../src/geomancer.js';
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n'), geoSrc = readFileSync(new URL('../src/geomancer.js', import.meta.url), 'utf8');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const { DM } = D;
DM.on = true;
const box = (d, h, f = 1, atk = 0.1, opt) => D.chargeBox(d, h, 100, 100, f, atk, opt), w = b => b.r - b.l;

// ---- PYROMANCER ----
ok(D.chargeName('pyro', 'up') === 'FIRE PILLAR' && D.chargeName('pyro', 'down') === 'FLOOR FIRE', 'pyro rows named');
{ const up = box('up', 'pyro'), dn = box('down', 'pyro'), dl = box('down', 'pyro', -1);
  ok(up.l === 124 && up.r === 152 && up.t === 36 && up.b === 114, 'FIRE PILLAR: the geyser box stands at reach (24..52 px out), 64 up'); ok(up.l > 100 + 20, 'the pillar is NOT at her hand (anti-air at reach)');
  ok(dn.l === 96 && dn.r === 100 + 3 * 16 + 4 && dn.t === 92 && dn.b === 102, 'FLOOR FIRE: a 3-tile line (48 px) on one side, along the floor'); ok(dl.r === 104 && dl.l === 100 - 52, 'FLOOR FIRE faces left when she does'); }
ok(JSON.stringify(D.fireLineXs(100, 1)) === '[116,132,148]' && JSON.stringify(D.fireLineXs(100, -1)) === '[84,68,52]', 'the fire line burns on three tiles ahead');
ok(D.heatOnCharge('pyro') === 12 && D.heatOnCharge('knight') === 0 && DM.heroes.pyro.fireLife === 2, '+heat on a pyro charged blow only; burning ground 2 s');
ok(D.chargeMove('pyro', 'up').vy === 0 && D.chargeMove('pyro', 'down').vx === 40, 'pyro feel: stands, a small lunge for the floor fire');

// ---- GEOMANCER ----
ok(D.chargeName('geomancer', 'up') === 'STONE FIST' && D.chargeName('geomancer', 'down') === 'SLAB SLIDE', 'geomancer rows named');
ok(D.geoStoneOrigin([200], 100, 1) === null && D.geoStoneOrigin([], 100, 1) === null && D.geoStoneOrigin(undefined, 100, 1) === null, 'no stone in reach -> the staff');
ok(D.geoStoneOrigin([150], 100, 1) === 150 && D.geoStoneOrigin([112 + 48], 100, 1) === 160 && D.geoStoneOrigin([112 + 49], 100, 1) === null, 'a stone within 3 tiles (48 px) of her front point is the origin; one px past is not');
ok(D.geoStoneOrigin([120, 140, 160], 100, 1) === 120 && D.geoStoneOrigin([60, 20], 100, -1) === 60, 'the NEAREST stone to her front wins; mirrored when she faces left');
ok(D.geoStoneOrigin([20], 100, 1) === null, 'a stone BEHIND her is nothing to erupt from');
{ const s = box('up', 'geomancer', 1, 0.1, { ox: 150 }), f0 = box('up', 'geomancer'); ok(s.l === 138 && s.r === 162 && s.t === 36, 'STONE FIST at a stone: the column over THAT stone (ranged launch)'); ok(f0.l === 108 && f0.r === 136, 'no stone: the box is at the staff'); }
ok(+D.slabLen(0.02).toFixed(2) === 10 && D.slabLen(0.2) === 48 && D.slabLen(0.11) > 10 && D.slabLen(0.11) < 48 && D.slabLen(5) === 48, 'the slab skids: 10 px at the start of its window, 48 (3 tiles) at the end');
{ const a = box('down', 'geomancer', 1, 0.04), b = box('down', 'geomancer', 1, 0.18); ok(w(b) > w(a) && b.l === 100, 'the slab box rides its front out along the floor, one side'); ok(box('down', 'geomancer', -1, 0.18).r === 100, 'and the other way when she faces left'); }
ok(D.slabStopX(100, 1) === 148 && D.slabStopX(100, -1) === 52, 'the slab stops 3 tiles out');
ok(D.chargeMove('geomancer', 'up').vx === 0 && D.chargeMove('geomancer', 'down').vx === 0, 'the staff stays planted');
// the stone side, against the real geomancer.js with a mock api
{ const TS = 16, LW = 40, LH = 12, AIR = 0, SOLID = 1, grid = new Array(LW * LH).fill(AIR); for (let x = 0; x < LW; x++) grid[10 * LW + x] = SOLID;   /* floor at row 10 */
  const P = { x: 100, y: 10 * TS, face: 1, vy: 0, h: 28, w: 10, hp: 9, dead: false, hitSet: new Set() };
  const noop = () => {}; let t = 0;
  const api = new Proxy({ TS, LW, LH, L: { grid }, T: { AIR, SOLID }, P, enemies: [], players: [], get time() { return t; }, tal: () => ({}), tileAt: (x, y) => grid[y * LW + x], isSolid: (x, y) => grid[y * LW + x] === SOLID, isOneWay: () => false,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: o => ({ l: o.x - (o.w || 10) / 2, r: o.x + (o.w || 10) / 2, t: o.y - (o.h || 16), b: o.y }),
    swordDmg: () => 4, amul: () => 1, lcBig: () => false, knockSkip: () => false, resolveTiles: noop, blockedAt: () => false, parts: [] }, { get: (o, k) => k in o ? o[k] : noop });
  const G = makeGeomancer(api);
  ok(G.stoneXs().length === 0 && G.standing() === 0, 'mock board starts empty');
  ok(G.plantAtX(148, 1) === true && G.standing() === 1, 'SLAB SLIDE plants ONE stone where it stopped'); ok(G.stoneXs().length === 1 && Math.abs(G.stoneXs()[0] - (Math.floor(148 / TS) * TS + 8)) < 1, 'the stone stands in the column the slab stopped in');
  ok(D.geoStoneOrigin(G.stoneXs(), P.x, 1) !== null, 'the planted stone is then a STONE FIST origin (stones feed both rows)');
  ok(G.plantAtX(148, 1) === true && G.standing() === 2, 'a second slab walks back toward her to the next free column (a column that holds a stone is not free)');
  ok(G.plantAtX(148, 1) === true && G.standing() === 3, 'a third plants'); ok(G.plantAtX(148, 1) === false && G.standing() === 3, 'the 3-stone cap holds: a full board plants nothing and evicts nothing');
  ok(new Set(G.stoneXs()).size === 3, 'three distinct columns');
  G.clear(); ok(G.standing() === 0, 'clear() takes the stones');
  grid[10 * LW + 9] = AIR; ok(G.plantAtX(9 * TS + 8, -1) === true && G.standing() === 1, 'a slab stopping over a gap walks back toward her and still plants');
}
// ---- BERSERKER ----
ok(D.chargeName('berserker', 'up') === 'GUT HEAVE' && D.chargeName('berserker', 'down') === 'HAMSTRING CHOP', 'berserker rows named');
{ const up = box('up', 'berserker'), dn = box('down', 'berserker'); ok(up.l === 94 && up.r === 130 && up.t === 36, 'GUT HEAVE: both axes hooked under (a tall box in front)'); ok(dn.l === 94 && dn.r === 138 && dn.t === 90 && dn.b === 102, 'HAMSTRING CHOP: a low box in front, shin high'); }
ok(D.rendOnCharge('berserker') === 1 && D.rendOnCharge('pyro') === 0 && D.rendOnCharge('geomancer') === 0, '+REND on a berserker charged blow only');
ok(D.chargeMove('berserker', 'down').vx === 150 && D.chargeMove('berserker', 'up').vx === 50, 'the axes lunge');
// every one of the three keeps DMCHARGE's grammar: one step, direction at release, boxes in their window, tags
for (const h of ['pyro', 'geomancer', 'berserker']) { ok(D.chargeOn(h), h + ': the directional charge is on'); ok(+D.chargeReadyAt(h, 0.14).toFixed(3) === 0.59, h + ': ONE step at HEAVY_START + 0.45'); ok(D.chargeBox('up', h, 0, 0, 1, 0.3) === null && D.chargeBox('down', h, 0, 0, 1, 0) === null, h + ': boxes live only in their window'); ok(D.chargedMul('up') === 2.0 && D.chargedMul('down') === 1.6, h + ': launcher x2.0 / slam x1.6'); }
// DM.on false: nothing of it speaks
DM.on = false; ok(!D.chargeOn('pyro') && !D.chargeOn('geomancer') && !D.chargeOn('berserker'), 'DM.on false: no directional charge for any of the three');
// source wiring
ok(/function dmHeroRow\(dir\)/.test(main) && /DMX\.chargeName\(hero\(\), dir\), '#ffd36b'\); dmHeroRow\(dir\)/.test(main), 'fireCharged calls the hero rows');
ok(/\{ ox: P\.dmOx \}/.test(main), 'attackBox0 passes the stone fist origin'); ok(/BZK\.rend\(e, !!\(P\.dmCharged && DMX\.dmOn\(\) && DMX\.rendOnCharge\(hero\(\)\)\)\)/.test(main), 'heroCut: a berserker charged blow stacks REND (forced)');
ok(/function dmHeroTick\(\)/.test(main) && /function updateCharge\(dt\) \{\n  dmHeroTick\(\);/.test(main), 'the slab plant is ticked before updateCharge can early-return');
ok(/GEO\.plantAtX\(q\.x, q\.dir\)/.test(main) && /GEO\.stoneXs\(\)/.test(main) && /gainHeat\(DMX\.heatOnCharge\('pyro'\)\)/.test(main) && /fires\.push\(\{ x, y: P\.y, life: H\.pyro\.fireLife/.test(main), 'pyro heat + fire line, geomancer stones wired');
ok(/plantAtX, fistSpike/.test(geoSrc) && /const stoneXs = \(\) =>/.test(geoSrc), 'geomancer.js exports the stone side');
ok(/P\.dmOx = null; P\.dmPlant = null;/.test(main), 'a fresh charged blow forgets the last stone / slab');
console.log('dirmoves-heroes: ' + n + ' checks OK');
