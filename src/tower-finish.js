import {returnThroughTower} from './tower-return.js';
export function polishTower(L,id,T){
 if(!['mage','fallingtower'].includes(id))return L;
 L.palette.ledges='arcane';L.towerBackdrop=true;
 if(id==='fallingtower')L.ents=L.ents.filter(e=>!(e.t==='check'&&e.filled));
 if(id==='mage'){
  L.mage.skins.unshift([118,L.W-1,0,L.H-1,'tower']);
  L.ents=L.ents.filter(e=>!(e.t==='deco'&&['gardenWall','campfire','cairn','fallenLog','tuft','flower','stone'].includes(e.kind)&&e.x>=118));
  for(const p of L.pools.filter(p=>p.acid&&!p.magePool))for(let y=Math.floor(p.y/16);y<Math.ceil(p.bottom/16)+1;y++)for(let x=p.x0/16;x<p.x1/16;x++)L.grid[y*L.W+x]=T.SOLID;
  L.pools=L.pools.filter(p=>!p.acid||p.magePool);
  for(const e of L.ents)if(e.t==='sign'&&e.x===268)e.text='THE ALCHEMY LAB. THE SEALED VATS STILL SPIT. GUARD THE SLOW GOB OR STEP ASIDE.';
 }
 return L;
}
export function drawTowerBackdrop(g,L,cx,cy){
 if(!L.towerBackdrop)return;const lo=L.mage?.outside??0;
 const start=Math.max(lo,Math.floor(cx/16)-2),end=Math.min(L.W,Math.ceil((cx+g.canvas.width)/16)+2);
 g.save();g.beginPath();g.rect(lo*16-cx,0,L.W*16,g.canvas.height);g.clip();
 // Repeating structural ribs and high windows are fixed in world space, behind every room and floor.
 for(let x=Math.floor(start/12)*12;x<end;x+=12){const px=x*16-cx;g.fillStyle='#242135';g.fillRect(px,0,12,g.canvas.height);g.fillStyle='#3b344e';g.fillRect(px+2,0,2,g.canvas.height);
  for(let y=Math.floor(cy/192)*192-192;y<cy+g.canvas.height;y+=192){const py=y-cy+38;g.fillStyle='#161c36';g.fillRect(px+40,py,35,70);g.fillStyle='#586087';g.fillRect(px+42,py+2,31,1);g.fillStyle='#3b395d';g.fillRect(px+56,py,2,70);g.fillRect(px+40,py+35,35,2);g.fillStyle='#bec2d8';g.fillRect(px+47,py+12,2,2);g.fillRect(px+66,py+25,1,1);}}
 g.restore();
}
export function gateOccupied(col,rows,actors){return actors.some(p=>p&&!p.dead&&rows.some(y=>p.x+(p.w||10)/2>col*16-4&&p.x-(p.w||10)/2<(col+1)*16+4&&p.y>y*16&&p.y-(p.h||14)<(y+1)*16));}
export function fallingTower({source,T,TS}){return returnThroughTower(source,T,TS);}
