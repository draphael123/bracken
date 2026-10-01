// tools/puppeteer-shots.mjs [hero=knight] [level=theatre] [salt=1] - THE PUPPETEER in the page (claude/puppeteer, PUPPETEER3): stills of one whole fight,
// the human bot playing it (src/puppeteer.js puppetPlan) at normal health, drawn frame by frame, saved at 2x into work/claude/puppeteer/ - one for each
// beat the first time it happens: a CUT (the snap, the string whipping away, the limb limp), the Brute's windup, the Harlequin mid-combo, both down and
// him OPEN on the boards, the duo together (phase 2), the slam's broken boards, the masterpiece, the curtain. Not in the suite: pictures are for eyes.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
const hero = process.argv[2] || 'knight', level = process.argv[3] || 'theatre', salt = +(process.argv[4] || 1);
const out = join(ROOT, 'work/claude/puppeteer'); mkdirSync(out, { recursive: true });
for (const f of readdirSync(out)) if (f.endsWith('.png')) unlinkSync(join(out, f));
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const res=[],got=new Set();
    const snap=(name,note)=>{if(got.has(name))return;got.add(name);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:[${JSON.stringify(hero)}],healthMode:'normal',maxSecs:300,draw:true,salt:${salt},onFrame:({boss,P})=>{
      const s=BK.puppeteerHands().show();if(!s)return;const m=boss.mode,pups=s.puppets.filter(p=>p.alive&&p.mode!=='packed');
      const bru=pups.find(p=>p.t==='marionette'),har=pups.find(p=>p.t==='harlequin'),mp=pups.find(p=>p.t==='masterpiece');
      if(s.whips&&s.whips.length&&s.whips[0].t<0.55&&pups.some(p=>p.mode!=='heap'&&p.str.some(q=>q.cut)))snap('1-a-cut','A CUT: the snap - the cut length whipping away, the limb it held hanging limp, that attack gone (the hint box says which)');
      if(bru&&/Tell$/.test(bru.mode)&&bru.modeT<0.45)snap('2-the-brute-winds-up','THE BRUTE winds up his '+bru.mode.replace('Tell','')+' (a long tell: !!), his strings gold - get out from under, then punish his recovery');
      if(har&&(har.mode==='jab'||har.mode==='jabTell')&&har.combo<3)snap('3-the-harlequin-mid-combo','THE HARLEQUIN mid-combo: quick jabs (! a shield turns them), small hits, never still');
      if(bru&&bru.mode==='recover')snap('4-the-brute-spent','THE BRUTE spent after a swing (the green bar over him): the window to hit him or cut a string');
      if(m==='hang1')snap('5-one-down-his-bar-sinks','ONE DOWN: the Harlequin in a heap (its ring counting out), and his control bar sunk on its line');
      if(m==='downed'&&boss.modeT<3)snap('6-he-is-down-open','BOTH DOWN: he is dragged to the boards - OPEN, the ring, the timer, HE\\'S DOWN - STRIKE HIM');
      if(boss.phase===2&&bru&&har&&/Tell$/.test(bru.mode)&&/Tell$|^jab$/.test(har.mode))snap('7-phase2-together','PHASE 2, TOGETHER: the Harlequin harasses while the Brute winds up');
      if(s.pits&&s.pits.length)snap('8-phase2-the-slam-breaks-the-boards','PHASE 2: the Brute\\'s slam breaks the boards - a pit, for a few seconds');
      if(mp&&/Tell$/.test(mp.mode))snap('9-phase3-the-masterpiece','PHASE 3: the masterpiece in the Brute\\'s place, with the Harlequin still at your heels');
    }});
    for(let i=0;i<70;i++){BK.P.inv=99;BK.sim(1);if(i%3===0)BK.step(1);}BK.step(1);snap('10-the-curtain-falls','HIS DEATH: the curtain comes down');
    return res;})()`, 1800000);
  r.forEach(([name, d, note]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/puppeteer/' + name + '.png  -  ' + note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
