/* tools/kraken-reach.mjs - EVERY ARM OF THE KRAKEN, IN EVERY PHASE, IS ON REACHABLE, DRAWN ROAD (claude/kraken2, design standard B12;
   Daniel 2026-10-08: "the live game is UNBEATABLE - the rightmost arm goes through terrain and can't be hit").
   On master the fourth arm came up through the wreck at the end of the road (its root was inside the hull), and an arm that slammed a hero
   standing on the wreck's deck, the shrine plinth or the tower lay INSIDE the stone at road height: drawn through the terrain, and out of
   reach of every blade. The spear of the last phase came out of the arena's end wall. This check, per hero (knight, warden, pyro), with
   REAL KEYS (BK.press('atk'), the hero standing where a player stands):
     ROOTS    every arm, every phase, comes up out of the sea through OPEN AIR in front of the road - never inside a block;
     LIES     every place a hero can stand in the arena (the road, the tower's steps, the plinth, the deck, the stones): the nearest arm
              slams him there, and it lies ON that surface - its tip is in the air over it, the arm as drawn (BKT.krkArmPts) is never
              inside a solid tile above the road, and the hero's own blows, from where he stands, cut it;
     LIMP     the arms knelled limp across the road (phase II) are cut from the road beside them;
     THE CLIMB / THE PIN  the last phase's openings are cut the same way (its own section below, when the phase has them).
   Exit 1 on any failure, with the failures listed. */
import { openPage } from './cdp.mjs';
const HEROES = (process.argv.find(a => a.startsWith('--heroes=')) || '--heroes=knight,warden,pyro').slice(9).split(',');
const pg = await openPage({ audio: false, fonts: false });
let bad = [];
try {
  for (const h of HEROES) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const TS=16,fails=[],stats={lies:0,hits:0,limp:0,roots:0,pts:0};
      BK.setHero(${JSON.stringify(h)});BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='causeway'));BK.state='play';BK.god=true;
      const A=BK.L.arena,fl=A.floor,fy=fl/TS,P=BK.P;BK.tp(Math.round(A.trigger/TS)+1,fy-1);BK.sim(420);BK.god=false;P.maxHp=P.hp=99999;const e=BK.boss;
      const tAt=(c,y)=>BK.L.grid[y*BK.L.W+c],isS=(c,y)=>{const t=tAt(c,y);return t===T.SOLID||t===T.CRATE||t===T.PALISADE||t===T.PORT||t===T.CLIMB||t===T.SOFT||t===T.ICE||t===T.WEB;},isOW=t=>t===T.ONEWAY||t===T.REED||t===T.PLANK||t===T.NET||t===T.SHELF||t===T.RAIL||t===T.CRYST,krkTopOf=x=>{let y=fy-1;const c=Math.floor(x/TS);while(y>fy-8&&(isS(c,y)||isOW(tAt(c,y))))y--;return (y+1)*TS;},solid=(x,y)=>isS(Math.floor(x/TS),Math.floor(y/TS));
      const hush=()=>{if(e.stage===2)e.hp=Math.max(e.hp,e.stageFloor+Math.round(e.maxHp*0.2));if(e.stage>=3)e.hp=Math.max(e.hp,Math.round(e.maxHp*0.3));e.modeT=999;for(const k in e.T)e.T[k]=999;e.tideN=0;e.tideWarn=0;e.tideSurge=null;e.inkT=0;e.inkTell=0;for(const k of e.crates||[])k.life=0;e.drift=[];e.patches=[];e.blobs=[];e.co=null;e.quakes=[];};   /* (the flood brings crates in the first stage now: none left standing to change the ground under a test) */
      let cur=null;const live=()=>e.arms.filter(a=>!a.severed&&a.hp>0&&!a.spear&&(!cur||cur.includes(a)));const phase=()=>{cur=null;cur=live().filter(a=>a.st!=='hid'&&a.st!=='retreat');};
      /* every place a hero can stand: air for two rows over a solid or one-way tile, from the road up to six rows over it */
      const spots=()=>{const out=[];for(let c=Math.floor(A.x0/TS)+1;c<Math.floor(A.x1/TS);c++)for(let y=fy-6;y<=fy-1;y++){const t=tAt(c,y+1);
        if(!isS(c,y)&&!isOW(tAt(c,y))&&!isS(c,y-1)&&(isS(c,y+1)||isOW(t)))out.push([c,(y+1)*TS]);}return out;};
      const stand=(x,y)=>{P.x=x;P.y=y;P.vx=P.vy=0;P.inv=0;P.dodge=0;P.ground=true;},fresh=(x,y)=>{stand(x,y);P.atk=-1;P.plunge=false;if(P.hitSet)P.hitSet.clear();};
      const roots=(ph)=>{for(const a of e.arms){if(a.severed)continue;stats.roots++;const bc=Math.floor(a.bx/TS);
        for(const y of [fy-1,fy-2,fy-3])if(isS(bc,y)){fails.push(ph+' arm '+a.i+' ('+(a.spear?'spear':'col '+bc)+') comes up INSIDE a block at row '+y);break;}}};
      /* the arm as drawn: no point of it above the road surface is inside a solid tile */
      const drawn=(a,ph,what)=>{if(!BKT.krkArmPts){fails.push('no BKT.krkArmPts hook: the drawn arm cannot be read');return true;}const pts=BKT.krkArmPts(a);stats.pts+=pts.length;
        for(const [x,y] of pts){if(y>=fl-1)continue;if(solid(x,y)){fails.push(ph+' arm '+a.i+' '+what+': DRAWN THROUGH TERRAIN at '+Math.round(x/TS)+','+Math.round(y/TS));return false;}}return true;};
      /* the hero's own blows, real keys, from where he stands, facing along the arm */
      let why='';const cut=(a,keep)=>{const h0=a.hp;let mx=-1;const sim0=BK.sim;BK.sim=n=>{const r=sim0.call(BK,n);mx=Math.max(mx,P.atk);return r;};try{const dir=Math.sign(((a.bx+a.tx)/2)-P.x)||1;for(let i=0;i<4&&a.hp>=h0;i++){keep();P.face=dir;BK.press('atk');for(let f=0;f<26;f++){keep();BK.sim(1);}keep();for(let f=0;f<14;f++){keep();BK.sim(1);}
        if(a.hp>=h0){P.face=-dir;keep();BK.press('atk');for(let f=0;f<40;f++){keep();BK.sim(1);}}}}finally{BK.sim=sim0;}why=' [atk '+mx.toFixed(2)+' arm '+a.st+' low '+a.low+' alive '+(a.ae&&a.ae.alive)+' box '+(a.ae?[a.ae.x-a.ae.w/2,a.ae.x+a.ae.w/2,a.ae.y-a.ae.h,a.ae.y].map(Math.round).join(','):'-')+' P '+Math.round(P.x)+','+Math.round(P.y)+' mode '+e.mode+']';a.healT=0;const d=h0-a.hp;if(a.hp<=0){a.hp=h0;a.severed=false;}a.hp=Math.max(a.hp,1);if(a.ae){a.ae.alive=true;a.ae.hp=a.hp;}return d;};
      const lies=(ph)=>{for(const [x0,y0] of spots()){const x=x0*TS+8;const arms=live().filter(q=>q.st!=='gone');if(!arms.length)break;
          const a=arms.slice().sort((p,q)=>Math.abs(p.bx-x)-Math.abs(q.bx-x))[0];hush();for(const q of live())if(q!==a&&q.st!=='hid'){q.st='idle';q.low=false;}
          fresh(x,y0);a.hp=a.max;if(a.ae){a.ae.alive=true;a.ae.hp=a.max;}a.st='rise';a.want=[x,fl-240];e.armI=a.i;e.slamX=x;e.mode='slamTell';e.modeT=0.01;
          let g=0;while(a.st!=='down'&&g<40){stand(x,y0);P.inv=9;BK.sim(1);g++;}fresh(x,y0);P.hurt=0;P.inv=1;stats.lies++;
          if(a.st!=='down'){fails.push(ph+' arm '+a.i+' never lay down slamming '+x0+','+y0/TS);continue;}
          const keep=()=>{a.st='down';a.t=9;e.mode=e.back||'stride';e.modeT=999;for(const k in e.T)e.T[k]=999;P.inv=1;P.vx=0;};
          if(solid(a.tx,a.ty))fails.push(ph+' arm '+a.i+' slamming a hero at '+x0+','+(y0/TS)+' lies INSIDE a block (tip '+Math.round(a.tx/TS)+','+Math.round(a.ty/TS)+')');
          drawn(a,ph,'lying at '+x0+','+(y0/TS));
          const d=cut(a,()=>{keep();stand(x,y0);});if(d>0)stats.hits++;else fails.push(ph+' '+${JSON.stringify(h)}+': arm '+a.i+' (root col '+Math.floor(a.bx/TS)+') slammed him standing at '+x0+','+(y0/TS)+' and NO BLOW of his reaches it'+why);
          a.st='idle';a.low=false;BK.sim(2);}};
      const idle=(ph)=>{hush();for(const a of live()){a.st='idle';a.low=false;}BK.sim(90);for(const a of live())drawn(a,ph,'up');};
      /* ---------- I. THE ARMS ---------- */
      hush();phase();roots('I');idle('I');lies('I');
      /* ---------- II. OUT AT SEA (every first-phase arm cut) ---------- */
      for(const a of e.arms.slice())if(!a.severed){a.hp=1;a.ae.hp=1;a.st='down';a.t=9;a.low=true;a.tx=a.bx;a.ty=fl-6;BK.sim(1);BKT.hurtEnemy(a.ae,5,a.bx,false);}
      for(let i=0;i<600&&e.mode!=='stride2';i++)BK.sim(1);hush();
      if(e.stage!==2)fails.push('phase II never came (stage '+e.stage+')');
      phase();roots('II');idle('II');lies('II');
      /* KNELLED: both arms thrown down limp across the road - cut from the road beside them */
      {const sp=spots();for(const a of live().filter(q=>q.two)){hush();e.mode='knelled';e.modeT=999;BKT.krakLimp?BKT.krakLimp(e,99):(()=>{a.st='stun';a.t=99;a.low=true;a.tx=a.bx+a.side*78;a.ty=fl-6;})();BK.sim(2);stats.limp++;
        if(solid(a.tx,a.ty))fails.push('II arm '+a.i+' knelled lies INSIDE a block');drawn(a,'II','knelled limp');
        const x0=Math.min(a.tx,a.bx),x1=Math.max(a.tx,a.bx);const near=sp.filter(([c,y])=>c*TS+8>=x0-20&&c*TS+8<=x1+20).sort((p,q)=>p[1]-q[1]===0?Math.abs(p[0]*TS+8-a.tx)-Math.abs(q[0]*TS+8-a.tx):q[1]-p[1]);
        let ok=false;for(const [c,y] of near.slice(0,4)){fresh(c*TS+8,y);const d=cut(a,()=>{a.st='stun';a.t=99;e.mode='knelled';e.modeT=999;stand(c*TS+8,y);P.inv=1;});if(d>0){ok=true;break;}}
        if(!ok)fails.push('II '+${JSON.stringify(h)}+': knelled arm '+a.i+' lies where no blow from the road reaches it');e.mode='stride2';a.st='idle';a.low=false;BK.sim(2);}}
      /* ---------- III ---------- */
      hush();e.hp=e.stageFloor;for(let i=0;i<900&&!/^(stride3|climb)$/.test(e.mode);i++){BK.sim(1);for(const k in e.T)e.T[k]=999;}hush();
      if(e.stage!==3)fails.push('phase III never came (stage '+e.stage+')');
      phase();roots('III');idle('III');lies('III');
      /* THE PIN: stand landward of a waystone, the spear drives into it - cut it where it stuck */
      if(e.arms.some(q=>q.spear&&!q.severed))for(const s of A.stones){hush();const x=s-30;fresh(x,fl);e.mode='stride3';e.modeT=0;e.T.lunge=0;let g=0;while(e.mode!=='stuck'&&g<200){stand(x,fl);P.inv=1;BK.sim(1);g++;if(e.mode==='stride3'){for(const k in e.T)if(k!=='lunge')e.T[k]=999;}}
        const a=e.arms.find(q=>q.spear&&!q.severed);if(e.mode!=='stuck'||!a){fails.push('III the spear never stuck in the waystone at '+Math.floor(s/TS)+' (mode '+e.mode+')');continue;}
        drawn(a,'III','pinned at '+Math.floor(s/TS));/* he runs to where it stuck, and cuts it from the road beside its point */const tip=Math.min(a.tx,a.bx),px=tip-10;fresh(px,krkTopOf(px));const d=cut(a,()=>{e.mode='stuck';e.modeT=9;e.openTaken=0;a.st='spear';a.low=true;stand(px,krkTopOf(px));P.inv=1;});if(!(d>0))fails.push('III '+${JSON.stringify(h)}+': the spear pinned at the waystone '+Math.floor(s/TS)+' cannot be cut'+why);}
      return {h:${JSON.stringify(h)},fails,stats};})()`, 1800000);
    console.log(r.h.padEnd(7) + ' lies ' + r.stats.lies + ' cut ' + r.stats.hits + ' limp ' + r.stats.limp + ' roots ' + r.stats.roots + ' drawn pts ' + r.stats.pts + '  fails ' + r.fails.length);
    for (const f of r.fails.filter(f => !/krkArmPts/.test(f)).slice(0, +(process.env.NFAIL || 40))) console.log('   FAIL ' + f);
    bad.push(...r.fails.map(f => r.h + ': ' + f));
  }
  if (pg.errors.length) { console.log('page errors', pg.errors.slice(0, 3)); bad.push('page errors'); }
} finally { pg.close(); }
if (bad.length) { console.log('kraken-reach: ' + bad.length + ' FAILURES'); process.exit(1); }
console.log('kraken-reach: every arm, every phase, on reachable drawn road - ok');
