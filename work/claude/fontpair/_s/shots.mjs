// node shots.mjs <worktree> <outdir>   (PORT env) - title, menu, hud, sign, store, boss bar, credits, boot
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const WT = process.argv[2], OUT = process.argv[3] + '/'; mkdirSync(OUT, { recursive: true });
const { openPage } = await import(pathToFileURL(WT + '/tools/cdp.mjs').href);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: true });
await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
const E = (e, t = 300000) => pg.evalp(e, t);
const shot = async n => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + n + '.png', Buffer.from(r.result.data, 'base64')); console.log('wrote', n); };
const snap = async (n, k = 20) => { await E(`BK.step(${k})`); await shot(n); };
const key = k => E(`(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)}}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:${JSON.stringify(k)}}));BK.step(1);})()`);
const freshJS = (hero = 'knight', xp = 0) => `const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('${hero}');BK.reset({fresh:true});${xp ? `BKT.PROG.xp.${hero}=xpFloor(${xp});` : ''}BK.applyUpgrades&&BK.applyUpgrades();`;
const play = id => E(`(async()=>{${freshJS('knight', 40)}BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);BK.god=true;BK.step(2);})()`);
const run = n => E(`(()=>{for(let i=0;i<${n};i++){BK.sim(1)}BK.step(2)})()`);
const sec = async (n, f) => { try { await f(); } catch (e) { console.log('FAIL', n, e.message); } };
try {
  await sleep(1500);
  await E('BK.manualSimulation=true;BK.step(5)');
  await sec('title', async () => { await pg.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 }); await pg.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 }); await snap('title', 60); });
  await sec('credits', async () => { await E('BK.state="title"'); await E('BK.ui.titleI=7'); await key('Enter'); await snap('credits', 20); });
  await sec('saves', async () => { await E('BK.state="title"'); await E('BK.ui.titleI=1'); await key('Enter'); await snap('saves', 20); });
  await sec('hud', async () => { await play('welltown'); await run(40); await snap('hud', 4); });
  await sec('menu', async () => { await play('welltown'); await E('BK.ui.openMenu("play")'); await snap('menu', 10); });
  await sec('settings', async () => { await E('BK.state="title"'); await E('BK.ui.titleI=4'); await key('Enter'); await snap('settings', 10); });
  await sec('sign', async () => { await play('wood'); await E(`(()=>{const TL=BK.textLab;const t=TL.talkers().find(t=>/sign/i.test(t.kind))||TL.talkers()[0];TL.talk(t.lines.filter(Boolean),t.name);})()`); await snap('sign', 10); });
  await sec('boss', async () => { await play('welltown'); await E(`(()=>{BK.SET.bossHp='both';for(const e of BK.enemies()) if(!e.mini&&e!==BK.boss)e.alive=false;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+3,Math.round(A.floor/16)-1)})()`); await run(260); await E('(()=>{const b=BK.boss;if(b)b.hp=b.maxHp*0.62;BK.step(3)})()'); await snap('boss', 3); });
  await sec('store', async () => { await E(`(async()=>{${freshJS('knight', 20)}BKT.PROG.coins=400;BK.load(0);BK.state='map';})()`); await E('BK.ui.storeOpen("map",undefined);BK.ui.storeTab=1;BK.step(2)'); await snap('store', 20); });
} finally { await pg.close(); }
