// tools/kitchengate-probe.mjs - THE KITCHEN GATE in the page, quickly (claude/kitchengate, the greybox). A smoke test of the rule, its machines, the butcher and the boss, not a
// playtest: ?level=kitchengate lands in play (no god mode); a REAL BLOW on the scullery's bellows makes its fire roar, and the copper's steam lifts a hero up the well of the scullery
// to the wine vaults; the great spit turns while its fire roars (and stops when it dies), and a hero stood on a spit at the bottom is carried up; the stove's grease trail burns to
// the tallow door and melts it (the cooks on the trail burn); a death keeps the door melted; the great grease pot goes over and its fire runs east; THE BUTCHER on a burning trail
// burns (a blade x2); the three recipe pages open the spice vault; the area banners; LORD GRUBBAG wakes at the high table, a blade lands WELL FED (x0.45), a blow on the pie oven's
// (claude/kitchengate2) the pepper stove's bellows sends a chilli down THE SERVING LINE (a conveyor that carries you), a real blow knocks a dish off it, the chilli reaches him - TOO HOT (x2) -
// then a WARD (x0.4); the service bell rushes the line and sends attendants down it. No page error.
//   PORT=<your port> node tools/kitchengate-probe.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=kitchengate&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.kitchen&&location.search.includes("kitchengate")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor(BK.P.y/16)],start:[BK.L.START.x,BK.L.START.y],god:!!BK.god}:null', 4000).catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=kitchengate lands in play in the undercellars, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const {oldCol:O}=await import('/src/kitchen-gate.js');   /* (claude/kitchengate3) old-grid columns: two rooms were let in */
  const id=LEVELS.findIndex(l=>l.id==='kitchengate');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
  const KG=BK.kitchen(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);},cell=(x,y)=>BK.L.grid[y*BK.L.W+x],rd=()=>BK.kitchenRead();
  const fire=k=>rd().fires.find(f=>f.id===k).roar;
  out.banner0=rd().banner;
  /* 1. A REAL BLOW on the scullery's bellows (stand west of it, face it, swing) */
  const B=BK.L.hoists.find(h=>h.id==='scullery');tp(B.cleat[0]-1,B.cleat[1]);P.face=1;for(let i=0;i<40&&fire('scullery')<=0;i++){if(P.atk<0)BK.press('atk');BK.sim(1);}out.strike=fire('scullery');
  /* the copper's steam: stand in it and it lifts you up the well of the scullery */
  tp(64,39);const y0=P.y;let yMin=P.y;for(let i=0;i<150;i++){BK.sim(1);yMin=Math.min(yMin,P.y);}out.lift=Math.round((y0-yMin)/16);
  /* 2. THE FIRST SPIT: still while its fire is banked; turning while it roars; a hero on a spit at the bottom is carried up */
  const w0=rd().wheels.find(w=>w.id==='wheel1').ang;BK.sim(60);out.cold=rd().wheels.find(w=>w.id==='wheel1').ang===w0;
  KG.stoke('spit1');BK.sim(30);out.turns=rd().wheels.find(w=>w.id==='wheel1').ang!==w0;
  const spits=BK.movers().filter(m=>m.kg==='spit'&&m.wheel==='wheel1');let low=null;for(let i=0;i<300&&!low;i++){BK.sim(1);low=spits.find(m=>m.y>BK.L.kgWheels[0].y+50&&Math.abs(m.x+m.w/2-BK.L.kgWheels[0].x)<12);}
  if(low){P.x=low.x+low.w/2;P.y=low.y;P.vx=0;P.vy=0;const sy=P.y;let ride=0,top=P.y;for(let i=0;i<330;i++){BK.sim(1);if(P.onMover===low)ride++;top=Math.min(top,P.y);}out.ride={frames:ride,rose:Math.round((sy-top)/16)};}
  for(let i=0;i<600&&fire('spit1')>0;i++)BK.sim(1);const w1=rd().wheels.find(w=>w.id==='wheel1').ang;BK.sim(60);out.stops=rd().wheels.find(w=>w.id==='wheel1').ang===w1;
  /* 3. THE TALLOW DOOR: the stove's trail burns to it and it melts; the cooks on the trail burn */
  tp(O(221),23);BK.sim(30);const n0=rd().n;out.doorBefore=cell(O(238),20);KG.stoke('stove1');for(let i=0;i<400&&rd().doors.find(d=>d.id==='door1').state!=='gone';i++)BK.sim(1);
  out.door=rd().doors.find(d=>d.id==='door1').state;out.doorCell=cell(O(238),20);out.foeBurns=rd().n.foeBurns-n0.foeBurns;out.trail=rd().trails.find(t=>t.id==='trail1').state;
  /* a death keeps the door melted */
  tp(O(230),23);BK.god=false;BK.damagePlayer(P.x+20,9999,{unblockable:true});let back=false;for(let i=0;i<600&&!back;i++){BK.sim(1);back=i>30&&!(P.dead>0)&&P.hp>0;}BK.sim(10);BK.god=true;
  out.afterDeath={door:rd().doors.find(d=>d.id==='door1').state,cell:cell(O(238),20)};
  /* 4. THE OVERTURNED POT */
  tp(O(248),23);for(let i=0;i<60;i++){P.vx=80;BK.sim(1);}const rc=rd().race;BK.sim(60);out.race={state:rc.state,front:rd().race.front,from:O(246)*16};
  /* 5. THE BUTCHER on the stove's trail burns */
  tp(O(287),23);BK.sim(5);const bu=BK.enemies().find(e=>e.alive&&e.t==='butcher'&&e.x<O(300)*16);if(bu){bu.x=O(292)*16;bu.y=24*16;bu.vx=0;}KG.stoke('stove2');let burnt=false;for(let i=0;i<240&&!burnt;i++){BK.sim(1);P.hp=P.maxHp;if(bu){bu.x=O(292)*16;burnt=bu.kgBurn>0;}}
  out.butcher={found:!!bu,burnt,take:bu?KG.takeFoe(bu,10):0};
  /* 6. THE RECIPE PAGES open the spice vault */
  for(const [x,y] of BK.L.kgPages){tp(x,y);BK.sim(6);}out.pages=rd().pages;out.vault=rd().vault;out.vaultCell=cell(O(362),22);
  tp(O(304),21);BK.sim(10);out.banner3=rd().banner;
  /* 7. LORD GRUBBAG */
  tp(O(398),21);for(let i=0;i<260;i++){BK.sim(1);P.hp=P.maxHp;}const b=BK.boss;out.boss=b?{t:b.t,mode:b.mode,hp:b.hp,max:b.maxHp,active:!!BK.bossActive}:null;
  const GH=BK.grubbagHands(),S=GH&&GH.show();
  if(b&&S){b.mode='sit';S.restT=99;S.ward=0;S.hungry=0;out.fed=GH.take(b,20,P.x,false);
    /* (claude/kitchengate2) a REAL blow on the pepper stove's bellows: the next item out is a chilli */
    tp(Math.floor(S.G.bellowsX/16)-1,21);P.face=1;for(let i=0;i<40&&S.stove.st==='cold';i++){if(P.atk<0)BK.press('atk');BK.sim(1);S.restT=99;}out.stove=S.stove.st;
    /* THE SERVING LINE carries a hero standing on it toward him */
    const B=S.G.belt;P.x=B.x0+30;P.y=B.y;P.vx=0;P.vy=0;BK.sim(2);const cx0=P.x;for(let i=0;i<60;i++){BK.sim(1);P.hp=P.maxHp;if(b.mode==='sit')S.restT=99;}out.carry=Math.round(P.x-cx0);
    /* a REAL blow knocks a dish off the line */
    S.items.length=0;S.items.push({id:7001,kind:'dish',x:P.x+14,state:'ride',fuse:0});P.face=1;let off=false;for(let i=0;i<40&&!off;i++){if(P.atk<0)BK.press('atk');BK.sim(1);S.restT=99;off=S.items.every(q=>q.id!==7001||q.state==='fall');}out.knock={off,hungry:S.hungry>0};
    /* the chilli rides the line to him: TOO HOT */
    tp(Math.floor(S.G.chairX/16)-9,21);let ch=false,modes=new Set();S.lineT=0.1;for(let i=0;i<1400&&!ch;i++){BK.sim(1);P.hp=P.maxHp;if(b.mode==='sit')S.restT=99;modes.add(b.mode);ch=b.mode==='hot';}
    out.hot={ch,modes:[...modes].join(','),chillies:S.n.chillies,hots:S.n.hots};if(ch){out.open=GH.take(b,20,P.x,false);for(let i=0;i<1200&&b.mode==='hot';i++){BK.sim(1);P.hp=P.maxHp;}for(let i=0;i<40;i++)BK.sim(1);out.ward=S.ward>0;out.warded=GH.take(b,20,P.x,false);}
    /* THE SERVICE BELL: attendants come down the line (real foes) */
    for(let i=0;i<200&&b.mode!=='sit';i++){BK.sim(1);P.hp=P.maxHp;}S.ph=2;S.ward=0;S.adds=[];b.mode='bellTell';b.modeT=0.05;for(let i=0;i<30;i++){BK.sim(1);P.hp=P.maxHp;if(b.mode==='sit')S.restT=99;}
    const ad=BK.enemies().filter(q=>q.alive&&q.t==='attendant');out.adds={n:ad.length,inS:S.adds.length,onLine:ad.filter(q=>Math.abs(q.y-B.y)<20).length,rush:S.rush>0};
    out.bar=GH.barName(b);out.n=JSON.parse(JSON.stringify(S.n));}
  BK.manualSimulation=false;return out;})()`, 300000);
  console.log(JSON.stringify(r));
  ok(r.strike > 0, 'a real blow on the scullery bellows: its fire ROARS (' + r.strike + ' s left)');
  ok(r.lift >= 10, "the copper's steam lifts a hero up the well of the scullery (" + r.lift + ' rows)');
  ok(r.cold && r.turns && r.stops, 'the great spit is still while its fire is banked, turns while it roars, stops when it dies ' + JSON.stringify({ cold: r.cold, turns: r.turns, stops: r.stops }));
  ok(r.ride && r.ride.frames > 30 && r.ride.rose >= 4, 'a hero stood on a spit at the bottom is carried up ' + JSON.stringify(r.ride));
  ok(r.doorBefore === 1 && r.door === 'gone' && r.doorCell === 0 && r.foeBurns >= 1, 'the stove trail burns to the tallow door and MELTS it; the cooks on the trail burn ' + JSON.stringify({ before: r.doorBefore, door: r.door, cell: r.doorCell, foeBurns: r.foeBurns }));
  ok(r.afterDeath.door === 'gone' && r.afterDeath.cell === 0, 'a death keeps the tallow door melted ' + JSON.stringify(r.afterDeath));
  ok(r.race.state === 'on' && r.race.front > r.race.from + 40, 'THE GREAT GREASE POT goes over and its fire runs east ' + JSON.stringify(r.race));
  ok(r.butcher.found && r.butcher.burnt && r.butcher.take === 20, 'THE BUTCHER on a burning trail burns, and a blade takes him double ' + JSON.stringify(r.butcher));
  ok(r.pages === 3 && r.vault && r.vaultCell === 0, 'the three recipe pages open THE SPICE VAULT ' + JSON.stringify({ pages: r.pages, vault: r.vault, cell: r.vaultCell }));
  ok(r.banner0 === 'THE UNDERCELLARS' && r.banner3 === 'THE FEAST HALL', 'the area banners: ' + r.banner0 + ' / ' + r.banner3);
  ok(r.boss && r.boss.t === 'grubbag' && r.boss.active, 'LORD GRUBBAG wakes at the high table ' + JSON.stringify(r.boss));
  ok(r.fed === 9, 'well fed, a blade lands at x0.45 (20 -> ' + r.fed + ')');
  ok(r.stove === 'roast', 'a real blow on the pepper stove bellows: a red-hot chilli comes out next (' + r.stove + ')');
  ok(r.carry >= 18, 'THE SERVING LINE carries a hero standing on it toward him (' + r.carry + ' px in 1 s)');
  ok(r.knock && r.knock.off && r.knock.hungry, 'a real blow knocks a dish off the line: he goes HUNGRY ' + JSON.stringify(r.knock));
  ok(r.hot && r.hot.ch, 'the chilli rides the line to him: TOO HOT ' + JSON.stringify(r.hot));
  ok(r.open === 40, 'open, a blade lands x2 (20 -> ' + r.open + ')');
  ok(r.adds && r.adds.n >= 1 && r.adds.inS >= 1 && r.adds.rush, 'THE SERVICE BELL: the line rushes and attendants come down it (real foes) ' + JSON.stringify(r.adds));
  ok(r.ward && r.warded === 8, 'he coughs it up behind a WARD: x0.4 (20 -> ' + r.warded + ')');
  const errs = pg.errors; ok(!errs.length, 'no page error ' + errs.slice(0, 3).join(' | '));
} catch (e) { console.log('  FAIL ' + e.message); bad++; }
finally { await pg.close(); }
console.log(bad ? '\nkitchengate-probe: ' + bad + ' FAILED' : '\nok  kitchengate-probe');
process.exit(bad ? 1 : 0);
