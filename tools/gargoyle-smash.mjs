/* tools/gargoyle-smash.mjs — THE GATE GARGOYLE, REWORKED (docs/briefs/gargoyle-rework.md; Daniel, 2026-09-25: "The boss needs to be
   much further zoomed out, and the platforms don't need to be quite as high up. I'd like the boss to be bigger, and also be able to
   smash through platforms and fall on the floor and get stunned if he does this.")
   It asks, in Node and then on the page:
     1. HIS ROOM: an arena of about forty tiles (A7: <= 46), its slabs 5-7 rows over the garden floor (they were 11-13), the rune
        columns lifting from that floor past them, and the floor under the slabs reached (the garden is where you punish him).
     2. BIGGER: 45 px (he was 30), drawn at the new size, and every frame inside its own canvas (E6) - no pixel on its top row or its
        side columns, and a STUNNED pose and a CRASH pose of his own.
     3. THE CAMERA frames him and you together (gargCam): you always on screen, him too when you are a screen apart, the floor in it.
     4. ON THE PAGE: the zoomed-out view comes on when he wakes; the same dive three ways - a slab LEFT LATE breaks under him and he
        CRASHES TO THE FLOOR, STUNNED for GARG.stun seconds, every blow counting twice; a slab KEPT is a hit and a landing, and opens
        nothing; a slab left EARLY only moves his aim. A hero under the slab he comes through is hit. The slab grows back after
        GARG.regrow seconds, slower in phase two, and never fewer than GARG.minLive slabs stand.
   Every assertion is SOFT and all are printed, so a run on the old code lists everything the old fight did not do. */
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { openPage } from './cdp.mjs';
install();
const G = await import('../src/gate-gargoyle.js'), D = await import('../src/redraw/queue_bosses.js');
const { GARG } = G, fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };
const TS = 16, I = LEVELS.findIndex(l => l.id === 'witchlight'), L = LEVELS[I].build(), A = L.arena;
// 1. his room
const wide = (A.x1 - A.x0) / TS, floorRow = A.floor / TS, sl = L.ents.filter(e => e.t === 'mover' && e.arena);
ok(wide <= 46 && wide >= 34, 'A7: the arena is about forty tiles, not 79: ' + wide);
const ups = sl.map(e => floorRow - e.y); ok(sl.length >= 5 && ups.every(u => u >= 5 && u <= 7), 'his slabs are 5-7 rows over the garden floor: ' + ups.join(' '));
const lifts = L.ents.filter(e => e.t === 'vent' && e.rune && e.x > A.x0 / TS && e.x < A.x1 / TS);
ok(lifts.length >= 3 && lifts.every(v => v.y === floorRow - 1 && v.y + 1 - v.h / TS < Math.min(...sl.map(e => e.y))), 'three rune columns lift from the garden floor past the slabs: ' + lifts.map(v => v.x).join(' '));
{ const R = floodReach(L, T, { rides: true }), at = (x, y) => R.seen.has(x + ',' + y);
  let floor = 0; for (let x = Math.ceil(A.x0 / TS) + 1; x < A.x1 / TS; x++) if (at(x, floorRow - 1)) floor++;
  ok(floor >= wide * 0.8, 'the garden floor under the slabs is walked: ' + floor + ' of ' + wide + ' columns'); }
// 2. bigger, and inside his canvas
const S = D.bakeGateGargoyle();
ok(S.w >= 44 && S.h >= 44 && S.R[0].width >= 120, 'drawn at 45 px (he was 30): box ' + S.w + 'x' + S.h + ', sheet ' + S.R[0].width + 'x' + S.R[0].height);
{ const edge = S.R.map((c, f) => { const d = c._d, W = c.width, H = c.height; let n = 0; for (let x = 0; x < W; x++) if (d[x * 4 + 3]) n++;
    for (let y = 0; y < H; y++) { if (d[(y * W) * 4 + 3]) n++; if (d[(y * W + W - 1) * 4 + 3]) n++; } return n ? f + ':' + n : null; }).filter(Boolean);
  ok(edge.length === 0, 'E6: no frame touches the top or the sides of its canvas: ' + (edge.join(' ') || 'none')); }
ok(typeof G.gargFrame === 'function' && G.gargFrame({ mode: 'stunned' }) !== G.gargFrame({ mode: 'hover', anim: 0 }) && G.gargFrame({ mode: 'crash' }) !== G.gargFrame({ mode: 'stunned' }) && G.gargFrame({ mode: 'stunned' }) < S.R.length && G.gargFrame({ mode: 'crash' }) < S.R.length, 'a STUNNED pose and a CRASH pose of his own');
ok(G.gargOpen && G.gargOpen({ mode: 'stunned' }) && !G.gargOpen({ mode: 'hang' }), 'his opening is the stun on the floor, not the hang');
ok(typeof GARG.smashAny === 'boolean' && GARG.stun >= 2 && GARG.stun <= 3 && GARG.stunMul === 2 && GARG.regrowP2 > GARG.regrow && GARG.regrow > 0 && GARG.minLive >= 3, 'the numbers: smashAny ' + GARG.smashAny + ', stun ' + GARG.stun + ', x' + GARG.stunMul + ', regrow ' + GARG.regrow + '/' + GARG.regrowP2 + ', minLive ' + GARG.minLive);
// 3. the camera
if (typeof G.gargCam !== 'function') ok(false, 'gargCam frames him and you');
else { const Ar = { x0: A.x0, x1: A.x1, floor: A.floor, top: A.top }, bad = [];
  for (const [VW, VH] of [[480, 270], [640, 360], [512, 288]]) for (const px of [A.x0 + 40, (A.x0 + A.x1) / 2, A.x1 - 40]) for (const ex of [A.x0 + 30, A.x1 - 30]) for (const [py, ey] of [[sl[0].y * TS, A.top - 60], [A.floor, A.floor], [sl[0].y * TS, A.top - 120]]) {
    const [tx, ty] = G.gargCam({ x: px, y: py }, { x: ex, y: ey, h: 45 }, Ar, VW, VH);
    if (px < tx + 24 || px > tx + VW - 24 || py - 30 < ty || py > ty + VH - 8) bad.push('hero off ' + [VW, px, ex, py].join('/'));
    else if (Math.abs(px - ex) < VW - 96 && (ex < tx || ex > tx + VW)) bad.push('boss off ' + [VW, px, ex].join('/'));
    else if (py < A.floor && ty + VH < A.floor + 4) bad.push('floor off ' + [VW, VH, py].join('/')); }
  ok(bad.length === 0, 'the camera keeps you in the frame, him with you when you are within a screen, and the garden floor: ' + (bad.slice(0, 4).join(', ') || 'always')); }
// 4. on the page
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const out={};
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);
      const g=BK.enemies().find(e=>e.t==='gargoyle');for(const e of BK.enemies())if(e!==g)e.alive=false;return g;};
    let g=boot();const sl=()=>BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x),A=BK.L.arena;
    const on=m=>{BK.P.x=m.x+m.w/2;BK.P.y=m.y;BK.P.vy=0;BK.P.onMover=m;BK.P.ground=true;};
    const v0=BK.view.VW;on(sl()[1]);BK.sim(150);out.wake={active:!!BK.bossActive,VW0:v0,VW:BK.view.VW,VH:BK.view.VH,w:g.w,h:g.h};
    const next=m=>sl().filter(q=>q!==m&&!q.broken).sort((a,b)=>Math.abs(a.x-m.x)-Math.abs(b.x-m.x))[0];
    const dive=(m,how,phase)=>{g.mode='hover';g.hp=phase===2?Math.floor(g.maxHp*0.4):g.maxHp;g.phase=phase||1;g.cd=99;g.queue=[];g.paired=true;BK.sim(2);on(m);
      g.mode='diveTell';g.modeT=0.4;g.tgt=m;g.off=m.w/2;g.cd=99;BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;const hp0=BK.P.hp;
      if(how==='early')on(next(m));if(how==='under'){BK.P.x=m.x+m.w/2;BK.P.y=A.floor;BK.P.onMover=null;BK.P.vy=0;}
      for(let i=0;i<120&&g.mode==='diveTell';i++){if(how==='late'||how==='stay')on(m);BK.sim(1);}
      if(how==='late')on(next(m));const seen=new Set();let low=-1e9;
      for(let i=0;i<240&&['dive','smash','crash','diveTell'].includes(g.mode);i++){if(how==='stay')on(m);if(how==='under'&&!BK.P.dead){BK.P.x=g.x;}BK.sim(1);seen.add(g.mode);low=Math.max(low,g.y);}
      const o={mode:g.mode,seen:[...seen],open:+(g.open||0).toFixed(2),broken:!!m.broken,aim:g.tgt===m,dy:Math.round(A.floor-g.y),low:Math.round(A.floor-low),hit:hp0-BK.P.hp};BK.god=true;BK.P.hp=BK.P.maxHp;return o;};
    const regrowAll=()=>{for(const m of sl())if(m.broken){m.brokenT=0;}BK.sim(3);};
    /* LEFT LATE: he goes through it to the garden, stunned */
    {const m=sl().find(q=>!q.cracked)||sl()[0];const o=dive(m,'late');out.late=o;
     const hold=()=>{g.cd=99;};const hp1=g.hp;BKT.hurtEnemy(g,10,g.x-20,false);out.late.dmgOpen=hp1-g.hp;
     let f=0;for(;f<400&&g.mode==='stunned';f++){hold();BK.sim(1);}out.late.stunSecs=+(f/60+(${GARG.stun || 0}-(o.open||0))).toFixed(2);out.late.after=g.mode;
     g.mode='hover';g.modeT=1;g.cd=99;BK.sim(5);const hp2=g.hp;BKT.hurtEnemy(g,10,g.x-20,false);out.late.dmgShut=hp2-g.hp;
     /* and the slab he broke comes back */
     let t=0;for(;t<60*20&&m.broken;t++){g.mode='hover';g.cd=99;BK.sim(1);}out.late.regrow=+(t/60).toFixed(1);}
    /* KEPT: a hit, a landing, nothing open */
    regrowAll();{const m=sl().find(q=>!q.cracked)||sl()[0];out.stay=dive(m,'stay');}
    /* EARLY: only his aim moves */
    regrowAll();{const m=sl().find(q=>q.cracked)||sl()[2];out.early=dive(m,'early');}
    /* UNDER IT: a hero on the garden floor under the slab he comes through is hit */
    regrowAll();{const m=sl()[2];out.under=dive(m,'under');}
    /* PHASE TWO: a broken slab takes longer to come back */
    regrowAll();{const m=sl().find(q=>!q.cracked)||sl()[0];const o=dive(m,'late',2);let t=0;for(;t<60*30&&m.broken;t++){g.mode='hover';g.cd=99;BK.sim(1);}o.regrow=+(t/60).toFixed(1);out.p2=o;}
    /* NEVER FEWER THAN minLive STAND */
    regrowAll();{let least=99;for(const m of sl()){g.mode='hover';g.cd=99;const s=sl();if(BK.gargBreak)BK.gargBreak(m);least=Math.min(least,sl().filter(q=>!q.broken).length);BK.sim(1);}out.live={least,n:sl().length,api:!!BK.gargBreak};}
    out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.wake.active && r.wake.VW > r.wake.VW0 && r.wake.VW > 320, 'the zoomed-out view comes on when he wakes: ' + r.wake.VW0 + ' -> ' + r.wake.VW + 'x' + r.wake.VH);
  ok(r.wake.w >= 44 && r.wake.h >= 44, 'his body is 45 px: ' + r.wake.w + 'x' + r.wake.h);
  ok(r.late.broken && r.late.seen.includes('crash') && r.late.mode === 'stunned' && Math.abs(r.late.dy) <= 4 && r.late.open >= GARG.stun - 0.3, 'LEFT LATE: the slab breaks, he crashes to the garden floor and lies there stunned, open: ' + JSON.stringify(r.late));
  ok(r.late.dmgShut > 0 && r.late.dmgOpen >= 2 * r.late.dmgShut - 1, 'stunned, every blow counts twice: ' + r.late.dmgOpen + ' vs ' + r.late.dmgShut);
  ok(Math.abs(r.late.stunSecs - GARG.stun) < 0.35 && r.late.after !== 'stunned', 'the stun lasts about ' + GARG.stun + ' s and ends: ' + r.late.stunSecs);
  ok(Math.abs(r.late.regrow - GARG.regrow) < 1.2, 'the slab grows back after about ' + GARG.regrow + ' s: ' + r.late.regrow);
  ok(!r.stay.broken && r.stay.mode === 'land' && r.stay.open === 0 && r.stay.hit > 0, 'KEPT: his dive hits you and he lands on the slab; nothing opens: ' + JSON.stringify(r.stay));
  ok(!r.early.broken && !r.early.aim && r.early.open === 0, 'LEFT EARLY: only his aim moves: ' + JSON.stringify(r.early));
  ok(r.under.broken && r.under.hit > 0, 'a hero under the slab he comes through is hit: ' + JSON.stringify(r.under));
  ok(r.p2.broken && r.p2.regrow > r.late.regrow + 2 && Math.abs(r.p2.regrow - GARG.regrowP2) < 1.2, 'phase two: a broken slab comes back slower (' + r.p2.regrow + ' s, was ' + r.late.regrow + ')');
  ok(r.live.api && r.live.least >= GARG.minLive, 'never fewer than ' + GARG.minLive + ' slabs stand: ' + JSON.stringify(r.live));
  ok(pg.errors.length === 0 && r.errors.length === 0, 'no errors on the page: ' + JSON.stringify(pg.errors.slice(0, 3).concat(r.errors)));
} finally { await pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTHE GATE GARGOYLE: zoomed out, in a room of forty tiles with its slabs lowered, half as big again, and a slab left late puts him through it onto the garden floor, stunned.');
process.exitCode = fails.length ? 1 : 0;
