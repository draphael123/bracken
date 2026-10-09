// tools/rootway-probe.mjs - THE ROOTWAY in the page, quickly (claude/rootway, the greybox). A smoke test of the rule, its machines and the boss, not a playtest:
//   ?level=rootway lands in play at its entrance (no god mode); a bud grows under a hero who stops on it and sets him level with the root wall; a blow on a
//   cleat drops its span across the pit (one-way cells, a bridge) and a cage onto its stump (a step, the scouts under it crushed); a hunter on his hoist
//   rides down onto a hero who passes under, and a cut hoist drops him DAZED; an arrow struck back through THE LOOKOUT's rope drops its span; four tags
//   open the trophy loft; THE HUNTMASTER wakes on his stand: a frontal blow while he guards is turned, one from behind lands; his gold arrow struck back
//   breaks his quiver strap and opens him (3 s or more), then his ward turns blades; a red arrow is not turned by a blade; a cage cut down on him CATCHES him.
//   node tools/rootway-probe.mjs        (PORT=<your port>)
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=rootway&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.rootway&&location.search.includes("rootway")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor(BK.P.y/16)],start:[BK.L.START.x,BK.L.START.y],god:!!BK.god}:null', 4000).catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=rootway lands in play at its entrance, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='rootway');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
  const RW=BK.rootway(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);BK.sim(4);},cell=(x,y)=>BK.L.grid[y*BK.L.W+x],hz=k=>RW.hoist(k);
  const quiet=()=>{for(const e of BK.enemies())if(e.t!=='huntmaster'&&e.t!=='trophyhunter')e.alive=false;};quiet();
  const swing=(face)=>{P.face=face;BK.press('atk');for(let i=0;i<24;i++)BK.sim(1);};
  /* THE BUD: stop on it and it rises */
  tp(29,39);for(let i=0;i<150;i++)BK.sim(1);const bud=BK.movers().find(m=>m.kind==='growcap'&&Math.floor(m.x/16)===29);out.bud={state:bud.state,k:+bud.k.toFixed(2),feet:+(P.y/16).toFixed(2)};
  /* THE CELLAR SPAN: strike the cleat */
  tp(50,37);swing(1);for(let i=0;i<90;i++)BK.sim(1);out.span={state:hz('cellarSpan').state,cells:[53,56,60].map(x=>cell(x,38))};
  /* (claude/rootway2) THE HOLLOW TRUNK's SPRING CAP: land on it holding jump and it throws you up through the root plank onto it */
  tp(146,29);P.vx=0;BK.sim(8);P.x=143*16+8;P.y=26*16;P.vy=0;const kk=BK.keys||{};kk.jump=true;let top=99,bounced=false;for(let i=0;i<120;i++){BK.sim(1);top=Math.min(top,P.y/16);if(P.vy<-200)bounced=true;kk.left=bounced&&!P.ground;}kk.jump=false;kk.left=false;for(let i=0;i<60;i++)BK.sim(1);out.spring={top:+top.toFixed(2),feet:+(P.y/16).toFixed(2),ground:P.ground};
  /* A LARDER CAGE: crushes what is under it (a scout brought to its stump for it) */
  { const sc=BK.enemies().find(e=>e.t==='archer');if(sc){sc.alive=true;sc.hp=10;sc.x=213*16+8;sc.y=39*16;sc.vy=0;}
  tp(200,31);swing(1);for(let i=0;i<120;i++)BK.sim(1);out.cage={state:hz('larder1').state,cells:[cell(213,37),cell(214,38)],scouts:sc&&sc.alive&&Math.abs(sc.x-213.5*16)<30?1:0,n:RW.read().n.crushed}; }
  /* A HUNTER ON HIS HOIST: he rides down onto a hero who passes under */
  const hA=hz('hunterC'),hunter=hA.hunter;out.hangs=!!hunter&&hunter.st.mode==='hang';tp(301,18);let dropped=false;for(let i=0;i<120&&!dropped;i++){BK.sim(1);dropped=!hunter.st.hang;}for(let i=0;i<60;i++)BK.sim(1);
  out.hunterDrop={dropped,mode:hunter.st.mode,ground:Math.abs(hunter.y-19*16)<4};
  /* THE SECOND HUNTER: cut his hoist first and he falls DAZED */
  const hB=hz('hunterB'),hb2=hB.hunter;tp(261,22);swing(1);let dz=false;for(let i=0;i<120&&!dz;i++){BK.sim(1);dz=hb2.st.mode==='daze';}out.hunterCut={cut:hB.state,daze:dz};
  /* THE LOOKOUT: an arrow struck back through the rope */
  const lo=hz('lookout');BK.seeds().push({x:312*16+8,y:15*16+4,vx:200,vy:-20,dead:false,life:2,arrow:true,reflected:true,g:0});BK.sim(3);for(let i=0;i<90;i++)BK.sim(1);out.lookout={state:lo.state,cells:[304,308,311].map(x=>cell(x,19))};
  /* (the fix pass) A DEATH KEEPS THE ROAD YOU OPENED: the grid is rebuilt on a respawn, and the span that stays down is laid again (a bridge over the exam's fall) */
  BK.god=false;P.hp=0;let back=false;for(let i=0;i<600&&!back;i++){BK.sim(1);back=i>30&&!(P.dead>0)&&P.hp>0;}BK.sim(10);out.respawn={back,state:BK.rootway().hoist('lookout').state,cells:[304,308,311].map(x=>cell(x,19)),cellar:[53,60].map(x=>cell(x,38))};BK.god=true;
  return out;})()`, 300000);
  ok(r.bud.state === 'up' && r.bud.k > 0.9 && r.bud.feet < 38.2, 'a bud grows under a hero who stops on it, and stands him level with the root wall ' + JSON.stringify(r.bud));
  ok(r.span.state === 'down' && r.span.cells.every(c => c === 2), 'a blow on the cleat drops the span across the pit: a bridge of one-way cells ' + JSON.stringify(r.span));
  ok(r.spring.top < 23.2 && Math.abs(r.spring.feet - 24) < 0.3 && r.spring.ground, 'THE HOLLOW TRUNK: a held jump on the spring cap throws a hero up through the root plank, and he stands on it ' + JSON.stringify(r.spring));
  ok(r.cage.state === 'down' && r.cage.cells.every(c => c === 1) && r.cage.scouts < 1, 'a larder cage drops onto its stump (a solid step) and crushes the scout under it ' + JSON.stringify(r.cage));
  ok(r.hangs && r.hunterDrop.dropped && r.hunterDrop.ground, 'a trophy-hunter hangs on his hoist and rides it down onto a hero who passes under ' + JSON.stringify([r.hangs, r.hunterDrop]));
  ok(r.hunterCut.cut === 'down' && r.hunterCut.daze, 'his hoist cut, the hunter falls dazed ' + JSON.stringify(r.hunterCut));
  ok(r.lookout.state === 'down' && r.lookout.cells.every(c => c === 2), "an arrow struck back through THE LOOKOUT's rope drops its span " + JSON.stringify(r.lookout));
  ok(r.respawn.back && r.respawn.state === 'down' && r.respawn.cells.every(c => c === 2) && r.respawn.cellar.every(c => c === 2), 'a death keeps the spans: after a respawn the lookout\'s and the cellar\'s spans are still bridges ' + JSON.stringify(r.respawn));
  const t = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='rootway'));BK.state='play';BK.god=true;BK.sim(10);const P=BK.P;
  for(const e of BK.enemies())if(e.t!=='huntmaster')e.alive=false;
  const A=BK.L.arena;BK.tp(A.start[0],A.start[1]);BK.sim(150);const b=BK.boss,H=BK.huntmaster();out.active=BK.bossActive&&b&&b.t==='huntmaster';
  /* HIS FRONT GUARD: standing, a blow from his front is turned; from behind it lands */
  b.mode='stand';b.modeT=9;b.ward=0;b.face=-1;b.x=420*16;P.x=b.x-20;P.y=A.floor;P.ground=true;let h0=b.hp;BKT.hurtAs('light',b,20,P.x,false);out.front=+(h0-b.hp).toFixed(2);
  P.x=b.x+20;h0=b.hp;BKT.hurtAs('light',b,20,P.x,false);out.behind=+(h0-b.hp).toFixed(2);
  /* HIS GOLD ARROW STRUCK BACK: the quiver strap breaks, he is open */
  b.mode='stand';b.modeT=9;const F=H.fight();F.arrows.push({id:999,kind:'gold',x:b.x-30,y:b.y-16,vx:-290,vy:0,life:2,back:true,said:false});let opened=false;for(let i=0;i<40&&!opened;i++){BK.sim(1);opened=b.mode==='open';}
  out.key={opened,weak:{...F.weak},mul:b.openMul,t:+(b.open||0).toFixed(2)};let op=0;for(let i=0;i<60*8&&b.mode==='open';i++){op+=1/60;BK.sim(1);}out.openFor=+op.toFixed(2);
  BK.sim(2);out.ward=+(b.ward||0).toFixed(2);b.mode='stand';b.modeT=9;P.x=b.x+20;h0=b.hp;BKT.hurtAs('light',b,20,P.x,false);out.wardHit=+(h0-b.hp).toFixed(2);
  /* A RED ARROW: a blade does not turn it */
  for(let i=0;i<220;i++)BK.sim(1);b.mode='stand';b.modeT=9;F.arrows.push({id:998,kind:'red',x:P.x+30,y:P.y-10,vx:-250,vy:0,life:2,back:false,said:false});P.face=1;BK.press('atk');let red=null;for(let i=0;i<30;i++){BK.sim(1);const a=F.arrows.find(q=>q.id===998);if(a)red=a.back;}out.red=red;
  /* HIS CAGE: he stands on the left perch, its cleat is cut - CAUGHT */
  for(let i=0;i<220;i++)BK.sim(1);const p0=F.perches[0];b.perch=0;b.x=(p0.x0+p0.x1)/2;b.y=p0.y;b.mode='stand';b.modeT=9;b.ward=0;b.open=0;
  BK.rootway().cutHoist('hmL');let caught=false;for(let i=0;i<90&&!caught;i++){BK.sim(1);caught=b.mode==='caught';}out.caught=caught;
  /* (claude/rootway2) THE HIT CAP: open, the first three blows land (x1.5) and the third ends it - his told ward follows */
  for(let i=0;i<300;i++)BK.sim(1);b.mode='stand';b.modeT=9;b.ward=0;b.open=0;F.sinceOpen=99;b.x=420*16;b.perch=-1;b.y=A.floor;F.arrows.push({id:997,kind:'gold',x:b.x-30,y:b.y-16,vx:-290,vy:0,life:2,back:true,said:false});for(let i=0;i<40&&b.mode!=='open';i++)BK.sim(1);
  out.cap={open:b.mode==='open',t:+(b.open||0).toFixed(2),hits:[]};P.x=b.x+20;for(let k=0;k<3;k++){const h1=b.hp;BKT.hurtAs('light',b,20,P.x,false);out.cap.hits.push(+(h1-b.hp).toFixed(1));}BK.sim(30);out.cap.after={mode:b.mode,ward:+(b.ward||0).toFixed(2)};
  /* A THROWN SPORE POD: his long stagger, off his perch */
  for(let i=0;i<300;i++)BK.sim(1);{const p1=F.perches[1];b.perch=1;b.x=(p1.x0+p1.x1)/2;b.y=p1.y;b.mode='stand';b.modeT=9;b.ward=0;b.open=0;F.sinceOpen=99;const r0=H.podHit(b,b.x);for(let i=0;i<40;i++)BK.sim(1);out.pod={r:r0,mode:b.mode,open:+(b.open||0).toFixed(2),perch:b.perch,onFloor:Math.abs(b.y-A.floor)<2};}
  /* HIS NET: a hero it catches is held, and the heavy arrow comes */
  for(let i=0;i<300;i++)BK.sim(1);BK.god=false;P.maxHp=999;P.hp=999;b.ward=0;b.open=0;b.mode='netTell';b.modeT=0.01;b.x=420*16;b.y=A.floor;b.perch=-1;b.face=-1;P.x=b.x-90;P.y=A.floor;P.vx=0;P.inv=0;P.grace=0;
  {let held=false,heavy=false;for(let i=0;i<120;i++){BK.sim(1);if(P.snare>0)held=true;if(b.mode==='heavyTell')heavy=true;}out.net={held,heavy,n:H.read().n.netted};}
  /* HIS SNARES: a hop about the stand setting jaw traps */
  for(let i=0;i<200;i++)BK.sim(1);P.snare=0;P.x=410*16;b.ward=0;b.mode='snareTell';b.modeT=0.01;b.x=430*16;b.y=A.floor;b.perch=-1;for(let i=0;i<150;i++)BK.sim(1);out.snare=BK.snares().read().jaws.filter(j=>j.boss).length;
  /* A JAW TRAP SNAPS on a hero who steps in it; a thrown thing landing on one springs it */
  {const S=BK.snares();S.clearBoss();S.place(400*16,A.floor);for(let i=0;i<60;i++)BK.sim(1);P.snare=0;P.hp=999;P.x=400*16;P.y=A.floor;P.vx=0;BK.sim(3);out.jaw={held:P.snare>0};P.snare=0;S.clearBoss();S.place(404*16,A.floor);for(let i=0;i<60;i++)BK.sim(1);out.jaw.sprung=S.spring(404*16,A.floor);}
  /* THE HUNTING HORN: two archers onto the root perches */
  for(let i=0;i<120;i++)BK.sim(1);BK.god=true;b.ward=0;b.mode='hornTell';b.modeT=0.01;for(let i=0;i<10;i++)BK.sim(1);out.horn=H.read().adds.map(a=>Math.round((A.floor-a.y)/16));
  /* THE DODGE ROLL: a blade up close while he guards - he rolls away, once a cycle */
  for(let i=0;i<300;i++)BK.sim(1);for(const e of BK.enemies())if(e.hmAdd)e.alive=false;F.rollUsed=false;F.sinceOpen=99;b.ward=0;b.open=0;b.mode='walk';b.modeT=5;b.x=420*16;b.y=A.floor;b.perch=-1;P.x=b.x-18;P.y=A.floor;P.face=1;BK.press('atk');let rolled=false;for(let i=0;i<20&&!rolled;i++){BK.sim(1);rolled=b.mode==='roll';}for(let i=0;i<40;i++)BK.sim(1);out.roll={rolled,dx:Math.round(b.x-420*16)};
  out.read=H.read().n;return out;})()`, 300000);
  ok(t.active, 'THE GOBLIN HUNTMASTER wakes on his stand');
  ok(t.behind > 10 && t.front > 0 && Math.abs(t.front / t.behind - 0.4) < 0.08, 'he guards his front (B15: a frontal blow turned to 0.4, GO ROUND), a blow from behind lands whole: ' + t.front + ' / ' + t.behind);
  ok(t.key.opened && t.key.weak[1] && t.openFor >= 3, 'his gold arrow struck back breaks the quiver strap and opens him, 3 s or more ' + JSON.stringify([t.key, t.openFor]));
  ok(t.ward > 1 && t.wardHit > 0 && Math.abs(t.wardHit / t.behind - 0.4) < 0.08, 'after the opening his ward turns blades to 0.4 (B3 + B15: never totally shut) ' + JSON.stringify([t.ward, t.wardHit]));
  ok(t.key.t >= 3.5 && t.key.t <= 4.1, 'his own arrow home is THE LONG STAGGER (3.5-4 game seconds): ' + t.key.t);
  ok(t.cap.open && t.cap.hits.length === 3 && t.cap.hits.every(h => h >= 29) && t.cap.after.mode !== 'open' && t.cap.after.ward > 2.4, 'THE HIT CAP: open, three blows land x1.5 and the third ends it; his told ward follows ' + JSON.stringify(t.cap));
  ok(t.pod.r === 'stagger' && t.pod.mode === 'open' && t.pod.open > 3 && t.pod.perch === -1 && t.pod.onFloor, 'a thrown spore pod on him is the long stagger, and he drops off his perch to the floor ' + JSON.stringify(t.pod));
  ok(t.net.held && t.net.heavy, 'HIS NET: a hero it catches is held, and he draws the heavy arrow ' + JSON.stringify(t.net));
  ok(t.snare >= 2, 'HIS SNARES: he sets jaw traps about the stand (' + t.snare + ')');
  ok(t.jaw.held && t.jaw.sprung === 1, 'a jaw trap holds a hero who steps in it; a thrown thing on one springs it ' + JSON.stringify(t.jaw));
  ok(t.horn.length === 2 && t.horn.every(r => r >= 4), 'THE HUNTING HORN: two archers onto the root perches ' + JSON.stringify(t.horn));
  ok(t.roll.rolled && Math.abs(t.roll.dx) > 60, 'THE DODGE ROLL: a blade up close and he rolls away (he lands on the stand) ' + JSON.stringify(t.roll));
  ok(t.red === false || t.red === null, 'a red arrow is not turned by a blade');
  ok(t.caught, 'a cage cut down on him on his perch CATCHES him');
  console.log('  read', JSON.stringify(t.read));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
  if (pg.errors.length) bad++;
} finally { pg.close(); }
console.log(bad ? 'rootway-probe: ' + bad + ' FAILED' : 'rootway-probe: all green'); process.exit(bad ? 1 : 0);
