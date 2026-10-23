// Repeat the named, unmodified standalone check three times. Stop on its first red; never count an incomplete attempt as a pass.
import { spawn, spawnSync } from 'node:child_process';
import { createWriteStream, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url)), name = process.argv[2], dir = resolve(process.argv[3] || 'gate-data');
const checks = {
  'normal-health': ['tools/normal-health.mjs'], 'tower-chase': ['tools/tower-chase.mjs'], 'harvest-fair': ['tools/harvest-fair.mjs'],
  berserker: ['tools/berserker.mjs'], 'dune-worm': ['tools/dune-worm.mjs'], bells: ['tools/bells.mjs'],
  'rule-openings': ['tools/rule-openings.mjs'], 'slopes-trace': ['tools/slopes-trace.mjs'],
  'visible-supports-strict': ['tools/visible-supports.mjs', 'scree', 'spire', '--strict'],
  'reed-island': ['tools/reed-island.mjs'], 'small-adds': ['tools/small-adds.mjs'],
  'textfit-talk': ['tools/textfit.mjs', 'talk', '--strict'], 'textfit-levelcard': ['tools/textfit.mjs', 'levelcard', '--strict'],
  'mash-gate': ['tools/mash-gate.mjs'], 'curve-gate': ['tools/curve-gate.mjs'],
};
if (!checks[name]) throw new Error('unknown standing red: ' + name);
mkdirSync(dir, { recursive: true });
const commit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim(), results = [];
for (let repetition = 1; repetition <= 3; repetition++) {
  const log = createWriteStream(join(dir, name + '-' + repetition + '.log')), started = Date.now();
  const events = join(dir, name + '-' + repetition + '.processes.jsonl');
  const child = spawn(process.execPath, checks[name], { cwd: root, env: { ...process.env,
    BRACKEN_RUN: Math.random().toString(36).slice(2, 8), BRACKEN_CHECK: name, BRACKEN_ATTEMPT: String(repetition),
    BRACKEN_PROCESS_LOG: events, TEXTFIT_PAGES: '1',
    ...(name === 'textfit-talk' ? { TEXTFIT_LEVELS: 'stockade,fallingtower,fair' } : {}),
  }, stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('START ' + name + ' #' + repetition + ' pid=' + child.pid);
  child.stdout.on('data', b => { process.stdout.write(b); log.write(b); });
  child.stderr.on('data', b => { process.stderr.write(b); log.write(b); });
  const code = await new Promise((res, rej) => { child.on('close', res); child.on('error', rej); });
  await new Promise(r => log.end(r));
  let lifecycle = []; try { lifecycle = readFileSync(events, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); } catch {}
  const interrupted = lifecycle.some(e => e.type === 'interrupted');
  results.push({ repetition, pid: child.pid, code, interrupted, ms: Date.now() - started });
  const complete = results.length === 3 && results.every(r => r.code === 0 && !r.interrupted);
  writeFileSync(join(dir, 'receipt.json'), JSON.stringify({ commit, check: name,
    scope: name === 'textfit-talk' ? 'stockade,fallingtower,fair; all six talk heroes' : 'standalone default scope', complete, results }, null, 2) + '\n');
  if (code !== 0 || interrupted) { process.exitCode = code || 2; break; }
}
