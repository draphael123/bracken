/* tools/foeproof-seeds.mjs - the variant archers' shots (claude/foevariety proof, 11-05): for each skin, the first live archer of it, the knight 5 tiles off (an archer ignores a hero farther than ~7) in the open:
   (1) wait for a shot (s.fv set), (2) REFLECT it (emulated reflectSeed, main.js 7817) and see it hurt/kill its owner, (3) a second shot left to LAND: damage, and venom poisons / rock shatters. node tools/foeproof-seeds.mjs */
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  for (const [skin, lv, side] of [['firearcher', 'palisadewood', -1], ['rockarcher', 'palisadewood', -1], ['venomarcher', 'fenroad', 1]]) {
    const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='${lv}'));BK.start();BK.god=true;BK.sim(200);
      const e=BK.enemies().find(q=>q.cnSkin==='${skin}'&&q.alive&&!q.dozing&&!q.horn);if(!e)return {err:'no foe'};
      for(const off of ${JSON.stringify([5,4,3,6].flatMap(n=>[n*side,-n*side]))}){BK.tp(Math.round(e.x/16)+off,Math.round(e.y/16)-1);BK.sim(12);if(Math.abs(BK.P.y-e.y)<10)break;}const out={hp0:e.hp,sameDeck:Math.abs(BK.P.y-e.y)<10};
      const seedOf=()=>BK.seeds().find(s=>s.fv&&s.owner===e&&!s.reflected&&!s.dead);
      let s=null;for(let k=0;k<1500&&!s;k++){BK.step(1);s=seedOf();} out.shot=!!s; if(s){out.fv=s.fv;out.arrow=!!s.arrow;{s.dead=false;s.reflected=true;s.g=0;s.life=2;const dx=e.x-s.x,dy=(e.y-(e.h||10)/2)-s.y,d=Math.hypot(dx,dy)||1,sp=Math.max(200,Math.hypot(s.vx,s.vy));s.vx=dx/d*sp;s.vy=dy/d*sp;}for(let k=0;k<120&&e.alive&&e.hp>=out.hp0;k++)BK.step(1);out.reflectedHit=e.hp<out.hp0||!e.alive;out.hpAfter=e.hp;}
      BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.venomT=0;e.hp=out.hp0;e.alive=true;const hp1=BK.P.hp;let landed=false;
      let pre=[];for(let k=0;k<2500&&!landed;k++){pre=BK.seeds().map(q=>q.fv||(q.arrow?'arrow':'other'));BK.step(1);if(BK.P.hp<hp1||BK.P.venomT>0)landed=true;}out.pre=pre.join('|');out.px=BK.P.x|0;out.ex=e.x|0;
      let vm=0;for(let k=0;k<30;k++){BK.step(1);vm=Math.max(vm,BK.P.venomT||0);}out.venomMax=vm;out.landed=landed;out.playerDmg=hp1-BK.P.hp;out.venom=vm>0;out.shards=BK.seeds().filter(q=>q.fv&&q.shard).length;
      BK.manualSimulation=false;return out;})()`, 120000);
    console.log(skin, JSON.stringify(r)); if (r.err || !r.shot || !r.reflectedHit || !r.landed || (skin === 'venomarcher' && !r.venom)) bad++;
  }
  console.log('page exceptions', pg.errors.length, JSON.stringify(pg.errors.slice(0, 3))); if (pg.errors.length) bad++;
} finally { await pg.close(); }
console.log(bad ? bad + ' RED' : 'all green'); process.exit(bad ? 1 : 0);
