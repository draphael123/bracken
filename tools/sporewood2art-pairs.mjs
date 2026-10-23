/* tools/sporewood2art-pairs.mjs - BEFORE / AFTER sheets for the lane report (claude/sporewood2art): each row is the greybox's still (left, work/claude/lane-done/sporewood2-<tag>.png) beside the art
   pass's (right, sporewood2art-<tag>.png), half size. Writes work/claude/lane-done/sporewood2art-pairs-<name>.png.   PORT=<port> node tools/sporewood2art-pairs.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const OUT = join(fileURLToPath(new URL('..', import.meta.url)), 'work', 'claude', 'lane-done');
const SHEETS = {
  places: ['glade', 'hollows', 'bog', 'larder', 'seed-stair', 'her-door'],
  rule: ['terrace', 'dark-bud-lit', 'dark-shaft', 'spring-spore', 'cap-ladder', 'root-knot'],
  mother: ['mother-idle', 'mother-lashTell', 'mother-crushTell', 'mother-bloomTell', 'mother-broodTell', 'mother-witherTell', 'mother-open'],
};
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const [name, tags] of Object.entries(SHEETS)) {
    const png = await pg.evalp(`(async()=>{const tags=${JSON.stringify(tags)};const w=320,h=180;const c=document.createElement('canvas');c.width=w*2+4;c.height=(h+4)*tags.length;const g=c.getContext('2d');g.fillStyle='#111';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
      const load=src=>new Promise(r=>{const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src=src;});
      for(let i=0;i<tags.length;i++){for(const [k,pre] of [[0,'sporewood2-'],[1,'sporewood2art-']]){const im=await load('/work/claude/lane-done/'+pre+tags[i]+'.png');if(im)g.drawImage(im,k*(w+4),i*(h+4),w,h);}}
      return c.toDataURL('image/png');})()`, 120000);
    writeFileSync(join(OUT, 'sporewood2art-pairs-' + name + '.png'), Buffer.from(png.split(',')[1], 'base64')); console.log('pairs ' + name);
  }
} finally { await pg.close(); }
process.exit(0);
