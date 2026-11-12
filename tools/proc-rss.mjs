// tools/proc-rss.mjs - THE MEMORY OF ONE TEST BROWSER'S WHOLE PROCESS TREE, read from the OS (claude/browserleak 11-12).
//   const m = await treeRss(pg.profile);   // pg.profile: the browser's throwaway profile folder name (tools/cdp.mjs), found on every process's command line
//   -> { total, browser, renderers, biggest, n }  in MB, or null when the OS would not say.
// `browser` = every process that is not a renderer (browser, GPU, network, storage, utility): what a long run can accumulate that closing a page does not give back.
// `renderers` = the page processes (they die with their browser context). Same number memguard.ps1 judges (working set), so a reading here predicts a kill there.
import { execFile } from 'child_process';

const run = (cmd, args) => new Promise(res => execFile(cmd, args, { timeout: 15000, windowsHide: true, maxBuffer: 8 << 20 }, (e, out) => res(e ? null : String(out))));
export async function treeRss(profName) {
  if (!profName || /[^A-Za-z0-9_.-]/.test(profName)) return null;
  const rows = [];   /* [bytes, isRenderer] */
  if (process.platform === 'win32') {
    const out = await run('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe' and CommandLine like '%" + profName + "%'\" | ForEach-Object { '' + $_.WorkingSetSize + '|' + [int]($_.CommandLine -match '--type=renderer') }"]);
    if (out === null) return null;
    for (const l of out.split(/\r?\n/)) { const m = /^(\d+)\|([01])$/.exec(l.trim()); if (m) rows.push([+m[1], m[2] === '1']); }
  } else {
    const out = await run('ps', ['-eo', 'rss=,args=']);
    if (out === null) return null;
    for (const l of out.split('\n')) if (l.includes(profName)) { const m = /^\s*(\d+)\s+(.*)$/.exec(l); if (m) rows.push([+m[1] * 1024, /--type=renderer/.test(m[2])]); }
  }
  if (!rows.length) return null;
  const mb = b => Math.round(b / 1048576);
  return { total: mb(rows.reduce((a, r) => a + r[0], 0)), browser: mb(rows.filter(r => !r[1]).reduce((a, r) => a + r[0], 0)), renderers: mb(rows.filter(r => r[1]).reduce((a, r) => a + r[0], 0)), biggest: mb(Math.max(...rows.map(r => r[0]))), n: rows.length };
}
