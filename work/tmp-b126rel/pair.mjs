import { openPage } from '../../tools/cdp.mjs';
const seq = process.argv.slice(2);
const pg = await openPage({ audio: false, fonts: false, args: ['--js-flags=--expose-gc --max-old-space-size=2048'] });
try {
  const ids = await pg.evalp(`(async () => { window.__LV = (await import('/src/level.js')).LEVELS; BK.manualSimulation = true; BK.god = true; return __LV.map(l => l.id); })()`);
  for (const id of seq) { const i = ids.indexOf(id), t = Date.now();
    const r = await pg.evalp(`(() => { try { BK.load(${i}); BK.state = 'play'; BK.sim(5); BK.step(2); return 'ok'; } catch (e) { return 'ERR ' + e.message; } })()`, 20000).catch(e => 'TIMEOUT'); console.log(id, r, Date.now() - t, 'ms'); if (r === 'TIMEOUT') break; }
} finally { await pg.close(); }
