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
import { lstatSync, mkdtempSync, realpathSync, rmSync } from 'fs';
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
    catch { busyWait(250 * (i + 1)); }
  }
  return false;
}
export async function removeProfile(p, tries = 8) {
  if (!isOurProfile(p)) return false;
  for (let i = 0; i < tries; i++) {
    try { rmSync(p, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }); return true; }
    catch { await sleep(300 * (i + 1)); }
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

export function launchBrowser(exe, args, kind = 'look') {
  if (!KINDS.includes(kind)) throw new Error('unknown profile kind ' + kind);
  hook();
  const tag = runTag();
  const prof = mkdtempSync(join(TEMP, 'bracken-' + kind + '-' + (tag ? tag + '-' : '')));
  let child;
  try { child = spawn(exe, [...args, '--user-data-dir=' + prof], { stdio: 'ignore', detached: process.platform !== 'win32' }); }
  catch (e) { removeProfileSync(prof); throw e; }
  let exited = false; const gone = new Promise(r => { child.once('exit', () => { exited = true; r(); }); child.once('error', () => { exited = true; r(); }); });
  /* close() may be left un-awaited by a tool that then calls process.exit(): the run stays registered until the profile is
     really gone, so the exit hook's closeSync() finishes whatever the async close had not */
  let closing = null, finished = false;
  const finish = () => { finished = true; live.delete(run); };
  const run = {
    child, prof,
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
