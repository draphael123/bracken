// work/mon3/dump.mjs - ASCII dump of THE MONASTERY's built grid (claude/monastery3-1105 lane helper). node work/mon3/dump.mjs [y0] [y1]
import { LEVELS, T } from '../../src/level.js';
const L = LEVELS.find(l => l.id === 'spire').build();
const y0 = +(process.argv[2] || 0), y1 = +(process.argv[3] || L.H - 1);
const ch = { [T.AIR]: ' ', [T.SOLID]: '#', [T.ONEWAY]: '=', [T.SPIKE]: '^', [T.PLANK]: '_', [T.NET]: 'H', [T.PORT]: '|', [T.CLIMB]: '%', [T.CRATE]: 'c' };
const em = { check: 'C', silver: '$', vent: 'v', tbell: 'B', pwheel: 'W', sign: 's', abbot: 'A', golem: 'G', lantern: 'l', coin: null, deco: null };
const out = [];
for (let y = y0; y <= y1; y++) { let r = ''; for (let x = 0; x < L.W; x++) r += ch[L.grid[y * L.W + x]] ?? '?'; out.push(r.split('')); }
for (const e of L.ents) { if (e.y < y0 || e.y > y1 || e.x < 0 || e.x >= L.W) continue; let c = em[e.t]; if (c === null) continue; if (c === undefined) c = (e.t[0] || '?').toLowerCase() === e.t[0] ? 'e' : 'E'; if (['harpy','fledgling','bat'].includes(e.t)) c = 'b'; out[e.y - y0][e.x] = c; }
out.forEach((r, i) => console.log(String(y0 + i).padStart(3) + ' ' + r.join('')));
