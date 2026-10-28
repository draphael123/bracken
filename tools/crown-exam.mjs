/* tools/crown-exam.mjs — HIGHCROWN, pinned. Rewritten for HIGHCROWN 2 (claude/highcrown2, scratch/brief-highcrown2.md + scratch/review-highcrown.md) so a later merge
   cannot quietly lose the rework. (The 2026-09-28 crown2 pins - the bakehouse's temperer, the Captains Hall's javelineer, the whelp over the Leads' spikes, the
   exam before the Queen, redress2 wired - are kept; the drawbridge winch's hound and the siege-lines pin went with the road, and the winch teach moved to the bailey.)
   1. THE CUTS (one helper, cutColumns, applied last): the road up (0-230) and the armoury (488-587) are gone - 609 columns, the start inside the gatehouse
      passage, no forge, no smith's props, no 'forge' interior.
   2. a) HOLD THE WINCH GATE: the first rule teach, in the bailey's first thirty columns - a winch, its portcullis, a hound behind it, a sign before it.
   3. c) RING THE BELL YOURSELF: the ward bell is a LURE (a blow rings it); its alarm OPENS the barracks door, the ward key hangs inside the barracks (so
      the bell is a required use), and a GRATE BELL (a drop winch with a bell rope) hangs over the arch the barracks comes through, between the two.
   4. b) THE VESTIBULE EXAM: its sentry by the far gate rings as you come in (the grate drops behind you), with the elite marked into the alarm; the
      heavy elite holds the far gate; the shrine is just past it.
   5. d) ONE TALL HALL: no floor across the keep between the chapel's thick floor and the ground (rows 26-63); the hall bell at the stair head is a lure
      and its alarm's watch turns out on the stair side of its grate; the kitchen floor is gone (no hearthgob, folk or 'kitchen' interior in the keep).
   6. THE GOBLIN QUEEN (B15): her plate turns part of a blade (GREED.chipBy.gqueen >= 0.4), never all of it; she rings her own bell (gqRing); four chandeliers. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { pacing } from './pacing.mjs';
import { GREED } from '../src/boss-greed.js';
import { HC2 } from '../src/highcrown2.js';

const lv = LEVELS.find(l => l.id === 'crown');
const L = lv.build();
const at = (x, y) => L.grid[y * L.W + x];
const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* ---- 1. THE CUTS ---- */
assert.equal(L.W, 609, 'Highcrown is ' + L.W + ' columns: the road (231) and the armoury (100) cut from 940 leave 609');
assert(L.START.x >= 6 && L.START.x <= 10 && L.START.y === 63, 'the level does not start inside the gatehouse passage: ' + JSON.stringify(L.START));
for (const t of ['hotplate', 'anvil', 'hammer', 'boiler', 'cart', 'cascade']) assert(!L.ents.some(e => e.t === t), 'a ' + t + ' is still in Highcrown: the armoury and the road were cut');
assert(!L.ents.some(e => e.t === 'sign' && /ARMOURY|FURNACE LINE|OLD SIEGE LINES|THIS ROAD/.test(e.text || '')), 'a sign of the cut armoury or road is still standing');
assert(!(L.interiors || []).some(b => b[4] === 'forge'), 'a forge interior is left where the armoury was');

/* ---- 2. a) HOLD THE WINCH GATE ---- */
const winch = L.ents.find(e => e.t === 'winch' && !e.drop && e.x < 30);
assert(winch, 'no winch gate in the bailey\'s first thirty columns: the first rule teach (a)');
for (let y = winch.gy0; y <= winch.gy1; y++) assert.equal(at(winch.gate, y), T.PORT, 'the bailey gate (' + winch.gate + ') is not down across the way at row ' + y);
const hound = L.ents.find(e => e.t === 'hound' && e.x > winch.gate && e.x - winch.gate <= 6 && e.y === winch.y);
assert(hound, 'no hound behind the bailey gate (' + winch.gate + '): the gate drops on what is under it, and something must come through');
assert(L.ents.some(e => e.t === 'sign' && /WINCH/.test(e.text || '') && e.x < winch.x), 'no sign before the bailey winch');

/* ---- 3. c) RING THE BELL YOURSELF ---- */
const ward = (L.alarms || []).find(a => a.id === 'ward');
const lure = L.ents.find(e => e.t === 'bell' && e.section === 'ward');
assert(ward && lure && lure.lure, 'the ward bell is not a lure (a blow must RING it)');
assert(ward.opens && ward.opens.length, 'the ward alarm opens no door: the barracks must turn out of its own door');
const [door] = ward.opens; for (let y = door[1]; y <= door[2]; y++) assert.equal(at(door[0], y), T.PORT, 'the barracks door (' + door[0] + ') is not shut as laid');
const wkey = L.ents.find(e => e.t === 'key' && e.x > door[0] && e.x < ward.gates[0][0]);
assert(wkey, 'the ward key is not inside the barracks (between its door ' + door[0] + ' and the ward gate ' + ward.gates[0][0] + '): the bell is the required use');
const grate = L.ents.find(e => e.t === 'winch' && e.drop && e.bell && !e.bossGate && e.gate > lure.x && e.gate < door[0]);
assert(grate, 'no grate bell between the ward bell and the barracks door: the garrison must come under a grate you can drop on them (the Queen\'s move, small)');
assert(ward.garrison.every(g => g.x > door[0]), 'a ward garrison spawns outside the barracks');

/* ---- 4. b) THE VESTIBULE EXAM ---- */
const vest = (L.alarms || []).find(a => a.elites && a.wake), vsentry = vest && L.ents.find(e => e.t === 'sentry' && e.section === vest.id);
assert(vest && vsentry, 'no alarm with the elite marked into it (the vestibule), and its sentry');
const elite = L.ents.find(e => e.elite && e.t === 'heavy' && e.x >= vest.wake[0] && e.x <= vest.wake[1]);
assert(elite && typeof elite.gate === 'number' && elite.gate > elite.x, 'no heavy elite holding the vestibule\'s far gate');
assert(vest.gates.every(([c]) => c < vsentry.x - 8),'the vestibule\'s alarm grate is not behind the player');
assert(L.ents.some(e => e.t === 'check' && e.x > elite.gate && e.x - elite.gate <= 6), 'no shrine just past the vestibule\'s elite gate (' + elite.gate + ')');

/* ---- 5. d) ONE TALL HALL ---- */
const [K0, K1] = HC2.HALL;
for (let y = 26; y <= 63; y++) { let n = 0; for (let x = K0; x <= K1; x++) if (at(x, y) === T.SOLID) n++; assert(n < (K1 - K0 + 1) * 0.7, 'row ' + y + ' of the keep is a floor across it again (' + n + ' solid): one tall hall, not three corridors'); }
assert(!L.ents.some(e => ['hearthgob', 'folk'].includes(e.t) && e.x >= K0 && e.x <= K1 && e.y >= 26), 'the kitchen floor is back in the keep: the Kitchen Gate owns kitchens now');
assert(!(L.interiors || []).some(b => b[4] === 'kitchen'), 'a kitchen interior is left in the keep');
const hall = (L.alarms || []).find(a => a.id === 'hall'), hbell = L.ents.find(e => e.t === 'bell' && e.section === 'hall');
assert(hall && hbell && hbell.lure && hall.gates.length === 1, 'the hall bell is not a lure with one grate');
assert(hbell.x > hall.gates[0][0] && hall.garrison.every(g => g.x < hall.gates[0][0]), 'the hall bell must stand past its grate and its watch turn out on the stair side');
assert(L.ents.filter(e => e.t === 'weight' && e.lamp && e.x >= K0 && e.x <= K1).length >= 2, 'the hall has fewer than two chandeliers to cut down on the watch');

/* ---- 6. THE GOBLIN QUEEN ---- */
assert((GREED.chipBy.gqueen ?? GREED.chip) >= 0.4, 'B15: outside her openings the Goblin Queen takes ' + (GREED.chipBy.gqueen ?? GREED.chip) + 'x - the floor is 0.4');
assert(!/return; \} \} \/\/ her court's plate turns every blade/.test(mainSrc), 'her plate turns every blade again (main.js hurtEnemy0): B15');
assert(/function gqRing\(/.test(mainSrc) && /case 'ringTell'/.test(mainSrc), 'she no longer rings her own bell (gqRing / ringTell)');
assert.equal(L.ents.filter(e => e.t === 'weight' && e.gq).length, 4, 'the Queen\'s hall should hang four chandeliers (fewer openings)');

/* ---- 7. THE BAKEHOUSE'S OWN TEMPERER ---- */
const bakehouseSign = L.ents.find(e => e.t === 'sign' && /BAKEHOUSE YARD IS ALIGHT/.test(e.text));
assert(bakehouseSign, 'the bakehouse yard\'s own sign is gone');
const bakeTemp = L.ents.find(e => e.t === 'temperer' && e.x >= bakehouseSign.x && e.x < bakehouseSign.x + 70);
assert(bakeTemp, 'no temperer works a brazier in the bakehouse yard (' + bakehouseSign.x + '-' + (bakehouseSign.x + 70) + ')');

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
const spearSign = L.ents.find(e => e.t === 'sign' && /SPEAR THAT MISSES YOU AND HITS THE WALL/.test(e.text || ''));
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
assert(/crown:\s*\['rd',\s*'castle'\]/.test(mainSrc) && /undercrown:\s*\['rd',\s*'undercrown'\]/.test(mainSrc), 'main.js\'s REDRESS table no longer keys crown/undercrown to redress2.js\'s themes');
const rd2Src = readFileSync(new URL('../src/redraw/redress2.js', import.meta.url), 'utf8');
assert(!/Not wired in/i.test(rd2Src), 'src/redraw/redress2.js still says "Not wired in" though main.js wires it (crown, undercrown, mage, fallingtower, spire, the three shops): fix the comment, not the plumbing');

console.log('crown-exam  609 columns; winch gate ' + winch.gate + ' (hound ' + hound.x + '); ward bell lure ' + lure.x + ', grate ' + grate.gate + ', barracks door ' + door[0] + ', key ' + wkey.x + '; vestibule elite ' + elite.x + ' gate ' + elite.gate + '; hall grate ' + hall.gates[0][0] + '; bakehouse temperer at ' + bakeTemp.x + '; Captains Hall javelineer at ' + spearGuard.x + '; ' + whelps.length + ' whelp(s) over ' + spikeCols + ' spiked columns in ' + winds.length + ' wind zone(s); pacing before the Queen: ' + preExamStr + 'R; redress2 wired and its comment says so');
