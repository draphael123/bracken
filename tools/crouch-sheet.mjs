// tools/crouch-sheet.mjs - ONE CONTACT SHEET: each hero standing beside his crouch (the ground line drawn through the boots) and the
// Lampreeve's lunge with the 18 px hit reach marked.   node tools/crouch-sheet.mjs out.png
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async()=>{const Z=4,HS=['knight','warden','pirate','paladin','geomancer','reaper','pyro'];
    const sets=HS.map(h=>BKT.heroSet('bracken',BKT.PROG.sword,false,h));const m=await import('/src/redraw/city.js');const L=m.bakeLampreeve();
    const cw=34,ch=56,cell=cw*Z+6,c=document.createElement('canvas');c.width=cell*(HS.length*2)+8;c.height=ch*Z+ch*Z*0.0+L.R[13].height*Z+30;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#7a8a6a';g.fillRect(0,0,c.width,c.height);
    HS.forEach((h,i)=>{const K=sets[i];[['idle',0],['crouch',0]].forEach(([k,j],q)=>{const f=K.R[k],cv=Array.isArray(f)?f[j]:f,x=4+(i*2+q)*cell;g.drawImage(cv,x,0,cv.width*Z,cv.height*Z);
      g.fillStyle='#ff0';g.fillRect(x,K.ay*Z,cw*Z,1);});});
    const y0=ch*Z+10,S=L.R[13];g.drawImage(S,4,y0,S.width*Z,S.height*Z);g.fillStyle='#ff0';g.fillRect(4,y0+L.ay*Z,S.width*Z,1);g.fillStyle='#0ff';g.fillRect(4+(L.ax+18)*Z,y0,1,S.height*Z);
    return c.toDataURL('image/png')})()`);
  writeFileSync(process.argv[2] || 'crouch-sheet.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote ' + (process.argv[2] || 'crouch-sheet.png'));
} finally { pg.close(); }
