// tools/signs.mjs — A SIGN IS TWO LINES.
// Every sign opens the reading panel: 280 px of text at the press font, six pixels a character, so 46 characters a
// line, word-wrapped. A sign that wraps past two lines is a paragraph, and a player standing in a level reads the
// first line of a paragraph and walks on. This wraps every sign (and every hero's version of one) the way the
// panel does and fails any that runs to a third line.
//   node tools/signs.mjs            the failures, longest first
//   node tools/signs.mjs --all      every sign and its line count
import { LEVELS } from '../src/level.js';

const PER_LINE = 46, MAX_LINES = 2, HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper'];
const linesOf = s => { let n = 1, cur = 0;
  for (const w of String(s).split(' ')) { const add = (cur ? 1 : 0) + w.length; if (cur && cur + add > PER_LINE) { n++; cur = w.length; } else cur += add; }
  return n; };

const bad = [], all = [];
for (const lv of LEVELS) {
  if (!lv.build) continue;
  let L; try { L = lv.build(); } catch (e) { continue; }
  for (const e of L.ents || []) {
    if (e.t !== 'sign') continue;
    for (const k of ['text', ...HEROES]) {
      if (typeof e[k] !== 'string') continue;
      const n = linesOf(e[k]), row = { lv: lv.id, x: e.x, y: e.y, who: k, n, len: e[k].length, text: e[k] };
      all.push(row); if (n > MAX_LINES) bad.push(row);
    }
  }
}
if (process.argv.includes('--all')) for (const r of all) console.log(r.lv.padEnd(11), String(r.x).padStart(4), r.n, r.text);
if (bad.length) {
  for (const r of bad.sort((a, b) => b.len - a.len).slice(0, 40)) console.log((r.lv + ' @' + r.x + (r.who !== 'text' ? ' [' + r.who + ']' : '')).padEnd(22), r.n + ' lines', r.text.slice(0, 90) + (r.text.length > 90 ? '...' : ''));
  console.log('\n' + bad.length + ' of ' + all.length + ' signs run past ' + MAX_LINES + ' lines.');
  process.exitCode = 1;
} else console.log(all.length + ' signs, every one fits on ' + MAX_LINES + ' lines.');
