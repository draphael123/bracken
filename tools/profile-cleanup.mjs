/* tools/profile-cleanup.mjs — EVERY WAY A TOOL CAN END, AND WHAT IT LEAVES IN TEMP (2026-09-21).
   Each case runs in its own node process and must leave no new bracken-* profile and no browser on one:
     normal       openPage, close
     failure      openPage, then an uncaught throw with no close
     rejection    openPage, then an unhandled rejection
     sigint       openPage, then the SIGINT handler (what a console Ctrl+C reaches; on Windows process.kill(self,'SIGINT')
                  is a TerminateProcess that runs no handler at all - that is the 'killed' case)
     exit         openPage, close() not awaited, process.exit() at once
     no-browser   launchBrowser of an executable that does not exist (a startup error)
     dies-early   launchBrowser of a "browser" that exits at once (a startup crash)
     killed       openPage, then the process TERMINATED outright: nothing in it runs, so the browser is orphaned - and
                  profile-sweep --kill-orphans --since must end the browser and remove the profile                    */
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TEMP, PROFILE_RE } from './browser-profile.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ours = () => new Set(readdirSync(TEMP).filter(n => PROFILE_RE.test(n)));
const browsersOn = names => { if (!names.length) return 0; const r = spawnSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' or Name='msedge.exe'\" | Select-Object -ExpandProperty CommandLine"], { encoding: 'utf8', windowsHide: true });
  return (r.stdout || '').split('\n').filter(l => names.some(n => l.includes(n))).length; };
const PORT = 5991;
/* and the dev server the tool started on PORT goes with it (serve.mjs watches BRACKEN_PARENT) */
const serverGone = async () => { for (let i = 0; i < 40; i++) { try { await fetch('http://localhost:' + PORT + '/', { signal: AbortSignal.timeout(800) }); } catch { return true; } await new Promise(r => setTimeout(r, 250)); } return false; };
const page = `import{openPage}from'./tools/cdp.mjs';const pg=await openPage({port:${PORT},audio:false,fonts:false});await pg.evalp('1+1');console.log('READY');`;
const CASES = {
  normal: page + `await pg.close();`,
  failure: page + `throw new Error('a tool that fails');`,
  rejection: page + `Promise.reject(new Error('nobody catches this'));await new Promise(r=>setTimeout(r,60000));`,
  sigint: page + `process.emit('SIGINT');await new Promise(r=>setTimeout(r,60000));`,
  exit: page + `pg.close();process.exit(0);`,
  'no-browser': `import{launchBrowser}from'./tools/browser-profile.mjs';const r=launchBrowser('C:/no/such/browser.exe',['about:blank'],'look');await new Promise(r=>setTimeout(r,300));await r.close();console.log('READY');`,
  'dies-early': `import{launchBrowser}from'./tools/browser-profile.mjs';const r=launchBrowser(process.execPath,['-e','process.exit(3)'],'look');await new Promise(r=>setTimeout(r,800));await r.close();console.log('READY');`,
  killed: page + `await new Promise(r=>setTimeout(r,60000));`,
};
const rows = [];
for (const [name, code] of Object.entries(CASES)) {
  const before = ours(), t0 = Date.now();
  const child = spawn(process.execPath, ['--input-type=module', '-e', code], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = ''; child.stdout.on('data', d => { out += d; }); child.stderr.on('data', () => {});
  const done = new Promise(r => child.once('exit', c => r(c)));
  if (name === 'killed') {
    for (let i = 0; i < 600 && !out.includes('READY'); i++) await new Promise(r => setTimeout(r, 100));
    spawnSync('taskkill', ['/PID', String(child.pid), '/F'], { stdio: 'ignore' });   // the node process only: its browser is left behind, as it would be
    await done;
    const orphaned = [...ours()].filter(n => !before.has(n));
    const sweep = spawnSync(process.execPath, ['tools/profile-sweep.mjs', '--kill-orphans', '--since', String(t0 - 1000)], { cwd: ROOT, encoding: 'utf8' });
    const rep = JSON.parse(sweep.stdout.trim().split('\n').pop());
    const left = [...ours()].filter(n => !before.has(n));
    const gone = await serverGone();
    rows.push({ name, orphanedBeforeSweep: orphaned.length, orphansKilled: rep.orphansKilled, left: left.length, browsers: browsersOn(orphaned), serverGone: gone });
    assert.ok(gone, 'the dev server of the killed tool must go too');
    assert.ok(orphaned.length >= 1, 'a hard kill really does orphan the profile (else this case proves nothing)');
    assert.equal(left.length, 0, 'the sweep removes what a killed tool left'); assert.equal(browsersOn(orphaned), 0, 'and ends its browser');
    continue;
  }
  const exit = await Promise.race([done, new Promise(r => setTimeout(() => r('timeout'), 120000))]);
  if (exit === 'timeout') child.kill();
  await new Promise(r => setTimeout(r, 300));
  const made = [...ours()].filter(n => !before.has(n));
  const gone = await serverGone();
  rows.push({ name, exit, ready: out.includes('READY'), left: made.length, serverGone: gone });
  assert.ok(gone, name + ' left its dev server running');
  assert.notEqual(exit, 'timeout', name + ' hung');
  assert.equal(made.length, 0, name + ' left a profile behind: ' + made.join(', '));
}
console.log(JSON.stringify(rows));
