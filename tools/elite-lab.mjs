// tools/elite-lab.mjs - EVERY ELITE AGAINST THE MASH BOT AND THE HUMAN BOT (claude/elites2).
// The brief's gate: the mash bot must LOSE to every elite (dies, or the elite still stands after the fight's time), and the human-speed bot
// should win about 75-85% (harder than a common foe, easier than a boss); a fight runs 20-45 s. Each elite kind is fought where its first
// placement in the campaign stands it (its own affix, its own ground), by knight, warden and pyro at that level's hero level (the level's
// depth on the gate chain, no skills), one life, normal health. src/lab.js eliteLab is the fight; this drives it headless.
//   node tools/elite-lab.mjs                    every kind, mash x1 + human x2 seeds per hero
//   node tools/elite-lab.mjs --kinds=heavy,goat  only those      --heroes=knight  --seeds=3  --mash-seeds=1  --secs=60
//   node tools/elite-lab.mjs --write            stamp docs/elite-lab.json (tools/elites.mjs reads its mash column: a mash win FAILS)
// Port: PORT env (tools/cdp.mjs). Long: run it by hand, never in the suite.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { openPage } from './cdp.mjs';
import { AFFIX_AT } from '../src/elite-kit.js';

const args = process.argv.slice(2), has = k => args.includes('--' + k);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 2), mashSeeds = +opt('mash-seeds', 1), secs = +opt('secs', 60);
const OUT = new URL('../docs/elite-lab.json', import.meta.url);
const eliteStamp = () => { const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), kit = readFileSync(new URL('../src/elite-kit.js', import.meta.url), 'utf8');
  const a = src.indexOf('\nconst ELITE = {'), b = src.indexOf('/* THE MARK OF ONE:'); return createHash('sha1').update(src.slice(a, b).replace(/\r/g, '') + kit.replace(/\r/g, '')).digest('hex').slice(0, 12); };

/* THE FIRST PLACEMENT OF EACH KIND, in campaign order (the levels list order); an ambush-only kind is fought spawned in its room's level */
const depth = depthsOf(LEVELS), seen = new Map(), lvOf = id => Math.max(1, depth[id] ?? 1);
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), KINDS = new Set([...(MAIN.match(/\nconst ELITE = \{([\s\S]*?)\n\};/) || ['', ''])[1].matchAll(/(?:^|[\s,{])([a-z]+): \{ name:/g)].map(m => m[1]));   /* a kind the ELITE table does not know is no elite in play (eliteMake skips it) */
const ambOnly = new Map();
for (const lv of LEVELS) { if ((lv.hidden && !lv.secret) || lv.id === 'custom' || /^(trial_|shop)/.test(lv.id)) continue;
  const L = lv.build(), els = L.ents.filter(e => e.elite).sort((a, b) => a.x - b.x);
  for (const e of els) if (KINDS.has(e.t) && !seen.has(e.t)) seen.set(e.t, { level: lv.id, kind: e.t, nth: els.filter(q => q.t === e.t).indexOf(e), spawn: false, lvl: lvOf(lv.id) });
  for (const A of L.ambushes || []) for (const w of A.waves) for (const [t, , , o] of w) if (o && o.elite && KINDS.has(t) && !ambOnly.has(t)) ambOnly.set(t, { level: lv.id, kind: t, nth: 0, spawn: true, lvl: lvOf(lv.id), affix: AFFIX_AT[lv.id + '|' + t + '#amb'] || null }); }
for (const [t, j] of ambOnly) if (!seen.has(t)) seen.set(t, j);   /* a kind that only ever leads an ambush room is fought spawned in that room's level */
const want = opt('kinds', '').split(',').filter(Boolean);
const jobs = [...seen.values()].filter(j => !want.length || want.includes(j.kind));
console.log(jobs.length + ' kinds: ' + jobs.map(j => j.kind + '@' + j.level + (j.spawn ? '(spawned)' : '')).join(', '));

const pg = await openPage({ audio: false, fonts: false });
const rows = [];
try {
  await pg.reload();
  await pg.evalp(`(async () => { const { mulberry } = await import('/src/px.js'); const lab = await import('/src/lab.js'); const real = Math.random;
    const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
    window.__elite = async o => { const P0 = BKT.PROG; BKT.setHeroLevel(o.hero, o.lvl); P0.skillOwned[o.hero] = {}; P0.loadouts[o.hero] = []; if (P0.talents) P0.talents[o.hero] = {};
      Math.random = mulberry(hash(o.level + '|' + o.kind + '|' + o.hero + '|' + o.mode + '|' + o.seed)); try { return await lab.eliteLab(BK, o); } finally { Math.random = real; } };
    return true; })()`);
  for (const j of jobs) for (const hero of heroes) {
    for (const [mode, n] of [['mash', mashSeeds], ['human', seeds]]) for (let seed = 0; seed < n; seed++) {
      const r = await pg.evalp(`window.__elite(${JSON.stringify({ ...j, hero, mode, seed, secs })})`, 1800000);
      rows.push({ ...j, hero, mode, seed, ...r });
      console.log([j.kind.padEnd(12), j.level.padEnd(12), hero.padEnd(7), mode.padEnd(6), r.skipped ? 'SKIPPED ' + r.skipped : (r.out.padEnd(8) + String(r.secs).padStart(5) + 's  hero ' + String(r.hpLeftPct).padStart(3) + '%  elite ' + String(r.eliteLeftPct).padStart(3) + '%  ' + (r.affix || '-') + (r.roused ? ' roused' : ''))].join(' '));
    }
  }
  if (pg.errors.length) console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }

/* PER KIND: the mash bot's wins (must be 0) and the human bot's win rate */
const kinds = {};
for (const r of rows) { if (r.skipped) continue; const K = kinds[r.kind] || (kinds[r.kind] = { level: r.level, affix: r.affix, ehp: r.ehp, mash: { n: 0, wins: 0 }, human: { n: 0, wins: 0, secs: [] } });
  const b = K[r.mode]; b.n++; if (r.out === 'win') { b.wins++; if (r.mode === 'human') b.secs.push(r.secs); } }
console.log('\nkind          level         affix        mash wins   human wins   human secs');
for (const [k, K] of Object.entries(kinds)) { const s = K.human.secs, avg = s.length ? (s.reduce((a, b) => a + b, 0) / s.length).toFixed(1) : '-';
  console.log(k.padEnd(13) + K.level.padEnd(14) + String(K.affix || '-').padEnd(13) + (K.mash.wins + '/' + K.mash.n).padEnd(12) + (K.human.wins + '/' + K.human.n + ' (' + Math.round(100 * K.human.wins / Math.max(1, K.human.n)) + '%)').padEnd(13) + avg); }
if (has('write')) {
  const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { kinds: {} };
  for (const [k, K] of Object.entries(kinds)) old.kinds[k] = { level: K.level, affix: K.affix, ehp: K.ehp, mash: K.mash, human: { n: K.human.n, wins: K.human.wins, secs: K.human.secs } };
  old.stamp = eliteStamp(); old.heroes = heroes; old.note = 'tools/elite-lab.mjs: mash = the mash bot (must lose: 0 wins), human = the human-speed bot (target ~75-85%)';
  writeFileSync(OUT, JSON.stringify(old, null, 1) + '\n'); console.log('wrote docs/elite-lab.json');
}
