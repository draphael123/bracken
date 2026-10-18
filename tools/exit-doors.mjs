// tools/exit-doors.mjs - EVERY BOSS LEVEL HAS A WAY OUT YOU WALK TO (claude/exitgates2, 2026-10-18). Node only: no page, no port.
// A level with an arena ends one of three ways: the boss opens its gate and you walk to it (L.gateAfterBoss + one 'gate' ent: this file's rule),
// the Falling Tower's sanctum door, or the Stockade's burning-hall escape (L.escapeGate). Anything else wins the level where the boss fell - the
// 13 levels that did (audit 10-18) are what src/exit-doors.js fixes. DEFER lists the ones left on purpose, with the reason; a level that is not
// listed and not built right fails here. Also checked: ONE gate, standing on footing (3 wide) and 3 rows of air in its middle (the Underwell's ceiling is that low), past the arena's west
// wall, not on a spike, and the region has a landmark in src/exit-gates.js KIND_OF.
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { KIND_OF } from '../src/exit-gates.js';
install();
export const DEFER = {
  lamplit: 'reworked on claude/lamplit3', hurricane: 'reworks next week', flotilla: 'reworks next week',
  spire: 'its gate stands behind a spike gauntlet (design call)', witchlight: 'arena is a spike pit with drifting slabs: no footing for a door without a new ledge',
  harbor: 'off the map (shelved)',
};
const SOLID = new Set([T.SOLID, T.ONEWAY, T.CRATE, T.PLANK, T.SOFT, T.ICE, T.CRYST, T.SHELF, T.PALISADE]);
let bad = 0, ok = 0; const say = m => { console.log('  ' + m); bad++; };
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  const L = lv.build(), A = L.arena; if (!A) continue;
  if (DEFER[lv.id]) { console.log('  deferred ' + lv.id.padEnd(13) + DEFER[lv.id]); continue; }
  if (L.sanctum || L.escapeGate) { ok++; continue; }
  const gates = L.ents.filter(e => e.t === 'gate');
  if (gates.length !== 1) { say(lv.id + ': ' + gates.length + ' gate ents (want 1)'); continue; }
  if (!L.gateAfterBoss) { say(lv.id + ': a gate that the boss kill never opens (no gateAfterBoss): the level wins where he falls'); continue; }
  const g = gates[0], at = (x, y) => L.grid[y * L.W + x];
  if (g.x <= A.wallL) say(lv.id + ': the gate (' + g.x + ') stands outside the arena\'s west wall (' + A.wallL + ')');
  for (let d = -1; d <= 1; d++) { if (!SOLID.has(at(g.x + d, g.y + 1))) say(lv.id + ': no footing under gate column ' + (g.x + d)); if (at(g.x + d, g.y) === T.SPIKE) say(lv.id + ': spike under the gate'); }
  for (let k = 0; k <= 2; k++) if (at(g.x, g.y - k) !== T.AIR) say(lv.id + ': solid in the doorway at ' + g.x + ',' + (g.y - k));   /* (the middle column: the sprite is 3.5 tiles wide and beside a wall or a ledge it overlaps - that is how the Ksar's and the Church's stand) */
  if (!KIND_OF[lv.id]) say(lv.id + ': no landmark kind in src/exit-gates.js KIND_OF');
  ok++;
}
if (bad) { console.log('EXIT-DOORS: ' + bad + ' problem(s)'); process.exit(1); }
console.log('ok  exit-doors  ' + ok + ' boss levels end at a gate (or the tower door / the stockade escape) you walk to; the rest are deferred on purpose');
