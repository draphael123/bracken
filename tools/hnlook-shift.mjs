// PAGE TOOL: launches headless Chrome
// tools/hnlook-shift.mjs - HOW FAR EACH LAYER MOVES PER FRAME while the hero walks (claude/hnlook): for a few screen bands, the best horizontal shift between frame t and t+1 (SAD) against the camera's own step.
//   node tools/hnlook-shift.mjs [col=177] [row=43] [frames=40] [hero=geomancer]   -> a table; a band that moves != the camera is a layer that swims (parallax) or shimmers (sub-pixel)
import { openPage } from './cdp.mjs';
const [COL = '177', ROW = '43', NF = '40', HERO = 'geomancer'] = process.argv.slice(2);
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1;
    BK.setHero(${JSON.stringify(HERO)}); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(60); BK.tp(${+COL}, ${+ROW}); BK.sim(200); BK.tp(${+COL}, ${+ROW}); BK.sim(30);
    const grab = () => { const b = BK.buf, c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const g = c.getContext('2d'); g.drawImage(b, 0, 0); return g.getImageData(0, 0, c.width, c.height).data; };
    const W = BK.buf.width, bands = { blobs: [0, 22], wallA: [60, 100], wallB: [105, 135], pillarFoot: [100, 130], floorTile: [150, 165] }; const out = [];
    const best = (a, b, y0, y1, x0, x1) => { let bd = 1e18, bs = 0; for (let s = -8; s <= 8; s++) { let d = 0; for (let y = y0; y < y1; y++) for (let x = Math.max(x0, x0 - s); x < Math.min(x1, x1 - s); x++) { const i = (y * W + x) * 4, j = (y * W + x + s) * 4; d += Math.abs(a[i] - b[j]) + Math.abs(a[i + 1] - b[j + 1]) + Math.abs(a[i + 2] - b[j + 2]); } if (d < bd) { bd = d; bs = s; } } return bs; };
    let prev = grab(), pv = BK.view.x; BK.keys.right = true;
    for (let f = 0; f < ${+NF}; f++) { BK.step(1); const cur = grab(), v = BK.view.x, row = { camDx: +(v - pv).toFixed(2) }; for (const [k, [y0, y1]] of Object.entries(bands)) row[k] = k === 'wallA' ? best(prev, cur, y0, y1, 100, 135) : k === 'wallB' ? best(prev, cur, y0, y1, 150, 185) : k === 'blobs' ? best(prev, cur, y0, y1, 60, 300) : best(prev, cur, y0, y1, 90, 230); out.push(row); prev = cur; pv = v; }
    return out; })()`, 600000);
  console.log('camDx  (shift of frame content = -camDx when a layer is world-anchored)'); for (const q of r.slice(5, 30)) console.log(JSON.stringify(q));
} finally { pg.close(); }
