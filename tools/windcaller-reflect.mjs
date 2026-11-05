/* tools/windcaller-reflect.mjs [heroes] - EVERY HERO TURNS THE WINDCALLER'S PROJECTILES (claude/windcaller5, Daniel 11-02 21:39: "his projectiles should be
   REFLECTABLE ... and a reflected one that hits him KNOCKS HIM DOWN"). In the page, the fight live, the shaman held still on his west ledge (clocks frozen),
   NO god mode, once per hero (default: every hero in src/progression.js HERO_IDS), for his BOLT and his GALE BLADE (low):
     the projectile flies at the hero from the front; the hero answers with the C key (held when it is close - block, guard, ward, catch, bash, brace are all that key);
     expected: it is turned (a reflected bolt flies at him), reaches him, and HE FALLS (mode 'fallen').
   A second row per hero: the SAME with his ward up (just after a fall): turned, but WARDED - he does not fall again (not chainable).
   Prints a row per hero and check; exits 1 on any failure. ~2 min. PORT=<your port> node tools/windcaller-reflect.mjs [knight,warden] */
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
    const hold=()=>{if(!b)return;b.castT=99;b.howlT=99;b.stoneT=99;b.wallT=99;b.blastCd=99;b.closeT=0;if(b.wc){for(const k in b.wc.cd)b.wc.cd[k]=99;b.wc.hurls.length=0;b.wc.devils.length=0;b.wc.drafts.length=0;}};
    const step=n=>{for(let i=0;i<n;i++){hold();BK.sim(1);}};
    const boot=()=>{BK.setHero(hero);BK.reset({fresh:true});BK.load(lvI);BK.state='play';BK.start();BK.god=false;BK.sim(5);BK.reset();
      const A=BK.L.arena;b=BK.enemies().find(e=>e.t==='windcaller'&&e.alive);for(const e of BK.enemies())if(e!==b)e.alive=false;
      BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<400&&!(BK.bossActive&&b.mode==='cast');i++)step(1);
      b.hp=b.maxHp;const [x0,x1,row]=A.ledges[0];b.x=(x0+x1+1)*8;b.y=row*16;b.mode='cast';b.modeT=99;b.ward=0;
      BK.tp(Math.floor(b.x/16)+3,Math.round(A.floor/16)-1);BK.P.face=-1;step(20);clear();return A;};
    const run=(kind,warded)=>{const A=boot();if(warded)b.ward=60;const P=BK.P;const gy=A.floor;let sd=null,blade=null;const f=P.face;
      if(kind==='bolt'){sd={x:P.x+f*50,y:P.y-12,vx:-f*150,vy:0,g:0,dead:false,life:3.4,bolt:true,owner:b,dmg:38};BK.seeds().push(sd);}
      else{blade={x:P.x+f*110,dir:-f,kind:'low',gy,delay:0,life:2.6,hit:false};b.wc.blades.push(blade);}
      const hp0=P.hp;let fell=false,turned=false,pressed=false;
      for(let i=0;i<60*5;i++){const px=kind==='bolt'?sd.x:blade.x;const d=Math.abs(px-P.x);
        if(!pressed&&d<(kind==='bolt'?30:75)){K.block=true;pressed=true;}
        if(pressed&&i>0&&d>40&&(kind==='bolt'?sd.reflected:true))K.block=false;
        step(1);
        if(kind==='bolt'?sd.reflected:(b.wc.blades.every(q=>q!==blade)&&BK.seeds().some(s=>s.reflected&&s.bolt)))turned=true;
        if(b.mode==='fallen'){fell=true;break;}}
      clear();return {turned,fell,warded:!!warded,hurt:hp0-P.hp};};
    const bolt=run('bolt',false),blade=run('blade',false),wardedBolt=run('bolt',true);
    out.push({hero,bolt,blade,wardedBolt});
  }
  BK.manualSimulation=false;return out;})()`, 900000);
  for (const r of rows) {
    const checks = [['bolt turned and he falls', r.bolt.turned && r.bolt.fell, r.bolt], ['gale blade turned and he falls', r.blade.turned && r.blade.fell, r.blade], ['warded: turned, he does not fall again', r.wardedBolt.turned && !r.wardedBolt.fell, r.wardedBolt]];
    for (const [name, ok, d] of checks) { if (!ok) bad++; console.log((ok ? 'ok   ' : 'FAIL ') + r.hero.padEnd(10) + name.padEnd(42) + JSON.stringify(d)); }
  }
  console.log(bad ? 'WINDCALLER-REFLECT: ' + bad + ' failure(s)' : 'WINDCALLER-REFLECT OK: every hero turns his bolt and his blades, and a turned one that reaches him knocks him down');
  if (pg.errors.length) { console.log('page errors', JSON.stringify(pg.errors.slice(0, 5))); bad++; }
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
