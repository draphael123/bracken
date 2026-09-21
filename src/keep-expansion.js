// A submerged approach to the original keep: currents, vertical galleries and sluice machinery - and, past the Bell
// Approach, THE NARROWS (src/keep-passages.js): siphons that drink your air, blighted water, poison grates, combined.
import {buildKeepNarrows} from './keep-passages.js';
export const KEEP_APPROACH=560;
export function expandKeep(R,T,TS,crop){
 const N=KEEP_APPROACH,K=crop(R,-N,0,N+200,64,TS),D=K.deep;
 K.mini={...R.mini};for(const k of ['x0','x1','trigger'])K.mini[k]+=N*TS;for(const k of ['wallL','gate'])K.mini[k]+=N;
 K.START={x:4,y:58};K.breathScale=3;K.keepExpansion=true;
 const set=(x,y,t)=>{K.grid[y*K.W+x]=t;},box=(a,b,c,d,t)=>{for(let y=c;y<=d;y++)for(let x=a;x<=b;x++)set(x,y,t);},ent=(t,x,y,o={})=>K.ents.push({t,x,y,...o});
 D.masonry.push([0,399,0,63]);
 box(0,N-1,0,63,T.SOLID);box(1,399,24,58,T.AIR);
 K.siphons=[];K.blight=[];K.gasVents=[];
 const grate=(x,y,phase)=>K.gasVents.push({x,y,phase,period:3.4,hitT:0});
 K.pools.unshift({x0:0,x1:N*TS,y:23*TS,bottom:59*TS,depth:36*TS,swim:true,capped:true,clear:true,wash:.28,grad:false});
 // The bubbles are reliable resting places, not consumable charges.
 for(const x of [4,28,52,76,104,124,152,176,196,224,248,268,284,320,340,364,388]){K.airRooms.push([x,x+3,53,58]);D.pockets.push([x,x+3,53,58]);D.vents.push({x:x+1,y:58,h:7,hot:false,drain:false});}
 for(const x of [4,60,124,194,252,320,380])ent('check',x,58);
 const sign=(x,text,y=58)=>ent('sign',x,y,{text});
 sign(6,'THE DROWNED KEEP. THREE TIMES THE BREATH HERE. FOLLOW BUBBLES TO SAFE AIR.');
 /* EACH PLACE ITS OWN LIGHT: they were all one teal, so six rooms read as one long one */
 const sections=[['THE SUNKEN OUTER COURT',1,65,[80,160,170],.12],['THE COUNTERCURRENT',66,130,[60,110,190],.14],['THE FLOODED LIBRARY',131,195,[70,150,90],.14],['THE SLUICE WORKS',196,260,[170,120,70],.12],['THE THERMAL CISTERN',261,330,[200,110,60],.12],['THE BELL APPROACH',331,399,[120,100,180],.14]];
 sections.push(...buildKeepNarrows(K,T,N,ent));
 for(const [name,a,b,col,al]of sections){D.zones.push({name,x0:a,x1:b,y0:24,y1:58,col,a:al});K.interiors.push([a,b,24,58,'drowned']);D.noDress.push([a,b,24,58]);}
 // Broken columns make the first safe lesson in swimming over an obstacle.
 for(const x of [24,45]){box(x,x+3,48,58,T.SOLID);D.props.push({k:'statue',x:x+1,y:47,v:0});}
 sign(66,'THE LOW CURRENT PUSHES BACK. THE SLOT ABOVE HAS A SIPHON. PICK ONE.');
 D.currents.push({x0:70,x1:120,y0:47,y1:58,fx:-110,fy:0,kind:'stream'});
 box(72,124,24,40,T.SOLID);K.siphons.push({x:96,y:40});   /* the high road is a five-tile slot now, and it drinks */
 for(const x of [78,98,118]){box(x,x+2,46,58,T.SOLID);D.props.push({k:'coral',x:x+1,y:45,v:1});}
 sign(132,'THE FLOODED LIBRARY. SWIM HIGH, THEN LOW. THE HANGING STACK HAS A SIPHON UNDER IT.');
 K.siphons.push({x:168,y:44});grate(157,59,.3);   /* the low pass: under a drain, over a grate */
 for(const [x,top]of [[146,false],[167,true],[187,false]]){box(x,x+3,top?24:39,top?44:58,T.SOLID);const y=top?55:32;K.airRooms.push([x-5,x-2,y-2,y+1]);D.pockets.push([x-5,x-2,y-2,y+1]);}
 sign(198,'THE SLUICE WORKS. STRIKE THE WHEEL THREE TIMES. THE HIGH PASSAGE ALSO GOES THROUGH.');
 for(const x of [219,245]){box(x,x,36,58,T.PORT);D.gates.push({col:x,y0:36,y1:58,wheel:[x-5,58]});D.props.push({k:'brazier',x:x-8,y:58});}
 K.siphons.push({x:210,y:59});grate(242,59,1.5);   /* three blows on the wheel while a drain drinks you; a grate by the second */
 sign(262,'THE THERMAL CISTERN. RED VENTS LIFT YOU. CARRY BALLAST TO SINK; JUMP RELEASES IT.');
 for(const x of [267,307])ent('ballast',x,58,{kind:'stone'});
 for(const x of [275,295,315]){D.vents.push({x,y:58,h:9,hot:true,drain:false});D.currents.push({x0:x-5,x1:x+5,y0:27,y1:37,fx:45,fy:0,kind:'stream'});}
 grate(285,59,.6);grate(305,59,1.9);   /* between the lifts, poison: ride the heat or wait out the puff */
 D.clams.push({x:355,y:58});sign(352,'STRIKE THE CLAM TO RELEASE AIR.');
 sign(333,'THE BELL APPROACH. TAKE AIR BETWEEN THE JELLIES. THE FAR END NARROWS OVER DEAD WATER.');
 box(372,396,24,44,T.SOLID);K.blight.push([372,386,55,58]);K.siphons.push({x:380,y:44});   /* drawn up toward the roof's drain or down into the dead water */
 for(const [t,x,y]of [['eel',35,39],['angler',53,54],['manta',127,34],['puffer',110,52],['jelly',140,41],['eel',161,50],['angler',180,30],['merrowspear',210,58],['merrowcaller',239,58],['puffer',266,38],['manta',290,30],['eel',322,48],['jelly',344,38],['jelly',366,49],['merrowbrute',390,58]])ent(t,x,y,{face:-1});
 for(let x=12;x<399;x+=8){let y=51;while(y>26&&K.grid[y*K.W+x]!==T.AIR)y--;if(K.grid[y*K.W+x]===T.AIR)ent('coin',x,y);}
 for(const x of [16,64,92,134,202,258,332,376])D.props.push({k:'statue',x,y:58,v:x%2});
 for(const x of [12,56,127,136,200,256,332,360])D.shafts.push({x,y0:24,y1:58,w:4,lean:.1});
 /* A KELP BED IN THE LIBRARY, fish in the court and the stacks: the halls were stone and nothing else */
 for(const [x,h]of [[136,10],[141,13],[158,9],[163,12],[176,11],[181,8],[193,12]])D.kelp.push({x,y:58,h});
 D.fish.push({x:30,y:44,n:6,col:'#bfe6f5'},{x:172,y:40,n:7,col:'#ffd36b'},{x:300,y:44,n:5,col:'#ff9a5c'});
 // A single silver in each major third rather than three clustered in the old castle.
 K.ents=K.ents.filter(e=>e.t!=='silver');ent('silver',154,30);ent('silver',306,32);ent('silver',N+130,58);
 for(const e of K.ents)if(e.t==='bellguard'&&e.mini)e.vaultKeeper=true;
 ent('sign',N+80,58,{text:'THE VAULT KEEPER. SWIM OUT OF THE PRESSURE MARKS. GUARD HIS SPEAR. STRIKE AFTER THE BELL.'});
 for(const x of [N+84,N+94,N+104]){K.airRooms.push([x,x+2,52,58]);D.pockets.push([x,x+2,52,58]);D.vents.push({x:x+1,y:58,h:7,hot:false,drain:false});}
 /* THE DROWNED GARRISON MAY BE PUT IN THE WATER. Every standable spot in a flooded castle is a wet one, and the
    sprinkler will only put a swimmer in a wet spot - so the keep's own dead were the one roster it could not place. */
 K.swimGarrison=['wight','tideguard','watch','merrowspear','merrowbrute','merrowcaller'];   /* not the bellguard: his three are placed by hand and counted */
 K.keepSections=sections.map(([name,x0,x1])=>({name,x0,x1})).concat([{name:'THE INNER KEEP',x0:N,x1:N+199}]);
 return K;
}
