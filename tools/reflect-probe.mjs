// tools/reflect-probe.mjs - THE REFLECT KIT, PROBED IN THE PAGE (lane S3 REFLECTKIT, claude/reflectkit, 11-04). One headless Chrome, the hidden lab ?level=skylab.
// For every hero that main.js can play, with the Demon King frozen (mode 'hang', so nothing else flies) and a hellbolt PARKED in front of the hero (a live bolt
// entity in `enemies`, the very thing his fight throws), it tries each verb from VERBS at a CHEST bolt and a HIGH bolt and reads what the bolt did:
//   ret = returned (normal), pow = POWER return, gone = popped/hit, in = untouched.  Then:
//   POWER   the hero's own guard answer (found by input, as tools/riposte.mjs: hold / tap / down / release at every lead 0..24 frames) with the bolt REACHING the
//           hero -> a 'pow' (the RP.parried stamp), and a held guard far off the beat -> 'block' (pops, no pip).
//   ROWS    the verdict per hero vs src/reflect-kit.js REFLECT_KIT: a chest verb returns, a high verb returns, a guard answer is power, nothing is a free power return.
// The three kits main.js cannot play yet (rimebinder, demonhunter, sunpriest) are checked as data (classify + the Desert Priest's flare) in tools/reflect-kit.mjs.
//   node tools/reflect-probe.mjs [hero,hero,...] [--json=<file>] [--shots]        (PORT=<your port>)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { REFLECT_KIT } from '../src/reflect-kit.js';
const args = process.argv.slice(2), flag = n => args.find(a => a.startsWith('--' + n)), heroArg = args.find(a => !a.startsWith('--'));
const LIVE = ['knight', 'warden', 'pyro', 'pirate', 'paladin', 'geomancer', 'reaper', 'berserker', 'ranger'];
const HEROES = heroArg ? heroArg.split(',') : LIVE;
const jsonOut = flag('json') ? flag('json').split('=')[1] : null, shots = !!flag('shots');
const pg = await openPage({ audio: false, fonts: false, seed: +(flag('seed') ? flag('seed').split('=')[1] : 7) });   /* a seeded Math.random: the same frames every run */
let bad = 0, buf = null; const flakes = [];
const ok = (c, m) => { if (buf) { buf.push([c, m]); return; } console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const out = {};
try {
  await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const IDX = LEVELS.findIndex(l => l.id === 'skylab'); const K = BK.keys;
    const rk = window.__rk = {};
    const idle = () => { for (const k in K) K[k] = false; BK.unpress(); };
    rk.setup = h => { idle(); BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero(h); BK.reset({ fresh: true }); try { BKT.setHeroLevel(h, 30); } catch (e) {} try { BK.applyUpgrades(); } catch (e) {}
      const old = BK.demonKing && BK.demonKing.f(); BK.load(IDX); BK.state = 'play'; for (let i = 0; i < 120 && !(BK.demonKing && BK.demonKing.f() && BK.demonKing.f() !== old); i++) BK.sim(1); rk.freeze(); BK.sim(30); return !!(BK.demonKing && BK.demonKing.f()); };
    rk.freeze = () => { const f = BK.demonKing.f(); f.mode = 'hang'; f.mT = 0; f.T = 1e9; f.bolts.length = 0; return f; };
    rk.reset = () => { idle(); const P = BK.P; const f = rk.freeze(); if (P.rgQ !== undefined) { P.rgQ = 9; P.rgArrows = []; } for (let i = 0; i < 40; i++) { P.hp = P.maxHp; P.inv = 0; P.hurt = 0; P.st = P.maxSt; P.mountDown = 0; BK.sim(1); } P.face = 1; P.vx = 0; return f; };
    rk.bolt = (f, dx, dy, high) => { const P = BK.P, b = { id: ++f.id, x: P.x + P.face * dx, y: P.y + dy, vx: 0, vy: 0, r: 7, st: 'in', high: !!high, v: 150, volley: 0, life: 99, g: 0, touched: [], tgt: 0 }; f.bolts.push(b); BK.sim(1); b.life = 99; return b; };
    /* a VERB = a script of key states by frame; it ends when the bolt has been dealt with or the script runs out */
    const A = (f, on) => { K.atk = on; };
    rk.VERBS = {
      tap:    { n: 30, f: (i) => { if (i === 0) BK.press('atk'); } },
      up:     { n: 36, f: (i) => { K.up = i < 24; if (i === 1) BK.press('atk'); } },
      air:    { n: 60, f: (i) => { K.jump = i < 20; if (i === 0) BK.press('jump'); if (i === 12) BK.press('atk'); if (i === 16) BK.press('atk'); if (i === 22) BK.press('atk'); } },
      heavy:  { n: 120, f: (i) => { K.atk = i < 78; } },
      shortheld: { n: 70, f: (i) => { K.atk = i < 24; } },
      holdC:  { n: 100, f: (i) => { K.block = i < 52; } },
      upC:    { n: 50, f: (i) => { K.up = i < 8; K.block = i < 8; } },
      throw:  { n: 40, f: (i) => { if (i === 0) BK.press('throw'); } },
      heavyT1: { n: 60, f: (i) => { K.atk = i < 8; } },
      heavyT2: { n: 90, f: (i) => { K.atk = i < 40; } },
      steady: { only: ['ranger'], n: 220, f: (i) => { K.atk = i < 200 && !(i > 5 && BK.rg() && BK.rg().tier >= 2); } },
      hammer: { only: ['paladin'], n: 50, pre: () => { BK.P.light = 60; }, f: (i) => { K.up = i < 8; K.block = i < 8; } },
      downair: { n: 60, f: (i) => { K.jump = i < 18; if (i === 0) BK.press('jump'); if (i === 16) { K.down = true; BK.press('atk'); } if (i === 30) K.down = false; } },
    };
    rk.VNAMES = Object.keys(rk.VERBS);
    rk.try = (verb, dx, dy, high) => { const f = rk.reset(), P = BK.P, V = rk.VERBS[verb]; if (V.only && !V.only.includes(BK.hero())) return { st: 'n/a', fr: -1, hit: 0 }; if (V.pre) V.pre(); const b = rk.bolt(f, dx, dy, high); let fr = -1, hp0 = P.hp;
      for (let i = 0; i < V.n; i++) { V.f(i); BK.sim(1); if (b.st !== 'in') { fr = i; break; } }
      const st = b.st; idle(); return { st, fr, hit: hp0 - P.hp }; };
    /* THE HERO'S GUARD ANSWER, by input; the bolt then REACHES the hero (parked on his chest, one frame to land) */
    rk.answer = (how, n) => { if (how === 'hold') { K.block = true; BK.sim(n); } else if (how === 'tap') { K.block = true; BK.sim(1); K.block = false; BK.sim(n); }
      else if (how === 'down') { K.down = true; let hh = 0; while (!(BK.ember && BK.ember() && BK.ember().flare) && hh < 60) { BK.sim(1); hh++; } K.down = false; BK.sim(n); }
      else if (how === 'release') { K.block = true; BK.sim(45); K.block = false; BK.sim(n); } };
    rk.land = (how, n) => { const f = rk.reset(), P = BK.P; const b = { id: ++f.id, x: P.x + 4, y: P.y - 8, vx: 0, vy: 0, r: 7, st: 'in', high: false, v: 150, volley: 0, life: 99, g: 0, touched: [], tgt: 0 };
      f.bolts.push(b); const b0 = f.n.blocks, h0 = P.hp; /* the bolt is on him, but the answer comes first: keep it out of reach until the answer is in */
      b.x = P.x + 60; BK.sim(1); rk.answer(how, n); b.x = P.x + 4; b.life = 99; BK.sim(1); const r = { st: b.st, blocks: f.n.blocks - b0, lost: h0 - P.hp }; if (b.st === 'in') { BK.sim(2); r.st = b.st; r.blocks = f.n.blocks - b0; r.lost = h0 - P.hp; } idle(); return r; };
    rk.power = () => { const hits = []; for (const how of ['hold', 'tap', 'down', 'release']) { let first = null, any = 0; for (let n = 0; n <= 24; n++) { const r = rk.land(how, n); if (r.st === 'pow') { any++; if (first === null) first = n; } } if (any) hits.push({ how, first, n: any }); } return hits; };
    /* A GUARD FAR OFF THE BEAT: a held guard 60 frames, or a TAPPED one landed 14-40 frames late (the tap-C heroes: the deflect / ward / hook / bash is still a block after its beat) -> the bolt pops, no pip, no hit */
    rk.blockLate = () => { const tries = []; const one = (how, n) => { const f = rk.reset(), P = BK.P, b = { id: ++f.id, x: P.x + 60, y: P.y - 8, vx: 0, vy: 0, r: 7, st: 'in', high: false, v: 150, volley: 0, life: 99, g: 0, touched: [], tgt: 0 }; f.bolts.push(b); const b0 = f.n.blocks, h0 = P.hp;
        BK.sim(1); if (how === 'hold') { K.block = true; BK.sim(n); } else { K.block = true; BK.sim(1); K.block = false; BK.sim(n); } b.x = P.x + 4; b.life = 99; BK.sim(3); const r = { how, n, st: b.st, blocks: f.n.blocks - b0, lost: h0 - P.hp }; idle(); return r; };
      tries.push(one('hold', 60)); for (const n of [14, 18, 24, 32, 40]) tries.push(one('tap', n)); const best = tries.find(t => t.st === 'gone' && (t.blocks === 1 || (BK.hero() === 'reaper' && t.lost < 9)));   /* popped, and the hero took less than the bolt's 9: held (blocks 1), or the Blood Knight's ward BROKEN by a big blow (it happens about one run in six: half the blow finds him) - either way no pip, no return */   /* (the ward / axes take a small price: lost 1-3, not the bolt's 9) */ return { best: best || null, tries }; };
    rk.snap = (name) => { BK.step(1); const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); return c.toDataURL('image/png'); };
    return IDX; })()`, 60000);
  /* THE PAGE RUNS ON A LOADED MACHINE (other lanes' browsers): a hero's whole probe is retried up to 3 times before any line fails, and a retry is REPORTED (a flake is a finding, not a pass) */
  for (const h of HEROES) for (let attempt = 1; attempt <= 3; attempt++) {
    buf = []; const t0 = Date.now(); const up = await pg.evalp(`__rk.setup(${JSON.stringify(h)})`, 120000);
    ok(up, h + ': the lab loads and the king is in the fight');
    if (!up) { const b = buf; buf = null; for (const [c, m] of b) ok(c, m); break; }
    const R = out[h] = { chest: {}, high: {}, power: [], block: null };
    const verbs = await pg.evalp('__rk.VNAMES');
    for (const v of verbs) {
      for (const [kind, specs] of [['chest', [[20, -8, false], [70, -8, false]]], ['high', [[6, -26, true], [14, -34, true], [6, -44, true], [22, -22, true]]]]) {
        const seen = [];
        for (const [dx, dy, hi] of specs) { const r = await pg.evalp(`__rk.try(${JSON.stringify(v)},${dx},${dy},${hi})`, 120000); seen.push(`${dx},${dy}:${r.st}`); if (r.st === 'ret' || r.st === 'pow') { (R[kind][v] ||= []).push({ at: [dx, dy], st: r.st, fr: r.fr }); } }
      }
    }
    R.power = await pg.evalp('__rk.power()', 300000);
    R.block = await pg.evalp('__rk.blockLate()', 60000);
    const retC = Object.keys(R.chest), retH = Object.keys(R.high), shotsAt70 = Object.entries(R.chest).filter(([, a]) => a.some(x => x.at[0] === 70)).map(([v]) => v);
    const powV = kind => Object.entries(R[kind]).filter(([, a]) => a.some(x => x.st === 'pow')).map(([v]) => v);
    console.log(`${h}: chest by [${retC.join(' ')}]  high by [${retH.join(' ')}]  projectiles (bolt 70 px out) by [${shotsAt70.join(' ')}]`);
    console.log(`   power by guard ${JSON.stringify(R.power)}  power by a verb [${powV('chest').join(' ')}]  guard off the beat ${R.block.best ? R.block.best.how + ' ' + R.block.best.n + ' -> pops' : 'NONE ' + JSON.stringify(R.block.tries.map(t => t.st + '/' + t.blocks + '/' + t.lost))}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    ok(retC.length > 0, h + ': a chest bolt is returned by at least one verb');
    ok(retH.length > 0, h + ': a high bolt is returned by at least one verb (an up attack or a jump cut)');
    const NOSHOT = { knight: 'no projectile in his kit', berserker: 'his hatchet needs a rack (WCH) - not probed' };
    ok(shotsAt70.length > 0 || !!NOSHOT[h], h + ': a hero projectile meets a bolt 70 px out' + (NOSHOT[h] ? ' (' + NOSHOT[h] + ')' : ''));
    ok(R.power.length > 0, h + ': a guard answer on the beat is a POWER return');
    ok(!!R.block.best || h === 'ranger', h + ': the guard far off the beat pops the bolt (no pip)' + (h === 'ranger' ? ' - NOT hers: the bash is a parry only, a late one is a hit (table fixed)' : ''));
    const extra = { reaper: ['heavy', 'heavyT2'], ranger: ['steady'] }[h];
    if (extra) ok(extra.some(v => powV('chest').includes(v)), h + ': the table power-also verb (' + REFLECT_KIT[h].powerAlso.look + ') is a POWER return: ' + powV('chest').join(' '));
    const allowed = h === 'ranger' ? ['steady', 'heavyT2'] : (extra || []);   /* (her 40-frame hold lands in the steady window - it IS a steady shot) */
    const free = powV('chest').filter(v => !allowed.includes(v)); ok(free.length === 0, h + ': no other verb is a free power return' + (free.length ? ' - ' + free.join(' ') : ''));
    if (h === 'reaper') ok(!(R.chest.heavyT1 || []).some(x => x.st === 'pow'), h + ': a tier-1 heavy is only a NORMAL return');
    const K = REFLECT_KIT[h]; if (K) ok(!!K.power, h + ': the table has a power row');
    if (shots) { const url = await pg.evalp('__rk.snap()', 20000); mkdirSync(join(ROOT, 'work/claude/reflectkit'), { recursive: true }); writeFileSync(join(ROOT, 'work/claude/reflectkit', 'probe-' + h + '.png'), Buffer.from(url.split(',')[1], 'base64')); }
    const b = buf; buf = null; const failed = b.filter(([c]) => !c);
    if (failed.length && attempt < 3) { flakes.push(h + ' attempt ' + attempt + ': ' + failed.map(f => f[1]).join(' | ')); console.log('   (retry ' + h + ': ' + failed.length + ' line(s) failed on attempt ' + attempt + ')'); continue; }
    for (const [c, m] of b) ok(c, m); break;
  }
  if (flakes.length) console.log('FLAKES (a retry passed or all failed): ' + flakes.length + ' ' + flakes.join(' || '));
  const errs = pg.errors.filter(e => !/favicon|ERR_|Failed to load resource/.test(e)); ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
} finally { await pg.close(); }
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(out, null, 1));
console.log(bad ? 'reflect-probe: ' + bad + ' FAILED' : 'reflect-probe: ok');
process.exit(bad ? 1 : 0);
