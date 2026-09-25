/* tools/moor-gusts-walk.mjs [heroes] - F9 for GALE MOOR'S GUSTS (docs/briefs/gale-moor-rework.md §3): every told crossing that
   shoves, driven in the real page on the real loop with the hero's own keys, NO god mode, once per hero (default knight,warden).
   The play bot cannot read a tell (RULES M), so it cannot prove a gust crossing can be made - this does, and it proves the
   other half too: each crossing is made the way its sign says, and FAILS the way the level says it should when it is not.
     a RIDE     jumped as the gust arrives: over, unhurt.   jumped in the still air: short (into the bog, or the thorns).
     a HEADWIND hopped in the still air, bracing (the guard key held on the ground) whenever a gust builds: over, unhurt.
                hopped straight on and never braced: the crossing that is longer than a still spell puts you in the thorns.
   Prints a row per crossing and hero. Not in the suite: it drives the page for a minute and a half. */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  const rows = await pg.evalp(`(async()=>{
  const {LEVELS,T}=await import('/src/level.js');const lvI=LEVELS.findIndex(l=>l.id==='moor');const out=[];BK.manualSimulation=true;
  const standT=t=>t===T.SOLID||t===T.ONEWAY||t===T.PLANK;
  for(const hero of ${JSON.stringify(heroes)}){
    const boot=()=>{BK.setHero(hero);BK.reset({fresh:true});BK.load(lvI);BK.state='play';BK.god=false;BK.sim(30);for(const e of BK.enemies())e.alive=false;};
    boot();const L=BK.L,W=L.W,at=(x,y)=>L.grid[y*W+x];
    const surf=x=>{for(let y=1;y<L.H;y++)if(standT(at(x,y))&&!standT(at(x,y-1))&&at(x,y-1)!==T.SPIKE)return y;return null;};
    const ph=z=>(BK.time+(z.phase||0))%z.period, K=BK.keys, clear=()=>{for(const k of ['left','right','jump','block','up','down'])K[k]=false;};
    const waitFor=(z,lo,hi)=>{for(let i=0;i<60*12&&!(ph(z)>=lo&&ph(z)<hi);i++)BK.sim(1);};
    const place=(x)=>{BK.tp(x,surf(x)-1);BK.P.vx=0;BK.sim(8);};
    const hp0=()=>{BK.P.hp=BK.P.maxHp;BK.P.inv=0;return BK.P.hp;};
    const zones=L.gusts.filter(z=>z.shove&&!z.arena);
    for(const z of zones){const a=Math.floor(z.x0/16),b=Math.ceil(z.x1/16),goal=b*16+8;
      const run=(how)=>{boot();for(const e of BK.enemies())e.alive=false;clear();
        if(z.carry){ /* A RIDE: on the lip, then jump as it arrives (or in the still) */
          /* four tiles of run-up, and the run started so the jump at the lip comes as the gust arrives - hear it rise, run, jump
             (or started in the still, so the jump goes with no wind behind it) */
          place(a-5);const h=hp0();if(how==='right')waitFor(z,z.period-0.75,z.period-0.65);else waitFor(z,z.on+0.1,z.on+0.2);
          K.right=true;let jumped=-1;for(let i=0;i<200;i++){if(jumped<0&&BK.P.x>=(a-1)*16+6){K.jump=true;BK.press('jump');jumped=i;}if(jumped>=0&&i===jumped+22)K.jump=false;BK.sim(1);if(jumped>=0&&BK.P.ground&&i>jumped+20)break;}
          const ok=BK.P.x>=b*16&&BK.P.hp>=h&&!BK.P.dead;clear();BK.sim(2);return {ok,x:Math.floor(BK.P.x/16),y:Math.floor(BK.P.y/16),hurt:BK.P.hp<h,lost:h-BK.P.hp};}
        /* A HEADWIND: from the bank behind it, hop stone to stone in the still, bracing (or not) when a gust builds */
        place(a-4);const h=hp0();waitFor(z,z.on+0.02,z.on+0.1);   /* a few tiles back from the bank, to walk up to the first hop */let jt=0,braced=0;
        for(let i=0;i<60*40&&BK.P.x<goal&&!BK.P.dead&&BK.P.hp>=h;i++){const p=ph(z),coming=p>=z.period-1.2||p<z.on;   /* heard rising (the build-up, GUST_TELL) or blowing: no hop is started, and a hero on a stone braces */
          if(how==='right'&&BK.P.ground&&coming&&jt<=0){clear();K.block=true;braced++;BK.sim(1);continue;}
          K.block=false;K.right=true;const tx=Math.floor((BK.P.x+10)/16),fy=Math.floor(BK.P.y/16);   /* the row under the feet (P.y is the feet) */
          if(BK.P.ground&&jt<=0&&!standT(at(tx,fy))&&!standT(at(tx,fy+1))){K.jump=true;BK.press('jump');jt=20;}
          if(jt>0){jt--;if(jt===8)K.jump=false;}BK.sim(1);}   /* a short hop: the jump held twelve frames */
        const ok=BK.P.x>=goal-8&&BK.P.hp>=h&&!BK.P.dead;clear();BK.sim(2);return {ok,x:Math.floor(BK.P.x/16),hurt:BK.P.hp<h,braced};};
      const right=run('right'),wrong=run('wrong');
      out.push({hero,zone:a+'-'+(b-1),kind:z.carry?'ride':'headwind',thorns:L.gusts&&BK.L.grid.slice(0).some((t,i)=>t===T.SPIKE&&i%W>=a&&i%W<b),right,wrong});}
  }
  BK.manualSimulation=false;return out;})()`, 1800000);
  for (const r of rows) {
    /* the right way always crosses; the wrong way fails wherever failing costs something (over thorns), and the bog-taught ones
       may be forgiven the wrong way (that is what teaching over a bog means) */
    const bogHeadwind = r.kind === 'headwind' && !r.thorns;
    const good = r.right.ok && (bogHeadwind || !r.wrong.ok);
    if (!good) bad++;
    console.log((good ? 'ok   ' : 'FAIL ') + r.hero.padEnd(7) + ' ' + r.kind.padEnd(8) + ' ' + r.zone.padEnd(8) + (r.thorns ? ' thorns' : ' bog   ') + '  the sign\'s way: ' + (r.right.ok ? 'over' : 'NOT over at ' + r.right.x + ',' + r.right.y + (r.right.hurt ? ' hurt ' + r.right.lost : '')) + (r.right.braced ? ' (braced ' + r.right.braced + ' frames)' : '') + '   the wrong way: ' + (r.wrong.ok ? 'over' : 'short at ' + r.wrong.x + (r.wrong.hurt ? ', hurt' : '')));
  }
  console.log(bad ? bad + ' crossing(s) wrong.' : rows.length + ' crossings, each made the way its sign says and failed the wrong way where failing costs.');
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
