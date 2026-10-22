// Crash the checkpoint writer itself; its last finished verdict must survive a hard kill and the failed check must stay failed.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { openProgress } from './suite-progress.mjs';
import { killTreeSync } from './browser-profile.mjs';
import { execute } from './check-pool.mjs';
const identity = { commit: 'fixture', dirtyHash: 'unchanged' }, expected = ['pass', 'fail', 'interrupted'];
const options = { identity, expected, shard: null, selection: [], run: 'test01', startedAt: 123 };
const result = (name, ok) => ({ name, ok, ms: 12, last: ok ? 'passed' : 'real assertion failed', out: ['detail'] });
if (process.argv[2] === '--writer') {
  const p = openProgress(process.argv[3], options);
  p.done(result('pass', true)); p.done(result('fail', false)); p.snapshot({ name: 'interrupted', pid: process.pid });
  console.log('READY'); setInterval(() => {}, 1000);
} else {
  const base = fileURLToPath(new URL('../audits/check-runs/', import.meta.url)); mkdirSync(base, { recursive: true });
  const dir = mkdtempSync(join(base, 'progress-test-')), path = join(dir, 'progress.json');
  try {
    const child = spawn(process.execPath, [fileURLToPath(import.meta.url), '--writer', path], { stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((res, rej) => { const timer = setTimeout(() => rej(new Error('writer did not become ready')), 10000);
      child.stdout.on('data', b => { if (String(b).includes('READY')) { clearTimeout(timer); res(); } });
      child.on('error', rej); child.stderr.on('data', b => rej(new Error(String(b)))); });
    const exited = new Promise(r => child.once('exit', r)); killTreeSync(child.pid); await exited;
    const saved = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(saved.results.length, 2); assert.equal(saved.complete, false);
    assert.match(readFileSync(path + '.summary.txt', 'utf8'), /INCOMPLETE: 1 check\(s\) have no verdict: interrupted/);
    const p = openProgress(path, { ...options, resume: true });
    assert.deepEqual([...p.completed.keys()], ['pass', 'fail']); assert.equal(p.completed.get('fail').ok, false);
    p.done(result('interrupted', true)); p.close();
    assert.equal(JSON.parse(readFileSync(path, 'utf8')).complete, true);
    assert.match(readFileSync(path + '.summary.txt', 'utf8'), /1 check\(s\) failed\./);
    assert.throws(() => openProgress(path, { ...options, identity: { ...identity, dirtyHash: 'changed' }, resume: true }), /dirtyHash changed/);
    assert.throws(() => openProgress(path, { ...options, expected: ['pass'], resume: true }), /expected changed/);
    const p2 = openProgress(path, { ...options, resume: true });
    assert.throws(() => openProgress(path, { ...options, resume: true }), /in use by PID/); p2.close();
    const previousLog = process.env.BRACKEN_PROCESS_LOG; process.env.BRACKEN_PROCESS_LOG = join(dir, 'events.jsonl');
    try {
      const hanging = await execute({ name: 'swallowed-disconnect', cmd: process.execPath, args: ['-e',
        "require('fs').appendFileSync(process.env.BRACKEN_PROCESS_LOG, JSON.stringify({type:'interrupted',attempt:process.env.BRACKEN_ATTEMPT,reason:'injected disconnect'})+'\\n');setInterval(()=>{},1000)"] }, fileURLToPath(new URL('..', import.meta.url)), 0);
      assert.equal(hanging.interrupted, true); assert.equal(hanging.ok, false);
      assert.ok(hanging.ms < 10000, 'a child that swallows the disconnect must be ended promptly');
      const failed = await execute({name:'real-failure',cmd:process.execPath,args:['-e','process.exit(3)']}, fileURLToPath(new URL('..', import.meta.url)), 0);
      assert.equal(failed.ok,false);assert.equal(failed.exitCode,3);assert.equal(failed.signal,null);assert.equal(failed.interrupted,undefined);
      const injected = await execute({name:'nested-fault',cmd:process.execPath,args:['-e',"require('fs').appendFileSync(process.env.BRACKEN_PROCESS_LOG,JSON.stringify({type:'interrupted',attempt:'separate-test-attempt',reason:'expected fault'})+'\\n')"]}, fileURLToPath(new URL('..', import.meta.url)), 0);
      assert.equal(injected.ok,true);assert.equal(injected.interrupted,undefined);
    } finally { if (previousLog === undefined) delete process.env.BRACKEN_PROCESS_LOG; else process.env.BRACKEN_PROCESS_LOG = previousLog; }
    console.log('ok suite-progress: hard-killed writer retains saved PASS/FAIL, resumes only missing verdict, rejects changed source/inventory and concurrent writers');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
