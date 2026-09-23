/* tools/phase-two.mjs — WHEN HE CROSSES HALF HEALTH, DOES THE ROTATION ASK ANYTHING DIFFERENT? Node only: no page,
 * no port, no Chrome.
 *
 * WHAT IT ANSWERS, YES OR NO. A boss that picks its turns from a list keyed on the phase
 *
 *     const turns = e.phase === 2 ? [...] : [...];        (or a data boss's `chain` beside its `chain2`)
 *
 * has both of its rotations written down, so the two can be compared. This fails a boss whose phase two is the
 * phase-one rotation WITH ATTACKS SLOTTED INTO IT and nothing else changed.
 *
 * WHY IT EXISTS. A10, which Daniel asked for in as many words on 2026-09-24: "second phase has to have at least some
 * change". Half health is not a phase, it is a number; crossing it has to alter what the fight ASKS OF YOU - a new
 * told attack, an attack that STOPS, a room that moves, a speed the old reads no longer fit - and a player who has
 * just crossed it should be able to say what changed in one sentence. He wrote the rule after THE BURIED DEAD, who
 * had seven turns before he was enraged and eight after: `bodyTell` put in and NOTHING ELSE different. AN EXTRA
 * ATTACK BOLTED ONTO THE SAME ROTATION IS THE WEAKEST VERSION OF THIS and is the floor, not the plan.
 *
 * WHY IT IS NOT `p2 === p1.concat(x)`, WHICH IS WHAT THE RULE'S NOTE SUGGESTS. It would have passed the very boss it
 * was written for. His extra attack is not on the END of the list, it is third, and `sinkTell` slid two places to
 * make room. Every document about him calls that an append because that is what it does to the fight; a check that
 * tested the literal shape would have been green on the bug on the day it was written, which is worse than no check.
 *
 * SO IT ASKS TWO QUESTIONS. The first is the one the rule's own note asks for, and it is absolute:
 *    IS PHASE TWO PHASE ONE WITH ENTRIES ON THE END? If the phase-two list BEGINS with the whole of the phase-one
 *    list in order, that is the append A10 names, and two entries on the end are the same failure with a bigger
 *    number. Identical lists are the same thing with the append left off. Nothing excuses this one.
 * The second catches the boss the rule was actually written for, whose extra attack was not on the end. A rotation
 * has to do at least ONE of the three things the rule itself lists:
 *    1. SOMETHING STOPS - an attack he had in phase one is gone from phase two, or comes round less often;
 *    2. SOMETHING COMES ROUND OFTENER - an attack he already had is now in the rotation twice;
 *    3. THE OLD READS NO LONGER FIT - HALF or more of phase one's "after this comes that" pairs are broken, taking
 *       each rotation as the cycle it is and stepping over attacks phase one never had.
 * Failing all three means nothing was taken away, nothing was weighted, and most of what you learned still plays
 * exactly as it did: an attack has been slotted into the rotation and that is all. The same cycle started at a
 * different turn fails this, which is right - it is the same fight.
 *
 * WHAT IT DOES NOT SCORE, AND SAYS SO EVERY RUN. A metric that skips unknown inputs does not fail, it returns a
 * confident smaller number, so every phase-keyed list it finds and cannot compare is PRINTED with its file and line
 * rather than passed over: a branch that is not a plain list (the Gate Gargoyle's follow-up queue, whose phase-one
 * side is a coin flip), lists of numbers rather than turn names (the Salvage Captain's cargo offsets, the Vault
 * Keeper's spread), and a data boss with one chain and no second one. Two shapes are outside the rule's wording and
 * outside this tool, and are a human's read: bosses that pick from a WEIGHTED POOL rebuilt every turn (the Hornet
 * Queen, the Bullfrog King - phase two pushes more of the moves it already had, which is a weight change and a real
 * one), and PHASE TWOS THAT ARE NOT IN THE TURN LIST AT ALL, which can be the best kind - the Dune Worm keeps his
 * one chain and grows a SECOND, FALSE ripple, so the read that told you where he would come up stops working; the
 * Skeleton King shuts his helm. A boss listed as "not compared" has not been judged by this tool in either
 * direction, and that is the honest report: what it prints is a floor on the rule, not the whole of it.
 */
import assert from 'node:assert/strict';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
/* what a rotation is called when it is written as data rather than as a ternary: `chain`/`chain2`, `order`/`orderP2` */
const ROTATION = ['chain', 'order', 'turns', 'moves', 'rotation', 'cycle', 'picks'];

/* ---- reading JavaScript without a parser -------------------------------------------------------------------
 * `blank` returns a copy of the source with every comment, string, template and regex body replaced by spaces of
 * the same length, newlines kept. Structure (brackets, ?, :) is then read off the blanked copy at exactly the same
 * offsets as the real text, so a bracket inside a string or a `?` inside a comment can never be read as code. */
function blank(src) {
  const out = src.split(''), n = src.length;
  const wipe = (a, b) => { for (let k = a; k < b && k < n; k++) if (out[k] !== '\n') out[k] = ' '; };
  let i = 0, prev = '';
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { let j = src.indexOf('\n', i); if (j < 0) j = n; wipe(i, j); i = j; continue; }
    if (c === '/' && d === '*') { let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; wipe(i, j); i = j; continue; }
    if (c === '\'' || c === '"' || c === '`') {
      let j = i + 1; while (j < n && src[j] !== c) { if (src[j] === '\\') j++; j++; }
      j = Math.min(n, j + 1); wipe(i, j); i = j; prev = 'x'; continue;
    }
    /* a slash opens a regex only where a value cannot already have ended: after an operator, a comma or an opener */
    if (c === '/' && (prev === '' || '(,=:[!&|?{};+-*%^~<>'.includes(prev))) {
      let j = i + 1, cls = false;
      while (j < n && src[j] !== '\n') { const q = src[j]; if (q === '\\') { j += 2; continue; } if (q === '[') cls = true; else if (q === ']') cls = false; else if (q === '/' && !cls) break; j++; }
      j = Math.min(n, j + 1); wipe(i, j); i = j; prev = 'x'; continue;
    }
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out.join('');
}
const OPEN = { '(': ')', '[': ']', '{': '}' }, CLOSE = { ')': '(', ']': '[', '}': '{' };
function matchBracket(code, i) {
  const want = OPEN[code[i]]; let depth = 0;
  for (let k = i; k < code.length; k++) {
    const c = code[k];
    if (OPEN[c]) depth++;
    else if (CLOSE[c]) { depth--; if (depth === 0) return c === want ? k : -1; if (depth < 0) return -1; }
  }
  return -1;
}
const lineOf = (src, i) => src.slice(0, i).split('\n').length;
const tidy = s => s.replace(/\s+/g, ' ').trim().slice(0, 64);
const NAME = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/;

/* A PLAIN LIST OF NAMES and nothing else. Strings are blanked, so `['a','b']` reads back as `[   ,   ]`: if anything
 * but spaces and commas survives between the brackets it is not a plain list of names - a spread, a call, a number -
 * and this says so instead of returning half a list. */
function listAt(code, src, i) {
  if (code[i] !== '[') return null;
  const end = matchBracket(code, i);
  if (end < 0) return null;
  if (!/^[\s,]*$/.test(code.slice(i + 1, end))) return { end, items: null };
  return { end, items: [...src.slice(i + 1, end).matchAll(/'([^'\\]*)'|"([^"\\]*)"/g)].map(m => m[1] ?? m[2]) };
}

const files = [];
const walk = d => { for (const f of readdirSync(join(ROOT, d))) { const p = join(d, f); if (statSync(join(ROOT, p)).isDirectory()) walk(p); else if (/\.js$/.test(f)) files.push(p); } };
walk('src');

const pairs = [];      /* { where, what, p1, p2 } - two rotations, compared below */
const unscored = [];   /* { where, why } - found, not comparable, and named in the output every run */

for (const rel of files) {
  const src = readFileSync(join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n'), code = blank(src);
  const at = i => rel.replace(/\\/g, '/') + ':' + lineOf(src, i);

  /* every `name:` in the file, and which of them hold a plain list of names. A ternary that picks between two
     NAMED things - `REAVER.orderP2 : REAVER.order` - is a list pick; `ABBOT.cdP2 : ABBOT.cd` is two cooldowns and
     is none of this tool's business, and resolving the name here is what tells the two apart. */
  const owner = new Int32Array(code.length).fill(-1);
  { const stack = []; for (let i = 0; i < code.length; i++) { const c = code[i]; if (c === '{') { owner[i] = stack.length ? stack[stack.length - 1] : -1; stack.push(i); continue; } if (c === '}') stack.pop(); owner[i] = stack.length ? stack[stack.length - 1] : -1; } }
  const props = new Map(), everyProp = new Set();
  for (const m of code.matchAll(/([A-Za-z_$][\w$]*)\s*:/g)) everyProp.add(m[1]);
  for (const m of code.matchAll(/([A-Za-z_$][\w$]*)\s*:\s*\[/g)) {
    const i = m.index + m[0].length - 1, r = listAt(code, src, i);
    if (!r || !r.items) continue;
    props.set(owner[i] + '|' + m[1], { name: m[1], obj: owner[i], items: r.items, i: m.index });
  }
  const listNames = new Set([...props.values()].map(p => p.name));

  /* ---- 1. the shape the rule names: one expression, two lists, keyed on the phase ---- */
  for (const m of code.matchAll(/\bphase\s*(===|==|!==|!=|>=|<=|>|<)\s*(\d+)/g)) {
    const op = m[1], num = +m[2];
    let k = m.index + m[0].length, depth = 0, q = -1;
    while (k < code.length && k < m.index + 400) {
      const c = code[k];
      if (OPEN[c]) depth++;
      else if (CLOSE[c]) { if (depth === 0) break; depth--; }
      else if (c === ';' || c === '{') break;
      else if (c === '?' && depth === 0 && code[k + 1] !== '?' && code[k + 1] !== '.') { q = k; break; }
      k++;
    }
    if (q < 0) continue;                       /* not a ternary test: an `if`, a guard, an argument */
    /* the `:` belonging to this `?`, stepping over any ternary nested inside the first branch */
    let c2 = -1, d2 = 0, nest = 0;
    for (let j = q + 1; j < code.length; j++) {
      const c = code[j];
      if (OPEN[c]) d2++;
      else if (CLOSE[c]) { if (d2 === 0) break; d2--; }
      else if (c === '?' && d2 === 0 && code[j + 1] !== '?' && code[j + 1] !== '.') nest++;
      else if (c === ':' && d2 === 0) { if (nest) nest--; else { c2 = j; break; } }
    }
    if (c2 < 0) continue;
    let e2 = code.length, d3 = 0;
    for (let j = c2 + 1; j < code.length; j++) {
      const c = code[j];
      if (OPEN[c]) d3++;
      else if (CLOSE[c]) { if (d3 === 0) { e2 = j; break; } d3--; }
      else if ((c === ';' || c === ',') && d3 === 0) { e2 = j; break; }
    }
    const read = (i, j) => {
      const s = code.slice(i, j), off = s.search(/\S/);
      if (off < 0) return { kind: 'nothing' };
      const start = i + off, r = listAt(code, src, start);
      if (r && !code.slice(r.end + 1, j).trim()) return r.items ? { kind: 'list', items: r.items } : { kind: 'numbers', text: tidy(src.slice(start, r.end + 1)) };
      if (NAME.test(s.trim())) return { kind: 'name', text: s.trim() };
      return { kind: 'other', text: tidy(src.slice(i, j)), hasList: /\[/.test(s) };
    };
    const a = read(q + 1, c2), b = read(c2 + 1, e2);
    /* only expressions that are actually picking a LIST are this tool's business; the hundreds of phase-keyed
       ternaries over distances, cooldowns and tell times are not, and are not counted either way */
    const tail = x => x.text.split('.').pop();
    const namedList = x => x.kind === 'name' && listNames.has(tail(x));
    const namedOther = x => x.kind === 'name' && everyProp.has(tail(x));
    const listish = x => x.kind === 'list' || x.kind === 'numbers' || (x.kind === 'other' && x.hasList) || x.kind === 'name';
    if (!(listish(a) && listish(b))) continue;
    if ((a.kind === 'name' || b.kind === 'name') && !(namedList(a) || namedList(b))) {
      /* both sides resolve to something that is not a list - a cooldown, a tell time, a reach - or to nothing this
         file declares. The first is not a rotation; the second is a hole, and a hole gets printed. */
      if ((a.kind !== 'name' || namedOther(a)) && (b.kind !== 'name' || namedOther(b))) continue;
      unscored.push({ where: at(m.index), why: 'picks between ' + a.text + ' and ' + b.text + ', which this tool could not resolve to a list or to anything else in the file' }); continue;
    }
    if (a.kind === 'name' && b.kind === 'name') {
      if (num >= 3) { unscored.push({ where: at(m.index), why: 'picks two NAMED lists (' + a.text + ' / ' + b.text + ') on phase ' + num + ', not on the half-health crossing A10 is about' }); continue; }
      unscored.push({ where: at(m.index), why: 'picks two NAMED lists (' + a.text + ' / ' + b.text + ')', named: [tail(a), tail(b)] }); continue;
    }
    if (a.kind === 'numbers' || b.kind === 'numbers') { unscored.push({ where: at(m.index), why: 'a list of numbers, not turn names: ' + (a.kind === 'numbers' ? a.text : b.text) }); continue; }
    if (a.kind !== 'list' || b.kind !== 'list') { unscored.push({ where: at(m.index), why: 'one side is not a plain list: ' + tidy((a.kind === 'list' ? b : a).text || '') }); continue; }
    /* which branch is phase two */
    const p2first = op === '===' || op === '==' ? num >= 2 : op === '>=' ? num >= 2 : op === '>' ? num >= 1 : op === '!==' || op === '!=' ? num < 2 : false;
    if (num >= 3) { unscored.push({ where: at(m.index), why: 'keyed on phase ' + num + ', not the half-health crossing A10 is about' }); continue; }
    const head = tidy(src.slice(src.lastIndexOf('\n', m.index) + 1, m.index)).slice(-34);
    pairs.push({ where: at(m.index), what: head || 'a phase-keyed list', p1: (p2first ? b : a).items, p2: (p2first ? a : b).items });
  }

  /* ---- 2. the same thing written as data: `chain:` beside `chain2:` on one boss (src/desert-bosses.js) ---- */
  for (const p of props.values()) {
    const base = /^(.*?)(2|P2)$/.exec(p.name);
    if (!base || !ROTATION.includes(base[1].toLowerCase())) continue;   /* `jump`/`jump2` in a sprite table is not a rotation */
    const first = props.get(p.obj + '|' + base[1]);
    if (first) pairs.push({ where: at(p.i), what: base[1] + ' / ' + p.name, p1: first.items, p2: p.items });
  }
  /* a data boss with a half-health threshold and only ONE chain has no second list to compare: say so, do not count
     it green */
  for (const p of props.values()) {
    if (!ROTATION.includes(p.name.toLowerCase()) || props.has(p.obj + '|' + p.name + '2') || props.has(p.obj + '|' + p.name + 'P2') || p.obj < 0) continue;
    const end = matchBracket(code, p.obj), body = src.slice(p.obj, end < 0 ? p.i : end);
    if (!/\bphase2\s*:/.test(body)) continue;
    const named = /name:\s*'([^']+)'/.exec(body);
    unscored.push({ where: at(p.i), why: (named ? named[1] + ': ' : '') + 'one ' + p.name + ' and no ' + p.name + '2, so whatever its phase two does is NOT written in its turns; judge it by hand' });
  }
}
/* the named-list selector can stop apologising once the lists it names are themselves scored */
for (const u of unscored) if (u.named && u.named.every(n => pairs.some(p => p.what.split(' / ').includes(n)))) u.why += ' - and both of those ARE compared, below';

/* ---- the verdict ------------------------------------------------------------------------------------------- */
const count = l => { const m = new Map(); for (const v of l) m.set(v, (m.get(v) || 0) + 1); return m; };
/* the reads a rotation teaches: after this one comes that one, round the cycle, skipping the attacks phase one
   never had (you cannot have learned a read that involves an attack you had not seen) */
const reads = (l, skip = new Set()) => { const k = l.filter(v => !skip.has(v)), s = new Set(); for (let i = 0; i < k.length; i++) s.add(k[i] + '>' + k[(i + 1) % k.length]); return s; };

function judge(p1, p2) {
  const c1 = count(p1), c2 = count(p2), stopped = [], busier = [], fresh = [];
  for (const [k, n] of c1) { const m = c2.get(k) || 0; if (m === 0) stopped.push(k + ' STOPS'); else if (m < n) stopped.push(k + ' ' + n + '->' + m + ' a rotation'); }
  for (const [k, n] of c2) { if (!c1.has(k)) fresh.push(k + ' is new'); else if (n > c1.get(k)) busier.push(k + ' ' + c1.get(k) + '->' + n + ' a rotation'); }
  const was = reads(p1), now = reads(p2, new Set([...c2.keys()].filter(k => !c1.has(k))));
  const kept = [...was].filter(r => now.has(r)).length, broke = was.size - kept;
  const why = [...stopped, ...busier, ...fresh];
  if (broke * 2 >= was.size && was.size) why.push(broke + ' of ' + was.size + ' reads broken');
  /* the append, literally: phase two BEGINS with the whole of phase one. Nothing below excuses it. */
  const append = p2.length >= p1.length && p1.every((v, i) => p2[i] === v);
  return { stopped, busier, fresh, kept, was: was.size, broke, append,
    ok: !append && (stopped.length > 0 || busier.length > 0 || (was.size > 0 && broke * 2 >= was.size)),
    why: why.join(', ') || 'nothing' };
}

const scored = pairs.map(p => ({ ...p, v: judge(p.p1, p.p2) }));
const bad = scored.filter(p => !p.v.ok);

const notes = unscored.map(u => '    ' + u.where.padEnd(26) + u.why);
if (notes.length) console.log('    found and NOT compared (' + notes.length + ', named so they are not silently green):\n' + notes.join('\n'));

if (bad.length) {
  const lines = bad.map(p => '    ' + p.where + '  (' + p.what + ')\n'
    + '      phase one: [' + p.p1.join(', ') + ']\n'
    + '      phase two: [' + p.p2.join(', ') + ']\n'
    + '      ' + (p.v.append
      ? (p.p2.length > p.p1.length
        ? 'phase two is phase one with ' + p.p2.slice(p.p1.length).join(', ') + ' ON THE END and nothing else: the append the rule names.'
        : 'the two lists are IDENTICAL: crossing half health changes nothing at all.')
      : (p.v.fresh.length
        ? 'it slots ' + p.v.fresh.map(f => f.replace(' is new', '')).join(' and ') + ' into the same rotation and that is all: '
        : 'the two rotations are the same cycle: ')
      + 'nothing stops, nothing comes round oftener, and ' + p.v.kept + ' of the ' + p.v.was + ' reads he taught you still hold.'));
  assert.fail(bad.length + ' of ' + scored.length + ' phase-two rotations ask nothing new (A10):\n' + lines.join('\n')
    + '\n  Half health is a number, not a phase. Make phase two ASK SOMETHING DIFFERENT, and write the one sentence the\n'
    + '  player would say as they cross it: stop an attack, make one come round twice where it came once, or break the\n'
    + '  reads by changing what follows what. An extra attack slotted into the same rotation is the floor, not the plan.');
}

assert.ok(scored.length >= 6, 'only ' + scored.length + ' phase-keyed rotations were found in ' + files.length + ' source files: the scan has stopped working and this check is guarding nothing');
console.log('ok  phase-two      ' + scored.length + ' phase-keyed rotations in ' + files.length + ' src files, every one of them asking something new'
  + (unscored.length ? ' (' + unscored.length + ' more found and listed above, not comparable as two lists)' : '') + '. '
  + scored.map(p => p.where.split('/').pop().split(':')[0].replace(/\.js$/, '') + ' ' + p.v.why).join(' | '));
