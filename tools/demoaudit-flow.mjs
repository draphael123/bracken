// tools/demoaudit-flow.mjs - a new player's first minutes on ?demo=1 (claude/demoaudit): title -> hero pick -> lesson -> inn -> map. stills in scratch/lane-reports/demoaudit/flow-*.png
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs'; import { join } from 'node:path';
const OUT = join(ROOT, '..', 'scratch', 'lane-reports', 'demoaudit'); mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
const shot = async n => { await sleep(300); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'flow-' + n + '.png'), Buffer.from(r.data || r.result.data, 'base64')); };
try {
  const origin = await E('location.origin');
  await pg.send('Page.navigate', { url: 'about:blank' }); await sleep(500); try { await pg.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }); } catch (e) { console.log('clear failed', e.message); }
  await pg.send('Page.navigate', { url: origin + '/?demo=1' });
  for (let i = 0; i < 120; i++) { const ok = await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false); if (ok) break; await sleep(250); }
  await sleep(1500);
  const log = []; const st = async l => { const s = await E('JSON.stringify({state:BK.state,stage:BK.ui&&BK.ui.heroPickStage,lvl:BK.L&&BK.L.id||(BK.L&&BK.L.name)})'); log.push(l + ' ' + s); console.log(l, s); };
  await st('loaded'); console.log(await E('JSON.stringify(Object.keys(localStorage).map(k=>[k,localStorage[k].slice(0,120)]))')); await shot('1-title');
  for (let i = 2; i <= 7; i++) { for (const type of ['keyDown','keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 }); await sleep(900); await st('after confirm ' + (i - 1)); await shot(i + '-step'); }
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
