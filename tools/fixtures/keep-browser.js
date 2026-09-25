(async()=>{
 const {LEVELS,T}=await import('./src/level.js'),shots=[],rows=[];
 for(const id of ['deep','keep']){
  BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=true;BK.sim(300);
  if(id==='keep'){for(const [x,y,n]of[[620,58,'keep-ward'],[690,56,'keep-hall']]){BK.look(x,y);BK.sim(40);BK.step(0);shots.push({name:n,png:BK.view.buf.toDataURL()});}}
  /* THE KING'S DOOR (docs/briefs/keep-rework-2.md): no mini now. THE DROWNED CAPTAIN holds its door shut until he falls, and then it lifts */
  if(id==='keep'){if(BK.L.mini)throw Error('the Keep has a mini again');const cap=BK.enemies().find(e=>e.t==='drownedcaptain'&&e.elite);if(!cap)throw Error('no drowned captain');const G=cap.G;if(!G||BK.L.grid[G.bot*BK.L.W+G.col]!==T.PORT)throw Error('his door is not shut');BK.look(Math.round(cap.x/16)-3,Math.round(cap.y/16)-1);BK.sim(20);BK.step(0);shots.push({name:'keep-door',png:BK.view.buf.toDataURL()});BKT.hurtEnemy(cap,999999,cap.x-40,false);BK.sim(120);if(BK.L.grid[G.bot*BK.L.W+G.col]===T.PORT)throw Error('the captain fell and his door stayed shut');}
  const A=BK.L.arena;BK.look(A.trigger/16+2,A.floor/16-1);BK.sim(1800);const e=BK.boss;
  if(!BK.bossActive||!e?.alive)throw Error(id+' boss did not activate');
  BK.reset();BK.look(e.x/16-8,e.y/16-1);BK.sim(30);BK.step(0);shots.push({name:id+'-boss',png:BK.view.buf.toDataURL()});
  if(id==='deep'){for(const mode of ['clawTell','ballastTell','pressureTell','scuttleTell']){BK.reset();BK.look(e.x/16-5,e.y/16-1);e.mode=mode;e.modeT=.7;e.bellMark={x:BK.P.x,y:BK.P.y-10};BK.step(0);shots.push({name:mode,png:BK.view.buf.toDataURL()});BK.sim(300);rows.push({id,mode,after:e.mode,open:e.open});}}
  e.open=9;e.mode='vent';BKT.hurtEnemy(e,999999,e.x+80,false);BK.sim(60);if(e.alive||BK.bossActive)throw Error(id+' death gate failed');
  const exit=BK.L.ents.find(e=>e.t==='gate');BK.look(exit.x,exit.y);BK.sim(900);if(BK.state!=='win')throw Error(id+' exit did not finish '+BK.state);rows.push({id,boss:e.t,exit:BK.state});
 }
 const ctx=new AudioContext(),response=await fetch('./audio/underkeep.ogg'),a=await ctx.decodeAudioData(await response.arrayBuffer());await ctx.close();return{rows,audioSeconds:a.duration,shots};
})()
