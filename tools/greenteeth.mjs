// tools/greenteeth.mjs - JENNY GREENTEETH, the boss in THE FOG CANAL's lock (claude/lockkeeper). src/jenny-greenteeth.js is the fight (its header is
// the design). The Puppeteer's lesson (Daniel, 2026-09-30: "repetitive and very easy") is written into these rules:
// PURE (src/jenny-greenteeth.js, no page):
//   - EVERY BLOW IS TOLD with its mark, answer and height (src/marks.js rows), and EVERY BLOW FIRES (rule A3) in a fuzz of all three phases:
//     the grab, the lash, the reach, the bite, the tear, the surge, her hand on the paddle, a pair
//   - THE OPENING IS CAUSED (A11): left alone a minute she never opens; the drain run while she is at the gate strands her - open, at GT.openMul,
//     for a SHORT window; a drain the upper paddle is running against strands nobody; left unstruck her hand shuts the drain, struck she lets go
//   - THE WINDOWS ARE SHORT (Daniel): strand and flush <= 2 s, the big one about 3 s; a blow anywhere else is GT.ward (tiny)
//   - EVERY CYCLE CHANGES: no cycle lays the same lock as the one before it (the water, the weed, which paddle runs or is choked)
//   - THE BRIGHT WEED holds you, then gives; the dark weed is no footing at all
//   - PHASE 2: the lock floods and she hides in a culvert; the paddle of HER culvert throws her out, open; the other one does not
//   - PHASE 3: the fog; a lamp's hook is fast before it; struck in the fog the lamp falls, she goes for the light and will not leave it, and
//     that gate's paddle then gives THE BIG ONE (drained: stranded; flooded: thrown) at GT.bigMul
//   - THE HUMAN BOT: it reacts late and misses some (src/jenny-greenteeth.js PLAN)
// THE STAGE: the standalone lock is a hidden level with her arena (40 wide, the walers two rows apart, the high water a row under the walkways,
//   her music, a checkpoint outside the gate, the trigger past it)
// IN THE PAGE: she wakes and floods the lock; a bright weed mat holds a hero and then gives; a blow on her swimming is warded; a real swing at the
//   lower paddle from its walkway drains the lock under her, and stranded a blow bites; her death ends the fight.
//   node tools/greenteeth.mjs            (PORT from tools/ports.mjs)       node tools/greenteeth.mjs --pure    (no page)
import { openPage } from './cdp.mjs';
import * as M from '../src/jenny-greenteeth.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { LEVELS, T } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, SX = 20, R = 21, A = M.geom(SX, R, TS), GT = M.GT;
/* a lock and a world: `log` counts what the world was asked to do */
function rig(o = {}) {
  const show = M.newShow(A); M.startFight(show);
  const e = M.newGreenteeth({ t: 'greenteeth', x: o.ex ?? A.mid, y: A.bed, hp: o.hp ?? GT.hp, maxHp: GT.hp, alive: true });
  e.mode = 'wake'; e.modeT = 1.6;
  const hero = { x: o.x ?? A.mid, y: A.bed, ground: false, swim: true, onWeed: -1, onTile: false, alive: true };
  const log = { hits: [], bands: [], grabs: 0, holds: 0, lines: [], sounds: [], events: {} };
  const c = { heroes: [hero], say: () => {}, sound: k => log.sounds.push(k), number: (x, y, t) => log.lines.push(t), water: () => {},
    hit: (box, d, name, opt) => log.hits.push({ box, d, name, opt }), band: (kind, b, x0, x1, d, name, key) => log.bands.push({ kind, b, x0, x1, d, name, key }),
    grab: (box, d) => { const hb = { l: hero.x - 5, r: hero.x + 5, t: hero.y - 20, b: hero.y }; if (hero.onTile || !(box[0] < hb.r && box[1] > hb.l && box[2] < hb.b && box[3] > hb.t)) return null; log.grabs++; return hero; },
    hold: () => { log.holds++; return !o.mash; }, drag: () => {}, release: () => {}, cycle: () => {} };
  /* where the hero stands: 'swim' (at the surface, over the water), 'walkE' / 'walkW' (a gate's walkway), 'weed' (a bright patch) */
  const place = where => { const surf = M.surfY(show);
    if (where === 'walkE' || where === 'walkW') Object.assign(hero, { x: A[where === 'walkE' ? 'E' : 'W'].stand, y: A.walk, ground: true, swim: false, onTile: true, onWeed: -1 });
    else if (where === 'weed') { const i = show.weed.findIndex(p => p.firm && !(p.broken > 0)); const p = show.weed[i]; Object.assign(hero, { x: (p.x0 + p.x1) / 2, y: p.y, ground: true, swim: false, onTile: false, onWeed: i }); }
    else Object.assign(hero, { y: surf + 12, ground: false, swim: true, onTile: false, onWeed: -1 }); };
  const step = () => { const ev = M.stepShow(e, show, DT, c); for (const v of ev) log.events[v.t] = (log.events[v.t] || 0) + 1; return ev; };
  const run = (n, f) => { for (let i = 0; i < n; i++) { if (f) f(i); step(); } };
  return { show, e, hero, log, c, step, run, place };
}
const until = (r, pred, n = 600, f) => { for (let i = 0; i < n; i++) { if (pred()) return true; if (f) f(i); r.step(); } return pred(); };
const awake = r => { until(r, () => r.e.mode !== 'wake', 200); return r; };

// ---- THE MARKS: every blow told, with its answer and its height; the quiet ones wear none ----
{ const ROWS = { grabTell: ['!!', 'dodge', 'low'], lashTell: ['!!', 'jump', 'low'], reachTell: ['!!', 'duck', 'high'], biteTell: ['!', 'block', 'low'], tearTell: ['!!', 'dodge', 'low'], surgeTell: ['!!', 'jump', 'low'] };
  for (const [m, [mk, an, hg]] of Object.entries(ROWS)) { const k = 'greenteeth|' + m; ok(MARK[k] === mk, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + mk); ok(ANSWER[k] === an, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + an); ok(HEIGHT[k] === hg, k + ' is ' + JSON.stringify(HEIGHT[k]) + ' high, not ' + hg); }
  for (const m of ['handTell', 'shiftTell', 'floodTell', 'fogTell']) ok(MARK['greenteeth|' + m] === '', 'greenteeth|' + m + ' throws no blow but wears ' + JSON.stringify(MARK['greenteeth|' + m])); }

// ---- EVERY BLOW FIRES (A3): a fuzz of all three phases, the hero moved about the lock ----
{ const fired = {}; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const ph of [1, 2, 3]) { const r = awake(rig({ hp: ph === 1 ? GT.hp : ph === 2 ? GT.hp * 0.6 : GT.hp * 0.3 }));
    if (ph === 1) { r.show.cyc[1] = 1; M.applyCycle(r.show, 1, r.c); }   /* (her second cycle: the tear) */
    r.run(60 * 80, i => { if (i % 100 === 0) { const w = rnd(); r.place(w < 0.35 ? 'swim' : w < 0.55 ? 'walkE' : w < 0.7 ? 'walkW' : 'weed'); if (w >= 0.7 && r.hero.onWeed < 0) r.place('swim'); r.hero.x = r.hero.onTile || r.hero.onWeed >= 0 ? r.hero.x : A.x0 + 100 + rnd() * (A.x1 - A.x0 - 200); }
      if (i % 900 === 450 && !r.show.pad.E.open) M.strikePaddle(r.e, r.show, 'E'); if (i % 900 === 300 && r.show.pad.W.knot) { M.strikePaddle(r.e, r.show, 'W'); M.strikePaddle(r.e, r.show, 'W'); } });
    for (const k of ['grab', 'lash', 'reach', 'bite', 'tear', 'surge', 'hand', 'pair']) if (r.show.n[k]) fired[k] = true; }
  for (const k of ['grab', 'lash', 'reach', 'bite', 'tear', 'surge', 'hand', 'pair']) ok(fired[k], 'HER ' + k.toUpperCase() + ' never fired in a fuzz of all three phases (rule A3)'); }

// ---- THE OPENING IS CAUSED: a minute left alone, never open; the drain run with her at the gate strands her, for a SHORT window ----
{ const r = awake(rig()); let opened = 0; r.place('walkW'); r.run(60 * 60, () => { if (M.gtOpen(r.e)) opened++; });
  ok(opened === 0, 'left alone for a minute she was open ' + opened + ' frames'); ok(M.gtTake(r.e) === GT.ward && GT.ward <= 0.06, 'working her lock she takes ' + M.gtTake(r.e) + ' of a blow (the ward is ' + GT.ward + ')'); }
{ const r = awake(rig({ ex: A.E.face - 90 })); r.place('walkE'); r.e.x = A.E.face - 90;
  const res = M.strikePaddle(r.e, r.show, 'E'); ok(res === 'drain', 'the lower paddle struck in her first cycle did not drain (' + res + ')');
  ok(until(r, () => r.e.mode === 'stranded', 60 * 3), 'the lock drained under her and she was not stranded (mode ' + r.e.mode + ', depth ' + r.show.water.depth.toFixed(0) + ')');
  ok(M.gtOpen(r.e) && M.gtTake(r.e) === GT.openMul && r.e.modeT <= 2.0 && r.e.modeT >= 1.4, 'stranded she is not open at ' + GT.openMul + ' for a short window (' + r.e.modeT.toFixed(2) + ' s)');
  ok(r.log.lines.includes('SHE IS STRANDED: CUT HER'), 'her stranding was not said in the hint box');
  let t = 0; while (M.gtOpen(r.e) && t < 600) { r.step(); t++; } ok(t * DT <= 2.05, 'the stranded window ran ' + (t * DT).toFixed(2) + ' s (short: about two seconds)');
  const C0 = r.show.C.name; ok(until(r, () => r.show.cycle === 1, 60 * 5), 'after her stranding she did not drag herself back and refill the lock for a new cycle');
  ok(r.show.C.name !== C0, 'the lock after her first stranding is the same lock (' + C0 + ')'); }
{ const r = awake(rig()); r.place('walkE'); r.e.x = A.mid; r.show.cyc[1] = 1; M.applyCycle(r.show, 1, r.c); until(r, () => Math.abs(r.show.water.depth - GT.lv.half) < 1, 120);
  const res = M.strikePaddle(r.e, r.show, 'E'); r.run(60 * 5); ok(res === 'running' && r.e.mode !== 'stranded' && r.show.water.depth > GT.aground, 'a drain run against the running upper paddle stranded her (' + res + ', ' + r.e.mode + ')');
  ok(r.log.lines.includes('THE UPPER PADDLE IS RUNNING: SHUT IT FIRST'), 'the running upper paddle was not said'); }
/* HER HAND: from half water she reaches the paddle before she is aground. Unstruck she shuts it; struck she lets go, and is stranded */
for (const strike of [false, true]) { const r = awake(rig()); r.place('walkE'); r.show.cyc[1] = 1; M.applyCycle(r.show, 1, r.c); r.show.pad.W.open = false; r.show.pad.W.knot = 0; r.show.water.target = GT.lv.half;
  until(r, () => Math.abs(r.show.water.depth - GT.lv.half) < 1, 200); r.e.x = A.E.face - 90; M.strikePaddle(r.e, r.show, 'E');
  ok(until(r, () => r.e.mode === 'handTell', 60), 'the drain opened from half water and her hand never went to the paddle');
  if (strike) { r.step(); ok(M.handCut(r.e, r.show), 'her hand could not be struck off the paddle'); ok(until(r, () => r.e.mode === 'stranded', 60 * 3), 'her hand struck, the lock drained and she was not stranded (' + r.e.mode + ')'); }
  else { ok(until(r, () => !r.show.pad.E.open, 60 * 2) && r.show.n.shut === 1 && r.e.mode !== 'stranded', 'her hand left alone did not shut the drain (' + r.e.mode + ')'); ok(r.log.lines.includes('SHE SHUT THE PADDLE'), 'her shutting the paddle was not said'); } }
ok(GT.strandT <= 2.0 && GT.flushT <= 2.0 && GT.bigT >= 2.5 && GT.bigT <= 3.2, 'the windows are not short (strand ' + GT.strandT + ', flush ' + GT.flushT + ', big ' + GT.bigT + ')');

// ---- EVERY CYCLE CHANGES ----
{ const sig = C => [C.lvl, C.weed, !!C.flood, !!C.knot, C.lair, !!C.tear, !!C.pairs].join('|');
  for (const ph of [1, 2, 3]) for (let k = 1; k < M.CYCLES[ph].length; k++) ok(sig(M.cycleOf(ph, k)) !== sig(M.cycleOf(ph, k - 1)), 'phase ' + ph + ' cycle ' + (k + 1) + ' lays the same lock as the one before it');
  ok(M.CYCLES[1].length >= 3, 'phase one has fewer than three different locks');
  ok(sig(M.cycleOf(1, 0)) !== sig(M.cycleOf(2, 0)) && sig(M.cycleOf(2, 0)) !== sig(M.cycleOf(3, 0)), 'a phase opens on the lock the last one had'); }

// ---- THE WEED: the bright holds you a while, then gives; the dark is no footing ----
{ const r = awake(rig()); r.place('weed'); const i = r.hero.onWeed; let t = 0;
  while (!(r.show.weed[i].broken > 0) && t < 600) { r.hero.onWeed = i; r.show.gap = 9; r.show.arms = []; r.step(); t++; }   /* (her blows held off: a grab through the mat breaks it sooner, and that is hers, not the weed's) */
  ok(t * DT >= GT.weedHold - 0.1 && t * DT <= GT.weedHold + 0.2, 'a bright weed mat held a hero ' + (t * DT).toFixed(2) + ' s (it should hold about ' + GT.weedHold + ' and give)');
  ok(r.show.weed.some(p => !p.firm) && r.show.weed.filter(p => !p.firm).every(p => p.m < 0), 'a dark weed mat is footing (it must be only water with a skin on it)');
  ok(r.show.weed.filter(p => p.firm).length <= M.WEED_MOVERS, 'more bright mats than the stage has movers for'); }

// ---- PHASE 2: the flood, the culverts, the paddle of hers ----
{ const r = awake(rig()); r.place('walkE'); r.e.hp = GT.hp * 0.6; until(r, () => r.e.mode === 'floodTell', 300);
  ok(r.e.mode === 'floodTell', 'below two thirds she did not flood the lock'); ok(r.log.lines.includes('THE LOCK FLOODS: SHE HIDES IN THE CULVERTS'), 'the flood was not said');
  ok(until(r, () => r.e.base === 'culvert', 60 * 8), 'flooded, she never hid in a culvert (' + r.e.base + ')');
  ok(Math.abs(r.show.water.depth - GT.lv.high) < 2 && GT.lv.high < R * TS - A.walk, 'the flood did not bring the water up under the walkways (' + r.show.water.depth.toFixed(0) + ')');
  const side = r.show.hide, other = side === 'W' ? 'E' : 'W';
  const wrong = M.strikePaddle(r.e, r.show, other); ok(wrong === 'notHere' || wrong === 'drain', 'the paddle of the culvert she is NOT in did something to her (' + wrong + ')'); r.show.pad.E.open = false; r.show.pad.W.open = false;
  r.run(40); const res = M.strikePaddle(r.e, r.show, side);
  ok(res === 'flush' && r.e.mode === 'flushed' && M.gtTake(r.e) === GT.openMul && r.e.modeT <= GT.flushT, 'the paddle of her culvert did not throw her out, open (' + res + ', ' + r.e.mode + ')'); }

// ---- PHASE 3: the fog, the lamps, THE BIG ONE ----
{ const r = awake(rig()); r.place('walkE'); ok(M.strikeHook(r.e, r.show, 'E') === 'fast', 'a lamp came off its hook before the fog');
  r.e.hp = GT.hp * 0.3; r.e.phase = 2; r.show.hide = 'E'; r.e.base = r.e.mode = 'culvert'; until(r, () => r.e.mode === 'fogTell', 300);
  ok(r.e.mode === 'fogTell', 'below a third the fog did not come down (' + r.e.mode + ')'); ok(until(r, () => r.e.mode !== 'fogTell', 300) && r.show.fog > 0.5, 'the fog did not come down over the lock');
  for (const side of ['E', 'W']) { const q = side === 'E' ? r : awake(rig({ hp: GT.hp * 0.3 })); if (side === 'W') { q.e.phase = 3; q.e.base = q.e.mode = 'lurk'; q.show.cyc[3] = 0; M.applyCycle(q.show, 3, q.c); q.show.fog = 1; q.run(30); }
    q.place(side === 'E' ? 'walkE' : 'walkW'); q.run(10);
    ok(M.strikeHook(q.e, q.show, side) === 'drop', 'the ' + side + ' lamp would not come off its hook in the fog');
    ok(until(q, () => q.e.lured, 60 * 8), 'she never went for the ' + side + ' lamp in the water (' + q.e.mode + '/' + q.e.base + ')');
    const res = M.strikePaddle(q.e, q.show, side);
    if (side === 'E') { ok(res === 'drainBig' && until(q, () => q.e.mode === 'stranded', 60 * 4) && q.e.big && M.gtTake(q.e) === GT.bigMul && q.e.modeT >= GT.bigT - 0.4, 'the drain with her at the east lamp did not strand her for THE BIG ONE (' + res + ', ' + q.e.mode + ')'); }
    else ok(res === 'flushBig' && q.e.mode === 'flushed' && q.e.big && M.gtTake(q.e) === GT.bigMul, 'the flood with her at the west lamp did not throw her for THE BIG ONE (' + res + ', ' + q.e.mode + ')'); } }

// ---- THE HUMAN BOT ----
ok(M.PLAN.react >= 0.2 && M.PLAN.missDodge > 0 && M.PLAN.missHand > 0 && M.PLAN.late > 0, 'the bot plays perfectly (PLAN ' + JSON.stringify(M.PLAN) + ')');

// ---- THE STAGE (the standalone lock) ----
{ const lv = LEVELS.find(l => l.id === 'greenlock'); ok(lv && lv.hidden, 'the standalone lock is not a hidden level');
  if (lv) { const L = lv.build(), A2 = L.arena, g = (x, y) => L.grid[y * L.W + x];
    ok(A2 && A2.boss === 'greenteeth' && A2.music === 'greenteeth', 'the lock is not her arena with her music');
    const w = A2.wallR - A2.wallL; ok(w >= 36 && w <= 44, 'the lock is ' + w + ' wide (rule A7: about forty)');
    ok(A2.trigger > (A2.wallL + 1) * 16, 'the trigger is not past the gate'); ok(L.ents.some(e => e.t === 'check' && e.x < A2.wallL), 'no checkpoint stands outside the lock');
    ok(L.ents.filter(e => e.t === 'greenteeth').length === 1, 'she is not in the lock once');
    const sx = A2.lock.sx, Rr = A2.lock.R; for (const [x, name] of [[sx + 2, 'west'], [sx + 37, 'east']]) { const ys = []; for (let y = Rr - 1; y > Rr - 12; y--) if (g(x, y) === T.ONEWAY) ys.push(Rr - y);
      ok(ys.join() === '2,4,6,8', 'the ' + name + ' gate\'s walers and walkway are not two rows apart (' + ys.join() + ')'); }
    ok((L.pools || []).some(p => p.lock && p.swim && p.clear), 'the lock has no clear swimming water');
    ok((L.moversExtra || []).filter(m => m.weed).length === M.WEED_MOVERS, 'the lock has no bright weed movers'); } }

if (!process.argv.includes('--pure')) {
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='greenlock'));BK.start();BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(A.start[0],A.start[1]);BK.sim(200);return BK.boss;};
    const e=boot(),GH=BK.greenteethHands(),S=GH.show(),A=S.A,P=BK.P;
    out.woke=BK.bossActive&&e&&e.t==='greenteeth';out.depth=Math.round(S.water.depth);out.pool=Math.round(BK.L.pools.find(p=>p.lock).y);
    /* a bright mat holds a hero, then gives */
    const wi=S.weed.findIndex(p=>p.firm&&!(p.broken>0)),wp=S.weed[wi];P.x=(wp.x0+wp.x1)/2;P.y=wp.y-6;P.vy=0;let stood=0,fell=false;
    for(let i=0;i<60*4;i++){S.gap=9;S.arms=[];if(P.onMover&&P.onMover.weed)stood++;else if(stood>30){fell=true;break;}BK.sim(1);}   /* (her blows held off: a grab through the mat is hers, not the weed's) */out.weed={stood:+(stood/60).toFixed(2),fell};
    /* a blow on her swimming is warded */
    const h0=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.ward=h0-e.hp;
    /* a real swing at the lower paddle from its walkway: the lock drains under her, and stranded a blow bites */
    for(let i=0;i<60*3&&e.mode!=='lurk';i++)BK.sim(1);
    const G=A.E;let tries=0;for(;tries<600&&!S.pad.E.open;tries++){P.x=G.paddle.x-14;P.y=A.walk;P.vy=0;P.face=1;e.x=G.face-90;S.gap=9;S.arms=[];if(tries%20===0)BK.press('atk');BK.sim(1);}
    out.drain={open:S.pad.E.open,tries};let f=0;for(;f<60*4&&e.mode!=='stranded';f++){e.x=Math.min(e.x,G.face-90);BK.sim(1);}
    out.strand={mode:e.mode,f,open:BK.bossOpen(e),bar:BK.greenteeth().mode};const s0=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.strand.dmg=s0-e.hp;
    /* her death ends the fight */
    e.hp=1;e.mode='stranded';e.modeT=2;BKT.hurtEnemy(e,99,e.x-10,false);for(let i=0;i<300&&BK.bossActive;i++){P.inv=99;BK.sim(1);}
    out.death={alive:e.alive,active:BK.bossActive};return out;})()`, 300000);
  ok(r.woke && r.depth >= 40, 'she did not wake and flood the lock: ' + JSON.stringify(r));
  ok(r.weed.stood >= 1.5 && r.weed.fell, 'a bright weed mat did not hold a hero and then give: ' + JSON.stringify(r.weed));
  ok(r.ward > 0 && r.ward <= 3, 'a blow on her in her water was not warded (' + r.ward + ' of 50)');
  ok(r.drain.open, 'a real swing at the lower paddle from its walkway did not drain the lock: ' + JSON.stringify(r.drain));
  ok(r.strand.mode === 'stranded' && r.strand.open && r.strand.dmg >= 50 * GT.openMul * 0.9, 'the lock drained under her and she was not stranded and open to a blow: ' + JSON.stringify(r.strand));
  ok(!r.death.alive && !r.death.active, 'her death did not end the fight: ' + JSON.stringify(r.death));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }
}

if (bad.length) { console.log('GREENTEETH: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  greenteeth  every blow told and fired, the openings caused and short, her hand on the paddle, every cycle a new lock, the weed, the flood and her culverts, the fog and the big one, a human bot, the stage' + (process.argv.includes('--pure') ? ' (pure only)' : ', and in the page'));
