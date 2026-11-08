// tools/first5-esc.mjs - claude/first5b: the new-save card still, and the inn card closing on ESC. node tools/first5-esc.mjs <outDir>
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, seed: 11, speed: false, hints: 'medium' }); const E = e => pg.evalp(e);
const shot = async name => { await E('BK.draw1&&BK.draw1()').catch(() => {}); await sleep(200); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + name + '.png', Buffer.from(r.data || r.result.data, 'base64')); };
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }); };
try {
  const origin = await E('location.origin');
  await pg.send('Page.navigate', { url: 'about:blank' }); await sleep(400); try { await pg.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }); } catch (e) {}
  await pg.send('Page.navigate', { url: origin + '/?demo=1' });
  for (let i = 0; i < 160; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await sleep(250); }
  await sleep(2500);
  for (let i = 0; i < 5; i++) { await key('Enter', 13); await sleep(1100); }
  await shot('newsave');
  for (let i = 0; i < 2; i++) { await key('Enter', 13); await sleep(1100); }
  await E('BK.manualSimulation=true;BK.sim(40)'); await E(`BK.lesson().leave(true)`);
  for (let i = 0; i < 500 && !(await E('!!(BK.L&&BK.L.tavern)')); i++) { await E('BK.sim(1)'); await sleep(5); }
  await E('BK.sim(60)'); const up = await E('BK.lesson().O.cardUp()');
  await shot('inn-card'); await key('Escape', 27); await E('BK.sim(5)');
  console.log('card up', up, 'after ESC', await E('BK.lesson().O.cardUp()'), 'state', await E('BK.state'));
  await shot('inn-after-esc'); console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
