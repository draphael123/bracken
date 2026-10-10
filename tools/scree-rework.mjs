// tools/scree-rework.mjs — THE SCREE PATH lives with its loose rock (src/scree-rework.js), proved in Node. The measured hole was
// INDEX 86 after Kingswood's 118, 2.9 foes a screen and zero hazard tiles; this holds the fix to its numbers.
// usage: node tools/scree-rework.mjs
import { LEVELS, T } from '../src/level.js';
import { THREAT, spanOf, indexOf, worstGap } from '../src/threat.js';
import { SCREE } from '../src/scree-rework.js';
import { BROKEN } from '../src/scree-chase.js';   /* (claude/scree2: the old scree steps are THE ROCKSLIDE CHASE's hillside now - its loose ledges and broken stone are counted there, the same rule) */
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const idx = id => { const R = LEVELS.find(l => l.id === id).build(); let threat = 0, foes = 0; const kinds = new Set(); let haz = 0;
  for (const e of R.ents) { const w = THREAT[e.t]; if (w > 0) { foes++; threat += w * (e.mini ? 2 : e.elite ? 3 : 1); kinds.add(e.t); } }
  for (const A of (R.ambushes || [])) for (const w of A.waves) for (const [t] of w) { const v = THREAT[t]; if (v > 0) { foes++; threat += v; kinds.add(t); } }   /* as tools/curve.mjs counts them */
  for (const v of R.grid) if (v === T.SPIKE) haz++;
  const span = spanOf(R.W, R.H); return { R, foes, haz, index: indexOf({ threat, kinds: kinds.size, hazTiles: haz, gap: worstGap(R.ents, R.W, R.H, R.arena), span }) }; };
const S = idx('scree'), K = idx('kings'), R = S.R, at = (x, y) => R.grid[y * R.W + x];
ok(S.index >= K.index - 8, `THE SCREE PATH at INDEX ${S.index}, within the act-opening step of Kingswood's ${K.index} (it was 86)`);
ok(S.foes / (R.W / 24) >= 3.2, `${(S.foes / (R.W / 24)).toFixed(1)} foes a screen (it was 2.9, the tutorial wood's)`);
ok(R.screeRework.loose >= 10, `THE GROUND GOES: ${R.screeRework.loose} tiles of loose rock over the scree`);
let shelves = 0; for (let y = 0; y < R.H; y++) for (let x = 0; x < R.W; x++) if (at(x, y) === T.SHELF) { shelves++; if (at(x, y + 1) === T.SOLID) ok(false, `loose rock at ${x},${y} sits on rock - it could not fall`); }
ok(shelves === R.screeRework.loose && R.looseRock, 'every loose tile hangs over air (or over broken stone), and the level draws them as stone');
ok(S.haz >= 10, `BROKEN STONE: ${S.haz} tiles where the scree and the gully put you down (it was 0)`);
ok(BROKEN.every(([x, row]) => at(x, row) === T.SPIKE && at(x + 1, row) === T.SPIKE && at(x + 2, row) !== T.SPIKE), 'each chute that drops a step ends on two tiles of it, never more: a jump clears it');
ok(R.ents.filter(e => e.t === 'rockfall').length >= 12, 'rock off the cliff over the low road: ' + R.ents.filter(e => e.t === 'rockfall').length + ' rockfalls');
for (const e of R.ents.filter(e => e.rework)) { const t = at(e.x, e.y + 1); if (!(t === T.SOLID || t === T.ONEWAY || t === T.SHELF || t === T.PLANK)) ok(false, `${e.t} at ${e.x},${e.y} stands on nothing`); }
ok(true, 'every foe the rework adds stands on footing');
console.log(fails ? `\n${fails} scree rework check(s) FAILED` : '\nall scree rework checks pass');
process.exit(fails ? 1 : 0);
/* SAVE BITS (coordinator, batch81): the silvers keep master's save indices - #0 the miller's (master 333,15, now 339,13 on the high ledges), #1 the hamlet's chimney (85), #2 the quarry's (master 456, +96 for the chase = 552) */
{ const sv = R.ents.filter(e => e.t === 'silver'); ok(sv.length === 3 && Math.abs(sv[0].x - 333) <= 10 && sv[1].x === 85 && sv[2].x === 552, 'scree silver save indices changed: ' + JSON.stringify(sv.map(e => [e.x, e.y]))); }
