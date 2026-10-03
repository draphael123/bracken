// src/gang-leader.js - THE GANG LEADER, THE WELL TOWN's mini-boss in the market's courtyard, the Well Square (claude/welltown3, moved from the Kasbah by claude/welltown-polish; Daniel 2026-10-02: the Bandit
// King "feels like a mini" - so he is one now, and the town's boss is THE CISTERN QUEEN under it). The bandits' captain: two curved swords, a sling of
// oil bottles, a quick man.
//   TWO SWORDS     DOUBLE CUT (! !: two quick cuts a shield turns) and CROSS CUT (! then a third, quicker), and THE WHIRL (!!: both blades round
//                  him - step out of it or jump it)
//   THE DODGE      struck from the front while he stalks you, he mostly slips back out of the blade - and comes straight back with a RIPOSTE
//                  (!!: step or roll out): told and readable (a dust kick and his lean back). After each of his own blows he is OFF BALANCE
//                  (GL.recoverT) and cannot slip a blade: that is when to cut him
//   MOLOTOVS       he lobs a lit oil bottle at you (!: the bottle arcs; where it breaks the floor burns). STRIKE IT BACK: a blow on the bottle sends it
//                  home, and it sets HIM alight - easily (the bottle flies back at him, and his oil-soaked coat takes)
//   BURNING        his opening: he beats at the flames, open (GL.openT >= 3 s, tools/boss-openings.mjs), and a blow lands x GL.openMul - but one
//                  burning takes no more than a THIRD of his health (Daniel's mini rule: GL.capK)
// No charge. A MINI (combat3): he keeps his damage taken outside the opening (no chip), answers greed with the minis' reprisal, and hits x1.3.
// main.js calls makeGangLeaderHands(ctx): spawn, owns, update, take, frame, barName, drawOver, end, read. The bot's reading is glPlan (src/lab.js).

export const GL = {
  hp: 1000, w: 16, h: 30, markH: 44,
  openMul: 1.4, openT: 3.2, capK: 0.2,   /* (Daniel's mini rule: no more than a third of him a burning - a fifth here, so it takes five of his own bottles and the cuts between)
  */
  walk: 78, keep: 26, gap: [0.5, 0.36],            /* phase two (half health): quicker between blows */
  cutTell: 0.42, cutT: 0.14, cut2Tell: 0.24, crossTell: 0.2, cutReach: 30,
  whirlTell: 0.62, whirlT: 0.5, whirlR: 40,
  throwTell: 0.5, fly: 0.85, fireT: 3.2, fireR: 18, fireTick: 0.5,
  dodge: 0.75, dodgeT: 0.28, dodgeDist: 64, dodgeCd: 1.0, riposteTell: 0.42, recoverT: 0.35,   /* (he slips most blows while he stalks you; after each of his own blows he is OFF BALANCE for recoverT - the window, and he cannot slip a blade in it) */
  reflectR: 16, back: 340,
  dmg: { cut: 15, whirl: 29, bottle: 10, fire: 5, riposte: 22 },
};
/* EVERY CYCLE CHANGES (k % n); phase two from half health */
export const CHAINS = {
  1: [['cut', 'throw', 'whirl'], ['throw', 'cross', 'cut'], ['cut', 'whirl', 'throw', 'cross']],
  2: [['cross', 'throw', 'throw', 'whirl'], ['throw', 'cut', 'whirl', 'cross'], ['whirl', 'throw', 'cross', 'throw']],
};
export const GL_MODES = { cutTell: '!', cut2Tell: '!', crossTell: '!', whirlTell: '!!', throwTell: '!', riposteTell: '!!' };
const PARRY = new Set(['cutTell', 'cut', 'cut2Tell', 'cut2', 'crossTell', 'cross']);
export const glOpen = e => !!e && e.mode === 'burning' && (e.open || 0) > 0;

/* THE MARKET COURTYARD (claude/welltown-polish, Daniel 10-02: he moved from the Kasbah to the market). sx: its first column; R: its floor row. Forty columns,
   his wall at sx-1 (shut behind you) and a solid wall at sx+40 (the fallen street's rubble stands against it: no gate to lift), the great well's head
   (the courtyard's well, wherever the level put it) and a stone trough each side (a row up, boards). The way on past him - THE GREAT WELL's windlass - is fouled
   until he falls (src/well-town-hands.js), so the wall that opens behind you when he dies lets you back to the stair and the well is yours.
   No wall of his own reaches the Great Well's lip: the bucket stands at the floor's level over the shaft, a platform to him as to you. */
export const STAGE = { W: 40, door: 6, well: 27, troughs: [[6, 9], [31, 34]], him: 30 };
export function stageGangLeader(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + STAGE.W;
  air(sx, ex - 1, 0, R - 1);
  block(sx - 1, sx - 1, R - 16, R - STAGE.door - 1); block(ex, ex, R - 16, R - 1);
  for (const [a, b] of STAGE.troughs) for (let x = sx + a; x <= sx + b; x++) set(x, R - 1, T.ONEWAY);
  ent('gangleader', sx + STAGE.him, R - 1, { face: -1, mini: true });
  const mini = { x0: sx * TS, x1: ex * TS, floor: R * TS, y0: (R - 16) * TS, y1: (R + 1) * TS, trigger: (sx + 5) * TS, wallL: sx - 1, wallR: ex, gate: sx - 1, boss: 'gangleader',
    name: 'THE GANG LEADER', music: 'banditking', well: (sx + STAGE.well) * TS + 8 };
  return { mini };
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late and misreads some; it strikes a bottle back when it comes in reach (and lets some go); it cuts him
   between his blows (stopping a blow short of greed), shields the cuts, steps out of the whirl and the fire, and cuts hard while he burns.
   s = { P: { x, y, face, ground, atk }, e, F, reach, shield, t, rng, mem, greed } -> { gx, face, atk, jump, block, dodge, why } */
export const PLAN = { react: 0.25, miss: 0.14, missBottle: 0.3, stand: 22 };
export function glPlan(s) {
  const { P, e, F, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0; mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 500) { mem.seen.clear(); mem.roll.clear(); }
  const key = e.mode + F.act, seen = () => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const A = F.A, lo = A.x0 + 12, hi = A.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x)), side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x);
  /* the bottle: strike it back as it comes */
  const b = F.bottles.find(q => !q.back && Math.abs(q.x - P.x) < 60 && Math.abs(q.y - (P.y - 10)) < 40);
  if (b && !roll('b' + b.id, PLAN.missBottle)) { out.face = Math.sign(b.x - P.x) || P.face; if (Math.abs(b.x - P.x) < reach + 6 && Math.abs(b.y - (P.y - 10)) < 22) out.atk = P.atk < 0; out.why = 'strike the bottle back'; return out; }
  const fire = F.fires.find(f => Math.abs(f.x - P.x) < GL.fireR + 6);
  if (glOpen(e)) { out.gx = clamp(e.x - side * Math.max(8, reach * 0.6)); out.face = Math.sign(e.x - P.x) || 1; out.atk = ad < reach + 12 && P.atk < 0 && e.open > 0.35; out.why = 'cut him: he burns'; return out; }   /* (not the last blow as the flames go out: it lands on a man stalking you, who slips it) */
  const m = e.mode;
  if (/Tell$/.test(m) && seen() && !roll(key, PLAN.miss)) {
    if (m === 'riposteTell' && ad < 90) { out.gx = clamp(e.x + side * 100); if (ad < 60) out.dodge = true; out.why = 'off the riposte'; return out; }
    if ((m === 'cutTell' || m === 'cut2Tell' || m === 'crossTell') && ad < 70) { mem.backT = t + 0.9; if (s.shield) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the cut'; return out; } out.gx = clamp(e.x + side * 80); out.why = 'back off the cut'; return out; }
    if (m === 'whirlTell' && ad < GL.whirlR + 30) { out.gx = clamp(e.x + side * (GL.whirlR + 40)); if (ad < GL.whirlR && e.modeT < 0.2) out.dodge = true; out.why = 'out of the whirl'; return out; }
    if (m === 'throwTell') { /* the bottle comes: wait for it (above) */ }
  }
  /* the rest of a combo once its first cut was read: keep out of it (or keep the shield up) */
  if ((m === 'cut' || m === 'cut2Tell' || m === 'cut2' || m === 'cross') && ad < 70 && mem.backT > t) { if (s.shield) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the combo'; return out; } out.gx = clamp(e.x + side * 90); out.why = 'out of the combo'; return out; }
  if (m === 'whirl' && ad < GL.whirlR + 12) { out.gx = clamp(e.x + side * (GL.whirlR + 40)); out.dodge = ad < GL.whirlR; out.why = 'out of the whirl'; return out; }
  if (fire) { out.gx = clamp(P.x + (P.x < fire.x ? -40 : 40)); out.why = 'out of the fire'; return out; }
  /* between his blows: cut him (a blow short of greed), from where his reach is not */
  if (m === 'recover' && ad < reach + 10 && (s.greed || 0) < 3 && P.atk < 0) { out.face = Math.sign(e.x - P.x) || 1; out.atk = true; out.why = 'cut him between his blows'; return out; }
  out.gx = clamp(e.x + side * PLAN.stand); out.face = Math.sign(e.x - P.x) || 1; out.why = 'close in';
  return out;
}

/* ---------- THE HANDS ---------- */
export function makeGangLeaderHands(ctx) {
  let F = null;
  const H = {};
  const A = () => (ctx.L && ctx.L.mini && ctx.L.mini.boss === 'gangleader' ? ctx.L.mini : null);
  const R = Math.round;
  H.fight = () => F;
  H.owns = e => e.t === 'gangleader';
  H.clear = () => { F = null; };
  const keyed = (pp, key) => { pp.glKeys = pp.glKeys || new Map(); if (pp.glKeys.size > 60) pp.glKeys.clear(); if (pp.glKeys.has(key)) return true; pp.glKeys.set(key, 1); return false; };
  const hurt = (name, fn) => { const P = ctx.hero(), h0 = P.hp; fn(); if (F) { F.hurt[name] = (F.hurt[name] || 0) + Math.max(0, h0 - Math.max(0, P.hp)); } };
  H.spawn = base => { const Ar = A(); F = { A: Ar || { x0: base.x - 300, x1: base.x + 300, floor: base.y }, cycle: 0, step: 0, chain: CHAINS[1][0].slice(), ph: 1, act: 0, bottles: [], fires: [], dodgeCd: 0, openTaken: 0,
      hurt: {}, n: { cycles: 0, opens: 0, reflects: 0, bottles: 0, dodges: 0, ripostes: 0, capped: 0, whirls: 0, cuts: 0 }, idN: 0 };
    return { ...base, t: 'gangleader', w: GL.w, h: GL.h, hp: ctx.EHP.gangleader, maxHp: ctx.EHP.gangleader, mini: true, noGrav: true, markH: GL.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1 }; };
  const set = (e, m, t) => { e.mode = m; e.modeT = t; };
  const tell = (e, m, t) => { set(e, m, t); const Pn = nearest(e); if (m !== 'whirlTell') e.face = Math.sign(Pn.x - e.x) || e.face;   /* he squares up to you at every told blow */ const mk = GL_MODES[m]; if (mk) { ctx.number(e.x, e.y - GL.markH, mk, mk === '!' ? '#ffd36b' : '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(mk !== '!'); } };
  const hit = (e, bx, d, name, o = {}) => { for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
    if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P)) || keyed(pp, o.key)) return; hurt(name, () => ctx.damagePlayer(e.x, d, { who: e, name, unblockable: !o.blockable, noKnock: !!o.noKnock })); }); };
  function next(e) {
    if (F.step >= F.chain.length) { F.cycle++; F.n.cycles++; const set2 = CHAINS[F.ph]; F.chain = set2[F.cycle % set2.length].slice(); F.step = 0; }
    const k = F.chain[F.step++]; F.act++; F.cur = { k, id: F.act }; const P = nearest(e); e.face = Math.sign(P.x - e.x) || e.face;
    if (k === 'cut') return tell(e, 'cutTell', GL.cutTell);
    if (k === 'cross') return tell(e, 'crossTell', GL.cutTell * 0.85);
    if (k === 'whirl') { F.n.whirls++; return tell(e, 'whirlTell', GL.whirlTell); }
    if (k === 'throw') { F.cur.x = P.x; return tell(e, 'throwTell', GL.throwTell); }
  }
  const nearest = e => ctx.players.filter(p => !p.dead).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || ctx.hero();
  const after = e => { F.gapNext = GL.gap[F.ph - 1]; F.recHits = 0; set(e, 'recover', GL.recoverT + (F.cur && F.cur.k === 'whirl' ? 0.25 : 0)); };
  H.update = (e, dt) => {
    if (!F || !e.alive) return; const Ar = F.A, P = nearest(e), fl = Ar.floor; e.y = fl;
    if (e.mode === 'sleep') { set(e, 'wake', 1.4); }
    e.modeT -= dt; F.dodgeCd = Math.max(0, F.dodgeCd - dt); if (e.open > 0) e.open = Math.max(0, e.open - dt);
    const fx = e.face || 1, key = 'gl' + (F.cur ? F.cur.id : 0), front = (r, top = 30) => fx > 0 ? [e.x - 8, e.x + r, fl - top, fl] : [e.x - r, e.x + 8, fl - top, fl];
    if (F.ph === 1 && e.hp <= e.maxHp / 2) { F.ph = 2; ctx.number(e.x, e.y - 50, 'HE GOES FASTER: WATCH HIS BOTTLES', '#ff9a5c'); ctx.enrage && ctx.enrage(e); ctx.music && ctx.music('banditking:p2'); }
    stepBottles(e, dt); stepFires(e, dt);
    switch (e.mode) {
      case 'wake': if (e.modeT <= 0) { F.chain = CHAINS[1][0].slice(); F.step = 0; set(e, 'walk', 0.5); } break;
      case 'recover': if (!F.saidOff && F.n.cuts + F.n.whirls > 0) { F.saidOff = 1; ctx.number(e.x, e.y - 50, 'OFF BALANCE AFTER HIS BLOWS: CUT HIM THEN', '#ffd36b'); } if (e.modeT <= 0) set(e, 'walk', F.gapNext ?? 0.3); break;
      case 'walk': { const d = P.x - e.x; if (Math.abs(d) > GL.keep) e.x += Math.sign(d) * GL.walk * dt; e.face = Math.sign(d) || e.face;
        if (e.modeT <= 0) next(e); break; }
      case 'cutTell': if (e.modeT <= 0) set(e, 'cut', GL.cutT); break;
      case 'cut': hit(e, front(GL.cutReach), GL.dmg.cut, 'HIS SWORDS', { key: key + 'a', blockable: true }); if (e.modeT <= 0) tell(e, 'cut2Tell', GL.cut2Tell); break;
      case 'cut2Tell': if (e.modeT <= 0) set(e, 'cut2', GL.cutT); break;
      case 'cut2': hit(e, front(GL.cutReach), GL.dmg.cut, 'HIS SWORDS', { key: key + 'b', blockable: true }); if (e.modeT <= 0) { F.n.cuts++; after(e); } break;
      case 'crossTell': if (e.modeT <= 0) set(e, 'cross', GL.cutT); break;
      case 'cross': hit(e, front(GL.cutReach), GL.dmg.cut, 'HIS SWORDS', { key: key + 'x', blockable: true }); if (e.modeT <= 0) { F.cur.k = 'cut'; tell(e, 'cut2Tell', GL.crossTell); } break;
      case 'whirlTell': if (e.modeT <= 0) { set(e, 'whirl', GL.whirlT); ctx.sfx.slash && ctx.sfx.slash(); } break;
      case 'whirl': hit(e, [e.x - GL.whirlR, e.x + GL.whirlR, fl - 26, fl], GL.dmg.whirl, 'THE WHIRL', { key }); if (e.modeT <= 0) after(e); break;
      case 'throwTell': if (e.modeT <= 0) { set(e, 'throw', 0.3); throwBottle(e); } break;
      case 'throw': if (e.modeT <= 0) after(e); break;
      case 'dodge': { e.x += -fx * GL.dodgeDist / GL.dodgeT * dt; e.x = Math.max(Ar.x0 + 16, Math.min(Ar.x1 - 16, e.x)); if (e.modeT <= 0) { F.cur = { k: 'riposte', id: ++F.act }; tell(e, 'riposteTell', GL.riposteTell); } break; }
      case 'riposteTell': if (e.modeT <= 0) { set(e, 'riposte', GL.cutT + 0.1); e.x += fx * 26; } break;
      case 'riposte': hit(e, front(GL.cutReach + 16), GL.dmg.riposte, 'HIS RIPOSTE', { key: key + 'r' }); if (e.modeT <= 0) { F.n.ripostes++; after(e); } break;
      case 'burning': if (e.open <= 0) { F.gapNext = 0.2; set(e, 'recover', 0.4); F.openTaken = 0; } break;
      default: if (e.modeT <= -1) after(e);
    }
  };
  function throwBottle(e) { const P = nearest(e), fl = F.A.floor, sx = e.x + (e.face || 1) * 8, sy = fl - 34, T = GL.fly, tx = F.cur && F.cur.x != null ? F.cur.x : P.x;
    F.bottles.push({ id: ++F.idN, x: sx, y: sy, vx: (tx - sx) / T, vy: (fl - 6 - sy) / T - 0.5 * 520 * T, g: 520, back: false, key: 'glb' + F.idN }); F.n.bottles++; ctx.sfx.throwWhoosh && ctx.sfx.throwWhoosh(); }
  function stepBottles(e, dt) { const fl = F.A.floor, hb = ctx.attackBox();
    for (const b of F.bottles) {
      if (!b.back && hb && ctx.overlap(hb, { l: b.x - GL.reflectR, r: b.x + GL.reflectR, t: b.y - GL.reflectR, b: b.y + GL.reflectR })) { b.back = true; b.g = 0; F.n.reflects++; ctx.sfx.parry && ctx.sfx.parry(); ctx.sparks(b.x, b.y, ctx.hero().face || 1, 6);
        if (!F.saidBack) { F.saidBack = 1; ctx.number(b.x, b.y - 20, 'STRUCK BACK: IT FLIES HOME', '#8fd160'); } }
      if (b.back) { const dx = e.x - b.x, dy = (e.y - 18) - b.y, d = Math.hypot(dx, dy) || 1; b.vx = dx / d * GL.back; b.vy = dy / d * GL.back; b.x += b.vx * dt; b.y += b.vy * dt;
        if (d < 14) { b.dead = true; light(e, b); } continue; }
      b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      hit(e, [b.x - 5, b.x + 5, b.y - 5, b.y + 5], GL.dmg.bottle, 'HIS BOTTLE', { key: b.key, blockable: true });
      if (b.y >= fl - 2) { b.dead = true; F.fires.push({ x: b.x, t: GL.fireT, tick: 0 }); ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(b.x, fl - 6, 12, ['#ff9a3c', '#ffd36b', '#3a2a12'], 70, 0.6); } }
    F.bottles = F.bottles.filter(b => !b.dead); }
  function stepFires(e, dt) { const fl = F.A.floor; for (const f of F.fires) { f.t -= dt; f.tick -= dt; if (f.tick <= 0) { f.tick = GL.fireTick; hit(e, [f.x - GL.fireR, f.x + GL.fireR, fl - 10, fl + 2], GL.dmg.fire, 'HIS FIRE', { key: 'glf' + R(f.x) + R(f.t * 2), noKnock: true }); } }
    F.fires = F.fires.filter(f => f.t > 0); }
  /* HE BURNS: his own bottle, struck home. Open, x GL.openMul, and no more than a third of him in one burning */
  function light(e, b) { if (!e.alive) return; e.open = GL.openT; F.openTaken = 0; F.n.opens++; set(e, 'burning', GL.openT + 0.05); F.bottles = F.bottles.filter(q => q.back); ctx.sfx.hiss ? ctx.sfx.hiss() : ctx.sfx.crack && ctx.sfx.crack();
    ctx.burst(e.x, e.y - 18, 22, ['#ff9a3c', '#ffd36b', '#d84a14'], 90, 0.8); ctx.shake(3); ctx.number(e.x, e.y - 56, 'HE IS ALIGHT: CUT HIM', '#8fd160'); }
  /* A BLOW ON HIM (minis keep their damage): while he burns x GL.openMul up to a third of him; otherwise whole - unless he DODGES it (now and then,
     from the front, between his blows: and the riposte comes) */
  H.take = (e, dmg, fromX) => { if (!F) return dmg; const P = ctx.hero();
    if (glOpen(e)) { const cap = e.maxHp * GL.capK, d = Math.min(dmg * GL.openMul, Math.max(0, cap - F.openTaken)); if (d < dmg * GL.openMul) F.n.capped++; F.openTaken += d;
      if (F.openTaken >= cap - 0.01) { e.open = Math.min(e.open, 0.3); ctx.number(e.x, e.y - 56, 'THE FLAMES GO OUT', '#9aa39a'); } return d; }
    if (e.mode === 'dodge') { e.chipHit = ctx.time(); return 0; }   /* slipping it: a blade that follows him into his dodge meets air */
    const frontal = (e.face || 1) * (P.x - e.x) > -4, free = e.mode === 'walk' || (e.mode === 'recover' && (F.recHits || 0) >= 2);   /* off balance he takes two clean cuts, then he has his feet again */
    if (e.mode === 'recover') F.recHits = (F.recHits || 0) + 1;
    /* TWO SWORDS: while he cuts (and tells his cuts) the other blade guards - a blow from the front is turned */
    if (frontal && PARRY.has(e.mode)) { e.chipHit = ctx.time(); F.n.parried = (F.n.parried || 0) + 1; ctx.sparks(e.x + (e.face || 1) * 8, e.y - 18, e.face || 1, 4); ctx.sfx.clank && ctx.sfx.clank();
      if (!F.saidParry) { F.saidParry = 1; ctx.number(e.x, e.y - 50, 'HIS OTHER BLADE GUARDS: NOT INTO HIS CUTS', '#9aa39a'); } return 0; }
    if (frontal && free && F.dodgeCd <= 0 && Math.random() < GL.dodge) { F.dodgeCd = GL.dodgeCd; F.n.dodges++; set(e, 'dodge', GL.dodgeT); ctx.dust(e.x, e.y, 6); ctx.sfx.dodge && ctx.sfx.dodge();
      if (!F.saidDodge) { F.saidDodge = 1; ctx.number(e.x, e.y - 50, 'HE SLIPS THE BLADE: HIS RIPOSTE COMES', '#ffd36b'); } e.glancedAt = ctx.time(); return 0; }
    return dmg; };
  H.frame = e => { const m = e.mode, w = Math.floor(ctx.time() * 8) % 2; return { stand: 0, wake: 0, walk: 1 + w, recover: 15, cutTell: 3, cut: 4, cut2Tell: 5, cut2: 6, crossTell: 5, cross: 6, whirlTell: 7, whirl: 8 + w,
    throwTell: 10, throw: 11, dodge: 12, riposteTell: 3, riposte: 4, burning: 13 + w }[m] ?? 0; };
  H.barName = e => 'THE GANG LEADER' + (glOpen(e) ? '  ALIGHT' : '');
  H.end = e => { if (F) { F.bottles = []; F.fires = []; } };
  H.read = () => F && { n: { ...F.n }, ph: F.ph, cycle: F.cycle, hurt: { ...F.hurt }, bottles: F.bottles.length, fires: F.fires.length };
  /* DRAWING: his bottles (lit), the burning floor, his flames and his clock */
  H.drawOver = (g, cx, cy, time) => { if (!F) return; const fl = F.A.floor, e = ctx.enemies().find(q => q.t === 'gangleader' && q.alive);
    for (const f of F.fires) { const x = R(f.x - cx), y = R(fl - cy); for (let k = -GL.fireR; k < GL.fireR; k += 4) { const h = 5 + 4 * Math.abs(Math.sin(time * 11 + k + f.x)); g.fillStyle = (k / 4) % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(x + k, y - h, 3, h); } g.fillStyle = '#3a2a12'; g.fillRect(x - GL.fireR, y - 1, GL.fireR * 2, 1); }
    for (const b of F.bottles) { const x = R(b.x - cx), y = R(b.y - cy); g.fillStyle = '#5a7a4a'; g.fillRect(x - 2, y - 3, 5, 6); g.fillStyle = '#c9b27c'; g.fillRect(x - 1, y - 5, 2, 2); g.fillStyle = Math.floor(time * 20) % 2 ? '#ffd36b' : '#ff6a2a'; g.fillRect(x - 1, y - 8, 3, 3);
      if (b.back) { g.fillStyle = '#e8f4f8'; g.fillRect(x - Math.sign(b.vx) * 6, y, 4, 1); } else if (!F.saidReflectHint) { ctx.text('STRIKE IT', x, y - 14, '#ffd36b', 'center', 6); } }
    if (F.bottles.length && F.n.reflects) F.saidReflectHint = true;
    if (e && glOpen(e)) { const x = R(e.x - cx), y = R(e.y - cy); for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#ff9a3c' : '#ffd36b'; g.fillRect(x - 10 + k * 4, y - 26 - R(6 * Math.abs(Math.sin(time * 10 + k))), 3, 9); }
      const k = Math.max(0, e.open / GL.openT); g.fillStyle = '#1b1626'; g.fillRect(x - 16, y - 50, 32, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 16, y - 50, R(32 * k), 3); }
  };
  return H;
}
