// tools/welltown-probe.mjs - THE WELL TOWN in the page, quickly (claude/welltown): ?level=welltown lands on its entrance; the skin fills at a well
// and pours a mud wall open and a fire out (and both stay so after a death, while an unpoured fire comes back); the windlass sends the bucket down
// and the bottom windlass brings it up; the dry cistern opens its vault on four skins; a water-thief's cut takes a sip and cutting him down gives it
// back; THE BANDIT KING wakes, burns, opens to a pour (and a blow in the opening lands x2.6, outside it x0.05). A smoke test, not a suite check:
//   node tools/welltown-probe.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=welltown&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.welltown&&location.search.includes("welltown")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor((BK.P.y-1)/16)],start:[BK.L.START.x,BK.L.START.y],god:BK.god}:null', 3000).catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=welltown lands in play at its entrance, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='welltown');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(30);
  const W=()=>BK.welltown(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);BK.sim(4);},keep=new Set(['banditking']);
  out.loaded={wells:W().wells.length,walls:W().walls.length,fires:W().fires.length,sips:P.skin.sips};
  tp(11,29);BK.press('talk');BK.sim(3);out.fill=P.skin.sips;
  tp(259,29);P.face=1;BK.press('talk');BK.sim(3);out.wall={open:W().walls.find(m=>m.x0===262).open,sips:P.skin.sips};
  tp(119,29);P.face=1;BK.press('talk');BK.sim(3);out.stall={lit:W().fires.find(f=>f.x0===121).lit,sips:P.skin.sips};
  /* a death: the poured wall and fire stay open, the barricade not yet poured stays alight */
  BKT.respawn&&BKT.respawn();BK.sim(5);const G=BK.L.grid,Wd=BK.L.W;out.afterDeath={wall:G[29*Wd+262],stall:G[29*Wd+121],barricade:G[18*Wd+376]};
  for(const e of BK.enemies())if(!keep.has(e.t))e.alive=false;
  const m=BK.movers().find(q=>q.windlass);tp(177,25);BK.sim(10);P.face=-1;BK.press('atk');BK.sim(12);out.bucketDir=m.dir;for(let i=0;i<600&&m.dir;i++)BK.sim(1);out.down={y:m.y,y1:m.y1,P:Math.round(P.y)};
  tp(176,39);BK.sim(5);P.face=1;BK.press('atk');BK.sim(12);for(let i=0;i<800&&m.dir;i++)BK.sim(1);out.up={y:m.y,y0:m.y0};
  for(const pr of BK.props().filter(p=>p.t==='stray'&&!p.got)){BK.P.x=pr.x;BK.P.y=pr.y;BK.sim(3);}out.skins=BK.village().saved();
  tp(436,32);BK.press('talk');BK.sim(3);out.cistern={full:W().cistern.full,vault:W().vault.map(v=>v.open)};
  return out;})()`, 300000);
  ok(r.loaded.wells === 8 && r.loaded.walls === 5 && r.loaded.fires === 3, 'the town as built: 7 wells and a jar, 5 mud walls (the first lesson's postern, claude/welltown3), 3 fires ' + JSON.stringify(r.loaded));
  ok(r.fill === 3, 'E at a well fills the skin (3 sips)');
  ok(r.wall.open && r.wall.sips === 2, 'E facing a mud wall pours a sip on it: it gives way');
  ok(!r.stall.lit && r.stall.sips === 1, 'E facing a fire pours it out');
  ok(r.afterDeath.wall === 0 && r.afterDeath.stall === 0 && r.afterDeath.barricade === 1, 'after a death: the poured wall and fire stay open, the burning barricade is still there ' + JSON.stringify(r.afterDeath));
  ok(r.bucketDir === 1 && r.down.y === r.down.y1 && r.down.P > 38 * 16, 'a blow on THE WINDLASS sends the bucket down, with the hero on it ' + JSON.stringify(r.down));
  ok(r.up.y === r.up.y0, 'a blow on the bottom windlass winds it back up');
  ok(r.skins === 4 && r.cistern.full && r.cistern.vault.every(Boolean), 'four water-skins poured into THE DRY CISTERN open its vault');
  const t = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='welltown'));BK.state='play';BK.god=false;BK.sim(10);const P=BK.P;
  const th=BK.enemies().find(e=>e.t==='waterthief'&&e.alive);P.skin.sips=3;BK.tp(Math.floor(th.x/16)-2,Math.floor(th.y/16)-1);
  let stole=0;for(let i=0;i<900&&!stole;i++){P.hp=P.maxHp;BK.sim(1);if(th.st.carry)stole=1;}out.stole=[stole,P.skin.sips,th.st.mode];th.hp=1;BKT.hurtEnemy(th,99,th.x-10,false);BK.sim(30);out.back=P.skin.sips;
  BK.god=true;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss;out.king={active:BK.bossActive,t:b.t};
  let opened=0;for(let i=0;i<60*60&&!opened;i++){P.hp=P.maxHp;if(b.burning>0){P.skin.sips=3;P.x=b.x-20;P.face=1;BK.press('talk');}BK.sim(1);if(b.mode==='open')opened=1;}
  const h0=b.hp;BKT.hurtEnemy(b,40,b.x-10,false);out.openHit=+(h0-b.hp).toFixed(2);for(let i=0;i<600&&b.mode==='open';i++)BK.sim(1);b.chipAcc=0;b.greedLog=[];b.chipSaid=0;BKT.PROG.chipTold=9;BK.textLab.hint('',0);const h1=b.hp;BKT.hurtAs('light',b,40,b.x-10,false);out.chipHit=+(h1-b.hp).toFixed(2);const hn=BKT.hintNow;out.chipLines=[hn&&hn.msg].filter(x=>/SCRATCH|PLATE/.test(x||''));const h2=b.hp;BKT.hurtEnemy(b,40,b.x-10,false);out.roomHit=+(h2-b.hp).toFixed(2);out.opened=opened;out.n=BK.banditKing().n;
  return out;})()`, 300000);
  ok(t.stole[0] && t.stole[1] === 2 && t.stole[2] === 'flee' && t.back === 3, "a water-thief's cut takes a sip and he runs; cut down, the sip is back " + JSON.stringify(t.stole) + ' back ' + t.back);
  ok(t.king.active && t.king.t === 'banditking' && t.opened, 'THE BANDIT KING wakes, burns, and a pour while he burns opens him');
  ok(Math.abs(t.openHit - 40 * 2.6) < 1 && Math.abs(t.chipHit - 2) < 0.01, 'a blow lands x2.6 in the opening and a hero\'s x0.05 outside it (the global chip): ' + t.openHit + ' / ' + t.chipHit);
  ok(t.chipLines.length === 1 && /SCRATCH/.test(t.chipLines[0]), 'ONE chip line, the global one (his own THE MUD PLATE TURNS IT is gone): ' + JSON.stringify(t.chipLines));
  ok(Math.abs(t.roomHit - 40) < 0.01, 'the room\'s blow on him lands whole (the global rule chips only a hero): ' + t.roomHit);
  /* THE FIX LANE (claude/welltown-fix): the deep well winds, the ride is contested, a respawn refills the skin, E with a full skin beside a burning King pours */
  const u = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='welltown'));BK.state='play';BK.god=true;BK.sim(10);const P=BK.P,W=()=>BK.welltown();
  out.startSips=P.skin.sips;
  for(const e of BK.enemies())if(e.t!=='banditking'&&!(e.t==='waterthief'&&e.x>182*16&&e.x<185*16)&&!(e.t==='cutthroat'&&e.x>169*16&&e.x<172*16))e.alive=false;
  /* THE GREAT WELL: the bucket goes, and the well head's men come down after you */
  BK.tp(177,25);BK.sim(10);P.face=-1;BK.press('atk');BK.sim(12);for(let i=0;i<300;i++)BK.sim(1);
  out.followers=BK.enemies().filter(e=>e.alive&&(e.t==='waterthief'||e.t==='cutthroat')).map(e=>[Math.round(e.x/16),Math.round(e.y/16)]);
  /* THE DEEP WELL (448): E gives nothing until its windlass winds the bucket up; then it fills */
  for(const e of BK.enemies())if(e.t!=='banditking')e.alive=false;
  P.skin.sips=0;BK.tp(448,27);BK.sim(4);BK.press('talk');BK.sim(3);out.deepDown=P.skin.sips;
  BK.tp(447,27);BK.sim(4);P.face=-1;BK.press('atk');BK.sim(12);const dw=W().wells.find(w=>w.deep);out.winding=dw.wind>0;for(let i=0;i<260&&!dw.up;i++)BK.sim(1);out.up=dw.up;
  BK.tp(448,27);BK.sim(4);BK.press('talk');BK.sim(3);out.deepFill=P.skin.sips;out.downAgain=!dw.up;
  /* A RESPAWN refills the skin */
  P.skin.sips=0;BKT.respawn&&BKT.respawn();BK.sim(5);out.respawnSips=P.skin.sips;
  /* THE COURTYARD WELL: a full skin, the King burning beside it - E pours on him */
  const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss;let opened=0,tried=0;
  for(let i=0;i<60*60&&!opened;i++){P.hp=P.maxHp;if(b.burning>0&&b.mode!=='open'){P.skin.sips=P.skin.max;const wx=A.well;b.x=wx+18;BK.banditKingHands().fight().B.x=b.x-A.x0;P.x=wx;P.face=1;tried++;BK.press('talk');}BK.sim(1);if(b.mode==='open')opened=1;}
  out.wellPour={opened,tried,sips:P.skin.sips,max:P.skin.max};
  return out;})()`, 300000);
  ok(u.followers.length === 2 && u.followers.every(([x, y]) => y >= 37 && x >= 170 && x <= 184), 'THE RIDE IS CONTESTED: the bucket gone, the well head\'s thief and a square cutthroat are down at its foot ' + JSON.stringify(u.followers));
  ok(u.deepDown === 0 && u.winding && u.up && u.deepFill === 3 && u.downAgain, 'THE DEEP WELL: nothing until its windlass is struck, then the bucket winds up (2 s) and it fills, and the bucket goes down again ' + JSON.stringify(u));
  ok(u.respawnSips === 3, 'A CHECKPOINT RESPAWN REFILLS THE SKIN (Daniel): ' + u.respawnSips);
  ok(u.wellPour.opened && u.wellPour.sips < u.wellPour.max, 'E AT THE COURTYARD WELL with a full skin, the King burning beside it: it POURS on him (not swallowed by the well) ' + JSON.stringify(u.wellPour));
  if (pg.errors.length) { ok(false, 'page errors: ' + pg.errors.slice(0, 3).join(' | ')); }
} finally { pg.close(); }
console.log(bad ? bad + ' FAILED' : 'welltown-probe: all passed'); process.exitCode = bad ? 1 : 0;
