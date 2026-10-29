/* tools/rookery3-shots.mjs [only,tags] - real-page stills of ROOKERY 3 (claude/rookery3, Daniel 10-29): the new end of THE BONE STAIR (THE GALE SPIRES, THE NEST FACE, THE RELAY)
   and THE SHRIEK SISTERS' three TEMPO tells (heavy: the chain stoop's climb; medium: the dive's aim; light: the echo's flash). Headless Chrome through tools/cdp.mjs, the knight in god
   mode. Not in the suite. OUT=<dir> (default work/claude/shots/rookery3)   PORT=<port> node tools/rookery3-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'shots', 'rookery3');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
/* the sisters: everyone else held off, the stagger cleared, then wait for the tell and stop part way through it */
const tellShot = (role, setup, mode, at) => `{boss();const S=SH.show();for(const r of ['diver','shrieker','snatcher']){S.sis[r].cd=99;if(r!=='snatcher')S.sis[r].mode='hover';}S.sis.snatcher.mode='fly';S.grabCd=99;S.snatchCd=99;
  for(let i=0;i<200&&['diver','shrieker','snatcher'].some(r=>/Tell$|dive|drop|carry|pick|rake|shock|echo/.test(S.sis[r].mode));i++)BK.step(1);
  const s=S.sis['${role}'];S.tLast=-99;s.ward=0;${setup};s.cd=0;for(let i=0;i<400;i++){BK.step(1);S.sis.snatcher.cd=99;if(s.mode==='${mode}'&&(1-s.modeT/(s.tempoT||1))>=${at})break;}}`;
const SHOTS = [
  ['spires', `{tp(370,13);BK.sim(90);}`],
  ['gale-spires', `{tp(378,18);P.vx=0;const ge=BK.enemies().find(e=>e.alive&&e.t==='galeharpy'&&e.squad==='galeSpires');ge.galeCd=0;for(let i=0;i<300&&ge.mode!=='galeTell';i++){BK.sim(1);P.hp=P.maxHp;}BK.sim(20);}`],
  ['nest-face', `{tp(396,27);BK.sim(60);}`],
  ['nest-face-top', `{tp(401,14);BK.sim(60);}`],
  ['relay', `{const k='relayRide',d=BK.L.rkRides.find(q=>q.id===k),s=1;tp(d.mount[0],d.mount[1]);let aimed=0;
    for(let i=0;i<900;i++){const r=RK.rideOf(k);P.hp=P.maxHp;if(r.aim&&!aimed){aimed=1;P.x=r.aim.x-s*44;P.vx=0;}if(!P.rkRide&&(r.mode==='downed'||r.mode==='rise')){P.x=r.x;P.vx=0;}
      if(r.mode==='lift')BK.press('grab');if(P.rkRide){const e=P.rkRide;if(e.rdT>e.rdTT*0.5)break;}BK.sim(1);}}`],
  ['door-ride', `{const k='doorRide',d=BK.L.rkRides.find(q=>q.id===k),s=1;tp(d.mount[0],d.mount[1]);let aimed=0;
    for(let i=0;i<900;i++){const r=RK.rideOf(k);P.hp=P.maxHp;if(r.aim&&!aimed){aimed=1;P.x=r.aim.x-s*44;P.vx=0;}if(!P.rkRide&&(r.mode==='downed'||r.mode==='rise')){P.x=r.x;P.vx=0;}
      if(r.mode==='lift')BK.press('grab');if(P.rkRide){const e=P.rkRide;if(e.rdT>e.rdTT*0.55)break;}BK.sim(1);}}`],
  ['tell-heavy', tellShot('diver', "s.nAtk=SSM.SS.chain.every[0]-1;s.mode='hover'", 'chainTell', 0.75)],
  ['tell-medium', tellShot('diver', "s.nAtk=0;s.mode='hover'", 'diveTell', 0.55)],
  ['tell-light', tellShot('shrieker', "s.rot=SSM.ROT[0].indexOf('echo');s.mode='perched'", 'echoTell', 0.12)],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const SSM=await import('/src/shriek-sisters.js');const idx=LV.findIndex(l=>l.id==='rookery');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    let P,RK,SH;const tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);P=BK.P;RK=BK.rookery();SH=BK.shriekSistersHands();};
    const boss=()=>{BK.tp(Math.round(BK.L.arena.x0/16)+10,10);BK.sim(300);P.x=SH.show().G.mid-60;BK.sim(2);};
    const out=[];for(const [tag,code] of ${JSON.stringify(SHOTS)}){load();try{eval(code);BK.step(1);const S=SH&&SH.show();out.push({tag,png:snap(),info:S?Object.fromEntries(['diver','shrieker','snatcher'].map(r=>[r,S.sis[r].mode+' '+(S.sis[r].tempo||'')+' '+(+S.sis[r].modeT||0).toFixed(2)])):null});}catch(e){out.push({tag,err:String(e)});}}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { if (s.err) { console.log(s.tag + ' ERROR ' + s.err); continue; } writeFileSync(join(OUT, 'rookery3-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('rookery3-' + s.tag + '.png ' + (s.info ? JSON.stringify(s.info) : '')); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 5));
} finally { await pg.close(); }
process.exit(0);
