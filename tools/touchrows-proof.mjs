// PAGE TOOL: launches headless Chrome
// tools/touchrows-proof.mjs - 812x375 touch shots + tap-row-height audit of the paged title (claude/touchrows).   node tools/touchrows-proof.mjs <outdir> [demo]
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2] || 'proofs', DEMO = process.argv[3] === 'demo', TAG = DEMO ? 'demo' : 'full';
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const E = (e, t = 120000) => pg.evalp(e, t);
const DPR = 2, report = [];
try {
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 812, height: 375, deviceScaleFactor: DPR, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw' + (DEMO ? '&demo=1' : '') });
  await sleep(1500); for (let i = 0; i < 160 && !(await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)); i++) await sleep(300); await sleep(1500);
  const shot = async name => { await sleep(1500); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/touchrows-' + TAG + '-' + name + '.png', Buffer.from(r.result.data, 'base64')); };
  const tapGame = async i => { const hs = await E('BK.touch.hitBoxes()'), h = hs[i]; const [x, y] = await E(`BK.touch.gameToClient(${h.x + h.w / 2}, ${h.y + h.h / 2})`); await pg.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 9 }] }); await sleep(60); await pg.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(450); };
  const page = async tag => {   // record the window: rows, hit box CSS heights
    const w = await E('BK.ui.titleWin()'), hs = await E('BK.touch.hitBoxes()'), items = await E('BK.ui.titleItems()');
    const cs = await E('BK.touch.gameToClient(0,0)'), c2 = await E('BK.touch.gameToClient(0,1)');
    const per = c2[1] - cs[1];   // CSS px per game px
    const hh = hs.map(h => +(h.h * per).toFixed(1));
    report.push({ tag, rows: w.rows.map(r => r.arrow ? (r.arrow < 0 ? 'PREVIOUS' : 'MORE') : items[r.idx]), cssH: hh, minH: Math.min(...hh) });
    await shot(tag);
  };
  await tapGame(0); await sleep(500);   // press card
  const walk = async (name, list) => {
    for (let n = 0; n < 6; n++) {
      await page(name + '-p' + n);
      const w = await E('BK.ui.titleWin()'); const last = w.rows[w.rows.length - 1];
      if (!(last && last.arrow === 1)) break;
      await tapGame(w.rows.length - 1);
    }
  };
  report.push({ items: await E('BK.ui.titleItems()'), win0: await E('JSON.stringify(BK.ui.titleWin())') });
  await walk('title');
  // back to the top by tapping PREVIOUS until none, then open OPTIONS
  for (let n = 0; n < 6; n++) { const w = await E('BK.ui.titleWin()'); if (!(w.rows[0] && w.rows[0].arrow === -1)) break; await tapGame(0); }
  const tapItem = async name => { for (let k = 0; k < 8; k++) { const items = await E('BK.ui.titleItems()'), w = await E('BK.ui.titleWin()'), idx = items.indexOf(name), p = w.rows.findIndex(r => r.idx === idx); if (p >= 0) { await tapGame(p); return true; } await tapGame(w.rows[0].arrow === -1 && idx < w.rows.find(r => r.idx !== undefined).idx ? 0 : w.rows.length - 1); } return false; };
  report.push({ openOptions: await tapItem('OPTIONS') });
  report.push({ optItems: await E('BK.ui.titleItems()') });
  await walk('options');
  console.log(JSON.stringify(report, null, 1));
} finally { await pg.close(); }
