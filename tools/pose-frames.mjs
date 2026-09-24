// tools/pose-frames.mjs — A HERO'S FRAMES FOR THE NAMED KEYS, blown up on one sheet, straight from the baked set (BK.heroSet)
// the draw uses: the quickest look at a pose while it is being drawn.   node tools/pose-frames.mjs knight lunge,toss,slam [out.png]
// (the knight's SHIELD THROW frames are drawn from his BARE set, the one without the kite: pass 'bare:toss')
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const [hero = 'knight', keys = 'idle', out = 'pose-frames.png'] = process.argv.slice(2);
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(()=>{BK.setHero(${JSON.stringify(hero)});const K=BK.heroSet,rows=${JSON.stringify(keys.split(','))},Z=4;
    const list=rows.map(k=>{const bare=k.startsWith('bare:'),key=bare?k.slice(5):k,set=bare&&K.bare?K.bare:K,f=set.R[key];return [k,f?(Array.isArray(f)?f:[f]):[]];});
    const cw=Math.max(...list.flatMap(([,fs])=>fs.map(c=>c.width)),34),ch=Math.max(...list.flatMap(([,fs])=>fs.map(c=>c.height)),56),n=Math.max(...list.map(([,fs])=>fs.length),1);
    const c=document.createElement('canvas');c.width=110+n*(cw*Z+8);c.height=list.length*(ch*Z+8)+8;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#7a8a6a';g.fillRect(0,0,c.width,c.height);g.font='bold 14px monospace';
    list.forEach(([k,fs],i)=>{const y=8+i*(ch*Z+8);g.fillStyle='#14121c';g.fillText(k,6,y+ch*Z/2);fs.forEach((f,j)=>{const x=110+j*(cw*Z+8);g.fillStyle='#8c9c7c';g.fillRect(x,y,cw*Z,ch*Z);
      g.drawImage(f,x,y,f.width*Z,f.height*Z);g.fillStyle='#c33';g.fillRect(x+K.ax*Z,y+K.ay*Z,Z,Z);});});
    return c.toDataURL('image/png')})()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  if (pg.errors.length) console.log('page errors:', pg.errors);
  console.log('wrote ' + out);
} finally { pg.close(); }
