// tools/stockade3-shots.mjs - THE STOCKADE 3 stills (claude/stockade3-1101): the gate fork (peg, logs, gate walk), the logs down as a stair, the Chieftain
// lured under a hall pile, and CRUSHED. Saved at 2x into scratch/lane-reports/stockade3-shots/ (OUTDIR=). Not in the suite: pictures are for eyes.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUTDIR || join(ROOT, '../scratch/lane-reports/stockade3-shots'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id==='stockade');
    const shot=()=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');};
    const tick=n=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}};const S=()=>BK.stockade(),H=()=>BKT.stk(),E=()=>BK.enemies(),P=()=>BK.P;const pile=id=>S().piles.find(q=>q.id===id);
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=true;BK.sim(10);};const o={shots:{}};
    load();const p2=pile('pile-2');BK.tp(Math.floor(p2.cleat/16)-2,19);P().face=1;tick(60);o.shots.fork=shot();
    P().x=p2.cleat-14;P().face=1;tick(2);BK.press('atk');tick(90);P().x=p2.x-40;tick(30);o.shots.stair=shot();o.stair=pile('pile-2').st;
    load();H().give();const g=BK.L.stockade.gate;BK.tp(Math.floor(p2.cleat/16)-1,19);P().face=1;tick(20);H().blow();let k=0;while(k++<300&&E().filter(e=>e.alive&&e.gateGuard==='out'&&Math.abs(e.x-p2.x)<26).length<2)tick(1);o.shots.loud=shot();
    BK.press('atk');tick(40);o.shots.loudCrush=shot();
    load();const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);tick(200);const ch=E().find(q=>q.t==='chief'&&q.alive);ch.hornCd=99;ch.kegCd=99;const hl=pile('hall-l'),spot=hl.cleat+Math.sign(hl.x-hl.cleat)*14;
    P().x=spot;P().y=A.floor;P().face=-1;ch.x=spot+90;ch.mode='walk';ch.modeT=1;ch.lureCd=0;tick(2);H().blow();k=0;while(k++<300&&!(ch.mode==='lured'&&ch.lureLook))tick(1);tick(10);o.shots.lured=shot();o.lured=ch.mode;
    P().x=spot;P().face=Math.sign(hl.cleat-hl.x);tick(1);BK.press('atk');k=0;while(k++<120&&ch.mode!=='planted')tick(1);tick(12);o.shots.crushed=shot();o.crushed=ch.poseKind;
    return o;})()`, 240000);
  for (const [k, v] of Object.entries(r.shots)) writeFileSync(join(out, k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
  console.log('stockade3-shots:', JSON.stringify({ ...r, shots: Object.keys(r.shots) }), '->', out);
} finally { pg.close(); }
