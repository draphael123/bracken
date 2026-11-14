// PAGE TOOL: launches headless Chrome
// tools/level-peek.mjs - the real page, one level, a wide crop round a tile (claude/knightshield): node tools/level-peek.mjs <levelIndex> <tx> <ty> <out.png>
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const [IDX, TX, TY, OUT] = [+process.argv[2], +process.argv[3], +process.argv[4], process.argv[5] || 'peek.png'];
const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(()=>{BK.manualSimulation=true;BK.reset({fresh:true});BK.load(${IDX});BK.state='play';BK.setHero('knight');BK.tp(${TX},${TY});BK.sim(1900);BK.step(1);BK.step(1);
    const v=BK.view,c=document.createElement('canvas');c.width=v.buf.width*3;c.height=v.buf.height*3;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(v.buf,0,0,c.width,c.height);return c.toDataURL('image/png')})()`);
  writeFileSync(OUT, Buffer.from(out.split(',')[1], 'base64')); console.log('wrote ' + OUT);
  if (pg.errors.length) console.log(pg.errors.slice(0, 3));
} finally { pg.close(); }
