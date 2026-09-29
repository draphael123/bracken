// tools/dance-sheet.mjs — ONE CAPTURE SHEET OF ALL SEVEN DANCES (dances lane, 2026-09-29): a row a hero, every distinct drawing of his
// dance in the order it plays, blown up, on the plain bracken skin - and a second block of the same seven in a different skin
// (--skin=<id>, default black), so the sheet shows the dance is baked into the skins too.  node tools/dance-sheet.mjs  ->  work/dances/dances.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { openPage, ROOT } from './cdp.mjs';
import { join } from 'node:path';

const HEROES = ['knight', 'pyro', 'pirate', 'reaper', 'warden', 'paladin', 'geomancer'];
const SKIN = (process.argv.find(a => a.startsWith('--skin=')) || '--skin=black').slice(7);
const SC = 3;
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(()=>{const H=${JSON.stringify(HEROES)},skins=['bracken','${SKIN}'];
    const rows=[];for(const sk of skins)for(const h of H){const s=BKT.heroSet(sk,undefined,false,h),R=s.R.dance,seq=[];let last=null;
      for(const c of R){const d=c.toDataURL();if(d!==last){seq.push(c);last=d;}}   /* each drawing once, in the order it plays */
      rows.push({h,sk,seq});}
    const cw=Math.max(...rows.flatMap(r=>r.seq.map(c=>c.width)))*${SC}+6,ch=Math.max(...rows.flatMap(r=>r.seq.map(c=>c.height)))*${SC}+6,cols=Math.max(...rows.map(r=>r.seq.length)),LAB=84;
    const c=document.createElement('canvas');c.width=LAB+cols*cw;c.height=rows.length*ch+2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#2a2438';g.fillRect(0,0,c.width,c.height);
    rows.forEach((r,i)=>{const y=i*ch+1;g.fillStyle=i%2?'#332c44':'#2a2438';g.fillRect(0,y,c.width,ch);g.fillStyle='#ffd36b';g.font='11px monospace';g.fillText(r.h,4,y+16);g.fillStyle='#9aa39a';g.fillText(r.sk+' x'+r.seq.length,4,y+30);
      r.seq.forEach((f,k)=>{g.drawImage(f,LAB+k*cw+3,y+3,f.width*${SC},f.height*${SC});});});
    return c.toDataURL('image/png');})()`);
  const dir = join(ROOT, 'work', 'dances'); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'dances.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote work/dances/dances.png');
} finally { pg.close(); }
