/* tools/underwater.mjs - OUT OF BREATH IS A QUIET DRAIN, AND A FLASK CAN BE DRUNK SWIMMING (claude/underwater, Daniel 2026-10-16).
   PORT=<port> node tools/underwater.mjs
   A. EVERY WATER LEVEL: with the breath at nothing and the head well under, the hero's health goes down a little at a time and NOTHING else happens - no hurt
      pose (P.hurt), no mercy window (P.inv), no knock (vx stays), no flash; the rate is ~3 hp/s at Normal; surfacing stops it; it can still kill, by name (DROWNED).
   B. THE SWIM-FLASK: swimming, a flask drinks (spent, healed at the swallow) at 1.5x the land time; a blow before it SPILLS; the drain does not spill it;
      in the air (a jump) it is still refused. */
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import * as SV from '../src/survival.js';
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const pg = await openPage({ audio: false, fonts: false });
const E = (e, t = 300000) => pg.evalp(e, t);
const nav = async q => { await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/' + q }); await new Promise(r => setTimeout(r, 1500)); for (let i = 0; i < 300; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)) break; await new Promise(r => setTimeout(r, 400)); } await E('BK.ui.pressCard = false').catch(() => {}); };
/* the level, the deepest swim pool, and a place in it (not on a trap, not in a foe's reach: a full breath there costs nothing for a third of a second) with the hero held that deep */
const SETUP = idx => `BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(${idx});BK.state='play';BK.start();BK.god=false;BK.SET.invincible=false;BK.SET.godmode=false;BK.enemies().forEach(e=>{e.alive=false;});BK.sim(20);
  const P=BK.P,pools=(BK.L.pools||[]).filter(q=>q.swim&&!q.shallow&&!q.dry&&(q.bottom===undefined||q.bottom-q.y>50)).sort((a,b)=>((b.bottom===undefined?9e9:b.bottom-b.y))-((a.bottom===undefined?9e9:a.bottom-a.y)));let at=null;
  const hold=n=>{for(let i=0;i<n;i++){P.y=at.y+30;P.vy=0;P.vx=0;BK.sim(1);}};
  for(const p of pools){for(const f of [0.5,0.3,0.7,0.2,0.85,0.1]){at=p;P.x=p.x0+(p.x1-p.x0)*f;P.y=p.y+30;P.vx=0;P.vy=0;P.hp=P.maxHp;P.inv=0;P.hurt=0;P.dead=0;P.breath=99;const h=P.hp;P.drains&&P.drains.clear();hold(20);if(P.hp>=h&&!P.dead&&P.swim&&P.breath>=90)break;at=null;}if(at)break;}`;
try {
  await nav('');
  const WATER = ['deep', 'keep', 'reef', 'lamplit', 'longwater', 'causeway', 'flotilla', 'harbor'].filter(id => LEVELS.some(l => l.id === id));   /* (batch125 integ) hurricane left the list: THE HURRICANE 3 has no standing pool - her sea is the H3H flood, driven by its own checks */
  const rows = [];
  for (const id of WATER) {
    const idx = LEVELS.findIndex(l => l.id === id);
    const r = await E(`(()=>{${SETUP(idx)}if(!at)return {none:true};
      const h0=P.hp;let hurt=0,inv=0,vxMax=0,air=0;for(let i=0;i<100;i++){P.breath=0;P.y=at.y+30;P.vy=0;BK.sim(1);hurt=Math.max(hurt,P.hurt||0);inv=Math.max(inv,P.inv||0);vxMax=Math.max(vxMax,Math.abs(P.vx||0));}
      return {none:false,swim:P.swim,lost:h0-P.hp,hurt,inv,vxMax,maxHp:P.maxHp,dead:!!P.dead,killer:P.killer&&P.killer.name};})()`);
    rows.push(id + ' ' + JSON.stringify(r));
    ok(!r.none, id + ': no place to test in its pools');
    if (r.none) continue;
    ok(r.swim, id + ': the test hero is not swimming');
    ok(r.lost >= 2, id + ': out of breath took (almost) nothing (' + r.lost + ')');
    ok(r.hurt === 0 && r.inv === 0, id + ': out of breath made a hurt pose or a mercy window ' + JSON.stringify(r));
    ok(r.vxMax < 20, id + ': out of breath knocked the hero (' + r.vxMax + ')');
  }
  console.log(rows.join('\n'));
  const idxD = LEVELS.findIndex(l => l.id === 'deep');
  /* the rate at Normal on the Deep: 100 steps is 100/60 x 0.6 game s; the old blow was 4 hp every 1.3 s (~3.1 hp/s) */
  const rate = await E(`(()=>{${SETUP(idxD)}const h0=P.hp;let steps=0;const t0=BK.time;for(let i=0;i<200&&!P.dead;i++){P.breath=0;P.y=at.y+30;P.vy=0;BK.sim(1);steps++;}return {lost:h0-P.hp,steps,secs:BK.time-t0};})()`);
  console.log('rate: ' + JSON.stringify(rate) + ' => ' + (rate.lost / rate.secs).toFixed(2) + ' hp/s');
  ok(rate.lost / rate.secs > 1.8 && rate.lost / rate.secs < 4.5, 'the drain is not about 3 hp/s: ' + (rate.lost / rate.secs).toFixed(2));
  /* surfacing stops it; a kill names DROWNED */
  const stop = await E(`(()=>{${SETUP(LEVELS.findIndex(l => l.id === "longwater"))}P.breath=0;hold(20);const dr=P.drains?P.drains.size:0;for(let i=0;i<30;i++){P.y=at.y-6;P.vy=0;BK.sim(1);}const h=P.hp;for(let i=0;i<120;i++){P.y=at.y-6;P.vy=0;BK.sim(1);}const d=P.hp-h,dr2=P.drains?P.drains.size:0;
    P.hp=2;P.y=at.y+30;P.breath=0;for(let i=0;i<400&&!P.dead;i++){P.breath=0;P.y=at.y+30;P.vy=0;BK.sim(1);}return {dr,d,dr2,dead:!!P.dead,killer:P.killer&&P.killer.name};})()`);
  console.log('stop/kill: ' + JSON.stringify(stop));
  ok(stop.dr === 1 && stop.d >= 0 && stop.dr2 === 0, 'surfacing did not stop the drain ' + JSON.stringify(stop));
  ok(stop.dead && stop.killer === 'DROWNED', 'the drain did not kill by name ' + JSON.stringify(stop));
  /* B. the swim flask */
  const fl = await E(`(()=>{${SETUP(idxD)}P.flasks=2;P.hp=30;P.drinkT=0;P.breath=99;hold(5);const o={};o.swimming=!!P.swim;o.started=BK.drinkFlask();o.dur=P.drinkDur;o.ratio=P.drinkDur/${SV.FLASK.drinkT};
    for(let i=0;i<400&&P.drinkT>0;i++){P.breath=99;hold(1);}o.healed=P.hp-30;o.spent=2-P.flasks;
    P.hp=30;P.flasks=2;P.inv=0;P.drinkT=0;hold(5);o.started2=BK.drinkFlask();hold(4);P.inv=0;BKT.damagePlayer(P.x+20,10,{unblockable:true,noKnock:true});const hpHit=P.hp;for(let i=0;i<40&&P.drinkT>0;i++)hold(1);hold(60);o.spillHealed=P.hp-hpHit;o.spillDrinking=P.drinkT>0;
    P.hp=30;P.flasks=2;P.inv=0;P.drinkT=0;P.breath=0;P.drinkSpills=0;hold(5);o.started3=BK.drinkFlask();const hp3=P.hp;let h3=0;for(let i=0;i<400&&P.drinkT>0;i++){P.breath=0;hold(1);}o.drainHealed=P.hp>hp3;o.drainSpills=P.drinkSpills|0;
    P.swim=false;P.y=at.y-80;P.vy=-100;P.ground=false;P.hp=30;P.flasks=2;P.drinkT=0;o.air=BK.drinkFlask();return o;})()`);
  console.log('swim-flask: ' + JSON.stringify(fl));
  ok(fl.swimming && fl.started, 'a swimmer could not start a drink ' + JSON.stringify(fl));
  ok(Math.abs(fl.ratio - 1.5) < 0.02, 'the swim drink is not 1.5x the land time: ' + fl.ratio);
  ok(fl.spent === 1 && fl.healed > 0, 'the swim drink did not heal and spend one flask');
  ok(fl.spillHealed === 0 && !fl.spillDrinking, 'a blow did not spill a swim drink');
  ok(fl.started3 && fl.drainHealed && fl.drainSpills === 0, 'the breath drain spilled or blocked the swim drink ' + JSON.stringify(fl));
  ok(fl.air === false, 'a flask was drunk in the air');
} finally { pg.close(); }
if (fails.length) { console.log('UNDERWATER FAILS:\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('UNDERWATER: out of breath is a quiet drain on every water level; a swimmer drinks at 1.5x, a blow spills it, the drain does not, the air refuses.');
