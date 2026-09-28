/* evaluate an expression in the real page after loading Stormhold: node work/stormhold/probe.mjs "<expr>" */
import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; BK.load(M.LEVELS.findIndex(l => l.id === 'storm')); BK.start(); BK.god = true; BK.sim(120); return 1; })`);
  console.log(JSON.stringify(await pg.evalp(process.argv[2]), null, 1));
} finally { pg.close(); }
process.exit(0);
