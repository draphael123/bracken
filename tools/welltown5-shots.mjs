// tools/welltown5-shots.mjs - THE WELL TOWN's welltown5 pictures (claude/welltown5, Daniel played it 10-03): the shade under its casters, the Gang
// Leader's puddle and slip, the Cistern Queen's stinger and her fire. Not in the suite: god mode, pictures not a playtest.
//   node tools/welltown5-shots.mjs <tag> [shade|gang|queen|all]   -> work/claude/welltown5/<tag>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', what = process.argv[3] || 'all';
const out = join(ROOT, 'work/claude/welltown5', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const what = ${JSON.stringify(what)}, want = k => what === 'all' || what === k;
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.SET.hud = 'minimal';
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const until = (pred, max = 1800) => { for (let i = 0; i < max && !pred(); i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); return pred(); };
    const at = (name, x, y, n = 60) => { fresh(); for (const e of BK.enemies()) if (!e.mini && e !== BK.boss) e.alive = false; BK.tp(x, y); run(n); BK.tp(x, y); BK.look && BK.look(x, y); run(2); snap(name); };
    if (want('shade')) {
      at('s1-lower-market-awnings', 70, 29); at('s2-bazaar-roof', 110, 29); at('s3-square-cloths-west', 158, 25); at('s4-square-cloths-east', 184, 25);
      at('s5-balcony', 273, 27); at('s6-kasbah-gateway', 464, 27); at('s7-kasbah-courtyard-cloths', 492, 27); at('s8-old-well-roof', 540, 27);
    }
    if (want('gang')) { fresh(); for (const e of BK.enemies()) if (e.t !== 'gangleader') e.alive = false; const M = BK.L.mini; BK.tp(Math.round(M.trigger / 16) + 2, Math.round(M.floor / 16) - 1); run(90);
      const gl = BK.enemies().find(e => e.t === 'gangleader'); snap('g1-fight-start');
      const H = BK.gangLeaderHands && BK.gangLeaderHands(); if (H && H.puddleAt) { H.puddleAt(gl.x - 40); run(4); snap('g2-puddle'); until(() => gl.mode === 'slipped', 900); snap('g3-he-slips'); }
      until(() => gl.mode === 'throwTell', 900); snap('g4-bottle'); if (H && H.lightForTest) { H.lightForTest(gl); run(10); snap('g5-alight'); } }
    if (want('queen')) { fresh(); const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); run(240); const q = BK.boss; snap('q1-queen-wakes');
      if (q) { until(() => /lanceTell|pinTell|barbTell/.test(q.mode) || q.mode === 'stingLow', 1800); snap('q2-sting-tell'); until(() => q.mode === 'stingLow' || q.tailLow > 0, 900); snap('q3-stinger-low');
        q.hp = q.maxHp * 0.6; until(() => q.phase === 2 || (BK.cisternQueen() || {}).ph === 2, 1200); run(120); snap('q4-p2-burning'); } }
    return res; })()`, 600000);
  for (const [name, url] of r) writeFileSync(join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote', r.length, 'to', out); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
