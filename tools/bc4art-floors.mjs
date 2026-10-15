// tools/bc4art-floors.mjs <x> ... : the floor rows (first solid under open air from row 24 down) of columns in the buried city. Not in the suite.
import { openPage } from './cdp.mjs';
const xs = process.argv.slice(2).map(Number); const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const L = LEVELS.find(l => l.id === 'buriedcity').build ? null : null; BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; const K = BK.buriedCity(), g = K.L.grid, W = K.L.W, H = K.L.H, A = 0;
  return ${JSON.stringify(xs)}.map(x => { const out = []; for (let y = 1; y < H; y++) if (g[y * W + x] !== 0 && g[(y - 1) * W + x] === 0) out.push(y); return x + ':' + out.join(','); }); })()`); console.log(r.join('\n')); } finally { pg.close(); }
