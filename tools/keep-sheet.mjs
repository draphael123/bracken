/* tools/keep-sheet.mjs — the Drowned Knight's and the Drowned Captain's frames on one contact sheet, 4x (E6: look at it). Not in the suite.
   Writes work/keep2/knight-sheet.png. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
mkdirSync(new URL('../work/keep2/', import.meta.url), { recursive: true });
const pg = await openPage({ fonts: false });
try { const url = await pg.evalp(`(()=>{const sets=[BK.SPR.drownedknight,BK.SPR.drownedcaptain],Z=4,cw=30*Z,ch=26*Z;const c=document.createElement('canvas');c.width=cw*10;c.height=ch*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.fillStyle='#1c3a44';g.fillRect(0,0,c.width,c.height);sets.forEach((s,j)=>s.R.forEach((f,i)=>{g.fillStyle=(i+j)%2?'#22444f':'#1c3a44';g.fillRect(i*cw,j*ch,cw,ch);g.drawImage(f,i*cw+Z,j*ch+Z,f.width*Z,f.height*Z);}));return c.toDataURL('image/png');})()`);
  writeFileSync(new URL('../work/keep2/knight-sheet.png', import.meta.url), Buffer.from(url.split(',')[1], 'base64')); console.log('work/keep2/knight-sheet.png'); } finally { pg.close(); }
