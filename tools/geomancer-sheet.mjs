// tools/geomancer-sheet.mjs — THE GEOMANCER'S FRAMES, ALL OF THEM, ON ONE SHEET (docs/geomancer/frames.png): every key of her
// baked set, a row a key, each frame at 3x with its name - the contact sheet a reviewer reads her from. `node tools/geomancer-sheet.mjs`
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(()=>{BK.setHero('geomancer');const K=BK.heroSet,R=K.R,keys=Object.keys(R),SC=3;
    const rows=keys.map(k=>({k,f:(Array.isArray(R[k])?R[k]:[R[k]]).filter(Boolean).filter((c,i,a)=>a.indexOf(c)===i)}));
    const cw=Math.max(...rows.flatMap(r=>r.f.map(c=>c.width)))*SC, ch=Math.max(...rows.flatMap(r=>r.f.map(c=>c.height)))*SC, per=10;
    const lines=rows.reduce((n,r)=>n+Math.ceil(r.f.length/per),0);
    const c=document.createElement('canvas');c.width=90+per*(cw+4);c.height=lines*(ch+4)+4;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#3a4a3a';g.fillRect(0,0,c.width,c.height);let y=2;g.font='12px monospace';
    for(const r of rows){for(let i=0;i<r.f.length;i++){if(i&&i%per===0)y+=ch+4;const x=90+(i%per)*(cw+4),f=r.f[i];
        g.fillStyle=i%2?'#465a46':'#4e624e';g.fillRect(x,y,cw,ch);g.drawImage(f,0,0,f.width,f.height,x,y+ch-f.height*SC,f.width*SC,f.height*SC);}
      g.fillStyle='#e8e2cc';g.fillText(r.k+' ('+r.f.length+')',4,y+ch/2);y+=ch+4;}
    return c.toDataURL();})()`);
  const out = join(ROOT, process.argv[2] || 'docs/geomancer/frames.png');   /* (a path under the repo, for a before/after pair: `node tools/geomancer-sheet.mjs docs/geomancer/round3/frames-before.png`) */ writeFileSync(out, Buffer.from(png.split(',')[1], 'base64')); console.log('wrote ' + out);
  if (pg.errors.length) console.log(pg.errors);
} finally { pg.close(); }
