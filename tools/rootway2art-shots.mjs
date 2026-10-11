// tools/rootway2art-shots.mjs - THE ROOTWAY's art-pass pictures (claude/rootway2art). Not in the suite. god mode: a picture, not a playtest.
//   usage: PORT=8810 node tools/rootway2art-shots.mjs <tag> [name,name...]  -> work/claude/rootway2art/<tag>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', only = process.argv[3] ? process.argv[3].split(',') : null;
const out = join(ROOT, 'work/claude/rootway2art', tag); mkdirSync(out, { recursive: true });
const SPOTS = [   // [name, tile x, tile y of the feet, frames]
  ['a1-cellar-start', 6, 41], ['a1-cellar-buds', 28, 41], ['a1-cellar-span', 50, 37], ['a1-cellar-pit', 70, 36], ['a1-cellar-shrine', 90, 34],
  ['a2-trunk-foot', 118, 34], ['a2-trunk-mid', 137, 30], ['a2-trunk-top', 140, 24], ['a2-trunk-knothole', 146, 22], ['a2-trunk-shrine', 192, 31],
  ['a3-larder', 203, 31], ['a3-gantry-a', 240, 26], ['a3-gantry-b', 262, 22], ['a3-gantry-zip', 275, 18], ['a3-gantry-shrine', 298, 18],
  ['a4-snares-jaws', 321, 18], ['a4-snares-post', 316, 18], ['a4-snares-net1', 327, 18], ['a4-snares-net2', 355, 18], ['a4-snares-net3', 372, 18], ['a4-snares-pod', 361, 18],
  ['a5-lodge-door', 380, 18], ['a5-lodge-porch', 386, 18],
];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, res = []; const only = ${JSON.stringify(only)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'rootway'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    for (const [name, x, y] of ${JSON.stringify(SPOTS)}) { if (only && !only.some(o => name.startsWith(o))) continue;
      BK.tp(x, y); BK.P.vx = BK.P.vy = 0; for (let i = 0; i < 40; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); snap(name); }
    /* THE NET, in its three states: walk under it (it creaks), then it falls, then it lies */
    if (!only || only.includes('net')) { BK.tp(329, 18); BK.P.vx = BK.P.vy = 0; for (let k = 0; k < 3; k++) { for (let i = 0; i < 12; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } } BK.step(1); snap('n1-tell'); for (let i = 0; i < 14; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); snap('n2-fall'); for (let i = 0; i < 40; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); snap('n3-down'); }
    /* THE HUNTMASTER, in each mode (forced: a picture of the pose in the game's own frame, the camera on him) */
    if (!only || only.includes('hm')) { for (const e of BK.enemies()) if (e.t !== 'huntmaster') e.alive = false; BK.tp(BK.L.arena.start[0], BK.L.arena.start[1]); BK.sim(150);
      const b = BK.boss; if (b) { b.face = -1; BK.P.x = b.x - 70; BK.P.y = b.y; BK.P.face = 1;
        const go = (name, mode, t) => { b.sh = { x0: b.x, x1: b.x - 30 }; b.rl = { x0: b.x, x1: b.x + 40 }; b.mode = mode; b.modeT = t; b.face = -1; BK.step(1); snap('hm-' + name); };
        go('1-aim', 'aimTell', 0.2); go('2-netTell', 'netTell', 0.45); go('3-netThrow', 'netTell', 0.0); b.mode = 'loose'; b.modeT = 0.2; BK.step(1); snap('hm-3b-netThrow'); go('4-heavy', 'heavyTell', 0.1); go('5-hornTell', 'hornTell', 0.6); go('6-snareCrouch', 'snareTell', 0.3);
        go('7-snareHop', 'snareHop', 0.15); go('8-flurryTell', 'flurryTell', 0.25); go('9-flurry', 'flurry', 0.1); go('10-roll', 'roll', 0.2); go('11-roll2', 'roll', 0.12); go('12-open', 'open', 2); }
      res.push(['hm', b ? 'ok ' + b.t : 'no boss']); }
    return res; })()`);
  for (const [n, d] of r) { if (d.startsWith('data:')) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64')); else console.log(n, d); }
  console.log('shots', r.length);
} finally { pg.close(); }
