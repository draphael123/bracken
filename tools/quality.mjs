// tools/quality.mjs — is a new level up to the standard of the ones that came before it?
// Measures every level on the things that actually make a BRACKEN level feel finished, then flags a
// level that sits outside the range the others set. It does not judge design; it catches a level that
// is thinner than its neighbours - too few signs, nothing to look at, checkpoints too far apart, one
// enemy type doing all the work.
// usage: node tools/quality.mjs
import { LEVELS, TS } from '../src/level.js';

const FOE = new Set(['sprig', 'shield', 'spit', 'wasp', 'thorn', 'archer', 'sapper', 'brute', 'hound', 'hopper',
  'sporeling', 'lurker', 'drone', 'shaman', 'thief', 'pike', 'spider', 'squirrel', 'harpy', 'goat', 'troll',
  'bat', 'grub', 'rockgoblin', 'miner', 'hare', 'kite', 'snuffer', 'sailer', 'hearthgob', 'cutter', 'shardling',
  'folk', 'wight', 'greathound', 'ram', 'soldier', 'javelin', 'heavy', 'sailor', 'netter', 'urchin', 'angler', 'petrel', 'cutlass', 'boarder', 'marine', 'bosun', 'lookout', 'turtle', 'eel', 'heronfoe', 'crab', 'scout', 'siren', 'tideguard']);

const rows = [];
for (const lv of LEVELS) {
  if (lv.hidden) continue;
  const L = lv.build();
  const n = t => L.ents.filter(e => e.t === t).length;
  const foes = L.ents.filter(e => FOE.has(e.t));
  const kinds = new Set(foes.map(e => e.t));
  // "length" is how far you travel: wide levels by width, tall ones by height
  const vertical = L.H > L.W;
  const len = vertical ? L.H : L.W;
  const checks = L.ents.filter(e => e.t === 'check').map(e => vertical ? e.y : e.x).sort((a, b) => a - b);
  let gap = 0; for (let i = 1; i < checks.length; i++) gap = Math.max(gap, checks[i] - checks[i - 1]);
  if (checks.length) gap = Math.max(gap, checks[0], len - checks[checks.length - 1]);
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
