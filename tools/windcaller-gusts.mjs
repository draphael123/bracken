/* tools/windcaller-gusts.mjs [heroes] - THE WINDCALLER 3's SUMMIT, PER HERO, WITH REAL KEYS (claude/windcaller3, scratch/brief-windcaller3.md;
   design standard A7 + B12: every hero reaches every ledge with base movement). In the page, the fight live and the shaman held still (his clocks
   frozen, his bolts cleared), NO god mode, once per hero (default: every hero in src/progression.js HERO_IDS):
     RIDES (the sign's way)   walk into an updraft as its gust arrives and hold toward the ledge: you land on it, unhurt.
       the lip's updraft, the gust east          -> THE WEST LEDGE
       the fall stone's updraft, the gust east   -> THE EAST LEDGE
       the fall stone's updraft, the gust west   -> THE WEST LEDGE   (phase two: the gusts alternate)
     NOT WITHOUT THE GUST     the same walk into the same updraft in the still air: no lift, and not on a ledge.
     NOT BY A JUMP            a running jump off the lip / the fall stone at the ledge: not on it (six rows; no hero jumps that).
     NOT UPWIND               the lip's updraft in a WEST gust: not on a ledge (the wind takes you back to the wall), and never in the thorns.
     THE GALE HOME            his gale from either ledge sets you down on the lip, on safe ground, unhurt.
   Prints a row per hero and check; exits 1 on any failure. ~1-2 min. PORT=<your port> node tools/windcaller-gusts.mjs [knight,warden] */
import { openPage } from './cdp.mjs';
import { HERO_IDS } from '../src/progression.js';
const heroes = (process.argv[2] || HERO_IDS.join(',')).split(',');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  const rows = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');const lvI=LEVELS.findIndex(l=>l.id==='moor');BK.manualSimulation=true;const out=[];
  for(const hero of ${JSON.stringify(heroes)}){
    const K=BK.keys,clear=()=>{for(const k of ['left','right','jump','block','up','down','atk','dodge'])K[k]=false;};
    let b=null;
    const hold=()=>{if(!b)return;b.castT=99;b.howlT=99;b.stoneT=99;b.wallT=99;if(b.mode==='cast')b.modeT=99;for(const s of BK.seeds())if(s.bolt||s.menhir)s.dead=true;};
    const step=n=>{for(let i=0;i<n;i++){hold();BK.sim(1);}};
    const boot=(phase)=>{BK.setHero(hero);BK.reset({fresh:true});BK.load(lvI);BK.state='play';BK.start();BK.god=false;BK.sim(5);BK.reset();
      const A=BK.L.arena;b=BK.enemies().find(e=>e.t==='windcaller'&&e.alive);for(const e of BK.enemies())if(e!==b)e.alive=false;
      BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<400&&!(BK.bossActive&&b.mode==='cast');i++)step(1);
      b.phase=phase||1;b.hp=b.maxHp;step(2);clear();return A;};
    const z=()=>BK.L.gusts.find(q=>q.galeArena);
    const ph=()=>{const q=z();return ((BK.time+(q.phase||0))%q.period+q.period)%q.period;};
    const dirAt=t=>{const q=z();return (q.alt?(Math.floor((t+(q.phase||0))/q.period)%2?-q.dir:q.dir):q.dir);};
    const vents=()=>BK.props().filter(p=>p.t==='vent'&&p.gale).sort((p,q)=>p.x-q.x);
    const ledge=i=>BK.L.arena.ledges[i];
    const onLedge=i=>{const [x0,x1,row]=ledge(i);return BK.P.ground&&Math.abs(BK.P.y-row*16)<3&&BK.P.x>=x0*16-4&&BK.P.x<=(x1+1)*16+4;};
    const onAnyLedge=()=>BK.L.arena.ledges.some((_,i)=>onLedge(i));
    const place=(x)=>{BK.tp(Math.floor(x/16),Math.round(BK.L.arena.floor/16)-1);BK.P.x=x;BK.P.vx=0;BK.P.vy=0;step(6);BK.P.hp=BK.P.maxHp;BK.P.inv=0;};
    /* wait for a gust blowing dir (0: the still air, mid-way) and start the walk 'lead' s before it blows */
    const waitGust=(dir,lead)=>{const q=z();for(let i=0;i<60*20;i++){const p=ph();if(dir===0){if(p>q.on+0.3&&p<q.on+0.4)return true;}else if(p>=q.period-lead&&p<q.period-lead+0.03&&dirAt(BK.time+lead+0.05)===dir)return true;step(1);}return false;};
    const ride=(vent,from,dir,hdir,want)=>{place(vent.x-hdir*40);const h=BK.P.hp;if(!waitGust(dir,0.3))return {ok:false,why:'no gust'};
      let landed=false,maxUp=0;const y0=BK.P.y;K[hdir>0?'right':'left']=true;let air=false;for(let i=0;i<60*5;i++){step(1);maxUp=Math.max(maxUp,y0-BK.P.y);if(!BK.P.ground)air=true;if(air&&BK.P.ground){landed=true;break;}if(!air&&i>90)break;}
      clear();step(2);const ok=want(BK.P)&&BK.P.hp>=h;return {ok,x:Math.floor(BK.P.x/16),y:Math.floor(BK.P.y/16),up:Math.round(maxUp),hurt:BK.P.hp<h,landed};};
    const jumpAt=(x,hdir)=>{place(x-hdir*48);const h=BK.P.hp;K[hdir>0?'right':'left']=true;let j=false;for(let i=0;i<60*3;i++){if(!j&&Math.abs(BK.P.x-x)<6){BK.press('jump');K.jump=true;j=true;}step(1);if(j&&BK.P.ground&&i>30)break;}clear();step(2);return {onLedge:onAnyLedge(),x:Math.floor(BK.P.x/16),y:Math.floor(BK.P.y/16)};};
    /* RIDES */
    let A=boot(1);const [v1,v2]=vents();
    const lipW=ride(v1,'lip',1,1,()=>onLedge(0));
    A=boot(1);const stoneE=ride(vents()[1],'stone',1,1,()=>onLedge(1));
    A=boot(2);const stoneW=ride(vents()[1],'stone',-1,-1,()=>onLedge(0));
    /* NOT WITHOUT THE GUST, NOT BY A JUMP, NOT UPWIND */
    A=boot(1);const still=ride(vents()[0],'lip',0,1,()=>!onAnyLedge());
    A=boot(1);const still2=ride(vents()[1],'stone',0,1,()=>!onAnyLedge());
    A=boot(1);const jl=jumpAt(BK.L.arena.safe[0][1]*16+8,1);
    A=boot(1);const js=jumpAt(BK.L.arena.safe[1][1]*16+8,1);   /* the fall stone's east end, at the east ledge's near end */
    A=boot(1);const js2=jumpAt(BK.L.arena.safe[1][0]*16+8,-1);   /* the fall stone's west end, at the west ledge */
    A=boot(2);const up=ride(vents()[0],'lip',-1,1,()=>!onAnyLedge());
    /* THE GALE HOME, from each ledge */
    const gale=i=>{A=boot(1);const [x0,x1,row]=ledge(i);BK.tp(Math.floor((x0+x1)/2),row-1);step(10);const h=BK.P.hp;b.mode='appear';b.modeT=0.01;b.ward=0;
      for(let k=0;k<60*6&&!(b.mode==='cast'&&!BK.P.galeRide);k++)step(1);step(5);const A2=BK.L.arena;return {ok:BK.P.ground&&Math.abs(BK.P.x-A2.home)<8&&Math.abs(BK.P.y-A2.floor)<3&&BK.P.hp>=h,x:Math.floor(BK.P.x/16),hurt:BK.P.hp<h};};
    const g0=gale(0),g1=gale(1);
    out.push({hero,lipW,stoneE,stoneW,still,still2,jl,js,js2,up,g0,g1});
  }
  BK.manualSimulation=false;return out;})()`, 900000);
  for (const r of rows) {
    const checks = [['ride: lip updraft, gust east -> WEST LEDGE', r.lipW.ok, r.lipW], ['ride: fall stone updraft, gust east -> EAST LEDGE', r.stoneE.ok, r.stoneE], ['ride: fall stone updraft, gust west -> WEST LEDGE', r.stoneW.ok, r.stoneW],
      ['not without the gust (lip)', r.still.ok, r.still], ['not without the gust (fall stone)', r.still2.ok, r.still2], ['not by a jump (lip)', !r.jl.onLedge, r.jl], ['not by a jump (fall stone, east)', !r.js.onLedge, r.js], ['not by a jump (fall stone, west)', !r.js2.onLedge, r.js2],
      ['not upwind (lip, gust west)', r.up.ok && !r.up.hurt, r.up], ['gale home from the west ledge', r.g0.ok, r.g0], ['gale home from the east ledge', r.g1.ok, r.g1]];
    for (const [name, ok, d] of checks) { if (!ok) bad++; console.log((ok ? 'ok   ' : 'FAIL ') + r.hero.padEnd(10) + name.padEnd(52) + JSON.stringify(d)); }
  }
  console.log(bad ? 'WINDCALLER-GUSTS: ' + bad + ' failure(s)' : 'WINDCALLER-GUSTS OK: every hero rides every ledge on the told gust with real keys, and none reaches one without it');
  if (pg.errors.length) { console.log('page errors', JSON.stringify(pg.errors.slice(0, 5))); bad++; }
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
