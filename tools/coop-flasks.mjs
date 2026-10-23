/* tools/coop-flasks.mjs - CO-OP BALANCE: FLASKS FOR EVERY SEAT + THE SPLIT SCALE (claude/coopbalance, Daniel 10-21 interview item 12 + the numbers).
   pure   the tables: foes x2 / x2.6 / x3.2 by seats, the blow on each hero x1.25 / x1.38 / x1.5 (measured), an AI partial, solo untouched
   page   a wood with TWO human seats and then THREE: every seat starts with its own save's flask count (a guest the host's), each can DRINK (a held
          press on ITS pad), a shrine refills EVERY seat, a wipe (back to the shrine) restores every seat, the foes carry the party's health scale and a blow on
          a hero the party's blow scale, the seat plate shows the flask count, no page error
   PORT=8789 node tools/coop-flasks.mjs [pure,page] */
import { openLevelPage } from './boss-level.mjs';
import * as AIC from '../src/ai-companion.js';
const WANT = (process.argv.slice(2).find(a => !a.startsWith('--')) || 'pure,page').split(','), fails = [];
const ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const near = (a, b) => Math.abs(a - b) < 0.0006;
if (WANT.includes('pure')) {
  console.log('pure');
  const H = n => Array.from({ length: n }, () => ({}));
  ok(AIC.coopMulOf(H(1)) === 1 && AIC.coopTakeOf(H(1)) === 1, 'solo: x1 health, x1 blows');
  ok([2, 3, 4].every(n => near(AIC.coopMulOf(H(n)), [0, 0, 2, 2.6, 3.2][n]) && near(AIC.coopTakeOf(H(n)), [0, 0, 1.25, 1.38, 1.5][n])), 'people: health x2 / x2.6 / x3.2, a blow on each hero x1.25 / x1.38 / x1.5');
  ok(AIC.coopTakeOf(H(4)) < AIC.coopMulOf(H(2)), 'the blow table is gentler than the health table at every size (a person is not twice as hard-hit as alone)');
  ok(AIC.coopMulOf([{}, { ai: true }]) < AIC.coopMulOf(H(2)) && AIC.coopTakeOf([{}, { ai: true }]) < AIC.coopTakeOf(H(2)), 'one AI is a lighter partner than a person, on both tables');
}
if (WANT.includes('page')) {
  const pg = await openLevelPage({ audio: false, fonts: false }), E = x => pg.evalp(x, 600000);
  try {
    await E(`(()=>{window.__fresh=async()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.reset({fresh:true});await BK.allyReady();return BK.state;};return true;})()`);
    for (const seats of [2, 3]) {
      console.log('page: ' + seats + ' human seats');
      const r = await E(`(async()=>{await __fresh();const SV=await import('/src/survival.js'),{LEVELS}=await import('/src/level.js');BK.PROG.flaskUp=2;${seats > 2 ? '' : "BK.coopArm('warden',false);"}
        BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.sim(5);${seats > 2 ? "BK.coopStart('warden',false,[{hero:'warden'},{hero:'pyro'}]);BK.players().forEach((p,i)=>{p.x=BK.players()[0].x-10*i;p.y=BK.players()[0].y;p.vx=p.vy=0;});BK.sim(5);" : ''}const o={};const ps=()=>BK.players();const fm=SV.flaskMax(BK.PROG);o.fm=fm;o.n=ps().length;o.humans=ps().filter(p=>!p.ai).length;o.start=ps().map(p=>p.flasks|0);
        o.mul=BK.aiComp.mul();o.take=BK.aiComp.take();
        /* a seat drinks: hurt, grounded, a held press on ITS hands */
        const q=ps()[1];BK.sim(30);q.hp=Math.round(q.maxHp*0.3);const before=q.flasks|0,hp0=q.hp;q.press.flask=true;BK.sim(2);q.press.flask=false;for(let i=0;i<140;i++)BK.sim(1);o.drank={before,after:q.flasks|0,hp0,hp1:Math.round(q.hp)};
        /* a shrine refills every seat */
        for(const p of ps())p.flasks=0;BKT.shrineFill();o.shrine=ps().map(p=>p.flasks|0);
        /* a wipe restores every seat */
        for(const p of ps())p.flasks=0;BK.god=false;for(let i=0;i<ps().length;i++)BK.coopDown(i);BK.sim(5);o.wipe=ps().map(p=>p.flasks|0);o.wipeDown=ps().map(p=>p.down>0);
        /* the plate draws */
        BK.sim(30);o.err=0;return o;})()`);
      console.log('    ' + JSON.stringify(r));
      ok(r.n === seats && r.humans === seats, seats + ' human seats are in the wood');
      ok(r.start.length === seats && r.start.every(f => f === r.fm) && r.fm >= 3, 'every seat starts the wood with its own flasks (' + r.start.join('/') + ', the save carries ' + r.fm + ')');
      ok(r.drank.after === r.drank.before - 1 && r.drank.hp1 > r.drank.hp0, 'a second seat DRINKS on its own press: a flask spent, health up (' + r.drank.before + '->' + r.drank.after + ', hp ' + r.drank.hp0 + '->' + r.drank.hp1 + ')');
      ok(r.shrine.every(f => f >= 1), 'a shrine fills every seat (' + r.shrine.join('/') + ')');
      ok(r.wipe.every(f => f === r.fm), 'a wipe (back to the shrine) restores every seat (' + r.wipe.join('/') + ')');
      ok(near(r.mul, AIC.COOP.hp[seats]) && near(r.take, AIC.COOP.dmg[seats]), 'the wood carries the ' + seats + '-seat scale: health x' + r.mul + ', blows x' + r.take);
    }
    ok(!pg.errors.length, 'no page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
console.log(fails.length ? '\ncoop-flasks: ' + fails.length + ' FAILED' : '\ncoop-flasks: GREEN');
process.exit(fails.length ? 1 : 0);
