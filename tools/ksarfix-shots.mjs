// tools/ksarfix-shots.mjs - the Hawk-Mistress room ENTRY, door and mid-room, desktop and phone size (claude/ksarfix; not in the suite).
//   PORT=8908 node tools/ksarfix-shots.mjs <tag> [mobile]   -> work/ksarfix/<tag>-<size|desk|mobile|WxH>-<spot>.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'before', size = process.argv[3] || 'desk', mobile = size === 'mobile', WH = size.match(/^([0-9]+)x([0-9]+)$/), out = join(ROOT, 'work/ksarfix'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  if (mobile) await pg.evalp(`Object.defineProperty(window, 'innerWidth', { value: 915, configurable: true }); Object.defineProperty(window, 'innerHeight', { value: 412, configurable: true }); dispatchEvent(new Event('resize'))`);
  if (WH) await pg.evalp(`Object.defineProperty(window, 'innerWidth', { value: ${+WH[1]}, configurable: true }); Object.defineProperty(window, 'innerHeight', { value: ${+WH[2]}, configurable: true }); dispatchEvent(new Event('resize'))`);
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'ksar'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const A = BK.L.arena; res.push(['info', 'data:,' + encodeURIComponent(JSON.stringify({ arena: [A.x0 / 16, A.x1 / 16], trig: A.trigger / 16, floor: A.floor / 16, VW: BK.view.VW, VH: BK.view.VH, W: BK.L.W }))]);
    const R = A.floor / 16;
    /* THE WALK IN: from the rooftop door east, right held, a shot every few columns (the real entry: the camera clamp, the arena wall, the wake and its zoom) */
    BK.tp(A.x0 / 16 - 5, R - 1); run(90); BK.state = 'play'; BK.keys.right = true; const log = []; let k = 0;
    for (let f = 0; f < 700 && BK.P.x < A.x1 - 90; f++) { BK.sim(1); BK.step(1); const col = BK.P.x / 16, vw = BK.view.VW; const z = BK.view.z, hx = Math.round(vw / 2 + (BK.P.x - BK.view.x - vw / 2) * z); log.push({ col: Math.round(col), vw, z: +z.toFixed(2), heroScreenX: hx, onScreen: hx > 4 && hx < vw - 4 });
      if ((BK.P.x / 16 > 813.2 && BK.P.x / 16 < 816 ? f % 4 === 0 : f % 40 === 0) && k < 22) { snap('w' + String(k++).padStart(2, '0') + '-col' + Math.round(col) + '-vw' + vw + '-cam' + Math.round(BK.view.x / 16)); } }
    BK.keys.right = false; run(200); BK.state = 'play'; snap('z-mid');
    res.push(['log', 'data:,' + encodeURIComponent(JSON.stringify(log.filter((_, i) => i % 15 === 0)))]);
    return res; })()`, 400000);
  for (const [name, d] of r) { if (name === 'info' || name === 'log') { const t = decodeURIComponent(d.slice(6)); console.log(t); if (name === 'log') writeFileSync(join(out, tag + '-' + size + '-herox.json'), t); continue; } const f = join(out, tag + '-' + size + '-' + name + '.png'); writeFileSync(f, Buffer.from(d.split(',')[1], 'base64')); console.log(f); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
