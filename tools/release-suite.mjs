// Run the unchanged check suite, keep its complete output, and print its release-parser result lines.
// Example: node tools/release-suite.mjs --jobs=3 --max-browsers=1 --log=work/release.log
import { spawn } from 'node:child_process';
import { closeSync, mkdirSync, openSync, writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const logAt = args.findIndex(a => a === '--log' || a.startsWith('--log='));
let logName = join(tmpdir(), `bracken-release-${Date.now()}-${process.pid}.log`);
if (logAt >= 0) {
  const arg = args.splice(logAt, 1)[0];
  logName = arg === '--log' ? args.splice(logAt, 1)[0] : arg.slice(6);
  if (!logName) throw new Error('--log needs a path');
}
const log = isAbsolute(logName) ? logName : resolve(root, logName);
mkdirSync(dirname(log), { recursive: true });
const fd = openSync(log, 'w');
const started = Date.now(), results = [];
const child = spawn(process.execPath, ['tools/check.mjs', ...args], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
console.log(`release-suite log: ${log}`);
let stdoutLine = '';
const save = (chunk, stdout) => {
  writeSync(fd, chunk);
  if (!stdout) return;
  stdoutLine += chunk.toString('utf8');
  const lines = stdoutLine.split(/\r?\n/);
  stdoutLine = lines.pop();
  for (const line of lines) if (/^(?: ok  |FAIL )\S+\s/.test(line)) results.push(line);
};
child.stdout.on('data', b => save(b, true));
child.stderr.on('data', b => save(b, false));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => child.kill(signal));
const { code, error } = await new Promise(resolveDone => {
  let error = null;
  child.once('error', e => { error = e; });
  child.once('close', code => resolveDone({ code, error }));
});
if (/^(?: ok  |FAIL )\S+\s/.test(stdoutLine)) results.push(stdoutLine);
if (error) writeSync(fd, `\nrelease-suite spawn error: ${error.stack || error}\n`);
closeSync(fd);
for (const line of results) console.log(line);
const failed = results.filter(line => line.startsWith('FAIL ')).length;
const ok = results.length - failed;
const pass = code === 0 && !error && results.length > 0 && failed === 0;
console.log(`VERDICT ${pass ? 'PASS' : 'FAIL'}: ${ok} ok, ${failed} FAIL, exit ${code ?? 'none'}, ${Math.round((Date.now() - started) / 1000)}s; log ${log}`);
process.exitCode = pass ? 0 : 1;
