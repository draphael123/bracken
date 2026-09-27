/* tools/burial2-keys.mjs — THE WHOLE ROAD WITH REAL KEYS, NO GOD MODE (claude/burial2, 2026-09-26; the lesson of THE DEEP, which shipped a
   softlock the reach model missed). Not a bot: a script of what a player presses, start to the lair's door, for every hero - hold right,
   jump at each pit's edge, drop down the rotten floors, walk gallery two west, swim the black water, climb onto the east pier, drop into
   the Keeper's vault (he is struck down by the harness: his fight is boss-openings' and mini-walls' business), climb the shaft's chain,
   walk the rotten boards and jump the exam's pits to the arena. The dead are cleared first (this is the ground, not the fight).
   Then THE WAY OUT OF EVERY PIT: dropped into each pool of green water, and the black water, a hero holding toward the near bank and
   jumping gets out onto dry floor. Fails on any stretch a hero cannot pass. */
import assert from 'node:assert/strict'; import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const pg = await openPage({ audio: false, fonts: false }); try {
 const r = await pg.evalp(`(async()=>{const{LEVELS,T}=await import('/src/level.js');const{DESCENT}=await import('/src/burial-caverns.js');BK.manualSimulation=true;BK.SET.speed=1;
 const idx=LEVELS.findIndex(l=>l.id==='burial'),TS=16,out={walk:[],escape:[]};
 const boot=h=>{BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=false;BK.sim(2);for(const e of BK.enemies())if(e!==BK.boss&&!e.mini)e.alive=false;return BK.L;};
 for(const h of ${JSON.stringify(heroes)}){const L=boot(h),P=BK.P,K=BK.keys,at=(x,y)=>L.grid[y*L.W+x],A=L.arena;let f=0,stage='road',log=[];
  const pits=L.pools.filter(p=>p.harm).map(p=>({a:p.x0/TS,b:p.x1/TS-1,row:p.y/TS-2})).filter(q=>q.b-q.a===2);
  const edgeAhead=dir=>pits.find(q=>Math.abs(P.y/TS-(q.row+1))<0.6&&(dir>0?(P.x/TS>=q.a-1+0.72&&P.x/TS<q.a):(P.x/TS<=q.b+1+0.28&&P.x/TS>q.b+1)));
  const clear=()=>{for(const e of BK.enemies())if(e!==BK.boss&&e.alive&&!e.mini&&!(e.dying>0)&&Math.abs(e.x-P.x)<300)BKT.hurtEnemy(e,99999,e.x-10,false);};   /* struck down, not deleted: the Charnel House opens when its captain DIES */
  const keep={x:P.x,t:0};let hold=0;
  for(f=0;f<60*420&&!P.dead;f++){clear();P.hp=Math.max(P.hp,P.maxHp*0.5);   /* no god mode: blows still land, a death is still a death; this only keeps the gas and the poison from ending a traversal test */
   for(const k in K)K[k]=false;const tx=P.x/TS,ty=P.y/TS;let dir=1;
   if(tx<DESCENT.hole[0]&&ty<23)dir=1;                                                  /* the road, east to the rotten floor */
   else if(ty>=24&&ty<=DESCENT.g[0]&&tx<DESCENT.drop[1]+1)dir=1;                          /* gallery one, east to its drop */
   else if(ty>DESCENT.g[0]&&ty<=DESCENT.g[1]+3&&tx<=DESCENT.hall[1]+1)dir=-1;                                    /* gallery two, west to the rotten floor */
   else if(ty>DESCENT.g[1]+3&&tx<DESCENT.shaft[0]){dir=1;if(tx>DESCENT.piers[1][0]-3&&ty>DESCENT.pier+0.5&&ty<DESCENT.oss[3]){K.up=true;K.jump=f%17<9;if(f%17===0)BK.press('jump');}   /* at the east pier's face: up and jump, the way you climb out of water anywhere */else if(P.swim)K.jump=f%40<6;}   /* the black water, the pier, the vault */
   else if(tx>=DESCENT.shaft[0]-1&&tx<=DESCENT.shaft[1]+1&&ty>22){K.up=true;dir=P.x<DESCENT.shaft[1]*TS+8?1:0;} /* the chain up */
   else dir=1;
   if(dir>0)K.right=true;else if(dir<0)K.left=true;
   if(edgeAhead(dir)&&P.ground){BK.press('jump');hold=26;}   /* a jump is HELD: a tap is a hop, and a hop lands in the water */
   if(K.jump&&P.ground&&!edgeAhead(dir)&&!P.swim){}
   const kp=L.mini&&BK.enemies().find(e=>e.mini&&e.alive);if(kp&&P.x>L.mini.x0+4*TS&&P.y>L.mini.y0)BKT.hurtEnemy(kp,99999,kp.x-20,false);
   /* a wall in front with no pit: hop it (the pier's lip, the vault's step, a board end) */
   if(P.ground&&dir&&!P.swim){const ax=Math.floor((P.x+dir*9)/TS),ay=Math.floor((P.y-4)/TS);if(at(ax,ay)===T.SOLID&&(at(ax,ay-1)!==T.SOLID||at(ax,ay-2)!==T.SOLID)){BK.press('jump');hold=20;}}
   if(hold>0){K.jump=true;hold--;}
   BK.sim(1);if(f%30===0){log.push((P.x/TS).toFixed(1)+","+(P.y/TS).toFixed(1)+(P.swim?"s":"")+(P.ground?"g":"")+(K.jump?"J":"")+(K.up?"U":"")+(K.right?"R":"")+(P.climb?"c":"")+(P.onMover?"m":"")+" vy"+Math.round(P.vy||0));if(log.length>14)log.shift();}if(Math.abs(P.x-keep.x)>24){keep.x=P.x;keep.t=f;}if(f-keep.t>60*25&&!(P.climb))break;   /* (a climb is progress too) */
   if(P.x>=A.trigger){stage='door';break;}}
  out.walk.push({h,reached:stage==='door',secs:+(f/60).toFixed(1),at:[+(P.x/TS).toFixed(1),+(P.y/TS).toFixed(1)],dead:!!P.dead,deaths:BK.stats().deaths,trace:stage==="door"?undefined:log});}
 /* THE WAY OUT OF EVERY PIT */
 {const L=boot('knight');for(const p of L.pools){const a=p.x0/TS,b=p.x1/TS-1,mid=(p.x0+p.x1)/2,dir=(mid-p.x0<p.x1-mid)?-1:1;BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=false;BK.sim(2);for(const e of BK.enemies())e.alive=false;
   const P=BK.P,K=BK.keys;P.x=dir<0?p.x0+10:p.x1-10;P.y=p.y+20;P.vx=P.vy=0;let outF=null;
   for(let f=0;f<60*12;f++){P.hp=P.maxHp;for(const k in K)K[k]=false;K[dir<0?'left':'right']=true;K.up=true;if(f%24<10)K.jump=true;if(f%24===0)BK.press('jump');BK.sim(1);if(P.ground&&!P.swim&&P.y<=p.y-2&&(P.x<p.x0||P.x>p.x1)){outF=f;break;}}
   out.escape.push({x:a,w:b-a+1,harm:!!p.harm,out:outF===null?null:+(outF/60).toFixed(1)});}}
 return out;})()`, 2400000);
 console.log(JSON.stringify(r));
 for (const w of r.walk) assert(w.reached, w.h + ' could not walk the road to the lair with real keys: stopped at ' + w.at + ' after ' + w.secs + ' s ' + JSON.stringify(w));
 for (const e of r.escape) assert(e.out !== null, 'a hero in the water at column ' + e.x + ' (' + e.w + ' wide) cannot get out: a softlock');
 assert.deepEqual(pg.errors, []);
 console.log('burial2-keys  ' + r.walk.length + ' heroes walked the road to the lair with real keys (' + r.walk.map(w => w.h + ' ' + w.secs + ' s').join(', ') + '); every one of ' + r.escape.length + ' pools can be climbed out of');
} finally { pg.close(); }
