// tools/first5-wood.mjs - claude/first5: map -> Lumber Trail (real confirm) -> first minute (the skills card) -> the boss arena: Old Tusker's intro and hint card. node tools/first5-wood.mjs <outDir>
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, seed: 11, speed: false, hints: 'medium' }); const E = e => pg.evalp(e);
let n = 0;
const shot = async name => { await E('BK.draw1&&BK.draw1()').catch(() => {}); await sleep(150); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + String(++n).padStart(2, '0') + '-' + name + '.png', Buffer.from(r.data || r.result.data, 'base64')); console.log('shot', n, name); };
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }); };
const info = async l => console.log(l, await E(`JSON.stringify({state:BK.state,lvl:BK.L&&BK.L.id,teach:BK.teach&&BK.teach().card&&BK.teach().card.id})`));
try {
  const origin = await E('location.origin');
  await pg.send('Page.navigate', { url: 'about:blank' }); await sleep(400); try { await pg.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }); } catch (e) {}
  await pg.send('Page.navigate', { url: origin + '/?demo=1' });
  for (let i = 0; i < 160; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await sleep(250); }
  await sleep(2500);
  for (let i = 0; i < 7; i++) { await key('Enter', 13); await sleep(1100); }
  await E('BK.manualSimulation=true;BK.sim(40)');
  await E(`BK.lesson().leave(true)`); for (let i = 0; i < 500 && !(await E('!!(BK.L&&BK.L.tavern)')); i++) { await E('BK.sim(1)'); await sleep(5); }
  await E('BK.sim(200)');
  await E(`(()=>{const p=BK.players()[0];p.x=36*16+8;p.vx=0;BK.sim(40);BK.press('talk');})()`);
  for (let i = 0; i < 400 && (await E('BK.state')) !== 'map'; i++) { await E('BK.sim(2)'); await sleep(5); }
  await E('BK.sim(60)'); await info('map');
  await E(`BK.press('confirm');BK.sim(5)`); await info('after confirm'); await shot('after-confirm');
  for (let i = 0; i < 600 && (await E('BK.state')) !== 'play'; i++) { await E('BK.sim(3)'); await sleep(5); if (i % 100 === 99) await shot('trans' + i); }
  await info('level'); await E('BK.sim(60)'); await shot('wood-start');
  await E('BK.sim(240)'); await shot('wood-start-4s'); await info('4s');
  // calm stretch for the skills card
  for (let i = 0; i < 80 && !(await E('!!BK.teach().card')); i++) await E('BK.sim(30)');
  await info('card?'); await shot('wood-card');
  await E('(()=>{for(let i=0;i<120;i++)BK.sim(1);BK.teachConfirm();BK.sim(5);})()'); await info('card dismissed');
  // the route: walk it by teleport
  await E(`(async()=>{const {pacing}=await import('/tools/pacing.mjs').catch(()=>({}));})()`).catch(() => {});
  const R = await E(`(()=>{const L=BK.L;return {arena:L.arena&&{x0:L.arena.x0,x1:L.arena.x1,floor:L.arena.floor,trigger:L.arena.trigger},W:L.W,H:L.H,start:L.START}})()`); console.log(JSON.stringify(R));
  await E(`BK.god=true`);
  for (const f of [0.25, 0.5, 0.75]) { await E(`(()=>{const p=BK.players()[0];BK.tp(Math.round(${R.W}*${f}),${R.start.y});BK.sim(90);})()`); await shot('wood-' + f); }
  await E(`BK.tp(Math.round(${R.arena.trigger}/16)-6,Math.round(${R.arena.floor}/16)-1);BK.sim(120)`); await shot('arena-door'); 
  await E(`BK.tp(Math.round(${R.arena.trigger}/16)+1,Math.round(${R.arena.floor}/16)-1);BK.sim(30)`); await shot('arena-enter');
  for (const t of [60, 120, 200]) { await E(`BK.sim(${t})`); await shot('tusker-' + t); }
  await info('boss'); await E('BK.sim(10)'); console.log('hint', await E('JSON.stringify(BK.teach&&BK.teach().card&&BK.teach().card.card)'));
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
