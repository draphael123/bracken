// tools/barriers-inventory.mjs - every barrier that closes a way, per level (claude/barriers). Not in the suite. node tools/barriers-inventory.mjs [-v]
import { LEVELS, T } from '../src/level.js';
import { kindOf } from '../src/exit-gates.js';
const tot = {};
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  let L; try { L = lv.build(); } catch (e) { console.log(lv.id + ': build failed ' + e.message); continue; }
  const cols = new Map();
  for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (L.grid[y * L.W + x] === T.PORT) { if (!cols.has(x)) cols.set(x, [y, y]); const c = cols.get(x); c[1] = y; }
  const n = t => L.ents.filter(e => e.t === t).length;
  const A = L.arena, M = L.mini;
  const row = { port: cols.size, lock: n('lockgate'), tide: n('tidegate'), winch: n('winch'), door: L.ents.filter(e => e.t === 'doorway' && e.needs).length,
    elite: L.ents.filter(e => e.gate !== undefined && e.elite).length, ambush: L.ents.filter(e => e.ambush).length, alarm: (L.alarms || []).length,
    seal: A ? A.boss : '', mini: M ? M.boss + (M.gate !== undefined ? '+gate' : '') : '' };
  for (const k of ['port', 'lock', 'tide', 'winch', 'door', 'elite', 'ambush', 'alarm']) tot[k] = (tot[k] || 0) + row[k];
  console.log(lv.id.padEnd(14) + kindOf(lv.id).padEnd(8) + Object.entries(row).filter(([k, v]) => v).map(([k, v]) => k + '=' + v).join(' ') + (process.argv.includes('-v') ? '  cols ' + [...cols].map(([x, c]) => x + ':' + c[0] + '-' + c[1]).join(' ') : ''));
}
console.log(JSON.stringify(tot));
