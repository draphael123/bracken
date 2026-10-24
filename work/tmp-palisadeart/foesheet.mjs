import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'fs';
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{const S=BK.SPR; const rows=[['sprig',S.sprig],['stakesetter',S.stakesetter],['rockgoblin',S.rockgoblin],['lanternhand',S.lanternhand],['brute',S.brute],['maulcrew',S.maulcrew]];
 const SC=5, out=document.createElement('canvas'); out.width=8*24*SC+20; out.height=rows.length*24*SC+10; const g=out.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#8a6a48'; g.fillRect(0,0,out.width,out.height);
 rows.forEach(([n,s],ri)=>{ s.R.forEach((f,i)=>{ g.drawImage(f, 10+i*24*SC, 5+ri*24*SC, f.width*SC, f.height*SC); }); });
 return out.toDataURL('image/png'); })()`, 60000); writeFileSync(new URL('./foesheet.png', import.meta.url), Buffer.from(r.split(',')[1], 'base64')); if (pg.errors.length) console.log(pg.errors.slice(0,3)); } finally { await pg.close(); }
process.exit(0);
