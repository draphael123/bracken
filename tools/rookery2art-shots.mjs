/* tools/rookery2art-shots.mjs [only,tags] - ZOOMED real-page stills of the ROOKERY 2 art pass (claude/rookery2art): the two spots Daniel photographed, the gale harpy's tell and beat, a ride and
   the hang, each sister's poses in the fight, the three survivors, a sister's death, the boss room. Each shot: [tag, code, crop]; code runs in the page (BK, P, RK, SH, tp, boss, at(wx,wy)),
   crop = [wx, wy, w, h] in WORLD px or null (the whole 640x360). Output x3 for a crop. Not in the suite.   OUT=<dir> (default work/claude/shots/rookery2art)   PORT=<port> */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'shots', 'rookery2art');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const bossSetup = `{boss(0);}`;
const SHOTS = [
  /* DANIEL'S TWO PHOTO SPOTS: the ledges that ended in mid-air + the lantern gibbet (photo 1), the pillars + the grey path top (photo 2) */
  ['photo1-ledges', `tp(160,37);BK.sim(60);`, null],
  ['photo2-pillars', `tp(100,37);BK.sim(40);`, null],
  ['gale-tell', `{tp(222,25);BK.sim(150);const ge=BK.enemies().find(e=>e.alive&&e.t==='galeharpy'&&e.squad==='galeLedge');ge.galeCd=0;for(let i=0;i<300&&ge.mode!=='galeTell';i++){BK.sim(1);P.hp=P.maxHp;}BK.sim(10);window.__ge=ge;}`, `[__ge.x-60,__ge.y-45,160,90]`],
  ['gale-beat', `{tp(222,25);BK.sim(150);const ge=BK.enemies().find(e=>e.alive&&e.t==='galeharpy'&&e.squad==='galeLedge');ge.galeCd=0;for(let i=0;i<400&&ge.mode!=='gust';i++){BK.sim(1);P.hp=P.maxHp;}BK.sim(6);window.__ge=ge;}`, `[__ge.x-70,__ge.y-45,160,90]`],
  ['ride-hang', `{const k='gapRide',d=BK.L.rkRides.find(q=>q.id===k),s=1;tp(d.mount[0],d.mount[1]);let aimed=0;
    for(let i=0;i<900;i++){const r=RK.rideOf(k);P.hp=P.maxHp;if(r.aim&&!aimed){aimed=1;P.x=r.aim.x-s*44;P.vx=0;}if(!P.rkRide&&(r.mode==='downed'||r.mode==='rise')){P.x=r.x;P.vx=0;}
      if(r.mode==='lift')BK.press('grab');if(P.rkRide){const e=P.rkRide;if(e.rdT>e.rdTT*0.45)break;}BK.sim(1);}}`, `[P.x-45,P.y-60,100,70]`],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='rookery');BK.manualSimulation=true;
    const snap=(crop)=>{const c=document.createElement('canvas');const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      if(!crop){c.width=640;c.height=360;g.drawImage(BK.buf,0,0,640,360);}else{const [cx,cy]=BK.cam;let [wx,wy,w,h]=crop;const sx=Math.round(wx-cx),sy=Math.round(wy-cy);const Z=Math.min(6,Math.floor(640/w));c.width=w*Z;c.height=h*Z;g.drawImage(BK.buf,sx,sy,w,h,0,0,w*Z,h*Z);}
      return c.toDataURL('image/png');};
    let P,RK,SH;const tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);P=BK.P;RK=BK.rookery();SH=BK.shriekSistersHands();};
    const boss=()=>{BK.tp(380,10);BK.sim(300);P.x=SH.show().G.mid-60;BK.sim(2);};
    const out=[];for(const [tag,code,crop] of ${JSON.stringify(SHOTS.map(s => [s[0], s[1], s[2] || null]))}){load();try{eval(code);for(let k=0;k<2;k++)BK.step(1);const cr=crop?eval(crop):null;out.push({tag,cr:JSON.stringify([cr,BK.cam,P.x,P.y]),png:snap(cr)});}catch(e){out.push({tag,err:String(e)});}}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { if (s.err) { console.log(s.tag + ' ERROR ' + s.err); continue; } writeFileSync(join(OUT, s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(s.tag + '.png', s.cr); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 5));
} finally { await pg.close(); }
process.exit(0);
