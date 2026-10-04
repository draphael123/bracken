// tools/djinn2-shots.mjs - THE DJINN rework's pictures (claude/djinn2): his ward after each opening, his new moves (sand spears, the fire devil, the
// whirlpool), the flood's waves (the high ripples), the bucket bailing him where he is. Not in the suite: god mode, pictures not a playtest.
//   PORT=6989 node tools/djinn2-shots.mjs <tag> [p1|p2|p3|all]   -> work/claude/djinn2/<tag>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', what = process.argv[3] || 'all';
const out = join(ROOT, 'work/claude/djinn2', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const what = ${JSON.stringify(what)}, want = k => what === 'all' || what === k;
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.SET.hud = 'minimal';
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const until = (pred, max = 1800) => { for (let i = 0; i < max && !pred(); i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); return pred(); };
    fresh(); for (const e of BK.enemies()) if (e !== BK.boss && e.t !== 'djinn') e.alive = false; const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); run(60); snap('a0-rising'); run(150);
    const q = BK.boss, S = BK.djinnHands().show(), G = S.G, P = BK.P;
    const pour = () => { P.skin.sips = 3; P.x = q.x - 50; P.y = G.floor; P.vy = 0; P.face = 1; P.djBurn = 0; BK.press('talk'); };
    if (want('p1')) { until(() => q.mode === 'spearsTell' || q.mode === 'spears', 1500); run(10); snap('p1-spears');
      until(() => q.mode === 'walk' && !(S.ward > 0) && !(S.wary > 0), 900); pour(); run(10); snap('p1-mud'); until(() => S.ward > 0, 400); run(20); snap('p1-ward-sand-hardens'); }
    if (want('p2')) { q.hp = q.maxHp * 0.6; until(() => S.ph === 2, 1200); run(80); snap('p2-fire'); until(() => S.bands.some(b => b.k === 'firedevil'), 1500); run(30); snap('p2-fire-devil');
      until(() => q.mode === 'walk' && S.burn && !(S.ward > 0), 900); pour(); run(10); snap('p2-doused'); until(() => S.ward > 0, 400); run(20); snap('p2-ward-white-hot'); }
    if (want('p3')) { q.hp = q.maxHp * 0.3; until(() => S.ph === 3, 1200); run(160); snap('p3-flood-column');
      for (let k = 0; k < 3; k++) { until(() => q.mode === 'wave', 1500); run(8 + k * 14); snap('p3-wave-' + k); }
      P.x = G.mid - 120; P.y = G.floor; until(() => q.mode === 'whirl' || q.mode === 'whirlTell', 1500); run(30); snap('p3-whirlpool');
      until(() => q.mode === 'hover' && S.bucket.st === 'up', 1500); const px = G.crank - 12; P.x = px; P.y = G.ledgeY; P.vy = 0; P.face = 1; BK.press('atk'); run(50); snap('p3-bailed-where-he-is'); res.push(['meta', JSON.stringify({ heroX: P.x, crank: px, djX: q.x, mid: G.mid, mode: q.mode })]);
      until(() => S.ward > 0, 600); run(20); snap('p3-ward-shroud'); }
    return res; })()`, 600000);
  for (const [name, url] of r) { if (name === 'meta') { console.log(url); continue; } writeFileSync(join(out, name + '.png'), Buffer.from(url.split(',')[1], 'base64')); }
  console.log('wrote', r.length, 'to', out); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
