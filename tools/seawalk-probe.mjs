/* tools/seawalk-probe.mjs <levelId> <js expression> - evaluates an expression in the real page after loading the level (claude/seawalk2). Not in the suite. BRACKEN_LW3=1 / BRACKEN_CW3=1 for the flags. */
import { openPage } from './cdp.mjs';
const id = process.argv[2], expr = process.argv[3];
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  const r = await pg.evalp(`(() => { BK.load(__LV.findIndex(l => l.id === ${JSON.stringify(id)})); BK.start(); BK.god = true; BK.sim(30); return JSON.stringify(${expr}); })()`);
  console.log(r); console.log('errors', JSON.stringify((pg.errors || []).slice(0, 5)));
} finally { await pg.close(); }
