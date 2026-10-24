/* tools/underleafart-sheet.mjs <key,key,...> [scale] [name] - a contact sheet of SPR sets (every frame, scaled, on a dark ground), for the art pass: the goblin sheets it reskins, the new skins,
   THE GRANDMOTHER 3's frames. Writes work/claude/lane-done/underleafart/sheet-<name>.png.   PORT=<port> node tools/underleafart-sheet.mjs sprig,herbgatherer 6 gatherers */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done', 'underleafart');
mkdirSync(OUT, { recursive: true });
const keys = (process.argv[2] || 'sprig').split(','), scale = +(process.argv[3] || 6), name = process.argv[4] || keys.join('-');
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(()=>{const S=BK.SPR,keys=${JSON.stringify(keys)},sc=${scale};let W=0,H=0;const rows=[];
    for(const k of keys){const s=S[k];if(!s)continue;const FR=${JSON.stringify(process.env.FR || '')},fr=FR?FR.split(',').map(i=>s.R[+i]):s.R;const w=fr[0].width,h=fr[0].height;rows.push({k,fr,w,h});W=Math.max(W,fr.length*(w+2)*sc+8);H+=(h+3)*sc;}
    const c=document.createElement('canvas');c.width=W;c.height=H+4;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#3a3a44';g.fillRect(0,0,W,H+4);let y=2;
    for(const r of rows){let x=4;for(const f of r.fr){g.fillStyle='#2a2a34';g.fillRect(x,y,r.w*sc,r.h*sc);g.drawImage(f,x,y,r.w*sc,r.h*sc);x+=(r.w+2)*sc;}y+=(r.h+3)*sc;}
    return c.toDataURL('image/png');})()`, 60000);
  writeFileSync(join(OUT, 'sheet-' + name + '.png'), Buffer.from(png.split(',')[1], 'base64')); console.log('sheet-' + name + '.png');
} finally { await pg.close(); }
process.exit(0);
