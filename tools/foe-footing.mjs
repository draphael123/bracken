// tools/foe-footing.mjs - EVERY PLACED FOE STANDS ON SOMETHING (claude/bogtroll2; Daniel 11-01 live, THE FEN ROAD: "some STILTWALKERS stand in mushrooms / float in the air").
// Node only, a second. A walking foe placed at (x, y) has its feet on the top of row y + 1: that cell must be FOOTING (rock, a board, a deck, a crate...) and its own cell must be open
// (not inside rock). A foe that walks a BEAT (the stilt-walker: home +- beat tiles, plus a stride) must have footing under every column of it (or he stalls at an edge mid-step,
// a stilt planted on air), and no dressing (a deco: a stump, a hut, a pennant...) may stand inside that beat - his stilts walk through it. A horn's PACK (the crew it calls) is
// checked where it spawns. Flyers, swimmers (in the water by design), bosses and props are skipped. Movers count as footing where they rest.
//   node tools/foe-footing.mjs            THE FEN ROAD, strict (exit 1 on any red) + every other level REPORTED (report-only: counts per level, not a failure)
//   node tools/foe-footing.mjs <id> ...   only those levels, strict
import { LEVELS, T } from '../src/level.js';
import { readFileSync } from 'node:fs';
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const setOf = name => { const m = MAIN.match(new RegExp('const ' + name + ' = new Set\\(\\[([\\s\\S]*?)\\]\\);')); return new Set(m ? [...m[1].matchAll(/'(\w+)'/g)].map(x => x[1]) : []); };
const FLYERS = setOf('FLYERS'); for (const k of ['wasp', 'bat', 'hornet', 'stinger', 'swarm', 'honeyhornet', 'combdrone', 'vulture', 'raptor', 'hawkscout', 'kiterider', 'pinemoth', 'emberwisp', 'lanternshade', 'familiar', 'fogwraith']) FLYERS.add(k);
const SWIMS = new Set(['leech', 'eel', 'angler', 'siren', 'urchin', 'feeler', 'crab', 'turtle', 'gar', 'lurker']);
const NOT_FOE = new Set(['sign', 'check', 'deco', 'coin', 'coins', 'silver', 'sag', 'rotten', 'lashing', 'crewgap', 'broken', 'undertow', 'gate', 'lockgate', 'key', 'npc', 'shrine', 'vault', 'torch', 'brazier', 'lantern',
  'bell', 'seabell', 'sluice', 'capstan', 'pump', 'winch', 'lever', 'cage', 'stray', 'mover', 'nest', 'doorway', 'vent', 'relic', 'chest', 'heart', 'flask', 'spring', 'rope', 'ladder', 'door', 'plate', 'switch', 'pad', 'boulder', 'rock', 'barrel', 'crate', 'keg']);
const FOOT = new Set([T.SOLID, T.ONEWAY, T.CRATE, T.REED, T.PALISADE, T.PLANK, T.BOUNCER, T.SHELF, T.PORT, T.RAIL, T.SOFT, T.ICE, T.CRYST, ...Object.keys(T).filter(k => /^SLOPE/.test(k)).map(k => T[k])]);
/* WHAT IS A FOE: a creature with hit points (main.js EHP) or one of the goblin/creature kinds the level builder knows by name (src/level.js's copy-paste guard) - machines, traps and props are not */
const EHP_KEYS = (() => { const m = MAIN.match(/const EHP = \{([^\n]*)/); return new Set(m ? [...m[1].matchAll(/(\w+)\s*:/g)].map(x => x[1]) : []); })();
const LEVEL_SRC = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
const NAMED = (() => { const m = LEVEL_SRC.match(/if \(!\/\^\(([a-z|]+)\)\$\/\.test\(e\.t\)\) return true;/); return new Set(m ? m[1].split('|') : []); })();
const isFoe = t => (EHP_KEYS.has(t) || NAMED.has(t)) && !NOT_FOE.has(t);
const BODY = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.SOFT, T.ICE]);
const STRIDE = 18;   /* src/stilt-walker.js STILT.stride */
export function footing(L, id) {
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x], TS = 16, red = [];
  const movers = [...(L.movers || []), ...(L.moversExtra || [])];
  const onMover = (px, py) => movers.some(m => m && m.x !== undefined && px >= m.x && px <= m.x + (m.w || 16) && Math.abs((m.y0 !== undefined ? m.y0 : m.y) - py) <= 4);
  const footAt = (col, row) => FOOT.has(at(col, row));
  const decos = (L.ents || []).filter(e => e.t === 'deco' && !e.hang);
  const check = (who, x, y, px) => {   /* x, y: the ent's tile; px: its pixel x (a pack's) */
    const col = px !== undefined ? Math.floor(px / TS) : x, row = y + 1;
    if (!footAt(col, row) && !onMover(col * TS + 8, row * TS)) red.push(who + ' at ' + col + ',' + y + ': nothing under its feet (row ' + row + ' is ' + Object.keys(T).find(k => T[k] === at(col, row)) + ')');
    if (BODY.has(at(col, y))) red.push(who + ' at ' + col + ',' + y + ': stands inside rock'); };
  for (const e of L.ents || []) {
    if (!isFoe(e.t) || FLYERS.has(e.t) || SWIMS.has(e.t) || e.boss || e.perch || e.hang || e.fly || e.swim) continue;
    if (L.arena && e.t === L.arena.boss) continue;
    check(e.t, e.x, e.y);
    for (const d of decos) if (d.y === e.y && d.x === e.x && e.t !== 'stiltwalker') red.push(e.t + ' at ' + e.x + ',' + e.y + ': stands in dressing (' + d.kind + ' at ' + d.x + ')');
    if (e.t === 'stiltwalker') {
      const beat = (e.beat === undefined ? 3 : e.beat) * TS, hx = e.x * TS + 8, c0 = Math.floor((hx - beat - STRIDE) / TS), c1 = Math.floor((hx + beat + STRIDE) / TS);
      for (let c = c0; c <= c1; c++) if (!footAt(c, e.y + 1)) { red.push('stiltwalker ' + e.x + ': his beat runs off his footing at column ' + c + ' (beat ' + (beat / TS) + ': he stalls mid-step, a stilt on air)'); break; }
      for (const d of decos) if (d.y === e.y && d.x >= c0 - 1 && d.x <= c1 + 1) red.push('stiltwalker ' + e.x + ': dressing (' + d.kind + ' at ' + d.x + ') stands in his beat - his stilts walk through it');
      for (const p of e.pack || []) check('stiltwalker ' + e.x + "'s pack (" + p.t + ')', 0, Math.round(p.y / TS) - 1, hx + p.dx);
    }
  }
  return red;
}
const ids = process.argv.slice(2), strict = new Set(ids.length ? ids : ['fenroad']), all = ids.length ? LEVELS.filter(l => strict.has(l.id)) : LEVELS;
let fails = 0; const report = [];
for (const lv of all) { let L; try { L = lv.build(); } catch (err) { report.push(lv.id + ': (did not build: ' + err.message + ')'); continue; }
  const red = footing(L, lv.id);
  if (strict.has(lv.id)) { for (const r of red) console.log('RED  ' + lv.id + ': ' + r); fails += red.length; }
  else if (red.length) report.push(lv.id + ': ' + red.length + ' (' + red.slice(0, 2).join(' | ') + (red.length > 2 ? ' ...' : '') + ')'); }
if (report.length) { console.log('REPORT (not a failure; other levels):'); for (const r of report) console.log('  ' + r); }
if (fails) { console.log('FAIL foe-footing: ' + fails + ' placed foe(s) not on footing in ' + [...strict].join(', ')); process.exit(1); }
console.log('ok  foe-footing ' + [...strict].join(', ') + ': every placed foe on footing, every stilt-walker\'s beat on footing and clear of dressing, every horn pack on footing');
