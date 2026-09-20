import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';import{writeFileSync}from'node:fs';
const pg=await openPage({audio:false,fonts:false});try{
 const rows=await pg.evalp(`(()=>{BK.manualSimulation=true;BK.SET.speed=1;BK.SET.zoom='wide';const rows=[];
 for(const h of ['knight','warden','pyro','paladin','pirate','reaper']){
  for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BK.load(0);BK.state='play';BK.god=false;BK.ambushes().forEach(a=>a.st='done');BK.enemies().forEach(e=>e.alive=false);
  const r=BK.L.ents.find(e=>e.t==='relic'&&e.kind==='crown'),p=BK.P;BK.tp(r.x-8,11);BK.sim(30);const landings=[];
  const hop=(x,row)=>{BK.keys.jump=true;BK.press('jump');let airborne=false;for(let f=0;f<120;f++){BK.keys.right=p.x<x-2;BK.keys.left=p.x>x+2;BK.sim(1);if(!p.ground)airborne=true;if(airborne&&p.ground){BK.keys.left=BK.keys.right=BK.keys.jump=false;BK.sim(3);landings.push({x:p.x,y:p.y});if(Math.abs(p.y-row*16)>1)throw Error(h+' landed at '+p.x+','+p.y+' expected row '+row);return;}}throw Error(h+' jump did not land');};
  hop((r.x-5)*16+8,10);hop((r.x-2.5)*16,8);hop((r.x-4.5)*16,6);hop((r.x-1.5)*16,5);
  for(let f=0;f<60;f++){BK.keys.right=p.x<r.x*16+8;BK.sim(1);}BK.keys.right=false;
  const crown=BK.props().find(q=>q.t==='relic'&&q.kind==='crown');if(!crown?.got)throw Error(h+' did not collect crown');if(p.dead)throw Error(h+' died');rows.push({h,landings,collected:true});
 }
 BK.step(0);return rows;})()`);assert.equal(rows.length,6);assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(rows));
 if(process.env.CROWN_SCREEN){await pg.evalp(`BK.setHero('knight');BK.load(0);BK.state='play';BK.god=false;BK.ambushes().forEach(a=>a.st='done');BK.enemies().forEach(e=>e.alive=false);BK.tp(313,9);BK.sim(240);BK.step(0)`);const d=await pg.evalp(`document.querySelector('canvas').toDataURL('image/png')`);writeFileSync(process.env.CROWN_SCREEN,Buffer.from(d.split(',')[1],'base64'));}
}finally{pg.close();}
