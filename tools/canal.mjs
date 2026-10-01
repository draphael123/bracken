// tools/canal.mjs - THE FOG CANAL (claude/canal, the greybox). docs/briefs/fog-canal.md.
//   PURE (src/canal-rig.js, src/canal-foes.js, no page): a struck paddle fills its lock at its pace and the gate above opens only when the water is
//     level (and the one below shuts as it rises), a gate never shuts on the barge; the barge drifts only with a hero aboard or ahead, stops at a
//     shut gate, a swing bridge across and a THICK bank, goes on when a horn clears it; the weir gate bursts, she runs loose and her helm picks the
//     cut or the weir (the weir jars her); a foghorn clears its fog for a while, winds up before it sounds again, and the fog rolls back; only the
//     lit are seen in the fog; the grindylow ripples before it grabs, a jump beats the grab, three presses break it, a blow finds it only out of the
//     water (double, out of it); the wisp keeps ahead of you along its line, flares when you are close, and shies in cleared air.
//   THE LEVEL (src/fog-canal.js, wired in src/level.js, the map in src/main.js): between WAYMEET and THE HARVEST FAIR on the road and on the map, its
//     own track, its brief; NOT A WALK-RIGHT OPENER; every machine TAUGHT, DEVELOPED, TWISTED and EXAMINED where the level says, and each one the LOCK
//     somewhere (proved on the reach model or the rig); the exam COMBINES them in one space; the set piece has agency (the tiller); no sign spoils a
//     twist; every foe in a named encounter and every foe type bound to a mechanic; three checkpoints, three silvers, JENNY GREENTEETH's footprint
//     kept free with a checkpoint at her west door; her foreshadowing (eyes, a shoe, bubbles, the two weeds taught before her lock).
//   THE PAGE: the barge carries you, a low beam finds a rider standing and not one ducked, a paddle fills the lock and lifts her, a capstan swings a
//     bridge out of the grid, a horn lets her into the fog wall, an archer in the fog looses only at a lit hero, the grindylow grabs at the quay's
//     edge and three presses break it, bright weed holds and gives, dark weed holds nothing, the canal bites and hands you back, the weir gate
//     bursts and the chase runs.
// usage: node tools/canal.mjs [--no-page]
import { readFileSync, existsSync } from 'node:fs';
import * as R from '../src/canal-rig.js';
import * as F from '../src/canal-foes.js';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { pacing } from './pacing.mjs';
const NOPAGE = process.argv.includes('--no-page');
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const TS = 16, DT = 1 / 60;
const lv = LEVELS.find(l => l.id === 'canal');
ok(!!lv, 'there is no level with id "canal"');
const L = lv ? lv.build() : null, D = L && L.canal;

// ---------------- PURE ----------------
if (D) {
  const run = (st, n, f) => { for (let i = 0; i < n; i++) f(i); };
  { // THE LOCK: the paddle fills it at its pace; the upper gate opens when level; the lower one shuts as it rises
    const st = R.newCanal(D), L1 = R.reachById(st, 'L1'), G1 = st.gates.find(g => g.id === 'G1'), G2 = st.gates.find(g => g.id === 'G2');
    ok(G1.open && !G2.open, 'the first lock does not start with its lower gate open and its upper one shut');
    ok(R.strikeSluice(st, 'L1') === 'fill', 'a paddle struck on an empty lock does not fill it');
    run(st, 20, () => R.lockStep(st, DT)); ok(!G1.open && !G2.open, 'the lower gate did not shut as the chamber rose (or the upper opened early)');
    let n = 0; while (!G2.open && n++ < 1200) R.lockStep(st, DT);
    const secs = n * DT + 20 * DT, want = (L1.lo - L1.hi) * TS / R.RIG.fill;
    ok(G2.open && Math.abs(secs - want) < 0.2, 'the first lock did not fill in ' + want.toFixed(1) + ' s and open its upper gate (' + secs.toFixed(1) + ' s)');
    const st2 = R.newCanal(D); R.strikeSluice(st2, 'L1'); for (let i = 0; i < 400; i++) R.lockStep(st2, DT, g => g.id === 'G1');
    ok(R.reachById(st2, 'L1').y === R.surfaceY(40) && st2.gates.find(g => g.id === 'G1').open, 'a lock filled with a body in its open gate: the water must wait for it');
  }
  { // THE BARGE: drifts only with a hero aboard or ahead; stops at a shut gate, a bridge across, a thick bank; a horn lets her on
    const st = R.newCanal(D), b = st.barge, x0 = b.x;
    for (let i = 0; i < 120; i++) R.bargeStep(st, DT, false); ok(b.x === x0, 'the barge drifted with nobody aboard and nobody ahead');
    for (let i = 0; i < 4000; i++) R.bargeStep(st, DT, true); ok(b.holdWhy === 'gate' && Math.abs(b.x + b.w - 81 * TS) < 3, 'the barge did not stop at the first lock\'s shut upper gate (' + (b.x + b.w) / TS + ', ' + b.holdWhy + ')');
    R.strikeSluice(st, 'L1'); for (let i = 0; i < 600; i++) { R.lockStep(st, DT); R.bargeStep(st, DT, false); }
    ok(Math.abs(b.y - R.deckOf(R.surfaceY(33))) < 1, 'the lock filled and the barge in it did not rise with the water (' + b.y + ')');
    for (let i = 0; i < 4000; i++) R.bargeStep(st, DT, true); ok(b.holdWhy === 'bridge' && Math.abs(b.x + b.w - 112 * TS) < 3, 'the barge did not stop at the mill bridge standing across (' + (b.x + b.w) / TS + ', ' + b.holdWhy + ')');
    R.strikeBridge(st.bridges[0]); for (let i = 0; i < 120; i++) R.bridgeStep(st.bridges[0], DT);
    st.bridges[1].across = false; st.bridges[1].k = 1;
    for (let i = 0; i < 9000; i++) R.bargeStep(st, DT, true); ok(b.holdWhy === 'fog' && Math.abs(b.x + b.w - 165 * TS) < 3, 'the barge did not stop at the edge of the thick fog wall (' + (b.x + b.w) / TS + ', ' + b.holdWhy + ')');
    const h = { fogs: ['F2'], cd: 0 }; st.horns.push(h); ok(R.blowHorn(st, h) && !R.blowHorn(st, h), 'a foghorn did not sound, or sounded twice without winding up');
    for (let i = 0; i < 90; i++) { R.fogStep(st, DT); R.bargeStep(st, DT, true); } ok(b.x + b.w > 165 * TS + 8, 'the horn cleared the fog wall and the barge did not go into it');
    for (let i = 0; i < 60 * 16; i++) { R.fogStep(st, DT); R.bargeStep(st, DT, true); }
    ok(b.x > 181 * TS, 'one horn, blown the moment she was held, was not enough to carry her through the fog wall (' + (b.x / TS).toFixed(1) + ')');
    ok(st.fogs.find(f => f.id === 'F2').fade > 0.9, 'the fog did not roll back after the horn');
  }
  { // THE WEIR: her gate bursts, she runs loose, her helm picks the path; only the weir jars her
    for (const helm of ['cut', 'weir']) { const st = R.newCanal(D); for (const id of ['L1', 'L2', 'L3', 'L4']) { const r = R.reachById(st, id); r.y = r.to = R.surfaceY(r.hi); } R.gatesSettle(st);
      for (const b of st.bridges) { b.across = false; b.k = 1; } st.barge = R.newBarge(st, 238 * TS, helm);
      const ev = []; for (let i = 0; i < 60 * 40 && !ev.some(e => e.t === 'landed'); i++) ev.push(...R.bargeStep(st, DT, true));
      ok(ev.some(e => e.t === 'burst') && ev.some(e => e.t === 'junction' && e.helm === helm), 'the weir gate did not burst, or the barge did not take the ' + helm + ' at the junction');
      ok(ev.some(e => e.t === 'crash') === (helm === 'weir'), 'the broken weir ' + (helm === 'weir' ? 'did not jar' : 'jarred') + ' her on the ' + helm);
      ok(st.barge.mode === 'float' && st.barge.x > 325 * TS && Math.abs(st.barge.y - R.deckOf(R.surfaceY(44))) < 1, 'the ' + helm + ' did not bring her out into the basin'); }
    const b = { helm: 'weir' }; ok(R.strikeTiller(b) === 'cut' && R.strikeTiller(b) === 'weir', 'the tiller does not turn her helm');
  }
  { // THE FOG: only the lit are seen; a post lights, a doused one does not; the barge's lantern lights
    const st = R.newCanal(D); st.posts.push({ x: 150 * TS, y: 30 * TS, lit: true }); st.barge = R.newBarge(st, 100 * TS);
    ok(R.litAt(st, 20 * TS, 20 * TS), 'out of the fog is not lit');
    ok(!R.litAt(st, 140 * TS, 29 * TS) && R.litAt(st, 150 * TS, 29 * TS) && R.litAt(st, 101 * TS, 32 * TS), 'in the fog, the dark is lit (or a lantern is not)');
    R.strikePost(st.posts[0]); ok(!R.litAt(st, 150 * TS, 29 * TS), 'a doused post still lights');
  }
  { // THE GRINDYLOW (pure, against a mock world): a ring before the grab; a jump beats it; three presses break it; nothing finds it under the water
    const mk = (hero) => { const e = F.newGrindylow({ t: 'grindylow', x: 600, y: 630, hp: 20, anim: 0 }); const marks = [];
      const X = { hero: () => hero, barge: () => null, surfaceAt: x => x > 576 ? { y: 644, id: 'P0' } : null, solidAt: (x, y) => x <= 576 && y >= 624, press: () => hero.press || {},
        hurtHero: () => { hero.hit = (hero.hit || 0) + 1; }, mark: (e, t) => marks.push(t), sfx: {}, hint: () => {}, ring: () => {} }; return { e, X, marks }; };
    const hero = { x: 572, y: 624, face: 1, ground: true, onMover: null, dead: false };
    let { e, X, marks } = mk(hero); for (let i = 0; i < 120 && e.mode !== 'rippleTell'; i++) F.stepGrindylow(e, DT, X);
    ok(e.mode === 'rippleTell' && marks.includes('!!'), 'a grindylow did not ring the water (!!) under a hero standing at the edge');
    ok(F.grindylowTake({ mode: 'lurk' }) === 0 && F.grindylowTake({ mode: 'stun' }) === F.GRIND.weak, 'a blow finds a grindylow under the water, or does not double out of it');
    for (let i = 0; i < 60 && e.mode === 'rippleTell'; i++) F.stepGrindylow(e, DT, X); ok(e.mode === 'grab' && hero.hit === 1, 'the ring closed and the grindylow did not grab the ankle');
    for (let i = 0; i < 3; i++) { hero.press = { jump: true }; F.stepGrindylow(e, DT, X); hero.press = {}; F.stepGrindylow(e, DT, X); }
    ok(e.mode === 'stun', 'three presses did not break the grab');
    const h2 = { x: 572, y: 624, face: 1, ground: true, onMover: null, dead: false }; ({ e, X } = mk(h2)); for (let i = 0; i < 120 && e.mode !== 'rippleTell'; i++) F.stepGrindylow(e, DT, X);
    h2.ground = false; for (let i = 0; i < 60; i++) F.stepGrindylow(e, DT, X); ok(e.mode !== 'grab' && !h2.hit, 'a hero in the air as the ring closed was grabbed anyway: a jump must beat it');
    const h3 = { x: 300, y: 624, face: 1, ground: true, onMover: null, dead: false }; ({ e, X } = mk(h3)); for (let i = 0; i < 240; i++) F.stepGrindylow(e, DT, X); ok(e.mode === 'lurk', 'a grindylow rang the water for a hero nowhere near its edge');
  }
  { // THE WISP: it keeps ahead of you along its line, and flares when you come close; in cleared air it shies home
    const hero = { x: 100, y: 200, dead: false }; const w = F.newWisp({ t: 'willowisp', x: 180, y: 190, anim: 0, lure: [20, 12] }, TS); let hurt = 0, cleared = false; const marks = [];
    const X = { hero: () => hero, cleared: () => cleared, hurtHero: () => hurt++, mark: (e, t) => marks.push(t), sfx: {}, hint: () => {}, ring: () => {} };
    for (let i = 0; i < 120; i++) { hero.x += 0.8; w.anim += DT; F.stepWisp(w, DT, X); } ok(w.x > hero.x + 20, 'the wisp did not keep ahead of the hero along its line');
    hero.x = w.x - 10; hero.y = w.y + 10; for (let i = 0; i < 120; i++) { w.anim += DT; F.stepWisp(w, DT, X); } ok(marks.includes('!') && hurt >= 1, 'the wisp did not gutter (!) and flare at a hero beside it');
    cleared = true; for (let i = 0; i < 300; i++) { w.anim += DT; F.stepWisp(w, DT, X); } ok(w.mode === 'shy' && Math.hypot(w.x - w.hx, w.y - w.hy) < 8, 'in air a horn has cleared, the wisp did not shy back to where it started');
  }
}

// ---------------- THE LEVEL ----------------
if (lv && D) {
  const fair = LEVELS.find(l => l.id === 'theatre');
  ok(lv.needs === 'waymeet' && fair && fair.needs === 'canal', 'the road does not run WAYMEET -> the canal -> THE MASKWRIGHT THEATRE (canal needs ' + lv.needs + ', theatre needs ' + (fair && fair.needs) + ')');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), nodes = src.slice(src.indexOf('const INLAND_NODES'), src.indexOf('const INLAND_PATH'));
  const ids = [...nodes.matchAll(/id: '([a-z]+)', kind: 'level'/g)].map(m => m[1]);
  ok(ids.indexOf('canal') === ids.indexOf('waymeet') + 1 && ids.indexOf('theatre') === ids.indexOf('canal') + 1, 'the map does not run Waymeet, the canal, the theatre: ' + ids.join(','));
  ok(L.music === 'canal' && existsSync(new URL('../audio/canal.ogg', import.meta.url)), 'the canal does not play its own track (audio/canal.ogg)');
  ok(existsSync(new URL('../docs/briefs/fog-canal.md', import.meta.url)), 'the brief (docs/briefs/fog-canal.md) is not committed');
  const A = D.arcs, inn = ([a, b], x) => x >= a && x <= b, ents = t => L.ents.filter(e => e.t === t);
  // NOT A WALK-RIGHT OPENER: the first 32 columns of the walked route drop 8+ rows, and a pocket hangs off them
  const P = pacing(lv), first = P.route.filter(([x]) => x < 32), ys = first.map(p => p[1]);
  ok(Math.max(...ys) - Math.min(...ys) >= 8, 'the opener is a walk: the route over the first 32 columns spans ' + (Math.max(...ys) - Math.min(...ys)) + ' rows');
  ok(ents('silver').some(e => e.x < 32 && e.y < 22), 'the opener has no branch up off the way (the warehouse roof and its silver)');
  // EVERY MACHINE TAUGHT, DEVELOPED, TWISTED, EXAMINED where the level says
  const at = { barge: D.reaches.map(r => (r.x0 + r.x1) >> 1).concat(D.reaches.flatMap(r => [r.x0, r.x1])).concat([D.weir.head[0][0] / TS, 300]),
    lock: ents('locksluice').map(e => e.x).concat(D.gates.map(g => g.x)), fog: D.fogs.flatMap(f => [f.x0, f.x1]).concat(ents('foghorn').map(e => e.x), ents('lanternpost').map(e => e.x), ents('willowisp').map(e => e.x)),
    bridge: D.bridges.flatMap(b => [b.x0, b.x1]) };
  for (const m of R.MACHINES) for (const beat of ['teach', 'develop', 'twist', 'exam']) ok(A[m] && A[m][beat] && at[m].some(x => inn(A[m][beat], x)), 'the ' + m + ' is not ' + beat.toUpperCase() + ' in its columns ' + JSON.stringify(A[m] && A[m][beat]));
  // EACH MACHINE IS A LOCK SOMEWHERE (the reach model, or the rig where the model cannot see it)
  const R0 = floodReach(L, T, { rides: true }), gate = ents('gate')[0], reached = (RF, x, y) => [...RF.seen].some(k => { const [a, b] = k.split(',').map(Number); return Math.abs(a - x) <= 1 && Math.abs(b - y) <= 1; });
  ok(reached(R0, gate.x, gate.y), 'the level\'s gate is not reached at all');
  ok(!reached(floodReach({ ...L, rigBands: [] }, T, { rides: true }), gate.x, gate.y), 'THE BARGE is not required: the gate is reached with no barge');
  const flat = L.rigBands.filter(([x0, x1, y0, y1]) => y0 === y1);   /* the pounds and the race; the lock chambers' bands (a rise) left out */
  const cp1 = ents('check').sort((a, b) => a.x - b.x)[0];
  ok(!reached(floodReach({ ...L, rigBands: flat }, T, { rides: true }), cp1.x, cp1.y), 'THE LOCK is not required: the mill is reached with no lock rising');
  ok(D.fogs.some(f => f.thick && D.reaches.some(r => f.x0 > r.x0 && f.x1 < r.x1)) && ents('foghorn').length >= 2, 'THE FOG is not a lock: no thick bank across a reach with a horn to clear it');
  ok(D.bridges.filter(b => b.init !== 'open').length >= 3, 'THE SWING BRIDGE is not a lock: the bridges must stand across (holding the barge) where she has to pass');
  // THE EXAM COMBINES: in the basin, one space: thick fog, a horn and the bridge's capstan past the bridge, archers who see only the lit, weed (both kinds), a wisp, a grindylow, the elite
  const ex = A.bridge.exam, inEx = e => inn(ex, e.x), horn = ents('foghorn').find(inEx), capE = ents('swingcap').find(inEx), br = D.bridges.find(b => inn(ex, b.x0));
  ok(D.fogs.some(f => f.thick && inn(ex, f.x0)) && horn && capE && br && horn.x > br.x1 && capE.x > br.x1 && horn.fogs.some(id => D.fogs.find(f => f.id === id && f.thick && f.x1 >= br.x0)),
    'THE EXAM: the thick fog, its horn and the bridge\'s capstan are not one problem (the horn and the capstan past the bridge, the horn clearing the fog over it)');
  ok(ents('archer').filter(inEx).every(e => e.canal && e.canal.fogSight) && ents('archer').filter(inEx).length >= 2 && ents('willowisp').some(inEx) && ents('grindylow').some(inEx) && L.ents.some(e => e.elite && inEx(e))
    && (D.weeds || []).some(w => inn(ex, w[0]) && w[3] === 'bright') && (D.weeds || []).some(w => inn(ex, w[0]) && w[3] !== 'bright'), 'THE EXAM does not hold every foe and both weeds in its one space');
  // THE SET PIECE: a chase with agency (the tiller: her helm picks the cut or the weir), low beams to duck, a checkpoint before it
  const ch = (L.chases || [])[0]; ok(ch && ch.beams && ch.beams.length >= 3 && D.weir && D.weir.cut && D.weir.fall && D.weir.junction, 'THE WEIR is not a chase with low beams and a junction the tiller steers');
  ok(ents('check').some(e => ch && ch.trigger - (e.x * TS + 8) >= 0 && ch.trigger - (e.x * TS + 8) <= 240), 'no checkpoint in the 240 px before the weir chase');
  // SIGNS TEACH, NEVER SPOIL
  const spoil = ents('sign').filter(e => /WITHOUT YOU|ROOF|INTO THE CANAL|BEHIND YOU|OVER THE ROOF|TWICE|ISLAND|CUT IS SAFE|WEIR IS/.test(e.text)); ok(!spoil.length, 'a sign spoils a twist or an exam: ' + spoil.map(e => e.text).join(' | '));
  // FEWER, BETTER: every foe in a named encounter, and every foe type bound to the level's mechanics
  const FOES = new Set(['gaffer', 'archer', 'grindylow', 'willowisp']), foes = L.ents.filter(e => FOES.has(e.t));
  ok(L.ents.every(e => !(['mummer', 'hobbyhorse', 'drunk', 'swornsword', 'hedgeknight', 'crossbow'].includes(e.t))), 'a foe from outside the canal\'s cast stands in it (no mummers: they are the theatre\'s)');
  ok(foes.every(e => typeof e.squad === 'string'), 'a foe stands in no named encounter: ' + foes.filter(e => !e.squad).map(e => e.t + '@' + e.x).join(' '));
  ok(!L.ents.some(e => e.garrison), 'sprinkled garrison stands in the canal');
  ok(ents('gaffer').every(e => e.canal && e.canal.bargee) && ents('archer').every(e => e.canal && e.canal.fogSight), 'a bargee does not hook from the towpath, or an archer does not see only the lit');
  ok(ents('willowisp').every(e => D.fogs.some(f => e.x >= f.x0 && e.x <= f.x1)), 'a wisp stands outside the fog (it is a false lantern IN the fog)');
  ok(ents('grindylow').every(e => L.pools.some(p => p.canal && p.canal !== 'dock' && e.x * TS + 8 > p.x0 && e.x * TS + 8 < p.x1 && Math.abs(p.y - (e.y + 1) * TS) < 24)), 'a grindylow lurks away from the canal\'s water');
  // CHECKPOINTS, SILVERS, NO NPCS, JENNY GREENTEETH'S FOOTPRINT
  const ck = ents('check'); ok(ck.length === 3, 'the canal has ' + ck.length + ' checkpoints, not three');
  ok(ents('silver').length === 3, 'the canal does not carry the campaign\'s three silvers');
  ok(!L.ents.some(e => ['npc', 'stray', 'captive', 'folk'].includes(e.t)), 'an NPC or stray stands in the canal');
  const J = L.lockArena, g = (x, y) => L.grid[y * L.W + x];
  ok(J && J.sx === 376 && J.R === 41, 'JENNY\'S LOCK is not reserved at sx 376, R 41: ' + JSON.stringify(J));
  if (J) { let clear = true; for (let y = J.R - 16; y <= J.R - 1; y++) for (let x = J.sx; x <= J.sx + 39; x++) if (g(x, y) !== T.AIR) clear = false;
    ok(clear, 'her footprint (columns ' + J.sx + '-' + (J.sx + 39) + ', rows ' + (J.R - 16) + '-' + (J.R - 1) + ') is not kept clear');
    ok([...Array(40).keys()].every(k => g(J.sx + k, J.R + 2) === T.SOLID), 'the row under her bed (R+2) is not solid');
    ok(ck.some(e => e.x === J.sx - 1 && e.y === J.R - 1) && g(J.sx - 1, J.R) === T.SOLID, 'no checkpoint just outside her west door, at her bed level');
    ok(!L.ents.some(e => e.x >= J.sx && e.x <= J.sx + 39 && e.t !== 'gate'), 'something stands in her footprint'); }
  // JENNY, FORESHADOWED: her eyes in the fog, a child\'s shoe, bubbles by the bank; THE TWO WEEDS taught (safely) before her lock, with a sign
  ok(D.eyes.length >= 2 && D.shoes.length >= 1 && D.bubbles.length >= 3, 'Jenny Greenteeth is not foreshadowed (eyes, a shoe, bubbles)');
  const w0 = (D.weeds || []).filter(w => w[0] < 40); ok(w0.some(w => w[3] === 'bright') && w0.some(w => w[3] !== 'bright') && L.pools.some(p => p.shallow && p.x0 <= w0[0][0] * TS && p.x1 >= (w0[0][1] + 1) * TS)
    && ents('sign').some(e => e.x < 40 && /BRIGHT WEED/.test(e.text) && /DARK WEED/.test(e.text)), 'the two weeds are not taught, side by side and safely (over shallow water, with a sign), before her lock');
}

// ---------------- THE PAGE ----------------
if (!NOPAGE && lv) {
  const { openPage } = await import('./cdp.mjs'); const pg = await openPage({ audio: false, fonts: false });
  try {
    const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, out = {};
      BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); const fi = LEVELS.findIndex(l => l.id === 'canal');
      const fresh = (god = true) => { BK.load(fi); BK.state = 'play'; BK.god = god; BK.sim(4); };
      const C = () => BK.canal(), P = BK.P, k = BK.keys, sim = n => { for (let i = 0; i < n; i++) BK.sim(1); };
      const kill = f => BK.enemies().filter(f).forEach(e => e.alive = false);
      // 1. SHE CARRIES YOU; A LOW BEAM FINDS A RIDER STANDING, NOT ONE DUCKED
      fresh(false); kill(e => true); BK.tp(38, 37); sim(40); const x0 = P.x; out.board = !!(P.onMover && P.onMover.canal); sim(120); out.carried = P.x - x0;
      let hp0 = P.hp; for (let i = 0; i < 1500 && C().barge.x < 60 * TS; i++) { k.down = true; BK.sim(1); } k.down = false; out.ducked = hp0 - P.hp;
      fresh(false); kill(e => true); C().barge.x = 44 * TS; BK.tp(47, 37); sim(20); hp0 = P.hp; for (let i = 0; i < 1500 && C().barge.x < 60 * TS; i++) BK.sim(1); out.stood = hp0 - P.hp;
      // 2. A PADDLE FILLS THE LOCK AND LIFTS HER; THE GATE ABOVE OPENS
      fresh(); kill(e => true); C().barge.x = 74 * TS; BK.tp(79, 38); sim(20); P.face = 1; BK.press('atk'); sim(12);
      const g2 = () => BK.L.grid[34 * BK.L.W + 81]; out.lockPre = g2(); sim(700); out.lock = [Math.round(C().barge.y), Math.round(P.y), g2(), C().gates.find(g => g.id === 'G2').open];
      // 3. A CAPSTAN SWINGS THE MILL BRIDGE OUT OF THE GRID
      fresh(); kill(e => true); BK.tp(117, 29); sim(20); const deck = () => BK.L.grid[30 * BK.L.W + 114]; out.bridgePre = deck(); P.face = 1; BK.press('atk'); sim(90); out.bridge = [deck(), C().bridges[0].across];
      // 4. THE FOG WALL HOLDS HER UNTIL A HORN CLEARS IT
      fresh(); kill(e => true); for (const b of C().bridges.slice(0, 2)) { b.across = false; b.k = 1; } C().barge.x = 158 * TS; BK.tp(164, 29); sim(20); sim(300); out.fogHeld = [C().barge.holdWhy, Math.round((C().barge.x + 96) / TS)];
      C().horns[0].cd = 0; for (const f of C().fogs) if (f.id === 'F2') f.clear = 9; BK.tp(173, 29); sim(300); out.fogOn = Math.round((C().barge.x + 96) / TS);
      // 5. AN ARCHER IN THE FOG LOOSES ONLY AT A LIT HERO
      fresh(); const ar = BK.enemies().find(e => e.t === 'archer' && Math.abs(e.x - (155 * TS + 8)) < 20); kill(e => e !== ar); for (const p of C().posts) p.lit = false; C().barge.x = 90 * TS;
      BK.tp(150, 29); let dark = 0; for (let i = 0; i < 400; i++) { BK.sim(1); if (ar.draw > 0.3) dark++; } C().posts.push({ x: P.x, y: P.y, lit: true }); let lit = 0; ar.timer = 0; for (let i = 0; i < 400; i++) { BK.sim(1); if (ar.draw > 0.3) lit++; } out.archer = [dark, lit];
      // 6. THE GRINDYLOW AT THE QUAY'S EDGE: it grabs; three presses break it
      fresh(false); const gr = BK.enemies().find(e => e.t === 'grindylow' && e.x < 40 * TS); kill(e => e !== gr); C().barge.x = 50 * TS; BK.tp(35, 38); P.face = 1; let grabbed = false, freed = false;
      for (let i = 0; i < 400 && !freed; i++) { BK.sim(1); if (gr.mode === 'grab') grabbed = true; if (grabbed && gr.mode === 'grab' && i % 4 === 0) BK.press('jump'); if (grabbed && gr.mode !== 'grab') freed = true; } out.grind = [grabbed, freed, gr.mode];
      // 7. THE TWO WEEDS: bright holds a moment and gives; dark holds nothing
      fresh(); kill(e => true); BK.tp(21, 38); sim(30); out.bright0 = Math.round(P.y); sim(500); out.bright1 = Math.round(P.y); BK.tp(24, 38); sim(30); out.dark = Math.round(P.y);
      // 8. THE CANAL BITES AND HANDS YOU BACK
      fresh(false); kill(e => true); BK.tp(33, 38); sim(20); hp0 = P.hp; BK.tp(50, 44); sim(30); out.water = [hp0 - P.hp, Math.round(P.x / TS), Math.round(P.y / TS)];
      // 9. THE WEIR GATE BURSTS AND THE CHASE RUNS
      fresh(); kill(e => true); const cb = C(); for (const id of ['L1', 'L2', 'L3', 'L4']) { const q = cb.reaches.find(r => r.id === id); q.y = q.to = q.hi * TS + 4; } for (const b of cb.bridges) { b.across = false; b.k = 1; }
      cb.barge.x = 238 * TS; sim(30); BK.tp(241, 16); sim(20); for (let i = 0; i < 900 && cb.barge.mode !== 'loose'; i++) BK.sim(1); sim(200); out.weir = [cb.barge.mode, BK.L.grid[20 * BK.L.W + 248], (BK.chases ? BK.chases() : null)];
      return out; })()`, 900000);
    ok(r.board && r.carried > 16, 'the barge did not carry a hero standing on her (' + JSON.stringify([r.board, r.carried]) + ')');
    ok(r.ducked === 0 && r.stood > 0, 'the low bridge did not find a rider standing, or found one ducked (ducked ' + r.ducked + ', stood ' + r.stood + ')');
    ok(r.lockPre === 1 && r.lock[0] < 33 * TS && r.lock[1] < 33 * TS && r.lock[2] === 0 && r.lock[3], 'the paddle did not fill the lock, lift her and the hero, and open the upper gate: ' + JSON.stringify([r.lockPre, r.lock]));
    ok(r.bridgePre === 2 && r.bridge[0] === 0 && r.bridge[1] === false, 'the capstan did not swing the mill bridge out of the grid: ' + JSON.stringify([r.bridgePre, r.bridge]));
    ok(r.fogHeld[0] === 'fog' && r.fogHeld[1] === 165 && r.fogOn > 170, 'the fog wall did not hold her until the horn cleared it: ' + JSON.stringify([r.fogHeld, r.fogOn]));
    ok(r.archer[0] === 0 && r.archer[1] > 0, 'an archer in the fog loosed at a hero in the dark, or not at one in the light: ' + JSON.stringify(r.archer));
    ok(r.grind[0] && r.grind[1], 'the grindylow at the quay did not grab, or three presses did not break it: ' + JSON.stringify(r.grind));
    ok(r.bright0 === 39 * TS && r.bright1 > 39 * TS && r.dark > 39 * TS, 'the bright weed did not hold and then give, or the dark weed held: ' + JSON.stringify([r.bright0, r.bright1, r.dark]));
    ok(r.water[0] > 0 && r.water[2] <= 39, 'the canal did not bite and hand the hero back to the bank: ' + JSON.stringify(r.water));
    ok(r.weir[0] === 'loose' || r.weir[0] === 'float', 'the weir gate did not burst and let her run: ' + JSON.stringify(r.weir));
    ok(r.weir[1] === 0, 'the burst weir gate still stands in the grid');
    if (pg.errors.length) fails.push('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
if (fails.length) { console.log('canal: ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('ok  canal  the rig (locks, barge, bridges, fog and horns, the weir) and its two foes hold; the level sits between Waymeet and the fair with its own track, opens with a drop and a branch, teaches, develops, twists and examines all four machines and makes each one a lock, combines them in the exam, gives the weir run a helm, keeps three checkpoints and Jenny Greenteeth\'s footprint, and foreshadows her' + (NOPAGE ? ' (page skipped)' : '; and in the page the barge carries you, the low beam finds the standing, a paddle fills a lock, a capstan swings a bridge, a horn opens the fog wall, the archers see only the lit, the grindylow grabs and is shaken off, the weeds hold and give, the canal hands you back, the weir gate bursts'));
