// tools/heart-proof.mjs (claude/heartproof, 11-05) - HEART OF THE MOUNTAIN, PROVED IN THE PAGE. One headless Chrome.
// SKY   per hero (the 9 live): skylab loads, the hero is ON the drake's back; runs both ways, jumps, attacks, dodges, banks (BK.skyMount.bank), gets knocked
//       down: never off the back (mount kept, y near the deck, x inside the walls); an attack hit returns a bolt; a picture.  (The guard POWER return per hero is reflect-probe's.)
// HATCH Berserker: the UP+C axe throw and the STORM hatchets vs a parked bolt.
// COOP  skylab and drakelab with an AI partner: no soft-lock (both seats move, the fight advances), the partner deals with a bolt.
// QUIT  pause > Return to map from each lab: no drake / king / imps left, hero dismounted, no console errors.
//   node tools/heart-proof.mjs [sky|hatch|coop|quit,...] [hero,...]     (PORT=<your port>)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const args = process.argv.slice(2), WANT = (args[0] || 'sky,hatch,coop,quit').split(','), LIVE = ['knight', 'warden', 'pyro', 'pirate', 'paladin', 'geomancer', 'reaper', 'berserker', 'ranger'];
const HEROES = args[1] ? args[1].split(',') : LIVE;
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
const DIR = join(ROOT, 'work', 'claude', 'heartproof'); mkdirSync(DIR, { recursive: true });
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const save = async (name, js = '__hp.snap()') => { const url = await pg.evalp(js); writeFileSync(join(DIR, name + '.png'), Buffer.from(url.split(',')[1], 'base64')); };
try {
  await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const SK = await import('/src/sky-mount.js'); const K = BK.keys;
    const IDX = id => LEVELS.findIndex(l => l.id === id); const hp = window.__hp = { SK, IDX };
    const idle = () => { for (const k in K) K[k] = false; BK.unpress(); }; hp.idle = idle;
    hp.setup = async (lab, h, ally) => { idle(); BK.manualSimulation = true; try { BK.coopEnd(); } catch (e) {} BK.SET.speed = 1; BK.setHero(h); BK.reset({ fresh: true }); try { BKT.setHeroLevel(h, 30); } catch (e) {} try { BK.applyUpgrades(); } catch (e) {}
      if (ally) { await BK.allyReady(); BK.aiComp.arm([ally], ['balanced'], 1); }
      BK.load(IDX(lab)); if (ally) BK.start(); BK.state = 'play'; for (let i = 0; i < 120; i++) BK.sim(1); return true; };
    hp.f = () => BK.demonKing && BK.demonKing.f();
    hp.freeze = () => { const f = hp.f(); if (!f) return null; f.mode = 'hang'; f.mT = 0; f.T = 1e9; f.bolts.length = 0; return f; };
    hp.snap = () => { BK.step(1); const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); return c.toDataURL('image/png'); };
    hp.onBack = (P) => { const b = BK.skyMount.back(); return !!(P.mount && P.mount === b && P.x >= b.x0 - 1 && P.x <= b.x1 + 1 && P.y <= SK.surfaceY(b, P.x) + 6 && P.y >= b.y0 - 140); };
    hp.bolt = (f, dx, dy) => { const P = BK.P, b = { id: ++f.id, x: P.x + P.face * dx, y: P.y + dy, vx: 0, vy: 0, r: 7, st: 'in', high: false, v: 150, volley: 0, life: 99, g: 0, touched: [], tgt: 0 }; f.bolts.push(b); BK.sim(1); b.life = 99; return b; };
    return 1; })()`, 60000);
} catch (e) { console.log('setup failed', e.message); process.exit(1); }

if (WANT.includes('sky')) for (const h of HEROES) {
  console.log('sky ' + h);
  ok(await pg.evalp(`__hp.setup('skylab', ${JSON.stringify(h)})`, 120000), h + ': skylab loads');
  const r = await pg.evalp(`(()=>{ const P = BK.P, K = BK.keys, f = __hp.freeze(), o = { mounted: !!P.mount, off: 0, minX: 1e9, maxX: -1e9, steps: 0, err: null, firstOff: null };
    const chk = () => { o.steps++; if (!__hp.onBack(P)) { o.off++; if (!o.firstOff) o.firstOff = { x: Math.round(P.x), y: Math.round(P.y), m: !!P.mount }; } o.minX = Math.min(o.minX, P.x); o.maxX = Math.max(o.maxX, P.x); };
    const run = (n, fn) => { for (let i = 0; i < n; i++) { if (fn) fn(i); BK.sim(1); chk(); } };
    try {
      K.right = true; run(150); K.right = false; K.left = true; run(300); K.left = false; K.right = true; run(60); K.right = false;
      run(40, i => { K.jump = i < 14; if (i === 0) BK.press('jump'); }); K.jump = false;
      run(30, i => { if (i === 0) BK.press('atk'); }); run(40, i => { K.atk = i < 24; }); K.atk = false;
      run(40, i => { if (i === 0) BK.press('dodge'); }); K.left = true; run(10, i => { if (i === 2) BK.press('dodge'); }); K.left = false;
      K.right = true; run(40, i => { if (i === 0) BK.press('dodge'); }); K.right = false;
      for (const dir of [1, -1]) { BK.skyMount.bank(dir); K.right = dir > 0; K.left = dir < 0; run(520); K.right = K.left = false; run(80); }
      o.knocks = 0; for (const kk of ['', 'right', 'jump']) { if (kk === 'right') K.right = true; if (kk === 'jump') { K.jump = true; BK.press('jump'); } run(8);
        __hp.SK.knockDown(P); o.prone = P.mountDown; o.knocks++; run(10); K.right = K.jump = false; run(80); }
      for (const dir of [1, -1]) { K.left = dir < 0; K.right = dir > 0; run(200); __hp.SK.knockDown(P); run(30); K.left = K.right = false; }
      run(60);
    } catch (e) { o.err = String(e && e.message || e); }
    __hp.idle(); o.mountEnd = !!P.mount; o.hp = P.hp; o.alive = !P.dead; return o; })()`, 300000);
  console.log('   ' + JSON.stringify(r));
  ok(r.mounted && !r.err, h + ': mounted at the load, no exception' + (r.err ? ' ' + r.err : ''));
  ok(r.off === 0, h + ': never off the back over ' + r.steps + ' frames (run, jump, attack, dodge, banks, knock-downs): off ' + r.off + (r.firstOff ? ' first ' + JSON.stringify(r.firstOff) : ''));
  ok(r.maxX - r.minX > 60, h + ': moves along the back (' + Math.round(r.minX) + '..' + Math.round(r.maxX) + ')');
  ok(r.prone > 0 && r.mountEnd && r.alive, h + ': knocked down on the back (prone ' + (+r.prone || 0).toFixed(2) + ' s), still mounted, alive');
  const ret = await pg.evalp(`(()=>{ __hp.setup('skylab', ${JSON.stringify(h)}); const f = __hp.freeze(), P = BK.P, K = BK.keys; let st = null;
    for (const v of ['tap', 'heavy']) { const b = __hp.bolt(f, 22, -8); for (let i = 0; i < 90 && b.st === 'in'; i++) { if (v === 'tap' && i === 0) BK.press('atk'); if (v === 'heavy') K.atk = i < 50; BK.sim(1); } K.atk = false; st = b.st; if (st === 'ret' || st === 'pow') break; for (let i = 0; i < 30; i++) BK.sim(1); }
    return { st, on: __hp.onBack(P) }; })()`, 120000);
  ok(ret.st === 'ret' || ret.st === 'pow', h + ': an attack hit returns the bolt (' + ret.st + '), still on the back ' + ret.on);
  await save('sky-' + h);
}

if (WANT.includes('hatch')) {
  console.log('hatch');
  ok(await pg.evalp(`__hp.setup('skylab','berserker')`, 120000), 'berserker: skylab loads');
  const r = await pg.evalp(`(()=>{ const P = BK.P, K = BK.keys, f = __hp.freeze(), o = {};
    for (const [name, dx, dy] of [['axe30', 30, -10], ['axe60', 60, -10], ['axe90', 90, -10]]) { P.bzAxe = null; P.face = 1; for (let i = 0; i < 40; i++) { P.st = P.maxSt; BK.sim(1); }
      const b = __hp.bolt(f, dx, dy); K.up = true; K.block = true; BK.sim(1); BK.sim(1); K.up = K.block = false; let fr = -1; for (let i = 0; i < 120 && b.st === 'in'; i++) { BK.sim(1); fr = i; }
      o[name] = { st: b.st, fr, axe: !!P.bzAxe }; P.bzAxe = null; b.st = 'gone'; BK.sim(5); }
    for (const [name, dx] of [['storm50', 50], ['storm100', 100]]) { P.hatchets = []; P.face = 1; const b = __hp.bolt(f, dx, -14);
      for (let i = 0; i < 4; i++) P.hatchets.push({ x: P.x + 8, y: P.y - 14, vx: 260 + i * 20, vy: -120 + i * 55, life: 1.1, hit: new Set(), spin: i });
      let fr = -1; for (let i = 0; i < 80 && b.st === 'in'; i++) { BK.sim(1); fr = i; } o[name] = { st: b.st, fr }; P.hatchets = []; b.st = 'gone'; BK.sim(5); }
    return o; })()`, 120000);
  console.log('   ' + JSON.stringify(r));
  const hit = Object.entries(r).filter(([k, v]) => v.st === 'ret' || v.st === 'pow').map(([k]) => k);
  ok(hit.length > 0, 'berserker: a thrown axe / hatchet returns a bolt in some case (' + (hit.join(',') || 'none') + ')');
  await save('berserker-hatchet');
}

if (WANT.includes('coop')) for (const lab of ['skylab', 'drakelab']) {
  console.log('coop ' + lab);
  ok(await pg.evalp(`__hp.setup(${JSON.stringify(lab)}, 'knight', 'warden')`, 120000), lab + ': loads with an AI partner');
  const r = await pg.evalp(`(()=>{ const K = BK.keys, f = __hp.f(), o = { err: null, aiMoved: 0, p1Moved: 0, kingHp0: f && f.hp, returns0: f && f.n && f.n.returns };
    try { const ps = BK.players(), ai = ps.find(p => p.ai), me = BK.P; o.players = ps.length; o.ai = !!ai; let ax = ai.x, mx = me.x; const sky = lab => !!(BK.skyMount && BK.skyMount.back());
      for (let i = 0; i < 60 * 80; i++) {
        K.right = (i % 400) < 200; K.left = !K.right; if (i % 25 === 0) BK.press('atk'); if (i % 170 === 0) { K.jump = true; BK.press('jump'); } else if (i % 170 === 20) K.jump = false;
        BK.sim(1); if (BK.state !== 'play') { o.state = BK.state; break; }
        if (Math.abs(ai.x - ax) > 8) { o.aiMoved++; ax = ai.x; } if (Math.abs(me.x - mx) > 8) { o.p1Moved++; mx = me.x; }
        if (sky()) { if (ai.mount !== me.mount) o.split = (o.split || 0) + 1; if (!__hp.onBack(ai)) o.aiOff = (o.aiOff || 0) + 1; if (!__hp.onBack(me)) o.p1Off = (o.p1Off || 0) + 1; } }
      o.aiDead = !!ai.dead; o.aiHp = ai.hp; o.meHp = me.hp; o.kingHp = f && f.hp; o.returns = f && f.n && f.n.returns; o.mode = f && f.mode; o.foes = BK.enemies().filter(e => e.alive).map(e => e.t + ':' + Math.round(e.hp)).slice(0, 6);
    } catch (e) { o.err = String(e && e.message || e); } __hp.idle(); return o; })()`, 600000);
  console.log('   ' + JSON.stringify(r));
  ok(!r.err && r.ai && r.players === 2, lab + ': two seats, an AI partner, no exception ' + (r.err || ''));
  ok(r.aiMoved > 5 && r.p1Moved > 5, lab + ': both seats keep moving (no soft-lock): AI ' + r.aiMoved + ', P1 ' + r.p1Moved);
  if (lab === 'skylab') {
    ok(!r.aiOff && !r.p1Off && !r.split, 'skylab: both seats stay on the back (ai off ' + (r.aiOff || 0) + ', p1 off ' + (r.p1Off || 0) + ', split ' + (r.split || 0) + ')');
    ok(r.returns > (r.returns0 || 0) || r.kingHp < r.kingHp0, 'skylab: the fight advances (returns ' + r.returns0 + '->' + r.returns + ', king hp ' + r.kingHp0 + '->' + r.kingHp + ')');
  } else ok(r.state === undefined, 'drakelab: the fight did not end/stick oddly (state ' + (r.state || 'play') + ', foes ' + JSON.stringify(r.foes) + ')');
  await save('coop-' + lab);
  if (lab === 'skylab') {
    const a = await pg.evalp(`(async()=>{ await __hp.setup('skylab','knight','warden'); const f = __hp.freeze(), ai = BK.players().find(p => p.ai); const b = { id: ++f.id, x: ai.x + ai.face * 40, y: ai.y - 8, vx: 0, vy: 0, r: 7, st: 'in', high: false, v: 150, volley: 0, life: 99, g: 0, touched: [], tgt: 0 }; f.bolts.push(b);
      for (let i = 0; i < 240 && b.st === 'in'; i++) { b.life = 99; BK.sim(1); } return b.st; })()`, 120000);
    ok(a === 'ret' || a === 'pow', 'skylab: the AI partner returns a bolt 40 px out (' + a + ')');
  }
}

if (WANT.includes('quit')) for (const lab of ['skylab', 'drakelab']) {
  console.log('quit ' + lab);
  await pg.evalp(`__hp.setup(${JSON.stringify(lab)}, 'knight')`, 120000);
  const r = await pg.evalp(`(()=>{ const alive = () => BK.enemies().filter(e => e.alive).map(e => e.t); for (let i = 0; i < 300; i++) BK.sim(1);
    const o = { pre: alive(), king: !!__hp.f() };
    const ui = BK.ui; ui.openMenu('play'); ui.menuI = ui.menuRows().indexOf('Return to map'); const key = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
    key('Enter'); key('Enter'); for (let i = 0; i < 10 && BK.state !== 'map'; i++) { BK.step(5); key('Enter'); }
    for (let i = 0; i < 60; i++) BK.step(1);
    o.state = BK.state; o.mapEnts = alive().length;   /* the map keeps the lab's list until the next level loads (it is never updated or drawn); what matters is what the NEXT level inherits */
    BK.load(__hp.IDX('wood')); BK.start(); for (let i = 0; i < 120; i++) BK.sim(1);
    o.post = alive().filter(t => /drake|demonking|hellbolt|imp/i.test(t)); o.mount = !!BK.P.mount || !!BK.P.onMover; o.kingAfter = !!__hp.f(); o.sm = !!(BK.skyMount && BK.skyMount.back()); return o; })()`, 120000);
  console.log('   ' + JSON.stringify(r));
  ok(r.state === 'map', lab + ': pause > Return to map reaches the map (' + r.state + ')');
  ok(r.post.length === 0 && !r.kingAfter && !r.sm, lab + ': the next level (wood) inherits no drake / king / bolt / imp / sky back: ' + JSON.stringify(r.post));
  ok(!r.mount, lab + ': the hero is not mounted / carried into the next level');
  ok(r.pre.length > 0, lab + ': the fight foes existed before the quit: ' + JSON.stringify(r.pre));
}
const errs = (pg.errors || []).filter(e => !/favicon|ERR_|Failed to load resource/.test(e));
console.log('console errors: ' + (errs.length ? JSON.stringify(errs).slice(0, 800) : 'none')); ok(!errs.length, 'no page errors');
await pg.close();
console.log(bad ? 'heart-proof: ' + bad + ' FAIL' : 'heart-proof: ok'); process.exit(bad ? 1 : 0);
