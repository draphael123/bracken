// tools/abbotclear-shots.mjs - THE FALSE ABBOT's phase two CLARITY stills (claude/abbotclear): the intro pan (chair, mid-rope, basket), the glowing basket + ghost chair, riding down, a warded-hit pulse.
// Saved at 2x into scratch/lane-reports/abbotclear-<n>.png. God mode off the hero's death only. Not in the suite: pictures are for eyes.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUTDIR || join(ROOT, '../scratch/lane-reports'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;
    const shot=()=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');};
    const li=LEVELS.findIndex(l=>l.id==='spire');BK.setHero('knight');BK.reset({fresh:true});BK.load(li);BK.state='play';BK.god=true;BK.sim(10);
    const A=BK.L.arena,fl=A.floor;BK.tp(Math.round(A.trigger/16)+1,Math.round(fl/16)-1);BK.P.face=1;
    const tick=n=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}};
    tick(200);const q=BK.boss;const o={shots:{}};o.boss=q&&q.t;
    for(const e of BK.enemies())if(e!==q)e.alive=false;
    BK.P.x=40*16;BK.P.y=fl;BK.P.vx=0;BK.P.face=1;
    q.hp=Math.floor(q.maxHp*0.6);
    let started=false,n=0;for(let i=0;i<600;i++){BK.P.x=Math.min(BK.P.x,40*16);for(const e of BK.enemies())if(e!==q)e.alive=false;tick(1);n++;if(q.phase===2&&!started){started=true;o.startedAt=n;break;}}
    o.phase=q.phase;
    // intro stills: sample the camera beat
    const snaps=[10,45,75];let k=0;for(let i=0;i<140&&k<snaps.length;i++){tick(1);if(i===snaps[k]){o.shots['intro'+k]=shot();k++;}}
    o.introDone=false;
    let got=false;for(let i=0;i<1500&&!got;i++){BK.P.x=Math.min(BK.P.x,46*16);for(const e of BK.enemies())if(e!==q)e.alive=false;tick(1);if(q.deck==='chair'&&q.mode==='riteTell'&&i>20)got=true;}
    o.inChair=got;o.mode=q.mode;o.deck=q.deck;
    BK.P.x=49*16;BK.P.y=fl;BK.P.vx=0;BK.P.face=1;tick(50);o.shots.glow=shot();
    // a warded blow on him in the chair: the pulse
    const T=window.BKT||BK,fn=T.hurtAs;o.fn=!!fn;if(fn){fn('shot',q,3,BK.P.x,false);}tick(4);o.pulse=q.clr&&q.clr.pulse;o.shots.pulse=shot();
    const m=BK.movers().find(m=>m.abbotBasket);o.m=!!m;
    BK.P.x=m.x+16;BK.P.y=m.y-1;BK.P.vy=0;BK.P.ground=true;BK.P.onMover=m;
    let spill=false,mid=false;for(let i=0;i<400&&!spill;i++){BK.P.x=m.x+16;if(q.mode==='fall'||q.mode==='downed')spill=true;tick(1);if(!mid&&m.y>m.y0+10){o.shots.ride=shot();mid=true;}}
    o.clr=q.clr;o.mode2=q.mode;
    return o;})()`, 600000);
  for (const [k, v] of Object.entries(r.shots)) writeFileSync(join(out, 'abbotclear-' + k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
  delete r.shots; console.log(JSON.stringify(r));
} finally { pg.close(); }
