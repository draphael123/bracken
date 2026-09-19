(async()=>{
 const {LEVELS,T}=await import('./src/level.js'),results=[],shots=[];
 for(const [id,views] of [['harbor',[[118,29,'customs-hold'],[195,23,'salvage-cranes']]],['burial',[[162,33,'ossuary-shelves'],[235,41,'buried-bridge']]]]){
  const i=LEVELS.findIndex(l=>l.id===id);BK.load(i);BK.state='play';BK.god=true;BK.sim(300);
  for(const [x,y,name] of views){BK.reset();BK.look(x,y);BK.sim(25);BK.step(0);shots.push({name,png:BK.view.buf.toDataURL()});}
  BK.load(i);BK.state='play';BK.god=true;BK.sim(300);const M=BK.L.mini;
  BK.look(M.trigger/16+2,M.floor/16-1);BK.sim(500);const e=BK.enemies().find(e=>e.mini&&e.t===M.boss);
  if(!BK.miniActive||!e?.alive)throw Error(id+' mini did not activate');
  if(BK.L.grid[(M.floor/16-1)*BK.L.W+M.gate]!==T.PORT)throw Error(id+' mini gate was not shut');
  e.open=9;e.guard=false;e.passThrough=true;BKT.hurtEnemy(e,99999,e.x+80,false);BK.sim(30);
  if(e.alive||BK.miniActive)throw Error(id+' mini did not clear');
  const gateOpen=BK.L.grid[(M.floor/16-1)*BK.L.W+M.gate]!==T.PORT;if(!gateOpen)throw Error(id+' mini gate stayed shut');
  const exit=BK.L.ents.find(e=>e.t==='gate');BK.look(exit.x,exit.y);BK.sim(60);if(BK.state!=='win')throw Error(id+' exit did not finish level '+BK.state);
  const response=await fetch('./audio/'+(id==='harbor'?'stormharbor':'burial')+'.wav');const ctx=new AudioContext(),audio=await ctx.decodeAudioData(await response.arrayBuffer());await ctx.close();
  results.push({id,mini:M.boss,gateOpen,exit:BK.state,audioSeconds:audio.duration});
  BK.press('confirm');BK.sim(60);BK.step(0);shots.push({name:id+'-map',png:BK.view.buf.toDataURL()});
 }
 return {results,shots};
})()
