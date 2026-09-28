/* tools/crown-exam.mjs — HIGHCROWN, the design audit's plan (docs/level-design/wood-to-highcrown-design.md §12) and "GAME-WIDE PATTERNS
   WORTH FIXING ONCE" item 1 (the last stretch before a boss must be an exam, not a rest). Pins what claude/crown2 added 2026-09-28, so a
   later merge cannot quietly lose it:
   1. THE WINCH AS A WEAPON (plan 3). The drawbridge winch's gate (228, gate 236) drops on whatever stands under it - the sign always
      said so, and nothing ever did. A hound paces the gate's own column now.
   2. THE BAKEHOUSE IS ITS OWN PLACE (plan 2), not the siege lines again: a temperer works a brazier there and nowhere near the siege
      lines' own fire crossing.
   3. TWIST THE STUCK SPEAR (plan 1). The Captains Hall's middle balcony (one of the three falling-lamp ambushes) keeps its guard
      throwing, not dropping: a javelineer, not a soldier with `balcony:true`, so the level's own rule ("a spear that misses you and
      hits the wall stays there") is live in a fight room, not only taught on the road up.
   4. GARGOYLE WHELPS ONLY WHERE THERE ARE SPIKES (Daniel, 2026-09-28). Highcrown had no SPIKE tile before this: the Leads' own "pit if
      you miss the gutter" (a hero's fall already recovered from there) is spikes now, wound (src/spike-winds.js), with a whelp over it.
   5. THE LEADS ARE AN EXAM (plan 4 and the game-wide pattern): the pacing window right before the Queen's checkpoint holds more than
      rest and light. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { pacing } from './pacing.mjs';

const lv = LEVELS.find(l => l.id === 'crown');
const L = lv.build();
const at = (x, y) => L.grid[y * L.W + x];

/* ---- 1. THE WINCH AS A WEAPON ---- */
const winch = L.ents.find(e => e.t === 'winch' && e.x === 228);
assert(winch, 'the drawbridge winch (228) is still there');
const underGate = L.ents.find(e => e.t === 'hound' && Math.abs(e.x - winch.gate) <= 1 && e.y === winch.y);
assert(underGate, 'no hound paces the drawbridge winch\'s own gate column (' + winch.gate + '): the sign says the gate drops on what is under it, and nothing ever did (design audit plan 3)');

/* ---- 2. THE BAKEHOUSE'S OWN TEMPERER ---- */
const bakehouseSign = L.ents.find(e => e.t === 'sign' && /BAKEHOUSE YARD IS ALIGHT/.test(e.text));
assert(bakehouseSign, 'the bakehouse yard\'s own sign is gone');
const siegeSign = L.ents.find(e => e.t === 'sign' && /OLD SIEGE LINES/.test(e.text));
assert(siegeSign, 'the siege lines\' own sign is gone');
const bakeTemp = L.ents.find(e => e.t === 'temperer' && e.x > bakehouseSign.x && e.x < bakehouseSign.x + 70);
assert(bakeTemp, 'no temperer works a brazier in the bakehouse yard (' + bakehouseSign.x + '-' + (bakehouseSign.x + 70) + '): it is only the siege lines\' crossing again (design audit plan 2, GAME-WIDE PATTERN 6, repeated shapes)');
const siegeTemp = L.ents.find(e => e.t === 'temperer' && e.x > siegeSign.x && e.x < siegeSign.x + 80);
assert(!siegeTemp, 'a temperer stands in the siege lines too (' + (siegeTemp || {}).x + '): the brief keeps him "never in the forge hall" and out of the level\'s other fire crossing, so the bakehouse stays the one place he works');

/* ---- 3. TWIST THE STUCK SPEAR: THE CAPTAINS HALL ---- */
const capSign = L.ents.find(e => e.t === 'sign' && /CAPTAINS HALL/.test(e.text));
assert(capSign, 'the Captains Hall\'s own sign is gone');
const capWeights = L.ents.filter(e => e.t === 'weight' && e.unstable && e.x > capSign.x - 5 && e.x < capSign.x + 48).sort((a, b) => a.x - b.x);
assert.equal(capWeights.length, 3, 'the Captains Hall keeps its three falling lamps: ' + capWeights.map(e => e.x).join(' '));
const balconyGuards = capWeights.map(w => L.ents.find(e => (e.t === 'soldier' || e.t === 'javelin') && Math.abs(e.x - (w.x + 2)) <= 1 && e.y === 13));
assert(balconyGuards.every(Boolean), 'a balcony over the Captains Hall has lost its guard');
const spearGuard = balconyGuards.find(e => e.t === 'javelin');
assert(spearGuard && !spearGuard.balcony, 'no balcony guard in the Captains Hall is a javelineer who stands his ground and throws (design audit plan 1: "the balcony javelins throw at you"): ' + balconyGuards.map(e => e.t + (e.balcony ? '!balcony' : '')).join(' '));
assert.equal(balconyGuards.filter(e => e.t === 'soldier' && e.balcony).length, 2, 'the other two balconies keep their drop-on-you soldiers: this is one twist among three, not every balcony rewritten');
/* the level's own rule is taught on the road up (wall walk sign): the Captains Hall must be past it, so the spear is a REPEAT not a first sight */
const spearSign = L.ents.find(e => e.t === 'sign' && /SPEAR THAT MISSES YOU AND HITS THE WALL/.test(e.text));
assert(spearSign && spearSign.x < spearGuard.x, 'the wall-walk sign that teaches the stuck spear (' + (spearSign || {}).x + ') is not before the Captains Hall\'s javelineer (' + spearGuard.x + ')');

/* ---- 4. GARGOYLE WHELPS ONLY OVER SPIKES ---- */
const whelps = L.ents.filter(e => e.t === 'whelp');
assert(whelps.length >= 1, 'Highcrown has no whelp: "gargoyles on Highcrown\'s rooftops/battlements, only where there are spikes to stomp them onto" (Daniel, 2026-09-28)');
let spikeCols = 0; for (let x = 0; x < L.W; x++) if (at(x, 26) === T.SPIKE) spikeCols++;
assert(spikeCols >= 5, 'no real spread of SPIKE tiles on the Leads (row 26): ' + spikeCols + ' columns');
const winds = L.winds || [];
assert(winds.length >= 1, 'no L.winds zone: a hero (and a stuck whelp) who falls onto these spikes has no wind to carry them back - the same rule as the Witchlight Stair (src/spike-winds.js)');
for (const w of whelps) {
  let over = false; for (let dx = -4; dx <= 4; dx++) for (let d = 1; d <= L.H; d++) { const y = w.y + d; if (y >= L.H) break;
    if (at(w.x + dx, y) === T.SPIKE && winds.some(z => w.x + dx >= z.x0 && w.x + dx <= z.x1 && Math.abs(z.row - y) <= 1)) { over = true; break; } }
  assert(over, 'the whelp at ' + w.x + ',' + w.y + ' does not sit over a wind zone\'s spikes (within four columns, anywhere below) - it is stone anywhere else, so a stray whelp can never be brought down');
}
for (const z of winds) { assert((z.exits || []).length, 'a wind zone (' + z.x0 + '-' + z.x1 + ') has no exit: a fall or a stomp there has nowhere to carry a hero');
  for (let x = z.x0; x <= z.x1; x++) assert.equal(at(x, z.row), T.SPIKE, 'wind zone ' + z.x0 + '-' + z.x1 + ' claims row ' + z.row + ' but column ' + x + ' is not spiked'); }

/* ---- 5. THE LEADS ARE AN EXAM, NOT A REST (game-wide pattern 1) ---- */
const r = pacing(lv);
const strip = [...r.strip];
const bIdx = strip.lastIndexOf('B'); assert(bIdx > 0, 'no boss stretch found on the route');
let rIdx = bIdx - 1; while (rIdx > 0 && strip[rIdx] !== 'R') rIdx--;
const preExam = strip.slice(Math.max(0, rIdx - 10), rIdx);
const preExamStr = preExam.join('');
assert(/[PHFX]/.test(preExamStr), 'the ten stretches before the Queen\'s checkpoint (' + preExamStr + ') hold nothing but rest and light: no exam (game-wide pattern 1)');

/* ---- REDRESS2 IS WIRED (Daniel, 2026-09-28: verify in code, do not trust the audit twice-wrong "unwired") ---- */
const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert(/crown:\s*\['rd',\s*'castle'\]/.test(mainSrc) && /undercrown:\s*\['rd',\s*'undercrown'\]/.test(mainSrc), 'main.js\'s REDRESS table no longer keys crown/undercrown to redress2.js\'s themes');
const rd2Src = readFileSync(new URL('../src/redraw/redress2.js', import.meta.url), 'utf8');
assert(!/Not wired in/i.test(rd2Src), 'src/redraw/redress2.js still says "Not wired in" though main.js wires it (crown, undercrown, mage, fallingtower, spire, the three shops): fix the comment, not the plumbing');

console.log('crown-exam  hound under winch gate ' + winch.gate + '; bakehouse temperer at ' + bakeTemp.x + ' (none in the siege lines); Captains Hall javelineer at ' + spearGuard.x + '; ' + whelps.length + ' whelp(s) over ' + spikeCols + ' spiked columns in ' + winds.length + ' wind zone(s); pacing before the Queen: ' + preExamStr + 'R; redress2 wired and its comment says so');
