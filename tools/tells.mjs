// THE MARK AUDIT.
// One yellow ! over a creature's head means a blow you can turn on the shield. Two red !! mean one you
// cannot. That is the only promise the game makes about defence, and it was typed by hand at every tell
// site - so it drifted: twelve single marks in red, one double in yellow, and the Queen's Lance showing a
// SOFT mark over a low sweep that no shield in the game will stop.
//
// This reads the creature update functions, works out for every mode whether the blow it throws is
// unblockable, then finds every place a mode is ENTERED with a mark over it and checks the mark agrees.
// Run it after touching any creature: node tools/tells.mjs
import { readFileSync } from 'fs';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const lines = src.split('\n');

const SOFT = '#ffd36b', HARD = '#ff6b6b';
// THE GUARD VOCABULARY, and nothing else. A creature says plenty over its own head - 'WHIRL', 'TOSSED',
// 'HE WILL GO DOWN WITH HER' - and that is narration: it tells you what just happened, in whatever colour
// suits it. Only these words are a PROMISE ABOUT YOUR SHIELD, and only these are audited. The word says how
// to get out of it; the colour says whether the shield is one of the ways.
const GUARD_WORDS = new Set(['!', '!!', '!!!', 'LOW', 'HIGH']);

// ---- 1. which modes throw a blow no shield turns ----
// A creature's update function is one `switch (e.mode)`, so a `case 'x':` runs to the next `case` at the
// same depth. A tell usually lands its blow at the moment it resolves, inside its own case; where it does
// not, the case it hands to is followed as well.
const funcs = [];
{
  const re = /^function (update[A-Za-z]+)\(/gm; let m;
  while ((m = re.exec(src))) {
    let i = m.index, d = 0, started = false, end = src.length;
    for (let k = i; k < src.length; k++) {
      const c = src[k];
      if (c === '{') { d++; started = true; }
      else if (c === '}') { d--; if (started && d === 0) { end = k; break; } }
    }
    funcs.push({ name: m[1], body: src.slice(i, end), at: i });
  }
}

const modeBlocks = new Map();     // "updateLance|sweep" -> source of that case
for (const f of funcs) {
  const re = /case '([A-Za-z0-9]+)':/g; let m; const hits = [];
  while ((m = re.exec(f.body))) hits.push({ mode: m[1], at: m.index });
  for (let i = 0; i < hits.length; i++) {
    const body = f.body.slice(hits[i].at, i + 1 < hits.length ? hits[i + 1].at : f.body.length);
    modeBlocks.set(f.name + '|' + hits[i].mode, body);
  }
}
// A WINDUP IS A CHAIN, and the blow is at the end of it: riseUp hands to stalk hands to plunge, and only
// the plunge hits you. Follow it while each link is FORCED - a block that sets exactly one next mode is a
// windup; one that sets several is a decision, and the chain stops there. (Following past a decision would
// walk the whole creature: everything eventually reaches 'pace', and 'pace' reaches everything.)
// THE HONESTY LIST. A windup whose blow is not thrown by the creature at all - the Forgemaster does not
// strike you, he HURLS A CART, and the cart is a mover that does its own unblockable damage somewhere else
// entirely. Nothing in the mode chain can see that, so it is written down rather than guessed at.
const THROWS_SOMETHING_ELSE = new Set(['updateForgemaster|hurlTell']);
const unblockable = key => {
  if (THROWS_SOMETHING_ELSE.has(key)) return true;
  const fn = key.split('|')[0];
  let mode = key.split('|')[1], seen = new Set();
  for (let hop = 0; hop < 5; hop++) {
    const body = modeBlocks.get(fn + '|' + mode);
    if (!body) return hop === 0 ? null : false;
    if (/unblockable: true/.test(body)) return true;
    if (/damagePlayer\(/.test(body)) return false;          // it lands its blow here, and a shield turns it
    const next = [...new Set((body.match(/e\.mode = '([A-Za-z0-9]+)'/g) || [])
      .map(h => h.match(/'([A-Za-z0-9]+)'/)[1]))].filter(m => m !== mode && !seen.has(m));
    if (next.length !== 1) return false;                    // a decision, not a windup
    seen.add(mode); mode = next[0];
  }
  return false;
};

// ---- 2. every place a mode is entered with a mark over it ----
const bad = [];
let checked = 0;
for (const f of funcs) {
  const lineStart = src.slice(0, f.at).split('\n').length;
  const bodyLines = f.body.split('\n');
  bodyLines.forEach((ln, i) => {
    // The mark is set in the same statement that enters the tell - and a line may enter two modes in a row
    // ("e.mode = 'swim'; if (...) { e.mode = 'lungeTell'; number(...) }"), so the mode that owns the mark is
    // the LAST one assigned before it, not the first one on the line.
    // and a line may carry TWO marks ("...swatTell...number('!')... else ...throwTell...number('!!')..."),
    // so every mark on the line is checked, each against the mode assigned nearest before it.
    const re2 = /number\([^)]*?'(!{1,2}|[A-Z][A-Z ']*)',\s*'(#[0-9a-f]{6})'/g; let mk;
    while ((mk = re2.exec(ln))) check(f, ln.slice(0, mk.index), mk[1], mk[2], lineStart + i);
  });
}
function check(f, before, word, col, line) {
  {
    const all = before.match(/e\.mode = '([A-Za-z0-9]+)'/g);
    if (!all) return;
    const mode = all[all.length - 1].match(/'([A-Za-z0-9]+)'/)[1];
    if (!GUARD_WORDS.has(word)) return;                  // narration, not a promise about the shield
    const hard = unblockable(f.name + '|' + mode);
    checked++;
    // THE TWO LEGAL PAIRS. A yellow ! or a red !! - nothing else is a mark. This part needs no analysis at
    // all: a red ! and a blue !! are ambiguous whatever the blow behind them turns out to be.
    const legal = (word === '!' && col === SOFT) || (word === '!!' && col === HARD) || (word === 'LOW' || word === 'HIGH');
    const verdict = hard === null ? '?' : hard ? 'UNBLOCKABLE' : 'blockable';
    if (!legal) bad.push({ f: f.name, mode, word, col, line, verdict, why: 'not one of the two marks' });
    else if (hard === true && col === SOFT) bad.push({ f: f.name, mode, word, col, line, verdict, why: 'SOFT MARK ON A BLOW NO SHIELD TURNS' });
    else if (hard === false && col === HARD) bad.push({ f: f.name, mode, word, col, line, verdict, why: 'hard mark on a blow you CAN turn' });
  }
}

console.log('== the mark audit ==');
console.log(checked + ' tells checked across ' + funcs.length + ' creature functions');
if (!bad.length) console.log('\nevery mark agrees with the blow behind it.');
else {
  const worst = bad.filter(b => b.why.startsWith('SOFT'));
  console.log('\n' + bad.length + ' mark(s) lie about the blow behind them (' + worst.length + ' of them the dangerous way):\n');
  for (const b of bad.sort((a, c) => (a.why < c.why ? -1 : 1)))
    console.log('  ' + (b.f + ' ' + b.mode).padEnd(32), ("'" + b.word + "' " + b.col).padEnd(20), (b.verdict || '?').padEnd(12), b.why);
}
process.exitCode = bad.length ? 1 : 0;
