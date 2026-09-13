// tools/quality.mjs — is a new level up to the standard of the ones that came before it?
// Measures every level on the things that actually make a BRACKEN level feel finished, then flags a
// level that sits outside the range the others set. It does not judge design; it catches a level that
// is thinner than its neighbours - too few signs, nothing to look at, checkpoints too far apart, one
// enemy type doing all the work.
// usage: node tools/quality.mjs
import { LEVELS, TS } from '../src/level.js';
import { worstGap, spanOf, THREAT } from '../src/threat.js';

// WHAT COUNTS AS A CREATURE is `src/threat.js` and nothing else. This file carried its own list, written
// before the mine, the trench and the city, so a Propman, a Clinger, a Pit Warden, a Prise and a Holdfast
// were all invisible to it - which is how the Undercrown read as FIVE kinds when it has nine.
const FOE = new Set(Object.keys(THREAT).filter(k => THREAT[k] > 0));

const rows = [];
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  const L = lv.build();
  const n = t => L.ents.filter(e => e.t === t).length;
  const foes = L.ents.filter(e => FOE.has(e.t));
  const kinds = new Set(foes.map(e => e.t));
  // HOW FAR YOU TRAVEL, on the one measure the whole toolchain uses. Wide by width and tall by height
  // put the two shapes on different scales: the Deep read 44.7 foes a hundred against the Wood's 9.8 and
  // looked four times as dense when it is not - a tall level spreads its content over its WIDTH as well.
  // `spanOf` is what tools/curve.mjs and the bot score against, so it is what this one measures against.
  const vertical = L.H > L.W;
  const len = spanOf(L.W, L.H);
  const checks = L.ents.filter(e => e.t === 'check').map(e => vertical ? e.y : e.x).sort((a, b) => a - b);
  const gap = worstGap(L.ents, L.W, L.H, L.arena);   /* and the boss arena is not a run with no checkpoint in it */
  rows.push({
    id: lv.id, len, vertical,
    foes: foes.length, kinds: kinds.size,
    foesPer100: +(foes.length / len * 100).toFixed(1),
    coins: n('coin'), coinsPer100: +(n('coin') / len * 100).toFixed(1),
    signs: n('sign'), deco: n('deco'), decoPer100: +(n('deco') / len * 100).toFixed(1),
    checks: checks.length, worstGap: gap,
    ents: L.ents.length,
  });
}

const NEW = new Set(['spire', 'storm']);
const old = rows.filter(r => !NEW.has(r.id));
const stat = k => { const v = old.map(r => r[k]).sort((a, b) => a - b); return { lo: v[0], hi: v[v.length - 1], mid: v[Math.floor(v.length / 2)] }; };
const KEYS = ['foesPer100', 'kinds', 'coinsPer100', 'signs', 'decoPer100', 'checks', 'worstGap'];
const S = {}; for (const k of KEYS) S[k] = stat(k);

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('level', 10) + pad('len', 6) + KEYS.map(k => pad(k, 13)).join(''));
for (const r of rows) {
  const flags = [];
  for (const k of KEYS) {
    if (k === 'worstGap') { if (r[k] > S[k].hi) flags.push(k + ' ' + r[k] + ' (others <= ' + S[k].hi + ')'); continue; }
    if (r[k] < S[k].lo) flags.push(k + ' ' + r[k] + ' (others >= ' + S[k].lo + ')');
  }
  const mark = NEW.has(r.id) ? '* ' : '  ';
  console.log(mark + pad(r.id, 8) + pad(r.len, 6) + KEYS.map(k => pad(r[k], 13)).join(''));
  for (const f of flags) console.log('        THIN: ' + f);
}
console.log('\n(the established levels sit in these ranges)');
for (const k of KEYS) console.log('  ' + pad(k, 13) + 'low ' + pad(S[k].lo, 7) + 'typical ' + pad(S[k].mid, 7) + 'high ' + S[k].hi);
