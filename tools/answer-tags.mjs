// tools/answer-tags.mjs — EVERY BLOW HAS AN ANSWER, AND EVERY LEVEL ASKS FOR THREE OF THEM (the combat pass, 2026-09-28).
//
// src/marks.js says over every windup whether the shield turns it. Its ANSWER table says what the player DOES about it:
// block, dodge, jump or duck (the universal duck, src/duck.js). This fails when:
//   - a told blow of a common foe (a '!' or '!!' row of MARK whose creature stands in some level outside its boss fight) has
//     no ANSWER row, or a row names something other than the four answers
//   - a yellow ! is answered with anything but block, or a red !! with block (the mark and the answer would disagree)
//   - an ANSWER row names no blow at all (a stale row), or a common foe with no told blow is missing from UNTOLD
//   - UNTOLD (the common foes whose harm has no told windup) is not empty (part 2: no untold hits), or a common foe with no
//     told blow is not named HARMLESS
//   - THE UNIVERSAL DUCK (claude/duck): a told blow of a common foe has no HEIGHT row ('high': a ducking hero lets it over him;
//     'low': it reaches the floor), a 'duck' answer is not high, or a 'jump' answer is not low
// and it REPORTS, without failing, every level whose foe mix asks for fewer than three different answers: those are the
// design lanes' to fix (Daniel, backlog item 13), and the list is here so they can see them.
//   node tools/answer-tags.mjs            (--quiet: the offenders only)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import * as MARKS from '../src/marks.js';
const { MARK, ANSWER } = MARKS, HEIGHT = MARKS.HEIGHT || {}, UNTOLD = MARKS.UNTOLD || {}, HARMLESS = MARKS.HARMLESS || new Set();

const SRC = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ANSWERS = new Set(['block', 'dodge', 'jump', 'duck']);
// WHAT IS A CREATURE: a spawn case that puts it on the enemies list (the same reading as tools/spawns.mjs), or one MARK knows
const FOE = new Set();
for (const m of SRC.matchAll(/case '(\w+)':([^\n]*(?:\n(?!\s*case ')[^\n]*){0,3})/g)) if (/enemies\.push|boss = /.test(m[2])) FOE.add(m[1]);
const BLOWS = Object.keys(MARK).filter(k => MARK[k] === '!' || MARK[k] === '!!');
const TOLD = new Set(BLOWS.map(k => k.split('|')[0]));
// NOT FOES THAT SHARE A FOE'S NAME: the King's Road's battering ram is a trap (a prop called 'ram'), and 'ramlord' is where the
// Scree's boss stands (he is 'ram' once he is up)
const NOT_FOES = new Set(['ram', 'ramlord']);
const SKIP_LEVEL = id => /^(trial_|shop)/.test(id) || id === 'custom';   /* the trials and the shops teach or sell; the editor's level is empty */

const common = new Set(), mixes = [];
for (const lv of LEVELS) {
  const L = lv.build(), bosses = new Set([L.arena && L.arena.boss, L.mini && L.mini.boss]);
  const here = new Set();
  for (const e of [...(L.ents || []), ...(L.ambushes || []).flatMap(A => A.waves.flat().map(f => ({ t: f[0] })))])
    if (e.t && !bosses.has(e.t) && !NOT_FOES.has(e.t) && (FOE.has(e.t) || TOLD.has(e.t))) { common.add(e.t); here.add(e.t); }
  if (!SKIP_LEVEL(lv.id)) mixes.push([lv.id, here]);
}

const bad = [];
const blowsOf = t => BLOWS.filter(k => k.startsWith(t + '|'));
for (const t of common) {
  const bl = blowsOf(t);
  if (!bl.length) { if (!HARMLESS.has(t)) bad.push(`${t}: a common foe that harms you with no told blow` + (UNTOLD[t] ? ` (UNTOLD: '${UNTOLD[t]}' - an untold hit)` : '')); continue; }
  for (const k of bl) {
    const a = ANSWER[k];
    if (!a) { bad.push(`${k} (${MARK[k]}): no ANSWER row`); continue; }
    if (HEIGHT[k] !== 'high' && HEIGHT[k] !== 'low') bad.push(`${k}: no HEIGHT row (high or low: does a ducking hero let it over him?)`);
    else if (a === 'duck' && HEIGHT[k] !== 'high') bad.push(`${k}: answered 'duck' but its HEIGHT is ${HEIGHT[k]}`);
    else if (a === 'jump' && HEIGHT[k] !== 'low') bad.push(`${k}: answered 'jump' but its HEIGHT is ${HEIGHT[k]}`);
    if (!ANSWERS.has(a)) bad.push(`${k}: '${a}' is not block, dodge, jump or duck`);
    else if (MARK[k] === '!' && a !== 'block') bad.push(`${k}: a yellow ! (the shield turns it) answered '${a}'`);
    else if (MARK[k] === '!!' && a === 'block') bad.push(`${k}: a red !! (nothing turns it) answered 'block'`);
  }
}
for (const k of ['*|eliteLungeTell', '*|eliteSlamTell']) if (MARK[k] && !ANSWER[k]) bad.push(`${k}: an elite's own blow with no ANSWER row`);
for (const k of Object.keys(ANSWER)) if (!(MARK[k] === '!' || MARK[k] === '!!')) bad.push(`${k}: an ANSWER row for no blow (MARK says ${JSON.stringify(MARK[k])})`);
/* NO UNTOLD HITS (the combat pass, part 2; Daniel, 2026-09-28): UNTOLD must end empty - a harm with no windup is a hit nobody can read */
for (const [t, a] of Object.entries(UNTOLD)) bad.push(`UNTOLD ${t}: '${a}' - an untold hit: give it a told windup (a mark and an ANSWER row), or HARMLESS if it never harms`);
assert.deepEqual(bad, [], 'answer tags:\n  ' + bad.join('\n  '));

// THE COVERAGE REPORT: what each level's foe mix asks of the player
const answersOf = t => { const s = new Set(blowsOf(t).map(k => ANSWER[k])); if (UNTOLD[t]) s.add(UNTOLD[t]); return s; };
const low = [], quiet = process.argv.includes('--quiet');
for (const [id, here] of mixes) {
  const got = new Set(); for (const t of here) for (const a of answersOf(t)) got.add(a);
  const high = new Set([...here].flatMap(t => blowsOf(t).filter(k => HEIGHT[k] === 'high')));   /* THE DUCK: the blows here a ducking hero lets over him - a yellow one is blocked OR ducked, so a level with one asks for the duck too */
  if (high.size) got.add('duck');
  const line = id.padEnd(14) + [...ANSWERS].map(a => (got.has(a) ? a : '-'.repeat(a.length))).join(' ') + '  (' + got.size + ')' + (high.size ? '  ducks ' + high.size : '');
  if (got.size < 3) low.push(line);
  if (!quiet) console.log(line);
}
const n = Object.keys(ANSWER).length;
console.log(`\n${n} told blows of ${common.size} common foes answered (${[...ANSWERS].map(a => a + ' ' + Object.values(ANSWER).filter(x => x === a).length).join(', ')}), ` +
  `${Object.keys(UNTOLD).length} untold foes tagged.`);
console.log(low.length ? `${low.length} of ${mixes.length} levels ask for fewer than three answers (for the design lanes, not a failure):\n  ` + low.join('\n  ')
  : `every one of ${mixes.length} levels asks for three answers or more.`);
