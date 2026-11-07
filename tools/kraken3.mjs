/* tools/kraken3.mjs - THE KRAKEN 3: THE RAFT (claude/kraken3). NODE ONLY (no browser, no page): drives src/kraken3.js's pure state with a stub world -
   a 1-D hero (or 1-4 seats) that walks, jumps, ducks, holds UP and swings - and asserts the fight's rules:
     the drift's timeline and its four-way told return; the face never below 0.4x while it can be struck and OPEN only when every pinning arm is cut
     (and paid out at its cap, then WARDED); the raft never below its floor; a hero in the sea comes back (spare blow, never a death); the repair;
     the ink never on a hero's plank; per-seat counts (arms, kraklings, barnacles); the checkpoint resume; the lab advice beats it and a mash does worse.
   The browser fight (main.js wiring, the art, the lab bot in the page) is OWED: see scratch/lane-reports/kraken3.md.
   Run: node tools/kraken3.mjs [--quiet] */
import { KR3, k3New, k3Step, k3HitFace, k3HitArm, k3HitKrak, k3PopBarn, k3Advice, inkSpans, standing, extent, plankX, faceMul, faceHittable, hitPlank, mulberry, seatsOf, k3Read, gapNear } from '../src/kraken3.js';

const quiet = process.argv.includes('--quiet');
let ok = 0, bad = 0; const fails = [];
const check = (cond, what) => { if (cond) ok++; else { bad++; fails.push(what); } };
const log = (...a) => { if (!quiet) console.log(...a); };
const DT = 1 / 60;
const COOP_HP = [1, 1.6, 2.1, 2.6];   /* a stand-in for AIC.coopMulOf: his bar grows with the seats */

/* ---------- a stub hero ---------- */
function mkHero(i, x, o = {}) { return { i, x, y: 0, vy: 0, air: false, duck: false, dead: false, swim: false, hold: false, hp: o.hp || 265, max: o.hp || 265, flasks: o.flasks ?? 3, speed: o.speed || 85, reach: o.reach || 22, dmg: o.dmg || 16, swing: 0, taken: 0, falls: 0, kx: 0, mash: !!o.mash, inSea: false }; }
function heroView(h) { return { i: h.i, x: h.x, y: h.y, air: h.air, duck: h.duck, dead: h.dead, swim: h.swim, hold: h.hold }; }

/* ---------- one fight from the raft's start (phase 2 bar = 35% of him) ---------- */
export function run({ seed = 1, seats = 1, mash = false, speed = 85, dmg = 16, maxT = 240, resume = false, trace = null } = {}) {
  const rnd = mulberry(seed), maxHp = Math.round(670 * COOP_HP[seats - 1]), hp0 = Math.round(maxHp * KR3.p2At);
  const S = k3New({ seats, maxHp, hp: hp0, resume, rnd }); let hp = hp0;
  const W0 = KR3.planks * KR3.plankW, heroes = Array.from({ length: seats }, (_, i) => mkHero(i, W0 / 2 - 20 + i * 14, { speed, dmg, mash }));
  const st = { won: false, t: 0, minMul: 9, minStanding: 99, openings: 0, openBad: 0, hurts: {}, deaths: 0, events: [], order: [], seaBack: 0, spareOk: true, lashed: 0, inkBad: 0, faceDmg: 0, armCuts: 0, wave: 0, notTold: 0 };
  let boarded = false;
  for (let f = 0; f < maxT / DT; f++) {
    const t = f * DT; st.t = t;
    for (const h of heroes) { if (h.dead) continue;
      /* the advice drives the hero (the mash hero stands at the face's edge and swings, nothing else) */
      const a = mash ? { goal: S.st === 'p2' ? (S.face.side > 0 ? extent(S).x1 - 8 : extent(S).x0 + 8) : h.x, strike: S.st === 'p2' ? (S.face.side > 0 ? extent(S).x1 + KR3.face.reach - 14 : extent(S).x0 - KR3.face.reach + 14) : null, kind: 'face' } : k3Advice(S, heroView(h));
      h.hold = !!a.up; h.duck = !!a.duck && !h.air;
      if (a.jump && !h.air && !h.inSea) { h.vy = -260; h.air = true; }
      if (!h.inSea && !h.duck && !h.hold && a.goal !== null && Math.abs(a.goal - h.x) > 2) h.x += Math.sign(a.goal - h.x) * Math.min(Math.abs(a.goal - h.x), h.speed * DT);
      h.x += h.kx * DT; h.kx *= 0.85;
      if (h.air) { h.vy += 900 * DT; h.y += h.vy * DT; if (h.y >= 0 && !h.inSea) { const ex = extent(S); const onP = S.planks[Math.floor(h.x / KR3.plankW)]; if (h.x >= ex.x0 && h.x < ex.x1 && onP && onP.st !== 'gone') { h.y = 0; h.vy = 0; h.air = false; } else h.inSea = true; } }
      else if (!h.inSea) { const onP = S.planks[Math.floor(h.x / KR3.plankW)]; if (!onP || onP.st === 'gone') { h.air = true; h.vy = 20; } }
      if (h.inSea) { h.y = Math.min(h.y + 60 * DT, 30); h.swim = h.y > KR3.sea.below; }
      /* the blow */
      h.swing -= DT;
      if (a.strike !== null && a.strike !== undefined && h.swing <= 0 && !h.inSea && Math.abs(a.strike - h.x) <= h.reach + 4) { h.swing = 0.45;
        if (a.kind === 'face' && faceHittable(S)) { const m = faceMul(S); st.minMul = Math.min(st.minMul, m); const d = k3HitFace(S, h.dmg); hp = Math.max(0, hp - d); st.faceDmg += d; }
        else if (a.kind === 'arm') { const arm = S.arms.filter(q => q.st === 'pin' || q.st === 'lashTell' || q.st === 'lash').sort((p, q) => Math.abs(p.x - h.x) - Math.abs(q.x - h.x))[0]; if (arm && Math.abs(arm.x - h.x) <= h.reach + 4) k3HitArm(S, arm.id, h.dmg); }
        else if (a.kind === 'krak') { const k = S.kraks.filter(q => q.st !== 'dead').sort((p, q) => Math.abs(p.x - h.x) - Math.abs(q.x - h.x))[0]; if (k && Math.abs(k.x - h.x) <= h.reach + 4) k3HitKrak(S, k.id, h.dmg); }
        else if (a.kind === 'barn') k3PopBarn(S, h.x - h.reach, h.x + h.reach); }
      /* a flask at a third of his health, as a player drinks */
      if (h.hp < h.max * 0.34 && h.flasks > 0) { h.flasks--; h.hp = Math.min(h.max, h.hp + Math.round(h.max * 0.45)); }
    }
    if (faceHittable(S)) st.minMul = Math.min(st.minMul, faceMul(S));
    const ev = k3Step(S, DT, { heroes: heroes.map(heroView), hp });
    for (const e of ev) {
      if (e.t === 'state') st.order.push(e.st);
      if (e.t === 'say' && ['THE SEA GOES QUIET', 'THE ROAD GOES', 'THE RAFT', 'BUBBLES...', 'SOMETHING UNDER THE RAFT', 'THE DECK SHAKES', 'THE KRAKEN'].includes(e.text)) st.order.push(e.text);
      if (e.t === 'board') { boarded = true; for (const h of heroes) { h.x = W0 / 2 - 20 + h.i * 14; h.y = 0; h.air = false; h.inSea = false; } }
      if (e.t === 'hurt') { const h = heroes[e.i]; st.hurts[e.name] = (st.hurts[e.name] || 0) + 1; h.hp -= e.dmg; h.taken += e.dmg; h.kx += e.knock || 0; if (h.hp <= 0) { h.dead = true; st.deaths++; } }
      if (e.t === 'push') heroes[e.i].x += e.vx * DT;
      if (e.t === 'block') heroes[e.i].x = e.x;
      if (e.t === 'sea') heroes[e.i].falls++;
      if (e.t === 'back') { const h = heroes[e.i], cost = Math.round(h.max * e.cost); h.hp = Math.max(1, h.hp - cost); h.taken += cost; h.x = e.x; h.y = 0; h.vy = 0; h.air = false; h.inSea = false; h.swim = false; st.seaBack++; if (h.hp <= 0) st.spareOk = false; }
      if (e.t === 'open') { st.openings++; if (S.arms.some(a => a.st !== 'cut' && a.st !== 'gone')) st.openBad++; }
      if (e.t === 'cut') st.armCuts++;
      if (e.t === 'lashed') st.lashed++;
      if (trace) trace(t, e);
    }
    st.minStanding = Math.min(st.minStanding, standing(S));
    if (S.ink) { for (const [a, b] of inkSpans(S, heroes.filter(h => !h.dead).map(h => h.x))) for (const h of heroes) if (!h.dead) { const c = Math.floor(h.x / KR3.plankW); if (b > (c - 1) * KR3.plankW && a < (c + 2) * KR3.plankW) st.inkBad++; } }
    st.wave = S.wave;
    if (S.st === 'p2' && hp <= 0) { st.won = true; break; }
    if (heroes.every(h => h.dead)) break;
  }
  st.taken = heroes.reduce((n, h) => n + h.taken, 0); st.falls = heroes.reduce((n, h) => n + h.falls, 0); st.boarded = boarded; st.hpLeft = hp; st.hp0 = hp0; st.read = k3Read(S);
  return st;
}

/* ---------- 1. THE DRIFT: its order, told four ways, then the face ---------- */
{ const r = run({ seed: 3 }); const want = ['THE SEA GOES QUIET', 'road', 'THE ROAD GOES', 'fade', 'THE RAFT', 'drift', 'BUBBLES...', 'SOMETHING UNDER THE RAFT', 'THE DECK SHAKES', 'p2', 'THE KRAKEN'];
  const got = r.order.filter(x => want.includes(x)); let k = 0; for (const x of got) if (x === want[k]) k++;
  check(k === want.length, 'drift order: ' + got.join(' > '));
  check(r.boarded, 'everyone boards the raft at the fade');
  log('drift order', got.join(' > ')); }
/* checkpoint: a death on the raft comes back to THE ROAD (no sink), bar unchanged */
{ const S = k3New({ maxHp: 670, hp: 234, resume: true, rnd: mulberry(1) }); check(S.st === 'road', 'resume starts at the road (A10 checkpoint)'); }

/* ---------- 2. THE INTERLUDE's hazards hit a standing hero, not one who answers them ---------- */
{ const S = k3New({ maxHp: 670, hp: 234, rnd: mulberry(5) }); let t = 0; const hits = { stand: {}, ans: {} };
  /* two heroes: 0 stands still, 1 jumps every wreck and ducks every rock (perfect answers) */
  const h0 = { i: 0, x: 100, y: 0, air: false, duck: false }, h1 = { i: 1, x: 140, y: 0, air: false, duck: false };
  while (S.st !== 'p2' && t < 40) { t += DT; const w = S.obst.find(o => o.k === 'wreck' && Math.abs(o.x - h1.x) < 40), rk = S.obst.find(o => o.k === 'rock' && Math.abs(o.x - h1.x) < 40);
    h1.air = !!w; h1.y = w ? -12 : 0; h1.duck = !!rk && !w;
    for (const e of k3Step(S, DT, { heroes: [h0, h1].map(h => ({ ...h, dead: false, swim: false, hold: false })), hp: 234 })) if (e.t === 'hurt') (e.i === 0 ? hits.stand : hits.ans)[e.name] = ((e.i === 0 ? hits.stand : hits.ans)[e.name] || 0) + 1; }
  check((hits.stand.WRECKAGE || 0) >= 2 && (hits.stand['A ROCK'] || 0) >= 1, 'a hero who stands is struck by the wreckage and the rock ' + JSON.stringify(hits.stand));
  check(!hits.ans.WRECKAGE && !hits.ans['A ROCK'], 'a hero who jumps the wreckage and ducks the rock is not ' + JSON.stringify(hits.ans));
  check(t >= KR3.drift.len, 'the drift lasts its ' + KR3.drift.len + ' s'); }
/* the kraklings pry planks if left alone - and never below the floor */
{ const S = k3New({ maxHp: 670, hp: 234, seats: 4, rnd: mulberry(9) }); let t = 0, pried = 0, kmax = 0;
  while (S.st !== 'p2' && t < 40) { t += DT; for (const e of k3Step(S, DT, { heroes: [{ i: 0, x: 128, y: 0 }], hp: 234 })) if (e.t === 'gone') pried++; kmax = Math.max(kmax, S.kraks.length); }
  check(pried >= 2, 'kraklings left alone take planks (' + pried + ')'); check(standing(S) >= KR3.minPlanks, 'and never below ' + KR3.minPlanks + ' (' + standing(S) + ')'); check(kmax >= 2, 'four seats: two kraklings a wave (' + kmax + ')'); }

/* ---------- 3. PER SEAT ---------- */
for (const seats of [1, 2, 3, 4]) { const S = k3New({ seats, maxHp: 670 * COOP_HP[seats - 1], hp: 300, rnd: mulberry(2) }); S.st = 'p2'; S.face.st = 'rise'; S.face.t = 0.01;
  k3Step(S, DT, { heroes: [{ i: 0, x: 120, y: 0 }], hp: 300 }); check(S.arms.length === KR3.arms.perSeat[seats - 1], seats + ' seat(s): ' + KR3.arms.perSeat[seats - 1] + ' pinning arms a wave (' + S.arms.length + ')');
  check(S.arms.every(a => a.hp === Math.max(10, Math.round(670 * COOP_HP[seats - 1] * KR3.arms.hpShare))), seats + ' seat(s): an arm\'s health is a share of his (seat-scaled) bar');
  check(seatsOf(seats) === seats, 'seats ' + seats); }
check(seatsOf(0) === 1 && seatsOf(9) === 4, 'seats clamp 1-4');

/* ---------- 4. THE OPENING: only when every pinning arm is cut; capped; then the ward; B15 floor ---------- */
{ const S = k3New({ maxHp: 670, hp: 234, rnd: mulberry(4) }); S.st = 'p2'; S.face.st = 'rise'; S.face.t = 0.01; const H = [{ i: 0, x: 60, y: 0, air: true }];
  for (let k = 0; k < 140; k++) k3Step(S, DT, { heroes: H, hp: 234 });
  check(S.waveSlammed && S.arms.every(a => a.st === 'pin' || a.st === 'lashTell' || a.st === 'lash'), 'the wave has slammed and pins the deck');
  check(faceMul(S) === KR3.face.mul && KR3.face.mul >= 0.4, 'the face outside an opening: x' + faceMul(S) + ' (>= 0.4)');
  check(k3HitArm(S, S.arms[0].id, 1e6) > 0 && S.face.st !== 'reel', 'one arm cut is not enough');
  for (const a of S.arms) if (a.st !== 'cut') k3HitArm(S, a.id, 1e6);
  k3Step(S, DT, { heroes: H, hp: 234 }); check(S.face.st === 'reel' && faceMul(S) === KR3.face.openMul, 'every arm cut: HE REELS, x' + KR3.face.openMul);
  let took = 0; for (let k = 0; k < 40; k++) took += k3HitFace(S, 30); const cap = Math.round(670 * KR3.face.take);
  check(took <= cap + 40 * Math.round(30 * KR3.face.mul), 'the opening pays out at its cap (' + cap + ') then the floor');
  check(S.face.taken === cap, 'taken = cap ' + S.face.taken);
  for (let k = 0; k < 40; k++) k3Step(S, DT, { heroes: H, hp: 234 }); check(S.face.st === 'ward' && faceMul(S) === KR3.face.wardMul && KR3.face.wardMul >= 0.4, 'then the WARD at x' + KR3.face.wardMul + ' (>= 0.4)');
  for (let k = 0; k < 300; k++) k3Step(S, DT, { heroes: H, hp: 234 }); check(S.face.side === -1 && S.wave === 2, 'he goes under and comes up at the other edge with the next arms (side ' + S.face.side + ', wave ' + S.wave + ')'); }
/* a non-pinned arm (still telling) takes nothing; the face under the water is not struck */
{ const S = k3New({ maxHp: 670, hp: 234, rnd: mulberry(4) }); S.st = 'p2'; S.face.st = 'rise'; S.face.t = 0.01; k3Step(S, DT, { heroes: [], hp: 234 });
  check(k3HitArm(S, S.arms[0].id, 50) === 0, 'an arm still coming down cannot be cut'); S.face.st = 'swap'; check(!faceHittable(S) && k3HitFace(S, 50) === 0, 'the face going under is out of reach (moving, not a guard)'); }

/* ---------- 5. THE RAFT: floor, breaks, repair ---------- */
{ const S = k3New({ maxHp: 670, hp: 234, rnd: mulberry(6) }); for (let k = 0; k < 40; k++) for (let i = 0; i < KR3.planks; i++) hitPlank(S, i, true);
  check(standing(S) === KR3.minPlanks, 'nothing takes the raft below ' + KR3.minPlanks + ' planks (' + standing(S) + ')');
  const S2 = k3New({ maxHp: 670, hp: 234, rnd: mulberry(6) }); S2.st = 'drift'; hitPlank(S2, 5, true); check(S2.planks[5].st === 'gone' && S2.loose.length === 1, 'a broken plank goes adrift (loose)');
  const g = gapNear(S2, plankX(4)); check(g === 5, 'standing beside the gap: it is the one to lash');
  let lashed = false; for (let k = 0; k < Math.ceil(KR3.repair.hold / DT) + 2; k++) for (const e of k3Step(S2, DT, { heroes: [{ i: 0, x: plankX(4), y: 0, hold: true }], hp: 234 })) if (e.t === 'lashed') lashed = true;
  check(lashed && S2.planks[5].st === 'whole' && S2.loose.length === 0, 'HOLD UP ' + KR3.repair.hold + ' s at the gap: the loose plank is lashed back on');
  const S3 = k3New({ maxHp: 670, hp: 234, rnd: mulberry(6) }); S3.st = 'drift'; hitPlank(S3, 5, true); let half = false; for (let k = 0; k < 30; k++) for (const e of k3Step(S3, DT, { heroes: [{ i: 0, x: plankX(4), y: 0, hold: k < 20 }], hp: 234 })) if (e.t === 'lashed') half = true;
  check(!half && S3.planks[5].st === 'gone', 'let go early: no plank'); }
/* the sea: told, back on the raft, a spare blow */
{ const S = k3New({ maxHp: 670, hp: 234, rnd: mulberry(7) }); S.st = 'drift'; const ev = []; for (let k = 0; k < 70; k++) ev.push(...k3Step(S, DT, { heroes: [{ i: 0, x: -30, y: 20, swim: true }], hp: 234 }));
  const sea = ev.findIndex(e => e.t === 'sea'), back = ev.findIndex(e => e.t === 'back');
  check(sea >= 0 && back > sea && ev[back].cost === KR3.sea.cost, 'in the sea: told, then back on the raft for ' + KR3.sea.cost * 100 + '% (' + (back - sea) + ' frames)');
  check(back >= 0 && S.planks[Math.floor(ev[back].x / KR3.plankW)].st !== 'gone', 'back onto a standing plank'); }
/* the ink: never over a hero's own plank or the ones beside it */
{ const S = k3New({ maxHp: 670, hp: 234, rnd: mulberry(8) }); S.ink = { t: 3, side: 1 }; const hx = plankX(14);
  const sp = inkSpans(S, [hx]); const c = 14; check(sp.length >= 1 && sp.every(([a, b]) => b <= (c - 1) * KR3.plankW || a >= (c + 2) * KR3.plankW), 'the ink stays off the hero\'s plank ±1 ' + JSON.stringify(sp)); }

/* ---------- 6. THE FIGHT, driven by the lab's advice (seat 1-4) and by a mash ---------- */
const rows = [];
for (const seats of [1, 2, 3, 4]) for (const seed of [1, 2, 3, 4, 5, 6]) { const r = run({ seed, seats }); rows.push({ seats, seed, ...r });
  check(r.minMul >= 0.4, `s${seats} #${seed}: face never under 0.4x (${r.minMul})`); check(r.minStanding >= KR3.minPlanks, `s${seats} #${seed}: raft >= floor (${r.minStanding})`);
  check(r.openBad === 0, `s${seats} #${seed}: every opening came after every arm was cut`); check(r.inkBad === 0, `s${seats} #${seed}: no ink on a hero's plank`); check(r.spareOk, `s${seats} #${seed}: the sea never kills`); }
const solo = rows.filter(r => r.seats === 1), wins = solo.filter(r => r.won), p2T = wins.map(r => r.t - KR3.drift.len - KR3.sinkT - KR3.roadT - KR3.fadeT);
check(wins.length >= 5, 'the advice beats the raft solo (' + wins.length + '/6)');
check(p2T.every(t => t > 25 && t < 150), 'the raft half lasts 25-150 s: ' + p2T.map(t => t.toFixed(0)).join(','));
check(solo.every(r => r.openings >= 2), 'every win takes 2+ openings: ' + solo.map(r => r.openings).join(','));
for (const seats of [2, 3, 4]) { const w = rows.filter(r => r.seats === seats && r.won).length; check(w >= 5, seats + ' seats: the advice beats it (' + w + '/6)'); }
const mashR = [1, 2, 3, 4, 5, 6].map(seed => run({ seed, mash: true })), mashTaken = mashR.reduce((n, r) => n + r.taken, 0) / 6, smartTaken = solo.reduce((n, r) => n + r.taken, 0) / 6;
check(mashR.filter(r => r.won).length <= 1, 'a mash (stand at his face and swing) does not beat it (' + mashR.filter(r => r.won).length + '/6)');
check(mashTaken > smartTaken * 1.5, 'a mash takes far more (' + mashTaken.toFixed(0) + ' vs ' + smartTaken.toFixed(0) + ')');
const slow = [1, 2, 3].map(seed => run({ seed, speed: 74 })); check(slow.filter(r => r.won).length >= 2, 'the slowest walker (reaper 73.6 px/s) still wins with the advice (' + slow.filter(r => r.won).length + '/3)');
/* determinism */
{ const a = run({ seed: 11 }), b = run({ seed: 11 }); check(a.t === b.t && a.taken === b.taken && a.won === b.won, 'the same seed is the same fight'); }
/* every move is told: the tells in the table, none under half a second */
for (const [k, v] of [['arm slam', KR3.arms.tell], ['arm lash', KR3.arms.lashTell], ['spout', KR3.spout.tell], ['bite', KR3.bite.tell], ['lift', KR3.lift.tell], ['ink', KR3.ink.tell], ['barnacles', KR3.barn.tell + KR3.barn.fly + KR3.barn.fuse], ['wreckage', KR3.wreck.lead], ['rock', KR3.rock.lead], ['whirlpool', KR3.whirl.tell], ['krakling bite', KR3.krak.biteTell], ['krakling pry', KR3.krak.climb + KR3.krak.pry]]) check(v >= 0.5, k + ' is told (' + v + ' s)');
{ const names = new Set(rows.flatMap(r => Object.keys(r.hurts))); check([...names].every(n => ['HIS ARM', 'THE SPOUT', 'HIS BEAK', 'A BARNACLE', 'A KRAKLING', 'WRECKAGE', 'A ROCK'].includes(n)), 'every blow has a name: ' + [...names].join(', ')); }

/* ---------- 7. THE HANDS in a stub world (no canvas: nothing is drawn) - the hand-over, the road, the raft, the hits, the lab, the checkpoint ---------- */
{ const { makeKraken3Hands, K3_MARK } = await import('../src/kraken3-hands.js');
  const W = 60, Hh = 44, TSZ = 16, AIR = 0, grid = new Array(W * Hh).fill(AIR); for (let y = 24; y < 44; y++) for (let x = 0; x < W; x++) grid[y * W + x] = 1;   /* the road at row 24, piers and seabed to the bottom */
  const mkWorld = (cw3) => { const sea = { krakenSea: true, x0: 5 * TSZ, x1: 55 * TSZ, y: 26 * TSZ, base: 42 * TSZ, bottom: 40 * TSZ };
    const L = { cw3, grid: grid.slice(), pools: [sea], arena: { boss: 'kraken', x0: 5 * TSZ, x1: 50 * TSZ, floor: 24 * TSZ, y0: 4 * TSZ, tower: 8 * TSZ + 8, wallL: 4, wallR: 50, rest: 46 * TSZ } };
    const P = { x: 20 * TSZ, y: 24 * TSZ, vx: 0, vy: 0, ground: true, hp: 265, maxHp: 265, inv: 0 }, w = { L, P, enemies: [], movers: [], marks: new Set(), hurts: [], broke: 0, lock: null, boss: null, said: [] };
    w.ctx = { get L() { return w.L; }, get players() { return [w.P]; }, hero: () => w.P, boss: () => w.boss, marks: () => w.marks, number: (x, y, t) => w.said.push(t), hint: t => w.said.push('HINT ' + t), shake() {}, ring() {}, splash() {}, debris() {}, sparks() {}, hitstop() {}, time: () => 0, VW: () => 320, VH: () => 180, krkArt: () => null,
      poolLevel: (p, y) => { p.y = y; }, moveBody: (b, dx) => { b.x += dx; }, holding: () => false, hurtAs: (pp, x, d, o) => w.hurts.push({ d, o }), addEnemy: n => w.enemies.push(n), addMover: m => w.movers.push(m),
      breakTile: (x, y) => { const i = y * W + x; if (w.L.grid[i] !== AIR) { w.L.grid[i] = AIR; w.broke++; } }, tilesDone() {}, dropThings() {}, lock: (x0, x1) => { w.lock = [x0, x1]; }, p1Stop: e => { e.p1Stopped = true; }, sound() {} };
    w.H = makeKraken3Hands(w.ctx); return w; };
  const off = mkWorld(false); check(!off.H.on(), 'hands: inert without L.cw3 (master\'s Causeway)');
  globalThis.BRACKEN_K3 = false; const offk = mkWorld(true); check(!offk.H.on(), 'hands: BRACKEN_K3 === false turns the raft off under ?cw3=1'); delete globalThis.BRACKEN_K3;
  const w = mkWorld(true); check(w.H.on(), 'hands: on with L.cw3');
  const boss = { t: 'kraken', alive: true, hp: 335, maxHp: 670, x: 0, y: 0, w: 20, h: 20 }; w.boss = boss;
  w.H.begin(boss, false); check(boss.p1Stopped && boss.k3 && boss.k3.st === 'sink' && boss.y > w.L.arena.floor + 100, 'hands: begin stops phase 1 and he sinks out of reach');
  let t = 0; while (boss.k3.st !== 'drift' && t < 10) { w.H.bossTick(boss, DT); t += DT; }
  const towerC = Math.floor(w.L.arena.tower / TSZ), keptTower = [towerC - 1, towerC, towerC + 1, towerC + 2].every(x => w.L.grid[25 * W + x] !== AIR), road = w.L.grid[24 * W + 30] === AIR, bed = w.L.grid[41 * W + 30] !== AIR;
  check(road && keptTower && bed && w.broke > 100, 'hands: THE ROAD GOES - the reach broken (' + w.broke + ' tiles), the tower and the seabed stand');
  check(w.movers.length === KR3.planks && w.movers.every(m => m.k3 && m.y === 26 * TSZ - 4), 'hands: the raft is ' + KR3.planks + ' plank movers on his sea');
  check(Math.abs(w.P.y - (26 * TSZ - 4)) < 1 && w.P.x >= w.movers[0].x && w.P.x <= w.movers[KR3.planks - 1].x + 16, 'hands: the hero is on the raft');
  check(w.marks.has(K3_MARK) && w.lock && w.lock[1] - w.lock[0] >= 320, 'hands: the raft checkpoint mark, and the camera held to the raft');
  while (boss.k3.st !== 'p2' && t < 40) { w.H.bossTick(boss, DT); t += DT; }
  for (let k = 0; k < 90; k++) w.H.bossTick(boss, DT);
  check(boss.w === 34 && Math.abs(boss.y - (26 * TSZ + 4)) < 8, 'hands: his face is the boss\'s hit box at the raft\'s edge');
  check(w.said.some(s => s.startsWith('HINT ')), 'hands: the hint card');
  const armEnts = w.enemies.filter(n => n.k3arm && n.alive); for (let k = 0; k < 90; k++) w.H.bossTick(boss, DT);
  const armEnts2 = w.enemies.filter(n => n.k3arm && n.alive);
  check(armEnts2.length === KR3.arms.perSeat[0] && armEnts2.every(n => n.t === 'krakenarm' && n.parent === boss), 'hands: the pinning arms are krakenarm ents (' + armEnts2.length + ')');
  const d0 = w.H.hurt(boss, 20, boss.x - 20); check(d0 === Math.round(20 * KR3.face.mul), 'hands: a blow on the face outside an opening: ' + d0 + ' (x' + KR3.face.mul + ')');
  for (const n of armEnts2) for (let k = 0; k < 20; k++) w.H.hurt(n, 30, n.x - 10);
  w.H.bossTick(boss, DT); check(boss.k3.face.st === 'reel', 'hands: every arm cut through the ents - HE REELS');
  const d1 = w.H.hurt(boss, 20, boss.x - 20); check(d1 === Math.round(20 * KR3.face.openMul), 'hands: OPEN: ' + d1 + ' (x' + KR3.face.openMul + ')');
  const adv = w.H.advice(); check(adv && adv.mode === 'k3' && typeof adv.goal === 'number' && adv.goal > w.movers[0].x - 30, 'hands: the lab\'s advice in world coordinates');
  /* the sea: the hero below the deck comes back with a spare blow */
  w.P.y = 26 * TSZ + 30; w.P.swim = true; for (let k = 0; k < 70; k++) w.H.bossTick(boss, DT);
  check(Math.abs(w.P.y - (26 * TSZ - 4)) < 1 && w.hurts.some(h => h.o && h.o.spare && h.o.name === 'THE SEA'), 'hands: out of the sea onto the raft, a spare blow (never a death)');
  /* the checkpoint: a fresh boss with the mark comes straight back to the road's breaking */
  const w2 = mkWorld(true); w2.marks.add(K3_MARK); const b2 = { t: 'kraken', alive: true, hp: 670, maxHp: 670 }; w2.boss = b2;
  check(w2.H.resume(b2) && b2.k3.st === 'road' && b2.hp === Math.round(670 * KR3.p2At), 'hands: A10 - with the mark, a death comes back to the raft at ' + KR3.p2At * 100 + '% of his bar');
  const w3 = mkWorld(true); const b3 = { t: 'kraken', alive: true, hp: 670, maxHp: 670 }; check(!w3.H.resume(b3) && !b3.k3, 'hands: no mark - phase 1 as today'); }
/* the main.js wiring is where it should be (src text: the browser proof is OWED) */
{ const fs = await import('node:fs'); const M = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  for (const [k, re] of [['import', /import \{ makeKraken3Hands \} from '\.\/kraken3-hands\.js'/], ['construction', /K3H = makeKraken3Hands\(\{/], ['clear', /if \(K3H\) K3H\.clear\(\)/], ['tick + resume', /if \(K3H\.owns\(e\)\) \{ K3H\.bossTick\(e, dt\); return; \} if \(K3H\.resume\(e\)\) return;/],
    ['hand-over at p2At', /K3H\.p2At\(\)\)\) \{ K3H\.begin\(e, false\); return; \}/], ['hurt', /return K3H\.hurt\(e, dmg, fromX, plunge, tag\)/], ['draw', /K3H\.drawBoss\(g, cx, cy, time\)/], ['advice', /if \(K3H && K3H\.owns\(boss\)\) return K3H\.advice\(\)/],
    ['mover', /if \(m\.k3\) \{ m\.dx = 0; m\.dy = 0; continue; \}/], ['mover draw', /if \(m\.k3\) continue;/], ['strike', /K3H\.strike\(hb\)/], ['sky', /K3H\.drawSky\(/], ['back', /K3H\.drawBack\(/], ['over', /K3H\.drawOver\(/]]) check(re.test(M), 'main.js: ' + k);
  const i1 = M.indexOf('K3H.begin(e, false)'), i2 = M.indexOf("e.mode = 'rise2'; e.modeT = 3.8; e.stage = 3;"); check(i1 > 0 && i2 > i1, 'main.js: the hand-over runs before stage 3 (the maw, the climb, the EYE never come under the flag)');
  const L = fs.readFileSync(new URL('../src/lab.js', import.meta.url), 'utf8'); check(/KA\.duck && P\.ground/.test(L), 'lab.js: the lab ducks when the raft advice says so'); }

log('\nseats seed  won   raft-s  open  cuts  taken  falls  lashed  hurts');
for (const r of rows) log(String(r.seats).padEnd(6) + String(r.seed).padEnd(6) + String(r.won).padEnd(6) + (r.t - KR3.drift.len - KR3.sinkT - KR3.roadT - KR3.fadeT).toFixed(0).padStart(6) + String(r.openings).padStart(6) + String(r.armCuts).padStart(6) + String(r.taken).padStart(7) + String(r.falls).padStart(7) + String(r.lashed).padStart(8) + '  ' + JSON.stringify(r.hurts));
log('mash   ' + mashR.map(r => (r.won ? 'W' : 'L') + ' ' + r.taken + ' ' + (r.t - KR3.drift.len - KR3.sinkT - KR3.roadT - KR3.fadeT).toFixed(0) + 's ' + JSON.stringify(r.hurts) + (r.deaths ? ' dead' : '')).join(' | '));
log('slow   ' + slow.map(r => (r.won ? 'W' : 'L') + ' ' + r.t.toFixed(0) + 's ' + r.taken).join(' | '));
for (const f of fails) console.log('FAIL ' + f);
console.log(`kraken3: ${ok} ok, ${bad} failed`);
process.exit(bad ? 1 : 0);
