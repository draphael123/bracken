// tools/lit-church-cost.mjs - what THE LIT CHURCH's art costs a frame (claude/churchart; not in the suite): ms per drawn frame in the nave, the crypt, the organ gallery and beside THE PALADIN,
// against a plain level (the wood) in the same page. A ceiling, not a benchmark: it fails if a church spot draws slower than 3x the wood or over 25 ms.   usage: PORT=8742 node tools/lit-church-cost.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true }); const out = {};
    const time = (id, x, y, n = 120) => { BK.load(LEVELS.findIndex(l => l.id === id)); BK.state = 'play'; BK.god = true; BK.sim(4); BK.tp(x, y); for (let i = 0; i < 30; i++) { BK.sim(1); BK.step(1); } const t0 = performance.now(); for (let i = 0; i < n; i++) { BK.sim(1); BK.step(1); } return +((performance.now() - t0) / n).toFixed(2); };
    out.wood = time('wood', 20, 30); out.nave = time('church', 70, 36); out.gallery = time('church', 152, 18); out.crypt = time('church', 125, 53); out.sanctuary = time('church', 262, 40); out.paladin = time('church', 266, 40, 200); return out; })()`, 600000);
  console.log(JSON.stringify(r)); const base = Math.max(r.wood, 2), bad = Object.entries(r).filter(([k, v]) => k !== 'wood' && (v > 25 || v > base * 3)); console.log(bad.length ? 'SLOW: ' + bad.map(b => b.join('=')).join(' ') : 'ok  lit-church-cost  every church spot draws within 3x the wood and 25 ms');
  process.exitCode = bad.length ? 1 : 0;
} finally { pg.close(); }
