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
import { readFileSync, writeFileSync } from 'fs';
import { THROWN as THROWS_SOMETHING_ELSE, QUIET as NOT_A_BLOW, BY_HAND, MARK } from '../src/marks.js';   // THE HONESTY LIST, THE QUIET WINDUPS and the table the screen reads: src/marks.js

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

// ---- 4. THE TABLE THE SCREEN READS (src/marks.js MARK) ----
// The mark that stays over a windup is drawn from MARK, keyed by creature and mode. It is written from exactly what
// this audit has just established - the mark each tell calls (checked above), or where it calls none the blow at the
// end of its chain - so the screen can only show a mark this tool agrees with. Who owns which update function is read
// off the dispatch: every `updateX(e, dt)` call and the `e.t === '...'` tests in front of it on its line.
const tableProblems = [];
const owners = new Map(), inherit = [];
{
  const re = /\b(update[A-Z][A-Za-z]*)\(e, dt\)/g; let m;
  while ((m = re.exec(src))) {
    if (src.slice(Math.max(0, m.index - 9), m.index) === 'function ') continue;
    const fn = m[1], lineAt = src.lastIndexOf('\n', m.index) + 1;
    let seg = src.slice(lineAt, m.index); const cut = Math.max(seg.lastIndexOf('continue;'), seg.lastIndexOf('return;')); if (cut >= 0) seg = seg.slice(cut);
    if (!owners.has(fn)) owners.set(fn, new Set());
    if (fn === 'updateElite') { owners.get(fn).add('*'); continue; }   /* any creature can be an elite: its own moves are '*|mode' */
    const ts = [...seg.matchAll(/e\.t === '(\w+)'/g)].map(x => x[1]);
    if (ts.length) ts.forEach(t => owners.get(fn).add(t));
    else { const host = funcs.find(f => m.index > f.at && m.index < f.at + f.body.length); if (host) inherit.push([fn, host.name]); }
  }
  for (let pass = 0; pass < 4; pass++) for (const [fn, host] of inherit) for (const t of owners.get(host) || []) owners.get(fn).add(t);
}
// the windups windingUp() names by hand that are not '...Tell' (a brute's 'raise', a crossbow's 'aim')
const wuLine = src.split('\n').find(l => l.startsWith('const windingUp =')) || '';
const namedWindups = [];
for (const part of wuLine.split(/\(\(?e\.t === '/).slice(1)) {
  const ts = [part.match(/^(\w+)'/)[1], ...[...part.split(') &&')[0].matchAll(/e\.t === '(\w+)'/g)].map(x => x[1])];
  const ms = [...part.matchAll(/(?<!typeof )e\.mode === '(\w+)'/g)].map(x => x[1]).filter(x => !x.endsWith('Tell'));
  if (/e\.t === 'archer' && e\.draw > /.test('(e.t === \'' + part)) ms.push('draw');
  for (const mode of ms) namedWindups.push({ ts, mode });   /* one clause can name two creatures (a brute's and a chief's windups): a row for either answers it */
}
const markFor = (fn, mode) => {
  const key = fn + '|' + mode;
  if (NOT_A_BLOW.has(key)) return '';
  const called = marks.filter(x => x.f === fn && x.mode === mode);
  if (called.length) { const hard = called.some(x => x.col === HARD), soft = called.some(x => x.col === SOFT);
    if (hard && soft) { tableProblems.push(key + ' calls both a yellow and a red mark: the table cannot say which stays over it'); return undefined; }
    return hard ? '!!' : '!'; }
  const u = unblockable(key); return u === null ? undefined : u ? '!!' : '!';
};
const TABLE = {};
const put = (k, v, why) => { if (v === undefined) return; if (k in TABLE && TABLE[k] !== v) tableProblems.push(k + ' is ' + JSON.stringify(TABLE[k]) + ' in one owner and ' + JSON.stringify(v) + ' in ' + why); else TABLE[k] = v; };
for (const f of funcs) {
  const ts = owners.get(f.name);
  if ((!ts || !ts.size) && f.name !== 'updateEnemies' && marks.some(x => x.f === f.name)) tableProblems.push(f.name + ' calls marks but no dispatch line says which creature it runs: its windups have no rows');
  if (!ts || !ts.size) continue;
  const modes = new Set([...f.body.matchAll(/e\.mode = '([A-Za-z0-9]+Tell)'/g)].map(x => x[1]));
  for (const x of marks) if (x.f === f.name) modes.add(x.mode);
  for (const w of namedWindups) if (w.ts.some(t => ts.has(t)) && f.body.includes("e.mode = '" + w.mode + "'")) modes.add(w.mode);
  for (const mode of modes) { const v = markFor(f.name, mode); if (v === undefined) continue; for (const t of ts) put(t + '|' + mode, v, f.name); }
}
// the inline creatures, by hand - and checked against the mark each one calls, where the mode is unambiguous
for (const [k, v] of Object.entries(BY_HAND)) {
  const mode = k.split('|')[1], called = marks.filter(x => x.f === 'updateEnemies' && x.mode === mode);
  if (called.length && called.every(x => x.col === called[0].col) && (called[0].col === HARD ? '!!' : '!') !== v) tableProblems.push(k + ' is ' + JSON.stringify(v) + ' by hand but the creature calls ' + called[0].word + ' ' + called[0].col);
  if (k in TABLE && TABLE[k] !== v) tableProblems.push(k + ' is ' + JSON.stringify(v) + ' by hand and ' + JSON.stringify(TABLE[k]) + ' traced'); else TABLE[k] = v;
}
// every windup the predicate names by hand must have a row, and so must every '...Tell' written inline in updateEnemies
const ue = funcs.find(f => f.name === 'updateEnemies');
for (const w of namedWindups) if (!w.ts.some(t => (t + '|' + w.mode) in TABLE)) tableProblems.push(w.ts.join('/') + '|' + w.mode + ' is a windup in windingUp() with no row in the table: trace it or add it to BY_HAND');
if (ue) for (const mode of new Set([...ue.body.matchAll(/e\.mode = '([A-Za-z0-9]+Tell)'/g)].map(x => x[1]))) if (!Object.keys(TABLE).some(k => k.endsWith('|' + mode))) tableProblems.push('updateEnemies enters ' + mode + ' inline and no row covers it: add it to BY_HAND');
const sorted = Object.fromEntries(Object.entries(TABLE).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
const stale = JSON.stringify(sorted) !== JSON.stringify(Object.fromEntries(Object.entries(MARK).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)));
if (process.argv.includes('--write')) {
  const url = new URL('../src/marks.js', import.meta.url), text = readFileSync(url, 'utf8');
  const rows = Object.entries(sorted), body = [];
  for (let i = 0; i < rows.length; i += 6) body.push('  ' + rows.slice(i, i + 6).map(([k, v]) => JSON.stringify(k).replace(/"/g, "'") + ': ' + JSON.stringify(v).replace(/"/g, "'")).join(', ') + ',');
  const out = text.replace(/\/\* MARK:BEGIN \*\/[\s\S]*?\/\* MARK:END \*\//, '/* MARK:BEGIN */\nexport const MARK = {\n' + body.join('\n') + '\n};\n/* MARK:END */');
  writeFileSync(url, out); console.log('src/marks.js: ' + rows.length + ' rows written');
} else if (stale) tableProblems.push('src/marks.js MARK is not the table this audit writes: run node tools/tells.mjs --write');

if (JSON_OUT) { console.log(JSON.stringify({ bad, unmarked, marks, table: sorted, tableProblems })); process.exit(0); }
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
if (tableProblems.length) { console.log('\nthe table the screen reads (src/marks.js), ' + Object.keys(sorted).length + ' rows, ' + tableProblems.length + ' problem(s):'); for (const p of tableProblems) console.log('  ' + p); }
else console.log('\nthe mark over every windup on the screen comes from this table (src/marks.js, ' + Object.keys(sorted).length + ' rows).');
process.exitCode = bad.length || tableProblems.length ? 1 : 0;
