import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const out = [];
  BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.sim(5); const L = BK.L;
  for (let y = 10; y <= 22; y++) { let s = String(y).padStart(2) + ' '; for (let x = 776; x <= 836; x++) s += L.grid[y * L.W + x].toString(16); out.push(s); }
  out.push('ents ' + JSON.stringify(L.ents.filter(e => e.x >= 776 && e.x <= 836 && e.y < 22).map(e => e.t + '@' + e.x + ',' + e.y)));
  return out; })()`, 60000); console.log(d.join('\n')); } finally { await pg.close(); }
