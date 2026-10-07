// tools/lantern-eater-shots.mjs [hero=knight] [tag=greybox] - THE LANTERN-EATER stills (claude/lanterneater): the bot plays one whole fight (health refilled),
// a still the first time each beat shows - the two lights (the read), the bait over the gulp, the snag (OPEN), the ward, the jaws at the rail, the snap's
// mark, its teeth in the timber, the snuffed lamps, the hunt, the dimmed lantern, the swell, its death.
//   PORT=8722 node tools/lantern-eater-shots.mjs knight greybox   -> work/claude/lane-done/lanterneater/<tag>/le-*.png. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const hero = process.argv[2] || 'knight', tag = process.argv[3] || 'greybox';
const out = join(ROOT, 'work/claude/lane-done/lanterneater', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const res=[],got=new Set();
    const snap=(name)=>{if(got.has(name))return;got.add(name);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
    let t0=-1,dimmed=false;
    await BK.bossLab({bosses:['canal'],heroes:[${JSON.stringify(hero)}],healthMode:'refill',maxSecs:300,draw:true,onFrame:({boss,P,f})=>{
      const s=BK.lanternEaterHands().show();if(!s)return;if(t0<0)t0=f;const m=boss.mode;
      if(f-t0===6)snap('le-01-the-raft-waiting');
      if(m==='lights'&&boss.phase===1&&boss.modeT<0.5)snap('le-02-two-lights-the-read');
      if(m==='gulpTell'&&boss.modeT<0.6)snap('le-03-the-bait-over-the-gulp');
      if(m==='gulp')snap('le-04-the-gulp');
      if(m==='open'&&boss.part==='lure'&&boss.modeT<2.6)snap('le-05-snagged-open');
      if(m==='ward'&&boss.modeT<2.2)snap('le-06-warded');
      if(m==='jaws'&&boss.modeT<0.8)snap('le-07-p2-gums-at-the-rail');
      if(m==='snapTell'&&s.snap&&s.snap.fixed)snap('le-08-the-snap-told');
      if(m==='open'&&boss.part==='jaws'&&boss.modeT<2.6)snap('le-09-teeth-in-the-timber');
      if(m==='snuff'&&boss.modeT<0.6)snap('le-10-the-lamps-snuffed');
      if(m==='huntTell'&&boss.modeT<0.5)snap('le-11-the-hunt-under-your-lantern');
      if(m==='swell')snap('le-12-the-swell');
      if(boss.phase===3&&!dimmed&&m==='idle'){dimmed=true;s.lantern.lit=false;s.lantern.cd=0;}
      if(boss.phase===3&&!s.lantern.lit&&s.decoys.length)snap('le-13-dimmed-it-bites-a-copy');
    }});
    for(let i=0;i<90;i++){BK.P.inv=99;BK.sim(1);if(i%3===0)BK.step(1);}BK.step(1);snap('le-14-death-the-lamps-burn-again');
    return res;})()`, 1200000);
  for (const [n, d] of r) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('shots', r.map(x => x[0]).join(' '));
} finally { pg.close(); }
