/* tools/frog-fly.mjs - THE BULLFROG KING'S SIGNATURE MOMENT, "BITE HIS OWN FLY" (claude/froglift; scratch/brief-bosslift-1108.md 1, plan scratch/lane-reports/bosslift-plan.md).
   Node only, no page. It drives src/frog-king.js's court (makeFrogCourt) on the real marsh court (src/level.js), the way updateFrog runs it (step, then his clock,
   then his lift modes), and reads src/main.js for the hooks. It fails when:
     (a) a swat in range does not run snap -> GULP -> BLOAT -> BELLY-UP (x FK.bellow.mul, FK.fly.belly[ph] s) with selfBites++; or phase 2 does not tip him to his pad's edge
     (b) a swat out of range, or while he gathers / is in the air, bats the cloud - it must scatter and re-form on the hero
     (c) the leaves beside his pad do not rise FIRM on belly-up, or do not sink back (their own kind) after FK.fly.belly + FK.fly.lift
     (d) the BELLOW's sac burst still gives belly-up with the flag on (it must be a DAZE, x FK.dazed)
     (e) FLAG OFF is not the live fight: every froglift line in src/main.js is gated (FLIFT_ON() or a lift-only mode), and a fixed-seed trace of the court and
         the bot's hands with the flag off matches master's src/frog-king.js (GOLDEN; regenerate with: node tools/frog-fly.mjs --trace <path-to-frog-king.js>)
     (f) the bot's hands (frogPlan - the co-op AI partner runs it too) do not swat the cloud at him in at least 4 of 6 seeds
     (g) a boss rule broke: he is never totally invulnerable (0.6x / 0.4x outside openings stay), the swarm comes round at least every FK.fly.every[ph] s
   node tools/frog-fly.mjs */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve as pres } from 'node:path';
import { LEVELS, TS } from '../src/level.js';

const GOLDEN = '8fe7ede8abab49aa';   /* the flag-off trace hash of master's src/frog-king.js (85d152eb8) */
const bad = [], ok = (c, m) => { if (!c) bad.push(m); }, out = [];
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const lv = LEVELS.find(l => l.id === 'marsh'), L = lv.build(), A = L.arena;

/* the court as main.js builds it: the lane leaves as movers (main.js case 'pad'), a hero, the King on a royal pad */
function world(K, opts = {}) {
  const movers = L.ents.filter(e => e.t === 'pad' && e.x * TS >= A.x0 && e.x * TS < A.x1).map(e => { const px = e.x * TS + 8, py = (e.y + 1) * TS, pw = e.big ? 32 : 24; return { kind: 'pad', x0: px - pw / 2, x: px - pw / 2, y0: py - 2, y: py - 2, w: pw, h: 6, sink: 0, firm: !!e.firm }; });
  const st = opts.st ?? 0, r = A.royal[st];
  const P = { x: r.cx - 40, y: A.floor, face: 1, st: 100, dead: false, ground: true, block: false, atk: -1, onMover: null };
  const e = { t: 'frog', x: r.cx, y: A.floor, w: 40, h: 30, face: -1, alive: true, hp: 800, maxHp: 800, mode: 'idle', modeT: 1, st, phase: opts.p2 ? 2 : 1, actN: 0 };
  let time = 0; const said = [];
  const C = K.makeFrogCourt({ P: () => P, heroes: () => [P], riders: () => [P.onMover], splash: () => {}, time: () => time, movers: () => movers, arena: () => A, boss: () => (e.alive ? e : null),
    damage: () => {}, ring: () => {}, number: (x, y, t) => said.push(t), buzz: () => {}, spring: () => {} });
  const fx = { number: (x, y, t) => said.push(t), burst: () => {}, shake: () => {}, hitstop: () => {}, sfx: () => {} };
  /* one frame the way updateFrog orders it: the court steps, his clock runs, a lift mode runs its case (src/main.js case 'flyEye': ...) */
  const frame = (dt = 1 / 60) => { time += dt; C.step(dt, e); e.modeT -= dt; if (K.FROG_LIFT_MODES && K.FROG_LIFT_MODES.has(e.mode)) C.mode(e, dt, e.phase >= 2 ? 1 : 0, fx); else if (e.mode === 'bellyUp' || e.mode === 'dazed') { if (e.modeT <= 0) { e.mode = 'idle'; e.modeT = 0.8; } } };
  const run = (s, until) => { for (let i = 0; i < s * 60; i++) { frame(); if (until && until()) return true; } return false; };
  const blade = () => (P.face > 0 ? { l: P.x + 2, r: P.x + 30, t: P.y - 24, b: P.y } : { l: P.x - 30, r: P.x - 2, t: P.y - 24, b: P.y });
  return { K, C, P, e, movers, said, frame, run, blade, fx, get time() { return time; } };
}
const lanePads = (W, st) => W.movers.filter(m => [A.lanes[st], A.lanes[st + 1]].filter(Boolean).some(l => m.x + m.w / 2 > l.x0 && m.x + m.w / 2 < l.x1));

/* the flag-off trace: the court (flies trailing, reshuffles, the flop's wave) and the bot's hands, on a fixed seed */
async function trace(path) {
  const K = await import(pathToFileURL(pres(path)).href + '?t=' + Date.now()), rnd = Math.random; Math.random = mulberry(1108); const h = createHash('sha1');
  try {
    const W = world(K), { C, P, e } = W, rng = mulberry(7), mem = {}; const F = () => { const s = C.show(); return { A, royal: A.royal, lanes: A.lanes, pads: W.movers.map((m, i) => ({ id: i, x: m.x + m.w / 2, w: m.w, sink: m.sink, firm: m.firm, slap: m.slapT > 0, shuf: !!m.shufTo })), swarm: s.swarm ? { x: s.swarm.x, y: s.swarm.y, t: s.swarm.t } : null, reel: false, tongueMax: 175, waves: [] }; };
    const modes = ['idle', 'swarm', 'snapTell', 'tongueTell', 'spitTell', 'flopTell', 'crouch', 'leap', 'bellowTell', 'bellyUp', 'dazed', 'land'];
    for (let i = 0; i < 1800; i++) {
      if (i % 300 === 0) { C.spitSwarm(e); e.actN++; }
      if (i % 450 === 200) C.reshuffle(e.phase >= 2 ? 1 : 0, rng);
      if (i % 240 === 120) C.waveOver({ x: e.x + (i % 480 ? -60 : 60), flop: true }, 1 / 60);
      if (i % 37 === 0) { e.mode = modes[(i / 37) % modes.length | 0]; e.modeT = 0.4; e.tst = 1; }
      P.x += Math.sin(i / 40) * 1.5; W.frame();
      if (C.bat) C.bat(W.blade(), P);   /* the swat hook is a no-op with the flag off */
      const pl = K.frogPlan({ P: { x: P.x, y: P.y, vy: 0, face: P.face, ground: true, swim: false, atk: -1, onPad: false, padSink: 0 }, e, F: F(), reach: 30, shield: i % 2 === 0, deflect: false, ward: false, rest: false, t: i / 60, rng, mem, eyes: false });
      const sw = C.swarm; h.update([i, e.mode, sw ? sw.x.toFixed(2) + ',' + sw.y.toFixed(2) + ',' + sw.t.toFixed(3) : '-', W.movers.map(m => m.x + ':' + m.firm + ':' + (m.slapT > 0 ? 1 : 0)).join('|'), pl.gx === null ? 'n' : Math.round(pl.gx), pl.face, pl.atk, pl.jump, pl.block, pl.why].join(';'));
    }
    h.update(JSON.stringify(C.n)); return h.digest('hex').slice(0, 16);
  } finally { Math.random = rnd; }
}
if (process.argv[2] === '--trace') { console.log(await trace(process.argv[3])); process.exit(0); }

const K = await import('../src/frog-king.js'), FK = K.FK;
const lift = on => { globalThis.__BOSSLIFT = on; };

/* (e) FLAG OFF */
lift(false);
ok(K.BOSSLIFT_FROG_SHIPS === false, 'BOSSLIFT_FROG_SHIPS ships ON: the release lane flips it after the art + n=6 tune');
ok(!K.frogLiftOn(), 'the lift is on with the flag off and no ?bosslift');
const tr = await trace('src/frog-king.js'); ok(GOLDEN === 'PENDING' || tr === GOLDEN, 'flag OFF: the court/bot trace ' + tr + ' is not master\'s ' + GOLDEN + ' (the live fight changed)'); out.push('off-trace ' + tr + (tr === GOLDEN ? ' = master' : ''));
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), tagged = src.split(/\r?\n/).filter(l => /\(claude\/froglift\)/.test(l));
ok(tagged.length >= 8 && tagged.length <= 12, 'src/main.js carries ' + tagged.length + ' froglift lines (the lane keeps main.js to single hook lines: 8-12)');
for (const l of tagged) { const code = l.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const gated = /FLIFT_ON\(\)/.test(code) || /^case 'flyEye': case 'flySnap': case 'gulp': case 'bloat':/.test(code) || /^if \(e\.tipX !== undefined && e\.mode === 'bellyUp'\)/.test(code) || /^Object\.assign\(FROG_FRAME, FROG_LIFT_FRAMES\);$/.test(code) || /^import \{ frogLiftOn as FLIFT_ON, FROG_LIFT_FRAMES \} from '\.\/frog-king\.js';$/.test(code) || /^const FROG_LIFT_FX = /.test(code);
  ok(gated, 'an ungated froglift line in src/main.js: ' + code.slice(0, 120)); }
const frogSrc = src.slice(src.indexOf('// ---------- boss: the Bullfrog King'), src.indexOf('function frogStir('));   /* (another boss has a 'gulp' of his own) */
for (const m of K.FROG_LIFT_MODES) { const sets = [...frogSrc.matchAll(new RegExp("e\\.mode = '" + m + "'", 'g'))].length; ok(sets === 0, 'src/main.js sets the lift-only mode ' + m + ' itself (only src/frog-king.js may, behind the flag)'); }
ok(!/e\.tipX\s*=[^=]/.test(src), 'src/main.js sets tipX (only the flag-gated belly-up may)');
{ const W = world(K); W.C.spitSwarm(W.e); W.P.x = W.C.swarm.x; ok(W.C.bat(W.blade(), W.P) === false && !W.C.swarm.home, 'flag OFF: a swat bats the cloud'); W.e.flyT = 99; W.run(1); ok(W.e.flyT === 99, 'flag OFF: the flies\' clock runs'); }
/* the switch: ?bosslift / globalThis.__BOSSLIFT */
lift(true); ok(K.frogLiftOn(), 'globalThis.__BOSSLIFT does not switch the lift on');
ok(/\[\?&\]bosslift\(=\|&\|\$\)/.test(readFileSync(new URL('../src/frog-king.js', import.meta.url), 'utf8')), 'no ?bosslift URL switch in src/frog-king.js');

/* (a) A SWAT IN RANGE -> snap -> GULP -> BLOAT -> BELLY-UP */
for (const p2 of [false, true]) {
  const W = world(K, { st: 1, p2 }), { C, P, e } = W, ph = p2 ? 1 : 0; C.spitSwarm(e); W.run(0.6); const b0 = C.n.selfBites;
  P.face = Math.sign(C.swarm.x - P.x) || 1; const r = C.bat(W.blade(), P);
  ok(r === 'bat' && C.swarm && C.swarm.home, (p2 ? 'P2: ' : '') + 'a swat on the cloud ' + Math.round(Math.abs(C.swarm ? C.swarm.x - e.x : 0)) + ' px from him did not bat it (' + r + ')');
  const seen = []; W.run(3, () => { if (seen[seen.length - 1] !== e.mode) seen.push(e.mode); return e.mode === 'bellyUp'; });
  ok(seen.join('>').includes('flyEye>flySnap>gulp>bloat>bellyUp'), (p2 ? 'P2: ' : '') + 'the swat did not run eyes > snap > gulp > bloat > belly-up: ' + seen.join('>'));
  ok(C.n.selfBites === b0 + 1 && C.n.flyBellies === 1 && !C.swarm, 'the bite was not counted (selfBites ' + C.n.selfBites + ', flyBellies ' + C.n.flyBellies + ')');
  ok(Math.abs(e.modeT - FK.fly.belly[ph]) < 0.05 && e.openHp0 === e.hp, 'belly-up is not FK.fly.belly[' + ph + '] s from full: ' + e.modeT.toFixed(2));
  ok(W.said.includes('HE BITES HIS OWN FLY') && W.said.includes('BELLY-UP: CUT HIM') && W.said.includes('SWAT!'), 'the moment is not said: ' + W.said.join(' / '));
  const r1 = A.royal[1];
  if (p2) ok(e.tipX === r1.x0 || e.tipX === r1.x1, 'P2: his pad did not tip him to its edge (tipX ' + e.tipX + ')'); else ok(e.tipX === undefined, 'P1: his pad tipped');
  out.push((p2 ? 'P2 ' : 'P1 ') + seen.join('>') + ' in ' + seen.length + ' modes');
}
/* the old route still counts: led onto his head as his tongue came (main.js's snapTell hook) -> GULP */
{ const W = world(K), { C, e } = W; C.spitSwarm(e); C.bite(e, 'lead', W.fx); ok(e.mode === 'gulp' && C.n.lastBite === 'lead', 'the led route does not gulp'); W.run(1.2); ok(e.mode === 'bellyUp', 'the led route did not roll him belly-up: ' + e.mode); }
ok(/if \(FLIFT_ON\(\)\) \{ FKC\.bite\(e, 'lead', FROG_LIFT_FX\); break; \}/.test(src), 'src/main.js snapTell does not route the led flies to the gulp');

/* (b) A SWAT OUT OF RANGE, OR WHILE HE GATHERS / FLIES, MISSES: the cloud scatters and re-forms on the hero */
for (const [why, set] of [['far', W => { W.P.x = W.e.x - FK.fly.reach - 60; }], ['away', W => { W.e.mode = 'crouch'; W.e.modeT = 5; }], ['away', W => { W.e.mode = 'leap'; W.e.modeT = 5; }]]) {
  const W = world(K), { C, P } = W; set(W); C.spitSwarm(W.e); W.run(1.2); if (W.e.mode === 'crouch' || W.e.mode === 'leap') W.e.modeT = 5;
  P.face = Math.sign(C.swarm.x - P.x) || 1; const r = C.bat(W.blade(), P);
  ok(r === why && !C.swarm.home && C.swarm.scatter > 0, 'a swat (' + why + ') batted the cloud or did not scatter it: ' + r);
  ok(C.bat(W.blade(), P) === false, 'a scattered cloud can be swatted again at once');
  W.e.mode = 'idle'; W.e.modeT = 99; W.run(FK.fly.reform + 0.8); const d = Math.hypot(C.swarm.x - P.x, C.swarm.y - (P.y - 12));
  ok(d < FK.swarm.onR, 'the scattered cloud (' + why + ') did not re-form on the hero (' + d.toFixed(1) + ' px)'); ok(W.e.mode === 'idle' && C.n.selfBites === 0, 'a missed swat bit him');
}
/* a batted cloud as he gathers to leap: the flies miss and come back */
{ const W = world(K), { C, P, e } = W; e.mode = 'flopTell'; e.modeT = 9; C.spitSwarm(e); W.run(0.6); P.face = Math.sign(C.swarm.x - P.x) || 1; C.bat(W.blade(), P); W.run(0.2); ok(C.swarm.home && e.mode === 'flopTell', 'a batted cloud broke his flop tell (it must wait at his lips)');
  e.mode = 'crouch'; W.run(0.1); ok(!C.swarm.home && C.n.lastScatter === 'away', 'a batted cloud still flew at him as he gathered to leap'); }
/* the shield bats too */
{ const W = world(K), { C, P, e } = W; C.spitSwarm(e); W.run(0.6); P.x = C.swarm.x - 6; P.y = C.swarm.y + 12; P.face = 1; P.block = true; ok(C.bat(null, P) === 'bat', 'a raised shield on the cloud does not bat it'); }

/* (c) THE POND LIFTS THE LEAVES */
{ const W = world(K, { st: 1 }), { C, P, e } = W, ls = lanePads(W, 1), others = W.movers.filter(m => !ls.includes(m)), kinds = ls.map(m => m.firm);
  ok(ls.length >= 8, 'lanes either side of royal pad II hold ' + ls.length + ' leaves');
  ls[0].slapT = 0.8; ls[1].shufTo = { x: ls[1].x + 10, firm: false }; ls[1].slapT = 0.5;
  C.spitSwarm(e); W.run(0.5); P.face = Math.sign(C.swarm.x - P.x) || 1; C.bat(W.blade(), P); W.run(3, () => e.mode === 'bellyUp');
  ok(ls.every(m => m.firm && m.liftT > 0 && !(m.slapT > 0) && !m.shufTo), 'the leaves beside his pad did not all rise firm on belly-up');
  ok(others.every(m => !(m.liftT > 0)), 'a leaf away from his pad rose');
  ok(W.said.includes('THE POND LIFTS THE LEAVES'), 'the lift is not said');
  C.waveOver({ x: ls[2].x + ls[2].w / 2, flop: true }, 1 / 60); ok(!(ls[2].slapT > 0), 'the flop\'s wave sank a risen leaf');
  W.run(FK.fly.belly[0] + FK.fly.lift - 0.4); ok(ls.every(m => m.firm), 'a leaf sank before belly + lift');
  W.run(0.6); ok(ls.every((m, i) => !(m.liftT > 0) && m.firm === (i === 1 ? false : kinds[i])), 'the leaves did not go back to their own kind after the lift: ' + ls.map(m => m.firm).join(','));
  out.push('lift ' + ls.length + ' leaves for ' + (FK.fly.belly[0] + FK.fly.lift) + ' s'); }
/* a reshuffle during the lift ends it (never a stale kind) */
{ const W = world(K, { st: 1 }), ls = lanePads(W, 1); W.C.liftLeaves(1, 5); W.C.reshuffle(0, mulberry(3)); ok(ls.every(m => !(m.liftT > 0)), 'a reshuffle left leaves lifted'); }

/* (d) THE SAC'S BURST IS A DAZE */
{ const W = world(K), { C, e } = W; e.mode = 'bellyUp'; e.modeT = FK.bellow.belly; C.sacDaze(e); ok(e.mode === 'dazed' && e.modeT === FK.fly.sacDaze && e.openHp0 === e.hp, 'the sac burst is not a DAZE: ' + e.mode); }
{ const fb = src.slice(src.indexOf('function frogBurst('), src.indexOf('function frogStir(')); ok(/if \(FLIFT_ON\(\) && FKC\) FKC\.sacDaze\(e\);/.test(fb), 'frogBurst does not turn the burst into a daze with the flag on'); }
ok(FK.dazed >= 1.4 && FK.take <= 0.05, 'the daze is not x1.5 / take 0.045');

/* (g) BOSS RULES: never invulnerable; the flies come round */
ok(FK.guard >= 0.4 && FK.air >= 0.4, 'a blow outside his openings lands under 0.4x');
ok(/FLIFT_ON\(\) && !swarmUp && \(e\.flyT \|\| 0\) >= FROGK\.fly\.every\[ph\]/.test(src), 'updateFrog idle does not spit the flies when FK.fly.every is due');
{ const W = world(K), { C, e } = W; W.run(FK.fly.every[0] + 0.1); ok(e.flyT >= FK.fly.every[0], 'the flies\' clock does not run with no cloud out: ' + e.flyT); C.spitSwarm(e); ok(e.flyT === 0, 'a swarm does not restart the flies\' clock'); }
{ const W = world(K, { p2: true }), { C, P, e } = W; e.mode = 'land'; e.landAt = 5; W.run(0.05); ok(!!C.swarm, 'P2: he does not spit the flies as he lands'); ok(Math.abs(C.swarm.t - (FK.swarm.life + FK.fly.p2stick) + 0.05) < 0.02, 'P2: the cloud does not stick FK.fly.p2stick longer');
  P.x = C.swarm.x; P.y = C.swarm.y + 12; P.st = 100; C.swarm.x = P.x; C.swarm.y = P.y - 12; const st0 = P.st; W.frame(); ok(Math.abs((st0 - P.st) - (FK.fly.p2drain - FK.swarm.drain) / 60) < 1e-6, 'P2: the cloud does not sap the extra stamina'); }

/* (f) THE BOT'S HANDS: frogPlan swats the cloud at him, a reaction late, in at least 4 of 6 seeds - and the swing it makes bats it */
let seeds = 0; const whys = {};
for (let seed = 1; seed <= 6; seed++) {
  const W = world(K, { st: 1 }), { C, P, e } = W, rng = mulberry(seed * 101), mem = {}; let swatted = false;
  for (let k = 0; k < 3 && !swatted; k++) { C.swarm = null; C.spitSwarm(e); e.actN++; W.run(0.7);
    for (let f = 0; f < 90 && !swatted; f++) { const s = C.show();
      const F = { A, royal: A.royal, lanes: A.lanes, pads: [], swarm: s.swarm, reel: false, tongueMax: 175, waves: [] };
      const pl = K.frogPlan({ P: { x: P.x, y: P.y, vy: 0, face: P.face, ground: true, swim: false, atk: P.atk, onPad: false, padSink: 0 }, e, F, reach: 30, shield: false, deflect: false, ward: false, rest: false, t: f / 60, rng, mem, eyes: false });
      whys[pl.why] = (whys[pl.why] || 0) + 1;
      if (pl.atk) { P.face = pl.face; if (C.bat(W.blade(), P) === 'bat') swatted = true; }
      W.frame(); } }
  if (swatted) seeds++; }
ok(seeds >= 4, 'the bot swatted the flies at him in ' + seeds + '/6 seeds (' + JSON.stringify(whys) + ')'); out.push('bot swats ' + seeds + '/6');
lift(false);

if (bad.length) { console.log('frog-fly FAIL\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('frog-fly ok  ' + out.join('; '));
