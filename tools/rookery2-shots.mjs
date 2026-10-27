/* tools/rookery2-shots.mjs [only,tags] - real-page stills of THE ROOKERY 2 greybox (claude/rookery2, Daniel 10-27): the anchored ledges and roosts, the rock-and-guano caps,
   THE GALE HARPY in her tell, a RIDE in the air, and the SHRIEK SISTERS' three bars, the ride to the perch (CORNERED) and the PHASE 2 survivor. Headless Chrome through
   tools/cdp.mjs, the knight in god mode. Not in the suite. OUT=<dir> (default work/claude/shots/rookery2)   PORT=<port> node tools/rookery2-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'shots', 'rookery2');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const SHOTS = [
  ['anchors-gap', `tp(160,37);BK.sim(60);`],
  ['anchors-nest', `tp(300,15);BK.sim(60);`],
  ['caps', `tp(100,37);BK.sim(40);`],
  ['gale-tell', `{tp(222,25);const ge=BK.enemies().find(e=>e.alive&&e.t==='galeharpy'&&e.squad==='galeLedge');ge.galeCd=0;for(let i=0;i<300&&ge.mode!=='galeTell';i++){BK.sim(1);P.hp=P.maxHp;}BK.sim(12);}`],
  ['ride', `{const k='gapRide',d=BK.L.rkRides.find(q=>q.id===k),s=1;tp(d.mount[0],d.mount[1]);let aimed=0;
    for(let i=0;i<900;i++){const r=RK.rideOf(k);P.hp=P.maxHp;if(r.aim&&!aimed){aimed=1;P.x=r.aim.x-s*44;P.vx=0;}if(!P.rkRide&&(r.mode==='downed'||r.mode==='rise')){P.x=r.x;P.vx=0;}
      if(r.mode==='lift')BK.press('grab');if(P.rkRide){const e=P.rkRide;if(e.rdT>e.rdTT*0.45)break;}BK.sim(1);}}`],
  ['boss-bars', `{boss(0);}`],
  ['boss-ferry', `{boss(0);const S=SH.show(),dv=S.sis.diver;dv.x=S.G.mid-60;dv.y=S.G.floorY-20;dv.mode='ferryWait';dv.modeT=1;P.x=dv.x;P.y=S.G.floorY;BK.sim(1);SH.tryRide(P);for(let i=0;i<40;i++){BK.step(1);}}`],
  ['boss-cornered', `{boss(0);const S=SH.show(),sh=S.sis.shrieker,P0=S.G.perchS;sh.mode='perched';sh.ward=0;sh.cd=99;BK.tp(Math.floor((P0.x-P0.w/2+8)/16),Math.floor(P0.y/16)-1);P.vx=0;for(let i=0;i<20;i++)BK.step(1);}`],
  ['p2-survivor', `{boss(0);const S=SH.show();for(const r of ['diver','snatcher']){const b=BK.enemies().find(e=>e.t==='shrieksister'&&e.role===r);S.sis[r].hp=0;BK.sim(2);}for(let i=0;i<110;i++)BK.step(1);}`],
  ['p2-snatch', `{boss(0);const S=SH.show();for(const r of ['shrieker','diver']){S.sis[r].hp=0;BK.sim(2);}BK.sim(100);const s=S.sis.snatcher;s.mode='hold';s.modeT=0.9;s.x=P.x;s.y=S.G.floorY-90;S.held={pp:P,t:0.5,strikes:1,last:-9,by:'snatcher',p2:true};P.ssHeld=true;for(let i=0;i<4;i++)BK.step(1);}`],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='rookery');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    let P,RK,SH;const tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);P=BK.P;RK=BK.rookery();SH=BK.shriekSistersHands();};
    const boss=()=>{BK.tp(380,10);BK.sim(300);P.x=SH.show().G.mid-60;BK.sim(2);};
    const out=[];for(const [tag,code] of ${JSON.stringify(SHOTS)}){load();try{eval(code);for(let k=0;k<2;k++)BK.step(1);out.push({tag,png:snap()});}catch(e){out.push({tag,err:String(e)});}}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { if (s.err) { console.log(s.tag + ' ERROR ' + s.err); continue; } writeFileSync(join(OUT, 'rookery2-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('rookery2-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 5));
} finally { await pg.close(); }
process.exit(0);
