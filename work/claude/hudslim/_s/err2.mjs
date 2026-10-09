import { pathToFileURL } from 'node:url';
const WT = process.argv[2];
const { openPage } = await import(pathToFileURL(WT + '/tools/cdp.mjs').href);
const pg = await openPage({ audio: false, fonts: true });
const E = (e, t = 300000) => pg.evalp(e, t);
await new Promise(r => setTimeout(r, 1500));
await E('BK.manualSimulation=true;BK.step(5)');
await E(`window.__errs=[];addEventListener('error',e=>__errs.push(String(e.message)+' '+(e.error&&e.error.stack||'')));addEventListener('unhandledrejection',e=>__errs.push('rej '+e.reason));const oe=console.error;console.error=(...a)=>{__errs.push('ce '+a.map(String).join(' ').slice(0,800));oe(...a)};`);
for (const id of ['welltown', 'redgorge']) {
  await E(`(async()=>{const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(40);BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);BK.god=true;BK.step(2);BK.P.hp=BK.P.maxHp*0.6;BK.step(4)})()`);
  console.log(id, await E('JSON.stringify(window.__errs)'));
}
await pg.close();
