// tools/sporeclear-locks.mjs - SPORECLEAR (claude/sporeclear): every bud / seed cap / spring of SPOREWOOD, cut out one at a time, and what EACH HERO (his own legs) can still reach. Node only.
//   A bud is NEEDED when no hero reaches the next shrine without it; it is a SHORTCUT when some hero does.   node tools/sporeclear-locks.mjs
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';
install();
const TS = 16, L = LEVELS.find(l => l.id === 'spore').build();
const checks = L.ents.filter(e => e.t === 'check').sort((a, b) => a.x - b.x), mother = L.ents.find(e => e.t === 'mother');
const target = x => { const c = checks.find(q => q.x > x); return c ? [c.x, c.y] : [mother.x, mother.y]; };
const copy = () => ({ ...L, grid: L.grid.slice(), moversExtra: (L.moversExtra || []).map(m => ({ ...m })), ents: L.ents.map(e => ({ ...e })) });
const caps = (L.moversExtra || []).filter(m => m.kind === 'growcap' && !m.mother);
let bad = 0;
const rows = [];
for (const m of caps) {
  const col = Math.round((m.bx !== undefined ? m.bx : m.x) / TS), C = copy();
  C.moversExtra = C.moversExtra.filter(q => !(q.kind === 'growcap' && (Math.abs((q.bx !== undefined ? q.bx : q.x) / TS - col) < 0.5 || (m.pair && q.pair === m.pair))));   /* (a seed pair is one lock) */
  const [tx, ty] = target(col), free = [];
  for (const h of HERO_MOVE_IDS) { const R = floodReach(C, T, { rides: true, glassBeds: true, hero: h }); if (R.near(tx, ty)) free.push(h); }
  rows.push({ col, kind: m.seed ? 'seed' : m.dark ? 'dark' : m.lean ? 'lean' : 'bud', free });
  console.log((free.length ? '  SKIP ' : '  need ') + String(col).padStart(3) + ' ' + (m.seed ? 'seed' : m.dark ? 'dark' : m.lean ? 'lean' : 'bud ') + (free.length ? '  passable without it: ' + free.join(',') : '  no hero passes'));
  if (free.length) bad++;
}
console.log('sporeclear-locks: ' + (bad ? bad + ' cap(s) a hero can skip' : 'every cap is needed by every hero'));
process.exitCode = bad ? 1 : 0;
