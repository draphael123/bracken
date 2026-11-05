/* tools/coop-proof.mjs - CO-OP PROOF (claude/coopproof): the browser half of the coopai/cooppr work, 2 human seats in a wood.
     bleed   P2 bleeds out with P1 standing: only P2 wakes (full health + flasks), P1 is not moved or sent back; both down = the party wipe;
             a lift at ~19 s still saves him; a bleed in a LOCKED boss fight returns him inside the arena, the fight still on
     ping    Y press: a spot mark, a foe mark that follows the foe, one per seat, a seat's own press, a HELP mark while downed, the 4 s clock; two shots
   PORT=8789 node tools/coop-proof.mjs [bleed,ping]   (SHOTS=dir for the screenshots) */
import { writeFileSync } from 'node:fs';
import { openLevelPage } from './boss-level.mjs';
const WANT = (process.argv.slice(2).find(a => !a.startsWith('--')) || 'bleed,ping,ai').split(','), fails = [];
const OUT = process.env.SHOTS || 'C:/Users/Daniel Raphael/.claude/bracken-lanes/scratch/lane-reports';
const ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const pg = await openLevelPage({ audio: false, fonts: false }), E = x => pg.evalp(x, 600000);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/coopproof-' + n + '.png', Buffer.from((r.result||r).data, 'base64')); };
const SET = `window.__w=async(id)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.reset({fresh:true});await BK.allyReady();const {LEVELS}=await import('/src/level.js');BK.coopArm('warden',false);BK.load(LEVELS.findIndex(l=>l.id===id));BK.start();BK.sim(5);const ps=BK.players();for(let i=1;i<ps.length;i++){ps[i].x=ps[0].x-12*i;ps[i].y=ps[0].y;ps[i].vx=ps[i].vy=0;}BK.sim(30);return ps.length;};true`;
const KEY = `window.__y=(k)=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:k,code:'Key'+k.toUpperCase(),bubbles:true}));document.dispatchEvent(new KeyboardEvent('keyup',{key:k,code:'Key'+k.toUpperCase(),bubbles:true}));};true`;
try {
  await E(SET); await E(KEY);
  if (WANT.includes('bleed')) {
    console.log('bleed');
    const r = await E(`(async()=>{await __w('wood');const ps=BK.players(),a=ps[0],b=ps[1],o={};BK.god=true;
      a.x+=120;BK.sim(10);const ax=a.x,deaths0=BK.coopDeaths();b.flasks=0;b.hp=0;BK.coopDown(1);o.downT=b.down;
      for(let f=0;f<60*19;f++)BK.sim(1);o.at19={down:b.down>0,dead:b.dead};
      for(let f=0;f<60*3;f++)BK.sim(1);
      o.bleed={down:b.down,hp:Math.round(b.hp),max:b.maxHp,flasks:b.flasks|0,deadB:b.dead,aDown:a.down,aDx:Math.round(a.x-ax),deaths:BK.coopDeaths()-deaths0,fell:BK.coopFell()};
      BK.god=false;a.hp=a.maxHp;b.hp=b.maxHp;BK.coopDown(0);BK.coopDown(1);BK.sim(5);o.wipe={aDown:a.down>0,bDown:b.down>0,deaths:BK.coopDeaths()-deaths0};
      BK.god=true;a.x=b.x+150;BK.sim(5);BK.coopDown(1);for(let f=0;f<60*18.5;f++)BK.sim(1);const d19=b.down;a.x=b.x+4;a.y=b.y;a.vx=0;let up=-1;for(let f=0;f<60*3;f++){BK.sim(1);if(!(b.down>0)){up=f;break;}}
      o.lift={d19:+d19.toFixed(2),upF:up,hp:Math.round(b.hp),max:b.maxHp};
      return o;})()`);
    console.log('    ' + JSON.stringify(r));
    ok(r.downT >= 19 && r.downT <= 21, 'down clock is ~20 s (' + r.downT + ')');
    ok(r.at19.down, 'still down at 19 s');
    ok(r.bleed.down === 0 && r.bleed.deadB === 0 && r.bleed.hp === r.bleed.max && r.bleed.flasks >= 1, 'P2 alone bled out: wakes at full health with refilled flasks (' + r.bleed.hp + '/' + r.bleed.max + ', flasks ' + r.bleed.flasks + ')');
    ok(!(r.bleed.aDown > 0) && Math.abs(r.bleed.aDx) < 60 && !r.bleed.fell, 'P1 keeps going: not down, not sent back (dx ' + r.bleed.aDx + ', fell ' + r.bleed.fell + ')');
    ok(r.bleed.deaths === 1, 'one death on the run counter, no party wipe (' + r.bleed.deaths + ')');
    ok(r.wipe.deaths >= 2 && !r.wipe.aDown && !r.wipe.bDown, 'both down = the party wipe, both stand again at the shrine');
    ok(r.lift.d19 > 0 && r.lift.upF >= 0 && r.lift.hp > 0, 'a lift at 19 s still saves him (up in ' + r.lift.upF + ' frames)');
    const f = await E(`(async()=>{await __w('wood');const ps=BK.players(),a=ps[0],b=ps[1],A=BK.L.arena,o={};BK.god=true;BK.enemies().forEach(e=>{if(!e.maxHp)e.alive=false;});
      BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);b.x=a.x-10;b.y=a.y;BK.sim(60);o.active=BK.bossActive;o.arena={wallL:A.wallL,x0:A.x0,x1:A.x1,floor:A.floor};
      b.flasks=0;BK.coopDown(1);b.x=A.x0+40;for(let f=0;f<60*21;f++)BK.sim(1);BK.sim(10);
      o.b={x:Math.round(b.x),y:Math.round(b.y),down:b.down,hp:Math.round(b.hp),max:b.maxHp,flasks:b.flasks|0};o.stillActive=BK.bossActive;o.fell=BK.coopFell();o.aDown=a.down;return o;})()`);
    console.log('    ' + JSON.stringify(f));
    ok(f.active, 'the boss fight is locked on (bossActive)');
    ok(f.b.down === 0 && f.b.hp === f.b.max && f.b.flasks >= 1 && f.stillActive && !f.fell && !(f.aDown > 0), 'bleed during the locked fight: he wakes, the fight goes on, no wipe');
    ok(f.b.x >= f.arena.x0 - 24 && f.b.x <= f.arena.x1 + 24, 'he is back INSIDE the arena (x ' + f.b.x + ' in ' + f.arena.x0 + '..' + f.arena.x1 + ')');
  }
  if (WANT.includes('ping')) {
    console.log('ping');
    const r = await E(`(async()=>{await __w('wood');const ps=BK.players(),a=ps[0],b=ps[1],o={};BK.god=true;
      BK.enemies().forEach(e=>{if(e.alive&&Math.abs(e.x-a.x)<400)e.alive=false;});
      a.face=1;__y('y');BK.sim(3);o.spot=BK.pings().filter(p=>p.n===a.n);
      const e=BK.enemies().find(q=>q.alive&&!q.boss&&!q.fly&&!q.flying&&q.ground!==false&&q.hp>0&&q.t!=='bat');o.haveFoe=!!e;
      if(e){a.x=e.x-50;a.y=e.y;a.vx=0;b.x=a.x-10;b.y=a.y;BK.sim(70);a.x=e.x-50;a.y=e.y;a.vx=0;a.face=1;BK.sim(1);__y('y');BK.sim(3);o.foe=BK.pings().filter(p=>p.n===a.n);e.x+=12;BK.sim(2);o.follow=Math.round(BK.pings().find(p=>p.n===a.n).x-e.x);}
      b.press.ping=true;BK.sim(2);b.press.ping=false;BK.sim(2);o.both=BK.pings().map(p=>p.n).sort();
      __y('y');BK.sim(2);o.oneEach=BK.pings().filter(p=>p.n===a.n).length;
      BK.coopDown(1);BK.sim(3);b.press.ping=true;BK.sim(2);b.press.ping=false;BK.sim(2);o.help=BK.pings().filter(p=>p.n===b.n).map(p=>p.kind);
      for(let f=0;f<60*4.5;f++)BK.sim(1);o.gone=BK.pings().length;
      return o;})()`);
    console.log('    ' + JSON.stringify(r));
    ok(r.spot.length === 1 && r.spot[0].kind === 'spot', 'Y with nothing ahead marks the floor spot');
    ok(!r.haveFoe || (r.foe.length === 1 && r.foe[0].kind === 'foe' && Math.abs(r.follow) <= 14), 'Y near a foe marks the foe, and the mark follows it (' + r.follow + ' px)');
    ok(r.both.length >= 2, 'a seat-2 press marks on its own hands: ' + r.both.join(','));
    ok(r.oneEach === 1, 'one mark per seat');
    ok(r.help.length === 1 && r.help[0] === 'help', "a downed seat's press is a HELP mark on himself: " + r.help.join(','));
    ok(r.gone === 0, 'marks expire after ~4 s');
    await E(`(async()=>{await __w('wood');BK.sim(300);const ps=BK.players(),a=ps[0],b=ps[1];BK.god=true;BK.enemies().forEach(e=>{if(e.alive&&Math.abs(e.x-a.x)<400)e.alive=false;});const e=BK.enemies().find(q=>q.alive&&!q.boss&&!q.fly&&!q.flying&&q.ground!==false&&q.hp>0&&q.t!=='bat');if(e){a.x=e.x-50;a.y=e.y;b.x=a.x-10;b.y=a.y;BK.sim(70);a.x=e.x-50;a.y=e.y;a.face=1;}BK.sim(1);__y('y');BK.sim(3);b.press.ping=true;BK.sim(2);b.press.ping=false;BK.sim(6);return 1;})()`);
    await shot('pings');
    await E(`(()=>{const b=BK.players()[1];BK.coopDown(1);BK.sim(3);b.press.ping=true;BK.sim(2);b.press.ping=false;BK.sim(20);return 1;})()`);
    await shot('downed');
  }
  if (WANT.includes('ai')) {
    console.log('ai');
    await E(`window.__a=async()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.reset({fresh:true});await BK.allyReady();BK.aiComp.arm(['warden'],['aggressive'],1);const {LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.sim(300);return BK.players().length;};true`);
    const r = await E(`(async()=>{await __a();const ps=BK.players(),a=ps[0],q=ps.find(p=>p.ai),o={n:ps.length};BK.god=true;
      BK.enemies().forEach(e=>{if(e.alive&&Math.abs(e.x-a.x)<500)e.alive=false;});
      a.face=1;a.vx=0;BK.sim(90);o.gap0=Math.round(q.x-a.x);
      __y('y');BK.sim(2);const sp=BK.pings().find(p=>p.n===a.n);o.spot=sp&&sp.kind;const sx=sp?sp.x:0;
      let best=999;for(let f=0;f<60*3.5;f++){a.vx=0;BK.sim(1);best=Math.min(best,Math.abs(q.x-sx));}o.spotBest=Math.round(best);o.spotDx=Math.round(sx-a.x);
      BK.sim(60*5);const e=BK.enemies().find(z=>z.alive&&!z.boss&&!z.fly&&!z.flying&&z.ground!==false&&z.hp>0&&z.t!=='bat');o.haveFoe=!!e;
      if(e){a.x=e.x-60;a.y=e.y;a.vx=0;q.x=a.x-80;q.y=a.y;q.vx=0;BK.sim(40);a.x=e.x-60;a.y=e.y;a.face=1;BK.sim(1);const hp0=e.hp;__y('y');BK.sim(2);const fp=BK.pings().find(p=>p.n===a.n);o.foePing=fp&&fp.kind;
        let near=999;for(let f=0;f<60*6&&e.alive;f++){a.vx=0;BK.sim(1);near=Math.min(near,Math.abs(q.x-e.x));}o.foeNear=Math.round(near);o.foeHit=Math.round(hp0-(e.alive?e.hp:0));}
      return o;})()`);
    console.log('    ' + JSON.stringify(r));
    ok(r.n === 2, 'P1 + an AI partner');
    ok(r.spot === 'spot' && r.spotBest <= 28, 'the AI walks to a spot ping (' + r.spotBest + ' px from it, ping ' + r.spotDx + ' px ahead of P1)');
    ok(!r.haveFoe || (r.foePing === 'foe' && r.foeHit > 0), 'the AI fights a pinged foe (nearest ' + r.foeNear + ' px, dealt ' + r.foeHit + ')');
    await E(`(async()=>{await __a();const q=BK.players().find(p=>p.ai);BK.god=true;BK.sim(60);q.aiS=Object.assign(q.aiS||{},{wait:true});q.leash=0;BK.draw1();return 1})()`);
    await shot('aicue');
  }
  ok(!pg.errors.length, 'no page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
console.log(fails.length ? '\ncoop-proof: ' + fails.length + ' FAILED' : '\ncoop-proof: GREEN');
process.exit(fails.length ? 1 : 0);
