// PAGE TOOL: launches headless Chrome
// tools/resinfix-shots.mjs - claude/resinfix: same spots across THE HORNET'S NEST + the Queen's hall. TAG=before|after OUT=<dir>
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUT, TAG = process.env.TAG || 'after'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = [];
    const load = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(60); };
    const snap = name => { BK.step(1); const b = BK.buf, z = 3, c = document.createElement('canvas'); c.width = b.width * z; c.height = b.height * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    const hold = (col, row, n = 90) => { for (let k = 0; k < n; k++) { if (k % 30 === 0) BK.tp(col, row); BK.sim(1); } };
    load();
    const spots = [['01-start', 6, 33], ['02-cells', 100, 29], ['03-waxfloor', 150, 27], ['04-gallery', 185, 28], ['05-gallery2', 205, 28], ['06-well', 336, 37], ['07-well-top', 336, 22], ['08-brood', 280, 7]];
    for (const [n, c, r] of spots) { hold(c, r); snap(n); }
    /* the hall */
    const HQM = await import('/src/hornet-queen.js'); BK.tp(401, 21); BK.sim(120); const QH = BK.hornetQueenHands(), S = QH.show(), e = BK.boss;
    snap('09-hall-p1');
    if (e) { S.ward = 0; e.ward = 0; S.cloak = 0; e.cloak = 0; e.mode = 'tearTell'; e.modeT = 0; BK.sim(40); BK.sim(160); hold(401, 21, 40); snap('10-hall-p2-flood'); BK.sim(200); snap('11-hall-p2-b'); }
    return shots; })()`, 600000);
  for (const [n, d] of r) writeFileSync(join(out, TAG + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.length + ' shots', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
