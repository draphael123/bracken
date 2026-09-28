/* tools/gargoyle-stomp.mjs — THE GATE GARGOYLE, ROUND THREE, and the battlements he rules (Daniel's design, 2026-09-27:
   docs/briefs/gargoyle-spikes.md). "FIRE BREATH attacks. The arena floor is SPIKES. MANY MORE platforms. He DIVES at the player; if he
   crashes down THROUGH a platform he lands stunned on the spikes. Broken platforms REGROW after a few seconds. He is INVULNERABLE except
   then: while he is stunned on the spikes the player must JUMP ON HIM (stomp) to deal damage. After the stomp, WINDS carry the player
   back up and the boss resets. A player who falls onto the spikes takes ONE hit and wind tunnels carry them back up. The REGULAR
   gargoyles in that section of the level work the same way. Redesign that section and make it about 2x as long."
   It asks, in Node and then on the page:
     1. THE ROOM: a floor of spikes the whole width with its wind; twelve slabs or more in two tiers, no gap on a tier over two tiles and
        the tiers a hop apart; no rune columns (nothing stands on spikes).
     2. THE SECTION: the battlements about twice the hundred columns they were, spiked moat along them with its winds, cracked ledges
        (brittle, growing back), and every whelp in it over spikes it can be stomped on.
     3. THE RULES, in the modules: he and his whelps take nothing but a stomp, and only on the spikes; his fire breath is a yellow tell.
     4. ON THE PAGE: blades, burns and shots take nothing off him, awake or stunned; a slab left late puts him through it onto the spikes,
        stunned; a stomp there takes GARG.stompDmg, the wind carries the hero up to a slab with no bite, and he resets; the broken slab
        grows back in about GARG.regrow s; a hero who falls onto the arena's spikes loses ONE bite and is carried up to a slab, and one who
        falls into the battlements' moat is carried back to footing at or behind where he fell; the fire breath is told (its line sets)
        and lands, and a shield takes it; a whelp is stone, dives through a cracked ledge onto the spikes, is broken only by a stomp
        there, and the ledge grows back.
   Every assertion is SOFT and all are printed, so a run on the old code lists everything the old fight did not do. */
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { markOf } from '../src/marks.js';
import { openPage } from './cdp.mjs';
install();
const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };
const G = await import('../src/gate-gargoyle.js'), WHF = await import('../src/gargoyle-whelp.js');
let SW = null; try { SW = await import('../src/spike-winds.js'); } catch (err) { ok(false, 'src/spike-winds.js loads: ' + err.message); }
const { GARG } = G, TS = 16, I = LEVELS.findIndex(l => l.id === 'witchlight'), L = LEVELS[I].build(), A = L.arena, WL = (await import('../src/witchlight.js')).WL;
const at = (x, y) => L.grid[y * L.W + x];
// 1. the room
const x0 = A.x0 / TS, x1 = A.x1 / TS, fr = A.floor / TS - 1, winds = L.winds || [];
{ let sp = 0; for (let x = x0; x <= x1; x++) if (at(x, fr) === T.SPIKE) sp++; ok(sp === x1 - x0 + 1, 'THE FLOOR IS SPIKES: ' + sp + ' of ' + (x1 - x0 + 1) + ' columns');
  ok(winds.some(z => z.arena && z.x0 <= x0 && z.x1 >= x1 && z.row === fr && (z.wells || []).length >= 3), 'and its wind, with wells in it: ' + JSON.stringify(winds.filter(z => z.arena))); }
const sl = L.ents.filter(e => e.t === 'mover' && e.arena), tiers = [...new Set(sl.map(e => e.y))].sort((a, b) => a - b);
ok(sl.length >= 12 && tiers.length === 2, 'MANY MORE PLATFORMS: ' + sl.length + ' slabs (there were six), in ' + tiers.length + ' tiers (rows ' + tiers.join(', ') + ')');
ok(tiers.length === 2 && tiers[1] - tiers[0] <= 3 && fr + 1 - tiers[1] >= 4, 'the tiers a hop apart (the jump rises three) and the low one over the spikes: ' + tiers.join(' ') + ' over ' + (fr + 1));
for (const row of tiers) { const t = sl.filter(e => e.y === row).map(e => [e.x, e.x + (e.len || 3) - 1]).sort((a, b) => a[0] - b[0]), gaps = t.slice(1).map((q, i) => q[0] - t[i][1] - 1);
  ok(gaps.every(g => g >= 1 && g <= 2), 'row ' + row + ': no gap over two tiles: ' + gaps.join(' ')); }
ok(!L.ents.some(e => e.t === 'vent' && e.x >= x0 && e.x <= x1), 'no rune columns in his room: nothing stands on spikes, the wind brings you up');
// 2. the section
{ const [b0, b1] = L.places.battlements; ok(b1 - b0 + 1 >= 190 && b1 < WL.ARENA.x0, 'THE BATTLEMENTS are twice as long: ' + (b1 - b0 + 1) + ' columns (they were 100)');
  const zs = winds.filter(z => !z.arena && z.x0 >= b0 && z.x1 <= b1); let sp = 0; for (const z of zs) for (let x = z.x0; x <= z.x1; x++) if (at(x, z.row) === T.SPIKE) sp++;
  ok(zs.length >= 5 && sp >= 120, 'a spiked moat along them, with its winds: ' + zs.length + ' stretches, ' + sp + ' columns of spikes');
  ok(zs.every(z => (z.exits || []).length && z.exits.every(([x]) => x <= z.x1 + 1) && z.exits.some(([x]) => x < z.x0)), 'every stretch\'s wind has an exit behind it, none past its end: a fall never skips ahead');
  const cr = L.ents.filter(e => e.t === 'mover' && e.brittle && e.x >= b0 && e.x <= b1); ok(cr.length >= 6 && cr.every(e => e.cracked && !e.range && e.regrow > 0 && e.regrow <= 6), 'cracked ledges a whelp dives through, which grow back in a few seconds: ' + cr.map(e => e.x).join(' '));
  const wh = L.ents.filter(e => e.t === 'whelp' && e.x >= b0 && e.x <= b1), over = e => zs.some(z => e.x >= z.x0 - 6 && e.x <= z.x1 + 6);
  ok(wh.length >= 9 && wh.every(over), 'every whelp in the section sits over spikes it can be stomped on: ' + wh.map(e => e.x + (over(e) ? '' : '!')).join(' '));
  const teach = wh.find(e => cr.some(m => Math.abs(m.x + 1 - e.x) <= 3 && m.y > e.y && m.x < b0 + 25)); ok(!!teach, 'TAUGHT first: a whelp over a cracked ledge above a shallow trench of spikes, at the section\'s start'); }
// 3. the rules
ok(GARG.stomps >= 4 && GARG.stomps <= 6 && GARG.stompDmg * GARG.stomps >= GARG.hp && GARG.regrow <= 5 && GARG.regrowP2 <= 6, 'the numbers: ' + GARG.stomps + ' stomps of ' + GARG.stompDmg + ', regrow ' + GARG.regrow + '/' + GARG.regrowP2 + ' s, stun ' + GARG.stun + ' s');
ok(G.gargTake({ mode: 'hover' }, 50) === 0 && G.gargTake({ mode: 'stunned' }, 50) === 0 && G.gargTake({ mode: 'stunned', stompNow: 82 }, 50) === 82 && G.gargTake({ mode: 'hover', stompNow: 82 }, 50) === 0, 'HE IS STONE: nothing but a stomp, and that only while he is stunned');
ok(WHF.whelpTake({ mode: 'perch' }, 30) === 0 && WHF.whelpTake({ mode: 'landed' }, 30) === 0 && WHF.whelpTake({ mode: 'stuck' }, 30) === 0 && WHF.whelpTake({ mode: 'stuck', stompNow: 28 }, 30) === 28, 'SO IS A WHELP: nothing but a stomp, and that only while it is stuck on the spikes');
ok(markOf({ t: 'gargoyle', mode: 'breathTell' }) === '!' && G.gargFrame({ mode: 'breathTell' }) !== G.gargFrame({ mode: 'hover', anim: 0 }), 'THE FIRE BREATH is told: a yellow mark (a shield takes it) and a pose of its own');
if (SW) ok(SW.windBite({ maxHp: 100, hp: 100 }) === 20 && SW.windBite({ maxHp: 100, hp: 5 }) === 4, 'ONE bite: a fifth of his health, never the last point');
// 4. on the page
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const out={};let A=null;const sp=()=>BK.SET.speed||1;
    const boot=keep=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);for(const e of BK.enemies())if(!keep(e))e.alive=false;};
    const sl=()=>BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x);
    const on=m=>{const P=BK.P;P.windRide=null;P.x=m.x+m.w/2;P.y=m.y;P.vy=0;P.vx=0;P.onMover=m;P.ground=true;};
    const hurt=()=>{BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.grace=0;};
    boot(e=>e.t==='gargoyle');A=BK.L.arena;const g=BK.enemies().find(e=>e.t==='gargoyle');const low=()=>sl().filter(m=>m.y===Math.max(...sl().map(q=>q.y))&&!m.broken);
    on(low()[1]);BK.sim(150);out.wake={active:!!BK.bossActive,mode:g.mode};
    /* STONE: a blade, a burn, while he hovers and while he is stunned */
    g.mode='hover';g.cd=99;BK.sim(2);let h0=g.hp;BKT.hurtEnemy(g,40,g.x-20,false);g.burn=2;BK.sim(60);out.stoneHover=h0-g.hp;g.burn=0;
    const smash=m=>{g.mode='hover';g.cd=99;g.queue=[];g.paired=true;BK.sim(2);on(m);g.mode='diveTell';g.modeT=0.4;g.tgt=m;g.off=m.w/2;
      for(let i=0;i<120&&g.mode==='diveTell';i++){on(m);BK.sim(1);}const n=low().filter(q=>q!==m).sort((a,b)=>Math.abs(a.x-m.x)-Math.abs(b.x-m.x))[0];on(n);
      const seen=new Set();for(let i=0;i<240&&['dive','smash','crash'].includes(g.mode);i++){g.cd=99;on(n);BK.sim(1);seen.add(g.mode);}return {seen:[...seen],mode:g.mode,broken:!!m.broken,dy:Math.round(A.floor-g.y),n};};
    {const m=low()[2];const o=smash(m);out.smash={seen:o.seen,mode:o.mode,broken:o.broken,dy:o.dy};
     h0=g.hp;BKT.hurtEnemy(g,40,g.x-20,false);g.burn=1;BK.sim(20);g.burn=0;out.stoneStunned=h0-g.hp;
     /* THE STOMP: down onto his back from over him */
     hurt();const hp0=BK.P.hp;const P=BK.P;P.onMover=null;P.ground=false;P.x=g.x;P.y=g.y-g.h-40;P.vy=120;h0=g.hp;let rode=false,why=null,t=0,landed=null;
     for(;t<400;t++){BK.sim(1);if(P.windRide){rode=true;why=why||P.windRide.why;}if(rode&&!P.windRide&&P.ground){landed=P.onMover&&P.onMover.arena?'slab':'ground';break;}}
     out.stomp={took:h0-g.hp,mode:g.mode,rode,why,landed,secs:+(t/60).toFixed(2),bite:hp0-BK.P.hp,rowUp:Math.round((A.floor-P.y)/16)};BK.god=true;
     let k=0;for(;k<300&&g.mode!=='hover';k++){g.cd=99;BK.sim(1);}out.stomp.reset=g.mode;
     /* THE SLAB GROWS BACK */
     let w=0;for(;w<60*20&&m.broken;w++){g.mode='hover';g.cd=99;BK.sim(1);}out.regrow=+((w+t+k+20)*sp()/60).toFixed(1);}
    /* A FALL ONTO HIS SPIKES: one bite, and up to a slab */
    {g.mode='hover';g.cd=99;hurt();const P=BK.P,hp0=P.hp;P.windRide=null;P.onMover=null;P.ground=false;P.x=low()[3].x-10;P.y=A.floor-60;P.vy=0;let t=0,rode=false,land=null;
     for(;t<600;t++){g.cd=99;BK.sim(1);if(P.windRide)rode=true;if(rode&&!P.windRide&&P.ground){land=P.onMover&&P.onMover.arena?'slab':'?';break;}}
     const bite=hp0-P.hp;g.cd=99;BK.sim(120);out.fall={rode,land,bite,after:hp0-P.hp,max:P.maxHp,secs:+(t/60).toFixed(2)};BK.god=true;}
    /* THE FIRE BREATH: told (its line follows, then sets), then a jet: it lands unguarded; a shield takes it */
    const breath=guard=>{g.mode='hover';g.cd=99;const m=low()[3];on(m);BK.sim(5);hurt();const hp0=BK.P.hp;g.mode='breathTell';g.modeT=${GARG.tell.breath};g.sd=1;g.aim=null;g.x=BK.P.x+120;g.y=BK.P.y-44;
      const aims=[];let seen=new Set();for(let i=0;i<150&&(g.mode==='breathTell'||g.mode==='breath');i++){on(m);if(guard){BK.keys.block=true;BK.P.face=1;}BK.sim(1);seen.add(g.mode);if(g.mode==='breathTell')aims.push([+g.modeT.toFixed(3),g.aim]);}
      BK.keys.block=false;const late=aims.filter(a=>a[0]<${GARG.breath.lock}-0.02),set=late.length>1&&late.every(a=>Math.abs(a[1]-late[0][1])<1e-9);const o={seen:[...seen],set,took:hp0-BK.P.hp};BK.god=true;return o;};
    out.breath={open:breath(false),guard:breath(true)};
    /* THE BATTLEMENTS' MOAT: fall in, one bite, back at or behind where you fell */
    {boot(()=>false);const P=BK.P;BK.tp(404,33);hurt();const hp0=P.hp;P.vy=0;let t=0,rode=false;for(;t<600;t++){BK.sim(1);if(P.windRide)rode=true;if(rode&&!P.windRide&&P.ground)break;}
     out.moat={rode,bite:hp0-P.hp,x:Math.floor(P.x/16),row:Math.round(P.y/16)-1,secs:+(t/60).toFixed(2)};BK.god=true;}
    /* THE WHELP: stone; it dives through the cracked ledge onto the spikes; only a stomp breaks it there; the ledge grows back */
    {boot(e=>e.t==='whelp'&&e.x>=374*16&&e.x<=378*16);const w=BK.enemies().find(e=>e.t==='whelp'&&e.alive);const P=BK.P;const led=BK.movers().find(m=>m.brittle&&m.x>=373*16&&m.x<=375*16);
     const h1=w.hp;BKT.hurtEnemy(w,30,w.x-20,false);out.whelp={stone:h1-w.hp};
     P.x=led.x+led.w/2;P.y=led.y;P.vy=0;P.onMover=led;P.ground=true;w.cd=0;w.seen=true;let i=0;for(;i<120&&w.mode!=='swoop';i++)BK.sim(1);
     P.x=led.x-40;P.y=led.y;P.onMover=null;P.vy=0;BK.sim(1);const seen=new Set();for(i=0;i<240&&w.mode!=='stuck'&&w.mode!=='landed';i++){BK.sim(1);seen.add(w.mode);}
     out.whelp.seen=[...seen];out.whelp.mode=w.mode;out.whelp.broke=!!led.broken;
     const h2=w.hp;BKT.hurtEnemy(w,30,w.x-20,false);out.whelp.bladeStuck=h2-w.hp;
     hurt();const hp0=P.hp;P.onMover=null;P.ground=false;P.x=w.x;P.y=w.y-w.h-30;P.vy=150;let rode=false;for(i=0;i<300;i++){BK.sim(1);if(P.windRide)rode=true;if(!w.alive&&rode&&!P.windRide)break;}
     out.whelp.stomp={alive:w.alive,rode,bite:hp0-P.hp,x:Math.floor(P.x/16)};BK.god=true;let t=0;for(;t<60*10&&led.broken;t++)BK.sim(1);out.whelp.regrow=+((t+i)*sp()/60).toFixed(1);out.whelp.back=!led.broken;}
    out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.wake.active, 'he wakes when you come onto his slabs: ' + JSON.stringify(r.wake));
  ok(r.stoneHover === 0 && r.stoneStunned === 0, 'INVULNERABLE: a blade and a burn take ' + r.stoneHover + ' while he hovers and ' + r.stoneStunned + ' while he lies stunned');
  ok(r.smash.broken && r.smash.seen.includes('crash') && r.smash.mode === 'stunned' && Math.abs(r.smash.dy) <= 4, 'a slab LEFT LATE: he smashes through it and lands STUNNED ON THE SPIKES: ' + JSON.stringify(r.smash));
  ok(r.stomp.took === GARG.stompDmg, 'THE STOMP takes ' + r.stomp.took + ' (GARG.stompDmg ' + GARG.stompDmg + ')');
  ok(r.stomp.rode && r.stomp.why === 'stomp' && r.stomp.landed === 'slab' && r.stomp.bite === 0 && r.stomp.secs < 4, 'after the stomp THE WIND carries you up to a slab, without a bite: ' + JSON.stringify(r.stomp));
  ok(r.stomp.reset === 'hover' && r.stomp.mode !== 'stunned', 'and he RESETS: off the spikes, back over his slabs: ' + r.stomp.mode + ' -> ' + r.stomp.reset);
  ok(Math.abs(r.regrow - GARG.regrow) < 1.5, 'the slab he broke GROWS BACK in about ' + GARG.regrow + ' s: ' + r.regrow);
  ok(r.fall.rode && r.fall.land === 'slab' && r.fall.bite === Math.round(r.fall.max * 0.2) && r.fall.after === r.fall.bite, 'a fall onto his spikes is ONE bite (' + r.fall.bite + ', and ' + r.fall.after + ' after two more seconds) and the wind carries you up to a slab: ' + JSON.stringify(r.fall));
  ok(r.breath.open.seen.includes('breath') && r.breath.open.set && r.breath.open.took > 0, 'THE FIRE BREATH is told - its line follows you, then SETS - and lands: ' + JSON.stringify(r.breath.open));
  ok(r.breath.guard.took === 0, 'a shield takes the fire: ' + JSON.stringify(r.breath.guard));
  ok(r.moat.rode && r.moat.bite > 0 && r.moat.x <= 404 && r.moat.row < 32, 'a fall into the battlements\' moat: one bite, and the wind puts you back at or behind where you fell: ' + JSON.stringify(r.moat));
  ok(r.whelp.stone === 0, 'A WHELP IS STONE on its perch: a 30-point blow takes ' + r.whelp.stone);
  ok(r.whelp.broke && r.whelp.mode === 'stuck', 'it dives THROUGH the cracked ledge you left and sticks on the spikes: ' + JSON.stringify(r.whelp));
  ok(r.whelp.bladeStuck === 0 && !r.whelp.stomp.alive && r.whelp.stomp.rode && r.whelp.stomp.bite === 0, 'stuck, a blade still takes nothing - a stomp breaks it and the wind brings you up: ' + JSON.stringify(r.whelp.stomp) + ', blade ' + r.whelp.bladeStuck);
  ok(r.whelp.back && r.whelp.regrow <= 5, 'and the cracked ledge grows back: ' + r.whelp.regrow + ' s');
  ok(pg.errors.length === 0 && r.errors.length === 0, 'no errors on the page: ' + JSON.stringify(pg.errors.slice(0, 3).concat(r.errors)));
} finally { await pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTHE GATE GARGOYLE, ROUND THREE: stone over a floor of spikes, broken only by a stomp when his own dive puts him there; the winds bring you back; his whelps the same, on battlements twice as long.');
process.exitCode = fails.length ? 1 : 0;
