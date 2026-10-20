/* tools/marsh2-beats.mjs - MARSH WOOD'S TARGETED FIXES AND THE BULLFROG KING'S REWORK, pinned (claude/marsh2; scratch/brief-first2.md 2,
   brief-thinbosses.md FROG KING + !! 10-14 LATE). Node only. It fails when:
     - the rule line is not the one that names the pads ('PADS SINK. THE CHANNEL IS DEEP: PAY THE FERRYMAN OR DRAIN IT.')
     - THE SLUICE HOUSE (src/marsh2.js) is not the channel's third, required use: a sluice up the dam's ladder that drains the far basin to a mud bed,
       the route sent up to its gate (L.routeVia), no boards left over the far basin but the stair out, and a gar and an eel waiting in the drained mud
     - two signs stand on one tile, or the spitter sign stands more than a dozen columns short of the first spitter (it was stacked at 58, 33 short)
     - the crank, the ferryman, the ferry sluice, the sluice house's gate and the grove have no glint + stall nudge (src/stuck-spots.js)
     - the marsh's ranged foes are 30% or more of its foes, or it has fewer than three foe roles
     - THE BULLFROG KING lost a move: the tongue grab, the belly-flop, the fly swarm and its snap, the croak ripple and the slap must each have a told
       windup in updateFrog with the mark src/marks.js says (yellow ! for the shield's, red !! for the ones you jump or leave, none for the quiet swarm),
       its own pose (src/redraw/frogking.js frames 7-17), the 0.5x hide must stay (B15) and the plug drain at half (claude/firsthour).
   node tools/marsh2-beats.mjs */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LEVELS, T, TS } from '../src/level.js';
import { STUCK } from '../src/stuck-spots.js';
import { resolve } from '../src/stuck-guide.js';
import { MARK } from '../src/marks.js';
import { measure } from './level-quality.mjs';
const bad = [], ok = (c, m) => { if (!c) bad.push(m); }, out = [];
const lv = LEVELS.find(l => l.id === 'marsh'); assert(lv, 'no marsh');
const L = lv.build(), at = (x, y) => L.grid[y * L.W + x];
ok(lv.rule === 'PADS SINK. THE CHANNEL IS DEEP: PAY THE FERRYMAN OR DRAIN IT.', 'the rule line does not name the pads: ' + lv.rule);
ok(lv.needs === 'wood', 'the marsh must still follow the wood (the ferry transition): needs ' + lv.needs);
/* THE SLUICE HOUSE */
const sh = L.ents.find(e => e.t === 'sluice' && e.sluiceHouse);
ok(!!sh, 'no sluice house gate (a sluice with sluiceHouse)');
if (sh) {
  const pool = (L.pools || []).find(p => p.x0 === sh.pool * TS);
  ok(pool && pool.bottom !== undefined && !pool.shallow, 'the sluice house drains no deep basin with a bed');
  ok(pool && sh.to * TS + 4 < pool.bottom, 'the drained basin keeps no wading water over its bed');
  ok((L.routeVia || []).some(([x, y]) => Math.abs(x - sh.x) <= 1 && Math.abs(y - sh.y) <= 1), 'the route is not sent up to the gate (L.routeVia): the drain would be optional');
  const floor = 18; let climb = 0; for (let y = sh.y + 1; y < floor; y++) if (at(sh.x + 2, y) === T.NET) climb++;
  ok(sh.y <= 11 && climb >= 4, 'the gate is not up a ladder over the dam (row ' + sh.y + ', ' + climb + ' rungs)');
  if (pool) { const x0 = pool.x0 / TS, x1 = pool.x1 / TS; let boards = 0; for (let x = x0; x < x1 - 7; x++) for (let y = 13; y <= 18; y++) if ([T.PLANK, T.ONEWAY, T.REED].includes(at(x, y))) boards++;
    ok(boards === 0, 'boards still cross the far basin (' + boards + ' tiles): the drain is not needed');
    const waits = L.ents.filter(e => e.ifDrained === sh.pool); ok(waits.some(e => e.t === 'gar') && waits.some(e => e.t === 'eel'), 'nothing waits in the drained mud for a gar and an eel');
    out.push('SLUICE HOUSE gate ' + sh.x + ',' + sh.y + ' drains ' + x0 + '-' + (x1 - 1) + ' to row ' + sh.to + ', ' + waits.length + ' wait in the mud'); }
}
ok(L.ents.filter(e => e.t === 'sluice').length >= 3, 'the channel is not used three times (sluices: ' + L.ents.filter(e => e.t === 'sluice').length + ')');
/* SIGNS */
const signs = L.ents.filter(e => e.t === 'sign'), seen = new Map();
for (const s of signs) { const k = s.x + ',' + s.y; ok(!seen.has(k), 'two signs on one tile at ' + k); seen.set(k, s); }
const spSign = signs.find(s => /SPITTERS THROW IN ARCS/.test(s.text || '')), firstSpit = Math.min(...L.ents.filter(e => e.t === 'spit').map(e => e.x));
ok(spSign && spSign.x <= firstSpit && firstSpit - spSign.x <= 12, 'the spitter sign stands ' + (spSign ? firstSpit - spSign.x : '?') + ' columns short of the first spitter (' + firstSpit + ')');
/* GUIDES */
const env = { TS, props: L.ents.map(e => ({ ...e, x: e.x * TS + 8, y: (e.y + 1) * TS })), movers: [] };
const glints = (c, r) => { const g = resolve('marsh', c, r, env); return g ? g.targets.map(p => Math.floor(p.x / TS)) : []; };
const fer = glints(160, 17); ok(fer.includes(164) && fer.includes(165) && fer.includes(168), 'the ferry spot does not glint the crank, the sluice AND the ferryman: ' + fer);
ok(glints(345, 17).length && glints(347, 10).includes(347), 'the sluice house has no glint at its ladder and its gate');
ok(glints(380, 17).length, 'the grove crank / sluice has no glint');
ok((STUCK.marsh || []).every(s => !s.line || s.line.length <= 62), 'a marsh nudge runs past one line');
/* FOES */
const m = measure(lv); const foes = Object.values(m.roleCount || {}).reduce((a, b) => a + b, 0);
ok(m.roleKinds.length >= 3, 'fewer than three foe roles: ' + JSON.stringify(m.roleCount));
ok(foes && m.rangedN / foes < 0.3, 'ranged foes are ' + m.rangedN + ' of ' + foes + ' (>= 30%)');
out.push('foes: ' + JSON.stringify(m.roleCount) + ', ranged ' + m.rangedN + '/' + foes);
/* THE BULLFROG KING */
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), fn = src.slice(src.indexOf('function updateFrog('), src.indexOf("// THE QUEEN'S LINE (Highcrown)"));
for (const [mode, mark] of [['tongueTell', '!'], ['flopTell', '!!'], ['swarmTell', ''], ['snapTell', '!'], ['rippleTell', '!!'], ['poundTell', '!!'], ['crouch', '!'], ['spitTell', '!'], ['inhaleTell', '!']]) {
  ok(new RegExp("case '" + mode + "':").test(fn), 'the King has no ' + mode);
  ok(MARK['frog|' + mode] === mark, 'frog|' + mode + ' wears ' + JSON.stringify(MARK['frog|' + mode]) + ', not ' + JSON.stringify(mark)); }
const fr = src.match(/const FROG_FRAME = \{([^}]*)\}/); ok(!!fr, 'no FROG_FRAME (each move its own pose)');
if (fr) { const nums = [...fr[1].matchAll(/(\w+): (\d+)/g)].map(q => +q[2]); ok(new Set(nums).size >= 10 && Math.min(...nums) >= 7, 'the new moves share poses: ' + fr[1]); }
const art = readFileSync(new URL('../src/redraw/frogking.js', import.meta.url), 'utf8'); ok((art.match(/^\s*frame\(\{/gm) || []).length >= 18, 'src/redraw/frogking.js has fewer than 18 frames');
ok(/dmg = Math\.max\(1, Math\.round\(dmg \* 0\.5\)\)/.test(src) && /e\.t === 'frog' && !frogOpen\(e\)/.test(src), 'his hide (0.5x outside his openings) is gone');
ok(/function frogDrain\(/.test(src) && /drainAt: 0\.5/.test((existsSync(new URL('../src/frog-king.js', import.meta.url)) ? readFileSync(new URL('../src/frog-king.js', import.meta.url), 'utf8') : '')), 'his plug drain at half is gone');
if (bad.length) { console.log('marsh2-beats FAIL\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('marsh2-beats ok  ' + out.join('; '));
