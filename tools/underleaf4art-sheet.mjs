/* tools/underleaf4art-sheet.mjs [poses] [scale] - a contact sheet of THE POTION MASTER's three looks (green P1 / blue P2 / red P3) over the named poses (default: the new ones).
   Writes scratch/lane-reports/underleaf4art-<PREFIX>-sheet.png.   PREFIX=after node tools/underleaf4art-sheet.mjs singed,snared,aloft,idle 5 */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const OUT = process.env.OUTDIR || 'C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports', PFX = process.env.PREFIX || 'after';
mkdirSync(OUT, { recursive: true });
const poses = (process.argv[2] || 'singed,snared,aloft,lashTell,trapTell,floated,idle').split(','), sc = +(process.argv[3] || 5);
const pg = await openPage({ audio: false, fonts: false });
try {
  const png = await pg.evalp(`(async()=>{const G=await import('/src/redraw/underleaf3_gran.js');const S=BK.SPR,sets=['grandmother','grandmother3','grandmother2'].filter(k=>S[k]),sc=${sc};
    const poses=${JSON.stringify(poses)},cols=poses.reduce((a,p)=>a+(G.N[p]||0),0);const w=S.grandmother.R[0].width,h=S.grandmother.R[0].height;
    const c=document.createElement('canvas');c.width=cols*(w+2)*sc+8;c.height=sets.length*(h+3)*sc+4;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#3a3a44';g.fillRect(0,0,c.width,c.height);
    sets.forEach((k,r)=>{let x=4;for(const p of poses)for(let i=0;i<(G.N[p]||0);i++){g.fillStyle='#2a2a34';g.fillRect(x,2+r*(h+3)*sc,w*sc,h*sc);g.drawImage(S[k].R[G.F[p]+i],x,2+r*(h+3)*sc,w*sc,h*sc);x+=(w+2)*sc;}});
    return c.toDataURL('image/png');})()`, 60000);
  writeFileSync(join(OUT, 'underleaf4art-' + PFX + '-sheet.png'), Buffer.from(png.split(',')[1], 'base64')); console.log('sheet ok');
} finally { await pg.close(); }
process.exit(0);
