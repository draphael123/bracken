// tools/canal.mjs - THE FOG CANAL (claude/canal, the greybox). docs/briefs/fog-canal.md.
//   PURE (src/canal-rig.js, src/canal-foes.js, no page): a struck paddle fills its lock at its pace and the gate above opens only when the water is
//     level (and the one below shuts as it rises), a gate never shuts on the barge; the barge drifts only with a hero aboard or ahead, stops at a
//     shut gate, a swing bridge across and a THICK bank, goes on when a horn clears it; in THE LEGGING TUNNEL (claude/canal4) she goes only legged,
//     quicker lit than blind, stops at the stop-planks until their windlass winds them up, and the deep lock lowers her to the basin; her lantern
//     dimmed lights nobody; a foghorn clears its fog for a while, winds up before it sounds again, and the fog rolls back; only the
//     lit are seen in the fog; the grindylow ripples before it grabs, a jump beats the grab, three presses break it, a blow finds it only out of the
//     water (double, out of it); the wisp keeps ahead of you along its line, flares when you are close, and shies in cleared air.
//   THE LEVEL (src/fog-canal.js, wired in src/level.js, the map in src/main.js): between WAYMEET and THE HARVEST FAIR on the road and on the map, its
//     own track, its brief; NOT A WALK-RIGHT OPENER; every machine TAUGHT, DEVELOPED, TWISTED and EXAMINED where the level says, and each one the LOCK
//     somewhere (proved on the reach model or the rig); the exam COMBINES them in one space; THE LEGGING TUNNEL teaches, tests, remixes and examines
//     legging and her lantern (no chase is left); no sign spoils a
//     twist; every foe in a named encounter and every foe type bound to a mechanic; three checkpoints, three silvers, THE LANTERN-EATER's raft chamber
//     kept free with a checkpoint at its west door (claude/lanterneater: Jenny Greenteeth's chamber before it); its foreshadowing (the lamps that are not lamps, the
//     bargemen's line at its door, a shoe, bubbles), the two weeds taught before the chamber.
//   THE PAGE: the barge carries you, a low beam finds a rider standing and not one ducked, a paddle fills the lock and lifts her, a capstan swings a
//     bridge out of the grid, a horn lets her into the fog wall, an archer in the fog looses only at a lit hero, the grindylow grabs at the quay's
//     edge and three presses break it, bright weed holds and gives, dark weed holds nothing, the canal bites and hands you back; in the tunnel she
//     waits for a rider who stands and goes for one who legs her, her lantern struck dims and lights, lit she draws a grindylow aboard and dimmed
//     she does not, the stop-planks hold her until a real swing at their windlass, a fall off the ledge is handed back onto her deck; (claude/canal5) the moon
//     shaft's grating holds, DOWN on her deck never takes a ladder, the deep lock's paddle never shuts her out, off her she glides to you (THE CALL), legging is smooth.
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
    /* (claude/canalfix, review fix 6) THE FOG WALL NEEDS BOTH ITS HORNS: the bank horn's own clear carries her in and the fog closes on her beside the pier; the pier's carries her out */
    const hornsF2 = L.ents.filter(e => e.t === 'foghorn' && e.fogs.includes('F2')).sort((a, c) => a.x - c.x).map(e => ({ fogs: e.fogs, clear: e.clear, cd: 0, x: e.x }));
    ok(hornsF2.length === 2, 'the fog wall does not have its two horns (the bank, the pier)');
    const h = hornsF2[0]; st.horns.push(h); ok(R.blowHorn(st, h) && !R.blowHorn(st, h), 'a foghorn did not sound, or sounded twice without winding up');
    for (let i = 0; i < 90; i++) { R.fogStep(st, DT); R.bargeStep(st, DT, true); } ok(b.x + b.w > 165 * TS + 8, 'the horn cleared the fog wall and the barge did not go into it');
    for (let i = 0; i < 60 * 16; i++) { R.fogStep(st, DT); R.bargeStep(st, DT, true); }
    const F2 = D.fogs.find(f => f.id === 'F2'), stall = (b.x + b.w) / TS;
    ok(stall < F2.x1 + 1 && b.holdWhy === 'fog', 'ONE horn carried her through the fog wall (the second is redundant): her bow at ' + stall.toFixed(1));
    const pier = hornsF2[1]; ok(pier && Math.abs(pier.x - stall) <= 5, 'the pier horn is not where the fog closes on her (' + (pier && pier.x) + ' against her bow at ' + stall.toFixed(1) + ')');
    ok(st.fogs.find(f => f.id === 'F2').fade > 0.9, 'the fog did not roll back after the horn');
    st.horns.push(pier); R.blowHorn(st, pier); for (let i = 0; i < 60 * 12; i++) { R.fogStep(st, DT); R.bargeStep(st, DT, true); }
    ok(b.x + b.w > (F2.x1 + 1) * TS, 'the second horn did not carry her out of the fog wall (' + ((b.x + b.w) / TS).toFixed(1) + ')');
  }
  { // (claude/canal4, Daniel 10-05) THE LEGGING TUNNEL: no current - legged she goes, quicker lit than blind; the stop-planks hold her until their windlass
    //   winds them up (once); the deep lock lowers her to the basin at its own pace (under 10 s) and she is legged out into the basin's fog
    const st = R.newCanal(D); st.D = D; for (const id of ['L1', 'L2', 'L3', 'L4']) { const r = R.reachById(st, id); r.y = r.to = R.surfaceY(r.hi); } R.gatesSettle(st); for (const q of st.bridges) { q.across = false; q.k = 1; }
    st.barge = R.newBarge(st, 252 * TS); const b = st.barge, x0 = b.x;
    for (let i = 0; i < 120; i++) R.bargeStep(st, DT, true); ok(R.inTunnel(st) && b.x === x0, 'in the tunnel she drifted with a hero aboard and nobody legging her');
    /* (claude/canal5, Daniel 10-06 "awkward") SHE GATHERS WAY AND LOSES IT: never a snap to full speed or a dead stop; the steady speeds are measured after a second's way */
    st.leg = R.RIG.leg; R.bargeStep(st, DT, true); const first = b.x - x0; for (let i = 0; i < 59; i++) R.bargeStep(st, DT, true); const xa = b.x; for (let i = 0; i < 60; i++) R.bargeStep(st, DT, true); const lit = b.x - xa;
    st.leg = R.RIG.legDark; for (let i = 0; i < 60; i++) R.bargeStep(st, DT, true); const x1 = b.x; for (let i = 0; i < 60; i++) R.bargeStep(st, DT, true); const dark = b.x - x1;
    st.leg = 0; const xg = b.x; for (let i = 0; i < 120; i++) R.bargeStep(st, DT, true); const glide = b.x - xg;
    ok(first > 0 && first < R.RIG.leg * DT * 0.6 && glide > 1 && glide < 20 && b.lv === 0, 'legging is not smooth: she must gather way (first frame ' + first.toFixed(2) + ' px) and glide on a little when nobody legs her, then stand (' + glide.toFixed(1) + ' px)');
    st.leg = -R.RIG.leg; for (let i = 0; i < 60 * 30; i++) R.bargeStep(st, DT, true); ok(Math.abs(b.x + b.w / 2 - D.tunnels[0][0] * TS) < 2 && R.inTunnel(st), 'legged WEST she does not stop with her middle at the tunnel mouth (' + ((b.x + b.w / 2) / TS).toFixed(2) + ')');
    st.leg = 0; for (let i = 0; i < 60; i++) R.bargeStep(st, DT, true);
    ok(Math.abs(lit - R.RIG.leg) < 1 && Math.abs(dark - R.RIG.legDark) < 1 && R.RIG.legDark < R.RIG.leg * 0.7, 'legged lit / dimmed she does not go at RIG.leg / RIG.legDark (blind is the slower): ' + lit.toFixed(1) + ' / ' + dark.toFixed(1));
    st.leg = R.RIG.leg; for (let i = 0; i < 9000; i++) R.bargeStep(st, DT, true); const S1 = (D.stops || [])[0];
    ok(S1 && b.holdWhy === 'stop' && Math.abs(b.x + b.w - S1.x * TS) < 3, 'the stop-planks did not hold her (' + ((b.x + b.w) / TS).toFixed(1) + ', ' + b.holdWhy + ')');
    const q = st.stops[0]; ok(q && R.strikeStop(q) && !R.strikeStop(q), 'the windlass does not wind the planks up once (and only once)'); let up = null; for (let i = 0; i < 120 && !up; i++) up = R.stopStep(q, DT);
    ok(up === 'up' && R.RIG.stopLift <= 1.5, 'the stop-planks did not wind up');
    for (let i = 0; i < 9000; i++) R.bargeStep(st, DT, true); const G8 = D.gates.find(g => g.id === 'G8'), L6 = R.reachById(st, 'L6');
    ok(G8 && L6 && b.holdWhy === 'gate' && Math.abs(b.x + b.w - G8.x * TS) < 3 && L6.hi === 18 && L6.lo === 44, 'she was not legged into the deep lock and held at its lower gate (' + ((b.x + b.w) / TS).toFixed(1) + ', ' + b.holdWhy + ')');
    ok(R.strikeSluice(st, 'L6') === 'drain', 'the deep lock\'s paddle does not drain it'); let n = 0; while (!st.gates.find(g => g.id === 'G8').open && n++ < 3000) { R.lockStep(st, DT); R.bargeStep(st, DT, false); }
    ok(n * DT < 10 && Math.abs(b.y - R.deckOf(R.surfaceY(44))) < 1, 'the deep lock did not lower her to the basin within 10 s (' + (n * DT).toFixed(1) + ' s)');
    for (let i = 0; i < 3000; i++) R.bargeStep(st, DT, true); ok(!R.inTunnel(st) && b.holdWhy === 'fog', 'legged out of the deep lock she did not come into the basin and stop at its thick fog: ' + ((b.x + b.w) / TS).toFixed(1) + ' ' + b.holdWhy);
    /* HER LANTERN: lit she lights her deck in the tunnel's dark; dimmed nobody; the tunnel is dark where no lantern is; out of the tunnel it always burns */
    const s2 = R.newCanal(D); s2.barge = R.newBarge(s2, 300 * TS); const bx = 300 * TS + 10, by = s2.barge.y - 24;
    ok(R.litAt(s2, bx, by) && !R.litAt(s2, 290 * TS, 14 * TS), 'in the tunnel her lit lantern does not light her deck, or the dark is lit');
    R.strikeLamp(s2); ok(!R.lampLit(s2) && !R.litAt(s2, bx, by), 'dimmed in the tunnel her lantern still lights her deck');
    s2.barge = R.newBarge(s2, 120 * TS); ok(R.lampLit(s2), 'out of the tunnel her lantern does not burn');
    const tb = { helm: 'weir' }; ok(R.strikeTiller(tb) === 'cut' && R.strikeTiller(tb) === 'weir', 'the tiller does not turn her helm');
  }
  { // THE FOG: only the lit are seen; a post lights, a doused one does not; the barge's lantern lights
    const st = R.newCanal(D); st.posts.push({ x: 150 * TS, y: 30 * TS, lit: true }); st.barge = R.newBarge(st, 100 * TS);
    ok(R.litAt(st, 5 * TS, 20 * TS), 'out of the fog is not lit');   /* (the street: the town's thin fog starts at the warehouse, claude/canalfix) */
    ok(!R.litAt(st, 140 * TS, 29 * TS) && R.litAt(st, 150 * TS, 29 * TS) && R.litAt(st, 101 * TS, 32 * TS), 'in the fog, the dark is lit (or a lantern is not)');
    R.strikePost(st.posts[0]); ok(!R.litAt(st, 150 * TS, 29 * TS), 'a doused post still lights');
  }
  { // (claude/canalfix, review fix 2) IT COMES ABOARD: a rider amidships on a HELD barge is not out of reach; and (UPGRADE A) a lock that drains strands one
    const hero = { x: 1000 + 48, y: 600, face: 1, ground: true, dead: false, onMover: { canal: true } }, barge = { x: 1000, w: 96, y: 600, mode: 'float', holdWhy: 'gate', v: 0 };
    const e = F.newGrindylow({ t: 'grindylow', x: 990, y: 610, hp: 20, anim: 0 }); let hit = 0;
    const X = { hero: () => hero, barge: () => barge, surfaceAt: () => ({ y: 606, id: 'P0' }), solidAt: () => false, press: () => ({}), hurtHero: () => hit++, mark: () => {}, sfx: {}, hint: () => {}, ring: () => {} };
    for (let i = 0; i < 600 && !hit; i++) F.stepGrindylow(e, DT, X);
    ok(e.aboard && hit === 1 && e.mode === 'grab', 'a grindylow did not come aboard a held barge and grab a rider standing amidships (' + JSON.stringify([e.aboard, e.mode, hit]) + ')');
    ok(F.grindylowTake({ aboard: true, mode: 'deck' }) === F.GRIND.weak, 'a grindylow on her deck is not weak (double)');
    const g2 = F.newGrindylow({ t: 'grindylow', x: 600, y: 440, hp: 20, anim: 0 }); let surf = 452; const X2 = { ...X, hero: () => ({ x: 0, y: 0, dead: false }), barge: () => null, surfaceAt: () => ({ y: surf, id: 'L2' }) };
    for (let i = 0; i < 60; i++) F.stepGrindylow(g2, DT, X2); for (let i = 0; i < 200 && g2.mode !== 'stranded'; i++) { surf = Math.min(532, surf + 34 * DT); F.stepGrindylow(g2, DT, X2); }
    ok(g2.mode === 'stranded', 'a lock draining at its own pace (34 px/s) did not strand the grindylow in it'); }
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
    /* (claude/canalfix3) THE EMBER WISP'S AI, COLD: it harasses (no blow lands before its told !), darts, falls away; popped it is an ember that re-forms ONCE */
    { const h = { x: 400, y: 300, dead: false }, q = F.newWisp({ t: 'willowisp', x: 440, y: 300, anim: 0, hp: 1, lure: [27, 18] }, TS); let hits = 0, toldFirst = null; const mk2 = [];
      const X2 = { hero: () => h, cleared: () => false, solid: () => false, hurtHero: () => { hits++; if (toldFirst === null) toldFirst = mk2.includes('!'); }, mark: (e, t) => mk2.push(t), sfx: {}, hint: () => {}, ring: () => {} };
      q.lured = true; for (let i = 0; i < 60 * 12; i++) { q.anim += DT; F.stepWisp(q, DT, X2); }
      ok(hits >= 3 && toldFirst === true, 'the wisp does not harass (darts that land, each told first): ' + hits + ' darts, told first ' + toldFirst);
      ok(F.wispTake(q, 5) === 0 && q.mode === 'spark', 'a popped wisp did not leave an ember to re-form');
      for (let i = 0; i < 60 * 3; i++) { q.anim += DT; F.stepWisp(q, DT, X2); } ok(q.reformed && q.mode !== 'spark' && F.wispTake(q, 5) === 5, 'the wisp did not re-form once (and only once)');
      const z = F.newWisp({ t: 'willowisp', x: 440, y: 300, anim: 0, hp: 1 }, TS); F.wispTake(z, 5); ok(F.wispTake(z, 1) >= 1, 'a blow on the ember does not put it out'); }
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
  const inTun = x => (D.tunnels || []).some(([a, c]) => x >= a && x <= c);
  const at = { barge: D.reaches.map(r => (r.x0 + r.x1) >> 1).concat(D.reaches.flatMap(r => [r.x0, r.x1])).concat([(D.tunnels || [[0]])[0][0], 300]),
    tunnel: (D.tunnels || []).flat().concat((D.stops || []).map(q => q.x), (D.beams || []).filter(b => b.tunnel).map(b => b.x0 / TS), ents('stopwinch').map(e => e.x), ents('grindylow').filter(e => inTun(e.x)).map(e => e.x), ents('locksluice').filter(e => e.reach === 'L6').map(e => e.x)),
    lock: ents('locksluice').map(e => e.x).concat(D.gates.map(g => g.x)), fog: D.fogs.flatMap(f => [f.x0, f.x1]).concat(ents('foghorn').map(e => e.x), ents('lanternpost').map(e => e.x), ents('willowisp').map(e => e.x)),
    bridge: D.bridges.flatMap(b => [b.x0, b.x1]) };
  for (const m of R.MACHINES) for (const beat of ['teach', 'develop', 'twist', 'exam']) ok(A[m] && A[m][beat] && at[m].some(x => inn(A[m][beat], x)), 'the ' + m + ' is not ' + beat.toUpperCase() + ' in its columns ' + JSON.stringify(A[m] && A[m][beat]));
  // EACH MACHINE IS A LOCK SOMEWHERE (the reach model, or the rig where the model cannot see it)
  const R0 = floodReach(L, T, { rides: true }), gate = ents('gate')[0], reached = (RF, x, y) => [...RF.seen].some(k => { const [a, b] = k.split(',').map(Number); return Math.abs(a - x) <= 1 && Math.abs(b - y) <= 1; });
  ok(reached(R0, gate.x, gate.y), 'the level\'s gate is not reached at all');
  ok(!reached(floodReach({ ...L, rigBands: [] }, T, { rides: true }), gate.x, gate.y), 'THE BARGE is not required: the gate is reached with no barge');
  const flat = L.rigBands.filter(([x0, x1, y0, y1]) => y0 === y1);   /* the pounds and the race; the lock chambers' bands (a rise) left out */
  ok(!reached(floodReach({ ...L, rigBands: flat }, T, { rides: true }), 99, 17), 'THE LOCK is not required: the mill is reached with no lock rising');
  /* (claude/canalfix, UPGRADE A) A LOCK SET AGAINST HER: the flight's first chamber starts FULL, with a paddle on its lower gate's face to drain it and a grindylow up in it */
  { const L2 = D.reaches.find(r => r.id === 'L2'), G3 = D.gates.find(g => g.id === 'G3');
    ok(L2 && L2.init === 'hi' && ents('locksluice').some(e => e.reach === 'L2' && e.x === G3.x - 1) && ents('grindylow').some(e => e.x >= L2.x0 && e.x <= L2.x1 && e.y === L2.hi - 1), 'the flight first chamber is not set against her (full, a drain paddle at her bow, a grindylow up in it to strand)'); }
  ok(D.fogs.some(f => f.thick && D.reaches.some(r => f.x0 > r.x0 && f.x1 < r.x1)) && ents('foghorn').length >= 2, 'THE FOG is not a lock: no thick bank across a reach with a horn to clear it');
  ok(D.bridges.filter(b => b.init !== 'open').length >= 3, 'THE SWING BRIDGE is not a lock: the bridges must stand across (holding the barge) where she has to pass');
  // THE EXAM COMBINES: in the basin, one space: thick fog, a horn and the bridge's capstan past the bridge, archers who see only the lit, weed (both kinds), a wisp, a grindylow, the elite
  const ex = A.bridge.exam, inEx = e => inn(ex, e.x), horn = ents('foghorn').find(inEx), capE = ents('swingcap').find(inEx), br = D.bridges.find(b => inn(ex, b.x0));
  ok(D.fogs.some(f => f.thick && inn(ex, f.x0)) && horn && capE && br && horn.x < br.x0 && capE.x > br.x1 && horn.clear >= 6 && horn.clear <= 7 && horn.fogs.some(id => D.fogs.find(f => f.id === id && f.thick && f.x1 >= br.x0)),
    'THE EXAM is not two stops (claude/canalfix, review fix 4): its horn on the west bank with its own 6-7 s, the capstan on the island past the bridge, the horn clearing the fog over it');
  /* (claude/canalfix, review fix 5) THE GARRISON BRIDGE's capstan is on its FAR bank, past its archers; a lantern lights the way on to it, and a lamplighter keeps it lit */
  { const B2 = D.bridges[1], capG = ents('swingcap').find(e => e.bridge === 1), postG = ents('lanternpost').find(e => e.x >= B2.x0 - 4 && e.x <= B2.x0);
    ok(capG && capG.x > B2.x1 && ents('archer').filter(e => e.x >= B2.x0 && e.x <= B2.x1).length === 2 && postG && L.ents.some(e => e.t === 'snuffer' && e.canal && e.canal.lamplighter && Math.abs(e.x - B2.x0) < 8),
      'the bridge garrison resolves itself: its capstan must be on the far bank past both archers, with a lantern on the way and a lamplighter to relight it'); }
  ok(L.ents.filter(e => e.t === 'snuffer' && e.canal && e.canal.lamplighter).length >= 2 && L.ents.filter(e => e.t === 'snuffer').every(e => e.canal && e.canal.lamplighter && D.fogs.some(f => !f.thick && e.x >= f.x0 && e.x <= f.x1)), 'the kill-first LAMPLIGHTERS (the snuffer reskinned) are not in the fog bank and the basin');
  ok(L.ents.filter(e => e.canal && e.canal.boarder).length >= 3 && D.gangAt && D.fogs.some(f => f.thick && f.x0 === D.gangAt), 'the boarding gang (UPGRADE C) does not wait at the fog wall');
  ok((D.sides || []).length && (D.beams || []).some(b => b.side === 'off') && ents('sign').some(e => /TILLER/.test(e.text) && e.x < 70), 'the tiller is not taught on the Waymeet pound (UPGRADE B: her side of the pound)');
  ok(D.arch && D.arch[0] === 130, 'THE LONG ARCH is not told to the hands (L.canal.arch)');
  ok(ents('archer').filter(inEx).every(e => e.canal && e.canal.fogSight) && ents('archer').filter(inEx).length >= 2 && ents('willowisp').some(inEx) && ents('grindylow').some(inEx) && L.ents.some(e => e.elite && inEx(e))
    && (D.weeds || []).some(w => inn(ex, w[0]) && w[3] === 'bright') && (D.weeds || []).some(w => inn(ex, w[0]) && w[3] !== 'bright'), 'THE EXAM does not hold every foe and both weeds in its one space');
  // THE SET PIECE (claude/canal4, Daniel 10-05: the weir is gone): THE LEGGING TUNNEL - teach (the portal's signs name the verb and her lantern; low beams; one
  //   grindylow), test (the stop-planks, their windlass up on a ledge past them, a lantern, a bowman and a bargee), remix (the nest: low beams over the brood, the
  //   moon shaft lighting her, a wisp), exam (the deep lock: its paddle back on the ledge, a lamplighter and a bowman, the brood on its steps); a checkpoint before it
  { const At = A.tunnel, inB = (k, x) => !!At && x >= At[k][0] && x <= At[k][1], tg = ents('grindylow').filter(e => inTun(e.x)), tb = (D.beams || []).filter(b => b.tunnel), signs = ents('sign');
    ok(At && signs.some(e => e.x >= At.teach[0] - 6 && e.x <= At.teach[0] && /LEG HER/.test(e.text) && /HOLD LEFT OR RIGHT/.test(e.text)) && signs.some(e => e.x >= At.teach[0] - 6 && e.x <= At.teach[0] && /LANTERN/.test(e.text) && /STRIKE/.test(e.text)), 'the tunnel is not taught at its portal (a sign naming the verb - HOLD LEFT OR RIGHT, LEG HER (claude/canal5: DOWN was dropped, Daniel 10-06) - and one her lantern, STRIKE it)');
    ok(tb.some(b => inB('teach', b.x0 / TS)) && tg.some(e => inB('teach', e.x)), 'the tunnel\'s teach has no low beam or no grindylow');
    ok((D.stops || []).some(q => inB('develop', q.x)) && ents('stopwinch').some(e => inB('develop', e.x) && e.x > D.stops[0].x && e.y < D.stops[0].top) && ents('lanternpost').some(e => inB('develop', e.x)) && ents('archer').some(e => inB('develop', e.x)) && ents('gaffer').some(e => inB('develop', e.x)) && signs.some(e => inB('develop', e.x) && /WINDLASS/.test(e.text)), 'the tunnel\'s test is not the stop-planks with their windlass past them up on a ledge (signed), a lantern, a bowman and a bargee');
    ok(tb.filter(b => inB('twist', b.x0 / TS)).length >= 3 && tg.filter(e => inB('twist', e.x)).length >= 3 && (D.moon || []).some(([a]) => inB('twist', a)) && ents('willowisp').some(e => inB('twist', e.x)), 'the tunnel\'s remix is not the nest (low beams over the brood, the moon shaft, a wisp)');
    const L6 = D.reaches.find(r => r.id === 'L6'); ok(L6 && L6.lo - L6.hi >= 20 && ents('locksluice').some(e => e.reach === 'L6' && e.x < L6.x0 && inB('exam', e.x)) && L.ents.some(e => e.t === 'snuffer' && inB('exam', e.x)) && ents('archer').some(e => inB('exam', e.x)) && tg.some(e => e.x >= L6.x0 && e.x <= L6.x1), 'the tunnel\'s exam is not the deep lock (its paddle back on the ledge, a lamplighter, a bowman, the brood on its steps)');
    ok(!(L.chases || []).length && !D.weir, 'the weir chase is still in the level (Daniel 10-05: removed)');
    ok(ents('check').some(e => { const d = (D.tunnels || [[9999]])[0][0] * TS - (e.x * TS + 8); return d >= 0 && d <= 240; }), 'no checkpoint in the 240 px before the legging tunnel'); }
  // SIGNS TEACH, NEVER SPOIL
  const spoil = ents('sign').filter(e => /WITHOUT YOU|ROOF|INTO THE CANAL|BEHIND YOU|OVER THE ROOF|TWICE|ISLAND|CUT IS SAFE|WEIR IS|SPLITS|THE MILL CUT OR|NO POST IS A WISP/.test(e.text)); ok(!spoil.length, 'a sign spoils a twist or an exam: ' + spoil.map(e => e.text).join(' | '));
  // FEWER, BETTER: every foe in a named encounter, and every foe type bound to the level's mechanics
  const FOES = new Set(['gaffer', 'archer', 'grindylow', 'willowisp', 'snuffer']), foes = L.ents.filter(e => FOES.has(e.t));
  ok(foes.every(e => e.x < L.lockArena.sx), 'a foe stands past the end gate, where nobody can reach it: ' + foes.filter(e => e.x >= L.lockArena.sx).map(e => e.t + '@' + e.x).join(' '));
  ok(L.ents.every(e => !(['mummer', 'hobbyhorse', 'drunk', 'swornsword', 'hedgeknight', 'crossbow'].includes(e.t))), 'a foe from outside the canal\'s cast stands in it (no mummers: they are the theatre\'s)');
  ok(foes.every(e => typeof e.squad === 'string'), 'a foe stands in no named encounter: ' + foes.filter(e => !e.squad).map(e => e.t + '@' + e.x).join(' '));
  ok(!L.ents.some(e => e.garrison), 'sprinkled garrison stands in the canal');
  ok(ents('gaffer').every(e => e.canal && e.canal.bargee) && ents('archer').every(e => e.canal && e.canal.fogSight), 'a bargee does not hook from the towpath, or an archer does not see only the lit');
  ok(ents('willowisp').every(e => D.fogs.some(f => e.x >= f.x0 && e.x <= f.x1)), 'a wisp stands outside the fog (it is a false lantern IN the fog)');
  ok(ents('grindylow').every(e => L.pools.some(p => p.canal && p.canal !== 'dock' && e.x * TS + 8 > p.x0 && e.x * TS + 8 < p.x1 && Math.abs(p.y - (e.y + 1) * TS) < 24)), 'a grindylow lurks away from the canal\'s water');
  // CHECKPOINTS, SILVERS, NO NPCS, THE LANTERN-EATER'S FOOTPRINT (claude/canal4's raft chamber, Jenny Greenteeth's before - claude/lanterneater)
  const ck = ents('check'); ok(ck.length === 3, 'the canal has ' + ck.length + ' checkpoints, not three');
  ok(ents('silver').length === 3, 'the canal does not carry the campaign\'s three silvers');
  ok(!L.ents.some(e => ['npc', 'stray', 'captive', 'folk'].includes(e.t)), 'an NPC or stray stands in the canal');
  const J = L.lockArena, g = (x, y) => L.grid[y * L.W + x];
  ok(J && J.sx === 396 && J.R === 41, 'THE LANTERN POOL is not at sx 396, R 41 (claude/canal4: twenty on, the tunnel is longer than the weir was): ' + JSON.stringify(J));
  // HER LOCK IS WIRED (claude/greenwire): her arena is the level's, the doors stand open at bed level, the row under her bed is solid, a checkpoint just outside the west door, the gate on the quay past the east door
  ok(L.arena && L.arena.boss === 'lanterneater' && L.arena.music === 'lanterneater' && L.arena.lock && L.arena.lock.sx === J.sx && L.arena.lock.R === J.R && L.gateAfterBoss, 'the canal is not wired to THE LANTERN-EATER (arena, music, gateAfterBoss)');
  ok(ents('lanterneater').length === 1 && ents('lanterneater')[0].x === J.sx + 20 && !ents('greenteeth').length, 'it is not in its chamber once (or Jenny still is)');
  ok([...Array(38).keys()].every(k => g(J.sx + 1 + k, J.R + 5) === T.SOLID && g(J.sx + 1 + k, J.R + 6) === T.SOLID) && [1, 2, 3, 36, 37, 38].every(k => g(J.sx + k, J.R) === T.SOLID), 'the bed under her water, or her landings, are not solid (claude/canal4: the raft duel - stone landings at the deck\'s height, her water five rows deep)');
  ok([J.R - 6, J.R - 3, J.R - 1].every(y => g(J.sx, y) === T.AIR && g(J.sx + 39, y) === T.AIR), 'her doors (rows ' + (J.R - 6) + '-' + (J.R - 1) + ') are not open at both gates');
  ok(ck.some(e => e.x === J.sx - 1 && e.y === J.R - 1) && g(J.sx - 1, J.R) === T.SOLID, 'no checkpoint just outside her west door, at her bed level');
  ok(!L.ents.some(e => e.x >= J.sx && e.x <= J.sx + 39 && e.t !== 'lanterneater'), 'something but it stands in its footprint');
  const gt = ents('gate'); ok(gt.length === 1 && gt[0].x > J.sx + 39 && g(gt[0].x, gt[0].y + 1) === T.SOLID, 'the end gate does not stand on the quay past her east door: ' + JSON.stringify(gt));
  ok(L.pools.some(p => p.lock && p.leWater) && (L.moversExtra || []).filter(m => m.leRaft).length === 1, 'its water and the raft are not in the level (claude/canal4\'s stage)');
  // THE LANTERN-EATER, FORESHADOWED (B8): the lamps that are not lamps glimpsed in the fog, the bargemen's line at its door, a child\'s shoe, bubbles by the bank; THE TWO WEEDS taught (safely) before its chamber, with a sign
  ok(D.lures.length >= 3 && D.shoes.length >= 1 && D.bubbles.length >= 3 && ents('sign').some(e => e.x >= 380 && e.x < J.sx && /FLICKERS/.test(e.text) && /SWAYS/.test(e.text)), 'the Lantern-Eater is not foreshadowed (the lamps that are not lamps, the bargemen\'s line, a shoe, bubbles)');
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
      fresh(false); kill(e => true); C().barge.helm = 'cut'; BK.tp(38, 37); sim(40); const x0 = P.x; out.board = !!(P.onMover && P.onMover.canal); sim(120); out.carried = P.x - x0;   /* (the offside: the low bridge's timbers hang there, claude/canalfix) */
      let hp0 = P.hp; for (let i = 0; i < 1500 && C().barge.x < 60 * TS; i++) { k.down = true; BK.sim(1); } k.down = false; out.ducked = hp0 - P.hp;
      fresh(false); kill(e => true); C().barge.helm = 'cut'; C().barge.x = 44 * TS; BK.tp(47, 37); sim(20); hp0 = P.hp; for (let i = 0; i < 1500 && C().barge.x < 60 * TS; i++) BK.sim(1); out.stood = hp0 - P.hp;
      fresh(false); kill(e => true); C().barge.helm = 'weir'; C().barge.x = 44 * TS; BK.tp(47, 37); sim(20); hp0 = P.hp; for (let i = 0; i < 1500 && C().barge.x < 60 * TS; i++) BK.sim(1); out.towpathSide = hp0 - P.hp;   /* the towpath side: clear of the timbers */
      // 2. A PADDLE FILLS THE LOCK AND LIFTS HER; THE GATE ABOVE OPENS
      fresh(); kill(e => true); C().barge.x = 74 * TS; BK.tp(79, 38); sim(20); P.face = 1; BK.press('atk'); sim(12);
      const g2 = () => BK.L.grid[34 * BK.L.W + 81]; out.lockPre = g2(); sim(700); out.lock = [Math.round(C().barge.y), Math.round(P.y), g2(), C().gates.find(g => g.id === 'G2').open];
      // 3. A CAPSTAN SWINGS THE MILL BRIDGE OUT OF THE GRID
      fresh(); kill(e => true); BK.tp(117, 29); sim(20); const deck = () => BK.L.grid[30 * BK.L.W + 114]; out.bridgePre = deck(); P.face = 1; BK.press('atk'); sim(90); out.bridge = [deck(), C().bridges[0].across];
      // 4. THE FOG WALL HOLDS HER UNTIL A HORN CLEARS IT
      fresh(); kill(e => true); for (const b of C().bridges.slice(0, 2)) { b.across = false; b.k = 1; } C().barge.x = 158 * TS; BK.tp(164, 29); sim(20); sim(300); out.fogHeld = [C().barge.holdWhy, Math.round((C().barge.x + 96) / TS)];
      C().horns[0].cd = 0; for (const f of C().fogs) if (f.id === 'F2') f.clear = 9; BK.tp(183, 29); sim(300); out.fogOn = Math.round((C().barge.x + 96) / TS);
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
      // 9. (claude/canal4) THE LEGGING TUNNEL: a rider who stands, she waits; one who lies on her deck legs her; her lantern struck dims (blind: slower) and lights;
      //    the stop-planks hold her until a real swing at their windlass on the ledge
      const tun = () => { fresh(); kill(e => true); const cb = C(); for (const id of ['L1', 'L2', 'L3', 'L4']) { const q = cb.reaches.find(r => r.id === id); q.y = q.to = q.hi * TS + 4; } for (const b of cb.bridges) { b.across = false; b.k = 1; } return cb; };
      { const cb = tun(); cb.barge.x = 251 * TS; sim(2); BK.tp(254, 17); P.y = cb.barge.y; P.vy = 0; sim(20); const x0 = cb.barge.x; sim(90); const stood = cb.barge.x - x0;
        k.right = true; sim(90); const x1 = cb.barge.x; sim(60); const legLit = cb.barge.x - x1; k.right = false; sim(40);   /* (claude/canal5) RIGHT held: he walks to her bow and legs her */
        P.face = -1; P.x = cb.barge.x + 30; sim(2); BK.press('atk'); sim(20); const dimmed = cb.lamp === false;
        k.right = true; sim(90); const x2 = cb.barge.x; sim(60); const legDark = cb.barge.x - x2; k.right = false; sim(40);
        P.face = -1; P.x = cb.barge.x + 30; sim(2); BK.press('atk'); sim(20); const relit = cb.lamp !== false;
        for (let i = 0; i < 4000 && cb.barge.holdWhy !== 'stop'; i++) { k.right = true; BK.sim(1); } k.right = false;
        const held = cb.barge.holdWhy, plank0 = BK.L.grid[19 * BK.L.W + 289]; BK.tp(293, 14); sim(20); P.face = 1; BK.press('atk'); sim(150);
        out.tunnel = [+stood.toFixed(1), +legLit.toFixed(1), dimmed, +legDark.toFixed(1), relit, held, plank0, BK.L.grid[19 * BK.L.W + 289], +cb.stops[0].k.toFixed(2)]; }
      // 9b. HER LIGHT DRAWS THE BROOD: lit, the tunnel mouth's grindylow comes aboard as she is legged past it; dimmed, it does not
      for (const lamp of [true, false]) { const cb = tun(); const gr = BK.enemies().find(e => e.t === 'grindylow' && Math.abs(e.x - (263 * TS + 8)) < 20); gr.alive = true; cb.barge.x = 252 * TS; sim(2); BK.tp(255, 17); P.y = cb.barge.y; P.vy = 0; sim(10); cb.lamp = lamp;
        let aboard = false; for (let i = 0; i < 60 * 12 && cb.barge.x < 270 * TS; i++) { k.right = true; P.hp = P.maxHp; BK.sim(1); if (gr.aboard || gr.mode === 'boardTell' || gr.mode === 'rippleTell' || gr.mode === 'grab') aboard = true; }   /* (claude/canal5) it COMES FOR HER: aboard, or - a legger lies at her end, over the water - up at her edge for his ankle */ k.right = false; out['brood' + (lamp ? 'Lit' : 'Dark')] = [aboard, gr.mode]; }
      // 10. (claude/canalfix) A GRINDYLOW COMES ABOARD A HELD BARGE and grabs a rider standing AMIDSHIPS (the mill wharf's, the bridge holding her)
      fresh(false); { const gw = BK.enemies().find(e => e.t === 'grindylow' && Math.abs(e.x - (104 * TS + 8)) < 20); kill(e => e !== gw); const cb = C(); const l1 = cb.reaches.find(r => r.id === 'L1'); l1.y = l1.to = 33 * TS + 4;
        cb.barge.x = 112 * TS - 97; sim(10); BK.tp(Math.round((cb.barge.x + 48) / TS), 31); sim(20); let aboard = false, grab = false; const hp1 = P.hp;
        for (let i = 0; i < 900 && !grab; i++) { BK.sim(1); if (gw.aboard) aboard = true; if (gw.mode === 'grab') grab = true; } out.boarded = [aboard, grab, hp1 - P.hp, cb.barge.holdWhy]; }
      // 11. (claude/canalfix, UPGRADE C) THE BOARDING GANG comes aboard at the fog wall
      fresh(false); { const cb = C(); for (const b of cb.bridges.slice(0, 2)) { b.across = false; b.k = 1; } kill(e => !e.boarder); cb.barge.x = 158 * TS; BK.tp(162, 31); sim(10);
        let onDeck = 0; for (let i = 0; i < 400; i++) { BK.sim(1); onDeck = BK.enemies().filter(e => e.alive && e.onDeck).length; if (onDeck >= 3) break; } out.gang = [onDeck, cb.barge.holdWhy, Math.round((cb.barge.x + 96) / TS)]; }
      // 12. (claude/canal4) A LOW BEAM IN THE TUNNEL finds a rider standing as she is legged under it, never one lying on her deck (legging is a duck)
      { const cb = tun(); cb.barge.x = 252 * TS; sim(2); BK.tp(255, 17); P.y = cb.barge.y; P.vy = 0; sim(10); const h0 = P.hp; for (let i = 0; i < 60 * 8 && cb.barge.x < 264 * TS; i++) { k.right = true; BK.sim(1); } k.right = false; out.beamLeg = h0 - P.hp; }
      // 13. (claude/canalfix3) CLARITY: held at the first lock's shut gate, the paddle that lets her go GLINTS, her lantern swings to it, and after ~10 s with no headway a nudge names it
      fresh(); kill(e => true); { const cb = C(); cb.barge.x = 80 * TS - 97; BK.tp(78, 39); P.y = cb.barge.y; sim(30); P.vy = 0; const t0 = cb.nudges || 0, c0 = cb.clock; for (let i = 0; i < 4000 && cb.clock - c0 < 11; i++) BK.sim(1); const tg = cb.glint;
        out.clarity = [cb.barge.holdWhy, tg && tg.why, tg && tg.prop.t, tg && tg.prop.reach, +(cb.lampAng || 0).toFixed(2), (cb.nudges || 0) - t0, cb.lastNudge || null];
        P.face = 1; BK.tp(79, 39); sim(5); BK.press('atk'); sim(30); out.clarityDone = cb.glint ? cb.glint.why : null; }
      // 14. (claude/canalfix3) NO WATER KEEPS YOU: a bright weed mat that gives way under you does not become the ground you are handed back to; wading in the race after the run, the canal hands you back
      fresh(false); kill(e => true); { BK.tp(366, 40); sim(40); BK.tp(371, 43); sim(10); let fell = 0; for (let i = 0; i < 900; i++) { BK.sim(1); if (P.y > 44 * TS + 12) fell++; } out.weedBack = [fell, Math.floor(P.x / TS), Math.floor(P.y / TS)]; }
      // 15. (claude/canalfix3) A SAFE SWIM: the flooded cellar is swum freely (no bite), and the first time, the quay's grindylow comes, bumps the grate and cannot pass
      fresh(false); { const gq = BK.enemies().find(e => e.t === 'grindylow' && e.x < 40 * TS); kill(e => e !== gq); BK.tp(24, 46); const hp2 = P.hp; let bump = false, hit = false, minX = 1e9;
        for (let i = 0; i < 500; i++) { BK.sim(1); if (gq.bump) { bump = true; if (gq.bump.hit) hit = true; } minX = Math.min(minX, gq.x); } out.swim = [P.swim, hp2 - P.hp, bump, hit, Math.floor(minX / TS)]; }
      { const cb = tun(); cb.barge.x = 289 * TS - 97; sim(4); BK.god = false; BK.tp(283, 14); sim(40); BK.tp(286, 17); P.vy = 0; const h0 = P.hp; for (let i = 0; i < 300; i++) BK.sim(1); out.ledgeBack = [h0 - P.hp, !!(P.onMover && P.onMover.canal), Math.round(P.x - (cb.barge.x + cb.barge.w / 2))]; }   /* (claude/canal5, was claude/canal4's 'back to the ledge') into the tunnel water off the stop-planks' ledge: bitten, and handed back ON HER DECK, amidships */
      // 16. (claude/canal5, Daniel 10-06: "I jumped out of the area and the raft didn't follow me... I couldn't get to the boss") SHE CAN NEVER BE LOST - with real keys:
      //   a. the moon shaft's grating holds (up its ladder and jumping, nobody gets out over the hill), and climbing down its ladder lands you on her deck
      { const cb = tun(); cb.barge.x = 302 * TS; sim(2); BK.tp(308, 17); P.y = cb.barge.y; P.vy = 0; sim(10); for (let i = 0; i < 400; i++) { k.up = true; BK.sim(1); } k.up = false; let minY = 1e9;
        for (let t = 0; t < 4; t++) { k.jump = true; BK.press('jump'); k.left = t % 2 === 0; k.right = t % 2 === 1; for (let i = 0; i < 50; i++) { BK.sim(1); minY = Math.min(minY, P.y); } k.jump = k.left = k.right = false; sim(10); }
        BK.tp(308, 5); sim(5); for (let i = 0; i < 20 && !P.climb; i++) { k.down = true; BK.sim(1); } for (let i = 0; i < 600 && !P.onMover; i++) { k.down = true; BK.sim(1); } k.down = false; sim(20); out.shaft = [Math.round(minY), !!(P.onMover && P.onMover.canal)]; }
      //   b. DOWN on her deck (a duck) never takes hold of the deep lock's ladder and climbs you off her into the water
      { const cb = tun(); cb.barge.x = 345 * TS - 97; sim(2); BK.tp(344, 17); P.y = cb.barge.y; P.vy = 0; sim(10); for (let i = 0; i < 60; i++) { k.down = true; BK.sim(1); } k.down = false; out.duckLadder = [P.climb, !!P.onMover]; }
      //   c. the deep lock's paddle struck with her OUTSIDE the lock (off early on the gallery): she glides in first, then it drains - never shut out behind its upper gate
      { const cb = tun(); cb.stops[0].k = 1; cb.stops[0].up = true; cb.barge.x = 320 * TS; sim(2); BK.tp(331, 14); sim(20); P.face = 1; BK.press('atk'); let shutOut = false; const L6 = cb.reaches.find(r => r.id === 'L6');
        for (let i = 0; i < 60 * 25 && Math.abs(L6.y - (L6.lo * TS + 4)) > 1; i++) { BK.sim(1); if (!cb.gates.find(g => g.id === 'G7').open && cb.barge.x < 334 * TS) shutOut = true; } out.paddleOut = [Math.abs(L6.y - (L6.lo * TS + 4)) < 1, shutOut, Math.round(cb.barge.x / TS), Math.round(cb.barge.y)]; }
      //   d. THE CALL: off her on the gallery, she glides along under you as you walk on; down the deep lock's ladder (DOWN held) you stand on her deck
      { const cb = tun(); cb.stops[0].k = 1; cb.stops[0].up = true; cb.barge.x = 318 * TS; sim(2); BK.tp(323, 14); sim(20); for (let i = 0; i < 600 && P.x < 333 * TS + 8; i++) { k.right = true; BK.sim(1); } k.right = false; sim(60 * 6);
        const under = Math.abs(cb.barge.x + cb.barge.w / 2 - P.x) < 40; for (let i = 0; i < 600 && P.x < 344 * TS + 4; i++) { k.right = true; BK.sim(1); } k.right = false; sim(60 * 4); for (let i = 0; i < 30 && !P.climb; i++) { k.down = true; BK.sim(1); } for (let i = 0; i < 900 && !P.onMover; i++) { k.down = true; BK.sim(1); } k.down = false; sim(20);
        out.call = [under, (cb.calls || 0) > 0, !!(P.onMover && P.onMover.canal), Math.round(P.y - cb.barge.y)]; }
      //   e. LEGGING IS SMOOTH: RIGHT held from the mouth to the stop-planks, the rider walks to her bow and stays there - never off her, never left behind, never snagged
      { const cb = tun(); cb.barge.x = 251 * TS; sim(2); BK.tp(254, 17); P.y = cb.barge.y; P.vy = 0; sim(20); let drops = 0, wasOn = true, maxJump = 0, lastOff = null, f = 0;
        for (let i = 0; i < 60 * 40 && cb.barge.holdWhy !== 'stop'; i++, f++) { k.right = true; BK.sim(1); const on = !!(P.onMover && P.onMover.canal); if (wasOn && !on) drops++; wasOn = on; const o2 = P.x - cb.barge.x; if (f > 90 && lastOff !== null) maxJump = Math.max(maxJump, Math.abs(o2 - lastOff)); lastOff = o2; } k.right = false;
        out.smooth = [drops, +maxJump.toFixed(2), cb.barge.holdWhy, Math.round(lastOff)]; }
      //   g. A LADDER'S RUNG UNDER HER DECK: the deep lock's ladder (every rung stands you up) held a hero 2 px under her deck, beside her and off her, while she went on
      { const cb = tun(); cb.barge.x = 345 * TS - 97; sim(4); P.x = 344 * TS + 3; P.y = 18 * TS - 1; P.vx = 0; P.vy = 0; P.onMover = null; sim(30); out.rung = [!!(P.onMover && P.onMover.canal), Math.round(P.y - cb.barge.y)]; }
      //   f. AN OPEN GATE'S SLOT IS WATER: off the basin's west bank down the deep lock's open lower gate, a hero was stood on its sill under the water, out of every pool - stuck
      { const cb = tun(); const L6 = cb.reaches.find(r => r.id === 'L6'); L6.y = L6.to = L6.lo * TS + 4; sim(30); BK.god = false; cb.barge.x = 346 * TS; sim(4); BK.tp(348, 40); sim(40); BK.tp(345, 47); P.vy = 0; const h0 = P.hp; for (let i = 0; i < 240; i++) BK.sim(1); out.slot = [cb.gates.find(g => g.id === 'G8').open, h0 - P.hp, Math.floor(P.x / TS), Math.floor((P.y - 1) / TS)]; }

      fresh(); kill(e => true); { const cb = C(); for (const q of cb.bridges.slice(0, 2)) { q.across = false; q.k = 1; } cb.barge.x = 158 * TS; BK.tp(162, 31); sim(120); const tg = cb.glint; out.clarityFog = [cb.barge.holdWhy, tg && tg.why, tg && Math.floor(tg.prop.x / TS)]; }
      //   h. (claude/canal6) JENNY'S WATER TAKES WHAT FALLS IN: the stop-planks' bargee walked off his ledge used to stand on the tunnel's bed, five rows under the
      //      surface, out of sight and reach, for the rest of the attempt. A man in the canal is DROWNED at once; an elite is put back at his post
      fresh(); { const gb = BK.enemies().find(e => e.alive && e.bargee && !e.elite && e.x > 288 * TS && e.x < 298 * TS); kill(e => e !== gb && !e.elite); gb.x = 286 * TS + 8; gb.y = 21 * TS; gb.vy = 0; sim(30);
        const fm = BK.enemies().find(e => e.alive && e.elite && e.bargee), hx = fm.home.x; fm.x = 372 * TS; fm.y = 46 * TS; fm.vy = 0; sim(10);
        out.water6 = [gb.alive, Math.round(gb.y / TS), fm.alive, Math.round((fm.x - hx) / TS), Math.round(fm.y / TS)]; }
      //   i. (claude/canal6) THE DECK FOREMAN IS NEVER LEFT BEHIND HIS DOOR: ridden past (her in the basin lock under his shut door, a hero aboard), he leaps
      //      aboard - on her deck, in reach - and the door opens when he is down
      const AIR = (await import('/src/level.js')).T.AIR; fresh(); kill(e => !e.elite); { const cb = C(), fm = BK.enemies().find(e => e.alive && e.elite && e.bargee), G = fm.G, shut = () => BK.L.grid[G.top * BK.L.W + G.col] !== AIR;
        cb.barge.x = 383 * TS; sim(4); BK.tp(386, 42); sim(40); const on0 = !!(P.onMover && P.onMover.canal); let t = 0; for (; t < 60 * 4 && !fm.cnDeck; t++) BK.sim(1); sim(30);
        const deck = fm.x >= cb.barge.x + 8 && fm.x <= cb.barge.x + cb.barge.w - 8 && Math.abs(fm.y - cb.barge.y) < 2, shut0 = shut(); fm.alive = false; sim(10);
        out.foreman6 = [on0, !!fm.cnDeck, deck, +(t / 60).toFixed(2), shut0, shut()]; }
      return out; })()`, 900000);
    ok(r.water6[0] === false && r.water6[2] && Math.abs(r.water6[3]) < 1 && r.water6[4] <= 41, 'a man in the canal (the stop-planks bargee, off his ledge) was not drowned, or the elite in it was not put back at his post: ' + JSON.stringify(r.water6));
    ok(r.foreman6[0] && r.foreman6[1] && r.foreman6[2] && r.foreman6[3] < 2 && r.foreman6[4] && !r.foreman6[5], 'ridden past, the deck foreman did not leap aboard her in the lock under his shut door (or his door did not open when he was down): ' + JSON.stringify(r.foreman6));
    ok(r.board && r.carried > 16, 'the barge did not carry a hero standing on her (' + JSON.stringify([r.board, r.carried]) + ')');
    ok(r.ducked === 0 && r.stood > 0, 'the low bridge did not find a rider standing, or found one ducked (ducked ' + r.ducked + ', stood ' + r.stood + ')');
    ok(r.towpathSide === 0, 'on the towpath side her rider was still hit by the offside timbers (' + r.towpathSide + ')');
    ok(r.boarded[0] && r.boarded[1] && r.boarded[2] > 0, 'a grindylow did not come aboard the held barge and grab a rider amidships: ' + JSON.stringify(r.boarded));
    ok(r.gang[0] >= 3 && r.gang[1] === 'fog', 'the boarding gang did not come aboard her at the fog wall: ' + JSON.stringify(r.gang));
    ok(r.tunnel[0] === 0 && r.tunnel[1] > 20, 'in the tunnel she went for a rider who stood, or not for one who legged her: ' + JSON.stringify(r.tunnel));
    ok(r.tunnel[2] && r.tunnel[3] > 0 && r.tunnel[3] < r.tunnel[1] * 0.8 && r.tunnel[4], 'her lantern did not dim and light again to a real swing, or blind she was not the slower: ' + JSON.stringify(r.tunnel));
    ok(r.tunnel[5] === 'stop' && r.tunnel[6] === 1 && r.tunnel[7] === 0 && r.tunnel[8] > 0.9, 'the stop-planks did not hold her until a real swing at their windlass wound them up: ' + JSON.stringify(r.tunnel));
    ok(r.broodLit[0] && !r.broodDark[0], 'her light does not draw the brood: lit, the mouth\'s grindylow must come for her (aboard, or at her end for the legger: claude/canal5 legs her from her bow), dimmed it must not (lit ' + JSON.stringify(r.broodLit) + ', dark ' + JSON.stringify(r.broodDark) + ')');
    ok(r.beamLeg === 0, 'legging her (lying on the deck) under the tunnel\'s low beams still hurt the rider: ' + r.beamLeg);
    ok(r.lockPre === 1 && r.lock[0] < 33 * TS && r.lock[1] < 33 * TS && r.lock[2] === 0 && r.lock[3], 'the paddle did not fill the lock, lift her and the hero, and open the upper gate: ' + JSON.stringify([r.lockPre, r.lock]));
    ok(r.bridgePre === 2 && r.bridge[0] === 0 && r.bridge[1] === false, 'the capstan did not swing the mill bridge out of the grid: ' + JSON.stringify([r.bridgePre, r.bridge]));
    ok(r.fogHeld[0] === 'fog' && r.fogHeld[1] === 165 && r.fogOn > 170, 'the fog wall did not hold her until the horn cleared it: ' + JSON.stringify([r.fogHeld, r.fogOn]));
    ok(r.archer[0] === 0 && r.archer[1] > 0, 'an archer in the fog loosed at a hero in the dark, or not at one in the light: ' + JSON.stringify(r.archer));
    ok(r.grind[0] && r.grind[1], 'the grindylow at the quay did not grab, or three presses did not break it: ' + JSON.stringify(r.grind));
    ok(r.bright0 === 39 * TS && r.bright1 > 39 * TS && r.dark > 39 * TS, 'the bright weed did not hold and then give, or the dark weed held: ' + JSON.stringify([r.bright0, r.bright1, r.dark]));
    ok(r.water[0] > 0 && r.water[2] <= 39, 'the canal did not bite and hand the hero back to the bank: ' + JSON.stringify(r.water));
    ok(r.clarity[0] === 'gate' && r.clarity[1] === 'gate' && r.clarity[2] === 'locksluice' && r.clarity[3] === 'L1' && r.clarity[4] < -0.05 && r.clarity[5] === 1 && r.clarity[6] === 'THE GATE IS SHUT: FIND ITS PADDLE', 'held at the shut gate, its paddle did not glint, her lantern did not swing to it, or no nudge named it after 10 s: ' + JSON.stringify(r.clarity));
    ok(r.weedBack[1] >= 362 && r.weedBack[1] <= 370 && r.weedBack[2] <= 41, 'a bright weed mat that gave way was the ground the canal handed the hero back to (or he was left in the water): ' + JSON.stringify(r.weedBack));
    ok(r.shaft[0] >= 2 * TS && r.shaft[1], 'the moon shaft let a hero out over the hill (lowest y ' + r.shaft[0] + ', the grating is rows 0-1), or its ladder did not put him back on her deck: ' + JSON.stringify(r.shaft));
    ok(!r.duckLadder[0] && r.duckLadder[1], 'DOWN on her deck took hold of the ladder of the deep lock and climbed the rider off her: ' + JSON.stringify(r.duckLadder));
    ok(r.paddleOut[0] && !r.paddleOut[1] && r.paddleOut[2] >= 335, 'the paddle of the deep lock struck with her outside shut her out behind its upper gate (she must glide in, then it drains): ' + JSON.stringify(r.paddleOut));
    ok(r.call[0] && r.call[1] && r.call[2] && Math.abs(r.call[3]) < 2, 'off her on the gallery she did not glide along to the hero (THE CALL), or down the ladder of the deep lock he did not stand on her deck: ' + JSON.stringify(r.call));
    ok(r.smooth[0] === 0 && r.smooth[1] < 1 && r.smooth[2] === 'stop' && r.smooth[3] > 80, 'legging with RIGHT held was not smooth (the rider left her deck, jumped about on it, or was not at her bow when the planks held her): ' + JSON.stringify(r.smooth));
    ok(r.rung[0] && Math.abs(r.rung[1]) < 1, 'a hero stood on the deep lock\x27s ladder rung just under her deck was left beside her, off her (the ladder glitch): ' + JSON.stringify(r.rung));
    ok(r.slot[0] && r.slot[1] > 0 && r.slot[3] < 44, 'a hero down the open slot of the deep lock\x27s lower gate was not bitten and handed back out of it (he stood on its sill under the water, stuck): ' + JSON.stringify(r.slot));
    ok(r.ledgeBack[0] > 0 && r.ledgeBack[1] && Math.abs(r.ledgeBack[2]) < 4, 'a fall into the tunnel water off the stop-planks\' ledge was not bitten and handed back ONTO HER DECK: ' + JSON.stringify(r.ledgeBack) + ' (claude/canal5: back ON HER DECK amidships - a ledge she cannot reach was where heroes were stranded)');
    ok(r.swim[0] && r.swim[1] === 0 && r.swim[2] && r.swim[3] && r.swim[4] >= 36, 'the flooded cellar is not a safe swim, or the quay grindylow did not bump its grate (and stay on the green side): ' + JSON.stringify(r.swim));
    ok(r.clarityDone === null, 'the paddle worked, it still glints (' + r.clarityDone + ')');
    ok(r.clarityFog[0] === 'fog' && r.clarityFog[1] === 'fog' && r.clarityFog[2] === 163, 'held at the fog wall, the bank horn does not glint: ' + JSON.stringify(r.clarityFog));
    if (pg.errors.length) fails.push('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  } finally { pg.close(); }
}
if (fails.length) { console.log('canal: ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exitCode = 1; }
else console.log('ok  canal  the rig (locks, barge, bridges, fog and horns, the legging tunnel) and its two foes hold; the level sits between Waymeet and the fair with its own track, opens with a drop and a branch, teaches, develops, twists and examines all five machines and makes each one a lock, combines them in the exam, teaches, tests, remixes and examines the legging tunnel, keeps three checkpoints and Jenny Greenteeth\'s footprint, and foreshadows her' + (NOPAGE ? ' (page skipped)' : '; and in the page the barge carries you, the low beam finds the standing, a paddle fills a lock, a capstan swings a bridge, a horn opens the fog wall, the archers see only the lit, the grindylow grabs and is shaken off, the weeds hold and give, the canal hands you back, in the tunnel she is legged, her lantern dims and lights and draws the brood, the stop-planks wind up'));
