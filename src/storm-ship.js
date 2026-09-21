export function stormShipPolish(L,id,T){
 if(!['flotilla','hurricane'].includes(id))return L;
 L.palette.ledges='cargo';
 if(id==='flotilla')for(const e of L.ents)if(e.t==='sign'&&e.x===306&&e.y===15)e.x=308;
 // Lower the swing's entire arc toward its boarding deck; its rope length and travel remain unchanged.
 for(const m of L.moversExtra||[])if(m.kind==='swing'){
  const deck=id==='hurricane'?20:(m.px<50*16?26:m.px<130*16?24:23);
  m.py=Math.max(m.py,(deck-2)*16-m.arm);m.nautical=true;
 }
 if(id==='hurricane'){
  for(const e of L.ents)if(e.t==='cannon'&&e.deck){const door=L.ents.filter(q=>q.t==='bulkhead').sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0];if(door&&Math.abs(door.x-e.x)<18)e.aim=Math.sign(door.x-e.x);}
  for(const e of L.ents){if(e.t==='check'&&e.x===96&&e.y===19)e.x=98;if(e.t==='sign'&&e.x===580&&e.y===19)e.x=581;}
  L.deckBreaks=[];
  for(const [x0,x1,ladder]of [[90,94,95],[238,242,243],[572,578,579]]){
   L.deckBreaks.push({x0,x1,row:20,t:-1,down:false});
   // A safe hold floor and a rope out remain after the upper deck comes down.
   for(let y=19;y<=26;y++)for(let x=ladder;x<=ladder+1;x++)L.grid[y*L.W+x]=T.NET;
   L.ents.push({t:'sign',x:x0===238?235:x0-2,y:19,text:'THE DECK IS SPLITTING. FOLLOW THE HOLD AFT; THE ROPES LEAD BACK UP.'});
   L.ents.push({t:'cutlass',x:x0+2,y:26,face:-1},{t:'deco',x:x1,y:26,kind:'rumBarrels',v:0});
  }
 }
 return L;
}
export function updateDeckBreaks(L,P,dt,change,crash){
 for(const z of L.deckBreaks||[]){if(z.down)continue;
  /* BEHIND (the Falling Tower): it does not wait to be stood on, it waits to be LEFT. The hero has to have been
     on this floor and then gone off its left end, and the shorter fuse is the tower closing the way back. */
  if(z.behind){if(z.t<0){if(!z.seen&&P.x>=(z.x0-1)*16&&P.x<=(z.x1+1)*16&&P.y>=(z.row-4)*16&&P.y<=(z.row+1)*16)z.seen=true;
   if(z.seen&&P.x<(z.x0-3)*16&&P.y<=(z.row+2)*16)z.t=1.1;}}
  else if(z.t<0&&P.x>=(z.x0-2)*16&&P.x<=(z.x1+2)*16&&P.y>=(z.row-3)*16&&P.y<=(z.row+1)*16)z.t=1.5;
  if(z.t>=0){z.t-=dt;if(z.t<=0){z.down=true;for(let x=z.x0;x<=z.x1;x++)for(let y=z.row-1;y<=z.row;y++)change(x,y);crash(z);}}
 }
}
export function drawDeckBreaks(g,L,cx,cy,time){
 for(const z of L.deckBreaks||[])if(!z.down&&z.t>=0){g.fillStyle=Math.floor(time*9)%2?'#ffc66f':'#f27754';g.fillRect(z.x0*16-cx,z.row*16-cy-3,(z.x1-z.x0+1)*16,3);for(let x=z.x0;x<=z.x1;x++){g.fillRect(x*16+7-cx,z.row*16-cy-15,2,6);g.fillRect(x*16+7-cx,z.row*16-cy-7,2,2);}}
}
