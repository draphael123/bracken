// node shots.mjs <worktree> <outdir> [hudDefault|full|minimal]  (PORT env)
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const WT = process.argv[2], OUT = process.argv[3] + '/'; mkdirSync(OUT, { recursive: true });
const MODE = process.argv[4] || 'default';
const { openPage } = await import(pathToFileURL(WT + '/tools/cdp.mjs').href);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: true });
await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
const E = (e, t = 300000) => pg.evalp(e, t);
const shot = async n => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + n + '.png', Buffer.from(r.result.data, 'base64')); console.log('wrote', n); };
const snap = async (n, k = 20) => { await E(`BK.step(${k})`); await shot(n); };
const freshJS = (hero = 'knight', xp = 0) => `const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('${hero}');BK.reset({fresh:true});${xp ? `BKT.PROG.xp.${hero}=xpFloor(${xp});` : ''}BK.applyUpgrades&&BK.applyUpgrades();`;
const play = id => E(`(async()=>{${freshJS('knight', 40)}${MODE !== 'default' ? `BK.SET.hud='${MODE}';` : ''}BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);BK.god=true;BK.step(2);})()`);
const run = n => E(`(()=>{for(let i=0;i<${n};i++){BK.sim(1)}BK.step(2)})()`);
const sec = async (n, f) => { try { await f(); } catch (e) { console.log('FAIL', n, e.message); } };
const LV = (process.env.LEVELS || 'welltown,redgorge,wood,reef,canal,theatre').split(',');
try {
  await sleep(1500);
  await E('BK.manualSimulation=true;BK.step(5)'); await E(`window.__errs=[];addEventListener('error',e=>__errs.push(String(e.message)+' '+(e.error&&e.error.stack||'')));const oe=console.error;console.error=(...a)=>{__errs.push('ce '+a.map(String).join(' ').slice(0,800));oe(...a)};`);
  for (const id of LV) await sec(id, async () => { await play(id); await run(40); await E('(()=>{BK.P.hp=BK.P.maxHp*0.6;BK.P.st=BK.P.maxSt*0.5})()'); await snap('hud-' + id, 4); console.log(id, await E('JSON.stringify(window.__errs).slice(0,1500)')); });
  for (const bm of (process.env.BM || 'bar,pct,num,both').split(',')) await sec('boss-' + bm, async () => { await play('welltown'); await E(`(()=>{BK.SET.bossHp='${bm}';for(const e of BK.enemies()) if(!e.mini&&e!==BK.boss)e.alive=false;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+3,Math.round(A.floor/16)-1)})()`); await run(260); await E('(()=>{const b=BK.boss;if(b)b.hp=b.maxHp*0.62;BK.step(3)})()'); await snap('boss-' + bm, 3); });
  await sec('settings-default', async () => { console.log('SET.hud=', await E('BK.SET.hud'), 'bossHp=', await E('BK.SET.bossHp')); });
} finally { await pg.close(); }
