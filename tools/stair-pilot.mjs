// tools/stair-pilot.mjs [heroes] - THE SPIRAL STAIR, PILOTED (claude/towerscroll): each hero goes through his ring on the parapet and climbs
// the Undead Archmage's stair with the lab's stair bot (src/lab.js chaseClimb), NORMAL health, no god mode, no refill: a death is a death
// and the bot goes again from wherever it wakes (back through the ring if it wakes on the parapet). Prints the seconds to the carpet, the
// damage taken and the deaths per hero. Not in the suite (a pilot, the lane's before/after number).
// usage: node tools/stair-pilot.mjs                (knight, warden, pyro)
//        CAP=300 node tools/stair-pilot.mjs knight,paladin
//        GUARD=1 node tools/stair-pilot.mjs     (a careful hand: it stands and guards through each of his fire and frost tells and while his bolts fly)
import { openPage } from './cdp.mjs';
import { TOWER } from '../src/tower-ascent.js';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), cap = +(process.env.CAP || 240);
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const h of heroes) { await pg.reload();
    const q = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const LB=await import('/src/lab.js');const SC=await import('/src/spiral-chase.js');BK.manualSimulation=true;
      BK.setHero(${JSON.stringify(h)});BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=false;BK.sim(10);
      const inS=()=>SC.inSpiral(BK.L.spiral,BK.P.x,BK.P.y);
      const through=()=>{BK.tp(33,${TOWER.SKY});BK.sim(5);for(let i=0;i<90;i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;BK.sim(20);};
      let t=0,taken=0,deaths=0,wasDead=false,hp=BK.P.hp;
      let src={dark:0,pend:0,other:0},dh=0;const each=()=>{t++;const d=BK.P.dead>0||BK.P.hp<=0;if(d&&!wasDead)deaths++;wasDead=d;const D=BK.chase.states()[0],fx=BK.chase.stairFx();if(!d&&BK.P.hp<hp){const k=D.hits>dh?'dark':fx.cd>0.85?'pend':'other';src[k]+=hp-BK.P.hp;taken+=hp-BK.P.hp;}dh=D.hits;hp=BK.P.hp;};   /* (archmage2: the damage by what dealt it - the dark, a clock weight, or the rest: his spells and books) */
      through();
      while(t<60*${cap}&&!BK.carpet()){
        if(BK.P.dead>0){BK.sim(1);each();continue;}
        if(!inS()){hp=BK.P.hp;through();continue;}
        LB.chaseClimb(BK,BK.enemies().find(e=>e.t==='magechase'),{secs:${cap},each,stop:()=>t>=60*${cap}||!inS(),guard:${process.env.GUARD === '1'}?()=>{const m=BK.enemies().find(e=>e.t==='magechase');return !!m&&m.alive&&(m.mode==='fireTell'||m.mode==='iceTell'||(m.shots||[]).some(q=>!q.hit&&Math.hypot(q.x-BK.P.x,q.y-BK.P.y)<120));}:null});}   /* (one call: a chunked climb let go of the jump key mid-jump) */
      return {h:${JSON.stringify(h)},top:!!BK.carpet(),secs:Math.round(t/60),taken:Math.round(taken),src,deaths,hpLeft:Math.round(BK.P.hp)};})()`, 900000);
    console.log(JSON.stringify(q)); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
