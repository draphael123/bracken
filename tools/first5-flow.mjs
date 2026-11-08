// tools/first5-flow.mjs - a brand-new player's first minutes on ?demo=1 (claude/first5): title -> new save -> opening -> lesson -> inn -> map. Presses Enter step by step, stills + state + visible UI text per step. node tools/first5-flow.mjs <outDir> [steps]
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2], N = +(process.argv[3] || 14); mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, seed: 11, speed: false, hints: 'medium' }); const E = e => pg.evalp(e);
const shot = async n => { await sleep(350); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + n + '.png', Buffer.from(r.data || r.result.data, 'base64')); };
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }); };
try {
  const origin = await E('location.origin');
  await pg.send('Page.navigate', { url: 'about:blank' }); await sleep(400); try { await pg.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }); } catch (e) {}
  await pg.send('Page.navigate', { url: origin + '/?demo=1' });
  for (let i = 0; i < 160; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await sleep(250); }
  await sleep(2500);
  const st = async l => { const s = await E(`JSON.stringify({state:BK.state,lvl:BK.L&&BK.L.id,ui:[...document.querySelectorAll('#ui *, .overlay, .card, [id]')].filter(e=>e.offsetParent&&e.innerText&&e.children.length<4&&e.id&&/card|panel|menu|overlay|pick|opening|dialog|teach|lives|diff/i.test(e.id)).slice(0,6).map(e=>e.id+':'+e.innerText.replace(/\s+/g,' ').slice(0,260))})`); console.log(l, s); };
  await st('loaded'); await shot('01-title');
  for (let i = 2; i <= N; i++) { await key('Enter', 13); await sleep(1200); await st('step ' + (i - 1)); await shot(String(i).padStart(2, '0') + '-step'); }
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
