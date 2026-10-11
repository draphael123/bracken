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
