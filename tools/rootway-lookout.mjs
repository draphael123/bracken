// tools/rootway-lookout.mjs - THE LOOKOUT CROSSING, every hero (claude/rootway2art, Daniel 10-10: "this jump is not crossable", twice).
//   From the near lip (303,18): (A) ANY arrow of the scout's that is struck back drops the span; (B) a thrown SPORE POD (the cap on the near ledge, E) that flies through the rope drops it;
//   (C) the real thing - the scout draws and shoots, the hero swings at his arrow as it comes (info only: timing is the player's). Then the span is a bridge: 8 one-way cells.
//   usage: PORT=<port> node tools/rootway-lookout.mjs
import { openPage } from './cdp.mjs';
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const pg = await openPage({ audio: false });
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
try {
  for (const hero of HEROES) {
    const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const out={};
      const boot=()=>{BK.manualSimulation=true;BK.setHero('${hero}');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='rootway'));BK.state='play';BK.god=true;BK.sim(20);for(const e of BK.enemies())if(!e.rwLookout&&e.t!=='trophyhunter')e.alive=false;for(const e of BK.enemies())if(e.t==='trophyhunter')e.alive=false;};
      const lo=()=>BK.rootway().hoist('lookout').state;
      /* A: a struck-back arrow, homed on its owner the way reflectSeed sends it */
      boot();{const P=BK.P;BK.tp(303,18);BK.sim(5);const sc=BK.enemies().find(e=>e.rwLookout);
        BK.seeds().push({x:P.x+8,y:P.y-14,vx:0,vy:0,dead:false,life:2,arrow:true,reflected:true,g:0,owner:sc});const s=BK.seeds()[BK.seeds().length-1];const dx=sc.x-s.x,dy=(sc.y-8)-s.y,m=Math.hypot(dx,dy);s.vx=dx/m*220;s.vy=dy/m*220;
        for(let i=0;i<150&&lo()==='hang';i++)BK.sim(1);for(let i=0;i<120;i++)BK.sim(1);out.arrow=lo();}
      /* A2: the same, an arrow with no owner (the scout fell) flying roughly his way */
      boot();{const P=BK.P;BK.tp(303,18);BK.sim(5);BK.seeds().push({x:P.x+8,y:P.y-14,vx:230,vy:-40,dead:false,life:2,arrow:true,reflected:true,g:0});
        for(let i=0;i<150&&lo()==='hang';i++)BK.sim(1);for(let i=0;i<120;i++)BK.sim(1);out.ownerless=lo();}
      /* B: a pod off the near ledge's cap, thrown from the lip (UP lobs) */
      for(const aim of ['up','none']){boot();const P=BK.P,kk=BK.keys||{};BK.tp(300,18);BK.sim(10);const took=BK.pods().interact(P);out['took_'+aim]=!!took;BK.tp(303,18);BK.sim(5);P.face=1;
        kk.up=aim==='up';BK.press('atk');for(let i=0;i<24;i++)BK.sim(1);kk.up=false;for(let i=0;i<200&&lo()==='hang';i++)BK.sim(1);for(let i=0;i<120;i++)BK.sim(1);out['pod_'+aim]=lo();}
      /* C: the real thing - he shoots, the hero swings at the arrow as it nears */
      boot();{const P=BK.P;BK.tp(303,18);BK.sim(5);P.face=1;let swung=0;for(let i=0;i<1500&&lo()==='hang';i++){BK.sim(1);for(const s of BK.seeds())if(!s.dead&&s.arrow&&!s.reflected&&Math.abs(s.x-P.x)<46&&Math.abs(s.y-(P.y-12))<26){P.face=s.x>P.x?1:-1;BK.press('atk');swung++;break;}}
        for(let i=0;i<120;i++)BK.sim(1);out.real=lo();out.swung=swung;out.cells=[304,308,311].map(x=>BK.cellAt?BK.cellAt(x,19):0);}
      return out;})()`, 600000);
    console.log('  ' + hero + ' ' + JSON.stringify(r));
    ok(r.arrow === 'down', hero + ': a struck-back arrow from the scout drops the span');
    ok(r.ownerless === 'down', hero + ': an owner-less struck-back arrow near the rope is turned onto it and drops the span');
    ok(r.took_up && r.pod_up === 'down', hero + ': a pod lobbed UP from the near lip snags the rope and drops the span');
  }
} finally { pg.close(); }
console.log(bad ? bad + ' FAILED' : 'all ok'); process.exit(bad ? 1 : 0);
