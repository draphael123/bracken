// Crash the checkpoint writer itself; its last finished verdict must survive a hard kill and the failed check must stay failed.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { openProgress } from './suite-progress.mjs';
import { killTreeSync } from './browser-profile.mjs';
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
    console.log('ok suite-progress: hard-killed writer retains saved PASS/FAIL, resumes only missing verdict, rejects changed source/inventory and concurrent writers');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
