import { pathToFileURL } from 'node:url';
const WT = process.argv[2];
const { openPage } = await import(pathToFileURL(WT + '/tools/cdp.mjs').href);
const pg = await openPage({ audio: false, fonts: true });
const E = (e, t = 300000) => pg.evalp(e, t);
await new Promise(r => setTimeout(r, 1500));
await E('BK.manualSimulation=true;BK.step(5)');
for (const id of ['welltown', 'redgorge']) {
  try { await E(`(async()=>{const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(40);BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);BK.god=true;BK.step(2);})()`); console.log(id, 'ok', await E('(()=>{try{BK.step(3);return "fine"}catch(e){return e.stack}})()')); } catch (e) { console.log(id, 'ERR', e.message.slice(0, 600)); }
}
console.log(JSON.stringify(pg.errors).slice(0, 1500));
await pg.close();
