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
   ROUND FIVE (claude/gargoyle5, the same playtest): 5. HIS FIREBALLS ARE TWO, thrown one at a time (a told throw, a beat, a second told
     throw), each slow, aimed, shield-blockable and broken on slabs; 6. THE BREATH DRAWN AS FIRE (a white-hot core at his mouth, red and
     smoke at its front, tongues licking up, embers) with its timing and hitbox exactly as round four left them; 7. THE FIREBALL'S OWN POSE
     (frames 5-6, jaws lit) instead of the wing gust's.
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
  /* one volley, watched to its end: every ball he lets go (whatever holds them - e.ball before round five, e.balls since), when, from
     where, how fast, and how many separate tells (glows) came before them. The hero stands still (o.move drops him a tier, px down, once the first is thrown) */
  const throwAt = (o = {}) => { const { P, c, hits, log } = room({ P: { x: 400, y: 300, block: !!o.block }, slabs: o.slabs }), e = boss({ x: 400 + 80 * GARG.K, y: 288, cd: 0, queue: ['fireball'] });
    let t = 0, tell0 = null, tells = 0, prev = null, py = 300; const seen = new Set(), thrown = [];
    for (let f = 0; f < 60 * 9; f++) { log.t = t; G.updateGargoyle(e, DT, c); t += DT; if (o.move && thrown.length) py = 300 + o.move; P.x = 400; P.y = py; e.cd = Math.max(e.cd, 5);
      if (e.mode === 'fireballTell' && prev !== 'fireballTell') { tells++; if (tell0 === null) tell0 = t; } prev = e.mode;
      for (const b of (e.balls || (e.ball ? [e.ball] : []))) if (!seen.has(b)) { seen.add(b); thrown.push({ t: +(t - tell0).toFixed(2), v: Math.round(Math.hypot(b.vx, b.vy)), x: b.x, vx: b.vx, others: [...seen].filter(q => q !== b && (e.balls || [e.ball]).includes(q)).map(q => Math.round(Math.hypot(q.x - b.x, q.y - b.y))) }); } }
    return { tells, thrown, hits, pops: log.pops, flying: (e.balls || (e.ball ? [e.ball] : [])).length, end: e.mode }; };
  const open = throwAt(), guard = throwAt({ block: true }), slab = throwAt({ slabs: [{ x: 440, y: 270, w: 40, h: 8 }] }), moved = throwAt({ move: 40 });
  console.log('  fireball', JSON.stringify({ open, guard, slab, moved }));
  const gap = open.thrown.length > 1 ? +(open.thrown[1].t - open.thrown[0].t).toFixed(2) : null;
  ok(open.thrown.length === 2 && open.tells === 2 && open.thrown.every(b => b.v > 0 && b.v <= 110), 'HIS FIREBALLS ARE TWO, each TOLD (a glow before each: ' + open.tells + ' tells), each slow: ' + JSON.stringify(open.thrown.map(b => b.v)) + ' px/s (the hero runs 92)');
  ok(open.thrown[0] && open.thrown[0].t >= 0.9 && gap !== null && gap >= 0.9 && gap <= 1.6, 'thrown ONE AT A TIME: the first after ' + (open.thrown[0] && open.thrown[0].t) + ' s of glow, the second ' + gap + ' s later - a beat, time to dodge one and then the other');
  ok(moved.thrown[1] && moved.thrown[1].others.length === 1 && moved.thrown[1].others[0] >= 80, 'when the second leaves him the first (missed, still flying) is well ahead of it (' + JSON.stringify(moved.thrown[1] && moved.thrown[1].others) + ' px): two balls in a line, not a pair side by side');
  ok(open.hits.length === 2 && open.hits.every(h => h.hard === false && h.d > 0 && h.name === 'THE FIREBALL'), 'aimed at you both land on a hero who stays put, as blows a shield could take: ' + JSON.stringify(open.hits));
  ok(moved.hits.length === 1 && moved.thrown.length === 2 && Math.abs(moved.thrown[1].vx) > 0, 'the second is AIMED AFRESH: drop a tier once the first is thrown and it misses, the second still finds you (' + moved.hits.length + ' hit)');
  ok(guard.hits.length === 2 && guard.hits.every(h => h.r === 'blocked') && guard.pops.filter(p => p === 'shield').length === 2, 'a shield takes both: ' + JSON.stringify(guard.pops));
  ok(slab.hits.length === 0 && slab.pops.length === 2 && slab.pops.every(p => p === 'slab') && !slab.flying, 'a slab in their way BREAKS each, and you are not touched: ' + JSON.stringify(slab.pops));
  ok(open.end === 'recover' || open.end === 'hover', 'and after the second he gets his breath back (' + open.end + ')'); }

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

// 6. THE BREATH DRAWN AS FIRE, ITS TIMING AND HITBOX UNTOUCHED: every fill the world-drawing makes for a jet 180 px long (flat, from
//    his mouth to the right) is recorded - its colour and where - at two moments of the flicker
{ ok(GARG.tell.breath === 1.5 && GARG.breath.lock === 0.5 && GARG.breath.T === 1.4 && GARG.breath.travel === 260 && GARG.breath.w === 10 && GARG.breath.reach === 210 && GARG.breath.sweep === 0.4 && GARG.dmg.breath === 15 && GARG.tellP2Not.includes('breath'),
    'THE BREATH\'S TIMING, HITBOX AND TELL are as round four set them (tell 1.5 s, set 0.5 s, jet 1.4 s at 260 px/s, 210 px long, 10 px either side, 15 damage - claude/sweep3 raised it from 12 with the boss sweep)');
  const record = () => { const fills = []; let pts = []; const g = { fillStyle: '#000', strokeStyle: '#000', globalAlpha: 1, lineWidth: 1,
      beginPath() { pts = []; }, moveTo(x, y) { pts.push([x, y]); }, lineTo(x, y) { pts.push([x, y]); }, arc(x, y, r) { pts.push([x, y - r], [x, y + r]); }, ellipse(x, y, rx, ry) { pts.push([x, y - ry], [x, y + ry]); },
      fill() { if (this.globalAlpha > 0.05) fills.push({ col: String(this.fillStyle).toLowerCase(), pts }); }, fillRect(x, y, w, h) { if (this.globalAlpha > 0.05) fills.push({ col: String(this.fillStyle).toLowerCase(), pts: [[x, y], [x + w, y + h]] }); },
      stroke() {}, save() {}, restore() {}, setLineDash() {}, closePath() {} }; return { g, fills }; };
  const x0 = 100, y0 = 200, len = 180, e = { alive: true, mode: 'breath', jet: [x0, y0, x0 + len, y0, len], face: 1, x: 80, y: 230, modeT: 0.5 };
  const shotAt = time => { const { g, fills } = record(); G.drawGargoyleWorld(g, e, 0, 0, time, { x: 0, y: 0 }); return fills; };
  const A1 = shotAt(1.0), A2 = shotAt(1.06), rgb = c => /^#[0-9a-f]{6}$/.test(c) ? [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)) : null;
  const kind = c => { const v = rgb(c); if (!v) return null; const [r, gg, b] = v, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    if (mx - mn < 40 && mx < 140) return 'smoke'; if (r > 230 && gg > 225 && b > 150) return 'white'; if (r > 200 && gg > 170) return 'yellow'; if (r > 200 && gg > 100) return 'orange'; if (r > 120 && gg < 100) return 'red'; return 'other'; };
  const along = f => { const xs = f.pts.map(p => p[0]); return ((Math.min(...xs) + Math.max(...xs)) / 2 - x0) / len; }, top = f => Math.min(...f.pts.map(p => p[1]));
  const where = k => A1.filter(f => kind(f.col) === k).map(along), mean = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null;
  const kinds = new Set(A1.map(f => kind(f.col))), white = where('white'), red = where('red'), smoke = A1.filter(f => kind(f.col) === 'smoke'), licks = A1.filter(f => kind(f.col) !== 'smoke' && y0 - top(f) > 14);
  const stats = { fills: A1.length, kinds: [...kinds], white: mean(white), red: mean(red), smoke: smoke.length, smokeAt: mean(smoke.map(along)), licks: licks.length, flicker: JSON.stringify(A1) !== JSON.stringify(A2) };
  console.log('  flame', JSON.stringify(stats));
  ok(['white', 'yellow', 'orange', 'red'].every(k => kinds.has(k)) && A1.length >= 120, 'THE BREATH IS DRAWN AS FIRE: white-hot, yellow, orange and red flame in ' + A1.length + ' shapes (it was a single row of ' + Math.ceil(len / 3) + ' squares in three colours)');
  ok(white.length && red.length && mean(white) < 0.35 && mean(red) > 0.45, 'the core is WHITE-HOT AT HIS MOUTH (at ' + (stats.white && stats.white.toFixed(2)) + ' of the jet) and it burns RED toward the front (' + (stats.red && stats.red.toFixed(2)) + ')');
  ok(smoke.length >= 2 && stats.smokeAt > 0.85, 'SMOKE rolls off its front (' + smoke.length + ' puffs, at ' + (stats.smokeAt && stats.smokeAt.toFixed(2)) + ' of the jet)');
  ok(licks.length >= 4 && stats.flicker, 'tongues and embers LICK UP off it (' + licks.length + ' shapes more than 14 px above its line), and it FLICKERS (' + stats.flicker + ')'); }

// 7. THE FIREBALL'S OWN POSE: frames 5-6 of his sheet, jaws lit - the fire's colours in them, and none of the wing gust's white blast lines
{ const QB = await import('../src/redraw/queue_bosses.js'), S = QB.bakeGateGargoyle();
  const count = (c, test) => { const d = c._d; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] && test(d[i], d[i + 1], d[i + 2])) n++; return n; };
  const fire = (r, g, b) => r > 200 && g > 100 && g < 240 && b < 90, blast = (r, g, b) => r === 0xee && g === 0xfa && b === 0xff;
  const f5 = count(S.R[5], fire), f6 = count(S.R[6], fire), b6 = count(S.R[6], blast), f7 = count(S.R[7], fire);
  console.log('  pose', JSON.stringify({ f5, f6, b6, f7, frames: S.R.length }));
  ok(f5 >= 20 && f6 >= 40 && b6 === 0, 'HIS FIREBALL POSE, jaws lit: ' + f5 + ' px of fire in his jaws as he winds up (frame 5), ' + f6 + ' as he throws (frame 6), and ' + b6 + ' px of the old gust blast');
  ok(S.R.length === 12 && G.gargFrame({ mode: 'fireballTell' }) === 5 && G.gargFrame({ mode: 'fireball' }) === 6, 'still twelve frames; the fireball wears 5 and 6'); }

// 5. ON THE PAGE: his two fireballs against the real hero (damagePlayer and his shield), and the bestiary's words
ok(/two slow fireballs, one after the other/.test(main) && !/His wings throw you/.test(main), 'the bestiary says TWO fireballs, one after the other (and nothing of wings)');
const I = (await import('../src/level.js')).LEVELS.findIndex(l => l.id === 'witchlight');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const out={};
    const boot=h=>{BK.setHero(h);BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);for(const e of BK.enemies())if(e.t!=='gargoyle')e.alive=false;};
    const sl=()=>BK.movers().filter(m=>m.arena).sort((a,b)=>a.x-b.x);const low=()=>sl().filter(m=>m.y===Math.max(...sl().map(q=>q.y))&&!m.broken);
    const on=m=>{const P=BK.P;P.windRide=null;P.x=m.x+m.w/2;P.y=m.y;P.vy=0;P.vx=0;P.onMover=m;P.ground=true;};
    const shot=(h,guard)=>{boot(h);const g=BK.enemies().find(e=>e.t==='gargoyle');const m=low()[3];on(m);BK.sim(150);for(const q of sl())if(q!==m)q.broken=true;   /* nothing between him and you: the slab case is asked in Node */g.mode='hover';g.cd=99;BK.sim(2);
      BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.grace=0;const hp0=BK.P.hp;g.x=BK.P.x+110;g.y=BK.P.y-12;g.mode='fireballTell';g.modeT=${GARG.tell.fireball};g.sd=1;
      const n0=g.thrown||0,live=()=>(g.balls||(g.ball?[g.ball]:[])).length;let gone=false,f=0,hits=0,last=BK.P.hp;for(;f<600;f++){on(m);BK.P.face=1;if(guard)BK.keys.block=true;g.cd=99;if(g.mode==='hover'||g.mode==='recover'){g.x=BK.P.x+110;}BK.sim(1);if(BK.P.hp<last)hits++;last=BK.P.hp;if((g.thrown||0)>n0&&!live()&&g.mode!=='fireballTell'&&g.mode!=='fireball'){gone=true;break;}}const thrown=(g.thrown||0)-n0;
      BK.keys.block=false;const o={h,thrown,hits,gone,took:hp0-BK.P.hp,secs:+(f/60).toFixed(2)};BK.god=true;return o;};
    out.open=shot('pyro',false);out.guard=shot('knight',true);out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 600000);
  console.log(JSON.stringify(r));
  ok(r.open.thrown === 2 && r.open.gone && r.open.hits === 2 && r.open.took > 0, 'ON THE PAGE both fireballs fly and land, one after the other, on a hero who stays put: ' + JSON.stringify(r.open));
  ok(r.guard.thrown === 2 && r.guard.gone && r.guard.took === 0, 'and the knight\'s shield takes both: ' + JSON.stringify(r.guard));
  ok(pg.errors.length === 0 && r.errors.length === 0, 'no errors on the page: ' + JSON.stringify(pg.errors.slice(0, 3).concat(r.errors)));
} finally { await pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTHE GATE GARGOYLE, PLAYTESTED: a breath you can read, two fireballs for the gust, one at a time, a breath drawn as fire, his own pose to throw, slower wings, one whelp at a time.');
process.exitCode = fails.length ? 1 : 0;
