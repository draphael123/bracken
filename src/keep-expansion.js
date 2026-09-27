// A submerged approach to the original keep: currents, vertical galleries and sluice machinery - and, past the Bell
// Approach, THE NARROWS (src/keep-passages.js): siphons that drink your air, blighted water, poison grates, combined.
// REWORKED 2026-09-25 (docs/briefs/keep-rework-2.md): six sections, each with its own wall and a landmark (src/keep-looks.js);
// two DRY AIR HALLS you climb out into and fight across on foot (collapsing pillars, a failing floor, told rockfalls); the
// WHIRLPOOLS (src/whirlpools.js), each with the lever it shows you; THE DROWNED KNIGHTS (src/drowned-knights.js) placed where the
// ground makes them worse (rule S1); and THE KING'S DOOR, the exam before the throne (S3), held by THE DROWNED CAPTAIN. The
// Keeper of the Vault and the Leadfoot are gone (Daniel: "we don't need one", "the single scuba enemy").
import {buildKeepNarrows} from './keep-passages.js';
import {drownedKnight,drownedCaptain} from './drowned-knights.js';
export const KEEP_APPROACH=560;
/* THE TWO AIR HALLS, in tiles: the columns they take, the row their floor stands on (you walk on row FLOOR-1), the room's top */
export const KEEP_HALLS=[{name:'THE DRY CLOISTER',x0:187,x1:222,floor:44,top:31,room:'keepCloister'},{name:'THE GUARDROOM',x0:321,x1:350,floor:44,top:31,room:'keepGuard'}];
export function expandKeep(R,T,TS,crop){
 const N=KEEP_APPROACH,K=crop(R,-N,0,N+200,64,TS),D=K.deep;
 K.START={x:4,y:58};K.breathScale=3;K.keepExpansion=true;K.keepLook=true;delete K.mini;   /* no mini: THE DROWNED CAPTAIN is the gated elite (tools/elites.mjs) */
 const set=(x,y,t)=>{K.grid[y*K.W+x]=t;},box=(a,b,c,d,t)=>{for(let y=c;y<=d;y++)for(let x=a;x<=b;x++)set(x,y,t);},ent=(t,x,y,o={})=>K.ents.push({t,x,y,...o});
 D.masonry.push([0,399,0,63]);
 box(0,N-1,0,63,T.SOLID);box(1,399,24,58,T.AIR);
 K.siphons=[];K.blight=[];K.gasVents=[];K.whirlpools=[];K.crumbles=[];K.keepCrumbles=true;K.keepLandmarks=[];
 const grate=(x,y,phase)=>K.gasVents.push({x,y,phase,period:3.4,hitT:0});
 const whirl=(x,y,r,lx,ly)=>K.whirlpools.push({x,y,r,lever:[lx,ly]});
 const mark=(k,x,y,room)=>K.keepLandmarks.push({k,x,y,room});
 const pool=(a,b,y,capped)=>K.pools.push({x0:a*TS,x1:b*TS,y:y*TS,bottom:59*TS,depth:(59-y)*TS,swim:true,capped,clear:true,wash:.28,grad:false});
 /* THE WATER, in five reaches: the three swims, and under each air hall its own water with a SURFACE you climb out of */
 const H1=KEEP_HALLS[0],H2=KEEP_HALLS[1];
 pool(0,H1.x0,23,true);pool(H1.x0,H1.x1+1,H1.floor,false);pool(H1.x1+1,H2.x0,23,true);pool(H2.x0,H2.x1+1,H2.floor,false);pool(H2.x1+1,N,23,true);
 // The bubbles are reliable resting places, not consumable charges - and fewer of them than there were (S6: the meter squeezes)
 for(const [x,y]of [[4,58],[60,58],[124,58],[398,58]])ent('check',x,y);   /* and the two halls' (194, 326) and the exam's (634): S4, no two under forty route tiles apart */
 for(const x of [4,52,124,248,316,388]){K.airRooms.push([x,x+3,53,58]);D.pockets.push([x,x+3,53,58]);D.vents.push({x:x+1,y:58,h:7,hot:false,drain:false});}
 const sign=(x,text,y=58)=>ent('sign',x,y,{text});
 sign(6,'THE DROWNED KEEP. THREE TIMES THE BREATH HERE. FOLLOW BUBBLES TO SAFE AIR.');
 /* EACH PLACE ITS OWN LIGHT AND ITS OWN WALL: they were all one teal brick, so six rooms read as one long one */
 const sections=[['THE SUNKEN OUTER COURT',1,63,[80,160,170],.12,'keepCourt'],['THE COUNTERCURRENT',64,128,[60,130,90],.14,'keepCulvert'],['THE FLOODED LIBRARY',129,186,[150,120,80],.12,'keepLibrary'],
  ['THE SLUICE WORKS',223,270,[110,140,170],.12,'keepSluice'],['THE THERMAL CISTERN',271,320,[210,100,60],.14,'keepCistern'],['THE BELL APPROACH',351,399,[120,100,180],.14,'keepChapel']];
 for(const [name,a,b,col,al,room]of sections){D.zones.push({name,x0:a,x1:b,y0:24,y1:58,col,a:al});K.interiors.push([a,b,24,58,room]);D.noDress.push([a,b,24,58]);}

 // ---- 1. THE SUNKEN OUTER COURT (1-63). Swim, and the first knight, waiting past the column you swim over ----
 for(const x of [24,45]){box(x,x+3,48,58,T.SOLID);D.props.push({k:'statue',x:x+1,y:47,v:0});}
 mark('gatehouse',34,58,'keepCourt');
 K.ents.push(drownedKnight(52,47));   /* S1: the LANDING past the broken column - you come over its top and he is there */

 // ---- 2. THE COUNTERCURRENT (64-128). The low road pushes back, the high slot drinks; and the first WHIRLPOOL ----
 sign(66,'THE LOW CURRENT PUSHES BACK. THE SLOT ABOVE HAS A SIPHON. PICK ONE.');
 D.currents.push({x0:70,x1:120,y0:47,y1:58,fx:-110,fy:0,kind:'stream'});
 box(72,124,24,40,T.SOLID);K.siphons.push({x:96,y:40});   /* the high road is a five-tile slot, and it drinks */
 for(const x of [78,98,118]){box(x,x+2,46,58,T.SOLID);D.props.push({k:'coral',x:x+1,y:45,v:1});}
 /* THE TEACHING WHIRLPOOL: at the end of the low road, the current carrying you back into it. Its lever is in the lee of the
    coral you just passed, just outside its reach: you are in the pull, its niche lights up behind you, you go back and strike it */
 whirl(110,52,4,101,58);
 sign(102,'A WHIRLPOOL DRINKS YOUR AIR AND DRAGS YOU IN. ITS SLUICE LEVER STOPS IT.',58);
 mark('culvert',104,58,'keepCulvert');

 // ---- 3. THE FLOODED LIBRARY (129-186). High and low among the stacks; a whirlpool GUARDS the one air under the hanging stack ----
 sign(132,'THE FLOODED LIBRARY. SWIM HIGH, THEN LOW. THE AIR UNDER THE HANGING STACK IS GUARDED.');
 grate(150,59,.3);
 for(const [x,top]of [[146,false],[167,true],[178,false]]){box(x,x+3,top?24:39,top?44:58,T.SOLID);const y=top?55:32;K.airRooms.push([x-5,x-2,y-2,y+1]);D.pockets.push([x-5,x-2,y-2,y+1]);}
 whirl(160,55,5,153,58);   /* S1: beside the pocket under the hanging stack (162-165, rows 53-56): it drags you out of the air to its eye - breathe against the pull, or shut it first */
 mark('stack',154,58,'keepLibrary');

 // ---- 4. THE DRY CLOISTER (187-222), AIR HALL ONE. Up the shaft, out of the water, and a fight on your feet ----
 { const {x0,x1,floor,top}=H1;
   box(x0,x1,24,58,T.SOLID);
   box(x0,x0+4,50,58,T.AIR);box(x0+1,x0+4,floor,58,T.AIR);   /* the way in: under the library's wall and up a shaft to the surface */
   box(x0+1,x1-3,top,floor-1,T.AIR);                         /* the hall */
   box(199,209,floor,53,T.AIR);                              /* the cistern-pit in its floor, flooded */
   /* THE COLLAPSING PILLARS. Two broken columns stand out of the pit, two rows over the floor; step on one and it counts 3, 2, 1
      and goes down into the water with you on it. Gaps of 2, 3 and 2 tiles: the middle one can be missed (S2) */
   for(const x of [201,206]){box(x,x+1,floor-2,53,T.SOLID);K.crumbles.push({x0:x,x1:x+1,row:floor-2,rows:6,count:2.2,kind:'pillar'});}
   box(x1-6,x1-3,floor,58,T.AIR);box(x1-3,x1,50,58,T.AIR);    /* the way out: down a shaft, and out under the far wall */
   for(const x of [195,212])ent('rockfall',x,top,{every:2.8,tell:1.0,seen:true});   /* THE ROOF COMES DOWN: dust first, told, and only on screen */
   K.interiors.push([x0+1,x1-3,top,floor-1,H1.room]);D.zones.push({name:H1.name,x0:x0+1,x1:x1-3,y0:top,y1:floor-1,col:[200,150,90],a:.1});
   ent('check',194,floor-1);
   sign(192,'THE DRY CLOISTER. THE PILLARS WILL NOT HOLD YOU LONG. MIND THE ROOF.',floor-1);
   K.ents.push(drownedKnight(213,floor-1));   /* S1: at the landing past the pillars, on his feet - the lunge along the floor */
   ent('watch',198,floor-1,{face:1});   /* at the pit's edge: the first jump is taken with him at your back */
   ent('mend',215,floor-1);   /* S5: after the hall, earned - never before it */
   mark('arcade',205,floor-1,H1.room); }

 // ---- 5. THE SLUICE WORKS (223-270). Strike the wheel three times - with a knight on you while you do ----
 sign(224,'THE SLUICE WORKS. STRIKE THE WHEEL THREE TIMES. THE HIGH PASSAGE ALSO GOES THROUGH.');
 for(const x of [238,258]){box(x,x,36,58,T.PORT);D.gates.push({col:x,y0:36,y1:58,wheel:[x-5,58]});D.props.push({k:'brazier',x:x-8,y:58});}
 K.siphons.push({x:228,y:59});grate(255,59,1.5);   /* three blows on the wheel while a drain drinks you; a grate by the second */
 K.ents.push(drownedKnight(236,54));   /* S1: at the first wheel - you stand still to strike it three times, and he lunges */
 ent('check',262,58);   /* CLEAR OF THE GATE: a shrine is 20 px wide, and at 259 its left half stood in the second sluice gate's column (258, PORT from row 36): the picture ran 35 px through the portcullis (node tools/headless.mjs floats) */
 mark('wheel',247,58,'keepSluice');

 // ---- 6. THE THERMAL CISTERN (271-320). Ride the heat, carry the stone ----
 sign(272,'THE THERMAL CISTERN. RED VENTS LIFT YOU. CARRY BALLAST TO SINK; JUMP RELEASES IT.');
 for(const x of [275,312])ent('ballast',x,58,{kind:'stone'});
 for(const x of [280,295,310]){D.vents.push({x,y:58,h:9,hot:true,drain:false});D.currents.push({x0:x-5,x1:x+5,y0:27,y1:37,fx:45,fy:0,kind:'stream'});}
 grate(287,59,.6);grate(303,59,1.9);   /* between the lifts, poison: ride the heat or wait out the puff */
 mark('boiler',296,58,'keepCistern');

 // ---- 7. THE GUARDROOM (321-350), AIR HALL TWO. A failing floor over the pit, the roof coming in, and the garrison ----
 { const {x0,x1,floor,top}=H2;
   box(x0,x1,24,58,T.SOLID);
   box(x0,x0+4,50,58,T.AIR);box(x0+1,x0+4,floor,58,T.AIR);
   box(x0+1,x1-3,top,floor-1,T.AIR);
   box(333,340,floor+1,53,T.AIR);   /* the pit under the flagstones, flooded */
   /* THE FAILING FLOOR: its flagstones are cracked and dusting, and weight on them starts a short count - run it, don't stand on it */
   for(const a of [333,337])K.crumbles.push({x0:a,x1:a+3,row:floor,rows:1,count:1.3,kind:'floor'});
   box(x1-6,x1-3,floor,58,T.AIR);box(x1-3,x1,50,58,T.AIR);
   for(const x of [331,339])ent('rockfall',x,top,{every:2.5,tell:1.0,seen:true});
   K.interiors.push([x0+1,x1-3,top,floor-1,H2.room]);D.zones.push({name:H2.name,x0:x0+1,x1:x1-3,y0:top,y1:floor-1,col:[200,140,100],a:.1});
   ent('check',326,floor-1);
   sign(327,'THE GUARDROOM. THE FLAGSTONES ARE GOING. RUN THEM.',floor-1);
   K.ents.push(drownedKnight(342,floor-1));   /* S1: the blocker at the far end of the failing floor - you cannot stop on it to fight */
   ent('tideguard',331,floor-1,{face:1});
   ent('mend',343,floor-1);
   mark('chandelier',328,floor-1,H2.room); }

 // ---- 8. THE BELL APPROACH (351-399). A knight beside a whirlpool, then the narrows over dead water ----
 D.clams.push({x:368,y:58});sign(354,'STRIKE THE CLAM TO RELEASE AIR.');
 sign(352,'THE BELL APPROACH. HE WAITS BY THE WHIRLPOOL. THE FAR END NARROWS OVER DEAD WATER.');
 whirl(364,48,4,357,58);
 K.ents.push(drownedKnight(361,43));   /* S1: fight him at the edge of the pull and it drags you onto his point */
 box(372,396,24,44,T.SOLID);K.blight.push([372,386,55,58]);K.siphons.push({x:380,y:44});   /* drawn up toward the roof's drain or down into the dead water */
 mark('window',357,58,'keepChapel');   /* in the open water before the low slot, not behind its rock */

 sections.splice(3,0,[H1.name,H1.x0,H1.x1]);sections.splice(6,0,[H2.name,H2.x0,H2.x1]);
 const narrows=buildKeepNarrows(K,T,N,ent);sections.push(...narrows);
 for(const [name,a,b,col,al]of narrows){D.zones.push({name,x0:a,x1:b,y0:24,y1:58,col,a:al});K.interiors.push([a,b,24,58,'drowned']);D.noDress.push([a,b,24,58]);}
 for(const [t,x,y]of [['eel',35,39],['angler',55,54],['manta',127,34],['puffer',90,43],['jelly',140,41],['eel',150,47],['angler',180,30],['merrowspear',232,58],['merrowcaller',267,58],['puffer',276,38],['manta',290,30],['eel',317,40],['jelly',356,34],['jelly',380,50],['merrowbrute',390,58]])ent(t,x,y,{face:-1});
 for(let x=12;x<399;x+=8){let y=51;while(y>26&&K.grid[y*K.W+x]!==T.AIR)y--;if(K.grid[y*K.W+x]===T.AIR)ent('coin',x,y);}
 for(const x of [16,64,92,134,262,376])D.props.push({k:'statue',x,y:58,v:x%2});
 for(const x of [12,56,127,136,256,360])D.shafts.push({x,y0:24,y1:58,w:4,lean:.1});
 /* A KELP BED IN THE LIBRARY, fish in the court and the stacks: the halls were stone and nothing else */
 for(const [x,h]of [[136,10],[141,13],[158,9],[163,12],[172,11],[184,8]])D.kelp.push({x,y:58,h});
 D.fish.push({x:30,y:44,n:6,col:'#bfe6f5'},{x:172,y:40,n:7,col:'#ffd36b'},{x:300,y:44,n:5,col:'#ff9a5c'});
 /* THE CASTLE'S FURNITURE, drowned where it stood: every section its own (the review counted 2 decorations in 862 columns) */
 const deco=(kind,x,y=58,v=0)=>ent('deco',x,y,{kind,v});
 for(const [k,x,y,v]of [['brokenPillar',10],['stuckShield',19],['fallenBanner',30],['boneHeap',40],['brokenSpears',57,58,1],['shieldPile',61],   /* the court: the gate's defenders */
   ['anchor',68],['coiledCable',84],['boneHeap',104],['shellDrift',114],['seaChest',123],                                                     /* the culvert: what the moat washed in */
   ['bookpile',131],['lectern',137],['bookpile',144,58,1],['candelabra',153],['bookshelf',160],['bookpile',173],['lectern',185],               /* the library */
   ['candelabra',193,43],['stuckShield',196,43],['bookpile',210,43,1],                                                                        /* the cloister */
   ['capstan',226],['coiledCable',242],['anchor',250],['capstan',263],['brokenSpears',268,58,2],                                              /* the sluice works */
   ['tubeWorms',273],['glowCoral',283],['boneHeap',291],['tubeWorms',299],['glowCoral',307],['shellDrift',315],                               /* the cistern: warm water, and what grows in it */
   ['shieldPile',329,43],['fallenBanner',341,43],                                           /* the guardroom's arms */
   ['seaLily',353],['candelabra',359],['fallenBanner',366],['boneHeap',372],['shellDrift',394],                                               /* the chapel's */
   ['brokenPillar',628],['seaLily',636],['fallenBanner',646],['boneHeap',668],['brokenSpears',700,58,2],['glowCoral',706]])                     /* and the inner keep's */
   deco(k,x,y??58,v||0);
 // A single silver in each major third rather than three clustered in the old castle.
 K.ents=K.ents.filter(e=>e.t!=='silver');ent('silver',154,30);ent('silver',306,32);ent('silver',N+130,58);
 /* THE KING'S DOOR: THE EXAM (S3). The last stretch before the throne, in the Vault Keeper's old hall: a whirlpool across the
    low door with the only air between the two checkpoints in its pull, a knight in the water, and THE DROWNED CAPTAIN holding
    the door itself (his gate is the elite's, on the old mini's door column). A checkpoint before it and the one outside the
    arena, none inside it; no free heart in it (S5). */
 K.ents=K.ents.filter(e=>!(e.t==='check'&&(e.x===606||e.x===621||e.x===640||e.x===674)));
 /* NOT A CROWD (S1, S3): the old castle's inner guard stood nine deep between here and the throne. The exam keeps its own cast -
    the whirlpool, one knight, the captain, one angler in the hall and two of the King's men past the door - and the sprinkler
    leaves it alone (L.calm) */
 const EXAM_KEEP=new Set(['tideguard@684,47','wight@692,58','angler@661,42']),SETTLED=new Set(['check','sign','silver','coin','deco','gate','drownedking','sea','clam']);
 K.ents=K.ents.filter(e=>e.x<632||e.x>707||SETTLED.has(e.t)||EXAM_KEEP.has(e.t+'@'+e.x+','+e.y));
 K.calm=[...(K.calm||[]),[636,707,24,58],[199,209,36,44],[331,340,36,44]];   /* and nobody sprinkled onto the pillars or the failing floor: that stone is the problem, not a perch */
 ent('check',634,58);
 sign(636,'THE KING\'S DOOR. HIS CAPTAIN HOLDS IT. THE LAST AIR IS IN THE WHIRLPOOL: SHUT ITS SLUICE.');
 /* THE AIR IN THE HALL IS THE WHIRLPOOL'S (S6: the exam takes the meter to the edge): the old hall's pockets, vent and clams go, and
    the one pocket left is inside the pull - breathe in the drag, or shut the sluice under the captain's nose first */
 const inHall=x=>x>=636&&x<=668,boxIn=r=>inHall(r[0])||inHall(r[1]);
 K.airRooms=K.airRooms.filter(r=>!boxIn(r));D.pockets=D.pockets.filter(r=>!boxIn(r));D.vents=D.vents.filter(v=>!inHall(v.x));D.clams=D.clams.filter(c=>!inHall(c.x));
 K.airRooms.push([662,664,52,58]);D.pockets.push([662,664,52,58]);D.vents.push({x:663,y:58,h:7,hot:false,drain:false});
 whirl(659,55,5,646,58);   /* beside the hall's one pocket (662-664), not on it: it pulls you out of the air */
 K.ents.push(drownedKnight(650,42),drownedCaptain(660,58,{gate:669}));
 /* THE DROWNED GARRISON MAY BE PUT IN THE WATER. Every standable spot in a flooded castle is a wet one, and the
    sprinkler will only put a swimmer in a wet spot - so the keep's own dead were the one roster it could not place. */
 K.swimGarrison=['wight','tideguard','watch','merrowspear','merrowbrute','merrowcaller'];
 K.keepSections=sections.map(([name,x0,x1])=>({name,x0,x1})).concat([{name:'THE INNER KEEP',x0:N,x1:633},{name:'THE KING\'S DOOR',x0:634,x1:672},{name:'THE THRONE ROAD',x0:673,x1:N+199}]);
 return K;
}
