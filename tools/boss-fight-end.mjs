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
 for(const kind of ['boss','mini','mini2']){const A0=kind==='boss'?b.arena:kind==='mini2'?b.mini2:b.mini;if(!A0)continue;/* (claude/forgemaster) mini2: a level's second mini - the first counts as down */
  if(kind==='mini2'){BKT.PROG[lv.id]=BKT.PROG[lv.id]||{};BKT.PROG[lv.id].mini=true;BKT.PROG[lv.id].mini2=false;}else if(kind==='mini'&&BKT.PROG[lv.id]){BKT.PROG[lv.id].mini=false;BKT.PROG[lv.id].mini2=false;}
  BK.setHero('knight');BK.reset({fresh:true});BK.load(i);BK.start();BK.god=true;BK.sim(10);BK.reset();
  const L=BK.L,A=kind==='boss'?L.arena:L.mini,live=()=>kind==='boss'?BK.bossActive:BK.miniActive;if(kind==='mini2'&&L.mini!==L.mini2){rows.push({lv:lv.id,kind,t:A0.boss,res:'NOT THE ROADS MINI'});continue;}
  const e=BK.enemies().find(q=>q.t===A.boss&&q.alive&&(kind==='boss'||q.mini||q.t==='greathound'));if(!e){rows.push({lv:lv.id,kind,t:A.boss,res:'NO BOSS'});continue;}
  for(const q of BK.enemies())if(q!==e&&!q.maxHp)q.alive=false;
  if(A.carpet){BK.board();BK.sim(30);}else{BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(200);}
  if(!live()&&e.alive){BKT.hurtEnemy(e,1,e.x-10,false);BK.sim(120);}
  const started=live();let n=0;
  for(;n<1000&&e.alive;n++){BK.P.inv=99;if(e.t==='king'&&e.stage!=='court'&&BK.gorm&&!(BK.gorm().persist||{}).runDone){BK.gorm().skipTo('glade');const G=BK.L.glade;BK.tp(Math.round(G.trigger/16)+1,Math.round(G.floor/16)-1);BK.sim(200);}/* (claude/gorm2) KING GORM's fight is two acts: his P1 bar spares him (the flee) - his fight ends in his glade */BK.P.hp=BK.P.maxHp;e.hp=Math.min(e.hp,1);e.inv=0;/* every boss's own opening, held open: a cage on the king, a pillar or a chandelier on the queen (her only opening since 2026-09-25: a wall's daze turns blades), the helm's ward down, a kraken arm's last cut, the Djinn sat in the mud under a pour (djOpen reads e.mode and e.open: it was never held open here, so he read as UNKILLABLE BY SCRIPT), the Hedge Warden burning at a brazier (the only stump a blow bites since claude/hedgewarden2), the Gate Gargoyle stunned on the spikes with a stomp's own e.stompNow (gargTake reads that, not the blow) */e.open=9;e.passThrough=true;if(e.t==='king')e.mode='held';if(e.t==='gqueen')e.mode='pinned';if(e.t==='gargoyle'){e.mode='stunned';e.stompNow=1e6;}if(e.t==='hedgewarden')e.burnT=9;if(e.t==='djinn')e.mode='mud';if(e.t==='cisternqueen'){e.mode='soaked';e.open=9;}if(e.t==='duneworm'&&e.st)e.st.mode='stunned';/* the Dune Worm stunned on a ledge: wormTake lands nothing otherwise (claude/caravan2's hide; batch83 integ: it read as UNKILLABLE BY SCRIPT) */BKT.hurtEnemy(e,1e6,e.x+(n%2?10:-10),n%3===0);if(e.t==='gargoyle')e.stompNow=0;if(e.alive)BK.sim(6);}
  if(e.alive){rows.push({lv:lv.id,kind,t:e.t,started,res:'UNKILLABLE BY SCRIPT'});continue;}
  let f=0;for(;f<300&&live();f++){BK.P.inv=99;BK.sim(1);}
  rows.push({lv:lv.id,kind,t:e.t,started,blows:n,res:live()?'FIGHT RUNS ON':'ended',frames:f});
  await new Promise(r=>setTimeout(r,0));}}
return rows;})()`, 3600000);
} finally { pg.close(); }
const bad = r.filter(x => x.res !== 'ended'), notStarted = r.filter(x => x.res === 'ended' && !x.started);
for (const x of r) if (x.res !== 'ended' || !x.started) console.log('  ' + x.lv.padEnd(13) + x.kind.padEnd(5) + x.t.padEnd(16) + x.res + (x.started ? '' : ' (the fight never started)'));
if (bad.length || notStarted.length) { console.log('BOSS-FIGHT-END: ' + (bad.length + notStarted.length) + ' of ' + r.length + ' fights do not end on the boss\'s death'); process.exit(1); }
console.log('Every one of ' + r.length + ' boss and mini fights (' + r.filter(x => x.kind === 'boss').length + ' bosses, ' + r.filter(x => x.kind !== 'boss').length + ' minis) ends when its boss dies.');
