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
 for(const x of [510,530,555,578,733,787,839,994,1023,1050])ent('zombie',x,31,{buried:true,face:-1});
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
 /* ===== THE CAVERNS STOP BEING A CORRIDOR (Daniel, 2026-09-21) ===== */
 // A. THE LOWER CRYPT, under the Restless Rows: a wall shuts the road, and the way on is down, along and up.
 {const x0=504,x1=588;
  for(let y=34;y<=38;y++)for(let x=x0;x<=x1;x++)set(x,y,T.AIR);       // the crypt: 33 is its roof, 39 its floor
  for(let x=x0;x<=x0+2;x++){set(x,32,T.AIR);set(x,33,T.AIR);}          // the hole down into it
  rope(x0+3,32,38);                                                    // a rope to climb back the way you came
  for(let y=32;y<=33;y++)set(x1,y,T.AIR);rope(x1,31,38);               // and the rope up and out at the far end
  block(552,554,16,31);                                                // the fallen ossuary wall across the road above
  for(let x=x0+8;x<x1-6;x+=11){ent('torch',x,38);coins([x+3,37]);}
  ent('bonegob',530,38,{face:-1});ent('husk',574,38,{face:-1});}
 // B. POISON PITS in the Falling Gallery: a stone in the middle of each, two-tile jumps either side of it.
 for(const x of [646,690,714]){
  for(let y=32;y<=38;y++)for(let k=0;k<5;k++)set(x+k,y,T.AIR);
  block(x+2,x+2,33,38);                                                // the stone to land on
  rope(x,33,38);rope(x+4,33,38);                                       // a way out of the poison on either side
  pools.push({x0:x*TS,x1:(x+5)*TS,y:36*TS,depth:3*TS,bottom:39*TS,swim:true,clear:true,harm:true,poison:true,foulCol:'#5c8a24',foulColL:'#a6e04a',foulColD:'#1c3212'});
  coins([x+2,30]);}
 // C. THE CLIMB at the Bone Stairs: the road is walled below the gallery; the arch at 864 is the way up and over.
 {for(let x=876;x<=905;x++)if(L.grid[24*L.W+x]===T.AIR)set(x,24,T.ONEWAY);
  structures.push({x0:876,x1:905,top:24,floor:32,kind:'arch'});
  block(896,898,25,31);rope(906,24,31);coins([884,23],[892,23],[900,23]);}
 // D. GAS VENTS: x, the floor row the grate sits in, and where in its cycle it starts.
 const gasVents=[[520,39,0],[540,39,1.2],[565,39,2.1],[728,32,0.4],[736,32,1.8],[790,32,0.9],[796,32,2.4],[838,32,1.4],[990,32,0.7],[1015,32,2.0],[1050,32,1.1]]
  .map(([x,y,phase])=>({x,y,phase,period:3.4,hitT:0}));
 ent('silver',434,28);ent('silver',933,23);ent('silver',162,31);
 ent('check',1076,31);sign(1077,'THE BURIED DEAD. LEDGES CLEAR HIS POISON. HIS HANDS AND SKULLS REACH THEM.');
 /* THE OSSUARY HAS TIERS NOW. Daniel: "the buried dead boss fight also needs more platforms so you can avoid some of
    his attacks" - and the fight was already BUILT for that and never given the ground to do it with. Every one of his
    attacks carries a height condition: the poison nova only lands within 80px of the floor, the erupt within 90, the
    body slam within 44, the fist within 25. There was one tier at row 29, which is 48px up: it clears the slam and
    just clears the body slam, and does nothing at all about the nova or the erupt. So there was nowhere in this room
    to stand that the nova could not reach, in a fight whose code says there should be.
    LOW at row 29 (48px: under the nova), HIGH at row 26 (96px: over it). The high tier overlaps the low one rather
    than sitting across a gap, so it is a three-row hop and not a leap of faith - and it is deliberately NOT safe,
    because THE HANDS (buried-dead.js clawTell) come up through whatever you are standing on. */
 for(const x of [1087,1110]){for(let j=x;j<x+4;j++)set(j,29,T.ONEWAY);structures.push({x0:x,x1:x+3,top:29,floor:32,kind:'arch'});}
 for(const x of [1091,1106]){for(let j=x;j<x+4;j++)set(j,26,T.ONEWAY);structures.push({x0:x,x1:x+3,top:26,floor:32,kind:'arch'});}
 /* A REAL PLATFORMING FIGHT (Daniel, 2026-09-24: "platforms to jump on in his arena"). Four ledges were somewhere to stand;
    these make them a ROUTE, over his head and back: a step at each wall (48px, under the nova, over his slam and his body
    slam), and THE CROWN - a bier hung on chains from the vault, 128px up, two rows over the high tier with a two-tile gap
    each side, right over the grave he rises from. Wall step, low, high, crown, high, low, wall step: the whole room is one
    line you can run without touching the floor, which is exactly what his SKULLS are for (buried-dead.js): the ledges clear
    the poison, the hands and the skulls reach them. A12 holds: the nova (80px) still has somewhere it cannot reach, the
    hands reach whatever you stood on, and the floor over the broken ground is still there for the arm-in-the-ground punish. */
 for(const x of [1081,1117]){for(let j=x;j<x+3;j++)set(j,29,T.ONEWAY);structures.push({x0:x,x1:x+2,top:29,floor:32,kind:'arch'});}
 for(let j=1097;j<=1103;j++)set(j,24,T.ONEWAY);structures.push({x0:1097,x1:1103,top:16,floor:24,kind:'chains'});
 for(let y=16;y<32;y++)set(1122,y,T.PORT);
 interiors.push([1079,1137,16,31,'ossuary']);deco('grave',1084);deco('grave',1118);
 ent('burieddead',1100,31);ent('gate',1133,31);ent('torch',1082,31);ent('torch',1120,31);
 for(let i=L.ents.length-1;i>=0;i--){const e=L.ents[i];if(e.t==='zombie'&&L.ents.some(q=>q.t==='check'&&Math.abs(q.x-e.x)<6)){L.ents.splice(i,1);continue;}if(e.x<380||!['torch','deco','zombie','sign','check'].includes(e.t))continue;while(e.y>16&&L.grid[e.y*L.W+e.x]===T.SOLID)e.y--;if(pools.some(p=>e.x*TS>=p.x0&&e.x*TS<p.x1)&&L.grid[(e.y+1)*L.W+e.x]===T.AIR)L.ents.splice(i,1);}
 return {pools,gasVents,burialSections:sections,arena:{x0:1080*TS,x1:1122*TS,floor:32*TS,y0:16*TS,y1:33*TS,trigger:1083*TS,wallL:1079,wallR:1122,boss:'burieddead',music:'boss3',tint:'#526044',tintA:.1}};
}

/* THE GAS VENTS. A cycle you can read: idle, then 0.9s of hiss and rising wisps, then 1.1s of poison standing a hand
   higher than the hero. Standing in the column costs a little health and leaves the caverns' 2.4s poison on you -
   the same poison as the green water, so the level has one kind of harm with two shapes. */
export function gasVentState(v,time){const t=((time+v.phase)%v.period+v.period)%v.period;return t>v.period-1.1?'puff':t>v.period-2?'warn':'idle';}
export function updateGasVents(L,P,dt,time,hurt){
 for(const v of L.gasVents||[]){v.hitT=Math.max(0,(v.hitT||0)-dt);v.state=gasVentState(v,time);
  if(v.state==='puff'&&!P.dead&&v.hitT<=0&&Math.abs(P.x-(v.x*16+8))<11&&P.y>v.y*16-52&&P.y<=v.y*16+2){v.hitT=.7;hurt(v.x*16+8);}}
}
export function drawGasVents(g,L,cx,cy,time){
 for(const v of L.gasVents||[]){const x=Math.round(v.x*16-cx),y=Math.round(v.y*16-cy);if(x<-20||x>g.canvas.width+20)continue;
  g.fillStyle='#1c1a16';g.fillRect(x+2,y-2,12,3);g.fillStyle='#4a4436';for(let k=0;k<4;k++)g.fillRect(x+3+k*3,y-2,1,3);
  const st=gasVentState(v,time);
  if(st==='warn'){for(let k=0;k<4;k++){const ph=((time*1.6+k*.27)%1);g.globalAlpha=.55*(1-ph);g.fillStyle='#a6e04a';g.fillRect(x+4+((k*5)%9),y-4-ph*16,2,2);}g.globalAlpha=1;}
  if(st==='puff'){g.globalAlpha=.34;g.fillStyle='#5c8a24';g.fillRect(x+1,y-52,14,50);g.globalAlpha=.5;g.fillStyle='#a6e04a';
   for(let k=0;k<7;k++){const ph=((time*2.2+k*.19)%1);g.fillRect(x+2+((k*7)%11),y-4-ph*46,2,2);}g.globalAlpha=1;}}
}
