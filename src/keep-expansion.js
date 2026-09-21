// A submerged approach to the original keep: currents, vertical galleries and sluice machinery.
export function expandKeep(R,T,TS,crop){
 const K=crop(R,-400,0,600,64,TS),D=K.deep;
 K.mini={...R.mini};for(const k of ['x0','x1','trigger'])K.mini[k]+=400*TS;for(const k of ['wallL','gate'])K.mini[k]+=400;
 K.START={x:4,y:58};K.breathScale=3;K.keepExpansion=true;
 const set=(x,y,t)=>{K.grid[y*K.W+x]=t;},box=(a,b,c,d,t)=>{for(let y=c;y<=d;y++)for(let x=a;x<=b;x++)set(x,y,t);},ent=(t,x,y,o={})=>K.ents.push({t,x,y,...o});
 D.masonry.push([0,399,0,63]);
 box(0,399,0,63,T.SOLID);box(1,399,24,58,T.AIR);box(397,403,52,58,T.AIR);
 K.pools.unshift({x0:0,x1:400*TS,y:23*TS,bottom:59*TS,depth:36*TS,swim:true,capped:true,clear:true,wash:.28,grad:false});
 // The bubbles are reliable resting places, not consumable charges.
 for(const x of [4,28,52,76,104,124,152,176,196,224,248,268,284,320,340,364,388]){K.airRooms.push([x,x+3,53,58]);D.pockets.push([x,x+3,53,58]);D.vents.push({x:x+1,y:58,h:7,hot:false,drain:false});}
 for(const x of [4,60,124,194,252,320,380])ent('check',x,58);
 const sign=(x,text,y=58)=>ent('sign',x,y,{text});
 sign(6,'THE DROWNED KEEP. THREE TIMES THE BREATH HERE. FOLLOW BUBBLES TO SAFE AIR.');
 const sections=[['THE SUNKEN OUTER COURT',1,65],['THE COUNTERCURRENT',66,130],['THE FLOODED LIBRARY',131,195],['THE SLUICE WORKS',196,260],['THE THERMAL CISTERN',261,330],['THE BELL APPROACH',331,399]];
 for(const [name,a,b]of sections){D.zones.push({name,x0:a,x1:b,y0:24,y1:58,col:[80,160,170],a:.12});K.interiors.push([a,b,24,58,'drowned']);D.noDress.push([a,b,24,58]);}
 // Broken columns make the first safe lesson in swimming over an obstacle.
 for(const x of [24,45]){box(x,x+3,48,58,T.SOLID);D.props.push({k:'statue',x:x+1,y:47,v:0});}
 sign(66,'THE LOW CURRENT PUSHES BACK. SWIM ABOVE THE PILLARS TO PASS.');
 D.currents.push({x0:70,x1:120,y0:47,y1:58,fx:-110,fy:0,kind:'stream'});
 for(const x of [78,98,118]){box(x,x+2,46,58,T.SOLID);D.props.push({k:'coral',x:x+1,y:45,v:1});}
 sign(132,'THE FLOODED LIBRARY. SWIM HIGH, THEN LOW. BUBBLES MARK THE RESTS.');
 for(const [x,top]of [[146,false],[167,true],[187,false]]){box(x,x+3,top?24:39,top?44:58,T.SOLID);const y=top?55:32;K.airRooms.push([x-5,x-2,y-2,y+1]);D.pockets.push([x-5,x-2,y-2,y+1]);}
 sign(198,'THE SLUICE WORKS. STRIKE THE WHEEL THREE TIMES. THE HIGH PASSAGE ALSO GOES THROUGH.');
 for(const x of [219,245]){box(x,x,36,58,T.PORT);D.gates.push({col:x,y0:36,y1:58,wheel:[x-5,58]});D.props.push({k:'brazier',x:x-8,y:58});}
 sign(262,'THE THERMAL CISTERN. RED VENTS LIFT YOU. CARRY BALLAST TO SINK; JUMP RELEASES IT.');
 for(const x of [267,307])ent('ballast',x,58,{kind:'stone'});
 for(const x of [275,295,315]){D.vents.push({x,y:58,h:9,hot:true,drain:false});D.currents.push({x0:x-5,x1:x+5,y0:27,y1:37,fx:45,fy:0,kind:'stream'});}
 D.clams.push({x:355,y:58});sign(352,'STRIKE THE CLAM TO RELEASE AIR.');
 sign(333,'THE BELL APPROACH. TAKE AIR BETWEEN THE JELLIES. USE THE WHOLE HEIGHT OF THE HALL.');
 for(const [t,x,y]of [['eel',35,39],['angler',53,54],['manta',86,34],['puffer',110,40],['jelly',140,41],['eel',161,50],['angler',180,30],['merrowspear',210,58],['merrowcaller',239,58],['puffer',266,38],['manta',290,30],['eel',322,48],['jelly',344,38],['jelly',366,49],['merrowbrute',390,58]])ent(t,x,y,{face:-1});
 for(let x=12;x<399;x+=8){let y=51;while(y>26&&K.grid[y*K.W+x]!==T.AIR)y--;if(K.grid[y*K.W+x]===T.AIR)ent('coin',x,y);}
 for(const x of [16,64,92,134,202,258,332,376])D.props.push({k:'statue',x,y:58,v:x%2});
 for(const x of [12,56,88,136,200,256,332,376])D.shafts.push({x,y0:24,y1:58,w:4,lean:.1});
 // A single silver in each major third rather than three clustered in the old castle.
 K.ents=K.ents.filter(e=>e.t!=='silver');ent('silver',154,30);ent('silver',306,32);ent('silver',530,58);
 for(const e of K.ents)if(e.t==='bellguard'&&e.mini)e.vaultKeeper=true;
 ent('sign',480,58,{text:'THE VAULT KEEPER. SWIM OUT OF THE PRESSURE MARKS. GUARD HIS SPEAR. STRIKE AFTER THE BELL.'});
 for(const x of [484,494,504]){K.airRooms.push([x,x+2,52,58]);D.pockets.push([x,x+2,52,58]);D.vents.push({x:x+1,y:58,h:7,hot:false,drain:false});}
 /* THE DROWNED GARRISON MAY BE PUT IN THE WATER. Every standable spot in a flooded castle is a wet one, and the
    sprinkler will only put a swimmer in a wet spot - so the keep's own dead were the one roster it could not place. */
 K.swimGarrison=['wight','tideguard','watch','merrowspear','merrowbrute','merrowcaller'];   /* not the bellguard: his three are placed by hand and counted */
 K.keepSections=sections.map(([name,x0,x1])=>({name,x0,x1})).concat([{name:'THE INNER KEEP',x0:400,x1:599}]);
 return K;
}
