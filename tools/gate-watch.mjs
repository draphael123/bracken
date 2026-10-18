// A release-gate wrapper with an explicit terminal receipt in its log.
//   node tools/gate-watch.mjs --log=../batch101-gate.log -- --jobs=3 --max-browsers=1
// It runs only its own child. An interrupt or timeout writes "gate done / STOPPED".
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const logArg = args.find(a => a.startsWith('--log='));
if (!logArg || logArg.length <= 6) throw new Error('usage: node tools/gate-watch.mjs --log=PATH [--timeout-min=N] -- [check flags]');
const sep = args.indexOf('--');
const flags = sep < 0 ? [] : args.slice(sep + 1);
const timeoutArg = args.find(a => a.startsWith('--timeout-min='));
const timeoutMin = timeoutArg ? Number(timeoutArg.slice(14)) : 0;
if (!Number.isFinite(timeoutMin) || timeoutMin < 0) throw new Error('--timeout-min must be nonnegative');
const logPath = resolve(logArg.slice(6));
const log = createWriteStream(logPath, { flags: 'w' });
const line = s => { process.stdout.write(s + '\n'); log.write(s + '\n'); };
const started = new Date();
line(`gate started ${started.toISOString()} | node tools/check.mjs ${flags.join(' ')}`);

const child = args.includes('--selftest') || args.includes('--selftest-sleep')
  ? spawn(process.execPath, ['-e', args.includes('--selftest-sleep') ? 'setTimeout(() => {}, 10000)' : "console.log('ok selftest')"], { stdio: ['ignore', 'pipe', 'pipe'] })
  : spawn(process.execPath, ['tools/check.mjs', ...flags], { stdio: ['ignore', 'pipe', 'pipe'] });
let stopped = '', spawnError = null, done = false;
const copy = (chunk, dest) => { dest.write(chunk); log.write(chunk); };
child.stdout.on('data', chunk => copy(chunk, process.stdout));
child.stderr.on('data', chunk => copy(chunk, process.stderr));
child.on('error', error => { spawnError = error; });
const stop = why => { if (done || stopped) return; stopped = why; child.kill('SIGTERM'); };
process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
const timer = timeoutMin ? setTimeout(() => stop(`timeout ${timeoutMin} min`), timeoutMin * 60_000) : null;
child.on('close', (code, signal) => {
  done = true; if (timer) clearTimeout(timer);
  const elapsed = ((Date.now() - started.getTime()) / 1000).toFixed(1);
  const verdict = stopped || signal || spawnError ? `STOPPED${stopped ? ' ' + stopped : signal ? ' ' + signal : ' ' + spawnError.message}` : code === 0 ? 'PASS' : `FAIL exit=${code}`;
  line(`gate done / ${verdict} | ${elapsed}s | ${new Date().toISOString()}`);
  log.end();
  process.exitCode = verdict === 'PASS' ? 0 : stopped || signal ? 130 : code || 1;
});
