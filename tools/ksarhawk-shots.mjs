// tools/ksarhawk-shots.mjs - THE HAWK-MISTRESS's ROOFTOPS, end to end, and her fight's states (claude/ksarhawk; not in the suite): god mode, a picture not a fight.
//   usage: PORT=8892 node tools/ksarhawk-shots.mjs [tag]   -> work/claude/ksarhawk/<tag>/*.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'shots', out = join(ROOT, 'work/claude/ksarhawk', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'ksar'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    /* the rooftops before the fight, west to east (the boss asleep) */
    for (const [c, n] of [[813, 'roof-west'], [835, 'roof-mid'], [850, 'roof-east'], [856, 'roof-back']]) { BK.tp(c, 33); run(150); BK.state = 'play'; snap(n); }
    const e = BK.boss, H = BK.hawkMistressHands(); res.push(['info', 'data:,' + encodeURIComponent(JSON.stringify({ boss: !!e, mode: e && e.mode, x: e && e.x, P: [BK.P.x, BK.P.y], arena: BK.L && BK.L.arena && [BK.L.arena.x0, BK.L.arena.x1] }))]);
    if (e && H) { BK.tp(830, 33); run(200); const S = H.show();
      for (const m of ['circle', 'down', 'wheel', 'home']) { if (!S) break; S.hawk.mode = m; S.hawk.t = 99; if (m === 'down') { S.hawk.x = e.x + 40; S.hawk.y = S.G.floorY - 4; } e.mode = 'walk'; e.modeT = 99; BK.state = 'play'; BK.tp(e.x / 16 - 5, 33); run(6); BK.state = 'play'; snap('hawk-' + m); } }
    return res; })()`, 400000);
  for (const [name, d] of r) { if (name === 'info') { console.log(decodeURIComponent(d.slice(6))); continue; } writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/ksarhawk/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
