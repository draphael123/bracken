// PAGE TOOL: launches headless Chrome
/* tools/nightwalk-probe.mjs (claude/nightwalk) where the camera / view puts the hero in a boss fight (the still tool's overlay maps world to screen with it). BRACKEN_ROAD=ww,sk,mn,ac PORT=n node tools/nightwalk-probe.mjs <area> */
import { openPage } from './cdp.mjs';
const AREA = process.argv[2] || 'silk';
const pg = await openPage({ fonts: false, seed: 7 });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const out = [];
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === ${JSON.stringify(AREA)})); BK.state = 'play'; BK.god = true; BK.sim(40);
    const VW = BK.view.VW, VH = BK.view.VH; const A = BK.L.arena;
    const fd = () => { BK.step(1); const c = document.createElement('canvas'); c.width = BK.buf.width; c.height = BK.buf.height; const g = c.getContext('2d'); g.drawImage(BK.buf, 0, 0); return g.getImageData(0, 0, c.width, c.height); };
    const heroPos = () => { const a = fd(), sx = BK.P.x; BK.P.x += 4000; const b = fd(); BK.P.x = sx; let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) { const i = (y * a.width + x) * 4; if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) > 120) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } } return [x0, x1, y0, y1]; };
    const rec = tag => { const v = BK.view; out.push(tag + ' buf ' + BK.buf.width + 'x' + BK.buf.height + ' VW,VH ' + VW + ',' + VH + ' view.z ' + (+v.z).toFixed(3) + ' cam ' + Math.round(v.x) + ',' + Math.round(v.y) + ' P ' + Math.round(BK.P.x) + ',' + Math.round(BK.P.y) + ' expected hero px ' + Math.round(BK.P.x - v.x) + ',' + Math.round(BK.P.y - v.y) + ' drawn bbox ' + heroPos().join(',')); };
    rec('before fight'); BK.P.x = A.trigger + 30; BK.P.y = A.floor; BK.P.vx = BK.P.vy = 0; BK.sim(10); BK.P.x = A.trigger + 30; BK.sim(150); rec('arena +160f'); BK.sim(200); rec('+360f'); BK.sim(300); rec('+660f');
    return out; })()`, 300000);
  console.log(r.join('\n')); console.log('errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
