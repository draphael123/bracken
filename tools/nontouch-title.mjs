// tools/nontouch-title.mjs - desktop title shot (claude/touchrows proof: the non-touch title is unchanged)   node tools/nontouch-title.mjs <out.png>
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
const pg = await openPage({ audio: false, fonts: false }); const sleep = ms => new Promise(r => setTimeout(r, ms));
try {
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?nosw' }); await sleep(1500);
  for (let i = 0; i < 160 && !(await pg.evalp('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)); i++) await sleep(300);
  await sleep(1500); await pg.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'x', code: 'KeyX' }); await pg.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'x', code: 'KeyX' }); await sleep(2500);
  console.log(JSON.stringify(await pg.evalp('BK.ui.titleItems()')) + ' ' + await pg.evalp('BK.state'));
  const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(process.argv[2], Buffer.from(r.result.data, 'base64'));
} finally { await pg.close(); }
