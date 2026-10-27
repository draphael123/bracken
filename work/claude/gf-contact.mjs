import { openPage } from '../../tools/cdp.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const d='work/claude/shots-gormfinish/';
const files=['hall-walk','hall-p2-walk','hall-p2-sidestep','hall-held-walk','hall-charge-flee','hall-flee-bearers','hall-litter-break','glade-walk','glade-sidestep-oak','gorm-death-debris','bestiary-king-after-1','map-kings-after'];
const imgs=files.map(f=>({f,b:'data:image/png;base64,'+readFileSync(d+f+'.png').toString('base64')}));
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(async()=>{ const L=${JSON.stringify(imgs)}; const W=760, cols=2; const ims=[]; for(const q of L){ const im=new Image(); await new Promise(r=>{im.onload=r; im.src=q.b;}); ims.push({im,f:q.f}); }
    const hs=ims.map(o=>Math.round(o.im.height*W/o.im.width)+16); const rows=Math.ceil(ims.length/cols); const rowH=[]; for(let r=0;r<rows;r++) rowH.push(Math.max(...hs.slice(r*cols,r*cols+cols)));
    const c=document.createElement('canvas'); c.width=cols*W; c.height=rowH.reduce((a,b)=>a+b,0); const g=c.getContext('2d'); g.fillStyle='#111'; g.fillRect(0,0,c.width,c.height); g.imageSmoothingEnabled=false;
    ims.forEach((o,i)=>{ const x=(i%cols)*W, y=rowH.slice(0,Math.floor(i/cols)).reduce((a,b)=>a+b,0); g.fillStyle='#ffd36b'; g.font='12px monospace'; g.fillText(o.f,x+4,y+12); g.drawImage(o.im,x,y+16,W,hs[i]-16); });
    return c.toDataURL('image/png'); })()`, 120000);
  writeFileSync(d+'contact-sheet-gormfinish.png', Buffer.from(png.split(',')[1],'base64')); console.log('ok');
} finally { await pg.close(); }
