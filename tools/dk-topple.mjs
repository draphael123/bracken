/* tools/dk-topple.mjs - THE DEATH KNIGHT'S SIGNATURE MOMENT, "TOPPLE THE STANDARD" (claude/dklift; scratch/brief-bosslift-1108.md 2, plan scratch/lane-reports/bosslift-plan.md).
   Node only, no page. It drives src/unburied-foes.js updateBloodKnight / bkHurt in a hand-made chapel (the real arena from src/level.js), the way
   tools/unburied-fights.mjs does, and reads src/main.js + src/lab.js for the hooks. Run by tools/unburied-fights.mjs (its last line), or alone. It fails when:
     (a) a standard cut with him ROOTED in its arc (bkForce cleave, committed) does not fall on him: PINNED (UNB.bk.lift.pinT s, x openMul), a ward standing breaks (breaks++)
     (b) a cut while he walks in its arc pins nothing: "HE STEPS CLEAR", and the pole lies spent
     (c) a cut with the blow facing away from him falls the other way: no pin
     (d) phase two: his raised dead are bound to the standing poles; cut the last one and every one of them lies down for good (laid), and 'call' leaves his rotation
     (e) the surge stands the poles up once - the last fall in phase two is final
     (f) FLAG OFF is not the live fight: a fixed-seed trace of updateBloodKnight with the flag off matches master's src/unburied-foes.js (GOLDEN; regenerate with
         node tools/dk-topple.mjs --trace <path-to-unburied-foes.js>), and the flag on hashes differently; every dklift line in main.js / lab.js is gated
     (g) a boss rule broke: a pin pays at most lift.pinTake of his health and then he throws it off (no lock), blows outside an opening still land whole (FULL DAMAGE, no shell)
     (h) the bot's hands (src/lab.js bloodknight branch, the co-op AI partner's too) - checked by source: topple + lure are behind bkLiftOn()
   node tools/dk-topple.mjs */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve as pres, dirname } from 'node:path';
import { LEVELS } from '../src/level.js';

const GOLDEN = 'db0e8493a98ac40e';   /* the flag-off trace hash of master's src/unburied-foes.js (85d152eb8) */
const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const HERE = dirname(fileURLToPath(import.meta.url)), MOD = pres(HERE, '../src/unburied-foes.js');
const L = LEVELS.find(l => l.id === 'unburied').build(), A0 = { x0: L.arena.x0, x1: L.arena.x1, floor: L.arena.floor };
const seeded = (s = 7) => { s = Math.imul(s, 2654435761) >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };

/* a chapel: the standards where main.js stands them (A.stdX from stdIn), a hero, his dead as plain objects */
function chapel(U, o = {}) {
  const S = U.UNB.bk, A = { ...A0, stdX: [A0.x0 + S.stdIn, A0.x1 - S.stdIn] }, X = (A.x0 + A.x1) / 2;
  const P = { x: X - 60, y: A.floor, face: 1, dead: false, dodge: 0, ...(o.P || {}) }, adds = [], hits = [], said = [];
  let cut = null; const W = { charge: 0, atk: -1, combo: 0 };
  const c = { P, A, hits, said, hit: (x, d, hard, name) => { hits.push({ d, hard, name }); return true; }, say: m => said.push(m), sound: () => {}, shake: () => {}, ring: () => {}, pull: () => {}, hook: () => {},
    struck: (x, y, w, h, q) => { if (cut && q === cut) { cut = null; return true; } return false; }, adds: e => adds.filter(q => q.from === e && q.alive),
    raise: (x, fl, who) => adds.push({ t: 'corpse', x, y: fl, alive: true, from: who, raisedBy: who, mode: 'riseTell', modeT: 1 }), cut: q => { q.alive = false; },
    dodging: () => P.dodge > 0, stand: () => false, rand: o.rand || seeded(o.seed || 7), heroWind: () => W };
  const e = { t: 'bloodknight', alive: true, x: X, y: A.floor, hp: U.UNB.hp.bloodknight, maxHp: U.UNB.hp.bloodknight, mode: 'stalk', modeT: 0, cd: 99, phase: 1, turn: 0, face: -1, anim: 0, ...(o.e || {}) };
  const step = (secs, f) => { for (let i = 0; i < Math.round(secs * 60); i++) { U.updateBloodKnight(e, 1 / 60, c); if (f && f()) return true; } return false; };
  return { U, S, A, X, P, e, c, adds, W, hits, said, step, cutPole: s => { cut = s; } };
}

/* the flag-off trace: a whole scripted fight - a hero who circles him, swings, charges heavies, cuts the standards on a clock, and blows that land - on a fixed seed */
async function trace(path, liftOn) {
  const U = await import(pathToFileURL(pres(path)).href + '?t=' + Date.now() + (liftOn ? 'on' : 'off')), was = globalThis.__BOSSLIFT; globalThis.__BOSSLIFT = !!liftOn;
  try { const h = createHash('sha1'), K = chapel(U, { seed: 1108 }), { e, P, W, A } = K;
    for (let i = 0; i < 60 * 240 && e.alive; i++) {
      P.x = Math.max(A.x0 + 20, Math.min(A.x1 - 20, e.x + Math.sin(i / 90) * 120 + (i % 700 < 200 ? -40 : 0))); P.face = Math.sign(e.x - P.x) || 1;
      W.charge = (i % 220) > 170 ? ((i % 220) - 170) / 60 : 0; W.atk = (i % 45) < 8 ? (i % 45) / 60 : -1; W.combo = (i / 45 | 0) % 3; P.dodge = (i % 500) < 15 ? 0.2 : 0;
      if (i % 600 === 300 && e.stds) { const s = e.stds.filter(q => q.up)[(i / 600 | 0) % 2]; if (s) { P.x = s.x - Math.sign(e.x - s.x) * 14; P.face = Math.sign(e.x - s.x) || 1; K.cutPole(s); } }
      if (i % 40 === 0 && Math.abs(P.x - e.x) < 70) { const d = U.bkHurt(e, 22, P.x); if (d > 0) e.hp -= d; if (e.hp <= 0) { e.alive = false; } }
      if (i % 900 === 0) for (const q of K.adds) q.alive = false;
      U.updateBloodKnight(e, 1 / 60, K.c);
      h.update([i, e.mode, e.x.toFixed(2), e.hp, e.phase, e.wardFill || 0, (e.stds || []).map(s => (s.up ? 1 : 0)).join(''), K.hits.length, K.adds.length, e.turn].join(';'));
    }
    h.update(JSON.stringify([e.breaks, e.stucks, e.passes, e.stdCuts, e.healed, e.spents, e.drains, K.said.length])); return h.digest('hex').slice(0, 16);
  } finally { globalThis.__BOSSLIFT = was; }
}

if (process.argv[2] === '--trace') { console.log(await trace(process.argv[3] || MOD, false)); process.exit(0); }

const U = await import(pathToFileURL(MOD).href);
const S = U.UNB.bk, LF = S.lift;
const lift = f => { const was = globalThis.__BOSSLIFT; globalThis.__BOSSLIFT = true; try { return f(); } finally { globalThis.__BOSSLIFT = was; } };
/* a chapel with the lift on, the standards stood (their first frame) */
const setup = (o = {}) => { const K = chapel(U, o); K.step(1 / 60); return K; };
const behind = (K, s, toward) => { K.P.x = s.x - toward * 14; K.P.face = toward; };   /* the hero on the pole's far side, facing him */

lift(() => {
  /* the switch, and where the poles stand */
  { const K = setup(); ok(U.bkLiftOn() && K.e.stds.length === 2, 'the lift is on and two standards stand');
    ok(Math.abs(K.e.stds[0].x - (K.A.x0 + LF.stdIn)) < 1e-9 && Math.abs(K.e.stds[1].x - (K.A.x1 - LF.stdIn)) < 1e-9, 'the poles stand lift.stdIn from the walls: ' + K.e.stds.map(s => s.x - K.A.x0)); }
  /* (a) the committed drag under a pole: cut it from the far side and it falls on him - PINNED, x openMul */
  { const K = setup(), { e } = K, s = e.stds[0]; e.x = s.x + 30; behind(K, s, 1);
    U.bkForce(e, 'cleave', K.c); K.step(S.tell.cleave - S.tell.commit + 0.03); ok(e.mode === 'cleaveTell' && e.committed && U.bkRooted(e), '(a) he commits the drag: rooted (' + e.mode + ', ' + e.committed + ')');
    K.cutPole(s); K.step(1 / 60); ok(!s.up && s.dir === 1 && s.fallT > 0, '(a) cut, the pole falls the way the blow travels');
    K.step(LF.fallT + 0.02, () => e.mode === 'pinned'); ok(e.mode === 'pinned' && e.pins === 1 && K.said.includes(U.BK_LIFT_SAY.pin), '(a) THE STANDARD FALLS ON HIM: pinned (' + e.mode + ')');
    ok(Math.abs(e.modeT - LF.pinT) < 0.05 && U.bkOpen(e), '(a) pinned lift.pinT s and OPEN: ' + e.modeT.toFixed(2));
    ok(U.bkHurt(e, 20, K.P.x) === Math.round(20 * S.openMul), '(a) a blow on him pinned takes x' + S.openMul);
    K.step(LF.pinT + 0.1); ok(e.mode !== 'pinned', '(a) the pin runs out: ' + e.mode); }
  /* (a) a ward standing under the falling pole BREAKS (breaks++) and he is pinned */
  { const K = setup(), { e } = K, s = e.stds[1]; e.x = s.x - 30; behind(K, s, -1); U.bkForce(e, 'ward', K.c); K.step(S.tell.ward + 0.02); ok(e.mode === 'ward' && !e.wardLock, '(a) he wards under the pole');
    const b0 = e.breaks || 0; K.cutPole(s); K.step(LF.fallT + 0.05, () => e.mode === 'pinned'); ok(e.mode === 'pinned', '(a) the ward under a falling pole: pinned (' + e.mode + ')'); ok((e.breaks || 0) === b0 + 1, '(a) and the ward BREAKS (breaks ' + b0 + ' -> ' + e.breaks + ')'); }
  /* (b) walking in the arc: he steps clear, no pin, the pole lies spent */
  { const K = setup(), { e } = K, s = e.stds[0]; e.x = s.x + 30; e.cd = 99; K.P.x = s.x - 100; K.P.face = 1;
    K.step(0.05); ok(e.mode === 'stalk' && !U.bkRooted(e), '(b) he walks (' + e.mode + ')'); e.x = s.x + 30; K.P.x = s.x - 14; K.cutPole(s);
    K.step(LF.fallT + 0.05); ok(e.mode !== 'pinned' && !e.pins && e.clears === 1 && K.said.includes(U.BK_LIFT_SAY.clear), '(b) HE STEPS CLEAR: ' + e.mode + ' pins ' + e.pins);
    ok(!s.up && !U.bkInArc(e, s, 1), '(b) the pole lies spent, and he stands out of its fall at ' + Math.round(e.x - s.x)); K.step(3); ok(!s.up, '(b) it stays down in phase one'); }
  /* (c) the blow facing away from him: it falls the other way */
  { const K = setup(), { e } = K, s = e.stds[0]; e.x = s.x + 30; K.P.x = s.x + 14; K.P.face = -1;
    U.bkForce(e, 'cleave', K.c); K.step(S.tell.cleave - S.tell.commit + 0.03); K.P.x = s.x + 14; K.P.face = -1; K.cutPole(s); K.step(LF.fallT + 0.05);
    ok(s.dir === -1 && !e.pins, '(c) cut facing away: it falls the other way, no pin (dir ' + s.dir + ', pins ' + e.pins + ')'); }
  /* (d) phase two: his dead bound to the standing poles; the LAST pole down and they all lie down for good; THE RED CALL leaves him */
  { const K = setup({ e: { phase: 2, surged: true, hp: U.UNB.hp.bloodknight * 0.45 } }), { e, adds } = K; e.x = K.X; K.P.x = K.X - 120;
    U.bkForce(e, 'call', K.c); K.step(S.tell.call * S.p2 + 0.05); ok(adds.length === S.call, '(d) THE RED CALL raises ' + S.call + ': ' + adds.length);
    K.step(1 / 60); ok(adds.every(q => q.boundTo === e.stds[0].x || q.boundTo === e.stds[1].x) && (e.binds || []).length === S.call, '(d) each bound to a standing pole: ' + adds.map(q => q.boundTo));
    K.cutPole(e.stds[0]); K.step(LF.fallT + 0.05); ok(adds.every(q => !q.laid), '(d) one pole down: they still stand');
    K.cutPole(e.stds[1]); K.step(LF.fallT + 0.05); ok(e.bannerDown && adds.every(q => q.laid && q.mode === 'down') && e.laidN === S.call && K.said.includes(U.BK_LIFT_SAY.last), '(d) THE LAST STANDARD FALLS: ' + adds.map(q => q.mode + ':' + !!q.laid));
    e.mode = 'stalk'; e.cd = 0; e.turn = S.orderP2.indexOf('call'); K.P.x = e.x - 40; const t0 = e.turn; K.step(1 / 60);
    ok(e.turn === t0 + 1 && e.mode !== 'callTell', '(d) the call is gone from his rotation (it is a string): ' + e.mode);
    e.raiseNext = true; e.mode = 'stalk'; e.cd = 0; K.step(1 / 60); ok(e.mode !== 'callTell', "(d) and the surge's own call too: " + e.mode); }
  /* (e) the surge stands them up once; the last fall in phase two is final */
  { const K = setup({ e: { hp: U.UNB.hp.bloodknight * (S.p2At - 0.01), cd: 9 } }), { e } = K; e.stds.forEach(s => { s.up = false; }); K.P.x = e.x - 60;
    K.step(1 / 60); ok(e.mode === 'surgeTell', '(e) the surge: ' + e.mode); K.step(S.tell.surge + 0.05); ok(e.stds.every(s => s.up), '(e) the surge stands the poles up again');
    for (const s of e.stds) { K.cutPole(s); K.step(LF.fallT + 0.05); } ok(e.bannerDown && e.stds.every(s => !s.up), '(e) both down in phase two');
    e.hp = U.UNB.hp.bloodknight * 0.2; K.step(20); ok(e.stds.every(s => !s.up), '(e) and they never rise again'); }
  /* (g) the boss rules: a pin pays at most pinTake of him, then he throws it off; outside an opening a blow lands whole (no shell) */
  { const K = setup(), { e } = K, s = e.stds[0]; e.x = s.x + 30; behind(K, s, 1); U.bkForce(e, 'cleave', K.c); K.step(S.tell.cleave - S.tell.commit + 0.03); K.cutPole(s); K.step(LF.fallT + 0.05, () => e.mode === 'pinned');
    let paid = 0, n = 0; while (e.mode === 'pinned' && n < 200) { const d = U.bkHurt(e, 30, K.P.x); ok(d >= 30, '(g) never less than whole while pinned: ' + d); paid += d; n++; K.step(1 / 60); }
    const cap = e.maxHp * LF.pinTake; ok(paid >= cap && paid <= cap + 30 * S.openMul, '(g) a pin pays about lift.pinTake of him: ' + paid + ' of cap ' + cap); ok(e.mode === 'wrench' && K.said.includes(U.BK_LIFT_SAY.off), '(g) then HE THROWS THE STANDARD OFF: ' + e.mode);
    const K2 = setup(), e2 = K2.e; e2.mode = 'stalk'; ok(U.bkHurt(e2, 17, e2.x - 30) === 17, '(g) FULL DAMAGE outside an opening, standards standing (no passive shell)'); }
  /* the told shadow: rooted under a pole he is told once */
  { const K = setup(), { e } = K, s = e.stds[0]; e.x = s.x + 30; K.P.x = s.x - 60; U.bkForce(e, 'ward', K.c); K.step(S.tell.ward + 0.05); K.step(0.5);
    ok(e.under === 0 && K.said.filter(m => m === U.BK_LIFT_SAY.under).length === 1, '(a) HE STANDS UNDER HIS STANDARD, said once: ' + e.under); }
});

/* (f) FLAG OFF is the live fight */
{ const off = await trace(MOD, false), on = await trace(MOD, true);
  ok(off === GOLDEN, '(f) the flag-off trace ' + off + " is not master's " + GOLDEN);
  ok(on !== off, '(f) the flag-on trace hashes the same as flag-off - the check has no teeth');
  ok(!U.BOSSLIFT_DK_SHIPS, '(f) BOSSLIFT_DK_SHIPS is OFF (a release lane flips it after art + n=6)');
  const K = chapel(U); K.step(1 / 60); ok(K.e.stds[0].x === K.A.x0 + S.stdIn, '(f) flag off, the poles stand where they did (stdIn ' + S.stdIn + ')'); }
/* (f/h) the hooks: every dklift line in main.js and lab.js is gated */
{ const main = readFileSync(pres(HERE, '../src/main.js'), 'utf8').split('\n').filter(l => l.includes('(claude/dklift)'));
  ok(main.length === 1 && /e\.mode === 'pinned'/.test(main[0]), '(f) main.js: one dklift hook, reached only by the lift-only pinned mode: ' + main.length);
  const lab = readFileSync(pres(HERE, '../src/lab.js'), 'utf8');
  ok(/dkLift = !!\(dkU && dkU\.bkLiftOn && dkU\.bkLiftOn\(\)\)/.test(lab) && /const topple = dkLift &&/.test(lab) && /const lure = dkLift &&/.test(lab), '(h) lab.js: topple and lure are behind bkLiftOn()'); }

if (bad.length) { console.error('dk-topple FAILED:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log("ok  dk-topple (claude/dklift) TOPPLE THE STANDARD: pinned on a rooted fall, steps clear, falls the blow's way, P2 dead lie down + call gone, surge once, pin cap, flag-off = master");
