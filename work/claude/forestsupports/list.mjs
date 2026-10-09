import { LEVELS, T } from '../../../src/level.js';
import { islands, supportsOf } from '../../../tools/solid-islands.mjs';
for (const id of process.argv.slice(2)) { const L = LEVELS.find(d=>d.id===id).build(); const g=L.grid,W=L.W,H=L.H;
 console.log('==',id,W,H);
 for (const s of islands(L).filter(s=>!supportsOf(L,s).length)) {
  // ground below lowest cell of each column
  let minDrop=99; for(const j of s.cells){const x=j%W,y=(j/W)|0; if(s.cells.includes(j+W))continue; let b=y+1; while(b<H-1&&g[b*W+x]===T.AIR)b++; minDrop=Math.min(minDrop,b-y);}
  console.log(s.kinds.join('+'),'n'+s.n,'@'+s.x0+'-'+s.x1+','+s.y0+'-'+s.y1,'drop'+minDrop); } }
