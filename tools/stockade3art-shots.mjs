// PAGE TOOL: launches headless Chrome
// tools/stockade3art-shots.mjs - THE STOCKADE 3 ART stills (claude/stockade3art): the gallows, the gate walk, the stair, the yard + hall pegs, the Chieftain lured and crushed,
// the crew pinned. Full frames at 2x, plus 4x crops of the Chieftain. Saved into OUTDIR (default scratch/lane-reports/stockade3art-shots/after). Not in the suite: pictures are for eyes.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUTDIR || join(ROOT, '../scratch/lane-reports/stockade3art-shots/after'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id==='stockade');
    const shot=(sx,sy,sw,sh,k)=>{const W=BK.view.VW,Hh=BK.view.VH;sx=sx||0;sy=sy||0;sw=sw||W;sh=sh||Hh;k=k||2;const c=document.createElement('canvas');c.width=sw*k;c.height=sh*k;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,sx,sy,sw,sh,0,0,c.width,c.height);return c.toDataURL('image/png');};
    const tick=n=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}};const S=()=>BK.stockade(),H=()=>BKT.stk(),E=()=>BK.enemies(),P=()=>BK.P;const pile=id=>S().piles.find(q=>q.id===id);
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=true;BK.sim(10);};const o={shots:{}};
    load();const p2=pile('pile-2');BK.tp(38,7);tick(40);o.shots.gallows=shot();
    BK.tp(48,13);tick(40);o.shots.gatewalk=shot();BK.tp(44,13);tick(30);o.shots.gatewalk2=shot();
    BK.tp(Math.floor(p2.cleat/16)-1,19);P().face=1;tick(20);o.shots.peg=shot(0,0,0,0,3);
    const py=pile('pile-y');BK.tp(Math.floor(py.cleat/16)-1,19);tick(30);o.shots.yard=shot();
    load();const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);tick(200);const ch=E().find(q=>q.t==='chief'&&q.alive);ch.hornCd=99;ch.kegCd=99;const hl=pile('hall-l'),spot=hl.cleat+Math.sign(hl.x-hl.cleat)*14;
    H().give();P().x=spot;P().y=A.floor;P().face=-1;ch.x=spot+90;ch.mode='walk';ch.modeT=1;ch.lureCd=0;tick(2);H().blow();let k=0;while(k++<300&&!(ch.mode==='lured'&&ch.lureLook))tick(1);tick(10);o.shots.lured=shot();o.lured=ch.mode;
    P().x=spot;P().face=Math.sign(hl.cleat-hl.x);tick(1);BK.press('atk');k=0;while(k++<120&&ch.mode!=='planted')tick(1);tick(12);o.shots.crushed=shot();o.crushed=ch.poseKind;
    load();H().give();BK.tp(Math.floor(p2.cleat/16)-1,19);P().face=1;tick(20);H().blow();k=0;while(k++<300&&E().filter(e=>e.alive&&e.gateGuard==='out'&&Math.abs(e.x-p2.x)<26).length<2)tick(1);BK.press('atk');tick(60);o.shots.pinned=shot();
    return o;})()`, 300000);
  for (const [k, v] of Object.entries(r.shots)) writeFileSync(join(out, k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
  console.log('stockade3art-shots:', JSON.stringify({ ...r, shots: Object.keys(r.shots) }), '->', out);
} finally { pg.close(); }
