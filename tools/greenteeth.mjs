// tools/greenteeth.mjs - JENNY GREENTEETH, the boss at the end of THE FOG CANAL (claude/lockkeeper; claude/jenny2; claude/canal4: THE RAFT DUEL + KELP ARMOUR,
// Daniel 10-05: "the switches just aren't fun mechanically"). src/jenny-greenteeth.js is the fight (its header is the design). These rules hold it:
// PURE (src/jenny-greenteeth.js, no page):
//   - HER FOUR BLOWS (the slam, the charge, the net, the vine) ARE TOLD with their mark, answer and height (src/marks.js rows) - and the lock's old blows
//     (grab, lash, reach, bite, tear, surge) and its machine beats (flood, fog, paddles) are gone; EVERY BLOW FIRES in a fuzz of all three phases
//   - ONE NEW BLOW A PHASE: the slam (1), the charge (2), the net (3) - and none before its phase; the vine in every phase; ONE WINDUP AT A TIME
//   - KELP GUARDS BY ANGLE (design standard B11): phase one her body (a HIGH blow lands whole), phase two a hood (a LOW blow), phase three it shifts (told);
//     a plain swing (MID) always meets kelp (a twentieth); every blow's angle is read from the swing (blowAngle)
//   - THE OPENING COMES FROM FIGHTING HER, at least 3 s: a slam stepped out of sticks her claws in the raft (every angle lands, x openMul, at most its share);
//     a slam that lands opens nothing; LEFT ALONE A MINUTE she never opens; after it she is WARY (told: no slam, the kelp everywhere) for GT.wardT
//   - EACH PHASE FIERCER (quicker gaps, walk and tells - every tell >= 0.5 s) AND THE RAFT CHANGES, TOLD FIRST: she heaves it (it tips, you slide to her);
//     she drags it lower (its ends go under, the deck narrower)
//   - THE HUMAN BOT: it reacts late, misses some, swings at the wrong angle now and then (src/jenny-greenteeth.js PLAN)
// THE STAGE: THE FOG CANAL (src/fog-canal.js section 7): the gates, the landings, her water, the raft moored at the west landing
// IN THE PAGE: walked onto the raft she wakes, hauls herself aboard and the raft goes out; FOR EVERY HERO a real jump attack lands whole on her body-kelp
//   phase and a plain swing clanks, and a real low sweep lands whole under the hood; stuck in the raft a real swing lands; a fall into her water is handed
//   back onto the raft; her death ends the fight and the raft drifts to the east landing.
//   node tools/greenteeth.mjs            (PORT from tools/ports.mjs)       node tools/greenteeth.mjs --pure    (no page)
import { openPage } from './cdp.mjs';
import * as M from '../src/jenny-greenteeth.js';
import { MARK, ANSWER, HEIGHT, BY_HAND } from '../src/marks.js';
import { LEVELS, T } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, SX = 20, R = 21, A = M.geom(SX, R, TS), GT = M.GT;
/* a raft and a world: o.dodge - the hero is never under a slam/net and jumps the vine and the wave */
function rig(o = {}) {
  const show = M.newShow(A); M.startFight(show);
  const e = M.newGreenteeth({ t: 'greenteeth', x: A.mid, y: A.deck, hp: o.hp ?? GT.hp, maxHp: GT.hp, alive: true });
  e.mode = 'wake'; e.modeT = 1.6;
  const hero = { x: A.mid, y: A.deck, ground: true, swim: false, onRaft: true, alive: true };
  const log = { slams: 0, nets: 0, vines: [], bands: [], lines: [], sounds: [], slid: 0, events: {}, maxArms: 0 };
  const inBox = box => { const hb = { l: hero.x - 5, r: hero.x + 5, t: hero.y - 14, b: hero.y }; return box[0] < hb.r && box[1] > hb.l && box[2] < hb.b && box[3] > hb.t; };
  const r0 = { dodge: !!o.dodge };
  const c = { heroes: [hero], say: () => {}, sound: k => log.sounds.push(k), number: (x, y, t) => log.lines.push(t),
    band: (kind, b, x0, x1, d, name, key) => log.bands.push({ kind, b, x0, x1, d, name, key }),
    slam: box => { log.slams++; return !r0.dodge && inBox(box); }, net: box => { log.nets++; return !r0.dodge && inBox(box); },
    vine: ([t, b], x0, x1, d, key, toX) => { log.vines.push({ t, b, x0, x1, d, key, toX }); return !r0.dodge && hero.ground && hero.x >= x0 && hero.x <= x1 ? hero : null; },
    slide: dx => { log.slid += Math.abs(dx); }, raft: () => {} };
  const step = () => { const ev = M.stepShow(e, show, DT, c); for (const v of ev) log.events[v.t] = (log.events[v.t] || 0) + 1; log.maxArms = Math.max(log.maxArms, show.arms.length); return ev; };
  const run = (n, f) => { for (let i = 0; i < n; i++) { if (f) f(i); step(); } };
  /* the hero on the deck, dx px from her (kept on the deck) */
  const near = dx => { const [a, b] = M.raftEnds(show); hero.x = Math.max(a + 10, Math.min(b - 10, e.x + dx)); hero.y = M.deckY(show); hero.ground = true; hero.onRaft = true; };
  return { show, e, hero, log, c, step, run, near, r0 };
}
const until = (r, pred, n = 600, f) => { for (let i = 0; i < n; i++) { if (pred()) return true; if (f) f(i); r.step(); } return pred(); };
const awake = r => { until(r, () => r.e.mode !== 'wake', 400); return r; };
const toPhase = (r, ph) => { if (ph >= 2) { r.e.hp = GT.hp * (ph === 2 ? 0.6 : 0.3); if (ph === 3) r.e.phase = 2; until(r, () => r.e.phase === ph && r.e.mode === 'duel', 60 * 10); } return r; };

// ---- THE MARKS: her four blows told, with their answer and height; the lock's old blows and beats gone ----
{ const ROWS = { slamTell: ['!!', 'dodge', 'low'], chargeTell: ['!!', 'jump', 'low'], netTell: ['!!', 'dodge', 'low'], vineTell: ['!!', 'jump', 'low'] };
  for (const [m, [mk, an, hg]] of Object.entries(ROWS)) { const k = 'greenteeth|' + m; ok(MARK[k] === mk && BY_HAND[k] === mk, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + mk); ok(ANSWER[k] === an, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + an); ok(HEIGHT[k] === hg, k + ' is ' + JSON.stringify(HEIGHT[k]) + ' high, not ' + hg);
    const mv = M.MOVES[m.replace(/Tell$/, '')]; ok(mv && mv.mark === mk && mv.answer === an && mv.h === hg, 'the fight\'s own row for ' + m + ' disagrees with src/marks.js'); }
  ok(Object.keys(M.MOVES).sort().join() === 'charge,net,slam,vine', 'her blows are not the four Daniel kept (slam, charge, net, vine): ' + Object.keys(M.MOVES));
  for (const m of ['grabTell', 'lashTell', 'reachTell', 'biteTell', 'tearTell', 'surgeTell', 'floodTell', 'fogTell']) ok(!(('greenteeth|' + m) in MARK) && !(('greenteeth|' + m) in BY_HAND), 'the lock\'s old greenteeth|' + m + ' row is still in src/marks.js'); }

// ---- EVERY BLOW FIRES, ONE NEW BLOW A PHASE, ONE WINDUP AT A TIME: a fuzz of each phase, the hero moved about the deck ----
{ const byPhase = { 1: {}, 2: {}, 3: {} }; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; let maxArms = 0;
  for (const ph of [1, 2, 3]) { const r = toPhase(awake(rig({ dodge: true })), ph);
    r.run(60 * 90, i => { if (i % 90 === 0) r.near((rnd() < 0.5 ? -1 : 1) * (20 + rnd() * 170)); if (r.e.phase !== ph) r.e.hp = GT.hp * (ph === 1 ? 0.9 : ph === 2 ? 0.6 : 0.3); });
    for (const k of ['slam', 'charge', 'net', 'vine', 'heave', 'stuck']) byPhase[ph][k] = r.show.n[k]; maxArms = Math.max(maxArms, r.log.maxArms); }
  for (const k of ['slam', 'charge', 'net', 'vine']) ok([1, 2, 3].some(p => byPhase[p][k] > 0), 'HER ' + k.toUpperCase() + ' never fired in a fuzz of all three phases: ' + JSON.stringify(byPhase));
  ok(byPhase[1].vine > 0 && byPhase[2].vine > 0 && byPhase[3].vine > 0, 'her vine (her long reach) did not come in every phase: ' + JSON.stringify(byPhase));
  ok(byPhase[1].slam > 0 && byPhase[2].charge > 0 && byPhase[3].net > 0, 'a phase\'s new blow did not come in its phase: ' + JSON.stringify(byPhase));
  ok(!byPhase[1].charge && !byPhase[1].net && !byPhase[2].net && !byPhase[1].heave, 'a new blow (or the heave) came before its phase: ' + JSON.stringify(byPhase));
  ok(byPhase[2].heave > 0 && byPhase[3].heave > 0, 'she never heaved the raft in phases two and three: ' + JSON.stringify(byPhase));
  ok(maxArms <= 1, 'two windups at once (' + maxArms + '): one at a time');
  ok(M.NEW_MOVE[1] === 'slam' && M.NEW_MOVE[2] === 'charge' && M.NEW_MOVE[3] === 'net', 'one new blow a phase is not slam / charge / net'); }

// ---- THE KELP GUARDS BY ANGLE ----
{ const r = awake(rig()); const S = r.show, e = r.e;
  ok(S.kelp === 'body' && M.bareAngle(S) === 'high', 'phase one\'s kelp is not on her body (hit high)');
  ok(M.gtTakeAt(e, S, 'high') === 1 && M.gtTakeAt(e, S, 'mid') === GT.ward && M.gtTakeAt(e, S, 'low') === GT.ward, 'kelp on her body: a high blow must land whole, a mid or low one at the ward');
  ok(r.log.lines.includes('KELP ON HER BODY: HIT HIGH'), 'her kelp was not told when she came aboard');
  const P = (o) => Object.assign({ ground: true, swim: false, atk: 0.05, swingKind: null }, o);
  ok(M.blowAngle(P({ ground: false })) === 'high' && M.blowAngle(P({ swingKind: 'rise' })) === 'high' && M.blowAngle(P({ swingKind: 'airUp', ground: false })) === 'high' && M.blowAngle(P({ plunge: true, ground: false })) === 'high', 'a jump attack, the rising cut, the air up-swing and the plunge are not HIGH');
  ok(M.blowAngle(P({ swingKind: 'sweep' })) === 'low' && M.blowAngle(P({ caTrip: true, swingKind: 'sweep' })) === 'low', 'the low sweep (and the knight\'s trip) is not LOW');
  ok(M.blowAngle(P({})) === 'mid' && M.blowAngle(P({ heavy: true })) === 'mid' && M.blowAngle(P({ atk: -1 })) === 'mid', 'a plain standing swing (or a heavy, or a shot) is not MID - it must always meet kelp');
  const q = toPhase(awake(rig({ dodge: true })), 2); ok(q.show.kelp === 'hood' && M.gtTakeAt(q.e, q.show, 'low') === 1 && M.gtTakeAt(q.e, q.show, 'high') === GT.ward && q.log.lines.includes('SHE PULLS THE KELP OVER HER HEAD: HIT LOW'), 'phase two: the kelp did not move to a hood (hit low), told');
  const w = toPhase(awake(rig({ dodge: true })), 3); const kelps = new Set([w.show.kelp]); w.run(60 * 45, i => { if (i % 90 === 0) w.near(-60); kelps.add(w.show.kelp); });
  ok(kelps.has('body') && kelps.has('hood') && w.show.n.kelpShift >= 2 && w.log.lines.includes('THE KELP SLIDES DOWN HER: HIT HIGH'), 'phase three: the kelp did not shift between body and hood, told (' + [...kelps] + ', ' + w.show.n.kelpShift + ')'); }

// ---- LEFT ALONE A MINUTE (every blow taken, the hero never steps out) she never opens ----
{ const r = awake(rig()); let opened = 0; r.run(60 * 60, () => { r.near(-40); if (M.gtOpen(r.e)) opened++; });
  ok(opened === 0, 'left alone for a minute she was open ' + opened + ' frames'); ok(r.show.n.slam > 0 && r.show.n.slamHit === r.show.n.slam, 'a slam that landed on the hero still stuck her (' + r.show.n.slam + ' slams, ' + r.show.n.slamHit + ' hit)'); }

// ---- THE OPENING: stepping out of her slam sticks her claws in the raft, open for 3 s, at most its share; then she is WARY ----
{ const r = awake(rig({ dodge: true })); ok(until(r, () => r.e.mode === 'stuck', 60 * 20, () => r.near(-40)), 'stepping out of her slam never stuck her claws (' + JSON.stringify(r.show.n) + ')');
  const st = { t: r.e.modeT, mid: M.gtTakeAt(r.e, r.show, 'mid'), claw: r.e.claw && { ...r.e.claw } };
  ok(st.t >= 3 && st.mid === GT.openMul, 'stuck she is not open at ' + GT.openMul + ' to every angle for at least 3 s (' + st.t.toFixed(2) + ' s, x' + st.mid + ')');
  ok(st.claw && Math.abs(st.claw.y - M.deckY(r.show)) < 3, 'her claws are not in the raft\'s deck: ' + JSON.stringify(st));
  ok(r.log.lines.includes('HER CLAWS ARE STUCK: CUT HER'), 'her stuck claws were not said');
  const hb = { l: st.claw.x - 6, r: st.claw.x + 6, t: st.claw.y - 20, b: st.claw.y }; ok(M.strikeAt(r.e, r.show, hb, new Set()).some(q => q.what === 'claw'), 'a swing at her claws in the deck is not a blow on her');
  let got = 0; for (let i = 0; i < 20; i++) got += M.gtCap(r.e, 100); ok(got <= GT.openCap * GT.hp + 20 * 100 * GT.ward && got >= GT.openCap * GT.hp - 1, 'twenty heavy blows in one opening took ' + got + ' of her (the share is ' + Math.round(GT.openCap * GT.hp) + ')');
  let t = 0; while (M.gtOpen(r.e) && t < 600) { r.step(); t++; } ok(t * DT >= 2.9 - 0.01, 'the stuck window ran ' + (t * DT).toFixed(2) + ' s');
  until(r, () => r.e.mode === 'duel', 120);
  ok(r.show.wary && r.show.wary.t > 0 && M.gtTakeAt(r.e, r.show, 'high') === GT.ward && r.log.lines.includes('SHE IS WARY: NOT THE SAME TRICK TWICE'), 'after her claws came free she was not wary (told, the kelp everywhere)');
  const n0 = r.show.n.slamTold || 0; r.run(Math.floor((r.show.wary.t) * 60) - 2, () => r.near(-40)); ok((r.show.n.slamTold || 0) === n0, 'wary of the slam she slammed again'); }
ok(GT.stuckT >= 3, 'the opening is under 3 s');

// ---- FIERCER EACH PHASE; every tell at least half a second ----
{ for (const [k, mv] of Object.entries(M.MOVES)) ok(mv.tell * GT.tellK[2] >= 0.5, 'HER ' + k.toUpperCase() + ' is told ' + (mv.tell * GT.tellK[2]).toFixed(2) + ' s in phase three (at least 0.5)');
  ok(GT.heaveTell * GT.tellK[2] >= 0.5 && GT.lowerTell >= 1.5 && GT.kelpTell >= 1, 'the raft\'s turns or the kelp\'s shift are told too short');
  ok(GT.gap[0] > GT.gap[1] && GT.gap[1] > GT.gap[2] && GT.walk[0] < GT.walk[1] && GT.walk[1] < GT.walk[2] && GT.tellK[0] > GT.tellK[2], 'she is not fiercer each phase (gap ' + GT.gap + ', walk ' + GT.walk + ')'); }

// ---- THE RAFT CHANGES, TOLD FIRST: the heave tips it (you slide to her); dragged lower its ends go under ----
{ const r = toPhase(awake(rig({ dodge: true })), 2); let toldAt = -1, tippedAt = -1, i = 0;
  r.run(60 * 40, () => { i++; r.near(-50); if (toldAt < 0 && r.e.mode === 'heave') toldAt = i; if (tippedAt < 0 && r.show.raft.heave > 0) tippedAt = i; });
  ok(toldAt > 0 && tippedAt > toldAt && (tippedAt - toldAt) * DT >= 0.5 && r.log.slid > 20 && r.log.lines.includes('SHE HEAVES THE RAFT: KEEP YOUR FEET'), 'the heave was not told before the raft tipped, or nobody slid (' + JSON.stringify({ toldAt, tippedAt, slid: r.log.slid }) + ')');
  const q = awake(rig({ dodge: true })); q.e.hp = GT.hp * 0.3; q.e.phase = 2; let lowerSeen = 0; const w0 = q.show.raft.w;
  until(q, () => q.show.raft.low, 60 * 10, () => { q.near(-40); if (q.e.mode === 'lower') lowerSeen++; });
  ok(q.show.raft.low && q.show.raft.w === GT.raftLow && w0 === GT.raftW && lowerSeen * DT >= 1.5 && q.log.lines.includes('SHE DRAGS THE RAFT LOWER: THE ENDS GO UNDER'), 'phase three: the raft was not dragged lower (told first) - ' + JSON.stringify({ low: q.show.raft.low, w: q.show.raft.w, told: lowerSeen * DT })); }

// ---- THE CHARGE: under the raft, a bow-wave along the deck, she hauls herself aboard at its far end ----
{ const r = toPhase(awake(rig({ dodge: true })), 2); ok(until(r, () => r.show.n.haul > 0, 60 * 40, () => r.near(-120)), 'her charge never came under the raft and back aboard (' + JSON.stringify(r.show.n) + ')');
  ok(r.log.bands.some(b => b.name === M.MOVE_NAME.charge && b.kind === 'low'), 'her charge drew no low wave along the deck'); }

// ---- HER VINE: a hero out of her arms is not safe; jumped it misses; caught it pulls him to her ----
{ const r = awake(rig()); r.run(60 * 30, () => r.near(-180)); ok(r.show.n.vine > 0 && r.show.n.vined > 0 && r.log.vines.some(v => v.toX !== undefined && v.d === GT.dmg.vine), 'a hero far along the deck never drew her vine, or it did not pull him (' + JSON.stringify(r.show.n) + ')');
  ok(r.log.lines.includes('HER VINE PULLS YOU OFF: JUMP IT'), 'her vine was not taught');
  const q = awake(rig({ dodge: true })); q.run(60 * 30, () => q.near(-180)); ok(q.show.n.vine > 0 && q.show.n.vined === 0, 'a hero who jumps her vine was still caught'); }

// ---- THE HUMAN BOT ----
ok(M.PLAN.react >= 0.2 && M.PLAN.missDodge > 0 && M.PLAN.wrongAngle > 0, 'the bot plays perfectly (PLAN ' + JSON.stringify(M.PLAN) + ')');

// ---- THE STAGE (the canal's) ----
{ const lv = LEVELS.find(l => l.id === 'canal'); ok(lv && !lv.hidden, 'the canal is not the level that holds her');
  if (lv) { const L = lv.build(), A2 = L.arena, g = (x, y) => L.grid[y * L.W + x], sx = A2.lock.sx, Rr = A2.lock.R;
    ok(A2 && A2.boss === 'greenteeth' && A2.music === 'greenteeth', 'the lock is not her arena with her music');
    const w = A2.wallR - A2.wallL; ok(w >= 36 && w <= 44, 'the lock is ' + w + ' wide (rule A7: about forty)');
    ok(A2.trigger > (sx + M.STAGE.land + 1) * 16, 'the trigger is not out on the raft (past the west landing)'); ok(L.ents.some(e => e.t === 'check' && e.x < A2.wallL), 'no checkpoint stands outside the lock');
    ok(L.ents.filter(e => e.t === 'greenteeth').length === 1, 'she is not in the lock once');
    ok([1, 2, 3].every(k => g(sx + k, Rr) === T.SOLID) && [1, 2, 3].every(k => g(sx + 39 - k, Rr) === T.SOLID), 'the landings inside her doors are not stone at the deck\'s height');
    ok([...Array(M.STAGE.depth).keys()].every(k => g(sx + 20, Rr + k) === T.AIR) && g(sx + 20, Rr + M.STAGE.depth) === T.SOLID, 'her water is not ' + M.STAGE.depth + ' rows deep over a bed');
    ok((L.pools || []).some(p => p.lock && p.gtWater && !p.swim && !p.shallow), 'her water is not a deep pool that bites (and hands you back)');
    ok((L.moversExtra || []).filter(m => m.gtRaft).length === 1 && L.moversExtra.find(m => m.gtRaft).w === GT.raftW, 'there is not one raft');
    ok(L.waterHurts, 'the canal does not hand a hero back out of its water'); } }

if (!process.argv.includes('--pure')) {
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const {HERO_IDS}=await import('/src/progression.js');BK.manualSimulation=true;BK.SET.speed=1;const out={heroes:{}};
    const boot=h=>{BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='canal'));BK.start();BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(A.lock.sx+2,A.lock.R-1);BK.sim(20);BK.tp(A.start[0],A.start[1]);BK.sim(60*4);return BK.boss;};
    const e=boot('knight'),GH=BK.greenteethHands(),S=GH.show(),P=BK.P,k=BK.keys,m=BK.movers().find(q=>q.gtRaft);
    out.woke={active:BK.bossActive&&e&&e.t==='greenteeth',mode:e.mode,onRaft:P.onMover===m,raftX:Math.round(S.raft.x),mid:S.A.moorMid,ey:Math.round(e.y),deck:S.A.deck};
    /* FOR EVERY HERO: a real jump attack lands whole on her body-kelp phase, a plain swing clanks; a real low sweep lands whole under the hood */
    const quiet=()=>{S.arms=[];S.gap=9;S.charge=null;S.wary=null;if(e.mode!=='duel')e.mode='duel';e.hp=e.maxHp*0.9;P.inv=99;P.hp=P.maxHp;P.st=P.maxSt;};
    const place=()=>{quiet();e.x=S.raft.x+S.raft.w/2+30;e.y=S.A.deck;P.x=e.x-20;P.y=S.A.deck;P.vx=0;P.vy=0;P.face=1;};
    const blow=(fn)=>{const n0={...S.n};place();BK.sim(6);quiet();const h0=e.hp;fn();for(let i=0;i<30;i++){quiet();e.hp=Math.max(e.hp,1);if(i===0)e.hp=h0;BK.sim(1);}return {bare:S.n.bare-n0.bare,clank:S.n.clank-n0.clank,angle:e.lastAngle};};
    for(const h of HERO_IDS){ if(h!=='knight'){boot(h);} const S2=BK.greenteethHands().show(),e2=BK.boss;const o={};
      const runBlow=(fn)=>{const SS=BK.greenteethHands().show(),ee=BK.boss;const n0={...SS.n};const q=()=>{SS.arms=[];SS.gap=9;SS.charge=null;SS.wary=null;if(ee.mode!=='duel')ee.mode='duel';ee.hp=ee.maxHp*0.9;BK.P.inv=99;BK.P.hp=BK.P.maxHp;BK.P.st=BK.P.maxSt;};
        q();ee.x=SS.raft.x+SS.raft.w/2+30;ee.y=SS.A.deck;BK.P.x=ee.x-18;BK.P.y=SS.A.deck;BK.P.vx=0;BK.P.vy=0;BK.P.face=1;BK.sim(8);q();fn();for(let i=0;i<40;i++){q();BK.sim(1);}k.down=k.up=k.left=k.right=false;return {bare:SS.n.bare-n0.bare,clank:SS.n.clank-n0.clank,angle:ee.lastAngle};};
      S2.kelp='body';
      o.jump=runBlow(()=>{BK.press('jump');for(let i=0;i<10;i++)BK.sim(1);BK.P.face=1;BK.press('atk');});
      o.plain=runBlow(()=>{BK.press('atk');});
      S2.kelp='hood';
      o.sweep=runBlow(()=>{k.down=true;BK.sim(3);BK.press('atk');BK.sim(4);});
      out.heroes[h]=o; void e2; }
    /* STUCK IN THE RAFT: a real swing lands */
    { const e3=boot('knight'),S3=BK.greenteethHands().show();S3.arms=[];e3.x=S3.raft.x+S3.raft.w/2;e3.mode='stuck';e3.modeT=3;e3.openLen=3;e3.capLen=e3.capLeft=80;e3.claw={x:e3.x-24,y:S3.A.deck};
      BK.P.x=e3.x-30;BK.P.y=S3.A.deck;BK.P.face=1;BK.P.inv=99;BK.sim(2);const h0=e3.hp;BK.press('atk');for(let i=0;i<20;i++){e3.modeT=Math.max(e3.modeT,2);BK.P.inv=99;BK.sim(1);}out.stuck={dmg:h0-e3.hp,open:BK.bossOpen(e3)};
    /* A FALL INTO HER WATER: bitten, and handed back onto the raft */
      e3.mode='duel';S3.gap=9;S3.arms=[];BK.P.inv=0;BK.god=false;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;BK.P.x=S3.raft.x-30;BK.P.y=S3.A.deck+40;BK.P.vy=0;BK.P.onMover=null;let back=false;for(let i=0;i<60;i++){S3.gap=9;S3.arms=[];BK.sim(1);if(BK.P.onMover&&BK.P.onMover.gtRaft)back=true;}
      out.fall={bit:hp0-BK.P.hp,back,x:Math.round(BK.P.x),raft:[Math.round(S3.raft.x),Math.round(S3.raft.x+S3.raft.w)],y:Math.round(BK.P.y)};BK.god=true;
    /* HER DEATH ENDS THE FIGHT; the raft drifts to the east landing */
      e3.hp=1;e3.mode='stuck';e3.modeT=2;BKT.hurtEnemy(e3,99,e3.x-10,false);for(let i=0;i<60*6&&BK.bossActive;i++){BK.P.inv=99;BK.sim(1);}for(let i=0;i<60*6;i++){BK.state='play';BK.sim(1);}   /* (the level-up card after her death pauses the world: past it) */
      out.death={alive:e3.alive,active:BK.bossActive,raftX:Math.round(S3.raft.x),moorE:S3.A.moorE}; }
    return out;})()`, 600000);
  const w = r.woke; ok(w.active && w.mode !== 'sleep' && w.onRaft && Math.abs(w.raftX - w.mid) < 4 && Math.abs(w.ey - w.deck) < 4, 'walked onto the raft she did not wake, haul herself aboard and take the raft out: ' + JSON.stringify(w));
  for (const [h, o] of Object.entries(r.heroes)) {
    ok(o.jump.bare > 0 && o.jump.angle === 'high', h + ': a real jump attack did not land whole on her body-kelp phase: ' + JSON.stringify(o.jump));
    ok(o.plain.clank > 0 && o.plain.bare === 0, h + ': a plain standing swing did not clank on her kelp: ' + JSON.stringify(o.plain));
    ok(o.sweep.bare > 0 && o.sweep.angle === 'low', h + ': a real low sweep did not land whole under her hood: ' + JSON.stringify(o.sweep)); }
  ok(r.stuck.dmg >= 5 && r.stuck.open, 'stuck in the raft, a real swing did not bite: ' + JSON.stringify(r.stuck));
  ok(r.fall.bit > 0 && r.fall.back && r.fall.x >= r.fall.raft[0] && r.fall.x <= r.fall.raft[1], 'a fall into her water was not bitten and handed back onto the raft: ' + JSON.stringify(r.fall));
  ok(!r.death.alive && !r.death.active && Math.abs(r.death.raftX - r.death.moorE) < 4, 'her death did not end the fight and send the raft to the east landing: ' + JSON.stringify(r.death));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }
}

if (bad.length) { console.log('GREENTEETH: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  greenteeth  her four blows told and fired, one new blow a phase and one windup at a time, the kelp guards by angle (body: high, hood: low, shifting in phase three; a plain swing always meets it), the opening from fighting her (stuck in the raft, 3 s, its share), left alone she never opens and after it she is wary, fiercer each phase with the raft heaved and dragged lower (told first), the charge under the raft, the vine, a human bot, the stage' + (process.argv.includes('--pure') ? ' (pure only)' : ', and in the page for every hero'));
