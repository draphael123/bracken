// tools/berserker-sheet.mjs — THE BERSERKER'S FRAMES, ALL OF THEM, ON ONE SHEET (docs/berserker/frames.png): every key of his baked set
// (and of his BARE set, the off axe thrown), a row a key, each frame at 3x with its name - the contact sheet a reviewer reads him from.
//   node tools/berserker-sheet.mjs [out.png] [--skin=<id>] [--weapon=<id>]
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const outArg = args.find(a => !a.startsWith('--'));
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(async()=>{const skin=${JSON.stringify(opt('skin', 'bracken'))},wp=${JSON.stringify(opt('weapon', 'steel'))};
    const KEYS=${JSON.stringify(opt('keys', ''))}.split(',').filter(Boolean);const K=BKT.heroSet(skin,wp,false,'berserker'),SC=${+opt('scale', 3)},sets=[['',K.R],['BARE ',K.bare?K.bare.R:{}]];
    const rows=[];for(const [tag,R] of sets)for(const k of Object.keys(R)){if(KEYS.length&&!KEYS.includes(k))continue;if(tag&&!['idle','atk','atkB','atkC','heavy','windup','air','bzThrow','block'].includes(k))continue;rows.push({k:tag+k,f:(Array.isArray(R[k])?R[k]:[R[k]]).filter(Boolean).filter((c,i,a)=>a.indexOf(c)===i)});}
    const cw=Math.max(...rows.flatMap(r=>r.f.map(c=>c.width)))*SC, ch=Math.max(...rows.flatMap(r=>r.f.map(c=>c.height)))*SC, per=10;
    const lines=rows.reduce((n,r)=>n+Math.ceil(r.f.length/per),0);
    const c=document.createElement('canvas');c.width=110+per*(cw+4);c.height=lines*(ch+4)+4;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#3a4a3a';g.fillRect(0,0,c.width,c.height);let y=2;g.font='12px monospace';
    for(const r of rows){for(let i=0;i<r.f.length;i++){if(i&&i%per===0)y+=ch+4;const x=110+(i%per)*(cw+4),f=r.f[i];
        g.fillStyle=i%2?'#465a46':'#4e624e';g.fillRect(x,y,cw,ch);g.drawImage(f,0,0,f.width,f.height,x,y+ch-f.height*SC,f.width*SC,f.height*SC);}
      g.fillStyle='#e8e2cc';g.fillText(r.k+' ('+r.f.length+')',4,y+ch/2);y+=ch+4;}
    return c.toDataURL();})()`);
  const out = join(ROOT, outArg || 'docs/berserker/frames.png'); mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(png.split(',')[1], 'base64')); console.log('wrote ' + out);
  if (pg.errors.length) console.log(pg.errors);
} finally { pg.close(); }
