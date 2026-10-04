// tools/redgorge-probe.mjs - THE RED GORGE in the page, quickly (claude/redgorge): ?level=redgorge lands on its entrance; the flood comes on its clock
// (a horn, then the torrent) and sweeps a hero in the channel; a wheel shuts a gate and the next flood banks behind it (the channel under it stays dry);
// a release washes THE JAM out; a basket rides up on running water and sinks back; four feathers open THE OLD NEST's vault; THE GREAT RED CRAB wakes,
// walks out of the channel at the horn (a natural flood never opens him), and a release with him in the channel throws him on his back (open 3 s or
// more; a blow there lands x1.6, outside it a twentieth). A smoke test, not a suite check:
//   node tools/redgorge-probe.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.evalp('(()=>{setTimeout(()=>location.assign("/?level=redgorge&hero=knight"),0);return 1})()', 8000).catch(() => {});
  let jump = null; for (let i = 0; i < 200 && !jump; i++) { await new Promise(r => setTimeout(r, 150)); jump = await pg.evalp('typeof BK==="object"&&BK.L&&BK.L.redgorge&&location.search.includes("redgorge")?{state:BK.state,at:[Math.floor(BK.P.x/16),Math.floor((BK.P.y-1)/16)],start:[BK.L.START.x,BK.L.START.y],god:BK.god}:null', 3000).catch(() => null); }
  ok(jump && jump.state === 'play' && Math.abs(jump.at[0] - jump.start[0]) <= 1 && !jump.god, '?level=redgorge lands in play at its entrance, no god mode: ' + JSON.stringify(jump));
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='redgorge');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(30);
  const G=()=>BK.redgorge(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);BK.sim(4);},keep=new Set(['gorgecrab']);
  for(const e of BK.enemies())if(!keep.has(e.t))e.alive=false;
  const till=(ph,n=60*30)=>{for(let i=0;i<n&&G().phase!==ph;i++){P.hp=P.maxHp;BK.sim(1);}};
  out.loaded={channels:G().channels.length,gates:G().gates.map(g=>g.id),wheels:G().wheels.length,jams:G().jams.length,baskets:BK.movers().filter(m=>m.gorge).length};
  /* THE FLOOD: a hero in the channel at the gorge's floor is swept when it runs */
  till('dry');till('horn');out.horn=G().phase;tp(24,165);const s0=G().n.swept;till('flood');BK.sim(10);out.swept=G().n.swept-s0;
  /* THE FALLS' GATE: shut, the next flood banks behind it, and the falls' rope under it stays dry */
  till('dry');tp(28,135);P.face=-1;BK.press('talk');BK.sim(3);out.shut=G().gates.find(g=>g.id==='falls').state;
  BK.god=true;tp(24,125);P.climb=true;const s1=G().n.swept;till('flood');for(let i=0;i<60;i++){P.x=24*16+8;P.y=126*16;P.vy=0;P.climb=true;BK.sim(1);}out.fallsHeld={state:G().gates.find(g=>g.id==='falls').state,swept:G().n.swept-s1};
  /* THE JAM: shut its gate, let a flood bank, release - the burst washes it out */
  till('dry');tp(28,69);P.face=-1;BK.press('talk');BK.sim(3);till('flood');BK.sim(5);out.jamGate=G().gates.find(g=>g.id==='jam').state;
  till('dry');tp(28,69);BK.press('talk');BK.sim(40);const Lg=BK.L.grid,W=BK.L.W;out.jam={open:G().jams[0].open,cell:Lg[66*W+24]};
  /* A BASKET: it rides up on running water, and sinks back after */
  const m=BK.movers().find(q=>q.gorge==='ledges');m.y=m.y0;till('dry');till('flood');for(let i=0;i<400&&G().phase==='flood'&&m.y>m.y1;i++)BK.sim(1);   /* (until it tops out or the flood ends: not a fixed frame count - the world runs at 60% so the 2.4 s flood is 240 frames, and a basket needs 200) */out.basketUp=[Math.round(m.y),m.y1];for(let i=0;i<60*12;i++)BK.sim(1);out.basketDown=G().phase==='flood'?'flood':Math.round(m.y)>m.y1;
  /* THE FEATHERS and THE OLD NEST */
  for(const pr of BK.props().filter(p=>p.t==='stray'&&!p.got)){BK.P.x=pr.x;BK.P.y=pr.y;BK.sim(3);}out.feathers=BK.village().saved();
  tp(13,31);BK.press('talk');BK.sim(3);out.nest={open:G().nest.open,vault:G().vault.map(v=>v.open),cell:Lg[29*W+9]};
  return out;})()`, 300000);
  ok(r.loaded.channels === 2 && r.loaded.gates.length === 4 && r.loaded.wheels === 6 && r.loaded.jams === 1 && r.loaded.baskets === 3, 'the gorge as built: 2 channels, 4 gates, 6 wheels, a jam, 3 baskets ' + JSON.stringify(r.loaded));
  ok(r.horn === 'horn' && r.swept >= 1, 'the horn, then the flood sweeps a hero in the channel ' + JSON.stringify({ horn: r.horn, swept: r.swept }));
  ok(r.shut === 'shut', 'E at the falls\' wheel shuts its gate');
  ok(r.fallsHeld.state === 'full' && r.fallsHeld.swept === 0, 'the shut gate holds the next flood: it banks, and the rope under it stays dry ' + JSON.stringify(r.fallsHeld));
  ok(r.jamGate === 'full' && r.jam.open && r.jam.cell === 0, 'the jam\'s gate banks a flood; released, the burst washes THE JAM out ' + JSON.stringify(r.jam));
  ok(r.basketUp[0] === r.basketUp[1] && r.basketDown === true, 'a basket rides up on the running water, and sinks back after ' + JSON.stringify([r.basketUp, r.basketDown]));
  ok(r.feathers === 4 && r.nest.open && r.nest.vault.every(Boolean) && r.nest.cell === 0, 'four feathers open THE OLD NEST\'s vault ' + JSON.stringify(r.nest));
  const t = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='redgorge'));BK.state='play';BK.god=true;BK.sim(10);const P=BK.P,G=()=>BK.redgorge();
  for(const e of BK.enemies())if(e.t!=='gorgecrab')e.alive=false;
  const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss;out.crab={active:BK.bossActive,t:b&&b.t};
  /* a minute of him, the gate open, the floods running: he never opens, and he is never caught in a natural flood */
  let alone=0,caught=0;for(let i=0;i<60*60;i++){P.hp=P.maxHp;P.x=A.x0+40;BK.sim(1);alone=Math.max(alone,b.open||0);const w=BK.gorgeCrabHands().water();if(w.running&&BK.gorgeCrab().inChannel)caught++;}
  out.alone=alone;out.caught=caught;
  /* the wheel: shut, a flood banks; he is drawn into the channel; release - he goes over */
  const wl=A.wheels[0],dam=()=>G().gates.find(g=>g.id==='dam');
  for(let i=0;i<60*40&&dam().state!=='full';i++){P.hp=P.maxHp;P.x=wl;P.face=1;if(dam().state==='open'&&i%20===0)BK.press('talk');BK.sim(1);}out.banked=dam().state;
  let opened=0;for(let i=0;i<60*40&&!opened;i++){P.hp=P.maxHp;const c=BK.gorgeCrab(),far=c.x<(A.ch[0]+A.ch[1])/2?A.wheels[1]:A.wheels[0];P.x=far;P.face=Math.sign(c.x-far)||1;if(dam().state==='full'&&c.inChannel&&c.mode!=='open')BK.press('talk');if(dam().state==='open'&&i%30===0)BK.press('talk');BK.sim(1);if(b.mode==='open')opened=1;}
  out.opened=opened;let op=0;for(let i=0;i<60*14&&b.mode==='open';i++){op+=1/60;if(i===10){const h0=b.hp;BKT.hurtAs('light',b,40,b.x-10,false);out.openHit=+(h0-b.hp).toFixed(2);}P.hp=P.maxHp;BK.sim(1);}out.openFor=+op.toFixed(2);
  BK.sim(30);const h1=b.hp;BKT.hurtAs('light',b,40,b.x-10,false);out.chipHit=+(h1-b.hp).toFixed(2);out.n=BK.gorgeCrab().n;
  return out;})()`, 300000);
  ok(t.crab.active && t.crab.t === 'gorgecrab', 'THE GREAT RED CRAB wakes on the old dam');
  ok(t.alone === 0, 'a minute of him with the floods running opens nothing (frames a natural flood ran over him: ' + t.caught + ') ' + JSON.stringify({ alone: t.alone, caught: t.caught }));
  ok(t.banked === 'full' && t.opened && t.openFor >= 3, 'the dam\'s gate banks a flood; released with him in the channel, he goes on his back for 3 s or more ' + JSON.stringify({ banked: t.banked, openFor: t.openFor, n: t.n }));
  ok(t.openHit > 40 * 1.4 && t.chipHit <= 40 * 0.05 + 0.01, 'a blow on his back lands x1.6, outside it a scratch: ' + t.openHit + ' / ' + t.chipHit);
  /* THE FIX LANE (claude/redgorge, 10-02): the flood takes foes; the jam's knives leap when its gate shuts; the camera looks up a rope; a gorge slinger
     throws only at what the camera shows */
  const f = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='redgorge'));BK.state='play';BK.god=true;BK.sim(10);const P=BK.P,G=()=>BK.redgorge();
  const till=(ph,n=60*30)=>{for(let i=0;i<n&&G().phase!==ph;i++){P.hp=P.maxHp;BK.sim(1);}};
  /* the knife idling on bridge one's span: a hero near, the flood drops him through the bridge and hurts him half his life */
  const k=BK.enemies().find(e=>e.rgSquad==='mouthTop');BK.tp(10,141);BK.sim(2);till('dry');till('horn');const hp0=k.hp,y0=k.y;
  for(let i=0;i<60*12&&G().phase!=='dry';i++){P.hp=P.maxHp;BK.tp(10,141);k.st&&(k.st.cd=9);BK.sim(1);}out.flood={lost:+((hp0-k.hp)/hp0).toFixed(2),fell:Math.round((k.y-y0)/16),alive:k.alive,x:Math.floor(k.x/16)};
  /* a released burst takes a common foe outright: the jam-lip slinger goes with the jam */
  const sl=BK.enemies().find(e=>e.rgSquad==='jamSling');const drop=BK.enemies().filter(e=>e.rgSquad==='jamDrop');const dy0=drop.map(e=>e.y);
  till('dry');BK.tp(28,69);P.face=-1;BK.press('talk');BK.sim(3);out.jamShut=G().gates.find(g=>g.id==='jam').state;
  for(let i=0;i<60*6;i++){P.hp=P.maxHp;BK.sim(1);}out.leapt=drop.map((e,i)=>Math.round((e.y-dy0[i])/16));
  for(const e of drop)e.alive=false;
  till('flood');till('dry');BK.tp(28,69);BK.press('talk');BK.sim(60);out.burst={jam:G().jams[0].open,sling:sl.alive,taken:G().n.foesTaken};
  /* the camera looks up a rope (the narrows'), and not on the bridge under it */
  BK.tp(22,55);P.climb=true;for(let i=0;i<90;i++){P.climb=true;P.vy=0;P.y=56*16;BK.sim(1);}const up=P.y-BK.cam[1];
  P.climb=false;BK.tp(30,69);BK.sim(90);const flat=P.y-BK.cam[1];out.look={rope:Math.round(up),bridge:Math.round(flat)};
  /* THE PLAYTEST'S STALL (Daniel, 10-02: on bridge two, the basket was not seen as the way on): a glint on the basket, and after ten seconds
     standing about without headway, a nudge that names it */
  BK.load(LEVELS.findIndex(l=>l.id==='redgorge'));BK.state='play';BK.god=true;BK.sim(5);for(const e of BK.enemies())e.alive=false;
  const bm=BK.movers().find(q=>q.gorge==='ledges');for(let i=0;i<60*20&&bm.y<bm.y0-0.5;i++)BK.sim(1);
  BK.tp(23,117);BK.sim(3);out.glint=BK.redgorgeHands().read().glint;for(let i=0;i<60*20&&!BK.redgorgeHands().read().lastNudge;i++){BK.tp(23,117);BK.sim(1);}out.nudge=BK.redgorgeHands().read().lastNudge;
  return out;})()`, 300000);
  ok(f.glint === 'basket' && /BASKET/.test(f.nudge || ''), 'on bridge two the basket is glinted, and ten seconds without headway names it: ' + JSON.stringify({ glint: f.glint, nudge: f.nudge }));
  ok(f.flood.lost >= 0.45 && f.flood.fell >= 1, 'a flood takes a bandit on a bridge in the channel: through the bridge, half his life ' + JSON.stringify(f.flood));
  ok(f.jamShut === 'shut' && f.leapt.every(d => d >= 6), 'the jam\'s gate shut, its two knives leap down the slot onto bridge four ' + JSON.stringify({ shut: f.jamShut, leapt: f.leapt }));
  ok(f.burst.jam && !f.burst.sling && f.burst.taken >= 1, 'the burst that breaks the jam takes the jam-lip slinger outright ' + JSON.stringify(f.burst));
  ok(f.look.rope - f.look.bridge >= 40, 'on a rope the camera looks up the climb (hero this far under the screen\'s top: rope ' + f.look.rope + ' px, bridge ' + f.look.bridge + ' px)');
  if (pg.errors.length) { ok(false, 'page errors: ' + pg.errors.slice(0, 3).join(' | ')); }
} finally { pg.close(); }
console.log(bad ? bad + ' FAILED' : 'redgorge-probe: all passed'); process.exitCode = bad ? 1 : 0;
