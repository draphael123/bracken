// scratch: does THE LEADFOOT actually fire all three in the RUNNING game (A3)? Stand the hero on his floor, then
// over his head, then out at swimming range, and count the modes he enters. node work/claude/leadfoot-probe.mjs
import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  const r = await pg.evalp(`(() => {
    const i = __LV.findIndex(l => l.id === 'keep'); BK.load(i); BK.start(); BK.god = true; BK.sim(300);
    const out = {};
    for (const [tag, dx, dy] of [['on his floor', 2, 0], ['over his head', 0, -2], ['out at range', 7, -2]]) {
      const e = BK.enemies().find(q => q.t === 'leadfoot' && q.alive); if (!e) return { err: 'no leadfoot' };
      const seen = {};
      for (let k = 0; k < 900; k++) { BK.tp(Math.round(e.x / 16) + dx, Math.round(e.y / 16) - 1 + dy); BK.sim(1); seen[e.mode] = (seen[e.mode] || 0) + 1; }
      out[tag] = seen;
    }
    return out;
  })()`);
  console.log(JSON.stringify(r, null, 1));
} finally { pg.close(); }
