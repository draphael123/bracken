// src/goblin-princess.js - THE GOBLIN PRINCESS, HIGHCROWN's mini-boss in THE BELL TOWER (claude/highcrown3; Daniel 11-06 22:22, scratch/lane-reports/hcplan.md sec 2,
// APPROVED 11-06 22:34). The Queen's spoiled daughter, kin of the Undercrown's buried Prince: quick, vain, cowardly. She is the BELL + WINCH rule
// rehearsed before her mother (src/bell-winch.js is the shared rule code):
//   THE CHASE       on THE BATTLEMENTS she flees along the wall top ahead of you, out of reach ("she is too quick - corner her"), and rings each tower's
//                   ALARM BELL: its guardroom door rises - strike its WINCH 3 times (each inside 2 s) before the horn and the gate drops; else the wave is out.
//                   Once per checkpoint life: a death after she has reached her tower does not replay it.
//   THE BELL TOWER  cornered: RAPIER LUNGE (! glint: PARRY it -> she staggers), 3-POKE FLURRY (! then she PREENS: a free window), TRINKET TOSS (gems that
//                   bounce; a blow knocks one away), FAN GUST (a push along the floor, never off anything), 'GUARDS!' HANDBELL at 70 / 35 % (strike the winch
//                   by her guardroom door, or the guards come and she HIDES behind them), BELFRY HOP (up onto the landing, under the tower bell's grate).
//                   THE TOWER BELL is your opening: ring its rope (a blow, any seat) and she BOLTS for the roof hatch on the landing - under the grate
//                   when it drops = PINNED. (claude/hcfix) The grate drops on a TIMED blow on the winch, while it BLAZES (too soon: she ducks; too late:
//                   she slips out). An arrow, a thrown axe or an ember is a blow on the rope, the winch and her gems. Below half: the TANTRUM - quicker, TIARA BOOMERANG (parry it: it conks her, STUNNED 2.5 s, x1.25),
//                   STOMP ripple (jump it). (gq3 11-09) At 0 she DIES (mode 'dying' 1.8 s: reels, kneels and rings her handbell 3 weak times - the Great Hall's bell answers from the east, THE QUEEN HAS HEARD - collapses): a body, the stair door opens.
//   THE REHEARSAL   (the banquet hall before the battlements) her CAPTAIN (a heavy elite) storms to the sound of the hall's bell rope - under the grate when
//                   it drops he is pinned; the servery door horns, and its winch keeps the garrison in. No boss: a puzzle.
// Resist 0.5x outside openings (0.4x hiding behind a guard: never less, never invulnerable). A single opening takes no more than GP.capK of her bar.
// main.js calls makeGoblinPrincessHands(ctx): spawn, owns, update, take, frame, barName, drawOver, end, read, level, drawWorld, clear, load, labDuty.
import * as BW from './bell-winch.js';
import * as GPA from './redraw/goblin_princess_art.js'; import * as HC3A from './redraw/hc3_art.js'; import * as HC2A from './redraw/highcrown2_art.js';   /* (claude/hc3art) her sprite set, the battlements' doors, winches, bells, ropes and hatch, and the grate's warning (drawing only) */

export const GP = {
  hp: 1080, w: 12, h: 20, markH: 34, walk: 80, back: 160, keep: 30,
  resist: 0.4, hideResist: 0.4, preenMul: 1.0, staggerMul: 1.0, stunMul: 1.15, pinMul: 1.15, capK: 0.10, endAt: 0, shotUp: 0.85,
  gap: [0.5, 0.4],                                                         /* between her moves; phase two x0.8 */
  lunge: { tell: 0.55, t: 0.18, dist: 70, dmg: 31, reach: 30, stagger: 1.0 },
  flurry: { tell: 0.4, gap: 0.16, n: [3, 4], dmg: 13, reach: 30, preen: 1.2 },
  trinket: { tell: 0.5, n: [2, 3], dmg: 9, life: 1.5, fly: 0.7, g: 520, r: 4 },
  fan: { tell: 0.6, t: 0.5, push: 140, dmg: 6, reach: 120 },
  hop: { tell: 0.4, stay: [3, 5], every: 1.3 },
  guards: { at: [0.75, 0.4], gapMin: 14, horn: 6.0, crank: 3, win: 2.0, closeAfter: 1.0, kinds: [['soldier'], ['soldier', 'javelin']] },
  bell: { cd: 12, queue: 1.0, glow: 0.9, glowUp: 0.6, win: 0.6, lead: 3.4, react: [0.08, 0.3], pin: 2.5, under: 13, shove: 14, duck: 0.6, bolt: 200, hup: 0.3 },
  tiara: { tell: 0.6, out: 220, speed: 300, dmg: 18, stun: 2.5 },
  stomp: { tell: 0.5, t: 0.5, dmg: 20, speed: 220 },
  tantrum: 1.0, escape: 2.0, dying: { reel: 0.3, ring: 0.9, collapse: 0.6, answer: 0.4 },   /* (gq3 item 2) she DIES: reels, kneels and rings her brass handbell 3 weak times, collapses; the Great Hall's bell answers 0.4 s later */
  chase: { lead: 150, run: 175, hold: 260, ring: 0.6, horn: 6.0, crank: 3, win: 2.0, closeAfter: 1.0 },
  reh: { cd: 12, queue: 1.0, glow: 0.9, walk: 110, walkMax: 3.5, pin: 2.5, pinMul: 1.15, under: 14, hornAfter: 4, horn: 6.0, crank: 3, win: 2.0, closeAfter: 1.0 },
};
export const CHAINS = {
  1: [['lunge', 'flurry', 'trinket'], ['fan', 'lunge', 'hop'], ['flurry', 'trinket', 'lunge', 'fan']],
  2: [['lunge', 'tiara', 'flurry', 'stomp'], ['trinket', 'fan', 'tiara', 'hop'], ['stomp', 'lunge', 'flurry', 'tiara', 'trinket']],
};
/* the told marks (src/marks.js reads these: tools/tells) */
export const GP_MODES = { lungeTell: '!', flurryTell: '!', trinketTell: '!', fanTell: '!!', hopTell: '!', tiaraTell: '!', stompTell: '!!' };
const SAFE = new Set(['walk', 'recover', 'preen', 'perch', 'stand', 'hide']);
export const gpOpen = e => !!e && (e.mode === 'pinned' || e.mode === 'stunned' || e.mode === 'preen' || e.mode === 'stagger');
export const gpMul = e => !e ? GP.resist : e.mode === 'pinned' ? GP.pinMul : e.mode === 'stunned' ? GP.stunMul : e.mode === 'preen' ? GP.preenMul : e.mode === 'stagger' ? GP.staggerMul : e.hiding ? GP.hideResist : GP.resist;

/* ---------- THE BOT'S READING (src/lab.js) ----------
   s = { P: { x, y, face, ground, atk }, e, F, reach, shield, t, mem } -> { gx, face, atk, jump, block, dodge, why }. Parry/block the lunge and the tiara on their tell,
   block the flurry then cut the preen, jump the stomp, step out of the fan, cut every opening; the duties (bell, winch) come from H.labDuty first. */
export function gpPlan(s) {
  const { P, e, F, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, why: '' };
  const A = F.A, side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x), toHer = -side, m = e.mode;
  const clamp = x => Math.max(A.x0 + 12, Math.min(A.xMax - 4, x));
  if (gpOpen(e)) { out.gx = clamp(e.x - toHer * Math.max(8, reach * 0.6)); out.face = toHer; out.atk = ad < reach + 10 && P.atk < 0; if (m === 'pinned' && Math.abs(P.y - e.y) > 20 && P.ground) out.jump = true; out.why = 'cut her: ' + m; return out; }
  if (m === 'stompTell' || m === 'stomp') { if (P.ground && (m === 'stomp' || e.modeT < 0.15)) out.jump = true; out.why = 'jump the ripple'; return out; }
  if ((m === 'lungeTell' || m === 'tiaraTell' || m === 'flurryTell' || m === 'flurry') && ad < 90) { out.face = toHer; out.block = true; out.why = 'parry / block'; return out; }
  if (m === 'fanTell' && ad < GP.fan.reach) { out.block = true; out.face = toHer; out.why = 'brace the fan'; return out; }
  if (F.tiara && Math.abs(F.tiara.x - P.x) < 60) { out.block = true; out.face = Math.sign(F.tiara.x - P.x) || P.face; out.why = 'parry the tiara'; return out; }
  if (e.y < A.floor - 8) { out.gx = clamp(e.x + side * 40); out.why = 'under the landing'; return out; }
  if ((m === 'walk' || m === 'recover') && ad < reach + 8 && P.atk < 0) { out.face = toHer; out.atk = true; out.why = 'cut her between'; return out; }
  out.gx = clamp(e.x + side * Math.max(22, reach - 4)); out.face = toHer; out.why = 'close in';
  return out;
}

export function makeGoblinPrincessHands(ctx) {
  const TS = ctx.TS, H = {};
  let F = null;                      /* the fight */
  let C = null, chaseDone = false;   /* the chase on the battlements (done = she is in her tower: never replayed this visit) */
  let TW = new Map();                /* the towers' waves */
  let RH = null;                     /* the banquet rehearsal */
  const R = Math.round, sign = v => (v < 0 ? -1 : 1), now = () => ctx.time();
  const sfx = k => { const f = ctx.sfx && ctx.sfx[k]; if (f) f(); };
  const L = () => ctx.L;
  const A = () => (L() && L().mini && L().mini.boss === 'gprincess' ? L().mini : null);
  const live = () => ctx.enemies().find(q => q.t === 'gprincess' && q.alive);
  const seats = fn => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (ctx.upright(pp) && !P.dead) fn(P, pp); }); };
  const seatN = () => Math.max(1, ctx.players.filter(p => !p.dead).length);
  const nearest = e => { let b = null, bd = 1e9; seats(P => { const d = Math.abs(P.x - e.x) + Math.abs(P.y - e.y) * 0.5; if (d < bd) { bd = d; b = { x: P.x, y: P.y, ground: P.ground }; } }); return b || ctx.hero(); };
  const front = () => { let x = -1e9; seats(P => { x = Math.max(x, P.x); }); return x; };
  /* (claude/hcfix) A RANGED HIT IS A BLOW: an arrow, a thrown axe or an ember in flight that meets the rope, a winch or a gem counts as a blow on it (once a shot;
     an arrow drops there), so the ranger plays her bell tower as the blades do (hcproof sec 'why the bots win': she could not ring, crank or knock a gem) */
  const usedShots = new WeakSet();
  const shotOn = box => { for (const q of (ctx.shots ? ctx.shots() : [])) { if (!q || usedShots.has(q) || q.x < box.l - 3 || q.x > box.r + 3 || q.y < box.t - 3 || q.y > box.b + 3) continue;
    usedShots.add(q); if (F) F.n.shots++; if (q.state === 'fly') { q.state = 'drop'; q.vx = (q.vx || 0) * -0.1; q.vy = -40; } else if (q.life > 0 && q.state === undefined) q.life = 0; return true; } return false; };
  const blowOn = (box, key) => { let any = false; seats(P => { if (BW.struck(ctx.attackBox, ctx.overlap, P, box, key)) any = true; }); return any || shotOn(box); };
  H.on = () => !!(L() && (L().gpChase || L().gpRehearsal || A()));
  H.owns = e => e.t === 'gprincess';
  H.towersLit = () => new Set(TW.keys());   /* (claude/hc3art) the signal braziers burn on the towers whose alarm she rang */
  H.hidden = e => !!(e && e.mode === 'sleep' && L() && L().gpChase && !chaseDone);   /* (claude/hc3art, highcrown3 q7) not drawn in her tower while the chase is still running along the wall */
  H.fight = () => F;
  H.load = () => { F = null; C = null; chaseDone = false; TW = new Map(); RH = null; };
  /* a respawn (spawnEntities): the fight goes; the chase starts again only if she had not reached her tower; the towers' and the banquet's state with it */
  H.clear = () => { F = null; if (!chaseDone) C = null; TW = new Map(); RH = null; if (ctx.grateClear) ctx.grateClear(); };

  /* ======================= THE FIGHT ======================= */
  H.spawn = base => {
    const Ar = A();
    F = { A: Ar ? { ...Ar, xMax: Ar.x1 - 3 * TS - 8 } : { x0: base.x - 200, x1: base.x + 200, xMax: base.x + 150, floor: base.y }, ph: 1, cycle: 0, step: 0, chain: CHAINS[1][0].slice(), act: 0, gems: [], tiara: null, ripples: [],
      M: { cd: 0, queued: 0, rings: 0 }, bolt: null, wave: null, waves: new Set(), guards: [], lastWaveT: -99, openTaken: 0, idN: 0, said: {}, ropeKey: {}, winchKey: {}, gemKeys: new WeakMap(),
      n: { lunges: 0, staggers: 0, flurries: 0, preens: 0, trinkets: 0, knocked: 0, fans: 0, hops: 0, rings: 0, pins: 0, ducks: 0, tiaras: 0, stuns: 0, stomps: 0, waves: 0, kept: 0, joined: 0, capped: 0, parries: 0, hides: 0, early: 0, slips: 0, shots: 0 }, hurt: {}, t0: now() };
    return { ...base, t: 'gprincess', w: GP.w, h: GP.h, hp: ctx.EHP.gprincess, maxHp: ctx.EHP.gprincess, mini: true, noGrav: true, markH: GP.markH, face: -1, mode: 'sleep', modeT: 0, phase: 1, hiding: false };
  };
  const set = (e, m, t) => { e.mode = m; e.modeT = t; };
  const tell = (e, m, t) => { set(e, m, t); const P = nearest(e); e.face = sign(P.x - e.x); const mk = GP_MODES[m]; if (mk) { ctx.number(e.x, e.y - GP.markH, mk, mk === '!' ? '#ffd36b' : '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(mk !== '!'); } };
  const keyed = (pp, key) => { pp.gpKeys = pp.gpKeys || new Map(); if (pp.gpKeys.size > 60) pp.gpKeys.clear(); if (pp.gpKeys.has(key)) return true; pp.gpKeys.set(key, 1); return false; };
  /* her blows: every seat on his feet; blockable ones are the ones a parry answers (the shared RP.parried counter moved = parried) */
  function hit(e, bx, d, name, o = {}) {
    const out = [];
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
      if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || (o.key && keyed(pp, o.key))) return;
      const n0 = ctx.parries ? ctx.parries() : 0, h0 = P.hp;
      const r = ctx.damagePlayer(o.fromX ?? e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock });
      if (F) F.hurt[name] = (F.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp));
      if (F) { globalThis.__gpHurt = F.hurt; globalThis.__gpN = F.n; }   /* (hcproof) the per-move damage tally, read by tools/boss-run.mjs */
      const parried = !!(ctx.parries && ctx.parries() > n0); if (parried && F) F.n.parries++;
      if (o.push && !P.dead) { const dir = sign(P.x - (o.fromX ?? e.x)), k = r === 'blocked' || parried ? 0.5 : 1; P.vx = dir * o.push * 2 * k; }
      out.push({ pp, r, parried }); });
    return out;
  }
  const fl = () => F.A.floor;
  const onLanding = e => !!(F.A.land && e.y < fl() - 8);
  const gx = () => F.A.grate ? F.A.grate.col * TS + 8 : null;
  function next(e) {
    if (F.step >= F.chain.length) { F.cycle++; const set2 = CHAINS[F.ph]; F.chain = set2[F.cycle % set2.length].slice(); F.step = 0; }
    const k = F.chain[F.step++]; F.act++; F.cur = { k, id: F.act };
    if (k === 'lunge') return tell(e, 'lungeTell', GP.lunge.tell * (F.ph === 2 ? 0.85 : 1));
    if (k === 'flurry') { F.cur.n = GP.flurry.n[F.ph - 1]; return tell(e, 'flurryTell', GP.flurry.tell); }
    if (k === 'trinket') return tell(e, 'trinketTell', GP.trinket.tell);
    if (k === 'fan') return tell(e, 'fanTell', GP.fan.tell);
    if (k === 'hop') { if (!F.A.land) return set(e, 'walk', 0.2); return tell(e, 'hopTell', GP.hop.tell); }
    if (k === 'tiara') return tell(e, 'tiaraTell', GP.tiara.tell);
    if (k === 'stomp') return tell(e, 'stompTell', GP.stomp.tell);
  }
  const after = (e, extra = 0) => set(e, 'recover', GP.gap[F.ph - 1] * (F.ph === 2 ? 0.8 : 1) + extra);
  const front2 = (e, r, top = 26) => (e.face || 1) > 0 ? [e.x - 6, e.x + r, e.y - top, e.y] : [e.x - r, e.x + 6, e.y - top, e.y];
  function throwGems(e, n) { const P = nearest(e);
    for (let i = 0; i < n; i++) { const tx = P.x + (i - (n - 1) / 2) * 26, T = GP.trinket.fly, sx = e.x + (e.face || 1) * 6, sy = e.y - 18;
      F.gems.push({ id: ++F.idN, x: sx, y: sy, vx: (tx - sx) / T, vy: (fl() - 4 - sy) / T - 0.5 * GP.trinket.g * T, bounces: 0, life: GP.trinket.life + T, key: 'gpg' + F.idN, col: ['#e04a6a', '#4ac0e0', '#e0c04a'][i % 3] }); }
    F.n.trinkets++; sfx('throwWhoosh'); }
  function stepGems(e, dt) {
    for (const q of F.gems) {
      q.life -= dt; if (q.life <= 0) { q.dead = true; continue; }
      if (!q.away && blowOn({ l: q.x - 7, r: q.x + 7, t: q.y - 7, b: q.y + 7 }, F.gemKeys.get(q) || (F.gemKeys.set(q, {}), F.gemKeys.get(q)))) { q.away = true; q.vx = -q.vx * 1.2; q.vy = -160; F.n.knocked++; sfx('parry'); }
      q.vy += GP.trinket.g * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      const floorY = onLandingX(q.x, q.y) ? F.A.land.y : fl();
      if (q.y >= floorY - 2 && q.vy > 0) { q.y = floorY - 2; if (q.bounces < 2) { q.bounces++; q.vy = -q.vy * 0.45; q.vx *= 0.7; sfx('clank'); } else { q.vy = 0; q.vx *= 0.9; } }
      if (q.x < F.A.x0 + 4 || q.x > F.A.x1 - 4) q.vx = -q.vx;
      if (!q.away) hit(e, [q.x - GP.trinket.r, q.x + GP.trinket.r, q.y - GP.trinket.r, q.y + GP.trinket.r], GP.trinket.dmg, 'HER TRINKETS', { key: q.key, blockable: true, fromX: q.x, noKnock: true });
    }
    F.gems = F.gems.filter(q => !q.dead);
  }
  const onLandingX = (x, y) => !!(F.A.land && x >= F.A.land.x0 && x <= F.A.land.x1 && y <= F.A.land.y + 2);
  /* THE TIARA: out 220 px along her facing and back to her hand. Parried (out or back) it flies home and CONKS her */
  function stepTiara(e, dt) {
    const T = F.tiara; if (!T) return;
    if (T.state === 'out') { T.x += T.dir * GP.tiara.speed * dt; if (Math.abs(T.x - T.x0) >= GP.tiara.out || T.x < F.A.x0 + 6 || T.x > F.A.x1 - 6) { T.state = 'back'; T.key = T.key + 'b'; } }
    else { const d = e.x - T.x; T.x += sign(d) * GP.tiara.speed * (T.home ? 1.4 : 1) * dt; if (Math.abs(d) < 10) { F.tiara = null;
      if (T.home) { stun(e); } else if (e.mode === 'tiaraWait') after(e); return; } }
    if (!T.home) { const r = hit(e, [T.x - 7, T.x + 7, T.y - 6, T.y + 6], GP.tiara.dmg, 'HER TIARA', { key: T.key, blockable: true, fromX: T.x });
      if (r.some(q => q.parried)) { T.home = true; T.state = 'back'; ctx.number(T.x, T.y - 16, 'PARRIED: IT FLIES HOME', '#8fd160'); sfx('parry'); } }
  }
  function stun(e) { if (!e.alive || e.mode === 'escape') return; set(e, 'stunned', GP.tiara.stun); F.openTaken = 0; F.n.stuns++; ctx.shake(4); ctx.burst(e.x, e.y - 20, 14, ['#e0c04a', '#fff6c8'], 70, 0.6); ctx.number(e.x, e.y - 50, 'CONKED BY HER OWN TIARA: STUNNED', '#8fd160'); sfx('golemChime'); }
  function stepRipples(e, dt) {
    for (const w of F.ripples) { w.t -= dt; w.x += w.dir * GP.stomp.speed * dt; if (w.t <= 0 || w.x < F.A.x0 || w.x > F.A.x1) { w.dead = true; continue; }
      hit(e, [w.x - 6, w.x + 6, fl() - 8, fl()], GP.stomp.dmg, 'HER STOMP', { key: w.key, noKnock: true, fromX: w.x }); }
    F.ripples = F.ripples.filter(w => !w.dead);
  }
  /* 'GUARDS!': the handbell at 70 / 35 %; her guardroom door rises and the horn runs; the winch by it keeps them in */
  function guardsCall(e, idx) {
    F.lastWaveT = now(); F.n.waves++;
    F.wave = BW.waveOpen(now(), GP.guards.horn, { idx });
    set(e, 'handbell', 0.8); ctx.number(e.x, e.y - 50, 'GUARDS!', '#ff6b6b'); sfx('seaBell'); sfx('bellow');
    if (F.A.door) ctx.number(F.A.winch || F.A.door, fl() - 44, 'STRIKE THE WINCH', '#ffd36b');
    ctx.hint && ctx.hint('HER GUARDROOM DOOR IS RISING. STRIKE THE WINCH BESIDE IT 3 TIMES, QUICKLY, AND IT DROPS.');
  }
  /* (claude/hcfix) THE GRATE'S RELEASE IS THE WINCH, AND IT IS TIMED: while she bolts, the winch holds the tower grate. Strike it while the grate BLAZES (she is set
     under it: GP.bell.win s) and it drops on her - PINNED. Strike it sooner and she sees it come and ducks; let the blaze pass and she slips out from under.
     (hcproof: the pin was free - any hero who rang the rope got it; mashing the winch now spends it.) */
  function stepRelease(e) {
    const B = F.bolt; if (!B || !F.A.winch) return;
    if (!blowOn({ l: F.A.winch - 10, r: F.A.winch + 10, t: fl() - 26, b: fl() }, F.winchKey)) return; F.winchKey = {}; sfx('clank'); ctx.shake(2);
    if (B.state === 'ready') { dropGrate(e); return; }
    F.bolt = null; F.glowK = 0; F.n.early++; if (ctx.grateDrop && F.A.grate) ctx.grateDrop(F.A.grate.col, F.A.grate.gy0, F.A.grate.gy1, 0.6);
    set(e, 'ducked', GP.bell.duck); ctx.number(e.x, e.y - 50, 'TOO SOON: SHE SEES IT COME', '#c9c9d6'); sfx('gateDrop');
  }
  function stepWave(e) {
    const W = F.wave; if (!W) return; const t = now();
    if (W.state === 'open' && F.A.winch && !F.bolt && blowOn({ l: F.A.winch - 10, r: F.A.winch + 10, t: fl() - 26, b: fl() }, F.winchKey)) { F.winchKey = {};
      const r = BW.crankWinch(W, t, GP.guards.crank, GP.guards.win); sfx('clank'); ctx.shake(2);
      if (r === 'kept') { F.n.kept++; F.wave = null; ctx.number(F.A.winch, fl() - 44, 'THE GATE DROPS: GUARDS KEPT IN', '#8fd160'); sfx('gateDrop'); return; }
      ctx.number(F.A.winch, fl() - 40, r + ' / ' + GP.guards.crank, '#ffd36b'); }
    const ev = BW.waveTick(W, t, GP.guards.win, GP.guards.closeAfter);
    if (ev === 'spawn') { const kinds = BW.waveKinds(GP.guards.kinds[Math.min(W.idx, GP.guards.kinds.length - 1)], seatN()), col = Math.floor((F.A.door || F.A.x1 - 40) / TS);
      kinds.forEach((t, i) => { const got = ctx.spawnEnt({ t, x: col - i, y: Math.floor(fl() / TS) - 1, face: -1 }) || []; for (const g of got) { g.gpGuard = true; F.guards.push(g); } });
      F.n.joined++; ctx.number(F.A.door || e.x, fl() - 50, 'HER GUARDS ARE OUT', '#ff6b6b'); sfx('gateDrop'); ctx.shake(3); }
    if (ev === 'close') F.wave = null;
  }
  /* she HIDES while a guard of hers stands between her and the hero she fears */
  function hidingNow(e, P) { F.guards = F.guards.filter(g => g.alive); return F.guards.some(g => sign(g.x - e.x) === sign(P.x - e.x) && Math.abs(g.x - e.x) < Math.abs(P.x - e.x) && Math.abs(g.y - e.y) < 30); }
  /* THE TOWER BELL: the rope on the floor's west side; any seat's blow rings it */
  function stepBell(e) {
    const Ar = F.A; if (!Ar.rope) return; const t = now();
    if (blowOn({ l: Ar.rope - 8, r: Ar.rope + 8, t: fl() - 34, b: fl() }, F.ropeKey)) { F.ropeKey = {};
      if (BW.ringBell(F.M, t, GP.bell.cd, GP.bell.queue) === 'swinging') { ctx.number(Ar.rope, fl() - 40, 'STILL SWINGING', '#c9c9d6'); sfx('clank'); }
      else { F.n.rings++; ctx.number(Ar.rope, fl() - 40, 'YOU RING THE TOWER BELL', '#ffd36b'); sfx('seaBell'); sfx('clank'); ctx.shake(2); } }
    if (!F.bolt && SAFE.has(e.mode) && BW.ringFresh(F.M, t)) { F.M.queued = 0; boltBegin(e); }
  }
  function boltBegin(e) {
    const up = onLanding(e); F.bolt = { state: up ? 'up' : 'run', wait: up ? GP.bell.glowUp : GP.bell.glow, hup: 0, t0: now() };
    set(e, 'bolt', 9); e.hiding = false; ctx.number(e.x, e.y - 50, 'EEK! SHE BOLTS FOR THE HATCH', '#ff6b6b'); sfx('bellow');
    if (!F.said.release) { F.said.release = 1; ctx.hint && ctx.hint('THE WINCH HOLDS THE GRATE. STRIKE IT WHEN THE GRATE BLAZES, WITH HER UNDER IT. TOO SOON AND SHE DUCKS.'); }
  }
  function stepBolt(e, dt) {
    const B = F.bolt, g0 = gx(), Ar = F.A; if (!B || g0 == null) { F.bolt = null; after(e); return; }
    const dx = g0 - e.x; e.face = sign(dx) || e.face;
    if (B.state === 'run') { e.x += sign(dx) * Math.min(Math.abs(dx), GP.bell.bolt * dt); if (Math.abs(dx) < 6) { B.state = 'hup'; B.hup = GP.bell.hup; ctx.number(e.x, e.y - 40, 'HUP!', '#ffd36b'); } return; }
    if (B.state === 'hup') { B.hup -= dt; const k = 1 - Math.max(0, B.hup) / GP.bell.hup; e.y = fl() - (fl() - Ar.land.y) * k - Math.sin(k * Math.PI) * 10; if (B.hup <= 0) { e.y = Ar.land.y; B.state = 'up'; } return; }
    if (B.state === 'up') { e.x += sign(dx) * Math.min(Math.abs(dx), GP.bell.bolt * dt); if (Math.abs(dx) < 4) { B.state = 'glow'; } return; }
    if (B.state === 'glow') { B.wait -= dt; const left = Math.max(B.wait, GP.bell.lead - (now() - B.t0)); F.glowK = 0.75 * (1 - Math.min(1, Math.max(0, left) / GP.bell.glow));   /* (the blaze waits GP.bell.lead s from the ring: time to run from the rope to the winch) */
      if (left <= 0) { B.state = 'ready'; B.left = GP.bell.win; B.readyT = now(); B.react = GP.bell.react[0] + Math.random() * (GP.bell.react[1] - GP.bell.react[0]); F.glowK = 1;
        ctx.number(Ar.winch || e.x, fl() - 44, 'NOW!', '#ffd36b'); ctx.sfx.tell && ctx.sfx.tell(false); } return; }
    if (B.state === 'ready') { B.left -= dt; F.glowK = 1; if (B.left <= 0) { F.bolt = null; F.glowK = 0; F.n.slips++; set(e, 'ducked', GP.bell.duck); ctx.number(e.x, e.y - 50, 'SHE SLIPS OUT FROM UNDER IT', '#c9c9d6'); } }
  }
  function dropGrate(e) {
    const g0 = gx(), Ar = F.A; F.bolt = null; F.glowK = 0;
    if (ctx.grateDrop) ctx.grateDrop(Ar.grate.col, Ar.grate.gy0, Ar.grate.gy1, GP.bell.pin + 0.3);
    seats(P => { if (Math.abs(P.x - g0) < 14 && P.y <= Ar.land.y + 2 && P.y > Ar.land.y - 40) { ctx.damagePlayer(g0, GP.bell.shove, { unblockable: true, name: 'THE GRATE' }); P.x = g0 + (P.x < g0 ? -18 : 18); } });   /* on the landing at the drop: shoved clear */
    if (BW.underGrate(e.x, g0, GP.bell.under)) { set(e, 'pinned', GP.bell.pin); F.openTaken = 0; F.n.pins++; ctx.shake(6); ctx.burst(e.x, e.y - 20, 18, ['#5a5a68', '#c9c9d6', '#e0b040'], 80, 0.7); ctx.number(e.x, e.y - 50, 'THE GRATE PINS HER: CUT HER', '#8fd160'); }
    else { set(e, 'ducked', GP.bell.duck); F.n.ducks++; ctx.number(e.x, e.y - 50, 'SHE DUCKED', '#c9c9d6'); }
  }
  H.update = (e, dt) => {
    if (!F || !e.alive) return; const Ar = F.A, P = nearest(e), t = now();
    if (F.hp0 !== undefined) { const lost = F.hp0 - e.hp - (F.tookSince || 0); if (lost > 0.5) { F.n.bypass = (F.n.bypass || 0) + Math.round(lost); F.n.bypassAt = (F.n.bypassAt || '') + e.mode + ':' + Math.round(lost) + ' '; } } F.hp0 = e.hp; F.tookSince = 0;   /* (claude/hcfix) bar lost NOT through H.take (a measuring aid) */
    globalThis.__gpN = F.n;
    e.modeT -= dt; e.anim = (e.anim || 0) + dt;
    if (!onLanding(e) && e.mode !== 'hopUp' && e.mode !== 'escape' && !(F.bolt && F.bolt.state === 'hup')) e.y = fl();
    if (e.mode === 'sleep') { set(e, 'wake', 1.2); ctx.number(e.x, e.y - 50, 'TSK! YOU AGAIN?', '#ff9ad0'); return; }
    if (e.mode === 'escape') { stepEscape(e, dt); return; }
    if (e.mode === 'dying') { stepDying(e, dt); return; }
    if (F.ph === 1 && e.hp <= e.maxHp * 0.5) { F.ph = 2; e.phase = 2; F.chain = CHAINS[2][0].slice(); F.step = 0; F.cycle = 0; F.bolt = null; set(e, 'tantrum', GP.tantrum); ctx.number(e.x, e.y - 56, 'SHE THROWS A TANTRUM: NOT FAIR!', '#ff6b6b'); ctx.shake(4); ctx.music && ctx.music('goblinroyal'); }
    for (let i = 0; i < GP.guards.at.length; i++) if (e.hp <= e.maxHp * GP.guards.at[i] && !F.waves.has(i) && t - F.lastWaveT >= GP.guards.gapMin && SAFE.has(e.mode) && !F.wave) { F.waves.add(i); guardsCall(e, i); break; }
    stepGems(e, dt); stepTiara(e, dt); stepRipples(e, dt); stepRelease(e); stepWave(e); stepBell(e);
    e.hiding = SAFE.has(e.mode) && hidingNow(e, P); if (e.hiding && !F.said.hide) { F.said.hide = 1; F.n.hides++; ctx.number(e.x, e.y - 50, 'SHE HIDES BEHIND HER GUARD', '#c9c9d6'); }
    const fx = e.face || 1;
    switch (e.mode) {
      case 'wake': if (e.modeT <= 0) set(e, 'walk', 0.6); break;
      case 'tantrum': case 'handbell': case 'ducked': if (e.modeT <= 0) after(e); break;
      case 'recover': if (e.modeT <= 0) set(e, 'walk', 0.3); break;
      case 'walk': { const d = P.x - e.x, ad = Math.abs(d); e.face = sign(d) || e.face;
        if (onLanding(e)) { F.hop = { x0: e.x, x1: e.x, t: 0, down: true }; set(e, 'hopDown', 0.3); break; }   /* (her moves are the floor's: off the landing first) */
        if (e.hiding) { if (e.modeT <= 0) { F.cur = { k: 'trinket', id: ++F.act }; tell(e, 'trinketTell', GP.trinket.tell); } break; }   /* behind a guard: she pelts you over him */
        if (ad > GP.keep) e.x += sign(d) * Math.min(ad - GP.keep, GP.walk * dt);
        if (e.modeT <= 0) next(e); break; }
      case 'lungeTell': if (e.modeT <= 0) { set(e, 'lunge', GP.lunge.t); F.n.lunges++; sfx('slash'); } break;
      case 'lunge': { e.x += fx * GP.lunge.dist / GP.lunge.t * dt; const r = hit(e, front2(e, GP.lunge.reach), GP.lunge.dmg, 'HER RAPIER', { key: 'gpl' + F.act, blockable: true });
        if (r.some(q => q.parried)) { set(e, 'stagger', GP.lunge.stagger); F.openTaken = 0; F.n.staggers++; ctx.number(e.x, e.y - 46, 'PARRIED: SHE STAGGERS', '#8fd160'); sfx('parry'); break; }
        if (e.modeT <= 0) after(e); break; }
      case 'stagger': case 'stunned': case 'pinned': if (e.modeT <= 0) after(e, 0.2); break;
      case 'flurryTell': if (e.modeT <= 0) { if (!F.cur || F.cur.k !== 'flurry') F.cur = { k: 'flurry', id: ++F.act, n: GP.flurry.n[F.ph - 1] }; set(e, 'flurry', GP.flurry.gap); F.cur.poke = 0; F.n.flurries++; } break;
      case 'flurry': if (e.modeT <= 0) { F.cur.poke++; hit(e, front2(e, GP.flurry.reach), GP.flurry.dmg, 'HER POKES', { key: 'gpf' + F.act + '-' + F.cur.poke, blockable: true }); sfx('slash');
        if (F.cur.poke >= F.cur.n) { set(e, 'preen', GP.flurry.preen); F.n.preens++; F.openTaken = 0; if (!F.said.preen) { F.said.preen = 1; ctx.number(e.x, e.y - 50, 'SHE PREENS: CUT HER', '#8fd160'); } } else e.modeT = GP.flurry.gap; } break;
      case 'preen': if (e.modeT <= 0) after(e); break;
      case 'trinketTell': if (e.modeT <= 0) { throwGems(e, GP.trinket.n[F.ph - 1]); set(e, 'trinketThrow', 0.3); } break;
      case 'trinketThrow': if (e.modeT <= 0) { if (onLanding(e)) set(e, 'perch', F.perchLeft || 1); else after(e); } break;
      case 'fanTell': if (e.modeT <= 0) { set(e, 'fan', GP.fan.t); F.n.fans++; sfx('throwWhoosh'); hit(e, fx > 0 ? [e.x, e.x + GP.fan.reach, e.y - 30, e.y + 2] : [e.x - GP.fan.reach, e.x, e.y - 30, e.y + 2], GP.fan.dmg, 'HER FAN', { key: 'gpn' + F.act, blockable: true, push: GP.fan.push }); } break;
      case 'fan': if (e.modeT <= 0) { if (onLanding(e)) set(e, 'perch', F.perchLeft || 1); else after(e); } break;
      case 'hopTell': if (e.modeT <= 0) { F.n.hops++; const lx = Math.max(Ar.land.x0 + 12, Math.min(Ar.land.x1 - 12, gx() + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 3) * 16)); F.hop = { x0: e.x, x1: lx, t: 0 }; set(e, 'hopUp', 0.45); ctx.number(e.x, e.y - 40, 'HUP!', '#ffd36b'); } break;
      case 'hopUp': { F.hop.t += dt; const k = Math.min(1, F.hop.t / 0.45); e.x = F.hop.x0 + (F.hop.x1 - F.hop.x0) * k; e.y = fl() - (fl() - Ar.land.y) * k - Math.sin(k * Math.PI) * 14;
        if (k >= 1) { e.y = Ar.land.y; F.perchLeft = GP.hop.stay[0] + Math.random() * (GP.hop.stay[1] - GP.hop.stay[0]); set(e, 'perch', GP.hop.every); } break; }
      case 'perch': { e.face = sign(P.x - e.x) || e.face; F.perchLeft = (F.perchLeft || 0) - dt;
        if (F.perchLeft <= 0) { F.hop = { x0: e.x, x1: e.x, t: 0, down: true }; set(e, 'hopDown', 0.3); break; }
        if (e.modeT <= 0) { if (Math.random() < 0.6) tell(e, 'trinketTell', GP.trinket.tell); else tell(e, 'fanTell', GP.fan.tell); } break; }
      case 'hopDown': { F.hop.t += dt; const k = Math.min(1, F.hop.t / 0.3); e.y = Ar.land.y + (fl() - Ar.land.y) * k; if (k >= 1) { e.y = fl(); after(e); } break; }
      case 'tiaraTell': if (e.modeT <= 0) { F.n.tiaras++; F.tiara = { x: e.x + fx * 8, x0: e.x, y: e.y - 16, dir: fx, state: 'out', key: 'gpt' + F.act, home: false }; set(e, 'tiaraWait', 3); sfx('throwWhoosh'); } break;
      case 'tiaraWait': if (!F.tiara || e.modeT <= 0) { F.tiara = null; after(e); } break;
      case 'stompTell': if (e.modeT <= 0) { if (onLanding(e)) { after(e); break; } F.n.stomps++; for (const d of [-1, 1]) F.ripples.push({ x: e.x + d * 10, dir: d, t: GP.stomp.t * 2, key: 'gps' + F.act + d }); set(e, 'stomp', GP.stomp.t); ctx.shake(4); sfx('thud'); } break;
      case 'stomp': if (e.modeT <= 0) after(e); break;
      case 'bolt': stepBolt(e, dt); break;
      default: if (e.modeT <= -1) after(e);
    }
    if (!onLanding(e)) e.x = Math.max(Ar.x0 + 10, Math.min(Ar.xMax, e.x)); else e.x = Math.max(Ar.land.x0 + 6, Math.min(Ar.land.x1 - 6, e.x));
  };
  /* A BLOW ON HER: 0.5x outside openings (0.4x hiding), the opening's multiplier inside one (no more than GP.capK of her bar an opening); at 10 % she escapes */
  H.take = (e, dmg, tag) => {
    if (!F) return dmg;
    if (e.dyFinal) return dmg;   /* (gq3) the last blow the dying hands to the generic death: whole, so the body is a body */
    if (e.mode === 'dying') return 0;   /* (gq3) she is dead, not a guard: untouchable while she rings */
    if (e.mode === 'escape') return 0;   /* (the end of the fight: she is through the hatch - not a guard, a finish) */
    let d = dmg * gpMul(e);
    if (!gpOpen(e) && onLanding(e) && [].concat(tag || []).includes('shot')) d = dmg * GP.shotUp;   /* (claude/hcfix) UP ON THE LANDING she has no room to dodge an arrow: a SHOT there is x GP.shotUp (a blade must jump up to her and gets 0.4x) */
    if (gpOpen(e)) {   /* (claude/hcfix) the PREEN is capped too: uncapped, one riposte HEAVY took 340 of her bar and a warden ended her in 12 s */
      const cap = e.maxHp * GP.capK, room = Math.max(0, cap - F.openTaken); if (d > room) { d = room; F.n.capped++; } F.openTaken += d; if (F.openTaken >= cap - 0.01) e.modeT = Math.min(e.modeT, 0.3); }
    const floor = Math.max(1, e.maxHp * GP.endAt); if (e.hp - d <= floor) { d = Math.max(0, e.hp - floor); dyingBegin(e); }
    F.tookSince = (F.tookSince || 0) + d; if (d > (F.n.bigD || 0)) { F.n.bigD = Math.round(d); F.n.bigAt = e.mode + ' raw ' + Math.round(dmg) + ' tag ' + String(tag || '') + ' hp ' + Math.round(e.hp) + '/' + Math.round(e.maxHp); } return d;
  };
  function escapeBegin(e) {
    if (e.mode === 'escape') return; F.bolt = null; F.tiara = null; F.ripples = []; F.wave = null;
    set(e, 'escape', GP.escape); e.escT = 0; e.escX0 = e.x; e.escY0 = e.y; e.hiding = false;
    ctx.number(e.x, e.y - 56, 'MOTHER!', '#ff9ad0'); sfx('bellow'); ctx.shake(5);
    ctx.burst(e.x, e.y - 10, 10, ['#e04a6a', '#4ac0e0', '#e0c04a'], 70, 0.6);   /* she drops a gem */
  }
  /* (gq3 item 2) HER LAST ACT: the bar is at 0 - she reels, drops to her knees and RINGS HER HANDBELL 3 weak times (MOTHER...), collapses; 0.4 s later the Great Hall's bell ANSWERS from the east. */
  function dyingBegin(e) {
    if (e.mode === 'dying' || e.mode === 'escape') return; F.bolt = null; F.tiara = null; F.ripples = []; F.wave = null; F.gems = [];
    set(e, 'dying', 99); e.dyT = 0; e.dyRings = 0; e.dyHeard = false; e.dyDone = false; e.hiding = false; e.vx = 0; e.y = fl();
    ctx.number(e.x, e.y - 56, 'MOTHER...', '#ff9ad0'); sfx('bellow'); ctx.shake(5); ctx.burst(e.x, e.y - 10, 10, ['#e04a6a', '#4ac0e0', '#e0c04a'], 70, 0.6);
  }
  function stepDying(e, dt) {
    const D = GP.dying, ringAt = D.reel, ringEnd = D.reel + D.ring, total = ringEnd + D.collapse, heardAt = ringEnd + D.answer; e.dyT += dt; e.vx = 0; e.y = fl();
    if (e.dyT >= ringAt && e.dyRings < 3 && e.dyT >= ringAt + e.dyRings * (D.ring / 3)) { e.dyRings++; sfx('seaBell'); ctx.burst(e.x + (e.face || 1) * 6, e.y - 12, 4, ['#e0c04a', '#fff6c8'], 30, 0.3); }
    if (!e.dyHeard && e.dyT >= heardAt) { e.dyHeard = true; sfx('seaBell'); ctx.number(e.x + 60, e.y - 70, '!', '#ffd36b'); ctx.number(e.x, e.y - 50, 'THE QUEEN HAS HEARD', '#ff6b6b'); ctx.shake(3); }
    if (e.dyT >= total && !e.dyDone) { e.dyDone = true; for (const g of F.guards) if (g.alive) { g.alive = false; ctx.burst(g.x, g.y - 6, 6, ['#5a2a7a', '#e0b040'], 40, 0.4); } F.guards = []; }
  }
  H.dead = e => !!(e && e.dyDone);
  H.dying = e => !!(e && e.mode === 'dying');
  function stepEscape(e, dt) {
    const Ar = F.A; e.escT += dt; const k = Math.min(1, e.escT / GP.escape), hx = Ar.hatch || e.x, ly = Ar.land ? Ar.land.y : fl();
    if (k < 0.5) { const q = k / 0.5; e.x = e.escX0 + (hx - e.escX0) * q; e.y = e.escY0 + (ly - e.escY0) * q - Math.sin(q * Math.PI) * 12; }
    else { const q = (k - 0.5) / 0.5; e.x = hx; e.y = ly - q * (ly - (Ar.y0 || ly - 120)); }
    if (k >= 1 && !e.escaped) { e.escaped = true; e.hidden = true; for (const g of F.guards) if (g.alive) { g.alive = false; ctx.burst(g.x, g.y - 6, 6, ['#5a2a7a', '#e0b040'], 40, 0.4); } F.guards = []; ctx.number(hx, ly - 40, 'SHE IS GONE TO WARN THE QUEEN', '#ff9ad0'); }
  }
  H.escaped = e => !!(e && e.escaped);
  H.frame = e => GPA.gpFrame(e);   /* (claude/hc3art) a pose for every move (src/redraw/goblin_princess_art.js): B16 */
  H.barName = e => 'THE GOBLIN PRINCESS' + (e.mode === 'pinned' ? '  PINNED' : e.mode === 'stunned' ? '  STUNNED' : e.mode === 'preen' ? '  PREENING' : e.mode === 'stagger' ? '  STAGGERED' : e.hiding ? '  HIDING' : '');
  H.end = () => { if (F) { F.gems = []; F.tiara = null; F.ripples = []; F.wave = null; F.bolt = null; } };
  H.read = () => F && { n: { ...F.n }, ph: F.ph, rings: F.M.rings, wave: F.wave ? F.wave.state : null, gems: F.gems.length, tiara: !!F.tiara, ripples: F.ripples.length, hurt: { ...F.hurt }, secs: now() - F.t0, chaseDone, chase: C ? C.state : null };
  H.test = { boltBegin: e => boltBegin(e), escape: e => escapeBegin(e), dying: e => dyingBegin(e), guards: (e, i) => guardsCall(e, i), stun: e => stun(e), chase: () => C, towers: () => TW, rehearsal: () => RH };

  /* the art (claude/hc3art): her sprite is the sheet's (src/redraw/goblin_princess_art.js); this draws what flies, rings and glows around her */
  H.drawOver = (g, cx, cy, time) => {
    if (!F) return; const e = live(), Ar = F.A, f0 = R(fl() - cy);
    if (e && !e.hidden) { const x = R(e.x - cx), y = R(e.y - cy);
      if (e.mode === 'fan') GPA.drawFanGust(g, e.x - cx, e.y - cy - 4, e.face || 1, time, GP.fan.reach * 0.5);
      if (e.mode === 'pinned') { g.fillStyle = '#8fd160'; g.fillRect(x - 16, y - 40, R(32 * Math.max(0, e.modeT / GP.bell.pin)), 3); } }
    for (const q of F.gems) GPA.drawGem(g, q.x - cx, q.y - cy, q.col, time, q.id || 0);
    if (F.tiara) GPA.drawTiaraFlying(g, F.tiara.x - cx, F.tiara.y - cy, time, F.tiara.home);
    for (const w of F.ripples) GPA.drawRipple(g, w.x - cx, f0, time);
    if (Ar.grate && F.glowK > 0 && F.bolt) HC2A.drawGrateFx(g, { gate: Ar.grate.col, gy0: Ar.grate.gy0, gy1: Ar.grate.gy1 }, cx, cy, TS, time, F.glowK);   /* the told grate: the column lit before it drops */
    if (Ar.rope && BW.bellReady(F.M, now()) && !F.said.ropeHint && R(Ar.rope - cx) > 14 && f0 - 40 > 8) { ctx.text && ctx.text('RING', R(Ar.rope - cx), f0 - 40, '#ffd36b', 'center', 6); }   /* (claude/hcfix, textfit OFFSCREEN) only while the rope is in the picture */
    if (F.M.rings) F.said.ropeHint = true;
  };


  /* ======================= THE CHASE, THE TOWERS, THE REHEARSAL (every frame of the level, src/main.js updateVillage) ======================= */
  H.level = dt => { const Lv = L(); if (!Lv) return; if (Lv.gpChase) { chaseStep(dt); towersStep(dt); } if (Lv.gpRehearsal) rehStep(dt); };
  function chaseStep(dt) {
    const Ch = L().gpChase, t = now(); if (chaseDone) return;
    if (!C) C = { state: 'idle', x: Ch.start, y: Ch.floor, k: 0, wait: 0, hop: 0 };
    const fx = front();
    if (C.state === 'idle') { let near = false; seats(P => { if (P.x > Ch.x0 && Math.abs(P.y - Ch.floor) < 64) near = true; }); if (near) {   /* (claude/hcship, small152) the chase STARTS only for a hero still on the approach: one already at her tower (a teleport, a dev jump) finds her in it - no shout, no hint */
      let behind = false; seats(P => { if (P.x < Ch.end - 2 * TS) behind = true; });
      if (!behind) { C.state = 'in'; chaseDone = true; return; }
      C.state = 'run'; ctx.number(C.x, C.y - 40, 'GUARDS! GUARDS!', '#ff6b6b'); sfx('seaBell'); ctx.hint && ctx.hint('THE GOBLIN PRINCESS. SHE IS TOO QUICK: CORNER HER IN HER BELL TOWER.'); } return; }
    if (C.state === 'ring') { C.wait -= dt; if (C.wait <= 0) { const Tw = Ch.towers[C.k]; towerAlarm(Tw); C.k++; C.state = 'run'; } return; }
    if (C.state === 'run') {
      const Tw = Ch.towers[C.k], target = Tw ? Tw.bell : Ch.end;
      if (C.x - fx < GP.chase.lead || C.x - fx < 0) { C.x += Math.min(target - C.x, GP.chase.run * dt); }
      else if (C.x - fx > GP.chase.hold && !C.said) { C.said = 1; ctx.number(C.x, C.y - 40, 'TOO SLOW!', '#ff9ad0'); }
      C.y = Ch.floor; if (Ch.gap && C.x > Ch.gap[0] && C.x < Ch.gap[1]) { const k = (C.x - Ch.gap[0]) / (Ch.gap[1] - Ch.gap[0]); C.y = Ch.floor - Math.sin(k * Math.PI) * 28; }   /* she skips the broken stretch on the corbels' tops */
      if (C.x >= target - 1) { if (Tw) { C.state = 'ring'; C.wait = GP.chase.ring; ctx.number(C.x, C.y - 40, '!', '#ffd36b'); ctx.sfx.tell && ctx.sfx.tell(false); } else { C.state = 'in'; chaseDone = true; ctx.number(C.x, C.y - 40, 'SHE IS IN HER TOWER', '#ff9ad0'); } }
    }
  }
  /* a tower's alarm: she rang it - the guardroom door rises, the horn runs, the tower winch keeps them in */
  function towerAlarm(Tw) {
    if (TW.has(Tw.id)) return; const W = BW.waveOpen(now(), GP.chase.horn, { Tw, key: {} }); TW.set(Tw.id, W);
    ctx.number(Tw.bell, Tw.floor - 50, 'SHE RINGS THE ALARM', '#ff6b6b'); sfx('seaBell'); sfx('bellow'); ctx.shake(3);
    ctx.number(Tw.winch, Tw.floor - 36, 'STRIKE THE WINCH', '#ffd36b');
  }
  function towersStep() {
    const t = now();
    for (const [id, W] of TW) { const Tw = W.Tw;
      if (W.state === 'open' && blowOn({ l: Tw.winch - 10, r: Tw.winch + 10, t: Tw.floor - 26, b: Tw.floor }, W.key)) { W.key = {};
        const r = BW.crankWinch(W, t, GP.chase.crank, GP.chase.win); sfx('clank'); ctx.shake(2);
        if (r === 'kept') { ctx.number(Tw.winch, Tw.floor - 44, 'THE GATE DROPS: GUARDS KEPT IN', '#8fd160'); sfx('gateDrop'); W.keptT = t; }
        else ctx.number(Tw.winch, Tw.floor - 40, r + ' / ' + GP.chase.crank, '#ffd36b'); }
      const ev = BW.waveTick(W, t, GP.chase.win, GP.chase.closeAfter);
      if (ev === 'spawn') { BW.waveKinds(Tw.wave, seatN()).forEach((k, i) => ctx.spawnEnt({ t: k, x: Tw.doorCol + (i % 2 ? 1 : 0), y: Math.floor(Tw.floor / TS) - 1, face: -1 })); ctx.number(Tw.door, Tw.floor - 44, 'THE GUARDROOM IS OUT', '#ff6b6b'); sfx('gateDrop'); ctx.shake(3); }
      if (id && W.state === 'kept' && !W.counted) W.counted = true; }
  }
  /* the banquet: her Captain storms to the bell rope's sound; the grate mid-hall; the servery's winch */
  function rehStep(dt) {
    const Q = L().gpRehearsal, t = now(), G = GP.reh;
    if (!RH) RH = { M: { cd: 0, queued: 0, rings: 0 }, ropeKey: {}, winchKey: {}, lure: null, W: null, started: 0, pins: 0, kept: 0, joined: 0 };
    const cap = ctx.enemies().find(e => e.alive && e.t === 'heavy' && e.elite && e.x >= Q.x0 && e.x <= Q.x1 && Math.abs(e.y - Q.floor) < 40);
    let inRoom = false; seats(P => { if (P.x > Q.x0 && P.x < Q.x1 && Math.abs(P.y - Q.floor) < 80) inRoom = true; });
    if (cap && inRoom && !RH.started) { RH.started = t; ctx.hint && ctx.hint('HER CAPTAIN. RING THE BELL ROPE AND HE STORMS TO THE SOUND: LET THE GRATE DROP ON HIM.'); }
    if (RH.started && !RH.W && !RH.waveDone && cap && t - RH.started >= G.hornAfter) { RH.W = BW.waveOpen(t, G.horn); ctx.number(Q.door, Q.floor - 50, 'THE SERVERY DOOR RISES', '#ff6b6b'); ctx.number(Q.winch, Q.floor - 36, 'STRIKE THE WINCH', '#ffd36b'); sfx('bellow'); }
    if (RH.W) { const W = RH.W;
      if (W.state === 'open' && blowOn({ l: Q.winch - 10, r: Q.winch + 10, t: Q.floor - 26, b: Q.floor }, RH.winchKey)) { RH.winchKey = {}; const r = BW.crankWinch(W, t, G.crank, G.win); sfx('clank');
        if (r === 'kept') { RH.kept++; RH.waveDone = true; RH.W = null; ctx.number(Q.winch, Q.floor - 44, 'THE GATE DROPS: THE SERVERY KEPT IN', '#8fd160'); sfx('gateDrop'); } else ctx.number(Q.winch, Q.floor - 40, r + ' / ' + G.crank, '#ffd36b'); }
      const ev = RH.W && BW.waveTick(W, t, G.win, G.closeAfter);
      if (ev === 'spawn') { RH.joined++; BW.waveKinds(Q.wave, seatN()).forEach((k, i) => ctx.spawnEnt({ t: k, x: Q.doorCol - i, y: Math.floor(Q.floor / TS) - 1, face: -1 })); ctx.number(Q.door, Q.floor - 44, 'THE SERVERY IS OUT', '#ff6b6b'); sfx('gateDrop'); }
      if (ev === 'close') { RH.W = null; RH.waveDone = true; } }
    /* the rope: any seat */
    if (blowOn({ l: Q.rope - 8, r: Q.rope + 8, t: Q.floor - 34, b: Q.floor }, RH.ropeKey)) { RH.ropeKey = {};
      if (BW.ringBell(RH.M, t, G.cd, G.queue) === 'swinging') { ctx.number(Q.rope, Q.floor - 40, 'STILL SWINGING', '#c9c9d6'); sfx('clank'); } else { ctx.number(Q.rope, Q.floor - 40, 'YOU RING THE BELL', '#ffd36b'); sfx('seaBell'); } }
    if (cap && !RH.lure && !(cap.gpPinUntil > t) && BW.ringFresh(RH.M, t) && !(cap.stagger > 0.3)) { RH.M.queued = 0; RH.lure = { state: 'walk', t: G.walkMax, wait: G.glow }; ctx.number(cap.x, cap.y - 40, 'HE HEARS IT', '#ff6b6b'); }
    if (RH.lure) { const Lu = RH.lure, gx0 = Q.grate.col * TS + 8;
      if (!cap) { RH.lure = null; return; }
      cap.stagger = Math.max(cap.stagger || 0, 0.12); cap.face = sign(gx0 - cap.x) || cap.face;   /* (his own feet: the sound pulls him, not his fight) */
      if (Lu.state === 'walk') { Lu.t -= dt; const dx = gx0 - cap.x; cap.x += sign(dx) * Math.min(Math.abs(dx), G.walk * dt); if (Math.abs(dx) < 6 || Lu.t <= 0) Lu.state = 'glow'; }
      else { Lu.wait -= dt; RH.glowK = 1 - Math.max(0, Lu.wait) / G.glow; if (Lu.wait <= 0) { RH.lure = null; RH.glowK = 0; if (ctx.grateDrop) ctx.grateDrop(Q.grate.col, Q.grate.gy0, Q.grate.gy1, G.pin + 0.3);
        if (BW.underGrate(cap.x, gx0, G.under)) { cap.stagger = G.pin; cap.gpPinUntil = t + G.pin; RH.pins++; ctx.number(cap.x, cap.y - 40, 'THE GRATE PINS HER CAPTAIN: CUT HIM', '#8fd160'); ctx.shake(5); }
        else ctx.number(cap.x, cap.y - 40, 'HE STEPS CLEAR', '#c9c9d6'); } } }
  }
  /* the art (claude/hc3art): the chase actor on her sheet, the guardrooms' doors and winches, the alarm bells, the banquet's rope and servery, the bell tower's bell, rope, door, winch and hatch */
  const doorSt = W => !W ? 'shut' : W.state === 'kept' ? 'kept' : W.state === 'closed' ? 'down' : 'up';   /* (claude/hcfix) 'kept': down, with the guards behind it */
  const spinOf = (W, time) => { if (!W) return 0; if (W._dn !== W.n) { W._dn = W.n; W._dt = time; } return time - (W._dt === undefined ? -9 : W._dt) < 0.35 ? 1 : 0; };
  const slamOf = (W, time) => { if (!W || (W.state !== 'kept' && W.state !== 'closed')) return 0; if (W._kt === undefined) W._kt = time; return Math.max(0, 1 - (time - W._kt) / 0.4); };
  const guardSet = (g, W, door, winch, fy, horn, cx, time) => { const dx = R(door - cx), wx = R(winch - cx);
    HC3A.drawGuardDoor(g, dx, fy, doorSt(W), W && W.state === 'open' ? BW.hornLeft(W, now(), horn) : 0, time, slamOf(W, time));
    HC3A.drawWinchBox(g, wx, fy, dx, spinOf(W, time), W ? (W.n || 0) : 0, GP.guards.crank, !!W && W.state === 'open', time); };
  const swingOf = (M, time) => { if (!M) return 0; if (M._rn !== M.rings) { M._rn = M.rings; M._rt = time; } const k = time - (M._rt === undefined ? -9 : M._rt); return k < 1.6 ? Math.sin(k * 14) * 3 * (1 - k / 1.6) : 0; };
  H.drawWorld = (g, cx, cy, time) => {
    const Lv = L(); if (!Lv) return;
    if (Lv.gpChase && C && !chaseDone && (C.state === 'run' || C.state === 'ring')) { const sp = GPA.sheet(), f = C.state === 'ring' ? GPA.GPF.bell : GPA.GPF.bolt + (Math.floor(time * 9) & 1); g.drawImage(sp.R[f], R(C.x - cx - sp.ax), R(C.y - cy - sp.ay)); }
    if (Lv.gpChase && !chaseDone && (!C || C.state === 'idle')) { const sp = GPA.sheet(), Ch = Lv.gpChase; g.drawImage(sp.L[GPA.GPF.stand + (time % 3.2 < 0.16 ? 1 : 0)], R(Ch.start - cx - sp.ax), R(Ch.floor - cy - sp.ay)); }   /* (claude/hc3art) before the chase starts she stands on the wall, preening, facing the stair she expects you up */
    if (Lv.gpChase) for (const Tw of Lv.gpChase.towers) { const W = TW.get(Tw.id), fy = R(Tw.floor - cy);
      guardSet(g, W, Tw.door, Tw.winch, fy, GP.chase.horn, cx, time);
      HC3A.drawBellAt(g, R(Tw.bell - cx), fy - 58, W ? Math.sin(time * 14) * 2.5 : 0, 0, time); }   /* HER alarm bell, cast bronze on an iron beam: it swings while it is sounding */
    const Q = Lv.gpRehearsal;
    if (Q) { const fy = R(Q.floor - cy), W = RH && RH.W, rx = R(Q.rope - cx), bTop = R(10 * TS + 6 - cy), sw = swingOf(RH && RH.M, time);
      HC3A.drawBellAt(g, rx, bTop, sw, RH && BW.bellReady(RH.M, now()) ? 0.6 : 0, time); HC3A.drawRope(g, rx, bTop + 31, fy, sw, time);
      guardSet(g, W, Q.door, Q.winch, fy, GP.reh.horn, cx, time);
      if (RH && RH.glowK > 0) HC2A.drawGrateFx(g, { gate: Q.grate.col, gy0: Q.grate.gy0, gy1: Q.grate.gy1 }, cx, cy, TS, time, RH.glowK); }
    const Ar = A(); if (Ar && Ar.rope) { const fy = R(Ar.floor - cy), rx = R(Ar.rope - cx), ceil = R((Ar.y0 || 0) - cy) + TS, sw = swingOf(F && F.M, time), e = live();
      if (Ar.grate) { const bx = R(Ar.grate.col * TS + 8 - cx); const by0 = R((Ar.grate.gy0 + 4) * TS - cy); g.fillStyle = '#8a8aa0'; for (let yy = ceil + 3; yy < by0; yy += 3) g.fillRect(bx, yy, 1, 2); HC3A.drawBellAt(g, bx, by0, sw, F && BW.bellReady(F.M, now()) ? 0.6 : 0, time);   /* (claude/hc3art) hung 4 rows down on a chain so the camera sees it */ g.fillStyle = '#a0885a'; for (let xx = rx; xx < bx - 10; xx += 3) g.fillRect(xx, ceil + 4, 2, 1); }   /* THE TOWER BELL over its grate; its rope runs along the ceiling to the pull at the west wall */
      HC3A.drawRope(g, rx, ceil, fy, sw, time);
      if (Ar.door) guardSet(g, F && F.wave, Ar.door, Ar.winch, fy, GP.guards.horn, cx, time);
      if (Ar.hatch) HC3A.drawHatch(g, R(Ar.hatch - cx), ceil, e && e.mode === 'escape' ? 1 : 0, time); }
  };

  /* (gq3 item 2) the Princess's CAMEO in her mother's intro is gone: she is dead before the Queen wakes, and the Queen's rage is the line (src/main.js updateGQueen 'wake') */

  /* the LAB BOT's duty (src/lab.js): strike the winch while a wave is open; ring the bell when it is ready and she is free on the floor or perched; stand off the landing as the grate glows */
  H.labDuty = P0 => {
    const e = live(); if (!F || !e) return null; const Ar = F.A;
    if (F.wave && F.wave.state === 'open' && Ar.winch) return { x: Ar.winch, face: sign(Ar.winch - P0.x), swing: true, why: 'winch' };
    if (F.bolt && Ar.winch) { const B = F.bolt, ranged = !!P0.rgArrows && P0.rgStance !== 'knife' && P0.rgQ > 0, s0 = P0.x < Ar.winch ? -1 : 1, x = Ar.winch + s0 * (ranged ? 70 : 8);   /* (claude/hcfix) to the winch (the ranger shoots it from 70 px), and strike it in the blaze after a human's reaction - never before */
      return { x, face: -s0, swing: B.state === 'ready' && now() - B.readyT >= B.react, why: 'release the grate' }; }
    if (Ar.rope && BW.bellReady(F.M, now()) && SAFE.has(e.mode) && !gpOpen(e)) return { x: Ar.rope + 10, face: -1, swing: true, why: 'bell' };
    /* (claude/hcfix) UP ONTO THE LANDING: pinned, stunned or perched up there she is out of a bow's line from the floor - the ranger jumps up (one-way, a plain jump) and shoots her along it */
    if (P0.rgArrows && P0.rgStance !== 'knife' && Ar.land && onLanding(e) && (gpOpen(e) || e.mode === 'perch')) { const sd = P0.x < e.x ? -1 : 1, x = Math.max(Ar.land.x0 + 8, Math.min(Ar.land.x1 - 8, e.x + sd * 50)), up = Math.abs(P0.y - Ar.land.y) < 4;
      F.n.upT = (F.n.upT || 0) + 1; if (up) F.n.upOn = (F.n.upOn || 0) + 1;
      return { x, face: sign(e.x - P0.x) || 1, swing: up && Math.abs(P0.x - x) < 14, jump: !up && P0.y > Ar.land.y && Math.abs(P0.x - x) < 24, why: 'up to her' }; }
    /* (claude/hcfix) THE RANGER SHOOTS HER GEMS: a gem coming at her near the floor is met with an arrow (a blow on it, as a blade's knocks it away) */
    if (P0.rgArrows && P0.rgStance !== 'knife' && P0.rgQ > 0) { const q = F.gems.find(g => !g.away && Math.abs(g.x - P0.x) < 90 && Math.abs(g.x - P0.x) > 12 && g.y > P0.y - 22 && Math.sign(g.vx || 0) === Math.sign(P0.x - g.x)); if (q) return { x: P0.x, face: sign(q.x - P0.x), swing: true, why: 'shoot the gem' }; }
    return null;
  };
  return H;
}
