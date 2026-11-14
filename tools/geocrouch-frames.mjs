// PAGE TOOL: launches headless Chrome
// tools/geocrouch-frames.mjs - THE NEW FRAMES (claude/geocrouch) at 8x on one strip: her idle for scale, the five gFist (uppercut) beats and the two gSkin (stone skin) beats.   node tools/geocrouch-frames.mjs <out.png>
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(()=>{BK.setHero('geomancer');const R=BK.heroSet.R,SC=8,list=[['idle',R.idle[0]],...R.gFist.map((f,i)=>['fist'+i,f]),['crouch',R.crouch],...R.gSkin.map((f,i)=>['skin'+i,f]),['sense0',R.sense[0]]];
    const cw=Math.max(...list.map(l=>l[1].width))*SC,ch=Math.max(...list.map(l=>l[1].height))*SC,per=5,rows=Math.ceil(list.length/per),c=document.createElement('canvas');c.width=per*(cw+6)+6;c.height=rows*(ch+22)+6;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#3a4a3a';g.fillRect(0,0,c.width,c.height);g.font='16px monospace';
    list.forEach(([k,f],i)=>{const x=6+(i%per)*(cw+6),y=6+Math.floor(i/per)*(ch+22);g.fillStyle='#4e624e';g.fillRect(x,y+16,cw,ch);g.drawImage(f,0,0,f.width,f.height,x,y+16+ch-f.height*SC,f.width*SC,f.height*SC);g.fillStyle='#fff';g.fillText(k,x+2,y+13);});
    return c.toDataURL();})()`);
  writeFileSync(process.argv[2] || 'geocrouch-frames.png', Buffer.from(png.split(',')[1], 'base64'));
  if (pg.errors.length) console.log(pg.errors);
} finally { pg.close(); }
