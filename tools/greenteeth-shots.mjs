// tools/greenteeth-shots.mjs [hero=knight] [level=canal] [out=work/claude/jenny2] - JENNY GREENTEETH in the page (claude/lockkeeper; claude/jenny2):
// stills of one whole fight, the bot playing it (src/jenny-greenteeth.js greenteethPlan), drawn frame by frame and saved at 2x - one for each beat the
// first time it happens: the empty lock, her slam's mark on the timber, her claws stuck, her bite's tell and her daze, the drain's strand, the flood and
// her culvert, the flush, the charge's bow-wave, the fog's shallows and her aground on the boat, the weed net, her wariness, her death. Refill health,
// so the pictures reach the end. Not in the suite: pictures are for eyes.
//   node tools/greenteeth-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const hero = process.argv[2] || 'knight', level = process.argv[3] || 'canal';
const out = join(ROOT, process.argv[4] || 'work/claude/jenny2'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const MM=await import('/src/jenny-greenteeth.js');if(!MM.NEW_MOVE)throw new Error('the page is serving another tree');BK.manualSimulation=true;const res=[],got=new Set();
    const snap=(name,note)=>{if(got.has(name))return;got.add(name);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    let t0=-1;
    await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:[${JSON.stringify(hero)}],healthMode:'refill',maxSecs:300,draw:true,onFrame:({boss,P,f})=>{
      const s=BK.greenteethHands().show();if(!s)return;if(t0<0)t0=f;const m=boss.mode,tell=s.arms.find(a=>a.st==='tell');
      if(f-t0===4)snap('01-the-empty-lock','THE LOCK before she wakes: the gates, the walers, the walkways and their paddles, the sunken narrowboat, the weed lying in the silt');
      if(m==='slamTell'&&tell&&tell.t<0.35)snap('02-her-slam','HER SLAM (phase one\\'s new blow, !!): risen, her arms high; the red mark on the timber where her claws will come - fixed now, step out of it');
      if(m==='stuck'&&boss.modeT<2.6)snap('03-stuck','HER CLAWS STUCK in the timber where you stood: she hangs off the ledge, open (3 s)');
      if(m==='biteTell'&&tell&&tell.t<0.3)snap('04-her-bite','HER BITE (!, yellow): her teeth at the water\\'s edge - meet it (block, deflect, flare)');
      if(m==='dazed'&&boss.modeT<2.6)snap('05-dazed','HER BITE MET: dazed at the surface, open (3 s)');
      if(m==='stranded'&&boss.phase===1&&boss.modeT<2.4)snap('06-the-drain','PHASE ONE\\'S BEAT: the lower paddle struck once with her at its gate - the water runs out from under her: STRANDED');
      if(boss.phase===2&&boss.base==='culvert')snap('07-the-flood','PHASE TWO\\'S BEAT: the lock floods to the walkways and she hides in a culvert, once - its paddle glows');
      if(m==='flushed'&&boss.modeT<2.6)snap('08-flushed','THE FLUSH: her culvert\\'s paddle struck - the rush throws her out, open');
      if(m==='chargeTell'&&tell&&tell.t<0.3)snap('09-her-charge','HER CHARGE (phase two\\'s new blow, !!): she sinks, and the arrow runs along the water at you - jump the wave');
      if(s.charge&&Math.abs(s.charge.x-P.x)<90)snap('10-the-wave','THE CHARGE: her bow-wave along the lock, her shadow under it');
      if(boss.phase===3&&s.fog>0.8&&m!=='fogTell'&&!got.has('11-the-fog'))snap('11-the-fog','PHASE THREE\\'S BEAT: the fog comes down and the water goes out - the narrowboat\\'s back is a shallow');
      if(m==='stranded'&&boss.phase===3&&boss.modeT<2.6)snap('12-aground','THE LURE: a hero on the boat drew her charge across the shallow - AGROUND, open');
      if(m==='netTell'&&tell&&tell.t<0.3)snap('13-her-net','HER WEED NET (phase three\\'s new blow, !!): the arc to where it will land - step out of it');
      if(s.wary&&s.wary.t>2.2&&!MM.gtOpen(boss)&&m!=='charge')snap('14-wary','SHE IS WARY after an opening: the ring of weed about her - the trick that opened her will not work again until it fades');
    }});
    for(let i=0;i<90;i++){BK.P.inv=99;BK.sim(1);if(i%3===0)BK.step(1);}BK.step(1);snap('15-the-lock-lies-still','HER DEATH: the lock lies still, and the lower gate opens on the canal');
    return res;})()`, 1800000);
  r.forEach(([name, d, note]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name + '.png  -  ' + note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
