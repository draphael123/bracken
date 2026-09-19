// A reusable support query for authored lights; no guessed endpoint in empty space.
export function lightSupport(L,x,y) {
  const tx=Math.floor(x/16),ty=Math.floor(y/16);
  const holds=(a,b)=>a>=0&&a<L.W&&b>=0&&b<L.H&&[1,2,4,5,7,8,10,11,12,13,14,15,16,17,18].includes(L.grid[b*L.W+a])&&!(L.ents||[]).some(e=>e.t==='bridge'&&e.y===b&&a>=e.x&&a<=(e.x1??e.x));
  for(let r=ty+1;r<L.H;r++)if(holds(tx,r))return {x:tx*16+8,y:r*16,kind:'pole'};
  for(let r=ty-1;r>=0;r--)if(holds(tx,r))return {x:tx*16+8,y:(r+1)*16,kind:'chain'};
  for(let d=1;d<=4;d++)for(const a of [tx-d,tx+d])if(holds(a,ty))return {x:(a+(a<tx?1:0))*16,y:ty*16+8,kind:'bracket'};
  return null;
}
