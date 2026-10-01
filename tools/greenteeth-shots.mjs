// tools/greenteeth-shots.mjs [hero=knight] [level=canal] - JENNY GREENTEETH in the page (claude/lockkeeper): stills of one whole fight, the bot
// playing it (src/jenny-greenteeth.js greenteethPlan), drawn frame by frame and saved at 2x into work/claude/greenteeth/ - one for each beat the
// first time it happens: the empty lock, the green lawn and a grab's ring, her stranded, the upper paddle running, the surge, the flood and her
// culvert, the flush, the fog and the lamp, the big one. Refill health, so the pictures reach the end. Not in the suite: pictures are for eyes.
//   node tools/greenteeth-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const hero = process.argv[2] || 'knight', level = process.argv[3] || 'canal';
const out = join(ROOT, 'work/claude/greenteeth'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const res=[],got=new Set();
    const snap=(name,note)=>{if(got.has(name))return;got.add(name);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    let wait=0,t0=-1;
    await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:[${JSON.stringify(hero)}],healthMode:'refill',maxSecs:300,draw:true,onFrame:({boss,P,f})=>{
      const s=BK.greenteethHands().show();if(!s)return;if(t0<0)t0=f;if(wait>0){wait--;return;}const m=boss.mode,A=s.A,rd=BK.greenteeth();
      if(f-t0===4)snap('1-the-empty-lock','THE LOCK before she wakes: the gates, the walers, the walkways and their paddles, the sunken narrowboat, the weed lying in the silt');
      if(boss.phase===1&&s.water.depth>40&&s.arms.some(a=>a.k==='grab'&&a.st==='tell'&&a.t<0.45))snap('2-phase1-the-green-lawn','PHASE 1: THE GREEN LAWN - low water under the weed (bright holds, dark is water); a bubbling ring where her arm will come (!!)');
      if(m==='stranded'&&boss.phase===1&&boss.modeT<1.4)snap('3-phase1-stranded','PHASE 1: the lower paddle struck with her at the gate - the lock ran out from under her: STRANDED in the mud, open');
      if(boss.phase===1&&s.pad.W.open&&s.pad.W.knot>0&&P.y<A.walk+4)snap('4-phase1-the-upper-paddle-runs','PHASE 1, cycle 2: she has knotted the upper paddle open - cut it before the drain can win');
      if(s.surge&&Math.abs(s.surge.x-P.x)<140)snap('5-the-surge','THE SURGE: a culvert boils and a wave runs the length of the lock along the water (!!, jump it)');
      if(boss.phase===2&&boss.base==='culvert'&&(m==='lashTell'||m==='reachTell'||m==='grabTell'))snap('6-phase2-the-flood','PHASE 2: THE FLOOD - the water up under the walkways, her eyes in a culvert\\'s grate, her arms coming out of it');
      if(m==='flushed'&&!boss.big&&boss.modeT<1.4)snap('7-phase2-flushed','PHASE 2: the paddle of her culvert opened - the rush throws her out, dazed on the water: open');
      if(boss.phase===3&&s.fog>0.8&&s.lamps&&(s.lamps.W.st==='lit'||s.lamps.E.st==='lit'))snap('8-phase3-the-fog-and-the-lamp','PHASE 3: THE FOG - only her eyes in the lantern light; a lamp dropped into the water at a gate, and she goes for it');
      if(boss.big&&(m==='stranded'||m==='flushed')&&boss.modeT<2.4)snap('9-phase3-the-big-one','PHASE 3: THE BIG ONE - lured to the light and the gate\\'s paddle worked: she cannot get away');
    }});
    for(let i=0;i<90;i++){BK.P.inv=99;BK.sim(1);if(i%3===0)BK.step(1);}BK.step(1);snap('10-the-lock-lies-still','HER DEATH: the lock lies still, and the lower gate opens on the canal');
    return res;})()`, 1800000);
  r.forEach(([name, d, note]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/greenteeth/' + name + '.png  -  ' + note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
