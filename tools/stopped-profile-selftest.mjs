// Regression for the parent's hard-stop cleanup. Synthetic Node children only; no game/balance/test-budget changes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { execute } from './check-pool.mjs';
import { cleanupStoppedProfiles } from './stopped-profile-cleanup.mjs';
import { TEMP, removeProfileSync } from './browser-profile.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = path.resolve(process.env.STOPPED_PROFILE_OUT || path.join(root, 'audits/stopped-profile-selftest'));
fs.mkdirSync(out, { recursive: true });
const tag = 'stp002', owned = [], rows = [];
const make = (run = tag) => { const p = fs.mkdtempSync(path.join(TEMP, 'bracken-headless-' + run + '-')); owned.push(p); return p; };
const event = (profile, extra = {}) => ({ type: 'launch', profile, attempt: 'this-attempt', check: 'owned-check', ...extra });
const options = { attempt: 'this-attempt', check: 'owned-check', run: tag, forced: 'controlled stop' };
const keep = (name, events, opts) => { const before = events.filter(e => fs.existsSync(e.profile)).map(e => e.profile); assert.deepEqual(cleanupStoppedProfiles(events, opts), []); for (const p of before) assert(fs.existsSync(p), name); rows.push({ name, preserved: before.length }); };
try {
  const normal = make(); keep('normal completion cannot hide a leak', [event(normal)], { ...options, forced: null });
  const foreignAttempt = make(); keep('another attempt is untouched', [event(foreignAttempt, { attempt: 'other-attempt' })], options);
  const foreignCheck = make(); keep('another check is untouched', [event(foreignCheck, { check: 'other-check' })], options);
  const foreignRun = make('other1'); keep('another run is untouched', [event(foreignRun)], options);
  keep('missing run ownership is refused', [event(normal)], { ...options, run: '' });
  const outside = fs.mkdtempSync(path.join(out, 'bracken-headless-' + tag + '-'));
  try { const r = cleanupStoppedProfiles([event(outside)], options); assert.equal(r.length, 1); assert.equal(r[0].removed, false); assert(fs.existsSync(outside)); rows.push({ name: 'outside-temp directory refused', removed: false }); } finally { fs.rmdirSync(outside); }
  const duplicate = make(), removed = cleanupStoppedProfiles([event(duplicate), event(duplicate)], options);
  assert.equal(removed.length, 1); assert.equal(removed[0].removed, true); assert(!fs.existsSync(duplicate)); rows.push({ name: 'recorded stopped profile cleaned exactly once', removed: true });

  for (const mode of ['stopped', 'normal-pass-leak', 'normal-fail-leak']) {
    process.env.BRACKEN_RUN = tag; process.env.BRACKEN_PROCESS_LOG = path.join(out, mode + '.processes.jsonl');
    const code = `import fs from 'node:fs';import os from 'node:os';import path from 'node:path';const mode=${JSON.stringify(mode)},profile=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'bracken-headless-'+process.env.BRACKEN_RUN+'-'));fs.writeFileSync(profile+'/owned-test','synthetic');if(mode==='stopped')process.on('exit',()=>fs.rmSync(profile,{recursive:true,force:true}));const event=type=>fs.appendFileSync(process.env.BRACKEN_PROCESS_LOG,JSON.stringify({type,profile,pid:process.pid,check:process.env.BRACKEN_CHECK,attempt:process.env.BRACKEN_ATTEMPT,time:Date.now(),...(type==='interrupted'?{reason:'controlled stopped-owner regression'}:{})})+String.fromCharCode(10));event('launch');if(mode==='stopped'){event('interrupted');setInterval(()=>{},1000);}else process.exit(mode==='normal-pass-leak'?0:1);`;
    const result = await execute({ name: 'stopped-owner-' + mode, cmd: process.execPath, args: ['--input-type=module', '-e', code], timeout: 10000 }, root, 54872);
    const events = fs.readFileSync(process.env.BRACKEN_PROCESS_LOG, 'utf8').trim().split('\n').map(JSON.parse), profile = events.find(e => e.type === 'launch').profile; owned.push(profile);
    if (mode === 'stopped') {
      assert(result.interrupted && !result.ok, 'cleanup cannot turn an interruption into a PASS');
      assert(!fs.existsSync(profile), 'the parent must finish only the stopped owner cleanup');
      assert(events.some(e => e.type === 'supervisor-profile-cleanup' && e.removed), 'retain cleanup evidence');
    } else {
      assert(fs.existsSync(profile), 'a normal child leak must remain for the ORIGINAL profile-leaks gate');
      assert(!events.some(e => e.type === 'supervisor-profile-cleanup'));
      assert.equal(result.ok, mode === 'normal-pass-leak');
    }
    rows.push({ name: mode, result, profile, removedBeforeTestCleanup: !fs.existsSync(profile) });
  }
  for (const file of ['tools/check.mjs', 'tools/profile-cleanup.mjs', 'tools/profile-sweep.mjs', 'tools/browser-profile.mjs', 'tools/memory-policy.mjs']) {
    const base = execFileSync('git', ['show', 'dc02ecc059959b795f76dee47665b54f349d4e2f:' + file], { cwd: root, encoding: 'utf8' });
    assert.equal(fs.readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n', '\n'), base.replaceAll('\r\n', '\n'), file + ' must remain unchanged');
  }
  fs.writeFileSync(path.join(out, 'receipt.json'), JSON.stringify({ time: new Date().toISOString(), status: 'PASS synthetic stopped-owner regression; original leak gates and interrupted verdicts preserved', rows, unchangedOriginalFixturesAssertionsMemoryPoliciesAndInventory: true, noBrowserOrGameFixtureRun: true }, null, 2) + '\n');
  console.log('PASS stopped-profile: same-attempt/run hard-stop cleanup, interruption stays incomplete, normal/foreign leaks remain visible');
} finally { for (const p of owned) if (fs.existsSync(p)) assert(removeProfileSync(p), 'remove only this test-created owned profile'); }
