// PAGE TOOL: launches headless Chrome
/* tools/nightwalk-map.mjs (claude/nightwalk) the world map stretch Burial Caverns -> Mage's Folly with the four road flags on (BRACKEN_ROAD=ww,sk,mn,ac), every level cleared and ticked
   (the worst case for plates), one still per node + a keyed walk of the road with the real arrow keys. PORT=n OUT=<dir> node tools/nightwalk-map.mjs */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const OUT = process.env.OUT || 'scratch/lane-reports/nightwalk'; mkdirSync(OUT, { recursive: true });
const pg = await openPage({ fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.reset({ fresh: true });
    for (const l of LEVELS) BKT.PROG[l.id] = { cleared: true, medal: 3, silver: 7, quest: true };
    const res = [], info = {}; const shot = (id, name) => { if (!BK.mapLook(id)) { info[name] = 'no node'; return; } BK.step(40); const c = document.createElement('canvas'); c.width = BK.view.VW * 3; c.height = BK.view.VH * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    BK.mapLook('waymeet'); BK.step(60);
    for (const id of ['burial', 'wispwood', 'silk', 'manor', 'witchlight', 'academy', 'mage']) shot(id, 'map-' + id);
    const n = BK.mapNodes(); info.ids = n.ids.join(','); 
    /* the real keys: from burial, RIGHT/UP/DOWN... until mage, recording the node each press lands on */
    const settle = () => { for (let i = 0; i < 400; i++) { BK.step(1); const m = BK.map; if (!m.walking && !m.glide && i > 3) { BK.step(2); if (!BK.map.walking && !BK.map.glide) break; } } };
    const press = (id, key) => { BK.mapLook(id); BK.state = 'map'; BK.step(2); BK.press(key); settle(); const q = BK.mapNodes(); return q.ids[q.node]; };
    const road = ['burial', 'wispwood', 'silk', 'manor', 'witchlight', 'academy', 'mage'], fwd = {}, back = {};
    for (let i = 0; i < road.length; i++) { fwd[road[i]] = {}; for (const k of ['left', 'right', 'up', 'down']) fwd[road[i]][k] = press(road[i], k); }
    info.keys = fwd;
    return { res, info }; })()`, 300000);
  for (const [n, d] of r.res) writeFileSync(join(OUT, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(JSON.stringify(r.info, null, 1)); console.log('errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
