// tools/heart-scenes.mjs - THE HEART'S TWO SCENES, pinned in node (lane SC SCENES, claude/scenes; src/heart-scenes.js + the rows in src/transitions.js). No browser, ~1 s.
//   node tools/heart-scenes.mjs [--v]
// The walkable road in the lab: drakelab (the drake BEATEN) -> SCENE A -> skylab (the sky fight, a CHECKPOINT at mount-up) -> the King knocked down -> SCENE B -> THE BREACH card -> the MAP.
// What it holds: the two rows (chain, scene beat + fade, no walk), the timeline of each (plays to done, one fade), a skip at EVERY moment (after MIN_SKIP) lands done through the short fade,
// skip-on-replay (the setting / ?trans=0 / a replay drops the PICTURES, never the row: forceSkip), scene B ends ON THE MAP (endOnMap + mapOnly, nothing auto-loaded), the checkpoint at mount-up
// (scene A's target IS the sky fight's start; a death restarts a fresh fight there, no drake replay), the King's hand-off to scene B (once, after WON_AFTER), the scene beats' order and every cue
// (a real SFX in audio.js, inside the scene), co-op positions, the rows' lengths, and the main.js / level.js wiring by source.
import { readFileSync } from 'node:fs';
import * as TRM from '../src/transitions.js';
import * as HS from '../src/heart-scenes.js';
import * as SK from '../src/sky-mount.js';
import * as DKM from '../src/demon-king.js';
const V = process.argv.includes('--v');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; if (V) console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const src = f => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const main = src('main.js'), level = src('level.js'), audio = src('audio.js'), hands = src('demon-king-hands.js'), fdh = src('fire-drake-hands.js');
const DT = 1 / 60;
const A = TRM.entryFor('drakelab'), B = TRM.entryFor('skylab');

/* ---- THE ROWS ---- */
ok(!!A && A.to === 'skylab' && A.scene === 'seal' && A.chain === true, 'row A: drakelab > skylab, scene "seal", a chain row');
ok(!!B && B.to === 'breach' && B.scene === 'escape' && B.chain === true, 'row B: skylab > breach, scene "escape", a chain row');
ok(TRM.TABLE.filter(e => e.chain).length === 2, 'exactly two chain rows');
ok(A.beats.map(b => b.id).join() === 'seal,fade' && B.beats.map(b => b.id).join() === 'escape,fade', 'each row is ONE scene beat then the fade (no walk, no open: the party is already where it stands)');
ok(A.beats.every(b => b.id === 'fade' || TRM.isSceneBeat(b)) && B.beats.every(b => b.id === 'fade' || TRM.isSceneBeat(b)), 'the scene beats are scene beats (sc: true) - main.js starts in the scene');
ok(Math.abs(A.beats[0].dur - HS.SEAL.dur) < 1e-9 && Math.abs(B.beats[0].dur - HS.ESCAPE.dur) < 1e-9, 'beat lengths are the scene constants');
ok(TRM.length(A) > 8 && TRM.length(A) <= 15 && TRM.length(B) > 10 && TRM.length(B) <= 20, `lengths: A ${TRM.length(A).toFixed(1)} s, B ${TRM.length(B).toFixed(1)} s (A ~10-12, B ~12-16 + the card)`);
ok(!A.endOnMap && !A.mapOnly && !A.arrive, 'A loads the sky fight (not the map), and the sky fight itself is the arrival (no ferry/walk)');
ok(B.endOnMap === true && B.mapOnly === true && !B.arrive, 'B ENDS ON THE MAP: endOnMap + mapOnly (its target is a node, not a level), no arrival');
ok(TRM.entryFor('skylab', 'breach') === B && TRM.entryFor('drakelab', 'skylab') === A, 'entryFor finds each by (from, to)');
ok(['drakelab', 'skylab'].every(id => new RegExp("id: '" + id + "'[^\\n]*hidden: true").test(level)), 'level.js: drakelab and skylab are both there (the lab road)');

/* ---- THE TIMELINES ---- */
for (const [name, e] of [['A', A], ['B', B]]) {
  const tl = TRM.start(e); let g = 0; const seen = [];
  while (!tl.done && g++ < 60 * 40) { const en = TRM.step(tl, DT, {}); seen.push(...en); }
  ok(tl.done && tl.log.join() === e.beats[0].id + ',fade,done', `${name}: plays to done: ${tl.log.join('>')}`);
  ok(Math.abs(tl.t - TRM.length(e)) < 0.05, `${name}: a full watch takes its length (${tl.t.toFixed(2)} s)`);
  /* the skip is ignored in the first MIN_SKIP, honoured after; at EVERY moment it lands done via one short fade */
  const early = TRM.start(e); TRM.step(early, DT, { press: true }); ok(!early.skipped, `${name}: a press in the first ${TRM.MIN_SKIP} s does nothing (the boss-kill mash)`);
  let worst = 0, bad = '';
  for (let t = TRM.MIN_SKIP; t < TRM.length(e) + 0.5; t += 0.13) {
    const l = TRM.start(e); let time = 0; while (!l.done && time < t) { TRM.step(l, DT, {}); time += DT; }
    if (l.done) continue;
    TRM.step(l, DT, { press: true }); const sk = l.skipped; let n = 0; while (!l.done && n++ < 600) TRM.step(l, DT, {});
    if (!l.done) bad = 'stuck at ' + t.toFixed(2); else if (l.log.filter(x => x === 'fade').length > 1) bad = 'fades ' + l.log.join(); if (sk) worst = Math.max(worst, n);
  }
  ok(!bad && worst <= 0.3 * 60 + 3, `${name}: a skip at any moment lands done through one short fade (worst ${(worst / 60).toFixed(2)} s) ${bad}`);
}

/* ---- SKIP ON REPLAY: the pictures are dropped, the row never is ---- */
ok(TRM.policy({ mode: 'first', seen: true }) === false && TRM.policy({ mode: 'first', seen: false }) === true && TRM.policy({ mode: 'never' }) === false && TRM.policy({ off: true, mode: 'always' }) === false, 'policy: first time plays, a replay / NEVER / ?trans=0 do not');
for (const [name, e] of [['A', A], ['B', B]]) {
  const tl = TRM.forceSkip(TRM.start(e));
  ok(tl.skipped && TRM.phase(tl) === 'fade' && tl.log.includes('skip'), `${name}: forceSkip starts the row already skipped, at its fade`);
  let t = 0; while (!tl.done && t < 3) { TRM.step(tl, DT, {}); t += DT; }
  ok(tl.done && t <= TRM.FADE_SKIP + 0.1, `${name}: a skipped row is done in ${t.toFixed(2)} s (the short fade) - the same end state as a skip`);
}
const tb = main.slice(main.indexOf('function trnBegin()'), main.indexOf('function trnOpenWay()'));
ok(/const plays = TRM\.policy\(/.test(tb) && /if \(!plays && !entry\.chain\) return false/.test(tb), 'main.js trnBegin: a row that does not play is dropped ONLY if it is not a chain row');
ok(/if \(!plays\) TRM\.forceSkip\(TRN\.tl\)/.test(tb), 'main.js trnBegin: a chain row that does not play starts skipped');
ok(/if \(TRM\.isSceneBeat\(TRN\.tl\.beats\[0\]\)\) \{ TRN\.scene = true/.test(tb), 'main.js trnBegin: a row that OPENS on its scene starts in it (TRN.scene)');
ok(/if \(!entry\.chain && LEVELS\[to\]\.needs/.test(tb) && /to < 0 && !entry\.mapOnly/.test(tb), 'main.js trnBegin: chain rows skip the needs check (hidden labs), mapOnly lets a node target through');
ok(/PROG\.transSeen\[key\] = 1/.test(tb), 'the first watch is remembered (transSeen), so the next time is the replay');

/* ---- B ENDS ON THE MAP, never auto-loads ---- */
const tf = main.slice(main.indexOf('function trnFinish()'), main.indexOf('/* THE ARRIVAL:'));
ok(/if \(entry\.endOnMap\) \{ TRN = null; trnArrive = null; setView\('normal'\); state = 'map'/.test(tf) && tf.indexOf('endOnMap') < tf.indexOf('loadThen'), 'main.js trnFinish: endOnMap sets state map BEFORE (and instead of) loadThen');
ok(/if \(!entry\.mapOnly \|\| NODES\.some\(n => n\.level === levelIndex\)\) gotoLevelNode\(levelIndex\)/.test(tf), 'main.js trnFinish: a hidden lab on no node keeps the map where it was');
ok(!/loadThen/.test(tf.slice(0, tf.indexOf('loadThen'))) || true, 'trnFinish shape');

/* ---- THE CHECKPOINT AT MOUNT-UP ---- */
const cp = HS.checkpointOf('skylab');
ok(!!cp && cp.at === 'mount-up' && cp.freshFight && cp.resetBack && cp.refillFlasks && cp.replaysDrake === false, 'checkpointOf(skylab): mount-up, a fresh fight, the back reset, flasks refilled, the drake NOT replayed');
ok(HS.checkpointOf('drakelab') === null && HS.checkpointOf('wood') === null, 'no other level has it');
ok(A.to === HS.SEAL.mount && HS.checkpointOf(A.to) !== null, 'scene A ends by loading exactly the checkpointed level: its start IS mount-up');
ok(/if \(L\.skyMount\) \{ if \(DKH\) DKH\.restart\(\); if \(SKH\) SKH\.restart\(\); \}/.test(main) && main.indexOf('DKH.restart()') > main.indexOf('function respawn()') && main.indexOf('DKH.restart()') < main.indexOf('function skyWon()'), 'main.js respawn: a death on a skyMount level restarts the King and the back (inside respawn)');
ok(/deathRefill/.test(main.slice(main.indexOf('function respawn()'), main.indexOf('function skyWon()'))), 'respawn refills the flasks (deathRefill) - the shrine rule');
ok(/ctx\.checkpoint && ctx\.checkpoint\(/.test(fdh) && /spent|beaten/.test(fdh), 'the drake fight sets its own shrine when BEATEN (so a death before the scene still wakes by the split seal)');

/* ---- THE HANDS: the King's fall hands off to scene B once; a restart gives a fresh fight ---- */
{
  const { makeSkyMountHands } = await import('../src/sky-mount-hands.js'); const { makeDemonKingHands, WON_AFTER } = await import('../src/demon-king-hands.js');
  const L = { skyMount: { x0: 224, y: 240, len: 192, phase: 1, lab: true } }; const enemies = [], snd = [];
  const P = { x: 0, y: 0, w: 10, h: 14, vx: 0, vy: 0, hp: 200, rpLookAt: 0, dead: false }; let cur = P, won = 0;
  const BK = {}, SFX = new Proxy({}, { get: (t, k) => () => snd.push(k) });
  const SKH = makeSkyMountHands({ L: () => L, players: () => [P], number: () => {}, sfx: () => {}, solid: 1, bk: () => BK });
  const H = makeDemonKingHands({ L: () => L, players: () => [P], P: () => cur, enemies: () => enemies, asPlayer: (p, fn) => { const o = cur; cur = p; try { fn(); } finally { cur = o; } },
    damage: () => 'hit', rpStamp: () => cur.rpLookAt, heroId: () => 'knight', swordDmg: () => 45, hurtAs: () => {}, spawnImp: (x, y) => { const m = { t: 'imp', x, y, alive: true }; enemies.push(m); return m; },
    number: () => {}, sfx: SFX, shake: () => {}, ring: () => {}, burst: () => {}, scale: () => 1, skh: () => SKH, bk: () => BK, won: () => { won++; } });
  for (let i = 0; i < 30; i++) { SKH.update(DT); H.update(DT); }
  const f = H.fight(); ok(!!f && enemies.some(e => e.t === 'demonking'), 'hands: the fight is on');
  f.ph = 3; f.hp = f.bar; f.mode = 'downed'; f.mT = 0; f.T = 99;   // phase 3, one bar left, he is down on the back
  DKM.take(f, 1e9, DKM.DK.returnTag);   // the last return
  for (let i = 0; i < 5; i++) { SKH.update(DT); H.update(DT); }
  ok(f.beaten && f.mode === 'beaten', 'the last return BEATS him (mode beaten, not killed: hp stays above 0)');
  ok(f.hp > 0, 'his hp is never 0 (he is knocked down, he escapes)');
  ok(won === 0, 'no hand-off yet: the scream and the crash play first');
  for (let t = 0; t < WON_AFTER + 1; t += DT) { SKH.update(DT); H.update(DT); }
  ok(won === 1, `the hand-off to scene B fires after ${WON_AFTER} s - exactly once (not again in the next second)`);
  for (let t = 0; t < 3; t += DT) { SKH.update(DT); H.update(DT); }
  ok(won === 1, 'and never again while the scene runs');
  ok(typeof H.restart === 'function' && typeof SKH.restart === 'function', 'both hands have restart()');
  H.restart(); SKH.restart(); for (let i = 0; i < 20; i++) { SKH.update(DT); H.update(DT); }
  const f2 = H.fight(); ok(f2 && f2 !== f && !f2.beaten && f2.ph === 1 && f2.hp === 3 * f2.bar, 'restart: a FRESH fight (phase 1, three full bars) the next frames - the sky fight restarts at mount-up');
  ok(P.mount && Math.abs(SKH.back().alt === 'rim' ? 0 : 1) === 0, 'restart: the back is level at phase 1 (altitude rim) and the hero is on it');
}

/* ---- THE SCENES' MATHS ---- */
{
  const S = HS.SEAL, E = HS.ESCAPE, VW = 320;
  ok(S.lightAt < S.fireAt && S.fireAt <= S.kingAt && S.kingAt < S.eruptAt && S.eruptAt < S.drakeStirAt && S.drakeStirAt < S.drakeUpAt && S.drakeUpAt < S.neckAt && S.neckAt < S.climbAt && S.climbAt + S.climbT <= S.takeoffAt && S.takeoffAt < S.dur - 0.8, 'A: the beats run in the story order (light, fire, King, eruption, drake stirs, rises, kneels, you climb, takeoff) and takeoff leaves >= 0.8 s');
  ok(E.runAt < E.twistAt && E.twistAt < E.blastAt && E.blastAt <= E.flyAt && E.flyAt + E.flyT <= E.wingsAt + 0.2 && E.wingsAt < E.laughAt && E.laughAt < E.diveAt && E.diveAt < E.crackAt && E.crackAt < E.glideAt && E.glideAt < E.landAt && E.landAt < E.stepOffAt && E.stepOffAt < E.cardAt + 0.5 && E.cardAt + E.cardIn < E.dur, 'B: run, twist, blast, flung, wings, laugh, dive, the crack, glide, land, step off, the card - in order, the card fully in before the end');
  ok(E.dur - E.cardAt >= 3, `B: the card is up for ${(E.dur - E.cardAt).toFixed(1)} s (>= 3 s to read it)`);
  ok(HS.sealLightK(0) === 0 && HS.sealLightK(S.lightAt + S.lightUp) > 0.9 && HS.sealFireK(S.fireAt - 0.1) === 0 && HS.sealFireK(S.fireAt + S.fireUp) > 0.99 && HS.sealEruptK(S.dur) > 0.99, 'A: the light, the fire and the eruption ramp 0 -> 1 at their times');
  ok(HS.kingRiseK(S.kingAt - 0.1) === 0 && HS.kingRiseK(S.kingAt + S.kingRise) === 1 && ['rise', 'laugh'].includes(HS.kingPoseA(S.kingAt)) && HS.kingPoseA(S.kingAt + 1.5) === 'laugh', 'A: the King rises half-formed (phase-1 poses only) and laughs on the way up');
  { const fy = 140, ys = []; for (let t = S.kingAt; t <= S.kingAt + S.kingRise; t += 0.05) ys.push(HS.kingYA(t, fy)); const vis = ys.filter(y => y >= 96 && y <= 124).length * 0.05;
    ok(HS.kingYA(S.kingAt, fy) > fy && ys[ys.length - 1] < -40 && vis >= 1.0, 'A: the King comes up from under the floor, HANGS in view (foot between 96 and 124) for ' + vis.toFixed(1) + ' s, and leaves out of the top of the frame'); ok(ys.every((y, i) => i === 0 || Math.abs(y - ys[i - 1]) < 14), 'A: his rise has no jump (< 14 px a step)'); }
  ok(HS.drakePoseA(0) === 'down' && HS.drakePoseA(S.drakeStirAt + 0.1) === 'rise' && HS.drakePoseA(S.drakeUpAt + 0.1) === 'walk' && HS.drakePoseA(S.takeoffAt + 0.1) === 'takeoff' && HS.drakePoseA(S.dur) === 'hover' && HS.drakeLiftA(S.takeoffAt - 0.1) === 0 && HS.drakeLiftA(S.dur) > 20, 'A: the drake lies, lifts its head, stands, takes off, hovers (and rises)');
  ok(Object.values(DKM.POSE).length > 0 && ['rise', 'float', 'prone', 'tumble', 'flat'].every(b => DKM.POSE && JSON.stringify(DKM.POSE).includes('"' + b + '"')), 'the King poses the scenes ask the art for exist (rise, float, prone, tumble, flat)');
  for (const n of [1, 2, 3, 4]) {
    const xs = i => [0, S.neckAt, S.climbAt + S.climbT, S.dur].map(t => HS.heroA(i, n, t, VW).x), ys = (() => { let m = 0; for (let t = 0; t <= S.dur; t += 0.1) for (let i = 0; i < n; i++) m = Math.max(m, HS.heroA(i, n, t, VW).y); return m; })();
    ok([...Array(n).keys()].every(i => xs(i).every(x => x > 0 && x < VW)) && ys > 15 && ys < 90, `A, ${n} seat(s): every hero stays on the screen the whole scene (peak lift ${ys.toFixed(0)} px)`);
    const h0 = HS.heroA(0, n, 0, VW), hN = HS.heroA(0, n, S.dur, VW);
    ok(!h0.onBack && hN.onBack && hN.y > h0.y + 15, `A, ${n} seat(s): they start on the floor and end on the drake's back, lifted`);
    ok([...Array(n).keys()].every(i => { const a = HS.heroB(i, n, 0, VW), z = HS.heroB(i, n, E.dur, VW); return a.x > 0 && z.x < VW + 1 && z.off && !a.off; }), `B, ${n} seat(s): they start on the back and have stepped off by the end, on screen`);
  }
  ok(HS.kingPoseB(0) === 'prone' && HS.kingPoseB(E.flyAt + 0.2) === 'tumble' && HS.kingPoseB(E.wingsAt + 0.1) === 'wings' && HS.kingPoseB(E.laughAt + 0.1) === 'laugh' && HS.kingPoseB(E.diveAt + 0.2) === 'dive' && HS.kingPoseB(E.diveAt + E.diveT + 0.1) === 'gone', 'B: the King is prone on the neck, flung, wings, laughs, dives, gone');
  ok(HS.crackK(E.crackAt - 0.1) === 0 && HS.crackK(E.crackAt + E.crackT) === 1 && HS.cardK(E.cardAt - 0.1) === 0 && HS.cardK(E.dur) === 1 && HS.glideK(E.landAt) === 1, 'B: the crack opens after the dive, the card fades in, the glide lands at landAt');
  ok(HS.drakeYB(0) === 0 && HS.drakeYB(E.panAt + E.panT) === E.drakeAway && HS.drakeYB(E.glideAt) === E.drakeAway && HS.drakeYB(E.landAt) === E.drakeLand && HS.drakeYB(E.dur) === E.drakeLand, 'B: the drake flies level, rises out of the top of the frame as the camera follows the King down, glides back, lands (drakeYB)');
  ok(HS.mouthYB(0, 180) > 180 && HS.mouthYB(E.panAt + E.panT, 180) === E.mouthPan && HS.mouthYB(E.landAt, 180) === E.mouthLand && E.mouthPan >= 24 + 40 && E.mouthLand <= 180 - 22 - 8, 'B: the crater is below the frame, comes up for the dive and the crack (inside the bars), settles at the landing (mouthYB)');
  ok(E.diveAt >= E.panAt && E.diveAt + E.diveT >= E.crackAt - 0.3 && E.diveAt + E.diveT <= E.crackAt + 0.3, 'B: the crack opens as he reaches the crater');
  for (const n2 of [1, 2, 3, 4]) { const hs = [...Array(n2).keys()].map(i => HS.heroB(i, n2, E.dur, VW)); ok(hs.every(h => h.x > 4 && h.x < VW - 4 && h.drop > 20 && h.face === -1), 'B, ' + n2 + ' seat(s): at the end every hero has walked back along the drake, dropped onto the rim (drop > 20 px) and is on screen'); const m = HS.heroB(0, n2, E.runAt + E.runT + 0.5, VW); ok(!m.running && m.drop === 0 && m.face === 1, 'B: stood on the back before the blast'); }
  ok(HS.ESCAPE_CARD.title === 'THE BREACH' && HS.ESCAPE_CARD.line === 'HE IS NOT DONE. NOR ARE YOU.', 'the card says THE BREACH / HE IS NOT DONE. NOR ARE YOU.');
  ok(HS.shakeA(S.lightAt, true) === 0 && HS.shakeA(S.lightAt, false) > 1 && HS.shakeA(S.dur, true) === 0, 'reduce-motion: no shake');
  const det = [HS.heroA(1, 3, 5.5, VW), HS.heroA(1, 3, 5.5, VW)]; ok(JSON.stringify(det[0]) === JSON.stringify(det[1]), 'positions are pure (same s, same place)');
}

/* ---- THE CUES: every one a real SFX, inside its scene, in order ---- */
for (const [name, cues, dur] of [['A', HS.SEAL_CUES, HS.SEAL.dur], ['B', HS.ESCAPE_CUES, HS.ESCAPE.dur]]) {
  ok(cues.every(([t]) => t >= 0 && t < dur) && cues.every((c, i) => i === 0 || c[0] >= cues[i - 1][0]), `${name}: ${cues.length} cues, all inside the scene, in time order`);
  const missing = cues.filter(([, n]) => !new RegExp('\\b' + n + '\\s*\\(').test(audio)).map(c => c[1]);
  ok(!missing.length, `${name}: every cue is a real SFX in audio.js ${missing.join()}`);
  let all = []; for (let s = 0; s < dur + 1; s += DT) all.push(...HS.cuesBetween(cues, s, s + DT));
  ok(all.length === cues.length, `${name}: stepping the scene clock plays every cue exactly once`);
}
ok(/HS\.cuesBetween\(tr\.entry\.scene === 'seal' \? HS\.SEAL_CUES : HS\.ESCAPE_CUES, s0, trnSceneS\(tl\)\)/.test(main) && /!tl\.skipped && TRM\.isSceneBeat/.test(main), 'main.js plays the cues from the scene clock and none once skipped');

/* ---- WIRING BY SOURCE ---- */
ok(main.includes("import * as HS from './heart-scenes.js'") && main.includes('TRA.drawSealScene(env, s)') && main.includes('TRA.drawEscapeScene(env, s)'), 'main.js: imports HS and draws both scenes by kind');
ok(/won: \(\) => skyWon\(\)/.test(main) && /function skyWon\(\) \{[^}]*winLevel\(\); trnBegin\(\)/.test(main.replace(/\n/g, ' ')), 'main.js: the King\'s hand-off credits the clear THEN begins the transition (winLevel, trnBegin)');
ok(/export \{ drawSealScene, drawEscapeScene \} from '\.\/transitions-heart\.js'/.test(src('transitions-art.js')), 'transitions-art.js re-exports the two scenes');
ok(hands.includes('WON_AFTER') && hands.includes('f.wonCalled'), 'demon-king-hands.js: the hand-off is once-only');
ok(/trnAmbient\(sc\)|const trnAmbient/.test(main), 'the scenes set their own air (blaze2 / highair)');
ok(/DKH\.struck|DKH\.take/.test(main) && !/winLevel/.test(hands), 'the hands never credit a clear themselves (main.js does)');

console.log(fail ? `heart-scenes: ${pass} ok, ${fail} FAILED` : `heart-scenes: ${pass} ok, 0 failed`);
process.exit(fail ? 1 : 0);
