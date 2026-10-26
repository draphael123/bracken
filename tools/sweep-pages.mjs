// tools/sweep-pages.mjs - THE SHARED FORM OF A WHOLE-GAME SWEEP (claude/redcleanup, 10-26; scratch/brief-redcleanup-1026.md part 2).
// A sweep that drives every level inside ONE page for ten minutes or more is a sweep that hangs: the page keeps every level's canvases, timers and
// caches, memguard (scratch/memguard.ps1) kills a headless Chrome when the PC runs low, and the tool then sits on Runtime.evaluate for its whole
// timeout (30 min in drawn-solids / visible-supports, 1 h in boss-fight-end) saying nothing. A silent stall is worse than a slow pass. So:
//   - the levels go in CHUNKS: a fresh page (fresh Chrome) every `chunk` levels, and again after any level that timed out or lost its page;
//   - EVERY LEVEL has a hard time limit; one that passes it is a NAMED RESULT ({ id, error: 'TIMEOUT ...' }), never a stall - the caller turns it into a red;
//   - one line per level is printed AS IT GOES (so a log shows where it is);
//   - before each fresh page it WAITS for free RAM (it never skips and never warns-and-goes): `minFreeMB` (default 1500, the lanes' own rule).
// usage: const rows = await sweepLevels(ids, (pg, id) => pg.evalp(code(id), ms), { label: 'corpses', openOpts: { audio: true } });
import os from 'node:os';
import { openPage } from './cdp.mjs';

const MB = 1024 * 1024, sleep = ms => new Promise(r => setTimeout(r, ms));
export async function waitForRam(minFreeMB = 1500, label = 'sweep', maxWaitMs = 20 * 60 * 1000) {
  const t0 = Date.now(); let said = false;
  while (os.freemem() / MB < minFreeMB) {
    if (Date.now() - t0 > maxWaitMs) throw new Error(label + ': free RAM stayed under ' + minFreeMB + ' MB for ' + Math.round(maxWaitMs / 60000) + ' min (' + Math.round(os.freemem() / MB) + ' MB free)');
    if (!said) { console.log('  [' + label + '] waiting for free RAM >= ' + minFreeMB + ' MB (' + Math.round(os.freemem() / MB) + ' free)'); said = true; }
    await sleep(5000);
  }
}
/* ids: the level ids; run(pg, id) -> the level's result (it must pass its own limit to pg.evalp: perLevelMs here is what the tool is told to use); the rows come back
   in order as { id, ms, result } or { id, ms, error }. A level whose page dies or answers late is reported, the page is dropped, the sweep goes on. */
export async function sweepLevels(ids, run, o = {}) {
  const { chunk = 8, perLevelMs = 150000, label = 'sweep', openOpts = { audio: false, fonts: false }, minFreeMB = 1500 } = o;
  const rows = []; let pg = null, inPage = 0;
  const drop = async () => { if (pg) { try { await Promise.race([pg.close(), sleep(15000)]); } catch {} pg = null; inPage = 0; } };
  try {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (!pg || inPage >= chunk) { await drop(); await waitForRam(minFreeMB, label); pg = await openPage(openOpts); }
      const t0 = Date.now(); let row;
      try { row = { id, result: await Promise.race([run(pg, id, perLevelMs), sleep(perLevelMs + 15000).then(() => { throw new Error('did not answer within ' + perLevelMs + ' ms'); })]) }; }
      catch (e) { row = { id, error: 'TIMEOUT/LOST PAGE after ' + Math.round((Date.now() - t0) / 1000) + ' s (limit ' + Math.round(perLevelMs / 1000) + ' s): ' + String(e && e.message || e).split('\n')[0].slice(0, 160) }; await drop(); }
      row.ms = Date.now() - t0; inPage++; rows.push(row);
      console.log('  [' + label + ' ' + (i + 1) + '/' + ids.length + '] ' + id + ' ' + (row.error ? 'RED ' + row.error : 'ok') + ' ' + Math.round(row.ms / 1000) + ' s, ' + Math.round(os.freemem() / MB) + ' MB free');
    }
  } finally { await drop(); }
  return rows;
}
/* a page's own errors are read through `pg` before it is dropped: the helper does not hide them - pass `errors` back from run() if the tool wants them */
