// tools/wicker-queen-shots.mjs - THE WICKER QUEEN in the page (claude/fair3): stills of her fight on the maypole green, rendered with BK.step and saved at
// 2x into work/claude/fair3/. God mode; the fight woken at the door and each beat forced. Not in the suite: pictures are for eyes.
//   usage: node tools/wicker-queen-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/fair3'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const res=[];
    const snap=(name,note)=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    const fi=LEVELS.findIndex(l=>l.id==='fair');
    BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(10);
    const A=BK.L.arena,G=BK.L.green,mid=G.bonfire*16+8,fl=A.floor;BK.tp(Math.round(A.trigger/16)+1,Math.round(fl/16)-1);BK.P.face=1;for(let i=0;i<150;i++){BK.sim(1);if(i%4===0)BK.step(1);}
    const q=BK.boss;for(const e of BK.enemies())if(e!==q)e.alive=false;q.lashCd=99;q.crownCd=99;
    const hold=(x,f,n)=>{for(let i=0;i<n;i++){BK.P.x=x;BK.P.y=fl;BK.P.vx=0;BK.P.face=f;BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);};
    hold(mid-120,1,20);snap('1-the-queen-frozen','THE WICKER QUEEN on the green: looked at, she cannot move (the embers glow between you)');
    q.x=mid+50;hold(mid-120,-1,40);snap('2-back-turned','BACK TURNED: she creeps across the green toward the embers, the wicker creaking');
    for(let i=0;i<200&&q.mode!=='burn';i++){BK.P.x=mid-120;BK.P.face=q.x<mid+20?1:-1;BK.sim(1);}hold(mid-120,1,25);snap('3-frozen-on-the-embers','TURNED ON HER ON THE EMBERS: the wicker catches and burns open (the window), mode '+q.mode);
    for(let i=0;i<400&&q.mode!=='still';i++)BK.sim(1);q.lashCd=0;q.lashN=0;for(let i=0;i<50&&q.mode!=='lashLowTell';i++)hold(mid-120,1,1);hold(mid-120,1,40);snap('4-low-lash-told','THE RIBBON LASH, LOW: told across the whole green at the height it will fly (jump it), mode '+q.mode);
    for(let i=0;i<40&&q.mode!=='lash';i++)hold(mid-120,1,1);hold(mid-120,1,12);snap('5-the-lash','THE LASH: the ribbons fly out from the maypole');
    q.hp=Math.floor(q.maxHp*0.6);q.lashCd=99;q.mode='still';q.x=mid+30;hold(mid-60,1,60);snap('6-full-dark','PHASE TWO, FULL DARK: only the light of your look (and the embers) - she is held only near you');
    q.x=mid-120+22;q.mode='still';for(let i=0;i<40&&q.mode!=='stabTell';i++){BK.P.x=mid-120;BK.P.face=-1;BK.sim(1);}BK.step(1);snap('7-the-sickle-in-the-dark','HER SPEAR from behind: her eye holes burn red, over the dark (look at her and it is cancelled), mode '+q.mode);
    q.hp=Math.floor(q.maxHp*0.3);q.mode='still';q.x=A.x1-60;q.lashCd=99;hold(A.x0+80,-1,90);snap('8-alight','PHASE THREE, ALIGHT: she lights the green herself, faster, and leaves fire behind her');
    q.crownCd=0;q.hp=q.maxHp;q.x=mid+60;for(let i=0;i<150&&q.mode!=='crown';i++)hold(mid-150,1,1);hold(mid-150,1,60);snap('9-the-crowning','THE CROWNING: two of the crowd come in (never more than two of hers alive)');
    q.hp=1;q.mode='burn';q.modeT=2;BKT.hurtEnemy(q,50,q.x-10,false);for(let i=0;i<150;i++){BK.P.inv=99;BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);snap('10-the-fair-is-over','HER DEATH: the heap, and the fair relic lying where she burned');
    return res;})()`, 600000);
  r.forEach(([name, d, note]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/fair3/' + name + '.png  -  ' + note); });
} finally { pg.close(); }
