/* tools/rookery2art-sheet.mjs - CONTACT SHEETS of the ROOKERY 2 art pass (claude/rookery2art): the sisters' poses per role, the three phase-2 survivors (x1.3, wearing the dead sisters'
   gifts), and the gale harpy's frames. Real page (sprites bake in the browser). Writes work/claude/shots/rookery2art/sheet-*.png.   PORT=<port> node tools/rookery2art-sheet.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'shots', 'rookery2art');
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const SA=await import('/src/redraw/shriek_sisters_art.js'),SH=await import('/src/shriek-sisters-hands.js'),POSE=SH.POSE;
    const NEW={diver:['diveWind','diveWind2','diveTell','dive','land','recover','recover2','hurt','stuck','stuckB','fall','downed','ferryWait','ferry','dead1','dead2','dead3'],
      shrieker:['hover','inhale','inhale2','screamTell','scream','screamTail','shockTell','shock','echoTell','hurt','perched','perchedB','perchedC','startled','startledB','fall','dead1','dead2','dead3'],
      snatcher:['hover','pick','carry','carryB','dropTell','drop','snatchTell','snatch','grabTell','grab','lift','hold','hurt','stuck','stuckC','fall','dead1','dead2','dead3']};
    const sheet=(rows,Z,CW,CH,cols)=>{const n=rows.reduce((a,r)=>a+Math.ceil(r.cells.length/cols),0);const cv=document.createElement('canvas');cv.width=cols*CW;cv.height=n*CH;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#5a5a66';g.fillRect(0,0,cv.width,cv.height);
      let ry=0;for(const row of rows){row.cells.forEach((c,i)=>{const cx=(i%cols)*CW,cy=ry+Math.floor(i/cols)*CH;g.fillStyle=(i%2)?'#62626e':'#585864';g.fillRect(cx,cy,CW,CH);g.save();g.beginPath();g.rect(cx,cy,CW,CH);g.clip();g.translate(cx+CW/2,cy+CH*0.78);g.scale(Z,Z);c.draw(g);g.restore();g.fillStyle='#fff';g.font='9px monospace';g.fillText(c.label,cx+3,cy+CH-3);});ry+=Math.ceil(row.cells.length/cols)*CH;}return cv.toDataURL('image/png');};
    const out={};
    for(const role of Object.keys(NEW)){out['sheet-'+role]=sheet([{cells:NEW[role].map(n=>({label:role+' '+n,draw:g=>{g.scale(1,1);SA.drawSister(g,role,POSE[n],false,0.4,undefined,'');}}))}],2,150,150,6);}
    /* the three survivors: each wears the other two */
    const SV=[['diver','SN'],['shrieker','DN'],['snatcher','DS']];const cells=[];
    for(const [role,gf] of SV)for(const n of ['hover','grow','diveTell','hold','stuck'])cells.push({label:role+' P2 '+n+' ('+gf+')',draw:g=>{g.scale(1.3,1.3);SA.drawSister(g,role,POSE[n],false,0.4,undefined,gf);}});
    out['sheet-survivors']=sheet([{cells}],2,150,160,5);
    {const FO=await import('/src/redraw/rookery_foes.js'),S=FO.bakeGaleHarpy(),names=['hover up','hover down','BEAT','BROKEN','TELL','hurt'];out['sheet-gale']=sheet([{cells:S.R.map((c,i)=>({label:'gale '+names[i],draw:g=>{g.imageSmoothingEnabled=false;g.drawImage(c,-S.ax,-S.ay);}}))},{cells:S.L.map((c,i)=>({label:'(left)',draw:g=>{g.drawImage(c,-S.ax,-S.ay);}}))}],3,150,150,6);}
    return out;})()`, 120000);
  for (const [k, v] of Object.entries(r)) { writeFileSync(join(OUT, k + '.png'), Buffer.from(v.split(',')[1], 'base64')); console.log(k + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
