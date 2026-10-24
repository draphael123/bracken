// contact sheet of the kit's tiles at 4x (scratch; not committed)
import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'fs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const M=await import('/src/redraw/palisade_tiles.js'); const T={AIR:0,SOLID:1,ONEWAY:2,NET:99};
    const mk=(rows)=>{const H=rows.length,W=rows[0].length;return (x,y)=>{if(x<0||y<0||x>=W||y>=H)return 0;const c=rows[y][x];return c==='#'?1:c==='='?2:0;};};
    const out=document.createElement('canvas');out.width=1180;out.height=620;const g=out.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#4a6a8a';g.fillRect(0,0,out.width,out.height);
    // a small world per zone: ground block with a step, a shelf
    const world=[ '..........', '..........', '...==.....', '..........', '..####....', '..####....', '##########', '##########','##########' ];
    const at0=mk(world);
    let col=0;
    for(const [zx,label] of [[10,'edge'],[130,'yard'],[250,'scaf'],[330,'gatehouse'],[410,'gate']]){
      const at=(x,y)=>at0(x-zx,y);
      for(let y=0;y<world.length;y++)for(let x=0;x<10;x++){const t=at0(x,y);if(!t)continue;const c=M.pwTile(t,zx+x,y+20,(a,b)=>at0(a-zx,b-20),T,{});if(c)g.drawImage(c,(col*10*0+x)*64+0,0,0,0);}
      col++;}
    // simpler: lay each zone as a row of tiles 10 wide at y offset
    g.fillStyle='#4a6a8a';g.fillRect(0,0,out.width,out.height);
    let row=0;
    for(const zx of [10,130,250,330,410]){
      for(let y=0;y<world.length;y++)for(let x=0;x<10;x++){const t=at0(x,y);if(!t)continue;const wx=zx+x, wy=y+20;const c=M.pwTile(t,wx,wy,(a,b)=>at0(a-zx,b-20),T,{});if(c)g.drawImage(c,(x+ (row%2)*0)*32+ (row%2)*0,0,0,0);}
      row++;}
    // final: 5 zone panels, 10x9 tiles each at 2x => 320x288, laid 3 + 2
    g.fillStyle='#4a6a8a';g.fillRect(0,0,out.width,out.height);
    let k=0;
    for(const zx of [10,130,250,330,410]){ const ox=(k%3)*340, oy=Math.floor(k/3)*300;
      for(let y=0;y<world.length;y++)for(let x=0;x<10;x++){const t=at0(x,y);if(!t)continue;const c=M.pwTile(t,zx+x,y+20,(a,b)=>at0(a-zx,b-20),T,{});if(c)g.drawImage(c,ox+x*32,oy+y*32,32,32);} k++; }
    // timber panels: wall, beam, gate, stump, deck
    const wallW=['.......','.#####.','.#####.','.#####.','.#####.','.#####.'];
    const aw=mk(wallW); const ox=680, oy=300;
    for(let y=0;y<6;y++)for(let x=0;x<7;x++){const t=aw(x,y);if(!t)continue;const c=M.pwTile(t,224+x,15+y,(a,b)=>aw(a-224,b-15),T,{});if(c)g.drawImage(c,ox+x*32,oy+y*32,32,32);}
    const ag=mk(wallW); for(let y=0;y<6;y++)for(let x=0;x<7;x++){const t=ag(x,y);if(!t)continue;const c=M.pwTile(t,348+x,8+y,(a,b)=>ag(a-348,b-8),T,{});if(c)g.drawImage(c,ox+250+x*32-0,oy+y*32,32,32);}
    return out.toDataURL('image/png');})()`, 120000);
  writeFileSync(new URL('./tilesheet.png', import.meta.url), Buffer.from(r.split(',')[1], 'base64'));
  if (pg.errors.length) console.log(pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
