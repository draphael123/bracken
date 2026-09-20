import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try{
 const rows=await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out=[];
 for(const h of ['knight','warden','pyro','paladin','pirate','reaper']){
  for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='harbor'));BK.state='play';BK.god=false;BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const p=BK.P;
  for(const start of [566,935]){BK.tp(start-2,29);BK.sim(10);for(let step=0;step<5;step++){const target=(start+step*3+1)*16+8,row=step<4?28-step*2:22;BK.press('jump');BK.keys.jump=true;let air=false,land=false;for(let f=0;f<150;f++){BK.keys.right=p.x<target-2;BK.keys.left=p.x>target+2;BK.sim(1);if(!p.ground)air=true;if(air&&p.ground){land=true;break;}}for(const k in BK.keys)BK.keys[k]=false;if(!land||Math.abs(p.y-row*16)>1)throw Error(h+' step '+start+':'+step+' at '+p.x+','+p.y);BK.sim(3);}}
  if(p.dead)throw Error(h+' died');out.push({h,drydock:true,lighthouse:true});
 }return out;})()`);
 assert.equal(rows.length,6);assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(rows));
}finally{pg.close();}
