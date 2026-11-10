/* src/castellan.js - THE CASTELLAN'S GHOST, THE HOLLOW MANOR's boss (claude/hollowmanor, the OPUS GREYBOX; Daniel's 10-01 haunted-levels concept). THE FIGHT, PURE:
   no canvas, no page, no main.js. src/castellan-hands.js binds it to the world (the racks, the hurt, the wisp) and draws it; tools/manor.mjs fights it.
   THE ARENA: THE GREAT HALL - a flat floor, two minstrels' ledges, FOUR RACKS of armour: THE KNIGHT, THE HALBERD, THE DUELIST, THE GREATSWORD (L.arena.racks, in set order).
   THE RULE OF THE FIGHT (the level's verb, KNOCK IT OUT): he possesses ONE SET AT A TIME; the live set's visor glows ghost-green and the bar names it. Each set has a weakness
   IN HOW IT FIGHTS, earned by an ACTION (a guard broken by an action, never by waiting): earn it and THE GHOST IS KNOCKED HALF OUT - OPEN x2 for CS.open s (capped CS.openCap
   of him per opening). Break a set (its share of him: CS.floors) and he LEAVES it (told CS.leave s: his wisp crosses to the next rack; still x0.45 - never untouchable).
     1 THE KNIGHT      THRUST (told 0.8 s, !, blockable 16) | SHIELD BASH (told 0.7 s, !!, a lunge 18): DODGE THE BASH and he stumbles past -> OPEN. His shield turns a blow
                       from the front to x0.4 (never less).
     2 THE HALBERD     LOW SWEEP (told 0.7 s, !!, jump it, 16) | OVERHEAD CHOP (told 1.0 s, !!, 22): a chop that MISSES bites the floor -> stuck, OPEN.
     3 THE DUELIST     FEINT (a told ! that never comes; he steps back) | LUNGE (told 0.5 s, !, blockable 14) | FLURRY (three told stabs, 0.35 s each, blockable 10):
                       BLOCK ALL THREE and he is winded -> OPEN.
     4 THE GREATSWORD  ARMOUR-BREAKER (told 1.2 s, !!, unblockable 26: step out of it) | WHIRL (told 1.0 s, !!, two spins 20): a whirl that hits no one leaves him DIZZY -> OPEN.
   FINAL (CS.floors[3] -> 0) HE SWAPS BODIES MID-COMBO: a combo of CS.final.combo moves, each from a DIFFERENT rack (that rack's visor lights CS.final.swap s first: which set
     is live reads); between combos HIS WISP crosses the hall CS.final.wisp s - STRIKE THE WISP and he is knocked out: OPEN (x2, capped CS.final.cap).
   B15: x0.45 outside an opening (x0.4 on the knight's shield), x2 in one, never untouchable. A set cannot pass its floor (it holds until the move in hand ends). */

export const CS = {
  hp: 3200, w: 14, h: 28, markH: 44, resist: 0.45, shield: 0.4, openMul: 2, openCap: 0.12, open: 3.0,
  floors: [0.8, 0.6, 0.4, 0.2], order: ['knight', 'halberd', 'duelist', 'greatsword'], leave: 1.4, speed: { knight: 46, halberd: 40, duelist: 70, greatsword: 32 },
  knight: { thrust: { tell: 0.8, act: 0.25, dmg: 16, reach: 40, cd: 2.0 }, bash: { tell: 0.7, act: 0.45, dash: 300, dmg: 18, w: 18, cd: 4.5 } },
  halberd: { sweep: { tell: 0.7, act: 0.3, dmg: 16, reach: 72, cd: 2.6 }, chop: { tell: 1.0, act: 0.3, dmg: 22, at: 44, w: 18, cd: 4.2 } },
  duelist: { feint: { tell: 0.3, back: 0.4 }, lunge: { tell: 0.5, act: 0.3, dash: 240, dmg: 14, w: 14, cd: 1.8 }, flurry: { tell: 0.35, n: 3, dmg: 10, reach: 38, cd: 5.5 } },
  greatsword: { breaker: { tell: 1.2, act: 0.35, dmg: 26, reach: 62, cd: 3.4 }, whirl: { tell: 1.0, spin: 1.4, v: 70, dmg: 20, reach: 40, cd: 6.5 } },
  final: { combo: 3, swap: 0.5, wisp: 1.8, open: 1.8, cap: 0.06 },
};
export const OPEN_MODES = { stumble: 'HE STUMBLES', stuck: 'THE BLADE BITES THE FLOOR', winded: 'WINDED', dizzy: 'DIZZY', knocked: 'KNOCKED OUT OF HIM' };
export const csOpen = e => !!e && !!OPEN_MODES[e.mode] && e.modeT > 0;
const MOVES = { knight: ['thrust', 'bash'], halberd: ['sweep', 'chop'], duelist: ['lunge', 'flurry'], greatsword: ['breaker', 'whirl'] };
export const SET_OF_MOVE = Object.fromEntries(Object.entries(MOVES).flatMap(([s, ms]) => ms.map(m => [m, s])));

/* THE ARENA'S GEOMETRY from the built level (src/hollow-manor.js) */
export function geom(L, TS = 16) {
  const A = L.arena;
  return { x0: A.x0, x1: A.x1, floorY: A.floor, racks: A.racks.map(r => ({ ...r })), TS };
}
export function newFight(G) {
  return { G, si: 0, set: CS.order[0], rack: 0, final: false, openDealt: 0, cap: CS.openCap, cd: { a: 1.2, b: 3.0 }, combo: 0, lastRack: -1, wisp: null, flurry: null, missed: false, told: {}, sets: [],
    n: { thrusts: 0, bashes: 0, bashMiss: 0, sweeps: 0, chops: 0, chopMiss: 0, feints: 0, lunges: 0, flurries: 0, flurryBlocked: 0, breakers: 0, whirls: 0, whirlMiss: 0, opens: 0, openHits: 0, leaves: 0, swaps: 0, wisps: 0, wispHits: 0, hits: 0 },
    hurt: {}, won: false };
}
const near = (heroes, x) => heroes.filter(h => h.alive).sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; e.modeT0 = t; };
export const rackOf = S => S.G.racks[S.rack];
export const setName = S => (S.final ? 'final' : S.set);

/* A BLOW ON HIM: [damage, word]. Open x2 (capped per opening); the knight's shield x0.4 from the front; x0.45 otherwise; a set holds at its floor */
export function takeBlow(e, S, dmg, from = null) {
  let d, word = null;
  if (csOpen(e)) { const cap = S.cap * e.maxHp, room = cap - S.openDealt; d = dmg * CS.openMul <= room ? dmg * CS.openMul : Math.max(dmg * CS.resist, room); S.openDealt = Math.min(cap, S.openDealt + d); S.n.openHits++; }
  else if (!S.final && S.set === 'knight' && from && (Math.sign(from.x - e.x) || 1) === (e.face || 1) && e.mode !== 'leave') { d = dmg * CS.shield; word = 'SHIELD'; }
  else { d = dmg * CS.resist; word = 'ARMOUR'; }
  if (!S.final) { const fl = CS.floors[S.si] * e.maxHp; if (e.hp - d < fl) { d = Math.max(0, e.hp - fl); if (!S.told['holds' + S.si]) { S.told['holds' + S.si] = 1; word = 'HOLDS'; } } }
  return [Math.round(d * 100) / 100, word];
}
/* THE WISP STRUCK (the final's opening): he is knocked out of the bodies, OPEN */
export function strikeWisp(e, S, W) { if (!S.final || e.mode !== 'wisp') return false; S.n.wispHits++; opening(e, S, 'knocked', CS.final.open, CS.final.cap, W); return true; }
function opening(e, S, mode, t, cap, W) { if (mode === 'knocked') e.y = S.G.floorY; S.n.opens++; S.openDealt = 0; S.cap = cap; setMode(e, mode, t); W.sound('open'); W.say && W.say('open', e.x, e.y); W.fx && W.fx('open', e.x, e.y); }

/* ONE STEP. heroes: [{ x, y, alive, ground, blocking, dodging, id }]. W: the world (src/castellan-hands.js, or the test's fake) */
export function step(e, S, dt, heroes, W) {
  if (!e.alive) return;
  for (const k in S.cd) S.cd[k] = Math.max(0, S.cd[k] - dt);
  e.modeT -= dt;
  const tgt = near(heroes, e.x);
  switch (e.mode) {
    case 'sleep': return;
    case 'wake': if (e.modeT <= 0) setMode(e, 'walk', 0.3); return;
    case 'stumble': case 'stuck': case 'winded': case 'dizzy': case 'knocked': if (e.modeT <= 0) { if (S.final && e.mode === 'knocked') return startCombo(e, S, W); setMode(e, 'walk', 0.4); S.cd.a = Math.max(S.cd.a, 0.6); } return;
    case 'recover': if (e.modeT <= 0) setMode(e, 'walk', 0.2); return;
    case 'leave': { const r = rackOf(S); e.x += (r.x - e.x) * Math.min(1, dt * 3); if (e.modeT <= 0) { e.x = r.x; if (S.si >= CS.order.length) { S.final = true; W.say && W.say('final', e.x, e.y); W.sound('final'); return startCombo(e, S, W); } W.sound('possess'); setMode(e, 'wake', 0.6); } return; }
    case 'swap': if (e.modeT <= 0) { e.x = rackOf(S).x; e.face = tgt ? (Math.sign(tgt.x - e.x) || 1) : e.face; startMove(e, S, pickMove(e, S, tgt), W); } return;
    case 'wisp': { const w = S.wisp; w.t += dt; const k = Math.min(1, w.t / CS.final.wisp); e.x = w.x0 + (w.x1 - w.x0) * k; e.y = S.G.floorY - 30 - Math.sin(k * Math.PI) * 40; if (k >= 1) { e.y = S.G.floorY; startCombo(e, S, W); } return; }
  }
  if (e.mode.endsWith('Tell') || ['thrust', 'bash', 'sweep', 'chop', 'feint', 'lunge', 'flurry', 'breaker', 'whirl'].includes(e.mode)) return stepMove(e, S, dt, heroes, tgt, W);
  /* a set breaks at its floor, once the move in hand is done */
  if (!S.final && e.hp <= CS.floors[S.si] * e.maxHp + 0.01) { S.n.leaves++; S.sets.push(S.set); S.si++; if (S.si < CS.order.length) { S.set = CS.order[S.si]; S.rack = S.si; } else S.rack = 0; setMode(e, 'leave', CS.leave); W.sound('leave'); W.say && W.say('leaves', e.x, e.y); return; }
  if (S.final) return startCombo(e, S, W);
  return think(e, S, dt, tgt, W);
}
/* each set: its A move (the steady one) and its B move (the one that earns the opening, on its own cooldown); RANGE: from how far each is started */
const A_MOVE = { knight: 'thrust', halberd: 'sweep', duelist: 'lunge', greatsword: 'breaker' }, B_MOVE = { knight: 'bash', halberd: 'chop', duelist: 'flurry', greatsword: 'whirl' };
export const RANGE = { thrust: 38, sweep: 70, lunge: 150, breaker: 60, bash: 170, chop: 90, flurry: 34, whirl: 64 };
function pickMove(e, S, tgt) { return S.combo % 2 === 1 ? B_MOVE[S.set] : A_MOVE[S.set]; }
/* FINAL: three moves, each from a different rack (told: the rack lights), then the wisp crosses */
function startCombo(e, S, W) {
  if (S.combo >= CS.final.combo) { S.combo = 0; S.n.wisps++; const from = S.rack, opts = S.G.racks.map((r, i) => i).filter(i => i !== from), to = opts[(S.n.wisps * 7) % opts.length];
    S.wisp = { x0: e.x, x1: S.G.racks[to].x, t: 0 }; S.rack = to; S.set = S.G.racks[to].set; setMode(e, 'wisp', CS.final.wisp); W.sound('wisp'); W.say && W.say('wisp', e.x, e.y); return; }
  const opts = S.G.racks.map((r, i) => i).filter(i => i !== S.rack); const i = opts[(S.n.swaps * 5 + S.combo) % opts.length]; S.n.swaps++; S.combo++; S.rack = i; S.set = S.G.racks[i].set;
  setMode(e, 'swap', CS.final.swap); W.sound('swap'); W.mark && W.mark('!', { x: S.G.racks[i].x, y: S.G.floorY - 10 });
}
function think(e, S, dt, tgt, W) {
  if (!tgt) return; const dx = tgt.x - e.x, ad = Math.abs(dx);
  e.face = Math.sign(dx) || e.face || 1;
  const sp = CS.speed[S.set], want = S.set === 'halberd' ? 50 : S.set === 'duelist' ? 60 : 26;
  if (ad > want) e.x += e.face * Math.min(ad - want, sp * dt); else if (S.set === 'halberd' && ad < 30) e.x -= e.face * sp * 0.6 * dt;
  e.x = Math.max(S.G.x0 + 16, Math.min(S.G.x1 - 16, e.x));
  if (S.cd.a > 0) return;
  S.aim = tgt; const a = A_MOVE[S.set], b = B_MOVE[S.set]; let m = S.cd.b <= 0 && ad < RANGE[b] ? b : ad < RANGE[a] ? a : null;
  if (S.set === 'duelist' && m === 'lunge' && (S.n.lunges + S.n.feints) % 3 === 2 && !S.fed) { S.fed = true; S.n.feints++; startMove(e, S, 'feint', W); return; }
  if (m) { S.fed = false; startMove(e, S, m, W); }
}
const TELL = { thrust: '!', bash: '!!', sweep: '!!', chop: '!!', feint: '!', lunge: '!', flurry: '!', breaker: '!!', whirl: '!!' };
function startMove(e, S, m, W) {
  const set = SET_OF_MOVE[m] || S.set, M = CS[set][m === 'feint' ? 'feint' : m];
  S.mv = (S.mv || 0) + 1; if (m === 'flurry') S.flurry = { i: 0, blocked: 0, reached: 0 };
  if (m === 'bash' || m === 'whirl' || m === 'chop') S.missed = true;
  if (m === 'chop') { const t = S.aim; S.chopAt = e.x + e.face * Math.max(20, Math.min(64, t ? Math.abs(t.x - e.x) : CS.halberd.chop.at)); }   /* the chop is aimed where you stand as he raises it: MOVE */
  setMode(e, m + 'Tell', M.tell); W.sound(m + 'Tell'); W.mark && W.mark(TELL[m], e);
}
const front = (e, h, reach) => Math.abs(h.x - e.x) < reach && (Math.sign(h.x - e.x) || 1) === (e.face || 1);
const onFloor = (S, h) => Math.abs(h.y - S.G.floorY) < 30;
function hit(e, S, h, m, dmg, o, W) { const r = W.hitHero(h, dmg, m, m + S.mv + '.' + (m === 'flurry' ? S.flurry.i : 0) + ':' + h.id, o); if (r) S.n.hits++; return r; }   /* keyed once a blow (a flurry: once a stab) */
function stepMove(e, S, dt, heroes, tgt, W) {
  const tellOf = e.mode.endsWith('Tell') ? e.mode.slice(0, -4) : null;
  if (tellOf) { if (e.modeT > 0) { if (tgt && tellOf !== 'bash' && tellOf !== 'lunge') e.face = Math.sign(tgt.x - e.x) || e.face; return; } return release(e, S, tellOf, heroes, W); }
  const m = e.mode, set = SET_OF_MOVE[m] || S.set;
  switch (m) {
    case 'bash': case 'lunge': { const M = CS[set][m]; e.x += e.face * M.dash * dt; e.x = Math.max(S.G.x0 + 16, Math.min(S.G.x1 - 16, e.x));
      for (const h of heroes) if (h.alive && !h.dodging && onFloor(S, h) && Math.abs(h.x - e.x) < M.w) { const r = hit(e, S, h, m, M.dmg, { blockable: m === 'lunge' }, W); if (r) S.missed = false; }
      if (e.modeT <= 0) { if (m === 'bash' && S.missed && !S.final) { S.n.bashMiss++; return opening(e, S, 'stumble', CS.open, CS.openCap, W); } done(e, S, m, W); } return; }
    case 'whirl': { const M = CS.greatsword.whirl; if (tgt) e.x += (Math.sign(tgt.x - e.x) || 1) * M.v * dt; e.x = Math.max(S.G.x0 + 16, Math.min(S.G.x1 - 16, e.x));
      for (const h of heroes) if (h.alive && !h.dodging && onFloor(S, h) && Math.abs(h.x - e.x) < M.reach) { const r = hit(e, S, h, 'whirl', M.dmg, { unblockable: true }, W); if (r) S.missed = false; }
      if (e.modeT <= 0) { if (S.missed && !S.final) { S.n.whirlMiss++; return opening(e, S, 'dizzy', CS.open, CS.openCap, W); } done(e, S, m, W); } return; }
    case 'flurry': { if (e.modeT > 0) return; const F = S.flurry; F.i++; if (F.i < CS.duelist.flurry.n) { setMode(e, 'flurryTell', CS.duelist.flurry.tell); W.sound('flurryTell'); W.mark && W.mark('!', e); return; }
      if (F.reached === CS.duelist.flurry.n && F.blocked === CS.duelist.flurry.n && !S.final) { S.n.flurryBlocked++; return opening(e, S, 'winded', CS.open, CS.openCap, W); } done(e, S, m, W); return; }
    case 'feint': { e.x -= e.face * 60 * dt; if (e.modeT <= 0) setMode(e, 'walk', 0.1); return; }
    default: if (e.modeT <= 0) done(e, S, m, W); return;
  }
}
function release(e, S, m, heroes, W) {
  const set = SET_OF_MOVE[m] || S.set, M = m === 'feint' ? CS.duelist.feint : CS[set][m]; W.sound(m);
  switch (m) {
    case 'thrust': S.n.thrusts++; for (const h of heroes) if (h.alive && onFloor(S, h) && front(e, h, M.reach)) hit(e, S, h, m, M.dmg, { blockable: true }, W); return setMode(e, m, M.act);
    case 'bash': S.n.bashes++; return setMode(e, m, M.act);
    case 'lunge': S.n.lunges++; return setMode(e, m, M.act);
    case 'feint': return setMode(e, m, M.back);
    case 'sweep': S.n.sweeps++; for (const h of heroes) if (h.alive && h.ground && onFloor(S, h) && Math.abs(h.x - e.x) < M.reach) hit(e, S, h, m, M.dmg, { low: true }, W); return setMode(e, m, M.act);
    case 'chop': { S.n.chops++; const cx = S.chopAt !== undefined ? S.chopAt : e.x + e.face * M.at; for (const h of heroes) if (h.alive && !h.dodging && onFloor(S, h) && Math.abs(h.x - cx) < M.w) { if (hit(e, S, h, m, M.dmg, { unblockable: true }, W)) S.missed = false; }
      if (S.missed && !S.final) { S.n.chopMiss++; W.shake && W.shake(4); return opening(e, S, 'stuck', CS.open, CS.openCap, W); } return setMode(e, m, M.act); }
    case 'flurry': { if (S.flurry.i === 0) S.n.flurries++; const F = S.flurry; for (const h of heroes) if (h.alive && onFloor(S, h) && front(e, h, M.reach)) { F.reached++; const r = hit(e, S, h, m, M.dmg, { blockable: true }, W); if (r === 'blocked') F.blocked++; } return setMode(e, m, 0.12); }
    case 'breaker': S.n.breakers++; for (const h of heroes) if (h.alive && !h.dodging && onFloor(S, h) && front(e, h, M.reach)) hit(e, S, h, m, M.dmg, { unblockable: true, breaker: true }, W); W.shake && W.shake(5); return setMode(e, m, M.act);
    case 'whirl': S.n.whirls++; return setMode(e, m, M.spin);
  }
}
function done(e, S, m, W) {
  const set = SET_OF_MOVE[m] || S.set;
  if (['bash', 'chop', 'flurry', 'whirl'].includes(m)) S.cd.b = CS[set][m].cd; S.cd.a = (CS[set][m] && CS[set][m].cd ? Math.min(1.4, CS[set][m].cd * 0.5) : 0.8);
  if (S.final) return startCombo(e, S, W);
  setMode(e, 'recover', 0.35);
}
