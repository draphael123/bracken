// tools/towpath-art-shots.mjs - THE TOWPATH 2's ART SHOTS (claude/towpath2art; not in the suite): teleports a god-mode hero to each set piece of the level and writes a PNG of the
// canvas to work/claude/towpath2art/. Scoped: `PORT=8923 node tools/towpath-art-shots.mjs [name,name,...]` (default: all). One headless page.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const want = (process.argv[2] || '').split(',').filter(Boolean);
/* name: [design col, design row, { lit, drain: lockId, sim, extra js }] */
const SPOTS = {
  start: [6, 33], lychgate: [14, 33], hut: [41, 37, { lit: 1 }], lockA: [47, 37, { lit: 1 }], upper: [62, 33], cottage: [72, 28],
  wheel: [97, 33, { lit: 1 }], mill: [118, 26], sackfloor: [118, 18], gantry: [129, 18], millexam: [150, 19],
  f1: [163, 19, { lit: 1 }], f2: [173, 14], f3: [191, 4, { lit: 1 }], flight: [200, 4], tower: [222, 3], towertop: [220, -3],
  aqwest: [244, 5], aqbreak: [262, 3], aqsluice: [244, 5, { js: "TH.sluice('aq', true); BK.sim(240);" }], aqacross: [244, 5, { js: "TH.sluice('aq', true); BK.sim(900);" }], aqeast: [284, 5],
  arches: [303, 13, { lit: 1 }], archesdim: [318, 18], basinw: [326, 19], basinsq: [336, 19, { lit: 1 }], sunk: [353, 19, { lit: 1 }], crane: [366, 19, { lit: 1 }], cranerise: [366, 19, { js: "TH.jib('jib'); BK.sim(160);" }], roofs: [376, 2], alley: [381, 12],
  lastlock: [391, 16], xfloor: [396, 26, { lit: 1, js: "TH.work('X'); BK.sim(500);" }], xfloordim: [396, 26, { js: "TH.work('X'); BK.sim(500);" }], culvert: [408, 25], y: [415, 26], cut: [430, 13], arena: [452, 13, { lit: 1 }], arenalock: [481, 13],
};
const pg = await openPage({ audio: false, fonts: false });
try {
  const names = want.length ? want : Object.keys(SPOTS);
  const dir = join(ROOT, 'work', 'claude', 'towpath2art'); mkdirSync(dir, { recursive: true });
  for (const n of names) { const sp = SPOTS[n]; if (!sp) { console.log('no spot', n); continue; } const [c, r, o = {}] = sp;
    const r2 = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js');
      BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'towpath')); BK.state = 'play'; BK.god = true; BK.sim(5);
      const TH = BK.towpathHands(), O = BK.towpath().D.O; BK.tp(${c}, ${r} + O); BK.sim(80);
      TH.setLantern(BK.P, true, ${o.lit ? 'true' : 'false'}); ${o.js || ''} BK.sim(20); BK.step(1); BK.step(1);
      return document.querySelector('canvas').toDataURL('image/png'); })()`);
    writeFileSync(join(dir, n + '.png'), Buffer.from(r2.split(',')[1], 'base64')); console.log('shot', n); }
  const errs = pg.errors || []; if (errs.length) console.log('PAGE ERRORS', errs.slice(0, 4).join(' | '));
} finally { pg.close(); }
