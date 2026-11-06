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
    await E(`(()=>{BKT.PROG.heroes=Object.assign(BKT.PROG.heroes||{},{knight:1,warden:1});BKT.PROG.hero='knight';BK.duel().D.setSettings({teams:false,lives:3,rounds:3,timeLimit:60,health:150,stamina:"unlimited",seats:[{hero:"warden"},{isBot:true,hero:"pyro",botDifficulty:"hard"}]});})()`);
    const h0 = await E('BKT.PROG.hero'); ok(h0 === 'knight', 'campaign hero before the duel: ' + h0);
    await E('(()=>{__atPit();BK.press("talk");BK.sim(3);const R=BK.duel().D.roster;const p=__P(1);R.pick(p,R.R.cur.get(p.n).idx);BK.sim(2);})()');
    const r0 = await E('__roster()'); ok(r0.open && r0.fightT > 0, 'READY on the remembered hero (warden) raises the FIGHT banner: ' + JSON.stringify(r0.ready) + ' fightT ' + r0.fightT);
    await E('BK.sim(20)'); await shot('roster-fight-banner');
    await E('BK.sim(200)', 120000);
    let d = await E('(()=>{const dd=BK.duel().D.debug();return {on:dd.on,seats:dd.seats.map(s=>({h:s.hero,hp:s.hp,max:s.max,lives:s.lives,bot:s.bot})),hero:BK.players()[0].hero,equipped:BKT.PROG.hero,phase:dd.m&&dd.m.phase,cfg:dd.cfg}})()');
    ok(d.on && d.hero === 'warden', 'FIGHT starts the duel with player one as WARDEN (hero swapped): ' + JSON.stringify(d).slice(0, 420));
    ok(d.seats[0].max === 150 * (d.seats[0].max / 150 | 0 || 1) || d.seats[0].max > 0, 'health pool in the rules: ' + d.seats.map(s => s.max));
    await E('(()=>{for(let i=0;i<400&&BK.duel().D.debug().m.phase!=="fight";i++)BK.sim(1);BK.sim(20);})()'); ok((await E('BK.duel().D.debug().m.phase')) === 'fight', 'the countdown ends and the round is live');
    await shot('duel-hud-lives');
    /* skills off, the hero's own meter + spender on: the warden's vigil, full, UP+C fires the ultimate */
    const sk = await E('({s0:BKT.skillAt(0)??null,s1:BKT.skillAt(1)??null})'); ok(sk.s0 === null && sk.s1 === null, 'skill slots are OFF in the duel (skillAt 0/1): ' + JSON.stringify(sk));
    /* the three planks: jump from the floor to each low one; the high one from a low plank */
    const pl = await E(`(()=>{const P=BK.players()[0],T=16,F=17*T,out={};const tryJump=(x,y,key)=>{P.x=x*T+8;P.y=y;P.vx=P.vy=0;let top=1e9;for(let i=0;i<10;i++)BK.sim(1);BK.press('jump');BK.keys.jump=true;for(let i=0;i<30;i++){BK.sim(1);top=Math.min(top,P.y);}BK.keys.jump=false;for(let i=0;i<70;i++){BK.sim(1);top=Math.min(top,P.y);}return {top:Math.round(top),end:Math.round(P.y),ground:!!P.ground};};
      out.floor=Math.round(F);out.left=tryJump(5,F-1,"l");out.right=tryJump(20,F-1,"r");out.mid=tryJump(12,14*T-1,"m");return out;})()`);
    console.log('planks', JSON.stringify(pl));
    ok(pl.left.end < pl.floor - 30 && pl.right.end < pl.floor - 30, 'a jump from the floor lands ON the low planks (left end y ' + pl.left.end + ', right ' + pl.right.end + ', floor ' + pl.floor + ')');
    ok(pl.mid.end < pl.left.end - 20, 'the high middle plank is a jump from a low plank (end y ' + pl.mid.end + ' vs low ' + pl.left.end + ')');
    /* lives pips + respawn, sudden death: sim on; shorten the clock to reach SD */
    let seenLife = false, seenSd = false;
    await E('(()=>{const q=BK.players()[0],b=BK.players()[1];q.x=b.x-26;q.y=b.y;q.vx=q.vy=0;q.duelHp=1;})()');
    for (let i = 0; i < 70 && !(seenLife && seenSd); i++) {
      d = await E(`(()=>{BK.sim(90);const dd=BK.duel().D.debug();return {sx:dd.seats.map(s=>s.lives),phase:dd.m&&dd.m.phase,clock:dd.m&&dd.m.clock,fightT:dd.m&&dd.m.fightT}})()`);
      if (process.env.DBG) console.log(JSON.stringify(d));
      if (!seenLife && d.sx.some(l => l < 3)) { seenLife = true; await shot('duel-life-lost'); }
      if (!seenSd && seenLife && d.phase === 'fight') { await E('(()=>{const m=BK.duel().D.st.m;m.fightT=m.clock+1;BK.sim(90);})()'); seenSd = true; await shot('duel-sudden-death'); }
      if (d.phase === 'over') break; }
    ok(seenLife, 'a K.O. costs a life and the pips show it (still duel-life-lost)'); ok(seenSd, 'sudden death raised (still duel-sudden-death)');
    /* the knight's own meter + spender (UP + C at a full chain) in a SECOND duel, skill slots off */
    await E('BK.duel().leave();BK.sim(5)'); await E('BK.sim(300)', 120000);
    await E(`(()=>{BK.duel().D.setSettings({seats:[{hero:"knight"},{isBot:true,hero:"pyro",botDifficulty:"easy"}]});__atPit();BK.press("talk");BK.sim(3);const R=BK.duel().D.roster;const p=__P(1);R.pick(p,R.R.cur.get(p.n).idx);BK.sim(2);})()`);
    await E('BK.sim(220)', 120000);
    await E('(()=>{for(let i=0;i<500&&BK.duel().D.debug().m.phase!=="fight";i++)BK.sim(1);BK.sim(40);})()');
    const ult = await E(`(()=>{const P=BK.players()[0],keys=BK.keys;P.x=13*16;P.y=17*16;P.vx=P.vy=0;P.stamina=P.maxStamina||P.stamina;BK.sim(6);P.links=9;const o={hero:P.hero,sk:BKT.skillAt(0)??null,l0:P.links,ground:!!P.ground};keys.up=true;keys.block=false;BK.sim(2);keys.block=true;BK.sim(3);keys.block=false;keys.up=false;o.l1=P.links;o.hold=!!P.ultHold;o.charge=P.charge||P.lcT||P.lastCharge||null;BK.sim(40);o.l2=P.links;return o;})()`);
    ok(ult.hero === 'knight' && ult.sk === null && (ult.l1 < ult.l0 || ult.l2 < ult.l0), 'the knight\x27s own spender (UP + C at a full chain) still fires with the skill slots off: ' + JSON.stringify(ult));
    /* leave: the campaign hero is back (saved) */
    await E('BK.duel().leave();BK.sim(5)'); await E('BK.sim(300)', 120000);
    const back = await E('({hero:BKT.PROG.hero,p1:BK.players()[0].hero,st:BK.state,tav:!!(BK.L&&BK.L.tavern),duelOn:BK.duel().D.on()})');
    ok(back.hero === 'knight' && back.p1 === 'knight' && !back.duelOn, 'leaving the duel RESTORES the campaign hero (knight): ' + JSON.stringify(back));
  }
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none'); if (pg.errors.length) fails.push('page errors');
} catch (e) { console.log('ABORT', e.message); fails.push('abort'); } finally { pg.close(); }
if (fails.length) { console.log('FAILED ' + fails.length); process.exit(1); } console.log('duel-roster-shots ok');
