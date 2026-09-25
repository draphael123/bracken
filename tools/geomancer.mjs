// tools/geomancer.mjs — THE GEOMANCER'S STONE NEVER TRAPS AND NEVER STAYS (docs/briefs/geomancer.md, A12 and C1). Played through
// her real input in the real page:
//   cap       five pieces raised as fast as she can: never more than three stand (four with THE FOURTH STONE)
//   crumble   every piece is gone after its life, and the level's grid is byte-for-byte what it was before she touched it
//   lift      stone that comes up under a small foe LIFTS it onto its top (nothing is ever inside the rock), and stone that comes up
//             under a boss stops short under it (the eruption STONE STEP uses)
//   body      a foe that turns up inside standing stone (spawned, thrown) crumbles that stone the next frame
//   reload    a level left while stone stands takes the stone with it: the new level's grid is untouched
//   heavy     FAULT LINE (her held X from round 3, 2026-09-24 - it was UPHEAVAL, a pillar on one spot): a crack races along the floor
//             ahead of her and hits EVERYTHING along it. The quickest release hits a foe TOUCHING her at once; a full charge runs its
//             full length (GEO.fault) and hits harder than the quickest; it stops at a gap (nothing past the pit is touched) and at a
//             wall (nothing behind the rock is touched); every foe along the line is hit, not just the first; and a full charge ends
//             in a rock spike that LAUNCHES what it hits. PROVED RED FIRST on the UPHEAVAL code: no crack, 0 px, the second and third
//             foes untouched, nothing launched at the far end.
//   ward      THE RUNE-WARD (her C from round 3 - it replaces the ROCK SHIELD and THE MEND): the Knight's guard, sidegraded. It takes
//             GEO.ward.raise to rise (a blow the frame after C goes down finds her); up, a YELLOW blow is blocked for GEO.ward.hitSt wind
//             (more than his 11) and there is NO hit count (ten in a row, wind topped up, all blocked); she is ROOTED while it stands
//             (C and RIGHT held: she does not move); a RED blow breaks through (it lands, and the ward is down); a blow from just behind
//             her head is taken (it covers OVERHEAD) and one from behind her is not; out of wind it is a GUARD BREAK (half the blow);
//             raised as the blow lands it is PERFECT - free, and she is EMPOWERED (her blow x1.25, TREMOR x2); a shot met on the beat is
//             thrown back; and DOWN+C casts nothing (THE MEND is gone). PROVED RED FIRST on the ROCK SHIELD: the blow the frame after C
//             was blocked (no raise), the third yellow found her (the hit count), RIGHT walked her 24 px, holding and blocking cost no
//             wind, a blow over her head found her, out of wind it still blocked, and no EMPOWERED.
//   burrow    HER DODGE IS BURROW: from the floor toward a pit she comes up at the last solid cell, on her feet, never across it;
//             onto a foe standing where she would come up, she comes up clear of it and never inside rock; a blow along the ground
//             while she is under does not land; and X as she surfaces kicks the ROLLING STONE
//   wall      STONE WALL, bought at level 9 in LODESTONE's place: pressed, it raises a wall piece in front of her; and a save that
//             bought LODESTONE loads, owning STONE WALL in the same loadout slot
//   dodges    BURROW IS THE FLOOR'S ONLY: swimming her dodge is the ordinary swimming dash (it fires, and never burrows); in the air
//             nothing burrows (she has no air roll of her own); and the ceiling-walk dodge (magePlayer) has no burrow in it
//   drawn     THE SHIELD IS NOT DRAWN WHILE WALKING (round 3, item 4): drawn by the real render (BK.step) while she walks and while she
//             stands, nothing of it is on screen; held up, it is. PROVED RED FIRST: the rock shield drew a plate on her forearm while she
//             walked (30 of 30 frames) and stood (30 of 30).
//   staff     HER STAFF IS A STAFF (round 3, item 3): in every locomotion frame (standing, running, jumping, falling, landing,
//             crouching) and her guard, read off the baked pixels, the amber geode stands clear over her hood - at least four amber
//             pixels above the hood's top row, the highest of them three rows above it - and the frame knows where its geode is (tip);
//             every key of her set keeps the frame count it had before the staff (FRAMES, below; THE MEND's gMend is gone with the
//             mend); and while she casts - C held - the draw sets stones going round the geode, and walking it does not.
//             PROVED RED FIRST on the standing-stone stave: 0 amber pixels over the hood in the standing frame, no tip, no stones.
//   levels    in three real early levels, at every 5th tile of floor she can stand on: wall, fault line and step raised, and every frame
//             no living body is inside her rock and, eight seconds on, the level's grid is exactly what it was (no route blocked)
// PROVED RED FIRST (2026-09-24): with the body test taken out of freeCell and RULE 4 disabled in src/geomancer.js, `lift` and `body`
// fail (a sprig buried in the stone; the stone that a foe was spawned into stood on) - the guards are what makes this green.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
/* HER SET'S FRAME COUNTS, key by key, as they were before the staff (master 52cfebb, less THE MEND's gMend): the staff redraws every
   frame and must not add or drop one */
const STAFF_FRAMES = {"idle":8, "run":6, "jump":2, "fall":2, "land":3, "takeoff":1, "apex":1, "skid":1, "climb":2, "atk":5, "plunge":1, "hurt":2, "crouch":1, "block":2, "dashAtk":3, "atkB":5, "atkC":5, "air":5, "cast":2, "fidget":15, "dance":8, "slump":2, "swim":4, "tread":4, "roll":4, "burrow":3, "rise":5, "sweep":5, "heavy":3, "windup":3, "blast":2, "gStep":2, "gHeave":3, "gSpikes":2, "gArch":2, "gWall":3, "gTomb":2, "gFault":2, "gGolem":2, "gAval":2};
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__geo=(ids,flat=true,lv=0,hl=20)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BKT.PROG.xp.geomancer=xpFloor(hl);   /* hero level: her passives now come with it (THE FOURTH STONE at 22) */
      BKT.PROG.skillOwned.geomancer=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.geomancer=ids.slice(0,2);BK.applyUpgrades();BK.load(lv);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;
      if(flat){for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);}
      BK.sim(30);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;};
    window.__inside=()=>{const G=BK.geo(),P=BK.P,bs=[P,...BK.enemies().filter(e=>e.alive&&!(e.gone>0))].map(b=>({l:b.x-b.w/2,r:b.x+b.w/2,t:b.y-b.h,b:b.y}));
      for(const p of G.pieces())if(p.tile===1)for(const c of p.cells){const cb={l:c.tx*16,r:c.tx*16+16,t:c.ty*16,b:c.ty*16+16};if(bs.some(b=>b.l<cb.r&&b.r>cb.l&&b.t<cb.b&&b.b>cb.t))return true;}return false;};
    window.__raise=()=>{const P=BK.P;P.st=P.maxSt;BK.geo().raiseWall();BK.sim(2);P.face=-P.face;};   /* (RAISE WALL is PARKED - no longer her C - and still held to THE CAP here) */
    return 1})()`);
  const out = {};
  out.cap = await pg.evalp(`(()=>{const run=n=>{let most=0;for(let k=0;k<n;k++){BK.tp(5+k*5,21);BK.sim(3);BK.P.face=1;__raise();BK.sim(4);most=Math.max(most,BK.geo().pieces().length);}return most;};
    __geo([]);const three=run(5);__geo([],true,0,24);return {three,four:run(6)}})()`);
  out.crumble = await pg.evalp(`(()=>{__geo([]);const g0=Array.from(BK.L.grid);__raise();BK.sim(3);__raise();BK.sim(5);const n=BK.geo().pieces().length;
    for(let i=0;i<60*7;i++){BK.sim(1);}   /* seven seconds: BEDROCK (level 8, on at 20) makes a piece stand six */const g1=Array.from(BK.L.grid);return {raised:n,left:BK.geo().pieces().length,same:g0.every((v,i)=>v===g1[i])}})()`);
  out.lift = await pg.evalp(`(()=>{const up=e=>BK.geo().erupt(Math.floor(e.x/16),22,2,'step',{hurt:false,noHero:true});   /* (the eruption STONE STEP uses: stone out of the floor under a body) */
    __geo([]);BK.spawnEnt({t:'sprig',x:(BK.P.x+66)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;BK.sim(2);const y0=e.y;
    up(e);let inside=false,top=0;for(let i=0;i<40;i++){BK.sim(1);inside=inside||__inside();top=Math.max(top,y0-e.y);}
    __geo([]);BK.spawnEnt({t:'sprig',x:(BK.P.x+66)/16,y:21});const b=BK.enemies().at(-1);b.hp=b.hp0=5000;b.cd=99;b.mini=true;BK.sim(2);up(b);let bin=false;for(let i=0;i<20;i++){BK.sim(1);bin=bin||__inside();}
    return {rose:Math.round(top),inside,bossInside:bin,pieces:BK.geo().pieces().length}})()`);
  out.body = await pg.evalp(`(()=>{__geo([]);__raise();BK.sim(3);const p=BK.geo().pieces()[0];if(!p)return {none:true};const c=p.cells[0];
    BK.spawnEnt({t:'sprig',x:(c.tx*16+8)/16,y:c.ty+1});const e=BK.enemies().at(-1);e.x=c.tx*16+8;e.y=c.ty*16+12;BK.sim(1);return {stood:BK.geo().pieces().includes(p),inside:__inside()}})()`);
  out.reload = await pg.evalp(`(()=>{__geo([]);__raise();BK.sim(3);__raise();BK.sim(2);const had=BK.geo().pieces().length;BK.load(0);const L=BK.L;const g0=Array.from(L.grid);BK.sim(5);
    return {had,after:BK.geo().pieces().length,same:g0.every((v,i)=>v===L.grid[i])}})()`);
  /* FAULT LINE: foes are sprigs held where they are put (hp 5000, no swing), so what is measured is only the crack */
  out.heavy = await pg.evalp(`(()=>{const P=()=>BK.P,K=BK.keys,G=()=>BK.geo(),FL=BK.geoK&&BK.geoK.fault;
      const foe=(dx,t='sprig')=>{BK.spawnEnt({t,x:(P().x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;e.px=P().x+dx;return e;};
      const hold=(es,n)=>{const pin=()=>es.forEach(e=>{if(e.px!==undefined&&!(e.vy<0)&&!e.geoAirT){e.x=e.px;e.vx=0;}});let len=0,lift=0;const y0=es.map(e=>e.y);
        const W=BK.geoK?BK.geoK.wind:0.5;K.atk=true;for(let i=0;i<90;i++){pin();BK.sim(1);if(n<1&&P().charge>=n*W)break;if(n>=1&&i>=45)break;}K.atk=false;   /* (n: how much of the wind to hold, 1 = all of it - it goes by itself at the full wind) */
        for(let i=0;i<80;i++){pin();BK.sim(1);for(const fl of G().faults?G().faults():[])len=Math.max(len,fl.len||0);es.forEach((e,k)=>lift=Math.max(lift,y0[k]-e.y));}
        return {len:Math.round(len),lift:Math.round(lift),hurt:es.map(e=>e.hp0-e.hp)};};
      /* touching her: the quickest release there is */
      __geo([]);const e=foe(12);BK.sim(2);const touch=()=>{e.x=P().x+P().w/2+e.w/2;e.vx=0;};touch();const h0=e.hp,gap=Math.round(e.x-P().x-(P().w+e.w)/2);
      let f=0;K.atk=true;while(!(P().charge>0)&&f++<60){touch();BK.sim(1);}K.atk=false;touch();BK.sim(1);
      const contact={hurt:h0-e.hp,gap,held:f};
      /* the same foe, a full charge: it hits harder */
      __geo([]);const e2=foe(12);BK.sim(2);e2.x=P().x+P().w/2+e2.w/2;e2.px=e2.x;const full0=hold([e2],1);
      /* a full charge on open floor: how far it runs */
      __geo([]);const open=hold([],1);
      /* a PIT 88 px ahead (tiles 16-18): a foe short of it is hit, a foe over it is not, and the crack ends at its edge */
      __geo([]);for(let x=16;x<=18;x++)for(let y=22;y<BK.L.H;y++)BK.L.grid[y*BK.L.W+x]=0;BK.tp(10,21);BK.sim(5);P().face=1;
      const pe=Math.round(16*16-P().x),pa=foe(40),pb=foe(20*16+8-P().x);BK.sim(2);const pit=hold([pa,pb],1);pit.edge=pe;
      /* a WALL two tiles high 88 px ahead: the same */
      __geo([]);for(let y=20;y<=21;y++)BK.L.grid[y*BK.L.W+16]=1;BK.tp(10,21);BK.sim(5);P().face=1;
      const we=Math.round(16*16-P().x),wa=foe(40),wb=foe(18*16+8-P().x);BK.sim(2);const wall=hold([wa,wb],1);wall.edge=we;
      /* three foes along the line, near, middle, far: all three are hit */
      __geo([]);const la=foe(30),lb=foe(80),lc=foe(130);BK.sim(2);const line=hold([la,lb,lc],1);
      /* (a swornsword: a sprig is rooted and nothing throws it) a foe at the full length: the rock spike at the end of a full charge launches it - and a crack from 0.6 of the wind, that runs past him and
         stops short of its end, hits him but throws nothing */
      __geo([]);const reachFull=FL?FL.len0+FL.lenK:160,sa=foe(reachFull-10,'swornsword');BK.sim(2);const spike=hold([sa],1);
      __geo([]);const sb=foe(80,'swornsword');BK.sim(2);const halfway=hold([sb],0.6);   /* (0.6 of the wind runs the crack to about 105 px: past him, well short of its end) */
      return {contact,full:full0.hurt[0],open,pit,wall,line,spike,halfway,reachFull}})()`);
  /* THE RUNE-WARD: every blow is 20 from 20 px in front unless it says otherwise; wind is topped up unless the case is about wind */
  out.ward = await pg.evalp(`(()=>{const P=()=>BK.P,K=BK.keys,W=(BK.geoK&&BK.geoK.ward)||{raise:0.1,perfect:0.09,hitSt:16};
      const hit=(o={})=>{P().inv=0;P().hurt=0;const st=P().st,hp=P().hp;const r=BKT.damagePlayer(o.x!==undefined?o.x:P().x+P().face*20,20,{unblockable:!!o.red});BK.sim(1);return {r,st:Math.round(st-P().st),hp:hp-P().hp};};
      const fresh=()=>{for(const k in K)K[k]=false;__geo([]);P().face=1;P().st=P().maxSt;BK.sim(2);},up=n=>{K.block=true;BK.sim(n);};
      fresh();K.block=true;BK.sim(1);const rising=hit();
      fresh();up(40);const st0=P().st;BK.sim(30);const held=Math.round(st0-P().st);P().st=P().maxSt;const y1=hit();
      fresh();up(40);let ten=0;for(let i=0;i<10;i++){P().st=P().maxSt;if(hit().r==='blocked')ten++;BK.sim(3);}
      fresh();const x0=P().x;K.block=true;K.right=true;BK.sim(45);const moved=Math.round(P().x-x0);
      fresh();up(40);const red=hit({red:true}),redUp=!!P().geoGuard;
      fresh();up(40);const over=hit({x:P().x-4});
      fresh();up(40);const back=hit({x:P().x-24});
      fresh();up(40);P().st=5;const gb=hit();
      fresh();up(40);const bolt=BKT.damagePlayer(P().x+20,20,{pierce:true});
      fresh();const d0=BKT.swordDmg();K.block=true;BK.sim(Math.round(W.raise*60)+2);const pf=hit();const emp=!!(BK.geo().empowered&&BK.geo().empowered());const d1=BKT.swordDmg();
        K.block=false;BK.sim(2);P().tremor=0;BK.geo().gainTremor(10);const trem=Math.round(P().tremor);P().geoEmpT=0;P().tremor=0;BK.geo().gainTremor(10);const trem0=Math.round(P().tremor);
      fresh();BK.spawnEnt({t:'archer',x:(P().x+120)/16,y:21});const ar=BK.enemies().at(-1);ar.hp=ar.hp0=5000;ar.cd=99;BK.sim(2);
        const s={x:P().x+36,y:P().y-12,vx:-160,vy:0,g:0,life:3,arrow:true,owner:ar};BK.seeds().push(s);K.block=true;let refl=false;
        for(let i=0;i<40;i++){BK.sim(1);if(s.reflected)refl=true;if(s.dead||s.reflected)break;}
      fresh();K.down=true;K.block=true;BK.sim(4);const cast=P().geoMendT>0||(P().kPoseK==='gMend'&&P().kPoseT>0);
      fresh();
      return {rising,held,y1,ten,moved,red,redUp,over,back,gb,bolt,pf,emp,dmg:[d0,d1],trem,trem0,refl,cast}})()`);
  out.burrow = await pg.evalp(`(()=>{const P=()=>BK.P,L=()=>BK.L,solidIn=()=>{const p=P(),b={l:p.x-p.w/2,r:p.x+p.w/2,t:p.y-p.h,b:p.y};for(let tx=Math.floor((b.l+1)/16);tx<=Math.floor((b.r-1)/16);tx++)for(let ty=Math.floor((b.t+1)/16);ty<=Math.floor((b.b-1)/16);ty++)if(L().grid[ty*L().W+tx]===1)return true;return false;};
      __geo([]);for(let x=12;x<=14;x++)for(let y=22;y<L().H;y++)L().grid[y*L().W+x]=0;BK.tp(10,21);BK.sim(5);P().face=1;const y0=P().y;BK.press('dodge');BK.sim(40);
      const pit={x:Math.round(P().x),edge:12*16,right:Math.round(P().x+P().w/2),y:Math.round(P().y-y0),ground:P().ground,rock:solidIn()};
      __geo([]);P().face=1;const x0=P().x;BK.press('dodge');BK.sim(40);const run=P().x-x0;   /* how far a dodge carries her on open floor: the foe is stood exactly there */
      __geo([]);BK.spawnEnt({t:'dummy',x:(P().x+run)/16,y:21});const e=BK.enemies().at(-1);BK.sim(3);e.x=P().x+run;e.vx=0;P().face=1;const hp0=P().hp;BK.press('dodge');BK.sim(6);const under=BKT.damagePlayer(P().x+10,10,{});BK.sim(40);
      const eb={l:e.x-e.w/2,r:e.x+e.w/2,t:e.y-e.h,b:e.y},p=P(),pb={l:p.x-p.w/2,r:p.x+p.w/2,t:p.y-p.h,b:p.y};
      const foe={inFoe:e.alive&&pb.l<eb.r&&pb.r>eb.l&&pb.t<eb.b&&pb.b>eb.t,rock:solidIn(),hurt:hp0-p.hp,under,ground:p.ground,gap:Math.round(Math.abs(e.x-p.x)),run:Math.round(run)};
      __geo([]);P().face=1;BK.press('dodge');BK.sim(1);let f=0;while(P().dodge>0.05&&f++<40)BK.sim(1);BK.press('atk');BK.sim(12);const stone=BK.geo().rollers().length;
      return {pit,foe,stone}})()`);
  out.wall = await pg.evalp(`(async()=>{__geo(['stoneWall']);BK.P.cds={};BK.press('throw');BK.sim(4);const kinds=BK.geo().pieces().map(p=>p.kind);
      const {migrateProgress}=await import('/src/progression.js');let mig;try{const r=migrateProgress(JSON.stringify({...JSON.parse(JSON.stringify(BKT.PROG)),skillOwned:{geomancer:{lodestone:true}},loadouts:{geomancer:['lodestone']}}),[]);mig={own:Object.keys(r.progress.skillOwned.geomancer),lo:r.progress.loadouts.geomancer};}catch(e){mig={err:String(e.message||e)};}
      return {kinds,mig}})()`);
  out.dodges = await pg.evalp(`(()=>{const P=()=>BK.P;__geo([]);const L=BK.L;L.pools=L.pools||[];L.pools.push({x0:2*16,x1:40*16,y:17*16,shallow:false,swim:true,depth:0,bottom:22*16});BK.tp(10,20);BK.sim(40);
      const swam=P().swim;P().st=P().maxSt;BK.press('dodge');let bur=0,dg=0;for(let i=0;i<30;i++){BK.sim(1);bur|=!!P().geoBurrow;dg=Math.max(dg,P().dodge||0);}const swim={swam,bur:!!bur,dodged:dg>0};
      __geo([]);BK.press('jump');BK.keys.jump=true;BK.sim(14);const up=!P().ground;P().st=P().maxSt;BK.press('dodge');let b2=0;for(let i=0;i<30;i++){BK.sim(1);b2|=!!P().geoBurrow;}BK.keys.jump=false;
      return {swim,air:{up,bur:!!b2}}})()`);
  { const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), i = src.indexOf('function magePlayer('), j = src.indexOf('\nfunction ', i + 10);
    out.dodges.ceiling = { found: i > 0, dodges: /P\.dodge = /.test(src.slice(i, j)), burrows: /geoBurrow/.test(src.slice(i, j)) }; }
  /* THE REAL LEVELS: the first three of the campaign */
  out.levels = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const ids=LEVELS.map((l,i)=>[l.id,i]).filter(([id])=>!/^trial|^practice|^draft/.test(id)).slice(0,3);const rows=[];
    for(const [id,i] of ids){__geo(['stoneStep'],false,i);const L=BK.L,W=L.W,H=L.H;const g0=Array.from(L.grid);let tried=0,inside=0,raised=0;
      for(let x=3;x<W-3&&tried<24;x+=5){let fy=-1;for(let y=2;y<H-1;y++){const t=L.grid[y*W+x];if(t===0&&L.grid[(y+1)*W+x]===1&&L.grid[(y-1)*W+x]===0){fy=y;break;}}if(fy<0)continue;
        tried++;BK.tp(x,fy);BK.P.vx=0;BK.P.vy=0;BK.sim(3);if(!BK.P.ground)continue;BK.P.st=BK.P.maxSt;BK.P.face=tried%2?1:-1;__raise();BK.keys.atk=true;BK.sim(36);BK.keys.atk=false;BK.sim(2);BK.P.cds={};BK.press('throw');BK.sim(2);
        raised+=BK.geo().pieces().length;for(let f=0;f<60*8;f++){BK.sim(1);if(f%6===0&&__inside())inside++;}}
      rows.push({id,tried,raised,inside,same:g0.every((v,k)=>v===L.grid[k]),left:BK.geo().pieces().length});}
    return rows})()`);
  /* HER STAFF, off the baked pixels of her own set */
  out.staff = await pg.evalp(`(()=>{__geo([]);const R=BK.heroSet.R,AMBER=new Set(['e8a83a','ffc860','fff0c0','d08a24','b8741c']),HOOD='353735';
    const scan=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,W=c.width;let hood=999,amb=[];
      for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;const h=[d[i],d[i+1],d[i+2]].map(v=>v.toString(16).padStart(2,'0')).join(''),y=Math.floor(i/4/W);if(h===HOOD)hood=Math.min(hood,y);if(AMBER.has(h))amb.push(y);}
      return {hood,above:amb.filter(y=>y<hood).length,top:amb.length?Math.min(...amb):999,tip:!!c.tip};};
    const rows={};for(const [k,i] of [['idle',0],['run',0],['run',3],['jump',0],['fall',1],['land',2],['crouch',0],['block',0]]){const f=Array.isArray(R[k])?R[k][i]:R[k];rows[k+i]=scan(f);}
    const counts=Object.fromEntries(Object.keys(R).map(k=>[k,Array.isArray(R[k])?R[k].length:1]));
    const K=BK.keys,spun=()=>Math.abs(BK.geo().spunAt?BK.geo().spunAt()-BK.time:9)<0.05;BK.P.st=BK.P.maxSt;K.block=true;let cast=0;for(let i=0;i<20;i++){BK.step(1);if(spun())cast++;}K.block=false;BK.step(20);
    K.right=true;let walk=0;for(let i=0;i<20;i++){BK.step(1);if(spun())walk++;}K.right=false;
    return {rows,counts,cast,walk}})()`);
  /* THE SHIELD IS NOT DRAWN WHILE WALKING: counted off the real render, frame by frame */
  out.drawn = await pg.evalp(`(()=>{__geo([]);const K=BK.keys,d=()=>BK.geo().shieldDrawn&&BK.geo().shieldDrawn()?1:0;let walk=0,idle=0,up=0;
    K.right=true;for(let i=0;i<30;i++){BK.step(1);walk+=d();}K.right=false;for(let i=0;i<30;i++){BK.step(1);idle+=d();}
    BK.P.st=BK.P.maxSt;K.block=true;for(let i=0;i<30;i++){BK.step(1);up+=d();}K.block=false;BK.step(10);return {walk,idle,up}})()`);
  /* A SAVE FROM BEFORE HER (version 1 migrated, or a version 2 made before she existed): no XP, nothing owned, no loadout for her */
  out.oldSave = await pg.evalp(`(()=>{__geo([]);const PR=BKT.PROG;delete PR.xp.geomancer;delete PR.skillOwned.geomancer;delete PR.loadouts.geomancer;BK.applyUpgrades();
    for(const k of ['atk','block','throw','skill2','jump'])BK.press(k);BK.sim(60);BK.state='map';BK.sim(2);BK.state='play';return {hp:BK.P.maxHp,lv:BKT.heroLevel('geomancer')}})()`);
  console.log(JSON.stringify(out));
  assert.equal(out.cap.three, 3, 'THE CAP: never more than three pieces stand at once (' + out.cap.three + ')');
  assert.equal(out.cap.four, 4, 'THE FOURTH STONE: four (' + out.cap.four + ')');
  assert(out.crumble.raised >= 2 && out.crumble.left === 0, 'every piece crumbles on its own (' + JSON.stringify(out.crumble) + ')');
  assert(out.crumble.same, 'and the level is exactly what it was');
  assert(out.lift.rose >= 20 && !out.lift.inside, 'stone under a small foe LIFTS it, never buries it (' + JSON.stringify(out.lift) + ')');
  assert(!out.lift.bossInside, 'and stone under a boss stops short under it');
  const H = out.heavy;
  assert(H.contact.gap <= 1 && H.contact.hurt > 0, 'FAULT LINE: the quickest release hits a foe touching her, at once (' + JSON.stringify(H.contact) + ')');
  assert(H.full > H.contact.hurt, 'FAULT LINE: the charge sets the damage - a full one hits the same foe harder (' + H.full + ' against ' + H.contact.hurt + ')');
  assert(H.open.len >= H.reachFull - 2, 'FAULT LINE: a full charge runs its whole length (' + H.open.len + ' of ' + H.reachFull + ' px)');
  assert(H.pit.hurt[0] > 0 && H.pit.hurt[1] === 0 && H.pit.len <= H.pit.edge + 1 && H.pit.len >= H.pit.edge - 8, 'FAULT LINE: it stops at a gap - never across a pit (' + JSON.stringify(H.pit) + ')');
  assert(H.wall.hurt[0] > 0 && H.wall.hurt[1] === 0 && H.wall.len <= H.wall.edge + 1 && H.wall.len >= H.wall.edge - 8, 'FAULT LINE: it stops at a wall - never up through rock (' + JSON.stringify(H.wall) + ')');
  assert(H.line.hurt.every(d => d > 0), 'FAULT LINE: every foe along the line is hit, not just the first (' + JSON.stringify(H.line) + ')');
  assert(H.spike.hurt[0] > 0 && H.spike.lift >= 20, 'FAULT LINE: a full charge ends in a rock spike that launches what it hits (' + JSON.stringify(H.spike) + ')');
  assert(H.halfway.hurt[0] > 0 && H.halfway.lift < 6, 'FAULT LINE: the spike is the FULL charge\'s: a crack that only just reaches him throws nothing (' + JSON.stringify(H.halfway) + ')');
  const S = out.ward, SW = JSON.stringify(S);
  assert(S.rising.r !== 'blocked' && S.rising.hp > 0, 'THE RUNE-WARD takes a tenth of a second to rise: a blow the frame after C finds her (' + SW + ')');
  assert(S.y1.r === 'blocked' && S.y1.hp === 0 && S.y1.st >= 14, 'a YELLOW blow on it is blocked, for more wind than the Knight\'s 11 (' + SW + ')');
  assert(S.held >= 5, 'holding it costs wind once the beat has passed (' + SW + ')');
  assert.equal(S.ten, 10, 'no hit count: ten yellow blows in a row, wind topped up, are all blocked (' + SW + ')');
  assert(Math.abs(S.moved) <= 1, 'she is ROOTED while it stands: C and RIGHT held, she does not walk (' + SW + ')');
  assert(S.red.r !== 'blocked' && S.red.hp > 0 && !S.redUp, 'a RED blow breaks through: it lands, and the ward is down (' + SW + ')');
  assert(S.over.r === 'blocked', 'it covers OVERHEAD: a blow from just behind her head is taken (' + SW + ')');
  assert(S.back.r !== 'blocked' && S.back.hp > 0, 'a blow from behind her finds her (' + SW + ')');
  assert(S.gb.r !== 'blocked' && S.gb.hp > 0 && S.gb.hp <= Math.ceil(S.back.hp / 2) + 1, 'out of wind it is a GUARD BREAK: half the blow finds her (' + SW + ')');
  assert(S.pf.r === 'blocked' && S.pf.st <= 0 && S.emp, 'raised as the blow lands it is PERFECT: free, and she is EMPOWERED (' + SW + ')');
  assert(S.dmg[1] >= Math.round(S.dmg[0] * 1.2) && S.trem === 2 * S.trem0, 'EMPOWERED: her blow a quarter harder, TREMOR twice as fast (' + SW + ')');
  assert(S.bolt === 'blocked', 'a bolt does not pierce it (it goes through a raised Knight guard) (' + SW + ')');
  assert(S.refl, 'a shot met on the beat is thrown back (' + SW + ')');
  assert(!S.cast, 'DOWN+C casts nothing: THE MEND is gone (' + SW + ')');
  assert(out.wall.kinds.includes('wall'), 'STONE WALL: the bought ability raises a wall (' + JSON.stringify(out.wall) + ')');
  assert(!out.wall.mig.err && out.wall.mig.own.join() === 'stoneWall' && out.wall.mig.lo.join() === 'stoneWall', 'a save that bought LODESTONE owns STONE WALL in its slot (' + JSON.stringify(out.wall.mig) + ')');
  const D = out.dodges;
  assert(D.swim.swam && D.swim.dodged && !D.swim.bur, 'swimming, her dodge is the ordinary swimming dash, never a burrow (' + JSON.stringify(D.swim) + ')');
  assert(D.air.up && !D.air.bur, 'in the air nothing burrows (' + JSON.stringify(D.air) + ')');
  assert(D.ceiling.found && D.ceiling.dodges && !D.ceiling.burrows, 'on a ceiling (magePlayer) the dodge is the ordinary roll (' + JSON.stringify(D.ceiling) + ')');
  const B = out.burrow;
  assert(B.pit.right <= B.pit.edge + 1 && B.pit.ground && B.pit.y === 0 && !B.pit.rock, 'BURROW: toward a pit she comes up at the last solid cell, on her feet (' + JSON.stringify(B.pit) + ')');
  assert(!B.foe.inFoe && !B.foe.rock && B.foe.ground, 'BURROW: she never comes up inside a foe or rock (' + JSON.stringify(B.foe) + ')');
  assert(B.foe.under !== 'blocked' && B.foe.hurt === 0, 'BURROW: a blow along the ground passes over her while she is under (' + JSON.stringify(B.foe) + ')');
  assert(B.stone >= 1, 'BURROW: X as she surfaces kicks the ROLLING STONE (' + B.stone + ')');
  assert(!out.body.none && !out.body.stood && !out.body.inside, 'stone a foe turns up inside crumbles at once (' + JSON.stringify(out.body) + ')');
  assert(out.reload.had >= 1 && out.reload.after === 0 && out.reload.same, 'a level left takes its stone with it (' + JSON.stringify(out.reload) + ')');
  for (const r of out.levels) { assert(r.tried >= 5 && r.raised > 0, r.id + ': she raised stone there (' + JSON.stringify(r) + ')'); assert.equal(r.inside, 0, r.id + ': nobody was ever inside her rock'); assert(r.same && r.left === 0, r.id + ': and eight seconds on the level is exactly as it was: no route blocked'); }
  assert(out.drawn.walk === 0 && out.drawn.idle === 0, 'her shield is not drawn while she walks or stands (' + JSON.stringify(out.drawn) + ')');
  assert(out.drawn.up >= 20, 'and it is drawn while she guards (' + JSON.stringify(out.drawn) + ')');
  for (const [k, r] of Object.entries(out.staff.rows)) assert(r.above >= 4 && r.top <= r.hood - 3 && r.tip, 'her staff: the amber geode stands over her hood in ' + k + ' (' + JSON.stringify(r) + ')');
  { const FRAMES = STAFF_FRAMES, got = out.staff.counts; for (const k of Object.keys(FRAMES)) assert.equal(got[k], FRAMES[k], 'her ' + k + ' keeps its ' + FRAMES[k] + ' frames (' + got[k] + ')');
    assert.deepEqual(Object.keys(got).filter(k => !(k in FRAMES)), [], 'no new keys on her set (' + JSON.stringify(got) + ')'); }
  assert(out.staff.cast >= 15 && out.staff.walk === 0, 'stones orbit the geode while she casts, and not while she walks (' + JSON.stringify({ cast: out.staff.cast, walk: out.staff.walk }) + ')');
  assert(out.oldSave.hp > 0, 'a save that never had her plays her (' + JSON.stringify(out.oldSave) + ')');
  assert.deepEqual(pg.errors, []);
  console.log('geomancer: FAULT LINE hits what touches her at once, runs ' + H.open.len + ' px full, stops at a pit and a wall, hits all three in its line and launches at the end; the cap holds (3, 4 with the passive), every piece crumbles and gives the grid back, nothing is ever buried, and ' + out.levels.length + ' real levels end as they began');
} finally { pg.close(); }
