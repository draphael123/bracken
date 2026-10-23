// tools/sporewood2-probe.mjs - SPOREWOOD 2 in the page, quickly (claude/sporewood2, the greybox). A smoke test of the rule, its machines and the boss's wake, not a playtest:
//   ?level=spore lands in play in the glade (no god mode); the glade's bud grows under a hero who stops on it; a DARK bud does not grow unlit, a struck lantern cap lights
//   it and it grows; a lurker in the light is dazzled (out of his cap); a mend puff mends; a struck puffball hangs a spring spore that throws a hero who lands on it;
//   a seed cap grows when struck (and not when stood on); a plunge onto the root knot opens its door; the area banner names each area; THE MOTHER CAP wakes.
//   No page error.
//   node tools/sporewood2-probe.mjs        (PORT=<your port>)
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=spore&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.sporewood2&&location.search.includes("spore")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor(BK.P.y/16)],start:[BK.L.START.x,BK.L.START.y],god:!!BK.god}:null', 4000).catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=spore lands in play in the glade, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='spore');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(20);
  const SW=BK.sporewood(),P=BK.P,K=BK.keys,tp=(x,y)=>{BK.tp(x,y);P.vx=0;P.vy=0;BK.sim(4);},E=()=>BK.enemies(),M=()=>BK.movers().filter(m=>m.kind==='growcap');
  const capAt=x=>M().find(m=>Math.abs(m.x/16-x)<0.6);const onCap=m=>{BK.tp(m.x/16+1,Math.floor(m.y/16)-1);P.x=m.x+16;P.vx=0;P.vy=0;for(let i=0;i<20;i++)BK.sim(1);return P.onMover===m;};const swing=f=>{P.face=f;BK.press('atk');for(let i=0;i<24;i++)BK.sim(1);};
  const clear=(x0,x1)=>{for(const e of E())if(e.alive&&!e.maxHp&&e.x>x0*16&&e.x<x1*16)e.alive=false;};
  /* THE GLADE's BUD: stop on it and it grows */
  clear(15,40);const b=capAt(28);out.onBud=onCap(b);BK.sim(90);out.bud={state:b.state,k:+b.k.toFixed(2),y:Math.floor(P.y/16)};
  /* A DARK BUD: stood on unlit, nothing; its lantern struck, it grows */
  clear(110,160);const d=capAt(136);onCap(d);BK.sim(60);out.darkUnlit={state:d.state,lit:!!d.lit};
  const lt=BK.props().find(p=>p.t==='glowbud'&&Math.abs(p.x/16-133.5)<1);tp(132.4,38);swing(1);BK.sim(5);out.lantern={lit:+(lt.lit||0).toFixed(1)};
  onCap(d);BK.sim(90);out.darkLit={state:d.state,lit:!!d.lit};
  /* A LURKER IN THE LIGHT IS DAZZLED */
const lk=E().find(e=>e.t==='lurker'&&Math.abs(e.x/16-125.5)<2);if(lk){lk.alive=true;lk.mode='hide';}
  const lt2=BK.props().find(p=>p.t==='glowbud'&&Math.abs(p.x/16-120.5)<1);tp(119.4,38);swing(1);BK.sim(10);out.dazzle=lk?{mode:lk.mode,dazzled:lk.dazzled}:'no lurker';
  /* A MEND PUFF */
  tp(5,40);P.hp=Math.round(P.maxHp*0.4);const h0=P.hp;tp(8.5,40);BK.sim(90);out.mend={from:Math.round(h0/P.maxHp*100),to:Math.round(P.hp/P.maxHp*100),state:SW.read().mends[0]};
  /* A PUFFBALL: struck, it hangs a spring spore; landing on it throws */
  clear(195,215);tp(201.3,28);swing(1);BK.sim(5);const sp=SW.read().springs;out.spring={n:sp.length};
  if(sp.length){tp(202.5,24);P.vy=0;let minY=P.y,hit=false;for(let i=0;i<90;i++){BK.sim(1);if(P.vy<-300)hit=true;minY=Math.min(minY,P.y);}out.spring.bounced=hit;out.spring.rose=Math.round((sp[0].y-minY)/16*10)/10;}
  /* SEED CAPS: standing does nothing, a blow grows one */
  clear(355,370);const s1=capAt(363);onCap(s1);BK.sim(60);out.seedStood=s1.state;tp(362.2,11);swing(1);BK.sim(80);out.seedStruck={state:s1.state,k:+s1.k.toFixed(2)};
  /* THE ROOT KNOT: a blade clanks; a plunge opens it */
  clear(368,400);const kn=SW.read().knots[0];const door=()=>BK.L.grid[(kn.y+2)*BK.L.W+379];
  tp(375,5);swing(1);BK.sim(10);out.knotBlade={open:SW.read().knots[0].open};
  tp(kn.x+0.5,kn.y);BK.sim(10);BK.press('jump');K.jump=true;for(let i=0;i<14;i++)BK.sim(1);K.jump=false;K.down=true;BK.press('atk');for(let i=0;i<60;i++)BK.sim(1);K.down=false;BK.sim(10);out.knotPlunge={open:SW.read().knots[0].open,door:door()};
  /* THE AREA BANNERS */
  const names=[];for(const [x,y] of [[50,36],[150,34],[240,22],[320,15],[380,6]]){tp(x,y);BK.sim(8);names.push(SW.read().banner);}out.names=names;
  /* THE MOTHER CAP wakes */
  clear(400,470);tp(415,14);BK.god=true;for(let i=0;i<240;i++)BK.sim(1);const mo=E().find(e=>e.t==='mother');out.mother=mo?{mode:mo.mode,active:!!BK.bossActive,hp:mo.hp}:null;
  BK.manualSimulation=false;return out;})()`, 60000);
  console.log(JSON.stringify(r));
  ok(r.bud.state !== 'bud' && r.bud.k > 0.5, "the glade's bud grows under a hero who stops on it: " + JSON.stringify(r.bud));
  ok(r.darkUnlit.state === 'bud' && !r.darkUnlit.lit, 'a dark bud does not grow unlit: ' + JSON.stringify(r.darkUnlit));
  ok(r.lantern.lit > 5, 'a blow lights the lantern cap: ' + JSON.stringify(r.lantern));
  ok(r.darkLit.state !== 'bud' && r.darkLit.lit, 'lit, the dark bud grows under him: ' + JSON.stringify(r.darkLit));
  ok(r.dazzle && r.dazzle.mode === 'rest' && r.dazzle.dazzled, 'a lurker in the light is dazzled out of his cap: ' + JSON.stringify(r.dazzle));
  ok(r.mend.to >= r.mend.from + 6, 'a mend puff mends (SP.mend, 8%): ' + JSON.stringify(r.mend));
  ok(r.spring.n >= 1 && r.spring.bounced, 'a struck puffball hangs a spring spore that throws a hero: ' + JSON.stringify(r.spring));
  ok(r.seedStood === 'bud' && r.seedStruck.state !== 'bud', 'a seed cap does not grow when stood on, and grows when struck: ' + r.seedStood + ' ' + JSON.stringify(r.seedStruck));
  ok(!r.knotBlade.open && r.knotPlunge.open && r.knotPlunge.door === 0, 'the root knot turns a blade and opens to a plunge (its door gone): ' + JSON.stringify([r.knotBlade, r.knotPlunge]));
  ok(JSON.stringify(r.names) === JSON.stringify(['THE MYCELIUM GLADE', 'THE LANTERN HOLLOWS', 'THE PUFFBALL BOG', 'THE WEB LARDER', "THE MOTHER'S KNOT"]), 'the area banners: ' + JSON.stringify(r.names));
  ok(r.mother && r.mother.active, 'THE MOTHER CAP wakes: ' + JSON.stringify(r.mother));
  const errs = pg.errors || [];
  ok(!errs.length, 'no page error' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
} finally { pg.close(); }
console.log(bad ? 'sporewood2-probe: ' + bad + ' FAIL' : 'sporewood2-probe: all green');
process.exit(bad ? 1 : 0);
