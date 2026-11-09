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

const GOLDEN = '__GOLDEN__';   /* the flag-off trace hash of master's src/unburied-foes.js (85d152eb8) */
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
