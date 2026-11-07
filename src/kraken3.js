// src/kraken3.js - THE KRAKEN 3: THE RAFT (claude/kraken3, OPUS greybox 2026-11-07). The pure state of the fight's second half: no canvas, no main.js -
// src/kraken3-hands.js binds it to the world (the road breaking, the plank movers, the hits, the draw) and tools/kraken3.mjs drives it in Node.
// Sources: scratch/brief-kraken3-1014.md (Daniel 10-14, all recs) + the 10-16 '!!' (the EYE comes out of the causeway half; the raft's FACE is the big
// face moment), scratch/plan-water-1105.md item 10 + s2 boss rules (60-70% WITH flasks, >= 0.4x outside openings, openings from the level's verb).
// FLAG: the same as the level's - only Causeway 2 (L.cw3, ?cw3=1) runs it; master's Kraken is untouched. globalThis.BRACKEN_K3 === false turns the raft
// off under ?cw3=1 too (the old three-stage fight on the new road, for an A/B).
//
// THE SHAPE OF IT
//   PHASE 1   today's Kraken, stages 1-2 (THE ARMS, AT SEA) - unchanged. At 35% (KRK_MAW_AT) the old fight went to THE MAW / THE CLIMB / THE EYE; here
//             he SINKS instead (KR3.sinkT: the arms slacken, the sea goes quiet - it looks like you are safe).
//   THE ROAD  the reach cracks (told KR3.roadT) and goes into the sea; the wreck's deck comes away as THE RAFT and everyone is on it (a fade).
//             CHECKPOINT (A10): from here a death comes back to the raft (a mark), his bar at the 35% the road left him.
//   THE DRIFT (the interlude, KR3.drift.len s): WRECKAGE across the deck at your ankles (jump it), a ROCK overhang at head height (duck it), a
//             WHIRLPOOL pulling the raft's deck one way (walk against it), KRAKLINGS climbing the edges (cut them before they pry a plank off);
//             then his return, told four ways: bubbles, a shadow under the raft, a quiet beat, the deck shakes.
//   PHASE 2   on the raft. HIS FACE surfaces at one edge: ALWAYS hittable at KR3.face.mul (B15 floor >= 0.4). His ARMS slam onto the deck and STAY,
//             PINNING it (they block the deck and lash whoever is beside them) - CUT EVERY PINNING ARM and he REELS: his face is OPEN (gold ring +
//             timer, x KR3.face.openMul up to KR3.face.take of him), then a told WARD (B3), then the next arms. Clear the deck, punish the face.
//             His own moves while the arms pin: WATER SPOUT (a jet across the deck - low: jump, high: duck; it shoves you toward the far edge),
//             BITE (a marked chunk of the edge - step back; it takes the planks), TIDAL LIFT (he heaves his side up - you slide toward the far
//             water), INK CLOUD (part of the deck goes black, the arms in it faint outlines - never over a hero's own plank), BARNACLE VOLLEY
//             (they stick and burst a beat later - or strike one off first).
//   THE RAFT  KR3.planks planks; slams and bites that land crack / break them; at 2/3 and 1/3 of his raft bar a section falls away; NEVER fewer
//             than KR3.minPlanks. LOOSE PLANKS drift off every break: stand at a gap and HOLD UP to lash one back on (KR3.repair.hold s).
//   THE SEA   falling in is told (THE SEA HAS YOU), lifts you back onto the raft KR3.sea.back s later for KR3.sea.cost of your health - never a death.
// Every number is a share of HIS bar (maxHp already carries the co-op seats) or a count by SEATS (1-4).
// Coordinates here are the RAFT's: x from the raft's left edge (px), y from the deck (0), up is negative.

export const KR3 = {
  planks: 16, plankW: 16, minPlanks: 9,
  p2At: 0.5,                  // phase 1 ends at this share of him (stage 2's own floor is main.js KRK_MAW_AT 0.35: the raft is half the bar, a fight of its own)
  sinkT: 3.2, roadT: 1.4, fadeT: 0.9,
  drift: { len: 20.5, wreck: [3.0, 13.0], rock: [7.2], whirl: [10.0], krak: [2.0, 5.6, 9.2, 12.4], bubbles: 15.0, shadow: 16.6, quiet: 18.0, shake: 19.3 },
  wreck: { v: 150, lead: 1.4, band: [-6, 0], dmg: 18, knock: 160 },
  rock: { v: 110, lead: 1.5, band: [-40, -9], dmg: 20, knock: 120 },
  whirl: { tell: 1.2, dur: 3.2, pull: 50 },
  krak: { hpShare: 0.02, climb: 1.2, pry: 3.6, biteTell: 0.5, biteCd: 1.6, biteR: 14, dmg: 12, perWave: [1, 1, 2, 2] },
  face: { rise: 1.0, mul: 0.4, openMul: 2.5, openT: 4.2, take: 0.12, wardT: 2.6, wardMul: 0.4, swapT: 1.1, reach: 22 },
  snap: { tell: 0.5, act: 0.2, hug: 0.8, r: 24, dmg: 30, knock: 220 },   // HE SNAPS at whoever hugs his face between his moves (the mash answer: the face is the reward, not the place to stand)
  arms: { perSeat: [2, 3, 3, 4], late: 1, hpShare: 0.04, tell: 1.1, stagger: 0.35, slam: 0.15, slamR: 12, dmgSlam: 30, lashEvery: 3.4, lashTell: 0.7, lashT: 0.25, lashR: 26, dmgLash: 22, block: 7, height: 30, cut: 0.9, firstMove: 1.2 },
  moves: { q: ['spout', 'bite', 'barn', 'lift', 'spout', 'barn', 'ink', 'bite'], gap: 2.3, gapLate: 1.8 },
  spout: { tell: 0.95, v: 520, low: [-6, 0], high: [-16, -9], dmg: 26, knock: 240 },
  bite: { tell: 0.9, act: 0.3, planks: 2, dmg: 32, knock: 200 },
  lift: { tell: 1.0, dur: 2.2, slide: 60 },
  ink: { tell: 1.1, dark: 3.5, planks: 5, from: 0.66 },
  barn: { tell: 0.9, n: 3, fly: 0.45, fuse: 1.0, r: 18, dmg: 20 },
  breaks: [0.66, 0.33], breakPlanks: 2,
  sea: { back: 0.8, cost: 0.12, below: 12 },
  repair: { hold: 1.1, reach: 20, loose: 4 },
  heroW: 8, heroH: 14, duckH: 8,
  say: { sink: 'THE SEA GOES QUIET', road: 'THE ROAD GOES', raft: 'THE RAFT', wreck: 'WRECKAGE - JUMP', rock: 'A ROCK - DUCK', whirl: 'A WHIRLPOOL PULLS THE RAFT',
    krak: 'KRAKLINGS ON THE EDGE', pry: 'THEY TAKE A PLANK', back: 'THE KRAKEN', open: 'HE REELS - HIS FACE IS OPEN', ward: 'WARDED', sea: 'THE SEA HAS YOU',
    lashed: 'LASHED', break: 'THE RAFT BREAKS', spoutLow: 'SPOUT - JUMP', spoutHigh: 'SPOUT - DUCK', bite: 'BITE - STEP BACK', lift: 'HE LIFTS THE RAFT', ink: 'INK',
    barn: 'BARNACLES', bubbles: 'BUBBLES...', shadow: 'SOMETHING UNDER THE RAFT', shake: 'THE DECK SHAKES' },
  hint: 'THE RAFT: CUT EVERY ARM PINNING THE DECK AND HIS FACE IS OPEN. HOLD UP AT A GAP TO LASH A LOOSE PLANK BACK ON.',
};

const R = Math.round, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const k3On = () => !(typeof globalThis !== 'undefined' && globalThis.BRACKEN_K3 === false);
export const seatsOf = n => clamp(n | 0 || 1, 1, 4);
export const rawW = () => KR3.planks * KR3.plankW;
export function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- THE STATE ---------- */
export function k3New({ seats = 1, maxHp, hp, resume = false, rnd = Math.random } = {}) {
  const S = { st: resume ? 'road' : 'sink', t: 0, seats: seatsOf(seats), maxHp, hp, p2Max: Math.max(1, hp), rnd, ev: [], resumed: !!resume,
    planks: Array.from({ length: KR3.planks }, () => ({ st: 'whole', flash: 0 })), loose: [], arms: [], kraks: [], obst: [], barns: [], jets: [], ink: null, inkTell: 0,
    face: { side: 1, st: 'under', t: 0, mode: null, mt: 0, open: 0, ward: 0, taken: 0, height: null, swapTo: null }, qi: 0, moveT: 99, hug: {}, wave: 0, waveSlammed: false, lift: null,
    breaksDone: 0, drift: { done: {} }, rescue: {}, rep: {}, krakId: 0, armId: 0, flags: {}, said: {} };
  return S;
}
const emit = (S, e) => { S.ev.push(e); return e; };
const say = (S, text, col, x, y) => emit(S, { t: 'say', text, col: col || '#bfe6f5', x, y });
const sound = (S, k) => emit(S, { t: 'sound', k });

/* ---------- THE RAFT ---------- */
export const plankX = i => i * KR3.plankW + KR3.plankW / 2;
export const plankAt = x => Math.floor(x / KR3.plankW);
export const standing = S => S.planks.reduce((n, p) => n + (p.st !== 'gone' ? 1 : 0), 0);
export function extent(S) { let lo = -1, hi = -1; S.planks.forEach((p, i) => { if (p.st !== 'gone') { if (lo < 0) lo = i; hi = i; } }); return { lo, hi, x0: lo * KR3.plankW, x1: (hi + 1) * KR3.plankW }; }
export const onDeck = (S, x) => { const i = plankAt(x); return i >= 0 && i < KR3.planks && S.planks[i].st !== 'gone'; };
/* a plank hit: cracked, and a cracked one gone - but never below the floor of the raft */
export function hitPlank(S, i, hard) {
  const p = S.planks[i]; if (!p || p.st === 'gone') return false; p.flash = 0.3;
  if (p.st === 'whole' && !hard) { p.st = 'cracked'; emit(S, { t: 'crack', i }); return true; }
  if (standing(S) <= KR3.minPlanks) { if (p.st === 'whole') { p.st = 'cracked'; emit(S, { t: 'crack', i }); } return false; }
  p.st = 'gone'; emit(S, { t: 'gone', i }); sound(S, 'plank');
  if (S.loose.length < KR3.repair.loose) { const ex = extent(S), out = plankX(i) < (ex.x0 + ex.x1) / 2 ? -1 : 1; S.loose.push({ x: plankX(i) + out * (10 + S.rnd() * 18), t: 0, out }); }
  return true;
}
/* THE EDGE on a side: the outermost standing planks (side -1 = left, +1 = right) */
export function edgePlanks(S, side, n) { const ex = extent(S), out = []; if (ex.lo < 0) return out;
  for (let k = 0; out.length < n && k < KR3.planks; k++) { const i = side < 0 ? ex.lo + k : ex.hi - k; if (i < 0 || i >= KR3.planks) break; if (S.planks[i].st !== 'gone') out.push(i); }
  return out; }
export const faceX = S => { const ex = extent(S); return S.face.side < 0 ? ex.x0 - KR3.face.reach : ex.x1 + KR3.face.reach; };

/* ---------- THE FACE: what a blow on him is worth (B15: never nothing, >= 0.4 while he can be struck) ---------- */
export const faceHittable = S => S.st === 'p2' && (S.face.st === 'up' || S.face.st === 'reel' || S.face.st === 'ward' || S.face.st === 'tell' || S.face.st === 'act');
export function faceMul(S) {
  if (!faceHittable(S)) return 0;
  if (S.face.st === 'reel' && S.face.taken < R(S.maxHp * KR3.face.take)) return KR3.face.openMul;
  if (S.face.st === 'ward') return KR3.face.wardMul;
  return KR3.face.mul;
}
/* a blow on his face: what he takes (the hands hand it to hurtEnemy) */
export function k3HitFace(S, dmg) {
  const m = faceMul(S); if (m <= 0) return 0;
  let d = Math.max(1, R(dmg * m));
  if (S.face.st === 'reel') { const cap = R(S.maxHp * KR3.face.take), left = cap - S.face.taken;
    if (left > 0) { d = Math.min(d, left); S.face.taken += d; if (S.face.taken >= cap) S.face.open = Math.min(S.face.open, 0.3); }
    else d = Math.max(1, R(dmg * KR3.face.mul)); }
  emit(S, { t: 'faceHit', d, open: S.face.st === 'reel', ward: S.face.st === 'ward' });
  return d;
}
/* a blow on an arm or a krakling: their own health, never his (the face is the target) */
export function k3HitArm(S, id, dmg) {
  const a = S.arms.find(q => q.id === id); if (!a || (a.st !== 'pin' && a.st !== 'lashTell' && a.st !== 'lash')) return 0;
  const d = Math.min(a.hp, Math.max(1, R(dmg))); a.hp -= d; a.flash = 0.12;
  if (a.hp <= 0) { a.st = 'cut'; a.t = KR3.arms.cut; emit(S, { t: 'cut', id, x: a.x }); sound(S, 'cut'); }
  return d;
}
export function k3HitKrak(S, id, dmg) {
  const k = S.kraks.find(q => q.id === id); if (!k || k.st === 'dead') return 0;
  const d = Math.min(k.hp, Math.max(1, R(dmg))); k.hp -= d; k.flash = 0.12;
  if (k.hp <= 0) { k.st = 'dead'; k.t = 0.6; emit(S, { t: 'krakDead', id, x: k.x }); sound(S, 'squelch'); }
  return d;
}
/* a blade through a barnacle before it bursts knocks it off the deck */
export function k3PopBarn(S, l, r) { let n = 0; for (const b of S.barns) if (b.st === 'stuck' && b.x > l - 4 && b.x < r + 4) { b.st = 'popped'; b.t = 0.3; n++; } if (n) sound(S, 'pop'); return n; }

/* ---------- ONE FRAME. W = { heroes: [{ i, x, y, air, duck, dead, swim, hold }], hp } (raft coordinates). Returns the events of the frame. ---------- */
export function k3Step(S, dt, W) {
  S.t += dt;   /* (S.ev keeps what the hits between frames said: k3HitArm's 'cut', the face's numbers) */ if (W && typeof W.hp === 'number') S.hp = W.hp;
  const H = ((W && W.heroes) || []).filter(h => !h.dead);
  for (const p of S.planks) if (p.flash > 0) p.flash -= dt;
  for (const l of S.loose) l.t += dt;
  switch (S.st) {
    case 'sink': if (!S.said.sink) { S.said.sink = 1; say(S, KR3.say.sink, '#9ad8d8'); sound(S, 'sink'); } if (S.t >= KR3.sinkT) go(S, 'road'); break;
    case 'road': if (!S.said.road) { S.said.road = 1; say(S, KR3.say.road, '#ff9a6b'); sound(S, 'crack'); } if (S.t >= KR3.roadT) go(S, 'fade'); break;
    case 'fade': if (S.t >= KR3.fadeT / 2 && !S.flags.boarded) { S.flags.boarded = 1; emit(S, { t: 'board' }); say(S, KR3.say.raft, '#e8eef2'); }
      if (S.t >= KR3.fadeT) go(S, 'drift'); break;
    case 'drift': driftStep(S, dt, H); break;
    case 'p2': p2Step(S, dt, H); break;
    default: break;
  }
  if (S.st === 'drift' || S.st === 'p2') { commonStep(S, dt, H); }
  const out = S.ev; S.ev = []; return out;
}
function go(S, st) { S.st = st; S.t = 0; emit(S, { t: 'state', st }); }

/* ---------- THE DRIFT ---------- */
function driftStep(S, dt, H) {
  const D = KR3.drift, t = S.t, once = (k, at) => { if (t >= at && !S.drift.done[k]) { S.drift.done[k] = 1; return true; } return false; };
  D.wreck.forEach((at, n) => { if (once('w' + n, at - KR3.wreck.lead)) spawnObst(S, 'wreck', n % 2 ? -1 : 1); });
  D.rock.forEach((at, n) => { if (once('r' + n, at - KR3.rock.lead)) spawnObst(S, 'rock', n % 2 ? 1 : -1); });
  D.whirl.forEach((at, n) => { if (once('h' + n, at)) { const dir = n % 2 ? -1 : 1; S.obst.push({ k: 'whirl', dir, st: 'tell', t: KR3.whirl.tell }); say(S, KR3.say.whirl, '#9ad8d8'); sound(S, 'whirl'); } });
  D.krak.forEach((at, n) => { if (once('k' + n, at)) { const per = KR3.krak.perWave[S.seats - 1]; for (let q = 0; q < per; q++) spawnKrak(S, (n + q) % 2 ? -1 : 1); if (n === 0) say(S, KR3.say.krak, '#ffd36b'); } });
  if (once('bub', D.bubbles)) { say(S, KR3.say.bubbles, '#bfe6f5'); sound(S, 'bubbles'); emit(S, { t: 'tellReturn', k: 'bubbles' }); }
  if (once('sha', D.shadow)) { say(S, KR3.say.shadow, '#9ab0c0'); emit(S, { t: 'tellReturn', k: 'shadow' }); }
  if (once('qui', D.quiet)) emit(S, { t: 'tellReturn', k: 'quiet' });
  if (once('sha2', D.shake)) { say(S, KR3.say.shake, '#ff9a6b'); sound(S, 'shake'); emit(S, { t: 'tellReturn', k: 'shake' }); }
  for (const o of S.obst) obstStep(S, o, dt, H);
  S.obst = S.obst.filter(o => !o.done);
  if (t >= D.len) { go(S, 'p2'); S.face.st = 'rise'; S.face.t = KR3.face.rise; S.face.side = 1; say(S, KR3.say.back, '#ff6b6b'); sound(S, 'roar'); emit(S, { t: 'hint', text: KR3.hint }); }
}
function spawnObst(S, k, dir) { const C = KR3[k], ex = extent(S), edge = dir > 0 ? ex.x0 : ex.x1;
  S.obst.push({ k, dir, x: edge - dir * C.v * C.lead, v: C.v, hit: {}, st: 'run' }); say(S, KR3.say[k], '#ffd36b'); sound(S, k === 'rock' ? 'rumble' : 'creak'); }
function obstStep(S, o, dt, H) {
  if (o.k === 'whirl') { o.t -= dt; if (o.st === 'tell' && o.t <= 0) { o.st = 'pull'; o.t = KR3.whirl.dur; }
    else if (o.st === 'pull') { for (const h of H) if (!h.air) emit(S, { t: 'push', i: h.i, vx: o.dir * KR3.whirl.pull }); if (o.t <= 0) o.done = true; } return; }
  const C = KR3[o.k], x0 = o.x; o.x += o.dir * o.v * dt; const ex = extent(S);
  /* the front sweeps the deck: whoever's box is in its band as it passes is struck once */
  for (const h of H) { if (o.hit[h.i] || S.rescue[h.i]) continue; const lo = Math.min(x0, o.x) - 6, hi = Math.max(x0, o.x) + 6; if (h.x < lo || h.x > hi) continue;
    if (bandHits(h, C.band)) { o.hit[h.i] = 1; hurt(S, h.i, C.dmg, o.k === 'rock' ? 'A ROCK' : 'WRECKAGE', o.dir * C.knock, false); } }
  if ((o.dir > 0 && o.x > ex.x1 + 80) || (o.dir < 0 && o.x < ex.x0 - 80)) o.done = true;
}
/* a band [top, bottom] in deck y against a hero's box: a jump takes the feet over a low band; a duck takes the head under a high one */
export function bandHits(h, band) { const top = h.y - (h.duck && !h.air ? KR3.duckH : KR3.heroH), bot = h.y; return bot > band[0] && top < band[1]; }
function spawnKrak(S, side) { const ed = edgePlanks(S, side, 3), i = ed.find(j => !S.kraks.some(k => k.i === j && k.st !== 'dead')); if (i === undefined) return;
  const hp = Math.max(8, R(S.maxHp * KR3.krak.hpShare));
  S.kraks.push({ id: ++S.krakId, i, side, x: plankX(i), st: 'climb', t: KR3.krak.climb, hp, max: hp, flash: 0, cd: 0.8, bite: 0 }); sound(S, 'grab'); }

/* ---------- PHASE 2 ---------- */
const p2Frac = S => S.hp / S.p2Max;
function p2Step(S, dt, H) {
  const F = S.face;
  /* THE RAFT BREAKS at 2/3 and 1/3 of his raft bar: a section on his side falls away (never below the floor) */
  while (S.breaksDone < KR3.breaks.length && p2Frac(S) <= KR3.breaks[S.breaksDone]) { S.breaksDone++; let n = 0; for (const i of edgePlanks(S, F.side, KR3.breakPlanks)) if (standing(S) > KR3.minPlanks) { if (hitPlank(S, i, true)) n++; }
    if (n) { say(S, KR3.say.break, '#ff9a6b'); emit(S, { t: 'break', side: F.side }); } }
  F.t -= dt;
  switch (F.st) {
    case 'rise': if (F.t <= 0) { F.st = 'up'; newWave(S, H); } break;
    case 'swap': if (F.t <= 0) { F.side = F.swapTo; F.st = 'up'; newWave(S, H); } break;
    case 'up': case 'tell': case 'act': faceMoves(S, dt, H); break;
    case 'reel': F.open -= dt; if (F.open <= 0) { F.st = 'ward'; F.t = KR3.face.wardT; say(S, KR3.say.ward, '#9aa39a', faceX(S), -40); sound(S, 'clank'); } break;
    case 'ward': if (F.t <= 0) { F.st = 'swap'; F.t = KR3.face.swapT; F.swapTo = -F.side; emit(S, { t: 'swap', to: F.swapTo }); sound(S, 'splash'); } break;
    default: break;
  }
  armsStep(S, dt, H);
  /* ALL THE PINNING ARMS CUT: he reels, the face is open */
  if (S.waveSlammed && S.arms.length && S.arms.every(a => a.st === 'cut' || a.st === 'gone') && (F.st === 'up' || F.st === 'tell' || F.st === 'act')) {
    S.waveSlammed = false; F.st = 'reel'; F.open = KR3.face.openT; F.taken = 0; F.mode = null; S.jets = []; S.lift = null; if (S.inkTell > 0) S.inkTell = 0;
    for (const b of S.barns) if (b.st === 'tell') b.st = 'popped';
    say(S, KR3.say.open, '#ffd36b', faceX(S), -46); sound(S, 'reel'); emit(S, { t: 'open', x: faceX(S) }); }
  S.arms = S.arms.filter(a => a.st !== 'gone');
}
function newWave(S, H) {
  S.wave++; S.waveSlammed = false; const A = KR3.arms, n = A.perSeat[S.seats - 1] + (p2Frac(S) <= KR3.breaks[1] ? A.late : 0);
  const ex = extent(S), cand = []; for (let i = ex.lo; i <= ex.hi; i++) if (i >= 0 && S.planks[i].st !== 'gone') cand.push(i);
  /* the first comes down on the nearest hero's plank; the rest spread out, never two within two planks */
  const pick = []; const hx = H.length ? H[Math.floor(S.rnd() * H.length)].x : (ex.x0 + ex.x1) / 2;
  const first = cand.slice().sort((a, b) => Math.abs(plankX(a) - hx) - Math.abs(plankX(b) - hx))[0]; if (first !== undefined) pick.push(first);
  for (let tries = 0; pick.length < n && tries < 60; tries++) { const i = cand[Math.floor(S.rnd() * cand.length)]; if (pick.every(j => Math.abs(j - i) >= 3)) pick.push(i); }
  for (let tries = 0; pick.length < n && tries < 60; tries++) { const i = cand[Math.floor(S.rnd() * cand.length)]; if (!pick.includes(i)) pick.push(i); }
  const hp = Math.max(10, R(S.maxHp * A.hpShare));
  pick.forEach((i, k) => S.arms.push({ id: ++S.armId, i, x: plankX(i), st: 'tell', t: A.tell + k * A.stagger, hp, max: hp, flash: 0, lashT: A.lashEvery + k * 1.1, hit: {} }));
  sound(S, 'bulge');
}
function armsStep(S, dt, H) {
  const A = KR3.arms;
  for (const a of S.arms) { a.t -= dt; if (a.flash > 0) a.flash -= dt;
    if (a.st === 'tell' && a.t <= 0) { a.st = 'slam'; a.t = A.slam; sound(S, 'slam'); emit(S, { t: 'slam', x: a.x });
      for (const h of H) if (!S.rescue[h.i] && Math.abs(h.x - a.x) < A.slamR && !(h.air && h.y < -A.height)) hurt(S, h.i, A.dmgSlam, 'HIS ARM', Math.sign(h.x - a.x || 1) * 120, false);
      hitPlank(S, a.i, false); }
    else if (a.st === 'slam' && a.t <= 0) { a.st = 'pin'; if (S.arms.every(q => q.st !== 'tell')) { S.waveSlammed = true; S.moveT = A.firstMove; } }
    else if ((a.st === 'pin' || a.st === 'lashTell') && S.planks[a.i].st === 'gone') { a.st = 'cut'; a.t = A.cut; emit(S, { t: 'cut', id: a.id, x: a.x, lost: true }); }   /* its plank gone from under it: the arm loses its grip (no arm is ever left pinning open water) */
    else if (a.st === 'pin') { a.lashT -= dt; if (a.lashT <= 0 && S.face.st !== 'reel') { a.st = 'lashTell'; a.t = A.lashTell; sound(S, 'lashTell'); } }
    else if (a.st === 'lashTell' && a.t <= 0) { a.st = 'lash'; a.t = A.lashT; a.hit = {}; sound(S, 'lash'); }
    else if (a.st === 'lash') { for (const h of H) if (!a.hit[h.i] && !S.rescue[h.i] && Math.abs(h.x - a.x) < A.lashR && Math.abs(h.x - a.x) > 2 && !(h.air && h.y < -22)) { a.hit[h.i] = 1; hurt(S, h.i, A.dmgLash, 'HIS ARM', Math.sign(h.x - a.x || 1) * 160, false); }
      if (a.t <= 0) { a.st = 'pin'; a.lashT = A.lashEvery; } }
    else if (a.st === 'cut' && a.t <= 0) a.st = 'gone';
    /* A PINNING ARM HOLDS THE DECK: you go over it, not through it */
    if (a.st === 'pin' || a.st === 'lashTell' || a.st === 'lash') for (const h of H) if (!h.air && !S.rescue[h.i] && Math.abs(h.x - a.x) < A.block) emit(S, { t: 'block', i: h.i, x: a.x + (h.x < a.x ? -A.block : A.block) }); }
}
function faceMoves(S, dt, H) {
  const F = S.face;
  /* THE SNAP: a hero who stands in his face between moves is snapped at (told) */
  if (F.st === 'up') { const nx = faceX(S) - F.side * 14; let hug = false; for (const h of H) { S.hug[h.i] = Math.abs(h.x - nx) < KR3.snap.r && !S.rescue[h.i] ? (S.hug[h.i] || 0) + dt : 0; if (S.hug[h.i] > KR3.snap.hug) hug = true; }
    if (hug && S.moveT > 0.6) { for (const k in S.hug) S.hug[k] = 0; F.mode = 'snap'; F.st = 'tell'; F.mt = KR3.snap.tell; startTell(S, 'snap', H); return; } }
  if (!S.waveSlammed && F.mode !== 'snap') return;
  if (F.st === 'up') { S.moveT -= dt; if (S.moveT > 0) return;
    let m = KR3.moves.q[S.qi++ % KR3.moves.q.length]; if (m === 'ink' && p2Frac(S) > KR3.ink.from) m = 'spout';
    if (Object.values(S.hug).some(v => v > 0.3) && m !== 'bite' && !S.flags.hugBite) { m = 'bite'; S.qi--; S.flags.hugBite = 1; } else S.flags.hugBite = 0;   /* someone stands in his face: the next move is the BITE (then the queue goes on) */
    F.mode = m; F.st = 'tell'; F.mt = KR3[m].tell; startTell(S, m, H); return; }
  F.mt -= dt;
  if (F.st === 'tell' && F.mt <= 0) { F.st = 'act'; startAct(S, F.mode, H); return; }
  if (F.st === 'act') { actStep(S, F.mode, dt, H); if (F.mt <= 0) { const was = F.mode; F.st = 'up'; F.mode = null; S.jets = []; if (was === 'snap') { S.moveT = Math.max(S.moveT, 1.0); return; } S.moveT = p2Frac(S) <= KR3.breaks[1] ? KR3.moves.gapLate : KR3.moves.gap; } }
}
function startTell(S, m, H) {
  const F = S.face, fx = faceX(S);
  if (m === 'spout') { F.height = S.rnd() < 0.5 ? 'low' : 'high'; say(S, F.height === 'low' ? KR3.say.spoutLow : KR3.say.spoutHigh, '#ffd36b', fx, -36); sound(S, 'gurgle'); }
  if (m === 'bite') { F.chunk = edgePlanks(S, F.side, KR3.bite.planks); say(S, KR3.say.bite, '#ff6b6b', fx, -36); sound(S, 'snort'); }
  if (m === 'lift') { say(S, KR3.say.lift, '#ffd36b', fx, -36); sound(S, 'heave'); }
  if (m === 'snap') { say(S, '!!', '#ff6b6b', fx, -36); sound(S, 'snort'); }
  if (m === 'ink') { S.inkTell = KR3.ink.tell; say(S, KR3.say.ink, '#b9a6e0', fx, -36); sound(S, 'gurgle'); }
  if (m === 'barn') { const ex = extent(S), n = KR3.barn.n + (S.seats - 1); S.barns = S.barns.filter(b => b.st !== 'gone');
    for (let k = 0; k < n; k++) { const h = H.length ? H[k % H.length] : null, x = clamp((h ? h.x : (ex.x0 + ex.x1) / 2) + (k === 0 ? 0 : (S.rnd() - 0.5) * 70), ex.x0 + 6, ex.x1 - 6);
      S.barns.push({ x, st: 'tell', t: KR3.barn.tell }); }
    say(S, KR3.say.barn, '#d8d2bc', fx, -36); sound(S, 'rattle'); }
  emit(S, { t: 'tell', m, side: F.side, height: F.height });
}
function startAct(S, m, H) {
  const F = S.face, ex = extent(S);
  if (m === 'spout') { S.jets.push({ x: faceX(S), dir: -F.side, band: KR3.spout[F.height], hit: {}, end: F.side > 0 ? ex.x0 - 20 : ex.x1 + 20 }); F.mt = (ex.x1 - ex.x0 + 60) / KR3.spout.v; sound(S, 'jet'); }
  if (m === 'bite') { F.mt = KR3.bite.act; const ch = F.chunk || []; const lo = Math.min(...ch.map(plankX)) - 8, hi = Math.max(...ch.map(plankX)) + 8;
    for (const h of H) if (!S.rescue[h.i] && ch.length && h.x >= lo && h.x <= hi && h.y > -24) hurt(S, h.i, KR3.bite.dmg, 'HIS BEAK', -F.side * KR3.bite.knock, true);
    for (const i of ch) hitPlank(S, i, true); sound(S, 'bite'); emit(S, { t: 'bite', side: F.side }); }
  if (m === 'lift') { S.lift = { dir: -F.side, t: KR3.lift.dur }; F.mt = KR3.lift.dur; sound(S, 'creak'); }
  if (m === 'snap') { F.mt = KR3.snap.act; const nx = faceX(S) - F.side * 14; for (const h of H) if (!S.rescue[h.i] && Math.abs(h.x - nx) < KR3.snap.r && h.y > -26) hurt(S, h.i, KR3.snap.dmg, 'HIS BEAK', -F.side * KR3.snap.knock, false); sound(S, 'bite'); }
  if (m === 'ink') { S.ink = { t: KR3.ink.dark, side: F.side }; F.mt = 0.4; sound(S, 'hiss'); }
  if (m === 'barn') { for (const b of S.barns) if (b.st === 'tell') { b.st = 'fly'; b.t = KR3.barn.fly; } F.mt = KR3.barn.fly + 0.2; sound(S, 'volley'); }
}
function actStep(S, m, dt, H) {
  if (m === 'spout') for (const j of S.jets) { const x0 = j.x; j.x += j.dir * KR3.spout.v * dt; const lo = Math.min(x0, j.x) - 4, hi = Math.max(x0, j.x) + 4;
    for (const h of H) if (!j.hit[h.i] && !S.rescue[h.i] && h.x >= lo && h.x <= hi && bandHits(h, j.band)) { j.hit[h.i] = 1; hurt(S, h.i, KR3.spout.dmg, 'THE SPOUT', j.dir * KR3.spout.knock, false); } }
}
/* ---------- WHAT EVERY FRAME ON THE RAFT DOES: the lift, the ink, the barnacles, the kraklings, the sea, the repair ---------- */
function commonStep(S, dt, H) {
  if (S.lift) { S.lift.t -= dt; for (const h of H) if (!h.air && !S.rescue[h.i]) emit(S, { t: 'push', i: h.i, vx: S.lift.dir * KR3.lift.slide }); if (S.lift.t <= 0) S.lift = null; }
  if (S.inkTell > 0) S.inkTell -= dt;
  if (S.ink) { S.ink.t -= dt; if (S.ink.t <= 0) S.ink = null; }
  for (const b of S.barns) { b.t -= dt;
    if (b.st === 'fly' && b.t <= 0) { b.st = 'stuck'; b.t = KR3.barn.fuse; sound(S, 'thunk'); }
    else if (b.st === 'stuck' && b.t <= 0) { b.st = 'burst'; b.t = 0.3; sound(S, 'burst'); for (const h of H) if (!S.rescue[h.i] && Math.abs(h.x - b.x) < KR3.barn.r && h.y > -KR3.barn.r - 6) hurt(S, h.i, KR3.barn.dmg, 'A BARNACLE', Math.sign(h.x - b.x || 1) * 90, false); }
    else if ((b.st === 'burst' || b.st === 'popped') && b.t <= 0) b.st = 'gone'; }
  S.barns = S.barns.filter(b => b.st !== 'gone');
  /* THE KRAKLINGS: up the edge (told: their hands on it), then prying the plank they hold - cut them first, or the plank goes with them */
  const K = KR3.krak;
  for (const k of S.kraks) { k.t -= dt; if (k.flash > 0) k.flash -= dt;
    if (k.st === 'climb' && k.t <= 0) { if (S.planks[k.i].st === 'gone') { k.st = 'dead'; k.t = 0.4; continue; } k.st = 'pry'; k.t = K.pry; }
    else if (k.st === 'pry') { k.cd -= dt;
      const near = H.find(h => !S.rescue[h.i] && Math.abs(h.x - k.x) < K.biteR && h.y > -20);
      if (k.bite > 0) { k.bite -= dt; if (k.bite <= 0 && near) hurt(S, near.i, K.dmg, 'A KRAKLING', Math.sign(near.x - k.x || 1) * 80, false); }
      else if (near && k.cd <= 0) { k.bite = K.biteTell; k.cd = K.biteCd; sound(S, 'hiss'); }
      if (k.t <= 0) { const took = hitPlank(S, k.i, true); if (took) say(S, KR3.say.pry, '#ff9a6b', k.x, -30); k.st = 'dead'; k.t = 0.4; } }
    else if (k.st === 'dead' && k.t <= 0) k.st = 'gone'; }
  S.kraks = S.kraks.filter(k => k.st !== 'gone');
  /* THE SEA: told, then back onto the raft for a share of your health - never a death (the hands take it as a 'spare' blow) */
  for (const h of H) { const r = S.rescue[h.i];
    if (!r && (h.swim || h.y > KR3.sea.below)) { S.rescue[h.i] = { t: KR3.sea.back }; S.rep[h.i] = 0; say(S, KR3.say.sea, '#9ad8d8', h.x, -30); sound(S, 'splash'); emit(S, { t: 'sea', i: h.i }); }
    else if (r) { r.t -= dt; if (r.t <= 0) { delete S.rescue[h.i]; const ex = extent(S); let best = null, bd = 1e9; for (let i = ex.lo; i <= ex.hi; i++) if (S.planks[i].st !== 'gone' && !S.arms.some(a => a.i === i && a.st !== 'cut')) { const d = Math.abs(plankX(i) - h.x); if (d < bd) { bd = d; best = i; } }
      emit(S, { t: 'back', i: h.i, x: plankX(best === null ? ex.lo : best), cost: KR3.sea.cost }); } } }
  /* THE REPAIR: HOLD UP beside a gap with a loose plank adrift - lash it back on */
  for (const h of H) { if (S.rescue[h.i] || h.air || !h.hold || !S.loose.length) { if (!h.hold) S.rep[h.i] = 0; continue; }
    const g = gapNear(S, h.x); if (g < 0) { S.rep[h.i] = 0; continue; }
    S.rep[h.i] = (S.rep[h.i] || 0) + dt; emit(S, { t: 'lashing', i: h.i, k: S.rep[h.i] / KR3.repair.hold, at: g });
    if (S.rep[h.i] >= KR3.repair.hold) { S.rep[h.i] = 0; S.planks[g].st = 'whole'; S.planks[g].flash = 0.4; S.loose.shift(); say(S, KR3.say.lashed, '#8fd160', plankX(g), -28); sound(S, 'lash2'); emit(S, { t: 'lashed', i: g }); } }
}
/* the gap a hero standing at x can lash: a gone plank within reach that sits beside a standing one (or inside the raft's span) */
export function gapNear(S, x) { let best = -1, bd = 1e9; const ex = extent(S);
  for (let i = 0; i < KR3.planks; i++) { if (S.planks[i].st !== 'gone') continue; const d = Math.abs(plankX(i) - x); if (d > KR3.repair.reach + KR3.plankW / 2) continue;
    const nb = (S.planks[i - 1] && S.planks[i - 1].st !== 'gone') || (S.planks[i + 1] && S.planks[i + 1].st !== 'gone') || (i > ex.lo && i < ex.hi); if (nb && d < bd) { bd = d; best = i; } }
  return best; }
function hurt(S, i, dmg, name, knock, unblock) { S.rep[i] = 0; emit(S, { t: 'hurt', i, dmg, name, knock, unblock: !!unblock }); }

/* ---------- THE INK: the stretches it blacks out this frame - never a hero's own plank or the ones either side ---------- */
export function inkSpans(S, heroXs) {
  if (!S.ink) return []; const ex = extent(S), w = KR3.ink.planks * KR3.plankW, start = S.ink.side > 0 ? ex.x1 - w : ex.x0, spans = [[start, start + w]];
  let out = spans; for (const x of heroXs || []) { const c = plankAt(x), a = (c - 1) * KR3.plankW, b = (c + 2) * KR3.plankW, nx = [];
    for (const [s0, s1] of out) { if (b <= s0 || a >= s1) { nx.push([s0, s1]); continue; } if (a > s0) nx.push([s0, a]); if (b < s1) nx.push([b, s1]); } out = nx; }
  return out.filter(([a, b]) => b - a >= 4); }

/* ---------- THE LAB'S ADVICE (BK.krak while he is on the raft): where to stand, what to strike, what to jump / duck / hold ---------- */
export function k3Advice(S, h) {
  const o = { goal: null, strike: null, kind: null, jump: false, duck: false, up: false, dodge: false, mash: false, climb: false, hold: false, block: false, st: S.st };
  if (!h || S.rescue[h.i]) return o;
  const ex = extent(S), mid = (ex.x0 + ex.x1) / 2, safe = x => clamp(x, ex.x0 + 6, ex.x1 - 6);
  if (S.st !== 'drift' && S.st !== 'p2') { o.goal = h.x; return o; }
  /* threats first: a band coming at you, a bite chunk, a barnacle, a lash */
  for (const ob of S.obst) if (ob.k !== 'whirl') { const d = (h.x - ob.x) * ob.dir; if (d > -6 && d < 60) { if (ob.k === 'wreck') o.jump = true; else o.duck = true; } }
  for (const j of S.jets) { const d = (h.x - j.x) * j.dir; if (d > -6 && d < 70) { if (j.band[1] >= 0) o.jump = true; else o.duck = true; } }
  if (S.face.st === 'tell' && S.face.mode === 'spout' && S.face.mt < 0.25) { if (S.face.height === 'low') o.jump = true; else o.duck = true; }
  if (o.jump) o.duck = false;
  if (o.duck) return o;
  let avoid = null;
  if (S.face.mode === 'bite' && (S.face.st === 'tell' || S.face.st === 'act') && S.face.chunk && S.face.chunk.length) { const lo = Math.min(...S.face.chunk.map(plankX)) - 12, hi = Math.max(...S.face.chunk.map(plankX)) + 12; if (h.x >= lo && h.x <= hi) avoid = S.face.side > 0 ? lo - 14 : hi + 14; }
  for (const b of S.barns) if ((b.st === 'tell' || b.st === 'fly' || b.st === 'stuck') && Math.abs(h.x - b.x) < KR3.barn.r + 4) { if (b.st === 'stuck') { o.strike = b.x; o.kind = 'barn'; } else avoid = b.x + (h.x < b.x ? -KR3.barn.r - 8 : KR3.barn.r + 8); }
  for (const a of S.arms) if (a.st === 'lashTell' && Math.abs(h.x - a.x) < KR3.arms.lashR + 4) avoid = a.x + (h.x < a.x ? -KR3.arms.lashR - 6 : KR3.arms.lashR + 6);
  for (const a of S.arms) if (a.st === 'tell' && a.t < 0.5 && Math.abs(h.x - a.x) < KR3.arms.slamR + 6) avoid = a.x + (h.x < a.x ? -KR3.arms.slamR - 10 : KR3.arms.slamR + 10);
  if (avoid !== null) { o.goal = safe(avoid); if (o.strike === null) return o; }
  /* the work: a krakling on the edge, the arms pinning the deck, the open face, the face anyway */
  const kr = S.kraks.filter(k => k.st === 'pry' || k.st === 'climb').sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x))[0];
  const arm = S.arms.filter(a => a.st === 'pin' || a.st === 'lashTell' || a.st === 'lash').sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x))[0];
  const fx = faceX(S), edge = S.face.side > 0 ? ex.x1 - 6 : ex.x0 + 6;
  if (o.strike === null) {
    if (kr) { o.strike = kr.x; o.kind = 'krak'; }
    else if (S.face.st === 'reel') { o.strike = fx - S.face.side * 14; o.kind = 'face'; o.goal = edge; }
    else if (arm) { o.strike = arm.x; o.kind = 'arm'; }
    else if (faceHittable(S) && S.face.mode !== 'bite') { o.strike = fx - S.face.side * 14; o.kind = 'face'; o.goal = edge; }
  }
  if (o.goal === null && o.strike !== null) o.goal = safe(o.strike + (h.x < o.strike ? -10 : 10));
  if (o.goal === null) o.goal = safe(mid);
  /* a gap on the way: jump it */
  { const dir = Math.sign(o.goal - h.x), nx = plankAt(h.x + dir * 10); if (dir && Math.abs(o.goal - h.x) > 6 && nx >= 0 && nx < KR3.planks && S.planks[nx].st === 'gone') o.jump = true; }
  /* nothing to strike and a gap with a loose plank: lash it */
  if (o.strike === null && S.loose.length) { const g = gapNear(S, h.x); if (g >= 0) { o.up = true; o.goal = h.x; } else { for (let i = ex.lo; i <= ex.hi; i++) if (S.planks[i] && S.planks[i].st === 'gone') { o.goal = safe(plankX(i) + (plankX(i) > mid ? -14 : 14)); break; } } }
  if (S.lift && !o.up) o.goal = o.goal - S.lift.dir * 8;
  for (const ob of S.obst) if (ob.k === 'whirl' && ob.st === 'pull') o.goal = clamp(o.goal - ob.dir * 10, ex.x0 + 10, ex.x1 - 10);
  return o;
}

/* ---------- A READ for the tools and window.BK_K3 ---------- */
export function k3Read(S) {
  return { st: S.st, t: +S.t.toFixed(2), hp: S.hp, p2Max: S.p2Max, standing: standing(S), planks: S.planks.map(p => p.st[0]).join(''), loose: S.loose.length,
    arms: S.arms.map(a => ({ id: a.id, i: a.i, st: a.st, hp: a.hp })), kraks: S.kraks.map(k => ({ id: k.id, i: k.i, st: k.st, hp: k.hp })),
    face: { side: S.face.side, st: S.face.st, mode: S.face.mode, open: +S.face.open.toFixed(2), taken: S.face.taken, mul: faceMul(S) }, wave: S.wave, ink: !!S.ink, lift: !!S.lift, barns: S.barns.length, obst: S.obst.map(o => o.k) };
}
