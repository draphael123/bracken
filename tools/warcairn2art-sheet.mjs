/* tools/warcairn2art-sheet.mjs - a CONTACT SHEET of stills (claude/warcairn2art): node tools/warcairn2art-sheet.mjs <out.png> <cols> <cellW> <cellH> <file[@x,y,w,h]>...
   Each file is drawn into one cell (an optional crop x,y,w,h of the 640x360 still is scaled up to fill it, pixel-sharp), labelled with its name. Uses the page's canvas (no deps). */
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';
const [out, cols, cw, ch, ...items] = process.argv.slice(2);
const list = items.map(s => { const [f, c] = s.split('@'); return { name: basename(f).replace(/\.png$/, ''), b64: readFileSync(f).toString('base64'), crop: c ? c.split(',').map(Number) : null }; });
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(async()=>{const L=${JSON.stringify(list)},cols=${+cols},cw=${+cw},ch=${+ch},rows=Math.ceil(L.length/cols);const c=document.createElement('canvas');c.width=cols*cw;c.height=rows*(ch+12);const g=c.getContext('2d');g.fillStyle='#10131a';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
    for(let i=0;i<L.length;i++){const im=new Image();await new Promise(r=>{im.onload=r;im.src='data:image/png;base64,'+L[i].b64;});const x=(i%cols)*cw,y=Math.floor(i/cols)*(ch+12);const cr=L[i].crop||[0,0,im.width,im.height];g.drawImage(im,cr[0],cr[1],cr[2],cr[3],x,y+12,cw-2,ch-2);g.fillStyle='#e8dcc0';g.font='9px monospace';g.fillText(L[i].name,x+3,y+9);}
    return c.toDataURL('image/png');})()`, 120000);
  writeFileSync(out, Buffer.from(png.split(',')[1], 'base64')); console.log(out);
} finally { await pg.close(); }
process.exit(0);
