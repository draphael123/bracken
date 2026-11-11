/* tools/gq3fix-ladder.mjs - GQ3FIX probe: does a hero climb the hatch ladder out of the burning tower onto the deck? (a measuring tool, not a check) */
import { openPage } from './cdp.mjs';
const hero = process.argv[2] || 'knight';
const pg = await openPage({ audio: false, fonts: false });
try { const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const out = [];
  BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { ${hero}: 1e6 }); BK.setHero('${hero}'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30);
  const L = BK.L, g = (x, y) => L.grid[y * L.W + x]; out.push(['tiles col792', [17,18,19,20,21,22,23,30,32,33].map(y => y + ':' + g(792, y)).join(' '), 'col793', [19,20,21,22].map(y => y + ':' + g(793, y)).join(' '), 'col791', [20,21,22].map(y => y + ':' + g(791, y)).join(' ')]);
  BK.tp(792, 28); BK.P.x = 792.5 * 16; BK.sim(10);
  for (let i = 0; i < 40; i++) { BK.keys.up = true; BK.keys.left = BK.keys.right = false; BK.P.hp = BK.P.maxHp; BK.sim(6); out.push([i, Math.round(BK.P.x), Math.round(BK.P.y), BK.P.ground ? 1 : 0, BK.P.climb ? 1 : 0, BK.P.onLadder ? 1 : 0]); }
  return out; })()`, 120000); console.log(d.map(r => JSON.stringify(r)).join('\n')); console.log(pg.errors.slice(0, 3)); } finally { await pg.close(); }
