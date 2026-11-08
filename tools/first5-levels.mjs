// tools/first5-levels.mjs - claude/first5: PART=map  the map's TAB level list on ?demo=1 (after the new-save flow + inn);
//   PART=levels IDS=a,b,c  each demo level loads and runs (a still at its start and at its boss arena), a FRESH document per level;
//   PART=end  the end card after King Gorm (win card -> Z -> demoend).   node tools/first5-levels.mjs <outDir>   (N0=<n> offsets the still numbers)
import { openPage } from './cdp.mjs';
import { DEMO_IDS } from '../src/demo-slots.js';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const PART = process.env.PART || 'levels', ids = process.env.IDS ? process.env.IDS.split(',') : [...DEMO_IDS];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, seed: 11, speed: false, hints: 'medium' }); const E = e => pg.evalp(e);
let n = +(process.env.N0 || 0);
const shot = async name => { await E('BK.draw1&&BK.draw1()').catch(() => {}); await sleep(150); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + String(++n).padStart(2, '0') + '-' + name + '.png', Buffer.from(r.data || r.result.data, 'base64')); console.log('shot', n, name); };
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }); };
let ORIGIN = ''; const fresh = async (manual = true) => { const origin = ORIGIN; await pg.send('Page.navigate', { url: origin + '/?demo=1' }); await sleep(1500); for (let i = 0; i < 160; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await sleep(250); } if (manual) await E('BK.manualSimulation=true'); };
try {
  const origin = await E('location.origin'); ORIGIN = origin;
  await pg.send('Page.navigate', { url: 'about:blank' }); await sleep(400); try { await pg.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }); } catch (e) {}
  await fresh(PART !== 'map');
  if (PART === 'map') {
    await sleep(2500);
    for (let i = 0; i < 7; i++) { await key('Enter', 13); await sleep(1100); }
    await E('BK.manualSimulation=true;BK.sim(40)'); await E(`BK.lesson().leave(true)`); for (let i = 0; i < 500 && !(await E('!!(BK.L&&BK.L.tavern)')); i++) { await E('BK.sim(1)'); await sleep(5); }
    await E('BK.sim(200)'); await E(`(()=>{const p=BK.players()[0];p.x=36*16+8;p.vx=0;BK.sim(40);BK.press('talk');})()`);
    for (let i = 0; i < 400 && (await E('BK.state')) !== 'map'; i++) { await E('BK.sim(2)'); await sleep(5); }
    await E('BK.sim(80)'); await key('Tab', 9); await E('BK.sim(60)'); console.log('tab ->', await E('BK.state')); await shot('map-tab-list');
    await key('Tab', 9); await E('BK.sim(30)'); await E(`BK.mapLook('kings')`); await E('BK.sim(80)'); await shot('map-kings-tab-closed');
  }
  if (PART === 'levels') for (const id of ids) {
    await fresh();
    const r = await E(`(async()=>{const {LEVELS}=await import('/src/level.js');const i=LEVELS.findIndex(l=>l.id==='${id}');if(i<0)return {id:'${id}',missing:true};
      BK.setHero('knight');BK.reset({fresh:true});BK.load(i);BK.start();BK.god=true;BK.sim(200);const L=BK.L;const A=L.arena;
      return {id:'${id}',state:BK.state,W:L.W,H:L.H,arena:!!A,hidden:!!LEVELS[i].hidden,boss:A&&A.boss,players:BK.players().length,hp:BK.players()[0].hp,x:Math.round(BK.players()[0].x/16),y:Math.round(BK.players()[0].y/16)};})()`).catch(e => ({ id, err: String(e).slice(0, 200) }));
    console.log(JSON.stringify(r)); if (r.err || r.missing) break;
    await shot('lv-' + id);
    if (r.arena) { await E(`(()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);})()`); await shot('boss-' + id); }
    if (pg.errors.length) console.log('PAGE ERRORS', JSON.stringify(pg.errors.slice(-3)));
  }
  if (PART === 'end') {
    await E(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='kings'));BK.start();BK.sim(10);BK.coopSave.win();BK.sim(900);})()`);
    console.log('kings win ->', await E('BK.state')); await shot('kings-win');
    await E('BK.press("confirm");BK.sim(60)'); console.log('confirm ->', await E('BK.state')); await shot('kings-after-confirm');
    await E('BK.press("confirm");BK.sim(120)'); console.log('confirm2 ->', await E('BK.state')); await shot('kings-after-confirm2');
    await sleep(500); await shot('demo-end');
    console.log('endcard text:', await E(`(document.getElementById('demoend')||{}).innerText`));
  }
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
