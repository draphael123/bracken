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
const { WORM, newWorm, wormStep, wormTouchable, wormHurt } = await import('../src/dune-worm.js');
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
  const d = { x: 150, y: q.y + QS.stuck + 1, vx: 0, vy: 0, qsDepth: QS.stuck + 1 }; qsStep(d, q, DT, { move: 1 }); ok(d.vx === 0, 'below the wading depth, walking does nothing: the only way out is up'); }

// ================= THE DUNE WORM =================
log('THE DUNE WORM (logic and fight rules, not balance)');
const ARENA = { x0: 0, x1: 40 * 16, floorY: 20 * 16 };
ok((ARENA.x1 - ARENA.x0) / 16 <= 44, `A7: the arena is ${(ARENA.x1 - ARENA.x0) / 16} tiles`);
/* a scripted fighter. policy 'bait': wait in front of a live wreck, move off the breach late; 'open': fight in the open sand,
   as far from any wreck as it can get. Both: walk at RUN, swing (14 a blow, one per 0.35 s) at anything touchable in reach,
   get out of a lunge's landing and a swallow's pit, mash out of a pull. Counts what hits it. */
function fight(policy, seed = 1) {
  const wrecks = [{ x: 150, alive: true }, { x: 330, alive: true }, { x: 500, alive: true }];
  const W = newWorm(ARENA, 320); let px = policy === 'bait' ? 170 : 60, t = 0, swingT = 0, pulled = 0;
  const seen = {}, st = { opens: 0, smashes: 0, hitsTaken: 0, tells: new Set(), untouch: 0, maxUntouch: 0, windows: [], stormAt: null, decoyBulged: 0, realBulged: 0 };
  let lastTouch = wormTouchable(W), runLen = 0;
  const openSpot = () => { let best = ARENA.x0 + 30, bd = -1; for (let x = ARENA.x0 + 30; x <= ARENA.x1 - 30; x += 8) { const d = Math.min(...wrecks.filter(w => w.alive).map(w => Math.abs(w.x - x)), 999); if (d > bd) { bd = d; best = x; } } return best; };
  while (t < 240 && W.hp > 0) {
    // where it wants to be
    let tx = px; const real = W.ripples.find(r => r.real), committed = real && real.commit;
    if (W.mode === 'stuck' || (wormTouchable(W) && W.mode !== 'lunge')) tx = W.x - 14;                                   // go and hit it
    else if (committed) { const away = Math.abs(px - real.tx) > 1 ? Math.sign(px - real.tx) : (px < (ARENA.x0 + ARENA.x1) / 2 ? 1 : -1); tx = px + away * 60; }   // LATE: off the locked spot, toward open room
    else if (W.mode === 'rippleTell' || W.mode === 'under') { const alive = wrecks.filter(w => w.alive); tx = policy === 'bait' && alive.length ? alive.reduce((a, w) => Math.abs(w.x - px) < Math.abs(a.x - px) ? w : a).x + 12 : openSpot(); }
    if (W.mode === 'lungeTell' || W.mode === 'lunge') tx = px + (px >= W.lungeTo ? 1 : -1) * 70;                            // off the shadow
    if ((W.mode === 'swallowTell' || W.mode === 'swallow') && W.pit) tx = px + (px >= W.pit.x ? 1 : -1) * 80;               // out of the pit
    const step = Math.max(-92 * DT, Math.min(92 * DT, tx - px)); px = Math.max(ARENA.x0 + 8, Math.min(ARENA.x1 - 8, px + (pulled > 0 ? 0 : step)));
    const ev = wormStep(W, { px, py: ARENA.floorY, pGround: true, wrecks }, DT);
    for (const e of ev) {
      if (e.t === 'tell') st.tells.add(e.what);
      if (e.t === 'open') st.opens++;
      if (e.t === 'smash') st.smashes++;
      if (e.t === 'stormOn') st.stormAt = t;
      if (e.t === 'pull') { px += Math.sign(e.toX - px) * e.v * DT; pulled = 0.25; }   /* (it mashes out: pulled for a moment, then free) */
      if (e.t === 'hit' && e.box && px >= e.box[0] && px <= e.box[1] && ARENA.floorY - 1 >= e.box[2] && ARENA.floorY - 14 <= e.box[3]) { st.hitsTaken++; (st.hitBy ||= []).push(e.what + '@' + t.toFixed(1) + ' px ' + px.toFixed(0) + ' box ' + e.box.map(v => v.toFixed(0)).join('/') + ' mode ' + W.mode); }
    }
    if (W.mode === 'rippleTell') for (const r of W.ripples) if (r.commit) { if (r.real && r.bulge) st.realBulged++; if (!r.real && r.bulge) st.decoyBulged++; }
    pulled = Math.max(0, pulled - DT);
    swingT -= DT; if (swingT <= 0 && Math.abs(W.x - px) < 26 && wormTouchable(W)) { wormHurt(W, 14); swingT = 0.35; }
    // A5/A6: stretches of untouchable and touchable time
    const now = wormTouchable(W); if (now === lastTouch) runLen += DT; else { if (!lastTouch) st.maxUntouch = Math.max(st.maxUntouch, runLen); else st.windows.push(runLen); runLen = DT; lastTouch = now; }
    t += DT; }
  st.time = t; st.hp = W.hp; return st;
}
const bait = fight('bait'), open = fight('open');
ok(['ripple', 'spray', 'lunge', 'swallow'].every(k => bait.tells.has(k)), `A1/A3: four told attacks, and every one fired in the fight (${[...bait.tells].join(', ')})`);
ok(WORM.CHAIN[0] === 'ripple', 'the signature (the ripple and its breach) is first in the chain');
ok(Math.max(bait.maxUntouch, open.maxUntouch) <= 2.0, `A5: the longest stretch it cannot be hit is ${Math.max(bait.maxUntouch, open.maxUntouch).toFixed(2)} s (the rule: about two)`);
const minWin = Math.min(...bait.windows, ...open.windows);
ok(minWin >= 0.5, `A6: every untouchable stretch is followed by an open one, the shortest ${minWin.toFixed(2)} s`);
ok(bait.opens >= 3 && open.opens === 0, `THE OPENING IS CAUSED: baiting the breach into a wreck opened it ${bait.opens} times; fighting in open sand opened it ${open.opens} times`);
ok(bait.stormAt !== null && bait.smashes > 0 && bait.smashes <= 3, `phase 2: the storm comes in at ${bait.stormAt?.toFixed(0)} s, and ${bait.smashes} wreck(s) it stuck in were smashed - fewer places to make the opening`);
ok(bait.realBulged > 0 && bait.decoyBulged === 0, 'phase 2 decoys never bulge at the commit: only the real ripple rises (readable, late)');
ok(bait.hp === 0 && (open.hp > 0 || open.time > bait.time * 1.3), `the opening matters: the baiter kills it in ${bait.time.toFixed(0)} s, the open-sand fighter ${open.hp > 0 ? 'has not in ' + open.time.toFixed(0) + ' s (' + open.hp + ' hp left)' : 'takes ' + open.time.toFixed(0) + ' s'} (scripted bots: a shape, not a balance)`);
ok(bait.hitsTaken + open.hitsTaken === 0, `a bot that moves off each tell as it is shown takes ${bait.hitsTaken + open.hitsTaken} hits: every red attack has a clean answer in time`);
if (bait.hitBy || open.hitBy) console.log('    ', JSON.stringify({ bait: bait.hitBy, open: open.hitBy }));

console.log(fails ? `\ncaravan: ${fails} FAILED` : '\ncaravan: all passed');
process.exit(fails ? 1 : 0);
