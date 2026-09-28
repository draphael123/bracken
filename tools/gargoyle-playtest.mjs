/* tools/gargoyle-playtest.mjs — THE GATE GARGOYLE after Daniel's playtest of 2026-09-28 (work/claude/lane-done/claude-gargoyle4.md):
     1. "FIRE BREATH IS WAY TOO FAST": a longer yellow tell, a line that stays set for longer, and a jet whose front RUNS OUT along the
        line, so a hero who sees it coming has time to get off it. Asked by stepping src/gate-gargoyle.js in Node against a hero standing
        on its line: how long from the tell's start, and from the line going solid, until the fire first touches him - in both phases.
     2. THE WING GUST IS GONE, A FIREBALL IN ITS PLACE: a told windup (a yellow mark: a shield takes it), then ONE slow ball aimed where
        you are; a slab in its way breaks it; a shield takes it; unguarded it hurts. In Node and then on the page (the real damagePlayer).
     3. "HE MOVES TOO QUICKLY": his flying speed while he hovers and repositions round a hero hopping from slab to slab - the peak and the
        median, px/s - and the dive left as it was.
     4. ONE SUMMONED WHELP AT A TIME: with one of his up, his choice never falls on the shriek (he does another attack), and a shriek
        already under way calls none.
   Every assertion is SOFT and all are printed, so a run on the old code lists everything it did not do. */
import { install } from './node-canvas.mjs';
import { markOf } from '../src/marks.js';
import { readFileSync } from 'fs';
import { openPage } from './cdp.mjs';
install();
const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };
const G = await import('../src/gate-gargoyle.js'), { GARG } = G, DT = 1 / 60;
const src = readFileSync(new URL('../src/gate-gargoyle.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
/* a seeded roll, and a stand-in for main.js's hands on the world */
const seeded = (n = 7) => () => ((n = (n * 1103515245 + 12345) % 2147483648) / 2147483648);
const A = { x0: 0, x1: 900, floor: 400, top: 200 };
function room(o = {}) {
  const P = { x: 400, y: 300, h: 18, dead: false, onMover: null, block: false, ...o.P }, hits = [], log = { spawned: 0, pops: [] };
  const c = { P, A, slabs: o.slabs || [], rnd: seeded(o.seed || 7), hit: (x, d, hard, name) => { const r = P.block && !hard ? 'blocked' : 'hit'; hits.push({ d, hard, name, r, t: log.t }); return r; },
    say() {}, sound() {}, shake() {}, dust() {}, solid: () => false, fire() {}, breakSlab: m => { m.broken = true; }, flare() {}, crash() {},
    adds: () => o.adds || 0, whelp: () => { log.spawned++; }, phase2() {}, pop: (x, y, on) => log.pops.push(on) };
  return { P, c, hits, log };
}
const boss = o => ({ alive: true, mode: 'hover', modeT: 0, phase: 1, hp: 410, maxHp: 410, x: 300, y: 240, face: 1, cd: 99, px0: 880, py0: 150, flareCd: 99, shriekCd: 99, ...o });

// 1. THE FIRE BREATH, SLOWED
function breathTimes(phase) {
  const { P, c, hits, log } = room({ P: { x: 400, y: 300 } }), e = boss({ phase, hp: phase === 2 ? 150 : 410, x: 400 + 96 * GARG.K, y: 296, sd: 1 });
  e.mode = 'hover'; e.cd = 0; e.queue = ['breath']; let t = 0, start = null, set = null, first = null, grow = [];
  for (let f = 0; f < 60 * 8 && first === null; f++) { log.t = t; G.updateGargoyle(e, DT, c); t += DT; P.x = 400; P.y = 300;
    if (start === null && e.mode === 'breathTell') start = t;
    if (set === null && e.mode === 'breathTell' && e.modeT <= GARG.breath.lock) set = t;
    if (e.mode === 'breath' && e.jet) grow.push(Math.round(e.jet[4]));
    if (hits.length) first = t; }
  return { tell: start !== null && first !== null ? +(first - start).toFixed(2) : null, afterSet: set !== null && first !== null ? +(first - set).toFixed(2) : null, jetFirst: grow[0], jetLater: grow[Math.min(grow.length - 1, 12)] };
}
{ const p1 = breathTimes(1), p2 = breathTimes(2);
  console.log('  breath', JSON.stringify({ p1, p2, tell: GARG.tell.breath, lock: GARG.breath.lock, T: GARG.breath.T, sweep: GARG.breath.sweep, travel: GARG.breath.travel }));
  ok(GARG.tell.breath >= 1.4 && GARG.breath.lock >= 0.45, 'THE BREATH\'S TELL IS LONGER: ' + GARG.tell.breath + ' s of it (it was 0.95), the line set for its last ' + GARG.breath.lock + ' s (it was 0.25)');
  ok(p1.tell >= 1.8 && p2.tell >= 1.8, 'from the tell to the fire touching a hero who stands on its line: ' + p1.tell + ' s, and ' + p2.tell + ' s in phase two (it was 0.95 and 0.78)');
  ok(p1.afterSet >= 0.8 && p2.afterSet >= 0.8, 'and from the line going SOLID to the fire reaching him: ' + p1.afterSet + ' s / ' + p2.afterSet + ' s - time to react on sight (it was 0.25)');
  ok(p1.jetFirst !== undefined && p1.jetFirst < 20 && p1.jetLater > p1.jetFirst, 'the jet RUNS OUT along the line from his mouth (' + p1.jetFirst + ' px, then ' + p1.jetLater + ' px), it is not all there at once');
  ok(GARG.breath.sweep <= 0.45, 'in phase two it chases you slowly: ' + GARG.breath.sweep + ' rad/s (it was 0.75)'); }

// 2. THE FIREBALL, IN THE WING GUST'S PLACE
{ ok(markOf({ t: 'gargoyle', mode: 'fireballTell' }) === '!' && !markOf({ t: 'gargoyle', mode: 'gustTell' }), 'THE FIREBALL wears the yellow mark (a shield takes it), and the gust has no mark any more: ' + markOf({ t: 'gargoyle', mode: 'fireballTell' }) + ' / ' + JSON.stringify(markOf({ t: 'gargoyle', mode: 'gustTell' })));
  ok(!/case 'gust|'gustTell'|c\.push\(/.test(src), 'THE WING GUST is out of his kit: no gust mode in src/gate-gargoyle.js, nothing shoves you');
  const picks = {}; if (G.gargChoose) { const r = seeded(3); for (let i = 0; i < 3000; i++) { const w = G.gargChoose({ flareCd: 0, shriekCd: 99 }, { rnd: r, adds: () => 0 }, {}); picks[w] = (picks[w] || 0) + 1; } }
  ok(picks.fireball > 300 && !picks.gust, 'he throws it where the gust was: ' + JSON.stringify(picks));
  ok(G.gargFrame({ mode: 'fireballTell' }) !== G.gargFrame({ mode: 'hover', anim: 0 }) && G.gargFrame({ mode: 'fireballTell' }) !== G.gargFrame({ mode: 'breathTell' }), 'a pose of its own, not the breath\'s: frames ' + G.gargFrame({ mode: 'fireballTell' }) + '/' + G.gargFrame({ mode: 'fireball' }));
  const throwAt = (o = {}) => { const { P, c, hits, log } = room({ P: { x: 400, y: 300, block: !!o.block }, slabs: o.slabs }), e = boss({ x: 400 + 80 * GARG.K, y: 288, cd: 0, queue: ['fireball'] });
    let tell = null, t = 0, v = 0, balls = 0, was = null; for (let f = 0; f < 60 * 8; f++) { log.t = t; G.updateGargoyle(e, DT, c); t += DT; P.x = 400; P.y = 300; e.cd = Math.max(e.cd, 5);
      if (e.mode === 'fireballTell' && tell === null) tell = t; if (e.ball && e.ball !== was) { balls++; was = e.ball; v = Math.hypot(e.ball.vx, e.ball.vy); o.at = o.at ?? +(t - tell).toFixed(2); } if (hits.length) break; }
    return { tell: o.at, v: Math.round(v), balls, hits, pops: log.pops, flying: !!e.ball }; };
  const open = throwAt(), guard = throwAt({ block: true }), slab = throwAt({ slabs: [{ x: 440, y: 270, w: 40, h: 8 }] });
  console.log('  fireball', JSON.stringify({ open, guard, slab }));
  ok(open.tell >= 0.9 && open.balls === 1 && open.v > 0 && open.v <= 110, 'told for ' + open.tell + ' s (the glow), then ONE slow ball: ' + open.balls + ' at ' + open.v + ' px/s (the hero runs 92)');
  ok(open.hits.length === 1 && open.hits[0].hard === false && open.hits[0].d > 0 && open.hits[0].name === 'THE FIREBALL', 'aimed at you it lands, as a blow a shield could take: ' + JSON.stringify(open.hits));
  ok(guard.hits.length === 1 && guard.hits[0].r === 'blocked' && guard.pops.includes('shield'), 'on a shield it bursts: ' + JSON.stringify(guard.pops));
  ok(slab.hits.length === 0 && slab.pops[0] === 'slab' && !slab.flying, 'a slab in its way BREAKS it, and you are not touched: ' + JSON.stringify(slab.pops)); }

// 3. HE MOVES MORE SLOWLY
{ const { P, c } = room(), e = boss({ x: 300, y: 240 }); const sp = [], modes = new Set(['hover', 'recover', 'rise', 'reset']);
  for (let f = 0; f < 60 * 40; f++) { const hop = Math.floor(f / 72) % 2; P.x = hop ? 460 : 320; P.y = hop ? 300 : 252; const x0 = e.x, y0 = e.y; e.cd = 99; G.updateGargoyle(e, DT, c); if (modes.has(e.mode) && f > 30) sp.push(Math.hypot(e.x - x0, e.y - y0) / DT); }
  sp.sort((a, b) => a - b); const peak = Math.round(sp[sp.length - 1]), med = Math.round(sp[sp.length >> 1]), p90 = Math.round(sp[Math.floor(sp.length * 0.9)]);
  console.log('  flying', JSON.stringify({ peak, p90, med, cap: GARG.fly }));
  ok(peak <= 100 && p90 <= 95, 'HE FLIES MORE SLOWLY round a hero hopping slab to slab: peak ' + peak + ' px/s, 90th ' + p90 + ', median ' + med + ' (the old ease streaked well past the hero\'s 92)');
  ok(GARG.diveV === 430 && GARG.tell.dive === 0.95 && GARG.stun === 3.5, 'THE DIVE is as it was (430 px/s, told for 0.95 s) and so is the opening (stunned 3.5 s)');
  /* the dive still comes down on your slab from where his shadow found you */
  const m = { x: 380, y: 300, w: 48, h: 8 }, R = room({ P: { x: 404, y: 300 }, slabs: [m] }); R.P.onMover = m; const d = boss({ x: 150, y: 200, cd: 0, queue: ['dive'] }); let seen = new Set();
  for (let f = 0; f < 60 * 4 && d.mode !== 'land' && d.mode !== 'smash'; f++) { G.updateGargoyle(d, DT, R.c); seen.add(d.mode); }
  ok(seen.has('diveTell') && seen.has('dive') && Math.abs(d.x - 404) < 4 && R.hits.length === 1 && R.hits[0].hard, 'and it still lands where the shadow found you, a blow no shield takes: ' + JSON.stringify({ seen: [...seen], x: Math.round(d.x), hits: R.hits.length })); }

// 4. ONE WHELP OF HIS AT A TIME
{ const n = { up0: 0, up1: 0 }; if (G.gargChoose) { const r = seeded(11); for (let i = 0; i < 3000; i++) { if (G.gargChoose({ flareCd: 0, shriekCd: 0 }, { rnd: r, adds: () => 0 }, {}) === 'shriek') n.up0++; if (G.gargChoose({ flareCd: 0, shriekCd: 0 }, { rnd: r, adds: () => 1 }, {}) === 'shriek') n.up1++; } }
  ok(GARG.whelps === 1, 'GARG.whelps is ONE (it was three): ' + GARG.whelps);
  ok(n.up0 > 100 && n.up1 === 0, 'with none of his up he shrieks now and then (' + n.up0 + ' of 3000); with ONE up, never (' + n.up1 + '): he does another attack instead');
  const call = adds => { const { c, log } = room({ adds }), e = boss({ mode: 'shriek', modeT: 1.1, shriekCd: 0 }); for (let f = 0; f < 80; f++) G.updateGargoyle(e, DT, c); return log.spawned; };
  const c0 = call(0), c1 = call(1); ok(c0 === 1 && c1 === 0, 'a shriek with none up calls ONE (' + c0 + '), and one already under way when a whelp is up calls none (' + c1 + ')'); }

// 5. ON THE PAGE: the fireball against the real hero (damagePlayer and his shield), and the bestiary's words
ok(/spits one slow fireball/.test(main) && !/His wings throw you/.test(main), 'the bestiary says fireball, not wings');
const I = (await import('../src/level.js')).LEVELS.findIndex(l => l.id === 'witchlight');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const out={};
    const boot=h=>{BK.setHero(h);BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);for(const e of BK.enemies())if(e.t!=='gargoyle')e.alive=false;};
    const sl=()=>BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x);const low=()=>sl().filter(m=>m.y===Math.max(...sl().map(q=>q.y))&&!m.broken);
    const on=m=>{const P=BK.P;P.windRide=null;P.x=m.x+m.w/2;P.y=m.y;P.vy=0;P.vx=0;P.onMover=m;P.ground=true;};
    const shot=(h,guard)=>{boot(h);const g=BK.enemies().find(e=>e.t==='gargoyle');const m=low()[3];on(m);BK.sim(150);for(const q of sl())if(q!==m)q.broken=true;   /* nothing between him and you: the slab case is asked in Node */g.mode='hover';g.cd=99;BK.sim(2);
      BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.grace=0;const hp0=BK.P.hp;g.x=BK.P.x+110;g.y=BK.P.y-12;g.mode='fireballTell';g.modeT=${GARG.tell.fireball};g.sd=1;
      let thrown=false,gone=false,f=0;for(;f<400;f++){on(m);BK.P.face=1;if(guard)BK.keys.block=true;g.cd=99;if(g.mode==='hover'||g.mode==='recover'){g.x=BK.P.x+110;}BK.sim(1);if(g.ball)thrown=true;if(thrown&&!g.ball){gone=true;break;}}
      BK.keys.block=false;const o={h,thrown,gone,took:hp0-BK.P.hp,secs:+(f/60).toFixed(2)};BK.god=true;return o;};
    out.open=shot('pyro',false);out.guard=shot('knight',true);out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.open.thrown && r.open.gone && r.open.took > 0, 'ON THE PAGE the fireball flies and lands on a hero who stays put: ' + JSON.stringify(r.open));
  ok(r.guard.thrown && r.guard.gone && r.guard.took === 0, 'and the knight\'s shield takes it: ' + JSON.stringify(r.guard));
  ok(pg.errors.length === 0 && r.errors.length === 0, 'no errors on the page: ' + JSON.stringify(pg.errors.slice(0, 3).concat(r.errors)));
} finally { await pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTHE GATE GARGOYLE, PLAYTESTED: a breath you can read, a fireball for the gust, slower wings, one whelp at a time.');
process.exitCode = fails.length ? 1 : 0;
