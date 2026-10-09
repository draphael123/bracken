import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';
const WT = process.argv[2];
const { openPage } = await import(pathToFileURL(WT + '/tools/cdp.mjs').href);
const pg = await openPage({ audio: false, fonts: true });
await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
const E = (e, t = 300000) => pg.evalp(e, t);
const shot = async n => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(process.argv[3] + n + '.png', Buffer.from(r.result.data, 'base64')); };
await new Promise(r => setTimeout(r, 1500));
await E('BK.manualSimulation=true;BK.step(5)');
for (const id of ['welltown', 'redgorge']) {
  await E(`(async()=>{const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(40);BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);BK.god=true;BK.step(2);})()`);
  console.log(id, await E('JSON.stringify([BKT.PROG.hero, BK.state, BK.L.id, BK.P.hp, BK.P.maxHp])'));
  await E('BK.step(4)'); await shot('a-' + id);
  await E('for(let i=0;i<40;i++)BK.sim(1);BK.step(2)'); console.log(await E('JSON.stringify([BKT.PROG.hero, BK.state, BK.L.id, BK.P.hp, BK.P.maxHp])')); await shot('b-' + id);
}
await pg.close();
