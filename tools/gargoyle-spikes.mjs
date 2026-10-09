/* tools/gargoyle-spikes.mjs — THE GATE GARGOYLE ON HIS SPIKES (claude/witchfix; Daniel, live on 10-08: "he takes NO DAMAGE even when he's down
   on the spikes", and "some blocks attached to him").
   THE CAUSE: gargTake let nothing but the stomp's own call through - so the PLUNGE a player brings down on his back (down + X) met 0 and
   pogoed the hero off him before the stomp could land, and every blade, shot and burn was 0 as well. His frames 10 and 11 had the broken
   slab's chunks BAKED into them (and frame 8 the old spit's masonry), so the pieces rode down with him and lay glued to him on the spikes.
   DANIEL'S DESIGN (an exception to B15 for him only): INVULNERABLE everywhere EXCEPT down on the spikes; THERE EVERY BLOW LANDS, with the
   shared read (B10: gold ring + timer bar), then a told ward (B3); a turned blow outside clanks and names the verb, DROP HIM ON THE SPIKES.
   With REAL KEYS (keydown/keyup on the page, through the game's own input), for the knight, the warden and the pyromancer:
     1. on the spikes: a swing from the air (X), a plunge (down + X) and a stomp (a fall onto his back) each take something off him;
     2. off the spikes (hovering beside you): the same swing takes NOTHING, and the blow is turned (struck, unhurt: the B10 read);
     3. after the stun he is WARDED for GARG.ward s (told) and the rune cannot turn him over while it holds;
     4. no slab on him: his crash / stunned / breath frames carry no slab pixel, and a broken slab's pieces are the world's - thrown where it
        broke, falling, shattered and gone within two seconds, never riding with him.
   Every assertion is SOFT and all are printed. */
import { install } from './node-canvas.mjs';
import { LEVELS } from '../src/level.js';
import { openPage } from './cdp.mjs';
install();
const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };
const G = await import('../src/gate-gargoyle.js'), D = await import('../src/redraw/queue_bosses.js'), BRD = await import('../src/boss-read.js');
const { GARG } = G, I = LEVELS.findIndex(l => l.id === 'witchlight');
// in Node: the rule, the word, the frames
ok(G.gargTake({ mode: 'hover' }, 40) === 0 && G.gargTake({ mode: 'dive' }, 40) === 0 && G.gargTake({ mode: 'stunned' }, 40) === 40 * GARG.openMul && G.gargTake({ mode: 'stunned', stompNow: 70 }, 40) === 70,
  'the rule: nothing off the spikes, every blow on them (x' + GARG.openMul + '), the stomp its own ' + GARG.stompDmg);
{ const w = BRD.TURN_WORD.gargoyle, say = e => (typeof w === 'function' ? w(e, 0) : w);
  ok(say({ wardT: 0 }) === 'DROP HIM ON THE SPIKES' && say({ wardT: 1 }) === 'WARDED', 'the turned blow names the verb: ' + say({ wardT: 0 }) + ' / ' + say({ wardT: 1 })); }
{ const S = D.bakeGateGargoyle(), slabPx = c => { const d = c._d; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] && ((d[i] === 0x9a && d[i + 1] === 0x9a && d[i + 2] === 0xa4) || (d[i] === 0x5a && d[i + 1] === 0x5a && d[i + 2] === 0x64))) n++; return n; };
  const bad = [8, 10, 11].map(f => [f, slabPx(S.R[f]) + slabPx(S.L[f])]).filter(([, n]) => n > 0);
  ok(bad.length === 0, 'NO SLAB BAKED ON HIM: frames 8 (breath), 10 (stunned) and 11 (crash) carry no slab pixel: ' + (bad.map(q => q.join(':')).join(' ') || 'none'));
  ok(G.gargFrame({ mode: 'wake', anim: 0 }) !== 0, 'and he does not fly off the gate with its ledge under his feet (wake is a flying frame)'); }
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  for (const hero of ['knight', 'warden', 'pyro']) {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const out={};
      const key=(t,k,code)=>window.dispatchEvent(new KeyboardEvent(t,{key:k,code:code||k,bubbles:true}));
      BK.setHero('${hero}');BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);
      const g=BK.enemies().find(e=>e.t==='gargoyle');for(const e of BK.enemies())if(e!==g)e.alive=false;const A=BK.L.arena;
      const sl=()=>BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x);const low=()=>sl().filter(m=>m.y===Math.max(...sl().map(q=>q.y))&&!m.broken);
      const on=m=>{const P=BK.P;P.windRide=null;P.x=m.x+m.w/2;P.y=m.y;P.vy=0;P.vx=0;P.onMover=m;P.ground=true;};
      const calm=()=>{const P=BK.P;P.st=P.maxSt;P.atk=-1;P.atkRec=0;P.plunge=false;P.dodge=0;P.hurt=0;P.inv=0;P.windRide=null;P.hitSet&&P.hitSet.clear();};
      on(low()[1]);BK.sim(150);
      const smash=m=>{for(const q of sl())if(q.broken)q.brokenT=0;BK.sim(3);g.mode='hover';g.cd=99;g.queue=[];g.paired=true;g.wardT=0;BK.sim(2);on(m);g.mode='diveTell';g.modeT=0.4;g.tgt=m;g.off=m.w/2;
        for(let i=0;i<120&&g.mode==='diveTell';i++){on(m);BK.sim(1);}const n=low().filter(q=>q!==m).sort((a,b)=>Math.abs(a.x-m.x)-Math.abs(b.x-m.x))[0];on(n);
        const shards=[];for(let i=0;i<240&&['dive','smash','crash'].includes(g.mode);i++){g.cd=99;on(n);BK.sim(1);if((BK.L.shards||[]).length)shards.push(BK.L.shards.map(s=>[Math.round(s.x),Math.round(s.y)]));}return {mode:g.mode,m,shards};};
      const sp=()=>BK.SET.speed||1,keep=()=>{g.modeT=Math.max(g.modeT,2);};   /* hold him down while a blow is asked (each blow its own fresh stun) */
      /* 1. ON THE SPIKES - a swing from the air, beside him (not on his back) */
      {const o=smash(low()[2]);out.smash={mode:o.mode,broken:!!o.m.broken};
       const sx=o.m.x+o.m.w/2,first=o.shards[0]||[],far=first.every(([x,y])=>Math.abs(x-sx)<o.m.w&&Math.abs(y-o.m.y)<40);
       let t=0,last=[];for(;t<150&&(BK.L.shards||[]).length;t++){last=BK.L.shards.map(s=>s.y);keep();BK.sim(1);}
       out.shards={n:first.length,atSlab:far,goneIn:+(t*sp()/60).toFixed(2),left:(BK.L.shards||[]).length,lastAbove:Math.round(A.floor-Math.max(...last))};
       calm();const P=BK.P;P.onMover=null;P.ground=false;P.x=g.x-36;P.face=1;P.y=A.floor-38;P.vy=0;BK.log=[];const h0=g.hp;keep();
       key('keydown','x');BK.sim(1);key('keyup','x');for(let i=0;i<20;i++){keep();BK.sim(1);}
       out.swing={took:+(h0-g.hp).toFixed(1),mode:g.mode,blows:(BK.log||[]).filter(q=>q.k==='dmgE'&&q.t==='gargoyle').length};}
      /* a plunge onto his back */
      {calm();const P=BK.P;P.onMover=null;P.ground=false;P.x=g.x;P.y=g.y-g.h-56;P.vy=0;const h0=g.hp;BK.log=[];keep();
       key('keydown','ArrowDown');BK.sim(6);key('keydown','x');BK.sim(1);key('keyup','x');let i=0;for(;i<60&&g.mode==='stunned';i++){keep();BK.sim(1);}key('keyup','ArrowDown');
       const L=(BK.log||[]).filter(q=>q.k==='dmgE'&&q.t==='gargoyle');out.plunge={took:+(h0-g.hp).toFixed(1),plungeBlow:L.some(q=>q.plunge&&q.hp<q.hp0),mode:g.mode,ward:+(g.wardT||0).toFixed(2)};
       for(let k=0;k<200&&(P.windRide||!P.ground);k++){keep();BK.sim(1);}}
      /* a stomp: a plain fall onto his back */
      {if(g.mode!=='stunned')smash(low()[2]);calm();const P=BK.P;P.onMover=null;P.ground=false;P.x=g.x;P.y=g.y-g.h-40;P.vy=60;const h0=g.hp;keep();
       for(let i=0;i<60&&g.mode==='stunned';i++)BK.sim(1);out.stomp={took:+(h0-g.hp).toFixed(1),mode:g.mode,ward:+(g.wardT||0).toFixed(2)};
       /* 3. THE WARD: told, and the rune cannot turn him over while it holds */
       const rc=A.rune;let ruled=null;if(rc){for(let i=0;i<40;i++){g.cd=99;BK.sim(1);}g.mode='hover';g.cd=99;g.x=rc.x;g.y=rc.mid!==undefined?rc.mid-20:(rc.top+rc.bot)/2;rc.cd=0;rc.flare=1;BK.sim(1);ruled={mode:g.mode,ward:+(g.wardT||0).toFixed(2)};}
       out.ward=ruled;for(let i=0;i<60*6;i++){g.cd=99;BK.sim(1);}out.wardAfter=+(g.wardT||0).toFixed(2);}
      /* the stun running out on its own also ends in the ward */
      {smash(low()[3]);let i=0;for(;i<60*6&&g.mode==='stunned';i++){g.cd=99;BK.sim(1);}out.stunEnd={mode:g.mode,ward:+(g.wardT||0).toFixed(2),secs:+(i*sp()/60).toFixed(2)};}
      /* 2. OFF THE SPIKES: the same swing on him hovering beside you */
      {for(let i=0;i<60*6;i++){g.cd=99;BK.sim(1);}const m=low()[1];on(m);BK.sim(5);calm();g.mode='hover';g.cd=99;g.wardT=0;const P=BK.P;P.face=1;g.x=P.x+18;g.y=P.y;const h0=g.hp;BK.log=[];
       key('keydown','x');BK.sim(1);key('keyup','x');for(let i=0;i<20;i++){g.mode='hover';g.cd=99;g.x=P.x+18;g.y=P.y;BK.sim(1);}
       const L=(BK.log||[]).filter(q=>q.k==='dmgE'&&q.t==='gargoyle');out.off={took:+(h0-g.hp).toFixed(1),struck:L.length,turned:L.some(q=>q.dmg>0&&q.hp===q.hp0)};}
      out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 600000);
    console.log(hero, JSON.stringify(r));
    ok(r.smash.mode === 'stunned' && r.smash.broken, hero + ': a slab left late puts him through it onto the spikes, stunned');
    ok(r.shards.n >= 3 && r.shards.atSlab && r.shards.left === 0 && r.shards.goneIn <= 2 && r.shards.lastAbove <= 24, hero + ': THE SLAB\'S PIECES are the world\'s: thrown where it broke, fallen to the spikes and shattered (none rides with him): ' + JSON.stringify(r.shards));
    ok(r.swing.took > 0, hero + ': ON THE SPIKES a swing from the air (X) lands: ' + JSON.stringify(r.swing));
    ok(r.plunge.took >= GARG.stompDmg && r.plunge.plungeBlow && r.plunge.mode !== 'stunned' && r.plunge.ward > 0, hero + ': ON THE SPIKES a plunge (down + X) onto his back IS THE STOMP (' + GARG.stompDmg + ', he tears free, warded) - it was a 0, then a 10-20 pogo that lost you the stomp (the pyromancer FIREDROP ember may land on top of it): ' + JSON.stringify(r.plunge));
    ok(r.stomp.took >= GARG.stompDmg * 0.9 && r.stomp.mode !== 'stunned' && Math.abs(r.stomp.ward - GARG.ward) < 0.2, hero + ': and the stomp is still the big one (' + GARG.stompDmg + '), tears him free, WARDED ' + GARG.ward + ' s: ' + JSON.stringify(r.stomp));
    ok(!r.ward || (r.ward.mode !== 'crash' && r.ward.ward > 0), hero + ': while the ward holds the rune does not turn him over: ' + JSON.stringify(r.ward));
    ok(r.wardAfter === 0 && r.stunEnd.mode !== 'stunned' && Math.abs(r.stunEnd.secs - GARG.stun) < 0.4 && Math.abs(r.stunEnd.ward - GARG.ward) < 0.2, hero + ': the stun runs out after ' + GARG.stun + ' s into the same ward, and the ward lifts: ' + JSON.stringify(r.stunEnd) + ' after ' + r.wardAfter);
    ok(r.off.struck > 0 && r.off.took === 0 && r.off.turned, hero + ': OFF THE SPIKES the same swing meets him and takes NOTHING - turned (clank + DROP HIM ON THE SPIKES): ' + JSON.stringify(r.off));
    ok(r.errors.length === 0, hero + ': no errors on the page: ' + JSON.stringify(r.errors));
  }
  ok(pg.errors.length === 0, 'no page errors: ' + JSON.stringify(pg.errors.slice(0, 3)));
} finally { await pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTHE GATE GARGOYLE ON HIS SPIKES: stone everywhere else, every blow on the spikes, a told ward after, and no slab on his back.');
process.exitCode = fails.length ? 1 : 0;
