// tools/caravan.mjs — THE SUNKEN CARAVAN's mechanics, proved in Node before the level exists (none of it is wired in):
// SUNSTROKE (src/sunstroke.js), QUICKSAND (src/quicksand.js) and THE DUNE WORM's state machine (src/dune-worm.js).
// What this proves is LOGIC and the fight rules (A1 four told attacks, A3 every attack fires, A5 nothing untouchable past
// ~2 s, A6 an open window after each, the opening is CAUSED). It does NOT prove balance: the bots here are scripted and
// the numbers they post are not a pilot (memory: a balance harness must verify the real fight). The boss batch runs the
// real pilot, >= 21 runs at normal health, in the page.
// usage: node tools/caravan.mjs     exit 1 on any failure
import { install } from './node-canvas.mjs';
install();   // sunstroke.js reads SHADE_OF from the art module, which imports the art helpers
const { SUN, sunStep, roofShade, shadeZones, inShade, sunStretches, vultureShade } = await import('../src/sunstroke.js');
const { QS, qsStep, qsPatchAt } = await import('../src/quicksand.js');
const { WORM, WORM_TELLS, newWorm, wormStep, wormTouchable, wormHurt, wormTake, wormOpen } = await import('../src/dune-worm.js');
const { T } = await import('../src/level.js');

let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60;

// ================= SUNSTROKE =================
log('SUNSTROKE');
{ const s = { v: 0 }; let t = 0, swimAt = null, hurtAt = null;
  while (t < 20 && hurtAt === null) { const r = sunStep(s, DT, false); t += DT; if (swimAt === null && r.swim > 0) swimAt = t; if (r.hurt) hurtAt = t; }
  ok(swimAt > 4 && hurtAt > swimAt + 3, `open sun from cool: the view starts to swim at ${swimAt.toFixed(1)} s, the first ${SUN.dmg} damage at ${hurtAt.toFixed(1)} s - the warning comes ${(hurtAt - swimAt).toFixed(1)} s before the harm`);
  let c = 0; while (s.v > 0) { sunStep(s, DT, true); c += DT; }
  ok(c <= SUN.cool + 0.05, `shade cools it from full in ${c.toFixed(1)} s: a stop, not a rest`);
  const w = { v: 0 }; let hurt = 0, swim = 0; for (let k = 0; k < SUN.maxWalk / DT; k++) { const r = sunStep(w, DT, false); hurt += r.hurt; swim = Math.max(swim, r.swim); }
  ok(hurt === 0 && swim > 0, `the longest walk the level rule allows (${SUN.maxWalk} s of sun) hurts nothing but swims the view (${(swim * 100).toFixed(0)}%): walking shade to shade is safe, and it tells you`);
  // repeated: 7.5 s of sun, 1.5 s of shade, over and over - does it creep up?
  const r2 = { v: 0 }; let h2 = 0; for (let k = 0; k < 20; k++) { for (let i = 0; i < SUN.maxWalk / DT; i++) h2 += sunStep(r2, DT, false).hurt; for (let i = 0; i < 1.5 / DT; i++) sunStep(r2, DT, true); }
  ok(h2 === 0, `twenty stretches of ${SUN.maxWalk} s sun with only 1.5 s of shade between: ${h2} damage (it does not creep)`); }
{ // shade zones: an awning and a wagon placed as ents, and a rock overhang
  const L = { ents: [{ t: 'awning', x: 10, y: 21 }, { t: 'wagon', x: 30, y: 21 }], shade: [[800, 900, 300, 353]] };
  const Z = shadeZones(L), foot = 22 * 16;
  ok(inShade(Z, 10 * 16 + 8, foot - 1) && inShade(Z, 30 * 16 + 8, foot - 1) && !inShade(Z, 20 * 16, foot - 1) && inShade(Z, 850, foot - 1), `shade: under the awning, in the wagon's lee and in a marked rect - yes; in the open between them - no (${Z.length} zones)`);
  const W = 20, H = 30, g = new Uint8Array(W * H); for (let x = 0; x < W; x++) g[22 * W + x] = T.SOLID; for (let x = 8; x < 14; x++) g[17 * W + x] = T.SOLID;
  const tA = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x], rock = t => t === T.SOLID;
  ok(roofShade(tA, 10 * 16 + 8, 22 * 16 - 14, rock) && !roofShade(tA, 4 * 16, 22 * 16 - 14, rock), 'an overhang four rows over the head is shade; open sky is not');
  const v = vultureShade({ x: 400 }, foot); ok(inShade([v], 400, foot - 1) && !inShade([v], 440, foot - 1), 'a vulture casts a moving shade 28 px wide under it');
  const route = []; for (let x = 0; x <= 1600; x += 4) route.push([x, foot]); const st = sunStretches(route, (x, y) => inShade(Z, x, y - 1));
  ok(st.length && st[0].s > 0, `sunStretches times each walk in the sun: the longest here is ${st[0].s.toFixed(1)} s (${st[0].x0}-${st[0].x1} px) - the level tool fails a road over ${SUN.maxWalk} s`); }

// ================= QUICKSAND =================
log('QUICKSAND');
{ const q = { x0: 100, x1: 196, y: 320 }, L = { quicksand: [q] };
  const run = (rate, secs, startDepth = 0) => { const b = { x: 148, y: q.y + startDepth, vx: 0, vy: 0, qsDepth: startDepth }; let t = 0, next = 0, maxD = 0;
    while (t < secs) { const press = rate > 0 && t >= next; if (press) next += 1 / rate; const r = qsStep(b, qsPatchAt(L, b.x, b.y) || q, DT, { jumpPress: press }); t += DT; maxD = Math.max(maxD, r.depth); if (r.out) return { out: t, maxD }; }
    return { out: null, maxD, depth: b.qsDepth }; };
  const still = run(0, 30); ok(still.out === null && still.maxD <= QS.maxDepth && still.depth === QS.maxDepth, `standing still: it sinks to ${still.maxD} px (chest-deep on a 14 px knight) and holds there for 30 s - it never kills`);
  const r6 = run(6, 10, QS.maxDepth), r4 = run(4, 10, QS.maxDepth), r2 = run(2, 10, QS.maxDepth);
  ok(r6.out && r6.out < 1.6 && r4.out && r4.out < 4 && r2.out === null, `from the bottom: mashing jump 6/s gets out in ${r6.out?.toFixed(2)} s, 4/s in ${r4.out?.toFixed(2)} s, 2/s never (${r2.depth?.toFixed(1)} px deep after 10 s) - it is a verb, not a wait`);
  const b = { x: 104, y: q.y, vx: 0, vy: 0 }; let t = 0; while (qsPatchAt(L, b.x, b.y) && t < 3) { qsStep(b, qsPatchAt(L, b.x, b.y), DT, { move: -1 }); b.x += b.vx * DT; t += DT; }
  ok(!qsPatchAt(L, b.x, b.y) && t < 0.4, `stepping in at the edge you can wade back out if you turn at once (${t.toFixed(2)} s); deeper than ${QS.stuck} px you cannot walk`);
  const d = { x: 150, y: q.y + QS.stuck + 1, vx: 0, vy: 0, qsDepth: QS.stuck + 1 }; qsStep(d, q, DT, { move: 1 }); ok(d.vx === 0, 'below the wading depth, walking does nothing: the only way out is up');
  /* THE NUMBERS ARE IN REAL TIME (Daniel, 2026-09-24, decision A). A player's taps are real seconds whatever the Game speed
     setting, and the game hands the quicksand WORLD time (dt x SET.speed). At the default 0.6 the sand sank at 0.6 of its
     rate under taps that did not slow down, so 2 taps a second got out in 2.5 s in the page. This drives the game's own call
     (qsGameStep, what src/main.js calls) with real frames at both speeds: 2 taps/s must NEVER get out in 10 s, 6 must. */
  { const QSM = await import('../src/quicksand.js');
    const gameStep = QSM.qsGameStep || ((b, q2, gdt, speed, o) => qsStep(b, q2, gdt, o));   /* the old call in main.js: world time, no clock */
    const real = (rate, speed, secs = 10) => { const b = { x: 148, y: q.y + QS.maxDepth, vx: 0, vy: 0, qsDepth: QS.maxDepth }; let t = 0, next = 0;
      while (t < secs) { const press = t >= next; if (press) next += 1 / rate; const r = gameStep(b, q, DT * speed, speed, { jumpPress: press }); t += DT; if (r.out) return t; } return null; };
    for (const sp of [0.6, 1]) { const r2 = real(2, sp), r6 = real(6, sp);
      ok(r2 === null && r6 !== null && r6 < 0.8, `in REAL time at game speed ${sp}: 2 taps a second ${r2 === null ? 'never gets out in 10 s' : 'gets OUT in ' + r2.toFixed(2) + ' s'}, 6 a second gets out in ${r6 === null ? 'never' : r6.toFixed(2) + ' s'} (the amendments: 0.5 s at 6, never at 2)`); }
    const main = (await import('node:fs')).readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
    ok(/qsGameStep\(P, q, dt, SET\.speed \|\| 1,/.test(main) && !/[^.\w]qsStep\(P,/.test(main), 'src/main.js steps the hero through qsGameStep with the Game speed, never through qsStep in world time'); } }

// ================= THE DUNE WORM =================
log('THE DUNE WORM (logic and fight rules, not balance)');
const ARENA = { x0: 0, x1: 40 * 16, floorY: 20 * 16 };
ok((ARENA.x1 - ARENA.x0) / 16 <= 44, `A7: the arena is ${(ARENA.x1 - ARENA.x0) / 16} tiles`);
/* THE ROLLED-OUT SHADE (docs/briefs/dune-worm.md): the hollow's awning spans CANOPY while it is out. A scripted fighter.
   policy 'bait': wind the awning out (walk to the winch, strike, wait the roll), stand under it through the ripple and move off
   the breach LATE. 'open': the same awning out, but fight in the open sand as far from it as it can. 'rolledIn': stand under the
   awning's span with it ROLLED IN (never wound). All three: walk at RUN, swing (14 a blow, one per 0.35 s) at anything touchable in
   reach, get out of a lunge's landing and a swallow's pit, mash out of a pull. Counts what hits it. */
const CANOPY = [14 * 16, 27 * 16], WINCH_X = 12 * 16 + 8, ROLL = 1.2;
function fight(policy) {
  const W = newWorm(ARENA, 320); let px = policy === 'open' ? 60 : 170, t = 0, swingT = 0, pulled = 0;
  let aw = policy === 'rolledIn' ? 0 : 1, rollT = 0;   /* the awning: 1 out, 0 in; rollT counts a wind in progress */
  const st = { opens: 0, frees: 0, hitsTaken: 0, tells: new Set(), maxUntouch: 0, windows: [], stormAt: null, decoyBulged: 0, realBulged: 0, winds: 0 };
  let lastTouch = wormTouchable(W), runLen = 0;
  const mid = (CANOPY[0] + CANOPY[1]) / 2, far = ARENA.x1 - 60;
  while (t < 240 && W.hp > 0) {
    let tx = px; const real = W.ripples.find(r => r.real), committed = real && real.commit;
    if (policy === 'bait' && aw === 0 && rollT <= 0 && W.mode !== 'tangled' && !committed) tx = WINCH_X - 6;                   // the awning is down: wind it first
    else if (W.mode === 'tangled' || (wormTouchable(W) && W.mode !== 'lunge')) tx = W.x - 14;                                   // go and hit it
    else if (committed) { const away = Math.abs(px - real.tx) > 1 ? Math.sign(px - real.tx) : (px < (ARENA.x0 + ARENA.x1) / 2 ? 1 : -1); tx = px + away * 40; }   // LATE: off the locked spot
    else if (W.mode === 'rippleTell' || W.mode === 'under' || W.mode === 'dive') tx = policy === 'open' ? far : policy === 'bait' && aw < 1 ? WINCH_X - 6 : mid;
    if (W.mode === 'lungeTell' || W.mode === 'lunge') tx = px + (px >= W.lungeTo ? 1 : -1) * 70;                            // off the shadow
    if ((W.mode === 'swallowTell' || W.mode === 'swallow') && W.pit) tx = px + (px >= W.pit.x ? 1 : -1) * 80;               // out of the pit
    if (policy === 'open') tx = Math.max(CANOPY[1] + 30, tx);   /* it keeps to the open sand past the awning, whatever it is doing */
    const step = Math.max(-92 * DT, Math.min(92 * DT, tx - px)); px = Math.max(ARENA.x0 + 8, Math.min(ARENA.x1 - 8, px + (pulled > 0 ? 0 : step)));
    /* the winch: struck from beside it, it rolls the awning out over ROLL s */
    if (policy === 'bait' && aw === 0 && rollT <= 0 && Math.abs(px - WINCH_X) < 12) { rollT = ROLL; st.winds++; }
    if (rollT > 0) { rollT -= DT; if (rollT <= 0) aw = 1; }
    const ev = wormStep(W, { px, py: ARENA.floorY, pGround: true, canopy: aw === 1 ? CANOPY : null }, DT);
    for (const e of ev) {
      if (e.t === 'tell') st.tells.add(e.what);
      if (e.t === 'open') { st.opens++; aw = 0; rollT = 0; }   /* the awning comes down off its rollers onto him */
      if (e.t === 'free') st.frees++;
      if (e.t === 'stormOn') st.stormAt = t;
      if (e.t === 'pull') { px += Math.sign(e.toX - px) * e.v * DT; pulled = 0.25; }   /* (it mashes out: pulled for a moment, then free) */
      if (e.t === 'hit' && e.box && px >= e.box[0] && px <= e.box[1] && ARENA.floorY - 1 >= e.box[2] && ARENA.floorY - 14 <= e.box[3]) { st.hitsTaken++; (st.hitBy ||= []).push(e.what + '@' + t.toFixed(1) + ' px ' + px.toFixed(0) + ' box ' + e.box.map(v => v.toFixed(0)).join('/') + ' mode ' + W.mode); }
    }
    if (W.mode === 'rippleTell') for (const r of W.ripples) if (r.commit) { if (r.real && r.bulge) st.realBulged++; if (!r.real && r.bulge) st.decoyBulged++; }
    pulled = Math.max(0, pulled - DT);
    swingT -= DT; if (swingT <= 0 && Math.abs(W.x - px) < 26 && wormTouchable(W)) { wormHurt(W, 14); swingT = 0.35; }
    const now = wormTouchable(W); if (now === lastTouch) runLen += DT; else { if (!lastTouch) st.maxUntouch = Math.max(st.maxUntouch, runLen); else st.windows.push(runLen); runLen = DT; lastTouch = now; }
    t += DT; }
  st.time = t; st.hp = W.hp; return st;
}
const bait = fight('bait'), open = fight('open'), rolledIn = fight('rolledIn');
ok(['ripple', 'spit', 'lunge', 'swallow'].every(k => bait.tells.has(k)), `A1/A3: four told attacks, and every one fired in the fight (${[...bait.tells].join(', ')})`);
ok(WORM.CHAIN[0] === 'ripple', 'the signature (the ripple and its breach) is first in the chain');
ok(WORM_TELLS.every(m => m.endsWith('Tell')) && WORM_TELLS.length === 4, 'A2: the four windups are modes that end in Tell (main.js windingUp() sounds them)');
{ const W0 = newWorm(ARENA, 320), timers = Object.entries(W0).filter(([k, v]) => /^(t|i|hp|hitMult|lungeFrom|lungeTo|tangles)$/.test(k));
  ok(timers.length === 7 && timers.every(([, v]) => typeof v === 'number' && Number.isFinite(v)), 'A3: every timer and count the machine reads is a number at spawn (' + timers.map(([k, v]) => k + '=' + v).join(' ') + ')'); }
ok(Math.max(bait.maxUntouch, open.maxUntouch) <= 2.0, `A5: the longest stretch it cannot be hit is ${Math.max(bait.maxUntouch, open.maxUntouch).toFixed(2)} s (the rule: about two)`);
const minWin = Math.min(...bait.windows, ...open.windows);
ok(minWin >= 0.5, `A6: every untouchable stretch is followed by an open one, the shortest ${minWin.toFixed(2)} s`);
ok(bait.opens >= 3 && open.opens === 0 && rolledIn.opens === 0, `THE OPENING IS CAUSED: baiting the breach under the rolled-out shade tangled it ${bait.opens} times (${bait.winds} winds of the winch); fighting in open sand ${open.opens}; under the awning ROLLED IN ${rolledIn.opens}`);
ok(bait.frees === bait.opens || bait.frees === bait.opens - 1, `every tangle ends: it tears free and dives (${bait.frees} of ${bait.opens})`);
ok(bait.stormAt !== null, `phase 2: the storm is called at ${bait.stormAt?.toFixed(0)} s (the world brings the gusts in; the machine only says when)`);
ok(bait.realBulged > 0 && bait.decoyBulged === 0, 'phase 2 decoys never bulge at the commit: only the real ripple rises (readable, late)');
ok(bait.hp === 0 && (open.hp > 0 || open.time > bait.time * 1.3), `the opening matters: the baiter kills it in ${bait.time.toFixed(0)} s, the open-sand fighter ${open.hp > 0 ? 'has not in ' + open.time.toFixed(0) + ' s (' + open.hp + ' hp left)' : 'takes ' + open.time.toFixed(0) + ' s'} (scripted bots: a shape, not a balance)`);
ok(bait.hitsTaken + open.hitsTaken === 0, `a bot that moves off each tell as it is shown takes ${bait.hitsTaken + open.hitsTaken} hits: every red attack has a clean answer in time`);
if (bait.hitBy || open.hitBy) console.log('    ', JSON.stringify({ bait: bait.hitBy, open: open.hitBy }));
{ let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;   /* WITH DICE: the three surfaced moves in a fresh order each round, and still nothing untouchable past about two seconds */
  const W = newWorm(ARENA, 320), orders = []; let last = null, run = 0, worst = 0;
  for (let t = 0; t < 200; t += DT) { wormStep(W, { px: 100, py: ARENA.floorY, pGround: false, canopy: null, rng }, DT); if (W.order && W.order !== last) { orders.push(W.order.join(' ')); last = W.order; }
    if (!wormTouchable(W)) run += DT; else { worst = Math.max(worst, run); run = 0; } }
  ok(orders.length > 5 && orders.every(o => o.split(' ').sort().join() === 'lunge,spit,swallow') && new Set(orders).size >= 3 && worst <= 2.05, 'with the world dice, every round is all three of spit, lunge and swallow between the ripples, in ' + new Set(orders).size + ' different orders over ' + orders.length + ' rounds; longest untouchable ' + worst.toFixed(2) + ' s'); }
{ const W = newWorm(ARENA, 320); ok(wormTake(W) === 0 && wormHurt(W, 50) === 0, 'under the sand a blow does nothing (wormTake 0)'); W.mode = 'tangled'; W.hitMult = WORM.tangledMult; ok(wormTake(W) === 2 && wormOpen(W), 'tangled in the canvas, a blow is worth double'); }

// ================= THE DESERT FOES (src/desert-foes.js) =================
log('THE DESERT FOES: every attack told, a quarter-second reaction answers it, ignoring it hurts');
{ const F = await import('../src/desert-foes.js');
  /* a fighter on flat ground at y 320. It walks in to fight (to 16 px) and, if `reacts`, answers each tell 0.25 s after it
     shows: '!' -> raise the shield until the blow is over; 'X' -> run away from the foe for 0.7 s. Counts blows that land. */
  function duel(make, step, reacts, secs = 30, open = null) {
    const floor = 320, e = make(); let px = e.x - 90, face = 1, t = 0, block = 0, flee = 0, fleeFrom, inv = 0, pending = [], hits = 0, blocked = 0, tells = {}, opens = 0, lastOpen = false;
    while (t < secs) {
      const out = step(e, { px, py: floor, pface: face, time: t }, 1 / 60);
      for (const o of out) { if (o.t === 'tell') { tells[o.what] = (tells[o.what] || 0) + 1; if (reacts) pending.push([t + 0.25, o.mark, o.x]); }
        if (o.t === 'hit' && inv <= 0 && px >= o.box[0] - 5 && px <= o.box[1] + 5 && floor - 14 <= o.box[3] && floor >= o.box[2]) { if (o.blockable && block > 0) blocked++; else hits++; inv = 0.6; } }   /* (0.6 s of grace after a blow, as the game gives) */
      pending = pending.filter(([at, mark, mx]) => { if (t < at) return true; if (mark === '!') block = 0.7; else { flee = 0.7; fleeFrom = mx; } return false; });   /* an X with a marked spot: leave the spot; without one, back off the foe */
      const ex = e.x; if (flee > 0) { const from = fleeFrom ?? ex; px += (Math.sign(px - from) || -1) * 92 / 60; flee -= 1 / 60; if (flee <= 0) fleeFrom = undefined; } else if (Math.abs(ex - px) > 16) { px += Math.sign(ex - px) * 92 / 60 * (block > 0 ? 0.35 : 1); face = Math.sign(ex - px) || face; }
      block = Math.max(0, block - 1 / 60); inv = Math.max(0, inv - 1 / 60);
      if (open) { const o = open(e); if (o && !lastOpen) opens++; lastOpen = o; }
      t += 1 / 60; }
    return { hits, blocked, tells, opens };
  }
  const cases = [
    ['scorpion', () => F.newScorpion(400, 320), F.scorpionStep, ['claw', 'sting'], null],
    ['vulture', () => F.newVulture(400, 320), F.vultureStep, ['dive'], F.vultureOpen],
    ['sand goblin', () => F.newSandGob(400, 320), F.sandGobStep, ['rise', 'knife'], null],
  ];
  for (const [name, mk, st, kinds, open] of cases) {
    const r = duel(mk, st, true, 30, open), p = duel(mk, st, false, 30, open);
    ok(kinds.every(k => r.tells[k] > 0) && r.hits === 0 && p.hits > 0, `${name}: told ${kinds.map(k => k + ' x' + (r.tells[k] || 0)).join(', ')}; a fighter who answers each tell in 0.25 s takes ${r.hits} (${r.blocked} blocked), one who ignores them takes ${p.hits}${open ? '; it landed open ' + r.opens + ' times' : ''}`);
  }
  ok(F.SCORPION.stingTell > F.SCORPION.clawTell && F.SANDGOB.knifeTell >= 0.4, `the sting (X, move) is told longer than the claw (!, block): ${F.SCORPION.stingTell} s against ${F.SCORPION.clawTell} s`);
  { const v = F.newVulture(400, 320); const xs = []; for (let i = 0; i < 240; i++) { F.vultureStep(v, { px: 900, py: 320, time: i / 60 }, 1 / 60); if (i % 60 === 0) xs.push(vultureShade(v, 320)[0] + 14); }
    ok(new Set(xs.map(Math.round)).size > 2, `a circling vulture's shade moves with it (${xs.map(x => Math.round(x)).join(' -> ')} px): shade that hunts you`); }
  { const g = F.newSandGob(400, 320); ok(!F.sandGobTouchable(g), 'a buried sand goblin cannot be hit (and is only a mound with eyes)');
    let px = 300; const w = () => ({ px, py: 320, pface: 1, time: 0 }); for (let i = 0; i < 1200 && g.mode !== 'under'; i++) { px = Math.min(px + 1.5, 420); F.sandGobStep(g, w(), 1 / 60); }
    for (let i = 0; i < 120 && g.mode !== 'buried'; i++) F.sandGobStep(g, w(), 1 / 60);
    ok(g.mode === 'buried' && g.x > px, `after two cuts it burrows and comes up AHEAD of you as a mound (at ${Math.round(g.x)}, you at ${Math.round(px)})`); }
}

console.log(fails ? `\ncaravan: ${fails} FAILED` : '\ncaravan: all passed');
process.exit(fails ? 1 : 0);
