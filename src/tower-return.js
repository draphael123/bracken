// The same masonry and landmarks, entered from the old wizard's study.
export function returnThroughTower(L,T,TS){
 const set=(x,y,t)=>L.grid[y*L.W+x]=t;
 const rect=(a,b,c,d,t)=>{for(let y=c;y<=d;y++)for(let x=a;x<=b;x++)set(x,y,t);};
 const ent=(t,x,y,o={})=>L.ents.push({t,x,y,...o});
 L.ents=L.ents.filter(e=>e.x>=118&&!['archmage','homunculus','check','sign','silver','key','lockgate','stray','npc','glyph','gplate','rune'].includes(e.t)&&!e.elite);
 for(let i=0;i<L.grid.length;i++)if(L.grid[i]===T.PORT)L.grid[i]=T.AIR;
 L.mage.shelves=[];L.mage.hung=[];L.mage.hedges=[];
 L.pools=[];L.ambushes=[];delete L.quest;
 L.START={x:695,y:15};L.music='fallingtower';L.fallingTower=true;L.reverseTower=true;
 L.moversExtra=L.moversExtra.filter(m=>m.kind!=='lane');
 // The inverted halls have fallen back into place. Cracked floors land on a lower gallery.
 for(const[a,b]of [[516,530],[560,580],[617,630]]){
  rect(a,b,16,23,T.AIR);rect(a,b,24,24,T.SOLID);rect(a,b,16,16,T.SOLID);
  for(let y=15;y<24;y++){set(a,y,T.NET);set(b,y,T.NET);}
 }
 rect(475,488,44,44,T.SOLID);rect(474,474,40,41,T.AIR);rect(474,474,42,44,T.SOLID);rect(442,468,39,39,T.AIR);
 for(let y=11;y<40;y++)set(490,y,T.NET);
 // Reverse-facing buttresses and a climb back into the orrery's upper doorway.
 rect(611,611,12,15,T.SOLID);rect(612,612,14,15,T.SOLID);
 rect(497,503,8,15,T.AIR);for(let y=8;y<16;y++)set(502,y,T.NET);
 rect(133,133,38,39,T.SOLID);rect(146,156,40,40,T.ONEWAY);for(let y=39;y<47;y++)set(146,y,T.NET);
 rect(173,173,36,39,T.SOLID);rect(174,174,38,39,T.SOLID);
 // The old barred front gate is broken open, so the return exits at the original entrance.
 rect(96,119,34,39,T.AIR);rect(0,95,20,39,T.AIR);rect(0,119,40,47,T.SOLID);
 L.ents=L.ents.filter(e=>!(e.x>=236&&e.x<=264)||e.t==='deco');
 ent('familiar',250,39,{mini:true,face:1});rect(238,238,14,39,T.PORT);
 L.mini={x0:239*TS,x1:264*TS,floor:40*TS,y0:14*TS,y1:41*TS,trigger:260*TS,reverse:true,wallL:264,gate:238,boss:'familiar',name:'THE FAMILIAR, UNBOUND'};
 // Six progressively smaller outer slabs leave the central eleven-tile footing intact.
 L.arena={x0:13*TS,x1:99*TS,floor:40*TS,y0:20*TS,y1:41*TS,trigger:94*TS,reverse:true,wallL:12,wallR:99,boss:'undeadmage',music:'boss4',tint:'#30334e',tintA:.08};
 ent('undeadmage',54,39,{face:1});ent('gate',5,39);rect(12,12,20,39,T.PORT);
 L.towerSlabs=[[13,31,1],[74,98,1],[32,41,2],[64,73,2],[42,47,3],[59,63,3]].map(([x0,x1,stage])=>({x0,x1,stage,t:-1,down:false}));
 L.deckBreaks=[[521,526,16],[567,574,16],[619,624,16],[193,200,40]].map(([x0,x1,row])=>({x0,x1,row,t:-1,down:false}));
 rect(193,200,41,45,T.AIR);rect(193,200,46,46,T.SOLID);for(let y=39;y<46;y++){set(193,y,T.NET);set(200,y,T.NET);}
 const stops=[[690,14,'THE STUDY. GO LEFT. THE TOWER IS COMING DOWN.'],[638,15,'THE OBSERVATORY. CRACKS GIVE WARNING. CHAINS LEAD OUT OF THE LOWER GALLERY.'],[587,15,'THE INVERTED HALL HAS FALLEN STRAIGHT. KEEP LEFT.'],[501,15,'THE ORRERY. CLIMB DOWN THE CHAIN BESIDE THE BROKEN BRASS SKY.'],[430,39,'THE MODEL IS FALLING. WATCH FOR DUST ABOVE.'],[375,37,'THE ALCHEMY LAB. THE VATS ARE EMPTY. THEIR KEEPERS ARE NOT.'],[297,39,'THE FAMILIAR GUARDS THE LIBRARY. GUARD ITS CLAW AND DASH. JUMP ITS SLAM.'],[233,39,'THE LIBRARY. THE OLD GALLERIES STILL LEAD HOME.'],[165,39,'FALLING SHELVES. THE CHAINS LEAD BACK TO THE FLOOR.'],[113,39,'THE DEAD ARCHMAGE. DODGE HIS SPELLS. CRACKING SLABS FALL AWAY. MOVE TO THE CENTRE.']];
 for(const[x,y,text]of stops){ent('check',x,y);const sx=x===375?x-4:x-2;let sy=y;while(sy<46&&L.grid[(sy+1)*L.W+sx]===T.AIR)sy++;ent('sign',sx,sy,{text});}
 ent('silver',625,23);ent('silver',420,38);ent('silver',183,29);
 for(const[x,floor]of [[646,16],[594,16],[549,16],[508,16],[415,40],[397,40],[365,40],[340,40],[227,40],[145,40]]){
  let roof=floor-8;while(roof>0&&L.grid[(roof-1)*L.W+x]!==T.SOLID)roof--;rect(x-1,x+1,roof,floor-8,T.SOLID);ent('stal',x,floor-7,{stone:true});
 }
 // Leave the final fight free of furniture and distant enemies; preserve recognisable tower rooms.
 L.ents=L.ents.filter(e=>!(e.x>=617&&e.x<=630&&e.t==='deco'&&!e.hang));
 L.calm=[[0,L.W-1,0,L.H-1]];L.noCoin=[[0,L.W-1,0,13]];
 return L;
}
