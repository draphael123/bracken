// tools/lamplit2-art-shots.mjs - THE LAMPLIT STREET 2's art-pass pictures (claude/lamplit2art): the Lampreeve and the Tollmaster caught mid-move in the real page, and the street's
// lamps, pockets, gate and brazier. Not in the suite: god mode, a picture not a playtest.
//   usage: node tools/lamplit2-art-shots.mjs [out-dir] [name-filter,...]   -> PNGs (the game's own canvas, 3x, cropped round the action)
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/lamplit2art'; mkdirSync(out, { recursive: true });
const filt = process.argv[3] || '';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;BK.SET.hud='minimal';const res=[],log=[];const filt=${JSON.stringify(filt)};
  const H={get oil(){return BKT.lampHands().oil},get wax(){return BKT.lampHands().wax},get airRooms(){return BKT.lampHands().airRooms}};
  const idx=LEVELS.findIndex(l=>l.id==='lamplit');
  const hold=()=>{const k=BK.keys;k.left=k.right=k.up=k.down=k.jump=k.block=k.atk=false;};
  const start=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(5);BK.reset();};
  const snap=(name,cx,cy,w,h)=>{if(filt&&!filt.split(',').some(f=>name.includes(f)))return;const k=3;const c=document.createElement('canvas');c.width=w*k;c.height=h*k;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.drawImage(BK.buf,Math.max(0,Math.min(BK.view.VW-w,cx-w/2)),Math.max(0,Math.min(BK.view.VH-h,cy-h/2)),w,h,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
  const frame=(n=1)=>{for(let i=0;i<n;i++){hold();BK.sim(1);}for(const e of BK.enemies())if(e.t==='tollmaster'||e.t==='lampreeve'||e.t==='watch'){e.flash=0;e.breakFlash=0;}BK.step(1);};   /* a hit-flash would whiten the sprite in the picture */
  /* the screen position of a world point: the game's own camera (BK.view.x/y + zoom) */
  const scr=(x,y)=>{const v=BK.view,z=v.z||1;return [v.VW/2+(x-v.x-v.VW/2)*z,v.VH/2+(y-v.y-v.VH/2)*z];};
  const shoot=(name,x,y,w=150,h=100)=>{frame(1);const [sx,sy]=scr(x,y);snap(name,sx,sy,w,h);};
  const until=(pred,n=400)=>{for(let i=0;i<n;i++){if(pred())return true;frame(1);}return false;};
  /* ---------------- THE LAMPREEVE ---------------- */
  { start();const M=BK.L.mini;const b=BK.enemies().find(e=>e.t==='lampreeve'&&e.alive);for(const e of BK.enemies())if(e!==b&&!e.maxHp&&!e.mini)e.alive=false;
    BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(150);
    const lampsIn=()=>BK.props().filter(p=>p.t==='lantern'&&p.city&&p.x>M.x0-8&&p.x<M.x1+8);
    const calm=()=>{b.mode='stalk';b.modeT=5;b.open=0;b.ward=0;b.snuffT=99;b.lungeT=99;b.sweepT=99;b.flaskT=99;b.hookT=99;b.target=null;b.phase=1;b.hp=b.maxHp;};
    const L=lampsIn();for(const p of L){p.lit=true;p.gut=0;}
    calm();b.x=(M.x0+M.x1)/2;BK.P.x=b.x+110;BK.P.y=M.floor;b.face=1;b.flaskT=0;b.modeT=0;
    if(until(()=>b.mode==='flaskTell',200)){frame(10);shoot('r01-flask-tell',b.x+40,M.floor-24,170,90);b.flaskT=99;}
    if(until(()=>b.mode==='flask'||b.flask,200)){frame(3);shoot('r02-flask-throw',b.x+50,M.floor-30,190,100);}
    for(let i=0;i<60&&b.flask;i++){frame(1);if(i===20)shoot('r03-flask-flight',BK.P.x-30,M.floor-50,190,100);}
    for(let i=0;i<20&&!H.oil.length;i++)frame(1);
    if(H.oil.length){const s=H.oil[0];shoot('r04-slick',s.x,M.floor-10,150,70);s.burn=1.2;for(let i=0;i<4;i++){frame(4);shoot('r05-slick-burn'+i,s.x,M.floor-14,150,70);}}
    /* the two blinded poses: the relit stun and the hood's flare */
    calm();b.x=(M.x0+M.x1)/2;BK.P.x=b.x-80;b.flaskT=99;b.mode='blinded';b.modeT=2;b.open=2;b.openMax=2.4;b.flareKind='relit';shoot('r06-blind-relit',b.x,M.floor-22,120,80);
    b.mode='blinded';b.modeT=1;b.open=1;b.openMax=1.2;b.flareKind='hood';shoot('r07-blind-hood',b.x,M.floor-22,120,80);
  }
  /* ---------------- THE TOLLMASTER ---------------- */
  { start();const A=BK.L.arena;const b=BK.enemies().find(e=>e.t==='tollmaster');for(const e of BK.enemies())if(e!==b&&!e.maxHp&&!e.mini)e.alive=false;
    BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(240);
    const lampsIn=()=>BK.props().filter(p=>p.t==='lantern'&&p.city&&p.x>A.x0-8&&p.x<A.x1+8);
    const calm=()=>{b.mode='borne';b.modeT=9;b.open=0;b.ward=0;b.openKind=null;b.collectT=99;b.scalesT=99;b.sealT=99;b.writT=99;b.ledgerT=99;b.rodT=99;b.stagger=0;b.vx=0;b.hp=b.maxHp;b.phase=b.phase||1;if(b.corners)for(const c of b.corners){c.n=0;c.cd=0;}};
    const L=lampsIn();for(const p of L){p.lit=true;p.gut=0;}
    const mid=(A.x0+A.x1)/2, at=(m)=>{shoot('t-'+m,b.x,A.floor-30,200,110);};
    const move=(timer,tellMode,name,onFoot,phase,after)=>{calm();b.onFoot=onFoot;b.phase=phase;b.x=mid-40;b.face=1;BK.P.x=mid+110;BK.P.y=A.floor;b[timer]=0;b.modeT=0;
      if(until(()=>b.mode===tellMode,260)){if(tellMode==='sealTell'){frame(3);shoot('t04a-seal-ghost-early',b.sealX,A.floor-60,130,130);}frame(Math.max(2,Math.round(b.modeT*30*0.6)));b.flash=0;b.breakFlash=0;shoot(name+'-tell',b.x+30,A.floor-50,260,150);b[timer]=99;if(tellMode==='sealTell'){shoot('t04b-seal-ghost',b.sealX,A.floor-34,130,100);}
        if(after)for(let i=0;i<after.length;i++){if(!until(()=>b.mode===after[i],200))break;frame(4);b.flash=0;b.breakFlash=0;shoot(name+'-'+after[i],b.x+30,A.floor-50,260,150);}}};
    move('collectT','collectTell','t01-collect',false,1,['collect']);
    move('scalesT','scalesLowTell','t02-scales-low',true,1,['scalesLow']);
    move('scalesT','scalesHighTell','t03-scales-high',true,1,['scalesHigh']);
    move('sealT','sealTell','t04-seal',true,2,['seal']);
    for(let i=0;i<6&&!H.wax.length;i++)frame(2);if(H.wax.length){const w=H.wax[0];shoot('t05-wax',w.x,A.floor-16,150,70);}
    /* the relit flare, the bier tilt both sides, set down */
    calm();b.onFoot=false;b.x=mid;b.face=1;BK.P.x=b.x-90;BK.P.y=A.floor;b.mode='flared';b.open=2.8;b.openMax=2.8;b.openKind='relit';b.modeT=2.8;shoot('t06-flared-bier',b.x,A.floor-30,150,100);
    b.onFoot=true;b.mode='flared';b.open=2.8;b.modeT=2.8;shoot('t07-flared-foot',b.x,A.floor-30,150,100);
    calm();b.onFoot=false;b.mode='tilt';b.open=1.3;b.openMax=1.3;b.openKind='tilt';b.modeT=1.3;b.tiltSide=-1;shoot('t08-tilt-left',b.x,A.floor-26,150,100);b.tiltSide=1;shoot('t09-tilt-right',b.x,A.floor-26,150,100);
    calm();b.onFoot=false;b.phase=1;b.mode='setDown';b.modeT=1.4;delete b.bierX;shoot('t10-setdown-a',b.x,A.floor-30,170,100);b.modeT=0.9;frame(1);shoot('t11-setdown-b',b.x,A.floor-30,170,100);b.modeT=0.2;frame(1);shoot('t12-setdown-c',b.x,A.floor-30,170,100);
    b.onFoot=true;b.mode='borne';b.modeT=5;b.x=b.x+70;shoot('t13-bier-left',b.bierX,A.floor-20,170,90);
    /* the writ: told, standing (the hoods drowned) */
    calm();b.onFoot=true;b.phase=3;b.x=mid-30;BK.P.x=mid+110;BK.P.y=A.floor-10;b.writT=0;b.modeT=0;if(until(()=>b.mode==='writTell',300)){frame(25);shoot('t14-writ-tell',mid,A.floor-34,260,130);}
    if(until(()=>b.writ,200)){frame(20);shoot('t15-writ',mid,A.floor-40,260,130);}
  }
  /* ---------------- THE STREET ---------------- */
  { start();const rooms=H.airRooms.filter(r=>r.lampX!==undefined);const r0=rooms[0];BK.sim(2);const lp=r0.lamp;const lt=Math.round(lp.y/16),rt=Math.round((r0.t+r0.b)/32);
    BK.sim(300);BK.look(r0.lampX,Math.round((lt+rt)/2));BK.sim(30);
    lp.lit=false;BK.sim(2);frame(2);shoot('s01-pocket-dark',(r0.l+r0.r)/2,(lp.y+r0.t)/2,200,170);
    lp.lit=true;BK.sim(2);frame(14);shoot('s02-pocket-lit',(r0.l+r0.r)/2,(lp.y+r0.t)/2,200,170);
    const g=BK.props().find(p=>p.t==='lantern'&&p.gate!==undefined);BK.look(Math.round(g.x/16)+2,Math.round(g.y/16)-1);BK.sim(60);
    shoot('s03-toll-gate-shut',g.x+16,g.y-30,230,130);BK.P.wick=14;g.lit=true;BK.sim(10);frame(14);shoot('s04-toll-gate-open',g.x+16,g.y-30,230,130);
    const bz=BK.props().find(p=>p.t==='brazier'&&p.city);if(bz){BK.look(Math.round(bz.x/16)-4,Math.round(bz.y/16)-1);BK.sim(30);shoot('s05-brazier',bz.x,bz.y-14,120,80);BK.P.x=bz.x-8;BK.P.y=bz.y;BK.P.wick=0;BK.P.face=1;frame(8);shoot('s06-brazier-reach',bz.x-6,bz.y-14,120,80);}
    const dl=BK.props().filter(p=>p.t==='lantern'&&p.city&&!p.gate&&!p.wayRoom)[3];BK.look(Math.round(dl.x/16)-2,Math.round(dl.y/16)-1);BK.sim(40);dl.lit=false;BK.P.wick=14;frame(3);shoot('s07-dead-lamp-flame',dl.x,dl.y-30,130,90);
  }
  return res;})()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(out + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
