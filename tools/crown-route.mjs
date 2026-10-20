// tools/crown-route.mjs - THE WOOD'S CACHE SILVER IS WITHIN EVERY HERO'S REACH (claude/batch105 integ).
// The old route (the Hornet Crown cache: four hops up a tree) went with the old wood; THE LUMBER TRAIL's cache is the FORD VINE POCKET (src/lumber-trail.js:
// a vine swings up to a deck in the canopy, a silver on it - the level's VAULT_SILVER). A swinging vine is timing, not a route a script can hop, so the check is
// the geometry: from the ground the vine's low point is within one jump of every hero, and from its high point the deck is within one jump and the vine's reach
// overlaps the deck's edge - and the silver sits on that deck, on a hero's feet row. (The pocket is optional: nobody is walked there by the guide.)
import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';
const pg=await openPage({audio:false,fonts:false});try{
 const rows=await pg.evalp(`(()=>{BK.manualSimulation=true;BK.SET.speed=1;const rows=[];
 for(const h of ['knight','warden','pyro','paladin','pirate','reaper']){
  for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BK.load(0);BK.state='play';BK.god=true;BK.ambushes().forEach(a=>a.st='done');BK.enemies().forEach(e=>e.alive=false);
  const sv=BK.L.ents.find(e=>e.t==='silver'&&e.x>=196&&e.x<=202&&e.y<=10);if(!sv)throw Error('the wood has no silver in the ford vine pocket');
  const p=BK.P,m=BK.movers().find(q=>q.kind==='swing'&&Math.abs(q.px-192*16-8)<4);if(!m)throw Error('the ford vine is not there');
  BK.tp(186,16);BK.sim(30);const ground=p.y;BK.keys.jump=true;BK.press('jump');let top=p.y;for(let f=0;f<60;f++){BK.sim(1);top=Math.min(top,p.y);}BK.keys.jump=false;const rise=ground-top;
  let lo=-1e9,hi=1e9,right=-1e9;for(let f=0;f<400;f++){BK.sim(1);lo=Math.max(lo,m.y);hi=Math.min(hi,m.y);right=Math.max(right,m.x+m.w);}
  const deckTop=(sv.y+1)*16,deckX=196*16;
  if(rise<ground-lo)throw Error(h+' can not jump onto the vine at its low point: rises '+rise+', needs '+(ground-lo));
  if(rise<hi-deckTop)throw Error(h+' can not step from the vine at its high point to the deck: rises '+rise+', needs '+(hi-deckTop));
  if(right<deckX)throw Error(h+': the vine does not swing up to the deck ('+right+' < '+deckX+')');
  rows.push({h,rise:Math.round(rise),lowNeeds:Math.round(ground-lo),highNeeds:Math.round(hi-deckTop)});
 }
 BK.step(0);return rows;})()`);assert.equal(rows.length,6);assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(rows));
}finally{pg.close();}
