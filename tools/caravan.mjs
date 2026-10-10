// tools/caravan.mjs — THE SUNKEN CARAVAN's mechanics, proved in Node before the level exists (none of it is wired in):
// SUNSTROKE (src/sunstroke.js), QUICKSAND (src/quicksand.js) and THE DUNE WORM's state machine (src/dune-worm.js).
// What this proves is LOGIC and the fight rules (A1 five told attacks, A3 every attack fires, A5 nothing untouchable past
// ~2 s, A6 an open window after each, the opening is CAUSED). It does NOT prove balance: the bots here are scripted and
// the numbers they post are not a pilot (memory: a balance harness must verify the real fight). The boss batch runs the
// real pilot, >= 21 runs at normal health, in the page.
// usage: node tools/caravan.mjs     exit 1 on any failure
import { install } from './node-canvas.mjs';
install();   // sunstroke.js reads SHADE_OF from the art module, which imports the art helpers
const { SUN, sunStep, walkCost, roofShade, shadeZones, inShade, sunStretches, vultureShade } = await import('../src/sunstroke.js'); const { readFileSync } = await import('node:fs');
const { QS, qsStep, qsPatchAt } = await import('../src/quicksand.js');
const { WORM, WORM_TELLS, WORM_MOVES, newWorm, wormStep, wormTouchable, wormHurt, wormTake, wormOpen, wormPlated } = await import('../src/dune-worm.js');
const { T } = await import('../src/level.js');

let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60;

// ================= SUNSTROKE =================
/* (claude/ksar2) THE SUN v2 (Daniel 10-08: "exposure DRAINS hp steadily - no stun, no flinch - stronger than today"): the same properties held at the same
   strictness - told before it harms, shade resets it at once, it never creeps over a run of allowed walks, it BUILDS the longer you stay, its stage is said
   before it climbs, a moment's shade starts it again - but the harm is a DRAIN (a share of max health a second) and not ticks of a blow. Changed by design
   (said in the lane report): a walk the level rule allows now costs a small toll (it used to cost nothing), and the rule's walk is shorter (4 s, was 5) */
log('SUNSTROKE');
{ const s = { v: 0 }; let t = 0, swimAt = null, hurtAt = null;
  while (t < 20 && hurtAt === null) { const r = sunStep(s, DT, false); t += DT; if (swimAt === null && r.swim > 0) swimAt = t; if (r.drain > 0) hurtAt = t; }
  ok(swimAt >= 0.9 && hurtAt >= 1.9 && hurtAt >= swimAt + 0.9, `open sun from cool: the hero heats from the first step, the view swims at ${swimAt.toFixed(1)} s, the drain starts at ${hurtAt.toFixed(1)} s - told ${(hurtAt - swimAt).toFixed(1)} s before the harm, and a dash shade to shade under ${hurtAt.toFixed(1)} s is free`);
  while (t < 20) { sunStep(s, DT, false); t += DT; }
  let c = 0; while (s.v > 0) { sunStep(s, DT, true); c += DT; }
  ok(c <= SUN.cool + 0.05, `shade cools it from full in ${c.toFixed(1)} s: a stop, not a rest`);
  { const q = { v: 1 }; ok(sunStep(q, DT, true).drain === 0, 'in the shade the drain stops at once, whatever the meter still says'); }
  const w = { v: 0 }; let hurt = 0, swim = 0; for (let k = 0; k < SUN.maxWalk / DT; k++) { const r = sunStep(w, DT, false); hurt += r.drain; swim = Math.max(swim, r.swim); }
  ok(hurt > 0 && hurt <= 0.06 && swim > 0 && Math.abs(hurt - walkCost(SUN.maxWalk)) < 0.002, `the longest walk the level rule allows (${SUN.maxWalk} s of sun) costs a small toll (${(hurt * 100).toFixed(1)}% of the bar, at most 6%) and swims the view (${(swim * 100).toFixed(0)}%): walking shade to shade is cheap, and it tells you`);
  // repeated: the longest walk, 1.5 s of shade, over and over - does it creep up?
  const r2 = { v: 0 }; let h2 = 0; for (let k = 0; k < 20; k++) { for (let i = 0; i < SUN.maxWalk / DT; i++) h2 += sunStep(r2, DT, false).drain; for (let i = 0; i < 1.5 / DT; i++) sunStep(r2, DT, true); }
  ok(Math.abs(h2 - 20 * hurt) < 0.01, `twenty stretches of ${SUN.maxWalk} s sun with only 1.5 s of shade between: ${(h2 * 100).toFixed(1)}% = twenty single tolls (it does not creep)`);
  ok(SUN.fill === 5 && SUN.cool === 1.2 && SUN.maxWalk <= 4, `the sun fills in ${SUN.fill} s (v1: 6), shade still cools it in ${SUN.cool} s, and the level rule is a walk of ${SUN.maxWalk} s (v1: 5)`);
  /* IT BUILDS: the drain grows the longer you stay, to its full rate */
  const b = { v: 0 }, rates = []; for (let tt = 0; tt < SUN.fill + 6; tt += DT) rates.push(sunStep(b, DT, false).rate);
  const at = sec => rates[Math.min(rates.length - 1, Math.round(sec / DT))];
  ok(at(2.5) > 0 && at(2.5) < at(4) && at(4) < at(SUN.fill + 1) && at(SUN.fill + 1) >= 0.04 && rates.every((r, i) => !i || r >= rates[i - 1] - 1e-9),
    `out in it the drain BUILDS: ${(at(2.5) * 100).toFixed(1)}%/s at 2.5 s, ${(at(4) * 100).toFixed(1)}% at 4 s, ${(at(SUN.fill + 1) * 100).toFixed(1)}% at full - never less the longer you stay`);
  ok(walkCost(10) >= 0.25 && walkCost(10) <= 0.4, `STRONGER THAN v1: ten seconds out from cool cost ${(walkCost(10) * 100).toFixed(0)}% of the bar (v1: 16 hp - under a tenth of a campaign-level hero)`);
  { const s3 = { v: 0 }, order = []; for (let k = 0; k < (SUN.fill + 2) / DT; k++) { const r = sunStep(s3, DT, false); if (r.stage !== (order[order.length - 1] ?? 0)) order.push(r.stage); if (r.drain > 0 && r.stage === 0) order.push('untold'); }
    ok(order.join() === '1,2,3', `the HUD's stage climbs ${order.join(' > ')} as the drain grows, and no drain is untold (C1)`); }
  { const s4 = { v: 0 }; for (let k = 0; k < (SUN.fill + 2) / DT; k++) sunStep(s4, DT, false); const before = sunStep(s4, DT, false).rate;
    for (let k = 0; k < 0.2 / DT; k++) sunStep(s4, DT, true);                                          /* a fifth of a second of shade (a vulture passing over) */
    const after = sunStep(s4, DT, false).rate;
    ok(after < before, `a moment's shade takes it off full: the drain after it is ${(after * 100).toFixed(1)}%/s, not ${(before * 100).toFixed(1)}%`); }
  /* NO BLOW: the drain comes straight off the bar (main.js sunDrain) - never through damagePlayer, so no flinch, no knock, no mercy window, no cancelled swing */
  { const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), fn = (src.match(/function sunDrain\([^)]*\) \{[^\n]*\}/) || [''])[0];
    ok(fn && !/damagePlayer|P\.hurt|P\.inv|vx|vy/.test(fn) && /die\(/.test(fn) && !/name: 'SUNSTROKE'/.test(src), 'the drain is no blow: main.js sunDrain takes health and names THE SUN if it kills - no damagePlayer, no hurt pose, no invulnerability, no knock'); } }
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
const ARENA = { x0: 0, x1: 40 * 16, floorY: 20 * 16, avoid: [[2 * 16, 9 * 16]] };
ok((ARENA.x1 - ARENA.x0) / 16 <= 44, `A7: the arena is ${(ARENA.x1 - ARENA.x0) / 16} tiles`);
/* THE RISING STONES (claude/caravan2, Daniel 10-09: "invulnerable except when he hits his head on a ledge"). A scripted fighter.
   policy 'bait': when the ripple comes, stand at the near end of a standing stone (under its edge) and move off the locked spot LATE;
   'open': the same fighter in a hollow where NO stone stands (it goes round him and cuts at everything up out of the sand); 'mash': it stands its ground and swings at
   anything up out of the sand. All three: walk at RUN, swing (14 a blow, one per 0.35 s) at anything touchable in reach, get out of a
   lunge's landing and a swallow's pit, mash out of a pull, jump the low blows, and take the breath behind him. Counts what hits it. */
const LG = WORM.LEDGE;
function fight(policy, seed = 7) {
  let s0 = seed; const rng = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
  const W = newWorm(ARENA, 320); let px = 170, t = 0, swingT = 0, pulled = 0;
  const st = { stuns: 0, frees: 0, wards: 0, hitsTaken: 0, tells: new Set(), maxHidden: 0, stormAt: null, decoyBulged: 0, realBulged: 0, dealt: 0, swings: 0, rises: 0, risesNear: 0, maxLive: [0, 0], liveOver: 0, wardBlocked: 0 };
  let hiddenRun = 0, air = 0;
  const far = ARENA.x1 - 60;
  while (t < 300 && W.hp > 0) {
    let tx = px; const real = W.ripples.find(r => r.real), committed = real && real.commit;
    const ups = W.ledges.filter(l => l.state === 'up');
    if (W.mode === 'stunned') tx = W.x - 14;                                                                   // his head is on the stone: in, and cut
    else if (committed) { const away = Math.abs(px - real.tx) > 1 ? Math.sign(px - real.tx) : (px < (ARENA.x0 + ARENA.x1) / 2 ? 1 : -1); tx = px + away * 40; if (policy === 'open' && W.ledges.some(l => tx > l.x0 - 20 && tx < l.x1 + 20)) tx = px - away * 40; }   // LATE: off the locked spot (the open fighter, away from a stone)
    else if (W.mode === 'rippleTell' || W.mode === 'under' || W.mode === 'dive') {
      if (policy === 'bait' && ups.length) { const l = ups.reduce((a, b) => Math.abs((a.x0 + a.x1) / 2 - px) < Math.abs((b.x0 + b.x1) / 2 - px) ? a : b); tx = px < (l.x0 + l.x1) / 2 ? l.x0 + 6 : l.x1 - 6; }   // under the stone's edge
      else if (policy === 'open') { let best = far, bd = -1; for (let x = ARENA.x0 + 40; x < ARENA.x1 - 40; x += 16) { const d = Math.min(...W.ledges.map(l => Math.max(l.x0 - x, x - l.x1)), 999); if (d > bd) { bd = d; best = x; } } tx = best; } }
    else if (policy !== 'mash' && wormTouchable(W) && W.mode !== 'lunge') tx = W.x - (W.face || 1) * 14;          // up out of the sand: round him (the breath goes the way he faces)
    if (W.mode === 'breathTell' || W.mode === 'breath') tx = W.x - (W.breathFace || 1) * 18;                    // the breath: behind him
    if (W.mode === 'lungeTell' || W.mode === 'lunge') tx = px + (px >= W.lungeTo ? 1 : -1) * 70;               // off the shadow
    if ((W.mode === 'swallowTell' || W.mode === 'swallow') && W.pit) tx = px + (px >= W.pit.x ? 1 : -1) * 80;   // out of the pit
    if (policy === 'open' && !committed && !/^(lunge|swallow)/.test(W.mode)) { const near = W.ledges.find(l => tx > l.x0 - 40 && tx < l.x1 + 40); if (near) tx = tx < (near.x0 + near.x1) / 2 ? near.x0 - 41 : near.x1 + 41; }   /* it keeps off the stones, whatever it is doing */
    if (policy === 'mash') tx = W.mode === 'lungeTell' || W.mode === 'lunge' || W.mode === 'swallowTell' || W.mode === 'swallow' || committed ? tx : px;
    const step = Math.max(-92 * DT, Math.min(92 * DT, tx - px)); px = Math.max(ARENA.x0 + 8, Math.min(ARENA.x1 - 8, px + (pulled > 0 ? 0 : step)));
    if (policy === 'open' && !committed && !/^(lunge|swallow)/.test(W.mode)) for (const l of W.ledges) if (px > l.x0 - 40 && px < l.x1 + 40) px = px < (l.x0 + l.x1) / 2 && l.x0 - 40 > ARENA.x0 + 8 ? l.x0 - 40 : l.x1 + 40;   /* (a scripted policy, not a body: it is never by a stone) */
    if (policy === 'open') { W.ledges = []; W.ledgeT = 99; }   /* THE OPEN SAND: a hollow where no stone stands - everything he does, and nothing opens him */
    const ev = wormStep(W, { px, py: ARENA.floorY, pGround: true, rng }, DT);
    for (const e of ev) {
      if (e.t === 'tell') st.tells.add(e.what);
      if (e.t === 'open') st.stuns++;
      if (e.t === 'free') st.frees++;
      if (e.t === 'ward') st.wards++;
      if (e.t === 'ledgeRise') { st.rises++; if (Math.abs((e.l.x0 + e.l.x1) / 2 - px) < LG.w / 2 + 8) st.risesNear++; }
      if (e.t === 'stormOn') st.stormAt = t;
      if (e.t === 'pull') { px += Math.sign(e.toX - px) * e.v * DT; pulled = 0.25; }   /* (it mashes out: pulled for a moment, then free) */
      const low = e.t === 'hit' && (e.what === 'sweep' || e.what === 'wave');   /* the tail (there and back) and THE CRASH's waves: low, along the floor */
      if (low && Math.abs((e.box[0] + e.box[1]) / 2 - px) < 40 && air <= 0) air = 0.5;   /* coming: a jump (0.5 s off the floor) */
      if (low && air > 0) continue;
      if (e.t === 'hit' && e.blockable) continue;   /* the breath: a ! - the fighter's shield takes it (the page's bot is held to it with real keys) */
      if (e.t === 'hit' && e.box && px >= e.box[0] && px <= e.box[1] && ARENA.floorY - 1 >= e.box[2] && ARENA.floorY - 14 <= e.box[3]) { st.hitsTaken++; (st.hitBy ||= []).push(e.what + '@' + t.toFixed(1) + ' px ' + px.toFixed(0) + ' box ' + e.box.map(v => v.toFixed(0)).join('/') + ' mode ' + W.mode); }
    }
    if (W.mode === 'rippleTell') for (const r of W.ripples) if (r.commit) { if (r.real && r.bulge) st.realBulged++; if (!r.real && r.bulge) st.decoyBulged++; }
    { const live = W.ledges.filter(l => l.state === 'rise' || l.state === 'up').length, ph = W.phase2 ? 1 : 0; st.maxLive[ph] = Math.max(st.maxLive[ph], live); if (live > (W.phase2 ? LG.keep2 : LG.keep)) st.liveOver++; }
    pulled = Math.max(0, pulled - DT); air = Math.max(0, air - DT);
    swingT -= DT; if (swingT <= 0 && Math.abs(W.x - px) < 26 && wormTouchable(W)) { st.dealt += wormHurt(W, 14); st.swings++; swingT = 0.35; }
    if (!wormTouchable(W)) { hiddenRun += DT; st.maxHidden = Math.max(st.maxHidden, hiddenRun); } else hiddenRun = 0;
    t += DT; }
  st.time = t; st.hp = W.hp; st.noLedgeMax = W.noLedgeMax; st.wardBlocked = W.wardBlocked; return st;
}
const bait = fight('bait'), open = fight('open'), mash = fight('mash');
ok(['ripple', 'breath', 'lunge', 'swallow', 'sweep'].every(k => bait.tells.has(k)), `A1/A3: five told attacks (THE SAND BREATH in the spit's place since claude/caravan2), and every one fired in the fight (${[...bait.tells].join(', ')})`);
ok(WORM.CHAIN[0] === 'ripple' && !WORM.CHAIN.includes('spit') && !WORM_MOVES.includes('spit'), 'the signature (the ripple and its breach) is first in the chain, and the spit is gone from it (the breath replaces it)');
ok(WORM_TELLS.every(m => m.endsWith('Tell')) && WORM_TELLS.length === 5 && WORM_TELLS.includes('breathTell'), 'A2: the five windups are modes that end in Tell (main.js windingUp() sounds them)');
{ const W0 = newWorm(ARENA, 320), timers = Object.entries(W0).filter(([k, v]) => /^(t|i|hp|hitMult|lungeFrom|lungeTo|stuns|ward|ledgeT|noLedgeT)$/.test(k));
  ok(timers.length === 10 && timers.every(([, v]) => typeof v === 'number' && Number.isFinite(v)), 'A3: every timer and count the machine reads is a number at spawn (' + timers.map(([k, v]) => k + '=' + v).join(' ') + ')'); }
ok(Math.max(bait.maxHidden, open.maxHidden) <= 2.0, `he fights all the time: the longest he is out of sight under the sand is ${Math.max(bait.maxHidden, open.maxHidden).toFixed(2)} s (about two)`);
ok(bait.stuns >= 3 && open.stuns === 0 && mash.stuns === 0, `THE OPENING IS CAUSED: baiting the breach under a standing stone stunned him ${bait.stuns} times; with no stone up ${open.stuns}; standing and swinging ${mash.stuns}`);
ok(bait.frees === bait.stuns || bait.frees === bait.stuns - 1, `every stun ends: he shakes free and dives (${bait.frees} of ${bait.stuns})`);
ok(bait.wards === bait.frees, `B3: every opening ends in a told ward (${bait.wards} wards for ${bait.frees} stuns)`);
ok(open.hp === WORM.hp && mash.hp === WORM.hp && open.swings > 20 && mash.swings > 20, `HIS HIDE (Daniel's B15 exception): ${open.swings} blows in the open sand and ${mash.swings} stood-and-mashed blows took NOTHING (${WORM.hp - open.hp} / ${WORM.hp - mash.hp})`);
ok(bait.hp === 0 && bait.time < 300, `the stones are the fight: the baiter kills him in ${bait.time.toFixed(0)} s (scripted bots: a shape, not a balance)`);
ok(bait.stormAt !== null, `phase 2: the storm is called at ${bait.stormAt?.toFixed(0)} s (the world brings the gusts in; the machine only says when)`);
ok(bait.realBulged > 0 && bait.decoyBulged === 0, 'phase 2 decoys never bulge at the commit: only the real ripple rises (readable, late)');
ok(bait.hitsTaken + open.hitsTaken === 0, `a bot that moves off each tell as it is shown takes ${bait.hitsTaken + open.hitsTaken} hits: every attack has a clean answer in time`);
if (bait.hitBy || open.hitBy) console.log('    ', JSON.stringify({ bait: bait.hitBy, open: open.hitBy }));
/* THE STONES: how many, where, how long, and never none for long */
ok(bait.maxLive[0] === LG.keep && bait.maxLive[1] === LG.keep2 && bait.liveOver === 0 && open.liveOver === 0, `THE STONES: ${bait.maxLive[0]} up at once in phase one, ${bait.maxLive[1]} in phase two (the arena changes, B5), never more`);
ok(bait.risesNear === 0 && mash.risesNear === 0 && bait.rises > 6, `a stone never rises under the hero (${bait.rises + mash.rises} rises, ${bait.risesNear + mash.risesNear} under her)`);
{ const worst = Math.max(bait.noLedgeMax, mash.noLedgeMax);
  ok(worst <= LG.gapCap && LG.rise >= 0.9, `never zero stones for long: the longest the hollow stood with none up was ${worst.toFixed(2)} s (cap ${LG.gapCap} s, the brief 6-8), and every stone is told rising for ${LG.rise} s first`); }
{ let s1 = 3; const rng = () => (s1 = (s1 * 16807) % 2147483647) / 2147483647; const W = newWorm(ARENA, 320); let inAvoid = 0, offEdge = 0, lives = [];
  for (let t = 0; t < 240; t += DT) for (const e of wormStep(W, { px: 100 + (t * 37) % 400, py: ARENA.floorY, pGround: false, rng }, DT)) if (e.t === 'ledgeRise') { const l = e.l; lives.push(l.life);
    if (ARENA.avoid.some(([a, b]) => l.x1 > a && l.x0 < b)) inAvoid++; if (l.x0 < ARENA.x0 + LG.edge || l.x1 > ARENA.x1 - LG.edge || (l.x0 - ARENA.x0) % 16) offEdge++; }
  ok(inAvoid === 0 && offEdge === 0 && new Set(lives.map(v => v.toFixed(1))).size > 3 && Math.min(...lives) >= LG.life[0] && Math.max(...lives) <= LG.life[1],
    `random fair spots: ${lives.length} stones over 240 s, none in the overhang or the gate's columns (${inAvoid}), all on whole tiles clear of the walls (${offEdge} off), standing ${Math.min(...lives).toFixed(1)}-${Math.max(...lives).toFixed(1)} s on the dice`); }
/* THE STUN, the ward, and the stone it cracks */
{ const W = newWorm(ARENA, 320); W.ledges = [{ id: 1, x0: 300, x1: 348, state: 'up', t: 20, life: 20 }]; W.ledgeId = 1; W.mode = 'under'; W.t = 0; W.i = 0;
  let open = null, onTop = 0, under = 0, free = false, wardEv = null, sunk = false;
  for (let t = 0; t < 8 && !free; t += DT) for (const e of wormStep(W, { px: 320, py: ARENA.floorY, pGround: true }, DT)) {
    if (e.t === 'hit' && e.what === 'breach') { if (ARENA.floorY - 48 - 1 >= e.box[2]) onTop++; if (ARENA.floorY - 1 >= e.box[2]) under++; }
    if (e.t === 'open') open = e; if (e.t === 'free') free = true; if (e.t === 'ward') wardEv = e; if (e.t === 'ledgeSink' && e.cracked) sunk = true; }
  const stunT = WORM.stunned, take = []; W.mode = 'stunned'; take.push(wormTake(W)); W.mode = 'surfaced'; take.push(wormTake(W)); W.mode = 'under'; take.push(wormTake(W));
  ok(open && open.ledge === 1 && onTop === 0 && under > 0 && free && wardEv && sunk && W.ward > 0 && stunT >= 2.5,
    `his breach under a standing stone: HE HITS HIS HEAD ON IT - stunned ${stunT} s (the gold read), the column stops under the stone (a hero standing ON it is never reached: ${onTop}; under it: ${under} frames), then he shakes free into a ${WORM.ward} s ward and the cracked stone sinks`);
  ok(take[0] === WORM.stunMult && WORM.stunMult >= 1.5 && take[1] === 0 && take[2] === 0, `a blow is worth x${take[0]} stunned (B15: openings pay 1.5-2x), x${take[1]} up out of the sand otherwise, x${take[2]} through it`);
  /* IN THE WARD a breach under a stone stuns nothing */
  W.ledges = [{ id: 2, x0: 300, x1: 348, state: 'up', t: 20, life: 20 }]; W.mode = 'under'; W.t = 0; W.i = 0; let stun2 = 0, warded = 0;
  for (let t = 0; t < 2.5; t += DT) for (const e of wormStep(W, { px: 320, py: ARENA.floorY, pGround: true }, DT)) { if (e.t === 'open') stun2++; if (e.t === 'warded') warded++; }
  ok(stun2 === 0 && warded === 1, `B3: in the ward his breach under a stone opens nothing (${stun2} stuns) and says so (${warded} 'warded')`); }
/* THE SAND BREATH: told '!', blockable, a cone in front of him along the floor - and nothing behind him */
{ const W = newWorm(ARENA, 320); W.mode = 'under'; W.t = 0; W.i = 1; W.order = WORM_MOVES.slice(); let tell = null, front = 0, behind = 0, block = true, maxW = 0;
  for (let t = 0; t < 4 && !(tell && W.mode === 'dive'); t += DT) for (const e of wormStep(W, { px: 380, py: ARENA.floorY, pGround: true }, DT)) { if (e.t === 'tell') tell = e;
    if (e.t === 'hit' && e.what === 'breath') { if (380 >= e.box[0] && 380 <= e.box[1]) front++; if (290 >= e.box[0] && 290 <= e.box[1]) behind++; if (!e.blockable || e.mark !== '!') block = false; maxW = Math.max(maxW, e.box[1] - e.box[0]); } }
  ok(tell && tell.what === 'breath' && tell.mark === '!' && WORM.breathTell >= 0.6 && front > 0 && behind === 0 && block && maxW >= 100,
    `THE SAND BREATH: told ! for ${WORM.breathTell} s, a cone ${maxW.toFixed(0)} px out of his mouth that reaches a hero in front (${front} frames) and never one behind him (${behind}); a shield takes it`); }
/* HIS KILL ATTACKS, SLOWER (Daniel: "comes out too fast"), and LESS DAMAGE across his moves (-25%) */
{ const old = { lungeTell: 0.6, swallowTell: 0.8 }, oldD = { breach: 41, lunge: 41, bite: 41, sweep: 46, wave: 37 };
  ok(WORM.lungeTell >= old.lungeTell * 1.5 - 1e-9 && WORM.swallowTell >= old.swallowTell * 1.5 - 1e-9, `his kill attacks are told longer: the lunge's coil ${WORM.lungeTell} s (was ${old.lungeTell}), the sinkhole ${WORM.swallowTell} s (was ${old.swallowTell}) - +50%`);
  ok(Object.entries(oldD).every(([k, v]) => Math.abs(WORM.dmg[k] - v * 0.75) <= 1) && WORM.dmg.breath <= 20, `-25% across his moves: ${Object.entries(oldD).map(([k, v]) => k + ' ' + v + '->' + WORM.dmg[k]).join(', ')}; the breath ${WORM.dmg.breath} (one blast, where the spit was a fan of 9s)`);
  const beats = ['rippleTrack', 'rippleCommit', 'surfaced', 'lunge', 'swallow', 'under', 'dive', 'breachT', 'sweepTell', 'sweep', 'sweepBack'], duneworm2 = { rippleTrack: 0.88, rippleCommit: 0.45, surfaced: 1.0, lunge: 0.8, swallow: 1.6, under: 0.35, dive: 0.44, breachT: 0.3, sweepTell: 0.65, sweep: 0.45, sweepBack: 0.38 };
  ok(beats.every(k => WORM[k] === duneworm2[k]), 'every other beat of his is claude/duneworm2\'s, unchanged (' + beats.map(k => k + ' ' + WORM[k]).join(', ') + ')'); }
{ let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;   /* WITH DICE: the four surfaced moves in a fresh order each round */
  const W = newWorm(ARENA, 320), orders = []; let last = null;
  for (let t = 0; t < 400; t += DT) { wormStep(W, { px: 100, py: ARENA.floorY, pGround: false, rng }, DT); if (W.order && W.order !== last) { orders.push(W.order.join(' ')); last = W.order; } }
  ok(orders.length > 5 && orders.every(o => o.split(' ').sort().join() === 'breath,lunge,swallow,sweep,sweep') && new Set(orders).size >= 3, 'with the world dice, every round is all four of the breath, lunge, swallow and the tail (twice) between the ripples, in ' + new Set(orders).size + ' different orders over ' + orders.length + ' rounds'); }
{ let seed = 11; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647; const W = newWorm(ARENA, 320); let idle = 0;
  for (let t = 0; t < 200; t += DT) { wormStep(W, { px: 200 + Math.sin(t) * 120, py: ARENA.floorY, pGround: true, rng }, DT); if (!wormTouchable(W) && !/Tell$/.test(W.mode) && W.mode !== 'under' && W.mode !== 'lunge') idle += DT; }
  ok(idle === 0, `no waiting room (B13): every moment he is out of sight is a tell he is running, a blow or the beat under the sand between them (${idle.toFixed(2)} s otherwise) - and the stones, the way to hurt him, are always rising`); }
{ const W = newWorm(ARENA, 320); W.mode = 'under'; W.t = 0; W.i = 7; W.order = WORM_MOVES.slice(); let tell = null, hit = 0, jumped = 0;
  const px = 250; for (let t = 0; t < 4 && !(tell && W.mode === 'dive'); t += DT) for (const e of wormStep(W, { px, py: ARENA.floorY, pGround: true }, DT)) { if (e.t === 'tell') tell = e; if (e.t === 'hit' && e.what === 'sweep' && px >= e.box[0] && px <= e.box[1]) hit++; if (e.t === 'hit' && e.what === 'sweep' && ARENA.floorY - 40 < e.box[2]) jumped++; }
  ok(tell && tell.what === 'sweep' && tell.mark === '!!' && Math.abs(tell.x - px) >= 60 && hit > 0 && jumped > 0, `THE TAIL: told !! ${tell ? Math.abs(tell.x - px).toFixed(0) : '?'} px past you, it crosses you along the floor (${hit} frames on you) and is low enough to jump (its box tops out ${WORM.sweepH} px up)`); }
{ const W = newWorm(ARENA, 320); W.mode = 'under'; W.t = 0; W.i = 7; W.order = WORM_MOVES.slice(); const px = 250; let pass = 0, on = false, modes = new Set();   /* THE TAIL GOES THERE AND BACK: two crossings */
  for (let t = 0; t < 5 && !(modes.has('sweepBack') && W.mode === 'dive'); t += DT) { let now = false; for (const e of wormStep(W, { px, py: ARENA.floorY, pGround: true }, DT)) if (e.t === 'hit' && e.what === 'sweep' && px >= e.box[0] && px <= e.box[1]) now = true; if (now && !on) pass++; on = now; modes.add(W.mode); }
  ok(pass === 2 && modes.has('sweepBack'), 'THE TAIL crosses you twice, out to his head and back (' + pass + ' crossings): jump it, and again'); }
{ const W = newWorm(ARENA, 320); W.mode = 'lunge'; W.t = WORM.lunge; W.lungeFrom = 100; W.lungeTo = 300; const near = 300 + 60; let waves = 0, hitNear = 0;   /* THE CRASH: where the lunge comes down */
  for (let t = 0; t < 2.5; t += DT) for (const e of wormStep(W, { px: 600, py: ARENA.floorY, pGround: true }, DT)) if (e.t === 'hit' && e.what === 'wave') { waves = Math.max(waves, W.waves.length); if (near >= e.box[0] && near <= e.box[1] && e.box[2] >= ARENA.floorY - 20) hitNear++; }
  ok(waves === 2 && hitNear > 0, 'THE CRASH: his lunge comes down and two low waves run out along the sand (' + waves + '), reaching a hero who only stepped off the shadow: jump them'); }
{ const W = newWorm(ARENA, 320); ok(wormTake(W) === 0 && wormHurt(W, 50) === 0, 'under the sand a blow does nothing (wormTake 0)'); W.mode = 'stunned'; W.hitMult = WORM.stunMult; ok(wormTake(W) === WORM.stunMult && wormOpen(W) && !wormPlated(W), 'stunned on the stone, a blow is worth x' + WORM.stunMult + ', and his hide turns nothing'); }

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
