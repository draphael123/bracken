// Real-browser, bounded fault injection. Only the Chrome PID launched by this proof is killed.
// This is a representative subset proof, never a substitute for a full release gate.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, createWriteStream } from 'node:fs';
import { freemem } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { killTreeSync } from './browser-profile.mjs';
const root = fileURLToPath(new URL('..', import.meta.url)), out = resolve(process.argv[2] || join(root, 'audits/check-runs/recovery-proof-' + Date.now()));
mkdirSync(out, { recursive: true });
const freeMb = Math.floor(freemem() / 1048576);
if (freeMb < 1536) { console.error('INCOMPLETE: recovery proof needs at least 1536 MB free; currently ' + freeMb + ' MB. No browser started.'); process.exit(2); }
const sleep = ms => new Promise(r => setTimeout(r, ms)), read = p => JSON.parse(readFileSync(p, 'utf8'));
async function run(name, args, killBrowser = false) {
  const log = createWriteStream(join(out, name + '.log'));
  const child = spawn(process.execPath, ['tools/check.mjs', ...args], { cwd: root, env: { ...process.env, BRACKEN_MIN_FREE_MB: '512' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', b => log.write(b)); child.stderr.on('data', b => log.write(b));
  const closed = new Promise((res, rej) => { child.on('close', code => { log.end(); res(code); }); child.on('error', rej); });
  const deadline = setTimeout(() => { if (child.exitCode === null) killTreeSync(child.pid); }, 180000);
  let killed = null;
  try {
    if (killBrowser) {
      const events = join(out, 'interrupted.json.processes.jsonl');
      while (child.exitCode === null && !killed) {
        let rows = []; try { rows = readFileSync(events, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); } catch {}
        const launch = rows.find(e => e.type === 'launch' && e.check === 'fonts' && e.pid > 0);
        if (launch) { killed = { browserPid: launch.pid, check: launch.check, timestamp: new Date().toISOString() }; killTreeSync(launch.pid); }
        else await sleep(100);
      }
      assert.ok(killed, 'this proof must observe and kill its own fonts browser');
    }
    return { code: await closed, suitePid: child.pid, killed };
  } finally { clearTimeout(deadline); }
}
const subset = 'tells,comments,fonts', baselinePath = join(out, 'uninterrupted.json'), interruptedPath = join(out, 'interrupted.json');
const baseline = await run('uninterrupted', [subset, '--progress', baselinePath]);
assert.equal(baseline.code, 0, 'uninterrupted subset must pass; inspect its log (resource interruptions are not game verdicts)');
const interrupted = await run('interrupted', [subset, '--progress', interruptedPath], true);
assert.equal(interrupted.code, 2, 'killed browser must produce an incomplete suite, not a FAIL verdict or a hang');
const saved = read(interruptedPath);
assert.equal(saved.complete, false); assert.equal(saved.results.some(r => r.name === 'fonts'), false);
assert.ok(saved.results.length >= 3, 'checks completed before the browser death were saved');
const resumed = await run('resumed', ['--resume', interruptedPath]);
assert.equal(resumed.code, 0);
const complete = read(interruptedPath), uninterrupted = read(baselinePath);
assert.equal(complete.complete, true);
assert.deepEqual(complete.results.map(r => [r.name, r.ok]), uninterrupted.results.map(r => [r.name, r.ok]));
for (const r of saved.results) assert.deepEqual(complete.results.find(x => x.name === r.name), r, 'resume must not rerun ' + r.name);
const receipt = { status: 'PASS', scope: 'representative subset, not full release suite', createdAt: new Date().toISOString(),
  checks: complete.results.map(r => r.name), baseline, interrupted, resumed,
  memory: complete.results.map(r => ({ name: r.name, memory: r.memory })) };
writeFileSync(join(out, 'proof.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log('PASS: killed the recorded Chrome PID mid-suite, resumed only fonts, and recovered identical combined verdicts for ' + complete.results.length + ' checks. Receipt: ' + join(out, 'proof.json'));
