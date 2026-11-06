// tools/duel-roster-shots.mjs - BROWSER proof of the duel roster pick screen + the duel's rules in the real game (claude/duelroster).
//   node tools/duel-roster-shots.mjs [roster,flow]  -> stills in $SHOTS (default scratch/lane-reports/duelroster-shots), exits 1 on a FAIL
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports', 'duelroster-shots'); mkdirSync(OUT, { recursive: true });
const WANT = process.argv[2] ? process.argv[2].split(',') : ['roster', 'flow'];
const pg = await openPage({ audio: false, fonts: true, seed: 11, duelBeta: true }); const E = (e, ms) => pg.evalp(e, ms); const fails = [];
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails.push(m); };
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, n + '.png'), Buffer.from(r.result.data, 'base64')); console.log('shot ' + n); };
try {
  await E(`(()=>{BK.manualSimulation=true;window.__P=n=>BK.players()[n-1];
    window.__fresh=async()=>{for(const k in BK.keys)BK.keys[k]=false;BK.coopEnd();BK.reset({fresh:true});BK.tavern.record(null);BK.tavern.p1Pad(null);await BK.tavern.enter();BK.sim(10);return BK.state;};
    window.__st=id=>BK.tavern.debug().stations.find(s=>s.id===id);
    window.__atPit=()=>{const s=__st('arena');const p=__P(1);for(let i=0;i<60;i++){p.x=s.x;p.y=20*16;p.vx=p.vy=0;p.face=1;BK.sim(1);}};
    window.__roster=()=>BK.duel().D.roster.state();return 1;})()`);
  if (WANT.includes('roster')) {
    console.log('roster');
    await E('__fresh()'); await E('(()=>{try{localStorage.removeItem("bracken.duelSettings")}catch(e){}BK.duel().D.setSettings({teams:false,seats:[{hero:""},{isBot:true,hero:"random"}]});})()');
    await E('(()=>{__atPit();BK.press("talk");BK.sim(3);})()');
    let s = await E('__roster()'); ok(s.open, 'the DUEL PIT opens the ROSTER pick screen: ' + JSON.stringify(s).slice(0, 160));
    await E('BK.sim(20)'); await shot('roster-1human-1bot');
    /* mouse: click a tile (the screen's own hit list) through real CDP mouse events; hover then press */
    const geo = await E(`(()=>{const R=BK.duel().D.roster.R;BK.draw1();const c=document.getElementById('c'),b=c.getBoundingClientRect(),S=Math.floor(Math.min(c.width/320,c.height/180)),dpr=c.width/b.width;return {l:b.left,t:b.top,dpr,S,ox:Math.floor((c.width-320*S)/2),oy:Math.floor((c.height-180*S)/2),hits:R.hits.slice(0,60)};})()`);
    const tile = geo.hits.filter(h => h.k === 'tile')[3];
    ok(!!tile, 'the screen publishes tile hit boxes for the mouse (' + geo.hits.length + ' hits)');
    if (tile) { const px = geo.l + (geo.ox + (tile.x + tile.w / 2) * geo.S) / geo.dpr, py = geo.t + (geo.oy + (tile.y + tile.h / 2) * geo.S) / geo.dpr;
      await pg.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: px, y: py }); await E('BK.sim(2)');
      await pg.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: px, y: py, button: 'left', clickCount: 1 }); await pg.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: px, y: py, button: 'left', clickCount: 1 }); await E('BK.sim(3)');
      s = await E('__roster()'); const S = await E('BK.duel().D.getSettings()');
      ok(s.cur && Object.values(s.cur)[0].idx === tile.i, 'a mouse click on tile ' + tile.i + ' moves/picks it (cursor ' + JSON.stringify(Object.values(s.cur)[0]) + ', seat1 hero ' + S.seats[0].hero + ')'); await shot('roster-after-mouse-click'); }
    /* ESC: a real Escape key; it un-readies / leaves, never opens the pause menu while the roster is open */
    for (let i = 0; i < 4 && (await E('__roster()')).open; i++) { await pg.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await pg.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await E('BK.sim(3)'); }
    s = await E('__roster()'); const stt = await E('BK.state'); ok(!s.open && stt === 'play', 'ESC walks BACK out of the roster (never the pause menu): open=' + s.open + ' state=' + stt);
    /* 2v2 with teams */
    await E('(()=>{BK.duel().D.setSettings({teams:true});__atPit();BK.press("talk");BK.sim(30);})()'); s = await E('__roster()'); ok(s.open, 'roster reopens (teams on)');
    await shot('roster-2v2-teams');
    await E('BK.duel().D.roster.R.tab=1;BK.sim(5)'); await shot('roster-rules-tab'); await E('BK.duel().D.roster.close();BK.duel().D.setSettings({teams:false});');
  }
  if (WANT.includes('flow')) {
    console.log('flow');
    await E('__fresh()');
    const info = await E(`(()=>{BKT.PROG.heroes=Object.assign(BKT.PROG.heroes||{},{knight:1,warden:1});BK.duel().D.setSettings({teams:false,lives:3,rounds:3,timeLimit:60,seats:[{hero:"warden"},{isBot:true,hero:"pyro"}]});return {hero:BK.hero?BK.hero():null};})()`);
    console.log('campaign hero before', JSON.stringify(info));
    const before = await E('BKT.PROG.equipped||BKT.PROG.hero||(BK.players()[0].hero)');
    await E('(()=>{__atPit();BK.press("talk");BK.sim(3);const R=BK.duel().D.roster;const p=__P(1);R.pick(p,R.R.cur.get(p.n).idx);BK.sim(2);})()');
    await E('BK.sim(120)', 120000);
    const d = await E('(()=>{const dd=BK.duel().D.debug();return {on:dd.on,seats:dd.seats,hero:BK.players()[0].hero,lv:BK.L&&BK.L.id}})()'); ok(d.on && d.hero === 'warden', 'READY -> FIGHT -> the duel begins with player one as WARDEN: ' + JSON.stringify(d).slice(0, 300));
    await shot('duel-hud-lives');
    /* skills off, hero's own spender/meter on */
    const sk = await E(`(()=>{const p=BK.players()[0];return {s0:BK.skillAt(0),s1:BK.skillAt(1),skillNow:BK.skillNow()}})()`); ok(sk.s0 === null && sk.s1 === null, 'skills are OFF in the duel (skillAt 0/1 null): ' + JSON.stringify(sk));
    /* planks: from the pit floor the jump reaches each plank (the middle one from a low plank) */
    const pl = await E(`(async()=>{const {LEVELS}=await import('/src/level.js');const L=BK.L;return {w:L.w,h:L.h,solids:(L.plats||[]).length}})()`); console.log('pit', JSON.stringify(pl));
  }
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none'); if (pg.errors.length) fails.push('page errors');
} catch (e) { console.log('ABORT', e.message); fails.push('abort'); } finally { pg.close(); }
if (fails.length) { console.log('FAILED ' + fails.length); process.exit(1); } console.log('duel-roster-shots ok');
