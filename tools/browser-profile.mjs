// tools/browser-profile.mjs — THE THROWAWAY BROWSER PROFILE, and taking it away again (2026-09-21).
// Every tool that drives a headless Chrome gives it a fresh --user-data-dir under the OS temp folder, and until now only
// levelvideo.mjs ever deleted one: 3,130 of them had piled up in Windows Temp. This owns the whole life of one:
//   const run = launchBrowser(exe, args, 'look');   // makes the profile, spawns the browser with it, registers both
//   await run.close();                               // kills the browser TREE, waits for it to exit, removes the profile
// close() is idempotent. If the tool dies first, the process hooks clean up synchronously: normal exit, a thrown error or
// rejected promise (both end in 'exit'), and Ctrl+C / SIGTERM / SIGHUP / SIGBREAK. A process killed outright (TerminateProcess)
// runs nothing - tools/profile-sweep.mjs, run by check.mjs before and after the suite, is the net for that.
// Removal only ever touches a directory that resolves to itself, sits DIRECTLY in the temp folder, is named
// bracken-<kind>-XXXXXX, and is not a link or junction.
import { spawn, spawnSync } from 'child_process';
import { lstatSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { basename, dirname, join } from 'path';
import { runTag } from './ports.mjs';   /* this suite run's own tag, so a leak check can tell its browsers from another session's */

export const KINDS = ['look', 'headless', 'prof', 'video', 'prod'];
/* bracken-<kind>-<run>-<rand> since 2026-09-23; the run tag is OPTIONAL in the pattern so that profiles left behind by
   older builds are still recognised as ours and still get cleaned up. */
export const PROFILE_RE = new RegExp('^bracken-(' + KINDS.join('|') + ')-(?:[A-Za-z0-9]{6}-)?[A-Za-z0-9]{6}$');
export const TEMP = realpathSync(tmpdir());
const sleep = ms => new Promise(r => setTimeout(r, ms));
const busyWait = ms => { const t = Date.now() + ms; while (Date.now() < t) { /* a sync retry has nothing else to wait with */ } };

/* IS THIS ONE OURS TO DELETE? Every question answered from the disk, not from the string we were handed. */
export function isOurProfile(p) {
  try {
    const st = lstatSync(p); if (st.isSymbolicLink() || !st.isDirectory()) return false;   // a junction reads as a link to lstat on Windows
    const real = realpathSync(p); if (real.toLowerCase() !== p.toLowerCase() && real !== p) return false;
    return dirname(real).toLowerCase() === TEMP.toLowerCase() && PROFILE_RE.test(basename(real));
  } catch { return false; }
}
/* delete one profile; bounded retries for the file locks a browser that has only just exited still holds on Windows */
export function removeProfileSync(p, tries = 6) {
  if (!isOurProfile(p)) return false;
  for (let i = 0; i < tries; i++) {
    try { rmSync(p, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }); return true; }
    catch { if (i === 1 || i === 3) killHoldersSync(p); busyWait(250 * (i + 1)); }
  }
  return false;
}
/* WHO STILL HOLDS IT. taskkill /T finds a browser's children by their PARENT, so when the main process has already gone (or goes first) its renderer, GPU and
   crashpad processes are orphans it cannot reach, and each keeps files in the profile open: the delete then fails for as long as they live, and the tool that
   cleaned up properly reads as having leaked (FLAKESWEEP 2026-10-06: profile-cleanup "failure left a profile behind", the suite's profile-leaks). Found by what is on
   their command line - the profile's own unique name - and only ever for a profile that isOurProfile(). */
export function killHoldersSync(p) {
  if (!isOurProfile(p)) return;
  const name = basename(p);
  if (process.platform === 'win32') spawnSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process -Filter \"CommandLine like '%" + name + "%' and Name <> 'powershell.exe'\" | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore', windowsHide: true });
  else spawnSync('pkill', ['-9', '-f', name], { stdio: 'ignore' });
}
export async function removeProfile(p, tries = 8) {
  if (!isOurProfile(p)) return false;
  for (let i = 0; i < tries; i++) {
    try { rmSync(p, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }); return true; }
    catch { if (i === 1 || i === 3) killHoldersSync(p); await sleep(300 * (i + 1)); }
  }
  return false;
}
/* the browser AND its children (renderer, GPU, network): chrome.kill() alone leaves those holding the profile open */
export function killTreeSync(pid) {
  if (!pid) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  else { try { process.kill(-pid, 'SIGKILL'); } catch {} try { process.kill(pid, 'SIGKILL'); } catch {} }
}

const live = new Set();
let hooked = false;
function cleanAllSync() { for (const r of [...live]) r.closeSync(); }
function hook() {
  if (hooked) return; hooked = true;
  process.on('exit', cleanAllSync);                    // also the path taken after an uncaught error or an unhandled rejection
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
    try { process.on(sig, () => { cleanAllSync(); process.exit(sig === 'SIGINT' ? 130 : 143); }); } catch { /* not every signal exists everywhere */ }
  }
}

/* THE DEBUGGING PORT IS THE BROWSER'S TO CHOOSE (2026-10-06, FLAKESWEEP). The tools used to pick 9300 + a random 400 and hope: with six lanes
   each running browsers, two collide, and a tool then talks to - and navigates away - ANOTHER session's page ("the page never put up
   window.BK", "is on port X", a hung evaluation). Pass '--remote-debugging-port=auto' and ask run.devtoolsPort(): Chrome binds port 0 and
   writes the one it got to <profile>/DevToolsActivePort. */
export function launchBrowser(exe, args, kind = 'look') {
  if (!KINDS.includes(kind)) throw new Error('unknown profile kind ' + kind);
  hook();
  const tag = runTag();
  const prof = mkdtempSync(join(TEMP, 'bracken-' + kind + '-' + (tag ? tag + '-' : '')));
  let child;
  args = args.map(a => a === '--remote-debugging-port=auto' ? '--remote-debugging-port=0' : a);
  try { child = spawn(exe, [...args, '--user-data-dir=' + prof], { stdio: 'ignore', detached: process.platform !== 'win32' }); }
  catch (e) { removeProfileSync(prof); throw e; }
  let exited = false; const gone = new Promise(r => { child.once('exit', () => { exited = true; r(); }); child.once('error', () => { exited = true; r(); }); });
  /* close() may be left un-awaited by a tool that then calls process.exit(): the run stays registered until the profile is
     really gone, so the exit hook's closeSync() finishes whatever the async close had not */
  let closing = null, finished = false;
  const finish = () => { finished = true; live.delete(run); };
  const run = {
    child, prof,
    async devtoolsPort(tries = 120) { for (let i = 0; i < tries && !exited; i++) { try { const p = +readFileSync(join(prof, 'DevToolsActivePort'), 'utf8').split(/\r?\n/)[0]; if (p > 0) return p; } catch { /* not written yet */ } await sleep(250); } throw new Error('the browser never told us its debugging port'); },
    get exited() { return exited; },
    close() {
      if (finished) return Promise.resolve(); if (closing) return closing;
      return closing = (async () => { if (!exited) { killTreeSync(child.pid); await Promise.race([gone, sleep(5000)]); } if (!finished) { await removeProfile(prof); finish(); } })();
    },
    closeSync() {
      if (finished) return;
      if (!exited) killTreeSync(child.pid);
      removeProfileSync(prof); finish();
    },
  };
  live.add(run);
  return run;
}
