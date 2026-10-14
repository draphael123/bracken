// tools/ksar-sun.mjs - HP THE SUN COSTS PER OUTDOOR STRETCH OF THE KSAR, per hero (claude/ksarfix; report only, not in the suite).
//   A STRETCH = a maximal walk along the level's route (tools/pacing.mjs) out of shade (src/ksar.js shade boxes + rock overhead), timed at RUN pace
//   (src/sunstroke.js), costed with the real meter (walkCost: cool at the start - the shade before it resets it). hp = share of max health x the hero's max
//   health at the Ksar's campaign level. The drain starts 2 s out of the shade (SUN.drainAt x fill), so a stretch of 2 s or less is free.
//   node tools/ksar-sun.mjs [--all]       (--all lists every stretch; FIGHT = seconds of a duel added to each stretch for the 'fight' column, default the 12 longest)
import { LEVELS, T } from '../src/level.js';
import { SUN, walkCost } from '../src/sunstroke.js';
import { growthAt, HERO_IDS } from '../src/progression.js';
import { campaignLevel } from './boss-level.mjs';
import { pacing } from './pacing.mjs';
const FIGHT = 4, TS = 16, lv = LEVELS.find(l => l.id === 'ksar'), L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const CL = campaignLevel('ksar'), heroes = ['knight', 'warden', 'pyro', 'berserker'].filter(h => HERO_IDS.includes(h)), maxHp = Object.fromEntries(heroes.map(h => [h, growthAt(h, CL).hp]));
const pts = pacing(lv).route.filter(([x]) => x * TS < L.arena.x0), walk = [];
for (let i = 0; i + 1 < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], m = Math.max(1, Math.abs(x1 - x0)); for (let k = 0; k < m; k++) walk.push([x0 + Math.sign(x1 - x0) * k, k < m / 2 ? y0 : y1]); }
const shaded = (x, y) => { const px = x * TS + 8, py = (y + 1) * TS; if (L.shade.some(([x0, x1, y0, y1]) => px >= x0 && px <= x1 && py - 2 >= y0 && py - 2 <= y1)) return true; for (let d = 1; d <= SUN.roof; d++) if (at(x, y - d) === T.SOLID) return true; return false; };
const st = []; let start = null;
for (let i = 0; i < walk.length; i++) { const [x, y] = walk[i], sh = shaded(x, y); if (!sh && start === null) start = x; if ((sh || i === walk.length - 1) && start !== null) { st.push({ x0: start, x1: x, s: Math.abs(x - start) * TS / SUN.RUN }); start = null; } }
st.sort((a, b) => b.s - a.s); for (const s of st) { s.cost = walkCost(s.s); s.fight = walkCost(s.s + FIGHT); }   /* fight: the same stretch with FIGHT more seconds spent in it (a duel on the way) */
const totF = h => st.reduce((a, s) => a + s.fight * maxHp[h], 0), tot = h => st.reduce((a, s) => a + s.cost * maxHp[h], 0);
console.log(`KSAR SUN (campaign level ${CL}; max hp ${heroes.map(h => h + ' ' + maxHp[h]).join(', ')}); route ${walk.length} tiles, ${st.length} sun stretches, ${L.shade.length} shade boxes`);
console.log(`stretch > 2 s (the drain's start): ${st.filter(s => s.s > 2).length}; > 3 s: ${st.filter(s => s.s > 3).length}; longest ${st[0] ? st[0].s.toFixed(1) : 0} s; walk in sun total ${st.reduce((a, s) => a + s.s, 0).toFixed(1)} s`);
console.log('stretch (cols)        secs   %max   fight%  ' + heroes.map(h => h.padEnd(9)).join(''));
for (const s of (process.argv.includes('--all') ? st : st.slice(0, 12))) console.log(`${String(s.x0).padStart(4)}-${String(s.x1).padEnd(4)}`.padEnd(20) + s.s.toFixed(1).padStart(5) + (s.cost * 100).toFixed(1).padStart(7) + (s.fight * 100).toFixed(1).padStart(8) + '   ' + heroes.map(h => (s.cost * maxHp[h]).toFixed(1).padEnd(9)).join(''));
console.log('TOTAL hp over every stretch (each from cool): ' + heroes.map(h => h + ' ' + tot(h).toFixed(1)).join('  ') + '   | worst single stretch: ' + heroes.map(h => h + ' ' + (st[0] ? (st[0].cost * maxHp[h]).toFixed(1) : 0)).join('  '));
console.log('IF YOU SPEND ' + FIGHT + ' s FIGHTING IN EACH STRETCH: mean hp per stretch ' + heroes.map(h => h + ' ' + (totF(h) / st.length).toFixed(1)).join('  ') + '   | worst stretch ' + heroes.map(h => h + ' ' + Math.max(0, ...st.map(s => s.fight * maxHp[h])).toFixed(1)).join('  '));
console.log('JSON ' + JSON.stringify({ stretches: st.length, over2: st.filter(s => s.s > 2).length, over3: st.filter(s => s.s > 3).length, longest: st[0] && +st[0].s.toFixed(2), sunSecs: +st.reduce((a, s) => a + s.s, 0).toFixed(1), total: Object.fromEntries(heroes.map(h => [h, +tot(h).toFixed(1)])), meanFight: Object.fromEntries(heroes.map(h => [h, +(totF(h) / st.length).toFixed(1)])), worst: Object.fromEntries(heroes.map(h => [h, st[0] ? +(st[0].cost * maxHp[h]).toFixed(1) : 0])) }));
