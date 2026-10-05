// tools/djinn3-shots.mjs - THE DJINN3 rework's pictures (claude/djinn3): THE STEAM WORKS (the vents told and jetting, a capped vent, the flooded trough's
// steam, THE BELLOWS lit and capped), THE LESSER DJINN (sand and fire, whirling and open), and the boss's new beats (the turns, the tide over the ledges,
// the blow from below, the bucket winding up and hanging ready). Not in the suite: god mode, pictures not a playtest.
//   PORT=6641 node tools/djinn3-shots.mjs <tag> [works|boss|all]   -> work/claude/djinn3/<tag>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', what = process.argv[3] || 'all';
const out = join(ROOT, 'work/claude/djinn3', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const what = ${JSON.stringify(what)}, want = k => what === 'all' || what === k;
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.SET.hud = 'minimal';
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const until = (pred, max = 1800) => { for (let i = 0; i < max && !pred(); i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); return pred(); };
    if (want('works')) { const WT = () => BK.welltown(), H = () => BK.welltownHands();
      const at = (name, x, y, pre) => { fresh(); for (const e of BK.enemies()) if (e !== BK.boss && !(pre && pre.keep && pre.keep(e))) e.alive = false; BK.tp(x, y); run(20); if (pre && pre.until) until(pre.until, 900); if (pre && pre.act) pre.act(); run(pre && pre.n || 2); snap(name); };
      const v0 = () => WT().vents.find(v => !v.steam && !v.always), st = v => H().ventState(v);
      at('w1-vent-glow', 580, 47, { until: () => st(v0()) === 'glow', n: 30 });
      at('w2-vent-jet', 580, 47, { until: () => st(v0()) === 'jet', n: 10 });
      at('w3-vent-capped', 581, 47, { act: () => { const P = BK.P; P.skin.sips = 3; P.x = v0().x0 * 16 - 20; P.face = 1; BK.press('talk'); }, n: 12 });
      at('w4-steam-trough', 594, 49, { until: () => WT().vents.some(v => v.steam && st(v) === 'jet'), n: 6 });
      at('w5-bellows-lit', 606, 47, { n: 20 });
      at('w6-bellows-capped', 608, 47, { act: () => { const P = BK.P, b = WT().vents.find(v => v.always); P.skin.sips = 3; P.x = b.x0 * 16 - 20; P.face = 1; BK.press('talk'); }, n: 12 });
      at('w7-sand-spirit', 531, 35, { keep: e => e.cnSkin === 'sanddjinn', n: 40 });
      at('w8-sand-spirit-mud', 531, 35, { keep: e => e.cnSkin === 'sanddjinn', act: () => { const P = BK.P, e = BK.enemies().find(q => q.alive && q.cnSkin === 'sanddjinn'); P.skin.sips = 3; e.x = P.x + 24; e.y = P.y - 6; P.face = 1; BK.press('talk'); }, n: 40 });
      at('w9-fire-spirit', 613, 47, { keep: e => e.cnSkin === 'firedjinn' && e.x / 16 < 620, n: 40 }); }
    if (what === 'works') return res;
    fresh(); for (const e of BK.enemies()) if (e !== BK.boss && e.t !== 'djinn') e.alive = false; const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); run(210);
    const q = BK.boss, S = BK.djinnHands().show(), G = S.G, P = BK.P;
    q.hp = q.maxHp * 0.6; until(() => q.mode === 'collapse', 900); run(40); snap('t1-collapse'); until(() => q.mode === 'reform', 300); run(60); snap('t2-reform-fire');
    q.hp = q.maxHp * 0.3; until(() => q.mode === 'hiss', 1500); run(40); snap('t3-hiss'); until(() => q.mode === 'rise', 300); run(60); snap('t4-rise');
    until(() => S.tide.st === 'surge', 2000); run(30); snap('p3-surge-told'); until(() => S.tide.st === 'high', 600); run(20); snap('p3-high-tide');
    P.x = G.ledgeE[0] + 40; P.y = G.ledgeY; until(() => q.mode === 'upsurgeTell', 3000); run(30); snap('p3-bubbles-below');
    P.x = G.crank - 12; P.y = G.ledgeY; P.vy = 0; P.face = 1; until(() => S.bucket.st === 'down' && !(S.bucket.t > 0), 1200); BK.press('atk'); run(40); snap('p3-bucket-winding'); until(() => S.bucket.st === 'up', 400); run(20); snap('p3-bucket-ready');
    until(() => q.mode === 'drawing', 3000); run(20); snap('p3-under-the-shaft'); P.x = G.crank - 12; P.y = G.ledgeY; P.face = 1; BK.press('atk'); run(70); snap('p3-bailed');
    res.push(['meta', JSON.stringify({ mode: q.mode, bucket: S.bucket.st, tide: S.tide.st, n: S.n.bailed })]);
    return res; })()`, 600000);
  for (const [name, url] of r) { if (name === 'meta') { console.log(url); continue; } writeFileSync(join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64')); }
  console.log('wrote', r.length, 'to', out); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
