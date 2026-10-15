// tools/dk2art-sheet.mjs - CONTACT SHEET of THE DEATH KNIGHT 2's hero poses (claude/dk2art): each row a move, frames left to right, the ground line yellow.
//   PORT=<port> node tools/dk2art-sheet.mjs out.png [zoom] [pose,pose,...]
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const Z = +(process.argv[3] || 4), keys = (process.argv[4] || 'idle,atk,atkB,atkC,graveKneel,priceHold,crescent,harvest,crouch').split(',');
  const url = await pg.evalp(`(async()=>{const Z=${Z},rows=${JSON.stringify(keys)};
    const K=BKT.heroSet('bracken',BKT.PROG.sword,false,'reaper');
    const get=k=>{const f=K.R[k];return !f?[]:Array.isArray(f)?f:[f];};
    const frames=rows.map(get);const maxN=Math.max(...frames.map(f=>Math.min(f.length,8)));
    let cw=0,ch=0;frames.forEach(f=>f.forEach(c=>{cw=Math.max(cw,c.width);ch=Math.max(ch,c.height);}));
    const cell=cw*Z+8,rowH=ch*Z+6;const c=document.createElement('canvas');c.width=Math.ceil(cell*maxN)+110;c.height=rows.length*rowH+4;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#4a5260';g.fillRect(0,0,c.width,c.height);g.font='12px monospace';
    rows.forEach((r,i)=>{const y=i*rowH+2;g.fillStyle='#fff';g.fillText(r,2,y+14);
      frames[i].slice(0,8).forEach((cv,j)=>{const x=104+j*cell;g.drawImage(cv,x,y,cv.width*Z,cv.height*Z);g.fillStyle='#ff0';g.fillRect(x,y+K.ay*Z,cw*Z,1);});});
    return c.toDataURL('image/png')})()`);
  writeFileSync(process.argv[2] || 'dk2art-sheet.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote');
} finally { pg.close(); }
