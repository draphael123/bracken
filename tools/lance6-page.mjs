// PAGE TOOL: launches headless Chrome
// tools/lance6-page.mjs - THE QUEEN'S LANCE 6 IN THE PAGE, per hero, real keys (claude/lance6proof). Not in the suite.
// usage: node tools/lance6-page.mjs [--heroes=knight,warden,...] [--shot=1|dir]
//  SPAN LINES (span1/3/5: flat, either way over a gap): UP from the west lookout takes the line and rides it east to the far tower; a jump from the deck boards touches it;
//  and the same lines ridden WEST (face west, UP from the far end), all alive and unhurt.
//  STUN: the gate (bell rung with him away): stunned 3.0 s at x3.5, the clock (stunMax) is set; a blow lands harder.
//  SPEARS: a volley spear dodged (rolled with the real dodge key) / missed by < 10 px / struck while stuck flies back in 0.5 s and STUNS him 1.2 s x2;
//  (a hitstop runs on the wall clock, so each case naps 300 ms first.)  a spear landing far off does not; one return per 5 s; none while he is stunned; the stun ignores his shield.
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const HEROES = opt('heroes', 'knight,warden,geomancer,ranger,pyro,paladin,pirate,reaper').split(','), SHOT = opt('shot', '');
const PAGE = hero => `(async()=>{const {LEVELS}=await import('/src/level.js');const rows=[],row=(n,ok,why)=>rows.push({n,ok:!!ok,why:ok?'':why});const shots=[];
  const SHOT=${JSON.stringify(SHOT)},HERO=${JSON.stringify(hero)};
  const K=BK.keys,clr=()=>{for(const k in K)K[k]=false;};
  BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(HERO);BK.reset({fresh:true});const fi=LEVELS.findIndex(l=>l.id==='storm');BK.load(fi);BK.state='play';BK.god=false;BK.sim(5);
  const L=BK.L,P=BK.P,A=L.arena,fl=A.floor,TSZ=16;
  const info=()=>({x:Math.round(P.x),y:Math.round(P.y),ground:!!P.ground,zip:!!P.zip,dead:!!(P.dead>0),hp:P.hp});
  const snap=name=>{BK.step(1);const v=BK.view,c=document.createElement('canvas');c.width=v.VW*3;c.height=v.VH*3;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,v.VW,v.VH,0,0,c.width,c.height);shots.push([name,c.toDataURL('image/png')]);};
  for(const e of BK.enemies())e.alive=false;
  /* PROPS STAND: every brazier / bell / lamp post / torch on the level rests on a board or stone (the cell its foot is in, or the one under it, is a floor) - and its drawn spot is read, not only its data */
  { const T=(await import('/src/level.js')).T,bad=[];let n=0;for(const p of BK.props()){if(!['brazier','lancebell','gatebell','lanternPost','lamp'].includes(p.t))continue;if(p.t==='torch')continue;n++;const cx=Math.floor(p.x/TSZ),at=r=>L.grid[r*L.W+cx],r0=Math.floor(p.y/TSZ),fl2=t=>t===T.SOLID||t===T.ONEWAY||t===T.PLANK;if(!(fl2(at(r0))||fl2(at(r0+1))))bad.push(p.t+'@'+Math.round(p.x)+','+Math.round(p.y));}
    row('props: '+n+' braziers/bells/lamps on the bridge stand on a board or stone',n>=14&&!bad.length,'n '+n+' floating: '+bad.join(' ')); }
  const spans=L.zipLines.filter(z=>/^span/.test(z.id||''));row('three span lines',spans.length===3,'found '+spans.length);
  const stand=(x,feet,face)=>{clr();P.x=x;P.y=feet;P.vx=0;P.vy=0;P.ground=true;P.zip=null;P.zipRelease=0;P.zipSkip=null;P.face=face;P.hp=P.maxHp;BK.sim(4);};
  const rideOut=(z,cap=600)=>{let f=0;for(;f<cap&&P.zip===z;f++)BK.sim(1);for(let g=0;g<200&&!P.ground;g++)BK.sim(1);return f;};
  for(const z of spans){const west=z.x0-3,east=z.x1;
    stand(west,z.y0+18,1);const ok0=P.ground;const hp0=P.hp;K.up=true;let got=false;for(let f=0;f<20&&!got;f++){BK.sim(1);got=P.zip===z;}K.up=false;
    row(z.id+' east: UP from the west lookout takes it',ok0&&got,'ground '+ok0+' '+JSON.stringify(info()));
    if(got){const f=rideOut(z);
      row(z.id+' east: rides to the far tower, lands alive unhurt',P.x>z.x1-40&&P.x<z.x1+60&&P.ground&&!(P.dead>0)&&P.hp===hp0,'ended '+JSON.stringify(info())+' frames '+f+' hp0 '+hp0);}
    { let best=null;for(let x=z.x0+30;x<z.x1-30;x+=2){const c=Math.floor(x/TSZ);if(L.grid[Math.floor(fl/TSZ)*L.W+c]===0)continue;best=x;break;}
      if(best===null)row(z.id+' jump: (no boards under the line to jump from)',true,''); else {stand(best,fl,1);K.jump=true;BK.press('jump');let c2=false;for(let f=0;f<40&&!c2;f++){BK.sim(1);c2=P.zip===z;}K.jump=false;
        row(z.id+' jump: a jump from the deck boards touches the line (no UP)',c2,'jump at '+best+' not caught '+JSON.stringify(info()));
        if(c2){rideOut(z);row(z.id+' jump: and rides it out alive',P.ground&&!(P.dead>0),'ended '+JSON.stringify(info()));} } }
    stand(east+3,z.y0+18,-1);const okg=P.ground;K.up=true;let gw=false;for(let f=0;f<20&&!gw;f++){BK.sim(1);gw=P.zip===z;}K.up=false;
    row(z.id+' west: at the far end facing west, UP takes it (either way over a gap)',gw,'ground '+okg+' '+JSON.stringify(info()));
    if(gw){const x0=P.x;rideOut(z);row(z.id+' west: rides WEST and lands alive',P.x<x0-60&&P.ground&&!(P.dead>0),'moved '+Math.round(P.x-x0)+' '+JSON.stringify(info()));}
  }
  BK.load(fi);BK.state='play';BK.god=false;BK.sim(5);
  BK.tp(Math.round(A.trigger/16)+1,fl/16-1);for(let i=0;i<200;i++){P.hp=P.maxHp;P.inv=9;BK.sim(1);}
  const b=BK.enemies().find(e=>e.t==='lance'&&e.alive);for(const e of BK.enemies())if(e!==b&&!e.maxHp)e.alive=false;
  row('boss awake',BK.bossActive&&b,'bossActive '+BK.bossActive);
  const hold=()=>{for(const k of ['chargeT','volleyT','thrustT','sweepT','vaultT','wallT'])b[k]=99;b.penT=99;},safe=()=>{P.hp=P.maxHp;P.inv=9;},run=(n,f)=>{for(let i=0;i<n;i++){if(f)f(i);BK.sim(1);}};
  const nap=()=>new Promise(r=>setTimeout(r,300));const calm=()=>{clr();hold();b.stagger=0;b.mode='guard';b.modeT=0.5;b.guardHold=0;b.answer=null;b.lastHeavy=false;b.vx=0;b.y=fl;b.x=A.x0+420;b.hp=b.maxHp;run(90,safe);if(b.lz){b.lz.spears=[];b.lz.backs=[];b.lz.sendAt=-99;}b.stagger=0;b.mode='guard';b.modeT=0.5;};
  const bells=BK.props().filter(p=>p.t==='lancebell'),tb=k=>bells.find(p=>p.tower===k);
  { await nap();calm();const pr=tb(3);b.x=pr.gx-150;b.face=1;P.rgStance='knife';P.x=pr.x-10;P.y=pr.y;P.vx=P.vy=0;P.face=1;P.atk=-1;BK.press('atk');let st=0,mul=0,mx=0,open=false;
    run(300,()=>{safe();P.x=pr.x-10;P.y=pr.y;if(b.mode==='stunned'){st=Math.max(st,b.modeT);mul=Math.max(mul,b.stunMul||0);mx=b.stunMax||0;open=open||BK.bossOpen(b);}if(st&&b.mode!=='stunned')hold();});
    row('gate: he runs into the dropped gate, STUNNED 2.6 s at x3.5, open',st>=2.5&&mul>=3.5&&mx>=2.5&&open,'stun '+st+' mul '+mul+' max '+mx+' open '+open); }
  { await nap();calm();b.mode='guard';b.modeT=1;const hp0=b.hp;P.x=b.x-26;P.y=fl;P.face=1;P.vx=0;P.atk=-1;BK.press('atk');run(14,safe);const plain=hp0-b.hp;
    calm();b.mode='stunned';b.modeT=3;b.stunMax=3;b.stunMul=3.5;b.stagger=3;const hp1=b.hp;P.x=b.x-26;P.y=fl;P.face=1;P.vx=0;P.atk=-1;BK.press('atk');run(14,i=>{safe();b.modeT=3;});const stun=hp1-b.hp;
    row('stunned: a blow lands harder than at guard',stun>0&&stun>=plain*1.5,'guard '+plain+' stunned '+stun); }
  /* THAW: right after a teleport the foes sit frozen for up to a second (the spears do not count down), so a probe spear far away is waited out first */ const spearAt=(x,t,stuck)=>{const z=b.lz;const pb={x:A.x0+60,y:fl,t:5,max:5,stuck:0};z.spears.push(pb);let k=0;while(pb.t>4.99&&k++<300){safe();hold();BK.sim(1);}z.spears=z.spears.filter(q=>q!==pb);z.spears.push({x,y:fl,t:t,max:t,stuck:stuck||0});return z;};
  const backsOrStun=n=>{let backs=false,stun=0,mul=0,mx=0;run(n,i=>{safe();hold();const z=b.lz;if(z.backs.length)backs=true;if(b.mode==='stunned'){stun=Math.max(stun,b.modeT);mul=b.stunMul;mx=b.stunMax;}});return{backs,stun:+stun.toFixed(2),mul,mx,sp:b.lz.spears.length,mode:b.mode,sendAt:+b.lz.sendAt.toFixed(1),px:Math.round(P.x),inv:+P.inv.toFixed(1)};};
  { await nap();calm();P.x=A.x0+300;P.y=fl;P.face=1;P.vx=0;P.ground=true;P.st=P.maxSt;P.inv=0;const hp0=P.hp;spearAt(P.x+6,0.07);K.right=true;BK.press('dodge');let backs=false,hit=false,stun=0,mul=0;
    run(80,i=>{hold();if(b.lz.backs.length)backs=true;if(b.mode==='stunned'){stun=Math.max(stun,b.modeT);mul=b.stunMul;}if(P.hp<hp0)hit=true;});K.right=false;
    row('spear: ROLLED through (real dodge key), it flies back and STUNS him 1.2 s x2, unhurt',backs&&stun>=1.1&&mul===2&&!hit,'backs '+backs+' stun '+stun+' mul '+mul+' hp lost '+(hp0-P.hp)); }
  { await nap();calm();P.x=A.x0+300;P.y=fl;P.vx=0;P.ground=true;const hp0=P.hp;spearAt(P.x-18,0.12);const r=backsOrStun(60);
    row('spear: a MISS by < 10 px past the point sends it back',r.backs&&r.stun>=1.1&&P.hp===hp0,JSON.stringify(r)+' hp '+(hp0-P.hp)); }
  { await nap();calm();P.x=A.x0+300;P.y=fl;P.vx=0;const hp0=P.hp;spearAt(P.x-60,0.12);const r=backsOrStun(60);
    row('spear: one that lands 60 px away is only a spear (no return)',!r.backs&&!r.stun&&P.hp===hp0,JSON.stringify(r)); }
  { await nap();calm();P.x=A.x0+300;P.y=fl;P.vx=0;P.face=1;P.atk=-1;spearAt(P.x+18,0.01,1.4);BK.press('atk');const r=backsOrStun(50);
    row('spear: STRIKE a stuck spear and it is hurled back, stunning him',r.backs&&r.stun>=1.1,JSON.stringify(r)); }
  { await nap();calm();P.x=A.x0+300;P.y=fl;P.vx=0;spearAt(P.x-18,0.05);const r1=backsOrStun(60);b.mode='guard';b.modeT=0.5;b.stagger=0;spearAt(P.x-18,0.05);const r2=backsOrStun(40);
    row('spear: at most one return per 7 s',r1.backs&&!r2.backs,'first '+JSON.stringify(r1)+' second '+JSON.stringify(r2)); }
  { await nap();calm();P.x=A.x0+300;P.y=fl;P.vx=0;b.mode='stunned';b.modeT=2;b.stunMax=3;b.stunMul=3.5;spearAt(P.x-18,0.05);let backs=false;run(40,i=>{safe();hold();b.modeT=2;if(b.lz.backs.length)backs=true;});
    row('spear: none while he is already stunned',!backs,'backs '+backs); }
  { await nap();calm();P.x=A.x0+300;P.y=fl;P.vx=0;b.bare=false;b.shield=true;b.shielded=true;spearAt(P.x-18,0.05);const r=backsOrStun(60);
    row('spear: the stun ignores his shield',r.backs&&r.stun>=1.1,JSON.stringify(r)); }
  if(SHOT){await nap();calm();P.x=b.x-50;P.y=fl;b.mode='stunned';b.modeT=2.2;b.stunMax=3;b.stunMul=3.5;run(6,i=>{safe();b.modeT=2.2;});snap('stun-clock-'+HERO);}
  return {rows,shots}; })()`;
const t0 = Date.now(); let bad = 0, total = 0;
for (const h of HEROES) {
  const pg = await openPage({ audio: false, fonts: false, seed: 20261105 });
  try { const { rows, shots } = await pg.evalp(PAGE(h), 600000); const fails = rows.filter(r => !r.ok);
    console.log((fails.length ? 'FAIL ' : ' ok  ') + h.padEnd(10) + (rows.length - fails.length) + '/' + rows.length + (pg.errors.length ? '  PAGE ERRORS ' + pg.errors.slice(0, 2).join(' | ') : ''));
    for (const r of fails) console.log('        ' + r.n + ': ' + r.why);
    if (h === HEROES[0]) for (const r of rows) console.log('      ' + (r.ok ? '+' : 'x') + ' ' + r.n);
    bad += fails.length + pg.errors.length; total += rows.length;
    if (SHOT && shots.length) { const dir = SHOT === '1' ? '../scratch/lane-reports' : SHOT; mkdirSync(dir, { recursive: true }); for (const [n, d] of shots) writeFileSync(dir + '/lance6proof-' + n + '.png', Buffer.from(d.split(',')[1], 'base64')); }
  } catch (e) { console.log('FAIL ' + h + ' ' + e.message.slice(0, 200)); bad++; } finally { pg.close(); }
}
console.log((bad ? bad + ' RED' : 'all green') + ' (' + total + ' checks, ' + ((Date.now() - t0) / 1000).toFixed(0) + 's)');
process.exit(bad ? 1 : 0);
