// tools/kingswood2-probe.mjs - KINGSWOOD 2 in the page, quickly (claude/kingswood2, the greybox). A smoke test of the rule, its machines and the set piece, not a playtest:
//   ?level=kings lands in play at the Royal Road (no god mode); a real blow on the first peg drops its cage on the sleeping brute (dead) and the cage stays as a step;
//   the checkpoint's cage lands as the step over its wall; the road's log trap drops, rolls through the pike line and splits; the stands' log span lands as a bridge;
//   the cage stair's three cages land as three steps; THE COURT'S PROCESSION marches past a hero on the boughs and leaves by the side gate, and turns on a hero who
//   stands on the road; a death keeps the steps and the bridge (the grid is rebuilt, the cells laid again); the area banner names each area as you come into it;
//   King Gorm wakes in his hall (his archers' perches where his horn puts them). No page error.
//   node tools/kingswood2-probe.mjs        (PORT=<your port>)
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=kings&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.kwood&&location.search.includes("kings")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor(BK.P.y/16)],start:[BK.L.START.x,BK.L.START.y],god:!!BK.god}:null').catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=kings lands in play on the Royal Road, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='kings');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
  const KW=BK.kwood(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);},cell=(x,y)=>BK.L.grid[y*BK.L.W+x],hz=k=>KW.hoist(k).state,E=()=>BK.enemies();
  const swing=(face)=>{P.face=face;BK.press('atk');for(let i=0;i<24;i++)BK.sim(1);};
  out.banner0=KW.read().banner;
  /* THE FIRST ROPE: a real blow on the peg */
  const brute=E().find(e=>e.t==='brute'&&Math.abs(e.x-28.5*16)<20);out.sleeper=!!(brute&&brute.sleeper);
  tp(22,39);swing(1);for(let i=0;i<120;i++)BK.sim(1);out.teach={state:hz('teachCage'),cells:[cell(27,38),cell(28,39)],brute:brute?brute.alive:null};
  /* THE CHECKPOINT: its cage is the step over the wall */
  for(const e of E())if(e.alive&&Math.abs(e.x-55*16)<80&&e.y>35*16)e.alive=false;
  tp(51,37);swing(1);for(let i=0;i<120;i++)BK.sim(1);out.check={state:hz('checkCage'),cells:[cell(57,36),cell(58,37)]};
  tp(57,35);P.face=1;const kk=BK.keys;BK.sim(10);kk.right=true;BK.press('jump');kk.jump=true;for(let i=0;i<26;i++)BK.sim(1);kk.jump=false;for(let i=0;i<50;i++)BK.sim(1);kk.right=false;BK.sim(20);out.over={x:Math.floor(P.x/16),y:Math.floor(P.y/16)};
  /* THE LOG TRAP: drops, rolls through the pike line, splits on the stump */
  const line=E().filter(e=>e.alive&&e.y<=33*16+2&&e.y>=32*16&&e.x>76*16&&e.x<86*16);line.forEach(e=>{e.sleeper=true;e.woke=0;});const hp0=line.map(e=>e.hp);
  tp(69,32);swing(1);let rolled=false;for(let i=0;i<300;i++){BK.sim(1);if(hz('roadLog')==='roll')rolled=true;}
  out.log={rolled,state:hz('roadLog'),hurt:line.filter((e,i)=>!e.alive||e.hp<hp0[i]).length,of:line.length,x:+(KW.hoist('roadLog').lx/16).toFixed(1)};
  /* THE LOG SPAN over the stands' gap */
  tp(148,27);swing(1);for(let i=0;i<120;i++)BK.sim(1);out.span={state:hz('standSpan'),cells:[151,155,158].map(x=>cell(x,28))};
  /* THE CAGE STAIR: three cages, three steps */
  for(const e of E())if(e.alive&&e.x>240*16&&e.x<262*16)e.alive=false;
  tp(248,22);swing(1);for(let i=0;i<120;i++)BK.sim(1);tp(253,18);swing(1);for(let i=0;i<120;i++)BK.sim(1);tp(257,14);swing(1);for(let i=0;i<120;i++)BK.sim(1);
  out.stair=['stairA','stairB','stairC'].map(hz).concat([cell(251,21),cell(255,17),cell(259,13)]);
  /* THE AREA BANNERS */
  const names=[];for(const x of [10,130,215,320,430]){tp(x,x<122?39:x<206?30:x<306?25:13);BK.sim(10);names.push(KW.read().banner);}out.names=names;
  /* A DEATH KEEPS THE STEPS AND THE BRIDGE */
  tp(205,25);BK.god=false;BK.damagePlayer(P.x+20,9999,{unblockable:true});let back=false;for(let i=0;i<600&&!back;i++){BK.sim(1);back=i>30&&!(P.dead>0)&&P.hp>0;}BK.sim(10);BK.god=true;
  out.respawn={back,cells:[cell(57,36),cell(155,28),cell(255,17)],states:['checkCage','standSpan','stairB','teachCage','roadLog'].map(hz)};
  /* THE PROCESSION: a hero on the boughs is passed under */
  BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);const KW2=BK.kwood();
  tp(330,9);let passed=0;for(let i=0;i<60*120&&!(KW2.read().proc.done);i++){BK.sim(1);P.vx=0;}out.hide=KW2.read().proc;out.hideHit=E().filter(e=>e.alive&&e.march).length;
  /* and turns on a hero who stands on the road */
  BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);const KW3=BK.kwood();
  tp(322,13);BK.sim(10);tp(345,13);let turned=0;for(let i=0;i<60*60&&turned<3;i++){BK.sim(1);turned=E().filter(e=>e.alive&&e.wasMarcher&&!e.march).length;}out.road={turned,proc:KW3.read().proc,n:KW3.read().n.seen};
  /* KING GORM wakes in his hall */
  for(const e of E())if(e.t!=='king'&&e.t!=='bearer'&&e.t!=='folk')e.alive=false;tp(428,13);for(let i=0;i<240;i++)BK.sim(1);const k=E().find(e=>e.t==='king');out.king={active:!!BK.bossActive,mode:k&&k.mode,x:k&&Math.round(k.x/16)};
  return out;})()`, 600000);
  ok(r.banner0 === 'THE ROYAL ROAD' && r.sleeper, 'the first banner names THE ROYAL ROAD; the brute under the first cage sleeps ' + JSON.stringify([r.banner0, r.sleeper]));
  ok(r.teach.state === 'down' && r.teach.cells.every(c => c === 1) && r.teach.brute === false, 'a real blow on the first peg drops its cage on the sleeping brute (dead) and it stays as a step ' + JSON.stringify(r.teach));
  ok(r.check.state === 'down' && r.check.cells.every(c => c === 1), "the checkpoint's cage lands as the step at its wall " + JSON.stringify(r.check));
  ok(r.over.x >= 59 && r.over.y <= 33, 'and the hero climbs over the wall on it ' + JSON.stringify(r.over));
  ok(r.log.rolled && r.log.state === 'gone' && r.log.hurt === r.log.of && r.log.of >= 3, 'the log trap drops, rolls through the pike line (every one hurt) and splits ' + JSON.stringify(r.log));
  ok(r.span.state === 'down' && r.span.cells.every(c => c === 2), 'the stands\' log span lands as a bridge (one-way cells) ' + JSON.stringify(r.span));
  ok(r.stair.slice(0, 3).every(s => s === 'down') && r.stair.slice(3).every(c => c === 1), 'the cage stair: three cages, three steps ' + JSON.stringify(r.stair));
  ok(r.names.join('|') === "THE ROYAL ROAD|THE HUNTING STANDS|THE CAGE GROVE|THE COURT'S PROCESSION|THE KING'S HALL", 'the area banner names each area as you come into it ' + JSON.stringify(r.names));
  ok(r.respawn.back && r.respawn.cells[0] === 1 && r.respawn.cells[1] === 2 && r.respawn.cells[2] === 1 && r.respawn.states[3] === 'down', 'a death keeps the steps and the bridge (cells laid again) ' + JSON.stringify(r.respawn));
  ok(r.hide.done && r.hide.passed >= 6, 'THE PROCESSION marches past a hero on the boughs and leaves by the side gate ' + JSON.stringify(r.hide));
  ok(r.road.turned >= 5, 'and turns on a hero who stands on the road ' + JSON.stringify(r.road));
  ok(r.king.active && r.king.mode && r.king.mode !== 'sleep', 'KING GORM wakes in his hall ' + JSON.stringify(r.king));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
  if (pg.errors.length) bad++;
} finally { pg.close(); }
console.log(bad ? 'kingswood2-probe: ' + bad + ' FAILED' : 'kingswood2-probe: all green'); process.exit(bad ? 1 : 0);
