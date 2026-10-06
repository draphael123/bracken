// tools/canal4art-jenny-shots.mjs [hero=knight] <before|after> - JENNY's RAFT DUEL stills (claude/canal4art): the bot plays one whole fight (health refilled), a still the first time each beat shows.
//   PORT=8662 node tools/canal4art-jenny-shots.mjs knight before   -> work/claude/lane-done/canal4art/<tag>/j-*.png. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const hero = process.argv[2] || 'knight', tag = process.argv[3] || 'after';
const out = join(ROOT, 'work/claude/lane-done/canal4art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const res=[],got=new Set();
    const snap=(name)=>{if(got.has(name))return;got.add(name);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
    let t0=-1,kelpAt={},shiftT=0;
    await BK.bossLab({bosses:['canal'],heroes:[${JSON.stringify(hero)}],healthMode:'refill',maxSecs:300,draw:true,onFrame:({boss,P,f})=>{
      const s=BK.greenteethHands().show();if(!s)return;if(t0<0)t0=f;const m=boss.mode,tell=s.arms.find(a=>a.st==='tell');
      if(f-t0===6)snap('j-01-the-raft-waiting');
      if(boss.phase===1&&s.kelp==='body'&&m==='duel'&&!tell&&P.ground)snap('j-02-p1-kelp-body');
      if(m==='stuck'&&boss.modeT<2.4)snap('j-03-claws-stuck-open');
      if(boss.phase===2&&s.kelp==='hood'&&m==='duel'&&!tell&&P.ground)snap('j-04-p2-kelp-hood');
      if(m==='heave'||s.raft.heave>0)snap('j-05-heave');
      if(m==='lower')snap('j-06-dragged-lower');
      if(boss.phase===3&&m==='kelp')snap('j-07-p3-shift-told');
      if(boss.phase===3&&s.kelp==='body'&&m==='duel'&&!tell&&P.ground)snap('j-08-p3-body');
      if(boss.phase===3&&s.kelp==='hood'&&m==='duel'&&!tell&&P.ground)snap('j-09-p3-hood');
      if(s.wary&&s.wary.t>2&&!tell)snap('j-10-wary');
      if(tell&&tell.k==='slam'&&tell.t<0.3)snap('j-11-slam-tell');
      if(tell&&tell.k==='net'&&tell.t<0.3)snap('j-12-net-tell');
      if(boss.phase===1&&s.kelp==='body'&&m==='duel'&&P.ground&&got.has('j-02-p1-kelp-body')&&!got.has('j-13'))snap('j-13');
    }});
    for(let i=0;i<90;i++){BK.P.inv=99;BK.sim(1);if(i%3===0)BK.step(1);}BK.step(1);snap('j-14-death-raft-drifts');
    return res;})()`);
  for (const [n, d] of r) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('shots', r.map(x => x[0]).join(' '));
} finally { pg.close(); }
