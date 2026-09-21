// tools/profile-sweep.mjs — THE NET UNDER browser-profile.mjs: abandoned BRACKEN browser profiles in the temp folder.
//   node tools/profile-sweep.mjs                 delete abandoned ones idle for 30 min or more (prints a JSON report)
//   node tools/profile-sweep.mjs --dry-run       say what it would delete, delete nothing
//   node tools/profile-sweep.mjs --idle 10       idle threshold in minutes
//   node tools/profile-sweep.mjs --since <ms> --check   the suite's own leak check: any profile made after <ms> (epoch)
//                                                that no live process uses is a LEAK - it is removed, and the exit code is 1
// A profile is deleted only when ALL of these hold: its name is bracken-<kind>-XXXXXX, it sits directly in the temp folder,
// it is a real directory (not a link or junction) that resolves to itself, no running process has its path on its command
// line, and every file in it is older than the idle threshold - an unreadable one makes it UNCERTAIN, and it is kept.
// --kill-orphans also ends a headless browser that is running on a BRACKEN profile and whose parent process is gone (the tool
// that launched it was killed outright); the browser's profile then goes with the rest. Nothing else is ever touched:
// not a personal browser profile, not a scoped_dir, not another tool's temp folder.
import { readdirSync, lstatSync, statfsSync } from 'fs';
import { join } from 'path';
import { spawn, spawnSync } from 'child_process';
import { TEMP, PROFILE_RE, isOurProfile, removeProfileSync, killTreeSync } from './browser-profile.mjs';

const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const DRY = argv.includes('--dry-run'), CHECK = argv.includes('--check'), ORPHANS = argv.includes('--kill-orphans');
const JOBS = Math.max(1, +opt('jobs', 1)), MEASURE = argv.includes('--measure');   /* --jobs N: N deletes at once (the cost is per file: ~5 ms each on this disk); --measure: add up the bytes first */
const IDLE = +opt('idle', 30) * 60000, SINCE = opt('since', null) === null ? null : +opt('since');

function processes() {
  if (process.platform !== 'win32') { const r = spawnSync('ps', ['-eo', 'pid=,ppid=,args='], { encoding: 'utf8' }); return (r.stdout || '').split('\n').filter(Boolean).map(l => { const m = l.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/); return m && { pid: +m[1], ppid: +m[2], cmd: m[3] }; }).filter(Boolean); }
  const r = spawnSync('powershell', ['-NoProfile', '-Command', 'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress'], { encoding: 'utf8', maxBuffer: 64 << 20, windowsHide: true });
  if (r.status !== 0 || !r.stdout) throw new Error('could not list processes: refusing to decide what is in use');
  return JSON.parse(r.stdout).map(p => ({ pid: p.ProcessId, ppid: p.ParentProcessId, cmd: p.CommandLine || '' }));
}
/* the newest modification anywhere in it; null when anything in it cannot be read (then we do not know it is idle) */
function newest(dir) {
  let t = 0;
  const walk = d => { const st = lstatSync(d); t = Math.max(t, st.mtimeMs, st.ctimeMs); if (st.isDirectory() && !st.isSymbolicLink()) for (const n of readdirSync(d)) walk(join(d, n)); };
  try { walk(dir); return t; } catch { return null; }
}
function size(dir) { let n = 0; const walk = d => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (e.isFile()) n += lstatSync(p).size; } }; try { walk(dir); } catch {} return n; }
const free = () => { try { const s = statfsSync(TEMP); return s.bavail * s.bsize; } catch { return null; } };

const report = { temp: TEMP, dryRun: DRY, idleMin: IDLE / 60000, found: 0, deleted: 0, bytes: 0, skipped: { inUse: 0, recent: 0, uncertain: 0, notOurs: 0, failed: 0, beforeRun: 0 }, orphansKilled: 0, leaks: [] };
const freeBefore = free();
let procs = processes();
if (ORPHANS) {
  const alive = new Set(procs.map(p => p.pid));
  for (const p of procs) if (/--user-data-dir=\S*bracken-(look|headless|prof|video|prod)-/i.test(p.cmd) && !/--type=/.test(p.cmd) && /--headless/.test(p.cmd) && !alive.has(p.ppid)) { if (!DRY) killTreeSync(p.pid); report.orphansKilled++; }
  if (report.orphansKilled && !DRY) procs = processes();
}
const cmds = procs.map(p => p.cmd.toLowerCase());
const now = Date.now(), queue = [];
for (const name of readdirSync(TEMP)) {
  if (!PROFILE_RE.test(name)) continue;
  const p = join(TEMP, name); report.found++;
  if (!isOurProfile(p)) { report.skipped.notOurs++; continue; }
  if (cmds.some(c => c.includes(name.toLowerCase()))) { report.skipped.inUse++; continue; }
  if (SINCE !== null) { try { if (lstatSync(p).birthtimeMs < SINCE) { report.skipped.beforeRun++; continue; } } catch { report.skipped.uncertain++; continue; } }   /* made before this run: not this run's leak, and no walk */
  const t = newest(p); if (t === null) { report.skipped.uncertain++; continue; }
  if (SINCE !== null) { if (t < SINCE) { report.skipped.beforeRun++; continue; } report.leaks.push(name); }
  else if (now - t < IDLE) { report.skipped.recent++; continue; }
  const b = MEASURE || DRY ? size(p) : 0;
  if (DRY) { report.deleted++; report.bytes += b; continue; }
  queue.push([p, b]);
}
/* THE DELETES. One at a time is removeProfileSync; with --jobs the native rmdir runs N at once, each path checked again the
   moment before it goes, and rmSync (with its retries) takes whatever rmdir left */
const del = ([p, b]) => new Promise(done => {
  if (!isOurProfile(p)) { report.skipped.notOurs++; return done(); }
  const fin = () => { if (removeProfileSync(p, 3) || !isOurProfile(p)) { report.deleted++; report.bytes += b; } else report.skipped.failed++; done(); };
  if (JOBS === 1 || process.platform !== 'win32') return fin();
  const c = spawn('cmd', ['/c', 'rmdir', '/s', '/q', p], { stdio: 'ignore', windowsHide: true }); c.once('exit', fin); c.once('error', fin);
});
{ let i = 0; await Promise.all(Array.from({ length: JOBS }, async () => { while (i < queue.length) await del(queue[i++]); })); }
report.freeBefore = freeBefore; report.freeAfter = free(); report.freed = report.freeAfter !== null && freeBefore !== null ? report.freeAfter - freeBefore : null;
console.log(JSON.stringify(report));
if (CHECK && report.leaks.length) { console.error(report.leaks.length + ' browser profile(s) leaked by this run (removed): ' + report.leaks.slice(0, 5).join(', ')); process.exit(1); }
