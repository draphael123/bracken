/* THE BURIAL CAVERNS are one builder of their own since claude/burial2 (2026-09-26): src/burial-caverns.js */
export {burialCaverns} from './burial-caverns.js';
import {extendHarbor} from './harbor-expansion.js';
// The coast's last settlement: recover through water, climb the salvage cranes, leave through customs.
export function stormwreckHarbor({painter,T,TS}) {
 const L=painter(1080,44),{block,ent,coins,set,plat}=L,G=30,pools=[],interiors=[],structures=[],moversExtra=[];
 const cut=(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)set(x,y,T.AIR);};
 const deck=(a,b,y)=>{block(a,b,y,y+2);for(let x=a;x<=b;x++)set(x,y,T.PLANK);};
 const rope=(x,a,b)=>{for(let y=a;y<=b;y++)set(x,y,T.NET);};
 const deco=(kind,x,y,v=0)=>ent('deco',x,y,{kind,v});
 const sign=(x,text)=>ent('sign',x,G-1,{text});
 block(0,359,G,43);
 ent('check',5,29);sign(7,'STORMWRECK HARBOR. THE QUAYS ARE BROKEN. THE NETS BRING YOU BACK FROM THE WATER.');
 // 1. Broken quays: ranged sentries watch gaps, swimmers can recover beneath them.
 for(const [a,b] of [[30,43],[65,78],[182,207],[221,244]]){
  cut(a,b,G,39);pools.push({x0:a*TS,x1:(b+1)*TS,y:29*TS,swim:true,clear:true,bottom:40*TS,depth:11*TS});
  rope(a,27,39);rope(b,27,39);deco('pierPost',a-1,29);deco('pierPost',b+1,29);
  ent('eel',a+5,35);coins([a+3,34],[a+7,36],[b-2,34]);
 }
 for(const x of [18,53,88])ent('cutlass',x,29,{face:-1});
 for(const x of [25,59]){deck(x-2,x+2,26);rope(x+2,26,29);ent('lookout',x,25,{face:-1});structures.push({x0:x-2,x1:x+2,top:26,floor:G,kind:'timber'});}
 for(const x of [12,49,83])deco('rumBarrels',x,29,x%2);
 deco('wreckBow',46,29);deco('anchor',80,29);deco('mastStump',21,29);
 // 2. Customs house: a low boarding-party choke, then an upper ledger room with a permanent ladder.
 block(96,164,17,18);interiors.push([96,164,19,29,'ship']);structures.push({x0:96,x1:164,top:18,floor:G,kind:'timber'});
 rope(94,16,29);deck(106,120,24);deck(139,156,24);rope(108,23,29);rope(153,23,29);
 ent('check',95,29);sign(97,'THE CUSTOMS HOLD. CLIMB THE NETS TO THE LEDGER GALLERY, OR FIGHT THROUGH THE CARGO BELOW.');
 for(const x of [111,130,147,159])ent('boarder',x,29,{face:-1});ent('marine',117,23,{face:-1});ent('lookout',145,23,{face:-1});
 for(const x of [102,124,136,161])deco('kegStack',x,29);deco('chartTable',143,23);deco('seaChest',155,23);
 ent('silver',150,23);for(const x of [99,128,162])ent('torch',x,29);
 // 3. Salvage cranes: the boards move above a flooded basin; netted sides are the return route.
 ent('check',174,29);sign(176,'RIDE THE SALVAGE CRANES TO THE HIGH CARGO. THE NETS BRING YOU BACK.');
 for(const x of [193,232]){
  moversExtra.push({kind:'wheel',px:x*TS,py:20*TS,r:48,phase:0,period:10,x:0,y:0,w:30,h:6});
  structures.push({x0:x-1,x1:x+1,top:20,floor:40,kind:'timber'});
  deck(x-4,x+4,23);rope(x+4,22,39);deco('plunder',x,22,1);coins([x+2,22]);
  ent('petrel',x,16);ent('netter',x-3,22,{face:1});
 }
 ent('cutlass',214,29,{face:-1});deco('capstan',211,29);deco('coiledCable',217,29);
 // 4. The inland gate: a named salvage captain holds the road, with mixed support before his room.
 ent('check',252,29);sign(254,'THE SALVAGE YARD. THE CAPTAIN HOLDS THE INNER HARBOR. PUT HIM DOWN TO OPEN THE ROAD.');
 for(const x of [266,284])ent('marine',x,29,{face:-1});ent('boarder',276,29,{face:-1});
 deck(268,272,26);rope(272,26,29);ent('lookout',270,25,{face:-1});structures.push({x0:268,x1:272,top:26,floor:G,kind:'timber'});
 for(let y=18;y<30;y++)set(335,y,T.PORT);ent('check',297,29);ent('bosun',315,29,{mini:true,salvage:true,face:-1});ent('gate',1072,29);
 interiors.push([303,334,20,29,'ship']);block(303,334,18,19);structures.push({x0:303,x1:334,top:20,floor:G,kind:'timber'});
 for(const x of [258,292,301,337,347])deco('lanternDeck',x,29,1);
 for(const x of [260,289,340])deco('waterButt',x,29);
 sign(299,'BLOCK THE PIN AND HOOK. LEAVE THE CARGO MARKS. JUMP THE LOW CANNON SHOTS.');deco('plunder',329,29,2);deco('netPoles',346,29);
 const extension=extendHarbor({L,T,TS,pools,interiors,structures,moversExtra});
 for(let x=10;x<1070;x+=6)if(L.grid[G*L.W+x]!==T.AIR)coins([x,28]);
 return {...extension,W:L.W,H:L.H,grid:L.grid,ents:L.ents,START:{x:4,y:29},pools,interiors,structures,moversExtra,falls:[],music:'stormharbor',duskStart:-1,duskLen:1,night:true,nightA:0.08,
  palette:{set:'shore',sky:'sea',far:'sea',mid:'wrecks',near:'reef',dress:'reef',grass:'#686963',grassL:'#9a9b85',grassD:'#434c4e',dirt:'#414b52',dirtL:'#677079',dirtD:'#2b353d',haze:'rgba(62,88,108,0.14)',canopy:['#101b29','#1c2d3a','#2a3c49','#354b57']},
  weather:[{x0:0,x1:96*TS,kind:'rain'},{x0:165*TS,x1:303*TS,kind:'rain'},{x0:335*TS,x1:688*TS,kind:'rain'},{x0:783*TS,x1:99999,kind:'rain'}],ambient:[{x0:0,x1:96*TS,kind:'wind'},{x0:96*TS,x1:165*TS,kind:'hold'},{x0:165*TS,x1:99999,kind:'wind'}],
  calm:[],   /* A CALM OVER THE WHOLE LEVEL IS AN EMPTY LEVEL: this said [[0,1080,0,44]], which is every tile of the harbour, and garrison() skips anything inside a calm - so the sprinkler placed nothing here at all and the level was only ever the creatures placed by hand. The arena and the mini are excluded by their own rooms. */
  mini:{salvage:true,x0:302*TS,x1:335*TS,floor:G*TS,y0:20*TS,y1:(G+1)*TS,trigger:306*TS,wallL:302,gate:335,boss:'bosun',name:'THE SALVAGE CAPTAIN'}
 };
}
