/* tools/threat-holes.mjs — EVERY CREATURE YOU CAN PLACE HAS A WEIGHT. Node only: no page, no port, no Chrome.

   WHY THIS EXISTS. src/threat.js scores a level, and tools/curve.mjs adds a foe's weight with `if (w > 0)`. In
   JavaScript `undefined > 0` is false, so A CREATURE MISSING FROM THE TABLE IS SILENTLY WORTH NOTHING - it does not
   raise the threat, and it is not even counted as one of the level's kinds. The metric does not fail; it returns a
   smaller number with total confidence, and the campaign ramp is drawn from that number.

   IT HAS HAPPENED BEFORE. src/threat.js's own header records it: the table lived in two places and had drifted by
   TWENTY entries, "so every level that used them read easier in the tool than it is, and the difficulty ramp the tool
   printed was measured on a count that was short". That was fixed by making both importers share one table - which
   stops the two copies disagreeing, and does nothing at all about the table simply being INCOMPLETE. On 2026-09-23 it
   was incomplete by four rank-and-file foes: zombie (59 placements), bonegob (24), apprentice (23), husk (18) - 124
   placements across burial, mage, fallingtower, witchlight and undercrown, all worth zero, including the Burial
   Caverns' single most common enemy.

   THE RULE. Anything with health (main.js's EHP table) that a level actually places must have an ENTRY in THREAT.
   The entry may be 0 - a well, a captive and a practice dummy are all deliberately weightless - but it has to be
   written down, so that "worth nothing" and "nobody has weighed it" stop looking identical. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { THREAT } from '../src/threat.js';

/* WHAT COUNTS AS A CREATURE: it has health. EHP is main.js's own list and is not exported, so it is read from the
   source - which also means a creature added there is covered here the day it is added. */
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ehpLine = src.slice(src.indexOf('const EHP = {'));
const EHP = new Set([...ehpLine.slice(0, ehpLine.indexOf('};')).matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*:/g)].map(m => m[1]));
assert.ok(EHP.size > 80, 'only ' + EHP.size + ' creatures were read out of EHP: the parse has stopped working, and this check is now guarding nothing');

const placed = new Map();
for (const lv of LEVELS) {
  let L; try { L = lv.build(); } catch { continue; }
  const note = t => { if (!EHP.has(t)) return; const r = placed.get(t) || { n: 0, lv: new Set() }; r.n++; r.lv.add(lv.id); placed.set(t, r); };
  for (const e of L.ents || []) if (e && e.t) note(e.t);
  for (const A of (L.ambushes || [])) for (const w of (A.waves || [])) for (const [t] of w) note(t);
  for (const row of (L.garrison || [])) if (Array.isArray(row)) note(row[0]);
}

const holes = [...placed.entries()].filter(([t]) => THREAT[t] === undefined).sort((a, b) => b[1].n - a[1].n);
if (holes.length) {
  const lines = holes.map(([t, r]) => '    ' + t.padEnd(14) + String(r.n).padStart(4) + ' placed in ' + [...r.lv].join(', '));
  const total = holes.reduce((n, [, r]) => n + r.n, 0);
  assert.fail(holes.length + ' creature kinds are placed in levels and have NO entry in src/threat.js, so '
    + total + ' placements score zero in the campaign ramp and are not counted as kinds either:\n' + lines.join('\n')
    + '\n  Give each one a weight in src/threat.js. If it is genuinely worth nothing, write 0 - the point is that it is written down.');
}

const zeroed = [...placed.keys()].filter(t => THREAT[t] === 0).sort();
console.log('ok  threat-holes   ' + placed.size + ' creature kinds placed across ' + LEVELS.length + ' levels, every one weighed.'
  + (zeroed.length ? ' Deliberately 0: ' + zeroed.join(', ') + '.' : ''));
