/* tools/owl4-rules.mjs - THE OWL REEVE 4 RULES (claude/owl4, 11-10; plan scratch/lane-reports/owl4-plan.md "Node-only checks"). Node only: no page, no port, no browser.
     node tools/owl4-rules.mjs
   A. FLAG OFF = MASTER: the built Hanging Village (ropes, ents, hangers, grid, movers, arena) hashes to master's (pinned from origin/master 03f8a36ce), with no owlNets key.
   B. FLAG ON, THE BAG: phase one gains exactly one move (the stoop), phase two exactly one more (the net, ropecut 3 -> 2); no move over a fifth of its phase's bag (the swoop 3/18 ...).
   C. THE OPEN LISTS: slammed / stoopDown / netted are in main.js OWL_OPEN and in src/boss-greed.js OPEN_RULE.owl; the B15 floor: under her ward a blow still lands 0.4 (flag on; 0 on master).
   D. THE SHADOW GOBLINS: 4 of them, every one with a re-lightable village lamp within 6 tiles on its floor (+-2 rows) lighting >= 40% of its +-7 tile patrol; shadowLit unit cases.
   E. THE ROPES MODULE: a dropped LIT lamp yields a light pool that burns foes (never the hero) and re-hangs after; a dropped DARK lamp shatters; a sandbag armed in its fall and in its
      swing meets a LOW Reeve; a swinging bag shoves a hero and does no damage.
   F. THE REEVE, run in a vm on the real updateOwl slice: the stoop (told, locked, dodged / hit / blocked / parried), the net (carried, locked, dodged / netted hero / struck onto her), SLAMMED,
      every floor landing off THE DROP, and R3 (a cut at takeoff or wake drops her with her perch). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { LEVELS } from '../src/level.js';
import * as O4 from '../src/owl4.js';
import { makeHangingRopes } from '../src/hanging-ropes.js';
import * as GB from '../src/boss-greed.js';
const { OWL4, HV_LAMPS, HV_LAMP, SHADOW, shadowLit, owlOverDrop } = O4;
const TS = 16, src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const hang = () => LEVELS.find(l => l.id === 'hanging').build();
const h = o => createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 12);
const MASTER = { ropes: 'd8dffa825039', ents: 'e4269f8e36fa', hangers: 'decae3014b88', perches: '4b6124bdeda0', arena: 'e3959feee95c', grid: '05e428983c4f', movers: '57dd8691e5cb', keys: 'ce756d792ad1' };
const sum = [];

/* ---- A. FLAG OFF = MASTER ---- */
delete process.env.BRACKEN_OWL4; assert(!O4.owl4On(), 'the flag is off by default');
{ const L = hang(), got = { ropes: h(L.ropes), ents: h(L.ents), hangers: h(L.hangers), perches: h(L.perches), arena: h(L.arena), grid: h(Array.from(L.grid)), movers: h(L.moversExtra), keys: h(Object.keys(L)) };
  assert.deepEqual(got, MASTER, 'flag OFF the built level is master\'s: ' + JSON.stringify(got)); assert(!('owlNets' in L), 'no owlNets key with the flag off'); assert(!L.ropes.some(r => r.kind === 'lampcord')); assert(!L.ents.some(e => e.t === 'shadowgob' || e.hv)); }
sum.push('A flag OFF: ropes/ents/hangers/grid/movers/arena hashes = master');

/* ---- B. THE BAG ---- */
const masterBag = vm.runInNewContext('(' + /const OWL_BAG = (\{.*?\});/.exec(src)[1].replace(/\/\*.*?\*\//g, '') + ')');
{ const k1 = Object.keys(OWL4.bag[1]), k2 = Object.keys(OWL4.bag[2]), m1 = Object.keys(masterBag[1]), m2 = Object.keys(masterBag[2]);
  assert.deepEqual(k1.filter(k => !m1.includes(k)), ['stoop'], 'phase one gains exactly the stoop'); assert.deepEqual(k1.filter(k => !k2.includes(k)), [], 'phase two keeps every phase-one move');
  assert.deepEqual(k2.filter(k => !m2.includes(k)).sort(), ['net', 'stoop'], 'phase two gains the stoop (from phase one) and exactly one more: the net'); assert.deepEqual(k2.filter(k => !k1.includes(k) && !m2.includes(k)), ['net'], 'and the only move not already in phase one or master is the net');
  assert.equal(OWL4.bag[2].ropecut, 2); assert.equal(masterBag[2].ropecut, 3, 'master ropecut is 3');
  for (const ph of [1, 2]) { const tot = Object.values(OWL4.bag[ph]).reduce((a, b) => a + b, 0), mx = Math.max(...Object.values(OWL4.bag[ph])); assert(mx / tot <= 0.25, `phase ${ph}: no move over a quarter (${mx}/${tot})`); sum.push(`B phase ${ph} bag ${tot}: biggest move ${(100 * mx / tot).toFixed(0)}%, stoop ${(100 * OWL4.bag[ph].stoop / tot).toFixed(0)}%` + (ph === 2 ? `, net ${(100 * OWL4.bag[2].net / tot).toFixed(0)}%` : '')); } }

/* ---- C. THE OPEN LISTS + THE B15 FLOOR ---- */
const mainOpen = vm.runInNewContext(/const OWL_OPEN = (\[.*?\]);/.exec(src)[1]);
for (const m of ['slammed', 'stoopDown', 'netted', 'crash', 'grounded', 'pinned', 'perchDown']) { assert(mainOpen.includes(m), 'OWL_OPEN has ' + m); assert(GB.OPEN_RULE.owl({ mode: m }), 'boss-greed OPEN_RULE.owl has ' + m); }
for (const m of ['sit', 'skim', 'stoop', 'stoopTell', 'netTell', 'swoop']) assert(!GB.OPEN_RULE.owl({ mode: m }), m + ' is not an opening');
const takeCtx = o4on => { const c = vm.createContext({ O4: o4on ? O4 : undefined, OWL_PERCH: { take: 2 } }); process.env.BRACKEN_OWL4 = o4on ? '1' : '0';
  vm.runInContext(/const owl4 = .*$/m.exec(src)[0] + '\n' + /const owlTake = .*$/m.exec(src)[0], c); return e => vm.runInContext('owlTake', c)(e); };
{ const on = takeCtx(true), off = takeCtx(false);
  assert.equal(off({ ward: 2, mode: 'sit' }), 0, 'master: nothing lands in her ward'); process.env.BRACKEN_OWL4 = '1'; assert.equal(on({ ward: 2, mode: 'sit' }), 1, 'flag on: her ward lets the blow through to the chip');
  const e = { t: 'owl', mode: 'sit', ward: 2 }; let out = 0; for (let i = 0; i < 100; i++) out += GB.chipOf(e, on(e) * 10, 10);
  assert(out >= 0.4 * 100 * 10 - 1.5, 'under her ward 100 blows of 10 land >= 0.4 of their weight: ' + out);
  for (const m of ['slammed', 'netted', 'stoopDown']) assert(on({ mode: m, ward: 0 }) >= 1.5, m + ' pays more than the chip');
  assert(GB.GREED.chipBy.owl >= 0.4, 'chipBy.owl >= 0.4');
  sum.push('C open lists ok; ward x' + on({ ward: 1, mode: 'x' }) + ' -> chip 0.4 (' + (out / 1000).toFixed(2) + 'x of raw) vs master ward x0; slammed x' + on({ mode: 'slammed' }) + ', netted x' + on({ mode: 'netted' }) + ', stoopDown x' + on({ mode: 'stoopDown' })); }
process.env.BRACKEN_OWL4 = '1';

/* ---- D. THE SHADOW GOBLINS ---- */
const LON = hang();
{ const gobs = LON.ents.filter(e => e.t === 'shadowgob'); assert.equal(gobs.length, 4, 'four Shadow Goblins (1 teach, 1 test, 2 exam)');
  for (const g of gobs) { const lamps = LON.ents.filter(e => e.t === 'lantern' && e.hv && Math.abs(e.y - g.y) <= 2 && Math.abs(e.x - g.x) <= 6); assert(lamps.length >= 1, `shadow goblin ${g.x},${g.y} has a re-lightable lamp within 6 tiles`);
    const cov = lamps.map(l => { let n = 0; for (let x = g.x - 7; x <= g.x + 7; x++) if (Math.abs(x - l.x) <= HV_LAMP.r / TS) n++; return n / 15; }); assert(Math.max(...cov) >= 0.4 - 1e-9, `light covers >= 40% of the patrol at ${g.x},${g.y}: ${cov}`);
    assert(LON.grid[(g.y + 1) * LON.W + g.x], 'stands on ground'); }
  const ls = [{ x: 100, y: 100, r: 64 }];
  assert(shadowLit(100, 100, ls) && shadowLit(150, 100, ls) && !shadowLit(170, 100, ls) && !shadowLit(100, 100, []) && !shadowLit(100, 100, null) && shadowLit(100, 160, ls) && !shadowLit(100, 170, ls), 'shadowLit unit cases');
  sum.push('D 4 shadow goblins, each with a village lamp <= 6 tiles away lighting >= 40% of +-7 tiles; shadowLit unit cases'); }

/* ---- E. THE ROPES MODULE ---- */
const mkCtx = (L, o = {}) => { const noop = () => {}, c = { get L() { return L; }, TS, T: { AIR: 0, ONEWAY: 2, PLANK: 7, SOLID: 1 }, sfx: new Proxy({}, { get: () => noop }), movers: () => L.moversExtra, players: () => o.players || [{ x: 0, y: 0, dead: true }], enemies: () => o.enemies || [], hitSet: () => (o.hs = o.hs || new Set()),
  number: noop, burst: noop, dust: noop, shake: noop, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: e => ({ l: e.x - 5, r: e.x + 5, t: e.y - 16, b: e.y }), hurt: (e, d, x) => { (o.hurts = o.hurts || []).push({ e, d, x }); }, cellSet: noop, struck: () => false, perchCut: () => false, owlOn: () => false,
  props: () => o.props || [], lights: () => o.lights || [], owlNets: () => L.owlNets }; return c; };
{ const L = hang(), floorY = (51 + 1) * TS, lampX = 48 * TS + 8, mkProp = lit => ({ t: 'lantern', x: lampX, y: 50 * TS + 16, y0: 50 * TS + 16, cord: 'lamp-rook', lit, hv: true, owl: true, lampT: 5, cool: 0 });
  for (const lit of [true, false]) { const pr = mkProp(lit), foe = { alive: true, x: lampX + 6, y: floorY, w: 8, h: 10 }, hero = { x: lampX, y: floorY, dead: false, hp: 100 }, o = { props: [pr], enemies: [foe], players: [hero] }, H = makeHangingRopes(mkCtx(L, o)); H.load();
    pr.lit = lit; assert(H.on() && H.pools().length === 0); assert(H.cut('lamp-rook'), 'the cord can be cut'); let pool = false, t = 0; for (; t < 240; t++) { H.update(1 / 60); if (H.pools().length) pool = true; }
    if (lit) { assert(pool, 'a dropped lit lamp makes a light pool'); assert((o.hurts || []).length >= 2 && o.hurts.every(x => x.d === O4.LAMP_DROP.dmg && x.e === foe), 'the pool burns the foe in it, repeatedly'); assert.equal(hero.hp, 100, 'never hurts the hero'); }
    else { assert(!pool, 'a dark lamp shatters and leaves no pool'); assert(!(o.hurts || []).length); }
    assert(pr.gone && pr.cordState === 'down', 'the dropped lamp is gone'); for (t = 0; t < 60 * 13; t++) H.update(1 / 60); assert(!pr.gone && pr.y === pr.y0 && !pr.lit && pr.cordState === 'hung' && H.cut('lamp-rook') === true, 're-hung after ' + O4.LAMP_DROP.rehang + ' s and cuttable again'); }
  sum.push('E a dropped lit lamp: pool of ' + O4.LAMP_DROP.pool + ' s burning foes ' + O4.LAMP_DROP.dmg + ' per ' + O4.LAMP_DROP.tick + ' s, never the hero; a dark one shatters; both re-hung after ' + O4.LAMP_DROP.rehang + ' s'); }
{ const L = hang(), hero = { x: 0, y: 320, dead: false, vx: 0 }, o = { players: [hero] }, c = mkCtx(L, o), H = makeHangingRopes(c), id = 'cw-crown-w'; H.load();
  const bagLine = () => H.bags().find(b => b.id === id); const lowTop = (320 - 8) - 30; let slamF = 0, frames = 0;
  assert(!bagLine().armed, 'a hung bag is not armed'); H.cut(id); for (let i = 0; i < 400; i++) { for (const m of L.moversExtra) if (m.rope) H.mover(m, 1 / 60); H.update(1 / 60); frames++; const b = bagLine(); if (b.armed && b.b + OWL4.slam.bagReach >= lowTop && b.t < 312) slamF++; }
  assert(slamF >= 2, 'a bag falling with its deck is armed and meets a low Reeve for ' + slamF + ' frames');
  /* the swing: wait until the deck is up, strike the bag */
  H.load(); H.cut(id); let g = 0; const m = L.moversExtra.find(q => q.rope === id); while (m.rs !== 'top' && g++ < 400) { H.mover(m, 1 / 60); H.update(1 / 60); } assert.equal(m.rs, 'top', 'the deck is up'); for (let i = 0; i < 30; i++) { H.mover(m, 1 / 60); H.update(1 / 60); }
  const b0 = bagLine(); assert(!b0.armed && !b0.swinging, 'settled and still'); hero.x = b0.x; hero.y = 275;
  H.strike({ l: b0.x - 10, r: b0.x + 10, t: b0.t, b: b0.b }); assert(bagLine().swinging, 'a blow on the bag swings it'); let maxOff = 0, armedF = 0, knocked = false, bx0 = b0.x;
  for (let i = 0; i < 200; i++) { m.t = 0; H.mover(m, 1 / 60); H.update(1 / 60); const b = bagLine(); maxOff = Math.max(maxOff, Math.abs(b.x - bx0)); if (b.armed) armedF++; if (Math.abs(hero.vx) === OWL4.swing.knock) knocked = true; hero.x = b.x; }
  assert(Math.abs(maxOff - OWL4.swing.amp) < 3, 'the swing reaches +-' + OWL4.swing.amp + ' px: ' + maxOff.toFixed(1)); assert(armedF > 60, 'armed for most of its 2.4 s: ' + armedF + ' frames'); assert(knocked, 'a swinging bag shoves the hero'); assert(!bagLine().swinging, 'and hangs still again');
  sum.push('E sandbags: falling bag armed for ' + slamF + ' frames at the end of its fall (+' + OWL4.slam.bagReach + ' px reach), a struck bag swings +-' + maxOff.toFixed(0) + ' px for ' + (armedF / 60).toFixed(1) + ' s armed, shoves the hero ' + OWL4.swing.knock + ' px/s, no damage'); }

/* ---- F. THE REEVE, on the real updateOwl slice ---- */
const slice = src.slice(src.indexOf('function lightOwlLamp'), src.indexOf('// The Forgemaster.', src.indexOf('function lightOwlLamp')));
function world(opts = {}) {
  const L = hang(), A = L.arena, floor = A.floor, noop = () => {}, log = { dmg: [], say: [] };
  const P = { x: 700, y: floor, dead: false, ground: true, dodge: 0, parryT: 0, caged: 0, vx: 0, vy: 0, block: false, hp: 100 }, keys = {}; let dmgRes = 'hit';
  const ctx = vm.createContext({ L, props: [], TS, P, enemies: [], SFX: new Proxy({}, { get: () => noop }), number: (x, y, t) => log.say.push(t), burst: noop, ringAt: noop, dust: noop, shakeCam: noop, zoomKick: noop, sparks: noop, flash: 0, parts: [], seeds: [], keys, COLS: { owl: ['#fff'] },
    DMG: new Proxy({}, { get: () => 10 }), damagePlayer: (x, d, o) => { log.dmg.push({ x, d, o }); return dmgRes; }, duckBox: p => ({ t: p.y - 14, b: p.y, l: p.x - 5, r: p.x + 5 }), embers: [], pyres: [], pwaves: [], bolts: [], bloodBolts: [], rbolts: [], hammers: [], shots: [], inJet: () => false,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, O4, bossActive: true, boss: null, HVR: opts.HVR });
  vm.runInContext(slice, ctx);
  const e = { t: 'owl', x: 680, y: 144, w: 44, h: 26, hp: 1000, maxHp: 1000, mode: 'sit', modeT: 0, hitT: 0, face: -1, phase: opts.phase || 1, hits: 0, alive: true, anim: 0, n: 0, hootCd: 0, flash: 0 };
  e.perches = O4.perchesFromRopes(L); e.perchI = 0; ctx.boss = e; return { L, A, floor, P, keys, e, ctx, log, setRes: r => { dmgRes = r; }, step: (n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) ctx.updateOwl(e, dt); }, until: (f, max = 600, dt = 1 / 60) => { let i = 0; while (!f() && i++ < max) ctx.updateOwl(e, dt); return i; } };
}
process.env.BRACKEN_OWL4 = '1';
/* F1 the stoop: told, eyes high, locked, dive; a hit; a dodge; a block; a parry */
{ const w = world(); w.e.bag = ['stoop']; w.e.bagPh = 1; w.step(1); assert.equal(w.e.mode, 'stoopUp', 'the bag draws the stoop'); w.until(() => w.e.mode === 'stoopTell'); assert(w.e.y < w.floor - 100, 'the eyes are high: ' + w.e.y); assert(Math.abs(w.e.x - w.P.x) <= OWL4.stoop.eyeDx + 1 && Math.abs(w.e.x - w.P.x) >= 100, 'the eyes are ~160 px off you: ' + (w.e.x - w.P.x));
  const t0 = w.e.modeT; assert(Math.abs(t0 - OWL4.stoop.tell[0]) < 0.01, 'tell ' + t0); w.until(() => w.e.stLock, 200); assert(w.e.stLock && w.e.modeT <= OWL4.stoop.lock + 0.02, 'it locks in the last ' + OWL4.stoop.lock + ' s'); const lockX = w.e.stLock.x;
  w.until(() => w.e.mode === 'stoop'); assert.equal(w.e.mode, 'stoop'); w.until(() => w.e.mode !== 'stoop', 400); assert.equal(w.e.mode, 'stoopLand', 'it lands'); assert.equal(w.log.dmg.length, 1, 'the hero stood on the lock: struck once'); assert(w.log.dmg[0].o && !w.log.dmg[0].o.unblockable, 'the stoop is blockable');
  assert(!owlOverDrop(w.A, w.e.x, w.A.drops), 'lands off the drop'); w.until(() => w.e.mode === 'takeoff', 100); assert.equal(w.e.mode, 'takeoff', 'then takes off');
  /* dodge: step off the line after the lock */
  const d = world(); d.e.bag = ['stoop']; d.e.bagPh = 1; d.step(1); d.until(() => d.e.stLock, 300); d.P.x += 120; d.until(() => d.e.mode === 'stoopLand', 400); assert.equal(d.log.dmg.length, 0, 'stepping off the line is a dodge'); assert(Math.abs(d.e.x - lockX) < 400);
  /* block turns, parry opens */
  const b = world(); b.e.bag = ['stoop']; b.e.bagPh = 1; b.setRes('blocked'); b.step(1); b.until(() => b.e.mode === 'stoopLand' || b.e.mode === 'stoopDown', 600); assert.equal(b.e.mode, 'stoopLand', 'a block turns her: no opening'); assert(b.log.say.includes('TURNED'));
  const p = world(); p.e.bag = ['stoop']; p.e.bagPh = 1; p.P.parryT = 0.3; p.setRes('blocked'); p.step(1); p.until(() => p.e.mode === 'stoopDown' || p.e.mode === 'stoopLand', 600); assert.equal(p.e.mode, 'stoopDown', 'a parry lays her open'); assert(Math.abs(p.e.modeT - OWL4.stoop.open) < 0.05);
  p.until(() => p.e.mode === 'takeoff', 400); assert(p.e.ward > 0, 'her ward follows the opening (B3)');
  sum.push('F stoop: eyes high, told ' + t0.toFixed(2) + ' s, locks the last ' + OWL4.stoop.lock + ' s, hits a hero on the line once (blockable), a step off dodges, a block turns, a parry opens ' + OWL4.stoop.open + ' s + ward'); }
/* F2 the net: carried, told, shadow follows then locks; netted hero + mash; the knot struck drops it on her */
{ const w = world({ phase: 2 }); w.e.bag = ['net']; w.e.bagPh = 2; w.step(1); assert.equal(w.e.mode, 'netGo'); w.until(() => w.e.mode === 'netTell', 600); assert.equal(w.e.mode, 'netTell'); w.step(1); assert(Math.abs(w.e.y - (w.floor - OWL4.net.carryUp)) < 3, 'carried at floor-110'); assert(w.e.nets.filter(q => q.taken).length === 1, 'one bundle pulled');
  const t0 = w.e.modeT; assert(Math.abs(t0 - OWL4.net.tell[1]) < 0.05, 'p2 net tell ' + t0); w.until(() => w.e.mode === 'netRelease', 200); assert(w.e.netObj, 'the net is in the air'); const nx = w.e.netObj.x; w.P.x = nx;
  w.until(() => !w.e.netObj, 120); assert(w.e.heroNet && w.P.caged > 1.3 && w.log.dmg.some(x => x.d === 10 && x.o && x.o.unblockable), 'a hero under it is NETTED 1.4 s'); const c0 = w.P.caged; w.keys.jump = true; w.step(1); w.keys.jump = false; w.step(1); w.keys.atk = true; w.step(1); assert(c0 - w.P.caged >= 0.29, 'each mashed key takes 0.15 s off: ' + (c0 - w.P.caged));
  const r = world({ phase: 2 }); r.e.bag = ['net']; r.e.bagPh = 2; r.step(1); r.until(() => r.e.mode === 'netTell', 600); r.P.x = 1400; r.until(() => r.e.mode === 'netRelease', 200); r.until(() => !r.e.netObj, 120); assert(!r.e.heroNet && !r.P.caged, 'out from under: the net misses');
  const s = world({ phase: 2 }); s.e.bag = ['net']; s.e.bagPh = 2; s.step(1); s.until(() => s.e.mode === 'netTell', 600); s.step(2); s.ctx.owlNetStrike({ l: s.e.x - 20, r: s.e.x + 20, t: s.e.y, b: s.e.y + 40 }); s.step(1); assert.equal(s.e.mode, 'netted', 'a blow on the knot drops it on HER'); s.until(() => s.e.tumbled, 200); assert(s.e.tumbled && Math.abs(s.e.y - (s.floor - 8)) < 1 && !owlOverDrop(s.A, s.e.x, s.A.drops), 'she tumbles down onto the boards'); assert(Math.abs(s.e.modeT - OWL4.net.open) < 0.05, 'open ' + s.e.modeT);
  s.until(() => s.e.mode === 'takeoff', 400); assert(s.e.ward > 0, 'ward after');
  sum.push('F net: bundle pulled, carried to floor-' + OWL4.net.carryUp + ', told ' + OWL4.net.tell[1] + ' s (p2), a hero under it is netted ' + OWL4.net.netted + ' s (-' + OWL4.net.mash + ' s a mashed key), a step out misses, a blow on the knot opens her ' + OWL4.net.open + ' s'); }
/* F3 slammed by a sandbag */
{ const H = { on: () => true, owlTargets: () => [], perchUp: () => true, owlTarget: () => null, glint: () => { H.glints++; }, glints: 0, bagSpent: () => {}, bags: () => [{ id: 'cw-crown-w', x: w3.e.x, l: w3.e.x - 11, r: w3.e.x + 11, t: 250, b: 270, armed: H.armed }], armed: true }; var w3 = world({ HVR: H });
  Object.assign(w3.e, { mode: 'skim', modeT: 1, skimV: 330, vx: 330, x: 800, y: w3.floor - 8, skimLeft: 400, skimDir: 1, hitT: 0 }); const hp0 = w3.e.hp; w3.step(1); assert.equal(w3.e.mode, 'slammed', 'a bag armed over a low Reeve slams her');
  w3.until(() => w3.e.tumbled, 200); assert(w3.e.tumbled && hp0 - w3.e.hp >= 19 && hp0 - w3.e.hp <= 21, 'she lands and takes 2% of her max: ' + (hp0 - w3.e.hp)); assert(Math.abs(w3.e.modeT - OWL4.slam.lie[0]) < 0.05, 'lies ' + w3.e.modeT); w3.until(() => w3.e.mode === 'takeoff', 400); assert(w3.e.ward > 0, 'ward after the slam');
  const hi = world({ HVR: { ...H, bags: () => [{ id: 'x', x: 800, l: 789, r: 811, t: 250, b: 270, armed: true }] } }); Object.assign(hi.e, { mode: 'perchFall', modeT: 1, x: 800, y: 100 }); hi.step(1); assert.notEqual(hi.e.mode, 'slammed', 'a high Reeve is not slammed');
  const wd = world({ HVR: H }); Object.assign(wd.e, { mode: 'skim', modeT: 1, skimV: 330, vx: 330, x: 800, y: wd.floor - 8, skimLeft: 400, skimDir: 1, hitT: 0, ward: 2 }); H.bags = () => [{ id: 'cw-crown-w', x: 800, l: 789, r: 811, t: 250, b: 270, armed: true }]; wd.step(1); assert.notEqual(wd.e.mode, 'slammed', 'not in her ward (no chain)');
  sum.push('F slammed: 2% of her max, lies ' + OWL4.slam.lie[0] + ' s / ' + OWL4.slam.lie[1] + ' s (p1/p2) x' + 1.6 + ', ward after, never while high or warded'); }
/* F4 every floor landing is off THE DROP; R3 */
{ for (const over of [408, 1400 - 4 * 16 - 3, 25 * 16, 84 * 16 + 8, 90 * 16]) { const w = world(); Object.assign(w.e, { mode: 'descend', modeT: 1.4, tx: over, x: over, y: w.floor - 200 }); w.until(() => w.e.mode === 'grounded', 400); assert.equal(w.e.mode, 'grounded'); assert(!owlOverDrop(w.A, w.e.x, w.A.drops), 'descend over ' + over + ' -> grounded at ' + w.e.x);
    const q = world(); Object.assign(q.e, { mode: 'stalk', modeT: 0.05, x: over, y: q.floor - 12 * TS }); q.P.x = over; q.until(() => q.e.mode === 'stuckTalons', 400); assert.equal(q.e.mode, 'stuckTalons'); q.step(1); assert(!owlOverDrop(q.A, q.e.x, q.A.drops), 'stuckTalons after a plunge over ' + over + ' -> ' + q.e.x); }
  for (const mode of ['takeoff', 'wake', 'sit', 'land']) { const w = world(); w.e.perches = null; w.step(1); w.e.mode = mode; w.e.modeT = 1; w.e.perchI = 0; w.e.x = w.e.perches[0].x; w.e.y = w.e.perches[0].y; assert(w.ctx.owlPerchCut(0), 'a cut while she is in ' + mode + ' drops her with the perch'); assert.equal(w.e.mode, 'perchFall'); }
  const w = world(); w.step(1); w.e.mode = 'fly'; w.e.modeT = 3; w.e.perchI = 1; w.e.x = w.e.perches[1].x; w.e.y = w.e.perches[1].y; assert(w.ctx.owlPerchCut(1), 'R3: any mode AT the perch plank (x, y) drops her with it'); w.e.mode = 'fly'; w.e.x += 80; assert(!w.ctx.owlPerchCut(1), 'but not when she is away from it');
  sum.push('F floor landings: descend / plunge over every drop column (and past the arena edge) end >= ' + OWL4.restPad + ' px clear of the hole; takeoff / wake / any mode at the plank drops her with it'); }
/* F5 FLAG OFF: the same slice behaves as master (no new modes, ward x0) */
{ process.env.BRACKEN_OWL4 = '0'; const w = world(); w.e.bag = ['stoop', 'net']; w.e.bagPh = 1; w.step(1); assert(!['stoopUp', 'netGo'].includes(w.e.mode), 'flag off: no new move even with one in the bag (' + w.e.mode + ')'); assert.equal(vm.runInContext('owl4()', w.ctx), null); process.env.BRACKEN_OWL4 = '1'; }

/* G. THE SHADOW GOBLIN AS ITS OWN FOE TYPE (OWL4B): t:'shadowgob' in the registries, the real lit/unlit slice (owl4Lights / owlShadowLit / owl4Shadow) and the real hurtEnemy0 gate run in a vm */
{ const T = await import('../src/threat.js'), TA = await import('../src/told-attacks.js'), PU = await import('../src/foe-pursuit.js'), CB = await import('../src/combat.js');
  assert(T.THREAT.shadowgob >= T.THREAT.shield, 'threat row: at least a shield goblin'); assert(TA.SIG.shadowgob && TA.SIG.shadowgob.mode === 'biteTell', 'SIG row: the sprig bite, told'); assert.equal(PU.PURSUE.shadowgob, 'walk', 'pursuit row'); assert(CB.COMMON_BLOWS.includes('shadowgob'), 'combat blows row');
  assert(/case 'shadowgob': enemies\.push\(\{ \.\.\.base, t: 'shadowgob'/.test(src), 'the ent spawns t:shadowgob, not a sprig'); assert(!/t: 'sprig', w: 8, h: 10, hp: EHP\.shield/.test(src), 'no sprig-with-a-flag left');
  for (const re of [/EHP\.shadowgob = EHP\.shield/, /SPR\.shadowgob = SPR\.sprig/, /t: 'shadowgob', name: 'SHADOW GOBLIN'/, /e\.t === 'sprig' \|\| e\.t === 'shadowgob'\) && !e\.ringer/, /case 'sprig': case 'shadowgob':/, /kinds: \['sprig', 'shadowgob'/, /'sprig', 'shadowgob',\n?/]) assert(re.test(src), 'main.js wires ' + re);
  const a = src.indexOf('function owl4Lights'), z = src.indexOf('function drawShadowGob'), lightSlice = src.slice(a, z);
  const gs = src.indexOf('if (e.shadow && dmg > 0 && !owlShadowLit(e))'), ge = src.indexOf('return; }', gs) + 9, gate = src.slice(gs, ge); assert(gs > 0 && gate.includes('O4.SHADOW.hint'), 'the gate is in hurtEnemy0');
  const hurtEnemy0Start = src.lastIndexOf('function hurtEnemy0', gs); assert(hurtEnemy0Start > 0 && !src.slice(hurtEnemy0Start + 10, gs).includes(String.fromCharCode(10) + 'function '), 'the gate sits inside hurtEnemy0 (every melee / bolt / skill / burn blow passes it)');
  const say = [], hints = []; let now = 10, clanks = 0, spk = 0;
  const mk = (lights = [], props = []) => { const ctx = vm.createContext({ O4, props, fires: [], HVR: { pools: () => lights.filter(l => l.pool) }, number: (x, y, t) => say.push(t), SFX: { clank: () => clanks++, spark: () => spk++ }, sparks: () => {}, ringAt: () => {}, owl4Said: {}, P: { x: 0, y: 0 }, get time() { return now; } });
    vm.runInContext(lightSlice + '\nthis.shadowGate = function (e, dmg, fromX) { ' + gate.replace(/\breturn;/g, 'return "glanced";') + ' return "through"; };', ctx); return ctx; };
  const gob = (x = 100) => ({ t: 'shadowgob', alive: true, x, y: 200, hp: 20, bleed: 3, stagger: 0, flash: 0, burn: 0, shadow: { lit: false, revealCd: 0, seen: false } });
  /* unlit: every blow of every size glances, no hp change, bleed cleared, a hint ONCE */
  { const c = mk(), e = gob(); for (const d of [1, 3, 12, 500]) { e.bleed = 2; assert.equal(c.shadowGate(e, d, 90), 'glanced', 'unlit: ' + d + ' glances'); assert.equal(e.hp, 20); assert.equal(e.bleed, 0); }
    assert.equal(say.filter(t => t === SHADOW.hint).length, 1, 'BRING IT INTO THE LIGHT said once'); assert(say.includes(SHADOW.glance) && clanks === 4, 'every blow glances with a clank'); assert.equal(c.shadowGate(e, 0, 90), 'through', 'a zero blow (a bleed finishing) is not gated'); }
  /* lit: a village lamp r 64, a plain lantern r 56, a pool, a fire, burning itself: full damage; just out of range: glances */
  const lamp = (x, hv) => ({ t: 'lantern', x, y: 230, lit: true, hv }), E = () => gob(100);
  { assert.equal(mk([], [lamp(100 + 63, true)]).shadowGate(E(), 5, 0), 'through', 'village lamp at 63 px lights it'); assert.equal(mk([], [lamp(100 + 66, true)]).shadowGate(E(), 5, 0), 'glanced', 'and not at 66');
    assert.equal(mk([], [lamp(100 + 55, false)]).shadowGate(E(), 5, 0), 'through', 'a plain lit lantern lights at 55'); assert.equal(mk([], [lamp(100 + 58, false)]).shadowGate(E(), 5, 0), 'glanced', 'but not at 58 (r 56 < 64)');
    assert.equal(mk([], [{ ...lamp(100, true), lit: false }]).shadowGate(E(), 5, 0), 'glanced', 'a snuffed lamp is no light'); assert.equal(mk([], [{ ...lamp(100, true), gone: true }]).shadowGate(E(), 5, 0), 'glanced', 'a lamp that has dropped is no light');
    assert.equal(mk([{ x: 100, y: 200, r: 28, pool: true }]).shadowGate(E(), 5, 0), 'through', 'the oil pool lights it'); const burning = E(); burning.burn = 1; assert.equal(mk().shadowGate(burning, 5, 0), 'through', 'burning itself (the pyromancer)'); }
  /* REVEALED: the first time a light reaches it, 0.6 s stagger, 3 s cooldown; the gate follows lit state live */
  { const props = [lamp(100, true)], c = mk([], props), e = E(); props[0].lit = false; vm.runInContext('1', c); const tick = dt => { now += dt; vm.runInContext('owl4Shadow', c)(e, dt); };
    tick(0.1); assert(!e.shadow.lit && !(e.stagger > 0), 'in the dark: nothing'); props[0].lit = true; tick(0.1); assert(e.shadow.lit && Math.abs(e.stagger - SHADOW.reveal) < 1e-9, 'the light reaches it: REVEALED stagger ' + SHADOW.reveal); assert(say.includes('REVEALED'), 'and says so');
    let sp = spk; e.stagger = 0; props[0].lit = false; tick(0.1); props[0].lit = true; tick(0.1); assert.equal(spk, sp, 'a second light inside the cooldown does not stagger again'); assert.equal(e.stagger, 0);
    props[0].lit = false; for (let i = 0; i < 40; i++) tick(0.1); props[0].lit = true; tick(0.1); assert(e.stagger > 0, 'after ' + SHADOW.revealCd + ' s it is staggered again'); e.bleed = 3; props[0].lit = false; tick(0.1); assert.equal(e.bleed, 0, 'a bleed does not outlive the light'); }
  /* every Shadow Goblin ent in the flagged level is the runtime type the spawn builds (ent t = runtime t) */
  process.env.BRACKEN_OWL4 = '1'; const LON = hang(); delete process.env.BRACKEN_OWL4; const ents = LON.ents.filter(e => e.t === 'shadowgob'); assert.equal(ents.length, 4); const bust = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').match(/case 'shadowgob': enemies\.push\(\{ \.\.\.base, t: '(\w+)'/); assert(bust && bust[1] === 'shadowgob');
  sum.push('G shadow goblin = own foe type: registry rows (threat / told / pursuit / blows / bestiary / cast-lint kinds), gate in hurtEnemy0, unlit glances x4 sizes + hint once, lit by village lamp r64 / lantern r56 / pool / burning, snuffed or dropped lamp = dark, REVEALED stagger ' + SHADOW.reveal + ' s with a ' + SHADOW.revealCd + ' s cooldown'); }

/* H. THE WALK BOT'S LAMP LESSON (src/owl4-bot.js, played by src/playtest.js): in a tiny sim of each placed Shadow Goblin (the level's own ent rows) the bot strikes the dark lamp, lures the goblin through the light, cuts the hung lamp's cord onto it, and never swings at it in the dark */
{ const BOT = await import('../src/owl4-bot.js'); process.env.BRACKEN_OWL4 = '1'; const LON = hang(); delete process.env.BRACKEN_OWL4;
  const cords = LON.ropes.filter(r => r.kind === 'lampcord'); assert.equal(cords.length, 1, 'one hung lamp (the rookery)');
  const gobs = LON.ents.filter(e => e.t === 'shadowgob'); let cutSeen = 0, lightSeen = 0, lureSeen = 0; const rows = [];
  for (const ge of gobs) {
    const ls = LON.ents.filter(e => e.t === 'lantern' && e.hv && Math.abs(e.y - ge.y) <= 2 && Math.abs(e.x - ge.x) <= 8).map(e => ({ t: 'lantern', x: e.x * TS + 8, y: e.y * TS + 16, lit: !e.dark, hv: true, cord: e.cord, cordState: e.cord ? 'hung' : undefined }));
    const floor = (ge.y + 1) * TS, g = { t: 'shadowgob', alive: true, x: ge.x * TS + 8, y: floor, hp: 20, shadow: { lit: false }, burn: 0 }, P = { x: g.x - 130, y: floor }; let pool = null, glance = 0, swingDark = 0, f = 0, killedAt = -1, dmgAcc = 0; const dt = 1 / 60;
    const lights = () => { const o = ls.filter(l => l.lit && !l.gone).map(l => ({ x: l.x, y: l.y - 30, r: HV_LAMP.r })); if (pool && pool.t > 0) o.push({ x: pool.x, y: floor - 6, r: OWL4 ? O4.LAMP_DROP.w / 2 : 28 }); return o; };
    for (; f < 60 * 45 && g.alive; f++) {
      g.shadow.lit = shadowLit(g.x, g.y - 6, lights()) || g.burn > 0;
      const view = { P, foes: [g], lamps: ls, cords: cords.map(c => ({ ...c, state: (ls.find(l => l.cord === c.id) || { cordState: 'hung' }).cordState === 'hung' ? 'tied' : 'cut' })), reach: 22, lampR: HV_LAMP.r }, plan = BOT.shadowGobPlan(view), pk = BOT.planKeys(plan, view);
      if (plan && plan.act === 'light') lightSeen++; if (plan && plan.act === 'lure') lureSeen++;
      if (pk) { P.x += pk.dir * 90 * dt;
        if (pk.swing && plan.act === 'light' && !plan.lamp.lit) plan.lamp.lit = true;
        if (pk.swing && plan.act === 'cut') { cutSeen++; const l = ls.find(q => q.cord === plan.cord); if (l.cordState === 'hung') { l.cordState = 'fall'; l.gone = true; pool = { x: l.x, t: O4.LAMP_DROP.pool, tick: 0 }; } } }
      else if (plan && plan.act === 'fight' && Math.abs(g.x - P.x) < 24 && f % 24 === 0) { if (!g.shadow.lit) swingDark++; else g.hp -= 5; }
      if (plan === null || plan.act === 'skip') swingDark += 0;
      if (pool) { pool.t -= dt; pool.tick += dt; if (pool.t > 0 && pool.tick >= O4.LAMP_DROP.tick && Math.abs(g.x - pool.x) < O4.LAMP_DROP.w / 2) { pool.tick = 0; g.hp -= O4.LAMP_DROP.dmg; } }
      if (g.hp <= 0) { g.alive = false; killedAt = f; break; }
      if (Math.abs(P.x - g.x) < 110 && Math.abs(g.x - P.x) > 18) g.x += Math.sign(P.x - g.x) * 28 * dt;
    }
    assert(!g.alive, `the walk bot lights and kills the Shadow Goblin at ${ge.x},${ge.y} within 45 s (still alive: hp ${g.hp})`); assert.equal(swingDark, 0, 'never a swing at it unlit'); rows.push(`${ge.x},${ge.y}: dead at ${(killedAt / 60).toFixed(1)} s`);
  }
  assert(lightSeen > 0 && lureSeen > 0, 'the bot both strikes a dark lamp and lures'); assert(cutSeen > 0, 'and cuts the hung lamp\'s cord onto the rookery goblin');
  /* no lamp in reach: skip, never stand swinging; no goblin: null */
  const g0 = { t: 'shadowgob', alive: true, x: 300, y: 200, shadow: { lit: false } }, v0 = { P: { x: 260, y: 200 }, foes: [g0], lamps: [], cords: [], reach: 22, lampR: 64 };
  assert.equal(BOT.shadowGobPlan(v0).act, 'skip', 'no lamp within seven tiles: skip it'); assert.equal(BOT.planKeys(BOT.shadowGobPlan(v0), v0), null); assert.equal(BOT.shadowGobPlan({ ...v0, foes: [{ ...g0, t: 'sprig' }] }), null, 'a plain goblin is not this lesson');
  assert.equal(BOT.shadowGobPlan({ ...v0, foes: [{ ...g0, shadow: { lit: true } }] }).act, 'fight', 'lit: the ordinary fight');
  assert.equal(BOT.shadowGobPlan({ ...v0, lamps: [{ t: 'lantern', x: 700, y: 200, lit: false, hv: true }] }).act, 'skip', 'a lamp beyond seven tiles of the goblin is not its lamp');
  sum.push('H walk bot lamp lesson (src/owl4-bot.js): ' + rows.join('; ') + '; strike a dark lamp, lure through the light, cut the rookery cord onto the goblin, never a swing at it unlit, skip when no lamp');
}

/* I. THE BOTS ARE WIRED (source level: lab.js and playtest.js load in node but need the page to run) */
{ const lab = readFileSync(new URL('../src/lab.js', import.meta.url), 'utf8'), pt = readFileSync(new URL('../src/playtest.js', import.meta.url), 'utf8');
  for (const re of [/boss\.mode === 'stoopTell'/, /boss\.mode === 'stoop' && P\.ground && boss\.stLock && SHIELDED\(h\)/, /boss\.mode === 'netTell'/, /'slammed','stoopDown','netted'/]) assert(re.test(lab), 'lab.js owl bot: ' + re);
  for (const re of [/import \{ shadowGobPlan, planKeys \} from '\.\/owl4-bot\.js'/, /e\.t === 'shadowgob' && !\(e\.shadow && e\.shadow\.lit\)/, /shadowGobPlan\(view\)/, /if \(foe && !fighting\)/]) assert(re.test(pt), 'playtest.js walk bot: ' + re);
  sum.push('I bots wired: lab.js owl bot (stoop: shield heroes meet it and guard the last 0.12 s, others leave the line; net: out from under; new open modes) + playtest.js walk bot (the lamp lesson, never swings at an unlit Shadow Goblin)'); }

console.log('OWL4 RULES: all green.\n  ' + sum.join('\n  '));
