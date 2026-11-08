// tools/first5-map.mjs - claude/first5: after the new-save flow (real keys) the lesson is SKIPPED (verified by first5-play), then the inn -> the campaign table -> the map -> the Lumber Trail. node tools/first5-map.mjs <outDir>
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, seed: 11, speed: false, hints: 'medium' }); const E = e => pg.evalp(e);
let n = 0;
const shot = async name => { await E('BK.draw1&&BK.draw1()').catch(() => {}); await sleep(150); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + String(++n).padStart(2, '0') + '-' + name + '.png', Buffer.from(r.data || r.result.data, 'base64')); console.log('shot', n, name); };
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }); };
const info = async l => console.log(l, await E(`JSON.stringify({state:BK.state,lvl:BK.L&&BK.L.id})`));
try {
  const origin = await E('location.origin');
  await pg.send('Page.navigate', { url: 'about:blank' }); await sleep(400); try { await pg.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }); } catch (e) {}
  await pg.send('Page.navigate', { url: origin + '/?demo=1' });
  for (let i = 0; i < 160; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await sleep(250); }
  await sleep(2500);
  for (let i = 0; i < 7; i++) { await key('Enter', 13); await sleep(1100); }
  await E('BK.manualSimulation=true;BK.sim(40)');
  await E(`BK.lesson().leave(true)`); for (let i = 0; i < 500 && !(await E('!!(BK.L&&BK.L.tavern)')); i++) { await E('BK.sim(1)'); await sleep(5); }
  await E('BK.sim(120)'); await info('inn'); await shot('inn-arrive');
  await E('BK.press("confirm");BK.sim(30)'); await shot('inn-after-confirm');
  // the inn: walk to the campaign table (x=36 tiles)
  await E(`(()=>{const p=BK.players()[0];p.x=36*16+8;p.vx=0;BK.sim(40);})()`); await shot('inn-table');
  await E(`BK.press('talk');BK.sim(10)`); await info('after talk at table'); await sleep(300);
  for (let i = 0; i < 400 && (await E('BK.state')) !== 'map'; i++) { await E('BK.sim(2)'); await sleep(5); }
  await E('BK.sim(60)'); await info('map'); await shot('map-first');
  console.log(JSON.stringify(await E('BK.mapNodes()')));
  for (const id of ['wood', 'hornetsnest', 'marsh', 'kings', 'burning']) { if (await E(`BK.mapLook('${id}')`)) { await E('BK.sim(40)'); await shot('map-' + id); } }
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
