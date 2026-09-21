(async()=>{
 const {LEVELS,T}=await import('./src/level.js'),results=[],shots=[];
 for(const [id,views] of [['harbor',[[118,29,'customs-hold'],[195,23,'salvage-cranes']]],['burial',[[162,33,'ossuary-shelves'],[235,41,'buried-bridge']]]]){
  const i=LEVELS.findIndex(l=>l.id===id);BK.load(i);BK.state='play';BK.god=true;BK.sim(300);
  for(const [x,y,name] of views){BK.reset();BK.look(x,y);BK.sim(25);BK.step(0);shots.push({name,png:BK.view.buf.toDataURL()});}
  BK.load(i);BK.state='play';BK.god=true;BK.sim(300);const M=BK.L.mini;let gateOpen=true;
  if(M){
  BK.look(M.trigger/16+2,M.floor/16-1);BK.sim(500);const e=BK.enemies().find(e=>e.mini&&e.t===M.boss);
  if(!BK.miniActive||!e?.alive)throw Error(id+' mini did not activate');
  if(BK.L.grid[(M.floor/16-1)*BK.L.W+M.gate]!==T.PORT)throw Error(id+' mini gate was not shut');
  e.open=9;e.guard=false;e.passThrough=true;BKT.hurtEnemy(e,99999,e.x+80,false);BK.sim(30);
  if(e.alive||BK.miniActive)throw Error(id+' mini did not clear');
  gateOpen=BK.L.grid[(M.floor/16-1)*BK.L.W+M.gate]!==T.PORT;if(!gateOpen)throw Error(id+' mini gate stayed shut');
  }else{if(id!=='burial'||BK.enemies().some(e=>e.mini))throw Error('unexpected missing mini');const A=BK.L.arena;BK.look(A.trigger/16+2,A.floor/16-1);BK.sim(300);const b=BK.boss;if(!BK.bossActive||b?.t!=='burieddead')throw Error('Buried Dead did not wake');b.mode='rest';BKT.hurtEnemy(b,99999,b.x+80,false);BK.sim(240);if(b.alive||BK.bossActive||BK.enemies().some(e=>e.graveAdd&&e.alive))throw Error('Buried Dead did not clear');gateOpen=BK.L.grid[31*BK.L.W+A.wallR]!==T.PORT;if(!gateOpen)throw Error('Buried Dead exit locked');}
  if(id==='harbor'){BK.look(1015,29);BK.sim(30);BK.P.dead=.01;BK.sim(30);if(Math.abs(BK.P.x-1015*16-8)>24)throw Error('harbor retry missed final checkpoint');if(BK.enemies().some(q=>q.salvage&&q.alive))throw Error('salvage captain returned after checkpoint retry');const A=BK.L.arena;BK.look(A.trigger/16+2,A.floor/16-1);BK.sim(500);const b=BK.boss;if(!BK.bossActive||b?.t!=='harbormaster')throw Error('warden did not wake');BKT.hurtEnemy(b,99999,b.x+80,false);BK.sim(240);if(b.alive||BK.bossActive)throw Error('warden did not clear');}
  const exit=BK.L.ents.find(e=>e.t==='gate');BK.look(exit.x,exit.y);BK.sim(60);if(BK.state!=='win')throw Error(id+' exit did not finish level '+BK.state);
  const response=await fetch('./audio/'+(id==='harbor'?'stormharbor':'burial')+'.ogg');const ctx=new AudioContext(),audio=await ctx.decodeAudioData(await response.arrayBuffer());await ctx.close();
  results.push({id,mini:M?.boss||null,gateOpen,exit:BK.state,audioSeconds:audio.duration});
  BK.press('confirm');BK.sim(60);BK.step(0);shots.push({name:id+'-map',png:BK.view.buf.toDataURL()});
 }
 return {results,shots};
})()
