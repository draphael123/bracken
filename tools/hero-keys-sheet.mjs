// tools/hero-keys-sheet.mjs - EVERY HERO'S BAKED STRIKE FRAMES on one page load (claude/herokeys): like tools/pose-frames.mjs, which takes one hero a
// launch; this takes them all, at 4x, one sheet each.   node tools/hero-keys-sheet.mjs <outDir> [heroes] [keys]
//   -> <outDir>/<hero>-frames.png   (keys default: atk,atkB,atkC,heavy,air,takeoff,apex,fall,land)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';

const OUT = process.argv[2] || 'work/claude/herokeys/frames';
const HEROES = (process.argv[3] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const KEYS = (process.argv[4] || 'atk,atkB,atkC,heavy,air,takeoff,apex,fall,land').split(',');
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of HEROES) {
    const url = await pg.evalp(`(()=>{BK.setHero(${JSON.stringify(hero)});const K=BK.heroSet,rows=${JSON.stringify(KEYS)},Z=4;
      const list=rows.map(k=>{const f=K.R[k];return [k,f?(Array.isArray(f)?f:[f]):[]];});
      const cw=Math.max(...list.flatMap(([,fs])=>fs.map(c=>c.width)),34),ch=Math.max(...list.flatMap(([,fs])=>fs.map(c=>c.height)),56),n=Math.max(...list.map(([,fs])=>fs.length),1);
      const c=document.createElement('canvas');c.width=70+n*(cw*Z+6);c.height=list.length*(ch*Z+6)+6;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.fillStyle='#8aa6a0';g.fillRect(0,0,c.width,c.height);g.font='bold 14px monospace';
      list.forEach(([k,fs],i)=>{const y=6+i*(ch*Z+6);g.fillStyle='#14121c';g.fillText(k,4,y+ch*Z/2);fs.forEach((f,j)=>{const x=70+j*(cw*Z+6);g.fillStyle='#9ab6ae';g.fillRect(x,y,cw*Z,ch*Z);g.drawImage(f,x,y,f.width*Z,f.height*Z);});});
      return c.toDataURL('image/png')})()`);
    writeFileSync(join(OUT, hero + '-frames.png'), Buffer.from(url.split(',')[1], 'base64'));
    console.log('wrote ' + hero);
  }
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
