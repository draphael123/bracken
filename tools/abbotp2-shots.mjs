// tools/abbotp2-shots.mjs <name> - THE FALSE ABBOT's phase two, two stills (claude/abbotp2): P2 START (he is in the chair) and THE SPILL (the chair on the floor).
// Saved at 2x into scratch/lane-reports/abbotp2-<name>-start.png / -ride.png / -spill.png. God mode. Not in the suite: pictures are for eyes.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const name = process.argv[2] || 'shot', out = process.env.OUTDIR || join(ROOT, '../scratch/lane-reports'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;
    const shot=()=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');};
    const li=LEVELS.findIndex(l=>l.id==='spire');BK.setHero('knight');BK.reset({fresh:true});BK.load(li);BK.state='play';BK.god=true;BK.sim(10);
    const A=BK.L.arena,fl=A.floor;BK.tp(Math.round(A.trigger/16)+1,Math.round(fl/16)-1);BK.P.face=1;
    const tick=n=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}};
    tick(200);const q=BK.boss;const out={};out.boss=q&&q.t;
    for(const e of BK.enemies())if(e!==q)e.alive=false;
    q.hp=Math.floor(q.maxHp*0.6);   // below 66%: phase two
    // stand the hero by the great bell side of the basket, a little west of it, looking at the chair
    BK.P.x=46*16;BK.P.y=fl;BK.P.vx=0;BK.P.face=1;
    let got=false;for(let i=0;i<900&&!got;i++){BK.P.x=Math.min(BK.P.x,46*16);for(const e of BK.enemies())if(e!==q)e.alive=false;tick(1);if(q.deck==='chair'&&q.mode==='riteTell'&&i>20)got=true;}
    out.inChair=got;out.mode=q.mode;out.deck=q.deck;out.phase=q.phase;tick(40);out.start=shot();
    // ride: the hero into the basket
    const m=BK.movers().find(m=>m.abbotBasket);out.m=!!m;
    BK.P.x=m.x+16;BK.P.y=m.y-1;BK.P.vy=0;BK.P.ground=true;BK.P.onMover=m;
    out.rideShots=[];let spill=false,n=0;
    for(let i=0;i<400&&!spill;i++){BK.P.x=m.x+16;if(q.mode==='fall'||q.mode==='downed')spill=true;tick(1);n++;if(!out.mid&&m.y>m.y0+10){out.mid=shot();}}
    out.mode2=q.mode;out.k=(m.y-m.y0)/(m.y1-m.y0);out.spillShot=shot();tick(30);out.after=shot();out.mode3=q.mode;
    return out;})()`, 600000);
  for (const [k, f] of [['start', 'start'], ['mid', 'ride'], ['spillShot', 'spill'], ['after', 'landed']]) if (r[k]) writeFileSync(join(out, 'abbotp2-' + name + '-' + f + '.png'), Buffer.from(r[k].split(',')[1], 'base64'));
  console.log(JSON.stringify({ ...r, start: undefined, mid: undefined, spillShot: undefined, after: undefined }));
} finally { pg.close(); }
