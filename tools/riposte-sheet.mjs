// tools/riposte-sheet.mjs - EVERY HERO'S PARRY AND RIPOSTE FRAMES on one sheet (claude/riposteart): per hero a row, the two PARRY frames then the three
// RIPOSTE frames, 4x on a flat ground tone with the foot line marked.   PORT=8838 node tools/riposte-sheet.mjs [out.png] [heroes]
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { openPage } from './cdp.mjs';
const OUT = process.argv[2] || 'work/claude/shots/riposteart/sheet.png';
const HEROES = (process.argv[3] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker').split(',');
mkdirSync(dirname(OUT), { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(()=>{const Z=4,heroes=${JSON.stringify(HEROES)},rows=[];
    for(const h of heroes){BK.setHero(h);const K=BK.heroSet;rows.push([h,K,[...(K.R.parry||[]),...(K.R.ripo||[])],(K.R.parry||[]).length,K.ax,K.ay]);}
    const cw=Math.max(...rows.flatMap(r=>r[2].map(c=>c.width)),34),ch=Math.max(...rows.flatMap(r=>r[2].map(c=>c.height)),56),n=5;
    const c=document.createElement('canvas');c.width=70+n*(cw*Z+6)+10;c.height=rows.length*(ch*Z+6)+6;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#8aa6a0';g.fillRect(0,0,c.width,c.height);g.font='bold 14px monospace';
    rows.forEach(([h,K,fs,np,ax,ay],i)=>{const y=6+i*(ch*Z+6);g.fillStyle='#14121c';g.fillText(h,4,y+ch*Z/2);
      fs.forEach((f,j)=>{const x=70+j*(cw*Z+6)+(j>=np?10:0);g.fillStyle=j<np?'#9ab6ae':'#a6b6a0';g.fillRect(x,y,cw*Z,ch*Z);
                g.fillStyle='rgba(20,18,28,0.35)';g.fillRect(x,y+ch*Z-8,cw*Z,2);g.drawImage(f,x,y+ch*Z-8-ay*Z,f.width*Z,f.height*Z);});});
    return c.toDataURL('image/png')})()`);
  writeFileSync(OUT, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + OUT);
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
