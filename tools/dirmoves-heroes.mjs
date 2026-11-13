// tools/dirmoves-heroes.mjs - THE PYROMANCER / GEOMANCER / BERSERKER (claude/dmheroes-b) and BLOOD KNIGHT / RANGER (claude/dmheroes-c) UP+X / DOWN+X ROWS, node only (plan section 6).
// Pure rules + source wiring + a mock-api run of the geomancer's stone side (stone fist origin, slab plant). No browser.
//   node tools/dirmoves-heroes.mjs
import { readFileSync } from 'node:fs'; import assert from 'node:assert';
import * as D from '../src/dirmoves.js'; import { makeGeomancer } from '../src/geomancer.js'; import { makeRanger } from '../src/ranger.js';
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

// ==== (claude/dmheroes-c) BLOOD KNIGHT ====
DM.on = true;
ok(D.chargeName('reaper', 'up') === 'GRAVE HOIST' && D.chargeName('reaper', 'down') === 'BLOOD FURROW', 'reaper rows named');
ok(D.chargeOn('reaper') && +D.chargeReadyAt('reaper', 0.14).toFixed(3) === 0.68, 'reaper: the directional step is HEAVY_START + 0.45 x 1.2 (0.68 s)');
ok(D.chargedBlow('up').join() === 'rise,heavy' && D.chargedBlow('down').join() === 'sweep,heavy' && D.chargedMul('up') === 2.0 && D.chargedMul('down') === 1.6, 'reaper: tags + x2.0 / x1.6 on the generic grammar');
{ const up = box('up', 'reaper'), dn = box('down', 'reaper'), dl = box('up', 'reaper', -1);
  ok(up.l === 96 && up.r === 100 + 32 && up.t === 36 && up.b === 114, 'GRAVE HOIST: the rise box, 28 reach, +24 tall (heaved from under)'); ok(dl.l === 100 - 32 && dl.r === 104, 'GRAVE HOIST faces left when he does');
  ok(dn.l === 60 && dn.r === 140 && dn.t === 92 && dn.b === 102, 'BLOOD FURROW: the blade dragged along the floor BOTH sides (+-40)'); }
ok(D.chargeMove('reaper', 'up').vy === 0 && D.chargeMove('reaper', 'down').vx === 70, 'reaper feel: heaved from a stand, a step dragged for the furrow');
// the TIER FREEZE: UP / DOWN held = the single step, never a tier climb; neutral hold = the five tiers (ladder untouched)
ok(D.ladderFrozen('reaper', 'up') && D.ladderFrozen('reaper', 'down') && !D.ladderFrozen('reaper', null), 'tier freeze: UP / DOWN held freezes the ladder; neutral hold does not');
DM.on = false; ok(!D.ladderFrozen('reaper', 'up') && !D.ladderFrozen('ranger', 'down'), 'DM.on false: no freeze (off = the five tiers as today)'); DM.on = true;
{ const i = main.indexOf('function updateCharge(dt) {'), m = main.indexOf('{ const d = dmAim(); P.dmAim = d; if (d) {', i), kk = main.indexOf('if (isReaper()) { const st = bkTier();   /* (claude/bloodknight) THE FIVE TIERS', i);
  ok(i > 0 && m > 0 && kk > 0 && m < kk, 'wiring: the directional wind returns BEFORE the reaper tier ladder (no tier climb, no BKIT.BLOOD.tiers.auto loose, no debt spend)'); ok(main.indexOf('P.bkWant = 0; if (ok) { fireCharged(d)', i) > 0, 'wiring: a directional release clears bkWant (a T4/T5 never rides it)'); }
// GRAVE HOIST pays vitae for air hits on the heaved foe
{ const R = DM.heroes.reaper, e = {}; D.hoistMark(e, 10, 11.6); ok(e.dmHoist === 11.6 && e.dmHoistN === 0, 'the heaved foe is marked until its launch ends');
  ok(D.hoistPay(e, 10.02, 100) === 0, 'the launching blow itself pays nothing (inside hoistGap)');
  let got = 0, n = 0; for (let t = 10.1; t < 11.5; t += 0.1) { const v = D.hoistPay(e, t, 100); if (v > 0) { n++; got += v; } }
  ok(n === 3 && Math.abs(got - 15) < 1e-9, 'three air hits pay 5% of his max health as vitae each (15 of 100), then it stops'); ok(D.hoistPay(e, 11.7, 100) === 0, 'nothing after the launch ends');
  ok(D.hoistPay({}, 10, 100) === 0 && D.hoistPay(null, 10, 100) === 0, 'an unmarked foe pays nothing'); DM.on = false; const e2 = {}; D.hoistMark(e2, 1, 2); ok(e2.dmHoist === undefined && D.hoistPay({ dmHoist: 9 }, 1, 100) === 0, 'DM.on false: no mark, no vitae'); DM.on = true; ok(R.hoistPays === 3, 'hoistPays is the table'); }
// BLOOD FURROW: spikes both sides, bleed
ok(JSON.stringify(D.furrowXs(100)) === '[86,114,72,128,58,142]', 'BLOOD FURROW: three blood spikes either side (14 px apart)'); ok(D.furrowBleedOf('reaper') === 2 && D.furrowBleedOf('knight') === 0, 'FURROW bleeds (stage 2) on the reaper only');
ok(/function swingKindHit\(e\) \{[\s\S]*?isReaper\(\) && P\.dmCharged && DMX\.dmOn\(\) && e\.alive/.test(main) && /DMX\.hoistMark\(e, time, time \+ DMX\.DM\.charge\.launchT\)/.test(main) && /bkBleed\(e, DMX\.furrowBleedOf\('reaper'\)\)/.test(main), 'wiring: the hoist marks, the furrow bleeds, in swingKindHit');
ok(/function bkReclaim\(dmg, e\) \{ if \(!isReaper\(\)\) return 0;[^\n]*\n  \{ const hv = DMX\.hoistPay\(e, time, P\.maxHp\)/.test(main) && /P\.bkVitIn = \(P\.bkVitIn \|\| 0\) \+ hv/.test(main), 'wiring: the air hit pays P.bkVitIn (the VITAE step drinks it; a frenzy never fills)');
ok(/else if \(isReaper\(\)\) \{   \/\* \(claude\/dmheroes-c\) GRAVE HOIST/.test(main) && /DMX\.furrowXs\(P\.x\)/.test(main), 'wiring: fireCharged world side for the reaper');

// ==== (claude/dmheroes-c) RANGER ====
ok(D.chargeOn('ranger') && D.CHARGE_HEROES_OFF.size === 0, 'ranger: the directional charge is on (CHARGE_HEROES_OFF is empty)');
ok(D.chargeName('ranger', 'up') === 'LOFTED SHOT' && D.chargeName('ranger', 'down') === 'ANKLE SHOT', 'ranger rows named');
ok(+D.chargeReadyAt('ranger', 0.14).toFixed(4) === 0.5225, "ranger: the step is HEAVY_START + 0.45 x 0.85 (0.52 s), the kneel draw's own wind (0.525 s)");
{ const L = D.rangerShot('up', 1, 420), A = D.rangerShot('down', 1, 420), Al = D.rangerShot('down', -1, 420), Ll = D.rangerShot('up', -1, 420), H = DM.heroes.ranger;
  ok(L.kind === 'lofted' && L.tag.join() === 'rise,heavy,shot' && !L.low && L.vx === 150 && L.vy === -330 && L.mul === 1.7, "LOFTED SHOT: a steep arc, rise + heavy + shot tags, the long shot's x1.7");
  ok(A.kind === 'ankle' && A.tag.join() === 'sweep,heavy,shot' && A.low && Math.abs(A.vx - 483) < 1e-9 && A.vy === -6 && A.mul === 1.5, 'ANKLE SHOT: flat and low, sweep + heavy + shot tags, faster than the full draw');
  ok(Al.vx < 0 && Ll.vx < 0 && Al.vx === -A.vx, 'both mirror when she faces left');
  ok(Math.round(D.arcApex(H.loftVy, H.loftG)) === 97 && Math.round(D.arcRange(H.loftVx, H.loftVy, H.loftG)) === 177, 'the loft: ~97 px up, lands ~177 px out - covers some of the room, not all of it');
  ok(D.arcApex(H.ankleVy, H.ankleG) < 1 && D.arcApex(L.vy, L.g) > 90, 'the ankle shot skims (apex < 1 px); the loft arcs'); }
// run the REAL ranger.js: both shots, against a mock world
{ const TS = 16, LW = 60, LH = 12, SOLID = 1, grid = new Array(LW * LH).fill(0); for (let x = 0; x < LW; x++) grid[10 * LW + x] = SOLID;
  const noop = () => {}, hits = [], pops = [], trips = []; let t = 0;
  const mk = () => { const P = { x: 100, y: 10 * TS, face: 1, ground: true, swim: false, vy: 0, hp: 9, dead: false, hitSet: new Set(), rgQ: 5, rgCd: 0, atk: -1 };
    const foe = (x, o) => Object.assign({ alive: true, harmless: false, gone: 0, x, y: 10 * TS, w: 12, h: 16, hp: 500, t: 'grunt' }, o || {});
    const enemies = [];
    const api = new Proxy({ TS, LW, LH, P, enemies, get time() { return t; }, tal: () => ({}), isSolid: (x, y) => grid[y * LW + x] === SOLID, isOneWay: () => false, tileAt: (x, y) => grid[y * LW + x], knockSkip: () => false,
      overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: e => ({ l: e.x - e.w / 2, r: e.x + e.w / 2, t: e.y - e.h, b: e.y }), swordDmg: () => 10, amul: () => 1,
      hurtAs: (tag, e, d) => { hits.push({ tag, e, d }); e.hp -= d; if (e.hp <= 0) e.alive = false; }, dmPop: e => pops.push(e), dmTrip: e => trips.push(e), boss: null, VW: 320, number: noop, SFX: new Proxy({}, { get: () => noop }) }, { get: (o, k) => k in o ? o[k] : noop });
    return { P, foe, enemies, G: makeRanger(api) }; };
  const fly = (w, n) => { for (let i = 0; i < n; i++) { t += 1 / 60; w.G.update(1 / 60, {}, {}); } };
  // off: nothing
  DM.on = false; { const w = mk(); ok(w.G.dmShot('up') === false && w.P.rgQ === 5, 'DM.on false: dmShot is inert (no arrow taken)'); }
  DM.on = true;
  { const w = mk(); ok(w.G.dmShot('up') === true && w.P.rgQ === 4 && w.P.rgArrows.length === 1, 'LOFTED SHOT: takes ONE arrow, one arrow in the air'); const a = w.P.rgArrows[0];
    ok(a.dmLoft && !a.dmTrip && a.tag.join() === 'rise,heavy,shot' && a.vy === -330 && a.g === 560 && a.dmg === 17, 'lofted arrow: dmLoft, tags, steep, dmg 10 x 1.7'); ok(w.P.rgCd > 0, 'she is busy a beat after the loose'); }
  { const w = mk(); const f = w.foe(100 + 170); w.enemies.push(f); w.G.dmShot('up'); hits.length = pops.length = 0; fly(w, 120);
    ok(hits.length === 1 && hits[0].tag.join() === 'rise,heavy,shot', 'the lofted arrow comes DOWN on a foe 170 px out and lands as a rise + heavy blow'); ok(pops.length === 1 && pops[0] === f, 'and POPS the ground foe up (dmPop)'); ok(trips.length === 0, 'no trip from a loft'); }
  { const w = mk(); const f = w.foe(100 + 60); w.enemies.push(f); w.G.dmShot('up'); hits.length = 0; fly(w, 20); ok(hits.length === 0, 'it sails OVER a foe at 60 px (a steep arc is not a point-blank shot)'); }
  { const w = mk(); ok(w.G.dmShot('down') === true && w.P.rgQ === 4, 'ANKLE SHOT: takes ONE arrow'); const a = w.P.rgArrows[0];
    ok(a.dmTrip && !a.dmLoft && a.kneel && a.tag.join() === 'sweep,heavy,shot' && a.g === 90 && a.dmg === 15, 'ankle arrow: dmTrip, kneel (her trials count it), sweep + heavy, dmg 10 x 1.5'); }
  { const w = mk(); const f = w.foe(100 + 110); w.enemies.push(f); w.G.dmShot('down'); hits.length = pops.length = trips.length = 0; fly(w, 40);
    ok(hits.length === 1 && hits[0].tag.join() === 'sweep,heavy,shot', 'the ankle shot skims into a foe 110 px out as a sweep + heavy blow'); ok(trips.length === 1 && trips[0] === f && pops.length === 0, 'and TRIPS it (dmTrip), no pop'); }
  { const w = mk(); w.P.rgQ = 0; ok(w.G.dmShot('up') === false && w.G.dmShot('down') === false, 'an empty quiver shoots nothing (main.js says OUT OF ARROWS)'); }
  { const w = mk(); ok(w.G.dmShot('left') === false && w.P.rgQ === 5, 'only up / down'); } }
// main.js wiring for her
ok(/function fireCharged\(dir\) \{\n  if \(isRg\(\)\) return rgCharged\(dir\);/.test(main) && /function rgCharged\(dir\) \{[\s\S]*?spend\(heavyCost\(\)\)[\s\S]*?RGK\.dmShot\(dir\)/.test(main), 'wiring: fireCharged hands the ranger her arrows (heavyCost wind, an arrow, OUT OF ARROWS when empty)');
ok(/dmPop: e => dmArrowPop\(e\), dmTrip: e => dmArrowTrip\(e\)/.test(main) && /function dmArrowPop\(e\)[\s\S]*?DMX\.launchWeight\(e\)[\s\S]*?function dmArrowTrip\(e\)[\s\S]*?DMX\.tripTime\(e, hb\)/.test(main), "wiring: the pop and the trip are the melee launcher's / slam's numbers");
ok(/if \(!\(isRg\(\) && d === 'down'\)\) \{ SFX\.ui\(\); return; \} P\.atkHeld = held0; P\.charge = charge0;/.test(main), 'wiring: an early DOWN release is her ordinary partial draw; an early UP is nothing (the rising shot already flew)');
ok(/keys\.atk && keys\.up && isRg\(\) && P\.rgCd > 0 && DMX\.chargeOn\('ranger'\)/.test(main), "wiring: the rising shot's lock-out counts as wind (the UP-key jump stays suppressed)");
{ const rsrc = readFileSync(new URL('../src/ranger.js', import.meta.url), 'utf8'); ok(/dmShot: dir => dmShot\(P\(\), dir\)/.test(rsrc) && /api\.dmPop\(e\)/.test(rsrc) && /api\.dmTrip\(e\)/.test(rsrc), 'wiring: ranger.js exports dmShot and calls the foe hooks'); }
DM.on = false; ok(!D.chargeOn('ranger') && !D.chargeOn('reaper'), 'DM.on false: no directional charge for the blood knight or the ranger');
console.log('dirmoves-heroes: ' + n + ' checks OK');
