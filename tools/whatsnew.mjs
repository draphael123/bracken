// tools/whatsnew.mjs - WHAT'S NEW ON THE TITLE MENU (claude/whatsnew, 2026-10-11).
//   DATA   docs/updates.json is valid: newest first, each entry a date + 3-6 short player lines (no branch names), a batch number.
//   ROW    the title board has a WHAT'S NEW row showing the newest entry's date, with a dot until it is opened (seen-date in localStorage).
//   OPEN   choosing the row opens the list (the newest date is on screen), the dot clears, ESC goes back to the title; the dot stays gone.
//   FIT    every row of the list stays inside the panel.
// The expected date and player lines come from docs/updates.json, so a new batch needs no checker edit.
// usage: node tools/whatsnew.mjs [--selftest-red]
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';

const data = JSON.parse(readFileSync(join(ROOT, 'docs/updates.json'), 'utf8'));
const selftestRed = process.argv.includes('--selftest-red');
assert.ok(Array.isArray(data) && data.length >= 5, 'updates.json is a list with the backfilled deploys');
for (const e of data) {
  assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/, 'a date: ' + JSON.stringify(e));
  assert.ok(Number.isInteger(e.batch), 'a batch number: ' + e.date);
  assert.ok(e.lines.length >= 3 && e.lines.length <= 6, e.date + ' b' + e.batch + ' has 3-6 lines, has ' + e.lines.length);
  for (const l of e.lines) assert.ok(l.length <= 90 && !/claude\/|branch|\.js|\.mjs/i.test(l), 'a short player line: ' + l);
}
for (let i = 1; i < data.length; i++) assert.ok(data[i - 1].date > data[i].date || (data[i - 1].date === data[i].date && data[i - 1].batch > data[i].batch), 'newest first at ' + i);
console.log('ok  data           ' + data.length + ' deploys, newest ' + data[0].date + ' (batch ' + data[0].batch + '), 3-6 player lines each');

const pg = await openPage({ audio: false, fonts: true });
try {
  await pg.evalp(`(async()=>{ await BK.WN.loadUpdates(); try { localStorage.removeItem(BK.WN.SEEN_KEY); } catch {} BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.ui.pressCard = false; BK.state = 'title'; BK.step(150); return 1; })()`, 60000);
  if (selftestRed) await pg.evalp(`(()=>{ const W=BK.WN, u=W.getUpdates().map(x=>({ ...x, lines:[...x.lines] })); u[0].lines.shift(); W.setUpdates(u); })()`);
  const REC = `(()=>{ window.__textRec = []; BK.step(2); const r = window.__textRec.filter(x => x.kind === 'text').map(x => ({ s: x.s, x0: x.x0, y0: x.y0, w: x.w, h: x.h })); window.__textRec = null; return r; })()`;
  const newest = await pg.evalp('BK.WN.shortDate(BK.WN.newestDate())');
  const newestExpected = await pg.evalp(`BK.WN.shortDate(${JSON.stringify(data[0].date)})`);
  assert.equal(newest, newestExpected, 'the newest entry comes from updates.json');
  assert.ok((await pg.evalp('BK.ui.titleTop()')).includes("WHAT'S NEW"), "the title board has the WHAT'S NEW row");
  let r = await pg.evalp(REC);
  assert.ok(r.some(x => x.s === newest), "the row shows the newest date: " + r.map(x => x.s).join(' / '));
  assert.equal(await pg.evalp('BK.WN.hasNew()'), true, 'a dot until it is opened');
  const idx = await pg.evalp(`BK.ui.titleTop().indexOf("WHAT'S NEW")`);
  await pg.evalp(`(()=>{ BK.ui.titleI = ${idx}; return 1; })()`);
  for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await pg.evalp('BK.step(5)');
  assert.equal(await pg.evalp('BK.state'), 'whatsnew', 'choosing the row opens the list');
  assert.equal(await pg.evalp('BK.WN.hasNew()'), false, 'opening it clears the dot');
  r = await pg.evalp(REC);
  assert.ok(r.some(x => x.s === newest), 'the newest date heads the list: ' + r.map(x => x.s).join(' / '));
  // Join wrapped text rows before comparing: the panel may split a player line across two draws.
  const drawn = r.map(x => x.s).join(' ').replace(/\s+/g, ' ').toLowerCase();
  for (const line of data[0].lines) assert.ok(drawn.includes(line.toLowerCase()), 'newest player line is drawn: ' + line);
  const { VW, VH } = await pg.evalp('BK.view');
  for (const x of r) assert.ok(x.x0 >= 24 && x.x0 + x.w <= VW - 24 && x.y0 >= 6 && x.y0 + x.h <= VH - 6, 'inside the panel: ' + x.s + ' ' + JSON.stringify(x));
  /* scrolling: DOWN moves, and it never goes past the end */
  const oldest = await pg.evalp(`BK.WN.shortDate(${JSON.stringify(data.at(-1).date)})`);
  let previousScroll = -1;
  for (let i = 0; i < 1500; i++) {   /* (batch131: the list passed 400 rows with 51 deploys) */
    const scroll = await pg.evalp('BK.wnScroll');
    if (scroll === previousScroll) break;
    previousScroll = scroll;
    for (const type of ['keyDown', 'keyUp']) { await pg.send('Input.dispatchKeyEvent', { type, key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 }); await pg.evalp('BK.step(2)'); }
  }
  assert.ok(await pg.evalp('BK.wnScroll') > 0, 'DOWN scrolls the list');
  r = await pg.evalp(REC);
  assert.ok(r.some(x => x.s === oldest), 'the oldest entry is reachable by scrolling');
  const end = await pg.evalp('BK.wnScroll');
  for (let i = 0; i < 20; i++) for (const type of ['keyDown', 'keyUp']) { await pg.send('Input.dispatchKeyEvent', { type, key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 }); await pg.evalp('BK.step(2)'); }
  assert.equal(await pg.evalp('BK.wnScroll'), end, 'scrolling never goes past the end');
  for (const x of r) assert.ok(x.y0 + x.h <= VH - 6, 'still inside after scrolling: ' + x.s);
  for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await pg.evalp('BK.step(5)');
  assert.equal(await pg.evalp('BK.state'), 'title', 'ESC goes back to the title');
  r = await pg.evalp(REC);
  assert.ok(r.some(x => x.s === newest), 'the row is still there, dot gone');
  assert.equal(await pg.evalp('BK.WN.hasNew()'), false, 'and the dot stays gone');
  /* a NEWER entry brings the dot back */
  await pg.evalp(`(()=>{ const W = BK.WN; W.setUpdates([{ date: '2026-12-31', batch: 99, lines: ['x'] }, ...W.getUpdates()]); return 1; })()`);
  assert.equal(await pg.evalp('BK.WN.hasNew()'), true, 'a newer deploy lights the dot again');
  const errs = pg.errors;
  assert.deepEqual(errs, [], 'no console errors: ' + JSON.stringify(errs));
  console.log("ok  whatsnew       row with the date + dot, opens, dot clears and stays cleared, scrolls inside the panel, ESC back, no errors");
} finally { pg.close(); }
