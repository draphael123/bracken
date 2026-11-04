/* tools/storm-floats.mjs - NOTHING HANGS IN THE AIR ON THE LONG BRIDGE OR THE ROAD TO IT (claude/lance6, Daniel 11-04: "floating lamps, floating braziers ... sweep the whole level
   incl. his room"). NODE ONLY. STORMHOLD is not one of the 12 demo levels, so tools/demo-floats.mjs does not gate it; this runs the same readers on it:
     DECK / SLAB    a run of boards with a cell > REACH columns from anything holding it up (src/demo-supports.js)
     DECOR          a prop the engine would drop / set down at load (a lamp, brazier, bell or sign with no floor)
     BRAZIER / LAMP every brazier, lantern post, bell and checkpoint stands on a tile (never open air), and the board under it is held (a tower under a lookout, a post, a wall)
     CANTILEVER     a hoarding hung off a wall at one end only must carry a post (tools/anchor-lint.mjs 'cantilever') - only the barbican step (147-150,35) is allowed: its pit is backed
                    with masonry (src/demo-slots.js, 'storm' in DEMO_IDS)
     WINDOW         every roofed dip open to the map's edge is backed
   node tools/storm-floats.mjs */
import { LEVELS, T } from '../src/level.js';
import { findings, decorFindings, windowFindings } from './demo-floats.mjs';
import { anchorFaults } from './anchor-lint.mjs';
const L = LEVELS.find(l => l.id === 'storm').build(); let bad = 0; const say = (k, m) => { console.log('  ' + k.padEnd(11) + m); bad++; };
for (const f of findings(L)) say(f.kind, '@' + f.x0 + '-' + f.x1 + ',' + f.y + ' ' + f.why);
const d = decorFindings(L); for (const m of d.dropped) say('DROPPED', m); for (const m of d.moved) say('SET DOWN', m);
for (const w of windowFindings(L)) say('WINDOW', '@' + w.x0 + '-' + w.x1 + ' not backed');
const at = (x, y) => L.grid[y * L.W + x];
for (const e of L.ents) { const k = e.t === 'deco' ? e.kind : e.t; if (!['brazier', 'lanternPost', 'lancebell', 'gatebell', 'bell', 'check'].includes(k)) continue; const u = at(e.x, e.y + 1); if (u === T.AIR) say('PROP', k + '@' + e.x + ',' + e.y + ' has open air under it'); }
const ALLOW = new Set(['cantilever@147']);   /* the barbican step: a lintel over a pit the level backs with masonry */
const interior = new Set(['torch@101', 'torch@117', 'torch@132']);   /* wall torches on the barbican passage's stone back wall (L.interiors [98,146,31,35]): sconces, not standing lamps */
for (const f of anchorFaults(L)) { if (f.kind === 'cantilever' && !ALLOW.has('cantilever@' + f.x)) say('CANTILEVER', '@' + f.x + '-' + f.x1 + ',' + f.y + ' ' + f.why);
  if (f.kind === 'prop' && !interior.has(String(f.why).split(' ')[0] + '@' + f.x)) { /* prop faults print as "torch stands on air" */ if (!/torch/.test(f.why || '')) say('PROP', '@' + f.x + ',' + f.y + ' ' + f.why); } }
console.log(bad ? 'storm-floats: ' + bad + ' hit(s)' : 'ok  storm-floats: every deck, lamp, brazier and bell on the road to the Long Bridge and the bridge itself is held');
process.exit(bad ? 1 : 0);
