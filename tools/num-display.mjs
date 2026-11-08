/* tools/num-display.mjs - THE HEALTH / DAMAGE DISPLAY RULE (claude/hpdisplay, Daniel 11-07, scratch/lane-reports/hpscale.md option A). Node only, no browser.
   Every number the player READS for health or damage is the internal number / 10 (src/num-display.js): one decimal under 10, whole at 10+, a real amount never 0.
   Internals do not move; this tool pins the helper, that the readouts go through it, and the written boss ceiling (no boss above 5,000 base HP). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { shownHp, shownDmg, shownLabel, SHOW_DIV } from '../src/num-display.js';
import { CARD } from '../src/progression.js';
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
assert.equal(SHOW_DIV, 10);
const T = [[0, '0'], [0.3, '0.1'], [1, '0.1'], [2, '0.2'], [5, '0.5'], [11, '1.1'], [25, '2.5'], [88, '8.8'], [90, '9'], [95, '9.5'], [99, '9.9'], [100, '10'], [114, '11'], [151, '15'], [409, '41'], [3900, '390'], [24000, '2400'], [-14, '-1.4']];
for (const [n, s] of T) assert.equal(shownHp(n), s, 'shownHp(' + n + ')');
assert.equal(shownDmg(54), '5.4'); assert.equal(shownDmg(108), '11');
assert.equal(shownLabel(108, '#fff6e0'), '11', 'a number floater is damage'); assert.equal(shownLabel('-14', '#ff6b6b'), '-1.4', 'a signed digit string is damage'); assert.equal(shownLabel('+28', '#8fd160'), '+2.8', 'a heal');
assert.equal(shownLabel(25, '#ffd34a'), '25', 'coin gold is not health'); assert.equal(shownLabel('3', '#ffd36b'), '3', 'a countdown is a count'); assert.equal(shownLabel('BLOCKED', '#fff'), 'BLOCKED'); assert.equal(shownLabel('-5 GOLD', '#ffd34a'), '-5 GOLD');
const main = rd('src/main.js');
for (const [re, why] of [[/text\(String\(Math\.max\(0, Math\.ceil\((P|p)\.hp\)\)\)/, 'a raw hero HP readout is back'], [/text\(String\(n\.txt\)/, 'a floater draws the raw internal number']]) assert.ok(!re.test(main), why);
for (const s of ['NDSP.shownHp(Math.max(0, P.hp))', 'NDSP.shownHp(Math.max(0, p.hp))', 'NDSP.shownHp(c) + \'/\' + NDSP.shownHp(Math.ceil(max))', 'text(numTxt(n), px,', "desc: '+' + NDSP.shownHp(25) + ' max health'"]) assert.ok(main.includes(s), 'main.js lost: ' + s);
assert.ok(CARD.find(k => k.id === 'v').what === '+0.8 HEALTH' && !/\d/.test(CARD.find(k => k.id === 'm').what), 'VIGOR reads /10, MIGHT hides its number: ' + CARD.map(k => k.what));
assert.equal(CARD.find(k => k.id === 'v').hp, 8, 'the internal VIGOR number did not move'); assert.equal(CARD.find(k => k.id === 'm').damage, 1);
assert.ok(/NO BOSS ABOVE 5,000 BASE HP/.test(rd('RULES-LEVELS-AND-BOSSES.md')), 'the boss ceiling rule is written (A13)');
console.log('num-display ok: shownHp table (' + T.length + '), floater labels (gold/counts/words untouched), hero + co-op + boss readouts routed, VIGOR /10 and MIGHT hidden, internals unchanged, boss ceiling written');
