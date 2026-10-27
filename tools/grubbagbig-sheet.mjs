/* tools/grubbagbig-sheet.mjs - LORD GRUBBAG at his new size (claude/grubbagbig, Daniel 10-25 "enormous, about double the queen, extremely fat"): two contact sheets for the lane report.
     1. work/claude/lane-done/grubbagbig-vs-queen.png - him beside THE GOBLIN QUEEN (src/chars.js bakeGoblinQueen, seated and standing) at the SAME scale, on one floor, with a
        knight for size and each one's measured box (opaque pixels): x2 nearest-neighbour so the pixels read.
     2. work/claude/lane-done/grubbagbig-poses.png - every pose of his (src/grubbag-hands.js POSE), at 1:1, labelled.
   Prints the measured sizes (px) as JSON. Headless Chrome through tools/cdp.mjs. Not in the suite.
     PORT=<port> node tools/grubbagbig-sheet.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done');
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const CH=await import('/src/chars.js');const GH=await import('/src/grubbag-hands.js');
    const bb=c=>{const g=c.getContext('2d'),d=g.getImageData(0,0,c.width,c.height).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>40){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return {x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};};
    const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return [c,g];};
    const label=(g,t,x,y,col)=>{g.font='8px monospace';g.fillStyle=col||'#f2ece0';g.fillText(t,x,y);};
    /* him alone, measured: his body (no chair: the pose drawn on a clean canvas, then the chair's own pixels are in it too - so measure with and without) */
    const solo=(p)=>{const [c,g]=mkc(420,240);g.translate(170,226);GH._drawGrubbag(g,p,false,0,null);return c;};
    const q=CH.bakeGoblinQueen(),qSit=q.R[0],qStand=q.R[3];
    const sizes={queenSeated:bb(qSit),queenStanding:bb(qStand),grubbagSit:bb(solo(GH.POSE.sit))};
    /* 1. side by side, one floor, x2 */
    const W=760,H=270,[c1,g1]=mkc(W,H);g1.fillStyle='#2a1a2a';g1.fillRect(0,0,W,H);g1.fillStyle='#3a2830';g1.fillRect(0,232,W,38);g1.fillStyle='#5a4048';g1.fillRect(0,232,W,1);
    const fl=232;g1.drawImage(qStand,20-q.ax+64,fl-q.ay);g1.drawImage(qSit,150-q.ax+64,fl-q.ay);
    const kn=CH.bakeKnight?CH.bakeKnight():null;
    const gs=solo(GH.POSE.sit);g1.save();g1.translate(560,fl);g1.scale(-1,1);g1.drawImage(gs,-170,-226);g1.restore();
    for(const [x,b] of [[20+64-q.ax,sizes.queenStanding],[150+64-q.ax,sizes.queenSeated]]){g1.strokeStyle='rgba(255,211,107,0.6)';g1.strokeRect(x+b.x+0.5,fl-q.ay+b.y+0.5,b.w-1,b.h-1);}
    { const b=sizes.grubbagSit;g1.strokeStyle='rgba(143,209,96,0.7)';g1.strokeRect(560-(b.x+b.w-170)+0.5,fl-226+b.y+0.5,b.w-1,b.h-1); }
    label(g1,'THE GOBLIN QUEEN '+sizes.queenStanding.w+'x'+sizes.queenStanding.h,8,262,'#ffd36b');label(g1,'(seated '+sizes.queenSeated.w+'x'+sizes.queenSeated.h+')',150,262,'#ffd36b');
    label(g1,'LORD GRUBBAG (with his chair) '+sizes.grubbagSit.w+'x'+sizes.grubbagSit.h,430,262,'#8fd160');
    const [c1b,g1b]=mkc(W*2,H*2);g1b.imageSmoothingEnabled=false;g1b.drawImage(c1,0,0,W*2,H*2);
    /* 2. every pose */
    const ks=Object.keys(GH.POSE),cols=4,cw=380,chh=236,[c2,g2]=mkc(cols*cw,Math.ceil(ks.length/cols)*chh);g2.fillStyle='#24161e';g2.fillRect(0,0,c2.width,c2.height);
    ks.forEach((k,i)=>{const x=(i%cols)*cw,y=Math.floor(i/cols)*chh;g2.fillStyle=(i+Math.floor(i/cols))%2?'#2c1c26':'#24161e';g2.fillRect(x,y,cw,chh);g2.fillStyle='#3a2830';g2.fillRect(x,y+chh-14,cw,14);
      g2.save();g2.translate(x+150,y+chh-14);GH._drawGrubbag(g2,GH.POSE[k],false,0.2,k==='eat'?'dish':null);g2.restore();label(g2,k,x+4,y+10,'#ffd36b');});
    return {sizes,vs:c1b.toDataURL('image/png'),poses:c2.toDataURL('image/png')};})()`, 120000);
  writeFileSync(join(OUT, 'grubbagbig-vs-queen.png'), Buffer.from(r.vs.split(',')[1], 'base64'));
  writeFileSync(join(OUT, 'grubbagbig-poses.png'), Buffer.from(r.poses.split(',')[1], 'base64'));
  const s = r.sizes; console.log(JSON.stringify(s));
  console.log('him (with chair) / the queen standing: ' + (s.grubbagSit.w / s.queenStanding.w).toFixed(2) + 'x across, ' + (s.grubbagSit.h / s.queenStanding.h).toFixed(2) + 'x high');
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
