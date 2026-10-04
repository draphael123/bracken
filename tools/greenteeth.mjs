// tools/greenteeth.mjs - JENNY GREENTEETH, the boss in THE FOG CANAL's lock (claude/lockkeeper; claude/jenny2). src/jenny-greenteeth.js is the fight
// (its header is the design). Daniel 10-02: "very repetitive and kind of annoying" - FIGHT HER, NOT THE PLUMBING. These rules hold it:
// PURE (src/jenny-greenteeth.js, no page):
//   - EVERY BLOW IS TOLD with its mark, answer and height (src/marks.js rows), and EVERY BLOW FIRES in a fuzz of all three phases
//   - ONE NEW BLOW A PHASE: the slam (1), the charge (2), the net (3) - and none of them before its phase
//   - THE OPENINGS COME FROM FIGHTING HER, each at least 3 s: a slam stepped out of on the timber STICKS her claws (open; a blow along the stuck arm
//     lands); a bite MET (blocked or rolled through) DAZES her; in the fog's shallows her charge at a hero on the boat runs AGROUND. A slam that
//     lands and a bite that bites open nothing
//   - LEFT ALONE A MINUTE (every blow taken) she never opens; a blow anywhere but an opening is GT.ward
//   - ONE MACHINE BEAT A PHASE, and a paddle is ONE timed strike (never worked, never a bar knocked back): the drain with her at the gate strands her
//     and the lock comes back higher, once; flooded she hides in a culvert once and its paddle throws her out; the fog's water falls once. Every
//     other strike of a paddle does nothing to the lock
//   - EVERY CYCLE CHANGES (the weed, what she leans on); AFTER AN OPENING SHE IS WARY (told) and does not throw the blow that opened her
//   - THE BRIGHT WEED holds you, then gives; the dark weed is no footing at all
//   - THE HUMAN BOT: it reacts late and misses some (src/jenny-greenteeth.js PLAN)
// THE STAGE: THE FOG CANAL (src/fog-canal.js section 7) holds her arena
// IN THE PAGE: she wakes and floods the lock; a bright weed mat holds a hero and then gives; a blow on her swimming is warded; a real swing at the
//   lower paddle with her at its gate drains the lock - stranded, and a blow bites; her claws stuck in the timber, a real swing along her arm bites;
//   her death ends the fight.
//   node tools/greenteeth.mjs            (PORT from tools/ports.mjs)       node tools/greenteeth.mjs --pure    (no page)
import { openPage } from './cdp.mjs';
import * as M from '../src/jenny-greenteeth.js';
import { MARK, ANSWER, HEIGHT, BY_HAND } from '../src/marks.js';
import { LEVELS, T } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, TS = 16, SX = 20, R = 21, A = M.geom(SX, R, TS), GT = M.GT;
/* a lock and a world: `log` counts what the world was asked to do. o.meet: the hero meets her bite; o.dodge: the hero is never under a slam/net */
function rig(o = {}) {
  const show = M.newShow(A); M.startFight(show);
  const e = M.newGreenteeth({ t: 'greenteeth', x: o.ex ?? A.mid, y: A.bed, hp: o.hp ?? GT.hp, maxHp: GT.hp, alive: true });
  e.mode = 'wake'; e.modeT = 1.6;
  const hero = { x: o.x ?? A.mid, y: A.bed, ground: false, swim: true, onWeed: -1, onTile: false, alive: true };
  const log = { hits: [], bands: [], grabs: 0, holds: 0, slams: 0, nets: 0, lines: [], sounds: [], events: {} };
  const inBox = box => { const hb = { l: hero.x - 5, r: hero.x + 5, t: hero.y - 20, b: hero.y }; return box[0] < hb.r && box[1] > hb.l && box[2] < hb.b && box[3] > hb.t; };
  const c = { heroes: [hero], say: () => {}, sound: k => log.sounds.push(k), number: (x, y, t) => log.lines.push(t), water: () => {},
    hit: (box, d, name, opt) => { log.hits.push({ box, d, name, opt }); return inBox(box) ? (opt && opt.meet && r0.meet ? 'met' : 'hit') : null; },
    band: (kind, b, x0, x1, d, name, key) => log.bands.push({ kind, b, x0, x1, d, name, key }),
    slam: box => { log.slams++; return !r0.dodge && inBox(box); }, net: box => { log.nets++; return !r0.dodge && inBox(box); },
    grab: (box, d) => { if (hero.onTile || !inBox(box)) return null; log.grabs++; return hero; },
    hold: () => { log.holds++; return !o.mash; }, drag: () => {}, release: () => {}, cycle: () => {} };
  const r0 = { meet: !!o.meet, dodge: !!o.dodge };
  /* where the hero stands: 'swim', 'walkE' / 'walkW' (a gate's walkway), 'walerE' / 'walerW' (the first waler over the water), 'weed', 'boat' */
  const place = where => { const surf = M.surfY(show);
    if (where === 'walkE' || where === 'walkW') Object.assign(hero, { x: A[where === 'walkE' ? 'E' : 'W'].stand, y: A.walk, ground: true, swim: false, onTile: true, onWeed: -1 });
    else if (where === 'walerE' || where === 'walerW') { const G = A[where === 'walerE' ? 'E' : 'W'], y = [...G.walers, A.walk].filter(v => v < surf - 8).sort((p, q) => q - p)[0];
      Object.assign(hero, { x: G.face + G.dir * 36, y, ground: true, swim: false, onTile: true, onWeed: -1 }); }
    else if (where === 'boat') Object.assign(hero, { x: (A.wreck.x0 + A.wreck.x1) / 2, y: A.wreck.y, ground: true, swim: false, onTile: true, onWeed: -1 });
    else if (where === 'weed') { const i = show.weed.findIndex(p => p.firm && !(p.broken > 0)); const p = show.weed[i]; Object.assign(hero, { x: (p.x0 + p.x1) / 2, y: p.y, ground: true, swim: false, onTile: false, onWeed: i }); }
    else Object.assign(hero, { y: surf + 12, ground: false, swim: true, onTile: false, onWeed: -1 }); };
  const step = () => { const ev = M.stepShow(e, show, DT, c); for (const v of ev) log.events[v.t] = (log.events[v.t] || 0) + 1; return ev; };
  const run = (n, f) => { for (let i = 0; i < n; i++) { if (f) f(i); step(); } };
  return { show, e, hero, log, c, step, run, place, r0 };
}
const until = (r, pred, n = 600, f) => { for (let i = 0; i < n; i++) { if (pred()) return true; if (f) f(i); r.step(); } return pred(); };
const awake = r => { until(r, () => r.e.mode !== 'wake', 200); return r; };
/* to a phase, settled: the phase's beat run through (the flood's culvert, the fog's water) */
const toPhase = (r, ph) => { if (ph >= 2) { r.e.hp = GT.hp * (ph === 2 ? 0.6 : 0.3); r.e.phase = ph - 1; until(r, () => r.e.phase === ph && !M.special(r.e) && r.e.base !== 'culvert' && r.e.base !== 'shift', 60 * 20, () => { if (r.e.base === 'culvert') r.show.hideT = 0; }); } return r; };

// ---- THE MARKS: every blow told, with its answer and its height; the quiet ones wear none ----
{ const ROWS = { grabTell: ['!!', 'dodge', 'low'], lashTell: ['!!', 'jump', 'low'], reachTell: ['!!', 'duck', 'high'], biteTell: ['!', 'block', 'low'], tearTell: ['!!', 'dodge', 'low'], surgeTell: ['!!', 'jump', 'low'],
    slamTell: ['!!', 'dodge', 'low'], chargeTell: ['!!', 'jump', 'low'], netTell: ['!!', 'dodge', 'low'] };
  for (const [m, [mk, an, hg]] of Object.entries(ROWS)) { const k = 'greenteeth|' + m; ok(MARK[k] === mk && BY_HAND[k] === mk, k + ' wears ' + JSON.stringify(MARK[k]) + ', not ' + mk); ok(ANSWER[k] === an, k + ' is answered ' + JSON.stringify(ANSWER[k]) + ', not ' + an); ok(HEIGHT[k] === hg, k + ' is ' + JSON.stringify(HEIGHT[k]) + ' high, not ' + hg);
    const mv = M.MOVES[m.replace(/Tell$/, '')]; if (mv) ok(mv.mark === mk && mv.answer === an && mv.h === hg, 'the fight\'s own row for ' + m + ' disagrees with src/marks.js'); }
  for (const m of ['floodTell', 'fogTell']) ok(MARK['greenteeth|' + m] === '', 'greenteeth|' + m + ' throws no blow but wears ' + JSON.stringify(MARK['greenteeth|' + m])); }

// ---- EVERY BLOW FIRES, and ONE NEW BLOW A PHASE: a fuzz of each phase, the hero moved about the lock ----
{ const fired = {}, byPhase = { 1: {}, 2: {}, 3: {} }; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const ph of [1, 2, 3]) { const r = toPhase(awake(rig()), ph); if (ph === 1) { r.show.cyc[1] = 1; M.applyCycle(r.show, 1, r.c); }   /* (her second cycle: the tear) */
    const spots = ph === 3 ? ['swim', 'walerE', 'walerW', 'weed', 'boat'] : ['swim', 'walerE', 'walerW', 'weed', 'walkE'];
    r.run(60 * 90, i => { if (i % 100 === 0) { const w = spots[Math.floor(rnd() * spots.length)]; r.place(w); if (w === 'weed' && r.hero.onWeed < 0) r.place('swim'); if (w === 'swim') r.hero.x = A.x0 + 100 + rnd() * (A.x1 - A.x0 - 200); }
      if (r.e.phase !== ph) { r.e.hp = GT.hp * (ph === 1 ? 0.9 : ph === 2 ? 0.6 : 0.3); }
      if (ph === 1 && i === 60 * 40) { r.place('walkE'); r.e.x = A.E.face - 90; }
      if (ph === 1 && i > 60 * 40 && i < 60 * 44 && i % 20 === 0) M.strikePaddle(r.e, r.show, 'E'); });
    for (const k of ['grab', 'lash', 'reach', 'bite', 'tear', 'surge', 'pair', 'slam', 'charge', 'net']) { if (r.show.n[k]) fired[k] = true; byPhase[ph][k] = r.show.n[k]; } }
  for (const k of ['grab', 'lash', 'reach', 'bite', 'tear', 'surge', 'pair', 'slam', 'charge', 'net']) ok(fired[k], 'HER ' + k.toUpperCase() + ' never fired in a fuzz of all three phases');
  ok(byPhase[1].slam > 0 && byPhase[2].charge > 0 && byPhase[3].net > 0, 'a phase\'s new blow did not come in its phase: ' + JSON.stringify(byPhase));
  ok(!byPhase[1].charge && !byPhase[1].net && !byPhase[2].net, 'a new blow came before its phase: ' + JSON.stringify(byPhase));
  ok(M.NEW_MOVE[1] === 'slam' && M.NEW_MOVE[2] === 'charge' && M.NEW_MOVE[3] === 'net', 'one new blow a phase is not slam / charge / net'); }

// ---- LEFT ALONE: a minute of her with every blow taken (the hero never steps out, never meets a bite) opens nothing ----
{ const r = awake(rig()); let opened = 0; r.place('walerW'); r.run(60 * 60, () => { r.place('walerW'); if (M.gtOpen(r.e)) opened++; });
  ok(opened === 0, 'left alone for a minute she was open ' + opened + ' frames'); ok(M.gtTake(r.e) === GT.ward && GT.ward <= 0.06, 'not open she takes ' + M.gtTake(r.e) + ' of a blow (the ward is ' + GT.ward + ')');
  ok(r.show.n.slam > 0 && r.show.n.slamHit === r.show.n.slam, 'a slam that landed on the hero still stuck her (' + r.show.n.slam + ' slams, ' + r.show.n.slamHit + ' hit)'); }

// ---- THE OPENINGS COME FROM FIGHTING HER ----
/* (a) ARM-STUCK: on a waler by the water, her slam comes; stepped out of once it is fixed, her claws go into the timber and she hangs there */
{ const r = awake(rig({ dodge: true })); r.place('walerE'); let st = null;
  ok(until(r, () => r.e.mode === 'stuck', 60 * 20, () => r.place('walerE')), 'stepping out of her slam on a waler never stuck her claws (' + JSON.stringify(r.show.n) + ')');
  st = { t: r.e.modeT, take: M.gtTake(r.e), claw: r.e.claw && { ...r.e.claw }, x: r.e.x, y: r.e.y };
  ok(st.t >= 3 && st.take === GT.openMul, 'stuck she is not open at ' + GT.openMul + ' for at least 3 s (' + st.t.toFixed(2) + ' s, x' + st.take + ')');
  ok(st.claw && M.ledgeAt(A, st.claw.x, st.claw.y) && Math.abs(st.y - GT.h + 12 - st.claw.y) < 2, 'her claws are not in the ledge\'s timber with her body hanging off it: ' + JSON.stringify(st));
  ok(r.log.lines.includes('HER CLAWS ARE STUCK: CUT HER'), 'her stuck claws were not said');
  const hb = { l: st.claw.x - 6, r: st.claw.x + 6, t: st.claw.y - 20, b: st.claw.y }; ok(M.strikeAt(r.e, r.show, hb, new Set()).some(q => q.what === 'claw'), 'a swing at her claws in the timber is not a blow on her');
  let t = 0; while (M.gtOpen(r.e) && t < 600) { r.step(); t++; } ok(t * DT >= 2.9, 'the stuck window ran ' + (t * DT).toFixed(2) + ' s (at least 3 s)'); }
/* (b) BITE MET: a bite blocked or rolled through dazes her at the surface; a bite that bites does not */
for (const meet of [true, false]) { const r = awake(rig({ meet })); r.place('walerE'); r.show.cyc[1] = 1; M.applyCycle(r.show, 1, r.c);
  const got = until(r, () => r.e.mode === 'dazed' || (r.show.n.bite > 0 && !meet && r.e.mode !== 'biteTell' && r.e.mode !== 'bite'), 60 * 30, () => r.place('walerE'));
  if (meet) { ok(got && r.e.mode === 'dazed' && r.e.modeT >= 2.9 && M.gtTake(r.e) === GT.openMul, 'a bite met did not daze her open for 3 s (' + r.e.mode + ', bites ' + r.show.n.bite + ')'); ok(r.log.lines.includes('HER BITE MET: SHE IS DAZED'), 'her daze was not said'); }
  else ok(r.show.n.bite > 0 && r.show.n.dazed === 0, 'a bite that bit dazed her (' + r.show.n.bite + ' bites, ' + r.show.n.dazed + ' dazed)'); }
/* (c) THE LURE: the fog's shallows; a hero on the boat draws her charge across it and she runs aground; a cycle without the lure, she will not cross */
{ const r = toPhase(awake(rig({ hp: GT.hp * 0.3 })), 3); ok(Math.abs(r.show.water.depth - GT.lv.shoal) < 2 && M.wreckShallow(r.show), 'in the fog the water did not fall until the boat\'s back is a shallow (' + r.show.water.depth.toFixed(0) + ')');
  ok(r.show.C.lure, 'the fog\'s first cycle is not a lure');
  r.place('boat'); ok(until(r, () => r.e.mode === 'stranded', 60 * 25, () => r.place('boat')), 'a hero on the boat in the shallows never drew her charge aground (' + JSON.stringify({ charge: r.show.n.charge, mode: r.e.mode }) + ')');
  ok(r.e.modeT >= 3 && M.gtTake(r.e) === GT.openMul && Math.abs(r.e.y - A.wreck.y) < 1 && r.e.x > A.wreck.x0 && r.e.x < A.wreck.x1, 'aground on the boat she is not open for 3 s on its back: ' + JSON.stringify({ t: r.e.modeT, x: r.e.x, y: r.e.y }));
  ok(r.log.lines.includes('AGROUND ON THE BOAT: CUT HER'), 'her running aground was not said');
  const q = toPhase(awake(rig({ hp: GT.hp * 0.3 })), 3); q.show.cyc[3] = 1; M.applyCycle(q.show, 3, q.c); ok(!q.show.C.lure, 'the fog\'s second cycle is a lure too (every cycle changes)');
  q.place('boat'); let crossed = 0; q.run(60 * 25, i => { q.place('boat'); if (i > 120 && q.e.x > A.wreck.x0 + 4 && q.e.x < A.wreck.x1 - 4) crossed++; });
  ok(crossed === 0 && q.show.n.lure === 0, 'without the lure she still went over the boat\'s back (' + crossed + ' frames)'); }
ok(GT.stuckT >= 3 && GT.dazeT >= 3 && GT.strandT >= 3 && GT.flushT >= 3, 'an opening is under 3 s (stuck ' + GT.stuckT + ', dazed ' + GT.dazeT + ', strand ' + GT.strandT + ', flush ' + GT.flushT + ')');

// ---- ONE MACHINE BEAT A PHASE; a paddle is one timed strike ----
/* phase one: struck with her away from the gate, the drain does nothing (and costs nothing); with her at the gate one strike strands her; the lock comes
   back HALF, once; the drain struck again does nothing */
{ const r = awake(rig({ ex: A.mid })); r.place('walkE'); r.e.x = A.mid; const w0 = r.show.water.depth;
  ok(M.strikePaddle(r.e, r.show, 'E') === 'wait' && !r.show.pad.E.open && r.show.beat[1] === 'ready', 'the drain struck with her away from the gate did something');
  ok(!('work' in r.show.pad.E), 'a paddle still keeps a worked-progress bar');
  r.run(31); r.e.x = A.E.face - 90; r.e.mode = r.e.base = 'lurk'; r.show.arms = [];
  const res = M.strikePaddle(r.e, r.show, 'E'); ok(res === 'drain', 'one strike of the drain with her at the gate did not drain the lock (' + res + ')');
  ok(until(r, () => r.e.mode === 'stranded', 60 * 3, () => { r.e.x = Math.min(r.e.x, A.E.face - 90); }), 'the lock drained under her and she was not stranded (' + r.e.mode + ', ' + r.show.water.depth.toFixed(0) + ')');
  ok(M.gtOpen(r.e) && r.e.big && M.gtTake(r.e) === GT.beatMul && r.e.modeT >= 3, 'stranded by the drain she is not open at x' + GT.beatMul + ' for 3 s');
  ok(r.log.lines.includes('SHE IS STRANDED: CUT HER'), 'her stranding was not said in the hint box');
  ok(until(r, () => r.e.mode === 'lurk' && Math.abs(r.show.water.depth - GT.lv.half) < 2, 60 * 12), 'after the drain the lock did not come back HALF with her in it (' + r.e.mode + ', ' + r.show.water.depth.toFixed(0) + ')');
  ok(M.strikePaddle(r.e, r.show, 'E') === 'spent' && M.strikePaddle(r.e, r.show, 'W') === 'busy' || r.show.beat[1] === 'done', 'the drain could be run again in phase one');
  r.run(31); ok(M.strikePaddle(r.e, r.show, 'W') === 'spent' && !r.show.pad.W.open, 'the upper paddle did something to the lock in phase one');
  /* her water through the rest of phase one, openings and all: it stays where the drain left it */
  const levels = new Set(); r.r0.dodge = true; r.r0.meet = true; r.run(60 * 40, () => { r.place('walerE'); if (!r.show.pad.E.open && !M.special(r.e)) levels.add(Math.round(r.show.water.target)); });
  ok([...levels].every(v => v === GT.lv.half) && r.show.cycle >= 2, 'phase one\'s water changed again after the drain (' + [...levels] + ', ' + r.show.cycle + ' cycles)'); void w0; }
/* phase two: the flood, her culvert once - the other paddle does nothing, hers throws her out - and never again */
{ const r = awake(rig()); r.place('walkE'); r.e.hp = GT.hp * 0.6; until(r, () => r.e.mode === 'floodTell', 300);
  ok(r.e.mode === 'floodTell' && r.log.lines.includes('THE LOCK FLOODS: SHE HIDES IN A CULVERT'), 'below two thirds she did not flood the lock (said)');
  ok(until(r, () => r.e.base === 'culvert', 60 * 8), 'flooded, she never hid in a culvert (' + r.e.base + ')');
  ok(Math.abs(r.show.water.depth - GT.lv.high) < 2 && GT.lv.high < R * TS - A.walk, 'the flood did not bring the water up under the walkways (' + r.show.water.depth.toFixed(0) + ')');
  const side = r.show.hide, other = side === 'W' ? 'E' : 'W';
  ok(M.strikePaddle(r.e, r.show, other) === 'notHere' && r.e.base === 'culvert', 'the paddle of the culvert she is NOT in did something to her'); r.run(31);
  const res = M.strikePaddle(r.e, r.show, side); ok(res === 'flush' && r.e.mode === 'flushed' && r.e.big && M.gtTake(r.e) === GT.beatMul && r.e.modeT >= 3, 'one strike of her culvert\'s paddle did not throw her out, open (' + res + ', ' + r.e.mode + ')');
  let back = 0; r.r0.dodge = true; r.run(60 * 40, () => { r.place('walerE'); if (r.e.base === 'culvert' || r.e.base === 'shift') back++; });
  ok(back === 0 && r.show.beat[2] === 'done', 'after her flush she went back into a culvert (' + back + ' frames): the beat is once a phase');
  const q = awake(rig()); q.place('walkE'); q.e.hp = GT.hp * 0.6; until(q, () => q.e.base === 'culvert', 60 * 10); let out = until(q, () => q.show.n.surge >= 1 && q.e.base === 'lurk', 60 * (GT.hideMax + 4));
  ok(out && q.show.n.surge >= 1, 'left in her culvert she never came out (no soft-lock: GT.hideMax ' + GT.hideMax + ')'); }
/* phase three: the fog comes down and the water falls once, to the shallows, and stays */
{ const r = toPhase(awake(rig({ hp: GT.hp * 0.3, dodge: true, meet: true })), 3); ok(r.show.fog > 0.5 && r.log.lines.includes('THE FOG COMES DOWN AND THE WATER GOES OUT'), 'below a third the fog did not come down (said)');
  const levels = new Set(); r.run(60 * 40, () => { r.place(r.show.C.lure ? 'boat' : 'walerE'); if (!M.special(r.e)) levels.add(Math.round(r.show.water.target)); });
  ok([...levels].every(v => v === GT.lv.shoal), 'the fog\'s water changed with her cycles (' + [...levels] + ')'); ok(M.strikePaddle(r.e, r.show, 'E') !== 'drain', 'the drain ran again in the fog'); }

// ---- EVERY CYCLE CHANGES; AFTER AN OPENING SHE IS WARY ----
{ const sig = C => [C.weed, C.lean, !!C.tear, !!C.pairs, !!C.doubles, !!C.lure].join('|');
  for (const ph of [1, 2, 3]) for (let k = 1; k < M.CYCLES[ph].length; k++) ok(sig(M.cycleOf(ph, k)) !== sig(M.cycleOf(ph, k - 1)), 'phase ' + ph + ' cycle ' + (k + 1) + ' is the same as the one before it');
  ok(M.CYCLES[1].length >= 3 && M.CYCLES[2].length >= 2 && M.CYCLES[3].length >= 2, 'a phase has too few different cycles');
  const r = awake(rig({ dodge: true })); r.place('walerE'); until(r, () => r.e.mode === 'stuck', 60 * 20, () => r.place('walerE')); const c0 = r.show.cycle;
  until(r, () => !M.gtOpen(r.e), 60 * 5, () => r.place('walerE'));
  ok(r.show.cycle === c0 + 1 && r.show.wary && r.show.wary.k === 'slam' && r.log.lines.includes('SHE IS WARY: NOT THE SAME TRICK TWICE'), 'after her claws came free the cycle did not turn and she was not wary of the slam (told)');
  const n0 = r.show.n.slamTold || 0; r.run(Math.floor(GT.wardT * 60) - 5, () => r.place('walerE')); ok((r.show.n.slamTold || 0) === n0, 'wary of the slam she slammed again within ' + GT.wardT + ' s'); }

// ---- THE WEED: the bright holds you a while, then gives; the dark is no footing ----
{ const r = awake(rig()); r.place('weed'); const i = r.hero.onWeed; let t = 0;
  while (!(r.show.weed[i].broken > 0) && t < 600) { r.hero.onWeed = i; r.show.gap = 9; r.show.arms = []; r.step(); t++; }   /* (her blows held off) */
  ok(t * DT >= GT.weedHold - 0.1 && t * DT <= GT.weedHold + 0.2, 'a bright weed mat held a hero ' + (t * DT).toFixed(2) + ' s (it should hold about ' + GT.weedHold + ' and give)');
  ok(r.show.weed.some(p => !p.firm) && r.show.weed.filter(p => !p.firm).every(p => p.m < 0), 'a dark weed mat is footing (it must be only water with a skin on it)');
  for (const k of Object.keys(M.WEED)) ok(M.WEED[k].filter(p => p[2]).length <= M.WEED_MOVERS, 'weed ' + k + ' has more bright mats than the stage has movers for'); }

// ---- THE HUMAN BOT ----
ok(M.PLAN.react >= 0.2 && M.PLAN.missDodge > 0 && M.PLAN.missMeet > 0 && M.PLAN.late > 0, 'the bot plays perfectly (PLAN ' + JSON.stringify(M.PLAN) + ')');

// ---- THE STAGE (the canal's lock) ----
{ const lv = LEVELS.find(l => l.id === 'canal'); ok(lv && !lv.hidden && !LEVELS.some(l => l.id === 'greenlock'), 'the canal is not the one level that holds her (a hidden standalone lock is gone)');
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
    const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='canal'));BK.start();BK.god=true;BK.sim(10);
      const A=BK.L.arena;BK.tp(A.start[0],A.start[1]);BK.sim(200);return BK.boss;};
    const e=boot(),GH=BK.greenteethHands(),S=GH.show(),A=S.A,P=BK.P;
    out.woke=BK.bossActive&&e&&e.t==='greenteeth';out.depth=Math.round(S.water.depth);out.pool=Math.round(BK.L.pools.find(p=>p.lock).y);
    /* a bright mat holds a hero, then gives */
    const wi=S.weed.findIndex(p=>p.firm&&!(p.broken>0)),wp=S.weed[wi];P.x=(wp.x0+wp.x1)/2;P.y=wp.y-6;P.vy=0;let stood=0,fell=false;
    for(let i=0;i<60*4;i++){S.gap=9;S.arms=[];if(P.onMover&&P.onMover.weed)stood++;else if(stood>30){fell=true;break;}BK.sim(1);}out.weed={stood:+(stood/60).toFixed(2),fell};
    /* a blow on her swimming is warded */
    const h0=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.ward=h0-e.hp;
    /* a real swing at the lower paddle from its walkway with her at its gate: the lock drains under her, and stranded a blow bites */
    for(let i=0;i<60*3&&e.mode!=='lurk';i++)BK.sim(1);
    const G=A.E;let tries=0;for(;tries<600&&!S.pad.E.open;tries++){P.x=G.paddle.x-14;P.y=A.walk;P.vy=0;P.face=1;e.x=G.face-90;e.mode=e.base='lurk';S.gap=9;S.arms=[];if(tries%20===0)BK.press('atk');BK.sim(1);}
    out.drain={open:S.pad.E.open,tries};let f=0;for(;f<60*4&&e.mode!=='stranded';f++){e.x=Math.min(e.x,G.face-90);BK.sim(1);}
    out.strand={mode:e.mode,f,open:BK.bossOpen(e),bar:BK.greenteeth().mode};const s0=e.hp;BKT.hurtEnemy(e,50,e.x-10,false);out.strand.dmg=s0-e.hp;
    /* her claws stuck in the timber of the west gate's walkway: a real swing along her arm from the walkway bites */
    for(let i=0;i<60*12&&(e.mode!=='lurk'||S.water.depth<40);i++){P.inv=99;BK.sim(1);}
    const W=A.W,cx=W.face+40;e.mode='stuck';e.modeT=3;e.openLen=3;e.claw={x:cx,y:A.walk};e.x=W.face+76;e.y=A.walk+GT_H-12;S.arms=[];
    P.x=cx-14;P.y=A.walk;P.vy=0;P.face=1;P.inv=99;BK.sim(2);const k0=e.hp;P.face=1;BK.press('atk');for(let i=0;i<20;i++){e.modeT=Math.max(e.modeT,2);P.inv=99;BK.sim(1);}
    out.stuck={dmg:k0-e.hp,mode:e.mode,open:BK.bossOpen(e),bar:BK.greenteeth().mode};
    /* her death ends the fight */
    e.hp=1;e.mode='stranded';e.modeT=2;BKT.hurtEnemy(e,99,e.x-10,false);for(let i=0;i<300&&BK.bossActive;i++){P.inv=99;BK.sim(1);}
    out.death={alive:e.alive,active:BK.bossActive};return out;})()`.replace('GT_H', String(GT.h)), 300000);
  ok(r.woke && r.depth >= 40, 'she did not wake and flood the lock: ' + JSON.stringify(r));
  ok(r.weed.stood >= 1.5 && r.weed.fell, 'a bright weed mat did not hold a hero and then give: ' + JSON.stringify(r.weed));
  ok(r.ward > 0 && r.ward <= 3, 'a blow on her in her water was not warded (' + r.ward + ' of 50)');
  ok(r.drain.open, 'a real swing at the lower paddle from its walkway with her at its gate did not drain the lock: ' + JSON.stringify(r.drain));
  ok(r.strand.mode === 'stranded' && r.strand.open && r.strand.dmg >= 50 * GT.beatMul * 0.9, 'the lock drained under her and she was not stranded and open to a blow: ' + JSON.stringify(r.strand));
  ok(r.stuck.dmg >= 5 && r.stuck.open, 'a real swing along her arm stuck in the timber did not bite: ' + JSON.stringify(r.stuck));
  ok(!r.death.alive && !r.death.active, 'her death did not end the fight: ' + JSON.stringify(r.death));
  ok(pg.errors.length === 0, 'the page threw: ' + pg.errors.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r));
} finally { pg.close(); }
}

if (bad.length) { console.log('GREENTEETH: ' + bad.length + ' problem(s):'); for (const b of bad) console.log('  - ' + b); process.exit(1); }
console.log('ok  greenteeth  every blow told and fired, one new blow a phase, the openings from fighting her (stuck, dazed, aground) at 3 s, left alone she never opens, one machine beat a phase (one strike, never worked), every cycle changes and she is wary after, the weed, a human bot, the stage' + (process.argv.includes('--pure') ? ' (pure only)' : ', and in the page'));
