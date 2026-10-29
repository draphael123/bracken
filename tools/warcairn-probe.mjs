// tools/warcairn-probe.mjs - THE WAR CAIRN in the page, quickly (claude/warcairn, the greybox). A smoke test of the rule, its machines, the drummer and the boss, not a playtest:
// ?level=warcairn lands in play at the foot of the gully (no god mode); a REAL BLOW on the far bank's drum is a BEAT - the tunnel's drum gate swings open, the striker is in
// WAR-RAGE (a blow dealt lands harder, a blow taken costs more), and the gate swings shut a few seconds later; the gate run's drum opens all three chimney hatches; a RANGER's
// arrow loosed at a drum is a beat; THE DRUMMER runs to his drum and beats it on his count, and the axemen in earshot SURGE; THE BERSERKER CHIEFTAIN wakes in the ring, a blade
// on his walk lands x0.7, into TAKE IT x0.4 (and a held heavy breaks it), and a beat in his FRENZY opens him (x2); beaten in his own level he YIELDS - boss:warcairn and
// THE CHIEFTAIN'S AXES are set. Frames are drawn throughout. No page error.
//   PORT=<your port> node tools/warcairn-probe.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=warcairn&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.warcairn&&location.search.includes("warcairn")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor(BK.P.y/16)],start:[BK.L.START.x,BK.L.START.y],god:!!BK.god}:null', 4000).catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=warcairn lands in play at the foot of the gully, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='warcairn');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
  const WH=BK.warCairnHands(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);},cell=(x,y)=>BK.L.grid[y*BK.L.W+x],rd=()=>WH.read();
  out.banner0=rd().banner;
  /* 1. A REAL BLOW on the far bank's drum: the tunnel gate opens; war-rage */
  const d1=BK.L.wcDrums.find(d=>d.id==='gully'),g1=BK.L.wcGates.find(g=>g.id==='tunnel');tp(d1.x-1,d1.f);P.face=1;out.gateShut=cell(g1.x0,g1.y0);
  for(let i=0;i<40&&cell(g1.x0,g1.y0)!==0;i++){if(P.atk<0)BK.press('atk');BK.sim(1);}out.gateOpen=cell(g1.x0,g1.y0);out.rage=WH.raging(P);out.beats=rd().n.heroBeats;
  for(let i=0;i<60*7;i++)BK.sim(1);out.gateAgain=cell(g1.x0,g1.y0);
  /* 2. THE GATE RUN: one beat opens all three hatches */
  const d2=BK.L.wcDrums.find(d=>d.id==='gaterun');tp(d2.x-1,d2.f);P.face=1;for(let i=0;i<40&&rd().gates.find(g=>g.id==='hatch1').open!==true;i++){if(P.atk<0)BK.press('atk');BK.sim(1);P.hp=P.maxHp;}
  out.hatches=rd().gates.filter(g=>g.id.startsWith('hatch')).map(g=>g.open);
  /* 3. THE DRUMMER: stand near his drum - he runs to it and beats it; the axemen surge */
  for(let i=0;i<60*7;i++){BK.sim(1);P.hp=P.maxHp;}
  const d3=BK.L.wcDrums.find(d=>d.id==='drummer1');tp(d3.x-9,d3.f);const b0=rd().n.drummerBeats;let surged=false;for(let i=0;i<60*8;i++){BK.sim(1);P.hp=P.maxHp;if(BK.enemies().some(e=>e.alive&&e.t==='soldier'&&WH.surging(e)))surged=true;}
  out.drummer={beats:rd().n.drummerBeats-b0,surged,alive:BK.enemies().filter(e=>e.t==='drummer'&&e.alive).length};
  /* 4. A SLAB swings level on the face drum's beat */
  const d5=BK.L.wcDrums.find(d=>d.id==='face1'),s5=BK.L.wcSlabs.find(s=>s.id==='face1a');out.slabBefore=cell(s5.x0,s5.y);tp(d5.x-1,d5.f);P.face=1;for(let i=0;i<40&&cell(s5.x0,s5.y)===0;i++){if(P.atk<0)BK.press('atk');BK.sim(1);P.hp=P.maxHp;}out.slabAfter=cell(s5.x0,s5.y);
  out.banner2=rd().banner;
  /* 5. THE BERSERKER CHIEFTAIN */
  const A=BK.L.arena;tp(Math.floor(A.trigger/16)+1,Math.floor(A.floor/16)-1);for(let i=0;i<260;i++){BK.sim(1);P.hp=P.maxHp;}const b=BK.boss;out.boss=b?{t:b.t,mode:b.mode,hp:b.hp,max:b.maxHp,active:!!BK.bossActive}:null;
  const BH=BK.bzchiefHands(),S=BH&&BH.show();
  if(b&&S){P.x=b.x-30;b.face=-1;b.mode='walk';b.modeT=9;S.ward=0;S.frenzy=0;out.walk=BH.take(b,20,'light','light');
    b.mode='take';b.modeT=0.5;out.take=BH.take(b,20,'light','light');b.mode='take';b.modeT=0.5;out.heavy=BH.take(b,20,'heavy','heavy');out.afterHeavy=b.mode;
    b.mode='walk';b.modeT=9;S.frenzy=3;S.ward=0;WH.beat('arena0','hero');out.broken=b.mode;out.open=BH.take(b,20,'light','light');out.bar=BH.barName(b);
    /* he yields: beaten in his own level */
    for(let i=0;i<240;i++){BK.sim(1);P.hp=P.maxHp;}b.hp=1;b.open=0;b.mode='flurry';S.ward=0;S.frenzy=0;BK.env().hurt(b,50,P.x);for(let i=0;i<180;i++){BK.sim(1);P.hp=P.maxHp;}
    out.down={alive:b.alive,bossDown:!!(BK.PROG.bossDown&&BK.PROG.bossDown.warcairn),axes:!!(BK.PROG.swords&&BK.PROG.swords.chiefaxes)};out.n=JSON.parse(JSON.stringify(S.n));}
  BK.manualSimulation=false;return out;})()`, 300000);
  console.log(JSON.stringify(r));
  ok(r.gateShut === 12 && r.gateOpen === 0, 'a real blow on the far bank drum: THE BEAT - the tunnel\'s drum gate swings open (' + r.gateShut + ' -> ' + r.gateOpen + ')');
  ok(r.rage && r.beats >= 1, 'the striker is in WAR-RAGE');
  ok(r.gateAgain === 12, 'a few seconds later the gate swings shut');
  ok(r.hatches && r.hatches.length === 3 && r.hatches.every(Boolean), 'one beat of the gate run\'s drum opens all three chimney hatches ' + JSON.stringify(r.hatches));
  ok(r.drummer.beats >= 1 && r.drummer.surged, 'THE DRUMMER beats his drum on his count and the axemen SURGE ' + JSON.stringify(r.drummer));
  ok(r.slabBefore === 0 && r.slabAfter === 2, 'the face drum swings its chained slab level (' + r.slabBefore + ' -> ' + r.slabAfter + ')');
  ok(r.banner0 === 'THE GULLY ROAD' && r.banner2 === 'THE TOTEM FACE', 'the area banners: ' + r.banner0 + ' / ' + r.banner2);
  ok(r.boss && r.boss.t === 'bzchief' && r.boss.active, 'THE BERSERKER CHIEFTAIN wakes in the ring ' + JSON.stringify(r.boss));
  ok(r.walk === 14, 'on his walk a blade lands x0.7 (20 -> ' + r.walk + ')');
  ok(r.take === 8, 'into TAKE IT x0.4 (20 -> ' + r.take + ')');
  ok(r.heavy === 20 && r.afterHeavy === 'reel', 'a heavy blow breaks TAKE IT: he reels, x1.0 (' + r.heavy + ', ' + r.afterHeavy + ')');
  ok(r.broken === 'broken' && r.open === 40, 'a beat in his FRENZY: he LOSES THE BEAT - open x2 (' + r.broken + ', 20 -> ' + r.open + ') ' + r.bar);
  ok(r.down && !r.down.alive && r.down.bossDown && r.down.axes, 'beaten in his own level he YIELDS: boss:warcairn and THE CHIEFTAIN\'S AXES ' + JSON.stringify(r.down));
  /* THE RANGER: an arrow at a drum is a beat (every hero can use it) */
  const q = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const id=LEVELS.findIndex(l=>l.id==='warcairn');BK.setHero('ranger');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
    const WH=BK.warCairnHands(),P=BK.P,d1=BK.L.wcDrums.find(d=>d.id==='gully');BK.tp(d1.x-5,d1.f);P.vx=0;P.vy=0;P.face=1;BK.sim(10);const b0=WH.read().n.heroBeats;
    for(let i=0;i<120&&WH.read().n.heroBeats===b0;i++){if(P.atk<0&&!(i%20))BK.press('atk');BK.sim(1);}const n=WH.read().n;BK.manualSimulation=false;return {beats:n.heroBeats-b0,arrows:n.arrows};})()`, 60000);
  ok(q && q.beats >= 1, 'a RANGER\'s arrow loosed at a drum is a beat ' + JSON.stringify(q));
  const errs = pg.errors; ok(!errs.length, 'no page error ' + errs.slice(0, 3).join(' | '));
} catch (e) { console.log('  FAIL ' + e.message); bad++; }
finally { await pg.close(); }
console.log(bad ? '\nwarcairn-probe: ' + bad + ' FAILED' : '\nok  warcairn-probe');
process.exit(bad ? 1 : 0);
