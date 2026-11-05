// tools/demon-king.mjs - THE DEMON KING's SKY FIGHT, proved in node (lane S2 DEMONKING; src/demon-king.js + src/reflect-kit.js). No browser, ~2 s.
//   node tools/demon-king.mjs [--v] [--lab] [--n=12] [--act=3.0] [--tier=2.6] [--lv=40] [--flasks=3] [--hero=knight,...]
// What it holds:
//   THE KIT TABLE   all 12 heroes (the 9 live + Rimebinder + Demon Hunter + the Desert Priest) have a row: normal verbs, a power (on-the-beat) answer,
//                   a block; classify(): any blow/shot = normal, parried on the beat = power, held guard = block, a tick/thrall = nothing.
//   THE RULE        a return = 1 pip, a power return = 2 pips (never batted), every 3rd pip a KNOCKDOWN onto the back (between you and the neck),
//                   DOWNED x1.5 then a told REPULSE + 2 s ward; no bank while he is down (S1 holdBank).
//   B15             x0.4 in every other mode (never lower), returns whole, never past a phase line, never hp 0 (BEATEN, not killed).
//   PHASES          P1 bolt+swoop only; P2 adds feint/double/whip/rally 40%/high arcs; P3 adds imps (cap 2) + lava bombs, rally 70%.
//   B16             every told move has its own windup pose, release pose and sounds.
//   THE DUEL        a reading bot wins the shape; a MASH bot (never parries, eats feints, never ducks/jumps) does worse and never power-returns.
//   main.js         the hooks are present once (when the hands are wired).
import { readFileSync, existsSync } from 'node:fs';
import * as SK from '../src/sky-mount.js';
import * as DKM from '../src/demon-king.js';
import * as RK from '../src/reflect-kit.js';
import { HERO_IDS } from '../src/hero-roster.js';
import { PARRY_LOOK } from '../src/riposte.js';
import { growthAt } from '../src/progression.js';
import { mulberry } from '../src/px.js';
import { FLASK, flaskHeal } from '../src/survival.js';

const arg = (k, d) => { const a = process.argv.find(s => s.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const V = process.argv.includes('--v'), LAB = process.argv.includes('--lab');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) { pass++; if (V) console.log('  ok  ' + m); } else { fail++; fails.push(m); console.log('  FAIL ' + m); } };
const DT = 1 / 60, { DK } = DKM;
const CFG = { x0: 224, y: 240, len: 192, phase: 1 };
const mkBack = (seed = 3, phase = 1) => SK.newBack({ ...CFG, phase }, SK.seeded(seed));
const mk = (seed = 5, o = {}) => { const b = mkBack(seed, o.phase || 1); const f = DKM.newFight(b, { rnd: SK.seeded(seed + 11), ...o }); return { b, f }; };
const hero = (b, x, o = {}) => ({ x, y: SK.surfaceY(b, x), h: 14, duck: false, down: 0, dead: false, ...o });
const settle = (f, b, hs, maxT = 4) => { for (let t = 0; t < maxT && f.mode === 'enter'; t += DT) { SK.stepBack(b, DT); DKM.stepKing(f, DT, { heroes: hs }); } };
const run = (f, b, hs, T, w = {}, each) => { const all = []; for (let t = 0; t < T; t += DT) { SK.stepBack(b, DT, { phase: f.ph }); const ev = DKM.stepKing(f, DT, { heroes: hs, ...w }); all.push(...ev); if (each) each(ev, t); } return all; };

/* ================= THE KIT TABLE ================= */
const TWELVE = [...HERO_IDS, 'rimebinder', 'demonhunter', 'sunpriest'];
ok(TWELVE.length === 12 && new Set(TWELVE).size === 12, 'twelve heroes: the 9 live + rimebinder + demonhunter + sunpriest (the Desert Priest)');
for (const id of TWELVE) {
  const K = RK.REFLECT_KIT[id];
  ok(!!K, `${id}: has a reflect row`); if (!K) continue;
  ok(Array.isArray(K.normal) && K.normal.length >= 1, `${id}: at least one verb that returns a bolt (${K.normal.join(' / ')})`);
  ok(!!(K.power && K.power.look && K.power.input && K.power.via === 'parry'), `${id}: a POWER return = its guard on the beat (${K.power && K.power.look})`);
  ok(typeof K.block === 'string', `${id}: says what a held guard does`);
  ok(RK.classify(id, { via: 'blow', tag: 'light' }) === 'normal' && RK.classify(id, { via: 'shot', tag: 'shot' }) !== null && RK.classify(id, { via: 'blow', tag: 'heavy' }) !== null, `${id}: any blow or shot returns a bolt`);
  ok(RK.classify(id, { via: 'body', result: 'blocked', parried: true }) === 'power', `${id}: parried on the beat = POWER`);
  ok(RK.classify(id, { via: 'body', result: 'blocked', parried: false }) === 'block', `${id}: a held guard off the beat = BLOCK (pops, no pip)`);
  ok(RK.classify(id, { via: 'body', result: 'hit' }) === 'hit' && RK.classify(id, { via: 'body', result: false }) === 'miss', `${id}: a body hit = hit; i-frames/duck = miss (flies on)`);
  ok(RK.classify(id, { via: 'blow', tag: 'burn' }) === null && RK.classify(id, { via: 'blow', tag: 'bleed' }) === null, `${id}: a burn/bleed tick is not a return`);
}
for (const id of HERO_IDS) ok(!!PARRY_LOOK[id], `${id}: the live hero has a src/riposte.js parry look (the power return reads RP.parried)`);
ok(RK.classify('rimebinder', { via: 'blow', tag: 'light', who: 'thrall' }) === null, 'rimebinder: her thralls do not return bolts');
ok(RK.classify('reaper', { via: 'blow', tag: 'heavy', tier: 3 }) === 'power' && RK.classify('reaper', { via: 'blow', tag: 'heavy', tier: 1 }) === 'normal' && RK.classify('reaper', { via: 'blow', tag: 'heavy' }) === 'normal', 'blood knight: a tier-2+ heavy is a second power verb; untiered falls back to normal (never a free power)');
ok(RK.classify('ranger', { via: 'shot', tag: 'shot', steady: true }) === 'power' && RK.classify('ranger', { via: 'shot', tag: 'shot' }) === 'normal', 'ranger: a steady shot through it is power; a plain arrow normal');
ok(RK.classify('newhero', { via: 'blow', tag: 'light' }) === 'normal' && RK.kitOf('newhero') === RK.DEFAULT_KIT, 'a future hero inherits the default row');
ok(/FLARE/.test(RK.REFLECT_KIT.sunpriest.power.look) && /sun-priest/.test(RK.REFLECT_KIT.sunpriest.notes), 'the Desert Priest: his beat answer is THE FLARE (tap C is consecrate, not a guard)');

/* ================= B16: every told move ================= */
for (const [m, T] of Object.entries(DKM.TOLD)) {
  const a = DKM.POSE[T.tell], z = DKM.POSE[T.release];
  ok(!!a && !!z && JSON.stringify(a) !== JSON.stringify(z), `B16 ${m}: windup pose (${T.tell}) != release pose (${T.release})`);
  ok(T.sTell && T.sRel && T.sTell !== T.sRel, `B16 ${m}: its own tell sound and release sound (${T.sTell} / ${T.sRel})`);
  ok(T.mark === '!' || T.mark === '!!', `${m}: marked ${T.mark}`);
}
ok(new Set(Object.values(DKM.TOLD).map(t => t.sTell)).size === Object.keys(DKM.TOLD).length, 'every tell sounds different');
ok(DK.bolt.tell.every(t => t >= 0.5) && DK.swoop.tell >= 0.8 && DK.whip.tell >= 0.8 && DK.knock.repulse >= 0.5 && DK.rally.tell >= 0.25, 'every tell is long enough to read (bolt >= 0.5, swoop/whip >= 0.8, repulse 0.6, rally 0.25)');

/* ================= B15 + THE PHASE LINES ================= */
{ const { f } = mk(); const modes = Object.keys(DKM.POSE);
  for (const m of modes) { f.mode = m; f.hp = 3600; f.ph = 1; const d = DKM.take(f, 100, 'light'); if (m === 'beaten') ok(d === 0, 'beaten: the fight is over (the scene)'); else ok(d >= 40, `B15 floor in ${m}: a 100 blow lands ${d} (>= 40)`); }
  f.mode = 'downed'; f.hp = 3600; ok(DKM.take(f, 100, 'light') === 150, 'DOWNED: blows x1.5');
  f.mode = 'float'; f.hp = 3600; ok(DKM.take(f, 100, 'reflect') === 100, 'a returned bolt lands whole (tag reflect)');
  f.mode = 'float'; f.hp = DK.bar * 2 + 10; ok(DKM.take(f, 500, 'reflect') === 10 && f.hp === DK.bar * 2, 'never past the phase line (P1 stops at 2 bars)');
  f.ph = 3; f.hp = 50; f.mode = 'downed'; DKM.take(f, 999, 'light'); ok(f.hp === 1, 'P3: never 0 - he is beaten, not killed (hp 1)');
  ok(DKM.floorOf({ ph: 1, bar: 1200 }) === 2400 && DKM.floorOf({ ph: 2, bar: 1200 }) === 1200 && DKM.floorOf({ ph: 3, bar: 1200 }) === 1, 'phase floors 2400 / 1200 / 1');
  const s = mk(5, { scale: 1.65 }).f; ok(s.bar === Math.round(DK.bar * 1.65) && s.hp === 3 * s.bar, 'late-game scale: 3 x 1200 x (1 + 0.25 x tier)'); }

/* ================= THE RETURN RULE: pips, knockdown, landing ================= */
{ const { b, f } = mk(7); const hs = [hero(b, b.x0 + 60)]; settle(f, b, hs);
  ok(f.mode === 'float' && f.y < SK.surfaceY(b, b.cx) - 50, 'he flies in and floats high over the back');
  const fireOne = () => { f.mode = 'boltTell'; f.mT = 0; f.T = 0.01; let bolt = null; for (let i = 0; i < 3 && !bolt; i++) { const ev = DKM.stepKing(f, DT, { heroes: hs }); const e = ev.find(q => q.k === 'bolt'); if (e) bolt = e.bolt; } return bolt; };
  const flyHome = (n = 400) => { const out = []; for (let i = 0; i < n; i++) { SK.stepBack(b, DT); const ev = DKM.stepKing(f, DT, { heroes: hs }); out.push(...ev); if (ev.some(e => e.k === 'returnHit')) break; } return out; };
  let bolt = fireOne(); ok(!!bolt && bolt.st === 'in' && bolt.r === 7, 'a hellbolt flies (r 7)');
  ok(Math.abs(Math.hypot(bolt.vx, bolt.vy) - DK.bolt.v[0]) < 1, 'P1 bolt speed 150');
  ok(DKM.meet(f, bolt, 'normal', 0) && bolt.st === 'ret' && bolt.v === 210, 'a blow meets it: it RETURNS (pale gold, 210 px/s)');
  ok(!DKM.meet(f, bolt, 'normal', 0), 'a return cannot be met again');
  let ev = flyHome(); ok(ev.some(e => e.k === 'returnHit' && !e.power && e.mul === 1.2) && f.pips === 1, 'it homes on him: swordDmg x1.2, ONE pip');
  bolt = fireOne(); DKM.meet(f, bolt, 'power', 0); ok(bolt.st === 'pow' && bolt.v === 320, 'a power return: white-gold, 320 px/s');
  f.mode = 'float'; ev = flyHome(); ok(f.mode === 'tumble' && ev.some(e => e.k === 'knockdown'), '1 + 2 = 3 pips: KNOCKDOWN - he tumbles out of the sky');
  ok(f.pips === 0, 'pips reset at the knockdown');
  ok(b.hold >= DK.knock.tumble + DK.knock.down[0] + DK.knock.repulse - 0.05, 'S1 holdBank covers tumble + downed + repulse (no bank while he is down)');
  const land = ev.find(e => e.k === 'knockdown'); ok(land.x > hs[0].x && land.x < b.x1, `he lands BETWEEN YOU AND THE NECK (hero ${hs[0].x}, him ${Math.round(land.x)})`);
  run(f, b, hs, DK.knock.tumble + 0.05);
  ok(f.mode === 'downed' && Math.abs(f.y - SK.surfaceY(b, f.x)) < 0.01, 'DOWNED on the drake\'s back (on its surface)');
  ok(DKM.readOf(f).open && DKM.mulOf(f) === 1.5, 'the B10 read: open, x1.5');
  let banked = false; run(f, b, hs, DK.knock.down[0] - 0.1, {}, () => { if (b.bank.state !== 'level') banked = true; }); ok(!banked, 'the drake never banks while he is down');
  let rep = []; run(f, b, hs, 0.2 + DK.knock.repulse, {}, e => rep.push(...e)); ok(rep.some(e => e.k === 'tell' && e.move === 'repulse'), 'the REPULSE is told (0.6 s)');
  ok(f.mode === 'rise' && DKM.readOf(f).ward && DKM.mulOf(f) === 0.4, 'then his 2 s ward x0.4 while he flies back up');
  run(f, b, hs, DK.knock.ward + 0.1); ok(f.mode === 'float' || f.mode.endsWith('Tell'), 'and he is back in the air'); }
{ /* the repulse reaches a hero beside him, not one 60 px off */
  const { b, f } = mk(8); f.mode = 'downed'; f.mT = 0; f.T = 0.01; f.x = b.cx; f.y = SK.surfaceY(b, b.cx);
  const hs = [hero(b, b.cx + 20), hero(b, b.cx - 70)]; const ev = run(f, b, hs, 0.7);
  const hits = ev.filter(e => e.k === 'hit' && e.move === 'repulse'); ok(hits.length === 1 && hits[0].hero === 0 && hits[0].dmg === 6, 'REPULSE: 6 to the hero within 44 px, not the one 70 off'); }
{ /* landing: pressed against the neck -> behind you; co-op -> between the two */
  const { b, f } = mk(9); f.mode = 'float'; const [a, z] = SK.walkable(b, 10);
  f.heroes = [hero(b, z)]; f.pips = 2; let bolt = null; f.bolts.push(bolt = { id: 99, x: f.x - 30, y: f.y - 20, vx: 0, vy: 0, r: 7, st: 'in', touched: [], volley: 0, life: 4, g: 0 });
  DKM.meet(f, bolt, 'normal'); const ev = run(f, b, [hero(b, z)], 2); const k = ev.find(e => e.k === 'knockdown');
  ok(k && k.side === 'tail' && k.x < z, 'pressed against the neck: he crashes down behind you');
  const g = mk(10); g.f.mode = 'float'; g.f.pips = 2; const two = [hero(g.b, a + 4), hero(g.b, z - 4)]; g.f.heroes = two;
  const q = { id: 98, x: g.f.x - 30, y: g.f.y - 20, vx: 0, vy: 0, r: 7, st: 'in', touched: [], volley: 0, life: 4, g: 0 }; g.f.bolts.push(q); DKM.meet(g.f, q, 'power');
  const ev2 = run(g.f, g.b, two, 2); const k2 = ev2.find(e => e.k === 'knockdown'); ok(k2 && k2.side === 'between' && k2.x > two[0].x && k2.x < two[1].x, 'co-op: pips shared, he lands between the two of you'); }
{ /* a bolt reaching the body: block pops (no pip), hit pops, miss flies on; a high arc comes DOWN on the head */
  const { b, f } = mk(12); const hs = [hero(b, b.x0 + 50)]; settle(f, b, hs);
  const shoot = high => { f.mode = 'float'; f.rest = 9; const ev = []; f.mode = 'boltTell'; f.mT = 0; f.T = 0.01; let bolt = null, at = null;
    if (high) { const r0 = f.rnd; f.ph = 2; f.rnd = () => 0.01; for (let i = 0; i < 2 && !bolt; i++) { const e = DKM.stepKing(f, DT, { heroes: hs }); bolt = (e.find(q => q.k === 'bolt') || {}).bolt; } f.rnd = r0; }
    else for (let i = 0; i < 2 && !bolt; i++) { const e = DKM.stepKing(f, DT, { heroes: hs }); bolt = (e.find(q => q.k === 'bolt') || {}).bolt; }
    for (let i = 0; i < 400 && !at; i++) { const e = DKM.stepKing(f, DT, { heroes: hs }); at = e.find(q => q.k === 'boltAt'); ev.push(...e); }
    return { bolt, at }; };
  let r = shoot(false); ok(!!r.at, 'a chest bolt reaches a hero who does nothing');
  ok(DKM.resolveBody(f, r.bolt, 'block', 0) && r.bolt.st === 'gone' && f.pips === 0 && f.n.blocks === 1, 'a held guard off the beat: it pops, no pip');
  r = shoot(false); DKM.resolveBody(f, r.bolt, 'miss', 0); ok(r.bolt.st === 'in', 'a roll / i-frames: it flies on');
  r = shoot(false); DKM.resolveBody(f, r.bolt, 'power', 0); ok(r.bolt.st === 'pow', 'parried on the beat at the body: a POWER return');
  r = shoot(true); ok(r.bolt && r.bolt.high && r.at && r.bolt.vy > 0 && r.bolt.y < hs[0].y - 8, `P2 HIGH ARC: it comes down on his head (vy ${Math.round(r.bolt.vy)} > 0, y ${Math.round(hs[0].y - r.bolt.y)} px over the feet)`); }

/* ================= THE RALLY ================= */
function rallyRate(phase, n = 300, power = false) {
  const { b, f } = mk(20 + phase, { phase }); f.mode = 'float'; f.rest = 999; const hs = [hero(b, b.x0 + 40)]; let bats = 0, vmax = 0, speeds = [];
  for (let i = 0; i < n; i++) {
    const q = { id: 1000 + i, x: f.x - 90, y: f.y - 10, vx: 0, vy: 0, r: 7, st: 'in', touched: [], volley: 0, life: 4, g: 0 }; f.bolts = [q]; f.pips = 0; f.mode = 'float'; f.rest = 999;
    DKM.meet(f, q, power ? 'power' : 'normal');
    for (let k = 0; k < 120; k++) { const ev = DKM.stepKing(f, DT, { heroes: hs }); const bt = ev.find(e => e.k === 'bat'); if (bt) { bats++; vmax = Math.max(vmax, bt.bolt.volley); speeds.push(bt.bolt.v);
        /* return the batted bolt again until he stops */ DKM.meet(f, bt.bolt, 'normal'); }
      if (!f.bolts.length) break; f.pips = 0; f.mode = 'float'; }
  }
  return { first: bats, vmax, speeds };
}
{ const p1 = rallyRate(1), p2 = rallyRate(2, 400), p3 = rallyRate(3, 400), pw = rallyRate(3, 200, true);
  ok(p1.first === 0, 'P1: he never bats a return back (rec Q8)');
  ok(pw.first === 0, 'a POWER return is never batted');
  const r2 = p2.first / 400, r3 = p3.first / 400;   /* first-volley rate approx: bats over the opening returns (later volleys add on top) */
  const { b: b2, f: f2 } = mk(31, { phase: 2 }); let first2 = 0; f2.mode = 'float'; f2.rest = 999; const hs2 = [hero(b2, b2.x0 + 40)];
  for (let i = 0; i < 500; i++) { const q = { id: 5000 + i, x: f2.x - 90, y: f2.y - 10, vx: 0, vy: 0, r: 7, st: 'in', touched: [], volley: 0, life: 4, g: 0 }; f2.bolts = [q]; DKM.meet(f2, q, 'normal');
    for (let k = 0; k < 120 && f2.bolts.length; k++) { const ev = DKM.stepKing(f2, DT, { heroes: hs2 }); if (ev.some(e => e.k === 'bat')) { first2++; f2.bolts = []; } f2.pips = 0; f2.mode = 'float'; } }
  const { b: b3, f: f3 } = mk(32, { phase: 3 }); let first3 = 0; f3.mode = 'float'; f3.rest = 999; const hs3 = [hero(b3, b3.x0 + 40)];
  for (let i = 0; i < 500; i++) { const q = { id: 6000 + i, x: f3.x - 90, y: f3.y - 10, vx: 0, vy: 0, r: 7, st: 'in', touched: [], volley: 0, life: 4, g: 0 }; f3.bolts = [q]; DKM.meet(f3, q, 'normal');
    for (let k = 0; k < 120 && f3.bolts.length; k++) { const ev = DKM.stepKing(f3, DT, { heroes: hs3 }); if (ev.some(e => e.k === 'bat')) { first3++; f3.bolts = []; } f3.pips = 0; f3.mode = 'float'; } }
  ok(Math.abs(first2 / 500 - 0.4) < 0.07, `P2 rally ~40% (${Math.round(first2 / 5)}%)`);
  ok(Math.abs(first3 / 500 - 0.7) < 0.07, `P3 rally ~70% (${Math.round(first3 / 5)}%)`);
  ok(p2.vmax <= DK.rally.max && p3.vmax <= DK.rally.max && p3.vmax === DK.rally.max, `at most ${DK.rally.max} volleys a rally (P3 reached ${p3.vmax})`);
  ok(p3.speeds.every(v => [1, 2, 3].some(k => Math.abs(v - DK.bolt.v[2] * (1 + 0.15 * k)) < 0.01)), 'each volley +15% speed');
  void r2; void r3; }

/* ================= PHASES: what he does in each ================= */
function phaseRun(phase, T = 240, imps = 0, seed = 40) {
  const { b, f } = mk(seed + phase, { phase }); const hs = [hero(b, b.x0 + 70)]; const ev = run(f, b, hs, T, { imps }, null);
  /* keep him out of knockdowns/phase lines: nobody returns anything */
  return { f, ev, moves: new Set(f.n.moves), b };
}
{ const p1 = phaseRun(1), p2 = phaseRun(2), p3 = phaseRun(3), p3full = phaseRun(3, 240, 2);
  ok([...p1.moves].every(m => m === 'bolt' || m === 'swoop') && p1.moves.has('bolt') && p1.moves.has('swoop'), `P1 PLAIN BOLTS: bolt + swoop only (${[...p1.moves]})`);
  ok(['feint', 'double', 'whip', 'bolt', 'swoop'].every(m => p2.moves.has(m)) && !p2.moves.has('summon'), `P2 FAKE-OUTS + DOUBLE BOLTS (+ whip): ${[...p2.moves]}`);
  ok(p3.moves.has('summon') && p3.f.n.imps > 0 && p3.f.n.bombs > 0, `P3 IMPS land on the back (${p3.f.n.imps}) + LAVA BOMBS (${p3.f.n.bombs})`);
  ok(p1.f.n.bombs === 0 && p2.f.n.bombs === 0 && p1.f.n.imps === 0 && p2.f.n.imps === 0, 'no bombs, no imps before P3');
  ok(!p3full.moves.has('summon') && p3full.f.n.imps === 0, 'P3 with 2 imps alive: no more summons (cap 2)');
  const hi1 = p1.ev.filter(e => e.k === 'bolt' && e.bolt.high).length, hi2 = p2.ev.filter(e => e.k === 'bolt' && e.bolt.high).length; ok(hi1 === 0 && hi2 > 0, `high arcs from P2 (P1 ${hi1}, P2 ${hi2})`);
  const runs = ms => { let worst = 0, cur = 1; for (let i = 1; i < ms.length; i++) { cur = ms[i] === ms[i - 1] ? cur + 1 : 1; worst = Math.max(worst, cur); } return worst; };
  ok([p1, p2, p3].every(p => runs(p.f.n.moves) <= 2), 'never the same move three times running');
  const sp = p3.ev.filter(e => e.k === 'spawnImp'); ok(sp.every(e => e.x > p3.b.x0 && e.x < p3.b.x1 && Math.abs(e.y - SK.surfaceY(p3.b, e.x)) < 16), 'imps land ON the back (glyph rings on it)');
  ok(p2.f.n.moves.length > 40 && p3.f.n.moves.length > 40, `he keeps up the pressure (P2 ${p2.f.n.moves.length}, P3 ${p3.f.n.moves.length} moves / 240 s)`); }
{ /* the feint: nothing flies during it; the real bolt follows 0.4 s later */
  const { b, f } = mk(50, { phase: 2 }); const hs = [hero(b, b.x0 + 60)]; settle(f, b, hs); f.mode = 'feintTell'; f.mT = 0; f.T = DK.feint.tell; f.bolts = [];
  let firstBolt = null; run(f, b, hs, 1.2, {}, (ev, t) => { if (firstBolt === null && ev.some(e => e.k === 'bolt')) firstBolt = t; });
  ok(firstBolt !== null && Math.abs(firstBolt - (DK.feint.tell + DK.feint.real)) < 0.05, `FEINT: the dim orb flies nowhere; the real one at ${firstBolt && firstBolt.toFixed(2)} s (0.6 + 0.4)`);
  const g = mk(51, { phase: 2 }); settle(g.f, g.b, hs); g.f.mode = 'doubleTell'; g.f.mT = 0; g.f.T = DK.double.tell; const ts = [];
  run(g.f, g.b, hs, 1.6, {}, (ev, t) => { for (const e of ev) if (e.k === 'bolt') ts.push(t); });
  ok(ts.length === 2 && Math.abs(ts[1] - ts[0] - DK.double.gap) < 0.04, `DOUBLE BOLT: two bolts ${ts.length === 2 ? (ts[1] - ts[0]).toFixed(2) : '?'} s apart`); }
{ /* the swoop and the whip: who they catch */
  const t = (move, hsMod, hi) => { const { b, f } = mk(60); const base = hero(b, b.cx); const hs = [Object.assign(base, hsMod(b, base))]; settle(f, b, [hero(b, b.cx)]);
    f.rest = 99; f.mode = 'float'; f.rnd = (() => { const r = SK.seeded(3); return () => r(); })();
    if (move === 'swoop') { f.swoop = { sx: b.x1 + 24, ex: b.x0 - 24, sy: b.y0 - 90, hit: [] }; f.mode = 'swoopTell'; f.mT = 0; f.T = DK.swoop.tell; }
    else { f.whipHi = hi; f.wx = b.cx + 40; f.mode = 'whipTell'; f.mT = 0; f.T = DK.whip.tell; }
    const ev = []; for (let k = 0; k < 120; k++) { ev.push(...DKM.stepKing(f, DT, { heroes: hs })); } return ev.filter(e => e.k === 'hit' && e.move === move); };
  ok(t('swoop', () => ({})).length === 1, 'CLAW SWOOP catches a hero standing on the back');
  ok(t('swoop', () => ({ duck: true })).length === 0, 'CLAW SWOOP: a DUCK goes under it');
  ok(t('swoop', (b, h) => ({ y: h.y - 30 })).length === 0, 'CLAW SWOOP: a JUMP goes over it');
  ok(t('whip', () => ({}), false).length === 1 && t('whip', (b, h) => ({ y: h.y - 12 }), false).length === 0, 'CHAIN WHIP LOW: catches a stander, a JUMP clears it');
  ok(t('whip', () => ({}), true).length === 1 && t('whip', () => ({ duck: true }), true).length === 0, 'CHAIN WHIP HIGH: catches a stander, a DUCK clears it');
  const { f } = mk(61); f.mode = 'swoop'; ok(DKM.kingLow(f) && DKM.mulOf(f) === 0.4, 'swooping low he takes the CHIP (x0.4)'); }

/* ================= THE PHASE CHANGE, THE END ================= */
{ const { b, f } = mk(70); const hs = [hero(b, b.x0 + 60)]; settle(f, b, hs);
  f.mode = 'downed'; f.mT = 0; f.T = 3; DKM.take(f, 5000, 'light'); ok(f.hp === DK.bar * 2, 'P1 bar emptied: held at the line');
  let ev = run(f, b, hs, DK.fall + 0.1); ok(ev.some(e => e.k === 'phaseFall') && ev.some(e => e.k === 'climb' && e.phase === 2) && b.climb, 'his last fall + scream, then THE DRAKE CLIMBS (S1 beginClimb)');
  ok(b.hold > 0, 'no bank during the climb');
  ev = run(f, b, hs, DK.climb + 0.1); ok(f.ph === 2 && f.pips === 0 && ev.some(e => e.k === 'phase' && e.phase === 2), 'phase 2 begins after the climb, pips clean');
  f.ph = 3; f.hp = 30; f.mode = 'downed'; f.mT = 0; f.T = 3; DKM.take(f, 500, 'light');
  ev = run(f, b, hs, 0.5); ok(f.mode === 'beaten' && f.beaten && f.hp === 1 && ev.filter(e => e.k === 'beaten').length === 1, 'P3 emptied: BEATEN (thrown down onto the back - the scene), never killed (hp 1)');
  ev = run(f, b, hs, 2); ok(!ev.some(e => e.k === 'beaten' || e.k === 'bolt' || e.k === 'hit'), 'beaten: once, and nothing more flies'); }

/* ================= THE DUEL (a reading bot vs. a mash bot) ================= */
const KITS = {
  knight: { base: 10, k: 1.0, swing: 0.40, reach: 22, parry: true }, warden: { base: 11, k: 1.0, swing: 0.45, reach: 40, parry: true },
  pyro: { base: 10, k: 0.7, swing: 0.36, reach: 30, parry: true }, paladin: { base: 14, k: 1.0, swing: 0.52, reach: 20, parry: true },
  pirate: { base: 8, k: 1.0, swing: 0.28, reach: 20, parry: true }, reaper: { base: 16, k: 0.95, swing: 0.46, reach: 29, parry: true },
  geomancer: { base: 23, k: 1.0, swing: 0.60, reach: 24, parry: true }, berserker: { base: 12, k: 0.85, swing: 0.30, reach: 18, parry: true },
  ranger: { base: 10, k: 0.9, swing: 0.55, reach: 64, parry: true },
  rimebinder: { base: 10, k: 0.85, swing: 0.45, reach: 34, parry: true, as: 'pyro' }, demonhunter: { base: 12, k: 1.0, swing: 0.32, reach: 22, parry: true, as: 'knight' },
  sunpriest: { base: 10, k: 0.8, swing: 0.45, reach: 30, parry: true, as: 'pyro' },
};
const ACT = +arg('act', 3.0), TIER = +arg('tier', 2.6), LV = +arg('lv', 40), FLASKS = +arg('flasks', 3), LIMIT = 360;
/* bot skill: pRet = a bolt in reach met with a blow; pPar = met on the beat (power); pAvoid = a swoop/whip/bomb read; react = s late on a tell */
const BOT = { read: { pRet: 0.85, pPar: 0.35, pAvoid: 0.8 }, mash: { pRet: 0.55, pPar: 0, pAvoid: 0 } };
function duel(kit, seed, kind = 'read') {
  const K = KITS[kit], gr = growthAt(K.as || kit, LV), sword = Math.round((K.base + 12 + gr.damage) * K.k), B = BOT[kind], rng = mulberry(seed);
  const b = SK.newBack({ ...CFG }, rng), f = DKM.newFight(b, { rnd: rng, scale: 1 + 0.25 * TIER });
  const [a, z] = SK.walkable(b, 10);
  const H = { x: SK.spawnSlots(b, 1)[0], y: 0, vy: 0, ground: true, duck: false, down: 0, hp: gr.hp, maxHp: gr.hp, flasks: FLASKS, drink: 0, ifr: 0, cd: 0 };
  H.y = SK.surfaceY(b, H.x);
  const decided = new Map(), avoid = new Map(); let imps = [], taken = 0; const by = {};
  const hurt = (d, name) => { if (H.ifr > 0) return false; const dmg = Math.round(d * ACT); H.hp -= dmg; taken += dmg; by[name] = (by[name] || 0) + dmg; H.ifr = 0.8; H.down = 0.5; H.drink = 0; return true; };
  for (let t = 0; t < LIMIT; t += DT) {
    SK.stepBack(b, DT, { phase: f.ph });
    const hs = [{ x: H.x, y: H.y, h: 14, duck: H.duck, down: H.down, dead: false }];
    const ev = DKM.stepKing(f, DT, { heroes: hs, imps: imps.length });
    for (const e of ev) {
      if (e.k === 'boltAt') { const d = decided.get(e.bolt.id); if (d === 'power') DKM.resolveBody(f, e.bolt, 'power', 0); else if (H.ifr > 0) DKM.resolveBody(f, e.bolt, 'miss', 0); else { DKM.resolveBody(f, e.bolt, 'hit', 0); hurt(DK.bolt.dmg, 'HELLBOLT'); } }
      else if (e.k === 'hit') hurt(e.dmg, e.name);
      else if (e.k === 'returnHit') DKM.take(f, Math.round(sword * e.mul), DK.returnTag);
      else if (e.k === 'spawnImp') imps.push({ x: e.x, hp: DK.imps.hp, cd: 1.2 });
      else if (e.k === 'clearImps') imps = [];
    }
    if (f.beaten) return { win: true, t, hp: H.hp / H.maxHp, by, f };
    if (H.hp <= 0) { if (process.argv.includes('--why')) console.log('   lost', kit, kind, Math.round(t) + 's', 'ph' + f.ph, 'left ' + Math.round(100 * f.hp / (3 * f.bar)) + '%', JSON.stringify(by), 'knocks ' + f.n.knocks, 'returns ' + f.n.returns + '/' + f.n.bolts, 'bats ' + f.n.bats); return { win: false, t, left: f.hp / (3 * f.bar), by, f }; }
    H.ifr = Math.max(0, H.ifr - DT); H.down = Math.max(0, H.down - DT); H.cd -= DT;
    /* THE FLASK */
    if (H.drink > 0) { H.drink -= DT; if (H.drink <= 0) H.hp = Math.min(H.maxHp, H.hp + flaskHeal(H.maxHp)); }
    else if (H.flasks > 0 && H.hp < H.maxHp * 0.35 && H.ground && H.down <= 0 && !f.mode.endsWith('Tell') && f.mode !== 'swoop' && f.mode !== 'whip') { H.flasks--; H.drink = FLASK.drinkT; }
    const busy = H.drink > 0 || H.down > 0;
    const plan = DKM.dkPlan(f, H, K.reach);
    /* the bolts in reach: decided once each */
    for (const q of f.bolts) { if (q.st !== 'in' || decided.has(q.id)) continue; const d = Math.hypot(q.x - H.x, q.y - (H.y - 8)); if (d > K.reach + q.r) continue;
      const r = rng(); if (busy) { decided.set(q.id, 'none'); continue; }
      if (K.parry && r < B.pPar) decided.set(q.id, 'power');
      else if (r < B.pPar + B.pRet * (1 - B.pPar)) { decided.set(q.id, 'normal'); DKM.meet(f, q, 'normal', 0); H.cd = K.swing; }
      else decided.set(q.id, 'none'); }
    /* the swoop / whip / bomb read: once a move */
    const key = f.n.moves.length + ':' + f.ph + ':' + f.rings.length; if (!avoid.has(key)) avoid.set(key, rng() < B.pAvoid);
    const av = avoid.get(key) && !busy;
    H.duck = av && plan.duck && H.ground;
    if (av && plan.jump && H.ground) { H.vy = -300; H.ground = false; }
    let gx = H.x;
    if (!busy) {
      if (kind === 'mash') gx = f.x;
      else if (plan.stepTo != null && (av || DKM.kingOpen(f))) gx = plan.stepTo;
      else if (imps.length) gx = imps[0].x;
    }
    if (!H.duck && Math.abs(gx - H.x) > 2) H.x += Math.sign(gx - H.x) * Math.min(Math.abs(gx - H.x), 85 * DT);
    H.x = Math.max(a, Math.min(z, H.x));
    H.vy += 900 * DT; H.y += H.vy * DT; const s = SK.surfaceY(b, H.x); if (H.y >= s) { H.y = s; H.vy = 0; H.ground = true; }
    /* blows: the king downed or low in reach, else an imp in reach */
    if (!busy && H.cd <= 0) {
      const inReach = Math.abs(H.x - f.x) < K.reach + 14 && (DKM.kingOpen(f) || (DKM.kingLow(f) && f.y > s - 50) || (kind === 'mash' && f.y > s - 60));
      if (inReach) { DKM.take(f, sword, 'light'); H.cd = K.swing; }
      else { const im = imps.find(q => Math.abs(q.x - H.x) < K.reach + 6); if (im) { im.hp -= sword; H.cd = K.swing; if (im.hp <= 0) imps = imps.filter(q => q !== im); } }
    }
    /* imps: walk at you, claw */
    for (const im of imps) { im.x += Math.sign(H.x - im.x) * Math.min(Math.abs(H.x - im.x), 40 * DT); im.cd -= DT; if (Math.abs(im.x - H.x) < 12 && im.cd <= 0) { im.cd = 1.6; hurt(DK.imps.dmg, 'IMP'); } }
  }
  return { win: false, t: LIMIT, left: f.hp / (3 * f.bar), timeout: true, by, f };
}
{ const N = +arg('n', LAB ? 12 : 4), list = arg('hero', Object.keys(KITS).join(',')).split(',');
  const res = {}; let wins = 0, mw = 0, tot = 0, mashPowers = 0, timeouts = 0, knocks = [], times = [];
  for (const h of list) { res[h] = { w: 0, m: 0, t: [] };
    for (let i = 0; i < N; i++) { const r = duel(h, 1000 + i * 7 + h.length), m = duel(h, 5000 + i * 7 + h.length, 'mash'); tot++;
      if (r.win) { wins++; res[h].w++; res[h].t.push(r.t); times.push(r.t); } if (r.timeout) timeouts++; knocks.push(r.f.n.knocks);
      if (m.win) { mw++; res[h].m++; } mashPowers += m.f.n.powers; } }
  const med = a => { const s = [...a].sort((p, q) => p - q); return s.length ? Math.round(s[s.length >> 1]) : 0; };
  if (LAB || V) { console.log(`\nTHE DEMON KING node duel - bars 3 x ${Math.round(DK.bar * (1 + 0.25 * TIER))} (tier ${TIER}), blows x act ${ACT}, L${LV}, ${FLASKS} flasks, n=${N}`);
    for (const h of list) console.log(`  ${h.padEnd(12)} read ${res[h].w}/${N}  median ${med(res[h].t)} s   mash ${res[h].m}/${N}`);
    console.log(`  pooled: read ${Math.round(100 * wins / tot)}%  mash ${Math.round(100 * mw / tot)}%  median fight ${med(times)} s  knockdowns/fight ${med(knocks)}  timeouts ${timeouts}`); }
  ok(wins / tot >= 0.25, `the READING bot wins a share (the BAND is S5's in bossLab, not this model's) (${Math.round(100 * wins / tot)}% pooled; the 1-D-ish model is a ceiling, S5 tunes the band in bossLab)`);
  ok(mw / tot < wins / tot - 0.25, `a MASH bot does far worse (${Math.round(100 * mw / tot)}% vs ${Math.round(100 * wins / tot)}%)`);
  ok(mashPowers === 0, 'the mash bot never lands a power return');
  ok(med(knocks) >= 6, `knockdowns are the fight (median ${med(knocks)} a fight)`); }
{ /* where the damage comes from: knockdowns + returns are the main damage, chip the minority */
  const r = duel('knight', 4242); const d = r.f.n.dealt, all = Object.values(d).reduce((s, v) => s + v, 0), main = (d.downed || 0) + (d.return || 0);
  ok(all > 0 && main / all >= 0.75, `knockdowns + returns are the main damage (${Math.round(100 * main / all)}% of what landed; chip ${Math.round(100 * (1 - main / all))}%)`); }

/* ================= THE HANDS, end to end with a stand-in main.js ================= */
{ const { makeSkyMountHands } = await import('../src/sky-mount-hands.js'); const { makeDemonKingHands } = await import('../src/demon-king-hands.js');
  const L = { skyMount: { x0: 224, y: 240, len: 192, phase: 1, lab: true } }; let lvl = L; const enemies = [], said = [], snd = [];
  const P = { x: 0, y: 0, w: 10, h: 14, vx: 0, vy: 0, hp: 200, rpLookAt: 0, dead: false }; let cur = P, nextGuard = null, hurtLog = [], spawned = 0;
  const BK = {}, SFX = new Proxy({}, { get: (t, k) => () => snd.push(k) });
  const SKH = makeSkyMountHands({ L: () => lvl, players: () => [P], number: () => {}, sfx: () => {}, solid: 1, bk: () => BK });
  const H = makeDemonKingHands({ L: () => lvl, players: () => [P], P: () => cur, enemies: () => enemies, asPlayer: (p, fn) => { const o = cur; cur = p; try { fn(); } finally { cur = o; } },
    damage: (x, d, o) => { hurtLog.push(o.name); if (nextGuard === 'parry') { cur.rpLookAt += 1; return 'blocked'; } if (nextGuard === 'block') return 'blocked'; cur.hp -= d; return 'hit'; },
    rpStamp: () => cur.rpLookAt, heroId: () => 'knight', swordDmg: () => 45, hurtAs: (t, e, d) => { const dd = H.take(e, d, t); e.hp -= dd; },
    spawnImp: (x, y) => { spawned++; const m = { t: 'imp', x, y, alive: true }; enemies.push(m); return m; }, number: (x, y, t) => said.push(t), sfx: SFX, shake: () => {}, ring: () => {}, burst: () => {}, scale: () => 1, skh: () => SKH, bk: () => BK });
  for (let i = 0; i < 30; i++) { SKH.update(DT); H.update(DT); }
  ok(H.on() && enemies.filter(e => e.t === 'demonking').length === 1 && P.mount, 'on the lab level: the king spawns once, the hero is on the back');
  ok(!!BK.demonKing && typeof BK.demonKing.knock === 'function', 'the lab handles: BK.demonKing');
  const f = H.fight(); f.mode = 'boltTell'; f.mT = 0; f.T = 0.01; let be = null;
  for (let i = 0; i < 5 && !be; i++) { SKH.update(DT); H.update(DT); be = enemies.find(e => e.t === 'hellbolt'); }
  ok(!!be && be.w === 18, 'a hellbolt in flight is an entity in enemies (any blow box / projectile can hit it)');
  const hpS = f.hp; ok(H.owns(be) && H.struck(be, 40, 'light') === true && !f.bolts.some(q => q.st === 'in'), 'a blow on it (hurtEnemy0) RETURNS it - handled, no damage');
  H.update(DT); ok(!enemies.some(e => e.t === 'hellbolt'), 'a returned bolt is no longer an entity (cannot be struck twice)');
  const hp0 = hpS; for (let i = 0; i < 300 && f.hp === hp0; i++) { SKH.update(DT); H.update(DT); if (process.argv.includes('--dbg') && i % 20 === 0) console.log(i, f.mode, f.bolts.map(b => b.st + ' ' + Math.round(b.x) + ',' + Math.round(b.y)).join(' '), Math.round(f.x), Math.round(f.y), f.hp); }
  ok(f.hp < hp0 && hp0 - f.hp === 54 && f.pips === 1, `it lands: swordDmg 45 x1.2 = ${hp0 - f.hp} through hurtAs('reflect') whole, one pip`);
  ok(enemies.find(e => e.t === 'demonking').hp === f.hp, 'his entity\'s hp follows the fight');
  /* a bolt reaching the hero: parried -> power; blocked -> pop; hit -> hurt */
  const reach = guard => { nextGuard = guard; f.mode = 'boltTell'; f.mT = 0; f.T = 0.01; f.bolts = []; hurtLog = []; let q = null;
    for (let i = 0; i < 400; i++) { SKH.update(DT); H.update(DT); q = q || f.bolts.find(b => b.st === 'in'); if (hurtLog.length) break; } return q; };
  let q = reach('parry'); ok(q && q.st === 'pow', 'parried on the beat (RP.parried stamped): a POWER return');
  q = reach('block'); ok(q && q.st === 'gone' && said.includes('BLOCKED'), 'a held guard off the beat: BLOCKED, it pops');
  const hpH = P.hp; q = reach(null); ok(q && q.st === 'gone' && P.hp < hpH && hurtLog[0] === 'HELLBOLT', 'no answer: the HELLBOLT hits (main.js knocks him DOWN on the back)');
  const k = enemies.find(e => e.t === 'demonking'); f.mode = 'float'; ok(H.take(k, 100, 'light') === 40, 'his entity takes x0.4 through take()');
  f.mode = 'downed'; ok(H.take(k, 100, 'light') === 150, '...and x1.5 downed');
  f.ph = 3; f.mode = 'float'; f.rest = 0; f.impCd = 0; f.last = []; f.rnd = (() => { let i = 0; return () => [0.99, 0.5, 0.2, 0.7, 0.4][i++ % 5]; })();
  for (let i = 0; i < 60 * 8 && !spawned; i++) { SKH.update(DT); H.update(DT); f.mode === 'float' && (f.rest = Math.min(f.rest, 0.1)); }
  ok(spawned > 0 && enemies.filter(e => e.dkImp).length === spawned, `P3: imps spawned through the hands (${spawned}), tagged dkImp`);
  lvl = { }; SKH.update(DT); H.update(DT);
  ok(!H.on() && !enemies.some(e => H.owns(e)) && enemies.filter(e => e.dkImp).every(e => !e.alive), 'off the level: the king, his bolts and his imps are gone'); }

/* ================= main.js / level wiring ================= */
const MAIN = existsSync('src/main.js') ? readFileSync('src/main.js', 'utf8') : '';
const once = (re, m) => { const n = (MAIN.match(re) || []).length; ok(n === 1, `${m} (${n}x)`); };
if (MAIN.includes('demon-king-hands')) {
  once(/import \{ makeDemonKingHands \} from '\.\/demon-king-hands\.js'/g, 'main.js imports the hands once');
  once(/DKH = makeDemonKingHands\(/g, 'main.js makes the hands once');
  once(/if \(DKH\) DKH\.update\(wdt\)/g, 'main.js steps the fight once a frame');
  once(/DKH && DKH\.owns\(e\) && DKH\.struck\(e, dmg, tag\)/g, 'hurtEnemy0: a blow on a bolt is a return');
  once(/DKH && DKH\.owns\(e\)\) dmg = DKH\.take\(e, dmg, tag\)/g, 'hurtEnemy0: B15 + the phase line on him, last');
  once(/if \(DKH && DKH\.owns\(e\)\) continue;\s*\/\* \(claude\/demonking\) stepped/g, 'updateEnemies skips his entities (the hands step them)');
  once(/DKH && DKH\.owns\(e\)\) continue;\s*\/\* \(claude\/demonking\) drawn/g, 'drawEnemies skips them (the hands draw them)');
  once(/if \(L\.skyMount && DKH\) DKH\.draw\(g, cx, cy, time\)/g, 'the world pass draws him + the bolts');
  once(/if \(DKH\) DKH\.hud\(g, VW, VH, time\)/g, 'the HUD pass draws his bar + pips');
} else console.log('  (main.js hooks not wired yet - skipped)');

console.log(`\ndemon-king: ${pass} ok, ${fail} failed`);
if (fail) { console.log('FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
