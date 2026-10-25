// tools/palisadewood-probe.mjs - THE PALISADE WOOD in the page, quickly (claude/palisadewood, the greybox). A smoke test of the rule, its machines, the stake-setter and the boss,
// not a playtest: ?level=palisadewood lands in play (no god mode); a real blow on each prop brings down what it holds (the ramps' steps are laid, the towers' and the
// gatehouse scaffold's bridges are laid, the crews come down hurt, the stake stacks drop and roll); a death keeps the ramps and bridges; a stake-setter plants a wall and
// two blows knock it down; the area banner names the areas; THE BATTERING BEAST wakes in the clearing, a scaffold knocked onto him leaves him STUCK (and x2), a charge into a
// wreck sticks him; his armour turns a plain cut to 0.4x. No page error.
//   PORT=<your port> node tools/palisadewood-probe.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=palisadewood&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.pwood&&location.search.includes("palisadewood")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor(BK.P.y/16)],start:[BK.L.START.x,BK.L.START.y],god:!!BK.god}:null').catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=palisadewood lands in play at the felled edge, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='palisadewood');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
  const PW=BK.pwood(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);},cell=(x,y)=>BK.L.grid[y*BK.L.W+x],st=k=>PW.hoist(k).state,E=()=>BK.enemies();
  const swing=face=>{P.face=face;BK.press('atk');for(let i=0;i<24;i++)BK.sim(1);};
  const D=k=>BK.L.hoists.find(h=>h.id===k);
  const knock=k=>{const d=D(k);tp(d.cleat[0]-1,d.cleat[1]);swing(1);if(st(k)==='hang'){tp(d.cleat[0]+1,d.cleat[1]);swing(-1);}BK.sim(90);return st(k);};
  out.banner0=PW.read().banner;
  out.edgeRamp=knock('edgeRamp');out.rampCells=[cell(21,36),cell(23,34)];
  const crewFoes=()=>E().filter(e=>e.alive&&e.x>31*16&&e.x<39*16&&e.y<29*16).length;out.crew0=crewFoes();out.edgeCrew=knock('edgeCrew');out.crew1=crewFoes();out.walk=cell(33,28);
  out.yardStakes=(()=>{const d=D('yardStakes');tp(d.cleat[0]-1,d.cleat[1]);P.face=1;BK.press('atk');let roll=false;for(let i=0;i<300;i++){BK.sim(1);if(st('yardStakes')==='roll')roll=true;}return [roll,st('yardStakes')];})();
  out.yardTower=knock('yardTower');out.span=cell(150,32);
  out.wallRamp=knock('wallRamp');out.wallSteps=[cell(218,18),cell(220,15)];
  out.wallTower=knock('wallTower');out.gateBridge=knock('gateBridge');out.gateStakes=knock('gateStakes');out.gateCrew=knock('gateCrew');
  /* a death keeps what stays */
  tp(205,28);BK.god=false;BK.damagePlayer(P.x+20,9999,{unblockable:true});let back=false;for(let i=0;i<600&&!back;i++){BK.sim(1);back=i>30&&!(P.dead>0)&&P.hp>0;}BK.sim(10);BK.god=true;out.afterDeath={ramp:cell(21,36),span:cell(150,32),walk:cell(33,28),edgeRamp:PW.hoist('edgeRamp').state,edgeCrew:PW.hoist('edgeCrew').state};
  /* THE STAKE-SETTER: the yard's (138,31) plants a wall between you */
  BK.god=false;P.hp=P.maxHp;tp(132,31);const s=E().find(e=>e.alive&&e.pwSetter&&Math.abs(e.x-138*16-8)<40);out.setter=!!s;let w=null;for(let i=0;i<240&&!w;i++){BK.sim(1);P.hp=P.maxHp;const r=PW.read();if(r.walls.length)w=r.walls[0];}
  out.wall=w;if(w){tp(w.x+(w.x*16>P.x?-1:1),w.y);const f=w.x*16+8>P.x?1:-1;swing(f);BK.sim(14);swing(f);BK.sim(10);out.wallAfter=PW.read().walls.length;out.wallCell=cell(w.x,w.y);}
  BK.god=true;
  tp(108,31);BK.sim(10);out.banner2=PW.read().banner;
  /* THE BATTERING BEAST */
  tp(461,24);for(let i=0;i<240;i++)BK.sim(1);const b=BK.boss;out.boss=b?{t:b.t,mode:b.mode,hp:b.hp,active:!!BK.bossActive}:null;
  const BH=BK.batteringBeastHands(),S=BH&&BH.show();
  if(b&&S){for(let i=0;i<200&&b.mode==='wake';i++)BK.sim(1);
    const sc=S.scafs[1];b.mode='walk';b.modeT=0;S.restT=5;b.x=sc.x-sc.dir*0+sc.dir*40;tp(Math.floor((sc.x-sc.dir*12)/16),24);P.face=sc.dir;BK.press('atk');for(let i=0;i<50;i++){BK.sim(1);S.restT=5;b.x=sc.x+sc.dir*40;}
    out.stuck={mode:b.mode,sc:S.scafs[1].st,n:S.n.stuck};const h0=b.hp;b.hitT=0;BK.hurtEnemy?0:0;out.stuckOpen=b.mode==='stuck';
    const tr=[];for(let i=0;i<600;i++){BK.sim(1);if(i%60===0)tr.push(b.mode+':'+(+b.modeT).toFixed(2));if(b.mode!=='stuck'&&!out.after)out.after={mode:b.mode,ward:S.ward>0,i};}out.trace=tr;out.after=out.after||{mode:b.mode,ward:S.ward>0};
    /* a charge into a wreck */
    for(let i=0;i<300&&(S.ward>0||b.mode!=='walk');i++)BK.sim(1);
    const s0=S.scafs[0];if(s0.st==='stand'){tp(Math.floor((s0.x-s0.dir*12)/16),24);P.face=s0.dir;BK.press('atk');for(let i=0;i<50;i++)BK.sim(1);}
    out.wreck=s0.st;b.x=S.G.x1-60;b.mode='chargeTell';b.modeT=0.05;b.face=-1;S.ward=0;tp(Math.floor((s0.x-s0.dir*30)/16),24);for(let i=0;i<120&&b.mode!=='stuck';i++)BK.sim(1);out.rammed={mode:b.mode,rams:S.n.wreckRams};
  }
  out.errors=(BK.errors?BK.errors():null);
  return out;})()`, 120000);
  console.log(JSON.stringify(r));
  ok(r.banner0 === 'THE FELLED EDGE', 'the first area banner: ' + r.banner0);
  ok(r.edgeRamp === 'down' && r.rampCells.every(c => c === 1), 'THE FIRST PROP: the scaffold folds into a ramp (solid steps laid)');
  ok(r.edgeCrew !== 'hang' && r.walk === 0 && r.crew1 < r.crew0 + 1, 'THE CREW: the walkway goes and its crew comes down (' + r.crew0 + ' -> ' + r.crew1 + ' up there)');
  ok(r.yardStakes[0] && r.yardStakes[1] === 'gone', 'THE STAKES: drop, roll, scatter');
  ok(r.yardTower === 'down' && r.span === 2, 'THE WATCHTOWER falls across: a bridge');
  ok(r.wallRamp === 'down' && r.wallSteps.every(c => c === 2), "THE WALL'S RAMP: a stair of boards");
  ok(r.wallTower === 'down' && r.gateBridge === 'down', 'the second watchtower and the gatehouse scaffold fall across');
  ok(r.gateStakes !== 'hang' && r.gateCrew !== 'hang', 'the gate stakes and the gate crew come down');
  ok(r.afterDeath.ramp === 1 && r.afterDeath.span === 2 && r.afterDeath.edgeRamp === 'down' && r.afterDeath.walk === 2 && r.afterDeath.edgeCrew === 'hang', 'a death keeps the ramps and bridges, and puts the crews\' walkways back: ' + JSON.stringify(r.afterDeath));
  ok(r.setter && r.wall, 'THE STAKE-SETTER plants a stake wall: ' + JSON.stringify(r.wall));
  ok(r.wall && r.wallCell === 0, 'two blows knock the stake wall down');
  ok(r.banner2 === 'THE STAKE YARD', 'the stake yard banner: ' + r.banner2);
  ok(r.boss && r.boss.t === 'batteringbeast' && r.boss.active, 'THE BATTERING BEAST wakes in the clearing: ' + JSON.stringify(r.boss));
  ok(r.stuckOpen, 'a scaffold knocked onto him: STUCK ' + JSON.stringify(r.stuck));
  ok(r.after && r.after.mode !== 'stuck', 'he tears out of it (ward after): ' + JSON.stringify(r.after));
  ok(r.rammed && r.rammed.mode === 'stuck' && r.rammed.rams >= 1, 'his charge into a wreck sticks him: ' + JSON.stringify(r.rammed) + ' wreck ' + r.wreck);
  ok(!pg.errors.length, 'no page error' + (pg.errors.length ? ': ' + pg.errors.slice(0, 3).join(' | ') : ''));
} finally { pg.close(); }
console.log(bad ? 'palisadewood-probe: ' + bad + ' FAIL' : 'palisadewood-probe: all green'); process.exit(bad ? 1 : 0);
