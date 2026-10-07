// tools/skyroad-probe.mjs - THE SKY ROAD in the page, quickly (claude/skyroad, the greybox). A smoke test of the rule and its machines, not a playtest:
//   ?level=skyroad lands at its entrance in play (no god mode); a thermal lifts a hero standing in it to its top; a cloud's shadow kills a thermal and the
//   sun brings it back; the cloak is taken at its mast and a held jump glides (no cloak, no glide); a dead stone thermal lifts nobody until its stone is
//   struck, then it does; the reel's cage rides up only while its chimney is hot; the disc wakes its road one thermal after another and it dies after
//   DISC.live; a fall into the cloud sea costs health and hands you back to solid footing; a harpy's dive that lands takes you (and lets go); a blow on a
//   flying kite-rider cuts his line; four cloths open the riders' loft; THE ROC wakes on her eyrie, a thermal plunge on her back knocks her down (open,
//   3 s or more, a blow there lands harder than the twentieth outside it), and after it her feathers are up (no second plunge opens her).
//   node tools/skyroad-probe.mjs        (PORT=<your port>)
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=skyroad&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.skyroad&&location.search.includes("skyroad")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor(BK.P.y/16)],start:[BK.L.START.x,BK.L.START.y],god:!!BK.god}:null', 4000).catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=skyroad lands in play at its entrance, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='skyroad');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
  const S=()=>BK.skyroad(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);BK.sim(4);};
  for(const e of BK.enemies())if(e.t!=='roc')e.alive=false;
  const th=x=>BK.props().find(p=>p.t==='vent'&&p.thermal&&Math.floor(p.x/16)===x);
  /* THERMAL ONE: stand in it, rise to its top */
  tp(34,51);let top=99;for(let i=0;i<360;i++){BK.sim(1);top=Math.min(top,P.y/16);}out.rise={top:+top.toFixed(1),k:th(34).k};
  /* A CLOUD: thermal two under its bank - find a shaded moment and a sunny one */
  tp(67,49);let shaded=0,lit=0,lifted=0;for(let i=0;i<60*20;i++){BK.sim(1);const t=th(67);if(t.shade==='cloud'&&t.k<0.1)shaded++;if(!t.shade&&t.k>0.9)lit++;}out.cloud={shaded,lit};
  /* THE CLOAK: none before the mast; a held jump off mesa B glides */
  const fall=()=>{let vmax=0;tp(103,33);BK.keys.right=true;BK.press('jump');BK.keys.jump=true;for(let i=0;i<70;i++){BK.sim(1);if(i>30)vmax=Math.max(vmax,P.vy);}BK.keys.right=false;BK.keys.jump=false;return Math.round(vmax);};
  out.noCloak=S().read().cloak;tp(90,33);out.noGlideV=null;
  tp(97,33);BK.sim(3);out.cloak=S().read().cloak;out.glideV=fall();
  /* A STONE: thermal four is dead until s1 is struck */
  tp(131,40);for(let i=0;i<60;i++)BK.sim(1);out.deadStone={k:th(131).k,vy:Math.round(P.vy)};
  tp(119,37);P.face=1;BK.press('atk');BK.sim(30);out.s1=S().stone('s1').on;tp(131,45);let t4=99;for(let i=0;i<420;i++){BK.sim(1);t4=Math.min(t4,P.y/16);}out.liveStone={k:+th(131).k.toFixed(2),top:+t4.toFixed(1)};
  /* THE REEL: the cage stays down with the stone face down, and rides up hot */
  const cage=BK.movers().find(m=>m.sky==='reel');const y0=cage.y;tp(140,25);for(let i=0;i<120;i++)BK.sim(1);out.reelCold=Math.round(cage.y-y0);
  S().setStone('s2',true);let minY=cage.y;for(let i=0;i<60*12;i++){BK.sim(1);minY=Math.min(minY,cage.y);}out.reelHot=Math.round(minY-y0);
  /* THE DISC */
  const clouds=BK.L.clouds;BK.L.clouds=[];tp(294,17);P.face=1;BK.press('atk');BK.sim(10);const road=[303,310,317,324].map(x=>th(x));out.discAt=S().read().disc;
  const wake=[];for(let i=0;i<180;i++){BK.sim(1);road.forEach((t,j)=>{if(t.k>0.3&&wake[j]===undefined)wake[j]=i;});}out.wake=wake;
  for(let i=0;i<60*20;i++)BK.sim(1);out.discDead=road.map(t=>+t.k.toFixed(2));BK.L.clouds=clouds;
  /* THE CLOUD SEA */
  BK.god=false;P.hp=P.maxHp;tp(272,17);BK.sim(20);const hp0=P.hp;tp(330,50);for(let i=0;i<120;i++)BK.sim(1);out.sea={lost:hp0-P.hp,at:[Math.round(P.x/16),Math.round(P.y/16)],catches:S().read().n.catches};BK.god=true;P.hp=P.maxHp;
  /* THE LOFT */
  for(const pr of BK.props().filter(p=>p.t==='stray'&&!p.got)){P.x=pr.x;P.y=pr.y;BK.sim(3);}tp(367,10);BK.press('talk');BK.sim(5);out.loft={open:S().read().loft,cell:BK.L.grid[8*BK.L.W+365]};
  return out;})()`, 300000);
  ok(r.rise.top < 38.5, 'thermal one lifts a hero to its top ' + JSON.stringify(r.rise));
  ok(r.cloud.shaded > 30 && r.cloud.lit > 30, 'a cloud on thermal two kills it, and the sun brings it back ' + JSON.stringify(r.cloud));
  ok(!r.noCloak && r.cloak && r.glideV <= 45, 'the cloak is taken at its mast, and a held jump glides (fall speed held at the glide) ' + JSON.stringify({ cloak: r.cloak, v: r.glideV }));
  ok(r.deadStone.k < 0.05 && r.deadStone.vy > 0 && r.s1 && r.liveStone.k > 0.5 && r.liveStone.top < 30, 'a stone thermal is dead until its stone is struck, then it lifts ' + JSON.stringify([r.deadStone, r.s1, r.liveStone]));
  ok(r.reelCold === 0 && r.reelHot < -150, 'the reel\'s cage stays down cold and rides up the cliff while the flue is hot ' + JSON.stringify([r.reelCold, r.reelHot]));
  ok(r.wake.length === 4 && r.wake.every((w, i) => !i || w > r.wake[i - 1]) && r.discDead.every(k => k < 0.05), 'the disc wakes its road one thermal after another (clouds held off), and the road dies when the sun moves off it ' + JSON.stringify([r.wake, r.discDead]));
  ok(r.sea.lost > 0 && r.sea.catches >= 1 && r.sea.at[1] < 30, 'a fall into the cloud sea costs health and hands you back to solid footing ' + JSON.stringify(r.sea));
  ok(r.loft.open && r.loft.cell === 0, 'four kite cloths open the riders loft ' + JSON.stringify(r.loft));
  const t = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='skyroad'));BK.state='play';BK.god=true;BK.sim(10);const P=BK.P,S=BK.skyroad();
  /* THE SNATCH: a harpy's dive that lands takes you */
  for(const e of BK.enemies())if(e.t!=='harpy'&&e.t!=='kiterider'&&e.t!=='roc')e.alive=false;
  const hp=BK.enemies().filter(e=>e.t==='harpy').sort((a,b)=>Math.abs(a.x-110*16)-Math.abs(b.x-110*16))[0];BK.god=false;P.hp=P.maxHp;BK.tp(110,45);BK.sim(5);hp.x=P.x;hp.y=P.y-8;hp.mode='dive';hp.modeT=0.5;hp.hit=false;hp.dvx=0;hp.dvy=0;BK.sim(2);out.snatch=hp.mode;
  let held=0;for(let i=0;i<200&&hp.mode==='snatch';i++){BK.sim(1);held++;}out.held=held;out.free=!P.snatched;BK.god=true;P.hp=P.maxHp;
  /* THE KITE-RIDER: a blow while he flies cuts his line */
  const kr=BK.enemies().find(e=>e.t==='kiterider');BKT.hurtAs('light',kr,1,kr.x-10,false);BK.sim(2);out.rider={fly:kr.st.fly,kite:kr.st.kite,mode:kr.st.mode};
  /* THE ROC */
  for(const e of BK.enemies())if(e.t!=='roc')e.alive=false;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+2,17);BK.sim(150);const b=BK.boss;out.active=BK.bossActive&&b&&b.t==='roc';
  b.mode='fly';b.modeT=9;b.ward=0;BK.sim(2);P.x=b.x;P.y=b.y-36;P.vy=0;P.ground=false;BK.keys.down=true;BK.press('atk');let opened=false;for(let i=0;i<30&&!opened;i++){BK.sim(1);opened=BK.bossOpen?BK.bossOpen(b):(b.mode==='downed');}BK.keys.down=false;
  out.plunge={mode:b.mode,opened};let op=0;for(let i=0;i<60*8&&(b.mode==='downed');i++){op+=1/60;if(i===20){const h0=b.hp;BKT.hurtAs('light',b,40,b.x-10,false);out.openHit=+(h0-b.hp).toFixed(2);}BK.sim(1);}out.openFor=+op.toFixed(2);
  for(let i=0;i<40&&b.mode!=='fly';i++)BK.sim(1);out.ward=+(b.ward||0).toFixed(2);b.mode='fly';b.modeT=9;P.x=b.x;P.y=b.y-36;P.vy=0;P.ground=false;P.plunge=false;BK.keys.down=true;BK.press('atk');for(let i=0;i<20;i++)BK.sim(1);BK.keys.down=false;out.warded=b.mode;
  BK.sim(200);b.mode='fly';b.modeT=9;b.ward=0;P.x=b.x-14;P.y=A.floor;P.vy=0;P.ground=true;P.gliding=false;let h1=b.hp;BKT.hurtAs('light',b,40,b.x-10,false);out.lowHit=+(h1-b.hp).toFixed(2);   /* (claude/roc2) from the floor her talons guard low */
  P.y=b.y;P.ground=false;h1=b.hp;BKT.hurtAs('light',b,40,b.x-10,false);out.airHit=+(h1-b.hp).toFixed(2);   /* from the air the level gives she takes it whole */
  return out;})()`, 300000);
  ok(t.snatch === 'snatch' && t.held > 20 && t.free, 'a harpy dive that lands takes you, carries you, and lets go ' + JSON.stringify([t.snatch, t.held, t.free]));
  ok(!t.rider.fly && !t.rider.kite, 'a blow on a flying kite-rider cuts his line: he falls ' + JSON.stringify(t.rider));
  ok(t.active, 'THE ROC wakes on her eyrie');
  ok(t.plunge.opened && t.openFor >= 3, 'a thermal plunge on her back knocks her down, open 3 s or more ' + JSON.stringify([t.plunge, t.openFor]));
  /* (claude/roc2, Daniel 10-06: 'she DOESN'T NEED TO BE INVULNERABLE BY DEFAULT' - the old assertion was 'outside an opening it is a scratch'; she is always hittable now, guarding by height) */
  ok(t.openHit >= 40 * 1.4 && t.lowHit >= 40 * 0.15 && t.lowHit <= 40 * 0.35 && t.airHit >= 40 * 1.1, 'a blow on her down lands x1.5; out of an opening a floor blow is turned to a quarter (GUARDS LOW) and one from the air lands whole and more: ' + [t.openHit, t.lowHit, t.airHit]);
  ok(t.ward > 1 && t.warded !== 'downed', 'after the opening her feathers are up: a second plunge does not open her ' + JSON.stringify([t.ward, t.warded]));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
  if (pg.errors.length) bad++;
} finally { pg.close(); }
console.log(bad ? 'skyroad-probe: ' + bad + ' FAILED' : 'skyroad-probe: all green'); process.exit(bad ? 1 : 0);
