// tools/signs.mjs — A SIGN IS TWO LINES.
// Every sign opens the reading panel: 280 px of text at the press font, six pixels a character, so 46 characters a
// line, word-wrapped. A sign that wraps past two lines is a paragraph, and a player standing in a level reads the
// first line of a paragraph and walks on. This wraps every sign (and every hero's version of one) the way the
// panel does and fails any that runs to a third line.
//   node tools/signs.mjs            the failures, longest first
//   node tools/signs.mjs --all      every sign and its line count
import { LEVELS, T } from '../src/level.js';
import { roundTopAt as lumberRoundTop } from '../src/redraw/lumber_trail_tiles.js';
/* (claude/tuskerfix, Daniel 10-21: a sign hung just over the Lumber Trail's fallen-giant stump) A SIGN STANDS ON A FLAT TOP. A kit whose art draws a cell's top below the tile
   top (a stump's cut face, a half-round log deck) registers it here; a sign whose foot cell is one of them floats in the picture though the tile test says it stands.
   Register a kit's rounded tops here when it has them (only the Lumber Trail's are drawn so today). */
const ROUND_TOPS = { wood: lumberRoundTop };

const PER_LINE = 46, MAX_LINES = 2, HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper'];
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
const floating = [];
for (const lv of LEVELS) { const rt = ROUND_TOPS[lv.id]; if (!rt || !lv.build) continue; let L; try { L = lv.build(); } catch (e) { continue; }
  for (const e of L.ents || []) { if (e.t !== 'sign') continue; const x = Math.round(e.x); let y = Math.round(e.y) + 1; while (y < L.H && L.grid[y * L.W + x] === T.AIR) y++;
    const why = y < L.H && !((e.sink || 0) >= 4) ? rt(x, y, L.grid[y * L.W + x], T) : null;   /* (a sign whose post is sunk into the top (sink >= 4 px) stands in it) */ if (why) floating.push(lv.id + ' @' + x + ',' + Math.round(e.y) + ': on ' + why + ' - it hangs over the curve (move it to flat ground or a flat top)'); } }
if (floating.length) { console.log('SIGNS OVER A ROUNDED TOP:' + floating.map(f => '\n  ' + f).join('')); process.exitCode = 1; } else console.log('every sign on a registered kit (' + Object.keys(ROUND_TOPS).join(', ') + ') stands on a flat top.');
if (process.argv.includes('--all')) for (const r of all) console.log(r.lv.padEnd(11), String(r.x).padStart(4), r.n, r.text);
if (bad.length) {
  for (const r of bad.sort((a, b) => b.len - a.len).slice(0, 40)) console.log((r.lv + ' @' + r.x + (r.who !== 'text' ? ' [' + r.who + ']' : '')).padEnd(22), r.n + ' lines', r.text.slice(0, 90) + (r.text.length > 90 ? '...' : ''));
  console.log('\n' + bad.length + ' of ' + all.length + ' signs run past ' + MAX_LINES + ' lines.');
  process.exitCode = 1;
} else console.log(all.length + ' signs, every one fits on ' + MAX_LINES + ' lines.');

/* ONE SENTENCE, ONE SIGN (the Sporewood rebuild, 2026-09-25). A sign says what stands beside IT. SPOREWOOD's strip pass rewrote every sign
   that mentioned a removed thing to the same sentence with one regex, so the glade, the canyon, the fork and the Mother's door all said
   "FOLLOW THE CAPS...", and nothing noticed: each one fitted on two lines. The level review found it by reading them. Now a level that says the
   same words on two signs fails. KNOWN, NOT FORGIVEN: a level named here is over the line today and belongs to other work; the check fails an
   entry that is no longer needed, so the list can only shrink. (Empty since the Hurricane's three split-deck signs were given a line each.) */
const SAME_KNOWN = new Map([
]);
const same = [], sameStale = [];
for (const lv of LEVELS) {
  if (!lv.build) continue;
  let L; try { L = lv.build(); } catch (e) { continue; }
  const seen = new Map();
  for (const e of L.ents || []) if (e.t === 'sign' && typeof e.text === 'string') seen.set(e.text, (seen.get(e.text) || []).concat(e.x));
  const dup = [...seen].filter(([, xs]) => xs.length > 1);
  if (dup.length && !SAME_KNOWN.has(lv.id)) for (const [t, xs] of dup) same.push(lv.id + ' @' + xs.join(',') + ': "' + t.slice(0, 80) + '"');
  if (!dup.length && SAME_KNOWN.has(lv.id)) sameStale.push(lv.id + ': no sign repeats any more - delete its SAME_KNOWN line in tools/signs.mjs');
}
for (const [id, why] of SAME_KNOWN) console.log('  known  ' + id.padEnd(10) + why);
if (same.length || sameStale.length) { for (const s of [...same, ...sameStale]) console.log('SAME SIGN  ' + s); process.exitCode = 1; }
else console.log('no level says the same sentence on two signs (' + SAME_KNOWN.size + ' known).');
