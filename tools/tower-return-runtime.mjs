import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';
const pg=await openPage({audio:false,fonts:false});try{
 const r=await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const rows=[];
 for(const h of ['knight','warden','pyro','paladin','pirate','reaper']){BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;for(const e of BK.enemies())e.alive=false;const p=BK.P,clear=()=>{for(const k in BK.keys)BK.keys[k]=false;};
  const leftTo=(x,limit=500)=>{for(let f=0;f<limit&&p.x>x*16+8;f++){BK.keys.left=true;BK.keys.jump=true;if(p.ground&&f%35===0)BK.press('jump');BK.sim(1);}clear();if(p.x>x*16+10)throw Error(h+' blocked at '+p.x/16+' toward '+x);};
  BK.tp(614,15);BK.sim(5);leftTo(601);const stair=p.x;
  BK.tp(505,15);BK.sim(5);leftTo(430,1200);BK.sim(160);if(p.y<38*16)throw Error(h+' orrery descent '+p.y);
  BK.tp(160,39);BK.sim(5);leftTo(121,700);
  BK.tp(621,15);BK.sim(180);if(!BK.L.deckBreaks.find(z=>z.x0===619).down)throw Error('floor not broken');for(let f=0;f<400;f++){BK.keys.left=p.x>617*16+8;BK.keys.right=p.x<617*16+4;BK.keys.up=true;BK.sim(1);if(p.y<=16*16)break;}clear();if(p.y>16*16+1)throw Error(h+' lower gallery escape '+p.y);rows.push({h,reverseStairs:true,orreryDescent:true,libraryReturn:true,collapseEscape:true});}
 BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.look(258,39);BK.sim(180);const f=BK.enemies().find(e=>e.t==='familiar');f.open=5;BKT.hurtEnemy(f,999999,f.x-50,false);BK.sim(100);BK.look(113,39);BK.sim(10);BK.look(92,39);BK.sim(180);const boss=BK.boss;boss.hp=boss.hp0*.75;boss.mode='rest';BK.sim(300);if(!BK.L.towerSlabs.some(z=>z.down))throw Error('retry setup did not collapse');BK.P.dead=1;BK.sim(240);if(BK.P.dead||BK.L.towerSlabs.some(z=>z.down)||BK.boss.stage!==0)throw Error('retry failed to restore slabs');if(BK.enemies().some(e=>e.alive&&e.t==='familiar'))throw Error('retry restored completed Familiar');for(let x=13;x<99;x++)if(BK.L.grid[40*BK.L.W+x]!==1)throw Error('retry platform missing');
 return rows;})()`);assert.equal(r.length,6);assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(r));
}finally{pg.close();}
