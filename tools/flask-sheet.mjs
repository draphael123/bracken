// tools/flask-sheet.mjs - FLASKS 2 ART contact sheet: per hero, the idle frame then every drink frame (set.R.drink), blown up.
//   PORT=8811 node tools/flask-sheet.mjs [--skin=bracken] [--sc=6] [--h=knight,warden]  ->  work/claude/flasks2art/drink-sheet.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { openPage, ROOT } from './cdp.mjs';
import { join } from 'node:path';
const ALL = ['knight', 'pyro', 'pirate', 'reaper', 'warden', 'paladin', 'geomancer'], HA = process.argv.find(a => a.startsWith('--h=')), HEROES = HA ? HA.slice(4).split(',') : ALL;
const SKIN = (process.argv.find(a => a.startsWith('--skin=')) || '--skin=bracken').slice(7);
const SC = +((process.argv.find(a => a.startsWith('--sc=')) || '--sc=5').slice(5));
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(()=>{const H=${JSON.stringify(HEROES)};const rows=[];
    for(const h of H){const s=BKT.heroSet('${SKIN}',undefined,false,h);const seq=[s.R.idle[0]].concat(s.R.drink||[]);rows.push({h,seq});}
    const CX=4,CY=20,CW=32,CH=30,cw=CW*${SC}+6,ch=CH*${SC}+6,cols=Math.max(...rows.map(r=>r.seq.length)),LAB=70;
    const c=document.createElement('canvas');c.width=LAB+cols*cw;c.height=rows.length*ch+2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    rows.forEach((r,i)=>{const y=i*ch+1;g.fillStyle=i%2?'#3a3450':'#2a2438';g.fillRect(0,y,c.width,ch);g.fillStyle='#ffd36b';g.font='11px monospace';g.fillText(r.h,4,y+16);
      r.seq.forEach((f,k)=>{g.drawImage(f,CX,CY,CW,CH,LAB+k*cw+3,y+3,CW*${SC},CH*${SC});});});
    return c.toDataURL('image/png');})()`);
  const dir = join(ROOT, 'work', 'claude', 'flasks2art'); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'drink-sheet.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote work/claude/flasks2art/drink-sheet.png');
} finally { pg.close(); }

// the second sheet: HUD bottles by potency, the store's icons, the finds, glint, cork, splash, the flask in flight (dynamic import of the baked module through the page)
{
  const pg2 = await openPage({ audio: false, fonts: false });
  try {
    const url = await pg2.evalp(`(async()=>{const FA=await import('/src/flask-art.js');const SC=8;
      const groups=[['HUD tiers',FA.HUD_TIER],['store',Object.entries(FA.ICONS).map(e=>e[1])],['finds',Object.values(FA.FIND_ART)],['glint',FA.GLINT],['cork',FA.CORK],['splash',FA.SPLASH],['flight',FA.FLIGHT],['bottles',Object.values(FA.BOTTLE)]];
      const W=760,rowH=11*SC+8,c=document.createElement('canvas');c.width=W;c.height=groups.length*rowH;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#2a2438';g.fillRect(0,0,W,c.height);
      groups.forEach(([n,arr],i)=>{g.fillStyle='#ffd36b';g.font='11px monospace';g.fillText(n,4,i*rowH+14);let x=90;for(const f of arr){g.drawImage(f,x,i*rowH+4,f.width*SC,f.height*SC);x+=f.width*SC+10;}});
      return c.toDataURL('image/png');})()`);
    writeFileSync(join(ROOT, 'work', 'claude', 'flasks2art', 'icons-sheet.png'), Buffer.from(url.split(',')[1], 'base64'));
    console.log('wrote work/claude/flasks2art/icons-sheet.png');
  } finally { pg2.close(); }
}
