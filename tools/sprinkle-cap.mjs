// tools/sprinkle-cap.mjs - THE SPRINKLE CUT (Daniel, 2026-09-29, "FEWER, BETTER FOES": the garrison sprinkler filled open floor with a grid of
// foes and levels felt like "a dozen enemies, no challenge"). Node only, no page. For every level that has sprinkled foes (ents flagged
// garrison:true by src/level.js garrison(); a level placed wholly by hand has none and is left to its own design) it requires:
//   SCREEN CAP   no screen (SPRINKLE.screenW columns; on a tall level also SPRINKLE.screenH rows) holds more than SPRINKLE.screenCap sprinkled foes
//   AVERAGE CAP  no more than SPRINKLE.avgCap sprinkled foes per screen over the whole level (columns / screenW; a tall level rows / screenH)
//   DESIGNED     every SECTION (SPRINKLE.sectionW columns, or sectionH rows on a tall level) holds at least one DESIGNED encounter: a squad
//                (ents carrying squad:'<name>', never garrison) of a real kind, its members on one floor, none of them sprinkled
//   NO TOPIARY   the Folly's maze is gone: no sprinkled topiary
// The rule, and how to build the encounters, is docs/LEVEL-DESIGN-GUIDE.md section 2 (FEWER, BETTER FOES). Node tools/sprinkle-cap.mjs prints the
// per-level table (sprinkled, designed foes, encounters, worst screen); SPRINKLE_OUT=file.json keeps it.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { SPRINKLE } from '../src/foe-tactics.js';

const bad = [], rows = [], bare = [];
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  const L = lv.build(), tall = L.W < 220;
  const sp = L.ents.filter(e => e.garrison === true && !e.squad), sq = L.ents.filter(e => e.squad);
  const names = new Set(sq.map(e => e.squad));
  if (!sp.length && !sq.length) { rows.push([lv.id, 0, 0, 0, 0, 'by hand']); continue; }
  let worst = 0;
  for (const a of sp) for (const b of sp) { const n = sp.filter(p => p.x >= a.x && p.x < a.x + SPRINKLE.screenW && (!tall || (p.y >= b.y && p.y < b.y + SPRINKLE.screenH))).length; if (n > worst) worst = n; }
  const screens = tall ? L.H / SPRINKLE.screenH : L.W / SPRINKLE.screenW;
  if (worst > SPRINKLE.screenCap) bad.push(lv.id + ': ' + worst + ' sprinkled foes in one screen (cap ' + SPRINKLE.screenCap + ')');
  if (sp.length / screens > SPRINKLE.avgCap + 1e-9) bad.push(lv.id + ': ' + sp.length + ' sprinkled foes over ' + screens.toFixed(1) + ' screens is ' + (sp.length / screens).toFixed(2) + ' a screen (cap ' + SPRINKLE.avgCap + ')');
  const size = tall ? SPRINKLE.sectionH : SPRINKLE.sectionW, span = tall ? L.H : L.W;
  for (let s = 0; s < Math.max(1, Math.ceil(span / size)); s++) {
    const has = sq.some(e => { const v = tall ? e.y : e.x; return v >= s * size && v < (s + 1) * size; });
    const band = (L.squadBands || []).find(b => b.lo === s * size);   /* a section with NO ground to stand on (a boss arena, a calm, open water) is written down by the builder and cannot hold one */
    if (band && !band.spots && !has) { bare.push(lv.id + ' ' + (s + 1)); continue; }
    if (!has) bad.push(lv.id + ': section ' + (s + 1) + ' (' + (tall ? 'rows ' : 'columns ') + s * size + '-' + ((s + 1) * size - 1) + ') has no designed encounter (no squad ent)');
  }
  /* A FLYMAN is exempt from the one-floor test (claude/theatre3, A PINCER: a rigging-gallery thrower stands on the loading gallery ON PURPOSE, above the floor squad he belongs to; his ledge is the design, and moving him to its own squad would count him as a second encounter against the density bar). Every other member of the squad still has to share one floor. */
  for (const n of names) { const m = sq.filter(e => e.squad === n); if (new Set(m.filter(e => !e.flyman).map(e => e.y)).size > 1) bad.push(lv.id + ': squad ' + n + ' is not on one floor'); if (m.some(e => e.garrison)) bad.push(lv.id + ': squad ' + n + ' carries garrison:true (it is sprinkled, not designed)'); }
  if (sp.some(e => e.t === 'topiary')) bad.push(lv.id + ': sprinkled topiary (the maze is gone)');
  rows.push([lv.id, sp.length, sq.length, names.size, worst, screens.toFixed(1)]);
}
console.log('level        sprinkled  designed-foes  encounters  worst-screen  screens');
for (const r of rows) console.log(String(r[0]).padEnd(13) + String(r[1]).padEnd(11) + String(r[2]).padEnd(15) + String(r[3]).padEnd(12) + String(r[4]).padEnd(14) + r[5]);
if (process.env.SPRINKLE_OUT) writeFileSync(process.env.SPRINKLE_OUT, JSON.stringify(rows));
assert(rows.some(r => r[1] > 0), 'no level has any sprinkled foe: the check is measuring nothing');
if (bare.length) console.log('sections with no ground to stand a squad on (exempt): ' + bare.join(', '));
if (bad.length) { console.error('sprinkle-cap FAILED:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('sprinkle-cap ok: ' + rows.filter(r => r[1] > 0).length + ' levels within the cap, a designed encounter in every section');
