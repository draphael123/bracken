/* tools/lamplit2.mjs - THE LAMPLIT STREET 2 (claude/lamplit2, Daniel 10-08 brief, scratch/brief-lamplit2.md). In the page:
   THE LAMPREEVE (the mini)
     - a lamp he put out, RELIT beside him (fire carried, a real swing on it), STUNS him: blinded, open > 2 s, a blow x1.7
     - the stun ends in a told WARD: a second relight inside it opens nothing; relit far from him, nothing
     - out of his openings his coat takes 0.45 of a blow (B15: never under 0.4); his DOUSE is gone, the OIL FLASK lands where its
       shadow held (a hero who stays is hurt, a hero who left is not) and leaves a SLICK
   THE TOLLMASTER (the boss)
     - COLLECT THE TOLL left alone takes the lamp dark; a blow on the box keeps it lit
     - a lamp RELIT beside him: STUNNED and BURNING, open > 2.5 s, a blow x2, his health falling by itself while he burns; then a WARD
     - outside an opening a blow lands at 0.4 (B15); three blows on one corner of the bier and its bearer stumbles: he TILTS, open
     - THE SCALES swung HIGH pass over a ducked hero and strike a standing one; THE SEAL stamps the shadow it held and leaves WAX
     - at 30% the square FLOODS: the lit lamps are air, and the WRIT drowns the lamps on one half (no air there)
     - the bearers are part of him: phase two spawns no adds; THE DARK and the coin weight are gone
   THE LEVEL
     - LIGHT THE WAY: four dead street lamps hold a vault pocket that is there only while they burn
     - YOUR FLAME DROWNS: under the water the fire in your hand burns down WICK_DRY/WICK_WET times as fast
     - THE WATCH HATE LIGHT: a relit lamp's flare blinds a watchman beside it (his guard down)
     - THE TOLL GATE: shut until its lamp is lit, then open (the required relight before his square)
     node tools/lamplit2.mjs            (PORT from tools/ports.mjs) */
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); const fails = [], ok = (c, m) => { if (!c) fails.push(m); else console.log('  ok  ' + m); };
let r;
try {
  r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};const H={get oil(){return BKT.lampHands().oil},get wax(){return BKT.lampHands().wax},get airRooms(){return BKT.lampHands().airRooms},get WICK_DRY(){return BKT.lampHands().WICK_DRY},get WICK_WET(){return BKT.lampHands().WICK_WET},drowned:p=>BKT.lampHands().drowned(p),nearAir:(x,y)=>BKT.lampHands().nearAir(x,y)};
  const idx=LEVELS.findIndex(l=>l.id==='lamplit');
  const hold=()=>{const k=BK.keys;k.left=k.right=k.up=k.down=k.jump=k.block=k.atk=false;};
  const start=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(5);BK.reset();};
  /* strike a lamp with fire in hand, from beside it */
  const relight=(lp)=>{BK.P.wick=14;BK.P.x=lp.x-12;BK.P.y=lp.y;BK.P.vx=0;BK.P.face=1;for(let i=0;i<60&&!lp.lit;i++){hold();BK.P.wick=14;BK.P.x=lp.x-12;if(BK.P.atk<0&&i%3===0)BK.press('atk');BK.sim(1);}return lp.lit;};
  /* ---------------- THE LAMPREEVE ---------------- */
  { start();const M=BK.L.mini;const b=BK.enemies().find(e=>e.t==='lampreeve'&&e.alive);for(const e of BK.enemies())if(e!==b&&!e.maxHp&&!e.mini)e.alive=false;
    BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(150);const o={};
    const lampsIn=()=>BK.props().filter(p=>p.t==='lantern'&&p.city&&p.x>M.x0-8&&p.x<M.x1+8);
    const calm=()=>{b.mode='stalk';b.modeT=5;b.open=0;b.ward=0;b.snuffT=99;b.lungeT=99;b.sweepT=99;b.flaskT=99;b.hookT=99;b.target=null;b.phase=1;b.hp=b.maxHp;};
    let L=lampsIn();o.lamps=L.length;const t=L[2];for(const p of L){p.lit=true;p.gut=0;}t.lit=false;
    calm();b.x=t.x+40;o.lit=relight(t);o.mode=b.mode;o.kind=b.flareKind;o.open=+(b.open||0).toFixed(2);
    {const h0=b.hp;BKT.hurtAs('cut',b,10,b.x-20,false);o.openBlow=Math.round(h0-b.hp);}
    for(let i=0;i<200&&b.mode==='blinded';i++){hold();BK.sim(1);}o.wardAfter=+(b.ward||0).toFixed(2);
    t.lit=false;b.x=t.x+40;b.modeT=5;relight(t);o.inWard={mode:b.mode,open:+(b.open||0).toFixed(2)};
    calm();t.lit=false;b.x=t.x+220;relight(t);o.far={mode:b.mode,open:+(b.open||0).toFixed(2)};
    calm();{const h0=b.hp;BKT.hurtAs('cut',b,10,b.x-20,false);o.shutBlow=h0-b.hp;}
    /* THE FLASK: a hero who stays on its shadow is hurt; one who leaves it after it holds is not */
    const flask=(leave)=>{calm();for(const p of L){p.lit=true;p.gut=0;}b.x=(M.x0+M.x1)/2;BK.P.x=b.x+110;BK.P.y=M.floor;BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;b.flaskT=0;b.modeT=0;
      let told=null,mark=null,hp0=BK.P.hp,left=false;for(let i=0;i<200;i++){hold();if(b.mode==='flaskTell'){told=b.mode;mark=BK.markShown?BK.markShown(b):null;b.flaskT=99;}
        if(leave&&(b.flask||(b.mode==='flaskTell'&&b.modeT<0.25))&&!left){BK.P.x=b.flaskX+60;left=true;} BK.sim(1);if(told&&!b.flask&&b.mode!=='flaskTell'&&b.mode!=='flask')break;}
      const res={told,mark,hurt:Math.round(hp0-BK.P.hp),slicks:H.oil.length};BK.god=true;BK.P.hp=BK.P.maxHp;BK.P.dead=0;return res;};
    o.flaskStay=flask(false);o.flaskLeave=flask(true);
    {calm();b.flaskT=0;b.sweepT=0;b.hookT=0;b.lungeT=0;const seen=new Set();for(let i=0;i<1800;i++){hold();BK.P.x=b.x+90;BK.sim(1);seen.add(b.mode);}o.modes=[...seen];}
    out.reeve=o; }
  /* ---------------- THE TOLLMASTER ---------------- */
  { start();const A=BK.L.arena;const b=BK.enemies().find(e=>e.t==='tollmaster');for(const e of BK.enemies())if(e!==b&&!e.maxHp&&!e.mini)e.alive=false;
    BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(240);const o={};o.awake=b.mode;
    const lampsIn=()=>BK.props().filter(p=>p.t==='lantern'&&p.city&&p.x>A.x0-8&&p.x<A.x1+8);
    const calm=()=>{b.mode='borne';b.modeT=9;b.open=0;b.ward=0;b.openKind=null;b.collectT=99;b.scalesT=99;b.sealT=99;b.writT=99;b.ledgerT=99;b.rodT=99;b.stagger=0;b.vx=0;b.hp=b.maxHp;b.phase=b.phase||1;if(b.corners)for(const c of b.corners){c.n=0;c.cd=0;}};
    let L=lampsIn();o.lamps=L.length;for(const p of L){p.lit=true;p.gut=0;}
    /* collect left alone: the lamp goes dark */
    calm();b.x=(A.x0+A.x1)/2;BK.P.x=A.x0+24;BK.P.y=A.floor;b.modeT=0;b.collectT=0;let lamp=null;
    for(let i=0;i<240;i++){hold();BK.P.x=A.x0+24;BK.sim(1);if(b.collectLamp)lamp=b.collectLamp;if(lamp&&b.mode==='borne'&&b.modeT<0.45)break;}o.collectAlone={lamp:!!lamp,lit:lamp?!!lamp.lit:null};
    /* collect, the box struck: the lamp keeps its flame */
    for(const p of L){p.lit=true;p.gut=0;}calm();b.modeT=0;b.collectT=0;lamp=null;let struck=false;
    for(let i=0;i<240;i++){hold();BK.P.x=A.x0+24;if(b.mode==='collect'&&!struck){struck=true;BKT.hurtAs('cut',b,5,b.x-20,false);}BK.sim(1);if(b.collectLamp)lamp=b.collectLamp;if(struck&&b.mode==='borne')break;}
    o.collectStruck={struck,lit:lamp?!!lamp.lit:null};
    /* outside an opening: 0.4 */
    calm();{const h0=b.hp;BKT.hurtAs('cut',b,10,b.x-20,false);o.shutBlow=Math.round((h0-b.hp)*10)/10;}
    /* the relit flare beside him */
    for(const p of L){p.lit=true;p.gut=0;}calm();const t=L.slice().sort((a,c)=>Math.abs(a.x-(A.x0+A.x1)/2)-Math.abs(c.x-(A.x0+A.x1)/2))[0];t.lit=false;b.x=t.x+40;
    relight(t);o.relit={mode:b.mode,kind:b.openKind,open:+(b.open||0).toFixed(2)};{const h0=b.hp;BKT.hurtAs('cut',b,10,b.x-20,false);o.openBlow=h0-b.hp;}
    {const h0=b.hp;for(let i=0;i<60;i++){hold();BK.P.x=A.x0+24;BK.sim(1);}o.burnt=h0-b.hp;}
    for(let i=0;i<900&&b.open>0;i++){hold();BK.P.x=A.x0+24;BK.sim(1);}o.wardAfter=+(b.ward||0).toFixed(2);
    t.lit=false;b.x=t.x+40;b.modeT=9;relight(t);o.inWard={mode:b.mode,open:+(b.open||0).toFixed(2)};
    /* the bearers: three blows on one corner */
    calm();b.onFoot=false;b.phase=1;b.hp=b.maxHp;for(let i=0;i<3;i++){BKT.hurtAs('cut',b,4,b.x-30,false);BK.sim(2);}o.tilt={mode:b.mode,kind:b.openKind,open:+(b.open||0).toFixed(2)};
    /* the scales, high: a ducked hero under it, a standing one struck */
    const scales=(duck)=>{calm();b.onFoot=true;b.face=1;b.x=A.x0+120;BK.P.x=b.x+50;BK.P.y=A.floor;BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;b.scaleN=1;b.scalesT=0;b.modeT=0;
      let told=null,hp0=BK.P.hp;for(let i=0;i<120;i++){hold();if(duck)BK.keys.down=true;BK.P.x=b.x+50;if(b.mode==='scalesHighTell'){told=b.mode;b.scalesT=99;}BK.sim(1);if(told&&b.mode==='borne')break;}
      const res={told,hurt:Math.round(hp0-BK.P.hp)};BK.god=true;BK.P.hp=BK.P.maxHp;BK.P.dead=0;return res;};
    o.scalesStand=scales(false);o.scalesDuck=scales(true);
    /* the seal: it follows, holds and stamps; wax after */
    {calm();b.onFoot=true;b.phase=2;b.x=A.x0+60;BK.P.x=A.x0+200;BK.P.y=A.floor;BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;b.sealT=0;b.modeT=0;let told=null,hp0=BK.P.hp;
      for(let i=0;i<120;i++){hold();if(b.mode==='sealTell'){told=b.mode;b.sealT=99;}BK.sim(1);if(told&&b.mode==='borne')break;}o.seal={told,hurt:Math.round(hp0-BK.P.hp),wax:H.wax.length};BK.god=true;BK.P.hp=BK.P.maxHp;BK.P.dead=0;}
    /* phase two: no adds */
    {const n0=BK.enemies().filter(e=>e.alive&&e!==b).length;calm();b.phase=1;b.onFoot=false;b.hp=Math.floor(b.maxHp*0.6);b.modeT=0;for(let i=0;i<200;i++){hold();BK.P.x=A.x0+24;BK.sim(1);}
      o.p2={phase:b.phase,onFoot:!!b.onFoot,adds:BK.enemies().filter(e=>e.alive&&e!==b).length-n0};}
    /* phase three: the flood, the air, the writ */
    {calm();b.phase=2;b.onFoot=true;b.hp=Math.floor(b.maxHp*0.28);b.modeT=0;for(let i=0;i<600;i++){hold();BK.P.x=A.x0+24;BK.sim(1);}
      const sq=(BK.L.pools||[]).find(q=>q.square);o.p3={phase:b.phase,flooded:!!b.flooded,swim:!!(sq&&sq.swim),top:sq?Math.round(sq.y):null,floor:A.floor};
      for(const p of L){p.lit=true;p.gut=0;}const l0=L[0];o.p3.airAtLamp=!!H.nearAir(l0.x,l0.y-40);
      calm();b.writT=0;b.modeT=0;BK.P.x=l0.x;for(let i=0;i<120&&!b.writ;i++){hold();BK.P.x=l0.x;BK.sim(1);}
      o.p3.writ=!!b.writ;o.p3.drowned=!!(b.writ&&H.drowned(l0));o.p3.airInWrit=!!H.nearAir(l0.x,l0.y-40);}
    /* THE BELL HOUSINGS (claude/airpockets): four iron-hooded alcoves in the roof; air while the square is flooded, spent after ~2.5 s of drinking, drowned by the writ on their half */
    {calm();b.writ=null;b.writT=99;const hs=H.airRooms.filter(r=>r.toll);const q={n:hs.length,sides:[0,0]};const mid=(A.x0+A.x1)/2;for(const r of hs)q.sides[(r.l+r.r)/2<mid?0:1]++;
      const r0=hs[0],mx=(r0.l+r0.r)/2;q.air=!!H.nearAir(mx,r0.b-8);
      const sw=()=>{BK.P.x=mx;BK.P.y=r0.b-6;BK.P.vx=0;BK.P.vy=0;BK.P.breath=0.5;hold();};
      let t=0;for(let i=0;i<60*4&&!r0.spent;i++){sw();BK.sim(1);t++;}q.spentAfter=+(t/60).toFixed(2);q.spent=!!r0.spent;q.airWhenSpent=!!H.nearAir(mx,r0.b-8);q.breathGot=+(BK.P.breath||0).toFixed(1);
      for(let i=0;i<60*16&&r0.spent;i++){sw();BK.sim(1);}q.back=!r0.spent&&!!H.nearAir(mx,r0.b-8);
      /* the writ on the left half drowns the left housings and leaves the right */
      const lh=hs.filter(r=>(r.l+r.r)/2<mid),rh=hs.filter(r=>(r.l+r.r)/2>=mid);b.writ={x0:A.x0,x1:mid,t:4,max:4};
      q.leftDrowned=lh.every(r=>!H.nearAir((r.l+r.r)/2,r.b-8));q.rightAir=rh.every(r=>!!H.nearAir((r.l+r.r)/2,r.b-8));b.writ=null;BK.P.x=b.x+60;BK.P.y=A.floor;BK.P.breath=6;o.pockets=q;}
    {const seen=new Set();calm();b.collectT=0;b.scalesT=0;b.ledgerT=0;b.rodT=0;b.sealT=0;b.writT=0;b.modeT=0;for(let i=0;i<2400;i++){hold();BK.P.x=b.x+60;BK.P.y=A.floor;BK.P.vy=0;BK.sim(1);seen.add(b.mode);if(i%600===0)for(const p of L){p.lit=true;p.gut=0;}}o.modes=[...seen];}
    out.toll=o; }
  /* ---------------- THE LEVEL ---------------- */
  { start();const o={};const rooms=H.airRooms.filter(r=>r.lampX!==undefined);o.pockets=rooms.length;
    const r0=rooms[0];BK.sim(2);const lp=r0&&r0.lamp;o.pocketDark=!!(r0&&r0.goneUntil>0)&&!!lp&&!lp.lit;
    if(lp){lp.lit=true;BK.sim(2);o.pocketLit=!(r0.goneUntil>0);const mx=(r0.l+r0.r)/2;o.airInPocket=!!H.nearAir(mx,r0.t+12);lp.lit=false;BK.sim(2);o.pocketGone=r0.goneUntil>0;}
    /* the toll gate */
    const g=BK.props().find(p=>p.t==='lantern'&&p.gate!==undefined);const LL=BK.L,at=(x,y)=>LL.grid[y*LL.W+x];
    o.gate={col:g?g.gate:null,shut:g?at(g.gate,20)!==0:null};if(g){relight(g);BK.sim(3);o.gate.lit=!!g.lit;o.gate.open=at(g.gate,20)===0;}
    /* the watch hate light */
    const w=BK.enemies().find(e=>e.t==='watch'&&e.alive&&Math.abs(e.y-21*16-16)<20);const dl=BK.props().find(p=>p.t==='lantern'&&p.city&&!p.lit&&w&&Math.abs(p.x-w.x)<70);
    if(w&&dl){w.mode='walk';w.stagger=0;relight(dl);o.watch={flare:+(w.flareT||0).toFixed(2),guard:w.guardT||0};}else o.watch={missing:true};
    /* your flame drowns */
    { const pool=(LL.pools||[]).find(p=>p.swim&&!p.square);const x=(pool.x0+pool.x1)/2,y=pool.bottom-40;let wetRate=null,dryRate=null;
      BK.P.x=x;BK.P.y=y;BK.P.wick=14;BK.sim(30);const w0=BK.P.wick;BK.sim(30);wetRate=(w0-BK.P.wick)/0.5;
      BK.tp(10,9);BK.sim(20);BK.P.wick=14;BK.sim(30);const d0=BK.P.wick;BK.sim(30);dryRate=(d0-BK.P.wick)/0.5;o.wick={wetRate:+wetRate.toFixed(2),dryRate:+dryRate.toFixed(2),ratio:H.WICK_DRY/H.WICK_WET,swim:!!BK.P.swim}; }
    out.level=o; }
  return out;})()`, 600000);
} finally { pg.close(); }
const R = r.reeve, T = r.toll, V = r.level;
console.log(JSON.stringify(r, null, 0).slice(0, 4000));
console.log('THE LAMPREEVE');
ok(R.lit && R.mode === 'blinded' && R.kind === 'relit' && R.open > 2, 'a lamp relit beside him stuns him (blinded, open > 2 s): ' + JSON.stringify({ lit: R.lit, mode: R.mode, kind: R.kind, open: R.open }));
ok(R.openBlow >= 16, 'stunned, a blow lands x1.7: ' + R.openBlow);
ok(R.wardAfter > 2, 'the stun ends in a told ward: ' + R.wardAfter);
ok(R.inWard.mode !== 'blinded' && !(R.inWard.open > 0), 'a relight inside the ward opens nothing: ' + JSON.stringify(R.inWard));
ok(R.far.mode !== 'blinded' && !(R.far.open > 0), 'relit far from him, nothing: ' + JSON.stringify(R.far));
ok(R.shutBlow >= 4 && R.shutBlow <= 5, 'out of his openings his coat takes 0.45 (B15: never under 0.4): ' + R.shutBlow);
ok(R.flaskStay.told === 'flaskTell' && R.flaskStay.mark === '!!' && R.flaskStay.hurt > 0 && R.flaskStay.slicks > 0, 'the oil flask is told red, lands on a hero who stayed, and leaves a slick: ' + JSON.stringify(R.flaskStay));
ok(R.flaskLeave.told === 'flaskTell' && R.flaskLeave.hurt === 0, 'a hero who left its held shadow is not hurt: ' + JSON.stringify(R.flaskLeave));
ok(!R.modes.includes('douse') && !R.modes.includes('drawTell'), 'his douse is gone: ' + R.modes.join(','));
console.log('THE TOLLMASTER');
ok(T.collectAlone.lamp && T.collectAlone.lit === false, 'COLLECT THE TOLL left alone takes the lamp dark: ' + JSON.stringify(T.collectAlone));
ok(T.collectStruck.struck && T.collectStruck.lit === true, 'a blow on the box keeps the lamp lit: ' + JSON.stringify(T.collectStruck));
ok(T.shutBlow >= 3.5 && T.shutBlow <= 4.5, 'outside an opening a blow lands at 0.4 (B15): ' + T.shutBlow);
ok(T.relit.mode === 'flared' && T.relit.kind === 'relit' && T.relit.open > 2.5, 'a lamp relit beside him: stunned and burning, open > 2.5 s: ' + JSON.stringify(T.relit));
ok(T.openBlow >= 18, 'stunned, a blow lands x2: ' + T.openBlow);
ok(T.burnt > 0, 'while he burns his health falls by itself: ' + T.burnt);
ok(T.wardAfter > 2 && T.inWard.mode !== 'flared', 'the opening ends in a told ward, and a relight inside it opens nothing: ' + T.wardAfter + ' ' + JSON.stringify(T.inWard));
ok(T.tilt.mode === 'tilt' && T.tilt.open > 1, 'three blows on one corner of the bier: a bearer stumbles and he tilts, open: ' + JSON.stringify(T.tilt));
ok(T.scalesStand.told === 'scalesHighTell' && T.scalesStand.hurt > 0, 'THE SCALES swung high strike a standing hero: ' + JSON.stringify(T.scalesStand));
ok(T.scalesDuck.told === 'scalesHighTell' && T.scalesDuck.hurt === 0, 'and pass over a ducked one: ' + JSON.stringify(T.scalesDuck));
ok(T.seal.told === 'sealTell' && T.seal.hurt > 0 && T.seal.wax > 0, 'THE SEAL OF DEBT stamps the shadow it held and leaves wax: ' + JSON.stringify(T.seal));
ok(T.p2.phase === 2 && T.p2.onFoot && T.p2.adds <= 0, 'phase two: set down, on his feet, and no adds (the bearers are part of him): ' + JSON.stringify(T.p2));
ok(T.p3.phase === 3 && T.p3.flooded && T.p3.swim && T.p3.top < T.p3.floor - 200, 'phase three floods the square to its roof: ' + JSON.stringify(T.p3));
ok(T.p3.airAtLamp && T.p3.writ && T.p3.drowned && !T.p3.airInWrit, 'a lit lamp is air - until the writ drowns its half: ' + JSON.stringify(T.p3));
ok(T.pockets.n >= 3 && T.pockets.sides[0] >= 1 && T.pockets.sides[1] >= 1 && T.pockets.air, 'BELL HOUSINGS: at least three roof alcoves, on both halves of the square, holding air once it floods: ' + JSON.stringify(T.pockets));
ok(T.pockets.spent && T.pockets.spentAfter > 2 && T.pockets.spentAfter < 3.2 && !T.pockets.airWhenSpent && T.pockets.back, 'a housing is spent after ~2.5 s of drinking and fills again (not a place to sit): ' + JSON.stringify(T.pockets));
ok(T.pockets.leftDrowned && T.pockets.rightAir, 'the writ drowns the housings on the half it names and leaves the other: ' + JSON.stringify(T.pockets));
ok(!T.modes.some(m => /dark|toll$|tollTell|blackout/.test(m)), 'THE DARK and the coin weight are gone: ' + T.modes.join(','));
ok(['collect', 'scalesLow', 'scalesHigh', 'seal', 'ledger', 'rod'].filter(m => T.modes.includes(m)).length >= 5, 'his told moves come round: ' + T.modes.join(','));
console.log('THE LEVEL');
ok(V.pockets >= 3 && V.pocketDark && V.pocketLit && V.airInPocket && V.pocketGone, 'LIGHT THE WAY: a dead street lamp holds a vault pocket, there only while it burns: ' + JSON.stringify(V));
ok(V.gate.col && V.gate.shut && V.gate.lit && V.gate.open, 'THE TOLL GATE is shut until its lamp is lit: ' + JSON.stringify(V.gate));
ok(V.watch.flare > 2, 'THE WATCH HATE LIGHT: a relit lamp blinds the watchman beside it: ' + JSON.stringify(V.watch));
ok(V.wick.wetRate > V.wick.dryRate * 2, 'YOUR FLAME DROWNS: under the water the fire burns down faster: ' + JSON.stringify(V.wick));
if (fails.length) { console.log('\nFAIL (' + fails.length + ')\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('\nlamplit2: all green');
