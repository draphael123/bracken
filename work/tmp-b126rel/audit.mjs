import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false, args: ['--js-flags=--expose-gc --max-old-space-size=2048'] });
try {
  const ids = await pg.evalp(`(async () => { window.__LV = (await import('/src/level.js')).LEVELS; BK.manualSimulation = true; BK.god = true; return __LV.map(l => l.id); })()`);
  for (let i = 0; i < ids.length; i++) {
    const t = Date.now();
    const r = await pg.evalp(`(() => { try { BK.load(${i}); BK.state = 'play'; BK.sim(5); BK.step(2); return 'ok ' + (performance.memory.usedJSHeapSize/1048576|0); } catch (e) { return 'ERR ' + e.message; } })()`, 25000).catch(e => 'TIMEOUT ' + e.message);
    const ms = Date.now() - t; if (!r.startsWith('ok') || ms > 1800 || i % 10 === 0) console.log(ids[i], r, ms + ' ms');
  }
  console.log('done', ids.length);
} finally { await pg.close(); }
