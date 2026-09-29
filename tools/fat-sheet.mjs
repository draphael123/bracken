/* tools/fat-sheet.mjs <tag> - CAPTURE SHEET of the Goblin Queen (15 frames) and King Gorm (5 seated + 7 standing), the sprites
   straight off chars.js at 3x on a floor line, with each set's hitbox drawn over it and the painted size (bounding box of the
   opaque pixels, per frame) printed. Saved to work/fatqueen/<tag>.png. Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'sheet';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {bakeGoblinQueen,bakeKingBig}=await import('/src/chars.js');const K=bakeKingBig();
    const sets=[['QUEEN',bakeGoblinQueen()],['GORM seated',K.seated],['GORM standing',K.standing]],SC=3;
    const bbox=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=1e9,x1=-1,y0=1e9,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>0){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return [x0,x1,y0,y1];};
    const info=[];let W=0,H=20;const rows=sets.map(([n,s])=>{const f=s.R,w=f[0].width,h=f[0].height;W=Math.max(W,f.length*(w*SC+6));H+=h*SC+24;return {n,s,f,w,h};});
    const cols=8;const c=document.createElement('canvas');const rowsOf=sets.map(([n,s])=>Math.ceil(s.R.length/cols));
    let cw=0,ch=20;for(const q of rows){const per=Math.min(cols,q.f.length);cw=Math.max(cw,per*(q.w*SC+6));ch+=Math.ceil(q.f.length/cols)*(q.h*SC+18)+16;}
    c.width=cw;c.height=ch;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#2a2a3a';g.fillRect(0,0,cw,ch);g.font='12px monospace';
    let y=14;for(const q of rows){g.fillStyle='#ffd36b';g.fillText(q.n+'  canvas '+q.w+'x'+q.h+'  hitbox '+q.s.w+'x'+q.s.h+'  anchor '+q.s.ax+','+q.s.ay,4,y);y+=6;
      q.f.forEach((fr,i)=>{const col=i%cols,row=Math.floor(i/cols),x=col*(q.w*SC+6)+3,yy=y+row*(q.h*SC+18);
        g.fillStyle='#3a3a4e';g.fillRect(x,yy,q.w*SC,q.h*SC);g.drawImage(fr,x,yy,q.w*SC,q.h*SC);
        g.strokeStyle='#ff5050';g.strokeRect(x+(q.s.ax-q.s.w/2)*SC+.5,yy+(q.s.ay-q.s.h)*SC+.5,q.s.w*SC,q.s.h*SC);
        g.strokeStyle='#50ff50';g.beginPath();g.moveTo(x,yy+q.s.ay*SC);g.lineTo(x+q.w*SC,yy+q.s.ay*SC);g.stroke();
        const b=bbox(fr);g.fillStyle='#e8dcc0';g.fillText('#'+i+' '+(b[1]-b[0]+1)+'x'+(b[3]-b[2]+1),x,yy+q.h*SC+12);info.push(q.n+' #'+i+' paints '+(b[1]-b[0]+1)+'x'+(b[3]-b[2]+1)+' (x '+b[0]+'-'+b[1]+', y '+b[2]+'-'+b[3]+')');});
      y+=Math.ceil(q.f.length/cols)*(q.h*SC+18)+10;}
    return {png:c.toDataURL('image/png'),info};})()`);
  mkdirSync(join(ROOT, 'work/fatqueen'), { recursive: true });
  writeFileSync(join(ROOT, 'work/fatqueen/' + tag + '.png'), Buffer.from(r.png.split(',')[1], 'base64'));
  console.log(r.info.join('\n')); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
