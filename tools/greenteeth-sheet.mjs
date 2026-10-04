// tools/greenteeth-sheet.mjs [out.png] - JENNY GREENTEETH's frames (src/redraw/greenteeth_art.js), every pose side by side at 3x on the canal's night,
// each with her body box (src/jenny-greenteeth.js GT.w/h) and the water's skin through it - for looking at, not a check (claude/jenny2).
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'fs';
const out = process.argv[2] || 'work/claude/jenny2/sheet.png';
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async()=>{const A=await import('/src/redraw/greenteeth_art.js'),M=await import('/src/jenny-greenteeth.js');const S=A.bakeGreenteeth(),K=3,n=S.R.length,cw=S.R[0].width,ch=S.R[0].height,cols=7,rows=Math.ceil(n/cols);
    const c=document.createElement('canvas');c.width=cols*(cw+6)*K;c.height=rows*(ch+14)*K;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#1a2420';g.fillRect(0,0,c.width,c.height);
    const names=Object.entries(M.GT_F).flatMap(([k,v])=>Array.isArray(v)?v.map((q,i)=>[q,k+i]):[[v,k]]);
    for(let f=0;f<n;f++){const x=(f%cols)*(cw+6)*K,y=Math.floor(f/cols)*(ch+14)*K;g.fillStyle='#24302a';g.fillRect(x,y,cw*K,ch*K);
      g.fillStyle='rgba(60,110,90,0.35)';g.fillRect(x,y+(S.ay-21)*K,cw*K,(21+1)*K);
      g.drawImage(S.R[f],x,y,cw*K,ch*K);g.strokeStyle='#ff6b6b';g.lineWidth=1;g.strokeRect(x+(S.ax-M.GT.w/2)*K+0.5,y+(S.ay+1-M.GT.h)*K+0.5,M.GT.w*K,M.GT.h*K);
      g.fillStyle='#e8f4f0';g.font='18px monospace';g.fillText(f+' '+((names.find(q=>q[0]===f)||[0,''])[1]),x+4,y+ch*K+18);}
    return c.toDataURL('image/png');})()`);
  writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log(out);
} finally { pg.close(); }
