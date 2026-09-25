// Final dressing adjustments run after the common decorators, so a fallback kit cannot reintroduce the wrong props.
export function polishCoastAndTown(L,id,T){
 if(id==='reef'){
  // The old rectangles described unrelated gaps in open water. Only the actual enclosed carrack and stern cabin have walls.
  L.interiors=[[122,209,8,31,'ship'],[384,397,18,20,'ship']];
  L.palette.ledges='cargo';
  L.tints=[[0,119,[170,185,170],.06],[119,213,[166,113,58],.1],[213,331,[45,135,153],.12],[331,425,[172,128,82],.08]];
  for(const [x,y,kind,v]of[[135,31,'coiledCable',0],[180,31,'seaChest',0],[205,31,'rumBarrels',0],[229,36,'brainCoral',1],[284,36,'coralFan',2],[314,36,'kelpTall',1],[368,23,'figurehead',0]])L.ents.push({t:'deco',x,y,kind,v});
 }
 if(id==='waymeet'){
  L.palette.ledges='awning';
  for(const e of L.ents)if(e.t==='deco'&&e.kind==='bridgepost')e.kind='lanternPost';
  // Two refuge bays are enough for the bridge riders. Remove the redundant raised slabs and lower their coins to the road.
  for(const x0 of [485,513])for(let x=x0;x<x0+4;x++)if(L.grid[34*L.W+x]===T.ONEWAY)L.grid[34*L.W+x]=T.AIR;
  for(const e of L.ents)if(e.t==='coin'&&[486,514].includes(e.x)&&e.y===33)e.y=34;
  const bad=new Set(['beanpoles','gardenWall','cairn','fallenLog','deadTree','yew']);
  L.ents=L.ents.filter(e=>!(e.t==='deco'&&bad.has(e.kind)));
  // Remove decorative miniature stone walls; keep every route tile, house roof and reward.
  for(const h of L.houses||[]){h.x0--;h.x1++;}
  L.ents.push({t:'drunk',x:281,y:35,face:-1},{t:'drunk',x:293,y:35,face:-1},{t:'sign',x:270,y:35,text:'LAST ROUND. THE BOTTLES FLY AFTER THE YELLOW MARK. GUARD, THEN CLOSE WHILE THEY SWAY.'});
 }
 /* THE MARSH'S BOARDWALKS STAND ON POSTS too (B9; level review, 2026-09-24): a duckboard over the pond with nothing under it read as
    floating. Only where the water or the ground is ten rows or less below: a walk up in the trees keeps the forest's convention. */
 if(id==='reef'||id==='waymeet'||id==='marsh'){
  L.routeSupports=[];const at=(x,y)=>L.grid[y*L.W+x];
  const deck=t=>t===T.ONEWAY||(id==='marsh'&&t===T.PLANK);   /* the marsh's boardwalk planks too */
  for(let y=id==='waymeet'?25:0;y<L.H-1;y++)for(let x=1;x<L.W-1;x++)if(deck(at(x,y))&&(!deck(at(x-1,y))||!deck(at(x+1,y)))){
   let b=y+1;while(b<L.H-1&&![T.SOLID,T.PLANK,T.ONEWAY].includes(at(x,b)))b++;
   const wet=id==='marsh'&&(L.pools||[]).some(p=>x*16>=p.x0&&x*16<p.x1&&p.y>y*16);   /* over a pond, the post goes down into it */
   if(b-y>1&&(b-y<=(id==='marsh'?10:24)||wet))L.routeSupports.push({x,y,bottom:b});
  }
 }
 return L;
}

