// tools/boss-fight-end.mjs — EVERY BOSS'S DEATH ENDS ITS FIGHT. For every level with an arena (and every level with a mini), in
// the page: start the fight the way the boss lab does, cut the boss down through the game's own hurtEnemy, and require that the
// fight is OVER within five seconds - bossActive (or miniActive) false. A boss whose death leaves the fight running keeps the walls
// shut, the boss music up, the loadout locked and a level-up's heal owed forever (THE FALSE ABBOT did, 2026-09-24: he was missing
// from a hand-written list in hurtEnemy0, and that list is now a rule - any boss of the fight ends it). A boss this cannot put down
// with a thousand scripted blows is reported as UNKILLABLE BY SCRIPT, which is a hole in this check, not a pass.
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const rows=[];
for(const [i,lv] of LEVELS.entries()){let b;try{b=lv.build();}catch{continue;}
 for(const kind of ['boss','mini']){const A0=kind==='boss'?b.arena:b.mini;if(!A0)continue;
  BK.setHero('knight');BK.reset({fresh:true});BK.load(i);BK.start();BK.god=true;BK.sim(10);BK.reset();
  const L=BK.L,A=kind==='boss'?L.arena:L.mini,live=()=>kind==='boss'?BK.bossActive:BK.miniActive;
  const e=BK.enemies().find(q=>q.t===A.boss&&q.alive&&(kind==='boss'||q.mini||q.t==='greathound'));if(!e){rows.push({lv:lv.id,kind,t:A.boss,res:'NO BOSS'});continue;}
  for(const q of BK.enemies())if(q!==e&&!q.maxHp)q.alive=false;
  if(A.carpet){BK.board();BK.sim(30);}else{BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(200);}
  if(!live()&&e.alive){BKT.hurtEnemy(e,1,e.x-10,false);BK.sim(120);}
  const started=live();let n=0;
  for(;n<1000&&e.alive;n++){BK.P.inv=99;BK.P.hp=BK.P.maxHp;e.hp=Math.min(e.hp,1);e.inv=0;/* every boss's own opening, held open: a cage on the king, a pillar or a chandelier on the queen (her only opening since 2026-09-25: a wall's daze turns blades), the helm's ward down, a kraken arm's last cut */e.open=9;e.passThrough=true;if(e.t==='king')e.mode='held';if(e.t==='gqueen')e.mode='pinned';BKT.hurtEnemy(e,1e6,e.x+(n%2?10:-10),n%3===0);if(e.alive)BK.sim(6);}
  if(e.alive){rows.push({lv:lv.id,kind,t:e.t,started,res:'UNKILLABLE BY SCRIPT'});continue;}
  let f=0;for(;f<300&&live();f++){BK.P.inv=99;BK.sim(1);}
  rows.push({lv:lv.id,kind,t:e.t,started,blows:n,res:live()?'FIGHT RUNS ON':'ended',frames:f});
  await new Promise(r=>setTimeout(r,0));}}
return rows;})()`, 3600000);
} finally { pg.close(); }
const bad = r.filter(x => x.res !== 'ended'), notStarted = r.filter(x => x.res === 'ended' && !x.started);
for (const x of r) if (x.res !== 'ended' || !x.started) console.log('  ' + x.lv.padEnd(13) + x.kind.padEnd(5) + x.t.padEnd(16) + x.res + (x.started ? '' : ' (the fight never started)'));
if (bad.length || notStarted.length) { console.log('BOSS-FIGHT-END: ' + (bad.length + notStarted.length) + ' of ' + r.length + ' fights do not end on the boss\'s death'); process.exit(1); }
console.log('Every one of ' + r.length + ' boss and mini fights (' + r.filter(x => x.kind === 'boss').length + ' bosses, ' + r.filter(x => x.kind === 'mini').length + ' minis) ends when its boss dies.');
