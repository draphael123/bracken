// tools/puppeteer-shots.mjs [hero=knight] [level=puppetstage] - THE PUPPETEER in the page (claude/puppeteer): stills of one whole fight, the bot playing it
// (src/lab.js puppetPlan) at normal health, drawn frame by frame, and saved at 2x into work/claude/puppeteer/ - one for each beat the first time it
// happens: a string glowing in a tell, the drop, him come down re-stringing, the batten, the flown puppets in the loft, the whip, the masterpiece, the fall,
// the curtain. Not in the suite: pictures are for eyes.   usage: node tools/puppeteer-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const hero = process.argv[2] || 'knight', level = process.argv[3] || 'puppetstage';
const out = join(ROOT, 'work/claude/puppeteer'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const res=[],got=new Set();
    const snap=(name,note)=>{if(got.has(name))return;got.add(name);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    let wait=0;
    await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:[${JSON.stringify(hero)}],healthMode:'normal',maxSecs:360,draw:true,onFrame:({boss,P})=>{
      const s=BK.puppeteerHands().show();if(!s)return;const pups=s.puppets.filter(p=>p.alive);if(wait>0){wait--;return;}
      const m=boss.mode,A=s.A,taut=pups.some(p=>/Tell$/.test(p.mode)&&p.modeT<0.35);
      if(boss.phase===1&&taut&&pups.some(p=>p.mode==='chopTell'))snap('1-phase1-the-strings-glow','PHASE 1: the soldier winds up its chop - its strings are taut and glow gold: cut one and the blow is gone');
      if(pups.some(p=>p.mode==='dropTell'&&p.modeT<0.5))snap('2-phase1-the-drop','PHASE 1: THE DROP - hoisted over you, its shadow on the boards (!!)');
      if(m==='restring'&&boss.onStage&&boss.modeT<3)snap('3-phase1-he-comes-down','PHASE 1: both puppets cut down - he rode his line to the stage and kneels re-stringing them: OPEN');
      if(boss.phase===2&&s.batten&&s.batten.st==='rise'&&P.onMover===s.batten){snap('4-phase2-the-batten','PHASE 2: the pin rail struck - the sandbag falls and the batten flies you up to the gallery');}
      if(boss.phase===2&&pups.some(p=>p.flown)&&Math.abs(P.y-A.gallery)<4)snap('5-phase2-the-loft','PHASE 2: in the loft - his puppets are flown up to your floor, their strings always taut');
      if((m==='whipLowTell'||m==='whipHighTell')&&boss.modeT<0.4)snap('6-phase2-the-whip','PHASE 2: THE WHIP told along the catwalk, '+(m==='whipLowTell'?'LOW (jump it)':'HIGH (duck it)'));
      if(m==='snareTell'&&boss.modeT<0.5)snap('7-phase2-the-snare','PHASE 2: THE SNARE - a loop of string on the boards at your feet (!!): step out');
      if(boss.phase===3&&pups.some(p=>p.t==='masterpiece'&&/Tell$/.test(p.mode)&&p.modeT<0.4))snap('8-phase3-the-masterpiece','PHASE 3: THE MASTERPIECE, four strings from the great crossbar, winding up ('+pups.find(p=>p.t==='masterpiece').mode+')');
      if(m==='fallen'&&boss.modeT<4.2)snap('9-phase3-he-fell','PHASE 3: all four cut - the masterpiece falls and the crossbar drags him off the gallery: OPEN');
    }});
    for(let i=0;i<70;i++){BK.P.inv=99;BK.sim(1);if(i%3===0)BK.step(1);}BK.step(1);snap('10-the-curtain-falls','HIS DEATH: the puppets drop where they hang, and the curtain comes down');
    return res;})()`, 1800000);
  r.forEach(([name, d, note]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/puppeteer/' + name + '.png  -  ' + note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
