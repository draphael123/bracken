export function stormShipPolish(L,id,T){
 if(!['flotilla','hurricane'].includes(id))return L;
 L.palette.ledges='cargo';
 if(id==='flotilla')for(const e of L.ents)if(e.t==='sign'&&e.x===306&&e.y===15)e.x=308;
 // Lower the swing's entire arc toward its boarding deck; its rope length and travel remain unchanged.
 for(const m of L.moversExtra||[])if(m.kind==='swing'){
  const deck=m.deck??(id==='hurricane'?20:(m.px<50*16?26:m.px<130*16?24:23));   /* (claude/flotilla2) a swing may name its own boarding deck */
  m.py=Math.max(m.py,(deck-2)*16-m.arm);m.nautical=true;
 }
 /* (claude/hurricane2) THE HURRICANE DECK 2 builds its own: no bulkhead guns, no splitting waist (the chores are cut); her topmast's breaks are L.deckBreaks from the level */
 return L;
}
export function updateDeckBreaks(L,P,dt,change,crash){
 for(const z of L.deckBreaks||[]){if(z.down)continue;
  /* BEHIND (the Falling Tower): it does not wait to be stood on, it waits to be LEFT. The hero has to have been
     on this floor and then gone off its left end, and the shorter fuse is the tower closing the way back. */
  if(z.behind){if(z.t<0){if(!z.seen&&P.x>=(z.x0-1)*16&&P.x<=(z.x1+1)*16&&P.y>=(z.row-4)*16&&P.y<=(z.row+1)*16)z.seen=true;
   if(z.seen&&P.x<(z.x0-3)*16&&P.y<=(z.row+2)*16)z.t=1.1;}}
  /* ON TOP (THE BURNING VILLAGE's beams): the fuse starts when you STAND on it, not when you come near it - a beam nine tiles
     long over a cellar has to be run, and a fuse lit from the roof before it would drop a hero who had not yet stepped on */
  else if(z.onTop){if(z.t<0&&P.ground&&P.x>=z.x0*16&&P.x<(z.x1+1)*16&&Math.abs(P.y-z.row*16)<3)z.t=z.fuse||1.5;}
  else if(z.t<0&&P.x>=(z.x0-2)*16&&P.x<=(z.x1+2)*16&&P.y>=(z.row-3)*16&&P.y<=(z.row+1)*16)z.t=1.5;
  if(z.t>=0){z.t-=dt;if(z.t<=0){z.down=true;for(let x=z.x0;x<=z.x1;x++)for(let y=z.row-1;y<=z.row;y++)change(x,y);crash(z);}}
 }
}
export function drawDeckBreaks(g,L,cx,cy,time){
 for(const z of L.deckBreaks||[])if(!z.down&&z.t>=0){g.fillStyle=Math.floor(time*9)%2?'#ffc66f':'#f27754';g.fillRect(z.x0*16-cx,z.row*16-cy-3,(z.x1-z.x0+1)*16,3);for(let x=z.x0;x<=z.x1;x++){g.fillRect(x*16+7-cx,z.row*16-cy-15,2,6);g.fillRect(x*16+7-cx,z.row*16-cy-7,2,2);}}
}
