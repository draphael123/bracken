// tools/fairboss-shot.mjs <name> - ONE still of THE WICKER QUEEN's fight, mid-fight (claude/fairboss): the fight woken at the door, a few seconds of it
// run with the hero looking at her, and on the carousel (when the green is one) the hero set on a horse while the floor is told to burn. Saved at 2x into
// work/claude/fairboss/<name>.png. God mode. Not in the suite: pictures are for eyes.   usage: node tools/fairboss-shot.mjs before|after
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const name = process.argv[2] || 'shot', out = join(ROOT, 'work/claude/fairboss'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;
    const fi=LEVELS.findIndex(l=>l.id==='fair');BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(10);
    const A=BK.L.arena,fl=A.floor;BK.tp(Math.round(A.trigger/16)+1,Math.round(fl/16)-1);BK.P.face=1;for(let i=0;i<150;i++){BK.sim(1);if(i%4===0)BK.step(1);}
    const q=BK.boss;for(const e of BK.enemies())if(e!==q)e.alive=false;q.lashCd=99;q.crownCd=99;if('floorCd' in q)q.floorCd=99;if('throwCd' in q)q.throwCd=99;
    let note='';
    if(BK.L.ring){ /* THE CAROUSEL: the ride running, a hero up on a horse, and the floor told to burn under him */
      for(let i=0;i<240;i++){BK.P.face=Math.sign(q.x-BK.P.x)||1;BK.sim(1);if(i%4===0)BK.step(1);}
      const hs=BK.movers().filter(m=>m.kind==='carhorse'&&!m.broken).sort((a,b)=>Math.abs(a.x+a.w/2-(q.x-110))-Math.abs(b.x+b.w/2-(q.x-110)));
      const h=hs[0];if(h){BK.P.x=h.x+h.w/2;BK.P.y=h.y;BK.P.vy=0;BK.P.onMover=h;BK.P.ground=true;}
      q.floorCd=0;for(let i=0;i<70;i++){BK.P.face=Math.sign(q.x-BK.P.x)||1;BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);note='mode '+q.mode+', ring '+Math.round(BK.L.ring.speed)+' px/s';}
    else{for(let i=0;i<240;i++){BK.P.x=q.x-140;BK.P.y=fl;BK.P.vx=0;BK.P.face=1;BK.sim(1);if(i%4===0)BK.step(1);}q.lashCd=0;q.lashN=0;for(let i=0;i<50;i++){BK.P.x=q.x-140;BK.P.face=1;BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);note='mode '+q.mode;}
    const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);
    return [c.toDataURL('image/png'),note];})()`, 600000);
  writeFileSync(join(out, name + '.png'), Buffer.from(r[0].split(',')[1], 'base64')); console.log('work/claude/fairboss/' + name + '.png  -  ' + r[1]);
} finally { pg.close(); }
