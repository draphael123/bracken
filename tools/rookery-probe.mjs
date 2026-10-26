// tools/rookery-probe.mjs - THE ROOKERY in the page, quickly (claude/rookery, the greybox). A smoke test of the rule, its machines, the shrieker and the boss, not a playtest:
// ?level=rookery lands in play (no god mode); on every REQUIRED cracked rock a hero standing on the mark draws her scream and aim, steps off, and her dive breaks it in the real
// game (the hole opens / the bridge, the platform, the steps are laid); a death keeps what broke; a shrieker screams and marks the hero, and the harpies near dive at the
// mark; the area banner names the areas; THE SHRIEK SISTERS wake on the summit (three bodies, one bar), a dive baited onto a cracked slab leaves her STUNNED (x2) and the
// slab rubble; on the wing a plain cut lands at 0.4x. No page error.
//   PORT=<your port> node tools/rookery-probe.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=rookery&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.rookery&&location.search.includes("rookery")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor(BK.P.y/16)],start:[BK.L.START.x,BK.L.START.y],god:!!BK.god}:null', 4000).catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=rookery lands in play on the guano ledges, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='rookery');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
  const RK=BK.rookery(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);},cell=(x,y)=>BK.L.grid[y*BK.L.W+x],st=k=>RK.read().cracks.find(c=>c.id===k).state;
  const D=k=>BK.L.hoists.find(h=>h.id===k);
  /* bait: stand on the mark (the harpy is brought near her roost), wait for her aim, step off away from the edge, wait */
  const bait=k=>{const d=D(k);tp(d.cleat[0],d.cleat[1]);let aim=false;for(let i=0;i<400&&!aim;i++){BK.sim(1);aim=BK.enemies().some(e=>e.alive&&e.rkAim);}
    const side=BK.L.grid[d.cleat[1]*BK.L.W+d.cleat[0]-2]===0&&BK.L.grid[(d.cleat[1]+1)*BK.L.W+d.cleat[0]-2]!==0?-2:-1;tp(d.cleat[0]+side,d.cleat[1]);P.x-=6;for(let i=0;i<360&&st(k)!=='broken';i++)BK.sim(1);return [aim,st(k)];};
  out.banner0=RK.read().banner;
  for(const k of ['firstFloor','roostSlab','firstNest','firstPillar','eggNest','ledgeSlab','spanPillar','lastNest','topSlab'])out[k]=bait(k);
  out.cells={floor:cell(49,40),slab:cell(98,39),nest:cell(120,39),pillar:cell(155,38),ledge:cell(230,22),span:cell(298,16),top:cell(352,12)};
  /* a death keeps what broke */
  tp(205,34);BK.god=false;BK.damagePlayer(P.x+20,9999,{unblockable:true});let back=false;for(let i=0;i<600&&!back;i++){BK.sim(1);back=i>30&&!(P.dead>0)&&P.hp>0;}BK.sim(10);BK.god=true;
  out.afterDeath={floor:cell(49,40),nest:cell(120,39),pillar:cell(155,38),state:st('firstNest')};
  /* THE SHRIEKER (the terraces' one at 140): she screams and marks the hero; the harpies near dive at the mark */
  tp(137,37);const n0=RK.read().n;let called=0,mark=0;for(let i=0;i<420;i++){BK.sim(1);P.hp=P.maxHp;const q=RK.read();mark=Math.max(mark,q.marks);called=q.n.called-n0.called;}
  out.shriek={screams:RK.read().n.screams-n0.screams,called,mark};
  tp(98,42);BK.sim(10);tp(108,37);BK.sim(10);out.banner2=RK.read().banner;
  /* THE SHRIEK SISTERS */
  tp(376,10);for(let i=0;i<240;i++)BK.sim(1);const b=BK.boss;out.boss=b?{t:b.t,mode:b.mode,hp:b.hp,max:b.maxHp,active:!!BK.bossActive}:null;
  const SH=BK.shriekSistersHands(),S=SH&&SH.show();
  if(b&&S){out.bodies=BK.enemies().filter(e=>e.t==='shrieksister'&&e.alive).length;for(let i=0;i<240;i++)BK.sim(1);
    /* a plain cut on the wing: 0.4x */
    const dv=S.sis.diver,body=BK.enemies().find(e=>e.t==='shrieksister'&&e.role==='diver');dv.mode='hover';dv.ward=0;const h0=dv.hp;SH.hit(body,20,P.x,false);out.wing=h0-dv.hp;
    /* bait the diver onto a slab: stand on it, hold the others off, step off at the lock */
    S.sis.shrieker.cd=99;S.sis.snatcher.mode='fly';const sl=S.G.slabs[1];tp(Math.floor(sl.x/16),10);dv.cd=0;dv.ward=0;dv.mode='hover';let stun=false,steps=[];
    for(let i=0;i<300&&!stun;i++){BK.sim(1);P.hp=P.maxHp;S.sis.shrieker.cd=99;if(dv.mode==='diveTell'&&dv.aim&&dv.aim.lock&&Math.abs(P.x-sl.x)<30){BK.tp(Math.floor((sl.x+56)/16),10);P.vx=0;}steps.push(dv.mode);stun=dv.mode==='stuck';}
    out.stun={stun,slab:sl.st,modes:[...new Set(steps)].join(',')};if(stun){const h1=dv.hp;SH.hit(body,20,P.x,false);out.stunHit=h1-dv.hp;}
    out.bar=SH.barName(b);out.n=JSON.parse(JSON.stringify(S.n));}
  BK.manualSimulation=false;return out;})()`, 240000);
  console.log(JSON.stringify(r));
  for (const k of ['firstFloor', 'roostSlab', 'firstNest', 'firstPillar', 'eggNest', 'ledgeSlab', 'spanPillar', 'lastNest', 'topSlab']) ok(r[k] && r[k][0] && r[k][1] === 'broken', k + ': on the mark she screams and aims; off it, her dive BREAKS it ' + JSON.stringify(r[k]));
  ok(r.cells.floor === 0 && r.cells.slab === 1 && r.cells.nest === 2 && r.cells.pillar === 2 && r.cells.ledge === 1 && r.cells.span === 2 && r.cells.top === 1, 'what broke is laid in the real grid (hole, steps, platform, bridges) ' + JSON.stringify(r.cells));
  ok(r.afterDeath.floor === 0 && r.afterDeath.nest === 2 && r.afterDeath.pillar === 2 && r.afterDeath.state === 'broken', 'a death keeps what broke ' + JSON.stringify(r.afterDeath));
  ok(r.shriek.screams >= 1 && r.shriek.mark >= 1 && r.shriek.called >= 1, 'a shrieker screams, MARKS the hero and the harpies dive at the mark ' + JSON.stringify(r.shriek));
  ok(r.banner0 === 'THE GUANO LEDGES' && r.banner2 === 'THE NEST TERRACES', 'the area banners: ' + r.banner0 + ' / ' + r.banner2);
  ok(r.boss && r.boss.t === 'shrieksisters' && r.boss.active && r.bodies === 3, 'THE SHRIEK SISTERS wake on the summit: three bodies, one bar ' + JSON.stringify(r.boss) + ' bodies ' + r.bodies);
  ok(r.wing >= 6 && r.wing <= 10, 'on the wing a plain cut lands at 0.4x (20 -> ' + r.wing + ')');
  ok(r.stun && r.stun.stun && r.stun.slab === 'rubble', 'a dive baited onto a cracked slab: she lies STUNNED and the slab is rubble ' + JSON.stringify(r.stun));
  ok(r.stunHit >= 38, 'stunned in the rubble a cut lands x2 (20 -> ' + r.stunHit + ')');
  const errs = pg.errors; ok(!errs.length, 'no page error ' + errs.slice(0, 3).join(' | '));
} catch (e) { console.log('  FAIL ' + e.message); bad++; }
finally { await pg.close(); }
console.log(bad ? '\nrookery-probe: ' + bad + ' FAILED' : '\nok  rookery-probe');
process.exit(bad ? 1 : 0);
