// THE MARK AUDIT.
// One yellow ! over a creature's head means a blow you can turn on the shield. Two red !! mean one you
// cannot. That is the only promise the game makes about defence, and it was typed by hand at every tell
// site - so it drifted: twelve single marks in red, one double in yellow, and the Queen's Lance showing a
// SOFT mark over a low sweep that no shield in the game will stop.
//
// This reads the creature update functions, works out for every mode whether the blow it throws is
// unblockable, then finds every place a mode is ENTERED with a mark over it and checks the mark agrees.
// It also finds the marks the first version could not see (a colour held in a constant, a !!! of three) and
// every windup ('...Tell') entered with NO mark at all.
// Run it after touching any creature: node tools/tells.mjs      (--json prints the findings for a fixer script)
import { readFileSync } from 'fs';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const JSON_OUT = process.argv.includes('--json');

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
// windup; one that sets several is a decision, and the chain stops there.
// THE HONESTY LIST. A windup whose blow is not thrown by the creature at all - the Forgemaster does not
// strike you, he HURLS A CART, and the cart is a mover that does its own unblockable damage somewhere else.
const THROWS_SOMETHING_ELSE = new Set(['updateForgemaster|hurlTell', 'updateForgemaster|dragTell',
  'updateCaptain|shootTell',        // capShoot: a shot seed, unblockable
  'updateCaptain|kegTell',          // the keg: a bomb, and a blast turns on no shield
  'updateTollmaster|tollTell',      // lead on a chain: noBlock
  'updatePitWarden|roofTell', 'updateForgemaster|anvilTell',   // hammer rocks: no shield turns the roof
  'updateForgemaster|breathTell',   // fires: the flame on the floor is unblockable
  'updateGQueen|chandTell',         // the chandelier: a crush
  'updateGrandmother|throwTell',   // her sticks fly noBlock
  'updateHillTroll|ripTell']);     // a crane stone, rolled along the floor: no shield turns it
// THE QUIET WINDUPS. A tell that throws NO blow at all - she listens, he calls, the square floods - wears no
// mark: a mark is a promise about your shield, and there is nothing here for the shield to do.
const NOT_A_BLOW = new Set(['updateTollmaster|floodTell', 'updateTollmaster|darkTell', 'updateLampreeve|snuffTell',
  'updateHerald|callTell', 'updateMiner|smashTell', 'updateWindcaller|howlTell', 'updatePropman|setTell',
  'updateForgemaster|leapTell', 'updateGolem|shroudTell', 'updateGQueen|gLeapTell', 'updateRoc|gustTell',
  'updateGrandmother|listenTell', 'updateGrandmother|vanishTell', 'updateLance|galeTell', 'updateSnuffer|snuffTell']);
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
const bad = [], unmarked = [], marks = [];
let checked = 0;
for (const f of funcs) {
  const lineStart = src.slice(0, f.at).split('\n').length;
  const bodyLines = f.body.split('\n');
  bodyLines.forEach((ln, i) => {
    // every mark on the line, each against the mode assigned nearest before it
    const re2 = /number\([^)]*?'(!{1,3}|[A-Z][A-Z ']*)',\s*('#[0-9a-f]{6}'|[A-Za-z_][A-Za-z0-9_.]*)\s*[,)]/g; let mk;
    while ((mk = re2.exec(ln))) check(f, ln.slice(0, mk.index), mk[1], mk[2], lineStart + i);
    // ---- 3. a windup entered with NO guard mark after it on its line ----
    const re3 = /e\.mode = '([A-Za-z0-9]+Tell)'/g; let tm;
    while ((tm = re3.exec(ln))) {
      const nextMode = ln.indexOf("e.mode = '", tm.index + 5), seg = ln.slice(tm.index, nextMode < 0 ? ln.length : nextMode);
      if (/number\([^)]*?'(!{1,3}|LOW|HIGH)'/.test(seg) || NOT_A_BLOW.has(f.name + '|' + tm[1])) continue;
      const hard = unblockable(f.name + '|' + tm[1]);
      unmarked.push({ f: f.name, mode: tm[1], line: lineStart + i, verdict: hard === null ? null : hard ? 'hard' : 'soft' });
    }
  });
}
function check(f, before, word, colRaw, line) {
  const all = before.match(/e\.mode = '([A-Za-z0-9]+)'/g);
  if (!all) return;
  const mode = all[all.length - 1].match(/'([A-Za-z0-9]+)'/)[1];
  if (!GUARD_WORDS.has(word)) return;                  // narration, not a promise about the shield
  const col = colRaw.startsWith("'") ? colRaw.slice(1, -1) : colRaw;
  const hard = unblockable(f.name + '|' + mode);
  checked++; marks.push({ f: f.name, mode, word, col });
  // THE TWO LEGAL PAIRS. A yellow ! or a red !! - nothing else is a mark: not a !!! of three, and not a colour
  // held in a constant, which says nothing a reader can check.
  const legal = (word === '!' && col === SOFT) || (word === '!!' && col === HARD) || (word === 'LOW' || word === 'HIGH');
  const verdict = hard === null ? '?' : hard ? 'UNBLOCKABLE' : 'blockable';
  if (!legal) bad.push({ f: f.name, mode, word, col, line, verdict, why: word === '!!!' ? 'a !!! is not one of the two marks' : col.startsWith('#') ? 'not one of the two marks' : 'a colour in a constant is not one of the two marks' });
  else if (hard === true && col === SOFT) bad.push({ f: f.name, mode, word, col, line, verdict, why: 'SOFT MARK ON A BLOW NO SHIELD TURNS' });
  else if (hard === false && col === HARD) bad.push({ f: f.name, mode, word, col, line, verdict, why: 'hard mark on a blow you CAN turn' });
}

if (JSON_OUT) { console.log(JSON.stringify({ bad, unmarked, marks })); process.exit(0); }
console.log('== the mark audit ==');
console.log(checked + ' tells checked across ' + funcs.length + ' creature functions');
if (!bad.length) console.log('\nevery mark agrees with the blow behind it.');
else {
  const worst = bad.filter(b => b.why.startsWith('SOFT'));
  console.log('\n' + bad.length + ' mark(s) break the rule (' + worst.length + ' of them the dangerous way):\n');
  for (const b of bad.sort((a, c) => (a.why < c.why ? -1 : 1)))
    console.log('  ' + (b.f + ' ' + b.mode).padEnd(32), ("'" + b.word + "' " + b.col).padEnd(24), (b.verdict || '?').padEnd(12), b.why);
}
if (unmarked.length) {
  console.log('\n' + unmarked.length + ' windup(s) entered with no mark at all:');
  for (const u of unmarked) console.log('  ' + (u.f + ' ' + u.mode).padEnd(34), 'line ' + String(u.line).padEnd(6), u.verdict ? (u.verdict === 'hard' ? 'wants !! (red)' : 'wants ! (yellow)') : 'blow not traced: mark by hand');
}
process.exitCode = bad.length ? 1 : 0;
