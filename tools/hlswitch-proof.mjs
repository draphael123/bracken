// tools/hlswitch-proof.mjs - THE HIGH LINES SWITCH RULE PLAYED IN THE REAL PAGE (claude/hlswitchproof, 11-14). Not in the suite. Needs the road open + the flag:
//   BRACKEN_ROAD=hl,hlsw PORT=8650 node tools/hlswitch-proof.mjs --mode=strike --heroes=knight,pyro,... --out=DIR --json=FILE [--stills=1]
//   --mode=strike : each lever (J1, J4 on foot; J3 from the ride) struck by each hero (tap, hold, near, far); one blow latches W1; stills (knight, --stills=1)
//   --mode=route  : hl-route.mjs's whole route with the switch rule (one blow, held glides, the branch legs) for --cfg=abc (the state of J1, J3, J4: 000, 111 ...)
//   --mode=perf   : level hash + stills + frame time (sim+draw per frame) at the J1 yard and in the exam gale. Run with and without hlsw (and on master) and compare.
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : ''; };
const MODE = arg('mode') || 'strike', HEROES = (arg('heroes') || 'knight').split(',').filter(Boolean), OUT = arg('out') || 'work/claude/hlswitchproof', CFG = (arg('cfg') || '000');
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 20261112 });
const save = (name, url) => writeFileSync(join(OUT, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
const INIT = `(async () => {
  const lvm = await import('./src/level.js'), hlm = await import('./src/highlines.js'), LKT = await import('./src/line-kit.js');
  const TS = 16, idx = lvm.LEVELS.findIndex(l => l.id === 'highlines'); if (idx < 0) return { err: 'no highlines level (road off?)' };
  const SWON = !!hlm.HL_SWITCH, D = SWON ? hlm.HL_DATA_SW : hlm.HL_DATA, LAND = D.landings, LINE = Object.fromEntries(D.lineKit.lines.map(d => [d.id, d]));
  const H = window.__H = { SWON, D, LAND, LINE, TS, shots: {}, lvm, hlm, LKT, idx };
  BK.manualSimulation = true;
  const P = () => BK.P, K = () => BK.keys, kit = () => BK.kit();
  const clr = () => { const k = K(); k.left = k.right = k.up = k.down = k.jump = k.atk = false; };
  H.clr = clr;
  H.fresh = hero => { BK.setHero(hero); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = true; BK.sim(5); if (H.intro) for (let i = 0; i < 330; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } for (const e of BK.enemies()) if (e.t !== 'hllever') e.alive = false; clr(); BK.sim(2); };
  H.stand = (x, feet) => { clr(); const p = P(); p.lk = null; p.lkHeld = false; p.x = x; p.y = feet; p.vx = 0; p.vy = 0; p.ground = true; BK.sim(6); };
  H.info = () => { const p = P(); return { tx: +(p.x / TS).toFixed(1), ty: +(p.y / TS).toFixed(1), ground: !!p.ground, lk: p.lk ? p.lk.id : null, dead: !!(p.dead > 0) }; };
  H.where = () => { const p = P(); if (p.lk) return 'on ' + p.lk.id; for (let i = 0; i < LAND.length; i++) { const b = LAND[i]; if (p.ground && Math.abs(p.y - b[1] * TS) <= 3 && p.x >= b[0] * TS - 6 && p.x <= (b[2] + 1) * TS + 6) return 'L' + i; }
    for (let j = 0; j < D.nets.length; j++) { const b = D.nets[j]; if (Math.abs(p.y - b[1] * TS) <= 6 && p.x >= b[0] * TS - 6 && p.x <= (b[2] + 1) * TS + 6) return 'net' + j; } return 'air(' + Math.round(p.x / TS) + ',' + Math.round(p.y / TS) + ')'; };
  H.settle = (cap = 240) => { for (let f = 0; f < cap && !(P().ground && !P().lk); f++) BK.sim(1); };
  H.sw = (id, s) => { if (s !== undefined) LKT.setSwitches(kit(), { [id]: s }); const z = kit().sw[id]; z.cool = 0; const e = BK.enemies().find(q => q.t === 'hllever' && q.sw === id); if (e) { e.cool = 0; e.swing = 0; } return z.state; };
  H.state = id => kit().sw[id].state;
  H.take = (id, cap = 40) => { const k = K(); k.up = true; let got = false; for (let f = 0; f < cap && !got; f++) { BK.sim(1); got = !!P().lk && P().lk.id === id; } k.up = false; return got; };
  H.snap = (name, hud) => { if (!hud) { try { BK.uiHud.q.length = 0; BK.uiHud.hint('', 0.01); } catch (e) {} } BK.step(2); const c = document.createElement('canvas'); c.width = BK.view.VW * 3; c.height = BK.view.VH * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); H.shots[name] = c.toDataURL('image/png'); return name; };
  H.run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
  H.hash = () => { const L = BK.L; let h = 2166136261 >>> 0; const mix = s => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } };
    for (let i = 0; i < L.grid.length; i++) { h ^= L.grid[i]; h = Math.imul(h, 16777619) >>> 0; }
    mix(JSON.stringify([L.ents, L.landings, L.nets, L.checkpoints, L.secrets, L.exit, L.winch, L.points, L.lever, L.hopper, L.sections, L.unlocks, L.START, L.W, L.H])); mix(String(hlm.RULE)); return (h >>> 0).toString(16); };
  return { ok: true, sw: SWON };
})()`;
const init = await pg.evalp(INIT); if (!init || init.err) { console.log('INIT FAIL', JSON.stringify(init)); await pg.close(); process.exit(2); }
console.log('page: HL_SWITCH ' + init.sw);
let bad = 0; const out = {};

if (MODE === 'strike') {
  const STRIKE = `(async (hero, stills) => { const H = window.__H, { LKT, LAND, D, TS } = H; const rows = [], K = () => BK.keys, P = () => BK.P, kit = () => BK.kit();
    const row = (name, ok, why) => rows.push({ name, ok: !!ok, why: ok ? '' : String(why) });
    H.fresh(hero);
    const leverAt = { J1: { li: 2, near: 64.4, far: 58.6 }, J4: { li: 27, near: 73.8, far: 73.2 } };
    const attempt = (id, tx, hold) => { const sw = D.lineKit.switches.find(s => s.id === id), spec = leverAt[id], lx = sw.at[0]; H.sw(id, 0); H.stand(tx * TS, LAND[spec.li][1] * TS); P().face = lx > tx ? 1 : -1; BK.sim(70);
      const s0 = H.state(id); if (hold) { K().atk = true; BK.sim(70); K().atk = false; } else { BK.press('atk'); BK.sim(34); } BK.sim(24); const s1 = H.state(id); BK.sim(30); return { thrown: s1 !== s0, once: s1 === (s0 + 1) % 2 && H.state(id) === s1 }; };
    const res = {};
    for (const id of ['J1', 'J4']) { const spec = leverAt[id]; res[id] = {};
      for (const [rng, tx] of [['near', spec.near], ['far', spec.far]]) { let a = attempt(id, tx, 0), how = a.thrown ? 'tap' : ''; if (!a.thrown) { a = attempt(id, tx, 0); how = a.thrown ? 'tap' : ''; }   /* a second tap: a blow right after a held one can be swallowed by the hero's own cooldown */ if (!a.thrown) { a = attempt(id, tx, 1); how = a.thrown ? 'hold' : 'NO'; } res[id][rng] = how + (a.thrown && !a.once ? '(double!)' : ''); }
      row(id + ' struck by ' + hero + ' (a tap or a hold throws it, once): near ' + res[id].near + ', ' + (Math.abs(spec.far - spec.near) < 3 ? 'edge ' : 'far ') + res[id].far, res[id].near !== 'NO' && !/double/.test(res[id].near), JSON.stringify(res[id])); }
    { const lx = D.lineKit.switches.find(s => s.id === 'J3').at[0]; H.sw('J3', 0); H.stand(28.5 * TS, LAND[11][1] * TS); const got = H.take('H2');
      if (!got) row('J3: H2 taken from landing 11', false, JSON.stringify(H.info())); else { BK.press('atk'); let thrown = -1, lastP = -99, ids = ['H2'], fr = 0;
        for (; fr < 1500 && BK.P.lk; fr++) { BK.sim(1); const dx = lx * TS - BK.P.x; if (thrown < 0 && dx < 44 && dx > -26 && fr - lastP > 9) { BK.press('atk'); lastP = fr; } if (thrown < 0 && H.state('J3') === 1) thrown = Math.round(dx); const c = BK.P.lk && BK.P.lk.id; if (c && c !== ids[ids.length - 1]) ids.push(c); }
        H.settle(); res.J3 = { thrownAtDx: thrown, lines: ids.join('>'), land: H.where() };
        row('J3 struck by ' + hero + ' from the ride (swing or shot), the line takes S4 (thrown ' + (thrown >= 0 ? thrown + ' px before the lever' : 'NEVER') + '; ' + ids.join('>') + ', ends ' + H.where() + ')', thrown >= 0 && ids.includes('S4') && H.where() === 'L12', JSON.stringify(res.J3)); } }
    { H.fresh(hero); H.stand(12.2 * TS, LAND[0][1] * TS); const got = H.take('W1'); const y0 = BK.P.y; BK.sim(60); const still = Math.abs(BK.P.y - y0) < 2;
      row('W1: UP takes it; with no blow he hangs still', got && still, JSON.stringify(H.info()));
      BK.press('atk'); let f = 0; for (; f < 1400 && BK.P.lk; f++) BK.sim(1); H.settle(); row('W1: ONE blow carries him to landing 1 (' + f + ' frames)', H.where() === 'L1', H.where()); }
    if (stills) { H.intro = true; const S = H.snap; H.fresh(hero); const near = (id, tx, li) => { H.sw(id, 0); H.stand(tx * TS, LAND[li][1] * TS); BK.P.face = 1; H.run(30); };
      near('J1', 63, 2); S('01-j1-idle'); BK.press('atk'); H.run(5); S('02-j1-struck', true); H.run(40);
      for (const s of [0, 1]) { H.sw('J1', s); H.stand(69.5 * TS, LAND[2][1] * TS); H.take('W3'); BK.press('atk'); for (let f = 0; f < 300 && BK.P.lk && BK.P.x > 61 * TS; f++) { BK.sim(1); if (f % 4 === 0) BK.step(1); } H.run(2); S(s ? '04-j1-board-lit-silver-w3' : '03-j1-board-lit-main-w3', true); if (s) { for (let f = 0; f < 400 && BK.P.lk && !(BK.P.lk.id === 'S2'); f++) BK.sim(1); H.run(20); S('05-j1-on-s2-silver-line', true); } H.settle(); }
      H.fresh(hero); H.sw('J3', 0); H.stand(28.5 * TS, LAND[11][1] * TS); H.take('H2'); BK.press('atk'); for (let f = 0; f < 600 && BK.P.lk && BK.P.x < 31 * TS; f++) { BK.sim(1); if (f % 4 === 0) BK.step(1); } H.run(2); S('06-j3-idle-from-the-ride', true); BK.press('atk'); H.run(8); S('07-j3-struck', true);
      for (let f = 0; f < 400 && BK.P.lk && BK.P.lk.id !== 'S4'; f++) BK.sim(1); H.run(20); S('08-j3-on-s4', true);
      H.fresh(hero); near('J4', 73.8, 27); S('09-j4-idle'); BK.press('atk'); H.run(5); S('10-j4-struck', true); H.run(30);
      H.sw('J4', 1); H.stand(74.5 * TS, LAND[27][1] * TS); H.take('E2'); BK.press('atk'); for (let f = 0; f < 700 && BK.P.lk && BK.P.lk.id !== 'EL'; f++) BK.sim(1); H.run(30); S('11-j4-on-el-lee-branch', true);
      for (let f = 0; f < 900 && BK.P.lk; f++) BK.sim(1); H.settle(); H.run(10); S('12-j4-landing-le-held-glide-eg', true); H.take('EG'); BK.press('atk'); H.run(70); S('13-j4-eg-gliding-in-the-gale', true); }
    return { rows, res, shots: stills ? H.shots : null }; })("__HERO__", __STILLS__)`;
  for (const h of HEROES) {
    const r = await pg.evalp(STRIKE.replace('__HERO__', h).replace('__STILLS__', String(h === 'knight' && !!arg('stills'))), 900000).catch(e => ({ err: String(e) }));
    if (!r || r.err) { console.log('FAIL', h, r && r.err); bad++; continue; }
    const fails = r.rows.filter(x => !x.ok); bad += fails.length; out[h] = r.rows;
    console.log((fails.length ? 'FAIL' : ' ok ') + ' ' + h + '  ' + (r.rows.length - fails.length) + '/' + r.rows.length); for (const x of r.rows) console.log('   ' + (x.ok ? '+' : 'X') + ' ' + x.name + (x.ok ? '' : '  <- ' + x.why));
    if (r.shots) for (const [n, u] of Object.entries(r.shots)) save(n, u);
  }
}

if (MODE === 'route') {
  const src = readFileSync(new URL('./hl-route.mjs', import.meta.url), 'utf8'); const a = src.indexOf('const PAGE = `') + 14, b = src.indexOf("})(${JSON.stringify('HERO')}, ${RESET})`;");
  let PAGE = src.slice(a, b) + '})("__HERO__", false)';
  const rep = (from, to) => { if (!PAGE.includes(from)) throw new Error('patch target missing: ' + from.slice(0, 60)); PAGE = PAGE.replace(from, to); };
  rep('const D = hlm.HL_DATA,', 'const D = hlm.HL_SWITCH ? hlm.HL_DATA_SW : hlm.HL_DATA,');
  rep('const { L, P, k } = fresh();', 'const CFG = { J1: +CFGS[0], J3: +CFGS[1], J4: +CFGS[2] }; const { L, P, k } = fresh(); LKT.setSwitches(BK.kit(), CFG);');
  rep("if (f % 18 === 0) BK.press('atk'); BK.sim(1); } return f; };", "if (f === 0) BK.press('atk'); BK.sim(1); } return f; };");   /* ONE blow: the latch carries him */
  rep("const f = rideOut(); settle(); row(id + ' glide: rides", "if (LINE[id].hold) BK.press('atk'); const f = rideOut(); settle(); row(id + ' glide: rides");
  const swNow = "const swS = id => BK.kit().sw[id].state; const where = () => { if (P.lk) return 'on ' + P.lk.id; for (let i = 0; i < LAND.length; i++) if (onLanding(i)) return 'L' + i; for (let j = 0; j < D.nets.length; j++) { const n = D.nets[j]; if (Math.abs(P.y - n[1] * TS) <= 6 && P.x >= n[0] * TS - 6 && P.x <= (n[2] + 1) * TS + 6) return 'net' + j; } return 'air(' + Math.round(P.x / TS) + ',' + Math.round(P.y / TS) + ')'; };";
  rep('/* ---- the route ---- */', swNow + '\n  /* ---- the route ---- */');
  rep("winch('W3', 2, 3, 69.5);", `winch('W3', 2, CFG.J1 ? 4 : 3, 69.5); row('J1 still ' + CFG.J1 + ' after W3 (the latch blow did not throw it)', swS('J1') === CFG.J1, 'J1 ' + swS('J1'));
  if (CFG.J1) { const A = LAND[4], ends = {}; for (const dir of [1, -1]) { stand(dir > 0 ? A[0] * TS + 6 : (A[2] + 1) * TS - 6, A[1] * TS); k[dir > 0 ? 'right' : 'left'] = true; BK.sim(200); clr(); BK.sim(200); ends[dir > 0 ? 'east' : 'west'] = where(); }
    row('J1=1 (silver ledge Ls2): walking off either edge ends on a net or landing, alive (' + JSON.stringify(ends) + ')', !/air/.test(ends.east + ends.west) && !(P.dead > 0), JSON.stringify(ends)); /* a rider who falls off the silver ledge catches W2 in the air: one blow carries him up to L2, where J1 is thrown back and W3 is ridden again */ stand(A[0] * TS + 6, A[1] * TS); k.right = true; BK.sim(200); clr(); BK.sim(2); const W2hang = !!P.lk && P.lk.id === 'W2'; if (W2hang) { BK.press('atk'); rideOut(); settle(); } row('J1=1: the man who fell off Ls2 is carried back up W2 by one blow and stands on L2 (' + where() + ')', !W2hang ? where() === 'L2' || /net/.test(where()) : onLanding(2), 'W2hang ' + W2hang + ' ' + where()); LKT.setSwitches(BK.kit(), { J1: 0 }); BK.kit().sw.J1.cool = 0; if (!onLanding(2)) stand(66 * TS, LAND[2][1] * TS); winch('W3', 2, 3, 69.5); }`);
  rep("winch('H2', 11, 13, 28.5);", "winch('H2', 11, CFG.J3 ? 12 : 13, 28.5); row('J3 still ' + CFG.J3 + ' after H2', swS('J3') === CFG.J3, 'J3 ' + swS('J3')); if (CFG.J3) winch('S5', 12, 13, 30.2);");
  rep("winch('E2', 27, 28, 74.5);", "winch('E2', 27, CFG.J4 ? 37 : 28, 74.5); row('J4 still ' + CFG.J4 + ' after E2 (the latch blow beside the lever did not throw it)', swS('J4') === CFG.J4, 'J4 ' + swS('J4')); if (CFG.J4) glide('EG', 37, 28, 72.5);");
  PAGE = PAGE.replace('const lvm = await import', 'const CFGS = ' + JSON.stringify(CFG) + ';\n  const lvm = await import');
  for (const h of HEROES) {
    const t0 = Date.now(); const r = await pg.evalp(PAGE.replace('__HERO__', h), 1800000).catch(e => ({ err: String(e) }));
    if (!r || r.err) { console.log('FAIL', h, r && r.err); bad++; continue; }
    const fails = r.rows.filter(x => !x.ok); bad += fails.length; out[h + ':' + CFG] = r.rows;
    console.log((fails.length ? 'FAIL' : ' ok ') + ' ' + h + ' cfg ' + CFG + '  ' + (r.rows.filter(x => !x.note).length - fails.length) + '/' + r.rows.filter(x => !x.note).length + ' legs pass (' + Math.round((Date.now() - t0) / 1000) + ' s)');
    for (const x of r.rows) console.log('   ' + (x.ok ? '+' : 'X') + ' ' + x.name + (x.ok ? '' : '  <- ' + x.why));
  }
}

if (MODE === 'perf') {
  const PERF = `(async () => { const H = window.__H, { LAND, TS, SWON } = H; const res = { sw: SWON, hash: H.hash() };
    const time = (label, setup, step, n = 360) => { setup(); const ts = []; for (let i = 0; i < n; i++) { const t = performance.now(); step(i); BK.sim(1); BK.step(1); ts.push(performance.now() - t); } ts.sort((a, b) => a - b); res[label] = { p50: +ts[Math.floor(n * 0.5)].toFixed(2), p95: +ts[Math.floor(n * 0.95)].toFixed(2), max: +ts[n - 1].toFixed(2) }; };
    H.fresh('knight'); res.hash = H.hash(); BK.SET.hud = 'minimal';
    time('yard-idle', () => { H.stand(63 * TS, LAND[2][1] * TS); BK.P.face = 1; BK.sim(30); }, () => {});
    H.stand(63 * TS, LAND[2][1] * TS); BK.P.face = 1; H.run(40); H.snap('perf-yard'); H.stand(69.5 * TS, LAND[2][1] * TS); H.take('W3'); for (let f = 0; f < 300 && BK.P.lk && BK.P.x > 60 * TS; f++) { if (f === 0) BK.press('atk'); if (!SWON && f % 18 === 0) BK.press('atk'); BK.sim(1); } H.run(10); H.snap('perf-w3-board');
    H.fresh('knight'); H.stand(34 * TS, LAND[12][1] * TS); H.run(30); H.snap('perf-ls4-pylon'); H.stand(74 * TS, LAND[27][1] * TS); H.run(30); H.snap('perf-exam-foot'); H.stand(28.5 * TS, LAND[11][1] * TS); H.run(30); H.snap('perf-h2-foot');
    time('exam-e2-ride', () => { H.fresh('knight'); BK.SET.hud = 'minimal'; H.stand(74.5 * TS, LAND[27][1] * TS); H.take('E2'); }, i => { if (i === 0 || (!SWON && i % 18 === 0)) BK.press('atk'); }, 420);
    res.shots = H.shots; return res; })()`;
  const r = await pg.evalp(PERF, 900000); const shots = r.shots; delete r.shots; console.log(JSON.stringify(r)); out.perf = r; for (const [n, u] of Object.entries(shots)) save((arg('tag') ? arg('tag') + '-' : '') + n, u);
}

if (MODE === 'reach') {   /* where along the deck does a tap throw J1 / J4 (every 0.25 tile from the lever's own post out to 6 tiles) */
  const REACH = `(async (hero) => { const H = window.__H, { LAND, D, TS } = H; H.fresh(hero); const out = {};
    for (const [id, li, dir] of [['J1', 2, -1], ['J4', 27, -1]]) { const sw = D.lineKit.switches.find(s => s.id === id), lx = sw.at[0], B = LAND[li], hits = [];
      for (let d = 0.25; d <= 6; d += 0.25) { const tx = lx - d; if (tx < B[0] + 0.3) break; H.sw(id, 0); H.stand(tx * TS, B[1] * TS); BK.P.face = 1; BK.sim(24); const s0 = H.state(id); BK.press('atk'); BK.sim(40); if (H.state(id) !== s0) hits.push(d); }
      out[id] = hits.join(','); }
    return out; })("__HERO__")`;
  for (const h of HEROES) { const r = await pg.evalp(REACH.replace('__HERO__', h), 900000); console.log(h + ' thrown at distances (tiles from the lever): ' + JSON.stringify(r)); out['reach:' + h] = r; }
}

if (MODE === 'takes') {   /* which line UP takes from each x of a landing: --land=12 */
  const TK = `(async (li) => { const WHY = __WHY__; const H = window.__H, { LAND, TS } = H; H.fresh('knight'); const B = LAND[li], out = [];
    for (let x = B[0] + 0.5; x <= B[2] + 1; x += 0.5) { H.clr(); H.stand(x * TS, B[1] * TS); const k = BK.keys; k.up = true; let id = null; for (let f = 0; f < 40 && !id; f++) { BK.sim(1); id = BK.P.lk ? BK.P.lk.id : null; } k.up = false; if (id) { BK.press('atk'); } for (let f = 0; f < 700 && BK.P.lk; f++) BK.sim(1); H.settle(); out.push(x + ':' + (id || '-') + '>' + H.where()); if (WHY) { const z = BK.kit(); H.stand(x * TS, B[1] * TS); const P = BK.P; out.push('   reach@' + x + ' ' + z.list.filter(q => ['S4', 'S5'].includes(q.id)).map(q => q.id + ' dir' + q.dir + ' xa' + Math.round(q.xa) + ' xb' + Math.round(q.xb) + ' y@' + Math.round(H.LKT.lineY(q, P.x)) + ' inReach=' + H.LKT.inReach(q, P) + ' cut=' + q.cut).join(' | ') + ' P ' + Math.round(P.x) + ',' + Math.round(P.y) + ' lkSkip ' + P.lkSkip + ' lkRel ' + (P.lkRel||0).toFixed(2)); } }
    return out.join(' '); })(__LI__)`;
  console.log(await pg.evalp(TK.replace('__LI__', arg('land') || '12').replace('__WHY__', arg('why') ? 'true' : 'false'), 900000));
}
if (arg('json')) writeFileSync(arg('json'), JSON.stringify(out, null, 1));
console.log('console errors: ' + JSON.stringify(pg.errors));
if (pg.errors.length) bad++;
await pg.close(); process.exit(bad ? 1 : 0);
