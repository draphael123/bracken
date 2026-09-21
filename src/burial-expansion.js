// The lower necropolis uses permanent grave crossings, marked ambushes and loose roof stone.
export function extendBurial({L,T,TS,interiors,structures}){
 const {block,set,ent,coins}=L,pools=[],G=32;
 block(378,1139,0,59);for(let y=16;y<G;y++)for(let x=378;x<1138;x++)set(x,y,T.AIR);
 const sign=(x,text)=>ent('sign',x,31,{text}),deco=(kind,x,y=31)=>ent('deco',x,y,{kind});
 const rope=(x,a,b)=>{for(let y=a;y<=b;y++)set(x,y,T.NET);};
 const sections=[['GRAVE CAUSEWAY',380,479],['THE RESTLESS ROWS',480,599],['THE FALLING GALLERY',600,719],['THE PLAGUE VAULT',720,849],['THE BONE STAIRS',850,979],['THE LAST PROCESSION',980,1078]];
 for(const x of [450,550,660,790,920,1036])ent('check',x,31);
 for(const[name,a,b]of sections){interiors.push([a,b,16,31,'ossuary']);ent('check',a+2,31);sign(a+4,name+'. FOLLOW THE CANDLES.');for(let x=a+12;x<b;x+=20){ent('torch',x,31);deco('bones',x+4);coins([x+6,30],[x+8,30]);}}
 const poison=(a,b)=>{
  for(let y=32;y<40;y++)for(let x=a;x<=b;x++)set(x,y,T.AIR);
  pools.push({x0:a*TS,x1:(b+1)*TS,y:33*TS,depth:7*TS,bottom:40*TS,swim:true,clear:true,harm:true,poison:true,foulCol:'#5c8a24',foulColL:'#a6e04a',foulColD:'#1c3212'});
  rope(a,30,39);rope(b,30,39);
  /* FOUR-WIDE SLABS. Three-wide footing over a two-wide slot is what made this a stumble rather than a crossing:
     miss it and you bobbed in a channel too narrow to do anything in. The slabs are wider now and the coin sits on
     the far half, so the hop is a committed one. (A three-wide channel was tried and rejected: measured, it needs a
     run-up, and from a standing jump every one of the six drops in the poison. The green river with a drain lever
     that docs/audit-new-levels-0920.md asks for is still the bigger job.) */
  for(let x=a+2;x<b-2;x+=6){block(x,x+3,31,39);deco('grave',x+1,30);coins([x+2,28]);}
 };
 sign(394,'GREEN WATER IS POISON. CROSS THE STONE GRAVES. NETS AT EACH END LET YOU CLIMB OUT.');
 poison(408,445);poison(458,474);poison(742,773);poison(800,831);   /* 445, not 444: at six tiles a slab the old width fitted this pool exactly and left a one-column pocket at the net that the dead-end payer would not pay */
 sign(493,'THE DIRT IS MOVING. LEAVE THE CRACKS BEFORE THE DEAD RISE. JUMP OR STRIKE TO BREAK A GRAB.');
 for(const x of [506,530,555,578,733,787,839,994,1023,1050])ent('zombie',x,31,{buried:true,face:-1});
 sign(612,'DUST FALLS BEFORE STONE. KEEP MOVING WHEN THE ROOF SHAKES.');
 for(const x of [625,650,662,696,704,712,991,1010,1042]){block(x-2,x+2,16,25);ent('stal',x,26,{stone:true});}
 for(const x of [632,676,864,922]){for(let y=30;y<32;y++)set(x,y,T.SOLID);for(let y=28;y<32;y++)set(x+1,y,T.SOLID);for(let y=26;y<32;y++)set(x+2,y,T.SOLID);for(let j=x+3;j<x+12;j++)set(j,24,T.ONEWAY);structures.push({x0:x+3,x1:x+11,top:24,floor:32,kind:'arch'});rope(x+11,23,31);coins([x+5,23],[x+9,23]);}
 for(const x of [390,449,480,516,542,568,590,620,645,660,710,726,779,790,836,858,884,906,940,962,978,1004,1032,1064])ent('zombie',x,31,{face:-1});
 for(const x of [602,716,852,970]){ent('boo',x,23,{face:-1});ent('bat',x+10,20);}
 /* THE UPPER GALLERY. Half of these caverns was one unbroken floor with a dead void over it - 53% of its screens had
    two standable heights or fewer, against Kingswood's 4% - so the ossuary gets the storey its wall is already drawn
    for: coffin shelves over the road, a ladder up to each, and something standing on them. The shelves are one-way,
    so nothing about the road below changes. */
 const shelfAt=(a,b,row)=>{let n=0;for(let x=a;x<=b;x++)if(L.grid[row*L.W+x]===T.AIR&&L.grid[(row-1)*L.W+x]===T.AIR&&L.grid[(row-2)*L.W+x]===T.AIR){set(x,row,T.ONEWAY);n++;}
  if(n>b-a){structures.push({x0:a,x1:b,top:row,floor:32,kind:'arch'});return true;}
  for(let x=a;x<=b;x++)if(L.grid[row*L.W+x]===T.ONEWAY)set(x,row,T.AIR);return false;};
 const clearRun=(a,b)=>{for(let x=a;x<=b;x++){if(L.grid[32*L.W+x]!==T.SOLID)return false;for(let y=22;y<32;y++)if(L.grid[y*L.W+x]!==T.AIR)return false;}return true;};
 let gal=0;
 for(const[,a,b]of sections)for(let x=a+10;x<b-16;x+=24){
  if(pools.some(p=>x*TS<p.x1+4*TS&&(x+13)*TS>p.x0-4*TS))continue;   // never over the green water: the way out of it is its own nets
  if(!clearRun(x-1,x+12))continue;
  const row=(gal%2)?23:27;
  if(!shelfAt(x,x+9,row))continue;
  rope(x+10,row,31);coins([x+2,row-1],[x+6,row-1]);
  ent(gal%3===0?'boo':gal%3===1?'bat':'zombie',x+4,row-1,{face:-1});
  if(row===23&&clearRun(x-1,x+12))shelfAt(x+2,x+7,27);   // a step up to the high one
  gal++;
 }
 ent('silver',434,28);ent('silver',933,23);ent('silver',162,31);
 ent('check',1076,31);sign(1077,'THE BURIED DEAD. JUMP THE SLAM. TRACK HIS SHADOW, THEN LEAVE THE CRACK.');
 for(const x of [1087,1110]){for(let j=x;j<x+4;j++)set(j,29,T.ONEWAY);structures.push({x0:x,x1:x+3,top:29,floor:32,kind:'arch'});}
 for(let y=16;y<32;y++)set(1122,y,T.PORT);
 interiors.push([1079,1137,16,31,'ossuary']);deco('grave',1084);deco('grave',1118);
 ent('burieddead',1100,31);ent('gate',1133,31);ent('torch',1082,31);ent('torch',1120,31);
 for(let i=L.ents.length-1;i>=0;i--){const e=L.ents[i];if(e.t==='zombie'&&L.ents.some(q=>q.t==='check'&&Math.abs(q.x-e.x)<6)){L.ents.splice(i,1);continue;}if(e.x<380||!['torch','deco','zombie','sign','check'].includes(e.t))continue;while(e.y>16&&L.grid[e.y*L.W+e.x]===T.SOLID)e.y--;if(pools.some(p=>e.x*TS>=p.x0&&e.x*TS<p.x1)&&L.grid[(e.y+1)*L.W+e.x]===T.AIR)L.ents.splice(i,1);}
 return {pools,burialSections:sections,arena:{x0:1080*TS,x1:1122*TS,floor:32*TS,y0:16*TS,y1:33*TS,trigger:1083*TS,wallL:1079,wallR:1122,boss:'burieddead',music:'boss3',tint:'#526044',tintA:.1}};
}
