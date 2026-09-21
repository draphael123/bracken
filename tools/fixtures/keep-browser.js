(async()=>{
 const {LEVELS,T}=await import('./src/level.js'),shots=[],rows=[];
 for(const id of ['deep','keep']){
  BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=true;BK.sim(300);
  if(id==='keep'){for(const [x,y,n]of[[620,58,'keep-ward'],[690,56,'keep-hall']]){BK.look(x,y);BK.sim(40);BK.step(0);shots.push({name:n,png:BK.view.buf.toDataURL()});}}
  if(id==='keep'){const M=BK.L.mini;BK.look(M.trigger/16+2,M.floor/16-1);BK.sim(500);const mini=BK.enemies().find(e=>e.mini&&e.t==='bellguard');if(!BK.miniActive||!mini)throw Error('Keep mini failed to wake');for(const mode of ['vaultSpearTell','vaultRingTell','vaultPressureTell','vaultBandTell']){mini.mode=mode;mini.modeT=1;mini.aimX=BK.P.x;mini.aimY=BK.P.y-10;BK.step(0);shots.push({name:mode,png:BK.view.buf.toDataURL()});}BKT.hurtEnemy(mini,999999,mini.x+40,false);BK.sim(90);if(mini.alive||BK.miniActive)throw Error('Keep mini stayed active');if(BK.L.grid[58*BK.L.W+M.gate]===T.PORT)throw Error('Keep gate stayed shut');BK.respawnEnemies();if(BK.enemies().some(e=>e.vaultKeeper&&e.alive))throw Error('defeated Keeper returned on retry');rows.push({id,mini:mini.t,defeated:true,retry:true});}
  const A=BK.L.arena;BK.look(A.trigger/16+2,A.floor/16-1);BK.sim(1800);const e=BK.boss;
  if(!BK.bossActive||!e?.alive)throw Error(id+' boss did not activate');
  BK.reset();BK.look(e.x/16-8,e.y/16-1);BK.sim(30);BK.step(0);shots.push({name:id+'-boss',png:BK.view.buf.toDataURL()});
  if(id==='deep'){for(const mode of ['clawTell','ballastTell','pressureTell','scuttleTell']){BK.reset();BK.look(e.x/16-5,e.y/16-1);e.mode=mode;e.modeT=.7;e.bellMark={x:BK.P.x,y:BK.P.y-10};BK.step(0);shots.push({name:mode,png:BK.view.buf.toDataURL()});BK.sim(300);rows.push({id,mode,after:e.mode,open:e.open});}}
  e.open=9;e.mode='vent';BKT.hurtEnemy(e,999999,e.x+80,false);BK.sim(60);if(e.alive||BK.bossActive)throw Error(id+' death gate failed');
  const exit=BK.L.ents.find(e=>e.t==='gate');BK.look(exit.x,exit.y);BK.sim(900);if(BK.state!=='win')throw Error(id+' exit did not finish '+BK.state);rows.push({id,boss:e.t,exit:BK.state});
 }
 const ctx=new AudioContext(),response=await fetch('./audio/underkeep.ogg'),a=await ctx.decodeAudioData(await response.arrayBuffer());await ctx.close();return{rows,audioSeconds:a.duration,shots};
})()
