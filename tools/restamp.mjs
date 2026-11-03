/* tools/restamp.mjs - ONE COMMAND TO REFRESH EVERY PER-LEVEL STAMP A LEVEL EDIT MAKES STALE (claude/restamp, 11-02).
   A level edit changes its levelHash (tools/level-quality.mjs), and every row stamped with the old hash goes stale and reds a check. The stamped rows are:
     pilot  docs/level1-pilot.json   tools/level1-pilot.mjs <id> --write     (read by level-quality 'pilot')
     curve  docs/level1-curve.json   tools/level1-pilot.mjs <id> --curve     (read by curve-gate / rule-fights)
     mash   docs/mash-bot.json       tools/mash-bot.mjs <id> --level <id> --write   (LEVEL row; read by mash-gate / level-quality 'mash')
     boss   docs/mash-bot.json       tools/mash-bot.mjs <id> --write         (boss / mini rows; only with --boss, they are CARRIED across a level edit)
     walker docs/walk-curve.json     REPORT-ONLY, never regenerated here (needs tools/level-walk.mjs runs + walk-curve.mjs build); stale rows are listed
   USAGE   node tools/restamp.mjs --level <id>[,<id>]      force-restamp those levels (pilot + curve + mash level)
           node tools/restamp.mjs --all                    every campaign level whose row is STALE (hash differs), or MISSING where the gate needs one
           add --dry  (list what is due, run nothing)   --boss (also re-run boss/mini mash rows)   --only=pilot,curve,mash,boss   --no-verify
   One headless browser at a time (each part is a child node process; >= 1500 MB free RAM is checked before each, BROWSER-HOLD.flag aborts; no waiting - it stops and
   says what is left). Prints old -> new per row; a jump over 15% (and 3+ in absolute terms) is flagged WARN: look at it, do not just commit it. (claude/botstats) A WARN jump on a pilot/curve row is RE-RUN ONCE on a second seed block (--seed=2; --no-rerun to skip): both readings are printed, and when they disagree by more than their noise the row is written as the mean of the two (curve rows keep every per-run value) and labelled NOISY +/-x; a jump both seeds agree on is a real WARN.
   Ends by re-running the
   no-browser checks (level-quality <id>, curve-gate, mash-gate) unless --no-verify. Exit 1 if a part failed or a verify check is red; WARN alone exits 0. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { runStats, disagree } from './rate-stats.mjs';
import { spawn, spawnSync } from 'node:child_process';
import { freemem } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { LEVELS } from '../src/level.js';
import { levelHash, GATE, PILOT_FILE, MASH_FILE, CURVE_FILE } from './level-quality.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url)), WALK_FILE = path.join(ROOT, 'docs', 'walk-curve.json');
const args = process.argv.slice(2), has = k => args.includes('--' + k), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); if (a) return a.slice(k.length + 3); const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('-') ? args[i + 1] : d; };
const MIN_MB = 1500, WARN_PCT = 15, WARN_ABS = 3, TIMEOUT_MS = 45 * 60 * 1000;
const camp = LEVELS.filter(d => !(d.hidden && !d.secret) && !/^(shop|trial_|custom)/.test(d.id)), byId = Object.fromEntries(camp.map(d => [d.id, d]));
const lvArg = opt('level', ''), ALL = has('all');
if (!ALL && !lvArg) { console.log('usage: node tools/restamp.mjs --level <id>[,<id>] | --all  [--dry] [--boss] [--only=pilot,curve,mash,boss] [--no-verify]'); process.exit(2); }
const want = ALL ? camp.map(d => d.id) : lvArg.split(',').filter(Boolean);
for (const id of want) if (!byId[id]) { console.log('restamp: ' + id + ' is not a campaign level'); process.exit(2); }
const parts = (opt('only', '') ? opt('only', '').split(',') : ['pilot', 'curve', 'mash'].concat(has('boss') ? ['boss'] : []));
const rd = f => existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {};

/* what is due: a forced level runs every wanted part; --all runs a part whose row is stale, or missing where the gate needs one */
const hash = Object.fromEntries(want.map(id => [id, levelHash(byId[id])]));
const state = (id, part) => {
  if (part === 'pilot') { const r = rd(PILOT_FILE)[id]; return !r ? (GATE.includes(id) ? 'missing' : 'none') : r.hash !== hash[id] ? 'stale' : 'ok'; }
  if (part === 'curve') { const r = rd(CURVE_FILE)[id]; return !r ? 'none' : r.hash !== hash[id] ? 'stale' : 'ok'; }
  const r = rd(MASH_FILE)[id]; if (!r) return 'missing'; if (part === 'mash') return r.hash !== hash[id] ? 'stale' : r.level ? 'ok' : 'missing';
  return r.carried && r.carried.parts.some(p => ['boss', 'mini', 'mini2'].includes(p)) ? 'carried' : r.hash !== hash[id] ? 'stale' : (r.boss || r.mini) ? 'ok' : 'none';
};
const due = [];
for (const id of want) for (const part of parts) { const s = state(id, part); if (!ALL ? true : (s === 'stale' || s === 'missing' || (part === 'boss' && s === 'carried'))) due.push({ id, part, s }); }
const cmdOf = ({ id, part }) => part === 'pilot' ? ['tools/level1-pilot.mjs', id, '--write'] : part === 'curve' ? ['tools/level1-pilot.mjs', id, '--curve'] : part === 'mash' ? ['tools/mash-bot.mjs', id, '--level', id, '--write'] : ['tools/mash-bot.mjs', id, '--write'];

console.log('restamp: ' + want.length + ' level(s), parts ' + parts.join('+') + ', ' + due.length + ' row(s) due' + (ALL ? ' (stale or missing)' : ' (forced)'));
for (const t of due) console.log('  due  ' + t.id.padEnd(16) + t.part.padEnd(6) + '[' + t.s + ']  node ' + cmdOf(t).join(' '));
{ const wc = rd(WALK_FILE), rows = wc.after2b || wc.after2a || wc.after || {}, stale = want.filter(id => rows[id] && rows[id].hash && rows[id].hash !== hash[id]);
  if (stale.length) console.log('  walker rows stale (REPORT-ONLY, not regenerated here: tools/level-walk.mjs + walk-curve.mjs build): ' + stale.join(', ')); }
if (has('dry') || !due.length) { console.log(has('dry') ? 'restamp --dry: nothing run.' : 'restamp: nothing due.'); process.exit(0); }

/* ---- old -> new per row, with the 15% flag ---- */
const warns = [], changes = [];
const cmp = (label, o, n) => { if (o === undefined || n === undefined || o === null || n === null) return o === n ? '' : label + ' ' + (o ?? '-') + '->' + (n ?? '-'); const d = Math.abs(n - o), big = d >= WARN_ABS && d > Math.abs(o) * WARN_PCT / 100;
  if (o === n) return ''; const s = label + ' ' + o + '->' + n + (big ? ' WARN' : ''); if (big) warns.push(label); return s; };
const diffRow = (part, id, o, n) => { o = o || {}; n = n || {}; const out = [];
  if (part === 'pilot' || part === 'curve') for (const k of ['hits', 'deaths', 'kills', 'lifts', 'walked', 'lostPct']) { const c = cmp(part + ' ' + id + ' ' + k, o[k], n[k]); if (c) out.push(c); }
  else if (part === 'mash') for (const h of ['knight', 'warden', 'pyro']) for (const k of ['minHpPct', 'deaths', 'walked']) { const c = cmp('mash ' + id + ' ' + h + ' ' + k, o.level && o.level[h] && o.level[h][k], n.level && n.level[h] && n.level[h][k]); if (c) out.push(c); }
  else for (const k of ['boss', 'mini', 'mini2']) if (o[k] || n[k]) { const c = cmp('boss ' + id + ' ' + k + ' mashWins', o[k] && o[k].wins, n[k] && n[k].wins); if (c) out.push(c); }
  return out; };
const FILE = { pilot: PILOT_FILE, curve: CURVE_FILE, mash: MASH_FILE, boss: MASH_FILE };

const freeMb = () => Math.round(freemem() / 1048576), flag = f => existsSync(path.join(ROOT, '..', 'scratch', f));
const run = (cmd) => new Promise(resolve => { const c = spawn(process.execPath, cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }); let out = '';
  c.stdout.on('data', d => out += d); c.stderr.on('data', d => out += d);
  const timer = setTimeout(() => { out += '\nrestamp: TIMEOUT, killing our own child tree'; spawnSync('taskkill', ['/PID', String(c.pid), '/T', '/F']); }, TIMEOUT_MS);   /* only the PID we started, and its children */
  c.on('close', code => { clearTimeout(timer); resolve({ code, out }); }); c.on('error', e => { clearTimeout(timer); resolve({ code: -1, out: String(e) }); }); });

let failed = 0, done = 0, left = [];
for (let i = 0; i < due.length; i++) { const t = due[i];
  if (flag('BROWSER-HOLD.flag')) { console.log('restamp: scratch/BROWSER-HOLD.flag exists: no browsers. Stopped.'); left = due.slice(i); break; }
  if (freeMb() < MIN_MB) { console.log('restamp: only ' + freeMb() + ' MB free (< ' + MIN_MB + '): stopped, not waiting.'); left = due.slice(i); break; }
  const before = rd(FILE[t.part])[t.id]; console.log('restamp: [' + (i + 1) + '/' + due.length + '] ' + t.id + ' ' + t.part + ' (' + freeMb() + ' MB free)');
  const r = await run(cmdOf(t)), after = rd(FILE[t.part])[t.id], errLine = /\bERR\b|Error:|no such level/i.test(r.out) ? r.out.split('\n').filter(l => /\bERR\b|Error:|no such level/i.test(l)).slice(0, 2).join(' | ') : '';
  if (r.code !== 0 || !after || after.hash !== hash[t.id]) { failed++; console.log('  FAILED ' + t.id + ' ' + t.part + ' (exit ' + r.code + (after && after.hash !== hash[t.id] ? ', row not re-stamped' : '') + ') ' + errLine + '\n' + r.out.split('\n').slice(-6).join('\n')); continue; }
  done++; const w0 = warns.length; let d = diffRow(t.part, t.id, before, after);
  if (d.some(x => / WARN$/.test(x)) && (t.part === 'pilot' || t.part === 'curve') && !has('no-rerun') && !(flag('BROWSER-HOLD.flag')) && freeMb() >= MIN_MB) {
    const nWarn = w0, A = after, dA = d.slice(); console.log('  WARN jump: re-running once on a second seed block (--seed=2)');
    const r2 = await run(cmdOf(t).concat(['--seed=2'])), B = rd(FILE[t.part])[t.id];
    if (r2.code !== 0 || !B || B.hash !== hash[t.id]) { console.log('  rerun FAILED (exit ' + r2.code + '); the first reading stands'); if (A) { const all = rd(FILE[t.part]); all[t.id] = A; writeFileSync(FILE[t.part], JSON.stringify(all, null, 1) + '\n'); } }
    else {
      const num = k => (A[k] !== undefined && B[k] !== undefined) ? Math.round((A[k] + B[k]) / 2) : B[k], sa = runStats(A.lostRuns || []), sb = runStats(B.lostRuns || []);
      console.log('    reading 1 (seed 1): ' + dA.join('; ')); console.log('    reading 2 (seed 2): ' + diffRow(t.part, t.id, before, B).join('; '));
      const noisy = A.lostRuns && B.lostRuns ? disagree(sa, sb) : Math.abs((A.hits ?? 0) - (B.hits ?? 0)) > Math.max(3, 0.15 * Math.abs(A.hits ?? 0));
      const M = { ...B }; for (const k of ['hits', 'deaths', 'kills', 'lifts', 'walked']) M[k] = num(k);
      if (A.lostRuns && B.lostRuns) { const lr = A.lostRuns.concat(B.lostRuns), st = runStats(lr); Object.assign(M, { lostPct: Math.round(st.mean), lostRuns: lr, lostSd: st.sd, lostSe: st.se, deathsRuns: (A.deathsRuns || []).concat(B.deathsRuns || []), hitsRuns: (A.hitsRuns || []).concat(B.hitsRuns || []), runs: lr.length, seed: [A.seed, B.seed] });
        M.deaths = Math.round((A.deaths + B.deaths) / 2); M.hits = Math.round((A.hits + B.hits) / 2); }
      const all = rd(FILE[t.part]); all[t.id] = M; writeFileSync(FILE[t.part], JSON.stringify(all, null, 1) + '\n');
      warns.length = nWarn; d = diffRow(t.part, t.id, before, M); const real = d.some(x => / WARN$/.test(x));
      console.log('    ' + (noisy ? 'NOISY +/-' + (A.lostRuns ? Math.round(Math.abs(sa.mean - sb.mean) / 2) + ' (lostPct ' + sa.mean + ' vs ' + sb.mean + '; row written as the mean of both)' : 'the two seeds disagree; row written as the mean of both') : 'the two seeds AGREE: the jump is real') + (real ? ' - still a WARN vs the old row' : ' - within the old row reach after averaging'));
    }
  }
  console.log('  ' + (before ? 'hash ' + before.hash + ' -> ' + after.hash : 'NEW row, hash ' + after.hash) + (d.length ? '\n    ' + d.join('\n    ') : '\n    (numbers unchanged)')); changes.push(...d);
}
console.log('\nrestamp summary: ' + done + '/' + due.length + ' row(s) re-stamped, ' + failed + ' failed' + (left.length ? ', ' + left.length + ' NOT RUN (' + left.map(t => t.id + ':' + t.part).join(', ') + ')' : '') + ', ' + warns.length + ' WARN jump(s) over ' + WARN_PCT + '%' + (warns.length ? ': ' + warns.join('; ') + ' - a human should look before committing' : ''));

let red = 0;
if (!has('no-verify') && done) { const chk = (name, a) => { const r = spawnSync(process.execPath, a, { cwd: ROOT, encoding: 'utf8', timeout: 10 * 60 * 1000 }); const ok = r.status === 0; if (!ok) red++; console.log('verify ' + name + ': ' + (ok ? 'green' : 'RED') + (ok ? '' : '\n' + ((r.stdout || '') + (r.stderr || '')).split('\n').slice(0, 12).join('\n'))); };
  for (const id of want) if (due.some(t => t.id === id)) chk('level-quality ' + id, ['tools/level-quality.mjs', id]);
  chk('curve-gate', ['tools/curve-gate.mjs']); chk('mash-gate', ['tools/mash-gate.mjs']); }
process.exit(failed || red || left.length ? 1 : 0);
