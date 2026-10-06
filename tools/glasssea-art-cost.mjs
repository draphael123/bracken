// tools/glasssea-art-cost.mjs - ms per drawn frame in THE GLASS SEA at a few spots (claude/glasssea art pass). Not in the suite.   usage: PORT=8678 node tools/glasssea-art-cost.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const t0 = performance.now(); BK.load(LEVELS.findIndex(l => l.id === 'glasssea')); const loadMs = Math.round(performance.now() - t0); BK.state = 'play'; BK.god = true; BK.sim(4); const out = { loadMs };
    for (const [n, x, y] of [['edge', 20, 33], ['field', 112, 33], ['crossing', 226, 33], ['obelisk', 322, 33], ['head', 366, 27], ['flats', 470, 33], ['cut', 515, 33], ['steps', 585, 30], ['arena', 612, 33]]) { BK.tp(x, y); BK.sim(10); BK.look(x, y); for (let i = 0; i < 20; i++) BK.step(1); const t = performance.now(); for (let i = 0; i < 60; i++) BK.step(1); out[n] = +((performance.now() - t) / 60).toFixed(2); }
    return out; })()`, 300000);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
