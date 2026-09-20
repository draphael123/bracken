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
  for(let x=a+2;x<b-1;x+=5){block(x,x+2,31,39);deco('grave',x+1,30);coins([x+1,28]);}
 };
 sign(394,'GREEN WATER IS POISON. CROSS THE STONE GRAVES. NETS AT EACH END LET YOU CLIMB OUT.');
 poison(408,444);poison(458,474);poison(742,773);poison(800,831);
 sign(493,'THE DIRT IS MOVING. LEAVE THE CRACKS BEFORE THE DEAD RISE. JUMP OR STRIKE TO BREAK A GRAB.');
 for(const x of [506,530,555,578,733,787,839,994,1023,1050])ent('zombie',x,31,{buried:true,face:-1});
 sign(612,'DUST FALLS BEFORE STONE. KEEP MOVING WHEN THE ROOF SHAKES.');
 for(const x of [625,650,662,696,704,712,991,1010,1042]){block(x-2,x+2,16,25);ent('stal',x,26,{stone:true});}
 for(const x of [632,676,864,922]){for(let y=30;y<32;y++)set(x,y,T.SOLID);for(let y=28;y<32;y++)set(x+1,y,T.SOLID);for(let y=26;y<32;y++)set(x+2,y,T.SOLID);for(let j=x+3;j<x+12;j++)set(j,24,T.ONEWAY);structures.push({x0:x+3,x1:x+11,top:24,floor:32,kind:'arch'});rope(x+11,23,31);coins([x+5,23],[x+9,23]);}
 for(const x of [390,449,480,516,542,568,590,620,645,660,710,726,779,790,836,858,884,906,940,962,978,1004,1032,1064])ent('zombie',x,31,{face:-1});
 for(const x of [602,716,852,970]){ent('boo',x,23,{face:-1});ent('bat',x+10,20);}
 ent('silver',434,28);ent('silver',933,23);ent('silver',162,31);
 ent('check',1076,31);sign(1077,'THE BURIED DEAD. JUMP THE SLAM. TRACK HIS SHADOW, THEN LEAVE THE CRACK.');
 for(const x of [1087,1110]){for(let j=x;j<x+4;j++)set(j,29,T.ONEWAY);structures.push({x0:x,x1:x+3,top:29,floor:32,kind:'arch'});}
 for(let y=16;y<32;y++)set(1122,y,T.PORT);
 interiors.push([1079,1137,16,31,'ossuary']);deco('grave',1084);deco('grave',1118);
 ent('burieddead',1100,31);ent('gate',1133,31);ent('torch',1082,31);ent('torch',1120,31);
 for(let i=L.ents.length-1;i>=0;i--){const e=L.ents[i];if(e.t==='zombie'&&L.ents.some(q=>q.t==='check'&&Math.abs(q.x-e.x)<6)){L.ents.splice(i,1);continue;}if(e.x<380||!['torch','deco','zombie','sign','check'].includes(e.t))continue;while(e.y>16&&L.grid[e.y*L.W+e.x]===T.SOLID)e.y--;if(pools.some(p=>e.x*TS>=p.x0&&e.x*TS<p.x1)&&L.grid[(e.y+1)*L.W+e.x]===T.AIR)L.ents.splice(i,1);}
 return {pools,burialSections:sections,arena:{x0:1080*TS,x1:1122*TS,floor:32*TS,y0:16*TS,y1:33*TS,trigger:1083*TS,wallL:1079,wallR:1122,boss:'burieddead',music:'boss3',tint:'#526044',tintA:.1}};
}
