// tools/uiscreens-shots.mjs - UI POLISH B (claude/uiscreens): stills of the opening + results screens, desktop or phone.
//   PORT=8650 node tools/uiscreens-shots.mjs before|after [desktop|phone] [sections,comma]
// sections: boot, title, intro, heropick, map, death, win. Writes work/claude/lane-done/uiscreens/<tag>-<profile>-<name>.png
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const tag = process.argv[2] || 'after', profile = process.argv[3] || 'desktop', only = (process.argv[4] || '').split(',').filter(Boolean);
const want = s => !only.length || only.includes(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const dir = join(ROOT, 'work', 'claude', 'lane-done', 'uiscreens'); mkdirSync(dir, { recursive: true });
const phone = profile === 'phone';
async function open(opts) {
  const pg = await openPage(opts);
  if (phone) { await pg.send('Emulation.setDeviceMetricsOverride', { width: 915, height: 412, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } }); await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); }
  return pg;
}
const shotOf = pg => async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(dir, `${tag}-${profile}-${name}.png`), Buffer.from(r.result.data, 'base64')); console.log('wrote', name); };
const sec = async (n, fn) => { if (!want(n)) return; try { await fn(); } catch (e) { console.log('SECTION FAIL', n, e.message); } };
const url = (pg, q = '') => 'http://localhost:' + pg.PORT + '/?' + (phone ? 'touch=1&' : '') + 'nosw=1' + q;
const key = (E, k) => E(`(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)}}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:${JSON.stringify(k)}}));BK.step(1);})()`);
await sec('boot', async () => {
  const pg = await open({ audio: false, noWait: true }); const shot = shotOf(pg);
  try { await pg.send('Page.navigate', { url: url(pg, '&boot=' + Date.now()) });
    for (const [i, t] of [[0, 1200], [1, 2500]]) { await sleep(t - (i ? 1200 : 0)); await shot('boot-' + t); } } finally { await pg.close(); }
});
const pg = await open({ audio: false }); const shot = shotOf(pg), E = (e, t = 300000) => pg.evalp(e, t);
const freshJS = (hero = 'knight', xp = 0) => `const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('${hero}');BK.reset({fresh:true});${xp ? `BKT.PROG.xp.${hero}=xpFloor(${xp});` : ''}BK.applyUpgrades&&BK.applyUpgrades();`;
const play = (id, hero = 'knight', xp = 0, extra = '') => E(`(async()=>{${freshJS(hero, xp)}BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);${extra};BK.step(2);})()`);
try {
  await sec('title', async () => {
    await sleep(500); await E('BK.step(2)'); await shot('title-card-0');
    await E('BK.step(90)'); await shot('title-card-1');
    await pg.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 }); await pg.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 });
    await E('BK.manualSimulation=true;BK.step(25)'); await shot('title-part'); await E('BK.step(40)'); await shot('title-walk'); await E('BK.step(120)'); await shot('title-menu');
  });
  await E('BK.manualSimulation=true');
  await sec('intro', async () => { await E('localStorage.clear()'); await E('BK.ui.titleI=1'); await key(E, 'Enter'); await E('BK.ui.slotI=1'); await key(E, 'z'); await E('BK.step(40)'); const st = await E('BK.state'); console.log('state', st); await shot('intro-1'); for (let i = 2; i <= 4; i++) { await key(E, 'z'); await E('BK.step(60)'); await shot('intro-' + i); } });
  await sec('heropick', async () => { await E(`(async()=>{${freshJS('knight', 0)}BK.state='heropick';BK.ui.heroPickI=0;BK.ui.heroPickStage='pick';BK.step(60)})()`); await shot('heropick-knight'); await E('BK.ui.heroPickI=3;BK.step(50)'); await shot('heropick-3'); await E('BK.ui.heroPickI=5;BK.step(35)'); await shot('heropick-5'); });
  await sec('map', async () => {
    await E(`(async()=>{${freshJS('knight', 20)}for(const l of LEVELS.slice(0,8)) BKT.PROG[l.id]={cleared:true,medal:2,silver:3,best:151,gold:12,total:20};BKT.PROG.coins=120;BK.mapLook('wood');})()`); await E('BK.step(60)'); await shot('map-wood');
    for (const id of ['welltown', 'theatre']) { await E(`BK.mapLook('${id}')`); await E('BK.step(60)'); await shot('map-' + id); }
  });
  await sec('death', async () => {
    await play('welltown', 'knight', 40, '');
    await E(`(()=>{const e=BK.enemies().find(e=>e.alive&&!e.mini);BK.damagePlayer(e.x,9999,{who:e,blow:'shield charge',unblockable:true})})()`);
    await E('BK.sim(30)'); await E('BK.step(2)'); await shot('death-red'); await E('BK.sim(20)'); await E('BK.step(2)'); await shot('death-late');
    await E('(()=>{for(let i=0;i<300&&BK.P.dead;i++)BK.sim(1);BK.step(2)})()'); await E('BK.sim(40);BK.step(2)'); await shot('death-after');
  });
  await sec('win', async () => {
    await play('welltown', 'knight', 40, 'BK.god=true'); await E('BK.xpWin();BK.step(5)');
    for (const n of [60, 200]) { await E(`(()=>{for(let i=0;i<${n};i++)BK.step(1)})()`); await shot('win-' + n); }
  });
} finally { await pg.close(); }
