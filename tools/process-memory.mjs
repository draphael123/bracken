// Read working sets only. The caller supplies the PID of a browser it launched; never enumerate-and-kill by name.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
export async function browserMemory(rootPid, profile) {
  let rows;
  if (process.platform === 'win32') {
    const script = 'Get-CimInstance Win32_Process -Filter "Name=\'chrome.exe\' or Name=\'msedge.exe\'" | Select-Object ProcessId,ParentProcessId,WorkingSetSize,CommandLine | ConvertTo-Json -Compress';
    const { stdout } = await exec('powershell', ['-NoProfile', '-Command', script], { windowsHide: true, timeout: 8000, maxBuffer: 8 << 20 });
    const data = JSON.parse(stdout || '[]');
    rows = (Array.isArray(data) ? data : [data]).map(p => ({ pid: +p.ProcessId, ppid: +p.ParentProcessId,
      mb: +p.WorkingSetSize / 1048576, cmd: p.CommandLine || '' }));
  } else {
    const { stdout } = await exec('ps', ['-eo', 'pid=,ppid=,rss=,args='], { timeout: 8000, maxBuffer: 8 << 20 });
    rows = stdout.split('\n').flatMap(l => { const m = l.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/);
      return m ? [{ pid: +m[1], ppid: +m[2], mb: +m[3] / 1024, cmd: m[4] }] : []; });
  }
  const root = rows.find(p => p.pid === rootPid && p.cmd.includes(profile));
  if (!root) return { totalMb: 0, rendererMb: 0, pids: [] };
  const owned = new Set([rootPid]);
  for (let changed = true; changed;) { changed = false;
    for (const p of rows) if (!owned.has(p.pid) && owned.has(p.ppid)) { owned.add(p.pid); changed = true; }
  }
  const mine = rows.filter(p => owned.has(p.pid));
  return { totalMb: Math.round(mine.reduce((n, p) => n + p.mb, 0)),
    rendererMb: Math.round(Math.max(0, ...mine.filter(p => /--type=renderer\b/.test(p.cmd)).map(p => p.mb))),
    pids: mine.map(p => p.pid) };
}
