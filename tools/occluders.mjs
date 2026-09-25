// tools/occluders.mjs — THE THING BY THE LENS BELONGS TO THE PLACE, AND IS NEVER INDOORS (level review, 2026-09-24).
//
// drawOccluders (src/main.js) crosses the frame every few screens with something close to the camera. It fell through
// to the FOREST's trunk-and-bough for every dress it had not named, so eight village and desert levels had a tree by
// the lens, and it never asked about rooms, so boughs hung inside the Folly's halls. The rule now lives in two
// places this reads out of main.js - the OCCLUDER table and occluderFor() - and this holds every built level to it:
//   a TREE only where the dress is the forest's (wood, camp, or none given: the first wood names no dress)
//   NOTHING inside any interior the level declares, nothing in a shop or a trial
//   an unnamed dress gets nothing (fail closed), and every kind the table names has its own drawing, with no
//   fall-through branch left to draw a tree for whatever arrives
// usage: node tools/occluders.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { LEVELS } from '../src/level.js';

const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const tab = MAIN.match(/\nconst OCCLUDER = (\{[^\n]*\});/), fn = MAIN.match(/\n(function occluderFor\(Lv, tx, ty\) \{[\s\S]*?\n\})/),
  draw = MAIN.match(/\nfunction drawOccluders\(cx, cy\) \{([\s\S]*?)\n\}/);
assert(tab && fn && draw, 'cannot read OCCLUDER, occluderFor or drawOccluders out of src/main.js');
const OCCLUDER = new Function('return ' + tab[1])();
const occluderFor = new Function('OCCLUDER', 'return ' + fn[1])(OCCLUDER);
const FOREST = new Set(['wood', 'camp']);   /* the dresses a tree by the lens belongs to - held HERE, not read from the table it judges */

// THE DRAWING: a branch per kind, keyed by kind, and no bare else to fall through to
const body = draw[1];
assert(/occluderFor\(L, /.test(body), 'drawOccluders does not ask occluderFor what to draw');
for (const k of new Set(Object.values(OCCLUDER))) assert(body.includes(`kind === '${k}'`), `OCCLUDER names '${k}' but drawOccluders has no drawing for it`);
assert(!/\}\s*else\s*\{/.test(body), 'drawOccluders has a bare else: whatever it was not told about falls through to one drawing');
assert(!/\bdress\b/.test(body), 'drawOccluders reads the dress itself instead of asking occluderFor');

// THE RULE BITES on made-up levels
{ const lv = (dress, extra) => ({ palette: { dress }, interiors: [], ...extra });
  assert.equal(occluderFor(lv('village'), 5, 5) === 'trunk', false, 'a village is given a tree');
  assert.equal(occluderFor(lv('moon'), 5, 5), null, 'an unnamed dress is given something (it must fail closed)');
  assert.equal(occluderFor(lv('wood', { interiors: [[2, 9, 2, 9, 'hall']] }), 5, 5), null, 'a room is given an occluder');
  assert.equal(occluderFor(lv('wood'), 5, 5), 'trunk', 'the wood lost its trunk');
  assert.equal(occluderFor(lv('wood', { shop: true }), 5, 5), null, 'a shop is given an occluder'); }

const bad = [], seen = {}; let rooms = 0;
for (const lv of LEVELS) { const L = lv.build(), p = L.palette || {}, dress = p.dress || p.set || 'wood';
  /* outdoors: a spot in no interior (the level's own columns, sampled) */
  let out = null; for (let x = 0; x < L.W && out === null; x += 7) for (let y = 0; y < L.H; y += 5) if (!(L.interiors || []).some(([x0, x1, y0, y1]) => x >= x0 && x <= x1 + 1 && y >= y0 && y <= y1 + 1.5)) { out = [x, y]; break; }
  const kind = out ? occluderFor(L, out[0], out[1]) : null;
  (seen[kind || 'none'] ||= []).push(lv.id);
  if (kind === 'trunk' && !FOREST.has(dress)) bad.push(`${lv.id}: a forest trunk by the lens on a '${dress}' level`);
  if ((L.shop || L.trial) && kind) bad.push(`${lv.id}: an occluder in a shop or a trial`);
  for (const [x0, x1, y0, y1] of (L.interiors || [])) { rooms++;
    for (const [tx, ty] of [[x0, y0], [x1, y1], [(x0 + x1) / 2, (y0 + y1) / 2], [x1 + 1, y1 + 1.5]]) { const k = occluderFor(L, tx, ty);
      if (k) { bad.push(`${lv.id}: a '${k}' drawn indoors, in the room ${x0}-${x1} x ${y0}-${y1}`); break; } } } }
assert.equal(bad.length, 0, bad.length + ' occluder(s) in the wrong place:\n  ' + bad.join('\n  '));
console.log(`occluders: ${LEVELS.length} levels, ${rooms} rooms; nothing indoors, a tree only in the forest. ` + Object.entries(seen).map(([k, v]) => k + ' ' + v.length).join(', '));
