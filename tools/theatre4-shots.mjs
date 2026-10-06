// tools/theatre4-shots.mjs - claude/theatre4's pictures (not a check): THE GREEN ROOM, the masks, and the puppets' read (hittable gold / taut steel / the
// night). God mode, pictures only. usage: PORT=<port> node tools/theatre4-shots.mjs [outDir]   (default work/claude/theatre4)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || join(ROOT, 'work/claude/theatre4'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const { HOUSE } = await import('/src/maskwright-theatre.js'); const TS = 16, res = [], X = x => x + HOUSE;
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'theatre'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const P = BK.P;
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    // THE GREEN ROOM: the villain in its lamp, then the paint frame and gallery, then the beginners
    fresh(); BK.tp(X(298), 33); P.face = 1; run(90); BK.tp(X(304), 33); run(30); snap('1-green-room-villain');
    run(30); snap('2-green-room-lunge');
    fresh(); BK.tp(X(323), 32); P.face = 1; run(120); snap('3-paint-frame-floor');
    fresh(); BK.tp(X(331), 21); P.face = 1; run(60); snap('4-paint-gallery');
    fresh(); BK.tp(X(352), 33); P.face = 1; run(120); snap('5-beginners');
    // THE MASKS up close: the stage door tragedy looked at
    fresh(); BK.tp(X(10), 33); P.face = -1; run(120); P.face = 1; run(8); snap('6-mask-tragedy');
    // THE PUPPETS: hittable (gold, slack) and not (steel, taut); the night
    fresh(); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); run(160);
    const S = BK.puppeteerHands().show(); S.overCd = 1e9; const bru = S.puppets.find(p => p.t === 'marionette'), har = S.puppets.find(p => p.t === 'harlequin');
    P.x = bru.x - 50; P.y = A.floor; for (let i = 0; i < 4; i++) { bru.mode = 'recover'; bru.modeT = 1.5; har.mode = 'hang'; har.lateT = 0; BK.sim(1); } BK.step(1); snap('7-puppet-hittable-vs-taut');
    bru.mode = 'hang'; bru.lateT = 0; BKT.hurtEnemy(bru, 10, bru.x - 10, false); BK.sim(2); BK.step(1); snap('8-puppet-clank');
    S.scene = 2; S.change = null; for (let i = 0; i < 30; i++) { bru.mode = 'recover'; bru.modeT = 1.5; BK.sim(1); } BK.step(1); snap('9-night');
    return res; })()`, 300000);
  for (const [n, d] of r) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('wrote ' + r.length + ' pictures to ' + out + (pg.errors.length ? ' | page errors: ' + pg.errors.slice(0, 3).join(' | ') : ''));
} finally { pg.close(); }
