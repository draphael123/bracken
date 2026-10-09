import { pathToFileURL } from 'node:url';
const WT = process.argv[2];
const { openPage } = await import(pathToFileURL(WT + '/tools/cdp.mjs').href);
let pg; const seen = new Set();
pg = await openPage({ audio: false, fonts: true, onEvent: m => { if (m.method === 'Debugger.paused') { const p = m.params; const d = p.data && (p.data.description || p.data.value); const f = p.callFrames.slice(0, 3).map(c => c.functionName + ':' + c.location.lineNumber + ':' + c.location.columnNumber).join(' < '); const k = (d || '') + f; if (!seen.has(k)) { seen.add(k); console.log('PAUSE', p.reason, String(d).slice(0, 200), f); } pg.send('Debugger.resume').catch(() => {}); } } });
const E = (e, t = 300000) => pg.evalp(e, t);
await new Promise(r => setTimeout(r, 1500));
await E('BK.manualSimulation=true;BK.step(5)');
await pg.send('Debugger.enable'); await pg.send('Debugger.setPauseOnExceptions', { state: 'all' });
for (const id of ['welltown', 'redgorge']) {
  console.log('--', id);
  await E(`(async()=>{const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(40);BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);BK.god=true;BK.step(2);for(let i=0;i<40;i++)BK.sim(1);BK.step(2);BK.P.hp=BK.P.maxHp*0.6;BK.step(4)})()`);
}
await pg.close();
