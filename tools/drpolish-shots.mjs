// tools/drpolish-shots.mjs - Deep Rails geometry stills (claude/drpolish). usage: node tools/drpolish-shots.mjs <tag> x,y x,y ...  (tile coords). Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'a', pts = process.argv.slice(3).map(s => s.split(',').map(Number));
const out = join(ROOT, '../scratch/lane-reports/drpolish-shots'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;
    const shot=()=>{const c=document.createElement('canvas');c.width=BK.view.VW*3;c.height=BK.view.VH*3;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png')};
    const li=LEVELS.findIndex(l=>l.id==='minecart');BK.setHero('knight');BK.reset({fresh:true});BK.load(li);BK.state='play';BK.god=true;BK.sim(10);
    const o={shots:{}};
    for(const [x,y] of ${JSON.stringify(pts)}){BK.tp(x,y);BK.P.vx=0;BK.P.vy=0;for(let i=0;i<30;i++){BK.sim(1);BK.step(1);}o.shots[x+'_'+y]=shot();}
    return o;})()`, 600000);
  for (const [k, v] of Object.entries(r.shots)) writeFileSync(join(out, tag + '-' + k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
  console.log(Object.keys(r.shots).join(' '));
} finally { pg.close(); }
