/* tools/motherface-sheet.mjs - BEFORE / AFTER sheet of her every state (claude/motherface): <before dir> <after dir> <out png>. Each cell = her crop (200x160 of the 640x360 still) at 1.5x, before left, after right, two states a row.
   PORT=<port> node tools/motherface-sheet.mjs work/tmp-motherface/before2 work/tmp-motherface/shots work/claude/lane-done/motherface-before-after.png */
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
const [bd, ad, out] = process.argv.slice(2);
const tags = readdirSync(ad).filter(f => f.startsWith('mf-')).map(f => f.slice(3, -4));
const rd = (d, t) => 'data:image/png;base64,' + readFileSync(d + '/mf-' + t + '.png').toString('base64');
const items = tags.map(t => ({ t, b: rd(bd, t), a: rd(ad, t) }));
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(async()=>{const items=${JSON.stringify(items)};const cw=200,ch=185,S=1.5,w=cw*S,h=ch*S,cols=2,rows=Math.ceil(items.length/cols),gap=6;
    const c=document.createElement('canvas');c.width=cols*(w*2+gap*2)+gap;c.height=rows*(h+18+gap);const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#111';g.fillRect(0,0,c.width,c.height);
    const load=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s;});
    for(let n=0;n<items.length;n++){const it=items[n],x0=gap+(n%cols)*(w*2+gap*2),y0=Math.floor(n/cols)*(h+18+gap);g.fillStyle='#fff';g.font='13px monospace';g.fillText(it.t+'   before | after',x0,y0+13);
      for(const [k,s] of [[0,it.b],[1,it.a]]){const im=await load(s);g.drawImage(im,335,95,cw,ch,x0+k*(w+gap),y0+18,w,h);}}
    return c.toDataURL('image/png');})()`, 120000);
  writeFileSync(out, Buffer.from(png.split(',')[1], 'base64')); console.log(out);
} finally { await pg.close(); }
process.exit(0);
