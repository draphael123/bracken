/* tools/rookeryart-sheet.mjs - a CONTACT SHEET of THE ROOKERY's baked art (claude/rookeryart): every prop sprite, then the foes' frames, magnified x4 on one grey board.
   Real page (the sprites bake in the browser: canvas). Writes work/claude/lane-done/rookeryart-sheet.png (OUT=<dir> to change).   PORT=<port> node tools/rookeryart-sheet.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'lane-done');
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(async()=>{
    const W=await import('/src/redraw/rookery_world.js');const items=[];
    for(const [k,c] of Object.entries(W.SPRITES()))items.push([k,c]);
    let FO=null;try{FO=await import('/src/redraw/rookery_foes.js');}catch(e){}
    if(FO&&FO.SHEET)for(const [k,c] of Object.entries(FO.SHEET()))items.push([k,c]);
    try{const SA=await import('/src/redraw/shriek_sisters_art.js'),SH=await import('/src/shriek-sisters-hands.js');for(const [k,c] of Object.entries(SA.SHEET(SH.POSE)))items.push([k,c]);}catch(e){items.push(['ERR '+String(e).slice(0,60),document.createElement('canvas')]);}
    const Z=+(${JSON.stringify(process.env.ZOOM || '3')}),PAD=8,ROW=${+(process.env.ROW || 900)};let x=PAD,y=PAD,rowH=0;const place=[];
    for(const [k,c] of items){const w=c.width*Z,h=c.height*Z;if(x+w+PAD>ROW){x=PAD;y+=rowH+PAD+10;rowH=0;}place.push([k,c,x,y,w,h]);x+=w+PAD;rowH=Math.max(rowH,h);}
    const H=y+rowH+PAD+10;const cv=document.createElement('canvas');cv.width=ROW;cv.height=H;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#5a5a66';g.fillRect(0,0,ROW,H);
    for(const [k,c,px,py,w,h] of place){g.fillStyle='#6c6c78';g.fillRect(px,py,w,h);g.drawImage(c,px,py,w,h);g.fillStyle='#fff';g.font='9px monospace';g.fillText(k,px,py+h+9);}
    return cv.toDataURL('image/png');})()`, 120000);
  writeFileSync(join(OUT, 'rookeryart-sheet.png'), Buffer.from(png.split(',')[1], 'base64')); console.log('rookeryart-sheet.png');
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
