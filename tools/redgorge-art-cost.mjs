// tools/redgorge-art-cost.mjs - ms per drawn frame in THE RED GORGE at a few spots (claude/redgorge-art). Not in the suite.
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'redgorge')); BK.state = 'play'; BK.god = true; BK.sim(4); const out = {};
    for (const [n, x, y] of [['mouth', 41, 165], ['bridge2', 30, 117], ['jam', 30, 69], ['summit', 20, 31], ['dam', 60, 21], ['rapids', 114, 218], ['climb', 56, 200], ['chute', 58, 189], ['nest', 70, 21]]) { BK.tp(x, y); BK.sim(10); BK.look(x, y); for (let i = 0; i < 20; i++) BK.step(1); const t0 = performance.now(); for (let i = 0; i < 120; i++) BK.step(1); out[n] = +((performance.now() - t0) / 120).toFixed(2); }
    return out; })()`, 300000);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
